# DealStage Platform Documentation -- Batch 9

**Company:** DealStage (legal entity: PartnerIQ)
**URL:** thedealstage.com
**Generated:** 2026-03-29
**Deliverables in this batch:** 32, 33, 34

---

# DELIVERABLE 32: CEO KPI DASHBOARD

## Overview

This dashboard defines every metric the founder reviews to operate DealStage with precision. Each KPI has an exact calculation, a named data source, a current baseline, graduated targets, and red/yellow/green thresholds with prescribed actions. Review cadences are marked: D = daily, W = weekly, M = monthly.

---

## Section 1: Revenue Metrics (Weekly Tracking)

---

### KPI-R01: Monthly Recurring Revenue (MRR)

| Field                | Detail                                                                                                                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**       | Sum of all active subscription monthly charges as of the last day of the current month. Calculated as: (count of active Starter subscribers x $99) + (count of active Growth subscribers x $299) + (count of active Enterprise subscribers x $999) + equivalent monthly value of annual plans. Free tier excluded. |
| **Data Source**      | Stripe Dashboard > Revenue > MRR widget. Cross-check with Supabase query: `SELECT SUM(monthly_amount) FROM subscriptions WHERE status = 'active' AND tier != 'free'`                                                                                                                                               |
| **Current Baseline** | $0 — pre-launch                                                                                                                                                                                                                                                                                                    |
| **Month 3 Target**   | $9,900 (approx. 50 paid users blended at ~$198 ARPU)                                                                                                                                                                                                                                                               |
| **Month 6 Target**   | $49,800 (approx. 200 paid users blended at ~$249 ARPU)                                                                                                                                                                                                                                                             |
| **Month 12 Target**  | $299,000 (approx. 1,000 paid users blended at ~$299 ARPU)                                                                                                                                                                                                                                                          |
| **Green**            | Within 5% of monthly target                                                                                                                                                                                                                                                                                        |
| **Yellow**           | 10-20% below monthly target                                                                                                                                                                                                                                                                                        |
| **Red**              | More than 20% below monthly target OR negative MRR growth for 2+ consecutive weeks                                                                                                                                                                                                                                 |
| **Red Action**       | Immediate audit of churn events in Stripe. Interview last 5 churned customers within 48 hours. Review conversion funnel for drop-off. Assess whether pricing or onboarding is the primary lever.                                                                                                                   |

---

### KPI-R02: Annual Recurring Revenue (ARR)

| Field                | Detail                                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | MRR x 12. Used as the headline number for investor communications and benchmarking. Also computed directly from annual plan subscribers as: (annual plan total contract value / 12) x 12. |
| **Data Source**      | Derived from KPI-R01. Stripe Dashboard > Revenue > ARR widget (if enabled).                                                                                                               |
| **Current Baseline** | $0 — pre-launch                                                                                                                                                                           |
| **Month 3 Target**   | $118,800                                                                                                                                                                                  |
| **Month 6 Target**   | $597,600                                                                                                                                                                                  |
| **Month 12 Target**  | $3,588,000                                                                                                                                                                                |
| **Green**            | ARR growing >10% month-over-month                                                                                                                                                         |
| **Yellow**           | ARR growing 5-10% month-over-month                                                                                                                                                        |
| **Red**              | ARR growing <5% month-over-month or declining                                                                                                                                             |
| **Red Action**       | Decompose into new MRR vs churn MRR. If new MRR is healthy but churn is dragging ARR, focus on retention. If new MRR is low, focus on acquisition and conversion funnel.                  |

---

### KPI-R03: Net New MRR

| Field                | Detail                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | (New MRR from new subscribers this month) + (Expansion MRR from upgrades) - (Churned MRR from cancellations) - (Contraction MRR from downgrades). This is the truest measure of revenue momentum.                               |
| **Data Source**      | Stripe Dashboard > Revenue > MRR Movements. Manually cross-verified against: new subscription events + upgrade events - cancellation events - downgrade events in Stripe webhook logs stored in Supabase table `stripe_events`. |
| **Current Baseline** | $0 — pre-launch                                                                                                                                                                                                                 |
| **Month 3 Target**   | +$3,300/week average                                                                                                                                                                                                            |
| **Month 6 Target**   | +$12,450/week average                                                                                                                                                                                                           |
| **Month 12 Target**  | +$49,833/week average                                                                                                                                                                                                           |
| **Green**            | Net New MRR positive every week                                                                                                                                                                                                 |
| **Yellow**           | Net New MRR positive but below weekly target two consecutive weeks                                                                                                                                                              |
| **Red**              | Net New MRR negative (churn + contraction exceeds new + expansion)                                                                                                                                                              |
| **Red Action**       | Break down each component. If churn is dominant: activate win-back email sequence, offer pause instead of cancel. If expansion is zero: trigger in-app upgrade prompts for users hitting plan limits.                           |

---

### KPI-R04: MRR by Role

| Field                | Detail                                                                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------- | ---------------- |
| **Definition**       | MRR segmented into four role buckets: Talent MRR, Brand MRR, Agency MRR, Manager MRR. Calculated by joining Supabase `users.role` with Stripe subscription data.                                   |
| **Data Source**      | Supabase query: `SELECT users.role, SUM(subscriptions.monthly_amount) FROM subscriptions JOIN users ON subscriptions.user_id = users.id WHERE subscriptions.status = 'active' GROUP BY users.role` |
| **Current Baseline** | $0 across all roles — pre-launch                                                                                                                                                                   |
| **Month 3 Target**   | Talent: $2,970                                                                                                                                                                                     | Brand: $3,960   | Agency: $1,980  | Manager: $990    |
| **Month 6 Target**   | Talent: $14,940                                                                                                                                                                                    | Brand: $19,920  | Agency: $9,960  | Manager: $4,980  |
| **Month 12 Target**  | Talent: $89,700                                                                                                                                                                                    | Brand: $119,600 | Agency: $59,800 | Manager: $29,900 |
| **Green**            | No single role exceeds 60% of total MRR (concentration risk managed)                                                                                                                               |
| **Yellow**           | One role exceeds 60% of total MRR                                                                                                                                                                  |
| **Red**              | One role exceeds 75% of total MRR, or any role shows negative MRR growth for 2+ months                                                                                                             |
| **Red Action**       | Accelerate acquisition campaigns for underperforming roles. Review whether product value proposition is landing for the lagging role. Consider role-specific onboarding improvements.              |

---

### KPI-R05: MRR by Tier

| Field                | Detail                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ----------------------------------- |
| **Definition**       | MRR segmented by pricing tier: Free (excluded from MRR), Starter ($99/mo), Growth ($299/mo), Enterprise ($999/mo). Tracks whether users are upgrading over time.                           |
| **Data Source**      | Stripe Dashboard > Revenue breakdown by product/price. Supabase: `SELECT tier, COUNT(*) as users, SUM(monthly_amount) as mrr FROM subscriptions WHERE status='active' GROUP BY tier`       |
| **Current Baseline** | $0 — pre-launch                                                                                                                                                                            |
| **Month 3 Target**   | Starter: $6,930 (70 users)                                                                                                                                                                 | Growth: $2,392 (8 users)    | Enterprise: $598 (0.6 avg — 1 user) |
| **Month 6 Target**   | Starter: $24,750 (250 users)                                                                                                                                                               | Growth: $17,910 (60 users)  | Enterprise: $7,992 (8 users)        |
| **Month 12 Target**  | Starter: $89,100 (900 users)                                                                                                                                                               | Growth: $89,700 (300 users) | Enterprise: $119,880 (120 users)    |
| **Green**            | Growth tier users represent 20%+ of paid users by Month 6                                                                                                                                  |
| **Yellow**           | Less than 10% of paid users on Growth or Enterprise by Month 6                                                                                                                             |
| **Red**              | Less than 5% of paid users ever upgrade from Starter                                                                                                                                       |
| **Red Action**       | Audit upgrade triggers. Review whether Growth-tier features are visible and compelling in Starter UI. A/B test upgrade prompts. Add mid-cycle usage milestones that surface upgrade value. |

---

### KPI-R06: Average Revenue Per User (ARPU)

| Field                | Detail                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Total MRR divided by total paid active subscribers. Computed overall and by segment (per role, per tier). Formula: `ARPU = MRR / paid_active_users`                                                            |
| **Data Source**      | Derived from Stripe MRR and Supabase paid user count.                                                                                                                                                          |
| **Current Baseline** | $0 — pre-launch                                                                                                                                                                                                |
| **Month 3 Target**   | $198 blended ARPU                                                                                                                                                                                              |
| **Month 6 Target**   | $249 blended ARPU                                                                                                                                                                                              |
| **Month 12 Target**  | $299 blended ARPU                                                                                                                                                                                              |
| **Green**            | ARPU increasing month-over-month (expansion > contraction)                                                                                                                                                     |
| **Yellow**           | ARPU flat for 2+ consecutive months                                                                                                                                                                            |
| **Red**              | ARPU declining month-over-month                                                                                                                                                                                |
| **Red Action**       | Review tier mix. If ARPU decline is from tier mix shift downward (more Starter, fewer Growth), focus on upgrade campaigns. If ARPU decline is from discounting, review discount policy and enforce guardrails. |

---

### KPI-R07: Revenue Per Employee

| Field                | Detail                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Total ARR divided by total full-time equivalent headcount (including founder). Tracks operating leverage as team grows. Formula: `Revenue per FTE = ARR / FTE_count` |
| **Data Source**      | Derived from ARR (KPI-R02) and internal headcount tracking in the master project tracker.                                                                            |
| **Current Baseline** | $0 / 1 FTE — pre-launch                                                                                                                                              |
| **Month 3 Target**   | $118,800 (solo founder)                                                                                                                                              |
| **Month 6 Target**   | $298,800 (assuming 2 FTEs by Month 5)                                                                                                                                |
| **Month 12 Target**  | $597,000 (assuming 6 FTEs)                                                                                                                                           |
| **Green**            | Revenue per FTE > $200,000 ARR                                                                                                                                       |
| **Yellow**           | Revenue per FTE $100,000-$200,000 ARR                                                                                                                                |
| **Red**              | Revenue per FTE < $100,000 ARR when team exceeds 3 FTEs                                                                                                              |
| **Red Action**       | Pause next hire until ARR per FTE recovers. Evaluate whether current team is fully utilized. Review automation opportunities to reduce labor requirements.           |

---

## Section 2: Growth Metrics (Weekly Tracking)

---

### KPI-G01: Total Registered Users by Role

| Field                | Detail                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Count of all accounts in Supabase `users` table with `email_confirmed = true`, segmented by `role` field (talent, brand, agency, manager, admin).                                        |
| **Data Source**      | Supabase: `SELECT role, COUNT(*) FROM users WHERE email_confirmed = true GROUP BY role`                                                                                                  |
| **Current Baseline** | 0 — pre-launch                                                                                                                                                                           |
| **Month 3 Target**   | 500 total: Talent 250, Brand 150, Agency 60, Manager 40                                                                                                                                  |
| **Month 6 Target**   | 2,000 total: Talent 1,000, Brand 600, Agency 240, Manager 160                                                                                                                            |
| **Month 12 Target**  | 10,000 total: Talent 5,000, Brand 3,000, Agency 1,200, Manager 800                                                                                                                       |
| **Green**            | Week-over-week growth rate > 10%                                                                                                                                                         |
| **Yellow**           | Week-over-week growth rate 5-10%                                                                                                                                                         |
| **Red**              | Week-over-week growth rate < 5% for 3+ consecutive weeks                                                                                                                                 |
| **Red Action**       | Diagnose channel performance. Review organic search rankings, referral traffic, and paid campaign performance. Test new acquisition channels. Activate referral program if not yet live. |

---

### KPI-G02: New Signups This Week / Month

| Field                | Detail                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Count of new user registrations (email confirmed) in the trailing 7-day window and trailing 30-day window. Tracked separately for paid and free signups.                                       |
| **Data Source**      | Supabase: `SELECT COUNT(*) FROM users WHERE email_confirmed = true AND created_at >= NOW() - INTERVAL '7 days'`                                                                                |
| **Current Baseline** | 0 — pre-launch                                                                                                                                                                                 |
| **Month 3 Target**   | 75 new signups/week, 300/month                                                                                                                                                                 |
| **Month 6 Target**   | 200 new signups/week, 800/month                                                                                                                                                                |
| **Month 12 Target**  | 600 new signups/week, 2,400/month                                                                                                                                                              |
| **Green**            | Signups this week >= last week (positive momentum)                                                                                                                                             |
| **Yellow**           | Signups this week 20-40% below last week                                                                                                                                                       |
| **Red**              | Signups this week more than 40% below last week OR below 20/week in Month 3+                                                                                                                   |
| **Red Action**       | Check referral source breakdown in GA4. Identify which channels dropped. If organic dropped: SEO audit. If social dropped: post frequency review. If direct dropped: brand awareness campaign. |

---

### KPI-G03: Signup-to-Paid Conversion Rate

