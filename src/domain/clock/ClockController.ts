/**
 * ChessForge Clock Controller
 *
 * Encapsulates ClockState mutations and listener notifications with an
 * injectable TimeProvider. Operates without background intervals/timers in domain.
 */

import {
  createClockState,
  startClock,
  pauseClock,
  resumeClock,
  switchTurn,
  computeRemainingTime,
  checkTimeout,
  addTime,
  resetClock,
  restoreClockState,
  isFlagged,
} from "./clockEngine";
import { defaultTimeProvider } from "./timeProvider";
import type {
  ClockListener,
  ClockState,
  TimeControl,
  TimeProvider,
  TimeRemaining,
} from "./types";

export class ClockController {
  private state: ClockState;
  private timeProvider: TimeProvider;
  private listeners: Set<ClockListener> = new Set();

  constructor(
    timeControl: TimeControl,
    timeProvider: TimeProvider = defaultTimeProvider
  ) {
    this.state = createClockState(timeControl);
    this.timeProvider = timeProvider;
  }

  /**
   * Returns a snapshot of the current ClockState.
   */
  getState(): ClockState {
    return this.state;
  }

  /**
   * Returns remaining time for both players derived at the current timestamp.
   */
  getRemainingTime(): TimeRemaining {
    return computeRemainingTime(this.state, this.timeProvider.now());
  }

  /**
   * Checks if clock is currently flagged.
   */
  isFlagged(): { flagged: boolean; flaggedColor: "white" | "black" | null } {
    return isFlagged(this.state, this.timeProvider.now());
  }

  /**
   * Starts the clock for activeColor.
   */
  start(activeColor: "white" | "black"): ClockState {
    const nextState = startClock(
      this.state,
      activeColor,
      this.timeProvider.now()
    );
    return this.updateState(nextState);
  }

  /**
   * Switches turn to the next player and awards increment.
   */
  switchTurn(): ClockState {
    const nextState = switchTurn(this.state, this.timeProvider.now());
    return this.updateState(nextState);
  }

  /**
   * Pauses the clock.
   */
  pause(): ClockState {
    const nextState = pauseClock(this.state, this.timeProvider.now());
    return this.updateState(nextState);
  }

  /**
   * Resumes the paused clock.
   */
  resume(): ClockState {
    const nextState = resumeClock(this.state, this.timeProvider.now());
    return this.updateState(nextState);
  }

  /**
   * Checks for timeout and updates state to flagged if time expired.
   */
  checkTimeout(): ClockState {
    const nextState = checkTimeout(this.state, this.timeProvider.now());
    return this.updateState(nextState);
  }

  /**
   * Adjusts banked time for a player.
   */
  addTime(color: "white" | "black", additionalMs: number): ClockState {
    const nextState = addTime(this.state, color, additionalMs);
    return this.updateState(nextState);
  }

  /**
   * Resets the clock to initial state.
   */
  reset(newTimeControl?: TimeControl): ClockState {
    const tc = newTimeControl ?? this.state.timeControl;
    const nextState = resetClock(tc);
    return this.updateState(nextState);
  }

  /**
   * Restores clock state with explicit remaining balances and time control.
   */
  restore(
    timeControl: TimeControl,
    whiteMs: number,
    blackMs: number,
    activeColor: "white" | "black" | null = null
  ): ClockState {
    const nextState = restoreClockState(
      timeControl,
      whiteMs,
      blackMs,
      activeColor
    );
    return this.updateState(nextState);
  }

  /**
   * Updates the injectable time provider.
   */
  setTimeProvider(provider: TimeProvider): void {
    this.timeProvider = provider;
  }

  /**
   * Subscribes to clock state transitions.
   */
  subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(nextState: ClockState): ClockState {
    if (this.state !== nextState) {
      this.state = nextState;
      this.notifyListeners();
    }
    return this.state;
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
