# ThreatGuard

A Manifest V3 Chromium extension that scores the risk of the page you are
visiting against multiple threat-intelligence sources, and warns you when the
page looks dangerous.

Runs silently in the background on safe pages. On risky pages, it renders a
full-page overlay with the risk score, the sources that flagged the URL, and
two options — proceed or go back.

## What it does

- Detects the URL of the current tab
- Checks it against three independent threat-intelligence sources
- Combines the results into a 0–100 risk score and a bucketed verdict
- Renders a warning overlay when the verdict is `suspicious` or `dangerous`
- Leaves safe pages untouched

## Threat intelligence sources

| Source | What it provides | Cost |
|--------|------------------|------|
| [Google Safe Browsing](https://developers.google.com/safe-browsing/v4/get-started) | Malware, social engineering, unwanted software lists | Free (non-commercial) |
| [VirusTotal](https://www.virustotal.com/gui/join-us) | Aggregated verdicts from 70+ engines | Free public tier |
| [PhishTank](https://www.phishtank.com/api_register.php) | Community-verified phishing URLs | Free |

Full details, rate limits, and commercial-use restrictions are documented in
[`docs/threat-intel-sources.md`](docs/threat-intel-sources.md).

## Architecture at a glance

```
Chrome Tab  ──►  MV3 Service Worker  ──►  Express Backend  ──►  Three threat sources
```

The extension never sees API keys. All third-party lookups go through the
backend, which owns the keys, fans out in parallel, and returns whatever
signals were available.

Full architecture: [`docs/architecture.md`](docs/architecture.md).

## Repository layout

```
threatguard/
├── extension/     MV3 Chromium extension (TypeScript → esbuild → dist/)
├── backend/       Express API proxy (TypeScript → tsc → dist/)
├── docs/          Product research, architecture, setup, submission notes
└── package.json   Root workspace config
```

## Quick start

```bash
npm install
cp .env.example .env    # optional: add API keys, see docs/setup.md
npm run build
```

Load `extension/dist/` in Chrome via `chrome://extensions` → **Load unpacked**.

Run the backend:

```bash
npm run dev:backend
```

The backend starts on `http://localhost:8787`. With no API keys, all three
sources fail and the extension reports "No sources responded" — this is
deliberate fail-open behavior and demonstrates the required failure handling.

Full setup instructions, including how to see the warning overlay without
live API keys: [`docs/setup.md`](docs/setup.md).

## Documentation

| File | Contents |
|------|----------|
| [`docs/part1-product-research.md`](docs/part1-product-research.md) | Guard.io product research — product, stack, team, feasibility, build plan |
| [`docs/architecture.md`](docs/architecture.md) | MV3 lifecycle, component split, caching, timeouts, failure handling, security |
| [`docs/threat-intel-sources.md`](docs/threat-intel-sources.md) | Each source, endpoints, keys, rate limits, scoring model |
| [`docs/setup.md`](docs/setup.md) | Install, configure, run, verify, troubleshoot |
| [`docs/submission-notes.md`](docs/submission-notes.md) | AI-native notes, limitations, production changes, 30-day roadmap |

## Key design decisions

- **A backend exists so the extension never holds API keys.** Any design that
  ships keys in the extension bundle is a security anti-pattern.
- **Fail-open, not fail-closed.** If a threat source is unavailable, the user
  is not blocked. For a consumer tool, this trade-off beats the alternative.
- **Warn, don't block.** The extension surfaces risk; the user decides. Auto-
  blocking on imperfect scoring causes more harm than help.
- **No `innerHTML` anywhere.** Every external string is rendered via
  `textContent` — reasons from threat APIs are untrusted data.
- **State via CSS variables.** One `data-verdict` attribute on `<body>`
  drives every stateful style in the popup. No duplicated CSS blocks.

## Known limitations

The MVP is intentionally scoped. Ten known limitations and what would change
in production are enumerated in
[`docs/submission-notes.md`](docs/submission-notes.md).

Highlights:
- No live threat data without configured API keys
- In-memory backend cache (no persistence across restarts)
- No rate limiting on the backend
- No automated test suite
- No settings UI

## AI-native development

This project was built with Claude as a coding and design partner. The full
breakdown of what AI assisted with, what was rejected, and how output was
reviewed and validated is in
[`docs/submission-notes.md`](docs/submission-notes.md).

## License

ISC. See `package.json`.