| Field                | Detail                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of all registered users (email confirmed) who have ever activated a paid subscription. Formula: `(total paid subscribers / total registered users) x 100`. Measured on 30-day and 90-day cohort bases.               |
| **Data Source**      | Derived from Stripe paid subscriber count and Supabase total user count.                                                                                                                                                        |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                |
| **Month 3 Target**   | 10% (50 paid / 500 registered)                                                                                                                                                                                                  |
| **Month 6 Target**   | 12% (240 paid / 2,000 registered)                                                                                                                                                                                               |
| **Month 12 Target**  | 15% (1,500 paid / 10,000 registered)                                                                                                                                                                                            |
| **Green**            | Conversion rate >= 10%                                                                                                                                                                                                          |
| **Yellow**           | Conversion rate 5-10%                                                                                                                                                                                                           |
| **Red**              | Conversion rate < 5%                                                                                                                                                                                                            |
| **Red Action**       | Audit the free-to-paid conversion funnel. Review onboarding completion rate, time-to-first-value, and upgrade prompt placement. A/B test paywall positioning and trial length. Interview recent free users who did not convert. |

---

### KPI-G04: Trial-to-Paid Conversion Rate

| Field                | Detail                                                                                                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of users who started the 7-day paid trial and converted to an active paid subscription at day 8. Formula: `(trial users who became paid / total trial starts) x 100`. Measured on 7-day and 30-day windows.                               |
| **Data Source**      | Stripe: filter subscriptions by `trial_end` events and subsequent `invoice.payment_succeeded`. Supabase: `SELECT COUNT(*) FROM subscriptions WHERE trial_end IS NOT NULL AND status = 'active'` vs total trial starts.                               |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                     |
| **Month 3 Target**   | 55%                                                                                                                                                                                                                                                  |
| **Month 6 Target**   | 65%                                                                                                                                                                                                                                                  |
| **Month 12 Target**  | 70%                                                                                                                                                                                                                                                  |
| **Green**            | Trial conversion rate >= 60%                                                                                                                                                                                                                         |
| **Yellow**           | Trial conversion rate 40-60%                                                                                                                                                                                                                         |
| **Red**              | Trial conversion rate < 40%                                                                                                                                                                                                                          |
| **Red Action**       | Audit trial engagement. Identify users who started trial but did not engage (zero AI queries, zero deals created). Trigger Day 3 and Day 6 in-app nudges and email sequences for low-engagement trial users. Review whether trial length is optimal. |

---

### KPI-G05: Free-to-Paid Conversion Rate

| Field                | Detail                                                                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of users on the free tier (active in last 30 days) who upgraded to any paid tier in a given month. Formula: `(free users who upgraded this month / total active free users at start of month) x 100`.                                                    |
| **Data Source**      | Stripe upgrade events cross-referenced with Supabase `subscriptions.tier` change log.                                                                                                                                                                               |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                    |
| **Month 3 Target**   | 8% monthly                                                                                                                                                                                                                                                          |
| **Month 6 Target**   | 10% monthly                                                                                                                                                                                                                                                         |
| **Month 12 Target**  | 12% monthly                                                                                                                                                                                                                                                         |
| **Green**            | >= 8% monthly                                                                                                                                                                                                                                                       |
| **Yellow**           | 4-8% monthly                                                                                                                                                                                                                                                        |
| **Red**              | < 4% monthly                                                                                                                                                                                                                                                        |
| **Red Action**       | Review AI limit hit rate (KPI-E07). If free users are not hitting limits, the free tier is too generous — tighten it or add friction. If they are hitting limits but not upgrading, the upgrade prompt or value proposition is failing. A/B test upgrade messaging. |

---

### KPI-G06: Viral Coefficient (K-Factor)

| Field                | Detail                                                                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Average number of new paid users generated per existing paid user through referrals. Formula: `K = (invitations sent per user) x (conversion rate of invitees)`. A K-factor > 1.0 means the product is growing purely through virality.                        |
| **Data Source**      | Supabase `referrals` table tracking referral codes, invitations sent, and resulting signups. Custom query: `SELECT AVG(referral_conversions) FROM referral_stats WHERE period = 'last_30_days'`                                                                |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                               |
| **Month 3 Target**   | 0.3 (each user generates 0.3 referrals on average)                                                                                                                                                                                                             |
| **Month 6 Target**   | 0.5                                                                                                                                                                                                                                                            |
| **Month 12 Target**  | 0.8                                                                                                                                                                                                                                                            |
| **Green**            | K >= 0.5                                                                                                                                                                                                                                                       |
| **Yellow**           | K 0.2-0.5                                                                                                                                                                                                                                                      |
| **Red**              | K < 0.2                                                                                                                                                                                                                                                        |
| **Red Action**       | Audit referral program mechanics. Ensure referral links are prominent post-signup, post-deal-creation, and in email footers. Review referral incentive — current offer may not be compelling. Test double-sided incentive (referrer + referee both get value). |

---

### KPI-G07: Organic vs Paid Acquisition Split

| Field                | Detail                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of new signups attributed to organic sources (SEO, direct, referral, word-of-mouth) vs paid sources (Google Ads, Meta Ads, sponsored content). Measured by UTM parameter tracking at signup.                                               |
| **Data Source**      | GA4 > Acquisition > Traffic Acquisition report. Supabase `users.acquisition_source` field populated from signup UTM parameters.                                                                                                                       |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                      |
| **Month 3 Target**   | 80% organic / 20% paid (lean on content and SEO early)                                                                                                                                                                                                |
| **Month 6 Target**   | 65% organic / 35% paid                                                                                                                                                                                                                                |
| **Month 12 Target**  | 50% organic / 50% paid                                                                                                                                                                                                                                |
| **Green**            | Organic >= 50% of total signups                                                                                                                                                                                                                       |
| **Yellow**           | Organic 30-50%                                                                                                                                                                                                                                        |
| **Red**              | Organic < 30% (over-reliance on paid, CAC will spike)                                                                                                                                                                                                 |
| **Red Action**       | Accelerate SEO content production. Review which blog posts are ranking and double down on that content type. Activate community strategy on Reddit and LinkedIn. Assess whether Product Hunt and partnership placements are driving referral traffic. |

---

## Section 3: Engagement Metrics (Daily Tracking)

---

### KPI-E01: Daily / Weekly / Monthly Active Users (DAU / WAU / MAU)

| Field                | Detail                                                                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| **Definition**       | DAU = unique users who performed at least one meaningful action (AI query, deal creation, match review, message sent, profile edit) in the trailing 24-hour window. WAU = same over 7 days. MAU = same over 30 days. Login alone does not count as active. |
| **Data Source**      | Supabase `user_events` table. Query: `SELECT COUNT(DISTINCT user_id) FROM user_events WHERE event_type IN ('ai_query','deal_created','match_reviewed','message_sent','profile_edited') AND created_at >= NOW() - INTERVAL '1 day'`                         |
| **Current Baseline** | 0 — pre-launch                                                                                                                                                                                                                                             |
| **Month 3 Target**   | DAU: 50                                                                                                                                                                                                                                                    | WAU: 150   | MAU: 400   |
| **Month 6 Target**   | DAU: 250                                                                                                                                                                                                                                                   | WAU: 750   | MAU: 1,800 |
| **Month 12 Target**  | DAU: 1,500                                                                                                                                                                                                                                                 | WAU: 4,500 | MAU: 9,000 |
| **Green**            | DAU/MAU ratio >= 25%                                                                                                                                                                                                                                       |
| **Yellow**           | DAU/MAU ratio 10-25%                                                                                                                                                                                                                                       |
| **Red**              | DAU/MAU ratio < 10%                                                                                                                                                                                                                                        |
| **Red Action**       | Identify which cohorts have lowest engagement. Review onboarding completion rate. Implement re-engagement email for users inactive 7+ days. Add daily digest emails showing new matches and deal activity.                                                 |

---

### KPI-E02: DAU/MAU Ratio (Stickiness)

| Field                | Detail                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**       | DAU divided by MAU expressed as a percentage. Indicates how frequently monthly active users return daily. World-class B2B SaaS targets 20-30%. Formula: `stickiness = (DAU / MAU) x 100`                                                   |
| **Data Source**      | Derived from KPI-E01.                                                                                                                                                                                                                      |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                           |
| **Month 3 Target**   | 12% (early adopter engagement)                                                                                                                                                                                                             |
| **Month 6 Target**   | 20%                                                                                                                                                                                                                                        |
| **Month 12 Target**  | 25%                                                                                                                                                                                                                                        |
| **Green**            | >= 20%                                                                                                                                                                                                                                     |
| **Yellow**           | 10-20%                                                                                                                                                                                                                                     |
| **Red**              | < 10%                                                                                                                                                                                                                                      |
| **Red Action**       | Introduce daily habit-forming features: morning match digest, deal pipeline updates, AI daily brief. Test push notifications and email digests. Review whether core workflow (deal management) is sticky enough to bring users back daily. |

---

### KPI-E03: AI Queries Per User Per Day

| Field                | Detail                                                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Total AI queries submitted across all agents divided by DAU. Tracked separately for free users (5/month cap) and paid users (unlimited or high-limit). This is the primary engagement proxy — AI usage drives perceived value and justifies subscription. Formula: `AI queries / DAU` |
| **Data Source**      | Supabase `ai_queries` table. Query: `SELECT COUNT(*) / COUNT(DISTINCT user_id) as queries_per_dau FROM ai_queries WHERE created_at >= NOW() - INTERVAL '1 day'`                                                                                                                       |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                                      |
| **Month 3 Target**   | 3.5 queries/active user/day (paid users), 0.8 queries/active user/day (free users)                                                                                                                                                                                                    |
| **Month 6 Target**   | 5.0 (paid), 1.2 (free)                                                                                                                                                                                                                                                                |
| **Month 12 Target**  | 7.0 (paid), 1.5 (free)                                                                                                                                                                                                                                                                |
| **Green**            | Paid users averaging >= 3 AI queries/day                                                                                                                                                                                                                                              |
| **Yellow**           | Paid users averaging 1-3 AI queries/day                                                                                                                                                                                                                                               |
| **Red**              | Paid users averaging < 1 AI query/day                                                                                                                                                                                                                                                 |
| **Red Action**       | Low AI usage means users are not experiencing value. Audit which AI agents are being used vs ignored. Improve discoverability of AI features in the UI. Add contextual AI suggestions on the deals and matches pages. Review whether AI output quality is meeting user expectations.  |

---

### KPI-E04: Deals Created Per User Per Week

| Field                | Detail                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**       | Average number of new deal records created per paid active user in the trailing 7-day window. Deals are the core workflow object — this metric tracks whether users are actively working the platform. Formula: `total deals created / paid WAU` |
| **Data Source**      | Supabase: `SELECT COUNT(*) FROM deals WHERE created_at >= NOW() - INTERVAL '7 days'` divided by WAU from KPI-E01.                                                                                                                                |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                 |
| **Month 3 Target**   | 2.5 deals/user/week                                                                                                                                                                                                                              |
| **Month 6 Target**   | 4.0 deals/user/week                                                                                                                                                                                                                              |
| **Month 12 Target**  | 5.5 deals/user/week                                                                                                                                                                                                                              |
| **Green**            | >= 3.0 deals/user/week                                                                                                                                                                                                                           |
| **Yellow**           | 1.5-3.0 deals/user/week                                                                                                                                                                                                                          |
| **Red**              | < 1.5 deals/user/week                                                                                                                                                                                                                            |
| **Red Action**       | Simplify deal creation flow. Review time-to-create — if it takes more than 90 seconds, it will be abandoned. Add deal templates and AI-assisted deal creation. Increase deal-related in-app coaching prompts during onboarding.                  |

---

### KPI-E05: Matches Generated Per User Per Week

| Field                | Detail                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Average number of AI-generated match recommendations surfaced per active paid user per week. This includes both brand-initiated talent searches and talent-initiated brand discovery. Formula: `total matches generated / paid WAU`      |
| **Data Source**      | Supabase `matches` table: `SELECT COUNT(*) FROM matches WHERE created_at >= NOW() - INTERVAL '7 days'` divided by paid WAU.                                                                                                              |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                         |
| **Month 3 Target**   | 8 matches/user/week                                                                                                                                                                                                                      |
| **Month 6 Target**   | 12 matches/user/week                                                                                                                                                                                                                     |
| **Month 12 Target**  | 18 matches/user/week                                                                                                                                                                                                                     |
| **Green**            | >= 10 matches/user/week with >30% click-through rate                                                                                                                                                                                     |
| **Yellow**           | 5-10 matches/user/week OR click-through rate < 20%                                                                                                                                                                                       |
| **Red**              | < 5 matches/user/week OR click-through rate < 10%                                                                                                                                                                                        |
| **Red Action**       | If match volume is low: review algorithm throughput and increase diversity of recommendations. If click-through is low: improve match card UI — better preview, clearer relevance signals. Add match quality rating to capture feedback. |

---

### KPI-E06: Average Session Duration

