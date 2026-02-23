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

    return Response.json({
      success: true,
      total: allIndustries.length,
      duplicates_found: duplicates.length,
      duplicates_deleted: deletedCount,
      remaining: kept.size,
      message: `Removed ${deletedCount} duplicate industries`
    });
  } catch (error) {
    console.error('Deduplication error:', error);
    return Response.json({
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});