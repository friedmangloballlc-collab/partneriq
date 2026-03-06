import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { partnership_id } = body;

    const [partnerships, proposals, benchmarks, roiBenchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.PartnershipProposal.list('-created_date', 100),
      base44.entities.RateBenchmark.list('-created_date', 50),
      base44.entities.ROIBenchmark.list('-created_date', 30),
    ]);

    if (partnerships.length === 0) {
      return Response.json({ error: 'No partnership data found.' }, { status: 400 });
    }

    const deal = partnership_id ? partnerships.find(p => p.id === partnership_id) : partnerships.find(p => ['negotiating', 'outreach_sent', 'responded'].includes(p.status)) || partnerships[0];
    const completedDeals = partnerships.filter(p => ['completed', 'active'].includes(p.status));
    const avgDealValue = completedDeals.reduce((s, d) => s + (d.deal_value || 0), 0) / (completedDeals.length || 1);

    const prompt = `You are a Negotiation Coach AI Agent for influencer partnership deals.

CURRENT NEGOTIATION:
${deal ? `- Deal: ${deal.talent_name || 'Creator'} × ${deal.brand_name || 'Brand'}
- Status: ${deal.status}
- Current Value: $${deal.deal_value || 'TBD'}
- Type: ${deal.partnership_type || 'Not specified'}
- Match Score: ${deal.match_score || 'N/A'}` : 'General negotiation guidance'}

HISTORICAL CONTEXT:
- Completed deals: ${completedDeals.length}
- Average deal value: $${avgDealValue.toFixed(0)}
- Active proposals: ${proposals.length}

RATE BENCHMARKS:
${benchmarks.slice(0, 5).map(b => `- ${b.tier}: $${b.sponsored_post_min}-$${b.sponsored_post_max} (posts), $${b.brand_deal_min}-$${b.brand_deal_max} (deals)`).join('\n')}

ROI BENCHMARKS:
${roiBenchmarks.slice(0, 5).map(r => `- ${r.deal_type}: Median ${r.median_roi}x, Top ${r.top_quartile_roi}x`).join('\n')}

Provide real-time negotiation coaching:
1. BATNA analysis (Best Alternative to Negotiated Agreement)
2. Optimal counter-offer strategy
3. Leverage points and concessions matrix
4. Walk-away thresholds
5. Value-add suggestions (low cost, high perceived value)
6. Objection handling playbook
7. Closing tactics and timeline pressure points`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          batna_analysis: {
            type: 'object',
            properties: {
              your_batna: { type: 'string' },
              their_likely_batna: { type: 'string' },
              zone_of_possible_agreement: { type: 'string' },
              power_balance: { type: 'string' }
            }
          },
          counter_offer_strategy: {
            type: 'object',
            properties: {
              recommended_offer: { type: 'string' },
              anchor_price: { type: 'string' },
              justification_talking_points: { type: 'array', items: { type: 'string' } },
              concession_sequence: { type: 'array', items: { type: 'object', properties: { round: { type: 'string' }, concession: { type: 'string' }, ask_in_return: { type: 'string' } } } }
            }
          },
          leverage_points: { type: 'array', items: { type: 'object', properties: { leverage: { type: 'string' }, strength: { type: 'string' }, how_to_use: { type: 'string' } } } },
          walk_away_thresholds: {
            type: 'object',
            properties: {
              price_floor: { type: 'string' },
              deal_breakers: { type: 'array', items: { type: 'string' } },
              warning_signs: { type: 'array', items: { type: 'string' } }
            }
          },
          value_adds: { type: 'array', items: { type: 'object', properties: { suggestion: { type: 'string' }, cost_to_you: { type: 'string' }, perceived_value: { type: 'string' } } } },
          objection_playbook: { type: 'array', items: { type: 'object', properties: { objection: { type: 'string' }, response: { type: 'string' }, follow_up: { type: 'string' } } } },
          closing_tactics: { type: 'array', items: { type: 'object', properties: { tactic: { type: 'string' }, when_to_use: { type: 'string' }, script: { type: 'string' } } } },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
