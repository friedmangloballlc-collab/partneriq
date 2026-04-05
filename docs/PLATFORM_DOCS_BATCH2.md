# DealStage Platform Documentation -- Batch 2

**Company:** DealStage (legal entity: PartnerIQ)
**URL:** thedealstage.com
**Generated:** 2026-03-29
**Deliverables in this batch:** 2, 6, 7, 9
**Cross-references:** Batch 1 IDs (TBL-001 through TBL-068, PER-001 through PER-007)

---

# DELIVERABLE 2: PAGE DIRECTORY

## Overview

DealStage ships 78 lazy-loaded pages defined in `src/pages.config.js` and routed via `react-router-dom` in `src/App.jsx`. Access control is enforced by a `RoleGuard` component that delegates to the single source of truth in `src/config/pageAccess.js`. Pages fall into four categories: public marketing pages (accessible without auth), free authenticated pages (tier 0), tier-gated app pages (tiers 1-3), and admin-only pages.

### Tier Key

| Tier | Meaning                                                                        | Price Range      |
| ---- | ------------------------------------------------------------------------------ | ---------------- |
| 0    | Free / always accessible to authenticated users                                | $0               |
| 1    | Core Workflow (Rising / Growth / Agency Starter / Manager Single)              | $99 - $799/mo    |
| 2    | Competitive Advantage (Pro / Scale / Agency Pro / Manager Pro)                 | $249 - $1,799/mo |
| 3    | Enterprise Scale (Elite / Enterprise / Agency Enterprise / Manager Enterprise) | $499 - $3,499/mo |

### Module Key

| Module        | Description                               |
| ------------- | ----------------------------------------- |
| Core          | Dashboard, settings, onboarding, billing  |
| Pipeline      | Deal management, contracts, approvals     |
| Discovery     | Talent/brand browsing, matching, contacts |
| AI            | AI command center, agents, analytics      |
| Outreach      | Email sequences, campaign briefs          |
| Intelligence  | Market intel, events, spend prediction    |
| Analytics     | Reporting, custom reports, deal analytics |
| Content       | Pitch decks, deck library, data rooms     |
| Marketplace   | Opportunities, applications, competitions |
| Collaboration | Teams, referrals, warm intros             |
| Admin         | Platform administration, system health    |
| Public        | Marketing, legal, feature pages           |
| Manager       | Manager-specific setup and profiles       |

---

## Public Marketing Pages (No Auth Required)

These pages are served before the auth gate in `App.jsx` via the `PUBLIC_ROUTES` array.

| PG-ID  | Page Name         | URL Route        | Module | User Roles | Tier | Purpose                                     | Key Components                                            | API Endpoints                                             | Auth | Status |
| ------ | ----------------- | ---------------- | ------ | ---------- | ---- | ------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | ---- | ------ |
| PG-001 | About             | `/about`         | Public | All + anon | 0    | Company story, mission, team bios           | HeroSection, TeamGrid, MissionStatement                   | None                                                      | No   | Live   |
| PG-002 | Blog              | `/blog`          | Public | All + anon | 0    | Content marketing hub; SEO landing pages    | BlogList, BlogPost, CategoryFilter, NewsletterSignup      | `newsletter_subscribers` INSERT                           | No   | Live   |
| PG-003 | Careers           | `/careers`       | Public | All + anon | 0    | Job listings and company culture showcase   | JobList, CultureSection, ApplicationForm                  | None                                                      | No   | Live   |
| PG-004 | Contact           | `/contact`       | Public | All + anon | 0    | Support and sales contact form              | ContactForm, OfficeMap, FAQPreview                        | Resend (transactional email)                              | No   | Live   |
| PG-005 | Customers         | `/customers`     | Public | All + anon | 0    | Case studies and customer testimonials      | TestimonialGrid, CaseStudyCard, LogoWall                  | None                                                      | No   | Live   |
| PG-006 | CookiePolicy      | `/cookie-policy` | Public | All + anon | 0    | Cookie usage disclosure                     | PolicyContent, CookieTable                                | None                                                      | No   | Live   |
| PG-007 | GDPR              | `/gdpr`          | Public | All + anon | 0    | GDPR compliance and data rights             | PolicyContent, DataRightsForm                             | None                                                      | No   | Live   |
| PG-008 | Demo              | `/demo`          | Public | All + anon | 0    | Interactive product demo / booking form     | DemoVideo, CalendlyEmbed, FeatureWalkthrough              | None                                                      | No   | Live   |
| PG-009 | Pricing           | `/pricing`       | Public | All + anon | 0    | Tier comparison and plan selection          | PricingGrid, FeatureComparison, FAQAccordion, CTASection  | `subscription_plans` SELECT                               | No   | Live   |
| PG-010 | FAQ               | `/faq`           | Public | All + anon | 0    | Frequently asked questions                  | AccordionList, SearchBar, CategoryTabs                    | None                                                      | No   | Live   |
| PG-011 | Terms             | `/terms`         | Public | All + anon | 0    | Terms of service                            | PolicyContent                                             | None                                                      | No   | Live   |
| PG-012 | Privacy           | `/privacy`       | Public | All + anon | 0    | Privacy policy                              | PolicyContent                                             | None                                                      | No   | Live   |
| PG-013 | Login             | `/login`         | Public | All + anon | 0    | Authentication entry point (Supabase Auth)  | LoginForm, OAuthButtons, SignupLink                       | Supabase Auth (signInWithPassword, signInWithOAuth)       | No   | Live   |
| PG-014 | CreatorCalculator | `/calculator`    | Public | All + anon | 0    | Free creator earnings calculator (lead gen) | CalculatorForm, ResultsPanel, PlatformSelector, CTABanner | `rate_benchmarks` SELECT, `talent_revenue_streams` SELECT | No   | Live   |
| PG-015 | ForManagers       | `/for-managers`  | Public | All + anon | 0    | Manager-specific landing page               | ManagerFeatures, PricingPreview, TestimonialSlider        | None                                                      | No   | Live   |

## Public Feature Pages

| PG-ID  | Page Name                | URL Route                      | Module | User Roles | Tier | Purpose                                           | Key Components                                     | API Endpoints | Auth | Status |
| ------ | ------------------------ | ------------------------------ | ------ | ---------- | ---- | ------------------------------------------------- | -------------------------------------------------- | ------------- | ---- | ------ |
| PG-016 | FeatureTalentDiscovery   | `/features/talent-discovery`   | Public | All + anon | 0    | Feature marketing: talent discovery capabilities  | FeatureHero, ScreenshotGallery, BenefitGrid        | None          | No   | Live   |
| PG-017 | FeatureDealPipeline      | `/features/deal-pipeline`      | Public | All + anon | 0    | Feature marketing: deal pipeline management       | FeatureHero, PipelineDemo, ComparisonTable         | None          | No   | Live   |
| PG-018 | FeatureMediaKits         | `/features/media-kits`         | Public | All + anon | 0    | Feature marketing: AI media kit generation        | FeatureHero, MediaKitPreview, BeforeAfter          | None          | No   | Live   |
| PG-019 | FeaturePayments          | `/features/payments`           | Public | All + anon | 0    | Feature marketing: escrow payments and invoicing  | FeatureHero, PaymentFlowDiagram, SecurityBadges    | None          | No   | Live   |
| PG-020 | FeatureIntegrations      | `/features/integrations`       | Public | All + anon | 0    | Feature marketing: platform integrations          | FeatureHero, IntegrationGrid, APIPreview           | None          | No   | Live   |
| PG-021 | FeatureCampaignAnalytics | `/features/campaign-analytics` | Public | All + anon | 0    | Feature marketing: campaign performance analytics | FeatureHero, ChartPreview, MetricCards             | None          | No   | Live   |
| PG-022 | FeatureSendDeals         | `/features/send-deals`         | Public | All + anon | 0    | Feature marketing: outreach and deal sending      | FeatureHero, OutreachPreview, TemplateGallery      | None          | No   | Live   |
| PG-023 | FeatureManageDeals       | `/features/manage-deals`       | Public | All + anon | 0    | Feature marketing: deal lifecycle management      | FeatureHero, DealFlowDiagram, MilestoneTracker     | None          | No   | Live   |
| PG-024 | FeatureBrowseTalent      | `/features/browse-talent`      | Public | All + anon | 0    | Feature marketing: talent browsing and filtering  | FeatureHero, FilterDemo, TalentCardPreview         | None          | No   | Live   |
| PG-025 | FeatureManageTalent      | `/features/manage-talent`      | Public | All + anon | 0    | Feature marketing: talent roster management       | FeatureHero, RosterPreview, PerformanceDashPreview | None          | No   | Live   |

## Public Competitor Comparison Pages

| PG-ID  | Page Name        | URL Route       | Module | User Roles | Tier | Purpose                                | Key Components                                             | API Endpoints | Auth | Status |
| ------ | ---------------- | --------------- | ------ | ---------- | ---- | -------------------------------------- | ---------------------------------------------------------- | ------------- | ---- | ------ |
| PG-026 | CompareGrin      | `/vs-grin`      | Public | All + anon | 0    | SEO competitor comparison vs Grin      | ComparisonTable, FeatureDiff, PricingComparison, CTABanner | None          | No   | Live   |
| PG-027 | CompareAspire    | `/vs-aspire`    | Public | All + anon | 0    | SEO competitor comparison vs Aspire    | ComparisonTable, FeatureDiff, PricingComparison, CTABanner | None          | No   | Live   |
| PG-028 | CompareCreatorIQ | `/vs-creatoriq` | Public | All + anon | 0    | SEO competitor comparison vs CreatorIQ | ComparisonTable, FeatureDiff, PricingComparison, CTABanner | None          | No   | Live   |

## Utility Pages (Auth-Adjacent)

| PG-ID  | Page Name           | URL Route         | Module | User Roles | Tier | Purpose                                       | Key Components                                      | API Endpoints                                  | Auth | Status |
| ------ | ------------------- | ----------------- | ------ | ---------- | ---- | --------------------------------------------- | --------------------------------------------------- | ---------------------------------------------- | ---- | ------ |
| PG-029 | AuthCallback        | `/auth/callback`  | Core   | All        | 0    | OAuth redirect handler (Google, etc.)         | LoadingSpinner                                      | Supabase Auth (exchangeCodeForSession)         | No   | Live   |
| PG-030 | CheckEmail          | `/check-email`    | Core   | All        | 0    | Post-signup email verification prompt         | EmailIcon, ResendLink                               | Supabase Auth (resend)                         | No   | Live   |
| PG-031 | ResetPassword       | `/reset-password` | Core   | All        | 0    | Password reset flow                           | ResetForm, PasswordStrength                         | Supabase Auth (updateUser)                     | No   | Live   |
| PG-032 | PublicTalentProfile | `/talent/:id`     | Public | All + anon | 0    | Public-facing talent profile (shareable link) | ProfileHeader, SocialStats, RateCard, PortfolioGrid | `talents` SELECT, `connected_platforms` SELECT | No   | Live   |
| PG-033 | NotFound            | `/*` (catch-all)  | Core   | All        | 0    | 404 error page                                | ErrorIllustration, NavigationLinks                  | None                                           | No   | Live   |

## Free Authenticated Pages (Tier 0)

