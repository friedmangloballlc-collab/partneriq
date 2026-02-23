import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { fileUrl, csvData } = await req.json();

    // Use CSV data if provided, otherwise fetch from file URL
    let dataToProcess = csvData;
    
    if (!dataToProcess && fileUrl) {
      // Use LLM to extract the file content
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ALL industries from this Excel/CSV file. Return a JSON object with an "industries" array. 
        Each industry object should have these fields:
        - industry: Industry name
        - sector: Sector
        - priority_tier_1_events: Priority Tier 1 Events
        - tier_2_events: Tier 2 Events
        - heritage_awareness_months: Heritage/Awareness Months
        - key_conferences: Key Conferences
        - best_demographics: Best Demographics
        - budget_allocation: Budget Allocation
        - activation_strategies: Top Activation Strategies
        
        Extract EVERY row from the file. Return valid JSON only.`,
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
      dataToProcess = llmResult;
    }

    if (!dataToProcess || !dataToProcess.industries || dataToProcess.industries.length === 0) {
      return Response.json({ 
        error: 'No industry data provided or extracted',
        details: 'Provide either fileUrl or csvData'
      }, { status: 400 });
    }

    // Filter out empty rows
    const mappedIndustries = dataToProcess.industries.filter(row => 
      row.industry && row.industry.toString().trim() && row.industry !== 'Industry'
    );

    console.log(`Processing ${mappedIndustries.length} industries for import`);

    // Bulk create in chunks to avoid size limits
    const chunkSize = 50;
    let totalImported = 0;
    
    for (let i = 0; i < mappedIndustries.length; i += chunkSize) {
      const chunk = mappedIndustries.slice(i, i + chunkSize);
      await base44.entities.IndustryGuide.bulkCreate(chunk);
      totalImported += chunk.length;
    }

    return Response.json({ 
      success: true,
      imported: totalImported,
      message: `Successfully imported ${totalImported} industries`
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});