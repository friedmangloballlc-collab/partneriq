import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userType, feature, requiredLimit } = await req.json();

    if (!userType || !feature) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user subscription
    const subscription = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
      user_type: userType
    });

    if (subscription.length === 0) {
      // User on free tier
      const planResponse = await base44.asServiceRole.entities.SubscriptionPlan.filter({
        user_type: userType,
        tier: 'free'
      });
      
      if (planResponse.length > 0) {
        const limits = JSON.parse(planResponse[0].limits || '{}');
        const limit = limits[feature] || 0;
        return Response.json({
          has_access: true,
          current_limit: limit,
          required_limit: requiredLimit,
          can_access: !requiredLimit || limit >= requiredLimit,
          plan: 'free'
        });
      }
      return Response.json({ has_access: false, can_access: false });
    }

    // Get paid plan details
    const sub = subscription[0];
    const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: sub.current_plan
    });

    if (plan.length === 0) {
      return Response.json({ has_access: false, can_access: false });
    }

    const limits = JSON.parse(plan[0].limits || '{}');
    const limit = limits[feature] || 0;

    return Response.json({
      has_access: true,
      current_limit: limit,
      required_limit: requiredLimit,
      can_access: !requiredLimit || limit >= requiredLimit,
      plan: sub.current_plan,
      upgrade_needed: requiredLimit && limit < requiredLimit
    });

  } catch (error) {
    console.error('Feature access check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});