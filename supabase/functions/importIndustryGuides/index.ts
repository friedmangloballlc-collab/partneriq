import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { csvRows, fileUrl } = await req.json();
    let rowsToImport = csvRows;

    // If fileUrl provided, extract CSV data via LLM
    if (!rowsToImport && fileUrl) {
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ALL rows from this CSV file. Return ONLY valid JSON with a "rows" array. Each row object should have these keys exactly:
        - Industry
        - Sector
        - Priority Tier 1 Events (Must-Attend)
        - Tier 2 Events (High Value)
        - Heritage/Awareness Months
        - Key Conferences/Trade Shows
        - Best Demographics
        - Budget Allocation Guidance
        - Top Activation Strategies
        
        IMPORTANT: Include EVERY data row, skip headers. Return valid JSON only, nothing else.`,
        file_urls: [fileUrl],
        response_json_schema: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: {
                type: "object"
              }
            }
          }
        }
      });
      rowsToImport = llmResult.rows;
    }

    if (!rowsToImport || !Array.isArray(rowsToImport) || rowsToImport.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No data provided',
        details: 'Provide csvRows array or fileUrl'
      }, { status: 400 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Map CSV columns to entity fields and filter out noise
    const mappedIndustries = rowsToImport
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