import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "../useReducedMotion";

describe("useReducedMotion Hook (TC-ANIM-11, TC-ANIM-12, TC-ANIM-13)", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("TC-ANIM-11: detects system prefers-reduced-motion: reduce when true", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.reducedMotionOverride).toBeNull();
  });

  it("TC-ANIM-11: detects system standard motion when media query is false", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.reducedMotionOverride).toBeNull();
  });

  it("TC-ANIM-12: allows explicit toggle and override of motion preference", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current.prefersReducedMotion).toBe(false);

    // Toggle on
    act(() => {
      result.current.toggleReducedMotion();
    });
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.reducedMotionOverride).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggleReducedMotion();
    });
    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.reducedMotionOverride).toBe(false);

    // Reset override to null
    act(() => {
      result.current.setReducedMotionOverride(null);
    });
    expect(result.current.reducedMotionOverride).toBeNull();
    expect(result.current.prefersReducedMotion).toBe(false);
  });

  it("handles media query change events and cleans up listener on unmount", () => {
    let listenerCallback: ((e: MediaQueryListEvent) => void) | null = null;
    const removeEventListenerMock = vi.fn();

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(
        (event: string, cb: (e: MediaQueryListEvent) => void) => {
          if (event === "change") {
            listenerCallback = cb;
          }
        }
      ),
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }));

    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current.prefersReducedMotion).toBe(false);

    // Trigger system media query change
    act(() => {
      if (listenerCallback) {
        listenerCallback({ matches: true } as MediaQueryListEvent);
      }
    });
    expect(result.current.prefersReducedMotion).toBe(true);

    unmount();
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});
