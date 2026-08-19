import {
  createPersistenceError,
  err,
  ok,
  type PersistenceError,
  type Result,
} from "../errors";
import {
  BoardThemeSchema,
  DEFAULT_PERSISTED_SETTINGS,
  PartialPersistedSettingsSchema,
  PersistedSettingsSchema,
  PieceSetSchema,
  type PartialPersistedSettings,
  type PersistedSettings,
} from "../schema";

/**
 * Validates a full settings object against PersistedSettingsSchema.
 */
export function validateSettings(
  settings: unknown
): Result<PersistedSettings, PersistenceError> {
  const parsed = PersistedSettingsSchema.safeParse(settings);
  if (!parsed.success) {
    return err(
      createPersistenceError(
        "VALIDATION_FAILED",
        "Settings validation failed",
        { errors: parsed.error.format() }
      )
    );
  }
  return ok(parsed.data);
}

/**
 * Validates a partial settings patch against PartialPersistedSettingsSchema.
 */
export function validatePartialSettings(
  patch: unknown
): Result<PartialPersistedSettings, PersistenceError> {
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
    return err(
      createPersistenceError(
        "VALIDATION_FAILED",
        "Partial settings patch must be a non-null object",
        { received: typeof patch }
      )
    );
  }

  const parsed = PartialPersistedSettingsSchema.safeParse(patch);
  if (!parsed.success) {
    return err(
      createPersistenceError(
        "VALIDATION_FAILED",
        "Invalid settings patch values",
        { errors: parsed.error.format() }
      )
    );
  }

  return ok(parsed.data);
}

/**
 * Sanitizes and repairs a raw settings object by validating individual fields
 * and falling back to default values for any invalid, corrupted, or missing keys.
 * Implemented with 100% strict type safety and zero `any`.
 */
export function sanitizeSettings(raw: unknown): PersistedSettings {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ...DEFAULT_PERSISTED_SETTINGS };
  }

  const record = raw as Record<string, unknown>;
  const defaults = DEFAULT_PERSISTED_SETTINGS;

  const boardThemeParsed = BoardThemeSchema.safeParse(record.boardTheme);
  const boardTheme = boardThemeParsed.success
    ? boardThemeParsed.data
    : defaults.boardTheme;

  const pieceSetParsed = PieceSetSchema.safeParse(record.pieceSet);
  const pieceSet = pieceSetParsed.success
    ? pieceSetParsed.data
    : defaults.pieceSet;

  const showCoordinatesParsed =
    PersistedSettingsSchema.shape.showCoordinates.safeParse(
      record.showCoordinates
    );
  const showCoordinates = showCoordinatesParsed.success
    ? showCoordinatesParsed.data
    : defaults.showCoordinates;

  const showLegalMovesParsed =
    PersistedSettingsSchema.shape.showLegalMoves.safeParse(
      record.showLegalMoves
    );
  const showLegalMoves = showLegalMovesParsed.success
    ? showLegalMovesParsed.data
    : defaults.showLegalMoves;

  const showLastMoveParsed =
    PersistedSettingsSchema.shape.showLastMove.safeParse(record.showLastMove);
  const showLastMove = showLastMoveParsed.success
    ? showLastMoveParsed.data
    : defaults.showLastMove;

  const soundEnabledParsed =
    PersistedSettingsSchema.shape.soundEnabled.safeParse(record.soundEnabled);
  const soundEnabled = soundEnabledParsed.success
    ? soundEnabledParsed.data
    : defaults.soundEnabled;

  const autoQueenParsed = PersistedSettingsSchema.shape.autoQueen.safeParse(
    record.autoQueen
  );
  const autoQueen = autoQueenParsed.success
    ? autoQueenParsed.data
    : defaults.autoQueen;

  const engineDifficultyParsed =
    PersistedSettingsSchema.shape.engineDifficulty.safeParse(
      record.engineDifficulty
    );
  const engineDifficulty = engineDifficultyParsed.success
    ? engineDifficultyParsed.data
    : defaults.engineDifficulty;

  const reducedMotionParsed =
    PersistedSettingsSchema.shape.reducedMotion.safeParse(record.reducedMotion);
  const reducedMotion = reducedMotionParsed.success
    ? reducedMotionParsed.data
    : defaults.reducedMotion;

  const volumeParsed = PersistedSettingsSchema.shape.volume.safeParse(
    record.volume
  );
  const volume = volumeParsed.success ? volumeParsed.data : defaults.volume;

  return {
    boardTheme,
    pieceSet,
    showCoordinates,
    showLegalMoves,
    showLastMove,
    soundEnabled,
    autoQueen,
    engineDifficulty,
    reducedMotion,
    volume,
  };
}
