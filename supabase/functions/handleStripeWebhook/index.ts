import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify Stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing signature or webhook secret' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', (err as Error).message);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, base44);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, base44);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, base44);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, base44);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

/**
 * checkout.session.completed
 * Create or update user_subscriptions with stripe_customer_id, current_plan tier, status 'active'.
 */
async function handleCheckoutCompleted(session: any, base44: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const metadata = session.metadata || {};
  const userEmail = metadata.user_email || session.customer_email || session.customer_details?.email;
  const userType = metadata.user_type || 'brand';

  if (!userEmail) {
    console.error('checkout.session.completed: no user email found');
    return;
  }

  // Retrieve the full subscription from Stripe to get plan details
  let planName = metadata.plan || 'Unknown Plan';
  let billingCycle = 'monthly';
  let periodStart: string | null = null;
  let periodEnd: string | null = null;

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price?.id;
      if (priceId) {
        planName = await getPlanNameFromStripe(priceId);
      }
      billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';
      periodStart = new Date(subscription.current_period_start * 1000).toISOString();
      periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    } catch (err) {
      console.error('Failed to retrieve subscription details:', (err as Error).message);
    }
  }

  // Check for existing subscription row
  const existingSub = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: userEmail,
    user_type: userType,
  });

  const subData: Record<string, any> = {
    user_email: userEmail,
    user_type: userType,
    current_plan: planName,
    billing_cycle: billingCycle,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: 'active',
    auto_renew: true,
  };

  if (periodStart) subData.current_period_start = periodStart;
  if (periodEnd) subData.current_period_end = periodEnd;

  if (existingSub.length > 0) {
    await base44.asServiceRole.entities.UserSubscription.update(existingSub[0].id, subData);
  } else {
    await base44.asServiceRole.entities.UserSubscription.create(subData);
  }
}

/**
 * invoice.payment_succeeded
 * Create a billing_history row for the paid invoice.
 */
async function handlePaymentSucceeded(invoice: any, base44: any) {
  const userEmail = invoice.customer_email;
  if (!userEmail) {
    console.error('invoice.payment_succeeded: no customer email on invoice');
    return;
  }

  let userType = 'brand';
  let planName = 'Unknown Plan';
  let interval = 'monthly';

  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      userType = subscription.metadata?.user_type || 'brand';
      const priceId = subscription.items.data[0]?.price?.id;
      if (priceId) {
        planName = await getPlanNameFromStripe(priceId);
      }
      interval = subscription.items.data[0]?.price?.recurring?.interval || 'monthly';
    } catch (err) {
      console.error('Failed to retrieve subscription for invoice:', (err as Error).message);
    }
  }

  await base44.asServiceRole.entities.BillingHistory.create({
    user_email: userEmail,
    user_type: userType,
    invoice_id: invoice.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    plan: planName,
    billing_cycle: interval,
    period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
    period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
    status: 'paid',
    paid_at: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : new Date().toISOString(),
    invoice_url: invoice.hosted_invoice_url,
  });
}

/**
 * customer.subscription.updated
 * Update user_subscriptions with the new plan tier.
 */
async function handleSubscriptionUpdated(subscription: any, base44: any) {
  const metadata = subscription.metadata || {};
  const userEmail = metadata.user_email;
  const userType = metadata.user_type;

  if (!userEmail || !userType) {
    console.error('customer.subscription.updated: missing user_email or user_type in metadata');
    return;
  }

  const planName = await getPlanNameFromStripe(subscription.items.data[0]?.price?.id);
  const billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';

  const existingSub = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: userEmail,
    user_type: userType,
  });

  const subData = {
    user_email: userEmail,
    user_type: userType,
    current_plan: planName,
    billing_cycle: billingCycle,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    auto_renew: !subscription.cancel_at_period_end,
  };

  if (existingSub.length > 0) {
    await base44.asServiceRole.entities.UserSubscription.update(existingSub[0].id, subData);
  } else {
    await base44.asServiceRole.entities.UserSubscription.create(subData);
  }
}

/**
 * customer.subscription.deleted
 * Set user_subscriptions status to 'cancelled'.
 */
async function handleSubscriptionDeleted(subscription: any, base44: any) {
  const metadata = subscription.metadata || {};
  const userEmail = metadata.user_email;
  const userType = metadata.user_type;

  if (!userEmail || !userType) {
    console.error('customer.subscription.deleted: missing user_email or user_type in metadata');
    return;
  }

  const existingSub = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: userEmail,
    user_type: userType,
  });

  if (existingSub.length > 0) {
    await base44.asServiceRole.entities.UserSubscription.update(existingSub[0].id, {
      status: 'cancelled',
    });
  }
}

/**
 * Resolve a Stripe price ID to a human-readable product/plan name.
 */
async function getPlanNameFromStripe(priceId: string | undefined): Promise<string> {
  if (!priceId) return 'Unknown Plan';
  try {
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product as string);
    return product.name;
  } catch {
    return 'Unknown Plan';
  }
}
