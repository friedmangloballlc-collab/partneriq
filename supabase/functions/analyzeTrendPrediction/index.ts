import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const [talents, partnerships, events, conferences, industries] = await Promise.all([
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Partnership.list('-created_date', 200),
      base44.entities.CultureEvent.list('-created_date', 100),
      base44.entities.Conference.list('-created_date', 50),
      base44.entities.IndustryGuide.list('-created_date', 50),
    ]);

    const nicheGrowth = {};
    talents.forEach(t => { if (t.niche) nicheGrowth[t.niche] = (nicheGrowth[t.niche] || 0) + 1; });
    const platformTrends = {};
    talents.forEach(t => { if (t.platform) platformTrends[t.platform] = (platformTrends[t.platform] || 0) + 1; });
    const upcomingEvents = events.slice(0, 10);
    const upcomingConferences = conferences.slice(0, 10);

    const prompt = `You are a Trend Prediction & Newsjacking AI Agent for influencer marketing.

PLATFORM DATA:
- Total creators tracked: ${talents.length}
- Active partnerships: ${partnerships.filter(p => ['active', 'contracted'].includes(p.status)).length}
- Niche distribution: ${JSON.stringify(nicheGrowth)}
- Platform distribution: ${JSON.stringify(platformTrends)}

UPCOMING EVENTS:
${upcomingEvents.map(e => `- ${e.name}: ${e.date} (${e.type || 'cultural'}, ${e.region || 'global'})`).join('\n') || 'None tracked'}

UPCOMING CONFERENCES:
${upcomingConferences.map(c => `- ${c.name}: ${c.date} (${c.industry || 'general'})`).join('\n') || 'None tracked'}

INDUSTRY GUIDES: ${industries.length} guides available

Predict upcoming trends and newsjacking opportunities:
1. Emerging content trends by platform and niche
2. Viral potential signals (topics about to break)
3. Newsjacking opportunities aligned with upcoming events
4. Seasonal partnership opportunities
5. Rising niche categories and creator archetypes
6. Platform algorithm shifts and their impact
7. Actionable activation windows (next 30/60/90 days)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          emerging_trends: {
            type: 'array',
            items: { type: 'object', properties: { trend: { type: 'string' }, platform: { type: 'string' }, confidence: { type: 'string' }, peak_window: { type: 'string' }, recommended_action: { type: 'string' } } }
          },
          viral_signals: {
            type: 'array',
            items: { type: 'object', properties: { topic: { type: 'string' }, momentum_score: { type: 'string' }, time_to_peak: { type: 'string' }, activation_strategy: { type: 'string' } } }
          },
          newsjacking_opportunities: {
            type: 'array',
            items: { type: 'object', properties: { event: { type: 'string' }, window: { type: 'string' }, activation_idea: { type: 'string' }, ideal_creator_type: { type: 'string' }, expected_impact: { type: 'string' } } }
          },
          seasonal_opportunities: {
            type: 'array',
            items: { type: 'object', properties: { season: { type: 'string' }, opportunity: { type: 'string' }, best_niches: { type: 'string' }, preparation_timeline: { type: 'string' } } }
          },
          rising_categories: {
            type: 'array',
            items: { type: 'object', properties: { category: { type: 'string' }, growth_rate: { type: 'string' }, saturation_level: { type: 'string' }, recommendation: { type: 'string' } } }
          },
          activation_calendar: {
            type: 'array',
            items: { type: 'object', properties: { timeframe: { type: 'string' }, action: { type: 'string' }, priority: { type: 'string' }, expected_roi: { type: 'string' } } }
          },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return new Response(JSON.stringify({ success: true, analysis: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
