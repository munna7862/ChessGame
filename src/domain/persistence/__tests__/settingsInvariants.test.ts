import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { SettingsService } from "../settings/SettingsService";
import { PersistenceService } from "../PersistenceService";
import { InMemoryPersistenceAdapter } from "../adapters/InMemoryPersistenceAdapter";
import {
  DEFAULT_PERSISTED_SETTINGS,
  type BoardTheme,
  type PieceSet,
  type PartialPersistedSettings,
} from "../schema";
import { isOk } from "../errors";

describe("Phase 08 · Sprint 05: Settings Property Invariants (TC-SET-18 - fast-check)", () => {
  const boardThemes: BoardTheme[] = ["classic", "wood", "slate", "ocean"];
  const pieceSets: PieceSet[] = ["standard", "classic", "modern"];

  const arbitraryValidPatch = fc.record(
    {
      boardTheme: fc.constantFrom(...boardThemes),
      pieceSet: fc.constantFrom(...pieceSets),
      showCoordinates: fc.boolean(),
      showLegalMoves: fc.boolean(),
      showLastMove: fc.boolean(),
      soundEnabled: fc.boolean(),
      autoQueen: fc.boolean(),
      engineDifficulty: fc.integer({ min: 1, max: 8 }),
      reducedMotion: fc.boolean(),
      volume: fc.integer({ min: 0, max: 100 }),
    },
    { requiredKeys: [] }
  ) as fc.Arbitrary<PartialPersistedSettings>;

  it("TC-SET-18: preserves schema validity, determinism, and persistence round-trip across randomized patches", () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryValidPatch, { minLength: 1, maxLength: 20 }),
        (patches) => {
          const adapter = new InMemoryPersistenceAdapter();
          const persistenceService = new PersistenceService({ adapter });
          const service = new SettingsService({ persistenceService });

          for (const patch of patches) {
            const res = service.updateSettings(patch);
            expect(isOk(res)).toBe(true);

            const current = service.getSettings();
            // Verify all bounds and invariants
            expect(boardThemes).toContain(current.boardTheme);
            expect(pieceSets).toContain(current.pieceSet);
            expect(typeof current.showCoordinates).toBe("boolean");
            expect(typeof current.showLegalMoves).toBe("boolean");
            expect(typeof current.showLastMove).toBe("boolean");
            expect(typeof current.soundEnabled).toBe("boolean");
            expect(typeof current.autoQueen).toBe("boolean");
            expect(current.engineDifficulty).toBeGreaterThanOrEqual(1);
            expect(current.engineDifficulty).toBeLessThanOrEqual(8);
            expect(Number.isInteger(current.engineDifficulty)).toBe(true);
            expect(typeof current.reducedMotion).toBe("boolean");
            expect(current.volume).toBeGreaterThanOrEqual(0);
            expect(current.volume).toBeLessThanOrEqual(100);

            // Verify persistence round-trip match
            const loadedFromDisk = persistenceService.loadWithFallback();
            expect(loadedFromDisk.settings).toEqual(current);
          }

          // Reset restores exact defaults
          const resetRes = service.resetSettings();
          expect(isOk(resetRes)).toBe(true);
          expect(service.getSettings()).toEqual(DEFAULT_PERSISTED_SETTINGS);
          expect(persistenceService.loadWithFallback().settings).toEqual(
            DEFAULT_PERSISTED_SETTINGS
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
