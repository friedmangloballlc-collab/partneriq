-- ============================================================
-- 015: Schema Reconciliation
-- Date: 2026-03-29
-- Purpose: Resolve divergence between schema.sql, 001_create_tables.sql,
--          and the columns the frontend actually references.
--
-- Background:
--   schema.sql (the "intended" schema) and 001_create_tables.sql (the
--   migration that may have been run first in some environments) define
--   different column layouts for several tables.  Later frontend code
--   (ManagerSetup.jsx, ManagerProfile.jsx, useFeatureGate.js) also
--   references columns that appear in neither file.
--
--   This migration:
--     1. Creates check_schema_health() — a diagnostic function that
--        compares expected columns against information_schema so you can
--        see exactly what is present vs. what is missing in production.
--     2. Adds every column that is expected by the frontend but may be
--        absent, using IF NOT EXISTS guards so the migration is safe to
--        run against any environment regardless of which prior SQL was
--        applied.
--
-- Run this in Supabase SQL Editor or via the Supabase CLI:
--   supabase db push   (if using managed migrations)
-- ============================================================

BEGIN;

-- ============================================================
-- PART 1 — Diagnostic function
-- Call:  SELECT * FROM check_schema_health();
-- ============================================================

CREATE OR REPLACE FUNCTION check_schema_health()
RETURNS TABLE(
  table_name  text,
  column_name text,
  column_exists  boolean,
  expected_type  text,
  actual_type    text,
  status         text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Expected columns drawn from schema.sql, 001_create_tables.sql, and
  -- every frontend file that performs a Supabase query against these tables.
  WITH expected(tbl, col, expected_type) AS (
    VALUES
    -- ── profiles ──────────────────────────────────────────────
    ('profiles', 'id',                           'uuid'),
    ('profiles', 'email',                        'text'),
    ('profiles', 'full_name',                    'text'),
    -- schema.sql uses company_name; 001 uses company — both should exist
    ('profiles', 'company_name',                 'text'),
    ('profiles', 'company',                      'text'),
    -- schema.sql uses job_title; 001 uses title — both should exist
    ('profiles', 'job_title',                    'text'),
    ('profiles', 'title',                        'text'),
    ('profiles', 'role',                         'text'),
    -- plan is read by useFeatureGate.js and must exist
    ('profiles', 'plan',                         'text'),
    ('profiles', 'phone',                        'text'),
    ('profiles', 'avatar_url',                   'text'),
    ('profiles', 'bio',                          'text'),
    ('profiles', 'website',                      'text'),
    ('profiles', 'location',                     'text'),
    ('profiles', 'onboarding_completed',         'boolean'),
    -- manager columns written by ManagerSetup.jsx and ManagerProfile.jsx
    ('profiles', 'manager_of',                   'uuid'),
    ('profiles', 'manager_verification_status',  'text'),
    ('profiles', 'manager_verification_file',    'text'),
    ('profiles', 'created_at',                   'timestamp with time zone'),
    ('profiles', 'updated_at',                   'timestamp with time zone'),

    -- ── brands ────────────────────────────────────────────────
    ('brands', 'id',              'uuid'),
    ('brands', 'name',            'text'),
    ('brands', 'industry',        'text'),
    -- schema.sql uses partnership_budget; 001 uses annual_budget
    ('brands', 'annual_budget',   'numeric'),
    -- 001 has created_by text; used by frontend filters
    ('brands', 'created_by',      'text'),
    ('brands', 'created_at',      'timestamp with time zone'),
    ('brands', 'updated_at',      'timestamp with time zone'),

    -- ── talents ───────────────────────────────────────────────
    ('talents', 'id',                   'uuid'),
    ('talents', 'name',                 'text'),
    ('talents', 'email',                'text'),
    ('talents', 'niche',                'text'),
    ('talents', 'tier',                 'text'),
    ('talents', 'total_followers',      'integer'),
    ('talents', 'engagement_rate',      'numeric'),
    ('talents', 'brand_safety_score',   'numeric'),
    -- status: 001 has it; ManagerSetup inserts with status='pending'
    ('talents', 'status',               'text'),
    -- category: ManagerSetup.jsx inserts category; ManagerProfile reads it
    ('talents', 'category',             'text'),
    -- social handles written flat by ManagerProfile.jsx
    ('talents', 'phone',                'text'),
    ('talents', 'website',              'text'),
    ('talents', 'instagram',            'text'),
    ('talents', 'youtube',              'text'),
    ('talents', 'tiktok',               'text'),
    ('talents', 'twitter',              'text'),
    ('talents', 'spotify',              'text'),
    -- rate columns used by ManagerProfile rate card
    ('talents', 'rate_min',             'numeric'),
    ('talents', 'rate_max',             'numeric'),
    -- expertise / achievements / manager_commission used by ManagerProfile
    ('talents', 'expertise',            'text'),
    ('talents', 'achievements',         'text'),
    ('talents', 'manager_commission',   'numeric'),
    -- created_by_manager: written by ManagerSetup & ManagerProfile; read
    -- by ManagerProfile to load the talent associated with a manager
    ('talents', 'created_by_manager',   'uuid'),
    -- invite_code: read by ManagerSetup Path-1 invite flow
    ('talents', 'invite_code',          'text'),
    ('talents', 'created_at',           'timestamp with time zone'),
    ('talents', 'updated_at',           'timestamp with time zone'),

    -- ── partnerships ──────────────────────────────────────────
    ('partnerships', 'id',           'uuid'),
    ('partnerships', 'brand_id',     'uuid'),
    ('partnerships', 'talent_id',    'uuid'),
    ('partnerships', 'brand_name',   'text'),
    ('partnerships', 'talent_name',  'text'),
    ('partnerships', 'status',       'text'),
    ('partnerships', 'deal_value',   'numeric'),
    ('partnerships', 'match_score',  'numeric'),
    -- schema.sql created_by is uuid; 001 has no created_by
    -- health check also asks for text variant — both checked
    ('partnerships', 'created_by',   'uuid'),
    ('partnerships', 'created_at',   'timestamp with time zone'),
    ('partnerships', 'updated_at',   'timestamp with time zone'),

    -- ── notifications ─────────────────────────────────────────
    ('notifications', 'id',         'uuid'),
    -- schema.sql uses user_id uuid; 001 uses user_email text
    -- code may filter by either; both should exist
    ('notifications', 'user_id',    'uuid'),
    ('notifications', 'user_email', 'text'),
    ('notifications', 'status',     'text'),
    ('notifications', 'created_at', 'timestamp with time zone'),

    -- ── teams ─────────────────────────────────────────────────
    ('teams', 'id',          'uuid'),
    -- schema.sql uses owner_id uuid; 001 uses owner_email text
    ('teams', 'owner_id',    'uuid'),
    ('teams', 'owner_email', 'text'),
    ('teams', 'created_at',  'timestamp with time zone'),

    -- ── team_members ──────────────────────────────────────────
    ('team_members', 'id',           'uuid'),
    ('team_members', 'team_id',      'uuid'),
    -- schema.sql uses email text; 001 uses member_email text
    ('team_members', 'email',        'text'),
    ('team_members', 'member_email', 'text'),
    ('team_members', 'created_at',   'timestamp with time zone'),

    -- ── user_subscriptions ────────────────────────────────────
    ('user_subscriptions', 'id',           'uuid'),
    ('user_subscriptions', 'user_id',      'uuid'),
    ('user_subscriptions', 'user_email',   'text'),
    -- current_plan exists in schema.sql but not in 001
    ('user_subscriptions', 'current_plan', 'text'),
    ('user_subscriptions', 'status',       'text'),
    ('user_subscriptions', 'created_at',   'timestamp with time zone')
  )
  SELECT
    e.tbl                                             AS table_name,
    e.col                                             AS column_name,
    (c.column_name IS NOT NULL)                       AS column_exists,
    e.expected_type                                   AS expected_type,
    COALESCE(c.data_type, 'MISSING')                  AS actual_type,
    CASE
      WHEN c.column_name IS NULL                      THEN 'MISSING'
      WHEN c.data_type != e.expected_type             THEN 'TYPE_MISMATCH'
      ELSE 'OK'
    END                                               AS status
  FROM expected e
  LEFT JOIN information_schema.columns c
    ON  c.table_schema = 'public'
    AND c.table_name   = e.tbl
    AND c.column_name  = e.col
  ORDER BY e.tbl, e.col;
END;
$$;

GRANT EXECUTE ON FUNCTION check_schema_health() TO authenticated;


-- ============================================================
-- PART 2 — Add missing columns
--
-- Every ALTER TABLE below uses "IF NOT EXISTS" so the statement
-- is a no-op when the column already exists.  No data is lost.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN

  -- plan — read by useFeatureGate.js on every page load
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan text DEFAULT 'free';
  END IF;

  -- company_name — schema.sql column; 001 used "company" instead
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_name text;
    -- Back-fill from "company" if that column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company'
    ) THEN
      UPDATE profiles SET company_name = company WHERE company_name IS NULL AND company IS NOT NULL;
    END IF;
  END IF;

  -- company — 001 column; keep for backward-compat
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company text;
  END IF;

  -- job_title — schema.sql column; 001 used "title" instead
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN job_title text;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'title'
    ) THEN
      UPDATE profiles SET job_title = title WHERE job_title IS NULL AND title IS NOT NULL;
    END IF;
  END IF;

  -- title — 001 column; keep for backward-compat
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN title text;
  END IF;

  -- bio — present in schema.sql, absent from 001
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;

  -- website — present in schema.sql, absent from 001
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;

  -- location — present in schema.sql, absent from 001
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;

  -- manager_of — written by ManagerSetup.jsx (Path 1 & Path 2) and ManagerProfile.jsx
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'manager_of'
  ) THEN
    ALTER TABLE profiles ADD COLUMN manager_of uuid;
  END IF;

  -- manager_verification_status — written by ManagerSetup.jsx Path 2
  --   values: 'pending' | 'approved' | 'rejected'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'manager_verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN manager_verification_status text;
  END IF;

  -- manager_verification_file — Storage path written by ManagerSetup.jsx Path 2
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'manager_verification_file'
  ) THEN
    ALTER TABLE profiles ADD COLUMN manager_verification_file text;
  END IF;

