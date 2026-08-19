/**
 * ChessForge Persistence Storage Port Interface
 */

import type { PersistenceError, Result } from "./errors";

/**
 * Storage adapter abstraction port for key-value persistence.
 */
export interface PersistenceStorageAdapter {
  getItem(key: string): Result<string | null, PersistenceError>;
  setItem(key: string, value: string): Result<void, PersistenceError>;
  removeItem(key: string): Result<void, PersistenceError>;
  clear(): Result<void, PersistenceError>;
  keys(): Result<string[], PersistenceError>;
}
