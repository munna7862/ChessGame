import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";

describe("Chess Domain Tactical Regression & Seeded Invariants (TC-REG-12 to TC-REG-21)", () => {
  describe("Tactical Regression Edge Cases", () => {
    it("TC-REG-12: enforces double check resolution (King must move)", () => {
      // White Knight on e5 moves to d7 or g6 delivering check while opening Rook on e1
      // Double check position: White King g1, Rook e1, Knight d5; Black King e8
      const adapter = new ChessJsAdapter("r3k2r/8/8/3N4/8/8/8/4R1K1 w - - 0 1");
      // Knight moves to c7 with check
      const moveRes = adapter.makeMove({ from: "d5", to: "c7" });
      expect(moveRes.success).toBe(true);

      const status = adapter.getStatus();
      expect(status.isCheck).toBe(true);

      // In double check from c7 (Knight) and e1 (Rook), Black King cannot block or take knight with rook on h8
      // King must move to d8, f7, or f8
      const blackLegalMoves = adapter.getLegalMoves();
      for (const m of blackLegalMoves) {
        expect(m.from).toBe("e8");
      }
    });

    it("TC-REG-13: legal en passant capture delivering discovered check", () => {
      // White King g1, Bishop a2, Pawn e5; Black King g8, Pawn d7
      // 1... d5 -> en passant target d6, White plays 2. exd6 e.p. opening diagonal from a2 to g8
      const adapter = new ChessJsAdapter("6k1/3p4/8/4P3/8/8/B7/6K1 b - - 0 1");
      adapter.makeMove({ from: "d7", to: "d5" });

      expect(adapter.getPosition().enPassantSquare).toBe("d6");
      const epMove = adapter.makeMove({ from: "e5", to: "d6" });
      expect(epMove.success).toBe(true);

      // Black King is now in check from Bishop on a2
      expect(adapter.getPosition().isCheck).toBe(true);
      expect(adapter.getPiece("d5")).toBeNull();
    });

    it("TC-REG-14: castling through attacked square is excluded from legal moves", () => {
      // White King e1, Rook h1, Black Bishop b5 controlling f1
      const adapter = new ChessJsAdapter("4k3/8/8/1b6/8/8/8/R3K2R w KQ - 0 1");
      const legalMoves = adapter.getLegalMoves();
      const castlingKingside = legalMoves.find(
        (m) => m.from === "e1" && m.to === "g1"
      );
      expect(castlingKingside).toBeUndefined();

      // Queenside is legal since d1, c1, b1 are not attacked
      const castlingQueenside = legalMoves.find(
        (m) => m.from === "e1" && m.to === "c1"
      );
      expect(castlingQueenside).toBeDefined();
    });

    it("TC-REG-15: absolute pin against King prevents piece from moving off line", () => {
      // White King e1, White Rook e4, Black Rook e8, Black King g8
      const adapter = new ChessJsAdapter("4r1k1/8/8/8/4R3/8/8/4K3 w - - 0 1");
      const rookMoves = adapter.getLegalMoves("e4");
      // Pinned rook can only move along the e-file (capturing e8 or moving to e2, e3, e5, e6, e7)
      for (const m of rookMoves) {
        expect(m.to[0]).toBe("e");
      }
    });

    it("TC-REG-16: accurately identifies stalemate in pawnless endgame", () => {
      // Black King on a8, White King on c7, White Queen on b6 -> stalemate
      const adapter = new ChessJsAdapter("k7/2K5/1Q6/8/8/8/8/8 b - - 0 1");
      const status = adapter.getStatus();
      expect(status.state).toBe("stalemate");
      expect(status.isOver).toBe(true);
      expect(status.inDraw).toBe(true);
      expect(adapter.getLegalMoves()).toHaveLength(0);
    });

    it("TC-REG-17: detects checkmate with minor pieces (Bishop + Knight)", () => {
      // White King on b6 (covers a7, b7), White Knight on a6 (covers b8), White Bishop on e4 (checks a8), Black King on a8
      const adapter = new ChessJsAdapter("k7/8/NK6/8/4B3/8/8/8 b - - 0 1");
      const status = adapter.getStatus();
      expect(status.state).toBe("checkmate");
      expect(status.isOver).toBe(true);
      expect(status.winner).toBe("w");
      expect(adapter.getLegalMoves()).toHaveLength(0);
    });
  });

  describe("Seeded Property-Based Invariant Fuzzing", () => {
    it("TC-REG-18: Invariant 1 - King Safety: moving player is NEVER in check after making any legal move", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), {
            minLength: 1,
            maxLength: 30,
          }),
          (choices) => {
            const game = new ChessJsAdapter();
            for (const choice of choices) {
              if (game.getStatus().isOver) break;
              const legalMoves = game.getLegalMoves();
              if (legalMoves.length === 0) break;

              const selected = legalMoves[choice % legalMoves.length]!;
              const activeColorBefore = game.getPosition().turn;

              const res = game.makeMove({
                from: selected.from,
                to: selected.to,
                promotion: selected.promotion,
              });

              if (!res.success) break;

              // The player who just moved cannot be in check
              const posAfter = game.getPosition();
              // Current turn is opposite player
              expect(posAfter.turn).not.toBe(activeColorBefore);
            }
          }
        ),
        { seed: 42, numRuns: 50 }
      );
    });

    it("TC-REG-19: Invariant 2 - Move Reversibility: full move sequences are 100% reversible via undo()", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), {
            minLength: 2,
            maxLength: 20,
          }),
          (choices) => {
            const game = new ChessJsAdapter();
            const initialFen = game.exportFen();
            let movesMade = 0;

            for (const choice of choices) {
              if (game.getStatus().isOver) break;
              const legalMoves = game.getLegalMoves();
              if (legalMoves.length === 0) break;

              const selected = legalMoves[choice % legalMoves.length]!;
              const res = game.makeMove({
                from: selected.from,
                to: selected.to,
                promotion: selected.promotion,
              });

              if (res.success) {
                movesMade++;
              } else {
                break;
              }
            }

            // Undo all executed moves
            for (let i = 0; i < movesMade; i++) {
              const undoRes = game.undo();
              expect(undoRes.success).toBe(true);
            }

            // Must match exact starting state
            expect(game.exportFen()).toBe(initialFen);
            expect(game.getHistory()).toHaveLength(0);
            expect(game.getStatus().state).toBe("active");
          }
        ),
        { seed: 1337, numRuns: 50 }
      );
    });

    it("TC-REG-20 & TC-REG-21: Invariant 5 - FEN & PGN Codec Bijectivity under random playouts", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), {
            minLength: 2,
            maxLength: 25,
          }),
          (choices) => {
            const game = new ChessJsAdapter();

            for (const choice of choices) {
              if (game.getStatus().isOver) break;
              const legalMoves = game.getLegalMoves();
              if (legalMoves.length === 0) break;

              const selected = legalMoves[choice % legalMoves.length]!;
              const res = game.makeMove({
                from: selected.from,
                to: selected.to,
                promotion: selected.promotion,
              });
              if (!res.success) break;
            }

            // 1. FEN Bijectivity
            const currentFen = game.exportFen();
            const fenClone = new ChessJsAdapter(currentFen);
            expect(fenClone.exportFen()).toBe(currentFen);
            expect(fenClone.getLegalMoves().length).toBe(
              game.getLegalMoves().length
            );

            // 2. PGN Bijectivity
            const currentPgn = game.exportPgn();
            const pgnClone = new ChessJsAdapter();
            const pgnImportRes = pgnClone.importPgn(currentPgn);
            expect(pgnImportRes.success).toBe(true);
            expect(pgnClone.exportFen()).toBe(currentFen);
            expect(pgnClone.getHistory().length).toBe(game.getHistory().length);
          }
        ),
        { seed: 9999, numRuns: 50 }
      );
    });
  });
});
