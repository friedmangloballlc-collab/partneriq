import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Fires proactive notifications for:
// 1. ApprovalItems pending for >24h (SLA breach risk)
// 2. ApprovalItems with deal_value > $10k pending for >4h (high-value priority escalation)
// 3. ApprovalItems past their sla_deadline

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const approvals = await base44.asServiceRole.entities.ApprovalItem.filter({ status: 'pending' });
    const created = [];

    for (const item of approvals) {
      const createdAt = new Date(item.created_date);
      const hoursOld = (now - createdAt) / (1000 * 60 * 60);

      // --- SLA breach: past deadline ---
      if (item.sla_deadline) {
        const deadline = new Date(item.sla_deadline);
        if (now > deadline) {
          const existing = await base44.asServiceRole.entities.Notification.filter({ reference_id: item.id });
          const recentSLAAlert = existing.find(n => n.metadata?.includes('sla_breach') && (now - new Date(n.created_date)) / (1000 * 60 * 60) < 24);

          if (!recentSLAAlert) {
            const overdueHours = Math.floor((now - deadline) / (1000 * 60 * 60));
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
        const recentHighValueAlert = existing.find(n => n.metadata?.includes('high_value_pending') && (now - new Date(n.created_date)) / (1000 * 60 * 60) < 12);

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
        const recentStaleAlert = existing.find(n => n.metadata?.includes('stale_approval') && (now - new Date(n.created_date)) / (1000 * 60 * 60) < 24);

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

    return Response.json({ success: true, notifications_created: created.length, details: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});