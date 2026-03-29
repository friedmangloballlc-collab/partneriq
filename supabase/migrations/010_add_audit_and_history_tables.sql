-- 010: Add audit_logs and partnership_stage_history tables

BEGIN;

-- ============================================================
-- audit_logs: tracks all significant user actions
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id),
  action        text NOT NULL,
  entity_type   text NOT NULL,
  entity_id     uuid,
  old_values    jsonb,
  new_values    jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
  ON audit_logs(user_id, created_at DESC);

-- ============================================================
-- partnership_stage_history: tracks every status transition
-- ============================================================
CREATE TABLE IF NOT EXISTS partnership_stage_history (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id    uuid NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  from_status       text,
  to_status         text NOT NULL,
  changed_by        uuid REFERENCES profiles(id),
  notes             text,
  duration_in_stage interval,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stage_history_partnership
  ON partnership_stage_history(partnership_id, created_at DESC);

-- ============================================================
-- RLS policies
-- ============================================================

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select_own ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY audit_logs_insert_service ON audit_logs
  FOR INSERT
  WITH CHECK (
    current_setting('role') = 'service_role'
    OR auth.uid() IS NOT NULL
  );

-- partnership_stage_history
ALTER TABLE partnership_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY stage_history_select_participants ON partnership_stage_history
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY stage_history_insert_service ON partnership_stage_history
  FOR INSERT
  WITH CHECK (
    current_setting('role') = 'service_role'
    OR auth.uid() IS NOT NULL
  );

COMMIT;
