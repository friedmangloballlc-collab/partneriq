import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityName, csvData, fieldMapping } = await req.json();

    if (!entityName || !csvData) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lines = csvData.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const records = [];
    const errors = [];

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const record = {};

      headers.forEach((header, idx) => {
        const mappedField = fieldMapping[header] || header;
        const value = values[idx]?.trim() || '';
        
        // Type conversion based on common patterns
        if (value === '' || value === 'null') {
          record[mappedField] = null;
        } else if (value === 'true' || value === 'false') {
          record[mappedField] = value === 'true';
        } else if (!isNaN(value) && value !== '') {
          record[mappedField] = parseFloat(value);
        } else {
          record[mappedField] = value;
        }
      });

      records.push(record);
    }

    // Batch insert records
    let successCount = 0;
    let failureCount = 0;

    try {
      const entity = base44.asServiceRole.entities[entityName];
      if (!entity || !entity.bulkCreate) {
        return Response.json({ error: `Entity ${entityName} not found or does not support bulk operations` }, { status: 400 });
      }

      const result = await entity.bulkCreate(records);
      successCount = records.length;
    } catch (error) {
      // Fall back to individual creation with error tracking
      for (const record of records) {
        try {
          await base44.asServiceRole.entities[entityName].create(record);
          successCount++;
        } catch (err) {
          failureCount++;
          errors.push(`Row ${successCount + failureCount}: ${err.message}`);
        }
      }
    }

    return Response.json({
      success: failureCount === 0,
      message: `Successfully imported ${successCount} records${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
      successCount,
      failureCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});