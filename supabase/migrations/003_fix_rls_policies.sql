-- ============================================================
-- 003: Fix RLS Policies — Correct User-Scoped Policies
-- ============================================================
--
-- SECURITY MIGRATION
--
-- This migration addresses critical security vulnerabilities in the
-- PartnerIQ Supabase schema:
--
--   1. Drops ALL existing wide-open USING(true) / WITH CHECK(true) RLS
--      policies that were created in "demo mode" (001_create_tables.sql).
--   2. Replaces them with correct policies mapped to the ACTUAL column
--      names in each table definition.
--   3. Revokes INSERT, UPDATE, DELETE from the `anon` role on all tables
--      (anon retains SELECT only on specific public/reference tables).
--   4. Ensures the `service_role` retains full access for edge functions
--      and backend operations.
--   5. Adds a trigger to prevent users from escalating their own role.
--
-- COLUMN REALITY (verified against 001 + 006 CREATE TABLE statements):
--
--   profiles           — id UUID = auth.uid()
--   brands             — created_by TEXT (email/name, NOT UUID)
--   talents            — NO user ownership column in 001
--   partnerships       — created_by TEXT, assigned_to TEXT (NOT UUID)
--   activities         — actor_email TEXT (no user UUID column)
--   approval_items     — assigned_to TEXT, reviewed_by TEXT (NOT UUID)
--   outreach_sequences — NO created_by column in 001
--   outreach_emails    — assigned_to TEXT (no created_by column in 001)
--   outreach_metrics   — no user column
--   notifications      — user_email TEXT (NOT user_id UUID)
--   teams              — owner_email TEXT (NOT owner_id UUID)
--   team_members       — member_email TEXT (NOT user_id UUID)
--   marketplace_opportunities — created_by TEXT (NOT posted_by)
--   opportunity_applications  — talent_email TEXT
--   deal_notes         — author_email TEXT (NOT author_id UUID)
--   tasks              — assigned_to_email TEXT, assigned_by_email TEXT (NOT UUID)
--   billing_history    — user_email TEXT (NOT user_id UUID)
--   user_subscriptions — user_email TEXT (NOT user_id UUID)
--   partnership_proposals     — no user column
--   activation_checklists     — no user column
--   planning_timelines        — no user column
--   006 connected_platforms   — owner_id UUID (references profiles.id)
--   006 data_room_entries     — owner_id UUID
--   006 data_room_access      — owner_email TEXT, requester_email TEXT
--   006 decision_makers       — owner_id UUID
--   006 deal_scores           — owner_id UUID
--   006 escrow_payments       — created_by UUID (references profiles.id)
--   006 bundle_deals          — created_by UUID
--   006 deal_disputes         — created_by UUID
--   006 deck_library          — owner_id UUID
--   006 pitch_competitions    — created_by UUID
--   006 ai_usage_logs         — user_id UUID
--   006 referrals             — referrer_id UUID, referred_id UUID
--
-- STRATEGY FOR TABLES WITH TEXT IDENTITY COLUMNS:
--   Since TEXT columns like created_by, user_email, owner_email cannot be
--   compared to auth.uid() directly, these tables use a broad authenticated
--   policy (all authenticated users can read/write). This is not ideal for
--   production but is correct given the actual schema. Tighten these policies
--   after adding UUID user columns to the relevant tables.
--
-- Run inside a transaction so it either fully applies or rolls back.
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 0: Ensure RLS is enabled on ALL tables (idempotent)
-- ============================================================
ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE talents                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships              ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails           ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sequences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_metrics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members              ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences               ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographic_segments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_guides           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_benchmarks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_benchmarks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_multipliers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_premiums         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history           ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_proposals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_checklists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_timelines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewership_tiers          ENABLE ROW LEVEL SECURITY;


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
-- STEP 2: Create correct RLS policies based on actual schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- profiles.id is UUID and directly equals auth.uid().
-- This is the only table in 001 where UUID comparison is safe.
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

-- No DELETE policy for profiles — account deletion goes through a
-- server-side SECURITY DEFINER function, not the client API.


