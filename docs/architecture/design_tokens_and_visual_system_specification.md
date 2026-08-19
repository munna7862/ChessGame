# ChessForge Design Tokens & Visual System Architecture Specification

## Document Metadata

- **Document ID:** `SPEC-DES-09-01`
- **Phase:** 09 (UX Polish & Accessibility)
- **Sprint:** 01 (Design Tokens and Visual System)
- **Status:** **APPROVED FOR IMPLEMENTATION**
- **Author:** Chess Domain Architect & Dev Architect
- **Target Audience:** Frontend Engineers, SDETs, UI Designers, Security Officers

---

## 1. Executive Summary & Design Principles

The visual foundation of **ChessForge** is engineered to provide an elegant, distraction-free, professional Windows desktop chess experience. The visual hierarchy adheres to three non-negotiable core tenets:

1. **Board Dominance:** The 8x8 chessboard and chess pieces remain the undisputed focal point of the viewport. Surrounding UI chrome (sidebar panels, timers, navigation, modal dialogs) uses subdued dark slate tones (`#0f172a` to `#1e293b`) with restrained accent cues.
2. **Zero Inconsistent Ad-Hoc Styling:** All color values, spacing dimensions, typography scales, border radii, elevation shadows, and interaction states are defined as centralized CSS Custom Properties in `src/theme/tokens.css` and strongly-typed TypeScript constants in `src/theme/tokens.ts`.
3. **Accessibility by Construction:** Focus rings, contrast ratios ($> 4.5:1$ for normal text, $> 3:1$ for large text and UI components), non-color-reliant state indicators (e.g., check/checkmate badges), and reduced-motion fallbacks are built directly into the token contract.

---

## 2. Requirements Baseline (`REQ-TOK-01` to `REQ-TOK-08`)

| Requirement ID   | Domain Area                        | Specification Description                                                                                                                                      |
| :--------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`REQ-TOK-01`** | **Spacing Scale**                  | Standardized 4px-based geometric spacing scale (`--space-0` to `--space-16`) across all margins, paddings, and layout gaps.                                    |
| **`REQ-TOK-02`** | **Typography Scale**               | Clean native system sans-serif and monospace font stacks with defined size steps (`--text-xs` to `--text-4xl`), font weights, and line heights.                |
| **`REQ-TOK-03`** | **Surface Hierarchy & Elevations** | 5-tier elevation model (`--surface-base`, `--surface-raised`, `--surface-card`, `--surface-dialog`, `--surface-sunken`) with calibrated elevation box-shadows. |
| **`REQ-TOK-04`** | **Border & Radius Rules**          | Consistent radius scale (`--radius-none` to `--radius-full`) and border-width/color tokens for consistent container edges.                                     |
| **`REQ-TOK-05`** | **Interaction & State Tokens**     | Centralized hover, active, focus-visible (`--focus-ring`), and disabled state tokens with WCAG AA compliance.                                                  |
| **`REQ-TOK-06`** | **Semantic Status Colors**         | Semantic status palettes (`success`, `warning`, `danger`, `info`) with distinct background, border, text, and glow variants.                                   |
| **`REQ-TOK-07`** | **Board Theme Tokens**             | Standardized theme tokens across all 4 built-in board themes (`classic`, `wood`, `slate`, `ocean`) for square highlights, legal targets, captures, and check.  |
| **`REQ-TOK-08`** | **TypeScript Type Safety**         | Export strongly-typed immutable TypeScript tokens object (`DESIGN_TOKENS`) with theme token schema validators and accessor helpers.                            |

---

## 3. Comprehensive Token Definitions

### 3.1 Spacing Scale (`4px` Base Grid)

```css
:root {
  --space-0: 0px;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

### 3.2 Typography System

```css
:root {
  /* Font Families */
  --font-sans:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;

  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.8125rem; /* 13px */
  --text-base: 0.875rem; /* 14px */
  --text-md: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}
