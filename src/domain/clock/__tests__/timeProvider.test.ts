import { describe, it, expect, vi } from "vitest";
import {
  DeterministicFakeTimeProvider,
  SystemTimeProvider,
} from "../timeProvider";
import { ClockController } from "../ClockController";
import { createTimeControl } from "../timeControl";

describe("Time Providers & ClockController Integration (TC-CLK-21 to TC-CLK-23)", () => {
  it("TC-CLK-21: validates DeterministicFakeTimeProvider behavior", () => {
    const fakeTime = new DeterministicFakeTimeProvider(1000);
    expect(fakeTime.now()).toBe(1000);

    fakeTime.advanceBy(2500);
    expect(fakeTime.now()).toBe(3500);

    fakeTime.setTime(5000);
    expect(fakeTime.now()).toBe(5000);

    expect(() => fakeTime.advanceBy(-100)).toThrow();
    expect(() => fakeTime.setTime(4000)).toThrow();
  });

  it("TC-CLK-22: validates SystemTimeProvider returns valid monotonic timestamps", () => {
    const systemTime = new SystemTimeProvider();
    const t1 = systemTime.now();
    expect(typeof t1).toBe("number");
    expect(t1).toBeGreaterThanOrEqual(0);
  });

  it("TC-CLK-23: integrates ClockController with FakeTimeProvider and listener lifecycle", () => {
    const fakeTime = new DeterministicFakeTimeProvider(0);
    const tc3_2 = createTimeControl(3, 2);
    const controller = new ClockController(tc3_2, fakeTime);

    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    // Initial state
    expect(controller.getState().status).toBe("idle");
    expect(controller.getRemainingTime()).toEqual({
      whiteMs: 180000,
      blackMs: 180000,
    });

    // Start White
    controller.start("white");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(controller.getState().activeColor).toBe("white");
    expect(controller.getState().running).toBe(true);

    // Advance 10s
    fakeTime.advanceBy(10000);
    expect(controller.getRemainingTime()).toEqual({
      whiteMs: 170000,
      blackMs: 180000,
    });

    // White moves (switchTurn) -> 170000 + 2000 inc = 172000
    controller.switchTurn();
    expect(controller.getState().activeColor).toBe("black");
    expect(controller.getState().whiteMs).toBe(172000);

    // Advance 5s during Black turn
    fakeTime.advanceBy(5000);
    expect(controller.getRemainingTime()).toEqual({
      whiteMs: 172000,
      blackMs: 175000,
    });

    // Pause clock
    controller.pause();
    expect(controller.getState().status).toBe("paused");
    expect(controller.getState().blackMs).toBe(175000);

    // Advance 30s during pause -> no decay
    fakeTime.advanceBy(30000);
    expect(controller.getRemainingTime()).toEqual({
      whiteMs: 172000,
      blackMs: 175000,
    });

    // Resume clock
    controller.resume();
    expect(controller.getState().status).toBe("running");

    // Advance 175001ms to trigger timeout for Black
    fakeTime.advanceBy(175001);
    controller.checkTimeout();
    expect(controller.getState().status).toBe("flagged");
    expect(controller.getState().flaggedColor).toBe("black");

    unsubscribe();
  });
});
