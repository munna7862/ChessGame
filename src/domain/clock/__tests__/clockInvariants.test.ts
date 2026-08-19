import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  createClockState,
  startClock,
  switchTurn,
  pauseClock,
  resumeClock,
  computeRemainingTime,
} from "../clockEngine";
import { createTimeControl } from "../timeControl";

describe("Clock Domain Invariant Property Fuzzing (fast-check) (TC-CLK-24 & TC-CLK-25)", () => {
  it("TC-CLK-24: verifies pure determinism, non-negativity, and inactive player time invariance across random games", () => {
    fc.assert(
      fc.property(
        // Initial minutes 1..30, increment seconds 0..10
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 0, max: 10 }),
        // Move durations in ms for a series of plies
        fc.array(fc.integer({ min: 100, max: 15000 }), {
          minLength: 2,
          maxLength: 20,
        }),
        (initMinutes, incSeconds, moveDurations) => {
          const tc = createTimeControl(initMinutes, incSeconds);
          let state = createClockState(tc);
          let currentTimestamp = 1000;

          state = startClock(state, "white", currentTimestamp);

          for (const duration of moveDurations) {
            if (state.status === "flagged") {
              break;
            }

            const activeColorBefore = state.activeColor;
            const inactiveColorBefore =
              activeColorBefore === "white" ? "black" : "white";
            const inactiveRemainingBefore =
              inactiveColorBefore === "white" ? state.whiteMs : state.blackMs;

            // Inactive player time invariance during the move
            const midMoveTimestamp =
              currentTimestamp + Math.floor(duration / 2);
            const midRemaining = computeRemainingTime(state, midMoveTimestamp);

            // INV-CLK-05: Inactive player remaining time is unchanged
            if (inactiveColorBefore === "white") {
              expect(midRemaining.whiteMs).toBe(inactiveRemainingBefore);
            } else {
              expect(midRemaining.blackMs).toBe(inactiveRemainingBefore);
            }

            // INV-CLK-01: Determinism - querying twice at same timestamp gives identical results
            const midRemainingDup = computeRemainingTime(
              state,
              midMoveTimestamp
            );
            expect(midRemaining).toEqual(midRemainingDup);

            // Complete move
            currentTimestamp += duration;
            const nextState = switchTurn(state, currentTimestamp);

            // Non-negativity invariant: remaining time is always >= 0
            const afterRemaining = computeRemainingTime(
              nextState,
              currentTimestamp
            );
            expect(afterRemaining.whiteMs).toBeGreaterThanOrEqual(0);
            expect(afterRemaining.blackMs).toBeGreaterThanOrEqual(0);

            state = nextState;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("TC-CLK-25: verifies exact Fischer increment conservation across unflagged games", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }), // Initial 5 to 20 mins
        fc.integer({ min: 1, max: 5 }), // Increment 1 to 5s
        fc.array(fc.integer({ min: 500, max: 4000 }), {
          minLength: 2,
          maxLength: 10,
        }), // Quick moves so no flag
        (initMinutes, incSeconds, moveDurations) => {
          const tc = createTimeControl(initMinutes, incSeconds);
          let state = createClockState(tc);
          let currentTimestamp = 0;

          state = startClock(state, "white", currentTimestamp);

          let totalElapsedWhite = 0;
          let totalElapsedBlack = 0;
          let movesWhite = 0;
          let movesBlack = 0;

          for (const duration of moveDurations) {
            const active = state.activeColor;
            currentTimestamp += duration;

            if (active === "white") {
              totalElapsedWhite += duration;
              movesWhite += 1;
            } else {
              totalElapsedBlack += duration;
              movesBlack += 1;
            }

            state = switchTurn(state, currentTimestamp);
            if (state.status === "flagged") {
              break;
            }
          }

          if (state.status !== "flagged") {
            const expectedWhite =
              tc.initialMs - totalElapsedWhite + movesWhite * tc.incrementMs;
            const expectedBlack =
              tc.initialMs - totalElapsedBlack + movesBlack * tc.incrementMs;

            expect(state.whiteMs).toBe(expectedWhite);
            expect(state.blackMs).toBe(expectedBlack);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("verifies pause and resume preserving time exactly across random pause intervals", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 20000 }), // Think time before pause
        fc.integer({ min: 5000, max: 60000 }), // Pause duration
        (thinkDuration, pauseDuration) => {
          const tc = createTimeControl(10, 0); // 10 min
          let state = createClockState(tc);
          let t = 0;

          state = startClock(state, "white", t);

          t += thinkDuration;
          state = pauseClock(state, t);

          const bankedAtPause = state.whiteMs;
          expect(bankedAtPause).toBe(600000 - thinkDuration);

          // Advance during pause
          t += pauseDuration;
          const queryDuringPause = computeRemainingTime(state, t);
          expect(queryDuringPause.whiteMs).toBe(bankedAtPause);

          // Resume
          state = resumeClock(state, t);
          expect(state.whiteMs).toBe(bankedAtPause);

          // Check 1s after resume
          const queryAfterResume = computeRemainingTime(state, t + 1000);
          expect(queryAfterResume.whiteMs).toBe(bankedAtPause - 1000);
        }
      ),
      { numRuns: 50 }
    );
  });
});
