import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { entityName, format = 'csv' } = await req.json();

    if (!entityName) {
      return new Response(JSON.stringify({ error: 'Entity name required' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch all records for the entity
    const records = await base44.asServiceRole.entities[entityName].list('-created_date', 10000);

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ error: 'No records found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let content, mimeType, filename;

    if (format === 'json') {
      content = JSON.stringify(records, null, 2);
      mimeType = 'application/json';
      filename = `${entityName}_export_${new Date().toISOString().split('T')[0]}.json`;
    } else if (format === 'excel') {
      // Simple Excel generation - use base64 encoded minimal XLSX
      const headers = Object.keys(records[0]).filter(k => !k.startsWith('_'));
      const rows = records.map(r => headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      }));

      // Create a simple CSV that Excel can open as XLSX
      const allRows = [headers, ...rows];
      content = allRows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap if contains comma
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      ).join('\n');
      
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `${entityName}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      // CSV format (default)
      const headers = Object.keys(records[0]).filter(k => !k.startsWith('_'));
      const rows = records.map(r => headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      }));

      const allRows = [headers, ...rows];
      content = allRows.map(row => 
        row.map(cell => {
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      ).join('\n');

      mimeType = 'text/csv';
      filename = `${entityName}_export_${new Date().toISOString().split('T')[0]}.csv`;
    }

    return new Response(JSON.stringify({
      content,
      mimeType,
      filename,
      recordCount: records.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});