import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [talents, partnerships, demographics] = await Promise.all([
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.DemographicSegment.list('-created_date', 100),
    ]);

    if (talents.length < 2) {
      return Response.json({ error: 'Need at least 2 talent profiles to analyze audience overlap.' }, { status: 400 });
    }

    const activeTalent = talents.filter(t => partnerships.some(p => p.talent_name === t.name && ['active', 'contracted'].includes(p.status)));
    const talentProfiles = talents.slice(0, 20).map(t => ({
      name: t.name, platform: t.platform, niche: t.niche, tier: t.tier,
      followers: t.followers, engagement_rate: t.engagement_rate,
    }));

    const prompt = `You are an Audience Overlap & Cannibalization AI Agent.

TALENT POOL (${talents.length} total, showing top 20):
${talentProfiles.map(t => `- ${t.name}: ${t.platform}/${t.niche}, ${t.tier} tier, ${t.followers?.toLocaleString()} followers, ${t.engagement_rate}% ER`).join('\n')}

ACTIVE PARTNERSHIPS: ${activeTalent.length} creators currently in active deals
DEMOGRAPHIC SEGMENTS: ${demographics.length} segments tracked

Analyze audience overlap between creators and provide:
1. Overlap clusters (groups of creators with highly similar audiences)
2. Cannibalization risk assessment (where brands are paying for the same eyeballs)
3. Optimal portfolio composition for maximum unique reach
4. Recommended creator swaps to reduce overlap
5. Reach efficiency scores for different creator combinations
6. Budget optimization recommendations based on audience redundancy`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          overlap_clusters: {
            type: 'array',
            items: { type: 'object', properties: { cluster_name: { type: 'string' }, creators: { type: 'string' }, overlap_percentage: { type: 'string' }, shared_audience_traits: { type: 'string' }, recommendation: { type: 'string' } } }
          },
          cannibalization_risks: {
            type: 'array',
            items: { type: 'object', properties: { risk: { type: 'string' }, affected_creators: { type: 'string' }, wasted_spend_estimate: { type: 'string' }, severity: { type: 'string' }, fix: { type: 'string' } } }
          },
          optimal_portfolio: {
            type: 'object',
            properties: {
              recommended_mix: { type: 'string' },
              estimated_unique_reach: { type: 'string' },
              diversity_score: { type: 'string' },
              rationale: { type: 'string' }
            }
          },
          creator_swaps: {
            type: 'array',
            items: { type: 'object', properties: { replace: { type: 'string' }, with: { type: 'string' }, reason: { type: 'string' }, reach_improvement: { type: 'string' } } }
          },
          budget_optimization: {
            type: 'object',
            properties: {
              current_efficiency: { type: 'string' },
              optimized_efficiency: { type: 'string' },
              potential_savings: { type: 'string' },
              key_changes: { type: 'array', items: { type: 'string' } }
            }
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
