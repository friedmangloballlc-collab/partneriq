-- PartnerIQ Seed Data
-- All column names match 001_create_tables.sql + 003_add_frontend_columns.sql
-- Run 003 migration BEFORE this seed

-- ============================================================
-- BRANDS (5 rows)
-- ============================================================
insert into brands (id, name, industry, domain, description, location, annual_budget, contact_email) values
  ('b1000000-0000-0000-0000-000000000001', 'NovaTech', 'Technology', 'novatech.example.com', 'Leading edge consumer tech brand', 'San Francisco, CA', 250000, 'alex@novatech.example.com'),
  ('b1000000-0000-0000-0000-000000000002', 'FreshBite Foods', 'Food & Beverage', 'freshbite.example.com', 'Organic meal prep and delivery', 'Austin, TX', 80000, 'jordan@freshbite.example.com'),
  ('b1000000-0000-0000-0000-000000000003', 'StyleForward', 'Fashion & Apparel', 'styleforward.example.com', 'Contemporary streetwear and athleisure', 'New York, NY', 150000, 'morgan@styleforward.example.com'),
  ('b1000000-0000-0000-0000-000000000004', 'GlowSkin', 'Beauty & Personal Care', 'glowskin.example.com', 'Clean beauty and skincare', 'Los Angeles, CA', 60000, 'taylor@glowskin.example.com'),
  ('b1000000-0000-0000-0000-000000000005', 'PeakFit', 'Sports & Fitness', 'peakfit.example.com', 'Performance fitness equipment and apparel', 'Denver, CO', 120000, 'casey@peakfit.example.com')
on conflict (id) do nothing;

-- ============================================================
-- TALENTS (8 rows)
-- ============================================================
insert into talents (id, name, email, primary_platform, niche, tier, location, bio, total_followers, engagement_rate, brand_safety_score, discovery_alpha_score, trajectory, avg_views, rate_per_post) values
  ('01000000-0000-0000-0000-000000000001', 'Mia Chen', 'mia@creator.example.com', 'instagram', 'lifestyle', 'macro', 'Los Angeles, CA', 'Lifestyle creator sharing authentic daily content', 850000, 4.2, 92, 87, 'rising', 120000, 8500),
  ('01000000-0000-0000-0000-000000000002', 'Jake Torres', 'jake@creator.example.com', 'youtube', 'tech', 'mid', 'Seattle, WA', 'Tech reviewer and early adopter', 420000, 6.8, 96, 91, 'rising', 85000, 5000),
  ('01000000-0000-0000-0000-000000000003', 'Aisha Patel', 'aisha@creator.example.com', 'tiktok', 'fitness', 'macro', 'Chicago, IL', 'Certified personal trainer and motivational creator', 1200000, 8.1, 98, 94, 'rising', 350000, 12000),
  ('01000000-0000-0000-0000-000000000004', 'Sam Rivers', 'sam@creator.example.com', 'instagram', 'beauty', 'mid', 'Miami, FL', 'Beauty educator and product reviewer', 380000, 5.6, 95, 82, 'stable', 65000, 4000),
  ('01000000-0000-0000-0000-000000000005', 'Leo Martinez', 'leo@creator.example.com', 'youtube', 'gaming', 'macro', 'Austin, TX', 'Gaming content creator and streamer', 920000, 7.2, 88, 85, 'rising', 280000, 9000),
  ('01000000-0000-0000-0000-000000000006', 'Priya Sharma', 'priya@creator.example.com', 'instagram', 'food', 'micro', 'Portland, OR', 'Food blogger and recipe developer', 95000, 9.4, 99, 88, 'rising', 18000, 1500),
  ('01000000-0000-0000-0000-000000000007', 'Ryan Walsh', 'ryan@creator.example.com', 'tiktok', 'education', 'mid', 'Boston, MA', 'EdTech creator making learning fun', 310000, 11.2, 97, 93, 'rising', 95000, 3500),
  ('01000000-0000-0000-0000-000000000008', 'Zoe Campbell', 'zoe@creator.example.com', 'instagram', 'travel', 'micro', 'Nashville, TN', 'Travel photographer and adventure seeker', 78000, 7.8, 94, 79, 'stable', 12000, 1200)
on conflict (id) do nothing;

-- ============================================================
-- PARTNERSHIPS (8 rows)
-- ============================================================
insert into partnerships (id, title, brand_id, talent_id, brand_name, talent_name, status, deal_value, match_score, priority, assigned_to, notes) values
  ('c1000000-0000-0000-0000-000000000001', 'NovaTech x Mia Chen – Lifestyle Tech Series', 'b1000000-0000-0000-0000-000000000001', '01000000-0000-0000-0000-000000000001', 'NovaTech', 'Mia Chen', 'active', 45000, 92, 'high', 'sales@partneriq.example.com', '6-part sponsored series launching Q2'),
  ('c1000000-0000-0000-0000-000000000002', 'FreshBite x Aisha Patel – Nutrition Campaign', 'b1000000-0000-0000-0000-000000000002', '01000000-0000-0000-0000-000000000003', 'FreshBite Foods', 'Aisha Patel', 'contracted', 38000, 95, 'high', 'sales@partneriq.example.com', 'Meal plan content integration'),
  ('c1000000-0000-0000-0000-000000000003', 'StyleForward x Mia Chen – Fall Collection Drop', 'b1000000-0000-0000-0000-000000000003', '01000000-0000-0000-0000-000000000001', 'StyleForward', 'Mia Chen', 'negotiating', 28000, 88, 'medium', NULL, 'Negotiations ongoing on usage rights'),
  ('c1000000-0000-0000-0000-000000000004', 'GlowSkin x Sam Rivers – Skincare Routine', 'b1000000-0000-0000-0000-000000000004', '01000000-0000-0000-0000-000000000004', 'GlowSkin', 'Sam Rivers', 'outreach_sent', 18000, 84, 'medium', NULL, 'First outreach sent, awaiting reply'),
  ('c1000000-0000-0000-0000-000000000005', 'PeakFit x Jake Torres – Tech & Fitness Crossover', 'b1000000-0000-0000-0000-000000000005', '01000000-0000-0000-0000-000000000002', 'PeakFit', 'Jake Torres', 'researching', 22000, 79, 'medium', NULL, 'Reviewing tech fitness content fit'),
  ('c1000000-0000-0000-0000-000000000006', 'NovaTech x Leo Martinez – Gaming Peripherals', 'b1000000-0000-0000-0000-000000000001', '01000000-0000-0000-0000-000000000005', 'NovaTech', 'Leo Martinez', 'discovered', 55000, 91, 'high', NULL, 'High priority gaming segment opportunity'),
  ('c1000000-0000-0000-0000-000000000007', 'FreshBite x Priya Sharma – Recipe Collaboration', 'b1000000-0000-0000-0000-000000000002', '01000000-0000-0000-0000-000000000006', 'FreshBite Foods', 'Priya Sharma', 'responded', 12000, 96, 'high', NULL, 'Creator very enthusiastic, hot lead'),
  ('c1000000-0000-0000-0000-000000000008', 'StyleForward x Zoe Campbell – Travel Fashion', 'b1000000-0000-0000-0000-000000000003', '01000000-0000-0000-0000-000000000008', 'StyleForward', 'Zoe Campbell', 'outreach_pending', 9500, 77, 'low', NULL, 'Draft outreach ready')
on conflict (id) do nothing;

