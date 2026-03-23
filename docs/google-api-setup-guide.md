# Google API Setup Guide: YouTube, Gmail, and Google Calendar

**Domain:** thedealstage.com
**Shared Google Cloud Project:** Single project for all three APIs
**Last Updated:** 2026-03-21

---

## Overview

This guide walks you through setting up OAuth 2.0 API access for three Google APIs — YouTube Data API v3, Gmail API, and Google Calendar API — all sharing a single Google Cloud project. You will complete the project setup once, then enable and configure each API individually.

**Estimated time:** 45–90 minutes for initial setup, plus Google's review period if verification is triggered.

**What you will need:**

- A Google account that will own the Cloud project (use a business/team account, not a personal one)
- Access to your DNS or domain registrar for thedealstage.com (for domain verification)
- A code editor to store environment variables securely

> **CALLOUT — Read Before You Start**
> Google's OAuth consent screen review is triggered by specific scopes. Two of the scopes in this guide (`gmail.send` and `calendar.events`) are classified as **Restricted scopes** by Google. This means your app will show an "unverified app" warning to users until you complete Google's verification process. You can test with up to 100 test users before verification is required. Do not skip Step 5 — the consent screen configuration determines everything that follows.

---

## Part 1 — Create the Google Cloud Project (Do This Once)

All three APIs share this single project. Complete this section exactly once.

### Step 1 — Sign In to Google Cloud Console

1. Open your browser and navigate to: `https://console.cloud.google.com/`
2. Sign in with the Google account that will own this project. Use a team or organization account if possible — individual personal accounts create complications when adding team members later.
3. If prompted to agree to Terms of Service, read and click **Agree and Continue**.

### Step 2 — Create a New Project

1. In the top navigation bar, click the **project selector dropdown** — it appears as a button showing either "Select a project" or your currently active project name, located to the right of the "Google Cloud" logo.
2. A modal dialog titled **Select a project** will open. Click the **New Project** button in the upper-right corner of this dialog.
3. You are now on the **New Project** page. Fill in the fields:
   - **Project name:** Enter `thedealstage-api` (or a name your team will recognize — this is display-only and can be changed later)
   - **Organization:** If your Google account belongs to a Google Workspace organization, select it here. If not, leave as "No organization."
   - **Location:** Leave as the default unless your organization has a required folder structure.
4. Click the **Create** button.
5. Google will create the project. You will see a notification bell in the top-right corner. Click it and wait for "Create Project: thedealstage-api" to show a green checkmark.
6. The console will automatically switch to your new project. Confirm the project name appears in the top navigation bar's project selector.

> **CALLOUT — Project ID vs. Project Name**
> Google generates a unique **Project ID** (e.g., `thedealstage-api-123456`) that cannot be changed after creation. This ID is distinct from the display name. Note it down — you will reference it in your environment variables.

### Step 3 — Enable Billing (Required for API Quotas)

> **CALLOUT — Billing and Free Tiers**
> Enabling billing does not mean you will be charged. YouTube Data API v3 is free at 10,000 units/day. Gmail API and Calendar API are free within standard usage limits. Billing must be enabled on the project for APIs to function, but you will not incur charges unless you exceed free tier limits. Google requires a credit card on file.

1. In the left sidebar, click the hamburger menu icon (three horizontal lines) to expand navigation if it is collapsed.
2. Scroll down and click **Billing**.
3. If no billing account is linked, click **Link a billing account** or **Manage billing accounts**, then follow the prompts to add a payment method.
4. Once a billing account is linked, return to your project by clicking the project name in the top navigation bar.

### Step 4 — Verify Domain Ownership (Recommended Before Configuring OAuth)

Verifying your domain now prevents issues when setting up the OAuth consent screen.

1. Navigate to: `https://search.google.com/search-console/`
2. Click **Add property**.
3. Select the **Domain** property type and enter `thedealstage.com`.
4. Google will provide a TXT record to add to your DNS. Copy this record.
5. Log in to your domain registrar (wherever thedealstage.com is registered) and add the TXT record to your DNS settings.
6. Return to Search Console and click **Verify**. DNS propagation can take up to 72 hours, but usually completes within 15–30 minutes.

> **CALLOUT — Why This Matters**
> Domain verification is required to add your domain as an "Authorized domain" on the OAuth consent screen. Without it, Google will not allow you to list thedealstage.com as an authorized domain, and your callback URLs will not be trusted.

---

