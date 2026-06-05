# MESOB Frontend Refactoring - Migration Plan

## 🎯 Objectives
1. Create ONE reusable Sidebar component
2. Consolidate role-based navigation into config
3. Remove 4 duplicate sidebar implementations
4. Create proper layout wrappers
5. Centralize permissions logic
6. **Preserve existing UI styling 100%**

---

## 📋 Phase 1: Create Config Files

### 1.1 Create `frontend/src/config/permissions.js`
```javascript
// Role definitions and permission checks
export const ROLES = {
  STAFF: 'STAFF',
  NURSE_OFFICER: 'NURSE_OFFICER',
  MANAGER: 'MANAGER',
  REGIONAL_OFFICE: 'REGIONAL_OFFICE',
  FEDERAL_OFFICE: 'FEDERAL_OFFICE',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
};

export const hasAccess = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
```

### 1.2 Create `frontend/src/config/sidebar.js`
```javascript
// Navigation configuration for all roles
export const sidebarConfig = {
  admin: {
    title: 'FDRE MESOB',
    subtitle: 'Federal Portal',
    sections: [
      {
        label: 'MAIN MENU',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'regions', label: 'Regions', icon: 'regions' },
          { id: 'users', label: 'Users', icon: 'users' },
          { id: 'centers', label: 'Centers', icon: 'centers' }
        ]
      },
      {
        label: 'DATA & REPORTS',
        items: [
          { id: 'appointments', label: 'Appointments', icon: 'appointments' },
          { id: 'vitals', label: 'Health Data', icon: 'vitals' },
          { id: 'feedback', label: 'Feedback', icon: 'feedback' },
          { id: 'audit', label: 'Audit Logs', icon: 'audit' }
        ]
      }
    ],
    footer: [
      { id: 'settings', label: 'Settings', icon: 'settings' },
      { id: 'security', label: 'Security', icon: 'security' }
    ]
  },
  federal: { /* ... */ },
  manager: { /* ... */ },
  regional: { /* ... */ }
};
```

---

## 📋 Phase 2: Create Shared Components

### 2.1 Create `frontend/src/components/shared/Sidebar.jsx`
**Purpose:** Single reusable sidebar component
**Props:**
- `config` - Navigation config from sidebar.js
- `activeTab` - Current active tab
- `onTabChange` - Tab change handler
- `isOpen` - Sidebar open/closed state
- `extras` - Additional props (capacity, stats, etc.)

**Implementation:** Merge all 4 existing sidebars into one component that accepts config

---

## 📋 Phase 3: Create Layout Components

### 3.1 Update `frontend/src/layouts/AdminLayout.jsx`
**Changes:**
- Import unified Sidebar component
- Pass role-specific config
- Remove conditional sidebar rendering
- Keep all existing styling

### 3.2 Create `frontend/src/layouts/FederalLayout.jsx`
**Purpose:** Dedicated layout for Federal users
**Structure:** Similar to AdminLayout but with federal config

### 3.3 Create `frontend/src/layouts/ManagerLayout.jsx`
**Purpose:** Dedicated layout for Manager users

### 3.4 Create `frontend/src/layouts/RegionalLayout.jsx`
**Purpose:** Dedicated layout for Regional users

---

## 📋 Phase 4: Update Component Structure

### 4.1 Move Layout Components
```
frontend/src/components/layout/
├── AppHeader.jsx          (extract from AdminHeader)
├── UserMenu.jsx           (extract user menu logic)
└── SidebarToggle.jsx      (extract toggle button)
```

### 4.2 Delete Duplicate Sidebars
- ❌ `components/admin/AdminSidebar.jsx`
- ❌ `components/admin/FederalSidebar.jsx`
- ❌ `components/admin/ManagerSidebar.jsx`
- ❌ `components/admin/RegionalSidebar.jsx`

---

## 📋 Phase 5: Update Page Components

### 5.1 Update Dashboard Pages
- `pages/admin/AdminDashboard.jsx` - Use AdminLayout
- `pages/FederalDashboard.jsx` - Use FederalLayout
- `pages/ManagerDashboard.jsx` - Use ManagerLayout
- `pages/RegionalDashboard.jsx` - Use RegionalLayout

**Changes:** Import correct layout, remove sidebar logic

---

## 📂 Final File Structure

```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── AdminHeader.jsx
│   │   ├── NotificationPanel.jsx
│   │   └── ... (other admin components)
│   ├── layout/
│   │   ├── AppHeader.jsx          ✅ NEW
│   │   ├── UserMenu.jsx           ✅ NEW
│   │   └── SidebarToggle.jsx      ✅ NEW
│   └── shared/
│       └── Sidebar.jsx             ✅ NEW (replaces 4 sidebars)
├── config/
│   ├── permissions.js              ✅ NEW
│   └── sidebar.js                  ✅ NEW
├── layouts/
│   ├── AdminLayout.jsx             ♻️ REFACTORED
│   ├── FederalLayout.jsx           ✅ NEW
│   ├── ManagerLayout.jsx           ✅ NEW
│   └── RegionalLayout.jsx          ✅ NEW
```

---

## 🔄 Detailed File Changes

### **FILE 1: `config/permissions.js`** ✅ CREATE
- Define ROLES object
- Export hasAccess function
- Export role-based feature flags

### **FILE 2: `config/sidebar.js`** ✅ CREATE
- Extract navigation from 4 sidebars
- Create config objects for admin/federal/manager/regional
- Include icons, labels, sections

