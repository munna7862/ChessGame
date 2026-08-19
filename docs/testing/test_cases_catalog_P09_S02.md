# Test Cases Catalog: Board Themes & Piece Sets

**Sprint:** Phase 09 · Sprint 02  
**Feature:** Board Themes and Piece Sets Visual Subsystem  
**Author:** SDET Architect  
**Status:** Approved for Implementation

---

## 1. Overview & Test Objectives

This test catalog verifies the functionality, visual invariants, accessibility contrast ratios, persistence behavior, and isolation boundaries for board visual themes and vector piece set styles in ChessForge.

---

## 2. Test Cases Matrix

| Test ID     | Category                     | Description                                                                                                                  | Verification Method     | Expected Outcome                                                                                                         |
| :---------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `TC-THM-01` | Theme Registry               | Verify all 6 board themes are defined with valid hex color tokens in `tokens.ts` and `tokens.css`.                           | Vitest Unit Test        | All themes (`classic`, `wood`, `slate`, `ocean`, `emerald`, `midnight`) provide valid hex codes for squares and borders. |
| `TC-THM-02` | Theme Contrast               | Verify light vs dark square color contrast meets legibility standards ($\ge 2.0:1$ square ratio, high contrast with pieces). | Vitest Invariant Test   | All light/dark square pairs have distinct luminance values.                                                              |
| `TC-THM-03` | Piece Set Registry           | Verify all 3 piece sets (`standard`, `classic`, `modern`) define full 12 piece SVG components (6 white, 6 black).            | Vitest Unit Test        | `PIECE_SET_SVG_MAP` contains all piece combinations for every supported piece set.                                       |
| `TC-THM-04` | Piece Rendering              | Verify `Piece` component dynamically renders correct SVG elements when given different `pieceSet` values.                    | React Testing Library   | Piece container mounts appropriate SVG element with testid, aria-label, and color/type attributes.                       |
| `TC-THM-05` | Board Theme Application      | Verify `Board` component attaches `data-board-theme` and `board-theme-<id>` class on root wrapper.                           | React Testing Library   | Board reflects active theme immediately upon prop change.                                                                |
| `TC-THM-06` | Board Piece Set Application  | Verify `Board` and `Square` pass active `pieceSet` down to all rendered chess pieces.                                        | React Testing Library   | All 64 squares render pieces with selected piece set style.                                                              |
| `TC-THM-07` | State Indicators Visibility  | Verify legal move dots, capture rings, selection outlines, and check indicators remain visible on all themes.                | Vitest CSS / DOM Test   | Indicator elements have high z-index and distinct contrast across themes.                                                |
| `TC-THM-08` | Settings UI Selection        | Verify selecting a theme or piece set in `AppearanceSettingsSection` dispatches update to `useSettings`.                     | React Testing Library   | Clicking theme card calls `setBoardTheme`; clicking piece set card calls `setPieceSet`.                                  |
| `TC-THM-09` | Settings UI Previews         | Verify theme preview swatches and piece sample glyphs render with active badge on currently selected options.                | React Testing Library   | Active theme and piece set cards show `Active` badge and `aria-checked="true"`.                                          |
| `TC-THM-10` | Settings Persistence         | Verify changing theme or piece set persists to `SettingsService` and reloads on next session.                                | Vitest Integration Test | Settings state matches persisted values across storage reload.                                                           |
| `TC-THM-11` | Promotion Dialog Integration | Verify `PromotionDialog` renders piece options using the active `pieceSet`.                                                  | React Testing Library   | Promotion choice buttons show Queen/Rook/Bishop/Knight in selected piece set.                                            |
| `TC-THM-12` | Captured Pieces Tray         | Verify captured piece counts / icons render in matching piece set style.                                                     | React Testing Library   | Captured piece displays match board piece style.                                                                         |
| `TC-THM-13` | Fallback Invariant           | Verify invalid piece set defaults gracefully to `standard` without throwing or blanking board.                               | Vitest Unit Test        | Graceful fallback renders standard vector SVG.                                                                           |
| `TC-THM-14` | E2E Theme Switching          | Verify user can open Settings, switch board theme and piece set, and see immediate board update.                             | Playwright E2E Test     | App renders updated theme classes and piece set attributes.                                                              |

---

## 3. Quality Gate Thresholds

- **Unit & Integration Tests:** 100% Pass (0 skips, 0 failures)
- **Typecheck (`tsc --noEmit`):** 0 errors
- **Linting (`eslint`):** 0 errors, 0 warnings
- **Formatting (`prettier`):** 100% compliant
- **E2E Playout (`playwright`):** 100% Pass
- **Build (`npm run build`):** Clean exit
