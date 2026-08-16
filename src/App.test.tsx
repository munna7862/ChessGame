import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { StatusBadge } from "./components/StatusBadge";
import { Header } from "./components/Header";

describe("ChessForge Bootstrap Layout (TC-BOOT-05)", () => {
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

  it("renders the StatusBadge with correct status indicator", () => {
    render(<StatusBadge label="Engine Connected" status="ready" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Engine Connected");
  });

  it("displays local-first and performance metrics on dashboard", () => {
    render(<App />);
    expect(screen.getByText("< 150 MB")).toBeInTheDocument();
    expect(screen.getByText("60 FPS")).toBeInTheDocument();
    expect(screen.getByText("100% Local")).toBeInTheDocument();
  });
});
