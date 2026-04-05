# DealStage Platform Documentation -- Batch 4

**Company:** DealStage (legal entity: PartnerIQ)
**URL:** thedealstage.com
**Generated:** 2026-03-29
**Deliverables in this batch:** 10, 11, 12, 15
**Cross-references:** Batch 1 IDs (TBL-001 through TBL-068, PER-001 through PER-007), Batch 2 IDs (PG-001 through PG-094, EVT-001 through EVT-070, API-001 through API-018, AGT-001 through AGT-029), Batch 3 IDs (Step 1.1 through 15.3, TC-001 through TC-055, DEP-001 through DEP-035)

---

# DELIVERABLE 10: RISK & FAILURE MODE MATRIX

## Overview

This matrix catalogs every significant failure mode across the DealStage platform. Each risk is scored on a 1-5 scale for Probability (likelihood of occurring in any given month) and Impact (severity when it does occur). Financial impact is estimated against current infrastructure ($470-$1,140/mo) and projected Year 1 revenue targets.

### Scoring Key

| Score | Probability               | Impact                                       |
| ----- | ------------------------- | -------------------------------------------- |
| 1     | Rare (<1% monthly chance) | Negligible (no user impact)                  |
| 2     | Unlikely (1-10%)          | Minor (degraded experience, <10 users)       |
| 3     | Possible (10-30%)         | Moderate (feature broken, workaround exists) |
| 4     | Likely (30-60%)           | Major (core feature down, revenue impact)    |
| 5     | Almost Certain (>60%)     | Critical (full outage, data loss, legal)     |

### Risk Priority = Probability x Impact

| Priority Score | Classification | Response Required              |
| -------------- | -------------- | ------------------------------ |
| 1-4            | Low            | Monitor, address in backlog    |
| 5-9            | Medium         | Plan mitigation within 30 days |
| 10-15          | High           | Mitigate within 7 days         |
| 16-25          | Critical       | Mitigate immediately           |

---

## Area 1: AI Matching Engine

### RISK-001: Algorithm Bias Toward High-Follower Talent

| Field                 | Detail                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-001                                                                                                                                                                                                                                                                              |
| **Area**              | Matching                                                                                                                                                                                                                                                                              |
| **Failure Mode**      | Match scoring algorithm (AGT-002, Step 6.1) systematically ranks high-follower talent above nano/micro creators regardless of brand fit, creating a winner-take-all dynamic that excludes 80% of the talent base                                                                      |
| **Root Cause**        | `total_followers` weight in the 5-dimension scoring formula (niche adjacency, tone matching, audience overlap, platform alignment, engagement fit) disproportionately influences final score. The `engagement_rate` dimension does not sufficiently counterbalance raw follower count |
| **Impact**            | Nano/micro talent (the majority of the user base) receives poor matches and churns. Brands miss high-ROI partnerships with engaged niche creators. Platform reputation suffers as a "big creator only" tool                                                                           |
| **Financial Impact**  | $0/hour during incident (silent failure). $2,000-$5,000/month in lost conversions from talent churn over 90 days if unaddressed                                                                                                                                                       |
| **Probability**       | 4 (Likely)                                                                                                                                                                                                                                                                            |
| **Detection**         | Monthly audit of match score distribution by talent tier. Alert if >70% of top-10 matches for any brand are macro/mega tier. Dashboard metric: match score standard deviation across tiers                                                                                            |
| **Mitigation**        | Cap follower weight at 15% of total score. Introduce tier-normalized scoring where each tier competes against its own benchmark. Add "discovery boost" for nano/micro talent with high engagement relative to tier                                                                    |
| **Fallback**          | Manual curation: flag brands receiving skewed match results, surface alternative nano/micro matches in a "Hidden Gems" section on PG-055 (MatchEngine)                                                                                                                                |
| **Incident Playbook** | INC-004                                                                                                                                                                                                                                                                               |

### RISK-002: Cold Start Problem for New Users

| Field                 | Detail                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-002                                                                                                                                                                                                                                                                  |
| **Area**              | Matching                                                                                                                                                                                                                                                                  |
| **Failure Mode**      | New talent users with empty profiles receive zero meaningful matches. New brands with no partnership history get generic recommendations. First-time experience is empty and confusing                                                                                    |
| **Root Cause**        | Match scoring (Step 6.1) requires data from `enriched_creators` (TBL-014), `enriched_brands` (TBL-015), and partnership history in `partnerships` (TBL-004). New users have none of this data. Crawl4AI enrichment (Step 4.1, 4.3) runs asynchronously and may take hours |
| **Impact**            | New users see "No matches found" or low-confidence results. 40-60% of new users who see empty results never return (industry benchmark for marketplace cold start)                                                                                                        |
| **Financial Impact**  | $500-$2,000/month in lost activations. At $29-$99/mo ARPU, each lost conversion = $348-$1,188 LTV lost                                                                                                                                                                    |
| **Probability**       | 5 (Almost Certain -- affects every new user)                                                                                                                                                                                                                              |
| **Detection**         | Track "time to first meaningful match" metric. Alert if median > 24 hours. Monitor onboarding completion rate (Step 2.5) to match delivery rate                                                                                                                           |
| **Mitigation**        | Implement onboarding questionnaire that collects niche, platform, audience size, and budget to generate day-zero matches from `brands` (TBL-002, 1,200+ pre-loaded) and `talents` (TBL-003) using basic keyword matching. Queue Crawl4AI enrichment immediately on signup |
| **Fallback**          | Show curated "Featured Brands" and "Trending Talent" lists from pre-populated data while enrichment completes. Display progress bar: "We're analyzing your profile -- matches improve as we learn more about you"                                                         |
| **Incident Playbook** | N/A (product issue, not incident)                                                                                                                                                                                                                                         |

### RISK-003: Stale Enrichment Data

| Field                 | Detail                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-003                                                                                                                                                                                                                                   |
| **Area**              | Matching                                                                                                                                                                                                                                   |
| **Failure Mode**      | Crawl4AI enrichment data (TBL-014, TBL-015) becomes stale -- creator audience sizes change, brands pivot industries, contact info becomes invalid. Matches and outreach are based on outdated information                                  |
| **Root Cause**        | No scheduled re-enrichment pipeline. Initial enrichment runs once (Step 4.1, 4.3) but data is never refreshed. Decision maker contacts (TBL-008, 44K+ rows) decay at ~2.5% per month (industry average for B2B contact data)               |
| **Impact**            | Match quality degrades over time. Outreach emails bounce. Brand budget intel becomes inaccurate. Users lose trust in platform data quality                                                                                                 |
| **Financial Impact**  | $0/hour during incident. $1,000-$3,000/month in wasted GMO API credits re-enriching bounced contacts + user churn from bad data                                                                                                            |
| **Probability**       | 5 (Almost Certain -- data ages continuously)                                                                                                                                                                                               |
| **Detection**         | Track `enriched_creators.updated_at` and `enriched_brands.updated_at` age distribution. Alert if >20% of active profiles have data older than 90 days. Track email bounce rate from outreach sequences                                     |
| **Mitigation**        | Implement weekly GMO re-verification for decision makers (Step 4.2 already designed but needs scheduling). Run monthly Crawl4AI re-enrichment for active creator and brand profiles. Add `data_freshness_score` field to enrichment tables |
| **Fallback**          | Display "Last verified: X days ago" badge on contact and enrichment data. Allow users to trigger manual re-enrichment with one click                                                                                                       |
| **Incident Playbook** | INC-017                                                                                                                                                                                                                                    |

### RISK-004: Match Engine Performance Degradation

| Field                 | Detail                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-004                                                                                                                                                                                                                                               |
| **Area**              | Matching                                                                                                                                                                                                                                               |
| **Failure Mode**      | As brand and talent tables grow beyond 10K rows each, the `scoreMatch` edge function (Step 6.1) takes >5 seconds per match computation, causing timeouts and degraded UX on PG-055 (MatchEngine)                                                       |
| **Root Cause**        | `scoreMatch` edge function performs multiple Supabase queries across `talents` (TBL-003), `brands` (TBL-002), `enriched_creators` (TBL-014), `enriched_brands` (TBL-015) sequentially. No query caching. No pre-computed match scores for common pairs |
| **Impact**            | MatchEngine page loads slowly or times out. Users abandon the feature. Revenue impact from reduced engagement with core value proposition                                                                                                              |
| **Financial Impact**  | $200-$800/month in lost engagement. Edge function compute costs increase 3-5x as data grows                                                                                                                                                            |
| **Probability**       | 3 (Possible -- depends on growth rate)                                                                                                                                                                                                                 |
| **Detection**         | Monitor `scoreMatch` edge function latency via `ai_usage_logs` (TBL-011). Alert if p95 latency >3 seconds. Track match request abandonment rate                                                                                                        |
| **Mitigation**        | Pre-compute match scores for all brand-talent pairs in batch overnight. Cache scores in `match_scores` (TBL-018) with TTL. Add composite index on `(talent_id, brand_id)` to `match_scores`. Parallelize Supabase queries in edge function             |
| **Fallback**          | Return cached/stale scores with "Refreshing..." indicator. Degrade to keyword-only matching (skip AI dimension analysis) under load                                                                                                                    |
| **Incident Playbook** | INC-004                                                                                                                                                                                                                                                |

---

## Area 2: AI Agents

### RISK-005: AI Hallucination in Generated Content

| Field                 | Detail                                                                                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-005                                                                                                                                                                                                                                                                                           |
| **Area**              | AI Agents                                                                                                                                                                                                                                                                                          |
| **Failure Mode**      | AI agents (AGT-001 through AGT-029) generate fabricated brand partnerships, invented contact details, fake statistics, or nonexistent company information. Users act on hallucinated data -- sending outreach to non-existent contacts or citing fabricated metrics in proposals                   |
| **Root Cause**        | LLMs (OpenAI GPT-4o-mini, Claude) generate plausible-sounding but unverified content. Prompts do not sufficiently constrain outputs to verified data. No post-generation fact-checking pipeline                                                                                                    |
| **Impact**            | User sends embarrassing outreach based on fabricated data. Legal liability if generated content contains defamatory claims. Platform credibility destroyed if hallucinations are widespread                                                                                                        |
| **Financial Impact**  | $5,000-$50,000/incident in potential legal liability. $0/hour but catastrophic reputation damage                                                                                                                                                                                                   |
| **Probability**       | 4 (Likely -- hallucination is inherent to LLMs)                                                                                                                                                                                                                                                    |
| **Detection**         | Implement output validation: check generated brand names against `brands` (TBL-002), check contact names against `decision_makers` (TBL-008). Log all AI outputs to `ai_usage_logs` (TBL-011) for audit. User-facing "Report inaccuracy" button on all AI-generated content                        |
| **Mitigation**        | Ground all AI prompts with retrieved database records (RAG pattern). Add disclaimer: "AI-generated content -- verify before acting." Implement structured output schemas (JSON mode) to constrain response format. Prohibit AI from generating contact details -- only surface verified DB records |
| **Fallback**          | Disable AI agent and show "This feature is temporarily unavailable" if hallucination rate exceeds 5% of flagged outputs in any 24-hour period                                                                                                                                                      |
| **Incident Playbook** | INC-011                                                                                                                                                                                                                                                                                            |

### RISK-006: AI Model Cost Overrun

| Field                 | Detail                                                                                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-006                                                                                                                                                                                                                                                                                           |
| **Area**              | AI Agents                                                                                                                                                                                                                                                                                          |
| **Failure Mode**      | Monthly AI API costs (OpenAI + Anthropic) exceed budget due to unmetered usage, prompt injection attacks inflating token counts, or runaway batch processes. Current budget: $50-$150/month for AI APIs                                                                                            |
| **Root Cause**        | Insufficient metering enforcement. `ai_usage` (TBL-009) tracks monthly counts but `ai_rate_limits` (TBL-010) daily limits may not catch sustained moderate abuse. Batch enrichment processes (Step 4.1, 4.3) can consume large token volumes. No hard spending cap on OpenAI/Anthropic accounts    |
| **Impact**            | Monthly AI costs spike to $500-$2,000+. Platform becomes unprofitable before reaching revenue. Founder must choose between disabling AI features or absorbing losses                                                                                                                               |
| **Financial Impact**  | $350-$1,850/month in excess costs above budget. At pre-revenue stage, this directly extends runway burn                                                                                                                                                                                            |
| **Probability**       | 3 (Possible)                                                                                                                                                                                                                                                                                       |
| **Detection**         | Daily cost tracking via `ai_usage_logs.estimated_cost_usd` (TBL-011). Alert if daily cost exceeds $10 (monthly budget / 30 \* 2x safety margin). Alert if any single user exceeds 100 AI requests in 24 hours                                                                                      |
| **Mitigation**        | Set hard spending limits on OpenAI and Anthropic dashboards. Enforce per-user daily limits via `ai_rate_limits` (TBL-010): Free=5/day, T1=20/day, T2=50/day, T3=unlimited. Use GPT-4o-mini as default (cheaper) with Claude as fallback. Implement token-aware cost estimation before each request |
| **Fallback**          | When daily budget exceeded: disable AI features for free users first, then T1, preserving access for paying customers. Show "AI features resuming tomorrow" message. Queue non-urgent requests for off-peak processing                                                                             |
| **Incident Playbook** | INC-006 (adapted)                                                                                                                                                                                                                                                                                  |

### RISK-007: AI Provider Outage (OpenAI / Anthropic)

| Field                 | Detail                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-007                                                                                                                                                                                                                                         |
| **Area**              | AI Agents                                                                                                                                                                                                                                        |
| **Failure Mode**      | OpenAI API (API-008) or Anthropic API (API-009) becomes unreachable. All 29 AI agents fail simultaneously. AI-powered features across the platform return errors                                                                                 |
| **Root Cause**        | External provider infrastructure failure. OpenAI has experienced 6+ significant outages in the past 12 months (historical data). Anthropic is newer with less track record. Single-provider dependency for each agent                            |
| **Impact**            | All AI-powered features unavailable: match scoring (Step 6.1-6.3), campaign generation (AGT-004), outreach drafting (AGT-005), enrichment (AGT-021, AGT-022). Core value proposition of the platform degraded                                    |
| **Financial Impact**  | $50-$200/hour in lost user engagement during outage. $500-$2,000 per extended outage (>4 hours) in churn risk                                                                                                                                    |
| **Probability**       | 3 (Possible -- major provider outages occur ~monthly)                                                                                                                                                                                            |
| **Detection**         | Health check ping to OpenAI and Anthropic status endpoints every 60 seconds. Monitor error rate in `ai_usage_logs` (TBL-011) -- alert if >10% failure rate in 5-minute window. Subscribe to status.openai.com and status.anthropic.com RSS feeds |
| **Mitigation**        | Implement provider failover: if OpenAI fails, route to Anthropic (and vice versa). Each AI agent should have a `fallback_provider` configuration. Cache recent AI responses for common queries. Pre-compute batch results during healthy periods |
| **Fallback**          | Degrade gracefully: show cached match scores, disable real-time AI generation, display "AI features temporarily limited" banner. Core platform features (search, browse, deal pipeline) remain fully functional without AI                       |
| **Incident Playbook** | INC-006                                                                                                                                                                                                                                          |

### RISK-008: Prompt Injection Attack

| Field                 | Detail                                                                                                                                                                                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-008                                                                                                                                                                                                                                                                                 |
| **Area**              | AI Agents                                                                                                                                                                                                                                                                                |
| **Failure Mode**      | Malicious user crafts input (profile bio, brand description, deal notes) that manipulates AI agent system prompts. Attacker extracts system prompts, bypasses content filters, or causes AI to generate harmful/misleading content                                                       |
| **Root Cause**        | User-supplied text is concatenated into AI prompts without sufficient sanitization. System prompts for 29 agents are embedded in edge function code. No input validation layer between user content and AI prompt construction                                                           |
| **Impact**            | System prompt leakage reveals proprietary matching logic. Attacker uses platform to generate spam/phishing content. AI outputs become untrustworthy for all users if injection pollutes shared context                                                                                   |
| **Financial Impact**  | $1,000-$10,000/incident in remediation + potential legal liability. $200-$500 in wasted API credits from injection-driven token inflation                                                                                                                                                |
| **Probability**       | 2 (Unlikely -- requires deliberate attack, small user base)                                                                                                                                                                                                                              |
| **Detection**         | Log all AI inputs and outputs to `ai_usage_logs` (TBL-011). Flag inputs containing known injection patterns: "ignore previous instructions", "system prompt:", "you are now". Monitor for abnormally long inputs (>5,000 chars)                                                          |
| **Mitigation**        | Sanitize all user inputs before prompt insertion: strip control characters, limit input length. Use structured prompt templates with clear delimiters between system instructions and user data. Implement output validation -- reject AI responses that contain system prompt fragments |
| **Fallback**          | Rate-limit flagged users. Block AI access for accounts with 3+ injection attempts. Alert founder for manual review                                                                                                                                                                       |
| **Incident Playbook** | INC-011 (adapted)                                                                                                                                                                                                                                                                        |

---

## Area 3: Database (Supabase PostgreSQL)

### RISK-009: Connection Pool Exhaustion

