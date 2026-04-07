import { useState, useCallback, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket.ts';
import { useAudioInput } from '../../hooks/useAudioInput.ts';
import { useAudioOutput } from '../../hooks/useAudioOutput.ts';
import { ConnectionStatus } from './connection-status.tsx';
import { MicButton } from './mic-button.tsx';
import { TranscriptView } from './transcript-view.tsx';
import type { TranscriptEntry } from './types.ts';

function formatCallDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export type VoiceChatProps = {
  runtimeArn?: string;
  agentName?: string;
  agentSubtitle?: string;
  agentInitial?: string;
};

export function VoiceChat({
  runtimeArn,
  agentName = 'Nova',
  agentSubtitle = 'Japanese tutor',
  agentInitial = 'N',
}: VoiceChatProps = {}) {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callElapsedSec, setCallElapsedSec] = useState(0);

  const audioOutput = useAudioOutput();

  const handleTranscript = useCallback((role: string, text: string, isFinal: boolean) => {
    if (role === 'assistant') {
      if (!isFinal) {
        // Non-final: show speaking indicator only (no assistant text yet)
        setIsAssistantSpeaking(true);
        return;
      }
      // Final: clear indicator and append to history
      setIsAssistantSpeaking(false);
    }

    setTranscripts((prev) => {
      const lastIdx = prev.length - 1;
      // Overwrite in-progress entry for the same role (live user transcript)
      if (lastIdx >= 0 && prev[lastIdx].role === role && !prev[lastIdx].isFinal) {
        const updated = [...prev];
        updated[lastIdx] = { ...updated[lastIdx], text, isFinal };
        return updated;
      }
      return [...prev, { role: role as 'user' | 'assistant', text, isFinal, timestamp: Date.now() }];
    });
    setActiveTool(null);
  }, []);

  const handleInterruption = useCallback(() => {
    audioOutput.clearBuffer();
    setActiveTool(null);
  }, [audioOutput]);

  const handleToolUse = useCallback((name: string) => {
    setActiveTool(name);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const ws = useWebSocket({
    onAudio: audioOutput.playAudio,
    onTranscript: handleTranscript,
    onInterruption: handleInterruption,
    onToolUse: handleToolUse,
    onError: handleError,
    runtimeArn,
  });

  const audioInput = useAudioInput({
    onAudioChunk: useCallback(
      (base64: string) => ws.send({ type: 'audio', audio: base64 }),
      [ws],
    ),
  });

  // Initialize audio output when connected
  useEffect(() => {
    if (ws.connectionStatus === 'connected') {
      audioOutput.init();
    }
  }, [ws.connectionStatus, audioOutput]);

  // Stop the mic when disconnected
  useEffect(() => {
    if (ws.connectionStatus === 'disconnected' && audioInput.isRecording) {
      audioInput.stopRecording();
    }
  }, [ws.connectionStatus, audioInput]);

  useEffect(() => {
    if (ws.connectionStatus === 'connected') {
      const t = Date.now();
      setCallStartedAt(t);
      setCallElapsedSec(0);
    } else {
      setCallStartedAt(null);
      setCallElapsedSec(0);
    }
  }, [ws.connectionStatus]);

  useEffect(() => {
    if (callStartedAt === null) return;
    const id = window.setInterval(() => {
      setCallElapsedSec(Math.floor((Date.now() - callStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [callStartedAt]);

  const handleMicToggle = useCallback(() => {
    if (audioInput.isRecording) {
      audioInput.stopRecording();
    } else {
      audioInput.startRecording();
    }
  }, [audioInput]);

  const handleConnect = useCallback(() => {
    if (ws.connectionStatus === 'disconnected') {
      setTranscripts([]);
      setActiveTool(null);
      setError(null);
      ws.connect();
    } else {
      audioInput.stopRecording();
      audioOutput.cleanup();
      ws.disconnect();
    }
  }, [ws, audioInput, audioOutput]);

  const isConnected = ws.connectionStatus === 'connected';
  const status = ws.connectionStatus;

  return (
    <div className="mx-auto flex h-full min-h-[calc(100vh-8rem)] w-full max-w-md flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 shadow-2xl shadow-black/40">
        <div className="flex shrink-0 flex-col items-center gap-2 px-4 pt-6">
          <ConnectionStatus status={status} />
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-2 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex shrink-0 flex-col items-center px-6 pt-8 pb-6">
          <div
            className={`
              relative mb-4 flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 text-4xl font-semibold text-white shadow-xl ring-4 transition-all duration-500
              ${isAssistantSpeaking ? 'ring-emerald-300/60 scale-[1.02]' : 'ring-white/10'}
            `}
            aria-hidden
          >
            {agentInitial}
            {isAssistantSpeaking && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-300/40 animate-ping" />
            )}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">{agentName}</h2>
          <p className="text-sm text-slate-400">{agentSubtitle}</p>
          {isConnected && (
            <p className="mt-3 font-mono text-lg tabular-nums tracking-widest text-slate-200">
              {formatCallDuration(callElapsedSec)}
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
          <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Live captions
          </p>
          <TranscriptView
            entries={transcripts}
            isAssistantSpeaking={isAssistantSpeaking}
            activeTool={activeTool}
          />
        </div>

        <div className="flex shrink-0 items-end justify-center gap-10 border-t border-white/5 bg-slate-950/40 px-6 pb-8 pt-6">
          {status === 'connected' ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <MicButton
                  isRecording={audioInput.isRecording}
                  isConnected={isConnected}
                  onToggle={handleMicToggle}
                />
                <span className="text-[11px] font-medium text-slate-500">
                  {audioInput.isRecording ? 'Mute' : 'Unmute'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleConnect}
                  className="flex size-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                  aria-label="End call"
                >
                  <PhoneOff className="size-7" strokeWidth={2} />
                </button>
                <span className="text-[11px] font-medium text-slate-500">End</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleConnect}
                disabled={status === 'connecting'}
                className={`
                  flex size-20 items-center justify-center rounded-full shadow-lg transition
                  ${status === 'disconnected'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                    : 'cursor-wait bg-slate-600 text-slate-300'
                  }
                `}
                aria-label={status === 'connecting' ? 'Connecting' : 'Start call'}
              >
                {status === 'connecting' ? (
                  <span className="size-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Phone className="size-9" strokeWidth={2} />
                )}
              </button>
              <span className="text-[11px] font-medium text-slate-500">
                {status === 'connecting' ? 'Connecting…' : 'Start call'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
