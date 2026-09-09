import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@15.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  try {
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, authHeader);
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { newPlanTier, newPriceId } = await req.json();
    if (!newPlanTier) return Response.json({ error: "Missing newPlanTier" }, { status: 400 });

    // Find user's Stripe customer
    const { data: profile } = await supabase.from("profiles").select("email, role").eq("id", user.id).single();
    if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

    const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
    if (customers.data.length === 0) {
      return Response.json({ error: "No Stripe customer found. Please subscribe first." }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    if (subscriptions.data.length === 0) {
      return Response.json({ error: "No active subscription found" }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    // Update subscription with new price
    const updated = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: "create_prorations",
      metadata: {
        ...subscription.metadata,
        user_id: user.id,
        plan_key: newPlanTier,
      },
    });

    // Update profiles.plan immediately
    await supabase
      .from("profiles")
      .update({ plan: newPlanTier, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    return Response.json({
      success: true,
      plan: newPlanTier,
      next_billing: new Date(updated.current_period_end * 1000).toISOString(),
    }, { headers: { "Access-Control-Allow-Origin": "*" } });

  } catch (error) {
    console.error("upgradeSubscription error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
