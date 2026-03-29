import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

/**
 * Unified alert-checker edge function.
 *
 * Consolidates: checkApprovalAlerts, checkOutreachAlerts,
 * checkOpportunityAlerts, checkPartnershipAlerts.
 *
 * Request body:
 *   { type: "approval_sla" | "stale_outreach" | "opportunity_match" | "partnership_stale" | "all" }
 *
 * When type === "all", every checker runs and results are merged.
 * Designed to be called by a cron schedule or manually by an admin.
 */

const JSON_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

// ─── Approval SLA alerts ─────────────────────────────────────────────────────
// Fires for:
// 1. ApprovalItems pending past their sla_deadline
// 2. ApprovalItems with deal_value > $10k pending for >4h (high-value priority)
// 3. ApprovalItems pending for >24h with no SLA (general stale)

async function checkApprovalAlerts(base44: any): Promise<any[]> {
  const now = new Date();
  const approvals = await base44.asServiceRole.entities.ApprovalItem.filter({ status: 'pending' });
  const created: any[] = [];

  for (const item of approvals) {
    const createdAt = new Date(item.created_date);
    const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // --- SLA breach: past deadline ---
    if (item.sla_deadline) {
      const deadline = new Date(item.sla_deadline);
      if (now > deadline) {
        const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: item.id });
        const recentSLAAlert = existing.find((n: any) => n.metadata?.includes('sla_breach') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60) < 24);

        if (!recentSLAAlert) {
          const overdueHours = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60));
          await base44.asServiceRole.entities.Notification.create({
            title: `SLA Breach: Approval Overdue — ${item.title}`,
            description: `Approval item "${item.title}" is ${overdueHours} hour(s) past its SLA deadline. Immediate review required to avoid deal risk.`,
            trigger_event: 'competitor_deal_expiring',
            priority: 'p0_crisis',
            status: 'unread',
            reference_type: 'partnership',
            reference_id: item.id,
            reference_name: item.title,
            automated_actions: JSON.stringify(['Escalate immediately', 'Override approve', 'Contact reviewer']),
            response_window: 'Immediate',
            detection_method: 'Automated SLA monitor',
            channels: 'Push + SMS + Email',
            metadata: JSON.stringify({ sla_breach: true, overdue_hours: overdueHours, item_type: item.item_type, deal_value: item.deal_value }),
          });
          created.push({ type: 'sla_breach', id: item.id });
        }
      }
    }

    // --- High-value deal pending >4 hours ---
    if (item.deal_value >= 10000 && hoursOld >= 4) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: item.id });
      const recentHighValueAlert = existing.find((n: any) => n.metadata?.includes('high_value_pending') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60) < 12);

      if (!recentHighValueAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `High-Value Approval Waiting: ${item.title}`,
          description: `A $${item.deal_value?.toLocaleString()} deal approval has been pending for ${Math.floor(hoursOld)} hours. High-value approvals should be reviewed within 4 hours to avoid losing momentum.`,
          trigger_event: 'major_announcement',
          priority: 'p1_immediate',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: item.id,
          reference_name: item.title,
          automated_actions: JSON.stringify(['Priority review', 'Escalate to senior approver', 'Schedule immediate call']),
          response_window: '< 4 hours',
          detection_method: 'High-value deal monitor',
          channels: 'Push + Email',
          metadata: JSON.stringify({ high_value_pending: true, hours_waiting: Math.floor(hoursOld), deal_value: item.deal_value, item_type: item.item_type }),
        });
        created.push({ type: 'high_value_pending', id: item.id });
      }
    }

    // --- General stale approval >24h ---
    if (hoursOld >= 24 && !item.sla_deadline) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: item.id });
      const recentStaleAlert = existing.find((n: any) => n.metadata?.includes('stale_approval') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60) < 24);

      if (!recentStaleAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `Approval Awaiting Review: ${item.title}`,
          description: `"${item.title}" has been waiting for approval for ${Math.floor(hoursOld)} hours. Timely approvals keep outreach momentum strong.`,
          trigger_event: 'rep_change',
          priority: 'p2_same_day',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: item.id,
          reference_name: item.title,
          automated_actions: JSON.stringify(['Review and approve', 'Request revision', 'Reassign reviewer']),
          response_window: '< 24 hours',
          detection_method: 'Approval queue monitor',
          channels: 'Email only',
          metadata: JSON.stringify({ stale_approval: true, hours_waiting: Math.floor(hoursOld), item_type: item.item_type }),
        });
        created.push({ type: 'stale_approval', id: item.id });
      }
    }
  }

  return created;
}

