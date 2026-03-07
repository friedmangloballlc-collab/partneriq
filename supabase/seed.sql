-- PartnerIQ Seed Data
-- Demo data for all tables (does not require auth users)

-- ============================================================
-- BRANDS
-- ============================================================
insert into brands (id, name, industry, website, description, hq_location, annual_revenue, partnership_budget, target_niches, target_platforms, brand_values, contact_name, contact_email) values
  ('b1000000-0000-0000-0000-000000000001', 'NovaTech', 'Technology', 'https://novatech.example.com', 'Leading edge consumer tech brand', 'San Francisco, CA', '$500M+', 250000, array['tech','gaming','education'], array['youtube','twitter','linkedin'], array['innovation','sustainability','quality'], 'Alex Rivera', 'alex@novatech.example.com'),
  ('b1000000-0000-0000-0000-000000000002', 'FreshBite Foods', 'Food & Beverage', 'https://freshbite.example.com', 'Organic meal prep and delivery', 'Austin, TX', '$50M–100M', 80000, array['fitness','lifestyle','food'], array['instagram','tiktok'], array['health','sustainability','community'], 'Jordan Lee', 'jordan@freshbite.example.com'),
  ('b1000000-0000-0000-0000-000000000003', 'StyleForward', 'Fashion & Apparel', 'https://styleforward.example.com', 'Contemporary streetwear and athleisure', 'New York, NY', '$100M–250M', 150000, array['fashion','lifestyle','fitness'], array['instagram','tiktok','youtube'], array['inclusivity','expression','quality'], 'Morgan Chen', 'morgan@styleforward.example.com'),
  ('b1000000-0000-0000-0000-000000000004', 'GlowSkin', 'Beauty & Personal Care', 'https://glowskin.example.com', 'Clean beauty and skincare', 'Los Angeles, CA', '$25M–50M', 60000, array['beauty','lifestyle','wellness'], array['instagram','tiktok','youtube'], array['clean beauty','transparency','diversity'], 'Taylor Kim', 'taylor@glowskin.example.com'),
  ('b1000000-0000-0000-0000-000000000005', 'PeakFit', 'Sports & Fitness', 'https://peakfit.example.com', 'Performance fitness equipment and apparel', 'Denver, CO', '$75M–150M', 120000, array['fitness','sports','health'], array['instagram','youtube','tiktok'], array['performance','community','accessibility'], 'Casey Johnson', 'casey@peakfit.example.com')
on conflict (id) do nothing;

-- ============================================================
-- TALENTS
-- ============================================================
insert into talents (id, name, email, primary_platform, niche, tier, location, bio, total_followers, engagement_rate, brand_safety_score, discovery_alpha_score, trajectory, avg_views, rate_per_post, rate_per_story, rate_per_reel) values
  ('t1000000-0000-0000-0000-000000000001', 'Mia Chen', 'mia@creator.example.com', 'instagram', 'lifestyle', 'macro', 'Los Angeles, CA', 'Lifestyle creator sharing authentic daily content', 850000, 4.2, 92, 87, 'rising', 120000, 8500, 2500, 12000),
  ('t1000000-0000-0000-0000-000000000002', 'Jake Torres', 'jake@creator.example.com', 'youtube', 'tech', 'mid', 'Seattle, WA', 'Tech reviewer and early adopter', 420000, 6.8, 96, 91, 'rising', 85000, 5000, 1500, 7000),
  ('t1000000-0000-0000-0000-000000000003', 'Aisha Patel', 'aisha@creator.example.com', 'tiktok', 'fitness', 'macro', 'Chicago, IL', 'Certified personal trainer and motivational creator', 1200000, 8.1, 98, 94, 'rising', 350000, 12000, 3500, 18000),
  ('t1000000-0000-0000-0000-000000000004', 'Sam Rivers', 'sam@creator.example.com', 'instagram', 'beauty', 'mid', 'Miami, FL', 'Beauty educator and product reviewer', 380000, 5.6, 95, 82, 'stable', 65000, 4000, 1200, 6000),
  ('t1000000-0000-0000-0000-000000000005', 'Leo Martinez', 'leo@creator.example.com', 'youtube', 'gaming', 'macro', 'Austin, TX', 'Gaming content creator and streamer', 920000, 7.2, 88, 85, 'rising', 280000, 9000, 2800, 13000),
  ('t1000000-0000-0000-0000-000000000006', 'Priya Sharma', 'priya@creator.example.com', 'instagram', 'food', 'micro', 'Portland, OR', 'Food blogger and recipe developer', 95000, 9.4, 99, 88, 'rising', 18000, 1500, 500, 2200),
  ('t1000000-0000-0000-0000-000000000007', 'Ryan Walsh', 'ryan@creator.example.com', 'tiktok', 'education', 'mid', 'Boston, MA', 'EdTech creator making learning fun', 310000, 11.2, 97, 93, 'rising', 95000, 3500, 1000, 5500),
  ('t1000000-0000-0000-0000-000000000008', 'Zoe Campbell', 'zoe@creator.example.com', 'instagram', 'travel', 'micro', 'Nashville, TN', 'Travel photographer and adventure seeker', 78000, 7.8, 94, 79, 'stable', 12000, 1200, 400, 1800)
on conflict (id) do nothing;

