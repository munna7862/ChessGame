# Test Cases Catalog: Phase 07 · Sprint 04 - AI and Clock Integration

## 1. Overview & Test Objectives

This test catalog specifies the automated test scenarios for **Phase 07 · Sprint 04: AI and Clock Integration**.
The primary test objectives are:

1. Verify AI clock starts, ticks, and stops accurately during engine turns in timed games.
2. Verify dynamic engine time budget calculation ensures search limits respect available clock and increment.
3. Verify engine timeout flag-fall handling terminates game with Human win and halts engine thinking.
4. Verify rejection of engine moves arriving after game-over, timeout, or resignation.
5. Verify clean cancellation and clock reset when user triggers restart, new game, undo, or resignation while engine is thinking.
6. Verify long-thinking scenarios and race-condition resistance using deterministic fake timers and mock engine bridges.

---

## 2. Test Cases Matrix

| Test ID       | Category           | Scenario / Invariant                                                 | Expected Outcome                                                                                   | Tier     |
| :------------ | :----------------- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :------- |
| `TC-AICLK-01` | Clock Sync         | Human makes first move in timed HvE match                            | White receives increment, Black (Engine) clock starts ticking.                                     | Tier 3/4 |
| `TC-AICLK-02` | Clock Sync         | Engine commits move in timed HvE match                               | Engine receives increment, turn switches back to Human, Human clock ticks.                         | Tier 3/4 |
| `TC-AICLK-03` | Time Budget        | Engine calculates time budget with ample time                        | Uses difficulty default `movetimeMs` bounded by remaining time.                                    | Tier 1/3 |
| `TC-AICLK-04` | Time Budget        | Engine calculates time budget in time trouble ($< 5\text{s}$)        | Dynamically scales `movetimeMs` down to safe fraction $+ \frac{\text{inc}}{2}$.                    | Tier 1/3 |
| `TC-AICLK-05` | Time Budget        | Engine calculates time budget under critical time ($< 200\text{ms}$) | Allocates minimal emergency time ($50\text{ms}$) capped by buffer.                                 | Tier 1/3 |
| `TC-AICLK-06` | Timeout            | Engine clock reaches 0ms during search                               | `onTimeout('b')` triggered, `session.isGameOver` is true, Human wins by timeout, search cancelled. | Tier 3/4 |
| `TC-AICLK-07` | Race Condition     | Mock engine delivers best move _after_ timeout flag fall             | Move is rejected, board state does not mutate, game remains over.                                  | Tier 3/4 |
| `TC-AICLK-08` | Reset Interrupt    | User clicks Restart while engine is calculating                      | Engine search cancelled immediately, game and clock reset to move 0 initial time.                  | Tier 3/4 |
| `TC-AICLK-09` | New Game Interrupt | User starts New Game while engine is calculating                     | Engine search cancelled, new session initialized with chosen time control.                         | Tier 3/4 |
| `TC-AICLK-10` | Undo Interrupt     | User clicks Undo while engine is calculating                         | Engine search cancelled, previous human move undone, human turn restored.                          | Tier 3/4 |
| `TC-AICLK-11` | Resign Interrupt   | User resigns while engine is calculating                             | Engine search cancelled, game marked as resigned, engine move rejected.                            | Tier 3/4 |
| `TC-AICLK-12` | Engine as White    | Engine plays White in timed match (move 1)                           | Engine plays initial move, White gets increment, Black (Human) clock begins.                       | Tier 3/4 |
| `TC-AICLK-13` | Determinism        | All tests execute with zero real-time sleeps                         | 100% deterministic via `vi.useFakeTimers()` / `MockEngineWorkerBridge`.                            | Tier 1-4 |

---

## 3. Pass / Fail Quality Gate Criteria

- **Unit / Integration Tests:** 100% pass across all test suites with 0 skipped tests (`npm test`).
- **End-to-End Tests:** 100% pass for all Playwright desktop journeys (`npm run test:e2e`).
- **Static Analysis:** 0 TypeScript compile errors (`npm run typecheck`), 0 ESLint warnings/errors (`npm run lint`), 100% Prettier formatting compliance (`npm run format:check`).
- **Production Build:** Vite production build generates valid bundle without warnings (`npm run build`).
