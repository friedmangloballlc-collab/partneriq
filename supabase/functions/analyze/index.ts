import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ---------------------------------------------------------------------------
// Unified analyze edge function
// Consolidates: analyzeCampaignPostMortem, analyzeContentEffectiveness, analyzeDealPatterns
//
// POST body: { action: "campaign_postmortem" | "content_effectiveness" | "deal_patterns", ...params }
// ---------------------------------------------------------------------------

type Base44Client = ReturnType<typeof createClientFromRequest>;
type User = Awaited<ReturnType<Base44Client['auth']['me']>>;

const ACTIONS: Record<string, (base44: Base44Client, user: User, params: Record<string, unknown>) => Promise<Response>> = {
  campaign_postmortem: handleCampaignPostMortem,
  content_effectiveness: handleContentEffectiveness,
  deal_patterns: handleDealPatterns,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, ...params } = await req.json();

    const handler = ACTIONS[action as string];
    if (!handler) {
      return Response.json(
        { error: `Unknown action: ${action}. Valid actions: ${Object.keys(ACTIONS).join(', ')}` },
        { status: 400 },
      );
    }

    return await handler(base44, user, params);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});

// ---------------------------------------------------------------------------
// campaign_postmortem
// (previously: analyzeCampaignPostMortem.ts)
// Required params: { partnership_id: string }
// ---------------------------------------------------------------------------
async function handleCampaignPostMortem(
  base44: Base44Client,
  _user: User,
  params: Record<string, unknown>,
): Promise<Response> {
  const { partnership_id } = params;
  if (!partnership_id) return Response.json({ error: 'partnership_id required' }, { status: 400 });

  // Fetch the partnership
  const partnerships = await base44.entities.Partnership.list('-created_date', 500);
  const deal = partnerships.find((p: any) => p.id === partnership_id);
  if (!deal) return Response.json({ error: 'Partnership not found' }, { status: 404 });

  // Parallel data fetches
  const [talents, brands, dealNotes, activities, allMetrics] = await Promise.all([
    base44.entities.Talent.list('-created_date', 200),
    base44.entities.Brand.list('-created_date', 200),
    base44.entities.DealNote.filter({ partnership_id }),
    base44.entities.Activity.filter({ resource_id: partnership_id }),
    base44.entities.OutreachMetrics.list('-created_date', 200),
  ]);

  const talent = talents.find((t: any) => t.id === deal.talent_id);
  const brand = brands.find((b: any) => b.id === deal.brand_id);

  // Find outreach metrics linked to this campaign (by campaign_id or by context)
  const campaignMetrics = allMetrics.filter((m: any) => m.campaign_id === partnership_id);

  // Aggregate outreach metrics
  const totalSent = campaignMetrics.reduce((s: number, m: any) => s + (m.total_sent || 0), 0);
  const totalOpened = campaignMetrics.reduce((s: number, m: any) => s + (m.opened || 0), 0);
  const totalReplied = campaignMetrics.reduce((s: number, m: any) => s + (m.replied || 0), 0);
  const avgOpenRate = campaignMetrics.length ? campaignMetrics.reduce((s: number, m: any) => s + (m.open_rate || 0), 0) / campaignMetrics.length : null;
  const avgReplyRate = campaignMetrics.length ? campaignMetrics.reduce((s: number, m: any) => s + (m.reply_rate || 0), 0) / campaignMetrics.length : null;
  const avgConversionRate = campaignMetrics.length ? campaignMetrics.reduce((s: number, m: any) => s + (m.conversion_rate || 0), 0) / campaignMetrics.length : null;

  const prompt = `You are a senior partnership campaign analyst. Generate a thorough post-campaign analysis for the following completed partnership deal.

**Partnership Details:**
- Title: ${deal.title}
- Type: ${deal.partnership_type || 'Unknown'}
- Status: ${deal.status}
- Deal Value: ${deal.deal_value ? '$' + deal.deal_value.toLocaleString() : 'Not recorded'}
- Match Score: ${deal.match_score || 'N/A'}/100
- Priority: ${deal.priority || 'N/A'}
- Start Date: ${deal.start_date || 'N/A'}
- End Date: ${deal.end_date || 'N/A'}
- Notes: ${deal.notes || 'None'}

**Talent:**
${talent ? `
- Name: ${talent.name}
- Tier: ${talent.tier}
- Platform: ${talent.primary_platform}
- Niche: ${talent.niche}
- Followers: ${talent.total_followers?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${talent.engagement_rate || 'Unknown'}%
- Trajectory: ${talent.trajectory || 'Unknown'}
` : 'No linked talent profile'}

**Brand:**
${brand ? `
- Name: ${brand.name}
- Industry: ${brand.industry}
- Company Size: ${brand.company_size}
- Annual Budget: ${brand.annual_budget ? '$' + brand.annual_budget.toLocaleString() : 'Unknown'}
` : 'No linked brand profile'}

**Outreach Performance (${campaignMetrics.length} metric records):**
${campaignMetrics.length > 0 ? `
- Total Emails Sent: ${totalSent}
- Total Opened: ${totalOpened}
- Total Replied: ${totalReplied}
- Avg Open Rate: ${avgOpenRate ? avgOpenRate.toFixed(1) + '%' : 'N/A'}
- Avg Reply Rate: ${avgReplyRate ? avgReplyRate.toFixed(1) + '%' : 'N/A'}
- Avg Conversion Rate: ${avgConversionRate ? avgConversionRate.toFixed(1) + '%' : 'N/A'}
- Outreach Types Used: ${[...new Set(campaignMetrics.map((m: any) => m.outreach_type))].join(', ')}
` : 'No outreach metrics recorded for this campaign.'}

**Deal Notes (${dealNotes.length} notes):**
${dealNotes.slice(0, 8).map((n: any) => `[${n.note_type?.toUpperCase()}] ${n.content?.slice(0, 200)}`).join('\n') || 'No notes recorded'}

**Activity Log (${activities.length} events):**
${activities.slice(0, 10).map((a: any) => `- ${a.action}: ${a.description}`).join('\n') || 'No activities logged'}

Based on all available data, generate a comprehensive post-campaign analysis. Be specific and data-driven where possible, and honest about gaps in data.

Return a JSON object:
{
  "overall_rating": <"excellent"|"good"|"average"|"below_average"|"poor">,
  "executive_summary": <2-3 sentence high-level summary of how the campaign performed>,
  "key_successes": [<array of 2-4 specific successes with brief explanations>],
  "key_challenges": [<array of 1-3 specific challenges encountered>],
  "lessons_learned": [<array of 2-4 actionable lessons for future campaigns>],
  "outreach_assessment": <one sentence assessment of outreach effectiveness>,
  "relationship_quality": <"strong"|"neutral"|"strained"|"unknown">,
  "relationship_notes": <one sentence on how the brand-talent relationship developed>,
  "roi_assessment": <one sentence on whether the deal value was justified>,
  "repeat_recommendation": <"strongly_yes"|"yes"|"neutral"|"no"|"strongly_no">,
  "repeat_reasoning": <one sentence on whether to work with this talent/brand again>,
  "optimization_opportunities": [<array of 2-3 specific things to do differently next time>],
  "benchmark_comparison": <one sentence comparing performance to similar deals if data allows, otherwise note data gap>
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        overall_rating: { type: 'string' },
        executive_summary: { type: 'string' },
        key_successes: { type: 'array', items: { type: 'string' } },
        key_challenges: { type: 'array', items: { type: 'string' } },
        lessons_learned: { type: 'array', items: { type: 'string' } },
        outreach_assessment: { type: 'string' },
        relationship_quality: { type: 'string' },
        relationship_notes: { type: 'string' },
        roi_assessment: { type: 'string' },
        repeat_recommendation: { type: 'string' },
        repeat_reasoning: { type: 'string' },
        optimization_opportunities: { type: 'array', items: { type: 'string' } },
        benchmark_comparison: { type: 'string' },
      }
    }
  });

  return Response.json({ success: true, analysis: result, deal_title: deal.title });
}

// ---------------------------------------------------------------------------
// content_effectiveness
// (previously: analyzeContentEffectiveness.ts)
// Required params: none
// ---------------------------------------------------------------------------
async function handleContentEffectiveness(
  base44: Base44Client,
  _user: User,
  _params: Record<string, unknown>,
): Promise<Response> {
  const [emails, sequences, metrics] = await Promise.all([
    base44.entities.OutreachEmail.list('-created_date', 300),
    base44.entities.OutreachSequence.list('-created_date', 200),
    base44.entities.OutreachMetrics.list('-created_date', 200),
  ]);

  if (!emails.length && !sequences.length) {
    return Response.json({ error: 'No outreach data found to analyze.' }, { status: 400 });
  }

  // -- Subject line analysis --------------------------------------------------
  const subjectStats: Record<string, { total: number; opened: number; replied: number }> = {};
  emails.forEach((e: any) => {
    if (!e.subject) return;
    const subject = e.subject;
    const opened = e.status === 'opened' || e.status === 'clicked' || e.status === 'replied';
    const replied = e.status === 'replied';

    // Classify subject line patterns
    const patterns: string[] = [];
    if (/\?/.test(subject)) patterns.push('question');
    if (/\d/.test(subject)) patterns.push('number');
    if (/\b(you|your)\b/i.test(subject)) patterns.push('personalized_you');
    if (/\b(quick|just|short)\b/i.test(subject)) patterns.push('brevity_signal');
    if (/\b(exclusive|unique|only)\b/i.test(subject)) patterns.push('exclusivity');
    if (/\b(collab|collaboration|partner|partnership)\b/i.test(subject)) patterns.push('collab_keyword');
    if (/\b(love|loved|fan|fan of)\b/i.test(subject)) patterns.push('flattery');
    if (subject.length < 40) patterns.push('short_subject');
    else if (subject.length > 70) patterns.push('long_subject');
    else patterns.push('medium_subject');

    patterns.forEach(p => {
      if (!subjectStats[p]) subjectStats[p] = { total: 0, opened: 0, replied: 0 };
      subjectStats[p].total++;
      if (opened) subjectStats[p].opened++;
      if (replied) subjectStats[p].replied++;
    });
  });

  const subjectInsights = Object.entries(subjectStats)
    .filter(([, s]) => s.total >= 2)
    .map(([pattern, s]) => ({
      pattern,
      total: s.total,
      open_rate: s.total > 0 ? Math.round((s.opened / s.total) * 100) : 0,
      reply_rate: s.total > 0 ? Math.round((s.replied / s.total) * 100) : 0,
    }))
    .sort((a, b) => b.reply_rate - a.reply_rate);

  // -- Personalization token analysis -----------------------------------------
  const personalizationStats = {
    with_name: { total: 0, opened: 0, replied: 0 },
    with_company: { total: 0, opened: 0, replied: 0 },
    generic: { total: 0, opened: 0, replied: 0 },
  };

  // Build sequence lookup for target_name / target_company
  const seqMap: Record<string, any> = {};
  sequences.forEach((s: any) => { seqMap[s.id] = s; });

  emails.forEach((e: any) => {
    const body = (e.body || '') + (e.subject || '');
    const opened = e.status === 'opened' || e.status === 'clicked' || e.status === 'replied';
    const replied = e.status === 'replied';

    const hasNameToken = /\{\{target_name\}\}|Hi [A-Z][a-z]+|Hello [A-Z][a-z]+/i.test(body) || (e.to_name && body.includes(e.to_name));
    const hasCompanyToken = /\{\{target_company\}\}/i.test(body) || (e.to_name && body.length > 0);

    if (hasNameToken) {
      personalizationStats.with_name.total++;
      if (opened) personalizationStats.with_name.opened++;
      if (replied) personalizationStats.with_name.replied++;
    } else if (hasCompanyToken) {
      personalizationStats.with_company.total++;
      if (opened) personalizationStats.with_company.opened++;
      if (replied) personalizationStats.with_company.replied++;
    } else {
      personalizationStats.generic.total++;
      if (opened) personalizationStats.generic.opened++;
      if (replied) personalizationStats.generic.replied++;
    }
  });

  // -- Email type performance -------------------------------------------------
  const typeStats: Record<string, { total: number; opened: number; replied: number }> = {};
  emails.forEach((e: any) => {
    const t = e.email_type || 'unknown';
    if (!typeStats[t]) typeStats[t] = { total: 0, opened: 0, replied: 0 };
    typeStats[t].total++;
    if (['opened', 'clicked', 'replied'].includes(e.status)) typeStats[t].opened++;
    if (e.status === 'replied') typeStats[t].replied++;
  });

  // -- Sequence-level open/reply rates ----------------------------------------
  const seqPerf = sequences
    .filter((s: any) => s.total_sent > 0)
    .map((s: any) => ({
      name: s.name,
      total_sent: s.total_sent,
      open_rate: s.open_rate || 0,
      reply_rate: s.reply_rate || 0,
      target_name: s.target_name || null,
      target_company: s.target_company || null,
      has_personalization: !!(s.target_name || s.target_company),
    }))
    .sort((a: any, b: any) => b.reply_rate - a.reply_rate);

  // -- Metrics-level analysis -------------------------------------------------
  const abTests = metrics.filter((m: any) => m.ab_test_element && m.ab_variant);
  const abSummary = abTests.slice(0, 10).map((m: any) => ({
    element: m.ab_test_element,
    variant: m.ab_variant,
    open_rate: m.open_rate,
    reply_rate: m.reply_rate,
    conversion_rate: m.conversion_rate,
    sample_size: m.sample_size,
    winner: m.winning_variant,
  }));

  // Build AI prompt
  const prompt = `You are a world-class email marketing and outreach optimization expert. Analyze the following outreach performance data and provide deep, actionable content effectiveness insights.

**SUBJECT LINE PATTERN PERFORMANCE:**
${subjectInsights.length > 0 ? subjectInsights.map(s =>
  `- Pattern "${s.pattern}": ${s.total} emails, ${s.open_rate}% open rate, ${s.reply_rate}% reply rate`
).join('\n') : 'Limited subject line data available'}

**PERSONALIZATION TOKEN PERFORMANCE:**
- With recipient name: ${personalizationStats.with_name.total} emails, ${personalizationStats.with_name.total > 0 ? Math.round((personalizationStats.with_name.replied / personalizationStats.with_name.total) * 100) : 0}% reply rate
- With company reference: ${personalizationStats.with_company.total} emails, ${personalizationStats.with_company.total > 0 ? Math.round((personalizationStats.with_company.replied / personalizationStats.with_company.total) * 100) : 0}% reply rate
- Generic (no personalization): ${personalizationStats.generic.total} emails, ${personalizationStats.generic.total > 0 ? Math.round((personalizationStats.generic.replied / personalizationStats.generic.total) * 100) : 0}% reply rate

**EMAIL TYPE PERFORMANCE:**
${Object.entries(typeStats).map(([type, s]) =>
  `- ${type}: ${s.total} sent, ${s.total > 0 ? Math.round((s.opened / s.total) * 100) : 0}% open, ${s.total > 0 ? Math.round((s.replied / s.total) * 100) : 0}% reply`
).join('\n')}

**TOP PERFORMING SEQUENCES (by reply rate):**
${seqPerf.slice(0, 5).map((s: any) =>
  `- "${s.name}": ${s.total_sent} sent, ${s.open_rate}% open, ${s.reply_rate}% reply${s.has_personalization ? ` [PERSONALIZED: ${s.target_name || ''} @ ${s.target_company || ''}]` : ' [GENERIC]'}`
).join('\n')}

**A/B TEST RESULTS:**
${abSummary.length > 0 ? abSummary.map(a =>
  `- Testing ${a.element} (${a.variant}): ${a.open_rate}% open, ${a.reply_rate}% reply${a.winner ? `, winner: ${a.winner}` : ''}`
).join('\n') : 'No A/B test data available'}

**TOTAL DATA:**
- Total emails analyzed: ${emails.length}
- Total sequences analyzed: ${sequences.length}
- Total outreach metrics records: ${metrics.length}

**INDUSTRY BENCHMARKS (for context):**
- Average cold outreach open rate: 25-35%
- Average reply rate: 8-15%
- Personalized emails get 26% higher open rates
- Subject lines with questions get 10-15% higher reply rates
- Follow-up emails often have 2x the reply rate of initial outreach

Provide a comprehensive, data-driven content effectiveness analysis. Be specific about what the data shows.

Return a JSON object:
{
  "headline_insight": <one powerful, specific sentence summarizing the most important finding>,
  "subject_line_insights": [
    {
      "pattern": <pattern name, human-readable>,
      "performance": <"top"|"average"|"poor">,
      "open_rate": <number>,
      "reply_rate": <number>,
      "sample_count": <number>,
      "insight": <specific insight about why this pattern performs the way it does>,
      "recommendation": <specific action to take>
    }
  ],
  "personalization_insights": {
    "verdict": <"high_impact"|"moderate_impact"|"low_impact">,
    "summary": <2-sentence summary of personalization impact>,
    "top_tokens": [<array of 2-3 most impactful personalization tokens/approaches to use>],
    "avoid": [<array of 1-2 personalization mistakes to avoid>]
  },
  "email_type_insights": [
    {
      "type": <email type>,
      "open_rate": <number>,
      "reply_rate": <number>,
      "insight": <what makes this type perform well or poorly>
    }
  ],
  "cta_recommendations": [<array of 3-4 specific, actionable CTA improvements based on the data>],
  "winning_formula": {
    "subject_line_template": <example subject line template using best patterns>,
    "opening_line": <example high-performing opening line>,
    "personalization_tokens": [<list of tokens to use>],
    "cta": <example CTA>
  },
  "ab_test_findings": <string summary of A/B test results, or "No A/B test data available" if none>,
  "quick_wins": [<array of 3 immediately actionable improvements ranked by expected impact>]
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        headline_insight: { type: 'string' },
        subject_line_insights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              performance: { type: 'string' },
              open_rate: { type: 'number' },
              reply_rate: { type: 'number' },
              sample_count: { type: 'number' },
              insight: { type: 'string' },
              recommendation: { type: 'string' },
            }
          }
        },
        personalization_insights: {
          type: 'object',
          properties: {
            verdict: { type: 'string' },
            summary: { type: 'string' },
            top_tokens: { type: 'array', items: { type: 'string' } },
            avoid: { type: 'array', items: { type: 'string' } },
          }
        },
        email_type_insights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              open_rate: { type: 'number' },
              reply_rate: { type: 'number' },
              insight: { type: 'string' },
            }
          }
        },
        cta_recommendations: { type: 'array', items: { type: 'string' } },
        winning_formula: {
          type: 'object',
          properties: {
            subject_line_template: { type: 'string' },
            opening_line: { type: 'string' },
            personalization_tokens: { type: 'array', items: { type: 'string' } },
            cta: { type: 'string' },
          }
        },
        ab_test_findings: { type: 'string' },
        quick_wins: { type: 'array', items: { type: 'string' } },
      }
    }
  });

  return Response.json({ success: true, analysis: result, totalEmails: emails.length, totalSequences: sequences.length });
}

