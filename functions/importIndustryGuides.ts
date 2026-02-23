import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    // Use LLM to extract and parse the Excel file
    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all industries from this Excel file and return as a JSON array. For each industry, extract these fields:
        - industry (Industry name)
        - sector (Sector)
        - priority_tier_1_events (Priority Tier 1 Events (Must-Attend))
        - tier_2_events (Tier 2 Events (High Value))
        - heritage_awareness_months (Heritage/Awareness Months)
        - key_conferences (Key Conferences/Trade Shows)
        - best_demographics (Best Demographics)
        - budget_allocation (Budget Allocation Guidance)
        - activation_strategies (Top Activation Strategies)
        
        Return ONLY a valid JSON array, no other text.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          industries: {
            type: "array",
            items: {
              type: "object",
              properties: {
                industry: { type: "string" },
                sector: { type: "string" },
                priority_tier_1_events: { type: "string" },
                tier_2_events: { type: "string" },
                heritage_awareness_months: { type: "string" },
                key_conferences: { type: "string" },
                best_demographics: { type: "string" },
                budget_allocation: { type: "string" },
                activation_strategies: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (!llmResult || !llmResult.industries || llmResult.industries.length === 0) {
      return Response.json({ 
        error: 'Failed to extract industries from file',
        details: 'LLM could not parse the Excel data'
      }, { status: 400 });
    }

    const industries = llmResult.industries;

    // Filter out empty rows
    const mappedIndustries = industries.filter(row => row.industry && row.industry.trim());

    console.log(`Mapped ${mappedIndustries.length} industries for import`);

    // Bulk create the industries
    const result = await base44.entities.IndustryGuide.bulkCreate(mappedIndustries);

    return Response.json({ 
      success: true,
      imported: mappedIndustries.length,
      message: `Successfully imported ${mappedIndustries.length} industries`
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});