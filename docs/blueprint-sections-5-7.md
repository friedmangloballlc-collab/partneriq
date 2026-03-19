# DealStage — Company Operating Blueprint

## Sections 5–7: App Screen Inventory, Core Product Systems, Data Architecture

**Platform:** DealStage (www.thedealstage.com)
**Classification:** AI-Powered Partnership Intelligence Platform
**Date:** 2026-03-19

---

## SECTION 5: APP SCREEN & PAGE INVENTORY

### 5.1 Page Inventory by Area

---

#### Authentication & Access (7 pages)

| #   | Page Name            | Route                          | Function                                            | Key Actions                                                              |
| --- | -------------------- | ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Login                | `/login`                       | Email/password and OAuth authentication             | Enter credentials, OAuth sign-in (Google/etc.), forgot password link     |
| 2   | Onboarding / Sign Up | `/` or `/Onboarding`           | Landing page and multi-step account creation wizard | Select role (Talent/Brand/Agency), create account, configure profile     |
| 3   | Check Email          | `/check-email`                 | Post-registration email verification gate           | Displays confirmation prompt; awaits verification before granting access |
| 4   | Forgot Password      | Handled via Supabase Auth flow | Initiates password reset by email                   | Enter email address, trigger reset email                                 |
| 5   | Reset Password       | Supabase Auth callback URL     | Accepts reset token, sets new password              | Enter and confirm new password                                           |
| 6   | OAuth Callback       | Supabase Auth callback URL     | Handles OAuth provider return, establishes session  | Auto-redirect to Dashboard on success                                    |
| 7   | 404 / Not Found      | `*` (catch-all)                | Displays when a route does not exist                | Return to Dashboard link                                                 |

---

#### Onboarding Flow (4 Steps — within `/Onboarding` page)

| #   | Step Name                | Function                                            | Key Actions                                                                  |
| --- | ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Role Selection / Landing | User selects their identity on the platform         | Choose Talent, Brand, or Agency role                                         |
| 2   | Plan Selection           | User reviews subscription tiers and selects a plan  | Review Free vs. paid tiers (Rising, Growth+); select or skip                 |
| 3   | Account Creation         | Collects credentials and basic profile data         | Enter name, email, password; confirm terms                                   |
| 4   | Post-Signup Wizard       | In-app guided tour via `OnboardingWizard` component | Complete profile, connect accounts, seed demo data, take guided product tour |

---

#### Talent Core Views (48 pages — from talent nav in Layout.jsx)

| #   | Page Name              | Route Key                | Function                                                 | Key Actions                                                      |
| --- | ---------------------- | ------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | Dashboard              | `Dashboard`              | Unified command center; role-adaptive panels for Talent  | View pipeline stats, AI alerts, activity feed, smart next steps  |
| 2   | Platform Overview      | `PlatformOverview`       | Feature orientation and platform map                     | Explore all feature areas                                        |
| 3   | AI Features            | `AIFeatures`             | AI capabilities showcase and launch pad                  | Browse and activate AI agents                                    |
| 4   | AI Agents Hub          | `AIAgentsHub`            | Browse and invoke all 32 AI agents                       | Run agents, view outputs, configure parameters                   |
| 5   | AI Command Center      | `AICommandCenter`        | Natural language interface to platform AI                | Type commands, receive AI-driven analysis and actions            |
| 6   | Marketplace            | `Marketplace`            | Discover and apply to brand opportunities                | Browse listings, filter by niche/budget, apply to opportunities  |
| 7   | My Profile             | `TalentProfile`          | Personal media kit and talent profile management         | Edit bio, upload content samples, set rates, manage portfolio    |
| 8   | Master Calendar        | `MasterCalendar`         | Consolidated view of all deal deadlines and events       | View deliverable dates, campaign timelines, personal schedule    |
| 9   | Culture Calendar       | `CultureCalendar`        | Cultural moments and trending event planning             | Browse key dates, plan content around cultural moments           |
| 10  | Market Intelligence    | `MarketIntelligence`     | Industry rate benchmarks and trend data                  | View rate benchmarks by tier/niche, analyze market trends        |
| 11  | Spend Prediction       | `BrandSpendPrediction`   | Forecast brand spending patterns and budget cycles       | View predicted brand budgets, optimal outreach windows           |
| 12  | Brands                 | `Brands`                 | Directory of brands available for partnership            | Browse brand profiles, view partnership history, assess fit      |
| 13  | Deal Pipeline          | `Partnerships`           | End-to-end deal management across all stages             | Move deals through stages, update status, view deal health       |
| 14  | Bundle Deals           | `BundleDeals`            | Package multiple deliverables into combined offers       | Create bundles, set bundle pricing, propose to brands            |
| 15  | Deal Analytics         | `DealAnalytics`          | Performance analytics across all partnership deals       | View win rates, avg deal size, time-to-close, category breakdown |
| 16  | Deal Comparison        | `DealComparison`         | Side-by-side comparison of deal terms                    | Compare up to N deals simultaneously across key dimensions       |
| 17  | Deal Score Leaderboard | `DealScoreLeaderboard`   | Ranked deals by AI-computed deal quality score           | View top-scoring deals, understand scoring factors               |
| 18  | Custom Reports         | `CustomReports`          | Build ad-hoc reports from platform data                  | Select dimensions/metrics, apply filters, export results         |
| 19  | Talent Analytics       | `TalentAnalytics`        | Deep analytics on talent profile performance             | Engagement rates, audience demographics, growth trajectory       |
| 20  | Talent Revenue         | `TalentRevenue`          | Revenue tracking and projection across streams           | View earnings by stream, forecast future revenue                 |
| 21  | Outreach               | `Outreach`               | Manage outbound outreach campaigns to brands             | View sequence performance, manage contacts, track opens/replies  |
| 22  | Contact Finder         | `ContactFinder`          | Identify and locate decision-maker contacts at brands    | Search contacts, view role and seniority, add to sequences       |
| 23  | Warm Intro Network     | `WarmIntroNetwork`       | Leverage mutual connections for warm introductions       | Map relationship paths, request introductions                    |
| 24  | Pitch Competition      | `PitchCompetition`       | Compete in open pitch rounds with brands                 | Submit pitches, view competition results, track standings        |
| 25  | Sequences              | `SequenceBuilder`        | Build multi-step automated outreach sequences            | Create email cadences, set delays, personalize templates         |
| 26  | Approvals              | `Approvals`              | Content and deliverable approval workflow                | Submit deliverables, review brand feedback, mark approvals       |
| 27  | Match Engine           | `MatchEngine`            | AI-powered compatibility scoring with brands             | Run match analysis, view score breakdown, explore top matches    |
| 28  | Campaign Briefs        | `CampaignBriefGenerator` | AI-generated campaign brief documents                    | Input campaign goals, generate structured brief, download PDF    |
| 29  | Pitch Deck Builder     | `PitchDeckBuilder`       | AI-assisted pitch deck generation system                 | Create slides, customize templates, AI-generate content blocks   |
| 30  | Contract Templates     | `ContractTemplates`      | Standardized and custom contract template library        | Browse templates, customize clauses, download for use            |
| 31  | Referrals              | `Referrals`              | Referral program management and tracking                 | Share referral link, view referral status, track earned rewards  |
| 32  | Talent Discovery       | `TalentDiscovery`        | Browse talent directory (self-discovery/comparison tool) | Search talent, apply filters, view profiles                      |
| 33  | Data Room (Talent)     | `TalentDataRoom`         | Proprietary talent performance data repository           | View deal outcomes, rate history, audience data over time        |
| 34  | Data Room (Brand)      | `BrandDataRoom`          | Brand partnership intelligence and history data          | Review brand spend patterns, deal terms, ROI data                |
| 35  | Data Room (Agency)     | `AgencyDataRoom`         | Agency deal intelligence and roster data                 | View agency deal history, commission norms, roster data          |
| 36  | Analytics              | `Analytics`              | General platform analytics and performance overview      | View cross-functional metrics, trend charts                      |
| 37  | ROI Simulator          | `SimulationEngine`       | Model projected ROI for potential partnerships           | Input deal parameters, run simulation, view projected returns    |
| 38  | Data Import/Export     | `DataImportExport`       | Bulk data management and portability                     | Import CSV/data, export reports, sync external datasets          |
| 39  | Event Management       | `EventManagement`        | Manage events, appearances, and live activations         | Create events, track RSVPs, link to deals                        |
| 40  | Notifications          | `Notifications`          | Centralized notification center                          | View all platform alerts, mark read, configure preferences       |
| 41  | Teams                  | `Teams`                  | Manage team members and role permissions                 | Invite team members, assign roles, manage access                 |
| 42  | Demographic Targeting  | `DemographicTargeting`   | Audience segmentation and targeting tools                | Build demographic segments, apply to campaigns                   |
| 43  | Connect Accounts       | `ConnectAccounts`        | Link social media and external platform accounts         | OAuth-connect Instagram, YouTube, TikTok, X, etc.                |
| 44  | Integrations           | `Integrations`           | Third-party tool integrations management                 | Connect CRMs, email tools, payment systems                       |
| 45  | Subscriptions          | `SubscriptionManagement` | Manage subscription plan, upgrades, and billing          | View current plan, upgrade/downgrade, manage billing method      |
| 46  | Billing History        | `BillingHistory`         | View payment history and invoices                        | Download invoices, view transaction history                      |
| 47  | Settings               | `Settings`               | Account settings and preferences                         | Update profile info, notification preferences, security settings |
| 48  | Deal Detail            | `DealDetail`             | Deep-dive view of a single deal record                   | View all deal data, timeline, notes, documents, contacts         |

