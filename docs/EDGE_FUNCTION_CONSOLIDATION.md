# Edge Function Consolidation Plan

**Date:** 2026-03-29
**Status:** Proposed (do not merge yet)
**Author:** Architecture team

---

## Problem Statement

PartnerIQ currently deploys **76 separate Supabase Edge Functions** (plus `_shared`). Each
function is a standalone Deno isolate that incurs a **200-500 ms cold-start penalty** on first
invocation. Many of these functions follow an identical structural pattern:

1. CORS preflight check
2. Auth via `createClientFromRequest`
3. Fetch entities in parallel
4. Build an LLM prompt
5. Call the AI router and return the response

By consolidating functions that share this pattern into unified handlers with an `action`
parameter, we can dramatically reduce the number of isolates, cut cold-start latency for
users, and simplify deployment and testing.

---

## Complete Function Inventory (76 functions)

### Category A: AI Analysis Agents (15 functions)

All 15 follow the exact same pattern: auth, fetch entities, build prompt, call LLM, return
JSON. They differ only in which entities they fetch and what prompt they construct.

| #   | Function                          | Description                                                            |
| --- | --------------------------------- | ---------------------------------------------------------------------- |
| 1   | `analyzeAgentPerformance`         | Dashboard of all 12 AI agent health metrics over a configurable period |
| 2   | `analyzeAudienceOverlap`          | Cross-partner audience overlap and cannibalization detection           |
| 3   | `analyzeBrandSafety`              | Brand safety and reputation risk scoring across the talent roster      |
| 4   | `analyzeCampaignPostMortem`       | Post-mortem analysis of a completed partnership/campaign               |
| 5   | `analyzeCompetitorIntelligence`   | Competitor activity tracking and market positioning insights           |
| 6   | `analyzeComplianceDisclosure`     | FTC/regulatory compliance and disclosure audit                         |
| 7   | `analyzeContentEffectiveness`     | Outreach email subject-line and content pattern analysis               |
| 8   | `analyzeContractIntelligence`     | Contract clause analysis, risk detection, and deal-value benchmarking  |
| 9   | `analyzeCrossPlatformAttribution` | Multi-platform attribution modeling across outreach channels           |
| 10  | `analyzeDealPatterns`             | Historical deal pattern recognition (win/loss/churn correlations)      |
| 11  | `analyzeDispute`                  | AI-mediated dispute analysis for a specific DealDispute record         |
| 12  | `analyzeInvoiceReconciliation`    | Invoice/payment matching and discrepancy detection                     |
| 13  | `analyzeNegotiationCoach`         | Deal negotiation strategy and counter-offer coaching                   |
| 14  | `analyzeRelationshipHealth`       | Partnership sentiment, engagement frequency, and health scoring        |
| 15  | `analyzeRosterOptimization`       | Talent roster balancing by niche, tier, and platform distribution      |
| 16  | `analyzeTrendPrediction`          | Market trend forecasting using culture events and platform signals     |

### Category B: AI Generation / Prediction (11 functions)

Also LLM-backed. Each fetches data, builds a prompt, and returns structured AI output.

| #   | Function                       | Description                                                             |
| --- | ------------------------------ | ----------------------------------------------------------------------- |
| 1   | `generateAICampaign`           | Generates a full campaign strategy from demographic segments            |
| 2   | `generateAIOutreach`           | Generates personalized outreach email sequences for a talent+brand pair |
| 3   | `generateCreativeDirection`    | Produces a creative brief for a partnership                             |
| 4   | `generateExecutiveBriefing`    | Creates a daily/weekly/monthly executive summary with KPIs              |
| 5   | `generateSmartAlerts`          | Scans all entities and generates prioritized alert recommendations      |
| 6   | `generateWeeklyBrief`          | Produces a weekly performance brief for a specific user                 |
| 7   | `predictPartnershipSuccess`    | Predicts success probability for a given partnership                    |
| 8   | `predictTalentValueTrajectory` | Projects a talent's future value based on growth trajectory             |
| 9   | `forecastOutreachConversion`   | Forecasts conversion rate for an outreach sequence                      |
| 10  | `forecastRevenue`              | Revenue forecast based on pipeline, billing history, and benchmarks     |
| 11  | `recommendOptimalPricing`      | Recommends optimal deal pricing for a partnership                       |

### Category C: AI Orchestration (5 functions)

These coordinate or dispatch calls to the analysis/generation functions above.

