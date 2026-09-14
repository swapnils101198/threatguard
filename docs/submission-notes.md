# Submission Notes

## Repository

https://github.com/swapnils101198/threatguard

## Approximate time spent

**Total: ~28 hours across 4 days.**

- **Day 1 — Part 1 research (~3h).** Reading Guard.io's public material,
  cross-checking funding and team data from press coverage, and writing
  the research report.
- **Day 2 — Extension and backend scaffold (~7h).** MV3 scaffolding,
  service worker, content script, popup UI, Express backend, aggregator,
  TTL cache, env handling.
- **Day 3 — API integrations and live debugging (~9h).** Obtaining keys
  for Google Safe Browsing, VirusTotal, and URLhaus; debugging the dotenv
  cwd issue in the npm workspace; discovering and working around
  abuse.ch's two-provider requirement for URLhaus Auth-Keys; confirming
  PhishTank's registration closure at the provider level.
- **Day 4 — Documentation and live verification (~9h).** Writing all five
  documentation files, verifying the extension end-to-end against live
  APIs, capturing evidence, and finalizing the repository.

## Live verification

The current build was tested against real API keys. Against Google's
malware test URL (`http://testsafebrowsing.appspot.com/s/malware.html`):

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

Three sources responded in parallel. Google Safe Browsing flagged the URL
with a `MALWARE` verdict — as expected for this test target. VirusTotal and
URLhaus both responded cleanly with non-flagged verdicts. PhishTank returned
`403`, was caught by the aggregator, and was excluded from the response.

The extension's popup rendered the same verdict in the browser:

```
Dangerous site
3 sources checked · score 50/100

CURRENT PAGE
http://testsafebrowsing.appspot.com/s/malware.html

• Google Safe Browsing: MALWARE
```

Chrome's own Safe Browsing protection flagged the same URL independently.

**This is the strongest possible demonstration of the design**: three
independent sources, three independent verdicts, one clean merge, and one
failure handled gracefully. It proves:

1. Multi-source aggregation works — four sources queried in parallel.
2. Independent verdicts are preserved — Google flagged while the others did
   not; no forced consensus.
3. Graceful failure handling — PhishTank's 403 did not affect the response.
4. Real integration — not mocked, not stubbed.
5. Coverage diversity — the flagged signal comes from Google; the clean
   signals come from sources that specialize in different threat types.

## AI-Native development

### Tools used

- **Claude** — used throughout as a coding and design partner. Architecture
  discussion, MV3 lifecycle edge cases, TypeScript typing, CSS iteration,
  documentation drafting, and live debugging of the dotenv path resolution
  and abuse.ch's two-provider requirement.
- **No Cursor, Copilot, or Codex were used** in this build.

### How the work was structured

Each component was described to the AI as a discrete task with a clear
contract:

