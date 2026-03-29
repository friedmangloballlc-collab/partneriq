import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

// =============================================================================
// UNIFIED EXPORT HANDLER
// Consolidates: exportEntityData, exportUserData
//
// Usage: POST with { action: "entity" | "gdpr", ...params }
//   - entity: { action: "entity", entityName, format?: "csv"|"json"|"excel" }
//   - gdpr:   { action: "gdpr" }
// =============================================================================

type ExportAction = 'entity' | 'gdpr';

// ---------------------------------------------------------------------------
// ACTION: entity  (was exportEntityData)
// ---------------------------------------------------------------------------

async function handleEntityExport(base44: any, _user: any, payload: any): Promise<Response> {
  const { entityName, format = 'csv' } = payload;

  if (!entityName) {
    return new Response(JSON.stringify({ error: 'Entity name required' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const records = await base44.asServiceRole.entities[entityName].list('-created_date', 10000);

  if (!records || records.length === 0) {
    return new Response(JSON.stringify({ error: 'No records found' }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let content: string, mimeType: string, filename: string;

  if (format === 'json') {
    content = JSON.stringify(records, null, 2);
    mimeType = 'application/json';
    filename = `${entityName}_export_${new Date().toISOString().split('T')[0]}.json`;
  } else if (format === 'excel') {
    const headers = Object.keys(records[0]).filter(k => !k.startsWith('_'));
    const rows = records.map((r: any) => headers.map(h => {
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

    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    filename = `${entityName}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  } else {
    // CSV format (default)
    const headers = Object.keys(records[0]).filter(k => !k.startsWith('_'));
    const rows = records.map((r: any) => headers.map(h => {
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
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// ACTION: gdpr  (was exportUserData)
// ---------------------------------------------------------------------------

interface TableQuery {
  table: string;
  column: string;
  useEmail?: boolean;
}

const USER_TABLES: TableQuery[] = [
  { table: 'activities',          column: 'user_id' },
  { table: 'notifications',       column: 'user_id' },
  { table: 'user_subscriptions',  column: 'user_id' },
  { table: 'billing_history',     column: 'user_id' },
  { table: 'email_connections',   column: 'user_id' },
  { table: 'ai_usage_logs',       column: 'user_id' },
  { table: 'brands',              column: 'owner_id' },
  { table: 'talents',             column: 'owner_id' },
  { table: 'partnerships',        column: 'created_by' },
  { table: 'outreach_sequences',  column: 'created_by' },
  { table: 'outreach_emails',     column: 'created_by' },
  { table: 'tasks',               column: 'created_by' },
  { table: 'deal_notes',          column: 'author_id' },
  { table: 'connected_platforms', column: 'user_id' },
];

const EMAIL_TABLES: TableQuery[] = [
  { table: 'user_subscriptions', column: 'user_email', useEmail: true },
  { table: 'billing_history',    column: 'user_email', useEmail: true },
];

async function handleGdprExport(client: any, user: any, _payload: any): Promise<Response> {
  const userId: string = user.id;
  const userEmail: string = user.email;
  const supabase = client.supabase;
  const exportData: Record<string, any> = {};

  // Export profile first
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  exportData.profiles = profile ? [profile] : [];

  // Query each table by user id
  for (const { table, column } of USER_TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, userId);

      if (error) {
        console.warn(`[export-data/gdpr] Skipping ${table}: ${error.message}`);
        continue;
      }

      if (exportData[table]) {
        const existingIds = new Set(exportData[table].map((r: any) => r.id));
        for (const row of data || []) {
          if (!existingIds.has(row.id)) {
            exportData[table].push(row);
          }
        }
      } else {
        exportData[table] = data || [];
      }
    } catch (err) {
      console.warn(`[export-data/gdpr] Error querying ${table}:`, (err as Error).message);
    }
  }

  // Email-based lookups (merge, deduplicate by id)
  for (const { table, column } of EMAIL_TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, userEmail);

      if (error) continue;

      if (exportData[table]) {
        const existingIds = new Set(exportData[table].map((r: any) => r.id));
        for (const row of data || []) {
          if (!existingIds.has(row.id)) {
            exportData[table].push(row);
          }
        }
      } else {
        exportData[table] = data || [];
      }
    } catch {
      // skip
    }
  }

  const envelope = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    user_email: userEmail,
    data: exportData,
  };

  return new Response(JSON.stringify(envelope, null, 2), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="partneriq-data-export-${userId}.json"`,
    },
  });
}

// ---------------------------------------------------------------------------
// MAIN ROUTER
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json().catch(() => ({}));
    const action: ExportAction = payload.action;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: action. Must be one of: entity, gdpr' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    switch (action) {
      case 'entity':
        return await handleEntityExport(client, user, payload);
      case 'gdpr':
        return await handleGdprExport(client, user, payload);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Must be one of: entity, gdpr` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }
  } catch (error) {
    console.error('[export-data] Error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
