-- PartnerIQ: Fix Schema + RLS + Seed Data
-- Run this entire script in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This adds missing columns expected by the UI, relaxes RLS for demo use, and seeds all data.

-- ============================================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================

-- Culture Events: pages expect event_name, tier, category, month, year, dates, best_industries, etc.
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS event_name text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS tier text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS month text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS dates text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS best_industries text[];
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS audience_reach text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS activation_opportunities text[];
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS planning_lead_time text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS key_demographics text[];
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS audience_demographics jsonb;
ALTER TABLE culture_events ADD COLUMN IF NOT EXISTS location text;

-- Mega Events: pages expect event_name, dates, global_reach, format_details, planning_urgency, year, key_facts
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS event_name text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS dates text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS global_reach text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS format_details text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS planning_urgency text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS key_facts text[];
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS tier text;
ALTER TABLE mega_events ADD COLUMN IF NOT EXISTS audience_demographics jsonb;

-- Conferences: pages expect conference_name, industry_focus, typical_date, attendees, sponsorship_range, why_attend, key_audience, best_for_industries
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS conference_name text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS industry_focus text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS typical_date text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS attendees text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS sponsorship_range text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS why_attend text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS key_audience text;
ALTER TABLE conferences ADD COLUMN IF NOT EXISTS best_for_industries text[];

-- Demographic Segments: pages expect population_size, buying_power, media_preferences, top_events, key_cultural_moments, brand_activation_tips, activation_tips
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS population_size text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS buying_power text;
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS media_preferences text[];
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS top_events text[];
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS key_cultural_moments text[];
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS brand_activation_tips text[];
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS activation_tips text[];
ALTER TABLE demographic_segments ADD COLUMN IF NOT EXISTS best_demographics text[];

-- Rate Benchmarks: pages expect followers_min, followers_max, sponsored_post_min/max, brand_deal_min/max, ambassador_annual_min/max
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS followers_min bigint;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS followers_max bigint;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS sponsored_post_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS sponsored_post_max numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS brand_deal_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS brand_deal_max numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS ambassador_annual_min numeric;
ALTER TABLE rate_benchmarks ADD COLUMN IF NOT EXISTS ambassador_annual_max numeric;

-- Platform Multipliers: pages expect base_cpm_min, base_cpm_max, rate_multiplier, engagement_benchmark_min/max
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_cpm_min numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS base_cpm_max numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS rate_multiplier numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_benchmark_min numeric;
ALTER TABLE platform_multipliers ADD COLUMN IF NOT EXISTS engagement_benchmark_max numeric;

-- Category Premiums: pages expect premium_multiplier, rationale
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS premium_multiplier numeric;
ALTER TABLE category_premiums ADD COLUMN IF NOT EXISTS rationale text;

-- ROI Benchmarks: pages expect deal_type, bottom_quartile_roi, measurement_period
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS deal_type text;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS bottom_quartile_roi numeric;
ALTER TABLE roi_benchmarks ADD COLUMN IF NOT EXISTS measurement_period text;

-- Industry Guides: pages expect sector, best_demographics
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS sector text;
ALTER TABLE industry_guides ADD COLUMN IF NOT EXISTS best_demographics text[];

