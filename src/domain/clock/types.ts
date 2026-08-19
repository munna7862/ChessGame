/**
 * ChessForge Clock Domain Types & Interfaces
 *
 * Provides pure type definitions for chess clocks, time controls,
 * clock statuses, and injectable time providers.
 */

export type TimeControlType =
  "none" | "bullet" | "blitz" | "rapid" | "classical" | "custom";

export interface TimeControl {
  readonly type: TimeControlType;
  readonly initialMs: number;
  readonly incrementMs: number;
  readonly label?: string;
}

export type ClockStatus = "idle" | "running" | "paused" | "flagged";

export interface ClockState {
  readonly whiteMs: number;
  readonly blackMs: number;
  readonly activeColor: "white" | "black" | null;
  readonly turnStartedAt: number | null;
  readonly status: ClockStatus;
  readonly running: boolean;
  readonly timeControl: TimeControl;
  readonly flaggedColor: "white" | "black" | null;
  readonly moveCount: {
    readonly white: number;
    readonly black: number;
  };
}

export interface TimeRemaining {
  readonly whiteMs: number;
  readonly blackMs: number;
}

export interface TimeProvider {
  /**
   * Returns the current timestamp in milliseconds.
   */
  now(): number;
}

export type ClockListener = (state: ClockState) => void;
