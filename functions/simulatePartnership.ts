import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { scenario } = await req.json();
    if (!scenario || !scenario.type) {
      return Response.json({ error: 'Missing scenario or scenario.type' }, { status: 400 });
    }

    const { type, params = {} } = scenario;
    const validTypes = ['add_creator', 'remove_creator', 'change_budget', 'new_campaign', 'market_shift'];
    if (!validTypes.includes(type)) {
      return Response.json({ error: `Invalid scenario type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    // Fetch all relevant data in parallel
    const [partnerships, talents, brands, rateBenchmarks, roiBenchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.Talent.list('-created_date', 500),
      base44.entities.Brand.list('-created_date', 200),
      base44.entities.RateBenchmark.list('-created_date', 50),
      base44.entities.ROIBenchmark.list('-created_date', 50),
    ]);

    // Compute current portfolio metrics
    const activePartnerships = partnerships.filter(p => ['active', 'contracted'].includes(p.status));
    const completedPartnerships = partnerships.filter(p => p.status === 'completed');
    const totalDealValue = partnerships.reduce((sum, p) => sum + (p.deal_value || p.amount || 0), 0);
    const avgRoi = completedPartnerships.length > 0
      ? completedPartnerships.reduce((sum, p) => sum + (p.roi || 0), 0) / completedPartnerships.length
      : 0;

    // Build talent summary
    const talentSummaries = talents.slice(0, 30).map(t => ({
      id: t.id,
      name: t.name,
      platform: t.platform,
      niche: t.niche,
      tier: t.tier,
      followers: t.followers,
      engagement_rate: t.engagement_rate,
      alpha_score: t.discovery_alpha_score,
    }));

    // Build scenario-specific context
    let scenarioContext = '';
    switch (type) {
      case 'add_creator':
        scenarioContext = `SCENARIO: Adding new creator(s) to the roster.
Talent IDs to add: ${JSON.stringify(params.talent_ids || [])}
Selected talents details: ${JSON.stringify(talents.filter(t => (params.talent_ids || []).includes(t.id)).map(t => ({ name: t.name, platform: t.platform, niche: t.niche, tier: t.tier, followers: t.followers, engagement_rate: t.engagement_rate })))}
Consider: roster diversity impact, potential brand partnerships, revenue uplift, audience overlap risks.`;
        break;
      case 'remove_creator':
        scenarioContext = `SCENARIO: Removing creator(s) from the roster.
Talent IDs to remove: ${JSON.stringify(params.talent_ids || [])}
Talents being removed: ${JSON.stringify(talents.filter(t => (params.talent_ids || []).includes(t.id)).map(t => ({ name: t.name, platform: t.platform, niche: t.niche, tier: t.tier, followers: t.followers, active_deals: partnerships.filter(p => p.talent_id === t.id && ['active', 'contracted'].includes(p.status)).length })))}
Consider: revenue loss, brand relationship disruption, coverage gaps, cost savings.`;
        break;
      case 'change_budget':
        scenarioContext = `SCENARIO: Changing partnership budget allocation.
Budget change: ${params.budget_change || 0}% (positive = increase, negative = decrease)
Current total portfolio value: $${totalDealValue.toLocaleString()}
New projected budget: $${(totalDealValue * (1 + (params.budget_change || 0) / 100)).toLocaleString()}
Consider: deal capacity changes, pricing leverage, talent retention, ROI impact.`;
        break;
      case 'new_campaign':
        scenarioContext = `SCENARIO: Launching a new campaign type.
Campaign type: ${params.campaign_type || 'general'}
Consider: talent fit, expected reach, production requirements, timeline, budget allocation from existing deals.`;
        break;
      case 'market_shift':
        scenarioContext = `SCENARIO: External market shift impacting partnerships.
Market factor: ${params.market_factor || 'general economic change'}
Consider: rate adjustments, brand spending changes, platform algorithm shifts, competitive landscape, talent demand changes.`;
        break;
    }

    const prompt = `You are a Partnership Simulation AI for a talent management agency. Analyze the current portfolio state and simulate the impact of the proposed scenario.

CURRENT PORTFOLIO STATE:
- Total creators on roster: ${talents.length}
- Total partnership deals: ${partnerships.length}
- Active deals: ${activePartnerships.length}
- Completed deals: ${completedPartnerships.length}
- Portfolio value: $${totalDealValue.toLocaleString()}
- Average ROI: ${avgRoi.toFixed(1)}%
- Brands partnered with: ${brands.length}

RATE BENCHMARKS:
${rateBenchmarks.slice(0, 10).map(rb => `- ${rb.platform || rb.category}: $${rb.rate_min || 0}-$${rb.rate_max || 0} (${rb.tier || 'all tiers'})`).join('\n')}

ROI BENCHMARKS:
${roiBenchmarks.slice(0, 10).map(rb => `- ${rb.category || rb.platform}: ${rb.avg_roi || rb.roi || 0}% avg ROI`).join('\n')}

TOP TALENT (sample):
${talentSummaries.slice(0, 15).map(t => `- ${t.name}: ${t.platform}/${t.niche}, ${t.tier}, ${t.followers?.toLocaleString()} followers, ER=${t.engagement_rate}%`).join('\n')}

${scenarioContext}

Simulate this scenario thoroughly. Provide realistic projections based on the data. Be specific with numbers and percentages. Consider both positive and negative impacts.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          scenario_description: { type: 'string' },
          current_state: {
            type: 'object',
            properties: {
              total_creators: { type: 'number' },
              total_deals: { type: 'number' },
              portfolio_value: { type: 'number' },
              avg_roi: { type: 'number' },
            },
          },
          simulated_state: {
            type: 'object',
            properties: {
              total_creators: { type: 'number' },
              total_deals: { type: 'number' },
              portfolio_value: { type: 'number' },
              avg_roi: { type: 'number' },
            },
          },
          impact_analysis: {
            type: 'object',
            properties: {
              revenue_impact: { type: 'string' },
              risk_impact: { type: 'string' },
              reach_impact: { type: 'string' },
              efficiency_impact: { type: 'string' },
            },
          },
          comparison_table: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                metric: { type: 'string' },
                current: { type: 'string' },
                simulated: { type: 'string' },
                change: { type: 'string' },
                change_percent: { type: 'string' },
              },
            },
          },
          side_effects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                effect: { type: 'string' },
                severity: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
          confidence_score: { type: 'number' },
          timeline_to_impact: { type: 'string' },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
          alternative_scenarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                scenario: { type: 'string' },
                expected_outcome: { type: 'string' },
                risk_level: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({ success: true, simulation: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
