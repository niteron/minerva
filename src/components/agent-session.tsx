"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrainIcon,
  MessageSquareTextIcon,
  Loader2Icon,
  MegaphoneIcon,
  MicIcon,
  MicOff,
  PhoneIcon,
  PhoneOff,
} from "lucide-react";

import type { PersonaState } from "@/components/ai-elements/persona";
import { Persona } from "@/components/ai-elements/persona";
import { useAudioInput } from "@/hooks/useAudioInput";
import { useAudioOutput } from "@/hooks/useAudioOutput";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AgentSessionGateProps = {
  runtimeArn?: string;
  agentName?: string;
  agentSubtitle?: string;
  agentInitial?: string;
};

type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  isFinal: boolean;
};

export function AgentSession({
  runtimeArn,
  agentName = "Nova Legal",
  agentSubtitle = "Legal Assessment Agent",
  agentInitial: _agentInitial,
}: AgentSessionGateProps) {
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isModelThinking, setIsModelThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);
  const audioOutput = useAudioOutput();

  const handleTranscript = useCallback(
    (role: string, text: string, isFinal: boolean) => {
      if (role === "user" || role === "assistant") {
        setTranscriptMessages((prev) => {
          const lastMessage = prev.at(-1);
          const canUpdateLast =
            lastMessage &&
            lastMessage.role === role &&
            !lastMessage.isFinal;

          if (canUpdateLast) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, text, isFinal },
            ];
          }

          return [
            ...prev,
            {
              id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${prev.length}`,
              role,
              text,
              isFinal,
            },
          ];
        });
      }

      if (role !== "assistant") return;
      if (!isFinal) {
        setIsModelThinking(false);
        setIsAssistantSpeaking(true);
        return;
      }
      setIsAssistantSpeaking(false);
    },
    []
  );

  const handleInterruption = useCallback(() => {
    audioOutput.clearBuffer();
    setIsAssistantSpeaking(false);
    setIsModelThinking(false);
  }, [audioOutput]);

  const handleToolUse = useCallback((_name: string) => {
    setIsModelThinking(true);
    setIsAssistantSpeaking(false);
  }, []);

  const ws = useWebSocket({
    onAudio: audioOutput.playAudio,
    onTranscript: handleTranscript,
    onInterruption: handleInterruption,
    onToolUse: handleToolUse,
    onError: setError,
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
      return;
    }

    if (audioInput.isRecording) {
      audioInput.stopRecording();
    }
    audioOutput.cleanup();
    setIsAssistantSpeaking(false);
    setIsModelThinking(false);
  }, [ws.connectionStatus, audioInput, audioOutput]);

  const currentState = useMemo<PersonaState>(() => {
    if (ws.connectionStatus === "disconnected") return "asleep";
    if (ws.connectionStatus === "connecting" || isModelThinking) return "thinking";
    if (isAssistantSpeaking) return "speaking";
    if (audioInput.isRecording) return "listening";
    return "idle";
  }, [
    ws.connectionStatus,
    isModelThinking,
    isAssistantSpeaking,
    audioInput.isRecording,
  ]);

  const connectSession = useCallback(async () => {
    setError(null);
    await ws.connect();
  }, [ws]);

  const toggleMic = useCallback(async () => {
    if (audioInput.isRecording) {
      audioInput.stopRecording();
      return;
    }
    await audioInput.startRecording();
  }, [audioInput]);

  const disconnectSession = useCallback(() => {
    if (audioInput.isRecording) {
      audioInput.stopRecording();
    }
    ws.disconnect();
  }, [ws, audioInput]);

  const status = ws.connectionStatus;
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 px-4">
      <Persona className="size-64" state={currentState} variant="opal" />
      <div className="text-center">
        <p className="text-sm font-medium">{agentName}</p>
        <p className="text-xs text-muted-foreground">{agentSubtitle}</p>
        {error ? (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        ) : null}
      </div>

      {isConnected ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isModelThinking ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <BrainIcon className="size-3.5 shrink-0" aria-hidden />
              Agent Thinking…
            </span>
          ) : null}
          {isAssistantSpeaking ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <MegaphoneIcon className="size-3.5 shrink-0" aria-hidden />
              Agent Speaking…
            </span>
          ) : null}
          {!isModelThinking && !isAssistantSpeaking ? (
            <span className="text-xs text-muted-foreground">
              {audioInput.isRecording ? "Mic on — you’re live" : "Mic muted"}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!isConnected && !isConnecting ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="size-16 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500 sm:size-[4.5rem]"
                onClick={connectSession}
                aria-label="Connect"
              >
                <PhoneIcon className="size-8 sm:size-9" strokeWidth={2} aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Connect</TooltipContent>
          </Tooltip>
        ) : null}

        {isConnecting ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2Icon
              className="size-10 animate-spin text-muted-foreground sm:size-12"
              aria-hidden
            />
            <span className="text-muted-foreground text-xs">Connecting…</span>
          </div>
        ) : null}

        {isConnected ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "size-14 rounded-full border-0 shadow-sm sm:size-16",
                    audioInput.isRecording
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                  onClick={toggleMic}
                  aria-label={
                    audioInput.isRecording ? "Mute microphone" : "Unmute microphone"
                  }
                >
                  {audioInput.isRecording ? (
                    <MicIcon className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
                  ) : (
                    <MicOff className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {audioInput.isRecording ? "Mute" : "Unmute"}
              </TooltipContent>
            </Tooltip>

            <div
              className="h-10 w-px shrink-0 bg-border sm:h-12"
              aria-hidden
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-14 rounded-full shadow-sm sm:size-16"
                  aria-label="Transcript"
                >
                  <MessageSquareTextIcon className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
                </Button>
              </DialogTrigger>
              <DialogContent className="flex h-[70vh] max-w-3xl flex-col gap-4 p-0">
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle>Conversation Transcript</DialogTitle>
                  <DialogDescription>
                    Live transcript of your conversation with {agentName}.
                  </DialogDescription>
                </DialogHeader>
                <Conversation className="min-h-0 px-2 pb-2">
                  <ConversationContent className="gap-4 px-4 pb-4">
                    {transcriptMessages.length === 0 ? (
                      <ConversationEmptyState
                        title="No transcript yet"
                        description="Start speaking after connecting to see user and assistant messages here."
                      />
                    ) : (
                      transcriptMessages.map((message) => (
                        <Message key={message.id} from={message.role}>
                          <MessageContent>
                            <MessageResponse>{message.text}</MessageResponse>
                          </MessageContent>
                        </Message>
                      ))
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
              </DialogContent>
            </Dialog>

            <div
              className="h-10 w-px shrink-0 bg-border sm:h-12"
              aria-hidden
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-14 rounded-full shadow-sm sm:size-16"
                  onClick={disconnectSession}
                  aria-label="Disconnect"
                >
                  <PhoneOff className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Disconnect</TooltipContent>
            </Tooltip>
          </>
        ) : null}
      </div>
    </div>
  );
}
