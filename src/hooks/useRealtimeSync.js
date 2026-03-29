/**
 * useRealtimeSync
 *
 * Subscribes to Supabase Realtime postgres_changes on the four highest-impact
 * tables via a single consolidated channel and invalidates every matching
 * React Query cache key on any INSERT / UPDATE / DELETE event.
 *
 * Features:
 * - Single channel with all table subscriptions (instead of 4 separate channels)
 * - Debounced invalidation (500ms) so bulk operations don't thrash the cache
 * - Automatic retry on CHANNEL_ERROR / TIMED_OUT
 *
 * Mount this once inside AuthenticatedRoutes so the subscriptions live for the
 * entire authenticated session and are automatically torn down on logout.
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';
import { queryClientInstance } from '@/lib/query-client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Map each Supabase table name to the list of React Query cache keys that
 * should be invalidated when that table changes.  Using partial / prefix keys
 * (e.g. ["partnerships"]) invalidates every query whose key *starts with* that
 * array — which covers all scoped variants like ["partnerships", filters, ...].
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

const TABLES = Object.keys(TABLE_QUERY_KEYS);
const CHANNEL_NAME = 'realtime_sync_all';
const DEBOUNCE_MS = 500;
const RETRY_DELAY_MS = 3000;
const MAX_RETRIES = 5;

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
  const { user } = useAuth();
  const userEmail = user?.email ?? null;

  const retryCountRef = useRef(0);
  const pendingTablesRef = useRef(new Set());
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    let channel = null;
    let unmounted = false;

    /**
     * Flush all pending table invalidations. Called after the debounce window.
     */
    function flushInvalidations() {
      const tables = pendingTablesRef.current;
      if (tables.size === 0) return;
      pendingTablesRef.current = new Set();
      tables.forEach((tableName) => invalidateTable(tableName));
    }

    /**
     * Queue a table invalidation. The actual invalidation is debounced so that
     * rapid-fire events (e.g. bulk inserts) are batched into one cache bust.
     */
    function scheduleInvalidation(tableName) {
      pendingTablesRef.current.add(tableName);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(flushInvalidations, DEBOUNCE_MS);
    }

    /**
     * Build and subscribe a single channel with one postgres_changes listener
     * per table.
     *
     * Row-level filters are applied where a suitable column exists:
     *   - notifications: filtered to rows where user_email = current user
     *   - partnerships:  no user_id column — subscribed table-wide (TODO: add
     *       a user_id or owner_email column to partnerships so we can filter here)
     *   - approval_items / activities: subscribed table-wide (no user column)
     */
    function subscribe() {
      if (unmounted) return;

      let ch = supabase.channel(CHANNEL_NAME);

      TABLES.forEach((table) => {
        // Apply row-level filter for notifications when we have the user email.
        const filter =
          table === 'notifications' && userEmail
            ? `user_email=eq.${userEmail}`
            : undefined;

        const filterOptions = filter
          ? { event: '*', schema: 'public', table, filter }
          : { event: '*', schema: 'public', table };

        ch = ch.on(
          'postgres_changes',
          filterOptions,
          (_payload) => {
            scheduleInvalidation(table);
          }
        );
      });

      ch.subscribe((status) => {
        if (unmounted) return;

        if (status === 'SUBSCRIBED') {
          // Successfully connected — reset retry counter.
          retryCountRef.current = 0;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Attempt reconnection with back-off up to MAX_RETRIES.
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current += 1;
            const delay = RETRY_DELAY_MS * retryCountRef.current;
            supabase.removeChannel(ch);
            channel = null;
            setTimeout(() => {
              if (!unmounted) subscribe();
            }, delay);
          }
        }
      });

      channel = ch;
    }

    subscribe();

    // Cleanup: remove the channel and cancel pending debounce on unmount.
    return () => {
      unmounted = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [userEmail]); // re-subscribe when the authenticated user changes
}
