import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { demographics, marketTrends, industry, targetAudience } = await req.json();

    if (!demographics || demographics.length === 0) {
      return Response.json(
        { error: 'At least one demographic segment is required' },
        { status: 400 }
      );
    }

    const demographicsDescription = demographics
      .map(d => `${d.name} (Population: ${d.population_size}, Buying Power: ${d.buying_power})`)
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

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});