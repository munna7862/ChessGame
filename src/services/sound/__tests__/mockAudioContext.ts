import { vi } from "vitest";

export interface MockAudioParam {
  value: number;
  setValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
}

export function createMockAudioParam(initialValue = 1): MockAudioParam {
  const param = {
    value: initialValue,
    setValueAtTime: vi.fn((val: number) => {
      param.value = val;
    }),
    exponentialRampToValueAtTime: vi.fn((val: number) => {
      param.value = val;
    }),
    linearRampToValueAtTime: vi.fn((val: number) => {
      param.value = val;
    }),
  };
  return param;
}

export interface MockAudioNode {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

export interface MockOscillatorNode extends MockAudioNode {
  type: OscillatorType;
  frequency: MockAudioParam;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}

export interface MockGainNode extends MockAudioNode {
  gain: MockAudioParam;
}

export interface MockBiquadFilterNode extends MockAudioNode {
  type: BiquadFilterType;
  frequency: MockAudioParam;
  Q: MockAudioParam;
}

export interface MockBufferSourceNode extends MockAudioNode {
  buffer: AudioBuffer | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}

export class MockAudioContext {
  public currentTime = 0;
  public sampleRate = 44100;
  public state: AudioContextState = "running";
  public destination: MockAudioNode = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  public resume = vi.fn().mockImplementation(async () => {
    this.state = "running";
  });

  public suspend = vi.fn().mockImplementation(async () => {
    this.state = "suspended";
  });

  public close = vi.fn().mockImplementation(async () => {
    this.state = "closed";
  });

  public createOscillator = vi.fn((): MockOscillatorNode => ({
    type: "sine",
    frequency: createMockAudioParam(440),
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }));

  public createGain = vi.fn((): MockGainNode => ({
    gain: createMockAudioParam(1),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  public createBiquadFilter = vi.fn((): MockBiquadFilterNode => ({
    type: "lowpass",
    frequency: createMockAudioParam(1000),
    Q: createMockAudioParam(1),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  public createBuffer = vi.fn(
    (_channels: number, length: number, sampleRate: number): AudioBuffer => {
      const channelData = new Float32Array(length);
      return {
        numberOfChannels: 1,
        length,
        sampleRate,
        duration: length / sampleRate,
        getChannelData: vi.fn(() => channelData),
        copyFromChannel: vi.fn(),
        copyToChannel: vi.fn(),
      } as unknown as AudioBuffer;
    }
  );

  public createBufferSource = vi.fn((): MockBufferSourceNode => ({
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }));
}
