import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

/**
 * GDPR Data Export – returns ALL user data as a single JSON object.
 *
 * Tables are queried by whichever ownership column they use:
 *   - user_id   (activities, notifications, user_subscriptions, billing_history, email_connections, ai_usage_logs)
 *   - owner_id  (brands, talents)
 *   - created_by (partnerships, outreach_sequences, outreach_emails, deal_notes, tasks)
 *   - author_id (deal_notes – secondary ownership)
 *   - assigned_to (tasks – secondary ownership)
 *   - user_email (user_subscriptions, billing_history – fallback)
 */

interface TableQuery {
  table: string;
  column: string;
  /** Use the user's email instead of id */
  useEmail?: boolean;
}

const USER_TABLES: TableQuery[] = [
  // Owned by user_id
  { table: 'activities',          column: 'user_id' },
  { table: 'notifications',       column: 'user_id' },
  { table: 'user_subscriptions',  column: 'user_id' },
  { table: 'billing_history',     column: 'user_id' },
  { table: 'email_connections',   column: 'user_id' },
  { table: 'ai_usage_logs',       column: 'user_id' },

  // Owned by owner_id
  { table: 'brands',              column: 'owner_id' },
  { table: 'talents',             column: 'owner_id' },

  // Owned by created_by
  { table: 'partnerships',        column: 'created_by' },
  { table: 'outreach_sequences',  column: 'created_by' },
  { table: 'outreach_emails',     column: 'created_by' },
  { table: 'tasks',               column: 'created_by' },

  // deal_notes use author_id
  { table: 'deal_notes',          column: 'author_id' },

  // connected_platforms may not exist yet; included for forward-compat
  { table: 'connected_platforms', column: 'user_id' },
];

/** Additional email-based lookups for tables that have a user_email column */
const EMAIL_TABLES: TableQuery[] = [
  { table: 'user_subscriptions', column: 'user_email', useEmail: true },
  { table: 'billing_history',    column: 'user_email', useEmail: true },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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
          // Table may not exist (e.g. connected_platforms) – skip gracefully
          console.warn(`[exportUserData] Skipping ${table}: ${error.message}`);
          continue;
        }

        // Merge into existing array (deal_notes may already exist from author_id query)
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
        console.warn(`[exportUserData] Error querying ${table}:`, (err as Error).message);
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

    // Metadata envelope
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
  } catch (error) {
    console.error('[exportUserData] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
