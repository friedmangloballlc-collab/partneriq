-- ============================================================
-- 003: Fix RLS Policies — Replace USING(true) with Proper User-Scoped Policies
-- ============================================================
--
-- SECURITY MIGRATION
--
-- This migration addresses critical security vulnerabilities in the
-- PartnerIQ Supabase schema:
--
--   1. Drops ALL existing wide-open USING(true) / WITH CHECK(true) RLS
--      policies that were created in "demo mode" (schema.sql).
--   2. Replaces them with proper user-scoped policies using auth.uid()
--      so that users can only access rows they own or participate in.
--   3. Revokes INSERT, UPDATE, DELETE from the `anon` role on all tables
--      (anon retains SELECT only on specific public/reference tables).
--   4. Ensures the `service_role` retains full access for edge functions
--      and backend operations.
--   5. Adds a trigger to prevent users from escalating their own role.
--
-- Tables covered:
--   profiles, brands, talents, partnerships, marketplace_opportunities,
--   opportunity_applications, outreach_emails, outreach_sequences,
--   outreach_metrics, approval_items, deal_notes, tasks, activities,
--   notifications, teams, team_members, culture_events, mega_events,
--   conferences, demographic_segments, industry_guides, rate_benchmarks,
--   roi_benchmarks, platform_multipliers, category_premiums,
--   subscription_plans, user_subscriptions, billing_history,
--   partnership_proposals, activation_checklists, planning_timelines,
--   viewership_tiers, email_connections (from 005), plus tables from
--   006_create_missing_tables.
--
-- NOTE: Tables referenced in task spec but not present in the schema
-- (contacts, calendar_events, match_results, pitch_decks, campaign_briefs,
-- subscription_events, escrow_payments) are handled as follows:
--   - escrow_payments: created in 006, policy included here
--   - Others: not yet created; policies should be added when they are
--
-- Run inside a transaction so it either fully applies or rolls back.
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 0: Ensure RLS is enabled on ALL tables (idempotent)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographic_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_premiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewership_tiers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 1: Drop ALL existing RLS policies on all public tables
-- This ensures a clean slate — no leftover USING(true) policies.
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END;
$$;


-- ============================================================
-- STEP 2: Create proper user-scoped RLS policies
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- Users can read/update only their own profile.
-- Admin (role = 'admin') can read all profiles.
-- Insert is restricted to own row (handle_new_user trigger uses
-- SECURITY DEFINER so it bypasses RLS).
-- ────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own_or_admin"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- No DELETE policy for profiles — users cannot delete their own profile
-- row via the API. Account deletion should go through a server-side flow.

-- ────────────────────────────────────────────────────────────
-- TALENTS
-- All authenticated users can read (public discovery).
-- Only the talent owner can update/delete.
-- NOTE: The schema has owner_id but not created_by_manager.
-- If a manager column is added later, add it to the USING clause.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "talents_select_authenticated"
  ON talents FOR SELECT TO authenticated
  USING (true);

-- Anon can also read talents for public discovery pages
CREATE POLICY "talents_select_anon"
  ON talents FOR SELECT TO anon
  USING (true);

CREATE POLICY "talents_insert_own"
  ON talents FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "talents_update_own"
  ON talents FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "talents_delete_own"
  ON talents FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- BRANDS
-- All authenticated users can read. Only creator can update/delete.
-- Anon can also read for public pages.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "brands_select_authenticated"
  ON brands FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "brands_select_anon"
  ON brands FOR SELECT TO anon
  USING (true);

CREATE POLICY "brands_insert_own"
  ON brands FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "brands_update_own"
  ON brands FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "brands_delete_own"
  ON brands FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- PARTNERSHIPS
-- Participants (the creator, or users linked via brand/talent ownership)
-- can read/write their own partnerships.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "partnerships_select_participant"
  ON partnerships FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM brands b
      WHERE b.id = partnerships.brand_id AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM talents t
      WHERE t.id = partnerships.talent_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "partnerships_insert_authenticated"
  ON partnerships FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "partnerships_update_participant"
  ON partnerships FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM brands b
      WHERE b.id = partnerships.brand_id AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM talents t
      WHERE t.id = partnerships.talent_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "partnerships_delete_own"
  ON partnerships FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- MARKETPLACE OPPORTUNITIES
