import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [allPartnerships, allTalents, allBrands] = await Promise.all([
      base44.entities.Partnership.list('-updated_date', 500),
      base44.entities.Talent.list('-created_date', 300),
      base44.entities.Brand.list('-created_date', 200),
    ]);

    // Define "successful" = completed OR active with high match_score or high deal_value
    const successful = allPartnerships.filter(p =>
      p.status === 'completed' ||
      (p.status === 'active' && (p.match_score >= 70 || p.deal_value > 0))
    );

    const unsuccessful = allPartnerships.filter(p =>
      p.status === 'churned' ||
      (p.status !== 'completed' && p.status !== 'active' && p.match_score > 0 && p.match_score < 50)
    );

    if (successful.length < 2) {
      return Response.json({
        error: 'Not enough successful partnerships to analyze. Need at least 2 completed or active deals.'
      }, { status: 400 });
    }

    // Build enriched deal summaries
    const enrichDeal = (deal) => {
      const talent = allTalents.find(t => t.id === deal.talent_id);
      const brand = allBrands.find(b => b.id === deal.brand_id);
      return {
        title: deal.title,
        status: deal.status,
        partnership_type: deal.partnership_type,
        deal_value: deal.deal_value,
        match_score: deal.match_score,
        priority: deal.priority,
        talent_tier: talent?.tier,
        talent_niche: talent?.niche,
        talent_platform: talent?.primary_platform,
        talent_engagement_rate: talent?.engagement_rate,
        talent_followers: talent?.total_followers,
        talent_trajectory: talent?.trajectory,
        talent_brand_safety: talent?.brand_safety_score,
        brand_industry: brand?.industry,
        brand_company_size: brand?.company_size,
        brand_annual_budget: brand?.annual_budget,
      };
    };

    const successfulEnriched = successful.map(enrichDeal);
    const unsuccessfulEnriched = unsuccessful.map(enrichDeal);

    // Compute attribute frequency distributions for successful deals
    const freq = (arr, key) => {
      const counts = {};
      arr.forEach(d => { if (d[key]) counts[d[key]] = (counts[d[key]] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    };

    const stats = {
      total_successful: successful.length,
      total_unsuccessful: unsuccessful.length,
      avg_deal_value: Math.round(successful.reduce((s, d) => s + (d.deal_value || 0), 0) / successful.length),
      avg_match_score: Math.round(successful.reduce((s, d) => s + (d.match_score || 0), 0) / successful.length),
      partnership_type_dist: freq(successfulEnriched, 'partnership_type').slice(0, 5),
      talent_tier_dist: freq(successfulEnriched, 'talent_tier').slice(0, 5),
      talent_niche_dist: freq(successfulEnriched, 'talent_niche').slice(0, 5),
      talent_platform_dist: freq(successfulEnriched, 'talent_platform').slice(0, 5),
      brand_industry_dist: freq(successfulEnriched, 'brand_industry').slice(0, 5),
      brand_size_dist: freq(successfulEnriched, 'brand_company_size').slice(0, 4),
      trajectory_dist: freq(successfulEnriched, 'talent_trajectory').slice(0, 4),
    };

    const prompt = `You are a senior data analyst specializing in influencer marketing partnerships. 
Analyze the following dataset of successful vs unsuccessful partnerships to identify the key success factors.

**Dataset Summary:**
- Successful partnerships analyzed: ${stats.total_successful}
- Unsuccessful/churned partnerships: ${stats.total_unsuccessful}
- Average deal value (successful): $${stats.avg_deal_value?.toLocaleString()}
- Average match score (successful): ${stats.avg_match_score}/100

**Attribute Frequency in Successful Deals:**

Partnership Types: ${stats.partnership_type_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Talent Tiers: ${stats.talent_tier_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Talent Niches: ${stats.talent_niche_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Platforms: ${stats.talent_platform_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Brand Industries: ${stats.brand_industry_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Brand Sizes: ${stats.brand_size_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Talent Trajectories: ${stats.trajectory_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}

**Sample Successful Deals (up to 10):**
${successfulEnriched.slice(0, 10).map(d => `- ${d.title}: ${d.partnership_type}, ${d.talent_tier} ${d.talent_niche} on ${d.talent_platform}, match=${d.match_score}, value=$${d.deal_value || 0}, brand=${d.brand_industry}`).join('\n')}

${unsuccessfulEnriched.length > 0 ? `**Sample Unsuccessful/Churned Deals (up to 5):**
${unsuccessfulEnriched.slice(0, 5).map(d => `- ${d.title}: ${d.partnership_type}, ${d.talent_tier} ${d.talent_niche}, match=${d.match_score}, value=$${d.deal_value || 0}`).join('\n')}` : ''}

Analyze the patterns and identify what makes partnerships succeed on this platform. Be specific and data-driven.

Return a JSON object:
{
  "headline_insight": <one punchy sentence summarizing the single biggest success driver>,
  "success_factors": [
    {
      "factor": <attribute name, e.g. "Partnership Type", "Talent Tier">,
      "winning_value": <the top-performing value, e.g. "sponsorship", "micro">,
      "confidence": <"high"|"medium"|"low">,
      "impact": <"critical"|"high"|"medium"|"low">,
      "explanation": <one sentence on why this attribute matters>,
      "recommendation": <one specific action the user should take based on this>
    }
  ],
  "winning_profile": {
    "partnership_type": <best type>,
    "talent_tier": <best tier>,
    "talent_niche": <best niche>,
    "platform": <best platform>,
    "brand_industry": <best industry>,
    "min_match_score": <minimum recommended match score as integer>,
    "summary": <2 sentences describing the ideal deal profile for replication>
  },
  "red_flags": [<array of 2-3 specific patterns or attributes correlated with failure or churn>],
  "replication_playbook": [<array of 3-4 ordered, actionable steps to replicate successful deals>],
  "data_quality_note": <one sentence on data completeness or any caveats>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          headline_insight: { type: 'string' },
          success_factors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                factor: { type: 'string' },
                winning_value: { type: 'string' },
                confidence: { type: 'string' },
                impact: { type: 'string' },
                explanation: { type: 'string' },
                recommendation: { type: 'string' },
              }
            }
          },
          winning_profile: {
            type: 'object',
            properties: {
              partnership_type: { type: 'string' },
              talent_tier: { type: 'string' },
              talent_niche: { type: 'string' },
              platform: { type: 'string' },
              brand_industry: { type: 'string' },
              min_match_score: { type: 'number' },
              summary: { type: 'string' },
            }
          },
          red_flags: { type: 'array', items: { type: 'string' } },
          replication_playbook: { type: 'array', items: { type: 'string' } },
          data_quality_note: { type: 'string' },
        }
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      stats: {
        total_successful: stats.total_successful,
        total_unsuccessful: stats.total_unsuccessful,
        avg_deal_value: stats.avg_deal_value,
        avg_match_score: stats.avg_match_score,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});