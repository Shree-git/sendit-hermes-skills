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
environment:

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
hermes skills tap add <owner>/<repo>
hermes skills install <owner>/<repo>/sendit
```

Without adding the tap first, users can install the skill directly:

```bash
hermes skills install <owner>/<repo>/skills/sendit
```

For remote VPS or Telegram-only setup, upload the generated archive or this
folder to Hermes and ask it to read `skills/sendit/TELEGRAM_SETUP.md`.

## LobeHub Import

LobeHub imports skills from public GitHub repositories that contain `SKILL.md`
bundles. Publish the generated standalone repo contents, then report it through
the LobeHub Market SDK or the logged-in marketplace submission flow. See
`SUBMISSION.md` for the exact checklist.
