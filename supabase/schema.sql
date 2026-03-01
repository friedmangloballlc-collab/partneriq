-- PartnerIQ Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USER PROFILES (extends Supabase Auth)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text default 'brand' check (role in ('admin', 'brand', 'talent', 'agency')),
  company_name text,
  job_title text,
  phone text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ============================================================
-- CORE ENTITIES
-- ============================================================

create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text,
  company_size text,
  annual_budget numeric,
  preferred_niches text[],
  website text,
  logo_url text,
  description text,
  created_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists talents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  primary_platform text,
  niche text,
  tier text check (tier in ('nano', 'micro', 'mid', 'macro', 'mega', 'celebrity')),
  location text,
  bio text,
  total_followers integer default 0,
  engagement_rate numeric default 0,
  brand_safety_score numeric default 0,
  rate_per_post numeric,
  trajectory text,
  discovery_alpha_score numeric default 0,
  expertise_areas text[],
  preferred_collaboration_types text[],
  availability_status text default 'available',
  portfolio jsonb,
  social_links jsonb,
  created_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists partnerships (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  brand_name text,
  talent_name text,
  brand_id uuid references brands(id),
  talent_id uuid references talents(id),
  deal_value numeric default 0,
  status text default 'discovered',
  match_score numeric,
  match_reasoning text,
  partnership_type text,
  priority text,
  assigned_to text,
  notes text,
  created_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ============================================================
-- MARKETPLACE
-- ============================================================

create table if not exists marketplace_opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  brand_name text,
  status text default 'draft',
  budget_min numeric,
  budget_max numeric,
  contract_type text,
  niches text[],
  platforms text[],
  requirements text,
  applications_count integer default 0,
  created_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists opportunity_applications (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references marketplace_opportunities(id),
  talent_email text,
  talent_name text,
  cover_letter text,
  status text default 'pending',
  created_date timestamptz default now()
);

-- ============================================================
-- OUTREACH
-- ============================================================

create table if not exists outreach_emails (
  id uuid primary key default uuid_generate_v4(),
  to_email text,
  to_name text,
  subject text,
  body text,
  email_type text,
  status text default 'draft',
  ai_generated boolean default false,
  partnership_id uuid references partnerships(id),
  sequence_id uuid,
  sent_date timestamptz,
  created_by text,
  created_date timestamptz default now()
);

create table if not exists outreach_sequences (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  target_name text,
  target_email text,
  status text default 'draft',
  steps jsonb default '[]',
  total_sent integer default 0,
  total_opened integer default 0,
  total_replied integer default 0,
  created_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists outreach_metrics (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id),
  sequence_id uuid references outreach_sequences(id),
  open_rate numeric,
  reply_rate numeric,
  conversion_rate numeric,
  total_sent integer default 0,
  total_opened integer default 0,
  total_replied integer default 0,
  created_date timestamptz default now()
);

-- ============================================================
-- WORKFLOW
-- ============================================================

create table if not exists approval_items (
  id uuid primary key default uuid_generate_v4(),
  item_type text,
  reference_id text,
  title text,
  description text,
  status text default 'pending',
  priority text default 'normal',
  reviewed_by text,
  review_notes text,
  rejection_code text,
  rejection_feedback text,
  scheduled_send_time timestamptz,
  submitted_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists deal_notes (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id),
  content text,
  note_type text default 'note',
  author_email text,
  author_name text,
  created_date timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id),
  outreach_email_id uuid references outreach_emails(id),
  title text not null,
  status text default 'pending',
  assigned_to_email text,
  priority text default 'normal',
  due_date timestamptz,
  description text,
  created_by text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ============================================================
-- ACTIVITY & NOTIFICATIONS
-- ============================================================

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  action text,
  description text,
  resource_type text,
  resource_id text,
  actor_email text,
  actor_name text,
  metadata jsonb,
  created_date timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text,
  message text,
  type text,
  status text default 'unread',
  priority text default 'normal',
  user_email text,
  reference_type text,
  reference_id text,
  metadata jsonb,
  created_date timestamptz default now()
);

-- ============================================================
-- TEAMS
-- ============================================================

create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_email text,
  created_date timestamptz default now()
);

create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  team_name text,
  member_email text,
  member_name text,
  role text default 'member',
  status text default 'active',
  created_date timestamptz default now()
);

-- ============================================================
-- CALENDAR & EVENTS
-- ============================================================

create table if not exists culture_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamptz,
  end_date timestamptz,
  category text,
  tier text,
  description text,
  location text,
  audience_size text,
  tags text[],
  created_date timestamptz default now()
);

create table if not exists mega_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamptz,
  end_date timestamptz,
  category text,
  tier text,
  description text,
  location text,
  viewership text,
  created_date timestamptz default now()
);

create table if not exists conferences (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamptz,
  end_date timestamptz,
  location text,
  category text,
  industry text,
  website text,
  description text,
  created_date timestamptz default now()
);

-- ============================================================
-- MARKET DATA
-- ============================================================