| Field                 | Detail                                                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-009                                                                                                                                                                                                                                                                                        |
| **Area**              | Database                                                                                                                                                                                                                                                                                        |
| **Failure Mode**      | Supabase PostgreSQL connection pool (default: 15 connections on free tier, 50 on Pro) is exhausted by concurrent edge function invocations, causing new requests to queue and eventually timeout. Platform becomes unresponsive                                                                 |
| **Root Cause**        | Each Supabase edge function invocation opens a connection. Batch operations (Step 3.1-3.4: brand/contact population) hold connections for extended periods. No connection pooling strategy in edge functions (no PgBouncer configuration). Spike in concurrent users during marketing campaigns |
| **Impact**            | All database-dependent features fail: auth, search, match engine, deal pipeline, dashboard. Effective full platform outage                                                                                                                                                                      |
| **Financial Impact**  | $100-$500/hour during outage (equivalent to full outage impact at current scale)                                                                                                                                                                                                                |
| **Probability**       | 3 (Possible -- risk increases with user growth)                                                                                                                                                                                                                                                 |
| **Detection**         | Monitor Supabase dashboard connection count. Alert if connection count exceeds 80% of pool limit. Monitor edge function timeout rate -- sudden spike indicates pool exhaustion. Check Supabase logs for "too many connections" errors                                                           |
| **Mitigation**        | Enable Supabase connection pooling (Supavisor). Configure edge functions to use pooled connections via `?pgbouncer=true` parameter. Implement connection timeout (5s) to prevent leaked connections. Batch operations should use a single connection with transactions, not one per row         |
| **Fallback**          | Kill long-running queries via Supabase SQL Editor: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND duration > interval '30 seconds'`. Temporarily disable batch operations. Restart Supabase project if pool is deadlocked                                   |
| **Incident Playbook** | INC-002                                                                                                                                                                                                                                                                                         |

### RISK-010: Data Corruption via Concurrent Updates

| Field                 | Detail                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-010                                                                                                                                                                                                                                                                  |
| **Area**              | Database                                                                                                                                                                                                                                                                  |
| **Failure Mode**      | Concurrent updates to the same row (e.g., two edge functions updating `profiles.plan` simultaneously during webhook processing, or concurrent partnership stage updates from different browser tabs) result in lost updates or inconsistent state                         |
| **Root Cause**        | No optimistic locking or version columns on critical tables. Supabase client uses default `READ COMMITTED` isolation. Edge functions processing Stripe webhooks (EVT-001) may race with client-side updates to `profiles` (TBL-001)                                       |
| **Impact**            | User plan not updated after payment (subscription active in Stripe but `profiles.plan` still "free"). Partnership stuck in wrong stage. Deal values incorrect                                                                                                             |
| **Financial Impact**  | $100-$1,000/incident in manual resolution + customer support time. Revenue loss if paying customer doesn't receive paid features                                                                                                                                          |
| **Probability**       | 2 (Unlikely at current scale, increases with growth)                                                                                                                                                                                                                      |
| **Detection**         | Reconciliation job: compare Stripe subscription status with `profiles.plan` daily. Log all `profiles.plan` updates to `audit_logs` (TBL-064). Alert if `profiles.plan` = 'free' for any user with active Stripe subscription                                              |
| **Mitigation**        | Add `version` column to critical tables (`profiles`, `partnerships`) for optimistic locking. Use `UPDATE ... WHERE version = :expected_version` pattern. Stripe webhook handler should be idempotent: always read current Stripe state, not rely on webhook payload alone |
| **Fallback**          | Manual reconciliation: query Stripe API for all active subscriptions, compare with `profiles.plan`, fix mismatches. Provide admin tool on PG-090 (AdminDashboard) to manually set user plan                                                                               |
| **Incident Playbook** | INC-012                                                                                                                                                                                                                                                                   |

### RISK-011: RLS Policy Misconfiguration

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-011                                                                                                                                                                                                                                                                                                                                                               |
| **Area**              | Database                                                                                                                                                                                                                                                                                                                                                               |
| **Failure Mode**      | Row-Level Security policies on Supabase tables allow unauthorized data access. User A can read User B's private deal notes, contact data, or financial information. Most critical tables currently have overly permissive RLS: "Open SELECT/INSERT/UPDATE/DELETE for authenticated"                                                                                    |
| **Root Cause**        | Current RLS policies (documented in Batch 1) are in "demo mode" -- most tables allow full CRUD for any authenticated user. `decision_makers` (TBL-008) has proper owner-scoped UPDATE/DELETE but open SELECT. `connected_accounts` (TBL-012) is properly scoped. Many tables like `partnerships` (TBL-004), `brands` (TBL-002), `talents` (TBL-003) have open policies |
| **Impact**            | Any authenticated user can read all partnership deal values, all brand contact info, all talent rate cards. Data breach of HIGH PII data (emails, phones, LinkedIn URLs in TBL-008). Regulatory violation (GDPR, CCPA)                                                                                                                                                 |
| **Financial Impact**  | $10,000-$100,000+ in legal liability for data breach. $5,000-$20,000 in mandatory breach notification costs. Platform trust destroyed                                                                                                                                                                                                                                  |
| **Probability**       | 4 (Likely -- current policies are known to be overly permissive)                                                                                                                                                                                                                                                                                                       |
| **Detection**         | Quarterly RLS audit: for each table, test that User A cannot access User B's data. Automated test (TC-045 equivalent) that creates two users and verifies cross-user isolation. Monitor `audit_logs` (TBL-064) for cross-user data access patterns                                                                                                                     |
| **Mitigation**        | Priority migration: tighten RLS policies on all HIGH PII tables. `decision_makers`: scope SELECT to `owner_id = auth.uid()`. `partnerships`: scope all operations to `created_by = auth.uid()`. `talents`: scope UPDATE/DELETE to `owner_id = auth.uid()`, keep SELECT open for discovery. `deal_notes`, `deal_attachments`: scope to partnership owner                |
| **Fallback**          | If breach detected: immediately revoke all user sessions via Supabase Auth admin API. Enable maintenance mode. Audit access logs to determine breach scope. Follow INC-005 data breach playbook                                                                                                                                                                        |
| **Incident Playbook** | INC-013                                                                                                                                                                                                                                                                                                                                                                |

### RISK-012: Database Migration Failure

| Field                 | Detail                                                                                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-012                                                                                                                                                                                                                                                                                           |
| **Area**              | Database                                                                                                                                                                                                                                                                                           |
| **Failure Mode**      | SQL migration run in Supabase SQL Editor fails mid-execution, leaving schema in inconsistent state. Tables partially altered, foreign key constraints broken, or data partially migrated                                                                                                           |
| **Root Cause**        | No migration tooling (no Prisma, no Flyway, no migration files). Migrations are run manually via Supabase SQL Editor. No transaction wrapping for multi-statement migrations. No staging environment to test migrations before production                                                          |
| **Impact**            | Application errors on affected tables. Features that depend on altered schema break. Data integrity violations if constraints are partially applied                                                                                                                                                |
| **Financial Impact**  | $200-$2,000/incident in downtime + manual remediation. Risk of data loss if migration involves destructive changes                                                                                                                                                                                 |
| **Probability**       | 3 (Possible -- manual process is error-prone)                                                                                                                                                                                                                                                      |
| **Detection**         | Post-migration: run schema validation query comparing actual schema against expected schema. Test all critical flows (auth, search, deals) after every migration. Monitor application error rates for 30 minutes post-migration                                                                    |
| **Mitigation**        | Wrap all migrations in transactions: `BEGIN; ... COMMIT;` with `ROLLBACK` on error. Write migrations as idempotent scripts (use `IF NOT EXISTS`, `IF EXISTS`). Test migrations on a Supabase branch database (Supabase branching feature) before production. Keep migration log in version control |
| **Fallback**          | Restore from Supabase daily backup (available on Pro plan). If on free plan: maintain manual backup scripts that export critical table data before migration. See RB-011 (Backup Restore Procedure)                                                                                                |
| **Incident Playbook** | INC-016                                                                                                                                                                                                                                                                                            |

---

## Area 4: Payments (Stripe)

### RISK-013: Stripe Webhook Failure -- profiles.plan Not Updated

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-013                                                                                                                                                                                                                                                                                                                                  |
| **Area**              | Payments                                                                                                                                                                                                                                                                                                                                  |
| **Failure Mode**      | Stripe sends `checkout.session.completed` or `customer.subscription.updated` webhook but the edge function fails to update `profiles.plan` (TBL-001). User has paid but is stuck on the free tier. This is the single most critical payment risk                                                                                          |
| **Root Cause**        | Webhook handler edge function crashes, times out, or encounters a database error. Supabase edge function cold start adds latency. Webhook signature verification fails due to stale signing secret. No retry logic in the webhook handler for database writes                                                                             |
| **Impact**            | Paying customer cannot access paid features. Customer contacts support (or churns silently). Revenue recognized in Stripe but not reflected in product. Trust violation -- user paid money and got nothing                                                                                                                                |
| **Financial Impact**  | $29-$299/incident (value of the subscription plan). $500-$5,000 in aggregate if webhook failures are systematic and undetected                                                                                                                                                                                                            |
| **Probability**       | 3 (Possible -- webhook failures are common in Stripe integrations)                                                                                                                                                                                                                                                                        |
| **Detection**         | Reconciliation job (scheduled daily): query Stripe API for all active subscriptions, compare each `customer.email` with `profiles.plan`. Alert on any mismatch. Log all webhook events to `audit_logs` (TBL-064) with success/failure status. Monitor Stripe webhook dashboard for failed deliveries                                      |
| **Mitigation**        | Implement idempotent webhook handler: on every webhook, fetch current Stripe subscription status and set `profiles.plan` accordingly (don't rely on webhook payload alone). Add retry logic: 3 attempts with exponential backoff on database write failure. Store webhook events in a `stripe_webhook_events` table for replay capability |
| **Fallback**          | Manual fix: admin queries Stripe dashboard for customer subscription, manually updates `profiles.plan` via SQL Editor. User-facing: "Your payment was received. If features are not unlocked within 5 minutes, click here to refresh your account status" button that re-checks Stripe                                                    |
| **Incident Playbook** | INC-012                                                                                                                                                                                                                                                                                                                                   |

### RISK-014: Double Charge on Subscription

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-014                                                                                                                                                                                                                                                                                                                                                                                      |
| **Area**              | Payments                                                                                                                                                                                                                                                                                                                                                                                      |
| **Failure Mode**      | User is charged twice for the same subscription period. Can occur from duplicate webhook processing, user clicking "Subscribe" button multiple times, or Stripe Checkout session being completed twice                                                                                                                                                                                        |
| **Root Cause**        | No idempotency key on checkout session creation. No client-side debouncing on subscription button. Webhook handler processes duplicate events without checking for existing subscription                                                                                                                                                                                                      |
| **Impact**            | Customer disputes charge with bank (chargeback). Customer loses trust. Stripe chargeback fee ($15 per dispute). If systematic: Stripe may flag account for excessive chargebacks                                                                                                                                                                                                              |
| **Financial Impact**  | $29-$299 per double charge + $15 chargeback fee. $100+ in support time per incident. Risk of Stripe account suspension if chargeback rate exceeds 1%                                                                                                                                                                                                                                          |
| **Probability**       | 2 (Unlikely -- Stripe has built-in protections)                                                                                                                                                                                                                                                                                                                                               |
| **Detection**         | Monitor Stripe dashboard for duplicate charges to same customer within 24 hours. Alert on any `charge.dispute.created` webhook event. Weekly reconciliation: count charges per customer per billing period                                                                                                                                                                                    |
| **Mitigation**        | Pass `idempotency_key` on all Stripe API calls. Disable subscribe button after first click (client-side debounce + server-side check). Webhook handler: check if `user_subscriptions` (TBL-056) already has active row for this subscription before creating another. Use Stripe's `customer.subscription.created` event rather than `checkout.session.completed` for subscription activation |
| **Fallback**          | Immediate refund via Stripe dashboard. Proactive email to affected customer apologizing and confirming refund. Compensation: offer 1 month free on their current plan                                                                                                                                                                                                                         |
| **Incident Playbook** | INC-003                                                                                                                                                                                                                                                                                                                                                                                       |

### RISK-015: Escrow Lock -- Funds Stuck in Transit

| Field                 | Detail                                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-015                                                                                                                                                                                                                                                               |
| **Area**              | Payments                                                                                                                                                                                                                                                               |
| **Failure Mode**      | Deal escrow payment (managed via Stripe Connect or manual flow through EscrowPanel component) gets stuck -- funds captured from brand but not released to talent. Either due to dispute, deliverable verification failure, or system error in release trigger          |
| **Root Cause**        | Escrow release logic in edge function depends on partnership status reaching "completed" (TBL-004). If partnership stage update fails, escrow remains locked indefinitely. No automated timeout/escalation for locked escrow                                           |
| **Impact**            | Talent does not receive payment for completed work. Brand's funds are held without resolution. Both parties contact support. Legal liability for holding funds without authorization                                                                                   |
| **Financial Impact**  | $500-$50,000 per locked escrow (deal value). Legal fees if dispute escalates. Platform reputation as a safe deal environment destroyed                                                                                                                                 |
| **Probability**       | 2 (Unlikely -- escrow is a future feature, low volume initially)                                                                                                                                                                                                       |
| **Detection**         | Monitor escrow status: alert if any escrow remains in "held" state for >14 days. Dashboard widget showing all active escrow transactions with time-in-state. Automated email to both parties at 7-day and 14-day marks                                                 |
| **Mitigation**        | Implement automatic escrow timeout: if no dispute raised within 14 days of deliverable submission, auto-release funds. Require both parties to confirm deliverable completion (2-of-2 release). Add manual admin override to release/refund escrow from AdminDashboard |
| **Fallback**          | Manual Stripe dashboard intervention: refund brand or transfer to talent based on deliverable evidence. Founder manually reviews dispute via DisputePanel component. Document decision in `audit_logs` (TBL-064)                                                       |
| **Incident Playbook** | INC-003 (adapted)                                                                                                                                                                                                                                                      |

### RISK-016: Subscription Not Activating After Checkout

| Field                 | Detail                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-016                                                                                                                                                                                                                                                                                   |
| **Area**              | Payments                                                                                                                                                                                                                                                                                   |
| **Failure Mode**      | User completes Stripe Checkout (Step 2.2) but subscription is not created in Stripe because of card decline after initial authorization, 3D Secure authentication failure, or Stripe API error during subscription creation                                                                |
| **Root Cause**        | Stripe Checkout shows success page before subscription is fully confirmed (race condition). 3D Secure redirect fails silently on some mobile browsers. Card authorization succeeds but subscription creation fails due to Stripe backend error                                             |
| **Impact**            | User believes they've subscribed but checkout didn't complete. User sees free tier features despite entering payment info. Support ticket created                                                                                                                                          |
| **Financial Impact**  | $29-$299/incident in delayed revenue. $50-$100 in support time per incident                                                                                                                                                                                                                |
| **Probability**       | 2 (Unlikely)                                                                                                                                                                                                                                                                               |
| **Detection**         | Post-checkout verification: after Stripe redirect back to app, verify subscription status via `getUserSubscriptionStatus` edge function. Alert if checkout session completed but no corresponding `user_subscriptions` (TBL-056) row created within 5 minutes                              |
| **Mitigation**        | Implement checkout success page that polls subscription status for 30 seconds before showing "All set!" message. If poll fails: show "Your payment is being processed -- you'll receive a confirmation email within 5 minutes." Store checkout session ID in `profiles` for reconciliation |
| **Fallback**          | Manual activation: admin checks Stripe dashboard for checkout session status, manually creates subscription if payment was captured. Email user with resolution                                                                                                                            |
| **Incident Playbook** | INC-003                                                                                                                                                                                                                                                                                    |

---

## Area 5: External APIs

### RISK-017: GrowMeOrganic Rate Limit / Downtime

| Field                 | Detail                                                                                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-017                                                                                                                                                                                                                                                          |
| **Area**              | External APIs                                                                                                                                                                                                                                                     |
| **Failure Mode**      | GrowMeOrganic API (API-010) hits monthly rate limit (10K requests/month) or experiences downtime. Contact enrichment (Step 3.2), verification (Step 4.2), and ContactFinder live search (Step 5.4) fail                                                           |
| **Root Cause**        | Fixed monthly quota shared across all operations. Bulk population (44K+ contacts) consumes most of the quota. No quota management -- first operation that month consumes all credits. GMO is a smaller provider with less infrastructure redundancy               |
| **Impact**            | ContactFinder (PG-056) returns "No contacts found" for unenriched brands. New brand population cannot include contacts. Contact verification pipeline stops. Degraded but not critical -- existing contacts still accessible                                      |
| **Financial Impact**  | $0/hour immediate. $100-$500/month in GMO plan upgrade costs if quota consistently exceeded. Lost user value if ContactFinder is a key conversion driver                                                                                                          |
| **Probability**       | 3 (Possible)                                                                                                                                                                                                                                                      |
| **Detection**         | Track GMO API usage counter: alert at 70% and 90% of monthly quota. Monitor GMO API response times -- alert if >5s (indicates degradation). Check GMO status page for maintenance windows                                                                         |
| **Mitigation**        | Implement quota budgeting: reserve 30% of monthly quota for live ContactFinder searches, allocate 70% for batch operations. Cache GMO results aggressively -- never re-query a contact enriched within 30 days. Queue batch operations to spread across the month |
| **Fallback**          | When GMO is down or quota exhausted: ContactFinder searches `decision_makers` (TBL-008, 44K+ existing contacts) only, disabling live enrichment. Display "Showing cached contacts -- live search temporarily unavailable"                                         |
| **Incident Playbook** | INC-007                                                                                                                                                                                                                                                           |

### RISK-018: Crawl4AI Railway Service Crash

| Field                 | Detail                                                                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-018                                                                                                                                                                                                                                                                                  |
| **Area**              | External APIs                                                                                                                                                                                                                                                                             |
| **Failure Mode**      | Crawl4AI Docker container on Railway (API-014) crashes due to OOM (out of memory), unhandled exception, or Railway platform issue. All web crawling and enrichment operations fail                                                                                                        |
| **Root Cause**        | Crawl4AI crawls JavaScript-heavy websites using headless browser, consuming significant memory. Railway free/hobby tier has limited resources. Large batch enrichment (Step 4.1, 4.3) can trigger OOM. Railway auto-restart may not recover from persistent crashes                       |
| **Impact**            | Creator enrichment (Step 4.1) and brand enrichment (Step 4.3) stop. New profiles are not enriched. Match quality degrades for new users. `crawl_jobs` (TBL-016) stuck in "queued" state                                                                                                   |
| **Financial Impact**  | $0-$50/hour (enrichment is background process). $200-$500 in Railway plan upgrade if resource limits are the cause                                                                                                                                                                        |
| **Probability**       | 3 (Possible)                                                                                                                                                                                                                                                                              |
| **Detection**         | Health check endpoint on Railway Crawl4AI service -- ping every 5 minutes. Alert if 3 consecutive health checks fail. Monitor `crawl_jobs` (TBL-016) -- alert if >10 jobs stuck in "queued" for >1 hour. Railway dashboard: monitor memory usage and restart count                        |
| **Mitigation**        | Configure Railway auto-restart with health check. Set memory limits on Crawl4AI container (512MB minimum). Implement request queuing with backpressure -- never run more than 3 concurrent crawls. Add circuit breaker: after 5 consecutive failures, pause new crawl jobs for 10 minutes |
| **Fallback**          | When Crawl4AI is down: skip enrichment for new profiles, queue jobs for later processing. Show "Profile enrichment in progress" placeholder. For critical profiles: fall back to AI-only enrichment using data from profile fields (no web crawling)                                      |
| **Incident Playbook** | INC-008                                                                                                                                                                                                                                                                                   |

### RISK-019: Resend Email Delivery Failure

| Field                 | Detail                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-019                                                                                                                                                                                                                                                                      |
| **Area**              | External APIs                                                                                                                                                                                                                                                                 |
| **Failure Mode**      | Resend API (API-015) fails to deliver transactional emails: welcome emails (Step 2.5), trial activation emails, outreach sequence emails (Step 9.1), payment receipts. Users miss critical notifications                                                                      |
| **Root Cause**        | Resend API outage. Domain DNS/SPF/DKIM misconfiguration causing deliverability issues. Resend rate limit exceeded. Email content flagged as spam by receiving servers                                                                                                         |
| **Impact**            | New users don't receive welcome/trial emails. Outreach sequences fail silently -- users think emails were sent. Password reset emails not delivered, locking users out                                                                                                        |
| **Financial Impact**  | $50-$500/incident in lost conversions from undelivered trial activation emails. $0/hour direct cost but significant user experience degradation                                                                                                                               |
| **Probability**       | 2 (Unlikely -- Resend has good uptime record)                                                                                                                                                                                                                                 |
| **Detection**         | Monitor Resend dashboard delivery rates. Alert if bounce rate exceeds 5% or delivery rate drops below 90%. Log all email sends and delivery status to `audit_logs` (TBL-064). Monitor for Supabase Auth email delivery separately (uses Supabase built-in mailer, not Resend) |
| **Mitigation**        | Implement email delivery status tracking -- store Resend message ID and poll for delivery confirmation. Retry failed sends 3x with exponential backoff. Maintain SPF, DKIM, and DMARC records. Monitor domain reputation                                                      |
| **Fallback**          | Critical emails (password reset, payment receipt): fall back to Supabase built-in mailer. Non-critical emails (welcome, marketing): queue for retry when Resend recovers. Show in-app notification as backup for email-dependent actions                                      |
| **Incident Playbook** | INC-014                                                                                                                                                                                                                                                                       |

---

## Area 6: Infrastructure

### RISK-020: Vercel Deployment Failure

| Field                 | Detail                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-020                                                                                                                                                                                                                                               |
| **Area**              | Infrastructure                                                                                                                                                                                                                                         |
| **Failure Mode**      | Vercel build fails during deployment: build error, dependency resolution failure, or Vercel platform outage. No new deployment goes live. If combined with a rollback need, previous version may also be broken                                        |
| **Root Cause**        | npm dependency conflict. Vite build error from TypeScript/JSX compilation. Vercel build timeout (exceeded 45-minute limit for large bundles). Vercel platform-level outage                                                                             |
| **Impact**            | New features and bug fixes cannot be deployed. If current production version has a bug, it persists until deployment succeeds. No user-facing impact if current production version is healthy                                                          |
| **Financial Impact**  | $0/hour if production is healthy. $100-$500/hour if production has a critical bug that cannot be patched                                                                                                                                               |
| **Probability**       | 2 (Unlikely -- Vite builds are fast and reliable)                                                                                                                                                                                                      |
| **Detection**         | Vercel deployment status webhook/notification. GitHub commit status checks. Monitor Vercel dashboard for failed deployments. Build failure notification in Slack/email                                                                                 |
| **Mitigation**        | Pin all npm dependencies (use `package-lock.json` -- already present). Run `npm run build` locally before pushing. Enable Vercel preview deployments on PRs for pre-production testing. Keep previous successful deployment as instant rollback target |
| **Fallback**          | Vercel instant rollback to previous deployment (one-click in Vercel dashboard). If Vercel platform is down: serve static build from CDN backup or switch DNS to Netlify emergency deployment                                                           |
| **Incident Playbook** | INC-010                                                                                                                                                                                                                                                |

### RISK-021: Supabase Platform Outage

| Field                 | Detail                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-021                                                                                                                                                                                                                                         |
| **Area**              | Infrastructure                                                                                                                                                                                                                                   |
| **Failure Mode**      | Supabase managed infrastructure (database, auth, storage, edge functions, realtime) becomes unavailable. This is a complete platform outage -- every feature depends on Supabase                                                                 |
| **Root Cause**        | Supabase infrastructure failure in the project's region. AWS underlying infrastructure issue (Supabase runs on AWS). Supabase platform-level incident. Project-specific issue (resource limits, abuse detection)                                 |
| **Impact**            | Full platform outage. No authentication, no data access, no edge functions, no storage. Users see connection errors on every page. 100% of features affected                                                                                     |
| **Financial Impact**  | $100-$500/hour at current scale. $1,000-$5,000 for extended outage (>4 hours) including churn risk and reputation damage                                                                                                                         |
| **Probability**       | 2 (Unlikely -- Supabase has 99.9% uptime SLA on Pro plan)                                                                                                                                                                                        |
| **Detection**         | Supabase health check: `supabase.from('profiles').select('id').limit(1)` every 60 seconds from external monitoring (UptimeRobot or similar). Subscribe to status.supabase.com. Monitor Supabase dashboard health indicators                      |
| **Mitigation**        | Enable Supabase Point-in-Time Recovery (Pro plan). Configure read replicas for critical queries. Implement client-side offline mode for read-heavy pages (cache recent data in localStorage). Design edge functions to be restartable/idempotent |
| **Fallback**          | Display maintenance page: "DealStage is experiencing a temporary outage. We're working to restore service. Status updates at [status page URL]." Cache critical data client-side. If outage >2 hours: post on Twitter/social media with updates  |
| **Incident Playbook** | INC-002                                                                                                                                                                                                                                          |

### RISK-022: Railway Platform Downtime

| Field                 | Detail                                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-022                                                                                                                                                                                       |
| **Area**              | Infrastructure                                                                                                                                                                                 |
| **Failure Mode**      | Railway platform is unavailable. Crawl4AI Docker container cannot be reached. All web crawling operations fail                                                                                 |
| **Root Cause**        | Railway platform-level outage. Railway project resource limits exceeded. Docker container health check failure without auto-restart                                                            |
| **Impact**            | Enrichment pipeline (Steps 4.1, 4.3) halted. New profiles not enriched. ContactFinder live search degraded. Non-critical -- core platform functions (auth, search, deals, payments) unaffected |
| **Financial Impact**  | $0-$50/hour. Enrichment backlog accumulates but is recoverable                                                                                                                                 |
| **Probability**       | 2 (Unlikely)                                                                                                                                                                                   |
| **Detection**         | Same as RISK-018: health check ping, crawl_jobs monitoring, Railway dashboard                                                                                                                  |
| **Mitigation**        | Configure Railway deployment auto-restart. Implement crawl job queue with retry logic. Consider backup Crawl4AI deployment on Render or Fly.io for failover                                    |
| **Fallback**          | Queue all enrichment jobs. Core platform operates normally without enrichment. Process backlog when Railway recovers                                                                           |
| **Incident Playbook** | INC-008                                                                                                                                                                                        |

### RISK-023: DNS / SSL Certificate Failure

| Field                 | Detail                                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-023                                                                                                                                                                                                                                           |
| **Area**              | Infrastructure                                                                                                                                                                                                                                     |
| **Failure Mode**      | DNS resolution for thedealstage.com fails, or SSL certificate expires/becomes invalid. Users cannot reach the platform or see browser security warnings                                                                                            |
| **Root Cause**        | Domain registrar payment lapse (domain expires). DNS provider outage. Vercel SSL auto-renewal fails. DNS misconfiguration during a change. Nameserver delegation error                                                                             |
| **Impact**            | Complete platform unreachable. Users see "This site can't be reached" or "Your connection is not private" errors. 100% user impact. Brand damage from security warnings                                                                            |
| **Financial Impact**  | $200-$1,000/hour. Domain expiry can take 24-48 hours to resolve. SSL issues typically resolved faster (1-4 hours)                                                                                                                                  |
| **Probability**       | 1 (Rare -- Vercel handles SSL auto-renewal)                                                                                                                                                                                                        |
| **Detection**         | External SSL monitoring (e.g., UptimeRobot SSL check) -- alert 30 days before expiry. DNS monitoring: check that thedealstage.com resolves correctly every 5 minutes. Domain registrar: set auto-renew and calendar reminder 60 days before expiry |
| **Mitigation**        | Enable domain auto-renewal with backup payment method. Use Vercel-managed SSL (auto-renewed). Document DNS configuration in runbook (RB-003). Keep registrar credentials in password manager with founder access                                   |
| **Fallback**          | SSL failure: manually trigger certificate renewal in Vercel dashboard. DNS failure: switch to backup DNS provider (Cloudflare as secondary). Domain expiry: contact registrar emergency support, verify ownership                                  |
| **Incident Playbook** | INC-015                                                                                                                                                                                                                                            |

---

## Area 7: Security

### RISK-024: XSS via localStorage Token Exposure

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-024                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Area**              | Security                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Failure Mode**      | Supabase stores JWT session tokens in localStorage (default behavior). An XSS vulnerability in the React application allows an attacker to steal session tokens via `document.cookie` or `localStorage.getItem()` and impersonate users                                                                                                                                                                          |
| **Root Cause**        | Supabase JS client defaults to localStorage for session persistence. The application renders user-generated content (brand descriptions, talent bios, deal notes) that may contain unsanitized HTML. React's JSX escaping prevents most XSS, but `dangerouslySetInnerHTML` usage or third-party components may introduce vectors. CSP headers are set in `vercel.json` but include `'unsafe-inline'` for scripts |
| **Impact**            | Attacker steals session token, impersonates user, accesses all their data. Can perform actions as the user (create deals, modify profile, access contacts). If admin token stolen: full platform compromise                                                                                                                                                                                                      |
| **Financial Impact**  | $5,000-$50,000/incident in legal liability, breach notification, and remediation                                                                                                                                                                                                                                                                                                                                 |
| **Probability**       | 2 (Unlikely -- React provides good default XSS protection)                                                                                                                                                                                                                                                                                                                                                       |
| **Detection**         | Security scan (npm audit, Snyk) for known XSS vulnerabilities in dependencies. CSP violation reporting (`report-uri` directive). Monitor for unusual session activity: same token used from multiple IPs/geolocations                                                                                                                                                                                            |
| **Mitigation**        | Audit all uses of `dangerouslySetInnerHTML` -- replace with sanitized rendering (DOMPurify). Tighten CSP: remove `'unsafe-inline'` from `script-src` and use nonces instead. Consider switching Supabase session storage to httpOnly cookies (requires proxy). Implement session binding: tie JWT to client fingerprint                                                                                          |
| **Fallback**          | If XSS exploit detected: revoke all user sessions via Supabase Auth admin. Deploy CSP fix immediately. Notify affected users                                                                                                                                                                                                                                                                                     |
| **Incident Playbook** | INC-005                                                                                                                                                                                                                                                                                                                                                                                                          |

### RISK-025: Role Escalation via Signup Flow

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-025                                                                                                                                                                                                                                                                                                                                               |
| **Area**              | Security                                                                                                                                                                                                                                                                                                                                               |
| **Failure Mode**      | Attacker manipulates the onboarding role selection (Step 2.1) to set `profiles.role = 'admin'`. The `enforce_signup_role` trigger prevents role changes after initial set, but the initial INSERT may be exploitable if the role value is not validated server-side                                                                                    |
| **Root Cause**        | Role selection is handled client-side on PG-039 (Onboarding). If the Supabase RLS policy allows direct UPDATE of `profiles.role` to any value, an attacker can use the Supabase JS client directly (bypassing the UI) to set `role = 'admin'`. The `enforce_signup_role` trigger blocks changes after first set but may not validate the initial value |
| **Impact**            | Attacker gains admin access. Can access AdminDashboard (PG-090), AdminDataManager (PG-089), and all admin-only features. Can view all user data, modify any record, and access API keys displayed in admin panels                                                                                                                                      |
| **Financial Impact**  | $10,000-$100,000+ in data breach liability. Complete platform compromise                                                                                                                                                                                                                                                                               |
| **Probability**       | 2 (Unlikely -- but only if `enforce_signup_role` trigger validates allowed values)                                                                                                                                                                                                                                                                     |
| **Detection**         | Monitor `profiles` table for any row with `role = 'admin'` that wasn't set by the system. Alert if admin count exceeds expected value (currently: 1 -- the founder). Audit log all role assignments                                                                                                                                                    |
| **Mitigation**        | Add CHECK constraint: `role IN ('talent', 'brand', 'agency', 'manager')` on `profiles.role` -- exclude 'admin' from user-settable values. Admin role should only be set via direct SQL by the founder. Add server-side validation in the `handle_new_user` trigger: if role is 'admin', reject. Separate admin authentication flow                     |
| **Fallback**          | If unauthorized admin detected: immediately delete the profile, revoke sessions, and audit all actions taken by that account via `audit_logs` (TBL-064) and `activities` (TBL-005)                                                                                                                                                                     |
| **Incident Playbook** | INC-005                                                                                                                                                                                                                                                                                                                                                |

### RISK-026: API Key Exposure in Client Bundle

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-026                                                                                                                                                                                                                                                                                                                                    |
| **Area**              | Security                                                                                                                                                                                                                                                                                                                                    |
| **Failure Mode**      | Sensitive API keys (Stripe secret key, OpenAI key, Anthropic key, GMO key) are accidentally included in the Vite client bundle via `import.meta.env` variables, making them visible in browser dev tools                                                                                                                                    |
| **Root Cause**        | Vite exposes any env variable prefixed with `VITE_` to the client bundle. Developer accidentally prefixes a secret key with `VITE_`. Supabase anon key is intentionally client-side (safe), but service_role key exposure would be critical. CSP `connect-src` in `vercel.json` lists allowed API domains, but doesn't prevent key exposure |
| **Impact**            | Exposed Stripe secret key: attacker can issue refunds, create charges, access customer data. Exposed OpenAI/Anthropic key: attacker racks up API charges. Exposed Supabase service_role key: attacker bypasses all RLS policies, full database access                                                                                       |
| **Financial Impact**  | $1,000-$100,000+ depending on which key is exposed and how quickly detected                                                                                                                                                                                                                                                                 |
| **Probability**       | 2 (Unlikely -- but has happened to many startups)                                                                                                                                                                                                                                                                                           |
| **Detection**         | Pre-commit hook: scan for known secret patterns in `VITE_` env vars. Build step: warn if any non-public key is prefixed with `VITE_`. Runtime: GitHub secret scanning (if repo is on GitHub). Regular audit of built `dist/` bundle for key patterns                                                                                        |
| **Mitigation**        | Strict env var naming convention: only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` should be client-exposed. All other keys must be edge-function-only (Supabase edge function secrets). Add `.env` to `.gitignore` (verify). Implement pre-commit hook that rejects commits containing API key patterns                               |
| **Fallback**          | If key exposed: immediately rotate the key on the provider dashboard. Audit usage logs for unauthorized access. Redeploy with corrected env vars. If Supabase service_role key: rotate key, audit all database access during exposure window                                                                                                |
| **Incident Playbook** | INC-005                                                                                                                                                                                                                                                                                                                                     |

