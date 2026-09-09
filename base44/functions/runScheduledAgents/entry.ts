import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Recommended schedule frequencies for each agent
const AGENT_SCHEDULE_CONFIG: Record<string, { defaultFrequency: string; description: string }> = {
  analyzeContractIntelligence:       { defaultFrequency: 'daily',   description: 'Contract clause analysis & risk detection' },
  analyzeCompetitorIntelligence:     { defaultFrequency: 'daily',   description: 'Competitor activity & market positioning' },
  analyzeAudienceOverlap:           { defaultFrequency: 'weekly',  description: 'Cross-partner audience overlap analysis' },
  analyzeRelationshipHealth:         { defaultFrequency: 'daily',   description: 'Partnership health scoring & alerts' },
  generateCreativeDirection:         { defaultFrequency: 'weekly',  description: 'AI-driven creative brief generation' },
  analyzeNegotiationCoach:           { defaultFrequency: 'daily',   description: 'Deal negotiation strategy & coaching' },
  analyzeTrendPrediction:            { defaultFrequency: 'daily',   description: 'Market trend forecasting & signals' },
  analyzeBrandSafety:                { defaultFrequency: 'hourly',  description: 'Brand safety monitoring & risk flags' },
  analyzeCrossPlatformAttribution:   { defaultFrequency: 'daily',   description: 'Multi-platform attribution modeling' },
  analyzeRosterOptimization:         { defaultFrequency: 'weekly',  description: 'Talent roster balancing & recommendations' },
  analyzeInvoiceReconciliation:      { defaultFrequency: 'daily',   description: 'Invoice matching & discrepancy detection' },
  analyzeComplianceDisclosure:       { defaultFrequency: 'hourly',  description: 'FTC/regulatory compliance checking' },
};

const ALL_AGENT_NAMES = Object.keys(AGENT_SCHEDULE_CONFIG);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const agentsToRun: string[] = body.agents && Array.isArray(body.agents) && body.agents.length > 0
      ? body.agents.filter((a: string) => ALL_AGENT_NAMES.includes(a))
      : ALL_AGENT_NAMES;

    if (agentsToRun.length === 0) {
      return Response.json({ error: 'No valid agent names provided.' }, { status: 400 });
    }

    const results: Record<string, { status: string; summary: string; timestamp: string }> = {};

    for (const agentName of agentsToRun) {
      const timestamp = new Date().toISOString();
      try {
        const result = await base44.functions.invoke(agentName, {});
        results[agentName] = {
          status: 'success',
          summary: result?.summary || result?.message || 'Agent completed successfully.',
          timestamp,
        };
      } catch (err) {
        results[agentName] = {
          status: 'error',
          summary: err instanceof Error ? err.message : 'Unknown error occurred.',
          timestamp,
        };
      }
    }

    return Response.json({
      success: true,
      ran_at: new Date().toISOString(),
      agent_count: agentsToRun.length,
      results,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
});
