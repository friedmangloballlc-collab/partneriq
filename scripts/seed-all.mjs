/**
 * Comprehensive seed script — runs via Node.js, no browser needed.
 * Seeds ALL tables the app needs: core data + reference data (events, benchmarks, etc.)
 *
 * Usage:  node scripts/seed-all.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiygbtpsfumwvhzbudij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWdidHBzZnVtd3ZoemJ1ZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgxMjUsImV4cCI6MjA4Nzk5NDEyNX0.qrIkEt-ZOIIs8-isz5qYaFZWEeVfYXqH6nir1u0vtrE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function upsert(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  if (error) {
    console.error(`  ERROR ${table}: ${error.message}`);
    return false;
  }
  console.log(`  ✓ ${table} — ${rows.length} rows`);
  return true;
}

async function main() {
  console.log('🌱 Seeding PartnerIQ database...\n');

  // ── 1. BRANDS ──
  await upsert('brands', [
    { id: 'b1000000-0000-0000-0000-000000000001', name: 'NovaTech', industry: 'Technology', domain: 'novatech.example.com', description: 'Leading edge consumer tech brand', location: 'San Francisco, CA', annual_budget: 250000, contact_email: 'alex@novatech.example.com' },
    { id: 'b1000000-0000-0000-0000-000000000002', name: 'FreshBite Foods', industry: 'Food & Beverage', domain: 'freshbite.example.com', description: 'Organic meal prep and delivery', location: 'Austin, TX', annual_budget: 80000, contact_email: 'jordan@freshbite.example.com' },
    { id: 'b1000000-0000-0000-0000-000000000003', name: 'StyleForward', industry: 'Fashion & Apparel', domain: 'styleforward.example.com', description: 'Contemporary streetwear and athleisure', location: 'New York, NY', annual_budget: 150000, contact_email: 'morgan@styleforward.example.com' },
    { id: 'b1000000-0000-0000-0000-000000000004', name: 'GlowSkin', industry: 'Beauty & Personal Care', domain: 'glowskin.example.com', description: 'Clean beauty and skincare', location: 'Los Angeles, CA', annual_budget: 60000, contact_email: 'taylor@glowskin.example.com' },
    { id: 'b1000000-0000-0000-0000-000000000005', name: 'PeakFit', industry: 'Sports & Fitness', domain: 'peakfit.example.com', description: 'Performance fitness equipment and apparel', location: 'Denver, CO', annual_budget: 120000, contact_email: 'casey@peakfit.example.com' },
  ]);

  // ── 2. TALENTS ──
  await upsert('talents', [
    { id: '01000000-0000-0000-0000-000000000001', name: 'Mia Chen', email: 'mia@creator.example.com', primary_platform: 'instagram', niche: 'lifestyle', tier: 'macro', location: 'Los Angeles, CA', bio: 'Lifestyle creator sharing authentic daily content', total_followers: 850000, engagement_rate: 4.2, brand_safety_score: 92, discovery_alpha_score: 87, trajectory: 'rising', avg_views: 120000, rate_per_post: 8500 },
    { id: '01000000-0000-0000-0000-000000000002', name: 'Jake Torres', email: 'jake@creator.example.com', primary_platform: 'youtube', niche: 'tech', tier: 'mid', location: 'Seattle, WA', bio: 'Tech reviewer and early adopter', total_followers: 420000, engagement_rate: 6.8, brand_safety_score: 96, discovery_alpha_score: 91, trajectory: 'rising', avg_views: 85000, rate_per_post: 5000 },
    { id: '01000000-0000-0000-0000-000000000003', name: 'Aisha Patel', email: 'aisha@creator.example.com', primary_platform: 'tiktok', niche: 'fitness', tier: 'macro', location: 'Chicago, IL', bio: 'Certified personal trainer and motivational creator', total_followers: 1200000, engagement_rate: 8.1, brand_safety_score: 98, discovery_alpha_score: 94, trajectory: 'rising', avg_views: 350000, rate_per_post: 12000 },
    { id: '01000000-0000-0000-0000-000000000004', name: 'Sam Rivers', email: 'sam@creator.example.com', primary_platform: 'instagram', niche: 'beauty', tier: 'mid', location: 'Miami, FL', bio: 'Beauty educator and product reviewer', total_followers: 380000, engagement_rate: 5.6, brand_safety_score: 95, discovery_alpha_score: 82, trajectory: 'stable', avg_views: 65000, rate_per_post: 4000 },
    { id: '01000000-0000-0000-0000-000000000005', name: 'Leo Martinez', email: 'leo@creator.example.com', primary_platform: 'youtube', niche: 'gaming', tier: 'macro', location: 'Austin, TX', bio: 'Gaming content creator and streamer', total_followers: 920000, engagement_rate: 7.2, brand_safety_score: 88, discovery_alpha_score: 85, trajectory: 'rising', avg_views: 280000, rate_per_post: 9000 },
    { id: '01000000-0000-0000-0000-000000000006', name: 'Priya Sharma', email: 'priya@creator.example.com', primary_platform: 'instagram', niche: 'food', tier: 'micro', location: 'Portland, OR', bio: 'Food blogger and recipe developer', total_followers: 95000, engagement_rate: 9.4, brand_safety_score: 99, discovery_alpha_score: 88, trajectory: 'rising', avg_views: 18000, rate_per_post: 1500 },
    { id: '01000000-0000-0000-0000-000000000007', name: 'Ryan Walsh', email: 'ryan@creator.example.com', primary_platform: 'tiktok', niche: 'education', tier: 'mid', location: 'Boston, MA', bio: 'EdTech creator making learning fun', total_followers: 310000, engagement_rate: 11.2, brand_safety_score: 97, discovery_alpha_score: 93, trajectory: 'rising', avg_views: 95000, rate_per_post: 3500 },
    { id: '01000000-0000-0000-0000-000000000008', name: 'Zoe Campbell', email: 'zoe@creator.example.com', primary_platform: 'instagram', niche: 'travel', tier: 'micro', location: 'Nashville, TN', bio: 'Travel photographer and adventure seeker', total_followers: 78000, engagement_rate: 7.8, brand_safety_score: 94, discovery_alpha_score: 79, trajectory: 'stable', avg_views: 12000, rate_per_post: 1200 },
  ]);

  // ── 3. PARTNERSHIPS ──
  await upsert('partnerships', [
    { id: 'c1000000-0000-0000-0000-000000000001', title: 'NovaTech x Mia Chen - Lifestyle Tech Series', brand_id: 'b1000000-0000-0000-0000-000000000001', talent_id: '01000000-0000-0000-0000-000000000001', brand_name: 'NovaTech', talent_name: 'Mia Chen', status: 'active', deal_value: 45000, match_score: 92, priority: 'high', assigned_to: 'sales@partneriq.example.com', notes: '6-part sponsored series launching Q2' },
    { id: 'c1000000-0000-0000-0000-000000000002', title: 'FreshBite x Aisha Patel - Nutrition Campaign', brand_id: 'b1000000-0000-0000-0000-000000000002', talent_id: '01000000-0000-0000-0000-000000000003', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', status: 'contracted', deal_value: 38000, match_score: 95, priority: 'high', notes: 'Meal plan content integration' },
    { id: 'c1000000-0000-0000-0000-000000000003', title: 'StyleForward x Mia Chen - Fall Collection Drop', brand_id: 'b1000000-0000-0000-0000-000000000003', talent_id: '01000000-0000-0000-0000-000000000001', brand_name: 'StyleForward', talent_name: 'Mia Chen', status: 'negotiating', deal_value: 28000, match_score: 88, priority: 'medium', notes: 'Negotiations ongoing on usage rights' },
    { id: 'c1000000-0000-0000-0000-000000000004', title: 'GlowSkin x Sam Rivers - Skincare Routine', brand_id: 'b1000000-0000-0000-0000-000000000004', talent_id: '01000000-0000-0000-0000-000000000004', brand_name: 'GlowSkin', talent_name: 'Sam Rivers', status: 'outreach_sent', deal_value: 18000, match_score: 84, priority: 'medium', notes: 'First outreach sent, awaiting reply' },
    { id: 'c1000000-0000-0000-0000-000000000005', title: 'PeakFit x Jake Torres - Tech & Fitness Crossover', brand_id: 'b1000000-0000-0000-0000-000000000005', talent_id: '01000000-0000-0000-0000-000000000002', brand_name: 'PeakFit', talent_name: 'Jake Torres', status: 'researching', deal_value: 22000, match_score: 79, priority: 'medium', notes: 'Reviewing tech fitness content fit' },
    { id: 'c1000000-0000-0000-0000-000000000006', title: 'NovaTech x Leo Martinez - Gaming Peripherals', brand_id: 'b1000000-0000-0000-0000-000000000001', talent_id: '01000000-0000-0000-0000-000000000005', brand_name: 'NovaTech', talent_name: 'Leo Martinez', status: 'discovered', deal_value: 55000, match_score: 91, priority: 'high', notes: 'High priority gaming segment opportunity' },
    { id: 'c1000000-0000-0000-0000-000000000007', title: 'FreshBite x Priya Sharma - Recipe Collaboration', brand_id: 'b1000000-0000-0000-0000-000000000002', talent_id: '01000000-0000-0000-0000-000000000006', brand_name: 'FreshBite Foods', talent_name: 'Priya Sharma', status: 'responded', deal_value: 12000, match_score: 96, priority: 'high', notes: 'Creator very enthusiastic, hot lead' },
    { id: 'c1000000-0000-0000-0000-000000000008', title: 'StyleForward x Zoe Campbell - Travel Fashion', brand_id: 'b1000000-0000-0000-0000-000000000003', talent_id: '01000000-0000-0000-0000-000000000008', brand_name: 'StyleForward', talent_name: 'Zoe Campbell', status: 'outreach_pending', deal_value: 9500, match_score: 77, priority: 'low', notes: 'Draft outreach ready' },
  ]);

  // ── 4. MARKETPLACE OPPORTUNITIES ──
  await upsert('marketplace_opportunities', [
    { id: 'd1000000-0000-0000-0000-000000000001', title: 'Tech Product Launch - Q2 2026', brand_name: 'NovaTech', brand_id: 'b1000000-0000-0000-0000-000000000001', description: 'Looking for tech-savvy creators to launch our new smart home device line', status: 'published', contract_type: 'sponsored_post', budget_min: 5000, budget_max: 15000, required_niches: ['tech','lifestyle'], required_platforms: ['youtube','instagram'], target_audience_size_min: 100000, deliverables: ['2 YouTube videos','4 Instagram posts','8 Stories'], timeline_end: '2026-05-31' },
    { id: 'd1000000-0000-0000-0000-000000000002', title: 'Healthy Eating Month Campaign', brand_name: 'FreshBite Foods', brand_id: 'b1000000-0000-0000-0000-000000000002', description: 'Partner with us to promote clean, nutritious eating habits', status: 'published', contract_type: 'ambassador', budget_min: 2000, budget_max: 8000, required_niches: ['fitness','food','lifestyle'], required_platforms: ['instagram','tiktok'], target_audience_size_min: 50000, deliverables: ['8 TikTok videos','12 Instagram posts'], timeline_end: '2026-04-30' },
    { id: 'd1000000-0000-0000-0000-000000000003', title: 'Summer Streetwear Collection', brand_name: 'StyleForward', brand_id: 'b1000000-0000-0000-0000-000000000003', description: 'Feature our new summer collection in your content', status: 'published', contract_type: 'gifting_plus_fee', budget_min: 1500, budget_max: 6000, required_niches: ['fashion','lifestyle'], required_platforms: ['instagram','tiktok'], target_audience_size_min: 30000, deliverables: ['6 Instagram posts','10 Stories','3 Reels'], timeline_end: '2026-06-15' },
    { id: 'd1000000-0000-0000-0000-000000000004', title: 'Clean Beauty Skincare Routine Series', brand_name: 'GlowSkin', brand_id: 'b1000000-0000-0000-0000-000000000004', description: 'Show your audience your skincare routine with our products', status: 'published', contract_type: 'sponsored_post', budget_min: 3000, budget_max: 10000, required_niches: ['beauty','wellness','lifestyle'], required_platforms: ['instagram','youtube'], target_audience_size_min: 75000, deliverables: ['3 YouTube videos','6 Instagram posts'], timeline_end: '2026-05-01' },
    { id: 'd1000000-0000-0000-0000-000000000005', title: 'Fitness Challenge Series', brand_name: 'PeakFit', brand_id: 'b1000000-0000-0000-0000-000000000005', description: '30-day fitness challenge featuring our equipment', status: 'published', contract_type: 'ambassador', budget_min: 4000, budget_max: 12000, required_niches: ['fitness','sports','health'], required_platforms: ['instagram','tiktok','youtube'], target_audience_size_min: 80000, deliverables: ['30-day daily Stories','4 long-form videos'], timeline_end: '2026-07-01' },
  ]);

  // ── 5. OPPORTUNITY APPLICATIONS ──
  await upsert('opportunity_applications', [
    { id: 'a1000000-0000-0000-0000-000000000001', opportunity_id: 'd1000000-0000-0000-0000-000000000002', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'accepted', message: 'I am deeply passionate about nutrition and your products align perfectly with my content pillars.' },
    { id: 'a1000000-0000-0000-0000-000000000002', opportunity_id: 'd1000000-0000-0000-0000-000000000003', talent_email: 'mia@creator.example.com', talent_name: 'Mia Chen', status: 'reviewing', message: 'Fashion and lifestyle are at the core of my content.' },
    { id: 'a1000000-0000-0000-0000-000000000003', opportunity_id: 'd1000000-0000-0000-0000-000000000004', talent_email: 'sam@creator.example.com', talent_name: 'Sam Rivers', status: 'pending', message: 'Clean beauty is my specialty.' },
    { id: 'a1000000-0000-0000-0000-000000000004', opportunity_id: 'd1000000-0000-0000-0000-000000000002', talent_email: 'priya@creator.example.com', talent_name: 'Priya Sharma', status: 'pending', message: 'Healthy eating is a natural fit for my audience.' },
    { id: 'a1000000-0000-0000-0000-000000000005', opportunity_id: 'd1000000-0000-0000-0000-000000000005', talent_email: 'aisha@creator.example.com', talent_name: 'Aisha Patel', status: 'reviewing', message: 'Fitness challenges are my specialty.' },
  ]);

  // ── 6. OUTREACH SEQUENCES ──
  await upsert('outreach_sequences', [
    { id: 'e1000000-0000-0000-0000-000000000001', name: 'Tech Creator Cold Outreach', description: 'Multi-step sequence for approaching tech creators', status: 'active', partnership_id: 'c1000000-0000-0000-0000-000000000001', target_name: 'Mia Chen', target_email: 'mia@creator.example.com', steps: [{ step: 1, type: 'email', subject: 'Partnership opportunity with NovaTech', status: 'sent' }, { step: 2, type: 'follow_up', subject: 'Following up on NovaTech collab', status: 'sent' }] },
    { id: 'e1000000-0000-0000-0000-000000000002', name: 'Fitness Brand Partnership Intro', description: 'Introduction sequence for fitness brand partnerships', status: 'active', partnership_id: 'c1000000-0000-0000-0000-000000000002', target_name: 'Aisha Patel', target_email: 'aisha@creator.example.com', steps: [{ step: 1, type: 'email', subject: 'FreshBite x Aisha - lets talk nutrition content', status: 'sent' }] },
    { id: 'e1000000-0000-0000-0000-000000000003', name: 'Beauty Creator Campaign', description: 'Outreach for beauty campaign recruitment', status: 'draft', partnership_id: 'c1000000-0000-0000-0000-000000000004', target_name: 'Sam Rivers', target_email: 'sam@creator.example.com', steps: [{ step: 1, type: 'email', subject: 'GlowSkin partnership opportunity', status: 'draft' }] },
  ]);

  // ── 7. OUTREACH EMAILS ──
  await upsert('outreach_emails', [
    { id: 'ee000000-0000-0000-0000-000000000001', partnership_id: 'c1000000-0000-0000-0000-000000000004', sequence_id: 'e1000000-0000-0000-0000-000000000001', subject: 'Partnership Opportunity with GlowSkin', body: 'Hi Sam, we love your skincare content and would love to discuss a partnership...', to_email: 'sam@creator.example.com', to_name: 'Sam Rivers', status: 'sent' },
    { id: 'ee000000-0000-0000-0000-000000000002', partnership_id: 'c1000000-0000-0000-0000-000000000008', sequence_id: 'e1000000-0000-0000-0000-000000000003', subject: 'StyleForward Travel Fashion Collab', body: 'Hi Zoe, your travel photography is stunning...', to_email: 'zoe@creator.example.com', to_name: 'Zoe Campbell', status: 'draft' },
    { id: 'ee000000-0000-0000-0000-000000000003', partnership_id: 'c1000000-0000-0000-0000-000000000005', sequence_id: 'e1000000-0000-0000-0000-000000000001', subject: 'PeakFit Tech Fitness Collaboration', body: 'Hi Jake, your tech reviews are impressive...', to_email: 'jake@creator.example.com', to_name: 'Jake Torres', status: 'draft' },
  ]);

  // ── 8. APPROVAL ITEMS ──
  await upsert('approval_items', [
    { id: 'af000000-0000-0000-0000-000000000001', title: 'Contract Review - NovaTech x Mia Chen', description: 'Review and approve the partnership contract', item_type: 'contract', status: 'approved', reference_id: 'c1000000-0000-0000-0000-000000000001', brand_name: 'NovaTech', talent_name: 'Mia Chen', deal_value: 45000 },
    { id: 'af000000-0000-0000-0000-000000000002', title: 'Content Brief - FreshBite x Aisha Patel', description: 'Review content brief before sending to creator', item_type: 'content_brief', status: 'pending', reference_id: 'c1000000-0000-0000-0000-000000000002', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', deal_value: 38000 },
    { id: 'af000000-0000-0000-0000-000000000003', title: 'Payment Approval - $38,000', description: 'Approve payment release for contracted deal', item_type: 'payment', status: 'pending', reference_id: 'c1000000-0000-0000-0000-000000000002', brand_name: 'FreshBite Foods', talent_name: 'Aisha Patel', deal_value: 38000 },
    { id: 'af000000-0000-0000-0000-000000000004', title: 'Creative Assets Review - StyleForward', description: 'Review submitted brand assets for usage rights', item_type: 'creative', status: 'revision_requested', reference_id: 'c1000000-0000-0000-0000-000000000003', brand_name: 'StyleForward', talent_name: 'Mia Chen', deal_value: 28000 },
  ]);

  // ── 9. DEAL NOTES ──
  await upsert('deal_notes', [
    { id: 'de000000-0000-0000-0000-000000000001', partnership_id: 'c1000000-0000-0000-0000-000000000001', content: 'Had a great kickoff call with Mia. She is very enthusiastic about the tech angle.', note_type: 'call', author_name: 'Alex Rivera' },
    { id: 'de000000-0000-0000-0000-000000000002', partnership_id: 'c1000000-0000-0000-0000-000000000002', content: 'Contract signed. Shooting starts next week.', note_type: 'note', author_name: 'Jordan Lee' },
    { id: 'de000000-0000-0000-0000-000000000003', partnership_id: 'c1000000-0000-0000-0000-000000000003', content: 'StyleForward requested exclusivity clause. Need legal review.', note_type: 'note', author_name: 'Morgan Chen' },
    { id: 'de000000-0000-0000-0000-000000000004', partnership_id: 'c1000000-0000-0000-0000-000000000007', content: 'Priya responded within 2 hours! Very interested.', note_type: 'email', author_name: 'Jordan Lee' },
  ]);

  // ── 10. TASKS ──
  await upsert('tasks', [
    { id: 'f0000000-0000-0000-0000-000000000001', title: 'Send content brief to Mia Chen', status: 'done', priority: 'high', partnership_id: 'c1000000-0000-0000-0000-000000000001', assigned_to_email: 'alex@partneriq.example.com', due_date: '2026-03-15' },
    { id: 'f0000000-0000-0000-0000-000000000002', title: 'Review contract for FreshBite deal', status: 'in_progress', priority: 'urgent', partnership_id: 'c1000000-0000-0000-0000-000000000002', assigned_to_email: 'legal@partneriq.example.com', due_date: '2026-03-10' },
    { id: 'f0000000-0000-0000-0000-000000000003', title: 'Follow up with StyleForward on usage rights', status: 'todo', priority: 'high', partnership_id: 'c1000000-0000-0000-0000-000000000003', assigned_to_email: 'morgan@partneriq.example.com', due_date: '2026-03-12' },
    { id: 'f0000000-0000-0000-0000-000000000004', title: 'Schedule discovery call with Priya Sharma', status: 'todo', priority: 'medium', partnership_id: 'c1000000-0000-0000-0000-000000000007', assigned_to_email: 'jordan@partneriq.example.com', due_date: '2026-03-11' },
  ]);

  // ── 11. ACTIVITIES ──
  await upsert('activities', [
    { id: 'ac000000-0000-0000-0000-000000000001', action: 'deal_created', description: 'New deal created: NovaTech x Mia Chen', resource_type: 'partnership', resource_id: 'c1000000-0000-0000-0000-000000000001', actor_name: 'Alex Rivera' },
    { id: 'ac000000-0000-0000-0000-000000000002', action: 'stage_change', description: 'Deal moved to Active: FreshBite x Aisha Patel', resource_type: 'partnership', resource_id: 'c1000000-0000-0000-0000-000000000002', actor_name: 'Jordan Lee' },
    { id: 'ac000000-0000-0000-0000-000000000003', action: 'note_added', description: 'New note added on StyleForward negotiation', resource_type: 'partnership', resource_id: 'c1000000-0000-0000-0000-000000000003', actor_name: 'Morgan Chen' },
    { id: 'ac000000-0000-0000-0000-000000000004', action: 'email_sent', description: 'Outreach email sent to GlowSkin', resource_type: 'partnership', resource_id: 'c1000000-0000-0000-0000-000000000004', actor_name: 'Taylor Kim' },
    { id: 'ac000000-0000-0000-0000-000000000005', action: 'creator_replied', description: 'Priya Sharma replied to outreach!', resource_type: 'partnership', resource_id: 'c1000000-0000-0000-0000-000000000007', actor_name: 'Jordan Lee' },
  ]);

  // ── 12. NOTIFICATIONS ──
  await upsert('notifications', [
    { id: 'bb000000-0000-0000-0000-000000000001', user_email: 'getreachmediallc@gmail.com', title: 'New high-score match found', message: 'FreshBite x Priya Sharma scored 96% compatibility', type: 'success', status: 'unread', resource_type: 'partnership', resource_id: 'c1000000-0000-0000-0000-000000000007' },
    { id: 'bb000000-0000-0000-0000-000000000002', user_email: 'getreachmediallc@gmail.com', title: 'Approval pending', message: 'Content brief for FreshBite x Aisha Patel needs your review', type: 'warning', status: 'unread', resource_type: 'approval', resource_id: 'af000000-0000-0000-0000-000000000002' },
    { id: 'bb000000-0000-0000-0000-000000000003', user_email: 'getreachmediallc@gmail.com', title: 'Creator replied to outreach', message: 'Priya Sharma responded to your outreach email', type: 'info', status: 'unread', resource_type: 'outreach', resource_id: 'e1000000-0000-0000-0000-000000000002' },
    { id: 'bb000000-0000-0000-0000-000000000004', user_email: 'getreachmediallc@gmail.com', title: 'Deal value milestone', message: 'Your pipeline has reached $227,500 in total deal value', type: 'success', status: 'read', resource_type: 'partnership' },
  ]);

  // ── 13. RATE BENCHMARKS ──
  await upsert('rate_benchmarks', [
    { id: 'fb000000-0000-0000-0000-000000000001', platform: 'Instagram', tier: 'Nano (1K-10K)', niche: 'All', followers_min: 1000, followers_max: 10000, sponsored_post_min: 50, sponsored_post_max: 250, brand_deal_min: 100, brand_deal_max: 500, ambassador_annual_min: 500, ambassador_annual_max: 2000 },
    { id: 'fb000000-0000-0000-0000-000000000002', platform: 'Instagram', tier: 'Micro (10K-100K)', niche: 'All', followers_min: 10000, followers_max: 100000, sponsored_post_min: 250, sponsored_post_max: 1500, brand_deal_min: 500, brand_deal_max: 5000, ambassador_annual_min: 2000, ambassador_annual_max: 15000 },
    { id: 'fb000000-0000-0000-0000-000000000003', platform: 'Instagram', tier: 'Mid (100K-500K)', niche: 'All', followers_min: 100000, followers_max: 500000, sponsored_post_min: 1500, sponsored_post_max: 5000, brand_deal_min: 5000, brand_deal_max: 25000, ambassador_annual_min: 15000, ambassador_annual_max: 75000 },
    { id: 'fb000000-0000-0000-0000-000000000004', platform: 'Instagram', tier: 'Macro (500K-1M)', niche: 'All', followers_min: 500000, followers_max: 1000000, sponsored_post_min: 5000, sponsored_post_max: 15000, brand_deal_min: 25000, brand_deal_max: 75000, ambassador_annual_min: 75000, ambassador_annual_max: 250000 },
    { id: 'fb000000-0000-0000-0000-000000000005', platform: 'TikTok', tier: 'Micro (10K-100K)', niche: 'All', followers_min: 10000, followers_max: 100000, sponsored_post_min: 200, sponsored_post_max: 1000, brand_deal_min: 500, brand_deal_max: 3000, ambassador_annual_min: 1500, ambassador_annual_max: 10000 },
    { id: 'fb000000-0000-0000-0000-000000000006', platform: 'TikTok', tier: 'Mid (100K-500K)', niche: 'All', followers_min: 100000, followers_max: 500000, sponsored_post_min: 1000, sponsored_post_max: 4000, brand_deal_min: 3000, brand_deal_max: 20000, ambassador_annual_min: 10000, ambassador_annual_max: 60000 },
    { id: 'fb000000-0000-0000-0000-000000000007', platform: 'YouTube', tier: 'Mid (100K-500K)', niche: 'All', followers_min: 100000, followers_max: 500000, sponsored_post_min: 3000, sponsored_post_max: 10000, brand_deal_min: 10000, brand_deal_max: 50000, ambassador_annual_min: 25000, ambassador_annual_max: 100000 },
    { id: 'fb000000-0000-0000-0000-000000000008', platform: 'YouTube', tier: 'Macro (500K-1M)', niche: 'All', followers_min: 500000, followers_max: 1000000, sponsored_post_min: 10000, sponsored_post_max: 30000, brand_deal_min: 50000, brand_deal_max: 150000, ambassador_annual_min: 100000, ambassador_annual_max: 500000 },
  ]);

  // ── 14. PLATFORM MULTIPLIERS ──
  await upsert('platform_multipliers', [
    { id: 'ab000000-0000-0000-0000-000000000001', platform: 'Instagram', multiplier: 1.0, base_cpm_min: 5, base_cpm_max: 15, rate_multiplier: 1.0, engagement_benchmark_min: 1.5, engagement_benchmark_max: 3.5, notes: 'Baseline platform for influencer pricing' },
    { id: 'ab000000-0000-0000-0000-000000000002', platform: 'TikTok', multiplier: 0.85, base_cpm_min: 3, base_cpm_max: 10, rate_multiplier: 0.85, engagement_benchmark_min: 3.0, engagement_benchmark_max: 8.0, notes: 'Higher engagement but lower per-post rates' },
    { id: 'ab000000-0000-0000-0000-000000000003', platform: 'YouTube', multiplier: 1.8, base_cpm_min: 15, base_cpm_max: 35, rate_multiplier: 1.8, engagement_benchmark_min: 2.0, engagement_benchmark_max: 5.0, notes: 'Premium rates due to long-form content and SEO value' },
    { id: 'ab000000-0000-0000-0000-000000000004', platform: 'Twitter/X', multiplier: 0.5, base_cpm_min: 2, base_cpm_max: 8, rate_multiplier: 0.5, engagement_benchmark_min: 0.5, engagement_benchmark_max: 2.0, notes: 'Lower rates, text-based engagement' },
    { id: 'ab000000-0000-0000-0000-000000000005', platform: 'LinkedIn', multiplier: 1.5, base_cpm_min: 20, base_cpm_max: 50, rate_multiplier: 1.5, engagement_benchmark_min: 1.0, engagement_benchmark_max: 3.0, notes: 'Premium B2B audience, high intent' },
  ]);

  // ── 15. CATEGORY PREMIUMS ──
  await upsert('category_premiums', [
    { id: 'ca000000-0000-0000-0000-000000000001', category: 'Technology', premium: 15, premium_multiplier: 1.15, rationale: 'High demand for authentic tech reviews' },
    { id: 'ca000000-0000-0000-0000-000000000002', category: 'Beauty & Skincare', premium: 20, premium_multiplier: 1.20, rationale: 'Visual platform alignment and high conversion rates' },
    { id: 'ca000000-0000-0000-0000-000000000003', category: 'Fitness & Health', premium: 10, premium_multiplier: 1.10, rationale: 'Strong community engagement and loyalty' },
    { id: 'ca000000-0000-0000-0000-000000000004', category: 'Fashion & Apparel', premium: 18, premium_multiplier: 1.18, rationale: 'High visual impact and aspirational content' },
    { id: 'ca000000-0000-0000-0000-000000000005', category: 'Food & Beverage', premium: 8, premium_multiplier: 1.08, rationale: 'Broad audience appeal but lower ticket items' },
    { id: 'ca000000-0000-0000-0000-000000000006', category: 'Gaming', premium: 12, premium_multiplier: 1.12, rationale: 'Highly engaged niche with long watch times' },
    { id: 'ca000000-0000-0000-0000-000000000007', category: 'Finance & Fintech', premium: 25, premium_multiplier: 1.25, rationale: 'Strict compliance requirements, premium audience' },
  ]);

  // ── 16. VIEWERSHIP TIERS ──
  await upsert('viewership_tiers', [
    { id: 'da000000-0000-0000-0000-000000000001', name: 'Nano', min_viewers: 0, max_viewers: 10000, multiplier: 0.5 },
    { id: 'da000000-0000-0000-0000-000000000002', name: 'Micro', min_viewers: 10000, max_viewers: 100000, multiplier: 0.8 },
    { id: 'da000000-0000-0000-0000-000000000003', name: 'Mid-Tier', min_viewers: 100000, max_viewers: 500000, multiplier: 1.0 },
    { id: 'da000000-0000-0000-0000-000000000004', name: 'Macro', min_viewers: 500000, max_viewers: 1000000, multiplier: 1.5 },
    { id: 'da000000-0000-0000-0000-000000000005', name: 'Mega', min_viewers: 1000000, max_viewers: 999999999, multiplier: 2.5 },
  ]);

  // ── 17. SUBSCRIPTION PLANS ──
  await upsert('subscription_plans', [
    { id: 'eb000000-0000-0000-0000-000000000001', name: 'Starter', price: 0, interval: 'monthly', features: ['Up to 5 partnerships','Basic analytics','Email support'], max_partnerships: 5, max_team_members: 1 },
    { id: 'eb000000-0000-0000-0000-000000000002', name: 'Professional', price: 99, interval: 'monthly', features: ['Up to 25 partnerships','Advanced analytics','Priority support','AI matching','Outreach sequences'], max_partnerships: 25, max_team_members: 5 },
    { id: 'eb000000-0000-0000-0000-000000000003', name: 'Enterprise', price: 299, interval: 'monthly', features: ['Unlimited partnerships','Custom analytics','Dedicated account manager','API access','White-label reports','SSO'], max_partnerships: 9999, max_team_members: 50 },
  ]);

  // ── 18. ROI BENCHMARKS ──
  await upsert('roi_benchmarks', [
    { id: 'cb000000-0000-0000-0000-000000000001', industry: 'Technology', partnership_type: 'Sponsored Content', deal_type: 'One-off', avg_roi: 4.2, median_roi: 3.8, top_quartile_roi: 7.5, bottom_quartile_roi: 1.9, measurement_period: '90 days' },
    { id: 'cb000000-0000-0000-0000-000000000002', industry: 'Beauty', partnership_type: 'Ambassador Program', deal_type: 'Long-term', avg_roi: 6.8, median_roi: 5.5, top_quartile_roi: 11.2, bottom_quartile_roi: 2.8, measurement_period: '6 months' },
    { id: 'cb000000-0000-0000-0000-000000000003', industry: 'Fashion', partnership_type: 'Product Seeding', deal_type: 'Gifting', avg_roi: 8.5, median_roi: 7.0, top_quartile_roi: 15.0, bottom_quartile_roi: 3.2, measurement_period: '60 days' },
    { id: 'cb000000-0000-0000-0000-000000000004', industry: 'Food & Beverage', partnership_type: 'Recipe Integration', deal_type: 'One-off', avg_roi: 5.1, median_roi: 4.5, top_quartile_roi: 9.0, bottom_quartile_roi: 2.1, measurement_period: '90 days' },
    { id: 'cb000000-0000-0000-0000-000000000005', industry: 'Fitness', partnership_type: 'Challenge Campaign', deal_type: 'Campaign', avg_roi: 7.3, median_roi: 6.2, top_quartile_roi: 12.5, bottom_quartile_roi: 3.5, measurement_period: '30 days' },
  ]);

  // ── 19. CULTURE EVENTS ──
  await upsert('culture_events', [
    { id: 'ce000000-0000-0000-0000-000000000001', event_name: 'Black History Month', category: 'Heritage Month', month: 'February', dates: 'February 1-28', tier: 'Tier 1', best_industries: 'All industries', audience_reach: '45M+ social impressions', planning_lead_time: '3-4 months', key_demographics: 'African American communities, allies, educators', subcategory: 'Heritage & Cultural Awareness' },
    { id: 'ce000000-0000-0000-0000-000000000002', event_name: 'Womens History Month', category: 'Heritage Month', month: 'March', dates: 'March 1-31', tier: 'Tier 1', best_industries: 'Beauty, Fashion, Tech, Finance', audience_reach: '50M+ social impressions', planning_lead_time: '3-4 months', key_demographics: 'Women 18-65, professionals, students', subcategory: 'Heritage & Cultural Awareness' },
    { id: 'ce000000-0000-0000-0000-000000000003', event_name: 'Pride Month', category: 'Heritage Month', month: 'June', dates: 'June 1-30', tier: 'Tier 1', best_industries: 'Fashion, Beauty, Entertainment, Tech', audience_reach: '60M+ social impressions', planning_lead_time: '4-5 months', key_demographics: 'LGBTQ+ communities, allies, Gen Z and Millennials', subcategory: 'Heritage & Cultural Awareness' },
    { id: 'ce000000-0000-0000-0000-000000000004', event_name: 'Hispanic Heritage Month', category: 'Heritage Month', month: 'September-October', dates: 'September 15 - October 15', tier: 'Tier 1', best_industries: 'Food & Beverage, Music, Sports, Fashion', audience_reach: '40M+ social impressions', planning_lead_time: '3-4 months', key_demographics: 'Hispanic and Latino communities', subcategory: 'Heritage & Cultural Awareness' },
    { id: 'ce000000-0000-0000-0000-000000000005', event_name: 'Earth Day', category: 'Awareness Day', month: 'April', dates: 'April 22', tier: 'Tier 2', best_industries: 'Sustainability, Fashion, Food, Tech', audience_reach: '30M+ social impressions', planning_lead_time: '2-3 months', key_demographics: 'Environmentally conscious consumers, Gen Z', subcategory: 'Environmental & Social' },
    { id: 'ce000000-0000-0000-0000-000000000006', event_name: 'Mental Health Awareness Month', category: 'Awareness Month', month: 'May', dates: 'May 1-31', tier: 'Tier 1', best_industries: 'Health, Wellness, Tech, Beauty', audience_reach: '35M+ social impressions', planning_lead_time: '3-4 months', key_demographics: 'Millennials, Gen Z, health-conscious consumers', subcategory: 'Health & Wellness' },
  ]);

  // ── 20. MEGA EVENTS ──
  await upsert('mega_events', [
    { id: 'ed000000-0000-0000-0000-000000000001', event_name: 'Super Bowl', location: 'New Orleans, LA', dates: 'February 9, 2026', year: 2026, tier: 'Tier 1', notes: 'Largest annual US sporting event', format_details: 'Live broadcast + digital activations', planning_urgency: 'High - plan 6+ months ahead', key_facts: '115M+ viewers, $7M per 30s ad spot' },
    { id: 'ed000000-0000-0000-0000-000000000002', event_name: 'FIFA World Cup 2026', location: 'USA, Mexico, Canada', dates: 'June-July 2026', year: 2026, tier: 'Tier 1', notes: 'Global football championship', format_details: '48 teams, 80 matches across 16 cities', planning_urgency: 'Critical - plan 12+ months ahead', key_facts: '5B+ cumulative viewers worldwide' },
    { id: 'ed000000-0000-0000-0000-000000000003', event_name: 'Coachella', location: 'Indio, CA', dates: 'April 11-20, 2026', year: 2026, tier: 'Tier 1', notes: 'Premier music and arts festival', format_details: 'Two weekends of live performances', planning_urgency: 'High - plan 4-6 months ahead', key_facts: '250K+ attendees, massive social media reach' },
    { id: 'ed000000-0000-0000-0000-000000000004', event_name: 'SXSW', location: 'Austin, TX', dates: 'March 7-15, 2026', year: 2026, tier: 'Tier 1', notes: 'Tech, film, and music convergence', format_details: 'Conference + festival hybrid', planning_urgency: 'High - plan 3-5 months ahead', key_facts: '300K+ attendees, major product launches' },
  ]);

  // ── 21. CONFERENCES ──
  await upsert('conferences', [
    { id: 'cf000000-0000-0000-0000-000000000001', event_name: 'CES', conference_name: 'Consumer Electronics Show', location: 'Las Vegas, NV', industry_focus: 'Technology & Consumer Electronics', typical_date: 'January', attendees: '180,000+', sponsorship_range: '$25K - $500K+', why_attend: 'Largest tech trade show, product launches, media coverage', key_audience: 'Tech executives, media, investors', best_for_industries: 'Technology, Consumer Electronics, Automotive' },
    { id: 'cf000000-0000-0000-0000-000000000002', event_name: 'VidCon', conference_name: 'VidCon', location: 'Anaheim, CA', industry_focus: 'Creator Economy & Digital Media', typical_date: 'June', attendees: '55,000+', sponsorship_range: '$10K - $250K', why_attend: 'Direct access to creators and fans, partnership deals', key_audience: 'Creators, brands, platforms, fans', best_for_industries: 'Media, Entertainment, All Consumer Brands' },
    { id: 'cf000000-0000-0000-0000-000000000003', event_name: 'Cannes Lions', conference_name: 'Cannes Lions International Festival of Creativity', location: 'Cannes, France', industry_focus: 'Advertising & Marketing', typical_date: 'June', attendees: '15,000+', sponsorship_range: '$50K - $1M+', why_attend: 'Premier creative awards, industry networking', key_audience: 'CMOs, agency leaders, creative directors', best_for_industries: 'Advertising, Media, Technology' },
    { id: 'cf000000-0000-0000-0000-000000000004', event_name: 'NRF Big Show', conference_name: 'National Retail Federation Big Show', location: 'New York, NY', industry_focus: 'Retail & Commerce', typical_date: 'January', attendees: '40,000+', sponsorship_range: '$15K - $300K', why_attend: 'Retail innovation, supply chain tech, consumer trends', key_audience: 'Retail executives, buyers, tech vendors', best_for_industries: 'Retail, Fashion, Food & Beverage' },
  ]);

  // ── 22. DEMOGRAPHIC SEGMENTS ──
  await upsert('demographic_segments', [
    { id: 'db000000-0000-0000-0000-000000000001', name: 'Gen Z (18-25)', description: 'Digital natives who value authenticity and social impact', age_range: '18-25', population_size: '68 million (US)', buying_power: '$360 billion', media_preferences: 'TikTok, Instagram Reels, YouTube Shorts', top_events: 'Coachella, ComplexCon, TwitchCon', key_cultural_moments: 'Pride Month, Earth Day, Mental Health Awareness', brand_activation_tips: 'UGC campaigns, creator collabs, meme marketing', activation_tips: 'Short-form video, behind-the-scenes, authentic storytelling' },
    { id: 'db000000-0000-0000-0000-000000000002', name: 'Millennials (26-41)', description: 'Experience-driven consumers who research before buying', age_range: '26-41', population_size: '72 million (US)', buying_power: '$2.5 trillion', media_preferences: 'Instagram, YouTube, Podcasts', top_events: 'SXSW, Burning Man, Art Basel', key_cultural_moments: 'Black History Month, Womens History Month', brand_activation_tips: 'Influencer partnerships, value-driven campaigns, reviews', activation_tips: 'Long-form content, how-to guides, lifestyle integration' },
    { id: 'db000000-0000-0000-0000-000000000003', name: 'Gen X (42-57)', description: 'Brand-loyal consumers with high purchasing power', age_range: '42-57', population_size: '65 million (US)', buying_power: '$2.4 trillion', media_preferences: 'Facebook, YouTube, Email newsletters', top_events: 'CES, NRF, industry conferences', key_cultural_moments: 'Back to School, Holiday Season', brand_activation_tips: 'Quality-focused messaging, loyalty programs, expert endorsements', activation_tips: 'Email marketing, YouTube reviews, Facebook groups' },
    { id: 'db000000-0000-0000-0000-000000000004', name: 'Parents (25-45)', description: 'Family-focused consumers seeking value and convenience', age_range: '25-45', population_size: '85 million (US)', buying_power: '$3.1 trillion', media_preferences: 'Instagram, Pinterest, YouTube, Facebook', top_events: 'Back to School, Holiday Shopping, Summer Break', key_cultural_moments: 'Mothers Day, Fathers Day, Family holidays', brand_activation_tips: 'Family-friendly content, practical tips, savings messaging', activation_tips: 'How-to content, product comparisons, family lifestyle' },
  ]);

  // ── 23. INDUSTRY GUIDES ──
  await upsert('industry_guides', [
    { id: 'aa000000-0000-0000-0000-000000000001', title: 'Technology Industry Partnership Guide', industry: 'Technology', sector: 'Consumer Tech & SaaS', budget_allocation: '40% Sponsored Content, 30% Ambassador Programs, 30% Event Activations', priority_tier_1_events: 'CES, SXSW, Apple WWDC, Google I/O', tier_2_events: 'TechCrunch Disrupt, Web Summit, MWC', heritage_awareness_months: 'STEM Month (Feb), Digital Inclusion Day', key_conferences: 'CES, SXSW, Collision, TechCrunch Disrupt', best_demographics: 'Gen Z, Millennials, Tech Enthusiasts', activation_strategies: 'Unboxing videos, first-look reviews, tech tutorials, live demos' },
    { id: 'aa000000-0000-0000-0000-000000000002', title: 'Beauty & Personal Care Guide', industry: 'Beauty & Personal Care', sector: 'Cosmetics, Skincare, Haircare', budget_allocation: '50% Creator Partnerships, 25% Product Seeding, 25% Event Sponsorship', priority_tier_1_events: 'Beautycon, Sephora events, NYFW Beauty', tier_2_events: 'Indie Beauty Expo, Cosmoprof', heritage_awareness_months: 'Womens History Month, Pride Month', key_conferences: 'Beautycon, Cosmoprof, CEW Beauty Awards', best_demographics: 'Gen Z Women, Millennial Women, Beauty Enthusiasts', activation_strategies: 'Get-ready-with-me, tutorials, before/after, ingredient education' },
    { id: 'aa000000-0000-0000-0000-000000000003', title: 'Fashion & Apparel Guide', industry: 'Fashion & Apparel', sector: 'Streetwear, Luxury, Fast Fashion, Athleisure', budget_allocation: '45% Influencer Collabs, 30% Fashion Week, 25% Digital Campaigns', priority_tier_1_events: 'NYFW, Paris Fashion Week, Met Gala', tier_2_events: 'ComplexCon, Agenda Show', heritage_awareness_months: 'Pride Month, Black History Month', key_conferences: 'NYFW, London Fashion Week, ComplexCon', best_demographics: 'Gen Z, Millennials, Fashion-Forward Consumers', activation_strategies: 'Lookbooks, haul videos, styling tips, collection launches' },
    { id: 'aa000000-0000-0000-0000-000000000004', title: 'Food & Beverage Guide', industry: 'Food & Beverage', sector: 'CPG Food, Restaurants, Beverages', budget_allocation: '35% Recipe Integrations, 35% Ambassador Programs, 30% Event Sampling', priority_tier_1_events: 'Food & Wine Classic, SXSW Food, James Beard Awards', tier_2_events: 'Fancy Food Show, Natural Products Expo', heritage_awareness_months: 'Hispanic Heritage Month, Asian American Heritage Month', key_conferences: 'Fancy Food Show, Natural Products Expo, IDDBA', best_demographics: 'Millennials, Parents, Foodies, Health-Conscious', activation_strategies: 'Recipe videos, taste tests, meal prep, restaurant reviews' },
  ]);

  console.log('\n✅ All data seeded successfully!');
  console.log('   Refresh your app at http://localhost:5173 to see the data.');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
