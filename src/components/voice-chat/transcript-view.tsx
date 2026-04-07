import { useRef, useEffect } from 'react';
import type { TranscriptEntry } from './types';

interface TranscriptViewProps {
  entries: TranscriptEntry[];
  isAssistantSpeaking: boolean;
  activeTool: string | null;
}

export function TranscriptView({ entries, isAssistantSpeaking, activeTool }: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries, isAssistantSpeaking, activeTool]);

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-white/10 bg-black/25 px-3 py-3 backdrop-blur-sm"
    >
      {entries.length === 0 && !isAssistantSpeaking && !activeTool && (
        <p className="text-center text-sm text-slate-500 mt-8 px-4">
          Unmute and describe your legal issue to begin your assessment
        </p>
      )}

      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[90%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed
                ${entry.role === 'user'
                  ? 'rounded-br-md bg-sky-500/90 text-white'
                  : 'rounded-bl-md border border-white/10 bg-white/10 text-slate-100'
                }
                ${!entry.isFinal ? 'opacity-60' : ''}
              `}
            >
              {entry.text}
            </div>
          </div>
        ))}

        {isAssistantSpeaking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/10 px-4 py-3">
              <span className="size-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="size-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="size-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {activeTool && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400">
              Using {activeTool}…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
