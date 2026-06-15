# Header & Sidebar Redesign Integration Guide

## Overview
This guide explains how to integrate the visual redesign from `feature/ui-redesign-2026` into your current `feature/ui` branch while keeping your existing file structure intact.

## What Was Extracted
✅ **File Added**: `frontend/src/styles/unified-layout.css` (21KB)
- Contains all the new header and sidebar visual styles
- Modern gradient backgrounds
- Improved spacing and typography
- Smooth animations and transitions
- Responsive design breakpoints

## Key Visual Changes in the Redesign

### 1. **Header Redesign**
- **Background**: Navy gradient `linear-gradient(90deg, #0d2444 0%, #2563b0 50%, #0d2444 100%)`
- **Height**: Fixed 84px (was variable)
- **Toggle Button**: Modern angular bracket design with hover effects
- **User Menu**: Improved dropdown with better spacing
- **Centered Title**: Dashboard title centered in header

### 2. **Sidebar Redesign**
- **Background**: Navy to blue gradient `linear-gradient(180deg, #0d2444 0%, #2563b0 100%)`
- **Logo Section**: Centered with rotating animation (20s continuous)
- **Navigation**: Better spacing, hover effects, active states
- **Collapsed State**: Smooth transition to 70px width
- **Footer**: Improved styling for capacity widgets and stats

### 3. **New CSS Classes**

#### Header Classes:
```css
.mesob-header                  /* Main header container */
.mesob-header-left            /* Left section with toggle */
.mesob-header-toggle          /* Sidebar toggle button */
.mesob-header-title           /* Centered dashboard title */
.mesob-header-right           /* Right section with user menu */
.mesob-header-notification    /* Notification bell */
.mesob-header-user            /* User profile button */
.mesob-header-user-dropdown   /* User dropdown menu */
```

#### Sidebar Classes:
```css
.admin-sidebar, .mesob-sidebar        /* Main sidebar container */
.sidebar-logo-section                 /* Logo area */
.sidebar-logo-emblem                  /* Logo image with rotation */
.sidebar-nav                          /* Navigation section */
.nav-item                             /* Navigation item */
.nav-item.active                      /* Active navigation */
.sidebar-footer                       /* Footer section */
```

## Integration Steps

### Step 1: Import the CSS File
Add this import to your layout files that need the new styles:

```javascript
// In AdminLayout.jsx, ManagerDashboard.jsx, etc.
import "../styles/unified-layout.css";
```

### Step 2: Update Your Components to Use New Classes

#### Option A: Keep Your Current Structure (Recommended)
Keep your existing `AdminSidebar.jsx`, `ManagerSidebar.jsx`, etc., but update them to use the new CSS classes:

**Before:**
```jsx
<aside className="admin-sidebar">
  <div className="logo-section">...</div>
</aside>
```

**After:**
```jsx
<aside className="admin-sidebar">  {/* Same class name - styles will apply */}
  <div className="sidebar-logo-section">...</div>  {/* New class */}
</aside>
```

#### Option B: Gradual Migration
Apply the new styles selectively by adding the CSS classes to specific elements:

1. Header toggle button:
```jsx
<button className="mesob-header-toggle" onClick={toggleSidebar}>
  <svg>...</svg>
</button>
```

2. Navigation items:
```jsx
<button 
  className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
  onClick={() => onTabChange('dashboard')}
>
  <span>📊</span>
  <span className="nav-label">Dashboard</span>
</button>
```

### Step 3: CSS Variables Available

The redesign uses these CSS variables (define in your tokens.css or root):

```css
:root {
  --mesob-navy-dark: #0d2444;
  --mesob-navy: #2563b0;
  --mesob-blue: #2563b0;
  --mesob-sky: #e0f2fe;
  --mesob-gold: #f59e0b;
  --header-height: 84px;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 70px;
  
  /* Spacing (if not already defined) */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  
  /* Font weights */
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  
  /* Z-index */
  --z-sticky: 100;
  --z-dropdown: 1000;
}
```

## Components That Can Benefit

### Priority 1 - High Impact:
1. ✅ **AdminLayout.jsx** - Main layout wrapper
2. ✅ **AdminHeader.jsx** - Header component
3. ✅ **AdminSidebar.jsx** - Sidebar navigation
4. ✅ **ManagerSidebar.jsx** - Manager navigation
5. ✅ **RegionalSidebar.jsx** - Regional navigation
6. ✅ **FederalSidebar.jsx** - Federal navigation

