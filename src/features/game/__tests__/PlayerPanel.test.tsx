import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerPanel } from "../PlayerPanel";
import type { PlayerConfig } from "../types";

describe("PlayerPanel Component (TC-NG-13)", () => {
  const defaultWhitePlayer: PlayerConfig = {
    id: "player-w",
    name: "Magnus",
    color: "w",
    type: "human",
    rating: 2850,
  };

  const defaultBlackPlayer: PlayerConfig = {
    id: "player-b",
    name: "Stockfish AI",
    color: "b",
    type: "engine",
  };

  it("renders player name, color avatar, and rating correctly", () => {
    render(
      <PlayerPanel
        player={defaultWhitePlayer}
        isTurn={true}
        capturedPieces={["p", "n"]}
      />
    );

    expect(screen.getByTestId("player-name-w")).toHaveTextContent("Magnus");
    expect(screen.getByTestId("player-rating-w")).toHaveTextContent("2850");
    expect(screen.getByTestId("player-type-w")).toHaveTextContent("Human");
    expect(screen.getByTestId("player-turn-w")).toBeInTheDocument();
    expect(screen.getByTestId("captured-pieces-w")).toBeInTheDocument();
  });

  it("renders engine badge and handles player with no rating", () => {
    render(
      <PlayerPanel player={defaultBlackPlayer} isTurn={false} isCheck={false} />
    );

    expect(screen.getByTestId("player-name-b")).toHaveTextContent(
      "Stockfish AI"
    );
    expect(screen.getByTestId("player-type-b")).toHaveTextContent("AI");
    expect(screen.queryByTestId("player-rating-b")).toBeNull();
    expect(screen.queryByTestId("player-turn-b")).toBeNull();
  });

  it("displays check indicator when player is in check", () => {
    render(
      <PlayerPanel player={defaultWhitePlayer} isTurn={true} isCheck={true} />
    );

    expect(screen.getByTestId("player-check-w")).toHaveTextContent("Check");
    const panel = screen.getByTestId("player-panel-w");
    expect(panel).toHaveClass("player-panel--in-check");
    expect(panel).toHaveClass("player-panel--active-turn");
  });

  it("displays thinking indicator when engine player is thinking (TC-HVC-04)", () => {
    render(
      <PlayerPanel
        player={defaultBlackPlayer}
        isTurn={true}
        isThinking={true}
      />
    );

    expect(screen.getByTestId("player-thinking-b")).toHaveTextContent(
      "Thinking..."
    );
    // When thinking, regular turn badge is replaced by thinking badge
    expect(screen.queryByTestId("player-turn-b")).toBeNull();
  });
});
