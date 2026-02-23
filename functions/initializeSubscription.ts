import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planTier, billingCycle, userType } = await req.json();

    if (!planTier || !billingCycle || !userType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get plan details
    const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: planTier
    });

    if (!plan || plan.length === 0) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    const planDetails = plan[0];
    const priceId = billingCycle === 'annual' ? planDetails.stripe_annual_price_id : planDetails.stripe_monthly_price_id;

    if (!priceId) {
      return Response.json({ error: 'Price not configured for this plan' }, { status: 400 });
    }

    // Check if user already has subscription
    const existingSubscription = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
      user_type: userType
    });

    let customerId;

    if (existingSubscription.length > 0 && existingSubscription[0].stripe_customer_id) {
      customerId = existingSubscription[0].stripe_customer_id;
    } else {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_type: userType,
          user_email: user.email
        }
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${req.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription-management?user_type=${userType}`,
      metadata: {
        user_email: user.email,
        user_type: userType,
        plan_tier: planTier
      }
    });

    return Response.json({ 
      sessionId: session.id,
      customerId: customerId
    });

  } catch (error) {
    console.error('Subscription initialization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});