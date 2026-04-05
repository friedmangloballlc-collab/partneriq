# DealStage Platform Documentation -- Batch 8

**Company:** DealStage (legal entity: PartnerIQ)
**URL:** thedealstage.com
**Generated:** 2026-03-29
**Deliverables in this batch:** 28, 29, 30, 31
**Cross-references:** Batch 1-4 IDs (RISK-001+, TBL-001+, AGT-001+, DEP-001+)

---

# DELIVERABLE 28: HIRING PLAN (18-MONTH)

## Summary

This document presents a phased, metric-triggered hiring roadmap for DealStage over the first 18 months of operation. Each hire is gated by Monthly Recurring Revenue (MRR = Monthly Recurring Revenue) thresholds rather than arbitrary timelines, ensuring the company only adds headcount when revenue justifies the cost and workload demands it. The plan covers 7 hires across 4 phases, with full job descriptions, structured interview kits, compensation ranges, sourcing strategies, and onboarding plans for each role.

## Inputs and Assumptions

- **Jurisdiction:** United States (remote-first; consult local counsel for state-specific wage, tax, and leave requirements before extending offers)
- **Company stage:** Pre-revenue, solo founder, pre-launch SaaS
- **Legal entity:** PartnerIQ (Delaware C-Corp assumed for equity grants; confirm with corporate counsel)
- **Tech stack:** React, Vite, Supabase (PostgreSQL), Edge Functions (Deno/TypeScript), Stripe, OpenAI API, Anthropic API, Vercel, Railway, Tailwind CSS, TanStack Query
- **Compensation philosophy:** Below-market salary + meaningful equity for early hires; market-rate salary + smaller equity for later hires (see Deliverable 29)
- **Work model:** Remote-first, US time zones preferred, async-default with 3-hour daily overlap window
- **Equity pool:** 15% of fully diluted shares reserved for employee option pool (see Deliverable 29 for vesting details)

## Legal and Privacy Notes

- All job descriptions include EEO (Equal Employment Opportunity) statements. Ensure compliance with EEOC (Equal Employment Opportunity Commission) guidelines and state/local fair employment laws.
- For each hire, verify compliance with state-specific requirements: pay transparency laws (CO, CA, NY, WA, CT, RI, others), ban-the-box laws, non-compete restrictions, and at-will employment notices.
- Confirm I-9 (Employment Eligibility Verification) and E-Verify obligations. Consult immigration counsel before sponsoring any visa-dependent candidates.
- All interview questions below are job-related and lawful. Never ask about protected characteristics (age, marital status, disability, religion, national origin, pregnancy, genetic information).
- Equity grants require board approval and a formal stock option plan (typically a 409A valuation). Engage startup legal counsel before issuing any equity.

---

## Phase 1: Solo Founder (Month 1-3, $0-$5K MRR)

### Operating Model

The founder handles all functions: product development, sales, customer support, marketing, finance, and operations. AI tools (Claude, GPT-4o-mini, Cursor, v0) serve as force multipliers across every function.

### Founder Time Allocation

| Function              | Hours/Week | Notes                                               |
| --------------------- | ---------- | --------------------------------------------------- |
| Product Development   | 25         | Feature building, bug fixes, infrastructure         |
| Sales and Outreach    | 8          | Founder-led sales, demos, partnership outreach      |
| Customer Support      | 5          | Direct Intercom/email support for early users       |
| Marketing and Content | 7          | Social media, blog posts, community engagement      |
| Operations and Admin  | 5          | Finance, legal, vendor management                   |
| **Total**             | **50**     | Sustainable ceiling; beyond this, hire or cut scope |

### Contractor Needs

| Contractor Role       | Scope                                                                      | Est. Monthly Cost             | Sourcing                                               |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------ |
| Brand/UI Designer     | Logo refinement, landing page polish, marketing assets, app icon           | $1,500-$3,000 (project-based) | Dribbble, Behance, Toptal                              |
| Legal Counsel         | Terms of Service, Privacy Policy, contractor agreements, option plan setup | $2,000-$5,000 (project-based) | Clerky, Stripe Atlas network, local tech-focused firms |
| Content Writer        | 4-6 blog posts/month, SEO-optimized partnership content                    | $800-$1,500/mo                | Superpath, LinkedIn freelancers                        |
| Bookkeeper/Accountant | Monthly reconciliation, sales tax, payroll prep                            | $300-$500/mo                  | Bench, Pilot, local CPA                                |

**Estimated Contractor Budget:** $4,600-$10,000 total for Phase 1 (not monthly; these are largely project-based engagements).

### Key Milestones Before First Hire

- [ ] Platform live with paying customers
- [ ] At least 20 active users (free + paid)
- [ ] MRR trending upward for 2 consecutive months
- [ ] Support ticket volume exceeding 2 hours/day of founder time
- [ ] At least $5,000 MRR sustained for 30 days

---

## Phase 2: First Hires (Month 4-6, Triggered at $5K MRR)

### Why Customer Success First

Retention drives sustainable SaaS growth. At $5K MRR, the founder is spending 10+ hours/week on support, onboarding, and churn prevention -- time that should go to product and sales. Data from early-stage SaaS companies consistently shows that dedicated customer success reduces churn by 20-40% within the first quarter. Every 1% reduction in monthly churn at $5K MRR compounds to tens of thousands in preserved annual revenue.

---

### HIRE-001: Customer Success Associate

**Role ID:** HIRE-001
**Trigger:** $5K MRR sustained for 30+ days
**Priority:** Critical
**Reports to:** CEO/Founder
**Location:** Remote (US time zones)
**Employment Type:** Full-time (consider part-time at 30 hrs/week if MRR is $5K-$8K; convert to full-time at $10K MRR)

#### Job Description

**Title:** Customer Success Associate
**Department:** Customer Success
**Level:** IC-2 (Individual Contributor, Mid-Level)

**Mission:** Own the end-to-end customer experience for DealStage users -- from onboarding through renewal -- ensuring every brand, talent, agency, and manager user extracts maximum value from the platform and becomes a long-term advocate.

**Responsibilities:**

1. **Onboarding (40% of time)**
   - Guide new users through platform setup: profile creation, AI preference configuration, first match review
   - Conduct 15-minute welcome calls for Brand ($299+) and Agency ($799+) tier customers within 48 hours of signup
   - Create and maintain onboarding email sequences, help center articles, and video walkthroughs
   - Track onboarding completion rates; target 80% completion within first 7 days

2. **Ongoing Support (30% of time)**
   - Respond to support tickets via Intercom within 2-hour SLA (business hours) and 8-hour SLA (off-hours)
   - Troubleshoot platform issues, escalating bugs to the founder/engineering with reproduction steps
   - Maintain a known-issues board and proactively notify affected users
   - Handle billing inquiries, plan changes, and refund requests per company policy

3. **Retention and Expansion (20% of time)**
   - Monitor usage dashboards for churn signals: declining logins, unused AI credits, stale matches
   - Conduct proactive outreach to at-risk accounts (no login in 14+ days, support ticket spike)
   - Identify upsell opportunities: users approaching plan limits, agencies managing 10+ talent
   - Run quarterly NPS (Net Promoter Score) surveys and synthesize feedback for product roadmap

4. **Knowledge Management (10% of time)**
   - Build and maintain the help center (25+ articles covering all core workflows)
   - Document FAQs, common troubleshooting steps, and platform tips
   - Create 2-minute Loom video guides for complex features (AI matching, contract workflows, analytics)

**Requirements (Must-Have):**

- 2+ years in customer success, support, or account management at a SaaS or marketplace company
- Excellent written and verbal communication; ability to explain technical concepts to non-technical users
- Experience with support tools (Intercom, Zendesk, or Freshdesk)
- Comfort with data: ability to read usage dashboards, identify trends, and present findings
- Self-starter who thrives in ambiguous, fast-moving environments with minimal supervision
- US work authorization (no visa sponsorship available at this stage)

**Requirements (Nice-to-Have):**

- Experience in influencer marketing, talent management, or creator economy platforms
- Familiarity with Supabase, Stripe billing, or similar SaaS tooling
- Experience building help centers or knowledge bases from scratch
- Basic SQL for querying user data and generating ad-hoc reports

**Compensation:**

- **Salary:** $50,000-$60,000/year (approximately 75-85% of market rate for a mid-level CS role)
- **Equity:** 1.0-1.5% of fully diluted shares (4-year vest, 1-year cliff)
- **Benefits:** Remote-first, flexible PTO (minimum 15 days/year), $1,000 annual equipment stipend, $500 annual learning budget
- **Performance bonus:** Up to $5,000/year tied to NPS score (target: 50+), churn rate (target: <5% monthly), and onboarding completion rate (target: 80%+)

**Where to Recruit:**

| Channel                                     | Priority | Notes                                                  |
| ------------------------------------------- | -------- | ------------------------------------------------------ |
| Personal network and Twitter/X              | High     | Post role publicly; ask for referral retweets          |
| LinkedIn (targeted outreach)                | High     | Search for "customer success" + "SaaS" + "marketplace" |
| Wellfound (formerly AngelList)              | High     | Strong startup candidate pool                          |
| Support Driven community                    | Medium   | Dedicated CS/support professional community            |
| Indie Hackers, Lenny's Newsletter job board | Medium   | Startup-minded candidates                              |

**Interview Process (4 stages, target 10 business days total):**

**Stage 1: Application Review (1 day)**

- Review resume for SaaS/marketplace CS experience
- Check cover letter for communication quality and enthusiasm for the creator economy
- Pass/fail gate: must have 2+ years relevant experience

**Stage 2: Phone Screen (30 minutes, Founder conducts)**

Questions:

1. "Walk me through your current or most recent CS role. What does a typical day look like, and what metrics are you responsible for?"
   - _Looking for:_ Structured daily workflow, awareness of CS metrics (NPS, churn, CSAT), proactive vs. reactive orientation
2. "Tell me about a time you identified a customer at risk of churning and successfully retained them. What signals did you notice and what did you do?"
   - _Looking for:_ Data awareness, proactive outreach, creative problem-solving, measurable outcome
3. "DealStage is a pre-launch AI platform connecting brands with influencers and talent. What questions would you want answered before joining a company at this stage?"
   - _Looking for:_ Thoughtful risk assessment, genuine curiosity, startup-readiness signals
4. "What support tools have you used, and how do you prioritize when you have 15 open tickets and 3 onboarding calls scheduled in the same afternoon?"
   - _Looking for:_ Tool familiarity, triage methodology, time management under pressure

**Stage 3: Work Sample (async, 48-hour window)**

Provide the candidate with:

- A mock customer profile (Brand user, $299/month plan, 2 weeks into trial)
- A simulated support ticket: "The AI matches are not relevant to my brand. I sell sustainable outdoor gear but keep getting matched with fashion influencers. Considering canceling."
- Ask them to draft: (a) an initial response email, (b) a troubleshooting checklist, and (c) a 5-minute onboarding script they would use to re-engage this user

Evaluation rubric (1-5 per dimension):

| Dimension             | 1 (Poor)                                | 3 (Meets)                                            | 5 (Exceeds)                                                                 |
| --------------------- | --------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- |
| Empathy and Tone      | Dismissive or overly formal             | Warm, professional, acknowledges frustration         | Personalized, builds rapport, makes user feel heard                         |
| Problem Solving       | Generic response, no troubleshooting    | Identifies likely cause, offers 2-3 actionable steps | Diagnoses root cause, provides step-by-step fix, suggests prevention        |
| Product Intuition     | No reference to how matching might work | Reasonable assumptions about AI matching parameters  | Demonstrates understanding of niche targeting, suggests specific settings   |
| Communication Clarity | Jargon-heavy or confusing               | Clear, organized, easy to follow                     | Concise, scannable, includes next steps and timeline                        |
| Proactiveness         | Only addresses stated issue             | Addresses issue + offers follow-up                   | Addresses issue, suggests product improvements, proposes retention strategy |

Minimum passing score: 15/25 (average 3.0 across dimensions)

**Stage 4: Culture and Values Interview (45 minutes, Founder conducts)**

Questions:

1. "How do you handle a situation where a customer is asking for a feature that does not exist and is frustrated that it is not on the roadmap?"
2. "Describe your ideal relationship with an engineering/product team. How do you escalate bugs vs. feature requests?"
3. "This is a solo-founder startup. You would be the first hire. What excites you about that, and what concerns you?"
4. "What does great customer success look like at a company with 50 users vs. 5,000 users? How would you evolve the function?"

**Offer Decision Criteria:**

- Work sample score of 15+ (required)
- Phone screen demonstrates 2+ years of relevant experience with metrics awareness
- Culture interview shows startup readiness, ownership mentality, and alignment with DealStage mission
- Reference checks confirm reliability, communication quality, and self-direction

#### 30/60/90 Day Onboarding Plan

**Days 1-30: Learn and Listen**

| Week | Goals                                                                                                                                                                  | Deliverables                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1    | Platform deep-dive: complete full onboarding as each user type (Talent, Brand, Agency, Manager). Shadow founder on 5+ support interactions. Set up Intercom workspace. | Completed onboarding for all 4 user types; Intercom configured with macros for top 10 ticket types |
| 2    | Handle first 10 support tickets with founder review. Begin drafting help center articles for top 5 FAQs. Study AI matching logic at a functional level.                | 10 tickets resolved; 5 draft help center articles                                                  |
| 3    | Solo ticket handling (founder reviews async). Conduct first 3 onboarding calls for new users. Identify top 3 churn risk signals from historical data.                  | Self-sufficient on Tier 1 tickets; 3 onboarding calls completed; churn signal memo delivered       |
| 4    | Full ownership of support queue. Propose SLA targets and escalation process. Deliver first weekly CS report to founder.                                                | SLA proposal document; first weekly report                                                         |

**Success metric at Day 30:** Average first-response time under 4 hours; 90%+ ticket resolution without founder escalation; 5+ help center articles published.

**Days 31-60: Build and Optimize**

| Week | Goals                                                                                                                                                             | Deliverables                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 5-6  | Build onboarding email sequence (7 emails over 14 days). Create churn-risk dashboard in Supabase/Metabase. Begin proactive outreach to inactive accounts.         | Email sequence live; dashboard functional; 10+ proactive outreach attempts     |
| 7-8  | Launch first NPS survey. Identify top 5 product improvements from support data. Propose and implement 2 self-service improvements (help center, in-app tooltips). | NPS baseline score; product feedback memo; 2 self-service improvements shipped |

**Success metric at Day 60:** Onboarding completion rate tracked and improving; NPS baseline established; help center covers 80% of ticket topics.

**Days 61-90: Own and Expand**

| Week  | Goals                                                                                                                                                                            | Deliverables                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 9-10  | Develop customer health scoring model (login frequency, AI credit usage, match engagement, support tickets). Begin monthly business reviews with top 10 accounts (Brand/Agency). | Health score model documented; 5+ business reviews completed       |
| 11-12 | Identify and execute first 3 upsell conversations. Propose CS playbook v1 (onboarding, retention, expansion, escalation). Present 90-day retrospective to founder.               | 3 upsell conversations; CS Playbook v1; retrospective presentation |

**Success metric at Day 90:** Monthly churn rate measurably improved from baseline; customer health scores tracked for all active accounts; CS playbook documented and operational.

---

### HIRE-002: Growth Marketing Specialist (Contract)

**Role ID:** HIRE-002
**Trigger:** $5K MRR sustained for 30+ days (concurrent with or shortly after HIRE-001)
**Priority:** High
**Reports to:** CEO/Founder
**Location:** Remote (US time zones)
**Employment Type:** Part-time contractor (20 hours/week); convert to full-time at $15K+ MRR if performance warrants

#### Job Description

**Title:** Growth Marketing Specialist
**Department:** Marketing
**Level:** IC-2 to IC-3 (Mid to Senior Individual Contributor)

**Mission:** Drive qualified user acquisition for DealStage through organic and paid channels, with a focus on the creator economy and brand partnership ecosystem. Build repeatable, measurable growth loops that scale with the platform.

**Responsibilities:**

1. **Content Marketing and SEO (40% of time)**
   - Develop and execute content calendar: 8+ blog posts/month targeting partnership, influencer marketing, and talent management keywords
   - Optimize existing pages for search; target 50+ ranking keywords within 90 days
   - Create lead magnets (partnership templates, rate card calculators, industry reports) to drive email signups
   - Manage content distribution across LinkedIn, Twitter/X, and relevant subreddits

2. **Paid Acquisition (25% of time)**
   - Launch and optimize Meta (Instagram/Facebook) and Google Ads campaigns targeting brand marketing managers and talent/influencers
   - Manage monthly ad budget of $1,000-$3,000; target CAC (Customer Acquisition Cost) under $50 for Talent, under $150 for Brand
   - A/B test ad creative, landing pages, and messaging
   - Report weekly on spend, impressions, clicks, signups, and conversion rates

