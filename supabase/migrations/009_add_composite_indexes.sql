-- 009: Add composite indexes for high-frequency queries
-- Identified by performance audit

BEGIN;

CREATE INDEX IF NOT EXISTS idx_opp_apps_opportunity_status
  ON opportunity_applications(opportunity_id, status);

CREATE INDEX IF NOT EXISTS idx_talents_niche_tier
  ON talents(niche, tier);

CREATE INDEX IF NOT EXISTS idx_partnerships_status_created
  ON partnerships(status, created_at DESC);

-- escrow_payments may not exist yet; guard with DO block
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'escrow_payments'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_escrow_partnership_status ON escrow_payments(partnership_id, status)';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_outreach_emails_status
  ON outreach_emails(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_email, read);

CREATE INDEX IF NOT EXISTS idx_approval_items_status
  ON approval_items(status, priority);

CREATE INDEX IF NOT EXISTS idx_activities_created
  ON activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brands_industry
  ON brands(industry);

CREATE INDEX IF NOT EXISTS idx_talents_platform
  ON talents(primary_platform);

COMMIT;
