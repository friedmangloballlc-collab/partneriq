-- Migration 019: Verification & Enrichment System
-- Adds tables for OAuth-connected accounts, website verification,
-- crawl jobs, deal verification, enriched profiles, and match scores.
-- Works alongside existing profiles/talents/brands tables.

-- ── Connected Accounts (OAuth verified social platforms) ──
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB,
  verified BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- ── Verification Tokens (website ownership verification) ──
CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Crawl Jobs (async enrichment queue) ──
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  url TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  result JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Enriched Creator Profiles (crawled + AI extracted data) ──
CREATE TABLE IF NOT EXISTS enriched_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  niche TEXT[],
  profile_image_url TEXT,
  website_url TEXT,
  media_kit_url TEXT,
  rate_card JSONB,
  audience_data JSONB,
  past_brand_deals TEXT[],
  content_themes TEXT[],
  enrichment_raw JSONB,
  last_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Enriched Brand Profiles (crawled + AI extracted data) ──
CREATE TABLE IF NOT EXISTS enriched_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT,
  website_url TEXT,
  industry TEXT,
  products JSONB,
  brand_voice TEXT,
  target_audience TEXT,
  social_links JSONB,
  enrichment_raw JSONB,
  last_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Deal Verifications (proof of delivery) ──
CREATE TABLE IF NOT EXISTS deal_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID,
  creator_id UUID REFERENCES profiles(id),
  post_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  brand_mentioned BOOLEAN,
  links_correct BOOLEAN,
  content_snapshot JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- ── Match Scores (data-driven creator-brand matching) ──
CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  brand_id UUID REFERENCES profiles(id),
  overall_score INTEGER,
  breakdown JSONB,
  signals TEXT[],
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, brand_id)
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_connected_user ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_platform ON connected_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_tokens_user ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON verification_tokens(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON crawl_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON crawl_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_enriched_creator_user ON enriched_creators(user_id);
CREATE INDEX IF NOT EXISTS idx_enriched_brand_user ON enriched_brands(user_id);
CREATE INDEX IF NOT EXISTS idx_match_creator ON match_scores(creator_id);
CREATE INDEX IF NOT EXISTS idx_match_brand ON match_scores(brand_id);
CREATE INDEX IF NOT EXISTS idx_match_score ON match_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_deal_verify_deal ON deal_verifications(deal_id);

-- ── RLS ──
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enriched_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE enriched_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ──
-- Users can manage their own connected accounts
CREATE POLICY "own_accounts" ON connected_accounts FOR ALL
  USING (user_id = auth.uid());

-- Users can manage their own verification tokens
CREATE POLICY "own_tokens" ON verification_tokens FOR ALL
  USING (user_id = auth.uid());

-- Users can view their own jobs
CREATE POLICY "own_jobs" ON crawl_jobs FOR SELECT
  USING (user_id = auth.uid());

-- Users can view/update their own enriched profile
CREATE POLICY "own_enriched_creator" ON enriched_creators FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "own_enriched_brand" ON enriched_brands FOR ALL
  USING (user_id = auth.uid());

-- Anyone can read match scores and deal verifications (public data)
CREATE POLICY "read_matches" ON match_scores FOR SELECT USING (true);
CREATE POLICY "read_verifications" ON deal_verifications FOR SELECT USING (true);

-- Service role can insert verifications and matches (edge functions use service role)
CREATE POLICY "service_insert_verifications" ON deal_verifications FOR INSERT
  WITH CHECK (true);
CREATE POLICY "service_insert_matches" ON match_scores FOR INSERT
  WITH CHECK (true);
CREATE POLICY "service_update_matches" ON match_scores FOR UPDATE
  USING (true);
