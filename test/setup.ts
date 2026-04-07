import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

Element.prototype.scrollTo = function () {};

class MockAudioBufferSourceNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  connect() { return this; }
  disconnect() {}
  start() {}
  stop() {}
}

class MockAudioBuffer {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  duration: number;
  private channelData: Float32Array;

  constructor(options: { numberOfChannels: number; length: number; sampleRate: number }) {
    this.numberOfChannels = options.numberOfChannels;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.duration = options.length / options.sampleRate;
    this.channelData = new Float32Array(options.length);
  }
  getChannelData() { return this.channelData; }
}

class MockAudioWorkletNode {
  port = {
    onmessage: null as ((event: MessageEvent) => void) | null,
    postMessage: () => {},
  };
  connect() { return this; }
  disconnect() {}
}

class MockAudioContext {
  sampleRate = 48000;
  currentTime = 0;
  state = 'running';
  destination = {};
  audioWorklet = {
    addModule: async () => {},
  };
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer({ numberOfChannels: channels, length, sampleRate });
  }
  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }
  createMediaStreamSource() {
    return { connect: () => ({}) };
  }
}

Object.defineProperty(globalThis, 'AudioContext', { value: MockAudioContext });
Object.defineProperty(globalThis, 'AudioWorkletNode', { value: MockAudioWorkletNode });

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: async () => ({
      getTracks: () => [{ stop: () => {} }],
    }),
  },
});

URL.createObjectURL = () => 'blob:mock';
URL.revokeObjectURL = () => {};