-- ============================================================
-- 2. FIX RLS POLICIES - Make all tables readable by any authenticated user
-- ============================================================

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
INSERT INTO culture_events (event_name, name, tier, category, subcategory, month, year, dates, best_industries, audience_reach, activation_opportunities, planning_lead_time, key_demographics, location, audience_demographics) VALUES
-- Q1 2026
('New Year / New Me Season', 'New Year / New Me Season', 'Tier 1', 'Seasonal', 'New Year', 'January', 2026, 'Jan 1–31', ARRAY['Fitness','Health','Finance','Technology'], '320M+ US adults', ARRAY['Resolution content','Transformation challenges','Product launches','Goal-setting campaigns'], '3-4 months', ARRAY['18-45','All genders','Health-conscious'], 'United States', '["Gen Z", "Millennials", "Health-conscious consumers"]'::jsonb),
('Black History Month', 'Black History Month', 'Tier 1', 'Cultural', 'Heritage Month', 'February', 2026, 'Feb 1–28', ARRAY['Entertainment','Fashion','Beauty','Food','Education'], '45M+ Black Americans', ARRAY['Storytelling campaigns','Creator spotlights','Community partnerships','Educational content'], '4-6 months', ARRAY['18-55','Black American community','All genders'], 'United States', '["Black American community", "Gen Z", "Millennials", "Allies"]'::jsonb),
('Valentines Day', 'Valentines Day', 'Tier 2', 'Seasonal', 'Holiday', 'February', 2026, 'Feb 14', ARRAY['Fashion','Beauty','Food','Jewelry','Travel'], '150M+ US consumers', ARRAY['Gift guides','Couples content','Self-love campaigns','Restaurant partnerships'], '2-3 months', ARRAY['18-45','All genders','Couples'], 'Global', '["Couples", "Singles", "18-45", "All genders"]'::jsonb),
('Super Bowl LX', 'Super Bowl LX', 'Tier 1', 'Sports', 'Football', 'February', 2026, 'Feb 8', ARRAY['Food','Beverage','Technology','Automotive','Entertainment'], '115M+ US viewers', ARRAY['Watch party content','Ad reaction videos','Brand activations','Tailgate campaigns'], '6-12 months', ARRAY['18-55','Male skew','Sports fans'], 'United States', '["Sports fans", "18-55", "Male skew", "Mass market"]'::jsonb),
('International Womens Day', 'International Womens Day', 'Tier 2', 'Cultural', 'Awareness Day', 'March', 2026, 'Mar 8', ARRAY['Beauty','Fashion','Technology','Finance','Wellness'], '190+ countries', ARRAY['Women-led brand campaigns','Female founder spotlights','Empowerment content','Mentorship activations'], '2-3 months', ARRAY['All ages','Female focus','Allies'], 'Global', '["Women", "Female-identifying", "Allies", "All ages"]'::jsonb),
('Ramadan', 'Ramadan', 'Tier 1', 'Cultural', 'Religious', 'March', 2026, 'Mar 1 – Mar 30', ARRAY['Food','Fashion','Finance','Travel','Beauty'], '1.8B Muslims globally', ARRAY['Iftar content','Modest fashion','Community giving','Food brand integrations'], '4-6 months', ARRAY['All ages','Muslim community','MENA diaspora'], 'Global', '["Muslim community", "MENA diaspora", "All ages"]'::jsonb),
('March Madness', 'March Madness', 'Tier 1', 'Sports', 'Basketball', 'March', 2026, 'Mar 17 – Apr 6', ARRAY['Sports','Food','Beverage','Technology','Gaming'], '100M+ bracket participants', ARRAY['Bracket challenges','Watch party content','Athletic brand campaigns','Gaming crossovers'], '3-4 months', ARRAY['18-45','Male skew','Sports fans','Students'], 'United States', '["College sports fans", "18-35", "Male skew", "Students"]'::jsonb),
-- Q2 2026
('Earth Day', 'Earth Day', 'Tier 2', 'Cultural', 'Awareness Day', 'April', 2026, 'Apr 22', ARRAY['Fashion','Beauty','Food','Technology','Outdoor'], '1B+ participants globally', ARRAY['Sustainability campaigns','Eco-product launches','Cleanup events','Educational content'], '2-3 months', ARRAY['Gen Z','Millennials','Eco-conscious'], 'Global', '["Eco-conscious consumers", "Gen Z", "Millennials", "All ages"]'::jsonb),
('Asian American Pacific Islander Heritage Month', 'AAPI Heritage Month', 'Tier 2', 'Cultural', 'Heritage Month', 'May', 2026, 'May 1–31', ARRAY['Food','Fashion','Technology','Entertainment','Beauty'], '24M+ AAPI Americans', ARRAY['Creator spotlights','Cultural storytelling','Food heritage content','Brand partnerships'], '3-4 months', ARRAY['All ages','AAPI community','Allies'], 'United States', '["AAPI community", "All ages", "Cultural enthusiasts"]'::jsonb),
('Mental Health Awareness Month', 'Mental Health Awareness Month', 'Tier 2', 'Cultural', 'Awareness Month', 'May', 2026, 'May 1–31', ARRAY['Wellness','Health','Technology','Beauty','Fitness'], '52M+ US adults affected', ARRAY['Wellness brand campaigns','Self-care content','App partnerships','Educational series'], '3-4 months', ARRAY['All ages','Gen Z','Millennials'], 'United States', '["Gen Z", "Millennials", "Wellness community", "All ages"]'::jsonb),
('Mothers Day', 'Mothers Day', 'Tier 1', 'Seasonal', 'Holiday', 'May', 2026, 'May 10', ARRAY['Beauty','Fashion','Food','Home','Wellness'], '$31.7B US spending', ARRAY['Gift guides','Mom creator spotlights','Family content','Product gifting'], '2-3 months', ARRAY['All ages','Mothers','Daughters','Partners'], 'Global', '["Mothers", "Gift-givers", "Families", "All ages"]'::jsonb),
('Pride Month', 'Pride Month', 'Tier 1', 'Cultural', 'Heritage Month', 'June', 2026, 'Jun 1–30', ARRAY['Fashion','Beauty','Entertainment','Technology','Food'], '$1.4T LGBTQ+ buying power', ARRAY['Authentic brand allyship','Creator partnerships','Pride event sponsorships','Community campaigns'], '4-6 months', ARRAY['LGBTQ+','Allies','Gen Z','Millennials'], 'Global', '["LGBTQ+ community", "Allies", "Gen Z", "Millennials"]'::jsonb),
('Fathers Day', 'Fathers Day', 'Tier 2', 'Seasonal', 'Holiday', 'June', 2026, 'Jun 21', ARRAY['Technology','Outdoor','Sports','Automotive','Fashion'], '$22.9B US spending', ARRAY['Gift guides','Dad creator spotlights','Grilling & outdoor content','Tech gadget reviews'], '2-3 months', ARRAY['All ages','Fathers','Sons/Daughters','Partners'], 'Global', '["Fathers", "Gift-givers", "Families"]'::jsonb),
-- Q3 2026
('Fourth of July', 'Fourth of July', 'Tier 1', 'Seasonal', 'Holiday', 'July', 2026, 'Jul 4', ARRAY['Food','Beverage','Outdoor','Fashion','Entertainment'], '330M+ Americans', ARRAY['Cookout content','Travel/vacation campaigns','Patriotic fashion','Fireworks events'], '2-3 months', ARRAY['All ages','American consumers','Families'], 'United States', '["American consumers", "Families", "All ages"]'::jsonb),
('Back to School', 'Back to School', 'Tier 1', 'Seasonal', 'Education', 'August', 2026, 'Aug 1–Sep 7', ARRAY['Technology','Fashion','Education','Sports','Food'], '$41.5B US spending', ARRAY['Haul videos','Tech reviews','Dorm room setups','Study tips content'], '3-4 months', ARRAY['Students','Parents','Teachers','Teens'], 'United States', '["Students", "Parents", "Teachers", "Teens", "18-35"]'::jsonb),
('Hispanic Heritage Month', 'Hispanic Heritage Month', 'Tier 1', 'Cultural', 'Heritage Month', 'September', 2026, 'Sep 15 – Oct 15', ARRAY['Food','Fashion','Entertainment','Beauty','Music'], '63M+ Hispanic Americans', ARRAY['Cultural storytelling','Creator spotlights','Food heritage content','Music partnerships'], '4-6 months', ARRAY['Hispanic/Latino community','Spanish speakers','All ages'], 'United States', '["Hispanic/Latino community", "Spanish speakers", "All ages"]'::jsonb),
-- Q4 2026
('Halloween', 'Halloween', 'Tier 1', 'Seasonal', 'Holiday', 'October', 2026, 'Oct 31', ARRAY['Fashion','Beauty','Food','Entertainment','Candy'], '$12.2B US spending', ARRAY['Costume content','Makeup tutorials','Candy brand campaigns','Spooky themed series'], '2-3 months', ARRAY['All ages','Gen Z','Millennials','Families'], 'United States', '["All ages", "Gen Z", "Millennials", "Families"]'::jsonb),
('Diwali', 'Diwali', 'Tier 2', 'Cultural', 'Religious', 'October', 2026, 'Oct 20', ARRAY['Fashion','Food','Beauty','Home','Technology'], '1B+ Hindus globally', ARRAY['Cultural celebrations','Fashion & jewelry content','Food & sweets content','Lighting & decor'], '3-4 months', ARRAY['South Asian community','Hindu community','All ages'], 'Global', '["South Asian community", "Hindu community", "All ages"]'::jsonb),
('Thanksgiving', 'Thanksgiving', 'Tier 1', 'Seasonal', 'Holiday', 'November', 2026, 'Nov 26', ARRAY['Food','Travel','Home','Retail'], '330M+ Americans', ARRAY['Recipe content','Travel campaigns','Family gathering content','Gratitude campaigns'], '2-3 months', ARRAY['All ages','Families','American consumers'], 'United States', '["American families", "Food enthusiasts", "All ages"]'::jsonb),
('Black Friday / Cyber Monday', 'Black Friday / Cyber Monday', 'Tier 1', 'Seasonal', 'Shopping', 'November', 2026, 'Nov 27–30', ARRAY['Technology','Fashion','Beauty','Home','All retail'], '$9.8B+ online sales', ARRAY['Deal roundup content','Unboxing hauls','Tech reviews','Gift guides'], '3-6 months', ARRAY['18-55','All genders','Bargain hunters'], 'Global', '["Bargain hunters", "18-55", "Online shoppers", "All genders"]'::jsonb),
('Holiday Season / Christmas', 'Holiday Season / Christmas', 'Tier 1', 'Seasonal', 'Holiday', 'December', 2026, 'Dec 1–25', ARRAY['All industries'], '$936B+ US holiday spending', ARRAY['Gift guides','Holiday hauls','Seasonal content','Brand gifting campaigns'], '4-6 months', ARRAY['All ages','All genders','Global audience'], 'Global', '["All ages", "All genders", "Global consumers", "Families"]'::jsonb),
('Lunar New Year', 'Lunar New Year', 'Tier 2', 'Cultural', 'Heritage', 'February', 2027, 'Feb 6', ARRAY['Food','Fashion','Beauty','Finance','Travel'], '2B+ celebrate globally', ARRAY['Cultural celebration content','Red & gold fashion','Traditional food content','Travel partnerships'], '3-4 months', ARRAY['East Asian community','AAPI','All ages'], 'Global', '["East Asian community", "AAPI", "All ages"]'::jsonb),
('Eid al-Fitr', 'Eid al-Fitr', 'Tier 2', 'Cultural', 'Religious', 'March', 2026, 'Mar 30–31', ARRAY['Fashion','Food','Beauty','Finance','Travel'], '1.8B Muslims globally', ARRAY['Celebration content','Fashion & beauty looks','Gift-giving campaigns','Community events'], '3-4 months', ARRAY['Muslim community','All ages'], 'Global', '["Muslim community", "All ages", "MENA diaspora"]'::jsonb),
('World Cup Qualifiers 2026', 'World Cup Qualifiers 2026', 'Tier 1', 'Sports', 'Soccer', 'Various', 2026, 'Throughout 2026', ARRAY['Sports','Beverage','Fashion','Technology','Gaming'], '4B+ global viewers', ARRAY['Watch party content','Jersey & merch campaigns','Sports tech reviews','Fan engagement'], '6-12 months', ARRAY['18-55','Male skew','Global sports fans'], 'Global', '["Global sports fans", "18-55", "Male skew"]'::jsonb),
('NBA Finals', 'NBA Finals', 'Tier 1', 'Sports', 'Basketball', 'June', 2026, 'Jun 4–18', ARRAY['Sports','Fashion','Beverage','Technology'], '15M+ US viewers', ARRAY['Watch party content','Sneaker culture campaigns','Player partnerships','Sports betting adjacent'], '3-4 months', ARRAY['18-45','Male skew','Basketball fans'], 'United States', '["Basketball fans", "18-45", "Male skew", "Urban culture"]'::jsonb),
('Olympics 2026 (Winter)', 'Olympics 2026 (Winter)', 'Tier 1', 'Sports', 'Multi-sport', 'February', 2026, 'Feb 6–22', ARRAY['Sports','Technology','Fashion','Beverage','Health'], '2B+ global viewers', ARRAY['Athlete partnerships','National pride campaigns','Sports equipment reviews','Fan content'], '6-12 months', ARRAY['All ages','Global audience','Sports fans'], 'Milan-Cortina, Italy', '["Global sports fans", "All ages", "National pride"]'::jsonb);

