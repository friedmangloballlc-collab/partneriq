/**
 * Auto-seeds the database on first login if tables are empty.
 * Returns { seeding, seeded } so callers can show a loading state
 * and knows when to refetch queries.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import { seedDemoData } from '@/utils/seedDemoData';
import { queryClientInstance } from '@/lib/query-client';

const SESSION_KEY = 'partneriq_auto_seed_done';

export function useAutoSeed() {
  const ran = useRef(false);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Already seeded this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setSeeded(true);
      return;
    }

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSeeded(true); return; }

        // Check if brands table already has data
        const { data: existing } = await supabase
          .from('brands')
          .select('id')
          .limit(1);

        if (existing && existing.length > 0) {
          sessionStorage.setItem(SESSION_KEY, '1');
          setSeeded(true);
          return;
        }

        // --- Seed the database ---
        setSeeding(true);
        console.log('[AutoSeed] No data found — seeding database...');

        await seedDemoData((p) => {
          console.log(`[AutoSeed] ${p.step}/${p.total}: ${p.label}`);
        });

        console.log('[AutoSeed] Done — invalidating all queries...');
        sessionStorage.setItem(SESSION_KEY, '1');

        // Force every React-Query cache entry to refetch so the
        // Dashboard (and every other page) picks up the new rows.
        await queryClientInstance.invalidateQueries();

        setSeeding(false);
        setSeeded(true);
      } catch (err) {
        console.error('[AutoSeed] Failed:', err.message);
        // Still allow the app to render — user can retry via Settings
        setSeeding(false);
        setSeeded(true);
      }
    })();
  }, []);

  return { seeding, seeded };
}
