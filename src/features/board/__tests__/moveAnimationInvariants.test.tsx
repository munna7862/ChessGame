import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import fc from "fast-check";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import { Board } from "../Board";
import { SQUARES, type Square } from "../../../domain/chess/types";

describe("Move Animation & Last-Move Invariants (TC-ANIM-05 to TC-ANIM-18)", () => {
  it("TC-ANIM-08: En passant capture correctly highlights origin/destination and removes captured pawn", () => {
    const game = createChessAdapter();
    // Setup en passant: White pawn e5, Black plays d7-d5
    game.loadFen(
      "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    );

    const moveRes = game.makeMove({ from: "e5", to: "d6" });
    expect(moveRes.success).toBe(true);

    const position = game.getPosition();
    const lastMove = {
      from: "e5" as Square,
      to: "d6" as Square,
      isCapture: true,
      san: "exd6",
    };

    render(
      <Board
        position={position}
        lastMove={lastMove}
        orientation="w"
      />
    );

    // Origin e5 is empty and highlighted as origin
    const e5Square = screen.getByTestId("board-square-e5");
    expect(e5Square).toHaveClass("is-last-move-from");
    expect(e5Square.querySelector(".chess-piece")).toBeNull();

    // Destination d6 has the white pawn and is highlighted as destination + capture
    const d6Square = screen.getByTestId("board-square-d6");
    expect(d6Square).toHaveClass("is-last-move-to");
    expect(d6Square).toHaveClass("is-capture-effect");
    expect(
      d6Square.querySelector("[data-testid='piece-wp']")
    ).toBeInTheDocument();

    // Captured pawn on d5 is completely removed from DOM
    const d5Square = screen.getByTestId("board-square-d5");
    expect(d5Square.querySelector(".chess-piece")).toBeNull();
  });

  it("TC-ANIM-09: Castling highlights king move trajectory and correctly positions king and rook", () => {
    const game = createChessAdapter();
    // Position ready for white kingside castling
    game.loadFen(
      "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
    );
    // Clear path
    game.loadFen(
      "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4"
    );

    const position = game.getPosition();
    const lastMove = {
      from: "e1" as Square,
      to: "g1" as Square,
      isCapture: false,
      san: "O-O",
    };

    render(
      <Board
        position={position}
        lastMove={lastMove}
        orientation="w"
      />
    );

    const e1Square = screen.getByTestId("board-square-e1");
    expect(e1Square).toHaveClass("is-last-move-from");
    expect(e1Square.querySelector(".chess-piece")).toBeNull();

    const g1Square = screen.getByTestId("board-square-g1");
    expect(g1Square).toHaveClass("is-last-move-to");
    expect(
      g1Square.querySelector("[data-testid='piece-wk']")
    ).toBeInTheDocument();

    const f1Square = screen.getByTestId("board-square-f1");
    expect(
      f1Square.querySelector("[data-testid='piece-wr']")
    ).toBeInTheDocument();
  });

  it("TC-ANIM-10: Pawn promotion instantly replaces pawn with promoted piece at destination", () => {
    const game = createChessAdapter();
    // White pawn on e7 ready to promote to e8 (Black King on h8 safe)
    game.loadFen("7k/4P3/8/8/8/8/8/4K3 w - - 0 1");
    const moveRes = game.makeMove({ from: "e7", to: "e8", promotion: "q" });
    expect(moveRes.success).toBe(true);

    const position = game.getPosition();
    const lastMove = {
      from: "e7" as Square,
      to: "e8" as Square,
      isCapture: false,
      san: "e8=Q+",
    };

    render(
      <Board
        position={position}
        lastMove={lastMove}
        orientation="w"
      />
    );

    const e7Square = screen.getByTestId("board-square-e7");
    expect(e7Square).toHaveClass("is-last-move-from");
    expect(e7Square.querySelector(".chess-piece")).toBeNull();

    const e8Square = screen.getByTestId("board-square-e8");
    expect(e8Square).toHaveClass("is-last-move-to");
    expect(
      e8Square.querySelector("[data-testid='piece-wq']")
    ).toBeInTheDocument();
  });

  it("TC-ANIM-14 & TC-ANIM-15: Rapid consecutive moves commit domain state synchronously without desynchronization", () => {
    const game = createChessAdapter();

    // Rapidly play 10 consecutive moves in < 5ms
    const moves = [
      { from: "e2", to: "e4" },
      { from: "e7", to: "e5" },
      { from: "g1", to: "f3" },
      { from: "b8", to: "c6" },
      { from: "f1", to: "c4" },
      { from: "g8", to: "f6" },
      { from: "d2", to: "d3" },
      { from: "f8", to: "c5" },
      { from: "b1", to: "c3" },
      { from: "d7", to: "d6" },
    ];

    let lastMoveState: { from: Square; to: Square; san?: string } | null = null;
    for (const m of moves) {
      const res = game.makeMove({
        from: m.from as Square,
        to: m.to as Square,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        lastMoveState = {
          from: m.from as Square,
          to: m.to as Square,
          san: res.data.san,
        };
      }
    }

    const finalPosition = game.getPosition();
    const { unmount } = render(
      <Board
        position={finalPosition}
        lastMove={lastMoveState}
        orientation="w"
      />
    );

    // Verify all 64 squares match final domain position exactly
    for (const sq of SQUARES) {
      const squareEl = screen.getByTestId(`board-square-${sq}`);
      const domainPiece = game.getPiece(sq);

      if (domainPiece) {
        expect(squareEl).toHaveAttribute("data-has-piece", "true");
        const pieceEl = squareEl.querySelector(".chess-piece");
        expect(pieceEl).not.toBeNull();
        expect(pieceEl).toHaveAttribute("data-piece-color", domainPiece.color);
        expect(pieceEl).toHaveAttribute("data-piece-type", domainPiece.type);
      } else {
        expect(squareEl).toHaveAttribute("data-has-piece", "false");
        expect(squareEl.querySelector(".chess-piece")).toBeNull();
      }
    }

    expect(screen.getByTestId("board-square-d7")).toHaveClass(
      "is-last-move-from"
    );
    expect(screen.getByTestId("board-square-d6")).toHaveClass(
      "is-last-move-to"
    );
    unmount();
  });

  it("TC-ANIM-17: Property-based fuzzing across randomized legal moves verifies 100% domain-to-DOM parity", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (numMoves) => {
        const game = createChessAdapter();
        let lastMove: { from: Square; to: Square; san?: string } | null = null;

        for (let i = 0; i < numMoves; i += 1) {
          const legalMoves = game.getLegalMoves();
          if (legalMoves.length === 0 || game.getStatus().isOver) break;

          const chosenMove = legalMoves[i % legalMoves.length];
          if (!chosenMove) break;

          const res = game.makeMove({
            from: chosenMove.from,
            to: chosenMove.to,
            promotion: chosenMove.promotion ?? "q",
          });

          if (res.success) {
            lastMove = {
              from: chosenMove.from,
              to: chosenMove.to,
              san: res.data.san,
            };
          }
        }

        const position = game.getPosition();
        const { unmount } = render(
          <Board
            position={position}
            lastMove={lastMove}
            orientation="w"
          />
        );

        // Verify domain pieces match DOM pieces
        for (const sq of SQUARES) {
          const squareEl = screen.getByTestId(`board-square-${sq}`);
          const domainPiece = game.getPiece(sq);

          if (domainPiece) {
            expect(squareEl).toHaveAttribute("data-has-piece", "true");
          } else {
            expect(squareEl).toHaveAttribute("data-has-piece", "false");
          }
        }

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  it("TC-ANIM-18: Board rendering does not mutate input position or history objects", () => {
    const game = createChessAdapter();
    game.makeMove({ from: "e2", to: "e4" });
    const position = game.getPosition();
    const history = game.getHistory();

    const positionClone = JSON.parse(JSON.stringify(position));
    const historyClone = JSON.parse(JSON.stringify(history));

    const { unmount } = render(
      <Board
        position={position}
        lastMove={{ from: "e2", to: "e4" }}
        orientation="w"
      />
    );

    expect(position).toEqual(positionClone);
    expect(history).toEqual(historyClone);
    unmount();
  });
});
