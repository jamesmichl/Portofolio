'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const source = path.resolve(__dirname, '..');
function fixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-web3forms-'));
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.copyFileSync(path.join(source, 'scripts/build.cjs'), path.join(root, 'scripts/build.cjs'));
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
        if (entry.isFile() && /\.(html|js|css|png)$/.test(entry.name)) fs.copyFileSync(path.join(source, entry.name), path.join(root, entry.name));
    }
    fs.mkdirSync(path.join(root, 'assets'));
    const env = { ...process.env }; delete env.WEB3FORMS_ACCESS_KEY;
    return { root, env, build() { return execFileSync(process.execPath, [path.join(root, 'scripts/build.cjs')], { env, encoding: 'utf8', stdio: 'pipe' }); }, html() { return fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8'); }, cleanup() { fs.rmSync(root, { recursive: true, force: true }); } };
}
test('build injects only public Web3Forms key, escapes markup, and keeps source/env files out of output', () => {
    const f = fixture(); try {
        const original = fs.readFileSync(path.join(f.root, 'index.html'), 'utf8');
        f.env.WEB3FORMS_ACCESS_KEY = 'test-only-<&"\'>$&'; f.env.UNRELATED_SECRET = 'must-not-be-published';
        fs.writeFileSync(path.join(f.root, '.env.local'), 'UNRELATED_LOCAL_VALUE=must-not-be-published\n');
        f.build();
        assert.match(f.html(), /value="test-only-&lt;&amp;&quot;&#39;&gt;\$&amp;"/);
        assert.ok(!f.html().includes('must-not-be-published'));
        assert.equal(fs.readFileSync(path.join(f.root, 'index.html'), 'utf8'), original);
        for (const name of ['.env.local','scripts','tests','api','README.md']) assert.equal(fs.existsSync(path.join(f.root, 'dist', name)), false);
    } finally { f.cleanup(); }
});
test('local env loads for development; Vercel/process environment takes precedence', () => {
    const f = fixture(); try {
        fs.writeFileSync(path.join(f.root, '.env.local'), 'WEB3FORMS_ACCESS_KEY=local-test-only\n'); f.build(); assert.match(f.html(), /value="local-test-only"/);
        f.env.WEB3FORMS_ACCESS_KEY = 'deployment-test-only'; f.build(); assert.match(f.html(), /value="deployment-test-only"/); assert.ok(!f.html().includes('local-test-only'));
    } finally { f.cleanup(); }
});
test('unconfigured visual build stays blank and existing static build settings are preserved', () => {
    const f = fixture(); try { f.build(); assert.match(f.html(), /id="contact-access-key" name="access_key" value=""/); } finally { f.cleanup(); }
    const config = JSON.parse(fs.readFileSync(path.join(source, 'vercel.json')));
    assert.equal(config.buildCommand, 'npm run build'); assert.equal(config.outputDirectory, 'dist'); assert.equal(config.framework, null); assert.equal(config.functions, undefined);
    assert.equal(fs.existsSync(path.join(source, 'api/contact.js')), false);
});
