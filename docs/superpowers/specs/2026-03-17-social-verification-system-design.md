# Social Platform Verification & Scoring System

## Overview

Optional but incentivized social account verification system. Talent who connect their social accounts via OAuth get a verified badge, higher discovery scores, and better visibility. Signup stays frictionless — verification is a reward, not a gate.

## Boost Formula

- OAuth-verified platform: **+5%** per platform
- API-gated platform: **+3%** per platform
- Manual entry: **+0%** (visible on profile, no score boost)
- **Cap: 30% maximum**

Explicit calculation:
```
oauth_count = COUNT(connected_platforms WHERE auth_method = 'oauth')
api_count = COUNT(connected_platforms WHERE auth_method = 'api_key')
verification_boost = MIN((oauth_count * 5) + (api_count * 3), 30)
```

Boost applies to:
- `discovery_alpha_score` — multiplicative: `score * (1 + boost/100)`. Example: 1.5x alpha + 15% boost = 1.725x
- `brand_safety_score` — multiplicative: `MIN(score * (1 + boost/100), 100)`. Example: 85 + 15% boost = 97.75, capped at 100
- `match_score` on partnerships — +5 flat points for verified talent, applied at partnership creation time in the MatchEngine and `predictPartnershipSuccess` edge function

## Database Schema

### Migration file: `supabase/migrations/004_social_verification.sql`

### New table: `connected_platforms`

```sql
CREATE TABLE IF NOT EXISTS connected_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_category TEXT,
  auth_method TEXT NOT NULL DEFAULT 'manual',
  verified BOOLEAN DEFAULT false,
  username TEXT,
  followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(talent_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_connected_platforms_talent ON connected_platforms(talent_id);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_platform ON connected_platforms(platform);
```

### New table: `platform_catalog`

```sql
CREATE TABLE IF NOT EXISTS platform_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'manual',
  icon_name TEXT,
  api_available BOOLEAN DEFAULT false,
  oauth_provider TEXT,
  scopes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Changes to `talents` table

```sql
ALTER TABLE talents ADD COLUMN IF NOT EXISTS verified_platforms_count INTEGER DEFAULT 0;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS verification_boost NUMERIC DEFAULT 0;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
```

### RLS policies

```sql
-- Disable RLS on platform_catalog (public reference data)
ALTER TABLE platform_catalog DISABLE ROW LEVEL SECURITY;

