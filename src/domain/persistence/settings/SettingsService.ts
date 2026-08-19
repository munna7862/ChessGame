import { isErr, ok, type PersistenceError, type Result } from "../errors";
import { PersistenceService } from "../PersistenceService";
import { DEFAULT_PERSISTED_SETTINGS, type PersistedSettings } from "../schema";
import {
  sanitizeSettings,
  validatePartialSettings,
  validateSettings,
} from "./settingsValidation";

export type SettingsListener = (settings: PersistedSettings) => void;

export interface SettingsServiceOptions {
  readonly persistenceService?: PersistenceService | undefined;
  readonly initialSettings?: PersistedSettings | undefined;
}

/**
 * Authoritative service managing user settings, persistence coordination,
 * runtime validation, sanitization, and change notifications.
 */
export class SettingsService {
  private readonly persistenceService: PersistenceService;
  private currentSettings: Readonly<PersistedSettings>;
  private readonly listeners: Set<SettingsListener> = new Set();

  constructor(options: SettingsServiceOptions = {}) {
    this.persistenceService =
      options.persistenceService ?? new PersistenceService();

    if (options.initialSettings) {
      this.currentSettings = Object.freeze(
        sanitizeSettings(options.initialSettings)
      );
    } else {
      this.currentSettings = Object.freeze(this.loadFromStorage());
    }
  }

  /**
   * Returns the stable snapshot of the current cached settings.
   */
  public getSettings(): Readonly<PersistedSettings> {
    return this.currentSettings;
  }

  /**
   * Applies a partial update patch to the settings, persists the changes,
   * and notifies all subscribed listeners.
   */
  public updateSettings(
    patch: unknown
  ): Result<Readonly<PersistedSettings>, PersistenceError> {
    const validationResult = validatePartialSettings(patch);
    if (isErr(validationResult)) {
      return validationResult;
    }

    const validPatch = validationResult.data;
    const merged: PersistedSettings = {
      boardTheme: validPatch.boardTheme ?? this.currentSettings.boardTheme,
      pieceSet: validPatch.pieceSet ?? this.currentSettings.pieceSet,
      showCoordinates:
        validPatch.showCoordinates ?? this.currentSettings.showCoordinates,
      showLegalMoves:
        validPatch.showLegalMoves ?? this.currentSettings.showLegalMoves,
      showLastMove:
        validPatch.showLastMove ?? this.currentSettings.showLastMove,
      soundEnabled:
        validPatch.soundEnabled ?? this.currentSettings.soundEnabled,
      autoQueen: validPatch.autoQueen ?? this.currentSettings.autoQueen,
      engineDifficulty:
        validPatch.engineDifficulty ?? this.currentSettings.engineDifficulty,
      reducedMotion:
        validPatch.reducedMotion ?? this.currentSettings.reducedMotion,
      volume: validPatch.volume ?? this.currentSettings.volume,
    };

    const fullValidation = validateSettings(merged);
    if (isErr(fullValidation)) {
      return fullValidation;
    }

    const saveResult = this.persistenceService.saveSettings(merged);
    if (isErr(saveResult)) {
      return saveResult;
    }

    this.currentSettings = Object.freeze(merged);
    this.notifyListeners();
    return ok(this.currentSettings);
  }

  /**
   * Resets all settings to their deterministic factory defaults,
   * persists the state, and notifies listeners.
   */
  public resetSettings(): Result<
    Readonly<PersistedSettings>,
    PersistenceError
  > {
    const defaultSettings: PersistedSettings = {
      ...DEFAULT_PERSISTED_SETTINGS,
    };

    const saveResult = this.persistenceService.saveSettings(defaultSettings);
    if (isErr(saveResult)) {
      return saveResult;
    }

    this.currentSettings = Object.freeze(defaultSettings);
    this.notifyListeners();
    return ok(this.currentSettings);
  }

  /**
   * Subscribes a listener callback to settings changes.
   * Returns an unsubscribe function for clean lifecycle management.
   */
  public subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reloads settings from underlying storage with sanitization fallback.
   */
  public reload(): Readonly<PersistedSettings> {
    this.currentSettings = Object.freeze(this.loadFromStorage());
    this.notifyListeners();
    return this.currentSettings;
  }

  /**
   * Returns the underlying persistence service.
   */
  public getPersistenceService(): PersistenceService {
    return this.persistenceService;
  }

  /**
   * Internal helper to load and sanitize settings from storage.
   */
  private loadFromStorage(): PersistedSettings {
    try {
      const persistedState = this.persistenceService.loadWithFallback();
      return sanitizeSettings(persistedState.settings);
    } catch {
      return { ...DEFAULT_PERSISTED_SETTINGS };
    }
  }

  /**
   * Internal helper to notify all subscribed listeners of changes.
   */
  private notifyListeners(): void {
    const snapshot = { ...this.currentSettings };
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (error) {
        // Prevent rogue listener exceptions from breaking the service
        console.error("Error in settings change listener:", error);
      }
    }
  }
}
