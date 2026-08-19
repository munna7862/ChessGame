import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClockDisplay, LOW_TIME_THRESHOLD_MS } from "../ClockDisplay";
import type { TimeControl } from "../../../domain/clock/types";

describe("ClockDisplay Component (TC-CLK-UI-01 to TC-CLK-UI-08)", () => {
  const blitzTimeControl: TimeControl = {
    type: "blitz",
    initialMs: 3 * 60 * 1000,
    incrementMs: 2000,
    label: "3 + 2",
  };

  const unlimitedTimeControl: TimeControl = {
    type: "none",
    initialMs: 0,
    incrementMs: 0,
    label: "Unlimited",
  };

  it("TC-CLK-UI-01: renders standard digital time formatted as MM:SS (>= 10s)", () => {
    render(
      <ClockDisplay
        color="w"
        timeRemainingMs={180_000}
        isActive={false}
        timeControl={blitzTimeControl}
      />
    );

    const timeElement = screen.getByTestId("clock-time-w");
    expect(timeElement).toHaveTextContent("3:00");
  });

  it("TC-CLK-UI-02: renders tenths of a second precision in sub-10s scramble (< 10s)", () => {
    render(
      <ClockDisplay
        color="b"
        timeRemainingMs={9_450}
        isActive={true}
        timeControl={blitzTimeControl}
      />
    );

    const timeElement = screen.getByTestId("clock-time-b");
    expect(timeElement).toHaveTextContent("0:09.4");
  });

  it("TC-CLK-UI-03: renders HH:MM:SS format for classical durations >= 1 hour", () => {
    render(
      <ClockDisplay
        color="w"
        timeRemainingMs={3_725_000} // 1h 2m 5s
        isActive={false}
        timeControl={{
          type: "classical",
          initialMs: 3600_000,
          incrementMs: 0,
          label: "60 + 0",
        }}
      />
    );

    const timeElement = screen.getByTestId("clock-time-w");
    expect(timeElement).toHaveTextContent("1:02:05");
  });

  it("TC-CLK-UI-04: renders active clock visual state and pulse badge when isActive={true}", () => {
    render(
      <ClockDisplay
        color="w"
        timeRemainingMs={120_000}
        isActive={true}
        timeControl={blitzTimeControl}
      />
    );

    const container = screen.getByTestId("clock-display-w");
    expect(container).toHaveClass("clock-display--active");
    expect(container).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("clock-active-badge-w")).toBeInTheDocument();
  });

  it("TC-CLK-UI-05: renders inactive styling when isActive={false}", () => {
    render(
      <ClockDisplay
        color="b"
        timeRemainingMs={120_000}
        isActive={false}
        timeControl={blitzTimeControl}
      />
    );

    const container = screen.getByTestId("clock-display-b");
    expect(container).toHaveClass("clock-display--inactive");
    expect(container).toHaveAttribute("data-active", "false");
    expect(
      screen.queryByTestId("clock-active-badge-b")
    ).not.toBeInTheDocument();
  });

  it("TC-CLK-UI-06: renders non-color low-time warning badge and attributes when remaining time < 20s", () => {
    render(
      <ClockDisplay
        color="w"
        timeRemainingMs={LOW_TIME_THRESHOLD_MS - 1000} // 19s
        isActive={true}
        timeControl={blitzTimeControl}
      />
    );

    const container = screen.getByTestId("clock-display-w");
    expect(container).toHaveClass("clock-display--low-time");
    expect(container).toHaveAttribute("data-low-time", "true");

    // Non-color badge verification
    const lowBadge = screen.getByTestId("clock-low-badge-w");
    expect(lowBadge).toBeInTheDocument();
    expect(lowBadge).toHaveTextContent("⚠️ LOW");
  });

  it("TC-CLK-UI-07: renders expired state and flagged badge when remaining time is 0", () => {
    render(
      <ClockDisplay
        color="b"
        timeRemainingMs={0}
        isActive={false}
        timeControl={blitzTimeControl}
      />
    );

    const container = screen.getByTestId("clock-display-b");
    expect(container).toHaveClass("clock-display--expired");
    expect(container).toHaveAttribute("data-expired", "true");

    const timeElement = screen.getByTestId("clock-time-b");
    expect(timeElement).toHaveTextContent("0:00.0");

    const flagBadge = screen.getByTestId("clock-flag-badge-b");
    expect(flagBadge).toBeInTheDocument();
    expect(flagBadge).toHaveTextContent("🚩 FLAGGED");
  });

  it("TC-CLK-UI-08: provides accessible role=timer, descriptive aria-label, and untimed status", () => {
    const { rerender } = render(
      <ClockDisplay
        color="w"
        timeRemainingMs={150_000} // 2m 30s
        isActive={true}
        timeControl={blitzTimeControl}
      />
    );

    const timerElement = screen.getByRole("timer");
    expect(timerElement).toHaveAttribute(
      "aria-label",
      "White clock: 2 minutes 30 seconds remaining"
    );
    expect(timerElement).toHaveAttribute("aria-live", "off");

    // Untimed mode
    rerender(
      <ClockDisplay
        color="b"
        timeRemainingMs={0}
        isActive={false}
        timeControl={unlimitedTimeControl}
      />
    );

    expect(screen.getByTestId("clock-time-b")).toHaveTextContent("∞");
    expect(screen.getByTestId("clock-untimed-badge-b")).toHaveTextContent(
      "Untimed"
    );
    expect(screen.getByRole("timer")).toHaveAttribute(
      "aria-label",
      "Black clock: Unlimited time"
    );
  });
});
