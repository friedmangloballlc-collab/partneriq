-- Migration 020: Cron Job Setup Instructions
-- Supabase Dashboard → Database → Extensions → Enable pg_cron
-- Then go to Database → Cron Jobs and add these:

-- 1. Trial Emails (daily at 9am UTC)
-- Schedule: 0 9 * * *
-- Command: SELECT net.http_post(
--   'https://eiygbtpsfumwvhzbudij.supabase.co/functions/v1/sendTrialEmails'::text,
--   '{}',
--   'application/json',
--   '{"Authorization": "Bearer YOUR_CRON_SECRET"}'
-- );

-- 2. Refresh Enrichments (daily at 3am UTC)
-- Schedule: 0 3 * * *
-- Command: SELECT net.http_post(
--   'https://eiygbtpsfumwvhzbudij.supabase.co/functions/v1/refreshEnrichments'::text,
--   '{}',
--   'application/json',
--   '{"Authorization": "Bearer YOUR_CRON_SECRET"}'
-- );

-- NOTE: Replace YOUR_CRON_SECRET with the actual CRON_SECRET from edge function secrets.
-- Enable pg_net extension first: CREATE EXTENSION IF NOT EXISTS pg_net;
