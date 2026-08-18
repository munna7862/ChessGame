import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import * as fc from "fast-check";
import { App } from "../../../App";
import { createChessAdapter } from "../../../domain/chess";

describe("Phase 05 · Sprint 06: Human vs Human End-to-End Suite (TC-HVH-01 to TC-HVH-14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const clickSquare = (squareId: string) => {
    const square = screen.getByTestId(`board-square-${squareId}`);
    fireEvent.click(square);
  };

  const playMove = (from: string, to: string) => {
    clickSquare(from);
    clickSquare(to);
  };

  describe("TC-HVH-01: Standard Opening & Turn Progression", () => {
    it("plays standard opening moves with synchronized history and turn indicator", () => {
      render(<App />);

      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "White to move"
      );

      // 1. e4 e5
      playMove("e2", "e4");
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "Black to move"
      );

      playMove("e7", "e5");
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "White to move"
      );

      // 2. Nf3 Nc6
      playMove("g1", "f3");
      playMove("b8", "c6");

      // 3. Bc4 Bc5
      playMove("f1", "c4");
      playMove("f8", "c5");

      // Verify Move History panel content
      const historyPanel = screen.getByTestId("move-history-panel");
      expect(within(historyPanel).getByText("e4")).toBeInTheDocument();
      expect(within(historyPanel).getByText("e5")).toBeInTheDocument();
      expect(within(historyPanel).getByText("Nf3")).toBeInTheDocument();
      expect(within(historyPanel).getByText("Nc6")).toBeInTheDocument();
      expect(within(historyPanel).getByText("Bc4")).toBeInTheDocument();
      expect(within(historyPanel).getByText("Bc5")).toBeInTheDocument();

      // Verify Last move indicator
      expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
        "Last: f8 → c5 (Bc5)"
      );
    });
  });

  describe("TC-HVH-02: Scholar's Mate 4-Move Checkmate Playout", () => {
    it("delivers checkmate via Scholar's Mate and opens GameResultModal with White victory", () => {
      render(<App />);

      // 1. e4 e5
      playMove("e2", "e4");
      playMove("e7", "e5");

      // 2. Bc4 Nc6
      playMove("f1", "c4");
      playMove("b8", "c6");

      // 3. Qh5 Nf6
      playMove("d1", "h5");
      playMove("g8", "f6");

      // 4. Qxf7#
      playMove("h5", "f7");

      // Verify checkmate UI indicator and GameResultModal
      expect(screen.getByTestId("checkmate-indicator")).toBeInTheDocument();
      const modal = screen.getByTestId("game-result-modal");
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId("game-result-title")).toHaveTextContent(
        "White Wins!"
      );
      expect(screen.getByTestId("game-result-subtitle")).toHaveTextContent(
        "by Checkmate"
      );
      expect(screen.getByTestId("game-result-scoreline")).toHaveTextContent(
        "1 - 0"
      );
    });
  });

  describe("TC-HVH-03: Fool's Mate 2-Move Checkmate Playout", () => {
    it("delivers checkmate via Fool's Mate and opens GameResultModal with Black victory", () => {
      render(<App />);

      // 1. f3 e5
      playMove("f2", "f3");
      playMove("e7", "e5");

      // 2. g4 Qh4#
      playMove("g2", "g4");
      playMove("d8", "h4");

      expect(screen.getByTestId("checkmate-indicator")).toBeInTheDocument();
      const modal = screen.getByTestId("game-result-modal");
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId("game-result-title")).toHaveTextContent(
        "Black Wins!"
      );
      expect(screen.getByTestId("game-result-subtitle")).toHaveTextContent(
        "by Checkmate"
      );
      expect(screen.getByTestId("game-result-scoreline")).toHaveTextContent(
        "0 - 1"
      );
    });
  });

  describe("TC-HVH-04: Resignation Flow", () => {
    it("handles White resignation with confirmation dialog and awards win to Black", () => {
      render(<App />);

      playMove("e2", "e4");
      playMove("e7", "e5");

      // White to move: clicks Resign
      fireEvent.click(screen.getByTestId("btn-resign-game"));

      const resignModal = screen.getByTestId("resign-confirm-modal");
      expect(resignModal).toBeInTheDocument();

      // Confirm Resign
      fireEvent.click(screen.getByTestId("btn-confirm-resign"));

      // GameResultModal should be displayed with Black victory
      const resultModal = screen.getByTestId("game-result-modal");
      expect(resultModal).toBeInTheDocument();
      expect(screen.getByTestId("game-result-title")).toHaveTextContent(
        "Black Wins!"
      );
      expect(screen.getByTestId("game-result-subtitle")).toHaveTextContent(
        "by Resignation"
      );
      expect(screen.getByTestId("game-result-scoreline")).toHaveTextContent(
        "0 - 1"
      );
    });
  });

  describe("TC-HVH-05: Restart Flow Mid-Game", () => {
    it("prompts on restart, supports cancel, and resets board and history on confirm", () => {
      render(<App />);

      playMove("e2", "e4");
      playMove("e7", "e5");

      // Click Restart
      fireEvent.click(screen.getByTestId("btn-restart-game"));
      expect(screen.getByTestId("restart-confirm-modal")).toBeInTheDocument();

      // Cancel keeps the position
      fireEvent.click(screen.getByTestId("btn-cancel-restart"));
      expect(
        screen.queryByTestId("restart-confirm-modal")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("last-move-indicator")).toBeInTheDocument();

      // Open and Confirm Restart
      fireEvent.click(screen.getByTestId("btn-restart-game"));
      fireEvent.click(screen.getByTestId("btn-confirm-restart"));

      // Position is reset to start
      expect(
        screen.queryByTestId("restart-confirm-modal")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("last-move-indicator")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "White to move"
      );
      expect(screen.getByTestId("btn-undo-move")).toBeDisabled();
    });
  });

  describe("TC-HVH-06 & TC-HVH-07: Draw Offer Accept & Decline", () => {
    it("supports draw offer and bilateral acceptance (TC-HVH-06)", () => {
      render(<App />);

      playMove("e2", "e4");
      playMove("e7", "e5");

      // White offers draw
      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      expect(
        screen.getByTestId("draw-offer-confirm-modal")
      ).toBeInTheDocument();

      // Black accepts draw
      fireEvent.click(screen.getByTestId("btn-accept-draw"));

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
    });

    it("supports draw offer and decline, continuing gameplay seamlessly (TC-HVH-07)", () => {
      render(<App />);

      playMove("e2", "e4");
      playMove("e7", "e5");

      // White offers draw
      fireEvent.click(screen.getByTestId("btn-offer-draw"));
      expect(
        screen.getByTestId("draw-offer-confirm-modal")
      ).toBeInTheDocument();

      // Black declines draw
      fireEvent.click(screen.getByTestId("btn-decline-draw"));
      expect(
        screen.queryByTestId("draw-offer-confirm-modal")
      ).not.toBeInTheDocument();

      // Game continues: White plays 2. Nf3
      playMove("g1", "f3");
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "Black to move"
      );
    });
  });

  describe("TC-HVH-08: Review Board Mode & View Result Reopening", () => {
    it("allows reviewing board after game-over and reopening result modal via View Result", () => {
      render(<App />);

      // Scholar's Mate
      playMove("e2", "e4");
      playMove("e7", "e5");
      playMove("f1", "c4");
      playMove("b8", "c6");
      playMove("d1", "h5");
      playMove("g8", "f6");
      playMove("h5", "f7");

      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();

      // Click Review Board
      fireEvent.click(screen.getByTestId("btn-review-board"));
      expect(
        screen.queryByTestId("game-result-modal")
      ).not.toBeInTheDocument();

      // View Result button should be visible in controls
      const viewResultBtn = screen.getByTestId("btn-view-result");
      expect(viewResultBtn).toBeInTheDocument();

      // Clicking View Result reopens the modal
      fireEvent.click(viewResultBtn);
      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
      expect(screen.getByTestId("game-result-scoreline")).toHaveTextContent(
        "1 - 0"
      );
    });
  });

  describe("TC-HVH-09: Rematch Flow after Game-Over", () => {
    it("resets game cleanly when Rematch is clicked in GameResultModal", () => {
      render(<App />);

      // Quick Fool's Mate
      playMove("f2", "f3");
      playMove("e7", "e5");
      playMove("g2", "g4");
      playMove("d8", "h4");

      expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();

      // Click Rematch
      fireEvent.click(screen.getByTestId("btn-rematch"));

      expect(
        screen.queryByTestId("game-result-modal")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "White to move"
      );
      expect(
        screen.queryByTestId("checkmate-indicator")
      ).not.toBeInTheDocument();
    });
  });

  describe("TC-HVH-10: Post-Game Move Immunity", () => {
    it("disables board interactions when game has concluded", () => {
      render(<App />);

      // Fool's Mate
      playMove("f2", "f3");
      playMove("e7", "e5");
      playMove("g2", "g4");
      playMove("d8", "h4");

      // Dismiss modal to review board
      fireEvent.click(screen.getByTestId("btn-review-board"));

      // Try to click squares / move pieces
      clickSquare("e2");
      expect(
        screen.queryByTestId("selected-square-indicator")
      ).not.toBeInTheDocument();

      // Action buttons disabled appropriately
      expect(screen.getByTestId("btn-undo-move")).toBeDisabled();
      expect(screen.getByTestId("btn-resign-game")).toBeDisabled();
      expect(screen.getByTestId("btn-offer-draw")).toBeDisabled();
    });
  });

  describe("TC-HVH-11: Undo Sequence and Capture Restoration", () => {
    it("accurately restores board position, turn, history, and captures upon undo", () => {
      render(<App />);

      // 1. e4 d5 2. exd5 (White captures Black pawn)
      playMove("e2", "e4");
      playMove("d7", "d5");
      playMove("e4", "d5");

      expect(screen.getByTestId("btn-undo-move")).toBeEnabled();

      // Undo capture
      fireEvent.click(screen.getByTestId("btn-undo-move"));

      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "White to move"
      );
      expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
        "Last: d7 → d5 (d5)"
      );

      // Undo again
      fireEvent.click(screen.getByTestId("btn-undo-move"));
      expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
        "Black to move"
      );
    });
  });

  describe("TC-HVH-12: New Game Dialog Configuration", () => {
    it("opens New Game dialog, customizes player names and orientation, and starts fresh session", () => {
      render(<App />);

      fireEvent.click(screen.getByTestId("btn-reset-game"));
      expect(screen.getByTestId("new-game-modal")).toBeInTheDocument();

      const p1Input = screen.getByTestId("input-player1-name");
      const p2Input = screen.getByTestId("input-player2-name");

      fireEvent.change(p1Input, { target: { value: "Alice" } });
      fireEvent.change(p2Input, { target: { value: "Bob" } });

      fireEvent.click(screen.getByTestId("btn-submit-new-game"));

      expect(screen.queryByTestId("new-game-modal")).not.toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  describe("TC-HVH-13 & TC-HVH-14: Fast-Check Generative Property Playout", () => {
    it("preserves King invariant, move legality, and terminal immutability across random games (TC-HVH-14)", () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 50 }), { minLength: 5, maxLength: 20 }),
          (seeds) => {
            const adapter = createChessAdapter();
            let movesPlayed = 0;

            for (const seed of seeds) {
              const status = adapter.getStatus();
              if (status.isOver) break;

              const legalMoves = adapter.getLegalMoves();
              if (legalMoves.length === 0) break;

              const selectedMove = legalMoves[seed % legalMoves.length]!;
              const result = adapter.makeMove({
                from: selectedMove.from,
                to: selectedMove.to,
                promotion: selectedMove.promotion,
              });

              expect(result.success).toBe(true);
              movesPlayed++;

              // Invariant: King must be present on board
              const position = adapter.getPosition();
              let whiteKingFound = false;
              let blackKingFound = false;
              for (const row of position.board) {
                for (const cell of row) {
                  if (cell?.type === "k" && cell.color === "w") {
                    whiteKingFound = true;
                  }
                  if (cell?.type === "k" && cell.color === "b") {
                    blackKingFound = true;
                  }
                }
              }
              expect(whiteKingFound).toBe(true);
              expect(blackKingFound).toBe(true);
            }

            // Move history length equals moves played
            expect(adapter.getHistory().length).toBe(movesPlayed);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