---

#### Brand Core Views (50 pages — from brand nav in Layout.jsx)

| #   | Page Name              | Route Key                | Function                                                 | Key Actions                                                     |
| --- | ---------------------- | ------------------------ | -------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Dashboard              | `Dashboard`              | Role-adaptive brand command center                       | View campaign KPIs, pipeline overview, AI alerts, activity feed |
| 2   | Platform Overview      | `PlatformOverview`       | Feature orientation and navigation guide                 | Explore all platform areas                                      |
| 3   | AI Features            | `AIFeatures`             | AI capabilities showcase for brands                      | Browse and activate AI agents                                   |
| 4   | AI Agents Hub          | `AIAgentsHub`            | Access and invoke all 32 AI agents                       | Run agents, configure parameters, view outputs                  |
| 5   | AI Command Center      | `AICommandCenter`        | Natural language interface to platform AI                | Issue commands, receive AI-driven actions                       |
| 6   | My Opportunities       | `BrandDashboard`         | Brand-specific opportunity and campaign dashboard        | View active campaigns, posted opportunities, applicant status   |
| 7   | Marketplace            | `Marketplace`            | Post opportunities and browse talent                     | Create listings, review applications, shortlist talent          |
| 8   | Master Calendar        | `MasterCalendar`         | Consolidated calendar of all campaigns and deadlines     | View campaign timelines, content due dates                      |
| 9   | Culture Calendar       | `CultureCalendar`        | Cultural moment planning for campaign alignment          | Plan campaigns around key cultural dates                        |
| 10  | Talent Discovery       | `TalentDiscovery`        | Search and filter talent pool                            | Advanced talent search, filter by niche/tier/rate/audience      |
| 11  | Talent Analytics       | `TalentAnalytics`        | Deep analytics on talent performance data                | View engagement, audience demographics, growth trends           |
| 12  | Talent Revenue         | `TalentRevenue`          | Talent rate and revenue benchmarking data                | Understand typical talent earnings by tier and niche            |
| 13  | Deal Pipeline          | `Partnerships`           | Manage all active and historical deals                   | Pipeline kanban/table, stage management, deal health scores     |
| 14  | Bundle Deals           | `BundleDeals`            | Review and accept bundled talent offers                  | Evaluate bundle packages, compare pricing                       |
| 15  | Data Room (Talent)     | `TalentDataRoom`         | Talent performance intelligence repository               | Access verified talent metrics and historical data              |
| 16  | Data Room (Brand)      | `BrandDataRoom`          | Own deal history and campaign intelligence               | Review own campaign outcomes, ROI data                          |
| 17  | Data Room (Agency)     | `AgencyDataRoom`         | Agency intelligence data for vetting                     | Evaluate agency deal track records                              |
| 18  | Deal Analytics         | `DealAnalytics`          | Performance analytics across all brand deals             | Win rates, avg deal value, category performance                 |
| 19  | Deal Comparison        | `DealComparison`         | Side-by-side deal term comparison                        | Compare deal proposals across key metrics                       |
| 20  | Deal Score Leaderboard | `DealScoreLeaderboard`   | AI-scored deal quality leaderboard                       | Identify highest-quality deal opportunities                     |
| 21  | Custom Reports         | `CustomReports`          | Build custom analytics reports                           | Select metrics, apply filters, schedule and export              |
| 22  | Outreach               | `Outreach`               | Manage outbound talent outreach campaigns                | View sequence stats, manage contacts                            |
| 23  | Contact Finder         | `ContactFinder`          | Find decision-maker contacts at talent or agencies       | Search by role, view contact details                            |
| 24  | Warm Intro Network     | `WarmIntroNetwork`       | Leverage relationship graph for introductions            | Map mutual connections, request warm intros                     |
| 25  | Pitch Competition      | `PitchCompetition`       | Run open pitch competitions with talent                  | Post competition briefs, review submissions, select winners     |
| 26  | Sequences              | `SequenceBuilder`        | Build automated outreach sequences to talent             | Create cadences, personalize, set timing rules                  |
| 27  | Approvals              | `Approvals`              | Review and approve talent content deliverables           | Review submissions, provide feedback, approve/reject            |
| 28  | Match Engine           | `MatchEngine`            | AI compatibility scoring between brand and talent        | Run match analysis, view weighted scoring breakdown             |
| 29  | Demographic Targeting  | `DemographicTargeting`   | Define target audience demographic profiles              | Build audience segments for campaign targeting                  |
| 30  | Campaign Briefs        | `CampaignBriefGenerator` | AI-generated campaign brief documents                    | Input objectives, generate structured briefs                    |
| 31  | Data Import/Export     | `DataImportExport`       | Bulk data operations                                     | Import brand data, export reports                               |
| 32  | ROI Simulator          | `SimulationEngine`       | Model campaign ROI before committing to deals            | Input parameters, simulate outcomes, compare scenarios          |
| 33  | Pitch Deck Builder     | `PitchDeckBuilder`       | Build pitch decks to attract talent or present campaigns | Create and customize presentation decks                         |
| 34  | Deck Library           | `DeckLibrary`            | Saved deck archive and template library                  | Browse saved decks, reuse templates                             |
| 35  | Contract Templates     | `ContractTemplates`      | Standard and custom brand-side contract templates        | Select templates, customize, deploy                             |
| 36  | Referrals              | `Referrals`              | Referral program participation and tracking              | Share referral link, track reward status                        |
| 37  | Market Intelligence    | `MarketIntelligence`     | Industry benchmarks and competitive intelligence         | View rate benchmarks, category trends                           |
| 38  | Spend Prediction       | `BrandSpendPrediction`   | Brand's own spend forecasting and modeling               | Forecast budget requirements, model spend scenarios             |
| 39  | Brands                 | `Brands`                 | Browse other brands for competitive context              | Explore brand directory, view partnership activity              |
| 40  | Analytics              | `Analytics`              | General brand performance analytics                      | Cross-campaign performance overview                             |
| 41  | Event Management       | `EventManagement`        | Manage brand-sponsored events and activations            | Create events, manage talent appearances                        |
| 42  | Notifications          | `Notifications`          | Brand notification center                                | View alerts, configure preferences                              |
| 43  | Teams                  | `Teams`                  | Brand team management                                    | Invite collaborators, set permissions                           |
| 44  | Connect Accounts       | `ConnectAccounts`        | Link external accounts                                   | Connect CRM, social media monitoring, analytics tools           |
| 45  | Integrations           | `Integrations`           | Third-party platform integrations                        | Manage connected tools                                          |
| 46  | Subscriptions          | `SubscriptionManagement` | Manage plan and billing                                  | Upgrade, change plan                                            |
| 47  | Billing History        | `BillingHistory`         | Transaction history                                      | Download invoices                                               |
| 48  | Settings               | `Settings`               | Brand account settings                                   | Profile, preferences, security                                  |
| 49  | Create Opportunity     | `CreateOpportunity`      | Post a new brand partnership opportunity                 | Define requirements, budget, deliverables, timeline             |
| 50  | Deal Detail            | `DealDetail`             | Single deal deep-dive view                               | View all deal data, notes, documents, contacts                  |

---

#### Agency Core Views (46 pages — from agency nav in Layout.jsx)

