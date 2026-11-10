# Frontend CSS Architecture & Style Guide

This directory manages the styles for the MESOB Wellness Platform.

---

## Architecture Overview

```
src/styles/
├── tokens/              # Design Tokens (CSS Variables)
│   ├── colors.css       # Brand palette, status colors, neutrals
│   ├── spacing.css      # Standard spacing scale (rem-based)
│   ├── typography.css   # Font families, sizes, line heights
│   └── effects.css      # Shadows, border-radii, transitions
│
├── base/                # Core Baseline
│   ├── reset.css        # Box-sizing & browser reset
│   └── utilities.css    # Common CSS utility helper classes
│
├── tailwind.css         # Tailwind CSS directives (@tailwind base/components/utilities)
├── global.css           # Global body typography, layout resets, scrollbars
│
└── [domain].css         # Domain & layout stylesheets:
    ├── admin-*.css      # System admin tables, filters, health & analytics grids
    ├── manager-*.css    # Center manager dashboard & capacity widgets
    ├── nurse-*.css      # Nurse station, vitals entry, live queue styling
    ├── walkin.css       # Walk-in registration modal & patient lookup
    ├── unified-layout.css # Unified sidebar, header & drawer containers
    └── tooltip-fix.css  # Chart & map tooltip positioning overrides
```

---

## Styling Guidelines

1. **Prefer CSS Modules for New Components:**
   * Co-locate `[ComponentName].module.css` with the component.
   * Prevents global class collisions and keeps components portable.

2. **Leverage Design Tokens:**
   * Always reference CSS variables defined in `tokens/colors.css` (e.g., `var(--primary-blue)`, `var(--success-green)`) rather than hardcoding hex colors.

3. **Avoid CamelCase in CSS:**
   * Write standard hyphenated CSS (`border-radius`, `background-color`, `font-size`) rather than React style objects.

