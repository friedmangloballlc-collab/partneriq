import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';
import Stripe from 'npm:stripe@15.0.0';

/**
 * Unified Stripe edge function.
 *
 * Consolidates: checkFeatureAccess, getInvoices, getUserSubscriptionStatus,
 * initializeSubscription, upgradeSubscription, addPaymentMethod,
 * deletePaymentMethod, getPaymentMethods, setupStripeConnect.
 *
 * NOTE: handleStripeWebhook is intentionally kept separate because webhook
 * signature verification requires its own raw-body endpoint.
 *
 * Request body:
 *   { action: string, ...actionPayload }
 *
 * Valid actions:
 *   "check_access"      - Check feature access for a user
 *   "invoices"          - List Stripe invoices for a customer
 *   "status"            - Get user subscription status
 *   "checkout"          - Initialize a new subscription checkout
 *   "upgrade"           - Upgrade an existing subscription
 *   "add_payment"       - Add a payment method to a customer
 *   "delete_payment"    - Detach a payment method
 *   "list_payments"     - List payment methods for a customer
 *   "connect_create"    - Create a Stripe Connect Express account
 *   "connect_escrow"    - Create an escrow payment via Connect
 *   "connect_release"   - Release a held escrow payment
 */

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

// Lazy-init Stripe client (top-level for actions that need it)
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  return _stripe;
}

// ─── Action handlers ─────────────────────────────────────────────────────────

async function handleCheckAccess(base44: any, user: any, body: any) {
  const { userType, feature, requiredLimit } = body;

  if (!userType || !feature) {
    return json({ error: 'Missing required fields: userType, feature' }, 400);
  }

  // Get user subscription
  const subscription = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: user.email,
    user_type: userType,
  });

  if (subscription.length === 0) {
    // User on free tier
    const planResponse = await base44.asServiceRole.entities.SubscriptionPlan.filter({
      user_type: userType,
      tier: 'free',
    });

    if (planResponse.length > 0) {
      const limits = JSON.parse(planResponse[0].limits || '{}');
      const limit = limits[feature] || 0;
      return json({
        has_access: true,
        current_limit: limit,
        required_limit: requiredLimit,
        can_access: !requiredLimit || limit >= requiredLimit,
        plan: 'free',
      });
    }
    return json({ has_access: false, can_access: false });
  }

  // Get paid plan details
  const sub = subscription[0];
  const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
    user_type: userType,
    tier: sub.current_plan,
  });

  if (plan.length === 0) {
    return json({ has_access: false, can_access: false });
  }

  const limits = JSON.parse(plan[0].limits || '{}');
  const limit = limits[feature] || 0;

  return json({
    has_access: true,
    current_limit: limit,
    required_limit: requiredLimit,
    can_access: !requiredLimit || limit >= requiredLimit,
    plan: sub.current_plan,
    upgrade_needed: requiredLimit && limit < requiredLimit,
  });
}

async function handleInvoices(_base44: any, _user: any, body: any) {
  const { customerId } = body;

  if (!customerId) {
    return json({ invoices: [] });
  }

  const stripe = getStripe();
  const invoices = await stripe.invoices.list({ customer: customerId, limit: 50 });

  const formattedInvoices = invoices.data.map((invoice: any) => ({
    id: invoice.id,
    number: invoice.number,
    date: invoice.created * 1000,
    amount: invoice.total,
    status: invoice.status || 'draft',
    pdf_url: invoice.pdf,
    period_start: invoice.period_start * 1000,
    period_end: invoice.period_end * 1000,
  }));

  return json({ invoices: formattedInvoices });
}

async function handleStatus(base44: any, user: any, body: any) {
  const { userType } = body;

  if (!userType) {
    return json({ error: 'Missing userType' }, 400);
  }

  const subscription = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: user.email,
    user_type: userType,
  });

  if (subscription.length === 0) {
    return json({
      has_subscription: false,
      current_plan: 'free',
      status: 'active',
      billing_cycle: null,
      current_period_end: null,
    });
  }

  const sub = subscription[0];
  const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
    user_type: userType,
    tier: sub.current_plan,
  });

  const planDetails = plan.length > 0 ? plan[0] : null;

  return json({
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
    limits: planDetails?.limits ? JSON.parse(planDetails.limits) : {},
  });
}

