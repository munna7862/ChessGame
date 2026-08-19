import { ok, type PersistenceError, type Result } from "../errors";
import type { PersistenceStorageAdapter } from "../ports";

/**
 * InMemoryPersistenceAdapter provides an isolated in-memory key-value store
 * for deterministic unit testing and environments without persistent storage.
 */
export class InMemoryPersistenceAdapter implements PersistenceStorageAdapter {
  private readonly store: Map<string, string> = new Map();

  public getItem(key: string): Result<string | null, PersistenceError> {
    const value = this.store.get(key);
    return ok(value !== undefined ? value : null);
  }

  public setItem(key: string, value: string): Result<void, PersistenceError> {
    this.store.set(key, value);
    return ok(undefined);
  }

  public removeItem(key: string): Result<void, PersistenceError> {
    this.store.delete(key);
    return ok(undefined);
  }

  public clear(): Result<void, PersistenceError> {
    this.store.clear();
    return ok(undefined);
  }

  public keys(): Result<string[], PersistenceError> {
    return ok(Array.from(this.store.keys()));
  }

  /**
   * Helper for tests to inspect store size.
   */
  public size(): number {
    return this.store.size;
  }
}
