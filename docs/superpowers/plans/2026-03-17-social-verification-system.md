# Social Platform Verification System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional social account verification system where talent who connect platforms via OAuth/API get score boosts (+5%/+3% per platform, capped at 30%), verified badges, and better discovery visibility.

**Architecture:** New `connected_platforms` and `platform_catalog` tables in Supabase. Boost is calculated on connect/disconnect and cached on the `talents` row. Client-side applies multiplicative boost to display scores. ConnectAccounts page rewritten with 48-platform catalog grouped by talent category.

**Tech Stack:** React, Supabase (Postgres + Edge Functions), TanStack React Query, Radix UI, Tailwind CSS, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-03-17-social-verification-system-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/004_social_verification.sql` | Create | Schema: new tables, columns, RLS, indexes |
| `src/lib/verificationBoost.js` | Create | Pure functions: boost calculation, score display |
| `src/lib/__tests__/verificationBoost.test.js` | Create | Tests for boost logic |
| `src/data/platformCatalog.js` | Create | Static 48-platform catalog data |
| `src/pages/ConnectAccounts.jsx` | Rewrite | Full platform connection page |
| `src/api/base44Client.js` | Modify | Add entity map entries |
| `supabase/functions/_shared/supabase.ts` | Modify | Add entity map entries |
| `src/components/talent/TalentCard.jsx` | Modify | Add verified badge + ring |
| `src/components/talent/TalentFilters.jsx` | Modify | Add verified filter |
| `src/pages/TalentDiscovery.jsx` | Modify | Apply boosted scores |
| `src/components/talent/TalentProfileModal.jsx` | Modify | Add platforms tab |
| `src/pages/TalentProfile.jsx` | Modify | Add connected platforms section |
| `src/Layout.jsx` | Modify | Add ConnectAccounts to brand/agency nav |
| `src/lib/routePermissions.js` | Modify | Add ConnectAccounts to brand/agency |

---

### Task 1: Database Schema & Migration

**Files:**
- Create: `supabase/migrations/004_social_verification.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- 004_social_verification.sql
-- Social platform verification system

-- 1. New tables
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

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_connected_platforms_talent ON connected_platforms(talent_id);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_platform ON connected_platforms(platform);

-- 3. Talent table additions
ALTER TABLE talents ADD COLUMN IF NOT EXISTS verified_platforms_count INTEGER DEFAULT 0;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS verification_boost NUMERIC DEFAULT 0;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 4. RLS
ALTER TABLE platform_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON connected_platforms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON connected_platforms FOR ALL TO anon USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Run migration against live Supabase**

Run: `SUPABASE_ACCESS_TOKEN=sbp_26449e5850a7cce86a4c861bb4c1b2eb2db72c09 npx supabase db query --linked -f supabase/migrations/004_social_verification.sql`

Expected: Empty result (no errors).

- [ ] **Step 3: Seed platform_catalog with 48 platforms**

Write a seed script `supabase/seed_platforms.sql` with INSERT statements for all 48 platforms from the spec, grouped by category with correct auth_type values (oauth/api_gated/manual).

- [ ] **Step 4: Run seed against live Supabase**

Run: `SUPABASE_ACCESS_TOKEN=sbp_26449e5850a7cce86a4c861bb4c1b2eb2db72c09 npx supabase db query --linked -f supabase/seed_platforms.sql`

- [ ] **Step 5: Add entity map entries**

In `src/api/base44Client.js`, add to `ENTITY_TABLE_MAP`:
```javascript
ConnectedPlatform: 'connected_platforms',
PlatformCatalog: 'platform_catalog',
```

In `supabase/functions/_shared/supabase.ts`, add to `TABLE_MAP`:
```javascript
ConnectedPlatform: 'connected_platforms',
PlatformCatalog: 'platform_catalog',
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/004_social_verification.sql supabase/seed_platforms.sql src/api/base44Client.js supabase/functions/_shared/supabase.ts
git commit -m "feat: add social verification schema, platform catalog, and entity mappings"
```

---

### Task 2: Boost Calculation Logic + Tests

**Files:**
- Create: `src/lib/verificationBoost.js`
- Create: `src/lib/__tests__/verificationBoost.test.js`

- [ ] **Step 1: Write the test file**

