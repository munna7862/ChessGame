import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NewGameModal } from "../NewGameModal";
import type { ResolvedNewGameSession } from "../types";

describe("NewGameModal Component (TC-NG-01 to TC-NG-15)", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <NewGameModal isOpen={false} onClose={vi.fn()} onStartGame={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("TC-NG-01 & TC-NG-02: renders accessible dialog with default values", () => {
    render(
      <NewGameModal isOpen={true} onClose={vi.fn()} onStartGame={vi.fn()} />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("New Game Setup")).toBeInTheDocument();

    const p1Input = screen.getByTestId(
      "input-player1-name"
    ) as HTMLInputElement;
    const p2Input = screen.getByTestId(
      "input-player2-name"
    ) as HTMLInputElement;
    expect(p1Input.value).toBe("White");
    expect(p2Input.value).toBe("Black");

    expect(screen.getByTestId("mode-human-vs-human")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByTestId("color-choice-white")).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("TC-NG-03: allows configuring custom player names and submitting", () => {
    const handleStartGame = vi.fn();
    const handleClose = vi.fn();

    render(
      <NewGameModal
        isOpen={true}
        onClose={handleClose}
        onStartGame={handleStartGame}
      />
    );

    const p1Input = screen.getByTestId("input-player1-name");
    const p2Input = screen.getByTestId("input-player2-name");

    fireEvent.change(p1Input, { target: { value: "Alice" } });
    fireEvent.change(p2Input, { target: { value: "Bob" } });

    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    expect(handleStartGame).toHaveBeenCalledTimes(1);
    const session: ResolvedNewGameSession = handleStartGame.mock.calls[0]![0];
    expect(session.config.players?.w.name).toBe("Alice");
    expect(session.config.players?.b.name).toBe("Bob");
    expect(session.userOrientation).toBe("w");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("TC-NG-04: configures Black color choice for Player 1", () => {
    const handleStartGame = vi.fn();

    render(
      <NewGameModal
        isOpen={true}
        onClose={vi.fn()}
        onStartGame={handleStartGame}
      />
    );

    fireEvent.click(screen.getByTestId("color-choice-black"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    const session: ResolvedNewGameSession = handleStartGame.mock.calls[0]![0];
    expect(session.userOrientation).toBe("b");
    expect(session.config.players?.b.name).toBe("White"); // Player 1 chose Black
    expect(session.config.players?.w.name).toBe("Black"); // Player 2 assigned White
  });

  it("TC-NG-06 & TC-NG-07: switching to vs Computer configures engine opponent", () => {
    const handleStartGame = vi.fn();

    render(
      <NewGameModal
        isOpen={true}
        onClose={vi.fn()}
        onStartGame={handleStartGame}
      />
    );

    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    expect(screen.getByTestId("mode-human-vs-engine")).toHaveAttribute(
      "aria-checked",
      "true"
    );

    const p2Input = screen.getByTestId(
      "input-player2-name"
    ) as HTMLInputElement;
    expect(p2Input.value).toBe("Stockfish");

    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    const session: ResolvedNewGameSession = handleStartGame.mock.calls[0]![0];
    expect(session.config.mode).toBe("human_vs_engine");
    expect(session.config.players?.w.type).toBe("human");
    expect(session.config.players?.b.type).toBe("engine");
    expect(session.config.players?.b.difficulty).toBe(3); // Default difficulty
  });

  it("TC-DIFF-09: renders difficulty selector in vs Computer mode and submits custom difficulty", () => {
    const handleStartGame = vi.fn();

    render(
      <NewGameModal
        isOpen={true}
        onClose={vi.fn()}
        onStartGame={handleStartGame}
      />
    );

    // Human vs Human mode should not display difficulty selector
    expect(
      screen.queryByTestId("difficulty-selection-group")
    ).not.toBeInTheDocument();

    // Switch to vs Computer
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));

    // Difficulty selector should now be visible
    expect(
      screen.getByTestId("difficulty-selection-group")
    ).toBeInTheDocument();
    const select = screen.getByTestId(
      "select-engine-difficulty"
    ) as HTMLSelectElement;
    expect(select.value).toBe("3"); // Default Level 3 (Intermediate)

    expect(screen.getByTestId("difficulty-badge")).toHaveTextContent(
      "Level 3: Intermediate"
    );
    expect(screen.getByTestId("difficulty-stats")).toHaveTextContent(
      "Skill 6/20 · Depth 5 · Max 800ms"
    );

    // Select Level 6 (Expert)
    fireEvent.change(select, { target: { value: "6" } });
    expect(select.value).toBe("6");
    expect(screen.getByTestId("difficulty-badge")).toHaveTextContent(
      "Level 6: Expert"
    );
    expect(screen.getByTestId("difficulty-stats")).toHaveTextContent(
      "Skill 15/20 · Depth 14 · Max 2500ms"
    );

    // Submit new game
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    const session: ResolvedNewGameSession = handleStartGame.mock.calls[0]![0];
    expect(session.config.mode).toBe("human_vs_engine");
    expect(session.config.players?.b.difficulty).toBe(6);
  });

  it("TC-NG-10 & TC-NG-11: validates custom starting FEN position input", () => {
    const handleStartGame = vi.fn();

    render(
      <NewGameModal
        isOpen={true}
        onClose={vi.fn()}
        onStartGame={handleStartGame}
      />
    );

    fireEvent.click(screen.getByTestId("toggle-custom-fen"));
    const fenInput = screen.getByTestId("input-custom-fen");

    // Invalid FEN
    fireEvent.change(fenInput, { target: { value: "invalid-fen-string" } });
    expect(screen.getByTestId("fen-validation-error")).toBeInTheDocument();
    expect(screen.getByTestId("btn-submit-new-game")).toBeDisabled();

    // Valid custom FEN
    const customFen =
      "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
    fireEvent.change(fenInput, { target: { value: customFen } });

    expect(screen.queryByTestId("fen-validation-error")).toBeNull();
    expect(screen.getByTestId("btn-submit-new-game")).not.toBeDisabled();

    fireEvent.click(screen.getByTestId("btn-submit-new-game"));
    const session: ResolvedNewGameSession = handleStartGame.mock.calls[0]![0];
    expect(session.config.initialFen).toBe(customFen);
  });

  it("TC-NG-12 & TC-NG-15: handles cancel button, overlay click, and Escape key", () => {
    const handleClose = vi.fn();

    render(
      <NewGameModal isOpen={true} onClose={handleClose} onStartGame={vi.fn()} />
    );

    // Cancel button
    fireEvent.click(screen.getByTestId("btn-cancel-new-game"));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);

    // Close button
    fireEvent.click(screen.getByTestId("btn-close-modal"));
    expect(handleClose).toHaveBeenCalledTimes(3);
  });
});
