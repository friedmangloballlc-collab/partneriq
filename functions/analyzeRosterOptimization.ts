import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [talents, partnerships, benchmarks] = await Promise.all([
      base44.entities.Talent.list('-created_date', 500),
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.RateBenchmark.list('-created_date', 50),
    ]);

    if (talents.length === 0) {
      return Response.json({ error: 'No talent data found.' }, { status: 400 });
    }

    const nicheDistribution = {};
    const tierDistribution = {};
    const platformDistribution = {};
    talents.forEach(t => {
      if (t.niche) nicheDistribution[t.niche] = (nicheDistribution[t.niche] || 0) + 1;
      if (t.tier) tierDistribution[t.tier] = (tierDistribution[t.tier] || 0) + 1;
      if (t.platform) platformDistribution[t.platform] = (platformDistribution[t.platform] || 0) + 1;
    });

    const dealsByTalent = {};
    partnerships.forEach(p => { if (p.talent_name) dealsByTalent[p.talent_name] = (dealsByTalent[p.talent_name] || 0) + 1; });

    const prompt = `You are a Roster Optimization AI Agent for talent agencies managing creator rosters.

ROSTER OVERVIEW:
- Total talent: ${talents.length}
- Niche distribution: ${JSON.stringify(nicheDistribution)}
- Tier distribution: ${JSON.stringify(tierDistribution)}
- Platform distribution: ${JSON.stringify(platformDistribution)}

TALENT PERFORMANCE (top 20):
${talents.slice(0, 20).map(t => `- ${t.name}: ${t.platform}/${t.niche}, ${t.tier}, ${t.followers?.toLocaleString()} followers, ER=${t.engagement_rate}%, Deals=${dealsByTalent[t.name] || 0}, Alpha=${t.discovery_alpha_score || 'N/A'}`).join('\n')}

PARTNERSHIP STATS:
- Total deals: ${partnerships.length}
- Active: ${partnerships.filter(p => ['active', 'contracted'].includes(p.status)).length}
- Completed: ${partnerships.filter(p => p.status === 'completed').length}
- Churned: ${partnerships.filter(p => p.status === 'churned').length}

Optimize the talent roster:
1. Coverage gaps (missing niches, platforms, tiers)
2. Talent to recruit (archetype recommendations)
3. Underperforming talent to consider sunsetting
4. Rising stars to invest in
5. Portfolio balance score
6. Revenue optimization opportunities
7. Competitive roster positioning`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          portfolio_score: {
            type: 'object',
            properties: {
              overall_grade: { type: 'string' },
              diversity_score: { type: 'string' },
              revenue_potential: { type: 'string' },
              growth_trajectory: { type: 'string' }
            }
          },
          coverage_gaps: {
            type: 'array',
            items: { type: 'object', properties: { gap_type: { type: 'string' }, missing_area: { type: 'string' }, market_opportunity: { type: 'string' }, priority: { type: 'string' }, recommendation: { type: 'string' } } }
          },
          recruit_recommendations: {
            type: 'array',
            items: { type: 'object', properties: { archetype: { type: 'string' }, niche: { type: 'string' }, platform: { type: 'string' }, ideal_tier: { type: 'string' }, revenue_potential: { type: 'string' }, rationale: { type: 'string' } } }
          },
          sunset_candidates: {
            type: 'array',
            items: { type: 'object', properties: { talent: { type: 'string' }, reason: { type: 'string' }, metrics: { type: 'string' }, alternative_action: { type: 'string' } } }
          },
          rising_stars: {
            type: 'array',
            items: { type: 'object', properties: { talent: { type: 'string' }, growth_signal: { type: 'string' }, investment_recommendation: { type: 'string' }, projected_value: { type: 'string' } } }
          },
          revenue_optimization: {
            type: 'array',
            items: { type: 'object', properties: { opportunity: { type: 'string' }, potential_revenue: { type: 'string' }, effort_level: { type: 'string' }, implementation: { type: 'string' } } }
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
