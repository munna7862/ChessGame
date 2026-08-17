import { z } from "zod";
import {
  type ChessDomainError,
  createDomainError,
  err,
  ok,
  type Result,
} from "./errors";
import { FEN_START_POSITION, validateFen } from "./fen";
import type { Move } from "./types";

/**
 * Standard PGN terminal result notation.
 */
export const PGN_RESULTS = ["1-0", "0-1", "1/2-1/2", "*"] as const;
export type PgnResult = (typeof PGN_RESULTS)[number];

export const PgnResultSchema = z.enum(PGN_RESULTS);

/**
 * Standard Seven Tag Roster (STR) keys.
 */
export const SEVEN_TAG_ROSTER_KEYS = [
  "Event",
  "Site",
  "Date",
  "Round",
  "White",
  "Black",
  "Result",
] as const;

export type SevenTagRosterKey = (typeof SEVEN_TAG_ROSTER_KEYS)[number];

/**
 * PGN tag pairs dictionary.
 */
export interface PgnTags {
  Event?: string | undefined;
  Site?: string | undefined;
  Date?: string | undefined;
  Round?: string | undefined;
  White?: string | undefined;
  Black?: string | undefined;
  Result?: PgnResult | string | undefined;
  SetUp?: string | undefined;
  FEN?: string | undefined;
  PlyCount?: string | undefined;
  Termination?: string | undefined;
  [key: string]: string | undefined;
}

export const PgnTagsSchema = z.record(z.string());

/**
 * Parsed PGN game representation.
 */
export interface PgnParsedGame {
  readonly tags: PgnTags;
  readonly moves: readonly string[];
  readonly result: PgnResult;
  readonly startingFen?: string | undefined;
}

/**
 * Validation result structure.
 */
export interface PgnValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

/**
 * Default Seven Tag Roster metadata values.
 */
export const DEFAULT_PGN_TAGS: Readonly<Record<SevenTagRosterKey, string>> = {
  Event: "Casual Game",
  Site: "ChessForge Desktop",
  Date: "????.??.??",
  Round: "1",
  White: "White",
  Black: "Black",
  Result: "*",
};

/**
 * Strips block comments `{ ... }`, rest-of-line comments `; ...`,
 * and parenthesized RAV variations `( ... )` from PGN move text.
 */
export function stripPgnCommentsAndVariations(text: string): string {
  // 1. Strip line comments starting with ;
  let cleaned = text.replace(/;[^\r\n]*/g, " ");

  // 2. Strip block comments { ... } (handling multi-line)
  cleaned = cleaned.replace(/\{[^}]*\}/g, " ");

  // 3. Strip recursive annotation variations (RAV) enclosed in parentheses (up to 3 nested levels)
  let prev = "";
  while (prev !== cleaned) {
    prev = cleaned;
    cleaned = cleaned.replace(/\([^()]*\)/g, " ");
  }

  return cleaned;
}

/**
 * Parses PGN header tag pairs `[TagName "TagValue"]`.
 */
