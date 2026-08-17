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
import { getPieceAriaLabel } from "./pieceUtils";
import type {
  LegalDestination,
  LegalTargetType,
  LastMoveState,
  PendingPromotion,
} from "./types";

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
  readonly focusedSquare: Square | null;
  readonly legalDestinations: ReadonlyMap<Square, LegalDestination>;
  readonly lastMove: LastMoveState | null;
  readonly checkSquare: Square | null;
  readonly isCheckmate: boolean;
  readonly isGameOver: boolean;
  readonly gameStatus: GameStatus;
  readonly pendingPromotion: PendingPromotion | null;
  readonly announcement: string | null;
  readonly handleSquareClick: (square: Square) => void;
  readonly handlePromotionSelect: (pieceType: PromotionPieceType) => void;
  readonly handlePromotionCancel: () => void;
  readonly clearSelection: () => void;
  readonly selectSquare: (square: Square) => void;
  readonly setFocusedSquare: (square: Square | null) => void;
  readonly setAnnouncement: (announcement: string | null) => void;
  readonly setLastMove: (lastMove: LastMoveState | null) => void;
  readonly resetLastMove: () => void;
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
  if (!status.isCheck && status.state !== "checkmate") {
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
  defaultPromotion: _defaultPromotion = "q",
}: UseBoardInteractionOptions): BoardInteractionState {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [focusedSquare, setFocusedSquare] = useState<Square | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<
    Map<Square, LegalDestination>
  >(() => new Map());
  const [lastMove, setLastMoveState] = useState<LastMoveState | null>(null);
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const gameStatus = game.getStatus();
  const isGameOver = disabled || gameStatus.isOver;
  const isCheckmate = gameStatus.state === "checkmate";
  const currentTurn = game.getPosition().turn;

  const checkSquare = useMemo(
    () => findCheckSquare(game, currentTurn),
    [game, currentTurn]
  );

  const clearSelection = useCallback((announce = true) => {
    setSelectedSquare(null);
    setLegalDestinations(new Map());
    if (announce) {
      setAnnouncement("Selection cleared.");
    }
  }, []);

  const resetLastMove = useCallback(() => {
    setLastMoveState(null);
  }, []);

  const setLastMove = useCallback((move: LastMoveState | null) => {
    setLastMoveState(move);
  }, []);

  const handlePromotionCancel = useCallback(() => {
    setPendingPromotion(null);
    clearSelection(false);
    setAnnouncement("Promotion cancelled.");
  }, [clearSelection]);

  const handlePromotionSelect = useCallback(
    (pieceType: PromotionPieceType) => {
      if (!pendingPromotion) return;

      const moveInput: MoveInput = {
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: pieceType,
      };

      const moveResult = game.makeMove(moveInput);

      if (moveResult.success) {
        const executedMove = moveResult.data;
        const isCapture = Boolean(
          executedMove.captured || executedMove.isEnPassant
        );

        setLastMoveState({
          from: pendingPromotion.from,
          to: pendingPromotion.to,
          isCapture,
          san: executedMove.san,
        });
        setFocusedSquare(pendingPromotion.to);
        const checkText = executedMove.isCheckmate
          ? ", checkmate"
          : executedMove.isCheck
            ? ", check"
            : "";
        const colorName = pendingPromotion.color === "w" ? "White" : "Black";
        setAnnouncement(
          `${colorName} pawn promoted to ${pieceType} on ${pendingPromotion.to}${checkText}.`
        );

        setPendingPromotion(null);
        clearSelection(false);
        onMoveExecuted?.(executedMove);
      } else {
        setPendingPromotion(null);
        clearSelection(false);
      }
    },
    [pendingPromotion, game, clearSelection, onMoveExecuted]
  );

  const selectSquare = useCallback(
    (square: Square) => {
      if (isGameOver || pendingPromotion) {
        clearSelection(false);
        return;
      }

      const piece: Piece | null = game.getPiece(square);
      if (!piece || piece.color !== currentTurn) {
        clearSelection(false);
        return;
      }

      const dests = computeLegalDestinations(square, game);
      setSelectedSquare(square);
      setFocusedSquare(square);
      setLegalDestinations(dests);
      const pieceLabel = getPieceAriaLabel(piece);
      const moveCount = dests.size;
      const moveWord = moveCount === 1 ? "move" : "moves";
      const destList = Array.from(dests.keys()).join(", ");
      setAnnouncement(
        `Selected ${pieceLabel} on ${square}. ${moveCount} legal ${moveWord} available${moveCount > 0 ? `: ${destList}` : ""}.`
      );
    },
    [game, currentTurn, isGameOver, pendingPromotion, clearSelection]
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (isGameOver) {
        clearSelection(false);
        setPendingPromotion(null);
        return;
      }

      // If promotion dialog is active, ignore board square clicks or dismiss
      if (pendingPromotion) {
        return;
      }

      const piece: Piece | null = game.getPiece(square);
      setFocusedSquare(square);

      // 1. Idle state (no square currently selected)
      if (selectedSquare === null) {
        if (piece && piece.color === currentTurn) {
          const dests = computeLegalDestinations(square, game);
          setSelectedSquare(square);
          setLegalDestinations(dests);
          const pieceLabel = getPieceAriaLabel(piece);
          const moveCount = dests.size;
          const moveWord = moveCount === 1 ? "move" : "moves";
          const destList = Array.from(dests.keys()).join(", ");
          setAnnouncement(
            `Selected ${pieceLabel} on ${square}. ${moveCount} legal ${moveWord} available${moveCount > 0 ? `: ${destList}` : ""}.`
          );
        }
        return;
      }

      // 2. Square already selected
      // A. Click the exact same square -> Deselect
      if (square === selectedSquare) {
        clearSelection(true);
        return;
      }

      // B. Click a legal destination -> Execute Move or Trigger Promotion
      const legalDest = legalDestinations.get(square);
      if (legalDest) {
        const fromPiece = game.getPiece(selectedSquare);
        const isPawnPromotion =
          fromPiece?.type === "p" &&
          ((fromPiece.color === "w" && square[1] === "8") ||
            (fromPiece.color === "b" && square[1] === "1"));

        if (isPawnPromotion && fromPiece) {
          // Open interactive promotion dialog
          setPendingPromotion({
            from: selectedSquare,
            to: square,
            color: fromPiece.color,
          });
          setAnnouncement(
            `Pawn promotion dialog opened on ${square}. Choose Queen, Rook, Bishop, or Knight.`
          );
          return;
        }

        const moveInput: MoveInput = {
          from: selectedSquare,
          to: square,
          ...(legalDest.move?.promotion
            ? { promotion: legalDest.move.promotion }
            : {}),
        };

        const moveResult = game.makeMove(moveInput);

        if (moveResult.success) {
          const executedMove = moveResult.data;
          const isCapture = Boolean(
            executedMove.captured || executedMove.isEnPassant
          );

          setLastMoveState({
            from: selectedSquare,
            to: square,
            isCapture,
            san: executedMove.san,
          });
          setFocusedSquare(square);
          const movePiece = executedMove.piece
            ? getPieceAriaLabel(executedMove.piece)
            : "Piece";
          const captureText = executedMove.captured
            ? `, captured ${getPieceAriaLabel(executedMove.captured)} on ${executedMove.to}`
            : "";
          const checkText = executedMove.isCheckmate
            ? ", checkmate"
            : executedMove.isCheck
              ? ", check"
              : "";
          setAnnouncement(
            `${movePiece} moved from ${executedMove.from} to ${executedMove.to}${captureText}${checkText}.`
          );

          clearSelection(false);
          onMoveExecuted?.(executedMove);
        } else {
          clearSelection(false);
          setAnnouncement("Move failed.");
        }
        return;
      }

      // C. Click another friendly piece of same color -> Switch selection
      if (piece && piece.color === currentTurn) {
        const dests = computeLegalDestinations(square, game);
        setSelectedSquare(square);
        setLegalDestinations(dests);
        const pieceLabel = getPieceAriaLabel(piece);
        const moveCount = dests.size;
        const moveWord = moveCount === 1 ? "move" : "moves";
        const destList = Array.from(dests.keys()).join(", ");
        setAnnouncement(
          `Selected ${pieceLabel} on ${square}. ${moveCount} legal ${moveWord} available${moveCount > 0 ? `: ${destList}` : ""}.`
        );
        return;
      }

      // D. Click non-legal square -> Clear selection (no mutation)
      clearSelection(true);
    },
    [
      isGameOver,
      pendingPromotion,
      selectedSquare,
      legalDestinations,
      currentTurn,
      game,
      onMoveExecuted,
      clearSelection,
    ]
  );

  return {
    selectedSquare,
    focusedSquare,
    legalDestinations,
    lastMove,
    checkSquare,
    isCheckmate,
    isGameOver,
    gameStatus,
    pendingPromotion,
    announcement,
    handleSquareClick,
    handlePromotionSelect,
    handlePromotionCancel,
    clearSelection,
    selectSquare,
    setFocusedSquare,
    setAnnouncement,
    setLastMove,
    resetLastMove,
  };
}
