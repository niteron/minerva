import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Navigate, useParams } from 'react-router-dom';

import { getAgentById } from '@/lib/agents.ts';
import { VoiceChat } from '@/components/voice-chat/index.tsx';

export function AgentCallPage() {
  const { id } = useParams();
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

  if (!id) {
    return <Navigate to="/agents" replace />;
  }

  const agent = getAgentById(id);
  if (!agent) {
    return <Navigate to="/agents" replace />;
  }

  if (!sessionReady) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <span
          className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400"
          aria-hidden
        />
        <p className="text-slate-400 text-sm">Connecting to agent…</p>
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
