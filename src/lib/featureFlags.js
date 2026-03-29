/**
 * Feature flags — DERIVED from the single source of truth in
 * src/config/pageAccess.js.
 *
 * Do NOT add flag definitions here. Edit FEATURE_FLAGS in pageAccess.js instead.
 *
 * This module preserves the old API surface (isFeatureEnabled, getAvailableFeatures)
 * for any callers that may reference it, but delegates entirely to pageAccess.
 */
import {
  FEATURE_FLAGS,
  isFeatureEnabled as _isFeatureEnabled,
  getTierLevel,
} from '@/config/pageAccess';

/**
 * Check whether a named feature flag is enabled for a given plan.
 * @param {string} featureName - key in FEATURE_FLAGS
 * @param {string} userPlan    - the user's plan key (e.g. "pro", "scale")
 * @param {string} [role]      - optional role for role-aware tier lookup
 */
export function isFeatureEnabled(featureName, userPlan, role = 'talent') {
  const tierLevel = getTierLevel(role, userPlan);
  return _isFeatureEnabled(role, tierLevel, featureName);
}

/**
 * Return all feature flag names that are enabled for the given plan.
 */
export function getAvailableFeatures(userPlan, role = 'talent') {
  const tierLevel = getTierLevel(role, userPlan);
  return Object.keys(FEATURE_FLAGS).filter((name) =>
    _isFeatureEnabled(role, tierLevel, name),
  );
}
