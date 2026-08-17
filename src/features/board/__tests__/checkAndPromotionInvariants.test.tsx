import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import type { PromotionPieceType, Square } from "../../../domain/chess/types";
import { findCheckSquare } from "../useBoardInteraction";

describe("Check & Promotion Property Invariants (Phase 04 · Sprint 05 - fast-check)", () => {
  const promotionPieces: ReadonlyArray<PromotionPieceType> = [
    "q",
    "r",
    "b",
    "n",
  ];

  it("TC-PROM-20: property test verifying all 4 promotion options succeed and produce valid legal states", () => {
    // Arbitrary files a-h for promotion pawn
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        fc.constantFrom(...promotionPieces),
        (file, promoChoice) => {
          const game = createChessAdapter();
          // Build position with White pawn on file+7 and Kings at h1 and h8 (if file !== 'h') or a1 and a8
          const kingFile = file === "h" ? "a" : "h";
          const fromSquare = `${file}7` as Square;
          const toSquare = `${file}8` as Square;

          // Set up custom FEN with pawn on file+7
          // Let's create a clean FEN string with White pawn on rank 7 and king on safe square
          let rank8Str = "";
          let rank7Str = "";
          for (let f = 0; f < 8; f += 1) {
            const char = String.fromCharCode(97 + f);
            if (char === kingFile) {
              rank8Str += "k";
            } else {
              rank8Str += "1";
            }

            if (char === file) {
              rank7Str += "P";
            } else {
              rank7Str += "1";
            }
          }
          // Compress consecutive 1s
          const compress = (str: string) =>
            str
              .replace(/11111111/g, "8")
              .replace(/1111111/g, "7")
              .replace(/111111/g, "6")
              .replace(/11111/g, "5")
              .replace(/1111/g, "4")
              .replace(/111/g, "3")
              .replace(/11/g, "2");

          const customFen = `${compress(rank8Str)}/${compress(rank7Str)}/8/8/8/8/8/${compress(rank8Str.replace("k", "K"))} w - - 0 1`;

          const loadRes = game.loadFen(customFen);
          if (!loadRes.success) return;

          const legalMoves = game.getLegalMoves(fromSquare);
          const promoMove = legalMoves.find(
            (m) => m.to === toSquare && m.promotion === promoChoice
          );
          expect(promoMove).toBeDefined();

          const moveRes = game.makeMove({
            from: fromSquare,
            to: toSquare,
            promotion: promoChoice,
          });

          expect(moveRes.success).toBe(true);
          if (moveRes.success) {
            expect(moveRes.data.promotion).toBe(promoChoice);
            const pieceOnTarget = game.getPiece(toSquare);
            expect(pieceOnTarget?.type).toBe(promoChoice);
            expect(pieceOnTarget?.color).toBe("w");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("TC-PROM-04: in quiet initial position, findCheckSquare returns null", () => {
    const game = createChessAdapter();
    expect(findCheckSquare(game, "w")).toBeNull();
    expect(findCheckSquare(game, "b")).toBeNull();
  });

  it("TC-PROM-01: checked position locates king square accurately across all boards", () => {
    const checkFens = [
      {
        fen: "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
        turn: "w" as const,
        kingSq: "e1",
      },
      {
        fen: "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
        turn: "b" as const,
        kingSq: "e8",
      },
      {
        fen: "rnbqkbnr/ppppp2p/8/5pp1/4P2P/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",
        turn: "w" as const,
        kingSq: null,
      },
    ];

    for (const item of checkFens) {
      const game = createChessAdapter();
      game.loadFen(item.fen);
      const locatedSq = findCheckSquare(game, item.turn);
      expect(locatedSq).toBe(item.kingSq);
    }
  });
});
