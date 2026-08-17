import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { StatusBadge } from "./components/StatusBadge";
import { Header } from "./components/Header";

describe("ChessForge Bootstrap Layout & Board UI (TC-BOOT-05, TC-PIECE-23, TC-SEL-01 to TC-SEL-10)", () => {
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

  it("handles piece selection, legal move indicators, and move execution", () => {
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
  });

  it("supports flipping board orientation and resetting game", () => {
    render(<App />);

    const flipBtn = screen.getByTestId("btn-flip-board");
    fireEvent.click(flipBtn);

    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-orientation", "b");

    const resetBtn = screen.getByTestId("btn-reset-game");
    fireEvent.click(resetBtn);

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
  });
});