-- Enable RLS on connected_platforms with full access for authenticated + anon read
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON connected_platforms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON connected_platforms FOR ALL TO anon USING (true) WITH CHECK (true);
```

### Entity map entries (base44Client.js)

```javascript
ConnectedPlatform: 'connected_platforms',
PlatformCatalog: 'platform_catalog',
```

### Shared module entries (supabase/functions/_shared/supabase.ts)

```javascript
ConnectedPlatform: 'connected_platforms',
PlatformCatalog: 'platform_catalog',
```

## Auth Method Classification

### OAuth-verified (+5% each) — 17 platforms
YouTube, Instagram, Facebook, Twitch, Pinterest, Patreon, Strava, SoundCloud, Behance, Dribbble, DeviantArt, Medium, Reddit, Mixcloud, Discord, Bluesky, Threads

### API-gated (+3% each) — 4 platforms
Twitter/X, Spotify, TikTok, LinkedIn

### Manual entry (+0%) — 27 platforms
Bandcamp, ArtStation, Hudl, Substack, Audiomack, Reverbnation, VSCO, 500px, Kick, Steam, Battlefy, Casting Networks, Peloton, TrainerRoad, MyFitnessPal, Garmin Connect, Teachable, Kajabi, Quora, Adobe Portfolio, LTK, ShopMy, Rumble, Dailymotion, Triller, Apple Music, Apple Podcasts

**Total: 48 unique platforms across 11 categories.**

## Platform Categories

| Category | Platforms |
|---|---|
| Content Creators & Video | YouTube, TikTok, Instagram Reels, Facebook, Rumble, Dailymotion, Triller |
| Photo & Visual Artists | Instagram, Pinterest, VSCO, Behance, DeviantArt, ArtStation, 500px |
| Musicians & Audio | Spotify, SoundCloud, Apple Music, Bandcamp, Audiomack, Reverbnation, Mixcloud |
| Gaming & Esports | Twitch, YouTube Gaming, Kick, Discord, Steam, Battlefy |
| Actors & Performers | YouTube, TikTok, Instagram, IMDb, Casting Networks, Facebook |
| Fitness & Wellness | Instagram, TikTok, YouTube, Peloton, Strava, MyFitnessPal |
| Writers & Podcasters | Substack, Medium, Twitter/X, LinkedIn, Patreon, Spotify Podcasts, Apple Podcasts, RSS/Anchor |
| Beauty, Fashion & Lifestyle | Instagram, TikTok, Pinterest, YouTube, LTK, ShopMy |
| Athletes & Sports | Instagram, Twitter/X, TikTok, YouTube, Strava, Hudl |
| Educators & Thought Leaders | LinkedIn, Twitter/X, YouTube, Substack, Medium, Teachable, Quora |
| Graphic Design & Motion | Behance, Dribbble, ArtStation, Adobe Portfolio, Instagram |

## UI Changes

### ConnectAccounts page (rewrite)
- Full 48-platform catalog grouped by talent category tabs
- Talent self-selects their category to surface relevant platforms first
- Platform cards show auth method: green shield (OAuth), yellow key (API), gray pencil (manual)
- Progress bar: 0 = "Unverified", 1-2 = "Basic", 3-4 = "Verified", 5+ = "Super Verified"
- Incentive banner: "You have 3 verified platforms — +15% discovery boost. Connect 1 more for +20%"
- All 3 user roles (Brand, Talent, Agency) can access this page

### TalentCard
- Blue checkmark shield badge next to name when `is_verified = true`
- Badge tooltip: "X platforms verified"
- Indigo ring on avatar for verified talent

### TalentDiscovery
- New "Verified" filter: All / Verified Only / Unverified Only

### TalentProfile
- "Connected Platforms" section showing linked accounts with live stats
- Verification progress bar

### Score Display
- Discovery alpha and brand safety show "+X%" badge when boost applied
- Tooltip: "Includes +15% verification boost from 3 connected platforms"

## Scoring & Ranking Logic

### Boost recalculation
Triggered on connect/disconnect. Simple UPDATE on talents table:
```sql
-- Recalculate for a specific talent
UPDATE talents SET
  verified_platforms_count = (
    SELECT COUNT(*) FROM connected_platforms
    WHERE talent_id = talents.id AND auth_method IN ('oauth', 'api_key')
  ),
  verification_boost = LEAST(
    (SELECT COUNT(*) FROM connected_platforms WHERE talent_id = talents.id AND auth_method = 'oauth') * 5
    + (SELECT COUNT(*) FROM connected_platforms WHERE talent_id = talents.id AND auth_method = 'api_key') * 3,
    30
  ),
  is_verified = EXISTS(
    SELECT 1 FROM connected_platforms
    WHERE talent_id = talents.id AND auth_method IN ('oauth', 'api_key')
  )
WHERE id = :talent_id;
```

### Display scores (client-side only, never persisted)
```javascript
const boostedAlpha = talent.discovery_alpha_score * (1 + talent.verification_boost / 100);
const boostedSafety = Math.min(talent.brand_safety_score * (1 + talent.verification_boost / 100), 100);
```

### Match score boost
Applied in MatchEngine and `predictPartnershipSuccess` edge function at partnership creation:
```javascript
const matchBonus = talent.is_verified ? 5 : 0;
const finalMatchScore = baseMatchScore + matchBonus;
```

### Industry fairness
- Boost is per-verified-connection, not per-platform-size
- A verified Mixcloud DJ gets the same per-platform boost as a verified YouTube creator
- Categories with fewer OAuth-available platforms aren't penalized — discovery_alpha already accounts for niche
- No minimum platform requirement — even 1 verified connection earns the badge and boost
- Both multiplicative boosts (alpha and safety) scale proportionally, preventing low-score talent from getting disproportionate jumps

### Sort behavior
- Default TalentDiscovery sort uses discovery_alpha_score
- Boost naturally pushes verified talent higher without a separate sort mechanism
- "Verified Only" filter queries `is_verified = true`

## Files to Create/Modify

### New files
- `supabase/migrations/004_social_verification.sql` — schema changes
- `src/pages/ConnectAccounts.jsx` — rewrite with full platform catalog

### Modified files
- `src/api/base44Client.js` — add `ConnectedPlatform: 'connected_platforms'`, `PlatformCatalog: 'platform_catalog'`
- `supabase/functions/_shared/supabase.ts` — add same entity mappings
- `src/components/talent/TalentCard.jsx` — add verified badge + indigo ring
- `src/components/talent/TalentFilters.jsx` — add verified filter toggle
- `src/components/talent/TalentProfileModal.jsx` — add connected platforms section
- `src/pages/TalentProfile.jsx` — add connected platforms section + progress bar
- `src/pages/TalentDiscovery.jsx` — apply boost to displayed scores
- `src/lib/routePermissions.js` — ensure ConnectAccounts in brand and agency roles
- `src/Layout.jsx` — add ConnectAccounts to brand and agency nav (already in talent + admin)
