-- ============================================================
-- Grant table access to anon and authenticated roles
-- ============================================================
-- Supabase JS client uses the anon key which maps to the
-- "anon" Postgres role.  RLS policies control *which* rows
-- are visible, but the role still needs basic table-level
-- privileges or every query silently returns zero rows.
-- ============================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

-- Make sure any tables created in the future are also accessible
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
