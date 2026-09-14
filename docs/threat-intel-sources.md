# Threat Intelligence Sources

ThreatGuard queries **four** independent threat-intelligence sources. All four
are integrated at the code level in `backend/src/services/`. The system runs
whether or not API keys are present — missing or rejected keys result in that
source being skipped, and the request still returns `200` with whatever
signals were available.

Each source below is pinned to a specific API version. The version choice,
and the reason for it, are documented so the integration remains
reproducible as providers evolve.

**Status at time of submission:**

| Source | Status | Reason |
|--------|--------|--------|
| Google Safe Browsing | ✅ Live | API key configured and verified |
| VirusTotal | ✅ Live | API key configured and verified |
| URLhaus | ✅ Live | Auth-Key configured and verified |
| PhishTank | ⚠️ Unreachable | Provider has disabled new-user registration; the endpoint returns `403` for our requests |

The PhishTank failure is a real-world demonstration of the aggregator's
failure-handling path — see the "Failure handling" section below.

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
   consumer URL-checking tool, the URL is also sent to VirusTotal, URLhaus,
   and PhishTank, so v4 does not degrade the overall privacy stance of the
   product. A future version that specifically prioritizes URL
   confidentiality would move to v5 with the Oblivious HTTP Gateway.

### Verification

Against Google's own test URL, `http://testsafebrowsing.appspot.com/s/malware.html`,
the API returns a `MALWARE` match — confirmed in the live response captured in
`docs/submission-notes.md`.

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

## 3. URLhaus (abuse.ch)

**API version used:** URLhaus Community API **v1**

- **Endpoint:** `POST https://urlhaus-api.abuse.ch/v1/url/`
- **Authentication:** Auth-Key sent in the `Auth-Key` request header
- **Response format:** JSON
- **Cost:** Free, under abuse.ch's Fair Use policy. Commercial use requires
  the enhanced abuse.ch commercial API.
- **Get a key:** https://auth.abuse.ch/ — sign in with at least two identity
  providers (Google + GitHub, for example), then generate an Auth-Key on the
  profile page.
- **Code:** `backend/src/services/urlhaus.ts`

### What URLhaus provides

URLhaus is operated by abuse.ch and Spamhaus. It tracks URLs actively
distributing malware — executables, droppers, malicious scripts, and payload
delivery endpoints. It is distinct from phishing lists in that its focus is
**malware distribution**, not credential theft or social engineering. This
complements the other three sources:

- Google Safe Browsing covers malware AND social engineering broadly.
- VirusTotal aggregates many engines and catches things Google's lists miss.
- URLhaus has fresher data on active malware-distribution campaigns.

### Response contract

URLhaus returns a `query_status` field:

- `is_listed` — the URL is a known malware-distribution URL (flagged)
- `not_listed` — URLhaus checked and the URL is not present (clean)
- `no_results` — URLhaus has no record (clean)
- `invalid_url` — the URL failed URLhaus's own validation (treated as clean)

We flag only on `is_listed`. Every other status is treated as a clean
response — URLhaus's API returns a distinct status for "unknown" versus
"malicious", and we honor that distinction.

### Auth-Key requirements

abuse.ch requires an Auth-Key on **every** URLhaus API request. Anonymous
requests return `401 Unauthorized` or, in our experience, `403 Forbidden`.
The key is issued at `auth.abuse.ch` and must be included in the `Auth-Key`
header (not a query parameter, and not as a Bearer token).

To generate a key, your abuse.ch account must have **at least two
authentication providers** linked. This is a recovery-method requirement
enforced by abuse.ch. Google + GitHub is the fastest combination.

### Fair Use

abuse.ch enforces Fair Use. Accounts exceeding reasonable query volume are
temporarily limited for up to 72 hours; repeated abuse leads to long-term
restrictions. For a consumer URL-checking extension at MVP volumes, this is
not a concern — but a production deployment would need either a paid
commercial plan or a local database mirror.

## 4. PhishTank

**Status: provider has disabled new-user registration.** The registration
page currently displays *"New user registration temporarily disabled"* and
repeated attempts trigger an IP-level block. The integration code remains in
`backend/src/services/phishtank.ts` and is functionally correct.

**API version used:** `checkurl/` endpoint (current)

- **Endpoint:** `POST https://checkurl.phishtank.com/checkurl/`
- **Authentication:** Optional application key (`app_key` parameter). Without
  a key, rate limits are tighter but the endpoint still works — except in our
  case, where the endpoint returns `403` regardless.
