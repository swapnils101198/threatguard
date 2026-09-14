# Threat Intelligence Sources

ThreatGuard queries three independent threat-intelligence sources. All three
are integrated at the code level in `backend/src/services/`. The system runs
whether or not API keys are present — missing keys result in that source being
skipped, and the request still returns `200` with whatever signals were
available.

## 1. Google Safe Browsing

- **What it provides:** Lookup against Google's continuously updated lists of
  malware, social engineering (phishing), unwanted software, and potentially
  harmful applications.
- **Endpoint used:** `POST https://safebrowsing.googleapis.com/v4/threatMatches:find`
- **Authentication:** API key passed as a query parameter.
- **Cost:** Free for non-commercial use.
- **Commercial use:** Requires the **Web Risk API** instead. Web Risk has a free
  tier of 100,000 Lookup API calls per month; beyond that, usage is billed.
- **Get a key:** https://developers.google.com/safe-browsing/v4/get-started
- **Code:** `backend/src/services/google-safe-browsing.ts`

## 2. VirusTotal

- **What it provides:** Aggregated verdicts from 70+ antivirus engines and URL
  scanners for a submitted URL.
- **Endpoints used:**
  - `POST https://www.virustotal.com/api/v3/urls` — submit URL for analysis
  - `GET  https://www.virustotal.com/api/v3/analyses/{id}` — retrieve the report
- **Authentication:** API key passed in the `x-apikey` header.
- **Cost:** Free public API tier.
- **Rate limits (free tier):** 4 requests per minute, 500 requests per day. The
  public API is not licensed for commercial products or business workflows.
  For commercial use, VirusTotal offers a paid API.
- **Get a key:** https://www.virustotal.com/gui/join-us (free account → API key
  appears under the profile menu).
- **Code:** `backend/src/services/virustotal.ts`

### Note on latency

VirusTotal's submit endpoint returns an analysis ID; the report is only
complete a few seconds later. Our implementation submits, waits 2 seconds, then
polls once for the report. This keeps the request bounded (under ~10 seconds)
without requiring a webhook or a polling loop.

## 3. PhishTank

- **What it provides:** A community-maintained database of verified phishing
  URLs. A URL is only flagged if it is present in the database **and** has been
  verified as valid by PhishTank's moderators.
- **Endpoint used:** `POST https://checkurl.phishtank.com/checkurl/`
- **Authentication:** Optional application key. Without a key, rate limits are
  tighter but the endpoint still works.
- **Cost:** Free, community-driven.
- **Get a key:** https://www.phishtank.com/api_register.php
- **Code:** `backend/src/services/phishtank.ts`

## Why these three

| Source | Strength | Weakness |
|--------|----------|----------|
| Google Safe Browsing | Fast, high-signal, industry-standard malware/phishing lists | Non-commercial license restriction |
| VirusTotal | Broad coverage — 70+ engines, catches things others miss | Slower (submit + poll), strict rate limits |
| PhishTank | Community-curated, verified phishing data, free | Smaller coverage than the others; phishing-only |

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

If a source fails — network error, timeout, HTTP 4xx/5xx, malformed response —
the aggregator (`backend/src/services/aggregator.ts`) catches the rejection
and **does not** include that source in the response. The extension sees fewer
`sourcesResponded` than expected and reports it in the popup footer.

Failure of **all** sources produces an empty signals array. The extension
interprets this as "unknown," returns `score: 0`, `verdict: safe`, and displays
"No sources responded" in the popup. This is a deliberate **fail-open**
decision for a consumer tool — the alternative (fail-closed) would block
legitimate browsing during any backend outage.

The terminal where the backend runs logs each source failure:
