# Test Cases Catalog: Phase 07 · Sprint 03 (Clock Integration & Timeout)

## Document Metadata

- **Sprint:** Phase 07 · Sprint 03: Clock Integration and Timeout
- **Author:** SDET Architect (SDET)
- **Status:** APPROVED
- **Date:** 2026-08-19

---

## 1. Test Strategy & Scope

This catalog specifies comprehensive automated test scenarios verifying the integration between chess clocks, game controller sessions, UI presentation, and game-over lifecycles. All time-sensitive tests use fake timers (`vi.useFakeTimers()`) and deterministic timestamp providers to prevent test flakiness.

---

## 2. Test Cases Specification

| Test ID         | Category                           | Scenario Description                                                                              | Expected Outcome                                                                                                                    |
| :-------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| `TC-CLK-INT-01` | First Move Start                   | Initial position with Rapid (10m+0s); White clock ready at 10:00, Black clock ready at 10:00.     | Clock is not ticking initially; starts ticking upon first move or game start.                                                       |
| `TC-CLK-INT-02` | Turn Transition                    | White plays 1. e4. White elapsed time is deducted; Black clock begins ticking.                    | White remaining time is reduced by thinking time; Black clock is active.                                                            |
| `TC-CLK-INT-03` | Increment Application              | Blitz 3m+2s; White spends 5s and plays 1. e4.                                                     | White remaining time = 180s - 5s + 2s = 177s (2:57).                                                                                |
| `TC-CLK-INT-04` | Multiple Turn Playout              | White and Black play 3 consecutive moves in a 5m+3s game.                                         | Increments apply accurately to each player upon each move completion; clocks alternate correctly.                                   |
| `TC-CLK-INT-05` | Flag Fall Timeout                  | Black runs out of time in a Blitz game (remaining time reaches 0).                                | Clock flags Black; domain triggers `timeout('b')`; White wins by timeout; GameResultModal opens.                                    |
| `TC-CLK-INT-06` | Game Over by Checkmate Freeze      | White delivers Scholar's Mate.                                                                    | Game concludes with checkmate; clocks for both players freeze immediately and stop ticking.                                         |
| `TC-CLK-INT-07` | Game Over by Resignation Freeze    | Black resigns with 4:32 remaining on their clock.                                                 | Game concludes with resignation; White wins; clock stops immediately and remains at 4:32.                                           |
| `TC-CLK-INT-08` | Game Over by Draw Freeze           | Players agree to a mutual draw.                                                                   | Game concludes with draw; clock freezes immediately.                                                                                |
| `TC-CLK-INT-09` | Restart Game Clock Reset           | Active game in progress (White at 8:15, Black at 9:02); user restarts game via ConfirmationModal. | Clocks for both players reset to full initial 10:00 time; clock returns to ready state.                                             |
| `TC-CLK-INT-10` | Rematch Action Clock Reset         | Game ends by timeout; user clicks 'Rematch' in GameResultModal.                                   | Board resets to starting position; both clocks reset to initial time control duration.                                              |
| `TC-CLK-INT-11` | New Game Modal Time Control Change | User opens NewGameModal and switches time control from Blitz 3+2 to Classical 30+0.               | Clocks initialize to 30:00; previous time control state is discarded.                                                               |
| `TC-CLK-INT-12` | Unlimited Time Control (No Clock)  | User starts game with "Unlimited" preset.                                                         | Clocks display "—" / "Unlimited", do not tick, and cannot trigger timeout.                                                          |
| `TC-CLK-INT-13` | Move & Timeout Race Condition      | Move is made exactly when clock reaches 0.                                                        | If domain processes move before timeout, move is registered; if timeout processes first, game is over and subsequent move rejected. |
| `TC-CLK-INT-14` | Rapid Successive Moves             | Multiple moves played in rapid succession ($< 100\text{ ms}$).                                    | Timestamps and increments accumulate without drift or interval corruption.                                                          |
| `TC-CLK-INT-15` | Announcement on Timeout            | Player times out.                                                                                 | Live region announcement reads "{Player} ran out of time. {Opponent} wins by timeout."                                              |
| `TC-CLK-INT-16` | Undo Move Clock Handling           | Player undos move.                                                                                | Undoing moves preserves consistent session state without breaking clock controller lifecycle.                                       |
| `TC-CLK-INT-17` | Human vs Computer Clock Ticking    | Game mode is Human vs Computer.                                                                   | Clock ticks for human during human turn and for engine during engine thinking turn.                                                 |
| `TC-CLK-INT-18` | Zero Interval Leakage on Unmount   | Component mounts, ticks, and unmounts.                                                            | `clearInterval` is called, ensuring no background interval leaks.                                                                   |
