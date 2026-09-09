import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [partnerships, talents, brands, benchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Brand.list('-created_date', 100),
      base44.entities.RateBenchmark.list('-created_date', 50),
    ]);

    if (partnerships.length === 0 && brands.length === 0) {
      return Response.json({ error: 'No partnership or brand data found.' }, { status: 400 });
    }

    const activeDeals = partnerships.filter(p => ['active', 'contracted'].includes(p.status));
    const nicheDistribution = {};
    talents.forEach(t => { if (t.niche) nicheDistribution[t.niche] = (nicheDistribution[t.niche] || 0) + 1; });
    const platformDistribution = {};
    talents.forEach(t => { if (t.platform) platformDistribution[t.platform] = (platformDistribution[t.platform] || 0) + 1; });

    const prompt = `You are a Competitor Intelligence AI Agent for influencer marketing.

PLATFORM DATA:
- Total brands tracked: ${brands.length}
- Total talent profiles: ${talents.length}
- Active partnerships: ${activeDeals.length}
- Total historical deals: ${partnerships.length}

NICHE DISTRIBUTION: ${JSON.stringify(nicheDistribution)}
PLATFORM DISTRIBUTION: ${JSON.stringify(platformDistribution)}

BRAND DETAILS:
${brands.slice(0, 10).map(b => `- ${b.name}: Industry=${b.industry || 'N/A'}, Budget=$${b.annual_budget || 'N/A'}, Niches=${b.preferred_niches || 'N/A'}`).join('\n')}

RATE BENCHMARKS:
${benchmarks.slice(0, 5).map(b => `- ${b.tier}: $${b.sponsored_post_min}-$${b.sponsored_post_max}`).join('\n')}

Analyze the competitive landscape and provide:
1. Market positioning of tracked brands vs industry
2. Competitor partnership patterns and strategies
3. White space opportunities (underserved niches, untapped talent tiers)
4. Talent acquisition threats (creators likely to be poached)
5. Pricing intelligence vs competitors
6. Emerging competitive trends
7. Strategic recommendations to gain competitive advantage`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          market_position: {
            type: 'object',
            properties: {
              current_standing: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              vulnerabilities: { type: 'array', items: { type: 'string' } }
            }
          },
          competitor_patterns: {
            type: 'array',
            items: { type: 'object', properties: { pattern: { type: 'string' }, frequency: { type: 'string' }, threat_level: { type: 'string' }, counter_strategy: { type: 'string' } } }
          },
          white_space_opportunities: {
            type: 'array',
            items: { type: 'object', properties: { opportunity: { type: 'string' }, potential_value: { type: 'string' }, difficulty: { type: 'string' }, recommended_action: { type: 'string' } } }
          },
          talent_threats: {
            type: 'array',
            items: { type: 'object', properties: { threat: { type: 'string' }, risk_level: { type: 'string' }, affected_talent_tier: { type: 'string' }, mitigation: { type: 'string' } } }
          },
          pricing_intelligence: {
            type: 'object',
            properties: {
              market_rate_trend: { type: 'string' },
              overpriced_segments: { type: 'string' },
              underpriced_opportunities: { type: 'string' },
              pricing_recommendation: { type: 'string' }
            }
          },
          emerging_trends: { type: 'array', items: { type: 'object', properties: { trend: { type: 'string' }, impact: { type: 'string' }, timeline: { type: 'string' }, action_required: { type: 'string' } } } },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
