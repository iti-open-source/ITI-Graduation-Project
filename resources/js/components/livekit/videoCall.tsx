import { usePage } from "@inertiajs/react";
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useLocalParticipant,
  useMediaDevices,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

interface VideoCallProps {
  roomName: string;
  sessionCode?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

// Custom Gallery View Component
function GalleryView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const { localParticipant } = useLocalParticipant();
  const audioInputDevices = useMediaDevices({ kind: "audioinput" });
  const videoInputDevices = useMediaDevices({ kind: "videoinput" });
  const audioOutputDevices = useMediaDevices({ kind: "audiooutput" });
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Separate tracks for guest and local participant
  const guestTracks = tracks.filter((t) => t.participant.identity !== localParticipant?.identity);
  const localTracks = tracks.filter((t) => t.participant.identity === localParticipant?.identity);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Vertical Two-Participant Layout */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Guest Video - Top Half */}
        <div className="min-h-0 flex-1">
          {guestTracks.length > 0 ? (
            <GridLayout tracks={guestTracks} className="h-full">
              <ParticipantTile />
            </GridLayout>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-900">
              <div className="text-center text-gray-400">
                <svg className="mx-auto mb-4 h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg">Waiting for guest to join...</p>
                <p className="mt-2 text-sm">Share your session code to invite someone</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Participant Video - Bottom Half */}
        <div className="min-h-0 flex-1">
          {localTracks.length > 0 ? (
            <GridLayout tracks={localTracks} className="h-full">
              <ParticipantTile />
            </GridLayout>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800">
              <div className="text-center text-gray-400">
                <svg className="mx-auto mb-2 h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm">Your camera is off</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 border-t bg-gray-50 px-4 py-3 dark:bg-gray-800">
        <div className="flex items-center justify-center gap-4">
          {/* Mute/Unmute Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              localParticipant?.isMicrophoneEnabled
                ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            onClick={() => {
              if (localParticipant) {
                localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
              }
            }}
            title={localParticipant?.isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Camera On/Off Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              localParticipant?.isCameraEnabled
                ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            onClick={() => {
              if (localParticipant) {
                localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
              }
            }}
            title={localParticipant?.isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </button>

          {/* Share Screen Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              localParticipant?.isScreenShareEnabled
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => {
              if (localParticipant) {
                localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
              }
            }}
            title={localParticipant?.isScreenShareEnabled ? "Stop sharing screen" : "Share screen"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1h-6z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Device Settings Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            title="Device settings"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Device Settings Panel */}
        {showDeviceSettings && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {/* Microphone Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Microphone
              </label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  if (localParticipant) {
                    localParticipant.setMicrophoneEnabled(true, { deviceId: e.target.value });
                  }
                }}
              >
                {audioInputDevices.map((device: MediaDeviceInfo) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Camera</label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  if (localParticipant) {
                    localParticipant.setCameraEnabled(true, { deviceId: e.target.value });
                  }
                }}
              >
                {videoInputDevices.map((device: MediaDeviceInfo) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Speaker Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Speaker
              </label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  // Note: Speaker selection would need to be handled by the room's audio output
                  console.log("Speaker selected:", e.target.value);
                }}
              >
                {audioOutputDevices.map((device: MediaDeviceInfo) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
      <div className="flex h-full w-full items-center justify-center">
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
    <div className="flex h-full w-full flex-col">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "320px",
        }}
      >
        <div className="flex h-full flex-col">
          {/* Connection Status */}
          <div className="border-b bg-gray-50 px-4 py-3 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {isConnected ? "Live" : "Connecting..."}
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Session: {sessionCode || roomName.replace("session-", "")}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Custom Gallery View */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <GalleryView />
          </div>

          {/* Audio Renderer */}
          <RoomAudioRenderer />
        </div>
      </LiveKitRoom>
    </div>
  );
}
