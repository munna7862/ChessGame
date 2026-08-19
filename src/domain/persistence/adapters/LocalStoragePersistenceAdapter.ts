import {
  createPersistenceError,
  err,
  ok,
  type PersistenceError,
  type Result,
} from "../errors";
import type { PersistenceStorageAdapter } from "../ports";

/**
 * LocalStoragePersistenceAdapter wraps Web Storage (window.localStorage)
 * with robust error boundaries, quota management, and availability guards.
 */
export class LocalStoragePersistenceAdapter implements PersistenceStorageAdapter {
  private readonly storage: Storage | null;

  constructor(customStorage?: Storage | null) {
    if (customStorage !== undefined) {
      this.storage = customStorage;
    } else if (typeof window !== "undefined" && window.localStorage) {
      this.storage = window.localStorage;
    } else if (typeof localStorage !== "undefined") {
      this.storage = localStorage;
    } else {
      this.storage = null;
    }
  }

  public getItem(key: string): Result<string | null, PersistenceError> {
    if (!this.storage) {
      return err(
        createPersistenceError(
          "STORAGE_UNAVAILABLE",
          "LocalStorage is not available in the current environment"
        )
      );
    }

    try {
      const item = this.storage.getItem(key);
      return ok(item);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to read from localStorage";
      return err(
        createPersistenceError(
          "READ_FAILED",
          `Failed to read key '${key}': ${message}`,
          {
            key,
            error: message,
          }
        )
      );
    }
  }

  public setItem(key: string, value: string): Result<void, PersistenceError> {
    if (!this.storage) {
      return err(
        createPersistenceError(
          "STORAGE_UNAVAILABLE",
          "LocalStorage is not available in the current environment"
        )
      );
    }

    try {
      this.storage.setItem(key, value);
      return ok(undefined);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to write to localStorage";
      return err(
        createPersistenceError(
          "WRITE_FAILED",
          `Failed to write key '${key}': ${message}`,
          {
            key,
            error: message,
          }
        )
      );
    }
  }

  public removeItem(key: string): Result<void, PersistenceError> {
    if (!this.storage) {
      return err(
        createPersistenceError(
          "STORAGE_UNAVAILABLE",
          "LocalStorage is not available in the current environment"
        )
      );
    }

    try {
      this.storage.removeItem(key);
      return ok(undefined);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove key from localStorage";
      return err(
        createPersistenceError(
          "WRITE_FAILED",
          `Failed to remove key '${key}': ${message}`,
          {
            key,
            error: message,
          }
        )
      );
    }
  }

  public clear(): Result<void, PersistenceError> {
    if (!this.storage) {
      return err(
        createPersistenceError(
          "STORAGE_UNAVAILABLE",
          "LocalStorage is not available in the current environment"
        )
      );
    }

    try {
      this.storage.clear();
      return ok(undefined);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to clear localStorage";
      return err(
        createPersistenceError(
          "WRITE_FAILED",
          `Failed to clear storage: ${message}`,
          {
            error: message,
          }
        )
      );
    }
  }

  public keys(): Result<string[], PersistenceError> {
    if (!this.storage) {
      return err(
        createPersistenceError(
          "STORAGE_UNAVAILABLE",
          "LocalStorage is not available in the current environment"
        )
      );
    }

    try {
      const keyList: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const k = this.storage.key(i);
        if (k !== null) {
          keyList.push(k);
        }
      }
      return ok(keyList);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to list keys from localStorage";
      return err(
        createPersistenceError(
          "READ_FAILED",
          `Failed to list storage keys: ${message}`,
          {
            error: message,
          }
        )
      );
    }
  }
}
