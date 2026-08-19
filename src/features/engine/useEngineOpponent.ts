import { useState, useEffect, useRef, useCallback } from "react";
import type { EngineService, EngineLifecycleState } from "./types";
import { EngineSearchCancelledError } from "./types";
import { StockfishWorkerBridge } from "./StockfishWorkerBridge";
import { EngineServiceImpl } from "./EngineServiceImpl";
import {
  getEngineDifficultyConfig,
  calculateEngineSearchTimeBudget,
  DEFAULT_DIFFICULTY_LEVEL,
} from "./difficulty";
import { parseUciMoveToInput } from "./uciProtocol";
import { engineDiagnostics } from "./engineDiagnostics";
import type { IGameSessionController, GameSessionState } from "../game/types";

let sharedEngineService: EngineService | null = null;

/**
 * Returns the default shared EngineService singleton.
 */
export function getSharedEngineService(): EngineService {
  if (!sharedEngineService) {
    sharedEngineService = new EngineServiceImpl(
      () => new StockfishWorkerBridge()
    );
  }
  return sharedEngineService;
}

/**
 * Overrides the shared EngineService singleton (useful for deterministic testing).
 */
export function setSharedEngineService(service: EngineService | null): void {
  sharedEngineService = service;
}

export interface UseEngineOpponentOptions {
  readonly sessionController: IGameSessionController;
  readonly sessionState: GameSessionState;
  readonly engineService?: EngineService | undefined;
  readonly enabled?: boolean | undefined;
  readonly onEngineError?: ((error: Error) => void) | undefined;
  readonly clockRemainingMs?: number | undefined;
  readonly clockIncrementMs?: number | undefined;
}

export interface UseEngineOpponentReturn {
  readonly isEngineThinking: boolean;
  readonly isEngineTurn: boolean;
  readonly engineState: EngineLifecycleState;
  readonly engineError: Error | null;
  readonly cancelThinking: () => Promise<void>;
  readonly restartEngine: () => Promise<void>;
  readonly continueAsTwoPlayers: () => void;
  readonly clearError: () => void;
}

/**
 * React hook coordinating the automated engine opponent lifecycle in Human vs Computer games.
 * Adheres strictly to INV-HVC-01 through INV-HVC-09 and INV-EFR-01 through INV-EFR-06.
 */
