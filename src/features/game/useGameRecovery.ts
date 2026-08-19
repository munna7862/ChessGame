import { useState, useEffect, useCallback, useRef } from "react";
import { validateFen } from "../../domain/chess/fen";
import { createChessAdapter } from "../../domain/chess/adapters/chessJsAdapter";
import type { Color } from "../../domain/chess/types";
import type { TimeControl } from "../../domain/clock/types";
import type { PersistenceService } from "../../domain/persistence/PersistenceService";
import type { PersistedActiveGame } from "../../domain/persistence/schema";
import type { BoardOrientation } from "../board/types";
import type { GameSessionController } from "./GameSessionController";
import type { GameSessionState } from "./types";

export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface ClockInterface {
  readonly whiteRemainingMs: number;
  readonly blackRemainingMs: number;
  readonly isRunning: boolean;
  readonly timeControl: TimeControl;
  readonly startClock: (color?: Color) => void;
  readonly pauseClock: () => void;
  readonly restoreClock: (
    newTimeControl: TimeControl,
    whiteMs: number,
    blackMs: number,
    activeColor?: Color | null
  ) => void;
}

export interface UseGameRecoveryOptions {
  readonly persistenceService?: PersistenceService | undefined;
  readonly sessionController: GameSessionController;
  readonly sessionState: GameSessionState;
  readonly clock: ClockInterface;
  readonly orientation: BoardOrientation;
  readonly setOrientation: (orientation: BoardOrientation) => void;
  readonly onGameRestored?:
    ((snapshot: PersistedActiveGame) => void) | undefined;
}

export interface UseGameRecoveryReturn {
  readonly isRecoveryModalOpen: boolean;
  readonly recoverableGame: PersistedActiveGame | null;
  readonly continueGame: () => boolean;
  readonly discardGame: () => void;
  readonly dismissModal: () => void;
}

/**
 * Checks if a persisted active game is structurally and semantically recoverable.
 */
export function isRecoverableSession(
  snapshot: PersistedActiveGame | null | undefined
): boolean {
  if (!snapshot || !snapshot.fen) {
    return false;
  }

  // 1. Verify FEN validity
  const validation = validateFen(snapshot.fen);
  if (!validation.isValid) {
    return false;
  }

  // 2. Must either have move history or a non-standard board setup
  const hasHistory =
    Array.isArray(snapshot.moveHistorySan) &&
    snapshot.moveHistorySan.length > 0;
  const isNonStandardFen = snapshot.fen.trim() !== STARTING_FEN;
  if (!hasHistory && !isNonStandardFen) {
    return false;
  }

  // 3. Ensure the position is not already in a terminal game over state
  try {
    const adapter = createChessAdapter(snapshot.fen);
    const status = adapter.getStatus();
    if (status.isOver) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

/**
 * Hook managing startup detection, recovery dialog lifecycle, and authoritative auto-save.
 */
export function useGameRecovery(
  options: UseGameRecoveryOptions
): UseGameRecoveryReturn {
  const {
    persistenceService,
    sessionController,
    sessionState,
    clock,
    orientation,
    setOrientation,
    onGameRestored,
  } = options;

  const [initialRecoveryState] = useState<{
    isModalOpen: boolean;
    game: PersistedActiveGame | null;
  }>(() => {
    if (!persistenceService) {
      return { isModalOpen: false, game: null };
    }
    try {
      const loadResult = persistenceService.load();
      if (loadResult.success && loadResult.data?.activeGame) {
        const activeGame = loadResult.data.activeGame;
        if (isRecoverableSession(activeGame)) {
          return { isModalOpen: true, game: activeGame };
        } else {
          // Stale / completed / invalid recovery state is safely discarded
          persistenceService.saveActiveGame(null);
        }
      }
    } catch {
      // Safe fallback on any unhandled error
      persistenceService.saveActiveGame(null);
    }
    return { isModalOpen: false, game: null };
  });

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState<boolean>(
    () => initialRecoveryState.isModalOpen
  );
  const [recoverableGame, setRecoverableGame] =
    useState<PersistedActiveGame | null>(() => initialRecoveryState.game);

  const onGameRestoredRef = useRef(onGameRestored);
  useEffect(() => {
    onGameRestoredRef.current = onGameRestored;
  }, [onGameRestored]);

  // 2. Authoritative Auto-Save: Sync active game state to persistence on mutations
  useEffect(() => {
    if (!persistenceService) {
      return;
    }

    if (sessionState.isGameOver) {
      // Game has concluded: clear recovery state immediately
      persistenceService.saveActiveGame(null);
      return;
    }

    const hasMoves = sessionState.moveHistory.length > 0;
    const isCustomFen = sessionState.position.fen.trim() !== STARTING_FEN;

    if (hasMoves || isCustomFen) {
      const clockState =
        sessionState.timeControl && sessionState.timeControl.type !== "none"
          ? {
              whiteMs: clock.whiteRemainingMs,
              blackMs: clock.blackRemainingMs,
              timeControl: sessionState.timeControl,
            }
          : undefined;

      const snapshot = sessionController.toSnapshot(orientation, clockState);
      persistenceService.saveActiveGame(snapshot);
    }
  }, [
    sessionState,
    clock.whiteRemainingMs,
    clock.blackRemainingMs,
    orientation,
    persistenceService,
    sessionController,
  ]);

  // 3. Continue Game: Restore session state from snapshot
  const continueGame = useCallback((): boolean => {
    if (!recoverableGame) {
      return false;
    }

    const restoreRes = sessionController.restoreSession(recoverableGame);
    if (!restoreRes.success) {
      setIsRecoveryModalOpen(false);
      setRecoverableGame(null);
      persistenceService?.saveActiveGame(null);
      return false;
    }

    if (recoverableGame.clock) {
      const tc = recoverableGame.clock.timeControl;
      const timeControl: TimeControl = {
        type: tc.type,
        initialMs: tc.initialMs,
        incrementMs: tc.incrementMs,
        ...(tc.label !== undefined ? { label: tc.label } : {}),
      };
      const activeColor: Color =
        recoverableGame.fen.split(" ")[1] === "b" ? "b" : "w";
      clock.restoreClock(
        timeControl,
        recoverableGame.clock.whiteMs,
        recoverableGame.clock.blackMs,
        activeColor
      );
    }

    setOrientation(recoverableGame.userOrientation);
    setIsRecoveryModalOpen(false);
    onGameRestoredRef.current?.(recoverableGame);
    setRecoverableGame(null);
    return true;
  }, [
    recoverableGame,
    sessionController,
    clock,
    setOrientation,
    persistenceService,
  ]);

  // 4. Discard Game: Remove snapshot and start clean
  const discardGame = useCallback(() => {
    persistenceService?.saveActiveGame(null);
    setIsRecoveryModalOpen(false);
    setRecoverableGame(null);
  }, [persistenceService]);

  const dismissModal = useCallback(() => {
    setIsRecoveryModalOpen(false);
  }, []);

  return {
    isRecoveryModalOpen,
    recoverableGame,
    continueGame,
    discardGame,
    dismissModal,
  };
}
