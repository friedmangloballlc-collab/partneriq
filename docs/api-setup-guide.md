# API Access Setup Guide: Streaming & Creator Platforms

**Domain:** thedealstage.com
**Last Updated:** 2026-03-21
**Applies To:** All PartnerIQ user roles (Brand, Talent, Agency)

This guide walks through creating developer accounts, registering OAuth applications, configuring redirect URIs, obtaining credentials, and testing each integration from scratch. No prior API experience is assumed.

---

## Before You Begin

Collect the following before starting any platform:

- A dedicated developer email address (e.g., `dev@thedealstage.com`) separate from production accounts
- Access to the thedealstage.com DNS and server environment to confirm callback URLs are reachable
- A secure secrets manager (e.g., Doppler, AWS Secrets Manager, or a `.env` file excluded from version control) to store credentials

Store credentials using the environment variable names listed at the end of each section. Never commit secrets to source control.

---

## Table of Contents

1. [Spotify](#1-spotify)
2. [Twitch](#2-twitch)
3. [Discord](#3-discord)
4. [Patreon](#4-patreon)
5. [SoundCloud](#5-soundcloud)
6. [Mixcloud](#6-mixcloud)
7. [Dailymotion](#7-dailymotion)
8. [Strava](#8-strava)

---

## 1. Spotify

**OAuth 2.0 | Rate Limit: 30 req/sec | Immediate Access**
Developer Console: https://developer.spotify.com/dashboard/
Official Docs: https://developer.spotify.com/documentation/web-api/tutorials/getting-started

### Step 1 — Create a Spotify Developer Account

1. Navigate to https://developer.spotify.com/dashboard/
2. Click **Log in** in the top-right corner.
3. If you do not have a Spotify account, click **Sign up for Spotify** and complete the registration using your developer email. Otherwise log in with existing credentials.
4. On first login, Spotify presents the **Developer Terms of Service**. Read and click **Accept the terms** to proceed.
5. You are now on the Spotify Developer Dashboard. No separate approval is needed to start building.

> **Note:** Spotify grants immediate API access. There is no waiting period or manual review for standard usage.

### Step 2 — Create an Application

1. On the Dashboard, click the **Create app** button.
2. Fill in the form:
   - **App name:** `TheDealStage` (or your preferred display name)
   - **App description:** Briefly describe the integration (e.g., "Platform integration for creator analytics")
   - **Website:** `https://thedealstage.com`
   - **Redirect URI:** Leave this blank for now — you will add it in the next step.
3. Under **Which API/SDKs are you planning to use?**, check **Web API**.
4. Check the box confirming you agree to Spotify's **Developer Policy and Design Guidelines**.
5. Click **Save**.

### Step 3 — Configure the Redirect URI

1. From the Dashboard, click your newly created app to open its detail page.
2. Click **Settings** (top-right area of the app card).
3. Locate the **Redirect URIs** field.
4. Click **Add** and enter exactly:
   ```
   https://thedealstage.com/callback/spotify
   ```
5. Click **Add** to confirm the entry.
6. Scroll down and click **Save** to persist the change.

> **Callout — Exact Match Required:** Spotify performs a strict string comparison on redirect URIs. A trailing slash, `http` vs `https`, or any deviation will cause the OAuth flow to fail with `INVALID_CLIENT: Invalid redirect URI`.

### Step 4 — Request the Correct Scopes

Scopes are declared in your OAuth authorization request at runtime, not in the developer console. Configure your application's authorization URL to include:

| Scope               | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `user-read-private` | Read the user's subscription level and country |
| `user-read-email`   | Read the user's email address                  |

Your authorization URL will include: `&scope=user-read-private%20user-read-email`

### Step 5 — Retrieve Credentials

1. From the app detail page, click **Settings**.
2. The **Client ID** is displayed in plain text. Copy it.
3. Click **View client secret** and authenticate if prompted. Copy the secret immediately — store it securely before navigating away.

> **Callout — Security:** The client secret grants full OAuth token exchange capability. Never expose it in client-side JavaScript, mobile app binaries, or public repositories.

### Step 6 — Test Before Going Live

1. Construct a test authorization URL:
   ```
   https://accounts.spotify.com/authorize?response_type=code&client_id=YOUR_CLIENT_ID&scope=user-read-private%20user-read-email&redirect_uri=https%3A%2F%2Fthedealstage.com%2Fcallback%2Fspotify
   ```
2. Open this URL in a browser. Log in with a test Spotify account.
3. Confirm you are redirected to `https://thedealstage.com/callback/spotify?code=XXXX`.
4. Exchange the `code` for an access token using a `POST` to `https://accounts.spotify.com/api/token` with your client credentials.
5. Call `GET https://api.spotify.com/v1/me` with the access token to confirm data returns successfully.

### Step 7 — Common Pitfalls

- **Redirect URI mismatch:** The URI registered in the console must be byte-for-byte identical to the one sent in the auth request.
- **Scope not declared:** If a scope is not in the authorization URL, the token will not have that permission and calls will return `403 Forbidden`.
- **Expired access tokens:** Spotify tokens expire after 1 hour. Implement the refresh token flow using `grant_type=refresh_token`.
- **Rate limits apply per user:** 30 req/sec is a global cap. Build in exponential backoff when you receive `429 Too Many Requests`.

### Step 8 — Environment Variables

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=https://thedealstage.com/callback/spotify
```

---

## 2. Twitch

**OAuth 2.0 | Rate Limit: 120 req/min | EventSub available for webhooks**
Developer Console: https://dev.twitch.tv/console/apps
Official Docs: https://dev.twitch.tv/docs/api/get-started/

### Step 1 — Create a Twitch Developer Account

1. Navigate to https://dev.twitch.tv/console/apps
2. Click **Log In with Twitch** in the top-right corner.
3. Log in with your Twitch account. If you do not have one, click **Sign Up** and complete registration.
4. On first access to the developer console, Twitch may ask you to enable **Two-Factor Authentication (2FA)**. This is required. Go to https://www.twitch.tv/settings/security, enable 2FA, then return to the console.
5. Accept the **Twitch Developer Agreement** if prompted.

### Step 2 — Register an Application

1. On the Developer Console, click **Register Your Application**.
2. Fill in the form:
   - **Name:** `TheDealStage` (must be unique across all Twitch apps)
   - **OAuth Redirect URLs:** Enter `https://thedealstage.com/callback/twitch` and click **Add**.
   - **Category:** Select **Analytics Tool** from the dropdown.
   - **Client Type:** Select **Confidential** (server-side application).
3. Complete the CAPTCHA if shown.
4. Click **Create**.

### Step 3 — Configure the Redirect URI

The redirect URI was set during app creation. To modify it:

1. From the Developer Console, click **Manage** next to your application.
2. In the **OAuth Redirect URLs** field, add or edit the URI:
   ```
   https://thedealstage.com/callback/twitch
   ```
3. Click **Save**.

> **Callout:** Twitch allows multiple redirect URIs. You can add both a production URI and a localhost URI for development (e.g., `http://localhost:3000/callback/twitch`).

### Step 4 — Request the Correct Scopes

Include the following scopes in your authorization request:

| Scope                        | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `user:read:email`            | Read the authenticated user's email address |
| `channel:read:subscriptions` | Read subscriber data for the user's channel |

Authorization URL scope parameter: `&scope=user%3Aread%3Aemail+channel%3Aread%3Asubscriptions`

> **Callout — EventSub:** Twitch EventSub uses a separate webhook-based subscription model and does not require user OAuth scopes for all event types. Use an **App Access Token** (Client Credentials flow) for server-to-server EventSub subscriptions. Refer to https://dev.twitch.tv/docs/eventsub/ for setup.

### Step 5 — Retrieve Credentials

1. From the Developer Console, click **Manage** next to your application.
2. Copy the **Client ID** displayed on the page.
3. Click **New Secret** to generate a Client Secret. Copy it immediately.

> **Callout:** Clicking **New Secret** invalidates any previously generated secret. Only rotate when necessary and update your environment variables immediately.

### Step 6 — Test Before Going Live

1. Generate an App Access Token (server-to-server, no user required):
   ```
   POST https://id.twitch.tv/oauth2/token
   ?client_id=YOUR_CLIENT_ID
   &client_secret=YOUR_CLIENT_SECRET
   &grant_type=client_credentials
   ```
2. Use the returned token to call `GET https://api.twitch.tv/helix/users?login=twitchdev` and confirm a valid response.
3. For user OAuth, construct the authorization URL and complete the flow with a test account, then call `GET https://api.twitch.tv/helix/users` with the user access token.

### Step 7 — Common Pitfalls

- **2FA not enabled:** The developer console will block access without 2FA. Set it up before anything else.
- **App name taken:** Twitch requires globally unique app names. If creation fails, try a more specific name.
- **Wrong token type:** Some endpoints require App Access Tokens; others require User Access Tokens. Check the endpoint's documentation for `Authorization Type` requirements.
- **Rate limit is per token:** The 120 req/min limit applies per access token. Distribute load across multiple tokens if needed.
- **EventSub requires HTTPS:** Webhook callback URLs for EventSub must use HTTPS with a valid SSL certificate.

### Step 8 — Environment Variables

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_REDIRECT_URI=https://thedealstage.com/callback/twitch
```

---

## 3. Discord

**OAuth 2.0 | Rate Limit: 50 req/sec | Bot token for bot actions**
Developer Console: https://discord.com/developers/applications
Official Docs: https://discord.com/developers/docs/getting-started

### Step 1 — Create a Discord Developer Account

1. Navigate to https://discord.com/developers/applications
2. Log in with your Discord account. If you do not have one, click **Register** and complete sign-up.
3. Discord does not require a separate developer registration. Logging into the developer portal is sufficient.

### Step 2 — Create an Application

1. On the Developer Portal, click **New Application** (top-right).
2. Enter an application name: `TheDealStage`.
3. Accept the **Discord Developer Terms of Service and Developer Policy**.
4. Click **Create**.
5. You are taken to the application's **General Information** page. Fill in:
   - **Description:** Brief description of the integration.
   - **App Icon:** Optional but recommended.

### Step 3 — Configure the OAuth2 Redirect URI

1. In the left sidebar, click **OAuth2**.
2. Under **Redirects**, click **Add Redirect**.
3. Enter:
   ```
   https://thedealstage.com/callback/discord
   ```
4. Click **Save Changes** at the bottom of the page.

> **Callout:** Discord will reject any redirect URI not listed here. You can add a `http://localhost:PORT/callback/discord` entry for local development.

### Step 4 — Request the Correct Scopes

Navigate to **OAuth2 > URL Generator** to build an authorization URL with the following scopes checked:

| Scope      | Purpose                                        |
| ---------- | ---------------------------------------------- |
| `identify` | Read basic user profile (username, avatar, ID) |
| `email`    | Read the user's email address                  |
| `guilds`   | Read the list of servers the user belongs to   |

1. In **URL Generator**, check the boxes for `identify`, `email`, and `guilds`.
2. Set **Redirect URL** to `https://thedealstage.com/callback/discord`.
3. Copy the generated URL for use in your application.

> **Callout — Bot Token vs. OAuth Token:** The scopes above are for user OAuth (identifying who logged in). If you also need the application to perform bot actions (reading messages, managing servers), you must separately create a **Bot** under the **Bot** section in the sidebar and use the Bot Token for those actions. Do not use the Bot Token in the OAuth flow.

### Step 5 — Retrieve Credentials

1. In the left sidebar, click **OAuth2 > General**.
2. The **Client ID** is visible at the top. Copy it.
3. Click **Reset Secret** under the **Client Secret** field to generate a secret. Confirm the reset when prompted. Copy the secret immediately.

> **Callout:** Clicking **Reset Secret** invalidates the previous secret. Only do this when rotating credentials.

### Step 6 — Test Before Going Live

1. Use the URL generated in Step 4 to initiate an OAuth flow in a browser.
2. Log in with a test Discord account and authorize the application.
3. Confirm redirection to `https://thedealstage.com/callback/discord?code=XXXX`.
4. Exchange the code for a token via `POST https://discord.com/api/oauth2/token`.
5. Call `GET https://discord.com/api/users/@me` to verify the user data response.
6. Call `GET https://discord.com/api/users/@me/guilds` to verify guild data.

### Step 7 — Common Pitfalls

- **Missing `email` scope:** The `identify` scope alone does not include the email address. Both `identify` and `email` must be requested.
- **Bot token exposure:** Never use the Bot Token as a client secret or expose it publicly. Treat it with higher security than the client secret.
- **Redirect URI encoded differently:** Discord's URI comparison is strict. Ensure your application sends the URI exactly as registered, including encoding.
- **Guild membership changes:** The `guilds` scope returns guild data at the time of authorization. It does not maintain a live subscription to membership changes.

### Step 8 — Environment Variables

```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=https://thedealstage.com/callback/discord
DISCORD_BOT_TOKEN=your_bot_token_here  # Only if using bot functionality
```

---

## 4. Patreon

**OAuth 2.0 | Rate Limit: 60 req/min | Creator data only**
Developer Console: https://www.patreon.com/portal/registration/register-clients
Official Docs: https://docs.patreon.com/#getting-started

### Step 1 — Create a Patreon Developer Account

1. Navigate to https://www.patreon.com and log in. If you do not have a Patreon account, click **Sign up** and complete registration.
2. Patreon API access is available to any account holder. Navigate directly to https://www.patreon.com/portal/registration/register-clients

> **Callout — Creator Requirement:** The `campaigns:read` and `members:read` scopes return data only when the authenticated user is a **Patreon Creator** (i.e., they have a campaign). Users who are patrons only will not have campaign data. Ensure your test account has an active Patreon campaign.

### Step 2 — Register a Client Application

1. On the client registration page, click **Create Client**.
2. Fill in the form:
   - **App Name:** `TheDealStage`
   - **Description:** Describe the integration.
   - **App Icon:** Upload a logo (recommended).
   - **Redirect URIs:** Enter `https://thedealstage.com/callback/patreon`
   - **Client API Version:** Select **2** (the current stable version).
3. Click **Create Client**.

### Step 3 — Configure the Redirect URI

If you need to add or change the redirect URI after creation:

1. Go to https://www.patreon.com/portal/registration/register-clients
2. Find your client and click the pencil/edit icon.
3. Update the **Redirect URIs** field:
   ```
   https://thedealstage.com/callback/patreon
   ```
4. Click **Update Client**.

### Step 4 — Request the Correct Scopes

Include these scopes in your authorization request:

| Scope            | Purpose                             |
| ---------------- | ----------------------------------- |
| `campaigns:read` | Read the creator's campaign details |
| `members:read`   | Read patron membership data         |
| `posts:read`     | Read the creator's posts            |

Scope parameter: `&scope=campaigns%3Aread+members%3Aread+posts%3Aread`

> **Callout — API v2 Field Syntax:** Patreon API v2 uses a field-based query system. Even with the correct scope, you must explicitly request fields in your API calls (e.g., `?fields[campaign]=patron_count,creation_name`). Scopes grant access; field parameters determine what data is returned.

### Step 5 — Retrieve Credentials

1. Return to https://www.patreon.com/portal/registration/register-clients
2. Click your application.
3. Copy the **Client ID** from the client detail view.
4. Click **Show Secret** or similar to reveal the **Client Secret**. Copy it immediately.

### Step 6 — Test Before Going Live

1. Build an authorization URL:
   ```
   https://www.patreon.com/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fthedealstage.com%2Fcallback%2Fpatreon&scope=campaigns%3Aread+members%3Aread+posts%3Aread
   ```
2. Log in with a test **Creator** Patreon account and authorize.
3. Exchange the authorization code for tokens at `POST https://www.patreon.com/api/oauth2/token`.
4. Call `GET https://www.patreon.com/api/oauth2/v2/campaigns` to confirm campaign data returns.

### Step 7 — Common Pitfalls

- **Non-creator accounts return empty data:** The `campaigns:read` scope is meaningless for accounts without a campaign. Always test with a creator account.
- **API version mismatch:** The docs reference both v1 and v2 endpoints. Use v2 exclusively (`/api/oauth2/v2/`). v1 is deprecated.
- **Missing field parameters:** Patreon v2 returns minimal fields by default. You must append `?fields[resource]=field1,field2` to retrieve specific attributes.
- **Token refresh:** Patreon issues refresh tokens. Implement the refresh flow to avoid requiring users to re-authorize.

### Step 8 — Environment Variables

```env
PATREON_CLIENT_ID=your_client_id_here
PATREON_CLIENT_SECRET=your_client_secret_here
PATREON_REDIRECT_URI=https://thedealstage.com/callback/patreon
```

---

## 5. SoundCloud

**OAuth 2.0 | Rate Limit: 15,000 req/hr**
Developer Console: https://soundcloud.com/you/apps
Official Docs: https://developers.soundcloud.com/docs/api/guide#authentication

### Step 1 — Create a SoundCloud Developer Account

1. Navigate to https://soundcloud.com and log in. If you do not have an account, click **Create account** and complete registration.
2. SoundCloud API access requires applying for API credentials. Navigate to https://soundcloud.com/you/apps

> **Callout — Application Review:** SoundCloud currently restricts new API application registrations. You may see a waitlist or application form rather than immediate access. Submit the form with a detailed description of your use case and expected usage volume. Approval timelines vary.

### Step 2 — Register an Application

1. On the Apps page (https://soundcloud.com/you/apps), click **Register a new application**.
2. Fill in the form:
   - **Name of your app:** `TheDealStage`
   - **Your website:** `https://thedealstage.com`
   - **Redirect URI for your app:** `https://thedealstage.com/callback/soundcloud`
3. Click **Save app**.

### Step 3 — Configure the Redirect URI

To update the redirect URI after creation:

1. Navigate to https://soundcloud.com/you/apps
2. Click your application name.
3. Update the **Redirect URI for your app** field:
   ```
   https://thedealstage.com/callback/soundcloud
   ```
4. Click **Save app**.

### Step 4 — Request the Correct Scopes

SoundCloud uses a scope parameter in the authorization request:

| Scope         | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `me`          | Read the authenticated user's profile data     |
| `email`       | Read the user's email address                  |
| `tracks:edit` | Create and modify tracks on behalf of the user |

> **Callout:** SoundCloud's scope support may vary by account tier. Confirm available scopes against the current documentation at https://developers.soundcloud.com/docs/api/guide#authentication before implementation.

### Step 5 — Retrieve Credentials

1. Navigate to https://soundcloud.com/you/apps
2. Click your registered application.
3. Copy the **Client ID** and **Client Secret** displayed on the application page.

### Step 6 — Test Before Going Live

1. Construct an authorization URL:
   ```
   https://api.soundcloud.com/connect?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fthedealstage.com%2Fcallback%2Fsoundcloud&scope=me+email
   ```
2. Complete the authorization with a test account.
3. Exchange the code for a token at `POST https://api.soundcloud.com/oauth2/token`.
4. Call `GET https://api.soundcloud.com/me` to verify user data.

### Step 7 — Common Pitfalls

- **Access may be restricted:** SoundCloud has periodically closed open API registrations. If the registration page is not accessible, submit a request through their developer contact form.
- **Legacy vs. current API:** SoundCloud has a history of API deprecations. Verify endpoints against the current documentation before building.
- **Rate limits are generous but scoped:** 15,000 req/hr is per application, not per user. Heavy multi-user usage can exhaust this limit.

### Step 8 — Environment Variables

```env
SOUNDCLOUD_CLIENT_ID=your_client_id_here
SOUNDCLOUD_CLIENT_SECRET=your_client_secret_here
SOUNDCLOUD_REDIRECT_URI=https://thedealstage.com/callback/soundcloud
```

---

## 6. Mixcloud

**OAuth 2.0**
Developer Console: https://www.mixcloud.com/developers/
Official Docs: https://www.mixcloud.com/developers/#authorization

### Step 1 — Create a Mixcloud Developer Account

1. Navigate to https://www.mixcloud.com and log in. If you do not have an account, click **Sign Up** and complete registration.
2. Navigate to https://www.mixcloud.com/developers/

### Step 2 — Register an Application

1. On the developers page, locate the **Register your app** section or button.
2. Fill in the required fields:
   - **Application Name:** `TheDealStage`
   - **Website:** `https://thedealstage.com`
   - **Redirect URI:** `https://thedealstage.com/callback/mixcloud`
   - **Description:** Brief description of how you will use the API.
3. Submit the registration form.

### Step 3 — Configure the Redirect URI

The redirect URI is set during registration. To update it:

1. Return to https://www.mixcloud.com/developers/
2. Navigate to your application settings.
3. Update the redirect URI to:
   ```
   https://thedealstage.com/callback/mixcloud
   ```
4. Save changes.

### Step 4 — Request the Correct Scopes

Mixcloud's scope system is limited compared to other platforms:

| Scope       | Purpose                                           |
| ----------- | ------------------------------------------------- |
| `user:read` | Read the authenticated user's profile information |

Include `&scope=user:read` in your authorization request.

> **Callout:** Mixcloud's API is more limited than other platforms in this guide. Review https://www.mixcloud.com/developers/ for the current full list of available scopes and endpoints before planning your integration.

### Step 5 — Retrieve Credentials

1. After application registration, Mixcloud provides a **Client Key** (equivalent to Client ID) and **Client Secret**.
2. Copy both values from the application detail page and store them securely.

### Step 6 — Test Before Going Live

1. Construct an authorization URL:
   ```
   https://www.mixcloud.com/oauth/authorize?client_id=YOUR_CLIENT_KEY&redirect_uri=https%3A%2F%2Fthedealstage.com%2Fcallback%2Fmixcloud&response_type=code
   ```
2. Complete authorization with a test account.
3. Exchange the code for an access token at:
   ```
   POST https://www.mixcloud.com/oauth/access_token
   ```
4. Call `GET https://api.mixcloud.com/me/?access_token=YOUR_TOKEN` to verify.

### Step 7 — Common Pitfalls

- **Client Key vs. Client ID naming:** Mixcloud uses "Client Key" in its interface but the OAuth parameter name is `client_id`. Use the Client Key value wherever `client_id` is required.
- **Limited documentation:** Mixcloud's public API documentation is sparse. Test endpoints directly against `https://api.mixcloud.com/` and refer to the developer community for undocumented behavior.
- **Token longevity:** Verify whether Mixcloud tokens expire and whether a refresh token mechanism exists. Implement re-authorization prompts if tokens are short-lived.

### Step 8 — Environment Variables

```env
MIXCLOUD_CLIENT_ID=your_client_key_here
MIXCLOUD_CLIENT_SECRET=your_client_secret_here
MIXCLOUD_REDIRECT_URI=https://thedealstage.com/callback/mixcloud
```

---

## 7. Dailymotion

**OAuth 2.0**
Developer Console: https://www.dailymotion.com/partner
Official Docs: https://developer.dailymotion.com/tools/

### Step 1 — Create a Dailymotion Developer Account

1. Navigate to https://www.dailymotion.com and log in. If you do not have an account, click **Sign up** and complete registration.
2. Navigate to https://www.dailymotion.com/partner — this is the Partner HQ where API applications are managed.

> **Callout — Partner Status:** Dailymotion API access may require applying for partner status depending on your use case. Navigate to https://www.dailymotion.com/partner and follow the prompts. Some API tiers are available immediately; others require approval.

### Step 2 — Register an Application

1. In the Partner HQ, navigate to the **API Keys** or **Applications** section.
2. Click **Create an API key** or **New Application**.
3. Fill in the required fields:
   - **Application Name:** `TheDealStage`
   - **Description:** Describe the integration.
   - **Website URL:** `https://thedealstage.com`
   - **Callback URL / Redirect URI:** `https://thedealstage.com/callback/dailymotion`
4. Submit the form.

### Step 3 — Configure the Redirect URI

To update the redirect URI:

1. Return to https://www.dailymotion.com/partner and navigate to your application.
2. Edit the **Callback URL** field:
   ```
   https://thedealstage.com/callback/dailymotion
   ```
3. Save changes.

### Step 4 — Request the Correct Scopes

| Scope           | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `userinfo`      | Read basic profile information of the authenticated user |
| `manage_videos` | Upload, edit, and manage videos on behalf of the user    |

Include `&scope=userinfo+manage_videos` in your authorization request.

### Step 5 — Retrieve Credentials

1. From the application detail page in Partner HQ, copy the **API Key** (this is the Client ID).
2. Copy the **API Secret** (this is the Client Secret).

### Step 6 — Test Before Going Live

1. Construct the authorization URL:
   ```
   https://www.dailymotion.com/oauth/authorize?response_type=code&client_id=YOUR_API_KEY&redirect_uri=https%3A%2F%2Fthedealstage.com%2Fcallback%2Fdailymotion&scope=userinfo+manage_videos
   ```
2. Complete authorization with a test account.
3. Exchange the code for a token at `POST https://api.dailymotion.com/oauth/token`.
4. Call `GET https://api.dailymotion.com/me` to verify user data.

### Step 7 — Common Pitfalls

- **Partner review delays:** If your use case requires elevated permissions or video management at scale, partner review may take several business days.
- **Scope names are exact:** `userinfo` and `manage_videos` are the exact strings required. Variations will fail silently or return permission errors.
- **API endpoint base URL:** All API calls go to `https://api.dailymotion.com/`. Ensure you are not using any deprecated subdomain variants.

### Step 8 — Environment Variables

```env
DAILYMOTION_CLIENT_ID=your_api_key_here
DAILYMOTION_CLIENT_SECRET=your_api_secret_here
DAILYMOTION_REDIRECT_URI=https://thedealstage.com/callback/dailymotion
```

---

## 8. Strava

**OAuth 2.0 | Rate Limit: 100 req/15min**
Developer Console: https://www.strava.com/settings/api
Official Docs: https://developers.strava.com/docs/getting-started/

### Step 1 — Create a Strava Developer Account

1. Navigate to https://www.strava.com and log in. If you do not have a Strava account, click **Sign Up** and complete registration.
2. Strava requires that you have a Strava account with at least one recorded activity before API access is granted. If your account is brand new, you may need to log a manual activity.
3. Navigate directly to https://www.strava.com/settings/api to access the API application settings.

### Step 2 — Create an API Application

1. On the API settings page, fill in the **My API Application** form:
   - **Application Name:** `TheDealStage`
   - **Category:** Select the most appropriate category (e.g., **Analytics**)
   - **Club:** Leave blank unless you are creating a club-associated app.
   - **Website:** `https://thedealstage.com`
   - **Application Description:** Brief description of the integration.
   - **Authorization Callback Domain:** Enter `thedealstage.com` (domain only, not the full URL)
2. Upload an **Application Logo** (required — Strava will not save without one).
3. Click **Save** (or **Create**).

> **Callout — Domain vs. Full URL:** Strava's **Authorization Callback Domain** field accepts only the domain name, not the full callback path. The actual redirect URI with the full path (`/callback/strava`) is specified in your OAuth authorization request at runtime. Strava validates that the redirect URI's domain matches what you registered.

### Step 3 — Configure the Redirect URI

Strava does not store the full redirect URI in the console. Instead:

1. Ensure the **Authorization Callback Domain** is set to `thedealstage.com`.
2. In your application code, use the full URI `https://thedealstage.com/callback/strava` as the `redirect_uri` parameter in your authorization requests.
3. Strava will permit any path under the registered domain.

### Step 4 — Request the Correct Scopes

Strava uses a granular scope system. Request these scopes:

| Scope              | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `activity:read`    | Read the user's activities (default visibility) |
| `profile:read_all` | Read all profile data including private fields  |

> **Callout — Scope Naming:** The brief specification uses `profile:read`, but Strava's actual scope name is `profile:read_all` for full profile access. Using an incorrect scope name will result in a `scope not authorized` error. Always verify scope names against https://developers.strava.com/docs/authentication/#details-about-requesting-access

Authorization URL scope parameter: `&scope=activity%3Aread%2Cprofile%3Aread_all`

### Step 5 — Retrieve Credentials

1. Return to https://www.strava.com/settings/api
2. Your **Client ID** is displayed as a numeric value on the API settings page.
3. Click **Show** next to the **Client Secret** field to reveal it. Copy it immediately.

### Step 6 — Test Before Going Live

1. Construct the authorization URL:
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fthedealstage.com%2Fcallback%2Fstrava&response_type=code&scope=activity%3Aread%2Cprofile%3Aread_all
   ```
2. Authorize with a test Strava account.
3. Exchange the code for a token at `POST https://www.strava.com/oauth/token`.
4. Call `GET https://www.strava.com/api/v3/athlete` to verify profile data.
5. Call `GET https://www.strava.com/api/v3/athlete/activities` to verify activity data.

### Step 7 — Common Pitfalls

- **Activity required before API access:** A completely empty Strava account may be blocked from API registration. Log a test activity if you encounter issues.
- **Rate limit is low:** 100 requests per 15 minutes (600 per hour) is a tight limit. Design your data fetching strategy carefully. Use webhooks where possible rather than polling.
- **Scope strings use colons and commas:** Strava scopes use `:` as delimiters and `,` to separate multiple scopes. URL-encode these correctly in authorization URLs.
- **Token expiry is 6 hours:** Strava access tokens expire after 6 hours. The token response includes `expires_at` (Unix timestamp) and a `refresh_token`. Implement automatic refresh before expiry.
- **Logo required:** The API application cannot be saved without uploading a logo image. Prepare one before starting registration.

### Step 8 — Environment Variables

```env
STRAVA_CLIENT_ID=your_numeric_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REDIRECT_URI=https://thedealstage.com/callback/strava
```

---

## Consolidated Environment Variables Reference

The following is a complete reference of all environment variables across all eight platforms. Add these to your `.env` file or secrets manager:

```env
# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=https://thedealstage.com/callback/spotify

# Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_REDIRECT_URI=https://thedealstage.com/callback/twitch

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://thedealstage.com/callback/discord
DISCORD_BOT_TOKEN=

# Patreon
PATREON_CLIENT_ID=
PATREON_CLIENT_SECRET=
PATREON_REDIRECT_URI=https://thedealstage.com/callback/patreon

# SoundCloud
SOUNDCLOUD_CLIENT_ID=
SOUNDCLOUD_CLIENT_SECRET=
SOUNDCLOUD_REDIRECT_URI=https://thedealstage.com/callback/soundcloud

# Mixcloud
MIXCLOUD_CLIENT_ID=
MIXCLOUD_CLIENT_SECRET=
MIXCLOUD_REDIRECT_URI=https://thedealstage.com/callback/mixcloud

# Dailymotion
DAILYMOTION_CLIENT_ID=
DAILYMOTION_CLIENT_SECRET=
DAILYMOTION_REDIRECT_URI=https://thedealstage.com/callback/dailymotion

# Strava
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=https://thedealstage.com/callback/strava
```

---

## Approval and Review Process Summary

| Platform    | Review Required         | Estimated Wait            |
| ----------- | ----------------------- | ------------------------- |
| Spotify     | None                    | Immediate                 |
| Twitch      | None (2FA required)     | Immediate after 2FA setup |
| Discord     | None                    | Immediate                 |
| Patreon     | None                    | Immediate                 |
| SoundCloud  | Possible (waitlist)     | Days to weeks             |
| Mixcloud    | None                    | Immediate                 |
| Dailymotion | Possible (partner tier) | Days                      |
| Strava      | None                    | Immediate                 |

---

## General Security Checklist

Before going to production, verify each of the following:

- [ ] All client secrets are stored in environment variables, never in source code
- [ ] `.env` file is listed in `.gitignore`
- [ ] HTTPS is enforced on `https://thedealstage.com/callback/*` routes
- [ ] SSL certificate on thedealstage.com is valid and not expiring within 30 days
- [ ] Token refresh logic is implemented for all platforms that issue expiring tokens (Spotify, Twitch, Patreon, Strava)
- [ ] Rate limit handling with exponential backoff is implemented for all platforms
- [ ] OAuth state parameter is used in all authorization requests to prevent CSRF attacks
- [ ] Tokens are stored encrypted at rest in your database
- [ ] Unused scopes are not requested