-- ============================================================
-- 5. SEED: MEGA EVENTS
-- ============================================================
INSERT INTO mega_events (event_name, name, dates, global_reach, format_details, planning_urgency, year, key_facts, tier, description, audience_demographics) VALUES
('FIFA World Cup 2026', 'FIFA World Cup 2026', 'Jun 11 – Jul 19, 2026', '5B+ cumulative TV viewers', 'First 48-team format, hosted across US, Mexico, Canada. 16 host cities, 104 matches over 39 days.', 'CRITICAL – Secure partnerships 12+ months ahead', 2026, ARRAY['Largest sporting event in history','$11B+ economic impact','48 teams, 16 cities across 3 countries','Est. 5M+ in-person attendees'], 'Tier 1', 'The biggest single sporting event in history, co-hosted by USA, Mexico, and Canada.', '["Global audience", "18-55", "Male skew", "Sports fans", "Hispanic/Latino", "Soccer culture"]'::jsonb),
('Summer Olympics 2028 (LA)', 'Summer Olympics 2028 (LA)', 'Jul 14 – Jul 30, 2028', '3.5B+ cumulative viewers', 'Los Angeles hosts for 3rd time. 35+ sports, 300+ events. Opening ceremony at SoFi Stadium.', 'Begin planning now for 2028 activations', 2028, ARRAY['First LA Olympics since 1984','35 sports, 300+ events','SoFi Stadium opening ceremony','$7B+ economic impact projected'], 'Tier 1', 'The 2028 Summer Olympics returns to Los Angeles.', '["Global audience", "All ages", "Athletes", "National pride"]'::jsonb),
('Super Bowl LX', 'Super Bowl LX', 'Feb 8, 2026', '115M+ US viewers', 'NFL Championship game. Halftime show, national ad showcase. The single most-watched US broadcast annually.', 'CRITICAL – Ad/partnership slots sell 12+ months out', 2026, ARRAY['Most-watched US TV event','$7M+ per 30-sec ad spot','550M+ social media impressions','$16B+ wagered'], 'Tier 1', 'The biggest annual sports event in the United States.', '["American sports fans", "18-55", "Mass market", "Male skew"]'::jsonb),
('Coachella 2026', 'Coachella 2026', 'Apr 10–12 & Apr 17–19, 2026', '250K+ attendees, 40M+ social views', 'Two weekends in Indio, CA. Music, art, fashion convergence. Major brand activation destination.', 'HIGH – Brand activations sell out 6+ months ahead', 2026, ARRAY['250,000+ attendees across 2 weekends','#1 music festival for brand activations','40M+ social media impressions','$700M+ economic impact'], 'Tier 1', 'The premier music and arts festival and brand activation event.', '["Gen Z", "Millennials", "18-35", "Fashion-forward", "Music lovers"]'::jsonb),
('SXSW 2026', 'SXSW 2026', 'Mar 7–15, 2026', '300K+ attendees', 'Music, film, and interactive festival in Austin, TX. Major tech and creator economy convergence point.', 'HIGH – Secure panels and activations 4-6 months ahead', 2026, ARRAY['300,000+ attendees','Covers music, film, tech, and interactive','Major tech product launch venue','$350M+ economic impact'], 'Tier 1', 'The ultimate convergence of music, film, tech, and culture in Austin, TX.', '["Tech professionals", "Creatives", "25-45", "Early adopters", "Music lovers"]'::jsonb),
('ComplexCon 2026', 'ComplexCon 2026', 'Nov 14–15, 2026', '60K+ attendees', 'Culture festival in Long Beach, CA. Streetwear, sneakers, music, food. Ultimate Gen Z brand activation.', 'MODERATE – Plan 3-4 months ahead', 2026, ARRAY['60,000+ attendees','#1 streetwear culture event','Celebrity panels and performances','Exclusive product drops'], 'Tier 2', 'The ultimate culture festival for streetwear, music, and pop culture.', '["Gen Z", "Streetwear culture", "18-30", "Sneakerheads", "Music fans"]'::jsonb),
('Met Gala 2026', 'Met Gala 2026', 'May 4, 2026', '500M+ social impressions', 'Fashion''s biggest night at the Metropolitan Museum of Art. Exclusive invite-only event with massive social reach.', 'HIGH – Celebrity partnerships must be secured months ahead', 2026, ARRAY['Most exclusive fashion event globally','500M+ social media impressions','Red carpet drives 24h+ trend cycles','Fashion-tech crossover growing'], 'Tier 1', 'The most exclusive and socially impactful fashion event in the world.', '["Fashion-forward", "Luxury consumers", "Celebrity followers", "Gen Z", "Millennials"]'::jsonb),
('Grammy Awards 2026', 'Grammy Awards 2026', 'Feb 1, 2026', '12M+ US viewers, 200M+ social', 'Music''s biggest night. Red carpet, performances, after-parties. Major moment for music brand partnerships.', 'MODERATE – Align with nominee campaigns 2-3 months ahead', 2026, ARRAY['12M+ US viewers','200M+ social media impressions','Red carpet fashion moment','Music partnership peak'], 'Tier 1', 'The premier music awards ceremony.', '["Music fans", "18-45", "All genders", "Pop culture enthusiasts"]'::jsonb),
('VidCon 2026', 'VidCon 2026', 'Jun 25–28, 2026', '55K+ attendees', 'The premier creator economy event. Three tracks: Community, Creator, Industry. Major brand-creator matchmaking.', 'HIGH – Creator partnerships should be secured 3+ months ahead', 2026, ARRAY['55,000+ attendees','#1 creator economy conference','Three tracks: Community, Creator, Industry','Major brand activation venue'], 'Tier 1', 'The largest event dedicated to online video creators and their fans.', '["Creators", "Gen Z", "13-30", "Digital natives", "Brand marketers"]'::jsonb),
('New York Fashion Week', 'New York Fashion Week', 'Sep 8–12, 2026', '100M+ social impressions', 'Bi-annual fashion showcase. Street style, runway shows, brand events. Sets trends for the season.', 'HIGH – Secure creator partnerships 2-3 months ahead', 2026, ARRAY['100M+ social impressions per season','Sets global fashion trends','Street style content explosion','Creator front-row presence growing'], 'Tier 1', 'One of the Big Four fashion weeks setting global trends.', '["Fashion industry", "Fashion-forward consumers", "18-45", "Female skew"]'::jsonb);

