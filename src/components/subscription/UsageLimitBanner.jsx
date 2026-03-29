import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UsageLimitBanner({ current, limit, featureName, upgradeUrl = "/SubscriptionManagement" }) {
  if (!limit || current < limit * 0.8) return null; // Show at 80% usage
  const remaining = limit - current;
  const isAtLimit = remaining <= 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 ${isAtLimit ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${isAtLimit ? 'text-red-500' : 'text-amber-500'}`} />
      <p className="text-sm text-foreground flex-1">
        {isAtLimit
          ? `You've reached your ${featureName} limit this month. Upgrade to continue.`
          : `You have ${remaining} ${featureName} remaining this month.`
        }
      </p>
      <Button variant="gold" size="sm" onClick={() => window.location.href = upgradeUrl}>
        Upgrade
      </Button>
    </div>
  );
}
