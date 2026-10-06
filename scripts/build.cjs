'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
// Local configuration is ignored by Git. Vercel supplies the variable at build time.
const localEnv = path.join(root, '.env.local');
if (fs.existsSync(localEnv)) process.loadEnvFile(localEnv);
const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim() || '';
// Explicit public allowlist: environment files, tests and documentation never
// enter static output. Only the Web3Forms public form key is injected below.
const publicFiles = [
    'index.html', 'project.html', 'style.css', 'project.css', 'content.js',
    'content-renderer.js', 'script.js', 'contact.js', 'project.js',
    'hero-motion.js', 'atmosphere.js', 'foto-james.png', 'assets'
];
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const file of publicFiles) fs.cpSync(path.join(root, file), path.join(output, file), { recursive: true });
const indexPath = path.join(output, 'index.html');
const index = fs.readFileSync(indexPath, 'utf8');
const keyInput = '<input type="hidden" id="contact-access-key" name="access_key" value="">';
if (!index.includes(keyInput)) throw new Error('Missing Web3Forms access-key input in index.html');
const escapedKey = accessKey.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
fs.writeFileSync(indexPath, index.replace(keyInput, () => keyInput.replace('value=""', () => `value="${escapedKey}"`)));
if (!accessKey) console.warn('WEB3FORMS_ACCESS_KEY is unset. Configure it and rebuild before using Contact.');
console.log('Static build complete. Contact submits directly to Web3Forms.');
