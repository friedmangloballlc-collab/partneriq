import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

export default function PlanCard({ 
  plan, 
  isCurrentPlan = false, 
  isMostPopular = false,
  onSelectPlan,
  billingCycle = "monthly"
}) {
  const price = billingCycle === "annual" ? plan.annual_price : plan.monthly_price;
  const savings = plan.annual_price ? Math.round((1 - plan.annual_price / (plan.monthly_price * 12)) * 100) : 0;

  return (
    <Card className={`relative transition-all ${isMostPopular ? "border-indigo-500 border-2 shadow-xl" : "border-slate-200"} ${isCurrentPlan ? "bg-indigo-50" : ""}`}>
      {isMostPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Badge className="bg-indigo-600 text-white flex items-center gap-1">
            <Star className="w-3 h-3" /> Most Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Current Plan</Badge>
        </div>
      )}

      <CardHeader className={`${isMostPopular ? "pt-8" : ""}`}>
        <CardTitle className="text-lg text-slate-900">{plan.name}</CardTitle>
        <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pricing */}
        <div>
          {price !== null ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">${price}</span>
                <span className="text-slate-500">/month</span>
              </div>
              {billingCycle === "annual" && savings > 0 && (
                <p className="text-xs text-emerald-600 mt-1">Save {savings}% with annual billing</p>
              )}
            </>
          ) : (
            <div className="text-2xl font-bold text-slate-900">Custom Pricing</div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2.5">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCurrentPlan ? "text-indigo-600" : "text-emerald-600"}`} />
              <span className="text-slate-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => onSelectPlan(plan.tier)}
          disabled={isCurrentPlan}
          className={`w-full ${isMostPopular ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-200 hover:bg-slate-300 text-slate-900"}`}
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isCurrentPlan ? "Current Plan" : price === null ? "Contact Sales" : "Select Plan"}
        </Button>
      </CardContent>
    </Card>
  );
}