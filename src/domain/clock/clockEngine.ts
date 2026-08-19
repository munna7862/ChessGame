/**
 * ChessForge Pure Clock Domain Engine
 *
 * Provides pure mathematical calculations for chess clocks,
 * including turn switching, Fischer increment, elapsed-time deduction,
 * and authoritative timeout detection. Completely independent of React/DOM.
 */

import type { ClockState, TimeControl, TimeRemaining } from "./types";

/**
 * Creates a brand new ClockState initialized with the given TimeControl.
 */
export function createClockState(timeControl: TimeControl): ClockState {
  const isUntimed = timeControl.type === "none" || timeControl.initialMs <= 0;
  const initialTime = isUntimed ? 0 : timeControl.initialMs;

  return {
    whiteMs: initialTime,
    blackMs: initialTime,
    activeColor: null,
    turnStartedAt: null,
    status: "idle",
    running: false,
    timeControl,
    flaggedColor: null,
    moveCount: {
      white: 0,
      black: 0,
    },
  };
}

/**
 * Starts the clock for the given active color at timestamp `now`.
 */
export function startClock(
  state: ClockState,
  activeColor: "white" | "black",
  now: number
): ClockState {
  if (state.status === "flagged") {
    return state;
  }

  return {
    ...state,
    activeColor,
    turnStartedAt: now,
    status: "running",
    running: true,
  };
}

/**
 * Computes remaining time for White and Black given the current timestamp `now`.
 */
export function computeRemainingTime(
  state: ClockState,
  now: number
): TimeRemaining {
  if (state.timeControl.type === "none" || state.timeControl.initialMs <= 0) {
    return {
      whiteMs: 0,
      blackMs: 0,
    };
  }

  if (state.status === "flagged") {
    return {
      whiteMs: state.flaggedColor === "white" ? 0 : state.whiteMs,
      blackMs: state.flaggedColor === "black" ? 0 : state.blackMs,
    };
  }

  if (
    !state.running ||
    state.turnStartedAt === null ||
    state.activeColor === null
  ) {
    return {
      whiteMs: state.whiteMs,
      blackMs: state.blackMs,
    };
  }

  const elapsed = Math.max(0, now - state.turnStartedAt);

  if (state.activeColor === "white") {
    return {
      whiteMs: Math.max(0, state.whiteMs - elapsed),
      blackMs: state.blackMs,
    };
  }

  return {
    whiteMs: state.whiteMs,
    blackMs: Math.max(0, state.blackMs - elapsed),
  };
}

/**
 * Checks whether the clock has flagged (run out of time) at timestamp `now`.
 * Returns an updated ClockState with status 'flagged' if timeout occurred, or the existing state.
 */
export function checkTimeout(state: ClockState, now: number): ClockState {
  if (
    state.status === "flagged" ||
    state.timeControl.type === "none" ||
    state.timeControl.initialMs <= 0
  ) {
    return state;
  }

  if (
    !state.running ||
    state.turnStartedAt === null ||
    state.activeColor === null
  ) {
    return state;
  }

  const elapsed = Math.max(0, now - state.turnStartedAt);
  const activeBanked =
    state.activeColor === "white" ? state.whiteMs : state.blackMs;

  if (elapsed >= activeBanked) {
    return {
      ...state,
      whiteMs: state.activeColor === "white" ? 0 : state.whiteMs,
      blackMs: state.activeColor === "black" ? 0 : state.blackMs,
      status: "flagged",
      running: false,
      flaggedColor: state.activeColor,
    };
  }

  return state;
}

/**
 * Checks flag status without mutating state.
 */
export function isFlagged(
  state: ClockState,
  now: number
): { flagged: boolean; flaggedColor: "white" | "black" | null } {
  if (state.status === "flagged") {
    return {
      flagged: true,
      flaggedColor: state.flaggedColor,
    };
  }

  if (state.timeControl.type === "none" || state.timeControl.initialMs <= 0) {
    return { flagged: false, flaggedColor: null };
  }

  if (
    !state.running ||
    state.turnStartedAt === null ||
    state.activeColor === null
  ) {
    return { flagged: false, flaggedColor: null };
  }

  const elapsed = Math.max(0, now - state.turnStartedAt);
  const activeBanked =
    state.activeColor === "white" ? state.whiteMs : state.blackMs;

  if (elapsed >= activeBanked) {
    return {
      flagged: true,
      flaggedColor: state.activeColor,
    };
  }

  return { flagged: false, flaggedColor: null };
}

