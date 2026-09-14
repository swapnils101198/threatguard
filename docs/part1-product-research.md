# Part 1 — Product Research: Guard.io

> Research is based exclusively on publicly available information: Guard.io's
> own website (Home, About, Pricing, For Business, Safe Browsing for AI,
> Guardio Labs, Blog, Newsroom, Contact, Help Center, Careers), a signed
> letter from the CEO published on the Guard.io blog, Guardio's official
> LinkedIn company page, the Chrome Web Store listing, and Guardio's own
> press coverage. No source code, systems, or confidential materials were
> accessed.

## Product Deep Dive

**What Guard.io is:** A cloud-based personal cybersecurity platform that
protects individuals, families, and businesses from phishing, scams,
malicious sites, identity theft, account hijacking, and AI-driven fraud.
Unlike traditional antivirus products that sit inside the operating system,
Guard.io operates primarily as a lightweight browser extension — supplemented
by mobile apps and a cloud dashboard. The company's stated ambition is to
protect the **person**, not the device: to guard the accounts, communications,
and judgment moments where modern scams actually reach users. Guardio's own
positioning emphasizes **accounts and devices** as much as browsing — email,
social, and financial logins, plus the browsers and phones those logins are
used from.

**Mission, in the CEO's own words.** In a letter published on Guard.io's blog
on September 3, 2026, co-founder and CEO **Amos Peled** frames the company's
thesis:

> "Scammers stopped hacking computers a long time ago. They hack people. And
> AI made it cheap. […] The old tools protect your device. But you are not a
> device. […] These attacks don't target your computer. They target your
> judgment, in a tired moment, on whatever screen is in your hand."

That reframing — **protect the person, not the device** — is the single
clearest statement of what makes Guard.io's product different.

**Product lines (three distinct tiers):**

1. **Consumer** — the flagship. A browser extension (Chrome, Edge) plus
   mobile apps (iOS, Android) protecting individuals and families. Paid plans
   are priced per member with a discount for larger groups. **Guardio VIP**
   adds priority support and one-on-one calls with a dedicated security
   expert.
2. **Business** — "Guardio for Business" is a separate SKU with team
   invitations, admin tooling, and enterprise security posture.
3. **Platform / AI** — "Guardio Safe Browsing for Web in the AI Era" is an
   API/SDK product sold to **AI browsers, agents, and generative platforms**.
   It is positioned as a modern replacement for legacy Safe Browsing, with
   10–30 ms verdict latency and the ability to detect bad content
   "regardless of host or service."

**Consumer tier details (from the Pricing page):**

| Plan | Members | Annual price | Monthly-equivalent | What's included |
|------|---------|--------------|---------------------|-----------------|
| **Free** | 1 | $0 | $0 | Basic browser protection; manual security scan |
| **Individual** | 1 | $119.88/yr | ~$9.99/mo | Scam & phishing protection; data-leak alerts; account security insights; 24/7 support; covers mobile and desktop |
| **Duo** | 2 | $183.90/yr | ~$7.67/member | Same as Individual, for two people |
| **Family** | 5 | $279.90/yr | ~$4.67/member | Same as Individual, for up to five people |
| **VIP** | 1 | (see Pricing page) | (see Pricing page) | Priority support; one-on-one calls with a dedicated security expert; all Premium features |

Per-member pricing drops as the plan scales (from ~$9.99 for Individual to
~$4.67 for a five-person Family). Every paid plan includes the same
protection feature set — only the number of covered people changes.

**Device coverage (from the Pricing FAQ):** Each plan covers phones, tablets,
laptops, and desktops. On desktop, coverage runs through the Guardio browser
extension for Chrome or Microsoft Edge. On mobile and tablet, it runs through
the Guardio app from the App Store or Google Play. Cross-device protection
stays active regardless of which device the user is on.

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
- **AI-powered scam protection.** Uses predictive technology to detect and
  block targeted scams that leverage public data and artificial intelligence.
- **24/7 expert support.** Human support with sub-one-hour response times.

