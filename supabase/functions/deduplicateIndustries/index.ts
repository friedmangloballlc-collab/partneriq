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

    // Fetch all industries
    const allIndustries = await base44.entities.IndustryGuide.list();
    console.log(`Total industries: ${allIndustries.length}`);

    // Find duplicates by industry name
    const seen = new Map();
    const duplicates = [];
    const kept = new Set();

    for (const industry of allIndustries) {
      const key = industry.industry.toLowerCase().trim();
      
      if (seen.has(key)) {
        // This is a duplicate - mark it for deletion
        duplicates.push(industry.id);
      } else {
        // First occurrence - keep it
        seen.set(key, industry.id);
        kept.add(industry.id);
      }
    }

    console.log(`Found ${duplicates.length} duplicates`);

    // Delete duplicates
    let deletedCount = 0;
    for (const id of duplicates) {
      await base44.entities.IndustryGuide.delete(id);
      deletedCount++;
    }

    return new Response(JSON.stringify({
      success: true,
      total: allIndustries.length,
      duplicates_found: duplicates.length,
      duplicates_deleted: deletedCount,
      remaining: kept.size,
      message: `Removed ${deletedCount} duplicate industries`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Deduplication error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.toString()
    }, { status: 500 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});