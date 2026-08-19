import {
  createPersistenceError,
  err,
  ok,
  type PersistenceError,
  type Result,
} from "./errors";
import { VersionHeaderSchema } from "./schema";

/**
 * Discrete migration step definition between consecutive schema versions.
 */
export interface MigrationStep {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly migrate: (data: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * MigrationEngine coordinates sequential schema upgrades from legacy versions to target versions.
 */
export class MigrationEngine {
  private readonly steps: Map<number, MigrationStep> = new Map();

  /**
   * Registers a migration step from version N to N+1.
   */
  public registerMigration(step: MigrationStep): void {
    if (step.toVersion !== step.fromVersion + 1) {
      throw new Error(
        `Migration step must be sequential (from ${step.fromVersion} to ${step.fromVersion + 1}, received target ${step.toVersion})`
      );
    }
    this.steps.set(step.fromVersion, step);
  }

  /**
   * Migrates raw state data up to the target version.
   */
  public migrate(
    rawData: unknown,
    targetVersion: number
  ): Result<Record<string, unknown>, PersistenceError> {
    if (
      typeof rawData !== "object" ||
      rawData === null ||
      Array.isArray(rawData)
    ) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          "Persisted payload must be a non-null JSON object",
          { received: typeof rawData }
        )
      );
    }

    const headerResult = VersionHeaderSchema.safeParse(rawData);
    if (!headerResult.success) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          "Missing or invalid version header in persisted state",
          { errors: headerResult.error.format() }
        )
      );
    }

    let currentVersion = headerResult.data.version;
    let currentData = { ...(rawData as Record<string, unknown>) };

    if (currentVersion > targetVersion) {
      return err(
        createPersistenceError(
          "UNSUPPORTED_VERSION",
          `Persisted state version ${currentVersion} is newer than supported version ${targetVersion}`,
          { currentVersion, targetVersion }
        )
      );
    }

    while (currentVersion < targetVersion) {
      const step = this.steps.get(currentVersion);
      if (!step) {
        return err(
          createPersistenceError(
            "MIGRATION_FAILED",
            `No migration registered from version ${currentVersion} to ${currentVersion + 1}`,
            { currentVersion, targetVersion }
          )
        );
      }

      try {
        const transformed = step.migrate(currentData);
        currentVersion = step.toVersion;
        currentData = { ...transformed, version: currentVersion };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown migration error";
        return err(
          createPersistenceError(
            "MIGRATION_FAILED",
            `Migration step from v${step.fromVersion} to v${step.toVersion} failed: ${message}`,
            {
              fromVersion: step.fromVersion,
              toVersion: step.toVersion,
              error: message,
            }
          )
        );
      }
    }

    return ok(currentData);
  }

  /**
   * Returns registered migration step versions.
   */
  public getRegisteredVersions(): number[] {
    return Array.from(this.steps.keys()).sort((a, b) => a - b);
  }
}
