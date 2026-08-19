import { describe, it, expect, beforeEach } from "vitest";
import { MockAudioContext } from "./mockAudioContext";
import { createSoundService } from "../SoundService";

describe("SoundService Unit & Invariant Tests (TC-AUD-01 to TC-AUD-04)", () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
  });

  it("TC-AUD-01: Initializes with default volume (80) and sound enabled (true)", () => {
    const service = createSoundService({
      audioContextFactory: () => mockCtx as unknown as AudioContext,
    });

    expect(service.isSoundEnabled()).toBe(true);
    expect(service.getVolume()).toBe(80);
  });

  it("TC-AUD-02: Mute invariant: does not play sound or create oscillators when soundEnabled is false", () => {
    const service = createSoundService({
      soundEnabled: false,
      volume: 80,
      audioContextFactory: () => mockCtx as unknown as AudioContext,
    });

    service.play("move");

    expect(mockCtx.createOscillator).not.toHaveBeenCalled();

    service.setSoundEnabled(true);
    service.play("move");
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it("TC-AUD-03: Volume attenuation: does not create audio when volume is 0 and clamps volume 0..100", () => {
    const service = createSoundService({
      soundEnabled: true,
      volume: 0,
      audioContextFactory: () => mockCtx as unknown as AudioContext,
    });

    service.play("move");
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();

    service.setVolume(50);
    expect(service.getVolume()).toBe(50);
    service.play("move");
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    service.setVolume(150);
    expect(service.getVolume()).toBe(100);

    service.setVolume(-20);
    expect(service.getVolume()).toBe(0);
  });

  it("TC-AUD-04: Audio resilience: gracefully handles null AudioContext or exceptions without throwing", () => {
    const brokenService = createSoundService({
      audioContextFactory: () => {
        throw new Error("AudioContext blocked by autoplay policy");
      },
    });

    expect(() => {
      brokenService.play("capture");
    }).not.toThrow();

    const nullService = createSoundService({
      audioContextFactory: () => null,
    });

    expect(() => {
      nullService.play("check");
    }).not.toThrow();
  });

  it("unlock() resumes suspended AudioContext", async () => {
    mockCtx.state = "suspended";
    const service = createSoundService({
      audioContextFactory: () => mockCtx as unknown as AudioContext,
    });

    await service.unlock();
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  it("dispose() closes AudioContext and cleans up master gain node", async () => {
    const service = createSoundService({
      audioContextFactory: () => mockCtx as unknown as AudioContext,
    });

    service.play("move");
    await service.dispose();

    expect(mockCtx.close).toHaveBeenCalled();
  });
});
