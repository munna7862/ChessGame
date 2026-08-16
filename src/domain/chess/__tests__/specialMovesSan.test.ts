import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import type { MoveInput } from "../types";

describe("Special Moves SAN / UCI Consistency & Generative Fuzzing (TC-SPEC-27)", () => {
  it("verifies accurate SAN and LAN/UCI strings across all special move categories", () => {
    // 1. Castling SAN / LAN
    const castleAdapter = new ChessJsAdapter(
      "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"
    );
    const castleRes = castleAdapter.makeMove({ from: "e1", to: "g1" });
    expect(castleRes.success).toBe(true);
    if (!castleRes.success) return;
    expect(castleRes.data.san).toBe("O-O");
    expect(castleRes.data.lan).toBe("e1g1");

    // 2. En Passant SAN / LAN
    const epAdapter = new ChessJsAdapter(
      "rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3"
    );
    const epRes = epAdapter.makeMove({ from: "d5", to: "c6" });
    expect(epRes.success).toBe(true);
    if (!epRes.success) return;
    expect(epRes.data.san).toBe("dxc6");
    expect(epRes.data.lan).toBe("d5c6");

    // 3. Promotion SAN / LAN
    const promoAdapter = new ChessJsAdapter("8/4P3/8/8/8/8/8/4K2k w - - 0 1");
    const promoRes = promoAdapter.makeMove({
      from: "e7",
      to: "e8",
      promotion: "n",
    });
    expect(promoRes.success).toBe(true);
    if (!promoRes.success) return;
    expect(promoRes.data.san).toBe("e8=N");
    expect(promoRes.data.lan).toBe("e7e8n");
  });

  it("TC-SPEC-27: Property-based fuzzing - random legal playouts preserve special-move invariants and reversibility", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 5,
          maxLength: 30,
        }),
        (moveIndexChoices) => {
          const adapter = new ChessJsAdapter();
          const moveSnapshots: Array<{
            fenBefore: string;
            moveInput: MoveInput;
          }> = [];

          for (const choice of moveIndexChoices) {
            const status = adapter.getStatus();
            if (status.isOver) break;

            const legalMoves = adapter.getLegalMoves();
            if (legalMoves.length === 0) break;

            const selectedMove = legalMoves[choice % legalMoves.length];
            if (!selectedMove) break;
            const fenBefore = adapter.exportFen();

            const moveInput: MoveInput = {
              from: selectedMove.from,
              to: selectedMove.to,
              promotion: selectedMove.promotion,
            };

            const result = adapter.makeMove(moveInput);
            expect(result.success).toBe(true);

            // Invariant: Exactly one White King and one Black King on board
            const pos = adapter.getPosition();
            let whiteKings = 0;
            let blackKings = 0;
            for (const row of pos.board) {
              for (const piece of row) {
                if (piece?.type === "k") {
                  if (piece.color === "w") whiteKings++;
                  if (piece.color === "b") blackKings++;
                }
              }
            }
            expect(whiteKings).toBe(1);
            expect(blackKings).toBe(1);

            moveSnapshots.push({ fenBefore, moveInput });
          }

          // Invariant: Reversibility of all moves including special moves
          while (moveSnapshots.length > 0) {
            const expected = moveSnapshots.pop()!;
            const undoResult = adapter.undo();
            expect(undoResult.success).toBe(true);
            expect(adapter.exportFen()).toBe(expected.fenBefore);
          }

          // Must return exactly to starting position
          expect(adapter.exportFen()).toBe(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
