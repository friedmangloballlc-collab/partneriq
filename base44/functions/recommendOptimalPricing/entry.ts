import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { partnership_id } = await req.json();
    if (!partnership_id) return Response.json({ error: 'partnership_id required' }, { status: 400 });

    // Fetch the target partnership
    const partnerships = await base44.entities.Partnership.list('-created_date', 500);
    const deal = partnerships.find(p => p.id === partnership_id);
    if (!deal) return Response.json({ error: 'Partnership not found' }, { status: 404 });

    // Parallel data fetches
    const [talents, brands, roiBenchmarks, dealNotes, allProposals] = await Promise.all([
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Brand.list('-created_date', 200),
      base44.entities.ROIBenchmark.list('-created_date', 100),
      base44.entities.DealNote.filter({ partnership_id }),
      base44.entities.PartnershipProposal.list('-created_date', 200),
    ]);

    const talent = talents.find(t => t.id === deal.talent_id);
    const brand = brands.find(b => b.id === deal.brand_id);

    // Comparable closed deals (same partnership type or same talent tier)
    const comparableDeals = partnerships.filter(p =>
      p.id !== partnership_id &&
      p.deal_value > 0 &&
      (p.status === 'completed' || p.status === 'contracted' || p.status === 'active') &&
      (p.partnership_type === deal.partnership_type ||
        (talent && talents.find(t => t.id === p.talent_id)?.tier === talent.tier))
    );

    const avgComparableValue = comparableDeals.length
      ? Math.round(comparableDeals.reduce((s, p) => s + (p.deal_value || 0), 0) / comparableDeals.length)
      : null;

    // Proposals for this partnership
    const relatedProposals = allProposals.filter(p =>
      p.brand_id === deal.brand_id || p.talent_id === deal.talent_id
    );

    // ROI benchmarks for this deal type
    const dealTypeMap = {
      sponsorship: 'sponsored_post',
      ambassador: 'brand_ambassador',
      affiliate: 'sponsored_post',
      content_creation: 'sponsored_post',
      event: 'brand_ambassador',
      product_seeding: 'sponsored_post',
      licensing: 'licensing_deal',
    };
    const roiKey = dealTypeMap[deal.partnership_type] || 'sponsored_post';
    const relevantROI = roiBenchmarks.find(r => r.deal_type === roiKey);

    const prompt = `You are a senior partnership deal pricing strategist for an influencer marketing platform. 
Recommend optimal pricing for the following partnership deal based on all available data.

**Partnership Deal:**
- Title: ${deal.title}
- Type: ${deal.partnership_type || 'Unknown'}
- Current deal value: ${deal.deal_value ? '$' + deal.deal_value.toLocaleString() : 'Not set'}
- Current priority: ${deal.priority || 'Unknown'}
- Pipeline stage: ${deal.status}
- Match score: ${deal.match_score || 'Unknown'}/100

**Talent Profile:**
${talent ? `
- Name: ${talent.name}
- Tier: ${talent.tier}
- Platform: ${talent.primary_platform}
- Niche: ${talent.niche}
- Followers: ${talent.total_followers?.toLocaleString() || 'Unknown'}
- Engagement rate: ${talent.engagement_rate || 'Unknown'}%
- Audience quality score: ${talent.audience_quality_score || 'Unknown'}/100
- Brand safety score: ${talent.brand_safety_score || 'Unknown'}/100
- Current rate per post: ${talent.rate_per_post ? '$' + talent.rate_per_post.toLocaleString() : 'Unknown'}
- Trajectory: ${talent.trajectory || 'Unknown'}
- Discovery alpha score: ${talent.discovery_alpha_score || 'Unknown'}/100
- Avg views: ${talent.avg_views?.toLocaleString() || 'Unknown'}
- Avg engagement per post: ${talent.avg_likes ? (talent.avg_likes + (talent.avg_comments || 0)).toLocaleString() : 'Unknown'}
` : 'No linked talent profile'}

**Brand Profile:**
${brand ? `
- Name: ${brand.name}
- Industry: ${brand.industry}
- Company size: ${brand.company_size}
- Annual partnership budget: ${brand.annual_budget ? '$' + brand.annual_budget.toLocaleString() : 'Unknown'}
- Previous partnerships count: ${brand.previous_partnerships || 'Unknown'}
- Target audience: ${brand.target_audience || 'Unknown'}
` : 'No linked brand profile'}

**Deal Notes (${dealNotes.length} notes):**
${dealNotes.slice(0, 5).map(n => `- [${n.note_type}] ${n.content?.slice(0, 150)}`).join('\n') || 'No notes'}

**Market Benchmarks (${deal.partnership_type} type):**
${relevantROI ? `
- Median ROI multiplier: ${relevantROI.median_roi}x
- Top quartile ROI: ${relevantROI.top_quartile_roi}x
- Bottom quartile ROI: ${relevantROI.bottom_quartile_roi}x
- Measurement period: ${relevantROI.measurement_period || 'N/A'}
` : 'No specific ROI benchmark found for this deal type'}

**Comparable Closed Deals (${comparableDeals.length} deals, same type or tier):**
- Average value: ${avgComparableValue ? '$' + avgComparableValue.toLocaleString() : 'N/A'}
- Range: ${comparableDeals.length > 0 ? '$' + Math.min(...comparableDeals.map(p => p.deal_value)).toLocaleString() + ' – $' + Math.max(...comparableDeals.map(p => p.deal_value)).toLocaleString() : 'N/A'}
- Top deals: ${comparableDeals.slice(0, 3).map(p => p.title + ' ($' + (p.deal_value || 0).toLocaleString() + ')').join(', ') || 'None'}

**Related Proposals History (${relatedProposals.length}):**
${relatedProposals.slice(0, 4).map(p => `- ${p.title}: ${p.status}, budget $${p.budget?.toLocaleString() || 'N/A'}`).join('\n') || 'None'}

Based on all this data, provide optimal pricing recommendations. Be specific and data-driven.

Return a JSON object:
{
  "recommended_price": <integer, single best recommended deal value in USD>,
  "price_floor": <integer, minimum acceptable price>,
  "price_ceiling": <integer, maximum justifiable price>,
  "confidence": <"low"|"medium"|"high">,
  "pricing_rationale": <2-sentence explanation of how you arrived at the recommendation>,
  "value_drivers": [<array of 2-3 specific factors that justify pricing at or above the recommended price>],
  "negotiation_anchors": [<array of 2 specific data points to cite during negotiation>],
  "discount_risk": <"low"|"medium"|"high">,
  "discount_risk_reason": <one sentence on whether brand will push back on price>,
  "optimal_deal_structure": <one sentence on payment structure, exclusivity, deliverables split>,
  "comparable_context": <one sentence comparing to similar deals on the platform>,
  "roi_projection": <one sentence projecting expected ROI for the brand at the recommended price>,
  "urgency_note": <one sentence on timing leverage, if any>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_price: { type: 'number' },
          price_floor: { type: 'number' },
          price_ceiling: { type: 'number' },
          confidence: { type: 'string' },
          pricing_rationale: { type: 'string' },
          value_drivers: { type: 'array', items: { type: 'string' } },
          negotiation_anchors: { type: 'array', items: { type: 'string' } },
          discount_risk: { type: 'string' },
          discount_risk_reason: { type: 'string' },
          optimal_deal_structure: { type: 'string' },
          comparable_context: { type: 'string' },
          roi_projection: { type: 'string' },
          urgency_note: { type: 'string' },
        }
      }
    });

    return Response.json({ success: true, pricing: result, deal_title: deal.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});