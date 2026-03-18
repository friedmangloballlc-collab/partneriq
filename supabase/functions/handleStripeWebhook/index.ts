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

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object, base44);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object, base44);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, base44);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, base44);
        break;
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function handleSubscriptionChange(subscription, base44) {
  const metadata = subscription.metadata || {};
  const userEmail = metadata.user_email || subscription.customer.email;
  const userType = metadata.user_type;

  if (!userEmail || !userType) return;

  const planName = await getPlanNameFromStripe(subscription.items.data[0]?.price?.id);

  const billingCycle = subscription.items.data[0]?.price?.type === 'recurring' 
    ? (subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly')
    : 'monthly';

  const existingSub = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: userEmail,
    user_type: userType
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
    auto_renew: !subscription.cancel_at_period_end
  };

  if (existingSub.length > 0) {
    await base44.asServiceRole.entities.UserSubscription.update(existingSub[0].id, subData);
  } else {
    await base44.asServiceRole.entities.UserSubscription.create(subData);
  }
}

async function handleSubscriptionCanceled(subscription, base44) {
  const metadata = subscription.metadata || {};
  const userEmail = metadata.user_email || subscription.customer.email;
  const userType = metadata.user_type;

  if (!userEmail || !userType) return;

  const existingSub = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: userEmail,
    user_type: userType
  });

  if (existingSub.length > 0) {
    await base44.asServiceRole.entities.UserSubscription.update(existingSub[0].id, {
      status: 'canceled'
    });
  }
}

async function handlePaymentSucceeded(invoice, base44) {
  const userEmail = invoice.customer_email;
  if (!userEmail) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userType = subscription.metadata?.user_type;
  const planName = await getPlanNameFromStripe(subscription.items.data[0]?.price?.id);

  await base44.asServiceRole.entities.BillingHistory.create({
    user_email: userEmail,
    user_type: userType || 'brand',
    invoice_id: invoice.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    plan: planName,
    billing_cycle: subscription.items.data[0]?.price?.recurring?.interval || 'monthly',
    period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
    period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
    status: 'paid',
    paid_at: new Date(invoice.paid_at * 1000).toISOString(),
    invoice_url: invoice.hosted_invoice_url
  });
}

async function handlePaymentFailed(invoice, base44) {
  const userEmail = invoice.customer_email;
  if (!userEmail) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userType = subscription.metadata?.user_type;

  const existingInvoice = await base44.asServiceRole.entities.BillingHistory.filter({
    stripe_invoice_id: invoice.id
  });

  if (existingInvoice.length > 0) {
    await base44.asServiceRole.entities.BillingHistory.update(existingInvoice[0].id, {
      status: 'failed'
    });
  } else {
    await base44.asServiceRole.entities.BillingHistory.create({
      user_email: userEmail,
      user_type: userType || 'brand',
      invoice_id: invoice.id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      plan: 'Unknown',
      billing_cycle: 'monthly',
      period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
      period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
      status: 'failed'
    });
  }
}

async function getPlanNameFromStripe(priceId) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);
    return product.name;
  } catch {
    return 'Unknown Plan';
  }
}