import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { period = 30 } = await req.json().catch(() => ({}));
    const validPeriods = [7, 30, 90];
    const analyzePeriod = validPeriods.includes(period) ? period : 30;

    const AGENTS = [
      { name: 'Contract Intelligence', fn: 'analyzeContractIntelligence', category: 'deal', description: 'Contract clause analysis & risk detection' },
      { name: 'Competitor Intelligence', fn: 'analyzeCompetitorIntelligence', category: 'deal', description: 'Competitor activity & market positioning' },
      { name: 'Audience Overlap', fn: 'analyzeAudienceOverlap', category: 'portfolio', description: 'Cross-partner audience overlap analysis' },
      { name: 'Relationship Health', fn: 'analyzeRelationshipHealth', category: 'relationship', description: 'Partnership health scoring & alerts' },
      { name: 'Creative Direction', fn: 'generateCreativeDirection', category: 'creative', description: 'AI-driven creative brief generation' },
      { name: 'Negotiation Coach', fn: 'analyzeNegotiationCoach', category: 'deal', description: 'Deal negotiation strategy & coaching' },
      { name: 'Trend Prediction', fn: 'analyzeTrendPrediction', category: 'market', description: 'Market trend forecasting & signals' },
      { name: 'Brand Safety', fn: 'analyzeBrandSafety', category: 'compliance', description: 'Brand safety monitoring & risk flags' },
      { name: 'Cross-Platform Attribution', fn: 'analyzeCrossPlatformAttribution', category: 'analytics', description: 'Multi-platform attribution modeling' },
      { name: 'Roster Optimization', fn: 'analyzeRosterOptimization', category: 'portfolio', description: 'Talent roster balancing & recommendations' },
      { name: 'Invoice Reconciliation', fn: 'analyzeInvoiceReconciliation', category: 'finance', description: 'Invoice matching & discrepancy detection' },
      { name: 'Compliance & Disclosure', fn: 'analyzeComplianceDisclosure', category: 'compliance', description: 'FTC/regulatory compliance checking' },
    ];

    const [partnerships, talents, activities] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.Talent.list('-created_date', 500),
      base44.entities.Activity.list('-created_date', 500),
    ]);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - analyzePeriod);
    const cutoffISO = cutoffDate.toISOString();

    const recentPartnerships = partnerships.filter(p => p.created_date >= cutoffISO);
    const recentActivities = activities.filter(a => a.created_date >= cutoffISO);

    const statusBreakdown = {};
    partnerships.forEach(p => {
      statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1;
    });

    const prompt = `You are an Agent Performance Analytics AI for a talent agency management platform called PartnerIQ.

ANALYSIS PERIOD: Last ${analyzePeriod} days

PLATFORM CONTEXT:
- Total talents managed: ${talents.length}
- Total partnerships: ${partnerships.length}
- Recent partnerships (in period): ${recentPartnerships.length}
- Recent activities (in period): ${recentActivities.length}
- Partnership status breakdown: ${JSON.stringify(statusBreakdown)}

AGENTS TO ANALYZE (12 AI agents):
${AGENTS.map(a => `- ${a.name} (${a.fn}): ${a.description} [Category: ${a.category}]`).join('\n')}

AGENT CHAIN CONFIGURATIONS:
- Deal Intelligence: Trend Prediction -> Competitor Intelligence -> Negotiation Coach
- Brand Protection: Brand Safety -> Compliance & Disclosure -> Relationship Health
- Portfolio Optimization: Audience Overlap -> Roster Optimization -> Cross-Platform Attribution
- Campaign Launch: Trend Prediction -> Creative Direction -> Contract Intelligence
- Financial Health: Invoice Reconciliation -> Contract Intelligence -> Competitor Intelligence

Based on the platform data volume and the nature of each agent, generate a comprehensive performance analytics report. Estimate agent usage based on the data volume (more partnerships = more agent runs needed), assess quality based on data completeness, and provide actionable recommendations.

For each agent, estimate:
1. How many times it was likely run in the period based on data patterns
2. Quality of analysis it could produce given the available data
3. How actionable its insights are for a talent agency
4. Its most valuable insight type
5. Areas where it could improve
6. Recommended run frequency

Also identify:
- Top 3 performing agents and why
- Underperforming agents with improvement suggestions
- Best agent chain combinations and new chains to try
- ROI contribution estimate for each agent
- A step-by-step optimization plan`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          period_analyzed: { type: 'number' },
          agent_metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent_name: { type: 'string' },
                runs_estimated: { type: 'number' },
                avg_response_quality: { type: 'number' },
                actionability_score: { type: 'number' },
                most_valuable_insight: { type: 'string' },
                improvement_areas: { type: 'array', items: { type: 'string' } },
                recommended_frequency: { type: 'string' }
              }
            }
          },
          top_performing_agents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent: { type: 'string' },
                reason: { type: 'string' },
                impact_score: { type: 'number' }
              }
            }
          },
          underperforming_agents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' }
              }
            }
          },
          usage_recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                recommendation: { type: 'string' },
                expected_improvement: { type: 'string' }
              }
            }
          },
          agent_combinations: {
            type: 'object',
            properties: {
              most_effective_chain: { type: 'string' },
              least_used_pair: { type: 'string' },
              suggested_new_chain: { type: 'string' }
            }
          },
          roi_contribution: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent: { type: 'string' },
                estimated_value_added: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          },
          optimization_plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'number' },
                agent: { type: 'string' },
                action: { type: 'string' },
                expected_result: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, analytics: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
