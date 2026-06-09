# Current Layout Structure Summary

## Overview of Your Header & Sidebar Architecture

### All Pages (Except Login/Register) Have Header + Sidebar

Your application has **TWO different layout systems**:

---

## 1. **AdminLayout System** (Admin, Manager, Regional, Federal)

**Location**: `frontend/src/layouts/AdminLayout.jsx`

### Used By:
- ✅ **AdminDashboard** (`/admin`)
- ✅ **ManagerDashboard** (`/manager`)
- ✅ **RegionalDashboard** (`/regional`)
- ✅ **FederalDashboard** (`/federal`)

### Structure:
```
AdminLayout.jsx
├── renderSidebar() - Returns different sidebars based on dashboardType
│   ├── AdminSidebar (components/admin/AdminSidebar.jsx)
│   ├── ManagerSidebar (components/admin/ManagerSidebar.jsx)
│   ├── RegionalSidebar (components/admin/RegionalSidebar.jsx)
│   └── FederalSidebar (components/admin/FederalSidebar.jsx)
│
└── AdminHeader (components/admin/AdminHeader.jsx)
```

### CSS Files Used:
- `styles/admin-layout.css`
- `styles/admin-dashboard.css`
- Various role-specific CSS files

### Header Behavior:
- **Federal & Admin**: Special layout with top global header + MESOB branding
- **Manager & Regional**: Standard header with toggle button

---

## 2. **MainLayout System** (Staff, Nurse)

**Location**: `frontend/src/components/MainLayout.jsx`

### Used By:
- ✅ **StaffDashboard** (`/dashboard`)
- ✅ **NurseDashboard** (`/nurse`)

### Structure:
```
MainLayout.jsx (wraps dashboard content)
├── Header (inline in MainLayout)
│   ├── MESOB Logo
│   ├── Centered "MESOB" title
│   ├── Language selector
│   ├── Notification bell
│   └── User menu dropdown
│
├── Sidebar (inline in MainLayout)
│   └── Navigation tabs (based on role)
│       ├── Staff tabs: appointments, health, wellness, records, feedback, profile
│       └── Nurse tabs: analytics, queue, vitals, walkin, wellness, history
│
└── Welcome Bar (below header)
    └── Greeting + Current Date
```

### Key Differences from AdminLayout:
- **Header and Sidebar are built INTO MainLayout** (not separate components)
- **Different navigation structure** - uses tabs with icons
- **Simpler design** - focused on end-user experience

### CSS Files Used:
- `styles/layout.css` (commented out import, but classes might still be used)
- Inline styles in the component

---

## Summary Table

| Dashboard | Layout System | Header Component | Sidebar Component | CSS |
|-----------|---------------|------------------|-------------------|-----|
| **Admin** | AdminLayout | AdminHeader | AdminSidebar | admin-layout.css |
| **Manager** | AdminLayout | AdminHeader | ManagerSidebar | admin-layout.css |
| **Regional** | AdminLayout | AdminHeader | RegionalSidebar | admin-layout.css |
| **Federal** | AdminLayout | AdminHeader | FederalSidebar | admin-layout.css |
| **Staff** | MainLayout | Built-in | Built-in | layout.css (inline styles) |
| **Nurse** | MainLayout | Built-in | Built-in | layout.css (inline styles) |
| **Login** | None | N/A | N/A | Login.module.css |
| **Register** | None | N/A | N/A | N/A |

---

## Header & Sidebar Locations

### Separate Components (Admin Roles):

#### Header:
- `frontend/src/components/admin/AdminHeader.jsx`

#### Sidebars:
- `frontend/src/components/admin/AdminSidebar.jsx`
- `frontend/src/components/admin/ManagerSidebar.jsx`
- `frontend/src/components/admin/RegionalSidebar.jsx`
- `frontend/src/components/admin/FederalSidebar.jsx`

### Built-in (Staff/Nurse):
- `frontend/src/components/MainLayout.jsx` (contains both header and sidebar inline)

---

## StaffDashboard Special Case

**Location**: `frontend/src/pages/StaffDashboard/StaffDashboard.jsx`

- **Has NO header/sidebar code inside it**
- Wrapped by `MainLayout` in `AppRouter.jsx`
- `MainLayout` provides the header, sidebar, and welcome bar
- StaffDashboard only renders tab content

---

## NurseDashboard Special Case

**Location**: `frontend/src/pages/NurseDashboard/NurseDashboard.jsx`

- **HAS its own sidebar** built inline (`.nurse-sidebar` class)
- Wrapped by `MainLayout` in `AppRouter.jsx`
- Gets header from `MainLayout`
- **Has TWO sidebars**: 
  1. Main navigation sidebar (built-in)
  2. Queue page right sidebar for capacity/call-next

---

## Redesign Integration Strategy

### For Admin, Manager, Regional, Federal:
✅ **Apply `unified-layout.css` to:**
1. `AdminLayout.jsx`
2. `AdminHeader.jsx`
3. `AdminSidebar.jsx`
4. `ManagerSidebar.jsx`
5. `RegionalSidebar.jsx`
6. `FederalSidebar.jsx`

### For Staff, Nurse:
✅ **Apply `unified-layout.css` to:**
1. `MainLayout.jsx` (update header and sidebar sections)

### CSS Application Order:
```javascript
// In AdminLayout.jsx
import "../styles/admin-layout.css";       // Base styles
import "../styles/unified-layout.css";     // NEW: Redesign styles

// In MainLayout.jsx
import "../styles/layout.css";             // Base styles (if exists)
import "../styles/unified-layout.css";     // NEW: Redesign styles
```

---

## Key Insight for Integration

**You have 6 different sidebar components + 1 header component + 1 combined layout:**

1. AdminHeader - Shared by all admin-level dashboards
2. AdminSidebar - System Admin only
3. ManagerSidebar - Center Managers
4. RegionalSidebar - Regional Officers
5. FederalSidebar - Federal Officers
6. NurseDashboard inline sidebar - Nurse Officers
7. MainLayout - Staff + Nurse (provides header)

**All of these need the redesign styles applied**, but they can ALL use the same `unified-layout.css` file with minimal changes to their JSX structure!

---

## Next Steps for Integration

### Phase 1: AdminLayout System (Highest Priority)
1. Update `AdminLayout.jsx` to use new CSS classes
2. Update `AdminHeader.jsx` styling
3. Update all 4 admin sidebars to use new classes

### Phase 2: MainLayout System
1. Update `MainLayout.jsx` header section
2. Update `MainLayout.jsx` sidebar section
3. Test Staff dashboard
4. Test Nurse dashboard (handle dual sidebar situation)

### Phase 3: Testing
1. Test all 6 dashboards
2. Verify sidebar collapse/expand
3. Check responsive behavior
4. Validate animations and transitions

---

**Bottom Line**: Every page except Login/Register uses either `AdminLayout` or `MainLayout`, both of which include header and sidebar. The redesign CSS can be applied to all of them by updating these layout components to use the new CSS classes from `unified-layout.css`.
