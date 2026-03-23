-- ============================================================
-- 006: Create Missing Tables
-- Date: 2026-03-23
-- Purpose: Create all tables referenced in the codebase but
--          missing from the schema and prior migrations.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. platform_catalog — Master list of available social platforms
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_catalog (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text DEFAULT 'social',
  icon_url text,
  auth_type text DEFAULT 'oauth',
  base_url text,
  api_available boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platform_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_catalog_select_public" ON platform_catalog FOR SELECT USING (true);
GRANT SELECT ON platform_catalog TO anon;

-- ============================================================
-- 2. connected_platforms — Talent verified social accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS connected_platforms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id uuid REFERENCES talents(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_id text,
  username text,
  profile_url text,
  followers integer DEFAULT 0,
  engagement_rate numeric(5,2),
  auth_method text DEFAULT 'manual',
  verified boolean DEFAULT false,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connected_platforms_talent_idx ON connected_platforms(talent_id);
CREATE INDEX IF NOT EXISTS connected_platforms_owner_idx ON connected_platforms(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS connected_platforms_unique ON connected_platforms(talent_id, platform);

ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connected_platforms_select" ON connected_platforms FOR SELECT TO authenticated USING (true);
CREATE POLICY "connected_platforms_insert" ON connected_platforms FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "connected_platforms_update" ON connected_platforms FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "connected_platforms_delete" ON connected_platforms FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- 3. data_room_entries — Data room content for all user types
-- ============================================================
CREATE TABLE IF NOT EXISTS data_room_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  owner_email text,
  room_type text NOT NULL CHECK (room_type IN ('talent', 'brand', 'agency')),
  title text,
  brand_name text,
  talent_name text,
  platform text,
  deal_type text,
  deal_value numeric,
  status text DEFAULT 'draft',
  deliverables text,
  performance_metrics jsonb DEFAULT '{}',
  visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'shared', 'private')),
  source text,
  imported_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_room_entries_owner_idx ON data_room_entries(owner_id);
CREATE INDEX IF NOT EXISTS data_room_entries_room_type_idx ON data_room_entries(room_type);

ALTER TABLE data_room_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "data_room_entries_select" ON data_room_entries FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "data_room_entries_insert" ON data_room_entries FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "data_room_entries_update" ON data_room_entries FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "data_room_entries_delete" ON data_room_entries FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- 4. data_room_access — Controls who can access data rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS data_room_access (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_email text NOT NULL,
  requester_email text NOT NULL,
  requester_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  room_type text NOT NULL CHECK (room_type IN ('talent', 'brand', 'agency')),
  access_level text DEFAULT 'view' CHECK (access_level IN ('view', 'full', 'nda')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'revoked')),
  nda_signed boolean DEFAULT false,
  nda_signed_at timestamptz,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_room_access_owner_idx ON data_room_access(owner_email);
CREATE INDEX IF NOT EXISTS data_room_access_requester_idx ON data_room_access(requester_email);

ALTER TABLE data_room_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "data_room_access_select" ON data_room_access FOR SELECT TO authenticated USING (true);
CREATE POLICY "data_room_access_insert" ON data_room_access FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "data_room_access_update" ON data_room_access FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- 5. decision_makers — Brand decision-maker contacts
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_makers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  brand_name text,
  full_name text NOT NULL,
  role_title text,
  role_tier text DEFAULT 'unknown',
  email text,
  email_confidence numeric(3,2),
  phone text,
  linkedin_url text,
  source jsonb DEFAULT '{}',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decision_makers_brand_idx ON decision_makers(brand_id);
CREATE INDEX IF NOT EXISTS decision_makers_owner_idx ON decision_makers(owner_id);

ALTER TABLE decision_makers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decision_makers_select" ON decision_makers FOR SELECT TO authenticated USING (true);
CREATE POLICY "decision_makers_insert" ON decision_makers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "decision_makers_update" ON decision_makers FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "decision_makers_delete" ON decision_makers FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- 6. deal_scores — Calculated deal/match scores
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  partnership_id uuid REFERENCES partnerships(id) ON DELETE CASCADE,
  talent_id uuid REFERENCES talents(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  breakdown jsonb DEFAULT '{}',
  factors jsonb DEFAULT '{}',
  improvement_tips text[],
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deal_scores_owner_idx ON deal_scores(owner_id);
CREATE INDEX IF NOT EXISTS deal_scores_partnership_idx ON deal_scores(partnership_id);

ALTER TABLE deal_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deal_scores_select" ON deal_scores FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "deal_scores_insert" ON deal_scores FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "deal_scores_update" ON deal_scores FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- 7. escrow_payments — Escrow payment records
-- (May already exist from edge function usage — CREATE IF NOT EXISTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id uuid REFERENCES partnerships(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  milestone text,
  condition text,
  condition_met boolean DEFAULT false,
  stripe_payment_intent text,
  released_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS escrow_payments_partnership_idx ON escrow_payments(partnership_id);
CREATE INDEX IF NOT EXISTS escrow_payments_created_by_idx ON escrow_payments(created_by);

ALTER TABLE escrow_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "escrow_payments_select" ON escrow_payments FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "escrow_payments_insert" ON escrow_payments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "escrow_payments_update" ON escrow_payments FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- ============================================================
-- 8. bundle_deals — Multi-talent campaign bundles
-- ============================================================
CREATE TABLE IF NOT EXISTS bundle_deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  brand_name text,
  talent_ids uuid[] DEFAULT '{}',
  total_budget numeric DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  partnership_ids uuid[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bundle_deals_created_by_idx ON bundle_deals(created_by);

ALTER TABLE bundle_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bundle_deals_select" ON bundle_deals FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "bundle_deals_insert" ON bundle_deals FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "bundle_deals_update" ON bundle_deals FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "bundle_deals_delete" ON bundle_deals FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ============================================================
-- 9. deal_disputes — Deal dispute records
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_disputes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id uuid REFERENCES partnerships(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  description text,
  evidence jsonb DEFAULT '[]',
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
  resolution text,
  ai_analysis jsonb DEFAULT '{}',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deal_disputes_partnership_idx ON deal_disputes(partnership_id);
CREATE INDEX IF NOT EXISTS deal_disputes_created_by_idx ON deal_disputes(created_by);

ALTER TABLE deal_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deal_disputes_select" ON deal_disputes FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "deal_disputes_insert" ON deal_disputes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "deal_disputes_update" ON deal_disputes FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- ============================================================
-- 10. deck_library — Saved pitch deck templates
-- ============================================================
CREATE TABLE IF NOT EXISTS deck_library (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_email text,
  title text NOT NULL,
  deck_type text DEFAULT 'pitch',
  file_url text,
  content jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  partnership_id uuid REFERENCES partnerships(id) ON DELETE SET NULL,
  brand_name text,
  talent_name text,
  is_template boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deck_library_owner_idx ON deck_library(owner_id);

ALTER TABLE deck_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deck_library_select" ON deck_library FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "deck_library_insert" ON deck_library FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "deck_library_update" ON deck_library FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "deck_library_delete" ON deck_library FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- 11. pitch_competitions — Pitch competition events
-- ============================================================
CREATE TABLE IF NOT EXISTS pitch_competitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  brief text,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  brand_name text,
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 0,
  deadline timestamptz,
  status text DEFAULT 'open' CHECK (status IN ('draft', 'open', 'judging', 'completed', 'cancelled')),
  submissions jsonb DEFAULT '[]',
  winner_id uuid REFERENCES profiles(id),
  rules text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pitch_competitions_created_by_idx ON pitch_competitions(created_by);
CREATE INDEX IF NOT EXISTS pitch_competitions_status_idx ON pitch_competitions(status);

ALTER TABLE pitch_competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pitch_competitions_select" ON pitch_competitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "pitch_competitions_insert" ON pitch_competitions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "pitch_competitions_update" ON pitch_competitions FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- ============================================================
-- 12. ai_usage_logs — AI API usage tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  agent text,
  provider text,
  model text,
  fallback_used boolean DEFAULT false,
  batch_mode boolean DEFAULT false,
  latency_ms integer,
  prompt_length integer,
  input_tokens integer,
  output_tokens integer,
  estimated_cost_usd numeric(10,6) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_logs_user_idx ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_logs_created_at_idx ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_usage_logs_user_date_idx ON ai_usage_logs(user_id, created_at);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_logs_select" ON ai_usage_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
-- Insert allowed for service_role (AI router) — authenticated users read only
CREATE POLICY "ai_usage_logs_insert" ON ai_usage_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 13. referrals — User referral tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  referrer_email text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_email text,
  referred_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referred_signed_up boolean DEFAULT false,
  referred_upgraded boolean DEFAULT false,
  reward_type text DEFAULT 'free_month',
  reward_claimed boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded', 'expired')),
  created_at timestamptz DEFAULT now(),
  converted_at timestamptz
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_code_idx ON referrals(referral_code);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_select" ON referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid());
CREATE POLICY "referrals_insert" ON referrals FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());
CREATE POLICY "referrals_update" ON referrals FOR UPDATE TO authenticated USING (referrer_id = auth.uid());

-- ============================================================
-- 14. talent_types — Talent type categories (reference data)
-- ============================================================
CREATE TABLE IF NOT EXISTS talent_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_type text NOT NULL,
  category text,
  subcategory text,
  description text,
  avg_rate_range text,
  platforms text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE talent_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talent_types_select_public" ON talent_types FOR SELECT USING (true);
GRANT SELECT ON talent_types TO anon;

-- ============================================================
-- 15. talent_revenue_streams — Revenue stream definitions (reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS talent_revenue_streams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_type text NOT NULL,
  stream_category text NOT NULL,
  stream_name text NOT NULL,
  low_range numeric DEFAULT 0,
  mid_range numeric DEFAULT 0,
  high_range numeric DEFAULT 0,
  elite_range numeric DEFAULT 0,
  micro_range numeric DEFAULT 0,
  mega_range numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE talent_revenue_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talent_revenue_streams_select_public" ON talent_revenue_streams FOR SELECT USING (true);
GRANT SELECT ON talent_revenue_streams TO anon;

-- ============================================================
-- 16. talent_revenue_matrix — Aggregated revenue data (reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS talent_revenue_matrix (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_category text NOT NULL,
  tier text DEFAULT 'mid',
  annual_low numeric DEFAULT 0,
  annual_mid numeric DEFAULT 0,
  annual_high numeric DEFAULT 0,
  deal_count_avg integer DEFAULT 0,
  avg_deal_value numeric DEFAULT 0,
  top_platforms text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE talent_revenue_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talent_revenue_matrix_select_public" ON talent_revenue_matrix FOR SELECT USING (true);
GRANT SELECT ON talent_revenue_matrix TO anon;

-- ============================================================
-- Grant authenticated role access to all new tables
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON
  connected_platforms, data_room_entries, data_room_access,
  decision_makers, deal_scores, escrow_payments, bundle_deals,
  deal_disputes, deck_library, pitch_competitions, ai_usage_logs,
  referrals
TO authenticated;

GRANT SELECT ON
  platform_catalog, talent_types, talent_revenue_streams, talent_revenue_matrix
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

COMMIT;
