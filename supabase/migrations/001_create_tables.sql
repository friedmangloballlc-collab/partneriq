-- PartnerIQ: Complete database schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  company TEXT,
  title TEXT,
  phone TEXT,
  timezone TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  location TEXT,
  contact_email TEXT,
  annual_budget NUMERIC,
  created_by TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. TALENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  primary_platform TEXT,
  niche TEXT,
  tier TEXT,
  trajectory TEXT,
  total_followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  audience_quality_score NUMERIC DEFAULT 0,
  brand_safety_score NUMERIC DEFAULT 0,
  discovery_alpha_score NUMERIC DEFAULT 0,
  avg_likes INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  avg_views INTEGER DEFAULT 0,
  rate_per_post NUMERIC DEFAULT 0,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  expertise_areas TEXT,
  preferred_collaboration_types JSONB DEFAULT '[]',
  availability_status TEXT DEFAULT 'open_for_offers',
  portfolio JSONB DEFAULT '[]',
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. PARTNERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  brand_name TEXT,
  talent_name TEXT,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  talent_id UUID REFERENCES talents(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'discovered',
  deal_value NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'p2',
  partnership_type TEXT,
  match_score NUMERIC DEFAULT 0,
  assigned_to TEXT,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT,
  description TEXT,
  resource_type TEXT,
  resource_id TEXT,
  actor_email TEXT,
  actor_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. APPROVAL ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS approval_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT,
  reference_id TEXT,
  title TEXT,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  deal_value NUMERIC,
  match_score NUMERIC,
  brand_name TEXT,
  talent_name TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  rejection_code TEXT,
  rejection_feedback TEXT,
  scheduled_send_time TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. OUTREACH SEQUENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS outreach_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_name TEXT,
  target_email TEXT,
  steps JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  current_step INTEGER DEFAULT 0,
  partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. OUTREACH EMAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT,
  to_name TEXT,
  subject TEXT,
  body TEXT,
  email_type TEXT,
  status TEXT DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT false,
  assigned_to TEXT,
  partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
  sequence_id UUID REFERENCES outreach_sequences(id) ON DELETE SET NULL,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. OUTREACH METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS outreach_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES outreach_emails(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES outreach_sequences(id) ON DELETE CASCADE,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. MARKETPLACE OPPORTUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  timeline_start TIMESTAMPTZ,
  timeline_end TIMESTAMPTZ,
  required_platforms JSONB DEFAULT '[]',
  required_niches JSONB DEFAULT '[]',
  target_audience_size_min INTEGER,
  target_audience_size_max INTEGER,
  deliverables JSONB DEFAULT '[]',
  attachment_urls JSONB DEFAULT '[]',
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name TEXT,
  created_by TEXT,
  status TEXT DEFAULT 'draft',
  applications_count INTEGER DEFAULT 0,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 11. OPPORTUNITY APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES marketplace_opportunities(id) ON DELETE CASCADE,
  talent_email TEXT,
  talent_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. DEAL NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  content TEXT,
  note_type TEXT DEFAULT 'note',
  author_email TEXT,
  author_name TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to_email TEXT,
  assigned_to_name TEXT,
  assigned_by_email TEXT,
  due_date TIMESTAMPTZ,
  partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
  outreach_email_id UUID REFERENCES outreach_emails(id) ON DELETE SET NULL,
  context_label TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  status TEXT DEFAULT 'unread',
  read_at TIMESTAMPTZ,
  resource_type TEXT,
  resource_id TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 15. TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_email TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 16. TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_name TEXT,
  member_email TEXT,
  member_name TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 17. CULTURE EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS culture_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  dates JSONB,
  category TEXT,
  year INTEGER,
  tier TEXT,
  audience_demographics JSONB DEFAULT '{}',
  activation_opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 18. MEGA EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS mega_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  dates JSONB,
  audience_demographics JSONB DEFAULT '{}',
  global_reach JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 19. CONFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  dates JSONB,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 20. DEMOGRAPHIC SEGMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS demographic_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  age_range TEXT,
  gender TEXT,
  interests JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 21. INDUSTRY GUIDES
-- ============================================================
CREATE TABLE IF NOT EXISTS industry_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  industry TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 22. RATE BENCHMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT,
  tier TEXT,
  niche TEXT,
  avg_rate NUMERIC,
  min_rate NUMERIC,
  max_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 23. ROI BENCHMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS roi_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT,
  partnership_type TEXT,
  avg_roi NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 24. PLATFORM MULTIPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT,
  multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 25. CATEGORY PREMIUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS category_premiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  premium NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 26. SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC,
  interval TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  max_partnerships INTEGER,
  max_team_members INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 27. USER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 28. BILLING HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_type TEXT,
  plan TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 29. PARTNERSHIP PROPOSALS
-- ============================================================
CREATE TABLE IF NOT EXISTS partnership_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 30. ACTIVATION CHECKLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS activation_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 31. PLANNING TIMELINES
-- ============================================================
CREATE TABLE IF NOT EXISTS planning_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 32. VIEWERSHIP TIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS viewership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  min_viewers INTEGER,
  max_viewers INTEGER,
  multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS but allow all operations for authenticated users
-- You can tighten these policies later
-- ============================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'brands', 'talents', 'partnerships', 'activities',
      'approval_items', 'outreach_sequences', 'outreach_emails', 'outreach_metrics',
      'marketplace_opportunities', 'opportunity_applications', 'deal_notes',
      'tasks', 'notifications', 'teams', 'team_members',
      'culture_events', 'mega_events', 'conferences', 'demographic_segments',
      'industry_guides', 'rate_benchmarks', 'roi_benchmarks',
      'platform_multipliers', 'category_premiums',
      'subscription_plans', 'user_subscriptions', 'billing_history',
      'partnership_proposals', 'activation_checklists', 'planning_timelines',
      'viewership_tiers'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow read for anon" ON %I FOR SELECT TO anon USING (true)', tbl);
  END LOOP;
END $$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES for common queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_assigned ON partnerships(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_approval_items_status ON approval_items(status);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_status ON outreach_emails(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_deal_notes_partnership ON deal_notes(partnership_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_opportunities(status);
