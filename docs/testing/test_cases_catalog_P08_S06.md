# Test Cases Catalog: Phase 08 · Sprint 06 (Settings UI)

**Sprint:** Phase 08 · Sprint 06  
**Document Version:** 1.0.0  
**Author:** SDET Architect  
**Status:** APPROVED

---

## 1. Overview & Scope

This catalog formalizes the test matrix for the ChessForge Settings UI component and integration suite. The tests validate modal lifecycle, category tab navigation, interactive control bindings, persistence integration, reset confirmation safety, and accessibility conformance.

---

## 2. Test Cases Matrix

| Test ID           | Category      | Description                     | Inputs / Preconditions                                             | Expected Outcome                                           | Verification Tier |
| :---------------- | :------------ | :------------------------------ | :----------------------------------------------------------------- | :--------------------------------------------------------- | :---------------- |
| **`TC-SETUI-01`** | Lifecycle     | Modal opens via Header trigger  | Click `btn-open-settings`                                          | Modal dialog rendered with `role="dialog"`                 | Tier 4 (RTL)      |
| **`TC-SETUI-02`** | Lifecycle     | Modal closes via Close button   | Click `btn-close-settings`                                         | `onClose` callback fired, modal unrendered                 | Tier 4 (RTL)      |
| **`TC-SETUI-03`** | Lifecycle     | Modal closes via Escape key     | Press `Escape`                                                     | `onClose` callback fired                                   | Tier 4 (RTL)      |
| **`TC-SETUI-04`** | Lifecycle     | Modal closes via Backdrop click | Click backdrop area                                                | `onClose` callback fired                                   | Tier 4 (RTL)      |
| **`TC-SETUI-05`** | Navigation    | Tab switching                   | Click category tabs (Appearance, Gameplay, Audio & Motion, Engine) | Active panel renders corresponding controls                | Tier 4 (RTL)      |
| **`TC-SETUI-06`** | Appearance    | Board theme selection           | Select `wood` / `slate` / `ocean` / `classic`                      | `setBoardTheme` called, theme updated in context           | Tier 4 (RTL)      |
| **`TC-SETUI-07`** | Appearance    | Piece set selection             | Select `classic` / `modern` / `standard`                           | `setPieceSet` called, pieceSet updated in context          | Tier 4 (RTL)      |
| **`TC-SETUI-08`** | Gameplay      | Coordinates toggle              | Toggle `switch-coordinates`                                        | `setShowCoordinates` called with inverted boolean          | Tier 4 (RTL)      |
| **`TC-SETUI-09`** | Gameplay      | Legal moves toggle              | Toggle `switch-legal-moves`                                        | `setShowLegalMoves` called with inverted boolean           | Tier 4 (RTL)      |
| **`TC-SETUI-10`** | Gameplay      | Last move toggle                | Toggle `switch-last-move`                                          | `setShowLastMove` called with inverted boolean             | Tier 4 (RTL)      |
| **`TC-SETUI-11`** | Gameplay      | Auto-queen toggle               | Toggle `switch-auto-queen`                                         | `setAutoQueen` called with inverted boolean                | Tier 4 (RTL)      |
| **`TC-SETUI-12`** | Audio         | Sound effect toggle             | Toggle `switch-sound`                                              | `setSoundEnabled` called with inverted boolean             | Tier 4 (RTL)      |
| **`TC-SETUI-13`** | Audio         | Volume slider                   | Change slider to 45                                                | `setVolume` called with 45, display reads 45%              | Tier 4 (RTL)      |
| **`TC-SETUI-14`** | Motion        | Reduced motion toggle           | Toggle `switch-reduced-motion`                                     | `setReducedMotion` called with inverted boolean            | Tier 4 (RTL)      |
| **`TC-SETUI-15`** | Engine        | Difficulty slider               | Change slider to 6                                                 | `setEngineDifficulty` called with 6, displays Level 6 info | Tier 4 (RTL)      |
| **`TC-SETUI-16`** | Reset         | Open reset confirmation         | Click `btn-reset-settings`                                         | Confirmation modal appears                                 | Tier 4 (RTL)      |
| **`TC-SETUI-17`** | Reset         | Confirm reset                   | Confirm reset modal                                                | `resetSettings()` invoked, default values restored         | Tier 4 (RTL)      |
| **`TC-SETUI-18`** | Reset         | Cancel reset                    | Cancel reset modal                                                 | Dialog dismissed, modified settings preserved              | Tier 4 (RTL)      |
| **`TC-SETUI-19`** | Accessibility | ARIA attributes & labels        | Inspect DOM elements                                               | `aria-modal="true"`, `aria-labelledby`, accessible labels  | Tier 4 (RTL)      |
| **`TC-SETUI-20`** | Integration   | Board style application         | Mount `App` with customized settings                               | Board reflects theme class, coordinate visibility, motion  | Tier 4 (RTL)      |

---

## 3. Pass / Fail Criteria

1. 100% test pass rate across all test cases.
2. Zero flaky timers or async timeouts (`vi.useFakeTimers()` used where applicable).
3. Zero untyped `any` or `@ts-ignore` overrides.
4. Clean TypeScript typechecking and zero ESLint warnings.
