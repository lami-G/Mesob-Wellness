# Frontend Restructuring Plan - CSS Modules Approach

## 🎯 Goal
Transform the current unstructured CSS into a maintainable, modular system using **CSS Modules** where styles are component-scoped and easy to modify.

---

## 📋 Why CSS Modules?

### ✅ Benefits for Your Project:
1. **Component-scoped styles** - No global conflicts
2. **Clear file association** - `Button.jsx` → `Button.module.css`
3. **Type-safe** - Import styles as objects
4. **No runtime overhead** - Compiled at build time
5. **Easy migration** - Can coexist with existing CSS during transition
6. **Works with Vite** - Already configured, no setup needed

### Example:
```jsx
// Before (current mess)
import '../../styles/admin-dashboard.css';
import '../../styles/admin-filters.css';
import '../../styles/admin-tables.css';
<div className="card" style={{ padding: '2rem', marginTop: '1rem' }}>

// After (CSS Modules)
import styles from './AdminDashboard.module.css';
<div className={styles.card}>
```

---

## 🏗️ New Folder Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AddCenterModal/
│   │   │   ├── AddCenterModal.jsx
│   │   │   └── AddCenterModal.module.css
│   │   ├── AdminHeader/
│   │   │   ├── AdminHeader.jsx
│   │   │   └── AdminHeader.module.css
│   │   ├── DashboardMetrics/
│   │   │   ├── DashboardMetrics.jsx
│   │   │   └── DashboardMetrics.module.css
│   │   └── FederalSidebar/
│   │       ├── FederalSidebar.jsx
│   │       └── FederalSidebar.module.css
│   │
│   ├── nurse/
│   │   ├── NurseAnalytics/
│   │   │   ├── NurseAnalytics.jsx
│   │   │   └── NurseAnalytics.module.css
│   │   ├── QueueDisplayScreen/
│   │   │   ├── QueueDisplayScreen.jsx
│   │   │   └── QueueDisplayScreen.module.css
│   │   └── VitalsEntry/
│   │       ├── VitalsEntry.jsx
│   │       └── VitalsEntry.module.css
│   │
│   ├── shared/                    # NEW - Shared components
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.module.css
│   │   ├── Card/
│   │   │   ├── Card.jsx
│   │   │   └── Card.module.css
│   │   ├── Modal/
│   │   │   ├── Modal.jsx
│   │   │   └── Modal.module.css
│   │   └── Table/
│   │       ├── Table.jsx
│   │       └── Table.module.css
│   │
│   └── layout/                    # NEW - Layout components
│       ├── MainLayout/
│       │   ├── MainLayout.jsx
│       │   └── MainLayout.module.css
│       └── AdminLayout/
│           ├── AdminLayout.jsx
│           └── AdminLayout.module.css
│
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminDashboard.module.css
│   │   └── AdminUsers/
│   │       ├── AdminUsers.jsx
│   │       └── AdminUsers.module.css
│   │
│   ├── Login/
│   │   ├── Login.jsx
│   │   └── Login.module.css
│   │
│   └── Register/
│       ├── Register.jsx
│       └── Register.module.css
│
├── styles/                        # GLOBAL ONLY
│   ├── tokens/                    # NEW - Design tokens
│   │   ├── colors.css
│   │   ├── spacing.css
│   │   ├── typography.css
│   │   └── shadows.css
│   │
│   ├── base/                      # NEW - Base styles
│   │   ├── reset.css
│   │   ├── global.css
│   │   └── utilities.css
│   │
│   └── themes/                    # NEW - Theme support
│       ├── default.css
│       └── dark.css
│
└── main.jsx                       # Clean imports
```

---

## 🎨 Design Tokens System

### Create Reusable CSS Variables

**`src/styles/tokens/colors.css`**
```css
:root {
  /* Primary Colors */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-primary-light: #DBEAFE;
  
  /* Status Colors */
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
  
  /* Neutral Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-border: #E5E7EB;
  
  /* Role-based Colors */
  --color-admin: #8B5CF6;
  --color-nurse: #10B981;
  --color-manager: #F59E0B;
  --color-regional: #3B82F6;
}
```

**`src/styles/tokens/spacing.css`**
```css
:root {
  /* Spacing Scale */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 3rem;      /* 48px */
  --space-3xl: 4rem;      /* 64px */
  
  /* Component Spacing */
  --card-padding: var(--space-lg);
  --section-gap: var(--space-xl);
  --grid-gap: var(--space-md);
}
```

**`src/styles/tokens/typography.css`**
```css
:root {
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

**`src/styles/tokens/shadows.css`**
```css
:root {
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## 🔄 Migration Strategy (Step-by-Step)

### Phase 1: Setup (Day 1)
1. ✅ Create design tokens
2. ✅ Create new folder structure
3. ✅ Update `main.jsx` to import only tokens and global styles
4. ✅ Test that Vite recognizes `.module.css` files

### Phase 2: Create Shared Components (Day 2-3)
Convert common patterns into reusable components:
- Button
- Card
- Modal
- Table
- Input
- Badge
- Alert

### Phase 3: Migrate Pages (Day 4-10)
**Priority Order:**
1. **Login/Register** (simplest, good starting point)
2. **Dashboard pages** (most used)
3. **Admin pages** (complex but well-defined)
4. **Nurse pages** (analytics heavy)

### Phase 4: Cleanup (Day 11-12)
1. Delete old CSS files
2. Remove inline styles
3. Optimize imports
4. Test all pages

---

## 📝 Migration Example: Login Page

### BEFORE (Current - Login.jsx)
```jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import AnimatedWaveBackground from "../components/AnimatedWaveBackground";
import "../styles/login.css";  // ❌ Global CSS

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <div className="login-container">  {/* ❌ Global class */}
      <AnimatedWaveBackground />
      <div className="login-card" style={{ padding: '2rem' }}>  {/* ❌ Inline style */}
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            className="form-input"  {/* ❌ Global class */}
            style={{ marginBottom: '1rem' }}  {/* ❌ Inline style */}
          />
          <button className="btn btn-primary">Login</button>  {/* ❌ Global class */}
        </form>
      </div>
    </div>
  );
}
```

### AFTER (CSS Modules - Login.jsx)
```jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import AnimatedWaveBackground from "../../components/AnimatedWaveBackground";
import Button from "../../components/shared/Button/Button";
import Input from "../../components/shared/Input/Input";
import styles from "./Login.module.css";  // ✅ Component-scoped

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <div className={styles.container}>  {/* ✅ Scoped class */}
      <AnimatedWaveBackground />
      <div className={styles.card}>  {/* ✅ No inline styles */}
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="primary" type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
}
```

### AFTER (Login.module.css)
```css
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.card {
  background: var(--color-bg-primary);
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  z-index: 10;
}

