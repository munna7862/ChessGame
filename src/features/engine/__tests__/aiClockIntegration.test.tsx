import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../../../App";
import { DeterministicFakeTimeProvider } from "../../../domain/clock/timeProvider";
import { MockEngineWorkerBridge } from "../MockEngineWorkerBridge";
import { EngineServiceImpl } from "../EngineServiceImpl";
import { setSharedEngineService } from "../useEngineOpponent";

describe("Phase 07 · Sprint 04: AI and Clock Integration (TC-AICLK-01 to TC-AICLK-13)", () => {
  let fakeTime: DeterministicFakeTimeProvider;
  let mockBridge: MockEngineWorkerBridge;
  let engineService: EngineServiceImpl;

  beforeEach(() => {
    vi.useFakeTimers();
    fakeTime = new DeterministicFakeTimeProvider(1_000_000);

    mockBridge = new MockEngineWorkerBridge({
      autoRespondReady: true,
      autoRespondBestMove: false,
    });
    engineService = new EngineServiceImpl(mockBridge);
    setSharedEngineService(engineService);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    setSharedEngineService(null);
  });

  it("TC-AICLK-01 & TC-AICLK-02: starts engine clock on human move, applies increment on engine move completion", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 3+2 Blitz Human vs Engine match
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-3---2--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Clocks start at 3:00
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("3:00");

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Flush microtasks for engine search invocation
    await act(async () => {
      await Promise.resolve();
    });

    // Turn is now Black (Engine)
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Stockfish is thinking..."
    );

    // Engine calculates for 3 seconds
    act(() => {
      fakeTime.advanceBy(3000);
      vi.advanceTimersByTime(100);
    });

    // Engine clock shows 2:57 (180s - 3s = 177s)
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:57");
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");

    // Mock engine returns best move e7e5
    const search = mockBridge.getRequests().find((r) => r.type === "SEARCH");
    expect(search).toBeDefined();
    if (search && search.type === "SEARCH") {
      await act(async () => {
        mockBridge.respondBestMove(search.request.searchToken, "e7e5");
        await Promise.resolve();
      });
    }

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );

    // Black received +2s increment = 177s + 2s = 179s (2:59)
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("2:59");
  });

  it("TC-AICLK-03 & TC-AICLK-04: passes dynamically constrained movetimeMs based on remaining clock", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 1+0 Bullet Human vs Engine match (60s initial)
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-1---0--bullet-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Flush microtasks for engine search invocation
    await act(async () => {
      await Promise.resolve();
    });

    const searchRequests = mockBridge
      .getRequests()
      .filter((r) => r.type === "SEARCH");
    expect(searchRequests.length).toBeGreaterThan(0);
    const search = searchRequests[0];
    if (search?.type === "SEARCH") {
      // Difficulty 3 default is 800ms.
      // Clock has 60,000ms left -> 60,000 / 20 = 3,000ms.
      // Math.min(800, 3000) = 800ms.
      expect(search.request.movetimeMs).toBe(800);
    }
  });

  it("TC-AICLK-06: detects engine timeout, triggers GameResultModal with Human victory, and cancels thinking", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 1+0 Bullet Human vs Engine match (60s initial)
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-1---0--bullet-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    await act(async () => {
      await Promise.resolve();
    });

    // Engine is thinking. Advance time past 60 seconds (Engine flag falls)
    act(() => {
      fakeTime.advanceBy(65_000);
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
    expect(screen.getByTestId("game-result-title")).toHaveTextContent(
      "White Wins!"
    );
    expect(screen.getByTestId("game-result-description")).toHaveTextContent(
      "Stockfish ran out of time"
    );
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("0:00");
  });

  it("TC-AICLK-07: discards late engine moves arriving after timeout has occurred", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 1+0 Bullet Human vs Engine match
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-1---0--bullet-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    await act(async () => {
      await Promise.resolve();
    });

    const search = mockBridge.getRequests().find((r) => r.type === "SEARCH");

    // Advance time to cause Black timeout
    act(() => {
      fakeTime.advanceBy(65_000);
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();

    // Mock engine late response arrives
    if (search && search.type === "SEARCH") {
      await act(async () => {
        mockBridge.respondBestMove(search.request.searchToken, "e7e5");
        await Promise.resolve();
      });
    }

    // Move is not applied - Black piece remains on e7
    expect(screen.getByTestId("board-square-e7")).toHaveAttribute(
      "data-has-piece",
      "true"
    );
    expect(screen.getByTestId("game-result-modal")).toBeInTheDocument();
  });

  it("TC-AICLK-08: restarts cleanly when restart is triggered during active engine thinking", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 3+0 Blitz Human vs Engine match
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-3---0--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    await act(async () => {
      await Promise.resolve();
    });

    // Engine is thinking. User opens restart modal and confirms
    fireEvent.click(screen.getByTestId("btn-restart-game"));
    expect(screen.getByTestId("restart-confirm-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-confirm-restart"));

    // Clocks and position should be reset to move 0
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("3:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("3:00");
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.getByTestId("board-square-e2")).toHaveAttribute(
      "data-has-piece",
      "true"
    );
  });

  it("TC-AICLK-10: cancels engine thinking and restores position when Undo is pressed", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 3+0 Blitz Human vs Engine match
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-3---0--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    await act(async () => {
      await Promise.resolve();
    });

    // Engine is thinking. User clicks Undo
    fireEvent.click(screen.getByTestId("btn-undo-move"));

    // Position restored to start, turn is White
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.getByTestId("board-square-e2")).toHaveAttribute(
      "data-has-piece",
      "true"
    );
    expect(screen.queryByTestId("player-thinking-b")).toBeNull();
  });

  it("TC-AICLK-11: cancels engine thinking when user resigns", async () => {
    render(<App timeProvider={fakeTime} />);

    // Start a 3+0 Blitz Human vs Engine match
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-3---0--blitz-"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Human plays 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    await act(async () => {
      await Promise.resolve();
    });

    // Engine is thinking. User clicks Resign
    fireEvent.click(screen.getByTestId("btn-resign-game"));
    fireEvent.click(screen.getByTestId("btn-confirm-resign"));

    // Resignation status displayed, engine thinking stopped
    expect(screen.getByTestId("resignation-indicator")).toBeInTheDocument();
    expect(screen.queryByTestId("player-thinking-b")).toBeNull();
  });

  it("TC-AICLK-12: Engine playing White opens game and starts Black clock", async () => {
    mockBridge.setAutoRespondBestMove("d2d4");

    render(<App timeProvider={fakeTime} />);

    // Start a 5+3 Blitz match with Human playing Black (Engine playing White)
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("preset-5---3--blitz-"));
    fireEvent.click(screen.getByTestId("color-choice-black"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Clocks start at 5:00
    expect(screen.getByTestId("clock-time-w")).toHaveTextContent("5:00");
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("5:00");

    // Engine executes opening move 1. d4 (flush microtasks)
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Turn is now Black (Human), Black clock starts ticking
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );

    // Human thinks for 10 seconds
    act(() => {
      fakeTime.advanceBy(10000);
      vi.advanceTimersByTime(100);
    });

    // Black clock shows 4:50 (300s - 10s = 290s)
    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("4:50");
  });
});
