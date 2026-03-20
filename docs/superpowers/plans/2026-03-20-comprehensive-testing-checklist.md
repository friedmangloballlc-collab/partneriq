# DealStage Comprehensive Testing Checklist

> **Testing order matters.** Each phase builds on the previous one. If Phase 1 fails, nothing else works. Test in order — don't skip ahead.

---

## PHASE 1: INFRASTRUCTURE (Test First — Everything Depends On This)

**Why first:** If hosting, auth, or the database is broken, nothing else matters.

### 1.1 Site Accessibility

- [ ] Open https://www.thedealstage.com in Chrome — page loads
- [ ] Open in Safari — page loads
- [ ] Open in Firefox — page loads
- [ ] Open in incognito/private window — page loads
- [ ] Open on mobile (iPhone or Android) — page loads
- [ ] Check HTTPS padlock icon — secure connection confirmed
- [ ] Type a fake URL (thedealstage.com/fakepage123) — branded 404 page appears

**Why:** If the site doesn't load in all browsers, you're losing users before they start.

### 1.2 Vercel Hosting

- [ ] Vercel dashboard shows "Ready" status on latest deployment
- [ ] Payment method added (trial no longer expiring)
- [ ] Custom domain (thedealstage.com) resolving correctly

**Why:** Site goes offline without hosting secured.

### 1.3 Database Connection

- [ ] Log in as admin → Dashboard loads with data (not blank)
- [ ] Navigate to Data Manager → brands load (should see 25)
- [ ] Navigate to Master Calendar → events load (should see 486)

**Why:** If the database connection is broken, the app shows empty pages.

### 1.4 AI Providers

- [ ] Go to AI Command Center → type any question → get a response (proves AI router works)
- [ ] If no response, check: Anthropic, DeepSeek, and Groq should be working regardless of Gemini

**Why:** AI is the core value proposition. If it doesn't work, the platform has no intelligence.

---

## PHASE 2: AUTHENTICATION (Test Second — Users Can't Do Anything Without Logging In)

**Why second:** Every user journey starts with auth. If signup/login is broken, zero users.

### 2.1 Email/Password Signup — Talent

- [ ] Go to thedealstage.com → click "Start free trial"
- [ ] Select "Talent" role → click Continue
- [ ] Verify plan selection page shows 4 plans (Starter/Rising/Pro/Elite)
- [ ] Select "Starter (Free)" plan
- [ ] Fill in: name, test email, password (min 8 chars, 1 uppercase, 1 number)
- [ ] Click "Get Started Free"
- [ ] Verify: either redirects to /check-email OR /Dashboard
- [ ] If /check-email: check inbox for verification email
- [ ] Verify email link goes to thedealstage.com (NOT localhost)
- [ ] After verification: sign in → Dashboard loads
- [ ] Sidebar shows Talent pages (31 items)
- [ ] Role badge shows "TALENT PORTAL"

**Why:** Talent is your primary user. If they can't sign up, you have no supply side.

### 2.2 Email/Password Signup — Brand

- [ ] Open incognito → same flow but select "Brand"
- [ ] Verify Brand plans show (Explorer/Growth/Scale/Enterprise)
- [ ] Create account with different email
- [ ] Verify Brand Dashboard loads
- [ ] Sidebar shows Brand pages (38 items)
- [ ] "My Opportunities" is accessible

**Why:** Brands are your paying customers. Broken brand signup = no revenue.

### 2.3 Email/Password Signup — Agency

- [ ] Same flow → select "Agency"
- [ ] Verify Agency plans show (Starter/Pro/Enterprise)
- [ ] Create account
- [ ] Verify Agency sidebar (37 items)
- [ ] "Talent Roster" is accessible

**Why:** Agencies are your highest-paying tier ($2,499+/mo).

### 2.4 Email/Password Signup — Manager

- [ ] Same flow → select "Manager"
- [ ] Verify NO plan selection (skips straight to account form)
- [ ] Create account
- [ ] Verify Manager sidebar (same as Talent)
- [ ] "Manager Portal" badge in sidebar
- [ ] Manager Setup page accessible

**Why:** New role — needs validation that the skip-plans logic works.

### 2.5 Google OAuth Login

