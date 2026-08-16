/**
 * Standardized chess domain error codes.
 */
export const CHESS_DOMAIN_ERROR_CODES = [
  "ILLEGAL_MOVE",
  "INVALID_SQUARE",
  "INVALID_FEN",
  "INVALID_PGN",
  "GAME_ALREADY_OVER",
  "NO_PIECE_AT_SQUARE",
  "NOT_YOUR_TURN",
  "PROMOTION_REQUIRED",
  "INVALID_PROMOTION",
  "NO_MOVE_TO_UNDO",
  "INVALID_COLOR",
] as const;

export type ChessDomainErrorCode = (typeof CHESS_DOMAIN_ERROR_CODES)[number];

/**
 * Structured chess domain error contract.
 */
export interface ChessDomainError {
  readonly code: ChessDomainErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

/**
 * Universal Result type for domain and infrastructure operations.
 */
export type Result<T, E = ChessDomainError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Monadic Result constructors and guards.
 */
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

export function createDomainError(
  code: ChessDomainErrorCode,
  message: string,
  details?: Record<string, unknown>
): ChessDomainError {
  return {
    code,
    message,
    ...(details ? { details: Object.freeze({ ...details }) } : {}),
  };
}
