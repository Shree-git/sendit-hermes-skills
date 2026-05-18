#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillDir = join(rootDir, 'skills', 'sendit');
const skillPath = join(skillDir, 'SKILL.md');
const telegramPath = join(skillDir, 'TELEGRAM_SETUP.md');
const scriptsDir = join(skillDir, 'scripts');
const requiredScripts = [
  'install-sendit-hermes.mjs',
  'start-oauth-login.mjs',
  'complete-oauth-callback.mjs',
];
const requiredRootScripts = ['build-release.mjs', 'validate-skill.mjs', 'report-lobehub.mjs'];
const canonicalMcpUrl = 'https://sendit.infiniteappsai.com/api/mcp';

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function readRequired(path) {
  check(existsSync(path), `Missing ${path}`);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  check(Boolean(match), 'SKILL.md must start with YAML frontmatter.');
  return match?.[1] || '';
}

function assertIncludes(text, needle, label) {
  check(text.includes(needle), `${label} must include ${needle}`);
}

function assertRegex(text, regex, message) {
  check(regex.test(text), message);
}

function runNode(args, options = {}) {
  return execFileSync(process.execPath, args, {
    cwd: rootDir,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    stdio: options.stdio || 'pipe',
  });
}

function validateStructure() {
  check(existsSync(skillDir), 'Missing skills/sendit directory.');
  check(existsSync(scriptsDir), 'Missing skills/sendit/scripts directory.');
  check(existsSync(join(rootDir, 'README.md')), 'Missing README.md.');
  check(existsSync(join(rootDir, 'SUBMISSION.md')), 'Missing SUBMISSION.md.');
  check(existsSync(join(rootDir, 'package.json')), 'Missing package.json.');
  check(existsSync(join(rootDir, 'package-lock.json')), 'Missing package-lock.json.');
  check(existsSync(join(rootDir, '.gitignore')), 'Missing .gitignore.');

  for (const script of requiredScripts) {
    const scriptPath = join(scriptsDir, script);
    check(existsSync(scriptPath), `Missing ${script}`);
    if (existsSync(scriptPath)) {
      check(statSync(scriptPath).isFile(), `${script} must be a file.`);
    }
  }

  for (const script of requiredRootScripts) {
    const scriptPath = join(rootDir, 'scripts', script);
    check(existsSync(scriptPath), `Missing scripts/${script}`);
  }

  check(!existsSync(join(rootDir, 'sendit')), 'Old root sendit directory must be removed.');
  check(!existsSync(join(rootDir, 'sendit 2')), 'Old duplicate sendit 2 directory must be removed.');
  check(!existsSync(join(rootDir, 'sendit 3')), 'Old duplicate sendit 3 directory must be removed.');
  check(
    !existsSync(join(rootDir, 'sendit-hermes-telegram-pack.tar.gz')),
    'Ad hoc sendit-hermes-telegram-pack.tar.gz must be removed.',
  );
}

function validateSkillMarkdown() {
  const skill = readRequired(skillPath);
  const frontmatter = parseFrontmatter(skill);

  assertRegex(frontmatter, /^name:\s*sendit$/m, 'Frontmatter must set name: sendit.');
  assertRegex(frontmatter, /^version:\s*0\.2\.0$/m, 'Frontmatter must set version: 0.2.0.');
  assertRegex(
    frontmatter,
    /^author:\s*SendIt \/ Infinite Apps AI$/m,
    'Frontmatter must use SendIt / Infinite Apps AI author.',
  );
  assertRegex(frontmatter, /^license:\s*MIT$/m, 'Frontmatter must set license: MIT.');
  assertIncludes(frontmatter, 'platforms: [linux, macos]', 'Frontmatter');
  assertRegex(frontmatter, /^category:\s*social-media$/m, 'Frontmatter must set top-level category for LobeHub.');
  assertIncludes(frontmatter, 'repository: https://github.com/Shree-git/sendit-hermes-skills', 'Frontmatter');
  assertIncludes(frontmatter, 'sourceUrl: https://github.com/Shree-git/sendit-hermes-skills/tree/main/skills/sendit', 'Frontmatter');
  assertIncludes(frontmatter, 'summary:', 'Frontmatter');
  assertIncludes(frontmatter, 'icon:', 'Frontmatter');
  assertIncludes(frontmatter, 'category: social-media', 'Frontmatter');

  for (const tag of ['sendit', 'social-media', 'mcp', 'oauth', 'publishing', 'scheduling', 'analytics']) {
    assertRegex(frontmatter, new RegExp(`\\b${tag}\\b`), `Frontmatter must include ${tag} tag.`);
  }

  assertIncludes(skill, canonicalMcpUrl, 'SKILL.md');
  assertIncludes(skill, 'https://sendit.infiniteappsai.com/mcp', 'SKILL.md');
  assertIncludes(skill, '${HERMES_SKILL_DIR}/scripts/install-sendit-hermes.mjs', 'SKILL.md');
  assertIncludes(skill, '${HERMES_SKILL_DIR}/scripts/start-oauth-login.mjs', 'SKILL.md');
  assertIncludes(skill, '${HERMES_SKILL_DIR}/scripts/complete-oauth-callback.mjs', 'SKILL.md');
  assertIncludes(skill, 'Never echo full `code` or', 'SKILL.md');
}

