/**
 * Supabase compatibility layer that preserves the base44 SDK API surface.
 * Supports: .list(), .filter(), .create(), .update(), .delete(), .subscribe()
 * Auth: .me(), .updateMe(), .logout()
 * Functions: .invoke()
 * MongoDB-style operators: $regex, $gte, $lte, $in, $ne
 */
import { supabase } from './supabaseClient';

// Entity name → Supabase table name
const ENTITY_TABLE_MAP = {
  Partnership: 'partnerships',
  Talent: 'talents',
  Brand: 'brands',
  Activity: 'activities',
  ApprovalItem: 'approval_items',
  OutreachSequence: 'outreach_sequences',
  OutreachEmail: 'outreach_emails',
  OutreachMetrics: 'outreach_metrics',
  MarketplaceOpportunity: 'marketplace_opportunities',
  OpportunityApplication: 'opportunity_applications',
  DealNote: 'deal_notes',
  Task: 'tasks',
  Notification: 'notifications',
  Team: 'teams',
  TeamMember: 'team_members',
  CultureEvent: 'culture_events',
  MegaEvent: 'mega_events',
  Conference: 'conferences',
  DemographicSegment: 'demographic_segments',
  IndustryGuide: 'industry_guides',
  RateBenchmark: 'rate_benchmarks',
  ROIBenchmark: 'roi_benchmarks',
  PlatformMultiplier: 'platform_multipliers',
  CategoryPremium: 'category_premiums',
  SubscriptionPlan: 'subscription_plans',
  UserSubscription: 'user_subscriptions',
  BillingHistory: 'billing_history',
  PartnershipProposal: 'partnership_proposals',
  ActivationChecklist: 'activation_checklists',
  PlanningTimeline: 'planning_timelines',
  ViewershipTier: 'viewership_tiers',
  Profile: 'profiles',
};

// Apply MongoDB-style filters to a Supabase query builder
function applyFilters(query, filters) {
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, opValue] of Object.entries(value)) {
        switch (op) {
          case '$regex':
            query = query.ilike(key, `%${opValue}%`);
            break;
          case '$gte':
            query = query.gte(key, opValue);
            break;
          case '$lte':
            query = query.lte(key, opValue);
            break;
          case '$in':
            query = query.in(key, opValue);
            break;
          case '$ne':
            query = query.neq(key, opValue);
            break;
          default:
            console.warn(`Unsupported query operator: ${op}`);
        }
      }
    } else {
      query = query.eq(key, value);
    }
  }
  return query;
}

// Parse sort string: "-created_date" → { column: 'created_at', ascending: false }
// Map legacy column names to actual DB columns
const COLUMN_ALIAS = { created_date: 'created_at', updated_date: 'updated_at' };
function parseSort(sortStr) {
  if (!sortStr) return { column: 'created_at', ascending: false };
  const desc = sortStr.startsWith('-');
  const raw = desc ? sortStr.slice(1) : sortStr;
  const column = COLUMN_ALIAS[raw] || raw;
  return { column, ascending: !desc };
}

function createEntityProxy(tableName) {
  return {
    async list(sortBy = '-created_at', limit = 100) {
      const { column, ascending } = parseSort(sortBy);
      let query = supabase.from(tableName).select('*').order(column, { ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async filter(filters = {}, sortBy = '-created_at', limit = 100) {
      const { column, ascending } = parseSort(sortBy);
      let query = supabase.from(tableName).select('*').order(column, { ascending });
      query = applyFilters(query, filters);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async update(id, data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}_realtime`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}

// Entities proxy — creates table accessor on first access
const entities = new Proxy({}, {
  get(_, entityName) {
    const tableName = ENTITY_TABLE_MAP[entityName];
    if (!tableName) {
      console.warn(`base44Client: unknown entity "${entityName}", falling back to "${entityName.toLowerCase()}s"`);
      return createEntityProxy(entityName.toLowerCase() + 's');
    }
    return createEntityProxy(tableName);
  },
});

// Auth methods
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If no profile exists yet, create one from auth metadata
    if (!profile) {
      const meta = user.user_metadata || {};
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: meta.full_name || '',
        role: meta.role || 'brand',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await supabase.from('profiles').upsert(newProfile);
      return newProfile;
    }

    return {
      id: user.id,
      email: user.email,
      ...profile,
    };
  },

  async updateMe(data) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, updated_at: new Date().toISOString(), ...data });
    if (error) throw error;
    return data;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) window.location.href = redirectUrl;
  },

  redirectToLogin(redirectUrl) {
    const url = '/login' + (redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '');
    window.location.href = url;
  },
};

// Edge Functions wrapper
const functions = {
  async invoke(functionName, args = {}) {
    const { data, error } = await supabase.functions.invoke(functionName, { body: args });
    if (error) throw error;
    return { data };
  },
};

export const base44 = { entities, auth, functions };
