/**
 * Seeds the Supabase database with user-owned demo data through the authenticated client.
 * For reference data (events, benchmarks, demographics, etc.), run:
 *   supabase/migrations/003_add_frontend_columns.sql
 *   supabase/seed.sql
 * in the Supabase SQL Editor first.
 *
 * This utility handles tables that require user context (RLS-protected).
 * Column names match 001_create_tables.sql + 003_add_frontend_columns.sql
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
  // Schema: id, name, domain, logo_url, description, industry, company_size, location, contact_email, annual_budget, created_by
  report(++step, totalSteps, 'Seeding brands...');
  await safeInsert('brands', [
    { id: 'b1000000-0000-0000-0000-000000000001', name: 'NovaTech', industry: 'Technology', domain: 'novatech.example.com', description: 'Leading edge consumer tech brand', location: 'San Francisco, CA', annual_budget: 250000, contact_email: 'alex@novatech.example.com', created_by: uid },
    { id: 'b1000000-0000-0000-0000-000000000002', name: 'FreshBite Foods', industry: 'Food & Beverage', domain: 'freshbite.example.com', description: 'Organic meal prep and delivery', location: 'Austin, TX', annual_budget: 80000, contact_email: 'jordan@freshbite.example.com', created_by: uid },
    { id: 'b1000000-0000-0000-0000-000000000003', name: 'StyleForward', industry: 'Fashion & Apparel', domain: 'styleforward.example.com', description: 'Contemporary streetwear and athleisure', location: 'New York, NY', annual_budget: 150000, contact_email: 'morgan@styleforward.example.com', created_by: uid },
    { id: 'b1000000-0000-0000-0000-000000000004', name: 'GlowSkin', industry: 'Beauty & Personal Care', domain: 'glowskin.example.com', description: 'Clean beauty and skincare', location: 'Los Angeles, CA', annual_budget: 60000, contact_email: 'taylor@glowskin.example.com', created_by: uid },
    { id: 'b1000000-0000-0000-0000-000000000005', name: 'PeakFit', industry: 'Sports & Fitness', domain: 'peakfit.example.com', description: 'Performance fitness equipment and apparel', location: 'Denver, CO', annual_budget: 120000, contact_email: 'casey@peakfit.example.com', created_by: uid },
  ]);

  // 2. Talents
  // Schema: id, name, email, bio, avatar_url, location, status, primary_platform, niche, tier, trajectory, total_followers, engagement_rate, audience_quality_score, brand_safety_score, discovery_alpha_score, avg_likes, avg_comments, avg_views, rate_per_post
  report(++step, totalSteps, 'Seeding talents...');
  await safeInsert('talents', [
    { id: 't1000000-0000-0000-0000-000000000001', name: 'Mia Chen', email: 'mia@creator.example.com', primary_platform: 'instagram', niche: 'lifestyle', tier: 'macro', location: 'Los Angeles, CA', bio: 'Lifestyle creator sharing authentic daily content', total_followers: 850000, engagement_rate: 4.2, brand_safety_score: 92, discovery_alpha_score: 87, trajectory: 'rising', avg_views: 120000, rate_per_post: 8500 },
    { id: 't1000000-0000-0000-0000-000000000002', name: 'Jake Torres', email: 'jake@creator.example.com', primary_platform: 'youtube', niche: 'tech', tier: 'mid', location: 'Seattle, WA', bio: 'Tech reviewer and early adopter', total_followers: 420000, engagement_rate: 6.8, brand_safety_score: 96, discovery_alpha_score: 91, trajectory: 'rising', avg_views: 85000, rate_per_post: 5000 },
    { id: 't1000000-0000-0000-0000-000000000003', name: 'Aisha Patel', email: 'aisha@creator.example.com', primary_platform: 'tiktok', niche: 'fitness', tier: 'macro', location: 'Chicago, IL', bio: 'Certified personal trainer and motivational creator', total_followers: 1200000, engagement_rate: 8.1, brand_safety_score: 98, discovery_alpha_score: 94, trajectory: 'rising', avg_views: 350000, rate_per_post: 12000 },
    { id: 't1000000-0000-0000-0000-000000000004', name: 'Sam Rivers', email: 'sam@creator.example.com', primary_platform: 'instagram', niche: 'beauty', tier: 'mid', location: 'Miami, FL', bio: 'Beauty educator and product reviewer', total_followers: 380000, engagement_rate: 5.6, brand_safety_score: 95, discovery_alpha_score: 82, trajectory: 'stable', avg_views: 65000, rate_per_post: 4000 },
    { id: 't1000000-0000-0000-0000-000000000005', name: 'Leo Martinez', email: 'leo@creator.example.com', primary_platform: 'youtube', niche: 'gaming', tier: 'macro', location: 'Austin, TX', bio: 'Gaming content creator and streamer', total_followers: 920000, engagement_rate: 7.2, brand_safety_score: 88, discovery_alpha_score: 85, trajectory: 'rising', avg_views: 280000, rate_per_post: 9000 },
    { id: 't1000000-0000-0000-0000-000000000006', name: 'Priya Sharma', email: 'priya@creator.example.com', primary_platform: 'instagram', niche: 'food', tier: 'micro', location: 'Portland, OR', bio: 'Food blogger and recipe developer', total_followers: 95000, engagement_rate: 9.4, brand_safety_score: 99, discovery_alpha_score: 88, trajectory: 'rising', avg_views: 18000, rate_per_post: 1500 },
    { id: 't1000000-0000-0000-0000-000000000007', name: 'Ryan Walsh', email: 'ryan@creator.example.com', primary_platform: 'tiktok', niche: 'education', tier: 'mid', location: 'Boston, MA', bio: 'EdTech creator making learning fun', total_followers: 310000, engagement_rate: 11.2, brand_safety_score: 97, discovery_alpha_score: 93, trajectory: 'rising', avg_views: 95000, rate_per_post: 3500 },
    { id: 't1000000-0000-0000-0000-000000000008', name: 'Zoe Campbell', email: 'zoe@creator.example.com', primary_platform: 'instagram', niche: 'travel', tier: 'micro', location: 'Nashville, TN', bio: 'Travel photographer and adventure seeker', total_followers: 78000, engagement_rate: 7.8, brand_safety_score: 94, discovery_alpha_score: 79, trajectory: 'stable', avg_views: 12000, rate_per_post: 1200 },
  ]);

  // 3. Partnerships
  // Schema: id, title, brand_name, talent_name, brand_id, talent_id, status, deal_value, priority, partnership_type, match_score, assigned_to, notes
  report(++step, totalSteps, 'Seeding partnerships...');
  await safeInsert('partnerships', [
    { id: 'p1000000-0000-0000-0000-000000000001', title: 'NovaTech x Mia Chen – Lifestyle Tech Series', brand_id: 'b1000000-0000-0000-0000-000000000001', talent_id: 't1000000-0000-0000-0000-000000000001', brand_name: 'NovaTech', talent_name: 'Mia Chen', status: 'active', deal_value: 45000, match_score: 92, priority: 'high', assigned_to: 'sales@partneriq.example.com', notes: '6-part sponsored series launching Q2' },
    { id: 'p1000000-0000-0000-0000-000000000002', title: 'FreshBite x Aisha Patel – Nutrition Campaign', brand_id: 'b1000000-0000-0000-0000-000000000002', talent_id: 't1000000-0000-0000-0000-000000000003', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', status: 'contracted', deal_value: 38000, match_score: 95, priority: 'high', notes: 'Meal plan content integration' },
    { id: 'p1000000-0000-0000-0000-000000000003', title: 'StyleForward x Mia Chen – Fall Collection Drop', brand_id: 'b1000000-0000-0000-0000-000000000003', talent_id: 't1000000-0000-0000-0000-000000000001', brand_name: 'StyleForward', talent_name: 'Mia Chen', status: 'negotiating', deal_value: 28000, match_score: 88, priority: 'medium', notes: 'Negotiations ongoing on usage rights' },
    { id: 'p1000000-0000-0000-0000-000000000004', title: 'GlowSkin x Sam Rivers – Skincare Routine', brand_id: 'b1000000-0000-0000-0000-000000000004', talent_id: 't1000000-0000-0000-0000-000000000004', brand_name: 'GlowSkin', talent_name: 'Sam Rivers', status: 'outreach_sent', deal_value: 18000, match_score: 84, priority: 'medium', notes: 'First outreach sent, awaiting reply' },
    { id: 'p1000000-0000-0000-0000-000000000005', title: 'PeakFit x Jake Torres – Tech & Fitness Crossover', brand_id: 'b1000000-0000-0000-0000-000000000005', talent_id: 't1000000-0000-0000-0000-000000000002', brand_name: 'PeakFit', talent_name: 'Jake Torres', status: 'researching', deal_value: 22000, match_score: 79, priority: 'medium', notes: 'Reviewing tech fitness content fit' },
    { id: 'p1000000-0000-0000-0000-000000000006', title: 'NovaTech x Leo Martinez – Gaming Peripherals', brand_id: 'b1000000-0000-0000-0000-000000000001', talent_id: 't1000000-0000-0000-0000-000000000005', brand_name: 'NovaTech', talent_name: 'Leo Martinez', status: 'discovered', deal_value: 55000, match_score: 91, priority: 'high', notes: 'High priority gaming segment opportunity' },
    { id: 'p1000000-0000-0000-0000-000000000007', title: 'FreshBite x Priya Sharma – Recipe Collaboration', brand_id: 'b1000000-0000-0000-0000-000000000002', talent_id: 't1000000-0000-0000-0000-000000000006', brand_name: 'FreshBite Foods', talent_name: 'Priya Sharma', status: 'responded', deal_value: 12000, match_score: 96, priority: 'high', notes: 'Creator very enthusiastic, hot lead' },
    { id: 'p1000000-0000-0000-0000-000000000008', title: 'StyleForward x Zoe Campbell – Travel Fashion', brand_id: 'b1000000-0000-0000-0000-000000000003', talent_id: 't1000000-0000-0000-0000-000000000008', brand_name: 'StyleForward', talent_name: 'Zoe Campbell', status: 'outreach_pending', deal_value: 9500, match_score: 77, priority: 'low', notes: 'Draft outreach ready' },
  ]);

  // 4. Marketplace Opportunities
  // Schema: id, title, description, contract_type, budget_min, budget_max, timeline_start, timeline_end, required_platforms, required_niches, target_audience_size_min, target_audience_size_max, deliverables, brand_id, brand_name, created_by, status
  report(++step, totalSteps, 'Seeding marketplace opportunities...');
  await safeInsert('marketplace_opportunities', [
    { id: 'o1000000-0000-0000-0000-000000000001', title: 'Tech Product Launch – Q2 2026', brand_name: 'NovaTech', brand_id: 'b1000000-0000-0000-0000-000000000001', description: 'Looking for tech-savvy creators to launch our new smart home device line', status: 'published', contract_type: 'sponsored_post', budget_min: 5000, budget_max: 15000, required_niches: ['tech','lifestyle'], required_platforms: ['youtube','instagram'], target_audience_size_min: 100000, deliverables: ['2 YouTube videos','4 Instagram posts','8 Stories'], timeline_end: '2026-05-31', created_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000002', title: 'Healthy Eating Month Campaign', brand_name: 'FreshBite Foods', brand_id: 'b1000000-0000-0000-0000-000000000002', description: 'Partner with us to promote clean, nutritious eating habits', status: 'published', contract_type: 'ambassador', budget_min: 2000, budget_max: 8000, required_niches: ['fitness','food','lifestyle'], required_platforms: ['instagram','tiktok'], target_audience_size_min: 50000, deliverables: ['8 TikTok videos','12 Instagram posts'], timeline_end: '2026-04-30', created_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000003', title: 'Summer Streetwear Collection', brand_name: 'StyleForward', brand_id: 'b1000000-0000-0000-0000-000000000003', description: 'Feature our new summer collection in your content', status: 'published', contract_type: 'gifting_plus_fee', budget_min: 1500, budget_max: 6000, required_niches: ['fashion','lifestyle'], required_platforms: ['instagram','tiktok'], target_audience_size_min: 30000, deliverables: ['6 Instagram posts','10 Stories','3 Reels'], timeline_end: '2026-06-15', created_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000004', title: 'Clean Beauty Skincare Routine Series', brand_name: 'GlowSkin', brand_id: 'b1000000-0000-0000-0000-000000000004', description: 'Show your audience your skincare routine with our products', status: 'published', contract_type: 'sponsored_post', budget_min: 3000, budget_max: 10000, required_niches: ['beauty','wellness','lifestyle'], required_platforms: ['instagram','youtube'], target_audience_size_min: 75000, deliverables: ['3 YouTube videos','6 Instagram posts'], timeline_end: '2026-05-01', created_by: uid },
    { id: 'o1000000-0000-0000-0000-000000000005', title: 'Fitness Challenge Series', brand_name: 'PeakFit', brand_id: 'b1000000-0000-0000-0000-000000000005', description: '30-day fitness challenge featuring our equipment', status: 'published', contract_type: 'ambassador', budget_min: 4000, budget_max: 12000, required_niches: ['fitness','sports','health'], required_platforms: ['instagram','tiktok','youtube'], target_audience_size_min: 80000, deliverables: ['30-day daily Stories','4 long-form videos'], timeline_end: '2026-07-01', created_by: uid },
  ]);

  // 5. Opportunity Applications
  // Schema: id, opportunity_id, talent_email, talent_name, message, status
  report(++step, totalSteps, 'Seeding applications...');
  await safeInsert('opportunity_applications', [
    { id: 'a1000000-0000-0000-0000-000000000001', opportunity_id: 'o1000000-0000-0000-0000-000000000002', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'accepted', message: 'I am deeply passionate about nutrition and your products align perfectly with my content pillars.' },
    { id: 'a1000000-0000-0000-0000-000000000002', opportunity_id: 'o1000000-0000-0000-0000-000000000003', talent_email: 'mia@creator.example.com', talent_name: 'Mia Chen', status: 'reviewing', message: 'Fashion and lifestyle are at the core of my content.' },
    { id: 'a1000000-0000-0000-0000-000000000003', opportunity_id: 'o1000000-0000-0000-0000-000000000004', talent_email: 'sam@creator.example.com', talent_name: 'Sam Rivers', status: 'pending', message: 'Clean beauty is my specialty.' },
    { id: 'a1000000-0000-0000-0000-000000000004', opportunity_id: 'o1000000-0000-0000-0000-000000000002', talent_email: 'priya@creator.example.com', talent_name: 'Priya Sharma', status: 'pending', message: 'Healthy eating is a natural fit for my audience.' },
    { id: 'a1000000-0000-0000-0000-000000000005', opportunity_id: 'o1000000-0000-0000-0000-000000000005', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'reviewing', message: 'Fitness challenges are my specialty.' },
  ]);

  // 6. Outreach Sequences
  // Schema: id, name, description, target_name, target_email, steps, status, current_step, partnership_id
  report(++step, totalSteps, 'Seeding outreach...');
  await safeInsert('outreach_sequences', [
    { id: 's1000000-0000-0000-0000-000000000001', name: 'Tech Creator Cold Outreach', description: 'Multi-step sequence for approaching tech creators', status: 'active', partnership_id: 'p1000000-0000-0000-0000-000000000001', target_name: 'Mia Chen', target_email: 'mia@creator.example.com', steps: [{ step: 1, type: 'email', subject: 'Partnership opportunity with NovaTech', status: 'sent' }, { step: 2, type: 'follow_up', subject: 'Following up on NovaTech collab', status: 'sent' }] },
    { id: 's1000000-0000-0000-0000-000000000002', name: 'Fitness Brand Partnership Intro', description: 'Introduction sequence for fitness brand partnerships', status: 'active', partnership_id: 'p1000000-0000-0000-0000-000000000002', target_name: 'Aisha Patel', target_email: 'aisha@creator.example.com', steps: [{ step: 1, type: 'email', subject: 'FreshBite x Aisha – lets talk nutrition content', status: 'sent' }] },
    { id: 's1000000-0000-0000-0000-000000000003', name: 'Beauty Creator Campaign', description: 'Outreach for beauty campaign recruitment', status: 'draft', partnership_id: 'p1000000-0000-0000-0000-000000000004', target_name: 'Sam Rivers', target_email: 'sam@creator.example.com', steps: [{ step: 1, type: 'email', subject: 'GlowSkin partnership opportunity', status: 'draft' }] },
  ]);

  // 7. Outreach Emails
  // Schema: id, to_email, to_name, subject, body, email_type, status, ai_generated, assigned_to, partnership_id, sequence_id
  await safeInsert('outreach_emails', [
    { id: 'oe000000-0000-0000-0000-000000000001', partnership_id: 'p1000000-0000-0000-0000-000000000004', sequence_id: 's1000000-0000-0000-0000-000000000001', subject: 'Partnership Opportunity with GlowSkin', body: 'Hi Sam, we love your skincare content and would love to discuss a partnership...', to_email: 'sam@creator.example.com', to_name: 'Sam Rivers', status: 'sent' },
    { id: 'oe000000-0000-0000-0000-000000000002', partnership_id: 'p1000000-0000-0000-0000-000000000008', sequence_id: 's1000000-0000-0000-0000-000000000003', subject: 'StyleForward Travel Fashion Collab', body: 'Hi Zoe, your travel photography is stunning...', to_email: 'zoe@creator.example.com', to_name: 'Zoe Campbell', status: 'draft' },
    { id: 'oe000000-0000-0000-0000-000000000003', partnership_id: 'p1000000-0000-0000-0000-000000000005', sequence_id: 's1000000-0000-0000-0000-000000000001', subject: 'PeakFit Tech Fitness Collaboration', body: 'Hi Jake, your tech reviews are impressive...', to_email: 'jake@creator.example.com', to_name: 'Jake Torres', status: 'draft' },
  ]);

  // 8. Approval Items
  // Schema: id, item_type, reference_id, title, description, priority, status, deal_value, match_score, brand_name, talent_name
  report(++step, totalSteps, 'Seeding approvals & notes...');
  await safeInsert('approval_items', [
    { id: 'ai000000-0000-0000-0000-000000000001', title: 'Contract Review – NovaTech x Mia Chen', description: 'Review and approve the partnership contract', item_type: 'contract', status: 'approved', reference_id: 'p1000000-0000-0000-0000-000000000001', brand_name: 'NovaTech', talent_name: 'Mia Chen', deal_value: 45000 },
    { id: 'ai000000-0000-0000-0000-000000000002', title: 'Content Brief – FreshBite x Aisha Patel', description: 'Review content brief before sending to creator', item_type: 'content_brief', status: 'pending', reference_id: 'p1000000-0000-0000-0000-000000000002', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', deal_value: 38000 },
    { id: 'ai000000-0000-0000-0000-000000000003', title: 'Payment Approval – $38,000', description: 'Approve payment release for contracted deal', item_type: 'payment', status: 'pending', reference_id: 'p1000000-0000-0000-0000-000000000002', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', deal_value: 38000 },
    { id: 'ai000000-0000-0000-0000-000000000004', title: 'Creative Assets Review – StyleForward', description: 'Review submitted brand assets for usage rights', item_type: 'creative', status: 'revision_requested', reference_id: 'p1000000-0000-0000-0000-000000000003', brand_name: 'StyleForward', talent_name: 'Mia Chen', deal_value: 28000 },
  ]);

  // 9. Deal Notes
  // Schema: id, partnership_id, content, note_type, author_email, author_name
  await safeInsert('deal_notes', [
    { id: 'dn000000-0000-0000-0000-000000000001', partnership_id: 'p1000000-0000-0000-0000-000000000001', content: 'Had a great kickoff call with Mia. She is very enthusiastic about the tech angle. Content calendar locked in.', note_type: 'call', author_name: 'Alex Rivera' },
    { id: 'dn000000-0000-0000-0000-000000000002', partnership_id: 'p1000000-0000-0000-0000-000000000002', content: 'Contract signed. Shooting starts next week. Deliverables agreed: 8 TikToks + 6 IG posts.', note_type: 'note', author_name: 'Jordan Lee' },
    { id: 'dn000000-0000-0000-0000-000000000003', partnership_id: 'p1000000-0000-0000-0000-000000000003', content: 'StyleForward requested exclusivity clause. Need legal review.', note_type: 'note', author_name: 'Morgan Chen' },
    { id: 'dn000000-0000-0000-0000-000000000004', partnership_id: 'p1000000-0000-0000-0000-000000000007', content: 'Priya responded within 2 hours! Very interested. Scheduling discovery call.', note_type: 'email', author_name: 'Jordan Lee' },
  ]);

  // 10. Tasks
  // Schema: id, title, status, priority, assigned_to_email, assigned_to_name, assigned_by_email, due_date, partnership_id, context_label
  report(++step, totalSteps, 'Seeding tasks & activities...');
  await safeInsert('tasks', [
    { id: 'tk000000-0000-0000-0000-000000000001', title: 'Send content brief to Mia Chen', status: 'done', priority: 'high', partnership_id: 'p1000000-0000-0000-0000-000000000001', assigned_to_email: 'alex@partneriq.example.com', due_date: '2026-03-15' },
    { id: 'tk000000-0000-0000-0000-000000000002', title: 'Review contract for FreshBite deal', status: 'in_progress', priority: 'urgent', partnership_id: 'p1000000-0000-0000-0000-000000000002', assigned_to_email: 'legal@partneriq.example.com', due_date: '2026-03-10' },
    { id: 'tk000000-0000-0000-0000-000000000003', title: 'Follow up with StyleForward on usage rights', status: 'todo', priority: 'high', partnership_id: 'p1000000-0000-0000-0000-000000000003', assigned_to_email: 'morgan@partneriq.example.com', due_date: '2026-03-12' },
    { id: 'tk000000-0000-0000-0000-000000000004', title: 'Schedule discovery call with Priya Sharma', status: 'todo', priority: 'medium', partnership_id: 'p1000000-0000-0000-0000-000000000007', assigned_to_email: 'jordan@partneriq.example.com', due_date: '2026-03-11' },
  ]);

  // 11. Activities
  // Schema: id, action, description, resource_type, resource_id, actor_email, actor_name
  await safeInsert('activities', [
    { id: 'ac000000-0000-0000-0000-000000000001', action: 'deal_created', description: 'New deal created: NovaTech x Mia Chen', resource_type: 'partnership', resource_id: 'p1000000-0000-0000-0000-000000000001', actor_name: 'Alex Rivera' },
    { id: 'ac000000-0000-0000-0000-000000000002', action: 'stage_change', description: 'Deal moved to Active: FreshBite x Aisha Patel', resource_type: 'partnership', resource_id: 'p1000000-0000-0000-0000-000000000002', actor_name: 'Jordan Lee' },
    { id: 'ac000000-0000-0000-0000-000000000003', action: 'note_added', description: 'New note added on StyleForward negotiation', resource_type: 'partnership', resource_id: 'p1000000-0000-0000-0000-000000000003', actor_name: 'Morgan Chen' },
    { id: 'ac000000-0000-0000-0000-000000000004', action: 'email_sent', description: 'Outreach email sent to GlowSkin', resource_type: 'partnership', resource_id: 'p1000000-0000-0000-0000-000000000004', actor_name: 'Taylor Kim' },
    { id: 'ac000000-0000-0000-0000-000000000005', action: 'creator_replied', description: 'Priya Sharma replied to outreach!', resource_type: 'partnership', resource_id: 'p1000000-0000-0000-0000-000000000007', actor_name: 'Jordan Lee' },
  ]);

  // 12. Notifications for current user
  // Schema: id, user_email, title, message, type, status, resource_type, resource_id
  report(++step, totalSteps, 'Seeding notifications...');
  const userEmail = user.email || '';
  const { error: nErr } = await supabase.from('notifications').upsert([
    { id: 'n0000000-0000-0000-0000-000000000001', user_email: userEmail, title: 'New high-score match found', message: 'FreshBite x Priya Sharma scored 96% compatibility', type: 'success', status: 'unread', resource_type: 'partnership', resource_id: 'p1000000-0000-0000-0000-000000000007' },
    { id: 'n0000000-0000-0000-0000-000000000002', user_email: userEmail, title: 'Approval pending', message: 'Content brief for FreshBite x Aisha Patel needs your review', type: 'warning', status: 'unread', resource_type: 'approval', resource_id: 'ai000000-0000-0000-0000-000000000002' },
    { id: 'n0000000-0000-0000-0000-000000000003', user_email: userEmail, title: 'Creator replied to outreach', message: 'Priya Sharma responded to your outreach email', type: 'info', status: 'unread', resource_type: 'outreach', resource_id: 's1000000-0000-0000-0000-000000000002' },
    { id: 'n0000000-0000-0000-0000-000000000004', user_email: userEmail, title: 'Deal value milestone', message: 'Your pipeline has reached $227,500 in total deal value', type: 'success', status: 'read', resource_type: 'partnership' },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (nErr) console.warn('seed notifications:', nErr.message);

  report(totalSteps, totalSteps, 'Demo data loaded successfully!');
  return { success: true };
}
