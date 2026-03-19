/**
 * teamPermissions.js
 *
 * Defines fine-grained team-level roles and their permissions.
 * These are separate from the platform-level user roles (admin/brand/talent/agency).
 * A user's platform role determines which pages they can visit; their team role
 * determines what actions they can take inside a shared team workspace.
 */

export const TEAM_ROLES = {
  owner: {
    label: 'Owner',
    permissions: ['all'],
    description: 'Full control over the team including billing and deletion',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  admin: {
    label: 'Admin',
    permissions: ['deals', 'outreach', 'data_room', 'analytics', 'team_manage'],
    description: 'All deal and outreach actions plus team member management',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  deal_manager: {
    label: 'Deal Manager',
    permissions: ['deals', 'outreach', 'data_room', 'analytics'],
    description: 'Create, edit and close deals with full data room access',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  viewer: {
    label: 'Viewer',
    permissions: ['deals_read', 'analytics_read'],
    description: 'Read-only access to deals and analytics dashboards',
    color: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  talent_rep: {
    label: 'Talent Rep',
    permissions: ['deals', 'outreach'],
    description: 'Manage deals and send outreach on behalf of talent',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  client_view: {
    label: 'Client View',
    permissions: ['deals_read'],
    description: 'View deal status — ideal for external brand clients',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

/**
 * Human-readable descriptions of each granular permission key.
 */
export const PERMISSION_LABELS = {
  all:          'Full platform access',
  deals:        'Create, edit & delete deals',
  deals_read:   'View deals (read-only)',
  outreach:     'Compose & send outreach',
  data_room:    'Access & upload data room files',
  analytics:    'View full analytics',
  analytics_read: 'View analytics (read-only)',
  team_manage:  'Invite / remove team members',
};

/**
 * Check whether a user should be allowed to perform an action.
 *
 * @param {string} userRole    - Platform-level role: 'admin' | 'brand' | 'talent' | 'agency'
 * @param {string} teamRole    - Team-level role key from TEAM_ROLES
 * @param {string} permission  - Permission key from PERMISSION_LABELS
 * @returns {boolean}
 */
export function hasPermission(userRole, teamRole, permission) {
  // Platform admins bypass all team-level restrictions.
  if (userRole === 'admin') return true;

  const role = TEAM_ROLES[teamRole];
  if (!role) return false;

  // Owners have every permission.
  if (role.permissions.includes('all')) return true;

  return role.permissions.includes(permission);
}

/**
 * Return the display label for a team role key, falling back gracefully.
 *
 * @param {string} role - Key from TEAM_ROLES
 * @returns {string}
 */
export function getTeamRoleLabel(role) {
  return TEAM_ROLES[role]?.label ?? role ?? 'Unknown';
}

/**
 * Return the color classes for a team role badge.
 *
 * @param {string} role - Key from TEAM_ROLES
 * @returns {string}
 */
export function getTeamRoleColor(role) {
  return TEAM_ROLES[role]?.color ?? 'bg-slate-50 text-slate-600 border-slate-200';
}

/**
 * Return the list of team roles that a given platform user type is allowed to assign.
 * Talent users cannot assign admin/owner roles to protect platform integrity.
 *
 * @param {string} userType - Platform-level role
 * @returns {Array<{ value: string, label: string, description: string }>}
 */
export function getAvailableRoles(userType) {
  const allRoles = Object.entries(TEAM_ROLES).map(([value, config]) => ({
    value,
    label: config.label,
    description: config.description,
    color: config.color,
  }));

  if (userType === 'admin') return allRoles;

  // Non-admin platform users can only assign limited roles.
  const restricted = ['owner'];
  if (userType === 'talent') restricted.push('admin');

  return allRoles.filter(r => !restricted.includes(r.value));
}