| #   | Page Name              | Route Key                | Function                                            | Key Actions                                                 |
| --- | ---------------------- | ------------------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Dashboard              | `Dashboard`              | Agency command center with roster and deal overview | View roster health, active deals, pipeline value, AI alerts |
| 2   | Marketplace            | `Marketplace`            | Browse brand opportunities for roster talent        | Find opportunities matching roster talent profiles          |
| 3   | Master Calendar        | `MasterCalendar`         | Consolidated calendar across all roster talent      | Manage deliverable timelines for entire roster              |
| 4   | Culture Calendar       | `CultureCalendar`        | Cultural moment planning for roster                 | Align roster content with cultural events                   |
| 5   | Talent Roster          | `TalentDiscovery`        | Manage and browse agency talent roster              | View roster, filter by tier/niche, manage talent profiles   |
| 6   | Talent Analytics       | `TalentAnalytics`        | Performance analytics across roster talent          | Compare roster engagement, audience overlap, growth trends  |
| 7   | Talent Revenue         | `TalentRevenue`          | Revenue tracking for roster talent                  | View earnings by talent, project commissions                |
| 8   | Brands                 | `Brands`                 | Browse brand directory for deal prospecting         | Research brands, view deal history, assess alignment        |
| 9   | Deal Pipeline          | `Partnerships`           | Manage all agency-brokered deals                    | Pipeline view across all talent/brand combinations          |
| 10  | Bundle Deals           | `BundleDeals`            | Package multiple roster talents for brand campaigns | Create multi-talent bundles, set package pricing            |
| 11  | Data Room (Talent)     | `TalentDataRoom`         | Talent performance data for client negotiation      | Access verified metrics for roster talent                   |
| 12  | Data Room (Brand)      | `BrandDataRoom`          | Brand deal intelligence                             | Research brand deal history before negotiation              |
| 13  | Data Room (Agency)     | `AgencyDataRoom`         | Agency-specific deal outcomes and intelligence      | Review own deal history, benchmark performance              |
| 14  | Deal Analytics         | `DealAnalytics`          | Agency-wide deal performance analytics              | Win rates, deal value, commissions earned                   |
| 15  | Deal Comparison        | `DealComparison`         | Compare deal proposals across roster                | Side-by-side proposal evaluation                            |
| 16  | Deal Score Leaderboard | `DealScoreLeaderboard`   | AI-scored deal quality ranking                      | Identify best deals in agency pipeline                      |
| 17  | Custom Reports         | `CustomReports`          | Build client-facing and internal reports            | Custom analytics, client reporting templates                |
| 18  | Outreach               | `Outreach`               | Manage brand outreach on behalf of roster           | Outreach sequences, open/reply tracking                     |
| 19  | Contact Finder         | `ContactFinder`          | Identify brand-side contacts                        | Research decision makers at target brands                   |
| 20  | Warm Intro Network     | `WarmIntroNetwork`       | Leverage network for warm introductions             | Map relationship paths for talent or agency                 |
| 21  | Pitch Competition      | `PitchCompetition`       | Submit roster talent to brand pitch competitions    | Review opportunities, submit pitches                        |
| 22  | Sequences              | `SequenceBuilder`        | Build outreach automation for agency                | Create and manage multi-step email sequences                |
| 23  | Approvals              | `Approvals`              | Manage deliverable approvals for roster             | Review brand feedback, coordinate talent approvals          |
| 24  | Match Engine           | `MatchEngine`            | AI compatibility scoring for roster + brand pairs   | Run match analysis across entire roster                     |
| 25  | Campaign Briefs        | `CampaignBriefGenerator` | Generate campaign briefs for talent-brand deals     | Generate briefs, customize for each talent                  |
| 26  | AI Features            | `AIFeatures`             | AI capabilities for agency workflows                | Browse and activate AI agents                               |
| 27  | AI Agents Hub          | `AIAgentsHub`            | Access all 32 AI agents                             | Run agents, manage workflows                                |
| 28  | AI Command Center      | `AICommandCenter`        | Natural language AI interface                       | Issue cross-roster commands and analytics queries           |
| 29  | Pitch Deck Builder     | `PitchDeckBuilder`       | Build pitch decks for talent-brand proposals        | Create agency-branded decks                                 |
| 30  | Deck Library           | `DeckLibrary`            | Saved deck archive                                  | Browse saved decks, reuse templates                         |
| 31  | Contract Templates     | `ContractTemplates`      | Agency-specific contract templates                  | Standard agency agreements, talent representation contracts |
| 32  | Referrals              | `Referrals`              | Agency referral program                             | Refer new talent or brands, earn rewards                    |
| 33  | Market Intelligence    | `MarketIntelligence`     | Industry rate benchmarks and trends                 | View market rates, inform talent negotiations               |
| 34  | Spend Prediction       | `BrandSpendPrediction`   | Brand budget forecasting for outreach timing        | Identify when brands have budget to spend                   |
| 35  | Platform Overview      | `PlatformOverview`       | Platform feature orientation                        | Explore all agency-available tools                          |
| 36  | Demographic Targeting  | `DemographicTargeting`   | Define audience targets for roster campaigns        | Build audience segments for brand pitches                   |
| 37  | Analytics              | `Analytics`              | General agency analytics                            | Performance overview across all activity                    |
| 38  | ROI Simulator          | `SimulationEngine`       | Model deal ROI for client pitches                   | Simulate outcomes, build client business cases              |
| 39  | Data Import/Export     | `DataImportExport`       | Bulk data management                                | Import talent data, export client reports                   |
| 40  | Event Management       | `EventManagement`        | Manage events and activations for roster            | Schedule events, coordinate talent appearances              |
| 41  | Notifications          | `Notifications`          | Agency notification center                          | Platform alerts, deal updates                               |
| 42  | Teams                  | `Teams`                  | Agency team management                              | Manage agents, assign talent accounts                       |
| 43  | Connect Accounts       | `ConnectAccounts`        | Link external accounts for agency                   | Connect tools, social APIs                                  |
| 44  | Integrations           | `Integrations`           | Third-party integrations                            | CRM, email, payment integrations                            |
| 45  | Subscriptions          | `SubscriptionManagement` | Agency plan management                              | Upgrade plan, manage billing                                |
| 46  | Billing History        | `BillingHistory`         | Transaction and invoice history                     | Download invoices                                           |
| 47  | Settings               | `Settings`               | Agency account settings                             | Profile, preferences, security                              |
| 48  | Deal Detail            | `DealDetail`             | Single deal deep-dive                               | Full deal record, notes, documents                          |

---

#### Admin Core Views (58 pages — from admin nav in Layout.jsx; full access to all platform areas)

| #   | Page Name              | Route Key                | Function                                   | Key Actions                                                |
| --- | ---------------------- | ------------------------ | ------------------------------------------ | ---------------------------------------------------------- |
| 1   | Dashboard              | `Dashboard`              | Platform-wide unified dashboard            | Global KPIs, all-role activity feed, system alerts         |
| 2   | Admin Dashboard        | `AdminDashboard`         | Admin-exclusive platform operations center | User management, platform health metrics, revenue overview |
| 3   | Data Manager           | `AdminDataManager`       | Direct database entity management          | View/edit/delete any record across all entities            |
| 4   | Marketplace            | `Marketplace`            | Full marketplace oversight                 | Moderate listings, view all opportunities                  |
| 5   | My Profile             | `TalentProfile`          | Talent profile management                  | Manage any talent profile                                  |
| 6   | My Opportunities       | `BrandDashboard`         | Brand opportunity oversight                | View all brand opportunities                               |
| 7   | Master Calendar        | `MasterCalendar`         | Platform-wide calendar                     | Full view of all events and deadlines                      |
| 8   | Culture Calendar       | `CultureCalendar`        | Culture moment administration              | Add, edit, manage cultural events                          |
| 9   | Market Intelligence    | `MarketIntelligence`     | Full market data management                | Manage benchmarks, update rate data                        |
| 10  | Spend Prediction       | `BrandSpendPrediction`   | Brand budget data administration           | Manage prediction models                                   |
| 11  | Demographic Targeting  | `DemographicTargeting`   | Segment administration                     | Manage demographic data                                    |
| 12  | Platform Overview      | `PlatformOverview`       | Platform health and feature overview       | Monitor feature adoption                                   |
| 13  | AI Features            | `AIFeatures`             | AI capability management                   | Configure AI feature flags                                 |
| 14  | AI Agents Hub          | `AIAgentsHub`            | AI agent management                        | Monitor agent usage, configure agents                      |
| 15  | AI Command Center      | `AICommandCenter`        | AI command interface with admin context    | Full platform-scope AI commands                            |
| 16  | Talent Discovery       | `TalentDiscovery`        | Full talent directory management           | View, filter, manage all talent records                    |
| 17  | Talent Analytics       | `TalentAnalytics`        | Platform-wide talent performance data      | Cross-platform analytics                                   |
| 18  | Talent Revenue         | `TalentRevenue`          | Revenue data management                    | Manage revenue matrices and benchmarks                     |
| 19  | Brands                 | `Brands`                 | Brand directory management                 | View and manage all brand records                          |
| 20  | Deal Pipeline          | `Partnerships`           | Full deal pipeline oversight               | View all deals across all users                            |
| 21  | Bundle Deals           | `BundleDeals`            | Bundle deal administration                 | Manage all bundle configurations                           |
| 22  | Data Room (Talent)     | `TalentDataRoom`         | Talent data room administration            | Full access to all talent data entries                     |
| 23  | Data Room (Brand)      | `BrandDataRoom`          | Brand data room administration             | Full access to all brand data entries                      |
| 24  | Data Room (Agency)     | `AgencyDataRoom`         | Agency data room administration            | Full access to all agency data entries                     |
| 25  | Deal Analytics         | `DealAnalytics`          | Platform-wide deal analytics               | Cross-user deal performance data                           |
| 26  | Deal Comparison        | `DealComparison`         | Global deal comparison                     | Compare any deals across the platform                      |
| 27  | Deal Score Leaderboard | `DealScoreLeaderboard`   | Global deal score ranking                  | Platform-wide deal quality ranking                         |
| 28  | Custom Reports         | `CustomReports`          | Full-access custom reporting               | Build reports spanning all user data                       |
| 29  | Outreach               | `Outreach`               | Outreach oversight                         | View all outreach activity                                 |
| 30  | Contact Finder         | `ContactFinder`          | Contact database management                | Full contact directory access                              |
| 31  | Warm Intro Network     | `WarmIntroNetwork`       | Network graph administration               | View and manage all relationship paths                     |
| 32  | Pitch Competition      | `PitchCompetition`       | Competition management                     | Create and moderate competitions                           |
| 33  | Sequences              | `SequenceBuilder`        | Outreach sequence management               | View and manage all sequences                              |
| 34  | Approvals              | `Approvals`              | Platform-wide approval oversight           | View all pending and resolved approvals                    |
| 35  | Match Engine           | `MatchEngine`            | Match algorithm management                 | Configure scoring weights, run system-wide matches         |
| 36  | Campaign Briefs        | `CampaignBriefGenerator` | Campaign brief oversight                   | View all generated briefs                                  |
| 37  | Data Import/Export     | `DataImportExport`       | Platform data management                   | Bulk import/export for all entities                        |
| 38  | ROI Simulator          | `SimulationEngine`       | Simulation engine administration           | Configure models, run platform-wide simulations            |
| 39  | Pitch Deck Builder     | `PitchDeckBuilder`       | Deck builder administration                | Manage templates and AI generation settings                |
| 40  | Deck Library           | `DeckLibrary`            | Platform deck library                      | Manage all saved decks                                     |
| 41  | Contract Templates     | `ContractTemplates`      | Contract template management               | Create, update, and publish templates platform-wide        |
| 42  | Referrals              | `Referrals`              | Referral program administration            | Manage referral rules, track and fulfill rewards           |
| 43  | Notifications          | `Notifications`          | Notification management                    | View all platform notifications, manage delivery           |
| 44  | Teams                  | `Teams`                  | Team and organization management           | Manage all team structures                                 |
| 45  | System Health          | `SystemHealth`           | Platform infrastructure monitoring         | View uptime, error rates, queue lengths, API latency       |
| 46  | AI Analytics           | `AIAnalytics`            | AI system performance monitoring           | View agent usage, token costs, cache hit rates, error logs |
| 47  | Architecture           | `SystemArchitecture`     | System architecture documentation viewer   | Browse infrastructure diagrams, component maps             |
| 48  | Integrations           | `Integrations`           | Platform integration management            | Configure all third-party connections                      |
| 49  | Connect Accounts       | `ConnectAccounts`        | OAuth connection management                | Manage platform-wide OAuth credentials                     |
| 50  | Subscriptions          | `SubscriptionManagement` | Subscription plan administration           | Manage plans, pricing, feature flags                       |
| 51  | Billing                | `BillingHistory`         | Platform billing management                | View all billing records, manage payments                  |
| 52  | Settings               | `Settings`               | Platform-wide settings                     | Global configuration and preferences                       |
| 53  | Analytics              | `Analytics`              | Cross-platform analytics                   | Full analytics access                                      |
| 54  | Event Management       | `EventManagement`        | Platform event management                  | Administer all events                                      |
| 55  | Create Opportunity     | `CreateOpportunity`      | Create brand opportunities                 | Create on behalf of any brand                              |
| 56  | Deal Detail            | `DealDetail`             | Full deal record access                    | View and edit any deal                                     |
| 57  | Creator Calculator     | `CreatorCalculator`      | Public creator earnings calculator         | Embedded public tool                                       |
| 58  | Onboarding             | `Onboarding`             | Onboarding flow management                 | Monitor and test onboarding flow                           |