END $$;


-- ────────────────────────────────────────────────────────────
-- brands
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN

  -- annual_budget — 001 has it; schema.sql uses partnership_budget instead
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'annual_budget'
  ) THEN
    ALTER TABLE brands ADD COLUMN annual_budget numeric DEFAULT 0;
    -- Back-fill from partnership_budget if present
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'partnership_budget'
    ) THEN
      UPDATE brands SET annual_budget = partnership_budget WHERE annual_budget = 0 AND partnership_budget IS NOT NULL;
    END IF;
  END IF;

  -- created_by — 001 stores creator email as text; frontend filters use it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE brands ADD COLUMN created_by text;
  END IF;

END $$;


-- ────────────────────────────────────────────────────────────
-- talents
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN

  -- status — 001 has it (active/pending); ManagerSetup inserts 'pending'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'status'
  ) THEN
    ALTER TABLE talents ADD COLUMN status text DEFAULT 'active';
  END IF;

  -- category — ManagerSetup.jsx inserts category; ManagerProfile.jsx reads/writes it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'category'
  ) THEN
    ALTER TABLE talents ADD COLUMN category text;
  END IF;

  -- phone — ManagerProfile stores a flat phone number for the talent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'phone'
  ) THEN
    ALTER TABLE talents ADD COLUMN phone text;
  END IF;

  -- website — ManagerProfile stores the talent's personal website
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'website'
  ) THEN
    ALTER TABLE talents ADD COLUMN website text;
  END IF;

  -- instagram — short handle stored flat; schema.sql uses social_instagram instead
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'instagram'
  ) THEN
    ALTER TABLE talents ADD COLUMN instagram text;
    -- Back-fill from social_instagram if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'social_instagram'
    ) THEN
      UPDATE talents SET instagram = social_instagram WHERE instagram IS NULL AND social_instagram IS NOT NULL;
    END IF;
  END IF;

  -- youtube — short handle / URL stored flat; schema.sql uses social_youtube
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'youtube'
  ) THEN
    ALTER TABLE talents ADD COLUMN youtube text;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'social_youtube'
    ) THEN
      UPDATE talents SET youtube = social_youtube WHERE youtube IS NULL AND social_youtube IS NOT NULL;
    END IF;
  END IF;

  -- tiktok — schema.sql uses social_tiktok
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'tiktok'
  ) THEN
    ALTER TABLE talents ADD COLUMN tiktok text;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'social_tiktok'
    ) THEN
      UPDATE talents SET tiktok = social_tiktok WHERE tiktok IS NULL AND social_tiktok IS NOT NULL;
    END IF;
  END IF;

  -- twitter — schema.sql uses social_twitter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'twitter'
  ) THEN
    ALTER TABLE talents ADD COLUMN twitter text;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'social_twitter'
    ) THEN
      UPDATE talents SET twitter = social_twitter WHERE twitter IS NULL AND social_twitter IS NOT NULL;
    END IF;
  END IF;

  -- spotify — no equivalent in schema.sql or 001; added for ManagerProfile
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'spotify'
  ) THEN
    ALTER TABLE talents ADD COLUMN spotify text;
  END IF;

  -- rate_min — minimum deal rate; ManagerProfile reads/writes as integer
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'rate_min'
  ) THEN
    ALTER TABLE talents ADD COLUMN rate_min numeric;
  END IF;

  -- rate_max — maximum deal rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'rate_max'
  ) THEN
    ALTER TABLE talents ADD COLUMN rate_max numeric;
  END IF;

  -- expertise — free-text expertise areas; ManagerProfile textarea
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'expertise'
  ) THEN
    ALTER TABLE talents ADD COLUMN expertise text;
  END IF;

  -- achievements — notable achievements; ManagerProfile textarea
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'achievements'
  ) THEN
    ALTER TABLE talents ADD COLUMN achievements text;
  END IF;

  -- manager_commission — percentage stored as integer/numeric; ManagerProfile reads/writes it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'manager_commission'
  ) THEN
    ALTER TABLE talents ADD COLUMN manager_commission numeric DEFAULT 15;
  END IF;

  -- created_by_manager — UUID of the profiles row for the managing agent
  --   written by ManagerSetup.jsx Path 2 and ManagerProfile.jsx
  --   queried by ManagerProfile: .eq("created_by_manager", authUser.id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'created_by_manager'
  ) THEN
    ALTER TABLE talents ADD COLUMN created_by_manager uuid;
  END IF;

  -- invite_code — unique token a talent shares with their manager (Path 1 invite flow)
  --   ManagerSetup.jsx: .eq("invite_code", code)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'talents' AND column_name = 'invite_code'
  ) THEN
    ALTER TABLE talents ADD COLUMN invite_code text;
    CREATE UNIQUE INDEX IF NOT EXISTS talents_invite_code_idx ON talents(invite_code)
      WHERE invite_code IS NOT NULL;
  END IF;

