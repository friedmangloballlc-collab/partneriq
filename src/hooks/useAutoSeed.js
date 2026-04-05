/**
 * Auto-seeds the database on first session if ANY key table is empty.
 * Always runs the seed function (it's idempotent via upsert/ignoreDuplicates),
 * then invalidates all React-Query caches so pages pick up the new data.
 *
 * Returns { seeding, seeded, error } so the caller can show a loading state.
 */
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { seedDemoData } from '@/utils/seedDemoData';
import { queryClientInstance } from '@/lib/query-client';

const SESSION_KEY = 'dealstage_auto_seed_done';

/** Returns true only if ALL core tables have at least one row. */
async function allTablesPopulated() {
  const results = await Promise.all(
    ['brands', 'talents', 'partnerships', 'activities', 'marketplace_opportunities'].map(
      table => supabase.from(table).select('id').limit(1)
    )
  );
  return results.every(({ data, error }) => !error && data?.length > 0);
}

export function useAutoSeed() {
  // Auto-seed is disabled in production to prevent fake demo data from
  // appearing in the AI Command Center and misleading users.
  // Admin can populate real data via Admin Data Manager.
  return { seeding: false, seeded: true, error: null };
}
