import React from "react";
import type { Color } from "../../domain/chess/types";
import type { TimeControl } from "../../domain/clock/types";
import { formatTimeRemaining } from "../../domain/clock/timeControl";
import "./ClockDisplay.css";

export interface ClockDisplayProps {
  /** The player color ('w' or 'b') */
  readonly color: Color;
  /** Remaining time in milliseconds */
  readonly timeRemainingMs: number;
  /** Whether this clock is currently active/ticking */
  readonly isActive: boolean;
  /** The time control configuration */
  readonly timeControl?: TimeControl | undefined;
  /** Whether the game is over */
  readonly isGameOver?: boolean | undefined;
  /** Custom class name */
  readonly className?: string | undefined;
}

/** Low-time threshold in milliseconds (20 seconds) */
export const LOW_TIME_THRESHOLD_MS = 20_000;

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  color,
  timeRemainingMs,
  isActive,
  timeControl,
  isGameOver = false,
  className = "",
}) => {
  const isUntimed =
    timeControl?.type === "none" || (timeControl && timeControl.initialMs <= 0);
  const safeMs = Math.max(0, timeRemainingMs);
  const isExpired = !isUntimed && safeMs === 0;
  const isLowTime =
    !isUntimed && !isExpired && safeMs < LOW_TIME_THRESHOLD_MS && !isGameOver;

  const colorLabel = color === "w" ? "White" : "Black";
  const formattedTime = isUntimed
    ? "∞"
    : formatTimeRemaining(safeMs, { showTenthsBelowMs: 10_000 });

  // Generate accessible description
  const getAccessibleLabel = (): string => {
    if (isUntimed) {
      return `${colorLabel} clock: Unlimited time`;
    }
    if (isExpired) {
      return `${colorLabel} clock: Time expired (0:00.0)`;
    }
    const seconds = Math.floor(safeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    const lowTimeNote = isLowTime ? " (Low Time)" : "";

    if (safeMs < 10_000) {
      const tenths = Math.floor((safeMs % 1000) / 100);
      return `${colorLabel} clock: ${remSeconds}.${tenths} seconds remaining${lowTimeNote}`;
    }

    if (minutes > 0) {
      return `${colorLabel} clock: ${minutes} minute${minutes !== 1 ? "s" : ""} ${remSeconds} second${
        remSeconds !== 1 ? "s" : ""
      } remaining${lowTimeNote}`;
    }

    return `${colorLabel} clock: ${remSeconds} seconds remaining${lowTimeNote}`;
  };

  const statusClassNames = [
    "clock-display",
    `clock-display--${color === "w" ? "white" : "black"}`,
    isActive ? "clock-display--active" : "clock-display--inactive",
    isLowTime ? "clock-display--low-time" : "",
    isExpired ? "clock-display--expired" : "",
    isUntimed ? "clock-display--untimed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={statusClassNames}
      role="timer"
      aria-label={getAccessibleLabel()}
      aria-live="off"
      data-testid={`clock-display-${color}`}
      data-active={isActive}
      data-low-time={isLowTime}
      data-expired={isExpired}
      data-untimed={isUntimed}
    >
      <div className="clock-display__inner">
        {/* Status badges */}
        <div className="clock-display__indicators" aria-hidden="true">
          {isActive && !isGameOver && (
            <span
              className="clock-display__active-badge"
              data-testid={`clock-active-badge-${color}`}
            >
              <span className="clock-display__pulse-dot" />
              Active
            </span>
          )}

          {isLowTime && (
            <span
              className="clock-display__low-badge"
              data-testid={`clock-low-badge-${color}`}
              title="Low time remaining"
            >
              ⚠️ LOW
            </span>
          )}

          {isExpired && (
            <span
              className="clock-display__flag-badge"
              data-testid={`clock-flag-badge-${color}`}
              title="Time expired"
            >
              🚩 FLAGGED
            </span>
          )}

          {isUntimed && (
            <span
              className="clock-display__untimed-badge"
              data-testid={`clock-untimed-badge-${color}`}
            >
              Untimed
            </span>
          )}
        </div>

        {/* Digital Time text */}
        <div className="clock-display__time-row">
          <span
            className="clock-display__time"
            data-testid={`clock-time-${color}`}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};
