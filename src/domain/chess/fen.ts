import { z } from "zod";

/**
 * Standard FIDE starting position FEN string.
 */
export const FEN_START_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" as const;

/**
 * Result structure returned by FEN validation.
 */
export interface FenValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

/**
 * Validates a FEN string against syntactic and semantic FIDE chess invariants.
 *
 * Checks:
 * 1. Exactly 6 space-delimited tokens.
 * 2. Piece placement: exactly 8 ranks, valid piece letters and empty square counts summing to 8.
 * 3. Pawn placement: no pawns on 1st or 8th rank.
 * 4. King count: exactly 1 White King ('K') and 1 Black King ('k').
 * 5. Active color: strictly 'w' or 'b'.
 * 6. Castling rights: '-' or unique subset of { 'K', 'Q', 'k', 'q' }.
 * 7. En passant target: '-' or valid coordinate on rank 3 (if 'b' to move) or rank 6 (if 'w' to move).
 * 8. Halfmove clock: non-negative integer (>= 0).
 * 9. Fullmove number: positive integer (>= 1).
 */
export function validateFen(fen: string): FenValidationResult {
  if (typeof fen !== "string" || fen.trim() === "") {
    return { isValid: false, error: "FEN string cannot be empty." };
  }

  // 1. Strict 6 tokens separated by whitespace
  const tokens = fen.trim().split(/\s+/);
  if (tokens.length !== 6) {
    return {
      isValid: false,
      error: `Invalid FEN: must contain exactly 6 space-delimited fields, received ${tokens.length}.`,
    };
  }

  const piecePlacement = tokens[0]!;
  const activeColor = tokens[1]!;
  const castling = tokens[2]!;
  const enPassant = tokens[3]!;
  const halfmoveClockStr = tokens[4]!;
  const fullmoveNumberStr = tokens[5]!;

  // 2. Piece placement validation
  const ranks = piecePlacement.split("/");
  if (ranks.length !== 8) {
    return {
      isValid: false,
      error: `Invalid FEN: piece placement must contain exactly 8 ranks, received ${ranks.length}.`,
    };
  }

  for (let i = 0; i < 8; i++) {
    const rank = ranks[i];
    if (rank === undefined) {
      return {
        isValid: false,
        error: `Invalid FEN: rank ${8 - i} is missing.`,
      };
    }

    let rankSquares = 0;
    let prevWasDigit = false;

    for (let j = 0; j < rank.length; j++) {
      const char = rank[j]!;
      if (/^[1-8]$/.test(char)) {
        if (prevWasDigit) {
          return {
            isValid: false,
            error: `Invalid FEN: consecutive digits '${char}' in rank ${8 - i}.`,
          };
        }
        rankSquares += parseInt(char, 10);
        prevWasDigit = true;
      } else if (/^[pnbrqkPNBRQK]$/.test(char)) {
        rankSquares += 1;
        prevWasDigit = false;
      } else {
        return {
          isValid: false,
          error: `Invalid FEN: invalid piece character '${char}' in rank ${8 - i}.`,
        };
      }
    }

    if (rankSquares !== 8) {
      return {
        isValid: false,
        error: `Invalid FEN: rank ${8 - i} contains ${rankSquares} squares (must be exactly 8).`,
      };
    }
  }

  // 3. Pawn placement on 1st or 8th rank
  const rank8 = ranks[0]!;
  const rank1 = ranks[7]!;
  if (/p|P/.test(rank8)) {
    return {
      isValid: false,
      error: "Invalid FEN: pawns cannot exist on the 8th rank.",
    };
  }
  if (/p|P/.test(rank1)) {
    return {
      isValid: false,
      error: "Invalid FEN: pawns cannot exist on the 1st rank.",
    };
  }

  // 4. King count
  const whiteKings = (piecePlacement.match(/K/g) || []).length;
  const blackKings = (piecePlacement.match(/k/g) || []).length;
  if (whiteKings !== 1) {
    return {
      isValid: false,
      error: `Invalid FEN: board must contain exactly one White King ('K'), found ${whiteKings}.`,
    };
  }
  if (blackKings !== 1) {
    return {
      isValid: false,
      error: `Invalid FEN: board must contain exactly one Black King ('k'), found ${blackKings}.`,
    };
  }

  // 5. Active color
  if (activeColor !== "w" && activeColor !== "b") {
    return {
      isValid: false,
      error: `Invalid FEN: active color must be 'w' or 'b', received '${activeColor}'.`,
    };
  }

  // 6. Castling rights
  if (castling !== "-") {
    if (
      !/^[KQkq]+$/.test(castling) ||
      new Set(castling).size !== castling.length
    ) {
      return {
        isValid: false,
        error: `Invalid FEN: castling availability '${castling}' is invalid.`,
      };
    }
  }

  // 7. En passant target square
  if (enPassant !== "-") {
    if (!/^[a-h][36]$/.test(enPassant)) {
      return {
        isValid: false,
        error: `Invalid FEN: en passant square '${enPassant}' is invalid (must be '-' or [a-h]3 / [a-h]6).`,
      };
    }
    // En passant rank must match side to move
    if (activeColor === "w" && enPassant[1] !== "6") {
      return {
        isValid: false,
        error: `Invalid FEN: en passant square '${enPassant}' is illegal when White is to move (must be rank 6).`,
      };
    }
    if (activeColor === "b" && enPassant[1] !== "3") {
      return {
        isValid: false,
        error: `Invalid FEN: en passant square '${enPassant}' is illegal when Black is to move (must be rank 3).`,
      };
    }
  }

  // 8. Halfmove clock
  if (!/^\d+$/.test(halfmoveClockStr)) {
    return {
      isValid: false,
      error: `Invalid FEN: halfmove clock must be a non-negative integer, received '${halfmoveClockStr}'.`,
    };
  }
  const halfmoveClock = parseInt(halfmoveClockStr, 10);
  if (halfmoveClock < 0) {
    return {
      isValid: false,
      error: `Invalid FEN: halfmove clock must be >= 0, received ${halfmoveClock}.`,
    };
  }

  // 9. Fullmove number
  if (!/^[1-9]\d*$/.test(fullmoveNumberStr)) {
    return {
      isValid: false,
      error: `Invalid FEN: fullmove number must be a positive integer >= 1, received '${fullmoveNumberStr}'.`,
    };
  }

  return { isValid: true };
}

/**
 * Zod schema for runtime validation of FEN strings.
 */
export const FenStringSchema = z
  .string()
  .refine((val) => validateFen(val).isValid, {
    message: "Invalid FEN string.",
  });
