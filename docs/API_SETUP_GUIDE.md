# API Access Setup Guide — thedealstage.com

**Domain:** `thedealstage.com`
**Last Updated:** 2026-03-21
**Audience:** Developer or technical admin setting up integrations for the first time

---

## How to Use This Guide

Each section covers one platform. Work through all nine numbered steps in order. Every section uses the same structure so you can reference it quickly later.

> **Callout key used throughout this guide:**
>
> - `> [!NOTE]` — important context you should read
> - `> [!WARNING]` — an action that can break things or cost money if done wrong
> - `> [!TIP]` — a shortcut or time-saver

---

## Table of Contents

1. [Shopify](#1-shopify)
2. [Etsy](#2-etsy)
3. [Salesforce](#3-salesforce)
4. [HubSpot](#4-hubspot)
5. [Pipedrive](#5-pipedrive)
6. [Slack](#6-slack)
7. [Zoom](#7-zoom)
8. [Microsoft Teams](#8-microsoft-teams)
9. [Outlook / Office 365](#9-outlook--office-365)
10. [Calendly](#10-calendly)
11. [Stripe](#11-stripe-already-live)
12. [Mailchimp](#12-mailchimp)
13. [Zoho CRM](#13-zoho-crm)
14. [Copper](#14-copper)

---

## 1. Shopify

**OAuth 2.0 | Console:** https://partners.shopify.com/
**Callback URL:** `https://thedealstage.com/callback/shopify`
**Scopes:** `read_products`, `read_orders`, `read_customers`
**Rate Limit:** 2 requests/second (REST) or 40 points/second (GraphQL)
**Docs:** https://shopify.dev/docs/apps/getting-started

---

### Step 1 — Create a Shopify Partners Account

1. Go to https://partners.shopify.com/
2. Click **Join the Partner Program** (top right).
3. Fill in your name, email, and business name. Use a business email — Shopify sends important notifications here.
4. Accept the Partner Program Agreement and click **Create account**.
5. Check your inbox for a verification email from Shopify and confirm it.
6. You land on the **Partner Dashboard**. This is your permanent home for all Shopify apps.

> [!NOTE]
> A Partners account is free. You do not need an active Shopify store to build apps.

---

### Step 2 — Create a New App

1. In the left sidebar of the Partner Dashboard, click **Apps**.
2. Click the green **Create app** button (top right).
3. Select **Create app manually** (not the CLI option — that requires local tooling).
4. Enter the app name: `DealStage` (or whatever you prefer — this is visible to merchants).
5. Click **Create app**.
6. You are now on the app's configuration page.

---

### Step 3 — Configure OAuth Redirect URIs

1. On the app configuration page, click the **Configuration** tab.
2. Scroll to the **URLs** section.
3. In the **App URL** field, enter: `https://thedealstage.com`
4. In the **Allowed redirection URL(s)** field, enter exactly:
   ```
   https://thedealstage.com/callback/shopify
   ```
5. Click **Save** at the top right.

> [!WARNING]
> Shopify performs an exact string match on the redirect URI. Even a trailing slash will cause OAuth to fail. Enter the URL exactly as shown above.

---

### Step 4 — Configure Scopes (Permissions)

1. Still on the **Configuration** tab, scroll to the **Scopes** section.
2. Under **Admin API integration**, click **Configure**.
3. In the search box, type each scope and check the box next to it:
   - `read_products`
   - `read_orders`
   - `read_customers`
4. Click **Save**.

> [!NOTE]
> The scope names in Shopify's UI drop the `products:read` colon format. Search for `read_products` (underscore, no colon).

---

### Step 5 — Approval / Review Process

Shopify has two app types:

- **Custom apps** (for a single store): Instant access, no review required. The merchant installs from a direct link you generate.
- **Public apps** (listed on the App Store): Require Shopify review, which takes 1–4 weeks.

For thedealstage.com, you are building a **custom app per merchant**. No review required. Each merchant will authorize your app through the OAuth flow you implement.

---

### Step 6 — Get Credentials (Client ID and Secret)

1. On the app page, click the **API credentials** tab.
2. You will see:
   - **Client ID** (also called API key) — visible immediately.
   - **Client secret** — click **Reveal token once** to see it. Copy it immediately; you cannot retrieve it again.
3. Store both values securely in your secrets manager.

---

### Step 7 — Test Before Going Live

1. In the Partner Dashboard, scroll to the **Test your app** section on the app overview page.
2. Click **Select store** and choose a development store (create one free if you have none: Partners Dashboard > Stores > Add store > Development store).
3. Shopify will generate a test install URL. Click it to walk through the full OAuth flow.
4. After authorization, confirm the callback hits `https://thedealstage.com/callback/shopify` and returns a valid access token.
5. Make a test API call: `GET https://{shop}.myshopify.com/admin/api/2024-01/products.json`

---

### Step 8 — Common Pitfalls

- **Wrong scope format.** Shopify's API uses `read_products`, not `products:read`. The scopes in the prompt above are in the "description" format — always use underscores in the actual OAuth request.
- **Per-shop tokens.** Shopify access tokens are unique per merchant store. You must store and associate them with the merchant's shop domain, not globally.
- **API versioning.** Shopify deprecates API versions quarterly. Pin to a specific version (e.g., `2024-01`) and set a reminder to upgrade.
- **Rate limits.** The 2 req/sec REST limit applies per shop. Use request queuing per shop to avoid 429 errors.

---

### Step 9 — Environment Variables

```env
SHOPIFY_CLIENT_ID=your_client_id_here
SHOPIFY_CLIENT_SECRET=your_client_secret_here
SHOPIFY_CALLBACK_URL=https://thedealstage.com/callback/shopify
SHOPIFY_SCOPES=read_products,read_orders,read_customers
```

---

### Pricing / Cost Considerations

- Partners account: Free.
- App installation for custom apps: Free.
- App Store listing fees (if you go public later): Shopify takes a revenue share on paid apps.
- API calls: Free (no per-call charges for REST/GraphQL).

---

---

## 2. Etsy

**OAuth 2.0 | Console:** https://www.etsy.com/developers/register
**Callback URL:** `https://thedealstage.com/callback/etsy`
**Scopes:** `listings_r`, `transactions_r`
**Rate Limit:** 10 requests/second
**Docs:** https://developer.etsy.com/documentation/essentials/getting-started

> [!WARNING]
> Etsy charges **$0.05 per API call** for production use under certain plans. Budget for this before enabling the integration at scale.

---

### Step 1 — Create an Etsy Developer Account

1. Go to https://www.etsy.com/developers/register
2. If you do not have an Etsy account, click **Register** and create one. Use a business email.
3. If you already have an Etsy account, click **Sign in**.
4. After signing in, you will be redirected to the **Etsy Developers** page.
5. Click **Create a New App**.

---

### Step 2 — Create a New App

1. On the **Create a New App** form:
   - **App name:** `DealStage`
   - **App description:** Describe what you are building (e.g., "Partner management platform that reads listing and transaction data to track affiliate performance").
   - **What are you building?** Select **Other**.
   - **URL:** `https://thedealstage.com`
2. Check the box to agree to the API Terms of Use.
3. Click **Read Terms & Create App**.
4. You land on your app's detail page.

---

### Step 3 — Configure OAuth Redirect URIs

1. On the app detail page, scroll to **Callback URLs**.
2. Click **Add Callback URL**.
3. Enter exactly:
   ```
   https://thedealstage.com/callback/etsy
   ```
4. Click **Save**.

> [!NOTE]
> Etsy allows multiple callback URLs per app. You can add staging/development URLs here as well.

---

### Step 4 — Configure Scopes (Permissions)

Etsy scopes are specified dynamically at authorization time in the OAuth request, not set in the console. When constructing your authorization URL, include:

```
scope=listings_r%20transactions_r
```

The scope names for your needs:

- `listings_r` — read active listings
- `transactions_r` — read transaction history

> [!NOTE]
> Etsy uses space-separated scopes in the OAuth flow (URL-encoded as `%20`). Do not use commas.

---

### Step 5 — Approval / Review Process

Etsy has a **keystone review** process:

1. New apps start with a **sandbox** (test) environment and limited rate limits.
2. To get production access, you must submit your app for review via the developer portal.
3. Go to your app page and click **Request Production Access**.
4. Fill in the use case description and expected call volume.
5. Etsy reviews within 3–10 business days.
6. Until approved, all calls go against the sandbox and return test data.

---

### Step 6 — Get Credentials

1. On the app detail page, your **API Key** (Client ID) is displayed at the top.
2. Your **Shared Secret** (Client Secret) is shown directly below it.
3. Copy both and store them in your secrets manager.

> [!WARNING]
> Etsy's developer console shows the shared secret in plain text. Do not screenshot or paste it into any chat, email, or document.

---

### Step 7 — Test Before Going Live

1. Use the Etsy sandbox environment: `https://openapi.etsy.com/v3/`
2. Create a test shop via the Etsy sandbox if needed.
3. Complete the OAuth flow using your sandbox credentials and confirm the callback fires correctly.
4. Make a test call: `GET https://openapi.etsy.com/v3/application/listings/active?limit=1`
5. Verify the response contains listing data.

---

### Step 8 — Common Pitfalls

- **Per-call pricing.** At $0.05 per call and 10 req/sec, you can spend $3/minute if you are not careful. Always implement caching for listing data and paginate efficiently.
- **User token expiry.** Etsy OAuth tokens expire. Implement token refresh logic using the `refresh_token` returned during authorization.
- **Scope mismatch.** If a user authorized your app without `transactions_r`, you will get a 403. Check scopes at authorization time.
- **Sandbox vs. production URLs.** Sandbox calls go to `openapi.etsy.com`; production calls also go to `openapi.etsy.com` but behave differently based on token type. Confirm which environment your token was issued in.

---

### Step 9 — Environment Variables

```env
ETSY_CLIENT_ID=your_api_key_here
ETSY_CLIENT_SECRET=your_shared_secret_here
ETSY_CALLBACK_URL=https://thedealstage.com/callback/etsy
ETSY_SCOPES=listings_r transactions_r
```

---

### Pricing / Cost Considerations

- Developer account: Free.
- API calls in production: **$0.05 per call** (confirm current pricing at https://developer.etsy.com — this can change).
- Budget model: At 10 req/sec sustained, costs can reach ~$180/hour. Use caching aggressively.

---

---

## 3. Salesforce

**OAuth 2.0 | Console:** https://developer.salesforce.com/
**Callback URL:** `https://thedealstage.com/callback/salesforce`
**Scopes:** `api`, `refresh_token`, `full`
**Rate Limit:** 15,000 API calls per 24-hour period (per org, varies by edition)
**Docs:** https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm

> [!NOTE]
> Salesforce uses **org-specific endpoints**. The base URL for API calls is unique to each customer's Salesforce org (e.g., `https://yourcompany.my.salesforce.com`). You must store this per connected user.

---

### Step 1 — Create a Salesforce Developer Account

1. Go to https://developer.salesforce.com/
2. Click **Sign Up** in the top right.
3. Fill in your name, email, company, and role. Use a business email.
4. Check your inbox for a confirmation email from Salesforce and click **Verify Account**.
5. Set a password and security question.
6. You are now logged into a **free Salesforce Developer Edition org** — this is your personal sandbox for building and testing.

---

### Step 2 — Create a Connected App

1. From your Developer Edition org, click the **gear icon** (Setup) in the top right.
2. In the Quick Find box (left sidebar), type `App Manager` and click **App Manager**.
3. Click **New Connected App** (top right).
4. Fill in the **Basic Information** section:
   - **Connected App Name:** `DealStage`
   - **API Name:** auto-fills as `DealStage`
   - **Contact Email:** your business email
5. Scroll to the **API (Enable OAuth Settings)** section.
6. Check the box **Enable OAuth Settings**.

---

### Step 3 — Configure OAuth Redirect URIs

1. In the **Callback URL** field, enter exactly:
   ```
   https://thedealstage.com/callback/salesforce
   ```
2. If you need multiple environments, add each on its own line.

---

### Step 4 — Configure Scopes (Permissions)

1. In the **Selected OAuth Scopes** section, use the search box to find and add:
   - **Access and manage your data (api)**
   - **Perform requests on your behalf at any time (refresh_token, offline_access)**
   - **Full access (full)**
2. Move each scope from the **Available** list to the **Selected** list using the **Add** arrow button.
3. Scroll down and click **Save**.
4. Click **Continue** on the confirmation message.

> [!WARNING]
> The `full` scope is very broad. If you intend to only read data, use `api` and `refresh_token` only. Only request `full` if you genuinely need it — Salesforce admins at customer orgs may reject the install if they see `full`.

---

### Step 5 — Approval / Review Process

- **Your Developer Edition org:** Instant access. No review.
- **Production orgs (customer installs):** The Salesforce admin at the customer's org must approve your Connected App before their users can authorize it. This is done via: Setup > Connected Apps > Manage Connected Apps.
- **AppExchange listing** (if you distribute publicly): Requires a full Salesforce security review, which can take 4–8 weeks and costs $2,700 (as of 2025, confirm current pricing).

For direct customer installs without AppExchange, no Salesforce-side review is needed — but the customer's admin must allowlist your app.

---

### Step 6 — Get Credentials

1. After saving the Connected App, click **Manage Consumer Details**.
2. Salesforce will send a verification code to your email. Enter it.
3. You will see:
   - **Consumer Key** = Client ID
   - **Consumer Secret** = Client Secret
4. Copy both and store them in your secrets manager.

> [!NOTE]
> There is a 2–10 minute delay after creating the Connected App before the credentials are active. If OAuth fails immediately after creation, wait 10 minutes and try again.

---

### Step 7 — Test Before Going Live

1. Use your Developer Edition org for initial testing.
2. Initiate the OAuth flow. The authorization URL format is:
   ```
   https://login.salesforce.com/services/oauth2/authorize
     ?response_type=code
     &client_id=YOUR_CONSUMER_KEY
     &redirect_uri=https://thedealstage.com/callback/salesforce
     &scope=api%20refresh_token
   ```
3. After authorization, exchange the code for an access token. The token response includes `instance_url` — save this. It is the base URL for all API calls for this user's org.
4. Test a call: `GET {instance_url}/services/data/v59.0/sobjects/`

---

### Step 8 — Common Pitfalls

- **Storing `instance_url`.** Every Salesforce customer has a unique subdomain. You must store `instance_url` returned in the token response and use it for all subsequent API calls. Using `login.salesforce.com` as the base for API calls will fail.
- **Token expiry.** Salesforce access tokens expire after a short period. Use the `refresh_token` to get new access tokens without re-prompting the user.
- **API limits per edition.** Developer Edition orgs have lower limits than Enterprise orgs. Test with realistic volumes.
- **Connected App propagation delay.** New Connected Apps take up to 10 minutes to be recognized. Do not assume instant availability.
- **IP restrictions.** Some Salesforce orgs have IP allowlists. Your server's outbound IP may need to be added by the customer's admin.

---

### Step 9 — Environment Variables

```env
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_CALLBACK_URL=https://thedealstage.com/callback/salesforce
SALESFORCE_SCOPES=api refresh_token
SALESFORCE_LOGIN_URL=https://login.salesforce.com
```

> [!NOTE]
> `SALESFORCE_LOGIN_URL` can also be `https://test.salesforce.com` for sandbox orgs.

---

### Pricing / Cost Considerations

- Developer Edition org: Free (limited to 5MB data, 5 user licenses).
- API calls: Included in Salesforce license. Default limits vary by edition (Enterprise: 15,000/24hr, Unlimited: unlimited).
- AppExchange security review: ~$2,700 one-time fee (check current pricing).

---

---

## 4. HubSpot

**OAuth 2.0 | Console:** https://app.hubspot.com/developer/
**Callback URL:** `https://thedealstage.com/callback/hubspot`
**Scopes:** `crm.objects.contacts.read`, `crm.objects.deals.read`
**Rate Limit:** 100 requests per 10 seconds (per app per portal)
**Docs:** https://developers.hubspot.com/docs/api/intro-to-auth

---

### Step 1 — Create a HubSpot Developer Account

1. Go to https://app.hubspot.com/developer/
2. Click **Create a developer account**.
3. Enter your name, business email, and company name.
4. Verify your email via the link HubSpot sends.
5. You now have a **HubSpot Developer account** — separate from a regular HubSpot CRM account.

> [!NOTE]
> A developer account gives you access to test portals. You do not need a paid HubSpot subscription to build apps.

---

### Step 2 — Create a New App

1. In your developer account, click **Apps** in the left sidebar.
2. Click **Create app** (top right).
3. On the **App info** tab:
   - **App name:** `DealStage`
   - **App description:** Brief description of what your app does.
   - **App logo:** Optional, but recommended for OAuth consent screen.
4. Click **Auth** in the left tab list.

---

### Step 3 — Configure OAuth Redirect URIs

1. On the **Auth** tab, scroll to **Redirect URLs**.
2. Click **Add redirect URL**.
3. Enter exactly:
   ```
   https://thedealstage.com/callback/hubspot
   ```
4. Click **Add**.

---

### Step 4 — Configure Scopes (Permissions)

1. Still on the **Auth** tab, scroll to the **Scopes** section.
2. In the search box, search for and add:
   - `crm.objects.contacts.read`
   - `crm.objects.deals.read`
3. Use the **Add** button next to each scope to move them to the **Required scopes** list.
4. Click **Save changes** at the bottom.

> [!TIP]
> Keep required scopes to the minimum needed. HubSpot portal admins see these during installation. Fewer scopes = fewer install objections.

---

### Step 5 — Approval / Review Process

- **Private apps** (for a single HubSpot portal): Instant access, no review. Generate an API key directly.
- **Public apps** (shown in HubSpot Marketplace): Submit for listing review via the developer portal. Review takes 3–5 business days.

For thedealstage.com, you are building a **public OAuth app** that any HubSpot customer can install. No listing review is required unless you want to be in the HubSpot App Marketplace.

---

### Step 6 — Get Credentials

1. On the **Auth** tab, the **Client ID** and **Client Secret** are displayed at the top.
2. Click **Show** next to Client Secret to reveal it.
3. Copy both and store them in your secrets manager.

---

### Step 7 — Test Before Going Live

1. Create a **test portal**: In your developer account, click **Test portals** > **Create test portal**.
2. Install your app in the test portal by generating a test install URL:
   ```
   https://app.hubspot.com/oauth/authorize
     ?client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/hubspot
     &scope=crm.objects.contacts.read%20crm.objects.deals.read
   ```
3. Complete the install flow in the test portal.
4. Test a call: `GET https://api.hubapi.com/crm/v3/objects/contacts?limit=1` using the access token.

---

### Step 8 — Common Pitfalls

- **Access token expiry.** HubSpot OAuth access tokens expire after 30 minutes. Always implement refresh token logic.
- **Portal-specific.** Each HubSpot install gives you a portal-specific token. Store tokens keyed to the HubSpot portal ID (returned in the token response as `hub_id`).
- **Scope additions after install.** If you add scopes to your app after a user has already installed it, they must re-authorize. Communicate this in advance.
- **Rate limits are per app per portal.** The 100 req/10sec limit applies per app for each individual portal installation.

---

### Step 9 — Environment Variables

```env
HUBSPOT_CLIENT_ID=your_client_id_here
HUBSPOT_CLIENT_SECRET=your_client_secret_here
HUBSPOT_CALLBACK_URL=https://thedealstage.com/callback/hubspot
HUBSPOT_SCOPES=crm.objects.contacts.read crm.objects.deals.read
```

---

### Pricing / Cost Considerations

- Developer account: Free.
- API calls: Included with HubSpot portal subscription. No per-call charges.
- HubSpot App Marketplace listing: Free to list.

---

---

## 5. Pipedrive

**OAuth 2.0 | Console:** https://developers.pipedrive.com/
**Callback URL:** `https://thedealstage.com/callback/pipedrive`
**Scopes:** `users:read`, `deals:read`, `contacts:read`
**Rate Limit:** 2 requests/second (100 requests/10 seconds for some endpoints)
**Docs:** https://pipedrive.readme.io/docs/core-api-concepts-about-pipedrive-api

---

### Step 1 — Create a Pipedrive Developer Account

1. Go to https://developers.pipedrive.com/
2. Click **Sign up for free** or **Log in** if you already have an account.
3. If signing up, fill in your name, email, and company. Confirm your email.
4. After logging in, you will be on the **Pipedrive Developer Hub**.
5. Click **Create an app** or navigate to **My Apps** in the top menu and click **+ Create an app**.

---

### Step 2 — Create a New App

1. On the **Create an app** page:
   - **App name:** `DealStage`
   - **Short description:** Describe the app's purpose.
   - **Category:** Select the most relevant category.
2. Click **Next**.
3. On the second screen, select **OAuth** as the authentication method.
4. Click **Create app**.

---

### Step 3 — Configure OAuth Redirect URIs

1. On your app's settings page, click the **OAuth & Access Scopes** tab.
2. Under **Callback URL**, enter exactly:
   ```
   https://thedealstage.com/callback/pipedrive
   ```
3. Click **Save**.

---

### Step 4 — Configure Scopes (Permissions)

1. Still on the **OAuth & Access Scopes** tab, scroll to the scopes section.
2. Enable the following toggles:
   - `users:read` — Read user data
   - `deals:read` — Read deal data
   - `contacts:read` — Read contact/person data
3. Click **Save changes**.

---

### Step 5 — Approval / Review Process

- **Private use / direct install:** No review needed. Share the install URL directly with customers.
- **Pipedrive Marketplace listing:** Submit via the developer portal under **Marketplace listing**. Review takes 5–10 business days. You must provide screenshots, a demo video, and a privacy policy.

For thedealstage.com, you likely want a marketplace listing for visibility, but you can go live with direct OAuth installs before marketplace review completes.

---

### Step 6 — Get Credentials

1. On your app page, click the **OAuth & Access Scopes** tab.
2. Your **Client ID** and **Client Secret** are displayed in the **OAuth credentials** section.
3. Click the copy icon next to each to copy them.
4. Store both in your secrets manager.

---

### Step 7 — Test Before Going Live

1. Pipedrive provides a free 14-day trial account that doubles as a sandbox. Create one at https://pipedrive.com
2. Initiate the OAuth flow:
   ```
   https://oauth.pipedrive.com/oauth/authorize
     ?client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/pipedrive
     &scope=users:read deals:read contacts:read
   ```
3. After authorization, test a call: `GET https://api.pipedrive.com/v1/deals?limit=1`

---

### Step 8 — Common Pitfalls

- **Subdomain-based API URLs.** The Pipedrive API base URL includes the company's subdomain (e.g., `https://yourcompany.pipedrive.com/api/v1`). The OAuth token response includes `api_domain` — store this and use it for API calls.
- **Token refresh.** Pipedrive access tokens expire after 1 hour. Use the refresh token to renew.
- **Scope changes.** Adding new scopes requires existing users to re-authorize. Plan your scope list before launch.
- **Rate limiting is per company.** The 2 req/sec limit applies per connected Pipedrive company account.

---

### Step 9 — Environment Variables

```env
PIPEDRIVE_CLIENT_ID=your_client_id_here
PIPEDRIVE_CLIENT_SECRET=your_client_secret_here
PIPEDRIVE_CALLBACK_URL=https://thedealstage.com/callback/pipedrive
PIPEDRIVE_SCOPES=users:read deals:read contacts:read
```

---

### Pricing / Cost Considerations

- Developer account: Free.
- API calls: Included in Pipedrive subscription. No per-call fees.
- Marketplace listing: Free.

---

---

## 6. Slack

**OAuth 2.0 | Console:** https://api.slack.com/apps
**Callback URL:** `https://thedealstage.com/callback/slack`
**Scopes:** `chat:write`, `channels:history` (for reading), `commands`
**Rate Limit:** Tier-based: 1–20 req/sec depending on method
**Docs:** https://api.slack.com/quickstart

> [!NOTE]
> Slack uses **workspace-specific tokens**. Each Slack workspace that installs your app gets its own OAuth token. You must store tokens keyed to the Slack team/workspace ID.

---

### Step 1 — Create a Slack App

1. Go to https://api.slack.com/apps
2. Click **Create New App** (top right).
3. Select **From scratch** (not "From an app manifest" — for clarity as a first-timer).
4. In the modal:
   - **App Name:** `DealStage`
   - **Pick a workspace to develop your app in:** Select your own Slack workspace for testing. You can install to other workspaces later.
5. Click **Create App**.
6. You are now on your app's **Basic Information** page.

---

### Step 2 — Configure OAuth Redirect URIs

1. In the left sidebar, click **OAuth & Permissions**.
2. Scroll to the **Redirect URLs** section.
3. Click **Add New Redirect URL**.
4. Enter exactly:
   ```
   https://thedealstage.com/callback/slack
   ```
5. Click **Add**.
6. Click **Save URLs**.

---

### Step 3 — Configure Scopes (Permissions)

Slack separates scopes into **Bot Token Scopes** (for your app's bot) and **User Token Scopes** (acting as the user). For thedealstage.com:

1. Still on the **OAuth & Permissions** page, scroll to **Scopes**.
2. Under **Bot Token Scopes**, click **Add an OAuth Scope** and add:
   - `chat:write` — Post messages as the bot
   - `channels:history` — Read messages in channels (this is what "chat:read" maps to)
   - `commands` — Allow slash commands
3. Click **Add an OAuth Scope** for each one.

> [!NOTE]
> Slack does not have a scope literally named `chat:read`. The equivalent for reading messages is `channels:history`, `groups:history`, or `im:history` depending on channel type. `chat:write` is correct for writing.

---

### Step 4 — Enable Distribution (For Multi-Workspace Install)

To allow any Slack workspace to install your app (not just your development workspace):

1. In the left sidebar, click **Manage Distribution**.
2. Under **Share Your App with Other Workspaces**, review the checklist. Complete any items marked as incomplete.
3. Click **Activate Public Distribution**.

> [!WARNING]
> Until you activate public distribution, your app can only be installed in the workspace you selected during creation. Do this before sharing install links with customers.

---

### Step 5 — Approval / Review Process

- **Direct install (no Slack App Directory):** No review needed. Share your OAuth install link directly.
- **Slack App Directory listing:** Submit via the app settings under **Manage Distribution** > **Submit to App Directory**. Slack review takes 1–3 weeks and requires a privacy policy, support URL, and working demo.

---

### Step 6 — Get Credentials

1. In the left sidebar, click **Basic Information**.
2. Scroll to **App Credentials**.
3. You will see:
   - **Client ID** — visible immediately.
   - **Client Secret** — click **Show** to reveal it.
   - **Signing Secret** — used to verify incoming webhooks (save this too).
4. Copy all three and store them in your secrets manager.

---

### Step 7 — Test Before Going Live

1. Click **Install App** in the left sidebar.
2. Click **Install to Workspace** — this installs your app into your development workspace.
3. Authorize the permissions in the dialog.
4. After install, you receive a **Bot User OAuth Token** on the same page (starts with `xoxb-`).
5. Test posting a message:
   ```
   POST https://slack.com/api/chat.postMessage
   Authorization: Bearer xoxb-your-token
   Content-Type: application/json
   {"channel": "#general", "text": "Hello from DealStage"}
   ```

---

### Step 8 — Common Pitfalls

- **Bot token vs. user token.** Bot tokens start with `xoxb-`, user tokens with `xoxp-`. These grant different capabilities. Confirm which type your feature needs.
- **Workspace-specific tokens.** The bot token for Workspace A does not work for Workspace B. Always store the token with the workspace's `team_id`.
- **Event subscriptions require a public URL.** If you want Slack to push events to you (e.g., when a message is sent), your callback server must be publicly reachable and must respond to Slack's verification challenge.
- **Scope re-authorization.** Adding new bot scopes requires every workspace to uninstall and reinstall your app.
- **Rate tiers.** Different Slack API methods have different rate tiers (Tier 1 = 1/min, Tier 4 = 100/min). Check the documentation for each method you call.

---

### Step 9 — Environment Variables

```env
SLACK_CLIENT_ID=your_client_id_here
SLACK_CLIENT_SECRET=your_client_secret_here
SLACK_SIGNING_SECRET=your_signing_secret_here
SLACK_CALLBACK_URL=https://thedealstage.com/callback/slack
SLACK_SCOPES=chat:write,channels:history,commands
```

---

### Pricing / Cost Considerations

- App creation and API access: Free.
- Slack App Directory listing: Free.
- No per-call fees.

---

---

## 7. Zoom

**OAuth 2.0 | Console:** https://marketplace.zoom.us/develop/create
**Callback URL:** `https://thedealstage.com/callback/zoom`
**Scopes:** `meeting:read:admin`, `recording:read:admin`
**Docs:** https://developers.zoom.us/docs/getting-started/

---

### Step 1 — Create a Zoom Developer Account

1. Go to https://marketplace.zoom.us/
2. Click **Sign In** in the top right.
3. If you do not have a Zoom account, click **Sign Up Free** and create one.
4. After signing in, you are on the **Zoom App Marketplace**.
5. Click **Develop** in the top menu, then **Build App**.

---

### Step 2 — Create a New App

1. On the **Build App** page, you see several app types. Select **OAuth**.
2. Click **Create**.
3. In the modal:
   - **App Name:** `DealStage`
   - Toggle **Would you like to publish this app on Zoom App Marketplace?** to **Off** for now (you can change this later).
4. Click **Create**.
5. You are now on the app configuration page.

---

### Step 3 — Configure OAuth Redirect URIs

1. On the **App Credentials** tab (first tab), scroll to **OAuth Allow List**.
2. Under **Redirect URL for OAuth**, enter exactly:
   ```
   https://thedealstage.com/callback/zoom
   ```
3. Click **Add**.
4. Also add this URL to the **Add allow lists** field below to whitelist it.
5. Click **Continue** to proceed to the next tab.

---

### Step 4 — Configure Scopes (Permissions)

1. Click the **Scopes** tab on the left sidebar.
2. Click **Add Scopes**.
3. Search for and select:
   - `meeting:read:admin` — Read all meetings in the account
   - `recording:read:admin` — Read all recordings in the account
4. Click **Done**.
5. Click **Continue**.

> [!NOTE]
> The `:admin` scope variants read data across the whole Zoom account. If you only need the authorized user's own meetings, use `meeting:read` and `recording:read` without `:admin`.

---

### Step 5 — Approval / Review Process

- **Non-published apps (direct use):** Instant access. No review.
- **Zoom App Marketplace listing:** Click **Submit** on your app page and complete the Marketplace review form. Zoom review takes 2–4 weeks. You need a privacy policy, support URL, and a 3–5 minute demo video.

---

### Step 6 — Get Credentials

1. On the **App Credentials** tab, you will see:
   - **Client ID**
   - **Client Secret** — click the eye icon to reveal it.
2. Copy both and store them in your secrets manager.

---

### Step 7 — Test Before Going Live

1. On the **Local Test** tab, click **Test Connect** to validate your app's OAuth flow using your own Zoom account.
2. Alternatively, use the OAuth authorization URL:
   ```
   https://zoom.us/oauth/authorize
     ?response_type=code
     &client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/zoom
   ```
3. After authorization, test a call: `GET https://api.zoom.us/v2/users/me/meetings`

---

### Step 8 — Common Pitfalls

- **Account-level vs. user-level apps.** Account-level OAuth apps are authorized by the Zoom account admin once and work for all users. User-level OAuth apps require each user to authorize individually. Confirm which model you are building.
- **Token expiry.** Zoom access tokens expire after 1 hour. Implement refresh token logic.
- **Rate limits are not documented uniformly.** Zoom's rate limits vary by endpoint. Monitor 429 responses and back off.
- **Scopes can change after publish.** If you need to add scopes after publishing, you must go through the review process again.

---

### Step 9 — Environment Variables

```env
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
ZOOM_CALLBACK_URL=https://thedealstage.com/callback/zoom
ZOOM_SCOPES=meeting:read:admin recording:read:admin
```

---

### Pricing / Cost Considerations

- Developer account: Free.
- API calls: Included with Zoom account. No per-call fees.
- Zoom App Marketplace listing: Free.

---

---

## 8. Microsoft Teams

**OAuth 2.0 via Azure AD | Console:** https://dev.teams.microsoft.com/
**Callback URL:** `https://thedealstage.com/callback/teams`
**Scopes:** `Channel.ReadBasic.All`, `Chat.Read`
**Docs:** https://learn.microsoft.com/en-us/microsoftteams/platform/get-started/get-started-overview

> [!NOTE]
> Microsoft Teams apps are registered in **Azure Active Directory (Entra ID)**, not in Teams directly. The Teams Developer Portal helps you configure the Teams app manifest, but the OAuth credentials come from Azure.

---

### Step 1 — Create an Azure Account

1. Go to https://portal.azure.com/
2. Sign in with a Microsoft account, or click **Create one** if you don't have one. Use a business email (Microsoft 365 / Outlook).
3. Once logged in, you are on the Azure Portal home page.

---

### Step 2 — Register an Application in Azure AD

1. In the Azure Portal search bar at the top, type `App registrations` and click **App registrations** under Services.
2. Click **+ New registration** (top left).
3. Fill in the form:
   - **Name:** `DealStage Teams App`
   - **Supported account types:** Select **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts** — this allows any Teams user to sign in.
   - **Redirect URI:** Select **Web** from the dropdown, then enter:
     ```
     https://thedealstage.com/callback/teams
     ```
4. Click **Register**.
5. You are now on the app's **Overview** page.

---

### Step 3 — Configure OAuth Redirect URIs

1. In the left sidebar of your app registration, click **Authentication**.
2. Under **Web** > **Redirect URIs**, verify that `https://thedealstage.com/callback/teams` is listed.
3. If it is not there, click **Add URI** and enter it.
4. Under **Implicit grant and hybrid flows**, check:
   - **Access tokens**
   - **ID tokens**
5. Click **Save**.

---

### Step 4 — Configure Scopes (Permissions)

1. In the left sidebar, click **API permissions**.
2. Click **+ Add a permission**.
3. In the panel that opens, click **Microsoft Graph**.
4. Select **Delegated permissions** (for user-authorized access).
5. Search for and check:
   - `Channel.ReadBasic.All`
   - `Chat.Read`
6. Click **Add permissions**.
7. Click **Grant admin consent for [your tenant]** and then **Yes** to pre-approve these scopes.

> [!WARNING]
> Some Graph API scopes require admin consent from the target organization's IT admin. `Channel.ReadBasic.All` and `Chat.Read` are user-delegated scopes and generally do not require admin consent, but enterprise customers may have policies restricting app consent. Be prepared to guide customers' IT admins.

---

### Step 5 — Configure the Teams App in Developer Portal

1. Go to https://dev.teams.microsoft.com/
2. Sign in with the same Microsoft account.
3. Click **Apps** in the left sidebar.
4. Click **+ New app**.
5. Fill in the app details (name, description, URLs).
6. Under **App features**, add the capabilities you need (Bot, Tab, etc.).
7. Under **Single sign-on**, link your Azure AD app registration by entering the **Application ID URI** (visible in Azure under your app's Expose an API section).

---

### Step 6 — Get Credentials

1. In the Azure Portal, go to **App registrations** and click your app.
2. On the **Overview** page:
   - **Application (client) ID** = Client ID
3. In the left sidebar, click **Certificates & secrets**.
4. Click **+ New client secret**.
5. Enter a description (e.g., `DealStage Production`) and set an expiry (recommend 24 months).
6. Click **Add**.
7. **Copy the Secret Value immediately** — it is only shown once.
8. Store both the Client ID and Secret Value in your secrets manager.

> [!WARNING]
> Azure client secrets expire. Calendar a reminder 30 days before the expiry date to generate a new secret and update your environment variables. Expiry without rotation will take down your integration.

---

### Step 7 — Test Before Going Live

1. In the Teams Developer Portal, click **Preview in Teams** on your app's page.
2. Teams opens in your browser with the app installed in your personal workspace.
3. Test the OAuth flow by initiating authorization from your app.
4. Test a Graph API call: `GET https://graph.microsoft.com/v1.0/me/joinedTeams`

---

### Step 8 — Common Pitfalls

- **Multi-tenant vs. single-tenant.** If you set the app to single-tenant during registration, only users in your Azure AD tenant can sign in. For a product that connects external customers, use multitenant.
- **Admin consent requirements.** Enterprise customers' IT admins may need to grant consent to your app before their users can authorize. Be prepared to provide the admin consent URL: `https://login.microsoftonline.com/{tenant_id}/adminconsent?client_id={client_id}`
- **Secret expiry.** Azure client secrets expire. Rotating them before expiry is critical.
- **Token endpoint includes tenant ID.** The OAuth token endpoint is tenant-specific: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token`. For multitenant apps, use `common` as the tenant ID: `https://login.microsoftonline.com/common/oauth2/v2.0/token`

---

### Step 9 — Environment Variables

```env
TEAMS_CLIENT_ID=your_azure_application_client_id
TEAMS_CLIENT_SECRET=your_azure_client_secret_value
TEAMS_CALLBACK_URL=https://thedealstage.com/callback/teams
TEAMS_SCOPES=Channel.ReadBasic.All Chat.Read
TEAMS_TENANT_ID=common
```

---

### Pricing / Cost Considerations

- Azure AD app registration: Free (up to a generous quota).
- Microsoft Graph API calls: Free.
- Azure subscription: Free tier is sufficient for OAuth app registration.

---

---

## 9. Outlook / Office 365

**OAuth 2.0 via Azure AD (Microsoft Graph) | Console:** https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
**Callback URL:** `https://thedealstage.com/callback/outlook`
**Scopes:** `Mail.ReadWrite`, `Calendars.ReadWrite`
**Docs:** https://learn.microsoft.com/en-us/graph/auth-v2-user

> [!NOTE]
> Outlook/O365 integration uses the **Microsoft Graph API**, the same underlying platform as Teams. If you have already registered an Azure app for Teams, you can add Outlook scopes to the same registration OR create a separate one (recommended for clean separation).

---

### Step 1 — Create / Use Existing Azure App Registration

1. Go to https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
2. If creating a new app: Click **+ New registration** and follow the same steps as in the Teams section (Step 2 above).
   - **Name:** `DealStage Outlook App`
   - **Supported account types:** Multitenant + personal Microsoft accounts.
   - **Redirect URI:** Web — `https://thedealstage.com/callback/outlook`
3. Click **Register**.

---

### Step 2 — Configure OAuth Redirect URIs

1. In your app registration, click **Authentication** in the left sidebar.
2. Verify `https://thedealstage.com/callback/outlook` is listed under **Redirect URIs**.
3. If not, click **Add URI** and add it.
4. Check **Access tokens** and **ID tokens** under Implicit grant.
5. Click **Save**.

---

### Step 3 — Configure Scopes (Permissions)

1. Click **API permissions** in the left sidebar.
2. Click **+ Add a permission** > **Microsoft Graph** > **Delegated permissions**.
3. Search for and check:
   - `Mail.ReadWrite` — Read and write user mail
   - `Calendars.ReadWrite` — Read and write user calendars
4. Also add `offline_access` — this is required to receive a refresh token.
5. Click **Add permissions**.
6. Click **Grant admin consent for [your tenant]** > **Yes**.

> [!WARNING]
> `Mail.ReadWrite` is a sensitive scope. Enterprise IT admins may scrutinize or block this. Be prepared to justify the need for write access. If you only need to read mail, use `Mail.Read` instead.

---

### Step 4 — Approval / Review Process

- For personal Microsoft accounts and small businesses: Users can self-authorize in the OAuth flow.
- For enterprise organizations: The organization's Azure AD admin may need to pre-approve your app. Provide them with the admin consent URL.
- Microsoft does not have a traditional "app review" for Graph API apps. However, if you request highly sensitive scopes (like `Mail.ReadWrite` across all users), some tenants will block it without admin consent.

---

### Step 5 — Get Credentials

Same process as Teams:

1. **Application (client) ID** is on the app's Overview page.
2. **Client Secret**: Go to **Certificates & secrets** > **+ New client secret** > Add > Copy the value immediately.
3. Store both in your secrets manager.

---

### Step 6 — Test Before Going Live

1. Initiate the OAuth flow:
   ```
   https://login.microsoftonline.com/common/oauth2/v2.0/authorize
     ?client_id=YOUR_CLIENT_ID
     &response_type=code
     &redirect_uri=https://thedealstage.com/callback/outlook
     &response_mode=query
     &scope=Mail.ReadWrite%20Calendars.ReadWrite%20offline_access
   ```
2. After authorization, exchange the code for a token.
3. Test a call: `GET https://graph.microsoft.com/v1.0/me/messages?$top=1`

---

### Step 7 — Common Pitfalls

- **Missing `offline_access` scope.** Without this scope in the authorization request, you will not receive a refresh token and cannot silently renew access.
- **Access token lifetime.** Microsoft access tokens expire after 1 hour. Refresh tokens last 90 days for personal accounts and are sliding-window for enterprise.
- **Shared mailboxes.** If a user needs to access a shared mailbox, the OAuth user must have explicit access to it and you must call `GET /users/{sharedMailboxId}/messages` rather than `/me/messages`.
- **Pagination.** The Graph API paginates all list responses with `@odata.nextLink`. Always follow pagination links or you will miss data.
- **Throttling.** Microsoft Graph has complex throttling rules. Implement exponential backoff on 429 responses.

---

### Step 8 — Environment Variables

```env
OUTLOOK_CLIENT_ID=your_azure_application_client_id
OUTLOOK_CLIENT_SECRET=your_azure_client_secret_value
OUTLOOK_CALLBACK_URL=https://thedealstage.com/callback/outlook
OUTLOOK_SCOPES=Mail.ReadWrite Calendars.ReadWrite offline_access
OUTLOOK_TENANT_ID=common
```

---

### Pricing / Cost Considerations

- Azure AD app registration: Free.
- Microsoft Graph API calls: Free.
- Users need a valid Microsoft 365 / Outlook account to authorize.

---

---

## 10. Calendly

**OAuth 2.0 | Console:** https://developer.calendly.com/
**Callback URL:** `https://thedealstage.com/callback/calendly`
**Scopes:** `scheduling_links`, `events`
**Docs:** https://developer.calendly.com/getting-started

---

### Step 1 — Create a Calendly Developer Account

1. Go to https://developer.calendly.com/
2. Click **Get started** or **Sign in**.
3. If you don't have a Calendly account, click **Create a free account** and sign up with your business email.
4. Once signed in, click your profile icon (top right) and select **Integrations & apps** > **API & Webhooks** > **OAuth Apps**.
5. Alternatively, navigate directly to https://calendly.com/integrations/oauth/create

---

### Step 2 — Create a New OAuth App

1. On the **OAuth Applications** page, click **Create new application**.
2. Fill in:
   - **Application name:** `DealStage`
   - **Application URL:** `https://thedealstage.com`
   - **Application description:** Brief description of your use case.
3. Click **Create Application**.

---

### Step 3 — Configure OAuth Redirect URIs

1. On your app's settings page, find the **Redirect URIs** section.
2. Click **Add a redirect URI**.
3. Enter exactly:
   ```
   https://thedealstage.com/callback/calendly
   ```
4. Click **Save**.

---

### Step 4 — Configure Scopes (Permissions)

Calendly's scope model is determined by what the user has authorized. The scopes `scheduling_links` and `events` are requested at authorization time. Calendly does not have a scope-selection UI in the app console — scopes are passed in the OAuth authorization URL:

```
scope=scheduling_links events
```

---

### Step 5 — Approval / Review Process

Calendly does not currently require a formal app review for OAuth integration. Apps can be built and used directly once the OAuth application is created.

> [!NOTE]
> Calendly is in the process of expanding its developer ecosystem. Check the developer portal periodically for any new review requirements.

---

### Step 6 — Get Credentials

1. On your OAuth application page, you will see:
   - **Client ID**
   - **Client Secret** — click **Show** to reveal it.
2. Copy both and store them in your secrets manager.

---

### Step 7 — Test Before Going Live

1. Use your own Calendly account to test the OAuth flow.
2. Authorization URL:
   ```
   https://auth.calendly.com/oauth/authorize
     ?client_id=YOUR_CLIENT_ID
     &response_type=code
     &redirect_uri=https://thedealstage.com/callback/calendly
   ```
3. After authorization, test a call: `GET https://api.calendly.com/event_types` using the access token.

---

### Step 8 — Common Pitfalls

- **User URI as a key.** Calendly uses a URI (e.g., `https://api.calendly.com/users/AAAAAAAAAA`) to identify users, not a simple integer ID. Store this URI to scope API calls to the right user.
- **Access token expiry.** Calendly access tokens expire after 2 hours. Use the refresh token to renew.
- **Event type vs. scheduled event.** Calendly distinguishes between "event types" (templates like "30-min meeting") and "scheduled events" (actual booked instances). Make sure you are querying the right resource.

---

### Step 9 — Environment Variables

```env
CALENDLY_CLIENT_ID=your_client_id_here
CALENDLY_CLIENT_SECRET=your_client_secret_here
CALENDLY_CALLBACK_URL=https://thedealstage.com/callback/calendly
```

---

### Pricing / Cost Considerations

- Developer account: Free.
- API access: Included with Calendly plan. Users need at least a Standard/Teams plan for some features.
- No per-call fees.

---

---

## 11. Stripe (Already Live)

**OAuth 2.0 Connect | Console:** https://dashboard.stripe.com/developers
**Callback URL:** `https://thedealstage.com/callback/stripe`
**Scopes:** `read_write`
**Rate Limit:** 100 requests/second
**Status:** LIVE — this section documents the current setup

> [!NOTE]
> Stripe Connect is already configured and live for thedealstage.com. This section documents what is set up and provides reference for future developers.

---

### Current Configuration

The Stripe integration uses **Stripe Connect OAuth** to allow users to connect their existing Stripe accounts to DealStage. This enables DealStage to read and write on behalf of connected accounts.

**What was done to set this up:**

1. Logged into https://dashboard.stripe.com/
2. Navigated to **Developers** > **OAuth applications** (in the left sidebar under Connect).
3. Created a Connect application with:
   - **Redirect URI:** `https://thedealstage.com/callback/stripe`
   - **Scope:** `read_write`
4. Copied the **Client ID** (starts with `ca_`) and the **Secret Key** into production environment variables.

---

### Where Credentials Live

The following environment variables should already be set in your production environment:

```env
STRIPE_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_CALLBACK_URL=https://thedealstage.com/callback/stripe
STRIPE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
```

> [!WARNING]
> Never commit real Stripe secret keys or webhook secrets to version control. These are live production credentials. If they are ever exposed, go to the Stripe Dashboard immediately and roll them.

---

### OAuth Flow Reference

The standard Stripe Connect authorization URL:

```
https://connect.stripe.com/oauth/authorize
  ?response_type=code
  &client_id=ca_xxxxxxxx
  &scope=read_write
  &redirect_uri=https://thedealstage.com/callback/stripe
```

After the user authorizes, exchange the code:

```
POST https://connect.stripe.com/oauth/token
  grant_type=authorization_code
  &code={code_from_callback}
```

The response includes `access_token`, `stripe_user_id`, and `refresh_token`. Store `stripe_user_id` to identify the connected account.

---

### Rate Limit Reference

Stripe allows 100 requests/second in live mode. In test mode, the limit is 25 requests/second. Stripe automatically queues and retries most requests but will return 429 if you burst consistently above the limit.

---

### Ongoing Maintenance

- **Webhook signing:** Verify all incoming Stripe webhooks using the `STRIPE_WEBHOOK_SECRET`. Do not process unverified webhook payloads.
- **API version pinning:** Stripe's API version is pinned in the Dashboard under Developers > API keys. Do not change this without testing.
- **Payout monitoring:** For Connect accounts, monitor `account.updated` webhook events to detect when connected accounts lose payout capability.

---

---

## 12. Mailchimp

**OAuth 2.0 | Console:** https://us1.admin.mailchimp.com/account/api/
**Callback URL:** `https://thedealstage.com/callback/mailchimp`
**Scopes:** Note — Mailchimp OAuth grants full access; there is no granular scope selection.
**Rate Limit:** 10 requests/second
**Docs:** https://mailchimp.com/developer/marketing/guides/quick-start/

> [!NOTE]
> Mailchimp OAuth does not support granular scopes. Authorizing your app grants access to all resources (lists, campaigns, reports) for the user's account. The scopes listed (`lists`, `campaigns`, `reports`) describe the API resources you will access, not OAuth scope parameters.

---

### Step 1 — Create a Mailchimp Account

1. Go to https://mailchimp.com/
2. Click **Sign Up Free** and create an account with your business email.
3. Complete email verification.
4. Once logged in, navigate to https://us1.admin.mailchimp.com/account/api/

---

### Step 2 — Register an OAuth App

1. At https://us1.admin.mailchimp.com/account/api/, scroll to the **OAuth2** section.
2. Click **Register and Manage Your Apps**.
3. Click **Register App**.
4. Fill in:
   - **App Name:** `DealStage`
   - **App Description:** Brief description.
   - **Company/Organization:** Your company name.
   - **App Website:** `https://thedealstage.com`
5. Click **Create**.

---

### Step 3 — Configure OAuth Redirect URIs

1. After creating the app, you are on the app's settings page.
2. In the **Redirect URI** field, enter exactly:
   ```
   https://thedealstage.com/callback/mailchimp
   ```
3. Click **Update** or **Save**.

---

### Step 4 — Configure Scopes (Permissions)

Mailchimp does not offer scope selection during app registration. The OAuth token grants access to the entire account. Design your integration to use only the resources you need (`/lists`, `/campaigns`, `/reports`).

---

### Step 5 — Approval / Review Process

Mailchimp does not require app review for OAuth integrations. Apps can be created and used immediately.

---

### Step 6 — Get Credentials

1. On your app's settings page after creation, you will see:
   - **Client ID**
   - **Client Secret**
2. Copy both and store them in your secrets manager.

---

### Step 7 — Test Before Going Live

1. Authorization URL:
   ```
   https://login.mailchimp.com/oauth2/authorize
     ?response_type=code
     &client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/mailchimp
   ```
2. After authorization, exchange the code for a token at:
   ```
   POST https://login.mailchimp.com/oauth2/token
   ```
3. **Critical:** The token response includes a `dc` value (data center, e.g., `us1`, `us6`). The base URL for all API calls is `https://{dc}.api.mailchimp.com/3.0/`. Always extract and store this.
4. Test a call: `GET https://us1.api.mailchimp.com/3.0/lists?count=1`

---

### Step 8 — Common Pitfalls

- **Data center prefix.** This is the most common Mailchimp mistake. Every API call URL must include the user's data center prefix (e.g., `us1`, `us6`). Call `GET https://login.mailchimp.com/oauth2/metadata` using the access token to retrieve the correct `dc` value.
- **Token does not expire.** Mailchimp OAuth tokens do not expire by default. However, a user can revoke access at any time from their Mailchimp account. Handle 401 errors by prompting re-authorization.
- **Rate limits are per account.** The 10 req/sec limit applies per connected Mailchimp account.

---

### Step 9 — Environment Variables

```env
MAILCHIMP_CLIENT_ID=your_client_id_here
MAILCHIMP_CLIENT_SECRET=your_client_secret_here
MAILCHIMP_CALLBACK_URL=https://thedealstage.com/callback/mailchimp
```

> [!NOTE]
> Store the data center (`dc`) prefix per connected user alongside their access token. It is not a static environment variable.

---

### Pricing / Cost Considerations

- Developer account: Free.
- API access: Included with Mailchimp plan. Free tier allows limited contacts and sends.
- No per-call fees.

---

---

## 13. Zoho CRM

**OAuth 2.0 | Console:** https://api-console.zoho.com/
**Callback URL:** `https://thedealstage.com/callback/zoho`
**Scopes:** `ZohoCRM.modules.ALL`
**Docs:** https://www.zoho.com/crm/developer/docs/api/v7/get-started.html

> [!NOTE]
> Zoho has multiple data centers (US, EU, IN, AU, JP). The API endpoint and OAuth URLs differ per data center. You must handle this per connected user.

---

### Step 1 — Create a Zoho Developer Account

1. Go to https://accounts.zoho.com/register
2. Sign up with your business email.
3. Verify your email.
4. Once logged in, navigate to https://api-console.zoho.com/

---

### Step 2 — Create a New Client

1. At https://api-console.zoho.com/, click **Add Client**.
2. Select **Server-based Applications** (this is for OAuth with a backend server — the correct type for thedealstage.com).
3. Fill in:
   - **Client Name:** `DealStage`
   - **Homepage URL:** `https://thedealstage.com`
   - **Authorized Redirect URIs:**
     ```
     https://thedealstage.com/callback/zoho
     ```
4. Click **Create**.

---

### Step 3 — Configure OAuth Redirect URIs

The redirect URI is set during app creation (Step 2 above). To modify it later:

1. In the API Console, click on your app name.
2. Click the **Edit** icon next to **Authorized Redirect URIs**.
3. Update or add URIs and save.

---

### Step 4 — Configure Scopes (Permissions)

Zoho scopes are passed at authorization time. The scope `ZohoCRM.modules.ALL` grants read/write access to all CRM modules. To construct the authorization URL:

```
https://accounts.zoho.com/oauth/v2/auth
  ?scope=ZohoCRM.modules.ALL
  &client_id=YOUR_CLIENT_ID
  &response_type=code
  &redirect_uri=https://thedealstage.com/callback/zoho
  &access_type=offline
```

> [!TIP]
> Include `access_type=offline` to receive a refresh token. Without it, you only get a short-lived access token.

---

### Step 5 — Approval / Review Process

Zoho does not require app review for OAuth integrations. Apps created in the API Console are immediately available.

---

### Step 6 — Get Credentials

1. After creating the client in the API Console, you are redirected to the client details page.
2. You will see:
   - **Client ID**
   - **Client Secret** — click **Show Secret** to reveal it.
3. Copy both and store them in your secrets manager.

---

### Step 7 — Test Before Going Live

1. Zoho provides a sandbox CRM environment. Sign up at https://crm.zoho.com/crm/showSandbox
2. Complete the OAuth flow using your Client ID/Secret.
3. The token response includes `api_domain` — store this. It is the base URL for API calls (e.g., `https://www.zohoapis.com` for US, `https://www.zohoapis.eu` for EU).
4. Test a call: `GET https://www.zohoapis.com/crm/v7/Contacts?per_page=1`

---

### Step 8 — Common Pitfalls

- **Multi-data-center handling.** A user in the EU will have an `api_domain` of `https://www.zohoapis.eu`. Always use the `api_domain` from the token response, not a hardcoded URL.
- **OAuth server URL also varies by region.** For EU users, the authorization URL is `https://accounts.zoho.eu/oauth/v2/auth`. You need to know the user's region before starting the OAuth flow. Consider asking users to select their region.
- **Refresh token usage.** Zoho refresh tokens can only be used once. Each use generates a new refresh token. Always store the latest refresh token after each refresh cycle.
- **Token expiry.** Access tokens expire after 1 hour.

---

### Step 9 — Environment Variables

```env
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_CALLBACK_URL=https://thedealstage.com/callback/zoho
ZOHO_SCOPES=ZohoCRM.modules.ALL
```

---

### Pricing / Cost Considerations

- Developer account: Free.
- Zoho CRM API access: Included with Zoho CRM subscription.
- No per-call fees.

---

---

## 14. Copper

**OAuth 2.0 via Google | Console:** https://developer.copper.com/
**Callback URL:** `https://thedealstage.com/callback/copper`
**Scopes:** `contacts`, `opportunities`
**Docs:** https://developer.copper.com/introduction/getting-started

> [!NOTE]
> Copper CRM is tightly integrated with Google Workspace. Users must have a Google account to use Copper. The OAuth flow may use Google authentication as the identity layer.

---

### Step 1 — Create a Copper Developer Account

1. Go to https://developer.copper.com/
2. Click **Get Started** or **Sign In**.
3. You will need an active Copper CRM account. If you don't have one, sign up at https://copper.com (14-day free trial available).
4. Once logged into Copper, navigate to **Settings** > **Integrations** > **API Keys** for simple API key access, or follow the OAuth flow below for user-authorized access.

---

### Step 2 — Register for OAuth Access

1. Copper's public OAuth app registration is done through their developer portal at https://developer.copper.com/
2. Click **Register your application**.
3. Fill in:
   - **Application Name:** `DealStage`
   - **Application URL:** `https://thedealstage.com`
   - **Redirect URI:**
     ```
     https://thedealstage.com/callback/copper
     ```
4. Submit the registration form.

> [!NOTE]
> As of early 2025, Copper's OAuth may require direct contact with their partnerships team for third-party app registration. Check https://developer.copper.com for current self-service availability. Their API also supports a simpler **API Key + email** authentication that may be appropriate for early development.

---

### Step 3 — Configure OAuth Redirect URIs

1. If self-service registration is available, the redirect URI is set during registration (Step 2).
2. If working through Copper's partnerships team, provide them with:
   ```
   https://thedealstage.com/callback/copper
   ```

---

### Step 4 — Configure Scopes (Permissions)

Copper's scopes for your use case:

- `contacts` — Read contact (person/company) data
- `opportunities` — Read opportunity (deal) data

These are specified in the OAuth authorization request scope parameter.

---

### Step 5 — Approval / Review Process

Copper does not publicly document a formal review process for OAuth apps. Contact their developer support at https://developer.copper.com to confirm current requirements.

---

### Step 6 — Get Credentials

After registration is approved:

1. Log into the Copper developer portal.
2. Navigate to your registered application.
3. Copy the **Client ID** and **Client Secret**.
4. Store both in your secrets manager.

**Alternative — API Key Authentication (for faster development):**

If OAuth is not yet set up, Copper supports API key + user email authentication:

1. In Copper, go to **Settings** > **Integrations** > **API Keys**.
2. Click **Generate API Key**.
3. Copy the key.
4. Add to all API requests as headers:
   ```
   X-PW-AccessToken: your_api_key
   X-PW-Application: developer_api
   X-PW-UserEmail: your@email.com
   Content-Type: application/json
   ```

---

### Step 7 — Test Before Going Live

1. Use the API key authentication method (Step 6 alternative) to test API access immediately without waiting for OAuth setup.
2. Test a call:
   ```
   POST https://api.copper.com/developer_api/v1/people/search
   Headers: X-PW-AccessToken, X-PW-Application, X-PW-UserEmail
   Body: {"page_size": 1}
   ```
3. Confirm the response includes contact data from your Copper account.

---

### Step 8 — Common Pitfalls

- **Copper API uses POST for search/list.** Unlike most REST APIs where you GET `/contacts`, Copper requires a POST to `/contacts/search` with a JSON body to list records. Sending GET requests to list endpoints will fail.
- **Google authentication dependency.** Copper users authenticate via Google. If your OAuth flow requires Copper to authenticate the user, the user will be redirected through a Google sign-in.
- **Rate limits not publicly documented.** Monitor your usage and implement exponential backoff on 429 responses.

---

### Step 9 — Environment Variables

```env
COPPER_CLIENT_ID=your_client_id_here
COPPER_CLIENT_SECRET=your_client_secret_here
COPPER_CALLBACK_URL=https://thedealstage.com/callback/copper
COPPER_SCOPES=contacts opportunities
# Fallback API key authentication:
COPPER_API_KEY=your_api_key_here
COPPER_USER_EMAIL=your_email@thedealstage.com
```

---

### Pricing / Cost Considerations

- Developer account: Free with a Copper subscription.
- Copper CRM plans: Start at ~$29/user/month.
- API access: Included with any paid plan.
- No per-call fees.

---

---

## Appendix A — Master Environment Variable Reference

Below is a consolidated reference of all environment variables across all integrations. Store these in your secrets manager (e.g., Vercel Environment Variables, AWS Secrets Manager, or a `.env` file that is never committed to version control).

```env
# ── Shopify ───────────────────────────────────────────────────────────────────
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
SHOPIFY_CALLBACK_URL=https://thedealstage.com/callback/shopify
SHOPIFY_SCOPES=read_products,read_orders,read_customers

# ── Etsy ──────────────────────────────────────────────────────────────────────
ETSY_CLIENT_ID=
ETSY_CLIENT_SECRET=
ETSY_CALLBACK_URL=https://thedealstage.com/callback/etsy
ETSY_SCOPES=listings_r transactions_r

# ── Salesforce ────────────────────────────────────────────────────────────────
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_CALLBACK_URL=https://thedealstage.com/callback/salesforce
SALESFORCE_SCOPES=api refresh_token
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# ── HubSpot ───────────────────────────────────────────────────────────────────
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
HUBSPOT_CALLBACK_URL=https://thedealstage.com/callback/hubspot
HUBSPOT_SCOPES=crm.objects.contacts.read crm.objects.deals.read

# ── Pipedrive ─────────────────────────────────────────────────────────────────
PIPEDRIVE_CLIENT_ID=
PIPEDRIVE_CLIENT_SECRET=
PIPEDRIVE_CALLBACK_URL=https://thedealstage.com/callback/pipedrive
PIPEDRIVE_SCOPES=users:read deals:read contacts:read

# ── Slack ─────────────────────────────────────────────────────────────────────
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=
SLACK_CALLBACK_URL=https://thedealstage.com/callback/slack
SLACK_SCOPES=chat:write,channels:history,commands

# ── Zoom ──────────────────────────────────────────────────────────────────────
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_CALLBACK_URL=https://thedealstage.com/callback/zoom
ZOOM_SCOPES=meeting:read:admin recording:read:admin

# ── Microsoft Teams ───────────────────────────────────────────────────────────
TEAMS_CLIENT_ID=
TEAMS_CLIENT_SECRET=
TEAMS_CALLBACK_URL=https://thedealstage.com/callback/teams
TEAMS_SCOPES=Channel.ReadBasic.All Chat.Read
TEAMS_TENANT_ID=common

# ── Outlook / O365 ────────────────────────────────────────────────────────────
OUTLOOK_CLIENT_ID=
OUTLOOK_CLIENT_SECRET=
OUTLOOK_CALLBACK_URL=https://thedealstage.com/callback/outlook
OUTLOOK_SCOPES=Mail.ReadWrite Calendars.ReadWrite offline_access
OUTLOOK_TENANT_ID=common

# ── Calendly ──────────────────────────────────────────────────────────────────
CALENDLY_CLIENT_ID=
CALENDLY_CLIENT_SECRET=
CALENDLY_CALLBACK_URL=https://thedealstage.com/callback/calendly

# ── Stripe (LIVE) ─────────────────────────────────────────────────────────────
STRIPE_CLIENT_ID=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_CALLBACK_URL=https://thedealstage.com/callback/stripe
STRIPE_WEBHOOK_SECRET=

# ── Mailchimp ─────────────────────────────────────────────────────────────────
MAILCHIMP_CLIENT_ID=
MAILCHIMP_CLIENT_SECRET=
MAILCHIMP_CALLBACK_URL=https://thedealstage.com/callback/mailchimp

# ── Zoho CRM ──────────────────────────────────────────────────────────────────
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_CALLBACK_URL=https://thedealstage.com/callback/zoho
ZOHO_SCOPES=ZohoCRM.modules.ALL

# ── Copper ────────────────────────────────────────────────────────────────────
COPPER_CLIENT_ID=
COPPER_CLIENT_SECRET=
COPPER_CALLBACK_URL=https://thedealstage.com/callback/copper
COPPER_SCOPES=contacts opportunities
COPPER_API_KEY=
COPPER_USER_EMAIL=
```

---

## Appendix B — Review / Approval Time Reference

| Platform        | Time to Access     | Review Required?        | Notes                                           |
| --------------- | ------------------ | ----------------------- | ----------------------------------------------- |
| Shopify         | Instant            | No (custom apps)        | Marketplace review needed for App Store listing |
| Etsy            | 3–10 business days | Yes (production access) | Sandbox available immediately                   |
| Salesforce      | Instant (dev)      | No (direct installs)    | AppExchange review = $2,700 + 4–8 weeks         |
| HubSpot         | Instant            | No                      | Marketplace listing optional                    |
| Pipedrive       | Instant            | No                      | Marketplace listing = 5–10 days                 |
| Slack           | Instant            | No                      | App Directory listing = 1–3 weeks               |
| Zoom            | Instant            | No                      | Marketplace listing = 2–4 weeks                 |
| Microsoft Teams | Instant            | No (Azure)              | Enterprise admin consent may be needed          |
| Outlook / O365  | Instant            | No (Azure)              | Sensitive scopes may require admin consent      |
| Calendly        | Instant            | No                      |                                                 |
| Stripe          | Already live       | N/A                     |                                                 |
| Mailchimp       | Instant            | No                      |                                                 |
| Zoho CRM        | Instant            | No                      |                                                 |
| Copper          | Contact team       | Unclear                 | May require manual approval                     |

---

## Appendix C — Token Expiry Reference

| Platform        | Access Token Lifetime  | Refresh Token Lifetime | Refresh Needed?                   |
| --------------- | ---------------------- | ---------------------- | --------------------------------- |
| Shopify         | No expiry (per-store)  | N/A                    | No                                |
| Etsy            | 3,600 seconds (1 hour) | Long-lived             | Yes                               |
| Salesforce      | Short (minutes)        | Long-lived             | Yes                               |
| HubSpot         | 30 minutes             | Long-lived             | Yes                               |
| Pipedrive       | 1 hour                 | Long-lived             | Yes                               |
| Slack           | No expiry (bot tokens) | N/A                    | No                                |
| Zoom            | 1 hour                 | Long-lived             | Yes                               |
| Microsoft Teams | 1 hour                 | 90 days (sliding)      | Yes                               |
| Outlook / O365  | 1 hour                 | 90 days (sliding)      | Yes                               |
| Calendly        | 2 hours                | Long-lived             | Yes                               |
| Stripe          | No expiry              | N/A                    | No                                |
| Mailchimp       | No expiry              | N/A                    | No (but can be revoked)           |
| Zoho CRM        | 1 hour                 | Single-use, rotates    | Yes (store new refresh each time) |
| Copper          | Varies                 | Varies                 | Yes                               |
