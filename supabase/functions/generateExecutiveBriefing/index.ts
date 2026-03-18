import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { period = 'weekly' } = await req.json().catch(() => ({}));

    // Determine date range based on period
    const now = new Date();
    const periodStart = new Date(now);
    if (period === 'daily') {
      periodStart.setDate(periodStart.getDate() - 1);
    } else if (period === 'weekly') {
      periodStart.setDate(periodStart.getDate() - 7);
    } else if (period === 'monthly') {
      periodStart.setMonth(periodStart.getMonth() - 1);
    }
    const periodStartISO = periodStart.toISOString();

    // Fetch all data in parallel
    const [
      partnerships,
      talents,
      brands,
      activities,
      approvals,
      billing,
      outreachMetrics,
      outreachEmails,
      outreachSequences,
      dealNotes,
    ] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.Talent.list('-created_date', 500),
      base44.entities.Brand.list('-created_date', 500),
      base44.entities.Activity.list('-created_date', 500),
      base44.entities.ApprovalItem.list('-created_date', 200),
      base44.entities.BillingHistory.list('-created_date', 200),
      base44.entities.OutreachMetrics.list('-created_date', 200),
      base44.entities.OutreachEmail.list('-created_date', 300),
      base44.entities.OutreachSequence.list('-created_date', 200),
      base44.entities.DealNote.list('-created_date', 200),
    ]);

    // ── Compute KPIs ──────────────────────────────────────────────────────

    const totalPartnerships = partnerships.length;
    const activeDeals = partnerships.filter(p => p.status === 'active').length;
    const completedDeals = partnerships.filter(p => p.status === 'completed').length;
    const churnedDeals = partnerships.filter(p => p.status === 'churned').length;
    const negotiatingDeals = partnerships.filter(p => p.status === 'negotiating' || p.status === 'proposed').length;

    const pipelineValue = partnerships
      .filter(p => p.status !== 'completed' && p.status !== 'churned')
      .reduce((sum, p) => sum + (p.deal_value || 0), 0);

    const totalDealValue = partnerships.reduce((sum, p) => sum + (p.deal_value || 0), 0);
    const avgDealValue = totalPartnerships > 0 ? Math.round(totalDealValue / totalPartnerships) : 0;

    const closedDeals = completedDeals + churnedDeals;
    const conversionRate = closedDeals > 0 ? Math.round((completedDeals / closedDeals) * 100) : 0;

    // Revenue from completed deals
    const completedRevenue = partnerships
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.deal_value || 0), 0);

    // Recent partnerships (within period)
    const recentPartnerships = partnerships.filter(p =>
      p.created_date && new Date(p.created_date) >= periodStart
    );

    // Previous period revenue estimate for growth calc
    const prevPeriodStart = new Date(periodStart);
    if (period === 'daily') prevPeriodStart.setDate(prevPeriodStart.getDate() - 1);
    else if (period === 'weekly') prevPeriodStart.setDate(prevPeriodStart.getDate() - 7);
    else prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);

    const currentPeriodRevenue = partnerships
      .filter(p => p.status === 'completed' && p.updated_date && new Date(p.updated_date) >= periodStart)
      .reduce((sum, p) => sum + (p.deal_value || 0), 0);

    const prevPeriodRevenue = partnerships
      .filter(p => p.status === 'completed' && p.updated_date &&
        new Date(p.updated_date) >= prevPeriodStart && new Date(p.updated_date) < periodStart)
      .reduce((sum, p) => sum + (p.deal_value || 0), 0);

    const revenueGrowth = prevPeriodRevenue > 0
      ? Math.round(((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100)
      : 0;

    // ── Partnership highlights ────────────────────────────────────────────

    const topPartnerships = partnerships
      .sort((a, b) => (b.deal_value || 0) - (a.deal_value || 0))
      .slice(0, 10)
      .map(p => ({
        name: p.partner_name || p.brand_name || p.talent_name || 'Unknown',
        status: p.status || 'unknown',
        value: p.deal_value || 0,
        type: p.partnership_type || 'unknown',
        match_score: p.match_score || 0,
        priority: p.priority || 'medium',
      }));

    // ── Talent stats ──────────────────────────────────────────────────────

    const recentTalents = talents.filter(t =>
      t.created_date && new Date(t.created_date) >= periodStart
    );

    const topPerformingTalents = talents
      .filter(t => t.engagement_rate || t.follower_count)
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 5)
      .map(t => ({ name: t.full_name || t.name || 'Unknown', engagement_rate: t.engagement_rate || 0, followers: t.follower_count || 0 }));

    // ── Outreach stats ────────────────────────────────────────────────────

    const totalEmailsSent = outreachEmails.length;
    const repliedEmails = outreachEmails.filter(e => e.status === 'replied').length;
    const emailReplyRate = totalEmailsSent > 0 ? Math.round((repliedEmails / totalEmailsSent) * 100) : 0;
    const activeSequences = outreachSequences.filter(s => s.status === 'active').length;

    // ── Approvals ─────────────────────────────────────────────────────────

    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
    const approvedCount = approvals.filter(a => a.status === 'approved').length;
    const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

    // ── Billing / Financial ───────────────────────────────────────────────

    const recentBilling = billing.filter(b =>
      b.created_date && new Date(b.created_date) >= periodStart
    );
    const periodRevenue = recentBilling
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
    const outstandingInvoices = billing
      .filter(b => b.status === 'pending' || b.status === 'overdue')
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    // ── Partnership type breakdown ────────────────────────────────────────

    const typeBreakdown: Record<string, { count: number; value: number; won: number }> = {};
    partnerships.forEach(p => {
      const t = p.partnership_type || 'other';
      if (!typeBreakdown[t]) typeBreakdown[t] = { count: 0, value: 0, won: 0 };
      typeBreakdown[t].count++;
      typeBreakdown[t].value += p.deal_value || 0;
      if (p.status === 'completed') typeBreakdown[t].won++;
    });

    // ── Build the LLM prompt ──────────────────────────────────────────────

    const prompt = `You are an expert executive briefing analyst for a partnership and influencer management platform called Deal Stage. Generate a comprehensive executive briefing report based on the following data.

**PERIOD:** ${period} (${periodStart.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]})

**KPI OVERVIEW:**
- Total partnerships: ${totalPartnerships}
- Active deals: ${activeDeals}
- Completed deals: ${completedDeals}
- Churned deals: ${churnedDeals}
- Negotiating/Proposed: ${negotiatingDeals}
- Pipeline value: $${pipelineValue.toLocaleString()}
- Avg deal value: $${avgDealValue.toLocaleString()}
- Conversion rate: ${conversionRate}%
- Revenue growth (period-over-period): ${revenueGrowth}%
- New partnerships this period: ${recentPartnerships.length}

**TOP PARTNERSHIPS BY VALUE:**
${topPartnerships.map(p => `- ${p.name}: $${p.value.toLocaleString()} (${p.status}, ${p.type}, match: ${p.match_score}%, priority: ${p.priority})`).join('\n')}

**PARTNERSHIP TYPE BREAKDOWN:**
${Object.entries(typeBreakdown).map(([type, d]) => `- ${type}: ${d.count} deals, $${d.value.toLocaleString()} total value, ${d.won} won`).join('\n')}

**TALENT INSIGHTS:**
- Total talents: ${talents.length}
- New signings this period: ${recentTalents.length}
- Top performers by engagement: ${topPerformingTalents.map(t => `${t.name} (${t.engagement_rate}%)`).join(', ') || 'N/A'}

**BRAND PORTFOLIO:**
- Total brands: ${brands.length}

**OUTREACH PERFORMANCE:**
- Total emails sent: ${totalEmailsSent}
- Reply rate: ${emailReplyRate}%
- Active sequences: ${activeSequences}

**APPROVALS:**
- Pending: ${pendingApprovals}
- Approved: ${approvedCount}
- Rejected: ${rejectedCount}

**FINANCIAL:**
- Revenue this period: $${periodRevenue.toLocaleString()}
- Outstanding invoices: $${outstandingInvoices.toLocaleString()}
- Completed deal revenue: $${completedRevenue.toLocaleString()}
- Projected pipeline: $${pipelineValue.toLocaleString()}

**RECENT ACTIVITIES:** ${activities.slice(0, 20).map(a => `${a.activity_type || 'action'}: ${a.description || a.title || 'N/A'}`).join('; ')}

Based on ALL of this data, generate a comprehensive executive briefing. Be specific, data-driven, and actionable. Reference actual numbers from the data. Identify risks proactively and surface strategic opportunities.

Return JSON matching this exact schema:
{
  "briefing_period": "${period}",
  "generated_at": "${now.toISOString()}",
  "executive_summary": "<3-4 sentence high-level narrative covering the most important insights for the executive team>",
  "kpi_dashboard": {
    "total_partnerships": ${totalPartnerships},
    "active_deals": ${activeDeals},
    "pipeline_value": ${pipelineValue},
    "avg_deal_value": ${avgDealValue},
    "conversion_rate": ${conversionRate},
    "revenue_growth": ${revenueGrowth}
  },
  "partnership_highlights": [
    { "title": "<partnership name or description>", "status": "<status>", "value": <number>, "key_insight": "<specific actionable insight>" }
  ],
  "risk_alerts": [
    { "risk": "<specific risk description>", "severity": "high|medium|low", "mitigation": "<concrete mitigation action>" }
  ],
  "opportunity_pipeline": [
    { "opportunity": "<description>", "potential_value": <number>, "probability": <0-100>, "next_step": "<specific next action>" }
  ],
  "talent_insights": {
    "new_signings": ${recentTalents.length},
    "top_performers": [<array of name strings>],
    "at_risk": [<array of name strings for talents that may need attention>]
  },
  "competitive_landscape": "<paragraph on competitive positioning and market trends>",
  "financial_summary": {
    "revenue_this_period": ${periodRevenue},
    "outstanding_invoices": ${outstandingInvoices},
    "projected_revenue": ${pipelineValue}
  },
  "action_items": [
    { "priority": "high|medium|low", "action": "<specific action>", "owner": "<suggested owner/role>", "deadline": "<suggested timeframe>" }
  ],
  "strategic_recommendations": [
    "<strategic recommendation string>"
  ]
}

Generate 3-6 partnership_highlights, 2-5 risk_alerts, 3-6 opportunity_pipeline items, 3-5 top_performers, 1-3 at_risk talents, 5-8 action_items, and 3-5 strategic_recommendations. Make sure all dollar values are numbers, not strings.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          briefing_period: { type: 'string' },
          generated_at: { type: 'string' },
          executive_summary: { type: 'string' },
          kpi_dashboard: {
            type: 'object',
            properties: {
              total_partnerships: { type: 'number' },
              active_deals: { type: 'number' },
              pipeline_value: { type: 'number' },
              avg_deal_value: { type: 'number' },
              conversion_rate: { type: 'number' },
              revenue_growth: { type: 'number' },
            },
          },
          partnership_highlights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                status: { type: 'string' },
                value: { type: 'number' },
                key_insight: { type: 'string' },
              },
            },
          },
          risk_alerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                severity: { type: 'string' },
                mitigation: { type: 'string' },
              },
            },
          },
          opportunity_pipeline: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                opportunity: { type: 'string' },
                potential_value: { type: 'number' },
                probability: { type: 'number' },
                next_step: { type: 'string' },
              },
            },
          },
          talent_insights: {
            type: 'object',
            properties: {
              new_signings: { type: 'number' },
              top_performers: { type: 'array', items: { type: 'string' } },
              at_risk: { type: 'array', items: { type: 'string' } },
            },
          },
          competitive_landscape: { type: 'string' },
          financial_summary: {
            type: 'object',
            properties: {
              revenue_this_period: { type: 'number' },
              outstanding_invoices: { type: 'number' },
              projected_revenue: { type: 'number' },
            },
          },
          action_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                priority: { type: 'string' },
                action: { type: 'string' },
                owner: { type: 'string' },
                deadline: { type: 'string' },
              },
            },
          },
          strategic_recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    return new Response(JSON.stringify({ success: true, briefing: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
