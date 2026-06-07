# Dashboard Page - Complete Style Inventory

## Overview
Dashboard page uses multiple CSS files and renders 7 child components conditionally based on active tab.

**Main Component**: `Dashboard.jsx`
**CSS Files Used**:
- `dashboard.css` (2373 lines) - Main styles
- `dashboard-priority2.css` (903 lines) - Enhanced/redesigned styles
- `dashboard-new-features.css` (563 lines) - New feature components
- `dashboard-tokens.css` (89 lines) - Shared design tokens

**Child Components** (in `/components/dashboard/`):
1. BookingCalendar
2. MyAppointments
3. HealthJourney
4. WellnessPlan
5. ProfileSection
6. FeedbackForm
7. LongitudinalRecords

---

## Color Palette Inventory

### Primary Brand Colors
- **MESOB Blue**: `#284394`, `#3550A0`, `#1e3a8a`, `#2563eb`, `#3b82f6`
- **MESOB Gold**: `#fbbf24`, `#f59e0b`, `#f5a623`
- **MESOB Purple**: `#8b5cf6`, `#764ba2`

### Health Status Colors
- **Success/Green**: `#10b981`, `#059669`, `#16a34a`, `#22c55e`, `#1D9E75`, `#0F6E56`
- **Warning/Yellow**: `#f59e0b`, `#d97706`, `#f5a623`, `#92400e`
- **Danger/Red**: `#ef4444`, `#dc2626`, `#b91c1c`, `#991b1b`
- **Info/Blue**: `#0ea5e9`, `#0891b2`, `#0c4a6e`

### Gradients
1. **Primary Header**: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`
2. **User Profile Card**: `linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)`
3. **Health Summary**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
4. **Feedback Form**: `linear-gradient(135deg, #284394 0%, #2563eb 100%)`
5. **Risk Circles**: `linear-gradient(135deg, #10b981 0%, #059669 100%)` (green)
6. **Password Modal Header**: `linear-gradient(135deg, #3550A0 0%, #2A4080 100%)`
7. **Dark Card**: `linear-gradient(145deg, #0f2744 0%, #0a1628 100%)`

### Gray Scale
- `#f8fafc`, `#f9fafb`, `#f1f5f9`, `#f3f4f6` (lightest)
- `#e5e7eb`, `#e2e8f0`, `#e0e0e0` (light borders)
- `#d1d5db`, `#cbd5e1` (borders)
- `#9ca3af`, `#94a3b8`, `#6b7280`, `#64748b` (medium text)
- `#374151`, `#1f2937`, `#1e293b` (dark text)

---

## Typography

### Font Sizes
- **Extra Large**: `2.5rem` (hero titles), `2rem` (main headers)
- **Large**: `1.75rem`, `1.5rem` (section headers)
- **Medium**: `1.25rem`, `1.2rem`, `1.1rem` (card titles)
- **Base**: `1rem`, `0.95rem`, `0.9rem` (body text)
- **Small**: `0.85rem`, `0.8rem`, `0.75rem` (labels, badges)
- **Extra Small**: `0.72rem`, `0.7rem`, `0.65rem` (tiny labels)

### Font Weights
- **Extra Bold**: `800`, `700` (numbers, headings)
- **Bold**: `700`, `600` (labels, buttons)
- **Normal**: `500`, `400` (body text)

### Line Heights
- Tight: `1`, `1.1` (numbers, scores)
- Base: `1.5` (paragraphs)

---

## Spacing System

### Padding
- Card padding: `1.5rem`, `1.25rem`, `2rem`, `2.5rem`
- Button padding: `0.75rem 1.5rem`, `0.6rem 1.2rem`, `0.5rem 1rem`
- Small padding: `0.25rem 0.5rem`, `0.4rem 0.8rem` (badges)
- Form input: `0.625rem 0.875rem`, `0.75rem`, `0.85rem`

### Gaps
- Large: `2rem`, `1.5rem`
- Medium: `1rem`, `0.75rem`
- Small: `0.5rem`, `0.25rem`

### Margins
- Section spacing: `1.5rem`, `2rem`
- Element spacing: `0.5rem`, `0.75rem`, `1rem`

---

## Border Radius

- **Extra Large**: `16px`, `20px` (major cards)
- **Large**: `12px` (cards, modals)
- **Medium**: `8px`, `10px` (buttons, inputs)
- **Small**: `6px`, `4px` (badges, small elements)
- **Pill**: `20px`, `999px`, `9999px` (status badges)
- **Circle**: `50%` (avatars, score rings)

---

## Shadows

### Box Shadows
1. Light: `0 1px 6px rgba(0,0,0,0.07)`, `0 2px 8px rgba(0,0,0,0.1)`
2. Medium: `0 4px 12px rgba(0,0,0,0.1)`, `0 4px 15px rgba(102,126,234,0.3)`
3. Heavy: `0 8px 24px rgba(59,130,246,0.3)`, `0 20px 60px rgba(0,0,0,0.3)`
4. Colored: `0 4px 12px rgba(53,80,160,0.3)` (blue), `0 4px 12px rgba(139,92,246,0.2)` (purple)

### Text Shadows
- `0 2px 4px rgba(0,0,0,0.2)` (header titles)

---

## Animations

### Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dashPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes dashSpin {
  to { transform: rotate(360deg); }
}
```

### Transitions
- Fast: `0.15s ease`, `0.2s ease`
- Hover transforms: `transform 0.2s ease`, `all 0.2s ease`, `all 0.3s ease`
- Colors: `background 0.2s ease`, `border-color 0.2s ease`

---

## Component-Specific Styles

### Dashboard Container
- Max-width: `1200px`
- Padding: `20px`
- Gap: `1.5rem`
- Animation: `fadeIn 0.4s ease-in`

### Dashboard Header
- Padding: `2rem`
- Gradient: blue to purple
- Border-radius: `16px`
- Shadow: `0 8px 24px rgba(59,130,246,0.3)`
- Decorative circles: pseudo-elements with `rgba(255,255,255,0.1)`

### Tabs
- Tab button padding: `12px 20px`
- Active border: `3px solid #fbbf24`
- Background: `rgba(255,255,255,0.1)`
- Border-radius: `6px 6px 0 0`

