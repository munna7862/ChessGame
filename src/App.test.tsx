import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { StatusBadge } from "./components/StatusBadge";
import { Header } from "./components/Header";

describe("ChessForge Bootstrap Layout & Board UI (TC-BOOT-05 & TC-PIECE-23)", () => {
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
});