END $$;


-- ────────────────────────────────────────────────────────────
-- notifications
-- ────────────────────────────────────────────────────────────
-- schema.sql uses user_id (uuid); 001 uses user_email (text).
-- Add whichever is missing so both query patterns work.
DO $$ BEGIN

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE notifications ADD COLUMN user_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- status — 001 uses status ('unread'/'read'); schema.sql uses read boolean.
  -- Add status column for 001-style code paths.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'status'
  ) THEN
    ALTER TABLE notifications ADD COLUMN status text DEFAULT 'unread';
  END IF;

END $$;

-- Index for the new user_email column (mirrors existing user_id index)
CREATE INDEX IF NOT EXISTS notifications_user_email_idx ON notifications(user_email);


-- ────────────────────────────────────────────────────────────
-- teams
-- ────────────────────────────────────────────────────────────
-- schema.sql uses owner_id (uuid); 001 uses owner_email (text).
DO $$ BEGIN

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'owner_email'
  ) THEN
    ALTER TABLE teams ADD COLUMN owner_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE teams ADD COLUMN owner_id uuid REFERENCES profiles(id);
  END IF;

END $$;


-- ────────────────────────────────────────────────────────────
-- team_members
-- ────────────────────────────────────────────────────────────
-- schema.sql uses email (text); 001 uses member_email (text).
DO $$ BEGIN

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'member_email'
  ) THEN
    ALTER TABLE team_members ADD COLUMN member_email text;
    -- Back-fill from email if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'email'
    ) THEN
      UPDATE team_members SET member_email = email WHERE member_email IS NULL AND email IS NOT NULL;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'email'
  ) THEN
    ALTER TABLE team_members ADD COLUMN email text;
  END IF;