- [ ] Go to /login → click "Continue with Google"
- [ ] Google popup appears
- [ ] Complete Google auth
- [ ] Redirected to /Dashboard (not error page)
- [ ] User is logged in with correct name/email

**Why:** OAuth is the lowest-friction login. If it's broken, you lose easy signups.

### 2.6 Email/Password Login

- [ ] Go to /login
- [ ] Enter your admin credentials
- [ ] Click "Sign In" → Dashboard loads
- [ ] No error messages appear
- [ ] Try wrong password → error shows, then auto-clears after 4 seconds
- [ ] Try again with correct password → works without page refresh

**Why:** This is how most users log in daily.

### 2.7 Forgot Password

- [ ] Go to /login → click "Forgot password?"
- [ ] Enter email → click "Send Reset Link"
- [ ] Success message appears
- [ ] Check email inbox — reset link arrives
- [ ] Reset link goes to thedealstage.com (NOT localhost:3000)
- [ ] Can set new password and log in

**Why:** If password reset links go to localhost, users are permanently locked out.

### 2.8 Magic Link

- [ ] Go to /login → "Sign in with magic link"
- [ ] Enter email → send
- [ ] Check email for magic link
- [ ] Link logs you in

**Why:** Alternative auth method — some users prefer passwordless.

### 2.9 Logout & Session