## Part 2 — Configure the OAuth Consent Screen (Do This Once, Before Creating Any Credentials)

The OAuth consent screen is the page users see when your app requests permission to access their Google account. You configure it once per project, and it applies to all three APIs.

### Step 5 — Open the OAuth Consent Screen Configuration

1. From the Google Cloud Console (`https://console.cloud.google.com/`), confirm your project is selected in the top navigation bar.
2. In the left sidebar, click **APIs & Services**.
3. In the submenu that appears, click **OAuth consent screen**.
4. You will see a page titled **OAuth consent screen**.

### Step 6 — Choose User Type

On the OAuth consent screen page, you must select a User Type:

- **Internal** — Only users within your Google Workspace organization can authenticate. No verification required. Choose this only if all users will be from your own organization's Google Workspace.
- **External** — Any Google account can authenticate. This is required if users outside your organization will use the app. **This is almost certainly the correct choice for thedealstage.com.**

1. Select **External**.
2. Click **Create**.

> **CALLOUT — Internal vs. External**
> If you select External, your app will be subject to Google's verification requirements once you add restricted or sensitive scopes. The gmail.send and calendar.events scopes used in this guide will trigger this requirement. You can still test with up to 100 manually added test users while your app is in "Testing" publishing status — verification is only required to go to production.

### Step 7 — Fill In the OAuth Consent Screen Details

You are now on a multi-step form. Complete each field carefully — this information is shown to users during the OAuth authorization flow.

**App information:**

1. **App name:** Enter the name users will see on the authorization screen. Example: `The Deal Stage`
2. **User support email:** Enter an email address users can contact if they have questions about authorization. This must be a Google account email or a Google Group email.
3. **App logo** (optional but recommended): Upload a 120x120 pixel PNG or JPG of your logo. This appears on the consent screen.

**App domain:**

4. **Application home page:** Enter `https://thedealstage.com`
5. **Application privacy policy link:** Enter `https://thedealstage.com/privacy` (create this page if it does not exist — Google requires it for verification)
6. **Application terms of service link:** Enter `https://thedealstage.com/terms`

**Authorized domains:**

7. Click **Add domain**.
8. Enter `thedealstage.com` in the field that appears.
9. Click **Add domain** again if you need additional domains (not required for this setup).

> **CALLOUT — Authorized Domain Prerequisite**
> If thedealstage.com does not appear as an option or returns an error, you have not yet verified domain ownership. Complete Step 4 (domain verification in Google Search Console) before proceeding. The project owner's email domain is automatically authorized, but thedealstage.com requires explicit verification.

**Developer contact information:**

10. **Email addresses:** Enter one or more email addresses where Google can contact you about the project. These are not shown to users.

11. Click **Save and Continue**.

### Step 8 — Add Scopes

You are now on the **Scopes** step of the consent screen setup.

1. Click the **Add or Remove Scopes** button. A side panel will open.
2. In the search field within the panel, search for and select the following scopes. You will add all of them now even though they belong to different APIs:

   | Scope                                               | Sensitivity Level | API      |
   | --------------------------------------------------- | ----------------- | -------- |
   | `https://www.googleapis.com/auth/youtube.readonly`  | Sensitive         | YouTube  |
   | `https://www.googleapis.com/auth/youtube.force-ssl` | Sensitive         | YouTube  |
   | `https://www.googleapis.com/auth/gmail.readonly`    | Sensitive         | Gmail    |
   | `https://www.googleapis.com/auth/gmail.send`        | Restricted        | Gmail    |
   | `https://www.googleapis.com/auth/calendar.readonly` | Sensitive         | Calendar |
   | `https://www.googleapis.com/auth/calendar.events`   | Restricted        | Calendar |

3. Check the checkbox next to each scope listed above.
4. Click **Update** at the bottom of the panel.
5. Review the scopes now listed on the page. You should see them grouped under "Sensitive scopes" and "Restricted scopes" sections.
6. Click **Save and Continue**.

> **CALLOUT — Restricted Scopes Trigger Verification**
> `gmail.send` and `calendar.events` are classified as **Restricted scopes**. This means:
>
> - Users will see a warning screen saying "This app isn't verified" during OAuth.
> - To remove this warning for production use, you must complete Google's OAuth verification process (covered in Part 6 of this guide).
> - During development and testing, you can bypass this warning by adding users as Test Users (Step 9 below) — the warning screen will still appear but test users can click through it.

### Step 9 — Add Test Users

