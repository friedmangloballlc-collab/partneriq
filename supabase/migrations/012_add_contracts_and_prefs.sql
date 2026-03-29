-- ============================================================
-- 012: Add Contracts, Notification Preferences, and Analytics
--      Daily Snapshots
-- Date: 2026-03-29
-- Purpose: Support contract lifecycle management, per-user
--          notification preferences, and daily analytics
--          snapshots for all three PartnerIQ user roles
--          (Brand, Talent, Agency).
-- ============================================================

BEGIN;

-- ============================================================
-- Shared trigger function: update updated_at on row change
-- Created here because 012 is the first migration to define
-- it; 013 will reference it for back-filling older tables.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. contracts
-- Stores full contract lifecycle for a partnership, including
-- file attachment, payment schedule, and dual-signature
-- timestamps (brand + talent).
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id        uuid        REFERENCES partnerships(id) ON DELETE CASCADE,
  title                 text        NOT NULL,
  contract_type         text,
  terms                 jsonb       DEFAULT '{}',
  total_value           numeric     DEFAULT 0,
  payment_schedule      jsonb       DEFAULT '[]',
  file_url              text,
  status                text        DEFAULT 'draft'
    CHECK (status IN ('draft','sent','negotiating','signed','expired','terminated')),
  signed_by_brand_at    timestamptz,
  signed_by_talent_at   timestamptz,
  effective_date        date,
  expiry_date           date,
  created_by            uuid        REFERENCES profiles(id),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_partnership ON contracts(partnership_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status      ON contracts(status);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_contracts_updated_at ON contracts;
CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Participants (partnership creator or linked brand/talent contact) can read.
-- The USING expression mirrors the participant check used in 010 for
-- partnership_stage_history, extended to also allow the contract creator.
CREATE POLICY contracts_select_participants ON contracts
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM partnerships p
      WHERE p.id = contracts.partnership_id
        AND (
          p.brand_contact_email  = auth.jwt() ->> 'email'
          OR p.talent_contact_email = auth.jwt() ->> 'email'
          OR p.created_by = auth.uid()::text
        )
    )
  );

-- Any authenticated user may insert a contract they own.
CREATE POLICY contracts_insert_own ON contracts
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Only the creator may update.
CREATE POLICY contracts_update_own ON contracts
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- ============================================================
-- 2. notification_preferences
-- One row per user; upserted when the user changes their
-- notification settings in the UI.  Applies to all three
-- user roles.
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid        UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  in_app_enabled           boolean     DEFAULT true,
  email_enabled            boolean     DEFAULT true,
  email_digest_frequency   text        DEFAULT 'daily'
    CHECK (email_digest_frequency IN ('realtime','daily','weekly','none')),
  notify_deal_updates      boolean     DEFAULT true,
  notify_approvals         boolean     DEFAULT true,
  notify_outreach          boolean     DEFAULT true,
  notify_marketplace       boolean     DEFAULT true,
  notify_team              boolean     DEFAULT true,
  quiet_hours_start        time,
  quiet_hours_end          time,
  timezone                 text        DEFAULT 'UTC',
  updated_at               timestamptz DEFAULT now()
);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: own row only
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_preferences_select_own ON notification_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notification_preferences_insert_own ON notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_preferences_update_own ON notification_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notification_preferences_delete_own ON notification_preferences
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 3. analytics_daily_snapshots
-- One row per (user, date); written by a nightly job or an
-- edge function.  Captures pipeline and outreach KPIs for
-- dashboard trend charts accessible to all user roles.
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
  id                    uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid    REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date         date    NOT NULL,
  total_partnerships    integer DEFAULT 0,
  active_pipeline_value numeric DEFAULT 0,
  closed_revenue        numeric DEFAULT 0,
  new_deals_count       integer DEFAULT 0,
  emails_sent           integer DEFAULT 0,
  emails_replied        integer DEFAULT 0,
  ai_requests_used      integer DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  UNIQUE (user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_date
  ON analytics_daily_snapshots(user_id, snapshot_date DESC);

-- RLS: own rows only; no UPDATE/DELETE policy — snapshots are
-- written by the service role and are read-only for users.
ALTER TABLE analytics_daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_snapshots_select_own ON analytics_daily_snapshots
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Service role inserts via edge function; authenticated users
-- are not granted direct INSERT to prevent data tampering.
CREATE POLICY analytics_snapshots_insert_service ON analytics_daily_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON contracts                  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT ON analytics_daily_snapshots                  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  contracts, notification_preferences, analytics_daily_snapshots
TO service_role;

COMMIT;