export function useEngineOpponent({
  sessionController,
  sessionState,
  engineService: customEngineService,
  enabled = true,
  onEngineError,
  clockRemainingMs,
  clockIncrementMs,
}: UseEngineOpponentOptions): UseEngineOpponentReturn {
  const engineService = customEngineService ?? getSharedEngineService();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineLifecycleState>(
    engineService.state
  );
  const [engineError, setEngineError] = useState<Error | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const isMountedRef = useRef<boolean>(true);

  // Subscribe to engine lifecycle state changes
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = engineService.onStateChange((state) => {
      if (isMountedRef.current) {
        setEngineState(state);
        if (state === "error") {
          setIsSearching(false);
          const err = new Error(
            "The chess engine encountered an unexpected error and stopped responding."
          );
          setEngineError((prev) => prev ?? err);
        } else if (state === "ready" || state === "idle") {
          setEngineError(null);
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [engineService]);

  const activePlayer = sessionState.players[sessionState.turn];
  const isEngineTurn =
    !sessionState.isGameOver && activePlayer.type === "engine";

  const isEngineThinking =
    isSearching && isEngineTurn && engineState !== "error";

  const cancelThinking = useCallback(async () => {
    if (isMountedRef.current) {
      setIsSearching(false);
    }
    await engineService.cancelSearch();
  }, [engineService]);

  const restartEngine = useCallback(async () => {
    if (isMountedRef.current) {
      setEngineError(null);
      setIsSearching(false);
    }
    try {
      await engineService.reset();
      if (isMountedRef.current) {
        setRetryTrigger((prev) => prev + 1);
      }
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error("Failed to restart engine");
      if (isMountedRef.current) {
        setEngineError(errorObj);
      }
      if (onEngineError) {
        onEngineError(errorObj);
      }
    }
  }, [engineService, onEngineError]);

  const continueAsTwoPlayers = useCallback(() => {
    if (isMountedRef.current) {
      setEngineError(null);
      setIsSearching(false);
    }
    void engineService.cancelSearch();

    engineDiagnostics.log(
      "FALLBACK_2P",
      "User opted to continue game in two-player mode after engine error",
      { sessionId: sessionState.id }
    );

    const currentPlayers = sessionState.players;
    const updatedW =
      currentPlayers.w.type === "engine"
        ? { ...currentPlayers.w, type: "human" as const }
        : currentPlayers.w;
    const updatedB =
      currentPlayers.b.type === "engine"
        ? { ...currentPlayers.b, type: "human" as const }
        : currentPlayers.b;

    sessionController.updateGameMode("human_vs_human", {
      w: updatedW,
      b: updatedB,
    });
  }, [engineService, sessionController, sessionState.id, sessionState.players]);

  const clearError = useCallback(() => {
    setEngineError(null);
  }, []);

  const clockRemainingMsRef = useRef(clockRemainingMs);
  useEffect(() => {
    clockRemainingMsRef.current = clockRemainingMs;
  }, [clockRemainingMs]);

  const clockIncrementMsRef = useRef(clockIncrementMs);
  useEffect(() => {
    clockIncrementMsRef.current = clockIncrementMs;
  }, [clockIncrementMs]);

  // Main turn-triggering effect
  useEffect(() => {
    if (!enabled || !isEngineTurn) {
      return;
    }

    let isCancelled = false;

    const executeEngineTurn = async () => {
      try {
        if (!isMountedRef.current || isCancelled) {
          return;
        }

        setIsSearching(true);

        if (engineService.state !== "ready") {
          await engineService.init();
        }

        if (!isMountedRef.current || isCancelled) {
          return;
        }

        // Determine difficulty configuration & time budget
        const difficultyLevel =
          activePlayer.difficulty ?? DEFAULT_DIFFICULTY_LEVEL;
        const difficultyConfig = getEngineDifficultyConfig(difficultyLevel);

        const isTimed = Boolean(
          sessionState.timeControl && sessionState.timeControl.type !== "none"
        );
        const movetimeMs = calculateEngineSearchTimeBudget({
          difficultyLevel,
          remainingMs: clockRemainingMsRef.current,
          incrementMs:
            clockIncrementMsRef.current ??
            sessionState.timeControl?.incrementMs ??
            0,
          isTimedGame: isTimed,
        });

        const currentFen = sessionController.exportFen();
        const sessionId = sessionState.id;

        const result = await engineService.searchBestMove({
          fen: currentFen,
          sessionId,
          skillLevel: difficultyConfig.skillLevel,
          depth: difficultyConfig.depth,
          movetimeMs,
        });

        if (!isMountedRef.current || isCancelled) {
          return;
        }

        // Verify session is still active and valid before committing move (REQ-AI-CLK-04)
        const currentSession = sessionController.getState();
        if (
          !currentSession.isGameOver &&
          currentSession.id === sessionId &&
          currentSession.turn === sessionState.turn
        ) {
          const moveInput = parseUciMoveToInput(result.bestMoveUci);
          if (moveInput) {
            sessionController.makeMove(moveInput);
          }
        }

        if (isMountedRef.current && !isCancelled) {
          setIsSearching(false);
        }
      } catch (err) {
        if (err instanceof EngineSearchCancelledError) {
          if (isMountedRef.current && !isCancelled) {
            setIsSearching(false);
          }
          return;
        }

        if (isMountedRef.current && !isCancelled) {
          setIsSearching(false);
          const errorObj = err instanceof Error ? err : new Error(String(err));
          setEngineError(errorObj);
          if (onEngineError) {
            onEngineError(errorObj);
          }
        }
      }
    };

    void executeEngineTurn();

    return () => {
      isCancelled = true;
    };
  }, [
    enabled,
    isEngineTurn,
    sessionState.id,
    sessionState.position.fen,
    sessionState.turn,
    sessionState.timeControl,
    activePlayer.difficulty,
    retryTrigger,
    engineService,
    sessionController,
    onEngineError,
  ]);

  return {
    isEngineThinking,
    isEngineTurn,
    engineState,
    engineError,
    cancelThinking,
    restartEngine,
    continueAsTwoPlayers,
    clearError,
  };
}
