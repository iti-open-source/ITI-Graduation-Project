import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition({
  language = "en-US",
  continuous = true,
  interimResults = true,
  onTranscript,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasPersistentError, setHasPersistentError] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  // Check if speech recognition is supported
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
          finalTranscriptRef.current = finalTranscript;
          setTranscript(finalTranscript);

          // Call the onTranscript callback with final result
          onTranscript?.({
            transcript,
            confidence: result[0].confidence,
            isFinal: true,
          });
        } else {
          interimTranscript += transcript;
          setInterimTranscript(interimTranscript);

          // Call the onTranscript callback with interim result
          onTranscript?.({
            transcript,
            confidence: result[0].confidence,
            isFinal: false,
          });
        }
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      setIsListening(false);

      // Check if this is a persistent error that we should stop retrying
      if (
        event.error === "aborted" ||
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setHasPersistentError(true);
      }

      onError?.(errorMessage);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, language, continuous, interimResults, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && !hasPersistentError) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        const errorMessage = "Failed to start speech recognition";
        setError(errorMessage);
        setHasPersistentError(true);
        onError?.(errorMessage);
      }
    }
  }, [isListening, hasPersistentError, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    error,
  };
}
