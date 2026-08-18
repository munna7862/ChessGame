import { describe, it, expect } from "vitest";
import {
  DIFFICULTY_PRESETS,
  DEFAULT_DIFFICULTY_LEVEL,
  EngineDifficultyLevelSchema,
  getEngineDifficultyConfig,
  buildDifficultySearchOptions,
  type EngineDifficultyPreset,
} from "../difficulty";

describe("Engine Difficulty and Thinking Policy (TC-DIFF-01 to TC-DIFF-05, TC-DIFF-08, TC-DIFF-10)", () => {
  it("TC-DIFF-01: defines exactly 8 sequential difficulty levels with valid properties", () => {
    expect(DIFFICULTY_PRESETS).toHaveLength(8);

    DIFFICULTY_PRESETS.forEach((preset, index) => {
      const expectedLevel = index + 1;
      expect(preset.level).toBe(expectedLevel);
      expect(typeof preset.id).toBe("string");
      expect(preset.id.length).toBeGreaterThan(0);
      expect(typeof preset.label).toBe("string");
      expect(preset.label.length).toBeGreaterThan(0);
      expect(typeof preset.description).toBe("string");
      expect(preset.description.length).toBeGreaterThan(0);

      // Validate level against schema
      expect(EngineDifficultyLevelSchema.safeParse(preset.level).success).toBe(
        true
      );
    });
  });

  it("TC-DIFF-02: getEngineDifficultyConfig is deterministic and returns identical frozen objects", () => {
    for (let level = 1; level <= 8; level++) {
      const config1 = getEngineDifficultyConfig(level);
      const config2 = getEngineDifficultyConfig(level);

      expect(config1).toBe(config2); // Strict reference equality
      expect(config1.level).toBe(level);
      expect(Object.isFrozen(config1)).toBe(true);
    }
  });

  it("TC-DIFF-03: enforces strict search bounds and desktop guardrails on all presets", () => {
    DIFFICULTY_PRESETS.forEach((preset: EngineDifficultyPreset) => {
      // Stockfish Skill Level must be within UCI range [0, 20]
      expect(preset.skillLevel).toBeGreaterThanOrEqual(0);
      expect(preset.skillLevel).toBeLessThanOrEqual(20);

      // Search Depth must be bounded [1, 22] to prevent runaway searches
      expect(preset.depth).toBeGreaterThanOrEqual(1);
      expect(preset.depth).toBeLessThanOrEqual(22);

      // Movetime must be bounded [300ms, 5000ms]
      expect(preset.movetimeMs).toBeGreaterThanOrEqual(300);
      expect(preset.movetimeMs).toBeLessThanOrEqual(5000);
    });

    // Verify progression: higher difficulty levels have monotonic non-decreasing skill, depth, and movetime
    for (let i = 1; i < DIFFICULTY_PRESETS.length; i++) {
      const prev = DIFFICULTY_PRESETS[i - 1]!;
      const curr = DIFFICULTY_PRESETS[i]!;

      expect(curr.skillLevel).toBeGreaterThanOrEqual(prev.skillLevel);
      expect(curr.depth).toBeGreaterThanOrEqual(prev.depth);
      expect(curr.movetimeMs).toBeGreaterThanOrEqual(prev.movetimeMs);
    }
  });

  it("TC-DIFF-04: handles invalid, out-of-range, and malformed inputs with safe fallback", () => {
    const defaultPreset = getEngineDifficultyConfig(DEFAULT_DIFFICULTY_LEVEL);

    // Negative, zero, out of range, NaN, non-integer
    expect(getEngineDifficultyConfig(0)).toEqual(defaultPreset);
    expect(getEngineDifficultyConfig(-1)).toEqual(defaultPreset);
    expect(getEngineDifficultyConfig(9)).toEqual(defaultPreset);
    expect(getEngineDifficultyConfig(99)).toEqual(defaultPreset);
    expect(getEngineDifficultyConfig(NaN)).toEqual(defaultPreset);
    expect(getEngineDifficultyConfig(3.5)).toEqual(defaultPreset);
  });

  it("TC-DIFF-05: verifies absence of uncalibrated numerical Elo ratings in preset metadata", () => {
    DIFFICULTY_PRESETS.forEach((preset) => {
      // Ensure no raw "Elo" or numerical rating claims exist in description or labels
      expect(preset.label).not.toMatch(/\bElo\b/i);
      expect(preset.label).not.toMatch(/\d{3,4}/); // No numbers in label
      expect(preset.description).not.toMatch(/\bElo\b/i);
      expect(preset.description).not.toMatch(/\b\d{3,4}\s*rating\b/i);
    });
  });

  it("TC-DIFF-08: buildDifficultySearchOptions constructs bounded search parameters", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const sessionId = "session-test-123";

    // Level 1: Beginner
    const optionsL1 = buildDifficultySearchOptions(1, fen, sessionId);
    expect(optionsL1).toEqual({
      fen,
      depth: 1,
      movetimeMs: 300,
      skillLevel: 0,
      sessionId,
    });

    // Level 8: Grandmaster
    const optionsL8 = buildDifficultySearchOptions(8, fen, sessionId);
    expect(optionsL8).toEqual({
      fen,
      depth: 22,
      movetimeMs: 5000,
      skillLevel: 20,
      sessionId,
    });

    // Invalid level defaults safely
    const optionsInvalid = buildDifficultySearchOptions(999, fen);
    expect(optionsInvalid.depth).toBe(5);
    expect(optionsInvalid.skillLevel).toBe(6);
    expect(optionsInvalid.movetimeMs).toBe(800);
  });
});