```javascript
// src/lib/__tests__/verificationBoost.test.js
import { describe, it, expect } from 'vitest';
import {
  calculateBoost,
  applyAlphaBoost,
  applySafetyBoost,
  getVerificationLevel,
  getNextBoostMessage,
} from '@/lib/verificationBoost';

describe('calculateBoost', () => {
  it('returns 0 for no platforms', () => {
    expect(calculateBoost(0, 0)).toBe(0);
  });
  it('returns 5 per oauth platform', () => {
    expect(calculateBoost(3, 0)).toBe(15);
  });
  it('returns 3 per api platform', () => {
    expect(calculateBoost(0, 2)).toBe(6);
  });
  it('combines oauth and api', () => {
    expect(calculateBoost(2, 1)).toBe(13); // 10 + 3
  });
  it('caps at 30', () => {
    expect(calculateBoost(10, 10)).toBe(30);
  });
});

describe('applyAlphaBoost', () => {
  it('multiplies score by boost', () => {
    expect(applyAlphaBoost(1.5, 15)).toBeCloseTo(1.725);
  });
  it('returns raw score when boost is 0', () => {
    expect(applyAlphaBoost(2.0, 0)).toBe(2.0);
  });
});

describe('applySafetyBoost', () => {
  it('multiplies and caps at 100', () => {
    expect(applySafetyBoost(95, 15)).toBe(100);
  });
  it('multiplies normally below cap', () => {
    expect(applySafetyBoost(80, 10)).toBeCloseTo(88);
  });
});

describe('getVerificationLevel', () => {
  it('returns Unverified for 0', () => {
    expect(getVerificationLevel(0)).toBe('Unverified');
  });
  it('returns Basic for 1-2', () => {
    expect(getVerificationLevel(2)).toBe('Basic');
  });
  it('returns Verified for 3-4', () => {
    expect(getVerificationLevel(4)).toBe('Verified');
  });
  it('returns Super Verified for 5+', () => {
    expect(getVerificationLevel(6)).toBe('Super Verified');
  });
});

describe('getNextBoostMessage', () => {
  it('shows encouragement at 0', () => {
    expect(getNextBoostMessage(0, 0)).toContain('Connect');
  });
  it('shows current boost and next step', () => {
    const msg = getNextBoostMessage(3, 15);
    expect(msg).toContain('15%');
  });
  it('shows max message at 30', () => {
    expect(getNextBoostMessage(6, 30)).toContain('maximum');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/verificationBoost.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```javascript
// src/lib/verificationBoost.js

export function calculateBoost(oauthCount, apiCount) {
  return Math.min((oauthCount * 5) + (apiCount * 3), 30);
}

export function applyAlphaBoost(score, boost) {
  return score * (1 + boost / 100);
}

export function applySafetyBoost(score, boost) {
  return Math.min(score * (1 + boost / 100), 100);
}

export function getVerificationLevel(verifiedCount) {
  if (verifiedCount === 0) return 'Unverified';
  if (verifiedCount <= 2) return 'Basic';
  if (verifiedCount <= 4) return 'Verified';
  return 'Super Verified';
}

