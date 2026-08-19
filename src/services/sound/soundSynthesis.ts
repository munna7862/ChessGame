import type { SoundEffectType } from "./types";

/**
 * Generate a short white noise buffer for percussive impact synthesis.
 */
function createNoiseBuffer(
  ctx: AudioContext,
  durationSeconds = 0.05
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    // Decaying white noise
    const decay = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  return buffer;
}

/**
 * Helper to safely schedule exponential ramp avoiding 0 or negative values.
 */
function safeExponentialRamp(
  param: AudioParam,
  targetValue: number,
  endTime: number,
  startTime: number
): void {
  const safeTarget = Math.max(0.0001, targetValue);
  try {
    param.setValueAtTime(param.value || 0.0001, startTime);
    param.exponentialRampToValueAtTime(safeTarget, endTime);
  } catch {
    // Fallback to linear ramp if exponential ramp fails
    try {
      param.linearRampToValueAtTime(safeTarget, endTime);
    } catch {
      param.setValueAtTime(safeTarget, endTime);
    }
  }
}

/**
 * Synthesize standard quiet move sound: crisp wooden board tap.
 */
export function synthesizeMove(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;
  const duration = 0.06;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.2, now);

  osc.type = "triangle";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + duration);

  const peakGain = Math.max(0.0001, 0.75 * masterGain);
  gain.gain.setValueAtTime(peakGain, now);
  safeExponentialRamp(gain.gain, 0.001, now + duration, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + duration + 0.01);

  osc.onended = () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

/**
 * Synthesize piece capture sound: snappy percussive impact with resonance.
 */
export function synthesizeCapture(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;
  const duration = 0.085;

  // 1. Tonal low-mid impact
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + duration);

  const peakGain = Math.max(0.0001, 0.85 * masterGain);
  oscGain.gain.setValueAtTime(peakGain, now);
  safeExponentialRamp(oscGain.gain, 0.001, now + duration, now);

  osc.connect(oscGain);
  oscGain.connect(destination);

  // 2. Snappy noise burst
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.04);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(1800, now);
  noiseFilter.Q.setValueAtTime(1.5, now);

  const noiseGain = ctx.createGain();
  const noisePeak = Math.max(0.0001, 0.45 * masterGain);
  noiseGain.gain.setValueAtTime(noisePeak, now);
  safeExponentialRamp(noiseGain.gain, 0.001, now + 0.04, now);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(destination);

  osc.start(now);
  noise.start(now);
  osc.stop(now + duration + 0.01);
  noise.stop(now + 0.05);

  osc.onended = () => {
    osc.disconnect();
    oscGain.disconnect();
    noise.disconnect();
    noiseFilter.disconnect();
    noiseGain.disconnect();
  };
}

/**
 * Synthesize check warning sound: urgent dual-tone harmonic chime.
 */
export function synthesizeCheck(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;

  // Tone 1: A4 (440 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(440, now);
  gain1.gain.setValueAtTime(Math.max(0.0001, 0.6 * masterGain), now);
  safeExponentialRamp(gain1.gain, 0.001, now + 0.14, now);
  osc1.connect(gain1);
  gain1.connect(destination);

  // Tone 2: E5 (659.25 Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(659.25, now + 0.05);
  gain2.gain.setValueAtTime(Math.max(0.0001, 0.7 * masterGain), now + 0.05);
  safeExponentialRamp(gain2.gain, 0.001, now + 0.22, now + 0.05);
  osc2.connect(gain2);
  gain2.connect(destination);

  osc1.start(now);
  osc1.stop(now + 0.15);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.23);

  osc2.onended = () => {
    osc1.disconnect();
    gain1.disconnect();
    osc2.disconnect();
    gain2.disconnect();
  };
}

/**
 * Synthesize castling sound: dual staggered wooden placement clacks.
 */
