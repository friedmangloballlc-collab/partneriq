import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

// =============================================================================
// UNIFIED AI GENERATION HANDLER
// Consolidates: generateAICampaign, generateCreativeDirection,
//   generateExecutiveBriefing, generateAIOutreach, generateSmartAlerts,
//   generateWeeklyBrief, predictPartnershipSuccess, predictTalentValueTrajectory,
//   forecastRevenue, forecastOutreachConversion, recommendOptimalPricing,
//   localizeContent, analyzeNegotiationCoach, identifySuccessFactors
//
// Usage: POST with { action: "<action>", ...params }
// =============================================================================

type AIAction =
  | 'campaign_brief'
  | 'creative'
  | 'executive_briefing'
  | 'outreach'
  | 'alerts'
  | 'weekly_brief'
  | 'predict_success'
  | 'predict_pricing'
  | 'predict_talent_value'
  | 'forecast_revenue'
  | 'forecast_outreach'
  | 'negotiation'
  | 'localize'
  | 'success_factors';

const VALID_ACTIONS: AIAction[] = [
  'campaign_brief', 'creative', 'executive_briefing', 'outreach',
  'alerts', 'weekly_brief', 'predict_success', 'predict_pricing',
  'predict_talent_value', 'forecast_revenue', 'forecast_outreach',
  'negotiation', 'localize', 'success_factors',
];

// ---------------------------------------------------------------------------
// ACTION: campaign_brief  (was generateAICampaign)
// ---------------------------------------------------------------------------

