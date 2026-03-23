# Landing Page Warm Luxury Theme — Design Spec

**Date:** 2026-03-22
**Status:** Reviewed
**Author:** Claude + DealStage Owner

---

## Goal

Shift all public-facing DealStage pages from flat near-black (`#080807`) to warm dark slate (`#1c1b19`) to create a luxury feel that is inviting, readable, and aesthetically premium — while keeping the dashboard/app content area untouched.

## Motivation

The current all-black landing page (`#080807`) reads as flat and can strain eyes when reading longer sections. Visitors scanning pricing tables, feature descriptions, and testimonials need text that breathes. A warm dark slate base (`#1c1b19`) adds depth and warmth without losing the luxury positioning. Combined with brighter gold accents (`#d4b04e`), the page will feel like candlelight rather than darkness — still exclusive, but inviting.

## Scope

**In scope — ALL public-facing pages:**

- Landing page (LandingPage.jsx) background, card, and surface colors
- Landing page gold/amber accent brightness
- Animated walkthrough component colors
- 404 page (NotFound.jsx)
- All 10 Feature marketing pages (FeatureBrowseTalent, FeatureCampaignAnalytics, etc.)
- All public pages: About, Blog, Careers, Contact, Customers, CookiePolicy, GDPR, Demo
- Login page and Check Email page
- Onboarding page
- Sidebar warmth adjustment (subtle, `#0a0a09` → `#121110`)
- `useTheme.js` dark theme object (including gradient fallback on line 63)
- `index.css` dark theme CSS variables (sidebar only)

**Out of scope:**

- Dashboard main content area — stays as-is
- Layout, typography, spacing, animations — unchanged
- Amber accent (`#e07b18`) — already warm enough
- Landing page structure and component hierarchy
- Light/gradient theme definitions (except the `#080807` fallback in useTheme.js)
- Dashboard-only pages (Settings.jsx has `#0f0f0d` but is not public-facing — skip)

## Color Palette Changes

### Master Color Map

| Token          | Current                                             | Proposed                                            | Purpose                            |
| -------------- | --------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| `bg`           | `#080807`                                           | `#1c1b19`                                           | Page background                    |
| `bg2`          | `#0f0f0d`                                           | `#232220`                                           | Card/section backgrounds           |
| `bg3`          | `#161613`                                           | `#2a2826`                                           | Elevated surfaces, hover states    |
| `gold`         | `#c4a24a`                                           | `#d4b04e`                                           | Primary gold accent                |
| `goldDim`      | `rgba(196,162,74,0.11)`                             | `rgba(212,176,78,0.13)`                             | Gold glow/background tint          |
| `goldRgb`      | `196,162,74`                                        | `212,176,78`                                        | Gold in rgba() gradient references |
| `text`         | `#f5f0e6`                                           | `#f5f0e6`                                           | **Unchanged** — primary text       |
| `textMuted`    | `rgba(245,240,230,0.56)`                            | `rgba(245,240,230,0.60)`                            | Muted text — slightly brighter     |
| `textDim`      | `rgba(245,240,230,0.28)`                            | `rgba(245,240,230,0.28)`                            | **Unchanged** — dim labels         |
| `border`       | `rgba(255,248,220,0.07)`                            | `rgba(255,248,220,0.09)`                            | Subtle borders                     |
| `border2`      | `rgba(255,248,220,0.13)`                            | `rgba(255,248,220,0.15)`                            | Stronger borders                   |
| `amber`        | `#e07b18`                                           | `#e07b18`                                           | **Unchanged** — amber accent       |
| `goldGradient` | `linear-gradient(135deg, #c4a24a 0%, #e07b18 100%)` | `linear-gradient(135deg, #d4b04e 0%, #e07b18 100%)` | Gold-to-amber gradient             |

**Text-on-gradient rule:** Instances of `#080807` used as **text color on gold gradient buttons/badges** should update to `#1c1b19` to match the new base tone. These sit on gold backgrounds so the contrast remains strong.