---

#### Shared / Cross-User Features

| Page Name          | Route Key         | Accessible By                | Function                                                       |
| ------------------ | ----------------- | ---------------------------- | -------------------------------------------------------------- |
| Marketplace        | `Marketplace`     | Talent, Brand, Agency, Admin | Discovery and opportunity hub (role-contextual view)           |
| Deal Pipeline      | `Partnerships`    | All roles                    | End-to-end deal management kanban and table                    |
| Deal Detail        | `DealDetail`      | All roles                    | Single-deal deep-dive with full context                        |
| Match Engine       | `MatchEngine`     | All roles                    | AI-powered compatibility scoring (Brand↔Talent, Talent↔Agency) |
| Outreach           | `Outreach`        | All roles                    | Outreach campaign management and tracking                      |
| Approvals          | `Approvals`       | All roles                    | Content and deliverable approval workflow                      |
| Notifications      | `Notifications`   | All roles                    | Centralized notification and alert center                      |
| Master Calendar    | `MasterCalendar`  | All roles                    | Cross-role campaign and deadline calendar                      |
| Culture Calendar   | `CultureCalendar` | All roles                    | Shared cultural moment planning calendar                       |
| AI Command Center  | `AICommandCenter` | All roles                    | Natural language AI interface                                  |
| AI Agents Hub      | `AIAgentsHub`     | All roles                    | Access to all 32 AI agents                                     |
| Analytics          | `Analytics`       | All roles                    | Platform performance analytics                                 |
| Teams              | `Teams`           | All roles                    | Team and collaborator management                               |
| Data Room (Talent) | `TalentDataRoom`  | All roles                    | Talent intelligence data repository                            |
| Data Room (Brand)  | `BrandDataRoom`   | All roles                    | Brand intelligence data repository                             |
| Data Room (Agency) | `AgencyDataRoom`  | All roles                    | Agency intelligence data repository                            |

---

#### Settings & Account

| Page Name               | Route Key                | Function                                                                            |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| Settings                | `Settings`               | Account preferences, profile editing, security settings, notification configuration |
| Notifications           | `Notifications`          | Notification center; view all alerts; configure delivery preferences                |
| Connect Accounts        | `ConnectAccounts`        | OAuth-link social media platforms (Instagram, YouTube, TikTok, X, etc.)             |
| Integrations            | `Integrations`           | Third-party tool integrations (CRM, email, payments, analytics)                     |
| Subscription Management | `SubscriptionManagement` | View current plan, upgrade, downgrade, manage payment method                        |
| Billing History         | `BillingHistory`         | Historical invoice and transaction ledger                                           |
| Teams                   | `Teams`                  | Invite collaborators, assign roles, manage team access                              |
| Referrals               | `Referrals`              | Referral program: generate links, track status, earn rewards                        |

---

#### Admin & Internal Tools

| Page Name           | Route Key            | Access     | Function                                                                          |
| ------------------- | -------------------- | ---------- | --------------------------------------------------------------------------------- |
| Admin Dashboard     | `AdminDashboard`     | Admin only | Platform operations center; user metrics, revenue, system alerts                  |
| Admin Data Manager  | `AdminDataManager`   | Admin only | Direct CRUD access to all database entities (57 entity types)                     |
| System Health       | `SystemHealth`       | Admin only | Infrastructure monitoring: uptime, error rates, API latency, queue depths         |
| System Architecture | `SystemArchitecture` | Admin only | Interactive architecture documentation and component diagram viewer               |
| AI Analytics        | `AIAnalytics`        | Admin only | AI system monitoring: agent usage, provider costs, cache performance, error rates |

---

#### Error / Empty / Edge States

| State                        | Trigger                                    | Behavior                                                                           |
| ---------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| 404 Not Found                | Unknown route (`*` catch-all)              | Renders `NotFound` page; provides navigation back to Dashboard                     |
| Empty State / Seed Banner    | Authenticated user with zero data          | `EmptyStateSeedBanner` component offers one-click demo data seeding                |
| Access Denied / Upgrade Gate | `canAccess()` returns false; trial expired | `FeatureGate` component overlays locked state; `UpgradeModal` prompts subscription |
| Onboarding Gate              | Unauthenticated user accessing app routes  | Redirected to `/` (Onboarding/Landing)                                             |
| Authentication Loading       | Auth state loading                         | Full-screen spinner; prevents premature route access                               |
| Demo Data Seeding            | New user triggers `useAutoSeed`            | Full-screen seeding loader: "Setting up your workspace..."                         |
| Trial Banner                 | Trial active, plan is free                 | Inline gold banner with days-remaining countdown and upgrade CTA                   |
| Trial Expired Banner         | Trial ended, no paid plan                  | Inline red banner; all premium features locked behind upgrade wall                 |
| Error Boundary               | Unhandled React runtime error              | `ErrorBoundary` class component catches and displays error with reload option      |
| User Not Registered          | Auth succeeds but no profile found         | `UserNotRegisteredError` component; guides user to complete registration           |

---

### 5.2 Screen Count Summary

| Area                                                                                   | Screen Count                                                                            |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Authentication & Access                                                                | 7                                                                                       |
| Onboarding Flow (steps)                                                                | 4                                                                                       |
| Talent Core Views                                                                      | 48                                                                                      |
| Brand Core Views                                                                       | 50                                                                                      |
| Agency Core Views                                                                      | 48                                                                                      |
| Admin Core Views                                                                       | 58                                                                                      |
| Settings & Account                                                                     | 8                                                                                       |
| Admin & Internal Tools                                                                 | 5                                                                                       |
| Public Marketing Pages                                                                 | 10 (About, Blog, Careers, Contact, Customers, CookiePolicy, GDPR, Demo, Terms, Privacy) |
| Public Feature Landing Pages                                                           | 5 (Talent Discovery, Deal Pipeline, Media Kits, Payments, Integrations)                 |
| Error / Edge States                                                                    | 9                                                                                       |
| **Total Unique Route Keys (pages.config.js)**                                          | **71 lazy-loaded page components**                                                      |
| **Estimated Total Distinct Screens (all roles combined, including unique role views)** | **~120+**                                                                               |

