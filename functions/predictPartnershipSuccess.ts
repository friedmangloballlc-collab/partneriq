import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { partnership_id } = await req.json();
    if (!partnership_id) return Response.json({ error: 'partnership_id required' }, { status: 400 });

    // Fetch the target partnership
    const partnerships = await base44.entities.Partnership.list('-created_date', 200);
    const partnership = partnerships.find(p => p.id === partnership_id);
    if (!partnership) return Response.json({ error: 'Partnership not found' }, { status: 404 });

    // Fetch historical data for context
    const completedDeals = partnerships.filter(p => p.status === 'completed');
    const churnedDeals = partnerships.filter(p => p.status === 'churned');
    const allWithScores = partnerships.filter(p => p.match_score);

    // Calculate historical success rates by type
    const byType = {};
    for (const p of partnerships) {
      if (!p.partnership_type) continue;
      if (!byType[p.partnership_type]) byType[p.partnership_type] = { total: 0, completed: 0, churned: 0 };
      byType[p.partnership_type].total++;
      if (p.status === 'completed') byType[p.partnership_type].completed++;
      if (p.status === 'churned') byType[p.partnership_type].churned++;
    }

    // Fetch talent data if linked
    let talent = null;
    if (partnership.talent_id) {
      const talents = await base44.entities.Talent.list('-created_date', 200);
      talent = talents.find(t => t.id === partnership.talent_id);
    }

    const avgMatchScore = allWithScores.length
      ? (allWithScores.reduce((s, p) => s + p.match_score, 0) / allWithScores.length).toFixed(1)
      : 'N/A';

    const typeStats = byType[partnership.partnership_type] || { total: 0, completed: 0, churned: 0 };
    const typeSuccessRate = typeStats.total > 0
      ? ((typeStats.completed / typeStats.total) * 100).toFixed(0)
      : 'N/A';

    const prompt = `You are a partnership success prediction AI for an influencer marketing platform. 

Analyze the following partnership and predict its likelihood of success (reaching "completed" status without churning).

**Partnership Details:**
- Title: ${partnership.title}
- Type: ${partnership.partnership_type || 'Unknown'}
- Status: ${partnership.status}
- Match Score: ${partnership.match_score || 'Not scored'}
- Deal Value: ${partnership.deal_value ? '$' + partnership.deal_value.toLocaleString() : 'Not set'}
- Priority: ${partnership.priority || 'p2'}
- Brand: ${partnership.brand_name || 'Unknown'}
- Talent: ${partnership.talent_name || 'Unknown'}
- Match Reasoning: ${partnership.match_reasoning || 'None provided'}

**Talent Profile (if linked):**
${talent ? `
- Followers: ${talent.total_followers?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${talent.engagement_rate || 'Unknown'}%
- Tier: ${talent.tier || 'Unknown'}
- Trajectory: ${talent.trajectory || 'Unknown'}
- Brand Safety Score: ${talent.brand_safety_score || 'Unknown'}/100
- Discovery Alpha Score: ${talent.discovery_alpha_score || 'Unknown'}
- Availability: ${talent.availability_status || 'Unknown'}
- Niche: ${talent.niche || 'Unknown'}
` : 'No talent profile linked'}

**Platform Historical Context:**
- Total partnerships: ${partnerships.length}
- Completed deals: ${completedDeals.length}
- Churned deals: ${churnedDeals.length}
- Overall success rate: ${partnerships.length > 0 ? ((completedDeals.length / partnerships.length) * 100).toFixed(0) : 0}%
- Average match score across all deals: ${avgMatchScore}
- Historical success rate for ${partnership.partnership_type || 'this type'}: ${typeSuccessRate}% (${typeStats.total} deals)

Based on all of this data, provide a thorough prediction analysis. Be specific and data-driven.

Return a JSON object with these exact fields:
{
  "success_probability": <integer 0-100>,
  "confidence": <"low"|"medium"|"high">,
  "verdict": <"strong_bet"|"promising"|"risky"|"avoid">,
  "verdict_label": <short human-readable label, e.g. "Strong Bet", "Risky Move">,
  "headline": <one punchy sentence summarizing the prediction>,
  "key_strengths": [<array of 2-3 specific positive factors>],
  "risk_factors": [<array of 2-3 specific concerns>],
  "recommended_actions": [<array of 2-3 concrete next steps to improve odds>],
  "comparable_deal_insight": <one sentence comparing to historical patterns in the platform>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          success_probability: { type: 'number' },
          confidence: { type: 'string' },
          verdict: { type: 'string' },
          verdict_label: { type: 'string' },
          headline: { type: 'string' },
          key_strengths: { type: 'array', items: { type: 'string' } },
          risk_factors: { type: 'array', items: { type: 'string' } },
          recommended_actions: { type: 'array', items: { type: 'string' } },
          comparable_deal_insight: { type: 'string' },
        },
      },
    });

    return Response.json({ success: true, prediction: result, partnership_title: partnership.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});