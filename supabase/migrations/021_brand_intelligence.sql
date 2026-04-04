-- Migration 021: Brand Intelligence System
-- Adds tables for deal signals, industry events, and brand-event mapping.
-- Powers "who to email RIGHT NOW" intelligence.

-- ── Brand Signals (buying intent indicators) ──
CREATE TABLE IF NOT EXISTS brand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- hiring, product_launch, campaign, funding, event_sponsor, competitor_move
  signal_strength TEXT DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- when this signal becomes stale
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Industry Events (conferences, festivals, trade shows) ──
CREATE TABLE IF NOT EXISTS industry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT, -- conference, festival, trade_show, award_show, summit, expo
  industry TEXT[], -- which niches this event covers
  location TEXT,
  start_date DATE,
  end_date DATE,
  website_url TEXT,
  estimated_attendees INTEGER,
  creator_relevance TEXT, -- why creators should care about this event
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Brand Event Sponsorships (which brands sponsor which events) ──
CREATE TABLE IF NOT EXISTS brand_event_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  event_id UUID REFERENCES industry_events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  sponsorship_level TEXT, -- title, presenting, gold, silver, exhibitor, attendee
  year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, event_id, year)
);

-- ── Brand Budget Intel (enriched budget data) ──
CREATE TABLE IF NOT EXISTS brand_budget_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE UNIQUE,
  brand_name TEXT NOT NULL,
  estimated_annual_budget NUMERIC,
  budget_confidence TEXT DEFAULT 'low', -- low, medium, high
  fiscal_year_start TEXT, -- month name e.g., "January", "April"
  budget_cycle TEXT, -- quarterly, semi_annual, annual
  peak_spending_months TEXT[], -- e.g., ["March", "September", "November"]
  recent_campaigns JSONB DEFAULT '[]',
  hiring_signals JSONB DEFAULT '[]',
  funding_history JSONB DEFAULT '[]',
  competitor_activity JSONB DEFAULT '[]',
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_signals_brand ON brand_signals(brand_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON brand_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_strength ON brand_signals(signal_strength);
CREATE INDEX IF NOT EXISTS idx_signals_expires ON brand_signals(expires_at);
CREATE INDEX IF NOT EXISTS idx_events_date ON industry_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_industry ON industry_events USING GIN(industry);
CREATE INDEX IF NOT EXISTS idx_sponsors_brand ON brand_event_sponsors(brand_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_event ON brand_event_sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_brand ON brand_budget_intel(brand_id);

-- ── RLS ──
ALTER TABLE brand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_budget_intel ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read (this is platform-wide intelligence)
CREATE POLICY "read_signals" ON brand_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_events" ON industry_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_sponsors" ON brand_event_sponsors FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_budget" ON brand_budget_intel FOR SELECT TO authenticated USING (true);

-- Service role can write (edge functions populate this data)
CREATE POLICY "service_write_signals" ON brand_signals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_events" ON industry_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_sponsors" ON brand_event_sponsors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_budget" ON brand_budget_intel FOR ALL USING (true) WITH CHECK (true);
