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

The backend reads its configuration from a `.env` file at the **repository
root**. `backend/src/lib/env.ts` resolves the path explicitly via
`fileURLToPath` + `path.resolve`, so the file is loaded regardless of which
directory the process runs from.

```bash
cp .env.example .env
```

Then edit `.env` and fill in the keys:

```
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
URLHAUS_AUTH_KEY=...
PHISHTANK_API_KEY=...        # optional — see below
```

### Getting the keys

**Google Safe Browsing** — free for non-commercial use.

1. Go to https://console.cloud.google.com/projectcreate
2. Create a project (no billing required for Safe Browsing)
3. **APIs & Services** → **Library** → search "Safe Browsing API" → **Enable**
4. **APIs & Services** → **Credentials** → **+ Create Credentials** → **API key**
5. Optionally restrict the key to the Safe Browsing API

**VirusTotal** — free public tier (4 req/min, 500 req/day; non-commercial).

1. Sign up at https://www.virustotal.com/gui/join-us
2. Verify your email
3. Click your avatar → **API key** → copy

**URLhaus (abuse.ch)** — free under Fair Use. Auth-Key required.

1. Go to https://auth.abuse.ch/
2. Sign up with **at least two providers** (Google + GitHub, for example).
   This is a recovery-method requirement enforced by abuse.ch — one provider
   is not enough and the Auth-Key will not persist.
3. Save your profile
4. Scroll to **Auth Key** → **Generate Key**
5. **Click Save Profile again** to persist the key on abuse.ch's backend
6. Verify the key field still shows the key after the page reloads

**PhishTank** — free, community-driven. **Currently unavailable.**

Registration at https://www.phishtank.com/api_register.php is disabled by the
provider. The integration code remains in place and will resume working if
registration reopens. Leaving `PHISHTANK_API_KEY` empty will produce a warning
at startup and a `403` on each request — both are handled by the aggregator.

See `threat-intel-sources.md` for full details on each provider, including
API versions and commercial-use restrictions.

### It's fine to leave keys blank

The backend will start with warnings, each configured-blank source will fail
on the first request, and the aggregator will return whatever signals were
available. This is deliberate **fail-open** behavior and demonstrates the
required failure handling. The popup will show "No sources responded" if
every source fails.

## Run the backend

From the repository root:

```bash
npm run dev:backend
```

Expected startup output with all available keys configured:

```
[threatguard-backend] listening on http://localhost:8787
[threatguard-backend] env: development
```

Expected startup output with `PHISHTANK_API_KEY` still blank:

```
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

Expected response against a clean URL with the three working sources
configured:

```json
{
  "signals": [
    {"source": "google-safe-browsing", "flagged": false},
    {"source": "virustotal", "flagged": false},
    {"source": "urlhaus", "flagged": false}
  ],
  "cached": false
}
```

Repeat the same command — the second response should say `"cached":true`.

### Verify against a known-malicious URL

Google provides a URL that is guaranteed to be flagged on its malware lists:

```bash
curl -X POST http://localhost:8787/api/check-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://testsafebrowsing.appspot.com/s/malware.html"}'
```

Expected response:

```json
{
  "signals": [
    {"source": "google-safe-browsing", "flagged": true, "detail": "MALWARE"},
    {"source": "virustotal", "flagged": false},
    {"source": "urlhaus", "flagged": false}
  ],
  "cached": false
}
```

The backend terminal should show at most one failure line — PhishTank's `403`
if the key is unset. No failure lines for the other sources.

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
   - "3 sources checked" (with the three working keys configured)
   - Score: `0/100`
   - A green **Rescan** pill button

4. Click **Rescan**. The status pill momentarily reads "Scanning" then returns
   to "No threats found."

## See the warning overlay

The warning overlay renders when the verdict is `suspicious` or `dangerous`.

**Option A — use a real malicious URL.** Visit any URL that Google Safe
Browsing, VirusTotal, or URLhaus has flagged. The overlay renders
automatically. The most reliable test URL is Google's own malware test target:

```
http://testsafebrowsing.appspot.com/s/malware.html
```

**Option B — use the demo flag.** If you want to demo the overlay without a
flagged URL:

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

**Backend warns `GOOGLE_SAFE_BROWSING_API_KEY is not set` even though `.env`
has the key**
You edited `.env` while the backend was running. Environment variables are
read once at process start. Stop the backend (**Ctrl+C**) and restart it.

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

**URLhaus returns `403` even though the Auth-Key is in `.env`**
abuse.ch requires **two** linked authentication providers before an Auth-Key
becomes valid. On your profile page at `auth.abuse.ch/user/me`, connect a
second provider (GitHub, LinkedIn, or X), click **Save Profile**, then
regenerate the Auth-Key and save again. If the key still fails, the account
may be temporarily rate-limited — abuse.ch restricts accounts for up to 72
hours after excessive query volume.

**`EADDRINUSE: address already in use :::8787`**
A previous backend process is still holding the port.

- **Git Bash:**
  ```bash
  netstat -ano | findstr :8787
  taskkill //F //PID <pid-from-above>
  ```
- **cmd.exe:**
  ```cmd
  netstat -ano | findstr :8787
  taskkill /F /PID <pid-from-above>
  ```
- **PowerShell:**
  ```powershell
  Get-NetTCPConnection -LocalPort 8787 | Select-Object OwningProcess
  Stop-Process -Id <pid-from-above> -Force
  ```

**PhishTank always returns `403`**
Registration at PhishTank is disabled by the provider. No action is
required — the aggregator handles the failure and the other three sources
continue to work. See `threat-intel-sources.md`.