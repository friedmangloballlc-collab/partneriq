# DealStage Master Audit Report

**Date:** March 29, 2026
**Scope:** Full platform audit across 6 specialist domains
**Source Reports:** Architecture & Security, AI Engineer Full Functionality Map, Frontend UX, Database & Backend, Business Strategy & Monetization, Performance & DevOps

---

## Executive Summary

DealStage is a well-architected, AI-powered partnership intelligence platform connecting Talent, Brands, Agencies, and Managers across 77 pages, 32 AI agents, 57 data entities, and 88 platform integrations. The technical foundation is strong: code splitting is applied consistently, the multi-provider AI router implements a textbook circuit breaker pattern, the Stripe billing engine is operational, and the role-based access system covers five distinct user types. For a product at this stage, the architecture is appropriate and demonstrates genuine engineering sophistication in areas like Monte Carlo ROI simulation, vector-based matching, and multi-provider AI failover.

The most urgent risks cut across all six audit domains and cluster around four themes. First, the access-control system is split across two divergent files that must be manually kept in sync — a silent correctness bug waiting to surface in production. Second, the database schema has a critical dual-definition problem where production columns likely do not match the intended schema, breaking RLS policies, foreign keys, and entity table routing for at least five pages right now. Third, the product is monetizing well below its potential: there is no transaction-layer revenue despite Stripe Connect being present, the trial-to-paid conversion path has no email nurture, and the annual billing toggle is visible on the pricing page but functionally broken. Fourth, performance has several high-impact quick wins — an unused 90 KB dependency, a placeholder GA4 script fetching on every load, and four font families blocking first paint — that can be resolved in hours. The 90-day roadmap below consolidates all findings into a phased execution plan that addresses the critical blockers in Month 1, delivers the highest-impact upgrades in Month 2, and launches growth features in Month 3.

---

## Part 1: Complete Platform Functionality Map

_Source: AI Engineer Full Functionality Map report_

### 1A. Dashboards & Home

| Page                 | What It Does                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**        | Role-adaptive home screen. Shows stat cards (deals, revenue, talent count), activity feed, pipeline chart, pitch deck metrics, AI agent widgets, smart next steps, opportunity alerts, deal expiry tracker. Includes demo data seeder for empty accounts. Separate panels for Talent and Brand dashboards, plus success prediction panel. |
| **AdminDashboard**   | Admin-only view of platform-wide metrics, user management, and system controls.                                                                                                                                                                                                                                                           |
| **BrandDashboard**   | Brand-specific home showing posted opportunities, applicant counts, campaign performance, and spend summaries.                                                                                                                                                                                                                            |
| **PlatformOverview** | High-level system overview showing total users, total deals, platform health metrics.                                                                                                                                                                                                                                                     |

### 1B. Talent Management

| Page                | What It Does                                                                                                                                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TalentDiscovery** | Full-text search + faceted filtering of talent database. Filters: platform, niche, tier (nano/micro/mid/macro/mega), trajectory, min followers, min engagement, min brand safety score, min alpha score. Grid/list toggle. Server-side tsquery search. TalentCard component with profile modal. Add new talent form. |
| **TalentProfile**   | Individual talent profile page. Shows bio, connected platforms, verification status, engagement metrics, audience demographics, content samples.                                                                                                                                                                     |
| **TalentAnalytics** | Deep analytics per talent: engagement rate trends (line charts), follower growth over time, content performance radar, platform breakdown by color, niche distribution. Includes Talent Value Trajectory Panel for growth prediction.                                                                                |
| **TalentRevenue**   | Revenue stream analysis across 6 categories: brand partnerships, content/media, licensing/merchandise, speaking/appearances, primary income, emerging revenue. Filterable by talent type (Athletes, Musicians, Gaming, etc.). Uses talent_revenue_streams and talent_revenue_matrix tables.                          |
| **TalentDataRoom**  | Secure data room with NDA gate, access request panel, industry intel feed. Shows financial charts (line charts with reference lines), deal history, audience data. Supports data room import, watermarked PDF export, and access controls (public/private per entry).                                                |
| **ManagerSetup**    | Onboarding flow for talent managers. Multi-step wizard to claim and verify manager profiles, link talent rosters, set commission structures, upload contracts.                                                                                                                                                       |
| **ManagerProfile**  | Manager-facing profile showing their roster, commission rates, and management details.                                                                                                                                                                                                                               |

### 1C. Brand Management

| Page                     | What It Does                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brands**               | Brand directory with search and filters. Create/edit brands with industry, size, budget, preferred niches.                                                                                                   |
| **BrandDataRoom**        | Brand-side data room — similar to TalentDataRoom but oriented toward brand metrics: campaign spend history, ROI benchmarks, partnership track record. NDA-gated access.                                      |
| **BrandSpendPrediction** | AI-powered spend forecasting. Uses historical partnership data to project future brand spend by month. Area chart with confidence intervals. Deterministic seeded random for chart stability across renders. |

### 1D. Deal Pipeline & Management

| Page                     | What It Does                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Partnerships**         | The deal pipeline CRM. 10-stage Kanban: Discovered, Research, Outreach Pending, Outreach Sent, Responded, Negotiating, Contracted, Active, Completed, Churned. Pipeline view and list view. Search/filter. New Deal wizard. "Upload Deck for AI Matching" — upload PDF/PPTX/DOCX and AI extracts campaign objectives, target audience, budget, brand tone, talent categories, then finds matches. |
| **DealDetail**           | Full deal lifecycle view. 5-stage execution tracker: Contract Signed, Deposit Paid, Content Submitted, Brand Approved, Content Live + Final Payment. Includes: InternationalDealSupport, EscrowPanel, DisputePanel, ContractScanner, ProofOfPerformance. Real-time chat, deal notes, file attachments. Stage advancement controls.                                                                |
| **DealAnalytics**        | Pipeline-wide analytics: deal velocity, conversion rates by stage, average deal value, time-to-close metrics.                                                                                                                                                                                                                                                                                     |
| **DealComparison**       | Side-by-side comparison of 2+ deals across all fields: value, stage, match score, talent tier, engagement, brand safety. AI-generated comparison insights with strengths, weaknesses, and recommendations.                                                                                                                                                                                        |
| **DealScoreLeaderboard** | Gamified ranking of talent by deal score (brand_safety_score x engagement_rate). Gold/Silver/Bronze medals. Filterable by niche. Encourages quality improvement.                                                                                                                                                                                                                                  |
| **BundleDeals**          | Package multiple talent into a single deal for a brand. Create bundles with shared budget allocation, campaign brief, and coordinated delivery. Statuses: draft, sent, active, completed, cancelled.                                                                                                                                                                                              |

### 1E. AI Match Engine & Discovery

| Page                 | What It Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MatchEngine**      | The core matching system. Two modes: Brand-to-Talent and Talent-to-Brand. 10-factor weighted scoring algorithm: Audience Demographics (18%), Content Niche (15%), Aesthetic Fit (12%), Trajectory Prediction (12%), Engagement Quality (10%), Brand Safety (10%), Relationship Path (8%), Budget Fit (8%), Past Performance (5%), Geographic Relevance (2%). Also has 7-factor Talent-to-Agency matching. Uses 5 vector embedding types (text-embedding-3-large 1536d, CLIP ViT-L/14 512d, custom audience 512d). Proactive AI Suggestions mode where you select a published opportunity and AI identifies top 5 talent with deep reasoning, outreach strategy, and risk analysis. "Create Deal" button fires an automated chain: Campaign Brief + ROI Simulation + Outreach Draft + Approval Item — all generated in parallel. |
| **ContactFinder**    | Decision-maker discovery engine. AI identifies the right contacts at target companies/agencies. Tiered priority: Tier 1 (Contact First - budget authority), Tier 2 (Follow Up - senior influencer), Tier 3 (CC/Warm Intro), Tier 4 (Reference Only). Covers 11+ role categories from partnerships to licensing. Confidence scoring with color coding.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **WarmIntroNetwork** | Builds a bipartite relationship graph from partnership history. Finds connections between talent through shared brands. Shows "mutual brands" between any two talent, enabling warm introductions. Graph traversal algorithm with connection strength scoring.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 1F. Outreach & Communication

| Page                       | What It Does                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Outreach**               | Email outreach management. Compose emails (manual or AI-generated). Status tracking: Draft, Pending Approval, Approved, Rejected, Sent, Delivered, Opened, Replied, Bounced. AI generation produces personalized subject lines and bodies. Submit-for-approval workflow creates ApprovalItem. Includes OutreachFramework component, task panels, and team assignee selector.                  |
| **SequenceBuilder**        | Multi-step email sequence builder. Create sequences with configurable steps (initial outreach, follow-up, value add, etc.), each with delay days and send time. AI generates entire sequences based on target profile (name, company, role, platform, niche, followers). Conversion forecast panel. Collaboration panel for team review. Status management: draft, active, paused, completed. |
| **CampaignBriefGenerator** | AI generates complete campaign briefs from brand + talent selection. Collapsible sections: Campaign Goals, Target Audience, Key Messaging, Creative Directions, KPIs, Content Formats. Copy-to-clipboard, regenerate, and export.                                                                                                                                                             |

### 1G. Pitch & Presentation

| Page                 | What It Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PitchDeckBuilder** | 12-slide AI pitch deck generator. Sections: Executive Summary, Partnership Overview, Talent Profile, Audience Analysis, Content Strategy, Brand Alignment, Performance Metrics, ROI Projection, Deliverables & Timeline, Pricing & Terms, Case Studies, Next Steps. Customization panel for tone (formal/professional/casual/creative), emphasis (ROI/creative/relationship), data depth (summary/detailed/comprehensive), comparables inclusion, deck length. Per-slide and bulk generation. Slide preview navigation. |
| **DeckLibrary**      | Saved pitch deck repository. Browse, search, and reuse previously generated decks.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **PitchCompetition** | Brands post competitions with budget ranges ($1K-$100K+). Talent submits pitches. Statuses: Open, Reviewing, Awarded, Closed. Gamified bidding process for partnerships.                                                                                                                                                                                                                                                                                                                                                |

### 1H. Market Intelligence & Analytics

| Page                     | What It Does                                                                                                                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MarketIntelligence**   | Four-tab intelligence hub: (1) Rate Benchmarks by tier (nano through mega), (2) Platform Multipliers showing rate adjustments per platform, (3) Category Premiums by niche, (4) ROI Benchmarks. All powered by dedicated Supabase tables.                                                                 |
| **DemographicTargeting** | Multi-dimensional audience targeting. Filter by industry, culture event, demographic segment, population range, and buying power. Auto-matching against talent database. Feeds into CampaignGeneratorForm and AIMarketingBrief components. Visualized through DemographicInsights component.              |
| **SimulationEngine**     | Monte Carlo ROI simulator. Parameters: deal value, conversion rate, average engagement, number of deals, marketing cost. Runs 1,000 iterations with Gaussian noise (Box-Muller transform). Outputs P10/P50/P90 confidence intervals with area chart distribution. Can load real deal data for simulation. |
| **Analytics**            | General analytics dashboard with cross-cutting platform metrics.                                                                                                                                                                                                                                          |
| **AIAnalytics**          | AI system performance analytics: agent usage, response times, cost per query, provider distribution, cache hit rates.                                                                                                                                                                                     |
| **CustomReports**        | Build custom reports by selecting metrics, dimensions, and date ranges.                                                                                                                                                                                                                                   |
| **CreatorCalculator**    | PUBLIC page (no auth required). SEO-friendly rate calculator: enter follower count, niche, engagement rate, platform. Queries rate_benchmarks + category_premiums tables to suggest recommended rate range. CTA to drive signups.                                                                         |

### 1I. Calendar & Events

| Page                | What It Does                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CultureCalendar** | Browse culture events, conferences, and mega events. Filter by tier, category, month, year. Includes industry guides. Shows partnership activation windows tied to cultural moments. |
| **MasterCalendar**  | Unified calendar view of all deadlines: deal milestones, content submission dates, event dates, campaign launch windows.                                                             |
| **EventManagement** | CRUD for culture events and mega events. Event form with date, category, tier, and demographic targeting. Filters for date range, category, tier, demographics.                      |

### 1J. Approvals & Governance

| Page          | What It Does                                                                                                                                                                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Approvals** | Approval queue with priority-based SLA: P1 Critical (4h), P2 High (24h), P3 Standard (48h), P4 Low (72h). Statuses: pending, approved, rejected, revision_requested, scheduled, escalated, sent. Configurable workflow settings. Collaboration panel for team discussion. Queue view selector for different display modes. Items auto-created from deal chain, outreach, and AI actions. |

### 1K. Contracts & Legal

| Page                  | What It Does                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ContractTemplates** | Template library with pre-built contract types: Sponsored Post/Content Creation (with FTC compliance, usage rights, kill fee, revision limits). AI-powered template customization. Fill-in-the-blank generation. PDF export via jsPDF. Preview and save functionality. |

### 1L. Platform Connections & Integrations

| Page                | What It Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ConnectAccounts** | 88-platform integration hub across 12 categories: Content & Video, Photo & Visual, Music & Audio, Gaming & Esports, Actors & Performers, Fitness & Wellness, Writers & Podcasts, Beauty & Fashion, Athletes & Sports, Educators, Design & Motion. Two connection methods: (1) OAuth via Phyllo SDK — verified, +5% discovery boost; (2) API Key — verified, +3% boost. Verification system with levels and boost scoring. Identity verification with government ID upload (encrypted storage, 24hr review). Each platform stored in platform_catalog table with auth_type, scopes, and Phyllo platform ID. |
| **Integrations**    | Third-party service integrations beyond social platforms.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### 1M. Team & Collaboration

| Page          | What It Does                                                                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Teams**     | Team management: create teams, invite members, assign roles.                                                                                                                        |
| **Referrals** | Referral program with deterministic code generation from user name + email. Tracks referral chain, rewards. Gamified with tiers (leaderboard). Social sharing to LinkedIn, Twitter. |

### 1N. Settings & Billing

| Page                       | What It Does                                                                                                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Settings**               | User profile settings, notification preferences, theme switching.                                                                                                                                                                      |
| **SubscriptionManagement** | Stripe-powered subscription management. Three plan sets: TALENT_PLANS, BRAND_PLANS, AGENCY_PLANS. Monthly/annual billing toggle. Shows current plan, upgrade/downgrade options. Payment method manager, invoice list, billing history. |
| **BillingHistory**         | Detailed billing history with invoice downloads.                                                                                                                                                                                       |
| **Onboarding**             | Multi-step onboarding wizard adapted per role.                                                                                                                                                                                         |

### 1O. AI System Pages

| Page                | What It Does                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AICommandCenter** | Natural language query interface. Cmd+K shortcut to focus. Pre-built suggested queries: "Show me at-risk partnerships", "Revenue forecast", "Creator recommendations", "Compliance status check". Chat-style UI with history (localStorage, max 50). Routes queries through ai-router edge function. Results rendered with urgency indicators (high/medium/low/critical) and agent attribution icons.                             |
| **AIAgentsHub**     | Full agent management dashboard. Lists all agents with descriptions, run buttons, and result panels. Sub-components: AgentScheduler (cron-like scheduling), AgentChains (multi-agent workflows), SocialMediaIntegrations, PitchDeckPersonalizer, DealLeaderboard, AIOutreachBuilder, SmartNotifications, ExecutiveBriefing, RevenueForecaster, ContentLocalizer, SimulationSandbox, BulkAgentOps, AgentAnalytics, WebhookManager. |
| **AIFeatures**      | AI feature showcase and configuration.                                                                                                                                                                                                                                                                                                                                                                                            |

### 1P. Admin & System

| Page                   | What It Does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| **AdminDataManager**   | Admin CRUD for all entity types. Bulk operations on database tables. |
| **SystemHealth**       | System monitoring: API response times, error rates, uptime.          |
| **SystemArchitecture** | Visual architecture documentation.                                   |
| **DataImportExport**   | Bulk CSV/JSON import and export across all entity types.             |

### 1Q. Public / Marketing Pages

| Page                                                                    | What It Does                                |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| **About, Blog, Careers, Contact, Customers, Demo, Pricing, FAQ**        | Marketing site pages.                       |
| **CookiePolicy, GDPR, Privacy, Terms**                                  | Legal compliance pages.                     |
| **Feature pages** (FeatureBrowseTalent, FeatureCampaignAnalytics, etc.) | Individual feature marketing landing pages. |
| **Login, AuthCallback, ResetPassword, CheckEmail**                      | Authentication flow.                        |

---

### 1R. AI System — 32 Agents, Multi-Provider Routing, Circuit Breaker

#### Provider Architecture — 6 Routing Tiers

| Tier      | Primary Provider              | Fallback Chain                    | Use Case                                                   |
| --------- | ----------------------------- | --------------------------------- | ---------------------------------------------------------- |
| COMPLEX   | Anthropic (Claude Sonnet 4.5) | DeepSeek, Gemini, Groq            | Financial analysis, strategic reasoning, contract analysis |
| STANDARD  | DeepSeek V3                   | Anthropic Haiku, Gemini, Groq     | Everyday tasks, summaries, deal analysis                   |
| REASONING | DeepSeek Reasoner             | Anthropic, Gemini                 | Multi-step logical reasoning                               |
| FREE      | Gemini Flash                  | DeepSeek, Groq, Anthropic Haiku   | Classification, tagging, translation                       |
| FAST      | Groq (Llama 3.3 70B)          | DeepSeek, Gemini, Anthropic Haiku | Low-latency tasks                                          |
| BATCH     | Anthropic Haiku               | DeepSeek, Gemini                  | Bulk processing                                            |

**Provider Details:**

- **Anthropic**: Claude Sonnet 4.5 (primary) with fallback to Claude 3.5 Sonnet and Haiku. Uses prompt caching (90% cheaper on repeated calls) via `cache_control: { type: 'ephemeral' }`.
- **DeepSeek**: deepseek-chat and deepseek-reasoner models.
- **Gemini**: Cascading model fallback: gemini-2.0-flash-exp, gemini-2.0-flash, gemini-1.5-flash-latest, gemini-1.5-flash-8b, gemini-pro.
- **Groq**: Llama 3.3 70B Versatile for ultra-fast inference.

#### Circuit Breaker

Three-state per provider:

- **CLOSED** (healthy): All requests pass through normally.
- **OPEN** (failed): After 3 consecutive failures, fast-fail for 30 seconds.
- **HALF_OPEN** (probing): After 30s recovery timeout, allow one test request. Success returns to CLOSED. Failure returns to OPEN.

#### Cache TTL Levels

5 TTL levels: NONE (0), SHORT (5 min), MEDIUM (1 hour), LONG (6 hours), DAY (24 hours).

#### All 32 AI Agents

**COMPLEX Tier (Claude Sonnet 4.5) — 4 agents:**

| Agent                              | Function                                                                                              | Behavior             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| **Partnership Success Predictor**  | Predicts likelihood of partnership success based on historical patterns, talent trajectory, brand fit | Temp 0.3, cache 5min |
| **Optimal Pricing Recommender**    | Analyzes market rates, talent metrics, and deal context to recommend pricing                          | Temp 0.3, cache 5min |
| **Contract Intelligence Analyzer** | Automates deal structuring, clause analysis, pricing fairness, risk identification                    | Temp 0.2, cache 6hrs |
| **Negotiation Coach**              | Real-time BATNA analysis, counter-offers, leverage points, closing tactics                            | Temp 0.4, no cache   |

**STANDARD Tier (DeepSeek V3) — 25 agents:**

