import { describe, it, expect } from "vitest";
import { MigrationEngine } from "../migration";
import { isErr, isOk } from "../errors";

describe("Persistence Migration Engine (TC-PERSIST-12 to TC-PERSIST-15)", () => {
  it("rejects non-sequential migration step registration", () => {
    const engine = new MigrationEngine();

    expect(() => {
      engine.registerMigration({
        fromVersion: 1,
        toVersion: 3, // Skipped v2
        migrate: (d) => d,
      });
    }).toThrow(/must be sequential/);
  });

  it("handles identical version without running migrations", () => {
    const engine = new MigrationEngine();
    const data = { version: 1, name: "ChessForge" };

    const result = engine.migrate(data, 1);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual(data);
    }
  });

  it("performs single-step migration (v1 -> v2) successfully (TC-PERSIST-12)", () => {
    const engine = new MigrationEngine();
    engine.registerMigration({
      fromVersion: 1,
      toVersion: 2,
      migrate: (data) => {
        return {
          ...data,
          theme: "slate",
        };
      },
    });

    const legacyData = { version: 1, volume: 80 };
    const result = engine.migrate(legacyData, 2);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.version).toBe(2);
      expect(result.data.theme).toBe("slate");
      expect(result.data.volume).toBe(80);
    }
  });

  it("performs multi-step sequential migration (v1 -> v2 -> v3) in order (TC-PERSIST-13)", () => {
    const engine = new MigrationEngine();
    const order: number[] = [];

    engine.registerMigration({
      fromVersion: 1,
      toVersion: 2,
      migrate: (data) => {
        order.push(1);
        return {
          ...data,
          stepOneApplied: true,
        };
      },
    });

    engine.registerMigration({
      fromVersion: 2,
      toVersion: 3,
      migrate: (data) => {
        order.push(2);
        return {
          ...data,
          stepTwoApplied: true,
        };
      },
    });

    const initialData = { version: 1, initial: true };
    const result = engine.migrate(initialData, 3);

    expect(isOk(result)).toBe(true);
    expect(order).toEqual([1, 2]);
    if (isOk(result)) {
      expect(result.data.version).toBe(3);
      expect(result.data.initial).toBe(true);
      expect(result.data.stepOneApplied).toBe(true);
      expect(result.data.stepTwoApplied).toBe(true);
    }
  });

  it("fails with MIGRATION_FAILED when intermediate step is missing", () => {
    const engine = new MigrationEngine();
    engine.registerMigration({
      fromVersion: 2,
      toVersion: 3,
      migrate: (d) => d,
    });

    const legacyData = { version: 1 };
    const result = engine.migrate(legacyData, 3);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe("MIGRATION_FAILED");
      expect(result.error.message).toContain(
        "No migration registered from version 1 to 2"
      );
    }
  });

  it("handles thrown errors during migration step execution (TC-PERSIST-14)", () => {
    const engine = new MigrationEngine();
    engine.registerMigration({
      fromVersion: 1,
      toVersion: 2,
      migrate: () => {
        throw new Error("Corrupted payload structure in v1");
      },
    });

    const result = engine.migrate({ version: 1 }, 2);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe("MIGRATION_FAILED");
      expect(result.error.message).toContain(
        "Corrupted payload structure in v1"
      );
    }
  });

  it("rejects forward versions higher than target version with UNSUPPORTED_VERSION (TC-PERSIST-15)", () => {
    const engine = new MigrationEngine();
    const futureData = { version: 99, newFutureField: "secret" };

    const result = engine.migrate(futureData, 1);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe("UNSUPPORTED_VERSION");
      expect(result.error.message).toContain("newer than supported version");
    }
  });

  it("rejects invalid input payloads (null, array, non-objects)", () => {
    const engine = new MigrationEngine();

    expect(isErr(engine.migrate(null, 1))).toBe(true);
    expect(isErr(engine.migrate([1, 2, 3], 1))).toBe(true);
    expect(isErr(engine.migrate("string", 1))).toBe(true);
    expect(isErr(engine.migrate({ noVersion: true }, 1))).toBe(true);
  });
});
