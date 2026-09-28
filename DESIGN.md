---
name: Mise Operations System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005d42'
  on-tertiary: '#ffffff'
  tertiary-container: '#047857'
  on-tertiary-container: '#9ffdd3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#97f5cc'
  tertiary-fixed-dim: '#7bd8b1'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#00513a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-table:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for multi-unit culinary groups, executive chefs, procurement managers, and food & beverage operators. The operational environment of hospitality demands instant legibility under shifting lighting, rigorous inventory reconciliation, and decisive waste reduction. The interface adopts a **Modern Corporate** style infused with **Culinary Functionalism**: quiet, poised, razor-sharp, and unencumbered by ornamental distraction.

The visual narrative evokes the kitchen philosophy of *mise en place*—everything in its deliberate place, ready for flawless execution. Rather than flashy consumer styling, the platform projects architectural discipline, fiscal precision, and operational clarity. Users experience confidence, calm control amid chaotic service schedules, and effortless data digestion.

## Colors

The palette establishes an authoritative, daylight-balanced workspace. The foundation rests on layered neutral surfaces that separate global canvas environments from focused transactional containers without relying on heavy division.

- **Background Canvas**: `#F8FAFC` (Slate-50) establishes a clean, slightly cool workspace that prevents glare during prolonged data audits.
- **Card & Container Surfaces**: `#FFFFFF` pure white, framing dense data modules with pristine edges.
- **Primary Accent (`#0F766E`)**: Deep botanical teal-emerald, providing actionable contrast for key triggers, system progress, and active operational states.
- **Secondary Accent (`#1E293B`)**: Deep executive slate, grounding structural headers, primary actions, and top-tier metrics.
- **Neutral Hierarchy**:
  - Primary Content / Headings: `#0F172A` (Slate-900)
  - Secondary / Table Field Headers: `#475569` (Slate-600)
  - Muted Metadata / Unit Metrics: `#64748B` (Slate-500)
  - Dividers & Outlines: `#E2E8F0` (Slate-200)
  - Subtle Shading & Table Striping: `#F1F5F9` (Slate-100)
- **Operational Semantics**:
  - **Optimal Stock / Surplus**: Primary `#047857`, Surface Tint `#ECFDF5`, Border `#A7F3D0`
  - **Reorder Threshold / Expiring**: Warning `#B45309`, Surface Tint `#FFFBEB`, Border `#FDE68A`
  - **Critical Depletion / Waste Spoilage**: Critical `#BE123C`, Surface Tint `#FFF1F2`, Border `#FECDD3`
  - **Info / Transfer In-Transit**: Informational `#0369A1`, Surface Tint `#F0F9FF`, Border `#BAE6FD`

## Typography

The typographic hierarchy pairs **Hanken Grotesk** for clean, humanist structural balance with **Geist** for technical labels, tabular figures, and dense ledger data.

All numeric values, lot numbers, SKU sequences, margins, and par-levels must be rendered using tabular lining numbers (`font-variant-numeric: tabular-nums;`) via the **Geist** font. This enforces vertical columnar alignment across high-volume inventory listings and variance spreadsheets. Section sub-headers, column sorting triggers, and status tags enforce uppercase rendering with wide tracking on `label-sm` to maintain high legibility at micro scales.

## Layout & Spacing

This design system uses a strict **fluid grid system** aligned to an 8px base rhythm (with a 4px sub-grid for internal component micro-spacing).

- **Desktop (1280px and above)**: 12-column layout with `2rem` margins, fixed `256px` operational sidebar navigation, dynamic breadcrumb utility bar, and `1.5rem` gutters. Multi-location comparative tables can expand to full fluid width with fixed column headers.
- **Tablet (768px - 1279px)**: 8-column layout with `1.5rem` margins and `1rem` gutters. Sidebar collapses into a utility rail (`64px`), auto-converting complex inventory matrix tables into split-pane master-detail views.
- **Mobile (Below 768px)**: 4-column layout with `1rem` margins and `0.5rem` gutters. Tables reflow into stacked item cards prioritizing status badge, par level delta, and primary count input trigger.

## Elevation & Depth

