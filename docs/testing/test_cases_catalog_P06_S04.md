# Test Cases Catalog: Phase 06 · Sprint 04 - Engine Difficulty and Thinking Policy

**Document ID:** `TCC-P06-S04`  
**Phase:** 06 · Stockfish AI  
**Sprint:** 04 · Engine Difficulty and Thinking Policy  
**Author:** SDET Architect  
**Status:** Approved for Implementation

---

## 1. Scope and Strategy

This catalog specifies comprehensive automated unit, invariant, integration, and UI test scenarios for the **Engine Difficulty and Thinking Policy** subsystem. The test suite guarantees:

1. Deterministic configuration across 8 calibrated difficulty levels without stochastic drift.
2. Hard search bounds on depth ($1 \le \text{depth} \le 22$) and thinking time ($300\text{ms} \le \text{movetimeMs} \le 5000\text{ms}$).
3. Zero false Elo claims or deceptive rating numbers.
4. Robust local storage persistence and safe fallback for malformed/corrupted data.
5. Clean UI integration with `NewGameModal` and the game session controller.

---

## 2. Test Cases Specification Matrix

| Test Case ID   | Target Feature / Method               | Test Type          | Scenario Description                                                                                                                                  | Expected Outcome                                                                                            |
| :------------- | :------------------------------------ | :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **TC-DIFF-01** | `DIFFICULTY_PRESETS`                  | Unit / Invariant   | Verify all 8 discrete difficulty levels (1 to 8) are defined with valid labels, skill levels, depths, and movetimes.                                  | Exactly 8 presets exist, sequentially indexed 1 to 8, with distinct identifiers and descriptive labels.     |
| **TC-DIFF-02** | `getEngineDifficultyConfig`           | Unit / Determinism | Request configuration for each level multiple times and check equality.                                                                               | Returns identical, frozen configuration objects for identical level inputs across multiple invocations.     |
| **TC-DIFF-03** | Search Bounding Bounds                | Unit / Bounds      | Check that every difficulty preset satisfies $0 \le \text{skillLevel} \le 20$, $1 \le \text{depth} \le 22$, and $300 \le \text{movetimeMs} \le 5000$. | All presets strictly adhere to search depth and time upper bounds without exception.                        |
| **TC-DIFF-04** | Invalid Level Fallback                | Unit / Robustness  | Query configuration with out-of-range inputs (`0`, `-5`, `9`, `99`, `NaN`, non-integer).                                                              | Safely falls back to default preset (`Level 3: Intermediate`) or clamps to valid range.                     |
| **TC-DIFF-05** | Elo Claim Audit                       | Unit / Integrity   | Verify preset properties and descriptions for absence of uncalibrated numerical FIDE Elo ratings.                                                     | No deceptive exact Elo figures are presented; skill descriptions focus on tactical behavior.                |
| **TC-DIFF-06** | `useEngineDifficulty` Persistence     | Integration        | Change difficulty level via hook and verify synchronization with `localStorage`.                                                                      | Value is persisted to `localStorage` under `chessforge:engine_difficulty_v1` and state updates immediately. |
| **TC-DIFF-07** | Corrupted Storage Recovery            | Integration / Edge | Initialize hook with corrupt `localStorage` values (`"invalid"`, `"{bad: json}"`, `"999"`, `"0"`).                                                    | Hook safely catches error and defaults to Level 3 (`Intermediate`) without throwing unhandled exceptions.   |
| **TC-DIFF-08** | `buildSearchOptions` Policy           | Unit               | Generate `EngineSearchOptions` from a difficulty level and target FEN.                                                                                | Returns `EngineSearchOptions` containing exact `depth`, `movetimeMs`, and `skillLevel` matching the level.  |
| **TC-DIFF-09** | `NewGameModal` UI Difficulty Selector | UI Component       | Open `NewGameModal` in `vs Computer` mode and select difficulty levels.                                                                               | Difficulty selector renders all 8 levels, shows descriptive details, and updates form submission config.    |
| **TC-DIFF-10** | Single-Worker Memory Safety           | Invariant          | Verify difficulty configurations preserve single-thread (`threads: 1`) and bounded hash (`hashSizeMb: 16`).                                           | Memory footprint guarantees remain $< 150\text{MB}$ total application budget.                               |

---

## 3. Test Execution Criteria & Quality Gate

- **Target Test Files:**
  - `src/features/engine/__tests__/difficulty.test.ts`
  - `src/features/engine/__tests__/useEngineDifficulty.test.ts`
  - `src/features/game/__tests__/NewGameModal.test.tsx`
- **Pass Criteria:**
  - 100% test pass rate across all Vitest unit and React component integration tests.
  - Zero test skips (`test.skip`, `it.skip`).
  - Zero typecheck (`tsc --noEmit`) and lint (`npm run lint`) warnings or errors.
  - Zero regression across existing chess domain, board UI, and engine test suites.
