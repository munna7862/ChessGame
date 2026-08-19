import React, {
  useMemo,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  BoardTheme,
  PieceSet,
  PersistedSettings,
  PartialPersistedSettings,
  PersistenceService,
} from "../../domain/persistence";
import { SettingsService } from "../../domain/persistence/settings/SettingsService";
import {
  SettingsContext,
  type SettingsContextValue,
} from "./settingsContextInstance";

export interface SettingsProviderProps {
  readonly children: ReactNode;
  readonly service?: SettingsService | undefined;
  readonly persistenceService?: PersistenceService | undefined;
  readonly initialSettings?: PersistedSettings | undefined;
}

/**
 * Provider component supplying reactive user preferences to all child components.
 * Employs useSyncExternalStore for tear-free, non-cascading React synchronization.
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  service,
  persistenceService,
  initialSettings,
}) => {
  const settingsService = useMemo(() => {
    if (service) return service;
    return new SettingsService({ persistenceService, initialSettings });
  }, [service, persistenceService, initialSettings]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return settingsService.subscribe(() => {
        onStoreChange();
      });
    },
    [settingsService]
  );

  const getSnapshot = useCallback(() => {
    return settingsService.getSettings();
  }, [settingsService]);

  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const updateSettings = useCallback(
    (patch: PartialPersistedSettings) => {
      return settingsService.updateSettings(patch);
    },
    [settingsService]
  );

  const resetSettings = useCallback(() => {
    return settingsService.resetSettings();
  }, [settingsService]);

  const setBoardTheme = useCallback(
    (boardTheme: BoardTheme) => {
      updateSettings({ boardTheme });
    },
    [updateSettings]
  );

  const setPieceSet = useCallback(
    (pieceSet: PieceSet) => {
      updateSettings({ pieceSet });
    },
    [updateSettings]
  );

  const setShowCoordinates = useCallback(
    (showCoordinates: boolean) => {
      updateSettings({ showCoordinates });
    },
    [updateSettings]
  );

  const setShowLegalMoves = useCallback(
    (showLegalMoves: boolean) => {
      updateSettings({ showLegalMoves });
    },
    [updateSettings]
  );

  const setShowLastMove = useCallback(
    (showLastMove: boolean) => {
      updateSettings({ showLastMove });
    },
    [updateSettings]
  );

  const setSoundEnabled = useCallback(
    (soundEnabled: boolean) => {
      updateSettings({ soundEnabled });
    },
    [updateSettings]
  );

  const setAutoQueen = useCallback(
    (autoQueen: boolean) => {
      updateSettings({ autoQueen });
    },
    [updateSettings]
  );

  const setEngineDifficulty = useCallback(
    (engineDifficulty: number) => {
      updateSettings({ engineDifficulty });
    },
    [updateSettings]
  );

  const setReducedMotion = useCallback(
    (reducedMotion: boolean) => {
      updateSettings({ reducedMotion });
    },
    [updateSettings]
  );

  const setVolume = useCallback(
    (volume: number) => {
      updateSettings({ volume });
    },
    [updateSettings]
  );

  const contextValue: SettingsContextValue = useMemo(
    () => ({
      settings,
      settingsService,
      updateSettings,
      resetSettings,
      setBoardTheme,
      setPieceSet,
      setShowCoordinates,
      setShowLegalMoves,
      setShowLastMove,
      setSoundEnabled,
      setAutoQueen,
      setEngineDifficulty,
      setReducedMotion,
      setVolume,
    }),
    [
      settings,
      settingsService,
      updateSettings,
      resetSettings,
      setBoardTheme,
      setPieceSet,
      setShowCoordinates,
      setShowLegalMoves,
      setShowLastMove,
      setSoundEnabled,
      setAutoQueen,
      setEngineDifficulty,
      setReducedMotion,
      setVolume,
    ]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
