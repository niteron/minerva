import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MicButton } from './mic-button';

describe('MicButton', () => {
  it('is clickable when connected', () => {
    const onToggle = vi.fn();
    render(<MicButton isRecording={false} isConnected={true} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('is disabled when disconnected', () => {
    const onToggle = vi.fn();
    render(<MicButton isRecording={false} isConnected={false} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('uses mute label while recording', () => {
    render(<MicButton isRecording={true} isConnected={true} onToggle={() => {}} />);
    expect(screen.getByLabelText('Mute microphone')).toBeInTheDocument();
  });

  it('uses unmute label when not recording', () => {
    render(<MicButton isRecording={false} isConnected={true} onToggle={() => {}} />);
    expect(screen.getByLabelText('Unmute microphone')).toBeInTheDocument();
  });
});