// ---------------------------------------------------------------------------
// deal_patterns
// (previously: analyzeDealPatterns.ts)
// Required params: none
// ---------------------------------------------------------------------------
async function handleDealPatterns(
  base44: Base44Client,
  _user: User,
  _params: Record<string, unknown>,
): Promise<Response> {
  const [partnerships, sequences, emails, notes] = await Promise.all([
    base44.entities.Partnership.list('-created_date', 500),
    base44.entities.OutreachSequence.list('-created_date', 200),
    base44.entities.OutreachEmail.list('-created_date', 300),
    base44.entities.DealNote.list('-created_date', 200),
  ]);

  if (partnerships.length === 0) {
    return Response.json({ error: 'No partnership data found to analyze.' }, { status: 400 });
  }

  // -- Compute stats ----------------------------------------------------------
  const total = partnerships.length;
  const completed = partnerships.filter((p: any) => p.status === 'completed');
  const churned = partnerships.filter((p: any) => p.status === 'churned');
  const active = partnerships.filter((p: any) => p.status === 'active');

  // Outreach method -> outcome correlation
  const emailsByPartnership: Record<string, any[]> = {};
  emails.forEach((e: any) => {
    if (!e.partnership_id) return;
    if (!emailsByPartnership[e.partnership_id]) emailsByPartnership[e.partnership_id] = [];
    emailsByPartnership[e.partnership_id].push(e);
  });

  const seqByPartnership: Record<string, any[]> = {};
  sequences.forEach((s: any) => {
    if (!s.partnership_id) return;
    if (!seqByPartnership[s.partnership_id]) seqByPartnership[s.partnership_id] = [];
    seqByPartnership[s.partnership_id].push(s);
  });

  // Outreach stats for completed vs churned
  const outreachStats = (group: any[], label: string) => {
    const withEmails = group.filter(p => emailsByPartnership[p.id]?.length > 0);
    const withSequences = group.filter(p => seqByPartnership[p.id]?.length > 0);
    const avgEmailsPerDeal = withEmails.length > 0
      ? (withEmails.reduce((s, p) => s + emailsByPartnership[p.id].length, 0) / group.length).toFixed(1)
      : 0;
    const repliedDeals = group.filter(p =>
      emailsByPartnership[p.id]?.some((e: any) => e.status === 'replied')
    ).length;
    const aiGeneratedEmailDeals = group.filter(p =>
      emailsByPartnership[p.id]?.some((e: any) => e.ai_generated)
    ).length;
    return { label, count: group.length, withEmails: withEmails.length, withSequences: withSequences.length, avgEmailsPerDeal, repliedDeals, aiGeneratedEmailDeals };
  };

  const completedStats = outreachStats(completed, 'completed');
  const churnedStats = outreachStats(churned, 'churned');

  // Partnership type win rates
  const typeWinRates: Record<string, { total: number; completed: number; churned: number; totalValue: number }> = {};
  partnerships.forEach((p: any) => {
    const t = p.partnership_type || 'unknown';
    if (!typeWinRates[t]) typeWinRates[t] = { total: 0, completed: 0, churned: 0, totalValue: 0 };
    typeWinRates[t].total++;
    if (p.status === 'completed') typeWinRates[t].completed++;
    if (p.status === 'churned') typeWinRates[t].churned++;
    typeWinRates[t].totalValue += p.deal_value || 0;
  });

  // Priority win rates
  const priorityWinRates: Record<string, { total: number; completed: number; churned: number }> = {};
  partnerships.forEach((p: any) => {
    const pr = p.priority || 'unknown';
    if (!priorityWinRates[pr]) priorityWinRates[pr] = { total: 0, completed: 0, churned: 0 };
    priorityWinRates[pr].total++;
    if (p.status === 'completed') priorityWinRates[pr].completed++;
    if (p.status === 'churned') priorityWinRates[pr].churned++;
  });

  // Match score vs outcome
  const matchVsOutcome: Record<string, { range: string; total: number; completed: number; churned: number }> = {
    high: { range: '70-100', total: 0, completed: 0, churned: 0 },
    mid:  { range: '40-69',  total: 0, completed: 0, churned: 0 },
    low:  { range: '0-39',   total: 0, completed: 0, churned: 0 },
  };
  partnerships.filter((p: any) => p.match_score > 0).forEach((p: any) => {
    const bucket = p.match_score >= 70 ? 'high' : p.match_score >= 40 ? 'mid' : 'low';
    matchVsOutcome[bucket].total++;
    if (p.status === 'completed') matchVsOutcome[bucket].completed++;
    if (p.status === 'churned') matchVsOutcome[bucket].churned++;
  });

  // Avg deal cycle (days from created to completed/churned)
  const closedWithDates = [...completed, ...churned].filter((p: any) => p.created_date && p.updated_date);
  const avgCycleDays = closedWithDates.length > 0
    ? Math.round(closedWithDates.reduce((s: number, p: any) => {
        const diff = (new Date(p.updated_date).getTime() - new Date(p.created_date).getTime()) / (1000 * 60 * 60 * 24);
        return s + diff;
      }, 0) / closedWithDates.length)
    : null;

  // Notes correlation
  const notesByPartnership: Record<string, number> = {};
  notes.forEach((n: any) => {
    notesByPartnership[n.partnership_id] = (notesByPartnership[n.partnership_id] || 0) + 1;
  });
  const avgNotesCompleted = completed.length > 0
    ? (completed.reduce((s: number, p: any) => s + (notesByPartnership[p.id] || 0), 0) / completed.length).toFixed(1)
    : 0;
  const avgNotesChurned = churned.length > 0
    ? (churned.reduce((s: number, p: any) => s + (notesByPartnership[p.id] || 0), 0) / churned.length).toFixed(1)
    : 0;

  const prompt = `You are an expert partnership strategy analyst. Analyze this historical deal data and produce a comprehensive AI intelligence report identifying patterns, winning strategies, and improvement areas.

**DEAL OVERVIEW:**
- Total partnerships: ${total}
- Completed (won): ${completed.length} (${total > 0 ? Math.round(completed.length/total*100) : 0}%)
- Churned (lost): ${churned.length} (${total > 0 ? Math.round(churned.length/total*100) : 0}%)
- Active: ${active.length}
- Avg deal cycle: ${avgCycleDays !== null ? avgCycleDays + ' days' : 'unknown'}

**OUTREACH -> OUTCOME CORRELATION:**
Completed deals:
- ${completedStats.withEmails} of ${completedStats.count} had outreach emails
- Avg emails per deal: ${completedStats.avgEmailsPerDeal}
- Deals where prospect replied: ${completedStats.repliedDeals}
- Deals using AI-generated emails: ${completedStats.aiGeneratedEmailDeals}
- Deals with automated sequences: ${completedStats.withSequences}

Churned deals:
- ${churnedStats.withEmails} of ${churnedStats.count} had outreach emails
- Avg emails per deal: ${churnedStats.avgEmailsPerDeal}
- Deals where prospect replied: ${churnedStats.repliedDeals}
- Deals using AI-generated emails: ${churnedStats.aiGeneratedEmailDeals}
- Deals with automated sequences: ${churnedStats.withSequences}

**PARTNERSHIP TYPE WIN RATES:**
${Object.entries(typeWinRates).map(([type, d]) =>
  `- ${type}: ${d.total} deals, ${d.completed} won (${d.total > 0 ? Math.round(d.completed/d.total*100) : 0}% win rate), ${d.churned} lost, avg value $${Math.round(d.totalValue/(d.total||1)).toLocaleString()}`
).join('\n')}

**PRIORITY WIN RATES:**
${Object.entries(priorityWinRates).map(([pr, d]) =>
  `- ${pr}: ${d.total} deals, ${d.completed} won (${d.total > 0 ? Math.round(d.completed/d.total*100) : 0}% win rate), ${d.churned} lost`
).join('\n')}

**MATCH SCORE VS OUTCOME:**
${Object.entries(matchVsOutcome).map(([, d]) =>
  `- Score ${d.range}: ${d.total} deals, ${d.completed} won (${d.total > 0 ? Math.round(d.completed/d.total*100) : 0}%), ${d.churned} lost`
).join('\n')}

**DEAL NOTES ENGAGEMENT:**
- Avg notes on COMPLETED deals: ${avgNotesCompleted}
- Avg notes on CHURNED deals: ${avgNotesChurned}

Analyze all of this data holistically. Identify what separates winning deals from losing ones. Be specific and data-driven.

Return JSON:
{
  "executive_summary": "<2-3 sentence narrative of the most important overall finding>",
  "winning_patterns": [
    {
      "pattern": "<short name>",
      "evidence": "<specific data point(s) supporting this>",
      "impact": "<high|medium|low>",
      "recommendation": "<concrete action to replicate this>"
    }
  ],
  "risk_factors": [
    {
      "factor": "<short name>",
      "evidence": "<specific data point(s)>",
      "severity": "<high|medium|low>",
      "mitigation": "<concrete action to reduce this risk>"
    }
  ],
  "outreach_intelligence": {
    "headline": "<one sentence on what outreach approach correlates most with wins>",
    "best_method": "<description of the outreach method that correlates with completed deals>",
    "avoid": "<description of outreach pattern correlated with churned deals>",
    "sequence_impact": "<insight on automated sequences vs manual emails>"
  },
  "type_recommendation": "<which partnership type to prioritize and why, based on win rates>",
  "match_score_insight": "<what the match score data reveals about deal quality vs outcomes>",
  "pipeline_health": "<one paragraph assessing overall pipeline health and velocity>",
  "top_3_actions": [
    "<most impactful action to take immediately>",
    "<second action>",
    "<third action>"
  ]
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        winning_patterns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              evidence: { type: 'string' },
              impact: { type: 'string' },
              recommendation: { type: 'string' },
            }
          }
        },
        risk_factors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              factor: { type: 'string' },
              evidence: { type: 'string' },
              severity: { type: 'string' },
              mitigation: { type: 'string' },
            }
          }
        },
        outreach_intelligence: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            best_method: { type: 'string' },
            avoid: { type: 'string' },
            sequence_impact: { type: 'string' },
          }
        },
        type_recommendation: { type: 'string' },
        match_score_insight: { type: 'string' },
        pipeline_health: { type: 'string' },
        top_3_actions: { type: 'array', items: { type: 'string' } },
      }
    }
  });

  return Response.json({ success: true, analysis: result });
}
