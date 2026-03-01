-- PartnerIQ Seed Data
-- Run this after schema.sql to populate demo data

-- ============================================================
-- BRANDS
-- ============================================================
insert into brands (id, name, industry, company_size, annual_budget, preferred_niches) values
  ('b0000001-0000-0000-0000-000000000001', 'Nike', 'Sports & Apparel', 'enterprise', 5000000, '{"fitness","sports","lifestyle"}'),
  ('b0000001-0000-0000-0000-000000000002', 'Glossier', 'Beauty & Cosmetics', 'mid-market', 2000000, '{"beauty","skincare","lifestyle"}'),
  ('b0000001-0000-0000-0000-000000000003', 'Spotify', 'Technology', 'enterprise', 3000000, '{"music","tech","entertainment"}'),
  ('b0000001-0000-0000-0000-000000000004', 'Notion', 'SaaS / Productivity', 'mid-market', 1500000, '{"tech","productivity","education"}'),
  ('b0000001-0000-0000-0000-000000000005', 'Patagonia', 'Outdoor & Sustainability', 'mid-market', 1200000, '{"outdoor","sustainability","travel"}');

-- ============================================================
-- TALENTS
-- ============================================================
insert into talents (id, name, email, primary_platform, niche, tier, location, bio, total_followers, engagement_rate, brand_safety_score, rate_per_post, trajectory, discovery_alpha_score) values
  ('t0000001-0000-0000-0000-000000000001', 'Alex Rivera', 'alex@example.com', 'instagram', 'fitness', 'macro', 'Los Angeles, CA', 'Fitness coach & content creator helping millions get stronger.', 850000, 4.2, 92, 5000, 'rising', 87),
  ('t0000001-0000-0000-0000-000000000002', 'Maya Chen', 'maya@example.com', 'tiktok', 'beauty', 'mega', 'New York, NY', 'Beauty guru specializing in skincare routines and product reviews.', 2400000, 6.1, 95, 12000, 'stable', 91),
  ('t0000001-0000-0000-0000-000000000003', 'Jordan Taylor', 'jordan@example.com', 'youtube', 'tech', 'mid', 'Austin, TX', 'Tech reviewer and productivity enthusiast.', 320000, 3.8, 88, 2500, 'rising', 78),
  ('t0000001-0000-0000-0000-000000000004', 'Sofia Martinez', 'sofia@example.com', 'instagram', 'travel', 'macro', 'Miami, FL', 'Travel photographer capturing the world''s hidden gems.', 720000, 5.5, 90, 4500, 'rising', 85),
  ('t0000001-0000-0000-0000-000000000005', 'Kai Nakamura', 'kai@example.com', 'tiktok', 'food', 'mid', 'San Francisco, CA', 'Japanese-American chef bringing fusion recipes to the masses.', 450000, 7.2, 94, 3000, 'rising', 82),
  ('t0000001-0000-0000-0000-000000000006', 'Priya Sharma', 'priya@example.com', 'youtube', 'education', 'micro', 'Seattle, WA', 'Making complex topics simple. Former Google engineer turned educator.', 95000, 8.1, 97, 1200, 'rising', 76),
  ('t0000001-0000-0000-0000-000000000007', 'Marcus Johnson', 'marcus@example.com', 'instagram', 'lifestyle', 'macro', 'Chicago, IL', 'Lifestyle and fashion influencer with a focus on sustainability.', 610000, 3.9, 86, 4000, 'stable', 80),
  ('t0000001-0000-0000-0000-000000000008', 'Emma Wilson', 'emma@example.com', 'tiktok', 'gaming', 'mid', 'Portland, OR', 'Retro gaming enthusiast and indie game reviewer.', 280000, 9.3, 91, 2000, 'rising', 74);

