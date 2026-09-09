import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sequence_id } = await req.json();
    if (!sequence_id) return Response.json({ error: 'sequence_id required' }, { status: 400 });

    // Fetch target sequence
    const sequences = await base44.entities.OutreachSequence.list('-created_date', 200);
    const seq = sequences.find(s => s.id === sequence_id);
    if (!seq) return Response.json({ error: 'Sequence not found' }, { status: 404 });

    // Parse steps
    let steps = [];
    try { steps = JSON.parse(seq.steps || '[]'); } catch {}

    // Historical performance across all sequences
    const allSequences = sequences.filter(s => s.total_sent > 0);
    const avgOpenRate = allSequences.length
      ? (allSequences.reduce((s, x) => s + (x.open_rate || 0), 0) / allSequences.length).toFixed(1)
      : 0;
    const avgReplyRate = allSequences.length
      ? (allSequences.reduce((s, x) => s + (x.reply_rate || 0), 0) / allSequences.length).toFixed(1)
      : 0;

    // Best performing sequences (top 3 by reply_rate)
    const topSeqs = [...allSequences]
      .sort((a, b) => (b.reply_rate || 0) - (a.reply_rate || 0))
      .slice(0, 3);

    // OutreachEmails for this sequence's target email (historical engagement with this contact)
    let contactHistory = [];
    if (seq.target_email) {
      const emails = await base44.entities.OutreachEmail.filter({ to_email: seq.target_email });
      contactHistory = emails;
    }

    // Talent profile lookup
    let talent = null;
    if (seq.target_name) {
      const talents = await base44.entities.Talent.list('-created_date', 200);
      talent = talents.find(t =>
        t.name?.toLowerCase().includes(seq.target_name.toLowerCase()) ||
        seq.target_name.toLowerCase().includes(t.name?.toLowerCase() || '')
      );
    }

    // Brand lookup
    let brand = null;
    if (seq.target_company) {
      const brands = await base44.entities.Brand.list('-created_date', 200);
      brand = brands.find(b =>
        b.name?.toLowerCase().includes(seq.target_company.toLowerCase()) ||
        seq.target_company.toLowerCase().includes(b.name?.toLowerCase() || '')
      );
    }

    // Build step analysis
    const stepSummaries = steps.map((s, i) => ({
      step: i + 1,
      type: s.email_type,
      delay_days: s.delay_days,
      subject_length: s.subject?.length || 0,
      body_word_count: s.body ? s.body.split(/\s+/).length : 0,
      has_personalization: !!(s.body?.includes('{{') || s.subject?.includes('{{')),
      subject_preview: s.subject?.slice(0, 80) || '(no subject)',
    }));

    const prompt = `You are an expert outreach conversion analyst for an influencer marketing platform.

Analyze the following outreach sequence and forecast its conversion likelihood (probability of getting a reply/meeting that leads to a partnership deal).

**Sequence Details:**
- Name: ${seq.name}
- Target contact: ${seq.target_name || 'Unknown'} (${seq.target_email || 'no email'})
- Target company: ${seq.target_company || 'Unknown'}
- Channel: ${seq.channel || 'email'}
- Status: ${seq.status}
- Total steps: ${steps.length}
- Step breakdown:
${stepSummaries.map(s => `  Step ${s.step}: ${s.type} | delay +${s.delay_days}d | "${s.subject_preview}" | ${s.body_word_count} words | personalization: ${s.has_personalization}`).join('\n')}

**Talent Profile (if found):**
${talent ? `
- Name: ${talent.name}
- Followers: ${talent.total_followers?.toLocaleString() || 'Unknown'}
- Engagement rate: ${talent.engagement_rate || 'Unknown'}%
- Tier: ${talent.tier || 'Unknown'}
- Niche: ${talent.niche || 'Unknown'}
- Trajectory: ${talent.trajectory || 'Unknown'}
- Availability: ${talent.availability_status || 'Unknown'}
- Brand safety score: ${talent.brand_safety_score || 'Unknown'}/100
` : 'No linked talent profile found'}

**Brand Profile (if found):**
${brand ? `
- Industry: ${brand.industry || 'Unknown'}
- Company size: ${brand.company_size || 'Unknown'}
- Previous partnerships: ${brand.previous_partnerships || 'Unknown'}
- Annual budget: ${brand.annual_budget ? '$' + brand.annual_budget.toLocaleString() : 'Unknown'}
` : 'No linked brand profile found'}

**Contact History (prior emails to this contact):**
${contactHistory.length > 0
  ? contactHistory.slice(0, 5).map(e => `- ${e.email_type}: status=${e.status}, subject="${e.subject?.slice(0, 60)}"`).join('\n')
  : 'No prior contact history'}

**Platform Benchmarks:**
- Avg open rate across all sequences: ${avgOpenRate}%
- Avg reply rate across all sequences: ${avgReplyRate}%
- Top performing sequences reply rates: ${topSeqs.map(s => `${s.reply_rate}%`).join(', ') || 'N/A'}

Provide a detailed, actionable conversion forecast. Be specific about each step and the subject lines.

Return a JSON object with these exact fields:
{
  "conversion_probability": <integer 0-100, probability this sequence generates a partnership reply/meeting>,
  "projected_open_rate": <integer 0-100>,
  "projected_reply_rate": <integer 0-100>,
  "confidence": <"low"|"medium"|"high">,
  "verdict": <"high_converter"|"average"|"underperformer"|"needs_work">,
  "verdict_label": <short human-readable string>,
  "headline": <one sharp sentence summarizing the forecast>,
  "strongest_step": <integer, 1-indexed step number most likely to get engagement>,
  "weakest_step": <integer, 1-indexed step number most likely to underperform>,
  "step_forecasts": [
    {
      "step": <number>,
      "type": <string>,
      "projected_open_rate": <integer>,
      "projected_reply_rate": <integer>,
      "assessment": <one sentence about this specific step>
    }
  ],
  "conversion_drivers": [<array of 2-3 specific positive factors driving conversion>],
  "conversion_blockers": [<array of 2-3 specific factors hurting conversion>],
  "optimization_tips": [<array of 3 concrete, specific improvements>],
  "best_send_time": <recommended send time/day, e.g. "Tuesday 9am">,
  "similar_sequence_benchmark": <one sentence comparing to top performers on the platform>
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          conversion_probability: { type: 'number' },
          projected_open_rate: { type: 'number' },
          projected_reply_rate: { type: 'number' },
          confidence: { type: 'string' },
          verdict: { type: 'string' },
          verdict_label: { type: 'string' },
          headline: { type: 'string' },
          strongest_step: { type: 'number' },
          weakest_step: { type: 'number' },
          step_forecasts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'number' },
                type: { type: 'string' },
                projected_open_rate: { type: 'number' },
                projected_reply_rate: { type: 'number' },
                assessment: { type: 'string' },
              }
            }
          },
          conversion_drivers: { type: 'array', items: { type: 'string' } },
          conversion_blockers: { type: 'array', items: { type: 'string' } },
          optimization_tips: { type: 'array', items: { type: 'string' } },
          best_send_time: { type: 'string' },
          similar_sequence_benchmark: { type: 'string' },
        }
      }
    });

    return Response.json({ success: true, forecast: result, sequence_name: seq.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});