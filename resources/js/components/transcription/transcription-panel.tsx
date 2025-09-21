import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { usePage } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TranscriptionPanelProps {
  roomCode: string;
  isCreator: boolean;
  onTranscriptUpdate?: (transcript: string) => void;
}

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
  confidence: number;
  speaker?: string;
  isMe?: boolean;
  timestampMicroseconds?: number;
}

export default function TranscriptionPanel({
  roomCode,
  isCreator,
  onTranscriptUpdate,
}: TranscriptionPanelProps) {
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isLoadingTranscripts, setIsLoadingTranscripts] = useState(false);

  const { csrf_token } = usePage().props as any;
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTranscriptsRef = useRef<TranscriptEntry[]>([]);

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    error,
  } = useSpeechRecognition({
    language: "en-US",
    continuous: true,
    interimResults: true,
    onTranscript: (result) => {
      const timestampMicroseconds = Date.now() * 1000 + ((performance.now() * 1000) % 1000);

      if (result.isFinal) {
        const newEntry: TranscriptEntry = {
          id: Date.now().toString(),
          text: result.transcript,
          timestamp: new Date(),
          isFinal: true,
          confidence: result.confidence,
          timestampMicroseconds,
        };

        setTranscriptEntries((prev) => [...prev, newEntry]);
        pendingTranscriptsRef.current.push(newEntry);
        scheduleBatchSync();
        onTranscriptUpdate?.(transcript + result.transcript);
      }
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
    },
  });

  // Generate specific error messages based on error type
  const getErrorMessage = (error: string) => {
    if (error.includes("aborted")) {
      return "AI evaluation unavailable - microphone access was interrupted";
    }
    if (error.includes("not-allowed")) {
      return "AI evaluation unavailable - microphone permission denied";
    }
    if (error.includes("service-not-allowed")) {
      return "AI evaluation unavailable - speech recognition service blocked";
    }
    if (error.includes("network")) {
      return "AI evaluation unavailable - network connection required";
    }
    if (error.includes("language-not-supported")) {
      return "AI evaluation unavailable - language not supported";
    }
    if (error.includes("audio-capture")) {
      return "AI evaluation unavailable - microphone not available";
    }
    return "AI evaluation unavailable - speech recognition error";
  };

  const getDetailedErrorMessage = (error: string) => {
    if (error.includes("aborted")) {
      return "Microphone access was interrupted. Please refresh the page and allow microphone access.";
    }
    if (error.includes("not-allowed")) {
      return "Microphone permission was denied. Please enable microphone access in your browser settings.";
    }
    if (error.includes("service-not-allowed")) {
      return "Speech recognition service is blocked. Please check your browser settings or try a different browser.";
    }
    if (error.includes("network")) {
      return "Network connection is required for speech recognition. Please check your internet connection.";
    }
    if (error.includes("language-not-supported")) {
      return "The current language is not supported by speech recognition.";
    }
    if (error.includes("audio-capture")) {
      return "No microphone found. Please connect a microphone and try again.";
    }
    return "Speech recognition encountered an error. Please try refreshing the page.";
  };

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (autoScroll && transcriptEntries.length > 0) {
      const transcriptContainer = document.getElementById("transcript-container");
      if (transcriptContainer) {
        transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
      }
    }
  }, [transcriptEntries, autoScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Auto-start transcription when component mounts (only if no error)
  useEffect(() => {
    if (isSupported && !isListening && !error) {
      startListening();
    }
  }, [isSupported, isListening, startListening, error]);

  // Auto-pause when component unmounts
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Sync transcript to server
  const syncTranscriptToServer = useCallback(
    async (transcript: TranscriptEntry) => {
      try {
        const response = await fetch(`/api/session/${roomCode}/transcript/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrf_token || "",
          },
          body: JSON.stringify({
            text: transcript.text,
            timestamp_microseconds: transcript.timestampMicroseconds || Date.now() * 1000,
            is_final: transcript.isFinal,
            confidence: transcript.confidence,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.transcript_id;
        }
      } catch (error) {
        console.error("Failed to sync transcript:", error);
      }
      return null;
    },
    [roomCode, csrf_token],
  );

  // Load all transcripts from server
  const loadTranscriptsFromServer = useCallback(async () => {
    setIsLoadingTranscripts(true);
    try {
      const response = await fetch(`/api/session/${roomCode}/transcripts`, {
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf_token || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const serverTranscripts: TranscriptEntry[] = data.transcripts.map((t: any) => ({
          id: t.id,
          text: t.text,
          timestamp: new Date(t.timestamp_microseconds / 1000),
          isFinal: t.is_final,
          confidence: t.confidence,
          speaker: t.speaker,
          isMe: t.is_me,
          timestampMicroseconds: t.timestamp_microseconds,
        }));

        setTranscriptEntries(serverTranscripts);
      }
    } catch (error) {
      console.error("Failed to load transcripts:", error);
    } finally {
      setIsLoadingTranscripts(false);
    }
  }, [roomCode, csrf_token]);

  // Batch sync pending transcripts
  const batchSyncTranscripts = useCallback(async () => {
    if (pendingTranscriptsRef.current.length === 0) return;

    const transcriptsToSync = [...pendingTranscriptsRef.current];
    pendingTranscriptsRef.current = [];

    for (const transcript of transcriptsToSync) {
      await syncTranscriptToServer(transcript);
    }
  }, [syncTranscriptToServer]);

  // Schedule batch sync
  const scheduleBatchSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      batchSyncTranscripts();
    }, 2000); // Sync every 2 seconds
  }, [batchSyncTranscripts]);

  // Load transcripts when component mounts and periodically refresh
  useEffect(() => {
    loadTranscriptsFromServer();

    // Auto-refresh transcripts every 5 seconds
    const refreshInterval = setInterval(() => {
      loadTranscriptsFromServer();
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, [loadTranscriptsFromServer]);

  if (!isSupported) {
    return (
      <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3">
        <div className="flex items-center justify-center text-sm text-[var(--color-text-muted)]">
          <span>Speech recognition not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
      {/* AI Evaluation Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-text-hover)]"
          >
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            AI Evaluation
          </button>
          {isListening && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-red-600 dark:text-red-400">Recording</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <div className="text-xs text-[var(--color-text-muted)]">
              {isListening ? "AI analyzing conversation" : "AI evaluation paused"}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-b border-[var(--color-border)] bg-red-50 px-3 py-2 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {getErrorMessage(error)}
          </div>
        </div>
      )}

      {/* AI Evaluation Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="text-center">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">
                {error
                  ? getDetailedErrorMessage(error)
                  : isListening
                    ? "AI is actively monitoring and analyzing your conversation"
                    : "AI evaluation will begin automatically when you start speaking"}
              </p>
            </div>

            {isListening && !error && (
              <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                  <span>Conversation captured</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                  <span>AI analysis in progress</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <span>Detailed feedback available after interview</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
