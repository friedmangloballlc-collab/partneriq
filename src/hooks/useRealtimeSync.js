/**
 * useRealtimeSync
 *
 * Subscribes to Supabase Realtime postgres_changes on the four highest-impact
 * tables and invalidates every matching React Query cache key on any
 * INSERT / UPDATE / DELETE event.
 *
 * Mount this once inside AuthenticatedRoutes so the subscriptions live for the
 * entire authenticated session and are automatically torn down on logout.
 */
import { useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { queryClientInstance } from '@/lib/query-client';

/**
 * Map each Supabase table name to the list of React Query cache keys that
 * should be invalidated when that table changes.  Using partial / prefix keys
 * (e.g. ["partnerships"]) invalidates every query whose key *starts with* that
 * array — which covers all scoped variants like ["partnerships", filters, …].
 */
const TABLE_QUERY_KEYS = {
  partnerships: [
    ['partnerships'],
    ['partnerships-analytics-page'],
    ['partnerships-analytics'],
    ['cr-partnerships'],
  ],
  notifications: [
    ['notifications'],
  ],
  approval_items: [
    ['approval-items'],
    ['approvals-pending'],
    ['approvals'],
  ],
  activities: [
    ['activities'],
    ['activities-health'],
  ],
};

/**
 * Invalidate all React Query cache entries associated with the given table.
 * Each entry in TABLE_QUERY_KEYS is used as a prefix so sub-keyed variants are
 * also caught (TanStack Query matches on array prefix by default).
 */
function invalidateTable(tableName) {
  const keys = TABLE_QUERY_KEYS[tableName];
  if (!keys) return;

  keys.forEach((queryKey) => {
    queryClientInstance.invalidateQueries({ queryKey });
  });
}

export function useRealtimeSync() {
  useEffect(() => {
    const tables = Object.keys(TABLE_QUERY_KEYS);

    // Create one channel per table so each subscription can be removed
    // independently, and channel names are unambiguous.
    const channels = tables.map((table) => {
      const channel = supabase
        .channel(`realtime_sync_${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            invalidateTable(table);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
          }
          if (status === 'CHANNEL_ERROR') {
          }
          if (status === 'TIMED_OUT') {
          }
        });

      return channel;
    });

    // Cleanup: remove every channel when the component unmounts (logout /
    // route change away from the authenticated tree).
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, []); // empty deps — subscribe once per mount, never re-subscribe
}
