import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await req.json();

    if (!customerId) {
      return Response.json({ methods: [] });
    }

    // In a real implementation, query Stripe API to get payment methods
    // For now, return empty array - integrate with Stripe API
    const stripe = await import('npm:stripe@14.11.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    const methods = paymentMethods.data.map(method => ({
      id: method.id,
      brand: method.card.brand,
      last4: method.card.last4,
      exp_month: method.card.exp_month,
      exp_year: method.card.exp_year,
      is_default: method.customer === customerId, // Simplified - check actual default in Stripe
    }));

    return Response.json({ methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});