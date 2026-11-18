// Validación local sin HTTP. Los casos negativos son simulados, no evidencia de la demo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const collection = JSON.parse(fs.readFileSync(path.join(__dirname, 'Liga1-LoadBalancer.postman_collection.json')));
const environment = JSON.parse(fs.readFileSync(path.join(__dirname, 'Liga1-Local.postman_environment.json')));
const env = Object.fromEntries(environment.values.filter(v => v.enabled).map(v => [v.key, v.value]));
const defaults = Object.fromEntries(collection.variable.map(v => [v.key, v.value]));
assert.deepEqual(defaults, env, 'Los valores predeterminados de colección coinciden con el entorno entregado');
assert.equal(environment._postman_variable_scope, 'environment');
assert.deepEqual(Object.keys(env).sort(), ['baseUrl', 'expectedInstanceA', 'expectedInstanceB', 'runMode'].sort());
assert.equal(new URL(env.baseUrl).protocol, 'http:');
assert.notEqual(env.expectedInstanceA, env.expectedInstanceB);
let requests = 0;
for (const folder of collection.item) {
    for (const item of folder.item) {
        requests++;
        assert.equal(item.request.method, 'GET');
        assert.equal(item.request.url, '{{baseUrl}}/api/equipos');
        for (const event of item.event) {
            const script = event.script.exec.join('\n');
            assert.ok(!script.includes('pm.environment.get('), 'Resolver todas las lecturas mediante pm.variables.get');
            new vm.Script(script);
        }
    }
}
assert.equal(requests, 5);
assert.equal(collection.item[1].item.length, 1);
assert.equal(collection.item[2].item.length, 3);
const series = collection.item[1].item[0];
const pre = series.event.find(e => e.listen === 'prerequest').script.exec.join('\n');
const post = series.event.find(e => e.listen === 'test').script.exec.join('\n');