-- All authenticated can read. Only the poster can write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "marketplace_opportunities_select_authenticated"
  ON marketplace_opportunities FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "marketplace_opportunities_insert_own"
  ON marketplace_opportunities FOR INSERT TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "marketplace_opportunities_update_own"
  ON marketplace_opportunities FOR UPDATE TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "marketplace_opportunities_delete_own"
  ON marketplace_opportunities FOR DELETE TO authenticated
  USING (posted_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- OPPORTUNITY APPLICATIONS
-- Applicant (matched by talent_email) or the opportunity poster can read.
-- Applicant can insert/update their own. Poster can update status.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "opportunity_applications_select_participant"
  ON opportunity_applications FOR SELECT TO authenticated
  USING (
    talent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM marketplace_opportunities mo
      WHERE mo.id = opportunity_applications.opportunity_id
        AND mo.posted_by = auth.uid()
    )
  );

CREATE POLICY "opportunity_applications_insert_authenticated"
  ON opportunity_applications FOR INSERT TO authenticated
  WITH CHECK (
    talent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "opportunity_applications_update_participant"
  ON opportunity_applications FOR UPDATE TO authenticated
  USING (
    talent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM marketplace_opportunities mo
      WHERE mo.id = opportunity_applications.opportunity_id
        AND mo.posted_by = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- OUTREACH EMAILS
-- Only the sender (created_by) can read/write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "outreach_emails_select_own"
  ON outreach_emails FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "outreach_emails_insert_own"
  ON outreach_emails FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "outreach_emails_update_own"
  ON outreach_emails FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "outreach_emails_delete_own"
  ON outreach_emails FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- OUTREACH SEQUENCES
-- Only the owner (created_by) can read/write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "outreach_sequences_select_own"
  ON outreach_sequences FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "outreach_sequences_insert_own"
  ON outreach_sequences FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "outreach_sequences_update_own"
  ON outreach_sequences FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "outreach_sequences_delete_own"
  ON outreach_sequences FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- OUTREACH METRICS
-- Only the sequence owner can read. Insert only for sequence owner.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "outreach_metrics_select_own"
  ON outreach_metrics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM outreach_sequences os
      WHERE os.id = outreach_metrics.sequence_id
        AND os.created_by = auth.uid()
    )
  );

CREATE POLICY "outreach_metrics_insert_own"
  ON outreach_metrics FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM outreach_sequences os
      WHERE os.id = outreach_metrics.sequence_id
        AND os.created_by = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- Only the recipient (user_id) can read/update.
-- System/service_role can insert (bypasses RLS).
-- Authenticated users can also insert notifications addressed to themselves.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_own"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- No DELETE — notifications are soft-managed via read status.

-- ────────────────────────────────────────────────────────────
-- BILLING HISTORY
-- Read-only for owning user. All writes via service_role only.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "billing_history_select_own"
  ON billing_history FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE for authenticated — service_role only.

-- ────────────────────────────────────────────────────────────
-- USER SUBSCRIPTIONS
-- Only own subscription. No client INSERT — service_role manages.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "user_subscriptions_select_own"
  ON user_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_update_own"
  ON user_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/DELETE for authenticated — service_role only.

-- ────────────────────────────────────────────────────────────
-- APPROVAL ITEMS
-- Participants (submitter or reviewer) can read.
-- Only the assigned reviewer can update (approve/reject).
-- Submitter can insert.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "approval_items_select_participant"
  ON approval_items FOR SELECT TO authenticated
  USING (submitted_by = auth.uid() OR reviewed_by = auth.uid());

