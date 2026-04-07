"use client";

import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import { VoiceChat } from '@/components/voice-chat';

type AgentSessionGateProps = {
  runtimeArn?: string;
  agentName?: string;
  agentSubtitle?: string;
  agentInitial?: string;
};

export function AgentSessionGate({
  runtimeArn,
  agentName,
  agentSubtitle,
  agentInitial,
}: AgentSessionGateProps) {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchAuthSession();
      } catch {
        // VoiceChat connect surfaces credential errors if needed.
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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/30 py-24">
        <span
          className="size-8 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-primary"
          aria-hidden
        />
        <p className="text-muted-foreground text-sm">Joining meeting…</p>
      </div>
    );
  }

  return (
    <VoiceChat
      runtimeArn={runtimeArn}
      agentName={agentName}
      agentSubtitle={agentSubtitle}
      agentInitial={agentInitial}
    />
  );
}
