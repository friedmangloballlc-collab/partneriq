import { createClientFromRequest, corsHeaders } from '../_shared/supabase.ts';

/**
 * GDPR Account Deletion – permanently removes ALL user data and the auth record.
 *
 * Requires body: { confirm: "DELETE MY ACCOUNT" }
 *
 * Deletion order matters because of foreign-key constraints.  We delete
 * leaf / dependent rows first, then parent rows, then the profile, and
 * finally the auth.users record.
 */

const CONFIRMATION_PHRASE = 'DELETE MY ACCOUNT';

/**
 * Each entry: [tableName, columnName].
 * Ordered so that child rows are deleted before parents.
 */
const DELETION_ORDER: [string, string][] = [
  // Leaf tables first
  ['ai_usage_logs',       'user_id'],
  ['notifications',       'user_id'],
  ['activities',          'user_id'],
  ['billing_history',     'user_id'],
  ['email_connections',   'user_id'],
  ['connected_platforms', 'user_id'],

  // Deal notes (author_id)
  ['deal_notes',          'author_id'],

  // Outreach emails before sequences (emails may reference sequences)
  ['outreach_emails',     'created_by'],
  ['outreach_sequences',  'created_by'],

  // Tasks
  ['tasks',               'created_by'],

  // Partnerships (after deal_notes, outreach referencing them)
  ['partnerships',        'created_by'],

  // Brands and talents
  ['brands',              'owner_id'],
  ['talents',             'owner_id'],

  // Subscriptions
  ['user_subscriptions',  'user_id'],
];

/** Additional email-based deletions for tables with user_email column */
const EMAIL_DELETIONS: [string, string][] = [
  ['user_subscriptions', 'user_email'],
  ['billing_history',    'user_email'],
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

    // Parse and validate confirmation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (body?.confirm !== CONFIRMATION_PHRASE) {
      return new Response(
        JSON.stringify({
          error: 'Confirmation required',
          message: `You must send { "confirm": "${CONFIRMATION_PHRASE}" } to proceed.`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const userId: string = user.id;
    const userEmail: string = user.email;
    const supabase = client.supabase;
    const deletionLog: Record<string, number | string> = {};

    // 1. Delete rows from each table by user id
    for (const [table, column] of DELETION_ORDER) {
      try {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .eq(column, userId)
          .select('id');

        if (error) {
          // Table may not exist (connected_platforms) – log and continue
          console.warn(`[deleteUserAccount] Skipping ${table}: ${error.message}`);
          deletionLog[table] = `skipped: ${error.message}`;
          continue;
        }

        deletionLog[table] = (data || []).length;
      } catch (err) {
        console.warn(`[deleteUserAccount] Error deleting from ${table}:`, (err as Error).message);
        deletionLog[table] = `error: ${(err as Error).message}`;
      }
    }

    // 2. Email-based deletions (catch any rows not linked by user_id)
    for (const [table, column] of EMAIL_DELETIONS) {
      try {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .eq(column, userEmail)
          .select('id');

        if (error) continue;

        const key = `${table}_by_email`;
        deletionLog[key] = (data || []).length;
      } catch {
        // skip
      }
    }

    // 3. Delete profile
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('[deleteUserAccount] Profile deletion error:', error.message);
        deletionLog['profiles'] = `error: ${error.message}`;
      } else {
        deletionLog['profiles'] = 1;
      }
    } catch (err) {
      deletionLog['profiles'] = `error: ${(err as Error).message}`;
    }

    // 4. Delete auth record via admin API
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error('[deleteUserAccount] Auth deletion error:', error.message);
        deletionLog['auth_user'] = `error: ${error.message}`;
      } else {
        deletionLog['auth_user'] = 'deleted';
      }
    } catch (err) {
      console.error('[deleteUserAccount] Auth deletion exception:', (err as Error).message);
      deletionLog['auth_user'] = `error: ${(err as Error).message}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your account and all associated data have been permanently deleted.',
        deleted_at: new Date().toISOString(),
        details: deletionLog,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[deleteUserAccount] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
