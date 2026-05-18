#!/usr/bin/env node

const gitUrl =
  process.env.LOBEHUB_SKILL_GIT_URL ||
  process.argv.find((arg) => arg.startsWith('https://github.com/'));
const branch = process.env.LOBEHUB_SKILL_BRANCH || process.env.GITHUB_REF_NAME || 'main';
const baseUrl = process.env.MARKET_BASE_URL || 'https://market.lobehub.com';

if (!gitUrl) {
  console.error('Usage: LOBEHUB_SKILL_GIT_URL=https://github.com/<owner>/<repo> npm run submit:lobehub');
  console.error('Or: npm run submit:lobehub -- https://github.com/<owner>/<repo>');
  process.exit(2);
}

if (!process.env.MARKET_CLIENT_ID || !process.env.MARKET_CLIENT_SECRET) {
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
  clientId: process.env.MARKET_CLIENT_ID,
  clientSecret: process.env.MARKET_CLIENT_SECRET,
});

const result = await sdk.marketSkills.reportGitHubSkill({
  gitUrl,
  branch,
});

console.log(JSON.stringify(result, null, 2));
