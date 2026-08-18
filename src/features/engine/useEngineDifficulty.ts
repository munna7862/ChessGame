import { useState, useCallback } from "react";
import {
  type EngineDifficultyLevel,
  type EngineDifficultyPreset,
  DEFAULT_DIFFICULTY_LEVEL,
  EngineDifficultyLevelSchema,
  STORAGE_KEY_ENGINE_DIFFICULTY,
  getEngineDifficultyConfig,
} from "./difficulty";

export interface UseEngineDifficultyResult {
  readonly difficulty: EngineDifficultyLevel;
  readonly preset: EngineDifficultyPreset;
  readonly setDifficulty: (level: EngineDifficultyLevel) => void;
}

/**
 * Loads the initial difficulty level from local storage with Zod schema validation.
 */
function loadStoredDifficulty(
  fallback: EngineDifficultyLevel
): EngineDifficultyLevel {
  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_ENGINE_DIFFICULTY);
    if (!raw) return fallback;

    const parsedNumber = Number(raw);
    const validation = EngineDifficultyLevelSchema.safeParse(parsedNumber);
    if (validation.success) {
      return validation.data;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Saves difficulty level to local storage.
 */
function saveStoredDifficulty(level: EngineDifficultyLevel): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY_ENGINE_DIFFICULTY,
      level.toString()
    );
  } catch {
    // Non-blocking storage error containment
  }
}

/**
 * React hook for managing and persisting Stockfish difficulty levels (1..8).
 */
export function useEngineDifficulty(
  initialLevel: EngineDifficultyLevel = DEFAULT_DIFFICULTY_LEVEL
): UseEngineDifficultyResult {
  const [difficulty, setDifficultyState] = useState<EngineDifficultyLevel>(() =>
    loadStoredDifficulty(initialLevel)
  );

  const setDifficulty = useCallback((level: EngineDifficultyLevel) => {
    const validation = EngineDifficultyLevelSchema.safeParse(level);
    const validLevel = validation.success
      ? validation.data
      : DEFAULT_DIFFICULTY_LEVEL;

    setDifficultyState(validLevel);
    saveStoredDifficulty(validLevel);
  }, []);

  const preset = getEngineDifficultyConfig(difficulty);

  return {
    difficulty,
    preset,
    setDifficulty,
  };
}