### useTheme.js Dark Theme Object

| Property      | Current                  | Proposed                 |
| ------------- | ------------------------ | ------------------------ |
| `bg`          | `#080807`                | `#1c1b19`                |
| `bg2`         | `#0f0f0d`                | `#232220`                |
| `bg3`         | `#161613`                | `#2a2826`                |
| `surface`     | `rgba(255,248,220,0.03)` | `rgba(255,248,220,0.05)` |
| `border`      | `rgba(255,248,220,0.07)` | `rgba(255,248,220,0.09)` |
| `border2`     | `rgba(255,248,220,0.13)` | `rgba(255,248,220,0.15)` |
| `gold`        | `#c4a24a`                | `#d4b04e`                |
| `goldDim`     | `rgba(196,162,74,0.11)`  | `rgba(212,176,78,0.13)`  |
| `textMuted`   | `rgba(245,240,230,0.56)` | `rgba(245,240,230,0.60)` |
| `sidebar`     | `#0a0a09`                | `#121110`                |
| `cardBg`      | `rgba(255,248,220,0.03)` | `rgba(255,248,220,0.05)` |
| `inputBg`     | `rgba(255,248,220,0.03)` | `rgba(255,248,220,0.05)` |
| `inputBorder` | `rgba(255,248,220,0.1)`  | `rgba(255,248,220,0.12)` |

**Also fix line 63 gradient fallback:** `"#080807"` → `"#1c1b19"` in the `theme.bg.startsWith("linear")` branch.

Properties NOT changing: `text`, `textDim`, `amber`, `sidebarText`, `key`, `label`, `logo`, `mark`.

### LandingPage.jsx CSS Variable Block (~line 320-340)

The landing page defines its own CSS custom properties in a `<style>` block:

```css
--ds-bg: #080807;    → #1c1b19
--ds-bg2: #0f0f0d;   → #232220
--ds-bg3: #161613;   → #2a2826
--ds-gold: #c4a24a;  → #d4b04e
--ds-ga: linear-gradient(135deg, #c4a24a 0%, #e07b18 100%);  → update #c4a24a to #d4b04e
```

These are separate from `useTheme.js` and must be updated independently.

### index.css Dark Theme Variables

Only the sidebar variable changes:

| Variable               | Current                | Proposed               |
| ---------------------- | ---------------------- | ---------------------- |
| `--sidebar-background` | `40 5% 4%` (`#0c0b0a`) | `40 4% 7%` (`#121110`) |

Note: The CSS variable (`#0c0b0a`) and the JS theme object (`#0a0a09`) currently disagree on the sidebar color. Both converge to `#121110` after this change.

All other CSS variables in `.dark` stay the same — the dashboard content area is unaffected.

## Files to Modify

### Core theme files

| File                    | What Changes                                              |
| ----------------------- | --------------------------------------------------------- |
| `src/hooks/useTheme.js` | Update `dark` theme object + gradient fallback on line 63 |
| `src/index.css`         | Update `--sidebar-background` in `.dark` block            |

### Landing page components

| File                                             | What Changes                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `src/components/landing/LandingPage.jsx`         | Update CSS variable block + all hardcoded `#080807`, `#0f0f0d`, `#c4a24a`, `rgba(196,162,74,...)` |
| `src/components/landing/AnimatedWalkthrough.jsx` | Update all hardcoded bg colors + `rgba(196,162,74,...)` gradient refs                             |
| `src/components/landing/LandingSections.jsx`     | Update any hardcoded dark colors                                                                  |

### Feature marketing pages (all have local `DS` color constants)

