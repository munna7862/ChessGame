import { useState, useEffect, useRef, useCallback } from "react";
import type { Color } from "../../domain/chess/types";
import type {
  ClockStatus,
  TimeControl,
  TimeProvider,
} from "../../domain/clock/types";
import { ClockController } from "../../domain/clock/ClockController";
import { TIME_CONTROL_PRESETS } from "../../domain/clock/timeControl";

export interface UseClockOptions {
  /** Initial or configured TimeControl (defaults to Unlimited) */
  readonly timeControl?: TimeControl | undefined;
  /** Injectable time provider (defaults to SystemTimeProvider) */
  readonly timeProvider?: TimeProvider | undefined;
  /** Callback fired when a player flags / times out */
  readonly onTimeout?: ((timedOutColor: Color) => void) | undefined;
}

export interface UseClockReturn {
  /** Active time control */
  readonly timeControl: TimeControl;
  /** Milliseconds remaining for White */
  readonly whiteRemainingMs: number;
  /** Milliseconds remaining for Black */
  readonly blackRemainingMs: number;
  /** Active turn on the clock ('w' | 'b') */
  readonly activeColor: Color;
  /** Whether the clock is currently ticking */
  readonly isRunning: boolean;
  /** Clock status ('idle' | 'ready' | 'running' | 'paused' | 'flagged') */
  readonly status: ClockStatus;
  /** Starts the clock for the given player */
  readonly startClock: (color?: Color) => void;
  /** Pauses the ticking clock */
  readonly pauseClock: () => void;
  /** Resumes the paused clock */
  readonly resumeClock: () => void;
  /** Switches turn to the other player and applies increment */
  readonly switchTurn: () => void;
  /** Resets the clock to initial state with optional new TimeControl */
  readonly resetClock: (newTimeControl?: TimeControl) => void;
  /** Adds bonus time to a player */
  readonly addTime: (color: Color, ms: number) => void;
  /** Force check for timeout */
  readonly checkTimeout: () => void;
}

export function useClock(options: UseClockOptions = {}): UseClockReturn {
  const {
    timeControl = TIME_CONTROL_PRESETS.find((p) => p.type === "none") ?? {
      type: "none",
      initialMs: 0,
      incrementMs: 0,
      label: "Unlimited",
    },
    timeProvider,
    onTimeout,
  } = options;

  // Stable clock controller instance created once via lazy state initializer
  const [controller] = useState(
    () => new ClockController(timeControl, timeProvider)
  );

  // Local state for UI updates
  const [clockState, setClockState] = useState(() => controller.getState());
  const [remainingTimes, setRemainingTimes] = useState(() =>
    controller.getRemainingTime()
  );

  // Keep onTimeout callback ref stable
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe((nextState) => {
      setClockState(nextState);
      setRemainingTimes(controller.getRemainingTime());
    });
    return unsubscribe;
  }, [controller]);

  // Update time provider if injected prop changes
  useEffect(() => {
    if (timeProvider) {
      controller.setTimeProvider(timeProvider);
    }
  }, [controller, timeProvider]);

  // Sync timeControl changes from external session updates
  const prevTimeControlRef = useRef<TimeControl>(timeControl);
  useEffect(() => {
    if (prevTimeControlRef.current !== timeControl) {
      prevTimeControlRef.current = timeControl;
      controller.reset(timeControl);
      setClockState(controller.getState());
      setRemainingTimes(controller.getRemainingTime());
    }
  }, [controller, timeControl]);

  // Interval ticker for visual rendering when clock is running
  useEffect(() => {
    if (
      clockState.status !== "running" ||
      clockState.timeControl.type === "none"
    ) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = controller.getRemainingTime();
      setRemainingTimes(remaining);

      // Check timeout
      const flagInfo = controller.isFlagged();
      if (flagInfo.flagged && flagInfo.flaggedColor) {
        controller.checkTimeout();
        const timedOutChessColor: Color =
          flagInfo.flaggedColor === "white" ? "w" : "b";
        onTimeoutRef.current?.(timedOutChessColor);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [clockState.status, clockState.timeControl.type, controller]);

  const startClock = useCallback(
    (color: Color = "w") => {
      controller.start(color === "w" ? "white" : "black");
    },
    [controller]
  );

  const pauseClock = useCallback(() => {
    controller.pause();
  }, [controller]);

  const resumeClock = useCallback(() => {
    controller.resume();
  }, [controller]);

  const switchTurn = useCallback(() => {
    controller.switchTurn();
  }, [controller]);

  const resetClock = useCallback(
    (newTimeControl?: TimeControl) => {
      controller.reset(newTimeControl);
      setRemainingTimes(controller.getRemainingTime());
    },
    [controller]
  );

  const addTime = useCallback(
    (color: Color, ms: number) => {
      controller.addTime(color === "w" ? "white" : "black", ms);
      setRemainingTimes(controller.getRemainingTime());
    },
    [controller]
  );

  const checkTimeout = useCallback(() => {
    const flagInfo = controller.isFlagged();
    if (flagInfo.flagged && flagInfo.flaggedColor) {
      controller.checkTimeout();
      const timedOutChessColor: Color =
        flagInfo.flaggedColor === "white" ? "w" : "b";
      onTimeoutRef.current?.(timedOutChessColor);
    }
  }, [controller]);

  const activeColor: Color = clockState.activeColor === "white" ? "w" : "b";

  return {
    timeControl: clockState.timeControl,
    whiteRemainingMs: remainingTimes.whiteMs,
    blackRemainingMs: remainingTimes.blackMs,
    activeColor,
    isRunning: clockState.status === "running",
    status: clockState.status,
    startClock,
    pauseClock,
    resumeClock,
    switchTurn,
    resetClock,
    addTime,
    checkTimeout,
  };
}