-- ============================================================
-- 6. SEED: CONFERENCES
-- ============================================================
INSERT INTO conferences (conference_name, name, industry_focus, typical_date, location, attendees, sponsorship_range, why_attend, key_audience, best_for_industries, description, expected_attendees, sponsorship_available, sponsorship_cost, date) VALUES
('VidSummit 2026', 'VidSummit 2026', 'Creator Economy', 'September', 'Dallas, TX', '3,000+', '$15K–$50K', 'Deep-dive creator strategies, networking with top YouTubers and brand partners', 'YouTubers, Brand marketers, MCNs', ARRAY['Technology','Entertainment','Education','Fashion'], 'Premier creator economy conference', 3000, true, 25000, '2026-09-20'),
('Social Media Marketing World', 'Social Media Marketing World', 'Marketing', 'March', 'San Diego, CA', '5,000+', '$20K–$75K', 'Latest social strategies, networking with top marketers, platform partnerships', 'Social media managers, CMOs, Brand strategists', ARRAY['All industries','Marketing','Technology'], 'Leading social media marketing conference', 5000, true, 35000, '2026-03-15'),
('Influencer Marketing Summit', 'Influencer Marketing Summit', 'Influencer Marketing', 'May', 'New York, NY', '1,500+', '$10K–$40K', 'Influencer partnership strategies, ROI measurement, platform updates', 'Brand partnership leads, Talent managers, Agencies', ARRAY['Beauty','Fashion','Food','Lifestyle'], 'Top influencer marketing event', 1500, true, 15000, '2026-05-10'),
('Brand Innovation Summit', 'Brand Innovation Summit', 'Brand Marketing', 'July', 'Chicago, IL', '2,000+', '$12K–$45K', 'Cutting-edge brand partnership models, innovation in creator marketing', 'CMOs, VP Marketing, Innovation leads', ARRAY['Technology','Automotive','Finance','Retail'], 'Brand partnership and innovation conference', 2000, true, 20000, '2026-07-22'),
('Creator Economy Expo', 'Creator Economy Expo', 'Creator Economy', 'August', 'Las Vegas, NV', '4,000+', '$20K–$60K', 'The business of being a creator, monetization strategies, brand partnerships', 'Full-time creators, Aspiring creators, Brand sponsors', ARRAY['All creator niches','Technology','Entertainment'], 'The business of being a creator', 4000, true, 30000, '2026-08-12'),
('Advertising Week', 'Advertising Week', 'Advertising', 'October', 'New York, NY', '10,000+', '$30K–$100K', 'Full spectrum of advertising and marketing innovation, including influencer track', 'CMOs, Agency leads, Brand marketers, Media buyers', ARRAY['All industries','Media','Entertainment'], 'Premier advertising industry event', 10000, true, 50000, '2026-10-14'),
('CES 2026', 'CES 2026', 'Technology', 'January', 'Las Vegas, NV', '100,000+', '$50K–$500K', 'Largest tech event globally, product launches, media coverage, creator press tours', 'Tech creators, Brand marketers, Product teams', ARRAY['Technology','Gaming','Automotive','Health'], 'The worlds largest consumer electronics show', 100000, true, 100000, '2026-01-06'),
('Cannes Lions', 'Cannes Lions', 'Advertising & Creativity', 'June', 'Cannes, France', '12,000+', '$50K–$250K', 'Global creative excellence, brand storytelling, influencer marketing awards track', 'Creative directors, CMOs, Agency leads', ARRAY['All industries','Entertainment','Luxury'], 'The global benchmark for creative excellence', 12000, true, 75000, '2026-06-15'),
('Podcast Movement 2026', 'Podcast Movement 2026', 'Audio/Podcasting', 'August', 'Washington, DC', '4,500+', '$15K–$50K', 'Podcasting strategies, audio creator partnerships, brand sponsorship deals', 'Podcasters, Audio creators, Brand sponsors', ARRAY['Entertainment','Education','News','Technology'], 'Largest podcast industry conference', 4500, true, 25000, '2026-08-19'),
('TwitchCon 2026', 'TwitchCon 2026', 'Gaming/Streaming', 'October', 'San Diego, CA', '35,000+', '$25K–$100K', 'Live streaming strategies, gaming creator partnerships, esports sponsorships', 'Streamers, Gaming creators, Esports orgs, Brand sponsors', ARRAY['Gaming','Technology','Entertainment','Food'], 'The premier live streaming and gaming community event', 35000, true, 50000, '2026-10-03');