async function handleCheckout(base44: any, user: any, body: any, req: Request) {
  const { planTier, billingCycle, userType } = body;

  if (!planTier || !billingCycle || !userType) {
    return json({ error: 'Missing required fields: planTier, billingCycle, userType' }, 400);
  }

  const plan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
    user_type: userType,
    tier: planTier,
  });

  if (!plan || plan.length === 0) {
    return json({ error: 'Plan not found' }, 404);
  }

  const planDetails = plan[0];
  const priceId = billingCycle === 'annual' ? planDetails.stripe_annual_price_id : planDetails.stripe_monthly_price_id;

  if (!priceId) {
    return json({ error: 'Price not configured for this plan' }, 400);
  }

  const existingSubscription = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: user.email,
    user_type: userType,
  });

  const stripe = getStripe();
  let customerId: string;

  if (existingSubscription.length > 0 && existingSubscription[0].stripe_customer_id) {
    customerId = existingSubscription[0].stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name,
      metadata: { user_type: userType, user_email: user.email },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get('origin')}/subscription-management?user_type=${userType}`,
    metadata: { user_email: user.email, user_type: userType, plan_tier: planTier },
  });

  return json({ sessionId: session.id, customerId });
}

async function handleUpgrade(base44: any, user: any, body: any) {
  const { userType, newPlanTier } = body;

  if (!userType || !newPlanTier) {
    return json({ error: 'Missing required fields: userType, newPlanTier' }, 400);
  }

  const currentSub = await base44.asServiceRole.entities.UserSubscription.filter({
    user_email: user.email,
    user_type: userType,
  });

  if (currentSub.length === 0 || !currentSub[0].stripe_subscription_id) {
    return json({ error: 'No active subscription found' }, 404);
  }

  const newPlan = await base44.asServiceRole.entities.SubscriptionPlan.filter({
    user_type: userType,
    tier: newPlanTier,
  });

  if (newPlan.length === 0) {
    return json({ error: 'Plan not found' }, 404);
  }

  const newPlanDetails = newPlan[0];
  const priceId = currentSub[0].billing_cycle === 'annual'
    ? newPlanDetails.stripe_annual_price_id
    : newPlanDetails.stripe_monthly_price_id;

  const stripe = getStripe();
  const stripeSubscription = await stripe.subscriptions.retrieve(currentSub[0].stripe_subscription_id);

  const updated = await stripe.subscriptions.update(currentSub[0].stripe_subscription_id, {
    items: [{ id: (stripeSubscription as any).items.data[0].id, price: priceId }],
    proration_behavior: 'create_prorations',
    metadata: { ...(stripeSubscription as any).metadata, plan_tier: newPlanTier },
  });

  await base44.asServiceRole.entities.UserSubscription.update(currentSub[0].id, {
    current_plan: newPlanTier,
  });

  return json({
    success: true,
    message: 'Subscription upgraded successfully',
    new_plan: newPlanTier,
    next_billing_date: new Date((updated as any).current_period_end * 1000).toISOString(),
  });
}

async function handleAddPayment(_base44: any, _user: any, body: any) {
  const { customerId, number, exp_month, exp_year, cvc } = body;

  if (!customerId || !number || !exp_month || !exp_year || !cvc) {
    return json({ error: 'Missing required card details' }, 400);
  }

  const stripe = getStripe();

  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number,
      exp_month: parseInt(exp_month),
      exp_year: parseInt(exp_year),
      cvc,
    },
  } as any);

  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customerId });

  return json({
    success: true,
    paymentMethod: {
      id: paymentMethod.id,
      brand: (paymentMethod as any).card.brand,
      last4: (paymentMethod as any).card.last4,
    },
  });
}

async function handleDeletePayment(_base44: any, _user: any, body: any) {
  const { paymentMethodId } = body;

  if (!paymentMethodId) {
    return json({ error: 'Payment method ID required' }, 400);
  }

  const stripe = getStripe();
  await stripe.paymentMethods.detach(paymentMethodId);

  return json({ success: true, message: 'Payment method deleted' });
}

async function handleListPayments(_base44: any, _user: any, body: any) {
  const { customerId } = body;

  if (!customerId) {
    return json({ methods: [] });
  }

  const stripe = getStripe();
  const paymentMethods = await stripe.paymentMethods.list({ customer: customerId, type: 'card' });

  const methods = paymentMethods.data.map((method: any) => ({
    id: method.id,
    brand: method.card.brand,
    last4: method.card.last4,
    exp_month: method.card.exp_month,
    exp_year: method.card.exp_year,
    is_default: method.customer === customerId,
  }));

  return json({ methods });
}

async function handleConnectCreate(base44: any, user: any, _body: any, req: Request) {
  const stripe = getStripe();

  const { data: talent } = await base44.supabase
    .from('talents')
    .select('id, stripe_connect_account_id')
    .eq('user_id', user.id)
    .single();

  if (talent?.stripe_connect_account_id) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: talent.stripe_connect_account_id,
        type: 'account_onboarding',
        return_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=success`,
        refresh_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=refresh`,
      });
      return json({
        success: true,
        account_id: talent.stripe_connect_account_id,
        onboarding_url: accountLink.url,
        already_exists: true,
      });
    } catch (linkErr) {
      console.error('[stripe/connect_create] Failed to create account link for existing account:', (linkErr as Error).message);
    }
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    metadata: { user_id: user.id, platform: 'deal_stage' },
    capabilities: { transfers: { requested: true } },
  });

  if (talent) {
    await base44.supabase
      .from('talents')
      .update({ stripe_connect_account_id: account.id })
      .eq('id', talent.id);
  } else {
    await base44.supabase
      .from('talents')
      .insert({
        user_id: user.id,
        name: user.full_name || user.email,
        stripe_connect_account_id: account.id,
      });
  }

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    type: 'account_onboarding',
    return_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=success`,
    refresh_url: `${req.headers.get('origin') || 'https://www.thedealstage.com'}/settings?stripe_connect=refresh`,
  });

  return json({ success: true, account_id: account.id, onboarding_url: accountLink.url });
}

