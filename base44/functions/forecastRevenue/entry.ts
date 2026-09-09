import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { timeframe } = await req.json();
    const validTimeframes = [30, 60, 90, 180];
    const days = validTimeframes.includes(timeframe) ? timeframe : 90;

    // Fetch all data sources in parallel
    const [partnerships, billingHistory, talents, rateBenchmarks, roiBenchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.BillingHistory.list('-created_date', 500),
      base44.entities.Talent.list('-created_date', 500),
      base44.entities.RateBenchmark.list('-created_date', 200),
      base44.entities.ROIBenchmark.list('-created_date', 200),
    ]);

    // --- Historical Conversion Rates ---
    const totalDeals = partnerships.length;
    const completedDeals = partnerships.filter(p => p.status === 'completed');
    const activeDeals = partnerships.filter(p => p.status === 'active');
    const contractedDeals = partnerships.filter(p => p.status === 'contracted');
    const proposalDeals = partnerships.filter(p => p.status === 'proposal');
    const outreachDeals = partnerships.filter(p => p.status === 'outreach');
    const churnedDeals = partnerships.filter(p => p.status === 'churned');

    const conversionRate = totalDeals > 0
      ? ((completedDeals.length + activeDeals.length + contractedDeals.length) / totalDeals * 100).toFixed(1)
      : 0;

    const proposalToCloseRate = proposalDeals.length + completedDeals.length + contractedDeals.length > 0
      ? ((completedDeals.length + contractedDeals.length) / (proposalDeals.length + completedDeals.length + contractedDeals.length) * 100).toFixed(1)
      : 0;

    const churnRate = totalDeals > 0
      ? (churnedDeals.length / totalDeals * 100).toFixed(1)
      : 0;

    // --- Average Deal Values ---
    const dealsWithValue = partnerships.filter(p => p.deal_value && p.deal_value > 0);
    const avgDealValue = dealsWithValue.length
      ? Math.round(dealsWithValue.reduce((s, p) => s + p.deal_value, 0) / dealsWithValue.length)
      : 0;

    const completedDealValues = completedDeals.filter(p => p.deal_value > 0);
    const avgCompletedDealValue = completedDealValues.length
      ? Math.round(completedDealValues.reduce((s, p) => s + p.deal_value, 0) / completedDealValues.length)
      : avgDealValue;

    const maxDealValue = dealsWithValue.length
      ? Math.max(...dealsWithValue.map(p => p.deal_value))
      : 0;

    const minDealValue = dealsWithValue.length
      ? Math.min(...dealsWithValue.map(p => p.deal_value))
      : 0;

    // --- Deal Value by Type ---
    const dealsByType: Record<string, { count: number; total: number; completed: number }> = {};
    for (const p of partnerships) {
      const t = p.partnership_type || 'unknown';
      if (!dealsByType[t]) dealsByType[t] = { count: 0, total: 0, completed: 0 };
      dealsByType[t].count++;
      dealsByType[t].total += p.deal_value || 0;
      if (p.status === 'completed' || p.status === 'active') dealsByType[t].completed++;
    }

    const typeBreakdown = Object.entries(dealsByType).map(([type, stats]) => ({
      type,
      count: stats.count,
      avgValue: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
      successRate: stats.count > 0 ? ((stats.completed / stats.count) * 100).toFixed(0) : '0',
    }));

    // --- Seasonal Patterns ---
    const dealsByMonth: Record<number, { count: number; revenue: number }> = {};
    for (const p of partnerships) {
      if (!p.created_date && !p.created_at) continue;
      const month = new Date(p.created_date || p.created_at).getMonth();
      if (!dealsByMonth[month]) dealsByMonth[month] = { count: 0, revenue: 0 };
      dealsByMonth[month].count++;
      dealsByMonth[month].revenue += p.deal_value || 0;
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalData = monthNames.map((name, i) => ({
      month: name,
      deals: dealsByMonth[i]?.count || 0,
      revenue: dealsByMonth[i]?.revenue || 0,
    }));

    // --- Pipeline Value ---
    const pipelineDeals = partnerships.filter(p =>
      ['outreach', 'proposal', 'negotiation', 'contracted'].includes(p.status)
    );
    const totalPipelineValue = pipelineDeals.reduce((s, p) => s + (p.deal_value || 0), 0);

    const pipelineByStage = {
      outreach: pipelineDeals.filter(p => p.status === 'outreach'),
      proposal: pipelineDeals.filter(p => p.status === 'proposal'),
      negotiation: pipelineDeals.filter(p => p.status === 'negotiation'),
      contracted: pipelineDeals.filter(p => p.status === 'contracted'),
    };

    const weightedPipeline = Object.entries(pipelineByStage).reduce((total, [stage, deals]) => {
      const weights: Record<string, number> = { outreach: 0.1, proposal: 0.25, negotiation: 0.5, contracted: 0.8 };
      return total + deals.reduce((s, d) => s + (d.deal_value || 0) * (weights[stage] || 0), 0);
    }, 0);

    // --- Billing History ---
    const totalRevenue = billingHistory.reduce((s, b) => s + (b.amount || 0), 0);
    const recentBilling = billingHistory.slice(0, 12);
    const avgMonthlyRevenue = recentBilling.length
      ? Math.round(recentBilling.reduce((s, b) => s + (b.amount || 0), 0) / Math.max(recentBilling.length, 1))
      : 0;

    // --- Talent Capacity ---
    const availableTalents = talents.filter(t => t.availability_status === 'available');
    const topTierTalents = talents.filter(t => t.tier === 'mega' || t.tier === 'macro');
    const avgTalentRate = talents.filter(t => t.rate_per_post > 0).length
      ? Math.round(talents.filter(t => t.rate_per_post > 0).reduce((s, t) => s + t.rate_per_post, 0) / talents.filter(t => t.rate_per_post > 0).length)
      : 0;

    // --- Rate & ROI Benchmarks ---
    const benchmarkSummary = rateBenchmarks.slice(0, 5).map(r => ({
      platform: r.platform || 'Unknown',
      tier: r.tier || 'Unknown',
      avgRate: r.average_rate || r.avg_rate || 0,
    }));

    const roiSummary = roiBenchmarks.slice(0, 5).map(r => ({
      dealType: r.deal_type || 'Unknown',
      medianROI: r.median_roi || 0,
      topQuartileROI: r.top_quartile_roi || 0,
    }));

    // --- Build LLM Prompt ---
    const prompt = `You are a senior revenue forecasting analyst for an influencer marketing platform (PartnerIQ).

Generate a comprehensive revenue forecast for the next ${days} days based on all available data.

**Historical Deal Data (${totalDeals} total partnerships):**
- Completed deals: ${completedDeals.length}
- Active deals: ${activeDeals.length}
- Contracted: ${contractedDeals.length}
- In proposal: ${proposalDeals.length}
- Outreach: ${outreachDeals.length}
- Churned: ${churnedDeals.length}
- Overall conversion rate (to active/completed/contracted): ${conversionRate}%
- Proposal-to-close rate: ${proposalToCloseRate}%
- Churn rate: ${churnRate}%

**Deal Value Statistics:**
- Average deal value: $${avgDealValue.toLocaleString()}
- Average completed deal value: $${avgCompletedDealValue.toLocaleString()}
- Deal value range: $${minDealValue.toLocaleString()} – $${maxDealValue.toLocaleString()}

**Deal Breakdown by Type:**
${typeBreakdown.map(t => `- ${t.type}: ${t.count} deals, avg value $${t.avgValue.toLocaleString()}, success rate ${t.successRate}%`).join('\n')}

**Current Pipeline (${pipelineDeals.length} deals):**
- Total pipeline value: $${totalPipelineValue.toLocaleString()}
- Weighted pipeline value: $${Math.round(weightedPipeline).toLocaleString()}
- Outreach: ${pipelineByStage.outreach.length} deals ($${pipelineByStage.outreach.reduce((s, d) => s + (d.deal_value || 0), 0).toLocaleString()})
- Proposal: ${pipelineByStage.proposal.length} deals ($${pipelineByStage.proposal.reduce((s, d) => s + (d.deal_value || 0), 0).toLocaleString()})
- Negotiation: ${(pipelineByStage.negotiation?.length || 0)} deals ($${(pipelineByStage.negotiation?.reduce((s, d) => s + (d.deal_value || 0), 0) || 0).toLocaleString()})
- Contracted: ${pipelineByStage.contracted.length} deals ($${pipelineByStage.contracted.reduce((s, d) => s + (d.deal_value || 0), 0).toLocaleString()})

**Seasonal Patterns (deals by month):**
${seasonalData.map(s => `- ${s.month}: ${s.deals} deals, $${s.revenue.toLocaleString()} revenue`).join('\n')}

**Billing History:**
- Total historical revenue: $${totalRevenue.toLocaleString()}
- Average monthly billing: $${avgMonthlyRevenue.toLocaleString()}
- Recent transactions: ${recentBilling.length}

**Talent Capacity:**
- Total talents: ${talents.length}
- Available talents: ${availableTalents.length}
- Top-tier (mega/macro): ${topTierTalents.length}
- Average talent rate per post: $${avgTalentRate.toLocaleString()}

**Market Benchmarks:**
Rate benchmarks: ${benchmarkSummary.map(b => `${b.platform}/${b.tier}: $${b.avgRate}`).join(', ') || 'N/A'}
ROI benchmarks: ${roiSummary.map(r => `${r.dealType}: ${r.medianROI}x median, ${r.topQuartileROI}x top`).join(', ') || 'N/A'}

Based on all this data, generate a ${days}-day revenue forecast. Be specific, data-driven, and realistic. Account for seasonality, pipeline health, and market conditions.

Return a JSON object with these exact fields:
{
  "forecast_period": "${days} days",
  "generated_at": "<ISO timestamp>",
  "revenue_projections": {
    "conservative": <integer, conservative revenue estimate in USD>,
    "moderate": <integer, moderate/likely revenue estimate in USD>,
    "aggressive": <integer, optimistic revenue estimate in USD>,
    "confidence_level": <integer 0-100, overall confidence in forecast>
  },
  "monthly_breakdown": [
    {
      "month": "<month name, e.g. 'March 2026'>",
      "projected_revenue": <integer>,
      "deal_count": <integer>,
      "confidence": <integer 0-100>
    }
  ],
  "pipeline_analysis": {
    "total_pipeline_value": <integer>,
    "weighted_pipeline": <integer>,
    "conversion_probability": <integer 0-100>
  },
  "revenue_drivers": [
    {
      "driver": "<description>",
      "impact": <"high"|"medium"|"low">,
      "trend": <"up"|"stable"|"down">
    }
  ],
  "risk_factors": [
    {
      "risk": "<description>",
      "probability": <"high"|"medium"|"low">,
      "revenue_impact": <integer, estimated USD impact>
    }
  ],
  "seasonal_adjustments": [
    {
      "period": "<e.g. 'Q2 2026'>",
      "adjustment_factor": <number, e.g. 1.15 for 15% boost>,
      "reason": "<explanation>"
    }
  ],
  "growth_opportunities": [
    {
      "opportunity": "<description>",
      "potential_revenue": <integer>,
      "effort_level": <"low"|"medium"|"high">,
      "timeline": "<e.g. '30 days', '60 days'>"
    }
  ],
  "recommendations": [<array of 4-6 specific actionable recommendation strings>]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          forecast_period: { type: 'string' },
          generated_at: { type: 'string' },
          revenue_projections: {
            type: 'object',
            properties: {
              conservative: { type: 'number' },
              moderate: { type: 'number' },
              aggressive: { type: 'number' },
              confidence_level: { type: 'number' },
            },
          },
          monthly_breakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                projected_revenue: { type: 'number' },
                deal_count: { type: 'number' },
                confidence: { type: 'number' },
              },
            },
          },
          pipeline_analysis: {
            type: 'object',
            properties: {
              total_pipeline_value: { type: 'number' },
              weighted_pipeline: { type: 'number' },
              conversion_probability: { type: 'number' },
            },
          },
          revenue_drivers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                driver: { type: 'string' },
                impact: { type: 'string' },
                trend: { type: 'string' },
              },
            },
          },
          risk_factors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                probability: { type: 'string' },
                revenue_impact: { type: 'number' },
              },
            },
          },
          seasonal_adjustments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                period: { type: 'string' },
                adjustment_factor: { type: 'number' },
                reason: { type: 'string' },
              },
            },
          },
          growth_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                opportunity: { type: 'string' },
                potential_revenue: { type: 'number' },
                effort_level: { type: 'string' },
                timeline: { type: 'string' },
              },
            },
          },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({ success: true, forecast: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
