'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
for (const directory of ['', 'api', 'scripts', 'tests']) {
    for (const file of fs.readdirSync(path.join(root, directory))) {
        if (/\.(?:js|cjs)$/.test(file)) execFileSync(process.execPath, ['--check', path.join(root, directory, file)], { stdio: 'inherit' });
    }
}
console.log('JavaScript syntax checks passed.');
