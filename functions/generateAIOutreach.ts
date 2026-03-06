import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { talent_id, brand_id, campaign_type } = await req.json();

    if (!talent_id || !brand_id || !campaign_type) {
      return Response.json({ error: 'Missing required fields: talent_id, brand_id, campaign_type' }, { status: 400 });
    }

    const validTypes = ['cold_outreach', 'warm_followup', 're_engagement', 'upsell', 'event_collab'];
    if (!validTypes.includes(campaign_type)) {
      return Response.json({ error: `Invalid campaign_type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    // Fetch all relevant data in parallel
    const [talents, brands, partnerships, emails, activities] = await Promise.all([
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.Brand.list('-created_date', 200),
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.OutreachEmail.list('-created_date', 300),
      base44.entities.Activity.list('-created_date', 500),
    ]);

    const talent = talents.find((t: any) => t.id === talent_id);
    const brand = brands.find((b: any) => b.id === brand_id);

    if (!talent) return Response.json({ error: 'Talent not found' }, { status: 404 });
    if (!brand) return Response.json({ error: 'Brand not found' }, { status: 404 });

    // Find partnership history between this talent and brand
    const partnershipHistory = partnerships.filter(
      (p: any) => (p.talent_name === talent.full_name || p.talent_id === talent_id) &&
                   (p.brand_name === brand.company_name || p.brand_id === brand_id)
    );

    // Find prior emails related to this talent or brand
    const relatedEmails = emails.filter(
      (e: any) => e.talent_id === talent_id || e.brand_id === brand_id ||
                   e.recipient_name === talent.full_name || e.brand_name === brand.company_name
    );

    // Find related activities
    const relatedActivities = activities.filter(
      (a: any) => a.talent_id === talent_id || a.brand_id === brand_id
    );

    // Compute relationship health signals
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
                personalization_hooks: {
                  type: 'array',
                  items: { type: 'string' }
                },
                cta: { type: 'string' }
              }
            }
          },
          a_b_variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                email_number: { type: 'number' },
                variant: { type: 'string' },
                subject_line: { type: 'string' },
                body_changes: { type: 'string' }
              }
            }
          },
          optimal_send_times: {
            type: 'object',
            properties: {
              best_days: { type: 'string' },
              best_time_range: { type: 'string' },
              timezone_note: { type: 'string' },
              reasoning: { type: 'string' }
            }
          },
          expected_metrics: {
            type: 'object',
            properties: {
              open_rate: { type: 'string' },
              reply_rate: { type: 'string' },
              conversion_rate: { type: 'string' }
            }
          },
          follow_up_triggers: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({ success: true, outreach: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
