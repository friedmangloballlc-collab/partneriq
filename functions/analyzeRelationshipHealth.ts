import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [partnerships, notes, emails, activities] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.DealNote.list('-created_date', 500),
      base44.entities.OutreachEmail.list('-created_date', 300),
      base44.entities.Activity.list('-created_date', 500),
    ]);

    if (partnerships.length === 0) {
      return Response.json({ error: 'No partnership data found.' }, { status: 400 });
    }

    const activeDeals = partnerships.filter(p => ['active', 'contracted', 'negotiating'].includes(p.status));
    const churnedDeals = partnerships.filter(p => p.status === 'churned');
    const dealsByStatus = {};
    partnerships.forEach(p => { dealsByStatus[p.status] = (dealsByStatus[p.status] || 0) + 1; });

    const prompt = `You are a Relationship Health AI Agent that monitors partnership sentiment and engagement.

PARTNERSHIP DATA:
- Total partnerships: ${partnerships.length}
- Active: ${activeDeals.length}
- Churned: ${churnedDeals.length}
- Status breakdown: ${JSON.stringify(dealsByStatus)}

COMMUNICATION DATA:
- Deal notes: ${notes.length} total
- Outreach emails: ${emails.length} (${emails.filter(e => e.status === 'replied').length} replied)
- Activities logged: ${activities.length}

ACTIVE PARTNERSHIPS:
${activeDeals.slice(0, 15).map(d => `- ${d.talent_name || 'Unknown'} × ${d.brand_name || 'Unknown'}: Value=$${d.deal_value || 0}, Score=${d.match_score || 'N/A'}, Status=${d.status}`).join('\n')}

CHURNED PARTNERSHIPS (for pattern analysis):
${churnedDeals.slice(0, 10).map(d => `- ${d.talent_name || 'Unknown'} × ${d.brand_name || 'Unknown'}: Value=$${d.deal_value || 0}`).join('\n')}

Analyze relationship health across all partnerships:
1. Overall portfolio health score
2. At-risk partnerships that may churn
3. Re-engagement opportunities for stalled deals
4. Communication pattern analysis
5. Relationship velocity trends
6. Churn prediction and prevention strategies`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          portfolio_health: {
            type: 'object',
            properties: {
              overall_score: { type: 'string' },
              grade: { type: 'string' },
              trend: { type: 'string' },
              healthy_count: { type: 'string' },
              at_risk_count: { type: 'string' },
              critical_count: { type: 'string' }
            }
          },
          at_risk_partnerships: {
            type: 'array',
            items: { type: 'object', properties: { partnership: { type: 'string' }, risk_level: { type: 'string' }, warning_signs: { type: 'string' }, days_since_contact: { type: 'string' }, recommended_action: { type: 'string' } } }
          },
          reengagement_opportunities: {
            type: 'array',
            items: { type: 'object', properties: { partnership: { type: 'string' }, opportunity: { type: 'string' }, potential_value: { type: 'string' }, approach: { type: 'string' } } }
          },
          communication_insights: {
            type: 'object',
            properties: {
              avg_response_time: { type: 'string' },
              most_responsive_channel: { type: 'string' },
              communication_frequency_trend: { type: 'string' },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          },
          churn_prevention: {
            type: 'array',
            items: { type: 'object', properties: { pattern: { type: 'string' }, prevention_strategy: { type: 'string' }, expected_impact: { type: 'string' } } }
          },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
