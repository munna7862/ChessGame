import { createContext } from "react";
import type {
  BoardTheme,
  PieceSet,
  PersistedSettings,
  PartialPersistedSettings,
  PersistenceError,
  Result,
} from "../../domain/persistence";
import type { SettingsService } from "../../domain/persistence/settings/SettingsService";

export interface SettingsContextValue {
  readonly settings: PersistedSettings;
  readonly settingsService: SettingsService;
  readonly updateSettings: (
    patch: PartialPersistedSettings
  ) => Result<PersistedSettings, PersistenceError>;
  readonly resetSettings: () => Result<PersistedSettings, PersistenceError>;
  readonly setBoardTheme: (theme: BoardTheme) => void;
  readonly setPieceSet: (pieceSet: PieceSet) => void;
  readonly setShowCoordinates: (show: boolean) => void;
  readonly setShowLegalMoves: (show: boolean) => void;
  readonly setShowLastMove: (show: boolean) => void;
  readonly setSoundEnabled: (enabled: boolean) => void;
  readonly setAutoQueen: (enabled: boolean) => void;
  readonly setEngineDifficulty: (difficulty: number) => void;
  readonly setReducedMotion: (enabled: boolean) => void;
  readonly setVolume: (volume: number) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
