import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { talent_id } = await req.json();
    if (!talent_id) return new Response(JSON.stringify({ error: 'talent_id required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Fetch talent
    const talents = await base44.entities.Talent.list('-created_date', 200);
    const talent = talents.find(t => t.id === talent_id);
    if (!talent) return new Response(JSON.stringify({ error: 'Talent not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Partnership history for this talent
    const allPartnerships = await base44.entities.Partnership.list('-created_date', 500);
    const talentPartnerships = allPartnerships.filter(p => p.talent_id === talent_id);

    // Platform benchmarks — same niche/tier cohort
    const cohort = talents.filter(t =>
      t.id !== talent_id &&
      (t.niche === talent.niche || t.tier === talent.tier) &&
      t.total_followers > 0
    );
    const cohortAvgEngagement = cohort.length
      ? (cohort.reduce((s, t) => s + (t.engagement_rate || 0), 0) / cohort.length).toFixed(2)
      : null;
    const cohortAvgFollowers = cohort.length
      ? Math.round(cohort.reduce((s, t) => s + (t.total_followers || 0), 0) / cohort.length)
      : null;
    const cohortAvgAlpha = cohort.length
      ? (cohort.reduce((s, t) => s + (t.discovery_alpha_score || 0), 0) / cohort.length).toFixed(1)
      : null;

    // Partnership outcome summary
    const completedDeals = talentPartnerships.filter(p => p.status === 'completed');
    const activeDeals = talentPartnerships.filter(p => p.status === 'active');
    const totalDealValue = talentPartnerships.reduce((s, p) => s + (p.deal_value || 0), 0);
    const avgMatchScore = talentPartnerships.length
      ? (talentPartnerships.reduce((s, p) => s + (p.match_score || 0), 0) / talentPartnerships.length).toFixed(1)
      : null;

    const prompt = `You are a top talent valuation expert for an influencer marketing intelligence platform. 
Analyze the following talent profile and predict their future value trajectory, market rate potential, and discovery alpha opportunity for brands.

**Talent Profile:**
- Name: ${talent.name}
- Platform: ${talent.primary_platform}
- Niche: ${talent.niche}
- Tier: ${talent.tier}
- Total Followers: ${talent.total_followers?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${talent.engagement_rate || 'Unknown'}%
- Audience Quality Score: ${talent.audience_quality_score || 'Unknown'}/100
- Brand Safety Score: ${talent.brand_safety_score || 'Unknown'}/100
- Current Trajectory: ${talent.trajectory || 'Unknown'}
- Current Discovery Alpha Score: ${talent.discovery_alpha_score || 'Unknown'}/100 (higher = more undervalued)
- Location: ${talent.location || 'Unknown'}
- Current Rate per Post: $${talent.rate_per_post?.toLocaleString() || 'Unknown'}
- Availability: ${talent.availability_status || 'Unknown'}
- Languages: ${talent.languages || 'Unknown'}
- Avg Likes: ${talent.avg_likes?.toLocaleString() || 'Unknown'}
- Avg Comments: ${talent.avg_comments?.toLocaleString() || 'Unknown'}
- Avg Views: ${talent.avg_views?.toLocaleString() || 'Unknown'}
- Preferred collaboration types: ${talent.preferred_collaboration_types || 'Unknown'}
- Expertise areas: ${talent.expertise_areas || 'Unknown'}
- Bio: ${talent.bio || 'Not provided'}

**Partnership History (${talentPartnerships.length} total deals):**
- Completed deals: ${completedDeals.length}
- Active deals: ${activeDeals.length}
- Total deal value: $${totalDealValue.toLocaleString()}
- Average match score: ${avgMatchScore || 'N/A'}
- Deal types: ${[...new Set(talentPartnerships.map(p => p.partnership_type).filter(Boolean))].join(', ') || 'None recorded'}
- Recent partners: ${talentPartnerships.slice(0, 5).map(p => p.brand_name || 'Unknown').join(', ') || 'None'}

**Niche/Tier Cohort Benchmarks (${cohort.length} similar talents):**
- Cohort avg engagement rate: ${cohortAvgEngagement ? cohortAvgEngagement + '%' : 'N/A'}
- Cohort avg followers: ${cohortAvgFollowers ? cohortAvgFollowers.toLocaleString() : 'N/A'}
- Cohort avg alpha score: ${cohortAvgAlpha || 'N/A'}

Based on all this data, produce a comprehensive talent value trajectory prediction. Be specific, data-driven, and actionable for brands evaluating whether to partner NOW vs later.

Return a JSON object with these exact fields:
{
  "trajectory_prediction": <"breakout"|"rising_star"|"steady_growth"|"plateau"|"declining">,
  "trajectory_label": <short human-readable label>,
  "trajectory_reasoning": <2-sentence explanation of why this trajectory was assigned>,
  "discovery_alpha_score": <integer 0-100, how undervalued this talent is right now — higher = more opportunity>,
  "alpha_reasoning": <one sentence explaining the alpha score>,
  "current_market_value": <estimated USD rate per sponsored post, integer>,
  "predicted_market_value_6m": <predicted rate per post in 6 months, integer>,
  "predicted_market_value_12m": <predicted rate per post in 12 months, integer>,
  "value_upside_pct": <integer, percentage upside from current to 12m prediction>,
  "follower_growth_projection": <"rapid"|"moderate"|"flat"|"declining">,
  "predicted_followers_6m": <integer>,
  "predicted_followers_12m": <integer>,
  "engagement_outlook": <"improving"|"stable"|"at_risk">,
  "brand_fit_niches": [<array of 3-4 brand industry niches that would benefit most from partnering NOW>],
  "partnership_type_recommendations": [<array of 2-3 best partnership types for this talent right now>],
  "ideal_deal_structure": <one sentence on optimal deal terms, exclusivity, duration>,
  "urgency": <"act_now"|"watch"|"low_priority">,
  "urgency_label": <short human-readable urgency string>,
  "urgency_reasoning": <one sentence on why brands should/shouldn't act now>,
  "risk_factors": [<array of 2-3 specific risks to monitor>],
  "growth_catalysts": [<array of 2-3 specific events or factors that could accelerate growth>],
  "competitive_context": <one sentence comparing to cohort benchmarks>,
  "headline": <one bold, specific insight summarizing this talent's value opportunity>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          trajectory_prediction: { type: 'string' },
          trajectory_label: { type: 'string' },
          trajectory_reasoning: { type: 'string' },
          discovery_alpha_score: { type: 'number' },
          alpha_reasoning: { type: 'string' },
          current_market_value: { type: 'number' },
          predicted_market_value_6m: { type: 'number' },
          predicted_market_value_12m: { type: 'number' },
          value_upside_pct: { type: 'number' },
          follower_growth_projection: { type: 'string' },
          predicted_followers_6m: { type: 'number' },
          predicted_followers_12m: { type: 'number' },
          engagement_outlook: { type: 'string' },
          brand_fit_niches: { type: 'array', items: { type: 'string' } },
          partnership_type_recommendations: { type: 'array', items: { type: 'string' } },
          ideal_deal_structure: { type: 'string' },
          urgency: { type: 'string' },
          urgency_label: { type: 'string' },
          urgency_reasoning: { type: 'string' },
          risk_factors: { type: 'array', items: { type: 'string' } },
          growth_catalysts: { type: 'array', items: { type: 'string' } },
          competitive_context: { type: 'string' },
          headline: { type: 'string' },
        }
      }
    });

    return new Response(JSON.stringify({ success: true, prediction: result, talent_name: talent.name }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});