3. **Community and Partnership Growth (20% of time)**
   - Identify and engage in 10+ relevant online communities (Reddit r/influencermarketing, Facebook groups, Discord servers, Slack communities)
   - Develop co-marketing partnerships with complementary tools (social schedulers, analytics platforms, contract tools)
   - Organize or participate in 1-2 virtual events/webinars per quarter

4. **Analytics and Experimentation (15% of time)**
   - Set up and maintain UTM tracking, conversion funnels in analytics tools (Mixpanel, PostHog, or GA4)
   - Run 2+ growth experiments per month (referral incentives, pricing page tests, onboarding flow variants)
   - Deliver monthly growth report: channel performance, CAC by segment, LTV/CAC ratio, funnel conversion rates

**Requirements (Must-Have):**

- 3+ years in growth marketing, digital marketing, or demand generation at a SaaS or marketplace company
- Proven track record of driving measurable user acquisition (show specific numbers: signups, CAC, conversion rates)
- Proficiency with paid ads (Meta Ads Manager, Google Ads) and analytics tools
- Strong writing skills; ability to produce SEO-optimized content that ranks
- Experience with A/B testing and conversion rate optimization
- US work authorization

**Requirements (Nice-to-Have):**

- Experience in influencer marketing, creator economy, or talent management industry
- Familiarity with Product-Led Growth (PLG) strategies
- Experience with email marketing automation (ConvertKit, Mailchimp, Customer.io)
- Basic design skills (Canva, Figma) for ad creative and social content
- Experience marketing a two-sided marketplace

**Compensation:**

- **Contractor rate:** $50-$75/hour (approximately $4,000-$6,000/month at 20 hours/week)
- **Equity:** 0.5-1.0% of fully diluted shares upon conversion to full-time (4-year vest, 1-year cliff; equity grant contingent on full-time conversion)
- **Performance bonus:** Monthly bonus of 10% of base if CAC targets met and MRR growth exceeds 15% month-over-month
- **Ad budget:** Separate from compensation; $1,000-$3,000/month managed budget

**Where to Recruit:**

| Channel                                 | Priority | Notes                                                                 |
| --------------------------------------- | -------- | --------------------------------------------------------------------- |
| Twitter/X growth marketing community    | High     | Follow growth marketers, post role with specific metrics expectations |
| Superpath (content marketing community) | High     | Strong content + growth hybrid candidates                             |
| Marketer Hire, MarketerHire.com         | High     | Pre-vetted marketing contractors                                      |
| Wellfound (AngelList)                   | Medium   | Startup-focused candidates                                            |
| GrowthHackers community                 | Medium   | Growth-specific talent pool                                           |
| Upwork (for initial trial)              | Low      | Use for 2-week paid trial before committing to ongoing contract       |

**Interview Process (3 stages, target 7 business days):**

**Stage 1: Portfolio Review (async)**

- Request a "growth case study" document: one campaign they ran, the strategy, channels used, spend, results, and what they would do differently
- Evaluate for analytical rigor, creativity, and measurable outcomes
- Pass/fail gate: must demonstrate CAC awareness and channel-level attribution

**Stage 2: Strategy Session (60 minutes, Founder conducts)**

Questions:

1. "You have a $2,000/month ad budget and need to acquire paying Brand users ($299+/month plans) for DealStage. Walk me through your first 30 days: channel selection, targeting, creative approach, and how you would measure success."
   - _Looking for:_ Structured approach, channel prioritization rationale, realistic CAC estimates, measurement framework
2. "DealStage is a two-sided marketplace. How would you think about the chicken-and-egg problem of acquiring both brands and talent simultaneously?"
   - _Looking for:_ Marketplace growth understanding, sequencing logic (likely talent-first for supply), creative solutions
3. "What is the most underrated growth channel for early-stage B2B SaaS right now, and why?"
   - _Looking for:_ Independent thinking, awareness of current landscape, willingness to experiment
4. "Show me an example of content you have written that drove measurable business results. What was the strategy behind it?"
   - _Looking for:_ Writing quality, SEO awareness, ability to connect content to business outcomes

**Stage 3: Paid Trial (1 week, 10 hours)**

- Assign a real project: audit the current DealStage website/landing page and deliver a prioritized list of 10 conversion improvements with estimated impact
- Pay at agreed hourly rate ($50-$75/hour)
- Evaluate quality of analysis, prioritization, and communication

**Offer Decision Criteria:**

- Portfolio demonstrates 3+ campaigns with measurable ROI
- Strategy session shows structured thinking and marketplace awareness
- Paid trial deliverable is actionable, well-organized, and demonstrates strong analytical skills
- References confirm reliability and results orientation

#### 30/60/90 Day Onboarding Plan

**Days 1-30: Audit, Plan, and Quick Wins**

| Week | Goals                                                                                                                                           | Deliverables                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1    | Deep-dive on DealStage product, user personas, competitive landscape. Audit all existing marketing assets, SEO profile, and social presence.    | Competitive audit document; SEO gap analysis; channel opportunity matrix |
| 2    | Set up analytics infrastructure (UTM framework, conversion tracking, funnel dashboards). Launch first 2 paid ad experiments ($500 total spend). | Analytics dashboard live; 2 ad campaigns running                         |
| 3-4  | Develop 90-day content calendar. Publish 4 SEO-optimized blog posts. Optimize top 3 landing pages for conversion.                               | Content calendar; 4 published posts; landing page improvements live      |

**Days 31-60: Scale What Works**

- Double down on top-performing channels from Month 1 data
- Launch referral program (users invite peers for extended trial or AI credit bonus)
- Produce first lead magnet (e.g., "2026 Brand Partnership Rate Card Template")
- Establish 3+ community presences with consistent engagement
- Target: 100+ qualified signups/month

**Days 61-90: Systematize and Report**

- Document all growth playbooks (paid ads, content, community, referral)
- Deliver comprehensive growth report with channel-level CAC, LTV projections, and recommended budget allocation for next quarter
- Propose full-time conversion plan (or identify need for additional marketing hire)
- Target: 200+ qualified signups/month; CAC trending toward targets

---

## Phase 3: Core Team (Month 7-12, Triggered at $20K MRR)

### HIRE-003: Full-Stack Developer

**Role ID:** HIRE-003
**Trigger:** $20K MRR sustained for 30+ days
**Priority:** Critical
**Reports to:** CEO/Founder (Tech Lead)
**Location:** Remote (US time zones, with 4+ hours overlap with founder)
**Employment Type:** Full-time

#### Job Description

**Title:** Full-Stack Developer
**Department:** Engineering
**Level:** IC-3 (Mid-Level)

**Mission:** Accelerate DealStage product development by owning feature delivery end-to-end -- from database schema to UI component -- while maintaining the quality, performance, and reliability standards required for a growing SaaS platform.

**Responsibilities:**

1. **Feature Development (50% of time)**
   - Build and ship 2-3 significant features per sprint (2-week cycles)
   - Implement new user-facing features across the React frontend and Supabase backend
   - Write Supabase Edge Functions (Deno/TypeScript) for business logic, AI agent orchestration, and third-party integrations
   - Integrate with external APIs: Stripe (billing), OpenAI, Anthropic, social media platforms

