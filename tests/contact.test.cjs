'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../contact.js'), 'utf8');
const KEY = 'unit-test-only-not-a-real-access-key';
const ERROR = 'Something went wrong while sending your message. Please try again or contact me directly by email.';
function element(extra = {}) {
    return Object.assign({ attrs: {}, events: {}, textContent: '', value: '',
        addEventListener(type, fn) { this.events[type] = fn; },
        setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; },
        hasAttribute(k) { return k in this.attrs; }, focus() { this.focused = true; },
        replaceChildren() {}, append() {}
    }, extra);
}
function setup({ key = KEY, fetch, fastTimeout = false } = {}) {
    const calls = [], nodes = {};
    const fields = Object.fromEntries(['name', 'email', 'message'].map((name, i) => [name, element({ name, id: `contact-${name}`, maxLength: [100,254,5000][i], validity: { typeMismatch: false } })]));
    fields.access_key = element({ value: key }); fields.botcheck = element();
    const form = element({ dataset: {}, elements: { namedItem: k => fields[k] }, reset() { for (const key of ['name','email','message','botcheck']) fields[key].value = ''; } });
    nodes['contact-form'] = form; nodes['contact-submit'] = element({ disabled: true }); nodes['contact-status'] = element();
    for (const field of Object.values(fields)) if (field.id) nodes[`${field.id}-error`] = element();
    vm.runInNewContext(script, {
        document: { getElementById: id => nodes[id], createTextNode: t => t, createElement: () => element() },
        fetch: async (url, options) => { calls.push({ url, options }); return fetch ? fetch(url, options) : { ok: true, json: async () => ({ success: true }) }; },
        AbortController, setTimeout: (fn, ms) => setTimeout(fn, fastTimeout ? 5 : ms), clearTimeout
    });
    return { calls, fields, nodes, form,
        fill() { fields.name.value = ' QA Visitor '; fields.email.value = 'visitor@example.com'; fields.message.value = 'Test only — no email sent.'; },
        submit() { return form.events.submit({ preventDefault() {} }); }
    };
}
test('uses official browser endpoint, minimal payload, visitor email for Reply-To and clear subject', async () => {
    const h = setup(); h.fill(); assert.equal(h.form.dataset.state, 'idle'); await h.submit();
    const { url, options } = h.calls[0]; assert.equal(url, 'https://api.web3forms.com/submit');
    assert.equal(options.method, 'POST'); assert.equal(options.credentials, 'omit');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), { access_key: KEY, name: 'QA Visitor', email: 'visitor@example.com', message: 'Test only — no email sent.', subject: 'New Portfolio Contact — QA Visitor', botcheck: false });
    assert.equal(h.form.dataset.state, 'success');
    assert.equal(h.nodes['contact-status'].textContent, "Message sent successfully. I'll get back to you soon.");
    for (const key of ['name','email','message']) assert.equal(h.fields[key].value, '');
    assert.equal(h.fields.access_key.value, KEY);
});
test('required fields, malformed email, header injection and length limits prevent network calls', async () => {
    const empty = setup(); await empty.submit(); assert.equal(empty.calls.length, 0); assert.equal(empty.form.dataset.state, 'invalid'); assert.equal(empty.fields.name.focused, true);
    for (const [field, value] of [['name',' '],['message',' '],['email','invalid'],['email','x@x'],['email','x@-bad.com'],['email','a,b@x.com'],['name','a\nBcc: x@y.com'],['name','a'.repeat(101)],['email','a'.repeat(250)+'@x.com'],['message','x'.repeat(5001)]]) {
        const h = setup(); h.fill(); h.fields[field].value = value; await h.submit();
        assert.equal(h.form.dataset.state, 'invalid'); assert.equal(h.calls.length, 0); assert.equal(h.fields[field].hasAttribute('aria-invalid'), true);
    }
});
test('sending disables button/locks fields, announces status, and prevents duplicate in-flight requests', async () => {
    let resolve; const h = setup({ fetch: () => new Promise(r => { resolve = r; }) }); h.fill(); const first = h.submit();
    assert.equal(h.form.dataset.state, 'sending'); assert.equal(h.nodes['contact-submit'].disabled, true); assert.equal(h.form.attrs['aria-busy'], 'true');
    for (const key of ['name','email','message']) assert.equal(h.fields[key].readOnly, true);
    await h.submit(); await h.submit(); assert.equal(h.calls.length, 1);
    resolve({ ok: true, json: async () => ({ success: true }) }); await first;
    assert.equal(h.nodes['contact-submit'].disabled, false); assert.equal(h.form.hasAttribute('aria-busy'), false);
    for (const key of ['name','email','message']) assert.equal(h.fields[key].readOnly, false);
});
test('HTTP rejection, false/old success contract, malformed JSON and network errors preserve every entered field', async () => {
    for (const fetch of [
        async () => ({ ok: false, json: async () => ({ success: true }) }),
        async () => ({ ok: true, json: async () => ({ success: false }) }),
        async () => ({ ok: true, json: async () => ({ ok: true }) }),
        async () => ({ ok: true, json: async () => { throw Error('Invalid JSON'); } }),
        async () => { throw Error('network'); }
    ]) {
        const h = setup({ fetch }); h.fill(); await h.submit();
        assert.equal(h.form.dataset.state, 'error'); assert.equal(h.nodes['contact-status'].textContent, ERROR);
        assert.equal(h.fields.name.value, ' QA Visitor '); assert.equal(h.fields.email.value, 'visitor@example.com'); assert.equal(h.fields.message.value, 'Test only — no email sent.');
        assert.equal(h.nodes['contact-submit'].disabled, false);
    }
});
test('missing configuration or filled honeypot fails without contacting provider', async () => {
    for (const h of [setup({ key: '' }), setup()]) {
        h.fill(); if (h.fields.access_key.value) h.fields.botcheck.value = 'spam'; await h.submit();
        assert.equal(h.calls.length, 0); assert.equal(h.form.dataset.state, 'error'); assert.equal(h.nodes['contact-status'].textContent, ERROR); assert.ok(h.fields.message.value);
    }
});
test('timeout aborts, preserves input and permits a manual retry', async () => {
    const h = setup({ fastTimeout: true, fetch: (url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('timeout')), { once: true })) });
    h.fill(); await h.submit(); assert.equal(h.form.dataset.state, 'error'); assert.ok(h.fields.message.value); assert.equal(h.nodes['contact-submit'].disabled, false); assert.equal(h.calls.length, 1);
});
test('editing after failure resets feedback, and successful manual retry clears the form', async () => {
    let fail = true; const h = setup({ fetch: async () => ({ ok: !fail, json: async () => ({ success: !fail }) }) }); h.fill(); await h.submit();
    h.fields.message.value = 'Updated'; h.fields.message.events.input(); assert.equal(h.form.dataset.state, 'idle');
    fail = false; await h.submit(); assert.equal(h.form.dataset.state, 'success'); assert.equal(h.fields.message.value, ''); assert.equal(h.calls.length, 2);
});