-- ============================================================
-- 7. SEED: DEMOGRAPHIC SEGMENTS
-- ============================================================
INSERT INTO demographic_segments (name, description, age_range, gender, income_range, interests, platforms, size_estimate, population_size, buying_power, media_preferences, top_events, key_cultural_moments, brand_activation_tips, activation_tips, best_demographics) VALUES
('Gen Z Trendsetters', 'Fashion and culture-forward Gen Z consumers who drive viral trends', '18-26', 'all', '$25K-$50K', ARRAY['fashion','music','gaming','social justice','beauty'], ARRAY['tiktok','instagram','youtube'], 68000000, '68M (US)', '$360B annually', ARRAY['Short-form video','Memes & viral content','Podcasts','Live streams'], ARRAY['Pride Month','Coachella','ComplexCon','VidCon','Met Gala'], ARRAY['Social justice movements','Cancel culture awareness','Sustainable fashion','Body positivity','Mental health advocacy'], ARRAY['Authentic over polished — raw content wins','Use TikTok-first strategies','Partner with micro-creators for trust','Lead with values and social impact','Enable UGC and challenges'], ARRAY['Authentic over polished — raw content wins','Use TikTok-first strategies','Partner with micro-creators for trust'], ARRAY['Gen Z','18-26','Digital natives','Trend-forward']),
('Millennial Parents', 'Millennial parents balancing family, career, and personal wellness', '30-40', 'all', '$75K-$125K', ARRAY['parenting','home','health','finance','education'], ARRAY['instagram','facebook','youtube','pinterest'], 45000000, '45M (US)', '$2.5T annually', ARRAY['Long-form video','Product reviews','Parenting blogs','Social media groups'], ARRAY['Back to School','Mothers Day','Fathers Day','Thanksgiving','Holiday Season'], ARRAY['Work-from-home culture','Conscious parenting','Family wellness','Financial planning','Education technology'], ARRAY['Focus on relatable family content','Highlight convenience and value','Use Instagram and YouTube for discovery','Partner with parenting creators','Show real, imperfect family moments'], ARRAY['Focus on relatable family content','Highlight convenience and value','Use Instagram and YouTube for discovery'], ARRAY['Millennial Parents','30-40','Family-focused','Value-conscious']),
('Fitness Enthusiasts', 'Dedicated health and fitness consumers who prioritize wellness', '22-38', 'all', '$50K-$100K', ARRAY['fitness','nutrition','wellness','sports','outdoor'], ARRAY['instagram','tiktok','youtube'], 32000000, '32M (US)', '$100B fitness market', ARRAY['Workout videos','Challenge content','Nutrition guides','Before/after transformations'], ARRAY['New Year Season','Back to School','Olympics','World Cup','Super Bowl'], ARRAY['Home workout revolution','Functional fitness trend','Plant-based nutrition','Recovery & wellness tech','Outdoor adventure growth'], ARRAY['Support 30-day challenge formats','Provide affiliate codes for equipment','Focus on transformation narratives','Partner across multiple fitness niches','Enable creator workout programs'], ARRAY['Support 30-day challenge formats','Provide affiliate codes for equipment','Focus on transformation narratives'], ARRAY['Fitness Enthusiasts','22-38','Health-conscious','Active lifestyle']),
('Tech Early Adopters', 'Technology enthusiasts who adopt new products early and influence others', '25-45', 'male_skew', '$80K-$150K', ARRAY['technology','gaming','productivity','AI','crypto'], ARRAY['youtube','twitter','linkedin','reddit'], 18000000, '18M (US)', '$450B+ tech consumer market', ARRAY['In-depth reviews','Unboxing videos','Tech podcasts','Twitter/X threads'], ARRAY['CES','SXSW','Apple events','Black Friday','Amazon Prime Day'], ARRAY['AI revolution','Remote work tools','Smart home adoption','Gaming hardware cycles','Crypto/Web3 evolution'], ARRAY['Provide early access to products','Invest in long-form YouTube content','Technical depth matters — dont oversimplify','Partner with creators who genuinely use products','Support honest, unbiased reviews'], ARRAY['Provide early access to products','Invest in long-form YouTube content','Technical depth matters'], ARRAY['Tech Early Adopters','25-45','Male skew','Innovation-driven']),
('Beauty Conscious', 'Beauty and personal care focused consumers seeking authenticity', '16-35', 'female_skew', '$30K-$75K', ARRAY['beauty','skincare','fashion','wellness','self-care'], ARRAY['instagram','tiktok','youtube','pinterest'], 55000000, '55M (US)', '$580B global beauty market', ARRAY['Tutorial videos','GRWM content','Product reviews','Skincare routines'], ARRAY['Pride Month','Valentines Day','Met Gala','NYFW','Mothers Day'], ARRAY['Clean beauty movement','Inclusivity in beauty','Skinimalism trend','Beauty tech (AR try-ons)','Wellness-beauty convergence'], ARRAY['Send products early for genuine first impressions','Prioritize video content (Reels, TikTok, YouTube)','Include diverse creators across skin types','Support tutorial and routine content','Enable authentic before/after stories'], ARRAY['Send products early for genuine first impressions','Prioritize video content','Include diverse creators across skin types'], ARRAY['Beauty Conscious','16-35','Female skew','Authenticity-driven']),
('Gaming & Esports Audience', 'Hardcore and casual gamers across mobile, PC, and console', '16-35', 'male_skew', '$35K-$85K', ARRAY['gaming','esports','technology','streaming','pop culture'], ARRAY['youtube','twitch','tiktok','discord','twitter'], 42000000, '42M (US)', '$200B global gaming market', ARRAY['Live streams','Gameplay videos','Reviews','Esports tournaments'], ARRAY['TwitchCon','ComplexCon','CES','Game awards','E3/Summer Game Fest'], ARRAY['Mobile gaming explosion','Esports mainstream acceptance','Gaming creator economy growth','Cloud gaming adoption','In-game brand integrations'], ARRAY['Sponsor authentic gameplay streams','Provide early access to games','Support tournament/esports partnerships','Focus on creators who match your game genre','Enable in-game product integrations'], ARRAY['Sponsor authentic gameplay streams','Provide early access to games','Support tournament/esports'], ARRAY['Gamers','16-35','Male skew','Digital entertainment']),
('BIPOC Consumers', 'Black, Indigenous, and People of Color driving culture and trends', '18-45', 'all', '$40K-$80K', ARRAY['fashion','music','food','beauty','culture','social justice'], ARRAY['instagram','tiktok','youtube','twitter'], 130000000, '130M+ (US)', '$4.7T combined buying power', ARRAY['Short-form video','Music content','Cultural storytelling','Community platforms'], ARRAY['Black History Month','Hispanic Heritage Month','AAPI Heritage Month','Juneteenth','Diwali'], ARRAY['Cultural representation in media','Black excellence movement','Latino economic power','AAPI visibility','Indigenous rights awareness'], ARRAY['Invest in year-round representation, not just heritage months','Partner with BIPOC-owned agencies','Center authentic cultural storytelling','Support BIPOC creator businesses','Ensure diverse creative teams'], ARRAY['Invest in year-round representation','Partner with BIPOC-owned agencies','Center authentic cultural storytelling'], ARRAY['BIPOC','18-45','Culturally engaged','Trend-drivers']),
('Luxury & Affluent', 'High-income consumers seeking premium experiences and products', '30-55', 'all', '$150K+', ARRAY['luxury','travel','fashion','fine dining','art','wellness'], ARRAY['instagram','youtube','linkedin','pinterest'], 20000000, '20M (US)', '$1.5T global luxury market', ARRAY['Aspirational lifestyle content','Expert reviews','Experience-driven stories','LinkedIn thought leadership'], ARRAY['Met Gala','Cannes Lions','NYFW','Art Basel','Grand Prix'], ARRAY['Quiet luxury trend','Experience over possessions','Sustainability in luxury','Digital-first luxury retail','Personalization expectations'], ARRAY['Focus on exclusivity and craftsmanship','Partner with aspirational lifestyle creators','Quality over quantity in content','Support experience-driven storytelling','Use Instagram and YouTube for visual luxury'], ARRAY['Focus on exclusivity and craftsmanship','Partner with aspirational lifestyle creators','Quality over quantity in content'], ARRAY['Affluent','30-55','Luxury consumers','Experience-driven']);