> Note: Many screens are shared across roles with role-contextual rendering. The 71 lazy-loaded route keys represent unique code-split page bundles. Role-differentiated views add additional logical screens within shared route keys (e.g., Dashboard renders TalentDashboardPanel vs. BrandDashboardPanel based on role).

---

### 5.3 Permission Matrix

| Page / Feature                          | Talent | Brand | Agency             | Admin |
| --------------------------------------- | ------ | ----- | ------------------ | ----- |
| Dashboard                               | Full   | Full  | Full               | Full  |
| Marketplace                             | Full   | Full  | Full               | Full  |
| My Profile (TalentProfile)              | Full   | None  | None               | Full  |
| My Opportunities (BrandDashboard)       | None   | Full  | None               | Full  |
| Talent Discovery                        | Read   | Full  | Full (Roster view) | Full  |
| Brands                                  | Full   | Full  | Full               | Full  |
| Deal Pipeline (Partnerships)            | Full   | Full  | Full               | Full  |
| Deal Detail                             | Full   | Full  | Full               | Full  |
| Bundle Deals                            | Full   | Full  | Full               | Full  |
| Match Engine                            | Full   | Full  | Full               | Full  |
| Outreach                                | Full   | Full  | Full               | Full  |
| Contact Finder                          | Full   | Full  | Full               | Full  |
| Warm Intro Network                      | Full   | Full  | Full               | Full  |
| Pitch Competition                       | Full   | Full  | Full               | Full  |
| Sequence Builder                        | Full   | Full  | Full               | Full  |
| Approvals                               | Full   | Full  | Full               | Full  |
| Campaign Brief Generator                | Full   | Full  | Full               | Full  |
| Pitch Deck Builder                      | Full   | Full  | Full               | Full  |
| Deck Library                            | None   | Full  | Full               | Full  |
| Contract Templates                      | Full   | Full  | Full               | Full  |
| ROI Simulator (SimulationEngine)        | Full   | Full  | Full               | Full  |
| Data Import/Export                      | Full   | Full  | Full               | Full  |
| Demographic Targeting                   | Full   | Full  | Full               | Full  |
| Talent Analytics                        | Full   | Full  | Full               | Full  |
| Talent Revenue                          | Full   | Full  | Full               | Full  |
| Data Room (Talent)                      | Full   | Full  | Full               | Full  |
| Data Room (Brand)                       | Full   | Full  | Full               | Full  |
| Data Room (Agency)                      | Full   | Full  | Full               | Full  |
| Deal Analytics                          | Full   | Full  | Full               | Full  |
| Deal Comparison                         | Full   | Full  | Full               | Full  |
| Deal Score Leaderboard                  | Full   | Full  | Full               | Full  |
| Custom Reports                          | Full   | Full  | Full               | Full  |
| Market Intelligence                     | Full   | Full  | Full               | Full  |
| Spend Prediction (BrandSpendPrediction) | Full   | Full  | Full               | Full  |
| AI Features                             | Full   | Full  | Full               | Full  |
| AI Agents Hub                           | Full   | Full  | Full               | Full  |
| AI Command Center                       | Full   | Full  | Full               | Full  |
| Platform Overview                       | Full   | Full  | Full               | Full  |
| Master Calendar                         | Full   | Full  | Full               | Full  |
| Culture Calendar                        | Full   | Full  | Full               | Full  |
| Event Management                        | Full   | Full  | Full               | Full  |
| Analytics                               | Full   | Full  | Full               | Full  |
| Notifications                           | Full   | Full  | Full               | Full  |
| Teams                                   | Full   | Full  | Full               | Full  |
| Connect Accounts                        | Full   | Full  | Full               | Full  |
| Integrations                            | Full   | Full  | Full               | Full  |
| Subscription Management                 | Full   | Full  | Full               | Full  |
| Billing History                         | Full   | Full  | Full               | Full  |
| Settings                                | Full   | Full  | Full               | Full  |
| Referrals                               | Full   | Full  | Full               | Full  |
| Create Opportunity                      | None   | Full  | Full               | Full  |
| Admin Dashboard                         | None   | None  | None               | Full  |
| Admin Data Manager                      | None   | None  | None               | Full  |
| System Health                           | None   | None  | None               | Full  |
| System Architecture                     | None   | None  | None               | Full  |
| AI Analytics                            | None   | None  | None               | Full  |

**Access Level Key:**

- Full: Full read/write access appropriate to role context
- Read: Read-only access
- None: No access; redirected to Dashboard by RoleGuard

**Feature Gating Overlay (applies across all roles):**

- Free tier: Only `Dashboard`, `Marketplace`, `TalentProfile`, `ConnectAccounts`, `Settings`, `Notifications`, `Onboarding`, `PlatformOverview`, `BillingHistory`, `SubscriptionManagement` accessible without trial or paid plan
- Trial (7 days): All role-permitted pages accessible during active trial period
- Paid plan: All role-permitted pages fully unlocked
- Admin role: Bypasses all feature gates; full access always

---

### 5.4 Multi-Platform Coverage

| Platform             | Status                          | Notes                                                                                                                |
| -------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Web Desktop          | Live — Full                     | Primary platform; full sidebar navigation, all features available; max-width 1600px layout                           |
| Web Mobile           | Live — Adapted                  | Responsive layout; mobile sidebar replaced with slide-over menu triggered by hamburger icon; all features accessible |
| iOS (Native App)     | Not Available — Planned Q3 2026 | Roadmap item; not yet in development                                                                                 |
| Android (Native App) | Not Available — Planned Q3 2026 | Roadmap item; not yet in development                                                                                 |

---

## SECTION 6: CORE PRODUCT & INTELLIGENCE SYSTEMS

### 6.1 Match Engine

The Match Engine is DealStage's proprietary AI-powered compatibility scoring system. It computes weighted match scores between counterparties across two primary matching directions: **Brand-to-Talent** and **Talent-to-Agency**.

#### 6.1.1 Brand-to-Talent Matching — 10-Factor Weighted Scoring Model

| Rank | Factor                      | Weight   | Scoring Method                                  | Data Sources                                   |
| ---- | --------------------------- | -------- | ----------------------------------------------- | ---------------------------------------------- |
| 1    | Audience Demographics Match | 18%      | Cosine similarity of demographic vectors        | Social APIs, brand target audience data        |
| 2    | Content Niche Alignment     | 15%      | Category overlap + semantic similarity analysis | Content analysis engine, brand preference data |
| 3    | Content-Brand Aesthetic Fit | 12%      | CLIP embedding similarity (visual AI)           | Content images, brand visual guidelines        |
| 4    | Trajectory Prediction       | 12%      | Alpha score multiplied by trajectory confidence | Trajectory Prediction Engine (AI agent)        |
| 5    | Engagement Quality          | 10%      | Weighted engagement rate vs. tier benchmark     | Social platform metrics, rate benchmarks table |
| 6    | Brand Safety                | 10%      | Historical content scan, controversy score      | Content analysis, news monitoring              |
| 7    | Relationship Path Exists    | 8%       | Path strength from Neo4j relationship graph     | Warm Intro Network graph                       |
| 8    | Budget Fit                  | 8%       | Rate estimate vs. brand budget range overlap    | Rate benchmarks, brand budget data             |
| 9    | Past Performance            | 5%       | Historical deal success rate from deal outcomes | Deal outcomes database (Data Rooms)            |
| 10   | Geographic Relevance        | 2%       | Location overlap scoring                        | Audience location data, brand target markets   |
|      | **Total**                   | **100%** |                                                 |                                                |

#### 6.1.2 Talent-to-Agency Matching — 7-Factor Model

| Rank | Factor                  | Weight   | Description                                                                            |
| ---- | ----------------------- | -------- | -------------------------------------------------------------------------------------- |
| 1    | Category Specialization | 25%      | Agency depth of expertise in talent's content category                                 |
| 2    | Tier Alignment          | 20%      | Whether agency typically represents talent of similar audience size and tier           |
| 3    | Roster Composition      | 15%      | Whether adding this talent would be complementary vs. cannibalistic to existing roster |
| 4    | Commission Alignment    | 15%      | Whether commission rate expectations are mutually compatible                           |
| 5    | Geographic Focus        | 10%      | Alignment between agency's primary markets and talent's audience geography             |
| 6    | Growth Support          | 10%      | Agency's track record in growing talent to next tier                                   |
| 7    | Response Rate           | 5%       | Agency's historical responsiveness to talent inquiries                                 |
|      | **Total**               | **100%** |                                                                                        |

#### 6.1.3 Performance Benchmark

