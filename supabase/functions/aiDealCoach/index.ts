import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { talent_id, brand_id } = body;

    if (!talent_id && !brand_id) {
      return new Response(
        JSON.stringify({ error: 'talent_id or brand_id is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const istalent = !!talent_id;
    const entityId = talent_id || brand_id;

    // ── Fetch profile + deal history + benchmarks in parallel ────────────
    const [profile, allPartnerships, rateBenchmarks, roiBenchmarks] = await Promise.all([
      istalent
        ? base44.entities.Talent.filter({ id: entityId }, '-created_date', 1)
            .then((rows: any[]) => rows[0] || null)
            .catch(() => null)
        : base44.entities.Brand.filter({ id: entityId }, '-created_date', 1)
            .then((rows: any[]) => rows[0] || null)
            .catch(() => null),

      // All partnerships related to this entity
      istalent
        ? base44.entities.Partnership.filter({ talent_id: entityId }, '-created_date', 100)
            .catch(() => [])
        : base44.entities.Partnership.filter({ brand_id: entityId }, '-created_date', 100)
            .catch(() => []),

      // Market rate benchmarks
      base44.entities.RateBenchmark.list('-created_date', 50).catch(() => []),
      base44.entities.ROIBenchmark.list('-created_date', 50).catch(() => []),
    ]);

    // ── Compute stats from deal history ───────────────────────────────────
    const completed = allPartnerships.filter((p: any) => p.status === 'completed');
    const active = allPartnerships.filter((p: any) => p.status === 'active');
    const churned = allPartnerships.filter((p: any) => p.status === 'churned');
    const avgDealValue = completed.length > 0
      ? Math.round(completed.reduce((s: number, p: any) => s + (p.deal_value || 0), 0) / completed.length)
      : 0;

    const totalRevenue = completed.reduce((s: number, p: any) => s + (p.deal_value || 0), 0);
    const winRate = (completed.length + churned.length) > 0
      ? Math.round(completed.length / (completed.length + churned.length) * 100)
      : 0;

    // Best-performing deal types for this entity
    const typeMap: Record<string, { count: number; won: number; value: number }> = {};
    allPartnerships.forEach((p: any) => {
      const t = p.partnership_type || 'unknown';
      if (!typeMap[t]) typeMap[t] = { count: 0, won: 0, value: 0 };
      typeMap[t].count++;
      if (p.status === 'completed') { typeMap[t].won++; typeMap[t].value += p.deal_value || 0; }
    });
    const sortedTypes = Object.entries(typeMap)
      .sort(([, a], [, b]) => (b.won / (b.count || 1)) - (a.won / (a.count || 1)))
      .slice(0, 5);

    // Brands that have responded (for talent) or talent that responded (for brands)
    const respondedPartners = allPartnerships
      .filter((p: any) => p.status !== 'churned')
      .map((p: any) => istalent ? (p.brand_name || p.partner_name) : (p.talent_name || p.partner_name))
      .filter(Boolean)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
      .slice(0, 10);

    // Relevant benchmarks
    const niche = profile?.niche || profile?.expertise_areas || profile?.industry || 'general';
    const relevantBenchmarks = rateBenchmarks
      .filter((b: any) => !b.category || niche.toLowerCase().includes((b.category || '').toLowerCase()))
      .slice(0, 5);

    // ── Build AI prompt ────────────────────────────────────────────────────
    const entityType = istalent ? 'talent/creator' : 'brand';
    const profileSummary = istalent
      ? `Name: ${profile?.full_name || profile?.name || 'Unknown'}, Platform: ${profile?.primary_platform || 'N/A'}, Followers: ${profile?.follower_count || 'N/A'}, Engagement: ${profile?.engagement_rate || 'N/A'}%, Niche: ${niche}, Tier: ${profile?.tier || 'micro'}, Brand Safety Score: ${profile?.brand_safety_score ?? 'N/A'}`
      : `Company: ${profile?.name || profile?.company_name || 'Unknown'}, Industry: ${niche}, Budget: ${profile?.budget_range || 'N/A'}, Target Audience: ${profile?.target_audience || 'N/A'}`;

    const prompt = `You are an expert deal strategy coach for a creator partnership platform called Deal Stage. Analyze this ${entityType}'s profile and deal history, then provide personalized, data-driven deal strategy advice.

ENTITY TYPE: ${entityType.toUpperCase()}
PROFILE: ${profileSummary}

DEAL HISTORY SUMMARY:
- Total partnerships: ${allPartnerships.length}
- Completed (won): ${completed.length} (win rate: ${winRate}%)
- Active: ${active.length}
- Churned/Lost: ${churned.length}
- Average deal value: $${avgDealValue.toLocaleString()}
- Total revenue generated: $${totalRevenue.toLocaleString()}

TOP PERFORMING DEAL TYPES (by win rate):
${sortedTypes.map(([type, d]) => `- ${type}: ${d.count} deals, ${d.won} won (${Math.round(d.won / (d.count || 1) * 100)}% win rate), avg value $${d.count > 0 ? Math.round(d.value / d.count) : 0}`).join('\n')}

PARTNERS WHO HAVE RESPONDED POSITIVELY:
${respondedPartners.length > 0 ? respondedPartners.join(', ') : 'No data yet'}

MARKET RATE BENCHMARKS:
${relevantBenchmarks.length > 0 ? relevantBenchmarks.map((b: any) => `- ${b.category || 'General'}: $${b.min_rate || 0} - $${b.max_rate || 0}`).join('\n') : 'Standard market rates apply'}

Based on ALL of this data, provide a highly personalized, actionable deal coaching strategy.

Return JSON with this exact structure:
{
  "coaching_summary": "<2-3 sentence overview of this entity's deal position and biggest opportunity>",
  "top_3_deal_types": [
    {
      "deal_type": "<specific deal type e.g. 'Long-term Brand Ambassador'>",
      "why": "<specific reason based on their data why this type is best for them>",
      "expected_value": "<estimated value range e.g. '$2,000 - $8,000 per deal'>",
      "win_probability": "<estimated win probability e.g. '65%'>",
      "action": "<specific next step to pursue this>",
      "priority": "high|medium|low"
    }
  ],
  "brands_most_likely_to_respond": [
    {
      "brand_type": "<type of brand e.g. 'DTC fitness supplement brands'>",
      "reason": "<why they are likely to respond based on this profile>",
      "outreach_tip": "<specific tip for approaching this brand type>"
    }
  ],
  "rate_recommendations": {
    "current_average": ${avgDealValue},
    "recommended_floor": "<minimum rate to quote>",
    "recommended_target": "<ideal target rate>",
    "recommended_ceiling": "<maximum rate for premium deals>",
    "rationale": "<data-driven reason for these rates>",
    "negotiation_tip": "<one specific negotiation tactic>"
  },
  "quick_wins": [
    "<actionable thing they can do in the next 7 days to close more deals>"
  ],
  "risks_to_avoid": [
    "<specific risk or mistake to avoid based on their history>"
  ]
}

Make all advice specific and tied to their actual data. Avoid generic advice.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      agent_name: 'deal_patterns',
      response_json_schema: {
        type: 'object',
        properties: {
          coaching_summary: { type: 'string' },
          top_3_deal_types: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deal_type: { type: 'string' },
                why: { type: 'string' },
                expected_value: { type: 'string' },
                win_probability: { type: 'string' },
                action: { type: 'string' },
                priority: { type: 'string' },
              },
            },
          },
          brands_most_likely_to_respond: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                brand_type: { type: 'string' },
                reason: { type: 'string' },
                outreach_tip: { type: 'string' },
              },
            },
          },
          rate_recommendations: {
            type: 'object',
            properties: {
              current_average: { type: 'number' },
              recommended_floor: { type: 'string' },
              recommended_target: { type: 'string' },
              recommended_ceiling: { type: 'string' },
              rationale: { type: 'string' },
              negotiation_tip: { type: 'string' },
            },
          },
          quick_wins: { type: 'array', items: { type: 'string' } },
          risks_to_avoid: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true, coaching: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[aiDealCoach] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
