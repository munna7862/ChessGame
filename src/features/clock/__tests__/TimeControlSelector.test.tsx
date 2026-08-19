import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeControlSelector } from "../TimeControlSelector";
import { TIME_CONTROL_PRESETS } from "../../../domain/clock/timeControl";
import type { TimeControl } from "../../../domain/clock/types";

describe("TimeControlSelector Component (TC-CLK-UI-09 to TC-CLK-UI-16)", () => {
  const defaultTc: TimeControl = TIME_CONTROL_PRESETS.find(
    (p) => p.type === "blitz"
  )!;

  it("TC-CLK-UI-09: renders Bullet presets and fires onChange when selected", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const bulletBtn = screen.getByTestId("preset-1---0--bullet-");
    fireEvent.click(bulletBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "bullet",
        initialMs: 60_000,
        incrementMs: 0,
      })
    );
  });

  it("TC-CLK-UI-10: renders Blitz presets (3+0, 3+2, 5+0, 5+3)", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const blitz32Btn = screen.getByTestId("preset-3---2--blitz-");
    fireEvent.click(blitz32Btn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "blitz",
        initialMs: 180_000,
        incrementMs: 2000,
      })
    );
  });

  it("TC-CLK-UI-11: renders Rapid and Classical presets (10+0, 10+5, 15+10, 30+0)", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const rapid105Btn = screen.getByTestId("preset-10---5--rapid-");
    fireEvent.click(rapid105Btn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "rapid",
        initialMs: 600_000,
        incrementMs: 5000,
      })
    );

    const classicalBtn = screen.getByTestId("preset-30---0--classical-");
    fireEvent.click(classicalBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "classical",
        initialMs: 1800_000,
        incrementMs: 0,
      })
    );
  });

  it("TC-CLK-UI-12: allows selecting Untimed (Unlimited) mode", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const untimedBtn = screen.getByTestId("preset-unlimited--untimed-");
    fireEvent.click(untimedBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "none",
        initialMs: 0,
        incrementMs: 0,
      })
    );
  });

  it("TC-CLK-UI-13: allows opening custom mode and entering valid custom minutes and seconds", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const customToggle = screen.getByTestId("toggle-custom-time-control");
    fireEvent.click(customToggle);

    expect(screen.getByTestId("custom-time-inputs-panel")).toBeInTheDocument();

    const minInput = screen.getByTestId("input-custom-minutes");
    const incInput = screen.getByTestId("input-custom-increment");

    fireEvent.change(minInput, { target: { value: "7" } });
    fireEvent.change(incInput, { target: { value: "3" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        initialMs: 420_000, // 7 min
        incrementMs: 3000, // 3s
      })
    );
  });

  it("TC-CLK-UI-14: displays validation error for negative numbers or invalid values", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const customToggle = screen.getByTestId("toggle-custom-time-control");
    fireEvent.click(customToggle);

    const minInput = screen.getByTestId("input-custom-minutes");
    fireEvent.change(minInput, { target: { value: "-5" } });

    expect(
      screen.getByTestId("custom-time-validation-error")
    ).toHaveTextContent("Please enter non-negative integer numbers.");
  });

  it("TC-CLK-UI-15: rejects 0 base time with 0 increment and prompts for Unlimited preset", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const customToggle = screen.getByTestId("toggle-custom-time-control");
    fireEvent.click(customToggle);

    const minInput = screen.getByTestId("input-custom-minutes");
    const secInput = screen.getByTestId("input-custom-seconds");
    const incInput = screen.getByTestId("input-custom-increment");

    fireEvent.change(minInput, { target: { value: "0" } });
    fireEvent.change(secInput, { target: { value: "0" } });
    fireEvent.change(incInput, { target: { value: "0" } });

    expect(
      screen.getByTestId("custom-time-validation-error")
    ).toHaveTextContent("Initial time and increment cannot both be 0");
  });

  it("TC-CLK-UI-16: rejects base minutes exceeding 180 minutes", () => {
    const handleChange = vi.fn();
    render(<TimeControlSelector value={defaultTc} onChange={handleChange} />);

    const customToggle = screen.getByTestId("toggle-custom-time-control");
    fireEvent.click(customToggle);

    const minInput = screen.getByTestId("input-custom-minutes");
    fireEvent.change(minInput, { target: { value: "200" } });

    expect(
      screen.getByTestId("custom-time-validation-error")
    ).toHaveTextContent("Base minutes cannot exceed 180 minutes.");
  });
});
