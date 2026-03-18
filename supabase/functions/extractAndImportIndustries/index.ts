import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: 'fileUrl required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    return new Response(JSON.stringify({ 
      success: true,
      imported: totalImported,
      message: `Successfully imported ${totalImported} industries`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});