import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SettingsProvider, useSettings } from "../index";
import { PersistenceService } from "../../../domain/persistence/PersistenceService";
import { InMemoryPersistenceAdapter } from "../../../domain/persistence/adapters/InMemoryPersistenceAdapter";
import { SettingsService } from "../../../domain/persistence/settings/SettingsService";

const TestSettingsConsumer: React.FC = () => {
  const {
    settings,
    setBoardTheme,
    setEngineDifficulty,
    setSoundEnabled,
    setVolume,
    resetSettings,
  } = useSettings();

  return (
    <div>
      <span data-testid="current-theme">{settings.boardTheme}</span>
      <span data-testid="current-difficulty">{settings.engineDifficulty}</span>
      <span data-testid="current-sound">
        {settings.soundEnabled ? "sound-on" : "sound-off"}
      </span>
      <span data-testid="current-volume">{settings.volume}</span>

      <button
        type="button"
        data-testid="btn-set-wood"
        onClick={() => setBoardTheme("wood")}
      >
        Set Wood
      </button>
      <button
        type="button"
        data-testid="btn-set-diff-8"
        onClick={() => setEngineDifficulty(8)}
      >
        Set Diff 8
      </button>
      <button
        type="button"
        data-testid="btn-toggle-sound"
        onClick={() => setSoundEnabled(!settings.soundEnabled)}
      >
        Toggle Sound
      </button>
      <button
        type="button"
        data-testid="btn-set-vol-25"
        onClick={() => setVolume(25)}
      >
        Set Volume 25
      </button>
      <button
        type="button"
        data-testid="btn-reset"
        onClick={() => resetSettings()}
      >
        Reset
      </button>
    </div>
  );
};

describe("Phase 08 · Sprint 05: useSettings & SettingsProvider (TC-SET-16 to TC-SET-17)", () => {
  let adapter: InMemoryPersistenceAdapter;
  let persistenceService: PersistenceService;

  beforeEach(() => {
    adapter = new InMemoryPersistenceAdapter();
    persistenceService = new PersistenceService({ adapter });
  });

  it("TC-SET-16: provides reactive settings context and mutates preferences through helper methods", () => {
    const service = new SettingsService({ persistenceService });

    render(
      <SettingsProvider service={service}>
        <TestSettingsConsumer />
      </SettingsProvider>
    );

    // Initial default values rendered
    expect(screen.getByTestId("current-theme")).toHaveTextContent("classic");
    expect(screen.getByTestId("current-difficulty")).toHaveTextContent("3");
    expect(screen.getByTestId("current-sound")).toHaveTextContent("sound-on");
    expect(screen.getByTestId("current-volume")).toHaveTextContent("80");

    // Click Set Wood
    fireEvent.click(screen.getByTestId("btn-set-wood"));
    expect(screen.getByTestId("current-theme")).toHaveTextContent("wood");

    // Click Set Diff 8
    fireEvent.click(screen.getByTestId("btn-set-diff-8"));
    expect(screen.getByTestId("current-difficulty")).toHaveTextContent("8");

    // Toggle sound
    fireEvent.click(screen.getByTestId("btn-toggle-sound"));
    expect(screen.getByTestId("current-sound")).toHaveTextContent("sound-off");

    // Set volume 25
    fireEvent.click(screen.getByTestId("btn-set-vol-25"));
    expect(screen.getByTestId("current-volume")).toHaveTextContent("25");

    // Reset settings
    fireEvent.click(screen.getByTestId("btn-reset"));
    expect(screen.getByTestId("current-theme")).toHaveTextContent("classic");
    expect(screen.getByTestId("current-difficulty")).toHaveTextContent("3");
    expect(screen.getByTestId("current-sound")).toHaveTextContent("sound-on");
    expect(screen.getByTestId("current-volume")).toHaveTextContent("80");
  });

  it("TC-SET-17: throws a descriptive error when useSettings is used outside SettingsProvider", () => {
    // Suppress React boundary console error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestSettingsConsumer />)).toThrow(
      "useSettings must be used within a <SettingsProvider>"
    );

    consoleSpy.mockRestore();
  });
});