.title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xl);
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
```

---

## 🧩 Shared Component Examples

### Button Component
**`components/shared/Button/Button.jsx`**
```jsx
import React from 'react';
import styles from './Button.module.css';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  type = 'button',
  onClick,
  fullWidth = false,
  ...props 
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled
  ].filter(Boolean).join(' ');
  
  return (
    <button 
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
```

**`components/shared/Button/Button.module.css`**
```css
.button {
  font-family: var(--font-primary);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

/* Variants */
.primary {
  background: var(--color-primary);
  color: white;
}

.primary:hover:not(.disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.secondary:hover:not(.disabled) {
  background: var(--color-bg-primary);
  border-color: var(--color-primary);
}

.success {
  background: var(--color-success);
  color: white;
}

.error {
  background: var(--color-error);
  color: white;
}

/* Sizes */
.sm {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
}

.md {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-base);
}

.lg {
  padding: var(--space-lg) var(--space-xl);
  font-size: var(--text-lg);
}

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fullWidth {
  width: 100%;
}
```

### Card Component
**`components/shared/Card/Card.jsx`**
```jsx
import React from 'react';
import styles from './Card.module.css';

function Card({ 
  children, 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  className = '',
  ...props 
}) {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    styles[`shadow-${shadow}`],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

export default Card;
```

**`components/shared/Card/Card.module.css`**
```css
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

/* Variants */
.default {
  border-color: var(--color-border);
}

.elevated {
  border: none;
}

.outlined {
  background: transparent;
  border: 2px solid var(--color-border);
}

/* Padding */
.padding-sm {
  padding: var(--space-md);
}

.padding-md {
  padding: var(--space-lg);
}

.padding-lg {
  padding: var(--space-xl);
}

/* Shadow */
.shadow-sm {
  box-shadow: var(--shadow-sm);
}

.shadow-md {
  box-shadow: var(--shadow-md);
}

.shadow-lg {
  box-shadow: var(--shadow-lg);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

---

## 🔧 Updated main.jsx

### BEFORE
```jsx
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

### AFTER
```jsx
// Design Tokens (CSS Variables)
import "./styles/tokens/colors.css";
import "./styles/tokens/spacing.css";
import "./styles/tokens/typography.css";
import "./styles/tokens/shadows.css";

// Global Base Styles
import "./styles/base/reset.css";
import "./styles/base/global.css";
import "./styles/base/utilities.css";

// Theme (optional)
import "./styles/themes/default.css";
```

---

## 📊 Conversion Checklist

### Shared Components to Create
- [ ] Button (primary, secondary, success, error variants)
- [ ] Card (default, elevated, outlined)
- [ ] Input (text, email, password, number, date)
- [ ] Select (dropdown)
- [ ] Modal (dialog, drawer)
- [ ] Table (with sorting, pagination)
- [ ] Badge (status indicators)
- [ ] Alert (info, success, warning, error)
- [ ] Spinner (loading indicator)
- [ ] Tooltip
- [ ] Avatar
- [ ] Tabs

### Pages to Migrate
- [ ] Login
- [ ] Register
- [ ] Dashboard
- [ ] NurseDashboard
- [ ] ManagerDashboard
- [ ] RegionalDashboard
- [ ] FederalDashboard
- [ ] AdminDashboard
- [ ] AdminUsers
- [ ] HealthData
- [ ] Analytics
- [ ] AuditLogs
- [ ] FeedbackQuality
- [ ] RegionManagement
- [ ] SystemSettings

### Components to Migrate
- [ ] NurseAnalytics
- [ ] QueueDisplayScreen
- [ ] VitalsEntry
- [ ] WellnessPlanCreation
- [ ] DashboardMetrics
- [ ] FederalSidebar
- [ ] AdminHeader
- [ ] NotificationPanel
- [ ] RegionEditModal
- [ ] AddCenterModal

---

## 🎯 Benefits After Migration

### Before (Current State)
```
❌ 31 separate CSS files
❌ 12 global CSS imports
❌ 100+ inline style objects
❌ Components import 9-11 CSS files each
❌ No clear file association
❌ Style conflicts and overrides
❌ Hard to find and modify styles
```

### After (CSS Modules)
```
✅ 1 CSS file per component
✅ 4 token files (colors, spacing, typography, shadows)
✅ 3 global files (reset, global, utilities)
✅ Zero inline styles
✅ Clear file association (Component.jsx + Component.module.css)
✅ No style conflicts (scoped classes)
✅ Easy to find and modify (co-located)
```

---

## 🚀 Quick Start Commands

### 1. Test CSS Modules Work
```bash
# Create test component
mkdir -p src/components/test
```

**Create `src/components/test/TestCard.jsx`:**
```jsx
import React from 'react';
import styles from './TestCard.module.css';

export default function TestCard() {
  return <div className={styles.card}>CSS Modules Working!</div>;
}
```

**Create `src/components/test/TestCard.module.css`:**
```css
.card {
  padding: 2rem;
  background: lightblue;
  border-radius: 8px;
}
```

### 2. Verify Vite Configuration
Vite automatically supports CSS Modules (`.module.css` extension).
No configuration needed!

### 3. Start Development
```bash
cd frontend
npm run dev
```

---

## 📖 CSS Modules Syntax Reference

### Basic Usage
```jsx
import styles from './Component.module.css';

<div className={styles.container}>
<button className={styles.button}>Click</button>
```

### Multiple Classes
```jsx
<div className={`${styles.card} ${styles.active}`}>

// or better:
<div className={[styles.card, styles.active].join(' ')}>

// or with clsx library:
import clsx from 'clsx';
<div className={clsx(styles.card, { [styles.active]: isActive })}>
```

### Global Classes (when needed)
```css
/* In .module.css file */
:global(.global-class-name) {
  /* This won't be scoped */
}
```

### Composition
```css
/* Extend other classes */
.button {
  padding: 1rem;
  border-radius: 4px;
}

.primaryButton {
  composes: button;
  background: blue;
  color: white;
}
```

---

## 🎨 Naming Conventions

### Component Files
```
PascalCase/
  ├── ComponentName.jsx
  └── ComponentName.module.css
```

### CSS Classes
```css
/* Use camelCase for class names */
.container { }
.cardHeader { }
.buttonPrimary { }
.isActive { }
.hasError { }
```

### Design Tokens
```css
/* Use kebab-case with prefixes */
--color-primary
--space-lg
--font-semibold
--shadow-md
--transition-base
```

---

## 🛠️ Tools & Best Practices

### 1. Use CSS Variables (Design Tokens)
```css
/* ❌ Bad */
.button {
  background: #3B82F6;
  padding: 16px 24px;
}

/* ✅ Good */
.button {
  background: var(--color-primary);
  padding: var(--space-md) var(--space-lg);
}
```

### 2. Avoid Nesting (Keep it Flat)
```css
/* ❌ Bad */
.card {
  .header {
    .title { }
  }
}

/* ✅ Good */
.card { }
.cardHeader { }
.cardTitle { }
```

### 3. Use Meaningful Names
```css
/* ❌ Bad */
.box1 { }
.item2 { }
.style3 { }

/* ✅ Good */
.dashboardCard { }
.metricValue { }
.primaryButton { }
```

### 4. Component Structure
```
ComponentName/
  ├── ComponentName.jsx          # Component logic
  ├── ComponentName.module.css   # Component styles
  ├── index.js                   # Export (optional)
  └── ComponentName.test.jsx     # Tests (optional)
```

---

## 📅 Implementation Timeline

### Week 1: Foundation
- **Day 1-2**: Create design tokens, base styles
- **Day 3-4**: Create shared components (Button, Card, Input, Modal)
- **Day 5**: Test shared components, fix issues

### Week 2: Pages Migration
- **Day 6-7**: Migrate Login, Register, Dashboard
- **Day 8-9**: Migrate Nurse pages
- **Day 10**: Migrate Manager pages

### Week 3: Admin & Cleanup
- **Day 11-12**: Migrate Admin pages
- **Day 13-14**: Migrate Regional/Federal pages
- **Day 15**: Final cleanup, delete old CSS files

### Week 4: Testing & Polish
- **Day 16-17**: Cross-browser testing
- **Day 18-19**: Responsive testing
- **Day 20**: Documentation, final review

---

## ✅ Success Criteria

After migration, you should be able to:

1. ✅ **Find styles easily** - Next to the component
2. ✅ **Modify UI quickly** - Change one file, see results
3. ✅ **No style conflicts** - Scoped classes
4. ✅ **Consistent design** - Design tokens everywhere
5. ✅ **Reusable components** - Button, Card, Input, etc.
6. ✅ **Small bundle size** - Only used styles included
7. ✅ **Fast development** - Clear patterns to follow

---

## 🎓 Learning Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Vite CSS Modules Guide](https://vitejs.dev/guide/features.html#css-modules)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Next Step:** Start with Phase 1 - Create design tokens and test CSS Modules setup!
