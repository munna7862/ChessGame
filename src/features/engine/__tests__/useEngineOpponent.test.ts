import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createGameSession } from "../../game/GameSessionController";
import { MockEngineWorkerBridge } from "../MockEngineWorkerBridge";
import { EngineServiceImpl } from "../EngineServiceImpl";
import {
  useEngineOpponent,
  setSharedEngineService,
} from "../useEngineOpponent";
import type { GameSessionConfig } from "../../game/types";

describe("useEngineOpponent Hook (TC-HVC-01, TC-HVC-05, TC-HVC-10)", () => {
  let mockBridge: MockEngineWorkerBridge;
  let engineService: EngineServiceImpl;

  beforeEach(() => {
    mockBridge = new MockEngineWorkerBridge({
      autoRespondReady: true,
      autoRespondBestMove: "e7e5",
    });
    engineService = new EngineServiceImpl(mockBridge);
    setSharedEngineService(engineService);
  });

  it("does not trigger engine when active player is human (human vs human)", () => {
    const session = createGameSession({
      mode: "human_vs_human",
    });

    const { result } = renderHook(() =>
      useEngineOpponent({
        sessionController: session,
        sessionState: session.getState(),
        engineService,
      })
    );

    expect(result.current.isEngineThinking).toBe(false);
    expect(result.current.isEngineTurn).toBe(false);
    expect(
      mockBridge.getRequests().filter((r) => r.type === "SEARCH")
    ).toHaveLength(0);
  });

  it("automatically triggers engine search and executes move after human move (TC-HVC-01)", async () => {
    const config: GameSessionConfig = {
      mode: "human_vs_engine",
      players: {
        w: { id: "p1", name: "Human", color: "w", type: "human" },
        b: {
          id: "p2",
          name: "Stockfish",
          color: "b",
          type: "engine",
          difficulty: 3,
        },
      },
    };
    const session = createGameSession(config);

    const { result, rerender } = renderHook(
      ({ state }) =>
        useEngineOpponent({
          sessionController: session,
          sessionState: state,
          engineService,
        }),
      {
        initialProps: { state: session.getState() },
      }
    );

    expect(result.current.isEngineTurn).toBe(false);
    expect(result.current.isEngineThinking).toBe(false);

    // Human makes move 1. e4
    act(() => {
      session.makeMove({ from: "e2", to: "e4" });
    });

    rerender({ state: session.getState() });

    expect(session.getState().turn).toBe("b");

    // Engine should be thinking and then execute e7e5
    await waitFor(() => {
      expect(session.getState().turn).toBe("w");
    });

    const history = session.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]?.san).toBe("e4");
    expect(history[1]?.from).toBe("e7");
    expect(history[1]?.to).toBe("e5");
    expect(result.current.isEngineThinking).toBe(false);
  });

  it("automatically makes White opening move when Human plays as Black (TC-HVC-05)", async () => {
    mockBridge.setAutoRespondBestMove("d2d4");

    const config: GameSessionConfig = {
      mode: "human_vs_engine",
      players: {
        w: {
          id: "p1",
          name: "Stockfish",
          color: "w",
          type: "engine",
          difficulty: 5,
        },
        b: { id: "p2", name: "Human", color: "b", type: "human" },
      },
    };
    const session = createGameSession(config);

    const { result } = renderHook(() =>
      useEngineOpponent({
        sessionController: session,
        sessionState: session.getState(),
        engineService,
      })
    );

    // Engine should execute White opening move
    await waitFor(() => {
      expect(session.getState().turn).toBe("b");
    });

    const history = session.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]?.from).toBe("d2");
    expect(history[0]?.to).toBe("d4");
    expect(result.current.isEngineThinking).toBe(false);
  });

  it("passes correct difficulty preset parameters to the engine service (TC-HVC-10)", async () => {
    const config: GameSessionConfig = {
      mode: "human_vs_engine",
      players: {
        w: { id: "p1", name: "Human", color: "w", type: "human" },
        b: {
          id: "p2",
          name: "Stockfish Master",
          color: "b",
          type: "engine",
          difficulty: 8,
        },
      },
    };
    const session = createGameSession(config);

    const { rerender } = renderHook(
      ({ state }) =>
        useEngineOpponent({
          sessionController: session,
          sessionState: state,
          engineService,
        }),
      {
        initialProps: { state: session.getState() },
      }
    );

    act(() => {
      session.makeMove({ from: "e2", to: "e4" });
    });

    rerender({ state: session.getState() });

    await waitFor(() => {
      const searchRequests = mockBridge
        .getRequests()
        .filter((r) => r.type === "SEARCH");
      expect(searchRequests.length).toBeGreaterThan(0);
      const search = searchRequests[0];
      if (search?.type === "SEARCH") {
        expect(search.request.skillLevel).toBe(20);
        expect(search.request.depth).toBe(22);
        expect(search.request.movetimeMs).toBe(5000);
      }
    });
  });

  it("cancelThinking cancels active search cleanly without throwing (TC-HVC-06)", async () => {
    mockBridge.setAutoRespondBestMove(false); // Engine does not respond automatically

    const config: GameSessionConfig = {
      mode: "human_vs_engine",
      players: {
        w: { id: "p1", name: "Human", color: "w", type: "human" },
        b: {
          id: "p2",
          name: "Stockfish",
          color: "b",
          type: "engine",
        },
      },
    };
    const session = createGameSession(config);

    const { result, rerender } = renderHook(
      ({ state }) =>
        useEngineOpponent({
          sessionController: session,
          sessionState: state,
          engineService,
        }),
      {
        initialProps: { state: session.getState() },
      }
    );

    act(() => {
      session.makeMove({ from: "e2", to: "e4" });
    });

    rerender({ state: session.getState() });

    expect(result.current.isEngineThinking).toBe(true);

    await act(async () => {
      await result.current.cancelThinking();
    });

    expect(result.current.isEngineThinking).toBe(false);
  });
});
