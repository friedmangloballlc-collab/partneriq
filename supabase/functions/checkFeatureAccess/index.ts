import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { userType, feature, requiredLimit } = await req.json();

    if (!userType || !feature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        return new Response(JSON.stringify({
          has_access: true,
          current_limit: limit,
          required_limit: requiredLimit,
          can_access: !requiredLimit || limit >= requiredLimit,
          plan: 'free'
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ has_access: false, can_access: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get paid plan details
    const sub = subscription[0];
    const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: sub.current_plan
    });

    if (plan.length === 0) {
      return new Response(JSON.stringify({ has_access: false, can_access: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const limits = JSON.parse(plan[0].limits || '{}');
    const limit = limits[feature] || 0;

    return new Response(JSON.stringify({
      has_access: true,
      current_limit: limit,
      required_limit: requiredLimit,
      can_access: !requiredLimit || limit >= requiredLimit,
      plan: sub.current_plan,
      upgrade_needed: requiredLimit && limit < requiredLimit
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Feature access check error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});