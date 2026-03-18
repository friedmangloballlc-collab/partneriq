import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

/**
 * setupStripeConnect
 * Manages Stripe Connect Express accounts for escrow-based marketplace payments.
 *
 * Actions:
 *   create_account     - Onboard a talent with a Stripe Connect Express account
 *   create_escrow_payment - Create a held PaymentIntent with transfer to talent
 *   release_escrow     - Capture a held PaymentIntent and transfer funds
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── create_account ──────────────────────────────────────────────────────
    if (action === 'create_account') {
      // Check if user already has a Connect account
      const { data: talent } = await base44.supabase
        .from('talents')
        .select('id, stripe_connect_account_id')
        .eq('user_id', user.id)
        .single();

      if (talent?.stripe_connect_account_id) {
        // Account already exists — generate a new onboarding link in case they need to finish
        try {
          const accountLink = await stripe.accountLinks.create({
            account: talent.stripe_connect_account_id,
            type: 'account_onboarding',
            return_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=success`,
            refresh_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=refresh`,
          });

          return new Response(JSON.stringify({
            success: true,
            account_id: talent.stripe_connect_account_id,
            onboarding_url: accountLink.url,
            already_exists: true,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (linkErr) {
          console.error('[setupStripeConnect] Failed to create account link for existing account:', (linkErr as Error).message);
        }
      }

      // Create a new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: {
          user_id: user.id,
          platform: 'deal_stage',
        },
        capabilities: {
          transfers: { requested: true },
        },
      });

      // Save the Connect account ID to the talents table
      if (talent) {
        await base44.supabase
          .from('talents')
          .update({ stripe_connect_account_id: account.id })
          .eq('id', talent.id);
      } else {
        // If no talent row exists for this user, create one with the Connect ID
        await base44.supabase
          .from('talents')
          .insert({
            user_id: user.id,
            name: user.full_name || user.email,
            stripe_connect_account_id: account.id,
          });
      }

      // Generate the onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        type: 'account_onboarding',
        return_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=success`,
        refresh_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=refresh`,
      });

      return new Response(JSON.stringify({
        success: true,
        account_id: account.id,
        onboarding_url: accountLink.url,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── create_escrow_payment ───────────────────────────────────────────────
    if (action === 'create_escrow_payment') {
      const { partnership_id, amount, milestone } = body;

      if (!partnership_id || !amount) {
        return new Response(JSON.stringify({ error: 'partnership_id and amount are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Look up the partnership to find the talent's Connect account
      const { data: partnership, error: pError } = await base44.supabase
        .from('partnerships')
        .select('*, talent_id')
        .eq('id', partnership_id)
        .single();

      if (pError || !partnership) {
        return new Response(JSON.stringify({ error: 'Partnership not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the talent's Stripe Connect account ID
      const { data: talent, error: tError } = await base44.supabase
        .from('talents')
        .select('id, stripe_connect_account_id')
        .eq('id', partnership.talent_id)
        .single();

      if (tError || !talent || !talent.stripe_connect_account_id) {
        return new Response(JSON.stringify({
          error: 'Talent does not have a Stripe Connect account. They must complete onboarding first.',
        }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create a PaymentIntent with manual capture (escrow hold)
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        capture_method: 'manual',
        transfer_data: {
          destination: talent.stripe_connect_account_id,
        },
        metadata: {
          partnership_id,
          milestone: milestone || '',
          platform: 'deal_stage',
          created_by: user.id,
        },
      });

      // Record the escrow payment in the database
      const escrow = await base44.entities.EscrowPayment.create({
        partnership_id,
        amount,
        currency: 'USD',
        status: 'held',
        milestone: milestone || null,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_connect_account_id: talent.stripe_connect_account_id,
        condition_met: false,
      });

      return new Response(JSON.stringify({
        success: true,
        escrow,
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── release_escrow ──────────────────────────────────────────────────────
    if (action === 'release_escrow') {
      const { escrow_id } = body;

      if (!escrow_id) {
        return new Response(JSON.stringify({ error: 'escrow_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch the escrow record
      const { data: escrow, error: eError } = await base44.supabase
        .from('escrow_payments')
        .select('*')
        .eq('id', escrow_id)
        .single();

      if (eError || !escrow) {
        return new Response(JSON.stringify({ error: 'Escrow payment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (escrow.status !== 'held') {
        return new Response(JSON.stringify({
          error: `Cannot release escrow with status '${escrow.status}'. Only 'held' payments can be released.`,
        }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!escrow.stripe_payment_intent_id) {
        return new Response(JSON.stringify({
          error: 'No Stripe PaymentIntent associated with this escrow. Cannot release.',
        }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Capture the held PaymentIntent — this transfers funds to the talent
      const capturedIntent = await stripe.paymentIntents.capture(escrow.stripe_payment_intent_id);

      // Update the escrow record
      const updatedEscrow = await base44.entities.EscrowPayment.update(escrow_id, {
        status: 'released',
        released_at: new Date().toISOString(),
        condition_met: true,
      });

      return new Response(JSON.stringify({
        success: true,
        escrow: updatedEscrow,
        payment_intent_status: capturedIntent.status,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: `Unknown action: ${action}. Valid actions: create_account, create_escrow_payment, release_escrow`,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[setupStripeConnect] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
