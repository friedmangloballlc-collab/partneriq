import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { brand_id, talent_ids } = await req.json();
    if (!brand_id || !talent_ids || !Array.isArray(talent_ids) || talent_ids.length === 0) {
      return Response.json({ error: 'brand_id and talent_ids (array) are required.' }, { status: 400 });
    }

    const [allBrands, allTalents, partnerships, benchmarks, events, industries] = await Promise.all([
      base44.entities.Brand.list('-created_date', 100),
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.RateBenchmark.list('-created_date', 50),
      base44.entities.CultureEvent.list('-created_date', 50),
      base44.entities.IndustryGuide.list('-created_date', 50),
    ]);

    const brand = allBrands.find(b => String(b.id) === String(brand_id));
    if (!brand) {
      return Response.json({ error: 'Brand not found.' }, { status: 404 });
    }

    const selectedTalents = allTalents.filter(t => talent_ids.map(String).includes(String(t.id)));
    if (selectedTalents.length === 0) {
      return Response.json({ error: 'No matching talents found.' }, { status: 404 });
    }

    // Competitor & landscape analysis data
    const brandPartnerships = partnerships.filter(p => p.brand_name === brand.name);
    const activeDeals = partnerships.filter(p => ['active', 'contracted'].includes(p.status));
    const completedDeals = partnerships.filter(p => p.status === 'completed');

    // Niche and platform distributions
    const nicheDistribution: Record<string, number> = {};
    allTalents.forEach(t => { if (t.niche) nicheDistribution[t.niche] = (nicheDistribution[t.niche] || 0) + 1; });
    const platformDistribution: Record<string, number> = {};
    allTalents.forEach(t => { if (t.platform) platformDistribution[t.platform] = (platformDistribution[t.platform] || 0) + 1; });

    // Brand safety scores for selected talent
    const talentSafetyData = selectedTalents.map(t => ({
      name: t.name,
      platform: t.platform,
      niche: t.niche,
      tier: t.tier,
      followers: t.followers,
      engagement_rate: t.engagement_rate,
      brand_safety_score: t.brand_safety_score || 'N/A',
      audience_demographics: t.audience_demographics || 'N/A',
    }));

    // Historical performance for ROI projections
    const avgDealValue = completedDeals.length > 0
      ? completedDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0) / completedDeals.length
      : 0;

    const prompt = `You are an AI Pitch Deck Personalization Agent for influencer marketing partnerships.

BRAND PROFILE:
- Name: ${brand.name}
- Industry: ${brand.industry || 'N/A'}
- Annual Budget: $${brand.annual_budget || 'N/A'}
- Target Audience: ${brand.target_audience || 'N/A'}
- Preferred Niches: ${brand.preferred_niches || 'N/A'}
- Brand Values: ${brand.brand_values || 'N/A'}
- Goals: ${brand.campaign_goals || 'N/A'}
- Previous Partnerships: ${brandPartnerships.length}

SELECTED TALENT FOR PITCH (${selectedTalents.length}):
${talentSafetyData.map(t => `- ${t.name}: ${t.platform}/${t.niche}, Tier=${t.tier}, Followers=${t.followers?.toLocaleString()}, Engagement=${t.engagement_rate || 'N/A'}%, Safety=${t.brand_safety_score}`).join('\n')}

MARKET CONTEXT:
- Total active deals in market: ${activeDeals.length}
- Completed deals for benchmarking: ${completedDeals.length}
- Average deal value: $${avgDealValue.toFixed(0)}
- Niche distribution: ${JSON.stringify(nicheDistribution)}
- Platform distribution: ${JSON.stringify(platformDistribution)}

RATE BENCHMARKS:
${benchmarks.slice(0, 5).map(b => `- ${b.tier}: $${b.sponsored_post_min}-$${b.sponsored_post_max}`).join('\n')}

TRENDING CULTURE & EVENTS:
${events.slice(0, 5).map(e => `- ${e.name}: ${e.category || ''} (${e.timing || ''})`).join('\n')}

INDUSTRY GUIDES:
${industries.slice(0, 3).map(i => `- ${i.title || i.name}: ${i.summary || ''}`).join('\n')}

Generate a comprehensive, personalized pitch deck for presenting the selected talent to ${brand.name}. The pitch should:
1. Create a compelling executive summary tailored to ${brand.name}'s industry and goals
2. Build a brand narrative that connects ${brand.name}'s values with the selected creators
3. Showcase each talent with specific match reasoning for this brand
4. Analyze the competitive landscape and position this partnership as a competitive advantage
5. Project ROI based on historical deal data, engagement rates, and market benchmarks
6. Assess risks and provide a mitigation plan from a brand safety perspective
7. Identify trend alignment opportunities with current culture events
8. Create a persuasive call to action
9. Outline 8-12 slides for a professional pitch deck presentation`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          brand_narrative: { type: 'string' },
          talent_showcase: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                talent_name: { type: 'string' },
                platform: { type: 'string' },
                match_score: { type: 'string' },
                match_reasoning: { type: 'string' },
                audience_alignment: { type: 'string' },
                content_synergy: { type: 'string' },
                recommended_deliverables: { type: 'string' },
                estimated_reach: { type: 'string' },
              }
            }
          },
          competitive_edge: {
            type: 'object',
            properties: {
              market_position: { type: 'string' },
              differentiators: { type: 'array', items: { type: 'string' } },
              competitor_gaps: { type: 'array', items: { type: 'string' } },
              strategic_advantage: { type: 'string' },
            }
          },
          roi_projections: {
            type: 'object',
            properties: {
              estimated_total_reach: { type: 'string' },
              projected_engagement: { type: 'string' },
              estimated_media_value: { type: 'string' },
              cost_per_engagement: { type: 'string' },
              expected_roi_multiplier: { type: 'string' },
              comparison_to_benchmark: { type: 'string' },
              timeline: { type: 'string' },
            }
          },
          risk_assessment: {
            type: 'object',
            properties: {
              overall_risk_level: { type: 'string' },
              risk_factors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    risk: { type: 'string' },
                    severity: { type: 'string' },
                    mitigation: { type: 'string' },
                  }
                }
              },
              brand_safety_summary: { type: 'string' },
            }
          },
          trend_alignment: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trend: { type: 'string' },
                relevance: { type: 'string' },
                activation_idea: { type: 'string' },
                timing: { type: 'string' },
              }
            }
          },
          call_to_action: { type: 'string' },
          slide_outline: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                slide_number: { type: 'number' },
                title: { type: 'string' },
                content: { type: 'string' },
                visual_suggestion: { type: 'string' },
              }
            }
          },
        }
      }
    });

    return Response.json({ success: true, pitch_deck: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
