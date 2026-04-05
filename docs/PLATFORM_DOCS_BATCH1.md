# DealStage Platform Documentation -- Batch 1

**Company:** DealStage (legal entity: PartnerIQ)
**URL:** thedealstage.com
**Generated:** 2026-03-29
**Deliverables in this batch:** 4, 5, 17

---

# DELIVERABLE 4: DATABASE SCHEMA & DATA DICTIONARY

## Overview

DealStage runs on Supabase (PostgreSQL) with Row-Level Security (RLS) enforced on every table. The schema spans 65+ tables organized into 12 domains. All primary keys are UUID v4. All timestamps are `timestamptz` defaulting to `now()`. Most mutable tables carry `updated_at` columns auto-managed by a shared `update_updated_at()` trigger function.

### Naming Conventions

| Convention   | Example                                                        |
| ------------ | -------------------------------------------------------------- |
| Table names  | snake_case plural (`brand_signals`)                            |
| Primary key  | `id uuid`                                                      |
| Foreign keys | `{entity}_id uuid REFERENCES {entity}(id)`                     |
| Timestamps   | `created_at`, `updated_at` as `timestamptz`                    |
| Soft enums   | `CHECK (status IN (...))` constraints, not separate enum types |
| Arrays       | PostgreSQL `text[]` for tags, niches, platform lists           |
| JSON blobs   | `jsonb` for flexible/nested data (terms, metrics, steps)       |

### PII Classification Key

| Level      | Meaning                                         | Examples                                                  |
| ---------- | ----------------------------------------------- | --------------------------------------------------------- |
| **HIGH**   | Directly identifies a person; breach-reportable | Email, phone, full name, LinkedIn URL, OAuth tokens       |
| **MEDIUM** | Indirectly identifying when combined            | Location, job title, company, niche, follower count       |
| **LOW**    | Business/platform data, non-identifying         | Deal values, scores, statuses, timestamps                 |
| **NONE**   | Reference/lookup data                           | Talent type categories, rate benchmarks, platform catalog |

---

## Domain 1: Core Entities

