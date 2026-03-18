import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { userType } = await req.json();

    if (!userType) {
      return new Response(JSON.stringify({ error: 'Missing userType' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get user subscription
    const subscription = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
      user_type: userType
    });

    if (subscription.length === 0) {
      // User is on free tier
      return new Response(JSON.stringify({
        has_subscription: false,
        current_plan: 'free',
        status: 'active',
        billing_cycle: null,
        current_period_end: null
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sub = subscription[0];

    // Get plan details
    const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: sub.current_plan
    });

    const planDetails = plan.length > 0 ? plan[0] : null;

    return new Response(JSON.stringify({
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
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Get subscription status error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});