// ─── Outreach alerts ─────────────────────────────────────────────────────────
// Fires for:
// 1. Active sequence with open_rate below 20%
// 2. Active sequence with reply_rate = 0 after 10+ sends
// 3. Sequence with open rate >= 60% (high engagement)
// 4. Paused sequence idle >3 days

async function checkOutreachAlerts(base44: any): Promise<any[]> {
  const now = new Date();
  const sequences = await base44.asServiceRole.entities.OutreachSequence.filter({ status: 'active' });
  const pausedSequences = await base44.asServiceRole.entities.OutreachSequence.filter({ status: 'paused' });
  const created: any[] = [];

  // --- Active sequences performance ---
  for (const seq of sequences) {
    if (!seq.total_sent || seq.total_sent < 5) continue;

    // Low open rate (<20%)
    if (seq.open_rate < 20 && seq.total_sent >= 10) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
      const recentAlert = existing.find((n: any) => n.metadata?.includes('low_open_rate') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60 * 24) < 3);

      if (!recentAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `Low Open Rate Alert: "${seq.name}"`,
          description: `Your outreach sequence "${seq.name}" has an open rate of ${seq.open_rate?.toFixed(1)}% — significantly below the 20% benchmark. Consider A/B testing the subject line or adjusting send time.`,
          trigger_event: 'trajectory_inflection',
          priority: 'p2_same_day',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: seq.id,
          reference_name: seq.name,
          automated_actions: JSON.stringify(['A/B test subject line', 'Review send timing', 'Personalize opener', 'Pause and revise']),
          response_window: '< 24 hours',
          detection_method: 'Outreach performance monitor',
          channels: 'Push + Email',
          metadata: JSON.stringify({ low_open_rate: true, open_rate: seq.open_rate, total_sent: seq.total_sent, reply_rate: seq.reply_rate }),
        });
        created.push({ type: 'low_open_rate', id: seq.id });
      }
    }

    // Zero reply rate after 10+ sends
    if ((seq.reply_rate === 0 || seq.total_replied === 0) && seq.total_sent >= 10) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
      const recentAlert = existing.find((n: any) => n.metadata?.includes('zero_reply_rate') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60 * 24) < 5);

      if (!recentAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `Zero Replies: "${seq.name}" Needs Attention`,
          description: `"${seq.name}" has sent ${seq.total_sent} emails with 0 replies. The CTA or value proposition may need a full revision. Consider a fresh angle.`,
          trigger_event: 'trajectory_inflection',
          priority: 'p1_immediate',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: seq.id,
          reference_name: seq.name,
          automated_actions: JSON.stringify(['Rewrite CTA', 'Shorten email body', 'Change value proposition', 'Verify contact list quality']),
          response_window: '< 4 hours',
          detection_method: 'Reply rate monitor',
          channels: 'Push + Email',
          metadata: JSON.stringify({ zero_reply_rate: true, total_sent: seq.total_sent, open_rate: seq.open_rate }),
        });
        created.push({ type: 'zero_reply_rate', id: seq.id });
      }
    }

    // High open rate spike (>60%)
    if (seq.open_rate >= 60 && seq.total_sent >= 5) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
      const recentAlert = existing.find((n: any) => n.metadata?.includes('high_open_spike') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60 * 24) < 7);

      if (!recentAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `High Engagement: "${seq.name}" is Performing`,
          description: `"${seq.name}" is achieving a ${seq.open_rate?.toFixed(1)}% open rate — well above average! This is a great opportunity to accelerate outreach volume while the messaging is hot.`,
          trigger_event: 'viral_moment',
          priority: 'p2_same_day',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: seq.id,
          reference_name: seq.name,
          automated_actions: JSON.stringify(['Scale send volume', 'Clone sequence for similar targets', 'Capture subject line as template']),
          response_window: '< 24 hours',
          detection_method: 'Outreach performance monitor',
          channels: 'Push + Email',
          metadata: JSON.stringify({ high_open_spike: true, open_rate: seq.open_rate, reply_rate: seq.reply_rate, total_sent: seq.total_sent }),
        });
        created.push({ type: 'high_engagement', id: seq.id });
      }
    }
  }

  // --- Paused sequences idle >3 days ---
  for (const seq of pausedSequences) {
    const updatedAt = new Date(seq.updated_date);
    const daysPaused = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysPaused >= 3) {
      const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
      const recentAlert = existing.find((n: any) => n.metadata?.includes('long_paused') && (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60 * 24) < 3);

      if (!recentAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `Paused Sequence Idle: "${seq.name}"`,
          description: `Outreach sequence "${seq.name}" has been paused for ${Math.floor(daysPaused)} days. Leads in this sequence may go cold. Resume or archive it.`,
          trigger_event: 'competitor_deal_expiring',
          priority: 'p3_next_day',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: seq.id,
          reference_name: seq.name,
          automated_actions: JSON.stringify(['Resume sequence', 'Archive sequence', 'Review and edit steps']),
          response_window: '< 48 hours',
          detection_method: 'Sequence idle monitor',
          channels: 'Email only',
          metadata: JSON.stringify({ long_paused: true, days_paused: Math.floor(daysPaused), total_sent: seq.total_sent }),
        });
        created.push({ type: 'long_paused', id: seq.id });
      }
    }
  }

  return created;
}