### Cards
- Background: `white`
- Border: `1px solid #e0e0e0`, `2px solid #e2e8f0`
- Border-radius: `12px`, `10px`
- Padding: `25px`, `1.5rem`
- Shadow: `0 2px 8px rgba(0,0,0,0.1)`

### Buttons
**Primary**: 
- Background: `#2563eb`, `#3550A0`, `#284394`
- Hover: darker shade
- Padding: `10px 20px`, `0.75rem 1.5rem`
- Font-weight: `600`

**Secondary**:
- Background: `#e5e7eb`, `#f0f0f0`
- Color: `#333`, `#1e293b`

**Danger**:
- Background: `#ef4444`, `#dc3545`
- Color: `white`

**Ghost** (dark backgrounds):
- Background: `transparent`
- Border: `1px solid rgba(255,255,255,0.4)`
- Color: `#fff`

### Status Badges
- Padding: `6px 12px`, `0.25rem 0.75rem`
- Border-radius: `20px`
- Font-size: `0.85rem`, `12px`
- Font-weight: `bold`, `700`

**Colors**:
- Pending: `#fef3c7` bg, `#92400e` text
- Confirmed: `#dcfce7` bg, `#166534` text
- In-Progress: `#dbeafe` bg, `#0c4a6e` text
- Completed: `#d1d5db` bg, `#374151` text
- Cancelled: `#fee2e2` bg, `#991b1b` text

### User Avatar
- Size: `80px x 80px`
- Border-radius: `50%`
- Background: `rgba(255,255,255,0.2)`
- Border: `3px solid rgba(255,255,255,0.3)`
- Font-size: `2rem`

### Health Score Circle
- Size: `120px x 120px`, `100px x 100px`
- Border-radius: `50%`
- Colors: green/yellow/red gradients
- Shadow: `0 4px 12px rgba(0,0,0,0.15)`

