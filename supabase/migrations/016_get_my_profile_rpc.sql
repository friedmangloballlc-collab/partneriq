-- Migration 016: SECURITY DEFINER RPC to fetch own profile
-- Bypasses RLS so there's no race condition with auth.uid() propagation.
-- Only returns the row matching the caller's auth.uid() — no privilege escalation.

CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM profiles WHERE id = auth.uid();
$$;

-- Only authenticated users can call this
REVOKE ALL ON FUNCTION get_my_profile() FROM anon;
GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;