// ─── Opportunity match alerts ────────────────────────────────────────────────
// Scans talents against published marketplace_opportunities from last 7 days,
// creates notifications for any matches >= 85% fit.

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return (value as unknown[]).map(v => String(v).trim().toLowerCase());
  return String(value).split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
}

const TIER_AVG_ENGAGEMENT: Record<string, number> = {
  nano: 5, micro: 3.5, mid: 2.5, macro: 1.8, mega: 1.2, celebrity: 0.8,
};

function calculateFitPercent(talent: Record<string, any>, opportunity: Record<string, any>): number {
  const requiredNiches = toArray(opportunity.required_niches);
  const talentNiche = talent.niche ? String(talent.niche).toLowerCase().trim() : '';
  const nicheScore = requiredNiches.length === 0 ? 75 : (talentNiche && requiredNiches.includes(talentNiche) ? 100 : 0);

  const requiredPlatforms = toArray(opportunity.required_platforms);
  const talentPlatform = talent.primary_platform ? String(talent.primary_platform).toLowerCase().trim() : '';
  const platformScore = requiredPlatforms.length === 0 ? 75 : (talentPlatform && requiredPlatforms.includes(talentPlatform) ? 100 : 0);

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

  const er = talent.engagement_rate || 0;
  const tierAvg = TIER_AVG_ENGAGEMENT[talent.tier] ?? 2.5;
  let engagementScore = 0;
  if (er >= tierAvg * 1.5) engagementScore = 100;
  else if (er >= tierAvg) engagementScore = 75;
  else if (er >= tierAvg * 0.5) engagementScore = 50;
  else if (er > 0) engagementScore = 25;

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

  const bs = talent.brand_safety_score || 0;
  const brandSafetyScore = bs >= 90 ? 100 : bs >= 70 ? 80 : bs >= 50 ? 50 : 20;

  const raw = nicheScore * 0.20 + platformScore * 0.20 + followerScore * 0.15
            + engagementScore * 0.15 + budgetScore * 0.15 + brandSafetyScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, raw)));
}