You are now on the **Test users** step.

1. Click **Add Users**.
2. Enter the Gmail addresses of developers and testers who need to authenticate during development. You can add up to 100 test users.
3. Click **Add**.
4. Click **Save and Continue**.

> **CALLOUT — Test Users Are Critical**
> If you do not add test users, no one (including yourself) will be able to complete the OAuth flow while your app is in Testing status. Add every developer, QA tester, and stakeholder who needs access before you start integration work. Test users can be added or removed at any time.

### Step 10 — Review the Summary

1. Review the summary page. Confirm all details are correct.
2. Click **Back to Dashboard**.
3. On the OAuth consent screen dashboard, you will see your app's publishing status as **Testing**. Leave this as Testing until you are ready for production and have completed Google's verification process.

---

## Part 3 — Enable All Three APIs

### Step 11 — Enable YouTube Data API v3

1. Navigate to: `https://console.cloud.google.com/apis/library`
2. Confirm your project is selected in the top navigation bar.
3. In the search bar on the API Library page, type `YouTube Data API v3`.
4. Click on the result titled **YouTube Data API v3** (published by Google).
5. On the API detail page, click the blue **Enable** button.
6. Wait for the API to enable. You will be redirected to the API's management page when complete.

### Step 12 — Enable Gmail API

1. Navigate to: `https://console.cloud.google.com/apis/library`
2. In the search bar, type `Gmail API`.
3. Click on the result titled **Gmail API** (published by Google).
4. Click the blue **Enable** button.
5. Wait for the redirect to the Gmail API management page.

### Step 13 — Enable Google Calendar API

1. Navigate to: `https://console.cloud.google.com/apis/library`
2. In the search bar, type `Google Calendar API`.
3. Click on the result titled **Google Calendar API** (published by Google).
4. Click the blue **Enable** button.
5. Wait for the redirect to the Google Calendar API management page.

### Step 14 — Verify All APIs Are Enabled

1. Navigate to: `https://console.cloud.google.com/apis/dashboard`
2. You should see **YouTube Data API v3**, **Gmail API**, and **Google Calendar API** listed under "Enabled APIs & services."
3. If any are missing, return to the API Library (Step 11 through Step 13) and enable them.

---

## Part 4 — Create OAuth 2.0 Credentials

You will create one OAuth 2.0 Client ID that handles all three APIs. A single set of credentials can support multiple redirect URIs, so you do not need separate credentials per API.

### Step 15 — Navigate to Credentials

1. From the Cloud Console, click **APIs & Services** in the left sidebar.
2. Click **Credentials** in the submenu.
3. You are now on the **Credentials** page.

### Step 16 — Create OAuth 2.0 Client ID

1. Click the **+ Create Credentials** button at the top of the page.
2. In the dropdown that appears, click **OAuth client ID**.
3. On the **Create OAuth client ID** page, configure the following:

   **Application type:**
   - Click the **Application type** dropdown.
   - Select **Web application**.

   **Name:**
   - Enter a descriptive name: `thedealstage.com Web Client`
   - This name is for your internal reference only — users do not see it.

### Step 17 — Add Authorized JavaScript Origins

Under the **Authorized JavaScript origins** section:

1. Click **Add URI**.
2. Enter: `https://thedealstage.com`
3. Click **Add URI** again.
4. Enter: `http://localhost:3000` (or whatever port your local development server uses — add all local ports you use for development, such as `http://localhost:5173` for Vite)

> **CALLOUT — JavaScript Origins vs. Redirect URIs**
> JavaScript origins are the domains that are allowed to initiate OAuth requests from the browser. Redirect URIs are where Google sends the user after authorization. Both must be configured — a missing JavaScript origin causes CORS errors, while a missing redirect URI causes a `redirect_uri_mismatch` error.

### Step 18 — Add Authorized Redirect URIs

Under the **Authorized redirect URIs** section:

1. Click **Add URI** and enter each of the following — add them all now:

   ```
   https://thedealstage.com/callback/youtube
   https://thedealstage.com/callback/gmail
   https://thedealstage.com/callback/gcal
   ```

2. For local development, also add:

   ```
   http://localhost:3000/callback/youtube
   http://localhost:3000/callback/gmail
   http://localhost:3000/callback/gcal
   ```

   Repeat for any other local ports (e.g., `http://localhost:5173/...`).

3. After adding all URIs, click **Create**.

### Step 19 — Save Your Client ID and Client Secret

