# Submission Notes

## Repository

https://github.com/swapnils101198/threatguard

## Approximate time spent

- **Product research (Part 1):** ~2 hours of reading, cross-checking public
  sources, and writing the report.
- **Extension build (Part 2):** ~6 hours — MV3 scaffolding, service worker,
  content script, popup UI, three iterations on the popup visual design.
- **Backend:** ~4 hours — Express wiring, env handling, four service
  wrappers, aggregator, TTL cache, failure paths, dotenv path debugging.
- **Live API integration and testing:** ~2 hours — obtaining keys for three
  providers, verifying end-to-end, debugging abuse.ch's two-provider
  requirement for URLhaus, and confirming PhishTank's registration closure.
- **Documentation:** ~3 hours.
- **Total:** ~17 hours across three days.

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

### What AI assisted with

| Area | AI contribution |
|------|-----------------|
| MV3 boilerplate | Scaffolded `manifest.json`, service worker, content script, popup structure. |
| TypeScript types | Drafted `types.ts`, the runtime type guards in `threat-apis.ts` and `popup.ts`. |
| API integration | Wrote the four service classes (Google Safe Browsing, VirusTotal, PhishTank, URLhaus) from public API docs. |
| Failure handling | Suggested `Promise.allSettled` for the aggregator, `AbortController` for timeouts. |
| Risk scoring | Proposed the weighted-sum model and the verdict thresholds. |
| Popup UI | Iterated on the design — layout, typography, spacing, CSS variable-based state handling. |
| Documentation | Drafted all files in `docs/` from the actual code. |
| Live debugging | Diagnosed the dotenv cwd issue in the npm workspace (fixed by resolving `.env` from the repo root via `fileURLToPath`); diagnosed the URLhaus `403` as an abuse.ch Auth-Key persistence issue. |

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

### What AI produced that was rejected or changed

- **`innerHTML` for the warning overlay.** The AI initially suggested
  building the overlay with template-literal HTML. Rejected and replaced with
  `document.createElement()` + `textContent`. Reasons from threat APIs are
  untrusted strings.
- **API keys in `chrome.storage`.** The AI initially proposed storing API
  keys client-side. Rejected. Keys belong on the backend; the extension
  should never see them.
- **A block-on-dangerous design.** The AI suggested blocking navigation to
  `dangerous` URLs. Rejected for the MVP. Auto-blocking with imperfect
  scoring creates unacceptable false-positive harm; the extension warns
  instead.
- **An unreachable-code demo hack.** A demo variant of `check-url.ts` that
  used `return` inside a `try` block caused TypeScript to complain about
  unreachable code. Replaced with a `DEMO_MODE` boolean flag at the top of
  the file — cleaner, toggles behavior, no dead code.
- **`import 'dotenv/config'`.** The AI's initial suggestion loaded `.env`
  from `process.cwd()`, which resolved to `backend/` under npm workspaces
  instead of the repo root. Replaced with an explicit `fileURLToPath` +
  `path.resolve` path to the repo root.

## What was personally built vs. what AI assisted with

**Personally built:**

- Every architectural decision — the extension/backend split, the caching
  layers, the fail-open policy, the decision to include a backend at all.
- All live testing against real API keys, including obtaining and
  configuring keys for Google Safe Browsing, VirusTotal, and URLhaus.
- Debugging the two-provider requirement for abuse.ch Auth-Keys, which is not
  clearly documented and required trial-and-error on the abuse.ch portal.
- Confirming PhishTank's registration closure at the provider level, rather
  than assuming a code bug.
- The three-iteration popup redesign based on visual feedback.
- Verification of every third-party API contract against its public
  documentation.

**AI-assisted (with human review):**

- First-draft code for every file in `extension/src/` and `backend/src/`.
- All documentation prose, reviewed and corrected for accuracy.
- The risk-scoring weights and thresholds.
- Debugging of the dotenv path issue and the URLhaus 403.

**Nothing was shipped without being read, tested, and understood.**

