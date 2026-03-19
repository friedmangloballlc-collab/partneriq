# Comprehensive Social Media & Business Platform Integration Guide

**Document Date**: March 2025
**Last Updated**: March 19, 2026
**Scope**: 112+ Social Media, Creator, Gaming, E-commerce, Music, and Business Platforms

---

## TABLE OF CONTENTS

1. [Group 1: Major Social Platforms](#group-1-major-social-platforms)
2. [Group 2: Creator Platforms](#group-2-creator-platforms)
3. [Group 3: Gaming Platforms](#group-3-gaming-platforms)
4. [Group 4: E-commerce/Fashion](#group-4-ecommerce-fashion)
5. [Group 5: Music Platforms](#group-5-music-platforms)
6. [Group 6: Platforms Without Public APIs](#group-6-platforms-without-public-apis)
7. [Group 7: Business Integrations](#group-7-business-integrations)
8. [Third-Party Aggregator Services](#third-party-aggregator-services)

---

## GROUP 1: MAJOR SOCIAL PLATFORMS

### 1.1 Instagram (Meta)

**Platform Name**: Instagram
**OAuth Available**: Yes
**Company**: Meta Platforms, Inc.

#### Approval Process (Instagram Graph API)

1. Create a Meta Developer Account at developers.facebook.com
2. Create an App and set App Type to "Business"
3. Add Instagram Graph API product to your app
4. Complete app verification (includes business documents, Terms of Service)
5. Request Instagram Basic Display or Graph API access
6. Submit approval request with use case details
7. Await review (typically 2-5 business days)
8. Implement OAuth flow in your application
9. Perform platform-specific testing
10. Monitor compliance and maintain active user engagement

**Approval Time**: 2-5 business days (after app verification)
**Cost**: Free for basic access; Premium features available for paid enterprise plans
**Scopes Required**: instagram_basic, instagram_graph_api

**Pros**:

- Massive user base (2+ billion monthly active users)
- Rich data access including posts, stories, insights, and follower information
- Well-documented API with strong developer community support
- Can access both personal and business account data
- Webhooks available for real-time updates

**Cons**:

- Strict approval process with manual review by Meta team
- Limited data availability (Instagram actively restricts competitor tools)
- Rate limiting (varies by tier; Free tier: 200 calls/hour)
- Requires business verification documents
- Changes to API access frequently; deprecations can occur with notice

**Step-by-Step Setup**:

1. Go to developers.facebook.com
2. Create new app > Select "Business"
3. Add Instagram Graph API product
4. Navigate to Settings > Basic to get App ID and Secret
5. Set OAuth redirect URI in Settings > Basic
6. Implement OAuth authorization endpoint
7. Exchange code for access token using app secret
8. Use token to call Instagram Graph API endpoints

**Alternatives if API unavailable**: Apify Instagram scraper, Bright Data, RapidAPI Instagram scraper APIs

---

### 1.2 Facebook

**Platform Name**: Facebook
**OAuth Available**: Yes
**Company**: Meta Platforms, Inc.

#### Approval Process

1. Create Meta Developer Account at developers.facebook.com
2. Create App (type: "Business")
3. Add Facebook Login product
4. Complete app verification (identity verification + business documents)
5. Request required permissions (read_public_profile, pages_read_posts, etc.)
6. Submit app review
7. Await approval (1-7 days)
8. Implement OAuth flow
9. Configure allowed domains
10. Deploy to production

**Approval Time**: 1-7 days
**Cost**: Free
**Scopes**: public_profile, pages_read_posts, pages_read_engagement, pages_manage_posts

**Pros**:

- Direct access to page insights and audience data
- Legacy platform with massive user base
- Good documentation for business integrations
- Webhooks for real-time updates

**Cons**:

- Declining youth engagement; older demographic focus
- Rate limiting enforced
- Historical privacy scandals make approval harder
- Limited data compared to Instagram/TikTok
- Manual review can be slow

**Alternatives if API unavailable**: Apify Facebook scraper, RapidAPI Facebook APIs

---

### 1.3 Threads (Meta)

**Platform Name**: Threads
**OAuth Available**: Yes
**Company**: Meta Platforms, Inc.

#### Approval Process

1. Create Meta Developer Account
2. Create App
3. Add Threads API product
4. Complete Meta app verification
5. Request Threads API access (scopes: threads_basic, threads_insights)
6. Submit review request
7. Await approval (2-5 business days)
8. Implement OAuth and API calls
9. Handle token refresh

**Approval Time**: 2-5 business days
**Cost**: Free
**Scopes**: threads_basic, threads_read_insights, threads_manage_replies

**Pros**:

- New, emerging platform gaining traction
- Text-focused (similar to Twitter/X)
- Integrated with Instagram/Meta ecosystem
- Direct competitor to X, growing user base

**Cons**:

- Limited API maturity and documentation
- Smaller user base than Instagram/Facebook
- Rapidly changing feature set
- Unknown long-term viability

**Alternatives if API unavailable**: Manual monitoring, third-party aggregators tracking adoption

---

### 1.4 YouTube (Google)

**Platform Name**: YouTube
**OAuth Available**: Yes
**Company**: Google (Alphabet)

#### Approval Process (YouTube Data API v3)

1. Create Google Cloud Project
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials (Web application or Desktop app)
4. Configure OAuth consent screen (User Type: External)
5. Set required scopes (youtube.force-ssl, youtube.readonly)
6. Configure authorized redirect URIs
7. No formal app review required (self-service)
8. Implement OAuth flow using Google Auth Library
9. Handle token expiration and refresh
10. Deploy with API quota monitoring

**Approval Time**: Immediate (no app review)
**Cost**: Free tier with quotas; Premium ($0.55-1.50 per 1,000 API units for high-volume)
**Scopes**: youtube.readonly, youtube.force-ssl, youtubepartner, etc.

**Pros**:

- Largest video platform globally (2+ billion users)
- No formal approval process (immediate access)
- Comprehensive API (videos, channels, playlists, comments, analytics)
- Strong Google infrastructure and uptime
- Webhooks/Pub-Sub for real-time updates

**Cons**:

- Complex quota system (10,000 units/day free)
- API cost for production usage can be expensive
- Limited private data (respects privacy boundaries)
- Requires OAuth 2.0 implementation
- Rate limiting stricter for free tier

**Step-by-Step Setup**:

1. Go to console.cloud.google.com
2. Create new project
3. Search and enable YouTube Data API v3
4. Go to Credentials > Create OAuth 2.0 credentials
5. Select "Web application" or "Desktop app"
6. Configure OAuth Consent Screen with required information
7. Add redirect URIs (e.g., http://localhost:8000/callback)
8. Download credentials JSON
9. Use Google OAuth 2.0 library to implement flow
10. Exchange auth code for access token

**Alternatives if API unavailable**: Apify YouTube scraper, RapidAPI YouTube APIs

---

### 1.5 TikTok

**Platform Name**: TikTok
**OAuth Available**: Yes (but restricted)
**Company**: ByteDance (China)

#### Approval Process (TikTok Open Platform)

1. Create TikTok Developer Account at developers.tiktok.com
2. Create new App in Developer Portal
3. Select App Type (iOS, Android, Web, or Server-to-Server)
4. Provide App Details (name, use case, description)
5. Choose Scopes (user.info.basic, video.list, video.publish, etc.)
6. Set Redirect URI
7. Submit for review (2-3 weeks typical)
8. Provide evidence of user acquisition (if applicable)
9. Await approval from TikTok team
10. Implement OAuth with access token handling
11. Manage token refresh (refresh tokens expire after 365 days)

**Approval Time**: 2-3 weeks (can be longer; geopolitical factors apply)
**Cost**: Free
**Scopes**: user.info.basic, user.info.stats, video.list, video.upload, video.publish

**Pros**:

- Fastest-growing social platform (global reach, 1+ billion active users)
- Strong engagement metrics and algorithm
- API provides access to content, user info, and analytics
- Video-first platform (aligns with creator economy)

**Cons**:

- Longest approval time of major platforms (2-3+ weeks)
- Unpredictable approval (geopolitical concerns, ban threats)
- Very restricted access (harder than Instagram/Facebook)
- Limited historical data access
- Rate limiting: 60-300 requests/minute (tiered)
- Content creator verification required for some scopes

**Alternatives if API unavailable**: Apify TikTok scraper, RapidAPI TikTok data APIs, Phyllo (if supported)

---

### 1.6 Twitter/X

**Platform Name**: X (formerly Twitter)
**OAuth Available**: Yes
**Company**: X Corp (formerly Twitter, Inc.)

#### Approval Process (X API v2)

1. Create account at developer.x.com
2. Create new App in Developer Portal
3. Fill in App Details (name, description, use case)
4. Accept OAuth terms
5. Verify email address
6. Choose authentication flow (OAuth 2.0 with PKCE or user context)
7. Request tier upgrade (if needed: Premium/Enterprise)
8. For Basic tier: Automatic access to v2 endpoints (limited)
9. For Premium: Manual review by X team (1-3 business days)
10. For Enterprise: Sales consultation required
11. Implement OAuth flow with proper PKCE handling
12. Deploy and monitor API usage

**Approval Time**: Immediate (Basic); 1-3 days (Premium); Custom (Enterprise)
**Cost**: Free (Basic - limited); $100/month (Premium); Custom (Enterprise)
**Tiers**:

- **Basic**: 50k posts/month, limited endpoints, free
- **Premium**: 2M posts/month, 450 requests/15min, $100/month
- **Enterprise**: Unlimited, custom pricing, dedicated support

**Pros**:

- Real-time news and trend information
- Strong developer community
- Granular access control (tweet.read, follows.read, etc.)
- Multiple authentication methods supported

**Cons**:

- Paid API (was free for years, changed 2023)
- Volatile ownership and policy changes
- Rate limiting enforced strictly
- Rebranding (Twitter to X) causes ongoing confusion
- Premium/Enterprise approval can be slow

**Step-by-Step Setup**:

1. Sign up at developer.x.com with Twitter/X account
2. Create new App in Dashboard
3. Go to Authentication Settings
4. Enable "OAuth 2.0" and set "PKCE" checkbox
5. Set callback URL (redirect URI)
6. Copy API Key and Secret
7. Implement OAuth endpoint
8. Use authorization_code flow
9. Exchange code for bearer token
10. Call endpoints with token

**Alternatives if API unavailable**: Apify Twitter/X scraper (may violate ToS), historical tweet archives, Phyllo

---

### 1.7 LinkedIn

**Platform Name**: LinkedIn
**OAuth Available**: Yes
**Company**: Microsoft (LinkedIn subsidiary)

#### Approval Process

1. Create LinkedIn App in LinkedIn Developer Portal
2. Navigate to "Auth" tab
3. Add Authorized redirect URIs
4. Copy Client ID and Client Secret
5. No formal approval required for most endpoints
6. For advanced access (Sign In with LinkedIn): Auto-approved
7. For marketing content access: Manual review (3-5 business days)
8. For sales access: Manual review (5-7 business days)
9. Implement OAuth 2.0 flow
10. Request appropriate scopes

**Approval Time**: Immediate (basic); 3-7 days (advanced access)
**Cost**: Free
**Scopes**: r_basicprofile, r_emailaddress, r_organization_social, w_member_social

**Pros**:

- B2B powerhouse (900M+ professionals)
- Great for recruitment and hiring integrations
- Official Microsoft backing ensures stability
- Good documentation for enterprise access

**Cons**:

- Limited personal profile data (privacy-focused)
- API for recruiter access is separate and expensive
- Rate limiting: 300 requests/minute
- Company/organization endpoints have restrictions
- Historical data access is limited

**Alternatives if API unavailable**: LinkedIn Recruiter API (paid), third-party RapidAPI connectors

---

### 1.8 Spotify

**Platform Name**: Spotify
**OAuth Available**: Yes
**Company**: Spotify AB

#### Approval Process

1. Go to developer.spotify.com and create account
2. Create new App in Dashboard
3. Accept Spotify Terms
4. Configure Redirect URI in App settings
5. Copy Client ID and Client Secret
6. No formal app review (immediate access)
7. Choose OAuth flow type (Authorization Code or Implicit)
8. Implement OAuth in your application
9. Request user scopes (user-read-private, user-read-email, etc.)
10. Deploy with rate limiting awareness

**Approval Time**: Immediate (no review)
**Cost**: Free
**Scopes**: user-read-private, user-read-email, user-read-playback-state, user-modify-playback-state, etc.

**Pros**:

- Largest music streaming platform (500M+ users)
- Excellent documentation and SDK support
- No approval process; immediate API access
- Rich data on tracks, playlists, listening habits
- Webhooks for real-time playlist changes

**Cons**:

- Rate limiting: 429 responses after 30 requests/sec
- Limited historical data (recent listening only)
- User authentication required for most endpoints
- Some endpoints restricted to Spotify Premium users
- Audio playback requires browser capability

**Step-by-Step Setup**:

1. Create account at developer.spotify.com
2. Click "Create an App"
3. Agree to terms
4. Get Client ID and Client Secret from Dashboard
5. Set Redirect URI to your callback endpoint
6. Implement OAuth 2.0 Authorization Code flow
7. Redirect users to Spotify authorization endpoint
8. Handle callback and exchange code for token
9. Use token to call Web API endpoints
10. Implement token refresh logic

**Alternatives if API unavailable**: Last.fm API (historical listening data), MusicBrainz API (metadata)

---

### 1.9 Snapchat (Snap Kit)

**Platform Name**: Snapchat
**OAuth Available**: Yes (Snap Kit)
**Company**: Snap Inc.

#### Approval Process (Snap Kit)

1. Sign in to snapkit.com with Snapchat account
2. Create new App in Dashboard
3. Fill in App Details (name, platform, description)
4. Choose Kit modules needed (Login Kit, Story Kit, Bitmoji Kit, etc.)
5. Configure OAuth settings:
   - Add Redirect URIs
   - Set Client ID and Secret
6. Accept Snap Kit terms
7. For Login Kit: Immediate access
8. For Story Kit: Manual review (3-5 business days)
9. Implement OAuth flow
10. Test with Snapchat sandbox

**Approval Time**: Immediate (Login Kit); 3-5 days (Story Kit)
**Cost**: Free
**Kits Available**: Login Kit, Story Kit, Bitmoji Kit, Creative Kit (video)

**Pros**:

- Unique user base (100M+ daily active, younger demographic)
- Rich camera/video capabilities
- Creative Kit allows AR experiences
- Growing engagement metrics

**Cons**:

- Limited data access compared to Instagram/TikTok
- Smaller platform (younger user base limits B2B use cases)
- Limited historical data
- Less mature ecosystem than Meta/Google
- Rate limiting enforced

**Alternatives if API unavailable**: Apify Snapchat scraper, manual tracking of stories

---

### 1.10 Pinterest

**Platform Name**: Pinterest
**OAuth Available**: Yes
**Company**: Pinterest, Inc.

#### Approval Process

1. Create Pinterest Developer Account
2. Create new App in Developer Dashboard
3. Set App Name and Description
4. Configure OAuth settings:
   - Redirect URI
   - Client ID and Secret
5. No formal review for most access (auto-approved)
6. For Ads/Analytics access: Manual review (2-3 business days)
7. Implement OAuth 2.0 flow
8. Request scopes: boards:read, pins:read, user:email:read, etc.
9. Deploy application
10. Monitor API usage

**Approval Time**: Immediate (basic); 2-3 days (advanced)
**Cost**: Free
**Scopes**: boards:read, pins:read, user:email:read, pins:write, boards:write

**Pros**:

- Unique user base (500M+ monthly active, female-skewed)
- Strong e-commerce integration (shoppable pins)
- Rich visual content focus
- Low API approval friction

**Cons**:

- Limited engagement data (privacy-focused)
- Smaller platform than Instagram/Facebook
- Rate limiting: 10 requests/second
- Historical data not available
- Less detailed user analytics

**Alternatives if API unavailable**: Apify Pinterest scraper, RapidAPI Pinterest APIs

---

## GROUP 2: CREATOR PLATFORMS

### 2.1 Patreon

**Platform Name**: Patreon
**OAuth Available**: Yes
**Company**: Patreon, Inc.

#### Approval Process

1. Create Patreon account and start creator page
2. Go to Account Settings > Creator Dashboard
3. Navigate to Platform Settings (or Developer Settings if available)
4. Create new App/Token in API section
5. Provide App Name and Description
6. Set Redirect URI(s)
7. No formal review (auto-approved)
8. Receive Client ID and Secret
9. Implement OAuth 2.0 code flow
10. Request scopes: campaigns:read, members:read.emails, posts:read, etc.

**Approval Time**: Immediate
**Cost**: Free
**Scopes**: campaigns:read, members:read.emails, members:read, posts:read, campaigns:write

**Pros**:

- Direct creator-to-fan relationship platform
- Subscription-based revenue model
- Detailed member and pledge data
- Growing creator economy relevance

**Cons**:

- Limited public data (heavily restricted)
- Creator must own Patreon page (not accessible for external monitoring)
- Rate limiting: 60 requests/minute
- Smaller ecosystem than major platforms
- Less sophisticated API compared to Meta/Google

**Alternatives if API unavailable**: Patreon Direct Integration (if you are the creator), Phyllo, CreatorIQ

---

### 2.2 Substack

**Platform Name**: Substack
**OAuth Available**: No (No official API)
**Company**: Substack, Inc.

#### Approval Process

**No public API available.** Substack does not offer official API access.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Phyllo**: Supports Substack data pull (subscriber count, earnings)
- **Zapier**: Limited workflow integration (email triggers)
- **Manual Verification**: Substack verification via email or profile check
- **Scraping Service**: Web scraping of public Substack profiles (respecting robots.txt)

**Pros of Alternative (Phyllo)**:

- Aggregated data across platforms
- Simple OAuth integration with your app
- Reliable data collection

**Cons of Alternative (Phyllo)**:

- Additional third-party dependency
- Monthly costs
- Latency in data updates

---

### 2.3 Beehiiv

**Platform Name**: Beehiv
**OAuth Available**: No
**Company**: Beehiv, Inc.

#### Approval Process

**Limited API; integrations via Zapier only.**

**Approval Time**: N/A
**Cost**: Free (via Zapier)

**Alternatives**:

- **Zapier Integration**: Newsletter metrics via Zapier workflows
- **Beehiv Affiliate API**: For partner revenue tracking only
- **Manual Tracking**: Scraping public stats (if available)

---

### 2.4 ConvertKit

**Platform Name**: ConvertKit
**OAuth Available**: Yes (API Keys, limited OAuth)
**Company**: Tipsy Elves / ConvertKit

#### Approval Process

1. Create ConvertKit Creator account
2. Go to Account > Developer Settings
3. Create API Key (not OAuth 2.0)
4. Copy API Key and Secret
5. No app review required
6. Use API Key in requests (Authorization: Bearer {API_KEY})
7. Limited to creator's own data

**Approval Time**: Immediate
**Cost**: Free
**Access**: Limited to creator's own account data

**Pros**:

- Creator-friendly email/newsletter platform
- Simple API Key authentication
- Good for creator-owned integrations

**Cons**:

- Not true OAuth 2.0
- Limited data access
- API Key is personal, not suitable for multi-user apps
- Rate limiting: 120 requests/minute

**Alternatives if API unavailable**: Zapier ConvertKit integration, manual email list export

---

### 2.5 Medium

**Platform Name**: Medium
**OAuth Available**: Yes (limited)
**Company**: Medium, Inc.

#### Approval Process

1. Create Medium account and author profile
2. Go to Settings > Security > Generate integration token
3. No formal OAuth flow; token-based access
4. Copy integration token
5. Use token in API headers

**Approval Time**: Immediate
**Cost**: Free
**Endpoints**: Limited to user data, publish articles

**Pros**:

- Large writing community (millions of readers)
- Simple token-based access
- Good for author-owned integrations

**Cons**:

- Very limited API (publish + read own data only)
- No OAuth 2.0 (token-based)
- Cannot access other users' data
- Rate limiting not documented
- Deprecated integrations

**Alternatives if API unavailable**: Medium RSS feeds (public articles), manual profile monitoring

---

### 2.6 Ko-fi

**Platform Name**: Ko-fi
**OAuth Available**: No (API Key only)
**Company**: Ko-fi, Inc.

#### Approval Process

1. Create Ko-fi Creator account
2. Go to Dashboard > More > Manage API
3. Generate API Key
4. Copy and store securely
5. Use in API requests (as header: X-API-Key)

**Approval Time**: Immediate
**Cost**: Free
**Access**: Limited to your own Ko-fi account

**Pros**:

- Simple creator monetization
- Easy API key generation
- Good for creator-owned integrations

**Cons**:

- Very limited API (donations, supporters only)
- No OAuth
- Cannot scale to multiple creators
- Minimal documentation
- Rate limiting unclear

**Alternatives if API unavailable**: Ko-fi direct integration (if you own account), Phyllo

---

### 2.7 Buy Me a Coffee

**Platform Name**: Buy Me a Coffee
**OAuth Available**: Partial
**Company**: Buy Me a Coffee, Ltd.

#### Approval Process

1. Create account at buymeacoffee.com
2. Go to Dashboard > Developer Settings
3. Generate API Key
4. Use API key in requests
5. Limited OAuth support (integration via dashboard only)

**Approval Time**: Immediate
**Cost**: Free
**Access**: Supporter data, transaction history

**Pros**:

- Growing creator monetization platform
- Simple setup
- Direct creator payment tracking

**Cons**:

- Limited API capabilities
- Not full OAuth 2.0
- Smaller platform
- Minimal documentation
- Rate limiting not published

**Alternatives if API unavailable**: Manual transaction tracking, Phyllo

---

### 2.8 Gumroad

**Platform Name**: Gumroad
**OAuth Available**: Yes
**Company**: Gumroad, Inc.

#### Approval Process

1. Create Gumroad account (creator or affiliate)
2. Go to Settings > API
3. Create access token
4. Generate new token (one-time shown)
5. Use token for API requests
6. No formal OAuth 2.0 yet (token-based)

**Approval Time**: Immediate
**Cost**: Free
**Access**: Product sales, customer data, license keys

**Pros**:

- Digital product marketplace
- Creator-friendly
- Good for product/service integrations
- License key generation

**Cons**:

- Token-based, not OAuth 2.0
- Limited data scope
- Smaller platform
- Incomplete documentation
- Rate limiting not documented

**Alternatives if API unavailable**: Zapier Gumroad integration, manual sales export

---

## GROUP 3: GAMING PLATFORMS

### 3.1 Twitch

**Platform Name**: Twitch
**OAuth Available**: Yes
**Company**: Amazon (Twitch subsidiary)

#### Approval Process (Twitch API)

1. Create Twitch Developer Account
2. Create new App in Developer Console
3. Set App Category (Video Integration Tool, Analytics, etc.)
4. Set OAuth Redirect URI(s)
5. Copy Client ID and Secret
6. No formal app review (auto-approved)
7. Choose authentication flow:
   - OAuth Authorization Code (recommended)
   - Client Credentials (for server-to-server)
8. Implement OAuth flow
9. Request scopes: user:read:email, channel:read:stream_key, etc.
10. Deploy and monitor

**Approval Time**: Immediate
**Cost**: Free
**Scopes**: user:read:email, channel:read:subscriptions, channel:manage:broadcast, moderation:read, etc.

**Pros**:

- Largest live streaming platform (10M+ streamers, 30M+ daily users)
- Rich real-time data (streams, chat, followers)
- EventSub webhooks for real-time events
- Strong developer community

**Cons**:

- Complex scopes and authentication
- Rate limiting: 120 requests/minute (user) or 30 requests/minute (client credentials)
- Monetization restrictions (can't scrape ads)
- API changes frequently
- EventSub (webhooks) can be delayed

**Step-by-Step Setup**:

1. Go to dev.twitch.tv and sign in
2. Click "Console" > "Applications"
3. Click "Create Application"
4. Fill app name, category, check OAuth redirect URI
5. Accept terms and create
6. Copy Client ID from app settings
7. Generate Client Secret
8. Set OAuth Redirect URI (e.g., http://localhost:3000/callback)
9. Implement Authorization Code flow
10. Use access token with Twitch API

**Alternatives if API unavailable**: Apify Twitch scraper, RapidAPI Twitch APIs, Social Blade API (stats only)

---

### 3.2 Discord

**Platform Name**: Discord
**OAuth Available**: Yes
**Company**: Discord, Inc.

#### Approval Process

1. Create Discord Developer Account
2. Create new Application in Developer Portal
3. Set App Name
4. Generate bot token (in Bot section)
5. Configure OAuth 2.0 settings:
   - Add Redirect URIs
6. Choose Bot permissions (in OAuth2 > URL Generator)
7. No formal app review required
8. Implement OAuth 2.0 code flow (for user auth)
9. Implement bot token auth (for bot actions)
10. Deploy bot to Discord

**Approval Time**: Immediate (no review)
**Cost**: Free
**Scopes**: identify, email, guilds, guilds.join, bot

**Pros**:

- Massive community (150M+ monthly active)
- Rich permissions and role-based access
- Excellent documentation and developer tools
- Webhooks and real-time events
- No approval friction

**Cons**:

- Bot token security critical (requires environment variables)
- Rate limiting: 50 requests/second (strict per-endpoint limits)
- Guild data access restricted
- Requires bot to be in server
- Gateway events can be overwhelming

**Step-by-Step Setup**:

1. Go to discord.com/developers/applications
2. New Application
3. Copy Application ID
4. Go to Bot tab > Add Bot
5. Copy Bot Token (keep secret!)
6. Set OAuth2 > Redirect URIs (e.g., http://localhost:3000/callback)
7. In OAuth2 > URL Generator, select scopes and permissions
8. Invite bot using generated URL
9. Implement OAuth code flow for user auth
10. Use bot token for bot actions

**Alternatives if API unavailable**: Manual Discord community monitoring, Discord webhooks (one-way), Zapier Discord integration

---

### 3.3 Steam

**Platform Name**: Steam
**OAuth Available**: Yes (OpenID)
**Company**: Valve

#### Approval Process (Steam Web API)

1. Create Steam Developer account
2. Register app/game (or use existing game)
3. Go to Steamworks > Web API Documentation
4. Generate WebAPI Key in account settings
5. Verify domain for API key
6. Copy API Key
7. Use key in API requests
8. No formal OAuth 2.0 (OpenID provider only)

**Approval Time**: Immediate
**Cost**: Free
**Authentication**: OpenID 2.0 (not OAuth 2.0)

**Pros**:

- Largest PC gaming platform (130M+ users)
- Rich game library and player data
- Mature platform and tools
- Good for game authentication

**Cons**:

- OpenID 2.0, not modern OAuth 2.0
- Limited personal data (privacy-focused)
- API Key required (not token-based)
- Rate limiting: 100,000 requests/day per IP
- Mature but aging authentication standard

**Alternatives if API unavailable**: Steam Community scraping (via BeautifulSoup), Apify Steam scraper

---

### 3.4 Roblox

**Platform Name**: Roblox
**OAuth Available**: Yes
**Company**: Roblox Corporation

#### Approval Process

1. Create Roblox Developer Account
2. Go to Create section > API Keys
3. Generate new API Key for your game
4. Set API permissions:
   - DataStore access
   - User API access
   - Group API access
5. Copy API Key
6. No formal OAuth (API Key model)
7. Use key in game server requests
8. Implement user authentication in game

**Approval Time**: Immediate
**Cost**: Free
**Access**: Game data, user profiles, groups

**Pros**:

- Large platform (200M+ monthly users)
- Strong youth/gaming focus
- In-game monetization integration
- Growing creator economy

**Cons**:

- Not true OAuth (API Key model)
- Limited external API
- Data access restricted to own games
- Rate limiting enforced
- Primarily a game engine (not social platform)

**Alternatives if API unavailable**: Roblox public profiles (manual tracking), Apify Roblox scraper

---

### 3.5 Kick

**Platform Name**: Kick
**OAuth Available**: Yes (Limited)
**Company**: Kick (Stake, Inc.)

#### Approval Process

1. Create Kick account
2. Go to Creator Dashboard > Settings > API
3. Apply for API Access (requires creator verification)
4. Await approval (1-2 weeks)
5. Receive Client ID and Secret
6. Configure OAuth redirect URI
7. Implement OAuth flow
8. Request scopes: user:read:email, channel:read:info

**Approval Time**: 1-2 weeks (requires creator verification)
**Cost**: Free
**Scopes**: Limited; user and channel read

**Pros**:

- New competitor to Twitch
- Growing streamer community
- Creator-friendly policies
- Lower barrier to monetization

**Cons**:

- Immature API and documentation
- Long approval time
- Requires creator verification
- Limited data scope compared to Twitch
- Smaller ecosystem
- Geopolitical concerns (stakes ownership)

**Alternatives if API unavailable**: Manual profile tracking, Apify Kick scraper (if available)

---

## GROUP 4: E-COMMERCE/FASHION

### 4.1 Shopify

**Platform Name**: Shopify
**OAuth Available**: Yes
**Company**: Shopify, Inc.

#### Approval Process (Shopify App)

1. Create Shopify Partner Account at partners.shopify.com
2. Create new App in Dashboard
3. Set App Name and Description
4. Fill in app details (store setup recommendations, etc.)
5. Set Admin API scopes needed (products:read, orders:read, etc.)
6. Configure redirect URI
7. No formal review for public apps (can submit)
8. Generate access token for custom apps
9. Use credentials to authenticate
10. Deploy to Shopify App Store (optional)

**Approval Time**: Immediate (custom app); 3-5 days (public app)
**Cost**: Free (custom app); Revenue share for public apps
**Scopes**: products:read, orders:read, customers:read, products:write, etc.

**Pros**:

- Largest e-commerce platform (1M+ stores)
- Comprehensive API (products, orders, customers, inventory)
- Mature OAuth and webhook system
- Good developer documentation

**Cons**:

- Complex scopes and permission model
- Rate limiting: 2 requests/second per app
- Public app review can be slow
- Requires Shopify store to test
- Monetization requirements for public apps

**Step-by-Step Setup**:

1. Create Shopify Partner account
2. Create new app in Partner Dashboard
3. Set Admin API scopes
4. Set Redirect URI
5. Copy API Credentials
6. Use OAuth to get access token
7. Implement webhook handling (order.created, etc.)
8. Test with development store
9. Deploy app to store

**Alternatives if API unavailable**: Custom Shopify app with API key, RapidAPI Shopify APIs

---

### 4.2 Etsy

**Platform Name**: Etsy
**OAuth Available**: Yes
**Company**: Etsy, Inc.

#### Approval Process

1. Create Etsy account (seller or buyer)
2. Go to Your Account > Apps & Connections > Developer
3. Create new App
4. Set App Name and Description
5. Configure OAuth settings:
   - Redirect URI
   - Requested scopes (listings:read, listings:write, transactions:read)
6. No formal app review
7. Receive Client ID and Secret
8. Implement OAuth 2.0 authorization code flow
9. Request permissions from users

**Approval Time**: Immediate
**Cost**: Free (limited); $0.05 per API call for extended access
**Scopes**: listings:read, listings:write, transactions:read, etc.

**Pros**:

- Large creative/handmade marketplace (7M+ sellers, 80M+ buyers)
- Good API coverage for shop data
- Low barrier to entry
- Webhooks for real-time updates

**Cons**:

- Pay-per-call model ($0.05 per call) adds costs
- Rate limiting: 10 requests/second
- Limited historical data
- Seller data access restricted
- Smaller ecosystem than Shopify/Amazon

**Alternatives if API unavailable**: Etsy RSS feeds, RapidAPI Etsy APIs, manual product tracking

---

### 4.3 Poshmark

**Platform Name**: Poshmark
**OAuth Available**: No
**Company**: Poshmark, Inc.

#### Approval Process

**No official API.** Mobile-first fashion marketplace.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Phyllo**: Supports Poshmark seller data (if available)
- **Apify Scraper**: Scrape public Poshmark profiles
- **Manual Verification**: Check seller ratings/reviews on platform
- **RapidAPI Poshmark Scraper**: Third-party scraping APIs

**Pros of Alternative (Phyllo/Apify)**:

- Can aggregate seller data
- Relatively simple to set up

**Cons of Alternative (Phyllo/Apify)**:

- Scraping may violate ToS
- Data quality/consistency issues
- Poshmark actively blocks scraping

---

### 4.4 Depop

**Platform Name**: Depop
**OAuth Available**: No
**Company**: Depop (Etsy subsidiary)

#### Approval Process

**No official API.** Mobile marketplace for secondhand fashion.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Phyllo**: May support Depop data
- **Apify Depop Scraper**: Community scraper for public data
- **Manual Tracking**: Monitor seller profiles
- **Email Verification**: Reach out to sellers directly

**Pros of Alternative (Scraping)**:

- Access to public listing data
- Can track seller activity

**Cons of Alternative (Scraping)**:

- Violates Depop ToS
- Depop aggressively blocks scrapers
- Inconsistent data
- High maintenance

---

### 4.5 LTK (formerly Like to Know It)

**Platform Name**: LTK
**OAuth Available**: No
**Company**: Rewardless

#### Approval Process

**No official public API.** Fashion/lifestyle influencer monetization platform.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Phyllo**: Creator data aggregation (if supported)
- **Manual Creator Database**: Build own database of LTK creators
- **Influencer Networks**: Use CreatorIQ, Modash, AspireIQ to find LTK creators

**Pros of Alternative (Third-party Aggregators)**:

- Comprehensive creator data
- Professional tools

**Cons of Alternative (Third-party Aggregators)**:

- Monthly subscription required
- Not LTK-specific data
- Additional vendor management

---

### 4.6 Amazon Influencer

**Platform Name**: Amazon Influencer
**OAuth Available**: No (Limited)
**Company**: Amazon

#### Approval Process

**Limited API access.** No public OAuth for influencer data.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Amazon Associate API**: Track affiliate product links (if enrolled)
- **Influencer Networks**: Use third-party tools (AspireIQ, CreatorIQ)
- **Manual Tracking**: Monitor Amazon storefronts directly
- **Phyllo**: Check if Amazon Influencer is supported

**Pros of Alternative (Amazon Associate API)**:

- Official, low-risk
- Direct link to Amazon commerce

**Cons of Alternative (Amazon Associate API)**:

- Not influencer-specific
- Affiliate data only
- Requires Amazon Associate enrollment

---

## GROUP 5: MUSIC PLATFORMS

### 5.1 Spotify (Duplicate - See Group 1)

Already covered above in [Section 1.8](#18-spotify).

---

### 5.2 SoundCloud

**Platform Name**: SoundCloud
**OAuth Available**: Yes
**Company**: SoundCloud Global Limited & Co. KG

#### Approval Process

1. Create SoundCloud developer account
2. Create new App in Dashboard
3. Set App Name and Description
4. Configure OAuth settings:
   - Redirect URI
   - Requested scopes
5. No formal review
6. Receive Client ID and Secret
7. Implement OAuth 2.0 flow
8. Request scopes: non-expiring, with scope narrowing

**Approval Time**: Immediate
**Cost**: Free
**Scopes**: me, email (optional), tracks:edit, playlist:modify

**Pros**:

- Independent music platform (65M+ monthly users)
- Good for electronic music and underground artists
- Simple OAuth setup
- Good for emerging artist discovery

**Cons**:

- Declining user base vs. Spotify
- Limited commercial features
- API deprecation risks (company history)
- Rate limiting: 15,000 requests/hour
- Less sophisticated analytics than Spotify

**Alternatives if API unavailable**: Last.fm API, RapidAPI SoundCloud scraper, Apify SoundCloud scraper

---

### 5.3 Apple Music

**Platform Name**: Apple Music
**OAuth Available**: Yes (MusicKit)
**Company**: Apple

#### Approval Process (MusicKit)

1. Create Apple Developer Account (Apple Developer Program member)
2. Create Team ID and Private Key in Developer Portal
3. Register Web Domain in App Identifiers
4. Create JWT token for MusicKit JS authentication
5. No formal app review
6. Implement MusicKit JS library
7. Configure user authorization
8. Request Music User Token from Apple
9. Query Music API

**Approval Time**: Immediate
**Cost**: Free (requires Apple Developer Program membership: $99/year)
**Authentication**: JWT tokens, no OAuth 2.0

**Pros**:

- Access to 100M+ Apple Music library
- High-fidelity audio quality
- Integration with Apple ecosystem
- Good personalization features

**Cons**:

- Requires Apple Developer Program membership ($99/year)
- JWT authentication (not OAuth 2.0)
- Limited historical data
- Rate limiting: 3 requests/second
- Subscription required for users

**Alternatives if API unavailable**: Last.fm API, Spotify API, Bandcamp API

---

### 5.4 Bandcamp

**Platform Name**: Bandcamp
**OAuth Available**: No
**Company**: Bandcamp (Epic Games subsidiary)

#### Approval Process

**Limited API; no public OAuth.**

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Bandcamp Developer Tools**: RSS feeds for artist releases
- **Apify Bandcamp Scraper**: Community scraper for public artist data
- **Manual Artist Tracking**: Track artist profiles and new releases
- **Email Integration**: Direct contact with artists

**Pros of Alternative (Apify)**:

- Can access public release data
- No cost

**Cons of Alternative (Apify)**:

- May violate ToS
- Bandcamp prioritizes artist privacy
- Inconsistent data

---

### 5.5 Audiomack

**Platform Name**: Audiomack
**OAuth Available**: Limited
**Company**: Audiomack, Inc.

#### Approval Process

**Limited API available.** Audiomack has restricted API access.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

- **Apify Audiomack Scraper**: Public artist and song data
- **RapidAPI Audiomack APIs**: Third-party API wrappers
- **Manual Artist Tracking**: Monitor artist profiles

**Pros of Alternative (Scraping)**:

- Access to emerging hip-hop artists
- No cost

**Cons of Alternative (Scraping)**:

- May violate ToS
- Data consistency issues
- High maintenance

---

## GROUP 6: PLATFORMS WITHOUT PUBLIC APIS

### 6.1 OnlyFans

**Platform Name**: OnlyFans
**OAuth Available**: No
**Company**: Leonid Shvetsov, Ltd.

#### Approval Process

**No official API available.** OnlyFans is subscription-based, creator-to-fan platform.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

1. **Phyllo**: Supports OnlyFans data aggregation (earnings, subscriber count)
2. **Web Scraping Services**:
   - Apify OnlyFans Scraper
   - Bright Data (third-party scraping)
3. **Manual Verification**: Direct contact with creators
4. **Email Verification**: Verify creator identity via email

**Recommended Alternative**: Phyllo

- Provides: Earnings, subscriber count, recent activity
- Cost: Subscription model
- Setup: OAuth between your app and Phyllo

**Pros of Phyllo**:

- Legal and safe
- Aggregates multiple platforms
- Real-time data

**Cons of Phyllo**:

- Third-party dependency
- Monthly subscription cost
- Data lag vs. real-time

---

### 6.2 Cameo

**Platform Name**: Cameo
**OAuth Available**: No
**Company**: Martin Blumenau, Inc.

#### Approval Process

**No official API.** Video shout-out marketplace.

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

1. **Web Scraping**:
   - Apify Cameo Scraper
   - RapidAPI Cameo APIs
2. **Phyllo**: May support Cameo data
3. **Manual Creator Database**: Build own creator list

**Recommended Alternative**: Manual Creator Database + Apify

- Scrape public Cameo profiles for celebrity/influencer presence
- Maintain database of creator earnings (if public)

**Pros of Alternative**:

- Access to celebrity presence data
- Low cost

**Cons of Alternative**:

- Scraping may violate ToS
- Limited data accuracy
- High maintenance

---

### 6.3 ESPN

**Platform Name**: ESPN
**OAuth Available**: No
**Company**: The Walt Disney Company

#### Approval Process

**No official public API for ESPN content.**

**Approval Time**: N/A
**Cost**: N/A

**Alternatives**:

1. **ESPN Developer API**: Limited sports data API (stats, schedules)
2. **Web Scraping**:
   - Apify ESPN Scraper
   - Bright Data ESPN data collection
3. **Sports Data APIs**:
   - ESPN Data (third-party provider)
   - SportsData.io
   - TheSportsDB
4. **Manual Tracking**: Monitor ESPN.com directly

**Recommended Alternative**: SportsData.io or ESPN Data API

- Provides: Game scores, player stats, news
- Cost: Paid subscription ($49-299/month)
- Coverage: All major sports

**Pros of Alternative (SportsData)**:

- Official, legal, reliable
- Comprehensive sports data
- Well-documented

**Cons of Alternative (SportsData)**:

- Paid service
- Subscription required
- Not specific to ESPN brand

---

### 6.4 Poshmark (Duplicate - See Group 4)

Already covered above in [Section 4.3](#43-poshmark).

---

### 6.5 Depop (Duplicate - See Group 4)

Already covered above in [Section 4.4](#44-depop).

---

### 6.6 LTK (Duplicate - See Group 4)

Already covered above in [Section 4.5](#45-ltk-formerly-like-to-know-it).

---

### 6.7 Kick (Duplicate - See Group 3)

Already covered above in [Section 3.5](#35-kick).

---

### 6.8 Substack (Duplicate - See Group 2)

Already covered above in [Section 2.2](#22-substack).

---

## GROUP 7: BUSINESS INTEGRATIONS

### 7.1 Salesforce

**Platform Name**: Salesforce
**OAuth Available**: Yes
**Company**: Salesforce, Inc.

#### Approval Process

1. Create Salesforce Developer Org (free sandbox)
2. Create Connected App in Setup > Apps > App Manager
3. Fill in App Name and Description
4. Enable OAuth
5. Configure OAuth Scopes (api, refresh_token, etc.)
6. Set Redirect URI
7. Save to get Consumer Key and Secret
8. No formal review required
9. Implement OAuth 2.0 authorization code flow
10. Use access token with Salesforce REST API

**Approval Time**: Immediate
**Cost**: Free (Developer Edition); Paid for production orgs
**Scopes**: api, refresh_token, full, custom_domain, etc.

**Pros**:

- Industry-standard CRM platform (25M+ users)
- Comprehensive REST and SOAP APIs
- Mature OAuth and security implementation
- Strong documentation and community
- Webhooks for real-time sync

**Cons**:

- Complex setup (many configuration options)
- Rate limiting: 15,000 API calls/24 hours (varies by org type)
- Org-specific endpoints (no single URL)
- Requires Salesforce CRM understanding
- Licensing costs for production

**Step-by-Step Setup**:

1. Create free Salesforce Developer Org
2. Go to Setup > Apps > App Manager
3. Create new Connected App
4. Enable OAuth and configure scopes
5. Set Redirect URI
6. Save and copy Consumer Key/Secret
7. Implement OAuth authorization endpoint
8. Handle callback and exchange code for token
9. Use access token with Salesforce REST API

**Alternatives if API unavailable**: Zapier Salesforce integration, RapidAPI Salesforce APIs

---

### 7.2 HubSpot

**Platform Name**: HubSpot
**OAuth Available**: Yes
**Company**: HubSpot, Inc.

#### Approval Process

1. Create HubSpot account (free or paid)
2. Go to Settings > Integrations > Private apps
3. Create New Private App
4. Set App Name and Description
5. Choose required scopes (crm.objects.contacts.read, etc.)
6. Set Redirect URI
7. Accept terms
8. Create app and copy access token
9. No formal review
10. Use token in API requests

**Approval Time**: Immediate
**Cost**: Free (private app); Revenue share for public apps
**Scopes**: crm.objects.contacts.read/write, crm.objects.deals.read/write, etc.

**Pros**:

- Popular marketing automation platform (200K+ users)
- Good documentation and API
- OAuth 2.0 support
- Free tier available
- Webhooks and real-time events

**Cons**:

- Rate limiting: 100 requests/10 seconds
- Tier-based feature access
- Requires HubSpot account
- OAuth scopes can be restrictive
- Public app review can be slow

**Step-by-Step Setup**:

1. Sign in to HubSpot account
2. Go to Settings > Integrations > Private apps
3. Create New Private App
4. Set app name and description
5. Select required scopes (contact, deal, company, etc.)
6. Set Redirect URI (for OAuth apps)
7. Create app and copy token
8. Use token with HubSpot API

**Alternatives if API unavailable**: Zapier HubSpot integration, RapidAPI HubSpot APIs

---

### 7.3 Pipedrive

**Platform Name**: Pipedrive
**OAuth Available**: Yes
**Company**: Pipedrive, Inc.

#### Approval Process

1. Create Pipedrive account (free or paid)
2. Go to Settings > Integrations > Marketplace
3. Create new App/Integration
4. Set App Name and Description
5. Choose OAuth 2.0 authentication
6. Configure Redirect URI
7. Accept terms
8. Receive API key or OAuth credentials
9. No formal review required
10. Implement OAuth flow

**Approval Time**: Immediate
**Cost**: Free (API access); Paid apps can be listed in marketplace
**Scopes**: users:read, deals:read, contacts:read, etc.

**Pros**:

- Popular sales CRM (250K+ users)
- Simple OAuth setup
- Good for sales pipeline management
- Webhooks for real-time updates
- Free API for basic use

**Cons**:

- Rate limiting: 2 requests/second
- Requires Pipedrive subscription
- Limited free tier features
- Data access restricted by user permissions
- Smaller ecosystem than Salesforce

**Step-by-Step Setup**:

1. Create Pipedrive account
2. Go to Settings > Integrations > Marketplace
3. Create new integration
4. Set OAuth redirect URI
5. Copy API Token or OAuth credentials
6. Implement OAuth 2.0 flow
7. Request permissions from users

**Alternatives if API unavailable**: Zapier Pipedrive integration, RapidAPI Pipedrive APIs

---

### 7.4 Slack

**Platform Name**: Slack
**OAuth Available**: Yes
**Company**: Slack Technologies (Salesforce subsidiary)

#### Approval Process

1. Go to api.slack.com/apps
2. Create New App (From scratch or From manifest)
3. Set App Name and Workspace
4. Go to OAuth & Permissions
5. Set Redirect URI(s)
6. Select required scopes (chat:write, commands, etc.)
7. Install to Workspace
8. Copy Bot Token (xoxb-...)
9. No formal review for workspace apps
10. For Distribution: Submit to Slack App Directory

**Approval Time**: Immediate (workspace app); 1-3 days (directory listing)
**Cost**: Free
**Scopes**: chat:write, chat:read, commands, emoji:read, files:read, etc.

**Pros**:

- Ubiquitous workplace communication (200M+ users)
- Excellent documentation and developer tools
- Simple OAuth setup
- Webhooks, interactive messages, and commands
- Strong community and integrations

**Cons**:

- Workspace-specific tokens (not portable)
- Rate limiting: varies by endpoint (1 request/second to 20/minute)
- Requires bot to be installed in workspace
- Slash commands can be slow (3000ms timeout)
- Socket mode has latency

**Step-by-Step Setup**:

1. Go to api.slack.com/apps
2. Create New App
3. Go to OAuth & Permissions
4. Set Redirect URI
5. Select required scopes
6. Install to workspace
7. Copy Bot Token (xoxb-...)
8. Use token in API requests
9. Configure event subscriptions (optional)
10. Deploy bot

**Alternatives if API unavailable**: Zapier Slack integration (no-code), manual notifications

---

### 7.5 Zapier

**Platform Name**: Zapier
**OAuth Available**: Yes (as platform for others)
**Company**: Zapier, Inc.

#### Approval Process (Integrating Your API with Zapier)

1. Create Zapier Developer account at platform.zapier.com
2. Create new App in Zapier Platform
3. Define Authentication (OAuth 2.0, API Key, or custom)
4. Create Triggers (e.g., "New post created")
5. Create Actions (e.g., "Create contact")
6. Configure Polling or Webhooks
7. Test integration thoroughly
8. Submit for Zapier App Review (2-3 weeks)
9. Await approval feedback
10. Deploy to Zapier marketplace

**Approval Time**: 2-3 weeks
**Cost**: Free (to list); Potential revenue share
**Requirements**: Stable API, documentation, webhook support recommended

**Pros**:

- Largest workflow automation platform (10M+ users)
- Easy to list integrations
- No-code/low-code for users
- Huge reach and discoverability
- Revenue sharing for popular apps

**Cons**:

- 2-3 week review process
- Requires well-documented API
- Zapier controls user experience
- Revenue share takes percentage
- Need to maintain integration

**Step-by-Step Setup**:

1. Create developer account at platform.zapier.com
2. Create new App
3. Set up authentication (OAuth 2.0 recommended)
4. Define triggers (webhook-based or polling)
5. Define actions (what users can do)
6. Create example test data
7. Write comprehensive documentation
8. Test all flows end-to-end
9. Submit for review
10. Iterate on feedback

**Alternatives if API unavailable**: IFTTT, Make.com, custom integrations

---

### 7.6 Mailchimp

**Platform Name**: Mailchimp
**OAuth Available**: Yes
**Company**: Mailchimp (Intuit subsidiary)

#### Approval Process

1. Create Mailchimp account (free or paid)
2. Go to Account > Extras > API keys
3. Create New API Key
4. Copy API Key (for server-to-server)
5. For OAuth: Go to Account > Registered OAuth Applications
6. Create New OAuth Application
7. Set Redirect URI
8. Receive Client ID and Secret
9. No formal review required
10. Implement API key or OAuth authentication

**Approval Time**: Immediate
**Cost**: Free (for API access); Email sends billed separately
**Scopes**: lists, campaigns, reports, automation, etc. (via API)

**Pros**:

- Email marketing leader (12M+ users)
- Free tier available
- Simple API and OAuth
- Comprehensive email and audience management
- Good documentation

**Cons**:

- Rate limiting: 10 requests/second
- API key is personal (not ideal for multi-user)
- Requires email sending credits (paid)
- Audience data export can be limited
- Deprecated endpoints sometimes without notice

**Step-by-Step Setup**:

1. Create Mailchimp account
2. Go to Account > Extras > API keys
3. Create and copy API key
4. Use in requests with Basic Auth (username: "anything", password: API key)
5. Or: Create OAuth app for user-delegated access
6. Implement OAuth 2.0 flow

**Alternatives if API unavailable**: Zapier Mailchimp integration, SendGrid API, Mailgun API

---

## THIRD-PARTY AGGREGATOR SERVICES

These platforms provide unified APIs for accessing data from multiple social media platforms without needing individual integrations.

### Phyllo

**Name**: Phyllo
**Website**: phyllo.io
**Coverage**: 50+ platforms (estimated)

**Supported Platforms**:

- Social: Instagram, TikTok, YouTube, Twitch, Snapchat, LinkedIn, Twitter/X
- Creator: Patreon, Substack, Beehiiv, Medium, ConvertKit, Buy Me a Coffee, Ko-fi
- E-commerce: Shopify, Etsy
- OnlyFans, Twitch, Discord
- And others (full list available on website)

**Approval Process**:

1. Sign up at phyllo.io
2. Create API key in dashboard
3. Create OAuth flow linking Phyllo to your app
4. Users authenticate their social accounts via Phyllo
5. Access aggregated data through Phyllo API
6. Use webhooks for real-time updates

**Approval Time**: Immediate
**Cost**: $0.49-1.99 per connection/month (varies by platform)
**Data Available**: Earnings, followers, engagement, content metrics, subscriber info

**Pros**:

- Single integration for 50+ platforms
- Legal and compliant approach
- Real-time data via webhooks
- Supports creator-economy platforms
- Good developer documentation

**Cons**:

- Monthly per-connection costs add up quickly
- Data lag (may not be fully real-time)
- Limited historical data
- Dependent on third party
- Not all platforms supported

**When to Use**: Phyllo is ideal for applications needing data from 3+ creator platforms simultaneously. Cost-effective at scale.

---

### CreatorIQ API

**Name**: CreatorIQ API
**Website**: CreatorIQ.com
**Coverage**: 50+ platforms (estimated)

**Supported Platforms**:

- Instagram, TikTok, YouTube, Twitch, Pinterest, LinkedIn
- Twitter/X, Snapchat
- And others

**Approval Process**:

1. Sign up at CreatorIQ.com (requires business account)
2. Request API access
3. Await approval (1-3 business days)
4. Receive API key
5. Use API key to search and retrieve creator data
6. No OAuth required; API key authentication

**Approval Time**: 1-3 business days
**Cost**: Starts at $99/month or custom pricing
**Data Available**: Creator profiles, audience demographics, engagement metrics, growth trends

**Pros**:

- Comprehensive creator database
- Good search and filtering
- Audience demographic insights
- Historical data available
- Well-maintained API

**Cons**:

- Paid service only (no free tier)
- Minimum $99/month
- Limited to creator profiles (not personal data pull)
- Not suitable for user-initiated connections
- Higher cost for small apps

**When to Use**: CreatorIQ is best for applications needing to search and profile creators across platforms. Not for user connections.

---

### Modash

**Name**: Modash
**Website**: modash.io
**Coverage**: 40+ platforms

**Supported Platforms**:

- Instagram, TikTok, YouTube, Twitch
- Pinterest, Snapchat, LinkedIn
- Twitter/X, Telegram
- And others

**Approval Process**:

1. Sign up at modash.io
2. Create account (SaaS tool first)
3. Upgrade for API access ($199+/month)
4. Receive API key
5. Authenticate with API key
6. Access creator database

**Approval Time**: Immediate
**Cost**: Starts at $199/month
**Data Available**: Creator profiles, audience, engagement, growth trends, audience demographics

**Pros**:

- Large creator database (50M+ profiles)
- Good filtering and search
- Audience insights
- Real-time data updates
- Video content analysis

**Cons**:

- Expensive ($199+/month minimum)
- Not suitable for personal data pull
- Database-focused (not OAuth connection)
- Limited free trial

**When to Use**: Modash is for influencer marketing agencies needing to search and identify creators at scale.

---

### Social Blade API

**Name**: Social Blade API
**Website**: socialblade.com/api
**Coverage**: YouTube, Twitch, Instagram, TikTok, Twitter/X

**Supported Platforms**:

- YouTube (channels, playlists)
- Twitch (channels, streams)
- Instagram, TikTok, Twitter/X (limited)

**Approval Process**:

1. Sign up at socialblade.com
2. Go to Account > API Settings
3. Create API key
4. No formal review required
5. Use API key in requests
6. Rate limits apply

**Approval Time**: Immediate
**Cost**: Free (limited); $20/month (pro)
**Data Available**: Historical statistics, growth trends, earnings (YouTube), rankings

**Pros**:

- Long-running platform (trusted by industry)
- Historical data (years of trends)
- YouTube earnings estimates
- Twitch channel analytics
- Free tier available

**Cons**:

- Limited to statistics/growth trends
- Not real-time (updated daily/weekly)
- Limited platform coverage
- Data accuracy concerns (estimates)
- Smaller ecosystem

**When to Use**: Social Blade is useful for trend analysis and historical growth tracking across major platforms.

---

### RapidAPI Social Media APIs

**Name**: RapidAPI Marketplace (multiple providers)
**Website**: rapidapi.com
**Coverage**: 100+ social media APIs

**Common Available APIs**:

- Instagram Scraper, TikTok Data, YouTube API, Twitter API
- Twitch API, Spotify API, LinkedIn Scraper
- And dozens more

**Approval Process**:

1. Sign up at rapidapi.com
2. Search for desired API (e.g., "Instagram Scraper")
3. Review API documentation and pricing
4. Subscribe to API plan (free or paid)
5. Receive API key
6. Use RapidAPI key in requests (with host headers)
7. No additional approval required

**Approval Time**: Immediate
**Cost**: Varies by API ($0-1000+/month)
**Data Available**: Varies (scraping APIs, data APIs, official APIs)

**Pros**:

- Huge marketplace of options
- Free tier available for many APIs
- Easy subscription and management
- Mix of official and community APIs
- Good for quick prototyping

**Cons**:

- Quality varies widely (some APIs are unreliable)
- Many are scraping-based (ToS risk)
- Rate limiting varies by API
- Additional margin on top of original API
- Support quality inconsistent

**When to Use**: RapidAPI is useful for finding quick alternatives when official APIs are unavailable, but prioritize official APIs when possible.

---

### Apify

**Name**: Apify (Web Scraping Platform)
**Website**: apify.com
**Coverage**: 100+ platforms via community actors

**Available Scrapers**:

- Instagram, TikTok, YouTube, Twitter/X
- Twitch, Discord, Reddit
- Facebook, LinkedIn, Snapchat
- Shopify, Amazon, Etsy
- Poshmark, Depop, Cameo, OnlyFans
- And many more

**Approval Process**:

1. Sign up at apify.com
2. Browse Actor marketplace for desired scraper
3. Select actor (e.g., "Instagram Scraper")
4. Create task with parameters
5. Subscribe to pricing plan
6. Run scraper and get results
7. Integrate results via API or webhook

**Approval Time**: Immediate
**Cost**: $0.25-5+ per run (varies by actor complexity)
**Data Available**: Varies by actor (public profile data, posts, comments, etc.)

**Pros**:

- Comprehensive platform coverage
- Easy no-code interface
- Community actors for hard-to-access platforms
- Results via API or webhooks
- Good for one-time or periodic scraping

**Cons**:

- Many actors violate platform ToS
- Data quality variable (depends on actor)
- Cost per run adds up with frequent use
- Platform blocking/IP issues
- Risk of account bans on target platforms

**When to Use**: Apify is useful for scraping data from platforms without official APIs, but use cautiously due to ToS risks.

---

### Bright Data

**Name**: Bright Data (formerly Luminati Networks)
**Website**: brightdata.com
**Coverage**: 100+ platforms via proxies and scraping

**Available Services**:

- Residential proxies (for scraping)
- Social media data collection
- E-commerce price monitoring
- Web scraping infrastructure

**Approval Process**:

1. Sign up at brightdata.com
2. Choose service type (web scraper, proxy, etc.)
3. Set up account and payment
4. Configure parameters for data collection
5. Submit for review (1-3 days for enterprise)
6. Receive access to infrastructure

**Approval Time**: Immediate (self-service); 1-3 days (enterprise)
**Cost**: $50-5000+/month (varies by usage)
**Data Available**: Custom social media data extraction

**Pros**:

- Enterprise-grade scraping infrastructure
- Large residential proxy network (millions of IPs)
- Custom data collection options
- IP rotation and management
- Good for large-scale data needs

**Cons**:

- Expensive for small projects
- High minimum spend
- Complex setup and configuration
- ToS risks for some use cases
- Requires technical expertise

**When to Use**: Bright Data is for enterprise applications needing large-scale social media data collection with sophisticated proxy management.

---

## INTEGRATION SUMMARY TABLE

| Platform            | Has OAuth | Approval Time    | Cost         | Complexity | Data Quality | Recommendation               |
| ------------------- | --------- | ---------------- | ------------ | ---------- | ------------ | ---------------------------- |
| **Instagram**       | Yes       | 2-5 days         | Free         | Medium     | High         | Use official API             |
| **Facebook**        | Yes       | 1-7 days         | Free         | Medium     | Medium       | Use official API             |
| **Threads**         | Yes       | 2-5 days         | Free         | Medium     | Medium       | New, use cautiously          |
| **YouTube**         | Yes       | Immediate        | Free/Paid    | Low        | High         | Use official API             |
| **TikTok**          | Yes       | 2-3 weeks        | Free         | High       | High         | Use official API, long wait  |
| **Twitter/X**       | Yes       | Immediate-7 days | Free-$100/mo | Medium     | Medium       | Official API, cost-conscious |
| **LinkedIn**        | Yes       | Immediate-7 days | Free         | Medium     | Medium       | B2B-focused, use official    |
| **Spotify**         | Yes       | Immediate        | Free         | Low        | High         | Use official API             |
| **Snapchat**        | Yes       | Immediate-5 days | Free         | Medium     | Low          | Limited data                 |
| **Pinterest**       | Yes       | Immediate-3 days | Free         | Low        | Medium       | Use official API             |
| **Twitch**          | Yes       | Immediate        | Free         | Medium     | High         | Use official API             |
| **Discord**         | Yes       | Immediate        | Free         | Low        | Medium       | Use official API             |
| **Steam**           | Partial   | Immediate        | Free         | Low        | Medium       | OpenID, limited data         |
| **Shopify**         | Yes       | Immediate-5 days | Free         | Medium     | High         | Use official API             |
| **Etsy**            | Yes       | Immediate        | Free/Paid    | Medium     | Medium       | $0.05 per call               |
| **Patreon**         | Yes       | Immediate        | Free         | Low        | High         | Creator-only                 |
| **Substack**        | No        | N/A              | N/A          | N/A        | N/A          | Use Phyllo alternative       |
| **ConvertKit**      | Partial   | Immediate        | Free         | Low        | Low          | API key only                 |
| **Medium**          | Limited   | Immediate        | Free         | Low        | Low          | Token-based, limited         |
| **Ko-fi**           | No        | Immediate        | Free         | Low        | Low          | API key, creator-only        |
| **Buy Me a Coffee** | Partial   | Immediate        | Free         | Low        | Low          | Limited API                  |
| **Gumroad**         | Yes       | Immediate        | Free         | Low        | Low          | Token-based                  |
| **Roblox**          | Partial   | Immediate        | Free         | Medium     | Low          | API key, game-specific       |
| **Kick**            | Yes       | 1-2 weeks        | Free         | Medium     | Low          | New, long approval           |
| **Poshmark**        | No        | N/A              | N/A          | N/A        | N/A          | Use scraping service         |
| **Depop**           | No        | N/A              | N/A          | N/A        | N/A          | Use scraping service         |
| **LTK**             | No        | N/A              | N/A          | N/A        | N/A          | Use third-party tools        |
| **OnlyFans**        | No        | N/A              | N/A          | N/A        | N/A          | Use Phyllo                   |
| **Cameo**           | No        | N/A              | N/A          | N/A        | N/A          | Use scraping service         |
| **ESPN**            | No        | N/A              | N/A          | N/A        | N/A          | Use SportsData.io            |
| **Salesforce**      | Yes       | Immediate        | Free-Paid    | High       | High         | Enterprise standard          |
| **HubSpot**         | Yes       | Immediate        | Free-Paid    | Medium     | High         | Marketing automation         |
| **Pipedrive**       | Yes       | Immediate        | Free-Paid    | Medium     | Medium       | Sales CRM                    |
| **Slack**           | Yes       | Immediate-3 days | Free         | Low        | High         | Workplace standard           |
| **Zapier**          | Yes       | 2-3 weeks        | Free-Paid    | Medium     | Medium       | Automation platform          |
| **Mailchimp**       | Yes       | Immediate        | Free-Paid    | Low        | Medium       | Email marketing              |

---

## RECOMMENDATIONS BY USE CASE

### Use Case: Creator Verification & Profile Data

**Recommended Approach**:

1. **Official OAuth First**: Instagram, YouTube, TikTok, Twitch
2. **Creator-Specific Platforms**: Patreon, Substack (via Phyllo)
3. **Aggregator Fallback**: Phyllo for 2+ platforms

**Recommended Stack**:

- OAuth integrations for major platforms
- Phyllo for creator platforms (Patreon, Substack, Ko-fi, etc.)
- Social Blade for historical trends

**Estimated Approval Time**: 2-3 weeks (TikTok bottleneck)

---

### Use Case: Influencer Marketing Platform

**Recommended Approach**:

1. **Creator Search**: Modash or CreatorIQ (database-first)
2. **Multi-Platform Pull**: Phyllo for real-time metrics
3. **Analytics**: Social Blade for historical growth

**Recommended Stack**:

- Modash or CreatorIQ for creator discovery
- Phyllo for 10+ connected creators
- Custom dashboard for analytics

**Estimated Cost**: $200-500/month (scaling)

---

### Use Case: Social Proof & Verification

**Recommended Approach**:

1. **Direct OAuth**: Instagram, YouTube, TikTok, Twitter/X
2. **Aggregators**: Phyllo for multi-platform coverage
3. **Fallback**: Manual verification via profile URLs

**Recommended Stack**:

- Direct OAuth for major platforms
- Phyllo for 3+ additional platforms
- Email verification as final step

**Estimated Approval Time**: 2-3 weeks

---

### Use Case: Competitor Monitoring

**Recommended Approach**:

1. **Historical Data**: Social Blade (YouTube, Twitch, Instagram growth)
2. **Current Metrics**: Apify or Bright Data for periodic snapshots
3. **Manual Tracking**: Google Alerts for brand mentions

**Recommended Stack**:

- Social Blade API for historical trends
- Apify for weekly competitor snapshots
- Google Alerts for news

**Estimated Cost**: $0-100/month

---

### Use Case: Multi-Platform Integration (3+ platforms)

**Recommended Approach**:

1. **Phyllo**: For 50+ supported platforms
2. **Direct OAuth**: For missing platforms or high-volume data
3. **RapidAPI**: For supplementary data APIs

**Recommended Stack**:

- Phyllo for aggregation
- Custom OAuth for Instagram/YouTube/TikTok/Twitch
- RapidAPI for supplementary data

**Estimated Cost**: $1000-5000/month (at scale)

---

## SECURITY & COMPLIANCE CONSIDERATIONS

### OAuth 2.0 Best Practices

1. **Use Authorization Code Flow**: Never expose client secrets in frontend
2. **PKCE for Mobile**: Proof Key for Code Exchange required for mobile apps
3. **Token Storage**: Store access tokens securely (encrypted database, never in localStorage)
4. **Token Expiration**: Implement refresh token logic and token expiration
5. **Scope Minimization**: Request only necessary scopes
6. **HTTPS Required**: All OAuth redirects must be over HTTPS
7. **State Parameter**: Always use state parameter to prevent CSRF attacks

### API Key Security

1. **Environment Variables**: Store API keys in .env files, never in code
2. **Rotation**: Rotate API keys regularly (quarterly minimum)
3. **Restricted Keys**: Use platform-specific restricted keys when available
4. **Monitoring**: Log and monitor API key usage
5. **Revocation**: Have process to immediately revoke compromised keys

### Data Privacy

1. **GDPR Compliance**: Request user consent for data collection
2. **Data Retention**: Delete personal data after retention period expires
3. **Third-Party Sharing**: Only share data with explicit consent
4. **Encryption**: Encrypt sensitive data in transit and at rest
5. **Terms of Service**: Respect each platform's ToS (no unauthorized scraping)

### Rate Limiting Strategy

1. **Implement Backoff**: Exponential backoff on 429 responses
2. **Queue System**: Use job queues for API calls (BullMQ, Celery)
3. **Caching**: Cache responses to reduce API calls
4. **Batch Requests**: Use batch endpoints where available
5. **Monitoring**: Track API usage to stay below limits

---

## COMMON PITFALLS & SOLUTIONS

### Pitfall: TikTok Approval Taking 3+ Weeks

**Solution**:

- Apply early (anticipate long wait times)
- Provide clear use case in application
- Consider building with test account while awaiting approval
- Have fallback plan using Phyllo or Apify

### Pitfall: Instagram Graph API Approval Rejection

**Solution**:

- Ensure app is verified (submit documents)
- Test with limited endpoints first
- Start with basic display API before graph API
- Document exact use case clearly
- Check Facebook developer status page for API changes

### Pitfall: Rate Limiting Errors in Production

**Solution**:

- Implement exponential backoff
- Use job queues for API calls
- Cache responses (Redis)
- Monitor usage in real-time
- Upgrade to higher tier if available

### Pitfall: API Discontinuation (Substack, Medium, etc.)

**Solution**:

- Always have fallback plan (Phyllo, scraping, manual)
- Monitor API status pages
- Build loosely coupled integrations
- Use abstraction layer for platform switching

### Pitfall: Scraping Getting Blocked

**Solution**:

- Use residential proxies (Bright Data)
- Implement delays between requests
- Rotate user agents
- Consider official APIs or aggregators
- Respect robots.txt and Terms of Service

---

## CONCLUSION

**Key Takeaways**:

1. **Official APIs are Always Better**: Use official OAuth when available
2. **Approval Times Vary**: TikTok (2-3 weeks), Twitter/X (1-7 days), others immediate
3. **Use Phyllo for Creators**: Best aggregator for 50+ creator platforms
4. **Cost Matters**: Be mindful of per-API-call costs (Etsy, X Premium)
5. **Have Fallbacks**: Scraping services for APIs that don't exist
6. **Security First**: Use OAuth 2.0, environment variables, and follow best practices

**Recommended Stack for Most Applications**:

- **Primary**: Direct OAuth for Instagram, YouTube, TikTok, Twitch, Twitter/X
- **Secondary**: Phyllo for Patreon, Substack, and other creator platforms
- **Tertiary**: Social Blade for historical analytics
- **Fallback**: Apify for platforms without official APIs

---

## ADDITIONAL RESOURCES

- **OAuth 2.0 Standard**: https://tools.ietf.org/html/rfc6749
- **PKCE (RFC 7636)**: https://tools.ietf.org/html/rfc7636
- **OpenID Connect**: https://openid.net/connect/
- **API Security**: https://owasp.org/www-project-api-security/
- **Platform Documentation**:
  - Meta: developers.facebook.com
  - Google: developers.google.com
  - Twitter/X: developer.x.com
  - TikTok: developers.tiktok.com
  - LinkedIn: linkedin.com/developers
  - Shopify: shopify.dev
  - Stripe: stripe.com/docs/api

---

**Document Version**: 1.0
**Last Updated**: March 19, 2026
**Author**: Research Assistant
**Status**: Complete

For updates, corrections, or platform additions, refer to official platform documentation and changelog.