| Agent                                  | Function                                                                     | Cache    |
| -------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| **Executive Briefing Generator**       | Generates executive summaries of portfolio health, key metrics, action items | 5min     |
| **AI Command Center**                  | Natural language query handler for the command center interface              | No cache |
| **AI Campaign Generator**              | Creates full campaign briefs with goals, audience, messaging, KPIs           | 5min     |
| **AI Outreach Generator**              | Drafts personalized outreach emails with hooks and CTAs                      | No cache |
| **Creative Direction Generator**       | Visual style guides, talking points, platform-specific scripts               | 5min     |
| **Smart Alert Generator**              | Identifies and prioritizes alerts requiring attention                        | 5min     |
| **Deal Pattern Analyzer**              | Finds recurring patterns in successful/failed deals                          | 1hr      |
| **Content Effectiveness Analyzer**     | Evaluates content performance across platforms and campaigns                 | 1hr      |
| **Outreach Conversion Forecaster**     | Predicts email/sequence conversion rates based on historical data            | 5min     |
| **Success Factor Identifier**          | Identifies common factors in top-performing partnerships                     | 1hr      |
| **Campaign Post-Mortem Analyzer**      | Analyzes completed campaigns to extract lessons learned                      | 1hr      |
| **Talent Value Trajectory Predictor**  | Predicts talent growth trajectory and future value                           | 5min     |
| **Competitor Intelligence Analyzer**   | Monitors competitor brand-creator partnerships, white space                  | 1hr      |
| **Audience Overlap Analyzer**          | Detects audience overlap between creators to prevent cannibalization         | 1hr      |
| **Revenue Forecaster**                 | Projects revenue based on pipeline and historical patterns                   | 5min     |
| **Relationship Health Monitor**        | Tracks partnership sentiment, flags at-risk relationships                    | 5min     |
| **Brand Safety Analyzer**              | Scans content history, controversy scores, risk factors                      | 1hr      |
| **Trend Prediction Engine**            | Identifies emerging niches, content formats, platform shifts                 | 1hr      |
| **Roster Optimization Advisor**        | Advises on portfolio composition, complementary vs competitive talent        | 1hr      |
| **Cross-Platform Attribution Modeler** | Models attribution across platforms for multi-touch campaigns                | 1hr      |
| **Compliance & Disclosure Analyzer**   | FTC compliance, #ad requirements, contract obligation checks                 | 6hrs     |
| **Invoice Reconciliation Analyzer**    | Matches invoices to deliverables, flags discrepancies                        | 1hr      |
| **Bulk Agent Operations**              | Batch-processes multiple agent tasks simultaneously                          | No cache |
| **Partnership Simulator**              | Simulates partnership scenarios with variable parameters                     | No cache |
| **Deal Leaderboard Scorer**            | Calculates and ranks deals by composite quality score                        | 5min     |

**FREE Tier (Gemini Flash) — 3 agents:**

| Agent                          | Function                                            | Cache |
| ------------------------------ | --------------------------------------------------- | ----- |
| **Agent Performance Analyzer** | Analyzes AI agent usage, accuracy, and cost metrics | 1hr   |
| **Content Localizer**          | Translates/localizes content for different markets  | 24hrs |
| **Data Extractor**             | Extracts structured data from unstructured inputs   | 24hrs |

---

### 1S. Data Model — 57 Entity Types

#### Core Entities

| Entity          | Table        | Purpose                                                                                                                                                                                                                      |
| --------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile**     | profiles     | User accounts: id, email, full_name, role, plan, company_name, job_title, avatar_url, bio, onboarding_completed                                                                                                              |
| **Talent**      | talents      | Creator/talent profiles: name, email, niche, primary_platform, total_followers, engagement_rate, tier, trajectory, brand_safety_score, discovery_alpha_score, verification_boost, id_verified, fts (full-text search column) |
| **Brand**       | brands       | Brand profiles: name, industry, company_size, annual_budget, preferred_niches                                                                                                                                                |
| **Partnership** | partnerships | Deals: title, brand_name/id, talent_name/id, match_score, match_reasoning, partnership_type, status (10 stages), priority (p1/p2/p3), deal_value, contract_signed_at, deposit_paid, content_approved, final_payment_released |

#### Communication & Outreach

outreach_sequences, outreach_emails (with status tracking: draft through replied/bounced), outreach_metrics, decision_makers

#### Marketplace

marketplace_opportunities, opportunity_applications

#### Deal Management

deal_notes, deal_scores, bundle_deals, escrow_payments, deal_disputes, approval_items, partnership_proposals, activation_checklists, planning_timelines

#### Content & Assets

deck_library, data_room_entries

#### Intelligence & Benchmarks

rate_benchmarks, roi_benchmarks, platform_multipliers, category_premiums, viewership_tiers

#### Events & Demographics

culture_events, mega_events, conferences, demographic_segments, industry_guides

#### Revenue & Subscriptions

talent_revenue_streams, talent_revenue_matrix, subscription_plans, user_subscriptions, billing_history

#### Platform & Teams

connected_platforms, platform_catalog, email_connections, teams, team_members, talent_types

#### Activity & System

activities, tasks, notifications

---

### 1T. Integration Layer

#### 88 Platform Integrations (12 Categories)

1. **Content & Video**: YouTube, TikTok, Instagram, Facebook, Twitter/X, LinkedIn, Snapchat, Pinterest, Reddit, Threads
2. **Photo & Visual**: Flickr, 500px, VSCO, Behance, Dribbble, DeviantArt
3. **Music & Audio**: Spotify, Apple Music, SoundCloud, Bandcamp, Audiomack, Deezer, Tidal, Amazon Music
4. **Gaming & Esports**: Twitch, YouTube Gaming, Kick, Steam, Discord, Epic Games, Xbox Live, PSN
5. **Actors & Performers**: IMDb, Backstage, Casting Networks, Actors Access
6. **Fitness & Wellness**: Strava, Nike Run Club, MyFitnessPal, Peloton, Whoop, Fitbit
7. **Writers & Podcasts**: Substack, Medium, Ghost, Apple Podcasts, Spotify Podcasts, Anchor
8. **Beauty & Fashion**: Sephora Community, LTK, ShopMy, Poshmark, Depop
9. **Athletes & Sports**: ESPN, Bleacher Report, The Athletic, Hudl, MaxPreps
10. **Educators**: Coursera, Udemy, Skillshare, Teachable, Thinkific
11. **Design & Motion**: Adobe Portfolio, ArtStation, Figma Community
12. **General**: Additional platform-specific integrations

**Two connection methods:** OAuth (via Phyllo SDK, +5% discovery boost) and API Key (+3% discovery boost).

#### Supabase Infrastructure

- **Auth**: Email/password, OAuth, magic links with AuthCallback handler
- **Database**: PostgreSQL with Row-Level Security
- **Realtime**: Channel subscriptions for live updates on all entity tables
- **Storage**: File uploads (ID verification, deck uploads, contract documents)
- **Edge Functions**: AI router, Phyllo token creation, subscription management, campaign generation, partnership simulation
- **Full-Text Search**: `fts` column on talents table with `textSearch` method

---

### 1U. User Roles & Feature Gating

#### Five Roles

| Role        | Description                                                                    |
| ----------- | ------------------------------------------------------------------------------ |
| **Talent**  | Creators, influencers, athletes, musicians — people seeking brand partnerships |
| **Brand**   | Companies seeking talent/creator partnerships                                  |
| **Agency**  | Talent management agencies representing multiple talent                        |
| **Manager** | Individual talent managers (inherits Talent permission matrix)                 |
| **Admin**   | Platform administrators with full access to everything                         |

#### Tier Hierarchy

- **Talent Tiers**: Free (0), Rising (1), Pro (2), Elite (3)
- **Brand Tiers**: Free (0), Growth (1), Scale (2), Enterprise (3)
- **Agency Tiers**: Starter (1), Pro (2), Enterprise (3) — no free tier
- **Manager Tiers**: Single (1), Pro (2), Enterprise (3)

#### Feature Access by Tier

**Always Free (all roles):** Dashboard, Settings, Notifications, BillingHistory, SubscriptionManagement, Onboarding, Referrals

**Talent Access Progression:**

- **Free (Tier 0):** TalentProfile, ConnectAccounts, Marketplace, Brands, BrandDashboard, TalentRevenue, MasterCalendar, CultureCalendar, Partnerships, ContractTemplates
- **Rising (Tier 1):** + MatchEngine, Outreach, TalentAnalytics
- **Pro (Tier 2):** + ContactFinder, SequenceBuilder, WarmIntroNetwork, DemographicTargeting, DealAnalytics, DealComparison, BundleDeals, MarketIntelligence, PitchDeckBuilder, DeckLibrary, TalentDataRoom, AICommandCenter, AIAgentsHub, PitchCompetition
- **Elite (Tier 3):** + Integrations, Teams, CustomReports, SimulationEngine, DataImportExport, Analytics, AIFeatures, AIAnalytics, EventManagement, BrandSpendPrediction, PlatformOverview

**Brand Access Progression:**

- **Free (Tier 0):** BrandDashboard, ConnectAccounts, Marketplace, TalentDiscovery, CampaignBriefGenerator, Partnerships, ContractTemplates, Analytics, calendars
- **Growth (Tier 1):** + MatchEngine, ContactFinder, Outreach, TalentAnalytics
- **Scale (Tier 2):** + Most power features (DemographicTargeting, SequenceBuilder, WarmIntroNetwork, DealAnalytics, Approvals, MarketIntelligence, SimulationEngine, PitchDeckBuilder, CustomReports, AICommandCenter, Teams, etc.)
- **Enterprise (Tier 3):** + Integrations, DataImportExport, AIFeatures, AIAnalytics, SystemArchitecture, all DataRooms, DealScoreLeaderboard

**Agency Access:**

- **Starter (Tier 1):** Nearly everything — agencies get broad access from the start
- **Pro (Tier 2):** + AIFeatures, AIAnalytics, DealScoreLeaderboard, EventManagement, cross-DataRooms
- **Enterprise (Tier 3):** + SystemArchitecture (white-label/API access)

**Trial System:** 7-day free trial gives all new users Tier 2 (Pro/Scale equivalent) access. Admins always have full access (tier level 999).

---

## Part 2: Architecture Assessment

_Source: Architecture & Security report_

### 2A. Overall Architecture — React SPA + Supabase + Vercel

**Current State:** Standard Jamstack SPA — Vite-bundled React 18 on Vercel, Supabase handling Postgres + Auth + Realtime + Edge Functions. A compatibility shim (`base44Client.js`) wraps the Supabase SDK behind a legacy API surface.

**Strengths:**

- Stack is well-matched to the product stage. Supabase handles auth, database, realtime, and edge compute in one vendor, minimizing ops overhead.
- Sentry is wired at the root `ErrorBoundary` level with `componentStack` capture — good production observability baseline.
- `QueryClientProvider` and `AuthProvider` are composed cleanly at the top of the tree before the router.

**Upgrade Opportunities:**

**[HIGH]** The `base44Client.js` compatibility layer is a leaky abstraction with a permanent maintenance surface. It silently falls back to a pluralized guess (`entityName.toLowerCase() + 's'`) when a table mapping is missing, producing silent 404s with no developer-visible error. Plan a migration: replace `base44.entities.Foo.filter()` call sites with direct `supabase.from('foo')` queries behind custom hooks or service modules over one to two sprints, then delete the shim.

**[MEDIUM]** `supabaseClient.js` has zero configuration beyond the two environment variables — no session persistence strategy, no `autoRefreshToken` tuning, no `detectSessionInUrl` control. For an app supporting OAuth callbacks and magic links, this should be made explicit and documented.

**[LOW]** No global error handling for failed Supabase network requests. Consider a React Query `onError` global handler that routes `PGRST`-prefixed errors to a toast with a useful action.

---

### 2B. Component Structure and Code Organisation

**Current State:** 77+ pages registered in `pages.config.js`, all lazy-loaded. The `src/` layout follows a conventional structure: `pages/`, `components/`, `hooks/`, `api/`, `lib/`. The `Layout.jsx` file is 558 lines containing inline component definitions, business logic, data fetching, and rendering concerns all in one place.

**Strengths:**

- `pages.config.js` as a single registry for all routes is clean — adding a new page is one line.
- Hooks are well-separated with clear single-purpose files.
- `AuthContext` is properly typed with a thrown error if `useAuth` is called outside its provider.

**Upgrade Opportunities:**

**[HIGH]** `Layout.jsx` defines `Sidebar` as an inner component that closes over `navItems`, `collapsed`, `setCollapsed`, etc. Every state change in Layout re-creates the Sidebar function reference, preventing React from bailing out of re-renders efficiently. Extract `Sidebar` to a named export in `src/components/layout/Sidebar.jsx`.

**[HIGH]** `Layout.jsx` issues two independent Supabase fetches in a `useEffect` (one for `auth.me()` and one for `ApprovalItem.filter()`), while `AuthContext` already fetches the user profile. This duplicates a network round-trip on every mount. Pass `user` from `useAuth()` into Layout rather than re-fetching.

**[MEDIUM]** The `roleNavItems` object in `Layout.jsx` is 270 lines of static configuration mixed into a rendering file. Move it to `src/lib/roleNavItems.js` so it can be referenced independently by tests.

**[MEDIUM]** Public route membership is defined in three separate places: the `PAGES` map, the inline `publicMarketingRoutes` object in `App.jsx`, and the `publicPages` set in `routePermissions.js`. These three must be kept in sync manually. Consolidate to a single `PUBLIC_ROUTES` constant.

---

### 2C. State Management

**Current State:** Three-layer state model: React Context (`AuthContext`) for auth state, TanStack Query v5 for server state, and component-local `useState` for UI state.

**Strengths:**

- TanStack Query with 2-minute `staleTime` and `refetchOnWindowFocus: false` is sensible for a CRM-style app.
- `useRealtimeSync` bridges Supabase Realtime events directly to React Query cache invalidation — the right pattern.
- `retry: 1` prevents thrashing on persistent failures.

**Upgrade Opportunities:**

**[HIGH]** `useFeatureGate`, `Layout.jsx`, and `AuthContext` all independently fetch the user profile from Supabase on mount. That is three separate reads of the same row on initial load, none going through React Query so they cannot be deduplicated. Move the profile fetch into a single `useQuery(['profile', userId])` shared by all consumers.

**[MEDIUM]** `useFeatureGate` holds `profile` in local `useState`. If 10 components on a page call `useFeatureGate()`, that is 10 simultaneous Supabase calls on mount.

**[LOW]** The `QueryClient` does not set `gcTime`. With 77 pages, users navigating many screens will accumulate a large number of inactive query entries. Set explicit `gcTime: 1000 * 60 * 10`.

---

### 2D. Data Flow Patterns

**Current State:** Data writes go through `base44Client.js` → `supabaseClient` → Postgres RLS. AI requests go through `base44.functions.invoke('ai-router', args)` → Supabase Edge Function → external AI provider. Realtime updates flow from Postgres → Supabase Realtime → `useRealtimeSync` → React Query invalidation → re-fetch.

**Strengths:**

- The `updateMe` method has an explicit field whitelist with a comment calling out that `role` is intentionally excluded to prevent privilege escalation.
- Edge Functions are properly authenticated — the AI router validates the JWT on every request and performs server-side tier lookup rather than trusting a client-provided tier value.

**Upgrade Opportunities:**

**[HIGH]** The `list()` and `filter()` methods have a hard default `limit: 100` with no pagination support. For tables like `partnerships` or `activities` that will grow over time, pages are silently truncated at 100 rows with callers having no way to know they are seeing a partial result set.

**[MEDIUM]** The `autoSeed` flow executes 5 sequential SELECT queries, then seed, then a full `queryClientInstance.invalidateQueries()` which fires re-fetches for every active query simultaneously. Replace the 5 individual checks with a single multi-table query, or move seed-state tracking to a server-side flag (`demo_seed_done: boolean`) in the `profiles` table.

**[MEDIUM]** No optimistic update pattern is in use anywhere. All mutations wait for a full round-trip before the UI updates. For a deal pipeline where users frequently change statuses, optimistic updates would significantly improve perceived performance.

---

### 2E. Authentication Flow

**Current State:** `AuthContext.jsx` handles session initialization with a 5-second `Promise.race` timeout against Supabase's `getSession()`. On mount it scans `localStorage` for malformed `sb-*` auth tokens and clears them.

**Strengths:**

- The 5-second timeout with graceful fallback to unauthenticated state is a good resilience pattern.
- Stale-token cleanup on init prevents a class of "invalid header value" errors.

**Upgrade Opportunities:**

**[CRITICAL]** `authError` is declared as state in `AuthContext` but is **never set** — it is always `null`. The `AuthenticatedRoutes` component checks `authError?.type === 'user_not_registered'` and would render `UserNotRegisteredError`, but this branch is permanently unreachable. Either implement the error path or remove the dead code path.

**[HIGH]** Public route matching in `App.jsx` uses a series of `if (location.pathname === '/X')` checks that execute on every render for every URL. Extract to a route configuration structure and match once.

**[MEDIUM]** `logout` in `AuthContext` does `window.location.href = '/'` (a hard reload) rather than using React Router's `navigate`. More critically, `base44.auth.logout()` (called from Layout's sign-out button) and `AuthContext.logout()` are separate code paths that both call `supabase.auth.signOut()` but only one resets the React state. Use only one logout path.

**[LOW]** The `navigateToLogin` function uses `window.location.href = '/login'` (hard navigation). Since the app uses React Router, this should be `navigate('/login', { replace: true })`.

---

### 2F. Feature Gating System

**Current State:** Two-file access control: `useFeatureGate.js` (client-side, tier-based) and `routePermissions.js` (client-side, role-based). These operate in series.

**Strengths:**

- Tier-accumulation logic in `getAccessiblePages` is correct and clean — higher tiers inherit lower tier access automatically.
- During 7-day trial, users get `effectiveTier = 2` (Pro/Scale equivalent).

**Upgrade Opportunities:**

**[CRITICAL]** There are **two separate, divergent access-control systems** that must be manually kept in sync. A page added to `routePermissions.js` but not `useFeatureGate.js` will be navigable but show as locked in the sidebar. A page in `useFeatureGate` but not `routePermissions` will be invisible to the role entirely. **This is the highest-priority architectural risk in the codebase.** Consolidate to a single source of truth: one data structure that expresses both role membership and tier requirement for each page.

**[HIGH]** `useFeatureGate.js` defines no page permissions for the `manager` role — it delegates to `getAccessiblePages("talent", tierLevel)`. However, `routePermissions.js` gives `manager` its own independent page set that differs from `talent`. This inconsistency means managers see gating behavior that talent users do not.

**[HIGH]** `MANAGER_TIERS` is defined in `useFeatureGate.js` but `getAccessiblePages` for `manager` delegates to the talent tier map. A `manager_pro` user gets `TALENT_PAGES` at tier 2, including pages that may not make sense for a manager role.

**[MEDIUM]** `featureFlags.js` is a third, separate feature-control mechanism (plan-based named flags for `ai_command_center`, `bulk_outreach`, etc.). Three-way system: role routing, tier-based page gating, named feature flags. These need to be aligned and ideally merged.

**[LOW]** If `loading` is `true` in `useFeatureGate`, `canAccess` returns `true` for everything. On initial load there is a brief window where all features appear accessible before the profile loads. Consider initializing from a localStorage-cached tier value.

---

### 2G. AI Router System

**Current State:** Supabase Edge Function in Deno TypeScript. Single `index.ts` entry point with health, diagnose, and main route endpoints. `agents.ts` defines 32 agents. `router.ts` implements provider fallback chains. `circuit-breaker.ts` implements the three-state circuit breaker pattern.

**Strengths:**

- Circuit breaker is textbook-correct: CLOSED → OPEN (after 3 failures) → HALF_OPEN (after 30s) → CLOSED on success.
- Provider fallback chains are ordered by quality tier: COMPLEX routes to Anthropic first, FREE routes to Gemini first.
- Anthropic prompt caching via `cache_control: { type: 'ephemeral' }` on system prompts — meaningful cost reduction.
- Rate limiting enforced server-side using the `ai_usage_logs` table count query.
- The diagnose endpoint correctly requires admin role verification before testing provider keys.

**Upgrade Opportunities:**

**[CRITICAL]** The in-memory response cache (`const responseCache = new Map(...)`) **does not work as intended in a serverless Edge Function environment**. Supabase Edge Functions run on Deno Deploy, which spins up new isolates per request — there is no guarantee two requests hit the same isolate. In practice this cache will have an extremely low hit rate. Replace it with a database-backed cache (`ai_response_cache` table with TTL-based cleanup) or a KV store.

**[HIGH]** The `routeRequest` function in `router.ts` has no timeout on individual provider calls. If Anthropic or DeepSeek takes 45 seconds (which can happen with long context), the Edge Function holds the Deno isolate open for the full duration. Add a `Promise.race` with `AbortController` and a configurable timeout (e.g. 25 seconds) per provider attempt.

**[HIGH]** The usage logging Supabase client (line 328) creates a **new `createClient` instance on every single request** just for logging. The auth client also creates a new instance. Two Supabase clients per request is wasteful — initialize them once at module scope outside `Deno.serve`.

**[HIGH]** The token count estimation (`Math.ceil(prompt.length / 4)`) can be 30-50% wrong for non-English content or content with significant whitespace/code. Use the actual token counts returned in provider responses where available (Anthropic and OpenAI-compatible APIs return `usage` objects).

**[MEDIUM]** The `REASONING` tier falls back from `deepseek_reasoner` to `anthropic` to `gemini`. Gemini does not have native chain-of-thought reasoning capability comparable to DeepSeek-R1. Consider surfacing a `degraded: true` flag when a REASONING-tier request falls back to a non-reasoning provider.

**[MEDIUM]** 24 of 32 agents have `useBatch: false` and `offPeakOnly: false` settings that are referenced nowhere in `index.ts` or `router.ts`. These are dead configuration fields. Either implement the batch processing pathway or remove them.

