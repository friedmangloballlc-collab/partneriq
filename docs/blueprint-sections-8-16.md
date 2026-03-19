# DealStage -- Company Operating Blueprint (Sections 8-16)

**Company:** DealStage LLC (www.thedealstage.com)
**Product:** AI-powered partnership intelligence platform connecting Talent, Brands, and Agencies
**Document Date:** March 19, 2026
**Classification:** Confidential -- Internal Use Only

---

## SECTION 8: TECHNICAL ARCHITECTURE

### 8.1 System Architecture

DealStage is a React single-page application built with Vite, backed entirely by Supabase (PostgreSQL, Edge Functions, Auth, Storage) and deployed on Vercel.

```
                         +-------------------+
                         |    Vercel CDN     |
                         |  (Static Assets)  |
                         +---------+---------+
                                   |
                         +---------+---------+
                         |  React SPA (Vite) |
                         |  Tailwind + Radix |
                         +---------+---------+
                                   |
              +--------------------+--------------------+
              |                    |                    |
    +---------+--------+ +--------+--------+ +---------+--------+
    | Supabase Auth    | | Supabase REST   | | Stripe Connect   |
    | (JWT + RLS)      | | (PostgREST)     | | (Payments)       |
    +------------------+ +--------+--------+ +------------------+
                                  |
                   +--------------+--------------+
                   |                             |
          +--------+--------+          +---------+---------+
          |   PostgreSQL    |          |  77 Edge Functions |
          |   (Managed)     |          |  (Deno Runtime)    |
          +-----------------+          +---------+---------+
                                                 |
                                    +------------+------------+
                                    |  AI Universal Router    |
                                    |  (Circuit Breaker)      |
                                    +--+----+----+----+------+
                                       |    |    |    |
                                  Anthropic  |  Gemini |
                                       DeepSeek   Groq
```

**Architecture Pattern:** Serverless monolith. The frontend is a fully client-rendered SPA. All server-side logic runs in Supabase Edge Functions (Deno). There is no custom backend server or container infrastructure. PostgreSQL handles all persistent state, with Row Level Security enforcing access control at the database layer.

### 8.2 Tech Stack Table

| Layer                     | Technology                     | Version / Detail               | Rationale                                                        |
| ------------------------- | ------------------------------ | ------------------------------ | ---------------------------------------------------------------- |
| **Frontend Framework**    | React                          | 18.2                           | Mature ecosystem, hiring pool, component library compatibility   |
| **Build Tool**            | Vite                           | 6.1                            | Sub-second HMR, native ESM, fast production builds               |
| **UI Components**         | Radix UI + Tailwind CSS        | Radix 1.x-2.x, Tailwind 3.4    | Accessible primitives with utility-first styling                 |
| **State / Data Fetching** | TanStack React Query           | 5.84                           | Cache management, background refetch, optimistic updates         |
| **Forms**                 | React Hook Form + Zod          | RHF 7.54, Zod 3.24             | Performant uncontrolled forms with schema validation             |
| **Charts**                | Recharts                       | 2.15                           | Declarative charting built on D3, React-native                   |
| **Routing**               | React Router                   | 6.26                           | Standard SPA routing with nested layouts                         |
| **Backend Runtime**       | Supabase Edge Functions (Deno) | Supabase JS 2.98               | Globally distributed, zero cold-start, TypeScript native         |
| **Database**              | PostgreSQL (Supabase Managed)  | 15+                            | Full-text search, JSONB, RLS, triggers, extensions               |
| **Authentication**        | Supabase Auth                  | JWT-based                      | Email/password with Zod validation, session management           |
| **Storage**               | Supabase Storage               | S3-compatible                  | Media kits, pitch decks, campaign assets                         |
| **AI -- Complex Tasks**   | Anthropic Claude               | claude-sonnet-4-20250514       | Best reasoning for deal coaching, contract analysis, negotiation |
| **AI -- Standard Tasks**  | DeepSeek                       | deepseek-chat                  | Cost-efficient for standard matching, outreach generation        |
| **AI -- Reasoning Tasks** | DeepSeek Reasoner              | deepseek_reasoner              | Extended chain-of-thought for forecasting, prediction            |
| **AI -- Free/Fast Tasks** | Google Gemini                  | 2.0-flash-exp, 1.5-flash       | Zero/low cost for classification, summarization                  |
| **AI -- Low Latency**     | Groq                           | LPU inference                  | Sub-200ms responses for real-time suggestions                    |
| **Payments**              | Stripe Connect                 | stripe-js 5.2, stripe 20.4     | Marketplace payments, escrow, multi-party payouts                |
| **Hosting**               | Vercel                         | Serverless                     | Automatic CI/CD from Git, edge network, preview deploys          |
| **Document Generation**   | jsPDF + docx + xlsx            | jsPDF 4.0, docx 9.6, xlsx 0.18 | Pitch deck PDFs, contract exports, data exports                  |
| **CSV Processing**        | PapaParse                      | 5.5                            | Bulk talent/brand import from CSV                                |
| **Error Tracking**        | Sentry (React SDK)             | 10.44                          | Frontend error capture, performance monitoring                   |
| **Testing**               | Vitest + Testing Library       | Vitest 4.1, RTL 16.3           | Unit and integration testing, jsdom environment                  |
| **Code Quality**          | ESLint + Prettier + Husky      | ESLint 9.19, Husky 9.1         | Pre-commit linting, consistent formatting                        |
| **PWA**                   | vite-plugin-pwa                | 1.2                            | Offline capability, installable on mobile                        |

### 8.3 API Layer

**Primary API:** Supabase PostgREST auto-generates a RESTful API from the PostgreSQL schema. All CRUD operations on tables (profiles, partnerships, campaigns, deals, outreach) go through PostgREST with RLS policies enforcing authorization.

**Edge Functions (77 total):** Server-side logic runs in Deno-based Edge Functions organized into functional domains:

| Domain                       | Functions | Examples                                                                                                                       |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **AI Intelligence**          | ~25       | ai-router, aiCommandCenter, aiDealCoach, analyzeNegotiationCoach, predictPartnershipSuccess, forecastRevenue                   |
| **Analytics & Insights**     | ~15       | analyzeAudienceOverlap, analyzeCampaignPostMortem, analyzeCompetitorIntelligence, benchmarkPerformance, identifySuccessFactors |
| **Outreach & Communication** | ~8        | generateAIOutreach, sendOutreachEmail, sendBulkOutreach, connectEmailAccount, scanEmailForDeals                                |
| **Payments & Subscriptions** | ~8        | handleStripeWebhook, initializeSubscription, upgradeSubscription, manageEscrow, setupStripeConnect                             |
| **Content & Documents**      | ~6        | personalizePitchDeck, generateCreativeDirection, localizeContent, generateExecutiveBriefing                                    |
| **Data Management**          | ~8        | importEntityData, exportEntityData, exportUserData, deduplicateIndustries, importAllConferences                                |
| **Alerts & Scheduling**      | ~7        | generateSmartAlerts, checkOpportunityAlerts, runScheduledAgents, processTriggerEvent, generateWeeklyBrief                      |

**AI Universal Router:** A tier-based routing system dispatches AI requests to the optimal provider based on task complexity:

| Routing Tier | Provider Priority (Fallback Order)         | Use Case                                              |
| ------------ | ------------------------------------------ | ----------------------------------------------------- |
| COMPLEX      | Anthropic > DeepSeek > Gemini > Groq       | Deal coaching, contract analysis, negotiation         |
| STANDARD     | DeepSeek > Anthropic Haiku > Gemini > Groq | Matching, outreach drafts, profile enrichment         |
| REASONING    | DeepSeek Reasoner > Anthropic > Gemini     | Revenue forecasting, trend prediction, ROI simulation |
| FREE         | Gemini > DeepSeek > Groq > Anthropic Haiku | Classification, tagging, basic summarization          |
| FAST         | Groq > DeepSeek > Gemini > Anthropic Haiku | Real-time suggestions, autocomplete, quick scoring    |
| BATCH        | Anthropic Haiku > DeepSeek > Gemini        | Bulk outreach, scheduled reports, data enrichment     |

**Stripe Webhooks:** The `handleStripeWebhook` edge function processes payment events (subscription creation, invoice payment, payment failure, escrow release) with idempotency keys.

### 8.4 Infrastructure

| Component          | Provider               | Configuration                                              | Scaling Model                                                  |
| ------------------ | ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| **Static Hosting** | Vercel                 | Vite build output to `dist/`, SPA rewrites to `index.html` | Edge CDN, automatic scaling, no cold starts for static assets  |
| **Database**       | Supabase Cloud (AWS)   | Managed PostgreSQL, connection pooling via PgBouncer       | Vertical scaling (plan tier), read replicas available at Pro+  |
| **Edge Functions** | Supabase (Deno Deploy) | 77 functions, globally distributed                         | Horizontal auto-scaling, per-request billing, ~50ms cold start |
| **File Storage**   | Supabase Storage (S3)  | Media kits, pitch decks, exports                           | Unlimited storage on paid plan, CDN-served                     |
| **DNS / SSL**      | Vercel + Supabase      | Automatic SSL, custom domain                               | Managed certificates, auto-renewal                             |
| **Payments**       | Stripe                 | Live mode (pk*live*\*), Connect for marketplace            | Stripe-managed infrastructure                                  |

**Deployment Pipeline:**

1. Developer pushes to Git
2. Vercel auto-builds (npm run build via Vite)
3. Static assets deployed to edge network with immutable caching (`max-age=31536000`)
4. Edge Functions deployed via Supabase CLI
5. Database migrations applied via Supabase migrations

**Caching Strategy:**

- Static assets: `Cache-Control: public, max-age=31536000, immutable` (content-hashed filenames)
- API responses: TanStack Query with configurable staleTime per query
- AI prompt caching: Anthropic ephemeral cache_control for system prompts (90% cost reduction on repeated calls)

---

## SECTION 9: SECURITY, PRIVACY & COMPLIANCE

### 9.1 Encryption

| Layer               | Standard              | Implementation                                                                                                                                                                     |
| ------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data at Rest**    | AES-256               | Supabase PostgreSQL transparent disk encryption (AWS EBS encryption). Supabase Storage encrypted at rest via S3 server-side encryption.                                            |
| **Data in Transit** | TLS 1.3               | All connections to Supabase and Vercel enforce HTTPS. HSTS header with `max-age=31536000; includeSubDomains; preload`.                                                             |
| **API Keys**        | Environment Variables | Supabase anon key exposed to client (read-only, RLS-gated). Secret keys (Stripe secret, AI provider keys) stored in Supabase Edge Function secrets -- never exposed to the client. |
| **Tokens**          | JWT (HS256)           | Supabase Auth issues JWTs with expiration. Refresh tokens rotated on use.                                                                                                          |

### 9.2 Access Control

**Row Level Security (RLS):** All database tables enforce RLS policies. Users can only read/write data they own or that belongs to partnerships they are a party to. RLS policies check `auth.uid()` against ownership columns.

**Role-Based Access:** Three user roles (Talent, Brand, Agency) with role-specific feature gating enforced by the `checkFeatureAccess` edge function and subscription plan tier.

**Authentication Flow:**

- Email/password authentication via Supabase Auth
- Password strength enforcement (min 6 chars, strength meter in UI)
- Zod schema validation on all auth inputs
- Session tokens stored in browser with automatic refresh

### 9.3 Security Headers (Vercel)

All responses from Vercel include the following headers:

| Header                      | Value                                                                                                                                                                                                               | Purpose                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `X-Frame-Options`           | DENY                                                                                                                                                                                                                | Prevents clickjacking                          |
| `X-Content-Type-Options`    | nosniff                                                                                                                                                                                                             | Prevents MIME type sniffing                    |
| `X-XSS-Protection`          | 1; mode=block                                                                                                                                                                                                       | Legacy XSS filter (defense in depth)           |
| `Referrer-Policy`           | strict-origin-when-cross-origin                                                                                                                                                                                     | Limits referrer leakage                        |
| `Permissions-Policy`        | camera=(), microphone=(), geolocation=(), interest-cohort=()                                                                                                                                                        | Disables unused browser APIs, opts out of FLoC |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains; preload                                                                                                                                                                        | Forces HTTPS for 1 year                        |
| `Content-Security-Policy`   | default-src 'self' https: wss: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; object-src 'none'; base-uri 'self'; | Restricts resource loading sources             |

