# DealStage — New Features Testing Checklist

## Tests for all features built in March-April 2026 sessions

---

## PHASE 12: TIER RESTRUCTURE & ACCESS CONTROL

| #      | What to Test                                        | Expected Result                                                                                                                 | Status |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 12.1.1 | Log in as admin (getreachmediallc@gmail.com)        | Shows "ADMIN PORTAL" in sidebar, no trial banner                                                                                |        |
| 12.1.2 | Check admin nav has all pages (50+ items)           | All sections visible: Admin, Home, Discovery, Campaigns, Deals, Intelligence, Content, Reports, AI, Calendar, Platform, Account |        |
| 12.1.3 | Open incognito, sign up as new talent user          | 7-day reverse trial active, shows trial banner with days remaining                                                              |        |
| 12.1.4 | As free user, try to access Deal Pipeline           | Shows locked/upgrade prompt (Tier 1 feature)                                                                                    |        |
| 12.1.5 | As free user, access AI Command Center              | Shows "5 queries remaining" badge                                                                                               |        |
| 12.1.6 | As free user, access Marketplace                    | Can browse but "Apply Now" shows "Upgrade to Apply"                                                                             |        |
| 12.1.7 | As free user, try to create 4th opportunity         | Shows "Free plan limit reached" banner, submit disabled                                                                         |        |
| 12.1.8 | Check that all roles see same features at same tier | Brand, Talent, Agency, Manager all have same access per tier (role parity)                                                      |        |

## PHASE 13: AI METERING & LIMITS

| #      | What to Test                                     | Expected Result                                     | Status |
| ------ | ------------------------------------------------ | --------------------------------------------------- | ------ |
| 13.1.1 | As free user, make an AI query in Command Center | Counter shows "1/5 queries remaining"               |        |
| 13.1.2 | Make 5 AI queries as free user                   | After 5th, shows "AI query limit reached — Upgrade" |        |
| 13.1.3 | Try AI query after hitting limit                 | Shows upgrade prompt, query blocked                 |        |
| 13.1.4 | Check AI limit in Match Engine                   | Same limit applies, shows upgrade message           |        |
| 13.1.5 | Check AI limit in Pitch Deck Builder             | Same limit applies                                  |        |
| 13.1.6 | As admin, verify unlimited AI queries            | No counter shown, no limit                          |        |

## PHASE 14: STRIPE & PAYMENTS

| #      | What to Test                                           | Expected Result                                                | Status |
| ------ | ------------------------------------------------------ | -------------------------------------------------------------- | ------ |
| 14.1.1 | Go to Subscription Management page                     | Shows pricing cards for your role with correct prices          |        |
| 14.1.2 | Click upgrade on any paid plan                         | Redirects to Stripe Checkout with correct price                |        |
| 14.1.3 | Complete test payment (use test card 4242424242424242) | Returns to app, plan updated in profile                        |        |
| 14.1.4 | After payment, check feature access                    | Tier 1 features now unlocked                                   |        |
| 14.1.5 | Check Stripe webhook updates profiles.plan             | Profile plan column matches purchased tier                     |        |
| 14.1.6 | Visit public Pricing page (/pricing)                   | Shows all 4 roles, 4 tiers each, correct prices, annual toggle |        |

## PHASE 15: BRAND DATABASE & CONTACTS

| #       | What to Test                                              | Expected Result                                           | Status |
| ------- | --------------------------------------------------------- | --------------------------------------------------------- | ------ |
| 15.1.1  | Admin Data Manager → Brands tab                           | Shows 1,200 brands with industry, website, size, location |        |
| 15.1.2  | Brands tab → search "Nike"                                | Finds Nike with correct data                              |        |
| 15.1.3  | Brands tab → talent type dropdown                         | Shows 140+ talent types, searchable                       |        |
| 15.1.4  | Select "Basketball (NBA)" in dropdown                     | Shows only sports/athletic brands (Nike, Adidas, etc.)    |        |
| 15.1.5  | Admin Data Manager → Contacts tab                         | Shows 44,000+ contacts with pagination                    |        |
| 15.1.6  | Contacts tab → search by brand name                       | Filters contacts for that brand                           |        |
| 15.1.7  | Verify contacts have: name, title, email, phone, LinkedIn | All fields populated from GMO data                        |        |
| 15.1.8  | Contacts pagination works                                 | Previous/Next shows correct count                         |        |
| 15.1.9  | Click Populate All Brands button                          | Processes brands in batches, shows progress               |        |
| 15.1.10 | Click Populate Contacts button                            | Processes contacts in batches, shows progress             |        |

## PHASE 16: CONTACT FINDER & GMO INTEGRATION

| #      | What to Test                        | Expected Result                                      | Status |
| ------ | ----------------------------------- | ---------------------------------------------------- | ------ |
| 16.1.1 | Go to Contact Finder, search "Nike" | Shows decision-makers at Nike with titles and emails |        |
| 16.1.2 | Click "Verify Email" on a contact   | GMO verifies email, updates confidence to 85%        |        |
| 16.1.3 | Click "Enrich Brand" button         | GMO enriches brand data                              |        |
| 16.1.4 | Click "Outreach" on a contact       | Creates draft outreach email                         |        |
| 16.1.5 | Brand Signals show above contacts   | Shows buying intent signals for the searched brand   |        |