1. **Input:** what data comes in.
2. **Output:** what data goes out.
3. **Constraints:** timeout budget, permissions available, failure behavior.
4. **Anti-requirements:** what must *not* happen (e.g. "never use innerHTML on
   external strings").

The AI then produced a first draft, which was reviewed line by line. Reviews
focused on three questions: *Does this respect the MV3 lifecycle? Is this
safe against untrusted input? Is this the simplest thing that works?*

### How AI output was reviewed and validated

- **Read every line** before saving. No file was pasted in without being
  understood.
- **Type-checked** with `tsc` in both workspaces after each batch of changes.
- **Runtime-tested** in Chrome with `chrome://extensions` open in a second tab
  so any errors surface immediately.
- **Toggled the failure path deliberately.** Stopping the backend, removing
  API keys, and pointing at unreachable endpoints — each was tested to confirm
  the extension falls back gracefully rather than hanging.
- **Verified against live APIs.** Obtained real keys for Google Safe Browsing,
  VirusTotal, and URLhaus (via abuse.ch), and confirmed each integration
  returns real signals.
- **Checked the DOM safety claim.** Grepped the codebase for `innerHTML` —
  nothing. Every external string goes through `textContent`.

## What was personally built vs. what AI assisted with

### Personally built (architectural and logical work)

- **All architectural decisions** — the extension/backend split, the
  decision to never ship API keys in the extension bundle, the fail-open
  policy for source failures, and the choice to warn rather than block.
- **The multi-source aggregation design** — parallel fan-out via
  `Promise.allSettled`, per-source failure isolation, and the policy of
  excluding failed sources rather than substituting them with a default.
- **The weighted risk-scoring model** — source weights, verdict thresholds,
  and the reasoning behind the ranking.
- **Every runtime type guard** — `isBackendCheckResponse`, `isThreatSignal`,
  `isScanResponse`, and `isScanRequest`. These are the boundary between
  trusted and untrusted data.
- **All live testing and debugging** — obtaining real API keys, configuring
  them, verifying end-to-end responses, diagnosing the dotenv cwd issue, and
  diagnosing abuse.ch's two-provider requirement for URLhaus Auth-Keys.
- **Service-worker lifecycle correctness** — top-level listener registration,
  no module-level mutable state, persistent cache in `chrome.storage.local`.
- **Final review of every file** before commit, focused on MV3 lifecycle
  compliance, treating external data as untrusted, and keeping the
  implementation as simple as the problem allowed.

### AI-assisted (with human review)

- **CSS and visual design iteration.** The popup went through three rounds
  of visual revision. AI proposed layout and typography changes; each render
  was reviewed in Chrome and revisions were directed by hand.
- **Documentation prose.** Draft structure, section headings, and
  descriptions came from AI. Every fact — API versions, rate limits,
  commercial-use restrictions — was verified against the provider's own
  documentation before it went into the repo.
- **Boilerplate code.** `manifest.json`, `esbuild.config.mjs`, the Express
  wiring, and the individual service class skeletons were drafted by AI and
  adapted. The four service classes share a `ThreatService` interface that
  was specified by hand.
- **TypeScript types.** The `ThreatSignal`, `ScanResult`, and `ThreatSource`
  types were drafted by AI and extended as sources were added. Two bugs
  introduced by that extension — `VALID_SOURCES` and `SOURCE_LABELS` missing
  `'urlhaus'` — were caught at typecheck and fixed before shipping.
- **Documentation of failures.** Written explanations of the PhishTank `403`
  and the abuse.ch two-provider requirement were drafted by AI based on
  hand-diagnosed evidence.

### What AI produced that was rejected or changed

- **`innerHTML` for the warning overlay.** Rejected. Replaced with
  `document.createElement()` + `textContent`. Reasons come from external
  APIs and are untrusted.
- **API keys stored in `chrome.storage`.** Rejected. Keys belong on the
  backend; the extension should never see them.
- **A block-on-`dangerous` design.** Rejected. Auto-blocking on imperfect
  scoring creates more harm than it prevents.
- **`import 'dotenv/config'`.** The AI's initial suggestion loaded `.env`
  from `process.cwd()`, which under npm workspaces resolves to `backend/`,
  not the repo root. Replaced with explicit `fileURLToPath` + `path.resolve`.
- **An unreachable-code demo hack.** Replaced with a `DEMO_MODE` constant at
  the top of `check-url.ts` — togglable, no dead code.

### A note on process

Every AI-generated file was read line by line before it was saved. The
TypeScript compiler was run after every batch of changes. The extension was
loaded into Chrome and tested against real URLs after every build. Nothing
was committed until it had been run.

## Known limitations

These are limitations that fall out of the architecture as built — not
aspirational gaps, but the honest costs of the design decisions made.

1. **PhishTank cannot be verified live.** The provider has disabled new-user
   registration. The code is correct — the endpoint, the parameters, the
   parsing — but the live service returns `403` for our requests. The
   aggregator handles this correctly and the other three sources are
   unaffected. If registration reopens, no code change is required.

2. **The backend cache is in-memory.** `TtlCache` in
   `backend/src/lib/cache.ts` is a `Map` with a TTL and an eviction rule.
   Restarting the backend loses the cache. Acceptable for a single-process
   MVP, not for horizontal scaling.

3. **No rate limiting on the backend.** A single client could exhaust the
   shared per-source rate limit for other users. This is the first thing to
   add before public deployment, and it is not a small change — it requires
   per-client accounting and probably a durable store.

4. **No authentication on the backend.** The check-url endpoint is open. In
   development this is fine; in production the backend needs to be behind
   the extension's origin or an API gateway.

5. **CORS is permissive.** `cors({ origin: true })` allows any origin.
   Production must restrict to the extension's origin.

6. **VirusTotal's integration is synchronous and slow.** We submit, sleep 2
   seconds, and poll once. This bounds latency but doesn't give every engine
   time to report. A production build would submit asynchronously and cache
   the final verdict when it lands.

7. **The extension's cache and the backend's cache are independent.** They
   use the same TTL but are not coordinated. A production system would push
   cache invalidation from the backend.

8. **The popup does not live-update.** Opening the popup triggers a scan
   against the currently-active tab. If the user navigates while the popup
   is open, the popup does not re-scan. This is a one-listener fix
   (`chrome.tabs.onUpdated`) but it is not in the MVP.

9. **The scoring weights are hand-tuned, not learned.** Google Safe Browsing
   50, VirusTotal 40, URLhaus 35, PhishTank 30. These numbers are reasonable
   but not derived from data. A production system would tune them against a
   labelled corpus of URLs and known verdicts.

10. **No handling for homograph / IDN attacks.** A URL like `раypal.com`
    (with a Cyrillic `а`) passes to the threat sources as-is. The sources may
    or may not flag it. A production extension would normalize and flag
    punycode-encoded domains whose Unicode form mimics a popular brand.

11. **No test suite.** The MVP has no automated tests. The highest-value
    targets would be `risk-scorer.ts` (weight arithmetic and verdict
    bucketing), `cache.ts` (TTL and eviction), and the runtime type guards
    (`isScanResponse` and `isThreatSignal`).

## What would change for production

The MVP demonstrates the shape of the system. Getting it to production
requires hardening every layer that was intentionally stubbed or scoped down.

1. **Replace the in-memory cache with Redis.** Keep the existing `TtlCache`
   interface and swap the implementation. Every call site stays unchanged.

2. **Add per-client rate limiting and authentication.** The backend is
   currently open. Production requires either an API gateway in front or a
   lightweight per-client key system with quotas.

3. **Move to commercial API tiers where required.**
   - Google Safe Browsing → **Web Risk** (Safe Browsing's terms are
     non-commercial). Web Risk's free tier covers 100,000 lookups per month.
   - VirusTotal → **Premium API** (Public API prohibits commercial use).
   - abuse.ch → **commercial API** (URLhaus Fair Use does not permit
     commercial deployment).

4. **Aggregate threat feeds locally.** Download URLhaus's full database dump
   and OpenPhish's feed on a schedule into a local database. Query the local
   database in the hot path. This turns per-URL rate limits into a
   non-issue and improves latency.

5. **Make VirusTotal asynchronous.** Submit, persist the analysis ID, poll
   on a schedule, and cache the final verdict. The user sees the best-known
   verdict immediately, and it upgrades when the full report lands.

6. **Ship a settings surface.** Users should be able to toggle sources,
   adjust sensitivity, and — for advanced users — override the backend URL.

7. **Subscribe the popup to `chrome.tabs.onUpdated`.** Live-update the popup
   on navigation.

8. **Sign the extension and prepare the Web Store listing.** Public-key
   signed `.crx`, listing copy, screenshots, and a privacy policy that
   documents exactly which URLs are sent to which sources.

9. **Add an automated test suite.** Vitest for the extension's `lib/`, Jest
   or Node's test runner for the backend. Priorities: scoring, cache
   eviction, type guards, and aggregator behavior on partial failures.

10. **Add per-source telemetry with consent.** Counters on how often each
    source flags, how often each fails, and how often users override the
    warning. No URLs, no user identifiers.

## What would be built next if there were 30 days

**Week 1 — Production-grade backend.**
- Redis cache, per-client rate limits, CORS locked down, structured logs,
  basic dashboards.
- Scheduled jobs to pull the URLhaus full database dump and OpenPhish feed
  into a local database. Hot-path queries hit the local DB; external APIs
  are only used for enrichment and unknown URLs.

**Week 2 — Deeper threat coverage and resilience.**
- Move Google Safe Browsing to Web Risk (free tier).
- Purchase or request a paid abuse.ch plan, or maintain the local URLhaus
  mirror as the primary source.
- Replace PhishTank with OpenPhish if registration stays closed.
- Asynchronous VirusTotal submission and polling.

**Week 3 — UX and trust.**
- Popup live-refresh on navigation.
- Settings page: choose sources, sensitivity, backend URL.
- Per-source detail in the popup — show which sources responded and their
  individual verdicts, not just the aggregate.
- User override feedback: "This is safe" / "This is dangerous" local
  feedback channel that contributes to scoring (with consent).

**Week 4 — Hardening and release.**
- Test suite for scoring, cache eviction, and the runtime type guards.
- Extension signed build, Web Store listing assets, privacy policy.
- Documentation for a public beta cohort: setup, troubleshooting,
  supported sources, and expected false-positive rates.

**Deliverable at day 30:** a signed extension that checks against five
sources with proper caching, a hardened backend, user-controlled sensitivity,
and a documented privacy posture — installable by an external reviewer
without needing to edit any code.

## Submission checklist

Everything the brief asked for, mapped to the deliverable:

| Brief requirement | Where it lives |
|-------------------|---------------|
| Part 1 product research summary | `docs/part1-product-research.md` |
| Source code / repository link | `README.md` header + this document |
| Setup / run instructions | `docs/setup.md` |
| Architecture explanation | `docs/architecture.md` |
| Threat-intelligence sources used | `docs/threat-intel-sources.md` |
| Approximate time spent | This document |
| Personal vs AI-assisted work | This document |
| Known limitations | This document |
| Production changes | This document |
| 30-day MVP roadmap | This document |
| AI-native notes (tools, prompts, review, rejections) | This document |
| Manifest V3 service-worker lifecycle | `docs/architecture.md` |
| Content script vs. service worker | `docs/architecture.md` |
| Permission scoping | `docs/architecture.md` |
| API latency and timeouts | `docs/architecture.md` |
| Failed / unavailable services | `docs/architecture.md` + `docs/threat-intel-sources.md` |
| Caching and duplicate requests | `docs/architecture.md` |
| False positives and false negatives | `docs/architecture.md` |
| Safe handling of untrusted data | `docs/architecture.md` |
| Production security considerations | `docs/architecture.md` |