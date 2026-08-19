# Test Cases Catalog: Phase 07 · Sprint 02 (Clock UI and Presets)

**Document Version:** 1.0.0  
**Phase:** Phase 07 (Clocks & Game Modes)  
**Sprint:** Sprint 02 (Clock UI and Presets)  
**Author:** SDET Architect  
**Status:** Approved for Implementation

---

## 1. Scope & Strategy

This test catalog specifies the unit, component, accessibility, and integration test coverage for the Clock UI, preset selection, custom time configuration, low-time warning indicators, and `useClock` lifecycle.

---

## 2. Test Cases Specification

### 2.1 Clock Display Component (`TC-CLK-UI-01` to `TC-CLK-UI-08`)

| Test ID        | Category       | Scenario / Description                                                                         | Expected Result                                                                                          |
| :------------- | :------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `TC-CLK-UI-01` | Component      | Standard time rendering $\ge 10\text{s}$ (e.g. 180,000ms $\to$ `3:00`, 75,000ms $\to$ `1:15`). | Formats as `MM:SS` with tabular digits.                                                                  |
| `TC-CLK-UI-02` | Component      | Sub-10-second scramble rendering (e.g. 9,450ms $\to$ `0:09.4`, 2,100ms $\to$ `0:02.1`).        | Displays tenths of a second precision (`0:0X.X`).                                                        |
| `TC-CLK-UI-03` | Component      | Classical long-duration rendering $\ge 1\text{ hour}$ (e.g. 3,725,000ms $\to$ `1:02:05`).      | Displays `H:MM:SS` format.                                                                               |
| `TC-CLK-UI-04` | Visual State   | Active turn highlight when `isActive={true}`.                                                  | Renders active CSS class (`clock-display--active`), high-contrast border, and active status icon.        |
| `TC-CLK-UI-05` | Visual State   | Inactive / paused state when `isActive={false}`.                                               | Renders inactive styling without glowing borders or active badge.                                        |
| `TC-CLK-UI-06` | Non-Color A11y | Low-time state warning when remaining time $< 20\text{s}$.                                     | Renders low-time CSS class, dashed/pulsing warning border, and explicit non-color badge (`⚠️ LOW TIME`). |
| `TC-CLK-UI-07` | Flag Fall      | Expired time (0ms).                                                                            | Displays `0:00.0` and expired visual state (`clock-display--expired`).                                   |
| `TC-CLK-UI-08` | Accessibility  | ARIA semantics verification.                                                                   | Has `role="timer"`, descriptive `aria-label`, and `aria-live="off"`.                                     |

### 2.2 Time Control Selector Component (`TC-CLK-UI-09` to `TC-CLK-UI-16`)

| Test ID        | Category     | Scenario / Description                                               | Expected Result                                                                  |
| :------------- | :----------- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `TC-CLK-UI-09` | Preset Grid  | Selecting Bullet presets (1+0, 2+1).                                 | Fires `onChange` callback with valid Bullet `TimeControl` object.                |
| `TC-CLK-UI-10` | Preset Grid  | Selecting Blitz presets (3+0, 3+2, 5+0, 5+3).                        | Fires `onChange` callback with valid Blitz `TimeControl` object.                 |
| `TC-CLK-UI-11` | Preset Grid  | Selecting Rapid & Classical presets (10+0, 10+5, 15+10, 30+0).       | Fires `onChange` callback with valid Rapid/Classical `TimeControl`.              |
| `TC-CLK-UI-12` | Untimed Mode | Selecting "Unlimited (Untimed)" preset.                              | Fires `onChange` callback with `{ type: "none", initialMs: 0, incrementMs: 0 }`. |
| `TC-CLK-UI-13` | Custom Setup | Entering valid custom time (e.g. 7 min base, 3 sec increment).       | Dynamically categorizes as Blitz and constructs proper `TimeControl`.            |
| `TC-CLK-UI-14` | Validation   | Entering invalid negative minutes/seconds or non-numeric characters. | Displays inline validation error and disables selection confirmation.            |
| `TC-CLK-UI-15` | Validation   | Entering 0 minutes, 0 seconds base time with 0 increment.            | Rejects with message directing user to select Unlimited preset.                  |
| `TC-CLK-UI-16` | Validation   | Entering out-of-bound minutes (> 180 min).                           | Rejects with maximum allowed bounds error.                                       |

### 2.3 `useClock` Hook & Timing Engine (`TC-CLK-UI-17` to `TC-CLK-UI-22`)

| Test ID        | Category     | Scenario / Description                                  | Expected Result                                                                             |
| :------------- | :----------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------------ |
| `TC-CLK-UI-17` | Hook Ticker  | Starting clock with 3+2 preset and advancing fake time. | Remaining time decrements according to elapsed timestamps without timer drift.              |
| `TC-CLK-UI-18` | Hook Switch  | Calling `switchTurn("b")` on move execution.            | White clock receives 2000ms increment, Black clock begins deducting from current timestamp. |
| `TC-CLK-UI-19` | Hook Timeout | Advancing time past remaining limit (0ms).              | Fires `onTimeout` callback with active player color; clock stops.                           |
| `TC-CLK-UI-20` | Hook Pause   | Calling `pauseClock()`.                                 | Remaining time calculation freezes at paused timestamp.                                     |
| `TC-CLK-UI-21` | Hook Reset   | Calling `resetClock(newTimeControl)`.                   | Restores initial configured times for both White and Black.                                 |
| `TC-CLK-UI-22` | Hook Cleanup | Component unmount during active running clock.          | Cancels all active tickers/intervals without memory leaks or state updates after unmount.   |

### 2.4 Integration Tests (`TC-CLK-UI-23` to `TC-CLK-UI-28`)

| Test ID        | Category        | Scenario / Description                                                               | Expected Result                                                                  |
| :------------- | :-------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `TC-CLK-UI-23` | Modal Setup     | `NewGameModal` renders `TimeControlSelector` and submits chosen preset.              | `onStartGame` receives resolved session with configured `timeControl`.           |
| `TC-CLK-UI-24` | Player Panel    | `PlayerPanel` displays `ClockDisplay` alongside player info and captured pieces.     | Clock correctly positions inside player header with active/inactive visual cues. |
| `TC-CLK-UI-25` | App Integration | Full game flow: Clock starts on 1st move, switches each ply, and stops on checkmate. | End-to-end clock coordination in `App.tsx`.                                      |
| `TC-CLK-UI-26` | App Timeout     | Flag fall triggers automatic game over by timeout (`sessionController.timeout()`).   | Game status changes to timeout and `GameResultModal` opens with winner.          |
| `TC-CLK-UI-27` | Reduced Motion  | `prefersReducedMotion` active.                                                       | Low-time pulse animation replaced with static high-contrast warning.             |
| `TC-CLK-UI-28` | Untimed Game    | Starting game with Unlimited preset.                                                 | Player panels display untimed status; no countdown occurs.                       |