## PHASE 17: VERIFICATION & ENRICHMENT

| #      | What to Test                           | Expected Result                                | Status |
| ------ | -------------------------------------- | ---------------------------------------------- | ------ |
| 17.1.1 | Go to Connect Accounts                 | CreatorEnrichment component visible            |        |
| 17.1.2 | Go to Settings as brand user           | BrandEnrichment component visible              |        |
| 17.1.3 | Go to Deal Detail page                 | DealVerification component visible             |        |
| 17.1.4 | Check 92 platforms in platform library | All platforms listed with icons and categories |        |

## PHASE 18: AI FEATURES (DUAL MODEL)

| #      | What to Test                                                   | Expected Result                                          | Status |
| ------ | -------------------------------------------------------------- | -------------------------------------------------------- | ------ |
| 18.1.1 | AI Command Center — ask "show me fashion brands"               | Returns AI-generated response with brand recommendations |        |
| 18.1.2 | AI Command Center — ask "which brands work with NBA athletes?" | Returns relevant sports brands                           |        |
| 18.1.3 | Match Engine — run a match                                     | Returns talent-brand suggestions                         |        |
| 18.1.4 | Outreach — generate AI email                                   | Generates personalized outreach email                    |        |
| 18.1.5 | Pitch Deck Builder — generate a slide                          | Creates pitch deck content                               |        |
| 18.1.6 | Campaign Brief Generator — generate brief                      | Creates campaign brief                                   |        |
| 18.1.7 | Contract Templates — AI auto-fill                              | Fills contract with AI suggestions                       |        |

## PHASE 19: PUBLIC PAGES & SEO

| #      | What to Test               | Expected Result                                       | Status |
| ------ | -------------------------- | ----------------------------------------------------- | ------ |
| 19.1.1 | Visit /pricing             | Loads with 4 role tabs, correct prices, annual toggle |        |
| 19.1.2 | Visit /FeatureDealPipeline | Page loads (not 404) — PascalCase route works         |        |
| 19.1.3 | Visit /CompareGrin         | Page loads (not 404)                                  |        |
| 19.1.4 | Visit /ForManagers         | Page loads (not 404)                                  |        |
| 19.1.5 | Visit /Login               | Page loads (not 404)                                  |        |
| 19.1.6 | Check /sitemap.xml         | Returns valid XML with 29 pages                       |        |
| 19.1.7 | Check /robots.txt          | Returns valid robots.txt with disallow rules          |        |

## PHASE 20: REVERSE TRIAL & TRIAL EMAILS

| #      | What to Test                                                                     | Expected Result                                                                            | Status |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| 20.1.1 | Sign up as new user                                                              | Gets 7-day Tier 1 trial                                                                    |        |
| 20.1.2 | During trial, access Deal Pipeline                                               | Works (Tier 1 feature unlocked during trial)                                               |        |
| 20.1.3 | During trial, check AI queries                                                   | Gets 50 queries (Tier 1 allowance)                                                         |        |
| 20.1.4 | Trial banner shows "X days left to try pipeline, outreach, and AI features free" | Correct copy                                                                               |        |
| 20.1.5 | After trial expires                                                              | Shows "Your 7-day trial ended. Upgrade to keep your pipeline, outreach, and match engine." |        |
| 20.1.6 | Admin never sees trial banner                                                    | Verified — no trial banner for admin                                                       |        |

## PHASE 21: INDUSTRY EVENTS & BRAND INTELLIGENCE

| #      | What to Test                     | Expected Result                       | Status |
| ------ | -------------------------------- | ------------------------------------- | ------ |
| 21.1.1 | Navigate to Industry Events page | Events calendar loads with filters    |        |
| 21.1.2 | Filter events by industry        | Shows relevant events only            |        |
| 21.1.3 | Check brand sponsors on events   | Shows which brands sponsor each event |        |
| 21.1.4 | Admin → Populate Events button   | Generates events and maps sponsors    |        |
| 21.1.5 | Admin → Populate Intel button    | Generates brand intelligence data     |        |

## PHASE 22: TALENT TYPE SYSTEM

| #      | What to Test                                     | Expected Result                                  | Status |
| ------ | ------------------------------------------------ | ------------------------------------------------ | ------ |
| 22.1.1 | Onboarding — talent type selection               | Shows 140+ types grouped by category in dropdown |        |
| 22.1.2 | Create Opportunity — talent type checkboxes      | Shows grouped checkboxes for all 140+ types      |        |
| 22.1.3 | Talent Filters — niche filter                    | Shows all talent types grouped by category       |        |
| 22.1.4 | Marketplace Filters — niche filter               | Shows all talent types grouped by category       |        |
| 22.1.5 | Admin brands → talent type dropdown              | Searchable, shows all 140+ types                 |        |
| 22.1.6 | Select any talent type — brands filter correctly | Only relevant brands shown                       |        |
| 22.1.7 | No talent type has 0 brands                      | Every type maps to at least some brands          |        |

---

**Total new test cases: 75**
**Combined with existing 349: 424 total tests**
