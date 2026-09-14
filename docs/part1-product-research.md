# Part 1 — Product Research: Guard.io

> Research is based exclusively on publicly available information: Guard.io's
> own website (homepage, About, Pricing, For Business, Safe Browsing for AI,
> Guardio Labs, Blog, Newsroom, Contact, Help Center), press coverage of their
> published research, and their public investor announcements. No source code,
> systems, or confidential materials were accessed.

## Product Deep Dive

**What Guard.io is:** A cloud-based personal cybersecurity platform that
protects individuals, families, and businesses from phishing, scams,
malicious sites, identity theft, account hijacking, and AI-driven fraud.
Unlike traditional antivirus products that sit inside the operating system,
Guard.io operates primarily as a lightweight browser extension — supplemented
by mobile apps and a cloud dashboard.

**Product lines (three distinct tiers):**

1. **Consumer** — the flagship. A browser extension (Chrome, Edge) plus
   mobile apps (iOS, Android) protecting individuals and families. The Free
   tier covers manual scans and basic browser protection. Paid tiers
   (Individual, Duo, Family) unlock real-time blocking, data-leak alerts,
   identity monitoring, and 24/7 human support. **Guardio VIP** adds priority
   support and one-on-one calls with a dedicated security expert.
2. **Business** — "Guardio for Business" is a separate SKU with team
   invitations, admin tooling, and enterprise security posture.
3. **Platform / AI** — "Guardio Safe Browsing for Web in the AI Era" is an
   API/SDK product sold to **AI browsers, agents, and generative platforms**.
   It is positioned as a modern replacement for legacy Safe Browsing, with
   sub-30ms verdict latency and the ability to detect bad content "regardless
   of host or service."

**What it does (from the site and Help Center):**

- **Real-time browsing protection.** Scans pages before they open, blocking
  malicious sites, lookalike domains, tech-support scams, and fake search
  results.
- **Phishing & scam filtering.** Filters phishing emails, text messages, and
  scam links before they reach the user.
- **Identity & dark-web monitoring.** Alerts when personal information —
  email addresses, passwords, financial data — is exposed in breaches.
- **Account hijack protection.** Monitors digital footprint to prevent
  account takeovers, especially across social platforms.
- **Malicious extension detection.** Identifies and removes harmful browser
  add-ons.
- **Dangerous download alerts.** Warns on downloads from risky sources.
- **Critical Security Alerts.** A distinct alert class for high-severity
  events surfaced in the dashboard.
- **AI-powered scam protection.** Specifically tuned to counter AI-generated
  and AI-personalized scam content.
- **24/7 expert support.** Human support with sub-one-hour response times.

**Scale (published on the About page):**

- **1.5M+** people protected across logins, devices, and everyday activity
- **825K** threats intercepted daily by the Guardio Research Team
- **320K** malicious sites blocked daily, including brand lookalikes

**Why it has been successful:**

1. **Consumer-first packaging.** The product installs in one click, runs
   quietly in the background, and surfaces only what the user needs to act on.
   Testimonials on the site repeat this theme — "non-intrusive, frictionless"
   is a phrase the company itself uses.
2. **Right problem, right time.** The homepage leads with the current threat
   reality: 1 in 4 Americans fall victim to cyber attacks; $12.5B was lost to
   cybercrime in the USA in a single year; personalized AI scams are on the
   rise. The marketing frames the product around a fear the audience already
   feels.
3. **Proven traction.** Over 100% revenue growth year-over-year for multiple
   consecutive years (per press coverage). On September 3, 2026, the company
   publicly announced a **$40M raise at a $1.1B valuation**, with **Assaf
   Rappaport** (founder of Wiz) joining the investor group.
4. **Distribution advantage.** A browser extension installs in one click
   without IT involvement — a decisive advantage over traditional consumer
   antivirus, which requires system-level installation and elevated
   permissions.
5. **Third pillar — B2B.** The Safe Browsing for AI API/SDK product extends
   Guard.io into AI platform infrastructure, a market adjacent to their
   consumer expertise but with enterprise economics.

**Third-party validation:** Trustpilot "Excellent" rating, **14,359 reviews**,
4.5 stars (surfaced on the Pricing page).

## Tech Stack Review

Based on publicly visible artifacts — extension permissions, published
performance claims, the For Business page, and job postings.

