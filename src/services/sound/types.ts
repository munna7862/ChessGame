/**
 * Supported procedural chess sound effect types.
 */
export type SoundEffectType =
  "move" | "capture" | "check" | "castle" | "promotion" | "gameOver" | "draw";

/**
 * Options for playing a sound effect.
 */
export interface SoundPlayOptions {
  /**
   * Optional custom volume multiplier (0..1) for this specific playback.
   */
  readonly volumeMultiplier?: number;
}

/**
 * Audio service configuration.
 */
export interface SoundServiceConfig {
  readonly soundEnabled?: boolean;
  readonly volume?: number; // 0 to 100
  readonly audioContextFactory?: () => AudioContext | null;
}

/**
 * Interface contract for the procedural Sound Service.
 */
export interface ISoundService {
  /**
   * Play a specific chess sound effect.
   */
  play(effect: SoundEffectType, options?: SoundPlayOptions): void;

  /**
   * Enable or disable all sound playback.
   */
  setSoundEnabled(enabled: boolean): void;

  /**
   * Set master volume (0 to 100).
   */
  setVolume(volume: number): void;

  /**
   * Current sound enabled state.
   */
  isSoundEnabled(): boolean;

  /**
   * Current master volume percentage (0 to 100).
   */
  getVolume(): number;

  /**
   * Unlock or resume AudioContext after user gesture.
   */
  unlock(): Promise<void>;

  /**
   * Tear down audio nodes and close AudioContext.
   */
  dispose(): Promise<void>;
}
