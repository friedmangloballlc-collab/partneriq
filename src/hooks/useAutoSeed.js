/**
 * Auto-seeds the database on first login if tables are empty.
 * Runs once per session using a sessionStorage flag.
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';
import { seedDemoData } from '@/utils/seedDemoData';

export function useAutoSeed() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const KEY = 'partneriq_auto_seed_done';
    if (sessionStorage.getItem(KEY)) return;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if brands table has data — if so, skip seeding
        const { data: existing } = await supabase
          .from('brands')
          .select('id')
          .limit(1);

        if (existing && existing.length > 0) {
          sessionStorage.setItem(KEY, '1');
          return;
        }

        console.log('[AutoSeed] No data found — seeding database...');
        await seedDemoData((p) => {
          console.log(`[AutoSeed] ${p.step}/${p.total}: ${p.label}`);
        });
        console.log('[AutoSeed] Done!');
        sessionStorage.setItem(KEY, '1');
      } catch (err) {
        console.error('[AutoSeed] Failed:', err.message);
      }
    })();
  }, []);
}