### Priority 2 - Medium Impact:
7. **StaffDashboard** - Staff interface
8. **NurseDashboard** - Nurse interface
9. **User menus** - Dropdown components

## Key Features to Implement

### 1. Rotating Logo Animation
Add to your logo image:
```css
.sidebar-logo-emblem {
  animation: rotateLogo 20s linear infinite;
}

@keyframes rotateLogo {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 2. Modern Toggle Button
```jsx
<button className="mesob-header-toggle" onClick={toggleSidebar}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
</button>
```

### 3. Active Navigation States
```jsx
<button 
  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
  onClick={() => onTabChange(tab.id)}
>
  {tab.icon}
  <span className="nav-label">{tab.label}</span>
</button>
```

### 4. Sidebar Collapse Animation
```jsx
const [sidebarOpen, setSidebarOpen] = useState(true);

<aside className={`admin-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
  ...
</aside>
```

## Testing Checklist

After integration, test these scenarios:

- [ ] Header displays correctly on all dashboards
- [ ] Sidebar toggle button works smoothly
- [ ] Logo rotates continuously
- [ ] Navigation items highlight when active
- [ ] Sidebar collapses to 70px width
- [ ] User dropdown menu appears correctly
- [ ] Responsive design works on mobile
- [ ] All colors match the redesign
- [ ] Animations are smooth (no jank)
- [ ] Hover effects work on all interactive elements

## Responsive Breakpoints

The redesign includes these responsive behaviors:

### Mobile (< 768px):
- Sidebar becomes fixed overlay
- Header height reduces to 64px
- Logo section adjusts

### Tablet (768px - 1024px):
- Dashboard title repositions
- Some spacing adjustments

## Color Palette Reference

### Primary Colors:
- **Navy Dark**: `#0d2444`
- **Navy**: `#2563b0`
- **Blue**: `#2563b0`
- **Sky**: `#e0f2fe`
- **Gold**: `#f59e0b`

### Sidebar Colors:
- **Background**: Gradient from Navy Dark to Blue
- **Text**: `rgba(214, 232, 251, 0.7)` (inactive)
- **Text Active**: `white`
- **Hover**: `rgba(214, 232, 251, 0.1)`
- **Active BG**: `rgba(214, 232, 251, 0.15)`
- **Border Active**: `var(--mesob-sky)`

## Common Issues & Solutions

### Issue 1: Styles Not Applying
**Solution**: Make sure `unified-layout.css` is imported AFTER your base styles:
```javascript
import "../styles/admin-layout.css";
import "../styles/unified-layout.css";  // Import last
```

### Issue 2: CSS Variables Not Defined
**Solution**: Add the CSS variables to your root stylesheet or create a `tokens.css`:
```css
/* In tokens.css or main.css */
:root {
  --mesob-navy-dark: #0d2444;
  --mesob-navy: #2563b0;
  /* ... other variables */
}
```

### Issue 3: Logo Not Rotating
**Solution**: Ensure the logo image has the correct class:
```jsx
<div className="sidebar-logo-emblem">
  <img src={logo} alt="MESOB Logo" />
</div>
```

### Issue 4: Sidebar Not Collapsing
**Solution**: Add the collapsed class conditionally:
```jsx
<aside className={`admin-sidebar ${!isOpen ? 'collapsed' : ''}`}>
```

## Next Steps

1. ✅ **Review the CSS file** - Look through `unified-layout.css` to understand all available styles
2. **Plan the migration** - Decide which components to update first
3. **Test incrementally** - Apply styles to one component at a time
4. **Keep your structure** - Don't reorganize files, just apply the visual styles
5. **Build and test** - Run `npm run build` after each change

## Important Notes

⚠️ **Your file structure is preserved** - The CSS file works with your existing components
⚠️ **No file reorganization needed** - Keep your current folder structure
⚠️ **Gradual adoption** - You can apply styles component by component
⚠️ **Fallback compatibility** - The CSS includes backward compatibility classes

## Support

If you encounter issues:
1. Check the CSS class names match exactly
2. Verify CSS variables are defined
3. Ensure import order is correct
4. Test in both collapsed and expanded sidebar states
5. Check browser console for CSS errors

---

**Summary**: The `unified-layout.css` file contains all the visual redesign styles. You can integrate them gradually into your existing components without changing your file structure. Start with the header and sidebar components for immediate visual impact.
