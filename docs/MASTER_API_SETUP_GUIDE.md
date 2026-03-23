# DealStage — Master API Setup Guide (All 40 Platforms)

**Domain:** thedealstage.com
**Last Updated:** 2026-03-21
**Total Platforms:** 40 integrations across 6 groups
**Total Documentation:** 5,400+ lines of step-by-step instructions

---

## How to Use This Guide

This master document is your **table of contents and priority planner**. Each platform group has its own detailed guide with exact step-by-step instructions (button names, menu paths, field values, gotchas). Start with the platforms that have the longest approval times, then work through the instant-access ones.

---

## Priority Order (Do These First — Longest Approval Times)

| Priority | Platform                              | Approval Time        | Why First                                    |
| -------- | ------------------------------------- | -------------------- | -------------------------------------------- |
| 1        | **TikTok**                            | 2-3 weeks            | Longest wait. Submit application immediately |
| 2        | **Snapchat** (Story Kit)              | 1-2 weeks            | Review required for Story Kit                |
| 3        | **LinkedIn**                          | 3-7 days             | Advanced access review                       |
| 4        | **Pinterest**                         | 3-5 days             | Production access review                     |
| 5        | **Twitter / X**                       | 1-3 days             | Developer account review                     |
| 6        | **Meta** (Instagram/Facebook/Threads) | 1-5 days             | App Review for live permissions              |
| 7        | **Shopify**                           | Instant (custom app) | No wait                                      |
| 8        | Everything else                       | Instant              | No approval needed                           |

> **Action:** Submit TikTok, Snapchat, LinkedIn, and Pinterest applications on Day 1. While waiting, set up all the instant-access platforms.

---

## Platform Groups & Guides

### Group 1: Meta Platforms (1 app, 3 platforms)

**Guide:** [`docs/meta-api-setup-guide.md`](meta-api-setup-guide.md)
**Platforms:** Instagram, Facebook, Threads
**Key:** One Meta Developer App serves all three. Create the app once, then add each product.

| Platform  | Auth Type    | Callback URL          | Key Scopes                                                            |
| --------- | ------------ | --------------------- | --------------------------------------------------------------------- |
| Instagram | OAuth (Meta) | `/callback/instagram` | instagram_basic, instagram_manage_insights, instagram_content_publish |
| Facebook  | OAuth (Meta) | `/callback/facebook`  | public_profile, pages_read_posts, pages_read_engagement               |
| Threads   | OAuth (Meta) | `/callback/threads`   | threads_basic, threads_read_insights                                  |

**Env vars:** `VITE_META_APP_ID`, `META_APP_SECRET`
**Rate limit:** 200 calls/hr (free)
**Gotcha:** Basic Display API deprecated Dec 2024 — use Instagram API with Instagram Login

---

### Group 2: Google Platforms (1 project, 3 APIs)

**Guide:** [`docs/google-api-setup-guide.md`](google-api-setup-guide.md)
**Platforms:** YouTube, Gmail, Google Calendar
**Key:** One Google Cloud project with one OAuth credential serves all three.

| Platform        | Auth Type      | Callback URL        | Key Scopes                          |
| --------------- | -------------- | ------------------- | ----------------------------------- |
| YouTube         | OAuth (Google) | `/callback/youtube` | youtube.readonly, youtube.force-ssl |
| Gmail           | OAuth (Google) | `/callback/gmail`   | gmail.readonly, gmail.send          |
| Google Calendar | OAuth (Google) | `/callback/gcal`    | calendar.readonly, calendar.events  |

