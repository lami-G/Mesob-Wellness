# 📁 Pages Reorganization Plan - Role-Based Structure

**Date:** June 5, 2026  
**Task:** Reorganize pages into role-based folders  
**Status:** Planning Phase

---

## 🎯 Current Structure

```
pages/
├── admin/                          ✅ Already organized
│   ├── AdminDashboard.jsx
│   ├── AdminProfile.jsx
│   ├── AdminUsers.jsx
│   ├── Analytics.jsx
│   ├── AppointmentManagement.jsx
│   ├── AuditLogs.jsx
│   ├── CenterManagement.jsx
│   ├── FeedbackQuality.jsx
│   ├── HealthData.jsx
│   ├── RegionManagement.jsx
│   ├── SystemSettings.jsx
│   └── UserManagement.jsx
├── Dashboard.jsx                   → patient/Dashboard.jsx
├── FederalDashboard.jsx            → federal/Dashboard.jsx
├── FederalDashboardProfile.jsx     → federal/Profile.jsx
├── Login.jsx                       → auth/Login.jsx
├── ManagerDashboard.jsx            → manager/Dashboard.jsx
├── ManagerDashboardProfile.jsx     → manager/Profile.jsx
├── NurseDashboard.jsx              → nurse/Dashboard.jsx
├── RegionalDashboard.jsx           → regional/Dashboard.jsx
├── RegionalDashboardProfile.jsx    → regional/Profile.jsx
└── Register.jsx                    → auth/Register.jsx
```

---

## 🎯 Target Structure

```
pages/
├── admin/                          ✅ Keep as is
│   ├── Dashboard.jsx               (renamed from AdminDashboard.jsx)
│   ├── Profile.jsx                 (renamed from AdminProfile.jsx)
│   ├── Users.jsx                   (renamed from AdminUsers.jsx)
│   ├── Analytics.jsx
│   ├── AppointmentManagement.jsx
│   ├── AuditLogs.jsx
│   ├── CenterManagement.jsx
│   ├── FeedbackQuality.jsx
│   ├── HealthData.jsx
│   ├── RegionManagement.jsx
│   ├── SystemSettings.jsx
│   └── UserManagement.jsx
├── federal/                        ✨ NEW
│   ├── Dashboard.jsx
│   └── Profile.jsx
├── regional/                       ✨ NEW
│   ├── Dashboard.jsx
│   └── Profile.jsx
├── manager/                        ✨ NEW
│   ├── Dashboard.jsx
│   └── Profile.jsx
├── nurse/                          ✨ NEW
│   └── Dashboard.jsx
├── patient/                        ✨ NEW (STAFF role)
│   └── Dashboard.jsx
└── auth/                           ✨ NEW
    ├── Login.jsx
    └── Register.jsx
```

---

## 📋 Migration Steps

### Phase 1: Create Role-Based Folders
Create new directory structure:
- ✨ `pages/federal/`
- ✨ `pages/regional/`
- ✨ `pages/manager/`
- ✨ `pages/nurse/`
- ✨ `pages/patient/`
- ✨ `pages/auth/`

### Phase 2: Move Files with Renaming

#### Auth Pages
```bash
pages/Login.jsx               → pages/auth/Login.jsx
pages/Register.jsx            → pages/auth/Register.jsx
```

#### Federal Pages
```bash
pages/FederalDashboard.jsx         → pages/federal/Dashboard.jsx
pages/FederalDashboardProfile.jsx  → pages/federal/Profile.jsx
```

#### Regional Pages
```bash
pages/RegionalDashboard.jsx         → pages/regional/Dashboard.jsx
pages/RegionalDashboardProfile.jsx  → pages/regional/Profile.jsx
```

#### Manager Pages
```bash
pages/ManagerDashboard.jsx         → pages/manager/Dashboard.jsx
pages/ManagerDashboardProfile.jsx  → pages/manager/Profile.jsx
```

#### Nurse Pages
```bash
pages/NurseDashboard.jsx  → pages/nurse/Dashboard.jsx
```

#### Patient Pages (STAFF role)
```bash
pages/Dashboard.jsx  → pages/patient/Dashboard.jsx
```

#### Admin Pages (Rename Only)
```bash
pages/admin/AdminDashboard.jsx  → pages/admin/Dashboard.jsx
pages/admin/AdminProfile.jsx    → pages/admin/Profile.jsx
pages/admin/AdminUsers.jsx      → pages/admin/Users.jsx
```

### Phase 3: Update Imports in AppRouter.jsx

**Before:**
```javascript
import Dashboard from "../pages/Dashboard";
import NurseDashboard from "../pages/NurseDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";
import RegionalDashboard from "../pages/RegionalDashboard";
import ManagerDashboardProfile from "../pages/ManagerDashboardProfile";
import RegionalDashboardProfile from "../pages/RegionalDashboardProfile";
import FederalDashboardProfile from "../pages/FederalDashboardProfile";
import FederalDashboard from "../pages/FederalDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
```

**After:**
```javascript
// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Patient (STAFF role)
import PatientDashboard from "../pages/patient/Dashboard";

// Nurse
import NurseDashboard from "../pages/nurse/Dashboard";

// Manager
import ManagerDashboard from "../pages/manager/Dashboard";
import ManagerProfile from "../pages/manager/Profile";

// Regional
import RegionalDashboard from "../pages/regional/Dashboard";
import RegionalProfile from "../pages/regional/Profile";

// Federal
import FederalDashboard from "../pages/federal/Dashboard";
import FederalProfile from "../pages/federal/Profile";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
```

