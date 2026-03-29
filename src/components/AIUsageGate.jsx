import { useEffect } from "react";
import { useAIUsage } from "@/hooks/useAIUsage";
import { base44 } from "@/api/base44Client";

/**
 * Invisible component that wires the AI usage metering hook
 * into the base44 functions client. Mount once near app root.
 */
export default function AIUsageGate() {
  const { trackQuery } = useAIUsage();

  useEffect(() => {
    base44.functions._meterFn = trackQuery;
    return () => { base44.functions._meterFn = null; };
  }, [trackQuery]);

  return null;
}
