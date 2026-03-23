import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

// Fires proactive notifications for:
// 1. Partnerships stuck in a stage for >7 days (no update)
// 2. Partnerships that moved to "contracted" or "active" (celebrate + next-step nudge)
// 3. Partnerships that have been "negotiating" for >3 days

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const now = new Date();
    const partnerships = await base44.asServiceRole.entities.Partnership.list('-updated_date', 200);
    const created = [];

    // Batch-fetch all relevant notifications upfront to avoid N+1 queries
    const [staleNotifs, negotiationNotifs] = await Promise.all([
      base44.asServiceRole.entities.Notification.filter({ trigger_event: 'competitor_deal_expiring' }, '-created_date', 500),
      base44.asServiceRole.entities.Notification.filter({ trigger_event: 'major_announcement' }, '-created_date', 500),
    ]);

    // Index by reference_id for O(1) lookup
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

      // --- Stale deal alert (7+ days with no movement, not in terminal stages) ---
      const terminalStages = ['completed', 'churned', 'contracted', 'active'];
      if (!terminalStages.includes(p.status) && daysSinceUpdate >= 7) {
        const existing = staleByRef[p.id] || [];
        const recentAlert = existing.find(n => {
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
        const recentAlert = existing.find(n => {
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

    return new Response(JSON.stringify({ success: true, notifications_created: created.length, details: created }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});