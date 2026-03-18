import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const [partnerships, sequences, metrics, talents] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.OutreachSequence.list('-created_date', 200),
      base44.entities.OutreachMetrics.list('-created_date', 500),
      base44.entities.Talent.list('-created_date', 200),
    ]);

    if (partnerships.length === 0) {
      return new Response(JSON.stringify({ error: 'No partnership data found.' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const completedDeals = partnerships.filter(p => ['completed', 'active'].includes(p.status));
    const totalValue = completedDeals.reduce((s, d) => s + (d.deal_value || 0), 0);
    const platformBreakdown = {};
    talents.forEach(t => { if (t.platform) platformBreakdown[t.platform] = (platformBreakdown[t.platform] || 0) + 1; });

    const totalEmails = metrics.reduce((s, m) => s + (m.emails_sent || 0), 0);
    const totalOpens = metrics.reduce((s, m) => s + (m.opened || 0), 0);
    const totalReplies = metrics.reduce((s, m) => s + (m.replied || 0), 0);

    const prompt = `You are a Cross-Platform Attribution AI Agent for influencer marketing campaigns.

CAMPAIGN DATA:
- Total partnerships: ${partnerships.length}
- Completed deals: ${completedDeals.length}
- Total deal value: $${totalValue.toLocaleString()}
- Platform distribution: ${JSON.stringify(platformBreakdown)}

OUTREACH PERFORMANCE:
- Total emails: ${totalEmails}
- Open rate: ${totalEmails ? ((totalOpens / totalEmails) * 100).toFixed(1) : 0}%
- Reply rate: ${totalEmails ? ((totalReplies / totalEmails) * 100).toFixed(1) : 0}%
- Active sequences: ${sequences.length}

PARTNERSHIPS BY TYPE:
${completedDeals.slice(0, 15).map(d => `- ${d.talent_name || 'Creator'} × ${d.brand_name || 'Brand'}: $${d.deal_value || 0}, Type=${d.partnership_type || 'N/A'}, Score=${d.match_score || 'N/A'}`).join('\n')}

Build a multi-touch attribution model:
1. Channel effectiveness ranking across platforms
2. First-touch vs last-touch attribution comparison
3. Cross-platform journey mapping
4. Platform-specific ROI estimates
5. Optimal channel mix for different campaign types
6. Attribution model recommendations
7. Incrementality analysis (what's driving real lift vs organic)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          channel_effectiveness: {
            type: 'array',
            items: { type: 'object', properties: { channel: { type: 'string' }, effectiveness_score: { type: 'string' }, conversion_contribution: { type: 'string' }, cost_efficiency: { type: 'string' }, best_use_case: { type: 'string' } } }
          },
          attribution_comparison: {
            type: 'object',
            properties: {
              first_touch_insights: { type: 'string' },
              last_touch_insights: { type: 'string' },
              multi_touch_recommendation: { type: 'string' },
              attribution_model: { type: 'string' }
            }
          },
          journey_mapping: {
            type: 'array',
            items: { type: 'object', properties: { journey_type: { type: 'string' }, touchpoints: { type: 'string' }, avg_conversion_time: { type: 'string' }, success_rate: { type: 'string' } } }
          },
          platform_roi: {
            type: 'array',
            items: { type: 'object', properties: { platform: { type: 'string' }, estimated_roi: { type: 'string' }, reach_efficiency: { type: 'string' }, engagement_quality: { type: 'string' }, recommendation: { type: 'string' } } }
          },
          optimal_channel_mix: {
            type: 'array',
            items: { type: 'object', properties: { campaign_type: { type: 'string' }, recommended_mix: { type: 'string' }, budget_allocation: { type: 'string' }, expected_outcome: { type: 'string' } } }
          },
          incrementality_insights: {
            type: 'object',
            properties: {
              organic_baseline: { type: 'string' },
              incremental_lift: { type: 'string' },
              highest_lift_channels: { type: 'string' },
              diminishing_returns_threshold: { type: 'string' }
            }
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