/**
 * Executes a turn switch at timestamp `now`:
 * 1. Calculates elapsed time for the ending side.
 * 2. If time ran out (elapsed >= banked), sets status to 'flagged' and awards NO increment.
 * 3. Otherwise, deducts elapsed time and awards Fischer increment to the ending side.
 * 4. Switches activeColor to the next player and sets turnStartedAt to `now`.
 */
export function switchTurn(state: ClockState, now: number): ClockState {
  if (state.status === "flagged") {
    return state;
  }

  const endingColor = state.activeColor ?? "white";
  const nextColor: "white" | "black" =
    endingColor === "white" ? "black" : "white";

  const updatedMoveCount = {
    ...state.moveCount,
    [endingColor]: state.moveCount[endingColor] + 1,
  };

  // Untimed clock
  if (state.timeControl.type === "none" || state.timeControl.initialMs <= 0) {
    return {
      ...state,
      activeColor: nextColor,
      turnStartedAt: now,
      running: true,
      status: "running",
      moveCount: updatedMoveCount,
    };
  }

  const elapsed =
    state.turnStartedAt !== null ? Math.max(0, now - state.turnStartedAt) : 0;
  const endingBanked = endingColor === "white" ? state.whiteMs : state.blackMs;
  const remaining = endingBanked - elapsed;

  // Timeout on turn switch
  if (remaining <= 0) {
    return {
      ...state,
      whiteMs: endingColor === "white" ? 0 : state.whiteMs,
      blackMs: endingColor === "black" ? 0 : state.blackMs,
      status: "flagged",
      running: false,
      flaggedColor: endingColor,
    };
  }

  // Award Fischer increment to ending color
  const newEndingBanked = remaining + state.timeControl.incrementMs;

  return {
    ...state,
    whiteMs: endingColor === "white" ? newEndingBanked : state.whiteMs,
    blackMs: endingColor === "black" ? newEndingBanked : state.blackMs,
    activeColor: nextColor,
    turnStartedAt: now,
    status: "running",
    running: true,
    flaggedColor: null,
    moveCount: updatedMoveCount,
  };
}

/**
 * Pauses a running clock at timestamp `now`.
 * Freezes the active player's remaining time into their banked time.
 */
export function pauseClock(state: ClockState, now: number): ClockState {
  if (
    !state.running ||
    state.status === "flagged" ||
    state.status === "paused"
  ) {
    return state;
  }

  if (state.timeControl.type === "none" || state.timeControl.initialMs <= 0) {
    return {
      ...state,
      running: false,
      status: "paused",
      turnStartedAt: null,
    };
  }

  const elapsed =
    state.turnStartedAt !== null ? Math.max(0, now - state.turnStartedAt) : 0;
  const activeColor = state.activeColor ?? "white";
  const currentBanked = activeColor === "white" ? state.whiteMs : state.blackMs;
  const remaining = currentBanked - elapsed;

  if (remaining <= 0) {
    return {
      ...state,
      whiteMs: activeColor === "white" ? 0 : state.whiteMs,
      blackMs: activeColor === "black" ? 0 : state.blackMs,
      status: "flagged",
      running: false,
      flaggedColor: activeColor,
      turnStartedAt: null,
    };
  }

  return {
    ...state,
    whiteMs: activeColor === "white" ? remaining : state.whiteMs,
    blackMs: activeColor === "black" ? remaining : state.blackMs,
    status: "paused",
    running: false,
    turnStartedAt: null,
  };
}

/**
 * Resumes a paused clock at timestamp `now`.
 */
export function resumeClock(state: ClockState, now: number): ClockState {
  if (
    state.running ||
    state.status === "flagged" ||
    state.activeColor === null
  ) {
    return state;
  }

  return {
    ...state,
    status: "running",
    running: true,
    turnStartedAt: now,
  };
}

/**
 * Adds or deducts time to a specific player's clock (e.g. arbiter adjustment or time handicap).
 */
export function addTime(
  state: ClockState,
  color: "white" | "black",
  additionalMs: number
): ClockState {
  if (state.timeControl.type === "none" || state.timeControl.initialMs <= 0) {
    return state;
  }

  const currentBanked = color === "white" ? state.whiteMs : state.blackMs;
  const newBanked = Math.max(0, currentBanked + additionalMs);

  return {
    ...state,
    whiteMs: color === "white" ? newBanked : state.whiteMs,
    blackMs: color === "black" ? newBanked : state.blackMs,
  };
}

/**
 * Resets the clock to initial state with the specified (or existing) time control.
 */
export function resetClock(timeControl: TimeControl): ClockState {
  return createClockState(timeControl);
}