| PG-ID  | Page Name              | URL Route                 | Module        | User Roles                            | Tier | Purpose                                                                           | Key Components                                                              | API Endpoints                                                                                                                                                               | Auth | Status |
| ------ | ---------------------- | ------------------------- | ------------- | ------------------------------------- | ---- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| PG-034 | Dashboard              | `/Dashboard`              | Core          | talent, brand, agency, manager, admin | 0    | Role-adaptive home dashboard with KPIs, pipeline snapshot, recent activity        | StatCards, PipelineChart, ActivityFeed, QuickActions, AIInsightWidget       | `profiles` SELECT, `partnerships` SELECT, `activities` SELECT, `analytics_daily_snapshots` SELECT                                                                           | Yes  | Live   |
| PG-035 | Settings               | `/Settings`               | Core          | talent, brand, agency, manager, admin | 0    | Account settings: profile, notification prefs, connected accounts, billing        | ProfileForm, NotificationToggles, ConnectedAccountsList, DangerZone         | `profiles` UPDATE, `notification_preferences` UPSERT, `connected_accounts` SELECT                                                                                           | Yes  | Live   |
| PG-036 | Notifications          | `/Notifications`          | Core          | talent, brand, agency, manager, admin | 0    | In-app notification feed with read/unread and action links                        | NotificationList, FilterTabs, MarkAllRead, NotificationCard                 | `notifications` SELECT/UPDATE (TBL-029)                                                                                                                                     | Yes  | Live   |
| PG-037 | BillingHistory         | `/BillingHistory`         | Core          | talent, brand, agency, manager, admin | 0    | Invoice history, receipt downloads, payment status                                | InvoiceTable, ReceiptDownload, PaymentStatusBadge                           | `billing_history` SELECT (TBL-057), Stripe `getInvoices`                                                                                                                    | Yes  | Live   |
| PG-038 | SubscriptionManagement | `/SubscriptionManagement` | Core          | talent, brand, agency, manager, admin | 0    | Current plan, upgrade/downgrade, cancel, payment methods                          | PlanCard, UpgradeModal, PaymentMethodForm, UsageMeter                       | `user_subscriptions` SELECT (TBL-056), `subscription_plans` SELECT (TBL-055), Stripe `upgradeSubscription`, `getPaymentMethods`                                             | Yes  | Live   |
| PG-039 | Onboarding             | `/Onboarding`             | Core          | talent, brand, agency, manager, admin | 0    | Multi-step onboarding: role selection, profile setup, talent type, plan selection | StepWizard, RoleSelector, ProfileForm, TalentTypeGrid, PlanSelector         | `profiles` UPDATE, `talents` INSERT, `brands` INSERT                                                                                                                        | Yes  | Live   |
| PG-040 | Referrals              | `/Referrals`              | Collaboration | talent, brand, agency, manager, admin | 0    | Referral code sharing, tracking conversions, reward status                        | ReferralCodeCard, ShareButtons, ConversionFunnel, RewardTracker             | `referrals` SELECT/INSERT (TBL-059)                                                                                                                                         | Yes  | Live   |
| PG-041 | ConnectAccounts        | `/ConnectAccounts`        | Core          | talent, brand, agency, manager, admin | 0    | OAuth social account linking (YouTube, Instagram, etc.)                           | PlatformGrid, OAuthButton, VerificationStatus, DisconnectButton             | `connected_accounts` SELECT/INSERT/DELETE (TBL-012), `oauthConnect` edge fn                                                                                                 | Yes  | Live   |
| PG-042 | TalentProfile          | `/TalentProfile`          | Discovery     | talent, brand, agency, manager, admin | 0    | Detailed talent profile view with social stats, rates, past partnerships          | ProfileHeader, SocialMetrics, RateCard, PartnershipHistory, EnrichmentBadge | `talents` SELECT (TBL-003), `connected_platforms` SELECT (TBL-058), `enriched_creators` SELECT (TBL-014)                                                                    | Yes  | Live   |
| PG-043 | BrandDashboard         | `/BrandDashboard`         | Discovery     | talent, brand, agency, manager, admin | 0    | Brand detail view with contact info, signals, budget intel                        | BrandHeader, SignalFeed, BudgetCard, DecisionMakerList, ContactReveal       | `brands` SELECT (TBL-002), `brand_signals` SELECT (TBL-020), `brand_budget_intel` SELECT (TBL-021), `decision_makers` SELECT (TBL-008)                                      | Yes  | Live   |
| PG-044 | DealDetail             | `/DealDetail`             | Pipeline      | talent, brand, agency, manager, admin | 0    | Single partnership detail: timeline, notes, contracts, tasks, AI analysis         | DealTimeline, NotesFeed, ContractPanel, TaskList, AIInsights, StageSelector | `partnerships` SELECT/UPDATE (TBL-004), `deal_notes` SELECT/INSERT (TBL-027), `contracts` SELECT (TBL-031), `tasks` SELECT/INSERT (TBL-028), `deal_scores` SELECT (TBL-019) | Yes  | Live   |
| PG-045 | Approvals              | `/Approvals`              | Pipeline      | talent, brand, agency, manager, admin | 0    | Content approval workflow: review, approve, request revisions                     | ApprovalQueue, ReviewPanel, CommentThread, StatusBadge                      | `approval_items` SELECT/UPDATE (TBL-032)                                                                                                                                    | Yes  | Live   |
| PG-046 | AICommandCenter        | `/AICommandCenter`        | AI            | talent, brand, agency, manager, admin | 0    | Natural language AI queries about partnerships, brands, talent (5 free/mo)        | ChatInterface, QueryInput, ResponsePanel, UsageMeter, UpgradePrompt         | `aiCommandCenter` edge fn, `ai_usage` SELECT/UPSERT (TBL-009)                                                                                                               | Yes  | Live   |
| PG-047 | Marketplace            | `/Marketplace`            | Marketplace   | talent, brand, agency, manager, admin | 0    | Browse brand-posted opportunities; free users can view but not apply              | OpportunityGrid, FilterSidebar, OpportunityCard, ApplicationModal           | `marketplace_opportunities` SELECT (TBL-006), `opportunity_applications` SELECT/INSERT (TBL-007)                                                                            | Yes  | Live   |
| PG-048 | Brands                 | `/Brands`                 | Discovery     | talent, brand, agency, manager, admin | 0    | Searchable brand directory with industry filters (1,200+ brands)                  | BrandGrid, SearchBar, IndustryFilter, BrandCard, QuickView                  | `brands` SELECT (TBL-002)                                                                                                                                                   | Yes  | Live   |

## Tier 1 Pages (Core Workflow)

| PG-ID  | Page Name              | URL Route                 | Module       | User Roles                            | Tier | Purpose                                                                            | Key Components                                                                | API Endpoints                                                                                                                                                | Auth | Status |
| ------ | ---------------------- | ------------------------- | ------------ | ------------------------------------- | ---- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| PG-049 | Partnerships           | `/Partnerships`           | Pipeline     | talent, brand, agency, manager, admin | 1    | Full deal pipeline: kanban board with 10-stage funnel, drag-and-drop, bulk actions | KanbanBoard, StageColumns, DealCard, BulkActions, FilterBar, PipelineStats    | `partnerships` CRUD (TBL-004), `partnership_stage_history` INSERT (TBL-065), `activities` INSERT (TBL-005)                                                   | Yes  | Live   |
| PG-050 | ContractTemplates      | `/ContractTemplates`      | Pipeline     | talent, brand, agency, manager, admin | 1    | Pre-built contract templates for common deal types; customizable clauses           | TemplateGrid, TemplateEditor, ClauseLibrary, PreviewPanel                     | `contracts` SELECT/INSERT (TBL-031)                                                                                                                          | Yes  | Live   |
| PG-051 | MasterCalendar         | `/MasterCalendar`         | Intelligence | talent, brand, agency, manager, admin | 1    | Unified calendar: deal milestones, culture events, industry events, tasks          | CalendarView, EventOverlay, FilterPanel, EventDetail                          | `culture_events` SELECT (TBL-045), `mega_events` SELECT (TBL-046), `conferences` SELECT (TBL-047), `tasks` SELECT (TBL-028), `partnerships` SELECT (TBL-004) | Yes  | Live   |
| PG-052 | CultureCalendar        | `/CultureCalendar`        | Intelligence | talent, brand, agency, manager, admin | 1    | Cultural moments calendar for campaign timing (holidays, heritage months)          | CalendarGrid, EventCard, CategoryFilter, CampaignSuggestions                  | `culture_events` SELECT (TBL-045)                                                                                                                            | Yes  | Live   |
| PG-053 | CreateOpportunity      | `/CreateOpportunity`      | Marketplace  | talent, brand, agency, manager, admin | 1    | Post brand campaign opportunities to the marketplace                               | OpportunityForm, BudgetRange, NicheSelector, DeliverableBuilder, PreviewPanel | `marketplace_opportunities` INSERT (TBL-006)                                                                                                                 | Yes  | Live   |
| PG-054 | TalentDiscovery        | `/TalentDiscovery`        | Discovery    | talent, brand, agency, manager, admin | 1    | Advanced talent search with 20+ filters across 140+ talent types                   | SearchInterface, FilterPanel, TalentGrid, TalentCard, SavedSearches           | `talents` SELECT (TBL-003), `talent_types` SELECT (TBL-042), `match_scores` SELECT (TBL-018)                                                                 | Yes  | Live   |
| PG-055 | MatchEngine            | `/MatchEngine`            | Discovery    | talent, brand, agency, manager, admin | 1    | AI-powered creator-brand matching with score breakdown                             | MatchForm, MatchResultsList, ScoreBreakdown, ComparePanel                     | `scoreMatch` edge fn, `match_scores` SELECT/UPSERT (TBL-018)                                                                                                 | Yes  | Live   |
| PG-056 | ContactFinder          | `/ContactFinder`          | Discovery    | talent, brand, agency, manager, admin | 1    | Search and reveal brand decision-maker contacts (powered by GMO)                   | ContactSearch, ContactCard, EmailReveal, PhoneReveal, ExportButton            | `decision_makers` SELECT (TBL-008), `gmoFindContacts` edge fn                                                                                                | Yes  | Live   |
| PG-057 | Outreach               | `/Outreach`               | Outreach     | talent, brand, agency, manager, admin | 1    | Email outreach management: compose, send, track opens/replies                      | OutreachDashboard, ComposeModal, EmailList, MetricsBar                        | `outreach_emails` CRUD (TBL-024), `generateAIOutreach` edge fn                                                                                               | Yes  | Live   |
| PG-058 | TalentAnalytics        | `/TalentAnalytics`        | Analytics    | talent, brand, agency, manager, admin | 1    | Talent performance metrics: engagement trends, deal history, revenue               | PerformanceChart, DealHistory, RevenueBreakdown, PlatformComparison           | `talents` SELECT (TBL-003), `partnerships` SELECT (TBL-004), `connected_platforms` SELECT (TBL-058)                                                          | Yes  | Live   |
| PG-059 | CampaignBriefGenerator | `/CampaignBriefGenerator` | Outreach     | talent, brand, agency, manager, admin | 1    | AI-generated campaign briefs from brand + talent context                           | BriefForm, GeneratedBrief, EditPanel, DownloadButton                          | `generateAICampaign` edge fn                                                                                                                                 | Yes  | Live   |
| PG-060 | TalentRevenue          | `/TalentRevenue`          | Analytics    | talent, brand, agency, manager, admin | 1    | Revenue stream analysis across talent types with rate benchmarks                   | RevenueMatrix, StreamBreakdown, TierComparison, RateBenchmarkChart            | `talent_revenue_streams` SELECT (TBL-043), `talent_revenue_matrix` SELECT (TBL-044), `rate_benchmarks` SELECT (TBL-050)                                      | Yes  | Live   |
| PG-061 | DealScoreLeaderboard   | `/DealScoreLeaderboard`   | Pipeline     | talent, brand, agency, manager, admin | 1    | Ranked deal scores with factor breakdown and improvement tips                      | LeaderboardTable, ScoreCard, FactorBreakdown, TipsList                        | `deal_scores` SELECT (TBL-019), `scoreDealLeaderboard` edge fn                                                                                               | Yes  | Live   |
| PG-062 | PitchDeckBuilder       | `/PitchDeckBuilder`       | Content      | talent, brand, agency, manager, admin | 1    | AI-personalized pitch deck generator from partnership context                      | DeckWizard, SlideEditor, BrandingPanel, PreviewMode, DownloadPDF              | `personalizePitchDeck` edge fn, `deck_library` INSERT (TBL-037)                                                                                              | Yes  | Live   |
| PG-063 | DeckLibrary            | `/DeckLibrary`            | Content      | talent, brand, agency, manager, admin | 1    | Saved pitch decks and media kits with template management                          | DeckGrid, DeckCard, TemplateFilter, ShareLink, DeleteConfirm                  | `deck_library` CRUD (TBL-037)                                                                                                                                | Yes  | Live   |
| PG-064 | AIAgentsHub            | `/AIAgentsHub`            | AI           | talent, brand, agency, manager, admin | 1    | Central hub for all 28 AI agents; run individually or as chains (T1: 1 agent)      | AgentGrid, AgentCard, ChainBuilder, ExecutionPanel, ResultViewer              | `runAgentChain` edge fn, `runBulkAgentOps` edge fn, all `analyze*`/`predict*` edge fns, `ai_usage` UPSERT (TBL-009)                                          | Yes  | Live   |
| PG-065 | CreatorCalculator      | `/CreatorCalculator`      | Discovery    | talent, brand, agency, manager, admin | 1    | Creator rate calculator with platform-specific multipliers                         | CalculatorForm, ResultsPanel, PlatformMultipliers, SaveEstimate               | `rate_benchmarks` SELECT (TBL-050), `platform_multipliers` SELECT (TBL-052), `category_premiums` SELECT (TBL-053)                                            | Yes  | Live   |