### 9.4 Privacy & Compliance Status

| Regulation  | Status                 | Details                                                                                                                                                                                                                                                |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GDPR**    | In Progress            | Data export (`exportUserData` function) implemented. Account deletion (`deleteUserAccount` function) implemented. Privacy policy and cookie consent required before EU launch. Data Processing Agreement (DPA) template needed for enterprise clients. |
| **CCPA**    | In Progress            | "Do Not Sell" mechanism not yet implemented. Data export available. Privacy notice update required for California-specific disclosures.                                                                                                                |
| **SOC 2**   | Planned (2027)         | Supabase is SOC 2 Type II certified. DealStage-specific controls documentation not yet started. Required for enterprise agency tier sales.                                                                                                             |
| **PCI DSS** | Compliant (via Stripe) | DealStage never handles raw card data. All payment processing delegated to Stripe (PCI Level 1 certified). Stripe.js and Elements handle card input in iframes.                                                                                        |

### 9.5 Risk Controls

| Control                 | Implementation                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Input Validation**    | Zod schemas on all frontend forms. Edge Functions validate request bodies.                                                             |
| **SQL Injection**       | Supabase client uses parameterized queries. PostgREST prevents raw SQL.                                                                |
| **Rate Limiting**       | Supabase built-in rate limiting on Auth endpoints. Stripe webhook signature verification. AI router has per-provider circuit breakers. |
| **Secret Management**   | AI provider keys, Stripe secret key stored as Supabase Edge Function secrets. Client only has anon key (RLS-gated).                    |
| **Dependency Security** | Husky pre-commit hooks. ESLint static analysis. npm audit as part of CI.                                                               |
| **Session Security**    | JWT expiration with refresh token rotation. No long-lived sessions.                                                                    |

---

## SECTION 10: RISK ASSESSMENT

### Risk Register

| #   | Risk                                                                                                                                                | Category    | Probability | Impact   | Severity | Mitigation                                                                                                                                                                                                              | Owner                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| R1  | **AI Provider Outage** -- Single or multiple AI providers become unavailable, degrading core matching and intelligence features                     | Technical   | Medium      | High     | High     | Circuit breaker pattern with 30s recovery. 4-provider fallback chain per tier. Graceful degradation to cached results.                                                                                                  | Engineering              |
| R2  | **Supabase Platform Dependency** -- Single-vendor lock-in for database, auth, storage, and edge functions. Supabase outage = total platform outage. | Technical   | Low         | Critical | High     | Monitor Supabase status page. Maintain database schema exports for portability. Evaluate multi-region Supabase deployment at scale. Long-term: abstract data layer for potential migration.                             | CTO                      |
| R3  | **Stripe Payment Failures** -- Webhook delivery failures, Connect onboarding friction, or escrow disputes impact revenue collection                 | Financial   | Medium      | High     | High     | Idempotent webhook handler. Retry logic with exponential backoff. Manual escrow release fallback. Daily reconciliation checks (`analyzeInvoiceReconciliation`).                                                         | Engineering / Finance    |
| R4  | **Data Breach** -- Unauthorized access to user PII, partnership financial data, or proprietary deal terms                                           | Security    | Low         | Critical | Critical | RLS on all tables. Encryption at rest and in transit. Security headers. Regular access audits. Incident response plan (Section 12). Cyber insurance (planned).                                                          | Security / Engineering   |
| R5  | **Creator/Talent Fraud** -- Fake profiles, inflated metrics, or fraudulent partnership claims erode marketplace trust                               | Marketplace | Medium      | High     | High     | Brand safety analysis (`analyzeBrandSafety`). Social media data verification (`fetchSocialMediaData`). Community reporting. AI-powered anomaly detection.                                                               | Product / Trust & Safety |
| R6  | **Brand Safety Incident** -- Brand associated with inappropriate talent content, causing reputational damage and churn                              | Marketplace | Medium      | High     | High     | `analyzeBrandSafety` edge function for proactive scanning. Compliance disclosure analysis (`analyzeComplianceDisclosure`). Content effectiveness scoring. Brand safety alerts.                                          | Product                  |
| R7  | **Market Competition** -- CreatorIQ, Grin, AspireIQ, or a new entrant captures the market before DealStage reaches scale                            | Strategic   | High        | High     | Critical | Accelerate AI differentiation (proprietary router + match engine). Build data moat via deal completion data. Focus on 3-sided marketplace network effects. Land agency tier for distribution.                           | CEO / Strategy           |
| R8  | **AI Cost Escalation** -- Token costs increase faster than revenue as usage scales, compressing margins                                             | Financial   | Medium      | Medium   | Medium   | Tier-based routing sends low-value tasks to free/cheap models (Gemini, Groq). Anthropic prompt caching reduces repeated system prompt costs by 90%. Monitor cost-per-request. Set per-user AI budget caps by plan tier. | Engineering / Finance    |
| R9  | **Key Person Risk** -- Small founding team means departure of any engineer causes significant knowledge loss                                        | Operational | Medium      | High     | High     | Document architecture decisions. Code quality tooling (ESLint, Prettier, Husky). Comprehensive Edge Function naming conventions. Accelerate hiring plan.                                                                | CEO / HR                 |
| R10 | **Regulatory Risk** -- GDPR, CCPA, or new AI regulation imposes requirements that require significant engineering effort                            | Legal       | Medium      | Medium   | Medium   | Data export and deletion already implemented. Monitor regulatory landscape. Budget 1 sprint/quarter for compliance work. Engage privacy counsel before EU launch.                                                       | Legal / Engineering      |

---

## SECTION 11: SYSTEM RESILIENCE

### 11.1 SLA Targets

| Service                  | Target Uptime                   | Measurement                                    | Penalty Trigger                               |
| ------------------------ | ------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| **Platform (Web App)**   | 99.9% (8.76 hrs/year downtime)  | Synthetic monitoring + real user metrics       | Enterprise SLA credits at < 99.9%             |
| **Payment Processing**   | 99.95% (4.38 hrs/year downtime) | Stripe status + webhook delivery rate          | Escrow disputes auto-extended during downtime |
| **AI Features**          | 99.5% (43.8 hrs/year downtime)  | Per-provider health checks via circuit breaker | Graceful degradation -- non-blocking          |
| **API (Edge Functions)** | 99.9%                           | Supabase function invocation success rate      | Alert at > 1% error rate over 5 min window    |
| **Database**             | 99.99% (52 min/year downtime)   | Supabase managed monitoring                    | Inherited from Supabase Pro plan SLA          |