| Field                | Detail                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Average time from first page load to last tracked event in a user session, measured in minutes. Sessions ending in < 30 seconds excluded as bounces. Target for a productive SaaS session is 8-15 minutes.                                                             |
| **Data Source**      | GA4 > Engagement > Average session duration. Supplement with Supabase session tracking if GA4 SPA tracking is confirmed working.                                                                                                                                       |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                       |
| **Month 3 Target**   | 9 minutes average session                                                                                                                                                                                                                                              |
| **Month 6 Target**   | 12 minutes average session                                                                                                                                                                                                                                             |
| **Month 12 Target**  | 15 minutes average session                                                                                                                                                                                                                                             |
| **Green**            | Average session >= 10 minutes                                                                                                                                                                                                                                          |
| **Yellow**           | Average session 5-10 minutes                                                                                                                                                                                                                                           |
| **Red**              | Average session < 5 minutes                                                                                                                                                                                                                                            |
| **Red Action**       | Identify drop-off pages in GA4 funnel analysis. Sessions ending at dashboard indicate onboarding failure. Sessions ending at pricing indicate conversion friction. Build heatmap data (via Hotjar or Microsoft Clarity) to see where users stop scrolling or clicking. |

---

### KPI-E07: AI Limit Hit Rate

| Field                   | Detail                                                                                                                                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**          | Percentage of free-tier active users who hit the 5 AI queries/month cap in a given month. This is the primary upgrade trigger signal. Formula: `(free users who hit cap / total active free users) x 100`. Secondary metric: average day-of-month when cap is hit (earlier = higher intent). |
| **Data Source**         | Supabase: `SELECT COUNT(*) FROM users u JOIN ai_usage a ON u.id = a.user_id WHERE u.tier = 'free' AND a.monthly_queries >= 5 AND a.month = DATE_TRUNC('month', NOW())`                                                                                                                       |
| **Current Baseline**    | N/A — pre-launch                                                                                                                                                                                                                                                                             |
| **Month 3 Target**      | 35% of active free users hit cap each month                                                                                                                                                                                                                                                  |
| **Month 6 Target**      | 45%                                                                                                                                                                                                                                                                                          |
| **Month 12 Target**     | 50%                                                                                                                                                                                                                                                                                          |
| **Green**               | 35-60% of free users hitting cap (high intent pool, not too high to cause frustration)                                                                                                                                                                                                       |
| **Yellow**              | < 20% hitting cap (free tier too generous, not enough upgrade pressure)                                                                                                                                                                                                                      |
| **Red**                 | > 70% hitting cap in the first 10 days (cap too tight, causing frustration before value delivery)                                                                                                                                                                                            |
| **Red Action (Yellow)** | Reduce free tier AI query limit from 5 to 3, or add a secondary friction point (e.g., AI results watermarked unless upgraded).                                                                                                                                                               |
| **Red Action (Red)**    | Users hitting cap too fast before experiencing value will churn instead of upgrade. Extend free cap or add a one-time grace period. Review AI feature prominence during onboarding.                                                                                                          |

---

### KPI-E08: Feature Adoption by Page

| Field                | Detail                                                                                                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------ | -------------- | -------------- |
| **Definition**       | Percentage of active users who visited each key page at least once in the trailing 30 days. Key pages: Dashboard, Deals, Matches, Talent Search, Brand Discovery, AI Agents, Profile, Settings, Analytics, Billing.                                                   |
| **Data Source**      | GA4 > Pages and Screens report. Supabase `page_views` table for authenticated pages.                                                                                                                                                                                  |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                      |
| **Month 3 Target**   | Dashboard: 90%                                                                                                                                                                                                                                                        | Deals: 70% | Matches: 65% | AI Agents: 50% | Analytics: 30% |
| **Month 6 Target**   | Dashboard: 95%                                                                                                                                                                                                                                                        | Deals: 80% | Matches: 75% | AI Agents: 65% | Analytics: 45% |
| **Month 12 Target**  | Dashboard: 98%                                                                                                                                                                                                                                                        | Deals: 88% | Matches: 82% | AI Agents: 75% | Analytics: 60% |
| **Green**            | Core pages (Dashboard, Deals, Matches) > 70% adoption                                                                                                                                                                                                                 |
| **Yellow**           | Any core page < 50% adoption                                                                                                                                                                                                                                          |
| **Red**              | Any core page < 30% adoption after Month 3                                                                                                                                                                                                                            |
| **Red Action**       | For low-adoption core pages: audit navigation placement, add onboarding tooltips, include the page in the Day 1 activation checklist. For low AI Agents adoption specifically: add contextual prompts on the Deals and Matches pages offering relevant AI assistance. |

---

## Section 4: Retention Metrics (Monthly Tracking)

---

### KPI-RET01: Logo Churn Rate

| Field                | Detail                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**       | Percentage of paying customers (logos/accounts) who cancelled their subscription in a given month. Formula: `(customers who cancelled this month / customers at start of month) x 100`                                                     |
| **Data Source**      | Stripe: filter `customer.subscription.deleted` events for the month. Supabase: `SELECT COUNT(*) FROM subscriptions WHERE status = 'canceled' AND canceled_at >= DATE_TRUNC('month', NOW())`                                                |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                           |
| **Month 3 Target**   | < 8% monthly churn (early churn always higher as product-market fit is discovered)                                                                                                                                                         |
| **Month 6 Target**   | < 5% monthly churn                                                                                                                                                                                                                         |
| **Month 12 Target**  | < 3% monthly churn                                                                                                                                                                                                                         |
| **Green**            | <= 3% monthly logo churn                                                                                                                                                                                                                   |
| **Yellow**           | 3-7% monthly logo churn                                                                                                                                                                                                                    |
| **Red**              | > 7% monthly logo churn                                                                                                                                                                                                                    |
| **Red Action**       | Activate exit survey on all cancellation flows. Within 24 hours, personally email every churned customer. Classify all churn into: price, feature gap, competitor, no need, too complex. Address top churn reason within one sprint cycle. |

---

### KPI-RET02: Revenue Churn Rate

| Field                | Detail                                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of MRR lost from cancellations and downgrades in a given month, excluding expansion revenue. Formula: `(MRR lost from cancellations + MRR lost from downgrades) / MRR at start of month x 100`                                                                     |
| **Data Source**      | Stripe MRR Movements report: `Churned MRR + Contraction MRR / Starting MRR`.                                                                                                                                                                                                  |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                              |
| **Month 3 Target**   | < 10% monthly revenue churn                                                                                                                                                                                                                                                   |
| **Month 6 Target**   | < 6% monthly revenue churn                                                                                                                                                                                                                                                    |
| **Month 12 Target**  | < 3% monthly revenue churn                                                                                                                                                                                                                                                    |
| **Green**            | <= 3% monthly revenue churn                                                                                                                                                                                                                                                   |
| **Yellow**           | 3-7% monthly revenue churn                                                                                                                                                                                                                                                    |
| **Red**              | > 7% monthly revenue churn                                                                                                                                                                                                                                                    |
| **Red Action**       | Revenue churn higher than logo churn indicates high-value customers are leaving. Prioritize retention of Enterprise and Growth tier customers. Assign manual outreach to any Enterprise customer who cancels — offer quarterly business review before cancellation completes. |

---

### KPI-RET03: Net Revenue Retention (NRR)

| Field                | Detail                                                                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Measures expansion minus churn within the existing customer base. Formula: `NRR = (Starting MRR + Expansion MRR - Churn MRR - Contraction MRR) / Starting MRR x 100`. An NRR > 100% means existing customers are generating more revenue than last month even without new customer acquisition. Target > 110% for healthy SaaS. |
| **Data Source**      | Stripe MRR Movements: Starting MRR + New MRR - Churned MRR - Contraction MRR + Expansion MRR. NRR = (Starting + Expansion - Churn - Contraction) / Starting.                                                                                                                                                                    |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                                                                                |
| **Month 3 Target**   | 95% (slight negative while finding PMF)                                                                                                                                                                                                                                                                                         |
| **Month 6 Target**   | 102%                                                                                                                                                                                                                                                                                                                            |
| **Month 12 Target**  | 110%                                                                                                                                                                                                                                                                                                                            |
| **Green**            | NRR >= 100%                                                                                                                                                                                                                                                                                                                     |
| **Yellow**           | NRR 90-100%                                                                                                                                                                                                                                                                                                                     |
| **Red**              | NRR < 90%                                                                                                                                                                                                                                                                                                                       |
| **Red Action**       | Below 90% NRR means the business is shrinking even before accounting for new customers. This is an existential signal. Immediately review all expansion triggers: are users being offered relevant upgrades? Is the product delivering enough value to justify continued spend?                                                 |

---

### KPI-RET04: Cohort Retention Curves

| Field                         | Detail                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**                | For each monthly signup cohort, track what percentage of paid users remain active (not cancelled) at Month 1, 3, 6, and 12 post-signup. Month 0 = 100% by definition. This is the gold standard retention view.                                                                           |
| **Data Source**               | Supabase cohort query: `SELECT DATE_TRUNC('month', first_paid_at) as cohort, months_since_first_paid, COUNT(*) as retained FROM cohort_view GROUP BY 1,2 ORDER BY 1,2`. View must join subscriptions with cancellation timestamps.                                                        |
| **Current Baseline**          | N/A — pre-launch (first cohort data available Month 2)                                                                                                                                                                                                                                    |
| **Month 1 Retention Target**  | 80% (of Month 0 paid users still active)                                                                                                                                                                                                                                                  |
| **Month 3 Retention Target**  | 65%                                                                                                                                                                                                                                                                                       |
| **Month 6 Retention Target**  | 55%                                                                                                                                                                                                                                                                                       |
| **Month 12 Retention Target** | 40%                                                                                                                                                                                                                                                                                       |
| **Green**                     | Month 3 cohort retention >= 65%                                                                                                                                                                                                                                                           |
| **Yellow**                    | Month 3 cohort retention 50-65%                                                                                                                                                                                                                                                           |
| **Red**                       | Month 3 cohort retention < 50%                                                                                                                                                                                                                                                            |
| **Red Action**                | Month 1 drop-off is an onboarding problem — fix activation sequence. Month 3 drop-off is a feature/value problem — audit whether users have achieved meaningful outcomes. Month 6+ drop-off is often competitive — review whether competitors have shipped features that DealStage lacks. |

---

### KPI-RET05: Churn Reason Classification

| Field                  | Detail                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**         | Categorized exit survey results for all cancellations. Categories: (1) Price too high, (2) Missing feature, (3) Switched to competitor, (4) No longer need the product, (5) Too complex to use, (6) Poor AI quality, (7) Other. Track monthly distribution.                                                                                      |
| **Data Source**        | In-app cancellation flow exit survey (built in Stripe cancellation flow or custom Supabase form). Monthly manual compilation into Google Sheet until volume justifies automation.                                                                                                                                                                |
| **Current Baseline**   | N/A — pre-launch                                                                                                                                                                                                                                                                                                                                 |
| **Month 3 Target**     | < 30% price-related churn (price is positioned correctly)                                                                                                                                                                                                                                                                                        |
| **Month 6 Target**     | < 20% price-related churn, < 10% complexity-related churn                                                                                                                                                                                                                                                                                        |
| **Month 12 Target**    | Competitor churn < 15%, feature churn < 20%                                                                                                                                                                                                                                                                                                      |
| **Green**              | No single category exceeds 35% of total churn                                                                                                                                                                                                                                                                                                    |
| **Yellow**             | One category exceeds 35%                                                                                                                                                                                                                                                                                                                         |
| **Red**                | One category exceeds 50%                                                                                                                                                                                                                                                                                                                         |
| **Red Action (Price)** | Test offering pause (not cancel), introduce annual plan discount at cancellation moment. If price is still the primary driver after 3 months, reassess Starter tier pricing. Red Action (Feature): Prioritize most-requested missing features in next sprint. Red Action (Complexity): Add onboarding coach, video tutorials, live chat support. |

---

## Section 5: Unit Economics (Monthly Tracking)

---

### KPI-UE01: Customer Acquisition Cost (CAC) by Channel

| Field                | Detail                                                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------- |
| **Definition**       | Total sales and marketing spend attributed to a channel divided by new paid customers acquired from that channel in the same month. Formula: `CAC = channel marketing spend / new paid customers from channel`. Blended CAC = total sales + marketing spend / all new paid customers. |
| **Data Source**      | Channel spend from credit card statements and ad platform dashboards (Google Ads, Meta Ads Manager). New paid customer attribution from Supabase `users.acquisition_source` UTM data joined with Stripe first payment.                                                                |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                                      |
| **Month 3 Target**   | Blended CAC < $150                                                                                                                                                                                                                                                                    | Organic CAC < $30 | Paid CAC < $300 |
| **Month 6 Target**   | Blended CAC < $120                                                                                                                                                                                                                                                                    | Organic CAC < $25 | Paid CAC < $250 |
| **Month 12 Target**  | Blended CAC < $100                                                                                                                                                                                                                                                                    | Organic CAC < $20 | Paid CAC < $200 |
| **Green**            | Blended CAC < $150                                                                                                                                                                                                                                                                    |
| **Yellow**           | Blended CAC $150-$300                                                                                                                                                                                                                                                                 |
| **Red**              | Blended CAC > $300                                                                                                                                                                                                                                                                    |
| **Red Action**       | Pause or reduce spend on channels with CAC > $400. Double down on channels with CAC < $100. Review conversion funnel — high CAC often indicates a broken post-click experience, not a broken ad.                                                                                      |

---

### KPI-UE02: Lifetime Value (LTV) by Segment

