import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { partnership_id } = body;

    const [partnerships, proposals, benchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 200),
      base44.entities.PartnershipProposal.list('-created_date', 100),
      base44.entities.RateBenchmark.list('-created_date', 50),
    ]);

    if (partnerships.length === 0) {
      return new Response(JSON.stringify({ error: 'No partnership data found. Create partnerships first.' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const targetDeal = partnership_id
      ? partnerships.find(p => p.id === partnership_id)
      : partnerships[0];

    const completedDeals = partnerships.filter(p => ['completed', 'active', 'contracted'].includes(p.status));
    const avgDealValue = completedDeals.length > 0
      ? completedDeals.reduce((s, d) => s + (d.deal_value || 0), 0) / completedDeals.length
      : 0;

    const prompt = `You are a Contract Intelligence AI Agent for influencer/creator partnerships.

CURRENT DEAL CONTEXT:
${targetDeal ? `- Deal: ${targetDeal.talent_name || 'Unknown'} × ${targetDeal.brand_name || 'Unknown'}
- Status: ${targetDeal.status}
- Deal Value: $${targetDeal.deal_value || 'TBD'}
- Type: ${targetDeal.partnership_type || 'Not specified'}
- Match Score: ${targetDeal.match_score || 'N/A'}` : 'No specific deal selected'}

HISTORICAL DATA:
- Total deals: ${partnerships.length}
- Completed deals: ${completedDeals.length}
- Average deal value: $${avgDealValue.toFixed(0)}
- Active proposals: ${proposals.length}

RATE BENCHMARKS:
${benchmarks.slice(0, 5).map(b => `- ${b.tier}: $${b.sponsored_post_min}-$${b.sponsored_post_max} (posts), $${b.brand_deal_min}-$${b.brand_deal_max} (deals)`).join('\n')}

Generate a comprehensive contract intelligence analysis including:
1. Recommended contract structure and key terms
2. Pricing fairness assessment vs market rates
3. Risk clauses to include (exclusivity, usage rights, morality, termination)
4. Negotiation leverage points
5. Payment structure recommendation (milestone-based, upfront, hybrid)
6. IP and content rights framework
7. Performance guarantees and KPI benchmarks to include`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          contract_structure: {
            type: 'object',
            properties: {
              recommended_type: { type: 'string' },
              duration: { type: 'string' },
              renewal_terms: { type: 'string' },
              key_clauses: { type: 'array', items: { type: 'object', properties: { clause: { type: 'string' }, importance: { type: 'string' }, rationale: { type: 'string' } } } }
            }
          },
          pricing_assessment: {
            type: 'object',
            properties: {
              fair_market_range: { type: 'string' },
              recommended_price: { type: 'string' },
              pricing_rationale: { type: 'string' },
              negotiation_anchors: { type: 'array', items: { type: 'string' } }
            }
          },
          risk_clauses: {
            type: 'array',
            items: { type: 'object', properties: { clause_name: { type: 'string' }, recommended_language: { type: 'string' }, risk_level: { type: 'string' }, why_important: { type: 'string' } } }
          },
          payment_structure: {
            type: 'object',
            properties: {
              model: { type: 'string' },
              milestones: { type: 'array', items: { type: 'object', properties: { milestone: { type: 'string' }, percentage: { type: 'string' }, trigger: { type: 'string' } } } },
              rationale: { type: 'string' }
            }
          },
          content_rights: {
            type: 'object',
            properties: {
              usage_rights_duration: { type: 'string' },
              platforms_covered: { type: 'string' },
              exclusivity_scope: { type: 'string' },
              whitelisting_terms: { type: 'string' }
            }
          },
          performance_guarantees: {
            type: 'array',
            items: { type: 'object', properties: { kpi: { type: 'string' }, benchmark: { type: 'string' }, remedy_if_missed: { type: 'string' } } }
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
