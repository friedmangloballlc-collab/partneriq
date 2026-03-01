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
-- RATE BENCHMARKS
-- ============================================================
insert into rate_benchmarks (platform, niche, tier, content_type, rate_min, rate_max, rate_median, source) values
  ('instagram', 'lifestyle', 'micro', 'post', 500, 2000, 1100, 'PartnerIQ 2025 Report'),
  ('instagram', 'lifestyle', 'mid', 'post', 2000, 6000, 4000, 'PartnerIQ 2025 Report'),
  ('instagram', 'lifestyle', 'macro', 'post', 6000, 20000, 12000, 'PartnerIQ 2025 Report'),
  ('instagram', 'beauty', 'micro', 'post', 600, 2500, 1300, 'PartnerIQ 2025 Report'),
  ('instagram', 'beauty', 'mid', 'post', 2500, 8000, 5000, 'PartnerIQ 2025 Report'),
  ('tiktok', 'fitness', 'macro', 'video', 8000, 25000, 15000, 'PartnerIQ 2025 Report'),
  ('youtube', 'tech', 'mid', 'integration', 3000, 9000, 5500, 'PartnerIQ 2025 Report'),
  ('youtube', 'gaming', 'macro', 'integration', 7000, 20000, 12000, 'PartnerIQ 2025 Report')
on conflict (platform, niche, tier, content_type) do nothing;

-- ============================================================
-- PLATFORM MULTIPLIERS
-- ============================================================
insert into platform_multipliers (platform, base_multiplier, engagement_weight, reach_weight, notes) values
  ('instagram', 1.0, 0.6, 0.4, 'Baseline platform'),
  ('tiktok', 1.15, 0.75, 0.25, 'Higher engagement weight due to viral potential'),
  ('youtube', 1.3, 0.4, 0.6, 'Long-form premium'),
  ('twitter', 0.7, 0.5, 0.5, 'Lower monetization rates'),
  ('linkedin', 1.2, 0.6, 0.4, 'B2B premium'),
  ('twitch', 1.1, 0.8, 0.2, 'High engagement live platform')
on conflict (platform) do nothing;

-- ============================================================
-- CATEGORY PREMIUMS
-- ============================================================
insert into category_premiums (category, premium_percent, demand_level, notes) values
  ('tech', 20, 'high', 'Strong brand demand in tech category'),
  ('beauty', 15, 'high', 'Beauty brands compete heavily for creators'),
  ('fitness', 18, 'very_high', 'Peak demand for fitness creators post-2020'),
  ('gaming', 12, 'high', 'Growing segment, strong brand interest'),
  ('food', 10, 'medium', 'Steady demand, moderate premium'),
  ('lifestyle', 8, 'medium', 'Broad category, lower premium'),
  ('travel', 5, 'medium', 'Recovering post-pandemic'),
  ('finance', 25, 'high', 'Regulated space, higher creative premium'),
  ('education', 15, 'high', 'EdTech brands willing to pay premium')
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
-- CULTURE EVENTS
-- ============================================================
insert into culture_events (name, description, date, type, region, target_demographics) values
  ('Black History Month', 'Annual recognition of Black history and culture', '2026-02-01', 'cultural_observance', 'USA', array['18-35','Black American community','Gen Z','Millennials']),
  ('Ramadan', 'Holy month of fasting and community for Muslims', '2026-03-01', 'religious_holiday', 'Global', array['Muslim community','MENA diaspora','All ages']),
  ('Pride Month', 'LGBTQ+ celebration and advocacy', '2026-06-01', 'cultural_observance', 'Global', array['LGBTQ+','Allies','Gen Z','Millennials']),
  ('Back to School', 'Annual back-to-school season', '2026-08-15', 'seasonal', 'USA', array['Students','Parents','Teachers','Teens']),
  ('Hispanic Heritage Month', 'Celebration of Hispanic and Latino culture', '2026-09-15', 'cultural_observance', 'USA', array['Hispanic/Latino community','Spanish speakers','All ages'])
on conflict do nothing;

-- ============================================================
-- CONFERENCES
-- ============================================================
insert into conferences (name, description, date, location, industry, expected_attendees, sponsorship_available, sponsorship_cost) values
  ('VidSummit 2026', 'Premier creator economy conference', '2026-09-20', 'Dallas, TX', 'Creator Economy', 3000, true, 25000),
  ('Social Media Marketing World', 'Leading social media marketing conference', '2026-03-15', 'San Diego, CA', 'Marketing', 5000, true, 35000),
  ('Influencer Marketing Summit', 'Top influencer marketing event', '2026-05-10', 'New York, NY', 'Influencer Marketing', 1500, true, 15000),
  ('Brand Innovation Summit', 'Brand partnership and innovation conference', '2026-07-22', 'Chicago, IL', 'Brand Marketing', 2000, true, 20000)
on conflict do nothing;

-- ============================================================
-- DEMOGRAPHIC SEGMENTS
-- ============================================================
insert into demographic_segments (name, description, age_range, gender, income_range, interests, platforms, size_estimate) values
  ('Gen Z Trendsetters', 'Fashion and culture-forward Gen Z consumers', '18-26', 'all', '$25K-$50K', array['fashion','music','gaming','social justice'], array['tiktok','instagram','youtube'], 68000000),
  ('Millennial Parents', 'Millennial parents balancing family and career', '30-40', 'all', '$75K-$125K', array['parenting','home','health','finance'], array['instagram','facebook','youtube'], 45000000),
  ('Fitness Enthusiasts', 'Dedicated health and fitness consumers', '22-38', 'all', '$50K-$100K', array['fitness','nutrition','wellness','sports'], array['instagram','tiktok','youtube'], 32000000),
  ('Tech Early Adopters', 'Technology enthusiasts who adopt new products early', '25-45', 'male_skew', '$80K-$150K', array['technology','gaming','productivity','AI'], array['youtube','twitter','linkedin'], 18000000),
  ('Beauty Conscious', 'Beauty and personal care focused consumers', '16-35', 'female_skew', '$30K-$75K', array['beauty','skincare','fashion','wellness'], array['instagram','tiktok','youtube'], 55000000)
on conflict do nothing;