// Adaptador mínimo de las aserciones Chai usadas por el script real de balanceo.
function expect(value) {
    let negative = false;
    const chain = {
        get to() { return this; }, get be() { return this; },
        get at() { return this; }, get and() { return this; },
        get not() { negative = !negative; return this; },
        equal(other) { negative ? assert.notStrictEqual(value, other) : assert.strictEqual(value, other); return this; },
        least(other) { assert.ok(value >= other); return this; },
        above(other) { assert.ok(value > other); return this; },
        a(type) { assert.equal(typeof value, type); return this; },
        get empty() { assert.equal(value.length === 0, !negative); return this; }
    };
    return chain;
}
function run({ total = 12, mutate = () => {}, local = new Map(), onlyA = false, environmentValues = env } = {}) {
    const tests = [];
    const logs = [];
    // Precedencia real relevante: local al run > entorno activo > colección.
    const resolve = key => local.has(key) ? local.get(key) :
        Object.hasOwn(environmentValues, key) ? environmentValues[key] : defaults[key];
    for (let i = 0; i < total; i++) {
        let record = {
            status: 200, identity: onlyA || i < total - 1 ? resolve('expectedInstanceA') : resolve('expectedInstanceB'),
            body: JSON.stringify([{ id: 1, nombre: 'Demo', ciudad: null, estadio: 'Estadio' }])
        };
        mutate(record, i, total);
        const pm = {
            info: { iteration: i, iterationCount: total },
            environment: { get: key => environmentValues[key] },
            variables: { get: resolve, set: (key, value) => local.set(key, value) },
            execution: { skipRequest() { throw new Error('No debe omitirse la serie activa'); } },
            response: {
                code: record.status,
                headers: { get: () => record.identity },
                json: () => JSON.parse(record.body)
            },
            expect,
            test(name, callback) {
                try { callback(); tests.push({ name, failed: false }); }
                catch { tests.push({ name, failed: true }); }
            }
        };
        const context = { pm, data: {}, console: { log: msg => logs.push(msg), warn() {} } };
        vm.runInNewContext(pre, context, { timeout: 1000 });
        vm.runInNewContext(post, context, { timeout: 1000 });
    }
    return { state: JSON.parse(local.get('__liga1_balanceo')), tests, logs, local };
}
const results = [];
const valid = run();
assert.equal(valid.state.received, 12);
assert.equal(valid.state.counts[env.expectedInstanceA], 11); // Reparto desigual permitido.
assert.equal(valid.tests.filter(t => t.failed).length, 0);
results.push({ scenario: 'Reparto 11/1 válido', passed: true });
const repeated = run({ local: valid.local });
assert.equal(repeated.state.received, 12);
assert.equal(repeated.state.records.length, 12);
assert.equal(repeated.tests.filter(t => t.failed).length, 0);
results.push({ scenario: 'Segundo run reinicia los conteos', passed: true });
const withoutEnvironment = run({ environmentValues: {} });
assert.equal(withoutEnvironment.tests.filter(t => t.failed).length, 0);
assert.equal(withoutEnvironment.state.received, 12);
assert.equal(withoutEnvironment.state.counts[defaults.expectedInstanceB], 1);
results.push({ scenario: 'Sin entorno usa valores de colección', passed: true });
const environmentOverride = run({ environmentValues: { ...env, expectedInstanceA: 'Override-A', expectedInstanceB: 'Override-B' } });
assert.equal(environmentOverride.tests.filter(t => t.failed).length, 0);
assert.deepEqual(environmentOverride.state.expected, ['Override-A', 'Override-B']);
assert.equal(environmentOverride.state.counts['Override-A'], 11);
results.push({ scenario: 'Entorno activo prevalece sobre colección', passed: true });
for (const [name, alter] of [
    ['JSON inválido final', r => { r.body = '{'; }],
    ['Cabecera ausente final', r => { r.identity = ''; }],
    ['Identidad inesperada final', r => { r.identity = 'Servicio01-C'; }],
    ['HTTP 500 final', r => { r.status = 500; }],
    ['HTTP 429 final', r => { r.status = 429; }],
    ['Tipo de id incorrecto final', r => { r.body = '[{"id":"1","nombre":"Demo","ciudad":null,"estadio":null}]'; }],
    ['Arreglo vacío final', r => { r.body = '[]'; }],
    ['Campo ausente final', r => { r.body = '[{"id":1,"nombre":"Demo","ciudad":null}]'; }]
]) {
    const result = run({ mutate(r, i, total) { if (i === total - 1) alter(r); } });
    assert.equal(result.state.received, 12);
    assert.equal(result.state.records.length, 12);
    assert.equal(result.state.failed, 1);
    assert.ok(result.logs.some(log => log.startsWith('RESUMEN_BALANCEO ')));
    assert.ok(result.tests.some(t => t.name === 'Cero respuestas inválidas en el run' && t.failed));
    if (name.includes('429')) assert.equal(result.state.tooManyRequests, 1);
    results.push({ scenario: name, passed: true, expectedRejection: true });
}
const earlyError = run({ mutate(r, i) { if (i === 3) r.body = '{'; } });
assert.equal(earlyError.state.failed, 1);
assert.ok(earlyError.tests.some(t => t.name === 'Cero respuestas inválidas en el run' && t.failed));
results.push({ scenario: 'Error anterior no desaparece con un último éxito', passed: true });
const oneReplica = run({ onlyA: true });
assert.ok(oneReplica.tests.some(t => t.name.startsWith('Ambas réplicas observadas:') && t.failed));
results.push({ scenario: 'Una sola réplica rechazada', passed: true });
const shortRun = run({ total: 1 });
assert.ok(shortRun.tests.some(t => t.name === 'Runner configurado con al menos 12 iteraciones' && t.failed));
results.push({ scenario: 'Run de menos de 12 iteraciones rechazado', passed: true });
console.log(JSON.stringify({ kind: 'Validación estructural y simulada; sin HTTP', requests, scenarios: results }, null, 2));
