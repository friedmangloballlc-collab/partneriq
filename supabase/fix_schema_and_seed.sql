-- PartnerIQ: Fix Schema + RLS + Seed Data
-- Run this entire script in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This adds missing columns expected by the UI, relaxes RLS for demo use, and seeds all data.

-- ============================================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================

-- Culture Events: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS date date;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS significance text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS target_demographics text[];
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS partnership_opportunities text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS event_name text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS tier text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS month text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS dates text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS best_industries text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS audience_reach text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS activation_opportunities text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS planning_lead_time text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS key_demographics text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS audience_demographics jsonb;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS location text;

-- Mega Events: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS expected_attendance bigint;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS sponsorship_tiers jsonb;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS event_name text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS dates text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS global_reach text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS format_details text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS planning_urgency text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS key_facts text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS tier text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS audience_demographics jsonb;

-- Conferences: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS date date;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS expected_attendees integer;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS sponsorship_available boolean;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS sponsorship_cost numeric;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS conference_name text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS industry_focus text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS typical_date text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS attendees text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS sponsorship_range text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS why_attend text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS key_audience text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS best_for_industries text;

-- Demographic Segments: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS age_range text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS income_range text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS interests text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS platforms text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS purchase_behavior text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS brand_affinity text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS size_estimate bigint;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS population_size text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS buying_power text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS media_preferences text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS top_events text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS key_cultural_moments text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS brand_activation_tips text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS activation_tips text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS best_demographics text;

-- Rate Benchmarks: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS niche text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS tier text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS rate_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS rate_max numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS rate_median numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS followers_min bigint;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS followers_max bigint;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS sponsored_post_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS sponsored_post_max numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS brand_deal_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS brand_deal_max numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS ambassador_annual_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS ambassador_annual_max numeric;

-- Platform Multipliers: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_multiplier numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_weight numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS reach_weight numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_cpm_min numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_cpm_max numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS rate_multiplier numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_benchmark_min numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_benchmark_max numeric;

-- Category Premiums: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS premium_percent numeric;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS demand_level text;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS premium_multiplier numeric;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS rationale text;

-- ROI Benchmarks: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS channel text;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS avg_roi numeric;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS median_roi numeric;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS top_quartile_roi numeric;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS time_to_roi_days integer;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS sample_size integer;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS deal_type text;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS bottom_quartile_roi numeric;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS measurement_period text;

-- Industry Guides: add ALL columns referenced in INSERTs and UI pages
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS best_practices text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS published boolean;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS sector text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS best_demographics text;

-- Viewership Tiers: add ALL columns referenced in INSERTs
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS min_followers bigint;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS max_followers bigint;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS avg_engagement_rate numeric;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS typical_rate_min numeric;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS typical_rate_max numeric;
ALTER TABLE viewership_tiers ADD COLUMN IF NOT EXISTS description text;

-- ============================================================
-- 1b. FORCE CORRECT COLUMN TYPES (in case columns already exist with wrong types)
-- ============================================================
-- Each ALTER is wrapped in its own DO block so failures don't abort the transaction.

