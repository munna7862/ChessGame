/**
 * Universal Chess Interface (UCI) protocol serializer and parser.
 * Encapsulates all raw string formatting and regex parsing for Stockfish.
 */

// ---------------------------------------------------------------------------
// UCI Command Formatting (Application -> Engine)
// ---------------------------------------------------------------------------

export function formatUci(): string {
  return "uci\n";
}

export function formatIsReady(): string {
  return "isready\n";
}

export function formatUciNewGame(): string {
  return "ucinewgame\n";
}

export function formatSetOption(
  name: string,
  value: string | number | boolean
): string {
  return `setoption name ${name} value ${value}\n`;
}

export function formatPosition(fen: string, moves?: readonly string[]): string {
  if (moves && moves.length > 0) {
    return `position fen ${fen} moves ${moves.join(" ")}\n`;
  }
  return `position fen ${fen}\n`;
}

export interface GoOptions {
  depth?: number;
  movetimeMs?: number;
  nodes?: number;
  infinite?: boolean;
}

export function formatGo(options?: GoOptions): string {
  if (!options) {
    return "go depth 12\n";
  }

  if (options.movetimeMs !== undefined && options.movetimeMs > 0) {
    return `go movetime ${options.movetimeMs}\n`;
  }

  if (options.depth !== undefined && options.depth > 0) {
    return `go depth ${options.depth}\n`;
  }

  if (options.nodes !== undefined && options.nodes > 0) {
    return `go nodes ${options.nodes}\n`;
  }

  if (options.infinite) {
    return "go infinite\n";
  }

  return "go depth 12\n";
}

export function formatStop(): string {
  return "stop\n";
}

export function formatQuit(): string {
  return "quit\n";
}

// ---------------------------------------------------------------------------
// UCI Output Parsing (Engine -> Application)
// ---------------------------------------------------------------------------

export interface UciOkMessage {
  type: "UCIOK";
}

export interface ReadyOkMessage {
  type: "READYOK";
}

export interface UciInfoMessage {
  type: "INFO";
  depth?: number;
  seldepth?: number;
  scoreCp?: number;
  mate?: number;
  nodes?: number;
  nps?: number;
  timeMs?: number;
  pv?: string[];
  raw: string;
}

export interface UciBestMoveMessage {
  type: "BEST_MOVE";
  uciMove: string;
  ponderMove?: string;
}

export interface UciIgnoredMessage {
  type: "IGNORED";
  raw: string;
}

export type ParsedUciMessage =
  | UciOkMessage
  | ReadyOkMessage
  | UciInfoMessage
  | UciBestMoveMessage
  | UciIgnoredMessage;

/**
 * Parses a single line of UCI output from Stockfish.
 * Returns a typed ParsedUciMessage or null if line is empty.
 */
export function parseUciLine(rawLine: string): ParsedUciMessage | null {
  const line = rawLine.trim();
  if (!line) {
    return null;
  }

  if (line === "uciok") {
    return { type: "UCIOK" };
  }

  if (line === "readyok") {
    return { type: "READYOK" };
  }

  if (line.startsWith("bestmove")) {
    return parseBestMoveLine(line);
  }

  if (line.startsWith("info")) {
    return parseInfoLine(line);
  }

  return { type: "IGNORED", raw: line };
}

function parseBestMoveLine(line: string): UciBestMoveMessage {
  const tokens = line.split(/\s+/);
  const uciMove = tokens[1] ?? "(none)";
  let ponderMove: string | undefined;

  const ponderIdx = tokens.indexOf("ponder");
  if (ponderIdx !== -1 && tokens.length > ponderIdx + 1) {
    ponderMove = tokens[ponderIdx + 1];
  }

  return {
    type: "BEST_MOVE",
    uciMove,
    ...(ponderMove ? { ponderMove } : {}),
  };
}

function parseInfoLine(line: string): UciInfoMessage {
  const tokens = line.split(/\s+/);
  const result: UciInfoMessage = {
    type: "INFO",
    raw: line,
  };

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === "depth" && i + 1 < tokens.length) {
      const valStr = tokens[++i];
      if (valStr !== undefined) {
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) result.depth = val;
      }
    } else if (token === "seldepth" && i + 1 < tokens.length) {
      const valStr = tokens[++i];
      if (valStr !== undefined) {
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) result.seldepth = val;
      }
    } else if (token === "score" && i + 2 < tokens.length) {
      const scoreType = tokens[++i];
      const scoreValStr = tokens[++i];
      if (scoreType !== undefined && scoreValStr !== undefined) {
        const scoreVal = parseInt(scoreValStr, 10);
        if (scoreType === "cp" && !isNaN(scoreVal)) {
          result.scoreCp = scoreVal;
        } else if (scoreType === "mate" && !isNaN(scoreVal)) {
          result.mate = scoreVal;
        }
      }
    } else if (token === "nodes" && i + 1 < tokens.length) {
      const valStr = tokens[++i];
      if (valStr !== undefined) {
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) result.nodes = val;
      }
    } else if (token === "nps" && i + 1 < tokens.length) {
      const valStr = tokens[++i];
      if (valStr !== undefined) {
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) result.nps = val;
      }
    } else if (token === "time" && i + 1 < tokens.length) {
      const valStr = tokens[++i];
      if (valStr !== undefined) {
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) result.timeMs = val;
      }
    } else if (token === "pv" && i + 1 < tokens.length) {
      // All subsequent tokens form the principal variation move sequence
      result.pv = tokens.slice(i + 1);
      break;
    }
  }

  return result;
}
