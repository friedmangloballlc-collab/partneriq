-- PartnerIQ Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  job_title text,
  phone text,
  role text default 'brand' check (role in ('admin','brand','talent','agency')),
  avatar_url text,
  bio text,
  website text,
  location text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_email_idx on profiles(email);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

-- ============================================================
-- BRANDS
-- ============================================================
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text,
  website text,
  logo_url text,
  description text,
  hq_location text,
  annual_revenue text,
  partnership_budget numeric default 0,
  target_niches text[],
  target_platforms text[],
  brand_values text[],
  contact_name text,
  contact_email text,
  contact_phone text,
  social_instagram text,
  social_twitter text,
  social_linkedin text,
  owner_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists brands_owner_idx on brands(owner_id);
create index if not exists brands_industry_idx on brands(industry);
create index if not exists brands_created_at_idx on brands(created_at desc);

create trigger brands_updated_at before update on brands
  for each row execute function update_updated_at();

-- ============================================================
-- TALENTS
-- ============================================================
create table if not exists talents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  primary_platform text default 'instagram',
  niche text,
  tier text default 'micro' check (tier in ('nano','micro','mid','macro','mega','celebrity')),
  location text,
  bio text,
  avatar_url text,
  total_followers bigint default 0,
  engagement_rate numeric default 0,
  brand_safety_score numeric default 0,
  discovery_alpha_score numeric default 0,
  trajectory text,
  avg_views bigint default 0,
  rate_per_post numeric default 0,
  rate_per_story numeric default 0,
  rate_per_reel numeric default 0,
  demographics jsonb,
  audience_interests text[],
  past_partnerships text[],
  social_instagram text,
  social_tiktok text,
  social_youtube text,
  social_twitter text,
  social_twitch text,
  social_linkedin text,
  owner_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists talents_owner_idx on talents(owner_id);
create index if not exists talents_niche_idx on talents(niche);
create index if not exists talents_tier_idx on talents(tier);
create index if not exists talents_platform_idx on talents(primary_platform);
create index if not exists talents_created_at_idx on talents(created_at desc);

create trigger talents_updated_at before update on talents
  for each row execute function update_updated_at();

