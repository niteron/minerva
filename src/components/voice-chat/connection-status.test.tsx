import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from './connection-status.tsx';

describe('ConnectionStatus', () => {
  it('shows disconnected', () => {
    render(<ConnectionStatus status="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows connecting', () => {
    render(<ConnectionStatus status="connecting" />);
    expect(screen.getByText('Connecting…')).toBeInTheDocument();
  });

  it('shows connected', () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});
