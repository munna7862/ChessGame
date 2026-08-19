/**
 * ChessForge Time Providers
 *
 * Provides high-resolution system time provider and deterministic fake time provider
 * for repeatable, zero-drift testing without real-time sleeps.
 */

import type { TimeProvider } from "./types";

/**
 * High-resolution system time provider using performance.now() if available.
 */
export class SystemTimeProvider implements TimeProvider {
  now(): number {
    if (
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
    ) {
      return performance.now();
    }
    return Date.now();
  }
}

/**
 * Deterministic fake time provider for unit and property testing.
 */
export class DeterministicFakeTimeProvider implements TimeProvider {
  private currentTimestamp: number;

  constructor(initialTimestamp = 0) {
    this.currentTimestamp = initialTimestamp;
  }

  now(): number {
    return this.currentTimestamp;
  }

  /**
   * Advances the fake timestamp by a given duration in milliseconds.
   */
  advanceBy(ms: number): number {
    if (ms < 0) {
      throw new Error(`Cannot advance fake time by negative amount: ${ms}`);
    }
    this.currentTimestamp += ms;
    return this.currentTimestamp;
  }

  /**
   * Explicitly sets the fake timestamp.
   */
  setTime(timestamp: number): void {
    if (timestamp < this.currentTimestamp) {
      throw new Error(
        `Cannot set fake time backwards: current ${this.currentTimestamp}, requested ${timestamp}`
      );
    }
    this.currentTimestamp = timestamp;
  }
}

/**
 * Default global time provider instance.
 */
export const defaultTimeProvider = new SystemTimeProvider();
