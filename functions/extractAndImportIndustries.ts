import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'fileUrl required' }, { status: 400 });
    }

    // Extract CSV data using the Core integration
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
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

    if (extracted.status !== 'success' || !extracted.output) {
      throw new Error(`Extraction failed: ${extracted.details}`);
    }

    const csvRows = extracted.output;
    console.log(`Extracted ${csvRows.length} rows from CSV`);

    // Map CSV columns to entity fields and filter out noise
    const mappedIndustries = csvRows
      .filter(row => row.Industry && String(row.Industry).trim() && String(row.Industry).trim() !== 'Industry')
      .map(row => ({
        industry: String(row.Industry || '').trim(),
        sector: String(row.Sector || '').trim(),
        priority_tier_1_events: String(row['Priority Tier 1 Events (Must-Attend)'] || '').trim(),
        tier_2_events: String(row['Tier 2 Events (High Value)'] || '').trim(),
        heritage_awareness_months: String(row['Heritage/Awareness Months'] || '').trim(),
        key_conferences: String(row['Key Conferences/Trade Shows'] || '').trim(),
        best_demographics: String(row['Best Demographics'] || '').trim(),
        budget_allocation: String(row['Budget Allocation Guidance'] || '').trim(),
        activation_strategies: String(row['Top Activation Strategies'] || '').trim()
      }))
      .filter(row => row.industry);

    console.log(`Processing ${mappedIndustries.length} industries for import`);

    // Bulk create in chunks
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