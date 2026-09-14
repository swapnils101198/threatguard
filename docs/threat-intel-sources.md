# Threat Intelligence Sources

ThreatGuard queries three independent threat-intelligence sources. All three
are integrated at the code level in `backend/src/services/`. The system runs
whether or not API keys are present — missing keys result in that source being
skipped, and the request still returns `200` with whatever signals were
available.

Each source below is pinned to a specific API version. The version choice,
and the reason for it, are documented so the integration remains
reproducible as providers evolve.

## 1. Google Safe Browsing

**API version used:** Lookup API **v4**

- **Endpoint:** `POST https://safebrowsing.googleapis.com/v4/threatMatches:find`
- **Authentication:** API key in the URL query string (`?key=...`)
- **Response format:** JSON
- **Cost:** Free for non-commercial use
- **Commercial use:** Requires the **Web Risk API** instead. Web Risk has a
  free tier of 100,000 Lookup API calls per month; above that, usage is
  billed.
- **Get a key:** https://developers.google.com/safe-browsing/v4/get-started
- **Code:** `backend/src/services/google-safe-browsing.ts`

### Why v4 and not v5

Google operates both v4 and v5 in parallel. Both are production-ready, and
there is no announced deprecation for v4. v5 introduces two meaningful
capabilities:

1. **Data freshness / Real-Time Mode.** Instead of periodically downloading
   threat lists, clients maintain a small local "Global Cache" of likely-
   benign sites. A URL absent from the cache triggers a server-side check.
   Google's stated motivation is that local-list approaches have become less
   effective as threat volume and velocity have increased — the shift closes
   a real-time gap that has traditionally left Safe Browsing clients behind
   newly emerging threats.
2. **IP privacy via Oblivious HTTP.** The companion Safe Browsing Oblivious
   HTTP Gateway API routes requests through a non-colluding third-party
   relay, so Google never sees the end user's IP address. This is opt-in.

For this MVP, we use **v4**, for three concrete reasons:

1. **Simplicity.** `threatMatches:find` accepts a POST body containing an
   array of raw URLs and returns a `matches` array. It is the shortest path
   from "URL" to "verdict." v5's `urls:search` introduces a required
   `cacheDuration` contract the client **must** honor — the server returns a
   cache duration on every response, including clean responses, and the
   client must apply it. Skipping that would be a correctness bug.
2. **Endpoint stability.** At the time of writing, `urls:search` is served
   under `v5alpha1`. `hashes:search` is on stable `v5`. We prefer to depend
   on a stable endpoint.
3. **Privacy posture.** v4 sends the raw URL in the request body. For a
   consumer URL-checking tool, the URL is already going to be sent to
   VirusTotal and PhishTank as well, so v4 does not degrade the overall
   privacy stance of the product. A future version that specifically
   prioritizes URL confidentiality would move to v5 with the Oblivious HTTP
   Gateway.

Both methods available in v4 and v5 — `urls.search` (raw URL) and
`hashes.search` (hash-prefix only) — are viable. We use the URL-based method
because the hashing path requires canonicalization and hash-prefix logic
whose complexity is not justified by the current privacy model.

## 2. VirusTotal

**API version used:** Public API **v3**

- **Endpoints:**
  - `POST https://www.virustotal.com/api/v3/urls` — submit URL for analysis
  - `GET  https://www.virustotal.com/api/v3/analyses/{id}` — retrieve the report
- **Authentication:** API key in the `x-apikey` request header
- **Response format:** JSON
- **Cost:** Free Public API tier
- **Get a key:** https://www.virustotal.com/gui/join-us (free account → API
  key appears under the profile menu)
- **Code:** `backend/src/services/virustotal.ts`

### Public vs Premium

VirusTotal distinguishes between a **Public API** and a **Premium API**:

- The **Public API** is free, requires only community account registration,
  and is rate-limited to **500 requests per day** and **4 requests per
  minute**. It **must not** be used in commercial products or services, or
  in business workflows that do not contribute new files back to the
  platform. Registering multiple accounts to work around the limits is
  explicitly prohibited.
- The **Premium API** removes rate limits, adds richer threat context
  (advanced threat hunting, malware discovery, YARA notifications, retrohunt
  jobs), reverse-search capabilities, and is backed by a formal SLA.

This project uses the **Public API**. It is appropriate for a non-commercial
assignment and a single-user local deployment. Any production rollout would
require a Premium license — see `submission-notes.md`.

### Note on latency

VirusTotal's submit endpoint returns an analysis ID immediately, but the
aggregated verdict from all engines is only populated a few seconds later.
Our implementation:

1. `POST /urls` — submit
2. Wait 2 seconds
3. `GET /analyses/{id}` — read the aggregated stats
4. Flag the URL if `malicious + suspicious > 0`

This keeps the request bounded (under ~10 seconds) without requiring a
webhook, job queue, or multi-poll loop. A production implementation would
persist the analysis ID, poll asynchronously, and cache the final verdict —
see `submission-notes.md`.