| #   | Function             | Description                                                                 |
| --- | -------------------- | --------------------------------------------------------------------------- |
| 1   | `ai-router`          | Universal AI router with failover, caching, rate limiting, usage tracking   |
| 2   | `aiCommandCenter`    | Natural-language query interface across all entities                        |
| 3   | `aiDealCoach`        | Deal coaching combining profile data with negotiation benchmarks            |
| 4   | `runAgentChain`      | Executes multi-step agent chains (e.g., trend -> competitor -> negotiation) |
| 5   | `runScheduledAgents` | Runs a batch of AI agents on a cron schedule                                |

### Category D: Stripe / Billing (7 functions)

Each is a thin wrapper around the Stripe SDK performing a single operation.

| #   | Function                 | Description                                                       |
| --- | ------------------------ | ----------------------------------------------------------------- |
| 1   | `addPaymentMethod`       | Creates and attaches a card payment method to a Stripe customer   |
| 2   | `deletePaymentMethod`    | Detaches a payment method from a Stripe customer                  |
| 3   | `getInvoices`            | Lists invoices for a Stripe customer                              |
| 4   | `getPaymentMethods`      | Lists card payment methods for a Stripe customer                  |
| 5   | `handleStripeWebhook`    | Processes incoming Stripe webhook events                          |
| 6   | `initializeSubscription` | Creates a Stripe checkout session for a new subscription          |
| 7   | `setupStripeConnect`     | Manages Stripe Connect Express accounts (create, escrow, release) |
| 8   | `upgradeSubscription`    | Changes a Stripe subscription to a new plan tier                  |

### Category E: Subscription & Access Control (2 functions)

| #   | Function                    | Description                                                       |
| --- | --------------------------- | ----------------------------------------------------------------- |
| 1   | `checkFeatureAccess`        | Checks if a user's subscription plan grants access to a feature   |
| 2   | `getUserSubscriptionStatus` | Returns current subscription status, plan, and Stripe customer ID |

### Category F: Alert / Notification Checkers (4 functions)

All follow the same pattern: fetch entities, check conditions, create Notification records.
Designed to be called by cron jobs.

| #   | Function                 | Description                                                             |
| --- | ------------------------ | ----------------------------------------------------------------------- |
| 1   | `checkApprovalAlerts`    | Fires alerts for approvals pending > 24h, high-value SLA breaches       |
| 2   | `checkOpportunityAlerts` | Matches talent profiles to new marketplace opportunities (>= 85% fit)   |
| 3   | `checkOutreachAlerts`    | Fires alerts for underperforming sequences, no-engagement, viral spikes |
| 4   | `checkPartnershipAlerts` | Fires alerts for stale deals, long negotiations, status celebrations    |

### Category G: Email & Outreach (5 functions)

| #   | Function              | Description                                                              |
| --- | --------------------- | ------------------------------------------------------------------------ |
| 1   | `connectEmailAccount` | OAuth token exchange for Gmail/Outlook, stores connection in DB          |
| 2   | `refreshEmailToken`   | Refreshes an expired OAuth token for a connected email account           |
| 3   | `scanEmailForDeals`   | Scans connected Gmail for deal-related emails, extracts deal data via AI |
| 4   | `sendOutreachEmail`   | Sends a single outreach email via connected Gmail/Outlook or Resend      |
| 5   | `sendBulkOutreach`    | Sends all emails in an outreach sequence with throttling                 |

### Category H: Data Import / Export (8 functions)

| #   | Function                     | Description                                                         |
| --- | ---------------------------- | ------------------------------------------------------------------- |
| 1   | `exportEntityData`           | Exports any entity as CSV or JSON                                   |
| 2   | `exportUserData`             | GDPR data export -- dumps all user-owned data as JSON               |
| 3   | `extractAndImportIndustries` | Extracts industry data from an uploaded CSV via LLM                 |
| 4   | `importAllCalendarData`      | Bulk imports industry guides, conferences, culture events, etc.     |
| 5   | `importAllConferences`       | Seeds the conference master list (36 conferences, hardcoded)        |
| 6   | `importCultureEvents`        | Seeds culture/sports event calendar (hardcoded dataset)             |
| 7   | `importEntityData`           | Generic CSV import for any entity with field mapping                |
| 8   | `importFullCalendarData`     | Imports planning timelines, demographics, and activation checklists |
| 9   | `importIndustryGuides`       | Seeds industry guide data (146 industries, hardcoded)               |

### Category I: Miscellaneous / Domain-Specific (12 functions)