- **Reported Match Accuracy:** 94%
- **Scoring Range:** 0–100 composite score per pair
- **Output:** Ranked match list with per-factor score breakdown visible to users

---

### 6.2 AI Router

DealStage operates a **Universal AI Router v4** — a Supabase Edge Function (`ai-router`) that intelligently routes AI inference requests across multiple providers with resilience, cost optimization, and tier-based model selection.

#### 6.2.1 Provider Ecosystem

| Provider      | Models Used                                                                     | Primary Tier Role                              |
| ------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| Anthropic     | `claude-sonnet-4` (primary), `claude-3-5-sonnet`, `claude-3-5-haiku` (fallback) | COMPLEX tier primary; STANDARD fallback        |
| DeepSeek      | DeepSeek V3 (standard), DeepSeek Reasoner (reasoning)                           | STANDARD tier primary; REASONING tier          |
| Google Gemini | Gemini Flash                                                                    | FREE tier primary; universal fallback          |
| Groq          | Groq-hosted models                                                              | FAST tier primary; latency-sensitive inference |

#### 6.2.2 Routing Tier Architecture

| Tier      | Primary Provider  | Fallback Chain                      | Use Case                                                            |
| --------- | ----------------- | ----------------------------------- | ------------------------------------------------------------------- |
| COMPLEX   | Anthropic         | DeepSeek → Gemini → Groq            | Deep reasoning, financial analysis, strategic recommendations       |
| STANDARD  | DeepSeek          | Anthropic Haiku → Gemini → Groq     | Everyday tasks, summaries, content generation, analysis             |
| REASONING | DeepSeek Reasoner | Anthropic → Gemini                  | Multi-step logical inference, complex problem solving               |
| FREE      | Gemini            | DeepSeek → Groq → Anthropic Haiku   | Classification, tagging, translation, high-volume lightweight tasks |
| FAST      | Groq              | DeepSeek → Gemini → Anthropic Haiku | Real-time, low-latency inference requirements                       |
| BATCH     | Anthropic Haiku   | DeepSeek → Gemini                   | Off-peak bulk processing operations                                 |

#### 6.2.3 Router Features

| Feature          | Implementation                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Circuit Breaker  | Per-provider circuit breaker with `isProviderHealthy()`, `recordSuccess()`, `recordFailure()` — unhealthy providers are bypassed |
| Retry & Fallback | Automatic retry with next provider in tier chain on failure                                                                      |
| Response Caching | Per-agent configurable TTL cache (NONE / SHORT 5min / MEDIUM 1hr / LONG 6hr / DAY 24hr)                                          |
| Prompt Caching   | Anthropic prompt caching enabled via `cache_control: ephemeral` — 90% cost reduction on repeated system prompt calls             |
| Rate Limiting    | Provider-level rate limiting to prevent quota exhaustion                                                                         |
| Model Fallback   | Within Anthropic: iterates through `[primary model, sonnet-4, 3-5-sonnet, 3-5-haiku]` before failing over to next provider       |
| Off-Peak Routing | `offPeakOnly` flag routes batch/expensive tasks to off-peak scheduling                                                           |

---

### 6.3 AI & Automation Layer

DealStage deploys **32 named AI agents** organized across four capability tiers. All agents are configured in `agents.ts` and invoked via the Universal AI Router.

#### 6.3.1 COMPLEX Tier — Claude Sonnet (Deep Reasoning & Financial)

These agents handle tasks requiring nuanced reasoning, multi-variable analysis, and high-stakes outputs. They are not cached aggressively due to their contextual, session-specific nature.

| Agent Key               | Agent Name                     | Function                                                                                             |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `partnership_predictor` | Partnership Success Predictor  | Predicts probability of partnership success based on historical patterns and current deal parameters |
| `pricing_optimizer`     | Optimal Pricing Recommender    | Recommends optimal deal pricing given market benchmarks, talent tier, and brand budget signals       |
| `contract_intelligence` | Contract Intelligence Analyzer | Analyzes contract terms for risk, fairness, and missing clauses; flags non-standard provisions       |
| `negotiation_coach`     | Negotiation Coach              | Real-time negotiation guidance; suggests counter-offers, identifies leverage points                  |

#### 6.3.2 STANDARD Tier — DeepSeek V3 (Everyday Analysis & Generation)

The largest tier, covering the breadth of platform intelligence tasks from content generation to financial forecasting.

| Agent Key                | Agent Name                         | Function                                                                                                  |
| ------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `executive_briefing`     | Executive Briefing Generator       | Generates condensed executive summaries of deal status, market conditions, and pipeline health            |
| `ai_command_center`      | AI Command Center                  | Natural language interface agent that interprets user commands and routes to appropriate platform actions |
| `campaign_generator`     | AI Campaign Generator              | Generates full campaign concept briefs from brand objectives and talent profiles                          |
| `outreach_generator`     | AI Outreach Generator              | Writes personalized outreach emails tailored to specific talent-brand pairs                               |
| `creative_direction`     | Creative Direction Generator       | Produces creative direction documents for partnerships including tone, visual style, key messages         |
| `smart_alerts`           | Smart Alert Generator              | Proactively generates actionable alerts from platform data signals                                        |
| `deal_patterns`          | Deal Pattern Analyzer              | Identifies patterns across completed deals to surface winning deal structures                             |
| `content_effectiveness`  | Content Effectiveness Analyzer     | Scores past content performance against deal outcomes to identify what converts                           |
| `outreach_forecast`      | Outreach Conversion Forecaster     | Predicts conversion probability for outreach sequences before launch                                      |
| `success_factors`        | Success Factor Identifier          | Analyzes completed deals to extract the specific factors that drove success                               |
| `post_mortem`            | Campaign Post-Mortem Analyzer      | Structured post-campaign analysis comparing predicted vs. actual outcomes                                 |
| `talent_trajectory`      | Talent Value Trajectory Predictor  | Projects a talent's audience growth and market value trajectory over 6–24 months                          |
| `competitor_intel`       | Competitor Intelligence Analyzer   | Analyzes competitive landscape for brands and talent based on market data                                 |
| `audience_overlap`       | Audience Overlap Analyzer          | Maps audience overlap between talent and brand's existing customer base                                   |
| `revenue_forecast`       | Revenue Forecaster                 | Projects revenue for talent, brands, or the platform based on pipeline and historical data                |
| `relationship_health`    | Relationship Health Monitor        | Scores the health of active partnerships based on communication patterns and deliverable compliance       |
| `brand_safety`           | Brand Safety Analyzer              | Screens talent content history for brand safety risks before deal initiation                              |
| `trend_prediction`       | Trend Prediction Engine            | Forecasts emerging partnership and content trends based on market signals                                 |
| `roster_optimization`    | Roster Optimization Advisor        | Advises agencies on optimal roster composition changes to maximize deal flow and commissions              |
| `attribution`            | Cross-Platform Attribution Modeler | Models contribution of each content touchpoint to final campaign conversion                               |
| `compliance`             | Compliance & Disclosure Analyzer   | Verifies FTC/ASA disclosure compliance in content and contract terms                                      |
| `invoice_reconciliation` | Invoice Reconciliation Analyzer    | Matches invoices against deal terms and flags discrepancies                                               |
| `bulk_ops`               | Bulk Agent Operations              | Orchestrates parallel execution of agent tasks across multiple records                                    |
| `partnership_simulator`  | Partnership Simulator              | Runs scenario simulations for proposed partnerships with probability-weighted outcome modeling            |
| `deal_scorer`            | Deal Leaderboard Scorer            | Computes the composite score that drives the Deal Score Leaderboard rankings                              |

#### 6.3.3 FREE Tier — Gemini Flash (Classification & Enrichment)

High-volume, lower-complexity tasks optimized for cost efficiency with long cache TTLs.

| Agent Key           | Agent Name                 | Function                                                                                 |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| `agent_performance` | Agent Performance Analyzer | Monitors and reports on AI agent accuracy, latency, and cost metrics                     |
| `content_localizer` | Content Localizer          | Adapts content and messaging for regional language and cultural context                  |
| `data_extractor`    | Data Extractor             | Extracts structured data from unstructured text inputs (e.g., inbound emails, documents) |

#### 6.3.4 Agent Configuration Summary

| Parameter     | Description                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `maxTokens`   | All agents configured at 4,096 tokens (8,192 for `executive_briefing`)                                                                                 |
| `temperature` | Range 0.1–0.6: lower for analytical/compliance tasks; higher for creative tasks                                                                        |
| `useCache`    | True for most agents; False for session-specific agents (negotiation, outreach, command center)                                                        |
| `cacheTTL`    | NONE (0s) for real-time; SHORT (5min) for time-sensitive; MEDIUM (1hr) for analysis; LONG (6hr) for compliance; DAY (24hr) for localization/extraction |

---

### 6.4 Feedback Loop Engine

Completed deals are the engine of DealStage's proprietary intelligence moat. Every deal that reaches a terminal state (completed, cancelled, disputed) writes outcome data back to the platform in a structured feedback loop.

#### 6.4.1 Feedback Loop Mechanics

