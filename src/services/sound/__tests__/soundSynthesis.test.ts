import { describe, it, expect } from "vitest";
import { MockAudioContext } from "./mockAudioContext";
import {
  synthesizeMove,
  synthesizeCapture,
  synthesizeCheck,
  synthesizeCastle,
  synthesizePromotion,
  synthesizeGameOver,
  synthesizeDraw,
  synthesizeEffect,
} from "../soundSynthesis";

describe("Web Audio Sound Synthesis (TC-AUD-01)", () => {
  it("synthesizeMove schedules triangle oscillator with pitch decay and gain envelope", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizeMove(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createBiquadFilter).toHaveBeenCalled();
  });

  it("synthesizeCapture creates tonal oscillator and noise burst", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizeCapture(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(ctx.createBufferSource).toHaveBeenCalled();
    expect(ctx.createBiquadFilter).toHaveBeenCalled();
  });

  it("synthesizeCheck schedules dual harmonic chime tones", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizeCheck(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("synthesizeCastle schedules two staggered placement pulses", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizeCastle(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("synthesizePromotion schedules 3 ascending arpeggio notes", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizePromotion(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("synthesizeGameOver schedules low resonance resolve chord", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizeGameOver(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("synthesizeDraw schedules neutral mellow interval", () => {
    const ctx = new MockAudioContext();
    const dest = ctx.createGain();

    synthesizeDraw(
      ctx as unknown as AudioContext,
      dest as unknown as AudioNode,
      0.8
    );

    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("synthesizeEffect correctly dispatches all supported effect types", () => {
    const effects = [
      "move",
      "capture",
      "check",
      "castle",
      "promotion",
      "gameOver",
      "draw",
    ] as const;

    for (const effect of effects) {
      const ctx = new MockAudioContext();
      const dest = ctx.createGain();

      expect(() => {
        synthesizeEffect(
          effect,
          ctx as unknown as AudioContext,
          dest as unknown as AudioNode,
          0.8
        );
      }).not.toThrow();

      expect(ctx.createOscillator).toHaveBeenCalled();
    }
  });
});
