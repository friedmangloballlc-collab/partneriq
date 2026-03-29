-- ============================================================
-- 013: Back-fill update_updated_at() triggers
-- Date: 2026-03-29
-- Purpose: Apply the update_updated_at() trigger (defined in
--          012) to all tables from migration 006 that carry an
--          updated_at column but were shipped without a trigger.
--          Using DROP … IF EXISTS + CREATE keeps the migration
--          idempotent (safe to re-run).
-- Tables covered:
--   connected_platforms, data_room_entries, decision_makers,
--   deal_scores, escrow_payments, bundle_deals, deal_disputes,
--   deck_library, pitch_competitions
-- Note: deal_scores has no updated_at column (only created_at /
--       calculated_at) — confirmed against 006; omitted here.
-- ============================================================

BEGIN;

-- Verify the shared trigger function exists (defined in 012).
-- This guard prevents a confusing error if migrations are run
-- out of order.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'update_updated_at'
  ) THEN
    RAISE EXCEPTION
      'update_updated_at() function not found — run 012 first.';
  END IF;
END;
$$;

-- ============================================================
-- 1. connected_platforms
-- ============================================================
DROP TRIGGER IF EXISTS trg_connected_platforms_updated_at
  ON connected_platforms;
CREATE TRIGGER trg_connected_platforms_updated_at
  BEFORE UPDATE ON connected_platforms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 2. data_room_entries
-- ============================================================
DROP TRIGGER IF EXISTS trg_data_room_entries_updated_at
  ON data_room_entries;
CREATE TRIGGER trg_data_room_entries_updated_at
  BEFORE UPDATE ON data_room_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 3. decision_makers
-- ============================================================
DROP TRIGGER IF EXISTS trg_decision_makers_updated_at
  ON decision_makers;
CREATE TRIGGER trg_decision_makers_updated_at
  BEFORE UPDATE ON decision_makers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. escrow_payments
-- ============================================================
DROP TRIGGER IF EXISTS trg_escrow_payments_updated_at
  ON escrow_payments;
CREATE TRIGGER trg_escrow_payments_updated_at
  BEFORE UPDATE ON escrow_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. bundle_deals
-- ============================================================
DROP TRIGGER IF EXISTS trg_bundle_deals_updated_at
  ON bundle_deals;
CREATE TRIGGER trg_bundle_deals_updated_at
  BEFORE UPDATE ON bundle_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. deal_disputes
-- ============================================================
DROP TRIGGER IF EXISTS trg_deal_disputes_updated_at
  ON deal_disputes;
CREATE TRIGGER trg_deal_disputes_updated_at
  BEFORE UPDATE ON deal_disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 7. deck_library
-- ============================================================
DROP TRIGGER IF EXISTS trg_deck_library_updated_at
  ON deck_library;
CREATE TRIGGER trg_deck_library_updated_at
  BEFORE UPDATE ON deck_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. pitch_competitions
-- ============================================================
DROP TRIGGER IF EXISTS trg_pitch_competitions_updated_at
  ON pitch_competitions;
CREATE TRIGGER trg_pitch_competitions_updated_at
  BEFORE UPDATE ON pitch_competitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Note on deal_scores
-- ============================================================
-- deal_scores (006) has no updated_at column — it uses
-- calculated_at to record when the score was last recomputed.
-- No trigger is needed or created for that table.

COMMIT;
