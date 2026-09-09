import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CHAINS = {
  deal_intelligence: {
    name: "Deal Intelligence",
    description: "End-to-end deal analysis: trends inform competitive positioning which shapes negotiation strategy.",
    steps: [
      { fn: "analyzeTrendPrediction", label: "Trend Prediction" },
      { fn: "analyzeCompetitorIntelligence", label: "Competitor Intelligence" },
      { fn: "analyzeNegotiationCoach", label: "Negotiation Coach" },
    ],
  },
  brand_protection: {
    name: "Brand Protection",
    description: "Comprehensive brand safety pipeline: safety audit feeds compliance review which informs relationship health.",
    steps: [
      { fn: "analyzeBrandSafety", label: "Brand Safety" },
      { fn: "analyzeComplianceDisclosure", label: "Compliance & Disclosure" },
      { fn: "analyzeRelationshipHealth", label: "Relationship Health" },
    ],
  },
  portfolio_optimization: {
    name: "Portfolio Optimization",
    description: "Optimize your creator portfolio: audience overlap analysis informs roster changes which drive attribution insights.",
    steps: [
      { fn: "analyzeAudienceOverlap", label: "Audience Overlap" },
      { fn: "analyzeRosterOptimization", label: "Roster Optimization" },
      { fn: "analyzeCrossPlatformAttribution", label: "Cross-Platform Attribution" },
    ],
  },
  campaign_launch: {
    name: "Campaign Launch",
    description: "Launch-ready intelligence: trend signals shape creative direction which informs contract structuring.",
    steps: [
      { fn: "analyzeTrendPrediction", label: "Trend Prediction" },
      { fn: "generateCreativeDirection", label: "Creative Direction" },
      { fn: "analyzeContractIntelligence", label: "Contract Intelligence" },
    ],
  },
  financial_health: {
    name: "Financial Health",
    description: "Financial deep-dive: invoice reconciliation informs contract review which benchmarks against competitor pricing.",
    steps: [
      { fn: "analyzeInvoiceReconciliation", label: "Invoice Reconciliation" },
      { fn: "analyzeContractIntelligence", label: "Contract Intelligence" },
      { fn: "analyzeCompetitorIntelligence", label: "Competitor Intelligence" },
    ],
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { chain } = await req.json();

    if (!chain || !CHAINS[chain]) {
      return Response.json({
        error: `Invalid chain. Must be one of: ${Object.keys(CHAINS).join(', ')}`,
      }, { status: 400 });
    }

    const chainConfig = CHAINS[chain];
    const stepResults = [];
    let previousContext = "";

    // Run agents sequentially, passing context forward
    for (let i = 0; i < chainConfig.steps.length; i++) {
      const step = chainConfig.steps[i];

      try {
        const result = await base44.functions.invoke(step.fn, {});
        const analysis = result?.data?.analysis || result?.analysis || result?.data || {};

        const summary = analysis.executive_summary || analysis.summary || "Analysis completed.";
        const actions = analysis.top_3_actions || [];

        stepResults.push({
          step: i + 1,
          agent: step.label,
          function_name: step.fn,
          status: "completed",
          summary,
          top_actions: actions,
          full_analysis: analysis,
        });

        // Build context for subsequent steps
        previousContext += `\n\n--- ${step.label} (Step ${i + 1}) ---\nSummary: ${summary}\nKey Actions: ${actions.join('; ') || 'None'}`;
      } catch (stepError) {
        stepResults.push({
          step: i + 1,
          agent: step.label,
          function_name: step.fn,
          status: "failed",
          error: stepError.message || "Agent execution failed",
        });
        // Continue chain even if one step fails
        previousContext += `\n\n--- ${step.label} (Step ${i + 1}) ---\nStatus: FAILED - ${stepError.message || "Unknown error"}`;
      }
    }

    // Generate unified chain summary via LLM
    const completedSteps = stepResults.filter(s => s.status === "completed");
    const stepsNarrative = stepResults.map(s => {
      if (s.status === "completed") {
        return `**${s.agent}** (Step ${s.step}): ${s.summary}\nKey Actions: ${s.top_actions?.join('; ') || 'N/A'}`;
      }
      return `**${s.agent}** (Step ${s.step}): FAILED - ${s.error}`;
    }).join('\n\n');

    const synthesisPrompt = `You are a strategic partnership intelligence advisor. A multi-agent workflow chain called "${chainConfig.name}" has completed. Your job is to synthesize the individual agent results into a cohesive strategic narrative.

CHAIN: ${chainConfig.name}
DESCRIPTION: ${chainConfig.description}

INDIVIDUAL AGENT RESULTS:
${stepsNarrative}

Provide:
1. A unified executive summary that connects the insights across all steps into a coherent strategy
2. The top 5 cross-cutting action items that leverage insights from multiple agents
3. Key risks or blind spots that emerge from combining these analyses
4. A recommended next step or follow-up chain to run`;

    const synthesis = await base44.integrations.Core.InvokeLLM({
      prompt: synthesisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          unified_summary: { type: 'string' },
          top_actions: {
            type: 'array',
            items: { type: 'string' },
          },
          key_risks: {
            type: 'array',
            items: { type: 'string' },
          },
          recommended_next_chain: { type: 'string' },
        },
      },
    });

    return Response.json({
      success: true,
      chain_name: chainConfig.name,
      chain_key: chain,
      description: chainConfig.description,
      steps: stepResults.map(s => ({
        step: s.step,
        agent: s.agent,
        function_name: s.function_name,
        status: s.status,
        summary: s.summary || s.error,
        top_actions: s.top_actions || [],
      })),
      unified_summary: synthesis.unified_summary,
      top_actions: synthesis.top_actions || [],
      key_risks: synthesis.key_risks || [],
      recommended_next_chain: synthesis.recommended_next_chain || null,
      stats: {
        total_steps: chainConfig.steps.length,
        completed: completedSteps.length,
        failed: stepResults.filter(s => s.status === "failed").length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