export function getNextBoostMessage(verifiedCount, currentBoost) {
  if (currentBoost >= 30) return 'You have the maximum 30% discovery boost!';
  if (verifiedCount === 0) return 'Connect a social account to start earning discovery boosts.';
  const next = Math.min(currentBoost + 5, 30);
  return `You have ${verifiedCount} verified platform${verifiedCount > 1 ? 's' : ''} — +${currentBoost}% discovery boost. Connect 1 more for +${next}%`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/verificationBoost.test.js`
Expected: All 14 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/verificationBoost.js src/lib/__tests__/verificationBoost.test.js
git commit -m "feat: add verification boost calculation logic with tests"
```

---

### Task 3: Platform Catalog Data File

**Files:**
- Create: `src/data/platformCatalog.js`

- [ ] **Step 1: Create the static catalog**

Create `src/data/platformCatalog.js` containing all 48 platforms as a JS array. Each entry has: `slug`, `name`, `category`, `authType` (oauth/api_gated/manual), `iconName`. Group by the 11 categories from the spec.

Categories: `content_creator`, `photo_visual`, `musician`, `gaming`, `actors`, `fitness`, `writers`, `beauty_fashion`, `athletes`, `educators`, `design`.

- [ ] **Step 2: Export category metadata**

Export `PLATFORM_CATEGORIES` — an array of `{ key, label, icon }` for the 11 categories, used by the ConnectAccounts tabs.

Export `AUTH_TYPE_LABELS` — `{ oauth: 'OAuth Verified', api_gated: 'API Verified', manual: 'Manual Entry' }`.

- [ ] **Step 3: Commit**

```bash
git add src/data/platformCatalog.js
git commit -m "feat: add 48-platform catalog data with category metadata"
```

---

### Task 4: ConnectAccounts Page Rewrite

**Files:**
- Rewrite: `src/pages/ConnectAccounts.jsx`

- [ ] **Step 1: Read the existing ConnectAccounts.jsx**

Read `src/pages/ConnectAccounts.jsx` to understand the current structure (9 hardcoded platforms, OAuthModal, mock stats).

- [ ] **Step 2: Rewrite the page**

The new page structure:
1. Header with verification level progress bar
2. Incentive banner (from `getNextBoostMessage`)
3. Category tabs (11 categories from `PLATFORM_CATEGORIES`)
4. Platform grid filtered by selected category tab
5. Each card shows: platform name, auth type badge (green shield/yellow key/gray pencil), connected status, username if connected, followers/engagement if synced
6. Click to connect triggers OAuth modal (existing pattern) or manual entry form
7. On connect: insert into `connected_platforms` via `supabase`, then recalculate boost on `talents` table
8. On disconnect: delete from `connected_platforms`, recalculate boost

Key queries:
- `supabase.from('platform_catalog').select('*').order('category')` — load catalog
- `supabase.from('connected_platforms').select('*').eq('talent_id', user.id)` — load connected
- After connect/disconnect: run boost recalculation UPDATE on talents

- [ ] **Step 3: Verify build**

Run: `npx vite build`
Expected: Build passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ConnectAccounts.jsx
git commit -m "feat: rewrite ConnectAccounts with 48-platform catalog and verification boost"
```

---

### Task 5: Verified Badge on TalentCard

**Files:**
- Modify: `src/components/talent/TalentCard.jsx`

- [ ] **Step 1: Read TalentCard.jsx**

Read `src/components/talent/TalentCard.jsx` (115 lines). Find where the talent name is rendered and where the avatar is.

- [ ] **Step 2: Add verified badge + avatar ring**

Add next to the talent name:
```jsx
{talent.is_verified && (
  <span title={`${talent.verified_platforms_count} platforms verified`} className="inline-flex items-center">
    <ShieldCheck className="w-4 h-4 text-indigo-500" />
  </span>
)}
```

Add indigo ring on avatar when verified:
```jsx
className={`... ${talent.is_verified ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
```

Import `ShieldCheck` from `lucide-react`.

- [ ] **Step 3: Add boosted score display**

Import `applyAlphaBoost, applySafetyBoost` from `@/lib/verificationBoost`. Where scores are displayed, show boosted values with a small "+X%" indicator when `verification_boost > 0`.

- [ ] **Step 4: Verify build**

Run: `npx vite build`

- [ ] **Step 5: Commit**

```bash
git add src/components/talent/TalentCard.jsx
git commit -m "feat: add verified badge and boosted scores to TalentCard"
```

---

### Task 6: Verified Filter in TalentFilters

**Files:**
- Modify: `src/components/talent/TalentFilters.jsx`

- [ ] **Step 1: Read TalentFilters.jsx**

Read the file (169 lines). Find the filter chip sections.

- [ ] **Step 2: Add verified filter**

Add a new filter section "Verification" with 3 chips: All, Verified Only, Unverified Only. The filter value maps to: `all` (no filter), `verified` (`is_verified = true`), `unverified` (`is_verified = false`).

Add `verified: 'all'` to the filters object that the parent component manages.

- [ ] **Step 3: Verify build**

Run: `npx vite build`

- [ ] **Step 4: Commit**

```bash
git add src/components/talent/TalentFilters.jsx
git commit -m "feat: add verified filter toggle to TalentFilters"
```

---

### Task 7: Apply Verified Filter in TalentDiscovery

**Files:**
- Modify: `src/pages/TalentDiscovery.jsx`

- [ ] **Step 1: Read TalentDiscovery.jsx**

Find the filtering logic where `DEFAULT_FILTERS` is defined and where `filtered` array is computed.

- [ ] **Step 2: Add verified filter to DEFAULT_FILTERS**

Add `verified: 'all'` to `DEFAULT_FILTERS`.

- [ ] **Step 3: Add filter logic**

In the `filtered` useMemo, add:
```javascript
if (filters.verified === 'verified' && !t.is_verified) return false;
if (filters.verified === 'unverified' && t.is_verified) return false;
```

- [ ] **Step 4: Apply boosted scores to display**

Import boost functions. In the talent list rendering, pass boosted scores:
```javascript
const displayAlpha = applyAlphaBoost(t.discovery_alpha_score, t.verification_boost || 0);
```

- [ ] **Step 5: Verify build**

Run: `npx vite build`

- [ ] **Step 6: Commit**

```bash
git add src/pages/TalentDiscovery.jsx
git commit -m "feat: apply verified filter and boosted scores in TalentDiscovery"
```

---

### Task 8: Connected Platforms in TalentProfileModal

**Files:**
- Modify: `src/components/talent/TalentProfileModal.jsx`

- [ ] **Step 1: Read TalentProfileModal.jsx**

Read the file (535 lines). Find the 6 existing tabs.

- [ ] **Step 2: Add "Platforms" data query**

Add a useQuery for connected platforms:
```javascript
const { data: connectedPlatforms = [] } = useQuery({
  queryKey: ['connected-platforms', talent?.id],
  queryFn: async () => {
    if (!talent?.id) return [];
    const { data } = await supabase.from('connected_platforms').select('*').eq('talent_id', talent.id);
    return data || [];
  },
  enabled: !!talent?.id,
});
```

- [ ] **Step 3: Add connected platforms display to the Platforms tab**

In the existing Platforms tab, add a section showing verified connected accounts with follower counts, engagement rates, and verification badges. Show the verification level and boost percentage.

- [ ] **Step 4: Verify build**

Run: `npx vite build`

- [ ] **Step 5: Commit**

```bash
git add src/components/talent/TalentProfileModal.jsx
git commit -m "feat: show connected platforms and verification boost in TalentProfileModal"
```

---

### Task 9: Connected Platforms in TalentProfile Page

**Files:**
- Modify: `src/pages/TalentProfile.jsx`

- [ ] **Step 1: Read TalentProfile.jsx**

Understand the existing sections (expertise, collaboration types, availability, portfolio).

- [ ] **Step 2: Add connected platforms section**

Add a "Connected Platforms" card that:
- Shows a verification progress bar (using `getVerificationLevel`)
- Lists connected platforms with status badges
- Links to ConnectAccounts page with "Connect More" button
- Shows current boost percentage

- [ ] **Step 3: Verify build**

Run: `npx vite build`

- [ ] **Step 4: Commit**

```bash
git add src/pages/TalentProfile.jsx
git commit -m "feat: add connected platforms section to TalentProfile"
```

---

### Task 10: Navigation & Route Permissions

**Files:**
- Modify: `src/Layout.jsx`
- Modify: `src/lib/routePermissions.js`

- [ ] **Step 1: Add ConnectAccounts to brand and agency nav in Layout.jsx**

Find the `brand` and `agency` role arrays. Add:
```javascript
{ name: "Connect Accounts", icon: Link2, page: "ConnectAccounts" },
```
Place it near the end, before Integrations/Settings. (Already present in `admin` and `talent`.)

- [ ] **Step 2: Add ConnectAccounts to brand and agency in routePermissions.js**

Add `'ConnectAccounts'` to the `brand` and `agency` sets (already in `admin` and `talent`).

- [ ] **Step 3: Verify build**

Run: `npx vite build`

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests pass including the new verificationBoost tests.

- [ ] **Step 5: Commit**

```bash
git add src/Layout.jsx src/lib/routePermissions.js
git commit -m "feat: add ConnectAccounts to brand and agency navigation and permissions"
```

---

### Task 11: Redeploy Edge Functions

**Files:**
- Modify: `supabase/functions/_shared/supabase.ts` (already done in Task 1)

- [ ] **Step 1: Redeploy all functions**

Run: `SUPABASE_ACCESS_TOKEN=sbp_26449e5850a7cce86a4c861bb4c1b2eb2db72c09 npx supabase functions deploy --no-verify-jwt --project-ref eiygbtpsfumwvhzbudij`

Expected: "Deployed Functions on project eiygbtpsfumwvhzbudij: ..." with no errors.

- [ ] **Step 2: Final build verification**

Run: `npx vite build`
Expected: Build passes.

- [ ] **Step 3: Final test verification**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: complete social verification system — 48 platforms, boost scoring, verified badges"
```