**Support and trust posture (from the Help Center):**

Guardio's Help Center is organized less like a manual and more like a
consumer security education library. Beyond how-to guides for the extension
and mobile app, it includes a dedicated **Online Security 101** category
(Zelle scams, phone scams, 2FA explainers, "high-risk scam" definitions),
a **"Fake Guardio Phone Numbers"** advisory warning users about scam support
numbers impersonating the company, and an explicit disclaimer that Guardio
is **not affiliated** with third-party services (JustAnswer, Unsubby,
Xpendy, or others) that claim to manage Guardio subscriptions. The
implication for competitive research: Guard.io treats post-install user
education as part of the product, not a marketing afterthought. That posture
— proactively publishing scam patterns and impersonation warnings — is a
trust signal that would be expensive for a competitor to replicate without
a similar research capability behind it.

**Scale (published on Guardio's About page, in the CEO's letter, and on the
company's LinkedIn page):**

- **1.5M+** people protected across logins, devices, and everyday activity
  (About page).
- **1 million paying customers** (CEO's letter, September 2026) — up from
  roughly half that a year earlier.
- **$150M ARR**, stated publicly by Guardio in its September 2026 funding
  announcement.
- **Revenue more than doubled every year for four consecutive years** —
  the company's own characterization, which is a stronger claim than the
  generic "over 100% growth" phrasing used in third-party coverage.
- **825K** threats intercepted daily by the Guardio Research Team (About
  page) — from shady redirects to sophisticated AI-crafted deception.
- **320K** malicious sites blocked each day, including lookalikes of
  trusted brands (About page).
- **700,000 Chrome users** on the Chrome Web Store listing — a
  Google-verified lower bound on the installed user base, distinct from
  Guardio's own "1.5M+ protected" claim.

**Why it has been successful:**

1. **Consumer-first packaging.** The product installs in one click, runs
   quietly in the background, and surfaces only what the user needs to act
   on. Testimonials on the site repeat this theme — "non-intrusive,
   frictionless" is a phrase the company itself uses.
2. **Right problem, right time.** The homepage leads with the current threat
   reality: 1 in 4 Americans fall victim to cyber attacks; $12.5B was lost to
   cybercrime in the USA in a single year; personalized AI scams are on the
   rise. The CEO's letter sharpens the same message with two additional
   data points: **three out of four U.S. adults faced a scam or attack last
   year**, and **reported losses hit a record $20.9 billion**.
3. **Proven traction, expressed in one sentence.** In its own September 2026
   announcement, Guardio stated: *"Guardio just reached a $1.1B valuation,
   raised $40M, crossed 1 million paying customers, and hit $150M in ARR,
   after four straight years of more than doubling our revenue every year."*
   Every clause in that sentence is a falsifiable, verifiable business metric.
4. **Speed.** Founded in 2018 and valued at **$1.1B in September 2026** —
   roughly eight years from founding to unicorn valuation in the consumer
   security market, a segment that has traditionally been dominated by
   legacy incumbents.
5. **Distribution advantage.** A browser extension installs in one click
   without IT involvement — a decisive advantage over traditional consumer
   antivirus, which requires system-level installation and elevated
   permissions.
6. **Third pillar — B2B.** The Safe Browsing for AI API/SDK product extends
   Guardio into AI platform infrastructure, a market adjacent to their
   consumer expertise but with enterprise economics. **Lovable**, an
   AI-powered app-building platform, is a publicly documented integration
   that Guardio and Lovable both announced on LinkedIn (676 likes on
   Lovable's post alone).
7. **Users describe it as background protection, not a tool they operate.**
   Public store reviews repeatedly describe the same experience: *"I feel
   safe shopping knowing that Guardio is in the background protecting my
   personal information,"* *"I sleep better at night,"* *"Subtle,
   non-invasive, has your back without trying to climb it."* The product's
   value proposition — protection that runs without user action — is the
   same thing users spontaneously praise. The design and the marketing are
   aligned.

**Third-party validation:** Trustpilot "Excellent" rating, **14,359 reviews**,
4.5 stars. The Chrome Web Store listing shows **700,000 Chrome users** and
**1.3K ratings** at 4.5 stars, and carries both a **Featured** badge and an
**Established Publisher** badge (see "Chrome Web Store presence" and
"Verification signals" below).

## Tech Stack Review

Based on publicly visible artifacts — extension permissions, published
performance claims, the For Business page, and job postings.

| Layer | Technology (observed or inferred) |
|-------|-----------------------------------|
| **Client** | Browser extension for Chrome and Microsoft Edge, built on Manifest V3 APIs. Companion iOS and Android apps. A web dashboard ("Guardio Dashboard") for account and alert management. |
| **Detection engine** | Explicitly described on the Safe Browsing for AI page: Guardio inspects content, DOM, network calls, user journeys, code execution paths, and linked activities to classify risk in real time. Behavioral + content analysis, not just URL reputation. |
| **Detection signals** | Two primary signal classes: **Heuristic Scans** (HTML, JS, resources, and logic) and **URL Reputation** (domain reputation, abuse patterns, URL risk). |
| **Latency** | Advertised at **10–30 ms typical verdict latency** for the API/SDK product. |
| **Privacy posture** | "Anonymous by design" — stated on the Safe Browsing for AI page as a design property, not an add-on. |
| **AI/ML usage** | AI is used for page context and content interpretation, for detecting benign-looking pages used in fraud chains, for cloaking detection, and for "patient-zero" first-seen threat detection. Guardio Labs also runs an internal **agent-based security research toolkit** with tooling names like "Shaked Biner and the fleet of agents he's built" (from a public LinkedIn post by Nati Tal, Head of Guardio Labs) — an AI-assisted analysis platform used for browser-extension vulnerability discovery. |
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
| Page Intelligence | AI interprets page context and content, fused with technical signals | Reputation lists and code signatures |
| Detection Scope | Blocks bad content regardless of host or service | Reputation and URL blocking |
| Threat Spectrum | Phishing, scams, fraud, data theft, and more | Mostly phishing and malware |
| Patient-Zero Protection | Blocks first-seen threats using behavior-based analysis | Relies on reputation and user reports |
| Cloaking Detection | Detects cloaking scenarios | Misses sites that serve safe content to scanners |
| Benign Content Misuse | Spots harmless-looking pages used in fraud chains | Treats benign pages as safe |
| AI Readiness | Built for AI agents, GenAI platforms, AI browsers | Generic APIs |

Published performance claims on the same page: **400× more blocks** than
"leading solutions" (marketing claim, unverified), **sub-30 ms verdict
latency**, and availability as **SDK or API**.

### Platform-tier use cases (from the Safe Browsing for AI page)

The Platform/AI product is positioned for four distinct audiences:

1. **AI browsers** — replace legacy Safe Browsing; protect human and automated
   browsing; block phishing, scams, fraud, and data exfiltration; privacy-first
   and anonymous by design; zero performance impact.
2. **AI agents** — protect agents from phishing and scams; prevent them from
   ingesting or sharing data with fraudulent sites; no product slowdown;
   available via API or SDK.
3. **GenAI platforms** — stop abuse at the moment of generation; block outputs
   that may ship malware or violate platform policy in real time; keep the
   platform clean with takedowns and malicious-account removal; maintain
   compliance and preserve visitor trust.
4. **Enterprise intelligence feeds** — deliver real-time threat data to
   workforce, AI stack, or enterprise needs; block unsafe browsing; usable as
   a blocklist for AI model training.

This four-way segmentation is the clearest signal that the Platform product is
not a re-packaging of the consumer extension — it is a distinct go-to-market
with its own SDK, SLA, and integration requirements.

## Team Structure

Publicly available sources indicate:

- **Company size:** **51–200 employees** per LinkedIn (Guardio's official
  company page), with **170 associated members** listed on the same page and
  **25,193 followers**. Guardio's own About page states **100+ engineers,
  creators, and researchers** — consistent with the lower end of the LinkedIn
  range.
- **Headquarters and R&D center:** **Midtown TLV, Menachem Begin 144a,
  Tel Aviv, Center, IL** (per LinkedIn, and confirmed by the address on the
  Chrome Web Store listing: Derech Menachem Begin 144, Tel Aviv-Jaffa
  6492102, IL). Guardio is a single-location company.
- **Founded:** 2018.
- **LinkedIn verified page since:** August 15, 2024.
- **Founders and leadership:**
  - **Amos Peled** — Co-Founder & CEO. Signs the company's public letters,
    represents it in interviews, and is quoted in Bloomberg and other press
    coverage.
  - **Daniel Sirota** — Co-Founder.
  - **Michael Vainshtein** — Co-Founder.
  - All three are alumni of Israeli Defense Forces technology units and are
    second-time founders (their first venture was **Arpeely** — also visible
    as a "People also viewed" company on LinkedIn).
- **Notable research leadership:** **Nati Tal** — Head of Guardio Labs,
  per his LinkedIn profile. Active publicly on threat research and public
  speaking.
- **Funding:**
  - **January 2022 — Series A:** **$47M** led by **Tiger Global**, with
    **Emerge**, **Vintage Investment Partners**, **Cerca Partners**,
    **Union Tech Ventures**, and **Samsung Next** participating (per
    Guardio's own FAQ).
  - **September 2026 — Latest round:** **$40M at a $1.1B valuation**, with
    **Assaf Rappaport** (Co-Founder and CEO of Wiz) joining the investor
    group, alongside **ION Crossover Partners**, **Union Tech Ventures**,
    **Vintage Investment Partners**, **Cerca Partners**, and **Emerge
    Ventures** (per Guardio's own LinkedIn announcement).
  - **Cumulative raised to date:** approximately **$80M** (per Guardio's
    newsroom).
- **Functional makeup:** Engineering, threat research (Guardio Labs),
  product, design, marketing, support, and a finance/legal/operations
  back-office. The company explicitly names a dedicated **Guardio Research
  Team** as the operational arm that intercepts 825K threats per day.
- **Engineering-to-total ratio:** Guardio does not publicly break down how
  many of its 51–200 employees are engineers vs. other functions. The
  About page's "100+ engineers, creators, and researchers" phrasing suggests
  the technical and research headcount is the largest single block, but
  the exact split is not published.

### Guardio Labs — published research

Guardio Labs is the company's in-house research division. It publishes
long-form vulnerability disclosures and threat-campaign analyses on
`guard.io/labs`, and its findings are picked up by Forbes, BleepingComputer,
Dark Reading, The Hacker News, and other outlets. The cadence is roughly
monthly. A selection of published work:

| Date | Title | Category |
|------|-------|----------|
| Jul 2026 | **HermeticReader** — Adobe Acrobat extension vulnerability (CVE-2026-48294) enabling WhatsApp Web data access | Zero-day disclosure |
| Apr 2026 | **AccountDumpling** — Google-sent phishing wave compromising 30,000+ Facebook accounts | Campaign analysis |
| Mar 2026 | **GoogleFix** — ClickFix evolution hijacking Google sponsored results with AMOS Stealer | Campaign analysis |
| Mar 2026 | **AgenticBlabbering** — AI browsers' verbose reasoning as a scamming vector | AI-era threat |
| Mar 2026 | **AuraBreach** — case study of personal data reaching the dark web | Data breach research |
| Oct 2025 | **Prompt Inception** — AI as single source of truth and its implications | AI-era threat |
| Aug 2025 | **Scamlexity** — agentic AI browsers tested against scam pages | AI-era threat |
| Aug 2025 | **CAPTCHAgeddon** — evolution of ClickFix browser-based threats | Campaign analysis |
| Apr 2025 | **VibeScamming** — benchmarking AI agents' resistance to phishing | AI-era threat |
| Dec 2024 | **DeceptionAds** — fake CAPTCHA driving infostealer infections | Campaign analysis |
| Oct 2024 | **CrossBarking** — Opera cross-browser extension store attack | Zero-day disclosure |
| Jul 2024 | **EchoSpoofing** — Proofpoint email protection exploit | Zero-day disclosure |
| Mar 2024 | **CVE-2024-21388** — Microsoft Edge marketing API abused for covert extension install | Zero-day disclosure |
| Feb 2024 | **SubdoMailing** — hijacked brand subdomains used for email abuse | Campaign analysis |
| Jan 2024 | **MyFlaw** — Opera cross-platform 0-day RCE | Zero-day disclosure |

Three patterns are visible in this body of work:

1. **Browser and extension security is a recurring specialty.** CrossBarking,
   MyFlaw, CVE-2024-21388, and HermeticReader are all browser-layer
   vulnerabilities in major consumer products. This is not a general-purpose
   research team; it is a team built to defend the browser layer.
2. **AI-era threats are an explicit focus since mid-2025.** VibeScamming,
   Scamlexity, Prompt Inception, and AgenticBlabbering are all early research
   on how AI agents and AI browsers fail against scams. This directly feeds
   the Safe Browsing for AI product.
3. **Guardio Labs presents its work publicly.** In 2026, Guardio Labs spoke
   at **BlueHat IL** — the invitation-only Microsoft-hosted security
   conference — presenting research on how AI browsers leak internal
   reasoning that attackers can weaponize to bypass AI defenses.

### Verification signals (from Guardio's own FAQ and LinkedIn)

Guardio's site dedicates a "Is Guardio Legit?" FAQ section to publicly
listing the signals users can check for themselves. Three are verifiable:

1. **Chrome Web Store badges.** Guardio holds both the **Featured** badge
   ("extensions that follow our technical best practices and meet a high
   standard of user experience and design") and the **Established Publisher**
   badge ("established a consistent positive track record with Google
   services and compliance with the Developer Program Policy"). The
   Established Publisher badge in particular is not awarded on request — it
   is a compliance signal from Google.

2. **Third-party press coverage.** Guardio has been covered by **Wired**,
   **TechRadar**, **TechCrunch**, **The Hacker News**, and **Security Week**,
   in addition to Forbes, BleepingComputer, and Dark Reading coverage of its
   own research.

3. **Investor profile.** In **January 2022**, Guardio closed a **$47M
   Series A** led by **Tiger Global**, with participation from **Emerge**,
   **Vintage Investment Partners**, **Cerca Partners**, **Union Tech
   Ventures**, and **Samsung Next**. A tier-1 venture fund and a strategic
   investor like Samsung Next vouching at the Series A stage is a meaningful
   external validation.

**Store ratings (from the FAQ and store listings):** Chrome Web Store, Edge
Add-ons, App Store, and Google Play all show the extension and app at
approximately **4.5 stars**, with customer reviews spanning functionality
and non-intrusiveness themes. The company explicitly states it "publishes
the good and the bad feedback."

**Verdict on verification:** The combination of (a) Featured +
Established Publisher Chrome Web Store badges, (b) top-tier press coverage,
and (c) a Tiger Global-led Series A with Samsung Next participation
constitutes an unusually complete public verification trail for a consumer
security product.

### Chrome Web Store presence (Google-published data)

The Chrome Web Store listing — "Guardio Protection for Chrome" — publishes
metrics that Google verifies independently of Guardio's own marketing:

- **700,000 users** — the number of Chrome users with the extension
  installed, as tracked by Google.
- **1.3K ratings** with a **4.5-star** average.
- **Featured** badge (Google's "meets a high standard of user experience
  and design" distinction).
- **Publisher:** Guardio Ltd., with a registered address at **Derech
  Menachem Begin 144, Tel Aviv-Jaffa 6492102, IL** — the same location
  listed on LinkedIn.
- **EU Trader status:** Guardio Ltd. is identified as a trader under EU
  definition, and its **D-U-N-S number is 521055244** — a Dun & Bradstreet
  business identifier that can be independently verified.

The D-U-N-S number is worth calling out separately. It is a real,
externally-assigned identifier that ties the Chrome Web Store listing to
a registered business entity. Combined with the physical address and the
Featured badge, it makes the extension's provenance checkable in a way
that most consumer extensions are not.

**Support posture — visible in reviews.** Guardio replies publicly to
negative reviews as "Guardio Customer Voice [Developer]." On a review
dated May 19, 2026, in which a user complained the product was "NOT FREE,"
the developer replied on July 9, 2026 with a direct, non-defensive answer:
the scan is free, the paid plan covers remediation, and if that wasn't
clear at signup the user should email support@guard.io. That is not a
generic "please contact support" template — it engages with the specific
complaint and offers a concrete escalation path. Public developer
engagement on negative reviews is a low-cost signal that a company treats
post-install support as part of the product.

**Recent partnerships and public signals:**

- **Lovable integration** (November 4, 2025): Lovable integrates Guardio to
  scan sites as they are published. Lovable's Head of Security states:
  *"With Guardio scanning every Lovable site as it's published, bad actors
  trying to abuse our platform will hit a wall, and that wall will keep
  getting stronger as we scale."* The joint LinkedIn post from Lovable
  received **676 likes, 36 comments, and 33 reposts** — a measurable
  signal of interest in the B2B product.
- **Have I Been Pwned partnership** (August 6, 2025): Guardio and HIBP
  collaborate to help users take control after a data breach.
- **Hackeriot conference sponsorship** (2026): Guardio is a sponsor of
  Hackeriot, a conference promoting women in cybersecurity — visible on
  LinkedIn.
- **$1.1B valuation publicity** (September 2026): Guardio took over the
  **Nasdaq Tower in Times Square** and displayed its $1.1B valuation, and
  the milestone was also shared on the **NYSE trading floor**. The company
  posted the photos on LinkedIn.

**Caveat:** Exact headcount and functional distribution fluctuate and are not
published continuously. The LinkedIn **51–200 employees** range is the most
recent public figure; Guardio's own About page states 100+ engineers,
creators, and researchers.

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
   browsers and agents requires an SLA, an integration team, and a commercial
   sales motion — a completely different business from the consumer side.
   The four-audience segmentation (browsers, agents, GenAI platforms,
   intelligence feeds) implies four distinct integration paths.
7. **Sustained vulnerability research output.** Guardio Labs publishes
   browser-layer vulnerability research on a roughly monthly cadence and has
   been credited with multiple CVEs. That output requires a full-time
   research team with the relationships to responsibly disclose to Adobe,
   Microsoft, Opera, and Proofpoint — a capability, not a feature.

**Verdict:** A functional consumer URL-checking extension — the Part 2
deliverable — is a **week-scale project for a small team**. A product that
resembles Guard.io's *detection quality* is a **ground-up build** requiring
an ML team, a threat-research team, a platform team, and years of iteration.
The B2B Safe Browsing for AI product pushes the required investment further
still — that's an infrastructure company's roadmap, not a feature.

### Effort summary

| Scope | Team size | Time to build |
|-------|-----------|---------------|
| Consumer URL-checking extension (the Part 2 deliverable) | 1–2 engineers | 2–4 weeks |
| Consumer extension with tuned detection and real users | 4–6 engineers | 4–6 months |
| Guard.io-quality consumer product with browser-layer research | 15–25 (engineering + research + platform) | 12–18 months |
| Full three-tier product (consumer + business + platform AI) | 40+ across five functional teams | Multi-year |

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
- Research team (2–3 engineers) for the Guardio Labs cadence — vulnerability
  discovery, responsible disclosure, and public reporting.

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
- **Security review.** Guardio's own research team uses an internal
  agent-based toolkit for browser-extension vulnerability discovery — the
  same class of tooling can be applied to our own code as a review aid.
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