## Tier 2 Pages (Competitive Advantage)

| PG-ID  | Page Name            | URL Route               | Module        | User Roles                            | Tier | Purpose                                                                        | Key Components                                                         | API Endpoints                                                                                                      | Auth | Status |
| ------ | -------------------- | ----------------------- | ------------- | ------------------------------------- | ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- | ------ |
| PG-066 | SequenceBuilder      | `/SequenceBuilder`      | Outreach      | talent, brand, agency, manager, admin | 2    | Multi-step automated outreach sequence designer with A/B testing               | SequenceCanvas, StepEditor, DelayConfig, ABTestPanel, PerformanceChart | `outreach_sequences` CRUD (TBL-025), `outreach_emails` INSERT (TBL-024), `generateAIOutreach` edge fn              | Yes  | Live   |
| PG-067 | WarmIntroNetwork     | `/WarmIntroNetwork`     | Collaboration | talent, brand, agency, manager, admin | 2    | Warm introduction network: find mutual connections to brands                   | NetworkGraph, ConnectionCard, IntroRequestForm, MutualConnectionList   | `partnerships` SELECT (TBL-004), `decision_makers` SELECT (TBL-008)                                                | Yes  | Live   |
| PG-068 | DemographicTargeting | `/DemographicTargeting` | Discovery     | talent, brand, agency, manager, admin | 2    | Audience demographic targeting with pre-built segments                         | SegmentGrid, SegmentBuilder, AudienceOverlapChart, TargetingPreview    | `demographic_segments` SELECT (TBL-048), `analyzeAudienceOverlap` edge fn                                          | Yes  | Live   |
| PG-069 | DealAnalytics        | `/DealAnalytics`        | Analytics     | talent, brand, agency, manager, admin | 2    | Deal pipeline analytics: conversion rates, velocity, win/loss analysis         | ConversionFunnel, VelocityChart, WinLossBreakdown, TrendLine           | `partnerships` SELECT (TBL-004), `partnership_stage_history` SELECT (TBL-065), `analyzeDealPatterns` edge fn       | Yes  | Live   |
| PG-070 | DealComparison       | `/DealComparison`       | Pipeline      | talent, brand, agency, manager, admin | 2    | Side-by-side deal comparison with scoring breakdown                            | ComparisonTable, DealSelector, ScoreDiff, RecommendationPanel          | `partnerships` SELECT (TBL-004), `deal_scores` SELECT (TBL-019), `match_scores` SELECT (TBL-018)                   | Yes  | Live   |
| PG-071 | BundleDeals          | `/BundleDeals`          | Pipeline      | talent, brand, agency, manager, admin | 2    | Multi-talent campaign bundles with aggregate pricing                           | BundleBuilder, TalentSelector, BudgetAllocator, BundleCard             | `bundle_deals` CRUD (TBL-034), `partnerships` SELECT (TBL-004)                                                     | Yes  | Live   |
| PG-072 | MarketIntelligence   | `/MarketIntelligence`   | Intelligence  | talent, brand, agency, manager, admin | 2    | Real-time brand signals, hiring alerts, funding rounds, competitor moves       | SignalFeed, SignalCard, StrengthFilter, TrendChart, AlertConfig        | `brand_signals` SELECT (TBL-020), `brand_budget_intel` SELECT (TBL-021), `analyzeCompetitorIntelligence` edge fn   | Yes  | Live   |
| PG-073 | IndustryEvents       | `/IndustryEvents`       | Intelligence  | talent, brand, agency, manager, admin | 2    | Industry events with brand sponsor mapping and partnership timing              | EventCalendar, EventCard, SponsorList, TimingRecommendation            | `industry_events` SELECT (TBL-022), `brand_event_sponsors` SELECT (TBL-023), `conferences` SELECT (TBL-047)        | Yes  | Live   |
| PG-074 | PitchCompetition     | `/PitchCompetition`     | Marketplace   | talent, brand, agency, manager, admin | 2    | Brand-sponsored pitch competitions with submission and judging                 | CompetitionList, SubmissionForm, JudgingPanel, WinnerAnnouncement      | `pitch_competitions` CRUD (TBL-038)                                                                                | Yes  | Live   |
| PG-075 | BrandSpendPrediction | `/BrandSpendPrediction` | Intelligence  | talent, brand, agency, manager, admin | 2    | AI-predicted brand spending patterns and optimal outreach timing               | SpendChart, SeasonalityMap, TimingRecommendation, ConfidenceScore      | `brand_budget_intel` SELECT (TBL-021), `brand_signals` SELECT (TBL-020), `forecastRevenue` edge fn                 | Yes  | Live   |
| PG-076 | SimulationEngine     | `/SimulationEngine`     | AI            | talent, brand, agency, manager, admin | 2    | What-if scenario simulator: add/remove creators, change budgets, market shifts | ScenarioBuilder, SimulationResults, ImpactChart, CompareScenarios      | `simulatePartnership` edge fn, `partnerships` SELECT (TBL-004), `talents` SELECT (TBL-003)                         | Yes  | Live   |
| PG-077 | Analytics            | `/Analytics`            | Analytics     | talent, brand, agency, manager, admin | 2    | Cross-platform analytics dashboard with trend analysis                         | MetricCards, TrendCharts, PlatformBreakdown, DateRangePicker           | `analytics_daily_snapshots` SELECT (TBL-066), `partnerships` SELECT (TBL-004), `outreach_metrics` SELECT (TBL-026) | Yes  | Live   |
| PG-078 | EventManagement      | `/EventManagement`      | Intelligence  | talent, brand, agency, manager, admin | 2    | Manage event attendance, sponsorship tracking, partnership opportunities       | EventList, AttendeeTracker, SponsorshipForm, ROICalculator             | `industry_events` SELECT (TBL-022), `brand_event_sponsors` CRUD (TBL-023), `mega_events` SELECT (TBL-046)          | Yes  | Live   |
| PG-079 | TalentDataRoom       | `/TalentDataRoom`       | Content       | talent, brand, agency, manager, admin | 2    | Private talent data room: past deals, case studies, performance proof          | DataRoomDashboard, EntryForm, AccessControl, NDAWidget, ShareLink      | `data_room_entries` CRUD (TBL-039, room_type='talent'), `data_room_access` CRUD (TBL-040)                          | Yes  | Live   |
| PG-080 | BrandDataRoom        | `/BrandDataRoom`        | Content       | talent, brand, agency, manager, admin | 2    | Private brand data room: campaign results, creator portfolios                  | DataRoomDashboard, EntryForm, AccessControl, NDAWidget, ShareLink      | `data_room_entries` CRUD (TBL-039, room_type='brand'), `data_room_access` CRUD (TBL-040)                           | Yes  | Live   |
| PG-081 | AgencyDataRoom       | `/AgencyDataRoom`       | Content       | talent, brand, agency, manager, admin | 2    | Private agency data room: roster performance, client case studies              | DataRoomDashboard, EntryForm, AccessControl, NDAWidget, ShareLink      | `data_room_entries` CRUD (TBL-039, room_type='agency'), `data_room_access` CRUD (TBL-040)                          | Yes  | Live   |

## Tier 3 Pages (Enterprise Scale)

| PG-ID  | Page Name        | URL Route           | Module        | User Roles                            | Tier | Purpose                                                         | Key Components                                                             | API Endpoints                                                                                       | Auth | Status |
| ------ | ---------------- | ------------------- | ------------- | ------------------------------------- | ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---- | ------ |
| PG-082 | Teams            | `/Teams`            | Collaboration | talent, brand, agency, manager, admin | 3    | Multi-user team management with role-based member access        | TeamDashboard, MemberList, InviteForm, RoleSelector, ActivityLog           | `teams` CRUD (TBL-060), `team_members` CRUD (TBL-061)                                               | Yes  | Live   |
| PG-083 | CustomReports    | `/CustomReports`    | Analytics     | talent, brand, agency, manager, admin | 3    | Custom report builder with drag-and-drop metrics and scheduling | ReportBuilder, MetricPicker, ChartConfigurator, ScheduleForm, ExportButton | `analytics_daily_snapshots` SELECT (TBL-066), `partnerships` SELECT (TBL-004), all analytics tables | Yes  | Live   |
| PG-084 | Integrations     | `/Integrations`     | Core          | talent, brand, agency, manager, admin | 3    | Third-party integration management (CRM, email, social APIs)    | IntegrationGrid, ConfigPanel, WebhookManager, SyncStatus                   | `connected_accounts` CRUD (TBL-012), `email_connections` CRUD (TBL-030), `manageWebhooks` edge fn   | Yes  | Live   |
| PG-085 | DataImportExport | `/DataImportExport` | Core          | talent, brand, agency, manager, admin | 3    | Bulk CSV/JSON import and export of all entity data              | ImportWizard, ColumnMapper, ExportSelector, ProgressBar, ValidationReport  | `importEntityData` edge fn, `exportEntityData` edge fn                                              | Yes  | Live   |
| PG-086 | AIFeatures       | `/AIFeatures`       | AI            | talent, brand, agency, manager, admin | 3    | Advanced AI feature showcase and configuration panel            | FeatureGrid, ConfigPanel, UsageChart, ModelSelector                        | All AI edge functions, `ai_usage_logs` SELECT (TBL-011)                                             | Yes  | Live   |
| PG-087 | PlatformOverview | `/PlatformOverview` | Core          | talent, brand, agency, manager, admin | 3    | Complete platform architecture and system documentation view    | ArchitectureDiagram, EntityRelationships, APIDocumentation, SystemStats    | `profiles` SELECT count, `partnerships` SELECT count, `brands` SELECT count                         | Yes  | Live   |

## Admin-Only Pages

| PG-ID  | Page Name          | URL Route             | Module | User Roles | Tier | Purpose                                                                         | Key Components                                                              | API Endpoints                                                                                                  | Auth | Status |
| ------ | ------------------ | --------------------- | ------ | ---------- | ---- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---- | ------ |
| PG-088 | AdminDashboard     | `/AdminDashboard`     | Admin  | admin      | 0    | Platform-wide metrics: users, revenue, pipeline, system health                  | GlobalStatCards, UserGrowthChart, RevenueChart, ActiveUserMap, SystemAlerts | All tables (service-role), Stripe dashboard data                                                               | Yes  | Live   |
| PG-089 | AdminDataManager   | `/AdminDataManager`   | Admin  | admin      | 0    | Bulk data operations: populate brands, contacts, intel; run enrichment          | PopulateBrandsButton, PopulateContactsButton, EnrichmentRunner, DataStats   | `populateBrands` edge fn, `populateContacts` edge fn, `gmoEnrichCompany` edge fn, `refreshEnrichments` edge fn | Yes  | Live   |
| PG-090 | SystemHealth       | `/SystemHealth`       | Admin  | admin      | 0    | Real-time system monitoring: edge function latency, DB connections, error rates | HealthGrid, LatencyChart, ErrorLog, FunctionStatus, QueueDepth              | `ai_usage_logs` SELECT (TBL-011), `crawl_jobs` SELECT (TBL-016), Supabase management API                       | Yes  | Live   |
| PG-091 | AIAnalytics        | `/AIAnalytics`        | Admin  | admin      | 0    | AI system analytics: model usage, cost tracking, provider performance           | CostChart, ModelBreakdown, ProviderComparison, LatencyHistogram, TokenUsage | `ai_usage_logs` SELECT (TBL-011), `ai_rate_limits` SELECT (TBL-010)                                            | Yes  | Live   |
| PG-092 | SystemArchitecture | `/SystemArchitecture` | Admin  | admin      | 0    | Interactive system architecture diagram with service dependencies               | ArchitectureDiagram, ServiceGraph, DependencyTree, DeploymentInfo           | None (static + `ai_usage_logs` SELECT for live stats)                                                          | Yes  | Live   |

