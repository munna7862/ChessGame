import type { ChessGame } from "./ports";

/**
 * Calculates the total number of legal leaf nodes at a given depth (Perft).
 *
 * Perft (Performance Test) is the standard verification technique for chess engines.
 * It traverses the tree of legal moves to depth D, executing and undoing each move,
 * verifying move generation correctness, king safety, castling, en passant, and promotions.
 *
 * @param game Active ChessGame instance.
 * @param depth Search depth (1-indexed). If depth <= 0, returns 1.
 * @returns Total number of legal leaf nodes.
 */
export function perft(game: ChessGame, depth: number): number {
  if (depth <= 0) {
    return 1;
  }

  const legalMoves = game.getLegalMoves();
  if (depth === 1) {
    return legalMoves.length;
  }

  let totalNodes = 0;

  for (let i = 0; i < legalMoves.length; i++) {
    const move = legalMoves[i]!;
    const moveResult = game.makeMove({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });

    if (moveResult.success) {
      totalNodes += perft(game, depth - 1);
      game.undo();
    }
  }

  return totalNodes;
}

/**
 * Calculates Perft node counts broken down by each root move (Divide).
 * Useful for diagnosing the exact branch where move generation discrepancies occur.
 *
 * @param game Active ChessGame instance.
 * @param depth Search depth (>= 1).
 * @returns Record mapping move UCI/SAN notation to subtree node count.
 */
export function perftDivide(
  game: ChessGame,
  depth: number
): Record<string, number> {
  const result: Record<string, number> = {};
  if (depth <= 0) {
    return result;
  }

  const legalMoves = game.getLegalMoves();

  for (let i = 0; i < legalMoves.length; i++) {
    const move = legalMoves[i]!;
    const moveLabel = `${move.from}${move.to}${move.promotion ? `=${move.promotion}` : ""}`;

    const moveResult = game.makeMove({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });

    if (moveResult.success) {
      const nodes = depth === 1 ? 1 : perft(game, depth - 1);
      result[moveLabel] = nodes;
      game.undo();
    }
  }

  return result;
}
