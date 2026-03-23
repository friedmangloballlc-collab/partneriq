# API Setup Guide: Creative & Newsletter Platforms

**Domain:** thedealstage.com
**Last Updated:** 2026-03-21
**Audience:** Developers setting up API integrations for the first time

---

> **Before You Begin**
> Keep a secure password manager or `.env` file open as you work through each platform. You will collect credentials — client IDs, secrets, and tokens — that must never be committed to version control. Each platform section ends with the exact environment variable names to use.

---

## Table of Contents

1. [Dribbble (OAuth)](#1-dribbble-oauth)
2. [Behance via Adobe (OAuth)](#2-behance-oauth-via-adobe)
3. [DeviantArt (OAuth)](#3-deviantart-oauth)
4. [Beehiiv (OAuth)](#4-beehiiv-oauth)
5. [ConvertKit / Kit (API Key)](#5-convertkit--kit-api-key)
6. [Medium (Integration Token)](#6-medium-integration-token)

---

## 1. Dribbble (OAuth)

**Console:** https://dribbble.com/account/applications
**Callback URL:** `https://thedealstage.com/callback/dribbble`
**Scopes:** `public`, `upload`
**Docs:** https://developer.dribbble.com/v2/#authentication

---

### Step 1 — Create a Dribbble account and verify it as a designer

Dribbble requires an active player account (not a prospect account) to register applications.

1. Go to https://dribbble.com and sign up or log in.
2. If your account shows "Prospect" status, you must be invited or drafted by an existing player before API access is available. Check your account status at https://dribbble.com/account.
3. Once your status shows **Player** or **Pro**, proceed to the next step.

> **Note:** If you are registering this app on behalf of an organization rather than a personal account, use the account that will own the integration credentials long-term. Dribbble does not support team-level application ownership.

---

### Step 2 — Register a new application

1. Navigate to https://dribbble.com/account/applications.
2. Click the button labeled **"Register a new application"** in the top-right corner of the page.
3. Fill in the registration form:
   - **Name:** `TheDealStage` (or your preferred display name — this appears to users on the OAuth consent screen)
   - **Description:** A brief sentence describing what your app does, for example: `TheDealStage connects creators with brand partnership opportunities.`
   - **Website URL:** `https://thedealstage.com`
   - **Callback URL:** `https://thedealstage.com/callback/dribbble`
     - This field is critical. Enter the URL exactly as shown — no trailing slash, no `www`, use `https`.
   - **Logo:** Upload a 400×300px PNG or JPG. This is shown to users during OAuth authorization.
4. Click **"Register application"**.

---

### Step 3 — Configure scopes

Dribbble scopes are not selected during app registration — they are requested at runtime when you initiate the OAuth flow. However, you must understand which scopes your app needs before building the authorization URL.

The two scopes required for this integration are:

| Scope    | What it allows                           |
| -------- | ---------------------------------------- |
| `public` | Read public profile, shots, and projects |
| `upload` | Upload new shots on behalf of the user   |

When constructing your authorization URL, include:

```
https://dribbble.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://thedealstage.com/callback/dribbble&scope=public+upload
```

---

### Step 4 — Approval process

Dribbble does **not** require a formal review process for most use cases. Your application is live immediately after registration. However:

- The `upload` scope requires your account to have **upload permissions** — verify this is enabled on your Dribbble account settings before testing.
- Automated uploading or bulk operations may trigger rate limiting. Dribbble's API is rate-limited to **60 requests per minute** per access token.

---

### Step 5 — Retrieve your credentials

1. After registration, you are redirected to your application's detail page.
2. You will see two values:
   - **Client ID** — a short alphanumeric string
   - **Client Secret** — a longer alphanumeric string (click **"Show"** to reveal it)
3. Copy both values immediately. The secret is partially masked after you leave this page.
4. If you need to rotate your secret later, return to https://dribbble.com/account/applications, click your app name, then click **"Reset secret"**.

---

### Step 6 — Test before going live

1. Construct the authorization URL using your Client ID:
   ```
   https://dribbble.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://thedealstage.com/callback/dribbble&scope=public+upload
   ```
2. Paste the URL into a browser. You should see a Dribbble consent screen showing your app name and requested permissions.
3. Click **"Allow"**. You will be redirected to `https://thedealstage.com/callback/dribbble?code=AUTHORIZATION_CODE`.
4. Exchange the code for an access token with a POST request:

   ```
   POST https://dribbble.com/oauth/token
   Content-Type: application/x-www-form-urlencoded

   client_id=YOUR_CLIENT_ID
   &client_secret=YOUR_CLIENT_SECRET
   &code=AUTHORIZATION_CODE
   &redirect_uri=https://thedealstage.com/callback/dribbble
   ```

5. A successful response returns JSON with an `access_token` field.
6. Test the token with a simple API call:
   ```
   GET https://api.dribbble.com/v2/user
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```
   You should receive the authenticated user's profile JSON.

---

### Step 7 — Common pitfalls

- **Callback URL mismatch:** The callback URL in your authorization request must exactly match what you registered. Even a difference in trailing slash causes a `redirect_uri mismatch` error.
- **Prospect account:** If your Dribbble account is still a Prospect, API endpoints return `401 Unauthorized`. Upgrade to a Player account first.
- **Upload scope rejection:** If a user has not enabled uploads on their own Dribbble account, the `upload` scope will be granted but upload API calls will return `403 Forbidden` for that specific user.
- **Token persistence:** Dribbble access tokens do not expire, but users can revoke them at any time from their Dribbble settings. Build a re-authorization flow to handle `401` responses gracefully.

---

### Step 8 — Environment variables

```env
DRIBBBLE_CLIENT_ID=your_client_id_here
DRIBBBLE_CLIENT_SECRET=your_client_secret_here
DRIBBBLE_REDIRECT_URI=https://thedealstage.com/callback/dribbble
```

---

---

## 2. Behance (OAuth via Adobe)

**Console:** https://developer.adobe.com/console/
**Callback URL:** `https://thedealstage.com/callback/behance`
**Scopes:** `openid`, `AdobeID`, `Behance.Projects`, `Behance.Appreciations`
**Docs:** https://developer.adobe.com/behance/

---

### Step 1 — Create an Adobe Developer account

Behance's API is managed entirely through the Adobe Developer Console. You must have an Adobe ID to proceed.

1. Go to https://developer.adobe.com/console/ and click **"Sign in"** in the top-right corner.
2. If you do not have an Adobe ID, click **"Create an account"** on the sign-in page. Use a company email address — Adobe accounts tied to business emails are easier to manage long-term.
3. Complete Adobe's email verification step.
4. Once signed in, you land on the Adobe Developer Console home page. You should see your name in the top-right corner.

---

### Step 2 — Create a new project

Adobe organizes API credentials inside Projects. Each project can contain multiple API credentials and services.

1. On the Adobe Developer Console home page, click **"Create new project"**.
2. You are placed in a new untitled project. Click **"Edit project"** (pencil icon) in the top-left to rename it. Use a name like `TheDealStage - Behance Integration`.
3. Click **"Save"**.

---

### Step 3 — Add the Behance API to your project

1. Inside your project, click the large **"+ Add to Project"** button.
2. From the dropdown, select **"API"**.
3. In the API search field, type `Behance`. Select **"Behance API"** from the results.
4. Click **"Next"**.
5. On the authentication type screen, select **"OAuth 2.0 Web App"** (not Server-to-Server, since this integration acts on behalf of users).
6. Click **"Next"**.

---

### Step 4 — Configure the OAuth redirect URI

1. On the OAuth configuration screen, find the field labeled **"Default redirect URI"**.
2. Enter: `https://thedealstage.com/callback/behance`
3. In the **"Redirect URI pattern"** field directly below it, enter the same URL as a regex pattern:
   ```
   https://thedealstage\.com/callback/behance
   ```
   (Note the backslash escaping the dot — this is required regex syntax in Adobe's console.)
4. Click **"Save configured API"**.

---

### Step 5 — Configure scopes

Adobe Behance scopes are provisioned at the API level — you do not select them manually. The Behance API automatically grants access to:

- **Behance.Projects** — Read a user's published projects
- **Behance.Appreciations** — Read appreciations (likes) data

These are the only scopes available for Behance through Adobe's developer platform. In your OAuth authorization URL, you will also need to include Adobe identity scopes:

```
openid AdobeID Behance.Projects Behance.Appreciations
```

---

### Step 6 — Approval process

Adobe does **not** require a manual app review for Behance API access in development mode. However:

- Your app starts in **Development Mode**, which limits access to users you explicitly add as testers.
- To allow any Adobe/Behance user to authorize your app, you must submit for **Production** access review.
- Navigate to your project, click **"Publish"** (or the approval workflow button), and complete Adobe's application review form, describing your use case and expected user volume.
- Review can take 3–10 business days.

> **Callout — Development vs. Production:** During development, only Adobe accounts you add under "Allowed Users" can authorize the app. Add your test accounts there before testing.

---

### Step 7 — Retrieve your credentials

1. Inside your Adobe project, click on **"OAuth Web App"** under the Credentials section in the left sidebar.
2. You will see:
   - **Client ID** — copy this value
   - **Client Secret** — click **"Retrieve client secret"**, then confirm by clicking **"Retrieve client secret"** again in the modal. Copy this value immediately.
3. Adobe client secrets are shown only once per retrieval session. If you close the modal without copying it, you will need to rotate the secret.

---

### Step 8 — Test before going live

1. Construct your authorization URL:
   ```
   https://ims-na1.adobelogin.com/ims/authorize/v2?client_id=YOUR_CLIENT_ID&redirect_uri=https://thedealstage.com/callback/behance&scope=openid,AdobeID,Behance.Projects,Behance.Appreciations&response_type=code
   ```
2. Open the URL in a browser. You should see Adobe's sign-in/consent screen with your app name.
3. Sign in with your test Adobe account. After approval, you are redirected to `https://thedealstage.com/callback/behance?code=AUTHORIZATION_CODE`.
4. Exchange the code for tokens:

   ```
   POST https://ims-na1.adobelogin.com/ims/token/v3
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &client_id=YOUR_CLIENT_ID
   &client_secret=YOUR_CLIENT_SECRET
   &code=AUTHORIZATION_CODE
   &redirect_uri=https://thedealstage.com/callback/behance
   ```

5. Test a Behance API call using the returned `access_token`:
   ```
   GET https://api.behance.net/v2/users/USERNAME/projects?api_key=YOUR_CLIENT_ID
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

---

### Step 9 — Common pitfalls

- **Redirect URI pattern escaping:** Adobe requires the redirect URI pattern field to use regex. Forgetting to escape the dot in `thedealstage.com` as `thedealstage\.com` causes all redirects to fail silently.
- **Development mode restriction:** If you receive an `invalid_client` or user-consent error, verify that the account you are testing with is listed under Allowed Users in your project.
- **Scope spacing vs. comma separation:** Adobe accepts both space-separated and comma-separated scopes in the authorization URL. Use commas to be safe.
- **Token expiry:** Adobe access tokens expire after 24 hours. The token response also includes a `refresh_token` valid for 14 days. Implement refresh token logic before going to production.
- **API key vs. Bearer token:** Some Behance API endpoints accept only the `api_key` query parameter (your Client ID), while others require a Bearer token. Read endpoint documentation carefully.

---

### Step 10 — Environment variables

```env
BEHANCE_CLIENT_ID=your_client_id_here
BEHANCE_CLIENT_SECRET=your_client_secret_here
BEHANCE_REDIRECT_URI=https://thedealstage.com/callback/behance
```

---

---

## 3. DeviantArt (OAuth)

**Console:** https://www.deviantart.com/developers/
**Callback URL:** `https://thedealstage.com/callback/deviantart`
**Scopes:** `browse`, `user`
**Docs:** https://www.deviantart.com/developers/authentication

---

### Step 1 — Create a DeviantArt account

1. Go to https://www.deviantart.com and sign up or log in.
2. Use an account that will serve as the owner/admin of the application. This account's credentials are tied to the app registration.
3. Confirm your email address — unverified accounts cannot register applications.

---

### Step 2 — Register a new application

1. Navigate to https://www.deviantart.com/developers/.
2. Click **"Register your Application"** (large button in the center of the page).
3. If prompted, sign in to your DeviantArt account.
4. You are taken to the application registration form. Fill in:
   - **App Name:** `TheDealStage`
   - **Description:** A short description of your application's purpose.
   - **OAuth2 Redirect URI Whitelist:** Enter `https://thedealstage.com/callback/deviantart` — one URL per line. You can add localhost for testing (e.g., `http://localhost:3000/callback/deviantart`) on a separate line.
   - **Application URL:** `https://thedealstage.com`
5. Click **"Save"**.

---

### Step 3 — Configure scopes

DeviantArt scopes are passed in the authorization URL, not configured in the console. The scopes available for this integration are:

| Scope    | What it allows                                       |
| -------- | ---------------------------------------------------- |
| `browse` | Browse public deviations, galleries, and collections |
| `user`   | Read user profile information                        |

Your authorization URL scope parameter will be: `browse user` (space-separated).

> **Note:** DeviantArt also offers `publish`, `comment.post`, `message`, and other scopes. Only request what your application actively uses — requesting excessive scopes triggers user concern on the consent screen.

---

### Step 4 — Approval process

DeviantArt does **not** require a formal review process. Applications are live immediately after registration. There are no rate limit tiers requiring approval — the default rate limit applies to all apps.

Default rate limits:

- **Public (unauthenticated):** 500 requests per hour per IP
- **Authenticated (OAuth token):** 2,500 requests per hour per token

---

### Step 5 — Retrieve your credentials

1. After saving your application, return to https://www.deviantart.com/developers/.
2. You will see your application listed. Click on its name.
3. On the application detail page, you will find:
   - **client_id** — a numeric identifier
   - **client_secret** — a long alphanumeric string
4. Copy both values.

---

### Step 6 — Test before going live

DeviantArt supports two OAuth 2.0 flows. For a user-facing integration, use the **Authorization Code** flow:

1. Construct your authorization URL:
   ```
   https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://thedealstage.com/callback/deviantart&scope=browse+user&state=randomstring
   ```
2. Open this URL in a browser. You should see a DeviantArt consent screen with your app name.
3. Click **"Allow"**. You are redirected to `https://thedealstage.com/callback/deviantart?code=AUTHORIZATION_CODE&state=randomstring`.
4. Exchange the code for tokens:

   ```
   POST https://www.deviantart.com/oauth2/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &client_id=YOUR_CLIENT_ID
   &client_secret=YOUR_CLIENT_SECRET
   &code=AUTHORIZATION_CODE
   &redirect_uri=https://thedealstage.com/callback/deviantart
   ```

5. The response includes `access_token` (expires in 1 hour) and `refresh_token` (long-lived).
6. Test with a simple call:
   ```
   GET https://www.deviantart.com/api/v1/oauth2/user/whoami
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

For background operations not requiring user authorization, DeviantArt also supports a **Client Credentials** flow using just your client_id and client_secret to obtain a token scoped to public data only.

---

### Step 7 — Common pitfalls

- **Redirect URI not in whitelist:** DeviantArt is strict — the redirect URI in your token request must exactly match one of the URIs in your application's whitelist. Both `http://` and `https://` versions must be added separately if needed.
- **Short-lived access tokens:** Access tokens expire after 1 hour. You must implement token refresh using the `refresh_token` returned in the token exchange. Use:
  ```
  POST https://www.deviantart.com/oauth2/token
  grant_type=refresh_token&client_id=...&client_secret=...&refresh_token=...
  ```
- **State parameter:** Always use and verify the `state` parameter to prevent CSRF attacks. If you omit it, you introduce a security vulnerability.
- **API versioning:** DeviantArt's API is at `v1`. All endpoints are prefixed with `https://www.deviantart.com/api/v1/oauth2/`.

---

### Step 8 — Environment variables

```env
DEVIANTART_CLIENT_ID=your_client_id_here
DEVIANTART_CLIENT_SECRET=your_client_secret_here
DEVIANTART_REDIRECT_URI=https://thedealstage.com/callback/deviantart
```

---

---

## 4. Beehiiv (OAuth)

**Console:** https://app.beehiiv.com/settings/integrations
**Callback URL:** `https://thedealstage.com/callback/beehiiv`
**Scopes:** `publications:read`, `subscribers:read`
**Docs:** https://developers.beehiiv.com/docs/v2/getting-started

---

### Step 1 — Create a Beehiiv account

1. Go to https://www.beehiiv.com and sign up or log in.
2. Beehiiv requires a paid plan (**Scale** or above) to access OAuth application registration. Verify your plan at https://app.beehiiv.com/settings/billing before proceeding.
3. If you are on a free plan, the Integrations settings page will show a plan upgrade prompt instead of the OAuth configuration UI.

---

### Step 2 — Navigate to the integrations console

1. Log in at https://app.beehiiv.com.
2. Click your profile/organization name in the top-left sidebar to confirm you are in the correct publication workspace.
3. Navigate to **Settings** (gear icon in the left sidebar).
4. Click **"Integrations"** in the Settings submenu.
5. Scroll to the **"OAuth Applications"** section.

---

### Step 3 — Create a new OAuth application

1. In the OAuth Applications section, click **"Create Application"**.
2. Fill in the form:
   - **Application Name:** `TheDealStage`
   - **Application Description:** Describe what your app does and why it needs access.
   - **Redirect URI:** `https://thedealstage.com/callback/beehiiv`
   - **Application Logo:** Upload a square PNG or JPG (recommended: 256×256px).
3. Click **"Create"**.

---

### Step 4 — Configure scopes

Beehiiv scopes are set at the application level in the console:

1. After creating the application, you are taken to the application detail view.
2. Under **"Scopes"**, check the boxes for:
   - `publications:read` — Access to publication metadata and settings
   - `subscribers:read` — Access to subscriber lists and data
3. Click **"Save"** or **"Update Scopes"**.

> **Callout — Subscriber data is sensitive:** The `subscribers:read` scope grants access to email addresses and subscriber metadata. Ensure your privacy policy and terms of service at `https://thedealstage.com` accurately reflect how this data is used before going live.

---

### Step 5 — Approval process

Beehiiv OAuth applications do **not** require a review process for access to `publications:read` and `subscribers:read`. Your application is live immediately after creation.

However, if you later add scopes involving write operations (e.g., `subscribers:write`, `posts:write`), Beehiiv may require review. Check their developer documentation for the most current scope requirements.

---

### Step 6 — Retrieve your credentials

1. On the application detail page at https://app.beehiiv.com/settings/integrations, find your newly created application.
2. You will see:
   - **Client ID** — copy this value
   - **Client Secret** — click **"Show Secret"** to reveal it, then copy immediately.
3. The client secret is displayed only once. If you lose it, you must generate a new one — click **"Regenerate Secret"** and update all your environment variables.

---

### Step 7 — Test before going live

Beehiiv uses a standard OAuth 2.0 Authorization Code flow:

1. Construct the authorization URL:
   ```
   https://app.beehiiv.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://thedealstage.com/callback/beehiiv&response_type=code&scope=publications:read+subscribers:read
   ```
2. Open this URL while logged into a Beehiiv account. You should see a consent screen listing your app name and requested scopes.
3. Click **"Authorize"**. You are redirected to `https://thedealstage.com/callback/beehiiv?code=AUTHORIZATION_CODE`.
4. Exchange the code:

   ```
   POST https://api.beehiiv.com/v2/oauth/token
   Content-Type: application/json

   {
     "grant_type": "authorization_code",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "code": "AUTHORIZATION_CODE",
     "redirect_uri": "https://thedealstage.com/callback/beehiiv"
   }
   ```

5. Test with a publications listing call:
   ```
   GET https://api.beehiiv.com/v2/publications
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

---

### Step 8 — Common pitfalls

- **Plan gating:** If `publications:read` returns `403 Forbidden` for the user's account, their Beehiiv plan may not support the API. The API is only available to Scale and higher plan subscribers.
- **Single publication access:** Beehiiv's `publications:read` grants access only to publications the authenticated user owns or administers — not all publications on the platform. Do not assume broad directory-level access.
- **Token expiry:** Beehiiv access tokens expire. The token response includes `expires_in` (in seconds) and a `refresh_token`. Implement refresh logic to avoid forcing users to re-authorize frequently.
- **Scope colon characters in URLs:** When including scopes in the authorization URL query string, URL-encode the colon if needed (`%3A`), or use a URL-encoding library to construct the URL safely.

---

### Step 9 — Environment variables

```env
BEEHIIV_CLIENT_ID=your_client_id_here
BEEHIIV_CLIENT_SECRET=your_client_secret_here
BEEHIIV_REDIRECT_URI=https://thedealstage.com/callback/beehiiv
```

---

---

## 5. ConvertKit / Kit (API Key)

**Console:** https://app.convertkit.com/account_settings/advanced_settings
**Scopes:** Subscribers, Sequences (governed by account-level API key)
**Rate Limit:** 120 requests per minute
**Docs:** https://developers.kit.com/

> **Important:** ConvertKit has officially rebranded to **Kit** as of 2024. The product domain is now `kit.com`, but many API endpoints and console URLs still use `convertkit.com`. Both work. This guide uses the current console URL.

---

### Step 1 — Create a Kit (ConvertKit) account

1. Go to https://app.kit.com (or https://app.convertkit.com — both redirect to the same place) and sign up or log in.
2. Kit does not require a paid plan to generate an API key. The key is available on all plans, including the free tier.
3. Confirm your email address before proceeding.

---

### Step 2 — Locate the API key (no OAuth flow)

Kit uses a single **API Key** model — there is no OAuth flow, no client secrets, and no redirect URIs. Every API request is authenticated by passing the key as a query parameter or in request headers.

1. Log in to https://app.convertkit.com.
2. Click your profile avatar or name in the **bottom-left corner** of the sidebar.
3. Select **"Account Settings"** from the menu.
4. On the Account Settings page, click **"Advanced"** in the left submenu (or navigate directly to https://app.convertkit.com/account_settings/advanced_settings).
5. Scroll down to the **"API"** section.
6. You will see two values:
   - **API Key** — used for most read operations and standard write operations
   - **API Secret** — required for subscriber management operations (adding, tagging, unsubscribing)
7. Copy both values.

> **Callout — API Secret is sensitive:** The API Secret grants full programmatic control over your subscribers, including deletion and bulk updates. Treat it like a database password.

---

### Step 3 — Understand the access model

Because Kit uses account-level API keys rather than per-user OAuth tokens, this integration will always act as the Kit account owner. This means:

- You are accessing **your own** Kit account's data, not connecting third-party user accounts.
- There is no consent screen or user authorization flow.
- If your use case requires accessing data from another user's Kit account, Kit does not currently support this — you would need to ask that user for their own API key.

Accessible resources with the API Key + Secret:

| Resource                   | API Key | API Secret |
| -------------------------- | ------- | ---------- |
| List subscribers           | Yes     | Yes        |
| Get subscriber details     | Yes     | Yes        |
| Add subscriber             | No      | Yes        |
| Tag subscriber             | No      | Yes        |
| List sequences             | Yes     | Yes        |
| Add subscriber to sequence | No      | Yes        |

---

### Step 4 — Approval process

There is no approval process. API keys are available immediately upon account creation. Rate limits apply automatically:

- **120 requests per minute** per API key
- Exceeding this returns `429 Too Many Requests`
- Build exponential backoff retry logic into your integration

---

### Step 5 — Test your API key

1. Use curl or a tool like Postman to test the connection:
   ```
   GET https://api.convertkit.com/v3/subscribers?api_secret=YOUR_API_SECRET
   ```
2. A successful response returns a JSON object containing `total_subscribers` and a `subscribers` array.
3. Test listing sequences:
   ```
   GET https://api.convertkit.com/v3/sequences?api_key=YOUR_API_KEY
   ```
4. A successful response returns a `courses` array (Kit internally uses the term "courses" for sequences in the API response — this is expected behavior, not an error).

> **Note:** The Kit developer documentation at https://developers.kit.com/ may use updated endpoint paths. Cross-reference with it if any endpoint returns `404`.

---

### Step 6 — Common pitfalls

- **API Key vs. API Secret confusion:** Many endpoints accept only the API Key, but subscriber management endpoints require the API Secret. Using the API Key where the Secret is required returns `401 Unauthorized`. Always check the endpoint documentation for which credential is needed.
- **"courses" vs. "sequences" in responses:** Kit's API returns sequences under the key `courses` in JSON responses — this is a legacy naming convention. Do not rename your variable mapping expecting `sequences` as the key.
- **No per-user token scoping:** Unlike OAuth integrations, there is no way to limit the API key's access to specific subscribers or tags. The key either has full access or none.
- **Rate limit headers:** Kit returns `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers on API responses. Read these headers to implement proactive rate limit management rather than waiting for `429` errors.
- **Pagination:** All list endpoints return paginated results. Always handle the `page`, `total_pages`, and `total_subscribers` fields to retrieve complete datasets. Default page size is 50 records.

---

### Step 7 — Environment variables

```env
CONVERTKIT_API_KEY=your_api_key_here
CONVERTKIT_API_SECRET=your_api_secret_here
```

> **Note:** There is no redirect URI for Kit — this is not an OAuth integration.

---

---

## 6. Medium (Integration Token)

**Console:** https://medium.com/me/settings
**Scopes:** User data, publish posts
**Docs:** https://github.com/Medium/medium-api-docs#2-authentication

> **Important:** Medium's API is significantly limited. Medium deprecated active development of its API in 2020. The self-service integration token method described here is the only available authentication method for most users. OAuth app registration requires contacting Medium directly and is not available through a public self-service console. Plan your integration around these constraints.

---

### Step 1 — Create a Medium account

1. Go to https://medium.com and sign up or log in.
2. Use the account that will be used to publish content or whose data you are accessing.
3. Confirm your email address.

---

### Step 2 — Generate an Integration Token

Medium's self-service authentication uses **Integration Tokens** — long-lived personal access tokens that authenticate API calls as the account owner.

1. Log in to https://medium.com.
2. Click your profile picture in the **top-right corner** of the page.
3. Select **"Settings"** from the dropdown menu.
4. On the Settings page, scroll down to the **"Integration tokens"** section. (You can navigate directly to https://medium.com/me/settings and search for "Integration tokens" on the page with Ctrl+F / Cmd+F.)
5. In the **"Integration tokens"** section, find the text input field with placeholder text such as **"Token description"**.
6. Enter a descriptive name: `TheDealStage Integration`.
7. Click **"Get integration token"**.
8. A token string is displayed. Copy it immediately — Medium does not show this value again.
9. If you lose the token, return to the same settings page to revoke the old token and generate a new one.

---

### Step 3 — Understand scope limitations

Medium's Integration Token grants access to:

| Capability                       | Available |
| -------------------------------- | --------- |
| Get authenticated user profile   | Yes       |
| Get user's publications          | Yes       |
| Publish a post to user's profile | Yes       |
| Publish a post to a publication  | Yes       |
| Read existing posts              | No        |
| Update or delete posts           | No        |
| Access another user's data       | No        |

> **Callout — Write-only publishing:** Medium's API can publish content but cannot retrieve the body of existing posts. If your integration needs to audit or display previously published content, you cannot use the API for this — you must direct users to their Medium profile URL.

---

### Step 4 — Approval process

There is no approval process for Integration Tokens. They are available immediately.

If you need OAuth-based access (allowing other users to connect their Medium accounts to TheDealStage), you must email Medium's developer support directly. As of this guide's writing, Medium's OAuth registration is not publicly available, and new OAuth partnerships are rare. The Integration Token approach only works for accessing the single account that generated the token.

---

### Step 5 — Test the token

1. Make a GET request to verify your token:
   ```
   GET https://api.medium.com/v1/me
   Authorization: Bearer YOUR_INTEGRATION_TOKEN
   Content-Type: application/json
   Accept: application/json
   ```
2. A successful response returns:
   ```json
   {
     "data": {
       "id": "...",
       "username": "...",
       "name": "...",
       "url": "https://medium.com/@username",
       "imageUrl": "..."
     }
   }
   ```
3. Test retrieving publications your account administers:
   ```
   GET https://api.medium.com/v1/users/YOUR_USER_ID/publications
   Authorization: Bearer YOUR_INTEGRATION_TOKEN
   ```
4. Test a post creation (use `publishStatus: "draft"` to avoid accidentally publishing during testing):

   ```
   POST https://api.medium.com/v1/users/YOUR_USER_ID/posts
   Authorization: Bearer YOUR_INTEGRATION_TOKEN
   Content-Type: application/json

   {
     "title": "Test Post",
     "contentFormat": "html",
     "content": "<p>This is a test.</p>",
     "publishStatus": "draft"
   }
   ```

5. Check your Medium account's Stories section — you should see the draft post listed there.

---

### Step 6 — Common pitfalls

- **Token single-account limitation:** An Integration Token only works for the account that generated it. You cannot use one token to publish on behalf of other Medium users.
- **No token refresh:** Integration Tokens do not expire but they do not support refresh. If a token is compromised, immediately revoke it from Medium Settings and generate a new one, then update your environment variables.
- **API stability:** Medium's API is unmaintained. Endpoints occasionally return `502` or `504` errors unrelated to your code. Build retry logic with a 3–5 second delay.
- **HTML vs. Markdown content:** The `contentFormat` field in post creation accepts either `html` or `markdown`. Medium's Markdown parser has quirks — test your content format thoroughly before deploying.
- **Publication ID requirement:** Publishing to a publication (rather than your personal profile) requires fetching the publication ID first via the `/v1/users/{userId}/publications` endpoint and passing it in the post creation request URL as `/v1/publications/{publicationId}/posts`.
- **Rate limiting:** Medium's API documentation does not specify a rate limit, but in practice requests are throttled if more than ~5 requests per second are made. Space out API calls in your integration.

---

### Step 7 — Environment variables

```env
MEDIUM_INTEGRATION_TOKEN=your_integration_token_here
```

> **Note:** There is no Client ID, Client Secret, or redirect URI for Medium's Integration Token method.

---

---

## Summary Reference Table

| Platform         | Auth Type         | Console URL                                                   | Callback/Key Location         | Token Expiry     | Rate Limit  |
| ---------------- | ----------------- | ------------------------------------------------------------- | ----------------------------- | ---------------- | ----------- |
| Dribbble         | OAuth 2.0         | https://dribbble.com/account/applications                     | App detail page               | Never            | 60 req/min  |
| Behance          | OAuth 2.0 (Adobe) | https://developer.adobe.com/console/                          | Project credentials           | 24 hours         | Unspecified |
| DeviantArt       | OAuth 2.0         | https://www.deviantart.com/developers/                        | App detail page               | 1 hour           | 2,500/hour  |
| Beehiiv          | OAuth 2.0         | https://app.beehiiv.com/settings/integrations                 | App detail page               | Per `expires_in` | Unspecified |
| Kit (ConvertKit) | API Key           | https://app.convertkit.com/account_settings/advanced_settings | Advanced Settings page        | Never            | 120 req/min |
| Medium           | Integration Token | https://medium.com/me/settings                                | Settings > Integration tokens | Never            | ~5 req/sec  |

---

## Environment Variables: Master List

Consolidate all credentials in your `.env` file:

```env
# Dribbble
DRIBBBLE_CLIENT_ID=
DRIBBBLE_CLIENT_SECRET=
DRIBBBLE_REDIRECT_URI=https://thedealstage.com/callback/dribbble

# Behance (Adobe)
BEHANCE_CLIENT_ID=
BEHANCE_CLIENT_SECRET=
BEHANCE_REDIRECT_URI=https://thedealstage.com/callback/behance

# DeviantArt
DEVIANTART_CLIENT_ID=
DEVIANTART_CLIENT_SECRET=
DEVIANTART_REDIRECT_URI=https://thedealstage.com/callback/deviantart

# Beehiiv
BEEHIIV_CLIENT_ID=
BEEHIIV_CLIENT_SECRET=
BEEHIIV_REDIRECT_URI=https://thedealstage.com/callback/beehiiv

# Kit (ConvertKit) — no redirect URI
CONVERTKIT_API_KEY=
CONVERTKIT_API_SECRET=

# Medium — no client ID or redirect URI
MEDIUM_INTEGRATION_TOKEN=
```

> **Security reminder:** Never commit this file to version control. Add `.env` to your `.gitignore`. Use your hosting platform's secrets management (e.g., Vercel environment variables, Supabase Vault) to store these values in production.

---

_End of guide. If you encounter an issue not covered in the Common Pitfalls sections, consult the official documentation URLs listed at the top of each platform section._
