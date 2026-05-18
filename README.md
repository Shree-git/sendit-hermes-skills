# SendIt Hermes Skills Tap

This package is the source of truth for the SendIt Hermes Agent skill and the
standalone skills tap that can be submitted to Hermes and LobeHub.

SendIt is configured as a remote OAuth MCP server:

```yaml
mcp_servers:
  sendit:
    url: "https://sendit.infiniteappsai.com/api/mcp"
    auth: oauth
```

Use `/api/mcp`, not `/mcp`. The `/mcp` endpoint is reserved for the ChatGPT app
submission profile and exposes a reduced tool catalog.

## Layout

```text
integrations/hermes-skill/
├── skills/sendit/              # Tap-compatible skill source
│   ├── SKILL.md
│   ├── TELEGRAM_SETUP.md
│   └── scripts/
├── scripts/
│   ├── build-release.mjs
│   └── validate-skill.mjs
├── SUBMISSION.md
└── package.json
```

## Development

```bash
npm run validate
npm run build
```

To report a published public GitHub repo to LobeHub from an authenticated
environment. The helper reads `MARKET_CLIENT_ID` / `MARKET_CLIENT_SECRET` or
the local credentials created by `npx -y @lobehub/market-cli register`:

```bash
LOBEHUB_SKILL_GIT_URL=https://github.com/<owner>/<repo> npm run submit:lobehub
```

`npm run build` writes ignored release artifacts to `dist/`:

- `dist/sendit-hermes-skills/`
- `dist/sendit-hermes-skills.tar.gz`
- `dist/sendit-hermes-skills.zip` when the local `zip` command is available

## Hermes Install

From a published tap repository:

```bash
hermes skills tap add Shree-git/sendit-hermes-skills
hermes skills install Shree-git/sendit-hermes-skills/sendit
```

Without adding the tap first, users can install the skill directly:

```bash
hermes skills install Shree-git/sendit-hermes-skills/skills/sendit
```

For remote VPS or Telegram-only setup, upload the generated archive or this
folder to Hermes and ask it to read `skills/sendit/TELEGRAM_SETUP.md`.

## LobeHub Import

LobeHub imports skills from public GitHub repositories that contain `SKILL.md`
bundles. Publish the generated standalone repo contents, then report it through
the LobeHub Market SDK or the logged-in marketplace submission flow. See
`SUBMISSION.md` for the exact checklist.

Submitted locations:

- Hermes tap: https://github.com/Shree-git/sendit-hermes-skills
- Hermes upstream PR: https://github.com/NousResearch/hermes-agent/pull/27727
- LobeHub: https://lobehub.com/skills/shree-git-sendit-hermes-skills-sendit