-- ============================================================
-- PARTNERSHIPS
-- ============================================================
insert into partnerships (id, title, brand_name, talent_name, deal_value, status, match_score, partnership_type, priority) values
  ('p0000001-0000-0000-0000-000000000001', 'Nike × Alex Rivera - Summer Campaign', 'Nike', 'Alex Rivera', 25000, 'active', 94, 'sponsored_content', 'high'),
  ('p0000001-0000-0000-0000-000000000002', 'Glossier × Maya Chen - Product Launch', 'Glossier', 'Maya Chen', 45000, 'negotiating', 91, 'brand_ambassador', 'high'),
  ('p0000001-0000-0000-0000-000000000003', 'Notion × Jordan Taylor - Tech Review', 'Notion', 'Jordan Taylor', 8000, 'outreach_sent', 85, 'sponsored_content', 'medium'),
  ('p0000001-0000-0000-0000-000000000004', 'Patagonia × Sofia Martinez - Travel Series', 'Patagonia', 'Sofia Martinez', 18000, 'responded', 88, 'content_series', 'high'),
  ('p0000001-0000-0000-0000-000000000005', 'Spotify × Kai Nakamura - Playlist Collab', 'Spotify', 'Kai Nakamura', 12000, 'contracted', 82, 'brand_ambassador', 'medium'),
  ('p0000001-0000-0000-0000-000000000006', 'Nike × Marcus Johnson - Fall Collection', 'Nike', 'Marcus Johnson', 20000, 'discovered', 79, 'sponsored_content', 'low'),
  ('p0000001-0000-0000-0000-000000000007', 'Notion × Priya Sharma - Edu Content', 'Notion', 'Priya Sharma', 5000, 'researching', 90, 'affiliate', 'medium'),
  ('p0000001-0000-0000-0000-000000000008', 'Glossier × Emma Wilson - Gaming Crossover', 'Glossier', 'Emma Wilson', 15000, 'completed', 76, 'sponsored_content', 'low');

-- ============================================================
-- OUTREACH SEQUENCES
-- ============================================================
insert into outreach_sequences (id, name, description, target_name, target_email, status, total_sent, total_opened, total_replied) values
  ('s0000001-0000-0000-0000-000000000001', 'Q1 Beauty Campaign Outreach', 'Cold outreach for spring beauty partnerships', 'Maya Chen', 'maya@example.com', 'active', 45, 32, 8),
  ('s0000001-0000-0000-0000-000000000002', 'Tech Creator Pipeline', 'Outreach to mid-tier tech reviewers', 'Jordan Taylor', 'jordan@example.com', 'active', 30, 18, 5),
  ('s0000001-0000-0000-0000-000000000003', 'Fitness Influencer Series', 'Reaching out to fitness macro-influencers', 'Alex Rivera', 'alex@example.com', 'completed', 60, 42, 12);

-- ============================================================
-- ACTIVITIES
-- ============================================================
insert into activities (action, description, resource_type, resource_id, actor_email, actor_name) values
  ('deal_created', 'Created partnership: Nike × Alex Rivera', 'partnership', 'p0000001-0000-0000-0000-000000000001', 'admin@partneriq.com', 'Admin'),
  ('deal_moved', 'Moved Glossier × Maya Chen to Negotiating', 'partnership', 'p0000001-0000-0000-0000-000000000002', 'admin@partneriq.com', 'Admin'),
  ('outreach_sent', 'Sent outreach email to Jordan Taylor', 'outreach', 's0000001-0000-0000-0000-000000000002', 'admin@partneriq.com', 'Admin'),
  ('talent_added', 'Added new talent: Priya Sharma', 'talent', 't0000001-0000-0000-0000-000000000006', 'admin@partneriq.com', 'Admin'),
  ('deal_completed', 'Completed partnership: Glossier × Emma Wilson', 'partnership', 'p0000001-0000-0000-0000-000000000008', 'admin@partneriq.com', 'Admin');

-- ============================================================
-- APPROVAL ITEMS
-- ============================================================
insert into approval_items (title, description, item_type, reference_id, status, priority, submitted_by) values
  ('Approve Nike campaign creative', 'Review final creative assets for Nike × Alex Rivera summer campaign', 'creative', 'p0000001-0000-0000-0000-000000000001', 'pending', 'high', 'admin@partneriq.com'),
  ('Contract review: Glossier × Maya Chen', 'Legal review of brand ambassador contract terms', 'contract', 'p0000001-0000-0000-0000-000000000002', 'pending', 'high', 'admin@partneriq.com'),
  ('Budget approval: Patagonia series', 'Approve $18K budget for Patagonia × Sofia travel series', 'budget', 'p0000001-0000-0000-0000-000000000004', 'pending', 'medium', 'admin@partneriq.com');

-- ============================================================
-- RATE BENCHMARKS
-- ============================================================
insert into rate_benchmarks (tier, platform, niche, min_rate, max_rate, avg_rate, median_rate) values
  ('nano', 'instagram', 'general', 50, 250, 150, 125),
  ('micro', 'instagram', 'general', 250, 1500, 800, 700),
  ('mid', 'instagram', 'general', 1500, 5000, 3000, 2800),
  ('macro', 'instagram', 'general', 5000, 15000, 8000, 7500),
  ('mega', 'instagram', 'general', 15000, 50000, 25000, 22000),
  ('nano', 'tiktok', 'general', 25, 150, 80, 65),
  ('micro', 'tiktok', 'general', 150, 1000, 500, 400),
  ('mid', 'tiktok', 'general', 1000, 4000, 2200, 2000),
  ('macro', 'tiktok', 'general', 4000, 12000, 7000, 6500),
  ('mega', 'tiktok', 'general', 12000, 40000, 20000, 18000),
  ('micro', 'youtube', 'general', 500, 3000, 1500, 1200),
  ('mid', 'youtube', 'general', 3000, 10000, 6000, 5500),
  ('macro', 'youtube', 'general', 10000, 30000, 18000, 16000);