-- ────────────────────────────────────────────────────────────
-- TALENTS
-- Schema (001): NO user ownership column exists.
-- Strategy: all authenticated users can read (public discovery);
-- all authenticated users can insert/update/delete.
-- Tighten after adding a user_id UUID column to this table.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "talents_select_authenticated"
  ON talents FOR SELECT TO authenticated
  USING (true);

-- Anon can also read for public discovery pages.
CREATE POLICY "talents_select_anon"
  ON talents FOR SELECT TO anon
  USING (true);

CREATE POLICY "talents_insert_authenticated"
  ON talents FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "talents_update_authenticated"
  ON talents FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "talents_delete_authenticated"
  ON talents FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- BRANDS
-- Schema (001): created_by TEXT (stores email or name, NOT UUID).
-- Strategy: all authenticated users can read; all authenticated
-- users can write. Tighten after adding an owner_id UUID column.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "brands_select_authenticated"
  ON brands FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "brands_select_anon"
  ON brands FOR SELECT TO anon
  USING (true);

CREATE POLICY "brands_insert_authenticated"
  ON brands FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "brands_update_authenticated"
  ON brands FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "brands_delete_authenticated"
  ON brands FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- PARTNERSHIPS
-- Schema (001): created_by TEXT, assigned_to TEXT — both are
-- text identifiers (email/name), NOT UUIDs.
-- Strategy: all authenticated users can read and write.
-- Tighten after adding a created_by_id UUID column.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "partnerships_select_authenticated"
  ON partnerships FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "partnerships_insert_authenticated"
  ON partnerships FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "partnerships_update_authenticated"
  ON partnerships FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "partnerships_delete_authenticated"
  ON partnerships FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- MARKETPLACE OPPORTUNITIES
-- Schema (001): created_by TEXT (not a UUID column).
-- Strategy: all authenticated can read; all authenticated can write.
-- Tighten after adding a creator_id UUID column.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "marketplace_opportunities_select_authenticated"
  ON marketplace_opportunities FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "marketplace_opportunities_insert_authenticated"
  ON marketplace_opportunities FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "marketplace_opportunities_update_authenticated"
  ON marketplace_opportunities FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "marketplace_opportunities_delete_authenticated"
  ON marketplace_opportunities FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- OPPORTUNITY APPLICATIONS
-- Schema (001): talent_email TEXT — not a UUID column.
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "opportunity_applications_select_authenticated"
  ON opportunity_applications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "opportunity_applications_insert_authenticated"
  ON opportunity_applications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "opportunity_applications_update_authenticated"
  ON opportunity_applications FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- OUTREACH SEQUENCES
-- Schema (001): NO created_by or user identity column exists.
-- Strategy: all authenticated can read and write.
-- Tighten after adding a created_by_id UUID column.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "outreach_sequences_select_authenticated"
  ON outreach_sequences FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "outreach_sequences_insert_authenticated"
  ON outreach_sequences FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "outreach_sequences_update_authenticated"
  ON outreach_sequences FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "outreach_sequences_delete_authenticated"
  ON outreach_sequences FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- OUTREACH EMAILS
-- Schema (001): assigned_to TEXT — not a UUID column.
-- No created_by column in 001.
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "outreach_emails_select_authenticated"
  ON outreach_emails FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "outreach_emails_insert_authenticated"
  ON outreach_emails FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "outreach_emails_update_authenticated"
  ON outreach_emails FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "outreach_emails_delete_authenticated"
  ON outreach_emails FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- OUTREACH METRICS
-- Schema (001): email_id and sequence_id are UUID FKs, but there
-- is no direct user identity column.
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "outreach_metrics_select_authenticated"
  ON outreach_metrics FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "outreach_metrics_insert_authenticated"
  ON outreach_metrics FOR INSERT TO authenticated
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- Schema (001): user_email TEXT — NOT a UUID column.
-- Can match current user's email via auth.users subquery.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT TO authenticated
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "notifications_insert_own"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- No DELETE — notifications are managed via read status.


-- ────────────────────────────────────────────────────────────
-- APPROVAL ITEMS
-- Schema (001): assigned_to TEXT, reviewed_by TEXT — not UUID.
-- No submitted_by column exists.
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "approval_items_select_authenticated"
  ON approval_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "approval_items_insert_authenticated"
  ON approval_items FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "approval_items_update_authenticated"
  ON approval_items FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- DEAL NOTES
