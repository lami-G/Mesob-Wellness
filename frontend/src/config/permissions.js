/**
 * MESOB - Role-Based Access Control Configuration
 * Centralized permissions and role definitions
 */

// ─── Role Constants ───────────────────────────────────────────────────────────
export const ROLES = {
  STAFF: 'STAFF',
  NURSE_OFFICER: 'NURSE_OFFICER',
  MANAGER: 'MANAGER',
  REGIONAL_OFFICE: 'REGIONAL_OFFICE',
  FEDERAL_OFFICE: 'FEDERAL_OFFICE',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
};

// ─── Role Hierarchies ─────────────────────────────────────────────────────────
export const ROLE_HIERARCHY = {
  [ROLES.SYSTEM_ADMIN]: 6,
  [ROLES.FEDERAL_OFFICE]: 5,
  [ROLES.REGIONAL_OFFICE]: 4,
  [ROLES.MANAGER]: 3,
  [ROLES.NURSE_OFFICER]: 2,
  [ROLES.STAFF]: 1
};

// ─── Permission Checker ───────────────────────────────────────────────────────
/**
 * Check if user has access based on allowed roles
 * @param {string} userRole - Current user's role
 * @param {string[]} allowedRoles - Array of roles that have access
 * @returns {boolean}
 */
export const hasAccess = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Check if user has higher or equal role level
 * @param {string} userRole - Current user's role
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean}
 */
export const hasMinimumRole = (userRole, minimumRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const minLevel = ROLE_HIERARCHY[minimumRole] || 0;
  return userLevel >= minLevel;
};

// ─── Feature Permissions ──────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard Access
  VIEW_PATIENT_DASHBOARD: [ROLES.STAFF],
  VIEW_NURSE_DASHBOARD: [ROLES.NURSE_OFFICER],
  VIEW_MANAGER_DASHBOARD: [ROLES.MANAGER],
  VIEW_REGIONAL_DASHBOARD: [ROLES.REGIONAL_OFFICE],
  VIEW_FEDERAL_DASHBOARD: [ROLES.FEDERAL_OFFICE],
  VIEW_ADMIN_DASHBOARD: [ROLES.SYSTEM_ADMIN],

  // User Management
  CREATE_USER: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],
  EDIT_USER: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],
  DELETE_USER: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],
  VIEW_ALL_USERS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE],

  // Region Management
  CREATE_REGION: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],
  EDIT_REGION: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],
  DELETE_REGION: [ROLES.SYSTEM_ADMIN],
  VIEW_ALL_REGIONS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],

  // Center Management
  CREATE_CENTER: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE],
  EDIT_CENTER: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE],
  DELETE_CENTER: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],
  VIEW_ALL_CENTERS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE],
  VIEW_CENTER_DETAILS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],

  // Appointment Management
  VIEW_ALL_APPOINTMENTS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],
  EDIT_APPOINTMENT: [ROLES.SYSTEM_ADMIN, ROLES.NURSE_OFFICER, ROLES.MANAGER],
  CANCEL_APPOINTMENT: [ROLES.SYSTEM_ADMIN, ROLES.NURSE_OFFICER, ROLES.MANAGER, ROLES.STAFF],

  // Health Data
  VIEW_ALL_VITALS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],
  ENTER_VITALS: [ROLES.NURSE_OFFICER],
  VIEW_PATIENT_VITALS: [ROLES.NURSE_OFFICER, ROLES.STAFF],

  // Analytics & Reports
  VIEW_SYSTEM_ANALYTICS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],
  VIEW_REGIONAL_ANALYTICS: [ROLES.REGIONAL_OFFICE, ROLES.FEDERAL_OFFICE, ROLES.SYSTEM_ADMIN],
  VIEW_CENTER_ANALYTICS: [ROLES.MANAGER, ROLES.REGIONAL_OFFICE, ROLES.FEDERAL_OFFICE, ROLES.SYSTEM_ADMIN],

  // System Settings
  MANAGE_SETTINGS: [ROLES.SYSTEM_ADMIN],
  VIEW_SETTINGS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE],
  MANAGE_MAINTENANCE_MODE: [ROLES.SYSTEM_ADMIN],

  // Audit & Security
  VIEW_AUDIT_LOGS: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],
  VIEW_SECURITY_SETTINGS: [ROLES.SYSTEM_ADMIN],

  // Feedback
  VIEW_FEEDBACK: [ROLES.SYSTEM_ADMIN, ROLES.FEDERAL_OFFICE, ROLES.REGIONAL_OFFICE, ROLES.MANAGER],
  SUBMIT_FEEDBACK: [ROLES.STAFF]
};

/**
 * Check if user has specific permission
 * @param {string} userRole - Current user's role
 * @param {string} permission - Permission key from PERMISSIONS
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return hasAccess(userRole, allowedRoles);
};

// ─── Route Access Control ─────────────────────────────────────────────────────
export const ROUTE_ACCESS = {
  '/dashboard': [ROLES.STAFF],
  '/nurse': [ROLES.NURSE_OFFICER],
  '/manager': [ROLES.MANAGER],
  '/regional': [ROLES.REGIONAL_OFFICE],
  '/federal': [ROLES.FEDERAL_OFFICE],
  '/admin': [ROLES.SYSTEM_ADMIN]
};

/**
 * Check if user can access a route
 * @param {string} userRole - Current user's role
 * @param {string} route - Route path
 * @returns {boolean}
 */
export const canAccessRoute = (userRole, route) => {
  const allowedRoles = ROUTE_ACCESS[route];
  if (!allowedRoles) return false;
  return hasAccess(userRole, allowedRoles);
};

// ─── Helper Functions ─────────────────────────────────────────────────────────
/**
 * Get user's default landing page based on role
 * @param {string} userRole - User's role
 * @returns {string} - Route path
 */
export const getDefaultRoute = (userRole) => {
  const routeMap = {
    [ROLES.STAFF]: '/dashboard',
    [ROLES.NURSE_OFFICER]: '/nurse',
    [ROLES.MANAGER]: '/manager',
    [ROLES.REGIONAL_OFFICE]: '/regional',
    [ROLES.FEDERAL_OFFICE]: '/federal',
    [ROLES.SYSTEM_ADMIN]: '/admin'
  };
  return routeMap[userRole] || '/login';
};

/**
 * Get user role display name
 * @param {string} role - Role constant
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.STAFF]: 'Patient',
    [ROLES.NURSE_OFFICER]: 'Nurse Officer',
    [ROLES.MANAGER]: 'Center Manager',
    [ROLES.REGIONAL_OFFICE]: 'Regional Administrator',
    [ROLES.FEDERAL_OFFICE]: 'Federal Administrator',
    [ROLES.SYSTEM_ADMIN]: 'System Administrator'
  };
  return displayNames[role] || 'Unknown';
};
