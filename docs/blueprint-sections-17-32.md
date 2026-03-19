# DealStage Company Operating Blueprint

## Sections 17–32: Product, Technology, Legal, Operations & Governance

**Platform:** DealStage (www.thedealstage.com)
**Entity:** DealStage LLC
**Document Version:** 1.0
**Date:** March 19, 2026
**Prepared by:** Business Analysis — Operating Blueprint Series

---

## SECTION 17: PRODUCT ROADMAP

### 17.1 Current State (as of March 2026)

DealStage has completed its initial build-out and is operating a fully functional AI-powered partnership intelligence platform. The codebase comprises:

| Dimension               | Current Count / Status                                                             |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Application pages       | 61                                                                                 |
| Supabase Edge Functions | 70+                                                                                |
| AI agents (configured)  | 32                                                                                 |
| Pricing plans           | 10 (across Brand, Talent, Agency roles)                                            |
| Payment integration     | Stripe (live publishable key active)                                               |
| Platform verifications  | 88 social/professional platforms supported                                         |
| Legal documents live    | Terms of Service, Privacy Policy, GDPR, Cookie Policy (all updated March 18, 2026) |
| Feature gating          | Active — free tier, 7-day trial, paid tiers enforced via `useFeatureGate` hook     |
| Front-end framework     | React 18 + Vite 6 + Tailwind CSS 3                                                 |
| Authentication          | Supabase Auth (JWT, RLS enforced)                                                  |
| Hosting                 | Vercel (serverless, CDN, auto-deploy)                                              |

The platform supports three distinct user roles — Brand, Talent, and Agency — each with role-specific workflows. All 61 pages are accessible across all three roles per platform design principles.

Free tier access is scoped to: Dashboard, Marketplace, Talent Profile, Connect Accounts, Settings, Notifications, Onboarding, Platform Overview, Billing History, and Subscription Management. All advanced features require a paid plan or are available during the 7-day trial window.

---

### 17.2 Near-Term Roadmap: 0–6 Weeks

**Priority:** Conversion readiness and core experience polish.

| Initiative                    | Description                                                                                                                                                                                                                                                                       | Owner Role              | Status      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------- |
| Mobile responsive polish      | Audit all 61 pages for breakpoint compliance; fix layout regressions on viewports below 768px                                                                                                                                                                                     | Engineering             | In Progress |
| Stripe Checkout completion    | Complete end-to-end payment flow for all 10 pricing plans; validate webhook event handling for subscription lifecycle (created, updated, cancelled)                                                                                                                               | Engineering             | In Progress |
| Email sequences               | Automated transactional and lifecycle email flows via Resend: welcome, trial expiry warning (day 5 and 7), payment confirmation, deal status updates, outreach notifications                                                                                                      | Engineering / Marketing | Planned     |
| Social verification OAuth     | Implement OAuth-based social account linking for priority platforms (Instagram, YouTube, TikTok, X/Twitter) to replace or supplement manual URL verification; integrate with existing 88-platform verification framework in `ConnectAccounts.jsx` and `verificationBoost` library | Engineering             | Planned     |
| Trial conversion optimization | In-app prompts at trial day 5 and day 7 expiry; upgrade CTAs on gated pages; plan comparison modal                                                                                                                                                                                | Product                 | Planned     |
| Bug triage and QA pass        | Systematic review of console errors, RLS policy edge cases, and auth flow edge cases                                                                                                                                                                                              | Engineering             | Planned     |

---

### 17.3 Mid-Term Roadmap: 6 Months

**Priority:** Audience growth, data quality, and agency scale.

| Initiative                           | Description                                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Progressive Web App (PWA) refinement | The `vite-plugin-pwa` is already installed (v1.2.0). Complete service worker configuration, offline mode, push notification support, and app manifest for home-screen installation on iOS and Android.                                                                                                 |
| React Native mobile app              | Transition PWA to native mobile app. Architecture decision: shared API layer with Supabase JS client. Target: App Store and Google Play submission by month 6.                                                                                                                                         |
| Advanced analytics dashboard         | Role-specific analytics: Brands get ROI attribution and campaign performance; Talent gets earning trajectory and audience growth; Agencies get roster performance and portfolio analytics. Powered by `recharts` (already installed) and AI agents (revenue_forecast, talent_trajectory, attribution). |
| Real social API data via Phyllo      | Integrate Phyllo API to replace estimated/manually submitted social metrics with verified real-time data: follower counts, engagement rates, audience demographics. Unlocks AQS (Audience Quality Score) reliability.                                                                                  |
| White-label agency edition           | Configurable white-label deployment for enterprise agencies: custom domain, brand colors, logo. Targeted at top-tier talent management and sports agencies. Requires multi-tenant architecture review.                                                                                                 |
| Automated email sequences (advanced) | Behavioral triggers: deal viewed but not responded to (3-day nudge), partnership anniversary, contract renewal reminders, rate increase suggestions from AI pricing optimizer.                                                                                                                         |
| Enhanced AI agent outputs            | Upgrade COMPLEX tier agents (partnership_predictor, pricing_optimizer, contract_intelligence, negotiation_coach) with GPT-4.1/Claude Sonnet 4.5 latest models; implement structured output schemas for consistent downstream parsing.                                                                  |

---

### 17.4 Long-Term Roadmap: 12 Months

**Priority:** Enterprise readiness and market scale.

| Initiative                        | Description                                                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Marketplace transactions at scale | Full escrow payment flow via Stripe Connect with automated fund release triggers tied to proof-of-performance milestones. Target: $10M+ deal volume facilitated.                                                               |
| Enterprise SSO                    | SAML 2.0 / OIDC integration for enterprise accounts. Enables agency and brand enterprise clients to log in via their corporate identity providers (Okta, Azure AD, Google Workspace).                                          |
| Advanced contract automation      | AI-generated contract drafts with version control, e-signature integration (DocuSign or native), clause library, automated compliance checks (FTC disclosure, GDPR data terms).                                                |
| International expansion           | Multi-currency support via Stripe. Localized terms and GDPR-equivalent compliance for EU (already partially addressed), UK (UK GDPR), Canada (PIPEDA), Australia (Privacy Act). Initial target markets: UK, Canada, Australia. |
| Data Room feature                 | Secure, permissioned data rooms for brands and agencies to share performance data, rate cards, and audience reports with partners under NDA.                                                                                   |
| API access tier                   | Developer API for enterprise clients to integrate DealStage data into their own BI tools, CRMs, and workflow automation. Rate-limited, key-authenticated.                                                                      |
| Predictive deal scoring at scale  | Deal Score (credit score for partnerships) powered by historical deal data, payment history, completion rates, and audience performance metrics.                                                                               |

---

### 17.5 Vision: 24 Months

**Objective:** Establish DealStage as the category-defining AI-powered partnership intelligence platform.

| Metric                           | Target                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Active organizations on platform | 10,000+                                                                                        |
| Deal volume facilitated          | $100M+ cumulative                                                                              |
| Market position                  | Category leader: AI-powered partnership intelligence                                           |
| Geographic presence              | US, UK, Canada, Australia, EU (Germany, France)                                                |
| Revenue run rate                 | $10M+ ARR                                                                                      |
| Platform integrations            | Phyllo (social data), DocuSign (e-signature), major CRMs                                       |
| AI agent coverage                | 50+ agents, expanded to voice and video content analysis                                       |
| Data products                    | Industry benchmark reports (anonymized, aggregated); licensing to media companies and VC firms |

---

## SECTION 18: AI ETHICS & GOVERNANCE

### 18.1 Bias Mitigation

DealStage's AI systems are used to score, rank, and recommend talent, brands, and partnerships. These functions carry meaningful potential for algorithmic bias. The following controls are in place or planned:

**Demographic monitoring:**

- Match scores and partnership recommendations are monitored for demographic disparities (where demographic data is available and consented to).
- AQS (Audience Quality Score) and Deal Score are based on behavioral and performance signals, not demographic proxies.
- Regular audits are planned on a quarterly basis once the platform reaches sufficient data volume (target: Q3 2026 first audit).

**Training data controls:**

- AI agents use prompt-based generation against LLM providers — they do not train custom models on DealStage user data.
- System prompts are version-controlled in `agents.ts` and reviewed during quarterly governance reviews.
- Temperature settings are calibrated per agent type: financial/compliance agents use low temperatures (0.1–0.3) to reduce hallucination; creative agents use higher temperatures (0.4–0.6) for output variety.

**Explainability:**

- Match scores include breakdown components visible to users (audience quality, engagement rate, category alignment, past deal performance).
- AI-generated content is labeled as AI-generated in the UI.
- Users can override AI recommendations at any step.

---

### 18.2 Transparency Standards

| Principle              | Implementation                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| AI content labeling    | All AI-generated outreach messages, briefs, and summaries are marked with an AI badge in the UI. |
| Match score breakdown  | Users see contributing factors to any match or recommendation score.                             |
| User override          | All AI recommendations are advisory; users take final action. No automated send, sign, or pay.   |
| Data source disclosure | Social metrics sourced from Phyllo (planned) or user-submitted will be clearly flagged.          |
| Audit trail            | All AI agent invocations are logged with agent name, tier, timestamp, and user ID.               |

---

### 18.3 Human Oversight Requirements

DealStage enforces a strict human-in-the-loop policy for all consequential actions:

| Action                       | Human Approval Required                                   |
| ---------------------------- | --------------------------------------------------------- |
| Sending outreach messages    | Yes — user reviews and sends; no auto-send                |
| Releasing escrow payments    | Yes — triggered only after user confirmation of delivery  |
| Contract signing             | Yes — no auto-sign under any circumstance                 |
| AI-generated contract drafts | Yes — draft only; requires user review and legal sign-off |
| Subscription charges         | Yes — Stripe Checkout requires active user purchase flow  |
| Account suspension           | Yes — admin review required                               |
| AI outreach recommendations  | Advisory only; user decides to act                        |

---

### 18.4 Model Governance

**AI Provider Chain (4-provider fallback architecture):**

The AI router (`supabase/functions/ai-router/`) routes requests to the appropriate model based on agent tier. The fallback chain ensures resilience if any provider experiences downtime.

| Routing Tier | Primary Use Case                                              | Model (Current)           |
| ------------ | ------------------------------------------------------------- | ------------------------- |
| COMPLEX      | Deep reasoning, financial analysis, strategic recommendations | Claude Sonnet (Anthropic) |
| STANDARD     | Everyday tasks, summaries, analysis, content generation       | DeepSeek V3               |
| FREE         | Classification, tagging, translation, data extraction         | Gemini Flash (Google)     |
| REASONING    | Reserved for future logical-chain tasks                       | To be assigned            |
| FAST         | Reserved for latency-sensitive tasks                          | To be assigned            |
| BATCH        | Reserved for off-peak bulk processing                         | To be assigned            |

**32 Agent Registry (from `agents.ts`):**

| Agent Key              | Agent Name                         | Tier     | Cache TTL |
| ---------------------- | ---------------------------------- | -------- | --------- |
| partnership_predictor  | Partnership Success Predictor      | COMPLEX  | 5 min     |
| pricing_optimizer      | Optimal Pricing Recommender        | COMPLEX  | 5 min     |
| contract_intelligence  | Contract Intelligence Analyzer     | COMPLEX  | 6 hrs     |
| negotiation_coach      | Negotiation Coach                  | COMPLEX  | None      |
| executive_briefing     | Executive Briefing Generator       | STANDARD | 5 min     |
| ai_command_center      | AI Command Center                  | STANDARD | None      |
| campaign_generator     | AI Campaign Generator              | STANDARD | 5 min     |
| outreach_generator     | AI Outreach Generator              | STANDARD | None      |
| creative_direction     | Creative Direction Generator       | STANDARD | 5 min     |
| smart_alerts           | Smart Alert Generator              | STANDARD | 5 min     |
| deal_patterns          | Deal Pattern Analyzer              | STANDARD | 1 hr      |
| content_effectiveness  | Content Effectiveness Analyzer     | STANDARD | 1 hr      |
| outreach_forecast      | Outreach Conversion Forecaster     | STANDARD | 5 min     |
| success_factors        | Success Factor Identifier          | STANDARD | 1 hr      |
| post_mortem            | Campaign Post-Mortem Analyzer      | STANDARD | 1 hr      |
| talent_trajectory      | Talent Value Trajectory Predictor  | STANDARD | 5 min     |
| competitor_intel       | Competitor Intelligence Analyzer   | STANDARD | 1 hr      |
| audience_overlap       | Audience Overlap Analyzer          | STANDARD | 1 hr      |
| revenue_forecast       | Revenue Forecaster                 | STANDARD | 5 min     |
| relationship_health    | Relationship Health Monitor        | STANDARD | 5 min     |
| brand_safety           | Brand Safety Analyzer              | STANDARD | 1 hr      |
| trend_prediction       | Trend Prediction Engine            | STANDARD | 1 hr      |
| roster_optimization    | Roster Optimization Advisor        | STANDARD | 1 hr      |
| attribution            | Cross-Platform Attribution Modeler | STANDARD | 1 hr      |
| compliance             | Compliance & Disclosure Analyzer   | STANDARD | 6 hrs     |
| invoice_reconciliation | Invoice Reconciliation Analyzer    | STANDARD | 1 hr      |
| bulk_ops               | Bulk Agent Operations              | STANDARD | None      |
| partnership_simulator  | Partnership Simulator              | STANDARD | None      |
| deal_scorer            | Deal Leaderboard Scorer            | STANDARD | 5 min     |
| agent_performance      | Agent Performance Analyzer         | FREE     | 1 hr      |
| content_localizer      | Content Localizer                  | FREE     | 24 hrs    |
| data_extractor         | Data Extractor                     | FREE     | 24 hrs    |

**Prompt version control:** Agent system prompts are stored in `agents.ts` and version-controlled in Git. Changes to any agent's system prompt, temperature, or tier require a pull request and review before deployment.

**Cache policy:** Agent responses are cached at the Edge Function layer using the TTL values defined per agent. This reduces LLM API costs and latency. No caching for real-time personalized agents (negotiation_coach, outreach_generator, ai_command_center).

---

## SECTION 19: LEGAL FRAMEWORK

### 19.1 Legal Entity

| Field                                     | Detail                                                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity name                               | DealStage LLC                                                                                                                                                                                                             |
| Platform trading name                     | Deal Stage / DealStage                                                                                                                                                                                                    |
| Website                                   | www.thedealstage.com                                                                                                                                                                                                      |
| Jurisdiction                              | United States (state of formation TBC)                                                                                                                                                                                    |
| Platform description (as stated in Terms) | "A creator partnership intelligence platform that connects brands, talent, and agencies. The Platform provides AI-powered talent discovery, partnership management, outreach tools, analytics, and marketplace features." |
| Minimum age requirement                   | 18 years old                                                                                                                                                                                                              |

---

### 19.2 Legal Documentation Status

| Document                                  | Status  | Last Updated   | URL Path                         |
| ----------------------------------------- | ------- | -------------- | -------------------------------- |
| Terms of Service                          | Live    | March 18, 2026 | /terms                           |
| Privacy Policy                            | Live    | March 18, 2026 | /privacy                         |
| GDPR Compliance Center                    | Live    | March 18, 2026 | /gdpr                            |
| Cookie Policy                             | Live    | March 18, 2026 | /cookie-policy                   |
| Data Processing Agreement (DPA)           | Planned | —              | /dpa (TBD)                       |
| Acceptable Use Policy                     | Planned | —              | /aup (TBD)                       |
| Agency Client Agreement                   | Planned | —              | Offline / in-platform            |
| Influencer Partnership Agreement template | Planned | —              | In-platform (contract templates) |

**Key Terms of Service provisions (sourced from `Terms.jsx`):**

- Users must provide accurate, current, and complete information at registration.
- Users are responsible for maintaining confidentiality of account credentials.
- Platform is operated by DealStage LLC and governed by US law.

**Key Privacy Policy provisions (sourced from `Privacy.jsx`):**

- Data collected: account information (name, email, role, company), social media data (public profile, followers, engagement, audience demographics — only what user explicitly authorizes), usage data (pages, features, AI interactions), and payment data (transaction records via Stripe; no raw card numbers stored).
- Data use: platform provision and improvement, AI-powered talent-brand matching, analytics, payment processing, service communications, security.
- Payment processing: Stripe handles all PCI-scope data. DealStage retains transaction records and subscription status only.

**GDPR provisions (sourced from `GDPR.jsx`):**

- GDPR compliance center is exposed to all users as a dedicated page.
- User rights: Access (Eye icon), Edit (Edit3 icon), Delete (Trash2 icon), Download (portability), Pause (processing restriction), Withdraw consent (XCircle icon).
- UI uses high-contrast gold/dark theme consistent with brand identity.

**Cookie Policy provisions (sourced from `CookiePolicy.jsx`):**

- Cookie categories: Essential (always on), Analytics, Targeting/Advertising, Preferences.
- Users can toggle non-essential cookies.
- Interactive cookie consent management UI built into the page.

---

### 19.3 Intellectual Property

| IP Asset                | Description                                                                                             | Protection Approach                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| AI Router               | Proprietary Edge Function routing architecture for multi-provider LLM dispatch with tier-based fallback | Trade secret; not open source                      |
| Match Engine Algorithm  | Core algorithm powering talent-brand compatibility scoring (AQS, Deal Score components)                 | Trade secret                                       |
| 32 Agent Configurations | System prompts, temperature settings, cache policies, and tier assignments for all 32 AI agents         | Proprietary; version-controlled, access-restricted |
| DealStage brand         | Wordmark, logo, UI design language (gold/dark theme, Cormorant Garamond + Instrument Sans typography)   | Trademark registration planned                     |
| Codebase                | Full application source code (React, TypeScript, Supabase functions)                                    | Copyright; private repository                      |
| Data products           | Anonymized aggregated benchmarks (planned)                                                              | Contractual data licensing terms                   |

---

### 19.4 Financial Compliance

| Area              | Current State                                                                                          | Planned Action                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| PCI compliance    | Stripe handles all card data; DealStage is PCI SAQ A eligible (no cardholder data touches our servers) | Maintain; document annually                                                                                             |
| 1099-NEC issuance | Not yet required (pre-marketplace transactions at scale)                                               | Required when payout volume to any US person exceeds $600 in a calendar year; automate via Stripe Tax or Stripe Connect |
| Sales tax / VAT   | Not currently collected on SaaS subscriptions                                                          | Multi-state nexus analysis required as revenue scales; VAT for EU users to be addressed before EU expansion             |
| State tax nexus   | TBD based on incorporation state and employee/contractor locations                                     | Legal counsel engagement required at $1M ARR milestone                                                                  |
| R&D Tax Credits   | Eligible under IRC Section 41 for AI development activities                                            | Engage R&D tax specialist; document qualifying expenditures from inception                                              |

