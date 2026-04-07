"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquareText,
} from "lucide-react";
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
  if (status === "connecting") return "Connecting…";
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
    <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col bg-muted/40">
      {/* Meeting title bar (Teams-style) */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-card px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon-sm" className="shrink-0" asChild>
            <Link href="/agents" aria-label="Back to agents">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-semibold text-foreground text-sm leading-tight sm:text-base">
              {agentName}
            </h1>
            <p className="truncate text-muted-foreground text-xs">{agentSubtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isConnected && (
            <span className="hidden font-mono text-muted-foreground text-xs tabular-nums sm:inline">
              {formatCallDuration(callElapsedSec)}
            </span>
          )}
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="max-w-[9rem] truncate text-xs"
          >
            {connectionLabel(status)}
          </Badge>
        </div>
      </div>

      <div className="flex min-h-0 min-h-[420px] flex-1 flex-col lg:flex-row">
        {/* Main stage */}
        <div className="relative flex min-h-[320px] min-w-0 flex-1 flex-col bg-card text-card-foreground lg:min-h-0">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
            <Persona
              state={personaState}
              variant="opal"
              className="size-40 shrink-0 sm:size-52"
            />
            <div className="text-center">
              <p className="font-medium text-sm sm:text-base">{agentName}</p>
              <p className="mt-0.5 text-muted-foreground text-xs">{agentSubtitle}</p>
            </div>

            {/* Participant chips (Teams-style roster hint) */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                  "bg-muted/70 ring-1 ring-border"
                )}
              >
                <span className="font-medium">You</span>
                <span className="text-muted-foreground">
                  {audioInput.isRecording ? "Mic on" : "Mic off"}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                  "bg-muted/70 ring-1 ring-border",
                  isAssistantSpeaking && "ring-2 ring-emerald-400/60"
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-md bg-muted font-semibold text-[10px]">
                  {agentInitial}
                </span>
                <span className="font-medium">{agentName}</span>
                {isAssistantSpeaking && (
                  <span className="text-emerald-300">Speaking</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat pane (Teams right rail) */}
        <Agent className="flex min-h-0 w-full min-w-0 flex-col border-t bg-background lg:w-[380px] lg:shrink-0 lg:border-t-0 lg:border-l">
          <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5">
            <MessageSquareText className="size-4 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="font-medium text-sm">Meeting chat</p>
              <p className="text-muted-foreground text-xs">Messages in this session</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mx-3 mt-3 shrink-0 rounded-md">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AgentContent className="flex min-h-0 flex-1 flex-col space-y-0 p-0">
            <Conversation className="relative min-h-0 min-h-[200px] flex-1 overflow-y-auto lg:min-h-0">
              <ConversationContent className="gap-3 px-3 py-3 sm:gap-4 sm:px-4">
                {showEmpty && (
                  <ConversationEmptyState
                    title="No messages yet"
                    description="Unmute your mic and speak to start the conversation."
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

      {/* Bottom control bar (Teams-style) */}
      <div className="flex shrink-0 justify-center border-t bg-card px-3 py-3 sm:px-4 sm:py-4">
        <div
          className={cn(
            "flex w-full max-w-xl items-center justify-center gap-2 rounded-2xl px-3 py-2.5 sm:gap-4 sm:px-5",
            "bg-background/95 text-foreground shadow-lg ring-1 ring-border backdrop-blur"
          )}
        >
          {status === "connected" ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className={cn(
                  "size-12 rounded-full border-0 sm:size-14",
                  audioInput.isRecording
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
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
              <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="size-12 rounded-full sm:size-14"
                onClick={handleConnect}
                aria-label="Leave meeting"
              >
                <PhoneOff className="size-6" strokeWidth={2} aria-hidden />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="icon"
              className="size-14 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 sm:size-16"
              disabled={status === "connecting"}
              onClick={handleConnect}
              aria-label={status === "connecting" ? "Connecting" : "Join meeting"}
            >
              {status === "connecting" ? (
                <span
                  className="size-8 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden
                />
              ) : (
                <Phone className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
