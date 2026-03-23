-- ============================================================
-- 005: Fix RLS Policies and Revoke Anon Write Access
--
-- SECURITY MIGRATION - Production hardening
--
-- This migration:
--   1. Drops all wide-open USING(true) / WITH CHECK(true) RLS policies
--   2. Creates proper row-level security policies scoped to auth.uid()
--   3. Revokes INSERT/UPDATE/DELETE from the anon role
--   4. Grants anon SELECT only on public reference/lookup tables
--   5. Adds a trigger to prevent users from changing their own role
--   6. Creates the email_connections table (used by edge functions)
--   7. Re-enables RLS on reference tables that were disabled
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 0: Create email_connections table if it does not exist
-- (Referenced by edge functions but never created in migrations)
-- ============================================================
CREATE TABLE IF NOT EXISTS email_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  provider text NOT NULL DEFAULT 'google',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active','expired','revoked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_connections_user_idx ON email_connections(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_connections_unique ON email_connections(user_id, email_address);

ALTER TABLE email_connections ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 1: Re-enable RLS on reference tables that fix_rls_and_seed
-- may have disabled
-- ============================================================
ALTER TABLE rate_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_premiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographic_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_guides ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Drop ALL existing wide-open RLS policies
-- Using DO block for safety — drops only if they exist
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
-- STEP 3: Create proper RLS policies
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────────
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ── BRANDS ──────────────────────────────────────────────────
CREATE POLICY "brands_select_authenticated"
  ON brands FOR SELECT TO authenticated USING (true);

CREATE POLICY "brands_insert_authenticated"
  ON brands FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "brands_update_own"
  ON brands FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "brands_delete_own"
  ON brands FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ── TALENTS ─────────────────────────────────────────────────
CREATE POLICY "talents_select_authenticated"
  ON talents FOR SELECT TO authenticated USING (true);

CREATE POLICY "talents_insert_authenticated"
  ON talents FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "talents_update_own"
  ON talents FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "talents_delete_own"
  ON talents FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ── PARTNERSHIPS ─────────────────────────────────────────────
CREATE POLICY "partnerships_select_own"
  ON partnerships FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "partnerships_insert_authenticated"
  ON partnerships FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "partnerships_update_own"
  ON partnerships FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "partnerships_delete_own"
  ON partnerships FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ── DEAL NOTES ───────────────────────────────────────────────
CREATE POLICY "deal_notes_select_own"
  ON deal_notes FOR SELECT TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "deal_notes_insert_authenticated"
  ON deal_notes FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "deal_notes_update_own"
  ON deal_notes FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "deal_notes_delete_own"
  ON deal_notes FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- ── TASKS ────────────────────────────────────────────────────
CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "tasks_insert_authenticated"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "tasks_delete_own"
  ON tasks FOR DELETE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_authenticated"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── OUTREACH EMAILS ──────────────────────────────────────────
CREATE POLICY "outreach_emails_select_own"
  ON outreach_emails FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "outreach_emails_insert_authenticated"
  ON outreach_emails FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "outreach_emails_update_own"
  ON outreach_emails FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "outreach_emails_delete_own"
  ON outreach_emails FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ── OUTREACH SEQUENCES ──────────────────────────────────────
CREATE POLICY "outreach_sequences_select_own"
  ON outreach_sequences FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "outreach_sequences_insert_authenticated"
  ON outreach_sequences FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "outreach_sequences_update_own"
  ON outreach_sequences FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "outreach_sequences_delete_own"
  ON outreach_sequences FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ── OUTREACH METRICS ─────────────────────────────────────────
CREATE POLICY "outreach_metrics_select_own"
  ON outreach_metrics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM outreach_sequences os
      WHERE os.id = outreach_metrics.sequence_id
        AND os.created_by = auth.uid()
    )
  );

CREATE POLICY "outreach_metrics_insert_authenticated"
  ON outreach_metrics FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM outreach_sequences os
      WHERE os.id = outreach_metrics.sequence_id
        AND os.created_by = auth.uid()
    )
  );

-- ── MARKETPLACE OPPORTUNITIES ────────────────────────────────
-- NOTE: This table uses posted_by, not created_by
CREATE POLICY "marketplace_opportunities_select_authenticated"
  ON marketplace_opportunities FOR SELECT TO authenticated USING (true);

CREATE POLICY "marketplace_opportunities_insert_authenticated"
  ON marketplace_opportunities FOR INSERT TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "marketplace_opportunities_update_own"
  ON marketplace_opportunities FOR UPDATE TO authenticated
  USING (posted_by = auth.uid());

CREATE POLICY "marketplace_opportunities_delete_own"
  ON marketplace_opportunities FOR DELETE TO authenticated
  USING (posted_by = auth.uid());