| Table ID | Table Name     | Description                                                                                                                            | Key Fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Indexes                                                                                                                                                     | RLS Policy                                                                                                         | Est Rows Y1 | PII    |
| -------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------- | ------ |
| TBL-001  | `profiles`     | Central user identity table; auto-created on auth signup via trigger. Holds role, plan, onboarding state, and manager-specific fields. | `id` (PK, refs auth.users), `email`, `full_name`, `role` (admin/brand/talent/agency), `plan` (free/tier1/tier2/tier3), `company_name`, `job_title`, `phone`, `avatar_url`, `bio`, `website`, `location`, `onboarding_completed`, `manager_of` (uuid), `manager_verification_status`, `manager_verification_file`, `trial_email_sent`, `created_at`, `updated_at`                                                                                                                                                                                                                                                                                                                                                                                                                              | `profiles_role_idx(role)`, `profiles_email_idx(email)`                                                                                                      | SELECT open to authenticated; INSERT/UPDATE open (demo mode); role-change blocked by `enforce_signup_role` trigger | 5,000       | HIGH   |
| TBL-002  | `brands`       | Brand entities loaded from enrichment pipeline and user-created. 1,200+ pre-loaded across 42 industries.                               | `id` (PK), `name`, `industry`, `website`, `logo_url`, `description`, `hq_location`, `annual_revenue`, `partnership_budget`, `annual_budget`, `target_niches` (text[]), `target_platforms` (text[]), `brand_values` (text[]), `contact_name`, `contact_email`, `contact_phone`, `social_instagram`, `social_twitter`, `social_linkedin`, `owner_id` (refs profiles), `created_by` (text), `relevant_talent_types` (text[]), `created_at`, `updated_at`                                                                                                                                                                                                                                                                                                                                         | `brands_owner_idx`, `brands_industry_idx`, `brands_created_at_idx`, `idx_brands_talent_types` (GIN on relevant_talent_types)                                | Open SELECT/INSERT/UPDATE/DELETE for authenticated                                                                 | 3,000       | MEDIUM |
| TBL-003  | `talents`      | Talent profiles with social metrics, rates, and manager metadata. Supports 140+ talent types across 12 categories.                     | `id` (PK), `name`, `email`, `primary_platform`, `niche`, `tier` (nano/micro/mid/macro/mega/celebrity), `location`, `bio`, `avatar_url`, `total_followers`, `engagement_rate`, `brand_safety_score`, `discovery_alpha_score`, `trajectory`, `avg_views`, `rate_per_post`, `rate_per_story`, `rate_per_reel`, `rate_min`, `rate_max`, `demographics` (jsonb), `audience_interests` (text[]), `past_partnerships` (text[]), `social_instagram`, `social_tiktok`, `social_youtube`, `social_twitter`, `social_twitch`, `social_linkedin`, `instagram`, `youtube`, `tiktok`, `twitter`, `spotify`, `phone`, `website`, `category`, `status`, `expertise`, `achievements`, `manager_commission`, `created_by_manager` (uuid), `invite_code`, `owner_id` (refs profiles), `created_at`, `updated_at` | `talents_owner_idx`, `talents_niche_idx`, `talents_tier_idx`, `talents_platform_idx`, `talents_created_at_idx`, `talents_invite_code_idx` (unique, partial) | Open SELECT/INSERT/UPDATE/DELETE for authenticated                                                                 | 10,000      | HIGH   |
| TBL-004  | `partnerships` | Central deal pipeline entity tracking brand-talent partnerships through a 10-stage funnel from discovered to completed/churned.        | `id` (PK), `title`, `brand_id` (refs brands), `talent_id` (refs talents), `brand_name`, `talent_name`, `status` (discovered/researching/outreach_pending/outreach_sent/responded/negotiating/contracted/active/completed/churned), `deal_value`, `match_score`, `priority` (low/medium/high/urgent), `assigned_to`, `start_date`, `end_date`, `deliverables`, `notes`, `created_by` (refs profiles), `created_at`, `updated_at`                                                                                                                                                                                                                                                                                                                                                               | `partnerships_status_idx`, `partnerships_created_by_idx`, `partnerships_brand_idx`, `partnerships_talent_idx`, `partnerships_created_at_idx`                | Open CRUD for authenticated                                                                                        | 25,000      | LOW    |
| TBL-005  | `activities`   | Immutable activity/event log tied to partnerships and users. Append-only (no updated_at).                                              | `id` (PK), `type`, `description`, `entity_type`, `entity_id`, `partnership_id` (refs partnerships), `user_id` (refs profiles), `user_name`, `metadata` (jsonb), `created_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `activities_partnership_idx`, `activities_user_idx`, `activities_created_at_idx`                                                                            | Open SELECT for authenticated                                                                                      | 100,000     | LOW    |

## Domain 2: Marketplace

| Table ID | Table Name                  | Description                                                                                       | Key Fields                                                                                                                                                                                                                                                                                                                                                                            | Indexes                                                                                                                                                                   | RLS Policy                                  | Est Rows Y1 | PII  |
| -------- | --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------- | ---- |
| TBL-006  | `marketplace_opportunities` | Brand-posted opportunities (campaigns, sponsorships) that talent can browse and apply to.         | `id` (PK), `title`, `brand_id`, `brand_name`, `brand_logo`, `description`, `status` (draft/published/closed/expired), `contract_type`, `budget_min`, `budget_max`, `required_niches` (text[]), `required_platforms` (text[]), `min_followers`, `min_engagement`, `deliverables` (text[]), `deadline`, `application_deadline`, `posted_by` (refs profiles), `created_at`, `updated_at` | `marketplace_opportunities_status_idx`, `marketplace_opportunities_posted_by_idx`, `marketplace_opportunities_created_at_idx`                                             | Open CRUD for authenticated                 | 5,000       | LOW  |
| TBL-007  | `opportunity_applications`  | Talent applications to marketplace opportunities with cover letter, proposed rate, and portfolio. | `id` (PK), `opportunity_id` (refs marketplace_opportunities, CASCADE), `talent_id` (refs talents), `talent_email`, `talent_name`, `status` (pending/reviewing/accepted/rejected/withdrawn), `cover_letter`, `proposed_rate`, `portfolio_urls` (text[]), `notes`, `reviewed_at`, `reviewed_by` (refs profiles), `created_at`, `updated_at`                                             | `opportunity_applications_opportunity_idx`, `opportunity_applications_talent_email_idx`, `opportunity_applications_status_idx`, `opportunity_applications_created_at_idx` | Open SELECT/INSERT/UPDATE for authenticated | 15,000      | HIGH |

## Domain 3: Contacts & Decision Makers

| Table ID | Table Name        | Description                                                                                                          | Key Fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Indexes                                                  | RLS Policy                                                          | Est Rows Y1 | PII  |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- | ----------- | ---- |
| TBL-008  | `decision_makers` | 44,847 verified brand decision-maker contacts enriched via GrowMeOrganic. The crown-jewel dataset powering outreach. | `id` (PK), `owner_id` (refs profiles), `brand_id` (refs brands), `brand_name`, `full_name`, `role_title`, `role_tier`, `email`, `email_confidence`, `phone`, `linkedin_url`, `source` (jsonb), `verified`, `person_first_name`, `person_last_name`, `person_headline`, `person_job_title`, `person_location`, `person_business_email`, `person_personal_email`, `person_city`, `person_linkedin_id`, `person_company_name`, `company_meta_phones`, `person_picture`, `person_skills` (text[]), `person_connections`, `person_phone`, `company_domain`, `relevant_talent_types`, `created_at`, `updated_at` | `decision_makers_brand_idx`, `decision_makers_owner_idx` | SELECT open to authenticated; INSERT open; UPDATE/DELETE owner-only | 60,000      | HIGH |

## Domain 4: AI & Metering

| Table ID | Table Name       | Description                                                                                                                               | Key Fields                                                                                                                                                                                            | Indexes                                                                                 | RLS Policy                                    | Est Rows Y1 | PII |
| -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- | ----------- | --- |
| TBL-009  | `ai_usage`       | Monthly AI query counter per user. Composite PK on (user_id, month). Powers tier-based rate limiting: Free=5/mo, T1=50/mo, T2+=unlimited. | `user_id` (PK, refs profiles), `month` (PK, text 'YYYY-MM'), `query_count` (int)                                                                                                                      | Composite PK serves as index                                                            | SELECT/INSERT/UPDATE own rows only            | 30,000      | LOW |
| TBL-010  | `ai_rate_limits` | Daily per-user AI request counter. Used by edge functions for real-time rate limiting via atomic upsert RPC.                              | `user_id` (PK, refs profiles), `date` (PK, date), `request_count` (int)                                                                                                                               | `ai_rate_limits_date_idx`                                                               | Service-role only (no user-facing policies)   | 150,000     | LOW |
| TBL-011  | `ai_usage_logs`  | Detailed per-request AI telemetry: model, tokens, cost, latency. Used for cost monitoring and provider analytics.                         | `id` (PK), `user_id` (refs profiles), `agent`, `provider`, `model`, `fallback_used`, `batch_mode`, `latency_ms`, `prompt_length`, `input_tokens`, `output_tokens`, `estimated_cost_usd`, `created_at` | `ai_usage_logs_user_idx`, `ai_usage_logs_created_at_idx`, `ai_usage_logs_user_date_idx` | SELECT own rows; INSERT open to authenticated | 500,000     | LOW |

## Domain 5: Auth & Verification

| Table ID | Table Name            | Description                                                                                       | Key Fields                                                                                                                                                                                                                             | Indexes                                        | RLS Policy                           | Est Rows Y1 | PII    |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------ | ----------- | ------ |
| TBL-012  | `connected_accounts`  | OAuth-verified social platform connections. Stores access/refresh tokens for platform API access. | `id` (PK), `user_id` (refs profiles, CASCADE), `platform`, `platform_user_id`, `platform_username`, `access_token`, `refresh_token`, `token_expires_at`, `profile_data` (jsonb), `verified`, `connected_at`, UNIQUE(user_id, platform) | `idx_connected_user`, `idx_connected_platform` | All operations scoped to own user_id | 8,000       | HIGH   |
| TBL-013  | `verification_tokens` | Website ownership verification via DNS TXT, meta tag, or file upload.                             | `id` (PK), `user_id` (refs profiles, CASCADE), `url`, `token` (unique), `method`, `status`, `attempts`, `last_checked_at`, `verified_at`, `created_at`                                                                                 | `idx_tokens_user`, `idx_tokens_status`         | All operations scoped to own user_id | 3,000       | MEDIUM |

## Domain 6: Enrichment & Crawling

| Table ID | Table Name          | Description                                                                                       | Key Fields                                                                                                                                                                                                                                                                                                                          | Indexes                                             | RLS Policy                           | Est Rows Y1 | PII    |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------ | ----------- | ------ |
| TBL-014  | `enriched_creators` | AI-extracted creator profile data from crawled websites and social pages. One row per user.       | `id` (PK), `user_id` (refs profiles, CASCADE, UNIQUE), `display_name`, `bio`, `niche` (text[]), `profile_image_url`, `website_url`, `media_kit_url`, `rate_card` (jsonb), `audience_data` (jsonb), `past_brand_deals` (text[]), `content_themes` (text[]), `enrichment_raw` (jsonb), `last_enriched_at`, `created_at`, `updated_at` | `idx_enriched_creator_user`                         | All operations scoped to own user_id | 5,000       | MEDIUM |
| TBL-015  | `enriched_brands`   | AI-extracted brand profile data from crawled websites. One row per user.                          | `id` (PK), `user_id` (refs profiles, CASCADE, UNIQUE), `company_name`, `website_url`, `industry`, `products` (jsonb), `brand_voice`, `target_audience`, `social_links` (jsonb), `enrichment_raw` (jsonb), `last_enriched_at`, `created_at`, `updated_at`                                                                            | `idx_enriched_brand_user`                           | All operations scoped to own user_id | 2,000       | MEDIUM |
| TBL-016  | `crawl_jobs`        | Async enrichment queue for Crawl4AI jobs running on Railway. Tracks status, retries, and results. | `id` (PK), `user_id` (refs profiles), `url`, `job_type`, `status` (queued/running/completed/failed), `result` (jsonb), `error`, `retry_count`, `started_at`, `completed_at`, `created_at`                                                                                                                                           | `idx_jobs_status`, `idx_jobs_user`, `idx_jobs_type` | SELECT own rows only                 | 20,000      | LOW    |

## Domain 7: Deal Verification & Scoring

| Table ID | Table Name           | Description                                                                                                  | Key Fields                                                                                                                                                                                                                                  | Indexes                                                          | RLS Policy                              | Est Rows Y1 | PII |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------- | ----------- | --- |
| TBL-017  | `deal_verifications` | Proof-of-delivery verification via Crawl4AI. Confirms posts went live with correct brand mentions and links. | `id` (PK), `deal_id`, `creator_id` (refs profiles), `post_url`, `verified`, `brand_mentioned`, `links_correct`, `content_snapshot` (jsonb), `checked_at`                                                                                    | `idx_deal_verify_deal`                                           | Public read; service-role insert        | 10,000      | LOW |
| TBL-018  | `match_scores`       | Data-driven creator-brand match scores with breakdown by signal type. Unique per (creator, brand) pair.      | `id` (PK), `creator_id` (refs profiles), `brand_id` (refs profiles), `overall_score`, `breakdown` (jsonb), `signals` (text[]), `computed_at`, UNIQUE(creator_id, brand_id)                                                                  | `idx_match_creator`, `idx_match_brand`, `idx_match_score` (DESC) | Public read; service-role insert/update | 50,000      | LOW |
| TBL-019  | `deal_scores`        | Per-partnership deal health scores (0-100) with factor breakdown and improvement tips.                       | `id` (PK), `owner_id` (refs profiles, CASCADE), `partnership_id` (refs partnerships, CASCADE), `talent_id`, `brand_id`, `score` (0-100), `breakdown` (jsonb), `factors` (jsonb), `improvement_tips` (text[]), `calculated_at`, `created_at` | `deal_scores_owner_idx`, `deal_scores_partnership_idx`           | SELECT/INSERT/UPDATE own rows           | 25,000      | LOW |

## Domain 8: Brand Intelligence

| Table ID | Table Name             | Description                                                                                                                         | Key Fields                                                                                                                                                                                                                                                                                                                                               | Indexes                                                                                | RLS Policy                             | Est Rows Y1 | PII  |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- | ----------- | ---- |
| TBL-020  | `brand_signals`        | Real-time buying-intent signals: hiring, product launches, campaigns, funding rounds. Powers "who to email RIGHT NOW" intelligence. | `id` (PK), `brand_id` (refs brands, CASCADE), `brand_name`, `signal_type` (hiring/product_launch/campaign/funding/event_sponsor/competitor_move), `signal_strength` (low/medium/high/critical), `title`, `description`, `source_url`, `detected_at`, `expires_at`, `metadata` (jsonb), `created_at`                                                      | `idx_signals_brand`, `idx_signals_type`, `idx_signals_strength`, `idx_signals_expires` | Authenticated read; service-role write | 50,000      | LOW  |
| TBL-021  | `brand_budget_intel`   | Enriched brand budget data: estimated annual budget, fiscal year timing, peak spending months, campaign history. One row per brand. | `id` (PK), `brand_id` (refs brands, CASCADE, UNIQUE), `brand_name`, `estimated_annual_budget`, `budget_confidence` (low/medium/high), `fiscal_year_start`, `budget_cycle`, `peak_spending_months` (text[]), `recent_campaigns` (jsonb), `hiring_signals` (jsonb), `funding_history` (jsonb), `competitor_activity` (jsonb), `last_updated`, `created_at` | `idx_budget_brand`                                                                     | Authenticated read; service-role write | 3,000       | LOW  |
| TBL-022  | `industry_events`      | Conferences, festivals, trade shows, and award shows relevant to partnership timing.                                                | `id` (PK), `name`, `description`, `event_type`, `industry` (text[]), `location`, `start_date`, `end_date`, `website_url`, `estimated_attendees`, `creator_relevance`, `metadata` (jsonb), `created_at`                                                                                                                                                   | `idx_events_date`, `idx_events_industry` (GIN)                                         | Authenticated read; service-role write | 500         | NONE |
| TBL-023  | `brand_event_sponsors` | Maps brands to events they sponsor with sponsorship level and year. UNIQUE(brand_id, event_id, year).                               | `id` (PK), `brand_id` (refs brands, CASCADE), `brand_name`, `event_id` (refs industry_events, CASCADE), `event_name`, `sponsorship_level`, `year`, `notes`, `created_at`                                                                                                                                                                                 | `idx_sponsors_brand`, `idx_sponsors_event`                                             | Authenticated read; service-role write | 2,000       | NONE |

## Domain 9: Communication & Outreach

| Table ID | Table Name           | Description                                                                                       | Key Fields                                                                                                                                                                                                                                                                                         | Indexes                                                                                                            | RLS Policy                                  | Est Rows Y1 | PII    |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------- | ------ |
| TBL-024  | `outreach_emails`    | Individual outreach emails tied to partnerships. Tracks full lifecycle: draft to replied/bounced. | `id` (PK), `partnership_id` (refs partnerships), `sequence_id`, `subject`, `body`, `recipient_email`, `recipient_name`, `status` (draft/scheduled/sent/opened/clicked/replied/bounced), `sent_at`, `opened_at`, `replied_at`, `created_by` (refs profiles), `created_at`, `updated_at`             | `outreach_emails_partnership_idx`, `outreach_emails_status_idx`, `outreach_emails_created_at_idx`                  | Open CRUD for authenticated                 | 100,000     | HIGH   |
| TBL-025  | `outreach_sequences` | Multi-step automated outreach sequences with step definitions stored as JSONB.                    | `id` (PK), `name`, `description`, `status` (draft/active/paused/completed), `steps` (jsonb), `target_count`, `sent_count`, `open_rate`, `reply_rate`, `created_by` (refs profiles), `created_at`, `updated_at`                                                                                     | `outreach_sequences_created_by_idx`, `outreach_sequences_created_at_idx`                                           | Open CRUD for authenticated                 | 2,000       | LOW    |
| TBL-026  | `outreach_metrics`   | Daily aggregated outreach performance metrics per sequence.                                       | `id` (PK), `sequence_id` (refs outreach_sequences), `date`, `emails_sent`, `emails_opened`, `emails_clicked`, `emails_replied`, `emails_bounced`, `created_at`                                                                                                                                     | `outreach_metrics_sequence_idx`, `outreach_metrics_date_idx`                                                       | Open SELECT for authenticated               | 20,000      | LOW    |
| TBL-027  | `deal_notes`         | Timestamped notes, call logs, and meeting records attached to partnerships.                       | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `content`, `type` (note/call/meeting/email/task), `author_id` (refs profiles), `author_name`, `created_at`, `updated_at`                                                                                                                 | `deal_notes_partnership_idx`, `deal_notes_created_at_idx`                                                          | Open CRUD for authenticated                 | 50,000      | LOW    |
| TBL-028  | `tasks`              | Actionable tasks tied to partnerships with assignment, priority, and due dates.                   | `id` (PK), `title`, `description`, `status` (todo/in_progress/done/cancelled), `priority` (low/medium/high/urgent), `partnership_id` (refs partnerships), `assigned_to` (refs profiles), `assigned_to_email`, `due_date`, `completed_at`, `created_by` (refs profiles), `created_at`, `updated_at` | `tasks_status_idx`, `tasks_partnership_idx`, `tasks_assigned_to_idx`, `tasks_created_at_idx`                       | Open CRUD for authenticated                 | 30,000      | MEDIUM |
| TBL-029  | `notifications`      | In-app notification feed for all user roles. Supports both user_id and user_email targeting.      | `id` (PK), `user_id` (refs profiles, CASCADE), `user_email`, `title`, `message`, `type` (info/success/warning/error), `status`, `read`, `action_url`, `metadata` (jsonb), `created_at`                                                                                                             | `notifications_user_idx`, `notifications_read_idx`, `notifications_created_at_idx`, `notifications_user_email_idx` | Open SELECT/INSERT/UPDATE for authenticated | 200,000     | MEDIUM |
| TBL-030  | `email_connections`  | OAuth email provider connections (Gmail, Outlook) for sending outreach from user's own address.   | `id` (PK), `user_id` (refs profiles, CASCADE), `email_address`, `provider` (google), `access_token`, `refresh_token`, `token_expires_at`, `status` (active/expired/revoked), `created_at`, `updated_at`                                                                                            | `email_connections_user_idx`, UNIQUE(`user_id`, `email_address`)                                                   | Owner-scoped via RLS                        | 3,000       | HIGH   |

## Domain 10: Deals & Contracts

| Table ID | Table Name              | Description                                                                                                  | Key Fields                                                                                                                                                                                                                                                                                                                                                      | Indexes                                                                                        | RLS Policy                                                              | Est Rows Y1 | PII    |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- | ------ |
| TBL-031  | `contracts`             | Full contract lifecycle: draft through signed/expired/terminated. Supports dual signatures (brand + talent). | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `title`, `contract_type`, `terms` (jsonb), `total_value`, `payment_schedule` (jsonb), `file_url`, `status` (draft/sent/negotiating/signed/expired/terminated), `signed_by_brand_at`, `signed_by_talent_at`, `effective_date`, `expiry_date`, `created_by` (refs profiles), `created_at`, `updated_at` | `idx_contracts_partnership`, `idx_contracts_status`                                            | SELECT: creator + partnership participants; INSERT/UPDATE: creator only | 10,000      | MEDIUM |
| TBL-032  | `approval_items`        | Content/deliverable approval workflow items tied to partnerships.                                            | `id` (PK), `title`, `description`, `type`, `status` (pending/approved/rejected/revision_requested), `partnership_id` (refs partnerships), `submitted_by` (refs profiles), `reviewed_by` (refs profiles), `review_notes`, `due_date`, `created_at`, `updated_at`                                                                                                 | `approval_items_status_idx`, `approval_items_partnership_idx`, `approval_items_created_at_idx` | Open CRUD for authenticated                                             | 15,000      | LOW    |
| TBL-033  | `escrow_payments`       | Milestone-based escrow payments via Stripe. Funds held until conditions met.                                 | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `created_by` (refs profiles), `amount`, `currency` (USD), `status` (held/released/refunded/disputed), `milestone`, `condition`, `condition_met`, `stripe_payment_intent`, `released_at`, `created_at`, `updated_at`                                                                                   | `escrow_payments_partnership_idx`, `escrow_payments_created_by_idx`                            | SELECT/INSERT/UPDATE own rows                                           | 5,000       | LOW    |
| TBL-034  | `bundle_deals`          | Multi-talent campaign packages grouping multiple partnerships under a single brand campaign.                 | `id` (PK), `created_by` (refs profiles, CASCADE), `title`, `description`, `brand_id` (refs brands), `brand_name`, `talent_ids` (uuid[]), `total_budget`, `status` (draft/active/completed/cancelled), `partnership_ids` (uuid[]), `notes`, `created_at`, `updated_at`                                                                                           | `bundle_deals_created_by_idx`                                                                  | CRUD own rows only                                                      | 1,000       | LOW    |
| TBL-035  | `deal_disputes`         | Formal dispute records with evidence attachments and AI-powered analysis.                                    | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `created_by` (refs profiles), `reason`, `description`, `evidence` (jsonb), `status` (open/under_review/resolved/escalated/closed), `resolution`, `ai_analysis` (jsonb), `resolved_at`, `created_at`, `updated_at`                                                                                     | `deal_disputes_partnership_idx`, `deal_disputes_created_by_idx`                                | SELECT/INSERT/UPDATE own rows                                           | 500         | LOW    |
| TBL-036  | `partnership_proposals` | Versioned partnership proposals that can be sent, viewed, and negotiated.                                    | `id` (PK), `partnership_id` (refs partnerships), `title`, `content`, `status` (draft/sent/viewed/accepted/rejected/negotiating), `version`, `sent_at`, `viewed_at`, `responded_at`, `created_by` (refs profiles), `created_at`, `updated_at`                                                                                                                    | `partnership_proposals_partnership_idx`, `partnership_proposals_created_at_idx`                | Open CRUD for authenticated                                             | 8,000       | LOW    |

## Domain 11: Content & Pitch

| Table ID | Table Name           | Description                                                                                          | Key Fields                                                                                                                                                                                                                                                                                                    | Indexes                                                              | RLS Policy                              | Est Rows Y1 | PII    |
| -------- | -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- | ----------- | ------ |
| TBL-037  | `deck_library`       | Saved pitch decks and media kits. Supports templates and partnership-specific decks.                 | `id` (PK), `owner_id` (refs profiles, CASCADE), `user_email`, `title`, `deck_type`, `file_url`, `content` (jsonb), `tags` (text[]), `partnership_id` (refs partnerships), `brand_name`, `talent_name`, `is_template`, `created_at`, `updated_at`                                                              | `deck_library_owner_idx`                                             | CRUD own rows only                      | 5,000       | MEDIUM |
| TBL-038  | `pitch_competitions` | Brand-sponsored pitch competitions where talent submit proposals. Winners get partnership contracts. | `id` (PK), `created_by` (refs profiles, CASCADE), `title`, `description`, `brief`, `brand_id` (refs brands), `brand_name`, `budget_min`, `budget_max`, `deadline`, `status` (draft/open/judging/completed/cancelled), `submissions` (jsonb), `winner_id` (refs profiles), `rules`, `created_at`, `updated_at` | `pitch_competitions_created_by_idx`, `pitch_competitions_status_idx` | SELECT open; INSERT/UPDATE creator only | 200         | LOW    |

## Domain 12: Data Rooms

| Table ID | Table Name          | Description                                                                                       | Key Fields                                                                                                                                                                                                                                                                                                                        | Indexes                                                          | RLS Policy                                  | Est Rows Y1 | PII    |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------- | ----------- | ------ |
| TBL-039  | `data_room_entries` | Private data room content (past deals, case studies, performance metrics) organized by room type. | `id` (PK), `owner_id` (refs profiles, CASCADE), `owner_email`, `room_type` (talent/brand/agency), `title`, `brand_name`, `talent_name`, `platform`, `deal_type`, `deal_value`, `status`, `deliverables`, `performance_metrics` (jsonb), `visibility` (public/shared/private), `source`, `imported_at`, `created_at`, `updated_at` | `data_room_entries_owner_idx`, `data_room_entries_room_type_idx` | CRUD own rows only                          | 10,000      | MEDIUM |
| TBL-040  | `data_room_access`  | Access control for data rooms: NDA signing, time-limited access grants, approval workflow.        | `id` (PK), `owner_email`, `requester_email`, `requester_id` (refs profiles), `room_type` (talent/brand/agency), `access_level` (view/full/nda), `status` (pending/approved/denied/revoked), `nda_signed`, `nda_signed_at`, `granted_by` (refs profiles), `granted_at`, `expires_at`, `created_at`                                 | `data_room_access_owner_idx`, `data_room_access_requester_idx`   | Open SELECT/INSERT/UPDATE for authenticated | 5,000       | HIGH   |

## Domain 13: Platform Reference Data

| Table ID | Table Name               | Description                                                                                          | Key Fields                                                                                                                                                                                                       | Indexes                                                                                                  | RLS Policy                 | Est Rows Y1 | PII  |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------- | ----------- | ---- |
| TBL-041  | `platform_catalog`       | Master list of social platforms (Instagram, TikTok, YouTube, etc.) with API availability flags.      | `id` (PK), `name`, `slug` (unique), `category`, `icon_url`, `auth_type`, `base_url`, `api_available`, `active`, `created_at`                                                                                     | UNIQUE on `slug`                                                                                         | Public SELECT (incl. anon) | 25          | NONE |
| TBL-042  | `talent_types`           | 140+ talent type definitions across 12 categories (Digital Creators, Actors, Athletes, etc.).        | `id` (PK), `talent_type`, `category`, `subcategory`, `description`, `avg_rate_range`, `platforms` (text[]), `created_at`                                                                                         | None specified                                                                                           | Public SELECT (incl. anon) | 150         | NONE |
| TBL-043  | `talent_revenue_streams` | Revenue stream definitions per talent type with tier-based range estimates.                          | `id` (PK), `talent_type`, `stream_category`, `stream_name`, `low_range`, `mid_range`, `high_range`, `elite_range`, `micro_range`, `mega_range`, `notes`, `created_at`                                            | None specified                                                                                           | Public SELECT (incl. anon) | 1,000       | NONE |
| TBL-044  | `talent_revenue_matrix`  | Aggregated annual revenue estimates per talent category and tier.                                    | `id` (PK), `talent_category`, `tier`, `annual_low`, `annual_mid`, `annual_high`, `deal_count_avg`, `avg_deal_value`, `top_platforms` (text[]), `notes`, `created_at`                                             | None specified                                                                                           | Public SELECT (incl. anon) | 200         | NONE |
| TBL-045  | `culture_events`         | Cultural moments and events (holidays, awareness months, heritage celebrations) for campaign timing. | `id` (PK), `name`, `description`, `date`, `type`, `region`, `significance`, `target_demographics` (text[]), `partnership_opportunities` (text[]), `created_at`, `updated_at`                                     | `culture_events_date_idx`, `culture_events_type_idx`                                                     | Authenticated read         | 500         | NONE |
| TBL-046  | `mega_events`            | Major global events (Super Bowl, Olympics, World Cup) with sponsorship tier data.                    | `id` (PK), `name`, `description`, `start_date`, `end_date`, `location`, `expected_attendance`, `category`, `sponsorship_tiers` (jsonb), `created_at`, `updated_at`                                               | `mega_events_start_date_idx`                                                                             | Authenticated read         | 50          | NONE |
| TBL-047  | `conferences`            | Industry conferences with sponsorship availability and cost data.                                    | `id` (PK), `name`, `description`, `date`, `location`, `industry`, `website`, `expected_attendees`, `sponsorship_available`, `sponsorship_cost`, `created_at`, `updated_at`                                       | `conferences_date_idx`, `conferences_industry_idx`                                                       | Authenticated read         | 200         | NONE |
| TBL-048  | `demographic_segments`   | Pre-defined audience segments with psychographic and behavioral attributes for targeting.            | `id` (PK), `name`, `description`, `age_range`, `gender`, `income_range`, `interests` (text[]), `platforms` (text[]), `purchase_behavior`, `brand_affinity` (text[]), `size_estimate`, `created_at`, `updated_at` | `demographic_segments_created_at_idx`                                                                    | Authenticated read         | 50          | NONE |
| TBL-049  | `industry_guides`        | Published industry partnership guides with best practices and case studies.                          | `id` (PK), `title`, `industry`, `content`, `summary`, `key_metrics` (jsonb), `best_practices` (text[]), `case_studies` (jsonb), `published`, `created_at`, `updated_at`                                          | `industry_guides_industry_idx`                                                                           | Authenticated read         | 42          | NONE |
| TBL-050  | `rate_benchmarks`        | Creator rate benchmarks by platform, niche, tier, and content type. Powers rate card suggestions.    | `id` (PK), `platform`, `niche`, `tier`, `content_type`, `rate_min`, `rate_max`, `rate_median`, `currency`, `as_of_date`, `source`, `created_at`, `updated_at`                                                    | `rate_benchmarks_platform_idx`, `rate_benchmarks_niche_idx`, UNIQUE(platform, niche, tier, content_type) | Authenticated read         | 2,000       | NONE |
| TBL-051  | `roi_benchmarks`         | ROI benchmarks by industry and marketing channel for deal valuation.                                 | `id` (PK), `industry`, `channel`, `avg_roi`, `median_roi`, `top_quartile_roi`, `time_to_roi_days`, `sample_size`, `as_of_date`, `created_at`, `updated_at`                                                       | `roi_benchmarks_industry_idx`                                                                            | Authenticated read         | 500         | NONE |
| TBL-052  | `platform_multipliers`   | Rate multipliers per social platform for pricing calculations.                                       | `id` (PK), `platform` (unique), `base_multiplier`, `engagement_weight`, `reach_weight`, `notes`, `updated_at`                                                                                                    | UNIQUE on `platform`                                                                                     | Authenticated read         | 15          | NONE |
| TBL-053  | `category_premiums`      | Demand-based premium percentages per talent category.                                                | `id` (PK), `category` (unique), `premium_percent`, `demand_level` (low/medium/high/very_high), `notes`, `updated_at`                                                                                             | UNIQUE on `category`                                                                                     | Authenticated read         | 30          | NONE |
| TBL-054  | `viewership_tiers`       | Follower/viewership tier definitions per platform with associated rate ranges.                       | `id` (PK), `name`, `platform`, `min_followers`, `max_followers`, `min_views`, `max_views`, `avg_engagement_rate`, `typical_rate_min`, `typical_rate_max`, `description`, `created_at`, `updated_at`              | `viewership_tiers_platform_idx`                                                                          | Authenticated read         | 100         | NONE |

## Domain 14: Billing & Subscriptions

| Table ID | Table Name           | Description                                                                                     | Key Fields                                                                                                                                                                                                                                                                                                                                                               | Indexes                                                                                        | RLS Policy               | Est Rows Y1 | PII  |
| -------- | -------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------ | ----------- | ---- |
| TBL-055  | `subscription_plans` | Plan definitions per role and tier with Stripe price IDs, feature lists, and usage limits.      | `id` (PK), `name`, `tier`, `user_type` (brand/talent/agency), `price_monthly`, `price_annual`, `stripe_price_id_monthly`, `stripe_price_id_annual`, `features` (jsonb), `limits` (jsonb), `is_active`, `created_at`, `updated_at`                                                                                                                                        | `subscription_plans_user_type_idx`, `subscription_plans_tier_idx`                              | Authenticated read       | 15          | NONE |
| TBL-056  | `user_subscriptions` | Active subscription records per user with Stripe integration, trial tracking, and usage limits. | `id` (PK), `user_id` (refs profiles, CASCADE), `user_email`, `user_type`, `plan_id` (refs subscription_plans), `current_plan`, `status` (active/past_due/cancelled/trialing/incomplete), `stripe_customer_id`, `stripe_subscription_id`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `trial_end`, `limits` (jsonb), `created_at`, `updated_at` | `user_subscriptions_user_idx`, `user_subscriptions_stripe_customer_idx`                        | Authenticated read/write | 5,000       | HIGH |
| TBL-057  | `billing_history`    | Invoice and payment history with Stripe references, receipt URLs, and billing period tracking.  | `id` (PK), `user_id` (refs profiles), `user_email`, `user_type`, `amount`, `currency`, `status` (paid/pending/failed/refunded), `stripe_invoice_id`, `stripe_payment_intent`, `description`, `invoice_url`, `receipt_url`, `plan_name`, `billing_period_start`, `billing_period_end`, `created_at`                                                                       | `billing_history_user_idx`, `billing_history_user_email_idx`, `billing_history_created_at_idx` | Authenticated read       | 20,000      | HIGH |

## Domain 15: Social & Connected Platforms

| Table ID | Table Name            | Description                                                                                                                          | Key Fields                                                                                                                                                                                                                                                                                              | Indexes                                                                                        | RLS Policy                                   | Est Rows Y1 | PII  |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- | ---- |
| TBL-058  | `connected_platforms` | Talent-linked social platform accounts with follower counts and engagement rates. Distinct from `connected_accounts` (OAuth tokens). | `id` (PK), `talent_id` (refs talents, CASCADE), `owner_id` (refs profiles, CASCADE), `platform`, `platform_id`, `username`, `profile_url`, `followers`, `engagement_rate`, `auth_method`, `verified`, `access_token`, `refresh_token`, `token_expires_at`, `last_synced_at`, `created_at`, `updated_at` | `connected_platforms_talent_idx`, `connected_platforms_owner_idx`, UNIQUE(talent_id, platform) | SELECT open; INSERT/UPDATE/DELETE owner only | 15,000      | HIGH |

## Domain 16: Referrals

| Table ID | Table Name  | Description                                                                                 | Key Fields                                                                                                                                                                                                                                                                                                        | Indexes                                        | RLS Policy                             | Est Rows Y1 | PII  |
| -------- | ----------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------- | ----------- | ---- |
| TBL-059  | `referrals` | User referral tracking with unique referral codes, conversion funnel, and reward lifecycle. | `id` (PK), `referrer_id` (refs profiles, CASCADE), `referrer_email`, `referral_code` (unique), `referred_email`, `referred_id` (refs profiles), `referred_signed_up`, `referred_upgraded`, `reward_type`, `reward_claimed`, `status` (pending/signed_up/converted/rewarded/expired), `created_at`, `converted_at` | `referrals_referrer_idx`, `referrals_code_idx` | CRUD own rows (referrer_id = auth.uid) | 10,000      | HIGH |

## Domain 17: Teams & Collaboration

| Table ID | Table Name     | Description                                                         | Key Fields                                                                                                                                      | Indexes                                                                    | RLS Policy               | Est Rows Y1 | PII    |
| -------- | -------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ | ----------- | ------ |
| TBL-060  | `teams`        | Team containers for agency/brand multi-user accounts.               | `id` (PK), `name`, `description`, `owner_id` (refs profiles), `owner_email`, `settings` (jsonb), `created_at`, `updated_at`                     | `teams_owner_idx`                                                          | Authenticated read/write | 500         | LOW    |
| TBL-061  | `team_members` | Team membership with role-based access (owner/admin/member/viewer). | `id` (PK), `team_id` (refs teams, CASCADE), `user_id` (refs profiles), `email`, `member_email`, `role` (owner/admin/member/viewer), `joined_at` | `team_members_team_idx`, `team_members_user_idx`, UNIQUE(team_id, user_id) | Authenticated read/write | 2,000       | MEDIUM |

## Domain 18: Settings & Newsletter

| Table ID | Table Name                 | Description                                                                                                  | Key Fields                                                                                                                                                                                                                                                                                                           | Indexes             | RLS Policy                                                | Est Rows Y1 | PII  |
| -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------- | ----------- | ---- |
| TBL-062  | `newsletter_subscribers`   | Blog and marketing newsletter opt-ins. Supports anonymous (anon) inserts from public pages.                  | `id` (PK), `email` (unique), `source`, `subscribed_at`, `unsubscribed_at`, `status` (active/unsubscribed), `created_at`                                                                                                                                                                                              | UNIQUE on `email`   | INSERT open to anon + authenticated; SELECT authenticated | 10,000      | HIGH |
| TBL-063  | `notification_preferences` | Per-user notification settings: channels, digest frequency, quiet hours, category toggles. One row per user. | `id` (PK), `user_id` (refs profiles, CASCADE, UNIQUE), `in_app_enabled`, `email_enabled`, `email_digest_frequency` (realtime/daily/weekly/none), `notify_deal_updates`, `notify_approvals`, `notify_outreach`, `notify_marketplace`, `notify_team`, `quiet_hours_start`, `quiet_hours_end`, `timezone`, `updated_at` | UNIQUE on `user_id` | CRUD own row only                                         | 5,000       | LOW  |

## Domain 19: Analytics & Audit

| Table ID | Table Name                  | Description                                                                                | Key Fields                                                                                                                                                                                                                                            | Indexes                                                                                          | RLS Policy                                                            | Est Rows Y1 | PII    |
| -------- | --------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ----------- | ------ |
| TBL-064  | `audit_logs`                | Immutable audit trail of all significant user actions with before/after snapshots.         | `id` (PK), `user_id` (refs profiles), `action`, `entity_type`, `entity_id`, `old_values` (jsonb), `new_values` (jsonb), `ip_address` (inet), `user_agent`, `created_at`                                                                               | `idx_audit_logs_entity(entity_type, entity_id)`, `idx_audit_logs_user(user_id, created_at DESC)` | SELECT own rows; INSERT for service_role + authenticated              | 500,000     | MEDIUM |
| TBL-065  | `partnership_stage_history` | Tracks every partnership status transition with duration-in-stage calculations.            | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `from_status`, `to_status`, `changed_by` (refs profiles), `notes`, `duration_in_stage` (interval), `created_at`                                                                             | `idx_stage_history_partnership(partnership_id, created_at DESC)`                                 | SELECT open to authenticated; INSERT for service_role + authenticated | 100,000     | LOW    |
| TBL-066  | `analytics_daily_snapshots` | Daily per-user KPI snapshots for dashboard trend charts. Written by nightly edge function. | `id` (PK), `user_id` (refs profiles, CASCADE), `snapshot_date`, `total_partnerships`, `active_pipeline_value`, `closed_revenue`, `new_deals_count`, `emails_sent`, `emails_replied`, `ai_requests_used`, `created_at`, UNIQUE(user_id, snapshot_date) | `idx_snapshots_user_date(user_id, snapshot_date DESC)`                                           | SELECT own rows; INSERT own rows (service-role primary writer)        | 50,000      | LOW    |

## Domain 20: Deal Workflow

| Table ID | Table Name              | Description                                                   | Key Fields                                                                                                                                                                  | Indexes                                 | RLS Policy               | Est Rows Y1 | PII |
| -------- | ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------ | ----------- | --- |
| TBL-067  | `activation_checklists` | Post-contract activation checklists with completion tracking. | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `title`, `items` (jsonb), `completion_percent`, `created_by` (refs profiles), `created_at`, `updated_at`          | `activation_checklists_partnership_idx` | Authenticated read/write | 5,000       | LOW |
| TBL-068  | `planning_timelines`    | Campaign planning timelines with milestone definitions.       | `id` (PK), `partnership_id` (refs partnerships, CASCADE), `title`, `milestones` (jsonb), `start_date`, `end_date`, `created_by` (refs profiles), `created_at`, `updated_at` | `planning_timelines_partnership_idx`    | Authenticated read/write | 5,000       | LOW |

### Total Estimated Rows at End of Year 1: ~1,700,000

### Storage Estimate

| Category          | Tables                                               | Est Rows       | Avg Row Size | Est Storage |
| ----------------- | ---------------------------------------------------- | -------------- | ------------ | ----------- |
| Core entities     | profiles, brands, talents, partnerships              | 43,000         | 2 KB         | 86 MB       |
| Contacts          | decision_makers                                      | 60,000         | 1.5 KB       | 90 MB       |
| Activities & logs | activities, audit_logs, ai_usage_logs, notifications | 800,000        | 0.5 KB       | 400 MB      |
| Communication     | outreach_emails, sequences, metrics, notes, tasks    | 202,000        | 1 KB         | 202 MB      |
| Intelligence      | brand_signals, budget_intel, events, sponsors        | 55,500         | 0.8 KB       | 44 MB       |
| Everything else   | remaining 40+ tables                                 | ~540,000       | 0.5 KB       | 270 MB      |
| **Total**         | **68 tables**                                        | **~1,700,000** |              | **~1.1 GB** |

---

# DELIVERABLE 5: RBAC MATRIX

## Role Definitions

| Role            | Description                                       | Default Plan | Can Upgrade To |
| --------------- | ------------------------------------------------- | ------------ | -------------- |
| **Public**      | Unauthenticated visitor on thedealstage.com       | N/A          | Sign up        |
| **Talent Free** | Talent on Free plan (5 AI queries/month)          | Free         | Tier 1, 2, 3   |
| **Talent Paid** | Talent on any paid tier ($99-$3,499/mo)           | Tier 1+      | Higher tiers   |
| **Brand Free**  | Brand on Free plan (5 AI queries/month)           | Free         | Tier 1, 2, 3   |
| **Brand Paid**  | Brand on any paid tier ($249-$3,499/mo)           | Tier 1+      | Higher tiers   |
| **Agency Free** | Agency on Free plan (5 AI queries/month)          | Free         | Tier 1, 2, 3   |
| **Agency Paid** | Agency on any paid tier ($799-$3,499/mo)          | Tier 1+      | Higher tiers   |
| **Manager**     | Individual talent manager (subset of talent role) | Free or Paid | Tier 1, 2, 3   |
| **Admin**       | Platform administrator (founder / ops)            | N/A          | N/A            |

## Permission Matrix

### Legend

| Symbol   | Meaning                                                |
| -------- | ------------------------------------------------------ |
| &#10003; | Fully allowed                                          |
| &#10007; | Denied                                                 |
| &#9675;  | Conditional / tier-gated (requires specific paid tier) |
| R        | Read-only access                                       |

### Account & Profile

| Resource / Action         | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| View public landing pages | &#10003; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Sign up / create account  | &#10003; | N/A         | N/A         | N/A        | N/A        | N/A         | N/A         | N/A      | N/A      |
| View own profile          | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Edit own profile          | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View other user profiles  | &#10007; | R           | R           | R          | R          | R           | R           | R        | &#10003; |
| Complete onboarding       | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Change own role           | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| Set role to admin         | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |

### Brand Directory & Contacts

| Resource / Action               | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Browse brand directory          | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View brand details              | &#10007; | R           | &#10003;    | R          | &#10003;   | R           | &#10003;    | R        | &#10003; |
| View brand intelligence signals | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| View brand budget intel         | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| View decision-maker contacts    | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| View contact email addresses    | &#10007; | &#10007;    | &#10003;    | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| View contact phone numbers      | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#9675;    | &#10007;    | &#9675;     | &#10007; | &#10003; |
| Export contact data             | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#9675;    | &#10007;    | &#9675;     | &#10007; | &#10003; |
| Create/edit own brand profile   | &#10007; | &#10007;    | &#10007;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10007; | &#10003; |

### Talent Directory

| Resource / Action              | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------------ | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Browse talent directory        | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View talent details            | &#10007; | R           | &#10003;    | R          | &#10003;   | R           | &#10003;    | R        | &#10003; |
| View talent rate cards         | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create/edit own talent profile | &#10007; | &#10003;    | &#10003;    | &#10007;   | &#10007;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create talent (as manager)     | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10003; | &#10003; |

### AI Features

| Resource / Action             | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ----------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| AI Chat / Query               | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| AI Match Scoring              | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| AI Outreach Drafting          | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| AI Pitch Deck Generation      | &#10007; | &#10007;    | &#10003;    | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| AI Deal Analysis              | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#9675;    | &#10007;    | &#10003;    | &#10007; | &#10003; |
| AI Brand Intelligence Reports | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| AI Dispute Analysis           | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#9675;    | &#10007;    | &#10003;    | &#10007; | &#10003; |

### Partnerships & Deal Pipeline

| Resource / Action          | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| -------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| View own partnerships      | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create partnership         | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Edit partnership details   | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Delete partnership         | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View deal pipeline stages  | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View partnership proposals | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create/send proposals      | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| Create bundle deals        | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| File deal disputes         | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Contracts & Payments

| Resource / Action       | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ----------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| View contracts          | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create contracts        | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| Sign contracts          | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create escrow payments  | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| Release escrow payments | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| View billing history    | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Marketplace

| Resource / Action         | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Browse marketplace        | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Post opportunity          | &#10007; | &#10007;    | &#10007;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10007; | &#10003; |
| Apply to opportunity      | &#10007; | &#10003;    | &#10003;    | &#10007;   | &#10007;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Review applications       | &#10007; | &#10007;    | &#10007;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10007; | &#10003; |
| Enter pitch competitions  | &#10007; | &#10003;    | &#10003;    | &#10007;   | &#10007;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Create pitch competitions | &#10007; | &#10007;    | &#10007;    | &#9675;    | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |

### Outreach & Communication

| Resource / Action         | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Send outreach emails      | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| Create outreach sequences | &#10007; | &#10007;    | &#10003;    | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| View outreach metrics     | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Connect email provider    | &#10007; | &#10007;    | &#10003;    | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |
| Manage deal notes         | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Manage tasks              | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Data Rooms

| Resource / Action          | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| -------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Create data room entries   | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Share data room            | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| Request data room access   | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Grant/deny access requests | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Content & Decks

| Resource / Action    | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| -------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Create pitch decks   | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Use deck templates   | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| Save to deck library | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Teams & Collaboration

| Resource / Action               | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Create team                     | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#9675;    | &#10003;    | &#10003;    | &#10007; | &#10003; |
| Invite team members             | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#9675;    | &#10003;    | &#10003;    | &#10007; | &#10003; |
| Manage team roles               | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#9675;    | &#10003;    | &#10003;    | &#10007; | &#10003; |
| Manage multiple talent (agency) | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10003;    | &#10003;    | &#10007; | &#10003; |

### Platform & Verification

| Resource / Action        | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------ | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Connect social platforms | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Verify website ownership | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Trigger enrichment crawl | &#10007; | &#9675;     | &#10003;    | &#9675;    | &#10003;   | &#9675;     | &#10003;    | &#9675;  | &#10003; |
| View enrichment results  | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Billing & Subscription

| Resource / Action        | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------ | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| View subscription plans  | &#10003; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Upgrade/downgrade plan   | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View invoices & receipts | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Manage payment method    | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| Generate referral code   | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |

### Reference Data & Benchmarks

| Resource / Action        | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| ------------------------ | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| View talent type catalog | &#10003; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View rate benchmarks     | &#10007; | R           | &#10003;    | R          | &#10003;   | R           | &#10003;    | R        | &#10003; |
| View industry guides     | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View culture/mega events | &#10007; | &#10003;    | &#10003;    | &#10003;   | &#10003;   | &#10003;    | &#10003;    | &#10003; | &#10003; |
| View ROI benchmarks      | &#10007; | &#10007;    | &#9675;     | &#10007;   | &#10003;   | &#10007;    | &#10003;    | &#10007; | &#10003; |

### Admin Panel

| Resource / Action           | Public   | Talent Free | Talent Paid | Brand Free | Brand Paid | Agency Free | Agency Paid | Manager  | Admin    |
| --------------------------- | -------- | ----------- | ----------- | ---------- | ---------- | ----------- | ----------- | -------- | -------- |
| Access admin dashboard      | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| View all user accounts      | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| Modify user roles           | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| View platform analytics     | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| View audit logs (all users) | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| Manage subscription plans   | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| Seed/manage reference data  | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| Manage brand intelligence   | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |
| Export platform data        | &#10007; | &#10007;    | &#10007;    | &#10007;   | &#10007;   | &#10007;    | &#10007;    | &#10007; | &#10003; |

## API Rate Limits by Tier

| Limit Type                  | Free | Tier 1 | Tier 2    | Tier 3    | Admin     |
| --------------------------- | ---- | ------ | --------- | --------- | --------- |
| AI queries per month        | 5    | 50     | Unlimited | Unlimited | Unlimited |
| AI queries per day          | 2    | 10     | 100       | 500       | Unlimited |
| Outreach emails per month   | 0    | 50     | 200       | Unlimited | Unlimited |
| Outreach sequences          | 0    | 2      | 10        | Unlimited | Unlimited |
| Contact views per month     | 10   | 100    | 500       | Unlimited | Unlimited |
| Data exports per month      | 0    | 5      | 25        | Unlimited | Unlimited |
| Data room entries           | 5    | 50     | 200       | Unlimited | Unlimited |
| Deck library items          | 3    | 20     | 100       | Unlimited | Unlimited |
| Active partnerships         | 5    | 25     | 100       | Unlimited | Unlimited |
| Team members (agency/brand) | 0    | 0      | 3         | 10        | Unlimited |
| Enrichment crawls per month | 0    | 5      | 20        | Unlimited | Unlimited |
| API requests per minute     | 30   | 60     | 120       | 300       | Unlimited |

## Pricing by Role and Tier

| Tier   | Talent  | Brand     | Agency    |
| ------ | ------- | --------- | --------- |
| Free   | $0/mo   | $0/mo     | $0/mo     |
| Tier 1 | $99/mo  | $249/mo   | $799/mo   |
| Tier 2 | $249/mo | $799/mo   | $1,799/mo |
| Tier 3 | $499/mo | $1,499/mo | $3,499/mo |

## RLS Enforcement Architecture

```
Client Request
     |
     v