| File                                     | What Changes                     |
| ---------------------------------------- | -------------------------------- |
| `src/pages/FeatureBrowseTalent.jsx`      | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureCampaignAnalytics.jsx` | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureSendDeals.jsx`         | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureManageDeals.jsx`       | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureManageTalent.jsx`      | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureTalentDiscovery.jsx`   | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureDealPipeline.jsx`      | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureMediaKits.jsx`         | Update `DS` const: bg, bg2, gold |
| `src/pages/FeaturePayments.jsx`          | Update `DS` const: bg, bg2, gold |
| `src/pages/FeatureIntegrations.jsx`      | Update `DS` const: bg, bg2, gold |

### Other public pages

| File                         | What Changes                            |
| ---------------------------- | --------------------------------------- |
| `src/pages/NotFound.jsx`     | Update `#080807` bg + gold to `#d4b04e` |
| `src/pages/About.jsx`        | Update hardcoded `#080807`, `#c4a24a`   |
| `src/pages/Blog.jsx`         | Update hardcoded bg + gold colors       |
| `src/pages/Careers.jsx`      | Update hardcoded bg + gold colors       |
| `src/pages/Contact.jsx`      | Update hardcoded bg + gold colors       |
| `src/pages/Customers.jsx`    | Update hardcoded bg + gold colors       |
| `src/pages/CookiePolicy.jsx` | Update hardcoded bg colors              |
| `src/pages/GDPR.jsx`         | Update hardcoded bg colors              |
| `src/pages/Demo.jsx`         | Update hardcoded bg colors              |
| `src/pages/Login.jsx`        | Update hardcoded bg + gold colors       |
| `src/pages/CheckEmail.jsx`   | Update hardcoded bg + gold colors       |
| `src/pages/Onboarding.jsx`   | Update hardcoded bg + gold colors       |

**Total: ~28 files**

## Approach

1. **Update `useTheme.js`** dark theme object first + fix gradient fallback on line 63.
2. **Update `index.css`** sidebar variable.
3. **Update `LandingPage.jsx`** CSS variable block + inline colors.
4. **Update `AnimatedWalkthrough.jsx`** — careful with all `rgba(196,162,74,...)` references → `rgba(212,176,78,...)`.
5. **Bulk search-and-replace** across all Feature pages and public pages:
   - `#080807` → `#1c1b19`
   - `#0f0f0d` → `#232220`
   - `#161613` → `#2a2826`
   - `#c4a24a` → `#d4b04e`
   - `196,162,74` → `212,176,78` (in rgba references)
6. **Build and verify** — no errors, dashboard unchanged.

## What Users Will Experience

- **Landing page visitors:** Warmer, more inviting dark background. Gold accents appear brighter and more alive. Text is easier to read on longer sections. Cards have real visual depth against the background.
- **Feature page visitors:** Consistent warm luxury feel across all marketing pages (Browse Talent, Campaign Analytics, etc.)
- **Dashboard users:** No visible change to the main content area. Sidebar is imperceptibly warmer — smoother transition from landing to app.
- **404 page visitors:** Same warm luxury feel as the landing page.

## Success Criteria

1. Landing page background is visibly warmer than current — not flat black
2. Gold accents (`#d4b04e`) pop more than current `#c4a24a`
3. Text readability improves — muted text is easier to read
4. Cards and sections have clear visual separation from background
5. All public pages (Feature, About, Blog, etc.) use the same warm palette
6. Dashboard main content area is completely unchanged
7. Build passes with no errors
8. No color inconsistencies between any public-facing pages
9. Gradient theme still works (fallback updated)

## Risks

- **Sheer number of files (28):** Mitigated by using bulk search-and-replace for the 5 color substitutions.
- **Feature page DS constants:** Each Feature page defines its own local color object — must update each one.
- **Gradient theme fallback:** Line 63 of useTheme.js has a hardcoded `#080807` for gradient mode — must update to `#1c1b19`.
- **Text-on-gradient colors:** Some `#080807` usages are text color on gold buttons. These update to `#1c1b19` which maintains contrast.

## Non-Goals

- Redesigning the landing page layout or structure
- Changing the dashboard color scheme
- Adding new theme options
- Changing fonts, spacing, or animations
- Touching the gradient theme (except the one fallback)
- Refactoring Feature pages to use shared color constants (good future improvement, out of scope)
