---
name: Kin Connect CRM
colors:
  surface: '#f7f9ff'
  surface-dim: '#c9dcf3'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e3efff'
  surface-container-high: '#d9eaff'
  surface-container-highest: '#d1e4fb'
  on-surface: '#091d2e'
  on-surface-variant: '#42474c'
  inverse-surface: '#203243'
  inverse-on-surface: '#e8f2ff'
  outline: '#72787c'
  outline-variant: '#c2c7cc'
  surface-tint: '#456274'
  primary: '#254354'
  on-primary: '#ffffff'
  primary-container: '#3d5a6c'
  on-primary-container: '#b2d0e6'
  inverse-primary: '#accbe0'
  secondary: '#bc000d'
  on-secondary: '#ffffff'
  secondary-container: '#e61b1c'
  on-secondary-container: '#fffbff'
  tertiary: '#573900'
  on-tertiary: '#ffffff'
  tertiary-container: '#754f00'
  on-tertiary-container: '#ffc15f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8e7fc'
  primary-fixed-dim: '#accbe0'
  on-primary-fixed: '#001e2d'
  on-primary-fixed-variant: '#2d4a5c'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930007'
  tertiary-fixed: '#ffddaf'
  tertiary-fixed-dim: '#ffba43'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#614000'
  background: '#f7f9ff'
  on-background: '#091d2e'
  surface-variant: '#d1e4fb'
  panafrican-cyan: '#1E9FD8'
  surface-white: '#FFFFFF'
  stadium-gray: '#F8FAFC'
typography:
  display-lg:
    fontFamily: Oswald
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Oswald
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Oswald
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Oswald
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Open Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  stats-lg:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.05em
  stats-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.2'
  label-caps:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for a high-performance sports management environment, blending the precision of a professional CRM with the raw energy of African football leadership. The aesthetic is **Corporate / Modern** with a **High-Contrast** edge, utilizing a "Sport-Utility" approach that prioritizes data density and actionable insights without sacrificing visual impact.

The target audience consists of sports executives, tournament organizers, and talent scouts who require a platform that feels as authoritative as a boardroom and as dynamic as a stadium. The UI evokes confidence, victory, and continental unity through a structured grid and a bold, prestige-driven color application.

## Colors

The palette is anchored by **Slate Blue**, representing the professional excellence and strategic depth of the CRM. **Red** serves as the primary action color, used for critical CTAs and energy-driven highlights. **Gold** is reserved for premium states, achievements, and "Victory" moments such as podiums or top-tier stats.

**Cyan** provides a vibrant connection point for team-specific accents and panafrican unity. The background utilizes a crisp **White** or a very light **Stadium Gray** to ensure the heavy primary colors pop, maintaining high readability in data-heavy views.

## Typography

Typography is a critical differentiator in this design system. We use **Oswald** for headlines to provide a tall, impactful "jersey-style" aesthetic that commands attention. **Open Sans** is the workhorse for UI text and body copy, ensuring clarity and a professional feel.

For analytical data, scores, and technical statistics, **JetBrains Mono** is utilized. Its monospaced nature ensures that numbers align perfectly in tables and live-score tickers, evoking a sense of tactical precision and digital innovation. All caps should be used sparingly for labels and "Tournoi" headers to maintain the sporty "Display" vibe.

## Layout & Spacing

The system follows a strict **8px spacing grid**. Layouts are primarily **Fixed Grid** on desktop (max 1280px) to maintain the organized feel of a professional management tool, transitioning to a fluid single-column layout on mobile.

- **Desktop (1280px+):** 12-column grid, 24px gutters, 32px side margins.
- **Tablet (768px - 1279px):** 8-column grid, 16px gutters, 24px side margins.
- **Mobile (< 768px):** 4-column grid, 16px gutters, 16px side margins.

Use spacing tokens to create clear separation between match phases and data clusters. Padding within cards should be generous (24px) to balance the high-density information.

## Elevation & Depth

This design system uses **Tonal Layers** supplemented by **Low-Contrast Outlines** to create hierarchy. 

Depth is achieved by placing white cards on a light gray background (`#F8FAFC`). To maintain the professional sports vibe, avoid heavy, blurry shadows. Instead, use thin `1px` borders in Slate Blue (at 10% opacity) or subtle, crisp shadows that feel structural rather than decorative. 

Active elements or "Live" match cards may use a secondary-colored (Red) top-border to indicate urgency and priority without needing significant elevation.

## Shapes

The shape language is **Soft (0.25rem/4px)**. This choice leans into the professional, systematic nature of a CRM. Sharp corners are avoided to keep the interface approachable, but large radii are rejected to maintain a serious, high-performance "engineered" look. 

Buttons and input fields follow the standard 4px radius. Action-oriented tags (like "Live" or "Winner") may use a **Pill-shape** to distinguish them from structural UI components.

## Components

### Buttons
- **Primary:** Solid Red background, White text, 4px radius. High-impact for conversion.
- **Secondary:** Slate Blue outline or solid Cyan for informational actions.
- **Victory:** Gold background with Slate Blue text for awards and podium-related actions.

### Match Cards
Match cards feature a Red header (`5px` top-border), a clean white body, and scores displayed in **Oswald** or **JetBrains Mono** at large sizes. Team names should be bold and legible.

### Tables & Leaderboards
- **Header:** Solid Slate Blue with White text.
- **Rows:** Alternating "Zebra" stripes (White and Light Gray).
- **Ranking:** Use Gold accents for the top 3 spots, with the rank digit in JetBrains Mono.

### Input Fields
Clean, 1px Slate Blue borders (low opacity) that turn solid Cyan on focus. Use JetBrains Mono for numeric inputs to ensure clarity in statistics and financial data.

### Chips & Badges
Small, high-contrast badges using Red (Action), Cyan (Info), or Gold (Achievement). Text should be in `label-caps` typography for maximum "sports-official" styling.