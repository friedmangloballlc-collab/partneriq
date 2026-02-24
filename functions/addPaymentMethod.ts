import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId, number, exp_month, exp_year, cvc } = await req.json();

    if (!customerId || !number || !exp_month || !exp_year || !cvc) {
      return Response.json({ error: 'Missing required card details' }, { status: 400 });
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

    return Response.json({ 
      success: true, 
      paymentMethod: {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
      }
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});