# SendIt Hermes + LobeHub Submission Guide

## Release Build

Run from this directory:

```bash
npm run build
```

The standalone tap contents are written to `dist/sendit-hermes-skills/`.
Publish that directory as a public GitHub repository, for example
`Shree-git/sendit-hermes-skills`.

Published tap:

```text
https://github.com/Shree-git/sendit-hermes-skills
```

## Hermes Tap Submission

Install from the public tap:

```bash
hermes skills tap add Shree-git/sendit-hermes-skills
hermes skills install Shree-git/sendit-hermes-skills/sendit
```

Direct GitHub install without adding the tap:

```bash
hermes skills install Shree-git/sendit-hermes-skills/skills/sendit
```

Smoke test after install:

```bash
hermes skills list | grep sendit
hermes mcp login sendit
```

For remote VPS or Telegram-only users, upload the release archive and tell
Hermes to read `skills/sendit/TELEGRAM_SETUP.md`.

## Hermes Core PR

Preferred PR location:

```text
optional-skills/mcp/sendit/
```

If maintainers prefer platform grouping, use:

```text
skills/social-media/sendit/
```

PR checklist:

- Include only `SKILL.md`, `TELEGRAM_SETUP.md`, and `scripts/*.mjs`.
- Keep `https://sendit.infiniteappsai.com/api/mcp` as the MCP URL.
- Mention that SendIt uses remote MCP OAuth and does not require an API key.
- Include the VPS/Telegram OAuth callback replay flow in the PR description.
- State that live OAuth and publish tests require user-owned SendIt/social
  credentials.

Suggested PR title:

```text
Add SendIt remote MCP OAuth skill
```

Submitted PR:

```text
https://github.com/NousResearch/hermes-agent/pull/27727
```

Suggested PR summary:

```text
Adds a SendIt skill for social publishing, scheduling, platform connection,
media upload, validation, previews, and analytics through the SendIt remote MCP
server. The skill includes a VPS/Telegram-friendly OAuth callback replay helper
for Hermes deployments where the browser runs on a different device.
```

## LobeHub Skills Marketplace

Primary target: LobeHub Skills Marketplace GitHub import.

After publishing the standalone GitHub repository, report it from an
authenticated environment. The helper reads `MARKET_CLIENT_ID` /
`MARKET_CLIENT_SECRET` or the local credentials created by
`npx -y @lobehub/market-cli register`:

```bash
LOBEHUB_SKILL_GIT_URL=https://github.com/Shree-git/sendit-hermes-skills npm run submit:lobehub
```

The script wraps the LobeHub Market SDK call below:

```bash
node --input-type=module <<'EOF'
import { MarketSDK } from "@lobehub/market-sdk";

const sdk = new MarketSDK({
  baseUrl: process.env.MARKET_BASE_URL || "https://market.lobehub.com",
  clientId: process.env.MARKET_CLIENT_ID,
  clientSecret: process.env.MARKET_CLIENT_SECRET,
});

const result = await sdk.marketSkills.reportGitHubSkill({
  gitUrl: "https://github.com/Shree-git/sendit-hermes-skills",
  branch: "main",
});

console.log(result);
EOF
```

If SDK credentials are unavailable, use the logged-in LobeHub “Submit Skill”
flow and provide the public GitHub repository URL.

Marketplace copy:

- Name: `SendIt`
- Identifier: `sendit`
- Category: `social-media`
- Repository: `https://github.com/Shree-git/sendit-hermes-skills`
- Tags: `sendit`, `social-media`, `mcp`, `oauth`, `publishing`, `scheduling`,
  `analytics`
- Description: `Use SendIt from Hermes Agent for social publishing, scheduling,
  platform connection, media upload, content validation, previews, and analytics
  through remote MCP OAuth.`

Submitted LobeHub page:

```text
https://lobehub.com/skills/shree-git-sendit-hermes-skills-sendit
```

## Acceptance Notes

- Do not submit the old `/mcp` URL; it is the ChatGPT app endpoint and has a
  reduced tool catalog.
- Do not include local secrets, OAuth callback URLs, generated logs, or generated
  archives in the source repository.
- Live OAuth verification requires a real user session and should be performed
  after the public repo import is queued or accepted.