create table if not exists demographic_segments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  age_range text,
  gender text,
  income_range text,
  interests text[],
  platforms text[],
  population_size integer,
  buying_power numeric,
  description text,
  created_date timestamptz default now()
);

create table if not exists industry_guides (
  id uuid primary key default uuid_generate_v4(),
  industry text,
  title text,
  content text,
  key_trends text[],
  recommended_platforms text[],
  avg_engagement_rate numeric,
  avg_roi numeric,
  created_date timestamptz default now()
);

create table if not exists rate_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  tier text,
  platform text,
  niche text,
  min_rate numeric,
  max_rate numeric,
  avg_rate numeric,
  median_rate numeric,
  currency text default 'USD',
  created_date timestamptz default now()
);

create table if not exists roi_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  deal_type text,
  industry text,
  median_roi numeric,
  top_quartile_roi numeric,
  bottom_quartile_roi numeric,
  avg_conversion_rate numeric,
  sample_size integer,
  created_date timestamptz default now()
);

create table if not exists platform_multipliers (
  id uuid primary key default uuid_generate_v4(),
  platform text,
  multiplier numeric default 1.0,
  engagement_weight numeric,
  reach_weight numeric,
  description text,
  created_date timestamptz default now()
);

create table if not exists category_premiums (
  id uuid primary key default uuid_generate_v4(),
  category text,
  premium_multiplier numeric default 1.0,
  demand_level text,
  description text,
  created_date timestamptz default now()
);

-- ============================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================

create table if not exists subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tier text not null,
  user_type text,
  price_monthly numeric,
  price_annual numeric,
  features jsonb,
  limits jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_annual text,
  created_date timestamptz default now()
);

create table if not exists user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  user_type text,
  current_plan text default 'free',
  status text default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  has_subscription boolean default false,
  limits jsonb,
  auto_renew boolean default true,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists billing_history (
  id uuid primary key default uuid_generate_v4(),
  user_email text,
  user_type text,
  amount numeric,
  currency text default 'USD',
  status text,
  description text,
  stripe_invoice_id text,
  plan_name text,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  created_date timestamptz default now()
);

-- ============================================================
-- MISC
-- ============================================================

create table if not exists partnership_proposals (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id),
  proposed_value numeric,
  proposed_terms text,
  status text default 'draft',
  created_date timestamptz default now()
);

create table if not exists activation_checklists (
  id uuid primary key default uuid_generate_v4(),
  title text,
  industry text,
  items jsonb,
  created_date timestamptz default now()
);

create table if not exists planning_timelines (
  id uuid primary key default uuid_generate_v4(),
  title text,
  start_date timestamptz,
  end_date timestamptz,
  category text,
  milestones jsonb,
  created_date timestamptz default now()
);

create table if not exists viewership_tiers (
  id uuid primary key default uuid_generate_v4(),
  tier_name text,
  min_viewers integer,
  max_viewers integer,
  description text,
  created_date timestamptz default now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_partnerships_status on partnerships(status);
create index if not exists idx_partnerships_created on partnerships(created_date desc);
create index if not exists idx_talents_platform on talents(primary_platform);
create index if not exists idx_talents_niche on talents(niche);
create index if not exists idx_talents_tier on talents(tier);
create index if not exists idx_approval_items_status on approval_items(status);
create index if not exists idx_activities_created on activities(created_date desc);
create index if not exists idx_notifications_user on notifications(user_email);
create index if not exists idx_notifications_status on notifications(status);
create index if not exists idx_deal_notes_partnership on deal_notes(partnership_id);
create index if not exists idx_tasks_partnership on tasks(partnership_id);
create index if not exists idx_outreach_emails_status on outreach_emails(status);
create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_billing_history_user on billing_history(user_email);

-- ============================================================
-- ROW LEVEL SECURITY (basic - customize per your needs)
-- ============================================================
alter table profiles enable row level security;

create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- For all other tables, allow authenticated users full access
-- (Tighten these policies for production)
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'brands', 'talents', 'partnerships', 'marketplace_opportunities',
      'opportunity_applications', 'outreach_emails', 'outreach_sequences',
      'outreach_metrics', 'approval_items', 'deal_notes', 'tasks',
      'activities', 'notifications', 'teams', 'team_members',
      'culture_events', 'mega_events', 'conferences', 'demographic_segments',
      'industry_guides', 'rate_benchmarks', 'roi_benchmarks',
      'platform_multipliers', 'category_premiums', 'subscription_plans',
      'user_subscriptions', 'billing_history', 'partnership_proposals',
      'activation_checklists', 'planning_timelines', 'viewership_tiers'
    ])
  loop
    execute format('alter table %I enable row level security', tbl);
    execute format('create policy "Authenticated users full access" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', tbl);
  end loop;
end $$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'brand')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REALTIME (enable for entities that use .subscribe())
-- ============================================================
alter publication supabase_realtime add table deal_notes;
alter publication supabase_realtime add table notifications;
