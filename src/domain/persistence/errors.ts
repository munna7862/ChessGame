/**
 * ChessForge Persistence Domain Error Codes & Result Contracts
 */

export const PERSISTENCE_ERROR_CODES = [
  "STORAGE_UNAVAILABLE",
  "PARSE_ERROR",
  "VALIDATION_FAILED",
  "MIGRATION_FAILED",
  "UNSUPPORTED_VERSION",
  "WRITE_FAILED",
  "READ_FAILED",
] as const;

export type PersistenceErrorCode = (typeof PERSISTENCE_ERROR_CODES)[number];

export interface PersistenceError {
  readonly code: PersistenceErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export type Result<T, E = PersistenceError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

export function isOk<T, E>(
  result: Result<T, E>
): result is { readonly success: true; readonly data: T } {
  return result.success;
}

export function isErr<T, E>(
  result: Result<T, E>
): result is { readonly success: false; readonly error: E } {
  return !result.success;
}

export function createPersistenceError(
  code: PersistenceErrorCode,
  message: string,
  details?: Record<string, unknown>
): PersistenceError {
  return {
    code,
    message,
    ...(details ? { details: Object.freeze({ ...details }) } : {}),
  };
}
