import type { Move, PieceType } from "../../domain/chess/types";
import type { CapturedPieces } from "./types";

export const PIECE_VALUES: Record<PieceType, number> = Object.freeze({
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
});

export const PIECE_DISPLAY_ORDER: readonly PieceType[] = Object.freeze([
  "q",
  "r",
  "b",
  "n",
  "p",
]);

export interface MovePair {
  readonly moveNumber: number;
  readonly white: Move;
  readonly black?: Move | undefined;
  readonly whitePlyIndex: number;
  readonly blackPlyIndex?: number | undefined;
}

export interface MaterialBalance {
  readonly whiteScore: number;
  readonly blackScore: number;
  readonly leader: "w" | "b" | null;
  readonly diff: number;
}

/**
 * Calculates the total material value for an array of captured pieces.
 */
export function calculateMaterialScore(
  pieces: readonly PieceType[] | undefined
): number {
  if (!pieces || pieces.length === 0) return 0;
  return pieces.reduce((total, piece) => total + (PIECE_VALUES[piece] ?? 0), 0);
}

/**
 * Calculates the net material advantage between White and Black captured pieces.
 */
export function calculateMaterialAdvantage(
  captured: CapturedPieces
): MaterialBalance {
  const whiteScore = calculateMaterialScore(captured.white);
  const blackScore = calculateMaterialScore(captured.black);

  if (whiteScore > blackScore) {
    return {
      whiteScore,
      blackScore,
      leader: "w",
      diff: whiteScore - blackScore,
    };
  }
  if (blackScore > whiteScore) {
    return {
      whiteScore,
      blackScore,
      leader: "b",
      diff: blackScore - whiteScore,
    };
  }

  return {
    whiteScore,
    blackScore,
    leader: null,
    diff: 0,
  };
}

/**
 * Sorts captured pieces by standard material value descending (Queen, Rook, Bishop, Knight, Pawn).
 */
export function sortCapturedPieces(
  pieces: readonly PieceType[]
): readonly PieceType[] {
  return [...pieces].sort((a, b) => {
    const valA = PIECE_VALUES[a] ?? 0;
    const valB = PIECE_VALUES[b] ?? 0;
    if (valB !== valA) {
      return valB - valA;
    }
    return a.localeCompare(b);
  });
}

/**
 * Groups a linear array of domain moves into paired full moves (White ply and optional Black ply).
 */
export function groupMovesIntoPairs(history: readonly Move[]): MovePair[] {
  const pairs: MovePair[] = [];
  const len = history.length;

  for (let i = 0; i < len; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = history[i];
    if (!whiteMove) break;
    const blackMove = i + 1 < len ? history[i + 1] : undefined;

    pairs.push({
      moveNumber,
      white: whiteMove,
      black: blackMove,
      whitePlyIndex: i,
      blackPlyIndex: blackMove ? i + 1 : undefined,
    });
  }

  return pairs;
}