A dialog box will appear titled **OAuth client created**. This dialog shows:

- **Your Client ID** — a string ending in `.apps.googleusercontent.com`
- **Your Client Secret** — a shorter alphanumeric string

**Do the following immediately:**

1. Click **Download JSON**. This saves a file called `client_secret_[client-id].json` to your computer. Store this file securely — never commit it to version control.
2. Copy the Client ID and Client Secret to your secure secrets manager (AWS Secrets Manager, HashiCorp Vault, 1Password, or at minimum a `.env` file that is in `.gitignore`).
3. Click **OK** to close the dialog.

> **CALLOUT — You Cannot Recover the Client Secret**
> If you close this dialog without saving the Client Secret, you can view it again by clicking the edit (pencil) icon next to your credential on the Credentials page. However, if you ever suspect the secret has been compromised, you must click **Reset Secret** to generate a new one — this will break any existing integrations until you update your environment variables.

---

## Part 5 — Environment Variables

Store the following environment variables in your `.env` file (ensure `.env` is listed in `.gitignore` before adding any values):

```bash
# Google OAuth — Shared Across YouTube, Gmail, and Calendar
# Project: thedealstage-api (Google Cloud Project)

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Redirect URIs — must match exactly what is registered in Google Cloud Console
GOOGLE_CALLBACK_YOUTUBE=https://thedealstage.com/callback/youtube
GOOGLE_CALLBACK_GMAIL=https://thedealstage.com/callback/gmail
GOOGLE_CALLBACK_GCAL=https://thedealstage.com/callback/gcal

# Scopes — pass as space-separated string or array depending on your OAuth library
YOUTUBE_SCOPES=https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send
GCAL_SCOPES=https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events

# Google Cloud Project Reference
GOOGLE_CLOUD_PROJECT_ID=thedealstage-api-[your-generated-id]
```

> **CALLOUT — Scope Handling in Code**
> Request only the scopes relevant to each integration point. Do not request all six scopes at once unless the user is authenticating for all three services simultaneously. Requesting more scopes than necessary increases the likelihood users will decline authorization and can slow down Google's verification review.

---

## Part 6 — Google's Verification Process

### What Triggers Verification

Google requires verification when ALL of the following are true:

1. Your app's publishing status is set to **Production** (not Testing).
2. Your app requests one or more **Sensitive** or **Restricted** scopes.
3. Your app will be used by accounts outside your Google Workspace organization.

In this guide, `gmail.send` and `calendar.events` are Restricted scopes. `gmail.readonly`, `youtube.readonly`, `youtube.force-ssl`, and `calendar.readonly` are Sensitive scopes. All six scopes require verification before you can publish to production.

> **CALLOUT — YouTube Scopes: No Approval Required**
> The YouTube-specific note in your setup specifies "No approval required." This means the YouTube scopes do not require a separate YouTube-specific API approval process (unlike some YouTube features that require channel-level quota increases). However, these scopes are still **Sensitive** and will trigger the OAuth verification requirement when your app is published to Production. The "no approval required" note means you do not need to submit a special YouTube quota increase request separately.

### Step 20 — Understanding the "Unverified App" Warning

While your app is in Testing status, users who go through the OAuth flow will see a screen that says:

> **"Google hasn't verified this app"**
>
> The app is requesting access to sensitive info in your Google Account. Until the developer (your-email@domain.com) verifies this app with Google, you shouldn't use it.

This screen has two options: **Back to safety** and **Advanced > Go to [app name] (unsafe)**.

- Test users you added in Step 9 will see this screen but can proceed by clicking **Advanced**, then **Go to [app name] (unsafe)**.
- Users who are NOT in your test users list will see this screen and will not be able to proceed at all — they will be blocked entirely until the app is published to Production and verified.

### Step 21 — Prepare for Verification

Before submitting for verification, complete the following:

1. **Create required policy pages** on thedealstage.com:
   - Privacy Policy (`https://thedealstage.com/privacy`) — must clearly describe what data you access and how you use it for each Google service
   - Terms of Service (`https://thedealstage.com/terms`)

2. **Create a YouTube video or written explanation** demonstrating the OAuth flow and how your app uses each requested scope. Google reviewers watch this to understand legitimate use.

3. **Ensure your app is functional** — reviewers will attempt to go through the OAuth flow. The redirect URIs must work, and the app must visibly demonstrate use of the requested permissions.

