'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import type { Agent } from '@/lib/agents';
import { VoiceChat } from '@/components/voice-chat';

export function AgentCallPage({ agent }: { agent: Agent }) {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchAuthSession();
      } catch {
        /* VoiceChat connect will surface credential errors */
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!sessionReady) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <span
          className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400"
          aria-hidden
        />
        <p className="text-slate-400 text-sm">Preparing legal assessment session…</p>
      </div>
    );
  }

  return (
    <VoiceChat
      runtimeArn={agent.runtimeArn}
      agentName={agent.name}
      agentSubtitle={agent.subtitle}
      agentInitial={agent.initial}
    />
  );
}
