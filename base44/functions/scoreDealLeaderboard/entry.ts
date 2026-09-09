import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [partnerships, talents, brands, rateBenchmarks, roiBenchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.Talent.list('-created_date', 500),
      base44.entities.Brand.list('-created_date', 500),
      base44.entities.RateBenchmark.list('-created_date', 100),
      base44.entities.ROIBenchmark.list('-created_date', 100),
    ]);

    // Filter to active / negotiating deals only
    const activeDeals = partnerships.filter(
      p => ['active', 'negotiating', 'contracted'].includes(p.status)
    );

    if (activeDeals.length === 0) {
      return Response.json({ error: 'No active or negotiating deals found to score.' }, { status: 400 });
    }

    // Build lookup maps
    const talentMap: Record<string, any> = {};
    talents.forEach(t => { talentMap[t.id] = t; });

    const brandMap: Record<string, any> = {};
    brands.forEach(b => { brandMap[b.id] = b; });

    // Compute aggregate stats for context
    const totalPipelineValue = activeDeals.reduce((s, p) => s + (p.deal_value || 0), 0);
    const avgMatchScore = activeDeals.filter(p => p.match_score > 0).length > 0
      ? Math.round(
          activeDeals.filter(p => p.match_score > 0).reduce((s, p) => s + (p.match_score || 0), 0) /
          activeDeals.filter(p => p.match_score > 0).length
        )
      : 0;
    const avgDealValue = activeDeals.length > 0
      ? Math.round(totalPipelineValue / activeDeals.length)
      : 0;

    // Rate benchmark context
    const benchmarkSummary = rateBenchmarks.slice(0, 10).map(rb =>
      `${rb.platform || 'unknown'} / ${rb.tier || 'unknown'}: $${rb.rate_min || 0}–$${rb.rate_max || 0}`
    ).join('; ');

    // ROI benchmark context
    const roiSummary = roiBenchmarks.slice(0, 10).map(rb =>
      `${rb.category || rb.partnership_type || 'unknown'}: ${rb.avg_roi || rb.roi_multiplier || 'N/A'}x ROI`
    ).join('; ');

    // Deal summaries for LLM
    const dealSummaries = activeDeals.slice(0, 40).map((d, idx) => {
      const talent = talentMap[d.talent_id] || {};
      const brand = brandMap[d.brand_id] || {};
      return `${idx + 1}. "${d.title || 'Untitled'}" — ${d.talent_name || talent.name || 'Unknown Talent'} × ${d.brand_name || brand.name || 'Unknown Brand'} | Status: ${d.status} | Value: $${d.deal_value || 0} | Match: ${d.match_score || 'N/A'} | Type: ${d.partnership_type || 'unknown'} | Priority: ${d.priority || 'unknown'} | Created: ${d.created_date || 'unknown'}`;
    }).join('\n');

    const prompt = `You are an expert deal scoring AI for an influencer partnership platform. Score and rank all the following active/negotiating deals on a comprehensive composite score (0–100).

**SCORING CRITERIA (weight each appropriately):**
1. Match Score — existing algorithm match between talent and brand (higher = better)
2. Predicted ROI — estimated return on investment based on deal value, talent reach, and benchmarks
3. Brand Safety Risk — risk of controversy, audience mismatch, or reputational harm (lower risk = higher score)
4. Market Timing — how well the deal aligns with current market trends and seasonality
5. Competitive Positioning — uniqueness of the partnership vs. market saturation
6. Relationship Health — inferred from deal status, age, and progression signals

**PIPELINE CONTEXT:**
- Total active deals: ${activeDeals.length}
- Total pipeline value: $${totalPipelineValue.toLocaleString()}
- Average match score: ${avgMatchScore}
- Average deal value: $${avgDealValue.toLocaleString()}

**RATE BENCHMARKS:**
${benchmarkSummary || 'No benchmark data available'}

**ROI BENCHMARKS:**
${roiSummary || 'No ROI benchmark data available'}

**ACTIVE DEALS TO SCORE:**
${dealSummaries}

Score every deal and return a ranked leaderboard. Be specific with recommendations and data-driven with scoring.

Return JSON:
{
  "leaderboard": [
    {
      "rank": 1,
      "partnership_title": "<deal title>",
      "talent_name": "<talent>",
      "brand_name": "<brand>",
      "composite_score": <0-100>,
      "predicted_roi": "<e.g. 3.2x>",
      "risk_level": "<low|medium|high>",
      "timing_score": <0-100>,
      "recommendation": "<1-2 sentence specific action>",
      "urgency": "<act_now|this_week|this_month|monitor>"
    }
  ],
  "insights": ["<key insight 1>", "<key insight 2>", "<key insight 3>"],
  "distribution": {
    "high_priority": <count of deals scoring 70+>,
    "medium_priority": <count of deals scoring 40-69>,
    "low_priority": <count of deals scoring below 40>
  },
  "total_pipeline_value": <number>,
  "top_opportunity": "<1-2 sentence description of the single best opportunity and why>",
  "biggest_risk": "<1-2 sentence description of the single biggest risk in the pipeline>"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          leaderboard: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'number' },
                partnership_title: { type: 'string' },
                talent_name: { type: 'string' },
                brand_name: { type: 'string' },
                composite_score: { type: 'number' },
                predicted_roi: { type: 'string' },
                risk_level: { type: 'string' },
                timing_score: { type: 'number' },
                recommendation: { type: 'string' },
                urgency: { type: 'string' },
              },
            },
          },
          insights: { type: 'array', items: { type: 'string' } },
          distribution: {
            type: 'object',
            properties: {
              high_priority: { type: 'number' },
              medium_priority: { type: 'number' },
              low_priority: { type: 'number' },
            },
          },
          total_pipeline_value: { type: 'number' },
          top_opportunity: { type: 'string' },
          biggest_risk: { type: 'string' },
        },
      },
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