| Field                | Detail                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------- |
| **Definition**       | Predicted total gross margin contribution of a customer over their entire relationship with DealStage. Formula: `LTV = ARPU x Gross Margin % x (1 / Monthly Churn Rate)`. Calculated per role and per tier segment. |
| **Data Source**      | Derived from ARPU (KPI-R06), gross margin per tier (KPI-UE05), and logo churn rate (KPI-RET01).                                                                                                                     |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                    |
| **Month 3 Target**   | Starter LTV: $1,100                                                                                                                                                                                                 | Growth LTV: $4,200 | Enterprise LTV: $18,000 |
| **Month 6 Target**   | Starter LTV: $1,600                                                                                                                                                                                                 | Growth LTV: $6,000 | Enterprise LTV: $26,000 |
| **Month 12 Target**  | Starter LTV: $2,500                                                                                                                                                                                                 | Growth LTV: $9,000 | Enterprise LTV: $38,000 |
| **Green**            | LTV increasing quarter-over-quarter due to churn reduction                                                                                                                                                          |
| **Yellow**           | LTV flat for 2+ consecutive months                                                                                                                                                                                  |
| **Red**              | LTV declining (driven by churn rate increase or ARPU decline)                                                                                                                                                       |
| **Red Action**       | Decompose: if churn rate increased, activate retention programs. If ARPU declined, review tier mix and expansion motion.                                                                                            |

---

### KPI-UE03: LTV:CAC Ratio

| Field                | Detail                                                                                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Ratio of customer lifetime value to customer acquisition cost. The single most important unit economics metric. Target > 3:1 for SaaS viability. Formula: `LTV:CAC = LTV / CAC`. Above 5:1 typically means underinvestment in growth.                                |
| **Data Source**      | Derived from KPI-UE02 (LTV) and KPI-UE01 (CAC).                                                                                                                                                                                                                      |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                     |
| **Month 3 Target**   | 4:1 blended (aggressive target for early stage)                                                                                                                                                                                                                      |
| **Month 6 Target**   | 5:1 blended                                                                                                                                                                                                                                                          |
| **Month 12 Target**  | 6:1 blended                                                                                                                                                                                                                                                          |
| **Green**            | LTV:CAC >= 3:1                                                                                                                                                                                                                                                       |
| **Yellow**           | LTV:CAC 2:1 to 3:1                                                                                                                                                                                                                                                   |
| **Red**              | LTV:CAC < 2:1                                                                                                                                                                                                                                                        |
| **Red Action**       | A ratio below 2:1 means the business model may not be viable at scale. Simultaneously pursue: CAC reduction (shift to organic, improve conversion rate) and LTV improvement (reduce churn, increase ARPU). Do not scale paid acquisition until ratio returns to 3:1. |

---

### KPI-UE04: CAC Payback Period

| Field                | Detail                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Number of months required to recover CAC from gross margin generated by the customer. Formula: `Payback Period (months) = CAC / (ARPU x Gross Margin %)`. Target < 12 months for healthy SaaS.                                           |
| **Data Source**      | Derived from KPI-UE01, KPI-R06, and KPI-UE05.                                                                                                                                                                                            |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                         |
| **Month 3 Target**   | < 10 months blended                                                                                                                                                                                                                      |
| **Month 6 Target**   | < 8 months blended                                                                                                                                                                                                                       |
| **Month 12 Target**  | < 6 months blended                                                                                                                                                                                                                       |
| **Green**            | Payback period <= 9 months                                                                                                                                                                                                               |
| **Yellow**           | Payback period 9-15 months                                                                                                                                                                                                               |
| **Red**              | Payback period > 15 months                                                                                                                                                                                                               |
| **Red Action**       | Long payback periods strain cash flow. Options: (1) Increase ARPU through upsell, (2) Reduce CAC through organic channel investment, (3) Offer annual plan incentives to accelerate cash collection and reduce effective payback period. |

---

### KPI-UE05: Gross Margin Per Tier

| Field                | Detail                                                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------- |
| **Definition**       | Revenue minus direct cost of goods sold (COGS) per tier per month. COGS for DealStage includes: AI API costs (Claude + GPT-4o-mini), Supabase database costs, Vercel compute, and Resend email costs allocated per user. Formula: `Gross Margin % = (Revenue - COGS) / Revenue x 100` |
| **Data Source**      | Revenue from Stripe per tier. COGS allocation: AI cost per query (tracked in KPI-UE06) x average queries per tier user, plus infrastructure cost divided by user count. Monthly P&L spreadsheet.                                                                                      |
| **Current Baseline** | N/A — pre-launch. Infrastructure baseline: $214-$575/mo total.                                                                                                                                                                                                                        |
| **Month 3 Target**   | Starter: 78%                                                                                                                                                                                                                                                                          | Growth: 82% | Enterprise: 85% |
| **Month 6 Target**   | Starter: 80%                                                                                                                                                                                                                                                                          | Growth: 84% | Enterprise: 87% |
| **Month 12 Target**  | Starter: 82%                                                                                                                                                                                                                                                                          | Growth: 86% | Enterprise: 88% |
| **Green**            | All tiers >= 75% gross margin                                                                                                                                                                                                                                                         |
| **Yellow**           | Any tier 65-75% gross margin                                                                                                                                                                                                                                                          |
| **Red**              | Any tier < 65% gross margin                                                                                                                                                                                                                                                           |
| **Red Action**       | If AI costs are compressing margins: review prompt efficiency, implement response caching for common queries, audit which AI agents are expensive vs cheap. Consider tiered AI model routing (GPT-4o-mini for lightweight tasks, Claude only for complex reasoning).                  |

---

### KPI-UE06: AI Cost Per User Per Month

| Field                | Detail                                                                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Total AI API costs (Anthropic + OpenAI invoices) for the month divided by total paid active users. Tracked separately by model (Claude Sonnet 4 vs GPT-4o-mini) and by agent type. Formula: `AI cost per user = (Anthropic monthly invoice + OpenAI monthly invoice) / paid MAU`         |
| **Data Source**      | Anthropic console usage dashboard. OpenAI usage dashboard. Supabase `ai_costs` table if per-query cost logging is implemented. Monthly allocation to P&L.                                                                                                                                |
| **Current Baseline** | $0 — pre-launch. Estimated at $2-$8/user/month based on query projections.                                                                                                                                                                                                               |
| **Month 3 Target**   | < $6/user/month                                                                                                                                                                                                                                                                          |
| **Month 6 Target**   | < $5/user/month (optimization and caching improving efficiency)                                                                                                                                                                                                                          |
| **Month 12 Target**  | < $4/user/month                                                                                                                                                                                                                                                                          |
| **Green**            | < $5/user/month                                                                                                                                                                                                                                                                          |
| **Yellow**           | $5-$10/user/month                                                                                                                                                                                                                                                                        |
| **Red**              | > $10/user/month                                                                                                                                                                                                                                                                         |
| **Red Action**       | Audit the most expensive AI agents. Implement semantic caching (store AI responses for similar queries). Review whether long context windows are being used unnecessarily. Optimize system prompts for token efficiency. Consider moving lighter agent tasks to GPT-4o-mini exclusively. |

---

## Section 6: Product Health (Weekly Tracking)

---

### KPI-PH01: Error Rate

| Field                | Detail                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of all API requests and page loads that result in an unhandled error (5xx server error or tracked client-side exception). Formula: `error rate = (error events / total events) x 100`. Measured over trailing 24 hours and 7-day rolling average.      |
| **Data Source**      | Sentry Dashboard > Issues > Error Rate. Vercel Functions logs for server-side errors. Sentry performance monitoring for client-side.                                                                                                                              |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                  |
| **Month 3 Target**   | < 0.5% error rate                                                                                                                                                                                                                                                 |
| **Month 6 Target**   | < 0.2% error rate                                                                                                                                                                                                                                                 |
| **Month 12 Target**  | < 0.1% error rate                                                                                                                                                                                                                                                 |
| **Green**            | Error rate <= 0.3%                                                                                                                                                                                                                                                |
| **Yellow**           | Error rate 0.3-1.0%                                                                                                                                                                                                                                               |
| **Red**              | Error rate > 1.0%                                                                                                                                                                                                                                                 |
| **Red Action**       | Immediately triage Sentry alert. Identify whether error is isolated (one user, one browser, one action) or systemic (affecting all users). Systemic errors above 2% require immediate hotfix deployment. Notify affected users via status page within 30 minutes. |

---

### KPI-PH02: P95 API Latency

| Field                | Detail                                                                                                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Definition**       | The 95th percentile response time for all API requests — meaning 95% of requests complete faster than this value. Non-AI endpoints target < 500ms. AI agent endpoints target < 8 seconds (due to LLM inference time).                                                 |
| **Data Source**      | Vercel Analytics > Functions tab > P95 latency. Sentry Performance Monitoring. Custom latency logging in Supabase `api_logs` table if implemented.                                                                                                                    |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                      |
| **Month 3 Target**   | Non-AI P95 < 600ms                                                                                                                                                                                                                                                    | AI endpoint P95 < 10 seconds |
| **Month 6 Target**   | Non-AI P95 < 400ms                                                                                                                                                                                                                                                    | AI endpoint P95 < 8 seconds  |
| **Month 12 Target**  | Non-AI P95 < 300ms                                                                                                                                                                                                                                                    | AI endpoint P95 < 6 seconds  |
| **Green**            | Non-AI P95 <= 500ms AND AI P95 <= 8 seconds                                                                                                                                                                                                                           |
| **Yellow**           | Non-AI P95 500ms-1s OR AI P95 8-15 seconds                                                                                                                                                                                                                            |
| **Red**              | Non-AI P95 > 1 second OR AI P95 > 15 seconds                                                                                                                                                                                                                          |
| **Red Action**       | Profile the slowest endpoints. Non-AI latency issues often indicate unoptimized Supabase queries (missing indexes) or large payload sizes. AI latency issues may require streaming responses, async queuing, or switching to faster models for preliminary responses. |

---

### KPI-PH03: Platform Uptime

| Field                | Detail                                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Percentage of time in a given month that all critical platform functions (login, dashboard, deal management, AI queries) are accessible and responding correctly. Measured via external uptime monitoring pinging the platform every 60 seconds.                        |
| **Data Source**      | UptimeRobot or BetterUptime monitoring dashboard. Vercel status page.                                                                                                                                                                                                   |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                                        |
| **Month 3 Target**   | 99.5% uptime (allows ~3.6 hours downtime/month)                                                                                                                                                                                                                         |
| **Month 6 Target**   | 99.8% uptime (allows ~1.5 hours downtime/month)                                                                                                                                                                                                                         |
| **Month 12 Target**  | 99.9% uptime (allows ~44 minutes downtime/month)                                                                                                                                                                                                                        |
| **Green**            | >= 99.8%                                                                                                                                                                                                                                                                |
| **Yellow**           | 99.0-99.8%                                                                                                                                                                                                                                                              |
| **Red**              | < 99.0%                                                                                                                                                                                                                                                                 |
| **Red Action**       | Any outage > 15 minutes requires: (1) immediate status page update, (2) email to all active users within 30 minutes, (3) post-incident review within 24 hours documenting root cause and prevention measures. SLA credit policy must be documented in Terms of Service. |

---

### KPI-PH04: Support Tickets Per 100 Users

| Field                | Detail                                                                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Number of support tickets opened (via in-app chat, email, or help form) per 100 active users per month. High ticket volume indicates UX friction or product bugs. Target is < 5 tickets per 100 users/month as the platform matures.                      |
| **Data Source**      | Intercom or Crisp dashboard for ticket counts. Divided by MAU from KPI-E01.                                                                                                                                                                               |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                          |
| **Month 3 Target**   | < 12 tickets per 100 users (expected higher during early adoption)                                                                                                                                                                                        |
| **Month 6 Target**   | < 8 tickets per 100 users                                                                                                                                                                                                                                 |
| **Month 12 Target**  | < 5 tickets per 100 users                                                                                                                                                                                                                                 |
| **Green**            | <= 6 tickets per 100 users                                                                                                                                                                                                                                |
| **Yellow**           | 6-12 tickets per 100 users                                                                                                                                                                                                                                |
| **Red**              | > 12 tickets per 100 users                                                                                                                                                                                                                                |
| **Red Action**       | Classify all tickets into categories weekly (billing, bug, how-to, feature request). If "how-to" tickets dominate: build self-serve help content for the top 5 questions. If bug tickets dominate: treat as KPI-PH01 signal and accelerate bug fix cycle. |

---

### KPI-PH05: Net Promoter Score (NPS)

| Field                | Detail                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Single-question survey ("How likely are you to recommend DealStage to a colleague? 0-10") sent to all paid users at the 30-day mark and every 90 days thereafter. NPS = % Promoters (9-10) - % Detractors (0-6). Score range: -100 to +100. |
| **Data Source**      | In-app NPS survey (Delighted, Typeform, or custom Supabase-backed form). Results stored in Supabase `nps_responses` table.                                                                                                                  |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                            |
| **Month 3 Target**   | NPS >= 30                                                                                                                                                                                                                                   |
| **Month 6 Target**   | NPS >= 40                                                                                                                                                                                                                                   |
| **Month 12 Target**  | NPS >= 50                                                                                                                                                                                                                                   |
| **Green**            | NPS >= 40                                                                                                                                                                                                                                   |
| **Yellow**           | NPS 20-40                                                                                                                                                                                                                                   |
| **Red**              | NPS < 20                                                                                                                                                                                                                                    |
| **Red Action**       | Within 24 hours, personally respond to all Detractor responses (score 0-6). Ask one follow-up question: "What would make DealStage a 9 or 10 for you?" Compile Detractor feedback monthly and treat top themes as P1 product issues.        |