- **Request parameters:**
  - `url` — the URL to check (URL-encoded or base64-encoded)
  - `format` — response format: `xml` (default), `php`, or `json`
  - `app_key` — optional application key
- **Response format:** JSON (we specify `format=json`)
- **User-Agent:** PhishTank explicitly requires a descriptive User-Agent.
  Our client sends `User-Agent: ThreatGuard/0.1.0`.
- **Cost:** Free, community-driven
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

Our client treats any non-200 response (including 403 and 509) as a source
failure and lets the aggregator handle it. There is no special case — a
failed PhishTank is handled identically to a network error, which is the
correct behavior for fail-open.

### Replacement plan

If PhishTank reopens registration, no code change is required — add a key to
`.env` and the source resumes working. If it does not reopen, the 30-day plan
in `submission-notes.md` proposes integrating additional free sources
(OpenPhish, additional abuse.ch feeds) to maintain four-source coverage.

## Why these four

| Source | Strength | Weakness |
|--------|----------|----------|
| Google Safe Browsing | Fast, high-signal, industry-standard malware / phishing lists | Non-commercial license restriction; URL sent in plaintext to Google |
| VirusTotal | Broad coverage — 70+ engines; catches things Google's lists miss | Slow (submit + poll); strict rate limits; Public API is non-commercial |
| URLhaus | Live malware-distribution feed; fresher than static lists | Auth-Key required; abuse.ch Fair Use limits |
| PhishTank | Community-curated, moderator-verified phishing URLs; free | Registration currently disabled; smaller coverage; phishing-only |

Running all four gives **coverage diversity** (malware, malware distribution,
phishing, multi-engine aggregation) and **failure tolerance** — if one source
is down or rate-limited, the other three still produce a verdict.

## How signals are combined

The risk scorer (`extension/src/lib/risk-scorer.ts`) assigns each source a
weight and sums the weights of every source that flagged the URL:

| Source | Weight when flagged |
|--------|---------------------|
| Google Safe Browsing | +50 |
| VirusTotal | +40 |
| URLhaus | +35 |
| PhishTank | +30 |

Score is capped at 100 and bucketed into a verdict:

| Score | Verdict |
|-------|---------|
| 0 – 19 | `safe` |
| 20 – 49 | `suspicious` |
| 50 – 100 | `dangerous` |

A single strong source (Google Safe Browsing) can trigger `dangerous` on its
own. Weaker sources require corroboration or a distinct signal to push the
score higher.

**Rationale for the weights:** Google Safe Browsing's verdict is the strongest
single signal because its lists are curated by Google at internet scale.
VirusTotal is weighted slightly lower because its verdict aggregates many
engines of varying quality — a detection there is meaningful but not as
authoritative as a Google listing. URLhaus's feed is malware-focused and
specific (few false positives), so it sits just below VirusTotal. PhishTank's
phishing-only scope and smaller dataset justify the lowest weight.

## Failure handling

If a source fails — network error, timeout, HTTP 4xx/5xx (including
PhishTank's 403 and 509), or malformed response — the aggregator
(`backend/src/services/aggregator.ts`) catches the rejection and **does not**
include that source in the response. The extension sees fewer
`sourcesResponded` than expected and reports it in the popup footer.

Failure of **all** sources produces an empty signals array. The extension
interprets this as "unknown," returns `score: 0`, `verdict: safe`, and
displays "No sources responded" in the popup. This is a deliberate
**fail-open** decision for a consumer tool — the alternative (fail-closed)
would block legitimate browsing during any backend outage.

The terminal where the backend runs logs each source failure. Real output
from the current build:

```
[aggregator] phishtank failed: PhishTank responded 403
```

Only one failure line — Google Safe Browsing, VirusTotal, and URLhaus all
responded normally. The request returned `200` with the three successful
signals. This is the visible evidence of the failure-handling requirement.

## Version summary

For quick reference, here is the API version pinned per source, and the
commercial-use posture:

| Source | API version | Free tier? | Commercial use OK? |
|--------|-------------|------------|---------------------|
| Google Safe Browsing | Lookup API v4 | Yes | No — requires Web Risk |
| VirusTotal | Public API v3 | Yes | No — requires Premium API |
| URLhaus | Community API v1 | Yes (Fair Use) | No — requires commercial API |
| PhishTank | current `checkurl/` | Yes | Yes (community source) |

The three commercial restrictions are the reason the project documents a
production migration path in `submission-notes.md`.