- [ ] Click user avatar → Logout
- [ ] Redirected to landing page (not error)
- [ ] Try accessing /Dashboard directly → redirected to landing/login
- [ ] Log back in → previous data still there (session doesn't wipe data)

**Why:** Broken logout or session handling creates security issues and support tickets.

---

## PHASE 3: ROLE-BASED ACCESS (Test Third — Ensures Users Only See What They Should)

**Why third:** If a talent user can see brand-only pages, you have a security/UX problem.

### 3.1 Talent Access

- [ ] Log in as talent user
- [ ] Verify sidebar shows exactly 31 pages
- [ ] Can access: My Profile, Marketplace, Match Engine, Deal Pipeline
- [ ] CANNOT access: Admin Dashboard, Data Manager, System Health
- [ ] Try typing /AdminDashboard in URL → redirected to Dashboard (not shown)

### 3.2 Brand Access

- [ ] Log in as brand user
- [ ] Verify sidebar shows 38 pages
- [ ] Can access: Talent Discovery, Campaign Briefs, My Opportunities
- [ ] CANNOT access: Admin Dashboard, My Profile (talent), System Health

### 3.3 Agency Access

- [ ] Log in as agency user
- [ ] Verify sidebar shows 37 pages
- [ ] Can access: Talent Roster, Approvals, Custom Reports
- [ ] CANNOT access: Admin Dashboard, Data Manager

### 3.4 Admin Access

- [ ] Log in as admin
- [ ] Verify sidebar shows ALL pages (52+)
- [ ] Can access: Admin Dashboard, Data Manager, System Health, AI Analytics
- [ ] No "trial expired" banner (admin bypasses all restrictions)
- [ ] No locked features

**Why:** Role-based access is a security requirement and prevents user confusion.

---

## PHASE 4: FEATURE GATING (Test Fourth — Ensures Free vs Paid Works)

**Why fourth:** If free users can access everything, you have no upgrade incentive. If paid users are locked out, you'll get refund requests.

### 4.1 Free Tier Gating (Talent)

- [ ] Log in as a FREE talent user (from Phase 2 signup)
- [ ] CAN access: Dashboard, My Profile, Marketplace (browse), Deal Pipeline (1 deal)
- [ ] LOCKED (shows upgrade modal): Match Engine, Contact Finder, AI Command Center, Outreach
- [ ] Click a locked page → upgrade modal appears
- [ ] Modal shows correct tier name: "This feature requires the Rising plan"
- [ ] "View plans" button works → goes to subscription page

### 4.2 Trial Period

- [ ] New user within 7-day trial → gets Tier 2 (Pro/Scale) access
- [ ] Can use Match Engine, AI, Contact Finder during trial
- [ ] After 7 days (or for test: user created >7 days ago) → features lock
- [ ] "Trial expired" banner appears for non-admin free users

### 4.3 Admin Bypass

- [ ] Log in as admin → NO trial banner, NO locked features, NO upgrade modals
- [ ] Can access every single page without restrictions

**Why:** Feature gating drives revenue. If it's broken in either direction (too open or too restrictive), you lose money.

---

## PHASE 5: CORE FEATURES (Test Fifth — The Main Product Experience)

**Why fifth:** These are the features users came for. If they don't work, users churn.

### 5.1 AI Features (7 pages)

- [ ] **Match Engine:** Select a brand and talent → Run Match → AI returns scores
- [ ] **Pitch Deck Builder:** Select talent → Generate → AI creates deck content
- [ ] **Campaign Brief Generator:** Fill details → Generate → AI creates brief
- [ ] **Outreach:** Select contact → AI Generate → creates personalized message
- [ ] **Sequence Builder:** Create sequence → AI Generate Step → creates step
- [ ] **Contract Templates:** Select template → AI Suggest → fills suggested values
- [ ] **AI Command Center:** Type "Find fitness creators for Nike" → meaningful response (not error)

**For each AI feature verify:**

- [ ] Loading spinner appears while processing
- [ ] Result appears within 10 seconds
- [ ] No "Unexpected response" or TypeError errors
- [ ] Result is relevant to the input (not gibberish)

### 5.2 Deal Pipeline

- [ ] Click "+ New Deal" → wizard opens
- [ ] Create deal: "Nike × Jordan Reeves, $85K, Sponsorship"
- [ ] Deal appears in Kanban board under "Discovered"
- [ ] Pipeline value updates in header
- [ ] Move deal to "Negotiating" via dropdown → moves correctly
- [ ] Click deal card → DealDetail page loads with deal info
- [ ] Back button returns to pipeline
- [ ] "Upload Deck for AI Matching" button works → upload PDF → AI results appear

### 5.3 Contact Finder

- [ ] Page loads with contacts (should see 10 seeded)
- [ ] Search by name → filters correctly
- [ ] Search by company → filters correctly
- [ ] Contact details (name, title, email, company) all display

### 5.4 Marketplace

- [ ] Page loads with content
- [ ] Can browse available opportunities/talent
- [ ] Filters work (if any)

### 5.5 Talent Discovery

- [ ] Page loads with talent profiles (should see 18)
- [ ] Search by name → filters
- [ ] Talent cards show name, followers, engagement rate

### 5.6 Connect Accounts

- [ ] Page loads with 88 platforms in catalog
- [ ] Category tabs work (Content & Video, Photo, Music, etc.)
- [ ] Search for "Instagram" → appears
- [ ] Click Instagram → OAuth dialog opens
- [ ] Yellow "Real OAuth Coming Soon" banner appears
- [ ] Enter username → click connect → shows "Connected"
- [ ] ID Verification section visible
- [ ] Upload test image → "Submit for Review" → status changes to "Under Review"
- [ ] Verification boost score updates

### 5.7 Master Calendar

- [ ] Page loads (may take a moment — 486 events)
- [ ] Events display with name, date, category, tier
- [ ] Filter by year → works
- [ ] Filter by category → works
- [ ] Filter by tier → works
- [ ] Search → works

### 5.8 Settings

- [ ] Profile section loads with current user info
- [ ] Can edit name → save → refreshes correctly
- [ ] Theme switcher: Dark → Gradient → verify change
- [ ] "My Manager" section visible (for talent users)
- [ ] "Generate Invite Link" → link copied to clipboard
- [ ] Appearance section with ThemeSwitcher

**Why:** These are the features that deliver core value. Every one must work.

---

## PHASE 6: DATA PERSISTENCE & INTEGRITY (Test Sixth — Data Must Survive)

**Why sixth:** If users create data and it disappears, trust is destroyed.

### 6.1 Create & Verify

- [ ] Create a deal → refresh page → deal still exists
- [ ] Update a deal stage → refresh → stage persists
- [ ] Edit profile → save → log out → log back in → changes preserved
- [ ] Connect a social account → refresh → still shows connected

### 6.2 Empty States

- [ ] New user with no deals → Deal Pipeline shows "No deals yet" with CTA (not blank/broken)
- [ ] New user with no connected accounts → shows onboarding prompt
- [ ] New user with no outreach → Outreach page shows helpful empty state

### 6.3 Data Validation

- [ ] Try creating a deal with no title → should show error, not crash
- [ ] Try signing up with invalid email format → form validates
- [ ] Try password under 8 characters → shows requirement
- [ ] Try submitting empty forms → validation messages appear

**Why:** Data loss and bad validation create support tickets and destroy trust.

---

## PHASE 7: EMAIL DELIVERY (Test Seventh — Emails Must Arrive)

**Why seventh:** If emails don't arrive, users can't verify accounts, reset passwords, or get notifications.

### 7.1 Verification Email

- [ ] Sign up with new email → verification email arrives
- [ ] Email is from DealStage (not generic Supabase)
- [ ] Link in email works and goes to thedealstage.com

### 7.2 Password Reset Email

- [ ] Request password reset → email arrives
- [ ] Link goes to thedealstage.com (not localhost)
- [ ] Can reset password via the link

### 7.3 Welcome Email

- [ ] After signup → welcome email arrives (if email confirmation disabled)
- [ ] Email has DealStage branding and logo
- [ ] Links in email work

### 7.4 Magic Link Email

- [ ] Request magic link → email arrives
- [ ] Link logs you in

**Why:** Broken emails = locked out users = immediate churn.

---

## PHASE 8: STRIPE & PAYMENTS (Test Eighth — Revenue Must Flow)

**Why eighth:** If payments don't work, you can't make money.

### 8.1 Upgrade Flow

- [ ] As free talent → go to Subscriptions page
- [ ] See all plan options with correct prices
- [ ] Click "Upgrade" on Rising ($99/mo)
- [ ] Stripe checkout page loads (or error — document which)
- [ ] Can enter test card (4242 4242 4242 4242) if Stripe is in test mode
- [ ] After payment → plan updates in profile

### 8.2 Subscription Page

- [ ] Shows current plan
- [ ] Shows billing history (if any)
- [ ] "Change Plan" button works

### 8.3 Billing Page

- [ ] Loads without errors
- [ ] Shows payment history (or empty state if none)

**Why:** Payments are how you make money. Broken checkout = $0 revenue.

---

## PHASE 9: ALL PAGES CLICK-THROUGH (Test Ninth — Nothing Should Crash)

**Why ninth:** Any page that shows an error is a broken experience. Every page must at least LOAD.

### Core

- [ ] Dashboard — loads with stats and widgets
- [ ] Admin Dashboard — loads with admin metrics
- [ ] Data Manager — loads, can switch tabs (Brands/Contacts/Deals)
- [ ] Marketplace — loads with content
- [ ] My Profile — loads with profile form
- [ ] My Opportunities — loads

### Discovery & Matching

- [ ] Talent Discovery — loads with talent list
- [ ] Match Engine — loads with brand/talent selectors
- [ ] Brands — loads with brand list (25 brands)
- [ ] Market Intelligence — loads

### Outreach

- [ ] Contact Finder — loads with contacts (10)
- [ ] Outreach — loads
- [ ] Sequences — loads
- [ ] Warm Intro Network — loads
- [ ] Demographic Targeting — loads

### Deals

- [ ] Deal Pipeline — loads with Kanban board
- [ ] Deal Analytics — loads
- [ ] Deal Comparison — loads
- [ ] Deal Score Leaderboard — loads
- [ ] Bundle Deals — loads
- [ ] Contract Templates — loads with template list
- [ ] Approvals — loads

### Content

- [ ] Campaign Briefs — loads
- [ ] Pitch Deck Builder — loads
- [ ] Deck Library — loads
- [ ] Pitch Competition — loads

### Analytics & Intelligence

- [ ] Analytics — loads with charts
- [ ] Talent Analytics — loads
- [ ] Talent Revenue — loads
- [ ] Custom Reports — loads
- [ ] Spend Prediction — loads
- [ ] ROI Simulator — loads

### AI

- [ ] AI Features — loads with feature cards
- [ ] AI Agents Hub — loads with agent list
- [ ] AI Command Center — loads with input field
- [ ] AI Analytics — loads

### Data Rooms

- [ ] Data Room (Talent) — loads
- [ ] Data Room (Brand) — loads
- [ ] Data Room (Agency) — loads
- [ ] Data Import/Export — loads

### Calendar

- [ ] Master Calendar — loads with 486 events
- [ ] Culture Calendar — loads
- [ ] Event Management — loads

### Account

- [ ] Connect Accounts — loads with 88 platforms
- [ ] Integrations — loads with integration categories
- [ ] Referrals — loads
- [ ] Teams — loads
- [ ] Notifications — loads
- [ ] Subscriptions — loads
- [ ] Billing — loads
- [ ] Settings — loads with all sections

### System (Admin only)

- [ ] System Health — loads with service status
- [ ] System Architecture — loads
- [ ] Platform Overview — loads

**For each page mark:** ✅ Loads | ⚠️ Loads with issues | ❌ Error/crash

**Why:** Every broken page is a lost user. Test every single one.

---

## PHASE 10: SEARCH, FILTERS & SORTING (Test Tenth — Users Must Find Things)

**Why tenth:** If users can't search or filter, they can't find what they need.

- [ ] Deal Pipeline search → filters deals by name
- [ ] Talent Discovery search → filters by talent name
- [ ] Contact Finder search → filters by name/company
- [ ] Master Calendar filter by year → shows correct events
- [ ] Master Calendar filter by category → filters correctly
- [ ] Master Calendar filter by tier → filters correctly
- [ ] Data Manager search → filters brands/contacts
- [ ] Connect Accounts category tabs → filter platforms
- [ ] Connect Accounts search → finds specific platform

**Why:** If search doesn't work, users think the platform has no data.

---

## PHASE 11: SEO & META (Test Eleventh — Search Engines Must Index Correctly)

**Why eleventh:** Wrong titles mean Google shows the wrong info.

- [ ] Homepage title: "Dealstage — AI Partnership Intelligence Platform" (check browser tab)
- [ ] Login page title: "Sign In | Dealstage"
- [ ] About page title: "About | Dealstage"
- [ ] Dashboard title: "Dashboard | Dealstage"
- [ ] Each page has a DIFFERENT title (not all the same)
- [ ] Open Graph image loads when sharing URL on social media

**Why:** SEO drives free organic traffic. Wrong meta = invisible to Google.

---

## PHASE 12: PERFORMANCE (Test Twelfth — Speed Matters)

**Why twelfth:** Slow pages = abandoned sessions. Every second of load time loses 7% of conversions.

- [ ] Homepage loads in under 3 seconds
- [ ] Dashboard loads in under 3 seconds
- [ ] Deal Pipeline loads in under 3 seconds
- [ ] Master Calendar loads in under 5 seconds (486 events)
- [ ] AI Command Center responds in under 10 seconds
- [ ] No pages take more than 10 seconds to load
- [ ] No visible layout shift after load (content doesn't jump around)

**Why:** Users expect instant. Anything over 3 seconds feels broken.

---

## PHASE 13: MOBILE (Test Thirteenth — Half Your Users Are On Phones)

**Why thirteenth:** 50%+ of web traffic is mobile. If mobile is broken, half your users bounce.

### 13.1 Landing Page (Mobile)

- [ ] Hamburger menu appears (not desktop nav links)
- [ ] Tap hamburger → all nav links listed
- [ ] Hero section readable (not overflowing)
- [ ] Pricing cards stack vertically (not side by side)
- [ ] CTA buttons are full-width and tappable
- [ ] Footer stacks to single column

### 13.2 Signup (Mobile)

- [ ] Role selection cards are full-width
- [ ] Plan selection readable
- [ ] Form inputs are easy to tap
- [ ] Keyboard doesn't cover inputs
- [ ] "Create Account" button visible and tappable

### 13.3 Dashboard (Mobile)

- [ ] Sidebar hidden by default
- [ ] Hamburger opens sidebar as overlay
- [ ] Dashboard stats cards readable
- [ ] No horizontal overflow (no sideways scrolling)

### 13.4 Deal Pipeline (Mobile)

- [ ] Kanban board scrolls horizontally
- [ ] Deal cards are readable
- [ ] Can tap a deal to see details

### 13.5 General Mobile

- [ ] All buttons have minimum 44px tap target
- [ ] Text is readable without zooming
- [ ] No content cut off on right side
- [ ] Back button (phone) works correctly

**Why:** Mobile users have zero patience. One broken layout and they leave.

---

## PHASE 14: ADMIN FUNCTIONS (Test Fourteenth — You Need To Run The Business)

**Why fourteenth:** Admin tools are how YOU manage the platform. If they're broken, you can't operate.

- [ ] Admin Dashboard loads with platform metrics
- [ ] Data Manager → Brands tab → can add a new brand
- [ ] Data Manager → Contacts tab → can add a new contact
- [ ] Data Manager → Deals tab → can view deals
- [ ] Data Manager → CSV import → upload a CSV → data imports
- [ ] System Health → shows service statuses
- [ ] AI Analytics → shows AI usage data
- [ ] Can change a user's role (if needed from Supabase dashboard)

**Why:** You're the admin. If you can't manage the platform, nobody can.

---

## PHASE 15: EXPORTS & DOWNLOADS (Test Fifteenth)

**Why fifteenth:** Users need to get data OUT of the platform.

- [ ] Data Manager → Export brands as CSV → file downloads
- [ ] Data Manager → Export contacts as CSV → file downloads
- [ ] Data Room → any export function works
- [ ] Pitch Deck → can download/export generated deck

**Why:** Data export is a common enterprise requirement and user expectation.

---

## PHASE 16: NOTIFICATIONS (Test Sixteenth)

- [ ] Notifications page loads
- [ ] Bell icon in header shows count (if any)
- [ ] Clicking a notification navigates to the right page
- [ ] Notifications can be marked as read

**Why:** Notifications keep users engaged and coming back.

---

## PHASE 17: ONBOARDING WIZARD (Test Seventeenth)

- [ ] Create a brand new account
- [ ] After first login → onboarding wizard appears
- [ ] Step 1: Complete profile → works
- [ ] Step 2: Connect accounts → shows platforms
- [ ] Step 3: Set preferences → role-specific options
- [ ] Step 4: "You're all set!" → confetti + quick start cards
- [ ] Dismiss wizard → doesn't reappear on next login

**Why:** First impression determines if a user stays or leaves. The wizard IS the first impression.

---

## PHASE 18: CROSS-BROWSER (Test Eighteenth)

- [ ] Chrome: full test pass
- [ ] Safari: login + dashboard + key pages work
- [ ] Firefox: login + dashboard + key pages work
- [ ] Edge: login + dashboard work

**Why:** 15% of users use Safari, 5% Firefox. Don't lose them to browser bugs.

---

## PHASE 19: FINAL SMOKE TEST (Test Last — The Ultimate Verification)

**Why last:** This simulates a real new user's complete journey. If this works, the app is ready.

- [ ] Open incognito browser
- [ ] Go to thedealstage.com
- [ ] Browse the landing page (pricing, features, about)
- [ ] Click "Start free trial"
- [ ] Sign up as Talent with a brand new email
- [ ] Verify email (if required)
- [ ] Log in → onboarding wizard appears
- [ ] Complete wizard
- [ ] Connect a social account
- [ ] Browse the Marketplace
- [ ] View Match Engine results
- [ ] Create a deal in the pipeline
- [ ] Use AI Command Center
- [ ] Check Master Calendar
- [ ] Update Settings (change name, theme)
- [ ] Log out
- [ ] Log back in
- [ ] Everything still works
- [ ] **✅ APP IS 100% WORKING**

---

## ISSUE TRACKING

For every issue found, document:

| #   | Page | Issue | Severity                 | Screenshot | Status     |
| --- | ---- | ----- | ------------------------ | ---------- | ---------- |
| 1   |      |       | Critical/High/Medium/Low | Y/N        | Open/Fixed |
| 2   |      |       |                          |            |            |
| 3   |      |       |                          |            |            |

**Severity Guide:**

- **Critical:** App crashes, can't log in, data loss, payments broken
- **High:** Feature doesn't work, page shows error, bad UX
- **Medium:** Visual issue, minor bug, unexpected behavior
- **Low:** Cosmetic, typo, nice-to-have improvement

Report issues to me and I'll fix them immediately.
