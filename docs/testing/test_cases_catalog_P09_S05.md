# Test Cases Catalog: Error, Loading & Empty States

**Sprint:** Phase 09 · Sprint 05  
**Document:** `docs/testing/test_cases_catalog_P09_S05.md`  
**Status:** Approved  
**Author:** SDET Architect

---

## 1. Overview & Verification Scope

This test catalog establishes rigorous test cases covering all failure modes, loading indicators, and empty states defined in `docs/architecture/error_loading_and_empty_states_specification.md`. Tests span Unit, Invariant, Integration, and E2E tiers.

---

## 2. Detailed Test Cases

### 2.1 Error Boundary & Component Resilience

| Test ID         | Category           | Scenario & Steps                                                                    | Expected Result                                                                                                                                        |
| :-------------- | :----------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`TC-ERR-01`** | Unit / UI          | Render component that throws an uncaught rendering error inside `ErrorBoundary`.    | ErrorBoundary catches error, renders `ErrorBoundaryFallback` with friendly title, hides raw stack trace from main view, and displays recovery actions. |
| **`TC-ERR-02`** | Unit / UI          | Trigger "Try Again" button in `ErrorBoundaryFallback` after transient error clears. | Error state resets and successfully renders child components.                                                                                          |
| **`TC-ERR-03`** | Unit / Integration | Click "Copy Diagnostic Info" button in `ErrorBoundaryFallback`.                     | Redacted diagnostic metadata (timestamp, error name, OS platform, app version) is written to `navigator.clipboard`.                                    |
| **`TC-ERR-04`** | Integration        | Simulate Stockfish worker error / crash during an engine game.                      | `EngineErrorBanner` appears, engine turn lock is released, and user can click "Retry Engine" or "Switch to 2 Players".                                 |

### 2.2 Input Validation & State Immutability

| Test ID         | Category           | Scenario & Steps                                                                                          | Expected Result                                                                                                                                    |
| :-------------- | :----------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`TC-ERR-05`** | Integration        | Submit invalid PGN string (e.g. `1. e5`, bad tokens, syntax errors) in `PgnImportModal`.                  | Modal shows prominent error alert describing the validation error. Active `GameSession` and `ChessGame` position remain 100% unchanged.            |
| **`TC-ERR-06`** | Integration        | Submit invalid FEN strings (e.g. `invalid_fen`, 7 ranks, missing kings, kings adjacent) in `FenModal`.    | Validation error message displayed in modal. Current game state remains untouched.                                                                 |
| **`TC-ERR-07`** | Integration / Unit | Corrupt stored game in `localStorage` with invalid JSON or schema violations and mount `useGameRecovery`. | Error is caught, logged to diagnostics, modal or fallback handles gracefully, and application launches into a clean default game without throwing. |
| **`TC-ERR-08`** | Unit / UI          | Render `Piece` with non-existent piece set or malformed piece model.                                      | Component falls back to Unicode chess glyph or `?` symbol without crashing or throwing render exceptions.                                          |

### 2.3 Loading Indicators

| Test ID          | Category         | Scenario & Steps                                      | Expected Result                                                                                                       |
| :--------------- | :--------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **`TC-LOAD-01`** | Integration / UI | Set engine to thinking mode in `PlayerPanel`.         | Thinking spinner / pulse animation and "Thinking..." text are displayed. Cancel button is interactive and responsive. |
| **`TC-LOAD-02`** | Unit / UI        | PGN import with slow / async file reading simulation. | Loading indicator is presented while reading file content.                                                            |

### 2.4 Contextual Empty States

| Test ID           | Category         | Scenario & Steps                                                  | Expected Result                                                                                                                             |
| :---------------- | :--------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **`TC-EMPTY-01`** | UI / Component   | Mount `MoveHistoryPanel` on a newly created game with 0 moves.    | Renders clean empty state banner ("No moves yet. Make a move on the board or press Ctrl+N for a new game") with keyboard shortcut guidance. |
| **`TC-EMPTY-02`** | UI / Component   | Mount `CapturedPiecesView` with 0 captured pieces for both sides. | Renders clean placeholder container maintaining baseline layout height without layout shift.                                                |
| **`TC-EMPTY-03`** | UI / Integration | Open `PgnExportModal` on a 0-move game.                           | Displays valid 0-move PGN text and indicates empty move history cleanly.                                                                    |

### 2.5 End-to-End Automation

| Test ID             | Category    | Scenario & Steps                                                                                                                                      | Expected Result                                                                                  |
| :------------------ | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **`TC-E2E-ERR-01`** | Desktop E2E | Load application, verify empty move history state, import invalid PGN, verify error message, dismiss, make valid move, verify empty state disappears. | Full end-to-end user workflow succeeds with clean error feedback and seamless state transitions. |

---

## 3. Quality Gate Thresholds

- **Unit & Integration:** 100% Pass across Vitest suites.
- **Coverage:** Zero untested error branch paths in new/modified components.
- **No Skips / Suppressions:** Strict compliance with AGENTS.md rule 6.