async function checkOpportunityAlerts(base44: any): Promise<any[]> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: opportunities, error: oppErr } = await base44.supabase
    .from('marketplace_opportunities')
    .select('*')
    .eq('status', 'published')
    .gte('created_at', sevenDaysAgo);

  if (oppErr) throw oppErr;
  if (!opportunities || opportunities.length === 0) return [];

  const talents = await base44.asServiceRole.entities.Talent.list('-created_at', 500);
  const created: Array<{ talent_id: string; opportunity_id: string; fit: number }> = [];

  for (const talent of talents) {
    for (const opp of opportunities) {
      const fit = calculateFitPercent(talent, opp);
      if (fit < 85) continue;

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
        if (age < 7) continue;
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

  return created;
}

// ─── Partnership stale / negotiation alerts ──────────────────────────────────
// Fires for:
// 1. Partnerships stuck in a stage for >7 days (not terminal)
// 2. Partnerships in "negotiating" for >3 days

async function checkPartnershipAlerts(base44: any): Promise<any[]> {
  const now = new Date();
  const partnerships = await base44.asServiceRole.entities.Partnership.list('-updated_date', 200);
  const created: any[] = [];

  // Batch-fetch relevant notifications upfront to avoid N+1 queries
  const [staleNotifs, negotiationNotifs] = await Promise.all([
    base44.asServiceRole.entities.Notification.filter({ trigger_event: 'competitor_deal_expiring' }, '-created_date', 500),
    base44.asServiceRole.entities.Notification.filter({ trigger_event: 'major_announcement' }, '-created_date', 500),
  ]);

  const staleByRef: Record<string, any[]> = {};
  for (const n of staleNotifs) {
    if (!staleByRef[n.reference_id]) staleByRef[n.reference_id] = [];
    staleByRef[n.reference_id].push(n);
  }
  const negotiationByRef: Record<string, any[]> = {};
  for (const n of negotiationNotifs) {
    if (!negotiationByRef[n.reference_id]) negotiationByRef[n.reference_id] = [];
    negotiationByRef[n.reference_id].push(n);
  }

  for (const p of partnerships) {
    const updatedAt = new Date(p.updated_date);
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

    // --- Stale deal alert (7+ days, not terminal) ---
    const terminalStages = ['completed', 'churned', 'contracted', 'active'];
    if (!terminalStages.includes(p.status) && daysSinceUpdate >= 7) {
      const existing = staleByRef[p.id] || [];
      const recentAlert = existing.find((n: any) => {
        const age = (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60 * 24);
        return age < 7;
      });

      if (!recentAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `Deal Stalled: ${p.title}`,
          description: `"${p.title}" has been in the "${p.status.replace(/_/g, ' ')}" stage for ${Math.floor(daysSinceUpdate)} days without any update. Consider sending a follow-up or updating the status.`,
          trigger_event: 'competitor_deal_expiring',
          priority: p.priority === 'p0' ? 'p1_immediate' : 'p2_same_day',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: p.id,
          reference_name: p.title,
          automated_actions: JSON.stringify(['Review deal', 'Send follow-up', 'Update stage']),
          response_window: '< 24 hours',
          detection_method: 'Automated stale deal detector',
          channels: 'Push + Email',
          metadata: JSON.stringify({ days_stale: Math.floor(daysSinceUpdate), stage: p.status, brand: p.brand_name, talent: p.talent_name }),
        });
        created.push({ type: 'stale', id: p.id });
      }
    }

    // --- Negotiation warning (3+ days stuck negotiating) ---
    if (p.status === 'negotiating' && daysSinceUpdate >= 3) {
      const existing = negotiationByRef[p.id] || [];
      const recentAlert = existing.find((n: any) => {
        const age = (now.getTime() - new Date(n.created_date).getTime()) / (1000 * 60 * 60 * 24);
        return age < 3;
      });

      if (!recentAlert) {
        await base44.asServiceRole.entities.Notification.create({
          title: `Negotiation Overdue: ${p.title}`,
          description: `"${p.title}" has been in negotiation with ${p.brand_name || 'the brand'} for ${Math.floor(daysSinceUpdate)} days. Deals left too long in negotiation have a higher drop-off rate.`,
          trigger_event: 'major_announcement',
          priority: 'p1_immediate',
          status: 'unread',
          reference_type: 'partnership',
          reference_id: p.id,
          reference_name: p.title,
          automated_actions: JSON.stringify(['Send counter-proposal', 'Schedule call', 'Escalate to senior contact']),
          response_window: '< 4 hours',
          detection_method: 'Automated negotiation monitor',
          channels: 'Push + Email',
          metadata: JSON.stringify({ days_negotiating: Math.floor(daysSinceUpdate), brand: p.brand_name, deal_value: p.deal_value }),
        });
        created.push({ type: 'negotiation_overdue', id: p.id });
      }
    }
  }

  return created;
}

// ─── Type-to-handler map ─────────────────────────────────────────────────────

const CHECKER_MAP: Record<string, (base44: any) => Promise<any[]>> = {
  approval_sla: checkApprovalAlerts,
  stale_outreach: checkOutreachAlerts,
  opportunity_match: checkOpportunityAlerts,
  partnership_stale: checkPartnershipAlerts,
};

// ─── Main handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return json({ error: 'Forbidden' }, 403);
    }

    const { type } = await req.json();

    if (!type) {
      return json({
        error: `Missing "type". Valid types: ${Object.keys(CHECKER_MAP).join(', ')}, all`,
      }, 400);
    }

    let allCreated: any[] = [];

    if (type === 'all') {
      // Run every checker in parallel
      const results = await Promise.all(
        Object.values(CHECKER_MAP).map(fn => fn(base44))
      );
      allCreated = results.flat();
    } else if (CHECKER_MAP[type]) {
      allCreated = await CHECKER_MAP[type](base44);
    } else {
      return json({
        error: `Unknown type: "${type}". Valid types: ${Object.keys(CHECKER_MAP).join(', ')}, all`,
      }, 400);
    }

    return json({
      success: true,
      notifications_created: allCreated.length,
      details: allCreated,
    });
  } catch (error) {
    console.error('[check-alerts] Error:', (error as Error).message);
    return json({ error: (error as Error).message }, 500);
  }
});