### 11.2 Fault Tolerance

**AI Universal Router -- Circuit Breaker Pattern:**
The circuit breaker tracks per-provider health with three states:

- **CLOSED (Healthy):** Requests flow normally. Failures are counted.
- **OPEN (Failed):** After 3 consecutive failures, the provider is bypassed for 30 seconds. Requests immediately fall through to the next provider in the tier's priority list.
- **HALF_OPEN (Testing):** After the 30-second recovery window, one test request is allowed. Success resets to CLOSED; failure returns to OPEN.

This means if Anthropic goes down, COMPLEX-tier requests automatically route to DeepSeek within milliseconds, with no user-visible interruption.

**Payment Resilience:**

- Stripe webhook handler uses idempotency keys to prevent duplicate processing
- Escrow state machine prevents funds from being released without proper deal completion signals
- `analyzeInvoiceReconciliation` function runs daily to detect payment/subscription mismatches
- Failed payment retries handled by Stripe's built-in Smart Retries

**Data Resilience:**

- TanStack React Query caches all fetched data client-side with configurable stale times
- Optimistic updates for UI responsiveness; server state reconciled on refetch
- Edge Functions are stateless -- any instance can serve any request

### 11.3 Backup & Recovery

| Component               | Backup Method                                   | Frequency                   | Retention          | RTO                              | RPO                                  |
| ----------------------- | ----------------------------------------------- | --------------------------- | ------------------ | -------------------------------- | ------------------------------------ |
| **PostgreSQL Database** | Supabase automated backups (WAL archiving)      | Daily full + continuous WAL | 30 days (Pro plan) | < 1 hour                         | < 5 minutes (point-in-time recovery) |
| **File Storage**        | Supabase Storage (S3 durability: 99.999999999%) | Continuous replication      | Indefinite         | < 30 minutes                     | 0 (synchronous)                      |
| **Edge Function Code**  | Git repository (source of truth)                | Every commit                | Indefinite         | < 15 minutes (redeploy from Git) | 0                                    |
| **Frontend Code**       | Git repository + Vercel build cache             | Every commit                | Indefinite         | < 5 minutes (redeploy)           | 0                                    |
| **Stripe Data**         | Stripe-managed redundancy                       | Continuous                  | Per Stripe policy  | N/A (Stripe-managed)             | 0                                    |

**Recovery Procedures:**

1. Database: Restore from Supabase dashboard point-in-time recovery (PITR)
2. Application: Redeploy from last known-good Git commit via Vercel
3. Edge Functions: Redeploy via Supabase CLI from Git
4. Complete rebuild: Full environment reproducible from Git + Supabase project config + environment secrets

### 11.4 Graceful Degradation Table

| Component Failure           | User Impact                                                 | Degraded Behavior                                                                                                           | Recovery Trigger                                        |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **All AI Providers Down**   | AI matching, deal coaching, outreach generation unavailable | Show cached match results. Display "AI features temporarily unavailable" banner. Manual search and browse still functional. | Circuit breaker HALF_OPEN test succeeds on any provider |
| **Single AI Provider Down** | None visible                                                | Router automatically falls to next provider in tier. Slightly different response quality possible.                          | Circuit breaker recovers after 30s                      |
| **Stripe Unavailable**      | Cannot process new payments or subscriptions                | Existing sessions continue. Free tier features remain available. Subscription management shows maintenance notice.          | Stripe status API returns healthy                       |
| **Supabase Storage Down**   | Media kits, pitch decks, exports unavailable                | Profile data still loads from PostgreSQL. Images show placeholders. Document generation queued for retry.                   | Supabase storage health check passes                    |
| **Supabase Auth Down**      | Cannot log in or sign up                                    | Existing JWT sessions remain valid until expiration. Logged-in users unaffected for session duration.                       | Supabase auth health check passes                       |
| **Vercel CDN Down**         | App inaccessible                                            | N/A -- total outage. Status page communication only.                                                                        | Vercel incident resolution                              |
| **Email Provider Down**     | Outreach emails, notifications not delivered                | Emails queued in database. In-app notifications still work. User sees "pending" status on outreach.                         | Email provider connectivity restored, queue drained     |

---

## SECTION 12: INCIDENT RESPONSE

### 12.1 Severity Definitions

| Level     | Name     | Definition                                                                                                  | Examples                                                                                                                    | Response Time     | Update Cadence   |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------- |
| **SEV-1** | Critical | Platform entirely unavailable or data breach confirmed. All users affected. Revenue impact immediate.       | Supabase total outage, database corruption, confirmed data exfiltration, Stripe Connect funds misrouted                     | < 15 minutes      | Every 30 minutes |
| **SEV-2** | Major    | Core feature broken for a significant portion of users. Workaround may exist but is unacceptable long-term. | AI router returning errors for all tiers, payment processing failing, authentication broken, search returning no results    | < 30 minutes      | Every 1 hour     |
| **SEV-3** | Minor    | Non-critical feature degraded. Limited user impact. Workaround available.                                   | Single AI provider down (fallback active), pitch deck export failing, email notifications delayed, analytics dashboard slow | < 2 hours         | Every 4 hours    |
| **SEV-4** | Low      | Cosmetic issues, minor bugs, non-urgent improvements. No business impact.                                   | UI rendering glitch, non-blocking console errors, minor copy mistakes, slow non-critical query                              | Next business day | Resolution only  |

### 12.2 Response Framework

**Roles:**

- **Incident Commander (IC):** Coordinates response, makes decisions, communicates status. (Founder/CTO until team scales.)
- **Technical Lead:** Diagnoses root cause, implements fix, validates resolution.
- **Communications Lead:** Drafts user-facing updates, notifies affected enterprise clients directly.

**Process:**

1. **Detect:** Sentry alert, user report, or automated health check triggers incident
2. **Triage:** IC assesses severity level within 5 minutes
3. **Assemble:** IC pages relevant personnel based on severity
4. **Diagnose:** Technical Lead identifies root cause and blast radius
5. **Mitigate:** Apply immediate fix or activate degradation mode
6. **Communicate:** Status page update + direct notification for SEV-1/SEV-2
7. **Resolve:** Confirm fix with monitoring. Remove degradation mode.
8. **Postmortem:** Within 48 hours for SEV-1/SEV-2. Blameless root cause analysis. Action items tracked to completion.

