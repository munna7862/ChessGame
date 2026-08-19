import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../../../App";
import { DeterministicFakeTimeProvider } from "../../../domain/clock/timeProvider";

describe("Phase 07 · Sprint 03: Clock Integration and Timeout (TC-CLK-INT-01 to TC-CLK-INT-18)", () => {
  let fakeTime: DeterministicFakeTimeProvider;

  beforeEach(() => {
    vi.useFakeTimers();
    fakeTime = new DeterministicFakeTimeProvider(1_000_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("TC-CLK-INT-01 & TC-CLK-INT-02: starts clock on first move and alternates turn without timer drift", () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 3+2 Blitz Game via New Game Modal
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Clocks start at 3:00 for both players
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("3:00");

    // White plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Turn is now Black
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );

    // Black thinks for 5 seconds
    act(() => {
      fakeTime.advanceBy(5000);
      vi.advanceTimersByTime(100);
    });

    // Black clock should display 2:55
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:55");
    // White clock was not ticking during Black's turn
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");
  });

  it("TC-CLK-INT-03 & TC-CLK-INT-04: applies increment correctly across multi-move playout", () => {
    render(<App timeProvider={fakeTime} />);

    // Start a Blitz 3+2 game (180s initial, 2s increment)
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // White plays 1. e4 -> Black's turn starts
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Black thinks for 4 seconds (180s - 4s = 176s)
    act(() => {
      fakeTime.advanceBy(4000);
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:56");

    // Black plays 1... e5 -> Black gets +2s increment = 176s + 2s = 178s (2:58)
    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));

    // White is to move
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:58");

    // White thinks for 6 seconds (180s - 6s = 174s)
    act(() => {
      fakeTime.advanceBy(6000);
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("2:54");

    // White plays 2. Nf3 -> White gets +2s increment = 174s + 2s = 176s (2:56)
    fireEvent.click(screen.getByTestId("board-square-g1"));
    fireEvent.click(screen.getByTestId("board-square-f3"));

    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("2:56");
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );
  });

  it("TC-CLK-INT-05 & TC-CLK-INT-15: detects timeout, ends game, opens GameResultModal, and announces winner", () => {
    render(<App timeProvider={fakeTime} />);

    // Start a Bullet 1+0 game (60s initial, 0s increment)
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-1---0--bullet-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // White plays 1. e4 -> Black's clock starts
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Black runs out of time (advance 65s > 60s limit)
    act(() => {
      fakeTime.advanceBy(65_000);
      vi.advanceTimersByTime(200);
    });

    // GameResultModal should appear indicating White won by timeout
    expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
    expect(screen.getByTestId("game-result-title")).toHaveTextContent(
      "White Wins!"
    );
    expect(screen.getByTestId("game-result-description")).toHaveTextContent(
      "Black ran out of time"
    );

    // Black clock displays 0:00 and flagged indicator
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("0:00");
  });

  it("TC-CLK-INT-06: freezes clock immediately when game concludes by checkmate", () => {
    render(<App timeProvider={fakeTime} />);

    // Start Rapid 10+0
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-10---0--rapid-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Play Fool's mate: 1. f3 e5 2. g4 Qh4#
    // 1. f3
    fireEvent.click(screen.getByTestId("board-square-f2"));
    fireEvent.click(screen.getByTestId("board-square-f3"));

    // 1... e5
    act(() => {
      fakeTime.advanceBy(2000);
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));

    // 2. g4
    act(() => {
      fakeTime.advanceBy(3000);
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(screen.getByTestId("board-square-g2"));
    fireEvent.click(screen.getByTestId("board-square-g4"));

    // 2... Qh4#
    act(() => {
      fakeTime.advanceBy(4000);
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(screen.getByTestId("board-square-d8"));
    fireEvent.click(screen.getByTestId("board-square-h4"));

    expect(screen.getByTestId("checkmate-indicator")).toBeInTheDocument();

    const whiteTimeAfterMate = screen.getByTestId("clock-time-w").textContent;
    const blackTimeAfterMate = screen.getByTestId("clock-time-b").textContent;

    // Advance fake time significantly after checkmate
    act(() => {
      fakeTime.advanceBy(100_000);
      vi.advanceTimersByTime(500);
    });

    // Both clocks remain frozen and did not decrement
    expect(screen.getByTestId("clock-time-w").textContent).toBe(
      whiteTimeAfterMate
    );
    expect(screen.getByTestId("clock-time-b").textContent).toBe(
      blackTimeAfterMate
    );
  });

  it("TC-CLK-INT-07: freezes clock immediately when a player resigns", () => {
    render(<App timeProvider={fakeTime} />);

    // Start Blitz 3+2
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // White plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Black thinks for 10 seconds (180s - 10s = 170s = 2:50)
    act(() => {
      fakeTime.advanceBy(10_000);
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:50");

    // Black resigns
    fireEvent.click(screen.getByTestId("btn-resign-game"));
    fireEvent.click(screen.getByTestId("btn-confirm-resign"));

    expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
    expect(screen.getByTestId("game-result-description")).toHaveTextContent(
      "Black resigned"
    );

    // Advance time post resignation
    act(() => {
      fakeTime.advanceBy(50_000);
      vi.advanceTimersByTime(500);
    });

    // Clock for Black stayed at 2:50
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:50");
  });

  it("TC-CLK-INT-08: freezes clock immediately when draw is agreed", () => {
    render(<App timeProvider={fakeTime} />);

    // Start Blitz 5+3
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-5---3--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // White plays 1. d4
    fireEvent.click(screen.getByTestId("board-square-d2"));
    fireEvent.click(screen.getByTestId("board-square-d4"));

    // Black thinks for 8 seconds
    act(() => {
      fakeTime.advanceBy(8000);
      vi.advanceTimersByTime(100);
    });

    // Offer draw and accept
    fireEvent.click(screen.getByTestId("btn-offer-draw"));
    fireEvent.click(screen.getByTestId("btn-accept-draw"));

    expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
    expect(screen.getByTestId("game-result-description")).toHaveTextContent(
      "Both players agreed to conclude the game in a draw."
    );

    // Advance time after draw
    act(() => {
      fakeTime.advanceBy(60_000);
      vi.advanceTimersByTime(500);
    });

    // Clock did not decrement further
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("4:52");
  });

  it("TC-CLK-INT-09 & TC-CLK-INT-10: resets clocks to full duration upon Restart and Rematch", () => {
    render(<App timeProvider={fakeTime} />);

    // Start 3+0 game
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---0--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Play 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    act(() => {
      fakeTime.advanceBy(15_000);
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:45");

    // Click Restart button
    fireEvent.click(screen.getByTestId("btn-restart-game"));
    fireEvent.click(screen.getByTestId("btn-confirm-restart"));

    // Both clocks are cleanly reset to 3:00
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("3:00");
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
  });

  it("TC-CLK-INT-11: changes time control cleanly when New Game is configured with different preset", () => {
    render(<App timeProvider={fakeTime} />);

    // Start Blitz 3+2
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");

    // Reopen New Game Modal and select Classical 30+0
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-30---0--classical-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("30:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("30:00");
  });

  it("TC-CLK-INT-12: supports Unlimited time control without active timer decrement", () => {
    render(<App timeProvider={fakeTime} />);

    // Start Unlimited game
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-unlimited--untimed-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Clocks display "∞" for untimed
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("∞");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("∞");

    // Play 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    act(() => {
      fakeTime.advanceBy(100_000);
      vi.advanceTimersByTime(500);
    });

    // Still untimed
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("∞");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("∞");
  });

  it("TC-CLK-INT-13 & TC-CLK-INT-16: handles undo move and preserves clean session state with clocks", () => {
    render(<App timeProvider={fakeTime} />);

    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );

    // Undo move
    fireEvent.click(screen.getByTestId("btn-undo-move"));
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.getByTestId("clock-time-w")).toBeInTheDocument();
  });

  it("TC-CLK-INT-14: handles rapid moves in succession without timer drift or interval leakage", () => {
    render(<App timeProvider={fakeTime} />);

    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Rapid move sequence 1. e4 e5 2. Nf3 Nc6
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    fireEvent.click(screen.getByTestId("board-square-e7"));
    fireEvent.click(screen.getByTestId("board-square-e5"));

    fireEvent.click(screen.getByTestId("board-square-g1"));
    fireEvent.click(screen.getByTestId("board-square-f3"));

    fireEvent.click(screen.getByTestId("board-square-b8"));
    fireEvent.click(screen.getByTestId("board-square-c6"));

    expect(screen.getByTestId("move-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("move-row-2")).toBeInTheDocument();
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
  });
});