### Phase 4: Update Route Components

**Before:**
```javascript
<Route path="/dashboard" element={<Dashboard />} />
```

**After:**
```javascript
<Route path="/dashboard" element={<PatientDashboard />} />
```

### Phase 5: Update Internal Imports

Search and update imports in all affected files that reference moved pages.

---

## 🔍 Files That Import Pages

### Files to Check and Update:
1. ✅ `src/routes/AppRouter.jsx` - Main routing file
2. ⚠️ Any lazy-loaded route files
3. ⚠️ Any navigation components that import pages
4. ⚠️ Any test files referencing pages

---

## ✅ Route Mapping Validation

### Current Routes → New Imports

| Route Path | Current Import | New Import | Role |
|------------|----------------|------------|------|
| `/login` | `pages/Login` | `pages/auth/Login` | Public |
| `/register` | `pages/Register` | `pages/auth/Register` | Public |
| `/dashboard` | `pages/Dashboard` | `pages/patient/Dashboard` | STAFF |
| `/nurse` | `pages/NurseDashboard` | `pages/nurse/Dashboard` | NURSE_OFFICER |
| `/manager` | `pages/ManagerDashboard` | `pages/manager/Dashboard` | MANAGER |
| `/manager-profile` | `pages/ManagerDashboardProfile` | `pages/manager/Profile` | MANAGER |
| `/regional` | `pages/RegionalDashboard` | `pages/regional/Dashboard` | REGIONAL_OFFICE |
| `/regional-profile` | `pages/RegionalDashboardProfile` | `pages/regional/Profile` | REGIONAL_OFFICE |
| `/federal` | `pages/FederalDashboard` | `pages/federal/Dashboard` | FEDERAL_OFFICE |
| `/federal-profile` | `pages/FederalDashboardProfile` | `pages/federal/Profile` | FEDERAL_OFFICE |
| `/admin` | `pages/admin/AdminDashboard` | `pages/admin/Dashboard` | SYSTEM_ADMIN |

---

## 🚨 Cross-Role Dependencies

### To Check:
- ❓ Do any role pages import components from other role pages?
- ❓ Are there shared page components that should be in `components/`?
- ❓ Are there any circular dependencies?

**Action:** Audit all page imports to identify cross-role dependencies.

---

## 📦 Benefits

### 1. **Clear Role Separation**
Each role has its own folder, making permissions and access control obvious.

### 2. **Easier Navigation**
Developers can quickly find role-specific pages without searching through flat structure.

### 3. **Consistent Naming**
All main pages are named `Dashboard.jsx`, all profiles are `Profile.jsx`.

### 4. **Scalability**
Adding new pages per role is straightforward - just add to the role folder.

### 5. **Better Code Organization**
Related pages are grouped together logically.

### 6. **Clearer Ownership**
Each role folder can be owned/maintained by specific team members.

---

## 🎯 Naming Conventions

### Folder Names (lowercase)
- ✅ `admin/`
- ✅ `federal/`
- ✅ `regional/`
- ✅ `manager/`
- ✅ `nurse/`
- ✅ `patient/`
- ✅ `auth/`

### File Names (PascalCase)
- ✅ `Dashboard.jsx` - Main dashboard for role
- ✅ `Profile.jsx` - User profile page
- ✅ `Settings.jsx` - Role-specific settings
- ✅ `Analytics.jsx` - Role-specific analytics
- ✅ `[Feature].jsx` - Feature-specific pages

---

## 🔒 No Breaking Changes

### Guaranteed Preservation:
1. ✅ All routes remain the same (`/manager`, `/federal`, etc.)
2. ✅ All route guards remain the same (role-based access)
3. ✅ All page functionality remains the same
4. ✅ All props and contexts remain the same
5. ✅ Only import paths change (internal refactor)

---

## 🧪 Testing Checklist

After migration, verify:
- [ ] All routes still work
- [ ] Login redirects correctly per role
- [ ] Protected routes still enforce role access
- [ ] All dashboards load correctly
- [ ] All profile pages load correctly
- [ ] No 404 errors on navigation
- [ ] Dev server starts without errors
- [ ] Build completes without errors
- [ ] No broken imports in console

---

## 📊 Migration Summary

| Category | Count |
|----------|-------|
| New folders created | 6 |
| Files to move | 10 |
| Files to rename | 3 |
| Import statements to update | ~15 |
| Total files affected | ~13 |

---

## 🚀 Execution Order

1. ✅ Create all new folders
2. ✅ Move auth pages (Login, Register)
3. ✅ Move federal pages
4. ✅ Move regional pages
5. ✅ Move manager pages
6. ✅ Move nurse pages
7. ✅ Move patient page
8. ✅ Rename admin pages
9. ✅ Update AppRouter.jsx imports
10. ✅ Update route element references
11. ✅ Test all routes
12. ✅ Run build to verify

---

**Status:** Ready to Execute ✅  
**Estimated Time:** 15-20 minutes  
**Risk Level:** Low (only import path changes, no logic changes)