### 12.3 Scenario Playbooks

#### Playbook 1: Platform Outage (SEV-1)

**Trigger:** Application returns 5xx errors or is unreachable for > 2 minutes.

| Step | Action                                                                                                                        | Owner     |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1    | Check Vercel status dashboard. If Vercel outage, confirm on their status page and communicate to users.                       | IC        |
| 2    | Check Supabase status dashboard. If Supabase outage, confirm scope (database, auth, edge functions, storage).                 | IC        |
| 3    | If Vercel healthy, check last deployment. Rollback to previous deployment via Vercel dashboard if recent deploy caused issue. | Tech Lead |
| 4    | If Supabase healthy, check Edge Function logs for error spikes. Identify failing function and disable or fix.                 | Tech Lead |
| 5    | Post status page update: "We are experiencing platform issues and are actively investigating."                                | Comms     |
| 6    | Once mitigated, monitor for 30 minutes. Confirm error rates return to baseline.                                               | Tech Lead |
| 7    | Post resolution update. Begin postmortem.                                                                                     | IC        |

#### Playbook 2: Data Breach (SEV-1)

**Trigger:** Unauthorized data access detected via audit logs, user report, or security scan.

| Step | Action                                                                                         | Owner         |
| ---- | ---------------------------------------------------------------------------------------------- | ------------- |
| 1    | Immediately revoke compromised credentials (Supabase API keys, Stripe keys, AI provider keys). | Tech Lead     |
| 2    | Assess scope: which tables, how many records, what data types (PII, financial, deal terms).    | Tech Lead     |
| 3    | Enable additional RLS restrictions if lateral movement is possible.                            | Tech Lead     |
| 4    | Preserve evidence: export audit logs, access logs, Edge Function invocation logs.              | Tech Lead     |
| 5    | Notify legal counsel. Determine regulatory notification obligations (GDPR: 72 hours).          | IC / Legal    |
| 6    | Notify affected users with specifics on what data was exposed and recommended actions.         | Comms / Legal |
| 7    | Engage external security firm for forensic analysis if breach scope is uncertain.              | IC            |
| 8    | Implement remediations from forensic findings. Rotate all secrets.                             | Tech Lead     |
| 9    | Postmortem with external review. Update security controls.                                     | IC            |

#### Playbook 3: Payment Failure (SEV-2)

**Trigger:** Stripe webhook delivery failing, subscriptions not activating, or escrow release errors.

| Step | Action                                                                                  | Owner     |
| ---- | --------------------------------------------------------------------------------------- | --------- |
| 1    | Check Stripe Dashboard for webhook delivery status and error codes.                     | Tech Lead |
| 2    | Check `handleStripeWebhook` Edge Function logs for errors.                              | Tech Lead |
| 3    | If webhook signature verification failing, check if Stripe signing secret was rotated.  | Tech Lead |
| 4    | If Stripe Connect issue, check `setupStripeConnect` and `manageEscrow` function logs.   | Tech Lead |
| 5    | For stuck subscriptions: manually reconcile via `analyzeInvoiceReconciliation`.         | Tech Lead |
| 6    | Notify affected users: "Your payment is being processed. No action needed on your end." | Comms     |
| 7    | Run `getInvoices` and `getUserSubscriptionStatus` to verify data consistency post-fix.  | Tech Lead |

#### Playbook 4: AI System Failure (SEV-3)

**Trigger:** AI-powered features returning errors or degraded results across multiple user requests.

| Step | Action                                                                                                         | Owner          |
| ---- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| 1    | Check circuit breaker health status (`getHealthStatus`). Identify which providers are OPEN.                    | Tech Lead      |
| 2    | If all providers in a tier are OPEN, check provider status pages (Anthropic, DeepSeek, Google AI, Groq).       | Tech Lead      |
| 3    | If API key issue (401 errors), verify secrets in Supabase Edge Function environment.                           | Tech Lead      |
| 4    | If rate limiting (429 errors), check usage dashboards. Consider temporarily routing to backup providers.       | Tech Lead      |
| 5    | Enable cached/fallback responses for AI-dependent features. Show "AI features are experiencing delays" banner. | Tech Lead      |
| 6    | Monitor circuit breaker recovery. Providers should auto-recover when HALF_OPEN test succeeds.                  | Tech Lead      |
| 7    | If sustained outage > 1 hour, evaluate adding a new provider to affected tier.                                 | IC / Tech Lead |

---

## SECTION 13: BUSINESS MODEL & ECONOMICS

### 13.1 Revenue Streams

#### Primary: Subscription Revenue (SaaS)

DealStage offers 10 subscription plans across 3 user roles, with free tiers to drive adoption:

**Talent Plans:**

| Plan               | Price      | Key Limits                                                         | Target Segment                         |
| ------------------ | ---------- | ------------------------------------------------------------------ | -------------------------------------- |
| **Starter (Free)** | $0 forever | 3 brief views/mo, 1 partnership                                    | Evaluators, micro-creators             |
| **Rising**         | $99/mo     | 5 partnerships, 15 outreach/mo, basic AI matching                  | Emerging creators (10K-100K followers) |
| **Pro**            | $249/mo    | 20 partnerships, unlimited outreach, smart scoring, pitch deck AI  | Mid-tier creators (100K-1M followers)  |
| **Elite**          | $499/mo    | Unlimited partnerships, auto-matching, AI brand recs, dedicated AM | Top-tier creators (1M+ followers)      |

**Brand Plans:**

| Plan                | Price               | Key Limits                                                  | Target Segment                     |
| ------------------- | ------------------- | ----------------------------------------------------------- | ---------------------------------- |
| **Explorer (Free)** | $0 forever          | Limited browse, 1 brief/mo, 1 partnership                   | Evaluators, small DTC brands       |
| **Growth**          | $499/mo             | 5 briefs/mo, 15 partnerships, 50 outreach/mo, basic AI      | Growth-stage brands ($1M-$10M rev) |
| **Scale**           | $1,299/mo           | Unlimited briefs, 100 partnerships, smart scoring, 10 seats | Mid-market brands ($10M-$100M rev) |
| **Enterprise**      | Custom ($2,500+/mo) | Unlimited everything, white-label, custom templates, SLA    | Enterprise brands ($100M+ rev)     |