-- ============================================================
-- MARKETPLACE OPPORTUNITIES (5 rows)
-- ============================================================
insert into marketplace_opportunities (id, title, brand_name, brand_id, description, status, contract_type, budget_min, budget_max, required_niches, required_platforms, target_audience_size_min, deliverables, timeline_end) values
  ('d1000000-0000-0000-0000-000000000001', 'Tech Product Launch – Q2 2026', 'NovaTech', 'b1000000-0000-0000-0000-000000000001', 'Looking for tech-savvy creators to launch our new smart home device line', 'published', 'sponsored_post', 5000, 15000, '["tech","lifestyle"]', '["youtube","instagram"]', 100000, '["2 YouTube videos","4 Instagram posts","8 Stories"]', '2026-05-31'),
  ('d1000000-0000-0000-0000-000000000002', 'Healthy Eating Month Campaign', 'FreshBite Foods', 'b1000000-0000-0000-0000-000000000002', 'Partner with us to promote clean, nutritious eating habits', 'published', 'ambassador', 2000, 8000, '["fitness","food","lifestyle"]', '["instagram","tiktok"]', 50000, '["8 TikTok videos","12 Instagram posts"]', '2026-04-30'),
  ('d1000000-0000-0000-0000-000000000003', 'Summer Streetwear Collection', 'StyleForward', 'b1000000-0000-0000-0000-000000000003', 'Feature our new summer collection in your content', 'published', 'gifting_plus_fee', 1500, 6000, '["fashion","lifestyle"]', '["instagram","tiktok"]', 30000, '["6 Instagram posts","10 Stories","3 Reels"]', '2026-06-15'),
  ('d1000000-0000-0000-0000-000000000004', 'Clean Beauty Skincare Routine Series', 'GlowSkin', 'b1000000-0000-0000-0000-000000000004', 'Show your audience your skincare routine with our products', 'published', 'sponsored_post', 3000, 10000, '["beauty","wellness","lifestyle"]', '["instagram","youtube"]', 75000, '["3 YouTube videos","6 Instagram posts"]', '2026-05-01'),
  ('d1000000-0000-0000-0000-000000000005', 'Fitness Challenge Series', 'PeakFit', 'b1000000-0000-0000-0000-000000000005', '30-day fitness challenge featuring our equipment', 'published', 'ambassador', 4000, 12000, '["fitness","sports","health"]', '["instagram","tiktok","youtube"]', 80000, '["30-day daily Stories","4 long-form videos"]', '2026-07-01')
on conflict (id) do nothing;

