// Reparación selectiva de la demo. Sin --apply sólo inspecciona; no ejecuta el SQL semilla.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : undefined;
const container = 'liga1-loadbalancer-demo-mysql-1';
const sourcePath = 'Servicio01/script_sistema_bd.sql';
const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const columns = { equipos: ['nombre', 'ciudad', 'estadio'], partidos: ['equipo_local', 'equipo_visitante'] };
function sql(query) {
    return execFileSync('docker', ['exec', '-i', container, 'sh', '-c',
        'MYSQL_PWD="$MYSQL_PASSWORD" exec mysql --protocol=TCP --host=127.0.0.1 --user="$MYSQL_USER" --database="$MYSQL_DATABASE" --default-character-set=utf8mb4 --batch --raw --skip-column-names'],
        { input: query, encoding: 'utf8', timeout: 15000 }).trim();
}
function snapshot() {
    const tables = {};
    for (const table of Object.keys(columns)) {
        const names = table === 'equipos' ? ['id', ...columns.equipos] :
            ['id', ...columns.partidos, 'goles_local', 'goles_visitante', 'fecha', 'jornada'];
        const fields = names.map(n => `'${n}',\`${n}\``).join(',');
        tables[table] = sql(`SELECT JSON_OBJECT(${fields}) FROM \`${table}\` ORDER BY id;`).split('\n').filter(Boolean).map(JSON.parse);
    }
    return tables;
}
function sourceValues() {
    const allowed = {};
    for (const table of Object.keys(columns)) {
        const insert = new RegExp('INSERT IGNORE INTO `' + table + '` \\(([^)]+)\\) VALUES([\\s\\S]*?);').exec(source);
        assert.ok(insert, `Falta INSERT original de ${table}`);
        const names = [...insert[1].matchAll(/`([^`]+)`/g)].map(m => m[1]);
        allowed[table] = Object.fromEntries(columns[table].map(c => [c, new Map()]));
        const values = insert[2].replace(/--[^\r\n]*/g, '');
        // Los paréntesis dentro de literales SQL no separan tuplas.
        for (const tuple of values.matchAll(/\((?:'(?:''|[^'])*'|[^'()])*\)/g)) {
            const sourceLine = source.slice(0, source.indexOf(tuple[0], insert.index)).split(/\r?\n/).length;
            const tokens = [...tuple[0].matchAll(/'((?:''|[^'])*)'|(-?\d+)/g)].map(m => m[1] === undefined ? Number(m[2]) : m[1].replace(/''/g, "'"));
            assert.equal(tokens.length, names.length, `Tupla no reconocida en ${table}`);
            names.forEach((name, index) => {
                if (allowed[table][name]) allowed[table][name].set(tokens[index], sourceLine);
            });
        }
    }
    return allowed;
}
const hex = value => Buffer.from(String(value), 'utf8').toString('hex');
function condition(table, rows) {
    return [`(SELECT COUNT(*) FROM \`${table}\`)=${rows.length}`, ...rows.map(row => {
        const checks = Object.entries(row).filter(([c]) => c !== 'id').map(([c, value]) => value === null ?
            `\`${c}\` IS NULL` : `BINARY \`${c}\`=UNHEX('${hex(value)}')`);
        return `EXISTS(SELECT 1 FROM \`${table}\` WHERE id=${row.id} AND ${checks.join(' AND ')})`;
    })].join(' AND ');
}
async function main() {
    assert.equal(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), 'taller-loadbalancer');
    const inspection = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8', timeout: 10000 }))[0];
    assert.equal(inspection.Config.Labels['com.docker.compose.project'], 'liga1-loadbalancer-demo');
    assert.ok(inspection.Mounts.some(m => m.Name === 'liga1-loadbalancer-demo_mysql-data' && m.Destination === '/var/lib/mysql'));
    assert.equal(sql("SELECT seed_version FROM demo_initialization WHERE id=1;"), 'liga1-v1');
    assert.equal(sql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name IN ('equipos','partidos') AND engine='InnoDB';"), '2');
    assert.equal(sql("SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema=DATABASE() AND event_object_table IN ('equipos','partidos');"), '0');
    const before = snapshot();
    assert.equal(before.equipos.length, 16, 'Se requieren 16 equipos; no se ajustan conteos automáticamente');
    assert.equal(before.partidos.length, 15, 'Se requieren 15 partidos; no se ajustan conteos automáticamente');
    const allowed = sourceValues();
    const changes = [];
    for (const [table, rows] of Object.entries(before)) for (const row of rows) for (const column of columns[table]) {
        const actual = row[column];
        if (actual === null || allowed[table][column].has(actual)) continue;
        const candidates = [...allowed[table][column]].filter(([original]) =>
            new TextDecoder('windows-1252').decode(Buffer.from(original, 'utf8')) === actual);
        if (!candidates.length) {
            assert.ok(!/[ÃÂ]/.test(actual), `Texto dañado sin correspondencia segura: ${table}/${row.id}/${column}`);
            continue; // Texto ajeno al seed: se conserva.
        }
        assert.equal(candidates.length, 1, 'Correspondencia ambigua; no se modifica');
        changes.push({ table, id: row.id, column, before: actual, beforeUtf8Hex: hex(actual),
            after: candidates[0][0], afterUtf8Hex: hex(candidates[0][0]), sourceLine: candidates[0][1] });
    }
    const backup = { createdAt: new Date().toISOString(), containerId: inspection.Id,
        volume: 'liga1-loadbalancer-demo_mysql-data', source: sourcePath, sourceSha256: sha(source),
        changes, before, beforeSha256: sha(JSON.stringify(before)) };
    if (!args.includes('--apply')) { console.log(JSON.stringify({ mode: 'read-only', affectedFields: changes.length, changes }, null, 2)); return; }
    assert.ok(option('--backup') && option('--report'), 'Indicar --backup y --report; nunca se sobrescribe un respaldo');
    assert.ok(changes.length, 'No hay campos que reparar; no se escribe ni sobrescribe un respaldo');
    const expected = structuredClone(before);
    for (const change of changes) expected[change.table].find(row => row.id === change.id)[change.column] = change.after;
    // Respaldo duradero, exclusivo y completo ANTES de cualquier UPDATE.
    const fd = fs.openSync(option('--backup'), 'wx');
    try { fs.writeFileSync(fd, JSON.stringify(backup, null, 2) + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    const result = { startedAt: new Date().toISOString(), backup: option('--backup'), sourceSha256: backup.sourceSha256,
        affectedFields: changes.length, changes, committed: false, countsBefore: { equipos: 16, partidos: 15 } };
    try {
        const guards = data => Object.entries(data).map(([table, rows]) => condition(table, rows)).join(' AND ');
        const statements = ['CREATE TEMPORARY TABLE audit_encoding_guard(ok TINYINT NOT NULL CHECK(ok=1));', 'START TRANSACTION;',
            "SELECT 'LOCK',id FROM equipos ORDER BY id FOR UPDATE;", "SELECT 'LOCK',id FROM partidos ORDER BY id FOR UPDATE;",
            `INSERT INTO audit_encoding_guard VALUES(IF(${guards(before)},1,0));`];
        for (const c of changes) statements.push(`UPDATE \`${c.table}\` SET \`${c.column}\`=CONVERT(UNHEX('${c.afterUtf8Hex}') USING utf8mb4) WHERE id=${c.id} AND BINARY \`${c.column}\`=UNHEX('${c.beforeUtf8Hex}');`, "SELECT 'UPDATED',ROW_COUNT();");
        statements.push(`INSERT INTO audit_encoding_guard VALUES(IF(${guards(expected)},1,0));`, 'COMMIT;', "SELECT 'COMMITTED';");
        const output = sql(statements.join('\n'));
        result.committed = output.split('\n').includes('COMMITTED');
        assert.equal(result.committed, true);
        result.updatedRowCounts = output.split('\n').filter(line => line.startsWith('UPDATED\t')).map(line => Number(line.split('\t')[1]));
        assert.deepEqual(result.updatedRowCounts, changes.map(() => 1));
        const after = snapshot();
        assert.deepEqual(after, expected, 'Cambió un ID o un campo fuera del plan');
        result.exactPlannedStateVerified = true;
        result.countsAfter = { equipos: after.equipos.length, partidos: after.partidos.length };
        result.afterSha256 = sha(JSON.stringify(after));
        const ports = Object.fromEntries(fs.readFileSync(path.join(root, 'demo-loadbalancer/.env'), 'utf8').split(/\r?\n/)
            .filter(s => /^(GATEWAY_PORT|REPLICA_A_PORT|REPLICA_B_PORT)=\d+$/.test(s)).map(s => s.split('=')));
        result.api = [];
        for (const [port, route, rows, kind, identity] of [[ports.GATEWAY_PORT || 8080, '/api/equipos', after.equipos, 'equipos', null],
            [ports.REPLICA_A_PORT || 8761, '/api/equipos', after.equipos, 'equipos', 'Servicio01-A'],
            [ports.REPLICA_B_PORT || 8764, '/api/equipos', after.equipos, 'equipos', 'Servicio01-B'],
            [ports.GATEWAY_PORT || 8080, '/api/partidos', after.partidos, 'partidos', null],
            [ports.GATEWAY_PORT || 8080, '/api/partidos-resumen', after.partidos, 'partidos', null]]) {
            const url = `http://localhost:${port}${route}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
            assert.equal(response.status, 200);
            const data = await response.json();
            assert.equal(data.length, rows.length);
            if (identity) assert.equal(response.headers.get('X-Instancia'), identity);
            for (const change of changes.filter(c => c.table === kind)) {
                const apiColumn = { equipo_local: 'equipoLocal', equipo_visitante: 'equipoVisitante' }[change.column] || change.column;
                assert.equal(data.find(row => row.id === change.id)[apiColumn], change.after);
            }
            result.api.push({ url, status: response.status, count: data.length, instance: response.headers.get('X-Instancia'), affectedTextsVerified: true });
        }
        result.exitCode = 0;
    } catch (error) { result.exitCode = 1; result.error = error.message; throw error; }
    finally { result.completedAt = new Date().toISOString(); fs.writeFileSync(option('--report'), JSON.stringify(result, null, 2) + '\n'); }
    console.log(JSON.stringify(result, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
