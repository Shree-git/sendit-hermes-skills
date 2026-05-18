#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const gitUrl =
  process.env.LOBEHUB_SKILL_GIT_URL ||
  process.argv.find((arg) => arg.startsWith('https://github.com/'));
const branch = process.env.LOBEHUB_SKILL_BRANCH || process.env.GITHUB_REF_NAME || 'main';
const credentialsPath =
  process.env.MARKET_CREDENTIALS_PATH || join(homedir(), '.lobehub-market', 'credentials.json');

function loadCredentials() {
  if (!existsSync(credentialsPath)) return {};

  try {
    return JSON.parse(readFileSync(credentialsPath, 'utf8'));
  } catch {
    return {};
  }
}

if (!gitUrl) {
  console.error('Usage: LOBEHUB_SKILL_GIT_URL=https://github.com/<owner>/<repo> npm run submit:lobehub');
  console.error('Or: npm run submit:lobehub -- https://github.com/<owner>/<repo>');
  process.exit(2);
}

const fileCredentials = loadCredentials();
const clientId = process.env.MARKET_CLIENT_ID || fileCredentials.clientId;
const clientSecret = process.env.MARKET_CLIENT_SECRET || fileCredentials.clientSecret;
const baseUrl = process.env.MARKET_BASE_URL || fileCredentials.baseUrl || 'https://market.lobehub.com';

if (!clientId || !clientSecret) {
  console.error('Missing MARKET_CLIENT_ID or MARKET_CLIENT_SECRET.');
  console.error('Register with `npx -y @lobehub/market-cli register ...` or use the logged-in LobeHub submit flow.');
  process.exit(2);
}

let MarketSDK;
try {
  ({ MarketSDK } = await import('@lobehub/market-sdk'));
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('Missing @lobehub/market-sdk. Run `npm install` in this directory first.');
    process.exit(2);
  }
  throw error;
}

const sdk = new MarketSDK({
  baseUrl,
  clientId,
  clientSecret,
});

const result = await sdk.marketSkills.reportGitHubSkill({
  gitUrl,
  branch,
});

console.log(JSON.stringify(result, null, 2));
