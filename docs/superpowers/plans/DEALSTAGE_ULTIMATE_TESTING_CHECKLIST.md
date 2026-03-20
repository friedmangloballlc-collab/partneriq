# DEALSTAGE ULTIMATE TESTING CHECKLIST

### The Definitive QA Document — Every Flow, Every Page, Every Check

> **Last updated:** 2026-03-20
> **Version:** 1.0 (Merged from app-100-percent-working.md + comprehensive-testing-checklist.md + all missing additions)
>
> **Testing order matters.** Each phase builds on the previous. If Phase 1 fails, nothing else works. Test in order — do not skip ahead.
>
> **Format:** Every item follows:
>
> - [ ] **[ID]** — **What to do:** [Exact action] → **Expected result:** [What should happen] → **If it fails:** [What to report]
>
> **Mark each item:** ✅ Pass | ⚠️ Pass with issues | ❌ Fail
>
> **Reference issues by ID** (e.g., "Issue on 5.2.3 — deal won't move to Negotiating stage").

---

## ISSUE TRACKER

Use this table to log every failure found during testing. Fill it in as you go.

| #   | Item ID | Page/Flow | Issue Description | Severity (C/H/M/L) | Screenshot | Status |
| --- | ------- | --------- | ----------------- | ------------------ | ---------- | ------ |
| 1   |         |           |                   |                    |            | Open   |
| 2   |         |           |                   |                    |            | Open   |
| 3   |         |           |                   |                    |            | Open   |

**Severity Key:**

- **C — Critical:** App crashes, can't log in, data loss, payments broken
- **H — High:** Feature doesn't work, page shows error, user cannot complete a flow
- **M — Medium:** Visual issue, minor bug, unexpected behavior
- **L — Low:** Cosmetic, typo, nice-to-have

---

## PHASE 1: INFRASTRUCTURE

### Everything Depends On This — Test First

> If the site doesn't load, nothing else can be tested. This phase confirms the hosting, CDN, SSL, and database connection are all healthy before any feature testing begins.

---

### 1.1 Site Accessibility — Cross-Browser Load Test

- [ ] **1.1.1** — **What to do:** Open https://www.thedealstage.com in Google Chrome (latest) → **Expected result:** Landing page loads fully with logo, hero section, navigation bar, and "Start free trial" CTA button visible within 5 seconds → **If it fails:** Screenshot the browser tab showing the error and report "Site not loading in Chrome — [error message shown]"

- [ ] **1.1.2** — **What to do:** Open https://www.thedealstage.com in Apple Safari (latest) → **Expected result:** Landing page loads identically to Chrome — no missing layout, no broken fonts, no invisible elements → **If it fails:** Screenshot and report "Safari layout broken — [describe what looks wrong]"

- [ ] **1.1.3** — **What to do:** Open https://www.thedealstage.com in Mozilla Firefox (latest) → **Expected result:** Landing page loads fully, all fonts render, all images display, navigation works → **If it fails:** Screenshot and report "Firefox not loading — [describe error]"

- [ ] **1.1.4** — **What to do:** Open https://www.thedealstage.com in Microsoft Edge (latest) → **Expected result:** Landing page loads without errors, same layout as Chrome → **If it fails:** Report "Edge not loading"

- [ ] **1.1.5** — **What to do:** Open https://www.thedealstage.com in Chrome Incognito / Private Window (no cookies, no cache) → **Expected result:** Page loads identically to normal Chrome — proves it works for first-time visitors → **If it fails:** Report "Site requires cookies/session to load — broken for new visitors"

- [ ] **1.1.6** — **What to do:** Open https://www.thedealstage.com on a physical mobile device (iPhone or Android, use the actual device not DevTools) → **Expected result:** Page loads on mobile, hamburger menu icon visible, no desktop-only layout elements overflowing → **If it fails:** Report "Mobile load broken — [describe what you see]"

- [ ] **1.1.7** — **What to do:** Check the browser address bar padlock icon on any browser → **Expected result:** Green/closed padlock icon confirms HTTPS SSL certificate is valid and active → **If it fails:** Report "SSL certificate error — site showing 'Not Secure' warning"

- [ ] **1.1.8** — **What to do:** Type a fake URL directly: https://www.thedealstage.com/this-page-does-not-exist-xyz123 → **Expected result:** A branded 404 page appears with DealStage logo/design (not a generic Vercel/hosting error page) → **If it fails:** Report "404 page is generic — needs custom branded 404 page"

---

### 1.2 Vercel Hosting Health

- [ ] **1.2.1** — **What to do:** Log into vercel.com → navigate to the DealStage project → check deployment status → **Expected result:** Latest deployment shows green "Ready" badge with a timestamp from the most recent push → **If it fails:** Report "Vercel deployment failed — [copy the build error message]"

- [ ] **1.2.2** — **What to do:** While logged into Vercel, go to Settings → Billing → check payment/plan status → **Expected result:** Either a Pro plan with active billing OR Hobby plan with no trial expiration countdown showing → **If it fails:** Report "Vercel trial expiring — billing must be added immediately or site goes offline"

- [ ] **1.2.3** — **What to do:** In Vercel, go to Settings → Domains → check custom domain → **Expected result:** thedealstage.com shows as active and resolving, no DNS warnings or "unverified" state → **If it fails:** Report "Custom domain not resolving — [describe status shown]"

- [ ] **1.2.4** — **What to do:** In Vercel, check that auto-deploy is enabled by looking at the last 3 deployments — confirm they match recent git commits → **Expected result:** Every push to the main branch triggers a Vercel deployment automatically → **If it fails:** Report "Auto-deploy appears disabled — deployments may not be going live"

---

### 1.3 Database Connection

- [ ] **1.3.1** — **What to do:** Log in as admin (getreachmediallc@gmail.com) → navigate to the Dashboard → **Expected result:** Dashboard loads with real data visible in stats cards — not all zeros, not "Error loading data", not blank white cards → **If it fails:** Report "Database connection broken — Dashboard shows no data after admin login"

- [ ] **1.3.2** — **What to do:** As admin, navigate to Data Manager → Brands tab → **Expected result:** Brand list loads and shows 25 brands including Nike, Spotify, Sephora, etc. → **If it fails:** Report "Data Manager not loading brands — database query may be failing"

- [ ] **1.3.3** — **What to do:** Navigate to Master Calendar → **Expected result:** Calendar loads and shows 486 events (check the event count display or count the visible events across all filters) → **If it fails:** Report "Master Calendar not loading events — shows [X] events instead of 486"

- [ ] **1.3.4** — **What to do:** Navigate to Connect Accounts → **Expected result:** Platform catalog loads and shows 88 platforms in the grid/list → **If it fails:** Report "Connect Accounts catalog not loading — shows [X] platforms instead of 88"

---

### 1.4 AI Provider Health

- [ ] **1.4.1** — **What to do:** Navigate to AI Command Center → type: "Hello, are you working?" → click Send → **Expected result:** AI responds with a coherent greeting or acknowledgment message within 10 seconds. No error toast, no "Unexpected response" message → **If it fails:** Report "AI Command Center not responding — AI router may be down"

- [ ] **1.4.2** — **What to do:** In AI Command Center, type: "What is DealStage?" → **Expected result:** AI returns a relevant response about influencer marketing, brand partnerships, or creator deals. Response should make contextual sense → **If it fails:** Report "AI response is gibberish or error — provider [name which one if shown] may be failing"

- [ ] **1.4.3** — **What to do:** Run the AI router diagnostics via terminal or Supabase console: POST to the ai-router function with action=diagnose → **Expected result:** JSON response shows Anthropic, DeepSeek, and Groq as "WORKING". Gemini may show as needing API activation → **If it fails:** Report "AI router diagnose endpoint returning error — [copy the response]"

- [ ] **1.4.4** — **What to do:** If Gemini is not activated: go to console.cloud.google.com → select the project → APIs & Services → enable "Generative Language API" (Gemini) → **Expected result:** After enabling, re-run diagnose and Gemini shows "WORKING" → **If it fails:** Report "Gemini API activation failed — [error from Google Cloud Console]"

---

### 1.5 Branding & Design Integrity

- [ ] **1.5.1** — **What to do:** Look at the navigation bar on the landing page → check the logo in the top-left corner → **Expected result:** The DealStage wordmark or logo appears — NOT a generic Zap/lightning bolt icon placeholder → **If it fails:** Report "Logo shows as Zap icon in nav — needs to be replaced with DealStage logo"

- [ ] **1.5.2** — **What to do:** Check the sidebar (after logging in) for the logo at the top → **Expected result:** DealStage logo appears in the sidebar, not the Zap icon → **If it fails:** Report "Logo shows as Zap icon in sidebar"

- [ ] **1.5.3** — **What to do:** Check the login/signup page for the logo → **Expected result:** DealStage logo visible on the auth pages, consistent with the rest of the app → **If it fails:** Report "Logo missing or incorrect on login/signup pages"

- [ ] **1.5.4** — **What to do:** Check the footer of the landing page for the logo or brand name → **Expected result:** "DealStage" branding visible in footer (wordmark, logo, or text) — not Zap icon → **If it fails:** Report "Footer logo incorrect"

- [ ] **1.5.5** — **What to do:** Open Chrome DevTools (F12) → Network tab → filter by "font" → reload the landing page → look for font requests → **Expected result:** Google Fonts loads both "Cormorant Garamond" and "Instrument Sans" font families (requests should show status 200) → **If it fails:** Report "Google Fonts not loading — headings or body text may be using fallback font"