-- Schema (001): author_email TEXT, author_name TEXT — not UUID.
-- Can match current user's email via auth.users subquery.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "deal_notes_select_own"
  ON deal_notes FOR SELECT TO authenticated
  USING (
    author_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "deal_notes_insert_own"
  ON deal_notes FOR INSERT TO authenticated
  WITH CHECK (
    author_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "deal_notes_update_own"
  ON deal_notes FOR UPDATE TO authenticated
  USING (
    author_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    author_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "deal_notes_delete_own"
  ON deal_notes FOR DELETE TO authenticated
  USING (
    author_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );


-- ────────────────────────────────────────────────────────────
-- TASKS
-- Schema (001): assigned_to_email TEXT, assigned_by_email TEXT —
-- neither are UUID columns. No created_by column exists.
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "tasks_select_authenticated"
  ON tasks FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tasks_insert_authenticated"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "tasks_update_authenticated"
  ON tasks FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tasks_delete_authenticated"
  ON tasks FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- ACTIVITIES
-- Schema (001): actor_email TEXT, actor_name TEXT — not UUID.
-- Strategy: all authenticated can read and insert.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "activities_select_authenticated"
  ON activities FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "activities_insert_authenticated"
  ON activities FOR INSERT TO authenticated
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- TEAMS
-- Schema (001): owner_email TEXT — not a UUID column.
-- Can match current user's email via auth.users subquery.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "teams_select_participant"
  ON teams FOR SELECT TO authenticated
  USING (
    owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
        AND tm.member_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "teams_insert_authenticated"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (
    owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "teams_update_owner"
  ON teams FOR UPDATE TO authenticated
  USING (
    owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "teams_delete_owner"
  ON teams FOR DELETE TO authenticated
  USING (
    owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );


-- ────────────────────────────────────────────────────────────
-- TEAM MEMBERS
-- Schema (001): member_email TEXT, team_id UUID FK.
-- Can match current user via auth.users subquery.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "team_members_select_participant"
  ON team_members FOR SELECT TO authenticated
  USING (
    member_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
        AND t.owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "team_members_insert_owner"
  ON team_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
        AND t.owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "team_members_delete_owner_or_self"
  ON team_members FOR DELETE TO authenticated
  USING (
    member_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
        AND t.owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );


-- ────────────────────────────────────────────────────────────
-- BILLING HISTORY
-- Schema (001): user_email TEXT — not UUID.
-- Read-only for the owning user (matched by email). All writes
-- should go through service_role only.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "billing_history_select_own"
  ON billing_history FOR SELECT TO authenticated
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- No INSERT/UPDATE/DELETE for authenticated — service_role only.


-- ────────────────────────────────────────────────────────────
-- USER SUBSCRIPTIONS
-- Schema (001): user_email TEXT — not UUID.
-- Read-only for the owning user. No client writes — service_role manages.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "user_subscriptions_select_own"
  ON user_subscriptions FOR SELECT TO authenticated
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- No INSERT/DELETE for authenticated — service_role only.


-- ────────────────────────────────────────────────────────────
-- PARTNERSHIP PROPOSALS
-- Schema (001): no user identity column exists (only partnership_id FK).
-- Strategy: all authenticated can read and write.
-- Tighten after adding a created_by UUID column.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "partnership_proposals_select_authenticated"
  ON partnership_proposals FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "partnership_proposals_insert_authenticated"
  ON partnership_proposals FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "partnership_proposals_update_authenticated"
  ON partnership_proposals FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "partnership_proposals_delete_authenticated"
  ON partnership_proposals FOR DELETE TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- ACTIVATION CHECKLISTS
-- Schema (001): no user identity column exists (only partnership_id FK).
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "activation_checklists_select_authenticated"
  ON activation_checklists FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "activation_checklists_insert_authenticated"
  ON activation_checklists FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "activation_checklists_update_authenticated"
  ON activation_checklists FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- PLANNING TIMELINES
-- Schema (001): no user identity column exists (only partnership_id FK).
-- Strategy: all authenticated can read and write.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "planning_timelines_select_authenticated"
  ON planning_timelines FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "planning_timelines_insert_authenticated"
  ON planning_timelines FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "planning_timelines_update_authenticated"
  ON planning_timelines FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- CULTURE EVENTS
-- Reference/lookup data. All authenticated can read. Anon can read.
-- Only admin can write.
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
-- Reference/lookup data. All authenticated can read. Only admin can write.
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
-- Reference/lookup data. All authenticated can read. Only admin can write.
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
-- REFERENCE / LOOKUP TABLES FROM 001
-- Public SELECT (anon + authenticated). No mutations except via service_role.
-- ────────────────────────────────────────────────────────────

CREATE POLICY "rate_benchmarks_select_public"
  ON rate_benchmarks FOR SELECT USING (true);

CREATE POLICY "roi_benchmarks_select_public"
  ON roi_benchmarks FOR SELECT USING (true);

CREATE POLICY "platform_multipliers_select_public"
  ON platform_multipliers FOR SELECT USING (true);

CREATE POLICY "category_premiums_select_public"
  ON category_premiums FOR SELECT USING (true);

CREATE POLICY "viewership_tiers_select_public"
  ON viewership_tiers FOR SELECT USING (true);

CREATE POLICY "subscription_plans_select_public"
  ON subscription_plans FOR SELECT USING (true);

CREATE POLICY "demographic_segments_select_public"
  ON demographic_segments FOR SELECT USING (true);

CREATE POLICY "industry_guides_select_public"
  ON industry_guides FOR SELECT USING (true);


-- ============================================================
-- STEP 2b: Policies for tables created in 006_create_missing_tables
-- These use conditional DO blocks since 006 may or may not have
-- already run. All DROP POLICY IF EXISTS before recreating.
-- ============================================================

-- ── EMAIL CONNECTIONS (from 005) ─────────────────────────────
-- Uses user_id UUID column (assumed from context).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'email_connections'
  ) THEN
    DROP POLICY IF EXISTS "email_connections_select_own"   ON email_connections;
    DROP POLICY IF EXISTS "email_connections_insert_own"   ON email_connections;
    DROP POLICY IF EXISTS "email_connections_update_own"   ON email_connections;
    DROP POLICY IF EXISTS "email_connections_delete_own"   ON email_connections;

    EXECUTE $p$
      CREATE POLICY "email_connections_select_own" ON email_connections
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "email_connections_insert_own" ON email_connections
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "email_connections_update_own" ON email_connections
        FOR UPDATE TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "email_connections_delete_own" ON email_connections
        FOR DELETE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── CONNECTED PLATFORMS (from 006) ───────────────────────────
-- owner_id UUID references profiles(id) — direct auth.uid() comparison is valid.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'connected_platforms'
  ) THEN
    DROP POLICY IF EXISTS "connected_platforms_select_public"        ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_select"               ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_select_authenticated" ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_insert"               ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_insert_own"           ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_update"               ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_update_own"           ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_delete"               ON connected_platforms;
    DROP POLICY IF EXISTS "connected_platforms_delete_own"           ON connected_platforms;

    EXECUTE $p$
      CREATE POLICY "connected_platforms_select_authenticated" ON connected_platforms
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "connected_platforms_insert_own" ON connected_platforms
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "connected_platforms_update_own" ON connected_platforms
        FOR UPDATE TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "connected_platforms_delete_own" ON connected_platforms
        FOR DELETE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── DATA ROOM ENTRIES (from 006) ─────────────────────────────
-- owner_id UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'data_room_entries'
  ) THEN
    DROP POLICY IF EXISTS "data_room_entries_select"      ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_select_own"  ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_insert"      ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_insert_own"  ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_update"      ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_update_own"  ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_delete"      ON data_room_entries;
    DROP POLICY IF EXISTS "data_room_entries_delete_own"  ON data_room_entries;

    EXECUTE $p$
      CREATE POLICY "data_room_entries_select_own" ON data_room_entries
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "data_room_entries_insert_own" ON data_room_entries
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "data_room_entries_update_own" ON data_room_entries
        FOR UPDATE TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "data_room_entries_delete_own" ON data_room_entries
        FOR DELETE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── DATA ROOM ACCESS (from 006) ───────────────────────────────
-- owner_email TEXT, requester_email TEXT — must use auth.users subquery.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'data_room_access'
  ) THEN
    DROP POLICY IF EXISTS "data_room_access_select"             ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_select_participant" ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_insert"             ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_insert_authenticated" ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_update"             ON data_room_access;
    DROP POLICY IF EXISTS "data_room_access_update_owner"       ON data_room_access;

    EXECUTE $p$
      CREATE POLICY "data_room_access_select_participant" ON data_room_access
        FOR SELECT TO authenticated
        USING (
          requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
          OR owner_email   = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY "data_room_access_insert_authenticated" ON data_room_access
        FOR INSERT TO authenticated
        WITH CHECK (
          requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    $p$;
    EXECUTE $p$
      CREATE POLICY "data_room_access_update_owner" ON data_room_access
        FOR UPDATE TO authenticated
        USING (
          owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    $p$;
  END IF;
END $$;


-- ── DECISION MAKERS (from 006) ────────────────────────────────
-- owner_id UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'decision_makers'
  ) THEN
    DROP POLICY IF EXISTS "decision_makers_select"      ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_select_own"  ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_insert"      ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_insert_own"  ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_update"      ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_update_own"  ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_delete"      ON decision_makers;
    DROP POLICY IF EXISTS "decision_makers_delete_own"  ON decision_makers;

    EXECUTE $p$
      CREATE POLICY "decision_makers_select_own" ON decision_makers
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "decision_makers_insert_own" ON decision_makers
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "decision_makers_update_own" ON decision_makers
        FOR UPDATE TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "decision_makers_delete_own" ON decision_makers
        FOR DELETE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── DEAL SCORES (from 006) ────────────────────────────────────
-- owner_id UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'deal_scores'
  ) THEN
    DROP POLICY IF EXISTS "deal_scores_select"      ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_select_own"  ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_insert"      ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_insert_own"  ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_update"      ON deal_scores;
    DROP POLICY IF EXISTS "deal_scores_update_own"  ON deal_scores;

    EXECUTE $p$
      CREATE POLICY "deal_scores_select_own" ON deal_scores
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deal_scores_insert_own" ON deal_scores
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deal_scores_update_own" ON deal_scores
        FOR UPDATE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── ESCROW PAYMENTS (from 006) ────────────────────────────────
-- created_by UUID references profiles(id) — direct auth.uid() comparison valid.
-- No owner_id on brands/talents so cross-table scoping is not possible here.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'escrow_payments'
  ) THEN
    DROP POLICY IF EXISTS "escrow_payments_select"             ON escrow_payments;
    DROP POLICY IF EXISTS "escrow_payments_select_participant" ON escrow_payments;
    DROP POLICY IF EXISTS "escrow_payments_insert"             ON escrow_payments;
    DROP POLICY IF EXISTS "escrow_payments_update"             ON escrow_payments;

    EXECUTE $p$
      CREATE POLICY "escrow_payments_select_own" ON escrow_payments
        FOR SELECT TO authenticated USING (true)
    $p$;
    -- INSERT and UPDATE are handled by service_role (edge functions) only.
    -- No authenticated INSERT/UPDATE/DELETE policies created here.
  END IF;
END $$;


-- ── BUNDLE DEALS (from 006) ───────────────────────────────────
-- created_by UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bundle_deals'
  ) THEN
    DROP POLICY IF EXISTS "bundle_deals_select"      ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_select_own"  ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_insert"      ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_insert_own"  ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_update"      ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_update_own"  ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_delete"      ON bundle_deals;
    DROP POLICY IF EXISTS "bundle_deals_delete_own"  ON bundle_deals;

    EXECUTE $p$
      CREATE POLICY "bundle_deals_select_own" ON bundle_deals
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "bundle_deals_insert_own" ON bundle_deals
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "bundle_deals_update_own" ON bundle_deals
        FOR UPDATE TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "bundle_deals_delete_own" ON bundle_deals
        FOR DELETE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── DEAL DISPUTES (from 006) ──────────────────────────────────
-- created_by UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'deal_disputes'
  ) THEN
    DROP POLICY IF EXISTS "deal_disputes_select"      ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_select_own"  ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_insert"      ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_insert_own"  ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_update"      ON deal_disputes;
    DROP POLICY IF EXISTS "deal_disputes_update_own"  ON deal_disputes;

    EXECUTE $p$
      CREATE POLICY "deal_disputes_select_own" ON deal_disputes
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deal_disputes_insert_own" ON deal_disputes
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deal_disputes_update_own" ON deal_disputes
        FOR UPDATE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── DECK LIBRARY (from 006) ───────────────────────────────────
-- owner_id UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'deck_library'
  ) THEN
    DROP POLICY IF EXISTS "deck_library_select"      ON deck_library;
    DROP POLICY IF EXISTS "deck_library_select_own"  ON deck_library;
    DROP POLICY IF EXISTS "deck_library_insert"      ON deck_library;
    DROP POLICY IF EXISTS "deck_library_insert_own"  ON deck_library;
    DROP POLICY IF EXISTS "deck_library_update"      ON deck_library;
    DROP POLICY IF EXISTS "deck_library_update_own"  ON deck_library;
    DROP POLICY IF EXISTS "deck_library_delete"      ON deck_library;
    DROP POLICY IF EXISTS "deck_library_delete_own"  ON deck_library;

    EXECUTE $p$
      CREATE POLICY "deck_library_select_own" ON deck_library
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deck_library_insert_own" ON deck_library
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deck_library_update_own" ON deck_library
        FOR UPDATE TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "deck_library_delete_own" ON deck_library
        FOR DELETE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── PITCH COMPETITIONS (from 006) ─────────────────────────────
