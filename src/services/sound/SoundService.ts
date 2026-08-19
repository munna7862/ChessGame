import type {
  ISoundService,
  SoundEffectType,
  SoundPlayOptions,
  SoundServiceConfig,
} from "./types";
import { synthesizeEffect } from "./soundSynthesis";

/**
 * Get native AudioContext constructor across browser environments.
 */
function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  return AudioCtx ?? null;
}

/**
 * SoundService provides procedural, low-latency, offline audio feedback
 * via the Web Audio API with zero external asset dependencies.
 */
export class SoundService implements ISoundService {
  private soundEnabled: boolean;
  private volume: number; // 0 to 100
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private readonly audioContextFactory?: (() => AudioContext | null) | undefined;

  constructor(config: SoundServiceConfig = {}) {
    this.soundEnabled = config.soundEnabled ?? true;
    this.volume = Math.max(0, Math.min(100, config.volume ?? 80));
    this.audioContextFactory = config.audioContextFactory;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.masterGainNode && this.audioContext) {
      const targetGain = this.volume / 100;
      try {
        this.masterGainNode.gain.setValueAtTime(
          targetGain,
          this.audioContext.currentTime
        );
      } catch {
        this.masterGainNode.gain.value = targetGain;
      }
    }
  }

  /**
   * Internal helper to retrieve or initialize the shared AudioContext.
   */
  private getOrCreateAudioContext(): AudioContext | null {
    if (this.audioContext && this.audioContext.state !== "closed") {
      return this.audioContext;
    }

    try {
      if (this.audioContextFactory) {
        this.audioContext = this.audioContextFactory();
      } else {
        const Ctor = getAudioContextConstructor();
        if (Ctor) {
          this.audioContext = new Ctor();
        }
      }

      if (this.audioContext) {
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.value = this.volume / 100;
        this.masterGainNode.connect(this.audioContext.destination);
      }
    } catch {
      this.audioContext = null;
      this.masterGainNode = null;
    }

    return this.audioContext;
  }

  /**
   * Unlock and resume the AudioContext upon user gesture.
   */
  public async unlock(): Promise<void> {
    const ctx = this.getOrCreateAudioContext();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Ignore resume failures (e.g. headless tests)
      }
    }
  }

  /**
   * Play a procedural chess sound effect.
   */
  public play(effect: SoundEffectType, options: SoundPlayOptions = {}): void {
    if (!this.soundEnabled || this.volume <= 0) {
      return;
    }

    try {
      const ctx = this.getOrCreateAudioContext();
      if (!ctx || ctx.state === "closed") {
        return;
      }

      // Resume if suspended
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {});
      }

      const multiplier = options.volumeMultiplier ?? 1.0;
      const effectiveGain = Math.max(
        0,
        Math.min(1, (this.volume / 100) * multiplier)
      );

      if (effectiveGain <= 0.0001) {
        return;
      }

      // Route directly through destination or master gain
      const destination = this.masterGainNode ?? ctx.destination;
      synthesizeEffect(effect, ctx, destination, multiplier);
    } catch {
      // Audio failures must never interrupt UI or chess logic
    }
  }

  /**
   * Close AudioContext and clean up nodes.
   */
  public async dispose(): Promise<void> {
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        if (this.masterGainNode) {
          this.masterGainNode.disconnect();
          this.masterGainNode = null;
        }
        await this.audioContext.close();
      } catch {
        // Ignore errors during disposal
      } finally {
        this.audioContext = null;
      }
    }
  }
}

/**
 * Global singleton sound service instance.
 */
export const soundService = new SoundService();

/**
 * Factory function for creating isolated sound service instances (e.g. for tests).
 */
export function createSoundService(config?: SoundServiceConfig): ISoundService {
  return new SoundService(config);
}
