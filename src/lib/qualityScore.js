/**
 * AQS — Audience Quality Score (0–100 composite)
 * and Fit % (0–100 talent-vs-opportunity match score).
 */

// ─── AQS helpers ────────────────────────────────────────────────────────────

/**
 * Scale an engagement rate (%) to a 0-100 component score.
 * Uses a soft-cap curve: top marks start at ≥8 % (celebrity / micro viral).
 *  0 % → 0
 *  1 % → ~25
 *  3 % → ~55
 *  5 % → ~75
 *  8 %+ → 100
 */
function scaleEngagementRate(rate) {
  if (!rate || rate <= 0) return 0;
  // Simple piecewise linear scale capped at 8 %
  const capped = Math.min(rate, 8);
  return Math.round((capped / 8) * 100);
}

/**
 * Discovery alpha score is stored as a multiplier (e.g. 1.0–2.0).
 * Map 1.0 → 0 and 2.0 → 100 linearly, clamp outside that range.
 */
function scaleDiscoveryAlpha(alpha) {
  if (!alpha || alpha <= 0) return 0;
  // Assume stored range 1.0–2.0; values < 1 treated as 0, > 2 as 100
  const normalised = Math.max(0, Math.min(alpha - 1, 1));
  return Math.round(normalised * 100);
}

const TIER_SCORES = {
  nano: 40,
  micro: 55,
  mid: 65,
  macro: 75,
  mega: 85,
  celebrity: 95,
};

const TRAJECTORY_SCORES = {
  breakout: 95,
  rising_star: 80,
  steady_growth: 60,
  plateau: 40,
  declining: 20,
};

/**
 * calculateAQS — weighted composite score (0–100).
 *
 * Weights:
 *   Engagement rate      30 %
 *   Brand safety score   20 %
 *   Follower tier        15 %
 *   Discovery alpha      15 %
 *   Verification boost   10 %
 *   Growth trajectory    10 %
 */
export function calculateAQS(talent) {
  if (!talent) return null;

  const engagementComponent  = scaleEngagementRate(talent.engagement_rate)       * 0.30;
  const brandSafetyComponent = (talent.brand_safety_score ?? 50)                 * 0.20;
  const tierComponent        = (TIER_SCORES[talent.tier] ?? 50)                  * 0.15;
  const alphaComponent       = scaleDiscoveryAlpha(talent.discovery_alpha_score) * 0.15;
  // verification_boost is already 0-30; scale to 0-100
  const boostComponent       = ((talent.verification_boost ?? 0) / 30) * 100    * 0.10;
  const trajectoryComponent  = (TRAJECTORY_SCORES[talent.trajectory] ?? 50)     * 0.10;

  const raw = engagementComponent + brandSafetyComponent + tierComponent
              + alphaComponent + boostComponent + trajectoryComponent;

  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * AQS colour class helper — returns a Tailwind text colour based on score.
 *   > 70  → green
 *   40–70 → amber / yellow
 *   < 40  → red
 */
export function aqsColorClass(score) {
  if (score === null || score === undefined) return "text-slate-400";
  if (score > 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-500";
  return "text-rose-500";
}

// ─── Fit % helpers ───────────────────────────────────────────────────────────

/**
 * Normalise a value that may arrive as a comma-separated string or an array
 * into a plain JS array of trimmed lower-case strings.
 */
function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim().toLowerCase());
  return String(value).split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}

/**
 * Average engagement rate benchmarks by tier (used to judge "above average").
 */
const TIER_AVG_ENGAGEMENT = {
  nano: 5,
  micro: 3.5,
  mid: 2.5,
  macro: 1.8,
  mega: 1.2,
  celebrity: 0.8,
};

/**
 * calculateFitPercent — 10-factor match score (0–100) between a talent and a
 * marketplace opportunity.
 *
 * The 6 factors specified in the task are each worth the stated weight.
 * Total: 100 %.
 *
 *   Niche match          20 %
 *   Platform match       20 %
 *   Follower range       15 %
 *   Engagement rate      15 %
 *   Budget fit           15 %
 *   Brand safety         15 %
 */