**Agency Plans:**

| Plan                  | Price               | Key Limits                                                       | Target Segment                     |
| --------------------- | ------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| **Agency Starter**    | $2,499/mo           | 5 brands or 25 talent, 10 seats, approval workflows              | Boutique agencies (< 20 clients)   |
| **Agency Pro**        | $4,999/mo           | 20 brands or 100 talent, unlimited seats, cross-client analytics | Mid-size agencies (20-100 clients) |
| **Agency Enterprise** | Custom ($9,999+/mo) | Unlimited, white-label, API access, SSO, dedicated success team  | Large agencies (100+ clients)      |

**Pricing Architecture:**

- Monthly billing standard. Annual billing planned (15-20% discount) to improve retention and cash flow.
- All plans managed via Stripe Subscriptions with the `initializeSubscription` and `upgradeSubscription` Edge Functions.
- Feature gating enforced by `checkFeatureAccess` function checking subscription tier.

#### Secondary: Transaction Revenue

- **Escrow Fees:** Percentage-based fee on deal payments processed through Stripe Connect (`manageEscrow` function). Brands pay talent through platform escrow for deal completion verification.
- **Payment Processing Margin:** Spread on Stripe Connect processing fees.

#### Future Revenue Streams (Planned)

- **Data Intelligence Products:** Aggregated (anonymized) partnership benchmarking data, industry rate benchmarks (`updateRateBenchmarks`), trend reports.
- **API Access:** Agency Enterprise tier includes API access. Standalone API product for programmatic deal sourcing planned.
- **Premium AI Add-ons:** Per-use pricing for expensive AI operations (contract analysis, competitive intelligence) beyond plan limits.

### 13.2 Unit Economics Targets

| Metric                         | Current Target | 12-Month Target | Notes                                                   |
| ------------------------------ | -------------- | --------------- | ------------------------------------------------------- |
| **Blended ARPU**               | $180/mo        | $280/mo         | Weighted across free and paid users                     |
| **Free-to-Paid Conversion**    | 8%             | 12%             | AI feature gating drives conversion                     |
| **Monthly Churn (SMB)**        | < 5%           | < 3%            | Switching costs increase with deal history              |
| **Monthly Churn (Enterprise)** | < 2%           | < 1%            | Annual contracts + dedicated AM                         |
| **Gross Margin**               | 70%            | 78%             | Infrastructure costs decrease with AI cost optimization |
| **CAC (Self-Serve)**           | $150           | $120            | Content marketing + organic + free tier                 |
| **CAC (Enterprise)**           | $5,000         | $4,000          | Direct sales + POC program                              |
| **LTV:CAC Ratio**              | 3:1            | 5:1             | Target for sustainable growth                           |
| **Payback Period**             | 6 months       | 4 months        | Time to recover CAC                                     |

### 13.3 Cost Structure

| Category                                                  | Monthly Estimate (Current)          | % of Revenue            | Scaling Behavior                                                                                                                                               |
| --------------------------------------------------------- | ----------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase (Database + Auth + Storage + Edge Functions)** | $400-$800                           | ~15%                    | Step-function (plan tiers). Pro plan at $25/project + compute + bandwidth.                                                                                     |
| **Vercel (Hosting + CDN)**                                | $20-$100                            | ~2%                     | Per-seat team pricing + bandwidth. Very low for SPA.                                                                                                           |
| **AI Provider Costs**                                     | $500-$2,000                         | ~20%                    | Linear with user activity. Tokens: $0.05-$3.00 per 1M depending on provider/model. Prompt caching reduces Anthropic costs by ~90% for repeated system prompts. |
| **Stripe Fees**                                           | 2.9% + $0.30 per txn + Connect fees | ~3-4% of payment volume | Linear with GMV. Non-negotiable at current volume.                                                                                                             |
| **Domain + Email + SaaS Tools**                           | $100-$300                           | ~3%                     | Mostly fixed                                                                                                                                                   |
| **Headcount**                                             | $0 (founder-led)                    | 0%                      | Largest future cost. First hires: Sr Full-Stack ($150K-$200K), ML Engineer ($170K-$220K).                                                                      |

**AI Cost Optimization Levers:**

1. Tier-based routing sends 60%+ of requests to free/cheap models (Gemini flash, Groq)
2. Anthropic prompt caching with `cache_control: { type: 'ephemeral' }` -- 90% cost reduction on system prompts
3. DeepSeek as primary STANDARD tier provider -- significantly cheaper than Anthropic/OpenAI
4. Batching operations where possible (BATCH tier uses cheapest models)

### 13.4 Financial Controls

| Control                 | Implementation                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Revenue Recognition** | Stripe Billing handles proration, plan changes, and invoice generation. Revenue recognized monthly as service is delivered. |
| **Expense Tracking**    | AI provider costs tracked per-function invocation. Monthly cost review against budget.                                      |
| **Cash Flow**           | Monthly subscription billing provides predictable cash flow. Annual billing planned to improve cash position.               |
| **Budget Alerts**       | AI provider API dashboards with spend alerts. Supabase billing alerts at 80% of plan limits.                                |
| **Fraud Prevention**    | Stripe Radar for payment fraud. Free tier rate limits prevent abuse. AI usage caps per subscription tier.                   |
| **Financial Reporting** | Stripe Dashboard for MRR, churn, ARPU. Custom analytics via `forecastRevenue` Edge Function.                                |

---

## SECTION 14: GO-TO-MARKET

### 14.1 Launch Strategy

**Phase 1: Open Beta (Current)**

- All three user roles (Talent, Brand, Agency) available simultaneously
- Free tiers for Talent and Brand to drive initial supply/demand
- Live Stripe payments enabled (pk_live key active)
- PWA support for mobile-first creators

**Phase 2: Public Launch (Target: Q3 2026)**

- Product Hunt launch + creator community outreach
- Case studies from beta partnerships
- Referral program activation
- Annual billing option with discount

**Phase 3: Enterprise Push (Target: Q1 2027)**

- Agency Enterprise tier with white-label and SSO
- SOC 2 certification for enterprise sales requirements
- Direct sales team for $2,500+/mo contracts
- API access product for programmatic integrations