CREATE POLICY "approval_items_insert_own"
  ON approval_items FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "approval_items_update_reviewer"
  ON approval_items FOR UPDATE TO authenticated
  USING (reviewed_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- DEAL NOTES
-- Only the author can CRUD. Also visible to partnership participants.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "deal_notes_select_participant"
  ON deal_notes FOR SELECT TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = deal_notes.partnership_id
        AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "deal_notes_insert_own"
  ON deal_notes FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "deal_notes_update_own"
  ON deal_notes FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "deal_notes_delete_own"
  ON deal_notes FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- TASKS
-- Visible to assignee or creator. Only creator can insert.
-- Assignee or creator can update/delete.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "tasks_insert_own"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "tasks_delete_own"
  ON tasks FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- ACTIVITIES
-- Only the acting user can read/insert their activities.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "activities_select_own"
  ON activities FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "activities_insert_own"
  ON activities FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- TEAMS
-- Team owner and members can access. Only owner can update/delete.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "teams_select_member"
  ON teams FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "teams_insert_own"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_update_owner"
  ON teams FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_delete_owner"
  ON teams FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- TEAM MEMBERS
-- Team owner and self can read. Only team owner can insert/delete.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "team_members_select_member"
  ON team_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_insert_owner"
  ON team_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_delete_owner_or_self"
  ON team_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- CULTURE EVENTS
-- All authenticated can read. Anon can also read (public).
-- Only admin can write (enforced via role check).
-- ────────────────────────────────────────────────────────────
CREATE POLICY "culture_events_select_authenticated"
  ON culture_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "culture_events_select_anon"
  ON culture_events FOR SELECT TO anon
  USING (true);

CREATE POLICY "culture_events_insert_admin"
  ON culture_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "culture_events_update_admin"
  ON culture_events FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "culture_events_delete_admin"
  ON culture_events FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- MEGA EVENTS
-- All authenticated can read. Only admin can write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "mega_events_select_authenticated"
  ON mega_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "mega_events_select_anon"
  ON mega_events FOR SELECT TO anon
  USING (true);

CREATE POLICY "mega_events_insert_admin"
  ON mega_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "mega_events_update_admin"
  ON mega_events FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "mega_events_delete_admin"
  ON mega_events FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- CONFERENCES
-- All authenticated can read. Only admin can write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "conferences_select_authenticated"
  ON conferences FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "conferences_select_anon"
  ON conferences FOR SELECT TO anon
  USING (true);

CREATE POLICY "conferences_insert_admin"
  ON conferences FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "conferences_update_admin"
  ON conferences FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "conferences_delete_admin"
  ON conferences FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- REFERENCE / LOOKUP TABLES
-- Public SELECT (anon + authenticated). No mutations except via service_role.
-- ────────────────────────────────────────────────────────────

-- rate_benchmarks
CREATE POLICY "rate_benchmarks_select_public"
  ON rate_benchmarks FOR SELECT USING (true);

-- roi_benchmarks
CREATE POLICY "roi_benchmarks_select_public"
  ON roi_benchmarks FOR SELECT USING (true);

-- platform_multipliers
CREATE POLICY "platform_multipliers_select_public"
  ON platform_multipliers FOR SELECT USING (true);

-- category_premiums
CREATE POLICY "category_premiums_select_public"
  ON category_premiums FOR SELECT USING (true);

-- viewership_tiers
CREATE POLICY "viewership_tiers_select_public"
  ON viewership_tiers FOR SELECT USING (true);

-- subscription_plans
CREATE POLICY "subscription_plans_select_public"
  ON subscription_plans FOR SELECT USING (true);

-- demographic_segments
CREATE POLICY "demographic_segments_select_public"
  ON demographic_segments FOR SELECT USING (true);

-- industry_guides
CREATE POLICY "industry_guides_select_public"
  ON industry_guides FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────
-- PARTNERSHIP PROPOSALS
-- Only the creator can CRUD.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "partnership_proposals_select_own"
  ON partnership_proposals FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "partnership_proposals_insert_own"
  ON partnership_proposals FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "partnership_proposals_update_own"
  ON partnership_proposals FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "partnership_proposals_delete_own"
  ON partnership_proposals FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- ACTIVATION CHECKLISTS
-- Only the creator can CRUD.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "activation_checklists_select_own"
  ON activation_checklists FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "activation_checklists_insert_own"
  ON activation_checklists FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "activation_checklists_update_own"
  ON activation_checklists FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- PLANNING TIMELINES
-- Only the creator can CRUD.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "planning_timelines_select_own"
  ON planning_timelines FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "planning_timelines_insert_own"
  ON planning_timelines FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "planning_timelines_update_own"
  ON planning_timelines FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());


