/**
 * extractDecisionMakers — AI-powered decision-maker role extractor.
 * Takes { brand_name, industry? } and returns suggested roles/titles via the AI router.
 */

import { corsHeaders } from '../_shared/supabase.ts';

interface RoleSuggestion {
  title: string;
  tier: number;
  likely_name: string | null;
  email_pattern: string | null;
  email_confidence: number;
  linkedin_url: string | null;
  rationale: string;
}

interface ExtractResponse {
  brand_name: string;
  roles: RoleSuggestion[];
  notes: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { brand_name, industry } = body as { brand_name: string; industry?: string };

    if (!brand_name?.trim()) {
      return new Response(
        JSON.stringify({ error: 'brand_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const industryContext = industry ? ` (${industry} industry)` : '';

    const prompt = `You are an expert B2B contact research assistant specializing in creator economy partnerships.

A partnership manager wants to reach out to ${brand_name}${industryContext} to propose a creator/influencer marketing deal.

Identify the most likely decision-maker roles and titles at this type of company. For each role:
- Provide an accurate, real-world job title
- Assign a contact priority tier:
  Tier 1 = Has final budget authority (VP Marketing, CMO, Director of Influencer Marketing, Head of Partnerships)
  Tier 2 = Senior influencer — important to engage (Brand Manager, Marketing Manager, Partnerships Manager)
  Tier 3 = Mid-level stakeholder — CC or warm intro (Social Media Manager, Content Manager, PR Manager)
  Tier 4 = Reference only (Coordinator, Assistant, Intern)
- Estimate an email pattern if known (e.g. firstname@company.com)
- Provide email confidence (0–100)

Return exactly the top 6 most relevant roles.`;

    const schema = {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              tier: { type: 'number' },
              likely_name: { type: 'string' },
              email_pattern: { type: 'string' },
              email_confidence: { type: 'number' },
              linkedin_url: { type: 'string' },
              rationale: { type: 'string' },
            },
          },
        },
        notes: { type: 'string' },
      },
    };

    const routerResp = await fetch(`${supabaseUrl}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent: 'default',
        prompt: `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema)}`,
      }),
    });

    if (!routerResp.ok) {
      const errText = await routerResp.text();
      console.error('[extractDecisionMakers] AI router error:', routerResp.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI router failed', detail: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const routerData = await routerResp.json();
    if (!routerData.success) {
      return new Response(
        JSON.stringify({ error: routerData.error || 'AI router returned failure' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsed: Partial<ExtractResponse> = {};
    try {
      parsed = JSON.parse(routerData.result || '{}');
    } catch {
      parsed = { roles: [], notes: 'Could not parse AI response.' };
    }

    const result: ExtractResponse = {
      brand_name,
      roles: (parsed.roles || []).map((r: any) => ({
        title: r.title || 'Unknown Role',
        tier: typeof r.tier === 'number' ? Math.min(4, Math.max(1, Math.round(r.tier))) : 2,
        likely_name: r.likely_name || null,
        email_pattern: r.email_pattern || null,
        email_confidence: typeof r.email_confidence === 'number' ? r.email_confidence : 0,
        linkedin_url: r.linkedin_url || null,
        rationale: r.rationale || '',
      })),
      notes: parsed.notes || '',
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[extractDecisionMakers] Unhandled error:', (err as Error).message);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
