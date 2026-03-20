# App 100% Working — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get the DealStage app fully functional — every flow from signup to deal completion working end-to-end with real data.

**Architecture:** React (Vite) frontend + Supabase backend (PostgreSQL + Edge Functions + Auth) + Vercel hosting + Stripe payments + 4 AI providers via Universal Router.

**Tech Stack:** React 18, Vite 6, Supabase JS v2, Stripe Connect, Anthropic/DeepSeek/Gemini/Groq AI providers.

**Current State:**

- Build: ✅ Clean
- Login API: ✅ Working
- Live site: ✅ HTTP 200
- AI: 3/4 providers working (Gemini needs API enabled)
- Database: 3 profiles, 8 talents, 5 brands, 8 deals, 486 events
- Code bugs: 0 known
- Open issues: 4 (Gemini, social OAuth simulated, Vercel trial, platform catalog needs seed script)

---

## Phase 1: Critical Infrastructure (Do First)

### Task 1: Secure Vercel Hosting

**Files:** None — Vercel dashboard action

- [ ] **Step 1:** Log into Vercel dashboard at vercel.com
- [ ] **Step 2:** Go to Settings → Billing → Add payment method
- [ ] **Step 3:** Select Pro plan ($20/mo) or keep Hobby (free with limits)
- [ ] **Step 4:** Verify site is still live at www.thedealstage.com
- [ ] **Step 5:** Confirm auto-deploy is working by checking latest deployment status

**Why first:** Trial expires in ~12 days. If this lapses, the entire site goes offline.

---

### Task 2: Enable Gemini API

**Files:** None — Google Cloud Console action

- [ ] **Step 1:** Go to console.cloud.google.com
- [ ] **Step 2:** Select the project associated with your Gemini API key
- [ ] **Step 3:** Go to APIs & Services → Enable APIs
- [ ] **Step 4:** Search "Generative AI" or "Gemini API"
- [ ] **Step 5:** Click Enable
- [ ] **Step 6:** Verify by running the AI router diagnose:

```bash
curl -s -X POST "https://eiygbtpsfumwvhzbudij.supabase.co/functions/v1/ai-router?action=diagnose" \
  -H "apikey: YOUR_ANON_KEY" -H "Content-Type: application/json"
```

Expected: gemini status = "WORKING"

**Why:** 3 FREE tier AI agents (agent_performance, content_localizer, data_extractor) are currently non-functional.

---

## Phase 2: Auth & Signup Flow

### Task 3: Test Complete Signup Flow (All 4 Roles)

**Files:**

- Test: `src/pages/Onboarding.jsx`
- Test: `src/pages/Login.jsx`
- Test: `src/pages/CheckEmail.jsx`

- [ ] **Step 1: Test Talent signup**
  - Go to thedealstage.com
  - Click "Start free trial"
  - Select "Talent" role
  - Verify plan selection page appears (Free/Rising/Pro/Elite)
  - Select "Free" plan
  - Fill in name, email (use a test email), password
  - Click "Get Started Free"
  - Verify redirect to /check-email OR /Dashboard
  - If /check-email: verify email, then sign in
  - Verify Dashboard loads with Talent sidebar (31 pages)

- [ ] **Step 2: Test Brand signup**
  - Same flow but select "Brand" role
  - Verify plan selection shows Brand plans (Explorer/Growth/Scale/Enterprise)
  - Verify Dashboard loads with Brand sidebar (38 pages)

- [ ] **Step 3: Test Agency signup**
  - Select "Agency" role
  - Verify plan selection shows Agency plans (Starter/Pro/Enterprise)
  - Verify Dashboard loads with Agency sidebar (37 pages)

- [ ] **Step 4: Test Manager signup**
  - Select "Manager" role
  - Verify NO plan selection (skips to account creation)
  - Verify Dashboard loads with Manager sidebar (same as Talent)
  - Verify Manager Setup page is accessible

- [ ] **Step 5: Test Google OAuth login**
  - Go to /login
  - Click "Continue with Google"
  - Verify Google login popup appears
  - Complete Google login
  - Verify redirect to /Dashboard

- [ ] **Step 6: Test Forgot Password**
  - Go to /login → click "Forgot password?"
  - Enter email → click "Send Reset Link"
  - Verify success message appears
  - Check email for reset link
  - Verify reset link goes to thedealstage.com (not localhost)

- [ ] **Step 7: Test Login with email/password**
  - Go to /login
  - Enter valid credentials
  - Verify successful login → Dashboard

- [ ] **Step 8: Document any issues found**

---

## Phase 3: Seed Real Data

### Task 4: Add Sample Brands via Admin Data Manager

