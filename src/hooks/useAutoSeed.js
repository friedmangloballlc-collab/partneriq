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
          setSeeded(true);
          return;
        }

        // Check if ALL key tables are populated
        const populated = await allTablesPopulated();
        if (populated) {
          sessionStorage.setItem(SESSION_KEY, '1');
          setSeeded(true);
          return;
        }

        // --- Run the seed ---
        setSeeding(true);

        const errors = [];
        await seedDemoData((p) => {
          if (p.error) errors.push(p.error);
        });

        if (errors.length > 0) {
        }


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
