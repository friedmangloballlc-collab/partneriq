import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { action, partnership_id, escrow_id, amount, milestone, condition, currency } = await req.json();

    // ── Authorization: role-specific checks per action ─────────────────────
    if (['release_payment', 'refund', 'check_conditions'].includes(action)) {

      // Refund is admin-only — reject non-admins immediately
      if (action === 'refund') {
        // Look up the user's role from the database, not from the request
        const { data: callerProfile } = await base44.supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!callerProfile || callerProfile.role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Forbidden: only admins can issue refunds' }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // For release_payment and check_conditions, verify the caller owns the partnership (brand owner)
      if (action === 'release_payment' || action === 'check_conditions') {
        let partnershipToCheck = partnership_id || null;

        // For escrow-based actions, look up the partnership from the escrow record
        if (!partnershipToCheck && escrow_id) {
          const { data: escrowRecord } = await base44.supabase
            .from('escrow_payments')
            .select('partnership_id')
            .eq('id', escrow_id)
            .single();
          if (!escrowRecord) {
            return new Response(JSON.stringify({ error: 'Escrow record not found' }), {
              status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          partnershipToCheck = escrowRecord.partnership_id;
        }

        if (!partnershipToCheck) {
          return new Response(JSON.stringify({ error: 'Could not determine partnership for authorization' }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { data: partnershipRecord } = await base44.supabase
          .from('partnerships')
          .select('created_by')
          .eq('id', partnershipToCheck)
          .single();

        if (!partnershipRecord || partnershipRecord.created_by !== user.id) {
          return new Response(JSON.stringify({ error: 'Forbidden: only the brand owner of this partnership can perform this action' }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
    }

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

      // Return AI analysis as recommendations only — human must explicitly approve releases
      const results = result.results || [];
      // NOTE: AI recommendations are advisory. Do NOT auto-update condition_met.
      // The user must review and manually release escrow payments.

      return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
