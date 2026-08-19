import React, { useState, useId } from "react";
import type { TimeControl, TimeControlType } from "../../domain/clock/types";
import {
  TIME_CONTROL_PRESETS,
  createTimeControl,
  formatTimeControl,
} from "../../domain/clock/timeControl";
import "./TimeControlSelector.css";

export interface TimeControlSelectorProps {
  readonly value: TimeControl;
  readonly onChange: (timeControl: TimeControl) => void;
  readonly disabled?: boolean | undefined;
}

interface CustomFormState {
  minutes: string;
  seconds: string;
  increment: string;
}

export const TimeControlSelector: React.FC<TimeControlSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const baseMinutesId = useId();
  const baseSecondsId = useId();
  const incrementId = useId();

  // Check if current value matches one of the standard presets
  const matchingPresetIndex = TIME_CONTROL_PRESETS.findIndex(
    (p) =>
      p.type === value.type &&
      p.initialMs === value.initialMs &&
      p.incrementMs === value.incrementMs
  );

  const isPresetMatch = matchingPresetIndex !== -1;
  const [isCustomMode, setIsCustomMode] = useState<boolean>(
    !isPresetMatch && value.type !== "none"
  );

  // Derive initial custom fields from current value
  const [customForm, setCustomForm] = useState<CustomFormState>(() => {
    const totalSec = Math.floor(value.initialMs / 1000);
    return {
      minutes: Math.floor(totalSec / 60).toString(),
      seconds: (totalSec % 60).toString(),
      increment: Math.floor(value.incrementMs / 1000).toString(),
    };
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Group presets by type
  const presetGroups: {
    title: string;
    type: TimeControlType;
    items: readonly TimeControl[];
  }[] = [
    {
      title: "Bullet",
      type: "bullet",
      items: TIME_CONTROL_PRESETS.filter((p) => p.type === "bullet"),
    },
    {
      title: "Blitz",
      type: "blitz",
      items: TIME_CONTROL_PRESETS.filter((p) => p.type === "blitz"),
    },
    {
      title: "Rapid",
      type: "rapid",
      items: TIME_CONTROL_PRESETS.filter((p) => p.type === "rapid"),
    },
    {
      title: "Classical",
      type: "classical",
      items: TIME_CONTROL_PRESETS.filter((p) => p.type === "classical"),
    },
    {
      title: "Untimed",
      type: "none",
      items: TIME_CONTROL_PRESETS.filter((p) => p.type === "none"),
    },
  ];

  const handleSelectPreset = (preset: TimeControl) => {
    setIsCustomMode(false);
    setValidationError(null);
    onChange(preset);
  };

  const handleCustomChange = (field: keyof CustomFormState, rawVal: string) => {
    const nextForm = { ...customForm, [field]: rawVal };
    setCustomForm(nextForm);
    validateAndApplyCustom(nextForm);
  };

  const validateAndApplyCustom = (form: CustomFormState) => {
    const mins = parseInt(form.minutes, 10);
    const secs = parseInt(form.seconds || "0", 10);
    const inc = parseInt(form.increment || "0", 10);

    if (
      isNaN(mins) ||
      mins < 0 ||
      isNaN(secs) ||
      secs < 0 ||
      isNaN(inc) ||
      inc < 0
    ) {
      setValidationError("Please enter non-negative integer numbers.");
      return;
    }

    if (mins > 180) {
      setValidationError("Base minutes cannot exceed 180 minutes.");
      return;
    }

    if (secs > 59) {
      setValidationError("Base seconds must be between 0 and 59.");
      return;
    }

    if (inc > 60) {
      setValidationError("Increment cannot exceed 60 seconds.");
      return;
    }

    if (mins === 0 && secs === 0 && inc === 0) {
      setValidationError(
        "Initial time and increment cannot both be 0. Select Unlimited for untimed games."
      );
      return;
    }

    setValidationError(null);
    const totalMinutes = mins + secs / 60;
    const customTc = createTimeControl(totalMinutes, inc);
    onChange(customTc);
  };

  const handleToggleCustom = () => {
    setIsCustomMode(true);
    validateAndApplyCustom(customForm);
  };

  return (
    <div className="time-control-selector" data-testid="time-control-selector">
      <div className="time-control-selector__header">
        <label className="form-label">Time Control</label>
        <span
          className="time-control-selector__active-summary"
          data-testid="selected-tc-summary"
        >
          {formatTimeControl(value)} ({value.type})
        </span>
      </div>

      {/* Preset Groups */}
      <div
        className="time-control-selector__groups"
        role="radiogroup"
        aria-label="Preset time controls"
      >
        {presetGroups.map((group) => (
          <div key={group.type} className="time-control-group">
            <span className="time-control-group__title">{group.title}</span>
            <div className="time-control-group__items">
              {group.items.map((preset) => {
                const isSelected =
                  !isCustomMode &&
                  preset.type === value.type &&
                  preset.initialMs === value.initialMs &&
                  preset.incrementMs === value.incrementMs;
                const label = preset.label ?? formatTimeControl(preset);

                return (
                  <button
                    key={label}
                    type="button"
                    className={`time-preset-btn ${isSelected ? "time-preset-btn--selected" : ""}`}
                    data-testid={`preset-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    role="radio"
                    aria-checked={isSelected}
                    disabled={disabled}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Time Control Section */}
      <div className="time-control-custom-section">
        <button
          type="button"
          className={`time-preset-btn time-preset-btn--custom ${isCustomMode ? "time-preset-btn--selected" : ""}`}
          data-testid="toggle-custom-time-control"
          role="radio"
          aria-checked={isCustomMode}
          disabled={disabled}
          onClick={handleToggleCustom}
        >
          ⚙️ Custom Time Control
        </button>

        {isCustomMode && (
          <div
            className="custom-time-inputs"
            data-testid="custom-time-inputs-panel"
          >
            <div className="custom-time-input-group">
              <label htmlFor={baseMinutesId} className="custom-time-label">
                Minutes
              </label>
              <input
                id={baseMinutesId}
                type="number"
                min="0"
                max="180"
                className={`form-input custom-input ${validationError ? "form-input--error" : ""}`}
                data-testid="input-custom-minutes"
                value={customForm.minutes}
                onChange={(e) => handleCustomChange("minutes", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="custom-time-input-group">
              <label htmlFor={baseSecondsId} className="custom-time-label">
                Seconds
              </label>
              <input
                id={baseSecondsId}
                type="number"
                min="0"
                max="59"
                className="form-input custom-input"
                data-testid="input-custom-seconds"
                value={customForm.seconds}
                onChange={(e) => handleCustomChange("seconds", e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="custom-time-input-group">
              <label htmlFor={incrementId} className="custom-time-label">
                Increment (s)
              </label>
              <input
                id={incrementId}
                type="number"
                min="0"
                max="60"
                className="form-input custom-input"
                data-testid="input-custom-increment"
                value={customForm.increment}
                onChange={(e) =>
                  handleCustomChange("increment", e.target.value)
                }
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {isCustomMode && validationError && (
          <div
            className="custom-time-error"
            data-testid="custom-time-validation-error"
            role="alert"
          >
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
};
