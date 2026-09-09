import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { partnership_id } = body;

    const [partnerships, talents, brands] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 100),
      base44.entities.Talent.list('-created_date', 100),
      base44.entities.Brand.list('-created_date', 50),
    ]);

    if (partnerships.length === 0) {
      return Response.json({ error: 'No partnership data found.' }, { status: 400 });
    }

    const deal = partnership_id ? partnerships.find(p => p.id === partnership_id) : partnerships[0];
    const talent = deal ? talents.find(t => t.name === deal.talent_name) : talents[0];
    const brand = deal ? brands.find(b => b.name === deal.brand_name) : brands[0];

    const prompt = `You are a Content Brief & Creative Direction AI Agent for influencer partnerships.

PARTNERSHIP:
${deal ? `- ${deal.talent_name || 'Creator'} × ${deal.brand_name || 'Brand'}
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

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
