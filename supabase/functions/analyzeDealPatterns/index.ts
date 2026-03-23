import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const [partnerships, sequences, emails, notes] = await Promise.all([
      base44.entities.Partnership.list('-created_date', 100),
      base44.entities.OutreachSequence.list('-created_date', 50),
      base44.entities.OutreachEmail.list('-created_date', 100),
      base44.entities.DealNote.list('-created_date', 50),
    ]);

    if (partnerships.length === 0) {
      return new Response(JSON.stringify({ error: 'No partnership data found to analyze.' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Compute stats ────────────────────────────────────────────────────────
    const total = partnerships.length;
    const completed = partnerships.filter(p => p.status === 'completed');
    const churned = partnerships.filter(p => p.status === 'churned');
    const active = partnerships.filter(p => p.status === 'active');

    // Outreach method → outcome correlation
    const emailsByPartnership = {};
    emails.forEach(e => {
      if (!e.partnership_id) return;
      if (!emailsByPartnership[e.partnership_id]) emailsByPartnership[e.partnership_id] = [];
      emailsByPartnership[e.partnership_id].push(e);
    });

    const seqByPartnership = {};
    sequences.forEach(s => {
      if (!s.partnership_id) return;
      if (!seqByPartnership[s.partnership_id]) seqByPartnership[s.partnership_id] = [];
      seqByPartnership[s.partnership_id].push(s);
    });

    // Outreach stats for completed vs churned
    const outreachStats = (group, label) => {
      const withEmails = group.filter(p => emailsByPartnership[p.id]?.length > 0);
      const withSequences = group.filter(p => seqByPartnership[p.id]?.length > 0);
      const avgEmailsPerDeal = withEmails.length > 0
        ? (withEmails.reduce((s, p) => s + emailsByPartnership[p.id].length, 0) / group.length).toFixed(1)
        : 0;
      const repliedDeals = group.filter(p =>
        emailsByPartnership[p.id]?.some(e => e.status === 'replied')
      ).length;
      const aiGeneratedEmailDeals = group.filter(p =>
        emailsByPartnership[p.id]?.some(e => e.ai_generated)
      ).length;
      return { label, count: group.length, withEmails: withEmails.length, withSequences: withSequences.length, avgEmailsPerDeal, repliedDeals, aiGeneratedEmailDeals };
    };

    const completedStats = outreachStats(completed, 'completed');
    const churnedStats = outreachStats(churned, 'churned');

    // Partnership type win rates
    const typeWinRates = {};
    partnerships.forEach(p => {
      const t = p.partnership_type || 'unknown';
      if (!typeWinRates[t]) typeWinRates[t] = { total: 0, completed: 0, churned: 0, totalValue: 0 };
      typeWinRates[t].total++;
      if (p.status === 'completed') typeWinRates[t].completed++;
      if (p.status === 'churned') typeWinRates[t].churned++;
      typeWinRates[t].totalValue += p.deal_value || 0;
    });

    // Priority win rates
    const priorityWinRates = {};
    partnerships.forEach(p => {
      const pr = p.priority || 'unknown';
      if (!priorityWinRates[pr]) priorityWinRates[pr] = { total: 0, completed: 0, churned: 0 };
      priorityWinRates[pr].total++;
      if (p.status === 'completed') priorityWinRates[pr].completed++;
      if (p.status === 'churned') priorityWinRates[pr].churned++;
    });

    // Match score vs outcome
    const matchVsOutcome = {
      high: { range: '70–100', total: 0, completed: 0, churned: 0 },
      mid:  { range: '40–69',  total: 0, completed: 0, churned: 0 },
      low:  { range: '0–39',   total: 0, completed: 0, churned: 0 },
    };
    partnerships.filter(p => p.match_score > 0).forEach(p => {
      const bucket = p.match_score >= 70 ? 'high' : p.match_score >= 40 ? 'mid' : 'low';
      matchVsOutcome[bucket].total++;
      if (p.status === 'completed') matchVsOutcome[bucket].completed++;
      if (p.status === 'churned') matchVsOutcome[bucket].churned++;
    });

    // Avg deal cycle (days from created to completed/churned)
    const closedWithDates = [...completed, ...churned].filter(p => p.created_date && p.updated_date);
    const avgCycleDays = closedWithDates.length > 0
      ? Math.round(closedWithDates.reduce((s, p) => {
          const diff = (new Date(p.updated_date) - new Date(p.created_date)) / (1000 * 60 * 60 * 24);
          return s + diff;
        }, 0) / closedWithDates.length)
      : null;

    // Notes correlation
    const notesByPartnership = {};
    notes.forEach(n => {
      notesByPartnership[n.partnership_id] = (notesByPartnership[n.partnership_id] || 0) + 1;
    });
    const avgNotesCompleted = completed.length > 0
      ? (completed.reduce((s, p) => s + (notesByPartnership[p.id] || 0), 0) / completed.length).toFixed(1)
      : 0;
    const avgNotesChurned = churned.length > 0
      ? (churned.reduce((s, p) => s + (notesByPartnership[p.id] || 0), 0) / churned.length).toFixed(1)
      : 0;

    const prompt = `You are an expert partnership strategy analyst. Analyze this historical deal data and produce a comprehensive AI intelligence report identifying patterns, winning strategies, and improvement areas.

**DEAL OVERVIEW:**
- Total partnerships: ${total}
- Completed (won): ${completed.length} (${total > 0 ? Math.round(completed.length/total*100) : 0}%)
- Churned (lost): ${churned.length} (${total > 0 ? Math.round(churned.length/total*100) : 0}%)
- Active: ${active.length}
- Avg deal cycle: ${avgCycleDays !== null ? avgCycleDays + ' days' : 'unknown'}

**OUTREACH → OUTCOME CORRELATION:**
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

    return new Response(JSON.stringify({ success: true, analysis: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});