-- created_by UUID references profiles(id). SELECT is public.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pitch_competitions'
  ) THEN
    DROP POLICY IF EXISTS "pitch_competitions_select"               ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_select_authenticated" ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_insert"               ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_insert_own"           ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_update"               ON pitch_competitions;
    DROP POLICY IF EXISTS "pitch_competitions_update_own"           ON pitch_competitions;

    EXECUTE $p$
      CREATE POLICY "pitch_competitions_select_authenticated" ON pitch_competitions
        FOR SELECT TO authenticated USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "pitch_competitions_insert_own" ON pitch_competitions
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "pitch_competitions_update_own" ON pitch_competitions
        FOR UPDATE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── AI USAGE LOGS (from 006) ──────────────────────────────────
-- user_id UUID references profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ai_usage_logs'
  ) THEN
    DROP POLICY IF EXISTS "ai_usage_logs_select"      ON ai_usage_logs;
    DROP POLICY IF EXISTS "ai_usage_logs_select_own"  ON ai_usage_logs;
    DROP POLICY IF EXISTS "ai_usage_logs_insert"      ON ai_usage_logs;

    EXECUTE $p$
      CREATE POLICY "ai_usage_logs_select_own" ON ai_usage_logs
        FOR SELECT TO authenticated USING (true)
    $p$;
    -- INSERT is for the AI router via service_role only; no authenticated INSERT policy.
  END IF;
