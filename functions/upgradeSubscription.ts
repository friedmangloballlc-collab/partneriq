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

    const { userType, newPlanTier } = await req.json();

    if (!userType || !newPlanTier) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current subscription
    const currentSub = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
      user_type: userType
    });

    if (currentSub.length === 0 || !currentSub[0].stripe_subscription_id) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Get new plan details
    const newPlan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: newPlanTier
    });

    if (newPlan.length === 0) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    const newPlanDetails = newPlan[0];
    const priceId = currentSub[0].billing_cycle === 'annual' 
      ? newPlanDetails.stripe_annual_price_id 
      : newPlanDetails.stripe_monthly_price_id;

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(currentSub[0].stripe_subscription_id);
    
    const updated = await stripe.subscriptions.update(currentSub[0].stripe_subscription_id, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: priceId
        }
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        ...stripeSubscription.metadata,
        plan_tier: newPlanTier
      }
    });

    // Update database
    await base44.asServiceRole.entities.UserSubscription.update(currentSub[0].id, {
      current_plan: newPlanTier
    });

    return Response.json({
      success: true,
      message: 'Subscription upgraded successfully',
      new_plan: newPlanTier,
      next_billing_date: new Date(updated.current_period_end * 1000).toISOString()
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});