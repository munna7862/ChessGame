import { Chess, type Move as ChessJsMove } from "chess.js";
import {
  type ChessDomainError,
  createDomainError,
  err,
  ok,
  type Result,
} from "../errors";
import type { ChessAdapterPort } from "../ports";
import {
  type BoardMatrix,
  type Color,
  type GameStatus,
  type Move,
  type MoveInput,
  type Piece,
  type PieceType,
  type PlayerCastlingRights,
  type Position,
  PROMOTION_PIECE_TYPES,
  type PromotionPieceType,
  type Square,
  isValidSquare,
  oppositeColor,
} from "../types";

/**
 * Adapter encapsulating the third-party `chess.js` engine behind the pure domain `ChessAdapterPort`.
 */
export class ChessJsAdapter implements ChessAdapterPort {
  private instance: Chess;

  constructor(initialFen?: string) {
    if (initialFen) {
      this.instance = new Chess(initialFen);
    } else {
      this.instance = new Chess();
    }
  }

  public getPosition(): Position {
    const rawBoard = this.instance.board();
    const board: BoardMatrix = rawBoard.map((row) =>
      row.map((cell) => {
        if (!cell) return null;
        return {
          type: cell.type as PieceType,
          color: cell.color as Color,
        };
      })
    );

    const fen = this.instance.fen();
    const fenTokens = fen.split(" ");
    const castlingToken = fenTokens[2] ?? "-";
    const enPassantToken = fenTokens[3] ?? "-";
    const halfmoveClock = parseInt(fenTokens[4] ?? "0", 10);
    const fullmoveNumber = parseInt(fenTokens[5] ?? "1", 10);

    const castling: PlayerCastlingRights = {
      w: {
        kingside: castlingToken.includes("K"),
        queenside: castlingToken.includes("Q"),
      },
      b: {
        kingside: castlingToken.includes("k"),
        queenside: castlingToken.includes("q"),
      },
    };

    const enPassantSquare = isValidSquare(enPassantToken)
      ? enPassantToken
      : null;

    return {
      board,
      turn: this.instance.turn() as Color,
      castling,
      enPassantSquare,
      halfmoveClock: isNaN(halfmoveClock) ? 0 : halfmoveClock,
      fullmoveNumber: isNaN(fullmoveNumber) ? 1 : fullmoveNumber,
      isCheck: this.instance.inCheck(),
      fen,
    };
  }

  public getPiece(square: Square): Piece | null {
    if (!isValidSquare(square)) {
      return null;
    }
    const piece = this.instance.get(square as Parameters<Chess["get"]>[0]);
    if (!piece) return null;
    return {
      type: piece.type as PieceType,
      color: piece.color as Color,
    };
  }

  public getLegalMoves(square?: Square): Move[] {
    try {
      const options: { verbose: true; square?: Square } = { verbose: true };
      if (square) {
        if (!isValidSquare(square)) {
          return [];
        }
        options.square = square;
      }
      const rawMoves = this.instance.moves(
        options as Parameters<Chess["moves"]>[0]
      ) as ChessJsMove[];
      return rawMoves.map((m) => this.mapChessJsMoveToDomain(m));
    } catch {
      return [];
    }
  }

  public isLegalMove(move: MoveInput): boolean {
    if (!isValidSquare(move.from) || !isValidSquare(move.to)) {
      return false;
    }
    const legalMoves = this.getLegalMoves(move.from);
    return legalMoves.some(
      (m) =>
        m.to === move.to && (!move.promotion || m.promotion === move.promotion)
    );
  }

