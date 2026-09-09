import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@15.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Price map: role → tier → { monthly, annual }
// These need to be replaced with actual Stripe Price IDs after creating products in Stripe Dashboard
const PRICE_MAP: Record<string, Record<string, { monthly: string; annual: string; planKey: string }>> = {
  talent: {
    rising:  { monthly: "price_1TCQCGLZgEiertANe4iXArR6",  annual: "price_1TCQCGLZgEiertANW2zyxCMl",  planKey: "rising" },
    pro:     { monthly: "price_1TCQCHLZgEiertANaHVh7Etm",  annual: "price_1TCQCHLZgEiertANbhM0qgQ0",  planKey: "pro" },
    elite:   { monthly: "price_1TCQCHLZgEiertANLVZor0p0",  annual: "price_1TCQCHLZgEiertANxfsX6APC",  planKey: "elite" },
  },
  brand: {
    growth:     { monthly: "price_1TCQCILZgEiertANayoe0zzJ",  annual: "price_1TCQCILZgEiertANKNvcKGe6",  planKey: "growth" },
    scale:      { monthly: "price_1TGk9NLZgEiertAN3XbmNxiR",  annual: "price_1TCQCJLZgEiertAN7ZX5A21S",  planKey: "scale" },
    enterprise: { monthly: "price_1TGkFDLZgEiertANnynm2YE3",  annual: "price_1TGkFpLZgEiertAN7z8baGdR",  planKey: "enterprise" },
  },
  agency: {
    agency_starter:    { monthly: "price_1TCQCJLZgEiertANp0VaBIlR",  annual: "price_1TCQCKLZgEiertANMK3OtXGQ",  planKey: "agency_starter" },
    agency_pro:        { monthly: "price_1TCQCKLZgEiertAN70z2hM30",   annual: "price_1TCQCKLZgEiertAN85cHfAXd",   planKey: "agency_pro" },
    agency_enterprise: { monthly: "price_1TCQ9MLZgEiertAN5Kcd9Gkq",   annual: "price_1TCQ9MLZgEiertANq0rPIP9B",   planKey: "agency_enterprise" },
  },
  manager: {
    manager_single:     { monthly: "price_1TGkROLZgEiertANOKIDZ5iI",  annual: "price_1TGkRlLZgEiertANWbg88N9p",  planKey: "manager_single" },
    manager_pro:        { monthly: "price_1TGkS0LZgEiertANV0LCEVyR",  annual: "price_1TGkT0LZgEiertANpcme0v8x",  planKey: "manager_pro" },
    manager_enterprise: { monthly: "price_1TGkThLZgEiertANyvhWz",     annual: "price_1TGkU0LZgEiertANZtIQ0uyC",  planKey: "manager_enterprise" },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  try {
    // Auth
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await createClient(SUPABASE_URL, authHeader).auth.getUser();
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get user profile for role
    const { data: profile } = await supabase.from("profiles").select("role, email, full_name").eq("id", user.id).single();
    if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

    const { planTier, billingCycle } = await req.json();
    const userRole = profile.role || "brand";

    if (!planTier || !billingCycle) {
      return Response.json({ error: "Missing planTier or billingCycle" }, { status: 400 });
    }

    // Look up price
    const roleMap = PRICE_MAP[userRole];
    if (!roleMap || !roleMap[planTier]) {
      return Response.json({ error: `No pricing found for ${userRole}/${planTier}` }, { status: 400 });
    }

    const priceConfig = roleMap[planTier];
    const priceId = billingCycle === "annual" ? priceConfig.annual : priceConfig.monthly;

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name || undefined,
        metadata: { user_id: user.id, role: userRole },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://www.thedealstage.com";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/SubscriptionManagement?success=true`,
      cancel_url: `${origin}/SubscriptionManagement?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: profile.email,
        role: userRole,
        plan_key: priceConfig.planKey,
      },
    });

    return Response.json({ sessionId: session.id, customerId }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("initializeSubscription error:", error);
    return Response.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
