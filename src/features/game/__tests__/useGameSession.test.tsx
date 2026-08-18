import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useGameSession } from "../useGameSession";

describe("useGameSession Hook (Phase 05 · Sprint 01)", () => {
  it("TC-GS-01 & TC-GS-11: initializes hook with default state and separates transient state", () => {
    const { result } = renderHook(() => useGameSession());

    expect(result.current.sessionState.turn).toBe("w");
    expect(result.current.sessionState.moveHistory).toHaveLength(0);
    expect(result.current.sessionState.isGameOver).toBe(false);

    // Make a move
    act(() => {
      const moveRes = result.current.makeMove({ from: "e2", to: "e4" });
      expect(moveRes.success).toBe(true);
    });

    expect(result.current.sessionState.turn).toBe("b");
    expect(result.current.sessionState.moveHistory).toHaveLength(1);
    expect(result.current.sessionState.moveHistory[0]?.san).toBe("e4");
  });

  it("TC-GS-09: resets game state reactively", () => {
    const { result } = renderHook(() => useGameSession());

    act(() => {
      result.current.makeMove({ from: "e2", to: "e4" });
      result.current.makeMove({ from: "e7", to: "e5" });
    });

    expect(result.current.sessionState.moveHistory).toHaveLength(2);

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.sessionState.moveHistory).toHaveLength(0);
    expect(result.current.sessionState.turn).toBe("w");
  });

  it("supports undo, resign, and draw through hook", () => {
    const { result } = renderHook(() => useGameSession());

    act(() => {
      result.current.makeMove({ from: "d2", to: "d4" });
    });
    expect(result.current.sessionState.moveHistory).toHaveLength(1);

    act(() => {
      result.current.undoMove();
    });
    expect(result.current.sessionState.moveHistory).toHaveLength(0);

    act(() => {
      result.current.resign("b");
    });
    expect(result.current.sessionState.status.state).toBe("resigned");
    expect(result.current.sessionState.status.winner).toBe("w");
  });
});