| Layer | Technology (observed or inferred) |
|-------|-----------------------------------|
| **Client** | Browser extension for Chrome and Microsoft Edge, built on Manifest V3 APIs. Companion iOS and Android apps. A web dashboard ("Guardio Dashboard") for account and alert management. |
| **Detection engine** | Explicitly described on the Safe Browsing for AI page: content analysis, DOM inspection, network-call analysis, user-journey tracking, code-execution path analysis, and linked activities — classified as risk in real time. This is behavioral + content analysis, not just URL reputation. |
| **Detection signals** | Two primary signal classes: **Heuristic Scans** (HTML, JavaScript, resources, logic) and **URL Reputation** (domain reputation, abuse patterns, URL risk). |
| **Latency** | Advertised at **10–30 ms typical verdict latency** for the API/SDK product. |
| **AI/ML usage** | AI is used for page context and content interpretation, for detecting benign-looking pages used in fraud chains, for cloaking detection, and for "patient-zero" first-seen threat detection. The company also operates an internal **AI-assisted analysis platform** for browser-extension vulnerability discovery — the tooling used to identify CVE-2026-48294 in the Adobe Acrobat extension. |
| **Threat intelligence** | Proprietary corpus built through continuous crawling, behavioral observation, and the in-house **Guardio Labs** research division. |
| **Backend** | Cloud-hosted real-time detection engine. Specific cloud provider and backend framework are not publicly disclosed. |
| **Distribution** | Chrome Web Store, Microsoft Edge Add-ons, Apple App Store, Google Play. Separate B2B channels for the Safe Browsing for AI product (SDK / API). |

**Caveats:** The specific backend language, framework, and cloud provider are
not publicly documented. Claims above are drawn from the product's own
marketing, extension permissions visible on the Web Store, and the Safe
Browsing for AI comparison page.

**What the Safe Browsing for AI page reveals about the engine** (Guardio's own
comparison against "traditional Safe Browsing solutions"):

| Capability | Guardio's claim | Traditional Safe Browsing |
|-----------|-----------------|---------------------------|
| Page Intelligence | AI interprets page context and content, fused with technical signals | Relies on reputation lists and code signatures |
| Detection Scope | Blocks bad content regardless of host or service | Relies on reputation and URL blocking |
| Threat Spectrum | Phishing, scams, fraud, data theft | Mostly phishing and malware |
| First-seen threats | Blocks first-seen threats using behavior-based analysis | Relies on reputation and user reports |
| Cloaking | Detects cloaking scenarios | Misses sites that serve safe content to scanners |
| Benign content misuse | Detects harmless-looking pages used in fraud chains | Treats benign pages as safe |
| AI readiness | Built for AI agents, GenAI platforms, AI browsers | Generic APIs |

Performance claims on the same page: **400× more blocks** than "leading
solutions" (marketing claim, unverified) and **sub-30ms verdict latency**.

## Team Structure

Publicly available sources indicate:

- **Company size:** The About page states **100+ engineers, creators, and
  researchers**. Broader headcount is on the order of 90–110 employees,
  primarily in Israel.
- **R&D center:** Tel Aviv.
- **Founders:** Amos Peled, Daniel Sirota, and Michael Vainshtein — alumni of
  Israeli Defense Forces technology units and second-time founders (their
  first venture was Arpeely).
- **Founded:** 2018.
- **Funding:** Approximately $167M raised across rounds. Most recently, $40M
  at a **$1.1B valuation** (announced September 3, 2026), with **Assaf
  Rappaport** (founder of Wiz) joining the investor group.
- **Investors:** Tiger Global, Union Tech Ventures, Emerge (visible on the
  About page).
- **Functional makeup:** Engineering, threat research (Guardio Labs), product,
  design, marketing, and support. The company explicitly names a dedicated
  **Guardio Research Team** as the operational arm that intercepts 825K
  threats per day.
- **Guardio Labs** functions as a distinct research division publishing
  vulnerability research and threat intelligence — including the
  **HermeticReader** disclosure (CVE-2026-48294, Adobe Acrobat extension,
  July 2026), the **AccountDumpling** phishing campaign analysis (April 2026),
  and the **GoogleFix** ClickFix evolution report (March 2026).

**Caveat:** Exact headcount and functional distribution fluctuate and are not
published continuously. The 100+ engineer figure is from Guardio's own About
page as of this research.

## Feasibility Assessment

**What is straightforward to rebuild (week-scale, small team):**

The *consumer URL-checking extension* — a Manifest V3 extension that reads
the current URL, checks it against two or more public threat-intelligence
APIs, computes a risk score, and displays a warning — is entirely feasible
for a small team. This is essentially what the Part 2 deliverable does. The
work is API integration, clean warning UX, and disciplined failure handling.

**What is not straightforward:**

1. **The behavioral detection engine.** Guardio's core differentiator is not
   "does this URL appear on a list." It is *"does the behavior of this page
   match the pattern of a threat, even if the URL is brand new?"* That
   requires ML models trained on years of crawled and labeled content,
   running at 10–30 ms latency. This is not replicable by calling third-party
   APIs — the APIs are the *inputs*, not the *product*.