---

### KPI-PH06: Feature Request Velocity

| Field                | Detail                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**       | Number of unique feature requests submitted by users per month, grouped by theme. Tracks whether user demand is shifting and which capabilities are most requested. Secondary metric: average upvotes per request (to rank by community demand).  |
| **Data Source**      | In-app feedback widget linked to Canny.io or a Supabase-backed feature request table. Manual compilation from support tickets, NPS follow-ups, and direct user conversations.                                                                     |
| **Current Baseline** | N/A — pre-launch                                                                                                                                                                                                                                  |
| **Month 3 Target**   | 15-30 unique requests/month (healthy engagement signal)                                                                                                                                                                                           |
| **Month 6 Target**   | 40-80 requests/month with voting mechanism active                                                                                                                                                                                                 |
| **Month 12 Target**  | 100+ requests/month, top 10 requests integrated into roadmap within 90 days                                                                                                                                                                       |
| **Green**            | Top-requested features are on the published roadmap                                                                                                                                                                                               |
| **Yellow**           | Feature requests growing faster than sprint capacity to address them                                                                                                                                                                              |
| **Red**              | Top 3 most-requested features are not planned and not communicated to users                                                                                                                                                                       |
| **Red Action**       | Publish a public roadmap update within the current month addressing the top 5 requests. Even if a feature will not be built, communicate this to avoid user frustration. Missing communication on feature requests is a preventable churn driver. |

---

# DELIVERABLE 33: MASTER PROJECT TRACKER

## Overview

This tracker covers all active workstreams across DealStage. Priority scale: P0 = must complete before launch, P1 = complete within 30 days of launch, P2 = complete within 90 days, P3 = nice-to-have this year. Effort: S = 1-4 hours, M = 4-16 hours, L = 16-40 hours, XL = 40+ hours. Timeline references: L-14 = 14 days before launch, L-day = launch day, L+7 = 7 days after launch.

---

## Workstream 1: Product Development

### Feature Backlog

| ID      | Title                              | Description                                                                                                                                                                                                                                      | Priority | Effort | Impact         | Status      | Assignee | Due   |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------ | -------------- | ----------- | -------- | ----- |
| PRJ-001 | AI Match Explanation Cards         | Show users a plain-English explanation of why each match was generated — niche fit score, audience overlap, engagement rating. Increases trust in AI recommendations and reduces match rejection rate.                                           | P0       | M      | Engagement     | In Progress | Founder  | L-7   |
| PRJ-002 | Deal Pipeline Kanban View          | Add a drag-and-drop Kanban board view to the deals page so users can visually manage deals across stages (Prospecting, Outreach, Negotiation, Contracted, Complete).                                                                             | P0       | L      | Engagement     | In Progress | Founder  | L-7   |
| PRJ-003 | Stripe Annual Plan Toggle          | Add annual billing option to pricing page and checkout flow with 20% discount. Required for improving cash flow and LTV. Must update Stripe products, checkout session logic, and Supabase subscription records.                                 | P0       | M      | Revenue        | Not Started | Founder  | L-7   |
| PRJ-004 | Onboarding Checklist Widget        | Persistent sidebar widget on dashboard showing completion progress through 8 onboarding steps (profile complete, first match, first deal, first AI query, invite team member, connect calendar, set notification preferences, review analytics). | P0       | M      | Retention      | Not Started | Founder  | L-7   |
| PRJ-005 | hCaptcha on Signup Form            | Integrate hCaptcha on the registration form to block bot signups that inflate user counts and consume free AI quota. Configure threshold and verify server-side token validation.                                                                | P0       | S      | Product Health | Not Started | Founder  | L-14  |
| PRJ-006 | SPA Pre-rendering for SEO          | Configure pre-rendering or SSR for key public pages (homepage, pricing, talent types, feature pages, blog) to ensure search engines can index content. Evaluate Vercel's built-in SSR or react-snap for static pre-rendering.                    | P0       | L      | Growth         | In Progress | Founder  | L-14  |
| PRJ-007 | GA4 Event Tracking Audit           | Audit all GA4 event implementations for the SPA. Verify that page views fire on route changes, key events (signup, upgrade, AI query, deal created) are tracked, and conversion goals are configured.                                            | P0       | M      | Growth         | Not Started | Founder  | L-14  |
| PRJ-008 | Stripe Live Mode Activation        | Switch Stripe integration from test mode to live mode. Verify webhook endpoints, update environment variables in Vercel, test end-to-end payment flow with a real card, confirm subscription creation writes correctly to Supabase.              | P0       | M      | Revenue        | Not Started | Founder  | L-7   |
| PRJ-009 | Cancellation Exit Survey           | Build an exit survey into the Stripe cancellation flow or as a modal before subscription cancellation completes. Capture: reason (dropdown), additional comments (optional text), and whether a pause would help.                                | P0       | S      | Retention      | Not Started | Founder  | L-day |
| PRJ-010 | NPS Survey Trigger (30-day)        | Implement automated NPS survey trigger: 30 days after first paid subscription activation, send in-app modal and email survey. Store results in Supabase `nps_responses`.                                                                         | P1       | M      | Retention      | Not Started | Founder  | L+14  |
| PRJ-011 | Referral Program Infrastructure    | Build referral tracking: unique referral link per user, track clicks and signups via referral code, credit referrer with $25 account credit when referee converts to paid. Supabase `referrals` table + Stripe credit logic.                     | P1       | L      | Growth         | Not Started | Founder  | L+30  |
| PRJ-012 | Advanced Talent Search Filters     | Add filter dimensions to talent search: engagement rate range, audience age bracket, location (country/city), follower count range, content category, platform specialization. Current search is too broad.                                      | P1       | L      | Engagement     | Not Started | Founder  | L+30  |
| PRJ-013 | AI Proposal Generator              | New AI agent: given a deal record and talent profile, generate a customized partnership proposal document (PDF-ready) with campaign overview, deliverables, timeline, and suggested fee range.                                                   | P1       | XL     | Revenue        | Not Started | Founder  | L+45  |
| PRJ-014 | Team Member Invitations            | Allow Agency and Brand users on Growth and Enterprise tiers to invite team members to their workspace. Requires multi-user workspace model, role-based permissions within workspace, and invitation email flow.                                  | P1       | XL     | Revenue        | Not Started | Founder  | L+45  |
| PRJ-015 | In-app Messaging (Brand-Talent)    | Direct messaging between brands and talent within the platform to keep deal conversations inside DealStage rather than moving to email. Requires Supabase real-time subscriptions and message storage.                                           | P1       | XL     | Engagement     | Not Started | Founder  | L+60  |
| PRJ-016 | Analytics Dashboard for Brands     | Dedicated analytics view for Brand users showing: deals by stage, total deal value in pipeline, top talent by engagement rate, campaign ROI calculator, AI query usage.                                                                          | P2       | L      | Retention      | Not Started | Founder  | L+60  |
| PRJ-017 | Zapier Integration (Outbound)      | Publish a DealStage Zapier app with triggers: new deal created, deal stage changed, new match generated. Enables users to connect DealStage to HubSpot, Slack, Airtable, Google Sheets automatically.                                            | P2       | XL     | Revenue        | Not Started | Founder  | L+90  |
| PRJ-018 | Mobile-Responsive PWA Improvements | Audit and fix all mobile responsiveness issues across the app. Identify the 10 pages with worst mobile experience, prioritize Deals and Dashboard. Consider publishing as a PWA for home screen installation.                                    | P2       | L      | Engagement     | Not Started | Founder  | L+60  |
| PRJ-019 | Talent Performance Analytics       | For talent users: show analytics on profile views, match requests received, deal acceptance rate, average deal value, and brand categories showing interest. Gives talent users a reason to log in daily.                                        | P2       | L      | Engagement     | Not Started | Founder  | L+75  |
| PRJ-020 | Contract Template Library          | Library of 10 partnership contract templates (sponsored post, ambassador deal, affiliate agreement, usage rights, exclusivity agreement, etc.) that users can customize and send for e-signature via DocuSign or Dropbox Sign API.               | P2       | XL     | Revenue        | Not Started | Founder  | L+90  |

---

### Bug Backlog

| ID      | Title                                              | Description                                                                                                                                                                              | Priority | Status      | Effort | Due  |
| ------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------ | ---- |
| PRJ-B01 | Free Tier AI Counter Reset                         | AI query counter for free users does not reset on the 1st of each month in some timezone edge cases. Caused by UTC vs local timezone mismatch in Supabase RPC.                           | P0       | In Progress | S      | L-14 |
| PRJ-B02 | Stripe Webhook Race Condition                      | Occasional duplicate subscription records created in Supabase when Stripe sends multiple webhook events for the same subscription within 2 seconds. Add idempotency key check.           | P0       | Not Started | M      | L-7  |
| PRJ-B03 | Profile Image Upload >5MB Fails Silently           | Images larger than 5MB fail upload without user-facing error message. Add client-side size validation before upload attempt and display actionable error.                                | P1       | Not Started | S      | L-7  |
| PRJ-B04 | Match Page Infinite Scroll Breaks on Filter Change | Changing any filter on the matches page while scrolled down causes duplicate results on reload. Reset scroll position and clear results array on filter state change.                    | P1       | Not Started | M      | L+7  |
| PRJ-B05 | Email Notification Preferences Not Persisting      | Users who disable email notifications find them re-enabled after logging out and back in. Preferences not being saved to Supabase correctly — reading default values on session restore. | P1       | Not Started | S      | L+7  |

---

### Technical Debt

| ID      | Title                           | Description                                                                                                                                                                          | Priority | Effort | Due  |
| ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------ | ---- |
| PRJ-T01 | Consolidate Edge Functions      | 12 overlapping Supabase Edge Functions identified in audit. Consolidate into 6 as documented in EDGE_FUNCTION_CONSOLIDATION.md. Reduces cold start latency and maintenance burden.   | P1       | L      | L+30 |
| PRJ-T02 | Standardize Error Handling      | Inconsistent error handling across API routes — some return raw Supabase errors, others return generic 500s. Implement a unified `AppError` class and error formatting middleware.   | P1       | M      | L+30 |
| PRJ-T03 | Add Database Indexes for Search | Supabase `talent_profiles` table missing composite indexes on `(niche, follower_count, engagement_rate)`. Search queries taking 800ms+ on large datasets. Add indexes and benchmark. | P0       | S      | L-7  |
| PRJ-T04 | Environment Variable Audit      | Confirm all production environment variables are set in Vercel production environment (not just preview). Document all required env vars in README with descriptions.                | P0       | S      | L-7  |
| PRJ-T05 | Remove Console.log Statements   | Development console.log statements remaining in production build. Run ESLint `no-console` rule, remove all logs, replace with structured logging to Sentry.                          | P1       | S      | L-7  |

---

### Infrastructure Improvements

| ID      | Title                               | Description                                                                                                                                                                                  | Priority | Effort | Due  |
| ------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ---- |
| PRJ-I01 | External Uptime Monitoring          | Configure UptimeRobot or BetterUptime to ping thedealstage.com and 3 critical API endpoints every 60 seconds. Set up PagerDuty or SMS alerting for any downtime > 2 minutes.                 | P0       | S      | L-7  |
| PRJ-I02 | Sentry Error Alerting Rules         | Configure Sentry alert rules: (1) alert if error rate > 1% over 5 minutes, (2) alert if any new error class appears, (3) weekly digest of top 10 errors. Route to Slack and email.           | P0       | S      | L-7  |
| PRJ-I03 | Supabase Connection Pooling         | Enable Supabase connection pooling (PgBouncer) to handle concurrent user load without hitting PostgreSQL connection limits. Configure pool size based on Vercel function concurrency limits. | P1       | M      | L+14 |
| PRJ-I04 | CDN Configuration for Static Assets | Confirm Vercel CDN is serving all static assets (images, fonts, JS bundles) from edge locations. Verify cache-control headers are set correctly for immutable assets.                        | P1       | S      | L-7  |

---

## Workstream 2: Go-to-Market

### Pre-Launch Checklist

