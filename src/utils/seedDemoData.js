/**
 * Seeds the Supabase database with user-owned demo data through the authenticated client.
 * For reference data (events, benchmarks, demographics, etc.), run the SQL script:
 *   supabase/fix_schema_and_seed.sql
 * in the Supabase SQL Editor first.
 *
 * This utility handles tables that require created_by/owner_id/posted_by (RLS-protected).
 */
import { supabase } from '@/api/supabaseClient';

export async function seedDemoData(onProgress) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to seed data');
  const uid = user.id;

  const report = (step, total, label) => onProgress?.({ step, total, label });
  const totalSteps = 12;
  let step = 0;

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
  report(++step, totalSteps, 'Seeding applications...');
  await safeInsert('opportunity_applications', [
    { id: 'a1000000-0000-0000-0000-000000000001', opportunity_id: 'o1000000-0000-0000-0000-000000000002', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'accepted', cover_letter: 'I am deeply passionate about nutrition and your products align perfectly with my content pillars.', proposed_rate: 6500 },
    { id: 'a1000000-0000-0000-0000-000000000002', opportunity_id: 'o1000000-0000-0000-0000-000000000003', talent_email: 'mia@creator.example.com', talent_name: 'Mia Chen', status: 'reviewing', cover_letter: 'Fashion and lifestyle are at the core of my content.', proposed_rate: 4500 },
    { id: 'a1000000-0000-0000-0000-000000000003', opportunity_id: 'o1000000-0000-0000-0000-000000000004', talent_email: 'sam@creator.example.com', talent_name: 'Sam Rivers', status: 'pending', cover_letter: 'Clean beauty is my specialty.', proposed_rate: 3800 },
    { id: 'a1000000-0000-0000-0000-000000000004', opportunity_id: 'o1000000-0000-0000-0000-000000000002', talent_email: 'priya@creator.example.com', talent_name: 'Priya Sharma', status: 'pending', cover_letter: 'Healthy eating is a natural fit for my audience.', proposed_rate: 2200 },
    { id: 'a1000000-0000-0000-0000-000000000005', opportunity_id: 'o1000000-0000-0000-0000-000000000005', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'reviewing', cover_letter: 'Fitness challenges are my specialty.', proposed_rate: 9000 },
  ]);

  // 6. Outreach Sequences
  report(++step, totalSteps, 'Seeding outreach...');
  await safeInsert('outreach_sequences', [
    { id: 's1000000-0000-0000-0000-000000000001', name: 'Tech Creator Cold Outreach', description: 'Multi-step sequence for approaching tech creators', status: 'active', target_count: 50, sent_count: 32, open_rate: 68.5, reply_rate: 22.4, created_by: uid },
    { id: 's1000000-0000-0000-0000-000000000002', name: 'Fitness Brand Partnership Intro', description: 'Introduction sequence for fitness brand partnerships', status: 'active', target_count: 30, sent_count: 18, open_rate: 72.2, reply_rate: 28.6, created_by: uid },
    { id: 's1000000-0000-0000-0000-000000000003', name: 'Beauty Creator Campaign', description: 'Outreach for beauty campaign recruitment', status: 'paused', target_count: 40, sent_count: 15, open_rate: 60.0, reply_rate: 13.3, created_by: uid },
  ]);

  // 7. Outreach Emails
  await safeInsert('outreach_emails', [
    { id: 'oe000000-0000-0000-0000-000000000001', partnership_id: 'p1000000-0000-0000-0000-000000000004', sequence_id: 's1000000-0000-0000-0000-000000000001', subject: 'Partnership Opportunity with GlowSkin', body: 'Hi Sam, we love your skincare content and would love to discuss a partnership...', recipient_email: 'sam@creator.example.com', recipient_name: 'Sam Rivers', status: 'sent', created_by: uid },
    { id: 'oe000000-0000-0000-0000-000000000002', partnership_id: 'p1000000-0000-0000-0000-000000000008', sequence_id: 's1000000-0000-0000-0000-000000000003', subject: 'StyleForward Travel Fashion Collab', body: 'Hi Zoe, your travel photography is stunning...', recipient_email: 'zoe@creator.example.com', recipient_name: 'Zoe Campbell', status: 'draft', created_by: uid },
    { id: 'oe000000-0000-0000-0000-000000000003', partnership_id: 'p1000000-0000-0000-0000-000000000005', sequence_id: 's1000000-0000-0000-0000-000000000001', subject: 'PeakFit Tech Fitness Collaboration', body: 'Hi Jake, your tech reviews are impressive...', recipient_email: 'jake@creator.example.com', recipient_name: 'Jake Torres', status: 'opened', created_by: uid },
  ]);

  // 8. Approval Items
  report(++step, totalSteps, 'Seeding approvals & notes...');
  await safeInsert('approval_items', [
    { id: 'ai000000-0000-0000-0000-000000000001', title: 'Contract Review – NovaTech × Mia Chen', description: 'Review and approve the partnership contract', type: 'contract', status: 'approved', partnership_id: 'p1000000-0000-0000-0000-000000000001' },
    { id: 'ai000000-0000-0000-0000-000000000002', title: 'Content Brief – FreshBite × Aisha Patel', description: 'Review content brief before sending to creator', type: 'content_brief', status: 'pending', partnership_id: 'p1000000-0000-0000-0000-000000000002' },
    { id: 'ai000000-0000-0000-0000-000000000003', title: 'Payment Approval – $38,000', description: 'Approve payment release for contracted deal', type: 'payment', status: 'pending', partnership_id: 'p1000000-0000-0000-0000-000000000002' },
    { id: 'ai000000-0000-0000-0000-000000000004', title: 'Creative Assets Review – StyleForward', description: 'Review submitted brand assets for usage rights', type: 'creative', status: 'revision_requested', partnership_id: 'p1000000-0000-0000-0000-000000000003' },
  ]);

  // 9. Deal Notes
  await safeInsert('deal_notes', [
    { id: 'dn000000-0000-0000-0000-000000000001', partnership_id: 'p1000000-0000-0000-0000-000000000001', content: 'Had a great kickoff call with Mia. She is very enthusiastic about the tech angle. Content calendar locked in.', type: 'call', author_name: 'Alex Rivera', author_id: uid },
    { id: 'dn000000-0000-0000-0000-000000000002', partnership_id: 'p1000000-0000-0000-0000-000000000002', content: 'Contract signed. Shooting starts next week. Deliverables agreed: 8 TikToks + 6 IG posts.', type: 'note', author_name: 'Jordan Lee', author_id: uid },
    { id: 'dn000000-0000-0000-0000-000000000003', partnership_id: 'p1000000-0000-0000-0000-000000000003', content: 'StyleForward requested exclusivity clause. Need legal review.', type: 'note', author_name: 'Morgan Chen', author_id: uid },
    { id: 'dn000000-0000-0000-0000-000000000004', partnership_id: 'p1000000-0000-0000-0000-000000000007', content: 'Priya responded within 2 hours! Very interested. Scheduling discovery call.', type: 'email', author_name: 'Jordan Lee', author_id: uid },
  ]);

  // 10. Tasks
  report(++step, totalSteps, 'Seeding tasks & activities...');
  await safeInsert('tasks', [
    { id: 'tk000000-0000-0000-0000-000000000001', title: 'Send content brief to Mia Chen', description: 'Prepare and send the Q2 content brief', status: 'done', priority: 'high', partnership_id: 'p1000000-0000-0000-0000-000000000001', assigned_to_email: 'alex@partneriq.example.com', due_date: '2026-03-15', created_by: uid },
    { id: 'tk000000-0000-0000-0000-000000000002', title: 'Review contract for FreshBite deal', description: 'Legal review of exclusivity and payment terms', status: 'in_progress', priority: 'urgent', partnership_id: 'p1000000-0000-0000-0000-000000000002', assigned_to_email: 'legal@partneriq.example.com', due_date: '2026-03-10', created_by: uid },
    { id: 'tk000000-0000-0000-0000-000000000003', title: 'Follow up with StyleForward on usage rights', description: 'Get clarity on usage rights clause', status: 'todo', priority: 'high', partnership_id: 'p1000000-0000-0000-0000-000000000003', assigned_to_email: 'morgan@partneriq.example.com', due_date: '2026-03-12', created_by: uid },
    { id: 'tk000000-0000-0000-0000-000000000004', title: 'Schedule discovery call with Priya Sharma', description: 'Book 30-min call for FreshBite collaboration', status: 'todo', priority: 'medium', partnership_id: 'p1000000-0000-0000-0000-000000000007', assigned_to_email: 'jordan@partneriq.example.com', due_date: '2026-03-11', created_by: uid },
  ]);

  // 11. Activities
  await safeInsert('activities', [
    { id: 'ac000000-0000-0000-0000-000000000001', type: 'deal_created', description: 'New deal created: NovaTech × Mia Chen', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000001', user_name: 'Alex Rivera', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000002', type: 'stage_change', description: 'Deal moved to Active: FreshBite × Aisha Patel', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000002', user_name: 'Jordan Lee', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000003', type: 'note_added', description: 'New note added on StyleForward negotiation', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000003', user_name: 'Morgan Chen', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000004', type: 'email_sent', description: 'Outreach email sent to GlowSkin', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000004', user_name: 'Taylor Kim', user_id: uid },
    { id: 'ac000000-0000-0000-0000-000000000005', type: 'creator_replied', description: 'Priya Sharma replied to outreach!', entity_type: 'partnership', partnership_id: 'p1000000-0000-0000-0000-000000000007', user_name: 'Jordan Lee', user_id: uid },
  ]);

  // 12. Notifications for current user
  report(++step, totalSteps, 'Seeding notifications...');
  const { error: nErr } = await supabase.from('notifications').upsert([
    { id: 'n0000000-0000-0000-0000-000000000001', user_id: uid, title: 'New high-score match found', message: 'FreshBite × Priya Sharma scored 96% compatibility', type: 'success', read: false, action_url: '/partnerships' },
    { id: 'n0000000-0000-0000-0000-000000000002', user_id: uid, title: 'Approval pending', message: 'Content brief for FreshBite × Aisha Patel needs your review', type: 'warning', read: false, action_url: '/approvals' },
    { id: 'n0000000-0000-0000-0000-000000000003', user_id: uid, title: 'Creator replied to outreach', message: 'Priya Sharma responded to your outreach email', type: 'info', read: false, action_url: '/outreach' },
    { id: 'n0000000-0000-0000-0000-000000000004', user_id: uid, title: 'Deal value milestone', message: 'Your pipeline has reached $227,500 in total deal value', type: 'success', read: true, action_url: '/partnerships' },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (nErr) console.warn('seed notifications:', nErr.message);

  report(totalSteps, totalSteps, 'Demo data loaded successfully!');
  return { success: true };
}