**Env vars:** `VITE_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
**Rate limit:** YouTube 10,000 units/day; Gmail/Calendar standard
**Gotcha:** "Unverified app" warning screen blocks non-test users until Google verification (~1-3 weeks)

---

### Group 3: Social Media Platforms (7 separate apps)

**Guide:** [`docs/social-api-setup-guide.md`](social-api-setup-guide.md)
**Platforms:** TikTok, Twitter/X, LinkedIn, Snapchat, Pinterest, Reddit, Bluesky

| Platform    | Auth Type           | Callback URL          | Key Scopes                                            | Rate Limit     |
| ----------- | ------------------- | --------------------- | ----------------------------------------------------- | -------------- |
| TikTok      | API Key + OAuth     | `/callback/tiktok`    | user.info.basic, user.info.stats, video.list          | 60-300 req/min |
| Twitter / X | OAuth 2.0 + PKCE    | `/callback/twitter`   | tweet.read, follows.read, users.read                  | 450 req/15min  |
| LinkedIn    | OAuth               | `/callback/linkedin`  | r_basicprofile, r_emailaddress, r_organization_social | 300 req/min    |
| Snapchat    | OAuth (Snap Kit)    | `/callback/snapchat`  | Login Kit, Story Kit                                  | Standard       |
| Pinterest   | OAuth               | `/callback/pinterest` | boards:read, pins:read, user:email:read               | 10 req/sec     |
| Reddit      | OAuth               | `/callback/reddit`    | identity, read, mysubreddits                          | 60 req/min     |
| Bluesky     | OAuth (AT Protocol) | `/callback/bluesky`   | atproto                                               | Standard       |

**Key gotchas:**

- TikTok: Client Secret shown once — save immediately. 365-day token expiry.
- Twitter/X: Pay-per-use credits model. Budget carefully.
- LinkedIn: Scope names changed — use OpenID Connect scopes for new apps.
- Reddit: User-Agent header is mandatory or requests fail silently.
- Bluesky: No developer portal. Client ID is your metadata URL. DPoP required.

---

### Group 4: Streaming & Creator Platforms (8 separate apps)

**Guide:** [`docs/api-setup-guide.md`](api-setup-guide.md)
**Platforms:** Spotify, Twitch, Discord, Patreon, SoundCloud, Mixcloud, Dailymotion, Strava

| Platform    | Auth Type | Callback URL            | Key Scopes                                  | Rate Limit    |
| ----------- | --------- | ----------------------- | ------------------------------------------- | ------------- |
| Spotify     | OAuth     | `/callback/spotify`     | user-read-private, user-read-email          | 30 req/sec    |
| Twitch      | OAuth     | `/callback/twitch`      | user:read:email, channel:read:subscriptions | 120 req/min   |
| Discord     | OAuth     | `/callback/discord`     | identify, email, guilds                     | 50 req/sec    |
| Patreon     | OAuth     | `/callback/patreon`     | campaigns:read, members:read, posts:read    | 60 req/min    |
| SoundCloud  | OAuth     | `/callback/soundcloud`  | me, email, tracks:edit                      | 15,000 req/hr |
| Mixcloud    | OAuth     | `/callback/mixcloud`    | user:read                                   | Standard      |
| Dailymotion | OAuth     | `/callback/dailymotion` | userinfo, manage_videos                     | Standard      |
| Strava      | OAuth     | `/callback/strava`      | activity:read, profile:read_all             | 100 req/15min |

**Key gotchas:**

- SoundCloud: May have closed new API registrations — check first before building.
- Twitch: Requires 2FA on dev account before console is accessible.
- Patreon: Test account must have active creator campaign or data returns empty.
- Strava: Requires logo image to save app. Uses domain-only (not full path) in console.

---

### Group 5: Business, CRM & Communication Platforms (15 apps)

**Guide:** [`docs/API_SETUP_GUIDE.md`](API_SETUP_GUIDE.md)
**Platforms:** Shopify, Etsy, Salesforce, HubSpot, Pipedrive, Slack, Zoom, Microsoft Teams, Outlook/O365, Calendly, Stripe, Mailchimp, Zoho CRM, Copper

| Platform   | Auth Type        | Callback URL           | Key Scopes                                        | Rate Limit    |
| ---------- | ---------------- | ---------------------- | ------------------------------------------------- | ------------- |
| Shopify    | OAuth            | `/callback/shopify`    | products:read, orders:read, customers:read        | 2 req/sec     |
| Etsy       | OAuth            | `/callback/etsy`       | listings:read, transactions:read                  | 10 req/sec    |
| Salesforce | OAuth            | `/callback/salesforce` | api, refresh_token, full                          | 15,000/24hr   |
| HubSpot    | OAuth            | `/callback/hubspot`    | crm.objects.contacts.read, crm.objects.deals.read | 100 req/10sec |
| Pipedrive  | OAuth            | `/callback/pipedrive`  | users:read, deals:read, contacts:read             | 2 req/sec     |
| Slack      | OAuth            | `/callback/slack`      | chat:write, chat:read, commands                   | 1-20 req/sec  |
| Zoom       | OAuth            | `/callback/zoom`       | meeting:read, recording:read                      | Standard      |
| MS Teams   | OAuth (Azure AD) | `/callback/teams`      | Channel.ReadBasic.All, Chat.Read                  | Standard      |
| Outlook    | OAuth (Azure)    | `/callback/outlook`    | Mail.ReadWrite, Calendars.ReadWrite               | Standard      |
| Calendly   | OAuth            | `/callback/calendly`   | scheduling_links, events                          | Standard      |
| Stripe     | OAuth (Connect)  | `/callback/stripe`     | read_write                                        | 100 req/sec   |
| Mailchimp  | OAuth            | `/callback/mailchimp`  | lists, campaigns, reports                         | 10 req/sec    |
| Zoho CRM   | OAuth            | `/callback/zoho`       | ZohoCRM.modules.ALL                               | Standard      |
| Copper     | OAuth (Google)   | `/callback/copper`     | contacts, opportunities                           | Standard      |

**Key gotchas:**

- **Etsy:** $0.05 per API call — build caching before going live
- **Zoho:** Refresh tokens are single-use and rotate on every refresh — must persist newest token
- **Salesforce:** Returns per-user `instance_url` — store per connected user, not global
- **Mailchimp:** Returns `dc` (data center) value — API base URL varies per user
- **Azure secrets** (Teams + Outlook): Expire after up to 24 months — set rotation reminders
- **Copper:** May require manual partnership contact before OAuth is available
- **Stripe:** Already live — just maintain webhook signatures and rotate secrets

---

### Group 6: Creative & Newsletter Platforms (6 apps)

**Guide:** [`docs/api-setup-creative-newsletter-platforms.md`](api-setup-creative-newsletter-platforms.md)
**Platforms:** Dribbble, Behance, DeviantArt, Beehiiv, ConvertKit/Kit, Medium

| Platform       | Auth Type          | Callback URL           | Key Scopes                          | Rate Limit  |
| -------------- | ------------------ | ---------------------- | ----------------------------------- | ----------- |
| Dribbble       | OAuth              | `/callback/dribbble`   | public, upload                      | Standard    |
| Behance        | OAuth (Adobe)      | `/callback/behance`    | Projects, appreciations             | Standard    |
| DeviantArt     | OAuth              | `/callback/deviantart` | browse, user                        | Standard    |
| Beehiiv        | OAuth              | `/callback/beehiiv`    | publications:read, subscribers:read | Standard    |
| ConvertKit/Kit | API Key (no OAuth) | N/A                    | subscribers, sequences              | 120 req/min |
| Medium         | Token (no OAuth)   | N/A                    | User data, publish                  | Standard    |

**Key gotchas:**

- **Behance:** Adobe requires regex-escaped redirect URI pattern
- **Beehiiv:** Requires Scale plan or higher — shows paywall otherwise
- **Kit:** API response uses `courses` key for sequences (legacy naming)
- **Medium:** No read access to existing posts. No third-party OAuth without contacting Medium directly
- **Dribbble:** Prospect vs Player account status blocks API registration

---

## Master Environment Variables

All callback URLs follow the pattern: `https://thedealstage.com/callback/{platform}`

