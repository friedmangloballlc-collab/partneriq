import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

// Fires proactive notifications for OutreachSequence / OutreachMetrics deviations:
// 1. Active sequence with open_rate below 20% (underperforming)
// 2. Active sequence with reply_rate = 0 after 10+ sends (no engagement)
// 3. Sequence suddenly spiking open rate (viral moment — capitalize fast)
// 4. Active sequence that has been paused for >3 days

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const now = new Date();
    const sequences = await base44.asServiceRole.entities.OutreachSequence.filter({ status: 'active' });
    const pausedSequences = await base44.asServiceRole.entities.OutreachSequence.filter({ status: 'paused' });
    const created = [];

    // --- Active sequences performance ---
    for (const seq of sequences) {
      if (!seq.total_sent || seq.total_sent < 5) continue; // not enough data

      // Low open rate (<20%)
      if (seq.open_rate < 20 && seq.total_sent >= 10) {
        const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
        const recentAlert = existing.find(n => n.metadata?.includes('low_open_rate') && (now - new Date(n.created_date)) / (1000 * 60 * 60 * 24) < 3);

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
        const recentAlert = existing.find(n => n.metadata?.includes('zero_reply_rate') && (now - new Date(n.created_date)) / (1000 * 60 * 60 * 24) < 5);

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

      // High open rate spike (>60%) — capitalize on engagement
      if (seq.open_rate >= 60 && seq.total_sent >= 5) {
        const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
        const recentAlert = existing.find(n => n.metadata?.includes('high_open_spike') && (now - new Date(n.created_date)) / (1000 * 60 * 60 * 24) < 7);

        if (!recentAlert) {
          await base44.asServiceRole.entities.Notification.create({
            title: `🔥 High Engagement: "${seq.name}" is Performing`,
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

    // --- Paused sequences that have been idle >3 days ---
    for (const seq of pausedSequences) {
      const updatedAt = new Date(seq.updated_date);
      const daysPaused = (now - updatedAt) / (1000 * 60 * 60 * 24);

      if (daysPaused >= 3) {
        const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: seq.id });
        const recentAlert = existing.find(n => n.metadata?.includes('long_paused') && (now - new Date(n.created_date)) / (1000 * 60 * 60 * 24) < 3);

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

    return new Response(JSON.stringify({ success: true, notifications_created: created.length, details: created }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});