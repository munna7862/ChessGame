import {
  type Square,
  type FileSymbol,
  type RankSymbol,
  type Piece,
  type BoardMatrix,
  FILES,
  RANKS,
  isValidSquare,
  fileRankToSquare,
  squareToFileRank,
} from "../../domain/chess/types";
import type { BoardOrientation, SquareColor, BoardSquareData } from "./types";

/**
 * Determine the square color ('light' | 'dark') based on FIDE parity.
 *
 * In chess geometry, square color parity is determined by:
 * (fileIndex + rankIndex) % 2 === 0 -> dark square (e.g. a1 is dark: 0 + 0 = 0)
 * (fileIndex + rankIndex) % 2 === 1 -> light square (e.g. h1 is light: 7 + 0 = 7)
 */
export function getSquareColor(
  squareOrCoords: Square | { file: number; rank: number }
): SquareColor {
  const coords =
    typeof squareOrCoords === "string"
      ? squareToFileRank(squareOrCoords)
      : squareOrCoords;

  return (coords.file + coords.rank) % 2 === 0 ? "dark" : "light";
}

/**
 * Retrieve the Piece residing on a given Square from an 8x8 BoardMatrix.
 *
 * Matrix indices:
 * Row 0 = Rank 8, Row 7 = Rank 1 (matrixRow = 7 - rankIndex)
 * Col 0 = File a, Col 7 = File h (matrixCol = fileIndex)
 */
export function getPieceFromMatrix(
  square: Square,
  matrix: BoardMatrix
): Piece | null {
  const { file: fileIdx, rank: rankIdx } = squareToFileRank(square);
  const matrixRow = 7 - rankIdx;
  const matrixCol = fileIdx;

  if (
    matrixRow < 0 ||
    matrixRow >= matrix.length ||
    matrixCol < 0 ||
    matrixCol >= (matrix[matrixRow]?.length ?? 0)
  ) {
    return null;
  }

  return matrix[matrixRow]?.[matrixCol] ?? null;
}

/**
 * Given a DOM grid row (0-7, top-to-bottom) and column (0-7, left-to-right)
 * and an orientation ('w' or 'b'), return the corresponding chess algebraic Square.
 */
export function getSquareAtRowCol(
  row: number,
  col: number,
  orientation: BoardOrientation = "w"
): Square | null {
  if (row < 0 || row > 7 || col < 0 || col > 7) {
    return null;
  }

  const fileIdx = orientation === "w" ? col : 7 - col;
  const rankIdx = orientation === "w" ? 7 - row : row;

  return fileRankToSquare(fileIdx, rankIdx);
}

/**
 * Given a chess algebraic Square and an orientation ('w' or 'b'),
 * return the DOM grid row (0-7, top-to-bottom) and column (0-7, left-to-right).
 */
export function getRowColForSquare(
  square: Square,
  orientation: BoardOrientation = "w"
): { row: number; col: number } {
  const { file: fileIdx, rank: rankIdx } = squareToFileRank(square);

  const row = orientation === "w" ? 7 - rankIdx : rankIdx;
  const col = orientation === "w" ? fileIdx : 7 - fileIdx;

  return { row, col };
}

/**
 * Return ordered ranks for the given orientation from top to bottom.
 * White orientation: ['8', '7', '6', '5', '4', '3', '2', '1']
 * Black orientation: ['1', '2', '3', '4', '5', '6', '7', '8']
 */
export function getRanksForOrientation(
  orientation: BoardOrientation = "w"
): RankSymbol[] {
  return orientation === "w" ? [...RANKS].reverse() : [...RANKS];
}

/**
 * Return ordered files for the given orientation from left to right.
 * White orientation: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
 * Black orientation: ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
 */
export function getFilesForOrientation(
  orientation: BoardOrientation = "w"
): FileSymbol[] {
  return orientation === "w" ? [...FILES] : [...FILES].reverse();
}

/**
 * Generate full metadata for all 64 squares in DOM grid order (row 0..7, col 0..7)
 * according to the active board orientation, optionally resolving occupant pieces.
 */
export function getGridSquares(
  orientation: BoardOrientation = "w",
  pieceResolver?: ((square: Square) => Piece | null | undefined) | null
): BoardSquareData[] {
  const squares: BoardSquareData[] = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = getSquareAtRowCol(row, col, orientation);
      if (!square || !isValidSquare(square)) {
        throw new Error(
          `Failed to compute valid square at row=${row}, col=${col}, orientation=${orientation}`
        );
      }

      const { file: fileIndex, rank: rankIndex } = squareToFileRank(square);
      const file = square[0] as FileSymbol;
      const rank = square[1] as RankSymbol;
      const color = getSquareColor({ file: fileIndex, rank: rankIndex });
      const piece = pieceResolver ? pieceResolver(square) : undefined;

      squares.push({
        square,
        file,
        rank,
        fileIndex,
        rankIndex,
        row,
        col,
        color,
        piece: piece ?? undefined,
      });
    }
  }

  return squares;
}