---

## SECTION 20: DATA STRATEGY & MONETIZATION

### 20.1 Data Collection Framework

DealStage collects data across four primary categories:

**1. Profile Data**

- Name, email, role (Brand / Talent / Agency), company name, bio, categories, pricing information.
- Collected at registration and via profile completion flows.
- Stored in Supabase `profiles` table with RLS policies restricting access.

**2. Social Verification Data**

- Public profile information, follower counts, engagement metrics, audience demographics.
- Currently: user-submitted URLs verified across 88 platforms via `verificationBoost` library (`ConnectAccounts.jsx`).
- Planned: OAuth-based real-time data via Phyllo API integration (6-month roadmap item).
- Consent: users explicitly authorize each platform connection.

**3. Deal History & Transaction Data**

- Deal creation, status transitions, milestone completions, payment events, dispute records.
- Stored in Supabase `deals` table; accessed via `DealDetail.jsx` with EscrowPanel, DisputePanel, ContractScanner, and ProofOfPerformance components.
- Used for: Deal Score calculation, partnership predictor training data, invoice reconciliation, post-mortem analysis.

**4. Platform Usage Data**

- Pages visited, features used, AI agent interactions, search queries.
- Used for: product improvement, feature prioritization, user behavior analytics.
- AI agent interaction logs retained for performance monitoring and abuse detection.

---

### 20.2 Intelligence Layer

The data collected feeds DealStage's proprietary intelligence layer — the core defensible asset of the platform:

| Intelligence Product         | Description                                                                                                                                                                             | Data Inputs                                      | AI Agent                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| AQS (Audience Quality Score) | Composite score of audience authenticity, engagement rate, demographic alignment, and growth trajectory for any talent profile                                                          | Social verification data, engagement metrics     | talent_trajectory, data_extractor       |
| Deal Score                   | Partnership creditworthiness score — analogous to a credit score for the creator economy. Reflects payment history, deal completion rate, communication responsiveness, dispute history | Deal history, payment events, platform behavior  | deal_scorer, success_factors            |
| Rate Benchmarks              | Category-specific market rate data showing typical deal values by follower tier, content type, and category                                                                             | Anonymized deal data (aggregate)                 | pricing_optimizer                       |
| ROI Predictions              | Projected return on investment for a given partnership based on historical comparables                                                                                                  | Deal history, performance metrics, audience data | partnership_predictor, revenue_forecast |
| Audience Overlap             | Cross-talent audience overlap analysis for multi-influencer campaigns                                                                                                                   | Social verification data (planned Phyllo)        | audience_overlap                        |
| Brand Safety Score           | AI-generated content safety and brand risk assessment for talent profiles                                                                                                               | Public content signals, past content flags       | brand_safety                            |
| Match Score                  | Talent-brand compatibility score used in discovery and outreach prioritization                                                                                                          | All of the above                                 | partnership_predictor, attribution      |

---

### 20.3 Monetization Strategy

**Primary: Subscription Revenue**

10 pricing plans across 3 user roles (Brand, Talent, Agency) at multiple tiers. The `useFeatureGate` hook enforces plan-based feature access. Plans include a 7-day free trial.

**Secondary (Planned): Marketplace Transaction Fees**

Commission on deals facilitated through the escrow payment system (Stripe Connect). Fee structure TBD; industry comparable is 5–15% of deal value.

**Tertiary (Planned): Data Products**

Anonymized, aggregated industry benchmark reports:

- Creator economy rate benchmarks by category, platform, and follower tier.
- Campaign performance benchmarks (average engagement, ROI by vertical).
- Target customers: media companies, VC firms, talent agencies, brand marketing teams.
- Pricing model: Annual report licensing or API access subscription.

**Quaternary (Planned): API Access Tier**

Developer/enterprise API access to DealStage intelligence data for integration into third-party tools. Priced per-seat or per-call.

---

### 20.4 Data Retention Policies

| Data Category               | Retention Period                                              | Deletion Trigger                                            |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Active account profile data | Duration of account + 2 years post-deletion request           | User deletion request or account termination                |
| Social verification data    | Refreshed on re-connect; historical snapshots retained 1 year | Account deletion                                            |
| Deal records                | 7 years (financial records compliance)                        | Cannot be deleted while deals are open; archived post-close |
| Payment transaction records | 7 years (IRS / financial audit requirements)                  | Non-deletable; anonymized after 7 years                     |
| AI agent interaction logs   | 90 days                                                       | Rolling deletion                                            |
| Usage/behavioral analytics  | 12 months (aggregated after 90 days)                          | Rolling deletion                                            |
| Email communications        | 2 years                                                       | Account deletion                                            |
| Dispute records             | 5 years                                                       | Post-resolution + 5 years                                   |
| Cookies (non-essential)     | Per cookie consent settings; max 12 months                    | User consent withdrawal                                     |

---

## SECTION 21: GITHUB CODEBASE AUDIT

### 21.1 Repository Overview

| Item               | Detail                                                                |
| ------------------ | --------------------------------------------------------------------- |
| Repository type    | Private                                                               |
| Primary language   | JavaScript / JSX (React 18)                                           |
| Secondary language | TypeScript (Supabase Edge Functions, `agents.ts`, type definitions)   |
| Build tool         | Vite 6                                                                |
| Package manager    | npm                                                                   |
| Node version       | Not pinned in `.nvmrc` (recommendation: add `.nvmrc` for consistency) |

---

### 21.2 Code Quality Checklist

| Item                   | Status            | Notes                                                                                                            |
| ---------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| ESLint configured      | Pass              | `eslint.config.js` present; plugins for react, react-hooks, react-refresh, unused-imports                        |
| Prettier configured    | Pass              | `prettier` v3.8.1 in devDependencies; runs on JSON, MD, CSS via lint-staged                                      |
| TypeScript             | Partial           | `jsconfig.json` for JS; TypeScript used in Supabase functions (`agents.ts`); `tsc -p jsconfig.json` in scripts   |
| Husky pre-commit hooks | Pass              | `husky` v9.1.7; `lint-staged` runs ESLint fix on `.js/.jsx` and Prettier on `.json/.md/.css` before every commit |
| Component library      | Pass              | Radix UI primitives (full suite) + shadcn/ui pattern; accessible, unstyled base components                       |
| State management       | Pass              | TanStack React Query v5 for server state; React useState/useContext for local state                              |
| Routing                | Pass              | React Router DOM v6                                                                                              |
| Error monitoring       | Pass              | `@sentry/react` v10.44.0 integrated                                                                              |
| Testing framework      | Present           | Vitest v4 + Testing Library React v16; test script configured (`npm test`)                                       |
| Test coverage          | Needs improvement | Test infrastructure installed but coverage across 61 pages is likely low; no coverage thresholds enforced in CI  |
| Dead code elimination  | Pass              | `eslint-plugin-unused-imports` enforces no unused imports                                                        |

---

### 21.3 Security Assessment

