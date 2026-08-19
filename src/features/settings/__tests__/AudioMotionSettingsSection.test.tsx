import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AudioMotionSettingsSection } from "../components/AudioMotionSettingsSection";
import { SettingsProvider } from "../SettingsContext";
import { soundService } from "../../../services/sound";
import type { PersistedSettings } from "../../../domain/persistence";

const baseSettings: PersistedSettings = {
  boardTheme: "classic",
  pieceSet: "standard",
  showCoordinates: true,
  showLegalMoves: true,
  showLastMove: true,
  soundEnabled: true,
  autoQueen: false,
  engineDifficulty: 3,
  reducedMotion: false,
  volume: 80,
};

describe("Audio & Motion Settings UI Component Tests (TC-SET-01 to TC-SET-04)", () => {
  beforeEach(() => {
    vi.spyOn(soundService, "play").mockImplementation(() => {});
  });

  it("TC-SET-01: Toggling Sound Effects switch updates state and soundService", () => {
    render(
      <SettingsProvider initialSettings={baseSettings}>
        <AudioMotionSettingsSection />
      </SettingsProvider>
    );

    const switchBtn = screen.getByTestId("switch-sound");
    expect(switchBtn).toHaveAttribute("aria-checked", "true");

    fireEvent.click(switchBtn);

    expect(switchBtn).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("volume-value-badge")).toHaveTextContent("Muted");
  });

  it("TC-SET-02: Adjusting Master Volume slider updates volume percentage badge", () => {
    render(
      <SettingsProvider initialSettings={baseSettings}>
        <AudioMotionSettingsSection />
      </SettingsProvider>
    );

    const slider = screen.getByTestId("slider-volume");
    expect(slider).toHaveValue("80");
    expect(screen.getByTestId("volume-value-badge")).toHaveTextContent("80%");

    fireEvent.change(slider, { target: { value: "45" } });

    expect(slider).toHaveValue("45");
    expect(screen.getByTestId("volume-value-badge")).toHaveTextContent("45%");
  });

  it("TC-SET-03: Toggling Reduced Motion switch updates state", () => {
    render(
      <SettingsProvider initialSettings={baseSettings}>
        <AudioMotionSettingsSection />
      </SettingsProvider>
    );

    const motionSwitch = screen.getByTestId("switch-reduced-motion");
    expect(motionSwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.click(motionSwitch);

    expect(motionSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("TC-SET-04: Clicking sound audition buttons triggers sound playback", () => {
    render(
      <SettingsProvider initialSettings={baseSettings}>
        <AudioMotionSettingsSection />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByTestId("btn-test-sound-move"));
    expect(soundService.play).toHaveBeenCalledWith("move");

    fireEvent.click(screen.getByTestId("btn-test-sound-capture"));
    expect(soundService.play).toHaveBeenCalledWith("capture");

    fireEvent.click(screen.getByTestId("btn-test-sound-check"));
    expect(soundService.play).toHaveBeenCalledWith("check");

    fireEvent.click(screen.getByTestId("btn-test-sound-castle"));
    expect(soundService.play).toHaveBeenCalledWith("castle");

    fireEvent.click(screen.getByTestId("btn-test-sound-promotion"));
    expect(soundService.play).toHaveBeenCalledWith("promotion");

    fireEvent.click(screen.getByTestId("btn-test-sound-gameover"));
    expect(soundService.play).toHaveBeenCalledWith("gameOver");
  });

  it("Audition buttons are disabled when sound is disabled", () => {
    render(
      <SettingsProvider
        initialSettings={{ ...baseSettings, soundEnabled: false }}
      >
        <AudioMotionSettingsSection />
      </SettingsProvider>
    );

    expect(screen.getByTestId("btn-test-sound-move")).toBeDisabled();
    expect(screen.getByTestId("btn-test-sound-capture")).toBeDisabled();
    expect(screen.getByTestId("btn-test-sound-check")).toBeDisabled();
  });
});
