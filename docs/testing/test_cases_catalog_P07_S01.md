# Test Cases Catalog: Phase 07 · Sprint 01 - Clock Domain Model

**Sprint Target:** `Phase 07 · Sprint 01: Clock Domain Model`  
**Document ID:** `docs/testing/test_cases_catalog_P07_S01.md`  
**Author:** SDET Architect  
**Status:** APPROVED FOR IMPLEMENTATION

---

## 1. Test Strategy Overview

This catalog validates the deterministic chess clock domain models and calculations. Testing adheres to **Tier 1 (Pure Unit Tests)** and **Tier 2 (Property-Based Invariant Fuzzing)** of the ChessForge Test Pyramid.

All time operations are tested against deterministic time sources (`DeterministicFakeTimeProvider`) with explicit microsecond/millisecond timestamps, completely eliminating non-deterministic sleeps (`setTimeout`) and wall-clock jitter.

---

## 2. Test Cases Specification

### 2.1 Clock Initialization & Time Controls (TC-CLK-01 to TC-CLK-05)

- **TC-CLK-01: Standard Preset TimeControl Creation & Validation**
  - **Type:** Positive Unit
  - **Inputs:** `1+0`, `2+1`, `3+0`, `3+2`, `5+0`, `5+3`, `10+0`, `10+5`, `15+10`, `30+0`, `unlimited`.
  - **Expected:** Correct `initialMs`, `incrementMs`, `type` classification (bullet/blitz/rapid/classical/none), and human-readable label.
- **TC-CLK-02: Custom TimeControl Builder & Bounds Checking**
  - **Type:** Boundary / Negative
  - **Inputs:** Valid custom (e.g. 7 min + 4 sec inc), negative values (-5 min, -2 sec), zero values, fractional minutes.
  - **Expected:** Clamps/validates inputs safely, returns well-typed `TimeControl` with calculated category.
- **TC-CLK-03: ClockState Initialization (Untimed vs Timed)**
  - **Type:** Positive Unit
  - **Inputs:** Initializing clock with `none` vs timed `5+3`.
  - **Expected:** `status = 'idle'`, `running = false`, `turnStartedAt = null`, `activeColor = null`, `whiteMs = initialMs`, `blackMs = initialMs`, `flaggedColor = null`.
- **TC-CLK-04: Time Remaining Formatting Utilities**
  - **Type:** Positive & Boundary Unit
  - **Inputs:** `180000ms` -> `"3:00"`, `65000ms` -> `"1:05"`, `9400ms` -> `"0:09.4"`, `400ms` -> `"0:00.4"`, `0ms` -> `"0:00.0"`, `3661000ms` -> `"1:01:01"`.
  - **Expected:** Exact string representations matching standard chess clocks with optional sub-second precision below configurable threshold.
- **TC-CLK-05: Category Deduction by Estimated Duration**
  - **Type:** Positive Unit
  - **Formula:** $T_{\text{est}} = \frac{\text{initialMs} + 40 \times \text{incrementMs}}{60000}$
  - **Expected:** `< 3 min` -> `'bullet'`, `3 to < 10 min` -> `'blitz'`, `10 to < 30 min` -> `'rapid'`, `>= 30 min` -> `'classical'`.

---

### 2.2 Time Calculation & Determinism (TC-CLK-06 to TC-CLK-10)

- **TC-CLK-06: Idle / Paused Clock Time Invariance**
  - **Type:** Positive Invariant
  - **Preconditions:** Clock initialized or paused at $T_0$.
  - **Action:** Query remaining time at $T_0 + 5000\text{ ms}$, $T_0 + 100000\text{ ms}$.
  - **Expected:** `whiteMs` and `blackMs` remain unchanged; zero elapsed deduction.
- **TC-CLK-07: Active Turn Time Deduction**
  - **Type:** Positive Unit
  - **Preconditions:** White active from $T_0 = 1000$, initial $180000\text{ ms}$.
  - **Action:** Query at $T_1 = 3500\text{ ms}$ (2500 ms elapsed).
  - **Expected:** White remaining = $177500\text{ ms}$, Black remaining = $180000\text{ ms}$.
- **TC-CLK-08: Inactive Player Time Invariance (INV-CLK-05)**
  - **Type:** Positive Invariant
  - **Action:** Advance time arbitrarily while White is active.
  - **Expected:** Black remaining time does not decrease by even 1 ms.
- **TC-CLK-09: Sub-second Granularity & No Float Rounding Errors**
  - **Type:** Boundary Unit
  - **Inputs:** Timestamps with microsecond fractions or rapid successive queries (1ms, 3ms, 7ms).
  - **Expected:** Exact integer millisecond precision without floating-point accumulation drift.
- **TC-CLK-10: Untimed Clock Handling**
  - **Type:** Positive Unit
  - **Inputs:** `type = 'none'`, active White playing for 10 minutes.
  - **Expected:** `whiteMs = 0`, `blackMs = 0`, `flaggedColor = null`, `status = 'running'`.

---

### 2.3 Turn Switching & Fischer Increment (TC-CLK-11 to TC-CLK-15)

- **TC-CLK-11: Turn Switch without Increment (3+0)**
  - **Type:** Positive Unit
  - **Action:** White starts at $T=0$ ($180000\text{ ms}$), moves at $T=4000\text{ ms}$.
  - **Expected:** White banked becomes $176000\text{ ms}$, `activeColor = 'black'`, `turnStartedAt = 4000`, `moveCount.white = 1`.
