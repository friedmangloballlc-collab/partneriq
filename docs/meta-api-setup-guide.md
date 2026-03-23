# Meta API Setup Guide: Instagram, Facebook, and Threads

**Domain:** thedealstage.com
**Last updated:** 2026-03-21
**Applies to:** PartnerIQ — all three user roles (Brand, Talent, Agency)

---

## Overview

Instagram, Facebook, and Threads all run through a single Meta Developer App. You create the app once, then add each platform as a "product" inside that same app. All three platforms share one App ID and one App Secret, and each platform gets its own OAuth redirect URI.

**Your three callback URLs:**

| Platform  | Callback URL                                  |
| --------- | --------------------------------------------- |
| Instagram | `https://thedealstage.com/callback/instagram` |
| Facebook  | `https://thedealstage.com/callback/facebook`  |
| Threads   | `https://thedealstage.com/callback/threads`   |

---

## Part 1 — Create the Meta Developer App (Do This Once)

### Step 1: Create or log in to your Meta Developer account

1. Go to [https://developers.facebook.com](https://developers.facebook.com).
2. Click **"Get Started"** in the top-right corner (or **"Log In"** if you already have an account).
3. Log in with the Facebook account that will own this app. This account becomes the app admin. Use a business account, not a personal account you might lose access to.
4. If prompted, complete phone number verification.

> **Gotcha:** The Facebook account you use here becomes the permanent app owner. If that person leaves your organization, recovering admin access requires going through Meta Business Support. Use a shared business email or a role account, not an individual's personal profile.

### Step 2: Register as a Meta developer (first time only)

1. After logging in, Meta will ask you to confirm your developer registration.
2. Click **"Register"** and accept the Meta Platform Policies.
3. You may be asked to verify your phone number again.

### Step 3: Create the app

1. On the Meta for Developers home page, click **"My Apps"** in the top navigation bar.
2. Click the green **"Create App"** button.
3. You will see a screen titled **"What do you want your app to do?"** with several use-case cards. Select **"Other"** at the bottom (this gives you full product flexibility without locking into a narrow template).
4. Click **"Next"**.
5. On the next screen, select **"Business"** as the app type.
6. Click **"Next"**.
7. Fill in the app details form:
   - **App name:** `PartnerIQ` (or your preferred display name — users will see this during OAuth)
   - **App contact email:** Use a monitored inbox, such as `dev@thedealstage.com`
   - **Business Account:** If you have a Meta Business Account, link it here. If not, you can skip this for now and link it later under **App Settings > Basic**. Linking a Business Account is required before submitting for App Review.
8. Click **"Create App"**.
9. Meta may prompt you to complete a security check (CAPTCHA or re-authentication).

You are now inside the App Dashboard. The URL will look like `https://developers.facebook.com/apps/YOUR_APP_ID/dashboard/`.

> **Gotcha:** App names are public-facing. Whatever you type here is what users will read on the OAuth consent screen ("PartnerIQ is requesting access to your account"). Choose a name that matches your product's public branding.

---

### Step 4: Retrieve your App ID and App Secret

You will need these immediately. Do not skip this step.

1. In the left sidebar, click **"App Settings"**, then click **"Basic"**.
2. At the top of the page you will see:
   - **App ID** — a long numeric string (e.g., `1234567890123456`). Copy this now.
   - **App Secret** — hidden by default. Click the **"Show"** button next to App Secret, re-authenticate with your Facebook password if prompted, then copy the value.
3. Store both values securely (see Environment Variables section at the end of this guide).

> **Gotcha:** The App Secret is equivalent to a private key. Never commit it to a git repository, never put it in client-side code, and never log it. If it is ever exposed, immediately go to App Settings > Basic and click **"Reset"** next to App Secret to generate a new one and invalidate the old one.

---

### Step 5: Set App domains and privacy policy

Still in **App Settings > Basic**:

1. Scroll down to the **"App Domains"** field and enter `thedealstage.com`. Press Enter.
2. In **"Privacy Policy URL"**, enter `https://thedealstage.com/privacy`.
3. In **"Terms of Service URL"**, enter `https://thedealstage.com/terms`.
4. In **"App Icon"**, upload a 1024x1024 PNG of the PartnerIQ logo. This appears on the OAuth consent screen.
5. Click **"Save Changes"** at the bottom.

> **Gotcha:** App Review will be rejected if these URLs return 404 or are blank pages. Make sure both pages are live and accessible before submitting for review.

---

## Part 2 — Add Instagram (Instagram API with Instagram Login)

> **Important:** The Instagram Basic Display API was deprecated in December 2024 and is no longer functional. The current approach is the **Instagram API with Instagram Login**, which does not require a Facebook Page and is designed for creators connecting their personal Instagram accounts directly.

### Step 6: Add the Instagram product to your app

1. In the left sidebar, click **"Add Product"** (near the bottom of the sidebar).
2. On the product catalog page, find the card labeled **"Instagram"** and click **"Set Up"**.
3. Meta will add Instagram to your app and redirect you to the Instagram product section.

### Step 7: Configure Instagram OAuth settings

1. In the left sidebar, you will now see an **"Instagram"** section. Click it to expand, then click **"API setup with Instagram login"**.
2. You will see a screen with a **"Set up Instagram Login"** button. Click it.
3. Under the **"Instagram Login"** section that appears, click **"Settings"** in the sub-navigation.
4. Find the field labeled **"Valid OAuth Redirect URIs"**.
5. Click **"Add URI"** and enter exactly: `https://thedealstage.com/callback/instagram`
6. Click **"Save Changes"**.

> **Gotcha:** The redirect URI must match character-for-character what your app sends in the OAuth request, including the `https://` prefix and no trailing slash. A mismatch causes an immediate OAuth error with code `redirect_uri_mismatch`. Do not add a trailing slash.

### Step 8: Request Instagram permissions (scopes)

1. Still in the Instagram section, look for **"Permissions"** in the sub-navigation.
2. You need the following three permissions:

   | Permission                  | Purpose                                     | Review required?                   |
   | --------------------------- | ------------------------------------------- | ---------------------------------- |
   | `instagram_basic`           | Read profile info, media, follower counts   | No — available in development mode |
   | `instagram_manage_insights` | Read post-level and account-level analytics | Yes — requires App Review          |
   | `instagram_content_publish` | Publish photos, videos, reels to Instagram  | Yes — requires App Review          |

3. Permissions that require App Review will show a status of **"Not submitted"**. You can still use them during development for test users (see Part 5).

### Step 9: Generate the Instagram OAuth URL

The authorization URL for Instagram Login follows this format:

```
https://www.instagram.com/oauth/authorize
  ?client_id=YOUR_APP_ID
  &redirect_uri=https://thedealstage.com/callback/instagram
  &scope=instagram_basic,instagram_manage_insights,instagram_content_publish
  &response_type=code
  &state=RANDOM_CSRF_TOKEN
```

Send users to this URL to begin the OAuth flow. After authorization, Instagram redirects to your callback URL with a `code` parameter that you exchange server-side for an access token.

> **Gotcha:** Always include a `state` parameter containing a random, unguessable token that you store server-side and verify when the callback arrives. This prevents CSRF attacks. Never skip the state check.

---

## Part 3 — Add Facebook Login

### Step 10: Add the Facebook Login product to your app

1. In the left sidebar, click **"Add Product"**.
2. Find the card labeled **"Facebook Login"** and click **"Set Up"**.
3. On the Quickstart page that appears, ignore the framework-specific instructions and click **"Settings"** in the **"Facebook Login"** sub-navigation in the left sidebar.

### Step 11: Configure Facebook Login OAuth settings

1. You are now on the **Facebook Login > Settings** page.
2. Find the field labeled **"Valid OAuth Redirect URIs"**.
3. Click **"Add URI"** and enter exactly: `https://thedealstage.com/callback/facebook`
4. Make sure the toggle labeled **"Client OAuth Login"** is set to **On** (blue).
5. Make sure the toggle labeled **"Web OAuth Login"** is set to **On** (blue).
6. Make sure the toggle labeled **"Enforce HTTPS"** is set to **On** (blue). This cannot be turned off for production.
7. Click **"Save Changes"**.

### Step 12: Request Facebook permissions (scopes)

Navigate to **App Review > Permissions and Features** in the left sidebar (or find the Permissions section within Facebook Login settings):

| Permission              | Purpose                                         | Review required?                    |
| ----------------------- | ----------------------------------------------- | ----------------------------------- |
| `public_profile`        | Name, profile picture, user ID                  | No — granted by default to all apps |
| `pages_read_posts`      | Read posts from Facebook Pages the user manages | Yes — requires App Review           |
| `pages_read_engagement` | Read Page likes, comments, engagement data      | Yes — requires App Review           |

> **Gotcha:** `public_profile` is automatically included in every Facebook OAuth request and does not need to be explicitly listed in the scope parameter. However, it does not hurt to include it explicitly for clarity.

### Step 13: Generate the Facebook OAuth URL

```
https://www.facebook.com/v21.0/dialog/oauth
  ?client_id=YOUR_APP_ID
  &redirect_uri=https://thedealstage.com/callback/facebook
  &scope=public_profile,pages_read_posts,pages_read_engagement
  &response_type=code
  &state=RANDOM_CSRF_TOKEN
```

> **Gotcha:** Always include the API version in the Facebook OAuth URL (e.g., `v21.0`). Without a version, Meta uses a default version that may change without notice. Check [https://developers.facebook.com/docs/graph-api/changelog](https://developers.facebook.com/docs/graph-api/changelog) for the current stable version.

---

## Part 4 — Add Threads

### Step 14: Add the Threads product to your app

1. In the left sidebar, click **"Add Product"**.
2. Find the card labeled **"Threads API"** and click **"Set Up"**.

> **Gotcha:** If you do not see Threads API in the product catalog, your app may need to be of type "Business." Return to App Settings > Basic and verify the app type. Some regions also have a limited rollout — if the product is not visible, check the Threads API documentation at [https://developers.facebook.com/docs/threads/get-started](https://developers.facebook.com/docs/threads/get-started) for current availability.

### Step 15: Configure Threads OAuth settings

1. In the left sidebar, click **"Threads API"** to expand it, then click **"Settings"**.
2. Find the field labeled **"Redirect Callback URLs"**.
3. Enter exactly: `https://thedealstage.com/callback/threads`
4. Click **"Save Changes"**.

### Step 16: Request Threads permissions (scopes)

| Permission              | Purpose                                     | Review required?                   |
| ----------------------- | ------------------------------------------- | ---------------------------------- |
| `threads_basic`         | Read profile info, posts, replies           | No — available in development mode |
| `threads_read_insights` | Read post-level and account-level analytics | Yes — requires App Review          |

### Step 17: Generate the Threads OAuth URL

```
https://threads.net/oauth/authorize
  ?client_id=YOUR_APP_ID
  &redirect_uri=https://thedealstage.com/callback/threads
  &scope=threads_basic,threads_read_insights
  &response_type=code
  &state=RANDOM_CSRF_TOKEN
```

> **Gotcha:** Threads OAuth uses `threads.net` as the authorization domain, not `facebook.com` or `instagram.com`. Using the wrong domain is a common copy-paste mistake that results in a "page not found" error.

---

## Part 5 — Development Mode and Test Users

### Step 18: Understand development mode

When you first create a Meta app it is in **Development Mode**. In this mode:

- The app works only for users who have been explicitly added as app roles (Admins, Developers, or Testers).
- Permissions that require App Review are available to these test users without needing review.
- Real users outside your test user list will not be able to authorize your app.
- Rate limits are enforced the same way as production (200 calls/hour per platform).

This means you can build and test the full OAuth flow, including restricted permissions, before going through App Review.

### Step 19: Add test users

1. In the left sidebar, go to **"Roles"**, then click **"Roles"** in the sub-menu.
2. Under **"Testers"**, click **"Add Testers"**.
3. Search for a Facebook profile by name or Facebook username and click **"Submit"**.
4. The invited person will receive a Facebook notification asking them to accept the tester role. They must accept before they can use the app.

> **Gotcha:** The test user must accept the invitation from their own Facebook account (via the notification bell icon or [https://developers.facebook.com/settings/developer/requests/](https://developers.facebook.com/settings/developer/requests/)). Until they accept, adding them has no effect.

### Step 20: Test the OAuth flows end to end

1. As an Admin, Developer, or Tester of the app, initiate the OAuth flow for each platform using the URLs from Steps 9, 13, and 17.
2. For Instagram: you will be redirected to `instagram.com` where you log in with an Instagram account and grant permissions.
3. For Facebook: you will be redirected to `facebook.com` where you log in and select which Pages to grant access to.
4. For Threads: you will be redirected to `threads.net` where you log in and grant access.
5. After authorization, each platform redirects to the respective callback URL with a `code` query parameter.
6. Exchange the code for an access token using a server-side POST request to:
   - Instagram: `https://api.instagram.com/oauth/access_token`
   - Facebook: `https://graph.facebook.com/v21.0/oauth/access_token`
   - Threads: `https://graph.threads.net/oauth/access_token`

All three exchanges use the same App ID and App Secret.

> **Gotcha:** Never exchange authorization codes from client-side JavaScript. The exchange endpoint requires your App Secret, which must never be exposed to a browser. Always perform the token exchange inside a server-side function, a Supabase Edge Function, or a Vercel serverless function.

---

## Part 6 — App Review

### Step 21: Understand what requires App Review

App Review is a manual process where Meta reviews your app to ensure it complies with their Platform Policies before granting access to advanced permissions for general public users. The following permissions in this guide require review:

| Permission                  | Platform  | Review type |
| --------------------------- | --------- | ----------- |
| `instagram_manage_insights` | Instagram | Standard    |
| `instagram_content_publish` | Instagram | Standard    |
| `pages_read_posts`          | Facebook  | Standard    |
| `pages_read_engagement`     | Facebook  | Standard    |
| `threads_read_insights`     | Threads   | Standard    |

The following permissions do NOT require review:

- `instagram_basic`
- `public_profile`
- `threads_basic`

### Step 22: Prepare for App Review submission

Before submitting, you must have:

1. A live, accessible app at `https://thedealstage.com` (Meta reviewers will visit it).
2. A working Privacy Policy page at the URL set in Step 5.
3. A working Terms of Service page at the URL set in Step 5.
4. A linked Meta Business Account (App Settings > Basic > Business Account).
5. A screencast video for each permission demonstrating exactly how your app uses the data.
6. Complete the **"Data Use Checkup"** if prompted (found under **App Review** in the left sidebar).

### Step 23: Submit each permission for review

1. In the left sidebar, go to **"App Review"**, then click **"Permissions and Features"**.
2. For each permission that requires review, click **"Request Advanced Access"** next to it.
3. For each permission, you must provide:
   - **App verification** (business verification, if not already completed)
   - **Use case description** — explain in plain language why your app needs this permission. Be specific: "PartnerIQ is a creator-brand partnership platform. We use `instagram_manage_insights` to display engagement rate, reach, and impression data to Brands who are evaluating Talent for partnership deals."
   - **Screencast** — a 1 to 5 minute screen recording showing the permission being used inside your app. Record someone completing the full OAuth flow through to the feature that uses the data.
4. Click **"Save"** on each permission, then click **"Submit for Review"** when all permissions are configured.

> **Gotcha:** Review times vary from 5 business days to several weeks. Meta may come back with questions or rejections requiring clarification. Monitor the contact email you set in App Settings > Basic for review update notifications.

> **Gotcha:** Each permission must be justified individually. Do not request permissions you have not built features for yet — Meta reviewers look for evidence of actual use in the screencast and reject speculative requests.

### Step 24: Switch to Live Mode after approval

1. Once App Review approves your permissions, go to **App Settings > Basic**.
2. At the top of the page, find the **"App Mode"** toggle showing **"Development"**.
3. Click the toggle to switch to **"Live"**.
4. Confirm the switch in the dialog that appears.

After switching to Live mode, any Facebook or Instagram user can begin the OAuth flow — not just your test users.

> **Gotcha:** Switching to Live mode does not affect permissions that are still in development or pending review. Only approved permissions become available to all users. Unapproved permissions continue working only for app admins, developers, and testers.

---

## Part 7 — What Users See During the OAuth Flow

### Instagram consent screen

When a user clicks "Connect Instagram" in PartnerIQ, they are redirected to Instagram.com and see a consent screen that shows:

- Your app name (e.g., "PartnerIQ")
- Your app icon
- A list of requested permissions in plain language:
  - "Access your profile and media"
  - "Access your account insights"
  - "Publish content on your behalf"
- Buttons: **"Authorize"** and **"Cancel"**

After clicking Authorize, Instagram redirects to `https://thedealstage.com/callback/instagram?code=AUTH_CODE&state=YOUR_STATE`.

### Facebook consent screen

Facebook shows a multi-step dialog:

1. First screen: App name, icon, and a summary of requested permissions.
2. Second screen: "Which Pages do you want to use with PartnerIQ?" — the user selects one or more Pages.
3. Final screen: Summary confirmation.

After completing all steps, Facebook redirects to `https://thedealstage.com/callback/facebook?code=AUTH_CODE&state=YOUR_STATE`.

> **Gotcha:** If a user has no Facebook Pages, the Page selection step will show an empty list and they will not be able to grant `pages_read_posts` or `pages_read_engagement`. The callback will still fire, but the access token will not have Page permissions attached. Your callback handler must check for this case and show an appropriate message.

### Threads consent screen

Threads shows a simple consent screen on threads.net with:

- App name and icon
- Permission descriptions
- **"Authorize"** and **"Cancel"** buttons

After authorization, Threads redirects to `https://thedealstage.com/callback/threads?code=AUTH_CODE&state=YOUR_STATE`.

---

## Part 8 — Environment Variables

Add the following variables to both your local `.env` file and your Vercel project environment settings.

### Client-side variables (safe to expose to the browser)

```env
VITE_META_APP_ID=your_app_id_here
```

This is your numeric App ID from App Settings > Basic. It is included in all OAuth URLs and is visible to end users, so it is safe to expose as a `VITE_` prefixed variable.

### Server-side variables (must never reach the browser)

These go in Vercel as "Server" environment variables (not exposed to the browser) and as Supabase Edge Function secrets:

```env
META_APP_SECRET=your_app_secret_here
```

### Full environment variable block for `.env.example`

Add these lines to `/Users/poweredbyexcellence/partneriq/.env.example`:

```env
# Meta (Instagram, Facebook, Threads) — shared app
VITE_META_APP_ID=                         # App ID from Meta App Settings > Basic
META_APP_SECRET=                          # App Secret — server-side only, never VITE_ prefix
```

### Where to set these in Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard) and open the PartnerIQ project.
2. Click **"Settings"**, then **"Environment Variables"**.
3. For `VITE_META_APP_ID`: set Environment to **Production, Preview, Development**, type **Plaintext**.
4. For `META_APP_SECRET`: set Environment to **Production, Preview, Development**, type **Sensitive** (Vercel encrypts it and does not expose it in build logs).
5. Click **"Save"** after each variable.
6. Redeploy the project for the new variables to take effect.

### Where to set these in Supabase Edge Functions

If your token exchange logic runs in a Supabase Edge Function:

```bash
supabase secrets set META_APP_SECRET=your_app_secret_here
```

---

## Part 9 — Common Pitfalls and Gotchas (Consolidated)

| Pitfall                                | What happens                                                                 | How to avoid                                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Wrong redirect URI                     | OAuth error `redirect_uri_mismatch` immediately                              | Copy the exact URI from this guide, no trailing slash, exact casing                                                  |
| App Secret in client code              | Secret exposed in browser dev tools; any user can make API calls as your app | Always use `META_APP_SECRET` without the `VITE_` prefix; handle token exchange server-side only                      |
| Missing `state` parameter              | Vulnerable to CSRF attacks                                                   | Generate a random token per session, store it, verify it in the callback                                             |
| Test user didn't accept invitation     | OAuth works for admin but fails for test user                                | Remind testers to accept the developer invitation from their Facebook notifications                                  |
| No Facebook Pages                      | `pages_read_posts` token has no page scope                                   | Handle empty Page selection gracefully in your callback with a clear user message                                    |
| Basic Display API still referenced     | API calls fail with 404 or deprecation errors                                | Use Instagram API with Instagram Login exclusively; remove any `graph.instagram.com/me` with Basic Display endpoints |
| API version not pinned in Facebook URL | Behavior changes when Meta rotates the default                               | Always include `v21.0` (or current stable) in Facebook Graph API URLs                                                |
| Switching to Live before App Review    | Restricted permissions fail for all real users                               | Only go Live after your restricted permissions are approved                                                          |
| App owner leaves the organization      | Cannot manage app without Facebook account access                            | Add a second Admin under App Roles before the original owner's account is deactivated                                |
| Privacy Policy URL returns 404         | App Review rejected immediately                                              | Ensure `/privacy` and `/terms` are live pages before submitting                                                      |
| Rate limit shared across all users     | At 200 calls/hr per user token, high-volume users hit limits                 | Implement caching for insight data; do not re-fetch on every page load; store results in Supabase                    |

---

## Part 10 — Rate Limits Reference

All three platforms share the same rate limit tier for this app:

| Platform  | Rate limit     | Limit type            |
| --------- | -------------- | --------------------- |
| Instagram | 200 calls/hour | Per user access token |
| Facebook  | 200 calls/hour | Per user access token |
| Threads   | 200 calls/hour | Per user access token |

Rate limit headers are returned in every API response:

- `X-App-Usage` — app-level usage
- `X-Business-Use-Case-Usage` — business use case usage

> **Gotcha:** Rate limits apply per user token, not per app. A Talent user connecting Instagram and then making 200 API calls exhausts their own token's limit without affecting any other user. However, if your server-side code makes calls on behalf of all users in a batch job, the aggregate can cause failures. Always check rate limit headers and implement exponential backoff.

---

## Quick Reference: Key URLs

| Purpose                          | URL                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Meta Developer Console           | https://developers.facebook.com/apps/                                              |
| App Settings                     | https://developers.facebook.com/apps/YOUR_APP_ID/settings/basic/                   |
| Add Products                     | https://developers.facebook.com/apps/YOUR_APP_ID/dashboard/                        |
| App Review                       | https://developers.facebook.com/apps/YOUR_APP_ID/review/                           |
| Instagram Login Settings         | https://developers.facebook.com/apps/YOUR_APP_ID/instagram-basic-display/settings/ |
| Facebook Login Settings          | https://developers.facebook.com/apps/YOUR_APP_ID/fb-login/settings/                |
| Threads API Settings             | https://developers.facebook.com/apps/YOUR_APP_ID/threads-api/settings/             |
| Instagram API Docs               | https://developers.facebook.com/docs/instagram-api/getting-started                 |
| Facebook Graph API Docs          | https://developers.facebook.com/docs/graph-api/get-started                         |
| Threads API Docs                 | https://developers.facebook.com/docs/threads/get-started                           |
| Graph API Explorer (for testing) | https://developers.facebook.com/tools/explorer/                                    |
| Access Token Debugger            | https://developers.facebook.com/tools/debug/accesstoken/                           |
