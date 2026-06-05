# MESOB Wellness Frontend - Developer Guide

**Last Updated**: May 28, 2026  
**Phase**: 1 - Foundation Complete

---

## 🚀 Quick Start

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
# Opens at http://localhost:3000
```

### Build
```bash
npm run build
npm run preview  # Preview production build
```

---

## 📁 Project Structure

```
frontend/src/
├── app/                    # App configuration
│   ├── providers/         # React providers (Query, etc.)
│   └── App.tsx           # Root component
├── shared/                # Shared resources
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI component library
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── constants/       # Constants & enums
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── stores/               # Zustand state stores
├── context/              # React contexts
├── services/             # API services
├── routes/               # Route configuration
├── pages/                # Page components
├── components/           # Feature components
└── main.tsx             # Entry point
```

---

## 🎨 Using UI Components

### Import Components
```tsx
import { Button, Card, Badge, Alert, Modal } from '@/components/ui';
import { AppShell, PageHeader, Breadcrumbs } from '@/components/layout';
```

### Button Examples
```tsx
// Primary button
<Button variant="primary" size="md">
  Save Changes
</Button>

// Loading state
<Button variant="primary" isLoading>
  Saving...
</Button>

// With icons
<Button variant="success" leftIcon={<CheckIcon />}>
  Approve
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit
</Button>
```

### Card Examples
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui';

<Card variant="elevated" padding="lg">
  <CardHeader 
    title="Patient Information"
    subtitle="View and edit patient details"
    action={<Button size="sm">Edit</Button>}
  />
  <CardBody>
    {/* Content */}
  </CardBody>
  <CardFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

### Input Examples
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="Enter email"
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<MailIcon />}
  required
  fullWidth
/>
```

### Modal Examples
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Badge Examples
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>
<Badge variant="info" dot>New</Badge>
```

### Alert Examples
```tsx
<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>

<Alert variant="danger" onClose={() => setError(null)}>
  An error occurred. Please try again.
</Alert>
```

---

## 🪝 Using Custom Hooks

### useAuth
```tsx
import { useAuth } from '@/hooks';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Welcome, {user.fullName}</div>;
}
```

### useDebounce
```tsx
import { useDebounce } from '@/hooks';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  useEffect(() => {
    // API call with debounced value
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);
  
  return <Input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

### useMediaQuery
```tsx
import { useIsMobile, useIsDesktop } from '@/hooks';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### useLocalStorage
```tsx
import { useLocalStorage } from '@/hooks';

function PreferencesComponent() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### useClickOutside
```tsx
import { useClickOutside } from '@/hooks';

function DropdownComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useClickOutside(ref, () => setIsOpen(false), isOpen);
  
  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

---

## 🗄️ Using Zustand Stores

### Notification Store
```tsx
import { useNotificationStore } from '@/stores';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  
  return (
    <button>
      <BellIcon />
      {unreadCount > 0 && <span>{unreadCount}</span>}
    </button>
  );
}
```

### UI Store
```tsx
import { useUIStore } from '@/stores';

function SidebarToggle() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  
  return (
    <button onClick={toggleSidebar}>
      {sidebarCollapsed ? <MenuIcon /> : <XIcon />}
    </button>
  );
}
```

---

## 🔧 Using Utilities

### Class Names
```tsx
import { cn } from '@/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)} />
```

### Date Formatting
```tsx
import { formatDate, getRelativeTime } from '@/utils';

<p>{formatDate(appointment.scheduledAt, 'long')}</p>
<p>{getRelativeTime(notification.createdAt)}</p>
```

### Number Formatting
```tsx
import { formatNumber, formatPercentage, formatCurrency } from '@/utils';

<p>Total: {formatNumber(1234567)}</p>
<p>Success Rate: {formatPercentage(85.5)}</p>
<p>Amount: {formatCurrency(1500.50)}</p>
```

### Role Checking
```tsx
import { hasRole, hasAnyRole } from '@/utils';

if (hasRole(user.role, 'MANAGER')) {
  // User is manager or higher
}

if (hasAnyRole(user.role, ['NURSE_OFFICER', 'MANAGER'])) {
  // User is nurse or manager
}
```

### Health Calculations
```tsx
import { calculateBMI, getBMICategory, getBPCategory } from '@/utils';

const bmi = calculateBMI(70, 175); // weight in kg, height in cm
const category = getBMICategory(bmi);
const bpCategory = getBPCategory(120, 80);
```

---

## 🎯 Using TypeScript Types

### Import Types
```tsx
import type { User, Appointment, VitalRecord } from '@/types';
import type { ButtonVariant, BadgeVariant } from '@/types';
```

### Component Props with Types
```tsx
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <h3>{user.fullName}</h3>
      <p>{user.email}</p>
      {onEdit && <Button onClick={() => onEdit(user)}>Edit</Button>}
    </Card>
  );
};
```

### API Response Types
```tsx
import type { ApiResponse, PaginatedResponse } from '@/types';