4. **Write justification text** for each scope. You will be asked to explain why each scope is necessary. Be specific:
   - `gmail.send` — "Used to send partnership proposal emails on behalf of the user through the user's own Gmail account"
   - `calendar.events` — "Used to create and manage calendar events for scheduled partnership meetings"

### Step 22 — Submit for Verification

1. Navigate to: `https://console.cloud.google.com/apis/credentials/consent`
2. Confirm your project is selected.
3. Click **Publish App** to change from Testing to Production status.
4. A dialog will warn you about verification requirements. Read it carefully.
5. If your app uses Restricted scopes, you will be prompted to submit for verification rather than publishing immediately. Click **Confirm**.
6. Follow the verification submission form, providing:
   - Justification for each scope
   - Links to your privacy policy and terms of service
   - Demonstration video or written explanation of the OAuth flow
   - Contact information for the developer

> **CALLOUT — Verification Timeline**
> Google's OAuth verification process typically takes 4–6 weeks for apps with Restricted scopes. Apps using only Sensitive scopes (no Restricted scopes) may be reviewed faster. You will receive email notifications at the developer contact address you provided. Plan accordingly — do not wait until launch week to submit for verification.

---

## Part 7 — Testing Your Integration

### Step 23 — Test the OAuth Flow Before Verification

With your app in Testing status and test users added:

1. Trigger the OAuth authorization URL for each service. The authorization URL format is:

   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID
     &redirect_uri=https://thedealstage.com/callback/youtube
     &response_type=code
     &scope=https://www.googleapis.com/auth/youtube.readonly%20https://www.googleapis.com/auth/youtube.force-ssl
     &access_type=offline
     &prompt=consent
   ```

   Replace `redirect_uri` and `scope` values for Gmail and Calendar tests.

2. Sign in as a test user account (one you added in Step 9).
3. When the "unverified app" warning appears, click **Advanced**, then **Go to [app name] (unsafe)**.
4. Grant the requested permissions.
5. Confirm your callback URL receives the authorization code parameter.

> **CALLOUT — `access_type=offline` and Refresh Tokens**
> Include `access_type=offline` in your authorization URL to receive a refresh token along with the access token. Refresh tokens allow your app to obtain new access tokens without requiring the user to re-authorize. If you omit this parameter, your app will stop working when the access token expires (typically after 1 hour). Also include `prompt=consent` the first time to ensure Google issues a refresh token — without it, Google may not return a refresh token on subsequent authorizations.

### Step 24 — Verify API Quota and Rate Limits

1. Navigate to: `https://console.cloud.google.com/apis/dashboard`
2. Click on each enabled API to view its quota usage.
3. YouTube Data API v3 quota is displayed in **units**, not requests. Different API calls cost different unit amounts (a search costs 100 units, a video list costs 1 unit, etc.).
4. Set up quota alerts: click **Quotas & System Limits**, then click the bell icon next to the quota you want to monitor.

---

## Part 8 — Common Pitfalls and How to Avoid Them

### Pitfall 1 — redirect_uri_mismatch Error

**Symptom:** After a user authorizes your app, Google redirects to an error page saying `redirect_uri_mismatch`.

**Cause:** The redirect URI your application sends in the authorization request does not exactly match one of the URIs registered in Google Cloud Console. This is case-sensitive and includes trailing slashes.

**Fix:**

1. Navigate to `https://console.cloud.google.com/apis/credentials`.
2. Click the edit (pencil) icon next to your OAuth 2.0 Client ID.
3. Under **Authorized redirect URIs**, verify the URI exactly matches what your code sends. No trailing slash differences, no `http` vs `https` differences.

### Pitfall 2 — "Access Blocked: This App's Request Is Invalid"

**Symptom:** Users see an error screen saying access is blocked.

**Cause:** Usually means the requesting domain or redirect URI is not registered, or the OAuth consent screen is not properly configured.

**Fix:** Verify that the JavaScript origin for the domain initiating the request is listed under **Authorized JavaScript origins** in your credential configuration.

### Pitfall 3 — No Refresh Token Returned

**Symptom:** Your app works initially but stops working after approximately one hour. Users must re-authorize repeatedly.

**Cause:** The authorization request did not include `access_type=offline` and/or `prompt=consent`.

**Fix:** Update your authorization URL to include both parameters. Existing tokens will not be retroactively updated — users will need to re-authorize once after you make this change.

### Pitfall 4 — Test Users Cannot Proceed Past the Warning Screen