### RISK-027: Brute Force Login Attack

| Field                 | Detail                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-027                                                                                                                                                                                                                                                                                                     |
| **Area**              | Security                                                                                                                                                                                                                                                                                                     |
| **Failure Mode**      | Attacker attempts to brute-force user passwords via Supabase Auth `signInWithPassword` endpoint. Supabase has built-in rate limiting (30 attempts/hour/IP) but sophisticated attacks use distributed IPs                                                                                                     |
| **Root Cause**        | Password-based authentication is inherently vulnerable to brute force. Supabase rate limiting is per-IP, which can be circumvented with rotating proxies. No account lockout mechanism beyond Supabase defaults. No CAPTCHA on login page                                                                    |
| **Impact**            | Successful brute force: attacker gains access to user account with all associated data, contacts, and deals. If targeting admin account: full platform compromise                                                                                                                                            |
| **Financial Impact**  | $1,000-$50,000/incident depending on account compromised                                                                                                                                                                                                                                                     |
| **Probability**       | 2 (Unlikely -- small user base is not an attractive target)                                                                                                                                                                                                                                                  |
| **Detection**         | Monitor Supabase Auth logs for failed login attempts. Alert if >10 failed attempts for a single email within 1 hour. Alert if >100 total failed logins across all accounts within 1 hour (credential stuffing). Supabase Auth dashboard shows login failure metrics                                          |
| **Mitigation**        | Implement CAPTCHA (hCaptcha or Turnstile) on login page after 3 failed attempts. Encourage Google OAuth (Step 1.3) as primary auth method (eliminates password brute force). Enable Supabase Auth MFA (TOTP) for admin accounts. Implement progressive delays: 1s after 3 failures, 5s after 5, 30s after 10 |
| **Fallback**          | If brute force detected: temporarily block the targeted email's login for 30 minutes. Notify the account owner via email. If successful compromise suspected: force password reset, revoke all sessions                                                                                                      |
| **Incident Playbook** | INC-009                                                                                                                                                                                                                                                                                                      |

---

## Area 8: Business Risks

### RISK-028: Zero Paying Users After 90 Days

