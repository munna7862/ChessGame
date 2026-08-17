import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { StatusBadge } from "./components/StatusBadge";
import { Header } from "./components/Header";

describe("ChessForge Bootstrap Layout & Board UI (TC-BOOT-05, TC-PIECE-23, TC-SEL-01 to TC-ANIM-13)", () => {
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

  it("renders the chessboard with pieces in the initial starting position", () => {
    render(<App />);
    expect(screen.getByTestId("chess-board")).toBeInTheDocument();
    expect(screen.getByTestId("piece-wk")).toBeInTheDocument();
    expect(screen.getByTestId("piece-bk")).toBeInTheDocument();
    expect(screen.getAllByTestId("piece-wp")).toHaveLength(8);
    expect(screen.getAllByTestId("piece-bp")).toHaveLength(8);
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

  it("supports flipping board orientation and resetting game", () => {
    render(<App />);

    const flipBtn = screen.getByTestId("btn-flip-board");
    fireEvent.click(flipBtn);

    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-orientation", "b");

    // Make a move first
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));
    expect(screen.getByTestId("last-move-indicator")).toBeInTheDocument();

    const resetBtn = screen.getByTestId("btn-reset-game");
    fireEvent.click(resetBtn);

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
});