**Symptom:** A developer or tester reports they cannot get past the "Google hasn't verified this app" screen.

**Cause:** Their Google account was not added to the test users list.

**Fix:** Navigate to `https://console.cloud.google.com/apis/credentials/consent`, click **Edit App**, go to the **Test users** step, and add their Google account email.

### Pitfall 5 — Scopes Not Appearing in Consent Screen During Testing

**Symptom:** The OAuth consent screen does not show all expected permission requests.

**Cause:** Scopes were not added to the consent screen configuration, even if they are valid API scopes.

**Fix:** Navigate to `https://console.cloud.google.com/apis/credentials/consent`, click **Edit App**, go to the **Scopes** step, and click **Add or Remove Scopes** to verify all required scopes are listed.

### Pitfall 6 — YouTube Quota Exhaustion

**Symptom:** YouTube API calls return a 403 error with `quotaExceeded` after working earlier in the day.

**Cause:** The 10,000 unit/day quota has been consumed. Quota resets at midnight Pacific Time.

**Fix:** Implement caching for YouTube API responses. Use list operations (1 unit) instead of search operations (100 units) wherever possible. Consider requesting a quota increase through the Google Cloud Console if your production usage requires it: `https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas`

### Pitfall 7 — Client Secret Committed to Version Control

**Symptom:** A team member accidentally commits the `.env` file or the downloaded JSON credentials file to Git.

**Immediate fix:**

1. Navigate to `https://console.cloud.google.com/apis/credentials`.
2. Click the edit (pencil) icon next to your OAuth client.
3. Click **Reset Secret**. Confirm.
4. Update your environment variables with the new secret.
5. Remove the committed file from Git history using `git filter-branch` or the BFG Repo Cleaner.

**Prevention:** Add `.env` and `client_secret_*.json` to your `.gitignore` file before writing any credentials to disk.

### Pitfall 8 — OAuth Consent Screen Shows Wrong App Name or Branding

**Symptom:** Users see an unfamiliar or incorrect app name during authorization.

**Cause:** The App name field in the OAuth consent screen configuration was left as the project name rather than the user-facing product name.

**Fix:** Navigate to `https://console.cloud.google.com/apis/credentials/consent`, click **Edit App**, and update the **App name** field to the name users will recognize.

---

## Quick Reference

### Direct Links for This Project

| Task                   | URL                                                                       |
| ---------------------- | ------------------------------------------------------------------------- |
| Cloud Console home     | `https://console.cloud.google.com/`                                       |
| API Library            | `https://console.cloud.google.com/apis/library`                           |
| Enabled APIs dashboard | `https://console.cloud.google.com/apis/dashboard`                         |
| OAuth consent screen   | `https://console.cloud.google.com/apis/credentials/consent`               |
| Credentials            | `https://console.cloud.google.com/apis/credentials`                       |
| YouTube API quotas     | `https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas` |

### Registered Callback URLs

| Service         | Callback URL                                |
| --------------- | ------------------------------------------- |
| YouTube         | `https://thedealstage.com/callback/youtube` |
| Gmail           | `https://thedealstage.com/callback/gmail`   |
| Google Calendar | `https://thedealstage.com/callback/gcal`    |

### Scope Reference

| Scope               | Service  | Sensitivity | What It Allows                                  |
| ------------------- | -------- | ----------- | ----------------------------------------------- |
| `youtube.readonly`  | YouTube  | Sensitive   | Read YouTube account data, channel info, videos |
| `youtube.force-ssl` | YouTube  | Sensitive   | Perform YouTube actions over HTTPS              |
| `gmail.readonly`    | Gmail    | Sensitive   | Read email messages and settings                |
| `gmail.send`        | Gmail    | Restricted  | Send email on behalf of the user                |
| `calendar.readonly` | Calendar | Sensitive   | Read calendar events and settings               |
| `calendar.events`   | Calendar | Restricted  | Create, edit, and delete calendar events        |

### Official Documentation

- YouTube Data API v3 Getting Started: `https://developers.google.com/youtube/v3/getting-started`
- Gmail API Guides: `https://developers.google.com/gmail/api/guides`
- Google Calendar API Overview: `https://developers.google.com/calendar/api/guides/overview`
- OAuth 2.0 for Web Server Applications: `https://developers.google.com/identity/protocols/oauth2/web-server`
- Google OAuth Verification FAQ: `https://support.google.com/cloud/answer/9110914`