Visual hierarchy relies on **low-contrast outlines** paired with **ambient micro-shadows**, strictly avoiding dramatic, floating elevations. Surfaces communicate depth through tactile, clean boundaries.

- **Level 0 (Canvas Base)**: `#F8FAFC` flat surface. No border, no shadow.
- **Level 1 (Cards, Metric Bins, Data Grids)**: `#FFFFFF` surface container, bordered with `1px solid #E2E8F0`. Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hovered Rows, Interactive Segmented Selectors, Dropdowns)**: `#FFFFFF` surface container, bordered with `1px solid #CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Slide-over Drawers, Batch Count Modals, Date Range Pickers)**: `#FFFFFF` container with `1px solid #CBD5E1`. Shadow: `0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.03)`. Backdrops use `rgba(15, 23, 42, 0.35)` with an ultra-fine `1.5px` backdrop-blur for rapid visual isolation.

## Shapes

The interface embraces a disciplined **Soft** shape geometry with a standard base radius of `6px` (`0.375rem`) to `8px` (`0.5rem`).

Pill-shaped containers are strictly avoided. Rounded corners are reserved for subtle affordance without diminishing table area or creating visual tension in high-density data matrices:
- Standard buttons, input controls, metric boxes, and table containers: `6px` (`0.375rem`).
- Large cards, master panes, and dialog sheets: `8px` (`0.5rem`).
- System-critical status dots, progress track indicators, and multi-location avatar badges: circular (`50%`).

## Components

### Buttons
- **Primary Action**: Background `#0F766E`, text `#FFFFFF`, border `1px solid #0D655E`. Hover: `#115E59`. Active: `#134E4A`. Radius `6px`. Typographic role: `label-md`.
- **Secondary Action (Subdued Dark)**: Background `#1E293B`, text `#FFFFFF`, border `1px solid #0F172A`. Hover: `#334155`. Radius `6px`.
- **Outline / Tertiary**: Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC` and border `#CBD5E1`.
- **Destructive**: Background `#FFF1F2`, text `#BE123C`, border `1px solid #FECDD3`. Hover: `#FFE4E6`.

### Inputs & Number Steppers
- Input frames utilize `#FFFFFF` with `1px solid #CBD5E1` and a `6px` radius. Height fixed at `36px` for standard density, `30px` for embedded table inline counts.
- Numeric inputs for quantities, conversions, and unit pricing display integrated increment/decrement controls with monospaced numerical alignment.
- Focus state applies a crisp ring: `box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px rgba(15, 118, 110, 0.25)` and border `#0F766E`.

### Inventory Data Grids & Lists
- Table headers utilize `#F8FAFC` backgrounds, uppercase `label-sm` tracking with `#475569`, and a bottom border `1px solid #E2E8F0`.
- Alternating row styling is bypassed in favor of clean separation via `1px solid #F1F5F9` row dividers and an intentional hover highlight of `#F8FAFC`.
- Sticky columns for Ingredient Name and Par Status anchor horizontally during deep horizontal audit scrolls.

### Status Indicators & Stock Chips
- Compact rectangular badges (`height: 22px`, `padding: 0 8px`, `border-radius: 4px`, `label-sm` font).
- **In Stock**: Background `#ECFDF5`, text `#047857`, border `1px solid #A7F3D0`.
- **Low Stock Warning**: Background `#FFFBEB`, text `#B45309`, border `1px solid #FDE68A`.
- **Depleted / Spoilage**: Background `#FFF1F2`, text `#BE123C`, border `1px solid #FECDD3`.
- All badges pair with a leading `6px` solid status pip to reinforce accessibility.

### Cards & Metric Containers
- Summary stat cards display a quiet `#FFFFFF` background with `1px solid #E2E8F0`.
- Header labels use `label-md` in `#64748B`. Values use `headline-md` with tabular numbers in `#0F172A`.
- Bottom trend-indicators are rendered inline with subtle color coding reflecting food cost percentage variance against scheduled budgets.

### Checkboxes & Selection Controls
- Checkbox dimensions: `16px x 16px` with a `4px` corner radius.
- Unchecked: `#FFFFFF` fill with `1px solid #CBD5E1`.
- Checked: `#0F766E` fill with white SVG checkmark. Indeterminate states display a centered horizontal rule.