/**
 * Seeds the Supabase database with demo data through the authenticated client.
 * Uses the current user's ID for owner_id/created_by fields so RLS policies are satisfied.
 */
import { supabase } from '@/api/supabaseClient';

export async function seedDemoData(onProgress) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to seed data');
  const uid = user.id;

  const report = (step, total, label) => onProgress?.({ step, total, label });
  const totalSteps = 14;
  let step = 0;

  // Helper: upsert with conflict handling
  async function safeInsert(table, rows) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) console.warn(`seed ${table}:`, error.message);
  }

  // 1. Brands
  report(++step, totalSteps, 'Seeding brands...');
  await safeInsert('brands', [
    { id: 'b1000000-0000-0000-0000-000000000001', name: 'NovaTech', industry: 'Technology', website: 'https://novatech.example.com', description: 'Leading edge consumer tech brand', hq_location: 'San Francisco, CA', annual_revenue: '$500M+', partnership_budget: 250000, target_niches: ['tech','gaming','education'], target_platforms: ['youtube','twitter','linkedin'], brand_values: ['innovation','sustainability','quality'], contact_name: 'Alex Rivera', contact_email: 'alex@novatech.example.com', owner_id: uid },
    { id: 'b1000000-0000-0000-0000-000000000002', name: 'FreshBite Foods', industry: 'Food & Beverage', website: 'https://freshbite.example.com', description: 'Organic meal prep and delivery', hq_location: 'Austin, TX', annual_revenue: '$50M-100M', partnership_budget: 80000, target_niches: ['fitness','lifestyle','food'], target_platforms: ['instagram','tiktok'], brand_values: ['health','sustainability','community'], contact_name: 'Jordan Lee', contact_email: 'jordan@freshbite.example.com', owner_id: uid },
    { id: 'b1000000-0000-0000-0000-000000000003', name: 'StyleForward', industry: 'Fashion & Apparel', website: 'https://styleforward.example.com', description: 'Contemporary streetwear and athleisure', hq_location: 'New York, NY', annual_revenue: '$100M-250M', partnership_budget: 150000, target_niches: ['fashion','lifestyle','fitness'], target_platforms: ['instagram','tiktok','youtube'], brand_values: ['inclusivity','expression','quality'], contact_name: 'Morgan Chen', contact_email: 'morgan@styleforward.example.com', owner_id: uid },
    { id: 'b1000000-0000-0000-0000-000000000004', name: 'GlowSkin', industry: 'Beauty & Personal Care', website: 'https://glowskin.example.com', description: 'Clean beauty and skincare', hq_location: 'Los Angeles, CA', annual_revenue: '$25M-50M', partnership_budget: 60000, target_niches: ['beauty','lifestyle','wellness'], target_platforms: ['instagram','tiktok','youtube'], brand_values: ['clean beauty','transparency','diversity'], contact_name: 'Taylor Kim', contact_email: 'taylor@glowskin.example.com', owner_id: uid },
    { id: 'b1000000-0000-0000-0000-000000000005', name: 'PeakFit', industry: 'Sports & Fitness', website: 'https://peakfit.example.com', description: 'Performance fitness equipment and apparel', hq_location: 'Denver, CO', annual_revenue: '$75M-150M', partnership_budget: 120000, target_niches: ['fitness','sports','health'], target_platforms: ['instagram','youtube','tiktok'], brand_values: ['performance','community','accessibility'], contact_name: 'Casey Johnson', contact_email: 'casey@peakfit.example.com', owner_id: uid },
  ]);

  // 2. Talents
  report(++step, totalSteps, 'Seeding talents...');
  await safeInsert('talents', [
    { id: 't1000000-0000-0000-0000-000000000001', name: 'Mia Chen', email: 'mia@creator.example.com', primary_platform: 'instagram', niche: 'lifestyle', tier: 'macro', location: 'Los Angeles, CA', bio: 'Lifestyle creator sharing authentic daily content', total_followers: 850000, engagement_rate: 4.2, brand_safety_score: 92, discovery_alpha_score: 87, trajectory: 'rising', avg_views: 120000, rate_per_post: 8500, rate_per_story: 2500, rate_per_reel: 12000, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000002', name: 'Jake Torres', email: 'jake@creator.example.com', primary_platform: 'youtube', niche: 'tech', tier: 'mid', location: 'Seattle, WA', bio: 'Tech reviewer and early adopter', total_followers: 420000, engagement_rate: 6.8, brand_safety_score: 96, discovery_alpha_score: 91, trajectory: 'rising', avg_views: 85000, rate_per_post: 5000, rate_per_story: 1500, rate_per_reel: 7000, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000003', name: 'Aisha Patel', email: 'aisha@creator.example.com', primary_platform: 'tiktok', niche: 'fitness', tier: 'macro', location: 'Chicago, IL', bio: 'Certified personal trainer and motivational creator', total_followers: 1200000, engagement_rate: 8.1, brand_safety_score: 98, discovery_alpha_score: 94, trajectory: 'rising', avg_views: 350000, rate_per_post: 12000, rate_per_story: 3500, rate_per_reel: 18000, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000004', name: 'Sam Rivers', email: 'sam@creator.example.com', primary_platform: 'instagram', niche: 'beauty', tier: 'mid', location: 'Miami, FL', bio: 'Beauty educator and product reviewer', total_followers: 380000, engagement_rate: 5.6, brand_safety_score: 95, discovery_alpha_score: 82, trajectory: 'stable', avg_views: 65000, rate_per_post: 4000, rate_per_story: 1200, rate_per_reel: 6000, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000005', name: 'Leo Martinez', email: 'leo@creator.example.com', primary_platform: 'youtube', niche: 'gaming', tier: 'macro', location: 'Austin, TX', bio: 'Gaming content creator and streamer', total_followers: 920000, engagement_rate: 7.2, brand_safety_score: 88, discovery_alpha_score: 85, trajectory: 'rising', avg_views: 280000, rate_per_post: 9000, rate_per_story: 2800, rate_per_reel: 13000, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000006', name: 'Priya Sharma', email: 'priya@creator.example.com', primary_platform: 'instagram', niche: 'food', tier: 'micro', location: 'Portland, OR', bio: 'Food blogger and recipe developer', total_followers: 95000, engagement_rate: 9.4, brand_safety_score: 99, discovery_alpha_score: 88, trajectory: 'rising', avg_views: 18000, rate_per_post: 1500, rate_per_story: 500, rate_per_reel: 2200, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000007', name: 'Ryan Walsh', email: 'ryan@creator.example.com', primary_platform: 'tiktok', niche: 'education', tier: 'mid', location: 'Boston, MA', bio: 'EdTech creator making learning fun', total_followers: 310000, engagement_rate: 11.2, brand_safety_score: 97, discovery_alpha_score: 93, trajectory: 'rising', avg_views: 95000, rate_per_post: 3500, rate_per_story: 1000, rate_per_reel: 5500, owner_id: uid },
    { id: 't1000000-0000-0000-0000-000000000008', name: 'Zoe Campbell', email: 'zoe@creator.example.com', primary_platform: 'instagram', niche: 'travel', tier: 'micro', location: 'Nashville, TN', bio: 'Travel photographer and adventure seeker', total_followers: 78000, engagement_rate: 7.8, brand_safety_score: 94, discovery_alpha_score: 79, trajectory: 'stable', avg_views: 12000, rate_per_post: 1200, rate_per_story: 400, rate_per_reel: 1800, owner_id: uid },
  ]);

  // 3. Partnerships
  report(++step, totalSteps, 'Seeding partnerships...');
  await safeInsert('partnerships', [
    { id: 'p1000000-0000-0000-0000-000000000001', title: 'NovaTech × Mia Chen – Lifestyle Tech Series', brand_id: 'b1000000-0000-0000-0000-000000000001', talent_id: 't1000000-0000-0000-0000-000000000001', brand_name: 'NovaTech', talent_name: 'Mia Chen', status: 'active', deal_value: 45000, match_score: 92, priority: 'high', assigned_to: 'sales@partneriq.example.com', notes: '6-part sponsored series launching Q2', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000002', title: 'FreshBite × Aisha Patel – Nutrition Campaign', brand_id: 'b1000000-0000-0000-0000-000000000002', talent_id: 't1000000-0000-0000-0000-000000000003', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', status: 'contracted', deal_value: 38000, match_score: 95, priority: 'high', notes: 'Meal plan content integration', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000003', title: 'StyleForward × Mia Chen – Fall Collection Drop', brand_id: 'b1000000-0000-0000-0000-000000000003', talent_id: 't1000000-0000-0000-0000-000000000001', brand_name: 'StyleForward', talent_name: 'Mia Chen', status: 'negotiating', deal_value: 28000, match_score: 88, priority: 'medium', notes: 'Negotiations ongoing on usage rights', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000004', title: 'GlowSkin × Sam Rivers – Skincare Routine', brand_id: 'b1000000-0000-0000-0000-000000000004', talent_id: 't1000000-0000-0000-0000-000000000004', brand_name: 'GlowSkin', talent_name: 'Sam Rivers', status: 'outreach_sent', deal_value: 18000, match_score: 84, priority: 'medium', notes: 'First outreach sent, awaiting reply', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000005', title: 'PeakFit × Jake Torres – Tech & Fitness Crossover', brand_id: 'b1000000-0000-0000-0000-000000000005', talent_id: 't1000000-0000-0000-0000-000000000002', brand_name: 'PeakFit', talent_name: 'Jake Torres', status: 'researching', deal_value: 22000, match_score: 79, priority: 'medium', notes: 'Reviewing tech fitness content fit', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000006', title: 'NovaTech × Leo Martinez – Gaming Peripherals', brand_id: 'b1000000-0000-0000-0000-000000000001', talent_id: 't1000000-0000-0000-0000-000000000005', brand_name: 'NovaTech', talent_name: 'Leo Martinez', status: 'discovered', deal_value: 55000, match_score: 91, priority: 'high', notes: 'High priority gaming segment opportunity', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000007', title: 'FreshBite × Priya Sharma – Recipe Collaboration', brand_id: 'b1000000-0000-0000-0000-000000000002', talent_id: 't1000000-0000-0000-0000-000000000006', brand_name: 'FreshBite Foods', talent_name: 'Priya Sharma', status: 'responded', deal_value: 12000, match_score: 96, priority: 'high', notes: 'Creator very enthusiastic, hot lead', created_by: uid },
    { id: 'p1000000-0000-0000-0000-000000000008', title: 'StyleForward × Zoe Campbell – Travel Fashion', brand_id: 'b1000000-0000-0000-0000-000000000003', talent_id: 't1000000-0000-0000-0000-000000000008', brand_name: 'StyleForward', talent_name: 'Zoe Campbell', status: 'outreach_pending', deal_value: 9500, match_score: 77, priority: 'low', notes: 'Draft outreach ready', created_by: uid },
  ]);

  // 4. Marketplace Opportunities
  report(++step, totalSteps, 'Seeding marketplace opportunities...');
  await safeInsert('marketplace_opportunities', [
    { id: 'o1000000-0000-0000-0000-000000000001', title: 'Tech Product Launch – Q2 2026', brand_name: 'NovaTech', description: 'Looking for tech-savvy creators to launch our new smart home device line', status: 'published', contract_type: 'sponsored_post', budget_min: 5000, budget_max: 15000, required_niches: ['tech','lifestyle'], required_platforms: ['youtube','instagram'], min_followers: 100000, deliverables: ['2 YouTube videos','4 Instagram posts','8 Stories'], deadline: '2026-05-31', posted_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000002', title: 'Healthy Eating Month Campaign', brand_name: 'FreshBite Foods', description: 'Partner with us to promote clean, nutritious eating habits', status: 'published', contract_type: 'ambassador', budget_min: 2000, budget_max: 8000, required_niches: ['fitness','food','lifestyle'], required_platforms: ['instagram','tiktok'], min_followers: 50000, deliverables: ['8 TikTok videos','12 Instagram posts'], deadline: '2026-04-30', posted_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000003', title: 'Summer Streetwear Collection', brand_name: 'StyleForward', description: 'Feature our new summer collection in your content', status: 'published', contract_type: 'gifting_plus_fee', budget_min: 1500, budget_max: 6000, required_niches: ['fashion','lifestyle'], required_platforms: ['instagram','tiktok'], min_followers: 30000, deliverables: ['6 Instagram posts','10 Stories','3 Reels'], deadline: '2026-06-15', posted_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000004', title: 'Clean Beauty Skincare Routine Series', brand_name: 'GlowSkin', description: 'Show your audience your skincare routine with our products', status: 'published', contract_type: 'sponsored_post', budget_min: 3000, budget_max: 10000, required_niches: ['beauty','wellness','lifestyle'], required_platforms: ['instagram','youtube'], min_followers: 75000, deliverables: ['3 YouTube videos','6 Instagram posts'], deadline: '2026-05-01', posted_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000005', title: 'Fitness Challenge Series', brand_name: 'PeakFit', description: '30-day fitness challenge featuring our equipment', status: 'published', contract_type: 'ambassador', budget_min: 4000, budget_max: 12000, required_niches: ['fitness','sports','health'], required_platforms: ['instagram','tiktok','youtube'], min_followers: 80000, deliverables: ['30-day daily Stories','4 long-form videos'], deadline: '2026-07-01', posted_by: uid },
  ]);

  // 5. Opportunity Applications
  report(++step, totalSteps, 'Seeding opportunity applications...');
  await safeInsert('opportunity_applications', [
    { id: 'a1000000-0000-0000-0000-000000000001', opportunity_id: 'o1000000-0000-0000-0000-000000000002', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'accepted', cover_letter: 'I am deeply passionate about nutrition and your products align perfectly with my content pillars.', proposed_rate: 6500 },
    { id: 'a1000000-0000-0000-0000-000000000002', opportunity_id: 'o1000000-0000-0000-0000-000000000003', talent_email: 'mia@creator.example.com', talent_name: 'Mia Chen', status: 'reviewing', cover_letter: 'Fashion and lifestyle are at the core of my content. My audience would love your summer collection!', proposed_rate: 4500 },
    { id: 'a1000000-0000-0000-0000-000000000003', opportunity_id: 'o1000000-0000-0000-0000-000000000004', talent_email: 'sam@creator.example.com', talent_name: 'Sam Rivers', status: 'pending', cover_letter: 'Clean beauty is my specialty and I would love to feature GlowSkin in my next skincare series.', proposed_rate: 3800 },
    { id: 'a1000000-0000-0000-0000-000000000004', opportunity_id: 'o1000000-0000-0000-0000-000000000002', talent_email: 'priya@creator.example.com', talent_name: 'Priya Sharma', status: 'pending', cover_letter: 'As a food creator focused on healthy eating, FreshBite is a natural fit for my audience.', proposed_rate: 2200 },
    { id: 'a1000000-0000-0000-0000-000000000005', opportunity_id: 'o1000000-0000-0000-0000-000000000005', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'reviewing', cover_letter: 'Fitness challenges are my specialty. My community has completed 12 challenges with me already.', proposed_rate: 9000 },
  ]);

  // 6. Outreach Sequences
  report(++step, totalSteps, 'Seeding outreach sequences...');
  await safeInsert('outreach_sequences', [
    { id: 's1000000-0000-0000-0000-000000000001', name: 'Tech Creator Cold Outreach', description: 'Multi-step sequence for approaching tech creators', status: 'active', target_count: 50, sent_count: 32, open_rate: 68.5, reply_rate: 22.4, created_by: uid },
    { id: 's1000000-0000-0000-0000-000000000002', name: 'Fitness Brand Partnership Intro', description: 'Introduction sequence for fitness brand partnerships', status: 'active', target_count: 30, sent_count: 18, open_rate: 72.2, reply_rate: 28.6, created_by: uid },
    { id: 's1000000-0000-0000-0000-000000000003', name: 'Beauty Creator Campaign', description: 'Outreach for beauty campaign recruitment', status: 'paused', target_count: 40, sent_count: 15, open_rate: 60.0, reply_rate: 13.3, created_by: uid },
  ]);

  // 7. Outreach Emails
  report(++step, totalSteps, 'Seeding outreach emails...');
  await safeInsert('outreach_emails', [
    { id: 'oe000000-0000-0000-0000-000000000001', partnership_id: 'p1000000-0000-0000-0000-000000000004', sequence_id: 's1000000-0000-0000-0000-000000000001', subject: 'Partnership Opportunity with GlowSkin', body: 'Hi Sam, we love your skincare content and would love to discuss a partnership...', recipient_email: 'sam@creator.example.com', recipient_name: 'Sam Rivers', status: 'sent', created_by: uid },
    { id: 'oe000000-0000-0000-0000-000000000002', partnership_id: 'p1000000-0000-0000-0000-000000000008', sequence_id: 's1000000-0000-0000-0000-000000000003', subject: 'StyleForward × Travel Fashion Collab', body: 'Hi Zoe, your travel photography is stunning and we think you would be a great fit...', recipient_email: 'zoe@creator.example.com', recipient_name: 'Zoe Campbell', status: 'draft', created_by: uid },
    { id: 'oe000000-0000-0000-0000-000000000003', partnership_id: 'p1000000-0000-0000-0000-000000000005', sequence_id: 's1000000-0000-0000-0000-000000000001', subject: 'PeakFit Tech Fitness Collaboration', body: 'Hi Jake, your tech reviews are impressive. We are launching a new smart fitness line...', recipient_email: 'jake@creator.example.com', recipient_name: 'Jake Torres', status: 'opened', created_by: uid },
  ]);

  // 8. Approval Items
  report(++step, totalSteps, 'Seeding approval items...');
  await safeInsert('approval_items', [
    { id: 'ai000000-0000-0000-0000-000000000001', title: 'Contract Review – NovaTech × Mia Chen', description: 'Please review and approve the partnership contract', type: 'contract', status: 'approved', partnership_id: 'p1000000-0000-0000-0000-000000000001' },
    { id: 'ai000000-0000-0000-0000-000000000002', title: 'Content Brief – FreshBite × Aisha Patel', description: 'Review content brief before sending to creator', type: 'content_brief', status: 'pending', partnership_id: 'p1000000-0000-0000-0000-000000000002' },
    { id: 'ai000000-0000-0000-0000-000000000003', title: 'Payment Approval – $38,000', description: 'Approve payment release for contracted deal', type: 'payment', status: 'pending', partnership_id: 'p1000000-0000-0000-0000-000000000002' },
    { id: 'ai000000-0000-0000-0000-000000000004', title: 'Creative Assets Review – StyleForward', description: 'Review submitted brand assets for usage rights', type: 'creative', status: 'revision_requested', partnership_id: 'p1000000-0000-0000-0000-000000000003' },
  ]);

  // 9. Deal Notes
  report(++step, totalSteps, 'Seeding deal notes...');
  await safeInsert('deal_notes', [
    { id: 'dn000000-0000-0000-0000-000000000001', partnership_id: 'p1000000-0000-0000-0000-000000000001', content: 'Had a great kickoff call with Mia. She is very enthusiastic about the tech angle. Content calendar locked in.', type: 'call', author_name: 'Alex Rivera', author_id: uid },
    { id: 'dn000000-0000-0000-0000-000000000002', partnership_id: 'p1000000-0000-0000-0000-000000000002', content: 'Contract signed. Shooting starts next week. Deliverables agreed: 8 TikToks + 6 IG posts.', type: 'note', author_name: 'Jordan Lee', author_id: uid },
    { id: 'dn000000-0000-0000-0000-000000000003', partnership_id: 'p1000000-0000-0000-0000-000000000003', content: 'StyleForward requested exclusivity clause. Need legal review before we can proceed.', type: 'note', author_name: 'Morgan Chen', author_id: uid },
    { id: 'dn000000-0000-0000-0000-000000000004', partnership_id: 'p1000000-0000-0000-0000-000000000007', content: 'Priya responded within 2 hours! Very interested. Scheduling discovery call for Monday.', type: 'email', author_name: 'Jordan Lee', author_id: uid },
  ]);

  // 10. Tasks
  report(++step, totalSteps, 'Seeding tasks...');
  await safeInsert('tasks', [
    { id: 'tk000000-0000-0000-0000-000000000001', title: 'Send content brief to Mia Chen', description: 'Prepare and send the Q2 content brief including talking points and visual guidelines', status: 'done', priority: 'high', partnership_id: 'p1000000-0000-0000-0000-000000000001', assigned_to_email: 'alex@partneriq.example.com', due_date: '2026-03-15', created_by: uid },
    { id: 'tk000000-0000-0000-0000-000000000002', title: 'Review contract for FreshBite deal', description: 'Legal review of exclusivity and payment terms', status: 'in_progress', priority: 'urgent', partnership_id: 'p1000000-0000-0000-0000-000000000002', assigned_to_email: 'legal@partneriq.example.com', due_date: '2026-03-10', created_by: uid },
    { id: 'tk000000-0000-0000-0000-000000000003', title: 'Follow up with StyleForward on usage rights', description: 'Get clarity on the usage rights clause before signing', status: 'todo', priority: 'high', partnership_id: 'p1000000-0000-0000-0000-000000000003', assigned_to_email: 'morgan@partneriq.example.com', due_date: '2026-03-12', created_by: uid },
    { id: 'tk000000-0000-0000-0000-000000000004', title: 'Schedule discovery call with Priya Sharma', description: 'Book 30-min discovery call to discuss FreshBite collaboration details', status: 'todo', priority: 'medium', partnership_id: 'p1000000-0000-0000-0000-000000000007', assigned_to_email: 'jordan@partneriq.example.com', due_date: '2026-03-11', created_by: uid },
  ]);

  // 11. Activities
  report(++step, totalSteps, 'Seeding activities...');
  await safeInsert('activities', [
    { id: 'ac000000-0000-0000-0000-000000000001', type: 'deal_created', description: 'New deal created: NovaTech × Mia Chen', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000001', user_name: 'Alex Rivera', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000002', type: 'stage_change', description: 'Deal moved to Active: FreshBite × Aisha Patel', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000002', user_name: 'Jordan Lee', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000003', type: 'note_added', description: 'New note added on StyleForward negotiation', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000003', user_name: 'Morgan Chen', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000004', type: 'email_sent', description: 'Outreach email sent to GlowSkin', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000004', user_name: 'Taylor Kim', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000005', type: 'creator_replied', description: 'Priya Sharma replied to outreach!', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000007', user_name: 'Jordan Lee', user_id: uid },
  ]);

  // 12. Reference data: Rate Benchmarks
  report(++step, totalSteps, 'Seeding rate benchmarks & reference data...');
  const { error: rbErr } = await supabase.from('rate_benchmarks').upsert([
    { platform: 'instagram', niche: 'lifestyle', tier: 'micro', content_type: 'post', rate_min: 500, rate_max: 2000, rate_median: 1100, source: 'PartnerIQ 2025 Report' },
    { platform: 'instagram', niche: 'lifestyle', tier: 'mid', content_type: 'post', rate_min: 2000, rate_max: 6000, rate_median: 4000, source: 'PartnerIQ 2025 Report' },
    { platform: 'instagram', niche: 'lifestyle', tier: 'macro', content_type: 'post', rate_min: 6000, rate_max: 20000, rate_median: 12000, source: 'PartnerIQ 2025 Report' },
    { platform: 'instagram', niche: 'beauty', tier: 'micro', content_type: 'post', rate_min: 600, rate_max: 2500, rate_median: 1300, source: 'PartnerIQ 2025 Report' },
    { platform: 'instagram', niche: 'beauty', tier: 'mid', content_type: 'post', rate_min: 2500, rate_max: 8000, rate_median: 5000, source: 'PartnerIQ 2025 Report' },
    { platform: 'tiktok', niche: 'fitness', tier: 'macro', content_type: 'video', rate_min: 8000, rate_max: 25000, rate_median: 15000, source: 'PartnerIQ 2025 Report' },
    { platform: 'youtube', niche: 'tech', tier: 'mid', content_type: 'integration', rate_min: 3000, rate_max: 9000, rate_median: 5500, source: 'PartnerIQ 2025 Report' },
    { platform: 'youtube', niche: 'gaming', tier: 'macro', content_type: 'integration', rate_min: 7000, rate_max: 20000, rate_median: 12000, source: 'PartnerIQ 2025 Report' },
  ], { onConflict: 'platform,niche,tier,content_type', ignoreDuplicates: true });
  if (rbErr) console.warn('seed rate_benchmarks:', rbErr.message);

  // Platform Multipliers
  const { error: pmErr } = await supabase.from('platform_multipliers').upsert([
    { platform: 'instagram', base_multiplier: 1.0, engagement_weight: 0.6, reach_weight: 0.4, notes: 'Baseline platform' },
    { platform: 'tiktok', base_multiplier: 1.15, engagement_weight: 0.75, reach_weight: 0.25, notes: 'Higher engagement weight due to viral potential' },
    { platform: 'youtube', base_multiplier: 1.3, engagement_weight: 0.4, reach_weight: 0.6, notes: 'Long-form premium' },
    { platform: 'twitter', base_multiplier: 0.7, engagement_weight: 0.5, reach_weight: 0.5, notes: 'Lower monetization rates' },
    { platform: 'linkedin', base_multiplier: 1.2, engagement_weight: 0.6, reach_weight: 0.4, notes: 'B2B premium' },
    { platform: 'twitch', base_multiplier: 1.1, engagement_weight: 0.8, reach_weight: 0.2, notes: 'High engagement live platform' },
  ], { onConflict: 'platform', ignoreDuplicates: true });
  if (pmErr) console.warn('seed platform_multipliers:', pmErr.message);

  // Category Premiums
  const { error: cpErr } = await supabase.from('category_premiums').upsert([
    { category: 'tech', premium_percent: 20, demand_level: 'high', notes: 'Strong brand demand in tech category' },
    { category: 'beauty', premium_percent: 15, demand_level: 'high', notes: 'Beauty brands compete heavily for creators' },
    { category: 'fitness', premium_percent: 18, demand_level: 'very_high', notes: 'Peak demand for fitness creators post-2020' },
    { category: 'gaming', premium_percent: 12, demand_level: 'high', notes: 'Growing segment, strong brand interest' },
    { category: 'food', premium_percent: 10, demand_level: 'medium', notes: 'Steady demand, moderate premium' },
    { category: 'lifestyle', premium_percent: 8, demand_level: 'medium', notes: 'Broad category, lower premium' },
    { category: 'travel', premium_percent: 5, demand_level: 'medium', notes: 'Recovering post-pandemic' },
    { category: 'finance', premium_percent: 25, demand_level: 'high', notes: 'Regulated space, higher creative premium' },
    { category: 'education', premium_percent: 15, demand_level: 'high', notes: 'EdTech brands willing to pay premium' },
  ], { onConflict: 'category', ignoreDuplicates: true });
  if (cpErr) console.warn('seed category_premiums:', cpErr.message);

  // 13. Culture Events, Conferences, Demographics
  report(++step, totalSteps, 'Seeding events & demographics...');
  const { error: ceErr } = await supabase.from('culture_events').upsert([
    { name: 'Black History Month', description: 'Annual recognition of Black history and culture', date: '2026-02-01', type: 'cultural_observance', region: 'USA', target_demographics: ['18-35','Black American community','Gen Z','Millennials'] },
    { name: 'Ramadan', description: 'Holy month of fasting and community for Muslims', date: '2026-03-01', type: 'religious_holiday', region: 'Global', target_demographics: ['Muslim community','MENA diaspora','All ages'] },
    { name: 'Pride Month', description: 'LGBTQ+ celebration and advocacy', date: '2026-06-01', type: 'cultural_observance', region: 'Global', target_demographics: ['LGBTQ+','Allies','Gen Z','Millennials'] },
    { name: 'Back to School', description: 'Annual back-to-school season', date: '2026-08-15', type: 'seasonal', region: 'USA', target_demographics: ['Students','Parents','Teachers','Teens'] },
    { name: 'Hispanic Heritage Month', description: 'Celebration of Hispanic and Latino culture', date: '2026-09-15', type: 'cultural_observance', region: 'USA', target_demographics: ['Hispanic/Latino community','Spanish speakers','All ages'] },
    { name: 'Diwali', description: 'Hindu festival of lights', date: '2026-10-20', type: 'religious_holiday', region: 'Global', target_demographics: ['South Asian community','Hindu community','All ages'] },
    { name: 'Lunar New Year', description: 'Asian New Year celebration', date: '2027-02-06', type: 'cultural_observance', region: 'Global', target_demographics: ['East Asian community','AAPI','All ages'] },
    { name: 'Earth Day', description: 'Global environmental awareness day', date: '2026-04-22', type: 'awareness_day', region: 'Global', target_demographics: ['Eco-conscious','Gen Z','Millennials','All ages'] },
    { name: 'International Womens Day', description: 'Global celebration of women and gender equality', date: '2026-03-08', type: 'awareness_day', region: 'Global', target_demographics: ['Women','Allies','All ages'] },
    { name: 'Mental Health Awareness Month', description: 'May awareness campaign for mental wellness', date: '2026-05-01', type: 'awareness_day', region: 'USA', target_demographics: ['All ages','Gen Z','Millennials','Wellness community'] },
  ], { ignoreDuplicates: true });
  if (ceErr) console.warn('seed culture_events:', ceErr.message);

  const { error: confErr } = await supabase.from('conferences').upsert([
    { name: 'VidSummit 2026', description: 'Premier creator economy conference', date: '2026-09-20', location: 'Dallas, TX', industry: 'Creator Economy', expected_attendees: 3000, sponsorship_available: true, sponsorship_cost: 25000 },
    { name: 'Social Media Marketing World', description: 'Leading social media marketing conference', date: '2026-03-15', location: 'San Diego, CA', industry: 'Marketing', expected_attendees: 5000, sponsorship_available: true, sponsorship_cost: 35000 },
    { name: 'Influencer Marketing Summit', description: 'Top influencer marketing event', date: '2026-05-10', location: 'New York, NY', industry: 'Influencer Marketing', expected_attendees: 1500, sponsorship_available: true, sponsorship_cost: 15000 },
    { name: 'Brand Innovation Summit', description: 'Brand partnership and innovation conference', date: '2026-07-22', location: 'Chicago, IL', industry: 'Brand Marketing', expected_attendees: 2000, sponsorship_available: true, sponsorship_cost: 20000 },
    { name: 'Creator Economy Expo', description: 'The business of being a creator', date: '2026-08-12', location: 'Las Vegas, NV', industry: 'Creator Economy', expected_attendees: 4000, sponsorship_available: true, sponsorship_cost: 30000 },
  ], { ignoreDuplicates: true });
  if (confErr) console.warn('seed conferences:', confErr.message);

  const { error: dsErr } = await supabase.from('demographic_segments').upsert([
    { name: 'Gen Z Trendsetters', description: 'Fashion and culture-forward Gen Z consumers', age_range: '18-26', gender: 'all', income_range: '$25K-$50K', interests: ['fashion','music','gaming','social justice'], platforms: ['tiktok','instagram','youtube'], size_estimate: 68000000 },
    { name: 'Millennial Parents', description: 'Millennial parents balancing family and career', age_range: '30-40', gender: 'all', income_range: '$75K-$125K', interests: ['parenting','home','health','finance'], platforms: ['instagram','facebook','youtube'], size_estimate: 45000000 },
    { name: 'Fitness Enthusiasts', description: 'Dedicated health and fitness consumers', age_range: '22-38', gender: 'all', income_range: '$50K-$100K', interests: ['fitness','nutrition','wellness','sports'], platforms: ['instagram','tiktok','youtube'], size_estimate: 32000000 },
    { name: 'Tech Early Adopters', description: 'Technology enthusiasts who adopt new products early', age_range: '25-45', gender: 'male_skew', income_range: '$80K-$150K', interests: ['technology','gaming','productivity','AI'], platforms: ['youtube','twitter','linkedin'], size_estimate: 18000000 },
    { name: 'Beauty Conscious', description: 'Beauty and personal care focused consumers', age_range: '16-35', gender: 'female_skew', income_range: '$30K-$75K', interests: ['beauty','skincare','fashion','wellness'], platforms: ['instagram','tiktok','youtube'], size_estimate: 55000000 },
  ], { ignoreDuplicates: true });
  if (dsErr) console.warn('seed demographic_segments:', dsErr.message);

  // 14. Viewership Tiers & Subscription Plans
  report(++step, totalSteps, 'Seeding viewership tiers & plans...');
  const { error: vtErr } = await supabase.from('viewership_tiers').upsert([
    { name: 'Nano', platform: 'instagram', min_followers: 1000, max_followers: 9999, avg_engagement_rate: 8.5, typical_rate_min: 50, typical_rate_max: 500, description: '1K-10K followers, hyper-engaged niche communities' },
    { name: 'Micro', platform: 'instagram', min_followers: 10000, max_followers: 99999, avg_engagement_rate: 6.2, typical_rate_min: 500, typical_rate_max: 3000, description: '10K-100K followers, strong community trust' },
    { name: 'Mid', platform: 'instagram', min_followers: 100000, max_followers: 499999, avg_engagement_rate: 4.1, typical_rate_min: 3000, typical_rate_max: 10000, description: '100K-500K, established creators with diverse reach' },
    { name: 'Macro', platform: 'instagram', min_followers: 500000, max_followers: 999999, avg_engagement_rate: 3.2, typical_rate_min: 10000, typical_rate_max: 30000, description: '500K-1M, wide reach with brand credibility' },
    { name: 'Mega', platform: 'instagram', min_followers: 1000000, max_followers: 4999999, avg_engagement_rate: 2.8, typical_rate_min: 30000, typical_rate_max: 100000, description: '1M-5M, celebrity-adjacent mass reach' },
    { name: 'Celebrity', platform: 'instagram', min_followers: 5000000, max_followers: null, avg_engagement_rate: 1.9, typical_rate_min: 100000, typical_rate_max: 500000, description: '5M+, mass market cultural influence' },
    { name: 'Nano', platform: 'tiktok', min_followers: 1000, max_followers: 9999, avg_engagement_rate: 12.0, typical_rate_min: 100, typical_rate_max: 800, description: '1K-10K on TikTok, viral potential' },
    { name: 'Micro', platform: 'tiktok', min_followers: 10000, max_followers: 99999, avg_engagement_rate: 9.5, typical_rate_min: 800, typical_rate_max: 4000, description: '10K-100K TikTok creators' },
    { name: 'Mid', platform: 'tiktok', min_followers: 100000, max_followers: 499999, avg_engagement_rate: 7.2, typical_rate_min: 4000, typical_rate_max: 15000, description: '100K-500K TikTok reach' },
    { name: 'Macro', platform: 'tiktok', min_followers: 500000, max_followers: 999999, avg_engagement_rate: 5.8, typical_rate_min: 15000, typical_rate_max: 40000, description: '500K-1M TikTok influence' },
  ], { ignoreDuplicates: true });
  if (vtErr) console.warn('seed viewership_tiers:', vtErr.message);

  const { error: spErr } = await supabase.from('subscription_plans').upsert([
    { name: 'Free', tier: 'free', user_type: 'brand', price_monthly: 0, price_annual: 0, features: '["5 talent searches/month","1 active partnership","Basic analytics"]', limits: '{"searches": 5, "partnerships": 1, "team_members": 1}' },
    { name: 'Starter', tier: 'starter', user_type: 'brand', price_monthly: 49, price_annual: 470, features: '["50 talent searches/month","10 active partnerships","AI match engine","Email outreach"]', limits: '{"searches": 50, "partnerships": 10, "team_members": 3}' },
    { name: 'Pro', tier: 'pro', user_type: 'brand', price_monthly: 149, price_annual: 1430, features: '["Unlimited searches","50 partnerships","Advanced AI","Custom sequences","Analytics dashboard"]', limits: '{"searches": 999999, "partnerships": 50, "team_members": 10}' },
    { name: 'Enterprise', tier: 'enterprise', user_type: 'brand', price_monthly: 399, price_annual: 3830, features: '["Everything in Pro","Unlimited partnerships","Dedicated success manager","API access","Custom reporting"]', limits: '{"searches": 999999, "partnerships": 999999, "team_members": 999999}' },
    { name: 'Free', tier: 'free', user_type: 'talent', price_monthly: 0, price_annual: 0, features: '["Browse opportunities","Basic profile","Apply to 3 opportunities/month"]', limits: '{"applications": 3}' },
    { name: 'Creator', tier: 'creator', user_type: 'talent', price_monthly: 29, price_annual: 278, features: '["Unlimited applications","Enhanced profile","Analytics","Deal pipeline"]', limits: '{"applications": 999999}' },
    { name: 'Pro Creator', tier: 'pro', user_type: 'talent', price_monthly: 79, price_annual: 758, features: '["Everything in Creator","AI pitch writer","Rate benchmarks","Priority listing"]', limits: '{"applications": 999999}' },
    { name: 'Agency Starter', tier: 'starter', user_type: 'agency', price_monthly: 199, price_annual: 1910, features: '["25 talent roster","20 brand partnerships","Team of 5","Reporting"]', limits: '{"talent_roster": 25, "partnerships": 20, "team_members": 5}' },
    { name: 'Agency Pro', tier: 'agency_pro', user_type: 'agency', price_monthly: 499, price_annual: 4790, features: '["Unlimited roster","Unlimited partnerships","Unlimited team","White-label","API"]', limits: '{"talent_roster": 999999, "partnerships": 999999, "team_members": 999999}' },
  ], { ignoreDuplicates: true });
  if (spErr) console.warn('seed subscription_plans:', spErr.message);

  // 15. Industry Guides (the CultureCalendar page shows these are missing)
  const { error: igErr } = await supabase.from('industry_guides').upsert([
    { title: 'Technology & SaaS Partnership Guide', industry: 'Technology', summary: 'How tech brands maximize ROI through creator partnerships', content: 'Technology brands see 3.2x higher engagement when partnering with authentic tech creators. Key strategies include product integration videos, early access programs, and educational content series.', best_practices: ['Partner with creators who genuinely use your products', 'Focus on educational content over promotional', 'Leverage long-form YouTube for complex products', 'Track attribution through custom links and codes'], published: true },
    { title: 'Beauty & Personal Care Playbook', industry: 'Beauty', summary: 'Creator partnership strategies for beauty brands', content: 'Beauty remains one of the top categories for influencer marketing with an average ROI of 5.2x. Tutorial content, GRWM videos, and authentic reviews drive the highest conversion rates.', best_practices: ['Send products early for genuine first impressions', 'Prioritize video content (Reels, TikTok, YouTube)', 'Include before/after results when applicable', 'Partner with diverse creators across skin types'], published: true },
    { title: 'Fitness & Wellness Brand Guide', industry: 'Fitness', summary: 'Building authentic fitness creator partnerships', content: 'Fitness creators generate the highest engagement rates across platforms, averaging 8.1% on TikTok. Challenge-based content and transformation stories drive virality and brand awareness.', best_practices: ['Support 30-day challenge formats', 'Provide affiliate codes for equipment', 'Focus on before/after transformation narratives', 'Partner across multiple fitness niches'], published: true },
    { title: 'Food & Beverage Partnership Strategies', industry: 'Food & Beverage', summary: 'How F&B brands win with creator content', content: 'Food content is the most shared category on social media. Recipe integration, taste tests, and meal prep content create the strongest brand affinity and purchase intent.', best_practices: ['Ship products for authentic recipe creation', 'Enable creative freedom in recipe development', 'Support both quick TikTok and long-form YouTube content', 'Partner with creators across dietary preferences'], published: true },
    { title: 'Fashion & Apparel Creator Guide', industry: 'Fashion', summary: 'Maximizing fashion brand visibility through creators', content: 'Fashion partnerships thrive on aesthetic alignment and authentic styling. Haul videos, OOTD content, and seasonal lookbooks consistently outperform traditional advertising in this space.', best_practices: ['Allow creators to style products their own way', 'Support try-on and haul content formats', 'Time campaigns with seasonal collections', 'Include size-inclusive creators in campaigns'], published: true },
    { title: 'Gaming & Entertainment Partnerships', industry: 'Gaming', summary: 'Engaging gaming audiences through creator sponsorships', content: 'Gaming creators offer unparalleled reach and engagement, particularly on YouTube and Twitch. Live streaming integrations, gameplay reviews, and esports partnerships deliver strong ROI.', best_practices: ['Sponsor gameplay streams for authentic exposure', 'Provide early access to games and hardware', 'Support tournament and esports partnerships', 'Focus on creators who match your game genre'], published: true },
  ], { ignoreDuplicates: true });
  if (igErr) console.warn('seed industry_guides:', igErr.message);

  report(totalSteps, totalSteps, 'Demo data loaded successfully!');
  return { success: true };
}
