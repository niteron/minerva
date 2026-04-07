import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioOutput } from './useAudioOutput.ts';

describe('useAudioOutput', () => {
  it('creates AudioContext on init', async () => {
    const { result } = renderHook(() => useAudioOutput());

    await act(async () => {
      await result.current.init();
    });

    // Second init is a no-op (idempotent)
    await act(async () => {
      await result.current.init();
    });
  });

  it('skips playAudio safely before init', () => {
    const { result } = renderHook(() => useAudioOutput());

    // No AudioContext yet — should not throw
    act(() => {
      result.current.playAudio('AAAA');
    });
  });

  it('skips clearBuffer safely before init', () => {
    const { result } = renderHook(() => useAudioOutput());

    act(() => {
      result.current.clearBuffer();
    });
  });

  it('allows cleanup', async () => {
    const { result } = renderHook(() => useAudioOutput());

    await act(async () => {
      await result.current.init();
    });

    act(() => {
      result.current.cleanup();
    });
  });
});
