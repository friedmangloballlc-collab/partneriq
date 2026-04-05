import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import posthog from "posthog-js";

// AI query limits per effective tier
const AI_LIMITS = {
  0: 5,    // Free: 5 queries/month
  1: 50,   // Tier 1: 50 queries/month
  // Tier 2+: unlimited (returns Infinity)
};

function getLimit(effectiveTier) {
  if (effectiveTier >= 2) return Infinity;
  return AI_LIMITS[effectiveTier] ?? 5;
}

// Import the canonical NON_AI_FUNCTIONS list from base44Client
// to avoid divergence between the two files
import { NON_AI_FUNCTIONS } from '@/api/base44Client';

export function useAIUsage() {
  const { user } = useAuth();
  const { effectiveTier, role } = useFeatureGate();
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";
  const limit = isAdmin ? Infinity : getLimit(effectiveTier);
  const remaining = Math.max(0, limit - usage);
  const atLimit = !isAdmin && usage >= limit;

  // Load current month usage on mount
  useEffect(() => {
    if (!user?.id) return;
    supabase.rpc('get_ai_usage').then(({ data }) => {
      setUsage(data ?? 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  // Increment usage — returns true if allowed, false if at limit
  const trackQuery = useCallback(async (functionName) => {
    if (isAdmin) return true;
    if (NON_AI_FUNCTIONS.has(functionName)) return true;
    if (usage >= limit) return false;

    const { data: newCount } = await supabase.rpc('increment_ai_usage');
    if (newCount != null) setUsage(newCount);
    posthog.capture('ai_query', { function: functionName, usage: (newCount ?? usage) + 1, limit });
    return true;
  }, [isAdmin, usage, limit]);

  // Check if a query would be allowed (without incrementing)
  const canQuery = useCallback((functionName) => {
    if (isAdmin) return true;
    if (NON_AI_FUNCTIONS.has(functionName)) return true;
    return usage < limit;
  }, [isAdmin, usage, limit]);

  return {
    usage,
    limit,
    remaining,
    atLimit,
    loading,
    trackQuery,
    canQuery,
  };
}