## 3. PhishTank

**API version used:** `checkurl/` endpoint (current)

- **Endpoint:** `POST https://checkurl.phishtank.com/checkurl/`
- **Authentication:** Optional application key (`app_key` parameter). Without
  a key, rate limits are tighter but the endpoint still works.
- **Request parameters:**
  - `url` — the URL to check (URL-encoded or base64-encoded)
  - `format` — response format: `xml` (default), `php`, or `json`
  - `app_key` — optional application key
- **Response format:** JSON (we specify `format=json`)
- **User-Agent:** PhishTank explicitly requires a descriptive User-Agent.
  Generic or blank User-Agents are rate-limited more aggressively or pushed
  to additional security checks. Our client sends
  `User-Agent: ThreatGuard/0.1.0`.
- **Cost:** Free, community-driven
- **Get a key:** https://www.phishtank.com/api_register.php
- **Code:** `backend/src/services/phishtank.ts`

### How PhishTank reports a match

A URL is only counted as flagged when **both** of the following are true in
the response:

- `in_database: true` — the URL exists in PhishTank's database
- `valid: true` — PhishTank has verified it as an active phishing URL

A URL that is present but not yet verified is **not** counted as a threat.
This is deliberate — PhishTank contains both user submissions and moderator-
verified entries, and only the verified set is reliable.

### Rate limits

PhishTank enforces rate limits and returns HTTP **509** ("Bandwidth Limit
Exceeded") when they are hit. Response headers identify the current window:

- `X-Request-Limit-Interval` — time window, e.g. `300 Seconds`
- `X-Request-Limit` — max requests allowed in that window
- `X-Request-Count` — requests already consumed in that window

Our client treats any non-200 response (including 509) as a source failure
and lets the aggregator handle it. There is no special-case for 509 in the
MVP — it is handled identically to a network error or a 5xx, which is the
correct behavior for fail-open.

For applications that repeatedly hit the limit, PhishTank recommends
downloading a local copy of the database periodically rather than querying
per-URL. Our 30-day plan moves in that direction — see `submission-notes.md`.

## Why these three

| Source | Strength | Weakness |
|--------|----------|----------|
| Google Safe Browsing | Fast, high-signal, industry-standard malware / phishing lists | Non-commercial license restriction; URL sent in plaintext to Google |
| VirusTotal | Broad coverage — 70+ engines; catches things Google's lists miss | Slow (submit + poll); strict rate limits; Public API is non-commercial |
| PhishTank | Community-curated, moderator-verified phishing URLs; free | Smaller coverage than the others; phishing-only; rate-limited |

Running all three gives **coverage diversity** (malware, phishing, unwanted
software) and **failure tolerance** — if one source is down or rate-limited,
the other two still produce a verdict.

## How signals are combined

The risk scorer (`extension/src/lib/risk-scorer.ts`) assigns each source a
weight and sums the weights of every source that flagged the URL:

| Source | Weight when flagged |
|--------|---------------------|
| Google Safe Browsing | +50 |
| VirusTotal | +40 |
| PhishTank | +30 |

Score is capped at 100 and bucketed into a verdict:

| Score | Verdict |
|-------|---------|
| 0 – 19 | `safe` |
| 20 – 49 | `suspicious` |
| 50 – 100 | `dangerous` |

A single strong source (Google Safe Browsing) can trigger `dangerous` on its
own. Weaker sources (PhishTank) require corroboration or a distinct signal to
push the score higher.

## Failure handling

If a source fails — network error, timeout, HTTP 4xx/5xx (including PhishTank's
509), or malformed response — the aggregator
(`backend/src/services/aggregator.ts`) catches the rejection and **does not**
include that source in the response. The extension sees fewer
`sourcesResponded` than expected and reports it in the popup footer.

Failure of **all** sources produces an empty signals array. The extension
interprets this as "unknown," returns `score: 0`, `verdict: safe`, and
displays "No sources responded" in the popup. This is a deliberate
**fail-open** decision for a consumer tool — the alternative (fail-closed)
would block legitimate browsing during any backend outage.

The terminal where the backend runs logs each source failure:

```
[aggregator] google-safe-browsing failed: Safe Browsing responded 403
[aggregator] virustotal failed: VirusTotal submit responded 401
[aggregator] phishtank failed: PhishTank responded 509
```

This is the visible evidence of the failure-handling requirement.

## Version summary

For quick reference, here is the API version pinned per source, and the
commercial-use posture:

| Source | API version | Free tier? | Commercial use OK? |
|--------|-------------|------------|---------------------|
| Google Safe Browsing | Lookup API v4 | Yes | No — requires Web Risk |
| VirusTotal | Public API v3 | Yes | No — requires Premium API |
| PhishTank | current `checkurl/` | Yes | Yes (community source) |

The two commercial restrictions are the reason the project documents a
production migration path in `submission-notes.md`.