-- ============================================================
-- OPPORTUNITY APPLICATIONS (5 rows)
-- ============================================================
insert into opportunity_applications (id, opportunity_id, talent_email, talent_name, status, message) values
  ('a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'aisha@creator.example.com', 'Aisha Patel', 'accepted', 'I am deeply passionate about nutrition and your products align perfectly with my content pillars.'),
  ('a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'mia@creator.example.com', 'Mia Chen', 'reviewing', 'Fashion and lifestyle are at the core of my content. My audience would love your summer collection!'),
  ('a1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000004', 'sam@creator.example.com', 'Sam Rivers', 'pending', 'Clean beauty is my specialty and I would love to feature GlowSkin in my next skincare series.'),
  ('a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'priya@creator.example.com', 'Priya Sharma', 'pending', 'As a food creator focused on healthy eating, FreshBite is a natural fit for my audience.'),
  ('a1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'aisha@creator.example.com', 'Aisha Patel', 'reviewing', 'Fitness challenges are my specialty. My community has completed 12 challenges with me already.')
on conflict (id) do nothing;

-- ============================================================
-- OUTREACH SEQUENCES (3 rows)
-- ============================================================
insert into outreach_sequences (id, name, description, status, partnership_id, target_name, target_email, steps) values
  ('e1000000-0000-0000-0000-000000000001', 'Tech Creator Cold Outreach', 'Multi-step sequence for approaching tech creators', 'active', 'c1000000-0000-0000-0000-000000000001', 'Mia Chen', 'mia@creator.example.com', '[{"step":1,"type":"email","subject":"Partnership opportunity with NovaTech","status":"sent"},{"step":2,"type":"follow_up","subject":"Following up on NovaTech collab","status":"sent"}]'),
  ('e1000000-0000-0000-0000-000000000002', 'Fitness Brand Partnership Intro', 'Introduction sequence for fitness brand partnerships', 'active', 'c1000000-0000-0000-0000-000000000002', 'Aisha Patel', 'aisha@creator.example.com', '[{"step":1,"type":"email","subject":"FreshBite x Aisha – lets talk nutrition content","status":"sent"}]'),
  ('e1000000-0000-0000-0000-000000000003', 'Beauty Creator Campaign', 'Outreach for beauty campaign recruitment', 'draft', 'c1000000-0000-0000-0000-000000000004', 'Sam Rivers', 'sam@creator.example.com', '[{"step":1,"type":"email","subject":"GlowSkin partnership opportunity","status":"draft"}]')
on conflict (id) do nothing;

-- ============================================================
-- APPROVAL ITEMS (4 rows)
-- ============================================================
insert into approval_items (id, title, description, item_type, status, reference_id, brand_name, talent_name, deal_value) values
  ('af000000-0000-0000-0000-000000000001', 'Contract Review – NovaTech x Mia Chen', 'Please review and approve the partnership contract', 'contract', 'approved', 'c1000000-0000-0000-0000-000000000001', 'NovaTech', 'Mia Chen', 45000),
  ('af000000-0000-0000-0000-000000000002', 'Content Brief – FreshBite x Aisha Patel', 'Review content brief before sending to creator', 'content_brief', 'pending', 'c1000000-0000-0000-0000-000000000002', 'FreshBite Foods', 'Aisha Patel', 38000),
  ('af000000-0000-0000-0000-000000000003', 'Payment Approval – $38,000', 'Approve payment release for contracted deal', 'payment', 'pending', 'c1000000-0000-0000-0000-000000000002', 'FreshBite Foods', 'Aisha Patel', 38000),
  ('af000000-0000-0000-0000-000000000004', 'Creative Assets Review – StyleForward', 'Review submitted brand assets for usage rights', 'creative', 'revision_requested', 'c1000000-0000-0000-0000-000000000003', 'StyleForward', 'Mia Chen', 28000)
on conflict (id) do nothing;

-- ============================================================
-- DEAL NOTES (4 rows)
-- ============================================================
insert into deal_notes (id, partnership_id, content, note_type, author_name) values
  ('de000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Had a great kickoff call with Mia. She is very enthusiastic about the tech angle. Content calendar locked in.', 'call', 'Alex Rivera'),
  ('de000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Contract signed. Shooting starts next week. Deliverables agreed: 8 TikToks + 6 IG posts.', 'note', 'Jordan Lee'),
  ('de000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'StyleForward requested exclusivity clause. Need legal review before we can proceed.', 'note', 'Morgan Chen'),
  ('de000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000007', 'Priya responded within 2 hours! Very interested. Scheduling discovery call for Monday.', 'email', 'Jordan Lee')
on conflict (id) do nothing;

-- ============================================================
-- TASKS (4 rows)
-- ============================================================
insert into tasks (id, title, status, priority, partnership_id, assigned_to_email, due_date) values
  ('f0000000-0000-0000-0000-000000000001', 'Send content brief to Mia Chen', 'done', 'high', 'c1000000-0000-0000-0000-000000000001', 'alex@partneriq.example.com', '2026-03-15'),
  ('f0000000-0000-0000-0000-000000000002', 'Review contract for FreshBite deal', 'in_progress', 'urgent', 'c1000000-0000-0000-0000-000000000002', 'legal@partneriq.example.com', '2026-03-10'),
  ('f0000000-0000-0000-0000-000000000003', 'Follow up with StyleForward on usage rights', 'todo', 'high', 'c1000000-0000-0000-0000-000000000003', 'morgan@partneriq.example.com', '2026-03-12'),
  ('f0000000-0000-0000-0000-000000000004', 'Schedule discovery call with Priya Sharma', 'todo', 'medium', 'c1000000-0000-0000-0000-000000000007', 'jordan@partneriq.example.com', '2026-03-11')
on conflict (id) do nothing;

-- ============================================================
-- ACTIVITIES (5 rows)
-- ============================================================
insert into activities (id, action, description, resource_type, resource_id, actor_name) values
  ('ac000000-0000-0000-0000-000000000001', 'deal_created', 'New deal created: NovaTech x Mia Chen', 'partnership', 'c1000000-0000-0000-0000-000000000001', 'Alex Rivera'),
  ('ac000000-0000-0000-0000-000000000002', 'stage_change', 'Deal moved to Active: FreshBite x Aisha Patel', 'partnership', 'c1000000-0000-0000-0000-000000000002', 'Jordan Lee'),
  ('ac000000-0000-0000-0000-000000000003', 'note_added', 'New note added on StyleForward negotiation', 'partnership', 'c1000000-0000-0000-0000-000000000003', 'Morgan Chen'),
  ('ac000000-0000-0000-0000-000000000004', 'email_sent', 'Outreach email sent to GlowSkin', 'partnership', 'c1000000-0000-0000-0000-000000000004', 'Taylor Kim'),
  ('ac000000-0000-0000-0000-000000000005', 'creator_replied', 'Priya Sharma replied to outreach!', 'partnership', 'c1000000-0000-0000-0000-000000000007', 'Jordan Lee')
on conflict (id) do nothing;

-- ============================================================
-- RATE BENCHMARKS (11 rows — by tier with followers and rate ranges)
-- Frontend reads: tier, followers_min, followers_max, sponsored_post_min/max, brand_deal_min/max, ambassador_annual_min/max
-- ============================================================
insert into rate_benchmarks (tier, followers_min, followers_max, sponsored_post_min, sponsored_post_max, brand_deal_min, brand_deal_max, ambassador_annual_min, ambassador_annual_max, platform, niche, avg_rate, min_rate, max_rate) values
  ('nano',      1000,    10000,   100,    500,    250,    1000,   1200,    6000,    'instagram', 'all',       250,   100,   500),
  ('micro',     10000,   50000,   500,    2000,   1000,   5000,   6000,    24000,   'instagram', 'all',       1100,  500,   2000),
  ('mid-micro', 50000,   100000,  2000,   5000,   3000,   10000,  12000,   48000,   'instagram', 'all',       3500,  2000,  5000),
  ('mid',       100000,  250000,  5000,   10000,  8000,   25000,  36000,   96000,   'instagram', 'all',       7500,  5000,  10000),
  ('mid-macro', 250000,  500000,  10000,  20000,  15000,  50000,  60000,   180000,  'instagram', 'all',       15000, 10000, 20000),
  ('macro',     500000,  1000000, 20000,  50000,  30000,  100000, 120000,  360000,  'instagram', 'all',       35000, 20000, 50000),
  ('mega',      1000000, 5000000, 50000,  150000, 75000,  250000, 300000,  900000,  'instagram', 'all',       85000, 50000, 150000),
  ('celebrity', 5000000, NULL,    150000, 500000, 250000, 1000000,600000,  3000000, 'instagram', 'all',       250000,150000,500000),
  ('micro',     10000,   100000,  800,    4000,   1500,   8000,   9600,    36000,   'tiktok',    'fitness',   2200,  800,   4000),
  ('mid',       100000,  500000,  3000,   9000,   5000,   20000,  30000,   84000,   'youtube',   'tech',      5500,  3000,  9000),
  ('macro',     500000,  2000000, 7000,   25000,  12000,  60000,  72000,   240000,  'youtube',   'gaming',    14000, 7000,  25000)
on conflict do nothing;

-- ============================================================
-- PLATFORM MULTIPLIERS (8 rows — with CPM ranges and engagement benchmarks)
-- Frontend reads: platform, base_cpm_min, base_cpm_max, rate_multiplier, engagement_benchmark_min, engagement_benchmark_max, notes
-- ============================================================
insert into platform_multipliers (platform, multiplier, base_cpm_min, base_cpm_max, rate_multiplier, engagement_benchmark_min, engagement_benchmark_max, notes) values
  ('instagram', 1.00, 5.00,  12.00, 1.00, 3.0,  6.0,  'Baseline platform – strong visual content, Stories + Reels driving engagement'),
  ('tiktok',    1.15, 3.00,  8.00,  1.15, 6.0,  12.0, 'Viral potential – lower CPM but highest organic reach and engagement rates'),
  ('youtube',   1.30, 8.00,  20.00, 1.30, 2.0,  5.0,  'Long-form premium – highest CPM, evergreen content with long-tail views'),
  ('twitter',   0.70, 2.00,  6.00,  0.70, 1.0,  3.0,  'Conversation-driven – lower CPM, best for thought leadership and trending topics'),
  ('linkedin',  1.20, 12.00, 30.00, 1.20, 2.0,  4.0,  'B2B premium – highest CPM of all platforms, professional audience, high intent'),
  ('twitch',    1.10, 4.00,  10.00, 1.10, 8.0,  15.0, 'Live engagement – real-time interaction, strong community loyalty, donation culture'),
  ('facebook',  0.80, 3.00,  9.00,  0.80, 1.0,  3.0,  'Broad reach, declining organic – still largest total user base, strong for 35+ demos'),
  ('snapchat',  0.90, 4.00,  9.00,  0.90, 4.0,  8.0,  'Gen Z ephemeral – strong AR features, Spotlight for creator content discovery')
on conflict do nothing;

-- ============================================================
-- CATEGORY PREMIUMS (12 rows — with premium_multiplier and rationale)
-- Frontend reads: category, premium_multiplier, rationale
-- ============================================================
insert into category_premiums (category, premium, premium_multiplier, rationale) values
  ('tech',           20, 1.20, 'Strong brand demand; product launch cycles drive premium rates. CES, MWC and launch events create seasonal spikes.'),
  ('beauty',         15, 1.15, 'Beauty brands compete heavily for creator slots; visual-first content commands premium. GRWM and routine formats dominate.'),
  ('fitness',        18, 1.18, 'Peak demand for fitness creators; wellness economy drives sustained investment. Challenge content and transformation stories convert.'),
  ('gaming',         12, 1.12, 'Growing segment; endemic + non-endemic brands increasingly activate in gaming. Live stream integrations command premium.'),
  ('food',           10, 1.10, 'Steady demand; CPG brands rely on recipe and taste-test content. TikTok recipe trends drive viral potential.'),
  ('lifestyle',       8, 1.08, 'Broad category; lower premium due to high supply but massive volume of deals. Versatile creators span multiple niches.'),
  ('travel',          5, 1.05, 'Post-pandemic recovery strong; tourism boards and hospitality brands returning to creator budgets with hosted trip activations.'),
  ('finance',        25, 1.25, 'Regulated space; compliance requirements and high CLV justify top premiums. Fintech disruption driving new creator partnerships.'),
  ('education',      15, 1.15, 'EdTech brands willing to pay premium for trust-based creator recommendations. Long-form explainer content performs best.'),
  ('health',         22, 1.22, 'Telehealth and wellness brands face compliance overhead, pay premium for credibility. Creator trust is paramount in health.'),
  ('automotive',     18, 1.18, 'High ticket items; brands invest in long-form reviews and experiential content. Test drive and road trip formats dominate.'),
  ('entertainment',  10, 1.10, 'Studios and streaming services drive high volume seasonal campaigns. Premiere events and exclusive screening access for creators.')
on conflict do nothing;

-- ============================================================
-- VIEWERSHIP TIERS (6 rows)
-- ============================================================
insert into viewership_tiers (name, min_viewers, max_viewers, multiplier) values
  ('Nano',      1000,    9999,    0.5),
  ('Micro',     10000,   99999,   0.8),
  ('Mid',       100000,  499999,  1.0),
  ('Macro',     500000,  999999,  1.3),
  ('Mega',      1000000, 4999999, 1.6),
  ('Celebrity', 5000000, NULL,    2.0)
on conflict do nothing;

-- ============================================================
-- SUBSCRIPTION PLANS (4 rows)
-- ============================================================
insert into subscription_plans (name, price, interval, features, max_partnerships, max_team_members) values
  ('Free',       0,   'monthly', '["5 talent searches/month","1 active partnership","Basic analytics"]', 1, 1),
  ('Starter',    49,  'monthly', '["50 talent searches/month","10 active partnerships","AI match engine","Email outreach"]', 10, 3),
  ('Pro',        149, 'monthly', '["Unlimited searches","50 partnerships","Advanced AI","Custom sequences","Analytics dashboard"]', 50, 10),
  ('Enterprise', 399, 'monthly', '["Everything in Pro","Unlimited partnerships","Dedicated success manager","API access","Custom reporting"]', 999999, 999999)
on conflict do nothing;

-- ============================================================
-- CULTURE EVENTS (27 rows — Full 2026-2027 calendar)
-- Frontend reads: event_name, tier ("1"/"2"/"3"), category, month, year, dates (text), location,
--   best_industries, audience_reach, activation_opportunities (text), planning_lead_time,
--   key_demographics, notes, audience_demographics (jsonb), subcategory
-- ============================================================
insert into culture_events (event_name, tier, category, subcategory, month, year, dates, location, audience_reach, best_industries, activation_opportunities, planning_lead_time, key_demographics, notes) values
  ('Super Bowl LX',                '1', 'Sports',              'Football',          'February',  2026, 'Feb 8, 2026',             'New Orleans, LA',  '113M+ US viewers',       'Tech, Food & Beverage, Automotive, Entertainment', 'Watch parties, second-screen social campaigns, real-time commentary, halftime activations', '12-18 months', 'Mass market, 18-49, Sports fans',                    'NFL championship and biggest annual advertising event'),
  ('Black History Month',          '2', 'Cultural',            'Heritage',          'February',  2026, 'Feb 1-28, 2026',          'USA',              '45M+ engaged audience',  'Media, Fashion, Beauty, Education',                'Heritage storytelling, creator spotlights, brand commitments, educational content', '3-4 months', '18-35, Black American community, Gen Z',             'Annual recognition of Black history and culture'),
  ('Lunar New Year',               '2', 'Cultural',            'Heritage',          'February',  2026, 'Feb 17, 2026',            'Global',           '2B+ globally',           'Food & Beverage, Fashion, Beauty, Travel',         'Cultural celebration content, limited-edition products, family-focused campaigns', '3-4 months', 'Asian diaspora, AAPI community, Families',           'Celebration of the Lunar New Year across Asian cultures'),
  ('Ramadan',                      '2', 'Cultural',            'Religious',         'February',  2026, 'Feb 18 – Mar 19, 2026',   'Global',           '1.8B Muslims globally',  'Food & Beverage, Fashion, Beauty, Finance',        'Iftar partnerships, modest fashion, charity campaigns, community content', '4-6 months', 'Muslim community, MENA diaspora, All ages',          'Holy month of fasting, prayer and community for Muslims worldwide'),
  ('March Madness',                '1', 'Sports',              'Basketball',        'March',     2026, 'Mar 17 – Apr 6, 2026',    'USA',              '30M+ bracket participants', 'Sports, Food & Beverage, Tech, Entertainment',  'Bracket challenges, watch party content, campus activations, real-time social', '6-8 months', 'Sports fans, 18-34, College students',               'NCAA Division I basketball tournament — peak sports engagement window'),
  ('International Womens Day',     '2', 'Cultural',            'Awareness',         'March',     2026, 'Mar 8, 2026',             'Global',           '500M+ social impressions', 'Beauty, Fashion, Tech, Finance',                 'Women-led creator campaigns, brand commitments, empowerment content', '2-3 months', 'Women, Allies, Gen Z, Millennials',                  'Global celebration of women achievements and gender equality'),
  ('Earth Day',                    '2', 'Cultural',            'Awareness',         'April',     2026, 'Apr 22, 2026',            'Global',           '1B+ participants globally', 'Sustainability, Fashion, Food & Beverage, Tech', 'Sustainability pledges, eco-product launches, cleanup events, educational content', '3-4 months', 'Eco-conscious, Gen Z, Millennials, Families',        'Annual event promoting environmental protection and sustainability'),
  ('AAPI Heritage Month',          '2', 'Awareness Month',     'Heritage',          'May',       2026, 'May 1-31, 2026',          'USA',              '24M+ AAPI population',   'Beauty, Food & Beverage, Tech, Entertainment',    'AAPI creator spotlights, cultural storytelling, heritage brand collaborations', '3-4 months', 'AAPI community, Asian diaspora, All ages',           'Celebrating Asian American and Pacific Islander history and culture'),
  ('Mental Health Awareness Month','2', 'Awareness Month',     'Health',            'May',       2026, 'May 1-31, 2026',          'Global',           '500M+ social reach',     'Health, Wellness, Tech, Education',                'Mental health partnerships, creator vulnerability content, app integrations, resource sharing', '3-4 months', 'Gen Z, Millennials, Wellness community',             'Raising awareness for mental health education and advocacy'),
  ('Memorial Day',                 '3', 'Holiday/Civic',       'National',          'May',       2026, 'May 25, 2026',            'USA',              '40M+ engaged households', 'Retail, Food & Beverage, Travel, Automotive',     'Summer kickoff sales, outdoor content, patriotic campaigns, travel content', '2-3 months', 'Mass market, Families, Patriotic community',          'US federal holiday honoring military service members'),
  ('Pride Month',                  '1', 'Cultural',            'LGBTQ+',            'June',      2026, 'Jun 1-30, 2026',          'Global',           '500M+ global reach',     'Fashion, Beauty, Entertainment, Tech',             'Pride collections, LGBTQ+ creator spotlights, allyship campaigns, event sponsorships', '4-6 months', 'LGBTQ+, Allies, Gen Z, Millennials',                 'LGBTQ+ celebration, advocacy and visibility month'),
  ('Juneteenth',                   '2', 'Cultural',            'Heritage',          'June',      2026, 'Jun 19, 2026',            'USA',              '35M+ engaged audience',  'Media, Fashion, Beauty, Education',                'Heritage storytelling, Black creator spotlights, educational content, community events', '2-3 months', 'Black American community, All ages, Gen Z',          'Commemoration of the end of slavery in the United States'),
  ('NBA Finals',                   '1', 'Sports',              'Basketball',        'June',      2026, 'Jun 10-22, 2026',         'Global',           '15M+ US viewers per game', 'Sports, Fashion, Tech, Entertainment',           'Sneaker culture campaigns, watch party content, player partnerships, streetwear drops', '6-8 months', 'Sports fans, 18-34, Urban, Sneaker culture',         'NBA championship series — peak basketball engagement'),
  ('Fourth of July',               '2', 'Holiday/Civic',       'National',          'July',      2026, 'Jul 4, 2026',             'USA',              '300M+ US population',    'Food & Beverage, Retail, Travel, Entertainment',   'BBQ and outdoor content, patriotic campaigns, fireworks partnerships, summer product launches', '2-3 months', 'Mass market, Families, All ages',                    'US Independence Day celebrations'),
  ('Back to School',               '2', 'Holiday/Civic',       'Seasonal',          'August',    2026, 'Aug 1-31, 2026',          'USA',              '56M+ students, 50M+ parents', 'Tech, Fashion, Education, Retail',            'School supply campaigns, dorm room content, tech setup videos, fashion hauls', '3-4 months', 'Students, Parents, Teachers, Teens',                 'Annual back-to-school shopping and preparation season'),
  ('Hispanic Heritage Month',      '2', 'Cultural',            'Heritage',          'September', 2026, 'Sep 15 – Oct 15, 2026',   'USA',              '63M+ Hispanic Americans', 'Food & Beverage, Fashion, Beauty, Entertainment', 'Hispanic creator spotlights, cultural storytelling, bilingual content, Latinx brand collabs', '3-4 months', 'Hispanic/Latino community, Spanish speakers',        'Celebration of Hispanic and Latino American culture and contributions'),
  ('World Cup Qualifiers',         '1', 'Sports',              'Soccer',            'September', 2026, 'Sep-Nov 2026',            'Global',           '3.5B+ global audience',  'Sports, Fashion, Food & Beverage, Tech',           'Watch party content, jersey campaigns, cultural fusion activations, prediction contests', '6-12 months', 'Soccer fans, 18-45, Global, Multicultural',          'FIFA World Cup 2026 qualifying matches — building global excitement'),
  ('Halloween',                    '2', 'Holiday/Civic',       'Seasonal',          'October',   2026, 'Oct 31, 2026',            'USA',              '175M+ celebrating Americans', 'Fashion, Beauty, Entertainment, Food',         'Costume content, makeup tutorials, candy partnerships, spooky brand activations', '2-3 months', 'Gen Z, Millennials, Families, Teens',                'Annual costume, horror and fall celebration'),
  ('Diwali',                       '2', 'Cultural',            'Religious',         'October',   2026, 'Oct 20, 2026',            'Global',           '1.2B+ celebrants globally', 'Fashion, Beauty, Food & Beverage, Tech',        'Festival of lights content, traditional fashion, food celebrations, gifting campaigns', '3-4 months', 'South Asian diaspora, Hindu community, Families',    'Hindu festival of lights celebrated globally'),
  ('Veterans Day',                 '3', 'Holiday/Civic',       'National',          'November',  2026, 'Nov 11, 2026',            'USA',              '18M+ military families',  'Retail, Finance, Automotive, Travel',             'Military appreciation campaigns, veteran-owned business spotlights, patriotic content', '2-3 months', 'Mass market, Military community, Families',           'Honoring military veterans in the United States'),
  ('Thanksgiving',                 '2', 'Holiday/Civic',       'National',          'November',  2026, 'Nov 26, 2026',            'USA',              '330M+ US population',    'Food & Beverage, Retail, Travel, Home',            'Recipe content, family gathering campaigns, gratitude storytelling, travel partnerships', '3-4 months', 'Mass market, Families, Food community',               'US holiday for gratitude, family and food'),
  ('Black Friday / Cyber Monday',  '1', 'Holiday/Civic',       'Commercial',        'November',  2026, 'Nov 27-30, 2026',         'Global',           '$12B+ US online sales',  'All industries – peak shopping period',            'Deal roundups, unboxing content, live shopping streams, discount code partnerships', '4-6 months', 'Shoppers, 18-45, Deal seekers, Mass market',          'Largest annual shopping event — peak brand activation window'),
  ('Christmas / Holiday Season',   '1', 'Holiday/Civic',       'Religious/Seasonal','December',  2026, 'Dec 1-25, 2026',          'Global',           '2B+ celebrants globally', 'All industries – gifting season',                  'Gift guide content, holiday campaigns, advent calendars, family-focused activations', '6-12 months', 'Mass market, Families, All ages, Gift buyers',        'Global holiday season — gifting, family and year-end celebrations'),
  ('New Years Eve / Day',          '2', 'Holiday/Civic',       'Seasonal',          'December',  2026, 'Dec 31, 2026 – Jan 1, 2027', 'Global',       '4B+ global viewers',     'Fashion, Wellness, Finance, Entertainment',        'New year resolution campaigns, wellness launches, party content, goal-setting activations', '3-4 months', 'Mass market, All ages, Wellness community',           'Year-end celebration and new year resolutions season'),
  ('MLK Day 2027',                 '2', 'Cultural',            'Heritage',          'January',   2027, 'Jan 18, 2027',            'USA',              '45M+ engaged audience',  'Education, Media, Fashion, Non-profit',            'Service campaigns, educational content, social justice storytelling, community activations', '2-3 months', 'All ages, Black American community, Social justice',  'Honoring Martin Luther King Jr. and the civil rights movement'),
  ('Valentines Day 2027',          '2', 'Holiday/Civic',       'Seasonal',          'February',  2027, 'Feb 14, 2027',            'Global',           '$26B+ US spending',      'Fashion, Beauty, Food & Beverage, Jewelry',        'Gift guide content, couples campaigns, self-love activations, limited-edition drops', '2-3 months', 'Couples, 18-35, Gift buyers, Gen Z',                  'Celebration of love and relationships — key gifting and brand moment'),
  ('Womens History Month 2027',    '2', 'Awareness Month',     'Heritage',          'March',     2027, 'Mar 1-31, 2027',          'Global',           '500M+ social reach',     'Beauty, Fashion, Tech, Finance, Education',        'Women creator spotlights, brand commitments, mentorship content, empowerment campaigns', '3-4 months', 'Women, Allies, Gen Z, Millennials',                   'Celebrating the contributions and achievements of women')
on conflict do nothing;

-- ============================================================
-- MEGA EVENTS (10 rows — tentpole global events)
-- Frontend reads: event_name, dates (text), global_reach (text), format_details, planning_urgency,
--   year, key_facts, tier, audience_demographics (jsonb), location
-- ============================================================
insert into mega_events (event_name, dates, location, notes, global_reach, format_details, planning_urgency, year, key_facts, tier) values
  ('FIFA World Cup 2026',     'Jun 11 – Jul 19, 2026', 'USA / Mexico / Canada', 'First tri-nation World Cup — largest sporting event globally', '5B+ cumulative TV viewers, 5.4M in-person attendance', 'Multi-city tournament, 48 teams, 80 matches over 39 days', 'CRITICAL — activation windows closing Q1 2026', 2026, '16 host cities, first 48-team format, $11B economic impact projected', '1'),
  ('Olympics 2028 (LA)',       'Jul 14-30, 2028',       'Los Angeles, CA',       'Summer Olympic Games — early brand activation planning window', '4B+ global TV viewers, 4M in-person attendance', 'Multi-sport, 32 sports, 329 events over 17 days', 'EARLY PLANNING — partnerships opening 2026', 2028, 'First LA Olympics since 1984, $7B budget, 800+ events across SoCal', '1'),
  ('Coachella 2026',           'Apr 10-19, 2026',       'Indio, CA',             'Premier music and arts festival in the California desert', '250K+ attendees, 40M+ social impressions', '2 weekends, 6 stages, 150+ artists, brand activations throughout grounds', 'HIGH — brand house applications due Dec 2025', 2026, 'Top festival for influencer marketing, 90% of attendees post on social', '1'),
  ('SXSW 2026',               'Mar 13-22, 2026',       'Austin, TX',            'South by Southwest — converging tech, film and music', '300K+ attendees, 100M+ social impressions', '10-day festival, film premieres, music showcases, tech panels, brand houses', 'HIGH — panel submissions due Oct 2025', 2026, 'Premier platform for product launches, 2,000+ sessions, 800+ speakers', '1'),
  ('ComplexCon 2026',          'Nov 7-8, 2026',         'Long Beach, CA',        'Culture, fashion, music and sneaker convention', '60K+ attendees, 200M+ social impressions', '2-day convention, brand booths, exclusive drops, performances, panels', 'MEDIUM — booth applications due Jul 2026', 2026, 'Top event for streetwear and sneaker culture, 200+ brands exhibit', '1'),
  ('Met Gala 2026',            'May 4, 2026',           'New York, NY',          'Annual fundraising gala for the Met Costume Institute', '700 attendees, 1B+ social impressions globally', 'Single evening event, celebrity red carpet, exclusive invite-only', 'HIGH — fashion brand alignment critical', 2026, 'Most-discussed fashion event globally, red carpet drives 30M+ social posts', '1'),
  ('Grammy Awards 2026',       'Feb 1, 2026',           'Los Angeles, CA',       'Annual music industry awards ceremony', '18K venue, 12M+ US TV viewers, 500M+ social reach', 'Live broadcast, performances, red carpet, after-parties', 'HIGH — sponsorship packages close Nov 2025', 2026, '67th ceremony, music industry benchmark, second-screen engagement peak', '1'),
  ('VidCon 2026',              'Jun 25-28, 2026',       'Anaheim, CA',           'Largest global creator economy convention', '75K+ attendees, 100M+ social impressions', '4-day event, creator meetups, brand activations, industry track, featured creator stage', 'MEDIUM — brand activation apps due Mar 2026', 2026, 'Premier event for connecting with creators and fans, 500+ creators attend', '1'),
  ('New York Fashion Week',    'Sep 9-14, 2026',        'New York, NY',          'Bi-annual fashion event showcasing designer collections', '200K+ in-person, 500M+ social impressions', '6-day event, runway shows, presentations, pop-ups, street style coverage', 'HIGH — front row partnerships close Jun 2026', 2026, 'Sets global fashion trends, 300+ shows and presentations', '1'),
  ('Art Basel Miami 2026',     'Dec 3-7, 2026',         'Miami Beach, FL',       'International art fair combining art, culture and luxury', '83K+ attendees, 200M+ social impressions', '5-day fair, gallery exhibitions, satellite events, brand activations, parties', 'MEDIUM — booth applications due Aug 2026', 2026, 'Intersection of art, luxury and culture, 280+ galleries exhibit', '1')
on conflict do nothing;

-- ============================================================
-- CONFERENCES (10 rows — creator economy and marketing conferences)
-- Frontend reads: conference_name, industry_focus, typical_date, location, attendees,
--   sponsorship_range, why_attend, key_audience, best_for_industries
-- ============================================================
insert into conferences (conference_name, industry_focus, typical_date, location, attendees, sponsorship_range, why_attend, key_audience, best_for_industries, event_name, category, notes, dates) values
  ('VidSummit 2026',               'Creator Economy',       'September 2026', 'Dallas, TX',        '3,000+',   '$15K–$50K',  'Premier creator growth conference — learn YouTube strategy, monetization and audience building from top creators', 'YouTube creators, brand marketers, agencies', 'Tech, Entertainment, Education', 'VidSummit 2026', 'Creator Economy', 'Premier creator economy and YouTube growth conference', 'Sep 20-22, 2026'),
  ('Social Media Marketing World',  'Marketing',            'March 2026',     'San Diego, CA',     '5,000+',   '$25K–$75K',  'Largest social media marketing conference — cutting-edge tactics from 100+ expert speakers', 'Social media managers, brand marketers, CMOs', 'All industries', 'Social Media Marketing World', 'Marketing', 'Leading social media marketing conference', 'Mar 15-17, 2026'),
  ('CES 2026',                     'Technology',            'January 2026',   'Las Vegas, NV',     '115,000+', '$50K–$250K', 'World''s largest consumer tech exhibition — first look at products that define the year ahead', 'Tech executives, product managers, media', 'Tech, Automotive, Health, Entertainment', 'CES 2026', 'Technology', 'Consumer Electronics Show', 'Jan 6-9, 2026'),
  ('Cannes Lions 2026',            'Advertising',           'June 2026',      'Cannes, France',    '12,000+',  '$40K–$200K', 'Global creativity festival — benchmark campaigns, network with top agency and brand leaders', 'CMOs, creative directors, agency leaders', 'Advertising, Entertainment, Tech', 'Cannes Lions 2026', 'Advertising', 'International Festival of Creativity', 'Jun 15-19, 2026'),
  ('TwitchCon 2026',               'Gaming / Streaming',    'September 2026', 'San Diego, CA',     '35,000+',  '$25K–$100K', 'Official Twitch convention — connect with streamers, fans and gaming brands in the live streaming ecosystem', 'Streamers, gaming brands, esports teams', 'Gaming, Tech, Entertainment, Food & Beverage', 'TwitchCon 2026', 'Gaming / Streaming', 'Official Twitch community convention', 'Sep 26-28, 2026'),
  ('Advertising Week NY',          'Advertising',           'October 2026',   'New York, NY',      '20,000+',  '$30K–$100K', 'Thought leadership summit — panels on the future of advertising, marketing technology and brand strategy', 'Brand marketers, agency leaders, media buyers', 'Advertising, Tech, Media, Finance', 'Advertising Week NY', 'Advertising', 'Thought leadership summit for advertising', 'Oct 13-16, 2026'),
  ('Influencer Marketing Show',    'Influencer Marketing',  'May 2026',       'New York, NY',      '1,500+',   '$10K–$40K',  'Dedicated influencer marketing conference — ROI measurement, creator partnerships and campaign strategy', 'Brand marketers, agency managers, creators', 'Beauty, Fashion, Food & Beverage, Tech', 'Influencer Marketing Show', 'Influencer Marketing', 'Dedicated influencer marketing conference', 'May 10-11, 2026'),
  ('Creator Economy Expo',         'Creator Economy',       'May 2026',       'Cleveland, OH',     '2,500+',   '$12K–$40K',  'Business of content creation — monetization strategies, platform diversification and building sustainable creator businesses', 'Full-time creators, aspiring creators, agencies', 'Creator Economy, Tech, Education', 'Creator Economy Expo', 'Creator Economy', 'Conference focused on business of content creation', 'May 4-6, 2026'),
  ('Brand Innovation Summit',      'Brand Marketing',       'July 2026',      'Chicago, IL',       '2,000+',   '$15K–$50K',  'Brand partnership and innovation strategy — learn from Fortune 500 brand leaders and disruptive DTC brands', 'Brand managers, partnership leads, CMOs', 'All industries, especially Retail and CPG', 'Brand Innovation Summit', 'Brand Marketing', 'Brand partnership and innovation strategy conference', 'Jul 22-23, 2026'),
  ('SMMW Creators Track',          'Creator Economy',       'March 2026',     'San Diego, CA',     '1,200+',   '$8K–$25K',   'Dedicated creator monetisation track — YouTube, TikTok and Instagram growth strategies from practitioners', 'Content creators, social media managers', 'Creator Economy, Entertainment, Education', 'SMMW Creators Track', 'Creator Economy', 'Dedicated creator monetisation track at SMMW', 'Mar 16-17, 2026')
on conflict do nothing;

-- ============================================================
-- DEMOGRAPHIC SEGMENTS (8 rows — with population_size, buying_power, media_preferences, etc.)
-- Frontend reads: name, population_size, buying_power, media_preferences, top_events,
--   key_cultural_moments, brand_activation_tips, activation_tips
-- ============================================================
insert into demographic_segments (name, description, age_range, gender, interests, population_size, buying_power, media_preferences, top_events, key_cultural_moments, brand_activation_tips, activation_tips) values
  ('Gen Z Trendsetters',     'Fashion and culture-forward Gen Z digital natives',  '18-26', 'all',         '["fashion","music","gaming","social justice","sustainability"]', '68M (US)', '$360B annual spending', 'TikTok, Instagram Reels, YouTube Shorts, Snapchat — short-form video dominant, meme culture, authentic UGC', 'Coachella, ComplexCon, Pride Month, Halloween, Black Friday', 'Pride Month, Earth Day, Mental Health Awareness, Black History Month', 'Lead with authenticity over polish. Co-create with creators rather than scripting. Use TikTok challenges and AR filters. Values-driven messaging converts.', 'Use TikTok and Instagram Reels. Co-create campaigns. Prioritise values-driven messaging.'),
  ('Millennial Parents',     'Millennial parents balancing family and career',      '30-40', 'all',         '["parenting","home","health","finance","education"]', '45M (US)', '$2.5T household spending', 'Instagram, Facebook, YouTube, Pinterest — researching purchases, family content, educational videos', 'Back to School, Thanksgiving, Christmas, Memorial Day, Fourth of July', 'Back to School, Thanksgiving, Christmas, Mental Health Awareness', 'Relatable parenting content converts. Product integrations in daily routines. Educational content for kids. Family-friendly unboxing and reviews.', 'Create relatable family content. Integrate products into daily routines. Family-friendly reviews.'),
  ('Fitness Enthusiasts',    'Dedicated health and fitness consumers',              '22-38', 'all',         '["fitness","nutrition","wellness","sports","outdoor"]', '32M (US)', '$1.2T wellness economy', 'Instagram, TikTok, YouTube — workout videos, transformation stories, supplement and gear reviews', 'Super Bowl, March Madness, Olympics, World Cup, Back to School', 'New Year (resolutions), Summer prep, Mental Health Awareness', 'Challenge-based campaigns drive participation. Partner with certified trainers. Transformation content converts. Ambassador programs over one-off posts.', 'Run 30-day challenges. Partner with certified trainers. Use before/after transformation content.'),
  ('Tech Early Adopters',    'Technology enthusiasts who adopt before mainstream',   '25-45', 'male_skew',   '["technology","gaming","productivity","AI","gadgets"]', '18M (US)', '$800B annual tech spending', 'YouTube (long-form reviews), Twitter/X, LinkedIn, Reddit — deep-dive reviews, comparison content, tech forums', 'CES, SXSW, VidCon, Apple Events, Black Friday/Cyber Monday', 'CES week, product launch cycles, Back to School tech', 'Detailed unboxing and review content. Comparison and versus formats. Early access exclusives build excitement. Data-driven talking points for authenticity.', 'Invest in detailed YouTube reviews. Provide early exclusive access. Use comparison formats.'),
  ('Beauty Conscious',       'Beauty and personal care focused consumers',           '16-35', 'female_skew', '["beauty","skincare","fashion","wellness","self-care"]', '55M (US)', '$580B global beauty market', 'Instagram, TikTok, YouTube — GRWM content, tutorials, product reviews, routine-based formats', 'Met Gala, NYFW, Coachella, Valentines Day, Pride Month', 'Pride Month, Valentines Day, International Womens Day, Diwali', 'GRWM and routine-based content outperforms scripted ads. Partner with creators who organically use similar products. TikTok for discovery, Instagram for conversion.', 'Prioritise GRWM content. Let creators choose products. TikTok for discovery, IG for conversion.'),
  ('Gen Alpha Influence',    'Parents purchasing on behalf of Gen Alpha (2010-2025)', '0-15',  'all',        '["toys","gaming","education","entertainment","kids content"]', '48M (US)', '$500B+ influenced spending', 'YouTube, TikTok, Roblox — kids content, gaming, educational videos, family channels', 'Back to School, Christmas, Halloween, Summer Break', 'Christmas, Back to School, Halloween, Summer Break', 'Family-friendly unboxing and educational content. Partner through parent-approved channels. YouTube Kids and TikTok safety-first approach. Toy and game reviews drive purchase intent.', 'Use family-friendly unboxing. Partner with parent-approved channels. YouTube Kids safety-first.'),
  ('Affluent Professionals', 'High-income professionals with discretionary spending', '35-55', 'all',        '["finance","luxury","travel","business","wellness"]', '22M (US)', '$3.4T combined income', 'LinkedIn, YouTube, Instagram, Twitter/X — thought leadership, premium reviews, travel content, business insights', 'Art Basel, NYFW, Cannes Lions, CES, Advertising Week', 'Tax season, year-end giving, summer travel, holiday luxury gifting', 'Thought-leadership content over influencer marketing. LinkedIn posts perform well. Premium product reviews with expertise. Quality over trends in messaging.', 'Use thought leadership on LinkedIn. Expertise-driven premium reviews. Quality over trend messaging.'),
  ('Multicultural Gen Z',    'Hispanic, Black, AAPI Gen Z consumers shaping culture', '18-28', 'all',       '["music","fashion","food","culture","social justice","gaming"]', '42M (US)', '$600B+ combined spending', 'TikTok, Instagram, YouTube, Snapchat — culturally authentic content, bilingual creators, social commerce', 'Pride Month, Juneteenth, Hispanic Heritage Month, Lunar New Year, Diwali', 'Black History Month, AAPI Heritage, Hispanic Heritage, Lunar New Year, Juneteenth, Ramadan', 'Culturally authentic storytelling is non-negotiable. Bilingual content expands reach. Community-first campaigns build loyalty. Social commerce converts.', 'Lead with cultural authenticity. Use bilingual content. Community-first campaigns build loyalty.')
on conflict do nothing;

-- ============================================================
-- ROI BENCHMARKS (10 rows — by deal type with median/top/bottom quartile ROI)
-- Frontend reads: deal_type, median_roi, top_quartile_roi, bottom_quartile_roi, measurement_period
-- ============================================================
insert into roi_benchmarks (deal_type, median_roi, top_quartile_roi, bottom_quartile_roi, measurement_period, industry, partnership_type, avg_roi) values
  ('sponsorship',       3.2, 5.8, 1.5, '30-60 days',  'All',                   'sponsorship',       3.2),
  ('affiliate',         4.5, 8.2, 2.1, '60-90 days',  'All',                   'affiliate',         4.5),
  ('ambassador',        5.1, 9.0, 2.8, '6-12 months', 'All',                   'ambassador',        5.1),
  ('content_creation',  2.8, 4.5, 1.2, '30-45 days',  'All',                   'content_creation',  2.8),
  ('product_seeding',   6.2, 11.5, 3.0, '30-90 days', 'Beauty & Personal Care', 'product_seeding',  6.2),
  ('event_activation',  3.8, 7.0, 1.8, '1-7 days',    'Entertainment & Media',  'event_activation', 3.8),
  ('whitelisting',      4.0, 7.5, 2.0, '30-60 days',  'Fashion & Apparel',      'whitelisting',     4.0),
  ('ugc_licensing',     3.5, 6.0, 1.6, '30-90 days',  'Food & Beverage',        'ugc_licensing',    3.5),
  ('live_streaming',    2.5, 5.0, 1.0, '1-3 days',    'Gaming',                 'live_streaming',   2.5),
  ('podcast_integration', 3.0, 5.5, 1.4, '60-180 days', 'Technology',           'podcast_integration', 3.0)
on conflict do nothing;

-- ============================================================
-- INDUSTRY GUIDES (8 rows — with sector, budget, events, demographics, strategies)
-- Frontend reads: industry, sector, budget_allocation, priority_tier_1_events, tier_2_events,
--   heritage_awareness_months, key_conferences, best_demographics, activation_strategies
-- ============================================================
insert into industry_guides (title, industry, content, sector, budget_allocation, priority_tier_1_events, tier_2_events, heritage_awareness_months, key_conferences, best_demographics, activation_strategies) values
  (
    'Beauty & Skincare Creator Partnerships',
    'Beauty & Personal Care',
    'The beauty industry leads in influencer marketing spend with the highest ROI from micro and mid-tier creators using GRWM and routine-based content.',
    'Skincare, Cosmetics, Personal Care',
    '$50K–$250K per campaign',
    'Met Gala, NYFW, Coachella, Pride Month',
    'Valentines Day, International Womens Day, Diwali, Black Friday',
    'Womens History Month, Pride Month, AAPI Heritage Month, Hispanic Heritage Month',
    'Influencer Marketing Show, SMMW, Cannes Lions',
    'Beauty Conscious, Gen Z Trendsetters, Multicultural Gen Z',
    'Prioritise GRWM and routine-format content. Partner with creators who organically use similar products. Allow 4-6 weeks for seeding. Offer affiliate codes alongside flat fees. TikTok for discovery, Instagram for conversion.'
  ),
  (
    'Tech Product Launch Playbook',
    'Technology',
    'Tech brands see highest ROI with YouTube integrations and detailed review content. Trust is paramount — creators must genuinely evaluate products.',
    'Consumer Electronics, Software, SaaS',
    '$75K–$500K per launch',
    'CES, SXSW, Apple Events, Black Friday/Cyber Monday',
    'Back to School, VidCon, Product Launch Windows',
    'None — focus on product launch cycles and seasonal demand',
    'CES, SXSW, VidSummit, Creator Economy Expo',
    'Tech Early Adopters, Affluent Professionals, Gen Z Trendsetters',
    'Invest in long-form YouTube reviews over short social posts. Provide early exclusive access. Use comparison and versus content. Run campaigns around CES and launch cycles. Data-driven talking points for authenticity.'
  ),
  (
    'Fitness & Wellness Brand Guide',
    'Sports & Fitness',
    'Fitness creators command high trust and engagement. Challenge-based campaigns drive participation and UGC at massive scale.',
    'Equipment, Apparel, Supplements, Wellness',
    '$40K–$200K per campaign',
    'Super Bowl, Olympics, World Cup, March Madness',
    'New Year Resolutions, Summer Prep, Back to School, Mental Health Awareness Month',
    'Mental Health Awareness Month (May)',
    'VidSummit, SMMW, Brand Innovation Summit',
    'Fitness Enthusiasts, Gen Z Trendsetters, Millennial Parents',
    'Run 30-day challenge campaigns for maximum UGC. Partner with certified trainers for supplement credibility. Use Instagram Reels and TikTok for workout content. Invest in ambassador programs over one-off posts. Time around New Year and summer.'
  ),
  (
    'Food & Beverage Creator Strategy',
    'Food & Beverage',
    'Food content performs exceptionally on TikTok and Instagram. Authentic recipe integrations outperform scripted ads by 3x.',
    'CPG, Restaurants, Meal Delivery, Beverages',
    '$25K–$150K per campaign',
    'Super Bowl (ads), Thanksgiving, Black Friday, World Cup watch parties',
    'Memorial Day (BBQ), Fourth of July, Back to School lunches, Halloween',
    'Hispanic Heritage Month, Lunar New Year, Ramadan (Iftar), Diwali',
    'SMMW, Brand Innovation Summit, Influencer Marketing Show',
    'Millennial Parents, Fitness Enthusiasts, Multicultural Gen Z',
    'Use recipe integration format over product-only showcases. Partner with micro food bloggers for highest engagement. Leverage TikTok recipe trends. Run seasonal campaigns tied to holidays and cultural food moments. Genuine reactions only.'
  ),
  (
    'Fashion & Apparel Partnership Guide',
    'Fashion & Apparel',
    'Fashion thrives on visual platforms. Haul, try-on and styling content converts at the highest rates. Diversity directly correlates with reach.',
    'Streetwear, Luxury, Athleisure, DTC',
    '$50K–$300K per campaign',
    'NYFW, Met Gala, Coachella, ComplexCon, Black Friday',
    'Pride Month, Back to School, Halloween, Valentines Day',
    'Black History Month, Pride Month, Hispanic Heritage Month, AAPI Heritage Month',
    'ComplexCon, NYFW events, Cannes Lions, Advertising Week',
    'Gen Z Trendsetters, Beauty Conscious, Multicultural Gen Z',
    'Invest in try-on haul and styling content over static shots. Cast diverse creators for maximum reach. Time campaigns around fashion weeks and seasonal drops. Offer exclusive early-access through creators. Enable social commerce with shoppable links.'
  ),
  (
    'Gaming & Esports Activation Guide',
    'Gaming',
    'Gaming creators offer unmatched live engagement on Twitch and YouTube. Non-endemic brands increasingly activate as the audience matures.',
    'Game Publishers, Hardware, Esports, Non-endemic',
    '$40K–$250K per campaign',
    'TwitchCon, E3/Summer Game Fest, The Game Awards, ComplexCon',
    'Major game launches, Esports tournaments, Back to School, Black Friday',
    'None — focus on game release calendars and esports schedules',
    'TwitchCon, CES (gaming), VidSummit, Creator Economy Expo',
    'Tech Early Adopters, Gen Z Trendsetters, Gen Alpha Influence',
    'Use Twitch integrations and live stream sponsorships for real-time engagement. YouTube gaming for evergreen content. Non-endemic brands lead with creator authenticity. Run campaigns around major game launches. Enable creator codes and in-game items.'
  ),
  (
    'Finance & Fintech Creator Compliance Guide',
    'Finance & Fintech',
    'Finance content requires careful compliance navigation but delivers high CLV. Educational content on YouTube and LinkedIn performs best.',
    'Banking, Insurance, Fintech, Crypto, Investing',
    '$50K–$300K per campaign',
    'Tax Season (Jan-Apr), Year-End Financial Planning, Black Friday (financial products)',
    'Back to School (student finance), New Year (budgeting resolutions)',
    'None — focus on financial planning seasonal cycles',
    'Cannes Lions, Advertising Week, Brand Innovation Summit',
    'Affluent Professionals, Tech Early Adopters, Millennial Parents',
    'Work with creators who have demonstrated financial literacy. Ensure all content passes compliance review. Favour educational explainer content. Use LinkedIn alongside YouTube for B2B fintech. Provide clear disclosure templates and approved talking points.'
  ),
  (
    'Travel & Hospitality Creator Playbook',
    'Travel & Hospitality',
    'Travel content has strong long-tail value — destination videos drive bookings months after publication. Instagram and YouTube are primary platforms.',
    'Hotels, Airlines, Tourism Boards, OTAs',
    '$30K–$200K per campaign',
    'Summer Travel Season (Jun-Aug), Spring Break, Holiday Travel, Art Basel Miami',
    'Memorial Day, Fourth of July, Thanksgiving travel, Valentines Day getaways',
    'None — focus on booking windows and travel seasons',
    'SXSW (travel tech), Cannes Lions, Advertising Week',
    'Affluent Professionals, Millennial Parents, Gen Z Trendsetters',
    'Invest in YouTube destination guides for long-tail search value. Instagram Reels for aspirational visual content. Partner for hosted trips with clear deliverables. Time around booking windows: January, spring break and summer. Enable booking links with tracked attribution.'
  )
on conflict do nothing;