```

### 3.3 Surface Hierarchy & Elevation Shadows

```css
:root {
  /* Surface Colors */
  --surface-base: #0f172a; /* Deep slate background */
  --surface-raised: #1e293b; /* Container panels, headers */
  --surface-card: rgba(30, 41, 59, 0.75); /* Frosted cards */
  --surface-dialog: #1e293b; /* Modals and dialog windows */
  --surface-sunken: rgba(15, 23, 42, 0.6); /* Inset controls and status bars */
  --surface-accent: #334155; /* Hover surfaces and active buttons */

  /* Text Color Tokens */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-inverse: #0f172a;

  /* Elevation Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.25);
  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.25);
  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --shadow-xl:
    0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --shadow-board:
    0 20px 25px -5px rgba(0, 0, 0, 0.55), 0 8px 10px -6px rgba(0, 0, 0, 0.45);
}
```

### 3.4 Border & Corner Radius Rules

```css
:root {
  /* Radii */
  --radius-none: 0px;
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Border Widths */
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;

  /* Border Colors */
  --border-subtle: rgba(148, 163, 184, 0.1);
  --border-default: rgba(148, 163, 184, 0.2);
  --border-strong: rgba(148, 163, 184, 0.35);
  --border-interactive: rgba(56, 189, 248, 0.4);
}
```

### 3.5 State & Status Tokens

```css
:root {
  /* Brand & Accent */
  --accent-cyan: #38bdf8;
  --accent-emerald: #34d399;
  --accent-amber: #fbbf24;
  --accent-indigo: #818cf8;
  --accent-blue: #60a5fa;

  /* Semantic Status: Success */
  --color-success: #34d399;
  --color-success-bg: rgba(52, 211, 153, 0.15);
  --color-success-border: rgba(52, 211, 153, 0.35);

  /* Semantic Status: Warning */
  --color-warning: #fbbf24;
  --color-warning-bg: rgba(251, 191, 36, 0.15);
  --color-warning-border: rgba(251, 191, 36, 0.35);

  /* Semantic Status: Danger */
  --color-danger: #f87171;
  --color-danger-bg: rgba(239, 68, 68, 0.2);
  --color-danger-border: rgba(239, 68, 68, 0.4);

  /* Semantic Status: Info / Brand */
  --color-info: #38bdf8;
  --color-info-bg: rgba(56, 189, 248, 0.15);
  --color-info-border: rgba(56, 189, 248, 0.35);

  /* Focus & Accessibility */
  --focus-ring: 3px solid #38bdf8;
  --focus-ring-offset: -2px;
  --state-disabled-opacity: 0.45;
}
```

### 3.6 Board Theme Tokens Specification

Each board theme exposes a cohesive set of variables configured on data attributes `[data-board-theme="..."]`:

```css
/* Classic Theme */
[data-board-theme="classic"],
.board-theme-classic {
  --board-bg: #1e293b;
  --board-border: #334155;
  --square-light-bg: #e2e8f0;
  --square-light-text: #475569;
  --square-dark-bg: #64748b;
  --square-dark-text: #cbd5e1;
}

/* Wood Theme */
[data-board-theme="wood"],
.board-theme-wood {
  --board-bg: #38220f;
  --board-border: #5c3818;
  --square-light-bg: #f0d9b5;
  --square-light-text: #8c6747;
  --square-dark-bg: #b58863;
  --square-dark-text: #f0d9b5;
}

/* Slate Theme */
[data-board-theme="slate"],
.board-theme-slate {
  --board-bg: #0f172a;
  --board-border: #1e293b;
  --square-light-bg: #cbd5e1;
  --square-light-text: #334155;
  --square-dark-bg: #475569;
  --square-dark-text: #94a3b8;
}

/* Ocean Theme */
[data-board-theme="ocean"],
.board-theme-ocean {
  --board-bg: #0c2340;
  --board-border: #164e63;
  --square-light-bg: #cbe4f9;
  --square-light-text: #155e75;
  --square-dark-bg: #2e5b88;
  --square-dark-text: #e0f2fe;
}
```

---

## 4. Component Styling Conventions

1. **Class-Based Encapsulation with CSS Modules / Scoped CSS:**
   - Every feature component keeps its styles centralized and mapped to semantic design token custom properties.
2. **Never Hardcode Hex Values in Component CSS:**
   - Raw color values like `#0f172a` or `#38bdf8` must not be scattered inside button or panel rules; use `var(--surface-base)` or `var(--accent-cyan)`.
3. **Focus States:**
   - All interactive elements must implement `:focus-visible` with `var(--focus-ring)` to ensure keyboard navigation clarity.
4. **Motion Fallback:**
   - All animations must respect `@media (prefers-reduced-motion: reduce)` and the explicit `.reduced-motion` class setting.

---

## 5. Architectural Verification & Sign-off

- [x] Spacing scale formalized on 4px grid.
- [x] Typography system formalized for sans and mono stacks.
- [x] Surface hierarchy established for dark-mode desktop app.
- [x] Border and radius rules categorized.
- [x] Interactive states, focus indicators, and semantic colors defined.
- [x] Board theme tokens verified for all 4 supported themes.
- [x] Handed off to SDET Architect for Test Cases Catalog creation.
