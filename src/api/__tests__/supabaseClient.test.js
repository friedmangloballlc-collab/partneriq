import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// supabaseClient.js throws at module evaluation time if either env var is
// missing. We test this by resetting Vitest's module registry and manipulating
// import.meta.env before each scenario.
// ---------------------------------------------------------------------------

describe('supabaseClient', () => {
  const VALID_URL = 'https://test.supabase.co';
  const VALID_KEY = 'test-anon-key-abc123';

  beforeEach(() => {
    // Ensure the module is re-evaluated on every test so the throw-at-load
    // behaviour is exercised fresh each time.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_KEY);

    await expect(() => import('@/api/supabaseClient')).rejects.toThrow(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
    );
  });

  it('throws when VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', VALID_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(() => import('@/api/supabaseClient')).rejects.toThrow(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
    );
  });

  it('throws when both env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(() => import('@/api/supabaseClient')).rejects.toThrow(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
    );
  });

  it('exports a supabase client when both env vars are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', VALID_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_KEY);

    const mod = await import('@/api/supabaseClient');
    expect(mod.supabase).toBeDefined();
    // The Supabase JS client exposes .from() and .auth as core surface area
    expect(typeof mod.supabase.from).toBe('function');
    expect(mod.supabase.auth).toBeDefined();
  });

  it('throws with the exact error message text', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    let caughtError;
    try {
      await import('@/api/supabaseClient');
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError.message).toBe(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
    );
  });
});
