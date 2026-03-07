-- ============================================================
-- 003: Add columns the frontend expects but schema is missing
-- This migration adds all columns referenced by frontend components
-- ============================================================

-- CULTURE_EVENTS: change dates/activation_opportunities from JSONB to TEXT, add display columns
ALTER TABLE culture_events ALTER COLUMN dates TYPE TEXT USING dates::TEXT;
ALTER TABLE culture_events ALTER COLUMN activation_opportunities TYPE TEXT USING activation_opportunities::TEXT;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS best_industries TEXT;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS audience_reach TEXT;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS planning_lead_time TEXT;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS key_demographics TEXT;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- MEGA_EVENTS: change dates/global_reach from JSONB to TEXT, add display columns
ALTER TABLE mega_events ALTER COLUMN dates TYPE TEXT USING dates::TEXT;
ALTER TABLE mega_events ALTER COLUMN global_reach TYPE TEXT USING global_reach::TEXT;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS format_details TEXT;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS planning_urgency TEXT;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS key_facts TEXT;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS tier TEXT;

-- CONFERENCES: add all display columns frontend expects
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS conference_name TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS industry_focus TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS typical_date TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS attendees TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS sponsorship_range TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS why_attend TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS key_audience TEXT;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS best_for_industries TEXT;

-- RATE_BENCHMARKS: add tier-based pricing columns
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS followers_min INTEGER;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS followers_max INTEGER;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS sponsored_post_min NUMERIC;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS sponsored_post_max NUMERIC;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS brand_deal_min NUMERIC;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS brand_deal_max NUMERIC;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS ambassador_annual_min NUMERIC;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS ambassador_annual_max NUMERIC;

-- PLATFORM_MULTIPLIERS: add CPM and engagement columns
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_cpm_min NUMERIC;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_cpm_max NUMERIC;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS rate_multiplier NUMERIC;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_benchmark_min NUMERIC;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_benchmark_max NUMERIC;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS notes TEXT;

-- CATEGORY_PREMIUMS: add multiplier and rationale
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS premium_multiplier NUMERIC;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS rationale TEXT;

-- ROI_BENCHMARKS: add deal type and quartile columns
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS deal_type TEXT;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS median_roi NUMERIC;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS top_quartile_roi NUMERIC;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS bottom_quartile_roi NUMERIC;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS measurement_period TEXT;

-- DEMOGRAPHIC_SEGMENTS: add rich display columns
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS population_size TEXT;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS buying_power TEXT;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS media_preferences TEXT;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS top_events TEXT;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS key_cultural_moments TEXT;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS brand_activation_tips TEXT;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS activation_tips TEXT;

-- INDUSTRY_GUIDES: add structured display columns
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS budget_allocation TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS priority_tier_1_events TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS tier_2_events TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS heritage_awareness_months TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS key_conferences TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS best_demographics TEXT;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS activation_strategies TEXT;
