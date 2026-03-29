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

  // Null / undefined / "user" role denied by default
  describe('null or undefined role', () => {
    it('denies access when role is null (except public pages)', () => {
      expect(canAccessPage(null, 'Dashboard')).toBe(false);
    });

    it('denies access when role is undefined (except public pages)', () => {
      expect(canAccessPage(undefined, 'Settings')).toBe(false);
    });

    it('allows null role to access public pages', () => {
      expect(canAccessPage(null, 'About')).toBe(true);
    });
  });

  describe('"user" role', () => {
    it('denies user role access to non-public pages', () => {
      expect(canAccessPage('user', 'SystemArchitecture')).toBe(false);
    });

    it('allows user role to access public pages', () => {
      expect(canAccessPage('user', 'About')).toBe(true);
    });
  });

  // Brand role
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

    it('allows brand to access AICommandCenter (free hook)', () => {
      expect(canAccessPage('brand', 'AICommandCenter')).toBe(true);
    });
  });

  describe('brand role — restricted pages', () => {
    it('denies brand access to SystemHealth', () => {
      expect(canAccessPage('brand', 'SystemHealth')).toBe(false);
    });

    it('denies brand access to SystemArchitecture', () => {
      expect(canAccessPage('brand', 'SystemArchitecture')).toBe(false);
    });
  });

  // Talent role — now has role parity
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

    it('allows talent to access TalentDiscovery (role parity)', () => {
      expect(canAccessPage('talent', 'TalentDiscovery')).toBe(true);
    });

    it('allows talent to access CreateOpportunity (role parity)', () => {
      expect(canAccessPage('talent', 'CreateOpportunity')).toBe(true);
    });

    it('allows talent to access AICommandCenter (free hook)', () => {
      expect(canAccessPage('talent', 'AICommandCenter')).toBe(true);
    });
  });

  describe('talent role — restricted pages', () => {
    it('denies talent access to SystemHealth', () => {
      expect(canAccessPage('talent', 'SystemHealth')).toBe(false);
    });

    it('denies talent access to AdminDashboard', () => {
      expect(canAccessPage('talent', 'AdminDashboard')).toBe(false);
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

    it('allows agency to access AICommandCenter (free hook)', () => {
      expect(canAccessPage('agency', 'AICommandCenter')).toBe(true);
    });
  });

  describe('agency role — restricted pages', () => {
    it('denies agency access to SystemHealth', () => {
      expect(canAccessPage('agency', 'SystemHealth')).toBe(false);
    });

    it('denies agency access to AdminDashboard', () => {
      expect(canAccessPage('agency', 'AdminDashboard')).toBe(false);
    });
  });

  // Manager role
  describe('manager role — allowed pages', () => {
    it('allows manager to access ManagerProfile', () => {
      expect(canAccessPage('manager', 'ManagerProfile')).toBe(true);
    });

    it('allows manager to access ManagerSetup', () => {
      expect(canAccessPage('manager', 'ManagerSetup')).toBe(true);
    });

    it('allows manager to access TalentDiscovery (role parity)', () => {
      expect(canAccessPage('manager', 'TalentDiscovery')).toBe(true);
    });
  });

  // Unknown roles are denied by default
  describe('unknown role', () => {
    it('denies an unrecognised role access to non-public pages', () => {
      expect(canAccessPage('superuser', 'SystemHealth')).toBe(false);
    });

    it('denies an empty-string role access to non-public pages', () => {
      expect(canAccessPage('', 'Settings')).toBe(false);
    });

    it('allows unknown roles to access public pages', () => {
      expect(canAccessPage('superuser', 'About')).toBe(true);
    });
  });

  // Public pages
  describe('public pages', () => {
    const publicPageNames = ['About', 'Blog', 'Careers', 'Contact', 'Customers', 'CookiePolicy', 'GDPR', 'Demo'];

    publicPageNames.forEach((page) => {
      it(`allows any role to access ${page}`, () => {
        expect(canAccessPage('talent', page)).toBe(true);
        expect(canAccessPage('brand', page)).toBe(true);
        expect(canAccessPage('agency', page)).toBe(true);
        expect(canAccessPage(null, page)).toBe(true);
      });
    });
  });

  // Role parity — same feature available to all roles
  describe('role parity', () => {
    const parityPages = [
      'Dashboard', 'Marketplace', 'AICommandCenter', 'Approvals',
      'TalentDiscovery', 'CreateOpportunity', 'MatchEngine', 'ContactFinder',
    ];

    parityPages.forEach((page) => {
      it(`${page} is accessible to all standard roles`, () => {
        expect(canAccessPage('brand', page)).toBe(true);
        expect(canAccessPage('talent', page)).toBe(true);
        expect(canAccessPage('agency', page)).toBe(true);
        expect(canAccessPage('manager', page)).toBe(true);
      });
    });
  });
});
