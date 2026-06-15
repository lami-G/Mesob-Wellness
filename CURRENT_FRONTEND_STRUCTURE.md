# Current Frontend File & Folder Structure

## Overview
This document outlines the **current state** of the Mesob-Wellness frontend folder structure, highlighting the CSS organization issues that make UI modifications difficult.

---

## 📁 Root Structure

```
frontend/
├── dist/                           # Build output
├── node_modules/                   # Dependencies
├── public/                         # Static assets
│   ├── image.png
│   └── Mesob-short-png.png
├── src/                           # Source code (detailed below)
├── .env                           # Environment variables
├── .env.example
├── .gitignore
├── index.html                     # Entry HTML
├── package.json
├── package-lock.json
├── postcss.config.js              # PostCSS config
├── tailwind.config.js             # Tailwind config
├── vite.config.js                 # Vite bundler config
└── README.md
```

---

## 📁 `src/` Directory Structure

```
src/
├── components/                     # Reusable components
│   ├── admin/                     # Admin-specific components
│   ├── analytics/                 # Analytics components
│   ├── dashboard/                 # Dashboard components
│   ├── forms/                     # Form components
│   ├── nurse/                     # Nurse-specific components
│   ├── AnimatedWaveBackground.jsx
│   ├── MainLayout.jsx
│   ├── MaintenanceMode.jsx
│   ├── ProtectedRoute.jsx
│   └── RoleBasedRoute.jsx
│
├── context/                       # React context providers
│   └── AuthContext.jsx
│
├── layouts/                       # Layout components
│   └── AdminLayout.jsx
│
├── pages/                         # Page components
│   ├── admin/                     # Admin pages
│   ├── Dashboard.jsx
│   ├── FederalDashboard.jsx
│   ├── FederalDashboardProfile.jsx
│   ├── Login.jsx
│   ├── ManagerDashboard.jsx
│   ├── ManagerDashboardProfile.jsx
│   ├── NurseDashboard.jsx
│   ├── RegionalDashboard.jsx
│   ├── RegionalDashboardProfile.jsx
│   └── Register.jsx
│
├── routes/                        # Routing configuration
│   └── AppRouter.jsx
│
├── services/                      # API services
│   ├── adminService.js
│   ├── analyticsService.js
│   ├── api.js
│   ├── authService.js
│   ├── conditionsService.js
│   ├── healthService.js
│   ├── notificationService.js
│   ├── regionalService.js
│   ├── registrationService.js
│   └── settingsService.js
│
├── styles/                        # CSS files (PROBLEMATIC - see issues below)
│   ├── admin-alerts.css
│   ├── admin-analytics.css
│   ├── admin-audit.css
│   ├── admin-dashboard.css
│   ├── admin-feedback.css
│   ├── admin-filters.css
│   ├── admin-health-dashboard.css
│   ├── admin-health.css
│   ├── admin-layout.css
│   ├── admin-modals.css
│   ├── admin-regions.css
│   ├── admin-settings.css
│   ├── admin-tables.css
│   ├── dashboard-new-features.css
│   ├── dashboard-priority2.css
│   ├── dashboard-tokens.css
│   ├── dashboard.css
│   ├── global.css
│   ├── layout.css
│   ├── login.css
│   ├── maintenance.css
│   ├── manager-dashboard.css
│   ├── notification-panel.css
│   ├── nurse-analytics.css
│   ├── nurse-dashboard-new.css
│   ├── nurse-dashboard.css
│   ├── regional-dashboard-responsive.css
│   ├── register.css
│   ├── tailwind.css
│   ├── tooltip-fix.css
│   └── walkin.css
│
├── utils/                         # Utility functions
│   └── wellnessAI.js
│
├── App.jsx                        # Root App component
└── main.jsx                       # Application entry point
```

---

## 🔍 Detailed Component Structure

### `components/admin/`
```
admin/
├── AddCenterModal.jsx
├── AdminHeader.jsx
├── CenterFormModal.jsx
├── ChangePasswordModal.jsx
├── DashboardMetrics.jsx
├── FederalSidebar.jsx
├── FeedbackAnalytics.jsx
├── FeedbackList.jsx
├── NotificationPanel.jsx
├── RegionEditModal.jsx
└── RegionManagerModal.jsx
```

### `components/nurse/`
```
nurse/
├── NurseAnalytics.jsx
├── QueueDisplayScreen.jsx
├── VitalsEntry.jsx
├── WellnessPlanCreation.jsx
└── WellnessPlanTemplates.jsx
```

### `pages/admin/`
```
admin/
├── AdminDashboard.jsx
├── AdminProfile.jsx
├── AdminUsers.jsx
├── Analytics.jsx
├── AuditLogs.jsx
├── FeedbackQuality.jsx
├── HealthData.jsx
├── RegionManagement.jsx
└── SystemSettings.jsx
```

---

## ❌ **MAJOR CSS ORGANIZATION ISSUES**

### Problem 1: **Mixed Styling Approaches**
The codebase uses **THREE different styling methods simultaneously**:

#### 1. **Inline Styles** (React `style` prop)
```jsx
// Example from NurseAnalytics.jsx
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem'
}}>
```

