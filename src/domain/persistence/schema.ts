import { z } from "zod";

/**
 * Current authoritative persistence schema version.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Board visual themes supported by ChessForge.
 */
export const BoardThemeSchema = z.enum([
  "classic",
  "wood",
  "slate",
  "ocean",
  "emerald",
  "midnight",
]);
export type BoardTheme = z.infer<typeof BoardThemeSchema>;

/**
 * Piece visual sets supported by ChessForge.
 */
export const PieceSetSchema = z.enum(["standard", "classic", "modern"]);
export type PieceSet = z.infer<typeof PieceSetSchema>;

/**
 * Persisted application settings and preferences.
 */
export const PersistedSettingsSchema = z.object({
  boardTheme: BoardThemeSchema.default("classic"),
  pieceSet: PieceSetSchema.default("standard"),
  showCoordinates: z.boolean().default(true),
  showLegalMoves: z.boolean().default(true),
  showLastMove: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  autoQueen: z.boolean().default(false),
  engineDifficulty: z.number().int().min(1).max(8).default(3),
  reducedMotion: z.boolean().default(false),
  volume: z.number().min(0).max(100).default(80),
});
export type PersistedSettings = z.infer<typeof PersistedSettingsSchema>;

/**
 * Schema for validating partial settings updates.
 */
export const PartialPersistedSettingsSchema = PersistedSettingsSchema.partial();
export type PartialPersistedSettings = z.infer<
  typeof PartialPersistedSettingsSchema
>;

/**
 * Player configuration schema for saved active games.
 */
export const PersistedPlayerConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(32),
  color: z.enum(["w", "b"]),
  type: z.enum(["human", "engine"]),
  rating: z.number().optional(),
  difficulty: z.number().int().min(1).max(8).optional(),
});
export type PersistedPlayerConfig = z.infer<typeof PersistedPlayerConfigSchema>;

/**
 * Time control schema for clocks in saved games.
 */
export const PersistedTimeControlSchema = z.object({
  type: z.enum(["none", "bullet", "blitz", "rapid", "classical", "custom"]),
  initialMs: z.number().nonnegative(),
  incrementMs: z.number().nonnegative(),
  label: z.string().optional(),
});
export type PersistedTimeControl = z.infer<typeof PersistedTimeControlSchema>;

/**
 * Clock state balance snapshot for saved active games.
 */
export const PersistedClockStateSchema = z.object({
  whiteMs: z.number().nonnegative(),
  blackMs: z.number().nonnegative(),
  timeControl: PersistedTimeControlSchema,
});
export type PersistedClockState = z.infer<typeof PersistedClockStateSchema>;

/**
 * Active game session snapshot schema.
 */
export const PersistedActiveGameSchema = z.object({
  id: z.string(),
  mode: z.enum(["human_vs_human", "human_vs_engine"]),
  fen: z.string().min(1),
  moveHistorySan: z.array(z.string()),
  players: z.object({
    w: PersistedPlayerConfigSchema,
    b: PersistedPlayerConfigSchema,
  }),
  clock: PersistedClockStateSchema.optional(),
  userOrientation: z.enum(["w", "b"]),
  startedAt: z.number().nonnegative(),
  updatedAt: z.number().nonnegative(),
});
export type PersistedActiveGame = z.infer<typeof PersistedActiveGameSchema>;

/**
 * Root versioned state schema (Version 1).
 */
export const PersistedStateV1Schema = z.object({
  version: z.literal(1),
  updatedAt: z.number().nonnegative(),
  settings: PersistedSettingsSchema,
  activeGame: PersistedActiveGameSchema.nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type PersistedStateV1 = z.infer<typeof PersistedStateV1Schema>;

/**
 * Generic version header schema to inspect data version before parsing/migrating.
 */
export const VersionHeaderSchema = z.object({
  version: z.number().int().positive(),
});
export type VersionHeader = z.infer<typeof VersionHeaderSchema>;

/**
 * Default settings values.
 */
export const DEFAULT_PERSISTED_SETTINGS: Readonly<PersistedSettings> =
  Object.freeze({
    boardTheme: "classic",
    pieceSet: "standard",
    showCoordinates: true,
    showLegalMoves: true,
    showLastMove: true,
    soundEnabled: true,
    autoQueen: false,
    engineDifficulty: 3,
    reducedMotion: false,
    volume: 80,
  });

/**
 * Factory to create fresh default persisted state.
 */
export function createDefaultPersistedState(
  now: () => number = Date.now
): PersistedStateV1 {
  return {
    version: 1,
    updatedAt: now(),
    settings: { ...DEFAULT_PERSISTED_SETTINGS },
    activeGame: null,
    metadata: {},
  };
}
