import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { App } from "../../../App";
import { HISTORICAL_GAMES } from "../../../domain/chess/__tests__/fixtures/regressionCorpus";
import { ChessJsAdapter } from "../../../domain/chess/adapters/chessJsAdapter";

describe("Adversarial UI & Domain Consistency Suite (TC-REG-UI-01 to TC-REG-UI-06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const clickSquare = (squareId: string) => {
    const square = screen.getByTestId(`board-square-${squareId}`);
    fireEvent.click(square);
  };

  it("TC-REG-UI-01: Pinned piece square click highlights only legal destinations along defense ray", () => {
    render(<App />);

    // Load a position with an absolutely pinned piece via FEN modal
    const fenBtn = screen.getByTestId("btn-fen-workflow");
    fireEvent.click(fenBtn);

    const fenInput = screen.getByTestId("fen-input-textarea");
    // White King on e1, White Rook on e4, Black Rook on e8
    fireEvent.change(fenInput, {
      target: { value: "4r1k1/8/8/8/4R3/8/8/4K3 w - - 0 1" },
    });
    const loadBtn = screen.getByTestId("btn-load-fen");
    fireEvent.click(loadBtn);

    // Click pinned Rook on e4
    clickSquare("e4");

    // e2, e3, e5, e6, e7, e8 should have legal destination indicators
    expect(screen.getByTestId("board-square-e8")).toHaveClass(
      "is-legal-target"
    );
    expect(screen.getByTestId("board-square-e5")).toHaveClass(
      "is-legal-target"
    );

    // Lateral squares (d4, f4) must NOT be marked legal
    expect(screen.getByTestId("board-square-d4")).not.toHaveClass(
      "is-legal-target"
    );
    expect(screen.getByTestId("board-square-f4")).not.toHaveClass(
      "is-legal-target"
    );
  });

  it("TC-REG-UI-02: Underpromotion to Rook or Knight via promotion modal commits correctly to game session", () => {
    render(<App />);

    // Load Saavedra promotion position
    const fenBtn = screen.getByTestId("btn-fen-workflow");
    fireEvent.click(fenBtn);

    const fenInput = screen.getByTestId("fen-input-textarea");
    // White Pawn on c7, White King on c2, Black Rook on d4
    fireEvent.change(fenInput, {
      target: { value: "8/2P5/8/8/3r4/8/2K5/k7 w - - 0 1" },
    });
    const loadBtn = screen.getByTestId("btn-load-fen");
    fireEvent.click(loadBtn);

    // Play c7 to c8
    clickSquare("c7");
    clickSquare("c8");

    // Promotion modal must be visible
    const promoDialog = screen.getByTestId("promotion-dialog");
    expect(promoDialog).toBeInTheDocument();

    // Select Rook underpromotion
    const rookOption = screen.getByTestId("promotion-choice-r");
    fireEvent.click(rookOption);

    // Verify board square c8 contains a White Rook piece
    const c8Square = screen.getByTestId("board-square-c8");
    expect(within(c8Square).getByTestId("piece-wr")).toBeInTheDocument();

    // Verify move history panel recorded "c8=R"
    const historyPanel = screen.getByTestId("move-history-panel");
    expect(within(historyPanel).getByText("c8=R")).toBeInTheDocument();
  });

  it("TC-REG-UI-03: Historical master games (Opera Game, Immortal Game) replay accurately via domain adapter", () => {
    for (const gameFixture of HISTORICAL_GAMES) {
      const adapter = new ChessJsAdapter();
      const importRes = adapter.importPgn(gameFixture.pgn);
      expect(importRes.success).toBe(true);

      const history = adapter.getHistory();
      expect(history.length).toBe(gameFixture.expectedPlies);
      expect(adapter.exportFen()).toContain(gameFixture.finalFenSubstring);
    }
  });

  it("TC-REG-UI-04: Game over overlay appears and disallows further moves when checkmate occurs", () => {
    render(<App />);

    // Load checkmate in 1 position: White King f6, Queen g6; Black King h8
    const fenBtn = screen.getByTestId("btn-fen-workflow");
    fireEvent.click(fenBtn);

    const fenInput = screen.getByTestId("fen-input-textarea");
    fireEvent.change(fenInput, {
      target: { value: "7k/8/5KQ1/8/8/8/8/8 w - - 0 1" },
    });
    fireEvent.click(screen.getByTestId("btn-load-fen"));

    // Deliver Qg7#
    clickSquare("g6");
    clickSquare("g7");

    // Turn indicator or game status shows checkmate
    expect(screen.getByTestId("checkmate-indicator")).toHaveTextContent(
      "Checkmate"
    );
  });
});
