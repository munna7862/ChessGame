# Test Cases Catalog: Phase 09 · Sprint 01 - Design Tokens & Visual System

## Document Metadata

- **Document ID:** `TEST-CAT-P09-S01`
- **Phase:** 09 (UX Polish & Accessibility)
- **Sprint:** 01 (Design Tokens and Visual System)
- **Author:** SDET Architect
- **Target Implementation:** `src/theme/tokens.css`, `src/theme/tokens.ts`, `src/theme/types.ts`, `src/index.css`, `src/App.css`
- **Test Suites:** `src/theme/__tests__/tokens.test.ts`, `src/theme/__tests__/visualSystemInvariants.test.ts`

---

## 1. Test Strategy & Quality Gate Invariants

The design tokens and visual system form the aesthetic and architectural bedrock of ChessForge. The test suite guarantees:

1. **Token Completeness:** Every required design token across spacing, typography, surfaces, borders, states, semantic colors, and board themes is defined and non-empty.
2. **TypeScript & CSS Synchronization:** The strongly-typed TypeScript `DESIGN_TOKENS` constant matches the CSS custom property names and values defined in `:root`.
3. **WCAG Contrast Ratios:** Text colors on respective surface tokens meet minimum WCAG AA contrast requirements.
4. **Theme Parity:** All four board themes (`classic`, `wood`, `slate`, `ocean`) provide complete token coverage for light squares, dark squares, borders, and overlays.
5. **No Regressions:** Existing board rendering, modals, clocks, and settings components continue to function with 100% green tests.

---

## 2. Test Cases Catalog (`TC-TOK-01` to `TC-TOK-16`)

| Test ID         | Category    | Description                                                                     | Verification Method | Expected Result                                                                                         |
| :-------------- | :---------- | :------------------------------------------------------------------------------ | :------------------ | :------------------------------------------------------------------------------------------------------ |
| **`TC-TOK-01`** | Spacing     | Verify 4px geometric spacing scale (`--space-0` through `--space-16`)           | Unit Test           | All 11 spacing steps defined with correct rem/px values.                                                |
| **`TC-TOK-02`** | Typography  | Verify sans-serif and monospace font family stacks                              | Unit Test           | Native OS system font fallbacks present with sans and mono definitions.                                 |
| **`TC-TOK-03`** | Typography  | Verify font size scale (`--text-xs` to `--text-4xl`), weights, and line heights | Unit Test           | Scale steps monotonically increase and weights match standard numeric values.                           |
| **`TC-TOK-04`** | Surfaces    | Verify 5-tier surface hierarchy tokens                                          | Unit Test           | `--surface-base`, `--surface-raised`, `--surface-card`, `--surface-dialog`, `--surface-sunken` defined. |
| **`TC-TOK-05`** | Elevations  | Verify elevation shadow tokens (`--shadow-sm` to `--shadow-board`)              | Unit Test           | 6 elevation shadow levels defined with valid rgba drop shadows.                                         |
| **`TC-TOK-06`** | Radii       | Verify border radius scale (`--radius-none` to `--radius-full`)                 | Unit Test           | 7 radius steps defined correctly from `0px` to `9999px`.                                                |
| **`TC-TOK-07`** | Borders     | Verify border widths and border color tiers                                     | Unit Test           | `--border-width-*` and `--border-subtle/default/strong/interactive` defined.                            |
| **`TC-TOK-08`** | States      | Verify focus ring and interaction state tokens                                  | Unit Test           | `--focus-ring` (3px solid #38bdf8), `--focus-ring-offset`, disabled opacity (0.45).                     |
| **`TC-TOK-09`** | Semantics   | Verify status palettes (success, warning, danger, info)                         | Unit Test           | Background, border, and text tokens defined for all 4 statuses.                                         |
| **`TC-TOK-10`** | Themes      | Verify Classic board theme token definitions                                    | Unit Test           | `--board-bg`, `--board-border`, `--square-light-bg/text`, `--square-dark-bg/text` defined.              |
| **`TC-TOK-11`** | Themes      | Verify Wood board theme token definitions                                       | Unit Test           | Wood palette tokens correctly defined.                                                                  |
| **`TC-TOK-12`** | Themes      | Verify Slate board theme token definitions                                      | Unit Test           | Slate palette tokens correctly defined.                                                                 |
| **`TC-TOK-13`** | Themes      | Verify Ocean board theme token definitions                                      | Unit Test           | Ocean palette tokens correctly defined.                                                                 |
| **`TC-TOK-14`** | Type Safety | Verify TypeScript `DESIGN_TOKENS` object structure and immutability             | Unit Test           | Deeply frozen or typed const object with full property tree.                                            |
| **`TC-TOK-15`** | DOM / CSS   | Verify CSS variables injection and availability in document `:root`             | DOM Integration     | `getComputedStyle(document.documentElement)` or CSS parsing validates all variables.                    |
| **`TC-TOK-16`** | A11y        | Verify high contrast and reduced motion override rules                          | Integration Test    | Media queries and `.reduced-motion` classes properly suppress animations and enforce visible borders.   |

---

## 3. Automation Sign-off Gate

- [x] Test cases mapped 1-to-1 with requirements `REQ-TOK-01` through `REQ-TOK-08`.
- [x] Pass/fail criteria established.
- [x] Handed off to Dev Architect / Senior SDE for production implementation.