## Manager-Only Pages

| PG-ID  | Page Name      | URL Route         | Module  | User Roles     | Tier | Purpose                                                                  | Key Components                                                           | API Endpoints                                                                          | Auth | Status |
| ------ | -------------- | ----------------- | ------- | -------------- | ---- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---- | ------ |
| PG-093 | ManagerSetup   | `/ManagerSetup`   | Manager | manager, admin | 0    | Manager onboarding: verification, talent roster setup, commission config | VerificationUpload, RosterBuilder, CommissionConfig, InviteCodeGenerator | `profiles` UPDATE (manager fields), `talents` INSERT (created_by_manager)              | Yes  | Live   |
| PG-094 | ManagerProfile | `/ManagerProfile` | Manager | manager, admin | 0    | Manager profile view: roster overview, commission tracking, performance  | RosterGrid, CommissionSummary, PerformanceMetrics, TalentInviteLink      | `profiles` SELECT, `talents` SELECT (created_by_manager filter), `partnerships` SELECT | Yes  | Live   |

### Page Count Summary

| Category                       | Count  | PG-ID Range          |
| ------------------------------ | ------ | -------------------- |
| Public Marketing               | 15     | PG-001 to PG-015     |
| Public Feature                 | 10     | PG-016 to PG-025     |
| Public Competitor              | 3      | PG-026 to PG-028     |
| Utility (Auth-Adjacent)        | 5      | PG-029 to PG-033     |
| Free Authenticated (Tier 0)    | 15     | PG-034 to PG-048     |
| Tier 1 (Core Workflow)         | 17     | PG-049 to PG-065     |
| Tier 2 (Competitive Advantage) | 16     | PG-066 to PG-081     |
| Tier 3 (Enterprise Scale)      | 6      | PG-082 to PG-087     |
| Admin-Only                     | 5      | PG-088 to PG-092     |
| Manager-Only                   | 2      | PG-093 to PG-094     |
| **Total**                      | **94** | **PG-001 to PG-094** |

---

# DELIVERABLE 6: API INTEGRATIONS REGISTRY

## Overview

DealStage depends on 12 external services. All credentials are stored as Supabase Edge Function environment variables (never client-side). The platform follows a primary-with-fallback pattern for AI providers and a single-provider pattern for infrastructure services.

### Cost Model

All cost estimates are at projected Year 1 scale (5,000 users, 25,000 partnerships, 500K AI requests/year).

---

## Integration Registry

| API-ID  | Service                         | Purpose                                                                                                    | Auth Method                                   | Rate Limits                                                           | Fallback                                                                                       | Est Monthly Cost                        | Blast Radius                                                                                                                   |
| ------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| API-001 | **Supabase** (Database)         | PostgreSQL database: 68 tables, RLS, triggers, RPC functions                                               | Service-role key (server), anon key (client)  | Pro plan: 500 concurrent connections, 8GB RAM, 100GB storage          | None (single DB)                                                                               | $25 (Pro plan)                          | **CRITICAL** -- Total platform outage. All reads/writes fail. Auth stops.                                                      |
| API-002 | **Supabase** (Auth)             | User authentication: email/password, Google OAuth, magic links, password reset                             | Anon key + PKCE flow                          | 30 signup/hr per IP (configurable)                                    | None                                                                                           | Included in API-001                     | **CRITICAL** -- No logins. Existing sessions continue until JWT expires (1hr).                                                 |
| API-003 | **Supabase** (Edge Functions)   | 50+ Deno edge functions: AI agents, enrichment, payments, data ops                                         | Bearer token (user JWT) or service-role key   | 500K invocations/mo (Pro), 60s timeout per invocation                 | None (functions are the compute layer)                                                         | Included in API-001                     | **HIGH** -- AI features, enrichment, and payment processing fail. CRUD via client SDK still works.                             |
| API-004 | **Supabase** (Storage)          | File storage: pitch decks, contracts, verification files, avatars                                          | Signed URLs via service-role                  | 100GB storage (Pro), 250GB bandwidth/mo                               | None                                                                                           | Included in API-001                     | **MEDIUM** -- File uploads/downloads fail. Core deal pipeline still functional.                                                |
| API-005 | **Supabase** (Realtime)         | Live subscriptions: notifications, pipeline updates, activity feed                                         | WebSocket via anon key                        | 500 concurrent connections (Pro)                                      | Polling fallback in `useRealtimeSync` hook                                                     | Included in API-001                     | **LOW** -- UI updates lag. Manual refresh still works.                                                                         |
| API-006 | **Stripe** (Payments)           | Subscription billing, payment method management, invoicing                                                 | Secret key (server), publishable key (client) | 100 reads/sec, 25 writes/sec                                          | None (sole payment processor)                                                                  | ~$0 base + 2.9% + $0.30 per txn         | **HIGH** -- New signups cannot pay. Existing subscriptions continue (Stripe-side). Webhook delivery queues for 72hr.           |
| API-007 | **Stripe** (Webhooks)           | Inbound events: checkout.session.completed, invoice.paid, customer.subscription.updated/deleted            | Webhook signing secret                        | Events retried for 72hr on failure                                    | `handleStripeWebhook` logs failures to `audit_logs` (TBL-064)                                  | Included in API-006                     | **HIGH** -- Plan upgrades/downgrades not reflected in DB until webhook processed.                                              |
| API-008 | **OpenAI** (GPT-4o-mini)        | Volume AI workload: match scoring, outreach drafting, campaign briefs, most analyze\* agents               | API key (Bearer token)                        | Tier 4: 10K RPM, 10M TPM                                              | Falls back to DeepSeek (API-011), then Groq (API-012)                                          | ~$200-400 (at ~400K requests/mo)        | **MEDIUM** -- AI features degrade to fallback models. Latency may increase. Quality slightly lower.                            |
| API-009 | **Anthropic** (Claude Sonnet 4) | Premium AI workload: contract intelligence, negotiation coaching, compliance analysis, executive briefings | API key (x-api-key header)                    | Tier 3: 4K RPM, 400K input TPM                                        | Falls back to GPT-4o-mini (API-008)                                                            | ~$100-250 (at ~50K premium requests/mo) | **MEDIUM** -- Premium AI features fall back to GPT-4o-mini. Slightly lower quality on complex reasoning tasks.                 |
| API-010 | **GrowMeOrganic** (GMO)         | Contact enrichment: find decision-maker emails/phones by name + company domain; company data enrichment    | API key (query param)                         | 10K lookups/mo (plan-dependent)                                       | Manual fallback: users can input contacts directly                                             | ~$99-299/mo (plan-dependent)            | **MEDIUM** -- Contact Finder returns no new results. Existing 44K+ contacts in DB still accessible.                            |
| API-011 | **DeepSeek**                    | AI fallback provider #1: cost-effective alternative for volume AI tasks                                    | API key (Bearer token)                        | 1K RPM                                                                | Falls back to Groq (API-012), then Google Gemini (API-013)                                     | ~$20-50 (fallback usage only)           | **LOW** -- Only used when OpenAI is down. If also down, Groq takes over.                                                       |
| API-012 | **Groq**                        | AI fallback provider #2: ultra-fast inference for latency-sensitive tasks                                  | API key (Bearer token)                        | 30 RPM (free), 6K RPM (paid)                                          | Falls back to Google Gemini (API-013)                                                          | ~$0-20 (fallback usage only)            | **LOW** -- Only activated in multi-provider failure scenario.                                                                  |
| API-013 | **Google Gemini**               | AI fallback provider #3: last-resort AI provider                                                           | API key                                       | 15 RPM (free), 360 RPM (paid)                                         | None (last in chain)                                                                           | ~$0-10 (emergency fallback only)        | **LOW** -- Terminal fallback. If Gemini also fails, AI features show "temporarily unavailable" message.                        |
| API-014 | **Crawl4AI on Railway**         | Web crawling: creator profile enrichment, brand website enrichment, deal verification                      | Internal service token (Railway env)          | Self-hosted: limited by Railway container resources (1 vCPU, 1GB RAM) | Graceful degradation: enrichment jobs marked as `failed` in `crawl_jobs` (TBL-016), retried 3x | ~$5-20 (Railway Hobby/Pro)              | **MEDIUM** -- Enrichment pipeline halts. Existing enriched data (TBL-014, TBL-015) still serves. New profiles lack enrichment. |
| API-015 | **Resend**                      | Transactional email: trial welcome emails, password reset, outreach sending                                | API key (Bearer token)                        | 100 emails/day (free), 50K/mo (Pro)                                   | None (emails queue and retry)                                                                  | ~$0-20                                  | **MEDIUM** -- Trial emails delayed. Password reset emails fail. Users can still log in via OAuth.                              |
| API-016 | **Vercel** (Hosting)            | Frontend hosting: Vite+React SPA, CDN, edge network, preview deployments                                   | Deploy token (CI/CD)                          | Pro plan: 100GB bandwidth, 1000 serverless fn executions/day          | None (sole hosting provider)                                                                   | ~$20 (Pro)                              | **CRITICAL** -- Site completely unreachable. No frontend served.                                                               |
| API-017 | **Google OAuth**                | YouTube channel verification for talent; Google sign-in                                                    | OAuth 2.0 client ID + secret                  | 10K token refreshes/day                                               | Email/password auth as fallback for sign-in; no fallback for YouTube verification              | $0                                      | **LOW** -- YouTube verification unavailable. Google sign-in fails but email/password still works.                              |
| API-018 | **Sentry**                      | Error monitoring: frontend exception capture, performance tracing                                          | DSN (client-side)                             | 5K errors/mo (free), 50K (Team)                                       | None (errors go untracked)                                                                     | ~$0-26                                  | **NONE** -- Monitoring blindness only. No user-facing impact.                                                                  |

## AI Provider Routing

The AI routing strategy follows a priority chain managed by each edge function individually (there is no centralized ai-router function). Each AI edge function implements its own provider selection:

```
Primary Request Flow:
  1. Check user tier -> determine model allocation
  2. Free/Tier 1 -> GPT-4o-mini (API-008)
  3. Tier 2/3 premium agents -> Claude Sonnet 4 (API-009)
  4. On primary failure -> DeepSeek (API-011)
  5. On DeepSeek failure -> Groq (API-012)
  6. On Groq failure -> Gemini (API-013)
  7. All fail -> return error with "AI temporarily unavailable"
```

| Model           | Use Case                                                         | Input Cost       | Output Cost      | Avg Latency |
| --------------- | ---------------------------------------------------------------- | ---------------- | ---------------- | ----------- |
| GPT-4o-mini     | Volume: matching, outreach, briefs, most analytics               | $0.15/1M tokens  | $0.60/1M tokens  | 800ms-2s    |
| Claude Sonnet 4 | Premium: contracts, negotiation, compliance, executive briefings | $3/1M tokens     | $15/1M tokens    | 1.5-4s      |
| DeepSeek        | Fallback #1                                                      | ~$0.14/1M tokens | ~$0.28/1M tokens | 1-3s        |
| Groq (Llama)    | Fallback #2 (speed)                                              | $0.05/1M tokens  | $0.08/1M tokens  | 200-500ms   |
| Gemini Flash    | Fallback #3 (last resort)                                        | $0.075/1M tokens | $0.30/1M tokens  | 500ms-1.5s  |