-- ============================================================
-- PARTNERSHIPS
-- ============================================================
insert into partnerships (id, title, brand_id, talent_id, brand_name, talent_name, status, deal_value, match_score, priority, assigned_to, notes) values
  ('p1000000-0000-0000-0000-000000000001', 'NovaTech × Mia Chen – Lifestyle Tech Series', 'b1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'NovaTech', 'Mia Chen', 'active', 45000, 92, 'high', 'sales@partneriq.example.com', '6-part sponsored series launching Q2'),
  ('p1000000-0000-0000-0000-000000000002', 'FreshBite × Aisha Patel – Nutrition Campaign', 'b1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000003', 'FreshBite Foods', 'Aisha Patel', 'contracted', 38000, 95, 'high', 'sales@partneriq.example.com', 'Meal plan content integration'),
  ('p1000000-0000-0000-0000-000000000003', 'StyleForward × Mia Chen – Fall Collection Drop', 'b1000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000001', 'StyleForward', 'Mia Chen', 'negotiating', 28000, 88, 'medium', NULL, 'Negotiations ongoing on usage rights'),
  ('p1000000-0000-0000-0000-000000000004', 'GlowSkin × Sam Rivers – Skincare Routine', 'b1000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000004', 'GlowSkin', 'Sam Rivers', 'outreach_sent', 18000, 84, 'medium', NULL, 'First outreach sent, awaiting reply'),
  ('p1000000-0000-0000-0000-000000000005', 'PeakFit × Jake Torres – Tech & Fitness Crossover', 'b1000000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000002', 'PeakFit', 'Jake Torres', 'researching', 22000, 79, 'medium', NULL, 'Reviewing tech fitness content fit'),
  ('p1000000-0000-0000-0000-000000000006', 'NovaTech × Leo Martinez – Gaming Peripherals', 'b1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000005', 'NovaTech', 'Leo Martinez', 'discovered', 55000, 91, 'high', NULL, 'High priority gaming segment opportunity'),
  ('p1000000-0000-0000-0000-000000000007', 'FreshBite × Priya Sharma – Recipe Collaboration', 'b1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000006', 'FreshBite Foods', 'Priya Sharma', 'responded', 12000, 96, 'high', NULL, 'Creator very enthusiastic, hot lead'),
  ('p1000000-0000-0000-0000-000000000008', 'StyleForward × Zoe Campbell – Travel Fashion', 'b1000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000008', 'StyleForward', 'Zoe Campbell', 'outreach_pending', 9500, 77, 'low', NULL, 'Draft outreach ready')
on conflict (id) do nothing;

-- ============================================================
-- MARKETPLACE OPPORTUNITIES
-- ============================================================
insert into marketplace_opportunities (id, title, brand_name, description, status, contract_type, budget_min, budget_max, required_niches, required_platforms, min_followers, deliverables, deadline) values
  ('o1000000-0000-0000-0000-000000000001', 'Tech Product Launch – Q2 2026', 'NovaTech', 'Looking for tech-savvy creators to launch our new smart home device line', 'published', 'sponsored_post', 5000, 15000, array['tech','lifestyle'], array['youtube','instagram'], 100000, array['2 YouTube videos','4 Instagram posts','8 Stories'], '2026-05-31'),
  ('o1000000-0000-0000-0000-000000000002', 'Healthy Eating Month Campaign', 'FreshBite Foods', 'Partner with us to promote clean, nutritious eating habits', 'published', 'ambassador', 2000, 8000, array['fitness','food','lifestyle'], array['instagram','tiktok'], 50000, array['8 TikTok videos','12 Instagram posts'], '2026-04-30'),
  ('o1000000-0000-0000-0000-000000000003', 'Summer Streetwear Collection', 'StyleForward', 'Feature our new summer collection in your content', 'published', 'gifting_plus_fee', 1500, 6000, array['fashion','lifestyle'], array['instagram','tiktok'], 30000, array['6 Instagram posts','10 Stories','3 Reels'], '2026-06-15'),
  ('o1000000-0000-0000-0000-000000000004', 'Clean Beauty Skincare Routine Series', 'GlowSkin', 'Show your audience your skincare routine with our products', 'published', 'sponsored_post', 3000, 10000, array['beauty','wellness','lifestyle'], array['instagram','youtube'], 75000, array['3 YouTube videos','6 Instagram posts'], '2026-05-01'),
  ('o1000000-0000-0000-0000-000000000005', 'Fitness Challenge Series', 'PeakFit', '30-day fitness challenge featuring our equipment', 'published', 'ambassador', 4000, 12000, array['fitness','sports','health'], array['instagram','tiktok','youtube'], 80000, array['30-day daily Stories','4 long-form videos'], '2026-07-01')
on conflict (id) do nothing;

-- ============================================================
-- OPPORTUNITY APPLICATIONS
-- ============================================================
insert into opportunity_applications (id, opportunity_id, talent_email, talent_name, status, cover_letter, proposed_rate) values
  ('a1000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000002', 'aisha@creator.example.com', 'Aisha Patel', 'accepted', 'I am deeply passionate about nutrition and your products align perfectly with my content pillars.', 6500),
  ('a1000000-0000-0000-0000-000000000002', 'o1000000-0000-0000-0000-000000000003', 'mia@creator.example.com', 'Mia Chen', 'reviewing', 'Fashion and lifestyle are at the core of my content. My audience would love your summer collection!', 4500),
  ('a1000000-0000-0000-0000-000000000003', 'o1000000-0000-0000-0000-000000000004', 'sam@creator.example.com', 'Sam Rivers', 'pending', 'Clean beauty is my specialty and I would love to feature GlowSkin in my next skincare series.', 3800),
  ('a1000000-0000-0000-0000-000000000004', 'o1000000-0000-0000-0000-000000000002', 'priya@creator.example.com', 'Priya Sharma', 'pending', 'As a food creator focused on healthy eating, FreshBite is a natural fit for my audience.', 2200),
  ('a1000000-0000-0000-0000-000000000005', 'o1000000-0000-0000-0000-000000000005', 'aisha@creator.example.com', 'Aisha Patel', 'reviewing', 'Fitness challenges are my specialty. My community has completed 12 challenges with me already.', 9000)
on conflict (id) do nothing;

-- ============================================================
-- OUTREACH SEQUENCES
-- ============================================================
insert into outreach_sequences (id, name, description, status, target_count, sent_count, open_rate, reply_rate) values
  ('s1000000-0000-0000-0000-000000000001', 'Tech Creator Cold Outreach', 'Multi-step sequence for approaching tech creators', 'active', 50, 32, 68.5, 22.4),
  ('s1000000-0000-0000-0000-000000000002', 'Fitness Brand Partnership Intro', 'Introduction sequence for fitness brand partnerships', 'active', 30, 18, 72.2, 28.6),
  ('s1000000-0000-0000-0000-000000000003', 'Beauty Creator Campaign', 'Outreach for beauty campaign recruitment', 'paused', 40, 15, 60.0, 13.3)
on conflict (id) do nothing;

-- ============================================================
-- APPROVAL ITEMS
-- ============================================================
insert into approval_items (id, title, description, type, status, partnership_id) values
  ('ai000000-0000-0000-0000-000000000001', 'Contract Review – NovaTech × Mia Chen', 'Please review and approve the partnership contract', 'contract', 'approved', 'p1000000-0000-0000-0000-000000000001'),
  ('ai000000-0000-0000-0000-000000000002', 'Content Brief – FreshBite × Aisha Patel', 'Review content brief before sending to creator', 'content_brief', 'pending', 'p1000000-0000-0000-0000-000000000002'),
  ('ai000000-0000-0000-0000-000000000003', 'Payment Approval – $38,000', 'Approve payment release for contracted deal', 'payment', 'pending', 'p1000000-0000-0000-0000-000000000002'),
  ('ai000000-0000-0000-0000-000000000004', 'Creative Assets Review – StyleForward', 'Review submitted brand assets for usage rights', 'creative', 'revision_requested', 'p1000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

-- ============================================================
-- DEAL NOTES
-- ============================================================
insert into deal_notes (id, partnership_id, content, type, author_name) values
  ('dn000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Had a great kickoff call with Mia. She is very enthusiastic about the tech angle. Content calendar locked in.', 'call', 'Alex Rivera'),
  ('dn000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 'Contract signed. Shooting starts next week. Deliverables agreed: 8 TikToks + 6 IG posts.', 'note', 'Jordan Lee'),
  ('dn000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 'StyleForward requested exclusivity clause. Need legal review before we can proceed.', 'note', 'Morgan Chen'),
  ('dn000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000007', 'Priya responded within 2 hours! Very interested. Scheduling discovery call for Monday.', 'email', 'Jordan Lee')
on conflict (id) do nothing;

-- ============================================================
-- TASKS
-- ============================================================
insert into tasks (id, title, description, status, priority, partnership_id, assigned_to_email, due_date) values
  ('tk000000-0000-0000-0000-000000000001', 'Send content brief to Mia Chen', 'Prepare and send the Q2 content brief including talking points and visual guidelines', 'done', 'high', 'p1000000-0000-0000-0000-000000000001', 'alex@partneriq.example.com', '2026-03-15'),
  ('tk000000-0000-0000-0000-000000000002', 'Review contract for FreshBite deal', 'Legal review of exclusivity and payment terms', 'in_progress', 'urgent', 'p1000000-0000-0000-0000-000000000002', 'legal@partneriq.example.com', '2026-03-10'),
  ('tk000000-0000-0000-0000-000000000003', 'Follow up with StyleForward on usage rights', 'Get clarity on the usage rights clause before signing', 'todo', 'high', 'p1000000-0000-0000-0000-000000000003', 'morgan@partneriq.example.com', '2026-03-12'),
  ('tk000000-0000-0000-0000-000000000004', 'Schedule discovery call with Priya Sharma', 'Book 30-min discovery call to discuss FreshBite collaboration details', 'todo', 'medium', 'p1000000-0000-0000-0000-000000000007', 'jordan@partneriq.example.com', '2026-03-11')
on conflict (id) do nothing;

-- ============================================================
-- ACTIVITIES
-- ============================================================
insert into activities (id, type, description, entity_type, partnership_id, user_name) values
  ('ac000000-0000-0000-0000-000000000001', 'deal_created', 'New deal created: NovaTech × Mia Chen', 'partnership', 'p1000000-0000-0000-0000-000000000001', 'Alex Rivera'),
  ('ac000000-0000-0000-0000-000000000002', 'stage_change', 'Deal moved to Active: FreshBite × Aisha Patel', 'partnership', 'p1000000-0000-0000-0000-000000000002', 'Jordan Lee'),
  ('ac000000-0000-0000-0000-000000000003', 'note_added', 'New note added on StyleForward negotiation', 'partnership', 'p1000000-0000-0000-0000-000000000003', 'Morgan Chen'),
  ('ac000000-0000-0000-0000-000000000004', 'email_sent', 'Outreach email sent to GlowSkin', 'partnership', 'p1000000-0000-0000-0000-000000000004', 'Taylor Kim'),
  ('ac000000-0000-0000-0000-000000000005', 'creator_replied', 'Priya Sharma replied to outreach!', 'partnership', 'p1000000-0000-0000-0000-000000000007', 'Jordan Lee')
on conflict (id) do nothing;

-- ============================================================
-- RATE BENCHMARKS (11 rows — by tier with rate ranges)
-- ============================================================
insert into rate_benchmarks (platform, niche, tier, content_type, rate_min, rate_max, rate_median, source) values
  ('instagram', 'lifestyle', 'nano',      'post', 100,   500,    250,   'PartnerIQ 2026 Report'),
  ('instagram', 'lifestyle', 'micro',     'post', 500,   2000,   1100,  'PartnerIQ 2026 Report'),
  ('instagram', 'lifestyle', 'mid',       'post', 2000,  6000,   4000,  'PartnerIQ 2026 Report'),
  ('instagram', 'lifestyle', 'macro',     'post', 6000,  20000,  12000, 'PartnerIQ 2026 Report'),
  ('instagram', 'lifestyle', 'mega',      'post', 20000, 75000,  40000, 'PartnerIQ 2026 Report'),
  ('instagram', 'lifestyle', 'celebrity', 'post', 75000, 500000, 175000,'PartnerIQ 2026 Report'),
  ('instagram', 'beauty',    'micro',     'post', 600,   2500,   1300,  'PartnerIQ 2026 Report'),
  ('instagram', 'beauty',    'mid',       'post', 2500,  8000,   5000,  'PartnerIQ 2026 Report'),
  ('tiktok',    'fitness',   'macro',     'video',8000,  25000,  15000, 'PartnerIQ 2026 Report'),
  ('youtube',   'tech',      'mid',       'integration', 3000, 9000, 5500, 'PartnerIQ 2026 Report'),
  ('youtube',   'gaming',    'macro',     'integration', 7000, 20000,12000,'PartnerIQ 2026 Report')
on conflict (platform, niche, tier, content_type) do nothing;

-- ============================================================
-- PLATFORM MULTIPLIERS (8 rows — with CPM ranges and benchmarks)
-- ============================================================
insert into platform_multipliers (platform, base_multiplier, engagement_weight, reach_weight, notes) values
  ('instagram', 1.00, 0.60, 0.40, 'Baseline platform – CPM $5-$12, avg engagement 3-6%'),
  ('tiktok',    1.15, 0.75, 0.25, 'Viral potential – CPM $3-$8, avg engagement 6-12%'),
  ('youtube',   1.30, 0.40, 0.60, 'Long-form premium – CPM $8-$20, avg engagement 2-5%'),
  ('twitter',   0.70, 0.50, 0.50, 'Conversation-driven – CPM $2-$6, avg engagement 1-3%'),
  ('linkedin',  1.20, 0.60, 0.40, 'B2B premium – CPM $12-$30, avg engagement 2-4%'),
  ('twitch',    1.10, 0.80, 0.20, 'Live engagement – CPM $4-$10, avg engagement 8-15%'),
  ('facebook',  0.80, 0.50, 0.50, 'Broad reach, declining organic – CPM $3-$9, avg engagement 1-3%'),
  ('snapchat',  0.90, 0.65, 0.35, 'Gen Z ephemeral – CPM $4-$9, avg engagement 4-8%')
on conflict (platform) do nothing;

-- ============================================================
-- CATEGORY PREMIUMS (12 rows — with premium_multiplier and rationale)
-- ============================================================
insert into category_premiums (category, premium_percent, demand_level, notes) values
  ('tech',           20, 'high',      'Strong brand demand; product launch cycles drive premium rates'),
  ('beauty',         15, 'high',      'Beauty brands compete heavily for creator slots; visual-first content commands premium'),
  ('fitness',        18, 'very_high', 'Peak demand for fitness creators; wellness economy drives sustained investment'),
  ('gaming',         12, 'high',      'Growing segment; endemic + non-endemic brands increasingly activate in gaming'),
  ('food',           10, 'medium',    'Steady demand; CPG brands rely on recipe and taste-test content'),
  ('lifestyle',       8, 'medium',    'Broad category; lower premium due to supply but high volume of deals'),
  ('travel',          5, 'medium',    'Post-pandemic recovery strong; tourism boards and hospitality brands returning to creator budgets'),
  ('finance',        25, 'high',      'Regulated space; compliance requirements and high CLV justify top premiums'),
  ('education',      15, 'high',      'EdTech brands willing to pay premium for trust-based creator recommendations'),
  ('health',         22, 'high',      'Telehealth and wellness brands face compliance overhead, pay premium for credibility'),
  ('automotive',     18, 'medium',    'High ticket items; brands invest in long-form reviews and experiential content'),
  ('entertainment',  10, 'very_high', 'Studios and streaming services drive high volume seasonal campaigns')
on conflict (category) do nothing;

-- ============================================================
-- VIEWERSHIP TIERS
-- ============================================================
insert into viewership_tiers (name, platform, min_followers, max_followers, avg_engagement_rate, typical_rate_min, typical_rate_max, description) values
  ('Nano', 'instagram', 1000, 9999, 8.5, 50, 500, '1K–10K followers, hyper-engaged niche communities'),
  ('Micro', 'instagram', 10000, 99999, 6.2, 500, 3000, '10K–100K followers, strong community trust'),
  ('Mid', 'instagram', 100000, 499999, 4.1, 3000, 10000, '100K–500K, established creators with diverse reach'),
  ('Macro', 'instagram', 500000, 999999, 3.2, 10000, 30000, '500K–1M, wide reach with brand credibility'),
  ('Mega', 'instagram', 1000000, 4999999, 2.8, 30000, 100000, '1M–5M, celebrity-adjacent mass reach'),
  ('Celebrity', 'instagram', 5000000, NULL, 1.9, 100000, 500000, '5M+, mass market cultural influence'),
  ('Nano', 'tiktok', 1000, 9999, 12.0, 100, 800, '1K–10K on TikTok, viral potential'),
  ('Micro', 'tiktok', 10000, 99999, 9.5, 800, 4000, '10K–100K TikTok creators'),
  ('Mid', 'tiktok', 100000, 499999, 7.2, 4000, 15000, '100K–500K TikTok reach'),
  ('Macro', 'tiktok', 500000, 999999, 5.8, 15000, 40000, '500K–1M TikTok influence')
on conflict do nothing;

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================
insert into subscription_plans (name, tier, user_type, price_monthly, price_annual, features, limits) values
  ('Free', 'free', 'brand', 0, 0, '["5 talent searches/month","1 active partnership","Basic analytics"]', '{"searches": 5, "partnerships": 1, "team_members": 1}'),
  ('Starter', 'starter', 'brand', 49, 470, '["50 talent searches/month","10 active partnerships","AI match engine","Email outreach"]', '{"searches": 50, "partnerships": 10, "team_members": 3}'),
  ('Pro', 'pro', 'brand', 149, 1430, '["Unlimited searches","50 partnerships","Advanced AI","Custom sequences","Analytics dashboard"]', '{"searches": 999999, "partnerships": 50, "team_members": 10}'),
  ('Enterprise', 'enterprise', 'brand', 399, 3830, '["Everything in Pro","Unlimited partnerships","Dedicated success manager","API access","Custom reporting"]', '{"searches": 999999, "partnerships": 999999, "team_members": 999999}'),
  ('Free', 'free', 'talent', 0, 0, '["Browse opportunities","Basic profile","Apply to 3 opportunities/month"]', '{"applications": 3}'),
  ('Creator', 'creator', 'talent', 29, 278, '["Unlimited applications","Enhanced profile","Analytics","Deal pipeline"]', '{"applications": 999999}'),
  ('Pro Creator', 'pro', 'talent', 79, 758, '["Everything in Creator","AI pitch writer","Rate benchmarks","Priority listing"]', '{"applications": 999999}'),
  ('Agency Starter', 'starter', 'agency', 199, 1910, '["25 talent roster","20 brand partnerships","Team of 5","Reporting"]', '{"talent_roster": 25, "partnerships": 20, "team_members": 5}'),
  ('Agency Pro', 'agency_pro', 'agency', 499, 4790, '["Unlimited roster","Unlimited partnerships","Unlimited team","White-label","API"]', '{"talent_roster": 999999, "partnerships": 999999, "team_members": 999999}')
on conflict do nothing;

-- ============================================================
-- CULTURE EVENTS (27 rows — Full 2026-2027 calendar)
-- ============================================================
insert into culture_events (name, description, date, type, region, target_demographics) values
  ('Super Bowl LX',                'NFL championship and biggest annual advertising event',                '2026-02-08', 'sports',              'USA',    array['Sports fans','18-49','Mass market','Millennials','Gen Z']),
  ('Black History Month',          'Annual recognition of Black history and culture',                       '2026-02-01', 'cultural_observance', 'USA',    array['18-35','Black American community','Gen Z','Millennials']),
  ('Lunar New Year',               'Celebration of the Lunar New Year across Asian cultures',               '2026-02-17', 'cultural_observance', 'Global', array['Asian diaspora','AAPI community','All ages','Families']),
  ('Ramadan',                      'Holy month of fasting, prayer and community for Muslims worldwide',     '2026-02-18', 'religious_holiday',   'Global', array['Muslim community','MENA diaspora','All ages']),
  ('March Madness',                'NCAA Division I basketball tournament — peak sports engagement window',  '2026-03-17', 'sports',              'USA',    array['Sports fans','18-34','College students','Millennials']),
  ('International Womens Day',     'Global celebration of women achievements and gender equality',          '2026-03-08', 'cultural_observance', 'Global', array['Women','Allies','Gen Z','Millennials','All ages']),
  ('Earth Day',                    'Annual event promoting environmental protection and sustainability',    '2026-04-22', 'cultural_observance', 'Global', array['Eco-conscious','Gen Z','Millennials','Families']),
  ('AAPI Heritage Month',          'Celebrating Asian American and Pacific Islander history and culture',   '2026-05-01', 'cultural_observance', 'USA',    array['AAPI community','Asian diaspora','All ages']),
  ('Mental Health Awareness Month','Raising awareness for mental health education and advocacy',            '2026-05-01', 'awareness',           'Global', array['Gen Z','Millennials','Wellness community','All ages']),
  ('Memorial Day',                 'US federal holiday honoring military service members',                  '2026-05-25', 'national_holiday',    'USA',    array['Mass market','Families','Patriotic community']),
  ('Pride Month',                  'LGBTQ+ celebration, advocacy and visibility month',                    '2026-06-01', 'cultural_observance', 'Global', array['LGBTQ+','Allies','Gen Z','Millennials']),
  ('Juneteenth',                   'Commemoration of the end of slavery in the United States',             '2026-06-19', 'cultural_observance', 'USA',    array['Black American community','All ages','Gen Z','Millennials']),
  ('Fourth of July',               'US Independence Day celebrations',                                     '2026-07-04', 'national_holiday',    'USA',    array['Mass market','Families','All ages']),
  ('NBA Finals',                   'NBA championship series — peak basketball engagement',                  '2026-06-10', 'sports',              'Global', array['Sports fans','18-34','Urban','Sneaker culture']),
  ('Back to School',               'Annual back-to-school shopping and preparation season',                '2026-08-15', 'seasonal',            'USA',    array['Students','Parents','Teachers','Teens']),
  ('Hispanic Heritage Month',      'Celebration of Hispanic and Latino American culture and contributions', '2026-09-15', 'cultural_observance', 'USA',    array['Hispanic/Latino community','Spanish speakers','All ages']),
  ('World Cup Qualifiers',         'FIFA World Cup 2026 qualifying matches — building global excitement',   '2026-09-01', 'sports',              'Global', array['Soccer fans','18-45','Global audience','Multicultural']),
  ('Halloween',                    'Annual costume, horror and fall celebration',                           '2026-10-31', 'seasonal',            'USA',    array['Gen Z','Millennials','Families','Teens','Cosplay community']),
  ('Diwali',                       'Hindu festival of lights celebrated globally',                          '2026-10-20', 'religious_holiday',   'Global', array['South Asian diaspora','Hindu community','Families','All ages']),
  ('Veterans Day',                 'Honoring military veterans in the United States',                       '2026-11-11', 'national_holiday',    'USA',    array['Mass market','Military community','Families']),
  ('Thanksgiving',                 'US holiday for gratitude, family and food',                             '2026-11-26', 'national_holiday',    'USA',    array['Mass market','Families','Food community','All ages']),
  ('Black Friday / Cyber Monday',  'Largest annual shopping event — peak brand activation window',          '2026-11-27', 'commercial',          'Global', array['Shoppers','18-45','Deal seekers','Mass market']),
  ('Christmas / Holiday Season',   'Global holiday season — gifting, family and year-end celebrations',     '2026-12-25', 'religious_holiday',   'Global', array['Mass market','Families','All ages','Gift buyers']),
  ('New Years Eve / Day',          'Year-end celebration and new year resolutions season',                  '2026-12-31', 'seasonal',            'Global', array['Mass market','All ages','Wellness community','Party-goers']),
  ('MLK Day 2027',                 'Honoring Martin Luther King Jr. and the civil rights movement',         '2027-01-18', 'cultural_observance', 'USA',    array['All ages','Black American community','Social justice']),
  ('Valentines Day 2027',          'Celebration of love and relationships — key gifting and brand moment',   '2027-02-14', 'seasonal',            'Global', array['Couples','18-35','Gift buyers','Millennials','Gen Z']),
  ('Womens History Month 2027',    'Celebrating the contributions and achievements of women',               '2027-03-01', 'cultural_observance', 'Global', array['Women','Allies','Gen Z','Millennials','All ages'])
on conflict do nothing;

-- ============================================================
-- MEGA EVENTS (10 rows — tentpole global events)
-- ============================================================
insert into mega_events (name, description, start_date, end_date, location, expected_attendance, category, sponsorship_tiers) values
  ('FIFA World Cup 2026',     'First tri-nation World Cup — USA, Mexico, Canada — largest sporting event globally',  '2026-06-11', '2026-07-19', 'USA / Mexico / Canada', 5400000, 'sports',        '{"title": 500000, "official": 250000, "regional": 100000, "activation": 50000}'::jsonb),
  ('Olympics 2028 (LA)',       'Summer Olympic Games in Los Angeles — early brand activation planning window',         '2028-07-14', '2028-07-30', 'Los Angeles, CA',       4000000, 'sports',        '{"title": 1000000, "official": 500000, "partner": 200000, "supplier": 75000}'::jsonb),
  ('Coachella 2026',           'Premier music and arts festival in the California desert',                            '2026-04-10', '2026-04-19', 'Indio, CA',             250000,  'music',         '{"headline": 300000, "stage": 150000, "brand_house": 75000, "activation": 25000}'::jsonb),
  ('SXSW 2026',               'South by Southwest — converging tech, film and music conference',                      '2026-03-13', '2026-03-22', 'Austin, TX',            300000,  'tech_culture',  '{"platinum": 200000, "gold": 100000, "brand_house": 50000, "panel": 15000}'::jsonb),
  ('ComplexCon 2026',          'Culture, fashion, music and sneaker convention by Complex Networks',                   '2026-11-07', '2026-11-08', 'Long Beach, CA',        60000,   'culture',       '{"title": 150000, "booth": 50000, "activation": 20000, "panel": 10000}'::jsonb),
  ('Met Gala 2026',            'Annual fundraising gala for the Metropolitan Museum of Art Costume Institute',         '2026-05-04', '2026-05-04', 'New York, NY',          700,     'fashion',       '{"table": 300000, "ticket": 75000}'::jsonb),
  ('Grammy Awards 2026',       'Annual music industry awards ceremony recognizing outstanding achievements',           '2026-02-01', '2026-02-01', 'Los Angeles, CA',       18000,   'music',         '{"presenting": 500000, "commercial": 250000, "digital": 100000}'::jsonb),
  ('VidCon 2026',              'Largest global creator economy convention connecting creators, fans and brands',       '2026-06-25', '2026-06-28', 'Anaheim, CA',           75000,   'creator_economy','{"title": 200000, "industry": 50000, "booth": 15000, "featured_creator": 5000}'::jsonb),
  ('New York Fashion Week',    'Bi-annual fashion event showcasing designer collections',                             '2026-09-09', '2026-09-14', 'New York, NY',          200000,  'fashion',       '{"front_row": 100000, "show": 50000, "digital": 25000}'::jsonb),
  ('Art Basel Miami 2026',     'International art fair combining contemporary art, culture and luxury brands',         '2026-12-03', '2026-12-07', 'Miami Beach, FL',       83000,   'art_culture',   '{"title": 250000, "booth": 80000, "activation": 30000, "satellite": 10000}'::jsonb)
on conflict do nothing;

-- ============================================================
-- CONFERENCES (10 rows — creator economy and marketing conferences)
-- ============================================================
insert into conferences (name, description, date, location, industry, expected_attendees, sponsorship_available, sponsorship_cost) values
  ('VidSummit 2026',               'Premier creator economy and YouTube growth conference',                '2026-09-20', 'Dallas, TX',        'Creator Economy',       3000,  true,  25000),
  ('Social Media Marketing World',  'Leading social media marketing conference and networking event',       '2026-03-15', 'San Diego, CA',     'Marketing',             5000,  true,  35000),
  ('CES 2026',                     'Consumer Electronics Show — worlds largest consumer tech exhibition',   '2026-01-06', 'Las Vegas, NV',     'Technology',            115000,true,  80000),
  ('Cannes Lions 2026',            'International Festival of Creativity — global advertising awards',      '2026-06-15', 'Cannes, France',    'Advertising',           12000, true,  60000),
  ('TwitchCon 2026',               'Official Twitch community convention for streamers and fans',           '2026-09-26', 'San Diego, CA',     'Gaming / Streaming',    35000, true,  40000),
  ('Advertising Week NY',          'Thought leadership summit for advertising, marketing and tech',         '2026-10-13', 'New York, NY',      'Advertising',           20000, true,  45000),
  ('Influencer Marketing Show',    'Dedicated conference for the influencer marketing industry',            '2026-05-10', 'New York, NY',      'Influencer Marketing',  1500,  true,  15000),
  ('Creator Economy Expo',         'Conference focused on the business of content creation',                '2026-05-04', 'Cleveland, OH',     'Creator Economy',       2500,  true,  20000),
  ('Brand Innovation Summit',      'Brand partnership and innovation strategy conference',                  '2026-07-22', 'Chicago, IL',       'Brand Marketing',       2000,  true,  20000),
  ('SMMW Creators Track',          'Dedicated creator monetisation track at Social Media Marketing World',  '2026-03-16', 'San Diego, CA',     'Creator Economy',       1200,  true,  12000)
on conflict do nothing;

-- ============================================================
-- DEMOGRAPHIC SEGMENTS (8 rows — with population, buying power, media preferences, activation tips)
-- ============================================================
insert into demographic_segments (name, description, age_range, gender, income_range, interests, platforms, size_estimate) values
  ('Gen Z Trendsetters',     'Fashion and culture-forward Gen Z digital natives. High social influence, low brand loyalty, values-driven purchasing. Buying power $360B. Best activated via short-form video, memes and co-creation campaigns.',                   '18-26', 'all',         '$25K-$50K',  array['fashion','music','gaming','social justice','sustainability'],                 array['tiktok','instagram','youtube','snapchat'],    68000000),
  ('Millennial Parents',     'Millennial parents balancing family, career and personal identity. High research intent, trust peer recommendations. Buying power $2.5T. Activate via relatable parenting content and family-friendly product integrations.',         '30-40', 'all',         '$75K-$125K', array['parenting','home','health','finance','education'],                           array['instagram','facebook','youtube','pinterest'],  45000000),
  ('Fitness Enthusiasts',    'Dedicated health and fitness consumers across gym, outdoor and wellness. Highly engaged and brand-loyal. Buying power $1.2T. Activate via workout challenges, transformation content and supplement/gear reviews.',                   '22-38', 'all',         '$50K-$100K', array['fitness','nutrition','wellness','sports','outdoor'],                         array['instagram','tiktok','youtube'],                32000000),
  ('Tech Early Adopters',    'Technology enthusiasts who adopt new products before mainstream. High disposable income, trust detailed reviews. Buying power $800B. Activate via unboxing, comparison videos and hands-on demo content.',                             '25-45', 'male_skew',   '$80K-$150K', array['technology','gaming','productivity','AI','gadgets'],                         array['youtube','twitter','linkedin','reddit'],       18000000),
  ('Beauty Conscious',       'Beauty and personal care focused consumers spanning skincare, makeup and self-care. Highly visual, tutorial-driven. Buying power $580B. Activate via GRWM content, product reviews and routine-based formats.',                       '16-35', 'female_skew', '$30K-$75K',  array['beauty','skincare','fashion','wellness','self-care'],                        array['instagram','tiktok','youtube'],                55000000),
  ('Gen Alpha Influence',    'Parents purchasing on behalf of Gen Alpha children (born 2010-2025). Kids influence $500B+ in family spending. Activate via family-friendly unboxing, educational content and toy/game reviews on YouTube Kids and TikTok.',           '0-15',  'all',         'N/A',        array['toys','gaming','education','entertainment','kids content'],                  array['youtube','tiktok','roblox'],                   48000000),
  ('Affluent Professionals', 'High-income professionals aged 35-55 with strong discretionary spending. Buying power $3.4T. Value expertise and quality over trends. Activate via thought-leadership content, LinkedIn posts and premium product reviews.',          '35-55', 'all',         '$150K+',     array['finance','luxury','travel','business','wellness'],                           array['linkedin','youtube','instagram','twitter'],    22000000),
  ('Multicultural Gen Z',    'Hispanic, Black, AAPI and multicultural Gen Z consumers shaping culture. Over-index on content creation and social commerce. Buying power $600B+. Activate via culturally authentic storytelling, bilingual content and community-first campaigns.', '18-28', 'all', '$25K-$60K',  array['music','fashion','food','culture','social justice','gaming'],                array['tiktok','instagram','youtube','snapchat'],     42000000)
on conflict do nothing;

-- ============================================================
-- ROI BENCHMARKS (10 rows — by deal type with median/top/bottom quartile ROI)
-- ============================================================
insert into roi_benchmarks (industry, channel, avg_roi, median_roi, top_quartile_roi, time_to_roi_days, sample_size, as_of_date) values
  ('Beauty & Personal Care',   'instagram',  5.2, 4.8, 8.5,  30, 420, '2026-01-01'),
  ('Fashion & Apparel',        'instagram',  4.1, 3.6, 7.2,  45, 380, '2026-01-01'),
  ('Food & Beverage',          'tiktok',     6.8, 6.0, 11.0, 21, 290, '2026-01-01'),
  ('Technology',               'youtube',    3.5, 3.0, 6.4,  60, 310, '2026-01-01'),
  ('Sports & Fitness',         'instagram',  5.8, 5.2, 9.1,  28, 265, '2026-01-01'),
  ('Gaming',                   'twitch',     4.5, 4.0, 7.8,  14, 180, '2026-01-01'),
  ('Health & Wellness',        'youtube',    4.2, 3.8, 7.0,  45, 150, '2026-01-01'),
  ('Finance & Fintech',        'linkedin',   3.8, 3.2, 6.5,  90, 120, '2026-01-01'),
  ('Entertainment & Media',    'tiktok',     7.5, 6.8, 12.5, 14, 340, '2026-01-01'),
  ('Travel & Hospitality',     'instagram',  3.2, 2.8, 5.5,  60, 200, '2026-01-01')
on conflict do nothing;

-- ============================================================
-- INDUSTRY GUIDES (8 rows — with sector, best demographics, detailed best practices)
-- ============================================================
insert into industry_guides (title, industry, summary, content, best_practices, key_metrics, case_studies, published) values
  (
    'Beauty & Skincare Creator Partnerships',
    'Beauty & Personal Care',
    'Comprehensive guide to running beauty creator campaigns with best-in-class ROI.',
    'The beauty industry leads in influencer marketing spend. Successful campaigns pair authentic product use with tutorial-based content. Micro and mid-tier creators drive the highest engagement-to-conversion ratios. Best demographics: Women 18-35, Beauty Conscious segment.',
    array['Prioritise GRWM and routine-format content over scripted ads','Partner with creators who already use similar products organically','Allow 4-6 weeks for seeding before launch','Offer affiliate codes alongside flat fees for measurable ROI','Leverage TikTok for discovery and Instagram for conversion'],
    '{"avg_engagement_rate": 5.8, "avg_cpm": 8.5, "best_platforms": ["instagram","tiktok","youtube"], "best_demographics": ["Beauty Conscious","Gen Z Trendsetters","Multicultural Gen Z"]}'::jsonb,
    '[{"brand": "GlowSkin","result": "4.8x ROI from micro-creator seeding campaign","format": "instagram_reels"},{"brand": "Fenty Beauty","result": "12M impressions from TikTok GRWM series","format": "tiktok_video"}]'::jsonb,
    true
  ),
  (
    'Tech Product Launch Playbook',
    'Technology',
    'How to launch tech products through creator partnerships — from unboxing to long-term ambassadorships.',
    'Tech brands see highest ROI with YouTube integrations and detailed review content. Trust is paramount — creators must genuinely evaluate products. Best demographics: Tech Early Adopters, Affluent Professionals.',
    array['Invest in long-form YouTube reviews over short social posts','Provide early exclusive access to build creator excitement','Use comparison and versus content to leverage competitive positioning','Run campaigns around CES, product launch cycles and back-to-school','Include data-driven talking points creators can reference authentically'],
    '{"avg_engagement_rate": 4.2, "avg_cpm": 12.0, "best_platforms": ["youtube","twitter","linkedin"], "best_demographics": ["Tech Early Adopters","Affluent Professionals","Gen Z Trendsetters"]}'::jsonb,
    '[{"brand": "NovaTech","result": "3.5x ROI from YouTube review series with mid-tier tech creators","format": "youtube_integration"},{"brand": "Samsung","result": "Sold out launch day via coordinated unboxing campaign","format": "youtube_unboxing"}]'::jsonb,
    true
  ),
  (
    'Fitness & Wellness Brand Guide',
    'Sports & Fitness',
    'Activating fitness creators for equipment, apparel, and supplement brands.',
    'Fitness creators command high trust and engagement. Challenge-based campaigns drive participation and UGC. Best demographics: Fitness Enthusiasts, Millennial Parents (wellness crossover).',
    array['Run 30-day challenge campaigns for maximum participation and UGC','Partner with certified trainers for credibility in supplement categories','Use Instagram Reels and TikTok for quick workout content','Invest in ambassador programs over one-off posts for sustained impact','Time campaigns around New Year resolutions and summer prep seasons'],
    '{"avg_engagement_rate": 7.5, "avg_cpm": 6.5, "best_platforms": ["instagram","tiktok","youtube"], "best_demographics": ["Fitness Enthusiasts","Gen Z Trendsetters","Millennial Parents"]}'::jsonb,
    '[{"brand": "PeakFit","result": "5.8x ROI from 30-day challenge with macro fitness creators","format": "instagram_reels"},{"brand": "Gymshark","result": "Community-first ambassador model drives $500M+ annual revenue","format": "multi_platform"}]'::jsonb,
    true
  ),
  (
    'Food & Beverage Creator Strategy',
    'Food & Beverage',
    'Building appetite appeal through food creators — from recipe integrations to taste tests.',
    'Food content performs exceptionally on TikTok and Instagram. Authentic recipe integrations outperform scripted ads by 3x. Micro creators in food deliver the highest engagement rates across all verticals. Best demographics: Millennial Parents, Fitness Enthusiasts, Multicultural Gen Z.',
    array['Use recipe integration format rather than product-only showcases','Partner with micro food bloggers for highest engagement-to-cost ratio','Leverage TikTok recipe trends and sounds for discoverability','Run seasonal campaigns tied to holidays and cultural food moments','Provide products for genuine kitchen testing — do not script reactions'],
    '{"avg_engagement_rate": 8.2, "avg_cpm": 5.0, "best_platforms": ["tiktok","instagram","youtube"], "best_demographics": ["Millennial Parents","Fitness Enthusiasts","Multicultural Gen Z"]}'::jsonb,
    '[{"brand": "FreshBite Foods","result": "6.8x ROI from TikTok recipe series","format": "tiktok_video"},{"brand": "HelloFresh","result": "22% lift in trial sign-ups from creator meal prep content","format": "youtube_integration"}]'::jsonb,
    true
  ),
  (
    'Fashion & Apparel Partnership Guide',
    'Fashion & Apparel',
    'Driving brand relevance and sales through fashion creator collaborations.',
    'Fashion thrives on visual platforms. Haul, try-on and styling content converts at the highest rates. Diversity in creator selection directly correlates with campaign reach. Best demographics: Gen Z Trendsetters, Beauty Conscious, Multicultural Gen Z.',
    array['Invest in try-on haul and styling content over static product shots','Cast diverse creators to maximise reach across demographics','Time campaigns around fashion weeks and seasonal collection drops','Offer exclusive early-access or limited-edition drops through creators','Enable social commerce with shoppable links and affiliate tracking'],
    '{"avg_engagement_rate": 5.5, "avg_cpm": 7.0, "best_platforms": ["instagram","tiktok","youtube"], "best_demographics": ["Gen Z Trendsetters","Beauty Conscious","Multicultural Gen Z"]}'::jsonb,
    '[{"brand": "StyleForward","result": "4.1x ROI on fall collection influencer campaign","format": "instagram_reels"},{"brand": "SHEIN","result": "Haul content drives 40% of new customer acquisition","format": "tiktok_video"}]'::jsonb,
    true
  ),
  (
    'Gaming & Esports Activation Guide',
    'Gaming',
    'Engaging gaming creators for endemic and non-endemic brand partnerships.',
    'Gaming creators offer unmatched live engagement on Twitch and YouTube. Non-endemic brands are increasingly investing in gaming as the audience matures. Best demographics: Tech Early Adopters, Gen Z Trendsetters.',
    array['Use Twitch integrations and live stream sponsorships for real-time engagement','Invest in YouTube gaming for evergreen content with long tail views','Non-endemic brands should lead with creator authenticity not product placement','Run campaigns around major game launches and esports tournaments','Enable creator codes and in-game items as measurable conversion drivers'],
    '{"avg_engagement_rate": 9.0, "avg_cpm": 5.5, "best_platforms": ["twitch","youtube","tiktok"], "best_demographics": ["Tech Early Adopters","Gen Z Trendsetters","Gen Alpha Influence"]}'::jsonb,
    '[{"brand": "NovaTech","result": "4.5x ROI from Twitch gaming peripheral streams","format": "twitch_stream"},{"brand": "Red Bull","result": "120M impressions from esports tournament creator coverage","format": "youtube_live"}]'::jsonb,
    true
  ),
  (
    'Finance & Fintech Creator Compliance Guide',
    'Finance & Fintech',
    'Navigating compliance while building trust through financial creator content.',
    'Finance content requires careful compliance navigation but delivers high CLV. Long-form educational content on YouTube and LinkedIn performs best. Creators must disclose partnerships clearly and avoid investment advice. Best demographics: Affluent Professionals, Tech Early Adopters, Millennial Parents.',
    array['Work with creators who have demonstrated financial literacy','Ensure all content passes compliance review before publishing','Favour educational explainer content over promotional messaging','Use LinkedIn alongside YouTube for B2B fintech products','Provide clear disclosure templates and approved talking points'],
    '{"avg_engagement_rate": 3.8, "avg_cpm": 18.0, "best_platforms": ["youtube","linkedin","twitter"], "best_demographics": ["Affluent Professionals","Tech Early Adopters","Millennial Parents"]}'::jsonb,
    '[{"brand": "Robinhood","result": "3.8x ROI from YouTube financial education series","format": "youtube_integration"},{"brand": "Wise","result": "25% reduction in CAC through fintech creator referral codes","format": "youtube_sponsored"}]'::jsonb,
    true
  ),
  (
    'Travel & Hospitality Creator Playbook',
    'Travel & Hospitality',
    'Inspiring wanderlust and driving bookings through travel creator content.',
    'Travel content has strong long-tail value — destination videos and guides continue to drive bookings months after publication. Instagram and YouTube are the primary platforms. Best demographics: Affluent Professionals, Millennial Parents, Gen Z Trendsetters.',
    array['Invest in YouTube destination guides for long-tail search value','Use Instagram Reels for aspirational visual-first destination content','Partner with creators for hosted trips with clear deliverable expectations','Time campaigns around booking windows: January, spring break and summer','Enable booking links with tracked attribution for measurable ROI'],
    '{"avg_engagement_rate": 4.5, "avg_cpm": 9.0, "best_platforms": ["instagram","youtube","tiktok"], "best_demographics": ["Affluent Professionals","Millennial Parents","Gen Z Trendsetters"]}'::jsonb,
    '[{"brand": "Marriott","result": "3.2x ROI from YouTube travel vlog series","format": "youtube_vlog"},{"brand": "Airbnb","result": "18% lift in bookings from Instagram creator stay campaigns","format": "instagram_stories"}]'::jsonb,
    true
  )
on conflict do nothing;
