import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// supabaseClient.js calls createClient() at module evaluation time.
// The Supabase SDK throws if supabaseUrl is missing/empty.
// ---------------------------------------------------------------------------

describe('supabaseClient', () => {
  const VALID_URL = 'https://test.supabase.co';
  const VALID_KEY = 'test-anon-key-abc123';

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when VITE_SUPABASE_URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_KEY);

    await expect(() => import('@/api/supabaseClient')).rejects.toThrow();
  });

  it('throws when VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', VALID_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(() => import('@/api/supabaseClient')).rejects.toThrow();
  });

  it('throws when both env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(() => import('@/api/supabaseClient')).rejects.toThrow();
  });

  it('exports a supabase client when both env vars are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', VALID_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_KEY);

    const mod = await import('@/api/supabaseClient');
    expect(mod.supabase).toBeDefined();
    expect(typeof mod.supabase.from).toBe('function');
    expect(mod.supabase.auth).toBeDefined();
  });
});
