import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { agent_name, filters } = await req.json();

    if (!agent_name) {
      return new Response(JSON.stringify({ error: 'agent_name is required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch all talents (up to 500) then filter client-side for flexible filtering
    const allTalents = await base44.entities.Talent.list('-created_date', 500);

    // Apply filters
    const filtered = allTalents.filter(t => {
      if (filters?.niche?.length && !filters.niche.includes(t.niche)) return false;
      if (filters?.platform?.length && !filters.platform.includes(t.platform)) return false;
      if (filters?.tier?.length && !filters.tier.includes(t.tier)) return false;
      if (filters?.status?.length && !filters.status.includes(t.status)) return false;
      if (filters?.min_followers && (t.followers || 0) < filters.min_followers) return false;
      if (filters?.max_followers && (t.followers || 0) > filters.max_followers) return false;
      return true;
    });

    if (filtered.length === 0) {
      return new Response(JSON.stringify({ error: 'No talents matched the given filters.' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch supporting data for richer agent context
    const [partnerships, benchmarks] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.RateBenchmark.list('-created_date', 50),
    ]);

    // Build deals-by-talent lookup
    const dealsByTalent = {};
    partnerships.forEach(p => {
      if (p.talent_name) dealsByTalent[p.talent_name] = (dealsByTalent[p.talent_name] || 0) + 1;
    });

    // Build talent summaries for the LLM
    const talentSummaries = filtered.map(t => ({
      name: t.name,
      platform: t.platform,
      niche: t.niche,
      tier: t.tier,
      status: t.status,
      followers: t.followers,
      engagement_rate: t.engagement_rate,
      deals: dealsByTalent[t.name] || 0,
      alpha_score: t.discovery_alpha_score || null,
    }));

    // Build filter description for prompt context
    const filterDesc = [];
    if (filters?.niche?.length) filterDesc.push(`Niches: ${filters.niche.join(', ')}`);
    if (filters?.platform?.length) filterDesc.push(`Platforms: ${filters.platform.join(', ')}`);
    if (filters?.tier?.length) filterDesc.push(`Tiers: ${filters.tier.join(', ')}`);
    if (filters?.status?.length) filterDesc.push(`Status: ${filters.status.join(', ')}`);
    if (filters?.min_followers) filterDesc.push(`Min followers: ${filters.min_followers.toLocaleString()}`);
    if (filters?.max_followers) filterDesc.push(`Max followers: ${filters.max_followers.toLocaleString()}`);

    const prompt = `You are a Bulk Agent Operations AI for a talent management agency. You have been asked to run the "${agent_name}" analysis across a filtered subset of the talent roster.

AGENT: ${agent_name}
FILTER CRITERIA: ${filterDesc.length > 0 ? filterDesc.join(' | ') : 'No filters (all talents)'}
ENTITIES MATCHED: ${filtered.length} out of ${allTalents.length} total talents

TALENT DATA (${filtered.length} entities):
${talentSummaries.map(t => `- ${t.name}: ${t.platform}/${t.niche}, ${t.tier}, ${(t.followers || 0).toLocaleString()} followers, ER=${t.engagement_rate || 'N/A'}%, Deals=${t.deals}, Alpha=${t.alpha_score || 'N/A'}, Status=${t.status || 'unknown'}`).join('\n')}

PARTNERSHIP CONTEXT:
- Total deals across all talent: ${partnerships.length}
- Active deals: ${partnerships.filter(p => ['active', 'contracted'].includes(p.status)).length}
- Completed: ${partnerships.filter(p => p.status === 'completed').length}

BENCHMARK DATA AVAILABLE: ${benchmarks.length} rate benchmarks

Perform a comprehensive bulk "${agent_name}" analysis across ALL ${filtered.length} matched entities. For each talent, provide an individual assessment. Then synthesize aggregate insights, identify patterns, and provide batch-level recommendations.

Focus areas based on agent type:
- Contract Intelligence: contract risks, rate fairness, clause concerns
- Competitor Intelligence: competitive positioning, market share threats
- Audience Overlap: cross-talent audience duplication, reach efficiency
- Relationship Health: partnership health scores, churn risk
- Creative Direction: content performance, creative opportunities
- Negotiation Coach: deal leverage, rate optimization
- Trend Prediction: emerging trends, timing opportunities
- Brand Safety: risk flags, safety scores
- Cross-Platform Attribution: multi-platform performance
- Roster Optimization: portfolio balance, gaps
- Invoice Reconciliation: payment status, discrepancies
- Compliance & Disclosure: regulatory risks, FTC compliance
- Content Effectiveness: content performance metrics, optimization
- Campaign Post-Mortem: campaign results, learnings
- Deal Patterns: deal trends, pricing patterns

Provide results for EVERY matched entity individually plus aggregate analysis.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          agent_ran: { type: 'string' },
          filter_criteria: { type: 'string' },
          entities_matched: { type: 'number' },
          entities_processed: { type: 'number' },
          aggregate_summary: { type: 'string' },
          individual_results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entity_name: { type: 'string' },
                score: { type: 'number' },
                key_finding: { type: 'string' },
                action_needed: { type: 'string' },
              },
            },
          },
          patterns_found: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pattern: { type: 'string' },
                frequency: { type: 'string' },
                significance: { type: 'string' },
              },
            },
          },
          batch_recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
          processing_stats: {
            type: 'object',
            properties: {
              total_time_estimate: { type: 'string' },
              success_rate: { type: 'string' },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify({ success: true, bulk_results: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
