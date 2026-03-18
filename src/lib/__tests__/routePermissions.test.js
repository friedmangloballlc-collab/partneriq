import { describe, it, expect } from 'vitest';
import { canAccessPage } from '@/lib/routePermissions';

describe('canAccessPage', () => {
  // Admin always gets full access
  describe('admin role', () => {
    it('allows admin to access Dashboard', () => {
      expect(canAccessPage('admin', 'Dashboard')).toBe(true);
    });

    it('allows admin to access any page including SystemHealth', () => {
      expect(canAccessPage('admin', 'SystemHealth')).toBe(true);
    });

    it('allows admin to access a page not in any role list', () => {
      expect(canAccessPage('admin', 'NonExistentPage')).toBe(true);
    });
  });

  // Null / undefined role falls through to admin-level access
  describe('null or undefined role', () => {
    it('allows access when role is null', () => {
      expect(canAccessPage(null, 'Dashboard')).toBe(true);
    });

    it('allows access when role is undefined', () => {
      expect(canAccessPage(undefined, 'Settings')).toBe(true);
    });
  });

  // "user" role treated same as admin per the implementation
  describe('"user" role', () => {
    it('allows user role to access any page', () => {
      expect(canAccessPage('user', 'SystemArchitecture')).toBe(true);
    });
  });

  // Brand role — pages it should have
  describe('brand role — allowed pages', () => {
    it('allows brand to access Dashboard', () => {
      expect(canAccessPage('brand', 'Dashboard')).toBe(true);
    });

    it('allows brand to access TalentDiscovery', () => {
      expect(canAccessPage('brand', 'TalentDiscovery')).toBe(true);
    });

    it('allows brand to access Marketplace', () => {
      expect(canAccessPage('brand', 'Marketplace')).toBe(true);
    });

    it('allows brand to access CreateOpportunity', () => {
      expect(canAccessPage('brand', 'CreateOpportunity')).toBe(true);
    });
  });

  // Brand role — pages it should NOT have
  describe('brand role — restricted pages', () => {
    it('denies brand access to SystemHealth', () => {
      expect(canAccessPage('brand', 'SystemHealth')).toBe(false);
    });

    it('denies brand access to SystemArchitecture', () => {
      expect(canAccessPage('brand', 'SystemArchitecture')).toBe(false);
    });
  });

  // Talent role
  describe('talent role — allowed pages', () => {
    it('allows talent to access TalentProfile', () => {
      expect(canAccessPage('talent', 'TalentProfile')).toBe(true);
    });

    it('allows talent to access ConnectAccounts', () => {
      expect(canAccessPage('talent', 'ConnectAccounts')).toBe(true);
    });

    it('allows talent to access Brands', () => {
      expect(canAccessPage('talent', 'Brands')).toBe(true);
    });
  });

  describe('talent role — restricted pages', () => {
    it('denies talent access to SystemHealth', () => {
      expect(canAccessPage('talent', 'SystemHealth')).toBe(false);
    });

    it('denies talent access to TalentDiscovery (brand/agency only)', () => {
      expect(canAccessPage('talent', 'TalentDiscovery')).toBe(false);
    });

    it('denies talent access to CreateOpportunity', () => {
      expect(canAccessPage('talent', 'CreateOpportunity')).toBe(false);
    });
  });

  // Agency role
  describe('agency role — allowed pages', () => {
    it('allows agency to access TalentDiscovery', () => {
      expect(canAccessPage('agency', 'TalentDiscovery')).toBe(true);
    });

    it('allows agency to access CreateOpportunity', () => {
      expect(canAccessPage('agency', 'CreateOpportunity')).toBe(true);
    });

    it('allows agency to access Brands', () => {
      expect(canAccessPage('agency', 'Brands')).toBe(true);
    });
  });

  describe('agency role — restricted pages', () => {
    it('denies agency access to SystemHealth', () => {
      expect(canAccessPage('agency', 'SystemHealth')).toBe(false);
    });

    it('denies agency access to TalentProfile', () => {
      expect(canAccessPage('agency', 'TalentProfile')).toBe(false);
    });
  });

  // Unknown / unrecognised roles fall back to full access
  describe('unknown role', () => {
    it('allows an unrecognised role full access (safety fallback)', () => {
      expect(canAccessPage('superuser', 'SystemHealth')).toBe(true);
    });

    it('allows an empty-string role full access', () => {
      // empty string is falsy — same code path as null/undefined
      expect(canAccessPage('', 'Settings')).toBe(true);
    });
  });
});
