import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioInput } from './useAudioInput.ts';

describe('useAudioInput', () => {
  it('starts not recording', () => {
    const onAudioChunk = vi.fn();
    const { result } = renderHook(() => useAudioInput({ onAudioChunk }));

    expect(result.current.isRecording).toBe(false);
  });

  it('sets isRecording true after startRecording', async () => {
    const onAudioChunk = vi.fn();
    const { result } = renderHook(() => useAudioInput({ onAudioChunk }));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
  });

  it('sets isRecording false after stopRecording', async () => {
    const onAudioChunk = vi.fn();
    const { result } = renderHook(() => useAudioInput({ onAudioChunk }));

    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.isRecording).toBe(true);

    act(() => {
      result.current.stopRecording();
    });
    expect(result.current.isRecording).toBe(false);
  });
});
