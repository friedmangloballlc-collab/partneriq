import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

/**
 * checkOpportunityAlerts edge function
 *
 * Scans all talent profiles, finds marketplace_opportunities published in the
 * last 7 days that match each talent's niche/platform, calculates a fit %
 * using the same 6-factor algorithm used on the frontend, and creates
 * Notification records for any matches >= 85 %.
 *
 * Designed to be called by a scheduled cron job or manually by an admin.
 */

// ─── Fit % calculation (mirrors src/lib/qualityScore.ts) ─────────────────────

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return (value as unknown[]).map(v => String(v).trim().toLowerCase());
  return String(value).split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
}

const TIER_AVG_ENGAGEMENT: Record<string, number> = {
  nano: 5, micro: 3.5, mid: 2.5, macro: 1.8, mega: 1.2, celebrity: 0.8,
};

function calculateFitPercent(talent: Record<string, any>, opportunity: Record<string, any>): number {
  // 1. Niche match (20 %)
  const requiredNiches = toArray(opportunity.required_niches);
  const talentNiche = talent.niche ? String(talent.niche).toLowerCase().trim() : '';
  let nicheScore = requiredNiches.length === 0 ? 75 : (talentNiche && requiredNiches.includes(talentNiche) ? 100 : 0);

  // 2. Platform match (20 %)
  const requiredPlatforms = toArray(opportunity.required_platforms);
  const talentPlatform = talent.primary_platform ? String(talent.primary_platform).toLowerCase().trim() : '';
  let platformScore = requiredPlatforms.length === 0 ? 75 : (talentPlatform && requiredPlatforms.includes(talentPlatform) ? 100 : 0);

  // 3. Follower range (15 %)
  const followers = talent.total_followers || 0;
  const minF = opportunity.target_audience_size_min || 0;
  const maxF = opportunity.target_audience_size_max || Infinity;
  let followerScore = 0;
  if (followers >= minF && followers <= maxF) {
    followerScore = 100;
  } else if (followers < minF) {
    const ratio = followers / (minF || 1);
    followerScore = ratio >= 0.5 ? Math.round(ratio * 100) : 0;
  } else {
    followerScore = 70;
  }

  // 4. Engagement rate (15 %)
  const er = talent.engagement_rate || 0;
  const tierAvg = TIER_AVG_ENGAGEMENT[talent.tier] ?? 2.5;
  let engagementScore = 0;
  if (er >= tierAvg * 1.5) engagementScore = 100;
  else if (er >= tierAvg) engagementScore = 75;
  else if (er >= tierAvg * 0.5) engagementScore = 50;
  else if (er > 0) engagementScore = 25;

  // 5. Budget fit (15 %)
  const rate = talent.rate_per_post || 0;
  const budMin = opportunity.budget_min || 0;
  const budMax = opportunity.budget_max || Infinity;
  let budgetScore = 0;
  if (budMin === 0 && budMax === Infinity) {
    budgetScore = 75;
  } else if (rate >= budMin && rate <= budMax) {
    budgetScore = 100;
  } else if (rate < budMin) {
    budgetScore = 80;
  } else {
    const over = rate / (budMax || 1);
    budgetScore = over <= 1.25 ? 50 : over <= 1.5 ? 25 : 0;
  }

  // 6. Brand safety (15 %)
  const bs = talent.brand_safety_score || 0;
  let brandSafetyScore = bs >= 90 ? 100 : bs >= 70 ? 80 : bs >= 50 ? 50 : 20;

  const raw = nicheScore * 0.20 + platformScore * 0.20 + followerScore * 0.15
            + engagementScore * 0.15 + budgetScore * 0.15 + brandSafetyScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, raw)));
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch recent published opportunities
    const { data: opportunities, error: oppErr } = await base44.supabase
      .from('marketplace_opportunities')
      .select('*')
      .eq('status', 'published')
      .gte('created_at', sevenDaysAgo);

    if (oppErr) throw oppErr;
    if (!opportunities || opportunities.length === 0) {
      return new Response(JSON.stringify({ success: true, notifications_created: 0, details: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all talents
    const talents = await base44.asServiceRole.entities.Talent.list('-created_at', 500);
    const created: Array<{ talent_id: string; opportunity_id: string; fit: number }> = [];

    for (const talent of talents) {
      for (const opp of opportunities) {
        const fit = calculateFitPercent(talent, opp);
        if (fit < 85) continue;

        // Avoid duplicate notifications for the same talent + opportunity pair
        const { data: existing } = await base44.supabase
          .from('notifications')
          .select('id, created_at')
          .eq('reference_id', opp.id)
          .eq('reference_type', 'opportunity')
          .eq('trigger_event', 'opportunity_match')
          .contains('metadata', JSON.stringify({ talent_id: talent.id }))
          .limit(1);

        if (existing && existing.length > 0) {
          const age = (now.getTime() - new Date(existing[0].created_at).getTime()) / (1000 * 60 * 60 * 24);
          if (age < 7) continue; // Already notified within the past week
        }

        await base44.asServiceRole.entities.Notification.create({
          title: `New Opportunity Match: ${opp.title}`,
          description: `A new marketplace opportunity "${opp.title}"${opp.brand_name ? ` from ${opp.brand_name}` : ''} matches your profile at ${fit}% fit. Check it out before it closes.`,
          trigger_event: 'opportunity_match',
          priority: fit >= 95 ? 'p1_immediate' : 'p2_same_day',
          status: 'unread',
          reference_type: 'opportunity',
          reference_id: opp.id,
          reference_name: opp.title,
          automated_actions: JSON.stringify(['View opportunity', 'Apply now', 'Save for later']),
          response_window: '< 48 hours',
          detection_method: 'Automated opportunity fit scanner',
          channels: 'Push + Email',
          metadata: JSON.stringify({
            talent_id: talent.id,
            talent_name: talent.name,
            fit_percent: fit,
            opportunity_id: opp.id,
            brand_name: opp.brand_name,
            niche: opp.required_niches,
            platform: opp.required_platforms,
          }),
        });

        created.push({ talent_id: talent.id, opportunity_id: opp.id, fit });
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications_created: created.length, details: created }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
