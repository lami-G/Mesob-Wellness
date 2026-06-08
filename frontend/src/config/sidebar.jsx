/**
 * MESOB - Sidebar Navigation Configuration
 * Centralized navigation structure for all dashboard types
 */

// ─── SVG Icons ────────────────────────────────────────────────────────────────
export const NAV_ICONS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  regions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'admin-users': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  centers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  appointments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  vitals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  feedback: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  audit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 1.64 13.45M4.93 4.93a10 10 0 0 0 0 14.14"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  security: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  managers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  performance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

// ─── System Admin Configuration ──────────────────────────────────────────────
export const adminSidebarConfig = {
  type: 'admin',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Federal Wellness Portal'
  },
  sections: [
    {
      label: 'MAIN MENU',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: NAV_ICONS.dashboard },
        { id: 'regions', label: 'Regions', icon: NAV_ICONS.regions },
        { id: 'users', label: 'Users', icon: NAV_ICONS.users },
        { id: 'centers', label: 'Centers', icon: NAV_ICONS.centers }
      ]
    },
    {
      label: 'DATA & REPORTS',
      divider: true,
      items: [
        { id: 'appointments', label: 'Appointments', icon: NAV_ICONS.appointments },
        { id: 'vitals', label: 'Health Data', icon: NAV_ICONS.vitals },
        { id: 'feedback', label: 'Feedback', icon: NAV_ICONS.feedback },
        { id: 'audit', label: 'Audit Logs', icon: NAV_ICONS.audit }
      ]
    }
  ],
  footer: {
    items: [
      { id: 'settings', label: 'Settings', icon: NAV_ICONS.settings },
      { id: 'security', label: 'Security', icon: NAV_ICONS.security }
    ],
    version: 'v1.0.0'
  }
};

// ─── Federal Office Configuration ────────────────────────────────────────────
export const federalSidebarConfig = {
  type: 'federal',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Federal Wellness Portal'
  },
  sections: [
    {
      label: 'FEDERAL OVERSIGHT',
      items: [
        { id: 'overview', label: 'Overview', icon: NAV_ICONS.overview },
        { id: 'regions', label: 'Regions', icon: NAV_ICONS.regions },
        { id: 'centers', label: 'Centers', icon: NAV_ICONS.centers },
        { id: 'admin-users', label: 'Admin Users', icon: NAV_ICONS['admin-users'] },
        { id: 'appointments', label: 'Appointments', icon: NAV_ICONS.appointments },
        { id: 'feedback', label: 'Feedback', icon: NAV_ICONS.feedback },
        { id: 'audit', label: 'Audit', icon: NAV_ICONS.audit }
      ]
    }
  ],
  footer: {
    items: [],
    version: 'v1.0.0'
  }
};

// ─── Manager Configuration ────────────────────────────────────────────────────
export const managerSidebarConfig = {
  type: 'manager',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Center Wellness Portal'
  },
  sections: [
    {
      label: 'MAIN MENU',
      items: [
        { id: 'overview', label: 'Overview', icon: NAV_ICONS.overview },
        { id: 'analytics', label: 'Analytics', icon: NAV_ICONS.analytics },
        { id: 'users', label: 'Staff', icon: NAV_ICONS.users, showCount: true },
        { id: 'audit', label: 'Audit', icon: NAV_ICONS.audit },
        { id: 'settings', label: 'Settings', icon: NAV_ICONS.settings }
      ]
    }
  ],
  footer: {
    items: [],
    showCapacity: true,
    showRefresh: true,
    version: 'v1.0.0'
  }
};

// ─── Regional Office Configuration ────────────────────────────────────────────
export const regionalSidebarConfig = {
  type: 'regional',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Regional Wellness Portal'
  },
  sections: [
    {
      label: 'REGIONAL OVERSIGHT',
      items: [
        { id: 'overview', label: 'Overview', icon: NAV_ICONS.overview },
        { id: 'centers', label: 'Centers', icon: NAV_ICONS.centers, showCount: true },
        { id: 'managers', label: 'Managers', icon: NAV_ICONS.managers },
        { id: 'performance', label: 'Analytics', icon: NAV_ICONS.performance }
      ]
    }
  ],
  footer: {
    items: [],
    showCenterStats: true,
    version: 'v1.0.0'
  }
};

