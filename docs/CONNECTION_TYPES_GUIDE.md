# Connection Types & User Journey Guide

## How Each Connection Type Works

### 🟢 OAuth (Best Experience)

**What it means:** User clicks "Connect", gets redirected to the platform's REAL login page, authorizes DealStage, gets redirected back automatically.

**User Journey:**

1. User clicks "Connect Instagram"
2. Popup opens with Instagram's real login page
3. User enters their Instagram credentials (on Instagram's site, NOT ours)
4. Instagram asks "Allow DealStage to access your profile?"
5. User clicks "Allow"
6. Popup closes, account shows as "Connected ✓" with real data pulled

**Data you get:** Full profile, follower count, engagement rate, audience demographics, posting history, real-time updates

**Trust level:** HIGHEST — we can prove the user owns this account

---

### 🟡 API Key (Medium Experience)

**What it means:** User goes to the platform's settings, generates an API key, and pastes it into DealStage.

**User Journey:**

1. User clicks "Connect [Platform]"
2. Modal shows step-by-step instructions: "Go to [platform] Settings → Developer → Create API Key"
3. User opens the platform in a new tab, navigates to settings, generates a key
4. User copies the key and pastes it into DealStage
5. DealStage validates the key and pulls data
6. Account shows as "Connected ✓"

**Data you get:** Varies by platform — usually full profile data, analytics, posting history

**Trust level:** HIGH — API key proves account ownership, but more friction for user

---

### 🔵 REST API / Username-Based (Basic Experience)

**What it means:** User enters their username or profile URL. DealStage's server calls the platform's public API to pull data. No login from user.

**User Journey:**

1. User clicks "Connect [Platform]"
2. Modal asks for their username or profile URL
3. User types their handle (e.g., @tastystacyxoxo)
4. DealStage server calls the platform API to pull PUBLIC profile data
5. Account shows as "Connected" with a "Pending Verification" badge
6. Admin can manually verify or data is cross-checked

**Data you get:** Public data only — follower count, recent posts, bio. NO private analytics or audience demographics.

**Trust level:** LOW — anyone could type any username. Needs additional verification.

---

### 🔴 No API (Manual Verification)

**What it means:** Platform has no developer access. User must prove ownership manually.

**User Journey:**

1. User clicks "Connect [Platform]"
2. Modal asks for username/profile URL
3. User is asked to either:
   - Add a specific code to their bio temporarily (proves ownership)
   - Upload a screenshot of their profile while logged in
   - Share their profile stats via a screenshot
4. Admin reviews within 24-48 hours
5. Account shows "Pending Manual Review" → then "Verified ✓"

**Data you get:** Whatever the user self-reports. Verified by admin through screenshots/bio check.

**Trust level:** MEDIUM — verified by admin but data is self-reported

---

## ALL 88 SOCIAL PLATFORMS — Connection Type Classification

### CONTENT & VIDEO

| #   | Platform              | Connection Type           | User Journey                                                        | Data Access                                                 | Approval Time         | Cost                           |
| --- | --------------------- | ------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------- | ------------------------------ |
| 1   | **Instagram**         | 🟢 OAuth (Meta)           | Login popup → authorize → auto-pull followers, engagement, audience | Full: profile, followers, engagement, audience demos, media | 2-4 weeks Meta review | Free                           |
| 2   | **Instagram Reels**   | 🟢 OAuth (Meta)           | Same as Instagram — single auth covers both                         | Full: reels views, shares, reach                            | Same as Instagram     | Free                           |
| 3   | **TikTok**            | 🟡 API Key / OAuth hybrid | TikTok dev approval needed → then OAuth login                       | Full: followers, likes, video views, audience               | 1-2 weeks             | Free                           |
| 4   | **TikTok Shop**       | 🟡 API Key                | Seller API key from TikTok Shop dashboard                           | Sales data, product listings, revenue                       | 2-3 weeks             | Free                           |
| 5   | **YouTube**           | 🟢 OAuth (Google)         | Google login popup → authorize → auto-pull channel data             | Full: subscribers, views, watch time, demographics, revenue | Instant               | Free                           |
| 6   | **Facebook**          | 🟢 OAuth (Meta)           | Facebook login popup → authorize → pull page data                   | Full: page likes, reach, engagement, audience               | 2-4 weeks Meta review | Free                           |
| 7   | **Snapchat**          | 🟢 OAuth (Snap Kit)       | Snapchat login popup → authorize                                    | Profile, Bitmoji, display name. LIMITED analytics           | 1-2 weeks             | Free                           |
| 8   | **Threads**           | 🟢 OAuth (Meta)           | Same auth as Instagram — Meta unified login                         | Full: followers, posts, engagement                          | Same as Instagram     | Free                           |
| 9   | **Reddit**            | 🟢 OAuth                  | Reddit login popup → authorize                                      | Karma, post history, subreddit activity                     | Instant               | Free                           |
| 10  | **Bluesky**           | 🟢 OAuth (AT Protocol)    | Bluesky login → authorize                                           | Followers, posts, engagement                                | Instant               | Free                           |
| 11  | **Clubhouse**         | 🔴 No API                 | Username entry → manual verification                                | Self-reported followers                                     | N/A                   | N/A                            |
| 12  | **Telegram**          | 🔵 REST API (Bot)         | User adds DealStage bot to their channel → bot reads stats          | Channel subscribers, message views                          | Instant               | Free                           |
| 13  | **WhatsApp Channels** | 🟡 API Key (Business)     | Business API setup → enter API credentials                          | Channel followers, message reads                            | 1-2 weeks             | $$ (Meta Business API pricing) |
| 14  | **Rumble**            | 🔴 No API                 | Username entry → manual verification                                | Self-reported: subscribers, views                           | N/A                   | N/A                            |
| 15  | **Triller**           | 🔴 No API                 | Username entry → manual verification                                | Self-reported                                               | N/A                   | N/A                            |
| 16  | **Dailymotion**       | 🟢 OAuth                  | Dailymotion login → authorize                                       | Subscribers, views, engagement                              | Instant               | Free                           |
| 17  | **Buy Me a Coffee**   | 🔵 REST API               | Enter API key from BMAC dashboard                                   | Supporters count, revenue data                              | Instant               | Free                           |
| 18  | **Ko-fi**             | 🔵 REST API               | Enter API key from Ko-fi settings                                   | Supporters, donation data                                   | Instant               | Free                           |
| 19  | **Fanfix / Passes**   | 🔴 No API                 | Username → manual verification                                      | Self-reported                                               | N/A                   | N/A                            |
| 20  | **OnlyFans**          | 🔴 No API                 | Username → manual verification (screenshot proof)                   | Self-reported subscriber count                              | N/A                   | N/A                            |
| 21  | **Social Blade**      | 🔵 REST API               | Enter Social Blade API key (paid)                                   | Cross-platform analytics for any public profile             | Instant               | $3.99-9.99/mo                  |
| 22  | **HypeAuditor**       | 🔵 REST API               | Enterprise API key (sales contact)                                  | Fraud detection, audience quality, demographics             | Sales process         | $$$$                           |

### PHOTO & VISUAL

| #   | Platform             | Connection Type  | User Journey                              | Data Access                         |
| --- | -------------------- | ---------------- | ----------------------------------------- | ----------------------------------- |
| 23  | **Instagram** (main) | 🟢 OAuth (Meta)  | Login popup → authorize                   | Full profile + media                |
| 24  | **Pinterest**        | 🟢 OAuth         | Pinterest login → authorize               | Pins, boards, followers, engagement |
| 25  | **Behance**          | 🟢 OAuth (Adobe) | Adobe login → authorize                   | Projects, appreciations, followers  |
| 26  | **DeviantArt**       | 🟢 OAuth         | DeviantArt login → authorize              | Deviations, watchers, favorites     |
| 27  | **VSCO**             | 🔴 No API        | Username → manual verification            | Self-reported                       |
| 28  | **500px**            | 🔵 REST API      | Username entry → server pulls public data | Public photos, followers, views     |
| 29  | **ArtStation**       | 🔴 No API        | Username → manual verification            | Self-reported                       |

### MUSIC & AUDIO

| #   | Platform         | Connection Type       | User Journey                               | Data Access                                       |
| --- | ---------------- | --------------------- | ------------------------------------------ | ------------------------------------------------- |
| 30  | **Spotify**      | 🟢 OAuth              | Spotify login → authorize                  | Monthly listeners, followers, top tracks, streams |
| 31  | **SoundCloud**   | 🟢 OAuth              | SoundCloud login → authorize               | Followers, plays, reposts, comments               |
| 32  | **Apple Music**  | 🟡 API Key (MusicKit) | Developer token → server pulls artist data | Public: songs, albums, chart positions            |
| 33  | **Audiomack**    | 🔵 REST API           | Username → server pulls public data        | Plays, followers, trending status                 |
| 34  | **Bandcamp**     | 🔴 No API             | Username/URL → manual verification         | Self-reported sales, followers                    |
| 35  | **Mixcloud**     | 🟢 OAuth              | Mixcloud login → authorize                 | Followers, listens, shows                         |
| 36  | **Reverbnation** | 🔴 No API             | Username → manual verification             | Self-reported                                     |

### GAMING & ESPORTS

| #   | Platform              | Connection Type   | User Journey                              | Data Access                                    |
| --- | --------------------- | ----------------- | ----------------------------------------- | ---------------------------------------------- |
| 37  | **Twitch**            | 🟢 OAuth          | Twitch login → authorize                  | Followers, subscribers, stream stats, VOD data |
| 38  | **Twitch Clips**      | 🟢 OAuth          | Same auth as Twitch                       | Clip views, shares                             |
| 39  | **YouTube Gaming**    | 🟢 OAuth (Google) | Same auth as YouTube                      | Gaming stream stats, subscribers               |
| 40  | **Discord**           | 🟢 OAuth          | Discord login → authorize                 | Server member count, roles, activity           |
| 41  | **Steam**             | 🔵 REST API       | Enter Steam ID or vanity URL              | Public: games owned, playtime, achievements    |
| 42  | **Kick**              | 🔴 No API         | Username → manual verification            | Self-reported followers, viewers               |
| 43  | **Roblox**            | 🔵 REST API       | Enter Roblox username → server pulls data | Friends, place visits, badges                  |
| 44  | **Fortnite Creative** | 🟡 API Key (Epic) | Epic Games dev account → API access       | Map plays, creator code usage                  |
| 45  | **Battlefy**          | 🔴 No API         | Username → manual verification            | Tournament history                             |

### ACTORS & PERFORMERS

| #   | Platform             | Connection Type           | User Journey                                  | Data Access                             |
| --- | -------------------- | ------------------------- | --------------------------------------------- | --------------------------------------- |
| 46  | **Cameo**            | 🔴 No API                 | Profile URL → manual verification             | Self-reported: price, reviews, bookings |
| 47  | **Casting Networks** | 🔴 No API                 | Profile URL → manual verification             | Self-reported credits                   |
| 48  | **IMDb**             | 🔵 REST API (paid)        | Enter IMDb name ID (nm1234567) → server pulls | Credits, STARmeter ranking, filmography |
| 49  | **Letterboxd**       | 🔴 No API (beta waitlist) | Username → manual verification                | Self-reported reviews, lists            |

### ATHLETES & SPORTS

| #   | Platform           | Connection Type | User Journey                                | Data Access                                |
| --- | ------------------ | --------------- | ------------------------------------------- | ------------------------------------------ |
| 50  | **Strava**         | 🟢 OAuth        | Strava login → authorize                    | Activities, followers, achievements, stats |
| 51  | **ESPN**           | 🔴 No API       | Profile/athlete page → manual verification  | Self-reported stats                        |
| 52  | **Garmin Connect** | 🟡 API Key      | Garmin developer portal → health API access | Fitness data, activities                   |
| 53  | **Hudl**           | 🔴 No API       | Profile → manual verification               | Self-reported game tape                    |
| 54  | **MaxPreps**       | 🔴 No API       | Profile → manual verification               | Self-reported high school stats            |
| 55  | **Transfermarkt**  | 🔴 No API       | Player page URL → manual verification       | Market value, transfer history             |

### BEAUTY & FASHION

| #   | Platform              | Connection Type | User Journey                         | Data Access                                |
| --- | --------------------- | --------------- | ------------------------------------ | ------------------------------------------ |
| 56  | **Instagram Shop**    | 🟢 OAuth (Meta) | Same as Instagram auth               | Shop products, sales data                  |
| 57  | **Shopify Collabs**   | 🟢 OAuth        | Shopify login → authorize            | Store data, products, sales                |
| 58  | **LTK**               | 🔴 No API       | Profile URL → manual verification    | Self-reported: followers, clicks, earnings |
| 59  | **Poshmark**          | 🔴 No API       | Username → manual verification       | Self-reported: closet size, followers      |
| 60  | **Depop**             | 🔴 No API       | Username → manual verification       | Self-reported: followers, sales            |
| 61  | **Lemon8**            | 🔴 No API       | Username → manual verification       | Self-reported                              |
| 62  | **Amazon Influencer** | 🔴 No API       | Storefront URL → manual verification | Self-reported                              |
| 63  | **ShopMy**            | 🔴 No API       | Profile → manual verification        | Self-reported                              |

### FITNESS & WELLNESS

| #   | Platform         | Connection Type | User Journey                   | Data Access                    |
| --- | ---------------- | --------------- | ------------------------------ | ------------------------------ |
| 64  | **Strava**       | 🟢 OAuth        | Strava login → authorize       | Full activity data             |
| 65  | **Peloton**      | 🔴 No API       | Username → manual verification | Self-reported rides, followers |
| 66  | **MyFitnessPal** | 🔴 No API       | Username → manual verification | Self-reported                  |

### WRITERS & PODCASTS

| #   | Platform             | Connection Type          | User Journey                         | Data Access                                |
| --- | -------------------- | ------------------------ | ------------------------------------ | ------------------------------------------ |
| 67  | **Twitter / X**      | 🟢 OAuth (paid tier)     | Twitter login → authorize            | Followers, tweets, engagement, impressions |
| 68  | **LinkedIn**         | 🟢 OAuth                 | LinkedIn login → authorize           | Connections, posts, impressions (limited)  |
| 69  | **Medium**           | 🟢 OAuth                 | Medium login → authorize             | Followers, stories, claps, reads           |
| 70  | **Substack**         | 🔴 No API                | Newsletter URL → manual verification | Self-reported: subscribers, open rate      |
| 71  | **Patreon**          | 🟢 OAuth                 | Patreon login → authorize            | Patrons, tiers, earnings (with permission) |
| 72  | **Beehiiv**          | 🟢 OAuth                 | Beehiiv login → authorize            | Subscribers, open rate, growth             |
| 73  | **ConvertKit**       | 🟢 OAuth                 | ConvertKit login → authorize         | Subscribers, sequences, automations        |
| 74  | **Apple Podcasts**   | 🟡 API Key               | Podcasts Connect → API token         | Downloads, listeners, charts               |
| 75  | **Spotify Podcasts** | 🟢 OAuth (Spotify)       | Same as Spotify auth                 | Downloads, listeners, demographics         |
| 76  | **YouTube Podcasts** | 🟢 OAuth (Google)        | Same as YouTube auth                 | Views, subscribers, watch time             |
| 77  | **Amazon Music**     | 🔴 No API                | Artist page → manual verification    | Self-reported streams                      |
| 78  | **iHeartRadio**      | 🔴 No API                | Profile → manual verification        | Self-reported                              |
| 79  | **Goodreads**        | 🔴 No API (discontinued) | Profile URL → manual verification    | Self-reported: followers, reviews          |

### DESIGN & FREELANCE

| #   | Platform            | Connection Type | User Journey                        | Data Access                   |
| --- | ------------------- | --------------- | ----------------------------------- | ----------------------------- |
| 80  | **Dribbble**        | 🟢 OAuth        | Dribbble login → authorize          | Shots, followers, likes       |
| 81  | **Etsy**            | 🟢 OAuth        | Etsy login → authorize              | Shop data, sales, reviews     |
| 82  | **Adobe Portfolio** | 🔴 No API       | Portfolio URL → manual verification | Self-reported                 |
| 83  | **Fiverr**          | 🔴 No API       | Profile URL → manual verification   | Self-reported gigs, reviews   |
| 84  | **Upwork**          | 🔴 No API       | Profile URL → manual verification   | Self-reported: jobs, earnings |

### EDUCATORS

| #   | Platform            | Connection Type | User Journey                           | Data Access                      |
| --- | ------------------- | --------------- | -------------------------------------- | -------------------------------- |
| 85  | **Teachable**       | 🔵 REST API     | Enter API key from Teachable dashboard | Courses, students, revenue       |
| 86  | **Kajabi**          | 🔴 No API       | Profile → manual verification          | Self-reported                    |
| 87  | **Gumroad**         | 🔵 REST API     | Enter API key from Gumroad settings    | Products, sales, customers       |
| 88  | **Mighty Networks** | 🔴 No API       | Community URL → manual verification    | Self-reported                    |
| —   | **Circle**          | 🔴 No API       | Community URL → manual verification    | Self-reported                    |
| —   | **Quora**           | 🔴 No API       | Profile URL → manual verification      | Self-reported followers, answers |

---

## BUSINESS INTEGRATIONS (24 platforms)

### CRM

| #   | Platform       | Connection Type | User Journey                               | Data Access                         |
| --- | -------------- | --------------- | ------------------------------------------ | ----------------------------------- |
| 89  | **Salesforce** | 🟢 OAuth        | Salesforce login → authorize DealStage app | Full CRM: contacts, deals, pipeline |
| 90  | **HubSpot**    | 🟢 OAuth        | HubSpot login → authorize                  | Contacts, deals, companies, tickets |
| 91  | **Pipedrive**  | 🟢 OAuth        | Pipedrive login → authorize                | Deals, contacts, organizations      |
| 92  | **Zoho CRM**   | 🟢 OAuth        | Zoho login → authorize                     | Leads, deals, contacts              |
| 93  | **Affinity**   | 🟡 API Key      | Copy API key from Affinity settings        | Relationships, interactions         |
| 94  | **Copper**     | 🟢 OAuth        | Google Workspace login → authorize         | Contacts, opportunities             |

### Marketing Automation

| #   | Platform           | Connection Type       | User Journey                       | Data Access                   |
| --- | ------------------ | --------------------- | ---------------------------------- | ----------------------------- |
| 95  | **Mailchimp**      | 🟢 OAuth              | Mailchimp login → authorize        | Lists, campaigns, subscribers |
| 96  | **ActiveCampaign** | 🟡 API Key            | Copy from ActiveCampaign settings  | Contacts, automations, deals  |
| 97  | **Marketo**        | 🔵 REST API           | Admin enters REST API credentials  | Leads, campaigns, analytics   |
| 98  | **Pardot**         | 🟢 OAuth (Salesforce) | Salesforce login → authorize       | Prospects, campaigns          |
| 99  | **Klaviyo**        | 🟡 API Key            | Copy from Klaviyo account settings | Profiles, flows, campaigns    |

### Communication

| #   | Platform            | Connection Type     | User Journey                               | Data Access                        |
| --- | ------------------- | ------------------- | ------------------------------------------ | ---------------------------------- |
| 100 | **Slack**           | 🟢 OAuth            | Slack login → select workspace → authorize | Channels, messages, notifications  |
| 101 | **Microsoft Teams** | 🟢 OAuth (Azure AD) | Microsoft login → authorize                | Channels, messages, meetings       |
| 102 | **Zoom**            | 🟢 OAuth            | Zoom login → authorize                     | Meetings, recordings, participants |
| 103 | **Google Meet**     | 🟢 OAuth (Google)   | Google login → authorize                   | Calendar events, meeting links     |

### Calendar & Email

| #   | Platform             | Connection Type   | User Journey                | Data Access                |
| --- | -------------------- | ----------------- | --------------------------- | -------------------------- |
| 104 | **Gmail**            | 🟢 OAuth (Google) | Google login → authorize    | Send/read emails, contacts |
| 105 | **Outlook**          | 🟢 OAuth (Azure)  | Microsoft login → authorize | Send/read emails, contacts |
| 106 | **Google Calendar**  | 🟢 OAuth (Google) | Same as Gmail auth          | Events, availability       |
| 107 | **Outlook Calendar** | 🟢 OAuth (Azure)  | Same as Outlook auth        | Events, availability       |
| 108 | **Calendly**         | 🟢 OAuth          | Calendly login → authorize  | Events, scheduling links   |

### Automation

| #   | Platform     | Connection Type       | User Journey                     | Data Access         |
| --- | ------------ | --------------------- | -------------------------------- | ------------------- |
| 109 | **Zapier**   | 🔵 REST API (webhook) | Admin configures Zapier triggers | Custom automations  |
| 110 | **Make**     | 🔵 REST API (webhook) | Admin configures Make scenarios  | Custom automations  |
| 111 | **Webhooks** | 🔵 REST API           | Admin configures webhook URLs    | Event notifications |

### Payment

| #   | Platform   | Connection Type    | User Journey    | Data Access                       |
| --- | ---------- | ------------------ | --------------- | --------------------------------- |
| 112 | **Stripe** | 🟢 OAuth (Connect) | Already live ✅ | Payments, subscriptions, invoices |

---

## ALTERNATIVES FOR PLATFORMS WITH NO API

### Option A: Phyllo (covers ~30 major platforms)

**Platforms covered:** Instagram, TikTok, YouTube, Twitter, Twitch, Spotify, Facebook, LinkedIn, Pinterest, Snapchat, Reddit, Discord, Patreon, Substack, and more
**Cost:** $0.10-0.50 per connection
**User journey:** Same as OAuth — Phyllo handles the login popup

### Option B: Apify (web scraping for any platform)

**Platforms:** Any public profile on any platform
**Cost:** $49-499/mo depending on volume
**How it works:** Enter username → Apify actor scrapes public profile data
**User journey:** Username entry → data pulled in 10-30 seconds

### Option C: RapidAPI Social APIs

**Platforms:** Instagram, TikTok, Twitter, YouTube, LinkedIn scrapers
**Cost:** $0-50/mo per API
**How it works:** Enter username → API returns public data
**User journey:** Username entry → instant data

### Option D: Bio Code Verification (free, for ANY platform)

**Platforms:** ALL platforms that have a bio field
**How it works:**

1. User clicks "Connect [Platform]"
2. DealStage generates a unique code (e.g., "DS-7X9K2")
3. User adds this code to their platform bio temporarily
4. DealStage checks the bio via public profile scraping
5. Code found → verified! User can remove the code
   **Cost:** Free
   **User journey:** 2-3 minutes, proves ownership without any API

### Option E: Screenshot + Admin Review

**Platforms:** ALL platforms
**How it works:** User uploads screenshot of their profile stats while logged in
**Cost:** Free but requires admin time
**User journey:** Upload screenshot → admin reviews within 24-48 hours

---

## SUMMARY BY CONNECTION TYPE

| Type                   | Count   | %        | User Experience                                      |
| ---------------------- | ------- | -------- | ---------------------------------------------------- |
| 🟢 OAuth               | 46      | 41%      | Best — 1-click login, real data, verified ownership  |
| 🟡 API Key             | 12      | 11%      | Good — requires user to find/paste key, but verified |
| 🔵 REST API (username) | 15      | 13%      | OK — username entry, public data only, unverified    |
| 🔴 No API              | 39      | 35%      | Manual — username + verification method needed       |
| **TOTAL**              | **112** | **100%** |                                                      |

## RECOMMENDED PRIORITY ORDER

**Phase 1 (Week 1-2): Instant OAuth — 18 platforms**
YouTube, Reddit, Bluesky, Discord, Twitch, Dribbble, Etsy, Strava, Medium, Patreon, Beehiiv, ConvertKit, Dailymotion, Mixcloud, SoundCloud, DeviantArt, Pinterest, Slack

**Phase 2 (Week 2-4): Quick approval OAuth — 10 platforms**
TikTok, Snapchat, LinkedIn, Spotify, Shopify, Twitter/X, HubSpot, Salesforce, Zoom, Microsoft Teams

**Phase 3 (Week 4-8): Meta approval — 5 platforms**
Instagram, Facebook, Threads, Instagram Reels, Instagram Shop

**Phase 4 (Ongoing): Phyllo or alternatives for remaining 39 no-API platforms**
