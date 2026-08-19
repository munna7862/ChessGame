# ChessForge Component Styling Conventions & Visual Design System Guide

## Document Overview

- **Document ID:** `GUIDE-DES-09-01`
- **Phase:** 09 (UX Polish & Accessibility)
- **Sprint:** 01 (Design Tokens and Visual System)
- **Status:** **ACTIVE GUIDELINE**
- **Target Audience:** All Frontend and UI Developers contributing to ChessForge

---

## 1. Visual Hierarchy & Philosophy

ChessForge is designed with a **Board-First, Distraction-Free Philosophy**. In every viewport layout:

1. **Board Dominance:** The 8x8 chessboard is the hero element of the viewport. Visual cues on the board (selection rings, legal target dots, capture halos, check indicators, arrival animations) must be crisp and legible without overwhelming the pieces.
2. **Neutral Subdued Chrome:** Outer containers, navigation bars, headers, and sidebars utilize a dark slate palette (`--surface-base` #0f172a, `--surface-raised` #1e293b, `--surface-card` rgba(30, 41, 59, 0.75)) to avoid competing for visual attention.
3. **Intentional Accents:** Accent colors (`--accent-cyan` #38bdf8, `--accent-emerald` #34d399, `--accent-amber` #fbbf24, `--accent-indigo` #818cf8) are reserved for active states, selected tools, timer indicators, and critical turn alerts.

---

## 2. Token Consumption Rules

### 2.1 CSS Custom Properties First

Always prefer CSS Custom Properties defined in `src/theme/tokens.css`:

```css
/* ✅ DO: Use centralized semantic tokens */
.my-card {
  background: var(--surface-card);
  border: var(--border-width-thin) solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-glass);
}

/* ❌ DON'T: Hardcode raw hex or arbitrary px measurements */
.my-card {
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 17px;
}
```

### 2.2 TypeScript Tokens Access

When dynamic calculations, Canvas rendering, or inline styles in React components require token values, import `DESIGN_TOKENS` from `@/theme`:

```typescript
import { DESIGN_TOKENS, getBoardThemeTokens, cssVar } from "@/theme";

// Example: Programmatic theme extraction
const themeColors = getBoardThemeTokens("wood");
console.log(themeColors.squareLightBg); // "#f0d9b5"
```

---

## 3. Spacing System (4px Base Grid)

| Token        | Rem Value | Pixel Value | Standard Usage                                     |
| :----------- | :-------- | :---------- | :------------------------------------------------- |
| `--space-0`  | `0px`     | 0px         | Reset margins/paddings                             |
| `--space-1`  | `0.25rem` | 4px         | Micro padding, icon gaps, subtle offsets           |
| `--space-2`  | `0.5rem`  | 8px         | Button inline gaps, badge padding, compact margins |
| `--space-3`  | `0.75rem` | 12px        | Form input padding, status bar gaps                |
| `--space-4`  | `1rem`    | 16px        | Standard card padding, section gaps                |
| `--space-5`  | `1.25rem` | 20px        | Medium panel spacing                               |
| `--space-6`  | `1.5rem`  | 24px        | Large dialog padding, column gaps                  |
| `--space-8`  | `2rem`    | 32px        | Major layout container padding                     |
| `--space-10` | `2.5rem`  | 40px        | Hero section vertical spacing                      |
| `--space-12` | `3rem`    | 48px        | Page margins on ultra-wide screens                 |
| `--space-16` | `4rem`    | 64px        | Maximum macro separation                           |

---

## 4. Typography Scale & Hierarchy

| Token         | Size (Rem / Px)    | Line Height              | Usage Context                                     |
| :------------ | :----------------- | :----------------------- | :------------------------------------------------ |
| `--text-xs`   | `0.75rem` (12px)   | `--leading-tight` (1.25) | Coordinate annotations, timestamps, caption notes |
| `--text-sm`   | `0.8125rem` (13px) | `--leading-normal` (1.5) | Badges, secondary metadata, tooltips              |
| `--text-base` | `0.875rem` (14px)  | `--leading-normal` (1.5) | Standard UI buttons, menu items, table rows       |
| `--text-md`   | `1rem` (16px)      | `--leading-normal` (1.5) | Body text, dialog descriptions, inputs            |
| `--text-lg`   | `1.125rem` (18px)  | `--leading-snug` (1.375) | Subheadings, card titles, clock numbers           |
| `--text-xl`   | `1.25rem` (20px)   | `--leading-snug` (1.375) | Section titles, panel headers                     |
| `--text-2xl`  | `1.5rem` (24px)    | `--leading-tight` (1.25) | Modal dialog headings, major status banners       |
| `--text-3xl`  | `1.875rem` (30px)  | `--leading-tight` (1.25) | Large display metrics, player score summaries     |
| `--text-4xl`  | `2.25rem` (36px)   | `--leading-none` (1.0)   | Hero title banner                                 |

---

## 5. Surface & Elevation Layers

1. **Layer 0 (Base Canvas):** `--surface-base` (`#0f172a`). The desktop window background.
2. **Layer 1 (Raised Containers):** `--surface-raised` (`#1e293b`). Main navigation header, move history container, player clock pods.
3. **Layer 2 (Card / Frosted Inset):** `--surface-card` (`rgba(30, 41, 59, 0.75)` with `backdrop-filter: blur(12px)`). Floating option panels, evaluation charts.
4. **Layer 3 (Modal / Dialog Windows):** `--surface-dialog` (`#1e293b` with `--shadow-glass`). High-priority overlays, settings dialog, PGN import/export modals.
5. **Layer 4 (Sunken / Inset Elements):** `--surface-sunken` (`rgba(15, 23, 42, 0.6)`). Input fields, scrollable move lists, status bars.

---

## 6. Interaction & Accessibility Standards

- **Focus Rings:** Always apply `outline: var(--focus-ring)` and `outline-offset: var(--focus-ring-offset)` on `:focus-visible`. Never remove outlines with `outline: none` unless custom replacement focus indicators are present.
- **Disabled Elements:** Disabled buttons must apply `opacity: var(--state-disabled-opacity)` (0.45), set `cursor: not-allowed`, and disable pointer interactions.
- **Windows High Contrast Mode:** Respect `forced-colors: active` by adjusting borders to `ButtonBorder` / `Highlight` and colors to `CanvasText` / `Canvas`.
- **Reduced Motion:** Never trigger unskippable multi-second UI transitions. Respect `@media (prefers-reduced-motion: reduce)` and the `.reduced-motion` class by capping durations at `0.001ms`.
