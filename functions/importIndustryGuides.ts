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

    // Extract data from Excel file
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
        error: 'Failed to extract industries from file',
        details: extractResult.details
      }, { status: 400 });
    }

    // Handle both array and single object responses
    const industries = Array.isArray(extractResult.output) 
      ? extractResult.output 
      : [extractResult.output];

    // Filter out empty rows
    const mappedIndustries = industries.filter(row => row.industry && row.industry.toString().trim());

    console.log(`Extracted and mapped ${mappedIndustries.length} industries for import`);

    // Bulk create the industries
    await base44.entities.IndustryGuide.bulkCreate(mappedIndustries);

    return Response.json({ 
      success: true,
      imported: mappedIndustries.length,
      message: `Successfully imported ${mappedIndustries.length} industries`
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});