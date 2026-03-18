import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// CORS headers for browser requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Entity name → Supabase table name
const TABLE_MAP: Record<string, string> = {
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
};

function getTable(name: string): string {
  return TABLE_MAP[name] || name.toLowerCase() + 's';
}

function makeEntityProxy(client: any) {
  return new Proxy({}, {
    get(_target, entityName: string) {
      const table = getTable(entityName);
      return {
        async list(orderBy?: string, limit?: number) {
          let q = client.from(table).select('*');
          if (orderBy) {
            const desc = orderBy.startsWith('-');
            const col = desc ? orderBy.slice(1) : orderBy;
            // Try ordering, but fall back to created_at or no order if column doesn't exist
            try {
              const testQ = client.from(table).select('*').order(col, { ascending: !desc }).limit(1);
              const { error: testErr } = await testQ;
              if (testErr) {
                // Column doesn't exist, try created_at fallback
                q = q.order('created_at', { ascending: false });
              } else {
                q = q.order(col, { ascending: !desc });
              }
            } catch {
              // Ignore order errors
            }
          }
          if (limit) q = q.limit(limit);
          const { data, error } = await q;
          if (error) throw error;
          return data || [];
        },
        async filter(filters: Record<string, any>, orderBy?: string, limit?: number) {
          let q = client.from(table).select('*');
          for (const [key, val] of Object.entries(filters)) {
            q = q.eq(key, val);
          }
          if (orderBy) {
            const desc = orderBy.startsWith('-');
            const col = desc ? orderBy.slice(1) : orderBy;
            q = q.order(col, { ascending: !desc });
          }
          if (limit) q = q.limit(limit);
          const { data, error } = await q;
          if (error) throw error;
          return data || [];
        },
        async create(row: any) {
          const { data, error } = await client.from(table).insert(row).select().single();
          if (error) throw error;
          return data;
        },
        async bulkCreate(rows: any[]) {
          const { data, error } = await client.from(table).insert(rows).select();
          if (error) throw error;
          return data;
        },
        async update(id: string, updates: any) {
          const { data, error } = await client.from(table).update(updates).eq('id', id).select().single();
          if (error) throw error;
          return data;
        },
        async delete(id: string) {
          const { error } = await client.from(table).delete().eq('id', id);
          if (error) throw error;
        },
      };
    },
  });
}

export function createClientFromRequest(req: Request) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Extract the user's JWT from the Authorization header
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  // Service role client (bypasses RLS) — used for all data access in edge functions
  const serviceClient = createClient(url, serviceKey);

  // User-scoped client for auth verification only
  const authClient = createClient(url, serviceKey);

  return {
    auth: {
      async me() {
        try {
          // Verify the user's JWT token
          const { data: { user }, error } = await authClient.auth.getUser(token);
          if (error || !user) return null;
          // Load profile
          const { data: profile } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          return { id: user.id, email: user.email, role: profile?.role || 'user', ...(profile || {}) };
        } catch {
          return null;
        }
      },
    },
    // Edge functions run server-side, so use service role for all data access
    entities: makeEntityProxy(serviceClient),
    asServiceRole: {
      entities: makeEntityProxy(serviceClient),
    },
    supabase: serviceClient,
    serviceRole: serviceClient,
    integrations: {
      Core: {
        async InvokeLLM({ prompt, response_json_schema, agent_name }: { prompt: string; response_json_schema?: any; agent_name?: string }) {
          // Route through the Universal AI Router with automatic failover
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

          try {
            const resp = await fetch(`${supabaseUrl}/functions/v1/ai-router`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                agent: agent_name || 'default',
                prompt: response_json_schema
                  ? `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(response_json_schema)}`
                  : prompt,
              }),
            });

            if (!resp.ok) {
              const errBody = await resp.text();
              console.error('[InvokeLLM] Router error:', resp.status, errBody);
              throw new Error(`AI Router returned ${resp.status}`);
            }

            const data = await resp.json();
            if (!data.success) throw new Error(data.error || 'AI Router failed');

            const text = data.result || '{}';
            try { return JSON.parse(text); } catch { return { response: text }; }
          } catch (err) {
            console.error('[InvokeLLM] Failed:', (err as Error).message);
            // Fallback: return structured mock if schema provided
            if (response_json_schema?.properties) {
              const fallback: any = {};
              for (const [key, schema] of Object.entries(response_json_schema.properties) as any) {
                if (schema.type === 'string') fallback[key] = `AI temporarily unavailable. Please try again.`;
                else if (schema.type === 'number') fallback[key] = 0;
                else if (schema.type === 'boolean') fallback[key] = false;
                else if (schema.type === 'array') fallback[key] = [];
                else if (schema.type === 'object') fallback[key] = {};
                else fallback[key] = null;
              }
              return fallback;
            }
            return { response: 'AI service temporarily unavailable. Please try again in a moment.' };
          }
        },
        async ExtractDataFromUploadedFile({ file_url }: { file_url: string }) {
          return { data: [], error: 'File extraction requires an AI API key. Configure ANTHROPIC_API_KEY or OPENAI_API_KEY.' };
        },
        async SendEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
          console.log(`[SendEmail stub] To: ${to}, Subject: ${subject}`);
          return { success: true, message: 'Email sending requires integration configuration.' };
        },
      },
    },
  };
}