-- ============================================================
-- STEP 2b: Policies for tables created in 006_create_missing_tables
-- These use DROP POLICY IF EXISTS since 006 may have already created them.
-- ============================================================

-- ── EMAIL CONNECTIONS (from 005) ──────────────────────────────
-- Only own connections.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_connections') THEN
    DROP POLICY IF EXISTS "email_connections_select_own" ON email_connections;
    DROP POLICY IF EXISTS "email_connections_insert_own" ON email_connections;
    DROP POLICY IF EXISTS "email_connections_update_own" ON email_connections;
    DROP POLICY IF EXISTS "email_connections_delete_own" ON email_connections;

    CREATE POLICY "email_connections_select_own" ON email_connections FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "email_connections_insert_own" ON email_connections FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "email_connections_update_own" ON email_connections FOR UPDATE TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "email_connections_delete_own" ON email_connections FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ── CONNECTED PLATFORMS (from 006) ────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'connected_platforms') THEN
    DROP POLICY IF EXISTS "connected_platforms_select" ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_insert" ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_update" ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_delete" ON connected_platforms;

    CREATE POLICY "connected_platforms_select_authenticated" ON connected_platforms FOR SELECT TO authenticated USING (true);
    CREATE POLICY "connected_platforms_insert_own" ON connected_platforms FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
    CREATE POLICY "connected_platforms_update_own" ON connected_platforms FOR UPDATE TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "connected_platforms_delete_own" ON connected_platforms FOR DELETE TO authenticated USING (owner_id = auth.uid());
  END IF;
END $$;

-- ── DATA ROOM ENTRIES (from 006) ──────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'data_room_entries') THEN
    DROP POLICY IF EXISTS "data_room_entries_select" ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_insert" ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_update" ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_delete" ON data_room_entries;

    CREATE POLICY "data_room_entries_select_own" ON data_room_entries FOR SELECT TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "data_room_entries_insert_own" ON data_room_entries FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
    CREATE POLICY "data_room_entries_update_own" ON data_room_entries FOR UPDATE TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "data_room_entries_delete_own" ON data_room_entries FOR DELETE TO authenticated USING (owner_id = auth.uid());
  END IF;
END $$;

-- ── DATA ROOM ACCESS (from 006) — fix the USING(true) policies ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'data_room_access') THEN
    DROP POLICY IF EXISTS "data_room_access_select" ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_insert" ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_update" ON data_room_access;

    CREATE POLICY "data_room_access_select_participant" ON data_room_access FOR SELECT TO authenticated
      USING (
        requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    CREATE POLICY "data_room_access_insert_authenticated" ON data_room_access FOR INSERT TO authenticated
      WITH CHECK (
        requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    CREATE POLICY "data_room_access_update_owner" ON data_room_access FOR UPDATE TO authenticated
      USING (
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

-- ── DECISION MAKERS (from 006) — fix the USING(true) on SELECT/INSERT ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'decision_makers') THEN
    DROP POLICY IF EXISTS "decision_makers_select" ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_insert" ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_update" ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_delete" ON decision_makers;

    CREATE POLICY "decision_makers_select_own" ON decision_makers FOR SELECT TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "decision_makers_insert_own" ON decision_makers FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
    CREATE POLICY "decision_makers_update_own" ON decision_makers FOR UPDATE TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "decision_makers_delete_own" ON decision_makers FOR DELETE TO authenticated USING (owner_id = auth.uid());
  END IF;
END $$;

-- ── DEAL SCORES (from 006) ────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deal_scores') THEN
    DROP POLICY IF EXISTS "deal_scores_select" ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_insert" ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_update" ON deal_scores;

    CREATE POLICY "deal_scores_select_own" ON deal_scores FOR SELECT TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "deal_scores_insert_own" ON deal_scores FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
    CREATE POLICY "deal_scores_update_own" ON deal_scores FOR UPDATE TO authenticated USING (owner_id = auth.uid());
  END IF;
END $$;

-- ── ESCROW PAYMENTS (from 006) ────────────────────────────────
-- Participants can read. No direct user writes — edge function (service_role) only.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'escrow_payments') THEN
    DROP POLICY IF EXISTS "escrow_payments_select" ON escrow_payments;
    DROP POLICY IF EXISTS "escrow_payments_insert" ON escrow_payments;
    DROP POLICY IF EXISTS "escrow_payments_update" ON escrow_payments;

    CREATE POLICY "escrow_payments_select_participant" ON escrow_payments FOR SELECT TO authenticated
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM partnerships p
          WHERE p.id = escrow_payments.partnership_id
            AND (
              p.created_by = auth.uid()
              OR EXISTS (SELECT 1 FROM brands b WHERE b.id = p.brand_id AND b.owner_id = auth.uid())
              OR EXISTS (SELECT 1 FROM talents t WHERE t.id = p.talent_id AND t.owner_id = auth.uid())
            )
        )
      );
    -- No INSERT/UPDATE/DELETE for authenticated — service_role only.
  END IF;
