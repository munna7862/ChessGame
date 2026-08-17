import { useState, useCallback, useMemo } from "react";
import type {
  Square,
  Move,
  MoveInput,
  Color,
  Piece,
  GameStatus,
  PromotionPieceType,
} from "../../domain/chess/types";
import type { ChessGame } from "../../domain/chess/ports";
import type { LegalDestination, LegalTargetType } from "./types";

/**
 * Options for the board interaction hook.
 */
export interface UseBoardInteractionOptions {
  readonly game: ChessGame;
  readonly onMoveExecuted?: ((move: Move) => void) | undefined;
  readonly disabled?: boolean | undefined;
  readonly defaultPromotion?: PromotionPieceType | undefined;
}

/**
 * State and handlers returned by useBoardInteraction.
 */
export interface BoardInteractionState {
  readonly selectedSquare: Square | null;
  readonly legalDestinations: ReadonlyMap<Square, LegalDestination>;
  readonly lastMove: { from: Square; to: Square } | null;
  readonly checkSquare: Square | null;
  readonly isGameOver: boolean;
  readonly gameStatus: GameStatus;
  readonly handleSquareClick: (square: Square) => void;
  readonly clearSelection: () => void;
  readonly selectSquare: (square: Square) => void;
}

/**
 * Helper to compute legal destinations and classify quiet moves vs captures.
 */
export function computeLegalDestinations(
  fromSquare: Square,
  game: ChessGame
): Map<Square, LegalDestination> {
  const legalMoves = game.getLegalMoves(fromSquare);
  const destinations = new Map<Square, LegalDestination>();

  for (const move of legalMoves) {
    const toSquare = move.to;
    const destPiece = game.getPiece(toSquare);

    const isCapture = Boolean(
      move.captured || move.isEnPassant || destPiece !== null
    );

    const targetType: LegalTargetType = isCapture ? "capture" : "move";

    destinations.set(toSquare, {
      square: toSquare,
      targetType,
      move,
    });
  }

  return destinations;
}

/**
 * Locate the king of the active player in check.
 */
export function findCheckSquare(
  game: ChessGame,
  activeColor: Color
): Square | null {
  const status = game.getStatus();
  if (!status.isCheck) {
    return null;
  }

  const pos = game.getPosition();
  for (let rankIdx = 0; rankIdx < 8; rankIdx += 1) {
    for (let fileIdx = 0; fileIdx < 8; fileIdx += 1) {
      const p = pos.board[rankIdx]?.[fileIdx];
      if (p && p.type === "k" && p.color === activeColor) {
        // Convert matrix indices to algebraic square: row 0 is rank 8, col 0 is file a
        const fileChar = String.fromCharCode(97 + fileIdx);
        const rankChar = String(8 - rankIdx);
        return `${fileChar}${rankChar}` as Square;
      }
    }
  }

  return null;
}

/**
 * Custom hook providing robust, accessible board selection and move interaction.
 */
export function useBoardInteraction({
  game,
  onMoveExecuted,
  disabled = false,
  defaultPromotion = "q",
}: UseBoardInteractionOptions): BoardInteractionState {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<
    Map<Square, LegalDestination>
  >(() => new Map());
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null
  );

  const gameStatus = game.getStatus();
  const isGameOver = disabled || gameStatus.isOver;
  const currentTurn = game.getPosition().turn;

  const checkSquare = useMemo(
    () => findCheckSquare(game, currentTurn),
    [game, currentTurn]
  );

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalDestinations(new Map());
  }, []);

  const selectSquare = useCallback(
    (square: Square) => {
      if (isGameOver) {
        clearSelection();
        return;
      }

      const piece: Piece | null = game.getPiece(square);
      if (!piece || piece.color !== currentTurn) {
        clearSelection();
        return;
      }

      const dests = computeLegalDestinations(square, game);
      setSelectedSquare(square);
      setLegalDestinations(dests);
    },
    [game, currentTurn, isGameOver, clearSelection]
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (isGameOver) {
        clearSelection();
        return;
      }

      const piece: Piece | null = game.getPiece(square);

      // 1. Idle state (no square currently selected)
      if (selectedSquare === null) {
        if (piece && piece.color === currentTurn) {
          const dests = computeLegalDestinations(square, game);
          setSelectedSquare(square);
          setLegalDestinations(dests);
        }
        return;
      }

      // 2. Square already selected
      // A. Click the exact same square -> Deselect
      if (square === selectedSquare) {
        clearSelection();
        return;
      }

      // B. Click a legal destination -> Execute Move
      const legalDest = legalDestinations.get(square);
      if (legalDest) {
        const fromPiece = game.getPiece(selectedSquare);
        const isPawnPromotion =
          fromPiece?.type === "p" &&
          ((fromPiece.color === "w" && square[1] === "8") ||
            (fromPiece.color === "b" && square[1] === "1"));

        const moveInput: MoveInput = isPawnPromotion
          ? {
              from: selectedSquare,
              to: square,
              promotion: legalDest.move?.promotion ?? defaultPromotion,
            }
          : {
              from: selectedSquare,
              to: square,
            };

        const moveResult = game.makeMove(moveInput);

        if (moveResult.success) {
          setLastMove({ from: selectedSquare, to: square });
          clearSelection();
          onMoveExecuted?.(moveResult.data);
        } else {
          clearSelection();
        }
        return;
      }

      // C. Click another friendly piece of same color -> Switch selection
      if (piece && piece.color === currentTurn) {
        const dests = computeLegalDestinations(square, game);
        setSelectedSquare(square);
        setLegalDestinations(dests);
        return;
      }

      // D. Click non-legal square -> Clear selection (no mutation)
      clearSelection();
    },
    [
      isGameOver,
      selectedSquare,
      legalDestinations,
      currentTurn,
      game,
      defaultPromotion,
      onMoveExecuted,
      clearSelection,
    ]
  );

  return {
    selectedSquare,
    legalDestinations,
    lastMove,
    checkSquare,
    isGameOver,
    gameStatus,
    handleSquareClick,
    clearSelection,
    selectSquare,
  };
}