Supabase Auth (JWT with user_id + role)
     |
     v
PostgreSQL RLS Policies
     |
     +-- auth.uid() = owner_id          (ownership check)
     +-- role IN ('admin')              (admin bypass)
     +-- true                           (public reference tables)
     +-- service_role                   (edge function bypass)
     |
     v
Frontend Feature Gate (useFeatureGate.js)
     |
     +-- profiles.plan                  (tier check)
     +-- profiles.role                  (role check)
     +-- ai_usage.query_count           (metering check)
     |
     v
Edge Function Rate Limiter
     |
     +-- ai_rate_limits.request_count   (daily limit)
     +-- increment_ai_rate_limit()      (atomic increment)
```

---

# DELIVERABLE 17: CUSTOMER PERSONA PROFILES

## Persona 1: Rising Creator ("Maya the Micro-Influencer")

### Demographics

| Attribute            | Value                                                     |
| -------------------- | --------------------------------------------------------- |
| Name archetype       | Maya R.                                                   |
| Age                  | 22-28                                                     |
| Gender               | Female (60%) / Male (30%) / Non-binary (10%)              |
| Location             | Urban -- Los Angeles, Atlanta, New York, Miami            |
| Education            | College degree or current student                         |
| Household income     | $30K-$60K (supplemented by creator income)                |
| Follower range       | 10K-100K across platforms                                 |
| Primary platform     | Instagram or TikTok                                       |
| Talent category      | Digital Creator (Lifestyle, Beauty, Fitness)              |
| Current monetization | Sporadic gifted products, occasional $200-$500 paid posts |

### Psychographics

- **Identity:** Sees content creation as their future career, not a hobby
- **Motivation:** Wants to turn passion into sustainable income and prove to family that "this is a real job"
- **Values:** Authenticity, creative freedom, fair compensation
- **Aspiration:** Become a mid-tier creator earning $5K-$10K/month from brand deals within 18 months
- **Content style:** Trend-driven with personal flair; posts 5-7 times per week
- **Tech comfort:** High -- native to social platforms, uses Canva, CapCut, and free analytics tools
- **Decision style:** Impulsive but cautious with money; researches before paying for tools

### Pain Points

1. **No idea what to charge.** Has been offered $50 for work worth $500 and accepted because they did not know better.
2. **Cannot find brands to pitch.** Spends hours DMing brands with no response. Does not know who the decision maker is.
3. **No professional infrastructure.** Has no media kit, no rate card, no contract template. Relies on DMs and handshakes.
4. **Feels invisible.** Applied to 50+ brand programs and either got rejected or ghosted. Algorithms changed and growth stalled.
5. **Imposter syndrome.** Thinks they are "too small" for real brand deals. Does not realize 10K followers is valuable to many brands.

### Buying Triggers

- Receives first inbound brand inquiry and panics about what to charge
- Sees a peer with similar following announce a paid partnership
- Gets rejected from a brand collab platform for being "too small"
- Hits a follower milestone (10K, 25K, 50K) and wants to monetize
- Tax season arrives and they realize they need to treat this as a business

### Objections

1. **"$99/month is a lot when I'm not making money yet."** -- Counter: One brand deal found through DealStage pays for a full year of the platform.
2. **"I can just DM brands for free."** -- Counter: You can, but your response rate is under 2%. Our verified contacts and AI outreach get 15-25% response rates.
3. **"I don't have enough followers."** -- Counter: We match on niche fit and engagement, not just follower count. Micro-influencers command premium engagement rates.
4. **"I've been burned by platforms that promised brand deals."** -- Counter: We do not promise deals. We give you 1,200+ real brands with verified decision-maker contacts. You control the outreach.

### Channels

| Channel                                                            | Priority  | Why                                                                              |
| ------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| TikTok (organic)                                                   | Primary   | Creator education content is huge; "how I got my first brand deal" videos        |
| Instagram Reels                                                    | Primary   | Visual proof of platform features; before/after pitch deck comparisons           |
| YouTube (creator economy channels)                                 | Secondary | 10-minute "tools I use" recommendation videos from established creators          |
| Reddit (r/influencermarketing, r/socialmedia)                      | Secondary | Active community seeking tool recommendations                                    |
| Newsletter partnerships (Creator Economy Newsletter, Passionfruit) | Tertiary  | Trusted creator-economy sources                                                  |
| Google Search                                                      | Tertiary  | "how to get brand deals," "influencer rate calculator," "brand contact database" |

### Ideal First 10 Minutes on Platform

1. **Minute 0-1:** Signs up, selects "Talent" role, picks "Lifestyle Vlogger" from talent type selector
2. **Minute 1-3:** Onboarding wizard asks about niche, primary platform, follower count. Platform auto-suggests tier (micro)
3. **Minute 3-5:** Browses brand directory filtered by "relevant to Lifestyle Vlogger." Sees 80+ brands with industry, budget range, and talent types they work with
4. **Minute 5-7:** Clicks on a brand they love (e.g., Glossier). Sees brand details, recent signals ("hiring influencer marketing coordinator" -- HIGH buying intent), and 3 verified decision-maker contacts
5. **Minute 7-9:** Uses first AI query: "Write a pitch email to Glossier's influencer marketing manager." AI generates personalized outreach based on Maya's profile and Glossier's brand values
6. **Minute 9-10:** Saves the brand to a partnership pipeline in "outreach_pending" status. Gets prompted to check rate benchmarks for her tier and niche

### Aha Moment

"Wait -- I can see the actual email address and LinkedIn of the person who approves influencer deals at Nike? And the AI wrote me a pitch in 10 seconds? I've been DMing @nike on Instagram for months."

### Price Sensitivity

HIGH. Will start on Free tier and use all 5 AI queries in the first session. Conversion to Tier 1 ($99/mo) happens when they close their first deal through the platform or when they exhaust free contacts and realize the value. Expected conversion timeline: 2-4 weeks.

### Estimated LTV

- **Conversion rate:** 12-15% from free to paid within 60 days
- **Starting tier:** Tier 1 ($99/mo)
- **Average tenure:** 14 months
- **Upgrade rate:** 20% upgrade to Tier 2 within 6 months
- **Estimated LTV:** $1,600-$2,200

---

## Persona 2: Established Influencer ("Jordan the Deal Machine")

### Demographics

| Attribute            | Value                                                   |
| -------------------- | ------------------------------------------------------- |
| Name archetype       | Jordan K.                                               |
| Age                  | 26-35                                                   |
| Gender               | Balanced gender distribution                            |
| Location             | Major US metros; increasingly international             |
| Education            | Bachelor's degree; some MBA/business coursework         |
| Household income     | $100K-$300K (primarily from brand deals)                |
| Follower range       | 100K-1M across platforms                                |
| Primary platform     | Instagram + YouTube (multi-platform)                    |
| Talent category      | Digital Creator (Fashion, Tech, Fitness, or Travel)     |
| Current monetization | 10-20 active brand partnerships/year, $2K-$15K per deal |

### Psychographics

- **Identity:** Professional creator who runs their business like a business. Has an LLC, an accountant, and maybe a part-time assistant
- **Motivation:** Scale from "good money" to "life-changing money" by optimizing deal flow, increasing deal size, and diversifying brand relationships
- **Values:** Professionalism, data-driven decisions, brand alignment, long-term partnerships over one-offs
- **Aspiration:** Build a personal brand empire generating $500K+/year with a team of 2-3
- **Content style:** Polished, consistent brand voice, posts on a content calendar
- **Tech comfort:** Uses scheduling tools, analytics dashboards, CRM-adjacent spreadsheets
- **Decision style:** Analytical. Evaluates ROI before committing to any tool. Trials before buying

### Pain Points

1. **Deal pipeline chaos.** Manages partnerships across Gmail, Google Sheets, WhatsApp, and memory. Dropped a $10K deal because an email got buried.
2. **Undercharging on deals.** Knows they are leaving money on the table but has no benchmark data for their specific niche + tier + platform combo.
3. **Brand discovery plateau.** Works with the same 10-15 brands repeatedly. Wants to break into new industries (automotive, fintech) but has no contacts.
4. **Contract and payment friction.** Half their deals have no written contract. Got stiffed on a $5K deal with no recourse.
5. **Time wasted on admin.** Spends 15-20 hours/week on partnership admin (emails, proposals, invoicing) instead of creating content.

### Buying Triggers

- Lost a deal due to disorganization (the direct catalyst to seek a CRM-like tool)
- Realized they left $50K+ on the table last year from underpriced deals
- Got approached by a manager/agency and wants to compare DIY vs. managed approach
- Competitor creator started landing bigger brands and they want to know how
- Year-end financial review shows revenue concentration risk (70%+ from 2-3 brands)

### Objections

1. **"I already use a spreadsheet system that works."** -- Counter: Your spreadsheet cannot send AI-drafted outreach to 45K verified contacts or track email opens. Show them time savings calculator.
2. **"$249/month is expensive for a creator tool."** -- Counter: One additional $3K deal per quarter pays for 3 years of the platform. Show ROI math.
3. **"I don't want to share my data with a platform."** -- Counter: Your data room is private by default. You control who sees what, with NDA-gated access.
4. **"I have an agent/manager who handles this."** -- Counter: 30% of their top-tier clients use DealStage alongside their manager. It is complementary, not competitive.

### Channels

| Channel                                    | Priority  | Why                                                                               |
| ------------------------------------------ | --------- | --------------------------------------------------------------------------------- |
| Creator-focused podcasts                   | Primary   | Long-form trust building; guest spots on "Colin and Samir," "The Creator Economy" |
| LinkedIn                                   | Primary   | Professional creator audience; thought leadership on deal structures              |
| Instagram (targeted ads)                   | Primary   | Retarget users who visited pricing page or competitor pages                       |
| YouTube creator education                  | Secondary | Feature spotlights, "Day in the life of a full-time creator"                      |
| Word of mouth / referral                   | Secondary | This persona trusts peer recommendations above all else                           |
| Email (cold outreach to mid-tier creators) | Tertiary  | Personalized outreach with rate benchmark data as lead magnet                     |

### Ideal First 10 Minutes on Platform

1. **Minute 0-2:** Signs up, selects "Talent" role. Connects Instagram and YouTube via OAuth. Platform auto-pulls follower count, engagement rate, and niche
2. **Minute 2-4:** Views personalized dashboard: AI-calculated "Deal Score" based on their profile completeness, rate benchmarks for their tier showing they are 30% below market rate
3. **Minute 4-6:** Explores brand directory filtered by "high buying intent signals." Sees 5 brands with recent hiring activity that match their niche. Each shows budget intel and decision-maker contacts
4. **Minute 6-8:** Creates first partnership in pipeline for a brand they have been eyeing. AI generates a personalized pitch email referencing the brand's recent product launch (detected by brand intelligence)
5. **Minute 8-10:** Sets up their data room with 3 past deal case studies. Explores rate benchmarks and realizes they should be charging 40% more for YouTube integrations

### Aha Moment

"I can see that Adidas posted 3 influencer marketing job listings this month, their fiscal year resets in April, and their VP of Partnerships is right here with a verified email. My spreadsheet could never do this."

### Price Sensitivity

MODERATE. Willing to pay for tools that demonstrably save time or increase revenue. Will likely start on Tier 1 ($99/mo) to test, then upgrade to Tier 2 ($249/mo) within 30 days when they see the full contact database and advanced AI features. Annual billing attractive at this level.

### Estimated LTV

- **Conversion rate:** 25-30% from free to paid within 14 days
- **Starting tier:** Tier 1 ($99/mo), rapid upgrade to Tier 2
- **Average tenure:** 24 months
- **Upgrade rate:** 50% reach Tier 2, 10% reach Tier 3
- **Estimated LTV:** $5,000-$7,500

---

## Persona 3: Professional Athlete ("Marcus the MVP")

### Demographics

| Attribute            | Value                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Name archetype       | Marcus D.                                                                                   |
| Age                  | 23-32                                                                                       |
| Gender               | Male (75%) / Female (25%)                                                                   |
| Location             | Team market city (Miami, Dallas, Chicago, New York)                                         |
| Education            | Some college (left for pro career)                                                          |
| Household income     | $500K-$5M+ (salary + endorsements)                                                          |
| Follower range       | 200K-5M                                                                                     |
| Primary platform     | Instagram, Twitter/X                                                                        |
| Talent category      | Team Sports Athletes (NBA, NFL, MLS)                                                        |
| Current monetization | 1-5 endorsement deals managed by agent, mostly big brands; missing mid-market opportunities |

### Psychographics

- **Identity:** Athlete first, but increasingly aware that careers are short and brand equity must be built now
- **Motivation:** Maximize earning window. The average NFL career is 3.3 years. Every month without a deal is lost opportunity
- **Values:** Loyalty, authenticity, legacy. Does not want to promote products they do not use
- **Aspiration:** Build a post-career business empire (a la LeBron, Shaq) starting with endorsement portfolio
- **Content style:** Behind-the-scenes, lifestyle, training. Authenticity over polish
- **Tech comfort:** Moderate. Uses phone primarily. Delegates most business tasks to agent/manager
- **Decision style:** Trusts inner circle (agent, family, financial advisor). Will not sign up for anything without advisor approval

### Pain Points

1. **Agent only brings big deals.** Agent focuses on $100K+ endorsements with Nike and Gatorade. Misses $5K-$50K deals with local businesses, DTC brands, and regional companies that add up to $200K+/year.
2. **No visibility into deal landscape.** Does not know which brands are actively spending on athlete endorsements in their sport and market.
3. **NIL confusion (for younger athletes).** NCAA NIL rules are complex. Current athletes and recent pros do not know what they can and cannot do.
4. **Off-season monetization gaps.** Income drops dramatically during off-season. Needs year-round partnership pipeline.
5. **Post-career anxiety.** Knows the checks stop when they retire. Wants to build brand relationships that transition into long-term ambassador deals and business ventures.

### Buying Triggers

- Off-season starts and they realize they have no deals lined up for the next 4 months
- Teammate lands a deal with a brand Marcus thought was "out of his league" -- turns out they just did not know who to email
- Financial advisor flags income concentration: 80% from salary, 20% from one endorsement
- Sees DealStage featured in a sports business publication or recommended by another athlete
- Agent drops them or they switch agents and realize how little visibility they had

### Objections

1. **"My agent handles all my deals."** -- Counter: Your agent handles your top 3 deals. DealStage surfaces the other 20-30 opportunities they are not pursuing. Show the "long tail" revenue math.
2. **"I don't have time for another platform."** -- Counter: Your agent or manager can use DealStage on your behalf. The Manager role is built for this exact scenario.
3. **"I'm not a content creator."** -- Counter: You have 500K followers. Brands pay for access to your audience and credibility. You do not need to be a TikTok dancer to do brand deals.
4. **"The pricing seems designed for influencers, not athletes."** -- Counter: At $499/month (Tier 3), one mid-market deal ($10K-$50K) pays for the platform for years. Athletes have the highest ROI on our platform.

### Channels

| Channel                                               | Priority  | Why                                                                             |
| ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------- |
| Sports agents and managers (direct outreach)          | Primary   | Gatekeepers to athlete wallet. If the agent recommends it, the athlete signs up |
| Sports business media (Sportico, Front Office Sports) | Primary   | Credibility with decision makers in athletes' inner circles                     |
| Athlete-to-athlete referral                           | Primary   | Trust-based community; one NBA player recommending DealStage is worth 1,000 ads |
| NIL conferences and events                            | Secondary | Direct access to college athletes and their advisors                            |
| Athlete-focused podcasts                              | Secondary | Long-form storytelling about financial empowerment through partnerships         |
| Instagram (targeted to verified athlete accounts)     | Tertiary  | Reach athletes directly where they already spend time                           |

### Ideal First 10 Minutes on Platform

1. **Minute 0-2:** Manager or agent signs up on behalf of athlete. Selects "Manager" role and creates talent profile with athlete's name, sport, team, follower count
2. **Minute 2-4:** Platform identifies talent category as "Team Sports Athletes -- NBA" and surfaces 200+ brands that have historically sponsored NBA players
3. **Minute 4-6:** Explores brand intelligence: sees which brands are sponsoring upcoming NBA All-Star events, which have recently hired sports marketing directors, and which have budget cycles starting soon
4. **Minute 6-8:** AI generates a "Partnership Opportunity Report" -- 15 brands with high match scores based on the athlete's audience demographics, location, and brand values
5. **Minute 8-10:** Creates 3 partnership pipeline entries for top matches. AI drafts outreach emails to each brand's verified VP of Partnerships

### Aha Moment

"There are 47 brands in my city that sponsor sports events, and I can see every single decision maker's email and LinkedIn? My agent was only pitching me to 5 national brands."

### Price Sensitivity

LOW. $499/month is rounding error on an athlete's income. The barrier is not price, it is attention and trust. If the agent or financial advisor approves it, cost is irrelevant. Will go directly to Tier 2 or Tier 3.

### Estimated LTV

- **Conversion rate:** 5-8% (low volume, high value)
- **Starting tier:** Tier 2 ($249/mo) or Tier 3 ($499/mo)
- **Average tenure:** 36 months
- **Upgrade rate:** 60% start at Tier 2, 40% at Tier 3
- **Estimated LTV:** $10,000-$18,000

---

## Persona 4: Growth-Stage Brand ("Sarah the Scaling CMO")

### Demographics

| Attribute        | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Name archetype   | Sarah L.                                                    |
| Age              | 30-42                                                       |
| Gender           | Female (55%) / Male (45%)                                   |
| Location         | Austin, Denver, Nashville, Brooklyn (DTC hub cities)        |
| Education        | MBA or equivalent marketing experience                      |
| Household income | $120K-$200K (salary)                                        |
| Company revenue  | $1M-$10M                                                    |
| Company stage    | Series A/B funded or profitable bootstrap                   |
| Industry         | DTC consumer goods, health/wellness, fashion, food/beverage |
| Team size        | 15-80 employees, 1-3 person marketing team                  |

### Psychographics

- **Identity:** The "growth hacker CMO" who built the brand from paid ads but knows CAC is rising and needs new channels
- **Motivation:** Prove that influencer marketing works before the board meeting in 90 days. Needs measurable ROI, not vanity metrics
- **Values:** Data, efficiency, attribution. Everything must tie back to revenue
- **Aspiration:** Build a repeatable influencer program that generates $1M+ in attributed revenue per year
- **Content style:** Brand-first. Wants creators who align with brand voice and can drive conversions, not just impressions
- **Tech comfort:** High. Lives in HubSpot, Shopify, and Google Analytics. Evaluates every tool on integration capability
- **Decision style:** Builds business cases. Compares 3 options, creates a spreadsheet, presents to CEO

### Pain Points

1. **Cannot find the right creators.** Has tried hashtag searches, competitor following lists, and free databases. Results are garbage -- fake followers, wrong niche, no contact info.
2. **Outreach is a black hole.** Sent 200 DMs to creators last quarter. Got 8 responses. Conversion rate is abysmal.
3. **No contract or payment infrastructure.** First 3 creator deals were done via Venmo and DMs. Legal team is panicking.
4. **Cannot measure ROI.** Spent $50K on influencer campaigns last year but cannot prove it drove revenue. Board is skeptical.
5. **Competitor (GRIN, Aspire) pricing is insane.** Got quoted $2,000-$3,000/month for platforms that require annual contracts and 3-month onboarding.

### Buying Triggers

- Board or CEO asks "why are we spending $X on influencer marketing with no attribution?"
- Paid ad CPMs increase 30%+ and they need alternative growth channels immediately
- Competitor brand goes viral from a creator partnership and they need to respond
- Gets the GRIN/Aspire pricing email and spits out their coffee
- Hires first dedicated influencer marketing coordinator who needs a platform

### Objections

1. **"We already use GRIN/Aspire."** -- Counter: You are paying $2,000+/month for a platform that makes you bring your own contacts. We give you 45K verified decision-maker contacts AND 1,200+ brand-relevant talent matches for $249/month.
2. **"Can it integrate with Shopify/HubSpot?"** -- Counter: API endpoints coming in Q3. Today, the value is in the contact database and AI outreach, which are platform-agnostic.
3. **"How do you verify the talent is legit?"** -- Counter: Brand safety scores, engagement rate verification via Crawl4AI, and OAuth-verified social accounts. No fake followers.
4. **"I need to manage 20+ creators."** -- Counter: The partnership pipeline manages unlimited deals across stages. Bundle deals let you package multi-creator campaigns.

### Channels

| Channel                               | Priority  | Why                                                                               |
| ------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| Google Search (high intent)           | Primary   | "influencer marketing platform," "find influencers for brand," "GRIN alternative" |
| LinkedIn (targeted ads)               | Primary   | Reach marketing directors and CMOs at DTC brands                                  |
| G2/Capterra reviews                   | Primary   | B2B software buyer journey starts here                                            |
| DTC brand communities (Slack/Discord) | Secondary | Operators in DTC Twitter, Shopify community, ecommerce forums                     |
| Content marketing (blog)              | Secondary | "How to build an influencer program on a startup budget" -- SEO play              |
| Webinars / case studies               | Tertiary  | "How [Brand] built a $500K influencer program for $249/month"                     |

### Ideal First 10 Minutes on Platform

1. **Minute 0-2:** Signs up, selects "Brand" role. Enters company name, industry, website. Platform enriches brand profile from website crawl within seconds
2. **Minute 2-4:** Sees dashboard with "Recommended Talent" -- 50+ creators matched to their industry, sorted by match score. Filters by follower tier, platform, and engagement rate
3. **Minute 4-6:** Creates first marketplace opportunity: "Looking for 5 micro-influencers for summer skincare campaign, $500-$2,000 per creator, Instagram Reels." Publishes to marketplace
4. **Minute 6-8:** Browses talent who match the opportunity. Uses AI to generate personalized outreach to top 10 matches. Each email references the creator's content style and audience overlap
5. **Minute 8-10:** Sets up partnership pipeline with 5 deals in "outreach_sent" status. Checks rate benchmarks to ensure proposed rates are competitive

### Aha Moment

"I just found 50 creators who match my brand, sent personalized outreach to 10 of them with verified email addresses, and set up a pipeline to track responses -- in 10 minutes. My coordinator spent 3 weeks doing this manually last quarter."

### Price Sensitivity

MODERATE-HIGH for the company, but highly ROI-driven. $249/month (Tier 1) is approved on a marketing credit card without CEO involvement. $799/month (Tier 2) needs a business case. Will start at Tier 1 and upgrade when they prove ROI. Annual billing requires procurement approval.

### Estimated LTV

- **Conversion rate:** 20-25% from free to paid within 21 days
- **Starting tier:** Tier 1 ($249/mo)
- **Average tenure:** 18 months
- **Upgrade rate:** 35% upgrade to Tier 2 within 6 months
- **Estimated LTV:** $6,000-$10,000

---

## Persona 5: Enterprise Brand ("David the VP of Partnerships")

### Demographics

| Attribute        | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Name archetype   | David C.                                             |
| Age              | 38-50                                                |
| Gender           | Male (60%) / Female (40%)                            |
| Location         | New York, Chicago, San Francisco, London             |
| Education        | MBA from top-20 program                              |
| Household income | $250K-$500K                                          |
| Company revenue  | $100M+                                               |
| Company stage    | Public or late-stage private                         |
| Industry         | CPG, retail, automotive, financial services, telecom |
| Team size        | 5-15 person partnership/influencer marketing team    |

### Psychographics

- **Identity:** The executive who "owns creator" at a Fortune 500. Manages $5M+ annual influencer budget
- **Motivation:** Scale the existing program from 50 to 200+ creator partnerships per year without proportionally scaling headcount
- **Values:** Brand safety, compliance, measurable business outcomes, vendor consolidation
- **Aspiration:** Become the "Procter & Gamble of creator marketing" -- systematized, data-driven, always-on creator partnerships
- **Content style:** Brand-guideline driven. Every piece of creator content goes through legal and brand review
- **Tech comfort:** Evaluates enterprise tools; has used GRIN, CreatorIQ, or Aspire. Frustrated by limitations
- **Decision style:** Committee-based. Procurement, legal, IT security, and marketing all have input. 3-6 month sales cycle

### Pain Points

1. **Current platform is too expensive and too limited.** Paying $2,000+/month for CreatorIQ or GRIN. Contact database is stale. Cannot discover new creators outside their existing network.
2. **Team is drowning in manual work.** 60% of coordinator time is spent on outreach and contract admin, not strategy.
3. **Cannot expand into new talent categories.** Stuck in "beauty influencer" box. Wants athletes, podcasters, and B2B creators but has no pipeline into those worlds.
4. **ROI reporting is primitive.** Spends 2 weeks per quarter building influencer ROI reports manually. Needs automated dashboards.
5. **Brand safety incidents.** Two creators they partnered with had controversy surface after contracts were signed. Needs better vetting.

### Buying Triggers

- Contract renewal for current platform (GRIN, CreatorIQ) -- looking for alternatives
- CEO mandates 50% increase in creator partnerships without budget increase
- Competitor lands a viral creator campaign and the board asks "why didn't we do that?"
- New talent categories (athletes, podcasters) become strategic priority and existing tools cannot help
- Influencer marketing coordinator quits and they realize the entire program was in one person's spreadsheets

### Objections

1. **"We need enterprise SSO, SOC 2, and a dedicated account manager."** -- Counter: Supabase Auth supports SAML SSO. SOC 2 is on the roadmap. The platform is designed for self-serve, but we offer onboarding support. Honest about current stage.
2. **"45K contacts sounds impressive, but are they accurate?"** -- Counter: Contacts are enriched via GrowMeOrganic with email confidence scores. Verified via Crawl4AI. Stale contacts are flagged. Offer a free audit of 100 contacts against their existing list.
3. **"We need integrations with Salesforce and Workfront."** -- Counter: API-first architecture. Webhook support planned. Today's value is the contact intelligence and AI layer that sits upstream of their existing CRM.
4. **"Your pricing is suspiciously low."** -- Counter: We are in growth stage and pricing to win market share. Current pricing is locked for early enterprise adopters. Show the feature comparison matrix vs. GRIN at 4x the price.

### Channels

| Channel                                    | Priority  | Why                                                                                         |
| ------------------------------------------ | --------- | ------------------------------------------------------------------------------------------- |
| Direct outbound (founder-led sales)        | Primary   | Enterprise deals require personal relationships. Founder emails VP of Partnerships directly |
| Industry conferences (Brandweek, ANA, CES) | Primary   | In-person demo and relationship building                                                    |
| Case studies from growth-stage brands      | Primary   | "If a $5M brand got these results, imagine what a $500M brand could do"                     |
| LinkedIn thought leadership                | Secondary | VP-level content on creator economy trends, published by founder                            |
| Analyst briefings (Forrester, CB Insights) | Tertiary  | Long-term play for enterprise credibility                                                   |
| G2/Capterra (enterprise category)          | Tertiary  | Procurement teams check reviews                                                             |

### Ideal First 10 Minutes on Platform

1. **Minute 0-2:** Signs up with corporate email. Selects "Brand" role. Platform detects enterprise domain and triggers white-glove onboarding flow
2. **Minute 2-4:** Enters company name. Platform auto-populates brand profile from enriched_brands data -- industry, products, brand voice, target audience already filled in
3. **Minute 4-6:** Searches talent filtered by "Professional Athletes" + "NBA" -- a category their current platform does not support. Finds 300+ matches with engagement rates, brand safety scores, and rate benchmarks
4. **Minute 6-8:** Views brand intelligence dashboard: sees which competitors are sponsoring upcoming events, which talent they are working with, and where budget gaps exist
5. **Minute 8-10:** Uses AI to generate a "Competitive Intelligence Report" comparing their brand's creator program to 3 competitors. Downloads as PDF for internal stakeholder presentation

### Aha Moment

"You have verified emails for 200+ marketing decision makers at our competitor brands? And you can show me which creators they are working with? This is competitive intelligence gold."

### Price Sensitivity

LOW. Budget is not the issue; procurement process is the issue. $1,499/month (Tier 3) is a rounding error on a $5M influencer budget. They spend more on lunch meetings. The friction is procurement cycle, security review, and committee approval.

### Estimated LTV

- **Conversion rate:** 3-5% (low volume, very high value, long sales cycle)
- **Starting tier:** Tier 3 ($1,499/mo) or custom enterprise
- **Average tenure:** 36+ months
- **Upgrade rate:** N/A (starts at top tier; potential for custom pricing)
- **Estimated LTV:** $54,000-$100,000+

---

## Persona 6: Talent Agency ("Alex the Agency Operator")

### Demographics

| Attribute            | Value                                |
| -------------------- | ------------------------------------ |
| Name archetype       | Alex M.                              |
| Age                  | 28-40                                |
| Gender               | Balanced                             |
| Location             | Los Angeles, New York, Miami, London |
| Education            | Business or communications degree    |
| Household income     | $80K-$200K (salary + commission)     |
| Company type         | Boutique talent/influencer agency    |
| Roster size          | 10-50 creators/talent                |
| Annual deal volume   | 50-200 deals/year across roster      |
| Commission structure | 15-25% of deal value                 |

### Psychographics

- **Identity:** The entrepreneur-agent who built an agency from scratch. Knows every creator personally but is reaching the limits of personal bandwidth
- **Motivation:** Scale the roster and deal volume without hiring 5 more coordinators. Every hour saved on admin is an hour spent closing deals
- **Values:** Relationships, speed, deal volume. More deals = more commission = more revenue
- **Aspiration:** Grow from 30 to 100+ managed creators and build the agency into an acquisition target or franchise model
- **Content style:** Does not create content; enables creators to create better content and land bigger deals
- **Tech comfort:** Power user of multiple tools simultaneously. Has tried every influencer platform. Uses CRMs, project management tools, and spreadsheets extensively
- **Decision style:** Fast and ROI-focused. If it saves time or makes money, they will try it today. Cancels fast if it does not deliver within 30 days

### Pain Points

1. **Managing 30 creators across spreadsheets is chaos.** Each creator has 3-5 active deals. That is 100+ deals being tracked in Google Sheets with no automation.
2. **Outreach velocity is the bottleneck.** Could close more deals if they could send more personalized outreach. Currently limited by the time it takes to research brands and write emails.
3. **No centralized contact database.** Every coordinator has their own contact list. When someone leaves, their relationships walk out the door.
4. **Rate negotiation guesswork.** Does not have benchmark data to justify rate increases to brands or to advise creators on what to charge.
5. **Current tools are per-seat expensive.** GRIN charges per seat. At 5 coordinators + 30 managed creators, the bill is $10K+/month.

### Buying Triggers

- Loses a deal because two coordinators pitched the same brand from different creator accounts (embarrassing)
- New creator joins the roster and asks "what tools do you use?" -- currently the answer is "Google Sheets"
- Calculates that coordinators spend 60% of time on admin and 40% on revenue-generating activities
- Hears about DealStage from another agency operator at an industry event
- Gets a GRIN renewal quote that doubled from last year

### Objections

1. **"Can my whole team use this?"** -- Counter: Yes. Agency plan supports team members. Each coordinator manages their own creator sub-roster within the agency account.
2. **"I need to manage 50 creators, not 5."** -- Counter: Agency Tier 2+ supports unlimited talent management. Pipeline tracks deals per creator with rollup reporting.
3. **"What happens to my data if I leave?"** -- Counter: Full data export. Your contacts, deals, and history are yours. No lock-in.
4. **"$799/month is a lot for an agency that might not survive."** -- Counter: At 15% commission, one additional $10K deal per month pays for the platform 2x over. How many deals are you missing because of admin overhead?

### Channels

| Channel                                                       | Priority  | Why                                                               |
| ------------------------------------------------------------- | --------- | ----------------------------------------------------------------- |
| Agency operator communities (Slack groups, Twitter)           | Primary   | Word of mouth among agency operators is the strongest signal      |
| LinkedIn (targeted to talent agent titles)                    | Primary   | Professional network where agents spend time                      |
| Industry events (VidCon, Playlist Live, Creator Economy Expo) | Primary   | In-person demos convert agencies at 5x the rate of digital        |
| Referral program (agency-to-agency)                           | Secondary | Incentivize existing agency clients to refer peers                |
| Content marketing (blog/podcast)                              | Secondary | "How to scale a talent agency without scaling headcount"          |
| Cold outreach to agencies                                     | Tertiary  | Use DealStage's own outreach tools to pitch agencies (dogfooding) |

### Ideal First 10 Minutes on Platform

1. **Minute 0-2:** Signs up, selects "Agency" role. Enters agency name, roster size, and primary talent categories
2. **Minute 2-4:** Onboarding wizard prompts adding first 5 talent from their roster. Can bulk-import from CSV or add manually. Each talent gets a profile with niche, platform, and follower data
3. **Minute 4-6:** Views agency dashboard: all 5 talent shown with match scores against 1,200+ brands. Sorted by highest opportunity value. Each talent has 10-20 recommended brands
4. **Minute 6-8:** Selects one talent and views their recommended brands. Creates 3 partnerships in the pipeline. AI generates outreach for all 3 with personalized angles for each brand-talent pairing
5. **Minute 8-10:** Views the team management panel. Invites a coordinator to the agency account. Sets up notification preferences so they get alerts when deals move stages

### Aha Moment

"I just created personalized outreach for 3 different brands for 5 different creators -- that is 15 customized pitches -- in under 10 minutes. My coordinators spend an entire day doing that manually."

### Price Sensitivity

MODERATE. Agencies are cost-conscious because margins are tight (15-25% commission on deals). But they are volume-oriented -- if the tool increases deal volume by even 10%, the ROI is clear. Will start at Agency Tier 1 ($799/mo) and upgrade when they prove it out across the roster.

### Estimated LTV

- **Conversion rate:** 15-20% from free to paid within 21 days
- **Starting tier:** Tier 1 ($799/mo)
- **Average tenure:** 24 months
- **Upgrade rate:** 40% upgrade to Tier 2 ($1,799/mo) within 6 months
- **Estimated LTV:** $25,000-$40,000

---

## Persona 7: Talent Manager ("Tanya the Manager")

### Demographics

| Attribute            | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| Name archetype       | Tanya B.                                                       |
| Age                  | 30-45                                                          |
| Gender               | Female (55%) / Male (45%)                                      |
| Location             | Los Angeles, New York, Atlanta, Nashville                      |
| Education            | Business, law, or entertainment industry background            |
| Household income     | $70K-$150K (base + commission)                                 |
| Number of clients    | 1-5 individual talent (actors, athletes, musicians)            |
| Client caliber       | Mid-to-high profile; $100K-$2M in annual deal value per client |
| Commission structure | 10-20% of deal value                                           |

### Psychographics

- **Identity:** The "personal champion" who lives and breathes their clients' careers. Knows their clients' schedules, preferences, and goals better than the clients themselves
- **Motivation:** Maximize each client's earning potential while protecting their brand and long-term career trajectory
- **Values:** Loyalty, discretion, strategic thinking, personal relationships
- **Aspiration:** Build reputation as the go-to manager for a specific talent category (e.g., "the NBA athlete brand manager" or "the actor-to-lifestyle-brand bridge")
- **Content style:** Does not create content. Operates behind the scenes
- **Tech comfort:** Moderate. Uses email, calendar, and basic spreadsheets. Not a "tools person" but will adopt if it clearly helps clients
- **Decision style:** Cautious and relationship-driven. Needs to trust the platform before putting clients' information on it. Will test with one client before rolling out to others

### Pain Points

1. **Wearing too many hats.** Acts as agent, lawyer, accountant, publicist, and social media advisor for 3-5 clients. Drowning in operational tasks.
2. **Limited deal sourcing.** Relies on personal network for deals. Network is deep but narrow -- only knows brands in 1-2 industries.
3. **No leverage in negotiations.** Has no benchmark data to counter a brand's lowball offer. Relies on gut feeling and "what I got last time."
4. **Contract chaos.** Managing contracts across 3-5 clients with different brands, different terms, different payment schedules. Uses a combination of email folders and memory.
5. **Talent verification and onboarding.** When taking on a new client, has no standardized way to verify their social metrics, build their media kit, or showcase their past deal history.

### Buying Triggers

- Takes on a new client and needs to quickly build their brand partnership pipeline from scratch
- Client asks "why am I not getting deals like [competitor talent]?" and the manager has no good answer
- Loses a negotiation because the brand cited "market rates" and the manager had no data to counter
- Discovers that their client's agent (at a bigger agency) is not pursuing mid-market opportunities
- Gets introduced to DealStage by another manager or by a client who found it independently

### Objections

1. **"I only manage 3 clients -- do I really need a platform?"** -- Counter: 3 clients x 10 potential deals each = 30 pipeline items to track. Plus rate benchmarks, contract management, and outreach. The math works even at 3 clients.
2. **"My clients' information is sensitive."** -- Counter: Data rooms are private by default with NDA-gated access. OAuth verification ensures nobody can impersonate your talent. Manager role gives you full control.
3. **"$99/month seems like a personal expense, not a business one."** -- Counter: One additional $5K deal per year pays for a decade of the platform. And your clients can see the professionalism upgrade immediately.
4. **"I'm not technical enough for this."** -- Counter: The onboarding wizard handles profile setup. AI writes the outreach. Pipeline management is drag-and-drop. If you can use email, you can use DealStage.

### Channels

| Channel                                                             | Priority  | Why                                                                      |
| ------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| Manager/agent professional networks                                 | Primary   | Tight-knit community; personal recommendations travel fast               |
| Entertainment industry events                                       | Primary   | Sports business conferences, film festivals, music industry events       |
| Talent themselves (bottom-up)                                       | Primary   | When a talent discovers DealStage and asks their manager to check it out |
| LinkedIn (targeted to talent manager titles)                        | Secondary | Professional positioning and outreach                                    |
| Industry publications (Variety, Billboard, Sports Business Journal) | Secondary | Credibility and awareness in talent management circles                   |
| Referral program                                                    | Tertiary  | Incentivize managers to refer other managers                             |

### Ideal First 10 Minutes on Platform

1. **Minute 0-2:** Signs up, selects "Manager" role. Enters their name and the name of their primary client (e.g., a mid-career NBA player)
2. **Minute 2-4:** Creates talent profile for client: enters name, sport/category, social handles, follower count. Platform auto-suggests talent type ("Team Sports Athletes -- NBA") and pulls in relevant brand matches
3. **Minute 4-6:** Views "Manager Dashboard" showing client's match scores against top 20 brands. Each brand shows buying intent signals, budget intel, and decision-maker contacts relevant to NBA talent
4. **Minute 6-8:** Checks rate benchmarks for NBA athletes at the client's tier. Discovers client is being underpaid by 25% on existing deals. Saves benchmark report to reference in next negotiation
5. **Minute 8-10:** Creates 2 partnership pipeline entries for brands the client would love. AI generates outreach customized to the client's profile, recent game performance, and the brand's marketing priorities

### Aha Moment

"I just found out that my client's current shoe deal is 25% below market rate, and I can see that 3 competing brands have open influencer marketing positions. I have real leverage for the first time in this negotiation."

### Price Sensitivity

MODERATE-HIGH. Managers operate on personal budgets until they formalize as a business entity. $99/month (Talent Tier 1) is approachable. Will test with one client and expand if it works. Value unlocks at Tier 2 ($249/mo) when managing 3-5 clients with full pipeline access.

### Estimated LTV

- **Conversion rate:** 10-15% from free to paid within 30 days
- **Starting tier:** Tier 1 ($99/mo as talent pricing)
- **Average tenure:** 20 months
- **Upgrade rate:** 30% upgrade to Tier 2 within 6 months
- **Estimated LTV:** $2,500-$5,000

---

## Persona Comparison Matrix

| Attribute                  | Rising Creator | Established Influencer | Pro Athlete     | Growth Brand      | Enterprise Brand | Talent Agency     | Talent Manager  |
| -------------------------- | -------------- | ---------------------- | --------------- | ----------------- | ---------------- | ----------------- | --------------- |
| **Expected starting tier** | Free           | Tier 1                 | Tier 2-3        | Tier 1            | Tier 3           | Tier 1            | Tier 1          |
| **Time to paid**           | 2-4 weeks      | 1-2 weeks              | 1 week          | 2-3 weeks         | 3-6 months       | 2-3 weeks         | 3-4 weeks       |
| **Price sensitivity**      | High           | Moderate               | Low             | Moderate          | Low              | Moderate          | Moderate-High   |
| **Decision maker**         | Self           | Self                   | Agent/Advisor   | CMO               | Committee        | Agency owner      | Self            |
| **Primary value driver**   | Brand contacts | Deal pipeline          | New categories  | Creator discovery | Scale + intel    | Multi-talent mgmt | Rate benchmarks |
| **Estimated LTV**          | $1,600-$2,200  | $5,000-$7,500          | $10,000-$18,000 | $6,000-$10,000    | $54,000-$100K+   | $25,000-$40,000   | $2,500-$5,000   |
| **Volume (Y1)**            | 2,500          | 500                    | 100             | 800               | 50               | 100               | 200             |
| **Acquisition cost**       | $15-$30        | $50-$100               | $200-$500       | $100-$250         | $1,000-$3,000    | $150-$400         | $50-$150        |

## Revenue Model by Persona (Year 1 Projection)

| Persona                | Volume    | Conv Rate | Paid Users | Avg Monthly | Avg Tenure | Projected Revenue |
| ---------------------- | --------- | --------- | ---------- | ----------- | ---------- | ----------------- |
| Rising Creator         | 2,500     | 12%       | 300        | $120        | 14 mo      | $504,000          |
| Established Influencer | 500       | 25%       | 125        | $200        | 24 mo      | $600,000          |
| Pro Athlete            | 100       | 6%        | 6          | $400        | 36 mo      | $86,400           |
| Growth Brand           | 800       | 20%       | 160        | $350        | 18 mo      | $1,008,000        |
| Enterprise Brand       | 50        | 4%        | 2          | $1,500      | 36 mo      | $108,000          |
| Talent Agency          | 100       | 18%       | 18         | $1,000      | 24 mo      | $432,000          |
| Talent Manager         | 200       | 12%       | 24         | $150        | 20 mo      | $72,000           |
| **Total**              | **4,250** |           | **635**    |             |            | **$2,810,400**    |

---

_End of Batch 1 -- Deliverables 4, 5, and 17_
