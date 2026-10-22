// Packs the library the way npm would publish it and drops the tarball in
// vendor/, so the demo installs exactly what users get: the built dist/, the
// exports map and the 'use client' banners, not the source.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const vendor = join(here, '..', 'vendor');

rmSync(vendor, { recursive: true, force: true });
mkdirSync(vendor);
// `npm pack` runs the library's `prepare` script, which builds it. Its build
// log shares stdout with npm's own output, so read the tarball name from
// vendor/ (empty until now) rather than parsing that output.
execFileSync('npm', ['pack', '--pack-destination', vendor], { cwd: root, stdio: 'inherit' });
const [filename] = readdirSync(vendor).filter((name) => name.endsWith('.tgz'));
if (!filename) throw new Error('npm pack did not write a tarball');
renameSync(join(vendor, filename), join(vendor, 'ui-components.tgz'));
// npm keeps an installed file: dependency whose path did not change, so drop
// it to make the next `npm install` unpack the new tarball.
rmSync(join(here, '..', 'node_modules', '@rbalukja15', 'ui-components'), { recursive: true, force: true });
console.log(`Packed ${filename} into vendor/ui-components.tgz`);