export function synthesizeCastle(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;

  // Pulse 1 (King placement)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(320, now);
  osc1.frequency.exponentialRampToValueAtTime(120, now + 0.05);
  gain1.gain.setValueAtTime(Math.max(0.0001, 0.7 * masterGain), now);
  safeExponentialRamp(gain1.gain, 0.001, now + 0.05, now);
  osc1.connect(gain1);
  gain1.connect(destination);

  // Pulse 2 (Rook placement)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(290, now + 0.045);
  osc2.frequency.exponentialRampToValueAtTime(100, now + 0.1);
  gain2.gain.setValueAtTime(Math.max(0.0001, 0.75 * masterGain), now + 0.045);
  safeExponentialRamp(gain2.gain, 0.001, now + 0.1, now + 0.045);
  osc2.connect(gain2);
  gain2.connect(destination);

  osc1.start(now);
  osc1.stop(now + 0.06);
  osc2.start(now + 0.045);
  osc2.stop(now + 0.11);

  osc2.onended = () => {
    osc1.disconnect();
    gain1.disconnect();
    osc2.disconnect();
    gain2.disconnect();
  };
}

/**
 * Synthesize pawn promotion sound: ascending triumphant major triad.
 */
export function synthesizePromotion(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, time: 0.0, dur: 0.08, gain: 0.55 }, // C5
    { freq: 659.25, time: 0.06, dur: 0.08, gain: 0.65 }, // E5
    { freq: 783.99, time: 0.12, dur: 0.16, gain: 0.8 }, // G5
  ];

  const nodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(n.freq, now + n.time);
    gain.gain.setValueAtTime(
      Math.max(0.0001, n.gain * masterGain),
      now + n.time
    );
    safeExponentialRamp(gain.gain, 0.001, now + n.time + n.dur, now + n.time);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur + 0.01);
    nodes.push({ osc, gain });
  }

  const last = nodes[nodes.length - 1];
  if (last) {
    last.osc.onended = () => {
      for (const { osc, gain } of nodes) {
        osc.disconnect();
        gain.disconnect();
      }
    };
  }
}

/**
 * Synthesize game over sound: deep resonant resolve chord.
 */
export function synthesizeGameOver(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;
  const duration = 0.45;

  const frequencies = [146.83, 220.0, 293.66]; // D3, A3, D4
  const nodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  for (const freq of frequencies) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    const peak = Math.max(0.0001, (0.7 / frequencies.length) * masterGain);
    gain.gain.setValueAtTime(peak, now);
    safeExponentialRamp(gain.gain, 0.001, now + duration, now);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
    nodes.push({ osc, gain });
  }

  const first = nodes[0];
  if (first) {
    first.osc.onended = () => {
      for (const { osc, gain } of nodes) {
        osc.disconnect();
        gain.disconnect();
      }
    };
  }
}

/**
 * Synthesize stalemate / draw sound: mellow neutral fifth interval.
 */
export function synthesizeDraw(
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  const now = ctx.currentTime;
  const duration = 0.25;

  const frequencies = [261.63, 392.0]; // C4, G4
  const nodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  for (const freq of frequencies) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    const peak = Math.max(0.0001, 0.35 * masterGain);
    gain.gain.setValueAtTime(peak, now);
    safeExponentialRamp(gain.gain, 0.001, now + duration, now);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
    nodes.push({ osc, gain });
  }

  const first = nodes[0];
  if (first) {
    first.osc.onended = () => {
      for (const { osc, gain } of nodes) {
        osc.disconnect();
        gain.disconnect();
      }
    };
  }
}

/**
 * Master dispatcher for procedural sound effects.
 */
export function synthesizeEffect(
  effect: SoundEffectType,
  ctx: AudioContext,
  destination: AudioNode,
  masterGain: number
): void {
  switch (effect) {
    case "move":
      synthesizeMove(ctx, destination, masterGain);
      break;
    case "capture":
      synthesizeCapture(ctx, destination, masterGain);
      break;
    case "check":
      synthesizeCheck(ctx, destination, masterGain);
      break;
    case "castle":
      synthesizeCastle(ctx, destination, masterGain);
      break;
    case "promotion":
      synthesizePromotion(ctx, destination, masterGain);
      break;
    case "gameOver":
      synthesizeGameOver(ctx, destination, masterGain);
      break;
    case "draw":
      synthesizeDraw(ctx, destination, masterGain);
      break;
  }
}
