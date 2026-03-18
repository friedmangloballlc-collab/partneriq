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
    const { user_email, user_type } = body;

    if (!user_email || !user_type) {
      return new Response(
        JSON.stringify({ error: 'user_email and user_type are required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Date windows ──────────────────────────────────────────────────────
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekEnd = now.toISOString().split('T')[0];
    const weekStart = weekAgo.toISOString().split('T')[0];

    // ── Fetch user's profile (talent or brand) ────────────────────────────
    const userProfile = user_type === 'talent'
      ? await base44.entities.Talent.filter({ email: user_email }, '-created_date', 1)
          .then((rows: any[]) => rows[0] || null)
          .catch(() => null)
      : await base44.entities.Brand.filter({ email: user_email }, '-created_date', 1)
          .then((rows: any[]) => rows[0] || null)
          .catch(() => null);

    // ── Fetch data in parallel ─────────────────────────────────────────────
    const [
      allPartnerships,
      recentOpportunities,
      cultureEvents,
      rateBenchmarks,
    ] = await Promise.all([
      // All user's partnerships
      user_type === 'talent' && userProfile?.id
        ? base44.entities.Partnership.filter({ talent_id: userProfile.id }, '-created_date', 100)
            .catch(() => [])
        : user_type === 'brand' && userProfile?.id
          ? base44.entities.Partnership.filter({ brand_id: userProfile.id }, '-created_date', 100)
              .catch(() => [])
          : base44.entities.Partnership.list('-created_date', 100).catch(() => []),

      // Fresh marketplace opportunities
      base44.entities.MarketplaceOpportunity.list('-created_date', 50).catch(() => []),

      // Culture events this week + next week
      base44.entities.CultureEvent.list('-created_date', 30).catch(() => []),

      // Rate benchmarks for market context
      base44.entities.RateBenchmark.list('-created_date', 20).catch(() => []),
    ]);

    // ── Compute deal score changes ─────────────────────────────────────────
    const thisWeekPartnerships = allPartnerships.filter((p: any) =>
      p.created_at && new Date(p.created_at) >= weekAgo
    );
    const prevWeekPartnerships = allPartnerships.filter((p: any) =>
      p.created_at && new Date(p.created_at) >= twoWeeksAgo && new Date(p.created_at) < weekAgo
    );

    const thisWeekRevenue = thisWeekPartnerships
      .filter((p: any) => p.status === 'completed')
      .reduce((s: number, p: any) => s + (p.deal_value || 0), 0);

    const prevWeekRevenue = prevWeekPartnerships
      .filter((p: any) => p.status === 'completed')
      .reduce((s: number, p: any) => s + (p.deal_value || 0), 0);

    // Deal score proxy (based on brand safety * engagement for talent)
    const currentScore = user_type === 'talent' && userProfile
      ? Math.round(
          Math.min(parseFloat(userProfile.brand_safety_score || '50'), 100) *
          Math.min(parseFloat(userProfile.engagement_rate || '2'), 100) / 10
        )
      : allPartnerships.filter((p: any) => p.status === 'completed').length * 10;

    const scoreChange = prevWeekRevenue > 0
      ? Math.round((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue * 100)
      : thisWeekRevenue > 0 ? 20 : 0;

    // ── Filter opportunities matching user's profile ────────────────────────
    const niche = (
      userProfile?.niche ||
      userProfile?.expertise_areas ||
      userProfile?.industry ||
      userProfile?.primary_niche ||
      ''
    ).toLowerCase();

    const matchingOpportunities = recentOpportunities
      .filter((opp: any) => {
        if (!niche) return true;
        const oppText = [opp.title, opp.description, opp.niche, opp.category, opp.requirements]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const nicheWords = niche.split(/[\s,]+/).filter((w: string) => w.length > 3);
        return nicheWords.some((word: string) => oppText.includes(word));
      })
      .slice(0, 5);

    // ── Filter this week's culture events ──────────────────────────────────
    const thisWeekEvents = cultureEvents.filter((evt: any) => {
      const evtDate = evt.event_date || evt.date || evt.start_date;
      if (!evtDate) return false;
      const d = new Date(evtDate);
      return d >= weekAgo && d <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }).slice(0, 5);

    // ── Active + stalled deals ─────────────────────────────────────────────
    const activeDeals = allPartnerships.filter((p: any) => p.status === 'active');
    const stalledDeals = allPartnerships.filter((p: any) => {
      if (!['negotiating', 'proposed', 'active'].includes(p.status)) return false;
      const updatedAt = p.updated_at || p.created_at;
      if (!updatedAt) return false;
      return (now.getTime() - new Date(updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;
    });

    // ── Relevant benchmark context ─────────────────────────────────────────
    const benchmarkContext = rateBenchmarks.slice(0, 5)
      .map((b: any) => `${b.category || 'General'}: $${b.min_rate || 0}–$${b.max_rate || 0}`)
      .join(', ');

    // ── Build AI prompt ────────────────────────────────────────────────────
    const prompt = `You are a strategic intelligence analyst for Deal Stage, a creator partnership platform. Generate a personalized weekly intelligence brief for this user.

USER PROFILE:
- Email: ${user_email}
- User Type: ${user_type}
- Name: ${userProfile?.full_name || userProfile?.name || userProfile?.company_name || 'Unknown'}
- Niche/Industry: ${niche || 'General'}
- Platform: ${userProfile?.primary_platform || 'N/A'}
- Followers: ${userProfile?.follower_count || 'N/A'}
- Engagement Rate: ${userProfile?.engagement_rate || 'N/A'}%
- Current Deal Score: ${currentScore}

WEEK IN REVIEW (${weekStart} to ${weekEnd}):
- New partnerships created this week: ${thisWeekPartnerships.length}
- Revenue from completed deals this week: $${thisWeekRevenue.toLocaleString()}
- Previous week revenue: $${prevWeekRevenue.toLocaleString()}
- Revenue change: ${scoreChange > 0 ? '+' : ''}${scoreChange}%
- Active deals: ${activeDeals.length}
- Stalled deals (no activity >7 days): ${stalledDeals.length}
- Total partnerships all time: ${allPartnerships.length}

TOP MARKETPLACE OPPORTUNITIES MATCHING THEIR PROFILE:
${matchingOpportunities.length > 0
  ? matchingOpportunities.map((o: any) => `- ${o.title || 'Opportunity'}: ${o.description?.slice(0, 100) || ''} (Budget: ${o.budget_range || o.budget || 'TBD'})`).join('\n')
  : '- No specific matching opportunities found this week'
}

CULTURE EVENTS THIS WEEK/NEXT:
${thisWeekEvents.length > 0
  ? thisWeekEvents.map((e: any) => `- ${e.name || e.title}: ${new Date(e.event_date || e.date || e.start_date).toLocaleDateString()} — ${e.description?.slice(0, 80) || ''}`).join('\n')
  : '- No major culture events this week'
}

MARKET BENCHMARKS:
${benchmarkContext || 'Standard industry rates'}

Generate a personalized, specific, actionable weekly brief. Be concise but valuable. Reference their actual data.

Return JSON with this exact structure:
{
  "week_label": "${weekStart} – ${weekEnd}",
  "generated_at": "${now.toISOString()}",
  "score_change": {
    "current_score": ${currentScore},
    "change_percent": ${scoreChange},
    "direction": "${scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'stable'}",
    "summary": "<one sentence explaining the score movement>"
  },
  "top_opportunities": [
    {
      "title": "<opportunity title>",
      "description": "<why this is relevant to them specifically>",
      "potential_value": "<estimated value>",
      "urgency": "high|medium|low",
      "action": "<specific next step>"
    }
  ],
  "market_trends": [
    {
      "trend": "<market trend name>",
      "impact": "<how this affects them specifically>",
      "opportunity": "<how to capitalize on it>"
    }
  ],
  "one_recommendation": {
    "title": "<short recommendation title>",
    "description": "<2-3 sentence detailed recommendation tailored to their profile and this week's data>",
    "expected_impact": "<what outcome they can expect>",
    "timeframe": "<when to act e.g. 'This week', 'Next 30 days'>"
  },
  "alerts": [
    {
      "type": "stalled_deal|opportunity|benchmark|event",
      "message": "<specific alert message>",
      "severity": "high|medium|low"
    }
  ],
  "week_summary": "<2-3 sentence executive summary of their week and what to focus on next week>"
}

Generate 2-4 top_opportunities, 2-3 market_trends, and 0-3 alerts based on actual data. Make the one_recommendation genuinely specific to their situation.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      agent_name: 'deal_patterns',
      response_json_schema: {
        type: 'object',
        properties: {
          week_label: { type: 'string' },
          generated_at: { type: 'string' },
          score_change: {
            type: 'object',
            properties: {
              current_score: { type: 'number' },
              change_percent: { type: 'number' },
              direction: { type: 'string' },
              summary: { type: 'string' },
            },
          },
          top_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                potential_value: { type: 'string' },
                urgency: { type: 'string' },
                action: { type: 'string' },
              },
            },
          },
          market_trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trend: { type: 'string' },
                impact: { type: 'string' },
                opportunity: { type: 'string' },
              },
            },
          },
          one_recommendation: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              expected_impact: { type: 'string' },
              timeframe: { type: 'string' },
            },
          },
          alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                message: { type: 'string' },
                severity: { type: 'string' },
              },
            },
          },
          week_summary: { type: 'string' },
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true, brief: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[generateWeeklyBrief] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
