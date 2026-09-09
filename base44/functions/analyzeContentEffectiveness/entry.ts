import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [emails, sequences, metrics] = await Promise.all([
      base44.entities.OutreachEmail.list('-created_date', 300),
      base44.entities.OutreachSequence.list('-created_date', 200),
      base44.entities.OutreachMetrics.list('-created_date', 200),
    ]);

    if (!emails.length && !sequences.length) {
      return Response.json({ error: 'No outreach data found to analyze.' }, { status: 400 });
    }

    // ── Subject line analysis ──────────────────────────────────────────────────
    const subjectStats = {};
    emails.forEach(e => {
      if (!e.subject) return;
      const subject = e.subject;
      const opened = e.status === 'opened' || e.status === 'clicked' || e.status === 'replied';
      const replied = e.status === 'replied';

      // Classify subject line patterns
      const patterns = [];
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

    // ── Personalization token analysis ─────────────────────────────────────────
    const personalizationStats = { with_name: { total: 0, opened: 0, replied: 0 }, with_company: { total: 0, opened: 0, replied: 0 }, generic: { total: 0, opened: 0, replied: 0 } };

    // Build sequence lookup for target_name / target_company
    const seqMap = {};
    sequences.forEach(s => { seqMap[s.id] = s; });

    emails.forEach(e => {
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

    // ── Email type performance ─────────────────────────────────────────────────
    const typeStats = {};
    emails.forEach(e => {
      const t = e.email_type || 'unknown';
      if (!typeStats[t]) typeStats[t] = { total: 0, opened: 0, replied: 0 };
      typeStats[t].total++;
      if (['opened', 'clicked', 'replied'].includes(e.status)) typeStats[t].opened++;
      if (e.status === 'replied') typeStats[t].replied++;
    });

    // ── Sequence-level open/reply rates ───────────────────────────────────────
    const seqPerf = sequences
      .filter(s => s.total_sent > 0)
      .map(s => ({
        name: s.name,
        total_sent: s.total_sent,
        open_rate: s.open_rate || 0,
        reply_rate: s.reply_rate || 0,
        target_name: s.target_name || null,
        target_company: s.target_company || null,
        has_personalization: !!(s.target_name || s.target_company),
      }))
      .sort((a, b) => b.reply_rate - a.reply_rate);

    // ── Metrics-level analysis ─────────────────────────────────────────────────
    const abTests = metrics.filter(m => m.ab_test_element && m.ab_variant);
    const abSummary = abTests.slice(0, 10).map(m => ({
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
${seqPerf.slice(0, 5).map(s =>
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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});