- [ ] **1.5.6** — **What to do:** Visually inspect the landing page hero, pricing section, and CTA buttons for color consistency → **Expected result:** Gold/amber accent color (#D4A843 or similar) is used consistently for CTAs, highlights, and accent elements throughout the landing page → **If it fails:** Report "Gold theme inconsistent — [describe which section uses a different color]"

---

## PHASE 1.5: LANDING PAGE DEEP TESTING

### Every Link, Button, Section, and Interaction

> The landing page is the first thing potential users and investors see. Every element must work. Test each link, button, and interactive section individually.

---

### 1.5.1 Navigation Bar Links

- [ ] **1.5.1.1** — **What to do:** Click the "For Brands" dropdown in the navigation bar → **Expected result:** A dropdown menu appears with sub-links for brand-related features (e.g., Talent Discovery, Campaign Briefs, Analytics) → **If it fails:** Report "For Brands nav dropdown not opening"

- [ ] **1.5.1.2** — **What to do:** Click each link inside the "For Brands" dropdown → **Expected result:** Each link navigates to the correct feature page or landing section without 404 error → **If it fails:** Report "For Brands dropdown link broken: [link name] → [where it went]"

- [ ] **1.5.1.3** — **What to do:** Click the "For Talent" dropdown in the navigation bar → **Expected result:** Dropdown opens with talent-relevant sub-links (e.g., My Profile, Marketplace, Match Engine) → **If it fails:** Report "For Talent nav dropdown not opening"

- [ ] **1.5.1.4** — **What to do:** Click each link inside the "For Talent" dropdown → **Expected result:** Each link navigates to the correct destination → **If it fails:** Report "For Talent dropdown link broken: [link name]"

- [ ] **1.5.1.5** — **What to do:** Click the "For Creators" or "For Agencies" dropdown in the navigation bar → **Expected result:** Dropdown opens with relevant sub-links → **If it fails:** Report "For Creators/Agencies nav dropdown not opening"

- [ ] **1.5.1.6** — **What to do:** Click "Pricing" in the navigation bar → **Expected result:** Page scrolls to or navigates to the pricing section → **If it fails:** Report "Pricing nav link not working"

- [ ] **1.5.1.7** — **What to do:** Click "Log in" in the navigation bar → **Expected result:** Navigates to /login page → **If it fails:** Report "Login nav link not working"

---

### 1.5.2 Landing Page Hero & CTAs

- [ ] **1.5.2.1** — **What to do:** Click the "Start free trial" button in the hero section of the landing page → **Expected result:** Navigates to the signup/onboarding page at /signup or /onboarding → **If it fails:** Report "Start free trial hero CTA not working — [where it goes instead]"

- [ ] **1.5.2.2** — **What to do:** Click the "Book a demo" button (if present in hero or nav) → **Expected result:** Navigates to /Demo or a demo booking page → **If it fails:** Report "Book a demo button not working"

- [ ] **1.5.2.3** — **What to do:** Click the "See how it works" button or link (if present) → **Expected result:** Page smoothly scrolls to the "How It Works" section on the same page → **If it fails:** Report "See how it works button not scrolling to How It Works section"

---

### 1.5.3 Video & Interactive Demo

- [ ] **1.5.3.1** — **What to do:** Locate the animated video walkthrough on the landing page → click the play button → **Expected result:** Video plays showing the app interface or animated demo content. No broken video embed, no 404 on the video source → **If it fails:** Report "Landing page video not playing — [error shown]"

- [ ] **1.5.3.2** — **What to do:** Find the "Interactive demo" link below or near the video → click it → **Expected result:** Navigates to /Demo or opens an interactive product tour → **If it fails:** Report "Interactive demo link not working"

---

### 1.5.4 Pricing Section

- [ ] **1.5.4.1** — **What to do:** Scroll to the pricing section on the landing page → click the "Talent" tab in the pricing tab switcher → **Expected result:** Pricing cards update to show Talent plans (Starter/Rising/Pro/Elite) with correct monthly prices → **If it fails:** Report "Talent pricing tab not switching correctly"

- [ ] **1.5.4.2** — **What to do:** Click the "Brands" tab in the pricing switcher → **Expected result:** Pricing cards update to show Brand plans (Explorer/Growth/Scale/Enterprise) with correct prices → **If it fails:** Report "Brands pricing tab not switching"

- [ ] **1.5.4.3** — **What to do:** Click the "Agencies" tab in the pricing switcher → **Expected result:** Pricing cards update to show Agency plans (Starter/Pro/Enterprise) with correct prices → **If it fails:** Report "Agencies pricing tab not switching"

- [ ] **1.5.4.4** — **What to do:** Look for a monthly/annual billing toggle on the pricing section → if present, toggle it → **Expected result:** Prices update to show annual pricing (typically 20-25% discount from monthly) → **If it fails:** Report "Annual/monthly pricing toggle not updating prices"

- [ ] **1.5.4.5** — **What to do:** Check each paid plan card for a "7-day free trial" badge or label → **Expected result:** Each paid plan clearly shows a "7-day free trial" or "Try free for 7 days" indicator → **If it fails:** Report "7-day free trial badge missing from [plan name] card"

- [ ] **1.5.4.6** — **What to do:** Click a "Start free trial" or "Get started" CTA button on any pricing card → **Expected result:** Navigates to signup with the selected plan pre-selected or passed as a query parameter → **If it fails:** Report "Pricing CTA button not working for [plan name] plan"

---

### 1.5.5 FAQ & Comparison Sections

- [ ] **1.5.5.1** — **What to do:** Scroll to the FAQ section on the landing page → click any FAQ question item → **Expected result:** The accordion expands to reveal the answer text. Clicking it again should close/collapse it → **If it fails:** Report "FAQ accordion not opening/closing"

- [ ] **1.5.5.2** — **What to do:** Click through all FAQ items to ensure each one opens → **Expected result:** Every FAQ question opens and shows a complete, non-empty answer → **If it fails:** Report "FAQ item [question text] has empty answer or won't open"

- [ ] **1.5.5.3** — **What to do:** On mobile view (or DevTools mobile simulation), scroll to the pricing comparison table → **Expected result:** Table is horizontally scrollable on mobile (not cut off, has a scroll indicator or can be swiped left/right) → **If it fails:** Report "Comparison table not scrollable on mobile — content is cut off"

---

### 1.5.6 Footer Links

- [ ] **1.5.6.1** — **What to do:** In the footer, find the "Product" column → click each link listed → **Expected result:** Each product link navigates to the correct feature page (e.g., Talent Discovery → /features/talent-discovery) without 404 → **If it fails:** Report "Footer product link broken: [link name] → [error]"

- [ ] **1.5.6.2** — **What to do:** In the footer, find the "Company" column → click each link listed (About, Blog, Careers, Contact, Customers) → **Expected result:** Each link navigates to the correct company page → **If it fails:** Report "Footer company link broken: [link name]"

- [ ] **1.5.6.3** — **What to do:** In the footer, find the "Legal" column → click each link (Privacy Policy, Terms of Service, Cookie Policy, GDPR) → **Expected result:** Each legal page loads with full text content → **If it fails:** Report "Footer legal link broken: [link name]"

- [ ] **1.5.6.4** — **What to do:** Find social media icons in the footer (Twitter/X, LinkedIn, Instagram, etc.) → click each → **Expected result:** Opens the correct DealStage social media profile in a new tab → **If it fails:** Report "Footer social icon broken: [platform name]"

---

## PHASE 2: AUTHENTICATION

### Users Cannot Do Anything Without Logging In — Test Second

> Every user journey starts with auth. If signup or login is broken, you have zero users. Test all 4 signup paths plus all login methods.

---

### 2.1 Talent Signup Flow

- [ ] **2.1.1** — **What to do:** Go to https://www.thedealstage.com → click "Start free trial" → **Expected result:** Navigates to the onboarding/role selection page → **If it fails:** Report "Start free trial button does not navigate to signup"

- [ ] **2.1.2** — **What to do:** On the role selection screen, click "Talent" → click Continue → **Expected result:** Plan selection page appears showing 4 Talent plans: Starter (Free), Rising ($99/mo), Pro ($199/mo), Elite ($499/mo) with descriptions → **If it fails:** Report "Talent plan selection page not showing 4 plans — shows [X] plans instead"

- [ ] **2.1.3** — **What to do:** Select "Starter (Free)" plan → **Expected result:** Proceeds to the account creation form with fields for name, email, password → **If it fails:** Report "Starter plan selection not proceeding to account form"

- [ ] **2.1.4** — **What to do:** Fill in the account form with a fresh Gmail address (e.g., testuser+talent1@gmail.com) and a password of at least 8 characters with 1 uppercase and 1 number → click "Get Started Free" → **Expected result:** Either redirects to /check-email (if email confirmation is on) or directly to /Dashboard → **If it fails:** Report "Talent signup with Gmail failed at form submission — [error shown]"

- [ ] **2.1.5** — **What to do:** Repeat the Gmail signup test but use a non-Gmail email address (e.g., a Yahoo or Outlook address) → **Expected result:** Signup works identically to Gmail — no special handling or rejection of non-Gmail emails → **If it fails:** Report "Signup failing for non-Gmail addresses — [error shown]"

- [ ] **2.1.6** — **What to do:** After signing up with an email, try to sign up AGAIN with the exact same email address → **Expected result:** Form shows a clear error message like "An account already exists with this email" and does not create a duplicate account → **If it fails:** Report "Duplicate email signup not prevented — either allows duplicate or shows unhelpful error"

- [ ] **2.1.7** — **What to do:** On the password input field during signup, type 1-2 characters → **Expected result:** A password strength indicator appears (color bar, score, or text like "Weak / Strong / Very Strong") → **If it fails:** Report "Password strength indicator not appearing on signup form"

- [ ] **2.1.8** — **What to do:** If redirected to /check-email: open your email inbox → find the DealStage verification email → click the verification link → **Expected result:** Link opens to https://www.thedealstage.com (NOT localhost:3000 or localhost:5173) and confirms the account → **If it fails:** Report "Verification email link goes to localhost — email redirect URL not configured for production"

- [ ] **2.1.9** — **What to do:** After verification, log in with the Talent account → observe the sidebar → **Expected result:** Sidebar shows Talent-specific navigation with approximately 31 pages. Role badge displays "TALENT PORTAL" → **If it fails:** Report "Post-signup Talent sidebar shows wrong role or wrong page count"

- [ ] **2.1.10** — **What to do:** On the signup or login page, find and click "Already have an account? Log in" link → **Expected result:** Navigates to the /login page → **If it fails:** Report "'Already have an account' link not working on signup page"

- [ ] **2.1.11** — **What to do:** On the login page, find and click "Don't have an account? Sign up" link → **Expected result:** Navigates back to the signup/onboarding page → **If it fails:** Report "'Don't have an account' link not working on login page"

---

### 2.2 Brand Signup Flow

- [ ] **2.2.1** — **What to do:** Open a fresh incognito window → go to thedealstage.com → click "Start free trial" → select "Brand" role → **Expected result:** Brand plan selection page shows 4 plans: Explorer (Free), Growth ($299/mo), Scale ($799/mo), Enterprise ($2,499/mo) → **If it fails:** Report "Brand plan selection shows wrong plans or wrong prices"

- [ ] **2.2.2** — **What to do:** Select "Explorer (Free)" → create a Brand account with a different test email → complete signup → **Expected result:** Brand Dashboard loads, sidebar shows Brand-specific navigation with approximately 38 pages → **If it fails:** Report "Brand signup failing or sidebar shows wrong page count"

- [ ] **2.2.3** — **What to do:** As the Brand user, navigate to "My Opportunities" in the sidebar → **Expected result:** My Opportunities page loads without error (may be empty for a new account) → **If it fails:** Report "Brand 'My Opportunities' page not loading"

---

### 2.3 Agency Signup Flow

- [ ] **2.3.1** — **What to do:** Open a fresh incognito window → select "Agency" role → verify plans → **Expected result:** Agency plan selection shows: Starter ($699/mo), Pro ($1,299/mo), Enterprise ($2,499+/mo) → **If it fails:** Report "Agency plan selection shows wrong plans"

- [ ] **2.3.2** — **What to do:** Create an Agency account → complete signup → **Expected result:** Agency Dashboard loads, sidebar shows approximately 37 Agency-specific pages → **If it fails:** Report "Agency signup failing or wrong sidebar"

- [ ] **2.3.3** — **What to do:** As Agency user, navigate to "Talent Roster" in the sidebar → **Expected result:** Talent Roster page loads → **If it fails:** Report "Agency Talent Roster page not loading"

---

### 2.4 Manager Signup Flow

- [ ] **2.4.1** — **What to do:** Open a fresh incognito window → select "Manager" role during onboarding → **Expected result:** The flow SKIPS the plan selection step entirely and goes directly to the account creation form → **If it fails:** Report "Manager signup is incorrectly showing a plan selection page (should skip it)"

- [ ] **2.4.2** — **What to do:** Complete the Manager account creation → log in → observe sidebar → **Expected result:** Sidebar shows same structure as Talent sidebar. A "Manager Portal" badge or label appears in the sidebar → **If it fails:** Report "Manager account shows wrong sidebar or missing Manager Portal badge"

- [ ] **2.4.3** — **What to do:** As Manager, navigate to "Manager Setup" page → **Expected result:** Manager Setup page loads with options to link talent, set preferences, etc. → **If it fails:** Report "Manager Setup page not loading"

---

### 2.5 Google OAuth Login

- [ ] **2.5.1** — **What to do:** Go to /login → click "Continue with Google" → **Expected result:** Google OAuth popup or redirect appears promptly → **If it fails:** Report "Google OAuth button not triggering any popup or redirect"

- [ ] **2.5.2** — **What to do:** Complete the Google login (select a Google account) → **Expected result:** After successful Google auth, redirected to /Dashboard (not an error page, not the landing page) → **If it fails:** Report "Google OAuth login redirects to wrong page after success"

- [ ] **2.5.3** — **What to do:** After Google login, verify the user profile → **Expected result:** User's name and email from Google account appear in the profile/avatar area → **If it fails:** Report "Google OAuth login not populating user name/email"

---

### 2.6 Email/Password Login

- [ ] **2.6.1** — **What to do:** Go to /login → enter admin email and correct password → click "Sign In" → **Expected result:** Dashboard loads within 3 seconds, no error messages appear → **If it fails:** Report "Admin login failing with correct credentials"

- [ ] **2.6.2** — **What to do:** On the login page, enter a valid email but an INCORRECT password → click "Sign In" → **Expected result:** Error message appears (e.g., "Invalid email or password") and it auto-clears after approximately 4 seconds → **If it fails:** Report "Wrong password error either not appearing or not clearing automatically"

- [ ] **2.6.3** — **What to do:** After the wrong-password error clears, enter the correct password and click "Sign In" again WITHOUT refreshing the page → **Expected result:** Login succeeds without needing a page refresh → **If it fails:** Report "Login form requires page refresh after error — form is not resetting properly"

---

### 2.7 Forgot Password Flow

- [ ] **2.7.1** — **What to do:** Go to /login → click "Forgot password?" link → **Expected result:** Opens a password reset form or page with an email input field → **If it fails:** Report "Forgot password link not working"

- [ ] **2.7.2** — **What to do:** Enter a valid registered email → click "Send Reset Link" → **Expected result:** Success message appears confirming the reset email was sent → **If it fails:** Report "Password reset submission failing — [error shown]"

- [ ] **2.7.3** — **What to do:** Check the inbox for the reset email → open the email → click the reset link → **Expected result:** Link opens to https://www.thedealstage.com/reset-password (NOT localhost) → **If it fails:** Report "Password reset link goes to localhost — production URL not configured in Supabase"

- [ ] **2.7.4** — **What to do:** On the password reset page, enter a new password and confirm it → submit → **Expected result:** Password is updated, can log in with the new password → **If it fails:** Report "Password reset form not updating password"

---

### 2.8 Magic Link Login

- [ ] **2.8.1** — **What to do:** Go to /login → find "Sign in with magic link" option → click it → enter a registered email → send → **Expected result:** A message appears saying "Check your email for the magic link" or similar → **If it fails:** Report "Magic link send option not working"

- [ ] **2.8.2** — **What to do:** Check email inbox for the magic link email → click the link → **Expected result:** Link logs you into DealStage automatically without needing a password → **If it fails:** Report "Magic link not logging in — [error shown]"

---

### 2.9 Logout & Session Management

- [ ] **2.9.1** — **What to do:** While logged in, click the user avatar or profile area → click "Logout" or "Sign out" → **Expected result:** Redirected to the landing page (not an error page, not /login with an error) → **If it fails:** Report "Logout button not working or redirects incorrectly"

- [ ] **2.9.2** — **What to do:** After logging out, try typing https://www.thedealstage.com/Dashboard directly in the browser address bar → **Expected result:** Redirected to the landing page or /login page (not allowed to access Dashboard while logged out) → **If it fails:** Report "Protected routes accessible without login — security issue"

- [ ] **2.9.3** — **What to do:** Log back in after logging out → navigate to Deal Pipeline and check if any deals you created earlier are still there → **Expected result:** All previously created data persists — logout does not delete user data → **If it fails:** Report "Data lost after logout/login cycle"

---

## PHASE 3: FEATURE PAGES — PUBLIC MARKETING SITE

### Every Feature and Company Page Must Load

> These pages are visited by potential customers before they sign up. Broken pages here cost you users and revenue.

---

### 3.1 Features Sub-Pages

- [ ] **3.1.1** — **What to do:** Navigate to https://www.thedealstage.com/features/talent-discovery → **Expected result:** Page loads with a title, description, talent discovery feature overview, talent categories listed, and at least one CTA button → **If it fails:** Report "Talent Discovery feature page not loading — [error or blank]"

- [ ] **3.1.2** — **What to do:** Navigate to https://www.thedealstage.com/features/deal-pipeline → **Expected result:** Page loads with deal pipeline overview, and a section describing deck upload/AI matching capability → **If it fails:** Report "Deal Pipeline feature page not loading"

- [ ] **3.1.3** — **What to do:** Navigate to https://www.thedealstage.com/features/media-kits → **Expected result:** Page loads with media kit features described → **If it fails:** Report "Media Kits feature page not loading"

- [ ] **3.1.4** — **What to do:** Navigate to https://www.thedealstage.com/features/payments → **Expected result:** Page loads describing payment features → **If it fails:** Report "Payments feature page not loading"

- [ ] **3.1.5** — **What to do:** Navigate to https://www.thedealstage.com/features/integrations → **Expected result:** Page loads listing available integrations → **If it fails:** Report "Integrations feature page not loading"

---

### 3.2 Company Pages

- [ ] **3.2.1** — **What to do:** Navigate to https://www.thedealstage.com/About → **Expected result:** About page loads with company story, team, or mission statement content → **If it fails:** Report "About page not loading"

- [ ] **3.2.2** — **What to do:** Navigate to https://www.thedealstage.com/Blog → **Expected result:** Blog page loads with blog posts or at minimum an empty state with the correct layout → **If it fails:** Report "Blog page not loading"

- [ ] **3.2.3** — **What to do:** Navigate to https://www.thedealstage.com/Careers → **Expected result:** Careers page loads (may show open positions or "no positions" state) → **If it fails:** Report "Careers page not loading"

- [ ] **3.2.4** — **What to do:** Navigate to https://www.thedealstage.com/Contact → **Expected result:** Contact page loads with a contact form → **If it fails:** Report "Contact page not loading"

- [ ] **3.2.5** — **What to do:** On the Contact page, fill in the form (name, email, message) and submit → **Expected result:** Form submits successfully and shows a confirmation message. No 500 error → **If it fails:** Report "Contact form submission failing"

- [ ] **3.2.6** — **What to do:** Navigate to https://www.thedealstage.com/Customers → **Expected result:** Customers or case studies page loads → **If it fails:** Report "Customers page not loading"

- [ ] **3.2.7** — **What to do:** Navigate to https://www.thedealstage.com/Demo → **Expected result:** Demo page loads with an interactive tour, embedded demo, or demo booking form → **If it fails:** Report "Demo page not loading"

- [ ] **3.2.8** — **What to do:** If Demo page has an interactive tour, click through it → **Expected result:** Interactive tour works — advancing through steps, clicking elements responds correctly → **If it fails:** Report "Demo interactive tour not working on /Demo page"

---

### 3.3 Legal Pages

- [ ] **3.3.1** — **What to do:** Navigate to https://www.thedealstage.com/CookiePolicy → **Expected result:** Cookie Policy page loads with complete policy text, DealStage branding → **If it fails:** Report "Cookie Policy page not loading"

- [ ] **3.3.2** — **What to do:** Navigate to https://www.thedealstage.com/GDPR → **Expected result:** GDPR compliance page loads with complete content → **If it fails:** Report "GDPR page not loading"

- [ ] **3.3.3** — **What to do:** Navigate to https://www.thedealstage.com/privacy → **Expected result:** Privacy Policy page loads with complete policy → **If it fails:** Report "Privacy Policy page not loading"

- [ ] **3.3.4** — **What to do:** Navigate to https://www.thedealstage.com/terms → **Expected result:** Terms of Service page loads with complete terms → **If it fails:** Report "Terms of Service page not loading"

---

## PHASE 4: ROLE-BASED ACCESS CONTROL

### Users Must Only See What Their Role Allows

> If a free Talent user can access Brand-only or Admin-only pages, that is a security vulnerability and an embarrassing UX failure. Test every role boundary.

---

### 4.1 Talent Access Boundaries

- [ ] **4.1.1** — **What to do:** Log in as a Talent user → count the sidebar navigation items → **Expected result:** Sidebar shows exactly 31 pages — not more, not less → **If it fails:** Report "Talent sidebar shows [X] pages instead of 31"

- [ ] **4.1.2** — **What to do:** As Talent user, try to navigate to /AdminDashboard by typing it directly in the URL bar → **Expected result:** Redirected to the regular /Dashboard (not shown the Admin Dashboard) → **If it fails:** Report "Talent can access Admin Dashboard by direct URL — SECURITY ISSUE"

- [ ] **4.1.3** — **What to do:** As Talent user, try to navigate to /DataManager by direct URL → **Expected result:** Redirected to Dashboard or shown "Access denied" — not shown the data management interface → **If it fails:** Report "Talent can access Data Manager by direct URL — SECURITY ISSUE"

- [ ] **4.1.4** — **What to do:** As Talent user, try to access /SystemHealth by direct URL → **Expected result:** Redirected or access denied → **If it fails:** Report "Talent can access System Health — SECURITY ISSUE"

---

### 4.2 Brand Access Boundaries

- [ ] **4.2.1** — **What to do:** Log in as Brand user → verify sidebar count → **Expected result:** Sidebar shows approximately 38 pages → **If it fails:** Report "Brand sidebar shows [X] pages instead of 38"

- [ ] **4.2.2** — **What to do:** As Brand user, try to access /MyProfile (Talent's personal profile) → **Expected result:** Either redirected or shown a Brand-appropriate profile page (not Talent's profile form) → **If it fails:** Report "Brand user seeing Talent profile page"

- [ ] **4.2.3** — **What to do:** As Brand user, verify "My Opportunities" is accessible → **Expected result:** Loads without error → **If it fails:** Report "Brand 'My Opportunities' inaccessible for brand user"

---

### 4.3 Agency Access Boundaries

- [ ] **4.3.1** — **What to do:** Log in as Agency user → verify sidebar count → **Expected result:** Sidebar shows approximately 37 pages → **If it fails:** Report "Agency sidebar shows [X] pages instead of 37"

- [ ] **4.3.2** — **What to do:** As Agency user, navigate to "Approvals" and "Custom Reports" → **Expected result:** Both pages load — these are Agency-exclusive features → **If it fails:** Report "Agency-exclusive page [page name] not loading for agency user"

---

### 4.4 Admin Access (Full Access)

- [ ] **4.4.1** — **What to do:** Log in as admin (getreachmediallc@gmail.com) → count all sidebar items → **Expected result:** Sidebar shows ALL pages (52+), including Admin Dashboard, Data Manager, System Health, AI Analytics → **If it fails:** Report "Admin user not seeing all pages — sidebar count is [X]"

- [ ] **4.4.2** — **What to do:** As admin, look for any trial expired banner or locked feature modal → **Expected result:** NO trial banners, NO locked features, NO upgrade prompts for admin → **If it fails:** Report "Admin account showing trial/upgrade restrictions — should bypass all gates"

---

## PHASE 5: FEATURE GATING (FREE VS PAID)

### Revenue Depends On This Working Correctly

> If free users can access everything you have no upgrade incentive. If paid users are blocked from things they paid for, you get refund requests. Test both directions.

---

### 5.1 Free Tier Gating

- [ ] **5.1.1** — **What to do:** Log in as the free Talent user created in Phase 2 → try to access "Match Engine" → **Expected result:** An upgrade modal appears saying something like "This feature requires the Rising plan" — does NOT show the Match Engine interface → **If it fails:** Report "Free user can access Match Engine without upgrading — revenue leak"

- [ ] **5.1.2** — **What to do:** As free Talent user, try to access "Contact Finder" → **Expected result:** Upgrade modal appears → **If it fails:** Report "Free user can access Contact Finder — revenue leak"

- [ ] **5.1.3** — **What to do:** As free Talent user, try to access "AI Command Center" → **Expected result:** Upgrade modal appears → **If it fails:** Report "Free user can access AI Command Center — revenue leak"

- [ ] **5.1.4** — **What to do:** As free Talent user, click the upgrade modal's "View plans" or "Upgrade" button → **Expected result:** Navigates to /Subscriptions page showing all available plans → **If it fails:** Report "Upgrade modal CTA button not navigating to subscriptions page"

- [ ] **5.1.5** — **What to do:** As free Talent user, try to create a second deal in Deal Pipeline (free tier allows 1) → **Expected result:** After creating the first deal, attempting to create a second one shows an upgrade prompt → **If it fails:** Report "Free tier deal limit not enforced — free users can create unlimited deals"

---

### 5.2 Trial Period

- [ ] **5.2.1** — **What to do:** Log in as a brand new user within their 7-day trial → navigate to Match Engine → **Expected result:** Match Engine is accessible (trial users get paid-tier access) → **If it fails:** Report "Trial users blocked from Match Engine — trial access not working"

- [ ] **5.2.2** — **What to do:** For testing: if possible, view a user account created more than 7 days ago with a free plan → check for trial expired banner → **Expected result:** "Trial expired" or "Your trial has ended" banner appears at the top of the Dashboard → **If it fails:** Report "Trial expiration banner not showing for expired trial users"

---

---

## PHASE 6: CORE FEATURE TESTING

### The Main Product — What Users Came For

> These 7+ features are the reason users choose DealStage over spreadsheets. Every one must work end-to-end.

---

### 6.1 AI Match Engine

- [ ] **6.1.1** — **What to do:** Navigate to Match Engine → verify the brand dropdown populates → **Expected result:** Brand dropdown shows a list of brands including the 25 seeded brands (Nike, Spotify, etc.) → **If it fails:** Report "Match Engine brand dropdown empty — seeded brands not loading"

- [ ] **6.1.2** — **What to do:** In Match Engine, verify the talent dropdown populates → **Expected result:** Talent dropdown shows talent profiles including Jordan Reeves, Mia Chen, etc. → **If it fails:** Report "Match Engine talent dropdown empty — seeded talent not loading"

- [ ] **6.1.3** — **What to do:** Select "Nike" as the brand and "Jordan Reeves" as the talent → click "Run Match" → **Expected result:** AI returns a match score (0-100) with a 10-factor breakdown visible (audience alignment, engagement rate, brand safety, etc.) within 10 seconds → **If it fails:** Report "AI Match Engine not returning results for Nike + Jordan Reeves"

- [ ] **6.1.4** — **What to do:** While the match is running, observe the UI → **Expected result:** A loading spinner or "Analyzing..." state appears during processing. No frozen/blank screen → **If it fails:** Report "Match Engine has no loading state — UI freezes while waiting for AI"

- [ ] **6.1.5** — **What to do:** Read the match result → **Expected result:** Result is coherent and relevant — score makes sense for the pairing (a fitness creator should match well with Nike), no "Unexpected response" or TypeError shown → **If it fails:** Report "Match Engine returns gibberish or error message instead of real score"

---

### 6.2 Pitch Deck Builder

- [ ] **6.2.1** — **What to do:** Navigate to Pitch Deck Builder → select a talent profile from the dropdown (e.g., Jordan Reeves) → click "Generate" or "Create Deck" → **Expected result:** AI generates pitch deck content with sections for audience overview, engagement stats, collaboration opportunities, and rate card within 10 seconds → **If it fails:** Report "Pitch Deck Builder AI not generating content"

- [ ] **6.2.2** — **What to do:** After generation, look for a download or export option → **Expected result:** A button exists to download or export the pitch deck (PDF, PPT, or similar) → **If it fails:** Report "Pitch Deck Builder has no export/download option after generation"

---

### 6.3 Campaign Brief Generator

- [ ] **6.3.1** — **What to do:** Navigate to Campaign Briefs → fill in campaign details (brand: Nike, goal: awareness, budget: $50K, timeline: Q2 2026) → click "Generate" → **Expected result:** AI creates a structured campaign brief with sections for objectives, target audience, content guidelines, deliverables, and KPIs → **If it fails:** Report "Campaign Brief Generator not producing content"

- [ ] **6.3.2** — **What to do:** After generation, verify the content makes sense → **Expected result:** Brief mentions Nike, awareness goals, and is formatted as a professional document — not placeholder text or error messages → **If it fails:** Report "Campaign Brief content is generic/irrelevant to input"

---

### 6.4 Outreach AI

- [ ] **6.4.1** — **What to do:** Navigate to Outreach → select a contact from the Contact Finder (e.g., Sarah Chen at Nike) → click "AI Generate" or "Write with AI" → **Expected result:** AI generates a personalized outreach message mentioning the contact's name, company, and a relevant value proposition → **If it fails:** Report "Outreach AI not generating a message"

- [ ] **6.4.2** — **What to do:** Read the generated outreach message → **Expected result:** Message is professional, personalized (uses Sarah Chen's name and Nike), and relevant — not a generic template with unfilled [PLACEHOLDER] fields → **If it fails:** Report "Outreach AI generating generic messages without personalization"

---

### 6.5 Sequence Builder AI

- [ ] **6.5.1** — **What to do:** Navigate to Sequences → click "Create New Sequence" → name it "Nike Outreach Sequence" → click "AI Generate Step" → **Expected result:** AI generates a complete sequence step with subject line and message body → **If it fails:** Report "Sequence Builder AI step generation not working"

- [ ] **6.5.2** — **What to do:** After generating a step, add another step using AI → **Expected result:** Second step generates successfully and is contextually different from step 1 (follow-up tone) → **If it fails:** Report "Sequence Builder AI failing on second step"

---

### 6.6 Contract Templates AI

- [ ] **6.6.1** — **What to do:** Navigate to Contract Templates → select a template (e.g., Sponsorship Agreement) → click "AI Suggest" or "Fill with AI" → **Expected result:** AI fills in suggested values for key fields (deliverables, payment terms, exclusivity period) based on the template type → **If it fails:** Report "Contract Templates AI Suggest not filling in values"

---

### 6.7 AI Command Center

- [ ] **6.7.1** — **What to do:** Navigate to AI Command Center → in the input field, type: "Find the best fitness creators for a Nike campaign" → press Enter or click Send → **Expected result:** AI responds with a list of relevant talent profiles or recommendations. Response is relevant to the query → **If it fails:** Report "AI Command Center not responding to talent search query"

- [ ] **6.7.2** — **What to do:** Type: "What deals are in my pipeline right now?" → **Expected result:** AI either queries the database and returns deal information OR explains it can't access pipeline data but gives guidance — should not return an error → **If it fails:** Report "AI Command Center crashes on pipeline query"

- [ ] **6.7.3** — **What to do:** Type: "Help me write an outreach email to Spotify" → **Expected result:** AI drafts a professional outreach email template relevant to Spotify partnerships → **If it fails:** Report "AI Command Center not helping with email drafting"

---

### 6.8 Deal Pipeline — Full Flow

- [ ] **6.8.1** — **What to do:** Navigate to Deal Pipeline → click "+ New Deal" button → **Expected result:** A new deal creation wizard or modal opens → **If it fails:** Report "New Deal button not opening creation wizard"

- [ ] **6.8.2** — **What to do:** In the deal wizard, fill in: Title = "Nike × Jordan Reeves", Value = $85,000, Type = Sponsorship, Brand = Nike, Talent = Jordan Reeves → click Save/Create → **Expected result:** New deal card appears in the Kanban board under the "Discovered" column → **If it fails:** Report "Deal creation wizard not saving deal to pipeline"

- [ ] **6.8.3** — **What to do:** After creating the deal, check the pipeline header or stats area → **Expected result:** Pipeline total value updates to include the new $85K deal → **If it fails:** Report "Pipeline value not updating after deal creation"

- [ ] **6.8.4** — **What to do:** Switch the Deal Pipeline to "List view" (if there's a toggle for Kanban vs List) → **Expected result:** Deals are shown in a table/list format instead of the Kanban board → **If it fails:** Report "Deal Pipeline list view toggle not working"

- [ ] **6.8.5** — **What to do:** Switch back to "Pipeline view" (Kanban) → confirm the view switches back → **Expected result:** Kanban board view restores correctly → **If it fails:** Report "Deal Pipeline unable to switch back to Kanban view"

- [ ] **6.8.6** — **What to do:** On the Nike × Jordan Reeves deal card, find the stage dropdown or drag the card → move the deal to "Research" stage → **Expected result:** Deal moves to the Research column (or stage updates in list view) → **If it fails:** Report "Deal not moving to Research stage"

- [ ] **6.8.7** — **What to do:** Move the deal through ALL 8 stages in sequence: Discovered → Research → Outreach Pending → Outreach Sent → Responded → Negotiating → Contracted → Active → **Expected result:** Deal moves through each stage correctly, stage label updates each time → **If it fails:** Report "Deal stuck at [stage name] — cannot advance to next stage"

- [ ] **6.8.8** — **What to do:** Click on the deal card to open the DealDetail page → **Expected result:** DealDetail page loads with deal name, value, stage, brand, talent, and deal timeline visible → **If it fails:** Report "DealDetail page not loading from deal card click"

- [ ] **6.8.9** — **What to do:** On the DealDetail page, click the back button or breadcrumb to return to the pipeline → **Expected result:** Returns to the Deal Pipeline with the pipeline still showing all deals → **If it fails:** Report "Back navigation from DealDetail page broken"

- [ ] **6.8.10** — **What to do:** On the DealDetail page, click "Upload Deck for AI Matching" button → **Expected result:** File upload dialog opens → **If it fails:** Report "Deck upload button on DealDetail not opening file dialog"

- [ ] **6.8.11** — **What to do:** Upload any PDF file (even a sample PDF) → **Expected result:** AI processes the deck and returns match results (brand recommendations, talent recommendations, or compatibility scores) within 15 seconds → **If it fails:** Report "Deck upload AI matching not returning results after PDF upload"

---

### 6.9 Onboarding Wizard for New Users

- [ ] **6.9.1** — **What to do:** Create a BRAND NEW account (never logged in before) → log in for the first time → **Expected result:** The onboarding wizard appears automatically on first login → **If it fails:** Report "Onboarding wizard not appearing for new users"

- [ ] **6.9.2** — **What to do:** Complete Step 1 of the wizard (Complete profile — add name, bio, role details) → **Expected result:** Step 1 saves and advances to Step 2 without error → **If it fails:** Report "Onboarding wizard Step 1 not saving"

- [ ] **6.9.3** — **What to do:** Complete Step 2 (Connect accounts — shows platform catalog) → **Expected result:** Platform options are visible, can select or skip → **If it fails:** Report "Onboarding wizard Step 2 not showing platforms"

- [ ] **6.9.4** — **What to do:** Complete Step 3 (Set preferences — role-specific options) → **Expected result:** Role-appropriate preference options display and can be set → **If it fails:** Report "Onboarding wizard Step 3 not showing preferences"

- [ ] **6.9.5** — **What to do:** Complete Step 4 (Final step — "You're all set!") → **Expected result:** Confetti animation plays and quick start cards appear (e.g., "Create your first deal", "Connect Instagram") → **If it fails:** Report "Onboarding wizard Step 4 not showing completion screen with confetti"

- [ ] **6.9.6** — **What to do:** Dismiss the wizard → log out → log back in → **Expected result:** Onboarding wizard does NOT reappear (completion state is persisted) → **If it fails:** Report "Onboarding wizard reappears every login — completion not being saved"

---

### 6.10 Connect Accounts & ID Verification

- [ ] **6.10.1** — **What to do:** Navigate to Connect Accounts → **Expected result:** Platform catalog loads showing 88 platforms grouped in category tabs (Content & Video, Photo & Social, Music, etc.) → **If it fails:** Report "Connect Accounts showing [X] platforms instead of 88"

- [ ] **6.10.2** — **What to do:** Click each category tab (Content & Video, Photo & Social, Music, Podcasts, etc.) → **Expected result:** Each tab filters to show platforms in that category → **If it fails:** Report "Connect Accounts category tab [tab name] not filtering"

- [ ] **6.10.3** — **What to do:** Type "Instagram" into the Connect Accounts search box → **Expected result:** Instagram appears in the filtered results → **If it fails:** Report "Connect Accounts search not finding Instagram"

- [ ] **6.10.4** — **What to do:** Click "Connect" on Instagram → **Expected result:** OAuth dialog or connection modal opens. A yellow banner should appear reading "Real OAuth Coming Soon" (since Phyllo is not yet configured) → **If it fails:** Report "Instagram connect button not opening dialog or showing wrong messaging"

- [ ] **6.10.5** — **What to do:** In the Instagram connection dialog, enter a username → click Connect → **Expected result:** Instagram shows as "Connected" status in the platform grid → **If it fails:** Report "Simulated Instagram connection not saving 'Connected' status"

- [ ] **6.10.6** — **What to do:** Scroll down to the ID Verification section on Connect Accounts → **Expected result:** Identity Verification section is visible with an upload prompt → **If it fails:** Report "ID Verification section not visible on Connect Accounts page"

- [ ] **6.10.7** — **What to do:** Upload a test image file (any JPG or PNG) as the ID document → click "Submit for Review" → **Expected result:** Status changes to "Under Review" → **If it fails:** Report "ID verification upload not changing status to Under Review"

- [ ] **6.10.8** — **What to do:** After submitting ID verification, check the verification boost score → **Expected result:** Verification score increases or a boost indicator appears → **If it fails:** Report "Verification boost score not updating after ID submission"

---

### 6.11 Master Calendar

- [ ] **6.11.1** — **What to do:** Navigate to Master Calendar → wait for it to fully load → **Expected result:** Calendar displays events. The total event count should be 486 → **If it fails:** Report "Master Calendar showing [X] events instead of 486"

- [ ] **6.11.2** — **What to do:** Filter the Master Calendar by year (e.g., select 2026) → **Expected result:** Calendar updates to show only 2026 events → **If it fails:** Report "Master Calendar year filter not working"

- [ ] **6.11.3** — **What to do:** Filter by category → select "Sports" → **Expected result:** Only sports-related events show (Super Bowl, NBA Playoffs, Olympics, etc.) → **If it fails:** Report "Master Calendar Sports category filter not working"

- [ ] **6.11.4** — **What to do:** Filter by tier (e.g., Tier 1) → **Expected result:** Only Tier 1 events show → **If it fails:** Report "Master Calendar tier filter not working"

- [ ] **6.11.5** — **What to do:** In the Master Calendar search box, type "Super Bowl" → **Expected result:** Super Bowl event(s) appear in results → **If it fails:** Report "Master Calendar search not finding 'Super Bowl' — event may not be in the seeded data"

- [ ] **6.11.6** — **What to do:** Click on any calendar event → **Expected result:** Event detail view opens with name, date, category, description, and relevant brand/talent suggestions → **If it fails:** Report "Calendar event click not opening event detail"

---

### 6.12 Culture Calendar

- [ ] **6.12.1** — **What to do:** Navigate to Culture Calendar from the sidebar → **Expected result:** Culture Calendar page loads with culture-specific events (holidays, cultural moments, awareness months, etc.) → **If it fails:** Report "Culture Calendar page not loading"

- [ ] **6.12.2** — **What to do:** Check that Culture Calendar events are different from Master Calendar events → **Expected result:** Events shown are culture/lifestyle focused, not just sports/broadcast events → **If it fails:** Report "Culture Calendar appears to show same events as Master Calendar"

---

### 6.13 Settings

- [ ] **6.13.1** — **What to do:** Navigate to Settings → **Expected result:** Settings page loads with multiple sections: Profile, Appearance, Notifications, Manager, Account → **If it fails:** Report "Settings page not loading"

- [ ] **6.13.2** — **What to do:** In the Profile section, change the display name to "Test User Updated" → click Save → **Expected result:** Success message appears, name updates in the sidebar/header → **If it fails:** Report "Settings profile save not working"

- [ ] **6.13.3** — **What to do:** Log out and log back in → go back to Settings → check display name → **Expected result:** Updated name ("Test User Updated") persists after logout/login → **If it fails:** Report "Settings profile changes not persisting after logout"

- [ ] **6.13.4** — **What to do:** In the Appearance section, find the ThemeSwitcher → change from Dark to Gradient theme → **Expected result:** App theme visually changes to the gradient variant → **If it fails:** Report "Theme switcher not changing app appearance"

- [ ] **6.13.5** — **What to do:** As a Talent user in Settings, find the "My Manager" section → enter a test email → click "Send Invite" → **Expected result:** Success message appears confirming invite was sent → **If it fails:** Report "Manager invite sending not working"

- [ ] **6.13.6** — **What to do:** In Settings, click "Generate Invite Link" → **Expected result:** A shareable invite link is generated and copied to clipboard (confirm with a toast message like "Link copied!") → **If it fails:** Report "Generate Invite Link not working or not copying to clipboard"

---

## PHASE 7: DATA PERSISTENCE & INTEGRITY

### Data Must Survive Refresh, Logout, and Navigation

---

### 7.1 Create and Verify Persistence

- [ ] **7.1.1** — **What to do:** Create a new deal in the pipeline → refresh the page (F5 or Cmd+R) → **Expected result:** The newly created deal still appears in the pipeline → **If it fails:** Report "Deal disappears after page refresh — not being saved to database"

- [ ] **7.1.2** — **What to do:** Move a deal from "Discovered" to "Negotiating" → refresh the page → **Expected result:** Deal shows in the Negotiating column after refresh → **If it fails:** Report "Deal stage change not persisting after refresh"

- [ ] **7.1.3** — **What to do:** Edit your profile in Settings (change name) → log out → log back in → go to Settings → **Expected result:** Name change is preserved → **If it fails:** Report "Profile changes not persisting after logout/login cycle"

- [ ] **7.1.4** — **What to do:** Connect a social account (Instagram) → refresh the page → **Expected result:** Instagram still shows as "Connected" → **If it fails:** Report "Connected account status not persisting after refresh"

---

### 7.2 Empty State UX

- [ ] **7.2.1** — **What to do:** Log in as a BRAND NEW user who has no deals → navigate to Deal Pipeline → **Expected result:** A helpful empty state appears: "No deals yet" message with a CTA to create the first deal — NOT a blank/white screen or JavaScript error → **If it fails:** Report "Deal Pipeline empty state showing blank screen instead of helpful message"

- [ ] **7.2.2** — **What to do:** As a new user, navigate to Outreach → **Expected result:** Page shows a helpful empty state ("No outreach yet" or similar) with a getting-started CTA → **If it fails:** Report "Outreach empty state showing blank or error"

- [ ] **7.2.3** — **What to do:** As a new user, navigate to Connect Accounts → **Expected result:** Shows onboarding prompt encouraging the user to connect their first account → **If it fails:** Report "Connect Accounts empty state not showing onboarding prompt"

---

### 7.3 Form Validation

- [ ] **7.3.1** — **What to do:** Try creating a deal with the title field empty → click Save → **Expected result:** Form validation shows an error message like "Title is required" — does NOT submit or crash → **If it fails:** Report "Deal creation allows empty title — no form validation"

- [ ] **7.3.2** — **What to do:** Try signing up with an invalid email format (e.g., "notanemail") → **Expected result:** Form shows "Please enter a valid email address" error → **If it fails:** Report "Signup form accepts invalid email format"

- [ ] **7.3.3** — **What to do:** Try signing up with a password of only 4 characters → **Expected result:** Form shows a password requirement error → **If it fails:** Report "Signup allows passwords under minimum length"

- [ ] **7.3.4** — **What to do:** Try submitting any major form completely empty → **Expected result:** All required fields show validation errors, form does not submit → **If it fails:** Report "Empty form submission not showing validation errors — form crashes on submit"

---

## PHASE 8: DATA SEEDING — ADMIN DATA MANAGER

### Real Data Must Exist Before Features Can Be Tested Meaningfully

> This phase is about using the Admin Data Manager to seed the app with test data. Run this before testing features if data is not already present.

---

### 8.1 Brand Data

- [ ] **8.1.1** — **What to do:** Log in as admin → navigate to Data Manager → click the "Brands" tab → **Expected result:** Brands tab loads with the brand data grid visible → **If it fails:** Report "Data Manager Brands tab not loading"

- [ ] **8.1.2** — **What to do:** Click "Add Brand" or equivalent → fill in: Name = Nike, Website = nike.com, Industry = Sports/Apparel, Size = 10000+, Location = Portland OR, Budget = $50M+ → save → **Expected result:** Nike appears in the brands list → **If it fails:** Report "Adding brand via Data Manager not saving"

- [ ] **8.1.3** — **What to do:** Verify the Brands page (not Data Manager) shows the newly added brand → navigate to /Brands → **Expected result:** Nike appears in the Brands discovery page → **If it fails:** Report "Brand added via Data Manager not appearing in Brands page"

- [ ] **8.1.4** — **What to do:** Upload a sample CSV file with multiple brands in the Data Manager → use the CSV import feature → **Expected result:** CSV imports successfully and multiple brands appear in the list at once → **If it fails:** Report "Data Manager CSV import for brands not working"

- [ ] **8.1.5** — **What to do:** In Data Manager → Brands tab → click "Export CSV" or equivalent export button → **Expected result:** A CSV file downloads containing the brand data → **If it fails:** Report "Data Manager brands CSV export not downloading"

---

### 8.2 Contact Data

- [ ] **8.2.1** — **What to do:** In Data Manager, click the "Contacts" tab → **Expected result:** Contacts tab loads → **If it fails:** Report "Data Manager Contacts tab not loading"

- [ ] **8.2.2** — **What to do:** Add a contact: Name = Sarah Chen, Title = Influencer Marketing Manager, Company = Nike, Email = sarah.chen@nike.com, Tier = Tier 1 → save → **Expected result:** Sarah Chen appears in the contacts list → **If it fails:** Report "Adding contact via Data Manager not saving"

- [ ] **8.2.3** — **What to do:** Navigate to Contact Finder page (/ContactFinder) → **Expected result:** Sarah Chen (and other seeded contacts) appear in the Contact Finder → **If it fails:** Report "Contact added via Data Manager not appearing in Contact Finder"

- [ ] **8.2.4** — **What to do:** Test CSV import for contacts with a sample contacts CSV file → **Expected result:** Multiple contacts import at once → **If it fails:** Report "Data Manager CSV import for contacts not working"

- [ ] **8.2.5** — **What to do:** Test CSV export for contacts from Data Manager → **Expected result:** CSV file downloads with contact data → **If it fails:** Report "Data Manager contacts CSV export not downloading"

---

### 8.3 Talent Data

- [ ] **8.3.1** — **What to do:** In Data Manager (or admin interface), add a talent profile: Jordan Reeves, Fitness/Athlete, 180K Instagram followers, 6.8% engagement → **Expected result:** Jordan Reeves profile is created and appears in the Talent Discovery page → **If it fails:** Report "Admin talent creation not appearing in Talent Discovery"

- [ ] **8.3.2** — **What to do:** Navigate to Talent Discovery → count the talent profiles → **Expected result:** At minimum 18 talent profiles visible (including the seeded ones) → **If it fails:** Report "Talent Discovery showing [X] profiles instead of 18+"

---

## PHASE 9: STRIPE & PAYMENTS

### Revenue Must Flow

> If Stripe checkout is broken, you can't earn revenue. Test the complete upgrade flow.

---

### 9.1 Pricing Display

- [ ] **9.1.1** — **What to do:** Navigate to /Subscriptions as a free Talent user → **Expected result:** All 4 Talent plans displayed with correct prices: Starter (Free), Rising ($99/mo), Pro ($199/mo), Elite ($499/mo) → **If it fails:** Report "Subscriptions page showing wrong plans or wrong prices for Talent"

- [ ] **9.1.2** — **What to do:** Navigate to the pricing section on the landing page for Brands → **Expected result:** Brand plans show correct prices: Explorer (Free), Growth ($299/mo), Scale ($799/mo), Enterprise ($2,499/mo) → **If it fails:** Report "Brand pricing incorrect on landing page"

- [ ] **9.1.3** — **What to do:** Check the annual pricing for any plan (if toggle exists) → **Expected result:** Annual prices are approximately 20-25% less than monthly equivalent → **If it fails:** Report "Annual pricing not correctly discounted vs monthly"

- [ ] **9.1.4** — **What to do:** Check paid plan cards for the 7-day free trial badge → **Expected result:** Paid plans clearly show "7-day free trial" or "Try free for 7 days" → **If it fails:** Report "7-day free trial badge missing from paid plan cards"

---

### 9.2 Upgrade Flow

- [ ] **9.2.1** — **What to do:** As a free Talent user, click "Upgrade" on the Rising plan ($99/mo) → **Expected result:** Stripe checkout page loads (stripe.com/checkout URL) with the correct plan name and price visible → **If it fails:** Report "Stripe checkout not loading when clicking Upgrade — [error shown]"

- [ ] **9.2.2** — **What to do:** On the Stripe checkout page, enter test card number: 4242 4242 4242 4242, expiry: 12/29, CVC: 123 → click Pay → **Expected result:** Payment succeeds and you're redirected back to DealStage with the plan upgraded → **If it fails:** Report "Stripe test payment failing — [error from Stripe]"

- [ ] **9.2.3** — **What to do:** After successful test payment, navigate to Subscriptions page → **Expected result:** Plan now shows "Rising" (not "Free") and billing date is visible → **If it fails:** Report "Plan not updating after successful Stripe payment"

---

### 9.3 Billing & Subscription Management

- [ ] **9.3.1** — **What to do:** Navigate to the Billing page → **Expected result:** Page loads without errors, showing either payment history or an appropriate empty state for new accounts → **If it fails:** Report "Billing page not loading"

- [ ] **9.3.2** — **What to do:** Navigate to the Subscriptions page → look for "Change Plan" or "Manage Subscription" button → **Expected result:** Button is present and visible → **If it fails:** Report "No Change Plan button on Subscriptions page"

---

## PHASE 10: ALL PAGES CLICK-THROUGH

### Nothing Should Crash — Every Page Must Load

> This is an exhaustive page load test. Open every single page and verify it renders without a white screen of death or JavaScript error. Mark each: ✅ Loads | ⚠️ Issues | ❌ Crash

---

### 10.1 Core Pages

- [ ] **10.1.1** — **What to do:** Navigate to Dashboard → **Expected result:** Loads with stats cards showing real numbers (not all zeros), recent activity, and navigation → **If it fails:** Report "Dashboard blank or showing all-zero stats"

- [ ] **10.1.2** — **What to do:** Navigate to Admin Dashboard → **Expected result:** Loads with platform-wide metrics (total users, total deals, AI usage stats) → **If it fails:** Report "Admin Dashboard not loading"

- [ ] **10.1.3** — **What to do:** Navigate to Data Manager → **Expected result:** Loads with switchable tabs for Brands, Contacts, Deals, and Talent → **If it fails:** Report "Data Manager not loading"

- [ ] **10.1.4** — **What to do:** Navigate to Marketplace → **Expected result:** Loads with content (opportunities, listings, or talent cards) → **If it fails:** Report "Marketplace not loading"

- [ ] **10.1.5** — **What to do:** Navigate to My Profile → **Expected result:** Profile form loads with user's current info → **If it fails:** Report "My Profile not loading"

- [ ] **10.1.6** — **What to do:** Navigate to My Opportunities → **Expected result:** Page loads (may be empty for new users) → **If it fails:** Report "My Opportunities not loading"

---

### 10.2 Discovery & Matching

- [ ] **10.2.1** — **What to do:** Navigate to Talent Discovery → **Expected result:** Loads with 18 talent profiles visible in the grid → **If it fails:** Report "Talent Discovery not loading or showing wrong talent count"

- [ ] **10.2.2** — **What to do:** Navigate to Match Engine → **Expected result:** Loads with brand dropdown and talent dropdown both populated → **If it fails:** Report "Match Engine not loading or dropdowns empty"

- [ ] **10.2.3** — **What to do:** Navigate to Brands → **Expected result:** Loads with 25 brands in the list/grid → **If it fails:** Report "Brands page not loading or showing [X] brands instead of 25"

- [ ] **10.2.4** — **What to do:** Navigate to Market Intelligence → **Expected result:** Page loads with market data, trends, or insights → **If it fails:** Report "Market Intelligence not loading"

---

### 10.3 Outreach Pages

- [ ] **10.3.1** — **What to do:** Navigate to Contact Finder → **Expected result:** Loads with 10 seeded contacts visible → **If it fails:** Report "Contact Finder not loading or showing [X] contacts instead of 10"

- [ ] **10.3.2** — **What to do:** Navigate to Outreach → **Expected result:** Page loads with outreach management interface → **If it fails:** Report "Outreach page not loading"

- [ ] **10.3.3** — **What to do:** Navigate to Sequences → **Expected result:** Sequence builder/list loads → **If it fails:** Report "Sequences page not loading"

- [ ] **10.3.4** — **What to do:** Navigate to Warm Intro Network → **Expected result:** Page loads → **If it fails:** Report "Warm Intro Network not loading"

- [ ] **10.3.5** — **What to do:** Navigate to Demographic Targeting → **Expected result:** Page loads with targeting options → **If it fails:** Report "Demographic Targeting not loading"

---

### 10.4 Deal Pages

- [ ] **10.4.1** — **What to do:** Navigate to Deal Pipeline → **Expected result:** Kanban board loads with stage columns visible → **If it fails:** Report "Deal Pipeline not loading"

- [ ] **10.4.2** — **What to do:** Navigate to Deal Analytics → **Expected result:** Page loads with charts or analytics data → **If it fails:** Report "Deal Analytics not loading"

- [ ] **10.4.3** — **What to do:** Navigate to Deal Comparison → **Expected result:** Page loads → **If it fails:** Report "Deal Comparison not loading"

- [ ] **10.4.4** — **What to do:** Navigate to Deal Score Leaderboard → **Expected result:** Page loads with leaderboard data → **If it fails:** Report "Deal Score Leaderboard not loading"

- [ ] **10.4.5** — **What to do:** Navigate to Bundle Deals → **Expected result:** Page loads → **If it fails:** Report "Bundle Deals not loading"

- [ ] **10.4.6** — **What to do:** Navigate to Contract Templates → **Expected result:** Page loads with a list of templates available → **If it fails:** Report "Contract Templates not loading"

- [ ] **10.4.7** — **What to do:** Navigate to Approvals → **Expected result:** Page loads (may be empty for new accounts) → **If it fails:** Report "Approvals page not loading"

---

### 10.5 Content Pages

- [ ] **10.5.1** — **What to do:** Navigate to Campaign Briefs → **Expected result:** Page loads with brief creation interface → **If it fails:** Report "Campaign Briefs not loading"

- [ ] **10.5.2** — **What to do:** Navigate to Pitch Deck Builder → **Expected result:** Page loads with talent selector and generation interface → **If it fails:** Report "Pitch Deck Builder not loading"

- [ ] **10.5.3** — **What to do:** Navigate to Deck Library → **Expected result:** Page loads (may be empty or show previously saved decks) → **If it fails:** Report "Deck Library not loading"

- [ ] **10.5.4** — **What to do:** Navigate to Pitch Competition → **Expected result:** Page loads → **If it fails:** Report "Pitch Competition not loading"

---

### 10.6 Analytics Pages

- [ ] **10.6.1** — **What to do:** Navigate to Analytics → **Expected result:** Page loads with charts, graphs, or summary metrics → **If it fails:** Report "Analytics page not loading"

- [ ] **10.6.2** — **What to do:** Navigate to Talent Analytics → **Expected result:** Page loads → **If it fails:** Report "Talent Analytics not loading"

- [ ] **10.6.3** — **What to do:** Navigate to Talent Revenue → **Expected result:** Page loads → **If it fails:** Report "Talent Revenue not loading"

- [ ] **10.6.4** — **What to do:** Navigate to Custom Reports → **Expected result:** Page loads with report builder or saved reports → **If it fails:** Report "Custom Reports not loading"

- [ ] **10.6.5** — **What to do:** Navigate to Spend Prediction → **Expected result:** Page loads → **If it fails:** Report "Spend Prediction not loading"

- [ ] **10.6.6** — **What to do:** Navigate to ROI Simulator → **Expected result:** Page loads with input fields for ROI calculation → **If it fails:** Report "ROI Simulator not loading"

---

### 10.7 AI Pages

- [ ] **10.7.1** — **What to do:** Navigate to AI Features → **Expected result:** Page loads with feature cards showing all AI capabilities → **If it fails:** Report "AI Features page not loading"

- [ ] **10.7.2** — **What to do:** Navigate to AI Agents Hub → **Expected result:** Page loads showing all AI agents with their status (working/inactive) → **If it fails:** Report "AI Agents Hub not loading"

- [ ] **10.7.3** — **What to do:** Navigate to AI Command Center → **Expected result:** Page loads with the conversational AI input field → **If it fails:** Report "AI Command Center not loading"

- [ ] **10.7.4** — **What to do:** Navigate to AI Analytics → **Expected result:** Page loads with AI usage statistics and metrics → **If it fails:** Report "AI Analytics not loading"

---

### 10.8 Data Room Pages

- [ ] **10.8.1** — **What to do:** Navigate to Data Room (Talent) → **Expected result:** Page loads → **If it fails:** Report "Data Room Talent not loading"

- [ ] **10.8.2** — **What to do:** Navigate to Data Room (Brand) → **Expected result:** Page loads → **If it fails:** Report "Data Room Brand not loading"

- [ ] **10.8.3** — **What to do:** Navigate to Data Room (Agency) → **Expected result:** Page loads → **If it fails:** Report "Data Room Agency not loading"

- [ ] **10.8.4** — **What to do:** Navigate to Data Import/Export → **Expected result:** Page loads with import and export options → **If it fails:** Report "Data Import/Export page not loading"

---

### 10.9 Calendar Pages

- [ ] **10.9.1** — **What to do:** Navigate to Master Calendar → **Expected result:** Loads with all 486 events showing → **If it fails:** Report "Master Calendar showing wrong event count"

- [ ] **10.9.2** — **What to do:** Navigate to Culture Calendar → **Expected result:** Page loads with culture events → **If it fails:** Report "Culture Calendar not loading"

- [ ] **10.9.3** — **What to do:** Navigate to Event Management → **Expected result:** Page loads with event management interface → **If it fails:** Report "Event Management not loading"

---

### 10.10 Account Pages

- [ ] **10.10.1** — **What to do:** Navigate to Connect Accounts → **Expected result:** Loads with 88 platforms in the catalog → **If it fails:** Report "Connect Accounts not loading or showing wrong platform count"

- [ ] **10.10.2** — **What to do:** Navigate to Integrations → **Expected result:** Loads with integration categories and third-party connections → **If it fails:** Report "Integrations page not loading"

- [ ] **10.10.3** — **What to do:** Navigate to Referrals → **Expected result:** Page loads with referral link and stats → **If it fails:** Report "Referrals page not loading"

- [ ] **10.10.4** — **What to do:** Navigate to Teams → **Expected result:** Page loads with team member management → **If it fails:** Report "Teams page not loading"

- [ ] **10.10.5** — **What to do:** Navigate to Notifications → **Expected result:** Page loads with notification list or settings → **If it fails:** Report "Notifications page not loading"

- [ ] **10.10.6** — **What to do:** Navigate to Subscriptions → **Expected result:** Page loads with current plan and upgrade options → **If it fails:** Report "Subscriptions page not loading"

- [ ] **10.10.7** — **What to do:** Navigate to Billing → **Expected result:** Page loads with payment history or empty state → **If it fails:** Report "Billing page not loading"

- [ ] **10.10.8** — **What to do:** Navigate to Settings → **Expected result:** Loads with all sections (Profile, Appearance, Notifications, Manager) → **If it fails:** Report "Settings page not loading"

---

### 10.11 System Pages (Admin Only)

- [ ] **10.11.1** — **What to do:** Navigate to System Health → **Expected result:** Loads with service status indicators (Supabase, Vercel, Stripe, AI providers — all should show green/healthy) → **If it fails:** Report "System Health not loading or showing service failures"

- [ ] **10.11.2** — **What to do:** Navigate to System Architecture → **Expected result:** Page loads with architecture diagram or technical overview → **If it fails:** Report "System Architecture not loading"

- [ ] **10.11.3** — **What to do:** Navigate to Platform Overview → **Expected result:** Page loads with platform metrics and stats overview → **If it fails:** Report "Platform Overview not loading"

---

## PHASE 11: SEARCH, FILTERS & SORTING

### Users Must Be Able to Find Things

---

### 11.1 Search Functionality

- [ ] **11.1.1** — **What to do:** In Deal Pipeline, type a deal name in the search box → **Expected result:** Deals filter in real-time to show only matching deals → **If it fails:** Report "Deal Pipeline search not filtering deals"

- [ ] **11.1.2** — **What to do:** In Talent Discovery, type "Jordan" in the search box → **Expected result:** Only talent profiles with "Jordan" in the name appear → **If it fails:** Report "Talent Discovery search not filtering by name"

- [ ] **11.1.3** — **What to do:** In Contact Finder, type "Nike" in the search box → **Expected result:** Only contacts from Nike appear in the filtered results → **If it fails:** Report "Contact Finder search by company not working"

- [ ] **11.1.4** — **What to do:** In Data Manager, type a brand name in the search box → **Expected result:** Brand list filters to matching brands → **If it fails:** Report "Data Manager brand search not filtering"

- [ ] **11.1.5** — **What to do:** In Connect Accounts, type "TikTok" in the search box → **Expected result:** TikTok appears in filtered platform results → **If it fails:** Report "Connect Accounts platform search not finding TikTok"

---

### 11.2 Filter Functionality

- [ ] **11.2.1** — **What to do:** In Master Calendar, use the year dropdown to select 2025 → **Expected result:** Only 2025 events show → **If it fails:** Report "Master Calendar year filter not working"

- [ ] **11.2.2** — **What to do:** In Master Calendar, filter by "Sports" category → **Expected result:** Only sports events visible → **If it fails:** Report "Master Calendar Sports filter not working"

- [ ] **11.2.3** — **What to do:** In Master Calendar, filter by Tier 1 → **Expected result:** Only Tier 1 events visible → **If it fails:** Report "Master Calendar tier filter not working"

- [ ] **11.2.4** — **What to do:** In Connect Accounts, click the "Music" category tab → **Expected result:** Only music platforms visible (Spotify, Apple Music, SoundCloud, etc.) → **If it fails:** Report "Connect Accounts Music category tab not filtering"

- [ ] **11.2.5** — **What to do:** In Talent Discovery, use any available filter (category, follower count, engagement rate) → **Expected result:** Talent list updates to show only matching profiles → **If it fails:** Report "Talent Discovery filter [filter name] not working"

---

## PHASE 12: EMAIL DELIVERY

### Emails Must Arrive or Users Get Locked Out

---

### 12.1 Verification Email

- [ ] **12.1.1** — **What to do:** Sign up with a new email → check the inbox within 5 minutes → **Expected result:** Verification email arrives with DealStage branding (not generic Supabase default) in the "from" name/address → **If it fails:** Report "Verification email not arriving or arriving with Supabase default branding"

- [ ] **12.1.2** — **What to do:** Click the verification link in the email → **Expected result:** Link goes to https://www.thedealstage.com (not localhost) and confirms the account → **If it fails:** Report "Verification link goes to localhost — production URL not set in Supabase Auth settings"

---

### 12.2 Password Reset Email

- [ ] **12.2.1** — **What to do:** Request a password reset → check inbox → **Expected result:** Reset email arrives within 5 minutes with DealStage branding → **If it fails:** Report "Password reset email not arriving"

- [ ] **12.2.2** — **What to do:** Click the reset link → **Expected result:** Goes to https://www.thedealstage.com (not localhost) → **If it fails:** Report "Password reset link goes to localhost"

---

### 12.3 Welcome Email

- [ ] **12.3.1** — **What to do:** Create a new account → check inbox after completing signup → **Expected result:** Welcome email arrives with DealStage branding, a warm welcome message, and working links → **If it fails:** Report "Welcome email not arriving or has broken links"

---

### 12.4 Magic Link Email

- [ ] **12.4.1** — **What to do:** Request a magic link → check inbox → click the link → **Expected result:** Link logs you in automatically → **If it fails:** Report "Magic link email not arriving or link not logging in"

---

## PHASE 13: SEO & META

### Search Engines Must Index the Site Correctly

---

### 13.1 Page Titles

- [ ] **13.1.1** — **What to do:** Open the landing page in Chrome → look at the browser tab → **Expected result:** Tab shows "Dealstage — AI Partnership Intelligence Platform" (or similar branded title) → **If it fails:** Report "Homepage title shows '[wrong title]' — should be Dealstage branded"

- [ ] **13.1.2** — **What to do:** Open /login → check browser tab → **Expected result:** Tab shows "Sign In | Dealstage" → **If it fails:** Report "Login page title incorrect: shows '[actual title]'"

- [ ] **13.1.3** — **What to do:** Open /About → check browser tab → **Expected result:** Tab shows "About | Dealstage" → **If it fails:** Report "About page title incorrect"

- [ ] **13.1.4** — **What to do:** Open the Dashboard → check browser tab → **Expected result:** Shows "Dashboard | Dealstage" → **If it fails:** Report "Dashboard page title incorrect"

- [ ] **13.1.5** — **What to do:** Open 5 different pages → compare the browser tab titles → **Expected result:** Every page has a UNIQUE title — not all pages showing the same generic title → **If it fails:** Report "Multiple pages share the same browser tab title — SEO issue"

- [ ] **13.1.6** — **What to do:** Share the homepage URL on Slack, iMessage, or Twitter and observe the link preview → **Expected result:** Open Graph preview shows a DealStage-branded image (not a default blank preview) → **If it fails:** Report "Open Graph image not set — link previews show blank image"

---

## PHASE 14: PERFORMANCE

### Speed Matters — Every Second Costs Conversions

---

### 14.1 Load Times

- [ ] **14.1.1** — **What to do:** Open Chrome DevTools → Network tab → clear cache → reload https://www.thedealstage.com → check the "Load" time at the bottom → **Expected result:** Homepage loads in under 3 seconds (3000ms) → **If it fails:** Report "Homepage load time is [X]ms — exceeds 3s target"

- [ ] **14.1.2** — **What to do:** Navigate to Dashboard → observe load time (you can time it with DevTools or a stopwatch) → **Expected result:** Dashboard loads in under 3 seconds → **If it fails:** Report "Dashboard load time exceeds 3 seconds"

- [ ] **14.1.3** — **What to do:** Navigate to Deal Pipeline → observe load time → **Expected result:** Under 3 seconds → **If it fails:** Report "Deal Pipeline slow to load"

- [ ] **14.1.4** — **What to do:** Navigate to Master Calendar → observe load time → **Expected result:** Under 5 seconds (allowed slightly more due to 486 events loading) → **If it fails:** Report "Master Calendar exceeds 5 second load time"

- [ ] **14.1.5** — **What to do:** In AI Command Center, send a query and measure response time from send to first response → **Expected result:** AI responds within 10 seconds → **If it fails:** Report "AI Command Center response exceeding 10 seconds"

- [ ] **14.1.6** — **What to do:** Navigate to any 10 random pages and observe for content jumping or layout shift after initial load → **Expected result:** No visible layout shift — content should render in place without jumping around → **If it fails:** Report "Layout shift visible on [page name] — content jumps after load"

---

## PHASE 15: MOBILE TESTING

### Half Your Users Are On Phones

> Test on a real physical device if possible — DevTools simulation misses real touch events, font rendering differences, and Safari-specific bugs.

---

### 15.1 Landing Page (Mobile)

- [ ] **15.1.1** — **What to do:** Open https://www.thedealstage.com on a mobile device or phone-size DevTools (375px width) → look at the navigation → **Expected result:** Hamburger menu icon (three lines) appears instead of the full desktop navigation links → **If it fails:** Report "Desktop nav links showing on mobile instead of hamburger menu"

- [ ] **15.1.2** — **What to do:** Tap the hamburger menu → **Expected result:** Navigation menu opens as an overlay or slide-in panel with all nav links listed → **If it fails:** Report "Hamburger menu not opening"

- [ ] **15.1.3** — **What to do:** Check if "For Brands" and "For Talent" nav dropdown items are accessible in the mobile hamburger menu → **Expected result:** These nav items appear in the mobile menu (either as expandable items or listed out) → **If it fails:** Report "For Brands/For Talent nav items missing from mobile hamburger menu"

- [ ] **15.1.4** — **What to do:** Check the hero section text and heading on mobile → **Expected result:** Text is readable, not overflowing beyond screen width, not requiring horizontal scrolling → **If it fails:** Report "Hero text overflowing on mobile"

- [ ] **15.1.5** — **What to do:** Scroll to the pricing section on mobile → **Expected result:** Pricing cards stack vertically (one per row) — not displayed side-by-side requiring horizontal scroll → **If it fails:** Report "Pricing cards not stacking on mobile — requires horizontal scrolling"

- [ ] **15.1.6** — **What to do:** Look at the CTA buttons on mobile (Start free trial, Book a demo) → **Expected result:** Buttons are full-width or near-full-width and have a minimum tap target of 44px height → **If it fails:** Report "CTA buttons too small to tap on mobile"

- [ ] **15.1.7** — **What to do:** Scroll to the footer on mobile → **Expected result:** Footer stacks to a single column layout (not multi-column side-by-side) → **If it fails:** Report "Footer not stacking on mobile"

- [ ] **15.1.8** — **What to do:** Find the animated video walkthrough on the landing page → tap play on mobile → **Expected result:** Video plays on mobile without error → **If it fails:** Report "Video not playing on mobile"

- [ ] **15.1.9** — **What to do:** Scroll to the pricing comparison table on mobile → try to scroll it horizontally → **Expected result:** Table is horizontally scrollable (swipeable) on mobile → **If it fails:** Report "Comparison table not scrollable on mobile"

- [ ] **15.1.10** — **What to do:** Scroll to the footer on mobile → tap each footer link → **Expected result:** All footer links work and navigate correctly on mobile → **If it fails:** Report "Footer link [link name] not working on mobile"

---

### 15.2 Signup Flow (Mobile)

- [ ] **15.2.1** — **What to do:** Tap "Start free trial" on mobile → proceed through role selection → **Expected result:** Role selection cards are full-width and tappable → **If it fails:** Report "Role selection cards too small/narrow on mobile"

- [ ] **15.2.2** — **What to do:** Continue to the plan selection on mobile → **Expected result:** Plan cards are readable and fit the screen width → **If it fails:** Report "Plan selection cards overflowing on mobile"

- [ ] **15.2.3** — **What to do:** Continue to the account creation form on mobile → tap into the email input field → **Expected result:** Keyboard appears and does NOT cover the form input — or the page scrolls to keep the input visible above the keyboard → **If it fails:** Report "Mobile keyboard covers form inputs during signup"

- [ ] **15.2.4** — **What to do:** Complete the form on mobile and tap "Create Account" → **Expected result:** Button is visible, tappable, and not covered by the keyboard → **If it fails:** Report "Create Account button hidden under keyboard on mobile"

---

### 15.3 App Dashboard (Mobile)

- [ ] **15.3.1** — **What to do:** Log in on mobile → observe the Dashboard → **Expected result:** Sidebar is hidden by default (not taking up the full screen), a menu toggle appears → **If it fails:** Report "Sidebar visible by default on mobile — no space for content"

- [ ] **15.3.2** — **What to do:** Tap the mobile menu toggle to open the sidebar → **Expected result:** Sidebar opens as an overlay (slides in or appears over content) → **If it fails:** Report "Mobile sidebar not opening as overlay"

- [ ] **15.3.3** — **What to do:** On the Dashboard on mobile, look at the stats cards → **Expected result:** Cards are readable, text is not clipped, numbers are visible → **If it fails:** Report "Dashboard stats cards not displaying correctly on mobile"

- [ ] **15.3.4** — **What to do:** On any app page, check for horizontal overflow (can you scroll the page sideways?) → **Expected result:** No horizontal overflow — content stays within screen width → **If it fails:** Report "Horizontal overflow on [page name] — content wider than screen"

---

### 15.4 Deal Pipeline (Mobile)

- [ ] **15.4.1** — **What to do:** Navigate to Deal Pipeline on mobile → **Expected result:** Kanban board is horizontally scrollable — you can swipe left/right to see different stages → **If it fails:** Report "Deal Pipeline Kanban not scrollable on mobile"

- [ ] **15.4.2** — **What to do:** Tap a deal card on mobile → **Expected result:** DealDetail page opens → **If it fails:** Report "Tapping deal card on mobile not opening DealDetail"

---

### 15.5 General Mobile UX

- [ ] **15.5.1** — **What to do:** Tap all primary action buttons across the app on mobile → **Expected result:** All buttons have a minimum 44px tap target (Apple HIG standard) → **If it fails:** Report "Button [button name] on [page] too small to tap reliably on mobile"

- [ ] **15.5.2** — **What to do:** Read text on the Dashboard, Deal Pipeline, and Settings pages without zooming → **Expected result:** Text is legible at default zoom level (minimum 14px body text recommended) → **If it fails:** Report "Text too small to read without zooming on [page]"

- [ ] **15.5.3** — **What to do:** Press the Android back button or iOS swipe-back gesture while navigating between app pages → **Expected result:** Navigates back to the previous page correctly (does not go to a blank page or the landing page unexpectedly) → **If it fails:** Report "Back button navigation broken on mobile — goes to [wrong destination]"

---

## PHASE 16: EXPORTS & DOWNLOADS

### Users Need To Get Data Out

---

### 16.1 CSV Exports

- [ ] **16.1.1** — **What to do:** In Data Manager, go to Brands tab → click "Export CSV" → **Expected result:** A CSV file named something like "brands-export.csv" downloads to your computer with all brand data → **If it fails:** Report "Brands CSV export not downloading"

- [ ] **16.1.2** — **What to do:** In Data Manager, go to Contacts tab → click "Export CSV" → **Expected result:** Contacts CSV downloads with all contact data → **If it fails:** Report "Contacts CSV export not downloading"

- [ ] **16.1.3** — **What to do:** In any Data Room section, look for an export or download option → click it → **Expected result:** Data exports successfully → **If it fails:** Report "Data Room export not working"

---

### 16.2 Pitch Deck Export

- [ ] **16.2.1** — **What to do:** Generate a pitch deck in Pitch Deck Builder → look for a download button → **Expected result:** Generated deck can be downloaded as PDF, PPTX, or similar → **If it fails:** Report "Pitch Deck has no download option after generation"

---

## PHASE 17: NOTIFICATIONS

### Keep Users Engaged

---

### 17.1 Notification System

- [ ] **17.1.1** — **What to do:** Navigate to the Notifications page → **Expected result:** Notifications page loads showing a list of notifications (or empty state) → **If it fails:** Report "Notifications page not loading"

- [ ] **17.1.2** — **What to do:** Look at the bell icon in the app header → **Expected result:** Bell icon is visible; if there are unread notifications it shows a count badge → **If it fails:** Report "Notification bell icon missing from header"

- [ ] **17.1.3** — **What to do:** Click a notification in the list → **Expected result:** App navigates to the relevant page related to that notification → **If it fails:** Report "Notification click not navigating to correct page"

- [ ] **17.1.4** — **What to do:** Mark a notification as read → **Expected result:** Notification status changes to read (visual indicator changes) and the unread count decrements → **If it fails:** Report "Mark notification as read not working"

---

## PHASE 18: ADMIN FUNCTIONS

### Running the Business

---

### 18.1 Admin Dashboard & Data Management

- [ ] **18.1.1** — **What to do:** Log in as admin → navigate to Admin Dashboard → **Expected result:** Loads with platform-wide metrics: total user count, total deals, AI queries used, platform health overview → **If it fails:** Report "Admin Dashboard not showing platform metrics"

- [ ] **18.1.2** — **What to do:** Navigate to Data Manager → Brands tab → add a new brand (e.g., Canva, canva.com, Technology) → **Expected result:** New brand appears in the brands list immediately → **If it fails:** Report "Admin unable to add brand via Data Manager"

- [ ] **18.1.3** — **What to do:** Navigate to Data Manager → Contacts tab → add a new contact → **Expected result:** New contact appears and is also visible in Contact Finder → **If it fails:** Report "Admin unable to add contact via Data Manager"

- [ ] **18.1.4** — **What to do:** Navigate to Data Manager → Deals tab → view existing deals → **Expected result:** All deals created by users are visible in the admin deals view → **If it fails:** Report "Admin Data Manager Deals tab not showing deals"

- [ ] **18.1.5** — **What to do:** Navigate to System Health → **Expected result:** All major services show green/healthy status: Supabase DB, Vercel hosting, Stripe, AI providers (Anthropic, DeepSeek, Groq) → **If it fails:** Report "System Health showing service failures — [list which services are red]"

- [ ] **18.1.6** — **What to do:** Navigate to AI Analytics → **Expected result:** Shows AI usage data: queries per day, most-used AI feature, provider breakdown → **If it fails:** Report "AI Analytics not loading usage data"

---

## PHASE 19: CROSS-BROWSER FINAL PASS

### 20% of Users Don't Use Chrome

---

### 19.1 Browser Compatibility

- [ ] **19.1.1** — **What to do:** In Chrome: complete a full flow — login + navigate to Dashboard + create a deal + use AI Command Center → **Expected result:** All 4 actions succeed without error → **If it fails:** Report "Chrome full flow broken at: [step]"

- [ ] **19.1.2** — **What to do:** In Safari: login + check Dashboard + navigate to Deal Pipeline → **Expected result:** All 3 actions succeed, layout renders correctly in Safari → **If it fails:** Report "Safari broken at: [step] — [error description]"

- [ ] **19.1.3** — **What to do:** In Firefox: login + check Dashboard + navigate to Match Engine → **Expected result:** All 3 actions succeed → **If it fails:** Report "Firefox broken at: [step]"

- [ ] **19.1.4** — **What to do:** In Edge: login + check Dashboard → **Expected result:** Login and Dashboard work in Edge → **If it fails:** Report "Edge broken at: [step]"

---

## PHASE 20: FINAL SMOKE TEST

### The Ultimate End-to-End Verification

> This is the definitive test. If this entire sequence works without a single error, the app is production-ready. Run this LAST after fixing any issues found in earlier phases.

---

### 20.1 Complete New User Journey

- [ ] **20.1.1** — **What to do:** Open a fresh incognito/private browser window → go to https://www.thedealstage.com → **Expected result:** Landing page loads cleanly → **If it fails:** Report "Landing page not loading in clean incognito browser"

- [ ] **20.1.2** — **What to do:** Spend 2 minutes browsing the landing page as a new visitor would — read the hero, scroll pricing, read features → **Expected result:** Page content makes sense, no broken images, no broken layout → **If it fails:** Report "Landing page content broken: [describe issue]"

- [ ] **20.1.3** — **What to do:** Click "Start free trial" → select Talent → select Free plan → create a BRAND NEW account with an email you've never used before → **Expected result:** Account created, redirected to /check-email or /Dashboard → **If it fails:** Report "Brand new account creation failing"

- [ ] **20.1.4** — **What to do:** If email verification needed: verify the email → then log in → **Expected result:** Login succeeds with the new account → **If it fails:** Report "New account login failing after email verification"

- [ ] **20.1.5** — **What to do:** On first login with the new account, observe what happens → **Expected result:** Onboarding wizard appears automatically → **If it fails:** Report "Onboarding wizard not showing on first login for new account"

- [ ] **20.1.6** — **What to do:** Complete all 4 onboarding wizard steps → **Expected result:** Wizard completes with confetti/success screen → **If it fails:** Report "Onboarding wizard failing at step [X]"

- [ ] **20.1.7** — **What to do:** Go to Connect Accounts → connect Instagram (simulated) → **Expected result:** Instagram shows as Connected → **If it fails:** Report "Connect Accounts Instagram connection failing in smoke test"

- [ ] **20.1.8** — **What to do:** Browse the Marketplace → **Expected result:** Content loads and is browseable → **If it fails:** Report "Marketplace not loading during smoke test"

- [ ] **20.1.9** — **What to do:** Go to Match Engine → select Nike + Jordan Reeves → run match → **Expected result:** AI returns match score and breakdown → **If it fails:** Report "Match Engine failing during smoke test"

- [ ] **20.1.10** — **What to do:** Go to Deal Pipeline → create a deal: "Nike × Jordan Reeves, $85K Sponsorship" → **Expected result:** Deal appears in Discovered column → **If it fails:** Report "Deal creation failing during smoke test"

- [ ] **20.1.11** — **What to do:** Go to AI Command Center → type "Find fitness creators" → **Expected result:** AI responds with relevant content → **If it fails:** Report "AI Command Center failing during smoke test"

- [ ] **20.1.12** — **What to do:** Go to Master Calendar → check event count → **Expected result:** 486 events loading → **If it fails:** Report "Master Calendar not loading 486 events during smoke test"

- [ ] **20.1.13** — **What to do:** Go to Settings → change display name → save → **Expected result:** Name updates successfully → **If it fails:** Report "Settings name change failing during smoke test"

- [ ] **20.1.14** — **What to do:** Click Logout → **Expected result:** Logged out, redirected to landing page → **If it fails:** Report "Logout failing during smoke test"

- [ ] **20.1.15** — **What to do:** Log back in with the credentials from 20.1.3 → **Expected result:** Logged in successfully → **If it fails:** Report "Re-login after logout failing"

- [ ] **20.1.16** — **What to do:** After logging back in, check Deal Pipeline → **Expected result:** The deal created in 20.1.10 is still there → **If it fails:** Report "Data lost after logout/login cycle — CRITICAL DATA LOSS BUG"

- [ ] **20.1.17** — **What to do:** Review everything you just tested → **Expected result:** Every single step worked without an error. No crashes. No error toasts. No blank pages. → **If it fails:** Compile all issues and report with their Phase IDs

---

## DEFINITION OF DONE

The app is 100% working when ALL of the following are true:

- [ ] All 4 signup paths work (Talent, Brand, Agency, Manager)
- [ ] All 3 login methods work (email/password, Google OAuth, magic link)
- [ ] Forgot password flow works end-to-end
- [ ] Role-based access control is enforced
- [ ] Feature gating works (free vs trial vs paid)
- [ ] All 7 AI-powered features work
- [ ] Deal Pipeline creates, moves through all 8 stages, and tracks deals
- [ ] Connect Accounts shows 88 platforms and simulated connections work
- [ ] All 50+ sidebar pages load without errors
- [ ] Mobile layout works (hamburger menu, readable content, no overflow)
- [ ] 25 brands + 10 contacts + 18 talent profiles seeded
- [ ] Master Calendar shows 486 events
- [ ] Culture Calendar loads
- [ ] Admin can manage data via Data Manager (including CSV import/export)
- [ ] Stripe checkout page loads and accepts test payments
- [ ] All email flows work (verification, reset, welcome, magic link)
- [ ] Vercel hosting secured (no expiring trial)
- [ ] All 4 AI providers working (including Gemini after API activation)
- [ ] Onboarding wizard works for new users (all 4 steps)
- [ ] SEO page titles are unique and correct
- [ ] Landing page all sections work (nav, pricing, FAQ, video, CTA buttons)
- [ ] All public pages load (/About, /Blog, /Careers, /Contact, /Demo, /pricing, legal pages)
- [ ] Smoke test (Phase 20) passes completely

---

_Document version: 1.0 — 2026-03-20 — Merged from app-100-percent-working.md and comprehensive-testing-checklist.md with all additions_
