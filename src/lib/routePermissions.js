/**
 * Route permissions — DERIVED from the single source of truth in
 * src/config/pageAccess.js.
 *
 * Do NOT add page lists here. Edit PAGE_ACCESS in pageAccess.js instead.
 */
import { PAGE_ACCESS, isRoleAllowed } from '@/config/pageAccess';

// Pre-compute the public page set once at module load
const publicPages = new Set(
  Object.entries(PAGE_ACCESS)
    .filter(([, entry]) => entry.public)
    .map(([name]) => name),
);

/**
 * Check if a user role can access a given page.
 * Admin can access everything. Unknown roles are denied by default.
 * Public pages (About, Blog, etc.) are accessible to all authenticated users.
 */
export function canAccessPage(role, pageName) {
  // Public pages accessible to all authenticated users
  if (publicPages.has(pageName)) return true;
  // Admin has full access
  if (role === 'admin') return true;
  // Unknown, missing, or generic 'user' role — deny by default
  if (!role || role === 'user') return false;
  return isRoleAllowed(pageName, role);
}
