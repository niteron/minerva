"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAudioInput } from "../../hooks/useAudioInput";
import { useAudioOutput } from "../../hooks/useAudioOutput";
import type { TranscriptEntry } from "./types";
import { Agent, AgentContent } from "@/components/ai-elements/agent";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Persona, type PersonaState } from "@/components/ai-elements/persona";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatCallDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function connectionLabel(
  status: "disconnected" | "connecting" | "connected"
): string {
  if (status === "disconnected") return "Not in call";
  if (status === "connecting") return "Calling…";
  return "In call";
}

function personaStateForSession(
  status: "disconnected" | "connecting" | "connected",
  isAssistantSpeaking: boolean,
  isRecording: boolean
): PersonaState {
  if (status === "connecting") return "thinking";
  if (status === "disconnected") return "idle";
  if (isAssistantSpeaking) return "speaking";
  if (isRecording) return "listening";
  return "idle";
}

export type VoiceChatProps = {
  runtimeArn?: string;
  agentName?: string;
  agentSubtitle?: string;
  agentInitial?: string;
};

export function VoiceChat({
  runtimeArn,
  agentName = "Nova Legal",
  agentSubtitle = "Legal assessment agent",
  agentInitial = "N",
}: VoiceChatProps = {}) {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callElapsedSec, setCallElapsedSec] = useState(0);

  const audioOutput = useAudioOutput();

  const handleTranscript = useCallback(
    (role: string, text: string, isFinal: boolean) => {
      if (role === "assistant") {
        if (!isFinal) {
          setIsAssistantSpeaking(true);
          return;
        }
        setIsAssistantSpeaking(false);
      }

      setTranscripts((prev) => {
        const lastIdx = prev.length - 1;
        if (
          lastIdx >= 0 &&
          prev[lastIdx].role === role &&
          !prev[lastIdx].isFinal
        ) {
          const updated = [...prev];
          updated[lastIdx] = { ...updated[lastIdx], text, isFinal };
          return updated;
        }
        return [
          ...prev,
          {
            role: role as "user" | "assistant",
            text,
            isFinal,
            timestamp: Date.now(),
          },
        ];
      });
      setActiveTool(null);
    },
    []
  );

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
      (base64: string) => ws.send({ type: "audio", audio: base64 }),
      [ws]
    ),
  });

  useEffect(() => {
    if (ws.connectionStatus === "connected") {
      audioOutput.init();
    }
  }, [ws.connectionStatus, audioOutput]);

  useEffect(() => {
    if (ws.connectionStatus === "disconnected" && audioInput.isRecording) {
      audioInput.stopRecording();
    }
  }, [ws.connectionStatus, audioInput]);

  useEffect(() => {
    if (ws.connectionStatus === "connected") {
      setCallStartedAt(Date.now());
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
    if (ws.connectionStatus === "disconnected") {
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

  const status = ws.connectionStatus;
  const isConnected = status === "connected";

  const personaState = useMemo(
    () =>
      personaStateForSession(
        status,
        isAssistantSpeaking,
        audioInput.isRecording
      ),
    [status, isAssistantSpeaking, audioInput.isRecording]
  );

  const showEmpty =
    transcripts.length === 0 &&
    !isAssistantSpeaking &&
    !activeTool;

  return (
    <div className="mx-auto grid h-full min-h-[calc(100vh-8rem)] w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="flex min-h-0 flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Call Persona & Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-6 pt-6">
          <div className="flex flex-col items-center justify-center gap-4 px-2 py-4">
            <Persona
              state={personaState}
              variant="opal"
              className="size-44 shrink-0 sm:size-48"
            />
            <div className="space-y-1 text-center">
              <div className="font-medium text-sm leading-tight">{agentName}</div>
              <p className="text-balance text-muted-foreground text-xs">
                {agentSubtitle}
              </p>
              <p className="text-muted-foreground text-xs">Persona: {agentInitial}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground text-xs">Status</p>
              <p className="mt-1 font-medium text-sm">{connectionLabel(status)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground text-xs">Call timer</p>
              <p className="mt-1 font-mono text-sm tabular-nums">
                {isConnected ? formatCallDuration(callElapsedSec) : "00:00"}
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-center gap-6 border-t pt-6">
          {status === "connected" ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant={audioInput.isRecording ? "default" : "outline"}
                  className="size-14 rounded-full"
                  disabled={!isConnected}
                  onClick={handleMicToggle}
                  aria-label={
                    audioInput.isRecording
                      ? "Mute microphone"
                      : "Unmute microphone"
                  }
                >
                  {audioInput.isRecording ? (
                    <Mic className="size-6" strokeWidth={2} aria-hidden />
                  ) : (
                    <MicOff className="size-6" strokeWidth={2} aria-hidden />
                  )}
                </Button>
                <span className="text-muted-foreground text-xs">
                  {audioInput.isRecording ? "Mute" : "Unmute"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-14 rounded-full"
                  onClick={handleConnect}
                  aria-label="End call"
                >
                  <PhoneOff className="size-6" strokeWidth={2} />
                </Button>
                <span className="text-muted-foreground text-xs">End</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                size="icon"
                className="size-16 rounded-full"
                disabled={status === "connecting"}
                onClick={handleConnect}
                aria-label={
                  status === "connecting" ? "Connecting" : "Start call"
                }
              >
                {status === "connecting" ? (
                  <span
                    className="size-8 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
                    aria-hidden
                  />
                ) : (
                  <Phone className="size-8" strokeWidth={2} />
                )}
              </Button>
              <span className="text-muted-foreground text-xs">
                {status === "connecting" ? "Connecting…" : "Start call"}
              </span>
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      <Agent className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b p-3">
          <div className="min-w-0">
            <div className="font-medium text-sm leading-tight">{agentName} Chat</div>
            <p className="truncate text-muted-foreground text-xs">Live conversation</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {connectionLabel(status)}
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mx-3 mt-3 shrink-0 rounded-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AgentContent className="flex min-h-0 flex-1 flex-col space-y-0 p-0">
          <Conversation className="relative min-h-0 flex-1">
            <ConversationContent className="gap-4">
              {showEmpty && (
                <ConversationEmptyState
                  title="No messages yet"
                  description="Unmute and describe your legal issue to begin your assessment."
                />
              )}

              {transcripts.map((entry, i) => (
                <Message
                  key={`${entry.timestamp}-${i}`}
                  from={entry.role === "user" ? "user" : "assistant"}
                >
                  <MessageContent
                    className={cn(!entry.isFinal && "opacity-70")}
                  >
                    <p className="whitespace-pre-wrap">{entry.text}</p>
                  </MessageContent>
                </Message>
              ))}

              {isAssistantSpeaking && (
                <Message from="assistant">
                  <MessageContent>
                    <span className="inline-flex gap-1" aria-hidden>
                      <span className="size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </span>
                  </MessageContent>
                </Message>
              )}

              {activeTool && (
                <Message from="assistant">
                  <MessageContent>
                    <p className="text-muted-foreground text-sm">
                      Using {activeTool}…
                    </p>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </AgentContent>
      </Agent>

    </div>
  );
}