**Files:**

- Use: `src/pages/AdminDataManager.jsx` (already built)

- [ ] **Step 1:** Log in as admin (getreachmediallc@gmail.com)
- [ ] **Step 2:** Go to Data Manager in sidebar
- [ ] **Step 3:** Click "Brands" tab
- [ ] **Step 4:** Add 20 real brands manually or via CSV import:

Sample brands to add:

```
Nike, nike.com, Sports/Apparel, 10000+, Portland OR, $50M+ budget
Spotify, spotify.com, Music/Streaming, 10000+, Stockholm, $20M+ budget
Sephora, sephora.com, Beauty & Cosmetics, 10000+, San Francisco, $15M+ budget
Red Bull, redbull.com, Food & Beverage, 10000+, Salzburg, $30M+ budget
Netflix, netflix.com, Entertainment, 10000+, Los Gatos CA, $25M+ budget
Adidas, adidas.com, Sports/Apparel, 10000+, Herzogenaurach, $40M+ budget
Amazon, amazon.com, Retail, 10000+, Seattle, $100M+ budget
Apple, apple.com, Technology, 10000+, Cupertino, $50M+ budget
Chipotle, chipotle.com, Food & Beverage, 10000+, Newport Beach, $10M+ budget
Target, target.com, Retail, 10000+, Minneapolis, $20M+ budget
Samsung, samsung.com, Technology, 10000+, Seoul, $30M+ budget
L'Oreal, loreal.com, Beauty & Cosmetics, 10000+, Paris, $25M+ budget
Coca-Cola, coca-cola.com, Food & Beverage, 10000+, Atlanta, $40M+ budget
Lululemon, lululemon.com, Health & Wellness, 10000+, Vancouver, $15M+ budget
Gymshark, gymshark.com, Health & Wellness, 1000+, Solihull UK, $5M+ budget
HelloFresh, hellofresh.com, Food & Beverage, 10000+, Berlin, $10M+ budget
Calm, calm.com, Health & Wellness, 500+, San Francisco, $5M+ budget
Athletic Greens, athleticgreens.com, Health & Wellness, 100+, Carson City, $3M+ budget
Huel, huel.com, Health & Wellness, 500+, Tring UK, $3M+ budget
Notion, notion.so, Technology, 500+, San Francisco, $2M+ budget
```

- [ ] **Step 5:** Verify brands appear in the Brands page for all user roles

---

### Task 5: Add Sample Contacts/Decision Makers

**Files:**

- Use: `src/pages/AdminDataManager.jsx`

- [ ] **Step 1:** Go to Data Manager → "Contacts" tab
- [ ] **Step 2:** Add 20 sample decision makers (can be fictional for now):

```
Sarah Chen, Influencer Marketing Manager, Nike, sarah.chen@nike.com, Tier 1
James Park, Head of Creator Partnerships, Spotify, james.park@spotify.com, Tier 1
Maria Santos, Director Influencer Marketing, Sephora, maria.santos@sephora.com, Tier 1
Alex Rivera, Director Brand Partnerships, Red Bull, alex.rivera@redbull.com, Tier 1
David Kim, VP Marketing Partnerships, Netflix, david.kim@netflix.com, Tier 1
Lisa Wang, VP Brand Partnerships, Adidas, lisa.wang@adidas.com, Tier 2
Rachel Green, Head of Influencer Program, Amazon, rachel.green@amazon.com, Tier 1
Tom Wilson, Head of Brand Marketing, Apple, tom.wilson@apple.com, Tier 2
Maya Johnson, Director Digital Marketing, Chipotle, maya.johnson@chipotle.com, Tier 2
Kevin O'Brien, Director Creator Partnerships, Target, kevin.obrien@target.com, Tier 2
```

- [ ] **Step 3:** Verify contacts appear in Contact Finder page

---

### Task 6: Add Sample Talent Profiles

**Files:**

- Use: `src/pages/AdminDataManager.jsx` or direct Supabase

- [ ] **Step 1:** Create 10 diverse talent profiles via admin:

```
Jordan Reeves, Fitness/Athlete, 180K IG, 6.8% engagement
Mia Chen, Tech/YouTube Creator, 500K YT, 4.2% engagement
Zara Ali, Fashion Model, 120K IG, 5.1% engagement
Marcus Cole, Finance Podcaster, 80K podcast listeners
Priya Sharma, Food/Instagram, 4.2M IG, 3.8% engagement
Darius Coleman, Basketball Athlete, 50K IG, 8.2% engagement
Jade Mercer, Musician, 100K Spotify monthly listeners
Trevor Okafor, Comedy/TikTok, 250K TikTok, 7.5% engagement
Maya Thornton, Beauty/YouTube, 120K YT, 4.8% engagement
Sam Reyes, Travel Creator, 90K IG, 5.5% engagement
```

