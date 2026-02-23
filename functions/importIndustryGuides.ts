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

    // Get the schema for IndustryGuide
    const schema = await base44.entities.IndustryGuide.schema();

    // Extract data from the uploaded file
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: {
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
    });

    if (extractResult.status !== 'success' || !extractResult.output) {
      return Response.json({ 
        error: 'Failed to extract data from file',
        details: extractResult.details 
      }, { status: 400 });
    }

    // Map the extracted data to the correct field names
    const industries = Array.isArray(extractResult.output) 
      ? extractResult.output 
      : [extractResult.output];

    // Filter out empty rows and map field names
    const mappedIndustries = industries
      .filter(row => row.industry && row.industry.trim())
      .map(row => ({
        industry: row.industry?.trim(),
        sector: row.sector?.trim() || '',
        priority_tier_1_events: row.priority_tier_1_events?.trim() || row['Priority Tier 1 Events (Must-Attend)']?.trim() || '',
        tier_2_events: row.tier_2_events?.trim() || row['Tier 2 Events (High Value)']?.trim() || '',
        heritage_awareness_months: row.heritage_awareness_months?.trim() || row['Heritage/Awareness Months']?.trim() || '',
        key_conferences: row.key_conferences?.trim() || row['Key Conferences/Trade Shows']?.trim() || '',
        best_demographics: row.best_demographics?.trim() || row['Best Demographics']?.trim() || '',
        budget_allocation: row.budget_allocation?.trim() || row['Budget Allocation Guidance']?.trim() || '',
        activation_strategies: row.activation_strategies?.trim() || row['Top Activation Strategies']?.trim() || ''
      }));

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