| ID        | Title                              | Description                                                                                                                                                                                                                           | Priority | Status      | Effort | Due   |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------ | ----- |
| PRJ-GTM01 | GA4 Full Configuration             | Complete GA4 setup: verify measurement ID in production, confirm page view events fire on all route changes, set up conversion events (signup, first payment, trial start), configure audience segments for remarketing.              | P0       | In Progress | M      | L-14  |
| PRJ-GTM02 | hCaptcha Integration Live          | Confirm hCaptcha is active on signup form in production. Verify server-side token validation is working. Test with bot-like behavior to confirm blocks.                                                                               | P0       | Not Started | S      | L-14  |
| PRJ-GTM03 | SPA Pre-rendering Verified         | Confirm all public pages (/, /pricing, /features, /blog, /about, /contact) return full HTML content to Googlebot. Verify using Google Search Console > URL Inspection tool after deployment.                                          | P0       | In Progress | M      | L-14  |
| PRJ-GTM04 | Blog Content: Article 1 Published  | Publish "Why Partnership Management Software Is Worth More Than You're Paying For" — 1,800 words, targets keyword "partnership management software." Include internal links to pricing and features pages.                            | P0       | Not Started | M      | L-14  |
| PRJ-GTM05 | Blog Content: Article 2 Published  | Publish "How to Find the Right Influencer for Your Brand in 2026" — 2,000 words, targets "how to find influencers for brand." Includes comparison of manual search vs AI matching.                                                    | P0       | Not Started | M      | L-14  |
| PRJ-GTM06 | Blog Content: Article 3 Published  | Publish "The Complete Guide to Influencer Deal Negotiation" — 2,200 words, targets "influencer deal negotiation." Establishes DealStage authority. Includes downloadable template (gated with email capture).                         | P1       | Not Started | M      | L-7   |
| PRJ-GTM07 | Blog Content: Article 4 Published  | Publish "DealStage vs AspireIQ: Which Platform Is Right for Your Brand?" — 1,500 words, comparison page targeting competitor branded keywords.                                                                                        | P1       | Not Started | M      | L-day |
| PRJ-GTM08 | Blog Content: Article 5 Published  | Publish "140+ Types of Brand Talent: The Complete 2026 Partnership Directory" — 3,000 words, targets long-tail talent type keywords. High crawl value for SEO.                                                                        | P1       | Not Started | L      | L+7   |
| PRJ-GTM09 | Stripe Live Mode Confirmed         | Confirm Stripe is in live mode. Run a real $1.00 test charge on a live card, verify it appears in Stripe dashboard and Supabase, then refund.                                                                                         | P0       | Not Started | S      | L-7   |
| PRJ-GTM10 | LinkedIn Company Page              | Create DealStage LinkedIn company page. Upload logo (400x400px), banner image (1128x191px), write 300-character description. Publish first post: platform announcement.                                                               | P0       | Not Started | S      | L-14  |
| PRJ-GTM11 | Twitter/X Profile                  | Create @DealStageHQ Twitter/X account. Upload profile image, write bio including thedealstage.com URL. Pin an announcement tweet. Schedule first 10 posts using Buffer.                                                               | P0       | Not Started | S      | L-14  |
| PRJ-GTM12 | Instagram Profile                  | Create @dealstage Instagram profile. Upload logo as profile image. Write bio with Linktree or direct URL. Prepare first 6 posts as carousel grid (brand identity consistent).                                                         | P1       | Not Started | M      | L-7   |
| PRJ-GTM13 | Product Hunt Submission Prepared   | Prepare Product Hunt listing: 60-character tagline, 260-character description, 4-6 product screenshots (1270x760px), 3-minute demo video, 5 maker comments pre-written, hunter recruited if possible. Do not submit until launch day. | P0       | Not Started | M      | L-3   |
| PRJ-GTM14 | Beta User Recruitment: 20 Users    | Identify and onboard 20 beta users before launch: 8 talent (influencers/athletes), 8 brands, 2 agencies, 2 managers. Each receives 90-day free Growth tier access in exchange for weekly feedback call.                               | P0       | In Progress | L      | L-7   |
| PRJ-GTM15 | Status Page Live                   | Deploy public status page at status.thedealstage.com using BetterUptime or a similar service. Displays uptime for: Web App, API, AI Services, Database. Link from the main site footer.                                               | P0       | Not Started | S      | L-7   |
| PRJ-GTM16 | Privacy Policy and Terms Published | Ensure Privacy Policy and Terms of Service are live at thedealstage.com/privacy and thedealstage.com/terms. Verify both are linked from signup form, footer, and checkout.                                                            | P0       | Not Started | S      | L-14  |
| PRJ-GTM17 | Help Center: 15 Articles           | Publish 15 help center articles covering: getting started (5), deals management (3), AI agents (3), billing (2), account settings (2). Use Intercom Articles or a Notion-based help center embedded on site.                          | P0       | Not Started | L      | L-7   |

---

### Launch Day Checklist

| ID       | Title                           | Description                                                                                                                                                                                                          | Priority | Status      | Effort | Due   |
| -------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------ | ----- |
| PRJ-LD01 | Product Hunt Submission Go Live | Publish Product Hunt listing at 12:01 AM PST on launch day. Have 10 supporters lined up to upvote and comment within the first hour. Respond to every comment within 5 minutes during peak hours (6 AM - 12 PM PST). | P0       | Not Started | S      | L-day |
| PRJ-LD02 | Announcement Email to Waitlist  | Send launch announcement email to all waitlist subscribers. Subject: "DealStage is live — your access is ready." Include: 3 hero benefits, product screenshots, CTA to start free trial.                             | P0       | Not Started | M      | L-day |
| PRJ-LD03 | LinkedIn Launch Post            | Publish long-form LinkedIn post from founder account: origin story, what DealStage solves, invite connections to try it. Tag 20 relevant contacts. Budget 2 hours for responses and engagement.                      | P0       | Not Started | S      | L-day |
| PRJ-LD04 | Twitter/X Thread                | Publish 12-tweet thread introducing DealStage: problem statement, solution, key features, pricing, social proof from beta users, CTA. Schedule for 9 AM EST.                                                         | P0       | Not Started | S      | L-day |
| PRJ-LD05 | Reddit Posts in 3 Subreddits    | Post in r/Entrepreneur, r/SaaS, and r/influencermarketing. Tailor each post to the community's norms — no overt self-promotion. Focus on the problem and solution, mention DealStage naturally.                      | P0       | Not Started | S      | L-day |
| PRJ-LD06 | Error Monitoring Watch          | Watch Sentry dashboard continuously from 6 AM - 6 PM on launch day. Investigate any error spike immediately. Have hotfix deployment process ready.                                                                   | P0       | Not Started | S      | L-day |

---

### Post-Launch Week 1 Checklist

| ID       | Title                                  | Description                                                                                                                                                                               | Priority | Status      | Effort | Due |
| -------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------ | --- |
| PRJ-PL01 | Day 1 Metrics Review                   | At end of Day 1: record total signups, paid conversions, AI queries, error rate, Product Hunt rank. Compare to targets. Identify top acquisition channel.                                 | P0       | Not Started | S      | L+1 |
| PRJ-PL02 | Beta User Check-in Calls               | Schedule 15-minute calls with each of 20 beta users during Week 1. Collect: (1) what they loved, (2) what confused them, (3) what they would pay for that's missing. Document and triage. | P0       | Not Started | M      | L+7 |
| PRJ-PL03 | Fix Top 3 UX Issues from Beta Feedback | Implement the top 3 friction points identified from beta user Week 1 calls. These are likely: onboarding confusion, search relevance issues, or UI navigation problems.                   | P0       | Not Started | M      | L+7 |
| PRJ-PL04 | Welcome Email Sequence Verified        | Confirm automated welcome email sequence is firing correctly: Day 0 welcome, Day 1 getting started tips, Day 3 feature spotlight, Day 7 check-in. Verify each email in Resend dashboard.  | P0       | Not Started | S      | L+2 |
| PRJ-PL05 | SEO Console Submission                 | Submit sitemap to Google Search Console and Bing Webmaster Tools. Request indexing for 10 priority pages. Monitor crawl errors daily for Week 1.                                          | P1       | Not Started | S      | L+1 |

---

## Workstream 3: Marketing and Content

| ID        | Title                                   | Description                                                                                                                                                                                                                                                                                  | Priority | Status      | Effort | Due  |
| --------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------ | ---- |
| PRJ-MKT01 | Keyword Research Document               | Complete keyword research for DealStage's top 50 target keywords. Group into: branded (DealStage), product (partnership management software), competitive (vs AspireIQ, Grin), and informational (how to find influencers).                                                                  | P0       | Not Started | M      | L-14 |
| PRJ-MKT02 | On-Page SEO for All Public Pages        | Optimize title tags (< 60 chars), meta descriptions (< 155 chars), H1/H2 structure, and image alt text for all 12 public pages. Verify with SEO audit tool (Screaming Frog or Ahrefs).                                                                                                       | P0       | Not Started | M      | L-14 |
| PRJ-MKT03 | Schema Markup Implementation            | Add JSON-LD schema markup for: Organization, SoftwareApplication, FAQPage (on pricing), and BreadcrumbList on blog. Helps Google understand content type and improves rich result eligibility.                                                                                               | P1       | Not Started | M      | L-7  |
| PRJ-MKT04 | Competitor Comparison Pages             | Build dedicated comparison pages: DealStage vs AspireIQ, DealStage vs Grin, DealStage vs Influencer.co. Each page: 1,200 words, feature comparison table, pricing comparison, CTA. Target competitor branded keywords.                                                                       | P1       | Not Started | L      | L+14 |
| PRJ-MKT05 | Email Welcome Sequence (5 emails)       | Write and configure automated email sequence in Resend or ConvertKit: Email 1 (Day 0): Welcome + platform overview. Email 2 (Day 1): Create your first deal. Email 3 (Day 3): Explore AI agents. Email 4 (Day 6): Trial expiring reminder. Email 5 (Day 8): Upgrade prompt with testimonial. | P0       | Not Started | M      | L-7  |
| PRJ-MKT06 | Trial Expiration Email Sequence         | Dedicated 3-email sequence for trial users: (1) Day 5 of trial: "2 days left — here's what you unlock with a paid plan." (2) Day 7: "Trial ends tomorrow." (3) Day 8: "Your trial ended — upgrade to keep access."                                                                           | P0       | Not Started | M      | L-7  |
| PRJ-MKT07 | Monthly Newsletter Template             | Design reusable monthly newsletter template: featured new platform feature, top partnership insight, industry news roundup, community spotlight (beta user success story), CTA of the month.                                                                                                 | P2       | Not Started | M      | L+30 |
| PRJ-MKT08 | Social Media Content Calendar (Month 1) | Plan 30 social media posts for Month 1 across LinkedIn, Twitter, and Instagram. Mix: product education (40%), social proof (20%), industry insights (30%), direct CTAs (10%). Schedule in Buffer or Hootsuite.                                                                               | P0       | Not Started | M      | L-7  |
| PRJ-MKT09 | Backlink Outreach: 20 Sites             | Identify 20 industry blogs, directories, and resource pages where DealStage should be listed or cited. Submit to: G2, Capterra, Trustpilot, influencer marketing directories, startup directories (BetaList, StartupStash, SaaSHub).                                                         | P1       | Not Started | M      | L+14 |
| PRJ-MKT10 | Case Study: First 3 Beta Users          | Write detailed case studies for the 3 most successful beta users. Format: challenge, solution (DealStage features used), outcome (time saved, deals closed, revenue generated). Publish on blog and use in sales outreach.                                                                   | P1       | Not Started | L      | L+45 |

---

## Workstream 4: Business Operations

| ID        | Title                                 | Description                                                                                                                                                                                                                                                                        | Priority | Status      | Effort | Due  |
| --------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------ | ---- |
| PRJ-OPS01 | Terms of Service Legal Review         | Have Terms of Service reviewed by a SaaS-specialized attorney. Focus areas: liability limitations for AI output accuracy, data ownership, acceptable use policy, refund terms, intellectual property. Budget $500-$1,500.                                                          | P0       | Not Started | S      | L-14 |
| PRJ-OPS02 | Privacy Policy CCPA/GDPR Compliance   | Verify Privacy Policy covers: data categories collected, third-party sharing (Stripe, Supabase, Anthropic, OpenAI), user rights (access, deletion, portability), retention periods, cookie policy. Add cookie consent banner for EU visitors.                                      | P0       | Not Started | M      | L-14 |
| PRJ-OPS03 | Data Processing Agreement Template    | Create DPA template for Enterprise customers who require one (typically required under GDPR when processing EU personal data on their behalf). Basis: standard contractual clauses.                                                                                                | P1       | Not Started | M      | L+30 |
| PRJ-OPS04 | Stripe Revenue Reconciliation Process | Document monthly process for reconciling Stripe payouts with business bank account. Build simple Google Sheet template: Stripe payout amount, platform fees deducted, net deposit, variance check.                                                                                 | P1       | Not Started | S      | L+14 |
| PRJ-OPS05 | Expense Tracking Setup                | Set up expense tracking in QuickBooks or a spreadsheet: categories (infrastructure, AI API costs, marketing, legal, software subscriptions). Log all expenses from Day 1 for clean accounting and tax preparation.                                                                 | P0       | Not Started | S      | L-7  |
| PRJ-OPS06 | Business Banking Account              | Ensure DealStage has a dedicated business checking account (under PartnerIQ legal entity) separate from personal finances. Route all Stripe payouts and expenses through this account.                                                                                             | P0       | Not Started | S      | L-7  |
| PRJ-OPS07 | SOC 2 Readiness Assessment            | Review SOC 2 Type I requirements against current infrastructure. Document gaps in: access controls (Supabase RLS), audit logging (Supabase logs retention), incident response, vendor management. Create remediation roadmap.                                                      | P2       | Not Started | L      | L+60 |
| PRJ-OPS08 | Incident Response Runbook             | Document step-by-step response plan for: (1) database outage, (2) AI service disruption, (3) security breach, (4) payment processing failure. Include escalation contacts, communication templates, and rollback procedures.                                                       | P1       | Not Started | M      | L+14 |
| PRJ-OPS09 | Refund Policy Documentation           | Write and publish clear refund policy: (1) 7-day money-back guarantee for first-time paid subscribers, (2) prorated refunds for annual plans cancelled within 30 days, (3) no refunds for monthly plans after 7 days. Post at thedealstage.com/refunds and link from pricing page. | P0       | Not Started | S      | L-7  |
| PRJ-OPS10 | Advisor Agreement Template            | Create advisor agreement for any advisors or angel investors who receive equity or advisory shares. 1-2 year vesting, standard IP assignment clause. Use a template from Clerky or Stripe Atlas docs.                                                                              | P2       | Not Started | M      | L+60 |

