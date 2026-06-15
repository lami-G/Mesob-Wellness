# Role-Based Dashboard Restructuring Specification

## 📋 Project Overview

**Goal:** Restructure the frontend to have consistent, role-based organization for all 8 user types.

**Current Problem:**
- Staff dashboard uses generic names (`Dashboard`, `dashboard`)
- Other role dashboards are loose files in `pages/` root
- Components are mixed between `dashboard/` (staff-only) and role-specific folders
- Inconsistent structure makes codebase confusing

**Solution:** Implement Option A - Role-Based Page Folders with consistent naming

---

## 🎯 Objectives

1. ✅ **Consistent Naming:** All dashboards follow `[Role]Dashboard` pattern
2. ✅ **Folder Structure:** Each role has a dedicated page folder
3. ✅ **Component Organization:** Components grouped by role they serve
4. ✅ **Clear Ownership:** Easy to identify which files belong to which role
5. ✅ **Maintainability:** Easier to add new features per role
6. ✅ **Zero Breaking Changes:** All functionality remains identical

---

## 📊 Current vs Target Structure

### **BEFORE (Current):**
```
frontend/src/
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/                  ← Generic name (Staff)
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.module.css
│   ├── NurseDashboard.jsx          ← Loose file
│   ├── ManagerDashboard.jsx        ← Loose file
│   ├── RegionalDashboard.jsx       ← Loose file
│   ├── FederalDashboard.jsx        ← Loose file
│   └── admin/
│       └── AdminDashboard.jsx
│
└── components/
    ├── dashboard/                   ← Generic name (Staff components)
    │   ├── BookingCalendar.jsx
    │   ├── MyAppointments.jsx
    │   ├── HealthJourney.jsx
    │   ├── WellnessPlan.jsx
    │   ├── ProfileSection.jsx
    │   ├── FeedbackForm.jsx
    │   └── LongitudinalRecords.jsx
    ├── nurse/
    ├── admin/
    └── shared/
```

### **AFTER (Target):**
```
frontend/src/
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── StaffDashboard/              ← Clear role name
│   │   ├── StaffDashboard.jsx
│   │   └── StaffDashboard.module.css
│   ├── NurseDashboard/              ← Folder structure
│   │   ├── NurseDashboard.jsx
│   │   └── NurseDashboard.module.css
│   ├── ManagerDashboard/            ← Folder structure
│   │   ├── ManagerDashboard.jsx
│   │   └── ManagerDashboard.module.css
│   ├── RegionalDashboard/           ← Folder structure
│   │   ├── RegionalDashboard.jsx
│   │   └── RegionalDashboard.module.css
│   ├── FederalDashboard/            ← Folder structure
│   │   ├── FederalDashboard.jsx
│   │   └── FederalDashboard.module.css
│   └── AdminDashboard/              ← Consistent naming
│       ├── AdminDashboard.jsx
│       └── AdminDashboard.module.css
│
└── components/
    ├── staff/                        ← Clear role name
    │   ├── BookingCalendar.jsx
    │   ├── BookingCalendar.module.css
    │   ├── MyAppointments.jsx
    │   ├── MyAppointments.module.css
    │   ├── HealthJourney.jsx
    │   ├── HealthJourney.module.css
    │   ├── WellnessPlan.jsx
    │   ├── WellnessPlan.module.css
    │   ├── ProfileSection.jsx
    │   ├── ProfileSection.module.css
    │   ├── FeedbackForm.jsx
    │   ├── FeedbackForm.module.css
    │   ├── LongitudinalRecords.jsx
    │   └── LongitudinalRecords.module.css
    ├── nurse/
    ├── manager/
    ├── regional/
    ├── federal/
    ├── admin/
    └── shared/
```

---

## 📝 Implementation Plan

### **Phase 1: Rename Staff Dashboard (Priority 1)**

#### **Step 1.1: Rename Page Folder**
- **Action:** Rename `pages/Dashboard/` → `pages/StaffDashboard/`
- **Files Affected:**
  - `pages/Dashboard/Dashboard.jsx` → `pages/StaffDashboard/StaffDashboard.jsx`
  - `pages/Dashboard/Dashboard.module.css` → `pages/StaffDashboard/StaffDashboard.module.css`