function validateDocs() {
  const telegram = readRequired(telegramPath);
  const submission = readRequired(join(rootDir, 'SUBMISSION.md'));
  const readme = readRequired(join(rootDir, 'README.md'));

  assertIncludes(telegram, canonicalMcpUrl, 'TELEGRAM_SETUP.md');
  assertIncludes(telegram, 'Do not ask the user for a SendIt API key', 'TELEGRAM_SETUP.md');
  assertIncludes(submission, 'hermes skills tap add <owner>/<repo>', 'SUBMISSION.md');
  assertIncludes(submission, 'hermes skills install <owner>/<repo>/skills/sendit', 'SUBMISSION.md');
  assertIncludes(submission, 'optional-skills/mcp/sendit/', 'SUBMISSION.md');
  assertIncludes(submission, 'reportGitHubSkill', 'SUBMISSION.md');
  assertIncludes(submission, 'npm run submit:lobehub', 'SUBMISSION.md');
  assertIncludes(readme, 'skills/sendit/', 'README.md');
  assertIncludes(readme, 'npm run submit:lobehub', 'README.md');
}

function validateScripts() {
  const installer = readRequired(join(scriptsDir, 'install-sendit-hermes.mjs'));
  const starter = readRequired(join(scriptsDir, 'start-oauth-login.mjs'));
  const callback = readRequired(join(scriptsDir, 'complete-oauth-callback.mjs'));
  const reportLobeHub = readRequired(join(rootDir, 'scripts', 'report-lobehub.mjs'));

  assertIncludes(installer, 'process.env.HERMES_HOME', 'install-sendit-hermes.mjs');
  assertIncludes(installer, canonicalMcpUrl, 'install-sendit-hermes.mjs');
  assertIncludes(installer, "'social-media'", 'install-sendit-hermes.mjs');
  assertIncludes(starter, "['mcp', 'login', serverName]", 'start-oauth-login.mjs');
  assertIncludes(starter, '/tmp/sendit-hermes', 'start-oauth-login.mjs');
  assertIncludes(callback, "new Set(['127.0.0.1', 'localhost'])", 'complete-oauth-callback.mjs');
  assertIncludes(callback, 'redactCallbackUrl', 'complete-oauth-callback.mjs');
  assertIncludes(reportLobeHub, 'reportGitHubSkill', 'report-lobehub.mjs');
  assertIncludes(reportLobeHub, 'LOBEHUB_SKILL_GIT_URL', 'report-lobehub.mjs');

  runNode([join(scriptsDir, 'complete-oauth-callback.mjs'), '--self-test']);
}

function validateInstallerAgainstTempHome() {
  const tempRoot = mkdtempSync(join(tmpdir(), 'sendit-hermes-validate-'));
  try {
    const createdHome = join(tempRoot, 'created-home');
    runNode([join(scriptsDir, 'install-sendit-hermes.mjs')], {
      env: { HERMES_HOME: createdHome },
    });

    const createdConfig = readRequired(join(createdHome, 'config.yaml'));
    assertIncludes(createdConfig, canonicalMcpUrl, 'created temp config.yaml');
    assertIncludes(createdConfig, 'auth: oauth', 'created temp config.yaml');
    check(
      existsSync(join(createdHome, 'skills', 'social-media', 'sendit', 'SKILL.md')),
      'Installer must copy skill into HERMES_HOME skills/social-media/sendit.',
    );

    const repairHome = join(tempRoot, 'repair-home');
    const repairConfigPath = join(repairHome, 'config.yaml');
    mkdirSync(repairHome, { recursive: true });
    writeFileSync(
      repairConfigPath,
      [
        'profile: keep-me',
        'mcp_servers:',
        '  other:',
        '    url: "https://example.com/mcp"',
        '    auth: none',
        '  sendit:',
        '    url: "https://sendit.infiniteappsai.com/mcp"',
        '    auth: none',
        'after: keep-me-too',
        '',
      ].join('\n'),
      'utf8',
    );

    runNode([join(scriptsDir, 'install-sendit-hermes.mjs')], {
      env: { HERMES_HOME: repairHome },
    });

    const repairedConfig = readRequired(repairConfigPath);
    assertIncludes(repairedConfig, 'profile: keep-me', 'repaired config.yaml');
    assertIncludes(repairedConfig, 'other:', 'repaired config.yaml');
    assertIncludes(repairedConfig, 'after: keep-me-too', 'repaired config.yaml');
    assertIncludes(repairedConfig, canonicalMcpUrl, 'repaired config.yaml');
    assertIncludes(repairedConfig, 'auth: oauth', 'repaired config.yaml');
    check(
      !repairedConfig.includes('https://sendit.infiniteappsai.com/mcp"'),
      'Installer must repair the reduced /mcp endpoint.',
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

validateStructure();
validateSkillMarkdown();
validateDocs();
validateScripts();
validateInstallerAgainstTempHome();

if (failures.length > 0) {
  console.error('SendIt Hermes skill validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SendIt Hermes skill validation passed.');
