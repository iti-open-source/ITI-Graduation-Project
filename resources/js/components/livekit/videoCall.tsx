import { usePage } from "@inertiajs/react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

interface VideoCallProps {
  roomName: string;
  sessionCode?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function VideoCall({ roomName, sessionCode, onConnected, onDisconnected }: VideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(true);

  // Get WebRTC configuration from Inertia shared data
  const { webrtc } = usePage().props as any;
  const serverUrl = webrtc?.serverUrl || "ws://localhost:7880";

  // Generate LiveKit token
  const generateToken = async () => {
    try {
      setIsGeneratingToken(true);
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken || "",
        },
        body: JSON.stringify({
          room: roomName,
          sessionCode: sessionCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
      } else {
        setToken("");
      }
    } catch (error) {
      setToken("");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Generate token when component mounts
  useEffect(() => {
    generateToken();
  }, [roomName, sessionCode]);

  const handleConnected = () => {
    setIsConnected(true);
    onConnected?.();
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    onDisconnected?.();
  };

  const handleError = (error: any) => {};

  // Show loading state while generating token
  if (isGeneratingToken || !token) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Generating video call token...</p>
          <p className="text-xs text-gray-500">Please wait while we set up your video call</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
        style={{ height: "100%" }}
      >
        <div className="flex h-full flex-col">
          {/* Connection Status */}
          <div className="border-b bg-gray-100 p-2">
            <span className={`text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>
              {isConnected ? "Connected" : "Connecting..."}
            </span>
            <span className="ml-2 text-gray-600">Room: {roomName}</span>
          </div>

          {/* Full-featured Video Conference Component */}
          <div className="flex-1">
            <VideoConference />
          </div>

          {/* Audio Renderer */}
          <RoomAudioRenderer />
        </div>
      </LiveKitRoom>
    </div>
  );
}