- [ ] **Step 2:** Verify talent profiles appear in Talent Discovery page
- [ ] **Step 3:** Verify talent profiles appear in Marketplace

---

## Phase 4: Test Core Features

### Task 7: Test AI Features (All 5 Fixed Pages)

**Files:**

- Test: `src/pages/MatchEngine.jsx`
- Test: `src/pages/PitchDeckBuilder.jsx`
- Test: `src/pages/CampaignBriefGenerator.jsx`
- Test: `src/pages/Outreach.jsx`
- Test: `src/pages/SequenceBuilder.jsx`
- Test: `src/pages/ContractTemplates.jsx`
- Test: `src/pages/AICommandCenter.jsx`

- [ ] **Step 1: Test Match Engine**
  - Go to Match Engine
  - Select a brand and talent
  - Click "Run Match"
  - Verify AI returns match scores (should use DeepSeek or Anthropic)
  - Verify 10-factor scoring appears

- [ ] **Step 2: Test Pitch Deck Builder**
  - Go to Pitch Deck Builder
  - Select a talent profile
  - Click generate
  - Verify AI generates deck content

- [ ] **Step 3: Test Campaign Brief Generator**
  - Go to Campaign Briefs
  - Fill in brief details
  - Click generate
  - Verify AI creates brief

- [ ] **Step 4: Test Outreach AI**
  - Go to Outreach
  - Select a contact
  - Click AI generate
  - Verify AI creates outreach message

- [ ] **Step 5: Test Sequence Builder AI**
  - Go to Sequences
  - Create a new sequence
  - Click AI generate step
  - Verify AI creates sequence step

- [ ] **Step 6: Test Contract Templates AI**
  - Go to Contract Templates
  - Select a template
  - Click "AI Suggest"
  - Verify AI fills in suggested values

- [ ] **Step 7: Test AI Command Center**
  - Go to AI Command Center
  - Type: "Find the best fitness creators for a Nike campaign"
  - Verify AI returns a meaningful response
  - Verify response parsing works (no "Unexpected response" error)

- [ ] **Step 8: Document any AI failures**

---

### Task 8: Test Deal Pipeline End-to-End

**Files:**

- Test: `src/pages/Partnerships.jsx`
- Test: `src/pages/DealDetail.jsx`

- [ ] **Step 1:** Go to Deal Pipeline
- [ ] **Step 2:** Click "+ New Deal"
- [ ] **Step 3:** Create a deal: "Nike × Jordan Reeves, $85K, Sponsorship"
- [ ] **Step 4:** Verify deal appears in Kanban board under "Discovered"
- [ ] **Step 5:** Move deal through stages using dropdown menu
- [ ] **Step 6:** Click on deal to verify DealDetail page loads
- [ ] **Step 7:** Test "Upload Deck for AI Matching" button
- [ ] **Step 8:** Upload any PDF → verify AI match results appear
- [ ] **Step 9:** Verify deal count and pipeline value update in header

---

### Task 9: Test Connect Accounts & ID Verification

**Files:**

- Test: `src/pages/ConnectAccounts.jsx`

- [ ] **Step 1:** Log in as a talent user
- [ ] **Step 2:** Go to Connect Accounts
- [ ] **Step 3:** Verify platform catalog loads (88 platforms)
- [ ] **Step 4:** Try connecting Instagram:
  - Click Instagram → OAuth option
  - Verify yellow banner shows "Real OAuth Coming Soon" (Phyllo not configured)
  - Enter username → verify "Connected" status appears
- [ ] **Step 5:** Test ID Verification:
  - Scroll to Identity Verification section
  - Upload a test image file
  - Click "Submit for Review"
  - Verify status changes to "Under Review"
- [ ] **Step 6:** Verify verification boost score updates

---

### Task 10: Test Settings & Manager Invite

**Files:**

- Test: `src/pages/Settings.jsx`

- [ ] **Step 1:** Go to Settings as talent user
- [ ] **Step 2:** Verify "My Manager" section appears
- [ ] **Step 3:** Enter an email → click "Send Invite"
- [ ] **Step 4:** Click "Generate Invite Link" → verify link is copied
- [ ] **Step 5:** Test theme switcher (Dark → Gradient)
- [ ] **Step 6:** Test profile update (change name, save)

---

## Phase 5: Test All Remaining Pages

### Task 11: Click-Through Every Sidebar Page

