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

    // Extract data from the uploaded file - using exact Excel column names
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: {
        type: "object",
        properties: {
          Industry: { type: "string" },
          Sector: { type: "string" },
          "Priority Tier 1 Events (Must-Attend)": { type: "string" },
          "Tier 2 Events (High Value)": { type: "string" },
          "Heritage/Awareness Months": { type: "string" },
          "Key Conferences/Trade Shows": { type: "string" },
          "Best Demographics": { type: "string" },
          "Budget Allocation Guidance": { type: "string" },
          "Top Activation Strategies": { type: "string" }
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
      .filter(row => row.Industry && row.Industry.trim())
      .map(row => ({
        industry: row.Industry?.trim(),
        sector: row.Sector?.trim() || '',
        priority_tier_1_events: row['Priority Tier 1 Events (Must-Attend)']?.trim() || '',
        tier_2_events: row['Tier 2 Events (High Value)']?.trim() || '',
        heritage_awareness_months: row['Heritage/Awareness Months']?.trim() || '',
        key_conferences: row['Key Conferences/Trade Shows']?.trim() || '',
        best_demographics: row['Best Demographics']?.trim() || '',
        budget_allocation: row['Budget Allocation Guidance']?.trim() || '',
        activation_strategies: row['Top Activation Strategies']?.trim() || ''
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