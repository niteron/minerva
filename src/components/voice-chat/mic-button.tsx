import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  isRecording: boolean;
  isConnected: boolean;
  onToggle: () => void;
}

export function MicButton({ isRecording, isConnected, onToggle }: MicButtonProps) {
  return (
    <div className="relative">
      {isRecording && (
        <div className="absolute -inset-1 rounded-full bg-emerald-400/25 animate-pulse-ring" />
      )}
      <button
        type="button"
        onClick={onToggle}
        disabled={!isConnected}
        className={`
          relative flex size-16 items-center justify-center rounded-full shadow-lg transition-all duration-200
          ${isRecording
            ? 'bg-white text-slate-900 hover:bg-slate-100'
            : isConnected
              ? 'border border-white/25 bg-white/10 text-white hover:bg-white/15'
              : 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500 shadow-none'
          }
          ${!isConnected && !isRecording ? 'animate-breathe' : ''}
        `}
        aria-label={isRecording ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isRecording ? (
          <Mic className="size-7" strokeWidth={2} />
        ) : (
          <MicOff className="size-7" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