---

## Workstream 5: Partnerships and Integrations

| ID        | Title                                  | Description                                                                                                                                                                                                                          | Priority | Status      | Effort | Due   |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------- | ------ | ----- |
| PRJ-INT01 | Zapier Integration Scoping             | Document the 5 most-requested Zapier triggers and actions from beta user interviews. Define the API endpoints that Zapier will call. Create technical specification for Zapier developer platform listing.                           | P1       | Not Started | M      | L+30  |
| PRJ-INT02 | Zapier App Development                 | Build and submit DealStage Zapier integration. Triggers: new deal created, deal stage changed, new match found, new user registered. Actions: create deal, update deal stage. Submit for Zapier review (4-6 week approval timeline). | P2       | Not Started | XL     | L+90  |
| PRJ-INT03 | HubSpot Integration Research           | Research HubSpot's API for CRM sync: contacts, deals, companies. Define bidirectional sync: HubSpot contact → DealStage talent profile, DealStage deal → HubSpot deal. Scope as Phase 2 integration.                                 | P2       | Not Started | M      | L+60  |
| PRJ-INT04 | API Documentation (Public)             | Publish developer API documentation at docs.thedealstage.com. Cover: authentication (API keys), available endpoints (deals, matches, talent search), rate limits, code examples in JavaScript and Python.                            | P2       | Not Started | L      | L+60  |
| PRJ-INT05 | Google Calendar Integration            | Allow users to sync deal milestones and follow-up dates to Google Calendar. OAuth 2.0 integration — requires Google Cloud Console project, OAuth credentials, and Supabase token storage.                                            | P2       | Not Started | L      | L+75  |
| PRJ-INT06 | Agency Partner Program Design          | Design formal agency partner program: commission structure (20% revenue share for referred paid accounts), co-marketing opportunities, dedicated agency dashboard, custom branded portal option at Enterprise tier.                  | P2       | Not Started | M      | L+60  |
| PRJ-INT07 | Partner Outreach Pipeline: 10 Agencies | Identify 10 mid-size influencer marketing agencies who could become channel partners. Research their tech stack, client base, and pain points. Prepare personalized outreach email and demo offer.                                   | P1       | Not Started | M      | L+30  |
| PRJ-INT08 | Salesforce Integration Scoping         | Research Salesforce Connected App requirements for Enterprise customers who need DealStage data in their CRM. Evaluate whether a managed package or simple API integration is more viable. Define minimum scope.                     | P3       | Not Started | M      | L+120 |

---

# DELIVERABLE 34: WEEKLY OPERATING CADENCE

## Overview

This document defines the founder's weekly operating rhythm during the first 12 months. Each ritual has a defined time block, specific inputs, outputs, and decision triggers. The cadence is designed for a solo founder building to first hire — it allocates time across the four essential functions: build, grow, operate, and learn.

---

## Weekly Rhythm: Day-by-Day Schedule

---

### Monday: Strategy and Planning

**Total allocated time: 3 hours**

**Block 1 — 7:00-7:30 AM: Weekend Metrics Review (30 minutes)**

Pull the following from their respective sources before any other work:

- Total signups over the weekend (Supabase query or dashboard)
- Paid conversions over the weekend (Stripe)
- AI queries fired over the weekend (Supabase)
- Any Sentry error spikes (Sentry dashboard)
- Uptime status (UptimeRobot/BetterUptime)
- Social media engagement from Friday/Saturday posts (Buffer analytics)

Record the metrics in the Weekly Metrics Spreadsheet (Google Sheet with a new row per week). Flag any metric that is Red per the KPI thresholds in Deliverable 32. Do not act on Red metrics yet — they go on the priority list in Block 2.

Output: Updated weekly metrics row in tracking spreadsheet.

**Block 2 — 7:30-8:30 AM: Week Planning (60 minutes)**

Review the Master Project Tracker (Deliverable 33) and identify:

1. The top 3 product development tasks for the week (must move a P0 or P1 item forward)
2. The top 1 growth action (content, outreach, or SEO task)
3. The top 1 operational task (legal, finance, or compliance)
4. Any Red KPI from Block 1 that requires a specific intervention this week

Write the Weekly Top 5 list in a running document (Notion or plain text file):

- Task 1 (product): [specific item from PRJ tracker]
- Task 2 (product): [specific item]
- Task 3 (product): [specific item]
- Task 4 (growth): [specific item]
- Task 5 (operations): [specific item]

Output: Weekly Top 5 written and shared with any advisors or accountability partners.

**Block 3 — 8:30-9:00 AM: Competitor Monitoring (30 minutes)**

Review the following each Monday:

- Check G2, Capterra, and Trustpilot for new reviews on: AspireIQ, Grin, Influencer.co, Creator.co, Modash. Note any product features mentioned in reviews that DealStage does not have.
- Check competitors' changelog or blog for new feature announcements (bookmark 5 competitor blogs).
- Review Google Alerts (set up for: "influencer marketing platform," "partnership management software," "DealStage").
- Check Hacker News and Product Hunt for new competitor launches.

Record any significant competitive development in a Competitor Intelligence Log (one Google Sheet with columns: Date, Competitor, Development, Relevance, Action Needed).

Output: Competitor Intelligence Log updated. Any urgent competitive threats added to the Week planning list.

**Block 4 — 9:00-10:00 AM: Product Development Deep Work (60 minutes)**

Work on the highest-priority P0 item from the Master Project Tracker. This block exists because Monday mornings have the highest cognitive freshness — the most complex product work happens here. No meetings, no email, no Slack during this block.

Output: Meaningful progress on top P0 product task. GitHub commit or documented progress note.

---

### Tuesday: Product and Engineering

**Total allocated time: 5 hours**

**Block 1 — 8:00 AM-12:00 PM: Deep Work — Product Development (4 hours)**

The longest uninterrupted work block of the week. Use this for the most technically demanding tasks: complex AI agent development, database schema changes, performance optimization, or new feature implementation. All tasks from PRJ-001 through PRJ-T05 in the tracker. Use Pomodoro technique: 50 minutes work, 10 minutes break.

Rules for this block:

- Phone on Do Not Disturb
- Email client closed
- All support tickets deferred to Thursday's customer block
- GitHub branch created before starting, commit at end of block regardless of completion status

Output: Major progress on one L or XL complexity product task.

**Block 2 — 12:00-12:30 PM: Sentry Error Review (30 minutes)**

Pull up Sentry Issues sorted by frequency. Review:

