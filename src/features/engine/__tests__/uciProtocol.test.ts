import { describe, it, expect } from "vitest";
import {
  formatUci,
  formatIsReady,
  formatUciNewGame,
  formatSetOption,
  formatPosition,
  formatGo,
  formatStop,
  formatQuit,
  parseUciLine,
} from "../uciProtocol";

describe("UCI Protocol Command Formatting (TC-SF-01)", () => {
  it("formats basic UCI handshake commands", () => {
    expect(formatUci()).toBe("uci\n");
    expect(formatIsReady()).toBe("isready\n");
    expect(formatUciNewGame()).toBe("ucinewgame\n");
    expect(formatStop()).toBe("stop\n");
    expect(formatQuit()).toBe("quit\n");
  });

  it("formats option configuration commands", () => {
    expect(formatSetOption("Threads", 1)).toBe(
      "setoption name Threads value 1\n"
    );
    expect(formatSetOption("Hash", 32)).toBe("setoption name Hash value 32\n");
    expect(formatSetOption("Skill Level", 15)).toBe(
      "setoption name Skill Level value 15\n"
    );
    expect(formatSetOption("Ponder", false)).toBe(
      "setoption name Ponder value false\n"
    );
  });

  it("formats position command with and without move sequence", () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(formatPosition(startFen)).toBe(`position fen ${startFen}\n`);

    const moves = ["e2e4", "e7e5", "g1f3"];
    expect(formatPosition(startFen, moves)).toBe(
      `position fen ${startFen} moves e2e4 e7e5 g1f3\n`
    );
  });

  it("formats search go commands with various limits", () => {
    expect(formatGo()).toBe("go depth 12\n");
    expect(formatGo({ depth: 16 })).toBe("go depth 16\n");
    expect(formatGo({ movetimeMs: 2500 })).toBe("go movetime 2500\n");
    expect(formatGo({ nodes: 100000 })).toBe("go nodes 100000\n");
    expect(formatGo({ infinite: true })).toBe("go infinite\n");
    // movetime takes precedence over depth
    expect(formatGo({ movetimeMs: 1000, depth: 15 })).toBe(
      "go movetime 1000\n"
    );
  });
});

describe("UCI Output Parser (TC-SF-02 to TC-SF-05)", () => {
  it("parses handshake confirmation lines (TC-SF-02)", () => {
    expect(parseUciLine("uciok")).toEqual({ type: "UCIOK" });
    expect(parseUciLine("readyok")).toEqual({ type: "READYOK" });
    expect(parseUciLine("  readyok  ")).toEqual({ type: "READYOK" });
  });

  it("parses complex search evaluation info lines with centipawns (TC-SF-03)", () => {
    const line =
      "info depth 8 seldepth 12 score cp 35 nodes 1520 nps 120000 time 12 pv e2e4 e7e5 g1f3";
    const result = parseUciLine(line);

    expect(result).toEqual({
      type: "INFO",
      depth: 8,
      seldepth: 12,
      scoreCp: 35,
      nodes: 1520,
      nps: 120000,
      timeMs: 12,
      pv: ["e2e4", "e7e5", "g1f3"],
      raw: line,
    });
  });

  it("parses positive and negative mate scores in info lines (TC-SF-03)", () => {
    const whiteMateLine =
      "info depth 14 score mate 3 nodes 8400 time 50 pv f7f8q g8f8 d1d8";
    const whiteResult = parseUciLine(whiteMateLine);

    expect(whiteResult).toEqual({
      type: "INFO",
      depth: 14,
      mate: 3,
      nodes: 8400,
      timeMs: 50,
      pv: ["f7f8q", "g8f8", "d1d8"],
      raw: whiteMateLine,
    });

    const blackMateLine =
      "info depth 10 score mate -2 nodes 3200 pv d8d1 c1d1 e8e1";
    const blackResult = parseUciLine(blackMateLine);

    expect(blackResult).toEqual({
      type: "INFO",
      depth: 10,
      mate: -2,
      nodes: 3200,
      pv: ["d8d1", "c1d1", "e8e1"],
      raw: blackMateLine,
    });
  });

  it("parses bestmove with and without ponder moves (TC-SF-04)", () => {
    expect(parseUciLine("bestmove e2e4 ponder e7e5")).toEqual({
      type: "BEST_MOVE",
      uciMove: "e2e4",
      ponderMove: "e7e5",
    });

    expect(parseUciLine("bestmove e7e8q ponder d7d5")).toEqual({
      type: "BEST_MOVE",
      uciMove: "e7e8q",
      ponderMove: "d7d5",
    });

    expect(parseUciLine("bestmove g1f3")).toEqual({
      type: "BEST_MOVE",
      uciMove: "g1f3",
    });

    expect(parseUciLine("bestmove (none)")).toEqual({
      type: "BEST_MOVE",
      uciMove: "(none)",
    });
  });

  it("safely handles informational, configuration and empty lines (TC-SF-05)", () => {
    expect(parseUciLine("")).toBeNull();
    expect(parseUciLine("   ")).toBeNull();

    expect(parseUciLine("Stockfish 10 64 by Tord Romstad")).toEqual({
      type: "IGNORED",
      raw: "Stockfish 10 64 by Tord Romstad",
    });

    expect(parseUciLine("id name Stockfish 10")).toEqual({
      type: "IGNORED",
      raw: "id name Stockfish 10",
    });

    expect(parseUciLine("id author the Stockfish developers")).toEqual({
      type: "IGNORED",
      raw: "id author the Stockfish developers",
    });

    expect(
      parseUciLine("option name Threads type spin default 1 min 1 max 128")
    ).toEqual({
      type: "IGNORED",
      raw: "option name Threads type spin default 1 min 1 max 128",
    });
  });
});