## Webhook Registry

### Inbound Webhooks (DealStage Receives)

| Webhook ID | Source | Event                           | Handler               | Target Table(s)                                             | Description                                                                    |
| ---------- | ------ | ------------------------------- | --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| WH-IN-001  | Stripe | `checkout.session.completed`    | `handleStripeWebhook` | `profiles` (TBL-001), `user_subscriptions` (TBL-056)        | User completed payment; update plan in profiles and create subscription record |
| WH-IN-002  | Stripe | `invoice.paid`                  | `handleStripeWebhook` | `billing_history` (TBL-057)                                 | Recurring payment succeeded; log invoice to billing history                    |
| WH-IN-003  | Stripe | `invoice.payment_failed`        | `handleStripeWebhook` | `billing_history` (TBL-057), `user_subscriptions` (TBL-056) | Payment failed; mark subscription as past_due, log failed invoice              |
| WH-IN-004  | Stripe | `customer.subscription.updated` | `handleStripeWebhook` | `user_subscriptions` (TBL-056), `profiles` (TBL-001)        | Plan changed (upgrade/downgrade); sync new plan to profiles                    |
| WH-IN-005  | Stripe | `customer.subscription.deleted` | `handleStripeWebhook` | `user_subscriptions` (TBL-056), `profiles` (TBL-001)        | Subscription cancelled; revert profile to free plan                            |

### Outbound Webhooks (DealStage Sends)

Managed via the `manageWebhooks` edge function. Users on Tier 3 can register webhook URLs to receive events.

| Webhook ID | Event                  | Trigger                                           | Payload Schema                                                                     | Target Audience     |
| ---------- | ---------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------- |
| WH-OUT-001 | `user.created`         | New user completes signup                         | `{ user_id, email, role, created_at }`                                             | Tier 3 integrations |
| WH-OUT-002 | `deal.created`         | New partnership created                           | `{ partnership_id, brand_name, talent_name, status, deal_value, created_by }`      | Tier 3 integrations |
| WH-OUT-003 | `deal.stage_changed`   | Partnership status transitions                    | `{ partnership_id, from_status, to_status, changed_by, timestamp }`                | Tier 3 integrations |
| WH-OUT-004 | `deal.signed`          | Contract signed by both parties                   | `{ partnership_id, contract_id, brand_name, talent_name, total_value, signed_at }` | Tier 3 integrations |
| WH-OUT-005 | `payment.completed`    | Escrow payment released                           | `{ partnership_id, escrow_id, amount, currency, released_at }`                     | Tier 3 integrations |
| WH-OUT-006 | `contact.enriched`     | GMO enrichment completed for a contact            | `{ decision_maker_id, brand_id, email_found, phone_found }`                        | Tier 3 integrations |
| WH-OUT-007 | `enrichment.completed` | Creator or brand enrichment via Crawl4AI finished | `{ crawl_job_id, user_id, job_type, status }`                                      | Tier 3 integrations |
| WH-OUT-008 | `subscription.changed` | User upgraded or downgraded plan                  | `{ user_id, old_plan, new_plan, effective_at }`                                    | Tier 3 integrations |

### Monthly Cost Summary

| Service                            | Monthly Cost   | % of Total |
| ---------------------------------- | -------------- | ---------- |
| Supabase (all)                     | $25            | 4%         |
| Stripe (platform fees)             | ~$0            | 0%         |
| OpenAI                             | $200-400       | 45%        |
| Anthropic                          | $100-250       | 25%        |
| GrowMeOrganic                      | $99-299        | 18%        |
| Railway (Crawl4AI)                 | $5-20          | 2%         |
| Resend                             | $0-20          | 2%         |
| Vercel                             | $20            | 3%         |
| Fallback AI (DeepSeek+Groq+Gemini) | $20-80         | 5%         |
| Sentry                             | $0-26          | 2%         |
| **Total**                          | **$470-1,140** | **100%**   |

---

# DELIVERABLE 7: AI AGENT REGISTRY

## Overview

DealStage runs 29 AI agents as Supabase Edge Functions (Deno runtime). Agents are invokable individually from their respective pages or orchestrated in chains via the `runAgentChain` function from the AIAgentsHub (PG-064). AI usage is metered per-user via `ai_usage` (TBL-009) and `ai_rate_limits` (TBL-010), with detailed telemetry in `ai_usage_logs` (TBL-011).

### Agent Categories

| Category           | Count | Description                                                                              |
| ------------------ | ----- | ---------------------------------------------------------------------------------------- |
| Intelligence       | 8     | Competitor, trend, brand safety, compliance, relationship, audience, attribution, roster |
| Deal Management    | 5     | Deal patterns, contract intel, negotiation, success prediction, deal scoring             |
| Content Generation | 4     | Campaign briefs, outreach emails, creative direction, pitch decks                        |
| Matching & Scoring | 2     | Creator-brand matching, match scoring                                                    |
| Enrichment         | 2     | Creator enrichment (Crawl4AI), brand enrichment (Crawl4AI)                               |
| Forecasting        | 4     | Revenue, talent value trajectory, partnership success, outreach conversion               |
| Analytics          | 3     | Performance benchmarking, success factors, invoice reconciliation                        |
| Orchestration      | 1     | Natural language command center (routes to data, not to other agents)                    |

### Rate Limits by Tier

| Tier   | Monthly AI Queries | Agent Chains                | Premium Model Access  |
| ------ | ------------------ | --------------------------- | --------------------- |
| Free   | 5                  | None                        | No                    |
| Tier 1 | 50                 | 1 agent (no chains)         | No                    |
| Tier 2 | Unlimited          | 3-agent chains              | Yes (Claude Sonnet 4) |
| Tier 3 | Unlimited          | Unlimited chains + bulk ops | Yes (Claude Sonnet 4) |

---

## Agent Registry

### Category: Orchestration

| AGT-ID  | Name              | Function          | Purpose                                                                                                                                              | Input               | Output                                                            | Model       | Confidence Threshold | Fallback Chain           | Est Monthly Cost |
| ------- | ----------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- | ----------- | -------------------- | ------------------------ | ---------------- |
| AGT-001 | AI Command Center | `aiCommandCenter` | Natural language queries about partnerships, brands, talent, and pipeline metrics. Fetches real data from all core entities and synthesizes answers. | `{ query: string }` | `{ answer: string, data_summary: object, suggestions: string[] }` | GPT-4o-mini | N/A (conversational) | DeepSeek > Groq > Gemini | $40-80           |

### Category: Matching & Scoring

| AGT-ID  | Name                   | Function               | Purpose                                                                                                                                                                              | Input                                    | Output                                                                                                                                                                     | Model              | Confidence Threshold     | Fallback Chain      | Est Monthly Cost |
| ------- | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------ | ------------------- | ---------------- |
| AGT-002 | Match Scorer           | `scoreMatch`           | Computes creator-brand compatibility score (0-100) using niche adjacency, tone matching, audience overlap, platform alignment, and engagement fit. Deterministic algorithm (no LLM). | `{ creator_id: uuid, brand_id: uuid }`   | `{ overall_score: number, breakdown: { niche: number, tone: number, audience: number, platform: number, engagement: number }, signals: string[], recommendation: string }` | None (algorithmic) | 60 (below = "low match") | N/A (deterministic) | $0               |
| AGT-003 | Deal Score Leaderboard | `scoreDealLeaderboard` | Ranks all user partnerships by deal health score. Considers deal value, stage velocity, engagement signals, and completion probability.                                              | `{ user_id: uuid }` (implicit from auth) | `{ leaderboard: Array<{ partnership_id, score, rank, factors, tips }> }`                                                                                                   | GPT-4o-mini        | 50 (below = "at risk")   | DeepSeek > Groq     | $10-20           |

### Category: Content Generation

| AGT-ID  | Name                     | Function                    | Purpose                                                                                                                                       | Input                                                                         | Output                                                                                                 | Model       | Confidence Threshold | Fallback Chain  | Est Monthly Cost |
| ------- | ------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- | -------------------- | --------------- | ---------------- |
| AGT-004 | Campaign Brief Generator | `generateAICampaign`        | Generates complete campaign briefs including objectives, deliverables, timeline, KPIs, and budget allocation based on brand + talent context. | `{ brand_id: uuid, talent_id: uuid, campaign_type: string, budget: number }`  | `{ brief: { title, objectives, deliverables, timeline, kpis, budget_breakdown, creative_direction } }` | GPT-4o-mini | N/A (generative)     | DeepSeek > Groq | $15-30           |
| AGT-005 | Outreach Email Generator | `generateAIOutreach`        | Drafts personalized outreach email sequences with subject lines, body copy, and follow-up cadence. Adapts tone to brand voice.                | `{ partnership_id: uuid, sequence_length: number, tone: string }`             | `{ emails: Array<{ subject, body, send_delay_days }>, personalization_notes: string }`                 | GPT-4o-mini | N/A (generative)     | DeepSeek > Groq | $20-40           |
| AGT-006 | Creative Direction       | `generateCreativeDirection` | Generates content direction briefs including visual mood, tone guidelines, hashtag strategy, and platform-specific recommendations.           | `{ brand_id: uuid, talent_id: uuid, platform: string, content_type: string }` | `{ direction: { mood, tone, hashtags, visual_guidelines, platform_tips, example_concepts } }`          | GPT-4o-mini | N/A (generative)     | DeepSeek > Groq | $8-15            |
| AGT-007 | Pitch Deck Personalizer  | `personalizePitchDeck`      | Personalizes pitch deck content with brand-specific data, partnership history, and AI-generated talking points.                               | `{ partnership_id: uuid, deck_template_id?: uuid }`                           | `{ slides: Array<{ title, content, data_points, talking_points }>, metadata: object }`                 | GPT-4o-mini | N/A (generative)     | DeepSeek > Groq | $8-15            |

### Category: Intelligence

| AGT-ID  | Name                       | Function                          | Purpose                                                                                                                    | Input                                        | Output                                                                                                                                                  | Model                                                                         | Confidence Threshold | Fallback Chain         | Est Monthly Cost |
| ------- | -------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------- | ---------------------- | ---------------- | ----- |
| AGT-008 | Competitor Intelligence    | `analyzeCompetitorIntelligence`   | Analyzes competitor brand activity: partnership frequency, talent preferences, budget signals, and market positioning.     | `{ brand_id: uuid }`                         | `{ competitors: Array<{ name, partnership_count, avg_deal_value, preferred_niches, recent_moves }>, market_position: string, opportunities: string[] }` | GPT-4o-mini                                                                   | 0.65                 | DeepSeek > Groq        | $10-20           |
| AGT-009 | Trend Prediction           | `analyzeTrendPrediction`          | Forecasts partnership and content trends based on historical data, seasonal patterns, and market signals.                  | `{ timeframe: string, industry?: string }`   | `{ trends: Array<{ trend, confidence, timeframe, supporting_data }>, recommendations: string[] }`                                                       | GPT-4o-mini                                                                   | 0.60                 | DeepSeek > Groq        | $8-15            |
| AGT-010 | Brand Safety Scorer        | `analyzeBrandSafety`              | Evaluates brand-creator alignment risk: content controversies, audience mismatch, value conflicts, FTC compliance history. | `{ talent_id: uuid, brand_id: uuid }`        | `{ safety_score: number, risk_factors: Array<{ factor, severity, detail }>, recommendation: string }`                                                   | Claude Sonnet 4                                                               | 0.70                 | GPT-4o-mini > DeepSeek | $15-30           |
| AGT-011 | Compliance & Disclosure    | `analyzeComplianceDisclosure`     | Analyzes FTC compliance requirements: disclosure language, placement, platform-specific rules, past violation risk.        | `{ partnership_id: uuid }`                   | `{ compliance_score: number, required_disclosures: string[], violations_found: string[], recommendations: string[] }`                                   | Claude Sonnet 4                                                               | 0.75                 | GPT-4o-mini > DeepSeek | $10-20           |
| AGT-012 | Relationship Health        | `analyzeRelationshipHealth`       | Assesses partnership health based on communication frequency, deliverable timeliness, sentiment, and deal progression.     | `{ partnership_id: uuid }`                   | `{ health_score: number, factors: object, risk_signals: string[], action_items: string[] }`                                                             | GPT-4o-mini                                                                   | 0.60                 | DeepSeek > Groq        | $8-15            |
| AGT-013 | Audience Overlap           | `analyzeAudienceOverlap`          | Calculates audience overlap between creators or between creator and brand target demographic.                              | `{ entity_ids: uuid[], entity_type: 'talent' | 'brand' }`                                                                                                                                              | `{ overlap_matrix: object, unique_reach: number, recommendations: string[] }` | GPT-4o-mini          | 0.55                   | DeepSeek > Groq  | $8-15 |
| AGT-014 | Cross-Platform Attribution | `analyzeCrossPlatformAttribution` | Analyzes how partnership performance distributes across platforms (Instagram, TikTok, YouTube, etc.).                      | `{ partnership_id: uuid }`                   | `{ attribution: object, top_platform: string, recommendations: string[] }`                                                                              | GPT-4o-mini                                                                   | 0.60                 | DeepSeek > Groq        | $5-10            |
| AGT-015 | Roster Optimization        | `analyzeRosterOptimization`       | Agency-focused: recommends roster changes to maximize brand coverage, minimize audience overlap, and fill niche gaps.      | `{ agency_id: uuid }`                        | `{ current_score: number, recommendations: Array<{ action, talent, reason }>, projected_improvement: number }`                                          | GPT-4o-mini                                                                   | 0.60                 | DeepSeek > Groq        | $5-10            |

