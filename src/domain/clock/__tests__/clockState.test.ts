import { describe, it, expect } from "vitest";
import {
  createClockState,
  startClock,
  pauseClock,
  resumeClock,
  computeRemainingTime,
  resetClock,
} from "../clockEngine";
import { createTimeControl } from "../timeControl";

describe("ClockState & Pure Time Deduction (TC-CLK-03, TC-CLK-06, TC-CLK-07, TC-CLK-08, TC-CLK-10)", () => {
  const blitz5_0 = createTimeControl(5, 0);
  const untimed = createTimeControl(0, 0);

  it("TC-CLK-03: initializes ClockState correctly for timed and untimed modes", () => {
    const timedState = createClockState(blitz5_0);
    expect(timedState.whiteMs).toBe(300000);
    expect(timedState.blackMs).toBe(300000);
    expect(timedState.activeColor).toBeNull();
    expect(timedState.turnStartedAt).toBeNull();
    expect(timedState.status).toBe("idle");
    expect(timedState.running).toBe(false);
    expect(timedState.flaggedColor).toBeNull();
    expect(timedState.moveCount).toEqual({ white: 0, black: 0 });

    const untimedState = createClockState(untimed);
    expect(untimedState.whiteMs).toBe(0);
    expect(untimedState.blackMs).toBe(0);
    expect(untimedState.timeControl.type).toBe("none");
  });

  it("TC-CLK-06: maintains time invariance when clock is idle or paused", () => {
    const state = createClockState(blitz5_0);

    // Query idle clock at future timestamps
    const remainingIdle = computeRemainingTime(state, 50000);
    expect(remainingIdle.whiteMs).toBe(300000);
    expect(remainingIdle.blackMs).toBe(300000);

    // Start and pause
    const started = startClock(state, "white", 1000);
    const paused = pauseClock(started, 4000); // 3000ms elapsed -> 297000ms banked
    expect(paused.whiteMs).toBe(297000);
    expect(paused.status).toBe("paused");
    expect(paused.running).toBe(false);

    // Query paused clock much later
    const remainingPaused = computeRemainingTime(paused, 1000000);
    expect(remainingPaused.whiteMs).toBe(297000);
    expect(remainingPaused.blackMs).toBe(300000);
  });

  it("TC-CLK-07: deducts time accurately during active turn", () => {
    const state = createClockState(blitz5_0);
    const started = startClock(state, "white", 10000);

    const at12s = computeRemainingTime(started, 12000); // 2000ms elapsed
    expect(at12s.whiteMs).toBe(298000);
    expect(at12s.blackMs).toBe(300000);

    const at25s = computeRemainingTime(started, 25000); // 15000ms elapsed
    expect(at25s.whiteMs).toBe(285000);
    expect(at25s.blackMs).toBe(300000);
  });

  it("TC-CLK-08: preserves opponent time invariance (INV-CLK-05)", () => {
    const state = createClockState(blitz5_0);
    const startedWhite = startClock(state, "white", 0);

    for (let t = 0; t <= 100000; t += 10000) {
      const remaining = computeRemainingTime(startedWhite, t);
      expect(remaining.blackMs).toBe(300000);
    }
  });

  it("TC-CLK-10: handles untimed clock calculations with zero time decay", () => {
    const state = createClockState(untimed);
    const started = startClock(state, "white", 5000);

    const remaining = computeRemainingTime(started, 999999);
    expect(remaining.whiteMs).toBe(0);
    expect(remaining.blackMs).toBe(0);
    expect(started.status).toBe("running");
  });

  it("handles pause and resume lifecycle cleanly without phantom time decay", () => {
    const state = createClockState(blitz5_0);
    const t0 = 10000;
    const started = startClock(state, "white", t0);

    // Pause after 4s (t = 14000)
    const paused = pauseClock(started, 14000);
    expect(paused.whiteMs).toBe(296000);
    expect(paused.status).toBe("paused");

    // Resume after 20s of pause (t = 34000)
    const resumed = resumeClock(paused, 34000);
    expect(resumed.status).toBe("running");
    expect(resumed.turnStartedAt).toBe(34000);

    // Query 5s after resume (t = 39000)
    const remaining = computeRemainingTime(resumed, 39000);
    expect(remaining.whiteMs).toBe(291000); // 296000 - 5000
    expect(remaining.blackMs).toBe(300000);
  });

  it("resets clock cleanly via resetClock", () => {
    const reset = resetClock(blitz5_0);

    expect(reset.whiteMs).toBe(300000);
    expect(reset.blackMs).toBe(300000);
    expect(reset.activeColor).toBeNull();
    expect(reset.running).toBe(false);
    expect(reset.status).toBe("idle");
  });
});
