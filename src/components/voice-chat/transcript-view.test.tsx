import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TranscriptView } from './transcript-view';
import type { TranscriptEntry } from './types';

describe('TranscriptView', () => {
  it('shows placeholder when there are no entries', () => {
    render(<TranscriptView entries={[]} isAssistantSpeaking={false} activeTool={null} />);
    expect(screen.getByText('Unmute and describe your legal issue to begin your assessment')).toBeInTheDocument();
  });

  it('renders user messages', () => {
    const entries: TranscriptEntry[] = [
      { role: 'user', text: 'Hello', isFinal: true, timestamp: Date.now() },
    ];
    render(<TranscriptView entries={entries} isAssistantSpeaking={false} activeTool={null} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders assistant messages', () => {
    const entries: TranscriptEntry[] = [
      { role: 'assistant', text: 'Happy to help', isFinal: true, timestamp: Date.now() },
    ];
    render(<TranscriptView entries={entries} isAssistantSpeaking={false} activeTool={null} />);
    expect(screen.getByText('Happy to help')).toBeInTheDocument();
  });

  it('shows active tool line', () => {
    render(<TranscriptView entries={[]} isAssistantSpeaking={false} activeTool="get_current_time" />);
    expect(screen.getByText('Using get_current_time…')).toBeInTheDocument();
  });

  it('renders a multi-turn conversation', () => {
    const entries: TranscriptEntry[] = [
      { role: 'user', text: 'What time is it?', isFinal: true, timestamp: 1 },
      { role: 'assistant', text: 'It is 3 p.m.', isFinal: true, timestamp: 2 },
    ];
    render(<TranscriptView entries={entries} isAssistantSpeaking={false} activeTool={null} />);
    expect(screen.getByText('What time is it?')).toBeInTheDocument();
    expect(screen.getByText('It is 3 p.m.')).toBeInTheDocument();
  });

  it('applies opacity-60 to non-final entries', () => {
    const entries: TranscriptEntry[] = [
      { role: 'user', text: 'Still typing...', isFinal: false, timestamp: Date.now() },
    ];
    render(<TranscriptView entries={entries} isAssistantSpeaking={false} activeTool={null} />);
    const el = screen.getByText('Still typing...');
    expect(el.className).toContain('opacity-60');
  });
});
