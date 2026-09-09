import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { partnership_id } = await req.json();
    if (!partnership_id) return Response.json({ error: 'partnership_id required' }, { status: 400 });

    // Fetch the partnership
    const partnerships = await base44.entities.Partnership.list('-created_date', 500);
    const deal = partnerships.find(p => p.id === partnership_id);
    if (!deal) return Response.json({ error: 'Partnership not found' }, { status: 404 });

    // Parallel data fetches
    const [talents, brands, dealNotes, activities, allMetrics] = await Promise.all([
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Brand.list('-created_date', 200),
      base44.entities.DealNote.filter({ partnership_id }),
      base44.entities.Activity.filter({ resource_id: partnership_id }),
      base44.entities.OutreachMetrics.list('-created_date', 200),
    ]);

    const talent = talents.find(t => t.id === deal.talent_id);
    const brand = brands.find(b => b.id === deal.brand_id);

    // Find outreach metrics linked to this campaign (by campaign_id or by context)
    const campaignMetrics = allMetrics.filter(m => m.campaign_id === partnership_id);

    // Aggregate outreach metrics
    const totalSent = campaignMetrics.reduce((s, m) => s + (m.total_sent || 0), 0);
    const totalOpened = campaignMetrics.reduce((s, m) => s + (m.opened || 0), 0);
    const totalReplied = campaignMetrics.reduce((s, m) => s + (m.replied || 0), 0);
    const avgOpenRate = campaignMetrics.length ? campaignMetrics.reduce((s, m) => s + (m.open_rate || 0), 0) / campaignMetrics.length : null;
    const avgReplyRate = campaignMetrics.length ? campaignMetrics.reduce((s, m) => s + (m.reply_rate || 0), 0) / campaignMetrics.length : null;
    const avgConversionRate = campaignMetrics.length ? campaignMetrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) / campaignMetrics.length : null;

    const prompt = `You are a senior partnership campaign analyst. Generate a thorough post-campaign analysis for the following completed partnership deal.

**Partnership Details:**
- Title: ${deal.title}
- Type: ${deal.partnership_type || 'Unknown'}
- Status: ${deal.status}
- Deal Value: ${deal.deal_value ? '$' + deal.deal_value.toLocaleString() : 'Not recorded'}
- Match Score: ${deal.match_score || 'N/A'}/100
- Priority: ${deal.priority || 'N/A'}
- Start Date: ${deal.start_date || 'N/A'}
- End Date: ${deal.end_date || 'N/A'}
- Notes: ${deal.notes || 'None'}

**Talent:**
${talent ? `
- Name: ${talent.name}
- Tier: ${talent.tier}
- Platform: ${talent.primary_platform}
- Niche: ${talent.niche}
- Followers: ${talent.total_followers?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${talent.engagement_rate || 'Unknown'}%
- Trajectory: ${talent.trajectory || 'Unknown'}
` : 'No linked talent profile'}

**Brand:**
${brand ? `
- Name: ${brand.name}
- Industry: ${brand.industry}
- Company Size: ${brand.company_size}
- Annual Budget: ${brand.annual_budget ? '$' + brand.annual_budget.toLocaleString() : 'Unknown'}
` : 'No linked brand profile'}

**Outreach Performance (${campaignMetrics.length} metric records):**
${campaignMetrics.length > 0 ? `
- Total Emails Sent: ${totalSent}
- Total Opened: ${totalOpened}
- Total Replied: ${totalReplied}
- Avg Open Rate: ${avgOpenRate ? avgOpenRate.toFixed(1) + '%' : 'N/A'}
- Avg Reply Rate: ${avgReplyRate ? avgReplyRate.toFixed(1) + '%' : 'N/A'}
- Avg Conversion Rate: ${avgConversionRate ? avgConversionRate.toFixed(1) + '%' : 'N/A'}
- Outreach Types Used: ${[...new Set(campaignMetrics.map(m => m.outreach_type))].join(', ')}
` : 'No outreach metrics recorded for this campaign.'}

**Deal Notes (${dealNotes.length} notes):**
${dealNotes.slice(0, 8).map(n => `[${n.note_type?.toUpperCase()}] ${n.content?.slice(0, 200)}`).join('\n') || 'No notes recorded'}

**Activity Log (${activities.length} events):**
${activities.slice(0, 10).map(a => `- ${a.action}: ${a.description}`).join('\n') || 'No activities logged'}

Based on all available data, generate a comprehensive post-campaign analysis. Be specific and data-driven where possible, and honest about gaps in data.

Return a JSON object:
{
  "overall_rating": <"excellent"|"good"|"average"|"below_average"|"poor">,
  "executive_summary": <2-3 sentence high-level summary of how the campaign performed>,
  "key_successes": [<array of 2-4 specific successes with brief explanations>],
  "key_challenges": [<array of 1-3 specific challenges encountered>],
  "lessons_learned": [<array of 2-4 actionable lessons for future campaigns>],
  "outreach_assessment": <one sentence assessment of outreach effectiveness>,
  "relationship_quality": <"strong"|"neutral"|"strained"|"unknown">,
  "relationship_notes": <one sentence on how the brand-talent relationship developed>,
  "roi_assessment": <one sentence on whether the deal value was justified>,
  "repeat_recommendation": <"strongly_yes"|"yes"|"neutral"|"no"|"strongly_no">,
  "repeat_reasoning": <one sentence on whether to work with this talent/brand again>,
  "optimization_opportunities": [<array of 2-3 specific things to do differently next time>],
  "benchmark_comparison": <one sentence comparing performance to similar deals if data allows, otherwise note data gap>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_rating: { type: 'string' },
          executive_summary: { type: 'string' },
          key_successes: { type: 'array', items: { type: 'string' } },
          key_challenges: { type: 'array', items: { type: 'string' } },
          lessons_learned: { type: 'array', items: { type: 'string' } },
          outreach_assessment: { type: 'string' },
          relationship_quality: { type: 'string' },
          relationship_notes: { type: 'string' },
          roi_assessment: { type: 'string' },
          repeat_recommendation: { type: 'string' },
          repeat_reasoning: { type: 'string' },
          optimization_opportunities: { type: 'array', items: { type: 'string' } },
          benchmark_comparison: { type: 'string' },
        }
      }
    });

    return Response.json({ success: true, analysis: result, deal_title: deal.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});