| Item                           | Status             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env` committed to repository | Risk noted         | `.env` is committed (contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`). These are client-side/public keys by design: the Supabase anon key is safe to expose publicly when RLS is properly enforced; the Stripe publishable key is intentionally public. **However:** the `.gitignore` pattern `#env` on line 1 appears to be a comment rather than an active ignore rule — `.env` itself is NOT gitignored. This should be reviewed. |
| Secret keys in `.env`          | Acceptable         | All three values are public-facing keys (anon key, publishable key, public URL). No server-side secrets (Stripe secret key, Supabase service role key) are stored in `.env`.                                                                                                                                                                                                                                                                                               |
| Supabase RLS                   | Should be verified | Row Level Security must be enforced on all tables. Audit required to confirm no tables are exposed with public read/write access.                                                                                                                                                                                                                                                                                                                                          |
| Supabase service role key      | Not in `.env`      | Correct — service role key should only exist in Supabase Edge Function environment variables (not client-side).                                                                                                                                                                                                                                                                                                                                                            |
| `.gitignore` coverage          | Adequate           | Covers: `.env.local`, `.env.*.local`, `node_modules`, `dist`, editor files (`.vscode`, `.idea`, `.DS_Store`). Note the commented `#env` line.                                                                                                                                                                                                                                                                                                                              |
| Security headers               | Pass               | Vercel serves all routes with: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation, interest-cohort all disabled), `Strict-Transport-Security` (max-age=31536000, includeSubDomains, preload), and a comprehensive `Content-Security-Policy`.                                                                         |
| HSTS preload                   | Pass               | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`                                                                                                                                                                                                                                                                                                                                                                                                  |
| Clickjacking protection        | Pass               | `X-Frame-Options: DENY`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| MIME sniffing                  | Pass               | `X-Content-Type-Options: nosniff`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CSP                            | Pass               | Configured in `vercel.json`; covers default-src, script-src, style-src, img-src, font-src, connect-src, frame-src, object-src, base-uri                                                                                                                                                                                                                                                                                                                                    |
| Static asset caching           | Pass               | `/assets/*` served with `Cache-Control: public, max-age=31536000, immutable` for optimal CDN performance                                                                                                                                                                                                                                                                                                                                                                   |

**Recommended remediation:**

1. Fix the `#env` comment in `.gitignore` — change to `.env` as an active ignore rule if `.env` should not be committed, or document explicitly that `.env` is committed because it contains only public keys.
2. Run a full Supabase RLS audit to confirm no unprotected tables.
3. Add test coverage thresholds in `vitest.config.js` (minimum 50% coverage as a starting target).

---

### 21.4 CI/CD Pipeline

| Stage                              | Tool                                   | Status                                                                             |
| ---------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Pre-commit lint                    | Husky + lint-staged                    | Active                                                                             |
| Build                              | Vite 6 (`npm run build`)               | Active                                                                             |
| Deploy                             | Vercel auto-deploy on push to main     | Active                                                                             |
| Preview deployments                | Vercel (per PR/branch)                 | Available                                                                          |
| Environment variables (production) | Vercel Environment Variables dashboard | Active                                                                             |
| Test execution in CI               | Not yet configured                     | Recommendation: add `npm test` step to Vercel build or add GitHub Actions workflow |

---

## SECTION 22: CLOUD ARCHITECTURE REVIEW

### 22.1 Architecture Overview

DealStage runs on a two-platform cloud architecture:

```
[User Browser / PWA]
        |
        v
[Vercel Edge Network]
  - CDN-cached static assets (React SPA)
  - Serverless functions (if any)
  - Security headers enforcement
  - SPA rewrite rules (all non-asset routes → /index.html)
        |
        v
[Supabase Cloud]
  - Managed PostgreSQL (primary database)
  - Row Level Security (data access control)
  - Supabase Auth (JWT, email/password, OAuth)
  - Edge Functions (70+ TypeScript serverless functions)
    - AI Router (multi-provider LLM dispatch)
    - Payment processing helpers
    - Webhook handlers
    - Data processing jobs
  - Supabase Storage (file uploads: contracts, proof-of-performance)
  - Realtime (WebSocket subscriptions for live deal updates)
        |
        v
[External Services]
  - Stripe (payments, subscriptions, Connect escrow)
  - AI Providers (Anthropic Claude, DeepSeek, Google Gemini)
  - Resend (transactional email — planned)
  - Phyllo (social data API — planned)
  - Sentry (error monitoring)
```

---

### 22.2 Scalability Assessment

| Dimension      | Current State                                    | Scalability Rating | Notes                                                                                                      |
| -------------- | ------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Frontend       | Vercel CDN, global edge network                  | Excellent          | Static SPA served from CDN; scales infinitely                                                              |
| Database       | Supabase managed PostgreSQL                      | Good               | Managed service with connection pooling (PgBouncer); scales vertically and horizontally with plan upgrades |
| Edge Functions | Supabase Edge Functions (Deno runtime)           | Good               | Serverless; auto-scales with request volume                                                                |
| AI API calls   | External providers (Anthropic, DeepSeek, Gemini) | Good               | Rate limits apply per provider; AI router caching reduces redundant calls                                  |
| File storage   | Supabase Storage                                 | Good               | Object storage; scales with storage plan                                                                   |
| Real-time      | Supabase Realtime                                | Good               | Channel-based; monitor connection count at scale                                                           |
| Auth           | Supabase Auth                                    | Excellent          | Managed; scales with platform                                                                              |

---

### 22.3 Reliability Assessment

| Item                 | Status                                     | Notes                                                                                                  |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Database backups     | Managed by Supabase                        | Daily automated backups on Pro plan; point-in-time recovery available                                  |
| Uptime SLA           | Supabase: 99.9% (Pro plan); Vercel: 99.99% | Review current Supabase plan tier                                                                      |
| Multi-region         | Not currently configured                   | Supabase single-region (us-east-1 assumed); consider read replicas for latency at scale                |
| CDN failover         | Vercel global CDN                          | Automatic                                                                                              |
| AI provider fallback | 4-provider chain in AI router              | Resilience against single provider outage                                                              |
| Error monitoring     | Sentry (`@sentry/react` v10.44.0)          | Active; configure alerting thresholds                                                                  |
| Uptime monitoring    | Not yet configured                         | Recommendation: configure Vercel Analytics or external uptime monitor (e.g., Betterstack, UptimeRobot) |

---

### 22.4 Cost Structure

| Service             | Billing Model                         | Cost Driver                                                  | Optimization Levers                                                                      |
| ------------------- | ------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Vercel              | Pro plan (per seat/month) + bandwidth | Build minutes, bandwidth, function invocations               | CDN caching maximizes free bandwidth; asset immutable caching (already configured)       |
| Supabase            | Pro plan (per project/month) + usage  | Database size, Edge Function invocations, storage, Auth MAUs | RLS efficiency; Edge Function caching (AI agent TTLs reduce LLM calls)                   |
| Stripe              | 2.9% + 30¢ per transaction            | Transaction volume                                           | Standard rate; negotiate custom pricing at scale                                         |
| Anthropic Claude    | Per-token pricing                     | AI Router COMPLEX tier volume                                | Agent caching (TTL.SHORT=5min for most COMPLEX agents); route to STANDARD where possible |
| DeepSeek V3         | Per-token pricing                     | AI Router STANDARD tier volume                               | Caching on 20+ STANDARD agents                                                           |
| Google Gemini Flash | Per-token pricing (low cost)          | AI Router FREE tier volume                                   | DAY-long cache TTLs on FREE agents                                                       |
| Resend              | Per-email pricing                     | Email volume                                                 | Lifecycle email sequences — monitor delivery rates                                       |
| Sentry              | Per-event pricing                     | Error volume                                                 | Set rate limits; filter noise events                                                     |

---

### 22.5 Security Checklist

| Item                                     | Status                          |
| ---------------------------------------- | ------------------------------- |
| HTTPS enforced (HSTS)                    | Pass                            |
| Supabase Auth JWT verification           | Pass                            |
| RLS on all database tables               | Verify                          |
| Service role key not in client           | Pass                            |
| Secrets in Vercel env vars (not in code) | Pass (only public keys in .env) |
| Security headers (7 headers configured)  | Pass                            |
| Stripe webhook signature verification    | Verify in Edge Function         |
| Sentry PII scrubbing                     | Verify configuration            |
| Supabase network access restrictions     | Verify                          |

---

## SECTION 23: LOAD & STRESS TESTING

### 23.1 Current Status

**Load and stress testing has not yet been conducted.** This is scheduled as a pre-requisite for enterprise launch (planned Q3 2026).

---

### 23.2 Pre-Test Checklist

Before executing load tests, the following must be confirmed:

| Item                      | Required Action                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Supabase plan tier        | Confirm Pro plan or higher is active to handle test load without throttling              |
| Test environment          | Use a staging environment (separate Supabase project) to avoid impacting production data |
| AI provider rate limits   | Document rate limits per provider; configure test to avoid hitting production API quotas |
| Stripe test mode          | All payment flows tested using Stripe test keys                                          |
| Monitoring active         | Sentry, Supabase dashboard, and Vercel Analytics must be active during tests             |
| Baseline metrics captured | Capture p50/p95/p99 response times before load test for comparison                       |
| RLS queries profiled      | Run `EXPLAIN ANALYZE` on critical queries to identify unindexed RLS conditions           |

---

### 23.3 Test Scenarios

| Scenario                       | Description                                                                    | Target Concurrent Users | Duration |
| ------------------------------ | ------------------------------------------------------------------------------ | ----------------------- | -------- |
| Discovery / marketplace browse | Simulate users browsing talent marketplace, applying filters, viewing profiles | 500                     | 10 min   |
| AI agent invocations           | Simulate simultaneous AI agent calls across all 32 agents                      | 200                     | 5 min    |
| Deal creation flow             | End-to-end deal creation, milestone setting, messaging                         | 100                     | 15 min   |
| Dashboard load                 | Simultaneous dashboard loads across Brand, Talent, and Agency roles            | 300                     | 5 min    |
| Stripe checkout                | Simultaneous subscription checkout attempts                                    | 50                      | 5 min    |
| File upload (contracts)        | Multiple users uploading contract PDFs via ContractScanner                     | 50                      | 5 min    |
| Spike test                     | Sudden 10x traffic spike to simulate a viral moment or product launch          | 0 → 1000 in 30s         | 2 min    |

---

### 23.4 Pass/Fail Thresholds

| Metric                           | Pass Threshold     | Fail Threshold            |
| -------------------------------- | ------------------ | ------------------------- |
| API response time (p95)          | < 500ms            | > 2000ms                  |
| AI agent response time (p95)     | < 5000ms           | > 15000ms                 |
| Page load time (p95, CDN-served) | < 1500ms           | > 3000ms                  |
| Error rate under normal load     | < 0.1%             | > 1%                      |
| Error rate under spike           | < 1%               | > 5%                      |
| Database connection exhaustion   | No pool exhaustion | Any pool exhaustion event |
| Stripe checkout success rate     | > 99%              | < 97%                     |
| Uptime during test               | 100%               | Any outage                |

---

### 23.5 Tools Recommended

| Tool               | Use Case                                |
| ------------------ | --------------------------------------- |
| k6 (Grafana)       | API and edge function load testing      |
| Playwright         | End-to-end user flow simulation         |
| Supabase dashboard | Real-time database and function metrics |
| Vercel Analytics   | Frontend performance metrics            |
| Sentry             | Error aggregation during test runs      |

---

## SECTION 24: ACCESS PROVISIONING

### 24.1 Access Tiers

| Role                       | Scope                                                                                           | Approval Required                        |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Founder / Owner            | Full access: GitHub, Supabase (owner), Vercel (owner), Stripe (owner), all AI providers         | N/A                                      |
| Core Engineer              | GitHub write access, Supabase (project admin), Vercel (member)                                  | Founder approval                         |
| Contract Developer         | GitHub read + feature branch write, Supabase (read-only or scoped), no production Stripe access | Founder approval + NDA                   |
| External Auditor           | GitHub read-only (specific directories only), Supabase read-only (non-PII tables)               | Founder approval + NDA + scope agreement |
| Agency / Enterprise Client | No codebase access; platform access only via their plan                                         | Standard account creation                |

---

### 24.2 GitHub Access Protocol

| Principle               | Policy                                                                            |
| ----------------------- | --------------------------------------------------------------------------------- |
| Default external access | Read-only; never write to main                                                    |
| Feature branch policy   | All development in feature branches; PRs required for merge to main               |
| Direct push to main     | Disabled for all non-owner accounts                                               |
| Code review             | Required for all PRs touching Supabase functions or AI agent configurations       |
| Secret scanning         | GitHub secret scanning should be enabled to prevent accidental credential commits |
| Dependency review       | Enable GitHub Dependabot for automated vulnerability alerts                       |

---

### 24.3 Supabase Access Protocol

| Resource                        | Policy                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Supabase dashboard (production) | Owner + Core Engineers only                                                        |
| Service role key                | Never shared; rotated quarterly; used only in Edge Function environment variables  |
| Anon key                        | Public (safe with RLS); committed to `.env` for Vercel build                       |
| Database direct access          | Via Supabase dashboard SQL editor; no external database connections for non-owners |
| Edge Function secrets           | Stored in Supabase Edge Function Secrets vault; not in code                        |
| RLS policies                    | Modified only via reviewed migration files; no ad-hoc production RLS changes       |

---

### 24.4 Vercel Access Protocol

| Resource              | Policy                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| Vercel dashboard      | Owner + Core Engineers                                                          |
| Environment variables | Set via dashboard only; never in committed code except public keys              |
| Production deployment | Auto-deploy from main branch; manual promotion gates to be added pre-enterprise |
| Preview deployments   | Available per branch; no production data access                                 |

---

### 24.5 Stripe Access Protocol

| Resource                | Policy                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| Stripe dashboard        | Owner only for production; restricted access for finance/billing roles |
| Stripe secret key       | Never in client code; stored in Supabase Edge Function secrets         |
| Stripe test mode        | All engineers use test mode keys only                                  |
| Webhook signing secrets | Stored as Edge Function secrets; rotated if compromised                |
| Payout configuration    | Owner-only access                                                      |

---

## SECTION 25: FINANCIAL & LEGAL INFRASTRUCTURE

### 25.1 Cap Table & Ownership (Early Stage)

| Item                     | Status                                                                            |
| ------------------------ | --------------------------------------------------------------------------------- |
| Entity type              | LLC                                                                               |
| Ownership structure      | To be formally documented in operating agreement                                  |
| Cap table management     | Recommended: Carta or Pulley at Series A preparation stage                        |
| Equity grants            | Not yet issued (pre-funding); recommended to establish option pool before raising |
| SAFE / convertible notes | None issued as of blueprint date                                                  |
| Investor relations       | Not applicable (pre-funding)                                                      |

---

### 25.2 Banking & Financial Operations

| Item                  | Status                                                   | Recommendation                                                |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Business bank account | Should be separate from personal                         | Confirm DealStage LLC has dedicated business banking          |
| Payment processing    | Stripe (live keys active)                                | Active                                                        |
| Accounts receivable   | Stripe subscription billing                              | Active                                                        |
| Accounts payable      | Vendor invoices (Supabase, Vercel, AI providers, Resend) | Track in accounting software                                  |
| Accounting software   | Not specified                                            | Recommendation: QuickBooks Online or Pilot.com at early stage |
| Month-end close       | Not yet formalized                                       | Establish monthly reconciliation process                      |

---

### 25.3 Insurance (Planned)

| Insurance Type                      | Priority          | Rationale                                                                                                 |
| ----------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| Technology E&O (Errors & Omissions) | High              | Covers claims arising from platform failures, AI errors, or data accuracy issues affecting user decisions |
| Cyber Liability                     | High              | Covers data breach, ransomware, and notification costs                                                    |
| General Liability                   | Medium            | Standard business liability                                                                               |
| Directors & Officers (D&O)          | Low (pre-funding) | Required before raising institutional capital                                                             |

**Recommended brokers:** Vouch Insurance (tech startup specialist), Embroker.

---

### 25.4 Tax Strategy

| Area                             | Status                                         | Action                                                                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Federal income tax               | LLC pass-through taxation                      | Confirm with CPA                                                                                                                                                                                                                          |
| State income tax                 | Based on state of incorporation and operations | Multi-state nexus analysis as headcount and revenue grow                                                                                                                                                                                  |
| Sales tax on SaaS                | Complex and state-dependent                    | Engage sales tax specialist (Avalara or TaxJar) before reaching $100K ARR in any single state                                                                                                                                             |
| R&D Tax Credits (IRC Section 41) | Eligible                                       | DealStage's AI agent development, match engine, and router architecture qualify as qualified research activities. Engage R&D tax specialist to document from inception. Potential savings: 6–8% of qualifying wages and contractor costs. |
| 1099-NEC (contractor payments)   | Not yet required                               | Track all contractor payments; issue 1099s when any individual exceeds $600 in a calendar year                                                                                                                                            |
| 1099-K (platform payouts)        | Future requirement                             | Required for marketplace payouts when Stripe Connect escrow launches; Stripe handles 1099-K issuance for recipients                                                                                                                       |

---

## SECTION 26: TRUST, SAFETY & FRAUD

### 26.1 User Verification System

DealStage operates one of the most comprehensive social verification systems in the partnership intelligence category: **88 platform categories** supported via `ConnectAccounts.jsx`.

**Verification categories (from ConnectAccounts.jsx):**

- Content & Video (YouTube, etc.)
- Photo & Visual (Camera/Instagram, etc.)
- Music & Audio
- Gaming & Esports
- Actors & Performers
- Fitness & Wellness
- Writers & Podcasts
- Art & Design (Palette)
- Sports & Athletics (Trophy)
- Education (GraduationCap)

**Verification mechanics:**

- Users connect platform accounts via URL submission (current) or OAuth (planned for priority platforms).
- `verificationBoost` library calculates a verification level and boost score based on number and quality of verified platforms.
- `getVerificationLevel`, `getVerificationColor`, `getNextBoostMessage`, and `recalculateBoost` are exported utilities used across the platform.
- Verification progress bar shown in ConnectAccounts UI.
- Higher verification levels unlock higher deal visibility and trust badges in marketplace listings.

**OAuth roadmap (6-week milestone):**
Planned OAuth implementation for: Instagram, YouTube, TikTok, X/Twitter. OAuth verification is more authoritative than URL-only submission because it confirms live account ownership.

---

### 26.2 Brand Safety

| Feature                          | Agent                                     | Description                                                                                                              |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Brand Safety Analyzer            | `brand_safety` (STANDARD tier, 1hr cache) | AI analysis of talent content history, language patterns, and flagged categories against brand-defined safety parameters |
| Compliance & Disclosure Analyzer | `compliance` (STANDARD tier, 6hr cache)   | Reviews content for FTC disclosure compliance (e.g., #ad, #sponsored), platform-specific rules, and contract compliance  |
| Deal Score                       | `deal_scorer` (STANDARD tier, 5min cache) | Incorporates fraud signals and completion history into a numerical score                                                 |
| Audience Quality Score (AQS)     | `talent_trajectory`, `data_extractor`     | Detects inflated follower counts, bot engagement, and audience authenticity issues                                       |

---

### 26.3 KYC and Payment Fraud

| Layer                 | Handler                      | Notes                                                                                                 |
| --------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Payment KYC           | Stripe                       | Stripe performs identity verification for Stripe Connect (marketplace payouts) accounts automatically |
| Card fraud detection  | Stripe Radar                 | Stripe's built-in ML fraud detection; no configuration required                                       |
| Subscription fraud    | Stripe + platform monitoring | Monitor for card testing patterns; velocity checks                                                    |
| Account fraud         | Platform-level               | Duplicate email detection via Supabase Auth; rate limiting on Edge Functions                          |
| Chargeback management | Stripe dashboard             | Review and respond to disputes in Stripe; maintain evidence (deal records, communications)            |

---

### 26.4 Duplicate and Spam Detection

| Type               | Detection Method                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Duplicate accounts | Supabase Auth email uniqueness constraint; phone verification (planned)                     |
| Fake profiles      | Verification boost score — low-verification profiles have restricted marketplace visibility |
| Spam outreach      | Rate limiting on outreach Edge Functions; AI-generated outreach requires per-user approval  |
| Bot activity       | Supabase Auth + Captcha integration (planned)                                               |
| Duplicate deals    | Database-level unique constraints on deal creation                                          |

---

## SECTION 27: PAYMENTS & CONTRACTS

### 27.1 Payment Architecture

DealStage uses Stripe as its sole payment processor. The architecture supports two payment flows:

**Flow 1: Subscription Billing (Active)**

- Users select a plan on the Pricing page.
- Stripe Checkout handles payment collection.
- Subscription status stored in Supabase `profiles.plan` column.
- Webhooks: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
- `useFeatureGate` hook reads plan status and gates features accordingly.

**Flow 2: Escrow / Marketplace Payments (Planned — 12-month roadmap)**

- Stripe Connect (platform-to-creator payouts).
- Escrow flow: Brand deposits funds → held in escrow → released on milestone approval.
- EscrowPanel component (`/components/deals/EscrowPanel`) exists in `DealDetail.jsx` — infrastructure is built, awaiting full Stripe Connect integration.
- Commission structure: Platform fee deducted from escrow at point of release (percentage TBD).

---

### 27.2 Payment Release Triggers

| Trigger                | Description                                                                                      | Who Approves                              |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Milestone completion   | Talent submits proof of performance via ProofOfPerformance component; brand reviews and approves | Brand                                     |
| Deal completion        | All milestones approved; deal status changes to "complete"                                       | Brand (final sign-off)                    |
| Partial release        | Brand can release partial payment on milestone-by-milestone basis                                | Brand                                     |
| Dispute resolution     | Payment released or returned per dispute outcome                                                 | Platform admin                            |
| Auto-release (planned) | If brand does not respond within X days of talent submission, funds auto-release                 | System (with email notification to brand) |

**Critical human oversight rule:** No payment is released without an explicit user action. Stripe webhooks confirm payment events but do not trigger fund release autonomously.

---

### 27.3 Commission and Fee Structure

| Fee Type                    | Amount                           | Notes                            |
| --------------------------- | -------------------------------- | -------------------------------- |
| Subscription fee            | Per plan pricing (10 plans)      | Recurring monthly/annual         |
| Marketplace transaction fee | TBD (target 5–10% of deal value) | Deducted from escrow at release  |
| Currency conversion         | Stripe standard FX rates + 1.5%  | Applies to non-USD transactions  |
| Stripe processing fee       | 2.9% + $0.30 per transaction     | Passed to platform cost          |
| Payout fee (Stripe Connect) | Per Stripe Connect pricing       | Applies to talent/agency payouts |

---

### 27.4 Contract Templates

DealStage provides AI-assisted contract generation via the `contract_intelligence` agent and `ContractScanner` component:

| Template                        | Description                                                                               | Status                   |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| Partnership Agreement           | Core deal agreement covering deliverables, timeline, payment, exclusivity, content rights | Available (AI-generated) |
| Non-Disclosure Agreement (NDA)  | Mutual NDA for pre-deal conversations and data room access                                | Available (AI-generated) |
| Content License Agreement       | License terms for brand to use talent-created content across channels                     | Available (AI-generated) |
| Agency Representation Agreement | Agreement between agency and talent for platform representation                           | Planned                  |
| Influencer Marketing Agreement  | FTC-compliant influencer deal terms with disclosure requirements                          | Available (AI-generated) |

All contracts are AI-drafted starting points. Users must review, modify, and obtain independent legal counsel before execution. DealStage does not provide legal advice.

**ContractScanner** (`/components/deals/ContractScanner`): Analyzes uploaded contract documents for key terms, red flags, missing clauses, and compliance issues using the `contract_intelligence` agent.

---

## SECTION 28: DISPUTE RESOLUTION

### 28.1 Dispute Categories

| Category                | Description                                                                        | Frequency Expectation |
| ----------------------- | ---------------------------------------------------------------------------------- | --------------------- |
| Non-delivery            | Talent did not deliver agreed content or service by deadline                       | High                  |
| Quality dispute         | Deliverable delivered but does not meet agreed specifications or quality standards | Medium                |
| Payment dispute         | Brand disputes charge; talent claims non-payment; escrow release disagreement      | Medium                |
| Intellectual property   | Unauthorized content use; rights disputes post-deal                                | Low                   |
| Misrepresentation       | Fraudulent audience metrics; false profile claims                                  | Low                   |
| Contract interpretation | Parties disagree on terms meaning                                                  | Medium                |

**DisputePanel** component (`/components/deals/DisputePanel`) is loaded within `DealDetail.jsx` — the UI infrastructure for dispute initiation and tracking is built.

---

### 28.2 Escalation Path (4 Levels)

| Level   | Handler               | Timeframe | Resolution Method                                                                                                                                 |
| ------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Level 1 | Self-service          | Days 1–3  | Parties communicate via in-platform messaging; review contract terms and deal milestones                                                          |
| Level 2 | AI-assisted mediation | Days 3–7  | `partnership_simulator` and `contract_intelligence` agents provide neutral analysis of the dispute facts, contract terms, and comparable outcomes |
| Level 3 | Platform admin review | Days 7–14 | DealStage team reviews evidence, communications, and deliverables; makes binding recommendation                                                   |
| Level 4 | Legal / arbitration   | Day 14+   | Escalated to binding arbitration or legal proceedings per Terms of Service governing law clause                                                   |

---

### 28.3 Platform Guarantees vs. Disclaimers

**What DealStage guarantees:**

- Escrow funds held securely via Stripe until release criteria met.
- Dispute process will be reviewed by platform admin within 14 business days.
- AI analysis provided at Level 2 is neutral and based on documented deal terms.
- User data is not shared with opposing party beyond what is needed to resolve the dispute.

**What DealStage does not guarantee:**

- Outcome of any dispute (DealStage is a platform, not a party to deals).
- Quality, accuracy, or legality of any deliverable produced by talent.
- Brand payment solvency or ability to complete payment obligations.
- That AI-generated contract templates are legally enforceable in all jurisdictions.
- That platform recommendations (AI match scores, pricing suggestions) will result in successful partnerships.

---

### 28.4 Remedies

| Outcome                                    | Action                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Non-delivery confirmed                     | Escrow refunded to brand; talent account warning issued                              |
| Quality dispute resolved in talent's favor | Escrow released to talent                                                            |
| Quality dispute resolved in brand's favor  | Partial or full escrow refund to brand                                               |
| Fraud confirmed                            | Account suspended; Stripe fraud report filed; law enforcement referral if applicable |
| Misrepresentation confirmed                | Profile removed from marketplace; escrow refunded                                    |
| Payment dispute (chargeback)               | Evidence provided to Stripe; platform mediates; account flagged                      |

---

## SECTION 29: OPERATIONS & CUSTOMER SUCCESS

### 29.1 Support Tier Model

| Tier              | Who                         | Channel                                         | SLA              | Availability   |
| ----------------- | --------------------------- | ----------------------------------------------- | ---------------- | -------------- |
| Self-service      | All users                   | Help center, in-app tooltips, onboarding guides | N/A              | 24/7           |
| Email support     | Paid plans                  | support@thedealstage.com (assumed)              | 48-hour response | Business days  |
| Priority email    | Growth+ plans               | Priority queue                                  | 24-hour response | Business days  |
| Dedicated success | Enterprise / Agency         | Named CSM, Slack channel                        | 4-hour response  | Business hours |
| Escalation        | All tiers for billing/legal | Direct to founder                               | Same day         | Business hours |

---

### 29.2 Onboarding Playbooks

**Brand Onboarding:**

1. Role selection → Company profile setup.
2. Define campaign objectives and budget range.
3. Connect brand social accounts (optional).
4. Complete search filters and category preferences.
5. AI match recommendations surfaced on dashboard.
6. First outreach sent (AI-assisted).
7. Deal creation tutorial.

**Talent Onboarding:**

1. Role selection → Personal/professional profile setup.
2. Connect all relevant social accounts via ConnectAccounts (88 platforms).
3. Verify minimum 3 platforms for marketplace visibility boost.
4. Set rate card (pricing recommendations from `pricing_optimizer` agent).
5. AQS score calculated and displayed.
6. Profile published to marketplace.
7. Response to first inbound brand outreach.

**Agency Onboarding:**

1. Role selection → Agency profile + company info.
2. Add talent roster members (invite or manual entry).
3. Configure agency-wide settings.
4. Connect agency-managed social accounts.
5. Roster analytics dashboard activated.
6. First agency-managed deal creation.
7. White-label setup (planned feature).

---

### 29.3 Vendor Register

| Vendor          | Category                                                 | Purpose                                               | Contract Status                                 |
| --------------- | -------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Supabase        | Infrastructure — Database, Auth, Storage, Edge Functions | Core backend platform                                 | Usage-based; Supabase Pro plan                  |
| Vercel          | Infrastructure — Hosting, CDN, CI/CD                     | Frontend hosting and deployment                       | Usage-based; Vercel Pro plan                    |
| Stripe          | Payments                                                 | Subscription billing, marketplace escrow (planned)    | Standard Stripe agreement; custom rate at scale |
| Anthropic       | AI Provider                                              | COMPLEX tier agents (Claude Sonnet)                   | API usage agreement                             |
| DeepSeek        | AI Provider                                              | STANDARD tier agents (DeepSeek V3)                    | API usage agreement                             |
| Google (Gemini) | AI Provider                                              | FREE tier agents (Gemini Flash)                       | API usage agreement                             |
| Resend          | Email                                                    | Transactional and lifecycle emails                    | Usage-based (planned)                           |
| Phyllo          | Social Data                                              | Verified real social API data                         | Planned partnership                             |
| Sentry          | Monitoring                                               | Error tracking and alerting                           | `@sentry/react` v10 integrated                  |
| Base44          | SDK / Platform                                           | `@base44/sdk` and `@base44/vite-plugin` used in build | Existing dependency                             |

---

### 29.4 Key Operational Metrics

| Metric                     | Measurement Method                                    | Target                                     |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Time to first AI match     | From profile completion to first match recommendation | < 5 minutes                                |
| Time to first deal         | From registration to first deal created               | < 7 days                                   |
| Trial to paid conversion   | % of trial users converting to paid by day 7          | > 25%                                      |
| Monthly active users (MAU) | Unique users with at least 1 session per month        | Track; grow 20% MoM                        |
| AI agent utilization       | Invocations per user per month                        | Track per agent; identify underused agents |
| Deal completion rate       | % of created deals reaching "complete" status         | > 60%                                      |
| NPS (Net Promoter Score)   | In-app survey at 30 days and post-deal completion     | > 50                                       |
| Support ticket volume      | Per MAU                                               | < 5% of MAU generating tickets             |

---

## SECTION 30: TECHNICAL COMPLIANCE & ACCESSIBILITY

### 30.1 WCAG 2.1 AA Accessibility

| Area                  | Status                | Notes                                                                                                                                         |
| --------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix UI components   | Pass                  | All Radix UI primitives are WCAG 2.1 AA compliant by default (keyboard navigation, ARIA attributes, focus management)                         |
| Color contrast        | Needs audit           | Dark theme (bg: #080807, gold: #c4a24a on dark) — verify contrast ratios for all text/background combinations in GDPR and Cookie Policy pages |
| Keyboard navigation   | Pass (via Radix)      | All interactive elements navigable via keyboard                                                                                               |
| Screen reader support | Pass (via Radix ARIA) | ARIA roles and labels provided by Radix UI                                                                                                    |
| Focus indicators      | Verify                | Tailwind focus ring styles should be verified across all interactive components                                                               |
| Alt text              | Needs audit           | All images and icons require descriptive alt text or `aria-hidden` if decorative                                                              |
| Form labels           | Pass                  | `@radix-ui/react-label` used with `react-hook-form` + `zod` validation                                                                        |
| Error states          | Pass                  | Toast notifications via `sonner`; form validation errors via `react-hook-form`                                                                |
| Motion/animation      | Verify                | `tailwindcss-animate` used; ensure `prefers-reduced-motion` media query is respected                                                          |

**Recommended action:** Commission a WCAG 2.1 AA audit using axe-core or equivalent tooling before enterprise launch.

---

### 30.2 API Documentation

| Item                          | Status                           | Recommendation                                                                                        |
| ----------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Internal Edge Function API    | Undocumented                     | Document all 70+ Edge Functions: endpoint, method, request schema, response schema, auth requirements |
| AI Router API                 | Partially documented (agents.ts) | Add JSDoc to all agent functions; generate API reference                                              |
| Supabase schema documentation | Undocumented                     | Use Supabase built-in schema visualizer; export to docs                                               |
| Public API (planned)          | Not yet built                    | Design OpenAPI 3.0 spec before building; use Swagger UI for documentation                             |
| Webhook events                | Undocumented                     | Document all Stripe webhook handlers and expected payloads                                            |

---

### 30.3 Internationalization (i18n)

| Phase             | Scope                                                                           | Timeline                                                               |
| ----------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Phase 1 (current) | English (US) only                                                               | Active                                                                 |
| Phase 2           | UK English, Australian English (minimal changes — currency symbol, date format) | 6-month roadmap                                                        |
| Phase 3           | Full i18n: French, German, Spanish                                              | 12-month roadmap                                                       |
| Currency          | USD only (current)                                                              | Multi-currency via Stripe at Phase 2                                   |
| Date formats      | US format (MM/DD/YYYY)                                                          | Convert to locale-aware `date-fns` formatting                          |
| i18n library      | Not yet integrated                                                              | Recommendation: `react-i18next` — add at Phase 2 before Phase 3 effort |

The `content_localizer` agent (FREE tier, 24hr cache TTL) is already configured for content translation tasks — this will be the AI backbone for Phase 3 localization.

---

### 30.4 Data Breach Response Protocol

| Phase                      | Action                                                                                                                 | Timeframe       | Owner                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------- |
| Detection                  | Sentry alert or Supabase anomaly detection flags unusual data access                                                   | Immediate       | Automated + Founder     |
| Containment                | Revoke compromised credentials, disable affected Edge Functions, isolate affected tables via RLS                       | Within 1 hour   | Founder + Core Engineer |
| Assessment                 | Determine scope: what data, how many users, what type (PII, payment, social)                                           | Within 4 hours  | Founder                 |
| Notification — authorities | GDPR: notify supervisory authority within 72 hours if EU users affected; US: notify per state breach notification laws | Within 72 hours | Founder + Legal Counsel |
| Notification — users       | Notify affected users via email with: what happened, what data, what actions to take                                   | Within 72 hours | Founder                 |
| Remediation                | Fix vulnerability, re-audit RLS policies, rotate all secrets, Supabase security review                                 | Within 1 week   | Engineering             |
| Post-incident report       | Document timeline, root cause, remediation steps, prevention measures                                                  | Within 2 weeks  | Founder                 |

**Contact for breach reporting:** privacy@thedealstage.com (establish this email address).

---

### 30.5 Dependency Security

| Practice               | Status                                                         |
| ---------------------- | -------------------------------------------------------------- |
| Dependabot enabled     | Recommended — not yet confirmed                                |
| npm audit on build     | Recommended — add to CI pipeline                               |
| License compliance     | All dependencies are MIT, Apache 2.0, or BSD licensed (verify) |
| Lock file committed    | `package-lock.json` present and committed                      |
| No known critical CVEs | Verify with `npm audit`                                        |

---

## SECTION 31: GOVERNANCE & ALIGNMENT

### 31.1 Organizational Structure (Early Stage)

| Role                     | Responsibility                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| Founder / CEO            | Product vision, fundraising, enterprise partnerships, final decision authority |
| CTO / Lead Engineer      | Architecture, security, infrastructure, engineering team                       |
| Head of Product          | Roadmap prioritization, feature specification, user research                   |
| Head of Growth           | Acquisition, activation, retention, partnerships                               |
| Legal Counsel (external) | Contract review, compliance, IP protection                                     |
| Accounting (external)    | Bookkeeping, tax preparation, R&D credits                                      |

**Board structure:** Pre-funding — no formal board. Founder(s) retain full decision authority. Advisory board to be established before Series A.

---

### 31.2 OKR Framework

DealStage should adopt quarterly OKRs. Proposed Q2 2026 OKRs:

**Objective 1: Achieve product-market fit with paying customers**

- KR1: Reach 100 paying organizations (Brand + Agency combined) by June 30, 2026.
- KR2: Achieve 25%+ trial-to-paid conversion rate.
- KR3: Maintain NPS > 50 among paid users.

**Objective 2: Complete core platform infrastructure**

- KR1: Launch OAuth social verification for 4 priority platforms (Instagram, YouTube, TikTok, X).
- KR2: Complete Stripe Checkout end-to-end flow for all 10 plans with < 0.5% payment failure rate.
- KR3: Launch automated email lifecycle sequences (welcome, trial expiry, deal updates).

**Objective 3: Establish operational excellence**

- KR1: Achieve < 48-hour support response time on 95% of tickets.
- KR2: Complete first RLS security audit with zero critical findings.
- KR3: Achieve > 99.9% platform uptime for the quarter.

**Objective 4: Build data foundation**

- KR1: Integrate Phyllo API for real social data on top 10% of talent profiles.
- KR2: Publish first internal rate benchmark report (anonymized) for Brand users.
- KR3: Achieve 500+ verified talent profiles with AQS scores.

---

### 31.3 Decision-Making Framework

| Decision Type            | Process                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Product roadmap changes  | Founder + Head of Product alignment; documented in product roadmap                                     |
| Engineering architecture | CTO decision; documented in architecture decision records (ADRs)                                       |
| Pricing changes          | Founder decision; requires update to `useFeatureGate`, Stripe products, and all 10 plan configurations |
| Legal document updates   | Legal counsel review; update timestamp in JSX component; version bump                                  |
| AI agent changes         | Reviewed PR to `agents.ts`; temperature and tier changes require sign-off                              |
| Enterprise deals         | Founder sign-off; custom pricing via Stripe; DPA required                                              |
| Data breach              | Founder + Legal Counsel; breach protocol in Section 30.4                                               |

---

### 31.4 Knowledge Management

| Asset                                       | Location                                                                   | Custodian                   |
| ------------------------------------------- | -------------------------------------------------------------------------- | --------------------------- |
| Company Operating Blueprint (this document) | `/docs/blueprint-sections-17-32.md`                                        | Founder                     |
| Technical architecture decisions            | ADR files (recommended: `/docs/adr/`)                                      | CTO                         |
| Social verification system design           | `/docs/superpowers/specs/2026-03-17-social-verification-system-design.md`  | Engineering                 |
| Product plans                               | `/docs/superpowers/plans/`                                                 | Product                     |
| Agent configurations                        | `/supabase/functions/ai-router/agents.ts`                                  | Engineering                 |
| Legal documents                             | `/src/pages/Privacy.jsx`, `Terms.jsx`, `GDPR.jsx`, `CookiePolicy.jsx`      | Legal Counsel + Engineering |
| Pricing plans                               | Stripe dashboard + `useFeatureGate.js` + Pricing page                      | Product + Engineering       |
| Vendor contracts                            | Secure document storage (recommended: Notion or Google Drive legal folder) | Founder                     |
| Financial records                           | Accounting software                                                        | Finance                     |

---

### 31.5 Meeting Cadence

| Meeting             | Frequency | Participants                    | Purpose                                           |
| ------------------- | --------- | ------------------------------- | ------------------------------------------------- |
| Founder sync        | Weekly    | Founder + CTO                   | Roadmap, blockers, strategy                       |
| Engineering standup | Daily     | Engineering team                | Progress, blockers                                |
| Product review      | Bi-weekly | Founder + Product + Engineering | Feature review, prioritization                    |
| OKR review          | Quarterly | All                             | OKR progress, next quarter planning               |
| Security review     | Quarterly | Founder + CTO                   | RLS audit, dependency review, AI agent governance |
| Financial review    | Monthly   | Founder + Finance               | P&L, runway, unit economics                       |

---

## SECTION 32: APPENDICES

### 32.1 Glossary

| Term                            | Definition                                                                                                                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AQS (Audience Quality Score)    | A composite score assigned to each talent profile that measures the authenticity, engagement quality, demographic accuracy, and growth trajectory of their social audience. Higher AQS = more credible audience. Used by brands to evaluate talent before committing to deals. |
| AI Router                       | DealStage's proprietary Supabase Edge Function that receives AI task requests, determines the appropriate model tier (COMPLEX, STANDARD, FREE), routes to the correct LLM provider, applies caching, and returns results. Core intellectual property.                          |
| Deal Score                      | A numerical creditworthiness score for partnership participants — analogous to a credit score for the creator economy. Calculated from payment history, deal completion rate, communication responsiveness, and dispute history. Lower risk = higher score.                    |
| Match Engine                    | The algorithm powering talent-brand compatibility recommendations. Combines AQS, Deal Score, category alignment, audience demographics, budget compatibility, and historical performance signals into a ranked match list.                                                     |
| Data Room                       | A secure, permission-gated area within a deal where confidential documents (rate cards, audience reports, performance data) can be shared between parties under NDA. Planned feature.                                                                                          |
| RLS (Row Level Security)        | Supabase/PostgreSQL feature that enforces data access control at the database row level. Every query is automatically filtered based on the authenticated user's identity and role. Critical for multi-tenant data isolation.                                                  |
| Edge Function                   | A serverless function running on Supabase's global edge network (Deno runtime). DealStage has 70+ edge functions handling AI routing, payment processing, webhook handling, and data operations.                                                                               |
| Escrow                          | The holding of deal payment funds in a secured Stripe account between deal creation and milestone completion. Funds are released only when delivery is confirmed by the paying party (brand).                                                                                  |
| Feature Gate                    | The `useFeatureGate` hook that determines which platform features a user can access based on their plan (free, trial, paid) and role. Prevents unauthorized access to paid features.                                                                                           |
| PWA (Progressive Web App)       | A web application that can be installed on a device's home screen and function with app-like behavior (offline support, push notifications). DealStage has `vite-plugin-pwa` installed as the first step toward mobile delivery.                                               |
| Phyllo                          | A third-party API that provides verified, real-time social media data (follower counts, engagement rates, audience demographics) by connecting directly to platform APIs. Planned integration to replace user-submitted metrics.                                               |
| Proof of Performance            | Documentation submitted by talent to confirm delivery of agreed content (screenshots, links, analytics reports). Reviewed by brand to trigger payment release. Built as a component in DealDetail.                                                                             |
| Routing Tier                    | The classification of an AI agent (COMPLEX, STANDARD, FREE) that determines which LLM provider is used, the cost per invocation, and the expected response quality.                                                                                                            |
| TTL (Time to Live)              | The cache duration for an AI agent's responses. Agents with deterministic, low-volatility outputs (compliance, contract analysis) have longer TTLs (6 hours, 24 hours). Real-time conversational agents have TTL=NONE.                                                         |
| Verification Boost              | The score improvement applied to a talent profile's marketplace ranking and visibility as they connect and verify more social platform accounts. Implemented in the `verificationBoost` library.                                                                               |
| White-Label                     | A version of the DealStage platform that can be customized with an agency's own branding (logo, colors, domain) and deployed as their proprietary talent management tool. Planned for 6-month roadmap.                                                                         |
| SAML / OIDC                     | Enterprise identity federation protocols. SAML 2.0 and OpenID Connect (OIDC) allow enterprise users to log in to DealStage using their corporate identity provider (Okta, Azure AD). Required for enterprise SSO. Planned for 12-month roadmap.                                |
| DPA (Data Processing Agreement) | A contract between DealStage (as data processor) and enterprise clients (as data controllers) that specifies how personal data is handled. Required under GDPR for any B2B relationship involving personal data processing. Planned.                                           |

---

### 32.2 Key Assumptions

The following assumptions underpin this blueprint. If any assumption proves incorrect, the relevant sections should be revisited.

| #   | Assumption                                                                                                                        | Impact if Wrong                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | The Supabase anon key committed to `.env` is intentional — it is a public-facing client key, protected by RLS policies.           | If RLS is not properly enforced, this represents a data exposure risk. Requires immediate RLS audit.     |
| 2   | All 88 platform verifications in ConnectAccounts are functional and correctly categorized.                                        | Inaccurate verification affects AQS scores and talent marketplace trust.                                 |
| 3   | The 32 AI agents in `agents.ts` are all actively wired to the AI router and invocable from the front-end.                         | If some agents are configured but not connected, the feature set as documented does not reflect reality. |
| 4   | Stripe is in live mode (evidenced by `pk_live_` key in `.env`).                                                                   | If not, no real payment transactions can occur and revenue is not possible.                              |
| 5   | Supabase RLS is enforced on all tables containing user data.                                                                      | Without RLS, any authenticated user could access any other user's data.                                  |
| 6   | The 7-day trial in `useFeatureGate` is the only trial mechanism; no manual trial extensions exist outside admin role bypass.      | Untracked trial extensions undermine conversion data integrity.                                          |
| 7   | DealStage LLC is a validly formed US legal entity with proper operating agreement.                                                | Undefined ownership creates cap table and liability risk.                                                |
| 8   | Legal documents (Terms, Privacy, GDPR, Cookie Policy) dated March 18, 2026, are reviewed and approved by qualified legal counsel. | Self-authored legal documents carry enforceability risk.                                                 |
| 9   | The `base44` SDK and vite plugin (`@base44/sdk`, `@base44/vite-plugin`) are licensed appropriately for commercial use.            | License terms must be reviewed; dependency on a third-party SDK may create vendor lock-in risk.          |
| 10  | AI provider APIs (Anthropic, DeepSeek, Google) are accessible without geographic restriction for all target markets.              | International expansion may require regional API endpoints or alternative providers.                     |

---

### 32.3 Future Considerations

The following items are outside the current scope but should be tracked for future planning cycles:

1. **Blockchain / smart contracts for deal automation:** Emerging use case for immutable deal records and automated payment release without centralized escrow dependency.
2. **Video content AI analysis:** Extending AI agents to analyze video content for brand safety, engagement prediction, and audience resonance scoring.
3. **Voice search and conversational UI:** AI command center extension to voice-first interface for talent discovery.
4. **Partnership co-investment features:** Enabling brands to co-invest in talent careers in exchange for long-term exclusivity or revenue share — a new financial instrument for the creator economy.
5. **Talent representation marketplace:** Agents and managers using DealStage as their primary deal flow management system with integrated commission tracking.
6. **Real-time audience demographic verification:** Live audience data pulled from social platforms (via Phyllo expansion) to provide brands with current, not historical, audience quality data at the moment of deal decision.
7. **Open AI agent marketplace:** Allow third-party developers to build and publish custom AI agents on the DealStage platform — extending the 32-agent library through a partner ecosystem.
8. **Multi-currency escrow:** Hold escrow funds in the talent's local currency to reduce FX risk in international deals.
9. **Regulatory monitoring:** As the creator economy matures, FTC, EU AI Act, and platform-specific regulations (TikTok, YouTube) will impose new compliance requirements. A regulatory watch function should be established.
10. **Carbon footprint tracking for AI:** Enterprise clients increasingly require carbon accounting for technology services; track and report AI API call carbon costs.

---

### 32.4 Document Control

| Field                 | Value                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document title        | DealStage Company Operating Blueprint — Sections 17–32                                                                                                                                                                                      |
| Version               | 1.0                                                                                                                                                                                                                                         |
| Date                  | March 19, 2026                                                                                                                                                                                                                              |
| Author                | Business Analysis Function                                                                                                                                                                                                                  |
| Status                | Draft — Pending Founder Review                                                                                                                                                                                                              |
| Next review date      | June 19, 2026 (quarterly)                                                                                                                                                                                                                   |
| Location              | `/Users/poweredbyexcellence/partneriq/docs/blueprint-sections-17-32.md`                                                                                                                                                                     |
| Related documents     | Blueprint Sections 1–16 (separate document); Social Verification System Design (`/docs/superpowers/specs/`); Social Verification Plan (`/docs/superpowers/plans/`)                                                                          |
| Change log            |                                                                                                                                                                                                                                             |
| v1.0 — March 19, 2026 | Initial draft. Sections 17–32 created from codebase analysis: `agents.ts`, `useFeatureGate.js`, `vercel.json`, `.env`, `package.json`, `Privacy.jsx`, `Terms.jsx`, `GDPR.jsx`, `CookiePolicy.jsx`, `ConnectAccounts.jsx`, `DealDetail.jsx`. |

---

_This document is confidential and proprietary to DealStage LLC. Distribution is restricted to authorized personnel. Nothing in this document constitutes legal, financial, or investment advice._