```env
# ─── META (Instagram, Facebook, Threads) ───
VITE_META_APP_ID=
META_APP_SECRET=

# ─── GOOGLE (YouTube, Gmail, Calendar) ───
VITE_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── TIKTOK ───
VITE_TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# ─── TWITTER / X ───
VITE_TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# ─── LINKEDIN ───
VITE_LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# ─── SNAPCHAT ───
VITE_SNAPCHAT_CLIENT_ID=
SNAPCHAT_CLIENT_SECRET=

# ─── PINTEREST ───
VITE_PINTEREST_APP_ID=
PINTEREST_APP_SECRET=

# ─── REDDIT ───
VITE_REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# ─── BLUESKY ───
VITE_BLUESKY_CLIENT_ID=

# ─── SPOTIFY ───
VITE_SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# ─── TWITCH ───
VITE_TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# ─── DISCORD ───
VITE_DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# ─── PATREON ───
VITE_PATREON_CLIENT_ID=
PATREON_CLIENT_SECRET=

# ─── SOUNDCLOUD ───
VITE_SOUNDCLOUD_CLIENT_ID=
SOUNDCLOUD_CLIENT_SECRET=

# ─── MIXCLOUD ───
VITE_MIXCLOUD_CLIENT_ID=
MIXCLOUD_CLIENT_SECRET=

# ─── DAILYMOTION ───
VITE_DAILYMOTION_API_KEY=
DAILYMOTION_API_SECRET=

# ─── STRAVA ───
VITE_STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=

# ─── SHOPIFY ───
VITE_SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=

# ─── ETSY ───
VITE_ETSY_API_KEY=

# ─── SALESFORCE ───
VITE_SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=

# ─── HUBSPOT ───
VITE_HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=

# ─── PIPEDRIVE ───
VITE_PIPEDRIVE_CLIENT_ID=
PIPEDRIVE_CLIENT_SECRET=

# ─── SLACK ───
VITE_SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# ─── ZOOM ───
VITE_ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# ─── MICROSOFT (Teams + Outlook) ───
VITE_AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
VITE_AZURE_TENANT_ID=

# ─── CALENDLY ───
VITE_CALENDLY_CLIENT_ID=
CALENDLY_CLIENT_SECRET=

# ─── STRIPE (Already Live) ───
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# ─── MAILCHIMP ───
VITE_MAILCHIMP_CLIENT_ID=
MAILCHIMP_CLIENT_SECRET=

# ─── ZOHO ───
VITE_ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=

# ─── COPPER ───
COPPER_API_KEY=
COPPER_USER_EMAIL=

# ─── DRIBBBLE ───
VITE_DRIBBBLE_CLIENT_ID=
DRIBBBLE_CLIENT_SECRET=

# ─── BEHANCE (Adobe) ───
VITE_ADOBE_CLIENT_ID=
ADOBE_CLIENT_SECRET=

# ─── DEVIANTART ───
VITE_DEVIANTART_CLIENT_ID=
DEVIANTART_CLIENT_SECRET=

# ─── BEEHIIV ───
VITE_BEEHIIV_CLIENT_ID=
BEEHIIV_CLIENT_SECRET=

# ─── CONVERTKIT / KIT (API Key only) ───
KIT_API_KEY=
KIT_API_SECRET=

# ─── MEDIUM (Token only) ───
MEDIUM_INTEGRATION_TOKEN=
```

