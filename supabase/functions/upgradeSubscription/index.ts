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

    const body = await req.json();
    const { action, userType, newPlanTier } = body;

    // === Cancel subscription ===
    if (action === 'cancel') {
      // Find any active subscription for this user
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_id: user.id });
      const activeSub = subs.find((s: any) => s.stripe_subscription_id && s.status === 'active');

      if (!activeSub) {
        return new Response(JSON.stringify({ error: 'No active subscription found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Cancel at period end — user keeps access until billing cycle ends
      await stripe.subscriptions.update(activeSub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      await base44.asServiceRole.entities.UserSubscription.update(activeSub.id, {
        status: 'cancelling',
      });

      // Update profiles.plan to free
      await base44.serviceRole.from('profiles').update({ plan: 'free' }).eq('id', user.id);

      return new Response(JSON.stringify({
        success: true,
        message: 'Subscription will cancel at end of billing period',
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // === Upgrade subscription ===
    if (!userType || !newPlanTier) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get current subscription
    const currentSub = await base44.asServiceRole.entities.UserSubscription.filter({
      user_email: user.email,
      user_type: userType
    });

    if (currentSub.length === 0 || !currentSub[0].stripe_subscription_id) {
      return new Response(JSON.stringify({ error: 'No active subscription found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get new plan details
    const newPlan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: newPlanTier
    });

    if (newPlan.length === 0) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription upgraded successfully',
      new_plan: newPlanTier,
      next_billing_date: new Date(updated.current_period_end * 1000).toISOString()
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});