```
Deal Completion
      |
      v
+----------------------------------+
|  Outcome Data Written To:        |
|  - TalentDataRoom                |
|  - BrandDataRoom                 |
|  - AgencyDataRoom                |
+----------------------------------+
      |
      v
+----------------------------------+
|  Downstream Systems Updated:     |
|  - Match Engine scoring weights  |
|    (actual vs. predicted outcomes|
|     fine-tune factor weights)    |
|  - Rate Benchmarks table         |
|    (actual rates paid)           |
|  - ROI Benchmarks table          |
|    (actual ROI achieved)         |
|  - Trajectory Engine             |
|    (talent performance confirmed)|
|  - Deal Pattern Analyzer agent   |
|    (new patterns ingested)       |
+----------------------------------+
      |
      v
+----------------------------------+
|  Improved Predictions For:       |
|  - Future match recommendations  |
|  - Pricing optimization outputs  |
|  - ROI Simulator projections     |
|  - Spend Prediction forecasts    |
|  - Partnership success scores    |
+----------------------------------+
```

#### 6.4.2 Data Rooms as Institutional Memory

| Data Room        | Captures                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Talent Data Room | Actual engagement rates, content performance, brand feedback, rate history, deal frequency        |
| Brand Data Room  | Campaign ROI actuals, average deal size, category preferences, approval patterns, payment history |
| Agency Data Room | Commission rate norms, deal velocity, roster win rates, brand relationships, response rates       |

The three data rooms collectively constitute DealStage's **proprietary partnership intelligence database** — data that no competing platform possesses because it is generated exclusively through DealStage-facilitated transactions.

---

## SECTION 7: DATA ARCHITECTURE & STRATEGY

### 7.1 Core Data Entities

DealStage's data layer is built on Supabase (PostgreSQL) with **57 named entity types** mapped in `base44Client.js`. Below is the complete entity inventory organized by functional domain.

#### 7.1.1 User & Profile Domain

| Entity            | Table                 | Description                                                                          |
| ----------------- | --------------------- | ------------------------------------------------------------------------------------ |
| Profile           | `profiles`            | Core user record: role, plan, created_at, linked to Supabase auth.users              |
| Talent            | `talents`             | Talent-specific profile data: niche, tier, rates, audience stats, platform handles   |
| Brand             | `brands`              | Brand-specific profile data: industry, target audience, typical budget, headquarters |
| TalentType        | `talent_types`        | Lookup table for talent content categories and niche classifications                 |
| ConnectedPlatform | `connected_platforms` | OAuth-linked social media accounts per talent (platform + credentials)               |
| PlatformCatalog   | `platform_catalog`    | Directory of all supported social/content platforms with metadata                    |
| EmailConnection   | `email_connections`   | Connected email accounts for outreach sending                                        |

#### 7.1.2 Deal & Partnership Domain

| Entity              | Table                   | Description                                                              |
| ------------------- | ----------------------- | ------------------------------------------------------------------------ |
| Partnership         | `partnerships`          | Core deal record: status, stage, value, counterparties, timeline         |
| PartnershipProposal | `partnership_proposals` | Formal proposals submitted between counterparties prior to deal creation |
| DealNote            | `deal_notes`            | Freeform notes attached to a partnership record                          |
| DealScore           | `deal_scores`           | AI-computed composite deal quality scores (from `deal_scorer` agent)     |
| DealDispute         | `deal_disputes`         | Formal dispute records for deals that encounter conflicts                |
| BundleDeal          | `bundle_deals`          | Multi-talent or multi-deliverable bundle configurations                  |
| ApprovalItem        | `approval_items`        | Individual content or deliverable items submitted for brand approval     |
| ActivationChecklist | `activation_checklists` | Structured task checklists tied to deal activation milestones            |
| PlanningTimeline    | `planning_timelines`    | Milestone-based planning timelines attached to deal records              |
| Task                | `tasks`                 | Individual actionable tasks linked to deals, campaigns, or users         |
| Activity            | `activities`            | Audit-trail and activity feed entries across all platform actions        |

#### 7.1.3 Outreach & CRM Domain

| Entity                 | Table                       | Description                                                             |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------- |
| OutreachSequence       | `outreach_sequences`        | Multi-step automated outreach campaign configurations                   |
| OutreachEmail          | `outreach_emails`           | Individual email records within a sequence (content, send time, status) |
| OutreachMetrics        | `outreach_metrics`          | Performance metrics per sequence: opens, clicks, replies, conversions   |
| MarketplaceOpportunity | `marketplace_opportunities` | Brand-posted partnership opportunities visible in the Marketplace       |
| OpportunityApplication | `opportunity_applications`  | Talent/agency applications submitted to marketplace opportunities       |
| DecisionMaker          | `decision_makers`           | Contact records for brand-side decision makers (from Contact Finder)    |

#### 7.1.4 Financial & Subscription Domain

| Entity              | Table                    | Description                                                                            |
| ------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| EscrowPayment       | `escrow_payments`        | Payment records held in escrow during active deal execution                            |
| BillingHistory      | `billing_history`        | Platform subscription payment records and invoices                                     |
| SubscriptionPlan    | `subscription_plans`     | Available subscription plan configurations (features, pricing, limits)                 |
| UserSubscription    | `user_subscriptions`     | Per-user subscription records: plan, status, renewal dates                             |
| TalentRevenueStream | `talent_revenue_streams` | Individual revenue stream types for talent (sponsorship, affiliate, merchandise, etc.) |
| TalentRevenueMatrix | `talent_revenue_matrix`  | Historical and projected revenue data per talent per stream                            |

#### 7.1.5 Intelligence & Benchmarking Domain

| Entity             | Table                  | Description                                                                              |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| DataRoomEntry      | `data_room_entries`    | Individual intelligence entries stored in talent, brand, or agency data rooms            |
| RateBenchmark      | `rate_benchmarks`      | Market rate benchmarks by talent tier, niche, and platform                               |
| ROIBenchmark       | `roi_benchmarks`       | Historical ROI benchmark data by category and deal type                                  |
| PlatformMultiplier | `platform_multipliers` | Rate multipliers by social platform (e.g., YouTube commands premium over TikTok)         |
| CategoryPremium    | `category_premiums`    | Rate premium factors by content category (e.g., finance commands premium over lifestyle) |
| IndustryGuide      | `industry_guides`      | Curated industry intelligence guides for specific verticals                              |
| DemographicSegment | `demographic_segments` | User-defined or platform-defined audience demographic profiles                           |
| ViewershipTier     | `viewership_tiers`     | Tiered audience size classifications (nano, micro, mid, macro, mega)                     |

#### 7.1.6 Events & Calendar Domain

| Entity       | Table            | Description                                                                        |
| ------------ | ---------------- | ---------------------------------------------------------------------------------- |
| CultureEvent | `culture_events` | Cultural moments, holidays, and trend events for campaign planning                 |
| MegaEvent    | `mega_events`    | High-impact calendar events (major sporting events, award shows, product launches) |
| Conference   | `conferences`    | Industry conference and event records                                              |

#### 7.1.7 Content & Creative Domain

| Entity      | Table          | Description                            |
| ----------- | -------------- | -------------------------------------- |
| DeckLibrary | `deck_library` | Saved pitch deck records and templates |

#### 7.1.8 Team & Notification Domain

| Entity       | Table           | Description                                              |
| ------------ | --------------- | -------------------------------------------------------- |
| Team         | `teams`         | Team/organization records                                |
| TeamMember   | `team_members`  | Individual team membership records with role assignments |
| Notification | `notifications` | Platform notification records per user                   |

#### 7.1.9 Entity Count Summary

| Domain                      | Entity Count                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| User & Profile              | 7                                                                                                                     |
| Deal & Partnership          | 11                                                                                                                    |
| Outreach & CRM              | 6                                                                                                                     |
| Financial & Subscription    | 6                                                                                                                     |
| Intelligence & Benchmarking | 8                                                                                                                     |
| Events & Calendar           | 3                                                                                                                     |
| Content & Creative          | 1                                                                                                                     |
| Team & Notification         | 3                                                                                                                     |
| **Total**                   | **57** (note: `DeckLibrary` is both a page and an entity; `BillingHistory` appears in both billing and UI navigation) |

---

### 7.2 Data Flow Between Systems

The following describes how data moves through DealStage from initial user input through the full deal lifecycle and back into the intelligence layer.

