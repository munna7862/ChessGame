import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClock } from "../useClock";
import { DeterministicFakeTimeProvider } from "../../../domain/clock/timeProvider";
import type { TimeControl } from "../../../domain/clock/types";

describe("useClock Hook (TC-CLK-UI-17 to TC-CLK-UI-22)", () => {
  const blitzTc: TimeControl = {
    type: "blitz",
    initialMs: 180_000, // 3 min
    incrementMs: 2000, // 2s
    label: "3 + 2",
  };

  it("TC-CLK-UI-17: starts clock and accurately decrements time using injected TimeProvider without drift", () => {
    vi.useFakeTimers();
    const fakeTime = new DeterministicFakeTimeProvider(10_000);

    const { result } = renderHook(() =>
      useClock({
        timeControl: blitzTc,
        timeProvider: fakeTime,
      })
    );

    expect(result.current.whiteRemainingMs).toBe(180_000);
    expect(result.current.blackRemainingMs).toBe(180_000);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.startClock("w");
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.activeColor).toBe("w");

    // Advance fake time by 5 seconds
    act(() => {
      fakeTime.advanceBy(5000);
      vi.advanceTimersByTime(100);
    });

    expect(result.current.whiteRemainingMs).toBe(175_000);
    expect(result.current.blackRemainingMs).toBe(180_000);

    vi.useRealTimers();
  });

  it("TC-CLK-UI-18: switches turn and applies increment accurately", () => {
    vi.useFakeTimers();
    const fakeTime = new DeterministicFakeTimeProvider(10_000);

    const { result } = renderHook(() =>
      useClock({
        timeControl: blitzTc,
        timeProvider: fakeTime,
      })
    );

    act(() => {
      result.current.startClock("w");
    });

    act(() => {
      fakeTime.advanceBy(4000); // 4s elapsed
      vi.advanceTimersByTime(100);
    });

    expect(result.current.whiteRemainingMs).toBe(176_000);

    // Switch turn to black: white gets +2s increment = 178_000
    act(() => {
      result.current.switchTurn();
    });

    expect(result.current.activeColor).toBe("b");
    expect(result.current.whiteRemainingMs).toBe(178_000);

    // Black thinks for 3s
    act(() => {
      fakeTime.advanceBy(3000);
      vi.advanceTimersByTime(100);
    });

    expect(result.current.blackRemainingMs).toBe(177_000);

    vi.useRealTimers();
  });

  it("TC-CLK-UI-19: triggers onTimeout when active player's time expires", () => {
    vi.useFakeTimers();
    const fakeTime = new DeterministicFakeTimeProvider(10_000);
    const onTimeout = vi.fn();

    const shortTc: TimeControl = {
      type: "bullet",
      initialMs: 5000,
      incrementMs: 0,
      label: "5s",
    };

    const { result } = renderHook(() =>
      useClock({
        timeControl: shortTc,
        timeProvider: fakeTime,
        onTimeout,
      })
    );

    act(() => {
      result.current.startClock("w");
    });

    // Advance 6 seconds (past 5s limit)
    act(() => {
      fakeTime.advanceBy(6000);
      vi.advanceTimersByTime(100);
    });

    expect(onTimeout).toHaveBeenCalledWith("w");

    vi.useRealTimers();
  });

  it("TC-CLK-UI-20: pauses and resumes clock accurately", () => {
    vi.useFakeTimers();
    const fakeTime = new DeterministicFakeTimeProvider(10_000);

    const { result } = renderHook(() =>
      useClock({
        timeControl: blitzTc,
        timeProvider: fakeTime,
      })
    );

    act(() => {
      result.current.startClock("w");
    });

    act(() => {
      fakeTime.advanceBy(3000);
      vi.advanceTimersByTime(100);
    });

    expect(result.current.whiteRemainingMs).toBe(177_000);

    act(() => {
      result.current.pauseClock();
    });

    expect(result.current.isRunning).toBe(false);

    // Advance fake time while paused - should not deduct
    act(() => {
      fakeTime.advanceBy(10_000);
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.whiteRemainingMs).toBe(177_000);

    // Resume clock
    act(() => {
      result.current.resumeClock();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      fakeTime.advanceBy(2000);
      vi.advanceTimersByTime(100);
    });

    expect(result.current.whiteRemainingMs).toBe(175_000);

    vi.useRealTimers();
  });

  it("TC-CLK-UI-21: resets clock cleanly with new TimeControl", () => {
    const fakeTime = new DeterministicFakeTimeProvider(10_000);

    const { result } = renderHook(() =>
      useClock({
        timeControl: blitzTc,
        timeProvider: fakeTime,
      })
    );

    const rapidTc: TimeControl = {
      type: "rapid",
      initialMs: 600_000,
      incrementMs: 5000,
      label: "10 + 5",
    };

    act(() => {
      result.current.resetClock(rapidTc);
    });

    expect(result.current.timeControl.initialMs).toBe(600_000);
    expect(result.current.whiteRemainingMs).toBe(600_000);
    expect(result.current.blackRemainingMs).toBe(600_000);
    expect(result.current.isRunning).toBe(false);
  });

  it("TC-CLK-UI-22: cleans up tickers and does not leak intervals upon unmount", () => {
    vi.useFakeTimers();
    const fakeTime = new DeterministicFakeTimeProvider(10_000);

    const { result, unmount } = renderHook(() =>
      useClock({
        timeControl: blitzTc,
        timeProvider: fakeTime,
      })
    );

    act(() => {
      result.current.startClock("w");
    });

    unmount();

    // Advance timers after unmount - should not throw
    expect(() => {
      vi.advanceTimersByTime(1000);
    }).not.toThrow();

    vi.useRealTimers();
  });
});
