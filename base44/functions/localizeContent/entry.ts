import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { content, source_language, target_languages, brand_id, content_type } = body;

    if (!content || !source_language || !target_languages?.length) {
      return Response.json({ error: 'Missing required fields: content, source_language, target_languages' }, { status: 400 });
    }

    const validContentTypes = ['social_post', 'email', 'campaign_brief', 'pitch_deck', 'contract_terms'];
    if (content_type && !validContentTypes.includes(content_type)) {
      return Response.json({ error: `Invalid content_type. Must be one of: ${validContentTypes.join(', ')}` }, { status: 400 });
    }

    // Fetch brand data for voice/tone consistency if brand_id provided
    let brandContext = '';
    if (brand_id) {
      try {
        const brands = await base44.entities.Brand.list('-created_date', 200);
        const brand = brands.find((b: any) => b.id === brand_id);
        if (brand) {
          brandContext = `
BRAND VOICE & TONE GUIDELINES:
- Brand: ${brand.name}
- Industry: ${brand.industry || 'N/A'}
- Target Audience: ${brand.target_audience || 'N/A'}
- Preferred Niches: ${brand.preferred_niches || 'N/A'}
- Brand Values: ${brand.brand_values || 'N/A'}
- Tone of Voice: ${brand.tone_of_voice || 'N/A'}
Ensure all localizations maintain this brand's voice, tone, and positioning across markets.`;
        }
      } catch (_e) {
        // Continue without brand context if fetch fails
      }
    }

    const contentTypeInstructions: Record<string, string> = {
      social_post: 'This is a social media post. Adapt hashtags, slang, and cultural references for each market. Keep it concise and platform-appropriate.',
      email: 'This is an email communication. Maintain formal/informal tone as appropriate per culture. Adapt greetings, sign-offs, and formality levels.',
      campaign_brief: 'This is a campaign brief. Ensure marketing terminology, campaign goals, and KPIs translate meaningfully. Adapt examples to local market context.',
      pitch_deck: 'This is pitch deck content. Maintain professional tone while adapting business idioms and market references. Ensure statistics and claims are culturally relevant.',
      contract_terms: 'This is contract/legal content. Exercise extreme care with legal terminology. Flag terms that may have different legal implications across jurisdictions.',
    };

    const typeInstruction = content_type ? contentTypeInstructions[content_type] : 'Adapt the content appropriately for each target market.';

    const targetLangList = target_languages.join(', ');

    const prompt = `You are an expert multilingual content localization specialist with deep cultural knowledge across global markets.

SOURCE CONTENT (${source_language}):
"""
${content}
"""

CONTENT TYPE: ${content_type || 'general'}
${typeInstruction}
${brandContext}

TARGET LANGUAGES: ${targetLangList}

For each target language, provide:
1. A culturally adapted translation (not just literal translation)
2. Cultural adaptations made and why
3. Any sensitivity flags (religious, political, social taboos)
4. Localized hashtag suggestions (if applicable)
5. Platform-specific adjustments
6. Confidence score (0-1) based on cultural fit

Also provide:
- An overall cultural risk assessment with specific flags
- Universal elements that work across all target markets
- Market-specific tips for each target region

Ensure translations feel native, not translated. Adapt idioms, humor, references, and formatting conventions (date formats, currency, measurement units) to each locale.`;

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
                language: { type: 'string' },
                language_name: { type: 'string' },
                translated_content: { type: 'string' },
                cultural_adaptations: { type: 'array', items: { type: 'string' } },
                sensitivity_flags: { type: 'array', items: { type: 'string' } },
                hashtag_suggestions: { type: 'array', items: { type: 'string' } },
                platform_adjustments: { type: 'string' },
                confidence_score: { type: 'number' }
              }
            }
          },
          cultural_risk_assessment: {
            type: 'object',
            properties: {
              overall_risk: { type: 'string' },
              flags: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    issue: { type: 'string' },
                    severity: { type: 'string' },
                    recommendation: { type: 'string' }
                  }
                }
              }
            }
          },
          universal_elements: { type: 'array', items: { type: 'string' } },
          market_specific_tips: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                market: { type: 'string' },
                tip: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, localization: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