> **SECURITY:** Variables prefixed with `VITE_` are exposed to the browser. NEVER prefix secrets/API keys with `VITE_`. Secrets must only be used server-side (Supabase Edge Functions).

---

## Recommended Setup Order (Week-by-Week)

### Week 1: Submit + Build Instant Platforms

1. **Submit applications:** TikTok, Snapchat, LinkedIn, Pinterest, Twitter/X
2. **Build:** Meta (Instagram/Facebook/Threads) — 1 app, 3 platforms
3. **Build:** Google (YouTube/Gmail/Calendar) — 1 project, 3 APIs
4. **Build:** Spotify, Twitch, Discord (all instant)

### Week 2: Business & Creator Platforms

5. **Build:** Shopify, HubSpot, Slack, Zoom, Calendly (all instant)
6. **Build:** Patreon, Strava, Dailymotion, Mixcloud
7. **Build:** Dribbble, Behance, DeviantArt, Beehiiv
8. **Build:** Kit (API key), Medium (token)
9. **Approvals land:** LinkedIn, Pinterest, Twitter/X — finish those integrations

### Week 3: Long-Tail + Approvals

10. **Build:** Salesforce, Pipedrive, Zoho, Mailchimp, Copper
11. **Build:** Microsoft (Teams + Outlook) — 1 Azure app, 2 APIs
12. **Build:** Etsy (budget for per-call pricing), Reddit
13. **Approvals land:** TikTok, Snapchat — finish those integrations
14. **Build:** SoundCloud (if registration is open), Bluesky

### Week 4: Testing & Go-Live

15. Test all 40 integrations end-to-end with real accounts
16. Submit Meta App Review for live permissions
17. Submit Google verification for production consent screen
18. Rotate all development credentials to production credentials
19. Set up monitoring and token refresh cron jobs
20. Deploy to production

---

## Status Tracker

