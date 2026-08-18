import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import App from "../../../App";
import { createGameSession } from "../GameSessionController";

describe("Undo, Restart, and Resign Game Controls (TC-CTRL-01 to TC-CTRL-16)", () => {
  it("TC-CTRL-01 & TC-CTRL-02: Undo button is disabled initially, enabled after move, and reverts board position", () => {
    render(<App />);

    const undoBtn = screen.getByTestId("btn-undo-move");
    expect(undoBtn).toBeDisabled();

    // 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );
    expect(undoBtn).not.toBeDisabled();
    expect(screen.getByTestId("last-move-indicator")).toBeInTheDocument();

    // Undo 1. e4
    fireEvent.click(undoBtn);

    // Board position is reverted: turn is White, pawn back on e2, last move removed
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(
      screen
        .getByTestId("board-square-e2")
        .querySelector("[data-testid='piece-wp']")
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId("board-square-e4")
        .querySelector("[data-testid='piece-wp']")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("last-move-indicator")).not.toBeInTheDocument();
    expect(undoBtn).toBeDisabled();
  });

  it("TC-CTRL-03: Multi-move undo sequence step-by-step reversibility", () => {
    render(<App />);

    const undoBtn = screen.getByTestId("btn-undo-move");

    // 1. e4 e5
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));

    // 2. Nf3
    fireEvent.click(screen.getByTestId("board-square-g1"));
    fireEvent.click(screen.getByTestId("board-square-f3"));

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "Last: g1 → f3 (Nf3)"
    );

    // Undo 2. Nf3 -> Turn White, last move e7 -> e5
    fireEvent.click(undoBtn);
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "Last: e7 → e5 (e5)"
    );

    // Undo 1... e5 -> Turn Black, last move e2 -> e4
    fireEvent.click(undoBtn);
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "Last: e2 → e4 (e4)"
    );

    // Undo 1. e4 -> Turn White, no last move
    fireEvent.click(undoBtn);
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.queryByTestId("last-move-indicator")).not.toBeInTheDocument();
    expect(undoBtn).toBeDisabled();
  });

  it("TC-CTRL-04: Undo capture restores captured piece and updates captured pieces tray & material balance", () => {
    render(<App />);

    // 1. e4 d5
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    fireEvent.click(screen.getByTestId("board-square-d7"));
    fireEvent.click(screen.getByTestId("board-square-d5"));

    // 2. exd5 (Capture Black pawn)
    fireEvent.click(screen.getByTestId("board-square-e4"));
    fireEvent.click(screen.getByTestId("board-square-d5"));

    // Verify capture registered
    expect(screen.getByTestId("captured-tray-w-advantage")).toHaveTextContent(
      "+1"
    );

    // Undo capture
    fireEvent.click(screen.getByTestId("btn-undo-move"));

    // Both pawns restored
    expect(
      screen
        .getByTestId("board-square-e4")
        .querySelector("[data-testid='piece-wp']")
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId("board-square-d5")
        .querySelector("[data-testid='piece-bp']")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("captured-tray-w-advantage")
    ).not.toBeInTheDocument();
  });

  it("TC-CTRL-08 to TC-CTRL-10: Restart confirmation flow and transient state reset", () => {
    render(<App />);

    // Play a move: 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));
    expect(screen.getByTestId("last-move-indicator")).toBeInTheDocument();

    // Click Restart button
    fireEvent.click(screen.getByTestId("btn-restart-game"));

    // Confirmation modal appears
    expect(screen.getByTestId("restart-confirm-modal")).toBeInTheDocument();

    // Cancel restart
    fireEvent.click(screen.getByTestId("btn-cancel-restart"));
    expect(
      screen.queryByTestId("restart-confirm-modal")
    ).not.toBeInTheDocument();
    // Game still has 1. e4
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );

    // Open restart and confirm
    fireEvent.click(screen.getByTestId("btn-restart-game"));
    fireEvent.click(screen.getByTestId("btn-confirm-restart"));

    // Board reset cleanly
    expect(
      screen.queryByTestId("restart-confirm-modal")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.queryByTestId("last-move-indicator")).not.toBeInTheDocument();
    expect(screen.getByTestId("btn-undo-move")).toBeDisabled();
  });

  it("TC-CTRL-11 to TC-CTRL-14: Resignation confirmation flow, status indicator, and board non-interactivity", () => {
    render(<App />);

    // White resigns on move 1
    fireEvent.click(screen.getByTestId("btn-resign-game"));

    // Resign modal appears
    const resignModal = screen.getByTestId("resign-confirm-modal");
    expect(resignModal).toBeInTheDocument();
    expect(
      screen.getByTestId("resign-confirm-modal-message")
    ).toHaveTextContent("White (White) wants to resign");

    // Cancel resignation
    fireEvent.click(screen.getByTestId("btn-cancel-resign"));
    expect(
      screen.queryByTestId("resign-confirm-modal")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("chess-board")).toHaveAttribute(
      "aria-disabled",
      "false"
    );

    // Reopen and confirm resignation
    fireEvent.click(screen.getByTestId("btn-resign-game"));
    fireEvent.click(screen.getByTestId("btn-confirm-resign"));

    // Resignation status displayed in status bar
    expect(screen.getByTestId("resignation-indicator")).toHaveTextContent(
      "White Resigned · Black Wins"
    );

    // Board is disabled (aria-disabled = true)
    expect(screen.getByTestId("chess-board")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByTestId("btn-resign-game")).toBeDisabled();
    expect(screen.getByTestId("btn-undo-move")).toBeDisabled();

    // Clicking squares after resignation does not select or move anything
    fireEvent.click(screen.getByTestId("board-square-e2"));
    expect(screen.getByTestId("board-square-e2")).not.toHaveClass(
      "is-selected"
    );
    expect(
      screen.queryByTestId("selected-square-indicator")
    ).not.toBeInTheDocument();
  });

  it("TC-CTRL-16: Fast-check property fuzzing: N random moves followed by N undos restores initial state", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), (moveCount) => {
        const session = createGameSession();
        const initialFen = session.exportFen();

        let applied = 0;
        for (let i = 0; i < moveCount; i += 1) {
          const legalMoves = session.getLegalMoves();
          if (legalMoves.length === 0) break;
          const selectedMove = legalMoves[0];
          if (!selectedMove) break;
          const res = session.makeMove({
            from: selectedMove.from,
            to: selectedMove.to,
            promotion: selectedMove.promotion,
          });
          if (!res.success) break;
          applied += 1;
        }

        // Apply undos
        for (let i = 0; i < applied; i += 1) {
          const undoRes = session.undo();
          expect(undoRes.success).toBe(true);
        }

        expect(session.exportFen()).toBe(initialFen);
        expect(session.getHistory()).toHaveLength(0);
        expect(session.getState().turn).toBe("w");
      }),
      { numRuns: 25 }
    );
  });
});