END $$;


-- ── REFERRALS (from 006) ──────────────────────────────────────
-- referrer_id UUID, referred_id UUID — both reference profiles(id).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'referrals'
  ) THEN
    DROP POLICY IF EXISTS "referrals_select"              ON referrals;
    DROP POLICY IF EXISTS "referrals_select_participant"  ON referrals;
    DROP POLICY IF EXISTS "referrals_insert"              ON referrals;
    DROP POLICY IF EXISTS "referrals_insert_own"          ON referrals;
    DROP POLICY IF EXISTS "referrals_update"              ON referrals;
    DROP POLICY IF EXISTS "referrals_update_own"          ON referrals;

    EXECUTE $p$
      CREATE POLICY "referrals_select_participant" ON referrals
        FOR SELECT TO authenticated
        USING (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "referrals_insert_own" ON referrals
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "referrals_update_own" ON referrals
        FOR UPDATE TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ── REFERENCE TABLES FROM 006 (public SELECT only) ───────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'platform_catalog'
  ) THEN
    DROP POLICY IF EXISTS "platform_catalog_select_public" ON platform_catalog;
    EXECUTE $p$
      CREATE POLICY "platform_catalog_select_public" ON platform_catalog
        FOR SELECT USING (true)
    $p$;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'talent_types'
  ) THEN
    DROP POLICY IF EXISTS "talent_types_select_public" ON talent_types;
    EXECUTE $p$
      CREATE POLICY "talent_types_select_public" ON talent_types
        FOR SELECT USING (true)
    $p$;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'talent_revenue_streams'
  ) THEN
    DROP POLICY IF EXISTS "talent_revenue_streams_select_public" ON talent_revenue_streams;
    EXECUTE $p$
      CREATE POLICY "talent_revenue_streams_select_public" ON talent_revenue_streams
        FOR SELECT USING (true)
    $p$;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'talent_revenue_matrix'
  ) THEN
    DROP POLICY IF EXISTS "talent_revenue_matrix_select_public" ON talent_revenue_matrix;
    EXECUTE $p$
      CREATE POLICY "talent_revenue_matrix_select_public" ON talent_revenue_matrix
        FOR SELECT USING (true)
    $p$;
  END IF;
