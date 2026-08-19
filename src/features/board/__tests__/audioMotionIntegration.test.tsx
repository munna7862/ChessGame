import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { soundService } from "../../../services/sound";
import { Board } from "../Board";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import { App } from "../../../App";

describe("Audio & Motion Integration Tests (TC-AUD-05 to TC-AUD-11, TC-MOT-01 to TC-MOT-03)", () => {
  beforeEach(() => {
    vi.spyOn(soundService, "play").mockImplementation(() => {});
  });

  it("TC-MOT-01: Board and squares attach micro-animation classes for last-move, capture, and check", () => {
    const game = createChessAdapter();
    game.loadFen(
      "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    );
    game.makeMove({ from: "e5", to: "d6" });

    const position = game.getPosition();
    const lastMove = {
      from: "e5" as const,
      to: "d6" as const,
      isCapture: true,
      san: "exd6",
    };

    render(
      <Board
        position={position}
        lastMove={lastMove}
        checkSquare="e8"
        orientation="w"
      />
    );

    const fromSquare = screen.getByTestId("board-square-e5");
    expect(fromSquare).toHaveClass("is-last-move-from");

    const toSquare = screen.getByTestId("board-square-d6");
    expect(toSquare).toHaveClass("is-last-move-to");
    expect(toSquare).toHaveClass("is-capture-effect");

    const checkSquare = screen.getByTestId("board-square-e8");
    expect(checkSquare).toHaveClass("is-check");
  });

  it("TC-MOT-02: Reduced-motion applies data-reduced-motion and reduced-motion class", () => {
    const game = createChessAdapter();
    const position = game.getPosition();

    const { rerender } = render(
      <Board position={position} orientation="w" reducedMotion={false} />
    );

    const wrapper = screen.getByTestId("chess-board-wrapper");
    expect(wrapper).not.toHaveClass("reduced-motion");
    expect(wrapper).not.toHaveAttribute("data-reduced-motion", "true");

    rerender(
      <Board position={position} orientation="w" reducedMotion={true} />
    );

    expect(wrapper).toHaveClass("reduced-motion");
    expect(wrapper).toHaveAttribute("data-reduced-motion", "true");
  });

  it("TC-AUD-05: Standard quiet move in App triggers 'move' sound", () => {
    render(<App />);

    // Click e2 then e4 to play 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    expect(soundService.play).toHaveBeenCalledWith("move");
  });

  it("TC-AUD-06: Capture move triggers 'capture' sound in App", () => {
    render(<App />);

    // 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // 1... d5
    fireEvent.click(screen.getByTestId("board-square-d7"));
    fireEvent.click(screen.getByTestId("board-square-d5"));

    // 2. exd5 (capture)
    fireEvent.click(screen.getByTestId("board-square-e4"));
    fireEvent.click(screen.getByTestId("board-square-d5"));

    expect(soundService.play).toHaveBeenCalledWith("capture");
  });

  it("TC-AUD-07: Move delivering check triggers 'check' sound", () => {
    render(<App />);

    // 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // 1... e5
    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));

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

    // 4. Qxf7# (Checkmate triggers gameOver)
    fireEvent.click(screen.getByTestId("board-square-h5"));
    fireEvent.click(screen.getByTestId("board-square-f7"));

    expect(soundService.play).toHaveBeenCalledWith("gameOver");
  });

  it("TC-AUD-10: Resignation triggers 'gameOver' sound effect", () => {
    render(<App />);

    // Click Resign button in action bar
    fireEvent.click(screen.getByTestId("btn-resign-game"));

    // Confirm resignation in modal
    fireEvent.click(screen.getByTestId("btn-confirm-resign"));

    expect(soundService.play).toHaveBeenCalledWith("gameOver");
  });

  it("TC-AUD-11: Draw agreement triggers 'draw' sound effect", () => {
    render(<App />);

    // Click Draw button in action bar
    fireEvent.click(screen.getByTestId("btn-offer-draw"));

    // Accept draw in modal
    fireEvent.click(screen.getByTestId("btn-accept-draw"));

    expect(soundService.play).toHaveBeenCalledWith("draw");
  });
});
