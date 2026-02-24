import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, AlertCircle } from "lucide-react";
import PlanCard from "@/components/subscription/PlanCard";
import BillingHistory from "@/components/subscription/BillingHistory";
import PaymentMethodManager from "@/components/subscription/PaymentMethodManager";
import InvoiceList from "@/components/subscription/InvoiceList";
import { TALENT_PLANS, BRAND_PLANS, AGENCY_PLANS } from "@/components/subscription/SubscriptionPlans";
import { useSearchParams } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");

export default function SubscriptionManagement() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("user_type") || "brand";
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const plansMap = {
    talent: TALENT_PLANS,
    brand: BRAND_PLANS,
    agency: AGENCY_PLANS
  };

  const currentPlans = plansMap[userType] || BRAND_PLANS;
  const plans = Object.values(currentPlans);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", userType],
    queryFn: async () => {
      const response = await base44.functions.invoke("getUserSubscriptionStatus", { userType });
      return response.data;
    },
    staleTime: 1000 * 60 * 5
  });

  const { data: billingHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["billing-history", userType],
    queryFn: async () => {
      const user = await base44.auth.me();
      const history = await base44.asServiceRole.entities.BillingHistory.filter({
        user_email: user.email,
        user_type: userType
      }, "-created_date", 50);
      return history;
    }
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", subscription?.stripe_customer_id],
    queryFn: async () => {
      if (!subscription?.stripe_customer_id) return [];
      const result = await base44.functions.invoke("getInvoices", { customerId: subscription.stripe_customer_id });
      return result.data.invoices || [];
    },
    enabled: !!subscription?.stripe_customer_id,
  });

  const handleSelectPlan = async (planTier) => {
    if (planTier === "free") {
      // Free tier - no Stripe needed
      alert("You're on the free tier!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke("initializeSubscription", {
        planTier,
        billingCycle,
        userType
      });

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: response.data.sessionId });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentPlan = plans.find(p => p.tier === subscription?.current_plan);
  const isOnFree = subscription?.current_plan === "free" || !subscription?.has_subscription;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription Management</h1>
        <p className="text-slate-600 mt-2">Manage your plan and billing</p>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Current Plan</p>
              <h2 className="text-2xl font-bold text-slate-900">{currentPlan?.name || "Free Tier"}</h2>
              {subscription.current_period_end && (
                <p className="text-sm text-slate-600 mt-2">
                  Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge className={`text-sm py-1 px-3 ${subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {subscription.status === 'active' ? '✓ Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plans Selection */}
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Select Plan</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6 space-y-6">
          {/* Billing Cycle Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Billing Cycle:</span>
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual (Save ~20%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                isCurrentPlan={plan.tier === subscription?.current_plan}
                isMostPopular={plan.tier === "pro" || plan.tier === "scale" || plan.tier === "agency_pro"}
                onSelectPlan={handleSelectPlan}
                billingCycle={billingCycle}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
          <PaymentMethodManager customerId={subscription?.stripe_customer_id} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Your Invoices</h3>
          <InvoiceList 
            invoices={invoices} 
            isLoading={invoicesLoading}
            onDownload={(url) => window.open(url, '_blank')}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingHistory invoices={billingHistory} />
        </TabsContent>
      </Tabs>

      {/* Usage Limits */}
      {currentPlan && subscription?.limits && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Usage Limits</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(subscription.limits).map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 uppercase mb-1">{key.replace(/_/g, " ")}</p>
                <p className="text-2xl font-bold text-slate-900">{value === 999999 ? "∞" : value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}