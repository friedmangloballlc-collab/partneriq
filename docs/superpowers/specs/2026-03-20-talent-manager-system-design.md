# Talent Manager System — Design Spec

**Date:** March 20, 2026
**Status:** Approved
**Author:** DealStage Engineering

---

## Overview

Talent users can invite a personal manager who gets their own login and can act on the talent's behalf. Managers can also sign up independently and create the talent's account with proper verification. One manager per talent. Multiple talent = must use agency role.

---

## Two Signup Paths

### Path 1: Talent-First (Talent invites manager)

1. Talent goes to Settings → "My Manager" section
2. Two invite options:
   - Enter manager's email → system sends invite email
   - Generate shareable invite link → talent sends it however they want
3. Invite expires after 7 days
4. Manager clicks link → special signup page → creates own account with role `manager`
5. Account auto-linked to that talent

### Path 2: Manager-First (Manager creates talent account)

1. Manager selects "Manager" role at signup (4th role alongside Talent/Brand/Agency)
2. Manager creates their own account (email + password)
3. Post-signup wizard: "Set up your talent's profile"
4. Manager provides verification:
   - Upload signed management agreement / contract (PDF) — OR
   - Upload power of attorney / letter of authorization
   - Talent's full legal name (required)
   - Talent's email address (required)
5. Manager fills out talent profile: name, category, bio, social accounts
6. System sends verification email to talent's email: "Your manager [Manager Name] has created a DealStage account on your behalf. Click to confirm."
7. Talent clicks confirm → account verified and linked. Talent can set their own password via this email.
8. If talent does NOT confirm within 14 days → manager's access suspended until confirmed

---

## Manager Permissions

### CAN do (everything the talent can):

- View and edit talent profile
- Connect social accounts
- Respond to brand opportunities
- Negotiate and manage deals in pipeline
- Send outreach messages and sequences
- Use Contact Finder, Match Engine, AI features
- View and manage all analytics and revenue
- Create and manage pitch decks
- Access data rooms
- Use all features the talent's subscription tier allows

### CANNOT do:

- Delete the talent's account
- Change the talent's password
- Change billing / subscription plan
- Remove themselves as manager (only talent can revoke)

---

## Manager Experience

- Manager logs in with their own credentials (always)
- Sidebar shows the same pages as the talent role (31 pages)
- Header shows: "Managing: [Talent Name]" badge
- All data displayed is the talent's data
- Manager's own profile page shows their name, role "Manager", and which talent they manage
- Feature gate treats `manager` role identical to `talent` for page access

---

## Talent Experience

- Settings → "My Manager" section shows:
  - Current manager name, email, and when they were added
  - "Revoke Access" button (immediate, no confirmation period)
  - "Invite Manager" button (if no current manager)
- Talent can log in anytime and see everything the manager has done
- Talent can set their own password via the confirmation email (Path 2)
- Talent retains full control — manager access is a privilege they grant

---

## Data Model

### profiles table changes:

- `manager_of` (UUID, nullable) — if this user is a manager, points to the talent's user ID
- `managed_by` (UUID, nullable) — if this talent has a manager, points to the manager's user ID
- `manager_verification_file` (text, nullable) — path to uploaded management agreement
- `manager_verification_status` (text, nullable) — "pending" | "confirmed" | "suspended"
- `manager_invited_at` (timestamp, nullable)

### New role value:

- `role` field accepts: "talent", "brand", "agency", "admin", "manager"

---

## Signup Flow Changes

### Onboarding.jsx — Add Manager role:

```
ROLES array adds:
{
  key: "manager",
  icon: UserCheck,
  title: "Manager",
  desc: "I manage a talent's career and partnerships",
}
```

### Manager has NO subscription plans:

- Manager accounts are free — they inherit the talent's subscription tier
- After selecting "Manager" role, skip plan selection → go straight to account creation
- Post-signup: show manager setup wizard (create talent profile or enter invite code)

---

## Invite System

### Email invite:

- Subject: "[Talent Name] has invited you to manage their DealStage account"
- Contains: invite link with token
- Token stored in `manager_invites` table or as a signed JWT

### Shareable link:

- Format: `https://www.thedealstage.com/invite/manager?token=xxx`
- Token expires after 7 days
- One-time use

### Verification email (Path 2):

- Subject: "Your manager [Manager Name] created a DealStage account for you"
- Contains: confirm link + set password link
- If not confirmed in 14 days, manager access suspended

---

## Feature Gate Integration

In `useFeatureGate.js`:

- When `role === "manager"`, look up `manager_of` to find the talent's profile
- Use the TALENT tier pages for access control
- Use the talent's subscription plan for tier level

---

## Security Considerations

- Manager cannot escalate their own permissions
- Talent can revoke at any time (immediate effect)
- Manager verification document stored in private Supabase storage bucket
- Admin can review manager verification documents
- If talent disputes manager claim (Path 2), admin intervenes
- Rate limit: 1 active manager per talent, 3 invite attempts per day

---

## UI Changes Summary

1. **Onboarding.jsx** — Add "Manager" as 4th role option
2. **Settings.jsx** — Add "My Manager" section for talent users
3. **New page: ManagerSetup.jsx** — Post-signup wizard for managers (Path 2)
4. **Layout.jsx** — Add "manager" to roleNavItems (same pages as talent)
5. **Layout.jsx** — Show "Managing: [Name]" badge in header for managers
6. **useFeatureGate.js** — Treat manager same as talent for page access
7. **routePermissions.js** — Add manager role with same permissions as talent
