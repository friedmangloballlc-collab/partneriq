import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all relevant data sources in parallel
    const [partnerships, talents, approvals, activities, outreachSequences, billingHistory] = await Promise.all([
      base44.entities.Partnership.list('-updated_date', 300),
      base44.entities.Talent.list('-created_date', 200),
      base44.entities.ApprovalItem.list('-created_date', 200),
      base44.entities.Activity.list('-created_date', 200),
      base44.entities.OutreachSequence.list('-created_date', 100),
      base44.entities.BillingHistory.list('-created_date', 100),
    ]);

    const now = new Date();

    // Pre-compute data summaries for the LLM prompt
    const activePartnerships = partnerships.filter(p => ['active', 'contracted', 'negotiating'].includes(p.status));
    const stalledDeals = partnerships.filter(p => {
      const daysSinceUpdate = (now.getTime() - new Date(p.updated_date).getTime()) / (1000 * 60 * 60 * 24);
      return !['completed', 'churned'].includes(p.status) && daysSinceUpdate >= 5;
    });
    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    const overdueApprovals = pendingApprovals.filter(a => {
      const daysPending = (now.getTime() - new Date(a.created_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysPending >= 3;
    });
    const recentActivities = activities.slice(0, 50);
    const activeOutreach = outreachSequences.filter(s => s.status === 'active');
    const recentBilling = billingHistory.slice(0, 30);

    // High-value deals at risk
    const highValueDeals = partnerships.filter(p => p.deal_value && p.deal_value >= 10000);
    const expiringDeals = partnerships.filter(p => {
      if (!p.end_date) return false;
      const daysUntilExpiry = (new Date(p.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    // Talent with low safety scores
    const riskyTalents = talents.filter(t => t.brand_safety_score && t.brand_safety_score < 60);

    const prompt = `You are a Smart Notifications Engine for a partnership/influencer management platform.
Analyze the following data and generate actionable, prioritized alerts across all categories.

TODAY: ${now.toISOString().split('T')[0]}

PARTNERSHIPS (${partnerships.length} total, ${activePartnerships.length} active):
${partnerships.slice(0, 30).map(p => `- "${p.title}" | Status: ${p.status} | Brand: ${p.brand_name || 'N/A'} | Talent: ${p.talent_name || 'N/A'} | Value: $${p.deal_value || 0} | Updated: ${p.updated_date} | End: ${p.end_date || 'N/A'} | Priority: ${p.priority || 'N/A'}`).join('\n')}

STALLED DEALS (${stalledDeals.length}):
${stalledDeals.slice(0, 15).map(p => `- "${p.title}" stalled ${Math.floor((now.getTime() - new Date(p.updated_date).getTime()) / (1000 * 60 * 60 * 24))} days in "${p.status}"`).join('\n')}

EXPIRING DEALS (${expiringDeals.length}):
${expiringDeals.slice(0, 10).map(p => `- "${p.title}" expires ${p.end_date} (${Math.floor((new Date(p.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days left, value: $${p.deal_value || 0})`).join('\n')}

HIGH-VALUE DEALS (${highValueDeals.length}):
${highValueDeals.slice(0, 10).map(p => `- "${p.title}" $${p.deal_value} | ${p.status}`).join('\n')}

TALENTS (${talents.length} total):
${talents.slice(0, 20).map(t => `- ${t.name}: ${t.platform || 'N/A'}/${t.niche || 'N/A'}, Tier=${t.tier || 'N/A'}, Safety=${t.brand_safety_score || 'N/A'}, Followers=${t.followers?.toLocaleString() || 'N/A'}`).join('\n')}

RISKY TALENTS (safety score < 60): ${riskyTalents.length}
${riskyTalents.slice(0, 10).map(t => `- ${t.name}: Safety=${t.brand_safety_score}, Platform=${t.platform}`).join('\n')}

PENDING APPROVALS (${pendingApprovals.length}, ${overdueApprovals.length} overdue):
${pendingApprovals.slice(0, 15).map(a => `- "${a.title || a.name}" | Type: ${a.type || 'N/A'} | Created: ${a.created_date} | Status: ${a.status}`).join('\n')}

RECENT ACTIVITIES (last ${recentActivities.length}):
${recentActivities.slice(0, 20).map(a => `- ${a.type || 'activity'}: "${a.title || a.description || 'N/A'}" at ${a.created_date}`).join('\n')}

OUTREACH SEQUENCES (${outreachSequences.length} total, ${activeOutreach.length} active):
${outreachSequences.slice(0, 15).map(s => `- "${s.name || s.title}" | Status: ${s.status || 'N/A'} | Sent: ${s.emails_sent || 0} | Replies: ${s.replies || 0}`).join('\n')}

BILLING (${billingHistory.length} records):
${recentBilling.slice(0, 10).map(b => `- $${b.amount || 0} | ${b.status || 'N/A'} | ${b.description || 'N/A'} | ${b.created_date}`).join('\n')}

Generate smart alerts. For each alert provide:
- A unique short id (e.g. "alert_deal_001")
- Category: one of deal_alert, safety_alert, compliance_alert, opportunity_alert, relationship_alert, financial_alert, trend_alert
- Severity: critical, high, medium, or low
- Clear title and description
- The affected entity name
- A specific recommended action
- An action_url path (e.g. "/partnerships/123" or "/talents" or "/approvals")
- An expires_at date (ISO string, when the alert becomes irrelevant)

Also provide:
- A daily_digest: 2-3 paragraph natural language summary of the most important things to pay attention to today
- weekly_trends: array of 3-5 trend observations

Be specific with real data from above. Generate 5-15 alerts covering multiple categories. Prioritize critical/high severity for urgent items.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                category: { type: 'string' },
                severity: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                affected_entity: { type: 'string' },
                recommended_action: { type: 'string' },
                action_url: { type: 'string' },
                expires_at: { type: 'string' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              total_alerts: { type: 'number' },
              critical_count: { type: 'number' },
              high_count: { type: 'number' },
              action_required_count: { type: 'number' },
            },
          },
          daily_digest: { type: 'string' },
          weekly_trends: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    return Response.json({ success: true, notifications: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
