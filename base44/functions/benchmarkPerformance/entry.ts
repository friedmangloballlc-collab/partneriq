import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [partnerships, sequences, rateBenchmarks, roiBenchmarks, allMetrics] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 500),
      base44.entities.OutreachSequence.list('-created_date', 200),
      base44.entities.RateBenchmark.list('-created_date', 100),
      base44.entities.ROIBenchmark.list('-created_date', 100),
      base44.entities.OutreachMetrics.list('-created_date', 200),
    ]);

    // ── Partnership stats ──────────────────────────────────────────────────────
    const completed = partnerships.filter(p => p.status === 'completed' || p.status === 'active');
    const totalDeals = partnerships.length;
    const activeDeals = partnerships.filter(p => p.status === 'active').length;
    const completedDeals = partnerships.filter(p => p.status === 'completed').length;
    const churnedDeals = partnerships.filter(p => p.status === 'churned').length;
    const totalPipelineValue = partnerships.reduce((s, p) => s + (p.deal_value || 0), 0);
    const avgDealValue = completed.length ? Math.round(completed.reduce((s, p) => s + (p.deal_value || 0), 0) / completed.length) : 0;
    const avgMatchScore = partnerships.filter(p => p.match_score > 0).length
      ? Math.round(partnerships.filter(p => p.match_score > 0).reduce((s, p) => s + (p.match_score || 0), 0) / partnerships.filter(p => p.match_score > 0).length)
      : 0;
    const winRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;
    const churnRate = totalDeals > 0 ? Math.round((churnedDeals / totalDeals) * 100) : 0;

    // Partnership type breakdown
    const typeBreakdown = {};
    partnerships.forEach(p => {
      if (p.partnership_type) typeBreakdown[p.partnership_type] = (typeBreakdown[p.partnership_type] || 0) + 1;
    });
    const topType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // ── Outreach sequence stats ────────────────────────────────────────────────
    const activeSeqs = sequences.filter(s => s.status === 'active' || s.status === 'completed');
    const avgOpenRate = activeSeqs.length
      ? parseFloat((activeSeqs.reduce((s, seq) => s + (seq.open_rate || 0), 0) / activeSeqs.length).toFixed(1))
      : null;
    const avgReplyRate = activeSeqs.length
      ? parseFloat((activeSeqs.reduce((s, seq) => s + (seq.reply_rate || 0), 0) / activeSeqs.length).toFixed(1))
      : null;
    const totalEmailsSent = sequences.reduce((s, seq) => s + (seq.total_sent || 0), 0);

    // Also compute from OutreachMetrics
    const metricsOpenRate = allMetrics.length
      ? parseFloat((allMetrics.reduce((s, m) => s + (m.open_rate || 0), 0) / allMetrics.length).toFixed(1))
      : null;
    const metricsReplyRate = allMetrics.length
      ? parseFloat((allMetrics.reduce((s, m) => s + (m.reply_rate || 0), 0) / allMetrics.length).toFixed(1))
      : null;
    const metricsConversionRate = allMetrics.length
      ? parseFloat((allMetrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) / allMetrics.length).toFixed(1))
      : null;

    const finalOpenRate = avgOpenRate ?? metricsOpenRate;
    const finalReplyRate = avgReplyRate ?? metricsReplyRate;

    // ── Rate benchmarks summary ────────────────────────────────────────────────
    const rateBenchSummary = rateBenchmarks.slice(0, 6).map(r => ({
      tier: r.tier,
      sponsored_post_min: r.sponsored_post_min,
      sponsored_post_max: r.sponsored_post_max,
      brand_deal_min: r.brand_deal_min,
      brand_deal_max: r.brand_deal_max,
      ambassador_annual_min: r.ambassador_annual_min,
      ambassador_annual_max: r.ambassador_annual_max,
    }));

    // ── ROI benchmarks summary ─────────────────────────────────────────────────
    const roiBenchSummary = roiBenchmarks.slice(0, 6).map(r => ({
      deal_type: r.deal_type,
      median_roi: r.median_roi,
      top_quartile_roi: r.top_quartile_roi,
      bottom_quartile_roi: r.bottom_quartile_roi,
    }));

    const prompt = `You are a senior partnership analytics expert. Compare this platform's actual performance data against industry benchmarks and return a structured benchmarking report.

**USER'S ACTUAL PERFORMANCE DATA:**

Partnership Performance:
- Total partnerships: ${totalDeals}
- Active deals: ${activeDeals}
- Completed deals: ${completedDeals}
- Churned deals: ${churnedDeals}
- Win rate (completed/total): ${winRate}%
- Churn rate: ${churnRate}%
- Avg deal value (active/completed): $${avgDealValue.toLocaleString()}
- Total pipeline value: $${totalPipelineValue.toLocaleString()}
- Avg match score: ${avgMatchScore}/100
- Most common partnership type: ${topType}

Outreach Performance:
- Total emails sent: ${totalEmailsSent}
- Avg open rate: ${finalOpenRate !== null ? finalOpenRate + '%' : 'No data'}
- Avg reply rate: ${finalReplyRate !== null ? finalReplyRate + '%' : 'No data'}
- Avg conversion rate: ${metricsConversionRate !== null ? metricsConversionRate + '%' : 'No data'}
- Active/completed sequences: ${activeSeqs.length}

**INDUSTRY BENCHMARK DATA (from platform benchmarks):**

Rate Benchmarks by Tier:
${rateBenchSummary.length > 0 ? rateBenchSummary.map(r =>
  `${r.tier}: sponsored post $${r.sponsored_post_min || 'N/A'}–$${r.sponsored_post_max || 'N/A'}, brand deal $${r.brand_deal_min || 'N/A'}–$${r.brand_deal_max || 'N/A'}`
).join('\n') : 'No rate benchmarks available'}

ROI Benchmarks by Deal Type:
${roiBenchSummary.length > 0 ? roiBenchSummary.map(r =>
  `${r.deal_type}: median ${r.median_roi}x, top quartile ${r.top_quartile_roi}x, bottom quartile ${r.bottom_quartile_roi}x`
).join('\n') : 'No ROI benchmarks available'}

**INDUSTRY CONTEXT (use your knowledge):**
- Industry average email open rate for influencer outreach: ~25–35%
- Industry average reply rate: ~8–15%
- Industry average conversion rate (outreach to deal): ~3–8%
- Industry average deal win rate: ~20–35%
- Industry average churn rate: ~15–25%
- Industry average match score threshold for high-quality matches: 70+

Generate a comprehensive benchmarking report. Be specific about where the user is above, at, or below industry benchmarks.

Return a JSON object:
{
  "overall_grade": <"A"|"B"|"C"|"D"|"F">,
  "overall_summary": <2 sentences summarizing overall performance vs benchmarks>,
  "metrics": [
    {
      "name": <metric name>,
      "user_value": <string, the user's actual value>,
      "benchmark_value": <string, the industry benchmark value>,
      "status": <"above"|"at"|"below">,
      "delta": <string, e.g. "+12pp" or "-3%" or "on par">,
      "insight": <one sentence specific insight about this metric>
    }
  ],
  "strengths": [<array of 2-3 specific areas where the user outperforms benchmarks>],
  "gaps": [<array of 2-3 specific areas that need improvement with context>],
  "quick_wins": [<array of 2-3 immediately actionable improvements to close benchmark gaps>],
  "rate_positioning": <one sentence on how their deal values compare to rate benchmarks for the relevant tiers>,
  "roi_positioning": <one sentence on how their ROI compares to benchmark ROI multipliers>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_grade: { type: 'string' },
          overall_summary: { type: 'string' },
          metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                user_value: { type: 'string' },
                benchmark_value: { type: 'string' },
                status: { type: 'string' },
                delta: { type: 'string' },
                insight: { type: 'string' },
              }
            }
          },
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          quick_wins: { type: 'array', items: { type: 'string' } },
          rate_positioning: { type: 'string' },
          roi_positioning: { type: 'string' },
        }
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      raw: {
        totalDeals, activeDeals, completedDeals, churnedDeals,
        winRate, churnRate, avgDealValue, totalPipelineValue, avgMatchScore,
        finalOpenRate, finalReplyRate, metricsConversionRate, totalEmailsSent,
        activeSeqs: activeSeqs.length,
        rateBenchmarks: rateBenchSummary,
        roiBenchmarks: roiBenchSummary,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});