| #   | Platform        | Group     | Status      | App ID     | Approval             |
| --- | --------------- | --------- | ----------- | ---------- | -------------------- |
| 1   | Instagram       | Meta      | Not Started | —          | Needs review         |
| 2   | Facebook        | Meta      | Not Started | —          | Needs review         |
| 3   | Threads         | Meta      | Not Started | —          | Needs review         |
| 4   | YouTube         | Google    | Not Started | —          | Needs verification   |
| 5   | Gmail           | Google    | Not Started | —          | Needs verification   |
| 6   | Google Calendar | Google    | Not Started | —          | Needs verification   |
| 7   | TikTok          | Social    | Not Started | —          | 2-3 weeks            |
| 8   | Twitter / X     | Social    | Not Started | —          | 1-3 days             |
| 9   | LinkedIn        | Social    | Not Started | —          | 3-7 days             |
| 10  | Snapchat        | Social    | Not Started | —          | 1-2 weeks            |
| 11  | Pinterest       | Social    | Not Started | —          | 3-5 days             |
| 12  | Reddit          | Social    | Not Started | —          | Instant              |
| 13  | Bluesky         | Social    | Not Started | —          | Instant              |
| 14  | Spotify         | Streaming | Not Started | —          | Instant              |
| 15  | Twitch          | Streaming | Not Started | —          | Instant              |
| 16  | Discord         | Streaming | Not Started | —          | Instant              |
| 17  | Patreon         | Streaming | Not Started | —          | Instant              |
| 18  | SoundCloud      | Streaming | Not Started | —          | Check availability   |
| 19  | Mixcloud        | Streaming | Not Started | —          | Instant              |
| 20  | Dailymotion     | Streaming | Not Started | —          | Instant              |
| 21  | Strava          | Streaming | Not Started | —          | Instant              |
| 22  | Shopify         | Business  | Not Started | —          | Instant              |
| 23  | Etsy            | Business  | Not Started | —          | Instant ($0.05/call) |
| 24  | Salesforce      | Business  | Not Started | —          | Instant              |
| 25  | HubSpot         | Business  | Not Started | —          | Instant              |
| 26  | Pipedrive       | Business  | Not Started | —          | Instant              |
| 27  | Slack           | Business  | Not Started | —          | Instant              |
| 28  | Zoom            | Business  | Not Started | —          | Instant              |
| 29  | MS Teams        | Business  | Not Started | —          | Instant              |
| 30  | Outlook / O365  | Business  | Not Started | —          | Instant              |
| 31  | Calendly        | Business  | Not Started | —          | Instant              |
| 32  | Stripe          | Business  | **Live**    | Configured | N/A                  |
| 33  | Mailchimp       | Business  | Not Started | —          | Instant              |
| 34  | Zoho CRM        | Business  | Not Started | —          | Instant              |
| 35  | Copper          | Business  | Not Started | —          | May need contact     |
| 36  | Dribbble        | Creative  | Not Started | —          | Instant              |
| 37  | Behance         | Creative  | Not Started | —          | Instant              |
| 38  | DeviantArt      | Creative  | Not Started | —          | Instant              |
| 39  | Beehiiv         | Creative  | Not Started | —          | Instant (Scale plan) |
| 40  | ConvertKit/Kit  | Creative  | Not Started | —          | Instant              |
| 41  | Medium          | Creative  | Not Started | —          | Instant (limited)    |

---

## Quick Reference: Developer Consoles

| Platform              | Console URL                                                   |
| --------------------- | ------------------------------------------------------------- |
| Meta (IG/FB/Threads)  | https://developers.facebook.com/apps/                         |
| Google (YT/Gmail/Cal) | https://console.cloud.google.com/apis/                        |
| TikTok                | https://developers.tiktok.com/                                |
| Twitter / X           | https://developer.x.com/en/portal/dashboard                   |
| LinkedIn              | https://www.linkedin.com/developers/apps                      |
| Snapchat              | https://developers.snap.com                                   |
| Pinterest             | https://developers.pinterest.com/apps/                        |
| Reddit                | https://www.reddit.com/prefs/apps                             |
| Bluesky               | https://bsky.app/settings                                     |
| Spotify               | https://developer.spotify.com/dashboard/                      |
| Twitch                | https://dev.twitch.tv/console/apps                            |
| Discord               | https://discord.com/developers/applications                   |
| Patreon               | https://www.patreon.com/portal/registration/register-clients  |
| SoundCloud            | https://soundcloud.com/you/apps                               |
| Mixcloud              | https://www.mixcloud.com/developers/                          |
| Dailymotion           | https://www.dailymotion.com/partner                           |
| Strava                | https://www.strava.com/settings/api                           |
| Shopify               | https://partners.shopify.com/                                 |
| Etsy                  | https://www.etsy.com/developers/register                      |
| Salesforce            | https://developer.salesforce.com/                             |
| HubSpot               | https://app.hubspot.com/developer/                            |
| Pipedrive             | https://developers.pipedrive.com/                             |
| Slack                 | https://api.slack.com/apps                                    |
| Zoom                  | https://marketplace.zoom.us/develop/create                    |
| MS Teams              | https://dev.teams.microsoft.com/                              |
| Outlook / Azure       | https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps  |
| Calendly              | https://developer.calendly.com/                               |
| Stripe                | https://dashboard.stripe.com/developers                       |
| Mailchimp             | https://us1.admin.mailchimp.com/account/api/                  |
| Zoho CRM              | https://api-console.zoho.com/                                 |
| Copper                | https://developer.copper.com/                                 |
| Dribbble              | https://dribbble.com/account/applications                     |
| Behance (Adobe)       | https://developer.adobe.com/console/                          |
| DeviantArt            | https://www.deviantart.com/developers/                        |
| Beehiiv               | https://app.beehiiv.com/settings/integrations                 |
| ConvertKit/Kit        | https://app.convertkit.com/account_settings/advanced_settings |
| Medium                | https://medium.com/me/settings                                |
