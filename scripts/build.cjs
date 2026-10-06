'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
// Explicit public allowlist: credentials, backend, tests and documentation never
// enter the static output. Vercel deploys api/contact.js separately as a function.
const publicFiles = [
    'index.html', 'project.html', 'style.css', 'project.css', 'content.js',
    'content-renderer.js', 'script.js', 'contact.js', 'project.js',
    'hero-motion.js', 'atmosphere.js', 'foto-james.png', 'assets'
];
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const file of publicFiles) fs.cpSync(path.join(root, file), path.join(output, file), { recursive: true });
console.log('Static build complete. Vercel deploys api/contact.js separately.');
