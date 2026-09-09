import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityName, format = 'csv' } = await req.json();

    if (!entityName) {
      return Response.json({ error: 'Entity name required' }, { status: 400 });
    }

    // Fetch all records for the entity
    const records = await base44.asServiceRole.entities[entityName].list('-created_date', 10000);

    if (!records || records.length === 0) {
      return Response.json({ error: 'No records found' }, { status: 404 });
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

    return Response.json({
      content,
      mimeType,
      filename,
      recordCount: records.length,
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});