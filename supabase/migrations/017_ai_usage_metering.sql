-- Migration 017: AI Usage Metering
-- Tracks per-user monthly AI query counts for tier-based limits.
-- Free = 5/month, Tier 1 = 50/month, Tier 2+ = unlimited.

CREATE TABLE IF NOT EXISTS ai_usage (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,  -- format: 'YYYY-MM'
  query_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- RLS: users can only read/write their own usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_select_own"
  ON ai_usage FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "ai_usage_insert_own"
  ON ai_usage FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_usage_update_own"
  ON ai_usage FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RPC to atomically increment usage and return current count
CREATE OR REPLACE FUNCTION increment_ai_usage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  new_count INTEGER;
BEGIN
  INSERT INTO ai_usage (user_id, month, query_count)
  VALUES (auth.uid(), current_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET query_count = ai_usage.query_count + 1
  RETURNING query_count INTO new_count;

  RETURN new_count;
END;
$$;

-- RPC to get current month usage
CREATE OR REPLACE FUNCTION get_ai_usage()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT query_count FROM ai_usage
     WHERE user_id = auth.uid()
     AND month = to_char(now(), 'YYYY-MM')),
    0
  );
$$;

REVOKE ALL ON FUNCTION increment_ai_usage() FROM anon;
GRANT EXECUTE ON FUNCTION increment_ai_usage() TO authenticated;

REVOKE ALL ON FUNCTION get_ai_usage() FROM anon;
GRANT EXECUTE ON FUNCTION get_ai_usage() TO authenticated;