| #   | Function                 | Description                                                             |
| --- | ------------------------ | ----------------------------------------------------------------------- |
| 1   | `benchmarkPerformance`   | Computes pipeline performance benchmarks and win/churn rates            |
| 2   | `create-phyllo-token`    | Creates a Phyllo SDK token for social media data ingestion              |
| 3   | `deduplicateIndustries`  | Admin tool to find and remove duplicate IndustryGuide records           |
| 4   | `deleteUserAccount`      | GDPR account deletion -- removes all user data and auth record          |
| 5   | `extractDecisionMakers`  | AI-powered decision-maker role extraction for a brand                   |
| 6   | `fetchSocialMediaData`   | Platform API facade for Instagram, TikTok, YouTube, Twitter data        |
| 7   | `identifySuccessFactors` | Identifies common traits of successful vs unsuccessful partnerships     |
| 8   | `localizeContent`        | AI-powered content localization/translation with brand voice            |
| 9   | `manageEscrow`           | Escrow lifecycle management (create, release, refund, check conditions) |
| 10  | `manageWebhooks`         | Webhook endpoint management (register, test, list, delete)              |
| 11  | `personalizePitchDeck`   | Generates a personalized pitch deck for a brand+talent set              |
| 12  | `processTriggerEvent`    | Processes real-time trigger events (award win, viral moment, etc.)      |
| 13  | `runBulkAgentOps`        | Runs an AI agent against a filtered batch of talent records             |
| 14  | `scoreDealLeaderboard`   | Scores and ranks all active deals into a leaderboard                    |
| 15  | `send-welcome-email`     | Sends a welcome email via Resend after signup                           |
| 16  | `simulatePartnership`    | Runs what-if portfolio simulations (add/remove creator, budget changes) |
| 17  | `updateRateBenchmarks`   | Weekly cron job that recomputes rate benchmarks from data room entries  |

---

## Consolidation Recommendations

### Merge 1: `analyze` -> single `analyze` function

**Current:** 16 separate functions
**Proposed:** 1 unified function with `{ action: "audience-overlap" | "brand-safety" | ... }`

All 16 analyze functions share this exact structure:

```
auth -> fetch entities -> build prompt -> call LLM -> return JSON
```

The only differences are (a) which entities are fetched, (b) the prompt template, and
(c) optional input parameters like `partnership_id`.

**Implementation approach:**

- Create `supabase/functions/analyze/index.ts`
- Move each function's logic into a handler file: `analyze/handlers/audience-overlap.ts`, etc.
- Route via `action` parameter in the request body
- The shared auth, CORS, and error-handling boilerplate is written once

**Cold-start savings:** 16 isolates -> 1 isolate = **15 fewer cold starts**
**Estimated latency reduction:** 15 x 200-500ms = **3-7.5 seconds of aggregate cold-start savings** across first-time invocations

---

### Merge 2: `generate*` + `predict*` + `forecast*` + `recommend*` -> single `ai-generate` function

**Current:** 11 separate functions
**Proposed:** 1 unified function with `{ action: "campaign" | "outreach" | "creative-direction" | "weekly-brief" | ... }`

Same structural pattern as the analyze functions. These all build prompts and call the LLM.

**Implementation approach:**

- Create `supabase/functions/ai-generate/index.ts`
- Handler files for each action
- Could also route through the existing `ai-router` with an `agent` parameter

**Cold-start savings:** 11 isolates -> 1 isolate = **10 fewer cold starts**

---

### Merge 3: `check*Alerts` -> single `check-alerts` function

**Current:** 4 separate functions
**Proposed:** 1 unified function with `{ alertType: "approval" | "opportunity" | "outreach" | "partnership" }`

All four check functions follow the same pattern: fetch entities, evaluate conditions,
create Notification records. They are typically called by cron jobs.

**Implementation approach:**

- Create `supabase/functions/check-alerts/index.ts`
- Handler per alert type
- Support `{ alertType: "all" }` to run all checks in a single invocation (useful for cron)

**Cold-start savings:** 4 isolates -> 1 isolate = **3 fewer cold starts**

---

### Merge 4: Stripe functions -> single `stripe` function

**Current:** 8 separate functions (addPaymentMethod, deletePaymentMethod, getInvoices,
getPaymentMethods, initializeSubscription, setupStripeConnect, upgradeSubscription,
handleStripeWebhook)

**Proposed:** 2 functions:

- `stripe` with `{ action: "add-payment-method" | "delete-payment-method" | "get-invoices" | "get-payment-methods" | "initialize-subscription" | "setup-connect" | "upgrade" }`
- `stripe-webhook` (must remain separate because it uses raw body for signature verification)

**Implementation approach:**