-- ============================================================
-- 8. SEED: RATE BENCHMARKS (with UI-expected fields)
-- ============================================================
INSERT INTO rate_benchmarks (tier, platform, niche, content_type, followers_min, followers_max, rate_min, rate_max, rate_median, sponsored_post_min, sponsored_post_max, brand_deal_min, brand_deal_max, ambassador_annual_min, ambassador_annual_max, source) VALUES
('nano', 'all', 'all', 'all', 1000, 9999, 50, 500, 200, 50, 500, 200, 2000, 1000, 6000, 'PartnerIQ 2026 Benchmark'),
('micro', 'all', 'all', 'all', 10000, 99999, 500, 5000, 2000, 500, 5000, 2000, 15000, 6000, 36000, 'PartnerIQ 2026 Benchmark'),
('mid', 'all', 'all', 'all', 100000, 499999, 5000, 20000, 10000, 5000, 20000, 15000, 75000, 36000, 120000, 'PartnerIQ 2026 Benchmark'),
('macro', 'all', 'all', 'all', 500000, 999999, 10000, 50000, 25000, 10000, 50000, 50000, 250000, 120000, 500000, 'PartnerIQ 2026 Benchmark'),
('mega', 'all', 'all', 'all', 1000000, 4999999, 25000, 150000, 75000, 25000, 150000, 100000, 750000, 300000, 1500000, 'PartnerIQ 2026 Benchmark'),
('celebrity', 'all', 'all', 'all', 5000000, NULL, 100000, 1000000, 350000, 100000, 1000000, 500000, 5000000, 1000000, 10000000, 'PartnerIQ 2026 Benchmark'),
-- Platform-specific benchmarks
('micro', 'instagram', 'lifestyle', 'post', 10000, 99999, 500, 3000, 1500, 500, 3000, 2000, 12000, 6000, 30000, 'PartnerIQ 2026 Report'),
('mid', 'instagram', 'beauty', 'post', 100000, 499999, 3000, 10000, 6000, 3000, 10000, 8000, 40000, 30000, 100000, 'PartnerIQ 2026 Report'),
('macro', 'tiktok', 'fitness', 'video', 500000, 999999, 8000, 30000, 18000, 8000, 30000, 25000, 100000, 80000, 300000, 'PartnerIQ 2026 Report'),
('mid', 'youtube', 'tech', 'integration', 100000, 499999, 5000, 15000, 8000, 5000, 15000, 10000, 50000, 40000, 150000, 'PartnerIQ 2026 Report'),
('macro', 'youtube', 'gaming', 'integration', 500000, 999999, 10000, 40000, 20000, 10000, 40000, 30000, 150000, 100000, 400000, 'PartnerIQ 2026 Report');

