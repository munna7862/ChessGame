import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../../App";
import { MockEngineWorkerBridge } from "../../engine/MockEngineWorkerBridge";
import { EngineServiceImpl } from "../../engine/EngineServiceImpl";
import { setSharedEngineService } from "../../engine/useEngineOpponent";

describe("Human vs Computer Game Flow (TC-HVC-01 to TC-HVC-10)", () => {
  let mockBridge: MockEngineWorkerBridge;
  let engineService: EngineServiceImpl;

  beforeEach(() => {
    mockBridge = new MockEngineWorkerBridge({
      autoRespondReady: true,
      autoRespondBestMove: "e7e5",
    });
    engineService = new EngineServiceImpl(mockBridge);
    setSharedEngineService(engineService);
    window.localStorage.clear();
  });

  it("plays a full Human vs Computer turn cycle with thinking indicator and board locking (TC-HVC-01, TC-HVC-03, TC-HVC-04)", async () => {
    // Hold engine response until explicitly fired to verify thinking state
    mockBridge.setAutoRespondBestMove(false);

    render(<App />);

    // 1. Start a New Game vs Computer
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    expect(screen.getByTestId("new-game-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    expect(screen.queryByTestId("new-game-modal")).toBeNull();
    expect(screen.getByTestId("player-type-b")).toHaveTextContent("AI");

    // 2. Human plays 1. e2-e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // 3. Engine turn starts: thinking indicator displayed, board locked
    expect(screen.getByTestId("player-thinking-b")).toBeInTheDocument();
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(/thinking/i);

    // Attempting to click another square during thinking should be ignored
    fireEvent.click(screen.getByTestId("board-square-a7"));
    expect(screen.queryByTestId("selected-square-indicator")).toBeNull();

    // 4. Engine responds with best move e7e5
    await waitFor(() => {
      const req = mockBridge.getRequests().find((r) => r.type === "SEARCH");
      expect(req).toBeDefined();
    });

    const searchRequest = mockBridge
      .getRequests()
      .find((r) => r.type === "SEARCH");

    if (searchRequest?.type === "SEARCH") {
      mockBridge.respondBestMove(searchRequest.request.searchToken, "e7e5");
    }

    // 5. Move executed: thinking cleared, turn back to White (Human)
    await waitFor(() => {
      expect(screen.queryByTestId("player-thinking-b")).toBeNull();
    });

    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "Last: e7 → e5 (e5)"
    );
  });

  it("automatically executes White opening move when Human chooses to play as Black (TC-HVC-05)", async () => {
    mockBridge.setAutoRespondBestMove("d2d4");
    render(<App />);

    // Start game vs computer with Black color choice
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("color-choice-black"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // White engine should automatically play d2d4
    await waitFor(() => {
      expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
        "Last: d2 → d4 (d4)"
      );
    });

    // Active turn is now Black (Human's perspective)
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "Black to move"
    );
  });

  it("handles Undo in Human vs Computer by rolling back 2 plies to human's previous turn (TC-HVC-08)", async () => {
    mockBridge.setAutoRespondBestMove("e7e5");
    render(<App />);

    // Start game vs computer
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Play 1. e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Wait for engine response 1... e5
    await waitFor(() => {
      expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
        "Last: e7 → e5"
      );
    });

    // Human clicks Undo
    fireEvent.click(screen.getByTestId("btn-undo-move"));

    // Both moves should be undone, returning to initial position with White to move
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.queryByTestId("last-move-indicator")).toBeNull();
  });

  it("handles Undo while engine is thinking by cancelling search and undoing 1 ply (TC-HVC-08)", async () => {
    mockBridge.setAutoRespondBestMove(false);
    render(<App />);

    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Play 1. e4 -> Engine starts thinking
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    expect(screen.getByTestId("player-thinking-b")).toBeInTheDocument();

    // Click Undo during thinking
    fireEvent.click(screen.getByTestId("btn-undo-move"));

    // Search cancelled, 1 ply undone, thinking indicator cleared
    expect(screen.queryByTestId("player-thinking-b")).toBeNull();
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
    expect(screen.queryByTestId("last-move-indicator")).toBeNull();
  });

  it("handles Restart during engine thinking cleanly (TC-HVC-06)", async () => {
    mockBridge.setAutoRespondBestMove(false);
    render(<App />);

    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Play 1. e4 -> Engine thinking
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    expect(screen.getByTestId("player-thinking-b")).toBeInTheDocument();

    // Open restart modal and confirm
    fireEvent.click(screen.getByTestId("btn-restart-game"));
    expect(screen.getByTestId("restart-confirm-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-confirm-restart"));

    // Thinking cleared, board reset
    expect(screen.queryByTestId("player-thinking-b")).toBeNull();
    expect(screen.getByTestId("turn-indicator")).toHaveTextContent(
      "White to move"
    );
  });

  it("handles Resignation during engine thinking cleanly (TC-HVC-07)", async () => {
    mockBridge.setAutoRespondBestMove(false);
    render(<App />);

    fireEvent.click(screen.getByTestId("btn-reset-game"));
    fireEvent.click(screen.getByTestId("mode-human-vs-engine"));
    fireEvent.click(screen.getByTestId("btn-submit-new-game"));

    // Play 1. e4 -> Engine thinking
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    expect(screen.getByTestId("player-thinking-b")).toBeInTheDocument();

    // Open resign modal and confirm
    fireEvent.click(screen.getByTestId("btn-resign-game"));
    fireEvent.click(screen.getByTestId("btn-confirm-resign"));

    // Thinking cleared, game over modal / indicator displayed
    expect(screen.queryByTestId("player-thinking-b")).toBeNull();
    expect(screen.getByTestId("resignation-indicator")).toBeInTheDocument();
  });
});
