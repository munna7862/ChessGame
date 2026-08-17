import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { FEN_START_POSITION } from "../fen";

describe("FEN Round-Trip & Generative Invariance (TC-FEN-31 & TC-FEN-32)", () => {
  const CURATED_POSITIONS = [
    // 1. Initial starting position
    FEN_START_POSITION,
    // 2. Kiwipete position (rich tactical structure, castling rights)
    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
    // 3. Endgame position (no castling, no en passant)
    "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
    // 4. Active en passant target (White to move)
    "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
    // 5. Active en passant target (Black to move)
    "rnbqkbnr/pppp1ppp/8/8/3Pp3/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 2",
    // 6. Partial castling rights (Kq)
    "r3k2r/8/8/8/8/8/8/R3K2R w Kq - 0 1",
    // 7. Promoted pieces (multiple queens)
    "QQQQkQQQ/8/8/8/8/8/8/4K3 w - - 0 1",
    // 8. Near 50-move limit and high fullmove count
    "8/8/8/8/8/8/8/4K2k w - - 99 150",
    // 9. Standard opening position (1. e4 e5 2. Nf3 Nc6)
    "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
  ];

  it("TC-FEN-31: verifies round-trip fidelity for all curated FEN positions", () => {
    for (const fen of CURATED_POSITIONS) {
      const adapter = new ChessJsAdapter();
      const loadRes = adapter.loadFen(fen);
      expect(loadRes.success, `Failed loading FEN: ${fen}`).toBe(true);

      const exportedFen = adapter.exportFen();
      expect(exportedFen, `Export mismatch for FEN: ${fen}`).toBe(fen);

      // Verify second load cycle yields identical board state
      const reloadedAdapter = new ChessJsAdapter(exportedFen);
      expect(reloadedAdapter.getPosition()).toEqual(adapter.getPosition());
      expect(reloadedAdapter.getLegalMoves()).toEqual(adapter.getLegalMoves());
      expect(reloadedAdapter.getStatus()).toEqual(adapter.getStatus());
    }
  });

  it("TC-FEN-32: property-based generative fuzzing across randomized legal move sequences", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 1,
          maxLength: 40,
        }),
        (moveIndexChoices) => {
          const adapter = new ChessJsAdapter();

          // Play pseudo-random legal moves
          for (const choice of moveIndexChoices) {
            if (adapter.getStatus().isOver) {
              break;
            }
            const legalMoves = adapter.getLegalMoves();
            if (legalMoves.length === 0) {
              break;
            }
            const selectedMove = legalMoves[choice % legalMoves.length];
            if (!selectedMove) {
              break;
            }
            const moveRes = adapter.makeMove({
              from: selectedMove.from,
              to: selectedMove.to,
              promotion: selectedMove.promotion,
            });
            if (!moveRes.success) {
              break;
            }

            // At every ply, verify FEN round-trip preservation
            const currentFen = adapter.exportFen();
            const reloadedAdapter = new ChessJsAdapter();
            const reloadedRes = reloadedAdapter.loadFen(currentFen);

            expect(
              reloadedRes.success,
              `Reloading generated FEN failed: ${currentFen}`
            ).toBe(true);

            expect(reloadedAdapter.exportFen()).toBe(currentFen);
            expect(reloadedAdapter.getPosition().turn).toBe(
              adapter.getPosition().turn
            );
            expect(reloadedAdapter.getPosition().castling).toEqual(
              adapter.getPosition().castling
            );
            expect(reloadedAdapter.getPosition().enPassantSquare).toBe(
              adapter.getPosition().enPassantSquare
            );
            expect(reloadedAdapter.getPosition().halfmoveClock).toBe(
              adapter.getPosition().halfmoveClock
            );
            expect(reloadedAdapter.getPosition().fullmoveNumber).toBe(
              adapter.getPosition().fullmoveNumber
            );
            expect(reloadedAdapter.getStatus().state).toBe(
              adapter.getStatus().state
            );
            expect(reloadedAdapter.getLegalMoves().length).toBe(
              adapter.getLegalMoves().length
            );
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
