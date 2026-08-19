import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameRecoveryModal } from "../GameRecoveryModal";
import type { PersistedActiveGame } from "../../../domain/persistence/schema";

describe("GameRecoveryModal Component Tests", () => {
  const mockActiveGame: PersistedActiveGame = {
    id: "game-123",
    mode: "human_vs_engine",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    moveHistorySan: ["e4", "e5", "Nf3"],
    players: {
      w: { id: "p1", name: "Grandmaster", color: "w", type: "human" },
      b: {
        id: "p2",
        name: "Stockfish (Level 5)",
        color: "b",
        type: "engine",
        difficulty: 5,
      },
    },
    clock: {
      whiteMs: 250000,
      blackMs: 270000,
      timeControl: {
        type: "blitz",
        initialMs: 300000,
        incrementMs: 0,
        label: "5 min",
      },
    },
    userOrientation: "w",
    startedAt: 1600000000000,
    updatedAt: 1600000050000,
  };

  it("TC-RECOV-16: renders all recovery metadata and accessibility attributes when open", () => {
    render(
      <GameRecoveryModal
        isOpen={true}
        activeGame={mockActiveGame}
        onContinue={vi.fn()}
        onDiscard={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId("game-recovery-modal")).toBeInTheDocument();
    expect(screen.getByTestId("recovery-modal-title")).toHaveTextContent(
      "Resume Previous Game?"
    );
    expect(screen.getByTestId("recovery-game-mode")).toHaveTextContent(
      "Human vs Computer"
    );
    expect(screen.getByTestId("recovery-players")).toHaveTextContent(
      "Grandmaster (White) vs Stockfish (Level 5) (Black)"
    );
    expect(screen.getByTestId("recovery-turn")).toHaveTextContent(
      "Black to move"
    );
    expect(screen.getByTestId("recovery-move-count")).toHaveTextContent(
      "3 moves played"
    );
    expect(screen.getByTestId("recovery-time-control")).toHaveTextContent(
      "5 min"
    );
    expect(screen.getByTestId("recovery-timestamp")).toBeInTheDocument();
    expect(screen.getByTestId("btn-continue-game")).toBeInTheDocument();
    expect(screen.getByTestId("btn-discard-game")).toBeInTheDocument();
    expect(screen.getByTestId("btn-close-recovery")).toBeInTheDocument();
  });

  it("does not render when isOpen is false or activeGame is null", () => {
    const { rerender } = render(
      <GameRecoveryModal
        isOpen={false}
        activeGame={mockActiveGame}
        onContinue={vi.fn()}
        onDiscard={vi.fn()}
      />
    );
    expect(screen.queryByTestId("game-recovery-modal")).not.toBeInTheDocument();

    rerender(
      <GameRecoveryModal
        isOpen={true}
        activeGame={null}
        onContinue={vi.fn()}
        onDiscard={vi.fn()}
      />
    );
    expect(screen.queryByTestId("game-recovery-modal")).not.toBeInTheDocument();
  });

  it("TC-RECOV-14: triggers onContinue when Continue Game button is clicked", () => {
    const handleContinue = vi.fn();
    render(
      <GameRecoveryModal
        isOpen={true}
        activeGame={mockActiveGame}
        onContinue={handleContinue}
        onDiscard={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("btn-continue-game"));
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it("TC-RECOV-15: triggers onDiscard when Discard / Start Fresh button is clicked", () => {
    const handleDiscard = vi.fn();
    render(
      <GameRecoveryModal
        isOpen={true}
        activeGame={mockActiveGame}
        onContinue={vi.fn()}
        onDiscard={handleDiscard}
      />
    );

    fireEvent.click(screen.getByTestId("btn-discard-game"));
    expect(handleDiscard).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <GameRecoveryModal
        isOpen={true}
        activeGame={mockActiveGame}
        onContinue={vi.fn()}
        onDiscard={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
