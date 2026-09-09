import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json({ error: 'A query is required.' }, { status: 400 });
    }

    // Fetch summary data across all key entities
    const [partnerships, talents, brands, activities] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 200),
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Brand.list('-created_date', 200),
      base44.entities.Activity.list('-created_date', 50),
    ]);

    // Compute summary statistics
    const partnershipsByStatus = {};
    for (const p of partnerships) {
      const s = p.status || 'unknown';
      partnershipsByStatus[s] = (partnershipsByStatus[s] || 0) + 1;
    }

    const activePartnerships = partnerships.filter(p => ['active', 'contracted'].includes(p.status));
    const atRiskPartnerships = partnerships.filter(p => ['at_risk', 'paused', 'stalled'].includes(p.status));
    const completedPartnerships = partnerships.filter(p => p.status === 'completed');
    const totalDealValue = partnerships.reduce((sum, p) => sum + (p.deal_value || 0), 0);
    const avgDealValue = partnerships.length > 0 ? totalDealValue / partnerships.length : 0;
    const avgMatchScore = partnerships.length > 0
      ? partnerships.reduce((sum, p) => sum + (p.match_score || 0), 0) / partnerships.length
      : 0;

    const recentActivities = activities.slice(0, 10).map(a => ({
      type: a.activity_type || a.type || 'activity',
      description: a.description || a.title || '',
      date: a.created_date || a.date || '',
    }));

    const agentsCatalog = `
AVAILABLE AI AGENTS (12 total):
1. Contract Intelligence (analyzeContractIntelligence) - Deal structuring, contract analysis, pricing fairness, risk clause recommendations.
2. Competitor Intelligence (analyzeCompetitorIntelligence) - Monitor competitor brand-creator partnerships, white space opportunities, talent acquisition threats.
3. Audience Overlap (analyzeAudienceOverlap) - Audience overlap between creators, cannibalization prevention, portfolio reach optimization.
4. Relationship Health (analyzeRelationshipHealth) - Partnership sentiment tracking, at-risk flagging, re-engagement strategies.
5. Creative Direction (generateCreativeDirection) - Content briefs, visual style guides, talking points, platform-specific scripts.
6. Negotiation Coach (analyzeNegotiationCoach) - BATNA analysis, counter-offers, leverage points, closing tactics.
7. Trend Prediction (analyzeTrendPrediction) - Emerging trends, viral moments, newsjacking opportunities, activation windows.
8. Brand Safety (analyzeBrandSafety) - Creator content monitoring for brand safety risks, crisis scenarios, compliance red flags.
9. Cross-Platform Attribution (analyzeCrossPlatformAttribution) - Multi-touch attribution, channel effectiveness, incrementality analysis.
10. Roster Optimization (analyzeRosterOptimization) - Talent roster analysis, coverage gaps, recruit recommendations, underperformer flagging.
11. Invoice & Payments (analyzeInvoiceReconciliation) - Payment tracking, milestone billing, dispute risk identification, cash flow forecasting.
12. Compliance & Disclosure (analyzeComplianceDisclosure) - FTC/ASA compliance, disclosure requirements, compliance reports.
`;

    const prompt = `You are the AI Command Center for PartnerIQ, an influencer/creator partnership management platform.
A user asked: "${query}"

CURRENT PLATFORM DATA:
- Total Partnerships: ${partnerships.length}
- Partnership Status Breakdown: ${JSON.stringify(partnershipsByStatus)}
- Active Partnerships: ${activePartnerships.length}
- At-Risk Partnerships: ${atRiskPartnerships.length}
- Completed Partnerships: ${completedPartnerships.length}
- Total Deal Value: $${totalDealValue.toLocaleString()}
- Average Deal Value: $${avgDealValue.toFixed(0)}
- Average Match Score: ${avgMatchScore.toFixed(1)}%
- Total Talents: ${talents.length}
- Total Brands: ${brands.length}
- Recent Activities: ${JSON.stringify(recentActivities)}

${agentsCatalog}

Based on the user's query and the data above, provide:
1. An understanding of what the user is asking
2. Which agents (if any) are most relevant and why
3. A direct natural-language answer with actionable insights using the real data
4. A data summary with the most relevant metrics for their query
5. Suggested next actions with urgency levels
6. Follow-up questions they might want to ask`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          understanding: { type: 'string' },
          recommended_agents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent_name: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          direct_answer: { type: 'string' },
          data_summary: {
            type: 'object',
            properties: {
              total_partnerships: { type: 'number' },
              active_partnerships: { type: 'number' },
              at_risk_partnerships: { type: 'number' },
              total_talents: { type: 'number' },
              total_brands: { type: 'number' },
              total_deal_value: { type: 'string' },
              avg_deal_value: { type: 'string' },
              avg_match_score: { type: 'string' },
              additional_metrics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                    value: { type: 'string' }
                  }
                }
              }
            }
          },
          suggested_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                page_to_visit: { type: 'string' },
                urgency: { type: 'string' }
              }
            }
          },
          follow_up_questions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({ success: true, response: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
