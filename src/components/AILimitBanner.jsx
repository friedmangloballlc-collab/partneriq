import { Lock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAIUsage } from "@/hooks/useAIUsage";

/**
 * Shows AI usage status and upgrade prompt when at limit.
 * Drop into any AI-powered page/component.
 *
 * Usage:
 *   <AILimitBanner />                    — shows only when at limit
 *   <AILimitBanner showCounter />        — always shows remaining count
 */
export default function AILimitBanner({ showCounter = false }) {
  const { remaining, limit, atLimit, loading } = useAIUsage();

  if (loading || limit === Infinity) return null;

  if (atLimit) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">AI query limit reached</p>
          <p className="text-xs text-amber-700">
            You&apos;ve used all {limit} AI queries this month.
          </p>
        </div>
        <Link
          to={createPageUrl("SubscriptionManagement")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap"
        >
          <Zap className="w-3 h-3" /> Upgrade
        </Link>
      </div>
    );
  }

  if (showCounter) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="w-3 h-3" />
        <span>{remaining}/{limit} AI queries remaining this month</span>
      </div>
    );
  }

  return null;
}

/**
 * Formats an error from base44.functions.invoke() for display.
 * Returns a user-friendly string. Use in catch blocks.
 */
export function formatAIError(err) {
  if (err?.message === 'AI_LIMIT_REACHED') {
    return "You've reached your AI query limit for this month. Upgrade your plan for more queries.";
  }
  return err?.message || "Something went wrong. Please try again.";
}