2. **Code Quality and Architecture (25% of time)**
   - Write clean, tested, documented code; maintain 80%+ test coverage on new code
   - Participate in code reviews (founder reviews your code; you review founder's code)
   - Improve existing codebase: refactor technical debt, optimize database queries, improve type safety
   - Contribute to architectural decisions and document ADRs (Architecture Decision Records)

3. **DevOps and Reliability (15% of time)**
   - Monitor application performance; investigate and resolve production issues within SLA
   - Manage deployments via Vercel (frontend) and Railway (backend services)
   - Implement and maintain CI/CD pipelines, database migrations, and staging environments
   - Set up and monitor error tracking (Sentry), uptime monitoring, and performance dashboards

4. **AI Integration (10% of time)**
   - Implement and optimize AI agent workflows (30+ agents using Claude and GPT-4o-mini)
   - Fine-tune prompts, manage token budgets, and implement caching strategies for AI responses
   - Build evaluation frameworks to measure AI output quality (match relevance, content generation accuracy)

**Requirements (Must-Have):**

- 3+ years professional experience building production web applications
- Strong proficiency in React (hooks, context, component architecture) and TypeScript
- Experience with PostgreSQL (complex queries, migrations, indexing, RLS)
- Experience with at least one serverless/edge function platform (Supabase Edge Functions, Cloudflare Workers, AWS Lambda, Vercel Functions)
- Familiarity with REST API design, authentication/authorization patterns, and data modeling
- Experience with Git workflows, code review, and CI/CD
- Ability to work independently, manage own priorities, and communicate proactively in a remote async environment
- US work authorization

**Requirements (Nice-to-Have):**

- Direct experience with Supabase (Auth, Realtime, Storage, Edge Functions, RLS policies)
- Experience integrating LLM APIs (OpenAI, Anthropic) including prompt engineering, streaming, and token optimization
- Experience with Stripe billing integration (subscriptions, metered billing, webhooks)
- Familiarity with Tailwind CSS and component libraries
- Experience with TanStack Query (React Query) for data fetching and caching
- Experience with Vite build tooling
- Previous startup experience (comfort with ambiguity, wearing multiple hats)
- Experience with two-sided marketplace platforms

**Compensation:**

- **Salary:** $95,000-$115,000/year (approximately 75-85% of market rate for mid-level full-stack in a remote setting)
- **Equity:** 1.0-1.5% of fully diluted shares (4-year vest, 1-year cliff)
- **Benefits:** Remote-first, flexible PTO (minimum 15 days/year), $2,000 annual equipment stipend, $1,000 annual learning budget, conference attendance budget (1/year)
- **Performance bonus:** Up to $10,000/year tied to sprint velocity, code quality metrics, and production incident response

**Where to Recruit:**

| Channel                                     | Priority | Notes                                                        |
| ------------------------------------------- | -------- | ------------------------------------------------------------ |
| Personal network and referrals              | High     | Offer $2,000 referral bonus                                  |
| Twitter/X developer community               | High     | Engage Supabase, React, TypeScript communities               |
| Wellfound (AngelList)                       | High     | Strongest startup developer pool                             |
| Hacker News "Who's Hiring" (monthly thread) | High     | High-quality candidates who read HN                          |
| Supabase Discord community                  | Medium   | Developers already skilled in the stack                      |
| React/TypeScript Discord servers            | Medium   | Stack-specific talent                                        |
| LinkedIn (targeted search)                  | Medium   | Filter: React + TypeScript + PostgreSQL + startup experience |
| Key Values, Otta                            | Medium   | Developer-focused job boards                                 |

**Interview Process (5 stages, target 14 business days):**

**Stage 1: Application Review (1-2 days)**

- Review resume/portfolio for relevant tech stack experience
- Check GitHub profile, open-source contributions, personal projects
- Pass/fail gate: must have 3+ years with React + TypeScript + PostgreSQL

**Stage 2: Phone Screen (30 minutes, Founder conducts)**

Questions:

1. "Walk me through the most complex feature you have built end-to-end. What was the architecture, what tradeoffs did you make, and what would you do differently?"
   - _Looking for:_ Systems thinking, ability to articulate tradeoffs, self-awareness about past decisions
2. "DealStage uses Supabase with Row Level Security policies. How familiar are you with RLS, and how would you approach securing a multi-tenant application where users should only see their own data plus data explicitly shared with them?"
   - _Looking for:_ PostgreSQL security understanding, RLS awareness (even if not direct experience), data modeling instincts
3. "We integrate with OpenAI and Anthropic APIs for 30+ AI agents. What challenges would you anticipate with LLM integration at this scale, and how would you approach reliability and cost management?"
   - _Looking for:_ API integration experience, awareness of LLM-specific issues (latency, rate limits, cost, hallucination), practical mitigation strategies
4. "This is a 2-person engineering team (you and the founder). What does your ideal working relationship look like in terms of code review, architecture decisions, and communication?"
   - _Looking for:_ Collaborative mindset, comfort with async communication, ability to both give and receive feedback

**Stage 3: Technical Assessment (async, 72-hour window)**

Provide a take-home project that mirrors actual DealStage work:

**Project:** Build a mini "Partner Match" feature:

- A React component that displays a list of potential partners with filtering (by category, location, follower range)
- A Supabase Edge Function that takes a brand profile and returns scored matches using a simple algorithm
- Basic RLS policy ensuring users only see their own saved matches
- TypeScript throughout; include at least 3 meaningful tests

Provide a starter repo with Supabase local dev setup and basic scaffolding.

**Time budget:** 4-6 hours (explicitly tell candidates not to exceed 6 hours; evaluate what they prioritize).

Evaluation rubric (1-5 per dimension):

| Dimension     | 1 (Poor)                              | 3 (Meets)                                                    | 5 (Exceeds)                                                            |
| ------------- | ------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Code Quality  | Messy, no types, no error handling    | Clean, typed, basic error handling                           | Elegant, well-abstracted, comprehensive error handling                 |
| Architecture  | Monolithic, no separation of concerns | Clear frontend/backend separation, reasonable data flow      | Clean architecture with reusable patterns, thoughtful abstractions     |
| Database/RLS  | No RLS, raw queries                   | Basic RLS policy, parameterized queries                      | Well-designed RLS, efficient queries, proper indexing                  |
| Testing       | No tests or trivial tests             | 3+ meaningful unit/integration tests                         | Comprehensive test suite with edge cases, mocking strategy             |
| Documentation | No README or comments                 | README with setup instructions, inline comments where needed | Clear README, ADR for key decisions, typed interfaces as documentation |
| UX Polish     | Broken or ugly UI                     | Functional UI with basic styling                             | Polished UI with loading states, error states, responsive design       |

Minimum passing score: 18/30 (average 3.0 across dimensions)

**Stage 4: Pair Programming Session (60 minutes, live with Founder)**

- Take a small bug or feature request from the actual DealStage codebase (sanitized if needed)
- Pair program with the founder to solve it
- Evaluate: problem-solving approach, communication while coding, ability to navigate an unfamiliar codebase, debugging methodology

**Stage 5: Culture and Values Interview (30 minutes, Founder + CS Associate conduct)**

Questions:

1. "Tell us about a time you disagreed with a technical decision made by a colleague or manager. How did you handle it, and what was the outcome?"
2. "In a startup with limited resources, how do you decide when to build something properly vs. ship a quick solution and iterate?"
3. "What does your ideal work-life balance look like in a remote startup environment?"
4. "What are you most excited to learn in the next year?"

**Offer Decision Criteria:**

- Take-home score of 18+ (required)
- Pair programming demonstrates collaborative problem-solving and strong debugging skills
- Phone screen confirms stack alignment and communication quality
- Culture interview shows startup mindset, intellectual curiosity, and team collaboration
- 2 reference checks confirm technical competence, reliability, and collaborative work style

#### 30/60/90 Day Onboarding Plan

**Days 1-30: Learn the Codebase and Ship**

| Week | Goals                                                                                                                                                             | Deliverables                                                  |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1    | Dev environment setup. Codebase walkthrough with founder (architecture, conventions, deployment). Complete 3 "good first issues" (small bugs or UI improvements). | Dev environment running; 3 PRs merged                         |
| 2    | Deeper architecture understanding: database schema, RLS policies, Edge Function patterns, AI agent architecture. Ship first small feature independently.          | Architecture notes document; 1 feature shipped                |
| 3    | Own a medium-complexity feature end-to-end (spec to deployment). Begin participating in code reviews.                                                             | 1 medium feature shipped; 3+ code reviews completed           |
| 4    | Ship second medium feature. Identify and document 5 technical debt items with severity ranking. Propose improvements to CI/CD or developer experience.            | 2 features total; tech debt document; DX improvement proposal |

**Days 31-60: Build Velocity**

- Own 2-3 features per sprint (2-week cycles)
- Set up error monitoring (Sentry) and establish on-call rotation with founder
- Implement one significant infrastructure improvement (caching layer, query optimization, or test automation)
- Begin contributing to architecture decisions with written proposals

**Days 61-90: Full Ownership**

- Lead development of a major feature or system (e.g., new AI agent, analytics dashboard, billing enhancement)
- Establish engineering best practices documentation (coding standards, PR template, deployment checklist)
- Conduct first architecture review with founder (assess current system, propose next-quarter technical roadmap)
- Mentor future engineering hires (prepare onboarding materials)

---

### HIRE-004: Content Creator and Community Manager

**Role ID:** HIRE-004
**Trigger:** $20K MRR sustained for 30+ days (concurrent with or shortly after HIRE-003)
**Priority:** High
**Reports to:** Growth Marketing Specialist (HIRE-002) with dotted line to CEO/Founder
**Location:** Remote (US time zones)
**Employment Type:** Full-time

#### Job Description

**Title:** Content Creator and Community Manager
**Department:** Marketing
**Level:** IC-2 (Mid-Level)

**Mission:** Build DealStage into the go-to voice in the brand-talent partnership space through compelling content, an engaged community, and authentic thought leadership that drives organic acquisition and brand loyalty.

**Responsibilities:**

1. **Content Creation (50% of time)**
   - Write 10+ blog posts/month (mix of SEO-optimized guides, industry analysis, user spotlights, and product updates)
   - Create social media content: 5+ posts/week across LinkedIn, Twitter/X, Instagram, and TikTok
   - Produce video content: 2-4 short-form videos/week (Reels, TikToks, YouTube Shorts) showcasing platform features, partnership tips, and creator economy trends
   - Develop long-form assets: quarterly industry reports, ebooks, webinar decks
   - Manage content calendar and ensure consistent publishing cadence

2. **Community Management (30% of time)**
   - Build and moderate the DealStage community (Discord or Slack): onboard members, spark discussions, resolve conflicts
   - Engage daily in 5+ external communities relevant to brand partnerships and talent management
   - Identify and cultivate relationships with 20+ micro-influencers and thought leaders for co-created content
   - Organize monthly virtual events: AMAs (Ask Me Anything), office hours, partnership showcases

3. **Brand Voice and Strategy (20% of time)**
   - Own and evolve the DealStage brand voice across all channels
   - Monitor industry trends, competitor content, and emerging platforms
   - Track content performance metrics (traffic, engagement, conversions, email signups) and optimize based on data
   - Collaborate with Growth Marketing (HIRE-002) on integrated campaigns

**Requirements (Must-Have):**

- 2+ years creating content professionally (blog, social media, video) with measurable results
- Strong writing skills: clear, engaging, SEO-aware prose that connects with both brand marketers and creators
- Experience managing online communities (Discord, Slack, Facebook Groups, or similar)
- Comfort on camera and with video editing tools (CapCut, Descript, or similar)
- Understanding of social media algorithms and content distribution strategies
- Portfolio demonstrating content across multiple formats (written, video, social)
- US work authorization

**Requirements (Nice-to-Have):**

- Personal experience in the creator economy (as a creator, brand marketer, or agency professional)
- Experience with content management systems and email marketing tools
- Basic graphic design skills (Canva, Figma)
- Podcast production experience
- SEO tools proficiency (Ahrefs, SEMrush, Surfer SEO)

**Compensation:**

- **Salary:** $52,000-$65,000/year (approximately 75-85% of market rate)
- **Equity:** 0.5-1.0% of fully diluted shares (4-year vest, 1-year cliff)
- **Benefits:** Remote-first, flexible PTO (minimum 15 days/year), $1,000 annual equipment stipend, $500 annual learning budget
- **Performance bonus:** Up to $5,000/year tied to content traffic targets, community growth, and email subscriber milestones

**Where to Recruit:**

| Channel                                                                | Priority | Notes                                                     |
| ---------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| Twitter/X creator economy community                                    | High     | Many content creators actively posting about partnerships |
| LinkedIn                                                               | High     | Content marketers with SaaS or marketplace experience     |
| Superpath community                                                    | High     | Content marketing professionals                           |
| Creator economy newsletters (Passionfruit, Creator Economy Newsletter) | Medium   | Niche audience with relevant expertise                    |
| Wellfound                                                              | Medium   | Startup-oriented candidates                               |

**Interview Process (4 stages, target 10 business days):**

**Stage 1: Portfolio Review (async)**

- Review portfolio for content quality, range (written + video + social), and measurable results
- Pass/fail gate: must demonstrate 2+ years of professional content creation with engagement metrics

**Stage 2: Phone Screen (30 minutes, Growth Marketer + Founder)**

Questions:

1. "Walk me through a content campaign you led that drove measurable business results. What was the strategy, execution, and outcome?"
2. "DealStage connects brands with 140+ types of talent -- influencers, athletes, actors, models, and more. How would you develop a content strategy that speaks to both sides of the marketplace?"
3. "What online communities are you most active in, and how do you approach community building vs. community management?"
4. "Create a 1-minute pitch for DealStage right now as if you were explaining it to a brand marketer at a conference."

**Stage 3: Content Trial (paid, 1 week)**

- Write 2 blog posts on assigned topics (one SEO-focused, one thought leadership)
- Create 5 social media posts across 2 platforms
- Produce 1 short-form video (60-90 seconds) showcasing a DealStage feature
- Pay: $500 flat for the trial week
- Evaluate: quality, speed, brand voice alignment, creativity

**Stage 4: Culture Interview (30 minutes, CS Associate + Founder)**

Questions:

1. "How do you handle negative feedback or criticism of your content?"
2. "Describe a community you helped build. What made it successful, and what would you do differently?"
3. "What is your content creation workflow from idea to published piece? How do you manage competing deadlines?"

#### 30/60/90 Day Onboarding Plan

**Days 1-30:** Deep-dive on product, user personas, and competitive landscape. Publish 8+ blog posts, establish social media posting cadence, and draft community launch plan. Audit existing content and SEO profile.

**Days 31-60:** Launch DealStage community (Discord). Publish 10+ blog posts. Grow email subscriber list by 200+. Produce first video content series. Establish relationships with 10+ industry voices for co-created content.

**Days 61-90:** Community active with 100+ members. Content pipeline systematized with 3-month editorial calendar. Monthly traffic growth of 30%+. First collaborative content piece with an industry influencer published. Content performance dashboard operational.

---

## Phase 4: Scale Team (Month 13-18, Triggered at $50K MRR)

### HIRE-005: Senior Backend Engineer (AI/Data Focus)

**Role ID:** HIRE-005
**Trigger:** $50K MRR sustained for 30+ days
**Priority:** Critical
**Reports to:** CEO/Founder (VP Engineering track)
**Location:** Remote (US time zones)
**Employment Type:** Full-time

#### Job Description

**Title:** Senior Backend Engineer -- AI and Data
**Department:** Engineering
**Level:** IC-4 (Senior)

**Mission:** Architect and build the next generation of DealStage's AI matching engine, data pipeline, and backend infrastructure to support 10x user growth while reducing AI costs and improving match quality.

**Responsibilities:**

1. **AI Systems Architecture (40% of time)**
   - Own the AI matching engine: refactor the 30+ agent system for reliability, cost efficiency, and quality
   - Design and implement evaluation frameworks for AI output quality (match relevance, content generation, recommendation accuracy)
   - Build RAG (Retrieval-Augmented Generation) pipelines for context-aware AI features
   - Implement prompt management system with versioning, A/B testing, and cost tracking
   - Optimize token usage across Claude and GPT-4o-mini: intelligent routing, caching, batching

2. **Data Pipeline and Analytics (30% of time)**
   - Design and implement data pipelines for user behavior analytics, match outcomes, and platform health metrics
   - Build recommendation systems that improve over time (feedback loops, collaborative filtering)
   - Create data models for advanced reporting: partnership ROI, talent performance, platform-wide trends
   - Implement data quality monitoring and anomaly detection

3. **Backend Architecture (20% of time)**
   - Scale Supabase backend: optimize RLS policies, database performance, and Edge Function architecture
   - Design event-driven architecture for real-time features (match notifications, deal updates, activity feeds)
   - Implement background job processing for long-running AI tasks, data enrichment, and report generation
   - Lead backend architecture decisions and document technical strategy

4. **Technical Leadership (10% of time)**
   - Mentor Full-Stack Developer (HIRE-003) on backend and AI best practices
   - Establish engineering standards for AI development (prompt engineering guidelines, testing frameworks, cost budgets)
   - Participate in hiring for future engineering roles
   - Conduct architecture reviews and maintain technical documentation

**Requirements (Must-Have):**

- 5+ years backend engineering experience with 2+ years focused on AI/ML systems or LLM integration
- Strong PostgreSQL skills (query optimization, partitioning, indexing strategies, JSON operations)
- Production experience integrating LLM APIs (OpenAI, Anthropic, or similar): prompt engineering, streaming, error handling, cost optimization
- Experience designing data pipelines (ETL/ELT) and working with large datasets
- Proficiency in TypeScript (Deno or Node.js) or Python for backend services
- Experience with cloud infrastructure and serverless architectures
- Demonstrated ability to architect systems that scale from hundreds to tens of thousands of users
- Strong communication skills; ability to explain complex technical concepts clearly
- US work authorization

**Requirements (Nice-to-Have):**

- Direct experience with Supabase, Deno Edge Functions, or similar edge computing platforms
- Experience with vector databases (pgvector, Pinecone, Weaviate) for semantic search and RAG
- ML engineering experience beyond LLM wrappers (recommendation systems, NLP, classification)
- Experience with Stripe billing integration at scale (metered billing, usage tracking)
- Previous experience at a marketplace or platform company
- Experience building evaluation frameworks for AI/ML systems
- Familiarity with React for occasional full-stack contributions

**Compensation:**

- **Salary:** $140,000-$165,000/year (approximately 85-95% of market rate; higher base because later-stage hire)
- **Equity:** 0.5-1.0% of fully diluted shares (4-year vest, 1-year cliff)
- **Benefits:** Remote-first, flexible PTO (minimum 15 days/year), $2,500 annual equipment stipend, $2,000 annual learning/conference budget, health insurance stipend
- **Performance bonus:** Up to $15,000/year tied to AI quality metrics, system reliability, and cost efficiency improvements

**Where to Recruit:**

| Channel                                                 | Priority | Notes                                                                  |
| ------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| Twitter/X AI engineering community                      | High     | Active AI/ML engineers sharing work                                    |
| Hacker News "Who's Hiring"                              | High     | Senior engineers who value technical depth                             |
| Personal network and referrals                          | High     | $3,000 referral bonus                                                  |
| Wellfound                                               | Medium   | Startup-focused senior engineers                                       |
| AI-specific communities (Latent Space, MLOps Community) | Medium   | Domain-specific talent                                                 |
| LinkedIn (targeted outreach)                            | Medium   | Search: "senior backend engineer" + "AI" or "LLM" + startup experience |

**Interview Process (5 stages, target 14 business days):**

**Stage 1: Application Review and Technical Screen (async)**

- Review resume for AI/backend experience depth
- Check GitHub, blog posts, conference talks, or published work on AI systems
- Send a brief technical questionnaire (30 min): 5 questions on AI architecture, database design, and system design

**Stage 2: Technical Deep Dive (60 minutes, Founder conducts)**

Questions:

1. "DealStage currently uses 30+ AI agents built on Claude and GPT-4o-mini for matching, content generation, and recommendations. Our monthly AI API spend is growing linearly with user count. How would you architect a system to reduce per-user AI cost by 50% while maintaining or improving quality?"
   - _Looking for:_ Caching strategies, prompt optimization, model routing (expensive model for complex tasks, cheap model for simple ones), batch processing, embedding-based pre-filtering
2. "Walk me through how you would design an AI match quality evaluation system. We need to measure whether our brand-talent matches are actually good, but 'good' is subjective. How do you make this rigorous?"
   - _Looking for:_ Evaluation framework design (offline vs. online metrics, human evaluation protocols, proxy metrics), A/B testing methodology, feedback loop design
3. "Our PostgreSQL database has grown to 500K rows in the matches table. Queries for the match recommendation endpoint are taking 3+ seconds. Walk me through your debugging and optimization approach."
   - _Looking for:_ Systematic debugging (EXPLAIN ANALYZE, index analysis, query profiling), knowledge of PostgreSQL optimization (partial indexes, materialized views, connection pooling), understanding of read patterns vs. write patterns
4. "How do you approach building a RAG pipeline for a use case where brands need to search for talent based on complex criteria like 'outdoor lifestyle influencer in the Pacific Northwest who has worked with sustainable brands and has 10K-50K followers with high engagement in the hiking niche'?"
   - _Looking for:_ Embedding strategy, vector database knowledge, hybrid search (semantic + structured), chunking strategy, retrieval evaluation

**Stage 3: System Design Exercise (90 minutes, live)**

- Design the next-generation DealStage AI matching pipeline on a whiteboard/Miro:
  - Ingest brand brief
  - Enrich with external data
  - Generate candidate matches using vector similarity + structured filters
  - Score and rank using LLM evaluation
  - Present results with explanations
  - Learn from user feedback to improve future matches
- Evaluate: architecture quality, scalability thinking, cost awareness, practical tradeoffs

**Stage 4: Code Review Session (45 minutes, live)**

- Present a real section of DealStage backend code (Edge Function + database query + AI integration)
- Ask candidate to review it: identify issues, suggest improvements, ask questions
- Evaluate: code reading ability, constructive feedback style, depth of technical insight

**Stage 5: Culture and Leadership Interview (45 minutes, Founder + Full-Stack Dev)**

- Discuss: mentorship approach, handling technical disagreements, experience scaling engineering teams, long-term career goals

#### 30/60/90 Day Onboarding Plan

**Days 1-30:** Full codebase immersion with focus on AI agents, database schema, and performance bottlenecks. Ship 2+ optimizations to existing AI pipeline (cost reduction, latency improvement, or quality improvement). Document current AI architecture and identify top 5 improvement opportunities.

**Days 31-60:** Lead design and implementation of one major AI infrastructure improvement (RAG pipeline, evaluation framework, or cost optimization system). Establish AI development standards and testing frameworks. Begin mentoring HIRE-003 on backend best practices.

**Days 61-90:** Ship major AI infrastructure improvement to production. Present technical roadmap for next 2 quarters. Establish AI quality dashboards and cost monitoring. Prepare engineering onboarding materials for future hires.

---

### HIRE-006: Sales Lead

**Role ID:** HIRE-006
**Trigger:** $50K MRR sustained for 30+ days
**Priority:** High
**Reports to:** CEO/Founder
**Location:** Remote (US time zones; travel 10-20% for conferences and key client meetings)
**Employment Type:** Full-time

#### Job Description

**Title:** Sales Lead (Head of Sales track)
**Department:** Sales
**Level:** IC-4 to Manager (Senior IC with path to Head of Sales)

**Mission:** Build and own the DealStage sales engine -- from pipeline generation through closed deals -- with a focus on Brand ($299-$1,499/mo) and Agency ($799-$3,499/mo) segments that drive the highest ARPU (Average Revenue Per User).

**Responsibilities:**

1. **Direct Sales (50% of time)**
   - Own the full sales cycle for Brand and Agency prospects: outreach, discovery, demo, proposal, negotiation, close
   - Conduct 15-20 product demos per week
   - Manage a pipeline of 50+ active opportunities at any given time
   - Achieve monthly quota (see commission structure in Deliverable 29)
   - Develop and refine sales playbooks for each customer segment

2. **Pipeline Generation (25% of time)**
   - Generate 50%+ of own pipeline through outbound prospecting (LinkedIn, email, events)
   - Collaborate with Growth Marketing (HIRE-002) on inbound lead qualification and handoff process
   - Develop strategic account lists (top 100 target brands, top 50 target agencies)
   - Build referral engine: turn closed customers into referral sources

3. **Sales Operations (15% of time)**
   - Set up and maintain CRM (HubSpot Free or Pipedrive)
   - Build sales reporting: pipeline value, conversion rates by stage, average deal size, sales cycle length
   - Develop proposal and contract templates
   - Create competitive battle cards and objection handling guides

4. **Strategy and Leadership (10% of time)**
   - Provide voice-of-customer feedback to product team (top feature requests, common objections, competitive losses)
   - Develop pricing strategy recommendations based on market feedback
   - Plan for sales team expansion: define SDR (Sales Development Representative) and AE (Account Executive) roles for next phase
   - Represent DealStage at 4-6 industry events per year

**Requirements (Must-Have):**

- 4+ years in B2B SaaS sales with 2+ years in a closing role (AE or sales lead)
- Proven track record of meeting or exceeding quota (provide specific numbers)
- Experience selling to marketing teams, brand managers, or agencies
- Proficiency with CRM tools and sales engagement platforms
- Strong demo skills: ability to tell a compelling product story and tailor it to each buyer
- Comfort with startup ambiguity: building process from scratch, wearing multiple hats
- Willingness to travel 10-20% for events and key meetings
- US work authorization

**Requirements (Nice-to-Have):**

- Experience in influencer marketing, creator economy, or talent management industry
- Experience selling marketplace or platform products (two-sided value proposition)
- Experience as a first or early sales hire at a startup
- Familiarity with PLG + sales-assist motion
- Network of contacts in brand marketing and agency world

**Compensation:**

- **Base salary:** $80,000-$95,000/year
- **Variable (commission):** $40,000-$55,000/year at quota (see detailed commission structure in Deliverable 29)
- **OTE (On-Target Earnings):** $120,000-$150,000/year
- **Equity:** 0.5-1.0% of fully diluted shares (4-year vest, 1-year cliff)
- **Benefits:** Remote-first, flexible PTO (minimum 15 days/year), $1,500 annual equipment stipend, $2,000 annual conference/travel budget, health insurance stipend
- **Accelerators:** 1.5x commission rate for deals above 100% quota; 2x for deals above 150% quota

**Where to Recruit:**

| Channel                                | Priority | Notes                                                  |
| -------------------------------------- | -------- | ------------------------------------------------------ |
| LinkedIn (targeted outreach)           | High     | Search for SaaS AEs selling to marketing/agency buyers |
| Wellfound                              | High     | Startup-experienced sales professionals                |
| Pavilion (formerly Revenue Collective) | Medium   | Sales leadership community                             |
| Bravado sales community                | Medium   | Vetted sales professionals                             |
| Personal network and referrals         | High     | $3,000 referral bonus                                  |
| RepVue                                 | Medium   | Sales professionals researching opportunities          |

**Interview Process (5 stages, target 14 business days):**

**Stage 1: Application Review (1-2 days)**

- Review resume for B2B SaaS sales experience and quota attainment
- Pass/fail gate: must demonstrate 4+ years sales experience with specific revenue numbers

**Stage 2: Phone Screen (30 minutes, Founder)**

Questions:

1. "Walk me through your last 4 quarters of quota attainment. What were your numbers, and what drove the results -- good and bad?"
2. "You are selling to two buyer personas: a brand marketing manager and an agency owner. How would your approach differ?"
3. "DealStage is at $50K MRR with mostly self-serve signups. How would you layer in a sales-assist motion without disrupting the PLG engine?"
4. "What is your prospecting methodology? Walk me through how you would build a pipeline from zero for DealStage."

**Stage 3: Mock Demo (45 minutes, live)**

- Provide the candidate with a brief product overview and a mock buyer persona
- Candidate conducts a full demo: discovery questions, product walkthrough, value proposition, objection handling, next steps
- Founder plays the role of a skeptical brand marketing director
- Evaluate: discovery quality, storytelling, product understanding (after brief prep), objection handling, closing instincts

**Stage 4: Sales Plan Presentation (60 minutes)**

- Ask candidate to prepare a 30-minute presentation: "Your first 90 days as Sales Lead at DealStage"
- Should include: target segments, outreach strategy, pipeline targets, demo cadence, CRM setup, and first-quarter quota plan
- 30 minutes of Q&A following the presentation
- Evaluate: strategic thinking, market understanding, realistic planning, presentation skills

**Stage 5: Culture and References (30 minutes interview + 2 reference calls)**

- Culture interview with CS Associate and Growth Marketer
- 2 reference calls: at least 1 former manager and 1 former colleague/customer

#### 30/60/90 Day Onboarding Plan

**Days 1-30:** Product deep-dive (complete onboarding as every user type, attend 10+ demos with founder). Set up CRM. Build target account list (100 brands, 50 agencies). Make first 50 outbound touches. Close first 2 deals.

**Days 31-60:** Refine sales playbook based on initial conversations. Achieve 50% of monthly quota. Establish demo-to-close conversion benchmarks. Create proposal templates and competitive battle cards. Provide first product feedback report to engineering.

**Days 61-90:** Achieve 100% of monthly quota. Document complete sales process. Launch referral program with existing customers. Present sales hiring plan for next quarter (SDR role). Pipeline value should be 3x monthly quota.

---

### HIRE-007: Product Designer

**Role ID:** HIRE-007
**Trigger:** $50K MRR sustained for 60+ days (hire after HIRE-005 and HIRE-006 are onboarded)
**Priority:** Medium-High
**Reports to:** CEO/Founder
**Location:** Remote (US time zones)
**Employment Type:** Full-time

#### Job Description

**Title:** Product Designer
**Department:** Product/Design
**Level:** IC-3 (Mid-Level, Senior trajectory)

**Mission:** Own the end-to-end design of the DealStage product experience -- from user research and information architecture to high-fidelity UI, interaction design, and design system maintenance -- ensuring that every user interaction is intuitive, efficient, and delightful.

**Responsibilities:**

1. **Product Design (50% of time)**
   - Own the design process for new features: user research, wireframes, prototypes, high-fidelity mockups, and interaction specifications
   - Design for all 4 user types (Talent, Brand, Agency, Manager) with distinct workflows and needs
   - Collaborate closely with engineering (Founder + HIRE-003) on implementation feasibility and design-dev handoff
   - Iterate based on user feedback, usability testing, and analytics data

2. **Design System (20% of time)**
   - Build and maintain the DealStage design system in Figma: components, tokens, patterns, and documentation
   - Ensure design consistency across all platform surfaces (web app, marketing site, emails, mobile-responsive views)
   - Create and maintain Tailwind CSS component guidelines that map to design system tokens

3. **User Research (20% of time)**
   - Conduct 4-6 user interviews per month across all user segments
   - Run usability tests on new features before and after launch
   - Analyze user behavior data (heatmaps, session recordings, funnel analytics) to identify UX issues
   - Synthesize research into actionable design recommendations

4. **Brand and Marketing Design (10% of time)**
   - Support marketing team with campaign visuals, social media templates, and landing page designs
   - Evolve the DealStage visual brand as the platform matures
   - Design investor-facing materials (pitch deck, one-pagers) as needed

**Requirements (Must-Have):**

- 3+ years product design experience at a SaaS or marketplace company
- Strong portfolio demonstrating end-to-end product design (research through shipped UI)
- Proficiency in Figma (components, auto-layout, prototyping, design systems)
- Experience with responsive web design and understanding of front-end constraints (CSS/Tailwind awareness)
- Ability to conduct user research (interviews, usability tests) and translate findings into design decisions
- Strong visual design skills: clean, modern, accessible UI that works for complex data-rich applications
- Experience collaborating directly with engineers in an agile/iterative process
- US work authorization

**Requirements (Nice-to-Have):**

- Experience designing two-sided marketplace or platform products
- Experience designing AI-powered features (chat interfaces, recommendation UIs, data visualizations)
- Basic front-end skills (HTML/CSS, or ability to inspect and adjust Tailwind classes)
- Experience with design tools beyond Figma: Framer for prototyping, Principle for animation, Maze for usability testing
- Experience in the creator economy, influencer marketing, or talent management space
- Illustration or motion design skills

**Compensation:**

- **Salary:** $90,000-$110,000/year (approximately 85-95% of market rate)
- **Equity:** 0.3-0.7% of fully diluted shares (4-year vest, 1-year cliff)
- **Benefits:** Remote-first, flexible PTO (minimum 15 days/year), $2,000 annual equipment stipend, $1,000 annual learning/conference budget, health insurance stipend
- **Performance bonus:** Up to $8,000/year tied to design system adoption, usability test scores, and feature launch quality

**Where to Recruit:**

| Channel                                     | Priority | Notes                                                 |
| ------------------------------------------- | -------- | ----------------------------------------------------- |
| Dribbble and Behance                        | High     | Portfolio-first discovery                             |
| ADPList community                           | High     | Design professionals open to mentorship and new roles |
| Wellfound                                   | Medium   | Startup-focused designers                             |
| LinkedIn                                    | Medium   | Targeted search for SaaS product designers            |
| Figma community and Friends of Figma events | Medium   | Designers active in the Figma ecosystem               |
| Twitter/X design community                  | Medium   | Design Twitter is active and well-networked           |

**Interview Process (5 stages, target 14 business days):**

**Stage 1: Portfolio Review (async, 1-2 days)**

- Review portfolio for: end-to-end product design (not just visual polish), research-informed decisions, complex workflow design, SaaS or marketplace experience
- Pass/fail gate: portfolio must include at least 2 case studies showing process (research, exploration, iteration, final design, results)

**Stage 2: Phone Screen (30 minutes, Founder)**

Questions:

1. "Walk me through a design project you are most proud of. Start with the problem, your process, key decisions, and the outcome."
2. "DealStage has 4 user types with very different needs. How would you approach designing a single platform that serves all of them well without becoming overly complex?"
3. "How do you handle designing for a feature where you do not yet have user research? What is your approach to making good design decisions with limited data?"
4. "What is your experience with design systems? How do you balance system consistency with the need for unique solutions?"

**Stage 3: Design Exercise (async, 72-hour window)**

Provide a real DealStage design challenge:

- Brief: "Redesign the AI match results page. Currently, brands see a list of matched talent with name, category, follower count, and a match score. The page has low engagement (users view matches but rarely take action). Redesign this experience to increase the rate at which brands initiate contact with matched talent."
- Provide: current wireframe/screenshot, user persona, key metrics, and constraints (must work within existing Tailwind/React component patterns)
- Deliverable: annotated mockups (2-3 screens), a brief rationale document explaining design decisions, and 1-2 alternative approaches considered and why they were rejected
- Time budget: 4-6 hours (explicitly state this)

**Stage 4: Design Review and Critique (60 minutes, live)**

- Candidate presents their design exercise
- Founder and Full-Stack Dev provide feedback and constraints
- Candidate iterates in real-time (whiteboard/Figma)
- Evaluate: presentation skills, response to feedback, design rationale depth, collaboration style

**Stage 5: Culture Interview (30 minutes, CS Associate + Content Creator)**

- Focus on cross-functional collaboration, handling competing stakeholder requests, and startup adaptability

#### 30/60/90 Day Onboarding Plan

**Days 1-30:** Product deep-dive across all 4 user types. Audit current UI for usability issues and design inconsistencies. Conduct 6+ user interviews. Begin building Figma design system from existing Tailwind components. Ship 2+ UI improvement designs.

**Days 31-60:** Own design for 2 major features. Establish user research cadence (bi-weekly interviews). Design system v1 published with core components. Run first usability test on a new feature.

**Days 61-90:** Full design ownership across all product surfaces. Design system adopted by engineering with documented handoff process. First quarterly UX review presented to team. User satisfaction metrics (SUS or task completion rates) baselined and tracked.

---

## Hiring Plan Summary

| Phase | Hire ID  | Role                            | Trigger  | Est. Month | Annual Cost (Salary + Benefits) |
| ----- | -------- | ------------------------------- | -------- | ---------- | ------------------------------- |
| 1     | --       | Contractors only                | $0 MRR   | 1-3        | $4,600-$10,000 total            |
| 2     | HIRE-001 | Customer Success Associate      | $5K MRR  | 4-6        | $55,000-$68,000                 |
| 2     | HIRE-002 | Growth Marketing (Contract)     | $5K MRR  | 4-6        | $48,000-$72,000                 |
| 3     | HIRE-003 | Full-Stack Developer            | $20K MRR | 7-12       | $105,000-$130,000               |
| 3     | HIRE-004 | Content Creator / Community Mgr | $20K MRR | 7-12       | $57,000-$72,000                 |
| 4     | HIRE-005 | Senior Backend Engineer (AI)    | $50K MRR | 13-18      | $155,000-$185,000               |
| 4     | HIRE-006 | Sales Lead                      | $50K MRR | 13-18      | $130,000-$165,000 (OTE)         |
| 4     | HIRE-007 | Product Designer                | $50K MRR | 13-18      | $100,000-$125,000               |

**Total Year 1 Payroll (Phases 1-3):** $270,000-$342,000 (including contractors)
**Total Year 1.5 Payroll (All Phases):** $655,000-$827,000

**Rule of Thumb:** Total payroll should not exceed 60% of MRR at any given time. If MRR stalls, delay hires rather than overextend.

---

# DELIVERABLE 29: COMPENSATION FRAMEWORK

## Summary

This compensation framework establishes DealStage's philosophy, salary bands, equity structure, benefits, and commission plans for the first 18 months and beyond. It is designed for a pre-revenue startup scaling to a core team, balancing cash conservation with the need to attract strong talent through meaningful equity and a compelling mission.

## Inputs and Assumptions

- **Jurisdiction:** United States (remote-first; state-specific pay transparency laws may require disclosure of salary ranges in job postings -- verify for CO, CA, NY, WA, CT, RI, and others before posting)
- **Benchmark source:** Market rates estimated from Levels.fyi, Glassdoor, Pave, and Carta data for remote SaaS startups with fewer than 50 employees as of early 2026
- **Entity structure:** Delaware C-Corp (assumed); equity granted as ISO (Incentive Stock Options) where eligible
- **409A valuation:** Required before issuing any stock options; engage a qualified valuation firm (Carta 409A, Eqvista, or similar) prior to first equity grant
- **Currency:** All figures in USD

## Legal and Privacy Notes

- Consult corporate counsel before establishing the equity plan (typically a board-approved Stock Option Plan).
- Obtain a 409A valuation before granting any options; failure to do so may result in adverse tax consequences for employees under IRC Section 409A.
- Comply with FLSA (Fair Labor Standards Act) for overtime eligibility; roles marked "exempt" must meet salary and duties tests.
- Verify state-specific requirements for pay transparency, salary history bans, and wage notification laws before extending offers.
- Commission plans should be documented in written commission agreements signed by both parties.

---

## Compensation Philosophy

### Core Principles

1. **Cash-Equity Tradeoff:** Early employees accept below-market cash compensation in exchange for meaningful equity ownership. As the company matures and cash flow improves, the ratio shifts toward market-rate cash with smaller equity grants.

2. **Transparency:** All salary bands are open internally. Every team member knows the band for their role and level. No individual salaries are disclosed, but the ranges are.

3. **Performance Orientation:** Base compensation reflects the role and level. Variable compensation (bonuses and commissions) rewards individual and company performance.

4. **Equity as Ownership:** Equity is not a lottery ticket; it represents genuine ownership in the company. The team should understand cap table basics, dilution, vesting, and potential outcomes.

5. **Benefits as Infrastructure:** Benefits are phased in as the company can afford them, starting with what matters most to remote workers (flexibility, equipment, learning) and adding traditional benefits (health insurance, retirement) as headcount grows.

### Cash-to-Market Ratios by Hire Sequence

| Hire Sequence | Cash vs. Market Rate | Equity Range   | Rationale                                                                  |
| ------------- | -------------------- | -------------- | -------------------------------------------------------------------------- |
| Hires 1-3     | 70-85% of market     | 0.5-2.0% each  | Maximum risk, maximum upside; these employees build the foundation         |
| Hires 4-5     | 80-90% of market     | 0.3-1.0% each  | Moderate risk; company has revenue traction and product-market fit signals |
| Hires 6-10    | 85-95% of market     | 0.1-0.5% each  | Lower risk; proven business model, growing team, clearer trajectory        |
| Hires 11-20   | 90-100% of market    | 0.05-0.2% each | Company has meaningful revenue and can compete more on cash                |

---

## Salary Bands by Role and Level

### Engineering

| Level | Title               | Market Rate (Remote SaaS) | DealStage Range (Hires 1-5) | DealStage Range (Hires 6+) |
| ----- | ------------------- | ------------------------- | --------------------------- | -------------------------- |
| IC-1  | Junior Developer    | $80,000-$100,000          | $60,000-$80,000             | $72,000-$95,000            |
| IC-2  | Developer           | $100,000-$130,000         | $75,000-$105,000            | $90,000-$124,000           |
| IC-3  | Mid-Level Developer | $115,000-$145,000         | $85,000-$120,000            | $100,000-$138,000          |
| IC-4  | Senior Developer    | $140,000-$175,000         | $105,000-$150,000           | $126,000-$166,000          |
| IC-5  | Staff Developer     | $170,000-$210,000         | $130,000-$178,000           | $153,000-$200,000          |
| M-1   | Engineering Manager | $155,000-$190,000         | $116,000-$162,000           | $140,000-$181,000          |
| M-2   | VP Engineering      | $190,000-$240,000         | $145,000-$204,000           | $171,000-$228,000          |

### Marketing

| Level | Title                       | Market Rate       | DealStage Range (Hires 1-5) | DealStage Range (Hires 6+) |
| ----- | --------------------------- | ----------------- | --------------------------- | -------------------------- |
| IC-1  | Marketing Coordinator       | $50,000-$65,000   | $37,000-$52,000             | $45,000-$62,000            |
| IC-2  | Marketing Specialist        | $65,000-$85,000   | $49,000-$68,000             | $59,000-$81,000            |
| IC-3  | Senior Marketing Specialist | $85,000-$110,000  | $64,000-$88,000             | $77,000-$105,000           |
| IC-4  | Marketing Manager           | $100,000-$130,000 | $75,000-$104,000            | $90,000-$124,000           |
| M-1   | Head of Marketing           | $130,000-$170,000 | $98,000-$136,000            | $117,000-$162,000          |

### Customer Success

| Level | Title                    | Market Rate       | DealStage Range (Hires 1-5) | DealStage Range (Hires 6+) |
| ----- | ------------------------ | ----------------- | --------------------------- | -------------------------- |
| IC-1  | CS Associate (Junior)    | $42,000-$52,000   | $32,000-$42,000             | $38,000-$49,000            |
| IC-2  | CS Associate             | $52,000-$68,000   | $39,000-$54,000             | $47,000-$65,000            |
| IC-3  | Senior CS Associate      | $68,000-$85,000   | $51,000-$68,000             | $61,000-$81,000            |
| IC-4  | CS Manager               | $85,000-$110,000  | $64,000-$88,000             | $77,000-$105,000           |
| M-1   | Head of Customer Success | $110,000-$140,000 | $83,000-$112,000            | $99,000-$133,000           |

### Sales

| Level | Title                  | Base Salary (Market) | DealStage Base (Hires 1-5) | Variable (at Quota) | OTE               |
| ----- | ---------------------- | -------------------- | -------------------------- | ------------------- | ----------------- |
| IC-1  | SDR (Sales Dev Rep)    | $45,000-$55,000      | $35,000-$44,000            | $15,000-$25,000     | $50,000-$69,000   |
| IC-2  | Account Executive (Jr) | $55,000-$70,000      | $44,000-$56,000            | $30,000-$40,000     | $74,000-$96,000   |
| IC-3  | Account Executive      | $70,000-$90,000      | $56,000-$72,000            | $40,000-$55,000     | $96,000-$127,000  |
| IC-4  | Senior AE / Sales Lead | $85,000-$110,000     | $68,000-$95,000            | $45,000-$65,000     | $113,000-$160,000 |
| M-1   | Head of Sales          | $110,000-$140,000    | $88,000-$119,000           | $55,000-$80,000     | $143,000-$199,000 |

### Design

| Level | Title                   | Market Rate       | DealStage Range (Hires 1-5) | DealStage Range (Hires 6+) |
| ----- | ----------------------- | ----------------- | --------------------------- | -------------------------- |
| IC-1  | Junior Product Designer | $60,000-$80,000   | $45,000-$64,000             | $54,000-$76,000            |
| IC-2  | Product Designer        | $80,000-$105,000  | $60,000-$84,000             | $72,000-$100,000           |
| IC-3  | Senior Product Designer | $105,000-$135,000 | $79,000-$108,000            | $95,000-$128,000           |
| IC-4  | Staff Product Designer  | $130,000-$160,000 | $98,000-$128,000            | $117,000-$152,000          |
| M-1   | Head of Design          | $145,000-$180,000 | $109,000-$144,000           | $131,000-$171,000          |

---

## Equity Framework

### Option Pool

| Parameter                        | Value                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Total option pool reserved       | 15% of fully diluted shares                                                                             |
| Plan type                        | Incentive Stock Option (ISO) Plan (where eligible; NSOs for contractors and non-qualifying grants)      |
| Vesting schedule                 | 4 years total                                                                                           |
| Cliff                            | 1 year (25% vests at 12-month anniversary)                                                              |
| Post-cliff vesting               | Monthly (1/48th per month)                                                                              |
| Exercise window (post-departure) | 90 days standard; consider extending to 1 year for employees with 2+ years tenure (consult tax counsel) |
| 409A valuation                   | Required before first grant; refresh annually or upon material events                                   |
| Board approval                   | Required for each grant                                                                                 |

### Equity Allocation by Hire Sequence

| Hire Number                     | Role (Reference)                | Equity Range | Notes                                                                                 |
| ------------------------------- | ------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| HIRE-001                        | Customer Success Associate      | 1.0-1.5%     | First hire; maximum risk, high ownership                                              |
| HIRE-002                        | Growth Marketing (Contract)     | 0.5-1.0%     | Granted upon conversion to full-time; pro-rated vesting start from FT conversion date |
| HIRE-003                        | Full-Stack Developer            | 1.0-1.5%     | Core engineering hire; high impact on product                                         |
| HIRE-004                        | Content Creator / Community Mgr | 0.5-1.0%     | Fourth hire; meaningful but smaller grant                                             |
| HIRE-005                        | Senior Backend Engineer (AI)    | 0.5-1.0%     | Senior role but later stage; company has more traction                                |
| HIRE-006                        | Sales Lead                      | 0.5-1.0%     | Revenue-driving role; commission compensates for smaller equity                       |
| HIRE-007                        | Product Designer                | 0.3-0.7%     | Seventh hire; company well-established                                                |
| **Total allocated (Hires 1-7)** |                                 | **4.3-6.7%** | Well within the 15% pool; leaves 8.3-10.7% for future hires                           |

### Equity Grant Decision Framework

When deciding where within the range to grant equity for a given hire:

| Factor           | Lower End of Range         | Upper End of Range                           |
| ---------------- | -------------------------- | -------------------------------------------- |
| Experience level | Meets minimum requirements | Significantly exceeds requirements           |
| Risk tolerance   | Prefers higher cash        | Willing to accept lower cash for more equity |
| Market demand    | Readily available talent   | Highly competitive, scarce talent            |
| Impact potential | Important contributor      | Potential to be transformational             |
| Competing offers | No strong alternatives     | Strong competing offers from funded startups |

### Equity Value Illustration

Provide this to candidates to help them understand potential equity value (with appropriate disclaimers that these are hypothetical and not guarantees):

| Scenario     | Company Valuation | Value of 1.0% |
| ------------ | ----------------- | ------------- |
| Seed Round   | $5M               | $50,000       |
| Series A     | $20M              | $200,000      |
| Series B     | $80M              | $800,000      |
| Growth Stage | $200M             | $2,000,000    |

_Note: These are illustrative only. Actual value depends on future fundraising, dilution, liquidation preferences, and numerous other factors. Equity may be worth $0. This is not a guarantee of future value._

---

## Benefits (Phased)

### Phase 1: Foundation Benefits (1-5 Employees)

| Benefit           | Details                                                                                                                  | Est. Annual Cost Per Employee       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Remote-first work | Work from anywhere in the US; no office requirement                                                                      | $0                                  |
| Flexible PTO      | Minimum 15 days/year PTO + US federal holidays + sick days as needed; no accrual cap but must take at least 10 days/year | $0 (operational cost only)          |
| Equipment stipend | $1,000-$2,500/year (role-dependent) for home office setup, computer upgrades, peripherals                                | $1,000-$2,500                       |
| Learning budget   | $500-$2,000/year (role-dependent) for courses, books, conferences, certifications                                        | $500-$2,000                         |
| Flexible hours    | Core hours 10am-1pm ET for meetings; otherwise flexible scheduling                                                       | $0                                  |
| Company laptop    | MacBook Air/Pro provided for engineering and design roles; stipend for others                                            | $1,500-$2,500 (one-time, amortized) |

**Total Phase 1 benefits cost per employee:** $2,000-$7,000/year

### Phase 2: Growth Benefits (6-15 Employees, est. $100K+ MRR)

All Phase 1 benefits plus:

| Benefit                  | Details                                                                                                                                            | Est. Annual Cost Per Employee |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Health insurance         | Company covers 80% of individual premium via ICHRA (Individual Coverage Health Reimbursement Arrangement) or group plan; 50% of dependent coverage | $6,000-$10,000                |
| Dental and vision        | Company covers 100% of individual premium                                                                                                          | $600-$1,200                   |
| Learning budget increase | $2,000-$3,000/year including 1 conference/year with travel                                                                                         | $2,000-$3,000                 |
| Home internet stipend    | $75/month reimbursement                                                                                                                            | $900                          |
| Annual team retreat      | 3-day in-person retreat (company covers travel, lodging, activities)                                                                               | $2,000-$3,000 per person      |
| Mental health benefit    | Subscription to therapy platform (e.g., BetterHelp, Talkspace)                                                                                     | $1,200-$2,400                 |

**Total Phase 2 benefits cost per employee:** $12,700-$19,600/year

### Phase 3: Mature Benefits (16+ Employees, est. $200K+ MRR)

All Phase 1 and 2 benefits plus:

| Benefit                           | Details                                                                                                                                                      | Est. Annual Cost Per Employee                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 401(k) with match                 | 4% match (100% of first 4% of salary); consider Safe Harbor plan for compliance simplicity                                                                   | $3,000-$6,000                                   |
| Parental leave                    | 12 weeks paid for primary caregiver; 4 weeks paid for secondary caregiver (verify state requirements -- CA, NY, WA, and others may mandate additional leave) | Variable (budget $5,000-$15,000 per occurrence) |
| Life and disability insurance     | Company-paid basic life ($50K) + short-term and long-term disability                                                                                         | $500-$1,000                                     |
| Commuter benefits (if applicable) | Pre-tax transit/parking for hybrid workers                                                                                                                   | $200-$500                                       |
| Professional development          | $5,000/year individual budget + management training programs                                                                                                 | $5,000                                          |
| Sabbatical                        | 4 weeks paid sabbatical after 4 years of tenure                                                                                                              | Prorated                                        |

**Total Phase 3 benefits cost per employee:** $22,000-$35,000/year

---

## Commission Structure for Sales Roles

### Sales Lead (HIRE-006) Commission Plan

**Plan Effective Period:** Rolling 12 months, reviewed quarterly
**Plan Type:** Revenue-based commission on closed-won deals
**Base/Variable Split:** 60% base / 40% variable

#### Quota Setting

| Parameter       | Value                                                                            |
| --------------- | -------------------------------------------------------------------------------- |
| Monthly quota   | $15,000 in new MRR (closed-won new business + expansion)                         |
| Quarterly quota | $45,000 in new MRR                                                               |
| Annual quota    | $180,000 in new MRR                                                              |
| Quota ramp      | Month 1: 25% quota, Month 2: 50% quota, Month 3: 75% quota, Month 4+: 100% quota |

**Quota methodology:** Quota is set at 4x the OTE variable component (industry standard for SaaS sales). At $50,000 annual variable, the annual quota is $180,000 in new MRR, which translates to roughly 40-60 new Brand/Agency deals per year at an average ACV (Annual Contract Value) of $3,000-$4,500.

#### Commission Rates

| Performance Level | New MRR Achievement | Commission Rate           | Example Payout (on $15K MRR)       |
| ----------------- | ------------------- | ------------------------- | ---------------------------------- |
| Below threshold   | 0-49% of quota      | 0% (no commission)        | $0                                 |
| Threshold         | 50-79% of quota     | 6% of new MRR             | $630 (at 70%)                      |
| At quota          | 80-100% of quota    | 8% of new MRR             | $1,200 (at 100%)                   |
| Accelerator 1     | 101-150% of quota   | 12% of new MRR above 100% | $1,200 + incremental at 12%        |
| Accelerator 2     | 151%+ of quota      | 16% of new MRR above 150% | $1,200 + Acc1 + incremental at 16% |

**Example at 130% quota ($19,500 new MRR in a month):**

- First $15,000 (100% quota): $15,000 x 8% = $1,200
- Next $4,500 (101-130%): $4,500 x 12% = $540
- **Total monthly commission:** $1,740

**Example at 170% quota ($25,500 new MRR in a month):**

- First $15,000 (100% quota): $15,000 x 8% = $1,200
- Next $7,500 (101-150%): $7,500 x 12% = $900
- Next $3,000 (151-170%): $3,000 x 16% = $480
- **Total monthly commission:** $2,580

#### Additional Commission Components

| Component                                          | Rate                                    | Notes                                                      |
| -------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| Renewal commission                                 | 2% of renewed MRR                       | Paid on annual renewals for accounts the sales lead closed |
| Expansion commission                               | 10% of expansion MRR                    | Paid when existing accounts upgrade to higher tiers        |
| Multi-year deal bonus                              | 1 month commission bonus                | Paid when a customer commits to an annual prepaid plan     |
| Referral SPIFs (Sales Performance Incentive Funds) | $250 per qualified referral that closes | Quarterly SPIFs to incentivize referral generation         |

#### Commission Plan Policies

- **Payment timing:** Commissions paid monthly, 30 days after deal closes (allows for churn-back window)
- **Churn-back:** If a customer churns within 60 days of closing, commission is clawed back in full
- **Split deals:** If multiple sales reps are involved, splits are pre-agreed and documented before the deal closes
- **Plan changes:** Commission plan is reviewed quarterly; changes require 30 days notice and apply to new deals only (existing pipeline grandfathered for 60 days)
- **Cap:** No commission cap (uncapped upside is critical for startup sales hiring)

### Future SDR Commission Plan (When Hired)

| Component           | Value                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Base salary         | $35,000-$44,000                                                                                  |
| Variable (at quota) | $15,000-$25,000                                                                                  |
| Quota               | 30 qualified meetings set per month (meeting = discovery call completed with qualified prospect) |
| Commission rate     | $75-$125 per qualified meeting                                                                   |
| Bonus               | $500 per meeting that converts to closed-won deal                                                |

---

## Performance Bonus Framework (Non-Sales Roles)

### Bonus Pool

Annual bonus pool is set at 5-10% of total salary expense, funded quarterly based on company performance.

### Bonus Allocation

| Role Category    | Max Annual Bonus      | Metrics                                                                                                               |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Engineering      | Up to $10,000-$15,000 | Sprint velocity, code quality (PR review scores), production incident SLA adherence, feature delivery against roadmap |
| Customer Success | Up to $5,000-$8,000   | NPS score, monthly churn rate, onboarding completion rate, ticket resolution SLA                                      |
| Marketing        | Up to $5,000-$8,000   | Qualified signups, CAC by channel, content traffic, community growth                                                  |
| Design           | Up to $5,000-$8,000   | Usability test scores, design system adoption, feature launch quality, user satisfaction metrics                      |

### Bonus Payout Schedule

- Reviewed quarterly
- Paid semi-annually (at 6-month and 12-month marks)
- Requires minimum 3 months tenure to be eligible for first payout
- Pro-rated for partial periods

---

## Compensation Review Cadence

| Event                      | Frequency                                                                     | Scope                                                                      |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Annual compensation review | Every 12 months from hire date (align to calendar year once team reaches 10+) | Salary adjustment (merit + market), equity refresh grant consideration     |
| Promotion review           | As triggered by performance and business need                                 | Level change, salary band adjustment, equity refresh                       |
| Market data refresh        | Annually (January)                                                            | Update salary bands based on current market data (Pave, Carta, Levels.fyi) |
| Equity refresh grants      | After Year 2 for high performers                                              | Additional grants to maintain retention value as initial grants vest       |

---

# DELIVERABLE 30: RECRUITING PIPELINE TRACKER

## Summary

This deliverable provides a complete recruiting operations toolkit for DealStage: a pipeline tracking framework, stage definitions, templates for every candidate touchpoint, and scoring instruments for structured evaluation. The system is designed for a solo founder managing hiring directly, with the flexibility to scale as a recruiting coordinator or HR function is added later.

## Inputs and Assumptions

- **ATS (Applicant Tracking System) recommendation:** At the current stage, use Notion or a shared Google Sheet. Migrate to Ashby, Lever, or Greenhouse when the team reaches 10+ and hiring volume exceeds 3 open roles simultaneously.
- **Pipeline data is a living document:** Update after every candidate interaction.
- **All evaluations must be documented in writing** within 24 hours of the interaction to ensure fair, consistent, and legally defensible hiring decisions.

---

## Pipeline Stage Definitions

| Stage      | ID  | Definition                                                                                        | Owner                      | SLA                                                                             |
| ---------- | --- | ------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| Sourced    | S1  | Candidate identified through any channel; basic profile reviewed and deemed potentially qualified | Hiring Manager             | Move to S2 within 3 business days or archive                                    |
| Outreach   | S2  | Initial contact made (email, LinkedIn message, or inbound application acknowledged)               | Hiring Manager             | First response within 2 business days of outreach                               |
| Screen     | S3  | Phone/video screen completed; basic qualifications verified                                       | Hiring Manager             | Schedule within 5 business days of S2; decision within 1 business day of screen |
| Assessment | S4  | Technical assessment, work sample, or portfolio review completed                                  | Hiring Manager + Evaluator | Assessment window: 72 hours; evaluation within 2 business days                  |
| Interview  | S5  | In-depth interview(s) completed (may include multiple rounds)                                     | Interview Panel            | Schedule within 5 business days of S4 pass; decision within 2 business days     |
| Offer      | S6  | Verbal and/or written offer extended                                                              | Hiring Manager + CEO       | Extend within 2 business days of hire decision                                  |
| Closed     | S7  | Accepted, Declined, or Withdrawn                                                                  | Hiring Manager             | Candidate has 5 business days to respond to offer                               |

---

## Role Tracker Template

### Open Roles Dashboard

| Field               | Description                                                                    | Example                                   |
| ------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| Role ID             | Unique identifier                                                              | REC-001                                   |
| Position Title      | Full role title                                                                | Customer Success Associate                |
| Department          | Functional area                                                                | Customer Success                          |
| Priority            | Critical / High / Medium / Low                                                 | Critical                                  |
| Status              | Open / Sourcing / Interviewing / Offer Extended / Filled / On Hold / Cancelled | Open                                      |
| Hiring Manager      | Person responsible for hire decision                                           | Founder                                   |
| Date Opened         | When the role was approved to fill                                             | 2026-06-01                                |
| Target Fill Date    | Desired start date                                                             | 2026-07-15                                |
| Time-to-Fill Target | Business days from open to accepted offer                                      | 30 days                                   |
| MRR Trigger         | Revenue threshold that activated this role                                     | $5,000                                    |
| Budget Approved     | Y/N                                                                            | Y                                         |
| Compensation Range  | Salary band for this role                                                      | $50,000-$60,000 + 1.0-1.5% equity         |
| JD Link             | Link to finalized job description                                              | [link]                                    |
| Pipeline Summary    | Candidates per stage                                                           | S1: 12, S2: 8, S3: 4, S4: 2, S5: 1, S6: 0 |
| Source Breakdown    | Channel attribution                                                            | Referral: 4, LinkedIn: 5, Wellfound: 3    |
| Notes               | Current status notes                                                           | Top 2 candidates completing assessments   |

### Active Roles Table (Example)

| Role ID | Title                       | Priority | Status       | S1  | S2  | S3  | S4  | S5  | S6  | Days Open | Target |
| ------- | --------------------------- | -------- | ------------ | --- | --- | --- | --- | --- | --- | --------- | ------ |
| REC-001 | Customer Success Associate  | Critical | Interviewing | 15  | 10  | 6   | 3   | 1   | 0   | 18        | 30     |
| REC-002 | Growth Marketing (Contract) | High     | Sourcing     | 8   | 3   | 0   | 0   | 0   | 0   | 7         | 21     |
| REC-003 | Full-Stack Developer        | Critical | Open         | 0   | 0   | 0   | 0   | 0   | 0   | 0         | 45     |

---

## Candidate Tracker Template

For each candidate in the pipeline:

| Field                            | Description                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| Candidate ID                     | CND-001+                                                                    |
| Name                             | Full name                                                                   |
| Role ID                          | Which role they are being considered for                                    |
| Current Stage                    | S1-S7                                                                       |
| Source Channel                   | How they were found (Referral, LinkedIn, Wellfound, HN, Direct Apply, etc.) |
| Source Detail                    | Specific referrer name, job board listing, or outreach campaign             |
| Date Entered Pipeline            | When first sourced                                                          |
| Date of Last Stage Change        | When they moved to current stage                                            |
| Phone Screen Score               | 1-5 overall (from scorecard)                                                |
| Assessment Score                 | Numeric from rubric (e.g., 22/30)                                           |
| Interview Score                  | 1-5 overall (from scorecard)                                                |
| Strengths                        | Top 2-3 strengths observed                                                  |
| Concerns                         | Any concerns or areas to probe in next stage                                |
| Compensation Expectations        | If disclosed                                                                |
| Availability / Start Date        | When they could start                                                       |
| Status Notes                     | Current action items, next steps                                            |
| Decision                         | Advance / Reject / Hold / Offer                                             |
| Rejection Reason (if applicable) | Job-related reason for decline                                              |

---

## Recruiting Channels Ranked by Effectiveness

| Rank | Channel                                                     | Best For                                                                        | Cost                                  | Expected Quality | Conversion Rate (Source to Hire) | Notes                                                                        |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------- | ---------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| 1    | Personal network and referrals                              | All roles                                                                       | $0-$3,000 (referral bonus)            | Highest          | 15-25%                           | Always start here; fastest and highest signal                                |
| 2    | Twitter/X tech and creator community                        | Engineering, Marketing, Design                                                  | $0 (organic posting)                  | High             | 5-10%                            | Build public brand; engage target communities before you need to hire        |
| 3    | LinkedIn (targeted outreach)                                | All roles                                                                       | $0-$100/mo (Sales Navigator optional) | Medium-High      | 3-8%                             | Personalized outreach with specific value proposition; avoid generic InMails |
| 4    | Wellfound (formerly AngelList)                              | All startup roles                                                               | $0-$250/mo                            | High             | 5-12%                            | Candidates self-select for startup environment; strong for first 10 hires    |
| 5    | Hacker News "Who's Hiring"                                  | Engineering, Design                                                             | $0                                    | High             | 3-7%                             | Monthly thread; high-quality candidates but competitive                      |
| 6    | Discord/Slack communities                                   | Engineering (Supabase, React, TypeScript), Marketing (Superpath, GrowthHackers) | $0                                    | Medium-High      | 2-5%                             | Build relationships before posting roles; avoid spamming                     |
| 7    | Niche job boards (Key Values, Otta, Support Driven, RepVue) | Role-specific                                                                   | $0-$500/listing                       | Medium-High      | 3-8%                             | Worth testing for specific roles                                             |
| 8    | Indeed / Glassdoor                                          | CS, Operations, Sales (non-technical)                                           | $200-$500/listing                     | Medium           | 1-3%                             | Higher volume, lower signal; better for later-stage hiring                   |
| 9    | Recruiting agencies                                         | Senior/specialized roles                                                        | 15-25% of first-year salary           | Variable         | 20-40% (pre-screened)            | Use only for critical senior hires that are unfilled after 45+ days          |

---

## Templates

### Template 1: Cold Outreach Message (LinkedIn/Email)

**Subject:** Building the future of brand-talent partnerships -- DealStage is hiring

---

Hi [First Name],

I came across your [profile / work on X / project Y] and was impressed by [specific detail -- e.g., "your content strategy work at [Company]" or "your contributions to the Supabase community"].

I am building DealStage (thedealstage.com) -- an AI-powered platform that connects brands with talent (influencers, athletes, actors, models, and 140+ other types) for partnerships. We use dual AI (Claude + GPT-4o-mini) with 30+ specialized agents to make partnership discovery and management radically easier.

We are at [current MRR] MRR, growing [X]% month-over-month, and looking for a [Role Title] to [one sentence on the role's mission].

What makes this interesting:

- You would be employee #[N] -- meaningful equity (see specifics below) and direct impact on the product
- Fully remote, async-first culture with flexibility to do your best work
- Tech stack: [relevant stack details]
- Equity: [X-Y]% with standard 4-year vesting

I would love to spend 20 minutes telling you more about what we are building and learning about what you are looking for. No pressure -- happy to share details even if the timing is not right.

Would [Day] at [Time] work for a quick call?

Best,
[Founder Name]
CEO and Founder, DealStage
thedealstage.com

---

### Template 2: Warm Outreach Message (Referral)

**Subject:** [Referrer Name] suggested we connect -- [Role Title] at DealStage

---

Hi [First Name],

[Referrer Name] mentioned that you might be interested in [what the role offers -- e.g., "an early-stage product design role" or "leading growth at an AI-first startup"], and suggested I reach out.

I am building DealStage (thedealstage.com), an AI-powered brand-talent partnership platform. [Referrer Name] thought your experience with [specific relevant experience] would be a great fit for our [Role Title] position.

Quick context:

- [One sentence about the company stage and traction]
- [One sentence about the role and why it matters]
- [One sentence about comp/equity highlights]

Would you be open to a 20-minute conversation this week? I can share more details and answer any questions.

Best,
[Founder Name]

---

### Template 3: Phone Screen Scorecard

**Candidate:** ******\_\_\_******
**Role:** ******\_\_\_******
**Screener:** ******\_\_\_******
**Date:** ******\_\_\_******
**Duration:** \_\_\_ minutes

| Dimension                                               | Score (1-5) | Notes |
| ------------------------------------------------------- | ----------- | ----- |
| Relevant experience (years, depth, recency)             |             |       |
| Role-specific skills (per JD must-haves)                |             |       |
| Communication clarity and professionalism               |             |       |
| Enthusiasm for the role and company                     |             |       |
| Startup readiness (comfort with ambiguity, pace, scope) |             |       |
| Culture signals (collaboration, ownership, curiosity)   |             |       |
| **Overall Score**                                       | **/30**     |       |

**Scoring Guide:**

- 1 = Significant concern; does not meet minimum
- 2 = Below expectations; notable gaps
- 3 = Meets expectations; solid fit
- 4 = Exceeds expectations; strong fit
- 5 = Exceptional; top 10% of candidates screened

**Minimum passing score:** 18/30 (average 3.0)

**Recommendation:** [ ] Advance to next stage [ ] Hold [ ] Reject

**Key strengths:**

**Key concerns:**

**Questions for next round:**

---

### Template 4: Technical Assessment Rubric (Engineering Roles)

**Candidate:** ******\_\_\_******
**Role:** ******\_\_\_******
**Evaluator:** ******\_\_\_******
**Date:** ******\_\_\_******
**Assessment type:** Take-home project / Live coding / System design (circle one)

| Dimension                                            | Weight   | Score (1-5) | Weighted Score | Notes |
| ---------------------------------------------------- | -------- | ----------- | -------------- | ----- |
| Code quality (readability, structure, naming)        | 15%      |             |                |       |
| Architecture (separation of concerns, patterns)      | 20%      |             |                |       |
| Technical correctness (functionality, edge cases)    | 20%      |             |                |       |
| Database design (schema, queries, security)          | 15%      |             |                |       |
| Testing (coverage, quality, strategy)                | 15%      |             |                |       |
| Documentation and communication                      | 10%      |             |                |       |
| Bonus: creativity, polish, or going above and beyond | 5%       |             |                |       |
| **Weighted Total**                                   | **100%** |             | **/5.0**       |       |

**Minimum passing weighted score:** 3.0/5.0

**Recommendation:** [ ] Strong Advance [ ] Advance [ ] Borderline (discuss) [ ] Reject

**Summary (2-3 sentences):**

---

### Template 5: Reference Check Questions

**Candidate:** ******\_\_\_******
**Reference name:** ******\_\_\_******
**Reference relationship:** ******\_\_\_******
**Reference contact verified via:** LinkedIn / Company email / Candidate provided (circle one)
**Date:** ******\_\_\_******
**Interviewer:** ******\_\_\_******

1. "How do you know [Candidate], and how long did you work together?"

2. "What was [Candidate]'s role, and what were their primary responsibilities?"

3. "What would you say are [Candidate]'s top 2-3 professional strengths?"

4. "Can you describe an area where [Candidate] could improve or develop further?"

5. "How would you describe [Candidate]'s work style? Are they more independent or collaborative? How do they handle ambiguity?"

6. "Can you give me an example of a challenging situation [Candidate] faced at work and how they handled it?"

7. "On a scale of 1-10, how likely would you be to work with [Candidate] again, and why?"

8. "Is there anything else you think I should know about [Candidate] that would help me make this decision?"

**Overall reference assessment:** [ ] Strong positive [ ] Positive [ ] Mixed [ ] Concerning

**Notes:**

---

### Template 6: Offer Letter Template

_Note: This is a template only. Have legal counsel review your specific offer letters before use, particularly equity grant language, at-will provisions, and any state-specific requirements._

---

**[DealStage / PartnerIQ Letterhead]**

[Date]

[Candidate Full Name]
[Candidate Address]

Dear [First Name],

We are thrilled to extend an offer for you to join DealStage as our **[Role Title]**, reporting to **[Manager Name/Title]**. We believe your experience in [brief reference to relevant background] makes you an excellent fit for this role, and we are excited about what we can build together.

**Position Details:**

| Detail          | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| Title           | [Role Title]                                                       |
| Department      | [Department]                                                       |
| Start Date      | [Proposed Start Date]                                              |
| Employment Type | [Full-time, Exempt / Full-time, Non-Exempt / Part-time / Contract] |
| Work Location   | Remote (United States)                                             |
| Reports To      | [Manager Name, Title]                                              |

**Compensation:**

| Component             | Value                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Annual Base Salary    | $[Amount], paid [semi-monthly / bi-weekly]                                                                                                                    |
| Equity Grant          | [X]% of fully diluted shares, granted as [ISOs / NSOs] under the DealStage Stock Option Plan, subject to board approval and the terms of the option agreement |
| Vesting Schedule      | 4-year vesting with a 1-year cliff; 25% vests on your 1-year anniversary, remainder vests monthly over the following 36 months                                |
| Performance Bonus     | Up to $[Amount] annually, based on [metrics summary]                                                                                                          |
| [If Sales] Commission | Per the attached commission plan, with OTE of $[Amount]                                                                                                       |

**Benefits:**

- Flexible PTO with a minimum of 15 days per year, plus US federal holidays
- $[Amount] annual equipment stipend
- $[Amount] annual learning and development budget
- Remote-first, async-default work culture
- [Any additional benefits applicable at current phase]

**Conditions:**

This offer is contingent upon:

1. Satisfactory completion of a background check (if applicable per role and jurisdiction)
2. Verification of your legal authorization to work in the United States (I-9 completion)
3. Execution of the DealStage Confidentiality, Invention Assignment, and Non-Solicitation Agreement (enclosed)
4. [If equity] Board approval of your stock option grant

**Employment Relationship:**

Your employment with PartnerIQ (d/b/a DealStage) is at-will, meaning either you or the company may end the employment relationship at any time, with or without cause or notice, subject to applicable law. This letter is not a contract of employment for any specific duration.

**Acceptance:**

This offer is valid until [Date -- typically 5 business days from offer date]. To accept, please sign below and return a copy to [email address].

We are genuinely excited about the possibility of you joining the team. If you have questions about any aspect of this offer, please do not hesitate to reach out.

Welcome to DealStage.

Sincerely,

---

[Founder Name]
CEO and Founder, DealStage

**ACCEPTED:**

---

[Candidate Name] Date

---

### Template 7: Rejection Email (Post-Interview)

**Subject:** Update on your DealStage application -- [Role Title]

---

Hi [First Name],

Thank you for taking the time to interview for the [Role Title] position at DealStage. I genuinely enjoyed our conversations and learning about your experience with [specific detail from their interview -- e.g., "building the customer success function at [Company]" or "your approach to growth marketing for marketplace products"].

After careful consideration, we have decided to move forward with another candidate whose background more closely aligns with [specific, job-related reason -- e.g., "our immediate need for deep Supabase and Edge Function experience" or "experience managing high-volume support in a marketplace environment"].

This was a difficult decision -- you were among our strongest candidates, and I was particularly impressed by [one genuine compliment]. I would absolutely encourage you to keep us in mind for future roles as we continue to grow. I expect we will be hiring for [related future role] in the coming months, and I would love to reconnect then.

If you would find it helpful, I am happy to share more specific feedback on your interview performance -- just reply to this email and I will send over my notes.

Thank you again for your time and interest in DealStage. I wish you the best in your search.

Warm regards,
[Founder Name]
CEO and Founder, DealStage

---

### Template 8: Rejection Email (Post-Application, No Interview)

**Subject:** Your DealStage application -- [Role Title]

---

Hi [First Name],

Thank you for your interest in the [Role Title] position at DealStage and for taking the time to apply.

After reviewing your application, we have decided to move forward with candidates whose experience more closely matches our current needs for this specific role. This is not a reflection of your abilities -- we received a strong pool of applicants, and the decision came down to very specific requirements.

We are growing and expect to open additional roles in the coming months. If you are interested, I would encourage you to follow us at thedealstage.com for future opportunities.

Thank you again for considering DealStage.

Best,
[Founder Name]
CEO and Founder, DealStage

---

## Recruiting Metrics Dashboard

Track these metrics monthly to evaluate and improve recruiting effectiveness:

| Metric                | Definition                                                                                          | Target (First 5 Hires)                                                         | How to Measure                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Time-to-Fill          | Business days from role opened to offer accepted                                                    | 30 days (CS, Marketing), 45 days (Engineering, Design, Sales)                  | Date math in tracker                                         |
| Pipeline Velocity     | Average days a candidate spends in each stage                                                       | S1-S2: 3 days, S2-S3: 5 days, S3-S4: 5 days, S4-S5: 7 days, S5-S6: 3 days      | Stage timestamp tracking                                     |
| Source-to-Hire Rate   | % of sourced candidates that result in a hire, by channel                                           | 10%+ from referrals, 3%+ from other channels                                   | Pipeline analytics                                           |
| Offer Acceptance Rate | % of offers extended that are accepted                                                              | 80%+                                                                           | Offer outcomes                                               |
| Screen-to-Offer Rate  | % of phone screens that progress to offer                                                           | 15-25%                                                                         | Stage conversion                                             |
| Candidate NPS         | Satisfaction score from all interviewed candidates (accepted and rejected)                          | 8+ out of 10                                                                   | Post-process survey (send to all candidates who reached S3+) |
| Cost-per-Hire         | Total recruiting spend (job boards, referral bonuses, recruiter fees, paid trials) divided by hires | Under $2,000 for first 5 hires (excluding equity value)                        | Expense tracking                                             |
| Diversity of Pipeline | Representation across sourced candidates (self-reported, voluntary)                                 | Track to ensure broad sourcing; do not set quotas but monitor for channel bias | Voluntary self-ID at application                             |

---

# DELIVERABLE 31: ORG EVOLUTION MAP

## Summary

This deliverable maps the organizational evolution of DealStage from a solo founder to a 30-person growth-stage company. Each stage is defined by an MRR threshold (not a timeline), includes an org chart, key challenges, culture risks, and the processes that must be introduced to navigate the transition successfully.

## Inputs and Assumptions

- Stages are triggered by sustained MRR, not calendar dates
- Org charts show reporting lines, not physical proximity (fully remote company)
- "Advisory Board" refers to informal advisors (not a formal board of directors, which is established at incorporation and formalized at the seed round)
- Role titles may be adjusted based on actual hires; the structure matters more than the specific title

---

## Stage 1: Solo Founder ($0-$5K MRR)

```
CEO / Founder
├── Product & Engineering
│   ├── Frontend development (React, Vite, Tailwind)
│   ├── Backend development (Supabase, Edge Functions)
│   ├── AI agent development (Claude, GPT-4o-mini)
│   ├── Infrastructure (Vercel, Railway)
│   └── QA and testing
├── Sales & Revenue
│   ├── Founder-led demos and outreach
│   ├── Pricing and packaging
│   └── Stripe billing management
├── Customer Support
│   ├── Intercom / email support
│   ├── Help center creation
│   └── Bug triage
├── Marketing
│   ├── Content creation (blog, social)
│   ├── SEO
│   ├── Community engagement
│   └── AI-assisted content generation
├── Operations
│   ├── Finance and bookkeeping
│   ├── Legal (contractor agreements, ToS)
│   └── Vendor management
└── Contractors (as needed)
    ├── Brand / UI Designer
    ├── Legal Counsel
    ├── Content Writer
    └── Bookkeeper
```

**Headcount:** 1 full-time + 2-4 contractors
**Monthly Payroll (excl. founder):** $1,500-$3,000 (contractor costs)

### Key Challenges

| Challenge         | Impact                                                                                    | Mitigation                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Founder burnout   | Single point of failure for everything; unsustainable beyond 3-6 months at high intensity | Time-box to 50 hours/week; use AI tools aggressively; ruthlessly prioritize; establish non-negotiable recovery time   |
| Context switching | 5+ functional areas per day destroy deep work capacity                                    | Batch similar tasks (coding blocks, support blocks, marketing blocks); designate Maker Days (no meetings)             |
| No backup         | Illness or emergency means everything stops                                               | Document all critical processes; automate where possible; build redundancy into infrastructure (monitoring, alerts)   |
| Quality vs. speed | Temptation to ship fast and accumulate technical debt                                     | Set minimum quality bar (tests for critical paths, code review via AI tools, design reviews against brand guidelines) |

### Processes to Establish

- [ ] Daily standup with yourself (15 min written reflection on priorities, blockers, and wins)
- [ ] Weekly metrics review (MRR, signups, churn, support volume, feature velocity)
- [ ] Monthly financial review (runway, burn rate, revenue trends)
- [ ] Documented runbooks for critical operations (deployment, incident response, billing issues)
- [ ] Customer feedback log (centralized place to capture all user feedback for product decisions)

### Culture Foundation

At this stage, culture is whatever the founder embodies. Establish core values now that will guide every future hire:

1. **Ownership** -- act like an owner because you are one
2. **Velocity with quality** -- ship fast, but ship well
3. **Customer obsession** -- every decision filters through user value
4. **Transparency** -- default to open; share context generously
5. **Remote excellence** -- async-first, written communication, deep work protection

---

## Stage 2: Micro Team ($5K-$20K MRR)

```
CEO / Founder
├── Engineering (Founder)
│   ├── All product development
│   ├── AI agent maintenance and improvement
│   └── Infrastructure and DevOps
├── Customer Success
│   └── CS Associate (HIRE-001)
│       ├── User onboarding
│       ├── Support tickets
│       ├── Help center management
│       └── Churn prevention
├── Growth Marketing (Contract)
│   └── Growth Specialist (HIRE-002)
│       ├── Content and SEO
│       ├── Paid acquisition
│       ├── Community engagement
│       └── Analytics and experimentation
└── Contractors
    ├── Designer (as needed)
    ├── Legal Counsel (as needed)
    └── Bookkeeper (ongoing)
```

**Headcount:** 2 full-time + 1 contractor (Growth) + part-time contractors
**Monthly Payroll:** $8,500-$12,000 (CS salary + Growth contract + other contractors)

### Transition Triggers (Stage 1 to Stage 2)

| Trigger           | Threshold                             | Why It Matters                                                                    |
| ----------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| MRR               | $5,000 sustained 30+ days             | Revenue can support first salary                                                  |
| Support volume    | 2+ hours/day of founder time          | Founder time is the scarcest resource; redirect it to product and sales           |
| Churn rate        | >8% monthly                           | Dedicated CS reduces churn; retention is the highest-ROI investment               |
| Founder bandwidth | <15 hours/week on product development | If the founder cannot build, the product stagnates; hire to free up building time |

### Key Challenges

| Challenge                           | Impact                                                                        | Mitigation                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| First management experience         | Founder has never managed people; risk of micromanagement or under-management | Set clear OKRs (Objectives and Key Results) for each hire; weekly 1:1s (30 min); trust but verify through metrics, not surveillance |
| Culture definition with first hires | First hires set the cultural DNA for the entire company                       | Hire for values alignment; make culture values explicit in onboarding; model the behavior you expect                                |
| Communication overhead              | 3 people requires intentional communication structures                        | Establish async-first norms: Slack for daily comms, Notion for documentation, weekly all-hands (30 min video), written updates      |
| Contractor-to-team integration      | Growth Marketer is a contractor; different engagement model                   | Include in all team rituals; treat as a team member, not an outsider; plan conversion timeline                                      |

### Processes to Add

- [ ] Weekly team standup (async or sync, 30 min max): each person shares wins, plans, blockers
- [ ] Weekly 1:1s between founder and each team member (30 min each)
- [ ] Monthly all-hands meeting (30 min): company metrics, product updates, customer stories, Q&A
- [ ] Shared Notion workspace: team wiki, meeting notes, OKRs, process documentation
- [ ] Quarterly OKR setting and review
- [ ] Onboarding checklist for each new hire (see Deliverable 28 for role-specific 30/60/90 plans)
- [ ] Incident response process: who to contact, escalation paths, post-mortem template

### Communication Rhythm

| Cadence   | Meeting          | Attendees         | Duration        | Format                                            |
| --------- | ---------------- | ----------------- | --------------- | ------------------------------------------------- |
| Daily     | Async standup    | All               | 5 min (written) | Slack thread: "Yesterday / Today / Blockers"      |
| Weekly    | Team sync        | All               | 30 min          | Video call: metrics review, priorities, decisions |
| Weekly    | 1:1 with Founder | Each person       | 30 min          | Video call: career growth, blockers, feedback     |
| Monthly   | All-hands        | All + contractors | 30 min          | Video call: MRR update, product roadmap, wins     |
| Quarterly | OKR review       | All               | 60 min          | Video call: review results, set next quarter      |

---

## Stage 3: Core Team ($20K-$50K MRR)

```
CEO / Founder
├── Engineering
│   ├── Founder (Tech Lead)
│   │   ├── Architecture decisions
│   │   ├── AI agent strategy
│   │   ├── Code review
│   │   └── Critical feature development
│   └── Full-Stack Developer (HIRE-003)
│       ├── Feature development
│       ├── Bug fixes and maintenance
│       ├── DevOps and CI/CD
│       └── Testing and quality
├── Customer Success
│   └── CS Associate (HIRE-001)
│       ├── Onboarding and support
│       ├── Retention and expansion
│       ├── Help center and documentation
│       └── NPS and feedback programs
├── Marketing
│   ├── Growth Specialist (HIRE-002, converting to FT)
│   │   ├── Paid acquisition
│   │   ├── SEO and analytics
│   │   ├── Growth experiments
│   │   └── Channel strategy
│   └── Content Creator / Community Mgr (HIRE-004)
│       ├── Blog and social content
│       ├── Video production
│       ├── Community management
│       └── Brand voice
├── Advisory Board (Informal)
│   ├── Technical Advisor (engineering/AI)
│   ├── Go-to-Market Advisor (SaaS sales/marketing)
│   └── Industry Advisor (creator economy/talent management)
└── Contractors
    ├── Legal Counsel (as needed)
    └── Bookkeeper / Accountant (ongoing, consider part-time CFO service)
```

**Headcount:** 5 full-time (Founder + 4 hires) + part-time contractors
**Monthly Payroll:** $22,000-$28,000 (4 salaries + contractor costs)

### Transition Triggers (Stage 2 to Stage 3)

| Trigger                    | Threshold                                                                  | Why It Matters                                                 |
| -------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| MRR                        | $20,000 sustained 30+ days                                                 | Revenue supports expanded team; payroll stays under 60% of MRR |
| Product velocity           | Feature requests backlog exceeding 3-month capacity for founder alone      | Second engineer unlocks parallel development streams           |
| Content/community demand   | Marketing producing results but constrained by Growth Specialist bandwidth | Dedicated content person doubles output capacity               |
| Product-market fit signals | NPS > 40, monthly churn < 6%, organic growth > 20% of new signups          | Signals justify investment in growth acceleration              |

### Key Challenges

| Challenge                 | Impact                                                                                                  | Mitigation                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engineering team dynamics | Founder must shift from solo developer to tech lead; code reviews, architecture discussions, mentorship | Establish clear engineering standards (PR process, testing requirements, deployment checklist); schedule weekly architecture syncs                            |
| Marketing coordination    | Two marketing people need alignment on strategy, brand voice, and priorities                            | Growth Specialist becomes de facto marketing lead; weekly marketing sync; shared content calendar and brand guidelines                                        |
| Advisory board management | Advisors require time investment but provide outsized value at this stage                               | Monthly 30-min calls with each advisor; quarterly advisory dinner/call; compensate with 0.1-0.25% equity each (2-year vest)                                   |
| Process overhead creep    | 5 people need more process than 2, but over-processing kills startup speed                              | Add process only when pain is felt; review and remove processes that do not earn their keep quarterly                                                         |
| Hiring while building     | Recruiting for HIRE-003 and HIRE-004 consumes significant founder time                                  | Time-box recruiting to 5 hours/week; use structured process (Deliverable 28) to be efficient; consider a recruiting coordinator at 10+ candidates in pipeline |

### Processes to Add

- [ ] Sprint planning (2-week cycles): engineering backlog grooming, prioritization, commitment
- [ ] Code review process: all PRs require 1 approval; founder reviews HIRE-003, HIRE-003 reviews founder
- [ ] Engineering on-call rotation (founder + HIRE-003, alternating weeks)
- [ ] Content editorial calendar (3-month rolling; updated monthly)
- [ ] Marketing metrics dashboard (weekly review: traffic, signups, CAC by channel, content performance)
- [ ] Customer health scoring (automated; reviewed weekly by CS)
- [ ] Monthly product roadmap review (founder + full team; prioritize based on customer feedback, business impact, and technical feasibility)
- [ ] Quarterly team retrospective (what went well, what to improve, action items)
- [ ] Formalize PTO tracking (even with flexible PTO, track actual days taken to prevent burnout)
- [ ] Begin documenting employee handbook (basic policies: PTO, expenses, communication norms, code of conduct)

### Culture Risks at This Stage

| Risk                                    | Signs                                                                                             | Response                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Us vs. Them (engineering vs. marketing) | Siloed communication; blame language ("they did not..."); competing priorities without resolution | Cross-functional pairing on projects; shared OKRs; founder models collaboration                                                             |
| Founder bottleneck                      | Every decision requires founder input; team waits rather than acts                                | Explicitly delegate decision authority: CS owns support escalation policy, Growth owns ad spend allocation, Content owns editorial calendar |
| Loss of urgency                         | More people can create a diffusion of responsibility                                              | Maintain weekly metrics review with clear ownership; celebrate velocity and shipping                                                        |
| Knowledge silos                         | Only one person knows how something works                                                         | Documentation culture: if it is not written down, it does not exist; pair programming; cross-training sessions                              |

---

## Stage 4: Scale Team ($50K-$200K MRR)

```
CEO / Founder
├── Engineering
│   ├── Founder (VP Engineering track)
│   │   ├── Technical strategy and architecture
│   │   ├── Engineering hiring and management
│   │   ├── AI strategy
│   │   └── Vendor and infrastructure decisions
│   ├── Senior Backend Engineer - AI/Data (HIRE-005)
│   │   ├── AI matching engine
│   │   ├── Data pipeline and analytics
│   │   ├── Backend architecture
│   │   └── Mentoring HIRE-003
│   ├── Full-Stack Developer (HIRE-003)
│   │   ├── Feature development
│   │   ├── Frontend architecture
│   │   ├── DevOps and CI/CD
│   │   └── On-call rotation
│   └── Product Designer (HIRE-007)
│       ├── Product design (all features)
│       ├── Design system
│       ├── User research
│       └── Marketing design support
├── Sales
│   └── Sales Lead (HIRE-006)
│       ├── Direct sales (Brand + Agency segments)
│       ├── Pipeline generation
│       ├── Sales operations and CRM
│       ├── Sales strategy and playbooks
│       └── Future: manage SDR and AE hires
├── Customer Success
│   └── CS Associate (HIRE-001, promoted to CS Lead)
│       ├── Team leadership (manage future CS hires)
│       ├── Strategic account management
│       ├── CS playbook and process ownership
│       ├── Churn analysis and retention strategy
│       └── Future: manage 1-2 CS reps
├── Marketing
│   ├── Growth Specialist (HIRE-002, promoted to Marketing Lead)
│   │   ├── Growth strategy and budget
│   │   ├── Paid acquisition management
│   │   ├── Analytics and reporting
│   │   └── Future: manage demand gen hires
│   └── Content Creator / Community Mgr (HIRE-004)
│       ├── Content production
│       ├── Community management
│       ├── Social media
│       └── Brand partnerships
├── Advisory Board (Formalizing)
│   ├── Technical Advisor
│   ├── GTM Advisor
│   ├── Industry Advisor
│   └── Finance / Fundraising Advisor
└── External Partners
    ├── Legal Counsel (ongoing retainer)
    ├── Accountant / Part-time CFO
    ├── Recruiting Coordinator (contract, as needed)
    └── PR / Communications (as needed)
```

**Headcount:** 8 full-time (Founder + 7 hires) + contractors/advisors
**Monthly Payroll:** $50,000-$65,000 (7 salaries at various levels)

### Transition Triggers (Stage 3 to Stage 4)

| Trigger                 | Threshold                                                                      | Why It Matters                                                                |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| MRR                     | $50,000 sustained 30+ days                                                     | Revenue supports senior hires and expanded benefits                           |
| AI/data complexity      | Matching quality plateauing; need dedicated AI expertise                       | Senior backend engineer unlocks next level of AI capability                   |
| Sales opportunity       | Self-serve acquisition plateauing; enterprise/agency leads require sales touch | Sales lead captures revenue that PLG alone cannot                             |
| Design debt             | UI inconsistencies, poor conversion rates, user complaints about UX            | Product designer systematizes the design process and improves user experience |
| Founder time allocation | Founder spending >50% on management/operations, <30% on product/strategy       | Promote early hires to leads; hire senior people who require less management  |

### Key Challenges

| Challenge                 | Impact                                                                                    | Mitigation                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder role transition   | Must shift from builder to leader; less coding, more strategy and people management       | Designate HIRE-005 as technical co-lead; block 1 day/week for strategic thinking; executive coach or peer group (YC alumni, Indie Hackers)                |
| First promotions          | HIRE-001 and HIRE-002 need growth paths; promoting too early or too late creates problems | Define clear promotion criteria (see competency matrix below); promote based on demonstrated performance, not tenure                                      |
| Multi-team coordination   | 4 functional areas need coordination without bureaucracy                                  | Weekly leadership sync (founder + leads, 30 min); shared OKRs with cross-functional dependencies called out; async-first for status, sync for decisions   |
| Compensation expectations | Early hires may see later hires earning more (closer to market rate)                      | Proactively discuss with early hires: their equity is significantly more valuable; consider equity refresh grants; ensure transparency in comp philosophy |
| Sales-engineering tension | Sales promising features; engineering prioritizing differently                            | Establish product review process: all feature requests go through founder (product owner); quarterly roadmap commits; sales input valued but not binding  |

### Promotions at This Stage

| Employee | From                         | To                  | Criteria                                                                                                                         | New Compensation                                                          |
| -------- | ---------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| HIRE-001 | CS Associate                 | CS Lead             | Demonstrated ownership of CS function; built playbooks; reduced churn by measurable amount; ready to manage direct reports       | Salary increase to $65,000-$78,000; equity refresh grant of 0.25-0.5%     |
| HIRE-002 | Growth Specialist (Contract) | Marketing Lead (FT) | Demonstrated ROI on growth spend; built repeatable acquisition channels; ready to own marketing strategy and manage content hire | Salary $80,000-$95,000; initial equity grant of 0.5-1.0% (first FT grant) |

### Processes to Add

- [ ] Leadership team weekly sync (Founder + Leads from CS, Marketing, Sales, Engineering): 30 min, focused on cross-functional decisions and blockers
- [ ] Formal sprint ceremonies: sprint planning, daily standups (engineering), sprint review, retrospective
- [ ] Product roadmap process: quarterly planning with input from all functions; monthly review and adjustment
- [ ] Sales and CS handoff process: defined handoff criteria, shared CRM data, joint account reviews
- [ ] Performance review cycle: semi-annual reviews with 360 feedback (peer, manager, self); aligned with comp review
- [ ] Employee handbook v1 (formal): policies on PTO, expenses, equipment, code of conduct, anti-harassment, data handling, intellectual property
- [ ] Budget process: monthly budget review by function; quarterly budget planning
- [ ] Formal incident management: severity levels, response procedures, post-mortem requirements, SLAs
- [ ] Security review process: quarterly security audit of access controls, data handling, vendor security

### Benefits Upgrade at This Stage

As headcount reaches 8 and MRR supports it, begin transitioning from Phase 1 to Phase 2 benefits:

- [ ] Research and select health insurance option (ICHRA or group plan); target implementation within 60 days of HIRE-007 start date
- [ ] Increase equipment stipend to $2,000-$2,500/year for all roles
- [ ] Establish annual team retreat (budget $2,500-$3,500 per person)
- [ ] Add mental health benefit (therapy platform subscription)
- [ ] Increase learning budget to $2,000-$3,000/year

---

## Stage 5: Growth Team ($200K+ MRR, 15-30 People)

```
CEO / Founder
│
├── VP Engineering (Founder or External Hire)
│   ├── Engineering Manager
│   │   ├── Senior Backend Engineer - AI/Data (HIRE-005)
│   │   ├── Full-Stack Developer (HIRE-003)
│   │   ├── Backend Developer (New Hire)
│   │   └── Frontend Developer (New Hire)
│   ├── Product Designer (HIRE-007, promoted to Senior/Lead)
│   │   └── Junior Product Designer (New Hire)
│   ├── QA / Test Engineer (New Hire)
│   └── DevOps / SRE (New Hire, or outsourced)
│
├── VP Sales (HIRE-006, promoted, or External Hire)
│   ├── Account Executive (New Hire)
│   ├── Account Executive (New Hire)
│   ├── SDR (New Hire)
│   └── Sales Operations (Part-time or shared with RevOps)
│
├── Head of Customer Success (HIRE-001, promoted)
│   ├── CS Manager (if team > 4)
│   ├── CS Representative (New Hire)
│   ├── CS Representative (New Hire)
│   └── Customer Onboarding Specialist (New Hire)
│
├── Head of Marketing (HIRE-002, promoted)
│   ├── Content Creator / Community Mgr (HIRE-004)
│   ├── Demand Generation Manager (New Hire)
│   ├── Product Marketing Manager (New Hire)
│   └── Marketing Operations (Part-time or shared with RevOps)
│
├── Head of Operations / COO (New Hire or External, when team > 20)
│   ├── People Operations (New Hire, first HR person at 15-20 headcount)
│   ├── Finance Manager (upgraded from part-time accountant)
│   └── Legal (outside counsel on retainer; bring in-house at 25+)
│
├── Product (Founder retains or hires VP Product)
│   └── Product Manager (New Hire, when team > 15)
│
└── Board of Directors (Formalized at seed/Series A)
    ├── Founder (CEO)
    ├── Investor Director(s)
    └── Independent Director(s)
```

**Headcount:** 15-30 full-time
**Monthly Payroll:** $150,000-$350,000

### Transition Triggers (Stage 4 to Stage 5)

| Trigger                | Threshold                                                                      | Why It Matters                                                             |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| MRR                    | $200,000 sustained 60+ days                                                    | Revenue supports significant team expansion and Phase 3 benefits           |
| Sales pipeline         | Qualified pipeline exceeding capacity of 1 sales lead                          | Need additional AEs and SDR support                                        |
| Support volume         | Ticket volume exceeding capacity of 1 CS person                                | Need additional CS reps to maintain SLA                                    |
| Engineering velocity   | Roadmap backlog exceeding 6-month capacity of current team                     | Need additional engineers to maintain competitive pace                     |
| Operational complexity | Finance, legal, HR, and operations consuming >10 hours/week of leadership time | Need dedicated operations function                                         |
| Fundraising            | Seed or Series A round closed (or imminent)                                    | Investors expect a growth plan; hired team demonstrates execution capacity |

### Key Challenges

| Challenge                     | Impact                                                                                                                   | Mitigation                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder to CEO transition     | Founder must fully shift from individual contributor to executive; this is the hardest transition for technical founders | Executive coaching (budget $500-$1,000/month); CEO peer group; delegate technical leadership to VP Engineering; protect 10% time for staying close to product                                  |
| Middle management layer       | First time having managers who manage managers; communication chain lengthens                                            | Skip-level 1:1s (founder meets with ICs monthly); all-hands frequency increases to bi-weekly; leadership team becomes the coordination mechanism                                               |
| Culture preservation at scale | Original culture dilutes with every new hire; remote makes it harder                                                     | Document culture explicitly (values, norms, stories); culture interviews in hiring process; quarterly culture surveys; founders model values visibly                                           |
| Process formalization         | What worked for 8 people breaks at 20; need formal processes without bureaucracy                                         | Hire Head of Operations / People Ops to own process design; quarterly process audits (keep, improve, or kill); fight for simplicity                                                            |
| Compensation complexity       | Multiple levels, functions, and vintages of equity; comp becomes a full-time problem                                     | Hire People Ops to own comp administration; formalize comp review cadence (Deliverable 29); use compensation management tools (Pave, Carta Total Comp)                                         |
| Retention of early employees  | HIRE-001 through HIRE-004 may feel lost in a bigger company or undervalued relative to senior hires                      | Proactive career pathing; equity refresh grants; promotions to leadership roles; transparent communication about company trajectory; founders maintain personal relationships with early hires |

### Processes to Add

- [ ] Formal performance review cycle (semi-annual or annual, with calibration across teams)
- [ ] Compensation benchmarking (annual market data refresh; Pave or Carta benchmarking)
- [ ] Employee handbook v2 (comprehensive): includes anti-harassment, whistleblower, data privacy, remote work, expense, travel, and equity policies
- [ ] Formal onboarding program (managed by People Ops; 2-week structured program for all new hires)
- [ ] Manager training program (all new managers complete training on feedback, 1:1s, performance management, and employment law basics)
- [ ] Revenue operations (RevOps): unified metrics, pipeline, and forecasting across Sales, CS, and Marketing
- [ ] Board meeting cadence (monthly or quarterly, depending on investor requirements)
- [ ] Financial planning: annual budget, quarterly forecast, cash flow management
- [ ] Security and compliance program: SOC 2 preparation, data handling policies, access reviews
- [ ] Succession planning: identify backup for every critical role

### Key Hires at Stage 5

| Priority | Role                      | Trigger                                                      | Estimated Compensation         |
| -------- | ------------------------- | ------------------------------------------------------------ | ------------------------------ |
| 1        | Account Executive (x2)    | Sales pipeline exceeds HIRE-006 capacity                     | $65K base + $40K variable each |
| 2        | CS Representative (x2)    | Ticket volume exceeds HIRE-001 capacity                      | $48K-$58K each                 |
| 3        | Backend Developer         | Engineering roadmap backlog > 6 months                       | $100K-$130K                    |
| 4        | Frontend Developer        | Feature development bottleneck on frontend                   | $95K-$125K                     |
| 5        | SDR                       | Need to feed AE pipeline with outbound leads                 | $40K base + $20K variable      |
| 6        | People Operations Manager | Team > 15; compliance and admin burden                       | $75K-$95K                      |
| 7        | Product Manager           | Product complexity requires dedicated PM                     | $110K-$140K                    |
| 8        | Demand Generation Manager | Need to scale paid acquisition beyond HIRE-002 capacity      | $80K-$100K                     |
| 9        | Product Marketing Manager | Need positioning, competitive intelligence, sales enablement | $90K-$115K                     |
| 10       | Junior Product Designer   | Design workload exceeds HIRE-007 capacity                    | $65K-$85K                      |

---

## Org Evolution Summary Table

| Stage     | Headcount       | MRR Range  | Monthly Payroll   | Key Hire(s)                       | Biggest Challenge                              |
| --------- | --------------- | ---------- | ----------------- | --------------------------------- | ---------------------------------------------- |
| 1: Solo   | 1 + contractors | $0-$5K     | $1,500-$3,000     | None (contractors)                | Founder burnout; doing everything              |
| 2: Micro  | 2-3             | $5K-$20K   | $8,500-$12,000    | CS Associate, Growth Marketer     | First management; culture definition           |
| 3: Core   | 4-5             | $20K-$50K  | $22,000-$28,000   | Full-Stack Dev, Content/Community | Multi-team coordination; engineering standards |
| 4: Scale  | 6-8             | $50K-$200K | $50,000-$65,000   | Sr. Backend, Sales Lead, Designer | Founder to leader transition; first promotions |
| 5: Growth | 15-30           | $200K+     | $150,000-$350,000 | AEs, CS Reps, Eng, PM, PeopleOps  | Culture at scale; middle management; process   |

---

## Competency Matrix for Promotions

This matrix defines what is expected at each level to support fair, transparent promotion decisions.

### Individual Contributor Levels

| Dimension         | IC-1 (Junior)                                 | IC-2 (Mid)                                                        | IC-3 (Senior)                                                        | IC-4 (Staff/Lead)                                                         |
| ----------------- | --------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Scope**         | Completes well-defined tasks with guidance    | Owns features or projects end-to-end with moderate autonomy       | Owns significant systems or functions; influences team direction     | Owns cross-functional initiatives; influences company strategy            |
| **Complexity**    | Straightforward problems with known solutions | Moderate ambiguity; can break down problems and propose solutions | High ambiguity; defines the problem as well as the solution          | Navigates organizational complexity; solves problems that span teams      |
| **Impact**        | Contributes to team deliverables              | Directly impacts team metrics                                     | Directly impacts department or company metrics                       | Creates leverage that multiplies team output                              |
| **Independence**  | Needs regular check-ins and guidance          | Works independently; asks for help when stuck                     | Self-directed; proactively identifies and addresses issues           | Sets direction for others; creates frameworks and standards               |
| **Communication** | Communicates status and asks clear questions  | Writes clear documentation; presents to team                      | Influences technical decisions through persuasive communication      | Communicates strategy to diverse audiences; represents company externally |
| **Mentorship**    | Learns from others                            | Helps onboard new team members                                    | Mentors junior team members; conducts meaningful code/design reviews | Raises the bar for the entire team; develops other senior contributors    |

### Management Levels

| Dimension           | M-1 (Team Lead / Manager)                                            | M-2 (Director / Head of)                                                  | M-3 (VP)                                                                           |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Scope**           | Manages 3-7 direct reports in one function                           | Manages managers or owns an entire function                               | Owns a business area spanning multiple functions                                   |
| **People**          | Conducts effective 1:1s, gives regular feedback, manages performance | Builds and develops a team of leads; shapes function culture              | Attracts and retains executive-level talent; builds organizational capability      |
| **Strategy**        | Executes on department strategy; contributes ideas                   | Defines department strategy aligned to company goals                      | Defines company strategy within their domain; influences overall company direction |
| **Decision-making** | Makes tactical decisions within their team                           | Makes strategic decisions for their function                              | Makes cross-functional decisions with company-wide impact                          |
| **Communication**   | Keeps team informed and aligned; escalates effectively               | Represents function in leadership team; communicates up, down, and across | Represents company externally; communicates vision and strategy                    |

---

## Implementation Checklist

| Step                                                                            | Owner           | Timeline                     | Status      |
| ------------------------------------------------------------------------------- | --------------- | ---------------------------- | ----------- |
| Finalize and adopt compensation philosophy (Deliverable 29)                     | Founder         | Before first hire            | Not started |
| Engage startup legal counsel for equity plan and 409A valuation                 | Founder         | Before first hire            | Not started |
| Set up recruiting tracker (Notion or Google Sheet, per Deliverable 30 template) | Founder         | Before first job posting     | Not started |
| Draft and post HIRE-001 (CS Associate) job description                          | Founder         | At $5K MRR trigger           | Not started |
| Establish core values and document in team wiki                                 | Founder         | Before first hire            | Not started |
| Set up Intercom (or equivalent) for customer support                            | Founder         | Before first hire            | Not started |
| Create employee handbook v0 (basic policies)                                    | Founder         | Before first hire            | Not started |
| Research state-specific employment law requirements for first hire's state      | Founder + Legal | Before extending first offer | Not started |
| Set up payroll (Gusto, Rippling, or similar)                                    | Founder         | Before first hire start date | Not started |
| Establish advisory board (2-3 informal advisors)                                | Founder         | During Stage 2               | Not started |

---

## Communication Draft

**For announcing the first hire (internal/external):**

Subject: DealStage is growing -- introducing our first team member

---

Today marks a milestone for DealStage: we are no longer a solo operation.

I am thrilled to welcome [Name] as our first Customer Success Associate. [Name] joins us from [Previous Company] where they [brief relevant accomplishment]. They will own the end-to-end customer experience -- from onboarding through renewal -- ensuring every DealStage user gets maximum value from the platform.

Why Customer Success first? Because our users are the reason we exist. As we grow, our commitment is that every brand, talent, agency, and manager on DealStage has a real person invested in their success. [Name] is that person.

We are also actively looking for a Growth Marketing Specialist (contract) to accelerate our user acquisition. If you know someone exceptional, reply to this post or send them to thedealstage.com/careers.

This is just the beginning. More roles are coming as we hit our next milestones. If you are interested in joining an AI-first startup building the future of brand-talent partnerships, follow along.

-- [Founder Name], CEO and Founder, DealStage

---

## Metrics to Track

| Metric                  | Definition                                                | Target                                                        | Frequency |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------- | --------- |
| Time-to-Fill            | Days from role opening to accepted offer                  | 30-45 days by role type                                       | Per hire  |
| Payroll-to-MRR Ratio    | Total monthly payroll / MRR                               | Below 60% at all times                                        | Monthly   |
| Revenue per Employee    | MRR / headcount                                           | Increasing quarter-over-quarter                               | Quarterly |
| Regrettable Turnover    | Voluntary departures of high performers / total headcount | Below 10% annually                                            | Quarterly |
| Employee NPS            | Anonymous pulse survey (1-10 recommendation score)        | 50+ (promoters minus detractors)                              | Quarterly |
| Offer Acceptance Rate   | Accepted offers / total offers extended                   | 80%+                                                          | Per hire  |
| 90-Day Retention        | New hires still employed at 90-day mark                   | 100% (any 90-day departure is a hiring failure at this stage) | Per hire  |
| Onboarding Satisfaction | New hire survey at Day 30                                 | 8+ out of 10                                                  | Per hire  |

---

_This document provides general HR information and templates. It does not constitute legal advice. Consult qualified legal counsel in your jurisdiction before implementing policies, extending offers, granting equity, or taking any employment action with legal implications. This is especially important for equity grants (409A compliance), at-will employment provisions (state-specific variations), benefits compliance (ACA, ERISA, state mandates), and pay transparency requirements._

---

**End of Batch 8 -- Deliverables 28, 29, 30, 31**
