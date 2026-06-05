# Frontend Structure and Styling Documentation

## 📁 Project Overview

This is a **React-based healthcare application** (MESOB Wellness) built with modern frontend technologies. The application provides role-based dashboards for different user types including patients, nurses, managers, regional officers, federal officers, and system administrators.

---

## 🏗️ Technology Stack

- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.5
- **Routing:** React Router DOM 6.20.1
- **Styling:** Tailwind CSS 3.4.17 + Custom CSS
- **HTTP Client:** Axios 1.6.2
- **Charts:** Chart.js 4.5.1, React-Chartjs-2 5.3.1, Recharts 3.8.1
- **Icons:** Lucide React 0.469.0
- **Language:** JavaScript (JSX)

---

## 📂 Folder Structure

```
frontend/
├── public/
│   ├── assets/
│   │   ├── image.png
│   │   └── Mesob-short-png.png
│   └── Mesob-short-png.png
│
├── src/
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── AddCenterModal.jsx
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── AppointmentsList.jsx
│   │   │   ├── CenterFormModal.jsx
│   │   │   ├── CentersList.jsx
│   │   │   ├── ChangePasswordModal.jsx
│   │   │   ├── CreateUserModal.jsx
│   │   │   ├── DashboardAlerts.jsx
│   │   │   ├── DashboardCharts.jsx
│   │   │   ├── DashboardMetrics.jsx
│   │   │   ├── EditAppointmentModal.jsx
│   │   │   ├── EditCenterModal.jsx
│   │   │   ├── EditUserModal.jsx
│   │   │   ├── FederalSidebar.jsx
│   │   │   ├── FeedbackAnalytics.jsx
│   │   │   ├── FeedbackList.jsx
│   │   │   ├── FeedbackModal.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── ManagerSidebar.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── RegionalSidebar.jsx
│   │   │   ├── RegionEditModal.jsx
│   │   │   ├── RegionManagerModal.jsx
│   │   │   ├── SystemHealthChart.jsx
│   │   │   ├── UsersList.jsx
│   │   │   ├── VitalModal.jsx
│   │   │   ├── VitalRecordsList.jsx
│   │   │   └── WellnessPlansList.jsx
│   │   │
│   │   ├── analytics/                # Analytics components
│   │   │   └── HealthConditionTrendsPanel.jsx
│   │   │
│   │   ├── dashboard/                # Patient dashboard components
│   │   │   ├── AppointmentReminders.jsx
│   │   │   ├── BookingCalendar.jsx
│   │   │   ├── FeedbackForm.jsx
│   │   │   ├── HealthAlerts.jsx
│   │   │   ├── HealthJourney.jsx
│   │   │   ├── LongitudinalRecords.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── ProfileSection.jsx
│   │   │   ├── RiskScoring.jsx
│   │   │   └── WellnessPlan.jsx
│   │   │
│   │   ├── forms/                    # Reusable form components
│   │   │   ├── Button.jsx
│   │   │   └── Input.jsx
│   │   │
│   │   ├── nurse/                    # Nurse-specific components
│   │   │   ├── BulkOperations.jsx
│   │   │   ├── CallNextControl.jsx
│   │   │   ├── CapacityTracker.jsx
│   │   │   ├── CustomerHistoryPanel.jsx
│   │   │   ├── CustomerHistoryView.jsx
│   │   │   ├── CustomerSearch.jsx
│   │   │   ├── LiveQueuePanel.jsx
│   │   │   ├── NurseAnalytics.jsx
│   │   │   ├── QueueDisplayScreen.jsx
│   │   │   ├── QuickHistoryModal.jsx
│   │   │   ├── RegisterWalkIn.jsx
│   │   │   ├── VitalsEntry.jsx
│   │   │   ├── WellnessPlanCreation.jsx
│   │   │   └── WellnessPlanTemplates.jsx
│   │   │
│   │   ├── AnimatedWaveBackground.jsx   # Background animation
│   │   ├── MainLayout.jsx                # Main app layout wrapper
│   │   ├── MaintenanceMode.jsx           # Maintenance page
│   │   ├── ProtectedRoute.jsx            # Auth route guard
│   │   └── RoleBasedRoute.jsx            # Role-based route guard
│   │
│   ├── context/
│   │   └── AuthContext.jsx            # Authentication context provider
│   │
│   ├── layouts/
│   │   └── AdminLayout.jsx            # Admin-specific layout
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── Dashboard.jsx              # Patient dashboard
│   │   ├── FederalDashboard.jsx       # Federal office dashboard
│   │   ├── FederalDashboardProfile.jsx
│   │   ├── Login.jsx                  # Login page
│   │   ├── ManagerDashboard.jsx       # Manager dashboard
│   │   ├── ManagerDashboardProfile.jsx
│   │   ├── NurseDashboard.jsx         # Nurse dashboard
│   │   ├── RegionalDashboard.jsx      # Regional office dashboard
│   │   ├── RegionalDashboardProfile.jsx
│   │   └── Register.jsx               # Registration page
│   │
│   ├── routes/
│   │   └── AppRouter.jsx              # Main routing configuration
│   │
│   ├── services/
│   │   ├── adminService.js            # Admin API calls
│   │   ├── analyticsService.js        # Analytics API calls
│   │   ├── api.js                     # Axios instance & interceptors
│   │   ├── authService.js             # Authentication API calls
│   │   ├── conditionsService.js       # Health conditions API
│   │   ├── healthService.js           # Health data API
│   │   ├── notificationService.js     # Notifications API
│   │   ├── regionalService.js         # Regional data API
│   │   ├── registrationService.js     # Registration API
│   │   └── settingsService.js         # Settings API
│   │
│   ├── styles/
│   │   ├── admin-alerts.css
│   │   ├── admin-analytics.css
│   │   ├── admin-audit.css
│   │   ├── admin-dashboard.css
│   │   ├── admin-feedback.css
│   │   ├── admin-filters.css
│   │   ├── admin-health-dashboard.css
│   │   ├── admin-health.css
│   │   ├── admin-layout.css
│   │   ├── admin-modals.css
│   │   ├── admin-regions.css
│   │   ├── admin-settings.css
│   │   ├── admin-tables.css
│   │   ├── call-next-control-mesob.css
│   │   ├── capacity-tracker-mesob.css
│   │   ├── customer-history-mesob.css
│   │   ├── dashboard-new-features.css
│   │   ├── dashboard-priority2.css
│   │   ├── dashboard-tokens.css
│   │   ├── dashboard.css
│   │   ├── global.css                 # Global styles & common components
│   │   ├── layout.css                 # Layout structure styles
│   │   ├── live-queue-mesob.css
│   │   ├── login.css
│   │   ├── maintenance.css
│   │   ├── manager-dashboard.css
│   │   ├── notification-panel.css
│   │   ├── nurse-analytics-mesob.css
│   │   ├── nurse-analytics.css
│   │   ├── nurse-dashboard-mesob.css
│   │   ├── nurse-dashboard-new.css
│   │   ├── nurse-dashboard.css
│   │   ├── regional-dashboard-responsive.css
│   │   ├── register.css
│   │   ├── tailwind.css               # Tailwind imports
│   │   ├── tooltip-fix.css
│   │   ├── vitals-entry-mesob.css
│   │   ├── walkin-mesob.css
│   │   ├── walkin.css
│   │   └── wellness-plan-mesob.css
│   │
│   ├── utils/
│   │   └── wellnessAI.js              # AI utilities for wellness plans
│   │
│   ├── App.jsx                        # Root component
│   └── main.jsx                       # Entry point
│
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── index.html                         # HTML entry point
├── package.json                       # Dependencies
├── postcss.config.js                  # PostCSS configuration
├── tailwind.config.js                 # Tailwind configuration
└── vite.config.js                     # Vite build configuration
```

