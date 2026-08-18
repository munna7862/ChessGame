import { useState, useEffect, useRef, useCallback } from "react";
import type { EngineService, EngineLifecycleState } from "./types";
import { EngineSearchCancelledError } from "./types";
import { StockfishWorkerBridge } from "./StockfishWorkerBridge";
import { EngineServiceImpl } from "./EngineServiceImpl";
import {
  getEngineDifficultyConfig,
  DEFAULT_DIFFICULTY_LEVEL,
} from "./difficulty";
import { parseUciMoveToInput } from "./uciProtocol";
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
}

export interface UseEngineOpponentReturn {
  readonly isEngineThinking: boolean;
  readonly isEngineTurn: boolean;
  readonly engineState: EngineLifecycleState;
  readonly cancelThinking: () => Promise<void>;
}

/**
 * React hook coordinating the automated engine opponent lifecycle in Human vs Computer games.
 * Adheres strictly to INV-HVC-01 through INV-HVC-09.
 */
export function useEngineOpponent({
  sessionController,
  sessionState,
  engineService: customEngineService,
  enabled = true,
  onEngineError,
}: UseEngineOpponentOptions): UseEngineOpponentReturn {
  const engineService = customEngineService ?? getSharedEngineService();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineLifecycleState>(
    engineService.state
  );

  const activeRequestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Subscribe to engine lifecycle state changes
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = engineService.onStateChange((state) => {
      if (isMountedRef.current) {
        setEngineState(state);
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

  const isEngineThinking = isSearching && isEngineTurn;

  const cancelThinking = useCallback(async () => {
    activeRequestIdRef.current += 1;
    if (isMountedRef.current) {
      setIsSearching(false);
    }
    await engineService.cancelSearch();
  }, [engineService]);

  // Main turn-triggering effect
  useEffect(() => {
    if (!enabled || !isEngineTurn) {
      return;
    }

    const currentRequestId = ++activeRequestIdRef.current;

    const executeEngineTurn = async () => {
      try {
        if (
          !isMountedRef.current ||
          activeRequestIdRef.current !== currentRequestId
        ) {
          return;
        }

        setIsSearching(true);

        if (engineService.state !== "ready") {
          await engineService.init();
        }

        if (
          !isMountedRef.current ||
          activeRequestIdRef.current !== currentRequestId
        ) {
          return;
        }

        // Determine difficulty configuration
        const difficultyLevel =
          activePlayer.difficulty ?? DEFAULT_DIFFICULTY_LEVEL;
        const difficultyConfig = getEngineDifficultyConfig(difficultyLevel);

        const currentFen = sessionController.exportFen();
        const sessionId = sessionState.id;

        const result = await engineService.searchBestMove({
          fen: currentFen,
          sessionId,
          skillLevel: difficultyConfig.skillLevel,
          depth: difficultyConfig.depth,
          movetimeMs: difficultyConfig.movetimeMs,
        });

        if (
          !isMountedRef.current ||
          activeRequestIdRef.current !== currentRequestId
        ) {
          return;
        }

        // Apply best move through domain
        const moveInput = parseUciMoveToInput(result.bestMoveUci);
        if (moveInput) {
          sessionController.makeMove(moveInput);
        }

        if (
          isMountedRef.current &&
          activeRequestIdRef.current === currentRequestId
        ) {
          setIsSearching(false);
        }
      } catch (err) {
        if (err instanceof EngineSearchCancelledError) {
          if (
            isMountedRef.current &&
            activeRequestIdRef.current === currentRequestId
          ) {
            setIsSearching(false);
          }
          return;
        }

        if (
          isMountedRef.current &&
          activeRequestIdRef.current === currentRequestId
        ) {
          setIsSearching(false);
          if (onEngineError && err instanceof Error) {
            onEngineError(err);
          }
        }
      }
    };

    void executeEngineTurn();

    return () => {
      activeRequestIdRef.current += 1;
    };
  }, [
    enabled,
    isEngineTurn,
    sessionState.id,
    sessionState.position.fen,
    sessionState.turn,
    activePlayer.difficulty,
    engineService,
    sessionController,
    onEngineError,
  ]);

  return {
    isEngineThinking,
    isEngineTurn,
    engineState,
    cancelThinking,
  };
}
