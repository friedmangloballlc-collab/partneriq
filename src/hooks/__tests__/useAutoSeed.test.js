import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Heavy dependencies that make real network/DB calls must be mocked before
// the module under test is imported so Vitest's module registry picks them up.
// ---------------------------------------------------------------------------

vi.mock('@/api/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: 'test-user-id' } } })
      ),
    },
  },
}));

vi.mock('@/utils/seedDemoData', () => ({
  seedDemoData: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/query-client', () => ({
  queryClientInstance: {
    invalidateQueries: vi.fn(() => Promise.resolve()),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useAutoSeed } from '@/hooks/useAutoSeed';

describe('useAutoSeed hook', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('is a function (exported correctly)', () => {
    expect(typeof useAutoSeed).toBe('function');
  });

  it('returns the expected shape: { seeding, seeded, error }', () => {
    const { result } = renderHook(() => useAutoSeed());
    expect(result.current).toHaveProperty('seeding');
    expect(result.current).toHaveProperty('seeded');
    expect(result.current).toHaveProperty('error');
  });

  it('initialises with seeding=false and seeded=false', () => {
    const { result } = renderHook(() => useAutoSeed());
    expect(result.current.seeding).toBe(false);
    expect(result.current.seeded).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('resolves to seeded=true when all tables are populated', async () => {
    const { result } = renderHook(() => useAutoSeed());
    await waitFor(() => expect(result.current.seeded).toBe(true));
    expect(result.current.error).toBeNull();
  });

  it('resolves without seeding when session key is already set', async () => {
    sessionStorage.setItem('dealstage_auto_seed_done', '1');
    const { result } = renderHook(() => useAutoSeed());
    await waitFor(() => expect(result.current.seeded).toBe(true));
    expect(result.current.seeding).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not call the seed when the session flag is present', async () => {
    const { seedDemoData } = await import('@/utils/seedDemoData');
    sessionStorage.setItem('dealstage_auto_seed_done', '1');
    const { result } = renderHook(() => useAutoSeed());
    await waitFor(() => expect(result.current.seeded).toBe(true));
    expect(seedDemoData).not.toHaveBeenCalled();
  });

  it('sets seeded=true and captures error message on async failure', async () => {
    const { supabase } = await import('@/api/supabaseClient');
    supabase.auth.getUser.mockRejectedValueOnce(new Error('network failure'));

    const { result } = renderHook(() => useAutoSeed());
    await waitFor(() => expect(result.current.seeded).toBe(true));
    expect(result.current.error).toBe('network failure');
    expect(result.current.seeding).toBe(false);
  });

  it('sets seeded=true and skips seeding when no user is authenticated', async () => {
    const { supabase } = await import('@/api/supabaseClient');
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    const { seedDemoData } = await import('@/utils/seedDemoData');
    const { result } = renderHook(() => useAutoSeed());
    await waitFor(() => expect(result.current.seeded).toBe(true));
    expect(seedDemoData).not.toHaveBeenCalled();
  });
});