---

## 🎨 Styling Architecture

### Hybrid Approach: Tailwind CSS + Custom CSS

The project uses a **hybrid styling approach**:

1. **Tailwind CSS** for utility classes and rapid prototyping
2. **Custom CSS** for complex, component-specific styles

### Style Loading Order

Styles are imported in `main.jsx` in the following order:

```javascript
import "./styles/tailwind.css";        // Tailwind base, components, utilities
import "./styles/global.css";          // Global styles & common components
import "./styles/layout.css";          // Layout structure
import "./styles/register.css";        // Registration page
import "./styles/dashboard.css";       // Dashboard styles
import "./styles/dashboard-priority2.css";
import "./styles/dashboard-new-features.css";
import "./styles/manager-dashboard.css";
import "./styles/nurse-dashboard.css";
import "./styles/nurse-dashboard-new.css";
import "./styles/nurse-analytics.css";
import "./styles/walkin.css";
```

### Design System

#### Color Palette (CSS Variables)
```css
:root {
  --mesob-navy: #1a3f6f;      /* Primary dark blue */
  --mesob-blue: #2563b0;      /* Primary blue */
  --mesob-sky: #D6E8FB;       /* Light blue background */
  --mesob-light: #f4f8fe;     /* Ultra light blue */
  --mesob-gold: #e8a020;      /* Accent gold */
}
```