  public makeMove(moveInput: MoveInput): Result<Move, ChessDomainError> {
    if (!isValidSquare(moveInput.from)) {
      return err(
        createDomainError(
          "INVALID_SQUARE",
          `Origin square '${moveInput.from}' is invalid.`,
          {
            square: moveInput.from,
          }
        )
      );
    }
    if (!isValidSquare(moveInput.to)) {
      return err(
        createDomainError(
          "INVALID_SQUARE",
          `Destination square '${moveInput.to}' is invalid.`,
          {
            square: moveInput.to,
          }
        )
      );
    }

    if (this.instance.isGameOver()) {
      return err(
        createDomainError(
          "GAME_ALREADY_OVER",
          "Cannot execute move on a completed game session."
        )
      );
    }

    const pieceAtOrigin = this.getPiece(moveInput.from);
    if (!pieceAtOrigin) {
      return err(
        createDomainError(
          "NO_PIECE_AT_SQUARE",
          `No piece found at square ${moveInput.from}.`,
          {
            square: moveInput.from,
          }
        )
      );
    }

    if (pieceAtOrigin.color !== this.instance.turn()) {
      return err(
        createDomainError(
          "NOT_YOUR_TURN",
          `Cannot move piece belonging to opponent (${pieceAtOrigin.color}).`,
          {
            expectedColor: this.instance.turn(),
            actualColor: pieceAtOrigin.color,
          }
        )
      );
    }

    const isPawn = pieceAtOrigin.type === "p";
    const destRank = moveInput.to[1];
    const isPromotingMove =
      isPawn &&
      ((pieceAtOrigin.color === "w" && destRank === "8") ||
        (pieceAtOrigin.color === "b" && destRank === "1"));

    if (isPromotingMove) {
      if (!moveInput.promotion) {
        return err(
          createDomainError(
            "PROMOTION_REQUIRED",
            `Pawn promotion from ${moveInput.from} to ${moveInput.to} requires specifying a promotion piece ('q', 'r', 'b', 'n').`,
            { move: moveInput }
          )
        );
      }
      if (!PROMOTION_PIECE_TYPES.includes(moveInput.promotion)) {
        return err(
          createDomainError(
            "ILLEGAL_MOVE",
            `Invalid promotion piece '${moveInput.promotion}'. Eligible types are 'q', 'r', 'b', 'n'.`,
            {
              move: moveInput,
              promotion: moveInput.promotion,
            }
          )
        );
      }
    } else if (moveInput.promotion) {
      return err(
        createDomainError(
          "ILLEGAL_MOVE",
          `Promotion piece '${moveInput.promotion}' specified for non-promotion move from ${moveInput.from} to ${moveInput.to}.`,
          { move: moveInput }
        )
      );
    }

    try {
      const movePayload: { from: string; to: string; promotion?: string } = {
        from: moveInput.from,
        to: moveInput.to,
      };
      if (moveInput.promotion) {
        movePayload.promotion = moveInput.promotion;
      }
      const rawMove = this.instance.move(movePayload);

      if (!rawMove) {
        return err(
          createDomainError(
            "ILLEGAL_MOVE",
            `Move from ${moveInput.from} to ${moveInput.to} is illegal.`,
            {
              move: moveInput,
            }
          )
        );
      }

      return ok(this.mapChessJsMoveToDomain(rawMove));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return err(
        createDomainError(
          "ILLEGAL_MOVE",
          `Move validation failed: ${errorMessage}`,
          {
            move: moveInput,
            error: errorMessage,
          }
        )
      );
    }
  }

  public undo(): Result<Move, ChessDomainError> {
    const rawUndone = this.instance.undo();
    if (!rawUndone) {
      return err(
        createDomainError(
          "NO_MOVE_TO_UNDO",
          "No previous move exists in history to undo."
        )
      );
    }
    return ok(this.mapChessJsMoveToDomain(rawUndone));
  }

  public loadFen(fen: string): Result<void, ChessDomainError> {
    try {
      // In chess.js, load resets and parses the FEN
      this.instance.load(fen);
      return ok(undefined);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid FEN structure.";
      return err(
        createDomainError("INVALID_FEN", `Failed to load FEN: ${message}`, {
          fen,
          error: message,
        })
      );
    }
  }

  public exportFen(): string {
    return this.instance.fen();
  }