- Create `supabase/functions/stripe/index.ts` with action routing
- Keep `stripe-webhook` as a separate function (Stripe signature verification requires the
  raw request body before JSON parsing, which is incompatible with action routing)

**Cold-start savings:** 8 isolates -> 2 isolates = **6 fewer cold starts**

---

### Merge 5: Subscription/access functions -> fold into `stripe` or standalone `subscription`

**Current:** 2 separate functions (checkFeatureAccess, getUserSubscriptionStatus)
**Proposed:** Fold into the `stripe` handler or create a small `subscription` function

**Cold-start savings:** 2 isolates -> 0 additional isolates = **2 fewer cold starts**

---

### Merge 6: Data import functions -> single `import-data` function

**Current:** 6 separate import functions (extractAndImportIndustries, importAllCalendarData,
importAllConferences, importCultureEvents, importFullCalendarData, importIndustryGuides)

**Proposed:** 1 unified function with `{ action: "industries" | "conferences" | "culture-events" | "calendar" | "full-calendar" | "industry-guides" }`

Note: The hardcoded data sets (conferences, culture events, industry guides) should ideally
be moved to seed SQL files or a separate data package rather than living in edge function
code. That is a follow-up task.

**Cold-start savings:** 6 isolates -> 1 isolate = **5 fewer cold starts**

---

### Merge 7: Email/outreach functions -> single `email` function

**Current:** 5 separate functions (connectEmailAccount, refreshEmailToken, scanEmailForDeals,
sendOutreachEmail, sendBulkOutreach)

**Proposed:** 1 unified function with `{ action: "connect" | "refresh-token" | "scan-deals" | "send" | "send-bulk" }`

**Cold-start savings:** 5 isolates -> 1 isolate = **4 fewer cold starts**

---

### Merge 8: Export functions -> single `export-data` function

**Current:** 2 separate functions (exportEntityData, exportUserData)
**Proposed:** 1 unified function with `{ action: "entity" | "gdpr-export" }`

**Cold-start savings:** 2 isolates -> 1 isolate = **1 fewer cold start**

---

### Merge 9: AI orchestration thinning

**Current:** 5 functions (ai-router, aiCommandCenter, aiDealCoach, runAgentChain, runScheduledAgents)
**Proposed:** Keep `ai-router` as the universal entry point. Merge the other 4 into an
`ai-orchestrate` function with `{ action: "command-center" | "deal-coach" | "chain" | "scheduled" }`.

Note: `aiCommandCenter` and `aiDealCoach` are essentially specialized prompt wrappers and
could route through `ai-router` with an `agent` parameter. `runAgentChain` and
`runScheduledAgents` are orchestrators that dispatch to other functions.

**Cold-start savings:** 5 isolates -> 2 isolates = **3 fewer cold starts**

---

### Functions to Keep Separate (no merge recommended)

These functions are either unique in their integration pattern, have specific webhook
requirements, or are infrequently called admin tools where cold-start is acceptable.

| Function                | Reason to keep separate                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `ai-router`             | Core infrastructure; universal entry point; complex circuit-breaker logic |
| `handleStripeWebhook`   | Requires raw body for Stripe signature verification                       |
| `create-phyllo-token`   | Third-party SDK integration with unique auth pattern                      |
| `send-welcome-email`    | Uses Resend API; triggered by auth webhook; no shared auth pattern        |
| `deleteUserAccount`     | GDPR critical path; must be isolated for audit and safety reasons         |
| `fetchSocialMediaData`  | Multi-platform API facade with unique per-platform logic                  |
| `deduplicateIndustries` | One-time admin maintenance tool                                           |
| `manageWebhooks`        | Webhook management CRUD; unique pattern                                   |
| `processTriggerEvent`   | Real-time event processor with unique trigger config                      |
| `updateRateBenchmarks`  | Weekly cron with unique data-room aggregation logic                       |

---

## Summary: Cold-Start Savings

| Merge                         | Before | After  | Savings               |
| ----------------------------- | ------ | ------ | --------------------- |
| 1. analyze                    | 16     | 1      | **15**                |
| 2. ai-generate                | 11     | 1      | **10**                |
| 3. check-alerts               | 4      | 1      | **3**                 |
| 4. stripe                     | 8      | 2      | **6**                 |
| 5. subscription (into stripe) | 2      | 0      | **2**                 |
| 6. import-data                | 6      | 1      | **5**                 |
| 7. email                      | 5      | 1      | **4**                 |
| 8. export-data                | 2      | 1      | **1**                 |
| 9. ai-orchestrate             | 4      | 1      | **3**                 |
| Keep separate                 | 10     | 10     | 0                     |
| **TOTAL**                     | **68** | **19** | **49 fewer isolates** |

