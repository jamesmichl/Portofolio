'use strict';
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
let handler, calls, oldFetch, previous;
const valid = () => ({ name: 'QA Visitor', email: 'visitor@example.com', message: 'A test message.\nSecond line.', website: '', requestId: randomUUID() });
function request(body = valid(), overrides = {}) {
    return { method: 'POST', headers: { host: 'portfolio.example', origin: 'https://portfolio.example', 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' }, body, ...overrides };
}
async function run(req = request()) {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(value) { this.body = value; return this; } };
    await handler(req, res);
    return res;
}
beforeEach(() => {
    delete require.cache[require.resolve('../api/contact.js')];
    handler = require('../api/contact.js');
    previous = Object.fromEntries(['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'VERCEL'].map(k => [k, process.env[k]]));
    process.env.RESEND_API_KEY = 'unit-test-only-not-a-credential';
    process.env.CONTACT_FROM_EMAIL = 'sender@example.com';
    delete process.env.VERCEL;
    oldFetch = global.fetch; calls = [];
    global.fetch = async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ id: 'mock-email-id' }) }; };
});
afterEach(() => {
    global.fetch = oldFetch;
    for (const [key, value] of Object.entries(previous)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
});
test('sends fixed recipient, exact subject, plain text and Reply-To; hides credentials from response', async () => {
    const body = { ...valid(), to: 'attacker@example.com', name: '  QA Visitor  ' };
    const res = await run(request(body)); assert.equal(res.code, 200); assert.deepEqual(res.body, { ok: true });
    const call = calls[0], payload = JSON.parse(call.options.body);
    assert.equal(call.url, 'https://api.resend.com/emails');
    assert.deepEqual(payload.to, ['james.lionel@binus.ac.id']); assert.equal(payload.reply_to, body.email);
    assert.equal(payload.subject, 'Portfolio Contact — QA Visitor');
    assert.equal(payload.text, 'Sender name: QA Visitor\nSender email: visitor@example.com\n\nMessage:\nA test message.\nSecond line.');
    assert.equal(payload.html, undefined); assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.ok(!JSON.stringify(res).includes(process.env.RESEND_API_KEY));
});
test('reuses idempotency key for unchanged retry, separates changed payloads', async () => {
    const body = valid(); await run(request(body)); await run(request(body)); await run(request({ ...body, message: 'Different' }));
    assert.equal(calls[0].options.headers['Idempotency-Key'], calls[1].options.headers['Idempotency-Key']);
    assert.notEqual(calls[1].options.headers['Idempotency-Key'], calls[2].options.headers['Idempotency-Key']);
});
test('rejects missing, whitespace, wrong-type, invalid email, header injection and overlong fields', async () => {
    const cases = [{ name: '' }, { name: '  ' }, { email: 'bad' }, { email: 'a@b' }, { email: 'a,b@example.com' }, { email: 'a@-bad.com' }, { email: 'a@bad..com' }, { email: '.a@example.com' }, { email: 'a..b@example.com' }, { message: ' ' }, { name: [] }, { email: null }, { message: {} }, { name: 'x\r\nBcc: victim@example.com' }, { email: 'x@example.com\nBcc:x@y.com' }, { name: 'a'.repeat(101) }, { email: 'a'.repeat(250) + '@x.com' }, { message: 'a'.repeat(5001) }, { message: 'x\0' }, { requestId: 'bad' }];
    for (const override of cases) assert.equal((await run(request({ ...valid(), ...override }))).code, 400, JSON.stringify(override).slice(0,100));
    assert.equal(calls.length, 0);
});
test('rejects honeypot, null/array/invalid JSON and oversized body', async () => {
    for (const body of [null, [], '{', { ...valid(), website: 'spam' }]) assert.equal((await run(request(body))).code, 400);
    assert.equal((await run(request({ ...valid(), unused: 'x'.repeat(32768) }))).code, 413);
    const req = request(); Object.defineProperty(req, 'body', { get() { throw Error('malformed'); } }); assert.equal((await run(req)).code, 400);
    assert.equal(calls.length, 0);
});
test('requires POST, JSON and same-origin; forbids missing or foreign origin', async () => {
    const method = await run(request(valid(), { method: 'GET' })); assert.equal(method.code, 405); assert.equal(method.headers.Allow, 'POST');
    for (const origin of [undefined, 'null', 'https://evil.example', 'https://portfolio.example.evil.com']) { const req = request(); req.headers.origin = origin; assert.equal((await run(req)).code, 403); }
    const type = request(); type.headers['content-type'] = 'text/plain'; assert.equal((await run(type)).code, 415);
    const big = request(); big.headers['content-length'] = '40000'; assert.equal((await run(big)).code, 413);
    assert.equal(calls.length, 0);
});
test('allows local origin with port and JSON charset', async () => {
    const req = request(); req.headers.host = 'localhost:3000'; req.headers.origin = 'http://localhost:3000'; req.headers['content-type'] = 'application/json; charset=utf-8';
    assert.equal((await run(req)).code, 200);
});
test('missing or invalid server configuration fails honestly without fetching', async () => {
    delete process.env.RESEND_API_KEY; assert.equal((await run()).code, 503);
    process.env.RESEND_API_KEY = 'unit-test-only'; delete process.env.CONTACT_FROM_EMAIL; assert.equal((await run()).code, 503);
    process.env.CONTACT_FROM_EMAIL = 'bad\naddress'; assert.equal((await run()).code, 503); assert.equal(calls.length, 0);
});
test('provider rejection, malformed response and network failure never become success', async () => {
    for (const response of [{ ok: false, json: async () => ({ message: 'private provider error' }) }, { ok: true, json: async () => ({}) }, { ok: true, json: async () => { throw Error('invalid JSON'); } }]) {
        global.fetch = async () => response; const res = await run(); assert.equal(res.code, 502); assert.equal(res.body.ok, false); assert.ok(!JSON.stringify(res).includes('private provider'));
    }
    global.fetch = async () => { throw Error('network'); }; assert.equal((await run()).code, 502);
});
test('provider timeout is aborted and returned as failure', async () => {
    const original = global.setTimeout;
    global.setTimeout = (fn, ms) => original(fn, ms === 10000 ? 5 : ms);
    global.fetch = async (url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('aborted')), { once: true }));
    try { assert.equal((await run()).code, 502); } finally { global.setTimeout = original; }
});
test('limits repeated validated requests to five per instance/window', async () => {
    for (let i = 0; i < 5; i++) assert.equal((await run()).code, 200);
    const limited = await run(); assert.equal(limited.code, 429); assert.equal(limited.headers['Retry-After'], '600'); assert.equal(calls.length, 5);
});
