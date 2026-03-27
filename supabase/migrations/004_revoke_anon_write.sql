-- ============================================================
-- 004: Revoke Anon Write Access
-- ============================================================
--
-- SECURITY MIGRATION — Defense-in-depth for anon role lockdown
--
-- Context:
--   Migration 002_grant_anon_access.sql granted full INSERT, UPDATE,
--   DELETE on ALL tables to the `anon` role. This was intended for
--   local development but is a critical security vulnerability in
--   production: any unauthenticated user with the Supabase anon key
--   can modify or delete data in every table, regardless of RLS
--   policies (which were also wide-open USING(true)).
--
-- What 002 did:
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
--   ALTER DEFAULT PRIVILEGES ... GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;
--
-- What this migration does:
--   1. REVOKES INSERT, UPDATE, DELETE from anon on ALL tables
--   2. REVOKES the default privilege that auto-grants writes to anon on future tables
--   3. Explicitly re-grants SELECT to anon ONLY on tables that need
--      unauthenticated public read access:
--        - talents (public discovery)
--        - brands (public brand profiles)
--        - culture_events (public calendar)
--        - mega_events (public event listings)
--        - conferences (public conference listings)
--        - rate_benchmarks (public reference data)
--        - roi_benchmarks (public reference data)
--        - platform_multipliers (public reference data)
--        - category_premiums (public reference data)
--        - viewership_tiers (public reference data)
--        - subscription_plans (public pricing page)
--        - demographic_segments (public reference data)
--        - industry_guides (public reference data)
--        - platform_catalog (public reference data, from 006)
--        - talent_types (public reference data, from 006)
--        - talent_revenue_streams (public reference data, from 006)
--        - talent_revenue_matrix (public reference data, from 006)
--        - newsletter_subscribers (INSERT only — signup form, from 008)
--   4. Confirms that authenticated and service_role retain full access
--
-- This migration is idempotent and safe to re-run.
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Revoke ALL write privileges from anon
-- ============================================================

-- Revoke on all current tables
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Revoke the default privilege so future tables do not auto-grant writes to anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

-- ============================================================
-- STEP 2: Revoke SELECT from anon on all tables, then re-grant
-- selectively. This ensures anon cannot read sensitive tables like
-- billing_history, notifications, outreach_emails, user_subscriptions, etc.
-- ============================================================

REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;

-- Public discovery / reference tables — anon SELECT allowed
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

-- Tables from 006_create_missing_tables (conditionally grant if they exist)
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
-- STEP 3: Newsletter subscribers — anon needs INSERT for signup form
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
    EXECUTE 'GRANT SELECT, INSERT ON newsletter_subscribers TO anon';
  END IF;
END $$;

-- ============================================================
-- STEP 4: Confirm authenticated and service_role are not affected
-- ============================================================

-- Schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Authenticated keeps full CRUD (RLS policies control row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- service_role keeps full CRUD (bypasses RLS — used by edge functions)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- Future tables: anon gets SELECT only (writes already revoked above)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

COMMIT;