async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const response = await api.get('/users');
  return response.data;
}
```

---

## 📡 Using Constants

### Import Constants
```tsx
import { 
  USER_ROLES, 
  APPOINTMENT_STATUSES, 
  VITAL_RANGES,
  ETHIOPIAN_REGIONS 
} from '@/constants';
```

### Role Display
```tsx
<p>Role: {USER_ROLES[user.role]}</p>
```

### Status Badge
```tsx
<Badge variant={APPOINTMENT_STATUS_COLORS[appointment.status]}>
  {APPOINTMENT_STATUSES[appointment.status]}
</Badge>
```

### Validation
```tsx
import { VALIDATION } from '@/constants';

if (!VALIDATION.email.pattern.test(email)) {
  setError(VALIDATION.email.message);
}
```

---

## 🏗️ Layout Architecture

### Using AppShell
```tsx
import { AppShell, PageHeader, Breadcrumbs } from '@/components/layout';

function MyPage() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your dashboard"
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Analytics' }
            ]} 
          />
        }
        action={
          <Button variant="primary">
            New Appointment
          </Button>
        }
      />
      
      <div className="page-content">
        {/* Your content */}
      </div>
    </AppShell>
  );
}
```

---

## 🔌 TanStack Query Usage

### Query Hook Example
```tsx
import { useQuery } from '@tanstack/react-query';
import { appointmentsService } from '@/services';

function AppointmentsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsService.getAll(),
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="danger">Error loading appointments</Alert>;
  
  return (
    <div>
      {data.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
```

### Mutation Hook Example
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateAppointmentForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data) => appointmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
  });
  
  const handleSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" isLoading={mutation.isPending}>
        Create Appointment
      </Button>
    </form>
  );
}
```

---

## 🎨 Design System

### Colors
```css
/* Primary Colors */
--primary: #2347A6;        /* Deep Navy */
--primary-dark: #1B3784;   /* Darker Navy */
--accent: #F59E0B;         /* Gold */
--healthcare: #14B8A6;     /* Teal */

/* Status Colors */
--success: #22C55E;
--warning: #F59E0B;
--danger: #EF4444;
--info: #3B82F6;
```

### Typography
```css
/* Font Family */
font-family: 'Inter', sans-serif;

/* Font Sizes */
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */
text-2xl: 1.5rem;    /* 24px */
text-3xl: 1.875rem;  /* 30px */
text-4xl: 2.25rem;   /* 36px */
```

### Spacing
```css
/* Spacing Scale (8px base) */
xs: 4px;
sm: 8px;
md: 16px;
lg: 24px;
xl: 32px;
2xl: 48px;
3xl: 64px;
```

---

## 🔐 Path Aliases

```typescript
@/                  → src/
@/components        → src/shared/components/
@/ui                → src/shared/components/ui/
@/layouts           → src/shared/components/layout/
@/hooks             → src/shared/hooks/
@/utils             → src/shared/utils/
@/types             → src/shared/types/
@/constants         → src/shared/constants/
@/services          → src/services/
@/stores            → src/stores/
@/context           → src/context/
@/app               → src/app/
@/styles            → src/shared/styles/
```

---

## 📝 Code Style Guidelines

### Component Structure
```tsx
/* ========================================
   COMPONENT NAME
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { cn } from '@/utils';
import type { ComponentProps } from '@/types';

export interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
};

MyComponent.displayName = 'MyComponent';
```

### Naming Conventions
- **Components**: PascalCase (`UserCard`, `AppointmentList`)
- **Hooks**: camelCase with `use` prefix (`useAuth`, `useDebounce`)
- **Utilities**: camelCase (`formatDate`, `calculateBMI`)
- **Constants**: UPPER_SNAKE_CASE (`USER_ROLES`, `API_ENDPOINTS`)
- **Types**: PascalCase (`User`, `Appointment`, `ApiResponse`)

---

## 🧪 Testing (Phase 2)

Testing will be added in Phase 2 with:
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

---

## 🆘 Common Issues

### Import Errors
If you see import errors, make sure:
1. Path aliases are configured in `tsconfig.json`
2. Vite config has the same aliases
3. You're using the correct alias prefix (`@/`)

### Type Errors
If TypeScript complains:
1. Check if types are exported from `@/types`
2. Ensure you're importing types with `import type`
3. Run `npm run build` to see all type errors

### Build Errors
If build fails:
1. Check for missing dependencies: `npm install`
2. Clear cache: `rm -rf node_modules/.vite`
3. Rebuild: `npm run build`

---

**Happy Coding! 🚀**

For questions or issues, refer to the Phase 1 Completion Report or contact the development team.