**[LOW]** Cache key generation uses a JavaScript djb2 hash producing 32-bit signed integers with collision risk at scale. Use the Web Crypto API's `crypto.subtle.digest('SHA-256', ...)` for collision-resistant keys.

---

### 2H. Theme System

**Current State:** Two themes (`dark` and `pearl`) as static JS objects. Theme key persisted to `localStorage` with key `ds-landing-theme`. On theme change, three CSS custom properties are set on `document.documentElement`.

**Strengths:**

- Graceful try/catch around localStorage access handles private browsing scenarios.
- Theme object exposes semantic tokens (`textMuted`, `textDim`, `cardBg`) rather than raw hex values.

**Upgrade Opportunities:**

**[HIGH]** The `useTheme` comment says "App/dashboard always stays pearl via CSS (no .dark class)" — but `Layout.jsx` imports `useTheme` and renders `ThemeSwitcher` in the sidebar. If the dashboard always uses pearl, removing `useTheme` from Layout would eliminate the ambiguity. Define clearly whether the dashboard supports theme switching.

**[MEDIUM]** Only 3 of the theme object's ~18 properties are written to CSS custom properties. The rest are used by passing `theme.X` directly as inline styles. This creates a dual-track system where some styles respond to theme changes via CSS variables and others only update on the next render cycle. Migrate all theme properties to CSS custom properties.

**[LOW]** No server-side theme persistence. Storing `theme_preference` in the `profiles` table and loading it in `AuthContext` would provide a premium UX detail that aligns with brand positioning.

---

### 2I. Role-Based Navigation

**Current State:** Five roles: `admin`, `brand`, `talent`, `manager`, `agency`. Navigation controlled by the `roleNavItems` object — a static map from role string to array of items. Items are locked via `canAccess(item.page)` from `useFeatureGate`.

**Strengths:**

- The `section` property on nav items renders section headers inside the sidebar, making long nav lists scannable.
- Three-mode sidebar (overlay, icon rail, full) with `forceCollapsed` for tablet is a well-considered responsive pattern.
- ARIA labels are present on the mobile menu toggle, close button, and sign-out button.

**Upgrade Opportunities:**

**[HIGH]** The `admin` role nav has 51 items — more than double any other role. Rendering 51 link elements on every page render with no virtualization is a performance concern. The sidebar nav should be virtualized or sectioned with collapsible groups.

**[HIGH]** The `Sidebar` component captures `userRole` via closure computed from `user?.role || "brand"`. This means there is a flash-of-wrong-nav on initial load for non-brand users: for ~200-400ms while the profile is loading, a `talent` user sees brand navigation items. Render `null` or a skeleton nav until `user` is confirmed non-null.

**[MEDIUM]** `roleNavItems` for `manager` is almost identical to `talent`, differing only by the addition of `ManagerProfile` and `My Talent` items. The 40 shared items are duplicated in full. Extract shared items into a `TALENT_BASE_NAV` constant.

**[MEDIUM]** The `pendingApprovals` count is fetched with no role filter — it fetches all pending approvals, not just those relevant to the current user. A brand user will see an inflated count.

---

### 2J. Code Splitting and Lazy Loading

**Current State:** All 77 application pages are registered as `React.lazy()` imports. Marketing/feature pages are additionally lazy-imported inline in `App.jsx`. `Suspense` boundaries are placed at route level with a `SkeletonDashboard` fallback.

**Strengths:**

- The pattern is applied consistently — no eagerly-imported page components in the authenticated route tree.
- The `Suspense` fallback uses a purpose-built `SkeletonDashboard` rather than a spinner.

**Upgrade Opportunities:**

**[HIGH]** Pages always needed on first authenticated load — `Dashboard`, `Settings`, `Notifications` — should use Vite's prefetch hint (`/* @vite-env-hint: prefetch */`) so the browser begins fetching them during idle time after initial load.

**[MEDIUM]** `App.jsx` manually re-declares lazy imports for marketing pages that are **already registered in `pages.config.js`**. These pages are lazy-loaded twice — the double registration may generate duplicate chunks in some bundler configurations.

**[LOW]** There is no route-level preloading on hover or navigation intent. Consider adding an `onMouseEnter` preload trigger on nav links that fires the dynamic import ~200ms before the click.

---

### 2K. Architecture Priority Remediation

| Priority | Item                                                                       | File(s)                                   | Effort   |
| -------- | -------------------------------------------------------------------------- | ----------------------------------------- | -------- |
| CRITICAL | Unify access-control: merge `routePermissions.js` + `useFeatureGate.js`    | Both files                                | 2–3 days |
| CRITICAL | Fix `authError` never being set — dead code path                           | `AuthContext.jsx`                         | 2 hours  |
| CRITICAL | Replace in-memory AI cache with persistent KV/DB cache                     | `ai-router/index.ts`                      | 1 day    |
| HIGH     | Eliminate duplicate profile fetches — move to shared React Query key       | AuthContext, useFeatureGate, Layout       | 1 day    |
| HIGH     | Add per-provider timeout + AbortController in AI router                    | `ai-router/router.ts`                     | 3 hours  |
| HIGH     | Extract `Sidebar` out of `Layout` closure                                  | `Layout.jsx`                              | half day |
| HIGH     | Create Supabase clients at module scope in Edge Function                   | `ai-router/index.ts`                      | 1 hour   |
| HIGH     | Fix hard `limit: 100` with no pagination in `base44Client.js`              | `base44Client.js`                         | 1 day    |
| HIGH     | Resolve `manager` role divergence between the two gating systems           | Both gating files                         | half day |
| MEDIUM   | Remove double logout paths; unify on one signout flow                      | `AuthContext.jsx`, `Layout.jsx`           | 2 hours  |
| MEDIUM   | Replace character-count token estimation with actual API usage fields      | `ai-router/index.ts`                      | 2 hours  |
| MEDIUM   | Move `roleNavItems` to its own config file                                 | `Layout.jsx` → `src/config/navigation.js` | 1 hour   |
| MEDIUM   | Remove dead `useBatch`/`offPeakOnly` agent config fields or implement them | `ai-router/agents.ts`                     | 1 hour   |
| MEDIUM   | Consolidate `featureFlags.js` into `useFeatureGate.js`                     | `featureFlags.js`                         | half day |
| LOW      | Add hover-prefetch on sidebar nav links                                    | `Layout.jsx`                              | 2 hours  |
| LOW      | Persist theme preference to `profiles` table                               | `useTheme.js`, `AuthContext.jsx`          | 2 hours  |

---

## Part 3: Frontend & UX Audit

_Source: Frontend UX Audit report_

### 3A. Component Architecture

**Current State:** 77 pages, all lazy-loaded. Components organized into domain directories: `agents/`, `deals/`, `marketplace/`, `subscription/`, `dashboard/`, `landing/`. Shared UI library under `src/components/ui/` covers 30+ shadcn/radix primitives plus custom additions (`loading-skeleton.jsx`, `empty-state.jsx`, `optimized-image.jsx`).

**What Works Well:**

- Every page is code-split with `React.lazy()`.
- `loading-skeleton.jsx` exports named skeleton variants (`CardGridSkeleton`, `KanbanSkeleton`, `StatCardsSkeleton`).
- `empty-state.jsx` is a reusable zero-state component with proper `role="img"` and `aria-hidden` on icons.
- `OptimizedImage` enforces `width`/`height` to prevent CLS and supports `priority` for hero images.

**Issues Found:**

- **Icon consistency problem**: `Zap`, `Layers`, `BarChart3` are reused for semantically different nav items. Users scanning a collapsed sidebar cannot distinguish sections.
- **Two FeatureGate components exist**: `src/components/subscription/FeatureGate.jsx` (makes an async API call) and the inline gate in `Layout.jsx` (uses `useFeatureGate` hook directly). Overlapping but different behavior.
- **No barrel exports**: Each import requires the full path.
- **`loading-skeleton.jsx` hardcodes `bg-white`**: Will clash with dark theme sidebar context.

**Upgrade Ideas:**

- **[High]** Audit all nav icons and assign unique, semantically-correct ones per feature category. A `navIconMap.js` constant file would centralize this.
- **[Medium]** Consolidate the two FeatureGate implementations. The hook-based version in Layout is better; retire the API-call version.
- **[Medium]** Add CSS variable awareness to `loading-skeleton.jsx` so skeletons use `bg-muted` instead of `bg-white`.

---

### 3B. Landing Page

**Current State:** `LandingPage.jsx` is a single-file, 1000+ line component with inline CSS as a `<style>` block tied to `isPearl`. Covers: animated nav with dropdowns, hero with static UI mockup, trust bar, stats strip, animated ticker, six alternating feature rows, "How It Works" tab section, pricing grid with role switcher, FAQ accordion, and footer. The `AnimatedWalkthrough` component uses React state timers for a 9-scene animated demo.

**What Works Well:**

- Premium typography: Cormorant Garamond for display, Instrument Sans for UI, Instrument Mono for labels.
- Gold/amber gradient token system is consistent and creates strong brand identity.
- Scroll-triggered fade-ins via `IntersectionObserver` add polish without a heavy animation library.
- Pricing role switcher (talent/brand/agency) reduces decision anxiety.
- Pearl/dark theme toggle on the landing page is a differentiated feature.

**Issues Found:**

- **The hero UI mockup is static HTML, not live**: First-time visitors cannot interact with it.
- **Navigation is always `rgba(8,8,7,0.92)` dark regardless of Pearl theme**: Jarring contrast break at the top of a warm-ivory page.
- **Mobile nav (`mobileNavOpen`) has no focus trap**: Keyboard users pressing Tab can reach content behind the overlay.
- **The `<style>` block injection re-runs on every `isPearl` toggle**: A CSS custom property update would be more efficient.
- **No `preconnect` for Google Fonts**: Adds 100-300ms to font availability on cold loads.
- **The pricing annual toggle (`billingAnnual`) does not update prices**: Toggle state is tracked but displayed prices do not change — the annual discount math is not implemented.

**Upgrade Ideas:**

- **[Critical]** Fix annual billing toggle to actually compute and display discounted prices, or remove it entirely. A visible but non-functional toggle destroys trust.
- **[High]** Move `AnimatedWalkthrough` into the hero section as an interactive product tour, replacing the static mockup.
- **[High]** Implement a proper focus trap on the mobile nav (Radix `FocusScope` or `@headlessui/react` Dialog).
- **[High]** Fix nav background to be theme-aware: in Pearl mode, use `rgba(250,245,235,0.92)` with `border-bottom: 1px solid rgba(180,160,120,0.15)`.
- **[Medium]** Extract the inline `<style>` block into CSS custom properties updated via JS.
- **[Medium]** Add a role-specific social proof strip between the hero and features.
- **[Low]** Add `link rel="preconnect"` tags for Google Fonts to `index.html` head.

---

### 3C. Dashboard Experience

**Current State:** `Layout.jsx` implements a three-breakpoint responsive sidebar: full-width collapsible on desktop (lg+), force-collapsed icon rail on tablet (md-lg), and drawer overlay on mobile (<md). Header contains `GlobalSearch` bar and `NotificationDropdown`. Trial/expired banners render inline above page content.

**What Works Well:**

- Three-tier breakpoint strategy (mobile drawer, tablet icon rail, desktop full sidebar) mirrors what Linear and Notion do.
- Escape key and body scroll lock on mobile menu are correctly implemented accessibility patterns.
- Role-colored portal badge in the sidebar gives immediate context.
- Pending approvals badge updates from a real API query.
- `aria-label` on mobile menu button, close button, and sign-out button.

**Issues Found:**

- **Navigation has no active section grouping on mobile/tablet**: On the tablet icon rail, 30+ icons render as a raw list with no visual grouping.
- **Admin nav has 40+ items with no sections**: Renders as an unsectioned wall of items.
- **`GlobalSearch` scope is too narrow**: Only searches `IndustryGuide`, `CultureEvent`, `MegaEvent`, and `DemographicSegment`. Deals, talent profiles, brands, campaigns, and contacts are not searchable.
- **`GlobalSearch` styling is white/light hardcoded**: Will look broken in dark theme since the header uses dark `bg-card`.
- **`NotificationDropdown` uses `bg-white` and `border-slate-200`** hardcoded — same theme-mismatch problem.
- **Trial banner is inline with page content** — not a fixed top bar. Stripe and Linear both use a persistent top banner that stays fixed.
- **No keyboard shortcut for global search**: Cmd+K is not wired.
- **`Sidebar` is defined as a nested component inside `Layout`**: Re-created on every render.
- **Page title regex breaks on abbreviations**: "AICommandCenter" becomes " A I Command Center" with unwanted leading space.

**Upgrade Ideas:**

- **[Critical]** Add `Cmd+K` / `Ctrl+K` keyboard shortcut to open global search.
- **[High]** Expand `GlobalSearch` to cover the top 5 entity types: deals/partnerships, talent profiles, brands, outreach contacts, and pages.
- **[High]** Convert trial/expired banners to a sticky top bar outside the scrollable content area.
- **[High]** Fix `GlobalSearch` and `NotificationDropdown` styling to use CSS variables / Tailwind's `bg-background`, `border-border`, `text-foreground` tokens.
- **[Medium]** Add section separators to the admin nav.
- **[Medium]** On the tablet icon rail, group icons by section with a hairline divider between groups.
- **[Medium]** Extract `Sidebar` to a module-level memoized component (`React.memo`).
- **[Low]** Fix PascalCase page title regex to handle known abbreviations before the regex runs.

---

### 3D. Onboarding Flow

**Current State:** `Onboarding.jsx` is a multi-step flow starting with role selection (Talent, Brand, Agency, Manager), then account details, then role-specific plan selection with pricing cards, and optionally Stripe payment. The Layout component renders `{children}` directly when `currentPageName === "Onboarding"`, correctly bypassing the sidebar.

**What Works Well:**

- Four-role selection screen with perks gives new users immediate clarity on which path is for them.
- Plan selection is embedded in onboarding — no separate pricing page hop.
- Manager role is surfaced as a distinct identity, which is rare and professional.
- `LABEL_MAP` adapts field labels per role.

**Issues Found:**

- **No progress indicator**: At least 3 steps with no step counter, progress bar, or breadcrumb.
- **Plans shown before account creation is confirmed**: Users see pricing before they've typed their name.
- **Naming inconsistency**: `PLANS_BY_ROLE.talent` free plan is titled "Starter" in Onboarding but "Free" in `LandingPage.jsx`. Brand free tier is "Explorer" in Onboarding but "Free" on the landing page.
- **Mobile experience**: No evidence of mobile-specific optimizations for the multi-step form.
- **No social/SSO login option**: Only email/password. Missing "Continue with Google" is a significant signup drop-off source.
- **Manager plan CTAs**: "Start Managing" and "Start Multi-Talent" are awkward compared to clean CTAs used for other roles.

**Upgrade Ideas:**

- **[Critical]** Fix free plan naming: pick either "Free" or "Starter" and use it consistently across both `LandingPage.jsx` and `Onboarding.jsx`. Reconcile "Explorer" vs "Free" for brand.
- **[High]** Add a visual step indicator (3-step progress bar) at the top of the onboarding container.
- **[High]** Reorder steps: (1) Role → (2) Account details → (3) Plan selection. Asking for commitment before showing a bill is a conversion best practice.
- **[Medium]** Add Google OAuth via Supabase's `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **[Medium]** Add an animated role preview panel that shows "what you'll see" when a role card is hovered/selected.

---

### 3E. Theme System

**Current State:** `useTheme.js` defines two themes (`dark`, `pearl`) with explicit token objects. Theme key persisted to `localStorage`. The landing page uses a much more comprehensive set of CSS variables injected inline via the `<style>` block. The dashboard uses Tailwind's CSS variable-based tokens from shadcn.

**What Works Well:**

- Two-theme system is clean and memorable.
- Gold/amber palette is shared across both themes — brand identity survives theme switching.
- The pearl theme uses `#faf5eb` (warm ivory) rather than pure white — premium feel.

**Issues Found:**

- **Theme architecture is split across three systems**: (1) The `THEMES` object in `useTheme.js` with ~15 tokens, (2) the 30+ CSS variables injected inline in `LandingPage.jsx`, (3) Tailwind's CSS variable tokens in the dashboard. These three systems don't share a source of truth.
- **The dashboard never applies the pearl theme**: The `ThemeSwitcher` lives in the sidebar but controls only the landing page the user can't see.
- **Only 3 of the 15 theme tokens are set as CSS variables**. The other 12 tokens are only accessible via the `theme` object passed as props.

**Upgrade Ideas:**

- **[High]** Reconcile the theme architecture into a single source: expand `useTheme.js` to set all ~15 tokens as CSS custom properties on `:root`. The dashboard Tailwind config then maps `--background` to `var(--ds-bg)`, etc.
- **[High]** Make the dashboard actually respond to dark/pearl switching.
- **[Medium]** Move `ThemeSwitcher` from the sidebar footer to the header (top-right, before the avatar), where it will have immediate visual effect.
- **[Low]** Add a third theme (e.g. "Slate") to demonstrate the token system is truly extensible.

---

### 3F. Mobile Responsiveness

**Current State:** `useIsMobile` uses `window.innerWidth <= 768` with a `resize` event listener.

**Issues Found:**

- **`useIsMobile` is a polling anti-pattern**: `window.addEventListener("resize", handler)` fires on every pixel of resize. `window.matchMedia("(max-width: 768px)")` with a `change` listener is the standard approach.
- **No SSR safety**: `window.innerWidth` in the `useState` initializer will throw in any SSR environment.
- **Landing page `ds-hero-top` has `padding: 4rem 3rem 3rem`**: On a 375px viewport with no breakpoint override, 48px horizontal padding each side leaves only 279px of content width.
- **Hero feature rows use `grid-template-columns: 1fr 1fr`** with no breakpoint switch to single column on mobile.
- **`ds-stats` uses `grid-template-columns: repeat(4,1fr)`** — four equal columns — with no mobile adaptation. On 375px, each cell is ~94px, making stat numbers truncate.
- **`ds-hiw-grid` uses `repeat(3,1fr)`** — same issue for the "How It Works" section.
- **No mobile-specific pricing layout**: Pricing cards will render sub-optimal widths on mobile.

**Upgrade Ideas:**

- **[High]** Replace `useIsMobile` with `matchMedia` for efficient, standard resize detection.
- **[High]** Add responsive media queries for the landing page inline style block: `.ds-feature-row`, `.ds-stats`, `.ds-hiw-grid`, `.ds-pricing-grid-cols` all need `@media (max-width: 768px)` overrides switching to single-column layout.
- **[Medium]** On mobile, swap the hero from the static `.ds-hero-ui` mockup to a scrolling carousel of 3 key product screenshots.
- **[Low]** Add `content-visibility: auto` to below-the-fold landing sections.

---

### 3G. Performance (Frontend)

**What Works Well:**

- `React.lazy()` on every page is near-perfect code splitting.
- `fetchPriority="high"` on both logo variants in the sidebar prevents render-blocking LCP delay.
- TanStack Query's 30-second `refetchInterval` on notifications is a sensible polling strategy.
- `IntersectionObserver` for scroll-triggered animations avoids attaching scroll listeners.

**Issues Found:**

- **No Suspense boundary wrapping lazy pages**: If a page component fails to load (network error), React will throw without a fallback.
- **`GlobalSearch` runs 4 parallel `useQuery` calls** eagerly on mount, before the user even opens search. These 4 requests fire on every dashboard load.
- **`useAutoSeed.js` and `seedDemoData` are imported in `Dashboard.jsx`**: The seed utility pulls data-generation code into the production bundle.
- **`AnimatedWalkthrough` uses `setInterval`** at 50ms (20 state updates per second) — persistent CPU load if the component is always mounted.

**Upgrade Ideas:**

- **[High]** Wrap all lazy page components in a `<Suspense>` boundary using `KanbanSkeleton` or `StatCardsSkeleton` as the fallback.
- **[High]** Convert `GlobalSearch` queries to `enabled: false` by default, activated only when the search input gains focus.
- **[Medium]** Dynamically import `seedDemoData` inside `Dashboard.jsx` to remove it from the main dashboard chunk.
- **[Medium]** Add `vite-bundle-visualizer` to the build pipeline.
- **[Low]** Add `useVisibility` / `IntersectionObserver` to `AnimatedWalkthrough` and pause the scene timer when off-screen.

---

### 3H. Accessibility

**What Works Well:**

- Icon-only interactive elements have `aria-label`.
- `EmptyState` clones action icon elements to inject `aria-hidden: true`.
- `OptimizedImage` fallback span uses `role="img"` + `aria-label`.
- Form elements in Onboarding use shadcn's `Label` component which handles `htmlFor` association.

**Issues Found:**

