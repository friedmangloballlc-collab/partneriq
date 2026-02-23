import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { csvRows } = await req.json();

    if (!csvRows || !Array.isArray(csvRows) || csvRows.length === 0) {
      return Response.json({ 
        error: 'csvRows array is required',
        details: 'Provide an array of industry objects'
      }, { status: 400 });
    }

    // Map CSV columns to entity fields and filter out noise
    const mappedIndustries = csvRows
      .filter(row => row.Industry && row.Industry.trim() && row.Industry !== 'Industry')
      .map(row => ({
        industry: row.Industry?.trim() || '',
        sector: row.Sector?.trim() || '',
        priority_tier_1_events: row['Priority Tier 1 Events (Must-Attend)']?.trim() || '',
        tier_2_events: row['Tier 2 Events (High Value)']?.trim() || '',
        heritage_awareness_months: row['Heritage/Awareness Months']?.trim() || '',
        key_conferences: row['Key Conferences/Trade Shows']?.trim() || '',
        best_demographics: row['Best Demographics']?.trim() || '',
        budget_allocation: row['Budget Allocation Guidance']?.trim() || '',
        activation_strategies: row['Top Activation Strategies']?.trim() || ''
      }))
      .filter(row => row.industry);

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