#### 2. **External CSS Classes** (className)
```jsx
// Example from NurseAnalytics.jsx
<div className="analytics-container">
<div className="analytics-card">
<div className="card-content">
```

#### 3. **Tailwind CSS** (Utility classes)
```jsx
// Configured but not consistently used
// tailwind.css imported in main.jsx
```

### Problem 2: **Flat CSS File Structure**
All CSS files are in a **single flat directory** (`src/styles/`) with **31 separate files**:
- No modular organization
- No component-scoped styles
- No clear naming convention
- Difficult to find relevant styles

### Problem 3: **Inconsistent CSS Imports**

#### **Global Import (main.jsx)**
```javascript
// All these are loaded globally
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/register.css";
import "./styles/dashboard.css";
import "./styles/dashboard-priority2.css";
import "./styles/dashboard-new-features.css";
import "./styles/manager-dashboard.css";
import "./styles/nurse-dashboard.css";
import "./styles/nurse-dashboard-new.css";
import "./styles/nurse-analytics.css";
import "./styles/walkin.css";
```

#### **Component-Level Import (scattered)**
```javascript
// FederalDashboard.jsx imports 9 CSS files!
import "../styles/admin-layout.css";
import "../styles/admin-dashboard.css";
import "../styles/admin-filters.css";
import "../styles/admin-tables.css";
import "../styles/admin-health.css";
import "../styles/admin-feedback.css";
import "../styles/admin-audit.css";
import "../styles/admin-regions.css";
import "../styles/admin-analytics.css";
import "../styles/admin-modals.css";

// AdminDashboard.jsx imports 10 CSS files!
import "../../styles/admin-layout.css";
import "../../styles/admin-dashboard.css";
import "../../styles/admin-health-dashboard.css";
import "../../styles/admin-filters.css";
import "../../styles/admin-tables.css";
import "../../styles/admin-health.css";
import "../../styles/admin-feedback.css";
import "../../styles/admin-audit.css";
import "../../styles/admin-settings.css";
import "../../styles/admin-modals.css";
import "../../styles/admin-regions.css";
```

### Problem 4: **CSS File Naming Inconsistency**
```
dashboard.css              # Generic
dashboard-priority2.css    # What is priority2?
dashboard-tokens.css       # What tokens?
dashboard-new-features.css # New features for what?
nurse-dashboard.css        # Role-based
nurse-dashboard-new.css    # Why "new"?
admin-dashboard.css        # Role-based
manager-dashboard.css      # Role-based
regional-dashboard-responsive.css  # Mixed concerns
```

### Problem 5: **Tight Coupling**
- **CSS scattered across 31 files**
- **Components import multiple CSS files**
- **Inline styles mixed with class-based styles**
- **Hard to trace which styles apply to which component**

---

## 🎯 **Consequences of Current Structure**

1. **Difficult to Modify UI**
   - Need to search across multiple CSS files
   - Inline styles override external styles unpredictably
   - No single source of truth for component styling

2. **Poor Maintainability**
   - Duplicate styles across files
   - Unused CSS accumulates over time
   - Hard to delete old styles safely

3. **Performance Issues**
   - All CSS loaded globally
   - Large bundle size
   - No code splitting for styles

4. **Developer Experience**
   - Confusion about where to add new styles
   - Inconsistent patterns across codebase
   - Time-consuming to find and modify styles

5. **Scalability Problems**
   - Adding new components requires creating new CSS files
   - No clear pattern for component-specific styles
   - Style conflicts become more likely as codebase grows

---

## 📊 **Current CSS Import Pattern Analysis**

### Global Imports (main.jsx)
- **12 CSS files** loaded globally for all routes
- **Unnecessary overhead** for pages that don't use these styles

### Component-Level Imports
- **FederalDashboard**: 10 CSS files
- **AdminDashboard**: 11 CSS files
- **RegionalDashboard**: 5 CSS files
- **ManagerDashboard**: 4 CSS files

### Inline Styles Usage
- **Heavy use in**: NurseAnalytics.jsx, FederalDashboard.jsx, RegionalDashboard.jsx
- **Hundreds of lines** of inline style objects
- **Difficult to maintain** and override

---

## 🚀 **What Needs to Change**

To make the UI easier to modify, we need:

1. ✅ **Single styling approach** (choose one: CSS Modules, Styled Components, or Tailwind)
2. ✅ **Component-scoped styles** (styles co-located with components)
3. ✅ **Clear folder structure** (organized by feature/component)
4. ✅ **Consistent naming conventions**
5. ✅ **Eliminate inline styles** (move to classes or styled components)
6. ✅ **Remove unused CSS**
7. ✅ **Implement design tokens** (colors, spacing, typography)
8. ✅ **Code splitting** (load styles only when needed)

---

## 📌 **Summary**

The current frontend structure suffers from:
- **Unstructured CSS organization** (31 flat files)
- **Mixed styling approaches** (inline, external, Tailwind)
- **Inconsistent import patterns** (global vs component-level)
- **Poor naming conventions** (ambiguous file names)
- **Tight coupling** (components depend on multiple CSS files)

**Result:** Modifying the UI is time-consuming, error-prone, and frustrating.

---

**Next Step:** Create a restructuring plan to organize styles properly and make UI modifications straightforward.