- **`GlobalSearch` has no `aria-expanded` on the dropdown**: Should be `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant`.
- **`NotificationDropdown` has no `aria-label` on the trigger button**: Screen reader users hear "button" with no context.
- **`NotificationDropdown` has no focus trap**: Keyboard users can Tab behind it to main content.
- **Nav links with `to="#"` for locked features**: Should be `role="button"` or a `<button>` element since clicking triggers a modal, not navigation.
- **Badge in header renders as a `<div>`**: Contextual labels inside the header should be `<span>` or given an appropriate ARIA role.
- **Sidebar section headers render as `<p>` tags**: Should be `role="group"` with `aria-label` to define navigation regions.
- **Color contrast issues**: `text-slate-500` (~4.1:1 on white), `var(--ds-cream3)` `rgba(245,240,230,0.28)` on `#1c1b19` dark background (~1.6:1, below WCAG AA).
- **No `role="navigation"` accessible name on the sidebar `<nav>`**: Multiple nav landmarks should be distinguished.
- **No skip link**: No `<a href="#main-content">Skip to main content</a>` for keyboard users.

**Upgrade Ideas:**

- **[Critical]** Add a skip-to-content link as the first focusable element in `Layout.jsx`, linking to `id="main-content"` on the `<main>` element.
- **[High]** Add `aria-label="Main navigation"` to the sidebar `<nav>`, and change section header `<p>` tags to use `role="group"` with `aria-label`.
- **[High]** Convert `GlobalSearch` to a proper `role="combobox"` pattern.
- **[High]** Add `aria-label="Notifications"` to the `NotificationDropdown` trigger button.
- **[Medium]** Change locked nav items from `<Link to="#">` to `<button type="button">`.
- **[Medium]** Add a focus trap to `NotificationDropdown` using Radix `FocusScope`.
- **[Medium]** Audit all `var(--ds-cream3)` and `text-slate-500` usages against background values using `axe-core` in CI.

---

### 3I. UI Component Library

**Current State:** 30+ shadcn/radix-ui components. Three custom components extend the library.

**What Works Well:**

- The full shadcn library is present — no need to reach for additional component libraries.
- `Command` component (shadcn's cmdk wrapper) is installed but **not used** — the perfect primitive for upgrading `GlobalSearch` into a `Cmd+K` command palette.
- `Sheet` is installed — ideal for mobile-friendly detail drawers.
- `Carousel` is installed — could power a mobile hero slide experience.

**Issues Found:**

- **`Button` component lacks a `gold` variant**: The design system's primary CTA button style is only available via ad-hoc inline `style={{background: "linear-gradient(135deg, #c4a24a, #e07b18)"}}` throughout. No `variant="brand"` or `variant="gold"` exists in `buttonVariants`.
- **`Badge` renders as a `<div>` not a `<span>`**: Badges are inline content and should be `<span>` elements. Div-inside-span contexts create invalid HTML.
- **`Card` has `shadow` in its default class** but many pages override with `className="border-0 shadow-none"` because the default shadow is too heavy.
- **`Command` (cmdk) is imported but unused**: The more capable primitive is sitting idle.
- **No `Kbd` component**: Keyboard shortcut badges (e.g., the `⌘K` hint) require ad-hoc inline styles.

**Upgrade Ideas:**

- **[High]** Add a `gold` variant to `buttonVariants` in `button.jsx`: `gold: "bg-gradient-to-r from-[#c4a24a] to-[#e07b18] text-[#080807] font-medium hover:opacity-90 transition-opacity"`. Then replace all inline `style={{background: "linear-gradient..."}}` button overrides.
- **[High]** Rebuild `GlobalSearch` using the existing `Command` (cmdk) component as a `Cmd+K` palette with keyboard navigation through results, grouped sections, and page search.
- **[Medium]** Change `Badge` to render a `<span>` instead of `<div>` to fix HTML validity.
- **[Medium]** Add a `Kbd` component to `src/components/ui/` for use in the `GlobalSearch` trigger to show `⌘ K`.
- **[Low]** Add a `flat` variant to `Card` (no box shadow, slightly lighter border) for dashboard stat cards.

---

### 3J. Frontend Priority Matrix Summary

| Priority | Area          | Item                                                                |
| -------- | ------------- | ------------------------------------------------------------------- |
| Critical | Landing       | Annual billing toggle shows but does not compute prices             |
| Critical | Onboarding    | Free/Starter/Explorer plan naming inconsistency                     |
| Critical | Accessibility | Add skip-to-content link                                            |
| High     | Layout        | `Cmd+K` keyboard shortcut for global search                         |
| High     | Layout        | Expand GlobalSearch to cover deals, talent, brands, pages           |
| High     | Layout        | Make trial banner sticky                                            |
| High     | Layout        | Fix GlobalSearch and NotificationDropdown hardcoded light styles    |
| High     | Landing       | Move AnimatedWalkthrough into the hero section                      |
| High     | Landing       | Fix mobile media queries for feature rows, stats grid, pricing grid |
| High     | Theme         | Unify the three theme systems into one CSS custom property source   |
| High     | Theme         | Make dashboard respond to dark/pearl theme switching                |
| High     | Performance   | Wrap lazy pages in Suspense with skeleton fallback                  |
| High     | Performance   | Defer GlobalSearch queries until search is opened                   |
| High     | UI Library    | Add `gold` variant to Button component                              |
| High     | UI Library    | Rebuild GlobalSearch as a cmdk Command palette                      |
| High     | Accessibility | Convert GlobalSearch to `role="combobox"` with ARIA state           |
| High     | Accessibility | Add `aria-label` to NotificationDropdown trigger                    |
| Medium   | Architecture  | Consolidate dual FeatureGate components                             |
| Medium   | Onboarding    | Add step progress indicator                                         |
| Medium   | Onboarding    | Add Google OAuth via Supabase                                       |
| Medium   | Accessibility | Convert locked nav items from `<Link to="#">` to `<button>`         |
| Medium   | UI Library    | Change Badge from `<div>` to `<span>`                               |
| Low      | Landing       | Add `preconnect` for Google Fonts                                   |
| Low      | Performance   | Dynamically import seedDemoData                                     |

---

## Part 4: Database & Backend

_Source: Database & Backend report_

### 4A. Schema Design Issues

#### 4A.1 Dual Schema Divergence (CRITICAL — P0)

There are two conflicting schema definitions. `001_create_tables.sql` defines one column layout, while `schema.sql` defines a different, more mature layout. The two disagree on column names, types, foreign keys, and constraints for nearly every table.

**Examples of divergence:**

- `profiles`: migration has `company`/`title`, schema.sql has `company_name`/`job_title`
- `brands`: migration has `created_by TEXT`, schema.sql has `owner_id UUID REFERENCES profiles(id)`
- `partnerships`: migration has `priority TEXT DEFAULT 'p2'`, schema.sql has `priority TEXT CHECK (priority IN ('low','medium','high','urgent'))`
- `notifications`: migration has `user_email TEXT` / `status TEXT`, schema.sql has `user_id UUID` / `read BOOLEAN`
- `activities`: migration has `actor_email TEXT`, schema.sql has `user_id UUID REFERENCES profiles(id)`
- `teams`: migration has `owner_email TEXT`, schema.sql has `owner_id UUID REFERENCES profiles(id)`

**Impact:** If `schema.sql` was deployed on top of `001_create_tables.sql`, the `CREATE TABLE IF NOT EXISTS` statements would silently skip because the tables already exist, leaving the old column layout in place. This means foreign key constraints, check constraints, and proper UUID references in `schema.sql` were never actually applied.

**Fix:** Create a definitive migration (`009_reconcile_schema.sql`) that uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` and `ALTER TABLE ... ADD CONSTRAINT` to bring every table into alignment with the intended schema.sql definition. Audit the production database to determine which column set actually exists.

#### 4A.2 Foreign Keys Using TEXT Instead of UUID (P0)

In the 001 migration (and likely in production), many columns that should be UUID foreign keys are plain TEXT storing emails or names:

- `partnerships.assigned_to` is TEXT (not UUID reference)
- `notifications.user_email` instead of `user_id UUID`
- `activities.actor_email` instead of `user_id UUID`
- `teams.owner_email` instead of `owner_id UUID`
- `brands.created_by` is TEXT instead of UUID

**Impact:** No referential integrity, no cascade deletes, impossible to JOIN efficiently, and RLS policies referencing `auth.uid()` on UUID columns will fail against TEXT columns.

**Fix:** Migrate these to UUID columns with proper FK references. For each: add the UUID column, backfill from a profiles lookup, drop the old TEXT column, rename.

#### 4A.3 Missing ON DELETE Cascade/Set Null (P1)

Several FK relationships in `schema.sql` lack cascade behavior:

- `partnerships.brand_id` and `partnerships.talent_id` — no ON DELETE clause
- `outreach_emails.partnership_id` — no ON DELETE clause
- `approval_items.partnership_id` — no ON DELETE clause
- `deal_notes.author_id` — no ON DELETE clause

**Impact:** Deleting a brand or talent will fail with FK violation errors if any partnerships reference them, creating orphaned records or blocking legitimate deletions.

**Fix:** Add `ON DELETE SET NULL` to optional references and `ON DELETE CASCADE` to ownership references.

#### 4A.4 Denormalized Name Columns (P2)

Many tables store both an ID reference and a denormalized name:

- `partnerships`: `brand_id` + `brand_name`, `talent_id` + `talent_name`
- `marketplace_opportunities`: `brand_id` + `brand_name`
- `approval_items`: `brand_name`, `talent_name`

**Impact:** Names go stale when a brand or talent updates their name. This is a data integrity time bomb.

**Fix:** Add a PostgreSQL trigger on `brands` and `talents` that cascades name changes to `partnerships`, `marketplace_opportunities`, etc. Alternatively, use Supabase's `select('*, brand:brands(name)')` JOIN syntax to eliminate denormalized columns.

#### 4A.5 No `updated_at` Trigger on Several Tables (P2)

Tables from `006_create_missing_tables.sql` (escrow_payments, bundle_deals, deal_disputes, deck_library, pitch_competitions, connected_platforms, data_room_entries) have `updated_at` columns but no `update_updated_at` trigger applied.

---

### 4B. Entity Mapping Mismatches

#### 4B.1 Entities in base44Client.js vs Actual Tables

The client maps 57 entities. The Proxy in base44Client.js has a fallback: if an entity name is not in `ENTITY_TABLE_MAP`, it lowercases the name and appends 's'. This produces silent failures:

| Entity                 | Falls Through To               | Actual Table             | Status            |
| ---------------------- | ------------------------------ | ------------------------ | ----------------- |
| `PitchCompetition`     | `pitchcompetitions`            | `pitch_competitions`     | BROKEN            |
| `AIUsageLog`           | `aiusagelogs`                  | `ai_usage_logs`          | BROKEN            |
| `DataRoomAccess`       | `dataroomaccesss` (triple 's') | `data_room_access`       | BROKEN            |
| `NewsletterSubscriber` | `newslettersubscribers`        | `newsletter_subscribers` | BROKEN            |
| `Referral`             | `referrals`                    | `referrals`              | Works by accident |

**Fix:** Add these to `ENTITY_TABLE_MAP`:

```javascript
PitchCompetition: 'pitch_competitions',
AIUsageLog: 'ai_usage_logs',
DataRoomAccess: 'data_room_access',
NewsletterSubscriber: 'newsletter_subscribers',
```

**Priority: P0** — These entities are used in `src/pages/PitchCompetition.jsx`, `src/pages/Referrals.jsx`, `src/pages/AIAnalytics.jsx`.

#### 4B.2 Shared Helper Divergence (P1)

The edge function shared helper at `supabase/functions/_shared/supabase.ts` maintains its own `TABLE_MAP` (46 entries) that is missing entities added later: `DeckLibrary`, `PitchCompetition`, `Referral`, `AIUsageLog`, `DealScore`, `DataRoomEntry`, `DataRoomAccess`, `ConnectedPlatform`, `PlatformCatalog`, `TalentType`, `TalentRevenueStream`, `TalentRevenueMatrix`, `Profile`, `NewsletterSubscriber`.

**Fix:** Synchronize the server-side TABLE_MAP with the client-side ENTITY_TABLE_MAP. Consider extracting the map into a shared JSON file.

---

### 4C. Missing Tables

#### Tables In Migrations But Not In schema.sql (P1)

These tables exist only in `006_create_missing_tables.sql` and `008_create_newsletter_subscribers.sql` but are absent from the authoritative `schema.sql`:

- `platform_catalog`, `connected_platforms`, `data_room_entries`, `data_room_access`, `decision_makers`, `deal_scores`, `escrow_payments`, `bundle_deals`, `deal_disputes`, `deck_library`, `pitch_competitions`, `ai_usage_logs`, `referrals`, `talent_types`, `talent_revenue_streams`, `talent_revenue_matrix`, `newsletter_subscribers`
- `email_connections` (created in migration 005 but not in schema.sql, referenced by multiple edge functions)

**Fix:** Consolidate all table definitions into `schema.sql` as the single source of truth.

---

### 4D. Query Pattern Problems

#### 4D.1 Unbounded SELECT \* on Every List Call (P1)

The `createEntityProxy` always does `.select('*')`. On tables like `partnerships` (30+ columns), `talents` (30+ columns), and `brands` (20+ columns), this transfers far more data than needed. At 10K users with concurrent dashboard loads, this becomes a significant bottleneck.

**Fix:** Add a `.select(columns)` parameter to the entity proxy's `list()` and `filter()` methods. Refactor high-traffic pages (Dashboard, Partnerships, DealAnalytics) to request only the columns they render.

#### 4D.2 N+1 Pattern in BundleDeals (P2)

In `src/pages/BundleDeals.jsx` line 438-439, N individual INSERT statements are issued instead of a single bulk insert:

```javascript
await Promise.all(emails.map((e) => base44.entities.OutreachEmail.create(e)));
```

**Fix:** Add a `bulkCreate` method to `createEntityProxy` in `base44Client.js`.

#### 4D.3 Dashboard Waterfall Loading (P2)

`Dashboard.jsx` fires 7 independent `.list()` queries. Create a single Supabase RPC function `get_dashboard_summary()` that returns all dashboard data in one query. Reduces latency from ~7 _ RTT to ~1 _ RTT.

#### 4D.4 Missing Composite Indexes for Common Filter Patterns (P1)

Several query patterns lack supporting indexes. The `ai_usage_logs` one is especially critical because it runs on every single AI request:

```sql
CREATE INDEX idx_opp_apps_opportunity_status ON opportunity_applications(opportunity_id, status);
CREATE INDEX idx_talents_niche_tier ON talents(niche, tier);
CREATE INDEX idx_partnerships_status_created ON partnerships(status, created_at DESC);
CREATE INDEX idx_escrow_partnership_status ON escrow_payments(partnership_id, status);
CREATE INDEX idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at DESC);
```

#### 4D.5 Hard-Coded Limits (P2 → P0 at scale)

`.list()` defaults to `limit = 100` across the board. No pagination support in the entity proxy.

**Fix:** Add cursor-based pagination (using `.range(from, to)`) to the entity proxy.

---

### 4E. Edge Function Issues

#### 4E.1 AI Router — In-Memory Cache Does Not Scale (P2)

The `responseCache` in `ai-router/index.ts` is a `Map` stored in Deno isolate memory. Supabase edge functions can run across multiple isolates, so each isolate has its own cache. Cache hit rate will be low and inconsistent.

**Fix:** Replace with Redis-backed cache (Upstash Redis) or use a Supabase `pg_cache` table pattern.

#### 4E.2 AI Router — Rate Limit Query on Every Request (P1)

Lines 260-265 execute a `COUNT(*)` query against `ai_usage_logs` on every single AI request. This is an expensive aggregate query that degrades as the table grows.

**Fix:** Use a dedicated `ai_rate_limits` table with `user_id, date, request_count` incremented atomically via `UPDATE ... SET request_count = request_count + 1 WHERE user_id = $1 AND date = $2`.

#### 4E.3 AI Router — Missing `tier` Column on `user_subscriptions` (P0)

Line 246 queries `user_subscriptions` for a `tier` column, but the table in `schema.sql` has `current_plan TEXT` not `tier`. This query **silently fails** and defaults to 'free' tier (line 252: `catch { /* default to free tier */ }`).

**Impact:** All users are treated as free-tier for AI rate limiting regardless of their actual subscription.

**Fix:** Add a `tier` column to `user_subscriptions` or update the query to use `current_plan` and map it to the tier system.

#### 4E.4 manageEscrow — No Real Payment Integration (P1, legal/trust risk)

The escrow function creates/updates database records but has no actual Stripe integration. The `stripe_payment_intent` column is never populated. Money is not actually held or released.

**Impact:** The escrow feature is purely a database state machine with no financial enforcement. Users may believe funds are protected when they are not.

**Fix:** Integrate with Stripe Connect's payment intents for actual fund holds, or clearly label this as "tracking only" in the UI.

#### 4E.5 Massive Edge Function Count (P3)

There are 80+ edge functions deployed. Each is a separate Deno isolate with cold-start overhead (200-500ms). Many appear to be thin wrappers around AI calls.

**Fix:** Consolidate related functions. All `analyze*` functions (15+) could be a single `analyze` function with an `action` parameter.

---

### 4F. Data Model Gaps

#### No Audit Trail for Sensitive Operations (P1)

The `activities` table is used for user-facing activity feeds, not security auditing. There is no record of who changed a partnership status, who released escrow funds, who approved an approval item, or who modified subscription tiers.

#### No Notification Preferences (P2)

The `notifications` table stores notifications but there is no mechanism for users to control what notifications they receive, how (in-app, email, push), or frequency.

#### No File/Attachment Storage Metadata (P3)

Several features reference file URLs (deck_library.file_url, data_room_entries, opportunity attachments) but there is no metadata table tracking file uploads, sizes, types, or storage bucket paths.

#### Partnership History/Changelog Missing (P1)

When a partnership moves through stages, there is no record of when each transition happened or who triggered it. Only the current status is stored.

#### Contract/Agreement Storage Missing (P2)

Partnerships can reach "contracted" status but there is no table to store contract terms, signed documents, or legal metadata.

---

### 4G. Scalability Analysis

**At 1K Users (Current/Near-Term):**

- The `allTablesPopulated()` check runs 5 queries on every session start for every user
- SELECT \* on all tables adds unnecessary bandwidth
- Dashboard loads 7 parallel queries

**At 10K Users:**

- `ai_usage_logs` table grows to millions of rows. Daily COUNT(\*) for rate limiting becomes slow even with composite index.
- `activities` table becomes massive with no partition strategy.
- `notifications` table accumulates indefinitely with no cleanup mechanism.
- Hard limit of 100-500 rows per query means users with large datasets cannot access their full data.
- RLS policies with subqueries become costly as rows grow.

**At 100K Users:**

- The approach of pulling data to the client and computing aggregates in JavaScript (DealAnalytics.jsx pulling 1000 partnerships) collapses.
- Realtime subscriptions on entire tables with no row-level filtering — Supabase broadcasts all changes to all subscribers.
- Service role client in edge functions bypasses RLS, meaning a bug in any edge function could leak data across users.
- Single-region Supabase deployment becomes a latency bottleneck for global users.

---

### 4H. Recommended New Tables & Schema Changes

#### `audit_logs` (P1)

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
```

#### `partnership_stage_history` (P1)

```sql
CREATE TABLE partnership_stage_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id uuid REFERENCES partnerships(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  notes text,
  duration_in_stage interval,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_stage_history_partnership ON partnership_stage_history(partnership_id, created_at);
```

#### `notification_preferences` (P2)

```sql
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  in_app_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  email_digest_frequency text DEFAULT 'daily' CHECK (email_digest_frequency IN ('realtime','daily','weekly','none')),
  notify_deal_updates boolean DEFAULT true,
  notify_approvals boolean DEFAULT true,
  notify_outreach boolean DEFAULT true,
  notify_marketplace boolean DEFAULT true,
  notify_team boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text DEFAULT 'UTC',
  updated_at timestamptz DEFAULT now()
);
```

#### `analytics_daily_snapshots` (P2)

```sql
CREATE TABLE analytics_daily_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_partnerships integer DEFAULT 0,
  active_pipeline_value numeric DEFAULT 0,
  closed_revenue numeric DEFAULT 0,
  new_deals_count integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_replied integer DEFAULT 0,
  ai_requests_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);
CREATE INDEX idx_snapshots_user_date ON analytics_daily_snapshots(user_id, snapshot_date DESC);
```

Populate via a nightly cron edge function. This eliminates expensive real-time aggregation queries on the dashboard.

#### `ai_rate_limits` (P1)

```sql
CREATE TABLE ai_rate_limits (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  request_count integer DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
```