### **FILE 3: `components/shared/Sidebar.jsx`** ✅ CREATE
**Migration from:**
- AdminSidebar.jsx (logo, nav structure, icons)
- FederalSidebar.jsx (federal-specific items)
- ManagerSidebar.jsx (capacity widget)
- RegionalSidebar.jsx (center stats)

**Key features:**
- Accept `config` prop for navigation items
- Render logo section (title/subtitle from config)
- Map through sections and items
- Handle active state
- Render footer items
- Support extras (capacity, stats, refresh button)
- **Copy all CSS classes from existing sidebars**

### **FILE 4: `components/layout/AppHeader.jsx`** ✅ CREATE
**Extract from:** `AdminHeader.jsx`
- Logo
- Title
- Toggle button
- User menu
- Refresh controls
- Center selector (conditional)

### **FILE 5: `components/layout/UserMenu.jsx`** ✅ CREATE
**Extract from:** `AdminHeader.jsx`
- User avatar/photo
- Dropdown menu
- Profile link
- Logout button

### **FILE 6: `layouts/AdminLayout.jsx`** ♻️ REFACTOR
**Changes:**
- Remove sidebar switching logic
- Import shared Sidebar component
- Pass `sidebarConfig.admin`
- Keep all other functionality

### **FILE 7: `layouts/FederalLayout.jsx`** ✅ CREATE
**Copy from:** AdminLayout.jsx
**Changes:**
- Pass `sidebarConfig.federal`
- Set title to "MESOB Federal Portal"
- Remove manager/regional-specific props

### **FILE 8: `layouts/ManagerLayout.jsx`** ✅ CREATE
**Copy from:** AdminLayout.jsx
**Changes:**
- Pass `sidebarConfig.manager`
- Include capacity info props
- Include refresh handler

### **FILE 9: `layouts/RegionalLayout.jsx`** ✅ CREATE
**Copy from:** AdminLayout.jsx
**Changes:**
- Pass `sidebarConfig.regional`
- Include center stats props
- Include centers selector

### **FILE 10-13: Dashboard Pages** ♻️ UPDATE
**AdminDashboard.jsx:**
```javascript
// Before
import AdminLayout from '../../layouts/AdminLayout';

// After (no change in import)
import AdminLayout from '../../layouts/AdminLayout';
// Just verify it works with new layout
```

**FederalDashboard.jsx:**
```javascript
// Before
import AdminLayout from '../layouts/AdminLayout';

// After
import FederalLayout from '../layouts/FederalLayout';
// Update JSX: <AdminLayout dashboardType="federal"> → <FederalLayout>
```

**ManagerDashboard.jsx:**
```javascript
// Before
import AdminLayout from '../layouts/AdminLayout';

// After
import ManagerLayout from '../layouts/ManagerLayout';
// Update JSX: <AdminLayout dashboardType="manager"> → <ManagerLayout>
```

**RegionalDashboard.jsx:**
```javascript
// Before
import AdminLayout from '../layouts/AdminLayout';

// After
import RegionalLayout from '../layouts/RegionalLayout';
// Update JSX: <AdminLayout dashboardType="regional"> → <RegionalLayout>
```

### **FILES TO DELETE:** ❌
1. `components/admin/AdminSidebar.jsx`
2. `components/admin/FederalSidebar.jsx`
3. `components/admin/ManagerSidebar.jsx`
4. `components/admin/RegionalSidebar.jsx`

---

## ✅ Testing Checklist

After each phase:

**Phase 1 (Config):**
- [ ] Files created
- [ ] No syntax errors
- [ ] Exports working

**Phase 2 (Shared Sidebar):**
- [ ] Sidebar renders with admin config
- [ ] Icons display correctly
- [ ] Active state works
- [ ] Styling matches original
- [ ] Open/close animation works

**Phase 3 (Layouts):**
- [ ] AdminLayout works with new Sidebar
- [ ] FederalLayout renders correctly
- [ ] ManagerLayout shows capacity
- [ ] RegionalLayout shows center stats

**Phase 4 (Pages):**
- [ ] Admin dashboard loads
- [ ] Federal dashboard loads
- [ ] Manager dashboard loads
- [ ] Regional dashboard loads
- [ ] Navigation works
- [ ] No console errors

**Phase 5 (Cleanup):**
- [ ] Old sidebars deleted
- [ ] No import errors
- [ ] All dashboards functional

---

## 🎨 Style Preservation Strategy

1. **Copy all CSS classes** from existing sidebars to new Sidebar
2. **Keep class names identical**: `.admin-sidebar`, `.sidebar-logo-section`, etc.
3. **No CSS changes** in `admin-layout.css`
4. **Test visual comparison** before/after each role

---

## 🚀 Execution Order

1. Create config files (5 min)
2. Create Sidebar component (15 min)
3. Create layout components (10 min)
4. Test with one dashboard (5 min)
5. Update remaining dashboards (10 min)
6. Delete old sidebars (2 min)
7. Final testing (10 min)

**Total: ~1 hour**

---

## ⚠️ Risk Mitigation

1. **Git branch:** Create `refactor/unified-sidebar`
2. **Backup:** Keep old sidebars until all testing passes
3. **Incremental:** Test each role before moving to next
4. **Rollback plan:** Revert to old AdminLayout if issues

---

## 📊 Success Metrics

✅ 4 sidebar files deleted (-800 lines)  
✅ 1 reusable Sidebar created  
✅ Navigation centralized in config  
✅ Zero visual changes  
✅ All dashboards functional  
✅ Easier to maintain going forward  

---

**Ready to proceed?** Start with Phase 1 - creating config files.
