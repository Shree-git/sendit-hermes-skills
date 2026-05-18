#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const releaseName = 'sendit-hermes-skills';
const releaseDir = join(distDir, releaseName);
const tarPath = join(distDir, `${releaseName}.tar.gz`);
const zipPath = join(distDir, `${releaseName}.zip`);

function copyPath(from, to) {
  cpSync(join(rootDir, from), join(releaseDir, to || from), {
    recursive: true,
    filter: (src) => !src.includes('/.DS_Store') && !src.includes('/dist/'),
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    encoding: 'utf8',
    stdio: options.optional ? 'pipe' : 'inherit',
  });

  if (result.status !== 0 && !options.optional) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }

  return result;
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });

copyPath('README.md');
copyPath('SUBMISSION.md');
copyPath('LICENSE');
copyPath('package.json');
copyPath('package-lock.json');
copyPath('.gitignore');
copyPath('scripts');
copyPath('skills');

run('tar', ['-czf', tarPath, '-C', distDir, releaseName]);

const zipResult = run('zip', ['-qr', zipPath, releaseName], {
  cwd: distDir,
  optional: true,
});

console.log(`Built ${releaseDir}`);
console.log(`Built ${tarPath} (${statSync(tarPath).size} bytes)`);

if (zipResult.status === 0 && existsSync(zipPath)) {
  console.log(`Built ${zipPath} (${statSync(zipPath).size} bytes)`);
} else {
  console.log('Skipped zip archive because the local `zip` command is unavailable.');
}
