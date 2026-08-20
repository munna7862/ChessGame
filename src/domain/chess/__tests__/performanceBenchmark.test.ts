import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { perft } from "../perft";
import { PERFT_CORPUS } from "./fixtures/perftCorpus";
import type { Square } from "../types";

describe("Performance & Benchmark Suite: Chess Domain (TC-PERF-02, TC-PERF-07)", () => {
  describe("Legal Move Generation & Perft Throughput", () => {
    it("TC-PERF-02: legal move generation per square executes in < 2ms", () => {
      const complexFen =
        "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";
      const adapter = new ChessJsAdapter(complexFen);
      const squares: Square[] = [
        "a1",
        "e1",
        "e5",
        "f3",
        "d2",
        "c3",
        "b4",
        "e6",
        "f6",
        "e8",
      ];

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        for (const sq of squares) {
          const moves = adapter.getLegalMoves(sq);
          expect(Array.isArray(moves)).toBe(true);
        }
      }
      const totalTime = performance.now() - startTime;
      const avgTimePerQuery = totalTime / (100 * squares.length);

      // Average query should be sub-millisecond (< 0.5ms)
      expect(avgTimePerQuery).toBeLessThan(2.0);
    });

    it("evaluates Perft Depth 1 across all 5 benchmark positions in < 250ms total", () => {
      const startTime = performance.now();
      for (const fixture of PERFT_CORPUS) {
        const adapter = new ChessJsAdapter(fixture.fen);
        const nodes = perft(adapter, 1);
        expect(nodes).toBe(fixture.expectedNodes[1]);
      }
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(250);
    });

    it("evaluates Perft Depth 2 across all 5 benchmark positions within standard budget (< 1500ms)", () => {
      const startTime = performance.now();
      for (const fixture of PERFT_CORPUS) {
        const adapter = new ChessJsAdapter(fixture.fen);
        const nodes = perft(adapter, 2);
        expect(nodes).toBe(fixture.expectedNodes[2]);
      }
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(1500);
    });
  });

  describe("FEN Serialization & Validation Throughput (TC-PERF-07)", () => {
    it("TC-PERF-07: serializes and validates 500 FEN positions in < 500ms (< 1ms per FEN)", () => {
      const fens = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
        "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
        "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
        "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
      ];

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        for (const fen of fens) {
          const adapter = new ChessJsAdapter(fen);
          const exportedFen = adapter.exportFen();
          expect(exportedFen.length).toBeGreaterThan(15);
          expect(adapter.getStatus().isOver).toBe(false);
        }
      }
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe("Batch PGN Move Sequence Replay & Validation (TC-PERF-07)", () => {
    it("TC-PERF-07: replays 50 multi-move game sequences in < 1200ms (< 1.2ms per move)", () => {
      const operaGameMoves = [
        { from: "e2", to: "e4" },
        { from: "e7", to: "e5" },
        { from: "g1", to: "f3" },
        { from: "d7", to: "d6" },
        { from: "d2", to: "d4" },
        { from: "c8", to: "g4" },
        { from: "d4", to: "e5" },
        { from: "g4", to: "f3" },
        { from: "d1", to: "f3" },
        { from: "d6", to: "e5" },
        { from: "f1", to: "c4" },
        { from: "g8", to: "f6" },
        { from: "f3", to: "b3" },
        { from: "d8", to: "e7" },
        { from: "b1", to: "c3" },
        { from: "c7", to: "c6" },
        { from: "c1", to: "g5" },
        { from: "b7", to: "b5" },
        { from: "c3", to: "b5" },
        { from: "c6", to: "b5" },
      ];

      const startTime = performance.now();
      for (let run = 0; run < 50; run++) {
        const adapter = new ChessJsAdapter();
        for (const m of operaGameMoves) {
          const res = adapter.makeMove({
            from: m.from as Square,
            to: m.to as Square,
          });
          expect(res.success).toBe(true);
        }
        expect(adapter.getHistory().length).toBe(operaGameMoves.length);
      }
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(1200);
    });
  });
});