#### Typography
- **Font Family:** 'Plus Jakarta Sans' (Google Fonts)
- **Fallback:** 'Segoe UI', system-ui, -apple-system, sans-serif
- **Line Height:** 1.5
- **Base Color:** #0d2444

#### Background Colors
- **Login/Register Pages:** Gradient with starry animation
  ```css
  background: linear-gradient(135deg, #1e3a8a 0%, #1a3a6e 50%, #312e81 100%);
  ```
- **Dashboard Pages:** Light blue (#D6E8FB)

---

## 🧩 Component Architecture

### Component Organization

Components are organized by **feature/role**:

1. **`admin/`** - Admin panel components (users, centers, appointments management)
2. **`analytics/`** - Data visualization and analytics
3. **`dashboard/`** - Patient-facing dashboard components
4. **`forms/`** - Reusable form elements (Button, Input)
5. **`nurse/`** - Nurse workflow components (queue, vitals, walk-ins)

### Reusable Components

#### Button Component (`forms/Button.jsx`)
```jsx
<Button 
  variant="primary"      // primary | secondary
  disabled={false}
  loading={false}
  fullWidth={false}
  onClick={handleClick}
>
  Click Me
</Button>
```

**Variants:**
- `btn-primary` - Blue button with shadow
- `btn-secondary` - Gray button with border

#### Input Component (`forms/Input.jsx`)
```jsx
<Input 
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  error={errorMessage}
  required={true}
  placeholder="Enter email"
/>
```

**Features:**
- Label with required indicator
- Error state with message
- Accessible (aria-invalid, aria-describedby)
- Disabled state

### Layout Components

#### MainLayout (`MainLayout.jsx`)
The primary application layout wrapper containing:
- **Header**: MESOB logo, language selector, user menu
- **Sidebar**: Navigation links (role-based)
- **Main Content Area**: Page content

**Features:**
- Sticky header with gradient background
- Collapsible user menu with profile picture support
- Role-based navigation (shows/hides links based on user role)
- Sub-navigation for dashboard sections

#### User Menu
Dropdown menu in header with:
- Profile picture or avatar icon
- Profile link
- Logout button

### Route Guards

#### ProtectedRoute
Ensures user is authenticated before accessing route.

```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

#### RoleBasedRoute
Checks user role before granting access.

```jsx
<RoleBasedRoute allowedRoles={["NURSE_OFFICER"]}>
  <NurseDashboard />
</RoleBasedRoute>
```

---

## 🔄 Routing Structure

### Route Configuration (`AppRouter.jsx`)

```
/                           → Redirect to /login
/login                      → Login page
/register                   → Registration page
/dashboard                  → Patient dashboard (STAFF role)
/nurse                      → Nurse dashboard (NURSE_OFFICER role)
/manager                    → Manager dashboard (MANAGER role)
/manager-profile            → Manager profile
/regional                   → Regional dashboard (REGIONAL_OFFICE role)
/regional-profile           → Regional profile
/federal                    → Federal dashboard (FEDERAL_OFFICE role)
/federal-profile            → Federal profile
/admin                      → Admin dashboard (SYSTEM_ADMIN role)
```

### Tab-Based Navigation

Some dashboards use query parameters for tab navigation:

**Patient Dashboard:**
- `/dashboard?tab=appointments`
- `/dashboard?tab=health`
- `/dashboard?tab=wellness`
- `/dashboard?tab=records`
- `/dashboard?tab=feedback`

**Nurse Dashboard:**
- `/nurse?tab=queue`
- `/nurse?tab=vitals`
- `/nurse?tab=walkin`
- `/nurse?tab=wellness`
- `/nurse?tab=history`

---

## 🔐 Authentication Flow

### AuthContext (`context/AuthContext.jsx`)

Provides authentication state and methods:
- `user` - Current user object
- `isAuthenticated` - Boolean auth status
- `loading` - Loading state
- `login(credentials)` - Login function
- `logout()` - Logout function

### API Service (`services/api.js`)

Axios instance with:
- Base URL configuration
- Request interceptors (add auth token)
- Response interceptors (handle 401 errors)

---

## 📡 Service Layer

All API calls are organized in dedicated service files:

### Service Files

| Service | Purpose |
|---------|---------|
| `api.js` | Axios instance with interceptors |
| `authService.js` | Login, register, logout, token refresh |
| `adminService.js` | User management, centers, appointments |
| `analyticsService.js` | Dashboard metrics, charts, reports |
| `conditionsService.js` | Health conditions data |
| `healthService.js` | Vitals, health records |
| `notificationService.js` | Notifications and alerts |
| `regionalService.js` | Regional data management |
| `registrationService.js` | User registration |
| `settingsService.js` | System settings (maintenance mode, etc.) |

### Example Service Usage

```javascript
// In a component
import { getAppointments } from '../services/adminService';

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };
  fetchData();
}, []);
```

---

## 🎭 Role-Based Features

### User Roles

1. **STAFF** - Patients (view appointments, health records)
2. **NURSE_OFFICER** - Nurses (manage queue, vitals, walk-ins)
3. **MANAGER** - Center managers (view center metrics)
4. **REGIONAL_OFFICE** - Regional admins (view regional data)
5. **FEDERAL_OFFICE** - Federal admins (view national data)
6. **SYSTEM_ADMIN** - System administrators (full access)

### Role-Based Navigation

The sidebar navigation adapts based on user role:

```javascript
// In MainLayout.jsx
const hasManagerAccess = () => {
  return user && 
    ["MANAGER", "REGIONAL_OFFICE", "SYSTEM_ADMIN"].includes(user.role);
};