#### **Step 1.2: Update File Contents**
- **File:** `StaffDashboard.jsx`
  - Update component name: `function Dashboard()` → `function StaffDashboard()`
  - Update export: `export default Dashboard` → `export default StaffDashboard`
  - Update CSS import: `import styles from "./Dashboard.module.css"` → `import styles from "./StaffDashboard.module.css"`

#### **Step 1.3: Update Routing**
- **File:** `routes/AppRouter.jsx`
  - Update import: `import Dashboard from "../pages/Dashboard"` → `import StaffDashboard from "../pages/StaffDashboard"`
  - Update route: `<Dashboard />` → `<StaffDashboard />`

#### **Step 1.4: Update CSS Module Class Names**
- **File:** `StaffDashboard.module.css`
  - Keep all existing styles (no changes needed)
  - File already uses `.dashboardContainer`, `.dashboardContent` etc.

---

### **Phase 2: Rename Staff Components (Priority 1)**

#### **Step 2.1: Rename Components Folder**
- **Action:** Rename `components/dashboard/` → `components/staff/`
- **Files Affected:** All 7 components + their CSS modules

#### **Step 2.2: Update Component Imports in StaffDashboard**
- **File:** `pages/StaffDashboard/StaffDashboard.jsx`
- **Update all imports:**
  ```javascript
  // BEFORE
  import BookingCalendar from "../../components/dashboard/BookingCalendar";
  import MyAppointments from "../../components/dashboard/MyAppointments";
  import HealthJourney from "../../components/dashboard/HealthJourney";
  import WellnessPlan from "../../components/dashboard/WellnessPlan";
  import ProfileSection from "../../components/dashboard/ProfileSection";
  import FeedbackForm from "../../components/dashboard/FeedbackForm";
  import LongitudinalRecords from "../../components/dashboard/LongitudinalRecords";

  // AFTER
  import BookingCalendar from "../../components/staff/BookingCalendar";
  import MyAppointments from "../../components/staff/MyAppointments";
  import HealthJourney from "../../components/staff/HealthJourney";
  import WellnessPlan from "../../components/staff/WellnessPlan";
  import ProfileSection from "../../components/staff/ProfileSection";
  import FeedbackForm from "../../components/staff/FeedbackForm";
  import LongitudinalRecords from "../../components/staff/LongitudinalRecords";
  ```

#### **Step 2.3: Check for Other Import References**
- Search entire codebase for `components/dashboard/` imports
- Update any references in other files

---

### **Phase 3: Restructure Nurse Dashboard (Priority 2)**

#### **Step 3.1: Create Folder Structure**
- **Action:** Create `pages/NurseDashboard/` folder
- **Move:** `pages/NurseDashboard.jsx` → `pages/NurseDashboard/NurseDashboard.jsx`

#### **Step 3.2: Create CSS Module**
- **Action:** Create `pages/NurseDashboard/NurseDashboard.module.css`
- **Extract styles:** From existing inline styles or global CSS

#### **Step 3.3: Update Routing**
- **File:** `routes/AppRouter.jsx`
- **Update import path:** `import NurseDashboard from "../pages/NurseDashboard"`

---

### **Phase 4: Restructure Manager Dashboard (Priority 2)**

#### **Step 4.1: Create Folder Structure**
- **Action:** Create `pages/ManagerDashboard/` folder
- **Move:** `pages/ManagerDashboard.jsx` → `pages/ManagerDashboard/ManagerDashboard.jsx`

#### **Step 4.2: Create CSS Module**
- **Action:** Create `pages/ManagerDashboard/ManagerDashboard.module.css`
- **Extract styles:** From existing CSS imports

#### **Step 4.3: Update Routing**
- **File:** `routes/AppRouter.jsx`
- **Update import path:** `import ManagerDashboard from "../pages/ManagerDashboard"`

---

### **Phase 5: Restructure Regional Dashboard (Priority 2)**