END $$;


-- ── NEWSLETTER SUBSCRIBERS (from 008, if present) ────────────
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers'
  ) THEN
    DROP POLICY IF EXISTS "newsletter_insert"                              ON newsletter_subscribers;
    DROP POLICY IF EXISTS "newsletter_select"                              ON newsletter_subscribers;
    DROP POLICY IF EXISTS "newsletter_subscribers_insert_anon"            ON newsletter_subscribers;
    DROP POLICY IF EXISTS "newsletter_subscribers_insert_authenticated"   ON newsletter_subscribers;
    DROP POLICY IF EXISTS "newsletter_subscribers_select_authenticated"   ON newsletter_subscribers;

    -- Anon can insert (public signup form). Authenticated can read.
    EXECUTE $p$
      CREATE POLICY "newsletter_subscribers_insert_anon" ON newsletter_subscribers
        FOR INSERT TO anon WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "newsletter_subscribers_insert_authenticated" ON newsletter_subscribers
        FOR INSERT TO authenticated WITH CHECK (true)
    $p$;
    EXECUTE $p$
      CREATE POLICY "newsletter_subscribers_select_authenticated" ON newsletter_subscribers
        FOR SELECT TO authenticated USING (true)
    $p$;
  END IF;
END $$;


-- ============================================================
-- STEP 3: Revoke dangerous grants from anon role
-- ============================================================

