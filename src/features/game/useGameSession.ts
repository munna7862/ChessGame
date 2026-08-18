import { useMemo, useCallback, useSyncExternalStore } from "react";
import type { ChessDomainError, Result } from "../../domain/chess/errors";
import type { PgnTags } from "../../domain/chess/pgn";
import type { ChessGame } from "../../domain/chess/ports";
import type {
  Color,
  GameStatus,
  Move,
  MoveInput,
} from "../../domain/chess/types";
import {
  createGameSession,
  type GameSessionController,
} from "./GameSessionController";
import type { GameSessionConfig, GameSessionState } from "./types";

export interface UseGameSessionOptions {
  readonly initialConfig?: GameSessionConfig | undefined;
  readonly sessionController?: GameSessionController | undefined;
}

export interface UseGameSessionReturn {
  readonly sessionState: GameSessionState;
  readonly sessionController: GameSessionController;
  readonly chessGame: ChessGame;
  readonly makeMove: (move: MoveInput) => Result<Move, ChessDomainError>;
  readonly undoMove: () => Result<Move, ChessDomainError>;
  readonly resetGame: (config?: Partial<GameSessionConfig>) => void;
  readonly resign: (player: Color) => Result<GameStatus, ChessDomainError>;
  readonly timeout: (player: Color) => Result<GameStatus, ChessDomainError>;
  readonly agreeDraw: () => Result<GameStatus, ChessDomainError>;
  readonly loadFen: (fen: string) => Result<void, ChessDomainError>;
  readonly exportFen: () => string;
  readonly exportPgn: (tags?: Partial<PgnTags>) => string;
}

/**
 * React hook connecting UI presentation components to the authoritative GameSessionController.
 */
export function useGameSession({
  initialConfig,
  sessionController: externalController,
}: UseGameSessionOptions = {}): UseGameSessionReturn {
  const controller = useMemo(() => {
    return externalController ?? createGameSession(initialConfig);
  }, [externalController, initialConfig]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return controller.subscribe(() => {
        onStoreChange();
      });
    },
    [controller]
  );

  const getSnapshot = useCallback(() => {
    return controller.getState();
  }, [controller]);

  const sessionState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const makeMove = useCallback(
    (move: MoveInput) => controller.makeMove(move),
    [controller]
  );

  const undoMove = useCallback(() => controller.undo(), [controller]);

  const resetGame = useCallback(
    (config?: Partial<GameSessionConfig>) => controller.reset(config),
    [controller]
  );

  const resign = useCallback(
    (player: Color) => controller.resign(player),
    [controller]
  );

  const timeout = useCallback(
    (player: Color) => controller.timeout(player),
    [controller]
  );

  const agreeDraw = useCallback(() => controller.agreeDraw(), [controller]);

  const loadFen = useCallback(
    (fen: string) => controller.loadFen(fen),
    [controller]
  );

  const exportFen = useCallback(() => controller.exportFen(), [controller]);

  const exportPgn = useCallback(
    (tags?: Partial<PgnTags>) => controller.exportPgn(tags),
    [controller]
  );

  return {
    sessionState,
    sessionController: controller,
    chessGame: controller.getChessGame(),
    makeMove,
    undoMove,
    resetGame,
    resign,
    timeout,
    agreeDraw,
    loadFen,
    exportFen,
    exportPgn,
  };
}