### Calendar
- Grid: `repeat(7, 1fr)`
- Gap: `5px`
- Day aspect-ratio: `1`
- Border: `2px solid #e0e0e0`
- Hover border: `#2563eb`
- Today background: `#f3e8ff`, border: `#8b5cf6`
- Selected background: `#dbeafe`, border: `#2563eb`

### Modals
- Overlay: `rgba(0,0,0,0.5)`
- Background: `white`
- Border-radius: `12px`, `8px`
- Max-width: `420px`, `500px`
- Shadow: `0 20px 60px rgba(0,0,0,0.3)`
- Animation: `slideUp 0.3s ease`

### Forms
- Input padding: `0.625rem 0.875rem`, `10px`
- Border: `1.5px solid #e2e8f0`, `1px solid #e0e0e0`
- Border-radius: `6px`
- Focus border: `#3550A0`, `#2563eb`
- Focus shadow: `0 0 0 3px rgba(53,80,160,0.1)`

### NPS Scale
- Grid: `repeat(11, 1fr)` or `repeat(auto-fit, minmax(40px, 1fr))`
- Button size: `40px` min-width
- Active: `#284394` background

### Rating Stars
- Grid: `repeat(5, 1fr)`
- Color: `#f59e0b` (gold)
- Active background: `#284394`

### Health Journey (hj- prefix styles)
- Page background: `#f1f5f9`
- Card background: `#fff`
- Border: `1px solid #e2e8f0`
- Banner background: `#213D8D`
- Score ring border: `3px solid #1D9E75`
- Alert green: `#E1F5EE` bg, `#9FE1CB` border, `#0F6E56` text

### Progress Bars
- Height: `8px`, `5px`
- Background: `#e5e7eb`, `#e2e8f0`
- Fill colors: `#2563eb`, `#10b981`, `#f59e0b`
- Border-radius: `4px`, `3px`
- Transition: `width 0.3s ease`, `width 0.4s ease`

---

## Responsive Breakpoints

### 1024px and below
- Charts: single column
- KPI grid: 3 columns

### 900px and below
- KPI grid: 2 columns

### 768px (tablet)
- Dashboard header: `1.8rem` title
- Card padding: reduced to `1rem`, `15px`
- User profile: column layout
- Calendar: maintained at 7 columns
- Vitals grid: 2 columns
- NPS scale: maintained
- Form actions: column layout

### 480px (mobile)
- Dashboard padding: `10px`
- Card padding: `15px`
- Calendar gap: `3px`, day padding: `4px`
- Vitals grid: 1 column
- NPS scale: 6 columns
- Appointment header: column layout
- KPI grid: 2 columns

### 360px (small mobile)
- KPI grid: 1 column

---

## Z-Index Layers

- Modal overlay: `1000`
- Decorative elements: `0`, `1` (behind content)

---

## Special Effects

### Hover States
- Cards: `transform: translateY(-2px)`, enhanced shadow
- Buttons: darker background, `transform: translateY(-2px)`
- Calendar days: border color change, background tint

### Active States
- Buttons: no transform (pressed)
- Tabs: bottom border + background

### Disabled States
- Opacity: `0.6`, `0.5`
- Cursor: `not-allowed`
- Background: `#f1f5f9`, `#f8f9fa`

### Loading States
- Spinner: `22px x 22px`, rotating border
- Color: `var(--mesob-blue)`

---

## Notes for Migration

1. **CSS Modules Structure**: Create separate module files for each component
2. **Shared Styles**: Extract common patterns (buttons, badges, cards) into base utilities
3. **Design Tokens**: Use existing token files as CSS variables
4. **Animations**: Preserve all keyframe animations
5. **Responsive**: Maintain all breakpoints exactly
6. **Hover Effects**: Preserve all interactive states
7. **Color System**: Use exact hex values, no approximations
8. **Spacing**: Maintain exact rem/px values
9. **Typography**: Preserve font sizes and weights
10. **Shadows**: Copy shadow values exactly

## Child Components to Migrate
Each needs its own CSS Module:
- BookingCalendar.module.css
- MyAppointments.module.css  
- HealthJourney.module.css
- WellnessPlan.module.css
- ProfileSection.module.css
- FeedbackForm.module.css
- LongitudinalRecords.module.css

Plus main Dashboard.module.css for container and layout.