  public importPgn(pgn: string): Result<void, ChessDomainError> {
    try {
      this.instance.loadPgn(pgn);
      return ok(undefined);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid PGN structure.";
      return err(
        createDomainError("INVALID_PGN", `Failed to load PGN: ${message}`, {
          pgn,
          error: message,
        })
      );
    }
  }

  public exportPgn(): string {
    return this.instance.pgn();
  }

  public getStatus(): GameStatus {
    const isCheck = this.instance.inCheck();
    const isOver = this.instance.isGameOver();
    const turn = this.instance.turn() as Color;

    if (this.instance.isCheckmate()) {
      const winner = oppositeColor(turn);
      return {
        state: "checkmate",
        isOver: true,
        winner,
        isCheck: true,
        inDraw: false,
        drawReason: null,
        description: `Checkmate! ${winner === "w" ? "White" : "Black"} wins.`,
      };
    }

    if (this.instance.isStalemate()) {
      return {
        state: "stalemate",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "stalemate",
        description: "Draw by stalemate.",
      };
    }

    if (this.instance.isThreefoldRepetition()) {
      return {
        state: "draw_threefold_repetition",
        isOver: true,
        winner: null,
        isCheck,
        inDraw: true,
        drawReason: "threefold_repetition",
        description: "Draw by threefold repetition.",
      };
    }

    if (this.instance.isInsufficientMaterial()) {
      return {
        state: "draw_insufficient_material",
        isOver: true,
        winner: null,
        isCheck: false,
        inDraw: true,
        drawReason: "insufficient_material",
        description: "Draw by insufficient material.",
      };
    }

    // Check 50-move rule: halfmove clock >= 100
    const fenTokens = this.instance.fen().split(" ");
    const halfmoveClock = parseInt(fenTokens[4] ?? "0", 10);
    if (halfmoveClock >= 100) {
      return {
        state: "draw_fifty_moves",
        isOver: true,
        winner: null,
        isCheck,
        inDraw: true,
        drawReason: "fifty_moves",
        description: "Draw by 50-move rule.",
      };
    }

    if (isOver && this.instance.isDraw()) {
      return {
        state: "draw_agreement",
        isOver: true,
        winner: null,
        isCheck,
        inDraw: true,
        drawReason: "agreement",
        description: "Game concluded in a draw.",
      };
    }

    return {
      state: "active",
      isOver: false,
      winner: null,
      isCheck,
      inDraw: false,
      drawReason: null,
      description: isCheck
        ? `${turn === "w" ? "White" : "Black"} is in check.`
        : "Game in progress.",
    };
  }

  public getHistory(): Move[] {
    const rawHistory = this.instance.history({
      verbose: true,
    }) as ChessJsMove[];
    return rawHistory.map((m) => this.mapChessJsMoveToDomain(m));
  }

  public reset(): void {
    this.instance.reset();
  }

  private mapChessJsMoveToDomain(raw: ChessJsMove): Move {
    const isCastling = raw.flags.includes("k")
      ? "kingside"
      : raw.flags.includes("q")
        ? "queenside"
        : undefined;
    const isEnPassant = raw.flags.includes("e");
    const isCheck = raw.san.includes("+") || raw.san.includes("#");
    const isCheckmate = raw.san.includes("#");

    return {
      from: raw.from as Square,
      to: raw.to as Square,
      piece: {
        type: raw.piece as PieceType,
        color: raw.color as Color,
      },
      promotion: raw.promotion
        ? (raw.promotion as PromotionPieceType)
        : undefined,
      captured: raw.captured
        ? {
            type: raw.captured as PieceType,
            color: oppositeColor(raw.color as Color),
          }
        : undefined,
      san: raw.san,
      lan: raw.lan,
      isEnPassant: isEnPassant || undefined,
      isCastling,
      isCheck: isCheck || undefined,
      isCheckmate: isCheckmate || undefined,
      beforeFen: raw.before,
      afterFen: raw.after,
    };
  }
}