{hasManagerAccess() && (
  <Link to="/manager">Manager Dashboard</Link>
)}
```

---

## 🎨 Styling Guidelines

### Global Components

#### Cards
```css
.card {
  background: #ffffff;
  border: 1px solid #e2e8f3;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(26,58,110,0.06);
}
```

#### Badges
```css
.badge-blue    /* Info/Primary */
.badge-green   /* Success */
.badge-purple  /* Special */
.badge-orange  /* Warning */
.badge-red     /* Error/Danger */
.badge-gray    /* Neutral */
```

#### Alerts
```css
.alert-error   /* Red - Errors */
.alert-success /* Green - Success messages */
.alert-info    /* Blue - Information */
```

#### Spinners
```css
.spinner        /* Small inline spinner */
.spinner-large  /* Large centered spinner */
```

### Form Styling

Forms use the `.form-group` pattern:

```jsx
<div className="form-group">
  <label className="form-label">
    Email
    <span className="required-mark">*</span>
  </label>
  <input className="form-input" />
  <span className="form-error">Error message</span>
</div>
```

### Responsive Design

Layout adapts for mobile:

```css
@media (max-width: 900px) {
  .layout-body {
    grid-template-columns: 1fr; /* Sidebar becomes full-width */
  }
}
```

---

## 🛠️ Build Configuration

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true  // Fail if port 3000 is taken
  }
})
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {}  // Using default theme
  },
  plugins: []
}
```

### PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

## 📦 Key Dependencies

### Core Libraries
- **react** (18.2.0) - UI library
- **react-router-dom** (6.20.1) - Client-side routing
- **axios** (1.6.2) - HTTP client

### UI & Visualization
- **lucide-react** (0.469.0) - Icon library
- **chart.js** (4.5.1) - Charting library
- **react-chartjs-2** (5.3.1) - React wrapper for Chart.js
- **recharts** (3.8.1) - Alternative charting library

### Styling
- **tailwindcss** (3.4.17) - Utility-first CSS framework
- **autoprefixer** (10.4.20) - CSS vendor prefixing
- **postcss** (8.4.49) - CSS processing

### Development
- **@vitejs/plugin-react** (4.2.1) - Vite React plugin
- **vite** (5.0.5) - Build tool

---

## 🚀 Development Workflow

### Running the Application

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=MESOB Wellness
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📝 Component Example

### Complete Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import { getAppointments } from '../services/adminService';
import Button from '../components/forms/Button';

function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await getAppointments();
        setAppointments(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Appointments</h2>
      <div className="appointments-list">
        {appointments.map(apt => (
          <div key={apt.id} className="appointment-item">
            <span className="badge badge-blue">{apt.status}</span>
            <p>{apt.patientName}</p>
            <p>{apt.date}</p>
          </div>
        ))}
      </div>
      <Button variant="primary" fullWidth>
        Book New Appointment
      </Button>
    </div>
  );
}

export default AppointmentsList;
```

---

## 🔍 Key Features

### Maintenance Mode

System can be put into maintenance mode via settings:
- Non-admin users see maintenance page
- Admins can still access the system
- Settings checked every 5 seconds

### Starry Background Animation

Login/register pages have animated starry background:
```css
animation: stars 60s linear infinite;
```

### Profile Picture Support

User menu shows:
- Profile picture if uploaded
- Avatar icon (👤) as fallback

### Language Selector

Header includes language selector (currently non-functional):
- English
- አማርኛ (Amharic)

---

## 📚 Best Practices

### Component Design
1. Keep components **focused and single-purpose**
2. Use **functional components** with hooks
3. Extract **reusable logic** into custom hooks
4. Keep **styles scoped** to components when possible

### State Management
1. Use **local state** for component-specific data
2. Use **Context** for shared auth state
3. Consider **props drilling** vs context for 2-3 levels

### Styling
1. Use **Tailwind utilities** for simple styling
2. Use **custom CSS** for complex, reusable patterns
3. Follow **BEM-like naming** for CSS classes (`.card`, `.card-header`)
4. Use **CSS variables** for colors and spacing

### API Calls
1. **Always** handle loading states
2. **Always** handle errors gracefully
3. Use **try-catch** with async/await
4. **Centralize** API logic in service files

---

## 🐛 Common Issues

### Port Already in Use
If port 3000 is taken, the app will fail (strictPort: true). Stop other services or change port in `vite.config.js`.

### Axios Network Errors
Ensure backend is running and `VITE_API_URL` is correctly set.

### Routing Issues
- Ensure React Router's `BrowserRouter` wraps the app
- Use `Navigate` instead of `Redirect` (v6 syntax)
- Use `replace` prop to prevent back-button issues

---

## 🎯 Summary

This frontend architecture provides:

✅ **Modular component structure** by feature/role  
✅ **Hybrid styling** with Tailwind + custom CSS  
✅ **Role-based access control** with route guards  
✅ **Centralized API services** for clean separation  
✅ **Responsive design** with mobile support  
✅ **Type-safe routing** with React Router v6  
✅ **Professional UI** with MESOB design system  
✅ **Scalable architecture** for growth  

The application follows React best practices and modern patterns, making it maintainable and developer-friendly.

---

**Last Updated:** June 5, 2026  
**Version:** 1.0.0
