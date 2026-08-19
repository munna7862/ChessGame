import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { createGameSession } from "../GameSessionController";
import { FEN_START_POSITION } from "../../../domain/chess/fen";

describe("FEN Game Session Integration & Invariants (Phase 08 · Sprint 04)", () => {
  it("TC-FEN-UI-12: non-destructive load failure preserves active game state completely", () => {
    const session = createGameSession({
      mode: "human_vs_human",
      players: {
        w: { id: "p1", name: "Alice", color: "w", type: "human" },
        b: { id: "p2", name: "Bob", color: "b", type: "human" },
      },
    });

    // Make 2 moves
    session.makeMove({ from: "e2", to: "e4" });
    session.makeMove({ from: "e7", to: "e5" });

    const initialSnapshot = session.getState();
    expect(initialSnapshot.moveHistory.length).toBe(2);

    // Attempt to load an invalid FEN
    const invalidFenResult = session.loadFen(
      "invalid-fen-string-with-bad-tokens"
    );
    expect(invalidFenResult.success).toBe(false);

    // Verify session state remained 100% untouched
    const afterSnapshot = session.getState();
    expect(afterSnapshot.position.fen).toBe(initialSnapshot.position.fen);
    expect(afterSnapshot.moveHistory.length).toBe(2);
    expect(afterSnapshot.turn).toBe(initialSnapshot.turn);
    expect(afterSnapshot.isGameOver).toBe(false);
  });

  it("TC-FEN-UI-13: atomic position replacement loads valid FEN and resets move history", () => {
    const session = createGameSession();
    session.makeMove({ from: "d2", to: "d4" });

    const customEndgameFen = "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1";
    const loadResult = session.loadFen(customEndgameFen);

    expect(loadResult.success).toBe(true);
    const state = session.getState();
    expect(state.position.fen).toBe(customEndgameFen);
    expect(state.moveHistory.length).toBe(0);
    expect(state.turn).toBe("w");
    expect(state.isGameOver).toBe(false);
  });

  it("TC-FEN-UI-14: starts a new game configured with custom starting FEN", () => {
    const customFen = "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1";
    const session = createGameSession({
      initialFen: customFen,
      mode: "human_vs_human",
    });

    const state = session.getState();
    expect(state.position.fen).toBe(customFen);
    expect(state.moveHistory.length).toBe(0);
    expect(session.exportFen()).toBe(customFen);
  });

  it("TC-FEN-UI-16: generative fast-check property test for FEN load/export round-trip", () => {
    const testPositions = [
      FEN_START_POSITION,
      "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1",
      "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
      "8/2b5/8/4k3/8/8/2B1K3/8 w - - 0 1",
      "8/2n5/8/4k3/8/8/2B1K3/8 w - - 0 1",
      "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...testPositions), (fen) => {
        const session = createGameSession();
        const loadRes = session.loadFen(fen);
        expect(loadRes.success).toBe(true);

        const exported = session.exportFen();
        expect(exported).toBe(fen);
      }),
      { numRuns: 50 }
    );
  });
});