### Category: Deal Management

| AGT-ID  | Name                          | Function                       | Purpose                                                                                                                                         | Input                                    | Output                                                                                                                                       | Model           | Confidence Threshold | Fallback Chain         | Est Monthly Cost |
| ------- | ----------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------- | ---------------------- | ---------------- |
| AGT-016 | Deal Pattern Analyzer         | `analyzeDealPatterns`          | Identifies patterns across the user's deal pipeline: winning strategies, common failure points, optimal timing, and pricing trends.             | `{ user_id: uuid }` (implicit from auth) | `{ patterns: Array<{ pattern, frequency, impact }>, winning_strategies: string[], failure_modes: string[], pricing_insights: object }`       | GPT-4o-mini     | 0.60                 | DeepSeek > Groq        | $10-20           |
| AGT-017 | Contract Intelligence         | `analyzeContractIntelligence`  | Deep analysis of contract terms: identifies unfavorable clauses, missing protections, market-rate comparisons, and negotiation leverage points. | `{ partnership_id: uuid }`               | `{ risk_score: number, clause_analysis: Array<{ clause, risk, recommendation }>, missing_protections: string[], market_comparison: object }` | Claude Sonnet 4 | 0.70                 | GPT-4o-mini > DeepSeek | $15-30           |
| AGT-018 | Negotiation Coach             | `analyzeNegotiationCoach`      | Provides negotiation strategy based on deal context, market benchmarks, and counterparty analysis. Suggests anchoring points and BATNA.         | `{ partnership_id: uuid }`               | `{ strategy: string, anchoring_points: object, batna: string, concession_plan: Array<{ item, priority }>, talking_points: string[] }`        | Claude Sonnet 4 | 0.65                 | GPT-4o-mini > DeepSeek | $15-30           |
| AGT-019 | Partnership Success Predictor | `predictPartnershipSuccess`    | Predicts probability of partnership success based on historical deal data, match score, and pipeline signals.                                   | `{ partnership_id: uuid }`               | `{ success_probability: number, confidence: number, key_factors: Array<{ factor, weight, signal }>, risk_mitigation: string[] }`             | GPT-4o-mini     | 0.55                 | DeepSeek > Groq        | $8-15            |
| AGT-020 | Invoice Reconciliation        | `analyzeInvoiceReconciliation` | Reconciles partnership payments against contract terms: identifies discrepancies, missing payments, and schedule deviations.                    | `{ partnership_id: uuid }`               | `{ status: string, discrepancies: Array<{ item, expected, actual }>, missing_payments: object[], recommendations: string[] }`                | GPT-4o-mini     | 0.70                 | DeepSeek > Groq        | $3-8             |

### Category: Enrichment

| AGT-ID  | Name               | Function        | Purpose                                                                                                                                                            | Input                                    | Output                                                                  | Model                        | Confidence Threshold  | Fallback Chain             | Est Monthly Cost |
| ------- | ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------- | ---------------------------- | --------------------- | -------------------------- | ---------------- |
| AGT-021 | Creator Enrichment | `enrichCreator` | Crawls creator social profiles and websites via Crawl4AI (Railway), then uses Claude to extract structured profile data (bio, niche, rates, audience, past deals). | `{ user_id: uuid, urls: string[] }`      | `{ enriched_profile: object }` (written to `enriched_creators` TBL-014) | Claude Sonnet 4 (extraction) | N/A (extraction task) | GPT-4o-mini for extraction | $15-30           |
| AGT-022 | Brand Enrichment   | `enrichBrand`   | Crawls brand websites via Crawl4AI, then uses AI to extract company profile, products, brand voice, target audience, and social presence.                          | `{ user_id: uuid, website_url: string }` | `{ enriched_brand: object }` (written to `enriched_brands` TBL-015)     | Claude Sonnet 4 (extraction) | N/A (extraction task) | GPT-4o-mini for extraction | $10-20           |

### Category: Forecasting

| AGT-ID  | Name                           | Function                       | Purpose                                                                                                                                    | Input                                                  | Output                                                                                                                     | Model       | Confidence Threshold | Fallback Chain  | Est Monthly Cost |
| ------- | ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------- | --------------- | ---------------- |
| AGT-023 | Revenue Forecaster             | `forecastRevenue`              | Projects revenue trajectory based on current pipeline, historical close rates, seasonal patterns, and market conditions.                   | `{ user_id: uuid, timeframe: string }` (implicit auth) | `{ forecast: Array<{ month, projected_revenue, confidence_interval }>, assumptions: string[], risks: string[] }`           | GPT-4o-mini | 0.55                 | DeepSeek > Groq | $5-10            |
| AGT-024 | Talent Value Trajectory        | `predictTalentValueTrajectory` | Predicts creator market value evolution based on follower growth, engagement trends, niche demand, and partnership history.                | `{ talent_id: uuid, timeframe: string }`               | `{ current_value: number, projected_value: number, trajectory: string, growth_factors: string[], risk_factors: string[] }` | GPT-4o-mini | 0.55                 | DeepSeek > Groq | $5-10            |
| AGT-025 | Outreach Conversion Forecaster | `forecastOutreachConversion`   | Predicts outreach campaign conversion rates based on historical sequence performance, industry benchmarks, and contact quality.            | `{ sequence_id?: uuid }` (implicit auth)               | `{ predicted_open_rate, predicted_reply_rate, predicted_conversion_rate, confidence, optimization_tips: string[] }`        | GPT-4o-mini | 0.50                 | DeepSeek > Groq | $3-8             |
| AGT-026 | Partnership Simulator          | `simulatePartnership`          | What-if scenario engine: simulates adding/removing creators, changing budgets, new campaigns, or market shifts against existing portfolio. | `{ scenario: { type: string, params: object } }`       | `{ baseline: object, projected: object, delta: object, impact_analysis: string, recommendations: string[] }`               | GPT-4o-mini | 0.55                 | DeepSeek > Groq | $5-10            |

### Category: Analytics

| AGT-ID  | Name                         | Function                    | Purpose                                                                                                                                             | Input                                                  | Output                                                                                                                      | Model           | Confidence Threshold | Fallback Chain         | Est Monthly Cost |
| ------- | ---------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------- | ---------------------- | ---------------- |
| AGT-027 | Performance Benchmarker      | `benchmarkPerformance`      | Benchmarks user's partnership performance against platform averages: deal velocity, close rate, average deal value, ROI.                            | `{ user_id: uuid }` (implicit auth)                    | `{ benchmarks: Array<{ metric, user_value, platform_avg, percentile }>, strengths: string[], improvement_areas: string[] }` | GPT-4o-mini     | 0.60                 | DeepSeek > Groq        | $5-10            |
| AGT-028 | Success Factor Identifier    | `identifySuccessFactors`    | Analyzes completed partnerships to identify common success factors: optimal deal structure, timing, niche combinations, and communication patterns. | `{ user_id: uuid }` (implicit auth)                    | `{ factors: Array<{ factor, correlation, examples }>, playbook: string[], anti_patterns: string[] }`                        | GPT-4o-mini     | 0.55                 | DeepSeek > Groq        | $5-10            |
| AGT-029 | Executive Briefing Generator | `generateExecutiveBriefing` | Generates executive-level partnership portfolio summary with KPIs, trend analysis, and strategic recommendations.                                   | `{ user_id: uuid, timeframe: string }` (implicit auth) | `{ briefing: { summary, kpis, trends, risks, recommendations, next_steps } }`                                               | Claude Sonnet 4 | N/A (generative)     | GPT-4o-mini > DeepSeek | $10-20           |

### Agent Chain Definitions

The `runAgentChain` function (AGT-CHAIN) orchestrates multi-agent workflows. Each chain pipes the output of one agent as context into the next.

| Chain ID  | Name                   | Agents (in order)                                                                  | Purpose                                                                                                       | Tier Required |
| --------- | ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------- |
| CHAIN-001 | Deal Intelligence      | AGT-009 (Trends) > AGT-008 (Competitor) > AGT-018 (Negotiation)                    | End-to-end deal analysis: trends inform competitive positioning which shapes negotiation strategy             | 2             |
| CHAIN-002 | Brand Protection       | AGT-010 (Brand Safety) > AGT-011 (Compliance) > AGT-012 (Relationship Health)      | Comprehensive brand safety pipeline: safety audit feeds compliance review which informs relationship health   | 2             |
| CHAIN-003 | Portfolio Optimization | AGT-013 (Audience Overlap) > AGT-015 (Roster Optimization) > AGT-014 (Attribution) | Optimize creator portfolio: audience overlap analysis informs roster changes which drive attribution insights | 2             |

### Monthly AI Cost Summary

| Category           | Agent Count          | Primary Model           | Est Monthly Cost |
| ------------------ | -------------------- | ----------------------- | ---------------- |
| Orchestration      | 1                    | GPT-4o-mini             | $40-80           |
| Content Generation | 4                    | GPT-4o-mini             | $51-100          |
| Intelligence       | 8                    | Mixed (3 Claude, 5 GPT) | $69-135          |
| Deal Management    | 5                    | Mixed (2 Claude, 3 GPT) | $51-103          |
| Enrichment         | 2                    | Claude Sonnet 4         | $25-50           |
| Forecasting        | 4                    | GPT-4o-mini             | $18-38           |
| Analytics          | 3                    | Mixed (1 Claude, 2 GPT) | $20-40           |
| **Total**          | **27 AI + 2 non-AI** |                         | **$274-546**     |

---

# DELIVERABLE 9: ANALYTICS EVENT TAXONOMY

## Overview

DealStage tracks analytics events using an `object.action` naming convention. Events are captured client-side and written to the `activities` table (TBL-005) and `audit_logs` table (TBL-064). All events include base properties: `user_id`, `user_role`, `user_plan`, `timestamp`, `session_id`, and `page_url`.

### Event Naming Convention

```
{object}.{action}

Examples:
  page.viewed
  deal.created
  ai.query_submitted
  payment.completed
```

### Property Types

