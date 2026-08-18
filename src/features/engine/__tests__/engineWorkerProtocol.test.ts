import { describe, it, expect } from "vitest";
import {
  EngineWorkerRequestSchema,
  EngineWorkerResponseSchema,
} from "../types";

describe("EngineWorkerRequestSchema", () => {
  it("parses valid INIT request with config", () => {
    const payload = {
      type: "INIT",
      config: {
        threads: 2,
        hashSizeMb: 32,
        skillLevel: 15,
        multiPv: 1,
      },
    };
    const parsed = EngineWorkerRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe("INIT");
    }
  });

  it("parses valid INIT request without config", () => {
    const payload = { type: "INIT" };
    const parsed = EngineWorkerRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("parses valid SET_OPTION requests", () => {
    const requests = [
      { type: "SET_OPTION", name: "Threads", value: 4 },
      { type: "SET_OPTION", name: "Hash", value: 64 },
      { type: "SET_OPTION", name: "Ponder", value: true },
      { type: "SET_OPTION", name: "UCI_Chess960", value: "false" },
    ];

    for (const req of requests) {
      const parsed = EngineWorkerRequestSchema.safeParse(req);
      expect(parsed.success).toBe(true);
    }
  });

  it("parses valid NEW_GAME request", () => {
    const parsed = EngineWorkerRequestSchema.safeParse({ type: "NEW_GAME" });
    expect(parsed.success).toBe(true);
  });

  it("parses valid SEARCH request", () => {
    const payload = {
      type: "SEARCH",
      request: {
        searchToken: "tok-12345",
        sessionId: "sess-999",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        depth: 15,
        movetimeMs: 2500,
        skillLevel: 12,
      },
    };
    const parsed = EngineWorkerRequestSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("parses valid STOP and TERMINATE requests", () => {
    expect(EngineWorkerRequestSchema.safeParse({ type: "STOP" }).success).toBe(
      true
    );
    expect(
      EngineWorkerRequestSchema.safeParse({ type: "TERMINATE" }).success
    ).toBe(true);
  });

  it("rejects malformed requests", () => {
    const invalidPayloads = [
      { type: "UNKNOWN" },
      { type: "SEARCH", request: {} }, // missing required fields
      { type: "SEARCH", request: { searchToken: "", fen: "" } }, // empty strings
      { type: "SET_OPTION", name: "" }, // missing value
      { type: "INIT", config: { threads: -1 } }, // invalid threads
    ];

    for (const payload of invalidPayloads) {
      const parsed = EngineWorkerRequestSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    }
  });
});

describe("EngineWorkerResponseSchema", () => {
  it("parses valid READY response", () => {
    const parsed = EngineWorkerResponseSchema.safeParse({
      type: "READY",
      engineName: "Stockfish 16.1 WASM",
    });
    expect(parsed.success).toBe(true);
  });

  it("parses valid SEARCH_INFO response with all metrics", () => {
    const payload = {
      type: "SEARCH_INFO",
      searchToken: "tok-100",
      depth: 14,
      scoreCp: 45,
      nodes: 250000,
      nps: 1200000,
      timeMs: 208,
      pv: ["e2e4", "e7e5", "g1f3", "b8c6"],
    };
    const parsed = EngineWorkerResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.type === "SEARCH_INFO") {
      expect(parsed.data.scoreCp).toBe(45);
      expect(parsed.data.pv).toHaveLength(4);
    }
  });

  it("parses valid SEARCH_INFO response with mate score", () => {
    const payload = {
      type: "SEARCH_INFO",
      searchToken: "tok-100",
      depth: 8,
      mate: 3,
      pv: ["d1h5", "g7g6", "h5e5"],
    };
    const parsed = EngineWorkerResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.type === "SEARCH_INFO") {
      expect(parsed.data.mate).toBe(3);
    }
  });

  it("parses valid BEST_MOVE response with and without ponder", () => {
    const res1 = EngineWorkerResponseSchema.safeParse({
      type: "BEST_MOVE",
      searchToken: "tok-100",
      uciMove: "e2e4",
      ponderMove: "e7e5",
    });
    expect(res1.success).toBe(true);

    const res2 = EngineWorkerResponseSchema.safeParse({
      type: "BEST_MOVE",
      searchToken: "tok-100",
      uciMove: "e7e8q", // promotion move
    });
    expect(res2.success).toBe(true);
  });

  it("parses valid STOPPED and ERROR responses", () => {
    const stopped = EngineWorkerResponseSchema.safeParse({
      type: "STOPPED",
      searchToken: "tok-100",
    });
    expect(stopped.success).toBe(true);

    const error = EngineWorkerResponseSchema.safeParse({
      type: "ERROR",
      message: "Out of memory",
      fatal: true,
    });
    expect(error.success).toBe(true);
  });

  it("rejects malformed responses", () => {
    const invalid = [
      { type: "READY_INVALID" },
      { type: "BEST_MOVE", searchToken: "tok" }, // missing uciMove
      { type: "BEST_MOVE", searchToken: "tok", uciMove: "e2" }, // move string too short
      { type: "SEARCH_INFO", searchToken: "tok", depth: -1 }, // negative depth
      { type: "ERROR" }, // missing message
    ];

    for (const payload of invalid) {
      expect(EngineWorkerResponseSchema.safeParse(payload).success).toBe(false);
    }
  });
});