- **TC-CLK-12: Turn Switch with Fischer Increment (3+2)**
  - **Type:** Positive Unit
  - **Action:** White starts at $T=0$ ($180000\text{ ms}$), moves at $T=3500\text{ ms}$.
  - **Expected:** White banked becomes $180000 - 3500 + 2000 = 178500\text{ ms}$.
- **TC-CLK-13: Rapid Move with Increment Exceeding Elapsed**
  - **Type:** Positive Unit
  - **Action:** Move executed in $500\text{ ms}$ with $+2000\text{ ms}$ increment.
  - **Expected:** Banked time increases net $+1500\text{ ms}$ above previous banked time (time accumulation permitted under standard FIDE Fischer rules).
- **TC-CLK-14: Turn Switch Alternation Sequence**
  - **Type:** Integration Sequence
  - **Action:** White (3s) -> Black (5s) -> White (2s) -> Black (4s) with $+1\text{s}$ increment.
  - **Expected:** Exact time tracking across 4 plies; move counts increment accurately (`white: 2`, `black: 2`).
- **TC-CLK-15: Flagged Move Switch Denial (INV-CLK-03)**
  - **Type:** Boundary / Negative
  - **Action:** White has $3000\text{ ms}$ remaining, attempts move completion at $T = 3001\text{ ms}$ with $+2000\text{ ms}$ increment.
  - **Expected:** White flags at $T=3000$; `status = 'flagged'`, `flaggedColor = 'white'`, `whiteMs = 0`, no $+2000\text{ ms}$ increment awarded.

---

### 2.4 Timeout Detection & Flag Fall (TC-CLK-16 to TC-CLK-20)

- **TC-CLK-16: Mid-Turn Timeout Check (`checkTimeout`)**
  - **Type:** Positive Unit
  - **Preconditions:** White active with $5000\text{ ms}$, $T_0 = 1000$.
  - **Action:** Query `checkTimeout` at $T = 6001\text{ ms}$.
  - **Expected:** Returns state with `status = 'flagged'`, `flaggedColor = 'white'`, `running = false`, `whiteMs = 0`.
- **TC-CLK-17: Exactly Zero Milliseconds Boundary**
  - **Type:** Boundary Unit
  - **Action:** Check at $T = 6000\text{ ms}$ ($5000\text{ ms}$ elapsed).
  - **Expected:** `remaining = 0`, triggers `flaggedColor = 'white'`, `status = 'flagged'`.
- **TC-CLK-18: Flagged State Immutability (INV-CLK-04)**
  - **Type:** Negative Invariant
  - **Preconditions:** Clock is flagged.
  - **Action:** Attempt `switchTurn`, `pauseClock`, `resumeClock`.
  - **Expected:** Rejects state modifications or returns unchanged flagged state.
- **TC-CLK-19: Simultaneous Flag Prevention**
  - **Type:** Invariant
  - **Action:** Verify only the active color can flag; opponent never flags while inactive.
  - **Expected:** Exactly one `flaggedColor` set upon flag fall.
- **TC-CLK-20: Manual Time Addition / Adjudication (`addTime`)**
  - **Type:** Positive Unit
  - **Action:** Arbiter/Engine penalty adds $+15000\text{ ms}$ to Black.
  - **Expected:** Black time increases cleanly without affecting active turn elapsed calculations.

---

### 2.5 Time Providers & Controller Integration (TC-CLK-21 to TC-CLK-23)

- **TC-CLK-21: DeterministicFakeTimeProvider API**
  - **Type:** Positive Unit
  - **Methods:** `now()`, `advanceBy(ms)`, `setTime(ms)`.
  - **Expected:** Monotonic controllable timestamps for deterministic testing.
- **TC-CLK-22: SystemTimeProvider High-Resolution Fallback**
  - **Type:** Positive Unit
  - **Expected:** Returns monotonic increasing numbers based on `performance.now()`.
- **TC-CLK-23: ClockController State Subscription & Lifecycle**
  - **Type:** Integration
  - **Action:** Initialize `ClockController`, start clock, step fake time provider, subscribe to listener callbacks, switch turns, trigger timeout.
  - **Expected:** Listener receives updated states on events; controller encapsulates pure engine operations cleanly.

---

### 2.6 Property-Based Generative Invariant Fuzzing (TC-CLK-24 & TC-CLK-25)

- **TC-CLK-24: Property Fuzzing: Monotonicity & Invariant Preservation (fast-check)**
  - **Iterations:** 1,000 randomized move and timestamp sequences.
  - **Invariants Verified:**
    - Non-negativity: $\text{remaining}_{\text{white}} \ge 0 \land \text{remaining}_{\text{black}} \ge 0$.
    - Inactive invariance: Opponent time unchanged across ply.
    - Determinism: Repeated queries at identical fake timestamp yield identical state.
- **TC-CLK-25: Property Fuzzing: Fischer Increment & Zero-Drift Conservation**
  - **Iterations:** 1,000 randomized game sessions with arbitrary valid time controls.
  - **Invariant:**
    $$\sum \text{elapsed}_{\text{white}} + \text{remaining}_{\text{white}} = \text{initialMs} + \text{completedMoves}_{\text{white}} \times \text{incrementMs}$$
    (holding true for all unflagged games).

---

## 3. SDET Gate Approval

This catalog covers 100% of the functional scope and invariants specified in the Phase 07 Sprint 01 Plan. Proceed with production implementation.