END $$;

-- ── BUNDLE DEALS (from 006) ──────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bundle_deals') THEN
    DROP POLICY IF EXISTS "bundle_deals_select" ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_insert" ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_update" ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_delete" ON bundle_deals;

    CREATE POLICY "bundle_deals_select_own" ON bundle_deals FOR SELECT TO authenticated USING (created_by = auth.uid());
    CREATE POLICY "bundle_deals_insert_own" ON bundle_deals FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
    CREATE POLICY "bundle_deals_update_own" ON bundle_deals FOR UPDATE TO authenticated USING (created_by = auth.uid());
    CREATE POLICY "bundle_deals_delete_own" ON bundle_deals FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

-- ── DEAL DISPUTES (from 006) ─────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deal_disputes') THEN
    DROP POLICY IF EXISTS "deal_disputes_select" ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_insert" ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_update" ON deal_disputes;

    CREATE POLICY "deal_disputes_select_own" ON deal_disputes FOR SELECT TO authenticated USING (created_by = auth.uid());
    CREATE POLICY "deal_disputes_insert_own" ON deal_disputes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
    CREATE POLICY "deal_disputes_update_own" ON deal_disputes FOR UPDATE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

-- ── DECK LIBRARY (from 006) ──────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deck_library') THEN
    DROP POLICY IF EXISTS "deck_library_select" ON deck_library;
    DROP POLICY IF EXISTS "deck_library_insert" ON deck_library;
    DROP POLICY IF EXISTS "deck_library_update" ON deck_library;
    DROP POLICY IF EXISTS "deck_library_delete" ON deck_library;

    CREATE POLICY "deck_library_select_own" ON deck_library FOR SELECT TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "deck_library_insert_own" ON deck_library FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
    CREATE POLICY "deck_library_update_own" ON deck_library FOR UPDATE TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "deck_library_delete_own" ON deck_library FOR DELETE TO authenticated USING (owner_id = auth.uid());
  END IF;
END $$;

-- ── PITCH COMPETITIONS (from 006) ────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pitch_competitions') THEN
    DROP POLICY IF EXISTS "pitch_competitions_select" ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_insert" ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_update" ON pitch_competitions;

    CREATE POLICY "pitch_competitions_select_authenticated" ON pitch_competitions FOR SELECT TO authenticated USING (true);
    CREATE POLICY "pitch_competitions_insert_own" ON pitch_competitions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
    CREATE POLICY "pitch_competitions_update_own" ON pitch_competitions FOR UPDATE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

-- ── AI USAGE LOGS (from 006) ─────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_usage_logs') THEN
    DROP POLICY IF EXISTS "ai_usage_logs_select" ON ai_usage_logs;
    DROP POLICY IF EXISTS "ai_usage_logs_insert" ON ai_usage_logs;

    CREATE POLICY "ai_usage_logs_select_own" ON ai_usage_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
    -- Insert still requires service_role for the AI router; authenticated gets read-only.
  END IF;
END $$;

-- ── REFERRALS (from 006) ─────────────────────────────────────
-- Referrer can read/write their own. Referee can read theirs.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
    DROP POLICY IF EXISTS "referrals_select" ON referrals;
    DROP POLICY IF EXISTS "referrals_insert" ON referrals;
    DROP POLICY IF EXISTS "referrals_update" ON referrals;

    CREATE POLICY "referrals_select_participant" ON referrals FOR SELECT TO authenticated
      USING (referrer_id = auth.uid() OR referred_id = auth.uid());
    CREATE POLICY "referrals_insert_own" ON referrals FOR INSERT TO authenticated
      WITH CHECK (referrer_id = auth.uid());
    CREATE POLICY "referrals_update_own" ON referrals FOR UPDATE TO authenticated
      USING (referrer_id = auth.uid());
  END IF;