-- Force text type on columns UI expects as strings (may exist as text[] or numeric)
DO $$ BEGIN ALTER TABLE culture_events ALTER COLUMN audience_reach TYPE text USING audience_reach::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE culture_events ALTER COLUMN best_industries TYPE text USING array_to_string(best_industries, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE culture_events ALTER COLUMN activation_opportunities TYPE text USING array_to_string(activation_opportunities, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE culture_events ALTER COLUMN key_demographics TYPE text USING array_to_string(key_demographics, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE culture_events ALTER COLUMN audience_demographics TYPE jsonb USING audience_demographics::jsonb; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mega_events ALTER COLUMN global_reach TYPE text USING global_reach::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mega_events ALTER COLUMN key_facts TYPE text USING array_to_string(key_facts, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mega_events ALTER COLUMN audience_demographics TYPE jsonb USING audience_demographics::jsonb; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE conferences ALTER COLUMN attendees TYPE text USING attendees::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE conferences ALTER COLUMN sponsorship_range TYPE text USING sponsorship_range::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE conferences ALTER COLUMN best_for_industries TYPE text USING array_to_string(best_for_industries, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN buying_power TYPE text USING buying_power::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN population_size TYPE text USING population_size::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN brand_affinity TYPE text USING brand_affinity::text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN interests TYPE text USING array_to_string(interests, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN platforms TYPE text USING array_to_string(platforms, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN media_preferences TYPE text USING array_to_string(media_preferences, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN top_events TYPE text USING array_to_string(top_events, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN key_cultural_moments TYPE text USING array_to_string(key_cultural_moments, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN brand_activation_tips TYPE text USING array_to_string(brand_activation_tips, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN activation_tips TYPE text USING array_to_string(activation_tips, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ALTER COLUMN best_demographics TYPE text USING array_to_string(best_demographics, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE industry_guides ALTER COLUMN best_practices TYPE text USING array_to_string(best_practices, ', '); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE industry_guides ALTER COLUMN best_demographics TYPE text USING array_to_string(best_demographics, ', '); EXCEPTION WHEN others THEN NULL; END $$;

-- Ensure title column exists on ALL tables (wrapped safely)
DO $$ BEGIN ALTER TABLE rate_benchmarks ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE platform_multipliers ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE category_premiums ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE roi_benchmarks ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE viewership_tiers ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE culture_events ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mega_events ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE conferences ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demographic_segments ADD COLUMN title text; EXCEPTION WHEN others THEN NULL; END $$;

-- ============================================================
-- 2. FIX RLS POLICIES - Make all tables readable by any authenticated user
-- ============================================================

-- First: drop ALL existing policies on ALL tables to avoid "already exists" errors
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Partnerships: change from owner-only to all authenticated
DROP POLICY IF EXISTS "partnerships_select" ON partnerships;
CREATE POLICY "partnerships_select" ON partnerships FOR SELECT USING (auth.role() = 'authenticated');

-- Also allow any authenticated user to insert/update partnerships (for demo)
DROP POLICY IF EXISTS "partnerships_insert" ON partnerships;
CREATE POLICY "partnerships_insert" ON partnerships FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "partnerships_update" ON partnerships;
CREATE POLICY "partnerships_update" ON partnerships FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "partnerships_delete" ON partnerships;
CREATE POLICY "partnerships_delete" ON partnerships FOR DELETE USING (auth.role() = 'authenticated');

-- Outreach emails
DROP POLICY IF EXISTS "outreach_emails_select" ON outreach_emails;
CREATE POLICY "outreach_emails_select" ON outreach_emails FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "outreach_emails_insert" ON outreach_emails;
CREATE POLICY "outreach_emails_insert" ON outreach_emails FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "outreach_emails_update" ON outreach_emails;
CREATE POLICY "outreach_emails_update" ON outreach_emails FOR UPDATE USING (auth.role() = 'authenticated');

-- Outreach sequences
DROP POLICY IF EXISTS "outreach_sequences_select" ON outreach_sequences;
CREATE POLICY "outreach_sequences_select" ON outreach_sequences FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "outreach_sequences_insert" ON outreach_sequences;
CREATE POLICY "outreach_sequences_insert" ON outreach_sequences FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "outreach_sequences_update" ON outreach_sequences;
CREATE POLICY "outreach_sequences_update" ON outreach_sequences FOR UPDATE USING (auth.role() = 'authenticated');

-- Marketplace opportunities: allow all authenticated to read all (not just published)
DROP POLICY IF EXISTS "opportunities_select_published" ON marketplace_opportunities;
DROP POLICY IF EXISTS "opportunities_select" ON marketplace_opportunities;
CREATE POLICY "opportunities_select" ON marketplace_opportunities FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "opportunities_insert" ON marketplace_opportunities;
CREATE POLICY "opportunities_insert" ON marketplace_opportunities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "opportunities_update" ON marketplace_opportunities;
CREATE POLICY "opportunities_update" ON marketplace_opportunities FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "opportunities_delete" ON marketplace_opportunities;
CREATE POLICY "opportunities_delete" ON marketplace_opportunities FOR DELETE USING (auth.role() = 'authenticated');

-- Profiles: allow reading all profiles (not just own)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.role() = 'authenticated');
-- Allow insert for profile creation during signup
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notifications
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User subscriptions
DROP POLICY IF EXISTS "user_subscriptions_select" ON user_subscriptions;
CREATE POLICY "user_subscriptions_select" ON user_subscriptions FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "user_subscriptions_update" ON user_subscriptions;
CREATE POLICY "user_subscriptions_update" ON user_subscriptions FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "user_subscriptions_insert" ON user_subscriptions;
CREATE POLICY "user_subscriptions_insert" ON user_subscriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Billing history
DROP POLICY IF EXISTS "billing_history_select" ON billing_history;
CREATE POLICY "billing_history_select" ON billing_history FOR SELECT USING (auth.role() = 'authenticated');

-- Partnership proposals
DROP POLICY IF EXISTS "partnership_proposals_select" ON partnership_proposals;
CREATE POLICY "partnership_proposals_select" ON partnership_proposals FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "partnership_proposals_insert" ON partnership_proposals;
CREATE POLICY "partnership_proposals_insert" ON partnership_proposals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "partnership_proposals_update" ON partnership_proposals;
CREATE POLICY "partnership_proposals_update" ON partnership_proposals FOR UPDATE USING (auth.role() = 'authenticated');

-- Brands: ensure insert is open for demo
DROP POLICY IF EXISTS "brands_insert" ON brands;
CREATE POLICY "brands_insert" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "brands_update" ON brands;
CREATE POLICY "brands_update" ON brands FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "brands_delete" ON brands;
CREATE POLICY "brands_delete" ON brands FOR DELETE USING (auth.role() = 'authenticated');

-- Talents: ensure insert/update open for demo
DROP POLICY IF EXISTS "talents_update" ON talents;
CREATE POLICY "talents_update" ON talents FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "talents_delete" ON talents;
CREATE POLICY "talents_delete" ON talents FOR DELETE USING (auth.role() = 'authenticated');

-- Reference data tables: add SELECT policies (critical for data visibility!)
DROP POLICY IF EXISTS "culture_events_select" ON culture_events;
CREATE POLICY "culture_events_select" ON culture_events FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "mega_events_select" ON mega_events;
CREATE POLICY "mega_events_select" ON mega_events FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "conferences_select" ON conferences;
CREATE POLICY "conferences_select" ON conferences FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "demographic_segments_select" ON demographic_segments;
CREATE POLICY "demographic_segments_select" ON demographic_segments FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "industry_guides_select" ON industry_guides;
CREATE POLICY "industry_guides_select" ON industry_guides FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "roi_benchmarks_select" ON roi_benchmarks;
CREATE POLICY "roi_benchmarks_select" ON roi_benchmarks FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "rate_benchmarks_select" ON rate_benchmarks;
CREATE POLICY "rate_benchmarks_select" ON rate_benchmarks FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "platform_multipliers_select" ON platform_multipliers;
CREATE POLICY "platform_multipliers_select" ON platform_multipliers FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "category_premiums_select" ON category_premiums;
CREATE POLICY "category_premiums_select" ON category_premiums FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "viewership_tiers_select" ON viewership_tiers;
CREATE POLICY "viewership_tiers_select" ON viewership_tiers FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "brands_select" ON brands;
CREATE POLICY "brands_select" ON brands FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "talents_select" ON talents;
CREATE POLICY "talents_select" ON talents FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "subscription_plans_select" ON subscription_plans;
CREATE POLICY "subscription_plans_select" ON subscription_plans FOR SELECT USING (auth.role() = 'authenticated');

-- Culture events: add write policies
DROP POLICY IF EXISTS "culture_events_insert" ON culture_events;
CREATE POLICY "culture_events_insert" ON culture_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "culture_events_update" ON culture_events;
CREATE POLICY "culture_events_update" ON culture_events FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "culture_events_delete" ON culture_events;
CREATE POLICY "culture_events_delete" ON culture_events FOR DELETE USING (auth.role() = 'authenticated');

-- Mega events: add write policies
DROP POLICY IF EXISTS "mega_events_insert" ON mega_events;
CREATE POLICY "mega_events_insert" ON mega_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "mega_events_update" ON mega_events;
CREATE POLICY "mega_events_update" ON mega_events FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "mega_events_delete" ON mega_events;
CREATE POLICY "mega_events_delete" ON mega_events FOR DELETE USING (auth.role() = 'authenticated');

-- Conferences: add write policies
DROP POLICY IF EXISTS "conferences_insert" ON conferences;
CREATE POLICY "conferences_insert" ON conferences FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "conferences_update" ON conferences;
CREATE POLICY "conferences_update" ON conferences FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "conferences_delete" ON conferences;
CREATE POLICY "conferences_delete" ON conferences FOR DELETE USING (auth.role() = 'authenticated');

-- Demographic segments: add write policies
DROP POLICY IF EXISTS "demographic_segments_insert" ON demographic_segments;
CREATE POLICY "demographic_segments_insert" ON demographic_segments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "demographic_segments_update" ON demographic_segments;
CREATE POLICY "demographic_segments_update" ON demographic_segments FOR UPDATE USING (auth.role() = 'authenticated');

-- Industry guides: add write policies
DROP POLICY IF EXISTS "industry_guides_insert" ON industry_guides;
CREATE POLICY "industry_guides_insert" ON industry_guides FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "industry_guides_update" ON industry_guides;
CREATE POLICY "industry_guides_update" ON industry_guides FOR UPDATE USING (auth.role() = 'authenticated');

-- ROI Benchmarks: add write policies
DROP POLICY IF EXISTS "roi_benchmarks_insert" ON roi_benchmarks;
CREATE POLICY "roi_benchmarks_insert" ON roi_benchmarks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Rate Benchmarks: add write policies
DROP POLICY IF EXISTS "rate_benchmarks_insert" ON rate_benchmarks;
CREATE POLICY "rate_benchmarks_insert" ON rate_benchmarks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Platform Multipliers: add write policies
DROP POLICY IF EXISTS "platform_multipliers_insert" ON platform_multipliers;
CREATE POLICY "platform_multipliers_insert" ON platform_multipliers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Category Premiums: add write policies
DROP POLICY IF EXISTS "category_premiums_insert" ON category_premiums;
CREATE POLICY "category_premiums_insert" ON category_premiums FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Viewership Tiers: add write policies
DROP POLICY IF EXISTS "viewership_tiers_insert" ON viewership_tiers;
CREATE POLICY "viewership_tiers_insert" ON viewership_tiers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Subscription Plans: add write policies
DROP POLICY IF EXISTS "subscription_plans_insert" ON subscription_plans;
CREATE POLICY "subscription_plans_insert" ON subscription_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 2b. DROP NOT-NULL CONSTRAINTS that block inserts
-- The deployed DB may have different NOT NULL columns than schema.sql
-- ============================================================
DO $$ BEGIN
  -- culture_events
  ALTER TABLE culture_events ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE culture_events ALTER COLUMN name DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE mega_events ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE mega_events ALTER COLUMN name DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE conferences ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE conferences ALTER COLUMN name DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE demographic_segments ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE demographic_segments ALTER COLUMN name DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE rate_benchmarks ALTER COLUMN platform DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE rate_benchmarks ALTER COLUMN niche DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE rate_benchmarks ALTER COLUMN tier DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE rate_benchmarks ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE platform_multipliers ALTER COLUMN platform DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE platform_multipliers ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE category_premiums ALTER COLUMN category DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE category_premiums ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE roi_benchmarks ALTER COLUMN industry DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE roi_benchmarks ALTER COLUMN channel DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE roi_benchmarks ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE industry_guides ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE industry_guides ALTER COLUMN industry DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE viewership_tiers ALTER COLUMN name DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE viewership_tiers ALTER COLUMN platform DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE viewership_tiers ALTER COLUMN title DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
END $$;

-- ============================================================
-- 3. CLEAR OLD SEED DATA (safe to re-run)
-- ============================================================
TRUNCATE culture_events CASCADE;
TRUNCATE mega_events CASCADE;
TRUNCATE conferences CASCADE;
TRUNCATE demographic_segments CASCADE;
TRUNCATE rate_benchmarks CASCADE;
TRUNCATE platform_multipliers CASCADE;
TRUNCATE category_premiums CASCADE;
TRUNCATE roi_benchmarks CASCADE;
TRUNCATE industry_guides CASCADE;
TRUNCATE viewership_tiers CASCADE;

-- ============================================================
-- 4. SEED: CULTURE EVENTS (Comprehensive 2026-2027 Calendar)
-- ============================================================
INSERT INTO culture_events (title, event_name, name, tier, category, subcategory, month, year, dates, best_industries, audience_reach, activation_opportunities, planning_lead_time, key_demographics, location, audience_demographics) VALUES
-- Q1 2026
('New Year / New Me Season', 'New Year / New Me Season', 'New Year / New Me Season', '1', 'Seasonal', 'New Year', 'January', 2026, 'Jan 1–31', 'Fitness, Health, Finance, Technology', '320M+ US adults', 'Resolution content, Transformation challenges, Product launches, Goal-setting campaigns', '3-4 months', '18-45, All genders, Health-conscious', 'United States', '["Gen Z", "Millennials", "Health-conscious consumers"]'::jsonb),
('Black History Month', 'Black History Month', 'Black History Month', '1', 'Cultural', 'Heritage Month', 'February', 2026, 'Feb 1–28', 'Entertainment, Fashion, Beauty, Food, Education', '45M+ Black Americans', 'Storytelling campaigns, Creator spotlights, Community partnerships, Educational content', '4-6 months', '18-55, Black American community, All genders', 'United States', '["Black American community", "Gen Z", "Millennials", "Allies"]'::jsonb),
('Valentines Day', 'Valentines Day', 'Valentines Day', '2', 'Seasonal', 'Holiday', 'February', 2026, 'Feb 14', 'Fashion, Beauty, Food, Jewelry, Travel', '150M+ US consumers', 'Gift guides, Couples content, Self-love campaigns, Restaurant partnerships', '2-3 months', '18-45, All genders, Couples', 'Global', '["Couples", "Singles", "18-45", "All genders"]'::jsonb),
('Super Bowl LX', 'Super Bowl LX', 'Super Bowl LX', '1', 'Sports', 'Football', 'February', 2026, 'Feb 8', 'Food, Beverage, Technology, Automotive, Entertainment', '115M+ US viewers', 'Watch party content, Ad reaction videos, Brand activations, Tailgate campaigns', '6-12 months', '18-55, Male skew, Sports fans', 'United States', '["Sports fans", "18-55", "Male skew", "Mass market"]'::jsonb),
('International Womens Day', 'International Womens Day', 'International Womens Day', '2', 'Cultural', 'Awareness Day', 'March', 2026, 'Mar 8', 'Beauty, Fashion, Technology, Finance, Wellness', '190+ countries', 'Women-led brand campaigns, Female founder spotlights, Empowerment content, Mentorship activations', '2-3 months', 'All ages, Female focus, Allies', 'Global', '["Women", "Female-identifying", "Allies", "All ages"]'::jsonb),
('Ramadan', 'Ramadan', 'Ramadan', '1', 'Cultural', 'Religious', 'March', 2026, 'Mar 1 – Mar 30', 'Food, Fashion, Finance, Travel, Beauty', '1.8B Muslims globally', 'Iftar content, Modest fashion, Community giving, Food brand integrations', '4-6 months', 'All ages, Muslim community, MENA diaspora', 'Global', '["Muslim community", "MENA diaspora", "All ages"]'::jsonb),
('March Madness', 'March Madness', 'March Madness', '1', 'Sports', 'Basketball', 'March', 2026, 'Mar 17 – Apr 6', 'Sports, Food, Beverage, Technology, Gaming', '100M+ bracket participants', 'Bracket challenges, Watch party content, Athletic brand campaigns, Gaming crossovers', '3-4 months', '18-45, Male skew, Sports fans, Students', 'United States', '["College sports fans", "18-35", "Male skew", "Students"]'::jsonb),
-- Q2 2026
('Earth Day', 'Earth Day', 'Earth Day', '2', 'Cultural', 'Awareness Day', 'April', 2026, 'Apr 22', 'Fashion, Beauty, Food, Technology, Outdoor', '1B+ participants globally', 'Sustainability campaigns, Eco-product launches, Cleanup events, Educational content', '2-3 months', 'Gen Z, Millennials, Eco-conscious', 'Global', '["Eco-conscious consumers", "Gen Z", "Millennials", "All ages"]'::jsonb),
('AAPI Heritage Month', 'Asian American Pacific Islander Heritage Month', 'AAPI Heritage Month', '2', 'Cultural', 'Heritage Month', 'May', 2026, 'May 1–31', 'Food, Fashion, Technology, Entertainment, Beauty', '24M+ AAPI Americans', 'Creator spotlights, Cultural storytelling, Food heritage content, Brand partnerships', '3-4 months', 'All ages, AAPI community, Allies', 'United States', '["AAPI community", "All ages", "Cultural enthusiasts"]'::jsonb),
('Mental Health Awareness Month', 'Mental Health Awareness Month', 'Mental Health Awareness Month', '2', 'Cultural', 'Awareness Month', 'May', 2026, 'May 1–31', 'Wellness, Health, Technology, Beauty, Fitness', '52M+ US adults affected', 'Wellness brand campaigns, Self-care content, App partnerships, Educational series', '3-4 months', 'All ages, Gen Z, Millennials', 'United States', '["Gen Z", "Millennials", "Wellness community", "All ages"]'::jsonb),
('Mothers Day', 'Mothers Day', 'Mothers Day', '1', 'Seasonal', 'Holiday', 'May', 2026, 'May 10', 'Beauty, Fashion, Food, Home, Wellness', '$31.7B US spending', 'Gift guides, Mom creator spotlights, Family content, Product gifting', '2-3 months', 'All ages, Mothers, Daughters, Partners', 'Global', '["Mothers", "Gift-givers", "Families", "All ages"]'::jsonb),
('Pride Month', 'Pride Month', 'Pride Month', '1', 'Cultural', 'Heritage Month', 'June', 2026, 'Jun 1–30', 'Fashion, Beauty, Entertainment, Technology, Food', '$1.4T LGBTQ+ buying power', 'Authentic brand allyship, Creator partnerships, Pride event sponsorships, Community campaigns', '4-6 months', 'LGBTQ+, Allies, Gen Z, Millennials', 'Global', '["LGBTQ+ community", "Allies", "Gen Z", "Millennials"]'::jsonb),
('Fathers Day', 'Fathers Day', 'Fathers Day', '2', 'Seasonal', 'Holiday', 'June', 2026, 'Jun 21', 'Technology, Outdoor, Sports, Automotive, Fashion', '$22.9B US spending', 'Gift guides, Dad creator spotlights, Grilling & outdoor content, Tech gadget reviews', '2-3 months', 'All ages, Fathers, Sons/Daughters, Partners', 'Global', '["Fathers", "Gift-givers", "Families"]'::jsonb),
-- Q3 2026
('Fourth of July', 'Fourth of July', 'Fourth of July', '1', 'Seasonal', 'Holiday', 'July', 2026, 'Jul 4', 'Food, Beverage, Outdoor, Fashion, Entertainment', '330M+ Americans', 'Cookout content, Travel/vacation campaigns, Patriotic fashion, Fireworks events', '2-3 months', 'All ages, American consumers, Families', 'United States', '["American consumers", "Families", "All ages"]'::jsonb),
('Back to School', 'Back to School', 'Back to School', '1', 'Seasonal', 'Education', 'August', 2026, 'Aug 1–Sep 7', 'Technology, Fashion, Education, Sports, Food', '$41.5B US spending', 'Haul videos, Tech reviews, Dorm room setups, Study tips content', '3-4 months', 'Students, Parents, Teachers, Teens', 'United States', '["Students", "Parents", "Teachers", "Teens", "18-35"]'::jsonb),
('Hispanic Heritage Month', 'Hispanic Heritage Month', 'Hispanic Heritage Month', '1', 'Cultural', 'Heritage Month', 'September', 2026, 'Sep 15 – Oct 15', 'Food, Fashion, Entertainment, Beauty, Music', '63M+ Hispanic Americans', 'Cultural storytelling, Creator spotlights, Food heritage content, Music partnerships', '4-6 months', 'Hispanic/Latino community, Spanish speakers, All ages', 'United States', '["Hispanic/Latino community", "Spanish speakers", "All ages"]'::jsonb),
-- Q4 2026
('Halloween', 'Halloween', 'Halloween', '1', 'Seasonal', 'Holiday', 'October', 2026, 'Oct 31', 'Fashion, Beauty, Food, Entertainment, Candy', '$12.2B US spending', 'Costume content, Makeup tutorials, Candy brand campaigns, Spooky themed series', '2-3 months', 'All ages, Gen Z, Millennials, Families', 'United States', '["All ages", "Gen Z", "Millennials", "Families"]'::jsonb),
('Diwali', 'Diwali', 'Diwali', '2', 'Cultural', 'Religious', 'October', 2026, 'Oct 20', 'Fashion, Food, Beauty, Home, Technology', '1B+ Hindus globally', 'Cultural celebrations, Fashion & jewelry content, Food & sweets content, Lighting & decor', '3-4 months', 'South Asian community, Hindu community, All ages', 'Global', '["South Asian community", "Hindu community", "All ages"]'::jsonb),
('Thanksgiving', 'Thanksgiving', 'Thanksgiving', '1', 'Seasonal', 'Holiday', 'November', 2026, 'Nov 26', 'Food, Travel, Home, Retail', '330M+ Americans', 'Recipe content, Travel campaigns, Family gathering content, Gratitude campaigns', '2-3 months', 'All ages, Families, American consumers', 'United States', '["American families", "Food enthusiasts", "All ages"]'::jsonb),
('Black Friday / Cyber Monday', 'Black Friday / Cyber Monday', 'Black Friday / Cyber Monday', '1', 'Seasonal', 'Shopping', 'November', 2026, 'Nov 27–30', 'Technology, Fashion, Beauty, Home, All retail', '$9.8B+ online sales', 'Deal roundup content, Unboxing hauls, Tech reviews, Gift guides', '3-6 months', '18-55, All genders, Bargain hunters', 'Global', '["Bargain hunters", "18-55", "Online shoppers", "All genders"]'::jsonb),
('Holiday Season / Christmas', 'Holiday Season / Christmas', 'Holiday Season / Christmas', '1', 'Seasonal', 'Holiday', 'December', 2026, 'Dec 1–25', 'All industries', '$936B+ US holiday spending', 'Gift guides, Holiday hauls, Seasonal content, Brand gifting campaigns', '4-6 months', 'All ages, All genders, Global audience', 'Global', '["All ages", "All genders", "Global consumers", "Families"]'::jsonb),
('Lunar New Year', 'Lunar New Year', 'Lunar New Year', '2', 'Cultural', 'Heritage', 'February', 2027, 'Feb 6', 'Food, Fashion, Beauty, Finance, Travel', '2B+ celebrate globally', 'Cultural celebration content, Red & gold fashion, Traditional food content, Travel partnerships', '3-4 months', 'East Asian community, AAPI, All ages', 'Global', '["East Asian community", "AAPI", "All ages"]'::jsonb),
('Eid al-Fitr', 'Eid al-Fitr', 'Eid al-Fitr', '2', 'Cultural', 'Religious', 'March', 2026, 'Mar 30–31', 'Fashion, Food, Beauty, Finance, Travel', '1.8B Muslims globally', 'Celebration content, Fashion & beauty looks, Gift-giving campaigns, Community events', '3-4 months', 'Muslim community, All ages', 'Global', '["Muslim community", "All ages", "MENA diaspora"]'::jsonb),
('World Cup Qualifiers 2026', 'World Cup Qualifiers 2026', 'World Cup Qualifiers 2026', '1', 'Sports', 'Soccer', 'Various', 2026, 'Throughout 2026', 'Sports, Beverage, Fashion, Technology, Gaming', '4B+ global viewers', 'Watch party content, Jersey & merch campaigns, Sports tech reviews, Fan engagement', '6-12 months', '18-55, Male skew, Global sports fans', 'Global', '["Global sports fans", "18-55", "Male skew"]'::jsonb),
('NBA Finals', 'NBA Finals', 'NBA Finals', '1', 'Sports', 'Basketball', 'June', 2026, 'Jun 4–18', 'Sports, Fashion, Beverage, Technology', '15M+ US viewers', 'Watch party content, Sneaker culture campaigns, Player partnerships, Sports betting adjacent', '3-4 months', '18-45, Male skew, Basketball fans', 'United States', '["Basketball fans", "18-45", "Male skew", "Urban culture"]'::jsonb),
('Olympics 2026 (Winter)', 'Olympics 2026 (Winter)', 'Olympics 2026 (Winter)', '1', 'Sports', 'Multi-sport', 'February', 2026, 'Feb 6–22', 'Sports, Technology, Fashion, Beverage, Health', '2B+ global viewers', 'Athlete partnerships, National pride campaigns, Sports equipment reviews, Fan content', '6-12 months', 'All ages, Global audience, Sports fans', 'Milan-Cortina, Italy', '["Global sports fans", "All ages", "National pride"]'::jsonb);

-- ============================================================
-- 5. SEED: MEGA EVENTS
-- ============================================================
INSERT INTO mega_events (title, event_name, name, dates, global_reach, format_details, planning_urgency, year, key_facts, tier, description, audience_demographics) VALUES
('FIFA World Cup 2026', 'FIFA World Cup 2026', 'FIFA World Cup 2026', 'Jun 11 – Jul 19, 2026', '5B+ cumulative TV viewers', 'First 48-team format, hosted across US, Mexico, Canada. 16 host cities, 104 matches over 39 days.', 'CRITICAL – Secure partnerships 12+ months ahead', 2026, 'Largest sporting event in history, $11B+ economic impact, 48 teams, 16 cities across 3 countries, Est. 5M+ in-person attendees', '1', 'The biggest single sporting event in history, co-hosted by USA, Mexico, and Canada.', '["Global audience", "18-55", "Male skew", "Sports fans", "Hispanic/Latino", "Soccer culture"]'::jsonb),
('Summer Olympics 2028 (LA)', 'Summer Olympics 2028 (LA)', 'Summer Olympics 2028 (LA)', 'Jul 14 – Jul 30, 2028', '3.5B+ cumulative viewers', 'Los Angeles hosts for 3rd time. 35+ sports, 300+ events. Opening ceremony at SoFi Stadium.', 'Begin planning now for 2028 activations', 2028, 'First LA Olympics since 1984, 35 sports, 300+ events, SoFi Stadium opening ceremony, $7B+ economic impact projected', '1', 'The 2028 Summer Olympics returns to Los Angeles.', '["Global audience", "All ages", "Athletes", "National pride"]'::jsonb),
('Super Bowl LX', 'Super Bowl LX', 'Super Bowl LX', 'Feb 8, 2026', '115M+ US viewers', 'NFL Championship game. Halftime show, national ad showcase. The single most-watched US broadcast annually.', 'CRITICAL – Ad/partnership slots sell 12+ months out', 2026, 'Most-watched US TV event, $7M+ per 30-sec ad spot, 550M+ social media impressions, $16B+ wagered', '1', 'The biggest annual sports event in the United States.', '["American sports fans", "18-55", "Mass market", "Male skew"]'::jsonb),
('Coachella 2026', 'Coachella 2026', 'Coachella 2026', 'Apr 10–12 & Apr 17–19, 2026', '250K+ attendees, 40M+ social views', 'Two weekends in Indio, CA. Music, art, fashion convergence. Major brand activation destination.', 'HIGH – Brand activations sell out 6+ months ahead', 2026, '250,000+ attendees across 2 weekends, #1 music festival for brand activations, 40M+ social media impressions, $700M+ economic impact', '1', 'The premier music and arts festival and brand activation event.', '["Gen Z", "Millennials", "18-35", "Fashion-forward", "Music lovers"]'::jsonb),
('SXSW 2026', 'SXSW 2026', 'SXSW 2026', 'Mar 7–15, 2026', '300K+ attendees', 'Music, film, and interactive festival in Austin, TX. Major tech and creator economy convergence point.', 'HIGH – Secure panels and activations 4-6 months ahead', 2026, '300,000+ attendees, Covers music, film, tech, and interactive, Major tech product launch venue, $350M+ economic impact', '1', 'The ultimate convergence of music, film, tech, and culture in Austin, TX.', '["Tech professionals", "Creatives", "25-45", "Early adopters", "Music lovers"]'::jsonb),
('ComplexCon 2026', 'ComplexCon 2026', 'ComplexCon 2026', 'Nov 14–15, 2026', '60K+ attendees', 'Culture festival in Long Beach, CA. Streetwear, sneakers, music, food. Ultimate Gen Z brand activation.', 'MODERATE – Plan 3-4 months ahead', 2026, '60,000+ attendees, #1 streetwear culture event, Celebrity panels and performances, Exclusive product drops', '2', 'The ultimate culture festival for streetwear, music, and pop culture.', '["Gen Z", "Streetwear culture", "18-30", "Sneakerheads", "Music fans"]'::jsonb),
('Met Gala 2026', 'Met Gala 2026', 'Met Gala 2026', 'May 4, 2026', '500M+ social impressions', 'Fashion''s biggest night at the Metropolitan Museum of Art. Exclusive invite-only event with massive social reach.', 'HIGH – Celebrity partnerships must be secured months ahead', 2026, 'Most exclusive fashion event globally, 500M+ social media impressions, Red carpet drives 24h+ trend cycles, Fashion-tech crossover growing', '1', 'The most exclusive and socially impactful fashion event in the world.', '["Fashion-forward", "Luxury consumers", "Celebrity followers", "Gen Z", "Millennials"]'::jsonb),
('Grammy Awards 2026', 'Grammy Awards 2026', 'Grammy Awards 2026', 'Feb 1, 2026', '12M+ US viewers, 200M+ social', 'Music''s biggest night. Red carpet, performances, after-parties. Major moment for music brand partnerships.', 'MODERATE – Align with nominee campaigns 2-3 months ahead', 2026, '12M+ US viewers, 200M+ social media impressions, Red carpet fashion moment, Music partnership peak', '1', 'The premier music awards ceremony.', '["Music fans", "18-45", "All genders", "Pop culture enthusiasts"]'::jsonb),
('VidCon 2026', 'VidCon 2026', 'VidCon 2026', 'Jun 25–28, 2026', '55K+ attendees', 'The premier creator economy event. Three tracks: Community, Creator, Industry. Major brand-creator matchmaking.', 'HIGH – Creator partnerships should be secured 3+ months ahead', 2026, '55,000+ attendees, #1 creator economy conference, Three tracks: Community, Creator, Industry, Major brand activation venue', '1', 'The largest event dedicated to online video creators and their fans.', '["Creators", "Gen Z", "13-30", "Digital natives", "Brand marketers"]'::jsonb),
('New York Fashion Week', 'New York Fashion Week', 'New York Fashion Week', 'Sep 8–12, 2026', '100M+ social impressions', 'Bi-annual fashion showcase. Street style, runway shows, brand events. Sets trends for the season.', 'HIGH – Secure creator partnerships 2-3 months ahead', 2026, '100M+ social impressions per season, Sets global fashion trends, Street style content explosion, Creator front-row presence growing', '1', 'One of the Big Four fashion weeks setting global trends.', '["Fashion industry", "Fashion-forward consumers", "18-45", "Female skew"]'::jsonb);

-- ============================================================
-- 6. SEED: CONFERENCES
-- ============================================================
INSERT INTO conferences (title, conference_name, name, industry_focus, typical_date, location, attendees, sponsorship_range, why_attend, key_audience, best_for_industries, description, expected_attendees, sponsorship_available, sponsorship_cost, date) VALUES
('VidSummit 2026', 'VidSummit 2026', 'VidSummit 2026', 'Creator Economy', 'September', 'Dallas, TX', '3,000+', '$15K–$50K', 'Deep-dive creator strategies, networking with top YouTubers and brand partners', 'YouTubers, Brand marketers, MCNs', 'Technology, Entertainment, Education, Fashion', 'Premier creator economy conference', 3000, true, 25000, '2026-09-20'),
('Social Media Marketing World', 'Social Media Marketing World', 'Social Media Marketing World', 'Marketing', 'March', 'San Diego, CA', '5,000+', '$20K–$75K', 'Latest social strategies, networking with top marketers, platform partnerships', 'Social media managers, CMOs, Brand strategists', 'All industries, Marketing, Technology', 'Leading social media marketing conference', 5000, true, 35000, '2026-03-15'),
('Influencer Marketing Summit', 'Influencer Marketing Summit', 'Influencer Marketing Summit', 'Influencer Marketing', 'May', 'New York, NY', '1,500+', '$10K–$40K', 'Influencer partnership strategies, ROI measurement, platform updates', 'Brand partnership leads, Talent managers, Agencies', 'Beauty, Fashion, Food, Lifestyle', 'Top influencer marketing event', 1500, true, 15000, '2026-05-10'),
('Brand Innovation Summit', 'Brand Innovation Summit', 'Brand Innovation Summit', 'Brand Marketing', 'July', 'Chicago, IL', '2,000+', '$12K–$45K', 'Cutting-edge brand partnership models, innovation in creator marketing', 'CMOs, VP Marketing, Innovation leads', 'Technology, Automotive, Finance, Retail', 'Brand partnership and innovation conference', 2000, true, 20000, '2026-07-22'),
('Creator Economy Expo', 'Creator Economy Expo', 'Creator Economy Expo', 'Creator Economy', 'August', 'Las Vegas, NV', '4,000+', '$20K–$60K', 'The business of being a creator, monetization strategies, brand partnerships', 'Full-time creators, Aspiring creators, Brand sponsors', 'All creator niches, Technology, Entertainment', 'The business of being a creator', 4000, true, 30000, '2026-08-12'),
('Advertising Week', 'Advertising Week', 'Advertising Week', 'Advertising', 'October', 'New York, NY', '10,000+', '$30K–$100K', 'Full spectrum of advertising and marketing innovation, including influencer track', 'CMOs, Agency leads, Brand marketers, Media buyers', 'All industries, Media, Entertainment', 'Premier advertising industry event', 10000, true, 50000, '2026-10-14'),
('CES 2026', 'CES 2026', 'CES 2026', 'Technology', 'January', 'Las Vegas, NV', '100,000+', '$50K–$500K', 'Largest tech event globally, product launches, media coverage, creator press tours', 'Tech creators, Brand marketers, Product teams', 'Technology, Gaming, Automotive, Health', 'The worlds largest consumer electronics show', 100000, true, 100000, '2026-01-06'),
('Cannes Lions', 'Cannes Lions', 'Cannes Lions', 'Advertising & Creativity', 'June', 'Cannes, France', '12,000+', '$50K–$250K', 'Global creative excellence, brand storytelling, influencer marketing awards track', 'Creative directors, CMOs, Agency leads', 'All industries, Entertainment, Luxury', 'The global benchmark for creative excellence', 12000, true, 75000, '2026-06-15'),
('Podcast Movement 2026', 'Podcast Movement 2026', 'Podcast Movement 2026', 'Audio/Podcasting', 'August', 'Washington, DC', '4,500+', '$15K–$50K', 'Podcasting strategies, audio creator partnerships, brand sponsorship deals', 'Podcasters, Audio creators, Brand sponsors', 'Entertainment, Education, News, Technology', 'Largest podcast industry conference', 4500, true, 25000, '2026-08-19'),
('TwitchCon 2026', 'TwitchCon 2026', 'TwitchCon 2026', 'Gaming/Streaming', 'October', 'San Diego, CA', '35,000+', '$25K–$100K', 'Live streaming strategies, gaming creator partnerships, esports sponsorships', 'Streamers, Gaming creators, Esports orgs, Brand sponsors', 'Gaming, Technology, Entertainment, Food', 'The premier live streaming and gaming community event', 35000, true, 50000, '2026-10-03');

-- ============================================================
-- 7. SEED: DEMOGRAPHIC SEGMENTS
-- ============================================================
INSERT INTO demographic_segments (title, name, description, age_range, gender, income_range, interests, platforms, size_estimate, buying_power, media_preferences, top_events, key_cultural_moments, brand_activation_tips, activation_tips, best_demographics) VALUES
('Gen Z Trendsetters', 'Gen Z Trendsetters', 'Fashion and culture-forward Gen Z consumers who drive viral trends', '18-26', 'all', '$25K-$50K', 'fashion, music, gaming, social justice, beauty', 'tiktok, instagram, youtube', 68000000, '$360B annually', 'Short-form video, Memes & viral content, Podcasts, Live streams', 'Pride Month, Coachella, ComplexCon, VidCon, Met Gala', 'Social justice movements, Cancel culture awareness, Sustainable fashion, Body positivity, Mental health advocacy', 'Authentic over polished — raw content wins, Use TikTok-first strategies, Partner with micro-creators for trust, Lead with values and social impact, Enable UGC and challenges', 'Authentic over polished — raw content wins, Use TikTok-first strategies, Partner with micro-creators for trust', 'Gen Z, 18-26, Digital natives, Trend-forward'),
('Millennial Parents', 'Millennial Parents', 'Millennial parents balancing family, career, and personal wellness', '30-40', 'all', '$75K-$125K', 'parenting, home, health, finance, education', 'instagram, facebook, youtube, pinterest', 45000000, '$2.5T annually', 'Long-form video, Product reviews, Parenting blogs, Social media groups', 'Back to School, Mothers Day, Fathers Day, Thanksgiving, Holiday Season', 'Work-from-home culture, Conscious parenting, Family wellness, Financial planning, Education technology', 'Focus on relatable family content, Highlight convenience and value, Use Instagram and YouTube for discovery, Partner with parenting creators, Show real, imperfect family moments', 'Focus on relatable family content, Highlight convenience and value, Use Instagram and YouTube for discovery', 'Millennial Parents, 30-40, Family-focused, Value-conscious'),
('Fitness Enthusiasts', 'Fitness Enthusiasts', 'Dedicated health and fitness consumers who prioritize wellness', '22-38', 'all', '$50K-$100K', 'fitness, nutrition, wellness, sports, outdoor', 'instagram, tiktok, youtube', 32000000, '$100B fitness market', 'Workout videos, Challenge content, Nutrition guides, Before/after transformations', 'New Year Season, Back to School, Olympics, World Cup, Super Bowl', 'Home workout revolution, Functional fitness trend, Plant-based nutrition, Recovery & wellness tech, Outdoor adventure growth', 'Support 30-day challenge formats, Provide affiliate codes for equipment, Focus on transformation narratives, Partner across multiple fitness niches, Enable creator workout programs', 'Support 30-day challenge formats, Provide affiliate codes for equipment, Focus on transformation narratives', 'Fitness Enthusiasts, 22-38, Health-conscious, Active lifestyle'),
('Tech Early Adopters', 'Tech Early Adopters', 'Technology enthusiasts who adopt new products early and influence others', '25-45', 'male_skew', '$80K-$150K', 'technology, gaming, productivity, AI, crypto', 'youtube, twitter, linkedin, reddit', 18000000, '$450B+ tech consumer market', 'In-depth reviews, Unboxing videos, Tech podcasts, Twitter/X threads', 'CES, SXSW, Apple events, Black Friday, Amazon Prime Day', 'AI revolution, Remote work tools, Smart home adoption, Gaming hardware cycles, Crypto/Web3 evolution', 'Provide early access to products, Invest in long-form YouTube content, Technical depth matters — dont oversimplify, Partner with creators who genuinely use products, Support honest, unbiased reviews', 'Provide early access to products, Invest in long-form YouTube content, Technical depth matters', 'Tech Early Adopters, 25-45, Male skew, Innovation-driven'),
('Beauty Conscious', 'Beauty Conscious', 'Beauty and personal care focused consumers seeking authenticity', '16-35', 'female_skew', '$30K-$75K', 'beauty, skincare, fashion, wellness, self-care', 'instagram, tiktok, youtube, pinterest', 55000000, '$580B global beauty market', 'Tutorial videos, GRWM content, Product reviews, Skincare routines', 'Pride Month, Valentines Day, Met Gala, NYFW, Mothers Day', 'Clean beauty movement, Inclusivity in beauty, Skinimalism trend, Beauty tech (AR try-ons), Wellness-beauty convergence', 'Send products early for genuine first impressions, Prioritize video content (Reels, TikTok, YouTube), Include diverse creators across skin types, Support tutorial and routine content, Enable authentic before/after stories', 'Send products early for genuine first impressions, Prioritize video content, Include diverse creators across skin types', 'Beauty Conscious, 16-35, Female skew, Authenticity-driven'),
('Gaming & Esports Audience', 'Gaming & Esports Audience', 'Hardcore and casual gamers across mobile, PC, and console', '16-35', 'male_skew', '$35K-$85K', 'gaming, esports, technology, streaming, pop culture', 'youtube, twitch, tiktok, discord, twitter', 42000000, '$200B global gaming market', 'Live streams, Gameplay videos, Reviews, Esports tournaments', 'TwitchCon, ComplexCon, CES, Game awards, E3/Summer Game Fest', 'Mobile gaming explosion, Esports mainstream acceptance, Gaming creator economy growth, Cloud gaming adoption, In-game brand integrations', 'Sponsor authentic gameplay streams, Provide early access to games, Support tournament/esports partnerships, Focus on creators who match your game genre, Enable in-game product integrations', 'Sponsor authentic gameplay streams, Provide early access to games, Support tournament/esports', 'Gamers, 16-35, Male skew, Digital entertainment'),
('BIPOC Consumers', 'BIPOC Consumers', 'Black, Indigenous, and People of Color driving culture and trends', '18-45', 'all', '$40K-$80K', 'fashion, music, food, beauty, culture, social justice', 'instagram, tiktok, youtube, twitter', 130000000, '$4.7T combined buying power', 'Short-form video, Music content, Cultural storytelling, Community platforms', 'Black History Month, Hispanic Heritage Month, AAPI Heritage Month, Juneteenth, Diwali', 'Cultural representation in media, Black excellence movement, Latino economic power, AAPI visibility, Indigenous rights awareness', 'Invest in year-round representation, not just heritage months, Partner with BIPOC-owned agencies, Center authentic cultural storytelling, Support BIPOC creator businesses, Ensure diverse creative teams', 'Invest in year-round representation, Partner with BIPOC-owned agencies, Center authentic cultural storytelling', 'BIPOC, 18-45, Culturally engaged, Trend-drivers'),
('Luxury & Affluent', 'Luxury & Affluent', 'High-income consumers seeking premium experiences and products', '30-55', 'all', '$150K+', 'luxury, travel, fashion, fine dining, art, wellness', 'instagram, youtube, linkedin, pinterest', 20000000, '$1.5T global luxury market', 'Aspirational lifestyle content, Expert reviews, Experience-driven stories, LinkedIn thought leadership', 'Met Gala, Cannes Lions, NYFW, Art Basel, Grand Prix', 'Quiet luxury trend, Experience over possessions, Sustainability in luxury, Digital-first luxury retail, Personalization expectations', 'Focus on exclusivity and craftsmanship, Partner with aspirational lifestyle creators, Quality over quantity in content, Support experience-driven storytelling, Use Instagram and YouTube for visual luxury', 'Focus on exclusivity and craftsmanship, Partner with aspirational lifestyle creators, Quality over quantity in content', 'Affluent, 30-55, Luxury consumers, Experience-driven');

-- ============================================================
-- 8. SEED: RATE BENCHMARKS (with UI-expected fields)
-- ============================================================
INSERT INTO rate_benchmarks (title, tier, platform, niche, content_type, followers_min, followers_max, rate_min, rate_max, rate_median, sponsored_post_min, sponsored_post_max, brand_deal_min, brand_deal_max, ambassador_annual_min, ambassador_annual_max, source) VALUES
('Nano Tier Benchmark', 'nano', 'all', 'all', 'all', 1000, 9999, 50, 500, 200, 50, 500, 200, 2000, 1000, 6000, 'PartnerIQ 2026 Benchmark'),
('Micro Tier Benchmark', 'micro', 'all', 'all', 'all', 10000, 99999, 500, 5000, 2000, 500, 5000, 2000, 15000, 6000, 36000, 'PartnerIQ 2026 Benchmark'),
('Mid Tier Benchmark', 'mid', 'all', 'all', 'all', 100000, 499999, 5000, 20000, 10000, 5000, 20000, 15000, 75000, 36000, 120000, 'PartnerIQ 2026 Benchmark'),
('Macro Tier Benchmark', 'macro', 'all', 'all', 'all', 500000, 999999, 10000, 50000, 25000, 10000, 50000, 50000, 250000, 120000, 500000, 'PartnerIQ 2026 Benchmark'),
('Mega Tier Benchmark', 'mega', 'all', 'all', 'all', 1000000, 4999999, 25000, 150000, 75000, 25000, 150000, 100000, 750000, 300000, 1500000, 'PartnerIQ 2026 Benchmark'),
('Celebrity Tier Benchmark', 'celebrity', 'all', 'all', 'all', 5000000, NULL, 100000, 1000000, 350000, 100000, 1000000, 500000, 5000000, 1000000, 10000000, 'PartnerIQ 2026 Benchmark'),
-- Platform-specific benchmarks
('IG Micro Lifestyle', 'micro', 'instagram', 'lifestyle', 'post', 10000, 99999, 500, 3000, 1500, 500, 3000, 2000, 12000, 6000, 30000, 'PartnerIQ 2026 Report'),
('IG Mid Beauty', 'mid', 'instagram', 'beauty', 'post', 100000, 499999, 3000, 10000, 6000, 3000, 10000, 8000, 40000, 30000, 100000, 'PartnerIQ 2026 Report'),
('TikTok Macro Fitness', 'macro', 'tiktok', 'fitness', 'video', 500000, 999999, 8000, 30000, 18000, 8000, 30000, 25000, 100000, 80000, 300000, 'PartnerIQ 2026 Report'),
('YT Mid Tech', 'mid', 'youtube', 'tech', 'integration', 100000, 499999, 5000, 15000, 8000, 5000, 15000, 10000, 50000, 40000, 150000, 'PartnerIQ 2026 Report'),
('YT Macro Gaming', 'macro', 'youtube', 'gaming', 'integration', 500000, 999999, 10000, 40000, 20000, 10000, 40000, 30000, 150000, 100000, 400000, 'PartnerIQ 2026 Report');

-- ============================================================
-- 9. SEED: PLATFORM MULTIPLIERS (with UI-expected fields)
-- ============================================================
INSERT INTO platform_multipliers (title, platform, base_multiplier, engagement_weight, reach_weight, base_cpm_min, base_cpm_max, rate_multiplier, engagement_benchmark_min, engagement_benchmark_max, notes) VALUES
('Instagram', 'instagram', 1.0, 0.6, 0.4, 5.0, 15.0, 1.0, 2.0, 6.0, 'Baseline platform. Strong for lifestyle, beauty, fashion, food. Best for visual storytelling.'),
('TikTok', 'tiktok', 1.15, 0.75, 0.25, 3.0, 10.0, 1.15, 4.0, 12.0, 'Highest organic reach potential. Viral content can 10x impressions. Best for Gen Z campaigns.'),
('YouTube', 'youtube', 1.3, 0.4, 0.6, 12.0, 30.0, 1.35, 3.0, 8.0, 'Highest CPM. Long-form premium content. Best for tech, education, detailed reviews.'),
('Twitter/X', 'twitter', 0.7, 0.5, 0.5, 2.0, 8.0, 0.65, 1.0, 4.0, 'Real-time conversation platform. Good for tech, news, culture commentary.'),
('LinkedIn', 'linkedin', 1.2, 0.6, 0.4, 15.0, 40.0, 1.4, 2.0, 5.0, 'B2B premium. Highest value per impression for professional audiences.'),
('Twitch', 'twitch', 1.1, 0.8, 0.2, 4.0, 12.0, 1.1, 5.0, 15.0, 'Live streaming platform. Highest engagement rates. Best for gaming, esports, music.'),
('Pinterest', 'pinterest', 0.8, 0.3, 0.7, 3.0, 10.0, 0.85, 1.0, 3.0, 'High purchase intent platform. Best for home, fashion, food, DIY content.'),
('Snapchat', 'snapchat', 0.75, 0.6, 0.4, 3.0, 8.0, 0.8, 3.0, 8.0, 'Young audience platform. Best for AR experiences and ephemeral campaigns.');

-- ============================================================
-- 10. SEED: CATEGORY PREMIUMS (with UI-expected fields)
-- ============================================================
INSERT INTO category_premiums (title, category, premium_percent, demand_level, premium_multiplier, rationale, notes) VALUES
('Technology', 'technology', 20, 'high', 1.20, 'Strong brand demand in tech. High-value products justify premium creator rates. Tech creators have influential audiences.', 'Tech brands actively compete for authentic creator partnerships'),
('Beauty', 'beauty', 15, 'high', 1.15, 'Beauty brands invest heavily in creator content. Tutorial and review content drives direct sales. High ROI category.', 'Beauty remains top category for influencer marketing ROI'),
('Fitness', 'fitness', 18, 'very_high', 1.18, 'Peak demand post-2020 health wave. Transformation content performs exceptionally. Strong affiliate potential.', 'Fitness creators command premium due to engagement and conversion'),
('Gaming', 'gaming', 12, 'high', 1.12, 'Growing segment with strong brand interest. Esports sponsorships growing rapidly. Long engagement sessions.', 'Gaming offers longest average content engagement'),
('Food', 'food', 10, 'medium', 1.10, 'Steady demand for food content. Recipe integration is highly shareable. Strong for CPG and restaurant brands.', 'Most shared content category across platforms'),
('Lifestyle', 'lifestyle', 8, 'medium', 1.08, 'Broad category, flexible content. Appeals to wide range of brands. Moderate premium due to supply.', 'Broad category with diverse brand opportunities'),
('Travel', 'travel', 5, 'medium', 1.05, 'Recovering post-pandemic. Aspirational content with strong visual appeal. Seasonal demand fluctuations.', 'Seasonal demand with peaks around holidays'),
('Finance', 'finance', 25, 'high', 1.25, 'Regulated space requiring expertise. Creator trust is paramount. High customer lifetime value for brands.', 'Highest premium due to regulatory complexity and audience value'),
('Education', 'education', 15, 'high', 1.15, 'EdTech brands pay premium for authentic educational content. Rising demand for learning creators.', 'EdTech investment driving creator demand'),
('Fashion', 'fashion', 14, 'high', 1.14, 'Seasonal demand cycles. Strong visual platform performance. Haul and try-on content drives sales.', 'Seasonal peaks around fashion weeks and holidays'),
('Sports', 'sports', 16, 'high', 1.16, 'Major event cycles drive demand. Athlete partnerships command premium. Sports betting brands are new entrants.', 'Event-driven demand with Olympic and World Cup cycles'),
('Entertainment', 'entertainment', 12, 'medium', 1.12, 'Movie/TV releases create partnership windows. Premiere events drive creator activations.', 'Project-based demand around release cycles');

-- ============================================================
-- 11. SEED: ROI BENCHMARKS (with UI-expected fields)
-- ============================================================
INSERT INTO roi_benchmarks (title, deal_type, industry, channel, median_roi, top_quartile_roi, bottom_quartile_roi, avg_roi, measurement_period, time_to_roi_days, sample_size) VALUES
('Sponsored Post ROI', 'sponsored_post', 'All', 'instagram', 4.2, 8.5, 1.8, 4.87, '30 days post-campaign', 30, 2500),
('Brand Ambassador ROI', 'brand_ambassador', 'All', 'multi-platform', 6.8, 14.2, 2.5, 7.83, '90 days post-start', 90, 1200),
('Product Gifting ROI', 'product_gifting', 'Beauty', 'instagram', 11.5, 22.0, 3.5, 12.33, '60 days post-ship', 60, 800),
('Affiliate Partnership ROI', 'affiliate_partnership', 'All', 'multi-platform', 7.2, 15.8, 2.8, 8.60, 'Ongoing monthly', 30, 3500),
('Event Sponsorship ROI', 'event_sponsorship', 'All', 'live', 3.5, 7.2, 1.2, 3.97, '30 days post-event', 30, 600),
('Content Series ROI', 'content_series', 'Technology', 'youtube', 5.8, 12.4, 2.2, 6.80, '90 days post-series', 90, 450),
('Takeover Campaign ROI', 'takeover_campaign', 'Fashion', 'tiktok', 8.9, 18.5, 3.1, 10.17, '14 days post-campaign', 14, 350),
('Long-term Partnership ROI', 'long_term_partnership', 'All', 'multi-platform', 9.5, 20.0, 3.8, 11.10, '6 months', 180, 900),
('UGC Campaign ROI', 'UGC_campaign', 'All', 'tiktok', 6.2, 13.8, 2.0, 7.33, '30 days post-launch', 30, 1500),
('Influencer Whitelisting ROI', 'influencer_whitelisting', 'All', 'instagram', 5.5, 11.0, 2.5, 6.33, '30 days post-campaign', 30, 700);

-- ============================================================
-- 12. SEED: INDUSTRY GUIDES (with UI-expected fields)
-- ============================================================
INSERT INTO industry_guides (title, industry, sector, summary, content, best_practices, best_demographics, published) VALUES
('Technology & SaaS Partnership Guide', 'Technology', 'SaaS', 'How tech brands maximize ROI through creator partnerships', 'Technology brands see 3.2x higher engagement when partnering with authentic tech creators. Key strategies include product integration videos, early access programs, and educational content series. The tech vertical commands a 20% premium due to high product value and influential audiences.', 'Partner with creators who genuinely use your products, Focus on educational content over promotional, Leverage long-form YouTube for complex products, Track attribution through custom links and codes, Invest in unboxing and first-impression content', 'Tech Early Adopters, Gen Z Trendsetters, Gaming & Esports Audience', true),
('Beauty & Personal Care Playbook', 'Beauty', 'Personal Care', 'Creator partnership strategies for beauty brands', 'Beauty remains one of the top categories for influencer marketing with an average ROI of 5.2x. Tutorial content, GRWM videos, and authentic reviews drive the highest conversion rates. The beauty category commands a 15% premium with strong competition for top creators.', 'Send products early for genuine first impressions, Prioritize video content (Reels, TikTok, YouTube), Include before/after results when applicable, Partner with diverse creators across skin types, Support tutorial and routine content formats', 'Beauty Conscious, Gen Z Trendsetters, Millennial Parents', true),
('Fitness & Wellness Brand Guide', 'Fitness', 'Health & Wellness', 'Building authentic fitness creator partnerships', 'Fitness creators generate the highest engagement rates across platforms, averaging 8.1% on TikTok. Challenge-based content and transformation stories drive virality. The fitness vertical commands an 18% premium driven by strong post-2020 demand.', 'Support 30-day challenge formats, Provide affiliate codes for equipment, Focus on before/after transformation narratives, Partner across multiple fitness niches, Enable creator workout programs', 'Fitness Enthusiasts, Gen Z Trendsetters, Millennial Parents', true),
('Food & Beverage Partnership Strategies', 'Food & Beverage', 'CPG', 'How F&B brands win with creator content', 'Food content is the most shared category on social media. Recipe integration, taste tests, and meal prep content create the strongest brand affinity. F&B partnerships work across all platforms with 10% category premium.', 'Ship products for authentic recipe creation, Enable creative freedom in recipe development, Support both quick TikTok and long-form YouTube, Partner with creators across dietary preferences, Leverage seasonal food moments (Thanksgiving, BBQ season)', 'Millennial Parents, Gen Z Trendsetters, Fitness Enthusiasts', true),
('Fashion & Apparel Creator Guide', 'Fashion', 'Apparel & Accessories', 'Maximizing fashion brand visibility through creators', 'Fashion partnerships thrive on aesthetic alignment and authentic styling. Haul videos, OOTD content, and seasonal lookbooks consistently outperform traditional advertising. Fashion commands a 14% premium with seasonal demand peaks.', 'Allow creators to style products their own way, Support try-on and haul content formats, Time campaigns with seasonal collections, Include size-inclusive creators, Leverage fashion week and award season moments', 'Gen Z Trendsetters, Beauty Conscious, Luxury & Affluent', true),
('Gaming & Entertainment Partnerships', 'Gaming', 'Entertainment', 'Engaging gaming audiences through creator sponsorships', 'Gaming creators offer unparalleled reach and engagement, particularly on YouTube and Twitch. Live streaming integrations, gameplay reviews, and esports partnerships deliver strong ROI with 12% category premium.', 'Sponsor gameplay streams for authentic exposure, Provide early access to games and hardware, Support tournament and esports partnerships, Focus on creators who match your game genre, Enable in-game product integrations', 'Gaming & Esports Audience, Gen Z Trendsetters, Tech Early Adopters', true),
('Finance & Fintech Creator Marketing', 'Finance', 'Fintech', 'Building trust-based financial creator partnerships', 'Financial services partnerships require high trust and regulatory compliance. Finance commands the highest category premium (25%) due to audience value and regulatory complexity. Educational content performs best.', 'Ensure all content meets regulatory requirements, Partner with credentialed financial creators, Focus on educational over promotional content, Use long-form formats for complex topics, Build long-term ambassador relationships', 'Tech Early Adopters, Millennial Parents, Luxury & Affluent', true),
('Sports & Athletic Brand Guide', 'Sports', 'Athletic', 'Leveraging sports creators and athlete partnerships', 'Sports partnerships are driven by major event cycles (Olympics, World Cup, Super Bowl). Athlete creators command premium rates but deliver exceptional engagement. 16% category premium with event-driven demand spikes.', 'Align campaigns with major sporting events, Support athlete training and lifestyle content, Enable fan engagement and challenge formats, Partner with both pro athletes and fitness creators, Leverage sports betting content carefully', 'Fitness Enthusiasts, Gaming & Esports Audience, Gen Z Trendsetters', true);

-- ============================================================
-- 13. SEED: VIEWERSHIP TIERS (expanded)
-- ============================================================
INSERT INTO viewership_tiers (title, name, platform, min_followers, max_followers, avg_engagement_rate, typical_rate_min, typical_rate_max, description) VALUES
('Nano IG', 'Nano', 'instagram', 1000, 9999, 8.5, 50, 500, '1K-10K followers, hyper-engaged niche communities'),
('Micro IG', 'Micro', 'instagram', 10000, 99999, 6.2, 500, 3000, '10K-100K followers, strong community trust'),
('Mid IG', 'Mid', 'instagram', 100000, 499999, 4.1, 3000, 10000, '100K-500K, established creators with diverse reach'),
('Macro IG', 'Macro', 'instagram', 500000, 999999, 3.2, 10000, 30000, '500K-1M, wide reach with brand credibility'),
('Mega IG', 'Mega', 'instagram', 1000000, 4999999, 2.8, 30000, 100000, '1M-5M, celebrity-adjacent mass reach'),
('Celebrity IG', 'Celebrity', 'instagram', 5000000, NULL, 1.9, 100000, 500000, '5M+, mass market cultural influence'),
('Nano TikTok', 'Nano', 'tiktok', 1000, 9999, 12.0, 100, 800, '1K-10K on TikTok, viral potential'),
('Micro TikTok', 'Micro', 'tiktok', 10000, 99999, 9.5, 800, 4000, '10K-100K TikTok creators'),
('Mid TikTok', 'Mid', 'tiktok', 100000, 499999, 7.2, 4000, 15000, '100K-500K TikTok reach'),
('Macro TikTok', 'Macro', 'tiktok', 500000, 999999, 5.8, 15000, 40000, '500K-1M TikTok influence'),
('Mega TikTok', 'Mega', 'tiktok', 1000000, 4999999, 4.5, 40000, 120000, '1M-5M TikTok mass reach'),
('Nano YT', 'Nano', 'youtube', 1000, 9999, 6.0, 200, 1000, '1K-10K YouTube subscribers'),
('Micro YT', 'Micro', 'youtube', 10000, 99999, 5.2, 1000, 5000, '10K-100K YouTube creators'),
('Mid YT', 'Mid', 'youtube', 100000, 499999, 4.0, 5000, 20000, '100K-500K YouTube established'),
('Macro YT', 'Macro', 'youtube', 500000, 999999, 3.5, 15000, 50000, '500K-1M YouTube premium reach'),
('Mega YT', 'Mega', 'youtube', 1000000, 4999999, 3.0, 40000, 150000, '1M-5M YouTube mass audience'),
('Nano Twitch', 'Nano', 'twitch', 100, 999, 15.0, 50, 300, '100-1K Twitch followers'),
('Micro Twitch', 'Micro', 'twitch', 1000, 9999, 12.0, 300, 2000, '1K-10K Twitch community'),
('Mid Twitch', 'Mid', 'twitch', 10000, 49999, 8.0, 2000, 8000, '10K-50K Twitch creators'),
('Macro Twitch', 'Macro', 'twitch', 50000, 499999, 5.0, 5000, 25000, '50K-500K Twitch streamers');

-- ============================================================
-- DONE!
-- ============================================================
SELECT 'Schema fixes, RLS policies, and seed data applied successfully!' AS result;
