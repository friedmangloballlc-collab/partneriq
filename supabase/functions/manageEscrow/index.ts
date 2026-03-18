import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { action, partnership_id, escrow_id, amount, milestone, condition, currency } = await req.json();

    // ── create_hold ──────────────────────────────────────────────────────────
    if (action === 'create_hold') {
      if (!partnership_id || !amount) {
        return new Response(JSON.stringify({ error: 'partnership_id and amount are required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const escrow = await base44.entities.EscrowPayment.create({
        partnership_id,
        amount,
        currency: currency || 'USD',
        status: 'held',
        milestone: milestone || null,
        condition: condition || null,
        condition_met: false,
      });

      return new Response(JSON.stringify({ success: true, escrow }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── release_payment ──────────────────────────────────────────────────────
    if (action === 'release_payment') {
      if (!escrow_id) {
        return new Response(JSON.stringify({ error: 'escrow_id is required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const escrow = await base44.entities.EscrowPayment.update(escrow_id, {
        status: 'released',
        released_at: new Date().toISOString(),
        condition_met: true,
      });

      return new Response(JSON.stringify({ success: true, escrow }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── refund ───────────────────────────────────────────────────────────────
    if (action === 'refund') {
      if (!escrow_id) {
        return new Response(JSON.stringify({ error: 'escrow_id is required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const escrow = await base44.entities.EscrowPayment.update(escrow_id, {
        status: 'refunded',
        released_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true, escrow }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── check_conditions ─────────────────────────────────────────────────────
    if (action === 'check_conditions') {
      if (!partnership_id) {
        return new Response(JSON.stringify({ error: 'partnership_id is required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const escrows = await base44.entities.EscrowPayment.filter({ partnership_id }, '-created_at');
      const partnership = await base44.supabase.from('partnerships').select('*').eq('id', partnership_id).single();
      const deal = partnership.data;

      if (!deal) {
        return new Response(JSON.stringify({ error: 'Partnership not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const heldEscrows = escrows.filter((e: any) => e.status === 'held');
      if (heldEscrows.length === 0) {
        return new Response(JSON.stringify({ success: true, message: 'No held escrow payments to check', results: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const prompt = `You are an escrow condition evaluator for creator partnerships.

PARTNERSHIP:
- Brand: ${deal.brand_name}
- Talent: ${deal.talent_name}
- Status: ${deal.status}
- Deal Value: $${deal.deal_value || 0}
- Content Approved: ${deal.content_approved ? 'Yes' : 'No'}
- Contract Signed: ${deal.contract_signed_at ? 'Yes' : 'No'}
- Deposit Paid: ${deal.deposit_paid ? 'Yes' : 'No'}
- Final Payment Released: ${deal.final_payment_released ? 'Yes' : 'No'}

HELD ESCROW PAYMENTS TO EVALUATE:
${heldEscrows.map((e: any) => `- ID: ${e.id}, Amount: $${e.amount}, Milestone: "${e.milestone || 'N/A'}", Condition: "${e.condition || 'N/A'}"`).join('\n')}

For each held escrow payment, evaluate whether its condition/milestone has been met based on the partnership data.
Return a JSON array of results.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  escrow_id: { type: 'string' },
                  condition_met: { type: 'boolean' },
                  reasoning: { type: 'string' },
                  recommendation: { type: 'string' },
                }
              }
            }
          }
        }
      });

      // Auto-update condition_met flag based on AI analysis
      const results = result.results || [];
      for (const r of results) {
        if (r.escrow_id && r.condition_met) {
          await base44.entities.EscrowPayment.update(r.escrow_id, { condition_met: true });
        }
      }

      return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
