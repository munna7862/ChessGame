import { z } from "zod";
import type { EngineSearchOptions } from "./types";

/**
 * Valid discrete difficulty levels for the Stockfish engine (1 to 8).
 */
export const EngineDifficultyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
]);

export type EngineDifficultyLevel = z.infer<typeof EngineDifficultyLevelSchema>;

export type EngineDifficultyId =
  | "beginner"
  | "casual"
  | "intermediate"
  | "advanced"
  | "proficient"
  | "expert"
  | "master"
  | "grandmaster";

/**
 * Calibrated engine difficulty preset specification.
 */
export interface EngineDifficultyPreset {
  readonly level: EngineDifficultyLevel;
  readonly id: EngineDifficultyId;
  readonly label: string;
  readonly description: string;
  readonly skillLevel: number; // Stockfish Skill Level: 0..20
  readonly depth: number; // Search depth bound: 1..22
  readonly movetimeMs: number; // Search time bound: 300..5000ms
}

/**
 * Default difficulty level (Intermediate / Level 3).
 */
export const DEFAULT_DIFFICULTY_LEVEL: EngineDifficultyLevel = 3;

/**
 * Immutable discrete 8-level difficulty presets.
 * Bounded to prevent runaway CPU or memory usage.
 */
export const DIFFICULTY_PRESETS: readonly EngineDifficultyPreset[] = [
  Object.freeze({
    level: 1,
    id: "beginner",
    label: "Beginner",
    description: "Focuses on basic moves, highly prone to tactical errors",
    skillLevel: 0,
    depth: 1,
    movetimeMs: 300,
  }),
  Object.freeze({
    level: 2,
    id: "casual",
    label: "Casual",
    description: "Overlooks subtle threats and multi-ply combinations",
    skillLevel: 3,
    depth: 3,
    movetimeMs: 500,
  }),
  Object.freeze({
    level: 3,
    id: "intermediate",
    label: "Intermediate",
    description: "Solid basic tactics and piece coordination",
    skillLevel: 6,
    depth: 5,
    movetimeMs: 800,
  }),
  Object.freeze({
    level: 4,
    id: "advanced",
    label: "Advanced",
    description: "Consistent tactical calculation and sound development",
    skillLevel: 9,
    depth: 8,
    movetimeMs: 1200,
  }),
  Object.freeze({
    level: 5,
    id: "proficient",
    label: "Proficient",
    description: "Strong combinational vision and active piece play",
    skillLevel: 12,
    depth: 11,
    movetimeMs: 1800,
  }),
  Object.freeze({
    level: 6,
    id: "expert",
    label: "Expert",
    description: "Sharp tactical calculation and positional pressure",
    skillLevel: 15,
    depth: 14,
    movetimeMs: 2500,
  }),
  Object.freeze({
    level: 7,
    id: "master",
    label: "Master",
    description: "Near-flawless tactical calculation and endgame conversion",
    skillLevel: 18,
    depth: 18,
    movetimeMs: 3500,
  }),
  Object.freeze({
    level: 8,
    id: "grandmaster",
    label: "Grandmaster",
    description: "Full Stockfish strength with bounded desktop thinking limits",
    skillLevel: 20,
    depth: 22,
    movetimeMs: 5000,
  }),
];

/**
 * Pure deterministic mapping function from difficulty level (1..8) to its preset configuration.
 * Safely falls back to DEFAULT_DIFFICULTY_LEVEL for invalid inputs.
 */
export function getEngineDifficultyConfig(
  level: number
): EngineDifficultyPreset {
  const parsed = EngineDifficultyLevelSchema.safeParse(level);
  if (!parsed.success) {
    return DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY_LEVEL - 1]!;
  }
  return DIFFICULTY_PRESETS[parsed.data - 1]!;
}

/**
 * Builds EngineSearchOptions enforcing bounded search depth and movetime limits
 * based on the specified difficulty level.
 */
export function buildDifficultySearchOptions(
  level: number,
  fen: string,
  sessionId?: string
): EngineSearchOptions {
  const config = getEngineDifficultyConfig(level);
  return {
    fen,
    depth: config.depth,
    movetimeMs: config.movetimeMs,
    skillLevel: config.skillLevel,
    sessionId,
  };
}

/**
 * Local storage persistence key for engine difficulty.
 */
export const STORAGE_KEY_ENGINE_DIFFICULTY = "chessforge:engine_difficulty_v1";