2. **Client-side ML.** Running content and DOM analysis inside the browser
   without degrading the user experience is nontrivial engineering — model
   size, inference budget, and CPU constraints all matter. This is a
   ground-up build, not an integration.
3. **The URL and threat corpus.** 320K malicious sites blocked daily implies
   a continuously updated corpus built through proprietary crawling. No
   public data set replicates this at the required freshness.
4. **Scale infrastructure.** 825K threats intercepted daily at sub-second
   latency, with global coverage across browsers and mobile apps, requires
   serious backend engineering, caching, queue design, and observability.
5. **Email, SMS, and mobile platform integrations.** Deep integration with
   Gmail, iOS Text Message Filter APIs, and mobile OS-level protection
   requires OAuth flows, native code, and long compliance work.
6. **The B2B Safe Browsing for AI product.** Selling an API/SDK to AI
   browsers and agents requires an SLA, an integration team, and a
   commercial sales motion — a completely different business from the
   consumer side.

**Verdict:** A functional consumer URL-checking extension — the Part 2
deliverable — is a **week-scale project for a small team**. A product that
resembles Guard.io's *detection quality* is a **ground-up build** requiring
an ML team, a threat-research team, a platform team, and years of iteration.
The B2B Safe Browsing for AI product pushes the required investment further
still — that's an infrastructure company's roadmap, not a feature.

## Build Plan

If I were leading a team to build a Guard.io-like product — starting from the
extension-plus-backend architecture demonstrated in Part 2 — here is the plan.

### Team

**Phase 1 — MVP (weeks 1–6): the consumer extension.**

- 1 Tech Lead / Backend Engineer — owns the API proxy, key management, rate
  limiting, and cache.
- 1 Frontend / Extension Engineer — owns the MV3 extension, content-script
  overlay, and popup UI.
- 1 Product / UX Designer (part-time) — owns the warning UX, which is the
  single highest-leverage surface for user trust.

**Phase 2 — Production (weeks 7–16): real detection and scale.**

- Add 1 Threat-Intelligence Engineer — curates sources, deduplicates feeds,
  defines scoring.
- Add 1 ML Engineer — begins work on the client-side behavioral model,
  starting with heuristic features and iterating toward trained classifiers.
- Add 1 DevOps / Platform Engineer — deployment, observability, uptime.
- Add 1 QA Engineer — regression on false positives and false negatives,
  which is the hardest class of bug in this product.

**Phase 3 — Multi-product (months 5–12): business tier + platform product.**

- ML team (2–3 engineers) for client-side visual and behavioral phishing
  detection.
- Email / SMS integration team for expanded coverage.
- Platform / API team for the Safe Browsing for AI product — SDK design,
  SLA, documentation.
- Pre-sales / partnerships engineer for B2B integration.
- Support team to meet the "respond within an hour" promise at consumer
  scale.

### Estimated MVP timeline

- **Weeks 1–2:** Extension + backend skeleton; one threat source integrated;
  warning overlay working end to end.
- **Weeks 3–4:** Second and third sources; risk-scoring model; caching at both
  layers; failure handling.
- **Weeks 5–6:** Polish — icon set, popup UI, settings, logging, Web Store
  submission package.

**Realistic MVP: 4–6 weeks for two engineers.** A product with Guard.io's
detection quality and coverage is a **12–18-month roadmap** for a
well-funded team of 10+.

### AI leverage

AI tooling compresses the MVP significantly, and the fact that Guard.io has
already proven the concept removes an entire class of product risk.

- **Scaffolding.** LLM-driven code generation (Claude, Cursor, Copilot)
  handles MV3 boilerplate, message-passing plumbing, and TypeScript typing in
  hours rather than days.
- **API integration.** Given each provider's public API docs, an LLM can
  generate the request shape, response parser, and timeout wrapper in one
  pass. Human review is still required for correctness and rate-limit
  respect.
- **UX iteration.** Rapid A/B of popup and overlay designs is dramatically
  faster with an AI design partner.
- **Testing.** LLMs generate edge-case test data efficiently: malformed
  responses, timeout behavior, empty-signal handling.
- **Where AI does *not* help:** threat intelligence itself. Building a
  proprietary corpus of malicious URLs — and, harder, a behavioral model
  that detects zero-day threats — requires crawling, feedback loops, and
  human research. AI accelerates the code around that corpus; it cannot
  replace the corpus.

**Bottom line:** A working MVP that checks URLs against multiple public
sources is a 2–4 week project for two people with modern AI assistance. A
product that resembles Guard.io in *coverage* is a year-plus project for a
much larger team, and a product that resembles Guard.io in *detection
quality across consumer, business, and platform tiers* is a multi-year
company-scale effort, regardless of AI leverage.