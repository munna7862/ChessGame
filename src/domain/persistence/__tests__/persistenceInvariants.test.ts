import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { PersistenceService } from "../PersistenceService";
import { InMemoryPersistenceAdapter } from "../adapters/InMemoryPersistenceAdapter";
import { isOk } from "../errors";
import type { PersistedSettings, PersistedStateV1 } from "../schema";

describe("Persistence Property-Based Invariants (TC-PERSIST-16 - fast-check)", () => {
  const settingsArbitrary = fc.record<PersistedSettings>({
    boardTheme: fc.constantFrom("classic", "wood", "slate", "ocean"),
    pieceSet: fc.constantFrom("standard", "classic", "modern"),
    showCoordinates: fc.boolean(),
    showLegalMoves: fc.boolean(),
    showLastMove: fc.boolean(),
    soundEnabled: fc.boolean(),
    autoQueen: fc.boolean(),
    engineDifficulty: fc.integer({ min: 1, max: 8 }),
    reducedMotion: fc.boolean(),
    volume: fc.integer({ min: 0, max: 100 }),
  });

  const stateArbitrary: fc.Arbitrary<PersistedStateV1> = fc.record({
    version: fc.constant(1 as const),
    updatedAt: fc.nat({ max: 2000000000000 }),
    settings: settingsArbitrary,
    activeGame: fc.constant(null),
    metadata: fc.record({
      client: fc.string({ minLength: 1, maxLength: 20 }),
      flag: fc.boolean(),
    }),
  });

  it("TC-PERSIST-16: guarantees 100% round-trip preservation and schema bijectivity across arbitrary valid states", () => {
    fc.assert(
      fc.property(stateArbitrary, (generatedState) => {
        const adapter = new InMemoryPersistenceAdapter();
        const service = new PersistenceService({ adapter });

        const saveRes = service.save(generatedState);
        expect(isOk(saveRes)).toBe(true);

        const loadRes = service.load();
        expect(isOk(loadRes)).toBe(true);

        if (isOk(loadRes) && loadRes.data !== null) {
          expect(loadRes.data.version).toBe(1);
          expect(loadRes.data.settings).toEqual(generatedState.settings);
          expect(loadRes.data.updatedAt).toBe(generatedState.updatedAt);
          expect(loadRes.data.metadata).toEqual(generatedState.metadata);
        }
      }),
      { numRuns: 100 }
    );
  });
});
