import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { dispute_id } = await req.json();

    if (!dispute_id) {
      return new Response(JSON.stringify({ error: 'dispute_id is required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load the dispute
    const disputes = await base44.entities.DealDispute.filter({ id: dispute_id });
    const dispute = disputes[0];
    if (!dispute) {
      return new Response(JSON.stringify({ error: 'Dispute not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load partnership
    let deal = null;
    if (dispute.partnership_id) {
      const { data } = await base44.supabase.from('partnerships').select('*').eq('id', dispute.partnership_id).single();
      deal = data;
    }

    // Load escrow records for the partnership
    let escrows: any[] = [];
    if (dispute.partnership_id) {
      escrows = await base44.entities.EscrowPayment.filter({ partnership_id: dispute.partnership_id });
    }

    const prompt = `You are a Deal Dispute Resolution AI Agent for a creator partnership platform.

DISPUTE DETAILS:
- Filed By: ${dispute.filed_by} (Role: ${dispute.filed_by_role})
- Reason: ${dispute.reason}
- Evidence: ${dispute.evidence || 'None provided'}
- Contract Terms: ${dispute.contract_terms || 'Not specified'}

PARTNERSHIP:
${deal ? `- Brand: ${deal.brand_name}
- Talent: ${deal.talent_name}
- Deal Value: $${deal.deal_value || 0}
- Status: ${deal.status}
- Contract Signed: ${deal.contract_signed_at ? 'Yes' : 'No'}
- Content Approved: ${deal.content_approved ? 'Yes' : 'No'}
- Payment Terms: ${deal.payment_terms || 'Standard'}` : 'No partnership data available'}

ESCROW RECORDS:
${escrows.length > 0 ? escrows.map((e: any) => `- $${e.amount} (${e.status}) - Milestone: ${e.milestone || 'N/A'}`).join('\n') : 'No escrow payments found'}

Analyze this dispute thoroughly and provide a fair resolution recommendation. Consider both parties' perspectives, contract terms, and industry standards.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          reasoning: { type: 'string' },
          evidence_assessment: { type: 'string' },
          contract_analysis: { type: 'string' },
          suggested_resolution: { type: 'string' },
          confidence_score: { type: 'number' },
          escalation_needed: { type: 'boolean' },
          action_items: {
            type: 'array',
            items: { type: 'string' }
          },
        }
      }
    });

    // Save AI analysis back to the dispute
    await base44.entities.DealDispute.update(dispute_id, {
      ai_analysis: result,
      status: 'under_review',
    });

    return new Response(JSON.stringify({ success: true, analysis: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
