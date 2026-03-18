import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { planTier, billingCycle, userType } = await req.json();

    if (!planTier || !billingCycle || !userType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get plan details
    const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: planTier
    });

    if (!plan || plan.length === 0) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const planDetails = plan[0];
    const priceId = billingCycle === 'annual' ? planDetails.stripe_annual_price_id : planDetails.stripe_monthly_price_id;

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Price not configured for this plan' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      customerId: customerId
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Subscription initialization error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});