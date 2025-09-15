import { usePage } from "@inertiajs/react";
import {
  Chat,
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
  const [showChat, setShowChat] = useState(false);

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
            <div className="flex h-full w-full items-center justify-center bg-white dark:bg-[var(--color-bg)]">
              <div className="text-center text-gray-600 dark:text-[var(--color-text-secondary)]">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg text-gray-900 dark:text-[var(--color-text)]">
                  Waiting for guest to join...
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-[var(--color-text-secondary)]">
                  Please wait until the other participant joins the call.
                </p>
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
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-section-bg)]">
              <div className="text-center text-[var(--color-text-secondary)]">
                <svg className="mx-auto mb-2 h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-[var(--color-text)]">Your camera is off</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 border-t border-[var(--color-border)] bg-blue-50 px-4 py-3 dark:bg-[var(--color-muted)]">
        <div className="flex items-center justify-center gap-4">
          {/* Mute/Unmute Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              localParticipant?.isMicrophoneEnabled
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[var(--color-button-secondary-border)] dark:bg-[var(--color-button-secondary-bg)] dark:text-[var(--color-button-secondary-text)] dark:hover:bg-[var(--color-button-secondary-hover-bg)]"
                : "border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            }`}
            onClick={() => {
              if (localParticipant) {
                localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
              }
            }}
            title={localParticipant?.isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>

          {/* Camera On/Off Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              localParticipant?.isCameraEnabled
                ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[var(--color-button-secondary-border)] dark:bg-[var(--color-button-secondary-bg)] dark:text-[var(--color-button-secondary-text)] dark:hover:bg-[var(--color-button-secondary-hover-bg)]"
                : "border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
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
                ? "border border-blue-300 bg-blue-500 text-white hover:bg-blue-600 dark:bg-[var(--color-accent)] dark:hover:bg-[var(--color-button-primary-hover)]"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[var(--color-button-secondary-border)] dark:bg-[var(--color-button-secondary-bg)] dark:text-[var(--color-button-secondary-text)] dark:hover:bg-[var(--color-button-secondary-hover-bg)]"
            }`}
            onClick={() => {
              if (localParticipant) {
                localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
              }
            }}
            title={localParticipant?.isScreenShareEnabled ? "Stop sharing screen" : "Share screen"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v8h12V4H4zm2 10h8v2H6v-2z" />
            </svg>
          </button>

          {/* Chat Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              showChat
                ? "border border-blue-300 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[var(--color-button-secondary-border)] dark:bg-[var(--color-button-secondary-bg)] dark:text-[var(--color-button-secondary-text)] dark:hover:bg-[var(--color-button-secondary-hover-bg)]"
            }`}
            onClick={() => setShowChat(!showChat)}
            title={showChat ? "Close chat" : "Open chat"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </button>

          {/* Device Settings Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 dark:border-[var(--color-button-secondary-border)] dark:bg-[var(--color-button-secondary-bg)] dark:text-[var(--color-button-secondary-text)] dark:hover:bg-[var(--color-button-secondary-hover-bg)]"
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

        {/* Device Settings Modal */}
        {showDeviceSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-96 max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Device Settings
                </h3>
                <button
                  onClick={() => setShowDeviceSettings(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-5">
                  {/* Microphone Selection */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-white">
                      Microphone
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-white">
                      Camera
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-white">
                      Speaker
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
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
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-600">
                <button
                  onClick={() => setShowDeviceSettings(false)}
                  className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Popover */}
        {showChat && (
          <div className="bg-transparentrder-gray-600 absolute right-4 bottom-16 z-40 border-0">
            <div className="filter-blur-2xl border-0 bg-transparent p-2 opacity-80 drop-shadow-2xl backdrop-blur-md">
              <style>{`
                  .lk-chat {
                    height: 384px !important;
                    width: 384px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    padding: 5px !important;
                    position: relative !important;
                    border-radius: 10px !important;
                  }
                  .lk-chat-messages {
                    height: calc(100% - 70px) !important;
                  }
                  .lk-chat-header{
                    display: none !important;
                  }
                  .lk-chat .lk-message-input {
                    flex-shrink: 0 !important;
                    height: 60px !important;
                  }
                  .lk-chat .lk-chat-form {
                    position: absolute !important;
                    bottom: 5px !important;
                    left: 5px !important;
                    right: 5px !important;
                    height: 60px !important;
                    z-index: 10 !important;
                    border-top: 1px solid #374151 !important;
                  }
                  .dark .lk-chat .lk-chat-form {
                    background: #1f2937 !important;
                    border-top: 1px solid #374151 !important;
                  }
                `}</style>
              <Chat />
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
  const { webrtc, csrf_token } = usePage().props as any;
  const serverUrl = webrtc?.serverUrl || "ws://localhost:7880";

  // Generate LiveKit token
  const generateToken = async () => {
    try {
      setIsGeneratingToken(true);
      const csrfToken =
        csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
            <svg
              className="h-6 w-6 text-[var(--color-accent)]"
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
          <p className="text-sm text-[var(--color-text)]">Generating video call token...</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Please wait while we set up your video call
          </p>
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
          {/* <div className="border-b border-[var(--color-border)] bg-blue-50 px-4 py-3 dark:bg-[var(--color-muted)]">
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
              </div>
              <div className="text-xs text-gray-600 dark:text-[var(--color-text-secondary)]">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div> */}
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
