import { describe, it, expect } from "vitest";
import {
  createClockState,
  startClock,
  checkTimeout,
  isFlagged,
  switchTurn,
  pauseClock,
  resumeClock,
  addTime,
} from "../clockEngine";
import { createTimeControl } from "../timeControl";

describe("Timeout Detection, Flag Fall & Adjudication (TC-CLK-16 to TC-CLK-20)", () => {
  const tc1_0 = createTimeControl(1, 0); // 60000ms

  it("TC-CLK-16: detects mid-turn timeout via checkTimeout", () => {
    let state = createClockState(tc1_0);
    state = startClock(state, "white", 1000);

    // Before timeout (t = 50000, remaining = 11000ms)
    const beforeTimeout = checkTimeout(state, 50000);
    expect(beforeTimeout.status).toBe("running");
    expect(beforeTimeout.flaggedColor).toBeNull();

    // After timeout (t = 61001, elapsed = 60001ms)
    const afterTimeout = checkTimeout(state, 61001);
    expect(afterTimeout.status).toBe("flagged");
    expect(afterTimeout.running).toBe(false);
    expect(afterTimeout.flaggedColor).toBe("white");
    expect(afterTimeout.whiteMs).toBe(0);
    expect(afterTimeout.blackMs).toBe(60000);
  });

  it("TC-CLK-17: flags at exact zero milliseconds boundary", () => {
    let state = createClockState(tc1_0);
    state = startClock(state, "white", 0);

    // Exact 60000ms elapsed
    const exactZero = checkTimeout(state, 60000);
    expect(exactZero.status).toBe("flagged");
    expect(exactZero.flaggedColor).toBe("white");
  });

  it("TC-CLK-18: preserves flagged state immutability (INV-CLK-04)", () => {
    let state = createClockState(tc1_0);
    state = startClock(state, "white", 0);
    state = checkTimeout(state, 65000); // White flagged

    expect(state.status).toBe("flagged");

    // Attempting turn switch on flagged clock returns unchanged flagged state
    const switched = switchTurn(state, 70000);
    expect(switched.status).toBe("flagged");
    expect(switched.flaggedColor).toBe("white");

    // Attempting pause on flagged clock
    const paused = pauseClock(state, 70000);
    expect(paused.status).toBe("flagged");

    // Attempting resume on flagged clock
    const resumed = resumeClock(state, 70000);
    expect(resumed.status).toBe("flagged");
  });

  it("TC-CLK-19: enforces single flaggedColor and prevents opponent from flagging while inactive", () => {
    let state = createClockState(tc1_0);
    state = startClock(state, "white", 0);

    const flagCheck = isFlagged(state, 100000);
    expect(flagCheck.flagged).toBe(true);
    expect(flagCheck.flaggedColor).toBe("white");
    expect(flagCheck.flaggedColor).not.toBe("black");
  });

  it("TC-CLK-20: supports arbiter manual time addition / penalty adjustment", () => {
    let state = createClockState(tc1_0);
    state = startClock(state, "white", 0);

    // Arbiter awards Black +15000ms
    state = addTime(state, "black", 15000);
    expect(state.blackMs).toBe(75000);

    // Arbiter deducts 10000ms from White
    state = addTime(state, "white", -10000);
    expect(state.whiteMs).toBe(50000);
  });
});
