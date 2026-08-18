import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  renderHook,
  act,
  waitFor,
} from "@testing-library/react";
import * as fc from "fast-check";
import { MockEngineWorkerBridge } from "../MockEngineWorkerBridge";
import { EngineServiceImpl } from "../EngineServiceImpl";
import { EngineFatalError } from "../types";
import { EngineErrorBanner } from "../EngineErrorBanner";
import { useEngineOpponent } from "../useEngineOpponent";
import { createGameSession } from "../../game/GameSessionController";
import type { GameSessionConfig } from "../../game/types";
import { engineDiagnostics } from "../engineDiagnostics";

describe("Engine Failure Recovery (Phase 06 · Sprint 06)", () => {
  let mockBridge: MockEngineWorkerBridge;
  let engineService: EngineServiceImpl;

  beforeEach(() => {
    mockBridge = new MockEngineWorkerBridge({
      autoRespondReady: true,
      autoRespondBestMove: "e7e5",
    });
    engineService = new EngineServiceImpl(mockBridge);
    engineDiagnostics.clearLogs();
  });

  describe("TC-EFR-01: Worker Crash During Initialization (init)", () => {
    it("transitions engine state to error and rejects init() promise on startup crash", async () => {
      const crashBridge = new MockEngineWorkerBridge({
        autoRespondReady: false,
      });
      const service = new EngineServiceImpl(crashBridge);

      const initPromise = service.init();
      crashBridge.simulateWorkerCrash(
        "Failed to instantiate WebAssembly module",
        true
      );

      await expect(initPromise).rejects.toThrow(EngineFatalError);
      expect(service.state).toBe("error");

      const crashLogs = engineDiagnostics.getLogsByType("WORKER_CRASH");
      expect(crashLogs.length).toBeGreaterThan(0);
      expect(crashLogs[0]?.message).toContain(
        "Failed to instantiate WebAssembly module"
      );
    });
  });

  describe("TC-EFR-02: Worker Crash During In-Flight Search (searchBestMove)", () => {
    it("rejects in-flight search promise and transitions state to error", async () => {
      mockBridge.setAutoRespondBestMove(false);
      await engineService.init();
      expect(engineService.state).toBe("ready");

      const searchPromise = engineService.searchBestMove({
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      });

      expect(engineService.state).toBe("thinking");

      mockBridge.simulateWorkerCrash("Out of memory in WASM heap", true);

      await expect(searchPromise).rejects.toThrow(EngineFatalError);
      expect(engineService.state).toBe("error");
    });
  });

  describe("TC-EFR-03: Absolute Game State Preservation", () => {
    it("preserves board position, move history, and captured pieces after engine crash", async () => {
      const config: GameSessionConfig = {
        mode: "human_vs_engine",
        players: {
          w: { id: "p1", name: "Human", color: "w", type: "human" },
          b: { id: "p2", name: "Stockfish", color: "b", type: "engine" },
        },
      };
      const session = createGameSession(config);

      // Play 1. e4
      session.makeMove({ from: "e2", to: "e4" });
      const fenBeforeCrash = session.exportFen();
      const historyBeforeCrash = session.getHistory();
      const capturedBeforeCrash = session.getCapturedPieces();

      mockBridge.setAutoRespondBestMove(false);
      await engineService.init();

      const searchPromise = engineService.searchBestMove({
        fen: fenBeforeCrash,
      });

      mockBridge.simulateWorkerCrash("Worker crashed during search", true);
      await expect(searchPromise).rejects.toThrow(EngineFatalError);

      // Invariants: game state is completely unaffected
      expect(session.exportFen()).toBe(fenBeforeCrash);
      expect(session.getHistory()).toEqual(historyBeforeCrash);
      expect(session.getCapturedPieces()).toEqual(capturedBeforeCrash);
      expect(session.getState().turn).toBe("b");
    });
  });

  describe("TC-EFR-04: Stale Response Invalidation After Recovery", () => {
    it("discards late best-move responses from older search tokens after restart", async () => {
      await engineService.init();
      mockBridge.setAutoRespondBestMove(false);

      const searchPromise = engineService.searchBestMove({
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      });

      const oldToken =
        mockBridge.getLastRequest()?.type === "SEARCH"
          ? (
              mockBridge.getLastRequest() as {
                request: { searchToken: string };
              }
            ).request.searchToken
          : "token-1";

      mockBridge.simulateWorkerCrash("Crash", true);
      await expect(searchPromise).rejects.toThrow();

      // Reset and re-init
      await engineService.reset();
      expect(engineService.state).toBe("ready");

      // Simulate stale message with oldToken
      mockBridge.simulateStaleResponse(oldToken, "c7c5");

      // Verify state is still ready and no crash or corrupted state occurred
      expect(engineService.state).toBe("ready");
    });
  });

  describe("TC-EFR-05: Clean Engine Restart Lifecycle", () => {
    it("terminates damaged worker, recreates bridge, and transitions to ready state", async () => {
      await engineService.init();
      mockBridge.simulateWorkerCrash("Fatal memory error", true);
      expect(engineService.state).toBe("error");

      await engineService.reset();
      expect(engineService.state).toBe("ready");

      const successLogs = engineDiagnostics.getLogsByType("RESTART_SUCCESS");
      expect(successLogs.length).toBeGreaterThan(0);
    });
  });

  describe("TC-EFR-06: Automatic Resume on Engine Turn After Restart", () => {
    it("re-dispatches searchBestMove and makes move after restartEngine is called", async () => {
      const config: GameSessionConfig = {
        mode: "human_vs_engine",
        players: {
          w: { id: "p1", name: "Human", color: "w", type: "human" },
          b: { id: "p2", name: "Stockfish", color: "b", type: "engine" },
        },
      };
      const session = createGameSession(config);

      mockBridge.setAutoRespondBestMove(false);

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

      // Human plays 1. e4
      act(() => {
        session.makeMove({ from: "e2", to: "e4" });
      });
      rerender({ state: session.getState() });

      expect(result.current.isEngineThinking).toBe(true);

      // Simulate crash
      act(() => {
        mockBridge.simulateWorkerCrash("Engine died", true);
      });

      expect(result.current.engineState).toBe("error");
      expect(result.current.engineError).not.toBeNull();
      expect(result.current.isEngineThinking).toBe(false);

      // Restore auto-respond and restart engine
      mockBridge.setAutoRespondBestMove("e7e5");

      await act(async () => {
        await result.current.restartEngine();
      });

      // Engine should resume thinking and play e7e5
      await waitFor(() => {
        expect(session.getState().turn).toBe("w");
      });

      expect(session.getHistory()).toHaveLength(2);
      expect(session.getHistory()[1]?.san).toBe("e5");
      expect(result.current.engineError).toBeNull();
    });
  });

  describe("TC-EFR-07: Fallback to Two-Player Mode", () => {
    it("switches session mode to pass_and_play and updates engine player to human", () => {
      const config: GameSessionConfig = {
        mode: "human_vs_engine",
        players: {
          w: { id: "p1", name: "Human", color: "w", type: "human" },
          b: { id: "p2", name: "Stockfish", color: "b", type: "engine" },
        },
      };
      const session = createGameSession(config);
      session.makeMove({ from: "e2", to: "e4" });

      const { result } = renderHook(() =>
        useEngineOpponent({
          sessionController: session,
          sessionState: session.getState(),
          engineService,
        })
      );

      act(() => {
        mockBridge.simulateWorkerCrash("Worker crashed", true);
      });

      expect(result.current.engineState).toBe("error");

      act(() => {
        result.current.continueAsTwoPlayers();
      });

      const updatedState = session.getState();
      expect(updatedState.mode).toBe("human_vs_human");
      expect(updatedState.players.b.type).toBe("human");
      expect(result.current.engineError).toBeNull();

      // Human can now play Black move 1... e5
      const moveRes = session.makeMove({ from: "e7", to: "e5" });
      expect(moveRes.success).toBe(true);
      expect(session.getHistory()).toHaveLength(2);
    });
  });

  describe("TC-EFR-08: UI Error Banner Rendering & Accessibility", () => {
    it("renders alert role, message, restart button, 2P fallback button, and dismiss button", () => {
      const onRestart = vi.fn();
      const onFallback2P = vi.fn();
      const onDismiss = vi.fn();
      const error = new Error("WASM Memory Out of Bounds");

      render(
        <EngineErrorBanner
          error={error}
          onRestart={onRestart}
          onFallback2P={onFallback2P}
          onDismiss={onDismiss}
        />
      );

      const banner = screen.getByRole("alert");
      expect(banner).toBeInTheDocument();
      expect(screen.getByText("Chess Engine Error")).toBeInTheDocument();
      expect(screen.getByText("WASM Memory Out of Bounds")).toBeInTheDocument();

      const restartBtn = screen.getByTestId("btn-engine-restart");
      const fallbackBtn = screen.getByTestId("btn-engine-fallback-2p");
      const dismissBtn = screen.getByTestId("btn-engine-dismiss-error");

      fireEvent.click(restartBtn);
      expect(onRestart).toHaveBeenCalledOnce();

      fireEvent.click(fallbackBtn);
      expect(onFallback2P).toHaveBeenCalledOnce();

      fireEvent.click(dismissBtn);
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });

  describe("TC-EFR-10: Generative fast-check Invariant Fuzzing with Crash Injection", () => {
    it("maintains chess game invariants through randomized moves and simulated crashes", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              shouldCrash: fc.boolean(),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (steps) => {
            const testBridge = new MockEngineWorkerBridge({
              autoRespondReady: true,
              autoRespondBestMove: "e7e5",
            });
            const testService = new EngineServiceImpl(testBridge);
            const session = createGameSession({
              mode: "human_vs_engine",
              players: {
                w: { id: "p1", name: "H", color: "w", type: "human" },
                b: { id: "p2", name: "E", color: "b", type: "engine" },
              },
            });

            for (const step of steps) {
              const legalMoves = session.getLegalMoves();
              if (legalMoves.length === 0 || session.getState().isGameOver)
                break;

              // Make first legal move if available
              const validMove = legalMoves[0];
              if (validMove) {
                session.makeMove({
                  from: validMove.from,
                  to: validMove.to,
                  promotion: validMove.promotion,
                });
              }

              if (step.shouldCrash) {
                testBridge.simulateWorkerCrash("Injected fuzzing crash", true);
                expect(
                  testService.state === "error" || testService.state === "idle"
                ).toBe(true);
                // Invariants must hold
                const state = session.getState();
                expect(state.moveHistory.length).toBeGreaterThanOrEqual(1);
                expect(
                  state.position.turn === "w" || state.position.turn === "b"
                ).toBe(true);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