-- ============================================================
-- 9. SEED: PLATFORM MULTIPLIERS (with UI-expected fields)
-- ============================================================
INSERT INTO platform_multipliers (platform, base_multiplier, engagement_weight, reach_weight, base_cpm_min, base_cpm_max, rate_multiplier, engagement_benchmark_min, engagement_benchmark_max, notes) VALUES
('instagram', 1.0, 0.6, 0.4, 5.0, 15.0, 1.0, 2.0, 6.0, 'Baseline platform. Strong for lifestyle, beauty, fashion, food. Best for visual storytelling.'),
('tiktok', 1.15, 0.75, 0.25, 3.0, 10.0, 1.15, 4.0, 12.0, 'Highest organic reach potential. Viral content can 10x impressions. Best for Gen Z campaigns.'),
('youtube', 1.3, 0.4, 0.6, 12.0, 30.0, 1.35, 3.0, 8.0, 'Highest CPM. Long-form premium content. Best for tech, education, detailed reviews.'),
('twitter', 0.7, 0.5, 0.5, 2.0, 8.0, 0.65, 1.0, 4.0, 'Real-time conversation platform. Good for tech, news, culture commentary.'),
('linkedin', 1.2, 0.6, 0.4, 15.0, 40.0, 1.4, 2.0, 5.0, 'B2B premium. Highest value per impression for professional audiences.'),
('twitch', 1.1, 0.8, 0.2, 4.0, 12.0, 1.1, 5.0, 15.0, 'Live streaming platform. Highest engagement rates. Best for gaming, esports, music.'),
('pinterest', 0.8, 0.3, 0.7, 3.0, 10.0, 0.85, 1.0, 3.0, 'High purchase intent platform. Best for home, fashion, food, DIY content.'),
('snapchat', 0.75, 0.6, 0.4, 3.0, 8.0, 0.8, 3.0, 8.0, 'Young audience platform. Best for AR experiences and ephemeral campaigns.');

-- ============================================================
-- 10. SEED: CATEGORY PREMIUMS (with UI-expected fields)
-- ============================================================
INSERT INTO category_premiums (category, premium_percent, demand_level, premium_multiplier, rationale, notes) VALUES
('technology', 20, 'high', 1.20, 'Strong brand demand in tech. High-value products justify premium creator rates. Tech creators have influential audiences.', 'Tech brands actively compete for authentic creator partnerships'),
('beauty', 15, 'high', 1.15, 'Beauty brands invest heavily in creator content. Tutorial and review content drives direct sales. High ROI category.', 'Beauty remains top category for influencer marketing ROI'),
('fitness', 18, 'very_high', 1.18, 'Peak demand post-2020 health wave. Transformation content performs exceptionally. Strong affiliate potential.', 'Fitness creators command premium due to engagement and conversion'),
('gaming', 12, 'high', 1.12, 'Growing segment with strong brand interest. Esports sponsorships growing rapidly. Long engagement sessions.', 'Gaming offers longest average content engagement'),
('food', 10, 'medium', 1.10, 'Steady demand for food content. Recipe integration is highly shareable. Strong for CPG and restaurant brands.', 'Most shared content category across platforms'),
('lifestyle', 8, 'medium', 1.08, 'Broad category, flexible content. Appeals to wide range of brands. Moderate premium due to supply.', 'Broad category with diverse brand opportunities'),
('travel', 5, 'medium', 1.05, 'Recovering post-pandemic. Aspirational content with strong visual appeal. Seasonal demand fluctuations.', 'Seasonal demand with peaks around holidays'),
('finance', 25, 'high', 1.25, 'Regulated space requiring expertise. Creator trust is paramount. High customer lifetime value for brands.', 'Highest premium due to regulatory complexity and audience value'),
('education', 15, 'high', 1.15, 'EdTech brands pay premium for authentic educational content. Rising demand for learning creators.', 'EdTech investment driving creator demand'),
('fashion', 14, 'high', 1.14, 'Seasonal demand cycles. Strong visual platform performance. Haul and try-on content drives sales.', 'Seasonal peaks around fashion weeks and holidays'),
('sports', 16, 'high', 1.16, 'Major event cycles drive demand. Athlete partnerships command premium. Sports betting brands are new entrants.', 'Event-driven demand with Olympic and World Cup cycles'),
('entertainment', 12, 'medium', 1.12, 'Movie/TV releases create partnership windows. Premiere events drive creator activations.', 'Project-based demand around release cycles');

-- ============================================================
-- 11. SEED: ROI BENCHMARKS (with UI-expected fields)
-- ============================================================
INSERT INTO roi_benchmarks (deal_type, industry, channel, median_roi, top_quartile_roi, bottom_quartile_roi, avg_roi, measurement_period, time_to_roi_days, sample_size) VALUES
('sponsored_post', 'All', 'instagram', 4.2, 8.5, 1.8, 4.87, '30 days post-campaign', 30, 2500),
('brand_ambassador', 'All', 'multi-platform', 6.8, 14.2, 2.5, 7.83, '90 days post-start', 90, 1200),
('product_gifting', 'Beauty', 'instagram', 11.5, 22.0, 3.5, 12.33, '60 days post-ship', 60, 800),
('affiliate_partnership', 'All', 'multi-platform', 7.2, 15.8, 2.8, 8.60, 'Ongoing monthly', 30, 3500),
('event_sponsorship', 'All', 'live', 3.5, 7.2, 1.2, 3.97, '30 days post-event', 30, 600),
('content_series', 'Technology', 'youtube', 5.8, 12.4, 2.2, 6.80, '90 days post-series', 90, 450),
('takeover_campaign', 'Fashion', 'tiktok', 8.9, 18.5, 3.1, 10.17, '14 days post-campaign', 14, 350),
('long_term_partnership', 'All', 'multi-platform', 9.5, 20.0, 3.8, 11.10, '6 months', 180, 900),
('UGC_campaign', 'All', 'tiktok', 6.2, 13.8, 2.0, 7.33, '30 days post-launch', 30, 1500),
('influencer_whitelisting', 'All', 'instagram', 5.5, 11.0, 2.5, 6.33, '30 days post-campaign', 30, 700);