END $$;


-- ────────────────────────────────────────────────────────────
-- user_subscriptions
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN

  -- current_plan — exists in schema.sql, absent from 001
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_subscriptions' AND column_name = 'current_plan'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN current_plan text;
  END IF;

  -- user_email — exists in 001, may be absent from schema.sql-only deployments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_subscriptions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN user_email text;
  END IF;

END $$;


-- ============================================================
-- PART 3 — Ensure grants cover any columns just added
-- (The broad grants in schema.sql already cover all tables;
--  this is a belt-and-suspenders reminder in case this
--  migration is applied to an environment where those grants
--  were never run.)
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE ON brands            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON talents   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications     TO authenticated;
GRANT SELECT, INSERT, UPDATE ON teams             TO authenticated;
GRANT SELECT, INSERT, UPDATE ON team_members      TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;

COMMIT;

-- ============================================================
-- USAGE
-- After applying this migration, run:
--
--   SELECT * FROM check_schema_health()
--   WHERE status != 'OK'
--   ORDER BY table_name, column_name;
--
-- A result with zero rows means every expected column is
-- present with a matching type.  Rows with status='MISSING'
-- indicate columns that still need to be added.  Rows with
-- status='TYPE_MISMATCH' indicate columns that exist but
-- have a different data type than expected — review manually
-- before changing types on a live table.
-- ============================================================