END $$;

-- ── REFERENCE TABLES from 006 (public SELECT only) ──────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_catalog') THEN
    DROP POLICY IF EXISTS "platform_catalog_select_public" ON platform_catalog;
    CREATE POLICY "platform_catalog_select_public" ON platform_catalog FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_types') THEN
    DROP POLICY IF EXISTS "talent_types_select_public" ON talent_types;
    CREATE POLICY "talent_types_select_public" ON talent_types FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_revenue_streams') THEN
    DROP POLICY IF EXISTS "talent_revenue_streams_select_public" ON talent_revenue_streams;
    CREATE POLICY "talent_revenue_streams_select_public" ON talent_revenue_streams FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_revenue_matrix') THEN
    DROP POLICY IF EXISTS "talent_revenue_matrix_select_public" ON talent_revenue_matrix;
    CREATE POLICY "talent_revenue_matrix_select_public" ON talent_revenue_matrix FOR SELECT USING (true);
  END IF;
END $$;

-- ── NEWSLETTER SUBSCRIBERS (from 008) ────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
    DROP POLICY IF EXISTS "newsletter_insert" ON newsletter_subscribers;
    DROP POLICY IF EXISTS "newsletter_select" ON newsletter_subscribers;

    -- Anon can insert (signup form). Authenticated can read.
    CREATE POLICY "newsletter_subscribers_insert_anon" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY "newsletter_subscribers_insert_authenticated" ON newsletter_subscribers FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "newsletter_subscribers_select_authenticated" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
  END IF;
END $$;


-- ============================================================
-- STEP 3: Revoke dangerous grants from anon role
-- ============================================================

-- Remove all write privileges from anon on every table
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Prevent future tables from auto-granting write to anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

-- Explicitly REVOKE SELECT from anon on all tables first, then re-grant
-- only on tables that need public read access.
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;

-- Re-grant SELECT to anon ONLY on public/reference tables
GRANT SELECT ON talents TO anon;
GRANT SELECT ON brands TO anon;
GRANT SELECT ON culture_events TO anon;
GRANT SELECT ON mega_events TO anon;
GRANT SELECT ON conferences TO anon;
GRANT SELECT ON rate_benchmarks TO anon;
GRANT SELECT ON roi_benchmarks TO anon;
GRANT SELECT ON platform_multipliers TO anon;
GRANT SELECT ON category_premiums TO anon;
GRANT SELECT ON viewership_tiers TO anon;
GRANT SELECT ON subscription_plans TO anon;
GRANT SELECT ON demographic_segments TO anon;
GRANT SELECT ON industry_guides TO anon;

-- Re-grant INSERT on newsletter_subscribers for anon (signup form)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
    EXECUTE 'GRANT SELECT, INSERT ON newsletter_subscribers TO anon';
  END IF;
END $$;

-- Reference tables from 006
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_catalog') THEN
    EXECUTE 'GRANT SELECT ON platform_catalog TO anon';
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_types') THEN
    EXECUTE 'GRANT SELECT ON talent_types TO anon';
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_revenue_streams') THEN
    EXECUTE 'GRANT SELECT ON talent_revenue_streams TO anon';
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_revenue_matrix') THEN
    EXECUTE 'GRANT SELECT ON talent_revenue_matrix TO anon';
  END IF;
END $$;


-- ============================================================
-- STEP 4: Ensure authenticated and service_role have proper access
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- Grant anon SELECT on future tables by default (revoked writes above remain)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;


-- ============================================================
-- STEP 5: Prevent users from escalating their own role
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  -- If this is a client request (has JWT claims), prevent role changes
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF current_setting('request.jwt.claims', true) IS NOT NULL
       AND current_setting('request.jwt.claims', true) != '' THEN
      -- Silently revert the role change
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS prevent_role_change ON profiles;
CREATE TRIGGER prevent_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_change();


COMMIT;