| Type       | Description        | Example                        |
| ---------- | ------------------ | ------------------------------ | ------- | --------- |
| `string`   | Text value         | `"Dashboard"`                  |
| `number`   | Numeric value      | `85.5`                         |
| `uuid`     | UUID v4            | `"a1b2c3d4-..."`               |
| `enum`     | Constrained string | `"talent"                      | "brand" | "agency"` |
| `boolean`  | True/false         | `true`                         |
| `string[]` | Array of strings   | `["fashion", "beauty"]`        |
| `object`   | JSON object        | `{ "min": 1000, "max": 5000 }` |

---

## Category: Page Views

| EVT-ID  | Event Name        | Category   | Description                          | Trigger                            | Required Properties                                                                  | Page(s)                      | User Types |
| ------- | ----------------- | ---------- | ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------- | ---------- |
| EVT-001 | `page.viewed`     | Navigation | User navigated to a page             | Route change fires in React Router | `page_name: string`, `page_tier: number`, `referrer: string`, `load_time_ms: number` | All pages (PG-001 to PG-094) | All        |
| EVT-002 | `page.time_spent` | Navigation | User left a page (captures duration) | Route change away or tab close     | `page_name: string`, `duration_seconds: number`, `scroll_depth_percent: number`      | All pages                    | All        |

## Category: Authentication

| EVT-ID  | Event Name                      | Category | Description                       | Trigger                                                           | Required Properties                                                               | Page(s)                               | User Types           |
| ------- | ------------------------------- | -------- | --------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- | -------------------- |
| EVT-003 | `auth.signup_started`           | Auth     | User clicked sign up button       | Signup form rendered                                              | `method: enum("email", "google", "magic_link")`                                   | Login (PG-013)                        | Anon                 |
| EVT-004 | `auth.signup_completed`         | Auth     | User account successfully created | Supabase auth.onAuthStateChange fires SIGNED_IN for new user      | `method: enum("email", "google", "magic_link")`, `user_id: uuid`, `email: string` | Login (PG-013), AuthCallback (PG-029) | Anon > Authenticated |
| EVT-005 | `auth.login_completed`          | Auth     | Existing user logged in           | Supabase auth.onAuthStateChange fires SIGNED_IN for existing user | `method: enum("email", "google", "magic_link")`, `user_id: uuid`                  | Login (PG-013), AuthCallback (PG-029) | All                  |
| EVT-006 | `auth.logout`                   | Auth     | User logged out                   | User clicks logout                                                | `user_id: uuid`, `session_duration_minutes: number`                               | Any page (via nav)                    | All                  |
| EVT-007 | `auth.password_reset_requested` | Auth     | User requested password reset     | Reset form submitted                                              | `email: string`                                                                   | Login (PG-013)                        | Anon                 |
| EVT-008 | `auth.password_reset_completed` | Auth     | User successfully reset password  | New password saved                                                | `user_id: uuid`                                                                   | ResetPassword (PG-031)                | Authenticated        |

## Category: Onboarding

| EVT-ID  | Event Name                        | Category   | Description                            | Trigger                                               | Required Properties                                                                         | Page(s)             | User Types      |
| ------- | --------------------------------- | ---------- | -------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------- | --------------- |
| EVT-009 | `onboarding.started`              | Onboarding | User entered onboarding flow           | Onboarding page mounted                               | `user_id: uuid`                                                                             | Onboarding (PG-039) | All             |
| EVT-010 | `onboarding.role_selected`        | Onboarding | User selected their role               | Role button clicked                                   | `role: enum("talent", "brand", "agency", "manager")`                                        | Onboarding (PG-039) | All             |
| EVT-011 | `onboarding.talent_type_selected` | Onboarding | Talent user selected their talent type | Talent type clicked (talent/manager only)             | `talent_type: string`, `category: string`                                                   | Onboarding (PG-039) | talent, manager |
| EVT-012 | `onboarding.plan_selected`        | Onboarding | User selected a subscription plan      | Plan card clicked                                     | `plan: enum("free", "tier1", "tier2", "tier3")`, `plan_name: string`, `price: number`       | Onboarding (PG-039) | All             |
| EVT-013 | `onboarding.step_completed`       | Onboarding | User completed an onboarding step      | Step validation passed                                | `step_number: number`, `step_name: string`, `time_on_step_seconds: number`                  | Onboarding (PG-039) | All             |
| EVT-014 | `onboarding.completed`            | Onboarding | User finished all onboarding steps     | Final step submitted, `onboarding_completed` set true | `role: string`, `plan: string`, `total_duration_seconds: number`, `steps_completed: number` | Onboarding (PG-039) | All             |
| EVT-015 | `onboarding.skipped`              | Onboarding | User skipped onboarding                | Skip button clicked                                   | `step_skipped_at: number`                                                                   | Onboarding (PG-039) | All             |

## Category: Search & Discovery

| EVT-ID  | Event Name               | Category | Description                     | Trigger                                  | Required Properties                                                                        | Page(s)                                                           | User Types |
| ------- | ------------------------ | -------- | ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------- |
| EVT-016 | `search.query_submitted` | Search   | User submitted a search query   | Search input submitted (Enter or button) | `query: string`, `entity_type: enum("talent", "brand", "contact")`, `result_count: number` | TalentDiscovery (PG-054), Brands (PG-048), ContactFinder (PG-056) | All        |
| EVT-017 | `search.filter_applied`  | Search   | User applied a search filter    | Filter value changed                     | `filter_name: string`, `filter_value: string`, `result_count_after: number`                | TalentDiscovery (PG-054), Brands (PG-048), Marketplace (PG-047)   | All        |
| EVT-018 | `search.result_clicked`  | Search   | User clicked on a search result | Result card clicked                      | `entity_type: string`, `entity_id: uuid`, `position: number`, `query: string`              | TalentDiscovery (PG-054), Brands (PG-048), ContactFinder (PG-056) | All        |
| EVT-019 | `search.no_results`      | Search   | Search returned zero results    | Query completed with 0 results           | `query: string`, `entity_type: string`, `filters_applied: object`                          | TalentDiscovery (PG-054), Brands (PG-048), ContactFinder (PG-056) | All        |

## Category: Matching

| EVT-ID  | Event Name        | Category | Description                                            | Trigger                           | Required Properties                                                           | Page(s)              | User Types |
| ------- | ----------------- | -------- | ------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------- | -------------------- | ---------- |
| EVT-020 | `match.requested` | Matching | User requested a match score                           | Match button clicked              | `creator_id: uuid`, `brand_id: uuid`                                          | MatchEngine (PG-055) | All        |
| EVT-021 | `match.viewed`    | Matching | User viewed match score details                        | Score breakdown expanded          | `creator_id: uuid`, `brand_id: uuid`, `overall_score: number`                 | MatchEngine (PG-055) | All        |
| EVT-022 | `match.accepted`  | Matching | User accepted a match (created partnership from match) | Accept/Create Deal button clicked | `creator_id: uuid`, `brand_id: uuid`, `score: number`, `partnership_id: uuid` | MatchEngine (PG-055) | All        |
| EVT-023 | `match.declined`  | Matching | User dismissed a match recommendation                  | Decline/Skip button clicked       | `creator_id: uuid`, `brand_id: uuid`, `score: number`, `reason?: string`      | MatchEngine (PG-055) | All        |

## Category: AI

| EVT-ID  | Event Name            | Category | Description                                      | Trigger                                | Required Properties                                                                                                                                             | Page(s)                                                                     | User Types     |
| ------- | --------------------- | -------- | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------- |
| EVT-024 | `ai.query_submitted`  | AI       | User submitted an AI query                       | AI form submitted or chat message sent | `agent: string`, `query_length: number`, `page_context: string`                                                                                                 | AICommandCenter (PG-046), AIAgentsHub (PG-064), and any page with inline AI | All            |
| EVT-025 | `ai.query_completed`  | AI       | AI response successfully returned                | Edge function returned 200             | `agent: string`, `model: string`, `latency_ms: number`, `input_tokens: number`, `output_tokens: number`, `estimated_cost_usd: number`, `fallback_used: boolean` | AICommandCenter (PG-046), AIAgentsHub (PG-064)                              | All            |
| EVT-026 | `ai.query_failed`     | AI       | AI query failed                                  | Edge function returned error           | `agent: string`, `error_type: string`, `error_message: string`, `model_attempted: string`                                                                       | Any AI-enabled page                                                         | All            |
| EVT-027 | `ai.limit_reached`    | AI       | User hit their monthly AI query limit            | `ai_usage.query_count >= tier_limit`   | `current_count: number`, `limit: number`, `plan: string`                                                                                                        | AICommandCenter (PG-046), AIAgentsHub (PG-064)                              | Free, Tier 1   |
| EVT-028 | `ai.upgrade_prompted` | AI       | User shown upgrade prompt after hitting AI limit | Upgrade modal displayed                | `current_plan: string`, `suggested_plan: string`, `trigger_agent: string`                                                                                       | AICommandCenter (PG-046), AIAgentsHub (PG-064)                              | Free, Tier 1   |
| EVT-029 | `ai.chain_started`    | AI       | User started an agent chain                      | Chain execution initiated              | `chain_id: string`, `chain_name: string`, `agent_count: number`                                                                                                 | AIAgentsHub (PG-064)                                                        | Tier 2, Tier 3 |
| EVT-030 | `ai.chain_completed`  | AI       | Agent chain finished all steps                   | Last agent in chain returned           | `chain_id: string`, `total_latency_ms: number`, `total_cost_usd: number`, `agents_succeeded: number`                                                            | AIAgentsHub (PG-064)                                                        | Tier 2, Tier 3 |

## Category: Deals / Partnerships

| EVT-ID  | Event Name                 | Category | Description                                  | Trigger                                                        | Required Properties                                                                                                             | Page(s)                                                           | User Types |
| ------- | -------------------------- | -------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------- |
| EVT-031 | `deal.created`             | Deals    | New partnership created                      | Partnership INSERT                                             | `partnership_id: uuid`, `brand_name: string`, `talent_name: string`, `source: enum("manual", "match", "marketplace", "import")` | Partnerships (PG-049), MatchEngine (PG-055), Marketplace (PG-047) | All        |
| EVT-032 | `deal.stage_changed`       | Deals    | Partnership moved to a new pipeline stage    | Status UPDATE on partnerships                                  | `partnership_id: uuid`, `from_status: string`, `to_status: string`, `time_in_previous_stage_hours: number`                      | Partnerships (PG-049), DealDetail (PG-044)                        | All        |
| EVT-033 | `deal.value_updated`       | Deals    | Deal value changed                           | deal_value UPDATE on partnerships                              | `partnership_id: uuid`, `old_value: number`, `new_value: number`                                                                | DealDetail (PG-044)                                               | All        |
| EVT-034 | `deal.signed`              | Deals    | Contract signed by both parties              | Contract status = signed, both timestamps set                  | `partnership_id: uuid`, `contract_id: uuid`, `total_value: number`                                                              | DealDetail (PG-044), ContractTemplates (PG-050)                   | All        |
| EVT-035 | `deal.milestone_completed` | Deals    | A deal milestone/deliverable marked complete | Milestone checkbox toggled or approval_items status = approved | `partnership_id: uuid`, `milestone_name: string`, `completion_percent: number`                                                  | DealDetail (PG-044), Approvals (PG-045)                           | All        |
| EVT-036 | `deal.completed`           | Deals    | Partnership reached "completed" status       | Status changed to "completed"                                  | `partnership_id: uuid`, `total_value: number`, `duration_days: number`, `stages_traversed: number`                              | Partnerships (PG-049)                                             | All        |
| EVT-037 | `deal.churned`             | Deals    | Partnership marked as churned/lost           | Status changed to "churned"                                    | `partnership_id: uuid`, `last_active_stage: string`, `reason?: string`                                                          | Partnerships (PG-049)                                             | All        |

## Category: Payments