// ─── Nurse Configuration ──────────────────────────────────────────────────────
export const nurseSidebarConfig = {
  type: 'nurse',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Nurse Wellness Portal'
  },
  sections: [
    {
      label: 'PATIENT CARE',
      items: [
        { id: 'analytics', label: 'Analytics', icon: NAV_ICONS.analytics },
        { id: 'queue', label: 'Queue Management', icon: NAV_ICONS.appointments },
        { id: 'vitals', label: 'Record Vitals', icon: NAV_ICONS.vitals },
        { id: 'walkin', label: 'Walk-in Registration', icon: NAV_ICONS.users },
        { id: 'wellness', label: 'Wellness Plans', icon: NAV_ICONS.feedback },
        { id: 'history', label: 'Patient History', icon: NAV_ICONS.audit }
      ]
    }
  ],
  footer: {
    items: [],
    version: 'v1.0.0'
  }
};

// ─── Patient Configuration ────────────────────────────────────────────────────
export const patientSidebarConfig = {
  type: 'patient',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Personal Wellness Portal'
  },
  sections: [
    {
      label: 'MY HEALTH',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: NAV_ICONS.dashboard },
        { id: 'appointments', label: 'My Appointments', icon: NAV_ICONS.appointments },
        { id: 'vitals', label: 'Health Data', icon: NAV_ICONS.vitals },
        { id: 'feedback', label: 'Feedback', icon: NAV_ICONS.feedback }
      ]
    }
  ],
  footer: {
    items: [],
    version: 'v1.0.0'
  }
};

// ─── Staff Configuration (Same as Patient) ───────────────────────────────────
export const staffSidebarConfig = {
  type: 'staff',
  logo: {
    src: '/Mesob-short-png.png',
    alt: 'MESOB',
    title: 'FDRE MESOB',
    subtitle: 'Personal Wellness Portal'
  },
  sections: [
    {
      label: 'MY WELLNESS',
      items: [
        { id: 'appointments', label: 'My Appointments', icon: NAV_ICONS.appointments },
        { id: 'health', label: 'Health Journey', icon: NAV_ICONS.vitals },
        { id: 'wellness', label: 'Wellness Plan', icon: NAV_ICONS.feedback },
        { id: 'records', label: 'Health Records', icon: NAV_ICONS.audit },
        { id: 'feedback', label: 'Feedback', icon: NAV_ICONS.feedback }
      ]
    }
  ],
  footer: {
    items: [],
    version: 'v1.0.0'
  }
};

// ─── Configuration Selector ───────────────────────────────────────────────────
/**
 * Get sidebar configuration by type
 * @param {string} type - Dashboard type: 'admin' | 'federal' | 'manager' | 'regional' | 'nurse' | 'patient' | 'staff'
 * @returns {object} Sidebar configuration
 */
export const getSidebarConfig = (type) => {
  const configs = {
    admin: adminSidebarConfig,
    federal: federalSidebarConfig,
    manager: managerSidebarConfig,
    regional: regionalSidebarConfig,
    nurse: nurseSidebarConfig,
    patient: patientSidebarConfig,
    staff: staffSidebarConfig
  };
  return configs[type] || adminSidebarConfig;
};

// ─── Export All Configs ───────────────────────────────────────────────────────
export const sidebarConfig = {
  admin: adminSidebarConfig,
  federal: federalSidebarConfig,
  manager: managerSidebarConfig,
  regional: regionalSidebarConfig,
  nurse: nurseSidebarConfig,
  patient: patientSidebarConfig,
  staff: staffSidebarConfig
};
