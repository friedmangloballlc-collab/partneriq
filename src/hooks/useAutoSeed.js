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

const SESSION_KEY = 'partneriq_auto_seed_done';

/** Returns true only if ALL core tables have at least one row. */
async function allTablesPopulated() {
  const tables = ['brands', 'talents', 'partnerships', 'activities', 'marketplace_opportunities'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error || !data || data.length === 0) return false;
  }
  return true;
}

export function useAutoSeed() {
  const ran = useRef(false);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        // Quick exit if we already verified this session
        if (sessionStorage.getItem(SESSION_KEY)) {
          setSeeded(true);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[AutoSeed] No authenticated user — skipping seed.');
          setSeeded(true);
          return;
        }

        // Check if ALL key tables are populated
        const populated = await allTablesPopulated();
        if (populated) {
          console.log('[AutoSeed] All tables already populated — skipping seed.');
          sessionStorage.setItem(SESSION_KEY, '1');
          setSeeded(true);
          return;
        }

        // --- Run the seed ---
        setSeeding(true);
        console.log('[AutoSeed] Empty tables detected — seeding database...');

        const errors = [];
        await seedDemoData((p) => {
          console.log(`[AutoSeed] ${p.step}/${p.total}: ${p.label}`);
          if (p.error) errors.push(p.error);
        });

        if (errors.length > 0) {
          console.warn('[AutoSeed] Completed with warnings:', errors);
        }

        console.log('[AutoSeed] Seed complete — invalidating all query caches...');

        // Force every React-Query cache entry to refetch
        await queryClientInstance.invalidateQueries();

        sessionStorage.setItem(SESSION_KEY, '1');
        setSeeding(false);
        setSeeded(true);
      } catch (err) {
        console.error('[AutoSeed] FAILED:', err);
        setError(err.message);
        setSeeding(false);
        setSeeded(true); // let app render so user isn't stuck on spinner
      }
    })();
  }, []);

  return { seeding, seeded, error };
}
