-- Migration 011: Dashboard summary RPC, AI rate limits table, and rate limit RPC
-- Replaces 7 separate dashboard queries with a single RPC call.
-- Replaces COUNT(*) on ai_usage_logs with an atomic upsert counter.

-- ============================================================
-- 1. AI RATE LIMITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  request_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Index for cleanup queries (optional: purge old rows periodically)
CREATE INDEX IF NOT EXISTS ai_rate_limits_date_idx ON ai_rate_limits(date);

-- RLS: service-role only (edge function uses service-role key)
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. ATOMIC RATE LIMIT INCREMENT RPC
-- ============================================================
CREATE OR REPLACE FUNCTION increment_ai_rate_limit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO ai_rate_limits (user_id, date, request_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET request_count = ai_rate_limits.request_count + 1
  RETURNING request_count;
$$;

-- ============================================================
-- 3. DASHBOARD SUMMARY RPC
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_talents   BIGINT;
  v_total_brands    BIGINT;
  v_active_deals    BIGINT;
  v_total_deal_value NUMERIC;
  v_pending_approvals BIGINT;
  v_recent_activities JSON;
BEGIN
  -- Total talents
  SELECT COUNT(*) INTO v_total_talents FROM talents;

  -- Total brands
  SELECT COUNT(*) INTO v_total_brands FROM brands;

  -- Active deals (not completed or churned)
  SELECT COUNT(*), COALESCE(SUM(deal_value), 0)
  INTO v_active_deals, v_total_deal_value
  FROM partnerships
  WHERE status NOT IN ('completed', 'churned');

  -- Pending approvals
  SELECT COUNT(*) INTO v_pending_approvals
  FROM approval_items
  WHERE status = 'pending';

  -- Recent activities (last 10)
  SELECT COALESCE(json_agg(t), '[]'::json)
  INTO v_recent_activities
  FROM (
    SELECT id, type, description, entity_type, entity_id,
           partnership_id, user_id, user_name, metadata, created_at
    FROM activities
    ORDER BY created_at DESC
    LIMIT 10
  ) t;

  RETURN json_build_object(
    'total_talents',     v_total_talents,
    'total_brands',      v_total_brands,
    'active_deals',      v_active_deals,
    'total_deal_value',  v_total_deal_value,
    'pending_approvals', v_pending_approvals,
    'recent_activities', v_recent_activities
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION increment_ai_rate_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_summary(TEXT) TO authenticated;