-- ============================================================
-- PARTNERSHIPS
-- ============================================================
create table if not exists partnerships (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  brand_id uuid references brands(id),
  talent_id uuid references talents(id),
  brand_name text,
  talent_name text,
  status text default 'discovered' check (status in (
    'discovered','researching','outreach_pending','outreach_sent',
    'responded','negotiating','contracted','active','completed','churned'
  )),
  deal_value numeric default 0,
  match_score numeric,
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  assigned_to text,
  start_date date,
  end_date date,
  deliverables text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists partnerships_status_idx on partnerships(status);
create index if not exists partnerships_created_by_idx on partnerships(created_by);
create index if not exists partnerships_brand_idx on partnerships(brand_id);
create index if not exists partnerships_talent_idx on partnerships(talent_id);
create index if not exists partnerships_created_at_idx on partnerships(created_at desc);

create trigger partnerships_updated_at before update on partnerships
  for each row execute function update_updated_at();

-- ============================================================
-- MARKETPLACE OPPORTUNITIES
-- ============================================================
create table if not exists marketplace_opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  brand_id uuid references brands(id),
  brand_name text,
  brand_logo text,
  description text,
  status text default 'draft' check (status in ('draft','published','closed','expired')),
  contract_type text,
  budget_min numeric default 0,
  budget_max numeric default 0,
  required_niches text[],
  required_platforms text[],
  min_followers bigint default 0,
  min_engagement numeric default 0,
  deliverables text[],
  deadline date,
  application_deadline date,
  posted_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists marketplace_opportunities_status_idx on marketplace_opportunities(status);
create index if not exists marketplace_opportunities_posted_by_idx on marketplace_opportunities(posted_by);
create index if not exists marketplace_opportunities_created_at_idx on marketplace_opportunities(created_at desc);

create trigger marketplace_opportunities_updated_at before update on marketplace_opportunities
  for each row execute function update_updated_at();

-- ============================================================
-- OPPORTUNITY APPLICATIONS
-- ============================================================
create table if not exists opportunity_applications (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references marketplace_opportunities(id) on delete cascade,
  talent_id uuid references talents(id),
  talent_email text,
  talent_name text,
  status text default 'pending' check (status in ('pending','reviewing','accepted','rejected','withdrawn')),
  cover_letter text,
  proposed_rate numeric,
  portfolio_urls text[],
  notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists opportunity_applications_opportunity_idx on opportunity_applications(opportunity_id);
create index if not exists opportunity_applications_talent_email_idx on opportunity_applications(talent_email);
create index if not exists opportunity_applications_status_idx on opportunity_applications(status);
create index if not exists opportunity_applications_created_at_idx on opportunity_applications(created_at desc);

create trigger opportunity_applications_updated_at before update on opportunity_applications
  for each row execute function update_updated_at();

-- ============================================================
-- OUTREACH EMAILS
-- ============================================================
create table if not exists outreach_emails (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id),
  sequence_id uuid,
  subject text,
  body text,
  recipient_email text,
  recipient_name text,
  status text default 'draft' check (status in ('draft','scheduled','sent','opened','clicked','replied','bounced')),
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists outreach_emails_partnership_idx on outreach_emails(partnership_id);
create index if not exists outreach_emails_status_idx on outreach_emails(status);
create index if not exists outreach_emails_created_at_idx on outreach_emails(created_at desc);

create trigger outreach_emails_updated_at before update on outreach_emails
  for each row execute function update_updated_at();

-- ============================================================
-- OUTREACH SEQUENCES
-- ============================================================
create table if not exists outreach_sequences (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  status text default 'draft' check (status in ('draft','active','paused','completed')),
  steps jsonb default '[]',
  target_count integer default 0,
  sent_count integer default 0,
  open_rate numeric default 0,
  reply_rate numeric default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists outreach_sequences_created_by_idx on outreach_sequences(created_by);
create index if not exists outreach_sequences_created_at_idx on outreach_sequences(created_at desc);

create trigger outreach_sequences_updated_at before update on outreach_sequences
  for each row execute function update_updated_at();

-- ============================================================
-- OUTREACH METRICS
-- ============================================================
create table if not exists outreach_metrics (
  id uuid primary key default uuid_generate_v4(),
  sequence_id uuid references outreach_sequences(id),
  date date default current_date,
  emails_sent integer default 0,
  emails_opened integer default 0,
  emails_clicked integer default 0,
  emails_replied integer default 0,
  emails_bounced integer default 0,
  created_at timestamptz default now()
);

create index if not exists outreach_metrics_sequence_idx on outreach_metrics(sequence_id);
create index if not exists outreach_metrics_date_idx on outreach_metrics(date desc);

-- ============================================================
-- APPROVAL ITEMS
-- ============================================================
create table if not exists approval_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  type text,
  status text default 'pending' check (status in ('pending','approved','rejected','revision_requested')),
  partnership_id uuid references partnerships(id),
  submitted_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  review_notes text,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists approval_items_status_idx on approval_items(status);
create index if not exists approval_items_partnership_idx on approval_items(partnership_id);
create index if not exists approval_items_created_at_idx on approval_items(created_at desc);

create trigger approval_items_updated_at before update on approval_items
  for each row execute function update_updated_at();

-- ============================================================
-- DEAL NOTES
-- ============================================================
create table if not exists deal_notes (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id) on delete cascade,
  content text not null,
  type text default 'note' check (type in ('note','call','meeting','email','task')),
  author_id uuid references profiles(id),
  author_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists deal_notes_partnership_idx on deal_notes(partnership_id);
create index if not exists deal_notes_created_at_idx on deal_notes(created_at desc);

create trigger deal_notes_updated_at before update on deal_notes
  for each row execute function update_updated_at();

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  partnership_id uuid references partnerships(id),
  assigned_to uuid references profiles(id),
  assigned_to_email text,
  due_date date,
  completed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_partnership_idx on tasks(partnership_id);
create index if not exists tasks_assigned_to_idx on tasks(assigned_to);
create index if not exists tasks_created_at_idx on tasks(created_at desc);

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  description text,
  entity_type text,
  entity_id uuid,
  partnership_id uuid references partnerships(id),
  user_id uuid references profiles(id),
  user_name text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists activities_partnership_idx on activities(partnership_id);
create index if not exists activities_user_idx on activities(user_id);
create index if not exists activities_created_at_idx on activities(created_at desc);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text,
  type text default 'info' check (type in ('info','success','warning','error')),
  read boolean default false,
  action_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_read_idx on notifications(read);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_id uuid references profiles(id),
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists teams_owner_idx on teams(owner_id);

create trigger teams_updated_at before update on teams
  for each row execute function update_updated_at();

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id),
  email text,
  role text default 'member' check (role in ('owner','admin','member','viewer')),
  joined_at timestamptz default now()
);

create index if not exists team_members_team_idx on team_members(team_id);
create index if not exists team_members_user_idx on team_members(user_id);
create unique index if not exists team_members_unique on team_members(team_id, user_id);

-- ============================================================
-- CULTURE EVENTS
-- ============================================================
create table if not exists culture_events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  date date,
  type text,
  region text,
  significance text,
  target_demographics text[],
  partnership_opportunities text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists culture_events_date_idx on culture_events(date);
create index if not exists culture_events_type_idx on culture_events(type);

create trigger culture_events_updated_at before update on culture_events
  for each row execute function update_updated_at();

-- ============================================================
-- MEGA EVENTS
-- ============================================================
create table if not exists mega_events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  location text,
  expected_attendance integer,
  category text,
  sponsorship_tiers jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists mega_events_start_date_idx on mega_events(start_date);

create trigger mega_events_updated_at before update on mega_events
  for each row execute function update_updated_at();

-- ============================================================
-- CONFERENCES
-- ============================================================
create table if not exists conferences (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  date date,
  location text,
  industry text,
  website text,
  expected_attendees integer,
  sponsorship_available boolean default false,
  sponsorship_cost numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists conferences_date_idx on conferences(date);
create index if not exists conferences_industry_idx on conferences(industry);

create trigger conferences_updated_at before update on conferences
  for each row execute function update_updated_at();

-- ============================================================
-- DEMOGRAPHIC SEGMENTS
-- ============================================================
create table if not exists demographic_segments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  age_range text,
  gender text,
  income_range text,
  interests text[],
  platforms text[],
  purchase_behavior text,
  brand_affinity text[],
  size_estimate bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists demographic_segments_created_at_idx on demographic_segments(created_at desc);

create trigger demographic_segments_updated_at before update on demographic_segments
  for each row execute function update_updated_at();

-- ============================================================
-- INDUSTRY GUIDES
-- ============================================================
create table if not exists industry_guides (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  industry text not null,
  content text,
  summary text,
  key_metrics jsonb,
  best_practices text[],
  case_studies jsonb,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists industry_guides_industry_idx on industry_guides(industry);

create trigger industry_guides_updated_at before update on industry_guides
  for each row execute function update_updated_at();

-- ============================================================
-- RATE BENCHMARKS
-- ============================================================
create table if not exists rate_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  platform text not null,
  niche text not null,
  tier text not null,
  content_type text,
  rate_min numeric,
  rate_max numeric,
  rate_median numeric,
  currency text default 'USD',
  as_of_date date default current_date,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists rate_benchmarks_platform_idx on rate_benchmarks(platform);
create index if not exists rate_benchmarks_niche_idx on rate_benchmarks(niche);
create unique index if not exists rate_benchmarks_unique on rate_benchmarks(platform, niche, tier, content_type);

create trigger rate_benchmarks_updated_at before update on rate_benchmarks
  for each row execute function update_updated_at();

-- ============================================================
-- ROI BENCHMARKS
-- ============================================================
create table if not exists roi_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  industry text not null,
  channel text not null,
  avg_roi numeric,
  median_roi numeric,
  top_quartile_roi numeric,
  time_to_roi_days integer,
  sample_size integer,
  as_of_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists roi_benchmarks_industry_idx on roi_benchmarks(industry);

create trigger roi_benchmarks_updated_at before update on roi_benchmarks
  for each row execute function update_updated_at();

-- ============================================================
-- PLATFORM MULTIPLIERS
-- ============================================================
create table if not exists platform_multipliers (
  id uuid primary key default uuid_generate_v4(),
  platform text not null unique,
  base_multiplier numeric default 1.0,
  engagement_weight numeric default 1.0,
  reach_weight numeric default 1.0,
  notes text,
  updated_at timestamptz default now()
);

-- ============================================================
-- CATEGORY PREMIUMS
-- ============================================================
create table if not exists category_premiums (
  id uuid primary key default uuid_generate_v4(),
  category text not null unique,
  premium_percent numeric default 0,
  demand_level text default 'medium' check (demand_level in ('low','medium','high','very_high')),
  notes text,
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================
create table if not exists subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tier text not null,
  user_type text not null check (user_type in ('brand','talent','agency')),
  price_monthly numeric default 0,
  price_annual numeric default 0,
  stripe_price_id_monthly text,
  stripe_price_id_annual text,
  features jsonb default '[]',
  limits jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists subscription_plans_user_type_idx on subscription_plans(user_type);
create index if not exists subscription_plans_tier_idx on subscription_plans(tier);

create trigger subscription_plans_updated_at before update on subscription_plans
  for each row execute function update_updated_at();

-- ============================================================
-- USER SUBSCRIPTIONS
-- ============================================================
create table if not exists user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  user_email text,
  user_type text,
  plan_id uuid references subscription_plans(id),
  current_plan text,
  status text default 'active' check (status in ('active','past_due','cancelled','trialing','incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  trial_end timestamptz,
  limits jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists user_subscriptions_user_idx on user_subscriptions(user_id);
create index if not exists user_subscriptions_stripe_customer_idx on user_subscriptions(stripe_customer_id);

create trigger user_subscriptions_updated_at before update on user_subscriptions
  for each row execute function update_updated_at();

-- ============================================================
-- BILLING HISTORY
-- ============================================================
create table if not exists billing_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  user_email text,
  user_type text,
  amount numeric not null,
  currency text default 'USD',
  status text default 'paid' check (status in ('paid','pending','failed','refunded')),
  stripe_invoice_id text,
  stripe_payment_intent text,
  description text,
  invoice_url text,
  receipt_url text,
  plan_name text,
  billing_period_start date,
  billing_period_end date,
  created_at timestamptz default now()
);

create index if not exists billing_history_user_idx on billing_history(user_id);
create index if not exists billing_history_user_email_idx on billing_history(user_email);
create index if not exists billing_history_created_at_idx on billing_history(created_at desc);

-- ============================================================
-- PARTNERSHIP PROPOSALS
-- ============================================================
create table if not exists partnership_proposals (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id),
  title text not null,
  content text,
  status text default 'draft' check (status in ('draft','sent','viewed','accepted','rejected','negotiating')),
  version integer default 1,
  sent_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists partnership_proposals_partnership_idx on partnership_proposals(partnership_id);
create index if not exists partnership_proposals_created_at_idx on partnership_proposals(created_at desc);

create trigger partnership_proposals_updated_at before update on partnership_proposals
  for each row execute function update_updated_at();

-- ============================================================
-- ACTIVATION CHECKLISTS
-- ============================================================
create table if not exists activation_checklists (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id) on delete cascade,
  title text not null,
  items jsonb default '[]',
  completion_percent numeric default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists activation_checklists_partnership_idx on activation_checklists(partnership_id);

create trigger activation_checklists_updated_at before update on activation_checklists
  for each row execute function update_updated_at();

-- ============================================================
-- PLANNING TIMELINES
-- ============================================================
create table if not exists planning_timelines (
  id uuid primary key default uuid_generate_v4(),
  partnership_id uuid references partnerships(id) on delete cascade,
  title text not null,
  milestones jsonb default '[]',
  start_date date,
  end_date date,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists planning_timelines_partnership_idx on planning_timelines(partnership_id);

create trigger planning_timelines_updated_at before update on planning_timelines
  for each row execute function update_updated_at();

-- ============================================================
-- VIEWERSHIP TIERS
-- ============================================================
create table if not exists viewership_tiers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  platform text not null,
  min_followers bigint default 0,
  max_followers bigint,
  min_views bigint default 0,
  max_views bigint,
  avg_engagement_rate numeric,
  typical_rate_min numeric,
  typical_rate_max numeric,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists viewership_tiers_platform_idx on viewership_tiers(platform);

create trigger viewership_tiers_updated_at before update on viewership_tiers
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table brands enable row level security;
alter table talents enable row level security;
alter table partnerships enable row level security;
alter table marketplace_opportunities enable row level security;
alter table opportunity_applications enable row level security;
alter table outreach_emails enable row level security;
alter table outreach_sequences enable row level security;
alter table outreach_metrics enable row level security;
alter table approval_items enable row level security;
alter table deal_notes enable row level security;
alter table tasks enable row level security;
alter table activities enable row level security;
alter table notifications enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table culture_events enable row level security;
alter table mega_events enable row level security;
alter table conferences enable row level security;
alter table demographic_segments enable row level security;
alter table industry_guides enable row level security;
alter table rate_benchmarks enable row level security;
alter table roi_benchmarks enable row level security;
alter table platform_multipliers enable row level security;
alter table category_premiums enable row level security;
alter table subscription_plans enable row level security;
alter table user_subscriptions enable row level security;
alter table billing_history enable row level security;
alter table partnership_proposals enable row level security;
alter table activation_checklists enable row level security;
alter table planning_timelines enable row level security;
alter table viewership_tiers enable row level security;

-- ============================================================
-- Open-access RLS policies (demo mode)
-- All authenticated users can read everything; write is open.
-- Tighten per-table once multi-tenancy / RBAC is needed.
-- ============================================================

-- Profiles
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (true);
create policy "profiles_update" on profiles for update using (true);

-- Brands
create policy "brands_select" on brands for select using (true);
create policy "brands_insert" on brands for insert with check (true);
create policy "brands_update" on brands for update using (true);
create policy "brands_delete" on brands for delete using (true);

-- Talents
create policy "talents_select" on talents for select using (true);
create policy "talents_insert" on talents for insert with check (true);
create policy "talents_update" on talents for update using (true);
create policy "talents_delete" on talents for delete using (true);

-- Partnerships
create policy "partnerships_select" on partnerships for select using (true);
create policy "partnerships_insert" on partnerships for insert with check (true);
create policy "partnerships_update" on partnerships for update using (true);
create policy "partnerships_delete" on partnerships for delete using (true);

-- Marketplace opportunities
create policy "opportunities_select" on marketplace_opportunities for select using (true);
create policy "opportunities_insert" on marketplace_opportunities for insert with check (true);
create policy "opportunities_update" on marketplace_opportunities for update using (true);
create policy "opportunities_delete" on marketplace_opportunities for delete using (true);

-- Opportunity applications
create policy "applications_select" on opportunity_applications for select using (true);
create policy "applications_insert" on opportunity_applications for insert with check (true);
create policy "applications_update" on opportunity_applications for update using (true);

-- Notifications
create policy "notifications_select" on notifications for select using (true);
create policy "notifications_insert" on notifications for insert with check (true);
create policy "notifications_update" on notifications for update using (true);

-- User subscriptions
create policy "user_subscriptions_select" on user_subscriptions for select using (true);
create policy "user_subscriptions_insert" on user_subscriptions for insert with check (true);
create policy "user_subscriptions_update" on user_subscriptions for update using (true);

-- Billing history
create policy "billing_history_select" on billing_history for select using (true);
create policy "billing_history_insert" on billing_history for insert with check (true);

-- Reference data (read-only for now)
create policy "subscription_plans_select" on subscription_plans for select using (true);
create policy "subscription_plans_insert" on subscription_plans for insert with check (true);
create policy "rate_benchmarks_select" on rate_benchmarks for select using (true);
create policy "rate_benchmarks_insert" on rate_benchmarks for insert with check (true);
create policy "roi_benchmarks_select" on roi_benchmarks for select using (true);
create policy "roi_benchmarks_insert" on roi_benchmarks for insert with check (true);
create policy "platform_multipliers_select" on platform_multipliers for select using (true);
create policy "platform_multipliers_insert" on platform_multipliers for insert with check (true);
create policy "category_premiums_select" on category_premiums for select using (true);
create policy "category_premiums_insert" on category_premiums for insert with check (true);
create policy "viewership_tiers_select" on viewership_tiers for select using (true);
create policy "viewership_tiers_insert" on viewership_tiers for insert with check (true);
create policy "industry_guides_select" on industry_guides for select using (true);
create policy "industry_guides_insert" on industry_guides for insert with check (true);
create policy "culture_events_select" on culture_events for select using (true);
create policy "culture_events_insert" on culture_events for insert with check (true);
create policy "culture_events_update" on culture_events for update using (true);
create policy "culture_events_delete" on culture_events for delete using (true);
create policy "mega_events_select" on mega_events for select using (true);
create policy "mega_events_insert" on mega_events for insert with check (true);
create policy "mega_events_update" on mega_events for update using (true);
create policy "mega_events_delete" on mega_events for delete using (true);
create policy "conferences_select" on conferences for select using (true);
create policy "conferences_insert" on conferences for insert with check (true);
create policy "conferences_update" on conferences for update using (true);
create policy "conferences_delete" on conferences for delete using (true);
create policy "demographic_segments_select" on demographic_segments for select using (true);
create policy "demographic_segments_insert" on demographic_segments for insert with check (true);
create policy "demographic_segments_update" on demographic_segments for update using (true);

-- Approval items
create policy "approval_items_select" on approval_items for select using (true);
create policy "approval_items_insert" on approval_items for insert with check (true);
create policy "approval_items_update" on approval_items for update using (true);

-- Deal notes
create policy "deal_notes_select" on deal_notes for select using (true);
create policy "deal_notes_insert" on deal_notes for insert with check (true);
create policy "deal_notes_update" on deal_notes for update using (true);
create policy "deal_notes_delete" on deal_notes for delete using (true);

-- Tasks
create policy "tasks_select" on tasks for select using (true);
create policy "tasks_insert" on tasks for insert with check (true);
create policy "tasks_update" on tasks for update using (true);

-- Activities
create policy "activities_select" on activities for select using (true);
create policy "activities_insert" on activities for insert with check (true);

-- Outreach emails
create policy "outreach_emails_select" on outreach_emails for select using (true);
create policy "outreach_emails_insert" on outreach_emails for insert with check (true);
create policy "outreach_emails_update" on outreach_emails for update using (true);

-- Outreach sequences
create policy "outreach_sequences_select" on outreach_sequences for select using (true);
create policy "outreach_sequences_insert" on outreach_sequences for insert with check (true);
create policy "outreach_sequences_update" on outreach_sequences for update using (true);

-- Outreach metrics
create policy "outreach_metrics_select" on outreach_metrics for select using (true);

-- Teams
create policy "teams_select" on teams for select using (true);
create policy "teams_insert" on teams for insert with check (true);
create policy "teams_update" on teams for update using (true);

create policy "team_members_select" on team_members for select using (true);
create policy "team_members_insert" on team_members for insert with check (true);

-- Partnership proposals
create policy "partnership_proposals_select" on partnership_proposals for select using (true);
create policy "partnership_proposals_insert" on partnership_proposals for insert with check (true);
create policy "partnership_proposals_update" on partnership_proposals for update using (true);

-- Activation checklists
create policy "activation_checklists_select" on activation_checklists for select using (true);
create policy "activation_checklists_insert" on activation_checklists for insert with check (true);
create policy "activation_checklists_update" on activation_checklists for update using (true);

-- Planning timelines
create policy "planning_timelines_select" on planning_timelines for select using (true);
create policy "planning_timelines_insert" on planning_timelines for insert with check (true);
create policy "planning_timelines_update" on planning_timelines for update using (true);
