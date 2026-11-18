// Auditoría HTTP real contra la demo exclusiva. Node >= 20, sin paquetes externos.
// Ejecutar desde la raíz; --snapshot evita escrituras y permite comparar reinicios.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const demo = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
function option(key) { const i = args.indexOf(key); return i < 0 ? undefined : args[i + 1]; }
const output = option('--output');
const snapshotOnly = args.includes('--snapshot');
const settings = Object.fromEntries(fs.readFileSync(path.join(demo, '.env'), 'utf8').split(/\r?\n/)
    .filter(s => /^(GATEWAY_PORT|EUREKA_PORT|REPLICA_A_PORT|REPLICA_B_PORT)=\d+$/.test(s))
    .map(s => s.split('=')));
const base = `http://127.0.0.1:${settings.GATEWAY_PORT || 8080}`;
const expected = ['Servicio01-A', 'Servicio01-B'];
const prefix = 'AUDIT-' + randomUUID();
const owned = [];
const report = { startedAt: new Date().toISOString(), mode: snapshotOnly ? 'snapshot-readonly' : 'CRUD-and-routes',
    baseUrl: base, marker: prefix, checks: [], requests: [], cleanup: [] };
function check(name, actual, wanted) {
    try { assert.deepEqual(actual, wanted); report.checks.push({ name, passed: true }); }
    catch (e) { report.checks.push({ name, passed: false, actual, expected: wanted }); throw e; }
}
function inspect(service) {
    return JSON.parse(execFileSync('docker', ['inspect', `liga1-loadbalancer-demo-${service}-1`],
        { encoding: 'utf8', timeout: 10000 }))[0];
}
async function http(route, status = 200, { method = 'GET', body, origin = base } = {}) {
    const response = await fetch(origin + route, { method,
        headers: { Accept: route.startsWith('/api/') ? 'application/json' : '*/*', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(5000) });
    const text = await response.text();
    const instance = response.headers.get('X-Instancia');
    report.requests.push({ method, url: origin + route, status: response.status, instance });
    check(`${method} ${route}: HTTP ${status}`, response.status, status);
    if (route.startsWith('/api/equipos')) check(`${method} ${route}: identidad esperada`, expected.includes(instance), true);
    let json; try { json = JSON.parse(text); } catch { /* HTML/204/errores de validación pueden no ser JSON. */ }
    return { json, text, instance };
}
function digest(items) {
    return createHash('sha256').update(JSON.stringify([...items].sort((a, b) => a.id - b.id))).digest('hex');
}
async function snapshot() {
    const teams = (await http('/api/equipos')).json;
    const matches = (await http('/api/partidos')).json;
    check('Equipos con datos', Array.isArray(teams) && teams.length > 0, true);
    check('Partidos con datos', Array.isArray(matches) && matches.length > 0, true);
    const occurrences = new Map();
    for (const { id, ...business } of matches) {
        const key = JSON.stringify(business); occurrences.set(key, (occurrences.get(key) || 0) + 1);
    }
    const sql = 'SELECT (SELECT COUNT(*) FROM equipos),(SELECT COUNT(*) FROM partidos),seed_version FROM demo_initialization WHERE id=1';
    const database = execFileSync('docker', ['exec', 'liga1-loadbalancer-demo-mysql-1', 'sh', '-c',
        'MYSQL_PWD="$MYSQL_PASSWORD" mysql --protocol=TCP -h127.0.0.1 -u"$MYSQL_USER" "$MYSQL_DATABASE" -Nse "$1"', 'audit-snapshot', sql],
        { encoding: 'utf8', timeout: 10000 }).trim().split('\t');
    check('Marca de inicialización SQL', database[2], 'liga1-v1');
    check('Conteos SQL coinciden con API', database.slice(0, 2).map(Number), [teams.length, matches.length]);
    return { teams: teams.length, matches: matches.length, teamsSha256: digest(teams), matchesSha256: digest(matches),
        duplicateMatchRows: [...occurrences.values()].reduce((n, count) => n + Math.max(0, count - 1), 0), seedVersion: database[2] };
}
async function removeOwned(resource) {
    if (resource.deleted) return;
    const current = await http(`/api/${resource.kind}/${resource.id}`);
    const name = resource.kind === 'equipos' ? current.json.nombre : current.json.equipoLocal;
    check(`Limpieza limitada al ID propio ${resource.kind}/${resource.id}`, name.startsWith(prefix), true);
    await http(`/api/${resource.kind}/${resource.id}`, 204, { method: 'DELETE' });
    resource.deleted = true;
    await http(`/api/${resource.kind}/${resource.id}`, 404);
    report.cleanup.push({ kind: resource.kind, id: resource.id, status: 'deleted-and-404' });
}
async function main() {
    for (const service of ['mysql', 'gateway', 'servicio01-a', 'servicio01-b', 'servicio02', 'servicio03']) {
        const container = inspect(service);
        check(`${service}: proyecto exclusivo`, container.Config.Labels['com.docker.compose.project'], 'liga1-loadbalancer-demo');
        check(`${service}: sano`, container.State.Health.Status, 'healthy');
        if (service === 'mysql') check('Volumen exclusivo de demo', container.Mounts.some(m =>
            m.Type === 'volume' && m.Name === 'liga1-loadbalancer-demo_mysql-data' && m.Destination === '/var/lib/mysql'), true);
        if (service === 'gateway') {
            check('Gateway en modo taller', container.Config.Env.includes('SPRING_PROFILES_ACTIVE=docker,taller-loadbalancer'), true);
            check('Puerto HTTP pertenece al Gateway de demo', container.NetworkSettings.Ports['8080/tcp'].some(p =>
                p.HostIp === '127.0.0.1' && p.HostPort === String(settings.GATEWAY_PORT || 8080)), true);
        }
    }
    report.before = await snapshot();
    if (snapshotOnly) {
        if (option('--compare')) check('Datos y duplicados idénticos tras detener/arrancar', report.before,
            JSON.parse(fs.readFileSync(option('--compare'), 'utf8')).before);
        return;
    }
    for (const side of ['Local', 'Visita']) {
        const body = { nombre: `${prefix}-${side}`, ciudad: 'Ciudad temporal', estadio: 'Estadio temporal' };
        const created = await http('/api/equipos', 201, { method: 'POST', body });
        if (Number.isInteger(created.json?.id)) owned.push({ kind: 'equipos', id: created.json.id, deleted: false });
        check(`Equipo ${side}: ID asignado`, Number.isInteger(created.json?.id) && created.json.id > 0, true);
        check(`Equipo ${side}: contrato guardado`, created.json, { ...body, id: created.json.id });
    }
    const local = owned[0];
    const updatedTeam = { nombre: `${prefix}-Local`, ciudad: 'Ciudad actualizada', estadio: 'Estadio actualizado' };
    await http(`/api/equipos/${local.id}`, 200, { method: 'PUT', body: updatedTeam });
    for (const [port, id] of [[settings.REPLICA_A_PORT || 8761, 'Servicio01-A'], [settings.REPLICA_B_PORT || 8764, 'Servicio01-B']]) {
        const read = await http(`/api/equipos/${local.id}`, 200, { origin: `http://127.0.0.1:${port}` });
        check(`${id}: actualización persistida compartida`, read.json, { id: local.id, ...updatedTeam });
        check(`${id}: cabecera directa coincide con Eureka`, read.instance, id);
    }
    const invalid = await http('/api/equipos', 400, { method: 'POST', body: { nombre: '   ' } });
    check('Validación original de nombre vacío', invalid.text.includes('nombre del equipo es obligatorio'), true);
    const match = { equipoLocal: `${prefix}-Local`, equipoVisitante: `${prefix}-Visita`, golesLocal: 2,
        golesVisitante: 1, fecha: '2026-11-17', jornada: 9999 };
    const createdMatch = await http('/api/partidos', 201, { method: 'POST', body: match });
    const matchId = createdMatch.json?.id;
    if (Number.isInteger(matchId)) owned.push({ kind: 'partidos', id: matchId, deleted: false });
    check('Partido: ID asignado', Number.isInteger(matchId) && matchId > 0, true);
    check('Partido: lectura por ID', (await http(`/api/partidos/${matchId}`)).json, { ...match, id: matchId });
    check('Partido: filtro de jornada', (await http('/api/partidos?jornada=9999')).json.some(p => p.id === matchId), true);
    check('Servicio03: resumen ve escritura de Servicio02', (await http('/api/partidos-resumen')).json.some(p => p.id === matchId), true);
    const table = (await http('/api/tabla-posiciones')).json;
    check('Tabla: victoria temporal suma tres puntos', table.find(t => t.equipo === match.equipoLocal)?.puntos, 3);
    check('Tabla: visitante temporal suma cero puntos', table.find(t => t.equipo === match.equipoVisitante)?.puntos, 0);
    const changed = { ...match, golesLocal: 2, golesVisitante: 2 };
    await http(`/api/partidos/${matchId}`, 200, { method: 'PUT', body: changed });
    check('Partido: actualización persistida', (await http(`/api/partidos/${matchId}`)).json, { ...changed, id: matchId });
    const updatedTable = (await http('/api/tabla-posiciones')).json;
    check('Tabla: empate temporal recalcula puntos', updatedTable.filter(t =>
        [match.equipoLocal, match.equipoVisitante].includes(t.equipo)).map(t => t.puntos), [1, 1]);
    for (const resource of [...owned].reverse()) await removeOwned(resource);
    check('Resumen sin partido temporal', (await http('/api/partidos-resumen')).json.some(p => p.id === matchId), false);
    check('Tabla sin equipos temporales', (await http('/api/tabla-posiciones')).json.some(t => t.equipo.startsWith(prefix)), false);
    for (const route of ['/', '/index.html', '/dashboard.html', '/equipos.html', '/registro.html', '/tabla.html', '/acerca.html', '/css/styles.css', '/js/common.js']) {
        const page = await http(route);
        check(`Contenido de ${route}`, page.text.length > 0, true);
    }
    report.after = await snapshot();
    check('Sólo cambiaron datos temporales, ahora eliminados', report.after, report.before);
}
(async () => {
    try { await main(); }
    catch (e) { report.error = e.message; process.exitCode = 1; }
    finally {
        for (const resource of [...owned].reverse()) {
            if (!resource.deleted) try { await removeOwned(resource); }
            catch (e) { report.cleanup.push({ ...resource, error: e.message }); process.exitCode = 1; }
        }
        report.completedAt = new Date().toISOString();
        report.exitCode = process.exitCode || 0;
        report.passed = report.checks.filter(c => c.passed).length;
        report.failed = report.checks.filter(c => !c.passed).length;
        if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
        console.log(JSON.stringify({ mode: report.mode, exitCode: report.exitCode, passed: report.passed,
            failed: report.failed, before: report.before, after: report.after, cleanup: report.cleanup, error: report.error }, null, 2));
    }
})();
