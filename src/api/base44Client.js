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
  TalentType: 'talent_types',
  TalentRevenueStream: 'talent_revenue_streams',
  TalentRevenueMatrix: 'talent_revenue_matrix',
  ConnectedPlatform: 'connected_platforms',
  PlatformCatalog: 'platform_catalog',
  EmailConnection: 'email_connections',
  DecisionMaker: 'decision_makers',
  DataRoomEntry: 'data_room_entries',
  DealScore: 'deal_scores',
  EscrowPayment: 'escrow_payments',
  BundleDeal: 'bundle_deals',
  DealDispute: 'deal_disputes',
  DeckLibrary: 'deck_library',
  PitchCompetition: 'pitch_competitions',
  AIUsageLog: 'ai_usage_logs',
  DataRoomAccess: 'data_room_access',
  NewsletterSubscriber: 'newsletter_subscribers',
  Referral: 'referrals',
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
    async list(sortBy = '-created_at', limitOrPage = 100, pageSize) {
      const { column, ascending } = parseSort(sortBy);
      // Backward compat: list(sort, limit) — 2 args = old style, always return array
      if (pageSize === undefined) {
        const limit = limitOrPage;
        let query = supabase.from(tableName).select('*').order(column, { ascending }).limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
      // New style: list(sort, page, pageSize) — return paginated object
      const page = limitOrPage;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase.from(tableName).select('*').order(column, { ascending }).range(from, to);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      return { data: rows, page, pageSize, hasMore: rows.length === pageSize };
    },

    async filter(filters = {}, sortBy = '-created_at', limitOrPage = 100, pageSize) {
      const { column, ascending } = parseSort(sortBy);
      let query = supabase.from(tableName).select('*').order(column, { ascending });
      query = applyFilters(query, filters);
      // Backward compat: filter(filters, sort, limit) — 3 args = old style
      if (pageSize === undefined) {
        const limit = limitOrPage;
        query = query.limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
      // New style: filter(filters, sort, page, pageSize)
      const page = limitOrPage;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      return { data: rows, page, pageSize, hasMore: rows.length === pageSize };
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

    // Use SECURITY DEFINER RPC to bypass RLS race condition
    const { data: profile } = await supabase
      .rpc('get_my_profile')
      .single();

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
      await supabase.from('profiles').insert(newProfile).catch(() => {});
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

    // Whitelist of fields users are allowed to update about themselves.
    // Critically, 'role' is excluded to prevent privilege escalation.
    const ALLOWED_FIELDS = [
      'full_name', 'company_name', 'job_title', 'phone',
      'avatar_url', 'bio', 'website', 'location', 'onboarding_completed',
    ];
    const sanitized = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in data) {
        sanitized[key] = data[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString(), ...sanitized })
      .eq('id', user.id);
    if (error) throw error;
    return sanitized;
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

// Functions that should NOT count against AI quota
const NON_AI_FUNCTIONS = new Set([
  'initializeSubscription', 'getUserSubscriptionStatus', 'getBillingHistory',
  'getInvoices', 'exportEntityData', 'importEntityData', 'send-welcome-email',
  'create-phyllo-token', 'manageWebhooks',
  'getPaymentMethods', 'deletePaymentMethod', 'addPaymentMethod',
  'checkFeatureAccess', 'connectEmailAccount', 'manageEscrow',
  'populateBrands', 'populateContactsGMO', 'populateBrandIntel',
  'populateEvents', 'populateContacts', 'adminVerificationStats',
  'refreshEnrichments', 'sendTrialEmails', 'enrichCreator', 'enrichBrand',
  'verifyDeal', 'verifyWebsite', 'scoreMatch', 'oauthConnect',
  'gmoEnrichCompany', 'gmoFindContacts', 'upgradeSubscription',
  'handleStripeWebhook', 'getUserSubscriptionStatus', 'setupStripeConnect',
]);

// Edge Functions wrapper with AI metering
const functions = {
  // Set by useAIUsage hook to enable metering
  _meterFn: null,

  async invoke(functionName, args = {}) {
    // If metering is active and this is an AI function, check + track
    if (this._meterFn && !NON_AI_FUNCTIONS.has(functionName)) {
      const allowed = await this._meterFn(functionName);
      if (!allowed) {
        throw new Error('AI_LIMIT_REACHED');
      }
    }

    const { data, error } = await supabase.functions.invoke(functionName, { body: args });
    if (error) throw error;
    return { data };
  },
};

export const base44 = { entities, auth, functions };