| EVT-ID  | Event Name                | Category | Description                                   | Trigger                                                        | Required Properties                                                                                                   | Page(s)                                           | User Types |
| ------- | ------------------------- | -------- | --------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------- |
| EVT-038 | `payment.initiated`       | Payments | User started a payment flow (Stripe Checkout) | Stripe checkout session created                                | `amount: number`, `currency: string`, `plan_name: string`, `payment_type: enum("subscription", "escrow", "one_time")` | SubscriptionManagement (PG-038), Pricing (PG-009) | All        |
| EVT-039 | `payment.completed`       | Payments | Payment successfully processed                | Stripe webhook: checkout.session.completed or invoice.paid     | `amount: number`, `currency: string`, `stripe_payment_intent: string`, `plan_name: string`                            | SubscriptionManagement (PG-038)                   | All        |
| EVT-040 | `payment.failed`          | Payments | Payment attempt failed                        | Stripe webhook: invoice.payment_failed                         | `amount: number`, `error_code: string`, `plan_name: string`                                                           | SubscriptionManagement (PG-038)                   | All        |
| EVT-041 | `subscription.upgraded`   | Payments | User upgraded to a higher tier                | Stripe webhook: customer.subscription.updated (plan increased) | `old_plan: string`, `new_plan: string`, `old_tier: number`, `new_tier: number`, `mrr_delta: number`                   | SubscriptionManagement (PG-038)                   | All        |
| EVT-042 | `subscription.downgraded` | Payments | User downgraded to a lower tier               | Stripe webhook: customer.subscription.updated (plan decreased) | `old_plan: string`, `new_plan: string`, `old_tier: number`, `new_tier: number`, `mrr_delta: number`                   | SubscriptionManagement (PG-038)                   | All        |
| EVT-043 | `subscription.cancelled`  | Payments | User cancelled subscription                   | Stripe webhook: customer.subscription.deleted                  | `plan: string`, `tenure_days: number`, `reason?: string`                                                              | SubscriptionManagement (PG-038)                   | All        |
| EVT-044 | `escrow.released`         | Payments | Escrow payment released to talent             | Escrow status changed to "released"                            | `partnership_id: uuid`, `escrow_id: uuid`, `amount: number`                                                           | DealDetail (PG-044)                               | All        |

## Category: Contacts & Outreach

| EVT-ID  | Event Name                  | Category | Description                             | Trigger                                  | Required Properties                                                                       | Page(s)                                         | User Types |
| ------- | --------------------------- | -------- | --------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------- |
| EVT-045 | `contact.searched`          | Contacts | User searched for brand contacts        | GMO search initiated                     | `brand_name: string`, `results_count: number`                                             | ContactFinder (PG-056)                          | All        |
| EVT-046 | `contact.email_revealed`    | Contacts | User revealed a contact's email address | Email reveal button clicked (tier-gated) | `decision_maker_id: uuid`, `brand_name: string`                                           | ContactFinder (PG-056), BrandDashboard (PG-043) | Tier 1+    |
| EVT-047 | `contact.phone_revealed`    | Contacts | User revealed a contact's phone number  | Phone reveal button clicked (tier-gated) | `decision_maker_id: uuid`, `brand_name: string`                                           | ContactFinder (PG-056)                          | Tier 2+    |
| EVT-048 | `outreach.email_sent`       | Outreach | Outreach email sent                     | Email status changed to "sent"           | `email_id: uuid`, `partnership_id: uuid`, `sequence_id?: uuid`, `recipient_email: string` | Outreach (PG-057), SequenceBuilder (PG-066)     | All        |
| EVT-049 | `outreach.email_opened`     | Outreach | Outreach email opened by recipient      | Open tracking pixel fired                | `email_id: uuid`, `partnership_id: uuid`, `time_to_open_hours: number`                    | Outreach (PG-057)                               | All        |
| EVT-050 | `outreach.email_replied`    | Outreach | Recipient replied to outreach email     | Reply detection triggered                | `email_id: uuid`, `partnership_id: uuid`, `time_to_reply_hours: number`                   | Outreach (PG-057)                               | All        |
| EVT-051 | `outreach.sequence_started` | Outreach | Automated outreach sequence activated   | Sequence status changed to "active"      | `sequence_id: uuid`, `step_count: number`, `target_count: number`                         | SequenceBuilder (PG-066)                        | Tier 2+    |

## Category: Marketplace

| EVT-ID  | Event Name              | Category    | Description                         | Trigger                                    | Required Properties                                                                      | Page(s)                    | User Types           |
| ------- | ----------------------- | ----------- | ----------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------- | -------------------- |
| EVT-052 | `opportunity.created`   | Marketplace | Brand posted a new opportunity      | Opportunity INSERT                         | `opportunity_id: uuid`, `brand_name: string`, `budget_range: object`, `niches: string[]` | CreateOpportunity (PG-053) | brand, agency, admin |
| EVT-053 | `opportunity.viewed`    | Marketplace | User viewed opportunity details     | Opportunity card expanded or detail opened | `opportunity_id: uuid`, `brand_name: string`                                             | Marketplace (PG-047)       | All                  |
| EVT-054 | `application.submitted` | Marketplace | Talent applied to an opportunity    | Application INSERT                         | `application_id: uuid`, `opportunity_id: uuid`, `proposed_rate: number`                  | Marketplace (PG-047)       | talent, manager      |
| EVT-055 | `application.accepted`  | Marketplace | Brand accepted a talent application | Application status = accepted              | `application_id: uuid`, `opportunity_id: uuid`, `talent_name: string`                    | Marketplace (PG-047)       | brand, agency, admin |

## Category: Enrichment

| EVT-ID  | Event Name             | Category   | Description                          | Trigger                                | Required Properties                                                        | Page(s)                                             | User Types |
| ------- | ---------------------- | ---------- | ------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------- | ---------- |
| EVT-056 | `enrichment.started`   | Enrichment | Crawl4AI enrichment job started      | crawl_jobs INSERT with status=queued   | `job_id: uuid`, `job_type: enum("creator", "brand")`, `url: string`        | ConnectAccounts (PG-041), AdminDataManager (PG-089) | All        |
| EVT-057 | `enrichment.completed` | Enrichment | Enrichment job finished successfully | crawl_jobs status changed to completed | `job_id: uuid`, `job_type: string`, `duration_seconds: number`             | ConnectAccounts (PG-041), AdminDataManager (PG-089) | All        |
| EVT-058 | `enrichment.failed`    | Enrichment | Enrichment job failed                | crawl_jobs status changed to failed    | `job_id: uuid`, `job_type: string`, `error: string`, `retry_count: number` | AdminDataManager (PG-089)                           | admin      |

## Category: Admin Operations

| EVT-ID  | Event Name                      | Category | Description                                     | Trigger                                   | Required Properties                                                | Page(s)                   | User Types |
| ------- | ------------------------------- | -------- | ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------ | ------------------------- | ---------- |
| EVT-059 | `admin.brands_populated`        | Admin    | Admin triggered bulk brand population           | populateBrands edge function called       | `brands_added: number`, `brands_updated: number`, `source: string` | AdminDataManager (PG-089) | admin      |
| EVT-060 | `admin.contacts_populated`      | Admin    | Admin triggered bulk contact population via GMO | populateContacts edge function called     | `contacts_added: number`, `brands_targeted: number`                | AdminDataManager (PG-089) | admin      |
| EVT-061 | `admin.intel_populated`         | Admin    | Admin triggered brand intelligence population   | Brand signals or budget intel bulk update | `signals_added: number`, `brands_updated: number`                  | AdminDataManager (PG-089) | admin      |
| EVT-062 | `admin.enrichment_bulk_started` | Admin    | Admin triggered bulk enrichment refresh         | refreshEnrichments edge function called   | `job_count: number`, `target_type: string`                         | AdminDataManager (PG-089) | admin      |

## Category: Engagement & Feature Usage

| EVT-ID  | Event Name                   | Category      | Description                                       | Trigger                                           | Required Properties                                                                    | Page(s)                                                                  | User Types |
| ------- | ---------------------------- | ------------- | ------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------- |
| EVT-063 | `deck.created`               | Content       | User created a new pitch deck                     | Deck INSERT to deck_library                       | `deck_id: uuid`, `deck_type: string`, `partnership_id?: uuid`                          | PitchDeckBuilder (PG-062)                                                | All        |
| EVT-064 | `deck.shared`                | Content       | User shared a pitch deck via link                 | Share link generated                              | `deck_id: uuid`, `share_method: enum("link", "email", "download")`                     | DeckLibrary (PG-063)                                                     | All        |
| EVT-065 | `data_room.entry_added`      | Content       | User added entry to their data room               | data_room_entries INSERT                          | `entry_id: uuid`, `room_type: enum("talent", "brand", "agency")`, `visibility: string` | TalentDataRoom (PG-079), BrandDataRoom (PG-080), AgencyDataRoom (PG-081) | All        |
| EVT-066 | `data_room.access_requested` | Content       | User requested access to another user's data room | data_room_access INSERT                           | `owner_email: string`, `room_type: string`, `nda_required: boolean`                    | TalentDataRoom (PG-079), BrandDataRoom (PG-080), AgencyDataRoom (PG-081) | All        |
| EVT-067 | `referral.code_shared`       | Referral      | User shared their referral code                   | Share button clicked                              | `referral_code: string`, `share_method: enum("copy", "email", "social")`               | Referrals (PG-040)                                                       | All        |
| EVT-068 | `referral.converted`         | Referral      | Referred user signed up                           | Referred user completed signup with referral code | `referral_code: string`, `referrer_id: uuid`, `referred_id: uuid`                      | Onboarding (PG-039)                                                      | All        |
| EVT-069 | `team.member_invited`        | Collaboration | Team owner invited a new member                   | team_members INSERT                               | `team_id: uuid`, `invited_email: string`, `role: string`                               | Teams (PG-082)                                                           | Tier 3     |
| EVT-070 | `export.completed`           | Data          | User exported data                                | exportEntityData edge function completed          | `entity_type: string`, `format: enum("csv", "json")`, `record_count: number`           | DataImportExport (PG-085)                                                | Tier 3     |

### Event Count Summary

| Category                   | Count  | EVT-ID Range           |
| -------------------------- | ------ | ---------------------- |
| Page Views                 | 2      | EVT-001 to EVT-002     |
| Authentication             | 6      | EVT-003 to EVT-008     |
| Onboarding                 | 7      | EVT-009 to EVT-015     |
| Search & Discovery         | 4      | EVT-016 to EVT-019     |
| Matching                   | 4      | EVT-020 to EVT-023     |
| AI                         | 7      | EVT-024 to EVT-030     |
| Deals / Partnerships       | 7      | EVT-031 to EVT-037     |
| Payments                   | 7      | EVT-038 to EVT-044     |
| Contacts & Outreach        | 7      | EVT-045 to EVT-051     |
| Marketplace                | 4      | EVT-052 to EVT-055     |
| Enrichment                 | 3      | EVT-056 to EVT-058     |
| Admin Operations           | 4      | EVT-059 to EVT-062     |
| Engagement & Feature Usage | 8      | EVT-063 to EVT-070     |
| **Total**                  | **70** | **EVT-001 to EVT-070** |

---

## Cross-Reference Index

### Batch 2 ID Ranges

| Deliverable       | ID Prefix | Range                    | Count |
| ----------------- | --------- | ------------------------ | ----- |
| Page Directory    | PG-       | PG-001 to PG-094         | 94    |
| API Integrations  | API-      | API-001 to API-018       | 18    |
| AI Agent Registry | AGT-      | AGT-001 to AGT-029       | 29    |
| Agent Chains      | CHAIN-    | CHAIN-001 to CHAIN-003   | 3     |
| Inbound Webhooks  | WH-IN-    | WH-IN-001 to WH-IN-005   | 5     |
| Outbound Webhooks | WH-OUT-   | WH-OUT-001 to WH-OUT-008 | 8     |
| Analytics Events  | EVT-      | EVT-001 to EVT-070       | 70    |

### Batch 1 ID Ranges (for reference)

| Deliverable     | ID Prefix | Range              | Count |
| --------------- | --------- | ------------------ | ----- |
| Database Schema | TBL-      | TBL-001 to TBL-068 | 68    |
| Personas        | PER-      | PER-001 to PER-007 | 7     |
