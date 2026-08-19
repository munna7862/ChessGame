/**
 * ChessForge Persistence Types & Contracts
 */

export type {
  BoardTheme,
  PieceSet,
  PersistedSettings,
  PartialPersistedSettings,
  PersistedPlayerConfig,
  PersistedTimeControl,
  PersistedClockState,
  PersistedActiveGame,
  PersistedStateV1,
  VersionHeader,
} from "./schema";

export type { PersistenceError, PersistenceErrorCode, Result } from "./errors";

export type { PersistenceStorageAdapter } from "./ports";
