import { describe, it, expect } from "vitest";
import {
  DEFAULT_PERSISTED_SETTINGS,
  PersistedSettingsSchema,
  PartialPersistedSettingsSchema,
  BoardThemeSchema,
  PieceSetSchema,
} from "../schema";
import {
  sanitizeSettings,
  validatePartialSettings,
  validateSettings,
} from "../settings/settingsValidation";
import { isErr, isOk } from "../errors";

describe("Phase 08 · Sprint 05: Settings Schema & Validation (TC-SET-01 to TC-SET-07)", () => {
  it("TC-SET-01: parses empty input to exact deterministic defaults", () => {
    const parsed = PersistedSettingsSchema.parse({});
    expect(parsed).toEqual(DEFAULT_PERSISTED_SETTINGS);
    expect(parsed.boardTheme).toBe("classic");
    expect(parsed.pieceSet).toBe("standard");
    expect(parsed.showCoordinates).toBe(true);
    expect(parsed.showLegalMoves).toBe(true);
    expect(parsed.showLastMove).toBe(true);
    expect(parsed.soundEnabled).toBe(true);
    expect(parsed.autoQueen).toBe(false);
    expect(parsed.engineDifficulty).toBe(3);
    expect(parsed.reducedMotion).toBe(false);
    expect(parsed.volume).toBe(80);
  });

  it("TC-SET-02: validates a full valid custom settings object", () => {
    const custom = {
      boardTheme: "wood",
      pieceSet: "modern",
      showCoordinates: false,
      showLegalMoves: false,
      showLastMove: true,
      soundEnabled: false,
      autoQueen: true,
      engineDifficulty: 7,
      reducedMotion: true,
      volume: 45,
    };
    const result = validateSettings(custom);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual(custom);
    }
  });

  it("TC-SET-03: rejects invalid boardTheme and pieceSet enum values", () => {
    expect(BoardThemeSchema.safeParse("neon").success).toBe(false);
    expect(BoardThemeSchema.safeParse("").success).toBe(false);
    expect(PieceSetSchema.safeParse("gothic").success).toBe(false);

    const badThemeResult = validateSettings({
      ...DEFAULT_PERSISTED_SETTINGS,
      boardTheme: "invalid-theme",
    });
    expect(isErr(badThemeResult)).toBe(true);

    const badPieceResult = validateSettings({
      ...DEFAULT_PERSISTED_SETTINGS,
      pieceSet: "invalid-pieces",
    });
    expect(isErr(badPieceResult)).toBe(true);
  });

  it("TC-SET-04: rejects out-of-range engineDifficulty values (< 1 or > 8 or non-integer)", () => {
    expect(
      isErr(
        validateSettings({
          ...DEFAULT_PERSISTED_SETTINGS,
          engineDifficulty: 0,
        })
      )
    ).toBe(true);
    expect(
      isErr(
        validateSettings({
          ...DEFAULT_PERSISTED_SETTINGS,
          engineDifficulty: 9,
        })
      )
    ).toBe(true);
    expect(
      isErr(
        validateSettings({
          ...DEFAULT_PERSISTED_SETTINGS,
          engineDifficulty: 3.5,
        })
      )
    ).toBe(true);
  });

  it("TC-SET-05: rejects out-of-range volume values (< 0 or > 100)", () => {
    expect(
      isErr(
        validateSettings({
          ...DEFAULT_PERSISTED_SETTINGS,
          volume: -1,
        })
      )
    ).toBe(true);
    expect(
      isErr(
        validateSettings({
          ...DEFAULT_PERSISTED_SETTINGS,
          volume: 101,
        })
      )
    ).toBe(true);
  });

  it("TC-SET-06: validates partial settings patches accurately", () => {
    const validPatch = { volume: 20, autoQueen: true };
    const directSchemaResult =
      PartialPersistedSettingsSchema.safeParse(validPatch);
    expect(directSchemaResult.success).toBe(true);

    const patchResult = validatePartialSettings(validPatch);
    expect(isOk(patchResult)).toBe(true);
    if (isOk(patchResult)) {
      expect(patchResult.data).toEqual(validPatch);
    }

    // Negative tests for invalid patch types
    expect(isErr(validatePartialSettings(null))).toBe(true);
    expect(isErr(validatePartialSettings("string"))).toBe(true);
    expect(isErr(validatePartialSettings([1, 2, 3]))).toBe(true);
    expect(isErr(validatePartialSettings({ engineDifficulty: 10 }))).toBe(true);
  });

  it("TC-SET-07: sanitizeSettings repairs corrupt or partial inputs and restores defaults", () => {
    // Null / non-object fallback
    expect(sanitizeSettings(null)).toEqual(DEFAULT_PERSISTED_SETTINGS);
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_PERSISTED_SETTINGS);
    expect(sanitizeSettings("invalid-json")).toEqual(
      DEFAULT_PERSISTED_SETTINGS
    );
    expect(sanitizeSettings([])).toEqual(DEFAULT_PERSISTED_SETTINGS);

    // Partial input fills missing fields
    const partialRaw = { boardTheme: "slate", volume: 60 };
    const sanitized = sanitizeSettings(partialRaw);
    expect(sanitized.boardTheme).toBe("slate");
    expect(sanitized.volume).toBe(60);
    expect(sanitized.pieceSet).toBe("standard");
    expect(sanitized.showCoordinates).toBe(true);

    // Corrupted fields are individually replaced by defaults without dropping valid fields
    const corruptRaw = {
      boardTheme: "invalid-corrupted",
      volume: -999,
      engineDifficulty: 15,
      soundEnabled: false,
      showLastMove: false,
    };
    const repaired = sanitizeSettings(corruptRaw);
    expect(repaired.boardTheme).toBe("classic");
    expect(repaired.volume).toBe(80);
    expect(repaired.engineDifficulty).toBe(3);
    expect(repaired.soundEnabled).toBe(false);
    expect(repaired.showLastMove).toBe(false);
  });
});
