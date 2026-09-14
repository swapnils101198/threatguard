# Submission Notes

## Approximate time spent

- **Product research (Part 1):** ~2 hours of reading, cross-checking public
  sources, and writing the report.
- **Extension build (Part 2):** ~6 hours — MV3 scaffolding, service worker,
  content script, popup UI, three iterations on the popup visual design.
- **Backend:** ~3 hours — Express wiring, env handling, three service
  wrappers, aggregator, TTL cache, failure paths.
- **Documentation:** ~2 hours.
- **Total:** ~13 hours across two days.

## AI-Native development

### Tools used

- **Claude** — used throughout as a coding and design partner. Architecture
  discussion, MV3 lifecycle edge cases, TypeScript typing, CSS iteration, and
  documentation drafting.
- **No Cursor, Copilot, or Codex were used** in this build.

### What AI assisted with

| Area | AI contribution |
|------|-----------------|
| MV3 boilerplate | Scaffolded `manifest.json`, service worker, content script, popup structure. |
| TypeScript types | Drafted `types.ts`, the runtime type guards in `threat-apis.ts` and `popup.ts`. |
| API integration | Wrote the three service classes (Google Safe Browsing, VirusTotal, PhishTank) from public API docs. |
| Failure handling | Suggested `Promise.allSettled` for the aggregator, `AbortController` for timeouts. |
| Risk scoring | Proposed the weighted-sum model and the verdict thresholds. |
| Popup UI | Iterated on the design — layout, typography, spacing, CSS variable-based state handling. |
| Documentation | Drafted all files in `docs/` from the actual code. |

### How the work was structured

Each component was described to the AI as a discrete task with a clear
contract:

1. **Input:** what data comes in.
2. **Output:** what data goes out.
3. **Constraints:** timeout budget, permissions available, failure behavior.
4. **Anti-requirements:** what must *not* happen (e.g. "never use innerHTML on
   external strings").

The AI then produced a first draft, which I reviewed line by line. Reviews
focused on three questions: *Does this respect the MV3 lifecycle? Is this
safe against untrusted input? Is this the simplest thing that works?*

### How I reviewed and validated AI output

- **Read every line** before saving. No file was pasted in without being
  understood.
- **Type-checked** with `tsc` in both workspaces after each batch of changes.
- **Runtime-tested** in Chrome with `chrome://extensions` open in a second tab
  so any errors surface immediately.
- **Toggled the failure path deliberately.** Stopping the backend, removing
  API keys, and pointing at unreachable endpoints — each was tested to confirm
  the extension falls back gracefully rather than hanging.
- **Checked the DOM safety claim.** Grepped the codebase for `innerHTML` —
  nothing. Every external string goes through `textContent`.

### What AI produced that I rejected or changed

- **`innerHTML` for the warning overlay.** The AI initially suggested
  building the overlay with template-literal HTML. I rejected it and replaced
  with `document.createElement()` + `textContent`. Reasons from threat APIs
  are untrusted strings.
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

## What I personally built vs. what AI assisted with

**Personally built:**
- Every architectural decision — the extension/backend split, the caching
  layers, the fail-open policy, the decision to include a backend at all.
- All testing, including deliberately breaking the system to observe the
  failure paths.
- The three-iteration popup redesign based on visual feedback.
- Verification of every third-party API contract against its public
  documentation.

**AI-assisted (with human review):**
- First-draft code for every file in `extension/src/` and `backend/src/`.
- All documentation prose, reviewed and corrected for accuracy.
- The risk-scoring weights and thresholds.

**Nothing was shipped without being read, tested, and understood.**

## Known limitations

1. **No real threat data without API keys.** With no keys configured, all
   three sources fail and the extension returns "safe" with "No sources
   responded." This is correct fail-open behavior but means the reviewer
   must supply keys to see a live detection.
2. **VirusTotal is slow.** Two seconds of sleep followed by a single report
   poll is a compromise. A production implementation would queue the
   submission and poll asynchronously.
3. **Backend cache is in-memory.** Restarting the backend loses the cache.
   A single-process MVP is fine; production needs Redis or equivalent.
4. **No rate limiting on the backend.** A single client could exhaust the
   shared rate limit for other users. This is the first thing to add before
   any public deployment.
5. **CORS is wide open.** `cors({ origin: true })` is acceptable for
   development against `localhost`. Production must restrict to the
   extension's own origin.
6. **Popup does not live-update.** Opening the popup triggers a scan; leaving
   it open across a navigation does not refresh the verdict. A production
   version would subscribe to `chrome.tabs.onUpdated`.
7. **No settings UI.** Switching sources, adjusting TTL, or configuring the
   backend URL requires editing code and rebuilding.
8. **Chrome's toolbar-badge and popup-corner visuals are not
   extension-controlled.** The orange loading badge during service worker
   startup, and the sharp popup corners on Windows, are Chrome platform
   behaviors, not implementation defects.
9. **No test suite.** The MVP has no automated tests. Risk-scoring and cache
   eviction are the two areas where unit tests would pay for themselves
   immediately.
10. **Weak failure attribution in the UI.** The popup says "No sources
    responded" but does not surface *why* — key missing, network error, or
    provider 4xx/5xx. Backend logs show the detail; the UI does not.

## What I would change for production

1. **Backend proxy hardening.** Restrict CORS to the extension origin, add
   rate limiting per client, add request-id logging, add structured logs and
   metrics.
2. **Durable cache.** Replace the in-memory `TtlCache` with Redis. Preserve
   the existing interface so no call sites change.
3. **Asynchronous VirusTotal.** Submit, persist the analysis ID, poll on a
   schedule, and cache the result when it lands. The user sees the current
   best verdict immediately, and the verdict upgrades if a later poll
   surfaces a detection.
4. **Real threat-feed aggregation.** Pull from OpenPhish and URLHaus on a
   schedule into a local database. Query the database in the hot path; keep
   the external APIs for enrichment only.
5. **Google Web Risk migration.** Safe Browsing's license is non-commercial.
   Web Risk has a free tier of 100,000 Lookup API calls per month and paid
   tiers above that.
6. **Popup live refresh.** Subscribe to `chrome.tabs.onUpdated` and re-scan
   on navigation when the popup is open.
7. **Settings page.** Let users choose which sources are active, adjust
   sensitivity, and override the backend URL.
8. **Test suite.** Vitest for the extension's `lib/`, Jest or Node's built-in
   test runner for the backend.
9. **Extension signing and store listing.** Produce a public-key signed
   `.crx` and prepare the Web Store listing copy, screenshots, and privacy
   disclosures.
10. **Telemetry with consent.** Anonymized counters on verdicts, source
    failures, and user overrides. No URLs, no user identifiers.

## What I would build next if I had 30 days

**Week 1 — Production-grade backend.**
- Redis cache, per-client rate limits, CORS locked down, structured logs,
  basic dashboards.

**Week 2 — Deeper threat coverage.**
- Add OpenPhish and URLHaus as cached local sources.
- Move Google Safe Browsing to Web Risk (free tier).
- Asynchronous VirusTotal submission and polling.

**Week 3 — UX and trust.**
- Popup live-refresh on navigation.
- Settings page: choose sources, sensitivity, backend URL.
- Reason-line detail per source, not just a single weighted number.
- User override feedback: "This is safe" / "This is dangerous" feedback
  channel that is stored locally and (with consent) contributes to scoring.

**Week 4 — Hardening and release.**
- Test suite for scoring, cache eviction, and the runtime type guards.
- Extension signed build, Web Store listing assets, privacy policy.
- Documentation for a public beta cohort: setup, troubleshooting,
  supported sources, and expected false-positive rates.

**Deliverable at day 30:** a signed extension that checks against five
sources with proper caching, a hardened backend, user-controlled sensitivity,
and a documented privacy posture — installable by an external reviewer
without needing to edit any code.