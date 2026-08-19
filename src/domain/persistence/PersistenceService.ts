import {
  createPersistenceError,
  err,
  isErr,
  ok,
  type PersistenceError,
  type Result,
} from "./errors";
import { MigrationEngine } from "./migration";
import type { PersistenceStorageAdapter } from "./ports";
import {
  createDefaultPersistedState,
  CURRENT_SCHEMA_VERSION,
  PersistedStateV1Schema,
  VersionHeaderSchema,
  type PersistedActiveGame,
  type PersistedSettings,
  type PersistedStateV1,
} from "./schema";
import { LocalStoragePersistenceAdapter } from "./adapters/LocalStoragePersistenceAdapter";

export const DEFAULT_STORAGE_KEY = "chessforge_state_v1";

/**
 * Service options for PersistenceService configuration.
 */
export interface PersistenceServiceOptions {
  readonly storageKey?: string;
  readonly adapter?: PersistenceStorageAdapter;
  readonly migrationEngine?: MigrationEngine;
  readonly timeProvider?: () => number;
}

/**
 * PersistenceService is the single authoritative coordinator for saving,
 * loading, validating, and migrating versioned application state.
 */
export class PersistenceService {
  private readonly storageKey: string;
  private readonly adapter: PersistenceStorageAdapter;
  private readonly migrationEngine: MigrationEngine;
  private readonly timeProvider: () => number;

  constructor(options: PersistenceServiceOptions = {}) {
    this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
    this.adapter = options.adapter ?? new LocalStoragePersistenceAdapter();
    this.migrationEngine = options.migrationEngine ?? new MigrationEngine();
    this.timeProvider = options.timeProvider ?? Date.now;
  }

  /**
   * Saves the provided versioned state to storage after schema validation.
   */
  public save(state: PersistedStateV1): Result<void, PersistenceError> {
    const parseResult = PersistedStateV1Schema.safeParse(state);
    if (!parseResult.success) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          "Cannot save invalid state: schema validation failed",
          { errors: parseResult.error.format() }
        )
      );
    }

    try {
      const json = JSON.stringify(parseResult.data);
      return this.adapter.setItem(this.storageKey, json);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to serialize state";
      return err(
        createPersistenceError(
          "WRITE_FAILED",
          `JSON serialization failed: ${message}`,
          {
            error: message,
          }
        )
      );
    }
  }

  /**
   * Loads and deserializes the persisted state with schema validation and migrations.
   */
  public load(): Result<PersistedStateV1 | null, PersistenceError> {
    const readResult = this.adapter.getItem(this.storageKey);
    if (isErr(readResult)) {
      return readResult;
    }

    const rawString = readResult.data;
    if (rawString === null || rawString.trim() === "") {
      return ok(null);
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawString);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Malformed JSON in storage";
      return err(
        createPersistenceError(
          "PARSE_ERROR",
          `Failed to parse persisted JSON: ${message}`,
          {
            rawLength: rawString.length,
            error: message,
          }
        )
      );
    }

    if (
      typeof parsedJson !== "object" ||
      parsedJson === null ||
      Array.isArray(parsedJson)
    ) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          "Persisted data must be a JSON object",
          { received: typeof parsedJson }
        )
      );
    }

    const headerResult = VersionHeaderSchema.safeParse(parsedJson);
    if (!headerResult.success) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          "Persisted state is missing a valid numeric version header",
          { errors: headerResult.error.format() }
        )
      );
    }

    const dataVersion = headerResult.data.version;
    let dataToValidate = parsedJson as Record<string, unknown>;

    if (dataVersion < CURRENT_SCHEMA_VERSION) {
      const migrationResult = this.migrationEngine.migrate(
        parsedJson,
        CURRENT_SCHEMA_VERSION
      );
      if (isErr(migrationResult)) {
        return migrationResult;
      }
      dataToValidate = migrationResult.data;
    } else if (dataVersion > CURRENT_SCHEMA_VERSION) {
      return err(
        createPersistenceError(
          "UNSUPPORTED_VERSION",
          `Persisted state version ${dataVersion} is newer than supported version ${CURRENT_SCHEMA_VERSION}`,
          {
            currentVersion: dataVersion,
            supportedVersion: CURRENT_SCHEMA_VERSION,
          }
        )
      );
    }

    const validationResult = PersistedStateV1Schema.safeParse(dataToValidate);
    if (!validationResult.success) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          "Persisted state does not conform to schema",
          { errors: validationResult.error.format() }
        )
      );
    }

    return ok(validationResult.data);
  }

  /**
   * Safe loader that falls back to default state upon missing data, corruption, or errors.
   */
  public loadWithFallback(fallbackState?: PersistedStateV1): PersistedStateV1 {
    const result = this.load();
    if (isErr(result) || result.data === null) {
      return fallbackState ?? createDefaultPersistedState(this.timeProvider);
    }
    return result.data;
  }

  /**
   * Updates only the settings section of persisted state.
   */
  public saveSettings(
    settings: PersistedSettings
  ): Result<void, PersistenceError> {
    const currentState = this.loadWithFallback();
    const updatedState: PersistedStateV1 = {
      ...currentState,
      settings: { ...settings },
      updatedAt: this.timeProvider(),
    };
    return this.save(updatedState);
  }

  /**
   * Updates or clears the active game recovery snapshot.
   */
  public saveActiveGame(
    activeGame: PersistedActiveGame | null
  ): Result<void, PersistenceError> {
    const currentState = this.loadWithFallback();
    const updatedState: PersistedStateV1 = {
      ...currentState,
      activeGame: activeGame ? { ...activeGame } : null,
      updatedAt: this.timeProvider(),
    };
    return this.save(updatedState);
  }

  /**
   * Clears persisted state from storage.
   */
  public clear(): Result<void, PersistenceError> {
    return this.adapter.removeItem(this.storageKey);
  }

  /**
   * Access the underlying storage adapter for diagnostics.
   */
  public getAdapter(): PersistenceStorageAdapter {
    return this.adapter;
  }

  /**
   * Access the migration engine to register migrations.
   */
  public getMigrationEngine(): MigrationEngine {
    return this.migrationEngine;
  }
}