-- ── OPPORTUNITY APPLICATIONS ─────────────────────────────────
CREATE POLICY "opportunity_applications_select_own"
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
  WITH CHECK (true);

CREATE POLICY "opportunity_applications_update_own"
  ON opportunity_applications FOR UPDATE TO authenticated
  USING (
    talent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM marketplace_opportunities mo
      WHERE mo.id = opportunity_applications.opportunity_id
        AND mo.posted_by = auth.uid()
    )
  );

-- ── USER SUBSCRIPTIONS ───────────────────────────────────────
-- Only own subscription. No client INSERT — service_role manages.
CREATE POLICY "user_subscriptions_select_own"
  ON user_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_update_own"
  ON user_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ── BILLING HISTORY ──────────────────────────────────────────
-- Read-only for owning user. All writes via service role.
CREATE POLICY "billing_history_select_own"
  ON billing_history FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ── ACTIVITIES ───────────────────────────────────────────────
CREATE POLICY "activities_select_own"
  ON activities FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "activities_insert_authenticated"
  ON activities FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ── APPROVAL ITEMS ───────────────────────────────────────────
CREATE POLICY "approval_items_select_own"
  ON approval_items FOR SELECT TO authenticated
  USING (submitted_by = auth.uid() OR reviewed_by = auth.uid());

CREATE POLICY "approval_items_insert_authenticated"
  ON approval_items FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "approval_items_update_own"
  ON approval_items FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() OR reviewed_by = auth.uid());

-- ── TEAMS ────────────────────────────────────────────────────
CREATE POLICY "teams_select_own"
  ON teams FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "teams_insert_authenticated"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_update_own"
  ON teams FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "teams_delete_own"
  ON teams FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ── TEAM MEMBERS ─────────────────────────────────────────────
CREATE POLICY "team_members_select_own"
  ON team_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_insert_team_owner"
  ON team_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_delete_team_owner"
  ON team_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

-- ── EMAIL CONNECTIONS ────────────────────────────────────────
CREATE POLICY "email_connections_select_own"
  ON email_connections FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "email_connections_insert_own"
  ON email_connections FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "email_connections_update_own"
  ON email_connections FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "email_connections_delete_own"
  ON email_connections FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── PARTNERSHIP PROPOSALS ────────────────────────────────────
CREATE POLICY "partnership_proposals_select_own"
  ON partnership_proposals FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "partnership_proposals_insert_authenticated"
  ON partnership_proposals FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "partnership_proposals_update_own"
  ON partnership_proposals FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- ── ACTIVATION CHECKLISTS ────────────────────────────────────
CREATE POLICY "activation_checklists_select_own"
  ON activation_checklists FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "activation_checklists_insert_authenticated"
  ON activation_checklists FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "activation_checklists_update_own"
  ON activation_checklists FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- ── PLANNING TIMELINES ───────────────────────────────────────
CREATE POLICY "planning_timelines_select_own"
  ON planning_timelines FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "planning_timelines_insert_authenticated"
  ON planning_timelines FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "planning_timelines_update_own"
  ON planning_timelines FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- ── REFERENCE / LOOKUP TABLES ────────────────────────────────
-- SELECT for everyone (including anon). No mutations for non-service-role.
CREATE POLICY "rate_benchmarks_select_public" ON rate_benchmarks FOR SELECT USING (true);
CREATE POLICY "roi_benchmarks_select_public" ON roi_benchmarks FOR SELECT USING (true);
CREATE POLICY "platform_multipliers_select_public" ON platform_multipliers FOR SELECT USING (true);
CREATE POLICY "category_premiums_select_public" ON category_premiums FOR SELECT USING (true);
CREATE POLICY "viewership_tiers_select_public" ON viewership_tiers FOR SELECT USING (true);
CREATE POLICY "subscription_plans_select_public" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "culture_events_select_public" ON culture_events FOR SELECT USING (true);
CREATE POLICY "mega_events_select_public" ON mega_events FOR SELECT USING (true);
CREATE POLICY "conferences_select_public" ON conferences FOR SELECT USING (true);
CREATE POLICY "demographic_segments_select_public" ON demographic_segments FOR SELECT USING (true);
CREATE POLICY "industry_guides_select_public" ON industry_guides FOR SELECT USING (true);


-- ============================================================
-- STEP 4: Revoke anon write access and fix role grants
-- ============================================================

REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

GRANT SELECT ON subscription_plans, rate_benchmarks, roi_benchmarks,
  platform_multipliers, category_premiums, viewership_tiers,
  culture_events, mega_events, conferences, demographic_segments,
  industry_guides TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;


-- ============================================================
-- STEP 5: Prevent users from changing their own role
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $fn$
BEGIN
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