## Known limitations

1. **PhishTank is unreachable in this build.** The provider has disabled new
   user registration. The code is correct and will work if registration
   reopens. The aggregator handles the `403` gracefully — this is
   demonstrated in the live response captured above.
2. **No real threat data without API keys.** With no keys configured, all
   sources fail and the extension returns "safe" with "No sources responded."
   This is correct fail-open behavior but means the reviewer must supply keys
   to see a live detection.
3. **VirusTotal is slow.** Two seconds of sleep followed by a single report
   poll is a compromise. A production implementation would queue the
   submission and poll asynchronously.
4. **Backend cache is in-memory.** Restarting the backend loses the cache.
   A single-process MVP is fine; production needs Redis or equivalent.
5. **No rate limiting on the backend.** A single client could exhaust the
   shared rate limit for other users. This is the first thing to add before
   any public deployment.
6. **CORS is wide open.** `cors({ origin: true })` is acceptable for
   development against `localhost`. Production must restrict to the
   extension's own origin.
7. **Popup does not live-update.** Opening the popup triggers a scan; leaving
   it open across a navigation does not refresh the verdict. A production
   version would subscribe to `chrome.tabs.onUpdated`.
8. **No settings UI.** Switching sources, adjusting TTL, or configuring the
   backend URL requires editing code and rebuilding.
9. **Chrome's toolbar-badge and popup-corner visuals are not
   extension-controlled.** The orange loading badge during service worker
   startup, and the sharp popup corners on Windows, are Chrome platform
   behaviors, not implementation defects.
10. **No test suite.** The MVP has no automated tests. Risk-scoring and cache
    eviction are the two areas where unit tests would pay for themselves
    immediately.
11. **Weak failure attribution in the UI.** The popup says "No sources
    responded" but does not surface *why* — key missing, network error, or
    provider 4xx/5xx. Backend logs show the detail; the UI does not.

## What would change for production

1. **Backend proxy hardening.** Restrict CORS to the extension origin, add
   rate limiting per client, add request-id logging, add structured logs and
   metrics.
2. **Durable cache.** Replace the in-memory `TtlCache` with Redis. Preserve
   the existing interface so no call sites change.
3. **Asynchronous VirusTotal.** Submit, persist the analysis ID, poll on a
   schedule, and cache the result when it lands. The user sees the current
   best verdict immediately, and the verdict upgrades if a later poll
   surfaces a detection.
4. **Real threat-feed aggregation.** Pull from URLhaus (full DB dump),
   OpenPhish, and additional feeds on a schedule into a local database.
   Query the database in the hot path; keep the external APIs for enrichment
   only. This also removes per-URL rate-limit pressure.
5. **Google Web Risk migration.** Safe Browsing's license is non-commercial.
   Web Risk has a free tier of 100,000 Lookup API calls per month and paid
   tiers above that.
6. **abuse.ch commercial API.** URLhaus's Fair Use policy does not permit
   commercial use. A paid abuse.ch plan removes rate limits and stabilizes
   access.
7. **PhishTank replacement.** If PhishTank's registration does not reopen,
   substitute OpenPhish or additional abuse.ch feeds. The aggregator
   interface makes this a single-file change.
8. **Popup live refresh.** Subscribe to `chrome.tabs.onUpdated` and re-scan
   on navigation when the popup is open.
9. **Settings page.** Let users choose which sources are active, adjust
   sensitivity, and override the backend URL.
10. **Test suite.** Vitest for the extension's `lib/`, Jest or Node's built-in
    test runner for the backend. Priority tests: risk scoring thresholds,
    cache eviction, runtime type guards, and aggregator behavior on partial
    failures.
11. **Extension signing and store listing.** Produce a public-key signed
    `.crx` and prepare the Web Store listing copy, screenshots, and privacy
    disclosures.
12. **Telemetry with consent.** Anonymized counters on verdicts, source
    failures, and user overrides. No URLs, no user identifiers.

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