| Field                 | Detail                                                                                                                                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-028                                                                                                                                                                                                                                                                                                    |
| **Area**              | Business                                                                                                                                                                                                                                                                                                    |
| **Failure Mode**      | Platform launches, acquires free users, but fails to convert any to paid plans within the first 90 days. Revenue remains at $0 while infrastructure costs continue at $470-$1,140/month                                                                                                                     |
| **Root Cause**        | Free tier is too generous (users don't need to upgrade). Paid tier value proposition is unclear. Onboarding doesn't demonstrate paid-tier features effectively. Reverse trial (7-day Tier 1 access, Step 2.5) doesn't create enough urgency. Pricing is wrong for target market                             |
| **Impact**            | Runway shortens to infrastructure costs only. Founder must decide to shut down, pivot, or invest more personal capital. No validation of product-market fit                                                                                                                                                 |
| **Financial Impact**  | $1,410-$3,420 in lost infrastructure costs over 90 days with zero revenue. Opportunity cost of founder's time (3 months)                                                                                                                                                                                    |
| **Probability**       | 3 (Possible -- most SaaS products struggle with initial conversion)                                                                                                                                                                                                                                         |
| **Detection**         | Daily dashboard: total paying users, conversion rate (free -> paid), trial -> paid conversion rate. Alert if no paying user by Day 30. Weekly cohort analysis of reverse trial users                                                                                                                        |
| **Mitigation**        | Tighten free tier limits: reduce AI queries from 5/mo to 3/mo. Add usage-triggered upgrade prompts ("You've used 4 of 5 free AI matches -- upgrade for unlimited"). Implement in-app upgrade nudges at feature gates. Offer annual plan discount (20% off). Personal outreach to active free users at Day 7 |
| **Fallback**          | If zero conversions at Day 60: conduct user interviews (5-10 active free users). Adjust pricing, feature gates, or value proposition based on feedback. Consider freemium pivot: make core features free, monetize API/data access instead                                                                  |
| **Incident Playbook** | N/A (business metric, not operational incident)                                                                                                                                                                                                                                                             |

### RISK-029: AI Costs Exceed Revenue

| Field                 | Detail                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-029                                                                                                                                                                                                                                                                      |
| **Area**              | Business                                                                                                                                                                                                                                                                      |
| **Failure Mode**      | AI API costs (OpenAI + Anthropic) per user exceed the subscription revenue generated per user. Platform achieves negative unit economics on every paying customer                                                                                                             |
| **Root Cause**        | AI-heavy features (29 agents) consume significant tokens. Average AI cost per user exceeds $10-$30/month. Entry-level plan ($29/mo) leaves insufficient margin after AI costs + infrastructure allocation. Heavy users drive disproportionate AI consumption                  |
| **Impact**            | Each new paying customer increases losses. Scaling becomes toxic -- more users = more losses. Must either raise prices (reducing competitiveness) or reduce AI features (reducing value)                                                                                      |
| **Financial Impact**  | $5-$30/user/month in AI cost overrun. At 100 paying users: $500-$3,000/month in losses                                                                                                                                                                                        |
| **Probability**       | 3 (Possible)                                                                                                                                                                                                                                                                  |
| **Detection**         | Track per-user AI cost via `ai_usage_logs.estimated_cost_usd` (TBL-011) aggregated monthly. Alert if average AI cost per user exceeds 40% of their plan price. Monitor cost distribution: identify heavy AI users                                                             |
| **Mitigation**        | Use GPT-4o-mini as default (4-10x cheaper than GPT-4o). Cache AI responses for common queries. Implement tiered AI limits: Free=5/mo, T1=50/mo, T2=200/mo, T3=unlimited. Pre-compute batch results to avoid redundant AI calls. Consider on-device/edge AI for simple scoring |
| **Fallback**          | Introduce AI credit system: users get X AI credits/month, purchase more at $0.10/credit. Shift heavy AI operations to nightly batch (cheaper). Remove least-used AI agents from live access                                                                                   |
| **Incident Playbook** | N/A (business metric)                                                                                                                                                                                                                                                         |

### RISK-030: Competitor Clones Core Features

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-030                                                                                                                                                                                                                                                                                                                                                                                   |
| **Area**              | Business                                                                                                                                                                                                                                                                                                                                                                                   |
| **Failure Mode**      | Established competitor (Grin, Aspire, CreatorIQ) or well-funded startup replicates DealStage's AI matching + contact database + deal pipeline combination, eliminating competitive differentiation                                                                                                                                                                                         |
| **Root Cause**        | AI matching and deal pipeline are not patentable. Contact database (44K+ from GMO) is replicable with the same data provider. UI patterns are visible to any user. No network effect moat yet (marketplace is not two-sided at scale)                                                                                                                                                      |
| **Impact**            | Competitor with larger sales team and existing customers captures the market before DealStage achieves scale. DealStage becomes a feature in a larger platform rather than a standalone product                                                                                                                                                                                            |
| **Financial Impact**  | Existential risk -- potential $0 in revenue if outcompeted. $10,000+ in pivoting costs                                                                                                                                                                                                                                                                                                     |
| **Probability**       | 3 (Possible -- creator economy tools is a competitive space)                                                                                                                                                                                                                                                                                                                               |
| **Detection**         | Monthly competitive analysis. Monitor competitor changelogs, press releases, and product updates. Set Google Alerts for "AI partnership matching" and similar keywords. Track competitor pricing changes                                                                                                                                                                                   |
| **Mitigation**        | Build defensible moats: (1) network effects from two-sided marketplace data, (2) proprietary brand intelligence not available from GMO alone, (3) deep workflow integrations that increase switching costs, (4) community and content brand. Move faster than competitors on AI integration. Focus on underserved niches (nano/micro creators, niche industries) that big platforms ignore |
| **Fallback**          | If outcompeted on features: pivot to vertical focus (specific industries). Pivot to API/data provider model. Consider acquisition by competitor. Double down on community and content marketing moat                                                                                                                                                                                       |
| **Incident Playbook** | N/A (strategic risk)                                                                                                                                                                                                                                                                                                                                                                       |

### RISK-031: Founder Burnout / Single Point of Failure

| Field                 | Detail                                                                                                                                                                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-031                                                                                                                                                                                                                                                                                                   |
| **Area**              | Business                                                                                                                                                                                                                                                                                                   |
| **Failure Mode**      | Solo founder (entire engineering, product, support, marketing, and ops team) burns out, becomes ill, or is otherwise unavailable. All platform operations, incident response, and development stop                                                                                                         |
| **Root Cause**        | Bus factor of 1 for every function. Founder is on-call 24/7 with no backup. Multiple concurrent responsibilities (DealStage + Friedman Global consulting + other ventures). No documented procedures for common operations                                                                                 |
| **Impact**            | All operations halt. Users have no support. Incidents go unresolved. Deployments stop. If prolonged: platform degrades and users churn                                                                                                                                                                     |
| **Financial Impact**  | $100-$500/day in unresolved issues and lost momentum. Potentially existential if unavailability exceeds 2 weeks                                                                                                                                                                                            |
| **Probability**       | 3 (Possible -- solo founder burnout rate is ~70% in first 2 years)                                                                                                                                                                                                                                         |
| **Detection**         | Self-monitoring: track hours worked, stress levels, sleep quality. External: if no GitHub commits or Supabase dashboard access for 48+ hours, auto-alert set. Deadman switch: service that requires daily check-in                                                                                         |
| **Mitigation**        | This documentation suite (Batches 1-4) is the primary mitigation -- enables anyone to operate the platform. Create contractor playbook for emergency operations. Identify 1-2 trusted contractors who could handle SEV1 incidents. Automate everything possible: CI/CD, monitoring alerts, email responses |
| **Fallback**          | Emergency contractor engagement using runbooks in this document. Enable Supabase auto-backup. Set up automated monitoring that pages a backup contact. Pre-drafted "maintenance mode" message ready to deploy. See INC-018                                                                                 |
| **Incident Playbook** | INC-018                                                                                                                                                                                                                                                                                                    |

---

## Area 9: Compliance

### RISK-032: GDPR Data Request Unprocessed

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-032                                                                                                                                                                                                                                                                                                                                  |
| **Area**              | Compliance                                                                                                                                                                                                                                                                                                                                |
| **Failure Mode**      | EU user submits GDPR Subject Access Request (SAR) or deletion request. Request is not processed within the legally mandated 30-day window due to no automated pipeline and solo founder operational load                                                                                                                                  |
| **Root Cause**        | No automated GDPR request pipeline. Requests arrive via email (Contact page PG-092) and may be missed or deprioritized. Data is spread across 65+ tables -- manual export is time-consuming. Deletion requires cascading across all related tables. No documented procedure (until this batch -- see RB-007, RB-008)                      |
| **Impact**            | GDPR violation. Fines up to 4% of annual global turnover or 20 million EUR (whichever is greater). Complaint filed with data protection authority. Negative PR                                                                                                                                                                            |
| **Financial Impact**  | $5,000-$100,000+ in fines (minimum fine for small companies is typically $5,000-$10,000). $1,000-$5,000 in legal fees for response                                                                                                                                                                                                        |
| **Probability**       | 2 (Unlikely at current scale -- small EU user base)                                                                                                                                                                                                                                                                                       |
| **Detection**         | Dedicated GDPR inbox or form on GDPR page (PG-088). Auto-acknowledge every request with "We received your request and will respond within 30 days." Calendar reminder at 7, 14, 21, and 28 days                                                                                                                                           |
| **Mitigation**        | Implement automated data export (see RB-007): edge function that queries all user-related tables by `user_id` or `owner_id` and generates JSON export. Implement automated deletion (see RB-008): edge function that cascading-deletes across all tables. Process all requests within 14 days (half the legal deadline) for safety margin |
| **Fallback**          | If approaching 30-day deadline: request legally permitted 60-day extension (allowed for complex requests). Engage GDPR consultant for complex cases. Manual SQL queries to extract/delete data using the data dictionary from Batch 1                                                                                                     |
| **Incident Playbook** | N/A (compliance procedure -- see RB-007, RB-008)                                                                                                                                                                                                                                                                                          |

### RISK-033: Fake Testimonials / FTC Compliance

| Field                 | Detail                                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-033                                                                                                                                                                                                                                                                                                                                                |
| **Area**              | Compliance                                                                                                                                                                                                                                                                                                                                              |
| **Failure Mode**      | AI-generated marketing content (campaign briefs, outreach templates) creates or facilitates fake testimonials, undisclosed paid partnerships, or misleading claims. FTC investigates platform for facilitating deceptive practices                                                                                                                      |
| **Root Cause**        | AI campaign generator (AGT-004) may suggest testimonial-style content without proper disclosure language. Platform does not enforce FTC disclosure requirements (#ad, #sponsored) in outreach templates. Marketplace opportunities may not require disclosure terms                                                                                     |
| **Impact**            | FTC enforcement action against DealStage. Fines up to $50,120 per violation. Brand and talent users exposed to legal liability from platform-facilitated non-compliant content                                                                                                                                                                          |
| **Financial Impact**  | $10,000-$500,000 in FTC fines. $5,000-$20,000 in legal defense costs. Existential reputational damage                                                                                                                                                                                                                                                   |
| **Probability**       | 2 (Unlikely -- but risk increases as user volume grows)                                                                                                                                                                                                                                                                                                 |
| **Detection**         | Periodic audit of AI-generated content for FTC compliance keywords. Review outreach templates for disclosure language. Monitor for user complaints about misleading content                                                                                                                                                                             |
| **Mitigation**        | Add FTC disclosure requirements to all AI-generated campaign content: automatic "#ad" and "#sponsored" insertion. Add compliance checkbox to marketplace opportunity creation. Include FTC guidelines link in onboarding for brand users. AI prompts must include instruction: "Include appropriate FTC disclosure language in all partnership content" |
| **Fallback**          | If FTC inquiry received: engage compliance attorney immediately. Audit all generated content. Implement content filter that blocks non-compliant outputs. Proactively communicate compliance improvements to FTC                                                                                                                                        |
| **Incident Playbook** | N/A (compliance procedure)                                                                                                                                                                                                                                                                                                                              |

### RISK-034: CCPA / State Privacy Law Violation

| Field                 | Detail                                                                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-034                                                                                                                                                                                                                                                 |
| **Area**              | Compliance                                                                                                                                                                                                                                               |
| **Failure Mode**      | California or other state privacy law requires specific data handling that DealStage does not implement. "Do Not Sell My Personal Information" link missing. Opt-out mechanism not available. Privacy policy does not accurately describe data practices |
| **Root Cause**        | Privacy policy (PG-091) may not be updated to reflect all data collection and sharing practices. No "Do Not Sell" link required by CCPA if business meets threshold. Contact data from GMO may constitute "sale" under CCPA if shared with users         |
| **Impact**            | CCPA fines up to $7,500 per intentional violation. Private right of action for data breaches: $100-$750 per consumer per incident. Class action lawsuit risk                                                                                             |
| **Financial Impact**  | $5,000-$100,000+ depending on violation scope and enforcement                                                                                                                                                                                            |
| **Probability**       | 2 (Unlikely -- CCPA applies to businesses with >$25M revenue or >50K consumers)                                                                                                                                                                          |
| **Detection**         | Quarterly privacy policy audit against current data practices. Monitor state privacy law developments. Review GMO data usage terms for compliance                                                                                                        |
| **Mitigation**        | Keep privacy policy updated (quarterly review). Implement "Do Not Sell" opt-out mechanism proactively. Maintain data processing inventory mapping all data flows from Batch 1 data dictionary. Add cookie consent banner with granular opt-out           |
| **Fallback**          | If enforcement action: engage privacy attorney. Conduct rapid compliance audit. Implement required changes within 30-day cure period (available in most state laws)                                                                                      |
| **Incident Playbook** | N/A (compliance procedure)                                                                                                                                                                                                                               |

---

## Area 10: AI/ML Operations

### RISK-035: Model Drift in Match Scoring

| Field                 | Detail                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                | RISK-035                                                                                                                                                                                                                                                                                                     |
| **Area**              | AI/ML Ops                                                                                                                                                                                                                                                                                                    |
| **Failure Mode**      | Match scoring quality degrades over time as the distribution of brands and talent shifts. The scoring algorithm (Step 6.1) was tuned for the initial dataset of 1,200 brands but becomes less accurate as new brands with different profiles are added                                                       |
| **Root Cause**        | Static scoring weights do not adapt to changing data distributions. No feedback loop from match outcomes (did the user act on the match?) to scoring model. Enrichment data quality varies over time (RISK-003)                                                                                              |
| **Impact**            | Match recommendations become less relevant. Users lose trust in AI recommendations. Conversion from match -> outreach -> deal decreases                                                                                                                                                                      |
| **Financial Impact**  | $500-$2,000/month in reduced engagement and churn from poor match quality                                                                                                                                                                                                                                    |
| **Probability**       | 3 (Possible -- all static models drift)                                                                                                                                                                                                                                                                      |
| **Detection**         | Track "match acceptance rate" (% of shown matches that users click/act on). Alert if acceptance rate drops >20% from baseline over 30 days. A/B test match scoring versions. Monitor match score distribution for anomalies                                                                                  |
| **Mitigation**        | Implement feedback loop: track which matches lead to outreach (Step 9.1) and deals (Step 10.1). Use feedback to adjust scoring weights quarterly. Add "Was this match helpful?" thumbs up/down on match results. Periodically retune weights using successful partnership data from `partnerships` (TBL-004) |
| **Fallback**          | Revert to baseline scoring weights. Supplement AI scoring with manual curation for top-tier users. Allow users to adjust their own matching preferences                                                                                                                                                      |
| **Incident Playbook** | INC-004                                                                                                                                                                                                                                                                                                      |

### RISK-036: Training Data Poisoning

| Field                 | Detail                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-036                                                                                                                                                                                                                                                                  |
| **Area**              | AI/ML Ops                                                                                                                                                                                                                                                                 |
| **Failure Mode**      | Malicious or spammy data in `brands` (TBL-002), `talents` (TBL-003), or `enriched_creators` (TBL-014) pollutes the data used for AI agent prompts and match scoring. Fake brands, inflated metrics, or spam profiles degrade AI output quality                            |
| **Root Cause**        | Open registration allows anyone to create profiles. No verification requirement for brand or talent data. Bulk brand population (Step 3.1) could include incorrect data. Crawl4AI enrichment (Steps 4.1, 4.3) may extract incorrect data from websites                    |
| **Impact**            | AI recommendations include spam/fake profiles. Match scoring produces nonsensical results. Users lose trust in platform data quality                                                                                                                                      |
| **Financial Impact**  | $200-$1,000/month in user churn from data quality issues                                                                                                                                                                                                                  |
| **Probability**       | 2 (Unlikely at current scale)                                                                                                                                                                                                                                             |
| **Detection**         | Monitor new profile creation velocity: alert if >50 profiles created within 1 hour (spam attack). Flag profiles with suspicious patterns: no avatar, generic bio, extreme metric values. Periodic data quality audit: sample 100 profiles, verify accuracy                |
| **Mitigation**        | Implement email verification requirement before profile data appears in search/match results. Add admin moderation queue for new profiles. Validate enrichment data: flag extracted metrics that are >2 standard deviations from median. Add "Report fake profile" button |
| **Fallback**          | Quarantine suspected spam profiles (set `status = 'flagged'`). Exclude flagged profiles from match scoring and search results. Batch-delete confirmed spam profiles                                                                                                       |
| **Incident Playbook** | INC-017                                                                                                                                                                                                                                                                   |

### RISK-037: Bias in AI Matching Across Demographics

| Field                 | Detail                                                                                                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                | RISK-037                                                                                                                                                                                                                                                                                                            |
| **Area**              | AI/ML Ops                                                                                                                                                                                                                                                                                                           |
| **Failure Mode**      | AI matching engine systematically under-recommends talent from certain demographics, geographic regions, or content niches due to bias in training data or scoring algorithm design                                                                                                                                 |
| **Root Cause**        | Pre-loaded brand data (1,200 brands) may over-represent certain industries/regions. GMO contact data may have demographic skew. AI enrichment models (GPT-4o-mini, Claude) carry inherent biases from training data. Engagement rate metrics (used in scoring) may disadvantage certain content styles or platforms |
| **Impact**            | Talent from underrepresented groups receives fewer match opportunities. Platform develops reputation for bias. Potential discrimination claims. Violation of platform's value proposition of fair, meritocratic matching                                                                                            |
| **Financial Impact**  | $5,000-$50,000 in legal liability if discrimination proven. Reputational damage reducing user acquisition                                                                                                                                                                                                           |
| **Probability**       | 3 (Possible -- all AI systems carry bias risk)                                                                                                                                                                                                                                                                      |
| **Detection**         | Quarterly bias audit: analyze match score distribution by geographic region, content niche, platform, and follower tier. Compare match-to-outreach conversion rates across demographic segments. Detect if certain talent types consistently receive lower scores                                                   |
| **Mitigation**        | Tier-normalized scoring (see RISK-001 mitigation). Geographic diversity requirement: ensure match results include talent from multiple regions. Platform diversity requirement: don't over-weight Instagram metrics. Regular bias testing with synthetic profiles across demographics                               |
| **Fallback**          | Manual review and adjustment of scoring weights by demographic audit findings. Introduce "diversity boost" scoring factor. Disclose algorithmic matching methodology in platform terms                                                                                                                              |
| **Incident Playbook** | INC-004 (adapted)                                                                                                                                                                                                                                                                                                   |

---

## Risk Summary Matrix

| RISK-ID  | Area           | Failure Mode                       | Prob | Impact | Priority | Status   |
| -------- | -------------- | ---------------------------------- | ---- | ------ | -------- | -------- |
| RISK-001 | Matching       | Algorithm bias high-follower       | 4    | 3      | 12 High  | Monitor  |
| RISK-002 | Matching       | Cold start problem                 | 5    | 3      | 15 High  | Mitigate |
| RISK-003 | Matching       | Stale enrichment data              | 5    | 3      | 15 High  | Mitigate |
| RISK-004 | Matching       | Performance degradation            | 3    | 3      | 9 Medium | Plan     |
| RISK-005 | AI Agents      | Hallucination                      | 4    | 4      | 16 Crit  | Mitigate |
| RISK-006 | AI Agents      | Cost overrun                       | 3    | 3      | 9 Medium | Monitor  |
| RISK-007 | AI Agents      | Provider outage                    | 3    | 4      | 12 High  | Plan     |
| RISK-008 | AI Agents      | Prompt injection                   | 2    | 4      | 8 Medium | Plan     |
| RISK-009 | Database       | Connection pool exhaustion         | 3    | 5      | 15 High  | Mitigate |
| RISK-010 | Database       | Data corruption concurrent updates | 2    | 4      | 8 Medium | Plan     |
| RISK-011 | Database       | RLS misconfiguration               | 4    | 5      | 20 Crit  | Mitigate |
| RISK-012 | Database       | Migration failure                  | 3    | 3      | 9 Medium | Plan     |
| RISK-013 | Payments       | Webhook failure profiles.plan      | 3    | 5      | 15 High  | Mitigate |
| RISK-014 | Payments       | Double charge                      | 2    | 4      | 8 Medium | Plan     |
| RISK-015 | Payments       | Escrow lock                        | 2    | 4      | 8 Medium | Plan     |
| RISK-016 | Payments       | Subscription not activating        | 2    | 3      | 6 Medium | Plan     |
| RISK-017 | External APIs  | GMO rate limit/downtime            | 3    | 2      | 6 Medium | Monitor  |
| RISK-018 | External APIs  | Crawl4AI Railway crash             | 3    | 2      | 6 Medium | Monitor  |
| RISK-019 | External APIs  | Resend delivery failure            | 2    | 3      | 6 Medium | Monitor  |
| RISK-020 | Infrastructure | Vercel deploy failure              | 2    | 2      | 4 Low    | Monitor  |
| RISK-021 | Infrastructure | Supabase outage                    | 2    | 5      | 10 High  | Plan     |
| RISK-022 | Infrastructure | Railway downtime                   | 2    | 2      | 4 Low    | Monitor  |
| RISK-023 | Infrastructure | DNS/SSL failure                    | 1    | 5      | 5 Medium | Monitor  |
| RISK-024 | Security       | XSS localStorage tokens            | 2    | 5      | 10 High  | Plan     |
| RISK-025 | Security       | Role escalation via signup         | 2    | 5      | 10 High  | Mitigate |
| RISK-026 | Security       | API key exposure in client         | 2    | 5      | 10 High  | Mitigate |
| RISK-027 | Security       | Brute force login                  | 2    | 4      | 8 Medium | Plan     |
| RISK-028 | Business       | Zero paying users 90 days          | 3    | 4      | 12 High  | Monitor  |
| RISK-029 | Business       | AI costs exceed revenue            | 3    | 4      | 12 High  | Monitor  |
| RISK-030 | Business       | Competitor clones features         | 3    | 4      | 12 High  | Monitor  |
| RISK-031 | Business       | Founder burnout / bus factor       | 3    | 5      | 15 High  | Mitigate |
| RISK-032 | Compliance     | GDPR request unprocessed           | 2    | 4      | 8 Medium | Plan     |
| RISK-033 | Compliance     | Fake testimonials / FTC            | 2    | 4      | 8 Medium | Plan     |
| RISK-034 | Compliance     | CCPA / state privacy violation     | 2    | 4      | 8 Medium | Monitor  |
| RISK-035 | AI/ML Ops      | Model drift                        | 3    | 3      | 9 Medium | Monitor  |
| RISK-036 | AI/ML Ops      | Training data poisoning            | 2    | 3      | 6 Medium | Monitor  |
| RISK-037 | AI/ML Ops      | Bias in matching                   | 3    | 4      | 12 High  | Plan     |

---

# DELIVERABLE 11: INCIDENT RESPONSE PLAYBOOK

## Overview

This playbook covers 18 incident scenarios specific to DealStage. At the current stage (solo founder, pre-revenue), the founder is Incident Commander, Technical Lead, Communications Lead, and Scribe for all incidents. As the team grows, these roles should be separated per the role definitions in the Severity Framework.

### Current On-Call Configuration

| Role                | Person                   | Contact Method      |
| ------------------- | ------------------------ | ------------------- |
| Incident Commander  | Founder                  | Phone, Slack, Email |
| Technical Lead      | Founder                  | Same                |
| Communications Lead | Founder                  | Same                |
| Backup Contact      | Trusted Contractor (TBD) | Phone, Email        |

### Severity Framework (DealStage-Specific)

| Level | Name     | Criteria                                                               | Response Time | Update Cadence | Who Gets Notified                           |
| ----- | -------- | ---------------------------------------------------------------------- | ------------- | -------------- | ------------------------------------------- |
| SEV1  | Critical | Full outage, data breach, payment system failure, data loss            | < 15 min      | Every 30 min   | All users (if customer-facing), status page |
| SEV2  | Major    | Core feature broken (matching, deals, search), degraded for >25% users | < 1 hour      | Every 1 hour   | Affected users via in-app banner            |
| SEV3  | Moderate | Non-core feature broken, workaround exists, background service down    | < 4 hours     | Every 4 hours  | No external communication needed            |
| SEV4  | Low      | Cosmetic, no user impact, monitoring noise                             | Next bus. day | End of day     | None                                        |

---

## INC-001: Full Platform Outage

| Field               | Detail                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | INC-001                                                                                                                                                                                                                                                                        |
| **Type**            | Infrastructure                                                                                                                                                                                                                                                                 |
| **Severity**        | SEV1                                                                                                                                                                                                                                                                           |
| **Trigger**         | External monitoring (UptimeRobot) reports thedealstage.com unreachable for >2 minutes, OR multiple users report inability to access any page                                                                                                                                   |
| **Detection**       | UptimeRobot HTTP check returns non-200 for 3 consecutive checks (90 seconds). Vercel status page shows incident. Supabase status page shows incident. Manual check: `curl -I https://thedealstage.com` returns error                                                           |
| **On-Call**         | Founder                                                                                                                                                                                                                                                                        |
| **Escalation Path** | 0 min: Founder alerted. 15 min: If Supabase is down, open Supabase support ticket. 30 min: If Vercel is down, check Vercel status, consider DNS failover. 60 min: If unresolved, post public status update. 120 min: Consider activating maintenance page on alternate hosting |

### Immediate Actions (First 15 Minutes)

1. Acknowledge alert and begin investigation
2. Check Vercel dashboard: is the deployment healthy? Can you access Vercel admin?
3. Check Supabase dashboard: is the project accessible? Are all services green?
4. Check DNS: `dig thedealstage.com` -- are nameservers responding correctly?
5. Check SSL: `curl -vI https://thedealstage.com 2>&1 | grep -i ssl` -- certificate valid?
6. Check from multiple locations: use downforeveryoneorjustme.com to confirm scope

### Investigation

1. If Vercel is down: check status.vercel.com. If platform-level issue, wait for Vercel to resolve. If project-specific: check build logs, deployment status
2. If Supabase is down: check status.supabase.com. If platform-level: wait. If project-specific: check database health, connection counts, resource usage
3. If DNS: check domain registrar, verify nameserver configuration, check TTL
4. If SSL: check Vercel SSL dashboard, attempt manual certificate re-issuance
5. If none of the above: check browser console for client-side errors. Test with incognito/different browser. Check CDN cache status

### Mitigation

- Vercel deployment issue: Rollback to previous deployment via Vercel dashboard (1 click)
- Supabase issue: If project-specific, restart project. If platform-level, enable maintenance page
- DNS issue: Switch to Cloudflare proxy as temporary resolution. Contact registrar
- SSL issue: Re-provision certificate in Vercel dashboard

### Resolution

1. Confirm all services are responding: test auth, search, dashboard, deals
2. Monitor error rates for 30 minutes post-recovery
3. Update status page / social media with resolution
4. Create post-mortem within 24 hours

### User Communication Template -- Initial

```
Subject: DealStage is currently experiencing an outage

We are aware that DealStage is currently unavailable. Our team is actively
investigating the issue and working to restore service as quickly as possible.

What we know:
- DealStage became unreachable at approximately [TIME] UTC
- We are investigating the root cause
- Your data is safe and no data has been lost

We will provide updates every 30 minutes until the issue is resolved.

We apologize for the inconvenience and appreciate your patience.

-- The DealStage Team
```

### User Communication Template -- Resolved

```
Subject: [RESOLVED] DealStage service has been restored

DealStage is back online and fully operational.

Summary:
- Issue: [Brief description]
- Duration: [START TIME] to [END TIME] UTC ([DURATION])
- Impact: [What was affected]
- Resolution: [What fixed it]

Your data was not affected during this outage. If you experience any
issues, please contact us at support@thedealstage.com.

We apologize for the disruption and are taking steps to prevent
recurrence.

-- The DealStage Team
```

### Compensation Policy

- Outage < 1 hour: No compensation. Apology email
- Outage 1-4 hours: 3 bonus AI credits for all active users
- Outage 4-24 hours: 7 days added to all paid subscriptions
- Outage > 24 hours: 1 month free for all paying customers + personal apology email from founder

---

## INC-002: Supabase Database Unreachable

| Field               | Detail                                                                                                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-002                                                                                                                                                                                                                                                                 |
| **Type**            | Database / Infrastructure                                                                                                                                                                                                                                               |
| **Severity**        | SEV1                                                                                                                                                                                                                                                                    |
| **Trigger**         | Application errors show "Failed to fetch" on any Supabase query. Health check `supabase.from('profiles').select('id').limit(1)` fails for >60 seconds. Edge functions returning 500 errors with database connection messages                                            |
| **Detection**       | External health check (UptimeRobot custom endpoint that queries Supabase). Application error monitoring showing Supabase connection errors. User reports of "Something went wrong" screens across all features                                                          |
| **On-Call**         | Founder                                                                                                                                                                                                                                                                 |
| **Escalation Path** | 0 min: Founder. 15 min: Open Supabase support ticket (Pro plan includes priority support). 30 min: Check if connection pool exhaustion (RISK-009) and attempt remediation. 60 min: If Supabase platform issue, communicate to users. 120 min: Evaluate failover options |

### Immediate Actions (First 15 Minutes)

1. Check Supabase dashboard: project health, database status, all services
2. Check status.supabase.com for platform-wide incidents
3. Check connection count: SQL Editor -> `SELECT count(*) FROM pg_stat_activity;`
4. Check for long-running queries: `SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC LIMIT 10;`
5. Check edge function logs for error patterns

### Investigation

1. Connection pool exhaustion: If connection count is near limit (15 free / 50 Pro), kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '5 minutes';`
2. Long-running query blocking: Identify and terminate: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND duration > interval '60 seconds' AND query NOT LIKE '%pg_stat%';`
3. Storage full: Check Supabase dashboard for storage usage. If at limit, identify and clean large tables
4. Supabase platform issue: Wait for Supabase to resolve. Enable maintenance mode

### Mitigation

- Connection pool exhaustion: Kill connections, disable batch operations, investigate leak
- Long-running query: Kill query, add timeout to offending edge function
- Storage full: Emergency cleanup of `ai_usage_logs` (TBL-011, highest row count table), `activities` (TBL-005)
- Platform issue: Enable maintenance page, wait for Supabase resolution

### Resolution

1. Verify all Supabase services (DB, Auth, Storage, Edge Functions, Realtime) are responding
2. Test critical flows: login, search, deal creation, payment
3. Monitor connection count and error rates for 30 minutes
4. Restart any queued background jobs that failed during outage

### User Communication Template -- Initial

```
Subject: DealStage is experiencing database connectivity issues

We are aware that DealStage is currently experiencing issues loading data.
You may see error messages or blank pages when trying to access features.

Our team is actively working to resolve the database connectivity issue.
Your data is safe -- this is a temporary connectivity problem, not a
data loss event.

We will provide an update within 30 minutes.

-- The DealStage Team
```

### Compensation Policy

Same as INC-001.

---

## INC-003: Stripe Payment Failures

| Field               | Detail                                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | INC-003                                                                                                                                                                                                                                          |
| **Type**            | Payments                                                                                                                                                                                                                                         |
| **Severity**        | SEV1                                                                                                                                                                                                                                             |
| **Trigger**         | Multiple users report payment failures during checkout. Stripe webhook errors in edge function logs. Stripe Dashboard shows elevated decline rates. `checkout.session.completed` webhooks not being received                                     |
| **Detection**       | Stripe webhook failure notifications. User support requests: "I paid but still on free plan." Monitor: any `profiles.plan` mismatch with Stripe subscription status (daily reconciliation job). Application error logs showing Stripe API errors |
| **On-Call**         | Founder                                                                                                                                                                                                                                          |
| **Escalation Path** | 0 min: Founder. 15 min: Check Stripe status page and dashboard. 30 min: If Stripe platform issue, disable checkout flow with message. 60 min: If webhook processing issue, manually reconcile affected users                                     |

### Immediate Actions (First 15 Minutes)

1. Check status.stripe.com for platform incidents
2. Check Stripe Dashboard -> Developers -> Webhooks: look for failed deliveries
3. Check Stripe Dashboard -> Developers -> Logs: look for API errors
4. Check edge function logs for webhook handler errors
5. Identify affected users: query `profiles` where `plan = 'free'` but Stripe shows active subscription

### Investigation

1. Stripe platform down: Wait for resolution. Disable payment flows
2. Webhook delivery failing: Check webhook signing secret. Verify endpoint URL is correct. Check edge function deployment status
3. Webhook processing error: Check edge function logs. Common causes: database write failure, incorrect field mapping, Stripe API version mismatch
4. Card declines: If elevated across all users, likely Stripe or bank issue. If specific users, normal decline behavior

### Mitigation

- Stripe down: Disable upgrade buttons. Show "Payment processing is temporarily unavailable. Your current plan is unaffected." message
- Webhook failures: Fix webhook handler, replay failed webhooks from Stripe Dashboard (Webhooks -> select endpoint -> resend)
- Processing errors: Fix edge function, redeploy, replay webhooks
- Reconciliation: For each affected user, manually set `profiles.plan` via SQL Editor:
  ```sql
  UPDATE profiles SET plan = 'tier1', updated_at = now()
  WHERE email = 'user@example.com';
  ```

### Resolution

1. Verify webhook handler is processing events correctly (test with Stripe CLI: `stripe trigger checkout.session.completed`)
2. Reconcile all affected users: ensure `profiles.plan` matches Stripe subscription status
3. Send personal email to any user who experienced payment issues
4. Monitor for 24 hours for any recurring webhook failures

### User Communication Template -- Payment Issue

```
Subject: Update on your DealStage subscription

Hi [NAME],

We identified a brief issue with our payment processing system that may
have affected your subscription activation. We want to assure you that:

- Your payment was successfully processed
- Your account has been upgraded to [PLAN NAME]
- All [PLAN NAME] features are now active on your account

If you notice any issues with your account features, please reply to
this email and we will resolve it immediately.

We sincerely apologize for any inconvenience.

Best,
[FOUNDER NAME]
DealStage
```

### Compensation Policy

- Payment processing delay < 1 hour: Personal apology email
- Payment processed but plan not activated for 1-24 hours: 7 bonus AI credits
- Payment processed but plan not activated for >24 hours: 1 month free on their plan
- Double charge: Immediate refund + 1 month free + personal call from founder

---

## INC-004: AI Matching Returning Wrong Results

| Field               | Detail                                                                                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-004                                                                                                                                                                                                                             |
| **Type**            | AI / Product Quality                                                                                                                                                                                                                |
| **Severity**        | SEV2                                                                                                                                                                                                                                |
| **Trigger**         | Multiple user complaints about irrelevant match results on PG-055 (MatchEngine). Monitoring shows match acceptance rate dropped >30% from baseline. Match score distribution anomaly detected (all scores clustering at same value) |
| **Detection**       | User feedback: "These matches make no sense." Match acceptance rate monitoring. Match score distribution monitoring (alert if standard deviation drops below threshold). Manual spot-check of match results during weekly review    |
| **On-Call**         | Founder                                                                                                                                                                                                                             |
| **Escalation Path** | 0 min: Founder. 1 hour: If edge function issue, fix and redeploy. 4 hours: If data quality issue, investigate enrichment pipeline. 24 hours: If algorithm issue, design fix and deploy                                              |

### Immediate Actions (First 30 Minutes)

1. Spot-check 10 match results manually: do they make sense?
2. Check `scoreMatch` edge function logs for errors
3. Check `match_scores` table (TBL-018) for anomalies: are scores all the same? Are breakdowns populated?
4. Check enrichment data: are `enriched_creators` (TBL-014) and `enriched_brands` (TBL-015) tables populated and recent?
5. Check if a recent deployment changed scoring logic

### Investigation

1. Edge function error: scores computed with incomplete data (missing enrichment fields). Fix: add null checks
2. Enrichment failure: Crawl4AI or AI extraction pipeline failed. Scores computed without enrichment context
3. Data corruption: brand or talent table data corrupted or incorrectly updated
4. Algorithm regression: recent code change broke scoring formula
5. AI provider issue (Step 6.2): GPT-4o-mini returning degraded responses

### Mitigation

- Edge function bug: Fix, redeploy, re-score affected matches
- Enrichment failure: Queue re-enrichment for affected profiles. Return cached scores in the interim
- Algorithm regression: Rollback deployment via Vercel
- AI provider issue: Switch to fallback provider (Claude if OpenAI, or vice versa)

### Resolution

1. Re-score all affected matches: batch edge function invocation
2. Verify match quality with manual spot-check (20 matches across different talent tiers)
3. Monitor match acceptance rate for 48 hours post-fix
4. Update scoring test cases to prevent regression

### User Communication Template

```
Subject: Improvements to DealStage match recommendations

Hi [NAME],

We identified and resolved an issue that was affecting the quality of
partnership match recommendations. Your matches have been refreshed with
improved accuracy.

Please check your updated matches at [MATCH ENGINE URL].

If you have feedback on match quality, we'd love to hear it -- just
reply to this email.

Best,
[FOUNDER NAME]
DealStage
```

### Compensation Policy

- Degraded matches for < 24 hours: No compensation (product issue, not outage)
- Degraded matches for > 24 hours: 5 bonus AI credits for affected users
- If user made decisions based on bad matches: Personal outreach and case-by-case resolution

---

## INC-005: Data Breach -- Unauthorized Data Access

| Field               | Detail                                                                                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | INC-005                                                                                                                                                                                                                                                                                          |
| **Type**            | Security                                                                                                                                                                                                                                                                                         |
| **Severity**        | SEV1                                                                                                                                                                                                                                                                                             |
| **Trigger**         | Evidence of unauthorized data access: unusual query patterns in audit logs, user report of seeing other users' data, RLS policy bypass detected, exposed API key discovered, or external security researcher report                                                                              |
| **Detection**       | Audit log anomaly: user accessing data outside their scope. Bug bounty / security researcher report. Automated scan detecting RLS policy gap. User report: "I can see someone else's deals/contacts." Exposed credential detected by GitHub secret scanning or external scanner                  |
| **On-Call**         | Founder                                                                                                                                                                                                                                                                                          |
| **Escalation Path** | 0 min: Founder -- this is an all-hands emergency. 15 min: Assess scope. If confirmed breach, engage legal counsel. 30 min: If HIGH PII data (TBL-001, TBL-003, TBL-008, TBL-012) accessed, begin breach notification process. 60 min: If >500 users affected, engage breach notification service |

### Immediate Actions (First 15 Minutes)

1. CONFIRM the breach: verify the report, reproduce the access pattern
2. CONTAIN: If RLS issue, add restrictive policy immediately via SQL Editor:
   ```sql
   -- Emergency lockdown: restrict all access to own data
   CREATE POLICY emergency_lockdown ON [affected_table]
   FOR ALL USING (auth.uid() = owner_id OR auth.uid() = created_by);
   ```
3. If API key exposed: ROTATE the key immediately on the provider dashboard
4. If session compromise: Revoke all sessions: `SELECT auth.admin_delete_session(id) FROM auth.sessions;` (or via Supabase Auth admin API)
5. Preserve evidence: screenshot audit logs, query logs, and access patterns BEFORE making changes

### Investigation

1. Determine scope: which data was accessed, by whom, when, and for how long
2. Query `audit_logs` (TBL-064) and `activities` (TBL-005) for the suspicious user's actions
3. Check Supabase Auth logs for unauthorized session creation
4. Check RLS policies on affected tables: `SELECT * FROM pg_policies WHERE tablename = '[table]';`
5. Check if vulnerability was automated (many requests) or manual (few requests)
6. Determine if data was exfiltrated (downloaded) or only viewed

### Mitigation

- RLS fix: deploy corrected policies
- Key rotation: rotate all potentially compromised keys
- Session revocation: force re-login for all users
- If code vulnerability: deploy fix via Vercel

### Resolution

1. Verify fix prevents the access pattern
2. Full RLS audit of all 65+ tables
3. Contact affected users (see communication template)
4. File breach report if required (GDPR: 72 hours, CCPA: as required)
5. Engage legal counsel for breach notification obligations
6. Post-mortem within 24 hours (not 48 -- accelerated timeline for security incidents)

### User Communication Template -- Data Breach Notification

```
Subject: Important Security Notice from DealStage

Dear [NAME],

We are writing to inform you of a security incident that may have
affected your DealStage account.

What happened:
On [DATE], we identified unauthorized access to [DESCRIPTION OF DATA].
The access occurred between [START TIME] and [END TIME] UTC.

What information was involved:
[LIST OF SPECIFIC DATA TYPES: e.g., "email address, company name,
and partnership deal values"]

What we are doing:
- We immediately fixed the vulnerability that allowed this access
- We have rotated all security credentials
- We have engaged [legal counsel / security firm] to conduct a
  thorough investigation
- We are implementing additional security measures to prevent recurrence

What you should do:
- Change your DealStage password immediately
- If you used the same password on other services, change those as well
- Monitor your email for any suspicious activity
- Review your DealStage account for any unauthorized changes

For questions or concerns, contact us directly at:
security@thedealstage.com

We take the security of your data extremely seriously and sincerely
apologize for this incident.

[FOUNDER NAME]
Founder, DealStage
```

### Compensation Policy

- Data viewed but not exfiltrated: 3 months free on current plan + personal apology
- Data exfiltrated (confirmed): 6 months free + credit monitoring offer (if PII) + personal call
- Financial data exposed: Full remediation + 12 months free + legal assistance if needed

---

## INC-006: OpenAI / Claude API Outage

| Field               | Detail                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | INC-006                                                                                                                                                                                                                              |
| **Type**            | External API / AI                                                                                                                                                                                                                    |
| **Severity**        | SEV2                                                                                                                                                                                                                                 |
| **Trigger**         | AI-powered features returning errors. `ai_usage_logs` (TBL-011) showing >10% error rate in 5-minute window. status.openai.com or status.anthropic.com reporting incident. Edge functions returning 500s with provider error messages |
| **Detection**       | Error rate monitoring on AI edge functions. Provider status page RSS feed. User reports: "Match analysis failed" or "Campaign generation failed." `ai_usage_logs` error rate spike                                                   |
| **On-Call**         | Founder                                                                                                                                                                                                                              |
| **Escalation Path** | 0 min: Founder. 15 min: Confirm provider outage vs. local issue. 30 min: Switch to fallback provider if available. 60 min: If both providers down, degrade gracefully                                                                |

### Immediate Actions (First 15 Minutes)

1. Check provider status pages: status.openai.com, status.anthropic.com
2. Test API directly: `curl https://api.openai.com/v1/chat/completions` with test payload
3. Check if issue is specific provider or both
4. Check if issue is all models or specific models (GPT-4o-mini, Claude)
5. Check DealStage edge function error logs for specific error messages

### Investigation

1. Provider-wide outage: check status page, Twitter, DownDetector
2. Rate limiting: check if DealStage exceeded provider rate limits
3. Billing issue: check provider billing dashboard for past-due payment
4. API key issue: verify key is valid, not expired or rotated
5. Network issue: check if Supabase edge functions can reach external APIs

### Mitigation

- OpenAI down, Anthropic up: Route all requests to Claude. Update edge function provider selection
- Anthropic down, OpenAI up: Route all requests to GPT-4o-mini
- Both down: Serve cached AI responses for common queries. Disable AI features with graceful degradation
- Rate limited: Implement request queue with backpressure. Reduce batch processing

### Resolution

1. Verify provider is back online with test API call
2. Process any queued AI requests
3. Verify all 29 AI agents are functioning correctly
4. Monitor error rates for 1 hour post-recovery

### User Communication Template

```
DealStage AI features are temporarily limited due to a third-party
service issue. Core features (search, deals, contacts) are fully
operational. AI-powered features will be restored as soon as the
upstream service recovers. No action is needed on your part.
```

### Compensation Policy

- AI features unavailable < 2 hours: No compensation (in-app notice only)
- AI features unavailable 2-8 hours: 5 bonus AI credits for all users
- AI features unavailable > 8 hours: 10 bonus AI credits + 3 days added to paid subscriptions

---

## INC-007: GMO Enrichment API Down

| Field               | Detail                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-007                                                                                                                                                                                     |
| **Type**            | External API                                                                                                                                                                                |
| **Severity**        | SEV3                                                                                                                                                                                        |
| **Trigger**         | ContactFinder (PG-056) live search returns zero results for known brands. `gmoFindContacts` and `gmoEnrichCompany` edge functions returning errors. GMO API returning 5xx or timeout errors |
| **Detection**       | Edge function error logs. ContactFinder user complaints. Scheduled enrichment job failures. GMO API response monitoring                                                                     |
| **On-Call**         | Founder                                                                                                                                                                                     |
| **Escalation Path** | 0 min: Founder. 4 hours: Contact GMO support. 24 hours: Evaluate alternative enrichment providers                                                                                           |

### Immediate Actions

1. Check GMO API status (contact GMO support if no public status page)
2. Test GMO API directly with curl
3. Check GMO account: API quota remaining, billing status
4. Verify ContactFinder falls back to local `decision_makers` table (TBL-008) correctly

### Mitigation

- GMO quota exhausted: Disable live enrichment, rely on cached 44K+ contacts
- GMO API down: Same -- disable live enrichment, serve from `decision_makers` table
- GMO billing issue: Update payment method

### Resolution

1. Verify GMO API is responding
2. Process any queued enrichment jobs
3. Verify ContactFinder live search is working

### User Communication Template

```
[No external communication needed for SEV3 -- internal monitoring only]
```

### Compensation Policy

None required -- fallback to cached contacts provides acceptable experience.

---

## INC-008: Crawl4AI Railway Service Crash

| Field               | Detail                                                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-008                                                                                                                                                                                                          |
| **Type**            | External Service                                                                                                                                                                                                 |
| **Severity**        | SEV3                                                                                                                                                                                                             |
| **Trigger**         | Health check to Railway Crawl4AI endpoint fails for >10 minutes. `crawl_jobs` table (TBL-016) shows >10 jobs stuck in "queued" state for >1 hour. Edge function logs show connection refused to Railway endpoint |
| **Detection**       | Health check monitoring. `crawl_jobs` queue depth monitoring. Edge function error logs                                                                                                                           |
| **On-Call**         | Founder                                                                                                                                                                                                          |
| **Escalation Path** | 0 min: Founder. 1 hour: Check Railway dashboard. 4 hours: Attempt container restart/redeploy. 24 hours: If persistent, deploy to alternate provider                                                              |

### Immediate Actions

1. Check Railway dashboard: container status, memory usage, restart count
2. Check Railway logs for OOM or crash errors
3. Attempt container restart via Railway dashboard
4. If restart fails: redeploy from latest image

### Mitigation

- OOM crash: Increase Railway memory allocation. Reduce concurrent crawl limit
- Persistent crash: Redeploy with debug logging. Check for dependency issues
- Railway platform down: Queue all enrichment jobs for later processing

### Resolution

1. Verify Crawl4AI health endpoint is responding
2. Process backlog of queued crawl jobs
3. Verify enrichment pipeline end-to-end

### User Communication Template

```
[No external communication needed -- background enrichment service]
```

### Compensation Policy

None -- enrichment is a background process that does not immediately affect user experience.

---

## INC-009: DDoS Attack

| Field               | Detail                                                                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-009                                                                                                                                                                                                                           |
| **Type**            | Security                                                                                                                                                                                                                          |
| **Severity**        | SEV2                                                                                                                                                                                                                              |
| **Trigger**         | Sudden spike in traffic volume far exceeding normal patterns. Vercel returns 429 (rate limit) or 503 (service unavailable). Supabase connection pool exhausted from excessive requests. Application becomes unresponsive          |
| **Detection**       | Vercel analytics showing unusual traffic spike. Supabase connection count at limit. Error rate spike across all endpoints. Geographic analysis showing traffic from unusual regions. UptimeRobot reporting intermittent failures  |
| **On-Call**         | Founder                                                                                                                                                                                                                           |
| **Escalation Path** | 0 min: Founder. 15 min: Enable Vercel WAF / rate limiting. 30 min: If persists, enable Cloudflare proxy (if configured). 60 min: Contact Vercel support. 120 min: If prolonged, consider moving behind Cloudflare DDoS protection |

### Immediate Actions

1. Confirm DDoS vs. legitimate traffic spike (check traffic sources, patterns)
2. Enable Vercel Edge Middleware rate limiting if not already active
3. Check Supabase: is the database overwhelmed by requests?
4. Identify attack pattern: application layer (L7) or network layer (L3/L4)

### Investigation

1. L7 attack: Identify targeted endpoints. Add rate limiting per-IP via Vercel middleware
2. L3/L4 attack: Vercel's infrastructure handles this -- check if Vercel's protection is effective
3. Supabase targeted: Supabase has its own rate limiting, but edge functions may be the bottleneck
4. Check if attack is exploiting a specific endpoint (e.g., auth signup, search)

### Mitigation

- Enable Cloudflare proxy: change DNS to route through Cloudflare, enable "Under Attack" mode
- Vercel rate limiting: add Edge Middleware that limits requests per IP
- Supabase protection: temporarily disable edge functions that are being abused
- Block attacking IPs if identifiable (Vercel/Cloudflare IP blocking)

### Resolution

1. Verify attack has stopped or is being mitigated
2. Review logs to understand attack vector
3. Implement permanent rate limiting on vulnerable endpoints
4. Consider adding Cloudflare permanently for DDoS protection

### User Communication Template

```
Subject: DealStage experiencing intermittent issues

DealStage may be loading slowly or intermittently unavailable due to
unusually high traffic. We are actively working to stabilize the
platform. Your data is safe and unaffected.

We expect to resolve this within [ESTIMATED TIME].

-- The DealStage Team
```

### Compensation Policy

Same as INC-001.

---

## INC-010: Bad Deployment / Regression

| Field               | Detail                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-010                                                                                                                                                                         |
| **Type**            | Deployment                                                                                                                                                                      |
| **Severity**        | SEV2                                                                                                                                                                            |
| **Trigger**         | Post-deployment errors reported by users or detected in monitoring. New feature breaks existing functionality. Build succeeded but runtime errors occur                         |
| **Detection**       | Post-deployment smoke test failures. User reports of broken features within minutes of deployment. Error rate spike in browser console / monitoring. Visual regression detected |
| **On-Call**         | Founder                                                                                                                                                                         |
| **Escalation Path** | 0 min: Founder. 5 min: Determine scope (isolated feature vs. widespread). 10 min: If widespread, rollback immediately. 30 min: If isolated, evaluate hotfix vs. rollback        |

### Immediate Actions

1. Identify the breaking change: check most recent commit(s)
2. Determine scope: is the entire app broken or just one feature?
3. If critical (auth, payments, core navigation broken): **ROLLBACK IMMEDIATELY**
   - Vercel dashboard -> Deployments -> find previous successful deployment -> "Promote to Production"
4. If non-critical: assess whether hotfix is faster than rollback

### Investigation

1. Check Vercel deployment logs for build warnings
2. Check browser console on affected pages for runtime errors
3. Compare breaking commit diff -- what changed?
4. Test the specific feature that broke locally: `npm run dev`
5. Check if the issue is environment-specific (works locally, breaks in production)

### Mitigation

- Rollback: Vercel instant rollback (< 30 seconds to complete)
- Hotfix: fix the issue, push to main, Vercel auto-deploys (2-5 minutes)
- Feature flag: if the broken feature has a flag, disable it

### Resolution

1. Verify rollback/hotfix resolved the issue
2. Test all critical flows post-recovery
3. Fix the root cause in development
4. Add test coverage for the regression scenario
5. Re-deploy with fix when ready

### User Communication Template

```
[For widespread regression only]

We deployed an update that caused unexpected issues with [FEATURE].
We have rolled back the change and all features are working normally.
We apologize for the brief disruption.

-- The DealStage Team
```

### Compensation Policy

- Brief regression (< 30 minutes): No compensation
- Extended regression (> 30 minutes affecting core features): 3 bonus AI credits

---

## INC-011: AI Hallucination at Scale

| Field               | Detail                                                                                                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-011                                                                                                                                                                                                                                                                 |
| **Type**            | AI Quality                                                                                                                                                                                                                                                              |
| **Severity**        | SEV2                                                                                                                                                                                                                                                                    |
| **Trigger**         | Multiple user reports of factually incorrect AI-generated content. Automated validation catches AI outputs referencing non-existent brands, fabricated statistics, or invented contact details. "Report inaccuracy" button submissions exceed 5 in 1 hour               |
| **Detection**       | User reports via "Report inaccuracy" button. Automated validation: AI output references brands not in `brands` table (TBL-002) or contacts not in `decision_makers` (TBL-008). Pattern detection: multiple identical or nearly-identical AI outputs (model degradation) |
| **On-Call**         | Founder                                                                                                                                                                                                                                                                 |
| **Escalation Path** | 0 min: Founder. 1 hour: Investigate scope and root cause. 2 hours: If systemic, disable affected AI agents. 4 hours: Deploy fix or provider switch                                                                                                                      |

### Immediate Actions

1. Collect examples of hallucinated content (screenshots, AI output logs)
2. Determine which AI agents are producing hallucinations
3. Check if the issue is with a specific provider (OpenAI vs. Anthropic)
4. Check if a prompt template was recently changed
5. Verify that AI agents are receiving proper context (database records) in their prompts

### Investigation

1. Prompt regression: compare current prompt templates with last known-good versions
2. Context injection failure: AI agents not receiving database context (RAG pipeline broken)
3. Provider model degradation: provider deployed a model update that degraded quality
4. Data quality issue: enrichment data feeding into AI is garbage (garbage in, garbage out)

### Mitigation

- Disable affected AI agents. Show "Feature temporarily unavailable" message
- Switch to alternate provider for affected agents
- If prompt regression: revert to previous prompt template
- If context injection failure: fix RAG pipeline, ensure DB context is passed correctly

### Resolution

1. Deploy fixed prompts or provider configuration
2. Re-enable AI agents one at a time, monitoring quality
3. Review and validate outputs from re-enabled agents
4. Add validation checks to prevent future hallucination at scale

### User Communication Template

```
Subject: Update on DealStage AI recommendations

We identified an issue affecting the accuracy of some AI-generated
recommendations. We have corrected the issue and recommend reviewing
any AI-generated content from the past [TIME PERIOD] for accuracy.

We are committed to providing reliable, data-backed recommendations.
Thank you for your reports -- they helped us identify and fix this
issue quickly.

-- The DealStage Team
```

### Compensation Policy

- If user acted on hallucinated data: Personal outreach + case-by-case remediation
- General: 5 bonus AI credits for all affected users

---

## INC-012: Stripe Webhook Not Updating profiles.plan

| Field               | Detail                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | INC-012                                                                                                                                                                                                |
| **Type**            | Payments                                                                                                                                                                                               |
| **Severity**        | SEV1                                                                                                                                                                                                   |
| **Trigger**         | Daily reconciliation detects mismatch between Stripe active subscriptions and `profiles.plan`. User reports paying but not receiving paid features. Stripe webhook dashboard shows failed deliveries   |
| **Detection**       | Daily reconciliation script: compare Stripe subscriptions with `profiles.plan`. Stripe webhook failure notifications. User support requests. Edge function error logs showing webhook handler failures |
| **On-Call**         | Founder                                                                                                                                                                                                |
| **Escalation Path** | 0 min: Founder. 15 min: Identify scope (how many users affected). 30 min: Manual fix for affected users. 60 min: Fix webhook handler and replay failed events                                          |

### Immediate Actions

1. Check Stripe Webhook dashboard: Developers -> Webhooks -> event deliveries
2. Identify failed events and their error messages
3. Count affected users:
   ```sql
   -- Find users on free plan who have Stripe customer IDs
   SELECT id, email, plan FROM profiles
   WHERE plan = 'free'
   AND stripe_customer_id IS NOT NULL;
   ```
4. For each affected user: check their Stripe subscription status
5. Manually update affected users immediately:
   ```sql
   UPDATE profiles SET plan = 'tier1', updated_at = now()
   WHERE email = 'affected@user.com';
   ```

### Investigation

1. Webhook signature failure: signing secret rotated in Stripe but not updated in edge function secrets
2. Edge function crash: check logs for unhandled exceptions in webhook handler
3. Database write failure: webhook received and validated but Supabase UPDATE failed
4. Missing event types: webhook endpoint not subscribed to the correct event types
5. Payload parsing error: Stripe API version change altered event payload structure

### Mitigation

- Signature secret mismatch: update edge function secret to match Stripe webhook signing secret
- Edge function bug: fix and redeploy edge function
- Replay failed events: Stripe Dashboard -> Webhooks -> select endpoint -> filter failed -> resend
- Manual reconciliation for immediate user relief

### Resolution

1. Fix webhook handler root cause
2. Replay all failed webhook events from Stripe dashboard
3. Run full reconciliation: ensure every active Stripe subscription has matching `profiles.plan`
4. Add automated reconciliation as a daily scheduled job
5. Send personal email to every affected user confirming their plan is active

### User Communication Template

```
Subject: Your DealStage [PLAN NAME] subscription is now active

Hi [NAME],

We identified a brief technical issue that delayed the activation of
your [PLAN NAME] subscription. This has been resolved and all
[PLAN NAME] features are now fully active on your account.

Your subscription details:
- Plan: [PLAN NAME]
- Price: $[AMOUNT]/month
- Next billing date: [DATE]
- Features: [List 2-3 key features]

As an apology for the delay, we've added [COMPENSATION] to your account.

If you have any questions, please reply to this email.

Best,
[FOUNDER NAME]
DealStage
```

### Compensation Policy

- Plan activation delay < 1 hour: Personal email + 5 bonus AI credits
- Plan activation delay 1-24 hours: 1 week free + 10 bonus AI credits
- Plan activation delay > 24 hours: 1 month free + personal call from founder

---

## INC-013: RLS Policy Misconfiguration -- Data Leaking

| Field               | Detail                                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-013                                                                                                                                                                                   |
| **Type**            | Security                                                                                                                                                                                  |
| **Severity**        | SEV1                                                                                                                                                                                      |
| **Trigger**         | User reports seeing another user's private data (deal notes, contacts, financial info). Security audit discovers RLS policy allows cross-user data access. Automated RLS test suite fails |
| **Detection**       | User report. Automated RLS test (TC-045 from Batch 3). Security audit. Pen testing results                                                                                                |
| **On-Call**         | Founder                                                                                                                                                                                   |
| **Escalation Path** | 0 min: Founder. Treat as data breach -- follow INC-005 escalation if confirmed                                                                                                            |

### Immediate Actions

1. CONFIRM: Reproduce the data leak. Can User A actually see User B's data?
2. CONTAIN IMMEDIATELY: Apply emergency RLS policy on affected table:

   ```sql
   -- Drop the permissive policy
   DROP POLICY IF EXISTS [permissive_policy_name] ON [table_name];

   -- Create restrictive emergency policy
   CREATE POLICY emergency_restrict ON [table_name]
   FOR ALL USING (
     auth.uid() = owner_id
     OR auth.uid() = created_by
     OR auth.uid() = user_id
   );
   ```

3. Assess scope: which tables are affected? What data was exposed?
4. Check audit logs for evidence of exploitation

### Investigation

1. Policy gap: which RLS policy is too permissive?
2. Was the policy always like this (design flaw) or did it change recently (regression)?
3. How long has the data been exposed?
4. Has anyone exploited the exposure? (Check `audit_logs`, `activities`)
5. Which users' data was potentially accessible to unauthorized users?

### Mitigation

- Apply correct RLS policies to all affected tables
- Audit ALL tables for similar policy gaps (65+ tables from Batch 1)
- If exploitation confirmed: escalate to INC-005 (Data Breach)

### Resolution

1. Verify corrected RLS policies with cross-user access tests
2. Full RLS audit of all tables
3. Add automated RLS testing to CI/CD pipeline
4. If data was accessed: follow INC-005 user notification process
5. Post-mortem within 24 hours

### User Communication Template

If confirmed data access occurred: use INC-005 breach notification template.
If caught before exploitation: no external communication needed, internal post-mortem only.

### Compensation Policy

Same as INC-005.

---

## INC-014: Email Delivery Failure (Resend Down)

| Field               | Detail                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-014                                                                                                                                                        |
| **Type**            | External API                                                                                                                                                   |
| **Severity**        | SEV3                                                                                                                                                           |
| **Trigger**         | Resend API (API-015) returning errors. Outreach sequence emails not being sent. Welcome/trial emails not delivered. Resend dashboard showing delivery failures |
| **Detection**       | Resend webhook status notifications. Edge function error logs. User reports: "I didn't receive the welcome email." Resend dashboard delivery rate monitoring   |
| **On-Call**         | Founder                                                                                                                                                        |
| **Escalation Path** | 0 min: Founder. 4 hours: Check Resend status, contact support. 24 hours: Evaluate alternative email provider                                                   |

### Immediate Actions

1. Check Resend dashboard for delivery metrics and error messages
2. Check Resend status page for incidents
3. Verify domain DNS records (SPF, DKIM, DMARC) are still correct
4. Test email delivery: send test email via Resend API directly

### Mitigation

- Resend down: Queue emails for retry when service recovers
- DNS issue: Fix SPF/DKIM records
- Deliverability issue: Check domain reputation, review email content for spam triggers
- For critical emails (password reset): fall back to Supabase built-in mailer

### Resolution

1. Verify Resend is delivering emails successfully
2. Process queued email backlog
3. Verify SPF, DKIM, DMARC records are correct
4. Monitor delivery rates for 24 hours

### User Communication Template

```
[No external communication needed for email delivery issues]
[If password reset affected: provide manual password reset via admin]
```

### Compensation Policy

None required.

---

## INC-015: DNS / SSL Certificate Failure

| Field               | Detail                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-015                                                                                                                                                                                                 |
| **Type**            | Infrastructure                                                                                                                                                                                          |
| **Severity**        | SEV1                                                                                                                                                                                                    |
| **Trigger**         | Users see "This site can't be reached" (DNS) or "Your connection is not private" (SSL) errors. UptimeRobot reports site unreachable. SSL monitoring reports certificate expiry                          |
| **Detection**       | External monitoring (UptimeRobot). SSL certificate monitoring (30-day advance warning). User reports. `dig thedealstage.com` returns unexpected results                                                 |
| **On-Call**         | Founder                                                                                                                                                                                                 |
| **Escalation Path** | 0 min: Founder. 15 min: Identify DNS vs. SSL issue. 30 min: If DNS registrar issue, contact registrar. 60 min: If SSL, attempt re-provisioning. 120 min: If domain expired, emergency registrar contact |

### Immediate Actions

1. Diagnose: DNS or SSL?
   - DNS: `dig thedealstage.com` -- check if nameservers are responding
   - SSL: `openssl s_client -connect thedealstage.com:443 -servername thedealstage.com` -- check certificate validity
2. Check Vercel dashboard: is the domain configured and SSL active?
3. Check domain registrar: is the domain active? Auto-renew status?
4. If SSL expired: request re-provisioning in Vercel dashboard

### Mitigation

- SSL expired: Re-provision in Vercel (automatic for Vercel-managed SSL). If custom cert: upload new certificate
- DNS misconfigured: Correct DNS records at registrar
- Domain expired: Contact registrar, pay renewal, wait for propagation (up to 48 hours)
- Nameserver failure: Switch to backup DNS provider

### Resolution

1. Verify domain resolves correctly from multiple locations
2. Verify SSL certificate is valid and not expiring soon
3. Set up monitoring for 30-day SSL expiry warning
4. Verify auto-renew is enabled on domain
5. Document DNS configuration in RB-003

### User Communication Template

```
Subject: DealStage is temporarily unreachable

DealStage is currently experiencing a connectivity issue that is
preventing access to the platform. This is a DNS/certificate issue --
your data is completely safe and unaffected.

We are working with our infrastructure providers to resolve this as
quickly as possible. We expect restoration within [ESTIMATED TIME].

In the meantime, you can reach us at support@thedealstage.com for
any urgent needs.

-- The DealStage Team
```

### Compensation Policy

Same as INC-001.

---

## INC-016: Brand Data Corrupted / Deleted

| Field               | Detail                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-016                                                                                                                                                                                       |
| **Type**            | Data Integrity                                                                                                                                                                                |
| **Severity**        | SEV2                                                                                                                                                                                          |
| **Trigger**         | Brands missing from search results. Brand detail pages (PG-043) showing "Not found." Dashboard metrics show sudden drop in brand count. User reports brand they were tracking has disappeared |
| **Detection**       | Daily brand count monitoring: `SELECT count(*) FROM brands;` -- alert if count drops by >5%. User reports. Admin dashboard showing data anomalies                                             |
| **On-Call**         | Founder                                                                                                                                                                                       |
| **Escalation Path** | 0 min: Founder. 30 min: Assess scope (how many brands affected). 1 hour: Identify cause. 2 hours: Begin restoration from backup                                                               |

### Immediate Actions

1. Quantify the damage: `SELECT count(*) FROM brands;` -- compare with expected count (1,200+)
2. Check recent deletions: `SELECT * FROM audit_logs WHERE table_name = 'brands' AND action = 'DELETE' ORDER BY created_at DESC LIMIT 50;`
3. Check recent migrations or admin operations that could have affected brands table
4. If accidental deletion: check if Supabase PITR (Point-in-Time Recovery) is enabled

### Investigation

1. Accidental DELETE query: check SQL Editor history, admin tool actions
2. Cascade from related table deletion: FK constraints may have cascaded
3. Migration error: DDL statement that accidentally dropped or truncated table
4. Application bug: edge function or admin tool that incorrectly deletes brands

### Mitigation

- PITR available (Pro plan): restore to point before deletion
- No PITR: restore from last manual backup (see RB-011)
- If backup is stale: re-run brand population (Step 3.1) from edge function
- Partial corruption: restore only affected rows from backup

### Resolution

1. Restore all missing brand data
2. Verify brand count matches expected value
3. Re-run enrichment for restored brands if enrichment data was also lost
4. Verify all foreign key relationships are intact (partnerships, contacts, events)
5. Add safeguards: remove DELETE permission from application-level queries on brands table

### User Communication Template

```
[Only if user-facing impact]

Some brand listings may have been temporarily unavailable. We have
restored all brand data and everything is back to normal. Your
partnerships and deal history were not affected.

-- The DealStage Team
```

### Compensation Policy

- Data temporarily unavailable (restored within 4 hours): No compensation
- Data lost requiring user re-entry: Personal outreach + case-by-case remediation

---

## INC-017: Contact Data Quality Degradation

| Field               | Detail                                                                                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | INC-017                                                                                                                                                                                                     |
| **Type**            | Data Quality                                                                                                                                                                                                |
| **Severity**        | SEV3                                                                                                                                                                                                        |
| **Trigger**         | Email bounce rate from outreach sequences exceeds 10%. Users report "contact email invalid." GMO re-verification shows >20% of contacts have degraded confidence scores. ContactFinder returning stale data |
| **Detection**       | Outreach bounce rate monitoring. User feedback on contact quality. Scheduled re-verification results (Step 4.2). Quarterly data quality audit                                                               |
| **On-Call**         | Founder                                                                                                                                                                                                     |
| **Escalation Path** | 0 min: Founder. 24 hours: Assess scope. 48 hours: Plan remediation. 7 days: Execute re-enrichment                                                                                                           |

### Immediate Actions

1. Quantify: `SELECT AVG(email_confidence) FROM decision_makers;` -- compare with baseline
2. Check last GMO re-verification run date and results
3. Identify worst-performing segments: `SELECT brand_name, AVG(email_confidence) FROM decision_makers GROUP BY brand_name ORDER BY AVG(email_confidence) ASC LIMIT 20;`
4. Check if the issue is systemic or limited to specific brands/industries

### Mitigation

- Trigger bulk re-verification via GMO API (Step 4.2)
- Flag low-confidence contacts (`email_confidence < 50`) -- exclude from outreach
- Add "Confidence: Low/Medium/High" badge to contact cards in ContactFinder
- Re-enrich contacts for top 100 most-accessed brands

### Resolution

1. Complete re-verification cycle
2. Remove/archive contacts with email_confidence = 0 after 2 consecutive checks
3. Update data freshness indicators on ContactFinder
4. Schedule regular re-verification (weekly for high-priority, monthly for all)

### User Communication Template

```
[No external communication needed -- background quality improvement]
```

### Compensation Policy

None -- proactive data quality maintenance.

---

## INC-018: Founder Unavailable During Incident

| Field               | Detail                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | INC-018                                                                                                                                                                              |
| **Type**            | Operational                                                                                                                                                                          |
| **Severity**        | SEV3 (escalates to SEV1 if concurrent with another incident)                                                                                                                         |
| **Trigger**         | Founder does not respond to alerts within 30 minutes. Deadman switch (daily check-in) not triggered for 48+ hours. Known planned absence (vacation, illness, personal emergency)     |
| **Detection**       | No alert acknowledgment within 30 minutes. Deadman switch timeout. Pre-communicated absence                                                                                          |
| **On-Call**         | Backup Contact (Trusted Contractor -- TBD)                                                                                                                                           |
| **Escalation Path** | 0 min: Alert reaches founder. 30 min: Auto-page backup contact. 60 min: Backup contact follows this playbook. 120 min: If backup unavailable, automated systems handle what they can |

### Immediate Actions (For Backup Contact)

1. Access this documentation (Batches 1-4). All operational procedures are documented
2. Check monitoring dashboards for active alerts
3. If no active incident: nothing to do, check in every 4 hours
4. If active incident: follow the relevant INC playbook above
5. Limit actions to mitigation and monitoring -- do not deploy code changes unless critical

### Investigation

For backup contact -- things you CAN do:

- Read Supabase dashboard (read-only access should be pre-configured)
- Check Vercel deployment status
- Check Stripe dashboard
- Rollback Vercel deployment (if regression detected)
- Monitor external status pages

Things you should NOT do without founder guidance:

- Run SQL migrations
- Modify RLS policies
- Rotate API keys
- Deploy new code
- Communicate with users on behalf of DealStage

### Mitigation

- If platform is healthy: just monitor
- If SEV1 incident: follow relevant playbook, prioritize rollback/restart over complex fixes
- If unable to resolve: enable maintenance page (Vercel environment variable toggle or redirect rule)

### Resolution

1. Document all actions taken during founder absence
2. Brief founder on return with timeline of events
3. Founder reviews all actions and follow-up items
4. Update this playbook with any gaps identified

### Maintenance Mode Activation

```
# To enable maintenance mode on Vercel:
# Option 1: Add redirect rule in vercel.json
# Option 2: Set environment variable VITE_MAINTENANCE_MODE=true and redeploy
# Option 3: Deploy a static maintenance page HTML
```

### Compensation Policy

Determined by founder upon return, based on impact during absence.

---

# DELIVERABLE 12: DEPLOYMENT & RELEASE PLAYBOOK

## Section A: CI/CD Pipeline

### Current Pipeline Architecture

DealStage uses a Vercel-native CI/CD pipeline triggered by Git pushes to the `master` branch. The pipeline is linear -- each stage must pass before the next executes.

```
[Git Push] -> [Install] -> [Lint] -> [Test] -> [Build] -> [Deploy] -> [Smoke Test] -> [Monitor]
     |            |           |         |          |           |            |              |
   GitHub      npm ci     ESLint    Vitest     Vite       Vercel      Automated      30 min
   trigger     ~60s       ~15s      ~30s       ~45s      ~120s       manual          window
```

### Stage 1: Commit & Push

| Stage              | Detail                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | `git push origin master` or PR merge to master                                                                                                    |
| **Tool**           | Git + GitHub                                                                                                                                      |
| **Actions**        | Husky pre-commit hook runs (`"prepare": "husky"` in package.json). Lint-staged runs ESLint on changed files. Commit rejected if lint errors found |
| **Duration**       | < 5 seconds                                                                                                                                       |
| **Failure Action** | Fix lint errors locally, re-commit                                                                                                                |

### Stage 2: Install Dependencies

| Stage              | Detail                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | Vercel build triggered by GitHub webhook                                                                                                                |
| **Tool**           | npm (Vercel build environment)                                                                                                                          |
| **Actions**        | `npm ci` -- clean install from `package-lock.json`. Deterministic: same versions every time. Node modules cached by Vercel for faster subsequent builds |
| **Duration**       | 30-90 seconds (cached: ~10 seconds)                                                                                                                     |
| **Failure Action** | Check `package-lock.json` integrity. Run `npm ci` locally to reproduce. Fix dependency conflicts                                                        |

### Stage 3: Lint

| Stage              | Detail                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | Post-install, as part of Vercel build                                                                                                          |
| **Tool**           | ESLint with configuration in `eslint.config.js`                                                                                                |
| **Actions**        | `npm run lint` -> `eslint . --quiet`. Checks all JS/JSX files for code quality issues. `--quiet` flag suppresses warnings, only reports errors |
| **Duration**       | 10-20 seconds                                                                                                                                  |
| **Failure Action** | Fix lint errors. Run `npm run lint:fix` for auto-fixable issues. Commit fixes and re-push                                                      |

### Stage 4: Test

| Stage              | Detail                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | Post-lint                                                                                                                                                   |
| **Tool**           | Vitest (`npm run test` -> `vitest run`)                                                                                                                     |
| **Actions**        | Runs all `*.test.js` and `*.test.jsx` files. Uses `src/test/setup.js` for test configuration. Tests run in isolated environment with mocked Supabase client |
| **Duration**       | 20-60 seconds                                                                                                                                               |
| **Failure Action** | Check test output for failing tests. Fix locally. Do NOT skip tests                                                                                         |

### Stage 5: Build

| Stage              | Detail                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | Post-test (if tests are in build pipeline; otherwise post-lint)                                                                                                                                                |
| **Tool**           | Vite (`npm run build` -> `vite build`)                                                                                                                                                                         |
| **Actions**        | Compiles React JSX, resolves imports, tree-shakes unused code, generates optimized production bundle in `dist/`. `postcss.config.js` and `tailwind.config.js` process CSS. Source maps generated for debugging |
| **Duration**       | 30-60 seconds                                                                                                                                                                                                  |
| **Failure Action** | Check build output for compilation errors. Most common: import errors, missing dependencies, TypeScript/JSX syntax errors. Fix locally with `npm run build`                                                    |
| **Output**         | `dist/` directory with `index.html`, `assets/` (JS/CSS chunks), static assets                                                                                                                                  |

### Stage 6: Deploy

| Stage              | Detail                                                                                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | Successful build                                                                                                                                                                                                                                                                         |
| **Tool**           | Vercel deployment platform                                                                                                                                                                                                                                                               |
| **Actions**        | Vercel uploads `dist/` to global CDN. Applies `vercel.json` configuration: rewrites (SPA routing), headers (security headers including CSP, HSTS, X-Frame-Options), cache settings (immutable for `assets/`). Deployment gets unique URL. Production deployment updates thedealstage.com |
| **Duration**       | 60-120 seconds                                                                                                                                                                                                                                                                           |
| **Failure Action** | Check Vercel deployment logs. If Vercel platform issue: wait and retry. If config issue: fix `vercel.json`                                                                                                                                                                               |

### Stage 7: Smoke Test (Post-Deploy)

| Stage              | Detail                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trigger**        | Deployment completes successfully                                                                                                                                                                                                          |
| **Tool**           | Manual verification (automated in future)                                                                                                                                                                                                  |
| **Actions**        | Verify the following on production URL: (1) Homepage loads. (2) Login page accessible. (3) Auth flow works (sign in with test account). (4) Dashboard loads with data. (5) Search returns results. (6) No console errors on critical pages |
| **Duration**       | 2-5 minutes (manual)                                                                                                                                                                                                                       |
| **Failure Action** | If any smoke test fails: **ROLLBACK** via Vercel dashboard immediately. Investigate and fix before re-deploying                                                                                                                            |

### Stage 8: Monitor (Post-Deploy Window)

| Stage              | Detail                                                                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | Smoke tests pass                                                                                                                                                                                                              |
| **Tool**           | UptimeRobot, Vercel Analytics, Supabase Dashboard                                                                                                                                                                             |
| **Actions**        | Monitor for 30 minutes post-deployment: (1) Error rate remains at baseline. (2) No new UptimeRobot alerts. (3) Supabase query latency normal. (4) No user-reported issues. (5) Vercel Analytics shows normal traffic patterns |
| **Duration**       | 30-minute observation window                                                                                                                                                                                                  |
| **Failure Action** | If anomalies detected during monitoring window: evaluate severity. Follow INC-010 if regression confirmed                                                                                                                     |

### Stage 9: Promote (Vercel Preview -> Production)

| Stage              | Detail                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**        | PR merged to master (for preview deployments)                                                                                                                                                                                                                    |
| **Tool**           | Vercel                                                                                                                                                                                                                                                           |
| **Actions**        | For PR deployments: Vercel creates preview deployment on unique URL (e.g., `dealstage-abc123.vercel.app`). Test on preview URL before merging PR. Merging PR triggers production deployment. For direct pushes to master: deployment is automatically production |
| **Duration**       | Automatic on merge                                                                                                                                                                                                                                               |
| **Failure Action** | Do not merge PR if preview deployment shows issues                                                                                                                                                                                                               |

### Stage 10: Release Tagging

| Stage              | Detail                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trigger**        | Significant feature deployments, milestone releases                                                                                                                                              |
| **Tool**           | Git tags                                                                                                                                                                                         |
| **Actions**        | Tag the commit: `git tag -a v1.X.X -m "Release description"`. Push tag: `git push origin v1.X.X`. Update changelog (if maintained). Not every deployment gets a tag -- only significant releases |
| **Duration**       | < 1 minute                                                                                                                                                                                       |
| **Failure Action** | N/A                                                                                                                                                                                              |

---

## Section B: Feature Flag Strategy

Feature flags in DealStage are managed via `src/config/pageAccess.js` (the single source of truth) and exposed through `src/lib/featureFlags.js`. Flags control feature access by role and tier.

### Current Feature Flag Architecture

```
pageAccess.js (source of truth)
    |
    +-- FEATURE_FLAGS object
    |       |
    |       +-- flag_name: { minTier: number, roles: string[] }
    |
    +-- isFeatureEnabled(role, tierLevel, featureName) -> boolean
    |
    +-- getTierLevel(role, plan) -> number
    |
featureFlags.js (compatibility layer)
    |
    +-- isFeatureEnabled(featureName, userPlan, role) -> boolean
    +-- getAvailableFeatures(userPlan, role) -> string[]
    |
FeatureGate.jsx (UI component)
    |
    +-- Wraps UI components, shows upgrade prompt if feature not available
```

### Active Feature Flags

| Flag ID | Flag Name            | Description                                   | Free | Tier 1 | Tier 2 | Tier 3    | Rollout Strategy               |
| ------- | -------------------- | --------------------------------------------- | ---- | ------ | ------ | --------- | ------------------------------ |
| FF-001  | `ai_match_scoring`   | AI-powered match scoring (Step 6.1-6.2)       | 5/mo | 50/mo  | 200/mo | Unlimited | Hard limit with upgrade prompt |
| FF-002  | `contact_reveal`     | Reveal decision maker email/phone             | No   | Yes    | Yes    | Yes       | Tier gate with blur            |
| FF-003  | `campaign_generator` | AI campaign brief generation (AGT-004)        | No   | Yes    | Yes    | Yes       | Tier gate                      |
| FF-004  | `outreach_sequences` | Multi-step outreach automation (PG-057)       | No   | No     | Yes    | Yes       | Tier gate                      |
| FF-005  | `escrow_payments`    | Escrow payment flow (EscrowPanel)             | No   | No     | Yes    | Yes       | Tier gate + beta               |
| FF-006  | `advanced_analytics` | AI Analytics, Deal Analytics (PG-077, PG-078) | No   | No     | Yes    | Yes       | Tier gate                      |
| FF-007  | `data_room`          | Brand/Talent/Agency data rooms                | No   | Yes    | Yes    | Yes       | Tier gate                      |
| FF-008  | `marketplace_apply`  | Apply to marketplace opportunities            | No   | Yes    | Yes    | Yes       | Tier gate (browse is free)     |

### Rollout Strategy for New Features

| Strategy        | Usage                         | Implementation                                                              |
| --------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **Percentage**  | Gradual rollout to user base  | Add `rolloutPercent` to flag: `hash(userId) % 100 < rolloutPercent`         |
| **Tier Gate**   | Monetization gating           | `minTier` in pageAccess.js. FeatureGate.jsx shows upgrade prompt            |
| **Beta Flag**   | Early access for select users | Add `betaUsers: [userId]` array to flag. Check membership before tier check |
| **Kill Switch** | Emergency disable             | Set `enabled: false` on flag. Requires code push (no runtime toggle yet)    |

### Adding a New Feature Flag

1. Edit `src/config/pageAccess.js` -- add entry to `FEATURE_FLAGS` object
2. Specify `minTier` (0=free, 1=tier1, 2=tier2, 3=tier3) and `roles` (which roles see this feature)
3. Wrap UI component in `<FeatureGate feature="flag_name">` in the relevant page
4. Test locally: switch user plan in dev tools / Supabase dashboard to verify gate behavior
5. Deploy -- flag is live immediately upon deployment

### Future: Runtime Feature Flags

Currently, feature flags require a code deployment to change. Future improvement: move flags to Supabase database table (`feature_flags` with `name`, `enabled`, `minTier`, `rolloutPercent`, `betaUsers`). Edge function reads flags at runtime. Admin dashboard toggle to enable/disable without deployment.

---

## Section C: On-Call Configuration

### Current State: Solo Founder On-Call

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Primary**      | Founder (24/7)                                                           |
| **Secondary**    | None (TBD -- trusted contractor)                                         |
| **Rotation**     | N/A (single person)                                                      |
| **Paging**       | UptimeRobot -> email + push notification                                 |
| **Response SLA** | SEV1: < 15 min, SEV2: < 1 hour, SEV3: < 4 hours, SEV4: Next business day |
| **Burnout Risk** | HIGH -- no rotation, no backup, multiple ventures                        |

### Monitoring Stack

| Tool               | What It Monitors                 | Alert Method | Threshold             |
| ------------------ | -------------------------------- | ------------ | --------------------- |
| UptimeRobot        | thedealstage.com HTTP 200        | Email + SMS  | 3 failed checks (90s) |
| Supabase Dashboard | Database health, connections     | Manual check | Check daily           |
| Vercel Dashboard   | Deployment status, error rates   | Email        | Build failure         |
| Stripe Dashboard   | Webhook failures, payment issues | Email        | Any failed webhook    |

### First Hire On-Call Plan

When the first engineer is hired, implement this rotation:

| Week   | Primary  | Secondary | Notes                                         |
| ------ | -------- | --------- | --------------------------------------------- |
| Week 1 | Founder  | Engineer  | Shadow week -- engineer observes              |
| Week 2 | Founder  | Engineer  | Shadow week -- engineer handles with guidance |
| Week 3 | Engineer | Founder   | Engineer primary, founder backup              |
| Week 4 | Founder  | Engineer  | Rotate                                        |

### On-Call Compensation (Future)

- On-call stipend: $500/month for carrying the pager
- Incident response: $100/hour for after-hours incident work
- Post-incident rest: mandatory 4 hours off after any SEV1 >2 hours

---

## Section D: Environment Specifications

### Development (Local)

| Component          | Configuration                                                                    |
| ------------------ | -------------------------------------------------------------------------------- |
| **Runtime**        | Node.js (version per `.nvmrc` or latest LTS)                                     |
| **Build Tool**     | Vite dev server (`npm run dev`)                                                  |
| **Port**           | localhost:5173 (default Vite)                                                    |
| **Database**       | Supabase cloud project (shared with production -- see note)                      |
| **Auth**           | Supabase Auth (same project)                                                     |
| **Edge Functions** | Deployed to Supabase (not local -- `supabase functions serve` for local testing) |
| **Environment**    | `.env` file with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`                   |
| **Hot Reload**     | Vite HMR (instant updates)                                                       |

**Important Note:** DealStage currently shares a single Supabase project across dev and production. This means local development writes to the production database. This is a known risk (RISK-012). Mitigation: use Supabase branching or create a separate dev project.

### Vercel Preview (PR Deployments)

| Component       | Configuration                                                    |
| --------------- | ---------------------------------------------------------------- |
| **URL**         | `dealstage-[hash].vercel.app` (auto-generated per deployment)    |
| **Build**       | Same as production (`npm run build`)                             |
| **Environment** | Same Supabase project (shared database)                          |
| **Access**      | Anyone with the URL (consider password-protecting previews)      |
| **Lifecycle**   | Created on PR push, updated on each commit, cleaned up by Vercel |

### Production

| Component            | Configuration                                                                 |
| -------------------- | ----------------------------------------------------------------------------- |
| **URL**              | thedealstage.com                                                              |
| **Hosting**          | Vercel (global CDN, edge network)                                             |
| **Build**            | Vite production build -> `dist/`                                              |
| **Database**         | Supabase PostgreSQL (region: [configured region])                             |
| **Auth**             | Supabase Auth with Google OAuth                                               |
| **Edge Functions**   | Supabase Edge Functions (Deno runtime)                                        |
| **Storage**          | Supabase Storage (avatars, attachments)                                       |
| **Payments**         | Stripe (live mode)                                                            |
| **Email**            | Resend (transactional) + Supabase mailer (auth)                               |
| **AI**               | OpenAI (GPT-4o-mini), Anthropic (Claude)                                      |
| **Enrichment**       | GrowMeOrganic (contacts), Crawl4AI on Railway (web crawling)                  |
| **Monitoring**       | UptimeRobot (uptime), Vercel Analytics (traffic), Supabase Dashboard (DB)     |
| **Security Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options (via `vercel.json`)        |
| **CDN Caching**      | Immutable caching for `assets/` (31536000s), SPA rewrite for all other routes |

---

## Section E: Rollback Decision Tree

```
Incident Detected Post-Deployment
        |
        v
Is the app completely broken? (blank page, auth failure, critical error)
        |
    YES |           NO
        v             v
  ROLLBACK NOW    Is the broken feature customer-facing?
  (Vercel instant     |
   rollback)      YES |           NO
                      v             v
              Is a hotfix      Log the issue,
              possible in      fix in next
              < 15 minutes?    deployment
                  |
              YES |           NO
                  v             v
              Deploy        ROLLBACK
              hotfix        then fix and
                            redeploy
```

### Rollback Procedure

**Vercel Instant Rollback (< 30 seconds):**

1. Go to Vercel Dashboard -> Project -> Deployments
2. Find the previous successful deployment (it has a green checkmark)
3. Click the three-dot menu (or "..." button) on that deployment
4. Select "Promote to Production"
5. Confirm the promotion
6. Verify the rollback by loading thedealstage.com

**When to Rollback vs. Hotfix:**

| Scenario                                         | Decision                                      |
| ------------------------------------------------ | --------------------------------------------- |
| App won't load at all                            | Rollback                                      |
| Auth is broken (users can't login)               | Rollback                                      |
| Payments broken                                  | Rollback                                      |
| Search/Dashboard broken for all users            | Rollback                                      |
| One non-critical page broken                     | Hotfix if < 15 min, else rollback             |
| Visual regression (styling, layout)              | Hotfix                                        |
| Performance degradation                          | Monitor, hotfix if severe                     |
| Edge function broken                             | Fix edge function (independent deployment)    |
| New feature doesn't work (but old features fine) | Disable feature flag if possible, else hotfix |

### Post-Rollback Checklist

- [ ] Verify rollback resolved the user-facing issue
- [ ] Test critical flows (auth, search, dashboard, deals, payments)
- [ ] Monitor error rates for 15 minutes
- [ ] Communicate to users if the issue was visible (see INC-010 templates)
- [ ] Root cause the issue in the rolled-back code
- [ ] Write a fix with test coverage
- [ ] Deploy fix to Vercel preview environment first
- [ ] Test on preview before merging to production
- [ ] Deploy to production and monitor

---

## Section F: Edge Function Deployment

### Supabase Edge Function Architecture

DealStage has 30+ Supabase Edge Functions (listed in `functions/` directory) running on Deno runtime. These handle server-side logic that requires secret keys (Stripe, OpenAI, Anthropic, GMO) or service-role database access.

### Deployment Process

**Step 1: Develop Locally**

```bash
# Start local Supabase (if configured)
supabase start

# Serve function locally for testing
supabase functions serve [function-name] --env-file .env.local

# Test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/[function-name]' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"test": "payload"}'
```

**Step 2: Deploy to Production**

```bash
# Deploy a single function
supabase functions deploy [function-name] --project-ref [PROJECT_REF]

# Deploy all functions
supabase functions deploy --project-ref [PROJECT_REF]

# Set secrets (if new secrets needed)
supabase secrets set KEY_NAME=value --project-ref [PROJECT_REF]
```

**Step 3: Verify Deployment**

```bash
# List deployed functions
supabase functions list --project-ref [PROJECT_REF]

# Check function logs
supabase functions logs [function-name] --project-ref [PROJECT_REF]

# Test deployed function
curl -i --location --request POST \
  'https://[PROJECT_REF].supabase.co/functions/v1/[function-name]' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"test": "payload"}'
```

### Edge Function Inventory

| Function Name                  | Trigger         | Secrets Required          | Critical? |
| ------------------------------ | --------------- | ------------------------- | --------- |
| `addPaymentMethod`             | User action     | Stripe secret key         | Yes       |
| `deletePaymentMethod`          | User action     | Stripe secret key         | Yes       |
| `getPaymentMethods`            | Page load       | Stripe secret key         | Yes       |
| `getInvoices`                  | Page load       | Stripe secret key         | Yes       |
| `getUserSubscriptionStatus`    | Auth check      | Stripe secret key         | Yes       |
| `checkFeatureAccess`           | Feature gate    | Supabase service role     | Yes       |
| `generateAICampaign`           | User action     | OpenAI key, Anthropic key | No        |
| `analyzeCampaignPostMortem`    | User action     | OpenAI key                | No        |
| `analyzeContentEffectiveness`  | User action     | OpenAI key                | No        |
| `analyzeDealPatterns`          | User action     | OpenAI key                | No        |
| `benchmarkPerformance`         | User action     | OpenAI key                | No        |
| `forecastOutreachConversion`   | User action     | OpenAI key                | No        |
| `identifySuccessFactors`       | User action     | OpenAI key                | No        |
| `predictPartnershipSuccess`    | User action     | OpenAI key                | No        |
| `predictTalentValueTrajectory` | User action     | OpenAI key                | No        |
| `recommendOptimalPricing`      | User action     | OpenAI key                | No        |
| `processTriggerEvent`          | Webhook/event   | Supabase service role     | Yes       |
| `checkApprovalAlerts`          | Scheduled/event | Supabase service role     | No        |
| `checkOutreachAlerts`          | Scheduled/event | Supabase service role     | No        |
| `checkPartnershipAlerts`       | Scheduled/event | Supabase service role     | No        |
| `importAllCalendarData`        | Admin action    | Supabase service role     | No        |
| `importAllConferences`         | Admin action    | Supabase service role     | No        |
| `importCultureEvents`          | Admin action    | Supabase service role     | No        |
| `importFullCalendarData`       | Admin action    | Supabase service role     | No        |
| `importIndustryGuides`         | Admin action    | Supabase service role     | No        |
| `importEntityData`             | Admin action    | Supabase service role     | No        |
| `exportEntityData`             | User action     | Supabase service role     | No        |
| `extractAndImportIndustries`   | Admin action    | Supabase service role     | No        |
| `deduplicateIndustries`        | Admin action    | Supabase service role     | No        |

### Edge Function Rollback

Edge functions are deployed independently from the frontend. Rollback strategy:

1. **Identify the broken function** from error logs
2. **Check deployment history**: Supabase does not maintain function version history in the dashboard
3. **Redeploy from Git**: `git log -- functions/[function-name].ts` to find the last working commit
4. **Checkout and deploy**:
   ```bash
   git show [LAST_GOOD_COMMIT]:functions/[function-name].ts > /tmp/[function-name].ts
   cp /tmp/[function-name].ts functions/[function-name].ts
   supabase functions deploy [function-name] --project-ref [PROJECT_REF]
   ```
5. **Verify** the rollback resolved the issue

### Secrets Management

```bash
# List current secrets
supabase secrets list --project-ref [PROJECT_REF]

# Set a secret
supabase secrets set OPENAI_API_KEY=sk-xxx --project-ref [PROJECT_REF]

# Unset a secret
supabase secrets unset OLD_KEY_NAME --project-ref [PROJECT_REF]
```

**Never commit secrets to Git. Never prefix secrets with VITE\_ (which would expose them to the client bundle).**

---

# DELIVERABLE 15: OPERATIONAL RUNBOOKS

## Overview

These 14 runbooks document step-by-step procedures for recurring operational tasks. Each runbook is self-contained -- a competent engineer or contractor should be able to execute any procedure using only the information in the runbook plus access credentials.

### Runbook Access Requirements Key

| Access Level       | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| **Supabase Admin** | Supabase project dashboard access (SQL Editor, Auth admin) |
| **Vercel Admin**   | Vercel project dashboard access                            |
| **Stripe Admin**   | Stripe dashboard access (live mode)                        |
| **GitHub Admin**   | Repository push access                                     |
| **Railway Admin**  | Railway project dashboard access                           |
| **Resend Admin**   | Resend dashboard access                                    |
| **DNS Admin**      | Domain registrar access                                    |

---

## RB-001: Enterprise Customer Onboarding

| Field               | Detail                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-001                                                                                                                                                |
| **Procedure**       | Enterprise Customer Onboarding                                                                                                                        |
| **Category**        | Customer Operations                                                                                                                                   |
| **Trigger**         | Enterprise customer signs contract or requests dedicated onboarding                                                                                   |
| **Prerequisites**   | Customer has signed contract. Payment method on file. Customer's desired role (brand/talent/agency) identified. Founder available for onboarding call |
| **Duration**        | 2-4 hours (spread over 1-2 days)                                                                                                                      |
| **Required Access** | Supabase Admin, Stripe Admin                                                                                                                          |
| **Owner**           | Founder                                                                                                                                               |

### Step-by-Step

1. **Create or verify account**: Confirm customer has registered on thedealstage.com. If not, walk them through signup (Step 1.1)
2. **Set subscription plan**:
   - Option A: Customer self-serves via Stripe Checkout
   - Option B: Create subscription manually:
     ```
     Stripe Dashboard -> Customers -> Find/create customer -> Create subscription -> Select plan -> Apply
     ```
   - Verify `profiles.plan` updated:
     ```sql
     SELECT id, email, plan, role FROM profiles WHERE email = 'customer@enterprise.com';
     ```
   - If webhook didn't fire, manually set:
     ```sql
     UPDATE profiles SET plan = 'tier3', updated_at = now() WHERE email = 'customer@enterprise.com';
     ```
3. **Complete profile setup**: Walk customer through onboarding steps 2.1-2.5 on a call if needed
4. **Populate custom data**: If enterprise customer has specific brand/talent data to import:
   - Use AdminDataManager (PG-089) to import via CSV
   - Or direct Supabase INSERT for custom datasets
5. **Configure integrations**: Set up any enterprise-specific integrations (custom API keys, webhook endpoints)
6. **Verify feature access**: Log in as customer (or ask them to share screen) and verify all tier-3 features are accessible
7. **Deliver onboarding materials**: Send welcome email with:
   - Login URL
   - Quick-start guide (link to docs)
   - Support contact info
   - Scheduled check-in date (7 days after onboarding)
8. **Schedule follow-up**: Calendar invite for 7-day check-in call
9. **Log in audit trail**:
   ```sql
   INSERT INTO audit_logs (action, user_id, details, created_at)
   VALUES ('enterprise_onboarding', '[customer_id]', '{"plan": "tier3", "onboarded_by": "founder"}', now());
   ```

### Rollback Steps

- If customer wants to cancel during onboarding: cancel Stripe subscription, set `profiles.plan = 'free'`
- If data import went wrong: identify and delete imported rows by `created_at` timestamp

---

## RB-002: New API Integration Setup

| Field               | Detail                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-002                                                                                                         |
| **Procedure**       | New API Integration Setup                                                                                      |
| **Category**        | Engineering                                                                                                    |
| **Trigger**         | Decision to integrate a new external API (e.g., new AI provider, new enrichment source, new payment processor) |
| **Prerequisites**   | API provider account created. API key obtained. API documentation reviewed. Use case defined                   |
| **Duration**        | 4-8 hours                                                                                                      |
| **Required Access** | Supabase Admin (for secrets), GitHub Admin (for code), Vercel Admin (for env vars if client-side)              |
| **Owner**           | Founder                                                                                                        |

### Step-by-Step

1. **Evaluate the API**:
   - Review API documentation, rate limits, pricing, SLA
   - Test the API manually with curl or Postman
   - Confirm the API solves the stated need
2. **Store API credentials securely**:
   - For edge function access (server-side only):
     ```bash
     supabase secrets set NEW_API_KEY=xxx --project-ref [PROJECT_REF]
     ```
   - For client-side access (rare -- only if API is designed for browser use):
     Add to Vercel environment variables with `VITE_` prefix
   - **NEVER** store secret keys with `VITE_` prefix
3. **Create edge function wrapper**:
   - Create `functions/newApiIntegration.ts` following existing function patterns
   - Import credentials from environment: `const apiKey = Deno.env.get('NEW_API_KEY')`
   - Add error handling, retry logic, and rate limiting
   - Log usage to `ai_usage_logs` (TBL-011) if applicable
4. **Deploy edge function**:
   ```bash
   supabase functions deploy newApiIntegration --project-ref [PROJECT_REF]
   ```
5. **Create client-side integration**:
   - Add API call helper in `src/api/` directory
   - Wrap in error handling and loading states
   - Add feature flag if the integration should be gated (see Section B)
6. **Test end-to-end**:
   - Test edge function directly with curl
   - Test client-side integration in development
   - Test on Vercel preview deployment
   - Verify error handling (disconnect network, use invalid key)
7. **Document the integration**:
   - Add to API inventory (API-XXX in Batch 2 format)
   - Document rate limits and quota management
   - Add monitoring (health check, error rate tracking)
8. **Deploy to production**:
   - Push code to master
   - Verify deployment success
   - Run smoke tests

### Rollback Steps

- Remove edge function: `supabase functions delete newApiIntegration --project-ref [PROJECT_REF]`
- Remove secret: `supabase secrets unset NEW_API_KEY --project-ref [PROJECT_REF]`
- Revert client-side code: Vercel rollback or code revert

---

## RB-003: Credential Rotation

| Field               | Detail                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **ID**              | RB-003                                                                                                 |
| **Procedure**       | Credential Rotation (Supabase, Stripe, OpenAI, Anthropic, GMO Keys)                                    |
| **Category**        | Security                                                                                               |
| **Trigger**         | Quarterly scheduled rotation. Suspected key compromise. Employee departure. Provider requires rotation |
| **Prerequisites**   | Access to all provider dashboards. Understanding of which services use each key. Deployment capability |
| **Duration**        | 30-60 minutes per key                                                                                  |
| **Required Access** | Supabase Admin, Stripe Admin, OpenAI Admin, Anthropic Admin, GMO Admin, Vercel Admin                   |
| **Owner**           | Founder                                                                                                |

### Credential Inventory

| Credential                    | Location Used            | Rotation Method                                        | Impact of Rotation                      |
| ----------------------------- | ------------------------ | ------------------------------------------------------ | --------------------------------------- |
| Supabase Anon Key             | Client-side (`VITE_`)    | Supabase Dashboard -> Settings -> API                  | All clients must reload (key in bundle) |
| Supabase Service Role Key     | Edge functions (secrets) | Supabase Dashboard -> Settings -> API                  | Edge functions must be redeployed       |
| Stripe Secret Key             | Edge functions (secrets) | Stripe Dashboard -> Developers -> API Keys -> Roll key | Edge functions must have new secret set |
| Stripe Webhook Signing Secret | Edge functions (secrets) | Stripe Dashboard -> Webhooks -> Signing secret -> Roll | Must update edge function secret        |
| OpenAI API Key                | Edge functions (secrets) | platform.openai.com -> API Keys -> Create new key      | Set new secret, delete old key          |
| Anthropic API Key             | Edge functions (secrets) | console.anthropic.com -> API Keys -> Create new key    | Set new secret, delete old key          |
| GMO API Key                   | Edge functions (secrets) | GMO Dashboard -> API Settings                          | Set new secret                          |
| Resend API Key                | Edge functions (secrets) | Resend Dashboard -> API Keys                           | Set new secret                          |
| Google OAuth Client Secret    | Supabase Auth config     | Google Cloud Console -> OAuth -> Credentials           | Update in Supabase Auth settings        |

### Step-by-Step (Generic -- for any credential)

1. **Generate new key** on the provider's dashboard
   - Do NOT delete the old key yet
2. **Update the key in DealStage**:
   - For edge function secrets:
     ```bash
     supabase secrets set KEY_NAME=new_value --project-ref [PROJECT_REF]
     ```
   - For Vercel environment variables:
     Vercel Dashboard -> Settings -> Environment Variables -> Edit
   - For Supabase Auth config (Google OAuth):
     Supabase Dashboard -> Authentication -> Providers -> Google -> Update secret
3. **Verify the new key works**:
   - Test the affected edge function(s) with the new key
   - For Stripe: `stripe trigger payment_intent.created` (Stripe CLI with new key)
   - For OpenAI: test a simple completion request
   - For Supabase anon key: reload app and verify auth works
4. **Delete the old key** on the provider's dashboard
   - Only after confirming the new key is working
5. **If client-side key changed (Supabase anon key)**:
   - Trigger Vercel redeploy to bake new key into client bundle
   - Existing user sessions continue with old key until page refresh (graceful degradation)
6. **Log the rotation**:
   ```sql
   INSERT INTO audit_logs (action, details, created_at)
   VALUES ('credential_rotation', '{"provider": "openai", "rotated_by": "founder", "reason": "quarterly"}', now());
   ```
7. **Update any documentation** that references the old key format or location

### Rollback Steps

- If new key doesn't work: the old key is still active (step 4 not yet executed)
- Re-set the old key: `supabase secrets set KEY_NAME=old_value`
- Investigate why the new key failed before retrying

### Rotation Schedule

| Credential            | Rotation Frequency | Last Rotated | Next Due |
| --------------------- | ------------------ | ------------ | -------- |
| All API keys          | Quarterly          | [DATE]       | [DATE]   |
| Stripe webhook secret | On suspicion only  | [DATE]       | N/A      |
| Google OAuth secret   | Annually           | [DATE]       | [DATE]   |

---

## RB-004: Database Migration

| Field               | Detail                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-004                                                                                                                          |
| **Procedure**       | Database Migration (Write SQL, Test, Run in SQL Editor)                                                                         |
| **Category**        | Engineering                                                                                                                     |
| **Trigger**         | New feature requires schema changes. Data model update. Performance optimization (index changes). Bug fix requiring data repair |
| **Prerequisites**   | Migration SQL written and reviewed. Understanding of affected tables and downstream impact. Backup verified (RB-011)            |
| **Duration**        | 15-60 minutes                                                                                                                   |
| **Required Access** | Supabase Admin (SQL Editor)                                                                                                     |
| **Owner**           | Founder                                                                                                                         |

### Step-by-Step

1. **Write the migration SQL**:
   - Use `IF NOT EXISTS` / `IF EXISTS` for idempotent operations
   - Wrap in a transaction: `BEGIN; ... COMMIT;`
   - Include both UP (apply) and DOWN (rollback) scripts
   - Example:

     ```sql
     -- Migration: Add data_freshness_score to enriched_creators
     -- UP
     BEGIN;
     ALTER TABLE enriched_creators ADD COLUMN IF NOT EXISTS data_freshness_score integer DEFAULT 100;
     ALTER TABLE enriched_creators ADD COLUMN IF NOT EXISTS last_enriched_at timestamptz DEFAULT now();
     CREATE INDEX IF NOT EXISTS idx_enriched_creators_freshness ON enriched_creators (data_freshness_score);
     COMMIT;

     -- DOWN (rollback)
     -- BEGIN;
     -- DROP INDEX IF EXISTS idx_enriched_creators_freshness;
     -- ALTER TABLE enriched_creators DROP COLUMN IF EXISTS last_enriched_at;
     -- ALTER TABLE enriched_creators DROP COLUMN IF EXISTS data_freshness_score;
     -- COMMIT;
     ```

2. **Save migration to version control**:
   - Create file: `migrations/YYYYMMDD_HHMMSS_description.sql`
   - Include UP and DOWN scripts (DOWN commented out)
   - Commit to Git: `git add migrations/ && git commit -m "migration: add data_freshness_score to enriched_creators"`

3. **Test on Supabase branch** (if available):
   - Supabase Dashboard -> Branches -> Create branch
   - Run migration on branch
   - Test application against branch database
   - If branch testing not available: **extra caution** -- test queries on small scale first

4. **Backup before migration**:
   - Run RB-011 (Backup Restore Procedure) to create a fresh backup
   - Or at minimum: `SELECT count(*) FROM [affected_table];` to record pre-migration state

5. **Execute migration**:
   - Supabase Dashboard -> SQL Editor -> New query
   - Paste the UP migration SQL
   - Review one more time
   - Click "Run"
   - Check for errors in the output

6. **Verify migration**:
   - Check table structure: `\d [table_name]` or `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '[table]';`
   - Check row counts: `SELECT count(*) FROM [table];` -- should match pre-migration count (for non-destructive migrations)
   - Check index: `SELECT indexname FROM pg_indexes WHERE tablename = '[table]';`
   - Test application: verify affected features work correctly

7. **Monitor post-migration**:
   - Watch for application errors for 30 minutes
   - Check query performance on affected tables
   - Verify RLS policies still apply correctly

8. **Document the migration**:
   - Log in `audit_logs`:
     ```sql
     INSERT INTO audit_logs (action, details, created_at)
     VALUES ('database_migration', '{"file": "20260329_add_freshness_score.sql", "tables": ["enriched_creators"]}', now());
     ```

### Rollback Steps

1. If migration failed mid-transaction: `ROLLBACK;` (if transaction is still open)
2. If migration succeeded but caused issues: run the DOWN migration SQL
3. If DOWN migration is not possible: restore from backup (RB-011)
4. If data was lost: restore from Supabase PITR (Pro plan)

---

## RB-005: Populate Brands (Admin Flow)

| Field               | Detail                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | RB-005                                                                                                                                                 |
| **Procedure**       | Populate Brands                                                                                                                                        |
| **Category**        | Data Operations                                                                                                                                        |
| **Trigger**         | Initial platform setup. New brand dataset available. Quarterly data refresh                                                                            |
| **Prerequisites**   | Brand dataset prepared (name, industry, website, budget, target niches, relevant talent types). Admin account with access to PG-089 (AdminDataManager) |
| **Duration**        | 5-30 minutes depending on dataset size                                                                                                                 |
| **Required Access** | Supabase Admin                                                                                                                                         |
| **Owner**           | Founder                                                                                                                                                |

### Step-by-Step

1. **Prepare brand data**:
   - Required fields: `name`, `industry`, `website`
   - Optional fields: `description`, `hq_location`, `annual_budget`, `partnership_budget`, `target_niches` (array), `target_platforms` (array), `relevant_talent_types` (array), `contact_name`, `contact_email`
   - Format: JSON array or CSV

2. **Record current state**:

   ```sql
   SELECT count(*) as total_brands,
          count(DISTINCT industry) as industries
   FROM brands;
   ```

3. **Navigate to AdminDataManager** (PG-089):
   - Login as admin
   - Go to Admin -> Data Manager
   - Select "Brands" tab

4. **Option A -- Via AdminDataManager UI**:
   - Click "Populate Brands"
   - Upload dataset or trigger pre-configured population
   - Monitor progress bar
   - Wait for completion notification

5. **Option B -- Via Edge Function directly**:

   ```bash
   curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/importEntityData' \
     --header 'Authorization: Bearer [SERVICE_ROLE_KEY]' \
     --header 'Content-Type: application/json' \
     --data '{"entity": "brands", "data": [...]}'
   ```

6. **Option C -- Via SQL Editor** (for direct insert):

   ```sql
   INSERT INTO brands (name, industry, website, created_by, created_at, updated_at)
   VALUES
     ('Brand Name 1', 'Technology', 'https://brand1.com', 'system', now(), now()),
     ('Brand Name 2', 'Fashion', 'https://brand2.com', 'system', now(), now())
   ON CONFLICT (name, website) DO UPDATE SET
     industry = EXCLUDED.industry,
     updated_at = now();
   ```

7. **Verify population**:

   ```sql
   SELECT count(*) as total_brands,
          count(DISTINCT industry) as industries,
          count(*) FILTER (WHERE created_at > now() - interval '1 hour') as newly_added
   FROM brands;
   ```

8. **Trigger enrichment** for new brands:
   - New brands need Crawl4AI enrichment (Step 4.3) to populate `enriched_brands` (TBL-015)
   - Trigger via AdminDataManager or edge function

### Rollback Steps

- Delete newly added brands: `DELETE FROM brands WHERE created_by = 'system' AND created_at > '[timestamp_before_population]';`
- If contacts were populated for these brands, delete those too (FK cascade or manual)

---

## RB-006: Populate Contacts (Admin Flow)

| Field               | Detail                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-006                                                                                                                                 |
| **Procedure**       | Populate Contacts via GrowMeOrganic                                                                                                    |
| **Category**        | Data Operations                                                                                                                        |
| **Trigger**         | New brands added that need contact data. Quarterly contact refresh. Initial platform setup                                             |
| **Prerequisites**   | Target brands exist in `brands` table. GMO API key active and quota available. Understanding of GMO monthly quota (10K requests/month) |
| **Duration**        | 30 minutes to 4 hours depending on brand count and GMO quota                                                                           |
| **Required Access** | Supabase Admin, GMO account                                                                                                            |
| **Owner**           | Founder                                                                                                                                |

### Step-by-Step

1. **Check GMO quota**:
   - Log into GMO dashboard
   - Check remaining API calls for the current billing period
   - Calculate required calls: ~1 call per brand for contact lookup

2. **Identify brands needing contacts**:

   ```sql
   SELECT b.id, b.name, b.website, count(dm.id) as contact_count
   FROM brands b
   LEFT JOIN decision_makers dm ON dm.brand_id = b.id
   GROUP BY b.id, b.name, b.website
   HAVING count(dm.id) = 0
   ORDER BY b.name;
   ```

3. **Record current state**:

   ```sql
   SELECT count(*) as total_contacts,
          count(DISTINCT brand_id) as brands_with_contacts
   FROM decision_makers;
   ```

4. **Execute contact population**:
   - Via AdminDataManager (PG-089): Click "Populate Contacts"
   - Or via edge function:
     ```bash
     curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/importEntityData' \
       --header 'Authorization: Bearer [SERVICE_ROLE_KEY]' \
       --header 'Content-Type: application/json' \
       --data '{"entity": "contacts", "brandIds": ["id1", "id2", ...]}'
     ```

5. **Monitor progress**:
   - Watch edge function logs for progress/errors
   - GMO rate limit errors: pause and resume in next billing cycle
   - Expected: ~30-40 contacts per brand average

6. **Verify results**:

   ```sql
   SELECT count(*) as total_contacts,
          count(DISTINCT brand_id) as brands_with_contacts,
          AVG(email_confidence) as avg_confidence,
          count(*) FILTER (WHERE created_at > now() - interval '1 hour') as newly_added
   FROM decision_makers;
   ```

7. **Quality check**:
   ```sql
   -- Check for contacts with low confidence
   SELECT count(*) FILTER (WHERE email_confidence < 50) as low_confidence,
          count(*) FILTER (WHERE email_confidence >= 50 AND email_confidence < 80) as medium_confidence,
          count(*) FILTER (WHERE email_confidence >= 80) as high_confidence
   FROM decision_makers
   WHERE created_at > now() - interval '1 hour';
   ```

### Rollback Steps

- Delete newly populated contacts: `DELETE FROM decision_makers WHERE created_at > '[timestamp_before_population]';`

---

## RB-007: GDPR Data Export Request

| Field               | Detail                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-007                                                                                                                        |
| **Procedure**       | GDPR Subject Access Request (Data Export)                                                                                     |
| **Category**        | Compliance                                                                                                                    |
| **Trigger**         | User requests export of their personal data under GDPR Article 15. Request received via email, GDPR page (PG-088), or support |
| **Prerequisites**   | User identity verified (confirm they own the account). Request documented with receipt date. 30-day deadline tracked          |
| **Duration**        | 1-3 hours                                                                                                                     |
| **Required Access** | Supabase Admin                                                                                                                |
| **Owner**           | Founder                                                                                                                       |

### Step-by-Step

1. **Acknowledge request within 24 hours**:

   ```
   Subject: Your GDPR Data Export Request -- Received

   Dear [NAME],

   We have received your request to export your personal data under
   GDPR Article 15. We will process your request within 30 days.

   Request received: [DATE]
   Expected completion: [DATE + 30 days]
   Reference number: GDPR-EXPORT-[YYYY]-[NNN]

   If you have any questions, please reply to this email.

   -- DealStage Data Protection
   ```

2. **Verify user identity**:
   - Confirm the request came from the email address on the account
   - If from a different email: request verification (e.g., login and submit from account settings)
   - Find user ID:
     ```sql
     SELECT id, email, full_name, role, plan, created_at FROM profiles WHERE email = '[user_email]';
     ```

3. **Export data from all tables** (using user ID from step 2):

   ```sql
   -- Core profile
   SELECT * FROM profiles WHERE id = '[user_id]';

   -- Talents (if role = talent)
   SELECT * FROM talents WHERE owner_id = '[user_id]';

   -- Brands (if role = brand)
   SELECT * FROM brands WHERE owner_id = '[user_id]';

   -- Partnerships
   SELECT * FROM partnerships WHERE created_by = '[user_id]';

   -- Activities
   SELECT * FROM activities WHERE user_id = '[user_id]';

   -- AI usage
   SELECT * FROM ai_usage WHERE user_id = '[user_id]';
   SELECT * FROM ai_usage_logs WHERE user_id = '[user_id]';
   SELECT * FROM ai_rate_limits WHERE user_id = '[user_id]';

   -- Connected accounts (exclude tokens -- those are system data)
   SELECT id, platform, platform_username, connected_at FROM connected_accounts WHERE user_id = '[user_id]';

   -- Decision makers they created
   SELECT * FROM decision_makers WHERE owner_id = '[user_id]';

   -- Deal notes, attachments
   SELECT * FROM deal_notes WHERE user_id = '[user_id]';

   -- Subscription data
   SELECT * FROM user_subscriptions WHERE user_id = '[user_id]';

   -- Audit logs
   SELECT * FROM audit_logs WHERE user_id = '[user_id]';

   -- Marketplace applications
   SELECT * FROM opportunity_applications WHERE talent_email = '[user_email]';

   -- Outreach sequences
   SELECT * FROM outreach_sequences WHERE created_by = '[user_id]';

   -- Notifications
   SELECT * FROM notifications WHERE user_id = '[user_id]';
   ```

4. **Compile export**:
   - Combine all query results into a JSON file
   - Or use the `exportEntityData` edge function if it supports user-scoped export
   - Remove any system-internal fields (internal IDs, system tokens) that are not personal data

5. **Deliver export to user**:
   - Send via secure method (encrypted email attachment, or secure download link)
   - Do NOT send PII via unencrypted email
   - Recommended: upload to Supabase Storage with a time-limited signed URL

   ```
   Subject: Your DealStage Data Export -- Complete

   Dear [NAME],

   Your data export is ready. You can download it using the secure
   link below. This link will expire in 7 days.

   [SECURE DOWNLOAD LINK]

   The export includes all personal data associated with your account.

   Reference: GDPR-EXPORT-[YYYY]-[NNN]

   -- DealStage Data Protection
   ```

6. **Log completion**:
   ```sql
   INSERT INTO audit_logs (action, user_id, details, created_at)
   VALUES ('gdpr_data_export', '[user_id]', '{"reference": "GDPR-EXPORT-2026-001", "tables_exported": 15, "delivered_at": "[date]"}', now());
   ```

### Rollback Steps

N/A -- data export is non-destructive.

---

## RB-008: GDPR Data Deletion Request

| Field               | Detail                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-008                                                                                                                          |
| **Procedure**       | GDPR Right to Erasure (Data Deletion)                                                                                           |
| **Category**        | Compliance                                                                                                                      |
| **Trigger**         | User requests deletion of their personal data under GDPR Article 17. Request received via email, GDPR page (PG-088), or support |
| **Prerequisites**   | User identity verified. Request documented. 30-day deadline tracked. User informed that deletion is irreversible                |
| **Duration**        | 1-2 hours                                                                                                                       |
| **Required Access** | Supabase Admin                                                                                                                  |
| **Owner**           | Founder                                                                                                                         |

### Step-by-Step

1. **Acknowledge request** (same template as RB-007, replace "export" with "deletion")

2. **Verify user identity** (same as RB-007 step 2)

3. **Confirm with user**:

   ```
   Subject: Please Confirm Your Data Deletion Request

   Dear [NAME],

   Before we proceed with deleting your account and all associated
   data, please confirm that you understand:

   - All your profile data, partnerships, contacts, and history
     will be permanently deleted
   - This action cannot be undone
   - Any active subscriptions will be cancelled

   Please reply with "CONFIRM DELETION" to proceed.

   Reference: GDPR-DELETE-[YYYY]-[NNN]

   -- DealStage Data Protection
   ```

4. **Cancel active subscription** (if any):
   - Stripe Dashboard -> Customers -> Find customer -> Cancel subscription
   - Or via API: cancel subscription immediately

5. **Delete data in correct order** (respecting foreign key constraints):

   ```sql
   -- Start transaction
   BEGIN;

   -- Delete from child tables first (no FK deps)
   DELETE FROM ai_usage_logs WHERE user_id = '[user_id]';
   DELETE FROM ai_usage WHERE user_id = '[user_id]';
   DELETE FROM ai_rate_limits WHERE user_id = '[user_id]';
   DELETE FROM notifications WHERE user_id = '[user_id]';
   DELETE FROM audit_logs WHERE user_id = '[user_id]';

   -- Delete outreach and sequences
   DELETE FROM outreach_sequence_steps WHERE sequence_id IN
     (SELECT id FROM outreach_sequences WHERE created_by = '[user_id]');
   DELETE FROM outreach_sequences WHERE created_by = '[user_id]';

   -- Delete deal-related data
   DELETE FROM deal_notes WHERE user_id = '[user_id]';
   DELETE FROM deal_attachments WHERE partnership_id IN
     (SELECT id FROM partnerships WHERE created_by = '[user_id]');
   DELETE FROM deal_scores WHERE partnership_id IN
     (SELECT id FROM partnerships WHERE created_by = '[user_id]');
   DELETE FROM match_scores WHERE partnership_id IN
     (SELECT id FROM partnerships WHERE created_by = '[user_id]');

   -- Delete partnerships
   DELETE FROM activities WHERE user_id = '[user_id]';
   DELETE FROM partnerships WHERE created_by = '[user_id]';

   -- Delete marketplace data
   DELETE FROM opportunity_applications WHERE talent_email = '[user_email]';
   DELETE FROM marketplace_opportunities WHERE posted_by = '[user_id]';

   -- Delete contacts they created
   DELETE FROM decision_makers WHERE owner_id = '[user_id]';

   -- Delete enrichment data
   DELETE FROM enriched_creators WHERE user_id = '[user_id]';
   DELETE FROM crawl_jobs WHERE user_id = '[user_id]';

   -- Delete connected accounts (CASCADE should handle but be explicit)
   DELETE FROM connected_accounts WHERE user_id = '[user_id]';
   DELETE FROM verification_tokens WHERE user_id = '[user_id]';

   -- Delete user subscriptions
   DELETE FROM user_subscriptions WHERE user_id = '[user_id]';

   -- Delete talents/brands created by user
   DELETE FROM talents WHERE owner_id = '[user_id]';
   DELETE FROM brands WHERE owner_id = '[user_id]' AND created_by != 'system';

   -- Delete profile (must be last -- other tables reference it)
   DELETE FROM profiles WHERE id = '[user_id]';

   COMMIT;
   ```

6. **Delete from Supabase Auth**:
   - Supabase Dashboard -> Authentication -> Users -> Find user -> Delete
   - Or via Admin API:
     ```bash
     curl -X DELETE 'https://[PROJECT_REF].supabase.co/auth/v1/admin/users/[user_id]' \
       --header 'Authorization: Bearer [SERVICE_ROLE_KEY]' \
       --header 'apikey: [SERVICE_ROLE_KEY]'
     ```

7. **Delete from Supabase Storage** (avatars, uploads):
   - List user's files: `supabase storage ls avatars/[user_id]`
   - Delete: `supabase storage rm avatars/[user_id]/*`

8. **Delete from Stripe** (if applicable):
   - Stripe Dashboard -> Customers -> Find -> Delete customer
   - Note: Stripe retains some data for legal/financial compliance (invoices, charges)

9. **Confirm deletion to user**:

   ```
   Subject: Your DealStage Account Has Been Deleted

   Dear [NAME],

   Your account and all associated personal data have been permanently
   deleted from DealStage as requested.

   Deleted data includes: profile information, partnerships, contacts,
   AI usage history, connected accounts, and all associated records.

   Note: Some anonymized, non-personal records may be retained for
   legal and financial compliance (e.g., anonymized payment records
   required by tax law).

   Reference: GDPR-DELETE-[YYYY]-[NNN]

   -- DealStage Data Protection
   ```

10. **Log deletion** (in a separate compliance log, not tied to user):
    ```sql
    INSERT INTO audit_logs (action, details, created_at)
    VALUES ('gdpr_data_deletion', '{"reference": "GDPR-DELETE-2026-001", "email_hash": "[sha256_hash]", "completed_at": "[date]"}', now());
    ```

### Rollback Steps

- Before COMMIT: `ROLLBACK;` to cancel the transaction
- After COMMIT: Data is permanently deleted. Restore from backup (RB-011) is the only option, but doing so would violate the user's deletion request. Only restore if the deletion was executed on the wrong user by mistake.

---

## RB-009: New Edge Function Deployment

| Field               | Detail                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-009                                                                                                                 |
| **Procedure**       | New Edge Function Deployment                                                                                           |
| **Category**        | Engineering                                                                                                            |
| **Trigger**         | New edge function developed and ready for production. Existing edge function updated                                   |
| **Prerequisites**   | Function code written in TypeScript (Deno runtime). Function tested locally. Required secrets identified and available |
| **Duration**        | 15-30 minutes                                                                                                          |
| **Required Access** | Supabase Admin, GitHub Admin                                                                                           |
| **Owner**           | Founder                                                                                                                |

### Step-by-Step

1. **Verify function code**:
   - File located at `functions/[functionName].ts`
   - Follows Supabase Edge Function conventions (Deno.serve, correct CORS headers)
   - Error handling implemented
   - Rate limiting/auth checks included

2. **Set required secrets** (if new secrets needed):

   ```bash
   supabase secrets set NEW_SECRET=value --project-ref [PROJECT_REF]
   ```

3. **Deploy the function**:

   ```bash
   supabase functions deploy [functionName] --project-ref [PROJECT_REF]
   ```

4. **Verify deployment**:

   ```bash
   # Check function is listed
   supabase functions list --project-ref [PROJECT_REF]

   # Check logs for startup errors
   supabase functions logs [functionName] --project-ref [PROJECT_REF] --tail
   ```

5. **Test the deployed function**:

   ```bash
   curl -i --location --request POST \
     'https://[PROJECT_REF].supabase.co/functions/v1/[functionName]' \
     --header 'Authorization: Bearer [ANON_KEY]' \
     --header 'Content-Type: application/json' \
     --data '{"test": true}'
   ```

6. **Update client-side code** (if needed):
   - Add function call in relevant React component
   - Use Supabase client: `supabase.functions.invoke('[functionName]', { body: {...} })`
   - Deploy client update via Vercel (git push)

7. **Monitor**:
   - Check function logs for errors in first hour
   - Verify function execution count and latency in Supabase Dashboard

### Rollback Steps

- Delete function: `supabase functions delete [functionName] --project-ref [PROJECT_REF]`
- Redeploy previous version: see Deliverable 12 Section F (Edge Function Rollback)

---

## RB-010: AI Model / Provider Switch

| Field               | Detail                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-010                                                                                                                     |
| **Procedure**       | AI Model or Provider Switch                                                                                                |
| **Category**        | Engineering                                                                                                                |
| **Trigger**         | Provider outage (INC-006). Cost optimization. Quality improvement. New model available. Provider deprecating current model |
| **Prerequisites**   | New provider account and API key. New model tested with representative prompts. Cost comparison completed                  |
| **Duration**        | 1-4 hours                                                                                                                  |
| **Required Access** | Supabase Admin (for secrets), GitHub Admin (for code changes)                                                              |
| **Owner**           | Founder                                                                                                                    |

### Step-by-Step

1. **Evaluate the new model/provider**:
   - Test with 10 representative prompts from each AI agent
   - Compare output quality with current model
   - Compare latency and token costs
   - Verify the new model supports required features (JSON mode, function calling, etc.)

2. **Set up new credentials**:

   ```bash
   supabase secrets set NEW_PROVIDER_API_KEY=xxx --project-ref [PROJECT_REF]
   ```

3. **Update edge functions**:
   - Modify provider configuration in affected edge functions
   - Update model name (e.g., `gpt-4o-mini` -> `claude-3-haiku`)
   - Adjust prompt formatting for new provider's API format
   - Update token counting / cost estimation logic in `ai_usage_logs` tracking

4. **Deploy updated functions**:

   ```bash
   # Deploy all affected functions
   supabase functions deploy [function1] --project-ref [PROJECT_REF]
   supabase functions deploy [function2] --project-ref [PROJECT_REF]
   # ... repeat for all affected functions
   ```

5. **Test each updated agent**:
   - Test every AI agent that was switched
   - Verify output format matches expected structure
   - Verify cost tracking is accurate for new model pricing

6. **Monitor for 24 hours**:
   - Watch `ai_usage_logs` (TBL-011) for error rates, latency, costs
   - Compare cost per request with previous model
   - Check user feedback for quality changes

7. **Clean up old credentials** (after 7-day observation period):
   ```bash
   supabase secrets unset OLD_PROVIDER_API_KEY --project-ref [PROJECT_REF]
   ```

### Rollback Steps

- Revert edge function code to use previous provider
- Re-deploy affected functions
- Old API key still active (don't delete for 7 days)

---

## RB-011: Backup Restore Procedure

| Field               | Detail                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **ID**              | RB-011                                                                                         |
| **Procedure**       | Backup and Restore                                                                             |
| **Category**        | Operations                                                                                     |
| **Trigger**         | Pre-migration backup. Disaster recovery. Data corruption detected. Monthly backup verification |
| **Prerequisites**   | Supabase project access. Understanding of which data to backup/restore                         |
| **Duration**        | Backup: 15-30 minutes. Restore: 30-120 minutes                                                 |
| **Required Access** | Supabase Admin                                                                                 |
| **Owner**           | Founder                                                                                        |

### Backup Procedure

**Option A: Supabase PITR (Pro Plan -- Preferred)**

- Supabase Pro plan includes automatic Point-in-Time Recovery
- Backups are continuous -- restore to any point in the last 7 days
- No manual action needed for backup
- To restore: Supabase Dashboard -> Database -> Backups -> Select point in time -> Restore

**Option B: Manual SQL Export**

```sql
-- Export critical tables to JSON (run in SQL Editor, copy results)
-- Profile data
SELECT json_agg(t) FROM (SELECT * FROM profiles) t;

-- Brand data
SELECT json_agg(t) FROM (SELECT * FROM brands) t;

-- Talent data
SELECT json_agg(t) FROM (SELECT * FROM talents) t;

-- Partnership data
SELECT json_agg(t) FROM (SELECT * FROM partnerships) t;

-- Decision makers
SELECT json_agg(t) FROM (SELECT * FROM decision_makers) t;

-- Subscriptions
SELECT json_agg(t) FROM (SELECT * FROM user_subscriptions) t;
```

Save each result as `backup_[table]_[YYYYMMDD].json`

**Option C: pg_dump via CLI** (if Supabase direct connection is configured)

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --file=backup_[YYYYMMDD].dump
```

### Restore Procedure

**Option A: Supabase PITR Restore**

1. Supabase Dashboard -> Database -> Backups
2. Select the desired restore point
3. Click "Restore"
4. Wait for restore to complete (5-30 minutes depending on database size)
5. Verify all data is present
6. Note: PITR restore replaces the ENTIRE database -- not table-level

**Option B: Manual SQL Restore**

```sql
-- Restore from JSON backup
-- CAUTION: This inserts data. Use ON CONFLICT for idempotent restores.

-- Example: restore brands from JSON
INSERT INTO brands (id, name, industry, website, ...)
SELECT * FROM json_populate_recordset(null::brands, '[paste JSON here]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  updated_at = now();
```

**Option C: pg_restore**

```bash
pg_restore --clean --if-exists \
  --dbname="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  backup_[YYYYMMDD].dump
```

### Verification Post-Restore

```sql
-- Verify row counts match expectations
SELECT 'profiles' as tbl, count(*) FROM profiles
UNION ALL SELECT 'brands', count(*) FROM brands
UNION ALL SELECT 'talents', count(*) FROM talents
UNION ALL SELECT 'partnerships', count(*) FROM partnerships
UNION ALL SELECT 'decision_makers', count(*) FROM decision_makers;
```

### Rollback Steps

- If restore made things worse: restore from an earlier PITR point
- If manual restore corrupted data: use PITR to go back to pre-restore state

---

## RB-012: Stripe Product / Price Creation

| Field               | Detail                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **ID**              | RB-012                                                                                                 |
| **Procedure**       | Stripe Product and Price Creation                                                                      |
| **Category**        | Payments                                                                                               |
| **Trigger**         | New subscription tier added. Price change. New product offering (e.g., AI credits, one-time purchases) |
| **Prerequisites**   | Stripe account in live mode. Pricing decided. Feature set for the tier defined                         |
| **Duration**        | 15-30 minutes                                                                                          |
| **Required Access** | Stripe Admin                                                                                           |
| **Owner**           | Founder                                                                                                |

### Step-by-Step

1. **Create Product in Stripe**:
   - Stripe Dashboard -> Products -> Add product
   - Name: e.g., "DealStage Tier 2 -- Growth"
   - Description: Key features included
   - Metadata: Add `tier_level: tier2` for webhook handler mapping

2. **Create Price**:
   - On the product page -> Add price
   - Pricing model: Recurring
   - Amount: e.g., $79.00
   - Billing period: Monthly
   - Currency: USD
   - Optional: Add annual price with discount

3. **Record Price ID**:
   - Copy the `price_xxx` ID from Stripe
   - This ID is needed in the checkout flow

4. **Update application code**:
   - Update pricing configuration in the frontend (PG-038 Pricing page)
   - Update checkout session creation in edge function to use new price ID
   - Update webhook handler to map new product/price to correct `profiles.plan` value

5. **Update webhook handler mapping**:
   In the Stripe webhook edge function, ensure the price-to-plan mapping includes the new price:

   ```typescript
   const PRICE_TO_PLAN = {
     price_xxx_tier1: "tier1",
     price_xxx_tier2: "tier2",
     price_xxx_tier3: "tier3",
     price_xxx_new: "new_plan_name", // Add new mapping
   };
   ```

6. **Test the checkout flow**:
   - Use Stripe test mode first (if separate test environment exists)
   - Or test with a real card and immediately refund
   - Verify: checkout completes -> webhook fires -> `profiles.plan` updated

7. **Deploy**:
   - Deploy updated edge function: `supabase functions deploy [webhook_handler]`
   - Deploy updated frontend: `git push origin master`

8. **Verify end-to-end**:
   - New price appears on Pricing page
   - Checkout works for new plan
   - Webhook correctly updates `profiles.plan`
   - Features unlock for the new tier

### Rollback Steps

- Archive the product in Stripe (Dashboard -> Products -> Archive). Existing subscribers continue but no new subscriptions
- Revert code changes and redeploy

---

## RB-013: New Talent Type Addition

| Field               | Detail                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | RB-013                                                                                                                            |
| **Procedure**       | New Talent Type Addition                                                                                                          |
| **Category**        | Product                                                                                                                           |
| **Trigger**         | New talent category or type identified (e.g., "AI Content Creator", "Virtual Influencer"). Requires updates across multiple files |
| **Prerequisites**   | New talent type name and category approved. Understanding of affected files                                                       |
| **Duration**        | 30-60 minutes                                                                                                                     |
| **Required Access** | GitHub Admin, Supabase Admin                                                                                                      |
| **Owner**           | Founder                                                                                                                           |

### Step-by-Step

1. **Update `src/lib/talentTypes.js`**:
   - Add new type to the appropriate category
   - If new category: create the category entry first
   - Follow existing format exactly

2. **Update `src/config/pageAccess.js`** (if talent type affects feature access):
   - Add any type-specific feature flags
   - Update role-based access rules if the new type has different permissions

3. **Update navigation** (if new type gets its own section):
   - Add route in router configuration
   - Add navigation item in sidebar/menu

4. **Update brand-talent mapping SQL**:
   - Update `relevant_talent_types` options for brands:
     ```sql
     -- Add new talent type to the valid types list
     -- (if using a lookup table or constraint)
     INSERT INTO talent_types (category, name, slug, created_at)
     VALUES ('[category]', '[New Talent Type]', '[new-talent-type]', now())
     ON CONFLICT (slug) DO NOTHING;
     ```

5. **Update match scoring** (if type has unique scoring needs):
   - Review `scoreMatch` edge function for type-specific logic
   - Add scoring adjustments for the new type if needed

6. **Test**:
   - Create a talent profile with the new type
   - Verify it appears in TalentDiscovery (PG-054) filters
   - Verify match scoring works for the new type
   - Verify brand-side filtering includes the new type

7. **Deploy**:
   - Commit all changes: `git add src/lib/talentTypes.js src/config/pageAccess.js ...`
   - Push to master: `git push origin master`
   - If SQL changes: run in Supabase SQL Editor (RB-004 procedure)

8. **Verify in production**:
   - New type selectable in onboarding (Step 2.3)
   - New type filterable in TalentDiscovery
   - New type shows in brand-side talent type preferences

### Rollback Steps

- Revert code changes and redeploy
- Remove talent type from database: `DELETE FROM talent_types WHERE slug = '[new-talent-type]';`
- Any talents already using the type will need to be migrated: `UPDATE talents SET talent_type = '[fallback]' WHERE talent_type = '[new-talent-type]';`

---

## RB-014: Monthly Financial Reconciliation

| Field               | Detail                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| **ID**              | RB-014                                                                                             |
| **Procedure**       | Monthly Financial Reconciliation                                                                   |
| **Category**        | Finance / Operations                                                                               |
| **Trigger**         | First business day of each month. Covers the previous month                                        |
| **Prerequisites**   | Access to Stripe, Supabase, Vercel, Railway, OpenAI, Anthropic, GMO, and Resend billing dashboards |
| **Duration**        | 1-2 hours                                                                                          |
| **Required Access** | Stripe Admin, Supabase Admin, all provider dashboards                                              |
| **Owner**           | Founder                                                                                            |

### Step-by-Step

1. **Collect revenue data from Stripe**:
   - Stripe Dashboard -> Balance -> Download balance activity for previous month
   - Record: total revenue, number of paying customers, ARPU, churn count, new subscribers
   - Check for disputed charges or refunds

   ```sql
   -- Cross-reference with internal data
   SELECT plan, count(*) as user_count
   FROM profiles
   WHERE plan != 'free'
   GROUP BY plan;
   ```

2. **Reconcile subscriptions**:
   - Compare Stripe active subscriptions with `profiles.plan` counts
   - Identify mismatches (INC-012 scenario)
   - Fix any mismatches immediately

   ```sql
   -- Users with paid plans
   SELECT email, plan FROM profiles WHERE plan IN ('tier1', 'tier2', 'tier3') ORDER BY plan;
   ```

3. **Collect infrastructure costs**:

   | Provider    | Dashboard URL                  | Expected Range        |
   | ----------- | ------------------------------ | --------------------- |
   | Supabase    | app.supabase.com -> Billing    | $25-$75/mo            |
   | Vercel      | vercel.com -> Billing          | $0-$20/mo             |
   | Railway     | railway.app -> Usage           | $5-$20/mo             |
   | OpenAI      | platform.openai.com -> Usage   | $20-$100/mo           |
   | Anthropic   | console.anthropic.com -> Usage | $10-$50/mo            |
   | GMO         | growmeorganic.com -> Billing   | $50-$200/mo           |
   | Resend      | resend.com -> Billing          | $0-$20/mo             |
   | Domain      | registrar -> Billing           | $1-$5/mo (annualized) |
   | UptimeRobot | uptimerobot.com -> Billing     | $0-$10/mo             |

4. **Calculate AI cost per user**:

   ```sql
   SELECT
     DATE_TRUNC('month', created_at) as month,
     count(*) as total_requests,
     SUM(estimated_cost_usd) as total_cost,
     count(DISTINCT user_id) as unique_users,
     SUM(estimated_cost_usd) / NULLIF(count(DISTINCT user_id), 0) as cost_per_user
   FROM ai_usage_logs
   WHERE created_at >= DATE_TRUNC('month', now() - interval '1 month')
     AND created_at < DATE_TRUNC('month', now())
   GROUP BY DATE_TRUNC('month', created_at);
   ```

5. **Compile monthly P&L summary**:

   | Line Item            | Amount    |
   | -------------------- | --------- |
   | Revenue (Stripe)     | $XXX      |
   | - Stripe fees (2.9%) | -$XX      |
   | **Net Revenue**      | **$XXX**  |
   | Supabase             | -$XX      |
   | Vercel               | -$XX      |
   | Railway              | -$XX      |
   | OpenAI               | -$XX      |
   | Anthropic            | -$XX      |
   | GMO                  | -$XX      |
   | Resend               | -$XX      |
   | Other                | -$XX      |
   | **Total Costs**      | **-$XXX** |
   | **Net P&L**          | **$XXX**  |

6. **Track key metrics**:
   - Monthly Recurring Revenue (MRR)
   - Number of paying customers
   - ARPU (Average Revenue Per User)
   - Churn rate (% of paying customers who cancelled)
   - AI cost as % of revenue
   - Infrastructure cost as % of revenue
   - Runway remaining (cash / monthly burn)

7. **Check for RISK triggers**:
   - AI costs exceed 40% of revenue? (RISK-029)
   - Zero paying users after 90 days? (RISK-028)
   - Any provider costs spiking unexpectedly?

8. **Archive reconciliation**:
   - Save the reconciliation report (spreadsheet or document)
   - Store in a `reconciliation/` folder in version control or cloud storage
   - Log completion:
     ```sql
     INSERT INTO audit_logs (action, details, created_at)
     VALUES ('monthly_reconciliation', '{"month": "2026-03", "mrr": XXX, "total_costs": XXX, "net_pl": XXX}', now());
     ```

### Rollback Steps

N/A -- reconciliation is read-only and produces a report.

---

## Runbook Summary Index

| RB-ID  | Procedure                        | Category        | Frequency        | Duration    | Access Required          |
| ------ | -------------------------------- | --------------- | ---------------- | ----------- | ------------------------ |
| RB-001 | Enterprise Customer Onboarding   | Customer Ops    | As needed        | 2-4 hours   | Supabase, Stripe         |
| RB-002 | New API Integration Setup        | Engineering     | As needed        | 4-8 hours   | Supabase, GitHub, Vercel |
| RB-003 | Credential Rotation              | Security        | Quarterly        | 30-60 min   | All provider dashboards  |
| RB-004 | Database Migration               | Engineering     | As needed        | 15-60 min   | Supabase                 |
| RB-005 | Populate Brands                  | Data Operations | As needed        | 5-30 min    | Supabase                 |
| RB-006 | Populate Contacts                | Data Operations | As needed        | 30 min-4 hr | Supabase, GMO            |
| RB-007 | GDPR Data Export Request         | Compliance      | As needed        | 1-3 hours   | Supabase                 |
| RB-008 | GDPR Data Deletion Request       | Compliance      | As needed        | 1-2 hours   | Supabase, Stripe         |
| RB-009 | New Edge Function Deployment     | Engineering     | As needed        | 15-30 min   | Supabase, GitHub         |
| RB-010 | AI Model / Provider Switch       | Engineering     | As needed        | 1-4 hours   | Supabase, GitHub         |
| RB-011 | Backup Restore Procedure         | Operations      | Monthly + ad hoc | 15-120 min  | Supabase                 |
| RB-012 | Stripe Product / Price Creation  | Payments        | As needed        | 15-30 min   | Stripe, Supabase, GitHub |
| RB-013 | New Talent Type Addition         | Product         | As needed        | 30-60 min   | GitHub, Supabase         |
| RB-014 | Monthly Financial Reconciliation | Finance         | Monthly          | 1-2 hours   | All dashboards           |

---

## Cross-Reference Index: Batch 4

### Risk Matrix -> Incident Playbooks

| RISK-ID  | Maps to INC |
| -------- | ----------- |
| RISK-001 | INC-004     |
| RISK-004 | INC-004     |
| RISK-005 | INC-011     |
| RISK-006 | INC-006     |
| RISK-007 | INC-006     |
| RISK-008 | INC-011     |
| RISK-009 | INC-002     |
| RISK-010 | INC-012     |
| RISK-011 | INC-013     |
| RISK-012 | INC-016     |
| RISK-013 | INC-012     |
| RISK-014 | INC-003     |
| RISK-015 | INC-003     |
| RISK-016 | INC-003     |
| RISK-017 | INC-007     |
| RISK-018 | INC-008     |
| RISK-019 | INC-014     |
| RISK-020 | INC-010     |
| RISK-021 | INC-002     |
| RISK-022 | INC-008     |
| RISK-023 | INC-015     |
| RISK-024 | INC-005     |
| RISK-025 | INC-005     |
| RISK-026 | INC-005     |
| RISK-027 | INC-009     |
| RISK-031 | INC-018     |
| RISK-035 | INC-004     |
| RISK-037 | INC-004     |

### Incident Playbooks -> Runbooks

| INC-ID  | Related Runbooks                                               |
| ------- | -------------------------------------------------------------- |
| INC-002 | RB-011 (Backup Restore)                                        |
| INC-003 | RB-012 (Stripe Products), RB-014 (Reconciliation)              |
| INC-005 | RB-003 (Credential Rotation), RB-008 (GDPR Deletion if needed) |
| INC-006 | RB-010 (AI Model Switch)                                       |
| INC-010 | RB-009 (Edge Function Deployment)                              |
| INC-012 | RB-012 (Stripe Products), RB-014 (Reconciliation)              |
| INC-016 | RB-004 (Database Migration), RB-011 (Backup Restore)           |
| INC-017 | RB-006 (Populate Contacts)                                     |

### Batch 4 -> Previous Batches

| Batch 4 Reference         | Batch 1/2/3 Reference             |
| ------------------------- | --------------------------------- |
| All RISK database entries | TBL-001 through TBL-068 (Batch 1) |
| All INC detection methods | API-001 through API-018 (Batch 2) |
| All INC steps reference   | Step 1.1 through 15.3 (Batch 3)   |
| All RB SQL operations     | PER-001 through PER-007 (Batch 1) |
| Feature flag references   | PG-001 through PG-094 (Batch 2)   |
| Edge function inventory   | AGT-001 through AGT-029 (Batch 2) |
| Test case references      | TC-001 through TC-055 (Batch 3)   |
| Dependency references     | DEP-001 through DEP-035 (Batch 3) |

---

**End of Batch 4**

**Document Statistics:**

- RISK entries: RISK-001 through RISK-037 (37 risks across 10 areas)
- INC entries: INC-001 through INC-018 (18 incident playbooks)
- Deployment pipeline: 10 stages documented
- Feature flags: 8 flags with rollout strategies
- RB entries: RB-001 through RB-014 (14 operational runbooks)
- Communication templates: 15+ ready-to-use templates
- SQL procedures: 40+ executable queries