- Any new error class introduced this week
- Errors affecting > 1% of sessions
- Any errors related to AI endpoints (often silent failures that users won't report)
- Performance regressions in P95 latency (Sentry Performance tab)

For each critical error: create a bug ticket in the PRJ tracker (PRJ-B series) if not already tracked. Fix any error that takes < 30 minutes. Escalate multi-hour fixes to Thursday's deep work session.

Output: Sentry reviewed, critical errors logged, quick fixes deployed.

**Block 3 — 12:30-1:00 PM: Infrastructure Review (30 minutes)**

Review the following monthly cost centers and note any anomalies:

- Anthropic usage dashboard: total tokens consumed, cost this month vs last month, cost per query trending up or down
- OpenAI usage dashboard: same analysis
- Supabase dashboard: database size, row counts, bandwidth, storage costs
- Vercel dashboard: function invocations, bandwidth, any approaching plan limits
- Resend dashboard: emails sent, delivery rate, bounce rate

Flag: any service approaching its plan limits (triggers upgrade decision), any cost spike > 20% over prior month (triggers investigation), any service with > 1% delivery failure rate.

Output: Infrastructure cost logged in monthly expense tracker. Any action items added to PRJ-I series.

---

### Wednesday: Growth and Marketing

**Total allocated time: 4 hours**

**Block 1 — 8:00-9:00 AM: Content Creation (60 minutes)**

Produce one of the following content types each Wednesday:

- A blog post (1,500-2,500 words targeting a priority keyword from PRJ-MKT01)
- A batch of 5-7 social media posts (scheduled in Buffer for the coming week)
- A longer-form LinkedIn article (800-1,200 words for thought leadership)
- An email newsletter draft (if month-end is approaching)

Use the Content Calendar (PRJ-MKT08) to stay on schedule. One hour is sufficient for a complete first draft — resist perfecting at this stage. Publish or schedule within 24 hours of drafting.

Output: One piece of content published or scheduled.

**Block 2 — 9:00-10:00 AM: SEO Review and Optimization (60 minutes)**

Weekly SEO review tasks (rotate through this list weekly, complete full cycle monthly):

- Week 1: Google Search Console — review search queries driving impressions, identify pages with high impressions but low CTR (fix title/meta). Check index coverage for errors.
- Week 2: Ahrefs or Semrush (or free equivalent: Ubersuggest) — review keyword rankings for top 20 target keywords. Note any ranking changes > 5 positions.
- Week 3: Internal linking audit — identify 3 high-traffic pages that lack internal links to priority conversion pages. Add the links.
- Week 4: Backlink check — new backlinks acquired this month, new referring domains, any lost links. Submit one guest post pitch or directory submission.

Output: SEO action item completed. Rankings data logged in keyword tracking spreadsheet.

**Block 3 — 10:00-11:00 AM: Outreach (60 minutes)**

Outreach activities rotate weekly:

- Week 1: Partnership outreach — email 3 agencies from the PRJ-INT07 pipeline. Personalized, 4-sentence email: (1) reference their work, (2) DealStage value prop for their clients, (3) demo offer, (4) CTA.
- Week 2: Beta user recruitment — identify 5 new potential beta users via LinkedIn search (brands with influencer marketing content, talent agencies, sports agents). DM 5, email 5.
- Week 3: Community engagement — write a substantive, non-promotional post in one relevant community (r/influencermarketing, r/SaaS, IndieHackers, LinkedIn group). Answer 5 questions from other posts.
- Week 4: Press and media — identify 2 journalists or newsletter writers who cover creator economy, influencer marketing, or SaaS startups. Send brief pitch for coverage consideration.

Output: 5-15 outreach messages sent with follow-up date logged in CRM or spreadsheet.

**Block 4 — 11:00 AM-12:00 PM: Product Development (60 minutes)**

One hour of product development focused on growth-related features: referral program, conversion optimization, onboarding improvements, or SEO technical improvements (PRJ-006, PRJ-007). This block is not for feature development — it's for the intersection of product and growth.

Output: Progress on one growth-enabling product task.

---

### Thursday: Customer and Sales

**Total allocated time: 4 hours**

**Block 1 — 8:00-9:00 AM: Customer Conversations (60 minutes)**

Rotating activities:

- Respond to all open support tickets (Intercom/Crisp) from the past 48 hours. Target < 4-hour response time for all tickets.
- Conduct one scheduled 30-minute user interview with a beta user or recent churned customer.
- Review all NPS responses received this week. Personally respond to all Detractor scores (0-6) within 24 hours of receipt.
- Read all in-app feedback submissions and feature requests from the week. Log any new themes in the Canny or feature request tracker.

Output: All open tickets resolved or responded to. One user conversation documented with insights.

**Block 2 — 9:00-10:00 AM: Sales Outreach and Follow-Ups (60 minutes)**

Sales activities:

- Review CRM or outreach spreadsheet: all leads in "demo scheduled" or "follow-up needed" status. Send follow-up to anyone who has not responded in 5 business days.
- Conduct scheduled product demos. Prepare for each demo: review the prospect's role, industry, and pain points 15 minutes beforehand. Follow up within 2 hours post-demo with personalized recap and next step.
- Process trial-to-paid conversions: for any trial user at Day 5-7, send a personalized email referencing their specific usage (e.g., "I saw you created 3 deals — here's what you unlock on the paid plan").
- Update sales pipeline tracker: move deals through stages (Cold → Interested → Demo Scheduled → Trial → Converted/Lost).

Output: Pipeline updated, all follow-ups sent, demo notes documented.

**Block 3 — 10:00-11:00 AM: Community Engagement (60 minutes)**

Community presence activities:

- Twitter/X: Reply to 10 relevant tweets in the influencer marketing, creator economy, and SaaS spaces. No promotional replies — add genuine value. Like and repost 5 others' quality content. Check DMs and mentions.
- LinkedIn: Comment on 5 posts from potential customers or partners. Each comment should be substantive (3+ sentences) and demonstrate expertise.
- Reddit: Participate in 2 threads across r/influencermarketing, r/Entrepreneur, r/SaaS. Monitor for opportunities to mention DealStage where genuinely relevant.
- IndieHackers or Hacker News: Engage with one thread in the founder/SaaS community.

Output: 20+ community engagements across platforms. Any direct leads captured in sales pipeline.

**Block 4 — 11:00 AM-12:00 PM: Product Development (60 minutes)**

Product work focused on customer-requested features or bug fixes discovered through Thursday's customer interactions. If a bug was reported during support (Block 1), evaluate whether it can be fixed in this block. If a feature request was highly consistent across multiple users this week, begin scoping it.

Output: Customer-informed product improvement started or completed.

---

### Friday: Operations and Review

**Total allocated time: 3 hours 30 minutes**

**Block 1 — 8:00-8:30 AM: Weekly Metrics Review and Dashboard Update (30 minutes)**

Pull the full week's metrics from all sources. Update the Weekly Metrics Spreadsheet with final numbers. Compare against last week and against monthly targets. Assign Red/Yellow/Green status to each KPI. Note any trends (improving, declining, stable).

Metrics to record:

- New signups this week
- New paid conversions
- Total MRR
- Churn events this week
- DAU average for the week
- AI queries total for the week
- Top acquisition source (GA4)
- Sentry error rate (weekly average)
- Support tickets opened this week

Output: Weekly metrics row complete. All Red KPIs flagged for next Monday's planning session.

**Block 2 — 8:30-9:00 AM: Financial Review (30 minutes)**

Financial review tasks:

- Open Stripe dashboard: confirm all expected subscription charges processed successfully. Review any failed payments or dunning events. If any invoice has been in "past due" for 7+ days, review Stripe's automatic retry settings.
- Check business bank account: confirm Stripe payout received. Note amount vs expected (Stripe fees should be ~2.9% + $0.30 per transaction).
- Update monthly expense log: log any new expenses from the week (AI API costs, software subscriptions, ad spend, contractor payments).
- Calculate current month burn rate: total expenses to date / days elapsed x 30.

Output: Expense log updated. Any payment issues flagged and addressed.

**Block 3 — 9:00-10:00 AM: Documentation and Process Improvement (60 minutes)**

Documentation activities:

- Update any runbook or process document that became outdated this week.
- Document any new workaround, bug fix process, or deployment procedure discovered during the week so it is not held only in working memory.
- Write one internal process note for any recurring task that took longer than expected — this becomes the foundation for the first employee's onboarding materials.
- Update the Master Project Tracker: move completed items to Done, add any new items discovered this week, re-prioritize based on learnings.

Output: All documentation current. Project tracker up to date.

**Block 4 — 10:00-11:00 AM: Next Week Planning and Priority Setting (60 minutes)**

Plan next week using the Weekly Top 5 format:

- Review the Project Tracker for highest-priority remaining items.
- Identify any external deadlines (launch milestones, legal deadlines, partner commitments) that fall in the next 7 days.
- Block time on the calendar for next week's deep work sessions.
- Draft the Weekly Metrics Email (see template below) if advisors or investors receive weekly updates.
- Set one stretch goal for the week: a deliverable that would meaningfully accelerate the business if completed.

Output: Next week's calendar blocked. Weekly metrics email drafted.

**Block 5 — 11:00-11:30 AM: Personal Development (30 minutes)**

One of the following, rotating weekly:

- Read one long-form article or research report on influencer marketing, creator economy, or partnership technology.
- Review one competitor's product (sign up, explore features, take notes on differentiation opportunities).
- Listen to one relevant podcast episode (Lenny's Podcast, SaaStr, My First Million, The Creator Economy) while taking notes.
- Review one recent DealStage cohort's behavior patterns to develop product intuition.

Output: One insight documented in a personal learning log (Notion page or simple text file).

---

## Monthly Rituals

---

### Month-End Metrics Report (Last Friday of Each Month — 2 hours)

**Preparation (30 minutes):**
Pull all monthly KPI data from Deliverable 32 dashboard. Calculate month-over-month changes for every KPI. Identify the top 3 positive developments and top 3 concerns.

**Reporting (60 minutes):**
Complete the Monthly Report (template below). Distribute to any advisors, investors, or accountability partners within 24 hours of month-end.

**Review and Reset (30 minutes):**
Review the current OKRs. Are the month's results on track for quarterly goals? If any OKR is more than 20% behind, decide whether to reprioritize execution or revise the target.

---

### OKR / Goal Review and Reset (1st Monday of Each Month — 60 minutes)

Review current quarterly OKRs. Score each Key Result (0.0-1.0 scale). Update the OKR tracker. If a Key Result is at 0.3 or below at mid-quarter, escalate to the Weekly Top 5 immediately. Set monthly sub-goals that connect to quarterly OKRs.

---

### Investor Update (Last Friday of Each Month — 30 minutes if applicable)

Prepare and send the Investor Update Email (template below). Keep it under 400 words. Focus on: MRR, growth rate, top win, top challenge, what you need.

---

### Content Calendar Review (1st Wednesday of Each Month — 30 minutes)

Review the prior month's content performance (page views, social shares, email open rates). Identify which content performed best. Plan the next month's content calendar in the PRJ-MKT08 format. Adjust content themes based on which keywords are gaining traction.

---

### Infrastructure Cost Optimization Review (Last Tuesday of Each Month — 45 minutes)

Review all infrastructure invoices for the month:

- Anthropic: token usage by model, cost per query trending
- OpenAI: same
- Supabase: database size, row counts, whether plan upgrade is needed
- Vercel: function invocations, bandwidth, plan efficiency
- Resend: email volume vs plan limit
- Any other SaaS tools: evaluate ROI

Identify one cost reduction action for next month. Target: keep infrastructure costs below 15% of MRR as revenue scales.

---

## Quarterly Rituals

---

### Quarterly Business Review (First Week of Each Quarter — Half Day)

**Morning (3 hours):**

1. Full KPI review: every metric in Deliverable 32 across the entire quarter. Build a 1-page summary table.
2. Cohort analysis: run the cohort retention query for all cohorts from the quarter. Identify trends.
3. Unit economics review: calculate LTV, CAC, LTV:CAC, and payback period for each segment.
4. Competitive landscape update: where did each competitor move this quarter? What features did they ship? Did pricing change?

**Afternoon (3 hours):**

5. OKR scoring for the quarter: final score for each Key Result.
6. Roadmap update: reprioritize the Product Feature Backlog (PRJ-001 through PRJ-020) based on quarter's learnings.
7. Next quarter OKR setting: set 3 Objectives and 3 Key Results each for next quarter across: growth, retention, and product.
8. Financial forecast update: update the 12-month financial model with actual Month N data. Revise projections for Months N+1 through N+12.

---

### Pricing Review (Each Quarter — 60 minutes)

Review pricing health: ARPU trends, tier distribution, churn by tier, competitor pricing changes. Ask three questions:

1. Are we leaving money on the table (is churn rate low and NPS high — could we raise prices)?
2. Are we pricing out the target customer (is churn reason "price" > 30%)?
3. Is the free tier optimally calibrated (is AI limit hit rate in the Green zone)?

Make a pricing recommendation to self. Implement any change with 30-day advance notice to existing customers.

---

### Financial Forecast Update (Each Quarter — 90 minutes)

Update the financial model from Deliverable in FINANCIAL_MODELS_AND_PITCH_DECK.md. Input actuals for the completed quarter. Revise projections for next 3 quarters based on actual growth rate, actual churn rate, and actual ARPU. Recalculate runway and identify month when next funding or revenue milestone must be reached.

---

## Templates

---

### Weekly Metrics Email Template (to Advisors / Investors)

```
Subject: DealStage Weekly Update — Week of [DATE]

Hi [Name],

Quick weekly update:

GROWTH
- New signups this week: [X] ([+/-Y%] vs last week)
- Paid conversions this week: [X]
- Total MRR: $[X] ([+/-Y%] vs last week)
- Total registered users: [X]

ENGAGEMENT
- Average DAU: [X]
- AI queries this week: [X]
- Stickiness (DAU/MAU): [X]%

PRODUCT HEALTH
- Error rate: [X]% ([Green/Yellow/Red])
- Uptime: [X]%
- Support tickets: [X] ([X] open, [X] resolved)

TOP WIN THIS WEEK
[One sentence: the most significant positive development]

TOP CHALLENGE
[One sentence: the biggest obstacle or concern]

FOCUS NEXT WEEK
1. [Top product priority]
2. [Top growth priority]
3. [Top operational priority]

Anything I should be thinking about that I'm not?

[Founder name]
thedealstage.com
```

---

### Monthly Report Template

```
Subject: DealStage Monthly Report — [MONTH YEAR]

EXECUTIVE SUMMARY
[3-4 sentences: overall trajectory, headline metric, biggest win, biggest risk]

REVENUE
- MRR: $[X] (target: $[X], variance: [+/-X]%)
- Net New MRR: $[X] (new: $[X], expansion: $[X], churn: -$[X])
- ARR: $[X]
- ARPU: $[X]
- MRR by tier: Starter $[X] | Growth $[X] | Enterprise $[X]

GROWTH
- New signups: [X] (vs [X] last month)
- Paid conversions: [X]
- Signup-to-paid conversion rate: [X]%
- Trial-to-paid conversion rate: [X]%
- Top acquisition channel: [channel] ([X]% of signups)

ENGAGEMENT
- MAU: [X]
- DAU average: [X]
- Stickiness: [X]%
- AI queries/user/day: [X]
- Deals created/user/week: [X]

RETENTION
- Logo churn rate: [X]%
- Revenue churn rate: [X]%
- NRR: [X]%
- NPS: [X] (n=[X] responses)
- Top churn reason: [category] ([X]% of churns)

UNIT ECONOMICS
- Blended CAC: $[X]
- Blended LTV: $[X]
- LTV:CAC: [X]:1
- Payback period: [X] months
- AI cost per user: $[X]

PRODUCT
- Features shipped: [list]
- Bugs fixed: [X]
- Error rate: [X]%
- Uptime: [X]%

OPERATIONS
- Total expenses: $[X]
- Infrastructure costs: $[X] ([X]% of MRR)
- AI API costs: $[X]
- Gross margin: [X]%

TOP 3 WINS THIS MONTH
1. [Win]
2. [Win]
3. [Win]

TOP 3 CONCERNS
1. [Concern] — mitigation: [action]
2. [Concern] — mitigation: [action]
3. [Concern] — mitigation: [action]

FOCUS NEXT MONTH
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

[Founder name]
[Date]
```

---

### Quarterly Review Template

```
DEALSTAGE QUARTERLY BUSINESS REVIEW — Q[X] [YEAR]

PREPARED BY: [Founder name]
DATE: [Date]

---

SECTION 1: QUARTER IN REVIEW

OKR Performance:
Objective 1: [Title] — Score: [X.X/1.0]
  KR1: [metric] — Target: [X] — Actual: [X] — Score: [X.X]
  KR2: [metric] — Target: [X] — Actual: [X] — Score: [X.X]
  KR3: [metric] — Target: [X] — Actual: [X] — Score: [X.X]

Objective 2: [Title] — Score: [X.X/1.0]
  KR1-3: [same format]

Objective 3: [Title] — Score: [X.X/1.0]
  KR1-3: [same format]

Overall Quarter Score: [X.X/1.0]

---

SECTION 2: KEY METRICS SUMMARY

[Full KPI table — all metrics from Deliverable 32 with quarter-end actuals vs targets]

---

SECTION 3: COHORT ANALYSIS

Cohort M[X] (Month N users):
- Month 1 retention: [X]%
- Month 3 retention: [X]%
- Month 6 retention: [X]% (if applicable)
- Notable behavior patterns: [insight]

---

SECTION 4: COMPETITIVE LANDSCAPE UPDATE

[Competitor 1]: [What changed this quarter — features, pricing, market moves]
[Competitor 2]: [same]
[Competitive position assessment]: [where DealStage is stronger, where it needs to close gaps]

---

SECTION 5: FINANCIAL FORECAST UPDATE

Current ARR: $[X]
Projected Month 12 ARR: $[X]
Runway (months): [X]
Next key financial milestone: [milestone] by [date]

[Updated 4-quarter projection table]

---

SECTION 6: PRODUCT ROADMAP UPDATE

Top 5 features for next quarter:
1. [Feature] — Priority: [P0/P1] — Effort: [S/M/L/XL] — Impact: [metric it moves]
2-5: [same format]

Features deprioritized and rationale:
[Feature]: [reason deprioritized]

---

SECTION 7: NEXT QUARTER OKRS

Objective 1: [Title]
  KR1: [specific measurable result with target]
  KR2: [specific measurable result with target]
  KR3: [specific measurable result with target]

Objective 2: [Title]
  KR1-3: [same format]

Objective 3: [Title]
  KR1-3: [same format]

---

SECTION 8: TOP 3 RISKS NEXT QUARTER

Risk 1: [Description] — Probability: [H/M/L] — Impact: [H/M/L] — Mitigation: [action]
Risk 2: [same]
Risk 3: [same]

---

SECTION 9: DECISIONS NEEDED

[List any strategic decisions that need to be made before next quarter's work can proceed]
1. [Decision]: [Options] — Recommended: [option] — Rationale: [why]

[Founder name]
[Date]
```

---

_End of Batch 9 — Deliverables 32, 33, 34_