-- ============================================================
-- ROI BENCHMARKS
-- ============================================================
insert into roi_benchmarks (deal_type, industry, median_roi, top_quartile_roi, bottom_quartile_roi, avg_conversion_rate, sample_size) values
  ('sponsored_content', 'general', 4.2, 8.5, 1.8, 2.1, 1200),
  ('brand_ambassador', 'general', 6.1, 12.0, 2.5, 3.4, 800),
  ('affiliate', 'general', 3.8, 7.2, 1.5, 4.8, 950),
  ('content_series', 'general', 5.5, 10.0, 2.0, 2.8, 600),
  ('event_appearance', 'general', 3.2, 6.5, 1.2, 1.5, 400),
  ('product_collab', 'general', 7.8, 15.0, 3.5, 5.2, 350);

-- ============================================================
-- MARKETPLACE OPPORTUNITIES
-- ============================================================
insert into marketplace_opportunities (title, description, brand_name, status, budget_min, budget_max, contract_type, niches, created_by) values
  ('Summer Fitness Campaign - 3 Posts', 'Looking for fitness influencers for summer athletic wear campaign. Must have engaged following in health/wellness space.', 'Nike', 'published', 3000, 8000, 'sponsored_content', '{"fitness","health","lifestyle"}', 'admin@partneriq.com'),
  ('Beauty Product Review Series', 'Seeking beauty creators for a 4-part skincare product review series. Authentic, educational content preferred.', 'Glossier', 'published', 5000, 15000, 'content_series', '{"beauty","skincare"}', 'admin@partneriq.com'),
  ('Productivity App Integration', 'Looking for tech/productivity YouTubers to create authentic integration content showing daily workflow.', 'Notion', 'published', 2000, 6000, 'sponsored_content', '{"tech","productivity","education"}', 'admin@partneriq.com');

-- ============================================================
-- TEAMS
-- ============================================================
insert into teams (id, name, description, owner_email) values
  ('tm000001-0000-0000-0000-000000000001', 'Brand Partnerships', 'Core team handling brand partnership negotiations', 'admin@partneriq.com'),
  ('tm000001-0000-0000-0000-000000000002', 'Talent Relations', 'Team managing talent onboarding and relationships', 'admin@partneriq.com');

insert into team_members (team_id, team_name, member_email, member_name, role, status) values
  ('tm000001-0000-0000-0000-000000000001', 'Brand Partnerships', 'admin@partneriq.com', 'Admin User', 'owner', 'active'),
  ('tm000001-0000-0000-0000-000000000002', 'Talent Relations', 'admin@partneriq.com', 'Admin User', 'owner', 'active');

-- ============================================================
-- CULTURE EVENTS (sample)
-- ============================================================
insert into culture_events (title, date, category, tier, description) values
  ('Super Bowl LX', '2026-02-08', 'sports', 'mega', 'Annual NFL championship game'),
  ('Coachella Music Festival', '2026-04-10', 'music', 'mega', 'Annual music and arts festival in Indio, California'),
  ('Met Gala', '2026-05-04', 'fashion', 'mega', 'Annual fundraising gala for the Metropolitan Museum of Art'),
  ('Cannes Film Festival', '2026-05-12', 'entertainment', 'mega', 'Annual film festival held in Cannes, France'),
  ('Pride Month', '2026-06-01', 'cultural', 'major', 'Annual LGBTQ+ celebration month'),
  ('Olympics Opening Ceremony', '2026-07-24', 'sports', 'mega', 'Opening of the Summer Olympic Games'),
  ('Black Friday', '2026-11-27', 'shopping', 'mega', 'Annual post-Thanksgiving shopping event'),
  ('New Year''s Eve', '2026-12-31', 'cultural', 'mega', 'Year-end celebrations worldwide');

-- ============================================================
-- NOTIFICATIONS (sample)
-- ============================================================
insert into notifications (title, message, type, status, priority, user_email) values
  ('New match found', 'AI Match Engine found a 94% match: Nike × Alex Rivera', 'match', 'unread', 'high', 'admin@partneriq.com'),
  ('Deal moved to negotiating', 'Glossier × Maya Chen has moved to the negotiating stage', 'deal_update', 'unread', 'normal', 'admin@partneriq.com'),
  ('Approval pending', 'Contract review for Glossier × Maya Chen needs your attention', 'approval', 'unread', 'high', 'admin@partneriq.com');