#### **Step 5.1: Create Folder Structure**
- **Action:** Create `pages/RegionalDashboard/` folder
- **Move:** `pages/RegionalDashboard.jsx` → `pages/RegionalDashboard/RegionalDashboard.jsx`

#### **Step 5.2: Create CSS Module**
- **Action:** Create `pages/RegionalDashboard/RegionalDashboard.module.css`
- **Extract styles:** From existing CSS imports

#### **Step 5.3: Update Routing**
- **File:** `routes/AppRouter.jsx`
- **Update import path:** `import RegionalDashboard from "../pages/RegionalDashboard"`

---

### **Phase 6: Restructure Federal Dashboard (Priority 2)**

#### **Step 6.1: Create Folder Structure**
- **Action:** Create `pages/FederalDashboard/` folder
- **Move:** `pages/FederalDashboard.jsx` → `pages/FederalDashboard/FederalDashboard.jsx`

#### **Step 6.2: Create CSS Module**
- **Action:** Create `pages/FederalDashboard/FederalDashboard.module.css`
- **Extract styles:** From existing CSS imports

#### **Step 6.3: Update Routing**
- **File:** `routes/AppRouter.jsx`
- **Update import path:** `import FederalDashboard from "../pages/FederalDashboard"`

---

### **Phase 7: Restructure Admin Dashboard (Priority 3)**

#### **Step 7.1: Rename Folder**
- **Action:** Rename `pages/admin/` → `pages/AdminDashboard/`
- **Move:** `pages/admin/AdminDashboard.jsx` → `pages/AdminDashboard/AdminDashboard.jsx`

#### **Step 7.2: Create CSS Module**
- **Action:** Create `pages/AdminDashboard/AdminDashboard.module.css`
- **Extract styles:** From existing CSS imports

#### **Step 7.3: Update Routing**
- **File:** `routes/AppRouter.jsx`
- **Update import:** `import AdminDashboard from "../pages/admin/AdminDashboard"` → `import AdminDashboard from "../pages/AdminDashboard"`

---

### **Phase 8: Create Component Folders (Priority 3)**

#### **Step 8.1: Create Folder Structure**
- **Action:** Create empty folders:
  - `components/manager/`
  - `components/regional/`
  - `components/federal/`

#### **Step 8.2: Extract Components (Future Work)**
- Extract reusable components from each dashboard
- Move into respective role folders
- This will be done incrementally as features are refactored

---

## 🔄 Migration Checklist

### **Phase 1: Staff Dashboard Rename ✅**
- [ ] Create `pages/StaffDashboard/` folder
- [ ] Move and rename `Dashboard.jsx` → `StaffDashboard.jsx`
- [ ] Move and rename `Dashboard.module.css` → `StaffDashboard.module.css`
- [ ] Update component name in file
- [ ] Update CSS import in file
- [ ] Update `AppRouter.jsx` import
- [ ] Test: Login as STAFF → verify dashboard loads
- [ ] Delete old `pages/Dashboard/` folder

### **Phase 2: Staff Components Rename ✅**
- [ ] Rename `components/dashboard/` → `components/staff/`
- [ ] Update all 7 component imports in `StaffDashboard.jsx`
- [ ] Search for other references to `components/dashboard/`
- [ ] Update any found references
- [ ] Test: All 5 tabs in Staff Dashboard work correctly
- [ ] Verify all components render properly

### **Phase 3: Nurse Dashboard ⏳**
- [ ] Create `pages/NurseDashboard/` folder
- [ ] Move `NurseDashboard.jsx` into folder
- [ ] Create `NurseDashboard.module.css`
- [ ] Update import in `AppRouter.jsx`
- [ ] Test: Login as NURSE → verify dashboard loads

### **Phase 4: Manager Dashboard ⏳**
- [ ] Create `pages/ManagerDashboard/` folder
- [ ] Move `ManagerDashboard.jsx` into folder
- [ ] Create `ManagerDashboard.module.css`
- [ ] Update import in `AppRouter.jsx`
- [ ] Test: Login as MANAGER → verify dashboard loads