Plus the 10 kept separate = **29 total functions** (down from 76+).

**That is a 62% reduction in edge function count.**

At 200-500ms cold-start per isolate, the worst-case aggregate cold-start overhead drops from
**15.2-38 seconds** to **5.8-14.5 seconds** across all functions.

For individual user sessions (which typically touch 3-8 functions), this means the first
request in a session is more likely to hit a warm isolate because fewer isolates means
higher per-isolate invocation frequency, which keeps them warm longer.

---

## Priority Order for Consolidation

### Phase 1 -- Highest Impact (Week 1-2)

1. **Merge 1: `analyze` (16 -> 1)** -- Largest single reduction. All 16 functions are
   structurally identical. This is the easiest win with the biggest payoff.
2. **Merge 2: `ai-generate` (11 -> 1)** -- Second largest reduction. Same structural
   pattern as the analyze functions.

**Phase 1 total: 25 fewer isolates.**

### Phase 2 -- Billing & Infrastructure (Week 3)

3. **Merge 4: `stripe` (8 -> 2)** -- All Stripe calls share the SDK initialization overhead.
   Combining them means one Stripe import instead of seven.
4. **Merge 5: `subscription` (2 -> 0)** -- Trivial to fold into stripe handler.

**Phase 2 total: 8 fewer isolates.**

### Phase 3 -- Data Operations (Week 4)

5. **Merge 6: `import-data` (6 -> 1)** -- Import functions contain large hardcoded datasets
   that bloat each isolate. Consolidating means the data is loaded once.
6. **Merge 8: `export-data` (2 -> 1)** -- Small win but easy to do.

**Phase 3 total: 6 fewer isolates.**

### Phase 4 -- Operational (Week 5)

7. **Merge 3: `check-alerts` (4 -> 1)** -- Cron-triggered; consolidation simplifies the
   cron configuration from 4 jobs to 1.
8. **Merge 7: `email` (5 -> 1)** -- Email functions share OAuth refresh logic that is
   currently duplicated across functions.
9. **Merge 9: `ai-orchestrate` (4 -> 1)** -- Lower priority since these are less
   frequently called.

**Phase 4 total: 10 fewer isolates.**

---

## Migration Strategy

For each merge, follow this process:

1. Create the new unified function with action routing
2. Implement all handlers as separate files within the function directory
3. Add the new function to Supabase deployment
4. Update the frontend to call the new endpoint with the `action` parameter
5. Run both old and new functions in parallel for 1 week (shadow mode)
6. Once validated, remove the old individual functions
7. Update `runAgentChain` and `runScheduledAgents` to reference new endpoints

### Request Format Convention

All consolidated functions should accept:

```json
{
  "action": "audience-overlap",
  ...actionSpecificParams
}
```

This keeps the API surface predictable and makes it easy to add new actions without
deploying new functions.

---

## Risks and Mitigations

| Risk                                                 | Mitigation                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| Larger bundle size per isolate                       | Lazy-import handler modules; Deno tree-shakes unused code        |
| Single function failure takes down multiple features | Circuit breaker per action; structured error handling            |
| Harder to isolate function-level metrics             | Tag logs/metrics with `action` parameter for filtering           |
| Deployment rollback is coarser-grained               | Use feature flags per action; canary deployments                 |
| Memory pressure from combined handlers               | Monitor RSS; handlers are stateless and share no in-memory state |

---

## Additional Recommendations (Out of Scope for This Plan)

1. **Move hardcoded seed data out of edge functions.** Functions like `importAllConferences`,
   `importCultureEvents`, and `importIndustryGuides` contain hundreds of lines of static
   data. This should be SQL seed files or a storage bucket.

2. **Deduplicate OAuth refresh logic.** `sendOutreachEmail`, `sendBulkOutreach`,
   `scanEmailForDeals`, and `refreshEmailToken` all contain nearly identical token refresh
   code. This should be extracted into `_shared/oauth.ts`.

3. **Consider moving pure-CRUD operations to PostgREST/RPC.** Functions like
   `checkFeatureAccess` and `getUserSubscriptionStatus` are simple DB queries that could
   be Postgres functions called via `.rpc()`, eliminating the edge function entirely.

4. **Evaluate `ai-router` as the single entry point for all AI calls.** The router already
   has rate limiting, caching, and failover. Instead of 27 separate AI functions, all AI
   calls could route through `ai-router` with an `agent` parameter, reducing to just 1
   AI-related edge function.
