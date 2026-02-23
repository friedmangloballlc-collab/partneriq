import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userType } = await req.json();

    if (!userType) {
      return Response.json({ error: 'Missing userType' }, { status: 400 });
    }

    // Get user subscription
    const subscription = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
      user_type: userType
    });

    if (subscription.length === 0) {
      // User is on free tier
      return Response.json({
        has_subscription: false,
        current_plan: 'free',
        status: 'active',
        billing_cycle: null,
        current_period_end: null
      });
    }

    const sub = subscription[0];

    // Get plan details
    const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: sub.current_plan
    });

    const planDetails = plan.length > 0 ? plan[0] : null;

    return Response.json({
      has_subscription: true,
      current_plan: sub.current_plan,
      plan_name: planDetails?.tier_name || 'Unknown',
      status: sub.status,
      billing_cycle: sub.billing_cycle,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      auto_renew: sub.auto_renew,
      cancel_at: sub.cancel_at,
      features: planDetails?.features ? JSON.parse(planDetails.features) : [],
      limits: planDetails?.limits ? JSON.parse(planDetails.limits) : {}
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});