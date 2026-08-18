import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEngineDifficulty } from "../useEngineDifficulty";
import {
  STORAGE_KEY_ENGINE_DIFFICULTY,
  DEFAULT_DIFFICULTY_LEVEL,
} from "../difficulty";

describe("useEngineDifficulty Hook (TC-DIFF-06 & TC-DIFF-07)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("TC-DIFF-06: initializes with default level (3) when localStorage is empty", () => {
    const { result } = renderHook(() => useEngineDifficulty());

    expect(result.current.difficulty).toBe(DEFAULT_DIFFICULTY_LEVEL);
    expect(result.current.preset.level).toBe(DEFAULT_DIFFICULTY_LEVEL);
    expect(result.current.preset.label).toBe("Intermediate");
  });

  it("TC-DIFF-06: initializes with specified initialLevel when provided", () => {
    const { result } = renderHook(() => useEngineDifficulty(5));

    expect(result.current.difficulty).toBe(5);
    expect(result.current.preset.level).toBe(5);
    expect(result.current.preset.label).toBe("Proficient");
  });

  it("TC-DIFF-06: loads existing valid level from localStorage on mount", () => {
    window.localStorage.setItem(STORAGE_KEY_ENGINE_DIFFICULTY, "6");

    const { result } = renderHook(() => useEngineDifficulty());

    expect(result.current.difficulty).toBe(6);
    expect(result.current.preset.level).toBe(6);
    expect(result.current.preset.label).toBe("Expert");
    expect(result.current.preset.depth).toBe(14);
    expect(result.current.preset.movetimeMs).toBe(2500);
  });

  it("TC-DIFF-06: updates state, preset, and localStorage when setDifficulty is called", () => {
    const { result } = renderHook(() => useEngineDifficulty());

    act(() => {
      result.current.setDifficulty(7);
    });

    expect(result.current.difficulty).toBe(7);
    expect(result.current.preset.level).toBe(7);
    expect(result.current.preset.label).toBe("Master");
    expect(window.localStorage.getItem(STORAGE_KEY_ENGINE_DIFFICULTY)).toBe(
      "7"
    );

    act(() => {
      result.current.setDifficulty(1);
    });

    expect(result.current.difficulty).toBe(1);
    expect(result.current.preset.level).toBe(1);
    expect(result.current.preset.label).toBe("Beginner");
    expect(window.localStorage.getItem(STORAGE_KEY_ENGINE_DIFFICULTY)).toBe(
      "1"
    );
  });

  it("TC-DIFF-07: safely falls back to default when localStorage contains corrupted or out-of-range values", () => {
    // Non-numeric string
    window.localStorage.setItem(STORAGE_KEY_ENGINE_DIFFICULTY, "super-hard");
    const { result: r1 } = renderHook(() => useEngineDifficulty());
    expect(r1.current.difficulty).toBe(DEFAULT_DIFFICULTY_LEVEL);

    // Number below range
    window.localStorage.setItem(STORAGE_KEY_ENGINE_DIFFICULTY, "0");
    const { result: r2 } = renderHook(() => useEngineDifficulty());
    expect(r2.current.difficulty).toBe(DEFAULT_DIFFICULTY_LEVEL);

    // Number above range
    window.localStorage.setItem(STORAGE_KEY_ENGINE_DIFFICULTY, "999");
    const { result: r3 } = renderHook(() => useEngineDifficulty());
    expect(r3.current.difficulty).toBe(DEFAULT_DIFFICULTY_LEVEL);
  });

  it("TC-DIFF-07: gracefully handles localStorage throwing errors", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("QuotaExceededError or SecurityError");
    });

    const { result } = renderHook(() => useEngineDifficulty());
    expect(result.current.difficulty).toBe(DEFAULT_DIFFICULTY_LEVEL);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage write failure");
    });

    expect(() => {
      act(() => {
        result.current.setDifficulty(4);
      });
    }).not.toThrow();
    expect(result.current.difficulty).toBe(4);
  });
});
