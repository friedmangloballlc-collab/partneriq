import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { customerId, number, exp_month, exp_year, cvc } = await req.json();

    if (!customerId || !number || !exp_month || !exp_year || !cvc) {
      return new Response(JSON.stringify({ error: 'Missing required card details' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = await import('npm:stripe@14.11.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create payment method
    const paymentMethod = await stripeClient.paymentMethods.create({
      type: 'card',
      card: {
        number,
        exp_month: parseInt(exp_month),
        exp_year: parseInt(exp_year),
        cvc,
      },
    });

    // Attach to customer
    await stripeClient.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      paymentMethod: {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
      }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});