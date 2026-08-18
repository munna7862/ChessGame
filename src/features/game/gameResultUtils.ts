import type { GameStatus } from "../../domain/chess/types";
import type { PlayerConfig } from "./types";

export interface DerivedResult {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly score: string;
  readonly outcomeType: "win" | "draw";
  readonly winnerColor: "w" | "b" | null;
}

export function deriveGameResult(
  status: GameStatus,
  players: { readonly w: PlayerConfig; readonly b: PlayerConfig }
): DerivedResult {
  const whiteName = players.w.name;
  const blackName = players.b.name;

  if (status.state === "checkmate") {
    const winnerName = status.winner === "w" ? whiteName : blackName;
    const loserName = status.winner === "w" ? blackName : whiteName;
    return {
      title: `${winnerName} Wins!`,
      subtitle: "by Checkmate",
      description: `${winnerName} delivered checkmate against ${loserName}.`,
      score: status.winner === "w" ? "1 - 0" : "0 - 1",
      outcomeType: "win",
      winnerColor: status.winner,
    };
  }

  if (status.state === "resigned") {
    const winnerName = status.winner === "w" ? whiteName : blackName;
    const loserName = status.winner === "w" ? blackName : whiteName;
    return {
      title: `${winnerName} Wins!`,
      subtitle: "by Resignation",
      description: `${loserName} resigned the game.`,
      score: status.winner === "w" ? "1 - 0" : "0 - 1",
      outcomeType: "win",
      winnerColor: status.winner,
    };
  }

  if (status.state === "timeout") {
    const winnerName = status.winner === "w" ? whiteName : blackName;
    const loserName = status.winner === "w" ? blackName : whiteName;
    return {
      title: `${winnerName} Wins!`,
      subtitle: "by Timeout",
      description: `${loserName} ran out of time.`,
      score: status.winner === "w" ? "1 - 0" : "0 - 1",
      outcomeType: "win",
      winnerColor: status.winner,
    };
  }

  if (
    status.inDraw ||
    status.state.startsWith("draw_") ||
    status.state === "stalemate"
  ) {
    if (status.drawReason === "stalemate" || status.state === "stalemate") {
      return {
        title: "Game Drawn",
        subtitle: "by Stalemate",
        description:
          "The player to move has no legal moves and is not in check.",
        score: "½ - ½",
        outcomeType: "draw",
        winnerColor: null,
      };
    }

    if (
      status.drawReason === "threefold_repetition" ||
      status.state === "draw_threefold_repetition"
    ) {
      return {
        title: "Game Drawn",
        subtitle: "by Threefold Repetition",
        description:
          "The same board position occurred three times during the game.",
        score: "½ - ½",
        outcomeType: "draw",
        winnerColor: null,
      };
    }

    if (
      status.drawReason === "fifty_moves" ||
      status.state === "draw_fifty_moves"
    ) {
      return {
        title: "Game Drawn",
        subtitle: "by 50-Move Rule",
        description:
          "50 consecutive moves were completed without a pawn advance or piece capture.",
        score: "½ - ½",
        outcomeType: "draw",
        winnerColor: null,
      };
    }

    if (
      status.drawReason === "insufficient_material" ||
      status.state === "draw_insufficient_material"
    ) {
      return {
        title: "Game Drawn",
        subtitle: "by Insufficient Material",
        description:
          "Neither player has sufficient material remaining to force checkmate.",
        score: "½ - ½",
        outcomeType: "draw",
        winnerColor: null,
      };
    }

    if (
      status.drawReason === "agreement" ||
      status.state === "draw_agreement"
    ) {
      return {
        title: "Game Drawn",
        subtitle: "by Mutual Agreement",
        description: "Both players agreed to conclude the game in a draw.",
        score: "½ - ½",
        outcomeType: "draw",
        winnerColor: null,
      };
    }

    return {
      title: "Game Drawn",
      subtitle: "Draw",
      description: status.description || "The game concluded in a draw.",
      score: "½ - ½",
      outcomeType: "draw",
      winnerColor: null,
    };
  }

  // Fallback for active/custom
  return {
    title: "Game Over",
    subtitle: status.state,
    description: status.description || "Game has concluded.",
    score: "*",
    outcomeType: "draw",
    winnerColor: null,
  };
}