### 14.2 Acquisition Strategy by User Type

| User Type  | Primary Channels                                                                                   | Conversion Path                                                                            | Key Metric                                    |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Talent** | Instagram/TikTok ads, creator community partnerships, word-of-mouth, SEO ("brand deal platform")   | Free signup > Complete profile > Receive first match > Upgrade for more matches/outreach   | Profile completion rate, first match time     |
| **Brand**  | LinkedIn ads, content marketing (partnership ROI blog), industry events, outbound to marketing VPs | Free signup > Post campaign brief > Receive talent matches > Upgrade for more partnerships | Brief-to-match time, first deal closed        |
| **Agency** | Direct outbound sales, industry conferences, partner referrals from brands/talent, case studies    | Demo request > POC with 1 client > Agency Starter > Expand to Agency Pro                   | Demo-to-POC conversion, client expansion rate |

### 14.3 Growth Loops

**Primary Loop: Deal Completion Flywheel**

```
More Talent sign up
      |
      v
Better matching data (AI trains on preferences)
      |
      v
Higher match quality attracts Brands
      |
      v
More campaign briefs posted
      |
      v
More deals completed through platform
      |
      v
Richer deal data improves AI matching
      |
      v
More Talent sign up (cycle repeats)
```

**Secondary Loop: Data Room Enrichment**

- Each completed deal generates performance data
- Performance data feeds `benchmarkPerformance`, `identifySuccessFactors`, `predictPartnershipSuccess`
- Better predictions attract sophisticated buyers (brands/agencies willing to pay premium tiers)
- Premium users generate higher-value data

**Tertiary Loop: Agency Distribution**

- One Agency Starter account brings 5 brands + 25 talent to the platform
- Those brands and talent invite their own connections
- Network grows 30:1 per agency onboarded

### 14.4 Enterprise Sales Motion

**Target Accounts:** Agencies managing $10M+ in annual partnership spend

**Sales Process:**

1. Outbound via LinkedIn + industry events (identify Head of Partnerships / VP Influencer Marketing)
2. 30-minute demo focusing on AI matching, cross-client analytics, and approval workflows
3. 2-week POC with 1 client (Agency Starter at reduced rate)
4. Expand to full portfolio (Agency Pro or Enterprise)
5. Annual contract with SLA ($2,499-$9,999+/mo)

**Enterprise Feature Differentiation:**

- White-label platform with custom domain
- SSO and advanced security with audit logs
- Full API access and custom endpoints
- Custom BI dashboards and data exports
- Dedicated success team and SLA support

---

## SECTION 15: COMPETITIVE LANDSCAPE

### 15.1 Direct Competitors

| Competitor            | Funding        | Strength                                                                | Weakness                                                                        | DealStage Differentiation                                                          |
| --------------------- | -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **CreatorIQ**         | $40M+ Series C | Enterprise market leader, deep analytics, largest brand client base     | Expensive ($3K+/mo entry), talent-unfriendly (brands-only tool), no AI matching | 3-sided marketplace (talent has agency), AI-native architecture, lower entry price |
| **Grin**              | $52M Series B  | Strong ecommerce integration (Shopify, WooCommerce), creator management | ecommerce-focused (not full partnership), no agency tier, limited AI            | Broader partnership types beyond ecommerce, agency management, AI deal coaching    |
| **AspireIQ (Aspire)** | $100M+         | Large creator database, campaign management, content library            | Acquisition by large corp slowed innovation, complex UX, no escrow              | Faster AI-driven matching, simpler UX, integrated escrow payments                  |
| **Upfluence**         | $30M+          | Social data enrichment, ecommerce plugins, ambassador programs          | Primarily discovery tool (weak on deal management), no AI coaching              | End-to-end deal lifecycle (discovery through payment), AI negotiation coach        |

### 15.2 Indirect Competitors

| Alternative                         | Usage Context                                 | DealStage Advantage                                                                    |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Talent Agencies (CAA, WME, UTA)** | High-touch representation for top-tier talent | Self-service for mid-tier, AI-augmented for all tiers, lower fees, transparent pricing |
| **Spreadsheets / Airtable**         | Brands tracking partnerships manually         | Automated matching, AI outreach, integrated payments, analytics                        |
| **LinkedIn Outreach**               | Cold outreach to potential partners           | AI-personalized pitch decks, match scoring, structured deal flow                       |
| **Email + Calendly**                | Manual coordination between parties           | Centralized deal room, automated workflows, escrow, contract intelligence              |
| **Hashtag Paid / #paid**            | Creator marketplace for content campaigns     | Broader partnership types (not just content), agency tier, AI intelligence layer       |

### 15.3 Moat Analysis

| Moat Type                  | Current State | Strength (1-5) | Building Strategy                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data Moat**              | Building      | 2/5            | Every completed deal generates proprietary matching data. `benchmarkPerformance`, `identifySuccessFactors`, and `predictPartnershipSuccess` improve with volume. Rate benchmarks (`updateRateBenchmarks`) create unique pricing intelligence. No competitor has 3-sided deal completion data.                                                                                                              |
| **Network Effects**        | Building      | 2/5            | 3-sided marketplace (Talent + Brand + Agency) creates strong cross-side network effects. Each new talent makes the platform more valuable for brands, and vice versa. Agencies amplify this 30:1. Chicken-and-egg problem is the risk -- mitigated by free tiers on both sides.                                                                                                                            |
| **Switching Costs**        | Building      | 2/5            | Deal history, relationship data, and AI-learned preferences create lock-in over time. Integrated payments and escrow make mid-deal migration costly. Agency tier with multi-client data creates deep entrenchment.                                                                                                                                                                                         |
| **Proprietary Technology** | Yes           | 4/5            | **AI Universal Router:** 4-provider architecture with circuit breakers and tier-based routing is unique in the space. No competitor routes across Anthropic + DeepSeek + Gemini + Groq dynamically. **AI Match Engine:** Multi-signal scoring that improves with platform data. **77 specialized Edge Functions** covering the entire partnership lifecycle from discovery through payment reconciliation. |
| **Brand / Trust**          | Building      | 1/5            | Early stage. Building through successful beta partnerships, transparent pricing, and escrow-protected payments. Agency Enterprise tier with SLA builds enterprise credibility.                                                                                                                                                                                                                             |

