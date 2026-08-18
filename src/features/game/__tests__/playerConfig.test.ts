import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  PlayerConfigSchema,
  resolveNewGameSession,
  type NewGameConfigOptions,
} from "../types";
import { createGameSession } from "../GameSessionController";

describe("Player Configuration & Schema Validation (TC-NG-08, TC-NG-09, TC-NG-16)", () => {
  it("validates player config schema with valid inputs", () => {
    const valid = {
      id: "player-1",
      name: "Grandmaster",
      color: "w",
      type: "human",
      rating: 2700,
    };

    const parsed = PlayerConfigSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid player configs (missing name or illegal color)", () => {
    expect(
      PlayerConfigSchema.safeParse({
        id: "p1",
        name: "",
        color: "w",
        type: "human",
      }).success
    ).toBe(false);

    expect(
      PlayerConfigSchema.safeParse({
        id: "p1",
        name: "Valid",
        color: "x",
        type: "human",
      }).success
    ).toBe(false);
  });

  it("resolves random color assignment deterministically via resolver hook", () => {
    const options: NewGameConfigOptions = {
      mode: "human_vs_human",
      player1Name: "Alice",
      player2Name: "Bob",
      player1Color: "random",
    };

    // Resolver returns >= 0.5 -> White
    const whiteRes = resolveNewGameSession(options, () => 0.75);
    expect(whiteRes.userOrientation).toBe("w");
    expect(whiteRes.config.players?.w.name).toBe("Alice");
    expect(whiteRes.config.players?.b.name).toBe("Bob");

    // Resolver returns < 0.5 -> Black
    const blackRes = resolveNewGameSession(options, () => 0.25);
    expect(blackRes.userOrientation).toBe("b");
    expect(blackRes.config.players?.b.name).toBe("Alice");
    expect(blackRes.config.players?.w.name).toBe("Bob");
  });

  it("TC-NG-16: Property-based fuzzing of player config resolution & GameSession initialization (fast-check)", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 40 }),
        fc.string({ minLength: 0, maxLength: 40 }),
        fc.constantFrom<"w" | "b" | "random">("w", "b", "random"),
        fc.constantFrom<"human_vs_human" | "human_vs_engine">(
          "human_vs_human",
          "human_vs_engine"
        ),
        fc.float({ min: 0, max: 1, noNaN: true }),
        (p1, p2, color, mode, seed) => {
          const options: NewGameConfigOptions = {
            mode,
            player1Name: p1,
            player2Name: p2,
            player1Color: color,
          };

          const resolved = resolveNewGameSession(options, () => seed);

          // Invariant 1: exactly one white and one black player
          expect(resolved.config.players?.w.color).toBe("w");
          expect(resolved.config.players?.b.color).toBe("b");

          // Invariant 2: names non-empty strings
          expect(resolved.config.players?.w.name.length).toBeGreaterThan(0);
          expect(resolved.config.players?.b.name.length).toBeGreaterThan(0);

          // Invariant 3: GameSession creates cleanly with resolved config
          const session = createGameSession(resolved.config);
          const state = session.getState();

          expect(state.mode).toBe(mode);
          expect(state.players.w.name).toBe(resolved.config.players?.w.name);
          expect(state.players.b.name).toBe(resolved.config.players?.b.name);
          expect(state.turn).toBe("w");
          expect(state.moveHistory).toHaveLength(0);
          expect(state.isGameOver).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
