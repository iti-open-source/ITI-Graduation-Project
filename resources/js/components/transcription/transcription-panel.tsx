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

// Comprehensive error handling functions
function getErrorMessage(error: string | null): string {
  if (!error) return "";

  const errorLower = error.toLowerCase();

  // Audio/Microphone related errors
  if (errorLower.includes("audio-capture") || errorLower.includes("not-allowed")) {
    return "Microphone access required - please allow microphone permission";
  }

  // Network related errors
  if (errorLower.includes("network") || errorLower.includes("no-speech")) {
    return "Network connection issue - check your internet connection";
  }

  // Service related errors
  if (errorLower.includes("service-not-allowed") || errorLower.includes("service")) {
    return "Speech service unavailable - try refreshing the page";
  }

  // Browser compatibility errors
  if (errorLower.includes("aborted") || errorLower.includes("speech recognition error")) {
    return "AI evaluation unavailable - use Chrome/Edge for full features";
  }

  // Generic fallback for any other errors
  return "AI evaluation temporarily unavailable - please try again";
}

function getErrorDescription(error: string | null): string {
  if (!error) return "";

  const errorLower = error.toLowerCase();

  // Audio/Microphone related errors
  if (errorLower.includes("audio-capture") || errorLower.includes("not-allowed")) {
    return "Please allow microphone access in your browser settings to enable AI evaluation";
  }

  // Network related errors
  if (errorLower.includes("network") || errorLower.includes("no-speech")) {
    return "Please check your internet connection and try again. AI evaluation requires a stable connection";
  }

  // Service related errors
  if (errorLower.includes("service-not-allowed") || errorLower.includes("service")) {
    return "Speech recognition service is currently unavailable. Please refresh the page and try again";
  }

  // Browser compatibility errors
  if (errorLower.includes("aborted") || errorLower.includes("speech recognition error")) {
    return "Manual feedback only - use Chrome/Edge for full AI analysis";
  }

  // Generic fallback for any other errors
  return "AI evaluation is temporarily unavailable. Please try refreshing the page or check your browser settings";
}

function getErrorAction(error: string | null): string | null {
  if (!error) return null;

  const errorLower = error.toLowerCase();

  // Errors that can be resolved by user action
  if (
    errorLower.includes("audio-capture") ||
    errorLower.includes("not-allowed") ||
    errorLower.includes("network") ||
    errorLower.includes("no-speech") ||
    errorLower.includes("service-not-allowed") ||
    errorLower.includes("service")
  ) {
    return "Try Again";
  }

  // Errors that can't be resolved by user action
  return null;
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

  // Auto-start transcription when component mounts
  useEffect(() => {
    if (isSupported && !isListening) {
      startListening();
    }
  }, [isSupported, isListening, startListening]);

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
                  ? getErrorDescription(error)
                  : isListening
                    ? "AI is actively monitoring and analyzing your conversation"
                    : "AI evaluation will begin automatically when you start speaking"}
              </p>
            </div>

            {isListening && !error && (
              <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <span>Detailed feedback available after interview</span>
                </div>
              </div>
            )}

            {error && getErrorAction(error) && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    // Try to start listening again to trigger permission request
                    if (isSupported) {
                      startListening();
                    }
                  }}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                >
                  {getErrorAction(error)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