- [ ] **Step 1:** As admin, click EVERY page in the sidebar and verify it loads without error:

**Core (verify loads):**

- [ ] Dashboard
- [ ] Admin Dashboard
- [ ] Data Manager
- [ ] Marketplace
- [ ] My Profile
- [ ] My Opportunities

**Discovery:**

- [ ] Talent Discovery
- [ ] Match Engine
- [ ] Brands
- [ ] Market Intelligence

**Outreach:**

- [ ] Contact Finder
- [ ] Outreach
- [ ] Sequences
- [ ] Warm Intro Network
- [ ] Demographic Targeting

**Deals:**

- [ ] Deal Pipeline
- [ ] Deal Analytics
- [ ] Deal Comparison
- [ ] Deal Score Leaderboard
- [ ] Bundle Deals
- [ ] Contract Templates
- [ ] Approvals

**Content:**

- [ ] Campaign Briefs
- [ ] Pitch Deck Builder
- [ ] Deck Library
- [ ] Pitch Competition

**Analytics:**

- [ ] Analytics
- [ ] Talent Analytics
- [ ] Talent Revenue
- [ ] Custom Reports

**AI:**

- [ ] AI Features
- [ ] AI Agents Hub
- [ ] AI Command Center
- [ ] AI Analytics

**Data:**

- [ ] Data Room (Talent)
- [ ] Data Room (Brand)
- [ ] Data Room (Agency)
- [ ] Data Import/Export

**Calendar:**

- [ ] Master Calendar (verify 486 events load)
- [ ] Culture Calendar
- [ ] Event Management

**Account:**

- [ ] Connect Accounts
- [ ] Integrations
- [ ] Referrals
- [ ] Teams
- [ ] Notifications
- [ ] Subscriptions
- [ ] Billing
- [ ] Settings

**System:**

- [ ] System Health
- [ ] System Architecture
- [ ] Platform Overview

- [ ] **Step 2:** Document any pages that show errors or blank screens

---

## Phase 6: Mobile Testing

### Task 12: Test on Mobile Device

- [ ] **Step 1:** Open thedealstage.com on your phone
- [ ] **Step 2:** Verify hamburger menu appears (not desktop nav links)
- [ ] **Step 3:** Tap hamburger → verify all nav links listed
- [ ] **Step 4:** Test signup flow on mobile
- [ ] **Step 5:** Test login on mobile
- [ ] **Step 6:** Navigate to Dashboard → verify it's readable
- [ ] **Step 7:** Navigate to Deal Pipeline → verify horizontal scroll works
- [ ] **Step 8:** Navigate to Master Calendar → verify events load
- [ ] **Step 9:** Document any mobile layout issues

---

## Phase 7: Fix Any Issues Found

### Task 13: Bug Fix Sprint

- [ ] **Step 1:** Compile all issues from Tasks 3-12
- [ ] **Step 2:** Prioritize by severity (Critical → High → Medium → Low)
- [ ] **Step 3:** Fix all Critical and High issues
- [ ] **Step 4:** Rebuild and deploy
- [ ] **Step 5:** Re-test fixed issues
- [ ] **Step 6:** Commit with message: "Fix all issues from 100% working audit"

---

## Phase 8: Final Verification

### Task 14: Complete End-to-End Smoke Test

- [ ] **Step 1:** Create a FRESH account (new email)
- [ ] **Step 2:** Complete signup as Talent
- [ ] **Step 3:** Connect a social account
- [ ] **Step 4:** View Match Engine results
- [ ] **Step 5:** Create a deal in the pipeline
- [ ] **Step 6:** Use AI Command Center
- [ ] **Step 7:** Check Master Calendar
- [ ] **Step 8:** Update Settings
- [ ] **Step 9:** Log out and log back in
- [ ] **Step 10:** Verify everything still works

**Success criteria:** A brand new user can sign up, see data, use AI, create a deal, and manage their account without hitting ANY errors.

---

## Definition of Done

- [ ] All 4 signup paths work (Talent, Brand, Agency, Manager)
- [ ] Login works (email + Google OAuth + forgot password)
- [ ] All 7 AI-powered features work
- [ ] Deal Pipeline creates, moves, and tracks deals
- [ ] Connect Accounts shows 88 platforms
- [ ] All 50+ sidebar pages load without errors
- [ ] Mobile layout works (hamburger menu, readable content)
- [ ] 20 brands + 10 contacts + 10 talent seeded
- [ ] Master Calendar shows 486 events
- [ ] Admin can manage data via Data Manager
- [ ] Vercel hosting secured with payment method
- [ ] All 4 AI providers working (including Gemini)
