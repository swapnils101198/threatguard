# Setup

## Prerequisites

- **Node.js 22.x** (Active LTS). Earlier LTS versions will work; Node 24
  introduces `npm install-scripts` friction that this project does not need.
- **npm 10.x** (bundled with Node 22).
- A **Chromium-based browser** — Chrome, Edge, Brave, or Arc.

Verify:

```bash
node --version   # v22.x
npm --version    # 10.x
```

## Install

From the repository root:

```bash
npm install
```

This installs dependencies for both workspaces (`extension/` and `backend/`)
in a single step. npm hoists shared dependencies to the root `node_modules/`.

## Configure the backend

The backend reads its configuration from a `.env` file at the repository root.

```bash
cp .env.example .env
```

Then edit `.env` and fill in the three API keys:

```
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
PHISHTANK_API_KEY=...
```

**Getting keys:**

- **Google Safe Browsing** — free for non-commercial use.
  https://developers.google.com/safe-browsing/v4/get-started
- **VirusTotal** — free public API tier (4 req/min, 500 req/day, non-commercial).
  https://www.virustotal.com/gui/join-us
- **PhishTank** — free, community-driven. Key is optional but raises rate limits.
  https://www.phishtank.com/api_register.php

See `threat-intel-sources.md` for full details on each provider, including
commercial-use restrictions.

**It is fine to leave the keys blank.** The backend will start with warnings,
each source will fail on the first request, and the aggregator will return an
empty signals array. This is deliberate **fail-open** behavior and
demonstrates the required failure handling. The popup will show
"No sources responded."

## Run the backend

From the repository root:

```bash
npm run dev:backend
```

Expected startup output:

```
[env] GOOGLE_SAFE_BROWSING_API_KEY is not set — related threat source will be skipped
[env] VIRUSTOTAL_API_KEY is not set — related threat source will be skipped
[env] PHISHTANK_API_KEY is not set — related threat source will be skipped
[threatguard-backend] listening on http://localhost:8787
[threatguard-backend] env: development
```

Verify the backend with curl from a second terminal:

```bash
curl -X POST http://localhost:8787/api/check-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Expected response:

```json
{"signals":[],"cached":false}
```

Repeat the same command — the second response should say `"cached":true`.

## Build the extension

From the repository root:

```bash
npm run build:extension
```

This runs `esbuild` and emits the compiled extension into `extension/dist/`:

```
extension/dist/
├── manifest.json
├── assets/           (icons)
├── background/
│   └── service-worker.js
├── content/
│   ├── content.js
│   └── warning.css
└── popup/
    ├── popup.html
    ├── popup.css
    └── popup.js
```

## Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the folder `extension/dist/` (not `extension/`)
5. ThreatGuard appears in the list with the green shield icon

**Pin it to the toolbar** so the popup anchors below the icon:

1. Click the puzzle-piece 🧩 icon in the toolbar
2. Find ThreatGuard
3. Click the pin 📌 next to it

## Verify the extension works

1. Open `https://example.com` in a new tab
2. Click the ThreatGuard icon
3. The popup shows:
   - URL: `https://example.com/`
   - Verdict: "No threats found" with a green checkmark
   - "No sources responded" (because no keys are configured)
   - Score: `0/100`
   - A green **Rescan** pill button

4. Click **Rescan**. The status pill momentarily reads "Scanning" then returns
   to "No threats found."

## See the warning overlay

The warning overlay renders when the verdict is `suspicious` or `dangerous`.
With no API keys configured, this never happens naturally. To demo it:

1. Stop the backend (**Ctrl+C** in its terminal)
2. Open `backend/src/routes/check-url.ts`
3. Change `const DEMO_MODE = false;` to `const DEMO_MODE = true;`
4. Restart the backend: `npm run dev:backend`
5. Visit any http/https page in Chrome — the red warning overlay appears
6. **Revert the change** (`DEMO_MODE = false`) when finished

## Full build (both workspaces)

```bash
npm run build
```

This runs `build:extension` and `build:backend` in sequence.

## Project structure

```
threatguard/
├── backend/           Express API proxy (TypeScript → dist/)
├── extension/         MV3 Chromium extension (TypeScript → esbuild → dist/)
├── docs/              This documentation
├── tsconfig.base.json Shared TypeScript config
├── .env.example       Template for backend configuration
└── package.json       Root workspace config
```

## Troubleshooting

**`Cannot find module 'esbuild-windows-64'`**
Run `npm install` from the repository root (not from inside a workspace
folder). npm workspaces install from the root only.

**Extension loads but the popup shows "Service unreachable"**
The backend is not running, or `BACKEND_BASE_URL` in
`extension/src/lib/constants.ts` points to the wrong port. Default is
`http://localhost:8787`.

**Backend exits with `Missing required env var: ...`**
You are running in production mode. Development allows missing keys. Confirm
`NODE_ENV=development` in `.env`.

**`tsc` reports "no projects found"**
The root `typecheck` script uses project references. Each workspace has its
own `tsconfig.json` that extends `tsconfig.base.json`. If the base config is
missing, restore it from the repository.

**Chrome shows a red error on the extension card**
Open `chrome://extensions`, click the error count, and read the detail. Common
cause: `dist/` was not rebuilt after a manifest or source change. Run
`npm run build:extension` and reload the extension.