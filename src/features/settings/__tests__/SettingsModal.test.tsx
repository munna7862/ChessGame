import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SettingsProvider, SettingsModal } from "../index";
import { PersistenceService } from "../../../domain/persistence/PersistenceService";
import { InMemoryPersistenceAdapter } from "../../../domain/persistence/adapters/InMemoryPersistenceAdapter";
import { SettingsService } from "../../../domain/persistence/settings/SettingsService";

describe("Phase 08 · Sprint 06: SettingsModal Component & Integration (TC-SETUI-01 to TC-SETUI-20)", () => {
  let adapter: InMemoryPersistenceAdapter;
  let persistenceService: PersistenceService;
  let settingsService: SettingsService;

  beforeEach(() => {
    adapter = new InMemoryPersistenceAdapter();
    persistenceService = new PersistenceService({ adapter });
    settingsService = new SettingsService({ persistenceService });
  });

  const renderWithSettings = (ui: React.ReactElement) => {
    return render(
      <SettingsProvider service={settingsService}>{ui}</SettingsProvider>
    );
  };

  it("TC-SETUI-01 & TC-SETUI-02: renders modal when open and triggers onClose via close button", () => {
    const handleClose = vi.fn();

    const { rerender } = renderWithSettings(
      <SettingsModal isOpen={false} onClose={handleClose} />
    );

    expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();

    rerender(
      <SettingsProvider service={settingsService}>
        <SettingsModal isOpen={true} onClose={handleClose} />
      </SettingsProvider>
    );

    expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");

    const closeBtn = screen.getByTestId("btn-close-settings");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("TC-SETUI-03: closes modal when Escape key is pressed", () => {
    const handleClose = vi.fn();
    renderWithSettings(<SettingsModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("TC-SETUI-04: closes modal on backdrop overlay click", () => {
    const handleClose = vi.fn();
    renderWithSettings(<SettingsModal isOpen={true} onClose={handleClose} />);

    const overlay = screen.getByTestId("settings-modal-overlay");
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("TC-SETUI-05: navigates between category tabs", () => {
    renderWithSettings(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    // Default tab is Appearance
    expect(
      screen.getByTestId("settings-section-appearance")
    ).toBeInTheDocument();
    expect(screen.getByTestId("tab-appearance")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to Gameplay
    fireEvent.click(screen.getByTestId("tab-gameplay"));
    expect(screen.getByTestId("settings-section-gameplay")).toBeInTheDocument();
    expect(screen.getByTestId("tab-gameplay")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to Audio & Motion
    fireEvent.click(screen.getByTestId("tab-audio-motion"));
    expect(
      screen.getByTestId("settings-section-audio-motion")
    ).toBeInTheDocument();
    expect(screen.getByTestId("tab-audio-motion")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to AI Engine
    fireEvent.click(screen.getByTestId("tab-engine"));
    expect(screen.getByTestId("settings-section-engine")).toBeInTheDocument();
    expect(screen.getByTestId("tab-engine")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("TC-SETUI-06 & TC-SETUI-07: selects board themes and piece sets in Appearance section", () => {
    renderWithSettings(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    // Select Wood theme
    fireEvent.click(screen.getByTestId("theme-option-wood"));
    expect(settingsService.getSettings().boardTheme).toBe("wood");
    expect(screen.getByTestId("theme-badge-selected-wood")).toBeInTheDocument();

    // Select Ocean theme
    fireEvent.click(screen.getByTestId("theme-option-ocean"));
    expect(settingsService.getSettings().boardTheme).toBe("ocean");
    expect(
      screen.getByTestId("theme-badge-selected-ocean")
    ).toBeInTheDocument();

    // Select Staunton Classic piece set
    fireEvent.click(screen.getByTestId("piece-set-option-classic"));
    expect(settingsService.getSettings().pieceSet).toBe("classic");
    expect(
      screen.getByTestId("piece-set-badge-selected-classic")
    ).toBeInTheDocument();
  });

  it("TC-SETUI-08 to TC-SETUI-11: toggles coordinates, legal moves, last move, and auto-queen in Gameplay section", () => {
    renderWithSettings(
      <SettingsModal isOpen={true} onClose={vi.fn()} defaultTab="gameplay" />
    );

    // Toggle coordinates off
    const coordSwitch = screen.getByTestId("switch-coordinates");
    expect(coordSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(coordSwitch);
    expect(settingsService.getSettings().showCoordinates).toBe(false);
    expect(coordSwitch).toHaveAttribute("aria-checked", "false");

    // Toggle legal moves off
    const movesSwitch = screen.getByTestId("switch-legal-moves");
    expect(movesSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(movesSwitch);
    expect(settingsService.getSettings().showLegalMoves).toBe(false);

    // Toggle last move off
    const lastMoveSwitch = screen.getByTestId("switch-last-move");
    expect(lastMoveSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(lastMoveSwitch);
    expect(settingsService.getSettings().showLastMove).toBe(false);

    // Toggle auto-queen on
    const autoQueenSwitch = screen.getByTestId("switch-auto-queen");
    expect(autoQueenSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(autoQueenSwitch);
    expect(settingsService.getSettings().autoQueen).toBe(true);
  });

  it("TC-SETUI-12 to TC-SETUI-14: manages sound effects, volume slider, and reduced motion in Audio & Motion section", () => {
    renderWithSettings(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="audio_motion"
      />
    );

    // Volume slider
    const volumeSlider = screen.getByTestId("slider-volume");
    fireEvent.change(volumeSlider, { target: { value: "40" } });
    expect(settingsService.getSettings().volume).toBe(40);
    expect(screen.getByTestId("volume-value-badge")).toHaveTextContent("40%");

    // Toggle Sound off
    const soundSwitch = screen.getByTestId("switch-sound");
    fireEvent.click(soundSwitch);
    expect(settingsService.getSettings().soundEnabled).toBe(false);
    expect(screen.getByTestId("volume-value-badge")).toHaveTextContent("Muted");

    // Toggle Reduced Motion on
    const motionSwitch = screen.getByTestId("switch-reduced-motion");
    expect(motionSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(motionSwitch);
    expect(settingsService.getSettings().reducedMotion).toBe(true);
  });

  it("TC-SETUI-15: modifies engine difficulty with live preview in Engine section", () => {
    renderWithSettings(
      <SettingsModal isOpen={true} onClose={vi.fn()} defaultTab="engine" />
    );

    expect(
      screen.getByTestId("engine-difficulty-level-label")
    ).toHaveTextContent("Level 3 – Intermediate");

    const difficultySlider = screen.getByTestId("slider-engine-difficulty");
    fireEvent.change(difficultySlider, { target: { value: "7" } });

    expect(settingsService.getSettings().engineDifficulty).toBe(7);
    expect(
      screen.getByTestId("engine-difficulty-level-label")
    ).toHaveTextContent("Level 7 – Master");
  });

  it("TC-SETUI-16 to TC-SETUI-18: opens confirmation before resetting settings and restores defaults on confirm", async () => {
    // First mutate some settings
    settingsService.updateSettings({
      boardTheme: "wood",
      pieceSet: "modern",
      soundEnabled: false,
      volume: 10,
      engineDifficulty: 8,
    });

    renderWithSettings(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    // Click Reset to Defaults
    const resetBtn = screen.getByTestId("btn-reset-settings");
    fireEvent.click(resetBtn);

    // Reset confirmation modal is shown
    expect(
      screen.getByTestId("reset-settings-confirm-modal")
    ).toBeInTheDocument();

    // Cancel reset first
    const cancelBtn = screen.getByTestId("btn-cancel-reset-settings");
    fireEvent.click(cancelBtn);

    expect(
      screen.queryByTestId("reset-settings-confirm-modal")
    ).not.toBeInTheDocument();
    expect(settingsService.getSettings().boardTheme).toBe("wood");

    // Reopen and confirm reset
    fireEvent.click(resetBtn);
    const confirmBtn = screen.getByTestId("btn-confirm-reset-settings");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(
        screen.queryByTestId("reset-settings-confirm-modal")
      ).not.toBeInTheDocument();
    });

    // All settings restored to defaults
    const current = settingsService.getSettings();
    expect(current.boardTheme).toBe("classic");
    expect(current.pieceSet).toBe("standard");
    expect(current.soundEnabled).toBe(true);
    expect(current.volume).toBe(80);
    expect(current.engineDifficulty).toBe(3);
  });

  it("TC-SETUI-19 & TC-SETUI-20: closes settings modal on Done button click", () => {
    const handleClose = vi.fn();
    renderWithSettings(<SettingsModal isOpen={true} onClose={handleClose} />);

    const doneBtn = screen.getByTestId("btn-done-settings");
    fireEvent.click(doneBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
