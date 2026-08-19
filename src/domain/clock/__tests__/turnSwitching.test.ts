import { describe, it, expect } from "vitest";
import { createClockState, startClock, switchTurn } from "../clockEngine";
import { createTimeControl } from "../timeControl";

describe("Turn Switching & Fischer Increment (TC-CLK-11 to TC-CLK-15)", () => {
  it("TC-CLK-11: switches turn without increment (3+0)", () => {
    const tc3_0 = createTimeControl(3, 0);
    let state = createClockState(tc3_0);
    state = startClock(state, "white", 1000);

    // White moves after 4000ms (t = 5000)
    state = switchTurn(state, 5000);

    expect(state.whiteMs).toBe(180000 - 4000); // 176000
    expect(state.blackMs).toBe(180000);
    expect(state.activeColor).toBe("black");
    expect(state.turnStartedAt).toBe(5000);
    expect(state.moveCount).toEqual({ white: 1, black: 0 });
    expect(state.status).toBe("running");
  });

  it("TC-CLK-12: switches turn with Fischer increment (3+2)", () => {
    const tc3_2 = createTimeControl(3, 2);
    let state = createClockState(tc3_2);
    state = startClock(state, "white", 0);

    // White plays move in 3500ms
    state = switchTurn(state, 3500);

    // 180000 - 3500 + 2000 = 178500
    expect(state.whiteMs).toBe(178500);
    expect(state.blackMs).toBe(180000);
    expect(state.activeColor).toBe("black");
    expect(state.turnStartedAt).toBe(3500);
    expect(state.moveCount.white).toBe(1);
  });

  it("TC-CLK-13: accumulates net positive banked time when move execution is faster than increment", () => {
    const tc2_1 = createTimeControl(2, 1);
    let state = createClockState(tc2_1);
    state = startClock(state, "white", 0);

    // White makes a move in 300ms (increment is 1000ms -> +700ms net gain)
    state = switchTurn(state, 300);

    expect(state.whiteMs).toBe(120000 - 300 + 1000); // 120700ms
    expect(state.whiteMs).toBeGreaterThan(120000);
  });

  it("TC-CLK-14: handles continuous multi-turn playout with accurate move tracking", () => {
    const tc5_3 = createTimeControl(5, 3); // 300000ms + 3000ms
    let state = createClockState(tc5_3);
    state = startClock(state, "white", 0);

    // Turn 1: White thinks 5s (t = 5000) -> 300000 - 5000 + 3000 = 298000
    state = switchTurn(state, 5000);
    expect(state.whiteMs).toBe(298000);
    expect(state.activeColor).toBe("black");

    // Turn 1: Black thinks 8s (t = 13000) -> 300000 - 8000 + 3000 = 295000
    state = switchTurn(state, 13000);
    expect(state.blackMs).toBe(295000);
    expect(state.activeColor).toBe("white");

    // Turn 2: White thinks 2s (t = 15000) -> 298000 - 2000 + 3000 = 299000
    state = switchTurn(state, 15000);
    expect(state.whiteMs).toBe(299000);
    expect(state.activeColor).toBe("black");

    // Turn 2: Black thinks 4s (t = 19000) -> 295000 - 4000 + 3000 = 294000
    state = switchTurn(state, 19000);
    expect(state.blackMs).toBe(294000);
    expect(state.activeColor).toBe("white");

    expect(state.moveCount).toEqual({ white: 2, black: 2 });
  });

  it("TC-CLK-15: denies increment and flags when remaining time is exhausted upon turn switch (INV-CLK-03)", () => {
    const tc1_0 = createTimeControl(1, 2); // 60000ms + 2000ms inc
    let state = createClockState(tc1_0);
    state = startClock(state, "white", 0);

    // White attempts move after 60001ms (1ms over time)
    state = switchTurn(state, 60001);

    expect(state.status).toBe("flagged");
    expect(state.running).toBe(false);
    expect(state.flaggedColor).toBe("white");
    expect(state.whiteMs).toBe(0);
    // No increment was awarded to White
    expect(state.whiteMs).not.toBe(2000);
  });

  it("handles untimed turn switching cleanly", () => {
    const untimed = createTimeControl(0, 0);
    let state = createClockState(untimed);
    state = startClock(state, "white", 0);

    state = switchTurn(state, 10000);
    expect(state.activeColor).toBe("black");
    expect(state.moveCount.white).toBe(1);

    state = switchTurn(state, 25000);
    expect(state.activeColor).toBe("white");
    expect(state.moveCount.black).toBe(1);
    expect(state.status).toBe("running");
  });
});
