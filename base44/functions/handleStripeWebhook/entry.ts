import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@15.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`[Stripe Webhook] ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        // User just paid — update their plan in profiles
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planKey = session.metadata?.plan_key;

        if (userId && planKey) {
          await supabase
            .from("profiles")
            .update({ plan: planKey, updated_at: new Date().toISOString() })
            .eq("id", userId);
          console.log(`[Stripe] Updated ${userId} to plan: ${planKey}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        // Plan changed (upgrade/downgrade)
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          const priceId = subscription.items.data[0]?.price?.id;
          const planKey = await resolvePlanKey(priceId);
          const status = subscription.status;

          if (status === "active" && planKey) {
            await supabase
              .from("profiles")
              .update({ plan: planKey, updated_at: new Date().toISOString() })
              .eq("id", userId);
            console.log(`[Stripe] Subscription updated ${userId} to plan: ${planKey}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Subscription canceled — downgrade to free
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabase
            .from("profiles")
            .update({ plan: "free", updated_at: new Date().toISOString() })
            .eq("id", userId);
          console.log(`[Stripe] Subscription canceled — ${userId} downgraded to free`);
        }
        break;
      }

      case "invoice.payment_failed": {
        // Payment failed — log it but don't downgrade immediately
        // (Stripe retries 3 times before canceling)
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Payment failed for ${invoice.customer_email}`);
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Resolve a Stripe price ID to a plan key
// In production, this should map price IDs to plan keys
async function resolvePlanKey(priceId: string | undefined): Promise<string | null> {
  if (!priceId) return null;
  try {
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product as string);
    // Product metadata should have plan_key set when creating products in Stripe Dashboard
    return product.metadata?.plan_key || product.name?.toLowerCase().replace(/\s+/g, "_") || null;
  } catch {
    return null;
  }
}
