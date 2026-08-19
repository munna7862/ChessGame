/**
 * ChessForge Time Control Definitions, Presets & Formatting
 */

import type { TimeControl, TimeControlType } from "./types";

/**
 * Standard Fischer and Blitz/Rapid/Classical presets.
 */
export const TIME_CONTROL_PRESETS: readonly TimeControl[] = [
  {
    type: "bullet",
    initialMs: 60 * 1000,
    incrementMs: 0,
    label: "1 + 0 (Bullet)",
  },
  {
    type: "bullet",
    initialMs: 2 * 60 * 1000,
    incrementMs: 1000,
    label: "2 + 1 (Bullet)",
  },
  {
    type: "blitz",
    initialMs: 3 * 60 * 1000,
    incrementMs: 0,
    label: "3 + 0 (Blitz)",
  },
  {
    type: "blitz",
    initialMs: 3 * 60 * 1000,
    incrementMs: 2000,
    label: "3 + 2 (Blitz)",
  },
  {
    type: "blitz",
    initialMs: 5 * 60 * 1000,
    incrementMs: 0,
    label: "5 + 0 (Blitz)",
  },
  {
    type: "blitz",
    initialMs: 5 * 60 * 1000,
    incrementMs: 3000,
    label: "5 + 3 (Blitz)",
  },
  {
    type: "rapid",
    initialMs: 10 * 60 * 1000,
    incrementMs: 0,
    label: "10 + 0 (Rapid)",
  },
  {
    type: "rapid",
    initialMs: 10 * 60 * 1000,
    incrementMs: 5000,
    label: "10 + 5 (Rapid)",
  },
  {
    type: "rapid",
    initialMs: 15 * 60 * 1000,
    incrementMs: 10000,
    label: "15 + 10 (Rapid)",
  },
  {
    type: "classical",
    initialMs: 30 * 60 * 1000,
    incrementMs: 0,
    label: "30 + 0 (Classical)",
  },
  {
    type: "none",
    initialMs: 0,
    incrementMs: 0,
    label: "Unlimited (Untimed)",
  },
] as const;

/**
 * Derives the TimeControlType category based on initial time and increment (FIDE estimated duration standard).
 * Estimated game time = initialMs + 40 * incrementMs.
 */
export function getTimeControlCategory(
  initialMs: number,
  incrementMs: number
): TimeControlType {
  if (initialMs <= 0) {
    return "none";
  }

  const estimatedTotalMs = initialMs + 40 * Math.max(0, incrementMs);
  const estimatedTotalMinutes = estimatedTotalMs / (60 * 1000);

  if (estimatedTotalMinutes < 3) {
    return "bullet";
  }
  if (estimatedTotalMinutes < 10) {
    return "blitz";
  }
  if (estimatedTotalMinutes < 30) {
    return "rapid";
  }
  return "classical";
}

/**
 * Creates a validated TimeControl object from minutes and seconds.
 */
export function createTimeControl(
  initialMinutes: number,
  incrementSeconds: number,
  customLabel?: string
): TimeControl {
  const safeMinutes = Math.max(0, initialMinutes);
  const safeIncrement = Math.max(0, incrementSeconds);

  const initialMs = Math.round(safeMinutes * 60 * 1000);
  const incrementMs = Math.round(safeIncrement * 1000);

  if (initialMs === 0) {
    return {
      type: "none",
      initialMs: 0,
      incrementMs: 0,
      label: customLabel ?? "Unlimited",
    };
  }

  const category = getTimeControlCategory(initialMs, incrementMs);
  const defaultLabel = `${safeMinutes} + ${safeIncrement}`;

  return {
    type: category,
    initialMs,
    incrementMs,
    label: customLabel ?? defaultLabel,
  };
}

/**
 * Formats a TimeControl into a short string (e.g. "5 + 3" or "Unlimited").
 */
export function formatTimeControl(tc: TimeControl): string {
  if (tc.type === "none" || tc.initialMs <= 0) {
    return "Unlimited";
  }

  const initialMinutes = tc.initialMs / (60 * 1000);
  const incrementSeconds = tc.incrementMs / 1000;

  return `${initialMinutes} + ${incrementSeconds}`;
}

export interface FormatTimeOptions {
  /**
   * Threshold in ms below which tenths of a second are displayed (e.g. 10000 ms = 10s).
   * Default: 10000. Set to 0 to disable tenths.
   */
  showTenthsBelowMs?: number;
  /**
   * Explicitly force or disable hour display. If undefined, hours are shown only if ms >= 1 hour.
   */
  showHours?: boolean;
}

/**
 * Formats milliseconds into standard chess clock display string (e.g. "3:00", "0:09.4", "1:05:22").
 */
export function formatTimeRemaining(
  ms: number,
  options?: FormatTimeOptions
): string {
  const safeMs = Math.max(0, ms);
  const threshold = options?.showTenthsBelowMs ?? 10000;

  // If below threshold and tenths requested
  if (threshold > 0 && safeMs < threshold) {
    const totalSeconds = Math.floor(safeMs / 1000);
    const tenths = Math.floor((safeMs % 1000) / 100);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, "0");
    return `${minutes}:${paddedSeconds}.${tenths}`;
  }

  const totalSeconds = Math.ceil(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedSeconds = seconds.toString().padStart(2, "0");

  const shouldShowHours = options?.showHours ?? hours > 0;

  if (shouldShowHours) {
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}
