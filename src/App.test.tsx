import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { StatusBadge } from "./components/StatusBadge";
import { Header } from "./components/Header";

describe("ChessForge Bootstrap Layout & Board UI (TC-BOOT-05, TC-PIECE-23, TC-SEL-01 to TC-ANIM-13)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders the root application container and title", () => {
    render(<App />);
    expect(screen.getByTestId("chessforge-app")).toBeInTheDocument();
    expect(screen.getByTestId("app-title")).toHaveTextContent("ChessForge");
  });

  it("renders the Header with branding and version tag", () => {
    render(<Header />);
    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByText("v0.1.0-alpha")).toBeInTheDocument();
  });

  it("renders the StatusBadge with correct status indicator and custom testid", () => {
    render(
      <StatusBadge
        label="Engine Connected"
        status="ready"
        data-testid="custom-badge"
      />
    );
    const badge = screen.getByTestId("custom-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Engine Connected");
  });

  it("displays local-first and performance metrics with standard testids", () => {
    render(<App />);
    expect(screen.getByTestId("metric-memory")).toHaveTextContent("< 150 MB");
    expect(screen.getByTestId("metric-fps")).toHaveTextContent("60 FPS");
    expect(screen.getByTestId("metric-local")).toHaveTextContent("100% Local");
    expect(screen.getByTestId("feature-list")).toBeInTheDocument();
  });

  it("renders the chessboard and active player panels in initial position", () => {
    render(<App />);
    expect(screen.getByTestId("chess-board")).toBeInTheDocument();
    expect(screen.getByTestId("piece-wk")).toBeInTheDocument();
    expect(screen.getByTestId("piece-bk")).toBeInTheDocument();
    expect(screen.getAllByTestId("piece-wp")).toHaveLength(8);
    expect(screen.getAllByTestId("piece-bp")).toHaveLength(8);

    // Active player panels rendered
    expect(screen.getByTestId("player-panel-w")).toBeInTheDocument();
    expect(screen.getByTestId("player-panel-b")).toBeInTheDocument();
    expect(screen.getByTestId("player-name-w")).toHaveTextContent("White");
    expect(screen.getByTestId("player-name-b")).toHaveTextContent("Black");
  });

  it("handles piece selection, legal move indicators, move execution, and last move state", () => {
    render(<App />);

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );

    const e2Square = screen.getByTestId("board-square-e2");
    fireEvent.click(e2Square);

    expect(e2Square).toHaveClass("is-selected");
    expect(screen.getByTestId("selected-square-indicator")).toHaveTextContent(
      "Selected: e2 (2 moves)"
    );
    expect(screen.getByTestId("legal-target-e3")).toBeInTheDocument();
    expect(screen.getByTestId("legal-target-e4")).toBeInTheDocument();

    // Click destination e4
    const e4Square = screen.getByTestId("board-square-e4");
    fireEvent.click(e4Square);

    // After move, turn is Black and piece moved to e4
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );
    expect(
      screen
        .getByTestId("board-square-e4")
        .querySelector("[data-testid='piece-wp']")
    ).toBeInTheDocument();

    // Last move indicator is visible in status bar
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "Last: e2 → e4 (e4)"
    );
    expect(screen.getByTestId("board-square-e2")).toHaveClass(
      "is-last-move-from"
    );
    expect(screen.getByTestId("board-square-e4")).toHaveClass(
      "is-last-move-to"
    );
  });

  it("supports toggling reduced motion preference", () => {
    render(<App />);

    const motionBtn = screen.getByTestId("btn-toggle-motion");
    expect(motionBtn).toHaveTextContent("Motion: Standard");

    fireEvent.click(motionBtn);
    expect(motionBtn).toHaveTextContent("Motion: Reduced");
    expect(screen.getByTestId("chess-board")).toHaveClass("reduced-motion");

    fireEvent.click(motionBtn);
    expect(motionBtn).toHaveTextContent("Motion: Standard");
    expect(screen.getByTestId("chess-board")).not.toHaveClass("reduced-motion");
  });

  it("TC-NG-01 & TC-NG-14: opens New Game dialog, configures session, and resets board", () => {
    render(<App />);

    const flipBtn = screen.getByTestId("btn-flip-board");
    fireEvent.click(flipBtn);

    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-orientation", "b");

    // Make a move first
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));
    expect(screen.getByTestId("last-move-indicator")).toBeInTheDocument();

    // Open New Game modal
    const resetBtn = screen.getByTestId("btn-reset-game");
    fireEvent.click(resetBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Submit new game setup
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.queryByTestId("last-move-indicator")).not.toBeInTheDocument();
  });

  it("TC-PROM-01: renders check indicator when a move delivers check", () => {
    render(<App />);

    // Play Fool's mate setup: 1. f3 e5 2. g4 Qh4# (checkmate)
    // 1. f3
    fireEvent.click(screen.getByTestId("board-square-f2"));
    fireEvent.click(screen.getByTestId("board-square-f3"));

    // 1... e5
    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));

    // 2. g4
    fireEvent.click(screen.getByTestId("board-square-g2"));
    fireEvent.click(screen.getByTestId("board-square-g4"));

    // 2... Qh4#
    fireEvent.click(screen.getByTestId("board-square-d8"));
    fireEvent.click(screen.getByTestId("board-square-h4"));

    // Verify Checkmate status in bar and on King square e1
    expect(screen.getByTestId("checkmate-indicator")).toHaveTextContent(
      "Checkmate! Black wins"
    );
    expect(screen.getByTestId("board-square-e1")).toHaveClass("is-checkmate");
    expect(screen.getByTestId("checkmate-indicator-e1")).toBeInTheDocument();
  });

  it("TC-GS-12 & TC-GS-13: executes complete Scholar's Mate through UI, updates session, and verifies game over", () => {
    render(<App />);

    // 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );

    // 1... e5
    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );

    // 2. Qh5
    fireEvent.click(screen.getByTestId("board-square-d1"));
    fireEvent.click(screen.getByTestId("board-square-h5"));

    // 2... Nc6
    fireEvent.click(screen.getByTestId("board-square-b8"));
    fireEvent.click(screen.getByTestId("board-square-c6"));

    // 3. Bc4
    fireEvent.click(screen.getByTestId("board-square-f1"));
    fireEvent.click(screen.getByTestId("board-square-c4"));

    // 3... Nf6
    fireEvent.click(screen.getByTestId("board-square-g8"));
    fireEvent.click(screen.getByTestId("board-square-f6"));

    // 4. Qxf7#
    fireEvent.click(screen.getByTestId("board-square-h5"));
    fireEvent.click(screen.getByTestId("board-square-f7"));

    expect(screen.getByTestId("checkmate-indicator")).toHaveTextContent(
      "Checkmate! White wins"
    );
    expect(screen.getByTestId("board-square-e8")).toHaveClass("is-checkmate");
    expect(screen.getByTestId("chess-board")).toHaveAttribute(
      "aria-disabled",
      "true"
    );

    // Reset game and verify new game state is completely clean
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.queryByTestId("checkmate-indicator")).not.toBeInTheDocument();
    expect(screen.getByTestId("chess-board")).toHaveAttribute(
      "aria-disabled",
      "false"
    );
  });

  it("TC-HIST-08 & TC-CAPT-01: renders move history and captured pieces live during multi-move playout", () => {
    render(<App />);

    // Initially move history is empty
    expect(screen.getByTestId("move-history-empty")).toBeInTheDocument();

    // 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    expect(screen.queryByTestId("move-history-empty")).not.toBeInTheDocument();
    expect(screen.getByTestId("move-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("move-cell-0")).toHaveTextContent("e4");
    expect(screen.getByTestId("move-cell-0")).toHaveClass("move-cell--active");

    // 1... d5
    fireEvent.click(screen.getByTestId("board-square-d7"));
    fireEvent.click(screen.getByTestId("board-square-d5"));

    expect(screen.getByTestId("move-cell-1")).toHaveTextContent("d5");
    expect(screen.getByTestId("move-cell-1")).toHaveClass("move-cell--active");

    // 2. exd5 (Capture Black pawn)
    fireEvent.click(screen.getByTestId("board-square-e4"));
    fireEvent.click(screen.getByTestId("board-square-d5"));

    expect(screen.getByTestId("move-row-2")).toBeInTheDocument();
    expect(screen.getByTestId("move-cell-2")).toHaveTextContent("exd5");

    // Verify White captured Black pawn and displays +1 advantage
    expect(screen.getByTestId("captured-pieces-w")).toBeInTheDocument();
    expect(screen.getByTestId("captured-tray-w-advantage")).toHaveTextContent(
      "+1"
    );
    expect(
      screen.getByTestId("history-captured-w-advantage")
    ).toHaveTextContent("+1");
  });

  it("TC-CLK-UI-25: starts game with time control preset and displays clocks in PlayerPanels", () => {
    render(<App />);

    // Open New Game Modal
    fireEvent.click(screen.getByTestId("btn-reset-game"));

    // Select Blitz 3+2
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Both clocks are rendered with initial time 3:00
    expect(screen.getByTestId("clock-display-w")).toBeInTheDocument();
    expect(screen.getByTestId("clock-display-b")).toBeInTheDocument();
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("3:00");
  });

  it("TC-RECOV-APP-01: prompts to resume game when opening App with active game in persistence", () => {
    // Seed persistence with an active game
    localStorage.setItem(
      "chessforge_state_v1",
      JSON.stringify({
        version: 1,
        updatedAt: Date.now(),
        settings: {
          boardTheme: "classic",
          pieceSet: "standard",
          showCoordinates: true,
          showLegalMoves: true,
          showLastMove: true,
          soundEnabled: true,
          autoQueen: false,
          engineDifficulty: 3,
          reducedMotion: false,
          volume: 80,
        },
        activeGame: {
          id: "app-recover-test",
          mode: "human_vs_human",
          fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
          moveHistorySan: ["e4", "e5"],
          players: {
            w: { id: "p1", name: "Alpha", color: "w", type: "human" },
            b: { id: "p2", name: "Beta", color: "b", type: "human" },
          },
          userOrientation: "w",
          startedAt: Date.now() - 10000,
          updatedAt: Date.now() - 5000,
        },
      })
    );

    render(<App />);

    // Recovery modal should appear
    expect(screen.getByTestId("game-recovery-modal")).toBeInTheDocument();
    expect(screen.getByTestId("recovery-players")).toHaveTextContent(
      "Alpha (White) vs Beta (Black)"
    );

    // Click Continue Game
    fireEvent.click(screen.getByTestId("btn-continue-game"));

    // Modal closes and game is resumed
    expect(screen.queryByTestId("game-recovery-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("player-name-w")).toHaveTextContent("Alpha");
    expect(screen.getByTestId("player-name-b")).toHaveTextContent("Beta");
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "Last: e7 → e5 (e5)"
    );
  });

  it("opens PGN Export modal when Export PGN button is clicked", () => {
    render(<App />);

    const exportBtn = screen.getByTestId("btn-export-pgn");
    fireEvent.click(exportBtn);

    expect(screen.getByTestId("pgn-export-modal")).toBeInTheDocument();
    expect(screen.getByTestId("pgn-export-textarea")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-close-export-modal"));
    expect(screen.queryByTestId("pgn-export-modal")).not.toBeInTheDocument();
  });

  it("opens PGN Import modal, validates and imports game successfully", () => {
    render(<App />);

    const importBtn = screen.getByTestId("btn-import-pgn");
    fireEvent.click(importBtn);

    expect(screen.getByTestId("pgn-import-modal")).toBeInTheDocument();

    const samplePgn = `[Event "Candidates 2026"]
[White "Fabiano Caruana"]
[Black "Hikaru Nakamura"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 1-0`;

    fireEvent.change(screen.getByTestId("pgn-import-textarea"), {
      target: { value: samplePgn },
    });

    expect(screen.getByTestId("pgn-import-preview-card")).toBeInTheDocument();
    expect(screen.getByTestId("preview-white-player")).toHaveTextContent(
      "Fabiano Caruana"
    );

    fireEvent.click(screen.getByTestId("btn-confirm-import-pgn"));

    expect(screen.queryByTestId("pgn-import-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("player-name-w")).toHaveTextContent(
      "Fabiano Caruana"
    );
    expect(screen.getByTestId("player-name-b")).toHaveTextContent(
      "Hikaru Nakamura"
    );
  });
});
