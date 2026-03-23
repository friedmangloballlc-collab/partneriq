-- Migration 007: Add composite indexes for common query patterns
-- These indexes target the most frequent multi-column filter and sort
-- combinations used across the DealStage platform, reducing sequential
-- scans on high-traffic tables.

-- ── PARTNERSHIPS ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_partnerships_created_by_status
  ON partnerships(created_by, status);

CREATE INDEX IF NOT EXISTS idx_partnerships_status_brand_id
  ON partnerships(status, brand_id);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, read, created_at DESC);

-- ── OUTREACH EMAILS ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_outreach_emails_partnership_status
  ON outreach_emails(partnership_id, status);

CREATE INDEX IF NOT EXISTS idx_outreach_emails_created_by
  ON outreach_emails(created_by, status);

-- ── TASKS ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status
  ON tasks(assigned_to, status);

-- ── ACTIVITIES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activities_user_created
  ON activities(user_id, created_at DESC);

-- ── MARKETPLACE OPPORTUNITIES ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_opportunities_status
  ON marketplace_opportunities(status, created_at DESC);

-- ── DEAL NOTES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deal_notes_partnership
  ON deal_notes(partnership_id, created_at DESC);

-- ── BILLING HISTORY ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_billing_user
  ON billing_history(user_id, created_at DESC);

-- ── USER SUBSCRIPTIONS ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON user_subscriptions(user_id, status);
