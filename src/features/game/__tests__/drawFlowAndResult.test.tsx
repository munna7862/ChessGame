import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import App from "../../../App";
import { GameResultModal } from "../GameResultModal";
import { deriveGameResult } from "../gameResultUtils";
import type { GameStatus, GameState } from "../../../domain/chess/types";

describe("Phase 05 · Sprint 05: Draw Flow and Game Result (TC-DRAW-01 to TC-DRAW-16)", () => {
  const defaultPlayers = {
    w: {
      id: "p1",
      name: "Magnus",
      color: "w" as const,
      type: "human" as const,
    },
    b: {
      id: "p2",
      name: "Hikaru",
      color: "b" as const,
      type: "human" as const,
    },
  };

  describe("TC-DRAW-01 to TC-DRAW-04: Draw Offer & Bilateral Response", () => {
    it("TC-DRAW-01: Draw button is enabled in active game and opens confirmation modal", () => {
      render(<App />);

      const offerDrawBtn = screen.getByTestId("btn-offer-draw");
      expect(offerDrawBtn).toBeInTheDocument();
      expect(offerDrawBtn).not.toBeDisabled();

      fireEvent.click(offerDrawBtn);

      const modal = screen.getByTestId("draw-offer-confirm-modal");
      expect(modal).toBeInTheDocument();
      expect(screen.getByText("Draw Offered?")).toBeInTheDocument();
      expect(screen.getByText(/White has offered a draw/i)).toBeInTheDocument();
      expect(screen.getByTestId("btn-accept-draw")).toBeInTheDocument();
      expect(screen.getByTestId("btn-decline-draw")).toBeInTheDocument();
    });

    it("TC-DRAW-03: Declining draw offer closes dialog and leaves game active", () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      expect(
        screen.getByTestId("draw-offer-confirm-modal")
      ).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("btn-decline-draw"));
      expect(
        screen.queryByTestId("draw-offer-confirm-modal")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("game-result-modal")).not.toBeInTheDocument();

      // Board remains interactive
      const e2 = screen.getByTestId("board-square-e2");
      fireEvent.click(e2);
      expect(screen.getByTestId("selected-square-indicator")).toHaveTextContent(
        "Selected: e2"
      );
    });

    it("TC-DRAW-04: Accepting draw offer terminates game with draw_agreement, ½ - ½, and opens GameResultModal", () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      fireEvent.click(screen.getByTestId("btn-accept-draw"));

      // Confirmation modal closes, GameResultModal opens
      expect(
        screen.queryByTestId("draw-offer-confirm-modal")
      ).not.toBeInTheDocument();

      const resultModal = screen.getByTestId("game-result-modal");
      expect(resultModal).toBeInTheDocument();
      expect(screen.getByTestId("game-result-title")).toHaveTextContent(
        "Game Drawn"
      );
      expect(screen.getByTestId("game-result-subtitle")).toHaveTextContent(
        "by Mutual Agreement"
      );
      expect(screen.getByTestId("game-result-scoreline")).toHaveTextContent(
        "½ - ½"
      );

      // Draw button becomes disabled
      expect(screen.getByTestId("btn-offer-draw")).toBeDisabled();
      expect(screen.getByTestId("btn-resign-game")).toBeDisabled();
      expect(screen.getByTestId("btn-undo-move")).toBeDisabled();
    });
  });

  describe("TC-DRAW-05 to TC-DRAW-10: Game Result Taxonomy & Automatic Draw Determinations", () => {
    it("TC-DRAW-05: Checkmate game-over derives correct winner title, subtitle, and scoreline", () => {
      const checkmateStatus: GameStatus = {
        state: "checkmate",
        isOver: true,
        winner: "w",
        isCheck: true,
        inDraw: false,
        drawReason: null,
        description: "Checkmate! White wins.",
      };

      const result = deriveGameResult(checkmateStatus, defaultPlayers);
      expect(result.title).toBe("Magnus Wins!");
      expect(result.subtitle).toBe("by Checkmate");
      expect(result.score).toBe("1 - 0");
      expect(result.outcomeType).toBe("win");
    });

    it("TC-DRAW-06: Resignation game-over derives correct winner and scoreline", () => {
      const resignStatus: GameStatus = {
        state: "resigned",
        isOver: true,
        winner: "b",
        isCheck: false,
        inDraw: false,
        drawReason: null,
        description: "White resigned. Black wins.",
      };

      const result = deriveGameResult(resignStatus, defaultPlayers);
      expect(result.title).toBe("Hikaru Wins!");
      expect(result.subtitle).toBe("by Resignation");
      expect(result.score).toBe("0 - 1");
      expect(result.outcomeType).toBe("win");
    });

    it("TC-DRAW-07: Stalemate derives 'Game Drawn', 'by Stalemate', and '½ - ½'", () => {
      const stalemateStatus: GameStatus = {
        state: "stalemate",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "stalemate",
        description: "Draw by stalemate.",
      };

      const result = deriveGameResult(stalemateStatus, defaultPlayers);
      expect(result.title).toBe("Game Drawn");
      expect(result.subtitle).toBe("by Stalemate");
      expect(result.score).toBe("½ - ½");
      expect(result.outcomeType).toBe("draw");
    });

    it("TC-DRAW-08: Threefold Repetition derives 'Game Drawn' and 'by Threefold Repetition'", () => {
      const threefoldStatus: GameStatus = {
        state: "draw_threefold_repetition",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "threefold_repetition",
        description: "Draw by threefold repetition.",
      };

      const result = deriveGameResult(threefoldStatus, defaultPlayers);
      expect(result.title).toBe("Game Drawn");
      expect(result.subtitle).toBe("by Threefold Repetition");
      expect(result.score).toBe("½ - ½");
    });

    it("TC-DRAW-09: 50-Move Rule derives 'Game Drawn' and 'by 50-Move Rule'", () => {
      const fiftyStatus: GameStatus = {
        state: "draw_fifty_moves",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "fifty_moves",
        description: "Draw by 50-move rule.",
      };

      const result = deriveGameResult(fiftyStatus, defaultPlayers);
      expect(result.title).toBe("Game Drawn");
      expect(result.subtitle).toBe("by 50-Move Rule");
      expect(result.score).toBe("½ - ½");
    });

    it("TC-DRAW-10: Insufficient Material derives 'Game Drawn' and 'by Insufficient Material'", () => {
      const materialStatus: GameStatus = {
        state: "draw_insufficient_material",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "insufficient_material",
        description: "Draw by insufficient material.",
      };

      const result = deriveGameResult(materialStatus, defaultPlayers);
      expect(result.title).toBe("Game Drawn");
      expect(result.subtitle).toBe("by Insufficient Material");
      expect(result.score).toBe("½ - ½");
    });
  });

  describe("TC-DRAW-11 to TC-DRAW-15: GameResultModal Component Actions & Accessibility", () => {
    it("TC-DRAW-11 & TC-DRAW-12: 'Review Board' closes modal, disables board moves, and 'View Result' reopens modal", () => {
      render(<App />);

      // Conclude by draw agreement
      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      fireEvent.click(screen.getByTestId("btn-accept-draw"));

      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();

      // Click Review Board
      fireEvent.click(screen.getByTestId("btn-review-board"));
      expect(screen.queryByTestId("game-result-modal")).not.toBeInTheDocument();

      // Board is disabled in review mode
      const e2 = screen.getByTestId("board-square-e2");
      fireEvent.click(e2);
      expect(
        screen.queryByTestId("selected-square-indicator")
      ).not.toBeInTheDocument();

      // View Result button is visible
      const viewResultBtn = screen.getByTestId("btn-view-result");
      expect(viewResultBtn).toBeInTheDocument();

      // Reopen modal via View Result
      fireEvent.click(viewResultBtn);
      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
    });

    it("TC-DRAW-13: 'Rematch' resets board cleanly to starting position and closes modal", () => {
      render(<App />);

      // Make a move first: e2 -> e4
      fireEvent.click(screen.getByTestId("board-square-e2"));
      fireEvent.click(screen.getByTestId("board-square-e4"));

      // Conclude by draw
      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      fireEvent.click(screen.getByTestId("btn-accept-draw"));

      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();

      // Click Rematch
      fireEvent.click(screen.getByTestId("btn-rematch"));
      expect(screen.queryByTestId("game-result-modal")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("last-move-indicator")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "White to move"
      );
    });

    it("TC-DRAW-14: 'New Game' from GameResultModal opens NewGameModal", () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      fireEvent.click(screen.getByTestId("btn-accept-draw"));

      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("btn-result-new-game"));
      expect(screen.queryByTestId("game-result-modal")).not.toBeInTheDocument();
      expect(screen.getByTestId("new-game-modal")).toBeInTheDocument();
    });

    it("TC-DRAW-15: GameResultModal handles Escape key and contains valid ARIA attributes", () => {
      const onClose = vi.fn();
      const onRematch = vi.fn();
      const onNewGame = vi.fn();

      const status: GameStatus = {
        state: "draw_agreement",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "agreement",
        description: "Agreed draw",
      };

      const { rerender } = render(
        <GameResultModal
          isOpen={true}
          status={status}
          players={defaultPlayers}
          moveCount={12}
          onClose={onClose}
          onRematch={onRematch}
          onNewGame={onNewGame}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "game-result-title");
      expect(dialog).toHaveAttribute(
        "aria-describedby",
        "game-result-description"
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);

      rerender(
        <GameResultModal
          isOpen={false}
          status={status}
          players={defaultPlayers}
          moveCount={12}
          onClose={onClose}
          onRematch={onRematch}
          onNewGame={onNewGame}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("TC-DRAW-16: Property-Based Invariant Fuzzing", () => {
    it("preserves terminal game state immutability, valid draw reasons, and score ½ - ½ across arbitrary draw positions", () => {
      const drawReasons = [
        "stalemate",
        "threefold_repetition",
        "fifty_moves",
        "insufficient_material",
        "agreement",
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...drawReasons),
          fc.string({ minLength: 1, maxLength: 15 }),
          fc.string({ minLength: 1, maxLength: 15 }),
          (reason, p1, p2) => {
            const players = {
              w: {
                id: "p1",
                name: p1,
                color: "w" as const,
                type: "human" as const,
              },
              b: {
                id: "p2",
                name: p2,
                color: "b" as const,
                type: "human" as const,
              },
            };

            const state: GameState =
              reason === "stalemate"
                ? "stalemate"
                : reason === "threefold_repetition"
                  ? "draw_threefold_repetition"
                  : reason === "fifty_moves"
                    ? "draw_fifty_moves"
                    : reason === "insufficient_material"
                      ? "draw_insufficient_material"
                      : "draw_agreement";

            const status: GameStatus = {
              state,
              isOver: true,
              winner: null,
              isCheck: false,
              inDraw: true,
              drawReason: reason,
              description: `Draw by ${reason}`,
            };

            const derived = deriveGameResult(status, players);
            expect(derived.outcomeType).toBe("draw");
            expect(derived.winnerColor).toBeNull();
            expect(derived.score).toBe("½ - ½");
            expect(derived.title).toBe("Game Drawn");
            expect(derived.subtitle.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