export function parsePgnTags(pgn: string): {
  tags: PgnTags;
  remainingText: string;
} {
  const tags: PgnTags = {};
  const tagRegex =
    /^\s*\[\s*([A-Za-z0-9_]+)\s+"([^"\\]*(?:\\.[^"\\]*)*)"\s*\]/m;

  let currentText = pgn.trim();
  let match = tagRegex.exec(currentText);

  while (match) {
    const key = match[1];
    let val = match[2] ?? "";
    // Unescape quotes and backslashes
    val = val.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

    if (key) {
      tags[key] = val;
    }

    currentText = currentText.slice(match.index + match[0].length).trim();
    match = tagRegex.exec(currentText);
  }

  return { tags, remainingText: currentText };
}

/**
 * Parses move text into a sequential array of SAN move tokens and a terminal result.
 */
export function parsePgnMoveTokens(moveText: string): {
  moves: string[];
  result: PgnResult;
} {
  const cleaned = stripPgnCommentsAndVariations(moveText);

  // Tokenize by whitespace
  const rawTokens = cleaned.split(/\s+/).filter((t) => t.length > 0);
  const moves: string[] = [];
  let result: PgnResult = "*";

  for (let i = 0; i < rawTokens.length; i++) {
    let token = rawTokens[i]!;

    // Check if token is a game termination result
    if (
      token === "1-0" ||
      token === "0-1" ||
      token === "1/2-1/2" ||
      token === "*"
    ) {
      result = token;
      continue;
    }

    // Skip Numeric Annotation Glyphs ($1..$255)
    if (/^\$\d+$/.test(token)) {
      continue;
    }

    // Strip move number prefixes like "1.", "1...", "12.", "12..."
    token = token.replace(/^\d+\.+/, "");

    // If token became empty after stripping move number, skip
    if (!token) {
      continue;
    }

    // Check again if token became a result after move number strip
    if (
      token === "1-0" ||
      token === "0-1" ||
      token === "1/2-1/2" ||
      token === "*"
    ) {
      result = token;
      continue;
    }

    // Normalize numeric castling (0-0 -> O-O, 0-0-0 -> O-O-O)
    if (token === "0-0") {
      token = "O-O";
    } else if (token === "0-0-0") {
      token = "O-O-O";
    }

    // Strip trailing evaluation annotations attached to moves: !, ?, !?, ?!, !!, ??
    token = token.replace(/[!?]+$/, "");

    if (token.length > 0) {
      moves.push(token);
    }
  }

  return { moves, result };
}

/**
 * Authoritatively parses and validates a PGN string into structured tags, moves, and result.
 */
export function parsePgn(pgn: string): Result<PgnParsedGame, ChessDomainError> {
  if (typeof pgn !== "string" || pgn.trim() === "") {
    return err(
      createDomainError("INVALID_PGN", "PGN string cannot be empty.", {
        pgn,
      })
    );
  }

  try {
    const { tags, remainingText } = parsePgnTags(pgn);
    const { moves, result: parsedResult } = parsePgnMoveTokens(remainingText);

    // If tag has explicit valid result, prioritize or reconcile it
    let finalResult: PgnResult = parsedResult;
    if (
      tags.Result &&
      (tags.Result === "1-0" ||
        tags.Result === "0-1" ||
        tags.Result === "1/2-1/2" ||
        tags.Result === "*")
    ) {
      finalResult = tags.Result as PgnResult;
    }

    let startingFen: string | undefined = undefined;
    if (tags.SetUp === "1" || tags.SetUp === "true" || tags.FEN) {
      if (!tags.FEN) {
        return err(
          createDomainError(
            "INVALID_PGN",
            "PGN specifies SetUp '1' but is missing the FEN tag.",
            { tags }
          )
        );
      }
      const fenValidation = validateFen(tags.FEN);
      if (!fenValidation.isValid) {
        return err(
          createDomainError(
            "INVALID_FEN",
            `Invalid starting FEN in PGN header: ${fenValidation.error ?? "Malformed FEN."}`,
            { fen: tags.FEN, error: fenValidation.error }
          )
        );
      }
      startingFen = tags.FEN;
    }

    return ok({
      tags,
      moves,
      result: finalResult,
      startingFen,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to parse PGN.";
    return err(
      createDomainError("INVALID_PGN", `PGN parsing failed: ${message}`, {
        pgn,
        error: message,
      })
    );
  }
}

/**
 * Options for serializing a chess game to standard PGN text.
 */
export interface FormatPgnOptions {
  moves?: readonly (Move | string)[] | undefined;
  historySan?: readonly string[] | undefined;
  tags?: Partial<PgnTags> | undefined;
  result?: PgnResult | string | undefined;
  startingFen?: string | undefined;
}

/**
 * Formats a move history and tag pairs into standard PGN text.
 */
export function formatPgn(options: FormatPgnOptions = {}): string {
  const mergedTags: Record<string, string> = { ...DEFAULT_PGN_TAGS };

  // Apply custom tags
  if (options.tags) {
    for (const [key, val] of Object.entries(options.tags)) {
      if (val !== undefined && val !== null) {
        mergedTags[key] = String(val);
      }
    }
  }

  // Result handling
  const result: string = options.result ?? mergedTags.Result ?? "*";
  mergedTags.Result = result;

  // Custom starting position handling
  if (options.startingFen && options.startingFen !== FEN_START_POSITION) {
    mergedTags.SetUp = "1";
    mergedTags.FEN = options.startingFen;
  }

  // Generate Seven Tag Roster lines in canonical order
  const tagLines: string[] = [];
  const processedKeys = new Set<string>();

  for (const key of SEVEN_TAG_ROSTER_KEYS) {
    const val = mergedTags[key] ?? DEFAULT_PGN_TAGS[key];
    const escaped = val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    tagLines.push(`[${key} "${escaped}"]`);
    processedKeys.add(key);
  }

  // Append any additional tags (e.g. SetUp, FEN, PlyCount)
  for (const [key, val] of Object.entries(mergedTags)) {
    if (!processedKeys.has(key)) {
      const escaped = val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      tagLines.push(`[${key} "${escaped}"]`);
    }
  }

  // Extract move SAN strings
  const sanList: string[] = [];
  if (options.historySan) {
    sanList.push(...options.historySan);
  } else if (options.moves) {
    for (const m of options.moves) {
      if (typeof m === "string") {
        sanList.push(m);
      } else {
        sanList.push(m.san);
      }
    }
  }

  // Format move pairs with move numbers
  const moveTokens: string[] = [];
  for (let i = 0; i < sanList.length; i++) {
    const moveNumber = Math.floor(i / 2) + 1;
    if (i % 2 === 0) {
      moveTokens.push(`${moveNumber}. ${sanList[i]}`);
    } else {
      moveTokens.push(sanList[i]!);
    }
  }

  // Append terminal result
  moveTokens.push(result);

  const moveText = moveTokens.join(" ");

  return `${tagLines.join("\n")}\n\n${moveText}\n`;
}
