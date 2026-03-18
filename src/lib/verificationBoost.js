/**
 * Verification boost calculation and display helpers.
 * Boost: +5% per OAuth platform, +3% per API platform, capped at 30%.
 */

export function calculateBoost(oauthCount, apiCount) {
  return Math.min((oauthCount * 5) + (apiCount * 3), 30);
}

export function applyAlphaBoost(score, boost) {
  return score * (1 + boost / 100);
}

export function applySafetyBoost(score, boost) {
  return Math.min(score * (1 + boost / 100), 100);
}

export function getVerificationLevel(verifiedCount) {
  if (verifiedCount === 0) return 'Unverified';
  if (verifiedCount <= 2) return 'Basic';
  if (verifiedCount <= 4) return 'Verified';
  return 'Super Verified';
}

export function getVerificationColor(level) {
  switch (level) {
    case 'Super Verified': return 'text-purple-500 bg-purple-50 border-purple-200';
    case 'Verified': return 'text-indigo-500 bg-indigo-50 border-indigo-200';
    case 'Basic': return 'text-blue-500 bg-blue-50 border-blue-200';
    default: return 'text-slate-400 bg-slate-50 border-slate-200';
  }
}

export function getNextBoostMessage(verifiedCount, currentBoost) {
  if (currentBoost >= 30) return 'Maximum 30% discovery boost achieved!';
  if (verifiedCount === 0) return 'Connect a social account to start earning discovery boosts.';
  const next = Math.min(currentBoost + 5, 30);
  return `${verifiedCount} verified — +${currentBoost}% boost. Connect more for +${next}%`;
}

/**
 * Recalculate boost for a talent based on their connected platforms.
 * Call this after connecting or disconnecting a platform.
 */
export async function recalculateBoost(supabase, talentId) {
  const { data: platforms } = await supabase
    .from('connected_platforms')
    .select('auth_method')
    .eq('talent_id', talentId);

  if (!platforms) return;

  const oauthCount = platforms.filter(p => p.auth_method === 'oauth').length;
  const apiCount = platforms.filter(p => p.auth_method === 'api_key').length;
  const totalVerified = oauthCount + apiCount;
  const boost = calculateBoost(oauthCount, apiCount);

  await supabase
    .from('talents')
    .update({
      verified_platforms_count: totalVerified,
      verification_boost: boost,
      is_verified: totalVerified > 0,
    })
    .eq('id', talentId);

  return { totalVerified, boost };
}