export function calculateFitPercent(talent, opportunity) {
  if (!talent || !opportunity) return null;

  // 1. Niche match (20 %)
  const requiredNiches = toArray(opportunity.required_niches);
  const talentNiche = talent.niche ? talent.niche.toLowerCase().trim() : "";
  let nicheScore = 0;
  if (requiredNiches.length === 0) {
    nicheScore = 75; // no requirement = neutral fit
  } else if (talentNiche && requiredNiches.includes(talentNiche)) {
    nicheScore = 100;
  }

  // 2. Platform match (20 %)
  const requiredPlatforms = toArray(opportunity.required_platforms);
  const talentPlatform = talent.primary_platform ? talent.primary_platform.toLowerCase().trim() : "";
  let platformScore = 0;
  if (requiredPlatforms.length === 0) {
    platformScore = 75; // no requirement = neutral fit
  } else if (talentPlatform && requiredPlatforms.includes(talentPlatform)) {
    platformScore = 100;
  }

  // 3. Follower range (15 %)
  const followers = talent.total_followers || 0;
  const minFollowers = opportunity.target_audience_size_min || 0;
  const maxFollowers = opportunity.target_audience_size_max || Infinity;
  let followerScore = 0;
  if (followers >= minFollowers && followers <= maxFollowers) {
    followerScore = 100;
  } else if (followers < minFollowers) {
    // Partial credit — within 50 % of minimum
    const ratio = followers / minFollowers;
    followerScore = ratio >= 0.5 ? Math.round(ratio * 100) : 0;
  } else {
    // Above max: still give partial credit (over-delivers)
    followerScore = 70;
  }

  // 4. Engagement rate (15 %)
  const engagementRate = talent.engagement_rate || 0;
  const tierAvg = TIER_AVG_ENGAGEMENT[talent.tier] ?? 2.5;
  let engagementScore = 0;
  if (engagementRate >= tierAvg * 1.5) {
    engagementScore = 100;
  } else if (engagementRate >= tierAvg) {
    engagementScore = 75;
  } else if (engagementRate >= tierAvg * 0.5) {
    engagementScore = 50;
  } else if (engagementRate > 0) {
    engagementScore = 25;
  }

  // 5. Budget fit (15 %)
  const ratePerPost = talent.rate_per_post || 0;
  const budgetMin = opportunity.budget_min || 0;
  const budgetMax = opportunity.budget_max || Infinity;
  let budgetScore = 0;
  if (budgetMin === 0 && budgetMax === Infinity) {
    budgetScore = 75; // no budget info = neutral
  } else if (ratePerPost >= budgetMin && ratePerPost <= budgetMax) {
    budgetScore = 100;
  } else if (ratePerPost < budgetMin) {
    // talent is cheaper — still a valid fit, slight penalty
    budgetScore = 80;
  } else {
    // talent is more expensive than max budget
    const overRatio = ratePerPost / budgetMax;
    budgetScore = overRatio <= 1.25 ? 50 : overRatio <= 1.5 ? 25 : 0;
  }

  // 6. Brand safety (15 %)
  const brandSafety = talent.brand_safety_score || 0;
  let brandSafetyScore = 0;
  if (brandSafety >= 90) {
    brandSafetyScore = 100;
  } else if (brandSafety >= 70) {
    brandSafetyScore = 80;
  } else if (brandSafety >= 50) {
    brandSafetyScore = 50;
  } else {
    brandSafetyScore = 20;
  }

  const raw =
    nicheScore    * 0.20 +
    platformScore * 0.20 +
    followerScore * 0.15 +
    engagementScore * 0.15 +
    budgetScore   * 0.15 +
    brandSafetyScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * Fit % colour class helper.
 *   >= 75 → green
 *   50–74 → amber
 *   < 50  → slate/muted
 */
export function fitColorClass(score) {
  if (score === null || score === undefined) return "text-slate-400";
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-slate-400";
}