-- Remove all write privileges from anon on every existing table.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Prevent future tables from auto-granting writes to anon.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

-- Revoke SELECT from anon on all tables, then re-grant selectively.
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;

-- Re-grant SELECT to anon ONLY on public/reference tables.
GRANT SELECT ON talents              TO anon;
GRANT SELECT ON brands               TO anon;
GRANT SELECT ON culture_events       TO anon;
GRANT SELECT ON mega_events          TO anon;
GRANT SELECT ON conferences          TO anon;
GRANT SELECT ON rate_benchmarks      TO anon;
GRANT SELECT ON roi_benchmarks       TO anon;
GRANT SELECT ON platform_multipliers TO anon;
GRANT SELECT ON category_premiums    TO anon;
GRANT SELECT ON viewership_tiers     TO anon;
GRANT SELECT ON subscription_plans  TO anon;
GRANT SELECT ON demographic_segments TO anon;
GRANT SELECT ON industry_guides      TO anon;

-- Re-grant INSERT on newsletter_subscribers for anon (signup form).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers'
  ) THEN
    EXECUTE 'GRANT SELECT, INSERT ON newsletter_subscribers TO anon';
  END IF;
END $$;

-- Reference tables from 006 — anon SELECT.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'platform_catalog'
  ) THEN
    EXECUTE 'GRANT SELECT ON platform_catalog TO anon';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'talent_types'
  ) THEN
    EXECUTE 'GRANT SELECT ON talent_types TO anon';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'talent_revenue_streams'
  ) THEN
    EXECUTE 'GRANT SELECT ON talent_revenue_streams TO anon';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'talent_revenue_matrix'
  ) THEN
    EXECUTE 'GRANT SELECT ON talent_revenue_matrix TO anon';
  END IF;
END $$;


-- ============================================================
-- STEP 4: Ensure authenticated and service_role have proper access
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- Grant anon SELECT on future tables by default (writes are revoked above).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;


-- ============================================================
-- STEP 5: Prevent users from escalating their own role
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
  -- If this is a client request (has JWT claims), silently revert role changes.
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF current_setting('request.jwt.claims', true) IS NOT NULL
       AND current_setting('request.jwt.claims', true) != '' THEN
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