async function handleConnectEscrow(base44: any, user: any, body: any) {
  const { partnership_id, amount, milestone } = body;

  if (!partnership_id || !amount) {
    return json({ error: 'partnership_id and amount are required' }, 400);
  }

  const { data: partnership, error: pError } = await base44.supabase
    .from('partnerships')
    .select('*, talent_id')
    .eq('id', partnership_id)
    .single();

  if (pError || !partnership) {
    return json({ error: 'Partnership not found' }, 404);
  }

  const { data: talent, error: tError } = await base44.supabase
    .from('talents')
    .select('id, stripe_connect_account_id')
    .eq('id', partnership.talent_id)
    .single();

  if (tError || !talent || !talent.stripe_connect_account_id) {
    return json({
      error: 'Talent does not have a Stripe Connect account. They must complete onboarding first.',
    }, 422);
  }

  const stripe = getStripe();
  const amountInCents = Math.round(amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    capture_method: 'manual',
    transfer_data: { destination: talent.stripe_connect_account_id },
    metadata: {
      partnership_id,
      milestone: milestone || '',
      platform: 'deal_stage',
      created_by: user.id,
    },
  });

  const escrow = await base44.entities.EscrowPayment.create({
    partnership_id,
    amount,
    currency: 'USD',
    status: 'held',
    milestone: milestone || null,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_connect_account_id: talent.stripe_connect_account_id,
    condition_met: false,
  });

  return json({
    success: true,
    escrow,
    payment_intent_id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
  });
}

async function handleConnectRelease(base44: any, _user: any, body: any) {
  const { escrow_id } = body;

  if (!escrow_id) {
    return json({ error: 'escrow_id is required' }, 400);
  }

  const { data: escrow, error: eError } = await base44.supabase
    .from('escrow_payments')
    .select('*')
    .eq('id', escrow_id)
    .single();

  if (eError || !escrow) {
    return json({ error: 'Escrow payment not found' }, 404);
  }

  if (escrow.status !== 'held') {
    return json({
      error: `Cannot release escrow with status '${escrow.status}'. Only 'held' payments can be released.`,
    }, 422);
  }

  if (!escrow.stripe_payment_intent_id) {
    return json({
      error: 'No Stripe PaymentIntent associated with this escrow. Cannot release.',
    }, 422);
  }

  const stripe = getStripe();
  const capturedIntent = await stripe.paymentIntents.capture(escrow.stripe_payment_intent_id);

  const updatedEscrow = await base44.entities.EscrowPayment.update(escrow_id, {
    status: 'released',
    released_at: new Date().toISOString(),
    condition_met: true,
  });

  return json({
    success: true,
    escrow: updatedEscrow,
    payment_intent_status: (capturedIntent as any).status,
  });
}

// ─── Router ──────────────────────────────────────────────────────────────────

const ACTION_MAP: Record<string, (base44: any, user: any, body: any, req: Request) => Promise<Response>> = {
  check_access: handleCheckAccess,
  invoices: handleInvoices,
  status: handleStatus,
  checkout: handleCheckout,
  upgrade: handleUpgrade,
  add_payment: handleAddPayment,
  delete_payment: handleDeletePayment,
  list_payments: handleListPayments,
  connect_create: handleConnectCreate,
  connect_escrow: handleConnectEscrow,
  connect_release: handleConnectRelease,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
    const { action } = body;

    if (!action || !ACTION_MAP[action]) {
      return json({
        error: `Unknown or missing action: "${action}". Valid actions: ${Object.keys(ACTION_MAP).join(', ')}`,
      }, 400);
    }

    return await ACTION_MAP[action](base44, user, body, req);
  } catch (error) {
    console.error('[stripe] Error:', (error as Error).message);
    return json({ error: (error as Error).message }, 500);
  }
});
