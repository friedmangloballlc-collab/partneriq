import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoSeed } from '@/hooks/useAutoSeed';

describe('useAutoSeed hook', () => {
  it('is a function (exported correctly)', () => {
    expect(typeof useAutoSeed).toBe('function');
  });

  it('returns the expected shape: { seeding, seeded, error }', () => {
    const { result } = renderHook(() => useAutoSeed());
    expect(result.current).toHaveProperty('seeding');
    expect(result.current).toHaveProperty('seeded');
    expect(result.current).toHaveProperty('error');
  });

  it('returns seeding=false, seeded=true, error=null (auto-seed disabled)', () => {
    const { result } = renderHook(() => useAutoSeed());
    expect(result.current.seeding).toBe(false);
    expect(result.current.seeded).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