### **Phase 5: Regional Dashboard ⏳**
- [ ] Create `pages/RegionalDashboard/` folder
- [ ] Move `RegionalDashboard.jsx` into folder
- [ ] Create `RegionalDashboard.module.css`
- [ ] Update import in `AppRouter.jsx`
- [ ] Test: Login as REGIONAL_OFFICE → verify dashboard loads

### **Phase 6: Federal Dashboard ⏳**
- [ ] Create `pages/FederalDashboard/` folder
- [ ] Move `FederalDashboard.jsx` into folder
- [ ] Create `FederalDashboard.module.css`
- [ ] Update import in `AppRouter.jsx`
- [ ] Test: Login as FEDERAL_OFFICE → verify dashboard loads

### **Phase 7: Admin Dashboard ⏳**
- [ ] Rename `pages/admin/` → `pages/AdminDashboard/`
- [ ] Create `AdminDashboard.module.css`
- [ ] Update import in `AppRouter.jsx`
- [ ] Test: Login as SYSTEM_ADMIN → verify dashboard loads

### **Phase 8: Component Folders ⏳**
- [ ] Create `components/manager/` folder
- [ ] Create `components/regional/` folder
- [ ] Create `components/federal/` folder
- [ ] Document structure for future extractions

---

## 🧪 Testing Strategy

### **Test Each Phase:**
1. **Compilation Test:** `npm run dev` → No errors
2. **Route Test:** Navigate to each dashboard route → Loads correctly
3. **Component Test:** Test all tabs/features in each dashboard → Works as before
4. **CSS Test:** Visual inspection → No styling changes
5. **Diagnostics:** `npx eslint` → No new errors

### **Smoke Tests After Each Phase:**
- [ ] Login page loads
- [ ] Can login with each role
- [ ] Dashboard for each role loads
- [ ] All components in each dashboard render
- [ ] No console errors
- [ ] All navigation works

---

## 📦 Files to Modify

### **Phase 1 & 2 (Staff):**
1. `pages/Dashboard/` → `pages/StaffDashboard/`
2. `components/dashboard/` → `components/staff/`
3. `routes/AppRouter.jsx`

### **Phase 3-7 (Other Roles):**
1. Create 5 new page folders
2. Move 5 dashboard files
3. Create 5 new CSS modules
4. Update `routes/AppRouter.jsx` (5 imports)

### **Phase 8 (Future):**
1. Create 3 new component folders
2. Extract components (incremental, as needed)

---

## ⚠️ Critical Notes

### **DO NOT:**
- ❌ Change any functionality
- ❌ Change any styling (visual appearance)
- ❌ Refactor component logic
- ❌ Add new features
- ❌ Remove any existing code (except old empty folders)

### **DO:**
- ✅ Move files to new locations
- ✅ Update import paths
- ✅ Rename files to match role
- ✅ Keep all existing CSS
- ✅ Test thoroughly after each phase

### **Safety:**
- Each phase is independent
- Can be done incrementally
- Easy to rollback if issues arise
- No breaking changes to functionality

---

## 📈 Success Criteria

### **Completion:**
- All 8 user types have consistent folder structure
- All dashboards load correctly
- All imports updated
- All tests pass
- No visual changes
- No functionality changes

### **Quality:**
- Clear, consistent naming
- Easy to navigate codebase
- Role ownership is obvious
- Maintainable structure
- Scalable for future features

---

## 🚀 Ready to Start?

**Estimated Time:** 3-4 hours total
- Phase 1 & 2: 1 hour (Staff Dashboard + Components)
- Phase 3-7: 2 hours (Other Role Dashboards)
- Phase 8: 30 minutes (Component folders)
- Testing: 30 minutes

**Order of Execution:**
1. Start with Staff (most complex)
2. Then other roles (simpler structure)
3. Create empty component folders last

---

## ❓ Questions Before Starting?

Before I begin implementation, please confirm:

1. ✅ **Approve Option A structure?** (Role-based folders)
2. ✅ **Start with Phase 1 & 2?** (Staff Dashboard + Components)
3. ✅ **Any specific naming preferences?** (StaffDashboard vs PatientDashboard?)
4. ✅ **Test each phase separately?** (Or do all at once?)

---

**Ready to begin? Type "START" and I'll begin Phase 1!**
