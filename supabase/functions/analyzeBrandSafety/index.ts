import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const [talents, partnerships, approvals] = await Promise.all([
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.ApprovalItem.list('-created_date', 100),
    ]);

    if (talents.length === 0) {
      return new Response(JSON.stringify({ error: 'No talent data found.' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const activeDeals = partnerships.filter(p => ['active', 'contracted', 'negotiating'].includes(p.status));
    const talentInDeals = talents.filter(t => activeDeals.some(d => d.talent_name === t.name));
    const pendingApprovals = approvals.filter(a => a.status === 'pending');

    const prompt = `You are a Brand Safety & Reputation Risk AI Agent.

TALENT ROSTER (${talents.length} total, ${talentInDeals.length} in active deals):
${talents.slice(0, 20).map(t => `- ${t.name}: ${t.platform}/${t.niche}, ${t.tier}, Safety Score=${t.brand_safety_score || 'N/A'}, Followers=${t.followers?.toLocaleString()}`).join('\n')}

ACTIVE PARTNERSHIPS: ${activeDeals.length}
PENDING APPROVALS: ${pendingApprovals.length}

Perform a comprehensive brand safety analysis:
1. Risk assessment for each active creator partnership
2. Content risk monitoring alerts (hypothetical based on niche/platform)
3. Audience sentiment risk indicators
4. Brand safety score breakdown and improvement recommendations
5. Crisis scenario planning for high-risk partnerships
6. Compliance red flags (FTC, ASA, platform-specific rules)
7. Proactive hold recommendations for at-risk partnerships`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      agent_name: 'brand_safety',
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          overall_risk_score: { type: 'string' },
          risk_grade: { type: 'string' },
          creator_risk_assessments: {
            type: 'array',
            items: { type: 'object', properties: { creator: { type: 'string' }, risk_level: { type: 'string' }, risk_factors: { type: 'string' }, brand_safety_score: { type: 'string' }, recommended_action: { type: 'string' } } }
          },
          content_risk_alerts: {
            type: 'array',
            items: { type: 'object', properties: { alert: { type: 'string' }, severity: { type: 'string' }, affected_partnerships: { type: 'string' }, immediate_action: { type: 'string' } } }
          },
          sentiment_indicators: {
            type: 'object',
            properties: {
              positive_signals: { type: 'array', items: { type: 'string' } },
              warning_signals: { type: 'array', items: { type: 'string' } },
              negative_signals: { type: 'array', items: { type: 'string' } }
            }
          },
          crisis_scenarios: {
            type: 'array',
            items: { type: 'object', properties: { scenario: { type: 'string' }, likelihood: { type: 'string' }, impact: { type: 'string' }, response_plan: { type: 'string' }, response_timeline: { type: 'string' } } }
          },
          compliance_flags: {
            type: 'array',
            items: { type: 'object', properties: { flag: { type: 'string' }, regulation: { type: 'string' }, risk_level: { type: 'string' }, remediation: { type: 'string' } } }
          },
          hold_recommendations: {
            type: 'array',
            items: { type: 'object', properties: { partnership: { type: 'string' }, reason: { type: 'string' }, action: { type: 'string' }, urgency: { type: 'string' } } }
          },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return new Response(JSON.stringify({ success: true, analysis: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
