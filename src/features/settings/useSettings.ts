import { useContext } from "react";
import {
  SettingsContext,
  type SettingsContextValue,
} from "./settingsContextInstance";

/**
 * Hook providing access to the authoritative application settings.
 * Must be used within a SettingsProvider.
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettings must be used within a <SettingsProvider>. Wrap your component tree with <SettingsProvider>."
    );
  }
  return context;
}
