# Social Media API Setup Guide

**Domain:** thedealstage.com
**Last Updated:** 2026-03-21
**Audience:** Developers setting up OAuth and API access for the first time

---

## Table of Contents

1. [TikTok](#1-tiktok)
2. [Twitter / X](#2-twitter--x)
3. [LinkedIn](#3-linkedin)
4. [Snapchat](#4-snapchat)
5. [Pinterest](#5-pinterest)
6. [Reddit](#6-reddit)
7. [Bluesky](#7-bluesky)
8. [Environment Variables Reference](#environment-variables-reference)

---

## Before You Start

Every platform below requires:

- A **verified business email address** (not a personal Gmail)
- A **live, publicly accessible domain** — thedealstage.com must resolve and serve a valid HTTPS page before any platform will approve your app
- A **privacy policy URL** — most platforms require this during app creation. Create one at `https://thedealstage.com/privacy` before proceeding
- A **terms of service URL** — publish at `https://thedealstage.com/terms`

> **GOTCHA — HTTPS is mandatory.** Every callback URL in this guide uses `https://`. Platforms will reject `http://` redirect URIs during OAuth flows, even in development. Ensure your local tunneling tool (ngrok, Cloudflare Tunnel, etc.) is configured for HTTPS if you need to test locally.

---

## 1. TikTok

**Auth method:** API Key + OAuth 2.0
**Console:** https://developers.tiktok.com/
**Callback URL:** `https://thedealstage.com/callback/tiktok`
**Required scopes:** `user.info.basic`, `user.info.stats`, `video.list`
**Rate limits:** 60–300 requests/minute (varies by endpoint)
**Approval required:** Yes — allow 2–3 weeks

> **CRITICAL — Apply early.** TikTok's developer approval takes 2–3 weeks and tokens expire after 365 days. If you miss the renewal window, users must re-authorize. Set a calendar reminder 30 days before expiry.

### Step 1 — Create a TikTok Developer Account

1. Navigate to https://developers.tiktok.com/
2. Click **"Log in"** in the top-right corner.
3. Log in with a TikTok account. Use a business or team account, not a personal one — you will not be able to transfer app ownership later.
4. After login, click **"My Apps"** in the top navigation bar.
5. If prompted, complete the developer registration form:
   - Select **"Business"** as account type
   - Enter your company name as it appears on legal documents
   - Enter your business website: `https://thedealstage.com`
   - Accept the TikTok Developer Terms of Service
6. Click **"Submit"** and verify your email address if prompted.

### Step 2 — Create a New App

1. On the My Apps page, click the **"Create an app"** button (top-right, blue button).
2. Fill in the form:
   - **App name:** `DealStage` (must be unique across TikTok; if taken, try `DealStage Platform`)
   - **App description:** Describe what the app does — e.g., "Creator analytics and partnership management platform for brands and talent agencies."
   - **App icon:** Upload a 200x200px PNG of your logo
   - **Category:** Select **"Business"**
3. Click **"Submit"**.
4. You will land on your app's dashboard. Note your **Client Key** (this is your API key/Client ID) displayed at the top.

### Step 3 — Configure the Redirect URI

1. On your app dashboard, scroll to the **"Login Kit"** section and click **"Add product"** or click the **"+"** button next to Login Kit.
2. Under **"Web"**, find the **"Redirect domain"** field.
3. Enter: `thedealstage.com` (domain only, no protocol or path)
4. In the **"Redirect URI for login"** field, enter the exact URL: `https://thedealstage.com/callback/tiktok`
5. Click **"Save changes"**.

> **GOTCHA — Domain vs. URI.** TikTok requires you to register both the domain AND the full callback URI separately. Missing either one causes the OAuth flow to fail with a `redirect_uri_mismatch` error.

### Step 4 — Request the Required Scopes

1. On your app dashboard, find the **"Scopes"** section under Login Kit.
2. Click **"Request scope"**.
3. Enable the following scopes (each may require a separate justification):

   | Scope             | Justification to enter                                                              |
   | ----------------- | ----------------------------------------------------------------------------------- |
   | `user.info.basic` | Display creator profile information including username and avatar on the platform   |
   | `user.info.stats` | Show creators their follower count and engagement metrics for partnership matching  |
   | `video.list`      | Access a creator's video library to analyze content performance for brand campaigns |

4. For each scope, write a clear, specific use-case justification. Vague justifications (e.g., "we need it for our app") are rejected.
5. Click **"Save"** after enabling all three scopes.

### Step 5 — Submit for App Review

1. On your app dashboard, click **"Submit for review"** (this button appears once you have at least one product added and scopes requested).
2. Complete the review submission form:
   - **App use case description:** Write 2–3 paragraphs explaining how DealStage connects brands with creators, what data is accessed, and how it is stored
   - **Privacy policy URL:** `https://thedealstage.com/privacy`
   - **Terms of service URL:** `https://thedealstage.com/terms`
   - **Demo video or screenshots:** Required — record a Loom showing the planned OAuth flow
3. Click **"Submit"**.
4. Wait 2–3 weeks. TikTok will email you at the developer account address with approval or rejection.

> **GOTCHA — Rejection reasons.** TikTok most commonly rejects apps for: (1) privacy policy not covering data retention, (2) demo video not showing the actual redirect URI in use, (3) app category mismatch. If rejected, you can resubmit with corrections — the clock resets each time.

### Step 6 — Retrieve Your Credentials

Once approved:

1. Return to https://developers.tiktok.com/ and click **"My Apps"**.
2. Click on your app name.
3. On the app overview page:
   - **Client Key** is displayed under the app name — copy this (this is your `TIKTOK_CLIENT_ID`)
   - Click **"Generate Client Secret"** — copy and store this immediately; it is only shown once (`TIKTOK_CLIENT_SECRET`)
4. Store both values in your secrets manager before leaving this page.

### Step 7 — Test Before Going Live

1. TikTok provides a **sandbox mode** while your app is under review. In sandbox mode, only TikTok accounts that you explicitly whitelist as testers can authorize the app.
2. On your app dashboard, scroll to **"Sandbox"** and click **"Add tester"**. Enter the TikTok username of your test account.
3. Initiate the OAuth flow pointing to TikTok's authorization endpoint:
   ```
   https://www.tiktok.com/v2/auth/authorize?
     client_key=YOUR_CLIENT_KEY
     &response_type=code
     &scope=user.info.basic,user.info.stats,video.list
     &redirect_uri=https://thedealstage.com/callback/tiktok
     &state=RANDOM_STATE_STRING
   ```
4. Complete the authorization as the whitelisted test account.
5. Verify your callback endpoint receives the `code` parameter and can exchange it for a token at `https://open.tiktokapis.com/v2/oauth/token/`.

### Step 8 — Common Pitfalls

- **Scope creep:** Only request scopes you actively use. Unused scopes trigger rejection.
- **Token refresh:** Access tokens expire in 24 hours. Refresh tokens expire in 365 days. Build token refresh logic from day one.
- **Rate limits vary by endpoint:** `user.info.basic` allows 300 req/min; `video.list` allows 60 req/min. Handle 429 responses with exponential backoff.
- **API versioning:** Always use the v2 API base URL (`https://open.tiktokapis.com/v2/`). v1 endpoints are deprecated and return errors.

### Step 9 — Environment Variables

```
TIKTOK_CLIENT_ID=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=https://thedealstage.com/callback/tiktok
TIKTOK_SCOPES=user.info.basic,user.info.stats,video.list
```

### Step 10 — Pricing

TikTok's standard API access is **free**. There are no per-request charges for the scopes listed above. If you later require TikTok Ads API access, that is a separate, paid program requiring a TikTok Ads account with active spend.

---

## 2. Twitter / X

**Auth method:** OAuth 2.0 with PKCE
**Console:** https://developer.x.com/en/portal/dashboard
**Callback URL:** `https://thedealstage.com/callback/twitter`
**Required scopes:** `tweet.read`, `follows.read`, `users.read`
**Rate limits:** 450 requests per 15 minutes (Premium tier)
**Approval required:** No formal review, but account verification is required

> **CRITICAL — Old API tiers are deprecated.** The legacy Free, Basic, and Pro tiers have been replaced with a usage-based credit system. You are charged per API call above the free monthly allocation. Set billing alerts immediately after account creation.

> **CRITICAL — Elon-era policy changes are ongoing.** X's developer terms, pricing, and endpoint availability have changed multiple times since 2023. Verify current pricing at https://developer.x.com/en/products/x-api before building any integrations.

### Step 1 — Create a Developer Account

1. Navigate to https://developer.x.com/en/portal/dashboard.
2. Click **"Sign up"** (or log in with an existing X account).
3. If signing up: you must use an X account with a **verified phone number**. To verify: go to https://x.com/settings/phone and add your number first.
4. After login to the developer portal, you will be asked to describe your use case. Select:
   - **"Building a product or service"**
   - Under "What are you building?": select **"Analytics tools"** and **"Creator tools"**
5. In the free-text field, describe DealStage's use case in 200+ words. Be specific — vague descriptions are flagged.
6. Accept the Developer Agreement and Policy.
7. Click **"Submit"**.

### Step 2 — Create a Project and App

X's API is organized as Projects (billing containers) containing Apps (credential sets).

1. In the developer portal, click **"+ New Project"** in the left sidebar under "Projects & Apps".
2. Enter a project name: `DealStage`
3. Select use case: **"Making a bot"** — do NOT select this. Select **"Doing academic research"** is also wrong. Select **"Building tools for your business"**.
4. Click **"Next"**.
5. Enter a project description.
6. Click **"Next"**, then click **"Create a new App instead"**.
7. Enter your app name: `DealStage`
8. Click **"Next"**.
9. You will see your **API Key**, **API Key Secret**, and **Bearer Token**. Copy all three immediately. They are displayed only once. Store in your secrets manager before clicking anything else.

> **GOTCHA — One-time display.** X shows your API Key Secret and Bearer Token exactly once during app creation. If you navigate away without copying them, you must regenerate them (which invalidates any existing integrations using the old values).

### Step 3 — Configure OAuth 2.0

1. In your app's settings (click your app name in the left sidebar, then click the gear icon or **"Edit"** next to "User authentication settings").
2. Click **"Set up"** under "User authentication settings".
3. Configure as follows:
   - **App permissions:** Select **"Read"** (do not request write permissions unless needed — it triggers additional review)
   - **Type of app:** Select **"Web App, Automated App or Bot"**
   - **App info — Callback URI / Redirect URL:** Enter `https://thedealstage.com/callback/twitter`
   - **App info — Website URL:** Enter `https://thedealstage.com`
4. Click **"Save"**.
5. You will see your **OAuth 2.0 Client ID** and **Client Secret**. Copy both. Store immediately.

> **GOTCHA — Two separate credential sets.** X gives you both OAuth 1.0a credentials (API Key + Secret) and OAuth 2.0 credentials (Client ID + Client Secret). For the scopes in this guide (`tweet.read`, `users.read`, `follows.read`), use the OAuth 2.0 credentials with PKCE. The OAuth 1.0a credentials are for write operations and account-level actions.

### Step 4 — Configure Scopes

X scopes are requested at runtime during the OAuth authorization URL, not configured in the dashboard. When building your OAuth 2.0 authorization URL, include these scopes in the `scope` parameter:

```
tweet.read users.read follows.read offline.access
```

Include `offline.access` to receive a refresh token. Without it, the access token expires after 2 hours and the user must re-authorize.

### Step 5 — Approval Process

There is no app review process for the read-only scopes listed above. However:

- Your developer account must remain in good standing (no policy violations)
- If you later request write scopes (`tweet.write`, `dm.write`), X may require additional verification
- Elevated access tiers (for higher rate limits) require submitting a use case description through the portal

### Step 6 — Retrieve Your Credentials

All credentials are available on your app's keys page:

1. In the developer portal, click your app name in the left sidebar.
2. Click the **"Keys and tokens"** tab.
3. Here you can view (and regenerate if needed):
   - **API Key and Secret** (OAuth 1.0a)
   - **Bearer Token**
   - **Access Token and Secret** (for your own account)
   - **OAuth 2.0 Client ID and Client Secret**

To regenerate a secret: click **"Regenerate"** next to it. Note that regenerating invalidates the old value immediately.

### Step 7 — Test Before Going Live

1. Use the **OAuth 2.0 PKCE flow**:
   - Generate a `code_verifier` (random 43–128 character string)
   - Generate a `code_challenge` (SHA-256 hash of the verifier, base64url-encoded)
   - Build the authorization URL:
     ```
     https://twitter.com/i/oauth2/authorize?
       response_type=code
       &client_id=YOUR_CLIENT_ID
       &redirect_uri=https://thedealstage.com/callback/twitter
       &scope=tweet.read%20users.read%20follows.read%20offline.access
       &state=RANDOM_STATE_STRING
       &code_challenge=YOUR_CODE_CHALLENGE
       &code_challenge_method=S256
     ```
2. Complete the auth flow in a browser.
3. Exchange the returned `code` for tokens at `https://api.twitter.com/2/oauth2/token`.
4. Test a simple API call: `GET https://api.twitter.com/2/users/me` with your Bearer token.

### Step 8 — Common Pitfalls

- **PKCE is mandatory for OAuth 2.0.** Unlike some platforms, X requires PKCE even for server-side apps. There is no option to disable it.
- **Scope changes require re-authorization.** If you add a new scope later, existing users must go through the OAuth flow again.
- **Rate limits are per-app, not per-user.** 450 requests per 15 minutes is shared across all users of your app. At scale, this becomes a bottleneck quickly.
- **`offline.access` must be requested on first authorization.** You cannot add it retroactively to get refresh tokens for users who already authorized.
- **Billing surprises:** Monitor your usage at https://developer.x.com/en/portal/dashboard — unexpected spikes can result in large charges. Set a spending cap in billing settings.

### Step 9 — Environment Variables

```
TWITTER_CLIENT_ID=your_oauth2_client_id_here
TWITTER_CLIENT_SECRET=your_oauth2_client_secret_here
TWITTER_REDIRECT_URI=https://thedealstage.com/callback/twitter
TWITTER_SCOPES=tweet.read users.read follows.read offline.access
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

### Step 10 — Pricing

As of early 2026, X operates on a tiered credit system:

- **Free tier:** 1,500 tweet reads per month, write access for one app. No cost.
- **Basic:** $100/month — 3,000 tweet reads/month, higher write limits
- **Pro:** $5,000/month — 1 million tweet reads/month
- **Enterprise:** Custom pricing

For read-only analytics at scale, you will likely need the Basic or Pro tier. Verify current pricing at https://developer.x.com/en/products/x-api.

---

## 3. LinkedIn

**Auth method:** OAuth 2.0
**Console:** https://www.linkedin.com/developers/apps
**Callback URL:** `https://thedealstage.com/callback/linkedin`
**Required scopes:** `r_basicprofile`, `r_emailaddress`, `r_organization_social`
**Rate limits:** 300 requests/minute
**Approval required:** Yes for `r_organization_social` — 3–7 business days

> **GOTCHA — LinkedIn requires a Company Page.** You cannot create a LinkedIn Developer App without associating it with a LinkedIn Company Page. If thedealstage.com does not have a LinkedIn Company Page, create one at https://www.linkedin.com/company/setup/new/ before proceeding.

### Step 1 — Create a LinkedIn Developer App

1. Ensure you are logged into LinkedIn with an account that is an **admin** of the DealStage company page.
2. Navigate to https://www.linkedin.com/developers/apps.
3. Click **"Create app"** (top-right, blue button).
4. Fill in the form:
   - **App name:** `DealStage`
   - **LinkedIn Page:** Start typing "DealStage" or your company name and select it from the dropdown. If it does not appear, the company page does not exist yet — stop and create it first.
   - **App logo:** Upload a 100x100px PNG minimum
   - **Legal agreement:** Check the box accepting the API Terms of Use
5. Click **"Create app"**.

### Step 2 — Verify App Association with Company Page

1. After creation, you will land on the app's **Settings** tab.
2. Scroll down to **"App settings"** and find **"Verify"** next to the company page name.
3. Click **"Verify"**. LinkedIn will send a verification request to the company page admins.
4. Log into LinkedIn as a company page admin, find the notification, and click **"Approve"**.
5. Return to the developer portal — the page should now show as verified.

### Step 3 — Configure OAuth Redirect URIs

1. On your app page, click the **"Auth"** tab.
2. Under **"OAuth 2.0 settings"**, find **"Authorized redirect URLs for your app"**.
3. Click **"Add redirect URL"**.
4. Enter: `https://thedealstage.com/callback/linkedin`
5. Click the **"+"** button or press Enter to confirm.
6. Click **"Update"** to save.

> **GOTCHA — Exact match required.** LinkedIn performs exact string matching on redirect URIs. A trailing slash (`/callback/linkedin/`) will cause a mismatch. Enter the URL exactly as shown above.

### Step 4 — Request OAuth Scopes

LinkedIn organizes scopes into "Products" that must be requested separately.

1. On your app page, click the **"Products"** tab.
2. You will see a list of available products. Request the following:

   **For `r_basicprofile` and `r_emailaddress`:**
   - Find **"Sign In with LinkedIn using OpenID Connect"** — click **"Request access"**
   - These scopes are approved automatically (usually within minutes)

   **For `r_organization_social`:**
   - Find **"Marketing Developer Platform"** — click **"Request access"**
   - Fill in the use case form explaining why DealStage needs to read organization social data
   - This requires 3–7 business day review by LinkedIn

3. After requesting, the Products tab shows a **"Pending"** badge next to unapproved products.

> **GOTCHA — Scope names changed.** LinkedIn has renamed scopes multiple times. The current OpenID Connect scopes are `openid`, `profile`, `email`. The legacy `r_basicprofile` scope still works but LinkedIn recommends migrating to the OpenID Connect versions. For new apps, use `openid profile email` instead of `r_basicprofile r_emailaddress`. Check the current docs at https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access to confirm.

### Step 5 — Approval Process

- `openid`, `profile`, `email` (OpenID Connect): Automatic approval, typically within 5 minutes
- `r_organization_social` (via Marketing Developer Platform): 3–7 business day manual review
- LinkedIn may email requesting additional information about your use case. Respond promptly — delays in your response extend the review timeline.

### Step 6 — Retrieve Your Credentials

1. On your app page, click the **"Auth"** tab.
2. Under **"Application credentials"**:
   - **Client ID** is displayed in plain text — copy this (`LINKEDIN_CLIENT_ID`)
   - **Client Secret** is masked — click the eye icon to reveal, then copy (`LINKEDIN_CLIENT_SECRET`)

### Step 7 — Test Before Going Live

1. Build the authorization URL:
   ```
   https://www.linkedin.com/oauth/v2/authorization?
     response_type=code
     &client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/linkedin
     &scope=openid%20profile%20email%20r_organization_social
     &state=RANDOM_STATE_STRING
   ```
2. Visit the URL in a browser. Log in with a LinkedIn account and authorize the app.
3. Exchange the `code` for tokens at:
   ```
   POST https://www.linkedin.com/oauth/v2/accessToken
   ```
4. Test a profile fetch: `GET https://api.linkedin.com/v2/userinfo` with the access token in the `Authorization: Bearer` header.

### Step 8 — Common Pitfalls

- **Access tokens expire in 60 days.** Refresh tokens are valid for 365 days. Build refresh logic before launch.
- **LinkedIn throttles aggressively.** If you hit rate limits, LinkedIn can temporarily revoke API access for your app — not just return 429 errors. Implement strict rate limiting on your side.
- **Company page admin access required for org scopes.** Users who authorize `r_organization_social` must be admins of the organization page. If they are not, the scope is silently granted but API calls return empty data, not an error.
- **Sandbox restrictions.** LinkedIn does not offer a true sandbox environment. All testing uses real LinkedIn accounts and real data. Use a test LinkedIn account.

### Step 9 — Environment Variables

```
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=https://thedealstage.com/callback/linkedin
LINKEDIN_SCOPES=openid profile email r_organization_social
```

### Step 10 — Pricing

LinkedIn's API access is **free** for the scopes listed above. The Marketing Developer Platform (required for `r_organization_social`) is free to apply to. LinkedIn Ads API access requires active ad spend. There are no per-request charges for standard API access.

---

## 4. Snapchat

**Auth method:** OAuth 2.0 via Snap Kit
**Console:** https://developers.snap.com
**Callback URL:** `https://thedealstage.com/callback/snapchat`
**Required scopes:** Login Kit, Story Kit
**Approval required:** Yes for Story Kit — timeline varies (typically 1–2 weeks)

> **GOTCHA — Snap Kit is not a classic API.** Snapchat's developer platform is built around "Kits" (Login Kit, Story Kit, Creative Kit, etc.) rather than traditional REST API scopes. Each Kit is a separate product that must be enabled individually and, for some, reviewed separately.

### Step 1 — Create a Snap Developer Account

1. Navigate to https://developers.snap.com.
2. Click **"Get started"** or **"Login"** in the top-right corner.
3. Log in with your Snapchat account. Use a business account — if you do not have one, create one at https://business.snapchat.com/ first.
4. After login, you will land on the Snap Developer portal dashboard.
5. If prompted to create an organization, enter:
   - **Organization name:** `DealStage`
   - **Organization website:** `https://thedealstage.com`

### Step 2 — Create a New App

1. In the developer portal, click **"Create App"** (or navigate to **My Apps > New App**).
2. Fill in the form:
   - **App name:** `DealStage`
   - **App icon:** Upload a 200x200px PNG
   - **Category:** Select **"Business & Productivity"**
   - **Description:** Describe how DealStage uses Snap Kit
3. Click **"Create"**.

### Step 3 — Enable Login Kit

1. On your app's dashboard, find the **"Kits"** section.
2. Click the toggle next to **"Login Kit"** to enable it.
3. Under Login Kit settings, scroll to **"Redirect URIs"**.
4. Click **"Add URI"**.
5. Enter: `https://thedealstage.com/callback/snapchat`
6. Click **"Save"**.

### Step 4 — Enable and Configure Story Kit

1. In the Kits section, find **"Story Kit"**.
2. Click **"Request access"** (Story Kit is not available by default).
3. Complete the Story Kit request form:
   - Describe specifically how DealStage will use Story Kit — e.g., "Allow creators to share their Snapchat Stories with brand partners for campaign performance review"
   - Provide your privacy policy URL: `https://thedealstage.com/privacy`
4. Submit the request.
5. Snap will review and respond via email, typically within 1–2 weeks.

### Step 5 — Configure App Settings

1. On your app page, click the **"Settings"** tab.
2. Under **"Confidential Client"**, toggle this **ON** if you are building a server-side application (which is recommended for DealStage).
3. Under **"Development Environment"**, you will see a **"Sandbox"** toggle — leave this ON during development.
4. Add your website URL under **"App website"**: `https://thedealstage.com`
5. Add your privacy policy: `https://thedealstage.com/privacy`

### Step 6 — Approval Process

- **Login Kit:** Available immediately upon app creation — no review required
- **Story Kit:** Manual review required. Timeline: 1–2 weeks typically. Snap may request a demo of your app
- During review, you can test using the **Development mode**, which restricts access to Snapchat accounts you explicitly add as testers

### Step 7 — Retrieve Your Credentials

1. On your app page, click the **"Credentials"** tab (or check the **"Keys"** section).
2. You will find:
   - **Client ID** (labeled "OAuth2 Client ID") — copy this (`SNAPCHAT_CLIENT_ID`)
   - **Client Secret** — click **"Show"** to reveal, then copy (`SNAPCHAT_CLIENT_SECRET`)
3. Note your app's **Snap App ID** — this is used in deep links and is different from the OAuth Client ID.

### Step 8 — Test Before Going Live

1. In Development mode, add a tester:
   - Go to **App Settings > Testers**
   - Click **"Add tester"**
   - Enter the Snapchat username of your test account
2. Build the authorization URL:
   ```
   https://accounts.snapchat.com/accounts/oauth2/auth?
     client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/snapchat
     &response_type=code
     &scope=https://auth.snapchat.com/oauth2/api/user.display_name%20https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar
     &state=RANDOM_STATE_STRING
   ```
3. Exchange the code at `https://accounts.snapchat.com/accounts/oauth2/token`.
4. Test a profile call: `GET https://kit.snapchat.com/v1/me`.

> **GOTCHA — Snap scopes use full URLs, not short names.** Unlike most platforms, Snapchat's OAuth scopes are full URIs (e.g., `https://auth.snapchat.com/oauth2/api/user.display_name`), not short scope strings. Check the Snap Kit docs for the exact scope URIs for Login Kit and Story Kit.

### Step 9 — Common Pitfalls

- **Development mode restricts access strictly.** Only explicitly added testers can authorize in Development mode. Attempting to authorize with any other Snapchat account will fail with a non-obvious error.
- **Story Kit review can be slow.** Do not build your release timeline assuming Story Kit approval takes 2 weeks. It can take longer.
- **Tokens expire in 1 hour.** Snapchat access tokens are short-lived. Refresh tokens are valid for 90 days. Implement token refresh from the start.
- **Bitmoji access vs. Story access are separate.** Login Kit gives you profile and Bitmoji data. Story Kit gives you Story data. They are enabled separately and have separate approval processes.

### Step 10 — Environment Variables

```
SNAPCHAT_CLIENT_ID=your_client_id_here
SNAPCHAT_CLIENT_SECRET=your_client_secret_here
SNAPCHAT_REDIRECT_URI=https://thedealstage.com/callback/snapchat
```

### Step 11 — Pricing

Snap Kit API access is **free**. Snapchat Ads API access requires a separate application and active ad spend. There are no per-request charges for Login Kit or Story Kit.

---

## 5. Pinterest

**Auth method:** OAuth 2.0
**Console:** https://developers.pinterest.com/apps/
**Callback URL:** `https://thedealstage.com/callback/pinterest`
**Required scopes:** `boards:read`, `pins:read`, `user_accounts:read`
**Rate limits:** 10 requests/second
**Approval required:** Yes for Ads API — no review needed for read-only scopes

> **GOTCHA — Scope names have changed.** The scopes listed in the original spec (`boards:read`, `pins:read`, `user:email:read`) have been updated in Pinterest's v5 API. Use `boards:read`, `pins:read`, and `user_accounts:read` for the v5 API. Verify against https://developers.pinterest.com/docs/getting-started/scopes/ before building.

### Step 1 — Create a Pinterest Developer Account

1. Navigate to https://developers.pinterest.com/apps/.
2. Click **"Log in"** and sign in with your Pinterest account. Use a business account — if you have a personal account, convert it at https://www.pinterest.com/business/convert/ or create a new business account.
3. After login, you will land on **"My apps"**. If this is your first time, you may see a welcome screen — accept the terms to proceed.

### Step 2 — Create a New App

1. Click **"Connect app"** or **"+ New app"** (top-right).
2. Fill in the form:
   - **App name:** `DealStage`
   - **App description:** Describe the integration — e.g., "Creator analytics platform for measuring Pinterest performance in brand partnership campaigns"
   - **App icon:** Upload your logo
3. Click **"Create"** or **"Connect"**.
4. You will land on your app's detail page.

### Step 3 — Configure Redirect URIs

1. On your app's detail page, scroll to **"Redirect URIs"** (also labeled "OAuth redirect URIs" in some views).
2. Click **"+ Add"** or the edit icon.
3. Enter: `https://thedealstage.com/callback/pinterest`
4. Click the checkmark or **"Save"** to confirm.
5. Pinterest allows up to 10 redirect URIs per app.

### Step 4 — Configure Scopes

Pinterest scopes are selected at authorization time and do not need to be pre-configured in the dashboard. However, ensure you only request scopes your app is entitled to.

For the v5 API, the scopes to request are:

- `boards:read` — Read a user's boards
- `pins:read` — Read a user's pins
- `user_accounts:read` — Read basic account information

These three scopes are available without special review. Build your authorization URL with:

```
scope=boards:read,pins:read,user_accounts:read
```

### Step 5 — Approval Process

- **Read-only scopes** (`boards:read`, `pins:read`, `user_accounts:read`): No review required — available immediately.
- **Ads API access:** Requires a separate application through the Pinterest Partner Program. This is not needed for the scopes listed above.
- After app creation, your app starts in **Development mode**, which limits OAuth to 25 authorized users. To lift this limit, submit for production access through the app settings.

**To request production access:**

1. On your app page, look for **"Request production access"** or **"Upgrade to production"**.
2. Provide your app's use case description and confirm your privacy policy URL.
3. Pinterest reviews within a few business days.

### Step 6 — Retrieve Your Credentials

1. On your app detail page:
   - **App ID** is shown at the top — this is your `PINTEREST_CLIENT_ID`
   - **App secret key** is shown below (may be masked) — click **"Show"** to reveal, then copy (`PINTEREST_CLIENT_SECRET`)

### Step 7 — Test Before Going Live

1. Build the authorization URL:
   ```
   https://www.pinterest.com/oauth/?
     client_id=YOUR_APP_ID
     &redirect_uri=https://thedealstage.com/callback/pinterest
     &response_type=code
     &scope=boards:read,pins:read,user_accounts:read
     &state=RANDOM_STATE_STRING
   ```
2. Visit the URL, authorize with a Pinterest test account.
3. Exchange the code at `https://api.pinterest.com/v5/oauth/token` using Basic Auth (client_id:client_secret).
4. Test a basic call: `GET https://api.pinterest.com/v5/user_account` with the Bearer token.

### Step 8 — Common Pitfalls

- **API version matters.** Pinterest has v3 and v5 APIs. Always use v5 (`https://api.pinterest.com/v5/`). The v3 API is deprecated and responses differ significantly.
- **Development mode cap.** The 25-user cap in Development mode will block testing at team scale. Request production access early.
- **Rate limit is per token.** 10 requests/second applies per access token (per user), not per app globally. This is more generous than it appears.
- **Refresh tokens expire.** Pinterest access tokens last 1 hour; refresh tokens last 365 days. Note that after 365 days, users must re-authorize.

### Step 9 — Environment Variables

```
PINTEREST_CLIENT_ID=your_app_id_here
PINTEREST_CLIENT_SECRET=your_app_secret_here
PINTEREST_REDIRECT_URI=https://thedealstage.com/callback/pinterest
PINTEREST_SCOPES=boards:read,pins:read,user_accounts:read
```

### Step 10 — Pricing

Pinterest API access is **free** for all read-only scopes. Pinterest Ads API access requires separate program enrollment. No per-request charges for standard API usage.

---

## 6. Reddit

**Auth method:** OAuth 2.0
**Console:** https://www.reddit.com/prefs/apps
**Callback URL:** `https://thedealstage.com/callback/reddit`
**Required scopes:** `identity`, `read`, `mysubreddits`
**Rate limits:** 60 requests/minute
**Approval required:** No

> **GOTCHA — Reddit identifies apps by User-Agent, not just credentials.** Reddit's API terms require you to send a descriptive `User-Agent` header with every request. Requests without a proper User-Agent are rate-limited to 10 req/minute and can be banned. Format: `platform:app_id:version (by /u/your_reddit_username)`.

### Step 1 — Create a Reddit Developer Account

Reddit uses your regular Reddit account as the developer account — there is no separate developer portal.

1. Log into Reddit at https://www.reddit.com with the account you want to own the app. Use a dedicated team/business account, not a personal account.
2. Navigate directly to https://www.reddit.com/prefs/apps (this is the "App Preferences" page, reachable via **User Settings > Safety & Privacy > Manage third-party app authorization** — but using the direct link is easier).
3. Scroll to the bottom of the page to find the **"Developed Applications"** section.

### Step 2 — Create a New App

1. Click **"create another app..."** (the button at the bottom of the Developed Applications section — it appears even if you have no apps yet).
2. Fill in the form:
   - **Name:** `DealStage`
   - **App type:** Select **"web app"** (this is the correct type for server-side OAuth with a callback URL)
   - **Description:** Optional — but add something descriptive for your own records
   - **About URL:** `https://thedealstage.com`
   - **Redirect URI:** `https://thedealstage.com/callback/reddit`
3. Click **"create app"**.

> **GOTCHA — App types have different OAuth flows.** "web app" supports the Authorization Code flow (recommended — supports refresh tokens). "installed app" is for mobile/desktop apps without a server-side secret. "script" is for personal-use automation. For DealStage, always use "web app".

### Step 3 — Retrieve Your Credentials

Immediately after creating the app, you will see it listed under "Developed Applications":

1. The **Client ID** is the string shown directly under the app name (a short alphanumeric string) — copy this (`REDDIT_CLIENT_ID`)
2. Click **"edit"** on your app listing to see the **Secret** field — copy this (`REDDIT_CLIENT_SECRET`)

> **GOTCHA — The Client ID is easy to miss.** It appears as a small, unlabeled string directly under your app name (to the right of the app icon), not in a labeled field. It looks like: `AbCdEfGhIjKlMn`. Do not confuse it with the longer Secret string.

### Step 4 — Configure Scopes

Reddit scopes are requested at authorization time. The scopes you need:

| Scope          | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `identity`     | Read the currently authenticated user's account information      |
| `read`         | Read posts and comments from subreddits                          |
| `mysubreddits` | Read the list of subreddits the user subscribes to and moderates |

### Step 5 — Approval Process

Reddit does not require app review for standard OAuth. Your app is usable immediately after creation. However:

- Reddit may suspend API access if you violate their Data API Terms (https://www.redditinc.com/policies/data-api-terms)
- High-volume API users may need to apply for increased rate limits separately
- Reddit made significant API access changes in 2023 — verify current terms are acceptable for your use case before building

### Step 6 — Test Before Going Live

1. Build the authorization URL:
   ```
   https://www.reddit.com/api/v1/authorize?
     client_id=YOUR_CLIENT_ID
     &response_type=code
     &state=RANDOM_STATE_STRING
     &redirect_uri=https://thedealstage.com/callback/reddit
     &duration=permanent
     &scope=identity read mysubreddits
   ```
   Note: Use `duration=permanent` to receive a refresh token. Use `duration=temporary` for a one-time token that expires in 1 hour.
2. Exchange the code at `https://www.reddit.com/api/v1/access_token` using HTTP Basic Auth (client_id as username, client_secret as password).
3. Test: `GET https://oauth.reddit.com/api/v1/me` with `Authorization: Bearer YOUR_TOKEN` and your `User-Agent` header.

**Required User-Agent format:**

```
User-Agent: web:thedealstage:v1.0.0 (by /u/YOUR_REDDIT_USERNAME)
```

### Step 7 — Common Pitfalls

- **Missing or wrong User-Agent causes silent throttling.** You will receive responses, but they will be slower and eventually blocked. Always include the User-Agent.
- **OAuth base URL vs. API base URL.** Authorization happens at `reddit.com`. Authenticated API calls go to `oauth.reddit.com` — not `api.reddit.com`. The subdomain matters.
- **Rate limit is 60 req/minute per OAuth client.** This is shared across all users of your app — not per-user. At scale, you will need to implement a request queue.
- **Token revocation.** Reddit users can revoke your app's access at any time at https://www.reddit.com/prefs/apps. Handle 401 responses gracefully by prompting re-authorization.
- **2023 API changes.** Reddit significantly restricted free API access in 2023. Verify that the data you need is still accessible under current terms.

### Step 8 — Environment Variables

```
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_REDIRECT_URI=https://thedealstage.com/callback/reddit
REDDIT_SCOPES=identity read mysubreddits
REDDIT_USER_AGENT=web:thedealstage:v1.0.0 (by /u/your_reddit_username)
```

### Step 9 — Pricing

Reddit's standard API is **free** up to 100 queries per minute per OAuth client. Above that, you must contact Reddit for a Data API access agreement, which may be paid. For typical analytics use at the scopes listed, the free tier is sufficient.

---

## 7. Bluesky

**Auth method:** OAuth 2.0 via AT Protocol
**Console:** https://bsky.app/settings (no formal developer console)
**Callback URL:** `https://thedealstage.com/callback/bluesky`
**Required scopes:** `atproto` (transition scope), plus specific `com.atproto.*` and `app.bsky.*` lexicon scopes
**Approval required:** No
**Rate limits:** Not formally published — varies by endpoint

> **GOTCHA — Bluesky is fundamentally different from other platforms.** Bluesky is built on the AT Protocol (atproto), a decentralized protocol. There is no central developer registration portal, no app approval process, and no admin console. OAuth is handled through a standards-based flow using metadata documents published at your domain. This is more complex to set up than traditional OAuth but also more flexible.

### Step 1 — Understand the AT Protocol OAuth Model

Unlike other platforms, Bluesky's OAuth requires you to:

1. Publish a **client metadata document** at a well-known URL on your domain
2. Publish a **DID (Decentralized Identifier) document** (optional but recommended for production)
3. Use the AT Protocol OAuth Authorization Server (run by Bluesky or any PDS host) to authorize users

No account registration is needed. Your app is identified by its **client metadata URL**.

### Step 2 — Publish Your Client Metadata Document

1. Create the following JSON file and publish it at: `https://thedealstage.com/client-metadata.json`

   ```json
   {
     "client_id": "https://thedealstage.com/client-metadata.json",
     "client_name": "DealStage",
     "client_uri": "https://thedealstage.com",
     "logo_uri": "https://thedealstage.com/logo.png",
     "tos_uri": "https://thedealstage.com/terms",
     "policy_uri": "https://thedealstage.com/privacy",
     "redirect_uris": ["https://thedealstage.com/callback/bluesky"],
     "scope": "atproto transition:generic",
     "grant_types": ["authorization_code", "refresh_token"],
     "response_types": ["code"],
     "token_endpoint_auth_method": "private_key_jwt",
     "application_type": "web",
     "dpop_bound_access_tokens": true
   }
   ```

2. Ensure this file is:
   - Served with `Content-Type: application/json`
   - Accessible over HTTPS
   - Available at exactly that URL (no redirects)

> **GOTCHA — The `client_id` IS the URL.** In AT Protocol OAuth, there is no separate Client ID string. Your Client ID is literally `https://thedealstage.com/client-metadata.json`. This URL must be stable — changing it breaks existing user sessions.

### Step 3 — Generate a Key Pair for Client Authentication

AT Protocol OAuth requires `private_key_jwt` client authentication. You need to generate an asymmetric key pair.

1. Generate an ES256 key pair (recommended):
   ```bash
   # Using OpenSSL
   openssl ecparam -name prime256v1 -genkey -noout -out private.pem
   openssl ec -in private.pem -pubout -out public.pem
   ```
2. Convert the public key to JWK format (JSON Web Key). Use a library like `jose` (Node.js) or `PyJWT` (Python) to export the public key as JWK.
3. Add the public key to your `client-metadata.json` under a `jwks` key:
   ```json
   {
     ...existing fields...,
     "jwks": {
       "keys": [
         {
           "kty": "EC",
           "crv": "P-256",
           "x": "your_x_value",
           "y": "your_y_value",
           "kid": "key-1"
         }
       ]
     }
   }
   ```
4. Store the **private key** securely in your secrets manager. Never expose it.

### Step 4 — Implement the AT Protocol OAuth Flow

The AT Protocol OAuth flow differs from standard OAuth 2.0:

1. **User enters their Bluesky handle** (e.g., `alice.bsky.social` or a custom domain)
2. **Resolve the user's PDS (Personal Data Server):**
   - Resolve the handle to a DID: `GET https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=alice.bsky.social`
   - Fetch the DID document to find the user's PDS endpoint
3. **Fetch the PDS Authorization Server metadata:** `GET {pds_url}/.well-known/oauth-authorization-server`
4. **Build and send the Pushed Authorization Request (PAR):**
   - `POST` to the `pushed_authorization_request_endpoint` from the metadata
   - Include: `client_id`, `redirect_uri`, `scope`, `state`, `code_challenge`, `code_challenge_method`
   - Sign with your private key using `private_key_jwt`
5. **Redirect the user** to the `authorization_endpoint` with the `request_uri` returned from PAR
6. **Handle the callback** at `https://thedealstage.com/callback/bluesky` and exchange the code for tokens
7. **Bind tokens to DPoP** (Demonstration of Proof of Possession) — required for all AT Protocol OAuth

> **GOTCHA — DPoP is mandatory.** Every access token request and API call requires a DPoP proof header. This is more complex than standard Bearer tokens. Use a library that supports DPoP (e.g., the `@atproto/oauth-client-browser` or `@atproto/oauth-client-node` packages).

### Step 5 — Recommended Client Libraries

Rather than implementing the AT Protocol OAuth flow from scratch, use official libraries:

- **Node.js:** `@atproto/oauth-client-node` (https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-node)
- **Browser:** `@atproto/oauth-client-browser`
- Documentation: https://docs.bsky.app/docs/get-started

Install:

```bash
npm install @atproto/oauth-client-node
```

### Step 6 — Test Before Going Live

1. Deploy your `client-metadata.json` to thedealstage.com and verify it is accessible: `curl https://thedealstage.com/client-metadata.json`
2. Use a test Bluesky account at https://bsky.app to test the authorization flow.
3. Bluesky does not have a sandbox — all testing uses the live Bluesky network. Use a dedicated test account (`testuser.bsky.social`).
4. After authorization, test a basic API call:
   ```
   GET https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=testuser.bsky.social
   Authorization: DPoP YOUR_ACCESS_TOKEN
   DPoP: YOUR_DPOP_PROOF
   ```

### Step 7 — Common Pitfalls

- **Bluesky is still evolving.** The AT Protocol OAuth spec was finalized in late 2024 and implementations are still maturing. Breaking changes are possible. Monitor the AT Protocol changelog at https://atproto.com/.
- **Not all PDS hosts support AT Protocol OAuth.** The main Bluesky PDS (`bsky.social`) does. Self-hosted PDS instances may have different support levels.
- **Custom domain handles complicate handle resolution.** A user with `alice.thedealstage.com` as their Bluesky handle requires DNS-based or `did:web` resolution. Plan for this if your users may have custom handles.
- **There is no refresh endpoint at a fixed URL.** The token endpoint is per-PDS and discovered dynamically. Your token refresh logic must store the PDS-specific token endpoint URL alongside each user's tokens.
- **Rate limits are not formally documented.** Be conservative with request frequency and implement backoff on any 429 or 5xx response.

### Step 8 — Environment Variables

```
BLUESKY_CLIENT_ID=https://thedealstage.com/client-metadata.json
BLUESKY_REDIRECT_URI=https://thedealstage.com/callback/bluesky
BLUESKY_PRIVATE_KEY_PATH=/secrets/bluesky_private.pem
# Or store the key inline as a JWK JSON string:
BLUESKY_PRIVATE_KEY_JWK={"kty":"EC","crv":"P-256",...}
```

### Step 9 — Pricing

Bluesky API access is **free**. The AT Protocol is an open protocol — there are no licensing fees, no per-request charges, and no tier system. This may change as the ecosystem matures.

---

## Environment Variables Reference

All environment variables required across all integrations, for use in `.env` or your secrets manager:

```bash
# ─────────────────────────────────────────────
# TIKTOK
# ─────────────────────────────────────────────
TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://thedealstage.com/callback/tiktok
TIKTOK_SCOPES=user.info.basic,user.info.stats,video.list

# ─────────────────────────────────────────────
# TWITTER / X
# ─────────────────────────────────────────────
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=https://thedealstage.com/callback/twitter
TWITTER_SCOPES=tweet.read users.read follows.read offline.access
TWITTER_BEARER_TOKEN=

# ─────────────────────────────────────────────
# LINKEDIN
# ─────────────────────────────────────────────
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=https://thedealstage.com/callback/linkedin
LINKEDIN_SCOPES=openid profile email r_organization_social

# ─────────────────────────────────────────────
# SNAPCHAT
# ─────────────────────────────────────────────
SNAPCHAT_CLIENT_ID=
SNAPCHAT_CLIENT_SECRET=
SNAPCHAT_REDIRECT_URI=https://thedealstage.com/callback/snapchat

# ─────────────────────────────────────────────
# PINTEREST
# ─────────────────────────────────────────────
PINTEREST_CLIENT_ID=
PINTEREST_CLIENT_SECRET=
PINTEREST_REDIRECT_URI=https://thedealstage.com/callback/pinterest
PINTEREST_SCOPES=boards:read,pins:read,user_accounts:read

# ─────────────────────────────────────────────
# REDDIT
# ─────────────────────────────────────────────
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_REDIRECT_URI=https://thedealstage.com/callback/reddit
REDDIT_SCOPES=identity read mysubreddits
REDDIT_USER_AGENT=web:thedealstage:v1.0.0 (by /u/your_reddit_username)

# ─────────────────────────────────────────────
# BLUESKY (AT Protocol OAuth)
# ─────────────────────────────────────────────
BLUESKY_CLIENT_ID=https://thedealstage.com/client-metadata.json
BLUESKY_REDIRECT_URI=https://thedealstage.com/callback/bluesky
BLUESKY_PRIVATE_KEY_JWK=
```

> **SECURITY NOTE:** Never commit these values to source control. Use a secrets manager (AWS Secrets Manager, Doppler, Vault, or equivalent) and inject at runtime. Ensure `.env` is in your `.gitignore` and verify with `git status` before every commit.

---

## Approval Timeline Summary

| Platform                | Review Required               | Estimated Time    | Notes                           |
| ----------------------- | ----------------------------- | ----------------- | ------------------------------- |
| TikTok                  | Yes (all scopes)              | 2–3 weeks         | Apply before building           |
| Twitter / X             | No                            | Immediate         | Billing setup required          |
| LinkedIn                | Yes (`r_organization_social`) | 3–7 business days | `openid profile email` instant  |
| Snapchat Login Kit      | No                            | Immediate         | —                               |
| Snapchat Story Kit      | Yes                           | 1–2 weeks         | Apply separately from Login Kit |
| Pinterest (read scopes) | Production access only        | 2–5 business days | Dev mode limited to 25 users    |
| Reddit                  | No                            | Immediate         | No formal review                |
| Bluesky                 | No                            | Immediate         | No developer portal             |

**Recommended sequence:** Submit TikTok and Snapchat Story Kit first (longest review times), then LinkedIn, then Pinterest production access. Build against Reddit, Twitter, and Bluesky while the others are under review.

---

## Token Refresh Reference

| Platform    | Access Token Expiry                     | Refresh Token Expiry               | Refresh Required             |
| ----------- | --------------------------------------- | ---------------------------------- | ---------------------------- |
| TikTok      | 24 hours                                | 365 days                           | Yes                          |
| Twitter / X | 2 hours                                 | Indefinite (with `offline.access`) | Yes                          |
| LinkedIn    | 60 days                                 | 365 days                           | Yes                          |
| Snapchat    | 1 hour                                  | 90 days                            | Yes                          |
| Pinterest   | 1 hour                                  | 365 days                           | Yes                          |
| Reddit      | 1 hour (permanent tokens do not expire) | N/A with `permanent`               | No (if `duration=permanent`) |
| Bluesky     | Varies by PDS                           | Varies by PDS                      | Yes                          |

> **IMPLEMENTATION NOTE:** Build a token refresh service that runs on a schedule and proactively refreshes tokens before they expire — do not wait for an API call to fail. Tokens that expire while a user is inactive require re-authorization, which creates friction. A refresh at 75% of the token lifetime is a common pattern.