### 15.4 Competitive Response Playbook

| Competitor Action                    | DealStage Response                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| CreatorIQ adds AI matching           | Emphasize 3-sided marketplace and lower pricing. They lack talent-side tools.                |
| Grin adds agency management          | Highlight AI deal coaching and cross-platform matching (not just ecommerce).                 |
| New entrant with VC funding          | Accelerate data moat. Focus on deal completion volume. Network effects compound.             |
| Large platform (Meta, Google) enters | Partner or specialize. Big platforms generalize; DealStage specializes in deal intelligence. |

---

## SECTION 16: TEAM & ORGANIZATION

### 16.1 Company Formation

| Detail           | Value                   |
| ---------------- | ----------------------- |
| **Legal Entity** | DealStage LLC           |
| **Founded**      | 2024                    |
| **Jurisdiction** | United States           |
| **Website**      | www.thedealstage.com    |
| **Stage**        | Pre-Seed / Bootstrapped |

**Founding Team:** [Placeholder -- to be completed by founders]

| Role             | Name | Background   | Equity |
| ---------------- | ---- | ------------ | ------ |
| CEO / Co-Founder | TBD  | [Background] | [%]    |
| CTO / Co-Founder | TBD  | [Background] | [%]    |

### 16.2 Current Organizational Structure

DealStage operates as a lean, engineering-first startup with a minimal team:

```
CEO / Co-Founder
|
+-- CTO / Co-Founder
|   |
|   +-- Engineering (full-stack, AI, infrastructure)
|   +-- Product (feature prioritization, UX decisions)
|
+-- Business Development (partnerships, early sales)
+-- Operations (finance, legal, admin)
```

**Current Operating Model:**

- Engineering-first: founders handle product, engineering, and business development
- 77 Edge Functions and a full React SPA built and maintained by founding team
- AI architecture (4-provider router with circuit breakers) designed for scale from day one
- Stripe Connect integration for marketplace payments operational
- Code quality maintained via ESLint, Prettier, Husky pre-commit hooks, Vitest testing

### 16.3 Hiring Plan

**Phase 1: Immediate Hires (Next 6 months)**

| Role                           | Priority | Salary Range | Rationale                                                                                                                               |
| ------------------------------ | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Senior Full-Stack Engineer** | P0       | $150K-$200K  | Scale the 77-function Edge Function layer. Build real-time features. Improve test coverage. React + Supabase + TypeScript required.     |
| **ML / AI Engineer**           | P0       | $170K-$220K  | Improve match engine accuracy. Fine-tune models on partnership data. Optimize AI router cost/performance. Build recommendation systems. |

**Phase 2: Growth Hires (6-12 months)**

| Role                          | Priority | Salary Range             | Rationale                                                                                                       |
| ----------------------------- | -------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Head of Partnerships / BD** | P1       | $130K-$170K + commission | Land Agency tier contracts ($2,499-$9,999/mo). Build agency pipeline. Industry event presence.                  |
| **Growth Marketing Manager**  | P1       | $110K-$150K              | Content marketing (partnership ROI blog). SEO. Paid acquisition (LinkedIn, Instagram). Email nurture sequences. |
| **Customer Success Manager**  | P1       | $90K-$120K               | Onboard enterprise clients. Reduce churn. Drive expansion revenue. Handle Agency tier relationships.            |

**Phase 3: Scale Hires (12-24 months)**

| Role                           | Priority | Salary Range            | Rationale                                                                                                    |
| ------------------------------ | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Frontend Engineer**          | P2       | $130K-$170K             | PWA optimization. Mobile experience. Design system build-out.                                                |
| **DevOps / Platform Engineer** | P2       | $150K-$190K             | Observability (Sentry, logging, alerting). CI/CD pipeline. Performance optimization. Potential multi-region. |
| **Data Analyst**               | P2       | $100K-$140K             | Build internal dashboards. Revenue analytics. AI cost tracking. Customer behavior insights.                  |
| **Product Designer**           | P2       | $120K-$160K             | User research. Design system. Enterprise UX. Agency workflow optimization.                                   |
| **Account Executive (2x)**     | P2       | $80K-$100K + commission | Enterprise brand and agency outbound sales.                                                                  |

### 16.4 Governance

**Board Composition (Current):**

| Seat   | Holder                               | Type      |
| ------ | ------------------------------------ | --------- |
| Seat 1 | CEO / Co-Founder                     | Common    |
| Seat 2 | CTO / Co-Founder                     | Common    |
| Seat 3 | [Open -- reserved for lead investor] | Preferred |

**Advisory Board (Planned):**

- Creator economy industry expert (e.g., former VP at major talent agency)
- B2B SaaS scaling advisor (e.g., founder of $50M+ ARR marketplace)
- AI/ML technical advisor (e.g., senior ML engineer from major AI company)

**OKR Framework:**

Quarterly OKRs set by founders. Key areas:

| Pillar          | Example Objective                    | Key Results                                                                                            |
| --------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Product**     | Deliver AI matching that users trust | KR1: Match acceptance rate > 40%. KR2: AI satisfaction score > 4.2/5. KR3: < 2s match generation time. |
| **Growth**      | Build initial marketplace liquidity  | KR1: 500 active talent profiles. KR2: 100 active brand accounts. KR3: 10 agency accounts.              |
| **Revenue**     | Achieve $50K MRR                     | KR1: 30 paid talent subscriptions. KR2: 15 paid brand subscriptions. KR3: 3 agency contracts.          |
| **Engineering** | Platform reliability and velocity    | KR1: 99.9% uptime. KR2: < 500ms p95 API latency. KR3: 80%+ test coverage on critical paths.            |

**Decision-Making Framework:**

- **Reversible decisions** (< $5K impact, < 1 week to undo): Individual founder decides, informs the other
- **Irreversible decisions** ($5K+ impact or hard to reverse): Both founders agree. Document rationale.
- **Strategic decisions** (fundraising, major pivots, key hires): Board-level discussion.

**Meeting Cadence:**

- Daily: Async standup (< 5 min written update)
- Weekly: Product + engineering review (30 min)
- Monthly: Financial review, OKR check-in, growth metrics
- Quarterly: OKR setting, strategic planning, board update

---

_End of Sections 8-16. Document generated March 19, 2026._