```
STAGE 1: USER INPUT & PROFILE ENRICHMENT
-----------------------------------------
User signs up → Role selected (Talent/Brand/Agency)
      |
      v
Profile record created (profiles table)
      |
      +--[Talent]--> Social accounts connected via ConnectAccounts
      |               → ConnectedPlatform records created
      |               → Audience stats, engagement data ingested from social APIs
      |               → Talent record enriched with tier, niche, rate range
      |
      +--[Brand]---> Brand profile completed
      |               → Brand record created with industry, target audience, budget signals
      |
      +--[Agency]--> Agency profile completed
                      → Linked to talent roster records


STAGE 2: DISCOVERY & MATCH SCORING
------------------------------------
User accesses Match Engine / Marketplace / Talent Discovery
      |
      v
Match Engine runs 10-factor scoring algorithm
      |
Inputs: Talent profile data + Brand target data + Benchmarks + Relationship graph
      |
Output: Ranked match list with per-factor score breakdown (DealScore records written)
      |
      v
Talent/Brand/Agency reviews matches → selects partners of interest


STAGE 3: OUTREACH & PIPELINE ENTRY
-------------------------------------
Outreach initiated:
  - Direct outreach via Outreach module (OutreachSequence → OutreachEmail records)
  - Marketplace application (OpportunityApplication record created)
  - Warm introduction requested (WarmIntroNetwork path traversal)
      |
      v
Interest confirmed → PartnershipProposal created
      |
      v
Proposal accepted → Partnership record created (stage: "Proposed")


STAGE 4: DEAL NEGOTIATION & STRUCTURING
-----------------------------------------
Partnership moves through pipeline stages:
  Proposed → In Discussion → Terms Agreed → Contract Sent → Contract Signed → Active
      |
  AI agents activated:
  - negotiation_coach: real-time guidance
  - contract_intelligence: contract term analysis
  - pricing_optimizer: rate recommendations
  - partnership_predictor: success probability score
      |
      v
DealNote records added | Task records created | ApprovalItem records queued


STAGE 5: CONTRACT & PAYMENT
------------------------------
Contract executed → digital contract stored
      |
      v
EscrowPayment record created → funds held
      |
      v
Deliverables submitted → ApprovalItem records created
      |
Brand reviews → approves or requests revision
      |
All deliverables approved → EscrowPayment released → Partnership stage: "Completed"


STAGE 6: DATA ROOM WRITE-BACK & FEEDBACK LOOP
-----------------------------------------------
Partnership completion triggers data writes:
      |
      +---> TalentDataRoom: actual engagement, brand feedback, rate paid, timeline adherence
      +---> BrandDataRoom:  campaign ROI, talent performance vs. prediction, final deal value
      +---> AgencyDataRoom: commission earned, deal velocity, brand relationship data
      |
      v
DataRoomEntry records created with outcome metadata
      |
      v
Downstream systems updated:
  - RateBenchmark table: actual rate paid updates benchmark averages
  - ROIBenchmark table: actual ROI updates benchmark data
  - Match Engine scoring: predicted vs. actual outcome feeds weight refinement
  - AI agents re-train/update context on new outcome data
      |
      v
Future Match Engine runs, ROI Simulator projections, and Pricing Optimizer
recommendations all improve based on accumulated real-world outcomes
```

---

### 7.3 Data Ownership & Access

DealStage operates on a clear data ownership model designed to give each stakeholder control over their data while enabling the platform to build collective intelligence from anonymized aggregate signals.

| Stakeholder          | Data They Own                                                                                        | Access Rights                                                                                                       | Cannot Access                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Talent               | Own profile, media kit, audience analytics, deal history, revenue data, content library              | Full read/write to own records; can share selectively with brands/agencies                                          | Other talent's private data; brand-internal campaign data not shared with them |
| Brand                | Own campaign briefs, opportunity listings, deal history, ROI records, target audience data           | Full read/write to own records; access to talent data shared in active deals                                        | Competing brands' campaign data; talent's deals with other brands              |
| Agency               | Own agency profile, client roster data, deal history, commission records                             | Full read/write to own records; access to talent data for represented roster; access to brand data for active deals | Non-client talent data (private records); competing agencies' data             |
| Admin                | Platform configuration, all entity records, system metrics, financial data                           | Full access to all records across all entities and roles                                                            | Not applicable — admin has unrestricted access                                 |
| Platform (DealStage) | Anonymized aggregate intelligence: rate benchmarks, ROI averages, match accuracy data, trend signals | Uses aggregate data to improve benchmarks, train AI agents, and generate market intelligence                        | Cannot share individual user data with third parties without consent           |

#### 7.3.1 Data Sharing Framework

| Scenario             | What Is Shared                                       | With Whom                                        |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Active deal          | Talent profile, rates, audience data                 | Brand and/or Agency party to the deal            |
| Marketplace listing  | Public talent profile metrics                        | All platform users browsing Marketplace          |
| Data Room access     | Historical deal intelligence (anonymized benchmarks) | All users with Data Room access (role-permitted) |
| Match Engine scoring | Composite score and factor breakdown                 | Both parties to a potential match                |
| AI-generated reports | Role-scoped output from AI agents                    | Only the requesting user                         |
| Rate Benchmarks      | Aggregated market rates (no individual attribution)  | All users with Market Intelligence access        |

---

### 7.4 Data as a Competitive Moat

DealStage's most durable competitive advantage is not its feature set — it is the **proprietary partnership intelligence database** that accumulates with every completed deal. This dataset is structurally impossible for competitors to replicate without facilitating equivalent deal volume.

#### 7.4.1 Intelligence Flywheel

```
More Users
    |
    v
More Deals Initiated
    |
    v
More Deals Completed
    |
    v
More Outcome Data Written to Data Rooms
    |
    v
More Accurate Benchmarks + Better AI Training Data
    |
    v
Better Match Recommendations + More Accurate Pricing
    |
    v
Higher Deal Success Rates → More Users Attracted
    |
    v
[Loop repeats — moat deepens with each cycle]
```

#### 7.4.2 Proprietary Data Categories

| Data Category                 | Entity/Table                                           | Competitive Value                                                                                     |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Actual Deal Rates             | `rate_benchmarks`, `data_room_entries`                 | No public database contains actual, verified rates paid in talent-brand deals — only estimated ranges |
| Actual Campaign ROI           | `roi_benchmarks`, `data_room_entries`                  | Post-campaign ROI actuals by category and tier — unavailable anywhere else                            |
| Audience Overlap Intelligence | AI agent: `audience_overlap`                           | Platform-level analysis of talent-brand audience intersection derived from real deals                 |
| Deal Success Predictors       | `deal_scores`, `data_room_entries`                     | Learned predictive features from thousands of deal outcomes across all categories                     |
| Talent Trajectory Data        | `talent_revenue_matrix`, AI agent: `talent_trajectory` | Historical growth trajectories enabling accurate future value prediction                              |
| Brand Spend Patterns          | `platform_multipliers`, AI agent: `revenue_forecast`   | Verified brand budget cycles and spend patterns built from actual transaction data                    |
| Relationship Graph            | Entity: `WarmIntroNetwork` / Neo4j graph               | Proprietary map of real professional relationships between talent, brands, and agencies               |
| Compliance Patterns           | AI agent: `compliance`                                 | Database of disclosure and compliance patterns across thousands of campaigns                          |

#### 7.4.3 Why No Competitor Can Replicate This

1. **Data is generated through transaction facilitation.** Every data point requires an actual deal to be initiated, negotiated, and completed on the platform. Rate benchmarks derived from self-reported surveys (the current industry standard) are unreliable. DealStage's benchmarks reflect actual money transferred.

2. **Network effects compound the moat.** The relationship graph (`WarmIntroNetwork`) becomes exponentially more valuable as user count grows. A platform with 100 users has limited paths; a platform with 100,000 users has a dense, high-value network graph no competitor can purchase.

3. **AI agents improve with proprietary data.** The 32 AI agents are trained and prompted against DealStage's outcome data. Generic AI tools (ChatGPT, Claude direct) cannot replicate this because they lack access to the underlying deal intelligence.

4. **Cross-role data integration is unique.** DealStage holds concurrent data from all three sides of the partnership ecosystem (Talent + Brand + Agency) for the same transactions. This tripartite view of deal economics — what each party paid, received, expected, and actually experienced — does not exist in any competitor's dataset.

5. **Data accumulation is self-reinforcing.** Brands that achieve measurable ROI on DealStage return for more deals, deepening their data footprint. Talent that close deals at above-market rates attract other talent. Agencies that demonstrate superior deal outcomes using DealStage's intelligence have a client retention advantage — creating a virtuous cycle that accelerates data accumulation.

#### 7.4.4 Monetization Dimensions of the Data Moat

| Application                                           | How Data Moat Creates Revenue                                                                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Premium Subscriptions                                 | Access to benchmarks, data rooms, and AI agents is gated behind paid plans — the intelligence drives upgrade conversion                                      |
| Market Intelligence Reports                           | Aggregated partnership intelligence can be packaged as industry research for brands and agencies                                                             |
| Predictive Features (ROI Simulator, Spend Prediction) | Accuracy of predictive tools is directly proportional to dataset depth — more data = more accurate predictions = higher perceived value = stronger retention |
| Enterprise Licensing                                  | Brands and agencies at scale may pay for API access to benchmark data for internal systems                                                                   |
| AI Agent Quality                                      | As outcome data trains agents to higher accuracy, agent outputs become a distinct premium product                                                            |

---

_End of Sections 5–7_

_Document prepared: 2026-03-19_
_Platform: DealStage (www.thedealstage.com)_
_Sources: Layout.jsx, App.jsx, routePermissions.js, pages.config.js, base44Client.js, agents.ts, router.ts, useFeatureGate.js, MatchEngine.jsx, Dashboard.jsx_
