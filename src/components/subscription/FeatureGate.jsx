import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function FeatureGate({ 
  feature, 
  requiredLimit = null,
  userType = "brand",
  children,
  fallback = null,
  showUpgradePrompt = true
}) {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [feature, userType]);

  const checkAccess = async () => {
    try {
      const response = await base44.functions.invoke("checkFeatureAccess", {
        userType,
        feature,
        requiredLimit
      });
      setHasAccess(response.data);
    } catch (err) {
      console.error("Feature check error:", err);
      setHasAccess({ can_access: false });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-12 bg-slate-100 rounded" />;
  }

  if (!hasAccess?.can_access) {
    if (!showUpgradePrompt) {
      return fallback || null;
    }

    return (
      <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Feature Locked</h4>
            <p className="text-sm text-amber-800 mt-1">
              {hasAccess?.upgrade_needed 
                ? `Upgrade to your plan to access ${feature}.`
                : "This feature requires a paid plan."}
            </p>
          </div>
        </div>
        <Button 
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full"
          onClick={() => window.location.href = createPageUrl("SubscriptionManagement") + `?user_type=${userType}`}
        >
          <ArrowRight className="w-4 h-4" />
          Upgrade Now
        </Button>
      </div>
    );
  }

  return children;
}