-- ============================================================
-- 12. SEED: INDUSTRY GUIDES (with UI-expected fields)
-- ============================================================
INSERT INTO industry_guides (title, industry, sector, summary, content, best_practices, best_demographics, published) VALUES
('Technology & SaaS Partnership Guide', 'Technology', 'SaaS', 'How tech brands maximize ROI through creator partnerships', 'Technology brands see 3.2x higher engagement when partnering with authentic tech creators. Key strategies include product integration videos, early access programs, and educational content series. The tech vertical commands a 20% premium due to high product value and influential audiences.', ARRAY['Partner with creators who genuinely use your products','Focus on educational content over promotional','Leverage long-form YouTube for complex products','Track attribution through custom links and codes','Invest in unboxing and first-impression content'], ARRAY['Tech Early Adopters','Gen Z Trendsetters','Gaming & Esports Audience'], true),
('Beauty & Personal Care Playbook', 'Beauty', 'Personal Care', 'Creator partnership strategies for beauty brands', 'Beauty remains one of the top categories for influencer marketing with an average ROI of 5.2x. Tutorial content, GRWM videos, and authentic reviews drive the highest conversion rates. The beauty category commands a 15% premium with strong competition for top creators.', ARRAY['Send products early for genuine first impressions','Prioritize video content (Reels, TikTok, YouTube)','Include before/after results when applicable','Partner with diverse creators across skin types','Support tutorial and routine content formats'], ARRAY['Beauty Conscious','Gen Z Trendsetters','Millennial Parents'], true),
('Fitness & Wellness Brand Guide', 'Fitness', 'Health & Wellness', 'Building authentic fitness creator partnerships', 'Fitness creators generate the highest engagement rates across platforms, averaging 8.1% on TikTok. Challenge-based content and transformation stories drive virality. The fitness vertical commands an 18% premium driven by strong post-2020 demand.', ARRAY['Support 30-day challenge formats','Provide affiliate codes for equipment','Focus on before/after transformation narratives','Partner across multiple fitness niches','Enable creator workout programs'], ARRAY['Fitness Enthusiasts','Gen Z Trendsetters','Millennial Parents'], true),
('Food & Beverage Partnership Strategies', 'Food & Beverage', 'CPG', 'How F&B brands win with creator content', 'Food content is the most shared category on social media. Recipe integration, taste tests, and meal prep content create the strongest brand affinity. F&B partnerships work across all platforms with 10% category premium.', ARRAY['Ship products for authentic recipe creation','Enable creative freedom in recipe development','Support both quick TikTok and long-form YouTube','Partner with creators across dietary preferences','Leverage seasonal food moments (Thanksgiving, BBQ season)'], ARRAY['Millennial Parents','Gen Z Trendsetters','Fitness Enthusiasts'], true),
('Fashion & Apparel Creator Guide', 'Fashion', 'Apparel & Accessories', 'Maximizing fashion brand visibility through creators', 'Fashion partnerships thrive on aesthetic alignment and authentic styling. Haul videos, OOTD content, and seasonal lookbooks consistently outperform traditional advertising. Fashion commands a 14% premium with seasonal demand peaks.', ARRAY['Allow creators to style products their own way','Support try-on and haul content formats','Time campaigns with seasonal collections','Include size-inclusive creators','Leverage fashion week and award season moments'], ARRAY['Gen Z Trendsetters','Beauty Conscious','Luxury & Affluent'], true),
('Gaming & Entertainment Partnerships', 'Gaming', 'Entertainment', 'Engaging gaming audiences through creator sponsorships', 'Gaming creators offer unparalleled reach and engagement, particularly on YouTube and Twitch. Live streaming integrations, gameplay reviews, and esports partnerships deliver strong ROI with 12% category premium.', ARRAY['Sponsor gameplay streams for authentic exposure','Provide early access to games and hardware','Support tournament and esports partnerships','Focus on creators who match your game genre','Enable in-game product integrations'], ARRAY['Gaming & Esports Audience','Gen Z Trendsetters','Tech Early Adopters'], true),
('Finance & Fintech Creator Marketing', 'Finance', 'Fintech', 'Building trust-based financial creator partnerships', 'Financial services partnerships require high trust and regulatory compliance. Finance commands the highest category premium (25%) due to audience value and regulatory complexity. Educational content performs best.', ARRAY['Ensure all content meets regulatory requirements','Partner with credentialed financial creators','Focus on educational over promotional content','Use long-form formats for complex topics','Build long-term ambassador relationships'], ARRAY['Tech Early Adopters','Millennial Parents','Luxury & Affluent'], true),
('Sports & Athletic Brand Guide', 'Sports', 'Athletic', 'Leveraging sports creators and athlete partnerships', 'Sports partnerships are driven by major event cycles (Olympics, World Cup, Super Bowl). Athlete creators command premium rates but deliver exceptional engagement. 16% category premium with event-driven demand spikes.', ARRAY['Align campaigns with major sporting events','Support athlete training and lifestyle content','Enable fan engagement and challenge formats','Partner with both pro athletes and fitness creators','Leverage sports betting content carefully'], ARRAY['Fitness Enthusiasts','Gaming & Esports Audience','Gen Z Trendsetters'], true);

-- ============================================================
-- 13. SEED: VIEWERSHIP TIERS (expanded)
-- ============================================================
INSERT INTO viewership_tiers (name, platform, min_followers, max_followers, avg_engagement_rate, typical_rate_min, typical_rate_max, description) VALUES
('Nano', 'instagram', 1000, 9999, 8.5, 50, 500, '1K-10K followers, hyper-engaged niche communities'),
('Micro', 'instagram', 10000, 99999, 6.2, 500, 3000, '10K-100K followers, strong community trust'),
('Mid', 'instagram', 100000, 499999, 4.1, 3000, 10000, '100K-500K, established creators with diverse reach'),
('Macro', 'instagram', 500000, 999999, 3.2, 10000, 30000, '500K-1M, wide reach with brand credibility'),
('Mega', 'instagram', 1000000, 4999999, 2.8, 30000, 100000, '1M-5M, celebrity-adjacent mass reach'),
('Celebrity', 'instagram', 5000000, NULL, 1.9, 100000, 500000, '5M+, mass market cultural influence'),
('Nano', 'tiktok', 1000, 9999, 12.0, 100, 800, '1K-10K on TikTok, viral potential'),
('Micro', 'tiktok', 10000, 99999, 9.5, 800, 4000, '10K-100K TikTok creators'),
('Mid', 'tiktok', 100000, 499999, 7.2, 4000, 15000, '100K-500K TikTok reach'),
('Macro', 'tiktok', 500000, 999999, 5.8, 15000, 40000, '500K-1M TikTok influence'),
('Mega', 'tiktok', 1000000, 4999999, 4.5, 40000, 120000, '1M-5M TikTok mass reach'),
('Nano', 'youtube', 1000, 9999, 6.0, 200, 1000, '1K-10K YouTube subscribers'),
('Micro', 'youtube', 10000, 99999, 5.2, 1000, 5000, '10K-100K YouTube creators'),
('Mid', 'youtube', 100000, 499999, 4.0, 5000, 20000, '100K-500K YouTube established'),
('Macro', 'youtube', 500000, 999999, 3.5, 15000, 50000, '500K-1M YouTube premium reach'),
('Mega', 'youtube', 1000000, 4999999, 3.0, 40000, 150000, '1M-5M YouTube mass audience'),
('Nano', 'twitch', 100, 999, 15.0, 50, 300, '100-1K Twitch followers'),
('Micro', 'twitch', 1000, 9999, 12.0, 300, 2000, '1K-10K Twitch community'),
('Mid', 'twitch', 10000, 49999, 8.0, 2000, 8000, '10K-50K Twitch creators'),
('Macro', 'twitch', 50000, 499999, 5.0, 5000, 25000, '50K-500K Twitch streamers');

-- ============================================================
-- DONE!
-- ============================================================
SELECT 'Schema fixes, RLS policies, and seed data applied successfully!' AS result;