Replace the COUNT(\*) query in the AI router with atomic `INSERT ... ON CONFLICT DO UPDATE SET request_count = request_count + 1 RETURNING request_count`.

#### `contracts` (P2)

```sql
CREATE TABLE contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id uuid REFERENCES partnerships(id) ON DELETE CASCADE,
  title text NOT NULL,
  contract_type text,
  terms jsonb DEFAULT '{}',
  total_value numeric DEFAULT 0,
  payment_schedule jsonb DEFAULT '[]',
  file_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','negotiating','signed','expired','terminated')),
  signed_by_brand_at timestamptz,
  signed_by_talent_at timestamptz,
  effective_date date,
  expiry_date date,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

### 4I. Database Priority Summary

| Priority | Issue                                                                                     | Category          |
| -------- | ----------------------------------------------------------------------------------------- | ----------------- |
| **P0**   | Dual schema divergence — production columns likely don't match schema.sql                 | Schema            |
| **P0**   | Missing `tier` column on user_subscriptions breaks AI rate limiting for all users         | Edge Function     |
| **P0**   | Entity fallthrough bug — PitchCompetition, AIUsageLog, DataRoomAccess map to wrong tables | Entity Mapping    |
| **P0**   | TEXT columns where UUID FKs should exist                                                  | Schema            |
| **P1**   | AI router COUNT(\*) rate limit query on every request                                     | Performance       |
| **P1**   | Missing composite indexes for high-frequency queries                                      | Performance       |
| **P1**   | RLS policies reference columns that may not exist in production schema                    | Security          |
| **P1**   | Escrow function has no real payment integration                                           | Correctness/Legal |
| **P1**   | No audit log for sensitive operations                                                     | Data Model        |
| **P1**   | No partnership stage history tracking                                                     | Data Model        |
| **P1**   | Server-side TABLE_MAP missing 14+ entities                                                | Entity Mapping    |
| **P1**   | email_connections and 17 other tables missing from schema.sql                             | Schema            |
| **P1**   | SELECT \* on all entity queries wastes bandwidth                                          | Performance       |
| **P2**   | No pagination support in entity proxy                                                     | Scalability       |
| **P2**   | In-memory cache in AI router doesn't share across isolates                                | Performance       |
| **P2**   | Missing updated_at triggers on 006 tables                                                 | Schema            |
| **P2**   | Denormalized name columns have no sync mechanism                                          | Data Integrity    |
| **P2**   | BundleDeals N+1 individual INSERTs                                                        | Performance       |
| **P2**   | Dashboard waterfall: 7 queries instead of 1 RPC                                           | Performance       |
| **P3**   | 80+ edge functions with cold-start overhead                                               | Architecture      |
| **P3**   | Realtime subscriptions on entire tables without row filters                               | Scalability       |
| **P3**   | No notification preferences                                                               | Data Model        |

---

## Part 5: Business Strategy & Monetization

_Source: Business Strategy & Monetization report_

### 5A. Pricing Strategy

#### Current Pricing Architecture

| Role    | Tier 1              | Tier 2           | Tier 3                  | Tier 4                  |
| ------- | ------------------- | ---------------- | ----------------------- | ----------------------- |
| Talent  | Free ($0)           | Rising ($99/mo)  | Pro ($249/mo)           | Elite ($499/mo)         |
| Brand   | Explorer ($0)       | Growth ($499/mo) | Scale ($1,299/mo)       | Enterprise ($2,500+/mo) |
| Agency  | Starter ($2,499/mo) | Pro ($4,999/mo)  | Enterprise ($9,999+/mo) | —                       |
| Manager | Single ($149/mo)    | Multi ($349/mo)  | Enterprise ($799+/mo)   | —                       |

**Key observations:**

- The trial gives users Tier 2 access for 7 days — right instinct but may be too short for a platform where value is relationship-and-deal-driven rather than immediately transactional.
- Agencies have no free tier at all, eliminating the self-serve motion for mid-market agencies.
- The Manager role maps internally to the Talent tier page structure but is priced independently — creating a pricing arbitrage risk where solo managers choose the $149 Manager plan over the $249 Talent Pro plan for essentially the same feature set.
- Annual billing toggle exists ("Annual (Save ~20%)") but the discount is not displayed as a hard number anywhere — it says "~20%" which lacks commitment and conversion power.

**Competitive benchmarking:**

- Grin (enterprise-only, ~$25K-$50K/year ACV) — DealStage's Enterprise/Scale tiers are dramatically cheaper
- CreatorIQ (enterprise, $36K+/year) — same
- Aspire (mid-market, ~$2K-$5K/month) — DealStage's Brand Scale at $1,299/mo is competitive
- Phyllo (API-first data layer, $0.20-$1.00 per API call) — different model

**Verdict:** Brand and Agency tiers are appropriately priced or slightly under-priced for the value delivered. Talent tiers are under-priced. Manager tiers at $149/$349 are likely too cheap given the full deal pipeline access they receive.

#### Pricing Recommendations

**[Rec 1.1 — High] Extend trial to 14 days, gate Tier 3 (not Tier 2) during trial**
Currently the trial unlocks Tier 2. Extending to 14 days and letting users experience Tier 3 features for 3 of those days creates a higher ceiling for upgrade motivation. The pitch becomes "You had access to Elite/Enterprise — now keep it."

- Revenue Impact: Medium | Complexity: Low | Implementation: Change one constant in useFeatureGate.js

**[Rec 1.2 — Critical] Introduce annual pricing with a hard, specific dollar discount displayed on the pricing page**
Change "Save ~20%" to "Save $599/year" (on Pro) or the calculated equivalent. A psychologically specific number outperforms a percentage. The annual toggle already exists in SubscriptionManagement.jsx — it just needs to propagate to the landing page pricing cards.

- Revenue Impact: High (annual contracts reduce churn by 60-80% industry average) | Complexity: Low

**[Rec 1.3 — Medium] Increase Talent Rising to $129/mo and reposition the value**
The $99 price point feels low-confidence. At $129, with the addition of one high-value feature currently behind Pro (e.g., unlimited social account connections or basic Contact Finder), the tier becomes more defensible.

- Revenue Impact: Medium (5-15% revenue lift on Talent ARR) | Complexity: Low

**[Rec 1.4 — High] Restructure Manager pricing to reflect agency-lite positioning**
The Manager Single plan at $149/mo is 40% cheaper than Talent Pro ($249) yet grants essentially the same page access. Either raise Manager Single to $199 or reduce the feature set at that tier. The $349 Multi plan managing 5 talent is particularly underpriced — agencies pay $2,499/mo for 10 talent. A manager handling 5 talent professionally should be priced at $599-$799/mo.

- Revenue Impact: Medium-High | Complexity: Low

**[Rec 1.5 — High] Create an Agency Freemium or "Agency Explorer" at $499/mo**
The hard wall at $2,499/mo for agencies eliminates the top-of-funnel. A $499/mo Agency Explorer (1-2 talent profiles, core features) creates a land-and-expand motion.

- Revenue Impact: Medium (unlocks self-serve agency acquisition) | Complexity: Low

---

### 5B. Revenue Streams

**Current Revenue Streams:**

1. Subscription fees across four roles (Stripe-based, monthly/annual)
2. Annual billing discount (implied 20%)
3. Referrals page (suggesting a referral/affiliate program)

**Missing Revenue Streams visible in the product but not monetized:**

- The landing page mentions "Payments flow through Stripe. Talent receives funds securely" and "Commission splits for agency rosters" — this implies Stripe Connect is architecturally in place for deal payment processing, but DealStage takes no platform fee on transactions.
- The Warm Intro Network, Contact Finder, and AI Pitch Deck Builder are high-value AI-consumption features that could support usage-based pricing.
- The Market Intelligence and Spend Prediction features contain proprietary data that could be sold separately.

#### Revenue Stream Recommendations

**[Rec 2.1 — Critical] Introduce a 1.5-2.5% platform transaction fee via Stripe Connect**
The deal pipeline already tracks revenue. When a brand pays talent through the platform, DealStage should take 1.5% from the brand side and 1% from the talent side (a split model). For a platform facilitating $50M in deal value annually, this generates $1.25M in transaction revenue alone — pure margin on top of subscriptions.

- Revenue Impact: High (could represent 20-40% of total revenue at scale) | Complexity: Medium

**[Rec 2.2 — Medium] Credit-based AI usage add-on for heavy users**
The AI Command Center (32 agents) is positioned as unlimited in Pro+ tiers. As AI inference costs are real, introducing an "AI Credits" system for users who exceed a monthly baseline gives a natural upsell. Price at $49/mo for 500 additional agent runs.

- Revenue Impact: Medium | Complexity: Medium

**[Rec 2.3 — Medium] Monetize the Pitch Deck Builder as a standalone product**
The auto-pitch deck generation could be sold as a $99/deck one-time purchase to non-subscribers who find the product through SEO or referral. A freemium-to-paid funnel for this single feature could acquire new users without requiring full platform commitment.

- Revenue Impact: Medium | Complexity: Medium

**[Rec 2.4 — Medium] Sell Market Intelligence reports as data products**
The Market Intelligence page, Brand Spend Prediction, and Deal Score Leaderboard represent proprietary data assets. Package as downloadable reports for specific industry verticals (e.g., "Q1 2026 Sports Sponsorship Rate Benchmarks") at $299-$999 per report.

- Revenue Impact: Medium (initially), High (at scale) | Complexity: Medium

---

### 5C. Market Positioning

#### Competitive Gap Analysis

| Feature              | DealStage         | Grin            | CreatorIQ       | Aspire | Phyllo |
| -------------------- | ----------------- | --------------- | --------------- | ------ | ------ |
| AI Match Engine      | Yes (10-factor)   | Basic           | Advanced        | Basic  | No     |
| Deal Pipeline        | Yes               | Yes             | Yes             | Yes    | No     |
| Contract/E-sign      | Yes               | Via integration | No              | Yes    | No     |
| AI Pitch Decks       | Yes               | No              | No              | No     | No     |
| ROI Simulation       | Yes (Monte Carlo) | No              | Limited         | No     | No     |
| Warm Intro Graph     | Yes (Neo4j)       | No              | No              | No     | No     |
| Multi-role (4 roles) | Yes               | No (brand-only) | No (brand-only) | No     | No     |
| Payments built-in    | Yes (Stripe)      | No              | No              | Yes    | No     |
| Manager role         | Yes               | No              | No              | No     | No     |

**DealStage's genuine differentiators** are the multi-role architecture, AI Pitch Deck generation, Monte Carlo ROI simulation, and the Warm Intro Network. However, the landing page buries them behind generic "AI-powered partnership intelligence" messaging.

#### Positioning Recommendations

**[Rec 3.1 — High] Lead with specific, quantifiable differentiators**
Replace the generic AI headline with specific proof: "The only platform where a creator can auto-generate a 12-section pitch deck, simulate campaign ROI with 10,000 scenarios, and get introduced to the right brand contact — all before sending one email." This is specific, verifiable, and impossible for competitors to claim simultaneously.

**[Rec 3.2 — Medium] Create explicit "vs. Grin", "vs. Aspire" comparison pages**
These pages rank in Google with high commercial intent. DealStage's multi-role architecture and built-in payments are objectively superior for certain use cases.

**[Rec 3.3 — High] Position the Manager role as a market-specific wedge**
No competitor has a dedicated Manager role product. Personal managers for athletes, musicians, and creators are underserved. Build a dedicated landing page for "talent managers and sports agents" that positions DealStage specifically for this persona.

---

### 5D. Growth Opportunities

**[Rec 4.1 — Medium] Launch a white-label reseller program**
At Agency Enterprise ($9,999+/mo), the white-label option is a cost item, not a revenue multiplier. Reframe as a reseller program: agencies pay a white-label fee ($1,500-$3,000/mo on top of their plan) and can resell seats to their talent roster at their own pricing. The agency becomes a distribution channel. Each large sports or entertainment agency could bring 50-200 talent profiles to the platform at once.

- Revenue Impact: High | Complexity: Medium-High

**[Rec 4.2 — Low] Build an API tier as a standalone product**
The API access mentioned at Agency Enterprise and Brand Enterprise could be productized separately. Sports data companies, AdTech platforms, and marketing attribution tools would pay $500-$2,000/month for API access to DealStage's talent data, deal rates, and engagement benchmarks.

- Revenue Impact: High (long-term) | Complexity: High | Timeline: 12-18 months

**[Rec 4.3 — Medium] Monetize Pitch Competition as a marketplace feature**
Charge brands a "featured competition" fee of $499-$2,499 to post a high-visibility competition brief. This generates revenue and creates engagement content (competition results, winner announcements) that drives organic awareness.

- Revenue Impact: Medium | Complexity: Low-Medium

**[Rec 4.4 — Medium] Launch a "Verified Talent" certification program**
Charge talent $99-$299/year for a verified profile badge that gets priority placement in brand searches. The FAQ already states "We pull live data directly from connected platforms" — position this as an enhanced verification tier.

- Revenue Impact: Medium | Complexity: Low

---

### 5E. User Acquisition

**Issues Identified:**

- The stats displayed on the landing page ("Growing Talent Network", "AI-Powered Match Scoring", "50+ AI Agents", "32 Industries") are vague. "Growing" is not a number. Prospects will read this as a signal that the network is not yet large.
- The onboarding collects significant profile data before revealing pricing — users invest time, reach the pricing gate, and churn rather than convert.
- There is no visible free-trial-to-paid email nurture sequence — the trial expiry logic in useFeatureGate.js simply blocks access, it does not trigger a re-engagement campaign.

**[Rec 5.1 — Critical] Replace vague stats with specific, credible ones**
Find the most impressive true metric and lead with that number rather than placeholder language like "Growing." Examples: "12,000+ deal inquiries facilitated", "$180M+ in deals tracked", "10-factor AI matching."

- Revenue Impact: Medium (conversion rate improvement) | Complexity: Low

**[Rec 5.2 — High] Show pricing earlier in the onboarding flow**
Move a simplified pricing preview ("Plans start at $99/mo for talent, $499/mo for brands — start free") to the role selection screen before users invest time in profile setup.

- Revenue Impact: Medium | Complexity: Low-Medium

**[Rec 5.3 — Critical] Build a trial expiry re-engagement email sequence**
The current trial expiry shows `isTrialExpired: true` and blocks access with no re-engagement. Implement a 3-email sequence: Day 5 ("2 days left — here's what you'll lose"), Day 7 (trial end with a 20% first-month discount code), Day 10 ("Come back — your pipeline is waiting"). Industry average: 15-25% of expired trials convert with a discount offer.

- Revenue Impact: High | Complexity: Medium

**[Rec 5.4 — Critical] Add a "request a demo" path for Agency and Brand Enterprise prospects**
The current "Contact Sales" CTA for Enterprise tiers links to nothing visible in the code. Enterprise prospects ($2,500+/mo) expect a demo-first motion. A Calendly integration or demo request form with a 24-hour SLA is essential infrastructure.

- Revenue Impact: High | Complexity: Low

---

### 5F. Retention and Engagement

**Positive Retention Mechanics Already Present:**

- Master Calendar and Culture Calendar (recurring reasons to log in)
- Deal Pipeline with Kanban stages (ongoing workflow dependency)
- Real-time notifications
- AI Agents Hub with autonomous activity
- Approvals workflow (enforced daily engagement for agencies)

**Churn Risks:**

- The platform is broad (40+ features) but breadth without depth in any single area creates low stickiness.
- The 7-day trial is too short for deal pipeline tools where value is proven over weeks.
- The BillingHistory and SubscriptionManagement pages are the only touches post-purchase — no product roadmap, changelog, or in-app "what's new" mechanic.

**[Rec 6.1 — High] Build a weekly "Partnership Intelligence" digest email**
Every Monday, send each user a personalized digest: "3 new brands matching your profile this week", "Your deal pipeline moved X days closer to close", "Market rate for your category this week: $X." This keeps DealStage top-of-mind even when users are not actively logging in.

- Revenue Impact: Medium (reduces churn by 10-20%) | Complexity: Medium

**[Rec 6.2 — Medium] Add a "Deal Velocity Score" to the dashboard**
A single, visible metric showing how fast a user's pipeline is moving compared to platform averages creates a gamification anchor. This is the same mechanic that makes Duolingo streaks sticky.

- Revenue Impact: Medium | Complexity: Medium

**[Rec 6.3 — Critical] Implement milestone-based upgrade nudges triggered by usage**
When a Talent Rising user sends their 14th outreach message (out of 15), show an in-app notification: "You have 1 outreach message left this month. Upgrade to Pro for unlimited outreach." Contextual nudges at the point of constraint are 4-6x more effective than generic upgrade modals. The UpgradeModal component exists in Layout.jsx but is only triggered when a user clicks a locked nav item — not when they are approaching usage limits.

- Revenue Impact: High | Complexity: Medium

**[Rec 6.4 — Medium] Add an in-app changelog ("What's New") panel**
A simple notification badge on a "What's New" sidebar item showing recent feature releases reduces churn and drives feature adoption. Signals product momentum to retained users.

- Revenue Impact: Low-Medium | Complexity: Low

---

### 5G. Expansion Revenue

**[Rec 7.1 — High] Unbundle seat pricing at Scale/Pro tiers**
Brand Scale at $1,299/mo includes "10 seats." Rather than bundling, price additional seats at $49/user/month beyond the base allocation. A brand team that grows from 10 to 20 users pays an additional $490/mo without a plan change. This is pure expansion revenue requiring zero new features.

- Revenue Impact: High | Complexity: Low-Medium

**[Rec 7.2 — Medium] Create a "Manager + Talent" bundle with cross-sell pricing**
When a talent signs up and selects a paid plan, offer a "Bring your manager" add-on at $79/mo (discounted from Manager Single $149/mo) that creates a second paying seat immediately. This cross-role bundling leverages the natural relationship between talent and their manager.

- Revenue Impact: Medium | Complexity: Medium

**[Rec 7.3 — Low] Add a per-deal "Deal Close Acceleration" add-on**
For users on any paid plan, offer a $99 one-time "Deal Close" feature that activates AI-driven deal negotiation assistance for a specific partnership — AI-generated counter-offer suggestions, risk scoring, and comparable deal benchmarks.

- Revenue Impact: Medium | Complexity: High | Timeline: 12 months

---

### 5H. Platform Network Effects

**Current state of network effects:**

- Talent profiles are discoverable to brands through search (passive)
- Match Engine connects both sides algorithmically (passive)
- Warm Intro Network creates cross-user value (passive)
- Pitch Competition feature creates competitive dynamics (active)
- **No explicit virality loop**, no mechanism for talent to invite brands, no shareable public profile URL, no referral mechanic specifically driving cross-role acquisition.

**[Rec 8.1 — Critical] Build a public talent profile shareable link**
Every talent profile should have a public URL that talent can share on Instagram bios, LinkedIn, and email signatures (e.g., thedealstage.com/c/[handle]). When a brand clicks that link and creates an account to send a deal request, the talent gets referral credit. This is the exact motion used by Linktree to grow to 40M users.

- Revenue Impact: High (top-of-funnel acquisition at near-zero CAC) | Complexity: Medium

**[Rec 8.2 — High] Add a "Refer a Brand" mechanic for Talent and a "Refer a Creator" mechanic for Brands**
The Referrals page exists. Strengthen it with cross-role incentives: Talent earns $50 credit when a brand they referred signs up for a paid plan. Brands earn one free month when a creator they invited signs up for Rising or above. Cross-role referrals are far more powerful than same-role ones because they directly add supply or demand to the marketplace.

- Revenue Impact: High | Complexity: Medium

**[Rec 8.3 — Medium] Create a "Featured on DealStage" badge program**
When a partnership is closed through the platform, both the brand and the talent receive a "Powered by DealStage" badge to use in press releases, social announcements, and media kits. Every public deal announcement is organic marketing. This is the Stripe "Powered by Stripe" playbook adapted for the partnership economy.

- Revenue Impact: Medium (brand awareness and top-of-funnel) | Complexity: Low

**[Rec 8.4 — Medium] Launch a "Deal of the Week" public feature spotlighting successful partnerships**
A curated, anonymized (or with permission, named) weekly spotlight of successful partnerships closed on the platform builds social proof, drives SEO content, and creates FOMO for talent and brands not yet on the platform.

- Revenue Impact: Medium | Complexity: Low

---

### 5I. Revenue Impact Projections

**Current model (subscriptions only), blended estimate at 1,000 paying accounts:**

- 400 Talent accounts (mix of Rising/Pro): ~$120K MRR
- 300 Brand accounts (mix of Growth/Scale): ~$250K MRR
- 100 Agency accounts (mix of Starter/Pro): ~$350K MRR
- 200 Manager accounts: ~$55K MRR
- **Total: ~$775K MRR = ~$9.3M ARR**

**With recommended changes:**

- 20% annual conversion improvement from hard-number annual pricing = +$1.86M ARR (via reduced monthly churn)
- 2% platform transaction fee on $50M deal volume = +$1.0M ARR
- Seat expansion revenue (avg 2 additional seats per Brand Scale customer): +$600K ARR
- Extended trial + email nurture lifting trial conversion by 20%: +$1.86M ARR
- Agency Explorer tier unlocking 200 new self-serve agencies: +$1.2M ARR
- **Estimated incremental ARR from top 10 recommendations: +$6.5M (conservative)**

---

### 5J. Business Priority Matrix — Top 10 Moves to Maximize ARR

| Priority | Recommendation                                                  | Revenue Impact | Complexity | Time to Implement |
| -------- | --------------------------------------------------------------- | -------------- | ---------- | ----------------- |
| 1        | Trial expiry re-engagement email sequence (Rec 5.3)             | High           | Medium     | 2-3 weeks         |
| 2        | Annual pricing with hard dollar savings displayed (Rec 1.2)     | High           | Low        | 1 week            |
| 3        | Platform transaction fee via Stripe Connect (Rec 2.1)           | High           | Medium     | 4-6 weeks         |
| 4        | Public talent profile shareable URL (Rec 8.1)                   | High           | Medium     | 3-4 weeks         |
| 5        | Milestone-triggered upgrade nudges at usage limits (Rec 6.3)    | High           | Medium     | 2-3 weeks         |
| 6        | Demo/sales request flow for Enterprise tiers (Rec 5.4)          | High           | Low        | 1 week            |
| 7        | Agency Explorer tier at $499/mo to unlock self-serve (Rec 1.5)  | Medium-High    | Low        | 1-2 weeks         |
| 8        | Seat expansion pricing at Scale/Pro tiers (Rec 7.1)             | High           | Medium     | 3-4 weeks         |
| 9        | Increase Manager pricing to reflect agency-lite value (Rec 1.4) | Medium-High    | Low        | 1 week            |
| 10       | Cross-role referral program with incentives (Rec 8.2)           | High           | Medium     | 3-4 weeks         |

---

## Part 6: Performance & DevOps

_Source: Performance & DevOps report_

### 6A. Bundle Size

**Current State — Heavyweight Dependencies Shipping to All Users:**

| Dependency                              | Estimated Size (gzipped) | Usage Pattern                                                             |
| --------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| `recharts`                              | ~45 KB                   | Used in 8 component files                                                 |
| `@sentry/react` (with replay)           | ~70 KB                   | Loaded in `main.jsx` on every page                                        |
| `@stripe/stripe-js` + `react-stripe-js` | ~40 KB                   | Used in only 2 files (Onboarding, SubscriptionManagement)                 |
| `mammoth`                               | ~30 KB                   | Static import in 3 files (ContractScanner, BriefParser, DataRoomImporter) |
| `xlsx`                                  | ~90 KB                   | Listed in deps but **zero static imports found** — likely unused          |
| `html2canvas`                           | ~40 KB                   | Properly dynamic-imported (good)                                          |
| `jspdf`                                 | ~50 KB                   | Properly dynamic-imported (good)                                          |
| `lucide-react`                          | Tree-shakeable           | Imported across 104 files (fine)                                          |

**No Vite `build.rollupOptions.output.manualChunks` configuration exists.** Without manual chunk splitting, the vendor bundle likely contains Sentry, Stripe, recharts, and mammoth all in a single chunk loaded on first navigation.

**Estimated initial vendor JS: 350-500 KB gzipped** before code splitting.

**Fixes:**

**[CRITICAL] Remove `xlsx` from `package.json`:** No file imports from `"xlsx"` anywhere in `src/`. Dead weight that bloats `node_modules` and may get bundled.

**[HIGH] Add manual chunk splitting to `vite.config.js`:**

```js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-sentry": ["@sentry/react"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "vendor-charts": ["recharts"],
          "vendor-stripe": ["@stripe/stripe-js", "@stripe/react-stripe-js"],
        },
      },
    },
  },
});
```

**[HIGH] Dynamic-import `mammoth` instead of static import in all 3 files:**
In `ContractScanner.jsx`, `BriefParser.jsx`, and `DataRoomImporter.jsx`, change from:

```js
import mammoth from "mammoth";
```

to:

```js
const mammoth = await import("mammoth"); // Inside the handler function that needs it
```

---

### 6B. Code Splitting

**Current State:** Code splitting is implemented well at the page level — `pages.config.js` uses `React.lazy()` for all 77 page routes. However:

- `Login`, `Onboarding`, `Pricing`, `CreatorCalculator`, `Terms`, `Privacy` are **statically imported** in `App.jsx` (lines 13-17). These are bundled into the main chunk.
- `Layout.jsx` (272 lines with heavy nav config) is statically imported, which is correct for authenticated routes but means it ships in the main bundle even for public pages.
- `Dashboard.jsx` statically imports `seedDemoData` from `@/utils/seedDemoData` — a seed utility that should only be used once per account.

**Performance Impact:** Static imports in `App.jsx` mean the initial bundle includes Login + Onboarding + Pricing + Terms + Privacy + CreatorCalculator even if the user is already authenticated. This adds an estimated 30-60 KB to the initial parse.

**Fixes:**

**[MEDIUM] Lazy-load the statically imported pages in `App.jsx`:**

```js
const Login = React.lazy(() => import("@/pages/Login"));
const Onboarding = React.lazy(() => import("@/pages/Onboarding"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const CreatorCalculator = React.lazy(() => import("@/pages/CreatorCalculator"));
const Pricing = React.lazy(() => import("@/pages/Pricing"));
```

**[LOW] Remove static `seedDemoData` import from Dashboard.jsx:**

```js
const seedDemoData = () =>
  import("@/utils/seedDemoData").then((m) => m.seedDemoData);
```

---

### 6C. Core Web Vitals

#### LCP (Largest Contentful Paint)

**Current risks:**

- Google Fonts blocks rendering. Line 16 of `index.html` loads 4 font families in a single render-blocking `<link rel="stylesheet">`. The browser cannot paint until all 4 families (Cormorant Garamond, Instrument Sans, Instrument Mono, Plus Jakarta Sans) are discovered and CSS is downloaded. **Estimated LCP penalty: 500-1200ms on 3G/slow 4G from font loading alone.**
- The GA4 script tag uses `async` but is placed in `<head>` with a `G-PLACEHOLDER` measurement ID that fetches the GTM script (~30 KB) even though no real ID exists.
- Auth initialization makes a network request to Supabase (`getSession`) before any UI renders, with a 5-second timeout. Worst case: a 5-second blank screen.

**[CRITICAL] Remove the GA4 placeholder script entirely:**
Lines 69-76 of `index.html` fetch `https://www.googletagmanager.com/gtag/js?id=G-PLACEHOLDER` on every page load. The guard on line 75 prevents `gtag('config', ...)` but the script itself is still downloaded and parsed (~30 KB). Replace with a conditional loader:

```html
<script>
  var gaMeasurementId = "G-PLACEHOLDER";
  if (gaMeasurementId !== "G-PLACEHOLDER") {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + gaMeasurementId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", gaMeasurementId);
  }
</script>
```

#### FID / INP (Interaction to Next Paint)

Sentry Replay integration (`replaysSessionSampleRate: 0.05`) adds a DOM mutation observer on 5% of sessions. This is generally fine but can cause input delay on pages with heavy DOM changes (like the 77-item navigation sidebar). Impact is low given the conservative sample rate.

#### CLS (Cumulative Layout Shift)

**What works:**

- `OptimizedImage` component properly requires `width` and `height` props — excellent CLS prevention.
- Sidebar logo images have explicit `width` and `height` attributes.

**Issue:** The `<Suspense fallback={<div />}>` pattern on marketing routes uses an empty `<div>` as fallback. When the lazy chunk loads, the content will pop in causing a layout shift. The authenticated routes correctly use `<SkeletonDashboard />` as fallback.

**[MEDIUM] Use proper skeleton fallbacks for public/marketing routes:**

```jsx
const minimalFallback = (
  <div className="min-h-screen animate-pulse bg-slate-50" />
);
```

---

### 6D. Caching Strategy

**Service Worker (PWA):**

- `registerType: 'autoUpdate'` — service worker updates automatically (good).
- `maximumFileSizeToCacheInBytes: 5MB` — generous limit.
- `globPatterns: ['**/*.{js,css,html,ico,png,svg}']` — precaches all static assets (good).
- Runtime caching for Supabase REST API: `NetworkFirst` strategy with 5-minute expiration, 50-entry limit (good).

**Static Assets:** Vercel headers set `Cache-Control: public, max-age=31536000, immutable` on `/assets/*` — perfect for hashed Vite output.

**React Query:** `staleTime: 2 minutes`, `refetchOnWindowFocus: false`, `retry: 1` — reasonable defaults.

**Issues:**

1. No runtime caching for Google Fonts CSS or font files. After service worker installs, subsequent navigations still hit the network for fonts.
2. No Supabase Auth caching. Every reload calls `getSession()` over the network.
3. No prefetching of likely-next-page data.

**[HIGH] Add Google Fonts runtime caching to the workbox config:**

```js
// In vite.config.js, add to runtimeCaching array:
{
  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'google-fonts-stylesheets',
    expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
  },
},
{
  urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts-webfonts',
    expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
    cacheableResponse: { statuses: [0, 200] },
  },
},
```

**[MEDIUM] Add route-level data prefetching on hover:**

```js
// In Layout.jsx link:
onMouseEnter={() => {
  queryClientInstance.prefetchQuery({
    queryKey: [item.page.toLowerCase()],
    queryFn: fetchFnForPage,
    staleTime: 60_000,
  });
}}
```

---

### 6E. Font Loading

**Current State:** Four Google Font families loaded in `index.html`:

1. Cormorant Garamond (italic + 4 weights = multiple files)
2. Instrument Sans (4 weights)
3. Instrument Mono (3 weights)
4. Plus Jakarta Sans (4 weights)

The `display=swap` parameter is included, which prevents FOIT (invisible text) but allows FOUT (flash of unstyled text). Preconnect hints for `fonts.googleapis.com` and `fonts.gstatic.com` are present — good.

**Issues:**

- 4 font families is excessive for initial load. Each family requires a separate font file download. On cold cache, this means 8-15 HTTP requests for font files.
- Cormorant Garamond loads italic variant — is this used above-the-fold on the dashboard?
- Instrument Mono loads 3 weights — monospace fonts are typically only needed in code/data views.

**[HIGH] Reduce initial font load to 2 families — split fonts into critical and deferred:**

```html
<!-- Critical fonts — load in head -->
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
/>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
/>

<!-- Deferred fonts — load after first paint -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
  media="print"
  onload="this.media='all'"
/>
```

This loads only Instrument Sans synchronously (the primary UI font based on Layout.jsx usage) and defers the other 3 families until after paint.

---

### 6F. API Performance

**Current State:**

- **374 `useQuery`/`useMutation` calls** across 84 files — a very query-heavy application.
- `staleTime: 2 minutes` prevents redundant refetches during navigation — good.
- **Zero `prefetchQuery` calls anywhere.** Every page transition starts fetching data after the component mounts.

**`useAutoSeed` on every authenticated session mount:** The `allTablesPopulated()` function makes **5 sequential Supabase queries** (brands, talents, partnerships, activities, marketplace_opportunities) on every new session to check if seeding is needed.

**Layout.jsx `useEffect`:** The Layout component makes 2 API calls on every mount:

- `base44.auth.me()` (line 298)
- `base44.entities.ApprovalItem.filter({ status: "pending" })` (line 299-300)

These are raw API calls, not React Query — they are not cached and will re-fire on every route change that remounts Layout.

**[CRITICAL] Batch the `allTablesPopulated` check into parallel calls:**

```js
async function allTablesPopulated() {
  const tables = [
    "brands",
    "talents",
    "partnerships",
    "activities",
    "marketplace_opportunities",
  ];
  const results = await Promise.all(
    tables.map((table) => supabase.from(table).select("id").limit(1)),
  );
  return results.every(({ data, error }) => !error && data?.length > 0);
}
```

Or even better, create a single Supabase RPC function `check_tables_populated` that returns the result in one round-trip.

**[HIGH] Convert Layout API calls to React Query:**

```js
const { data: user } = useQuery({
  queryKey: ["current-user"],
  queryFn: () => base44.auth.me(),
  staleTime: 5 * 60 * 1000,
});

const { data: pendingApprovals } = useQuery({
  queryKey: ["approvals-pending-count"],
  queryFn: () => base44.entities.ApprovalItem.filter({ status: "pending" }),
  staleTime: 60_000,
  select: (items) => items.length,
});
```

---

### 6G. Real-Time Subscriptions

**Current State:** `useRealtimeSync.js` creates **4 separate Supabase Realtime channels** (one per table: partnerships, notifications, approval_items, activities). Each listens for `postgres_changes` with `event: '*'` on the entire table. Subscription is mounted once in `AuthenticatedRoutes` and torn down on logout.

**Issues:**

1. **4 separate channels is wasteful.** Supabase Realtime supports multiplexing — all 4 table subscriptions could share a single channel.
2. **No error recovery.** When a channel hits `CHANNEL_ERROR` or `TIMED_OUT`, the handlers are empty. The subscription silently dies with no reconnection attempt.
3. **Invalidation is too broad.** Any change to `partnerships` invalidates 4 query keys at once. If a single partnership is updated, every partnerships-related query refetches.
4. **No debouncing.** Rapid changes (bulk import) trigger dozens of cache invalidations in quick succession.

**[HIGH] Consolidate into a single channel with debouncing and error recovery:**

```js
export function useRealtimeSync() {
  const debounceTimers = useRef({});

  function debouncedInvalidate(tableName) {
    if (debounceTimers.current[tableName])
      clearTimeout(debounceTimers.current[tableName]);
    debounceTimers.current[tableName] = setTimeout(
      () => invalidateTable(tableName),
      500,
    );
  }

  useEffect(() => {
    const channel = supabase
      .channel("realtime_sync_all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partnerships" },
        () => debouncedInvalidate("partnerships"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => debouncedInvalidate("notifications"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "approval_items" },
        () => debouncedInvalidate("approval_items"),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        () => debouncedInvalidate("activities"),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setTimeout(() => channel.subscribe(), 5000); // Retry after backoff
        }
      });

    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, []);
}
```

---

### 6H. Error Handling

**What Works Well:**

- **Sentry:** Properly initialized with `tracesSampleRate: 0.1`, `replaysSessionSampleRate: 0.05`, `replaysOnErrorSampleRate: 1.0` (100% replay on error — excellent). Only initializes when `VITE_SENTRY_DSN` env var is set.
- **Error Boundary:** Custom `ErrorBoundary` class component in `App.jsx` catches render errors, reports to Sentry with component stack, and shows a recovery UI with "Reload page" button.

**Issues:**

1. **Only one error boundary wraps the entire app.** A crash in any component tears down the whole UI, including sidebar and navigation.
2. **Auth timeout fails silently.** If Supabase is unreachable, the user sees a blank screen for 5 seconds, then is treated as unauthenticated with no error message.
3. **No network error detection.** If the user goes offline, there is no offline indicator or retry mechanism.

**[HIGH] Add per-page error boundaries in the route rendering:**

```jsx
<Route
  key={path}
  path={`/${path}`}
  element={
    <RoleGuard pageName={path}>
      <LayoutWrapper currentPageName={path}>
        <Sentry.ErrorBoundary fallback={<PageErrorFallback pageName={path} />}>
          <Suspense fallback={pageFallback}>
            <Page />
          </Suspense>
        </Sentry.ErrorBoundary>
      </LayoutWrapper>
    </RoleGuard>
  }
/>
```

**[MEDIUM] Add online/offline detection:**

```jsx
const [isOnline, setIsOnline] = useState(navigator.onLine);
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
```

---

### 6I. CI/CD & Build Pipeline

**Current State:**

- **Build:** `vite build` via Vercel (`vercel.json` configured).
- **Linting:** ESLint + Prettier with `husky` pre-commit hooks and `lint-staged`.
- **Testing:** Vitest configured in `vite.config.js` with jsdom.
- **Deploy:** Vercel with SPA rewrites for all non-asset routes.
- **Security headers:** Comprehensive set in `vercel.json` (HSTS, CSP, X-Frame-Options, etc.)

**Issues:**

1. **No build size analysis.** No `rollup-plugin-visualizer` or bundle size tracking in CI. Bundle regressions would go undetected.
2. **No Lighthouse CI or performance testing in the pipeline.** No automated Core Web Vitals checks.
3. **No `analyze` or `build:analyze` npm script** for developers to inspect bundle composition.
4. **The `typecheck` script references `jsconfig.json` with `tsc`** — unusual since the project uses JSX, not TSX.
5. **No `.vercelignore`** to speed up uploads.

**[HIGH] Add bundle analysis:**

```bash
npm install -D rollup-plugin-visualizer
```

```js
// vite.config.js — add to plugins array (only in analyze mode):
...(process.env.ANALYZE ? [visualizer({ open: true, gzipSize: true })] : []),
```

```json
// package.json:
"analyze": "ANALYZE=true vite build"
```

**[MEDIUM] Add bundle size budget to CI:**

```json
"size": "vite build && du -sh dist/assets/*.js | sort -rh | head -20"
```

**[LOW] Add Lighthouse CI** for automated CWV monitoring on preview deployments.

---

### 6J. Performance Priority Summary

#### Critical

| Finding                                        | Est. Impact                                              | File                       |
| ---------------------------------------------- | -------------------------------------------------------- | -------------------------- |
| Remove unused `xlsx` dependency                | -90 KB from bundle                                       | `package.json`             |
| Remove GA4 placeholder script                  | -30 KB network + eliminates render-blocking fetch        | `index.html`               |
| Batch `allTablesPopulated` into parallel calls | Saves 4 sequential network round trips (~800ms) on login | `src/hooks/useAutoSeed.js` |

#### High

| Finding                                  | Est. Impact                                              | File                             |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| Add `manualChunks` to Vite config        | Proper vendor splitting, smaller initial load            | `vite.config.js`                 |
| Dynamic-import `mammoth` in 3 files      | -30 KB from affected page chunks                         | 3 component files                |
| Cache Google Fonts in service worker     | Eliminates font latency on repeat visits                 | `vite.config.js`                 |
| Defer 3 of 4 font families               | -300-500ms LCP on first visit                            | `index.html`                     |
| Convert Layout API calls to React Query  | Prevents redundant API calls on every navigation         | `src/Layout.jsx`                 |
| Consolidate Realtime into single channel | Reduces WebSocket connections from 4 to 1                | `src/hooks/useRealtimeSync.js`   |
| Add debouncing to Realtime invalidation  | Prevents cache thrashing during bulk operations          | `src/hooks/useRealtimeSync.js`   |
| Add Realtime error recovery              | Prevents silent subscription death                       | `src/hooks/useRealtimeSync.js`   |
| Per-page Sentry error boundaries         | Crash isolation — one page failure does not kill the app | `src/App.jsx`                    |
| Add bundle analysis tooling              | Detect regressions, enable optimization                  | `vite.config.js`, `package.json` |

#### Medium

| Finding                                                     | Est. Impact                           | File             |
| ----------------------------------------------------------- | ------------------------------------- | ---------------- |
| Lazy-load Login/Onboarding/Pricing/Terms/Privacy/Calculator | -30-60 KB from main chunk             | `src/App.jsx`    |
| Skeleton fallbacks for marketing routes                     | Reduces CLS on lazy route transitions | `src/App.jsx`    |
| Convert brand PNGs to WebP                                  | -20-40% image size                    | `/public/brand/` |
| Add route-level data prefetching on hover                   | Perceived instant navigation          | `src/Layout.jsx` |
| Offline detection                                           | Better UX when network drops          | `src/App.jsx`    |
| Bundle size budget in CI                                    | Prevent regressions                   | New CI config    |

#### Estimated Impact of All Fixes

- **Initial JS payload:** Reduced by ~150-200 KB gzipped
- **Time to Interactive:** Improved by 1-2 seconds on 4G
- **LCP:** Improved by 500-1200ms (font deferral + GA4 removal)
- **Repeat visit performance:** Near-instant from service worker font caching
- **Navigation feel:** Sub-500ms with prefetching and React Query caching
- **API overhead per session start:** Reduced from ~7 sequential calls to ~2 parallel calls
- **WebSocket connections:** Reduced from 4 to 1
- **Error resilience:** Individual page crashes no longer take down the entire app

---

## Part 7: Master Priority List

Consolidated from all 6 reports.

---

### CRITICAL Items

| #   | Item                                                                                                                                                                                                                     | Source Report           | Effort     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ---------- |
| C1  | **Dual schema divergence** — production columns likely don't match schema.sql. Breaks every RLS policy, FK, and entity mapping. Audit production DB and create `009_reconcile_schema.sql`.                               | Database                | 3-5 days   |
| C2  | **Missing `tier` column on `user_subscriptions`** — AI rate limiting silently defaults all users to free tier regardless of actual subscription.                                                                         | Database                | 2 hours    |
| C3  | **Entity table fallthrough bug** — `PitchCompetition`, `AIUsageLog`, `DataRoomAccess`, `NewsletterSubscriber` all map to wrong table names. Silent failures on Referrals, PitchCompetition, AIAnalytics pages right now. | Database                | 1 hour     |
| C4  | **TEXT columns where UUID FKs should exist** — `partnerships.assigned_to`, `notifications.user_email`, `activities.actor_email`, `teams.owner_email`, `brands.created_by` are plain TEXT with no referential integrity.  | Database                | 2-3 days   |
| C5  | **Two divergent access-control systems** — `routePermissions.js` and `useFeatureGate.js` must be manually kept in sync. A single source of truth needed for both role membership and tier requirement per page.          | Architecture            | 2-3 days   |
| C6  | **`authError` is never set** — `UserNotRegisteredError` branch in `AuthenticatedRoutes` is permanently unreachable. Dead code path hiding a missing error-handling implementation.                                       | Architecture            | 2 hours    |
| C7  | **In-memory AI cache does not work in serverless** — `responseCache = new Map()` in `ai-router/index.ts` never persists across Deno isolates. Zero cache benefit. Replace with database-backed cache or Upstash Redis.   | Architecture / Database | 1 day      |
| C8  | **Annual billing toggle is visible but functionally broken** — The toggle on the landing page tracks state but never computes or displays discounted prices. Destroys trust with every B2B visitor who clicks it.        | Frontend                | 2-3 hours  |
| C9  | **Free/Starter/Explorer plan naming inconsistency** — Talent free plan is "Starter" in Onboarding and "Free" on the landing page. Brand free tier is "Explorer" in Onboarding and "Free" on the landing page.            | Frontend                | 1 hour     |
| C10 | **Missing skip-to-content link** — No `<a href="#main-content">Skip to main content</a>` for keyboard users. WCAG A failure.                                                                                             | Accessibility           | 1 hour     |
| C11 | **Remove GA4 placeholder script** — `G-PLACEHOLDER` causes a real script fetch (~30 KB) on every page load even though the measurement ID is not configured.                                                             | Performance             | 30 minutes |
| C12 | **Remove unused `xlsx` dependency** — Zero imports in `src/` but ~90 KB added to `node_modules` and potentially bundled.                                                                                                 | Performance             | 15 minutes |
| C13 | **Batch `allTablesPopulated` check** — 5 sequential Supabase queries fire on every session start for every user. Causes ~800ms delay on every login.                                                                     | Performance             | 2-3 hours  |
| C14 | **Trial expiry re-engagement email sequence** — Trial expiry simply blocks access with no re-engagement campaign. Industry average: 15-25% of expired trials convert with a discount offer.                              | Business                | 2-3 weeks  |
| C15 | **Annual pricing with hard dollar savings** — "Save ~20%" should be "Save $599/year" or calculated equivalent. Specific numbers dramatically outperform percentages for conversion.                                      | Business                | 1 week     |
| C16 | **Platform transaction fee via Stripe Connect** — Stripe Connect is architecturally in place but DealStage takes no fee on deals. At $50M deal volume, a 2% fee = $1M ARR.                                               | Business                | 4-6 weeks  |
| C17 | **Public talent profile shareable link** — No public URL exists for talent profiles. This is the #1 virality mechanism used by every creator economy platform (Linktree, Beacons, etc.).                                 | Business                | 3-4 weeks  |
| C18 | **Milestone-triggered upgrade nudges** — UpgradeModal exists but is only triggered on locked nav clicks, not on approaching usage limits. Contextual nudges are 4-6x more effective.                                     | Business                | 2-3 weeks  |
| C19 | **Enterprise demo/sales request flow** — "Contact Sales" CTA links to nothing. Enterprise prospects ($2,500+/mo) will not convert without a demo-first motion.                                                           | Business                | 1 week     |
| C20 | **Replace vague landing page stats** — "Growing Talent Network" is not a number. Replace all placeholder stats with specific, credible metrics.                                                                          | Business                | 1 day      |

---

### HIGH Items

| #   | Item                                                                                                                                                                                                                     | Source Report          | Effort     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------- |
| H1  | **Eliminate duplicate profile fetches** — `useFeatureGate`, `Layout.jsx`, and `AuthContext` all independently fetch the user profile on mount. Move to a single `useQuery(['profile', userId])` shared by all consumers. | Architecture           | 1 day      |
| H2  | **Add per-provider timeout + AbortController** in AI router — No timeout on individual provider calls. A 45-second Anthropic response holds the Deno isolate open for the full duration.                                 | Architecture           | 3 hours    |
| H3  | **Create Supabase clients at module scope in Edge Function** — Currently creating 2 new client instances per request. Initialize once outside `Deno.serve`.                                                              | Architecture           | 1 hour     |
| H4  | **Fix hard `limit: 100` in `base44Client.js`** — All list/filter calls silently truncate at 100 rows with no pagination support and no indication to callers.                                                            | Architecture           | 1 day      |
| H5  | **Resolve manager role divergence** — `useFeatureGate.js` gives managers talent page access at their tier but `routePermissions.js` gives managers a different page set.                                                 | Architecture           | half day   |
| H6  | **Extract Sidebar out of Layout closure** — `Sidebar` defined as inner component causes it to be re-created on every Layout state change, preventing React from bailing out of re-renders.                               | Architecture           | half day   |
| H7  | **Fix `limit: 100` on `base44Client.js` entity list/filter** — Already listed in C, but the same issue affects dashboard, partnership pipeline, and analytics at >100 records.                                           | Architecture           | 1 day      |
| H8  | **AI router rate limit query** — `COUNT(*)` on `ai_usage_logs` fires on every single AI request. Replace with `ai_rate_limits` table using atomic increments.                                                            | Database               | half day   |
| H9  | **Missing composite indexes** — `idx_talents_niche_tier`, `idx_partnerships_status_created`, `idx_escrow_partnership_status`, `idx_ai_usage_user_date` are all missing.                                                  | Database               | 1 hour     |
| H10 | **SELECT \* on all entity queries** — Add `.select(columns)` parameter to entity proxy; refactor Dashboard, Partnerships, DealAnalytics to request only rendered columns.                                                | Database               | 2-3 days   |
| H11 | **Server-side TABLE_MAP missing 14+ entities** in `_shared/supabase.ts` — Edge functions use a stale mapping that doesn't include entities added after the initial build.                                                | Database               | 1 hour     |
| H12 | **Escrow function has no real payment integration** — `stripe_payment_intent` column is never populated. Escrow is a database state machine with no financial enforcement. Legal/trust risk.                             | Database               | 1-2 weeks  |
| H13 | **Add audit_logs and partnership_stage_history tables** — No record of who changed partnership status, released escrow, or approved items. Security and business analytics blind spot.                                   | Database               | 1 day      |
| H14 | **Add `Cmd+K` global command palette** — No keyboard shortcut for global search. The `Command` (cmdk) primitive from shadcn is already installed and unused. One of the highest-impact UX changes in the codebase.       | Frontend               | 2-3 days   |
| H15 | **Expand GlobalSearch** — Currently only searches 4 entity types. Must cover deals, talent profiles, brands, outreach contacts, and page navigation.                                                                     | Frontend               | 2-3 days   |
| H16 | **Make trial banner sticky** — Convert inline trial/expired banner to a fixed top bar outside the scrollable content area.                                                                                               | Frontend               | 2 hours    |
| H17 | **Fix GlobalSearch and NotificationDropdown hardcoded light styles** — Both components use `bg-white` and `border-slate-200` hardcoded, breaking the dark theme.                                                         | Frontend               | 1 hour     |
| H18 | **Unify the three theme systems** — `useTheme.js` tokens, LandingPage.jsx inline `<style>`, and Tailwind CSS variables are three separate systems with no shared source of truth.                                        | Frontend               | 2-3 days   |
| H19 | **Make dashboard respond to dark/pearl theme switching** — The `ThemeSwitcher` in the sidebar currently only affects the landing page the user can't see.                                                                | Frontend               | 1-2 days   |
| H20 | **Move AnimatedWalkthrough into the hero section** — The static `.ds-hero-ui` mockup does not communicate product depth. Interactive animated walkthrough in the hero is the highest-impact landing page change.         | Frontend               | 1 day      |
| H21 | **Fix mobile media queries for landing page** — `.ds-feature-row`, `.ds-stats` (4 columns), `.ds-hiw-grid` (3 columns), and `.ds-pricing-grid-cols` all lack `@media (max-width: 768px)` overrides.                      | Frontend               | 1 day      |
| H22 | **Wrap lazy pages in Suspense with skeleton fallback** — No Suspense boundary wrapping lazy pages; a network failure on chunk load causes a React throw with no fallback.                                                | Frontend / Performance | 2 hours    |
| H23 | **Defer GlobalSearch queries until search is opened** — 4 `useQuery` calls fire eagerly on every dashboard mount. Set `enabled: false` until search input gains focus.                                                   | Frontend / Performance | 1 hour     |
| H24 | **Add `gold` variant to Button component** — Primary CTA style is ad-hoc inline `style={{background: "linear-gradient(...)}}` across many files. A `variant="gold"` in `buttonVariants` standardizes it.                 | Frontend               | 1 hour     |
| H25 | **Add accessibility ARIA labels** — `NotificationDropdown` trigger has no `aria-label`. `GlobalSearch` has no `aria-expanded`. Sidebar `<nav>` has no accessible name. Section headers are `<p>` not `role="group"`.     | Accessibility          | half day   |
| H26 | **Add `manualChunks` to Vite config** — Without vendor chunk splitting, Sentry + Stripe + recharts + mammoth all ship in the same first-load bundle.                                                                     | Performance            | 2 hours    |
| H27 | **Dynamic-import `mammoth`** in ContractScanner, BriefParser, DataRoomImporter — Currently a static import adding ~30 KB to every page using these components.                                                           | Performance            | 1 hour     |
| H28 | **Cache Google Fonts in service worker** — After PWA installs, font files still hit the network on repeat visits. Add Workbox `CacheFirst` rule for fonts.gstatic.com.                                                   | Performance            | 1 hour     |
| H29 | **Defer 3 of 4 font families** — Load only Instrument Sans synchronously. Defer Cormorant Garamond, Instrument Mono, Plus Jakarta Sans with `media="print" onload="this.media='all'"`.                                   | Performance            | 30 minutes |
| H30 | **Convert Layout API calls to React Query** — `base44.auth.me()` and `ApprovalItem.filter()` in Layout.jsx are uncached raw calls that re-fire on every route change.                                                    | Performance            | 2 hours    |
| H31 | **Consolidate Realtime into single channel with debouncing and error recovery** — Currently 4 separate channels with no debouncing and no reconnection on error.                                                         | Performance            | 2-3 hours  |
| H32 | **Per-page Sentry error boundaries** — A crash in any one page currently tears down the entire app including the sidebar.                                                                                                | Performance            | 2-3 hours  |
| H33 | **Add bundle analysis tooling** — No `rollup-plugin-visualizer`. Bundle regressions are undetectable.                                                                                                                    | Performance            | 1 hour     |
| H34 | **Agency Explorer tier at $499/mo** — No free/low-cost tier for agencies completely eliminates the self-serve top-of-funnel.                                                                                             | Business               | 1-2 weeks  |
| H35 | **Seat expansion pricing at Scale/Pro tiers** — Additional users beyond base allocation at $49/user/month is pure expansion revenue requiring zero new features.                                                         | Business               | 3-4 weeks  |
| H36 | **Weekly "Partnership Intelligence" digest email** — No email engagement exists post-signup. A personalized weekly digest reduces churn by 10-20%.                                                                       | Business               | 2-3 weeks  |
| H37 | **Cross-role referral program with incentives** — Talent earns $50 credit when a brand they referred signs up. Brand earns a free month when a creator they invited signs up.                                            | Business               | 3-4 weeks  |
| H38 | **Manager role landing page** — No competitor has a dedicated Manager role product. A dedicated landing page for "talent managers and sports agents" targets an untapped market.                                         | Business               | 1 week     |

---

### MEDIUM Items

| #   | Item                                                                                                  | Source Report |
| --- | ----------------------------------------------------------------------------------------------------- | ------------- |
| M1  | Remove double logout paths; unify on one signout flow                                                 | Architecture  |
| M2  | Replace character-count token estimation with actual API usage fields                                 | Architecture  |
| M3  | Move `roleNavItems` to its own config file (`src/config/navigation.js`)                               | Architecture  |
| M4  | Remove dead `useBatch`/`offPeakOnly` agent config fields or implement them                            | Architecture  |
| M5  | Consolidate `featureFlags.js` into `useFeatureGate.js`                                                | Architecture  |
| M6  | Move `PUBLIC_ROUTES` to a single constant used by all three places that currently define it           | Architecture  |
| M7  | Add `ai_rate_limits` table to replace COUNT(\*) query in AI router                                    | Database      |
| M8  | Add `notification_preferences` table                                                                  | Database      |
| M9  | Add `analytics_daily_snapshots` table (nightly cron) to replace dashboard waterfall queries           | Database      |
| M10 | Add `contracts` table linked to partnerships                                                          | Database      |
| M11 | Dashboard waterfall: replace 7 parallel queries with single `get_dashboard_summary()` RPC             | Database      |
| M12 | BundleDeals N+1 inserts: add `bulkCreate` to `createEntityProxy`                                      | Database      |
| M13 | Add `updated_at` triggers to all tables from migration 006                                            | Database      |
| M14 | Consolidate dual FeatureGate components (hook-based vs API-call version)                              | Frontend      |
| M15 | Add step progress indicator to onboarding flow                                                        | Frontend      |
| M16 | Add Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google' })`                          | Frontend      |
| M17 | Add section separators to admin nav (copy `section` property pattern)                                 | Frontend      |
| M18 | Add section dividers to tablet icon rail (hairline `<div>` between groups)                            | Frontend      |
| M19 | Extract Sidebar to module-level memoized component (`React.memo`)                                     | Frontend      |
| M20 | Fix PascalCase page title regex to handle known abbreviations (AICommandCenter → "AI Command Center") | Frontend      |
| M21 | Move ThemeSwitcher from sidebar footer to header (top-right, before avatar)                           | Frontend      |
| M22 | Add responsive media queries: replace `useIsMobile` with `matchMedia`                                 | Frontend      |
| M23 | Convert locked nav items from `<Link to="#">` to `<button type="button">`                             | Accessibility |
| M24 | Add focus trap to NotificationDropdown using Radix `FocusScope`                                       | Accessibility |
| M25 | Audit `var(--ds-cream3)` and `text-slate-500` color contrast with `axe-core` in CI                    | Accessibility |
| M26 | Change `Badge` component from `<div>` to `<span>`                                                     | Frontend      |
| M27 | Add a `Kbd` component for keyboard shortcut labels (`⌘K`)                                             | Frontend      |
| M28 | Lazy-load Login/Onboarding/Pricing/Terms/Privacy/Calculator in App.jsx                                | Performance   |
| M29 | Skeleton fallbacks for marketing routes (replace `fallback={<div />}`)                                | Performance   |
| M30 | Convert brand PNGs to WebP with PNG fallback                                                          | Performance   |
| M31 | Add route-level data prefetching on hover in sidebar nav links                                        | Performance   |
| M32 | Add online/offline detection with user-visible indicator                                              | Performance   |
| M33 | Add bundle size budget check to CI pipeline                                                           | Performance   |
| M34 | Increase Talent Rising to $129/mo and reposition the value proposition                                | Business      |
| M35 | Create "Manager + Talent" cross-sell bundle at $79/mo add-on                                          | Business      |
| M36 | Monetize Pitch Deck Builder as a $99/deck standalone product                                          | Business      |
| M37 | Sell Market Intelligence reports as $299-$999 data products                                           | Business      |
| M38 | Add AI Credits system ($49/mo for 500 additional agent runs)                                          | Business      |
| M39 | "Featured on DealStage" badge program for completed partnerships                                      | Business      |
| M40 | Implement milestone-triggered upgrade nudges at usage limits                                          | Business      |
| M41 | Add in-app changelog ("What's New") panel with notification badge                                     | Business      |
| M42 | Add "Deal Velocity Score" gamification metric to dashboard                                            | Business      |

---

## Part 8: Top 20 Upgrade Ideas

Ranked by cross-domain impact — these are the ideas most likely to move the needle on revenue, retention, and product quality simultaneously.

| Rank | Upgrade Idea                                                                        | Impact Areas                            | Why It's Top 20                                                                                                                                                                                                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | **Global `Cmd+K` Command Palette** (using installed cmdk Command primitive)         | UX, Retention, Brand Perception         | Single change transforms DealStage from a "search bar" product to a "keyboard-driven power tool" — the hallmark of premium SaaS (Linear, Notion, Raycast). Infrastructure already installed.                                                                                                                                         |
| 2    | **Public Talent Profile Shareable URL** (thedealstage.com/c/[handle])               | Business, Network Effects, Acquisition  | The #1 virality mechanism in the creator economy. Every talent profile becomes a top-of-funnel acquisition point. Linktree built to 40M users on this exact mechanic. Near-zero CAC.                                                                                                                                                 |
| 3    | **Stripe Connect Transaction Fee** (1.5% brand + 1% talent)                         | Revenue                                 | Pure margin on top of subscriptions. Every deal closed through the platform becomes a revenue event. At $50M deal volume: +$1.25M ARR. Infrastructure already in place architecturally.                                                                                                                                              |
| 4    | **Trial Expiry Re-engagement Email Sequence** (Day 5 / Day 7 / Day 10)              | Revenue, Conversion                     | 15-25% of expired trials convert with a structured sequence + discount. Currently the platform just blocks access with no nurture. Highest-ROI conversion mechanic not yet built.                                                                                                                                                    |
| 5    | **Unify Access Control** (merge `routePermissions.js` + `useFeatureGate.js`)        | Architecture, Security, Reliability     | This is the #1 architectural risk — a silent correctness bug where pages can be navigable but locked, or locked but invisible, depending on which file was last updated.                                                                                                                                                             |
| 6    | **Real Embedding-Based Matching** (pgvector in Supabase)                            | AI, Product Differentiation             | The MatchEngine defines 5 vector embedding types but sends raw JSON to the LLM for scoring. Implementing real cosine similarity search using pgvector would make matching 10-100x faster and more accurate — a genuine competitive moat.                                                                                             |
| 7    | **Fix Dual Schema Divergence** (production audit + `009_reconcile_schema.sql`)      | Database, Reliability                   | P0 database issue. Entity mapping failures on at least 4 pages right now. RLS policies that don't match the production column layout are a security vulnerability.                                                                                                                                                                   |
| 8    | **Annual Pricing with Hard Dollar Savings**                                         | Revenue                                 | "Save $599/year" outperforms "Save ~20%" dramatically. The toggle already exists. This is a one-line copy + one calculation change that starts compounding on every new subscriber.                                                                                                                                                  |
| 9    | **Drag-and-Drop Deal Pipeline** (using @dnd-kit)                                    | UX, Engagement, Retention               | The Partnerships Kanban shows 10 stages but uses button-based advancement. True drag-and-drop with auto-triggered workflows (drag to "Contracted" → auto-generates contract) creates a workflow dependency that drives daily engagement.                                                                                             |
| 10   | **Persistent Agent Memory** (per-user `agent_memory` table)                         | AI, Retention                           | Currently all 32 agents are stateless per-call. Agent memory would let the Negotiation Coach remember previous positions, the Partnership Predictor learn from outcomes, and the Revenue Forecaster build a historical model per user. Transforms AI from a tool into an assistant.                                                  |
| 11   | **Phyllo Deep Integration** (activate full data sync beyond OAuth)                  | Data Quality, Trust, Differentiation    | Phyllo is used only for OAuth. Activating real follower counts, engagement metrics, content history, audience demographics, and income data would make every talent profile backed by verified, real-time data. The biggest trust differentiator vs competitors relying on self-reported numbers.                                    |
| 12   | **Automated Contract Execution** (DocuSign or PandaDoc integration)                 | Workflow, Revenue                       | ContractTemplates generates contracts but execution is manual. One-click contract sending + e-signature capture. When both parties sign, auto-advance to "Contracted" stage and trigger the activation checklist.                                                                                                                    |
| 13   | **Multi-Party Deal Rooms** (Talent + Brand + Agency with role-based visibility)     | Product Differentiation, Agency Revenue | No competitor handles 3-party deals well. Agency sees commission structure, Brand sees deliverables, Talent sees payment schedule. Each party approves their portion independently. A genuine category-defining feature.                                                                                                             |
| 14   | **Streaming AI Responses** (SSE from the edge function)                             | UX, Perceived Performance               | The AI Command Center waits for the full response. Implementing Server-Sent Events streaming so users see tokens appearing in real-time would dramatically improve perceived latency on the most-used AI feature.                                                                                                                    |
| 15   | **Analytics Daily Snapshots** (nightly cron populating `analytics_daily_snapshots`) | Performance, Scalability                | Currently dashboard and analytics pages pull raw data and aggregate in JavaScript. A nightly snapshot table eliminates the 7-query waterfall on every dashboard load and makes the product fast at 100K users.                                                                                                                       |
| 16   | **Deal Outcome Feedback Loop**                                                      | AI Improvement, Data Moat               | When deals reach "Completed" or "Churned", capture structured outcomes (actual ROI, content performance, relationship rating). Feed this back into the Match Engine to continuously improve the 10 scoring weights. Currently the weights are static constants — making them learned from data creates a compounding data advantage. |
| 17   | **Proactive AI Notifications** (scheduled background runs via pg_cron)              | Retention, Engagement                   | The Smart Alert Generator exists but appears to be on-demand only. Scheduled background runs that proactively scan for at-risk partnerships, expiring contracts, stalled deals, and trending opportunities — pushing notifications to relevant users before they think to ask.                                                       |
| 18   | **Cross-Platform Campaign Attribution** (unique tracking links + pixel)             | Brand Value Proposition, Competitive    | The Attribution agent exists but there is no tracking pixel or UTM infrastructure. Unique tracking links per partnership + a JavaScript pixel in talent content to measure actual conversion attribution is the single most-requested feature from brands in the creator economy.                                                    |
| 19   | **Creator Economy Index** (monthly public report from anonymized platform data)     | SEO, Thought Leadership, Acquisition    | The MarketIntelligence data is already there. Package it as a monthly "PartnerIQ Creator Economy Index" — rates by niche, platform growth trends, deal volume by category. Drives organic traffic, establishes thought leadership, and creates a publication that journalists cite.                                                  |
| 20   | **Agency Freemium Explorer Tier** ($499/mo)                                         | Revenue, Top-of-Funnel                  | The hard wall at $2,499/mo eliminates all self-serve agency acquisition. An Agency Explorer plan (1-2 talent profiles, core features) creates land-and-expand motion. Each large sports or entertainment agency that lands could bring 50-200 talent profiles.                                                                       |

---

## Part 9: Revenue Impact Projections

_From Business Strategy & Monetization report_

### Current Model Baseline (1,000 paying accounts at steady state)

| Segment                                     | Accounts  | Blended Price  | MRR                         |
| ------------------------------------------- | --------- | -------------- | --------------------------- |
| Talent (mix of Rising $99 / Pro $249)       | 400       | ~$300/mo avg   | ~$120K                      |
| Brand (mix of Growth $499 / Scale $1,299)   | 300       | ~$833/mo avg   | ~$250K                      |
| Agency (mix of Starter $2,499 / Pro $4,999) | 100       | ~$3,500/mo avg | ~$350K                      |
| Manager (mix of Single $149 / Multi $349)   | 200       | ~$275/mo avg   | ~$55K                       |
| **Total**                                   | **1,000** |                | **~$775K MRR = ~$9.3M ARR** |

### Revenue Impact by Recommendation

| Recommendation                                        | Mechanism                                                             | Incremental ARR (Conservative) |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Annual pricing with hard dollar savings (Rec 1.2)     | 20% improvement in annual contract conversion → reduced monthly churn | +$1.86M                        |
| Platform transaction fee via Stripe Connect (Rec 2.1) | 2% on $50M deal volume                                                | +$1.0M                         |
| Seat expansion pricing at Scale/Pro tiers (Rec 7.1)   | Avg 2 additional seats per Brand Scale customer at $49/user/mo        | +$600K                         |
| Extended trial + email nurture sequence (Rec 5.3)     | 20% lift in trial-to-paid conversion rate                             | +$1.86M                        |
| Agency Explorer tier at $499/mo (Rec 1.5)             | 200 new self-serve agencies at blended $800/mo                        | +$1.2M                         |
| Manager repricing to $199/$599 (Rec 1.4)              | Existing 200 manager accounts at higher price + 20% new uptake        | +$400K                         |
| Cross-role referral program (Rec 8.2)                 | 15% increase in new paid signups                                      | +$500K                         |
| **Total Incremental ARR from Top Recommendations**    |                                                                       | **+$7.4M**                     |

### Projected ARR at Scale

| Scenario                                          | ARR             |
| ------------------------------------------------- | --------------- |
| Current run rate (subscriptions only)             | ~$9.3M          |
| With top 10 business recommendations              | ~$15.8M         |
| With transaction layer at $100M deal volume       | +$2M            |
| With API product and white-label reseller program | +$3-5M          |
| **Total potential at scale (2-3 year horizon)**   | **$20-25M ARR** |

### Three Immediate Revenue Actions (This Week)

1. **Turn on hard-number annual pricing savings** on the landing page and SubscriptionManagement page — a one-line copy change that starts compounding immediately on every new subscriber.

2. **Wire up a Stripe Connect application fee of 1-2%** on deal payment flows — architecturally supported by Stripe and turns every deal closed through the platform into a revenue event rather than a retention metric.

3. **Add a "You have 1 message left this month" nudge** in the Outreach component for Rising-tier talent users — the highest-leverage conversion moment in the entire product because the user is actively experiencing the constraint that justifies upgrading.

---

## Part 10: 90-Day Roadmap

Organized by Month — prioritizing critical fixes first, then high-impact upgrades, then growth features.

---

### Month 1: Critical Fixes + Quick Wins (Days 1-30)

**Week 1 — Emergency Fixes (do these before anything else)**

| Task                                                                                                                 | Priority | Time      | Impact                            |
| -------------------------------------------------------------------------------------------------------------------- | -------- | --------- | --------------------------------- |
| Remove `xlsx` from package.json                                                                                      | C12      | 15 min    | -90 KB bundle                     |
| Remove GA4 placeholder script from index.html                                                                        | C11      | 30 min    | -30 KB, faster LCP                |
| Add missing entity mappings to ENTITY_TABLE_MAP (PitchCompetition, AIUsageLog, DataRoomAccess, NewsletterSubscriber) | C3       | 1 hour    | Fix 4 broken pages                |
| Fix annual billing toggle on landing page to compute and display discounted prices                                   | C8       | 2-3 hours | Trust restoration on pricing page |
| Fix free plan naming inconsistency: unify as "Free" in both LandingPage.jsx and Onboarding.jsx                       | C9       | 1 hour    | Branding consistency              |
| Wire `authError` — implement the dead user_not_registered error path or remove it                                    | C6       | 2 hours   | Code correctness                  |
| Batch `allTablesPopulated` into parallel calls                                                                       | C13      | 2-3 hours | -800ms on every login             |
| Add hard-number annual savings to landing page pricing cards ("Save $599/year")                                      | C15      | 2-3 hours | Conversion improvement            |

**Week 2 — Database Critical Path**

| Task                                                                                                         | Priority | Time      | Impact                                              |
| ------------------------------------------------------------------------------------------------------------ | -------- | --------- | --------------------------------------------------- |
| Audit production Supabase instance — determine which schema is actually deployed                             | C1       | 2-4 hours | Foundation for all DB fixes                         |
| Add `tier` column to `user_subscriptions` or update AI router query to use `current_plan`                    | C2       | 2 hours   | Fix AI rate limiting for all paid users             |
| Create `009_reconcile_schema.sql` to bring production in line with schema.sql intentions                     | C1       | 3-5 days  | Fixes FK integrity, RLS policies, UUID references   |
| Synchronize server-side TABLE_MAP in `_shared/supabase.ts` with client-side ENTITY_TABLE_MAP                 | H11      | 1 hour    | Fix edge function entity routing                    |
| Add composite indexes: `idx_talents_niche_tier`, `idx_partnerships_status_created`, `idx_ai_usage_user_date` | H9       | 1 hour    | Critical for AI rate limiting and match performance |
| Replace in-memory AI cache with `ai_response_cache` table + TTL                                              | C7       | 1 day     | Actual cache functionality                          |
| Create `ai_rate_limits` table and replace COUNT(\*) query in AI router                                       | H8       | half day  | Performance + correctness                           |

**Week 3 — Architecture Critical Path**

| Task                                                                                          | Priority | Time     | Impact                                      |
| --------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------- |
| Begin consolidating `routePermissions.js` + `useFeatureGate.js` into a single source of truth | C5       | 2-3 days | Eliminates #1 architectural risk            |
| Move profile fetch to a single React Query key shared by AuthContext, useFeatureGate, Layout  | H1       | 1 day    | Eliminates triple-fetch on every page load  |
| Add per-provider AbortController timeout (25s) in AI router `routeRequest`                    | H2       | 3 hours  | Prevents 45-second hanging requests         |
| Initialize Supabase clients at module scope in ai-router/index.ts                             | H3       | 1 hour   | -2 client instantiations per AI request     |
| Extract `Sidebar` from Layout closure to module-level `React.memo` component                  | H6       | half day | Prevents re-creation on every Layout render |
| Unify the two logout paths into one                                                           | M1       | 2 hours  | Correctness                                 |

**Week 4 — Business Quick Wins + Frontend Critical**

| Task                                                                                       | Priority | Time     | Impact                        |
| ------------------------------------------------------------------------------------------ | -------- | -------- | ----------------------------- |
| Add skip-to-content link as first focusable element in Layout.jsx                          | C10      | 1 hour   | WCAG A compliance             |
| Add `Cmd+K` keyboard shortcut to open global search using installed cmdk Command component | H14      | 2-3 days | Transforms UX perception      |
| Fix GlobalSearch and NotificationDropdown hardcoded `bg-white` styles to use CSS variables | H17      | 1 hour   | Dark theme correctness        |
| Convert trial/expired banners to sticky fixed top bar                                      | H16      | 2 hours  | Persistent conversion nudge   |
| Add a "Contact Sales" / Calendly demo request form for Enterprise tier CTAs                | C19      | 1 week   | Unlocks Enterprise conversion |
| Replace vague landing page stats with specific, credible metrics                           | C20      | 1 day    | Conversion improvement        |
| Add `aria-label="Notifications"` to NotificationDropdown trigger                           | H25      | 30 min   | Accessibility                 |
| Add `aria-label="Main navigation"` and `role="group"` to sidebar section headers           | H25      | 1 hour   | Accessibility                 |

---

### Month 2: High-Impact Upgrades (Days 31-60)

**Performance & Infrastructure**

| Task                                                                         | Priority | Time      | Impact                                          |
| ---------------------------------------------------------------------------- | -------- | --------- | ----------------------------------------------- |
| Add `manualChunks` Vite config for vendor splitting                          | H26      | 2 hours   | Smaller initial bundle, faster LCP              |
| Dynamic-import `mammoth` in ContractScanner, BriefParser, DataRoomImporter   | H27      | 1 hour    | -30 KB from affected chunks                     |
| Add Google Fonts runtime caching to Workbox config                           | H28      | 1 hour    | Near-instant fonts on repeat visits             |
| Defer 3 of 4 font families until after first paint                           | H29      | 30 min    | -500ms LCP                                      |
| Add `rollup-plugin-visualizer` and `npm run analyze` script                  | H33      | 1 hour    | Bundle visibility                               |
| Consolidate Realtime into single channel with debouncing + error recovery    | H31      | 2-3 hours | 4→1 WebSocket connections, resilience           |
| Add per-page Sentry error boundaries                                         | H32      | 2-3 hours | Crash isolation                                 |
| Convert Layout.jsx API calls to React Query                                  | H30      | 2 hours   | Eliminates uncached calls on every route change |
| Wrap all lazy page components in `<Suspense>` with proper skeleton fallbacks | H22      | 2 hours   | Eliminates blank-flash on navigation            |
| Defer GlobalSearch queries until search opens (`enabled: false`)             | H23      | 1 hour    | -4 API calls on every dashboard load            |

**AI & Data**

| Task                                                                               | Priority     | Time     | Impact                                    |
| ---------------------------------------------------------------------------------- | ------------ | -------- | ----------------------------------------- |
| Create `audit_logs` table and wire to sensitive operations                         | H13          | 1 day    | Security compliance                       |
| Create `partnership_stage_history` table and wire to status changes                | H13          | 1 day    | Business analytics + pipeline velocity    |
| Add `SELECT` column projection to entity proxy `list()` and `filter()`             | H10          | 2-3 days | Significant bandwidth reduction           |
| Create `get_dashboard_summary()` RPC to replace 7 dashboard queries                | M9           | 1 day    | Dashboard load time from ~7 RTT to ~1 RTT |
| Replace token estimation (`prompt.length / 4`) with actual API usage fields        | M2           | 2 hours  | Accurate AI cost tracking                 |
| Add `degraded: true` flag when REASONING tier falls back to non-reasoning provider | Architecture | 3 hours  | Transparency                              |

**UX & Product**

| Task                                                                                                            | Priority | Time      | Impact                                             |
| --------------------------------------------------------------------------------------------------------------- | -------- | --------- | -------------------------------------------------- |
| Expand GlobalSearch to cover deals, talent profiles, brands, outreach contacts, and page navigation             | H15      | 2-3 days  | #1 most-requested power user feature               |
| Add `gold` variant to Button component and replace all inline gradient styles                                   | H24      | 1-2 hours | Design system consistency                          |
| Add step progress indicator (1 of 3) to onboarding flow                                                         | M15      | half day  | Reduces onboarding abandonment                     |
| Add Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google' })`                                    | M16      | 1 day     | Reduces signup drop-off                            |
| Fix mobile landing page media queries (`.ds-feature-row`, `.ds-stats`, `.ds-hiw-grid`, `.ds-pricing-grid-cols`) | H21      | 1 day     | Mobile conversion recovery                         |
| Move AnimatedWalkthrough into hero section, replacing static mockup                                             | H20      | 1-2 days  | Higher landing page conversion                     |
| Unify theme system: expand useTheme.js to set all tokens as CSS custom properties on `:root`                    | H18      | 2-3 days  | Foundation for proper dark/pearl dashboard theming |
| Add `notification_preferences` table and UI                                                                     | M8       | 1 day     | User control and reduced notification fatigue      |

**Business**

| Task                                                                                   | Priority | Time      | Impact                                          |
| -------------------------------------------------------------------------------------- | -------- | --------- | ----------------------------------------------- |
| Build trial expiry Day 5 / Day 7 / Day 10 email sequence                               | C14      | 2-3 weeks | +15-25% trial-to-paid conversion                |
| Add milestone-triggered upgrade nudges (approaching usage limits)                      | C18      | 2-3 weeks | 4-6x more effective than generic upgrade modals |
| Implement seat expansion pricing at Scale/Pro tiers ($49/user/mo over base allocation) | H35      | 3-4 weeks | Pure expansion revenue                          |
| Create Agency Explorer tier at $499/mo                                                 | H34      | 1-2 weeks | Unlocks self-serve agency acquisition           |
| Build public talent profile shareable URL (thedealstage.com/c/[handle])                | C17      | 3-4 weeks | Near-zero CAC viral acquisition                 |

---

### Month 3: Growth Features (Days 61-90)

**Revenue & Network Effects**

| Task                                                                                                                         | Priority | Time      | Impact                          |
| ---------------------------------------------------------------------------------------------------------------------------- | -------- | --------- | ------------------------------- |
| Implement Stripe Connect transaction fee (1.5% brand / 1% talent)                                                            | C16      | 4-6 weeks | +$1M ARR at $50M deal volume    |
| Cross-role referral program with incentives (Talent earns $50 per brand signup, Brand earns 1 free month per creator signup) | H37      | 3-4 weeks | Amplified top-of-funnel         |
| Weekly "Partnership Intelligence" digest email                                                                               | H36      | 2-3 weeks | -10-20% churn                   |
| Add "Deal Velocity Score" gamification metric to dashboard                                                                   | M42      | 2-3 weeks | Engagement anchor               |
| Add in-app changelog ("What's New") panel                                                                                    | M41      | 1 week    | Reduces churn, signals momentum |

**AI & Intelligence**

| Task                                                                               | Priority     | Time      | Impact                                    |
| ---------------------------------------------------------------------------------- | ------------ | --------- | ----------------------------------------- |
| Implement real vector similarity search using pgvector in Supabase for MatchEngine | Upgrade #6   | 3-4 weeks | 10-100x faster matching, data moat        |
| Build proactive AI notifications via pg_cron scheduled background scans            | Upgrade #17  | 2-3 weeks | Ambient AI value, daily engagement driver |
| Add persistent agent memory (`agent_memory` table per user)                        | Upgrade #10  | 3-4 weeks | AI transforms from tool to assistant      |
| Add streaming AI responses (SSE) from edge function                                | Upgrade #14  | 1-2 weeks | Dramatically better AI Command Center UX  |
| Add structured output validation (Zod schemas) on AI edge function                 | Architecture | 1 week    | Prevents UI crashes from bad JSON         |

**Workflow & Collaboration**

| Task                                                                         | Priority    | Time      | Impact                                       |
| ---------------------------------------------------------------------------- | ----------- | --------- | -------------------------------------------- |
| Add drag-and-drop to Partnerships Kanban using @dnd-kit                      | Upgrade #9  | 2-3 weeks | Engagement, workflow dependency              |
| Add deal outcome feedback loop (capture outcomes on Completed/Churned deals) | Upgrade #16 | 2-3 weeks | Data moat, improving Match Engine over time  |
| Build automated contract execution (DocuSign or PandaDoc integration)        | Upgrade #12 | 3-4 weeks | Closes a critical deal lifecycle gap         |
| Launch "Creator Economy Index" public monthly report                         | Upgrade #18 | 2 weeks   | SEO, thought leadership, organic acquisition |

**Analytics & Infrastructure**

| Task                                                                  | Priority    | Time     | Impact                               |
| --------------------------------------------------------------------- | ----------- | -------- | ------------------------------------ |
| Add cursor-based pagination throughout entity proxy                   | M7 (D)      | 1-2 days | Required for users with >100 records |
| Partition `ai_usage_logs` by month                                    | Scalability | 1 day    | Required at 10K users                |
| Add TTL cleanup job for notifications older than 90 days              | Scalability | half day | Prevents table bloat                 |
| Build `analytics_daily_snapshots` nightly cron                        | M9          | 1 day    | Dashboard scales to 100K users       |
| Add Realtime RLS filters to channel subscriptions (filter by user_id) | Scalability | 1 day    | Required at 10K+ concurrent users    |

---

## Appendix: Key Files Referenced Across All Reports

### Architecture & Access Control

- `src/App.jsx` — Main router, public route detection
- `src/Layout.jsx` — 558-line shell component with role nav, sidebar, approvals badge
- `src/lib/AuthContext.jsx` — Auth state, session init, logout
- `src/hooks/useFeatureGate.js` — Tier-based page access (System 1 of 2)
- `src/lib/routePermissions.js` — Role-based page access (System 2 of 2)
- `src/lib/featureFlags.js` — Named feature flags (System 3 of 3)
- `src/api/base44Client.js` — 57-entity data layer with compatibility shim

### AI System

- `supabase/functions/ai-router/index.ts` — Main edge function entry point
- `supabase/functions/ai-router/agents.ts` — All 32 agent configurations
- `supabase/functions/ai-router/router.ts` — Multi-provider routing and fallback chains
- `supabase/functions/ai-router/circuit-breaker.ts` — Three-state circuit breaker

### Database

- `supabase/migrations/001_create_tables.sql` — Initial schema (may be production truth)
- `supabase/schema.sql` — Intended authoritative schema (diverged from 001)
- `supabase/migrations/006_create_missing_tables.sql` — 17 tables missing from schema.sql
- `supabase/functions/_shared/supabase.ts` — Server-side TABLE_MAP (missing 14+ entities)

### Frontend

- `src/pages.config.js` — 77 page routes, all lazy-loaded
- `src/pages/LandingPage.jsx` — 1000+ line marketing page with inline styles
- `src/pages/Onboarding.jsx` — Multi-step onboarding with role-specific plans
- `src/components/ui/button.jsx` — Missing `gold` variant
- `src/components/ui/command.jsx` — cmdk installed but unused

### Performance

- `vite.config.js` — No `manualChunks` configuration
- `index.html` — GA4 placeholder script + 4 font families blocking LCP
- `src/hooks/useAutoSeed.js` — 5 sequential queries on every session start
- `src/hooks/useRealtimeSync.js` — 4 separate Realtime channels, no error recovery
- `package.json` — `xlsx` listed as dependency with zero usages in src/
