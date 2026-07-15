/**
 * Sidebar Configuration for All Roles
 * Each role gets a unique configuration that defines:
 * - Logo display (text, subtitle)
 * - Navigation sections and items
 * - Footer widgets and version
 */

// SVG Icons
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  regions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  centers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  appointments: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  health: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  feedback: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  audit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m7.071-13.071l-4.242 4.242m-5.658 5.658l-4.242 4.242M23 12h-6m-6 0H1m13.071 7.071l-4.242-4.242m-5.658-5.658l-4.242-4.242"/>
    </svg>
  ),
  overview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><polyline points="7 14 12 9 16 13 21 8"/>
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  queue: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  vitals: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  walkin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1"/><path d="M9 20l1-5 2 2 1-5"/><path d="M6 9l2-2 4 2 2-2"/>
    </svg>
  ),
  wellness: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  ),
  referrals: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="18" y1="8" x2="23" y2="13"/>
      <line x1="23" y1="8" x2="18" y2="13"/>
    </svg>
  ),
  records: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  performance: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  managers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM ADMIN CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
export const SYSTEM_ADMIN_CONFIG = {
  logo: {
    src: "/Mesob-short-png.png",
    alt: "MESOB Logo",
    subtitle: "System Administrator",
  },
  sections: [
    {
      items: [
        { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
        { id: "regions", label: "Regions", icon: Icons.regions },
        { id: "users", label: "Users", icon: Icons.users },
        { id: "centers", label: "Centers", icon: Icons.centers },
        { id: "appointments", label: "Appointments", icon: Icons.appointments },
        { id: "vitals", label: "Health Data", icon: Icons.health },
        { id: "feedback", label: "Feedback", icon: Icons.feedback },
        { id: "audit", label: "Audit Logs", icon: Icons.audit },
        { id: "settings", label: "Settings", icon: Icons.settings },
      ],
    },
  ],
  footer: {
    items: [],
    version: "v1.0.0",
    showCapacity: false,
    showCenterStats: false,
    showRefresh: false,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MANAGER CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
export const MANAGER_CONFIG = {
  logo: {
    src: "/Mesob-short-png.png",
    alt: "MESOB Logo",
    subtitle: "Center Manager",
  },
  sections: [
    {
      items: [
        { id: "overview", label: "Overview", icon: Icons.overview },
        { id: "analytics", label: "Analytics", icon: Icons.analytics },
        { id: "referrals", label: "Referrals", icon: Icons.referrals },
        { id: "users", label: "Staff", icon: Icons.users, showCount: true },
        { id: "audit", label: "Audit", icon: Icons.audit },
        { id: "settings", label: "Settings", icon: Icons.settings },
      ],
    },
  ],
  footer: {
    items: [],
    version: "v1.0.0",
    showCapacity: true,  // Manager sees capacity widget
    showCenterStats: false,
    showRefresh: true,   // Manager has refresh button
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// REGIONAL OFFICE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
export const REGIONAL_CONFIG = {
  logo: {
    src: "/Mesob-short-png.png",
    alt: "MESOB Logo",
    subtitle: "Regional Officer",
  },
  sections: [
    {
      items: [
        { id: "overview", label: "Overview", icon: Icons.overview },
        { id: "centers", label: "Centers", icon: Icons.centers, showCount: true },
        { id: "managers", label: "Managers", icon: Icons.managers },
        { id: "performance", label: "Analytics", icon: Icons.performance },
      ],
    },
  ],
  footer: {
    items: [],
    version: "v1.0.0",
    showCapacity: false,
    showCenterStats: true,  // Regional sees center stats
    showRefresh: false,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// FEDERAL OFFICE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
export const FEDERAL_CONFIG = {
  logo: {
    src: "/Mesob-short-png.png",
    alt: "MESOB Logo",
    subtitle: "Federal Officer",
  },
  sections: [
    {
      items: [
        { id: "overview", label: "Overview", icon: Icons.overview },
        { id: "regions", label: "Regions", icon: Icons.regions },
        { id: "centers", label: "Centers", icon: Icons.centers },
        { id: "admin-users", label: "Admin Users", icon: Icons.users },
        { id: "appointments", label: "Appointments", icon: Icons.appointments },
        { id: "feedback", label: "Feedback", icon: Icons.feedback },
        { id: "audit", label: "Audit", icon: Icons.audit },
      ],
    },
  ],
  footer: {
    items: [],
    version: "v1.0.0",
    showCapacity: false,
    showCenterStats: false,
    showRefresh: false,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// NURSE OFFICER CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
export const NURSE_CONFIG = {
  logo: {
    src: "/Mesob-short-png.png",
    alt: "MESOB Logo",
    subtitle: "Nurse Officer",
  },
  sections: [
    {
      items: [
        { id: "analytics", label: "Analytics", icon: Icons.analytics },
        { id: "queue", label: "Queue", icon: Icons.queue },
        { id: "vitals", label: "Vitals", icon: Icons.vitals },
        { id: "walkin", label: "Walk-In", icon: Icons.walkin },
        { id: "wellness", label: "Wellness", icon: Icons.wellness },
        { id: "referrals", label: "Referrals", icon: Icons.referrals },
        { id: "history", label: "History", icon: Icons.history },
      ],
    },
  ],
  footer: {
    items: [],
    version: "v1.0.0",
    showCapacity: false,
    showCenterStats: false,
    showRefresh: false,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// STAFF CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
export const STAFF_CONFIG = {
  logo: {
    src: "/Mesob-short-png.png",
    alt: "MESOB Logo",
    subtitle: "Staff Portal",
  },
  sections: [
    {
      items: [
        { id: "health", label: "Health", icon: Icons.health },
        { id: "appointments", label: "Appointments", icon: Icons.appointments },
        { id: "wellness", label: "Wellness", icon: Icons.wellness },
        { id: "records", label: "Records", icon: Icons.records },
        { id: "feedback", label: "Feedback", icon: Icons.feedback },
      ],
    },
  ],
  footer: {
    items: [],
    version: "v1.0.0",
    showCapacity: false,
    showCenterStats: false,
    showRefresh: false,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION SELECTOR
// ══════════════════════════════════════════════════════════════════════════════
export const getSidebarConfig = (role) => {
  const configs = {
    SYSTEM_ADMIN: SYSTEM_ADMIN_CONFIG,
    MANAGER: MANAGER_CONFIG,
    REGIONAL_OFFICE: REGIONAL_CONFIG,
    FEDERAL_OFFICE: FEDERAL_CONFIG,
    NURSE_OFFICER: NURSE_CONFIG,
    STAFF: STAFF_CONFIG,
  };

  return configs[role] || STAFF_CONFIG; // Default to staff config
};
