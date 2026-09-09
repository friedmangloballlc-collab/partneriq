import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [partnerships, billing, timelines] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 300),
      base44.entities.BillingHistory.list('-created_date', 200),
      base44.entities.PlanningTimeline.list('-created_date', 100),
    ]);

    if (partnerships.length === 0) {
      return Response.json({ error: 'No partnership data found.' }, { status: 400 });
    }

    const activeDeals = partnerships.filter(p => ['active', 'contracted'].includes(p.status));
    const totalCommitted = activeDeals.reduce((s, d) => s + (d.deal_value || 0), 0);
    const totalPaid = billing.filter(b => b.status === 'paid').reduce((s, b) => s + (b.amount || 0), 0);
    const pendingPayments = billing.filter(b => b.status === 'pending');
    const failedPayments = billing.filter(b => b.status === 'failed');

    const prompt = `You are an Invoice & Payment Reconciliation AI Agent.

FINANCIAL OVERVIEW:
- Active deals: ${activeDeals.length}
- Total committed value: $${totalCommitted.toLocaleString()}
- Total paid: $${totalPaid.toLocaleString()}
- Pending payments: ${pendingPayments.length} ($${pendingPayments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()})
- Failed payments: ${failedPayments.length}

ACTIVE PARTNERSHIPS:
${activeDeals.slice(0, 15).map(d => `- ${d.talent_name || 'Creator'} × ${d.brand_name || 'Brand'}: $${d.deal_value || 0}, Status=${d.status}`).join('\n')}

BILLING HISTORY (recent):
${billing.slice(0, 10).map(b => `- $${b.amount || 0}: Status=${b.status}, Date=${b.created_date || 'N/A'}`).join('\n')}

TIMELINES: ${timelines.length} active planning timelines

Analyze payment and invoice status:
1. Reconciliation status overview
2. Outstanding payments and aging analysis
3. Payment milestone tracking
4. Revenue recognition timeline
5. Dispute risk identification
6. Cash flow forecast
7. Payment automation recommendations`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          reconciliation_status: {
            type: 'object',
            properties: {
              total_committed: { type: 'string' },
              total_invoiced: { type: 'string' },
              total_paid: { type: 'string' },
              outstanding: { type: 'string' },
              reconciliation_rate: { type: 'string' }
            }
          },
          outstanding_payments: {
            type: 'array',
            items: { type: 'object', properties: { partnership: { type: 'string' }, amount: { type: 'string' }, days_outstanding: { type: 'string' }, risk_level: { type: 'string' }, recommended_action: { type: 'string' } } }
          },
          milestone_tracking: {
            type: 'array',
            items: { type: 'object', properties: { partnership: { type: 'string' }, next_milestone: { type: 'string' }, payment_due: { type: 'string' }, status: { type: 'string' } } }
          },
          dispute_risks: {
            type: 'array',
            items: { type: 'object', properties: { risk: { type: 'string' }, partnership: { type: 'string' }, likelihood: { type: 'string' }, prevention: { type: 'string' } } }
          },
          cash_flow_forecast: {
            type: 'object',
            properties: {
              next_30_days: { type: 'string' },
              next_60_days: { type: 'string' },
              next_90_days: { type: 'string' },
              key_inflows: { type: 'array', items: { type: 'string' } }
            }
          },
          automation_recommendations: {
            type: 'array',
            items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, implementation: { type: 'string' } } }
          },
          top_3_actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
