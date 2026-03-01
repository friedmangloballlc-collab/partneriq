/**
 * Base44 → Supabase Compatibility Layer
 *
 * Provides the same API surface as the Base44 SDK so existing components
 * continue to work unchanged:
 *   base44.entities.Partnership.list(sort, limit)
 *   base44.entities.Partnership.filter(query, sort, limit)
 *   base44.entities.Partnership.create(data)
 *   base44.entities.Partnership.update(id, data)
 *   base44.entities.Partnership.delete(id)
 *   base44.entities.Partnership.subscribe(callback)
 *   base44.auth.me()
 *   base44.auth.updateMe(data)
 *   base44.auth.logout()
 *   base44.auth.redirectToLogin()
 *   base44.functions.invoke(name, params)
 */

import { supabase } from './supabaseClient';

// ── Entity name → Supabase table name mapping ──────────────
const TABLE_MAP = {
  Partnership: 'partnerships',
  Talent: 'talents',
  Brand: 'brands',
  MarketplaceOpportunity: 'marketplace_opportunities',
  OpportunityApplication: 'opportunity_applications',
  OutreachEmail: 'outreach_emails',
  OutreachSequence: 'outreach_sequences',
  OutreachMetrics: 'outreach_metrics',
  ApprovalItem: 'approval_items',
  DealNote: 'deal_notes',
  Task: 'tasks',
  Activity: 'activities',
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
  BillingHistory: 'billing_history',
  UserSubscription: 'user_subscriptions',
  SubscriptionPlan: 'subscription_plans',
  PartnershipProposal: 'partnership_proposals',
  ActivationChecklist: 'activation_checklists',
  PlanningTimeline: 'planning_timelines',
  ViewershipTier: 'viewership_tiers',
};

// ── Parse Base44 sort string (e.g. "-created_date" → descending) ──
function parseSort(sortStr) {
  if (!sortStr) return null;
  const descending = sortStr.startsWith('-');
  const column = descending ? sortStr.slice(1) : sortStr;
  return { column, ascending: !descending };
}

// ── Apply Base44-style MongoDB query filters to a Supabase query ──
function applyFilters(query, filters) {
  if (!filters || typeof filters !== 'object') return query;

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // MongoDB-style operators
      if ('$regex' in value) {
        query = query.ilike(key, `%${value.$regex}%`);
      }
      if ('$gte' in value) {
        query = query.gte(key, value.$gte);
      }
      if ('$lte' in value) {
        query = query.lte(key, value.$lte);
      }
      if ('$gt' in value) {
        query = query.gt(key, value.$gt);
      }
      if ('$lt' in value) {
        query = query.lt(key, value.$lt);
      }
      if ('$in' in value) {
        query = query.in(key, value.$in);
      }
      if ('$ne' in value) {
        query = query.neq(key, value.$ne);
      }
    } else {
      // Simple equality
      query = query.eq(key, value);
    }
  }
  return query;
}

// ── Create an entity proxy for a given table ──
function createEntityProxy(tableName) {
  return {
    // List all records with optional sort and limit
    async list(sort, limit) {
      let query = supabase.from(tableName).select('*');
      const sortConfig = parseSort(sort);
      if (sortConfig) {
        query = query.order(sortConfig.column, { ascending: sortConfig.ascending });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    // Filter records with MongoDB-style query
    async filter(filters, sort, limit) {
      let query = supabase.from(tableName).select('*');
      query = applyFilters(query, filters);
      const sortConfig = parseSort(sort);
      if (sortConfig) {
        query = query.order(sortConfig.column, { ascending: sortConfig.ascending });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    // Get single record by ID
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    // Create a new record
    async create(record) {
      const { data, error } = await supabase
        .from(tableName)
        .insert({ ...record, created_date: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // Update a record by ID
    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // Delete a record by ID
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    // Real-time subscription
    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}_changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            const eventType = payload.eventType; // INSERT, UPDATE, DELETE
            callback({
              type: eventType === 'INSERT' ? 'create' : eventType === 'UPDATE' ? 'update' : 'delete',
              record: payload.new || payload.old,
            });
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}

// ── Build the entities proxy ──
const entitiesHandler = {
  get(_, entityName) {
    const tableName = TABLE_MAP[entityName];
    if (!tableName) {
      console.warn(`Unknown entity: ${entityName}. Add it to TABLE_MAP in base44Client.js`);
      return createEntityProxy(entityName.toLowerCase() + 's');
    }
    return createEntityProxy(tableName);
  },
};

const entities = new Proxy({}, entitiesHandler);

// ── Auth ──
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'brand',
      company_name: profile?.company_name || '',
      job_title: profile?.job_title || '',
      phone: profile?.phone || '',
      ...profile,
    };
  },

  async updateMe(data) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_date: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = '/';
    }
  },

  redirectToLogin(returnUrl) {
    // Store return URL and redirect to login
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    }
    window.location.href = '/Onboarding';
  },
};

// ── Functions (Supabase Edge Functions) ──
const functions = {
  async invoke(functionName, params = {}) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: params,
    });

    if (error) throw error;
    return { data: data || {} };
  },
};

// ── Service role (uses same entities — RLS handles permissions) ──
const asServiceRole = { entities };

// ── Export the compatibility client ──
export const base44 = {
  entities,
  auth,
  functions,
  asServiceRole,
};