async function handleCampaignBrief(base44: any, _user: any, payload: any): Promise<Response> {
  const { demographics, marketTrends, industry, targetAudience } = payload;

  if (!demographics || demographics.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one demographic segment is required' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const demographicsDescription = demographics
    .map((d: any) => `${d.name} (Population: ${d.population_size}, Buying Power: ${d.buying_power})`)
    .join('; ');

  const prompt = `You are a marketing strategist creating a comprehensive campaign strategy.

Selected Demographics: ${demographicsDescription}

Market Trends: ${marketTrends || 'General market trends'}
Industry: ${industry || 'General'}
Target Audience: ${targetAudience || 'Primary demographics'}

Generate a detailed marketing campaign with:

1. CAMPAIGN CONCEPT (2-3 sentence overview)

2. CAMPAIGN IDEAS (provide 3 compelling campaign ideas with names and one-sentence descriptions)

3. PRIMARY CAMPAIGN COPY:
   - Headline (attention-grabbing, under 10 words)
   - Body Text (2-3 sentences of persuasive copy)
   - Call to Action (clear, action-oriented)

4. TARGETING PARAMETERS:
   - Primary demographic segments to target
   - Geographic focus
   - Platform recommendations (social media, digital, traditional)
   - Best time to launch

5. BUDGET ALLOCATION:
   - Recommended total budget range
   - Channel breakdown (percentages): Social Media, Digital Ads, Content, Influencers, Other
   - Cost per result estimation

Provide the response as valid JSON with keys: concept, campaignIdeas (array with name and description), primaryCopy (headline, bodyText, cta), targetingParameters, budgetAllocation.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: false,
    response_json_schema: {
      type: 'object',
      properties: {
        concept: { type: 'string' },
        campaignIdeas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        primaryCopy: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            bodyText: { type: 'string' },
            cta: { type: 'string' }
          }
        },
        targetingParameters: {
          type: 'object',
          properties: {
            demographics: { type: 'string' },
            geographic: { type: 'string' },
            platforms: { type: 'string' },
            launchTiming: { type: 'string' }
          }
        },
        budgetAllocation: {
          type: 'object',
          properties: {
            budgetRange: { type: 'string' },
            channelBreakdown: {
              type: 'object',
              properties: {
                socialMedia: { type: 'number' },
                digitalAds: { type: 'number' },
                content: { type: 'number' },
                influencers: { type: 'number' },
                other: { type: 'number' }
              }
            },
            costPerResult: { type: 'string' }
          }
        }
      }
    }
  });

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: creative  (was generateCreativeDirection)
// ---------------------------------------------------------------------------

async function handleCreative(base44: any, _user: any, payload: any): Promise<Response> {
  const { partnership_id } = payload;

  const [partnerships, talents, brands] = await Promise.all([
    base44.entities.Partnership.list('-created_date', 100),
    base44.entities.Talent.list('-created_date', 100),
    base44.entities.Brand.list('-created_date', 50),
  ]);

  if (partnerships.length === 0) {
    return new Response(JSON.stringify({ error: 'No partnership data found.' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const deal = partnership_id ? partnerships.find((p: any) => p.id === partnership_id) : partnerships[0];
  const talent = deal ? talents.find((t: any) => t.name === deal.talent_name) : talents[0];
  const brand = deal ? brands.find((b: any) => b.name === deal.brand_name) : brands[0];

  const prompt = `You are a Content Brief & Creative Direction AI Agent for influencer partnerships.

PARTNERSHIP:
${deal ? `- ${deal.talent_name || 'Creator'} x ${deal.brand_name || 'Brand'}
- Type: ${deal.partnership_type || 'Sponsorship'}
- Value: $${deal.deal_value || 'TBD'}
- Deliverables: ${deal.deliverables || 'Not specified'}` : 'General creative brief'}

CREATOR PROFILE:
${talent ? `- Name: ${talent.name}
- Platform: ${talent.platform}
- Niche: ${talent.niche}
- Tier: ${talent.tier}
- Followers: ${talent.followers?.toLocaleString()}
- Engagement Rate: ${talent.engagement_rate}%` : 'No specific creator'}

BRAND PROFILE:
${brand ? `- Name: ${brand.name}
- Industry: ${brand.industry || 'N/A'}
- Niches: ${brand.preferred_niches || 'N/A'}
- Target Audience: ${brand.target_audience || 'N/A'}` : 'No specific brand'}

Generate a comprehensive creative direction package:
1. Content concept and creative theme
2. Visual style guide (mood, color palette, aesthetics)
3. Talking points and key messages
4. Brand voice guidelines and tone
5. Do's and Don'ts checklist
6. Platform-specific content recommendations
7. Example script/caption framework
8. Shot list / content structure`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        creative_concept: {
          type: 'object',
          properties: {
            theme: { type: 'string' },
            hook: { type: 'string' },
            narrative_arc: { type: 'string' },
            emotional_tone: { type: 'string' }
          }
        },
        visual_style: {
          type: 'object',
          properties: {
            mood: { type: 'string' },
            color_palette: { type: 'string' },
            aesthetic_references: { type: 'string' },
            lighting_direction: { type: 'string' }
          }
        },
        talking_points: { type: 'array', items: { type: 'object', properties: { point: { type: 'string' }, context: { type: 'string' }, delivery_tip: { type: 'string' } } } },
        brand_voice: {
          type: 'object',
          properties: {
            tone: { type: 'string' },
            language_style: { type: 'string' },
            key_phrases_to_use: { type: 'array', items: { type: 'string' } },
            words_to_avoid: { type: 'array', items: { type: 'string' } }
          }
        },
        dos_and_donts: {
          type: 'object',
          properties: {
            dos: { type: 'array', items: { type: 'string' } },
            donts: { type: 'array', items: { type: 'string' } }
          }
        },
        platform_recommendations: {
          type: 'array',
          items: { type: 'object', properties: { platform: { type: 'string' }, format: { type: 'string' }, optimal_length: { type: 'string' }, best_posting_time: { type: 'string' }, hashtag_strategy: { type: 'string' } } }
        },
        script_framework: {
          type: 'object',
          properties: {
            opening_hook: { type: 'string' },
            body_structure: { type: 'string' },
            call_to_action: { type: 'string' },
            sample_caption: { type: 'string' }
          }
        },
        shot_list: { type: 'array', items: { type: 'object', properties: { shot: { type: 'string' }, description: { type: 'string' }, purpose: { type: 'string' } } } }
      }
    }
  });

  return new Response(JSON.stringify({ success: true, analysis: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: executive_briefing  (was generateExecutiveBriefing)
// ---------------------------------------------------------------------------

async function handleExecutiveBriefing(base44: any, _user: any, payload: any): Promise<Response> {
  const { period = 'weekly' } = payload;

  const now = new Date();
  const periodStart = new Date(now);
  if (period === 'daily') {
    periodStart.setDate(periodStart.getDate() - 1);
  } else if (period === 'weekly') {
    periodStart.setDate(periodStart.getDate() - 7);
  } else if (period === 'monthly') {
    periodStart.setMonth(periodStart.getMonth() - 1);
  }
  const periodStartISO = periodStart.toISOString();

  const [
    partnerships, talents, brands, activities, approvals,
    billing, outreachMetrics, outreachEmails, outreachSequences, dealNotes,
  ] = await Promise.all([
    base44.entities.Partnership.list('-created_date', 500),
    base44.entities.Talent.list('-created_date', 500),
    base44.entities.Brand.list('-created_date', 500),
    base44.entities.Activity.list('-created_date', 500),
    base44.entities.ApprovalItem.list('-created_date', 200),
    base44.entities.BillingHistory.list('-created_date', 200),
    base44.entities.OutreachMetrics.list('-created_date', 200),
    base44.entities.OutreachEmail.list('-created_date', 300),
    base44.entities.OutreachSequence.list('-created_date', 200),
    base44.entities.DealNote.list('-created_date', 200),
  ]);

  const totalPartnerships = partnerships.length;
  const activeDeals = partnerships.filter((p: any) => p.status === 'active').length;
  const completedDeals = partnerships.filter((p: any) => p.status === 'completed').length;
  const churnedDeals = partnerships.filter((p: any) => p.status === 'churned').length;
  const negotiatingDeals = partnerships.filter((p: any) => p.status === 'negotiating' || p.status === 'proposed').length;

  const pipelineValue = partnerships
    .filter((p: any) => p.status !== 'completed' && p.status !== 'churned')
    .reduce((sum: number, p: any) => sum + (p.deal_value || 0), 0);

  const totalDealValue = partnerships.reduce((sum: number, p: any) => sum + (p.deal_value || 0), 0);
  const avgDealValue = totalPartnerships > 0 ? Math.round(totalDealValue / totalPartnerships) : 0;

  const closedDeals = completedDeals + churnedDeals;
  const conversionRate = closedDeals > 0 ? Math.round((completedDeals / closedDeals) * 100) : 0;

  const completedRevenue = partnerships
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + (p.deal_value || 0), 0);

  const recentPartnerships = partnerships.filter((p: any) =>
    p.created_date && new Date(p.created_date) >= periodStart
  );

  const prevPeriodStart = new Date(periodStart);
  if (period === 'daily') prevPeriodStart.setDate(prevPeriodStart.getDate() - 1);
  else if (period === 'weekly') prevPeriodStart.setDate(prevPeriodStart.getDate() - 7);
  else prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);

  const currentPeriodRevenue = partnerships
    .filter((p: any) => p.status === 'completed' && p.updated_date && new Date(p.updated_date) >= periodStart)
    .reduce((sum: number, p: any) => sum + (p.deal_value || 0), 0);

  const prevPeriodRevenue = partnerships
    .filter((p: any) => p.status === 'completed' && p.updated_date &&
      new Date(p.updated_date) >= prevPeriodStart && new Date(p.updated_date) < periodStart)
    .reduce((sum: number, p: any) => sum + (p.deal_value || 0), 0);

  const revenueGrowth = prevPeriodRevenue > 0
    ? Math.round(((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100)
    : 0;

  const topPartnerships = partnerships
    .sort((a: any, b: any) => (b.deal_value || 0) - (a.deal_value || 0))
    .slice(0, 10)
    .map((p: any) => ({
      name: p.partner_name || p.brand_name || p.talent_name || 'Unknown',
      status: p.status || 'unknown',
      value: p.deal_value || 0,
      type: p.partnership_type || 'unknown',
      match_score: p.match_score || 0,
      priority: p.priority || 'medium',
    }));

  const recentTalents = talents.filter((t: any) =>
    t.created_date && new Date(t.created_date) >= periodStart
  );

  const topPerformingTalents = talents
    .filter((t: any) => t.engagement_rate || t.follower_count)
    .sort((a: any, b: any) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
    .slice(0, 5)
    .map((t: any) => ({ name: t.full_name || t.name || 'Unknown', engagement_rate: t.engagement_rate || 0, followers: t.follower_count || 0 }));

  const totalEmailsSent = outreachEmails.length;
  const repliedEmails = outreachEmails.filter((e: any) => e.status === 'replied').length;
  const emailReplyRate = totalEmailsSent > 0 ? Math.round((repliedEmails / totalEmailsSent) * 100) : 0;
  const activeSequences = outreachSequences.filter((s: any) => s.status === 'active').length;

  const pendingApprovals = approvals.filter((a: any) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a: any) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a: any) => a.status === 'rejected').length;

  const recentBilling = billing.filter((b: any) =>
    b.created_date && new Date(b.created_date) >= periodStart
  );
  const periodRevenue = recentBilling
    .filter((b: any) => b.status === 'paid')
    .reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
  const outstandingInvoices = billing
    .filter((b: any) => b.status === 'pending' || b.status === 'overdue')
    .reduce((sum: number, b: any) => sum + (b.amount || 0), 0);

  const typeBreakdown: Record<string, { count: number; value: number; won: number }> = {};
  partnerships.forEach((p: any) => {
    const t = p.partnership_type || 'other';
    if (!typeBreakdown[t]) typeBreakdown[t] = { count: 0, value: 0, won: 0 };
    typeBreakdown[t].count++;
    typeBreakdown[t].value += p.deal_value || 0;
    if (p.status === 'completed') typeBreakdown[t].won++;
  });

  const prompt = `You are an expert executive briefing analyst for a partnership and influencer management platform called Deal Stage. Generate a comprehensive executive briefing report based on the following data.

**PERIOD:** ${period} (${periodStart.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]})

**KPI OVERVIEW:**
- Total partnerships: ${totalPartnerships}
- Active deals: ${activeDeals}
- Completed deals: ${completedDeals}
- Churned deals: ${churnedDeals}
- Negotiating/Proposed: ${negotiatingDeals}
- Pipeline value: $${pipelineValue.toLocaleString()}
- Avg deal value: $${avgDealValue.toLocaleString()}
- Conversion rate: ${conversionRate}%
- Revenue growth (period-over-period): ${revenueGrowth}%
- New partnerships this period: ${recentPartnerships.length}

**TOP PARTNERSHIPS BY VALUE:**
${topPartnerships.map((p: any) => `- ${p.name}: $${p.value.toLocaleString()} (${p.status}, ${p.type}, match: ${p.match_score}%, priority: ${p.priority})`).join('\n')}

**PARTNERSHIP TYPE BREAKDOWN:**
${Object.entries(typeBreakdown).map(([type, d]) => `- ${type}: ${d.count} deals, $${d.value.toLocaleString()} total value, ${d.won} won`).join('\n')}

**TALENT INSIGHTS:**
- Total talents: ${talents.length}
- New signings this period: ${recentTalents.length}
- Top performers by engagement: ${topPerformingTalents.map((t: any) => `${t.name} (${t.engagement_rate}%)`).join(', ') || 'N/A'}

**BRAND PORTFOLIO:**
- Total brands: ${brands.length}

**OUTREACH PERFORMANCE:**
- Total emails sent: ${totalEmailsSent}
- Reply rate: ${emailReplyRate}%
- Active sequences: ${activeSequences}

**APPROVALS:**
- Pending: ${pendingApprovals}
- Approved: ${approvedCount}
- Rejected: ${rejectedCount}

**FINANCIAL:**
- Revenue this period: $${periodRevenue.toLocaleString()}
- Outstanding invoices: $${outstandingInvoices.toLocaleString()}
- Completed deal revenue: $${completedRevenue.toLocaleString()}
- Projected pipeline: $${pipelineValue.toLocaleString()}

**RECENT ACTIVITIES:** ${activities.slice(0, 20).map((a: any) => `${a.activity_type || 'action'}: ${a.description || a.title || 'N/A'}`).join('; ')}

Based on ALL of this data, generate a comprehensive executive briefing. Be specific, data-driven, and actionable. Reference actual numbers from the data. Identify risks proactively and surface strategic opportunities.

Generate 3-6 partnership_highlights, 2-5 risk_alerts, 3-6 opportunity_pipeline items, 3-5 top_performers, 1-3 at_risk talents, 5-8 action_items, and 3-5 strategic_recommendations. Make sure all dollar values are numbers, not strings.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        briefing_period: { type: 'string' },
        generated_at: { type: 'string' },
        executive_summary: { type: 'string' },
        kpi_dashboard: {
          type: 'object',
          properties: {
            total_partnerships: { type: 'number' },
            active_deals: { type: 'number' },
            pipeline_value: { type: 'number' },
            avg_deal_value: { type: 'number' },
            conversion_rate: { type: 'number' },
            revenue_growth: { type: 'number' },
          },
        },
        partnership_highlights: {
          type: 'array',
          items: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string' }, value: { type: 'number' }, key_insight: { type: 'string' } } },
        },
        risk_alerts: {
          type: 'array',
          items: { type: 'object', properties: { risk: { type: 'string' }, severity: { type: 'string' }, mitigation: { type: 'string' } } },
        },
        opportunity_pipeline: {
          type: 'array',
          items: { type: 'object', properties: { opportunity: { type: 'string' }, potential_value: { type: 'number' }, probability: { type: 'number' }, next_step: { type: 'string' } } },
        },
        talent_insights: {
          type: 'object',
          properties: {
            new_signings: { type: 'number' },
            top_performers: { type: 'array', items: { type: 'string' } },
            at_risk: { type: 'array', items: { type: 'string' } },
          },
        },
        competitive_landscape: { type: 'string' },
        financial_summary: {
          type: 'object',
          properties: {
            revenue_this_period: { type: 'number' },
            outstanding_invoices: { type: 'number' },
            projected_revenue: { type: 'number' },
          },
        },
        action_items: {
          type: 'array',
          items: { type: 'object', properties: { priority: { type: 'string' }, action: { type: 'string' }, owner: { type: 'string' }, deadline: { type: 'string' } } },
        },
        strategic_recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  return new Response(JSON.stringify({ success: true, briefing: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: outreach  (was generateAIOutreach)
// ---------------------------------------------------------------------------

async function handleOutreach(base44: any, _user: any, payload: any): Promise<Response> {
  const { talent_id, brand_id, campaign_type } = payload;

  if (!talent_id || !brand_id || !campaign_type) {
    return new Response(JSON.stringify({ error: 'Missing required fields: talent_id, brand_id, campaign_type' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const validTypes = ['cold_outreach', 'warm_followup', 're_engagement', 'upsell', 'event_collab'];
  if (!validTypes.includes(campaign_type)) {
    return new Response(JSON.stringify({ error: `Invalid campaign_type. Must be one of: ${validTypes.join(', ')}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const [talents, brands, partnerships, emails, activities] = await Promise.all([
    base44.entities.Talent.list('-created_date', 200),
    base44.entities.Brand.list('-created_date', 200),
    base44.entities.Partnership.list('-created_date', 300),
    base44.entities.OutreachEmail.list('-created_date', 300),
    base44.entities.Activity.list('-created_date', 500),
  ]);

  const talent = talents.find((t: any) => t.id === talent_id);
  const brand = brands.find((b: any) => b.id === brand_id);

  if (!talent) return new Response(JSON.stringify({ error: 'Talent not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!brand) return new Response(JSON.stringify({ error: 'Brand not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const partnershipHistory = partnerships.filter(
    (p: any) => (p.talent_name === talent.full_name || p.talent_id === talent_id) &&
                 (p.brand_name === brand.company_name || p.brand_id === brand_id)
  );

  const relatedEmails = emails.filter(
    (e: any) => e.talent_id === talent_id || e.brand_id === brand_id ||
                 e.recipient_name === talent.full_name || e.brand_name === brand.company_name
  );

  const relatedActivities = activities.filter(
    (a: any) => a.talent_id === talent_id || a.brand_id === brand_id
  );

  const repliedEmails = relatedEmails.filter((e: any) => e.status === 'replied');
  const openedEmails = relatedEmails.filter((e: any) => e.status === 'opened' || e.status === 'replied');
  const responseRate = relatedEmails.length > 0 ? (repliedEmails.length / relatedEmails.length * 100).toFixed(1) : 'N/A';

  const campaignDescriptions: Record<string, string> = {
    cold_outreach: 'First-time outreach to a talent with no prior relationship. Focus on establishing credibility, showing genuine knowledge of their content, and proposing a clear value exchange.',
    warm_followup: 'Following up with a talent who has shown some interest or had prior interaction. Build on existing rapport, reference past touchpoints, and move toward a concrete next step.',
    re_engagement: 'Re-engaging a talent who previously partnered but has gone quiet or churned. Acknowledge the gap, highlight what has changed, and propose a fresh opportunity.',
    upsell: 'Expanding an existing successful partnership. Reference proven results, propose a bigger scope or new format, and frame the upsell as mutual growth.',
    event_collab: 'Proposing a time-sensitive event or campaign collaboration. Create urgency, paint the creative vision, and make logistics feel easy.',
  };

  const prompt = `You are an elite influencer marketing outreach strategist. Generate a personalized multi-email outreach sequence.

CAMPAIGN TYPE: ${campaign_type}
CAMPAIGN CONTEXT: ${campaignDescriptions[campaign_type]}

TALENT PROFILE:
- Name: ${talent.full_name || 'Unknown'}
- Platforms: ${talent.platforms?.join(', ') || 'N/A'}
- Niche/Categories: ${talent.niche || talent.categories?.join(', ') || 'N/A'}
- Total Followers: ${talent.total_followers?.toLocaleString() || 'N/A'}
- Engagement Rate: ${talent.engagement_rate || 'N/A'}%
- Location: ${talent.location || 'N/A'}
- Bio: ${talent.bio || 'N/A'}
- Content Style: ${talent.content_style || 'N/A'}
- Past Brand Collabs: ${talent.past_collaborations || 'N/A'}

BRAND PROFILE:
- Company: ${brand.company_name || 'Unknown'}
- Industry: ${brand.industry || 'N/A'}
- Target Audience: ${brand.target_audience || 'N/A'}
- Brand Values: ${brand.brand_values || 'N/A'}
- Budget Range: ${brand.budget_range || 'N/A'}
- Campaign Goals: ${brand.campaign_goals || 'N/A'}
- Website: ${brand.website || 'N/A'}

PARTNERSHIP HISTORY:
- Previous partnerships: ${partnershipHistory.length}
${partnershipHistory.slice(0, 5).map((p: any) => `  - Status: ${p.status}, Value: $${p.deal_value || 0}, Score: ${p.match_score || 'N/A'}`).join('\n')}

RELATIONSHIP HEALTH:
- Emails sent: ${relatedEmails.length}
- Emails opened: ${openedEmails.length}
- Emails replied: ${repliedEmails.length}
- Response rate: ${responseRate}%
- Activities logged: ${relatedActivities.length}

Generate a complete outreach sequence with 4-6 emails. Each email should:
1. Have a compelling, personalized subject line (under 60 chars)
2. Include a short preview text for inbox display
3. Have a full email body that feels human, personal, and conversational
4. Include specific personalization hooks referencing the talent's actual content
5. Have a clear, low-friction CTA
6. Build naturally on the previous email in the sequence

Also generate A/B variants for the first 2 emails, optimal send times, expected performance metrics, and follow-up triggers that should change the sequence flow.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        campaign_strategy: { type: 'string' },
        sequence: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              email_number: { type: 'number' },
              subject_line: { type: 'string' },
              preview_text: { type: 'string' },
              body: { type: 'string' },
              send_delay_days: { type: 'number' },
              purpose: { type: 'string' },
              personalization_hooks: { type: 'array', items: { type: 'string' } },
              cta: { type: 'string' }
            }
          }
        },
        a_b_variants: {
          type: 'array',
          items: { type: 'object', properties: { email_number: { type: 'number' }, variant: { type: 'string' }, subject_line: { type: 'string' }, body_changes: { type: 'string' } } }
        },
        optimal_send_times: {
          type: 'object',
          properties: { best_days: { type: 'string' }, best_time_range: { type: 'string' }, timezone_note: { type: 'string' }, reasoning: { type: 'string' } }
        },
        expected_metrics: {
          type: 'object',
          properties: { open_rate: { type: 'string' }, reply_rate: { type: 'string' }, conversion_rate: { type: 'string' } }
        },
        follow_up_triggers: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return new Response(JSON.stringify({ success: true, outreach: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: alerts  (was generateSmartAlerts)
// ---------------------------------------------------------------------------

async function handleAlerts(base44: any, _user: any, _payload: any): Promise<Response> {
  const [partnerships, talents, approvals, activities, outreachSequences, billingHistory] = await Promise.all([
    base44.entities.Partnership.list('-updated_date', 300),
    base44.entities.Talent.list('-created_date', 200),
    base44.entities.ApprovalItem.list('-created_date', 200),
    base44.entities.Activity.list('-created_date', 200),
    base44.entities.OutreachSequence.list('-created_date', 100),
    base44.entities.BillingHistory.list('-created_date', 100),
  ]);

  const now = new Date();

  const activePartnerships = partnerships.filter((p: any) => ['active', 'contracted', 'negotiating'].includes(p.status));
  const stalledDeals = partnerships.filter((p: any) => {
    const daysSinceUpdate = (now.getTime() - new Date(p.updated_date).getTime()) / (1000 * 60 * 60 * 24);
    return !['completed', 'churned'].includes(p.status) && daysSinceUpdate >= 5;
  });
  const pendingApprovals = approvals.filter((a: any) => a.status === 'pending');
  const overdueApprovals = pendingApprovals.filter((a: any) => {
    const daysPending = (now.getTime() - new Date(a.created_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysPending >= 3;
  });
  const recentActivities = activities.slice(0, 50);
  const activeOutreach = outreachSequences.filter((s: any) => s.status === 'active');
  const recentBilling = billingHistory.slice(0, 30);

  const highValueDeals = partnerships.filter((p: any) => p.deal_value && p.deal_value >= 10000);
  const expiringDeals = partnerships.filter((p: any) => {
    if (!p.end_date) return false;
    const daysUntilExpiry = (new Date(p.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  const riskyTalents = talents.filter((t: any) => t.brand_safety_score && t.brand_safety_score < 60);

  const prompt = `You are a Smart Notifications Engine for a partnership/influencer management platform.
Analyze the following data and generate actionable, prioritized alerts across all categories.

TODAY: ${now.toISOString().split('T')[0]}

PARTNERSHIPS (${partnerships.length} total, ${activePartnerships.length} active):
${partnerships.slice(0, 30).map((p: any) => `- "${p.title}" | Status: ${p.status} | Brand: ${p.brand_name || 'N/A'} | Talent: ${p.talent_name || 'N/A'} | Value: $${p.deal_value || 0} | Updated: ${p.updated_date} | End: ${p.end_date || 'N/A'} | Priority: ${p.priority || 'N/A'}`).join('\n')}

STALLED DEALS (${stalledDeals.length}):
${stalledDeals.slice(0, 15).map((p: any) => `- "${p.title}" stalled ${Math.floor((now.getTime() - new Date(p.updated_date).getTime()) / (1000 * 60 * 60 * 24))} days in "${p.status}"`).join('\n')}

EXPIRING DEALS (${expiringDeals.length}):
${expiringDeals.slice(0, 10).map((p: any) => `- "${p.title}" expires ${p.end_date} (${Math.floor((new Date(p.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days left, value: $${p.deal_value || 0})`).join('\n')}

HIGH-VALUE DEALS (${highValueDeals.length}):
${highValueDeals.slice(0, 10).map((p: any) => `- "${p.title}" $${p.deal_value} | ${p.status}`).join('\n')}

TALENTS (${talents.length} total):
${talents.slice(0, 20).map((t: any) => `- ${t.name}: ${t.platform || 'N/A'}/${t.niche || 'N/A'}, Tier=${t.tier || 'N/A'}, Safety=${t.brand_safety_score || 'N/A'}, Followers=${t.followers?.toLocaleString() || 'N/A'}`).join('\n')}

RISKY TALENTS (safety score < 60): ${riskyTalents.length}
${riskyTalents.slice(0, 10).map((t: any) => `- ${t.name}: Safety=${t.brand_safety_score}, Platform=${t.platform}`).join('\n')}

PENDING APPROVALS (${pendingApprovals.length}, ${overdueApprovals.length} overdue):
${pendingApprovals.slice(0, 15).map((a: any) => `- "${a.title || a.name}" | Type: ${a.type || 'N/A'} | Created: ${a.created_date} | Status: ${a.status}`).join('\n')}

RECENT ACTIVITIES (last ${recentActivities.length}):
${recentActivities.slice(0, 20).map((a: any) => `- ${a.type || 'activity'}: "${a.title || a.description || 'N/A'}" at ${a.created_date}`).join('\n')}

OUTREACH SEQUENCES (${outreachSequences.length} total, ${activeOutreach.length} active):
${outreachSequences.slice(0, 15).map((s: any) => `- "${s.name || s.title}" | Status: ${s.status || 'N/A'} | Sent: ${s.emails_sent || 0} | Replies: ${s.replies || 0}`).join('\n')}

BILLING (${billingHistory.length} records):
${recentBilling.slice(0, 10).map((b: any) => `- $${b.amount || 0} | ${b.status || 'N/A'} | ${b.description || 'N/A'} | ${b.created_date}`).join('\n')}

Generate smart alerts. For each alert provide:
- A unique short id (e.g. "alert_deal_001")
- Category: one of deal_alert, safety_alert, compliance_alert, opportunity_alert, relationship_alert, financial_alert, trend_alert
- Severity: critical, high, medium, or low
- Clear title and description
- The affected entity name
- A specific recommended action
- An action_url path (e.g. "/partnerships/123" or "/talents" or "/approvals")
- An expires_at date (ISO string, when the alert becomes irrelevant)

Also provide:
- A daily_digest: 2-3 paragraph natural language summary of the most important things to pay attention to today
- weekly_trends: array of 3-5 trend observations

Be specific with real data from above. Generate 5-15 alerts covering multiple categories. Prioritize critical/high severity for urgent items.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        alerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' }, category: { type: 'string' }, severity: { type: 'string' },
              title: { type: 'string' }, description: { type: 'string' }, affected_entity: { type: 'string' },
              recommended_action: { type: 'string' }, action_url: { type: 'string' }, expires_at: { type: 'string' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total_alerts: { type: 'number' }, critical_count: { type: 'number' },
            high_count: { type: 'number' }, action_required_count: { type: 'number' },
          },
        },
        daily_digest: { type: 'string' },
        weekly_trends: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  return new Response(JSON.stringify({ success: true, notifications: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: weekly_brief  (was generateWeeklyBrief)
// ---------------------------------------------------------------------------

async function handleWeeklyBrief(base44: any, _user: any, payload: any): Promise<Response> {
  const { user_email, user_type } = payload;

  if (!user_email || !user_type) {
    return new Response(
      JSON.stringify({ error: 'user_email and user_type are required' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const weekEnd = now.toISOString().split('T')[0];
  const weekStart = weekAgo.toISOString().split('T')[0];

  const userProfile = user_type === 'talent'
    ? await base44.entities.Talent.filter({ email: user_email }, '-created_date', 1).then((rows: any[]) => rows[0] || null).catch(() => null)
    : await base44.entities.Brand.filter({ email: user_email }, '-created_date', 1).then((rows: any[]) => rows[0] || null).catch(() => null);

  const [allPartnerships, recentOpportunities, cultureEvents, rateBenchmarks] = await Promise.all([
    user_type === 'talent' && userProfile?.id
      ? base44.entities.Partnership.filter({ talent_id: userProfile.id }, '-created_date', 100).catch(() => [])
      : user_type === 'brand' && userProfile?.id
        ? base44.entities.Partnership.filter({ brand_id: userProfile.id }, '-created_date', 100).catch(() => [])
        : base44.entities.Partnership.list('-created_date', 100).catch(() => []),
    base44.entities.MarketplaceOpportunity.list('-created_date', 50).catch(() => []),
    base44.entities.CultureEvent.list('-created_date', 30).catch(() => []),
    base44.entities.RateBenchmark.list('-created_date', 20).catch(() => []),
  ]);

  const thisWeekPartnerships = allPartnerships.filter((p: any) => p.created_at && new Date(p.created_at) >= weekAgo);
  const prevWeekPartnerships = allPartnerships.filter((p: any) => p.created_at && new Date(p.created_at) >= twoWeeksAgo && new Date(p.created_at) < weekAgo);

  const thisWeekRevenue = thisWeekPartnerships.filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + (p.deal_value || 0), 0);
  const prevWeekRevenue = prevWeekPartnerships.filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + (p.deal_value || 0), 0);

  const currentScore = user_type === 'talent' && userProfile
    ? Math.round(Math.min(parseFloat(userProfile.brand_safety_score || '50'), 100) * Math.min(parseFloat(userProfile.engagement_rate || '2'), 100) / 10)
    : allPartnerships.filter((p: any) => p.status === 'completed').length * 10;

  const scoreChange = prevWeekRevenue > 0
    ? Math.round((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue * 100)
    : thisWeekRevenue > 0 ? 20 : 0;

  const niche = (userProfile?.niche || userProfile?.expertise_areas || userProfile?.industry || userProfile?.primary_niche || '').toLowerCase();

  const matchingOpportunities = recentOpportunities
    .filter((opp: any) => {
      if (!niche) return true;
      const oppText = [opp.title, opp.description, opp.niche, opp.category, opp.requirements].filter(Boolean).join(' ').toLowerCase();
      const nicheWords = niche.split(/[\s,]+/).filter((w: string) => w.length > 3);
      return nicheWords.some((word: string) => oppText.includes(word));
    })
    .slice(0, 5);

  const thisWeekEvents = cultureEvents.filter((evt: any) => {
    const evtDate = evt.event_date || evt.date || evt.start_date;
    if (!evtDate) return false;
    const d = new Date(evtDate);
    return d >= weekAgo && d <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  }).slice(0, 5);

  const activeDeals = allPartnerships.filter((p: any) => p.status === 'active');
  const stalledDeals = allPartnerships.filter((p: any) => {
    if (!['negotiating', 'proposed', 'active'].includes(p.status)) return false;
    const updatedAt = p.updated_at || p.created_at;
    if (!updatedAt) return false;
    return (now.getTime() - new Date(updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;
  });

  const benchmarkContext = rateBenchmarks.slice(0, 5).map((b: any) => `${b.category || 'General'}: $${b.min_rate || 0}-$${b.max_rate || 0}`).join(', ');

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
  : '- No specific matching opportunities found this week'}

CULTURE EVENTS THIS WEEK/NEXT:
${thisWeekEvents.length > 0
  ? thisWeekEvents.map((e: any) => `- ${e.name || e.title}: ${new Date(e.event_date || e.date || e.start_date).toLocaleDateString()} - ${e.description?.slice(0, 80) || ''}`).join('\n')
  : '- No major culture events this week'}

MARKET BENCHMARKS:
${benchmarkContext || 'Standard industry rates'}

Generate a personalized, specific, actionable weekly brief. Be concise but valuable. Reference their actual data.`;

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
          properties: { current_score: { type: 'number' }, change_percent: { type: 'number' }, direction: { type: 'string' }, summary: { type: 'string' } },
        },
        top_opportunities: {
          type: 'array',
          items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, potential_value: { type: 'string' }, urgency: { type: 'string' }, action: { type: 'string' } } },
        },
        market_trends: {
          type: 'array',
          items: { type: 'object', properties: { trend: { type: 'string' }, impact: { type: 'string' }, opportunity: { type: 'string' } } },
        },
        one_recommendation: {
          type: 'object',
          properties: { title: { type: 'string' }, description: { type: 'string' }, expected_impact: { type: 'string' }, timeframe: { type: 'string' } },
        },
        alerts: {
          type: 'array',
          items: { type: 'object', properties: { type: { type: 'string' }, message: { type: 'string' }, severity: { type: 'string' } } },
        },
        week_summary: { type: 'string' },
      },
    },
  });

  return new Response(JSON.stringify({ success: true, brief: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: predict_success  (was predictPartnershipSuccess)
// ---------------------------------------------------------------------------

async function handlePredictSuccess(base44: any, _user: any, payload: any): Promise<Response> {
  const { partnership_id } = payload;
  if (!partnership_id) return new Response(JSON.stringify({ error: 'partnership_id required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const partnerships = await base44.entities.Partnership.list('-created_date', 200);
  const partnership = partnerships.find((p: any) => p.id === partnership_id);
  if (!partnership) return new Response(JSON.stringify({ error: 'Partnership not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const completedDeals = partnerships.filter((p: any) => p.status === 'completed');
  const churnedDeals = partnerships.filter((p: any) => p.status === 'churned');
  const allWithScores = partnerships.filter((p: any) => p.match_score);

  const byType: Record<string, any> = {};
  for (const p of partnerships) {
    if (!p.partnership_type) continue;
    if (!byType[p.partnership_type]) byType[p.partnership_type] = { total: 0, completed: 0, churned: 0 };
    byType[p.partnership_type].total++;
    if (p.status === 'completed') byType[p.partnership_type].completed++;
    if (p.status === 'churned') byType[p.partnership_type].churned++;
  }

  let talent = null;
  if (partnership.talent_id) {
    const talents = await base44.entities.Talent.list('-created_date', 200);
    talent = talents.find((t: any) => t.id === partnership.talent_id);
  }

  const avgMatchScore = allWithScores.length
    ? (allWithScores.reduce((s: number, p: any) => s + p.match_score, 0) / allWithScores.length).toFixed(1)
    : 'N/A';

  const typeStats = byType[partnership.partnership_type] || { total: 0, completed: 0, churned: 0 };
  const typeSuccessRate = typeStats.total > 0 ? ((typeStats.completed / typeStats.total) * 100).toFixed(0) : 'N/A';

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

Based on all of this data, provide a thorough prediction analysis. Be specific and data-driven.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    agent_name: 'partnership_predictor',
    response_json_schema: {
      type: 'object',
      properties: {
        success_probability: { type: 'number' }, confidence: { type: 'string' },
        verdict: { type: 'string' }, verdict_label: { type: 'string' }, headline: { type: 'string' },
        key_strengths: { type: 'array', items: { type: 'string' } },
        risk_factors: { type: 'array', items: { type: 'string' } },
        recommended_actions: { type: 'array', items: { type: 'string' } },
        comparable_deal_insight: { type: 'string' },
      },
    },
  });

  return new Response(JSON.stringify({ success: true, prediction: result, partnership_title: partnership.title }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: predict_talent_value  (was predictTalentValueTrajectory)
// ---------------------------------------------------------------------------

async function handlePredictTalentValue(base44: any, _user: any, payload: any): Promise<Response> {
  const { talent_id } = payload;
  if (!talent_id) return new Response(JSON.stringify({ error: 'talent_id required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const talents = await base44.entities.Talent.list('-created_date', 200);
  const talent = talents.find((t: any) => t.id === talent_id);
  if (!talent) return new Response(JSON.stringify({ error: 'Talent not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const allPartnerships = await base44.entities.Partnership.list('-created_date', 500);
  const talentPartnerships = allPartnerships.filter((p: any) => p.talent_id === talent_id);

  const cohort = talents.filter((t: any) => t.id !== talent_id && (t.niche === talent.niche || t.tier === talent.tier) && t.total_followers > 0);
  const cohortAvgEngagement = cohort.length ? (cohort.reduce((s: number, t: any) => s + (t.engagement_rate || 0), 0) / cohort.length).toFixed(2) : null;
  const cohortAvgFollowers = cohort.length ? Math.round(cohort.reduce((s: number, t: any) => s + (t.total_followers || 0), 0) / cohort.length) : null;
  const cohortAvgAlpha = cohort.length ? (cohort.reduce((s: number, t: any) => s + (t.discovery_alpha_score || 0), 0) / cohort.length).toFixed(1) : null;

  const completedDeals = talentPartnerships.filter((p: any) => p.status === 'completed');
  const activeDeals = talentPartnerships.filter((p: any) => p.status === 'active');
  const totalDealValue = talentPartnerships.reduce((s: number, p: any) => s + (p.deal_value || 0), 0);
  const avgMatchScore = talentPartnerships.length ? (talentPartnerships.reduce((s: number, p: any) => s + (p.match_score || 0), 0) / talentPartnerships.length).toFixed(1) : null;

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
- Current Discovery Alpha Score: ${talent.discovery_alpha_score || 'Unknown'}/100
- Location: ${talent.location || 'Unknown'}
- Current Rate per Post: $${talent.rate_per_post?.toLocaleString() || 'Unknown'}
- Availability: ${talent.availability_status || 'Unknown'}
- Languages: ${talent.languages || 'Unknown'}
- Avg Likes: ${talent.avg_likes?.toLocaleString() || 'Unknown'}
- Avg Comments: ${talent.avg_comments?.toLocaleString() || 'Unknown'}
- Avg Views: ${talent.avg_views?.toLocaleString() || 'Unknown'}

**Partnership History (${talentPartnerships.length} total deals):**
- Completed deals: ${completedDeals.length}
- Active deals: ${activeDeals.length}
- Total deal value: $${totalDealValue.toLocaleString()}
- Average match score: ${avgMatchScore || 'N/A'}
- Deal types: ${[...new Set(talentPartnerships.map((p: any) => p.partnership_type).filter(Boolean))].join(', ') || 'None recorded'}
- Recent partners: ${talentPartnerships.slice(0, 5).map((p: any) => p.brand_name || 'Unknown').join(', ') || 'None'}

**Niche/Tier Cohort Benchmarks (${cohort.length} similar talents):**
- Cohort avg engagement rate: ${cohortAvgEngagement ? cohortAvgEngagement + '%' : 'N/A'}
- Cohort avg followers: ${cohortAvgFollowers ? cohortAvgFollowers.toLocaleString() : 'N/A'}
- Cohort avg alpha score: ${cohortAvgAlpha || 'N/A'}

Based on all this data, produce a comprehensive talent value trajectory prediction. Be specific, data-driven, and actionable for brands evaluating whether to partner NOW vs later.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        trajectory_prediction: { type: 'string' }, trajectory_label: { type: 'string' },
        trajectory_reasoning: { type: 'string' }, discovery_alpha_score: { type: 'number' },
        alpha_reasoning: { type: 'string' }, current_market_value: { type: 'number' },
        predicted_market_value_6m: { type: 'number' }, predicted_market_value_12m: { type: 'number' },
        value_upside_pct: { type: 'number' }, follower_growth_projection: { type: 'string' },
        predicted_followers_6m: { type: 'number' }, predicted_followers_12m: { type: 'number' },
        engagement_outlook: { type: 'string' }, brand_fit_niches: { type: 'array', items: { type: 'string' } },
        partnership_type_recommendations: { type: 'array', items: { type: 'string' } },
        ideal_deal_structure: { type: 'string' }, urgency: { type: 'string' },
        urgency_label: { type: 'string' }, urgency_reasoning: { type: 'string' },
        risk_factors: { type: 'array', items: { type: 'string' } },
        growth_catalysts: { type: 'array', items: { type: 'string' } },
        competitive_context: { type: 'string' }, headline: { type: 'string' },
      }
    }
  });

  return new Response(JSON.stringify({ success: true, prediction: result, talent_name: talent.name }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: forecast_revenue  (was forecastRevenue)
// ---------------------------------------------------------------------------

async function handleForecastRevenue(base44: any, _user: any, payload: any): Promise<Response> {
  const { timeframe } = payload;
  const validTimeframes = [30, 60, 90, 180];
  const days = validTimeframes.includes(timeframe) ? timeframe : 90;

  const [partnerships, billingHistory, talents, rateBenchmarks, roiBenchmarks] = await Promise.all([
    base44.entities.Partnership.list('-created_date', 500),
    base44.entities.BillingHistory.list('-created_date', 500),
    base44.entities.Talent.list('-created_date', 500),
    base44.entities.RateBenchmark.list('-created_date', 200),
    base44.entities.ROIBenchmark.list('-created_date', 200),
  ]);

  const totalDeals = partnerships.length;
  const completedDeals = partnerships.filter((p: any) => p.status === 'completed');
  const activeDeals = partnerships.filter((p: any) => p.status === 'active');
  const contractedDeals = partnerships.filter((p: any) => p.status === 'contracted');
  const proposalDeals = partnerships.filter((p: any) => p.status === 'proposal');
  const outreachDeals = partnerships.filter((p: any) => p.status === 'outreach');
  const churnedDeals = partnerships.filter((p: any) => p.status === 'churned');

  const conversionRate = totalDeals > 0 ? ((completedDeals.length + activeDeals.length + contractedDeals.length) / totalDeals * 100).toFixed(1) : 0;
  const proposalToCloseRate = proposalDeals.length + completedDeals.length + contractedDeals.length > 0
    ? ((completedDeals.length + contractedDeals.length) / (proposalDeals.length + completedDeals.length + contractedDeals.length) * 100).toFixed(1) : 0;
  const churnRate = totalDeals > 0 ? (churnedDeals.length / totalDeals * 100).toFixed(1) : 0;

  const dealsWithValue = partnerships.filter((p: any) => p.deal_value && p.deal_value > 0);
  const avgDealValue = dealsWithValue.length ? Math.round(dealsWithValue.reduce((s: number, p: any) => s + p.deal_value, 0) / dealsWithValue.length) : 0;
  const completedDealValues = completedDeals.filter((p: any) => p.deal_value > 0);
  const avgCompletedDealValue = completedDealValues.length ? Math.round(completedDealValues.reduce((s: number, p: any) => s + p.deal_value, 0) / completedDealValues.length) : avgDealValue;
  const maxDealValue = dealsWithValue.length ? Math.max(...dealsWithValue.map((p: any) => p.deal_value)) : 0;
  const minDealValue = dealsWithValue.length ? Math.min(...dealsWithValue.map((p: any) => p.deal_value)) : 0;

  const dealsByType: Record<string, { count: number; total: number; completed: number }> = {};
  for (const p of partnerships) {
    const t = p.partnership_type || 'unknown';
    if (!dealsByType[t]) dealsByType[t] = { count: 0, total: 0, completed: 0 };
    dealsByType[t].count++;
    dealsByType[t].total += p.deal_value || 0;
    if (p.status === 'completed' || p.status === 'active') dealsByType[t].completed++;
  }

  const typeBreakdown = Object.entries(dealsByType).map(([type, stats]) => ({
    type, count: stats.count,
    avgValue: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
    successRate: stats.count > 0 ? ((stats.completed / stats.count) * 100).toFixed(0) : '0',
  }));

  const dealsByMonth: Record<number, { count: number; revenue: number }> = {};
  for (const p of partnerships) {
    if (!p.created_date && !p.created_at) continue;
    const month = new Date(p.created_date || p.created_at).getMonth();
    if (!dealsByMonth[month]) dealsByMonth[month] = { count: 0, revenue: 0 };
    dealsByMonth[month].count++;
    dealsByMonth[month].revenue += p.deal_value || 0;
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalData = monthNames.map((name, i) => ({ month: name, deals: dealsByMonth[i]?.count || 0, revenue: dealsByMonth[i]?.revenue || 0 }));

  const pipelineDeals = partnerships.filter((p: any) => ['outreach', 'proposal', 'negotiation', 'contracted'].includes(p.status));
  const totalPipelineValue = pipelineDeals.reduce((s: number, p: any) => s + (p.deal_value || 0), 0);
  const pipelineByStage: Record<string, any[]> = {
    outreach: pipelineDeals.filter((p: any) => p.status === 'outreach'),
    proposal: pipelineDeals.filter((p: any) => p.status === 'proposal'),
    negotiation: pipelineDeals.filter((p: any) => p.status === 'negotiation'),
    contracted: pipelineDeals.filter((p: any) => p.status === 'contracted'),
  };

  const weights: Record<string, number> = { outreach: 0.1, proposal: 0.25, negotiation: 0.5, contracted: 0.8 };
  const weightedPipeline = Object.entries(pipelineByStage).reduce((total, [stage, deals]) => {
    return total + deals.reduce((s: number, d: any) => s + (d.deal_value || 0) * (weights[stage] || 0), 0);
  }, 0);

  const totalRevenue = billingHistory.reduce((s: number, b: any) => s + (b.amount || 0), 0);
  const recentBilling = billingHistory.slice(0, 12);
  const avgMonthlyRevenue = recentBilling.length ? Math.round(recentBilling.reduce((s: number, b: any) => s + (b.amount || 0), 0) / Math.max(recentBilling.length, 1)) : 0;

  const availableTalents = talents.filter((t: any) => t.availability_status === 'available');
  const topTierTalents = talents.filter((t: any) => t.tier === 'mega' || t.tier === 'macro');
  const talentsWithRate = talents.filter((t: any) => t.rate_per_post > 0);
  const avgTalentRate = talentsWithRate.length ? Math.round(talentsWithRate.reduce((s: number, t: any) => s + t.rate_per_post, 0) / talentsWithRate.length) : 0;

  const benchmarkSummary = rateBenchmarks.slice(0, 5).map((r: any) => ({ platform: r.platform || 'Unknown', tier: r.tier || 'Unknown', avgRate: r.average_rate || r.avg_rate || 0 }));
  const roiSummary = roiBenchmarks.slice(0, 5).map((r: any) => ({ dealType: r.deal_type || 'Unknown', medianROI: r.median_roi || 0, topQuartileROI: r.top_quartile_roi || 0 }));

  const prompt = `You are a senior revenue forecasting analyst for an influencer marketing platform (Deal Stage).

Generate a comprehensive revenue forecast for the next ${days} days based on all available data.

**Historical Deal Data (${totalDeals} total partnerships):**
- Completed: ${completedDeals.length}, Active: ${activeDeals.length}, Contracted: ${contractedDeals.length}
- In proposal: ${proposalDeals.length}, Outreach: ${outreachDeals.length}, Churned: ${churnedDeals.length}
- Overall conversion rate: ${conversionRate}%, Proposal-to-close: ${proposalToCloseRate}%, Churn: ${churnRate}%

**Deal Value Statistics:**
- Avg deal value: $${avgDealValue.toLocaleString()}, Avg completed: $${avgCompletedDealValue.toLocaleString()}
- Range: $${minDealValue.toLocaleString()} - $${maxDealValue.toLocaleString()}

**Deal Breakdown by Type:**
${typeBreakdown.map(t => `- ${t.type}: ${t.count} deals, avg $${t.avgValue.toLocaleString()}, success ${t.successRate}%`).join('\n')}

**Current Pipeline (${pipelineDeals.length} deals):**
- Total: $${totalPipelineValue.toLocaleString()}, Weighted: $${Math.round(weightedPipeline).toLocaleString()}

**Seasonal Patterns:**
${seasonalData.map(s => `- ${s.month}: ${s.deals} deals, $${s.revenue.toLocaleString()}`).join('\n')}

**Billing:** Total historical: $${totalRevenue.toLocaleString()}, Avg monthly: $${avgMonthlyRevenue.toLocaleString()}

**Talent Capacity:** ${talents.length} total, ${availableTalents.length} available, ${topTierTalents.length} top-tier, avg rate $${avgTalentRate.toLocaleString()}

**Market Benchmarks:**
Rates: ${benchmarkSummary.map((b: any) => `${b.platform}/${b.tier}: $${b.avgRate}`).join(', ') || 'N/A'}
ROI: ${roiSummary.map((r: any) => `${r.dealType}: ${r.medianROI}x median, ${r.topQuartileROI}x top`).join(', ') || 'N/A'}

Generate a ${days}-day revenue forecast. Be specific, data-driven, and realistic.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        forecast_period: { type: 'string' }, generated_at: { type: 'string' },
        revenue_projections: { type: 'object', properties: { conservative: { type: 'number' }, moderate: { type: 'number' }, aggressive: { type: 'number' }, confidence_level: { type: 'number' } } },
        monthly_breakdown: { type: 'array', items: { type: 'object', properties: { month: { type: 'string' }, projected_revenue: { type: 'number' }, deal_count: { type: 'number' }, confidence: { type: 'number' } } } },
        pipeline_analysis: { type: 'object', properties: { total_pipeline_value: { type: 'number' }, weighted_pipeline: { type: 'number' }, conversion_probability: { type: 'number' } } },
        revenue_drivers: { type: 'array', items: { type: 'object', properties: { driver: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' } } } },
        risk_factors: { type: 'array', items: { type: 'object', properties: { risk: { type: 'string' }, probability: { type: 'string' }, revenue_impact: { type: 'number' } } } },
        seasonal_adjustments: { type: 'array', items: { type: 'object', properties: { period: { type: 'string' }, adjustment_factor: { type: 'number' }, reason: { type: 'string' } } } },
        growth_opportunities: { type: 'array', items: { type: 'object', properties: { opportunity: { type: 'string' }, potential_revenue: { type: 'number' }, effort_level: { type: 'string' }, timeline: { type: 'string' } } } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  return new Response(JSON.stringify({ success: true, forecast: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: forecast_outreach  (was forecastOutreachConversion)
// ---------------------------------------------------------------------------

async function handleForecastOutreach(base44: any, _user: any, payload: any): Promise<Response> {
  const { sequence_id } = payload;
  if (!sequence_id) return new Response(JSON.stringify({ error: 'sequence_id required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const sequences = await base44.entities.OutreachSequence.list('-created_date', 200);
  const seq = sequences.find((s: any) => s.id === sequence_id);
  if (!seq) return new Response(JSON.stringify({ error: 'Sequence not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  let steps: any[] = [];
  try { steps = JSON.parse(seq.steps || '[]'); } catch {}

  const allSequences = sequences.filter((s: any) => s.total_sent > 0);
  const avgOpenRate = allSequences.length ? (allSequences.reduce((s: number, x: any) => s + (x.open_rate || 0), 0) / allSequences.length).toFixed(1) : 0;
  const avgReplyRate = allSequences.length ? (allSequences.reduce((s: number, x: any) => s + (x.reply_rate || 0), 0) / allSequences.length).toFixed(1) : 0;

  const topSeqs = [...allSequences].sort((a: any, b: any) => (b.reply_rate || 0) - (a.reply_rate || 0)).slice(0, 3);

  let contactHistory: any[] = [];
  if (seq.target_email) {
    const emails = await base44.entities.OutreachEmail.filter({ to_email: seq.target_email });
    contactHistory = emails;
  }

  let talent = null;
  if (seq.target_name) {
    const talents = await base44.entities.Talent.list('-created_date', 200);
    talent = talents.find((t: any) => t.name?.toLowerCase().includes(seq.target_name.toLowerCase()) || seq.target_name.toLowerCase().includes(t.name?.toLowerCase() || ''));
  }

  let brand = null;
  if (seq.target_company) {
    const brands = await base44.entities.Brand.list('-created_date', 200);
    brand = brands.find((b: any) => b.name?.toLowerCase().includes(seq.target_company.toLowerCase()) || seq.target_company.toLowerCase().includes(b.name?.toLowerCase() || ''));
  }

  const stepSummaries = steps.map((s: any, i: number) => ({
    step: i + 1, type: s.email_type, delay_days: s.delay_days,
    subject_length: s.subject?.length || 0, body_word_count: s.body ? s.body.split(/\s+/).length : 0,
    has_personalization: !!(s.body?.includes('{{') || s.subject?.includes('{{')),
    subject_preview: s.subject?.slice(0, 80) || '(no subject)',
  }));

  const prompt = `You are an expert outreach conversion analyst for an influencer marketing platform.

Analyze the following outreach sequence and forecast its conversion likelihood.

**Sequence Details:**
- Name: ${seq.name}
- Target: ${seq.target_name || 'Unknown'} (${seq.target_email || 'no email'})
- Company: ${seq.target_company || 'Unknown'}
- Steps: ${steps.length}
${stepSummaries.map((s: any) => `  Step ${s.step}: ${s.type} | delay +${s.delay_days}d | "${s.subject_preview}" | ${s.body_word_count} words | personalization: ${s.has_personalization}`).join('\n')}

**Talent Profile:** ${talent ? `${talent.name}, ${talent.total_followers?.toLocaleString()} followers, ${talent.engagement_rate}% engagement, ${talent.tier} tier` : 'No linked talent'}

**Brand Profile:** ${brand ? `${brand.industry}, ${brand.company_size}, budget $${brand.annual_budget?.toLocaleString() || 'Unknown'}` : 'No linked brand'}

**Contact History:** ${contactHistory.length > 0 ? contactHistory.slice(0, 5).map((e: any) => `${e.email_type}: ${e.status}`).join(', ') : 'No prior contact'}

**Platform Benchmarks:** Avg open: ${avgOpenRate}%, Avg reply: ${avgReplyRate}%, Top reply rates: ${topSeqs.map((s: any) => `${s.reply_rate}%`).join(', ') || 'N/A'}

Provide a detailed conversion forecast.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        conversion_probability: { type: 'number' }, projected_open_rate: { type: 'number' },
        projected_reply_rate: { type: 'number' }, confidence: { type: 'string' },
        verdict: { type: 'string' }, verdict_label: { type: 'string' }, headline: { type: 'string' },
        strongest_step: { type: 'number' }, weakest_step: { type: 'number' },
        step_forecasts: { type: 'array', items: { type: 'object', properties: { step: { type: 'number' }, type: { type: 'string' }, projected_open_rate: { type: 'number' }, projected_reply_rate: { type: 'number' }, assessment: { type: 'string' } } } },
        conversion_drivers: { type: 'array', items: { type: 'string' } },
        conversion_blockers: { type: 'array', items: { type: 'string' } },
        optimization_tips: { type: 'array', items: { type: 'string' } },
        best_send_time: { type: 'string' },
        similar_sequence_benchmark: { type: 'string' },
      }
    }
  });

  return new Response(JSON.stringify({ success: true, forecast: result, sequence_name: seq.name }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: predict_pricing  (was recommendOptimalPricing)
// ---------------------------------------------------------------------------

async function handlePredictPricing(base44: any, _user: any, payload: any): Promise<Response> {
  const { partnership_id } = payload;
  if (!partnership_id) return new Response(JSON.stringify({ error: 'partnership_id required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const partnerships = await base44.entities.Partnership.list('-created_date', 500);
  const deal = partnerships.find((p: any) => p.id === partnership_id);
  if (!deal) return new Response(JSON.stringify({ error: 'Partnership not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const [talents, brands, roiBenchmarks, dealNotes, allProposals] = await Promise.all([
    base44.entities.Talent.list('-created_date', 200),
    base44.entities.Brand.list('-created_date', 200),
    base44.entities.ROIBenchmark.list('-created_date', 100),
    base44.entities.DealNote.filter({ partnership_id }),
    base44.entities.PartnershipProposal.list('-created_date', 200),
  ]);

  const talent = talents.find((t: any) => t.id === deal.talent_id);
  const brand = brands.find((b: any) => b.id === deal.brand_id);

  const comparableDeals = partnerships.filter((p: any) =>
    p.id !== partnership_id && p.deal_value > 0 &&
    (p.status === 'completed' || p.status === 'contracted' || p.status === 'active') &&
    (p.partnership_type === deal.partnership_type || (talent && talents.find((t: any) => t.id === p.talent_id)?.tier === talent.tier))
  );

  const avgComparableValue = comparableDeals.length
    ? Math.round(comparableDeals.reduce((s: number, p: any) => s + (p.deal_value || 0), 0) / comparableDeals.length) : null;

  const relatedProposals = allProposals.filter((p: any) => p.brand_id === deal.brand_id || p.talent_id === deal.talent_id);

  const dealTypeMap: Record<string, string> = {
    sponsorship: 'sponsored_post', ambassador: 'brand_ambassador', affiliate: 'sponsored_post',
    content_creation: 'sponsored_post', event: 'brand_ambassador', product_seeding: 'sponsored_post', licensing: 'licensing_deal',
  };
  const roiKey = dealTypeMap[deal.partnership_type] || 'sponsored_post';
  const relevantROI = roiBenchmarks.find((r: any) => r.deal_type === roiKey);

  const prompt = `You are a senior partnership deal pricing strategist for an influencer marketing platform.
Recommend optimal pricing for the following partnership deal based on all available data.

**Partnership Deal:**
- Title: ${deal.title}, Type: ${deal.partnership_type || 'Unknown'}, Current value: ${deal.deal_value ? '$' + deal.deal_value.toLocaleString() : 'Not set'}
- Stage: ${deal.status}, Match score: ${deal.match_score || 'Unknown'}/100

**Talent:** ${talent ? `${talent.name}, ${talent.tier}, ${talent.primary_platform}, ${talent.total_followers?.toLocaleString()} followers, ${talent.engagement_rate}% engagement, rate $${talent.rate_per_post?.toLocaleString() || 'Unknown'}` : 'No linked talent'}

**Brand:** ${brand ? `${brand.name}, ${brand.industry}, budget $${brand.annual_budget?.toLocaleString() || 'Unknown'}` : 'No linked brand'}

**Deal Notes:** ${dealNotes.slice(0, 5).map((n: any) => `[${n.note_type}] ${n.content?.slice(0, 150)}`).join('; ') || 'No notes'}

**ROI Benchmark:** ${relevantROI ? `Median ${relevantROI.median_roi}x, Top quartile ${relevantROI.top_quartile_roi}x` : 'N/A'}

**Comparable Deals (${comparableDeals.length}):** Avg $${avgComparableValue ? avgComparableValue.toLocaleString() : 'N/A'}, Range ${comparableDeals.length > 0 ? '$' + Math.min(...comparableDeals.map((p: any) => p.deal_value)).toLocaleString() + ' - $' + Math.max(...comparableDeals.map((p: any) => p.deal_value)).toLocaleString() : 'N/A'}

**Proposals History (${relatedProposals.length}):** ${relatedProposals.slice(0, 4).map((p: any) => `${p.title}: ${p.status}, $${p.budget?.toLocaleString() || 'N/A'}`).join('; ') || 'None'}

Provide optimal pricing recommendations. Be specific and data-driven.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        recommended_price: { type: 'number' }, price_floor: { type: 'number' }, price_ceiling: { type: 'number' },
        confidence: { type: 'string' }, pricing_rationale: { type: 'string' },
        value_drivers: { type: 'array', items: { type: 'string' } },
        negotiation_anchors: { type: 'array', items: { type: 'string' } },
        discount_risk: { type: 'string' }, discount_risk_reason: { type: 'string' },
        optimal_deal_structure: { type: 'string' }, comparable_context: { type: 'string' },
        roi_projection: { type: 'string' }, urgency_note: { type: 'string' },
      }
    }
  });

  return new Response(JSON.stringify({ success: true, pricing: result, deal_title: deal.title }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: negotiation  (was analyzeNegotiationCoach)
// ---------------------------------------------------------------------------

async function handleNegotiation(base44: any, _user: any, payload: any): Promise<Response> {
  const { partnership_id } = payload;

  const [partnerships, proposals, benchmarks, roiBenchmarks] = await Promise.all([
    base44.entities.Partnership.list('-created_date', 300),
    base44.entities.PartnershipProposal.list('-created_date', 100),
    base44.entities.RateBenchmark.list('-created_date', 50),
    base44.entities.ROIBenchmark.list('-created_date', 30),
  ]);

  if (partnerships.length === 0) {
    return new Response(JSON.stringify({ error: 'No partnership data found.' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const deal = partnership_id
    ? partnerships.find((p: any) => p.id === partnership_id)
    : partnerships.find((p: any) => ['negotiating', 'outreach_sent', 'responded'].includes(p.status)) || partnerships[0];
  const completedDeals = partnerships.filter((p: any) => ['completed', 'active'].includes(p.status));
  const avgDealValue = completedDeals.reduce((s: number, d: any) => s + (d.deal_value || 0), 0) / (completedDeals.length || 1);

  const prompt = `You are a Negotiation Coach AI Agent for influencer partnership deals.

CURRENT NEGOTIATION:
${deal ? `- Deal: ${deal.talent_name || 'Creator'} x ${deal.brand_name || 'Brand'}
- Status: ${deal.status}
- Current Value: $${deal.deal_value || 'TBD'}
- Type: ${deal.partnership_type || 'Not specified'}
- Match Score: ${deal.match_score || 'N/A'}` : 'General negotiation guidance'}

HISTORICAL CONTEXT:
- Completed deals: ${completedDeals.length}
- Average deal value: $${avgDealValue.toFixed(0)}
- Active proposals: ${proposals.length}

RATE BENCHMARKS:
${benchmarks.slice(0, 5).map((b: any) => `- ${b.tier}: $${b.sponsored_post_min}-$${b.sponsored_post_max} (posts), $${b.brand_deal_min}-$${b.brand_deal_max} (deals)`).join('\n')}

ROI BENCHMARKS:
${roiBenchmarks.slice(0, 5).map((r: any) => `- ${r.deal_type}: Median ${r.median_roi}x, Top ${r.top_quartile_roi}x`).join('\n')}

Provide real-time negotiation coaching:
1. BATNA analysis
2. Optimal counter-offer strategy
3. Leverage points and concessions matrix
4. Walk-away thresholds
5. Value-add suggestions
6. Objection handling playbook
7. Closing tactics`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        batna_analysis: { type: 'object', properties: { your_batna: { type: 'string' }, their_likely_batna: { type: 'string' }, zone_of_possible_agreement: { type: 'string' }, power_balance: { type: 'string' } } },
        counter_offer_strategy: { type: 'object', properties: { recommended_offer: { type: 'string' }, anchor_price: { type: 'string' }, justification_talking_points: { type: 'array', items: { type: 'string' } }, concession_sequence: { type: 'array', items: { type: 'object', properties: { round: { type: 'string' }, concession: { type: 'string' }, ask_in_return: { type: 'string' } } } } } },
        leverage_points: { type: 'array', items: { type: 'object', properties: { leverage: { type: 'string' }, strength: { type: 'string' }, how_to_use: { type: 'string' } } } },
        walk_away_thresholds: { type: 'object', properties: { price_floor: { type: 'string' }, deal_breakers: { type: 'array', items: { type: 'string' } }, warning_signs: { type: 'array', items: { type: 'string' } } } },
        value_adds: { type: 'array', items: { type: 'object', properties: { suggestion: { type: 'string' }, cost_to_you: { type: 'string' }, perceived_value: { type: 'string' } } } },
        objection_playbook: { type: 'array', items: { type: 'object', properties: { objection: { type: 'string' }, response: { type: 'string' }, follow_up: { type: 'string' } } } },
        closing_tactics: { type: 'array', items: { type: 'object', properties: { tactic: { type: 'string' }, when_to_use: { type: 'string' }, script: { type: 'string' } } } },
        top_3_actions: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return new Response(JSON.stringify({ success: true, analysis: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: localize  (was localizeContent)
// ---------------------------------------------------------------------------

async function handleLocalize(base44: any, _user: any, payload: any): Promise<Response> {
  const { content, source_language, target_languages, brand_id, content_type } = payload;

  if (!content || !source_language || !target_languages?.length) {
    return new Response(JSON.stringify({ error: 'Missing required fields: content, source_language, target_languages' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const validContentTypes = ['social_post', 'email', 'campaign_brief', 'pitch_deck', 'contract_terms'];
  if (content_type && !validContentTypes.includes(content_type)) {
    return new Response(JSON.stringify({ error: `Invalid content_type. Must be one of: ${validContentTypes.join(', ')}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let brandContext = '';
  if (brand_id) {
    try {
      const brands = await base44.entities.Brand.list('-created_date', 200);
      const brand = brands.find((b: any) => b.id === brand_id);
      if (brand) {
        brandContext = `\nBRAND VOICE & TONE GUIDELINES:\n- Brand: ${brand.name}\n- Industry: ${brand.industry || 'N/A'}\n- Target Audience: ${brand.target_audience || 'N/A'}\n- Tone of Voice: ${brand.tone_of_voice || 'N/A'}\nEnsure all localizations maintain this brand's voice across markets.`;
      }
    } catch (_e) { /* continue without brand context */ }
  }

  const contentTypeInstructions: Record<string, string> = {
    social_post: 'This is a social media post. Adapt hashtags, slang, and cultural references for each market.',
    email: 'This is an email communication. Maintain formal/informal tone as appropriate per culture.',
    campaign_brief: 'This is a campaign brief. Ensure marketing terminology translates meaningfully.',
    pitch_deck: 'This is pitch deck content. Maintain professional tone while adapting business idioms.',
    contract_terms: 'This is contract/legal content. Exercise extreme care with legal terminology.',
  };

  const typeInstruction = content_type ? contentTypeInstructions[content_type] : 'Adapt the content appropriately for each target market.';

  const prompt = `You are an expert multilingual content localization specialist with deep cultural knowledge across global markets.

SOURCE CONTENT (${source_language}):
"""
${content}
"""

CONTENT TYPE: ${content_type || 'general'}
${typeInstruction}
${brandContext}

TARGET LANGUAGES: ${target_languages.join(', ')}

For each target language, provide:
1. A culturally adapted translation (not just literal)
2. Cultural adaptations made and why
3. Sensitivity flags
4. Localized hashtag suggestions (if applicable)
5. Platform-specific adjustments
6. Confidence score (0-1)

Also provide overall cultural risk assessment, universal elements, and market-specific tips.
Ensure translations feel native, not translated.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        source_content: { type: 'string' },
        localizations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              language: { type: 'string' }, language_name: { type: 'string' }, translated_content: { type: 'string' },
              cultural_adaptations: { type: 'array', items: { type: 'string' } }, sensitivity_flags: { type: 'array', items: { type: 'string' } },
              hashtag_suggestions: { type: 'array', items: { type: 'string' } }, platform_adjustments: { type: 'string' }, confidence_score: { type: 'number' }
            }
          }
        },
        cultural_risk_assessment: {
          type: 'object',
          properties: {
            overall_risk: { type: 'string' },
            flags: { type: 'array', items: { type: 'object', properties: { issue: { type: 'string' }, severity: { type: 'string' }, recommendation: { type: 'string' } } } }
          }
        },
        universal_elements: { type: 'array', items: { type: 'string' } },
        market_specific_tips: { type: 'array', items: { type: 'object', properties: { market: { type: 'string' }, tip: { type: 'string' } } } }
      }
    }
  });

  return new Response(JSON.stringify({ success: true, localization: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: success_factors  (was identifySuccessFactors)
// ---------------------------------------------------------------------------

async function handleSuccessFactors(base44: any, _user: any, _payload: any): Promise<Response> {
  const [allPartnerships, allTalents, allBrands] = await Promise.all([
    base44.entities.Partnership.list('-updated_date', 500),
    base44.entities.Talent.list('-created_date', 300),
    base44.entities.Brand.list('-created_date', 200),
  ]);

  const successful = allPartnerships.filter((p: any) =>
    p.status === 'completed' || (p.status === 'active' && (p.match_score >= 70 || p.deal_value > 0))
  );
  const unsuccessful = allPartnerships.filter((p: any) =>
    p.status === 'churned' || (p.status !== 'completed' && p.status !== 'active' && p.match_score > 0 && p.match_score < 50)
  );

  if (successful.length < 2) {
    return new Response(JSON.stringify({
      error: 'Not enough successful partnerships to analyze. Need at least 2 completed or active deals.'
    }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const enrichDeal = (deal: any) => {
    const talent = allTalents.find((t: any) => t.id === deal.talent_id);
    const brand = allBrands.find((b: any) => b.id === deal.brand_id);
    return {
      title: deal.title, status: deal.status, partnership_type: deal.partnership_type,
      deal_value: deal.deal_value, match_score: deal.match_score, priority: deal.priority,
      talent_tier: talent?.tier, talent_niche: talent?.niche, talent_platform: talent?.primary_platform,
      talent_engagement_rate: talent?.engagement_rate, talent_followers: talent?.total_followers,
      talent_trajectory: talent?.trajectory, talent_brand_safety: talent?.brand_safety_score,
      brand_industry: brand?.industry, brand_company_size: brand?.company_size, brand_annual_budget: brand?.annual_budget,
    };
  };

  const successfulEnriched = successful.map(enrichDeal);
  const unsuccessfulEnriched = unsuccessful.map(enrichDeal);

  const freq = (arr: any[], key: string) => {
    const counts: Record<string, number> = {};
    arr.forEach((d: any) => { if (d[key]) counts[d[key]] = (counts[d[key]] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number));
  };

  const stats = {
    total_successful: successful.length,
    total_unsuccessful: unsuccessful.length,
    avg_deal_value: Math.round(successful.reduce((s: number, d: any) => s + (d.deal_value || 0), 0) / successful.length),
    avg_match_score: Math.round(successful.reduce((s: number, d: any) => s + (d.match_score || 0), 0) / successful.length),
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
- Successful: ${stats.total_successful}, Unsuccessful: ${stats.total_unsuccessful}
- Avg deal value (successful): $${stats.avg_deal_value?.toLocaleString()}
- Avg match score (successful): ${stats.avg_match_score}/100

**Attribute Frequency in Successful Deals:**
Types: ${stats.partnership_type_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Tiers: ${stats.talent_tier_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Niches: ${stats.talent_niche_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Platforms: ${stats.talent_platform_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}
Industries: ${stats.brand_industry_dist.map(([k,v]) => `${k}: ${v}`).join(', ')}

**Sample Successful Deals (up to 10):**
${successfulEnriched.slice(0, 10).map((d: any) => `- ${d.title}: ${d.partnership_type}, ${d.talent_tier} ${d.talent_niche} on ${d.talent_platform}, match=${d.match_score}, value=$${d.deal_value || 0}`).join('\n')}

${unsuccessfulEnriched.length > 0 ? `**Sample Unsuccessful Deals (up to 5):**
${unsuccessfulEnriched.slice(0, 5).map((d: any) => `- ${d.title}: ${d.partnership_type}, ${d.talent_tier} ${d.talent_niche}, match=${d.match_score}, value=$${d.deal_value || 0}`).join('\n')}` : ''}

Analyze the patterns and identify what makes partnerships succeed. Be specific and data-driven.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        headline_insight: { type: 'string' },
        success_factors: {
          type: 'array',
          items: { type: 'object', properties: { factor: { type: 'string' }, winning_value: { type: 'string' }, confidence: { type: 'string' }, impact: { type: 'string' }, explanation: { type: 'string' }, recommendation: { type: 'string' } } }
        },
        winning_profile: {
          type: 'object',
          properties: { partnership_type: { type: 'string' }, talent_tier: { type: 'string' }, talent_niche: { type: 'string' }, platform: { type: 'string' }, brand_industry: { type: 'string' }, min_match_score: { type: 'number' }, summary: { type: 'string' } }
        },
        red_flags: { type: 'array', items: { type: 'string' } },
        replication_playbook: { type: 'array', items: { type: 'string' } },
        data_quality_note: { type: 'string' },
      }
    }
  });

  return new Response(JSON.stringify({
    success: true, analysis: result,
    stats: { total_successful: stats.total_successful, total_unsuccessful: stats.total_unsuccessful, avg_deal_value: stats.avg_deal_value, avg_match_score: stats.avg_match_score }
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ---------------------------------------------------------------------------
// MAIN ROUTER
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json().catch(() => ({}));
    const action: AIAction = payload.action;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: `Missing or invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    switch (action) {
      case 'campaign_brief':       return await handleCampaignBrief(base44, user, payload);
      case 'creative':             return await handleCreative(base44, user, payload);
      case 'executive_briefing':   return await handleExecutiveBriefing(base44, user, payload);
      case 'outreach':             return await handleOutreach(base44, user, payload);
      case 'alerts':               return await handleAlerts(base44, user, payload);
      case 'weekly_brief':         return await handleWeeklyBrief(base44, user, payload);
      case 'predict_success':      return await handlePredictSuccess(base44, user, payload);
      case 'predict_talent_value': return await handlePredictTalentValue(base44, user, payload);
      case 'forecast_revenue':     return await handleForecastRevenue(base44, user, payload);
      case 'forecast_outreach':    return await handleForecastOutreach(base44, user, payload);
      case 'predict_pricing':      return await handlePredictPricing(base44, user, payload);
      case 'negotiation':          return await handleNegotiation(base44, user, payload);
      case 'localize':             return await handleLocalize(base44, user, payload);
      case 'success_factors':      return await handleSuccessFactors(base44, user, payload);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }
  } catch (error) {
    console.error('[ai-generate] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
