import CollaborativeEditor from "@/components/editor/collaborative-editor";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Mic, MicOff, PhoneOff, Video as VideoIcon, VideoOff } from "lucide-react";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";

interface PageProps {
  roomCode: string;
  isCreator: boolean;
  pusherKey: string;
  pusherCluster: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Lobby", href: "/lobby" },
  { title: "Session", href: "#" },
];

export default function SessionRoom(props: PageProps) {
  const { roomCode, isCreator, pusherKey, pusherCluster } = props;
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ from: "me" | "peer"; text: string; author?: string }>
  >([]);
  const [chatReady, setChatReady] = useState(false);
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const currentUserName = (usePage().props as any)?.auth?.user?.name || "Me";
  const dcRef = useRef<RTCDataChannel | null>(null);
  const iceQueueRef = useRef<RTCIceCandidate[]>([]);
  const peerReadyRef = useRef(false);
  const weReadyRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = (ev) => {
        if (remoteRef.current) remoteRef.current.srcObject = ev.streams[0];
      };
      pc.onicecandidate = (ev) => {
        if (ev.candidate) sendSignal("ice-candidate", ev.candidate);
      };
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") setConnStatus("connected");
        else if (state === "disconnected" || state === "failed") setConnStatus("disconnected");
        else setConnStatus("connecting");
      };
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === "connected" || state === "completed") setConnStatus("connected");
        else if (state === "disconnected" || state === "failed" || state === "closed")
          setConnStatus("disconnected");
        else setConnStatus("connecting");
      };

      const setupDC = (channel: RTCDataChannel) => {
        dcRef.current = channel;
        channel.onopen = () => setChatReady(true);
        channel.onclose = () => setChatReady(false);
        channel.onmessage = (ev) => {
          try {
            const data = JSON.parse(String(ev.data));
            setMessages((m) => [
              ...m,
              { from: "peer", text: String(data.text ?? ""), author: data.author },
            ]);
          } catch {
            setMessages((m) => [...m, { from: "peer", text: String(ev.data) }]);
          }
        };
      };

      if (isCreator) {
        setupDC(pc.createDataChannel("chat"));
      } else {
        pc.ondatachannel = (ev) => setupDC(ev.channel);
      }

      const pusher = new Pusher(pusherKey, { cluster: pusherCluster, forceTLS: true });
      pusherRef.current = pusher;
      const channel = pusher.subscribe(`session.room.${roomCode}`);
      channelRef.current = channel;

      // Track websocket (Pusher) connection state
      try {
        pusher.connection.bind("state_change", (states: any) => {
          const current = (states?.current as string) || "connecting";
          if (current === "connected") setWsStatus("connected");
          else if (current === "connecting" || current === "unavailable" || current === "failed")
            setWsStatus("connecting");
          else setWsStatus("disconnected");
        });
        const cur = (pusher as any).connection?.state as string | undefined;
        if (cur === "connected") setWsStatus("connected");
      } catch (err) {
        console.error(err);
      }
      channel.bind("room-session-signaling", async (payload: any) => {
        try {
          if (payload.type === "terminated") {
            // Remote side ended session; cleanup and leave
            try {
              if (dcRef.current) {
                try {
                  dcRef.current.close();
                } catch (err) {
                  console.error(err);
                }

                dcRef.current = null;
              }
              if (pcRef.current) {
                try {
                  pcRef.current.close();
                } catch (err) {
                  console.error(err);
                }
                pcRef.current = null;
              }
              if (streamRef.current) {
                try {
                  streamRef.current.getTracks().forEach((t) => t.stop());
                } catch (err) {
                  console.error(err);
                }
                streamRef.current = null;
              }
            } catch (err) {
              console.error(err);
            }
            window.location.href = "/lobby";
            return;
          }
          if (payload.type === "ready") {
            peerReadyRef.current = true;
            if (isCreator && weReadyRef.current) {
              await startCall();
            }
            return;
          }
          if (payload.type === "offer" && !isCreator) {
            const cleaned = cleanSdp(payload.data);
            await pc.setRemoteDescription(cleaned);
            await drainIce();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal("answer", answer);
          } else if (payload.type === "answer" && isCreator) {
            const cleaned = cleanSdp(payload.data);
            await pc.setRemoteDescription(cleaned);
            await drainIce();
          } else if (payload.type === "ice-candidate") {
            const c = new RTCIceCandidate(payload.data);
            if (pc.remoteDescription) await pc.addIceCandidate(c);
            else iceQueueRef.current.push(c);
          }
        } catch (e) {
          console.error("signaling error", e);
        }
      });

      // Mark ourselves ready and auto-start when both are present
      weReadyRef.current = true;
      sendSignal("ready", { at: Date.now() });
      if (isCreator && peerReadyRef.current) {
        await startCall();
      }
    })();

    return () => {
      isMounted = false;
      try {
        if (dcRef.current) {
          try {
            dcRef.current.close();
          } catch (err) {
            console.error(err);
          }
          dcRef.current = null;
        }
        if (pcRef.current) {
          try {
            pcRef.current.ontrack = null;
          } catch (err) {
            console.error(err);
          }
          try {
            pcRef.current.onicecandidate = null;
          } catch (err) {
            console.error(err);
          }
          try {
            pcRef.current.close();
          } catch (err) {
            console.error(err);
          }
          pcRef.current = null;
        }
        if (streamRef.current) {
          try {
            streamRef.current.getTracks().forEach((t) => t.stop());
          } catch (err) {
            console.error(err);
          }
          streamRef.current = null;
        }
        if (channelRef.current) {
          try {
            channelRef.current.unbind_all();
          } catch (err) {
            console.error(err);
          }
          try {
            pusherRef.current?.unsubscribe(`session.room.${roomCode}`);
          } catch (err) {
            console.error(err);
          }
          channelRef.current = null;
        }
        if (pusherRef.current) {
          try {
            (pusherRef.current as any).connection?.unbind?.("state_change");
          } catch (err) {
            console.error(err);
          }
          try {
            pusherRef.current.disconnect();
          } catch (err) {
            console.error(err);
          }
          pusherRef.current = null;
        }
        peerReadyRef.current = false;
        weReadyRef.current = false;
        iceQueueRef.current = [];
        setChatReady(false);
        setConnStatus("disconnected");
        setWsStatus("disconnected");
      } catch (err) {
        console.error(err);
      }
    };
  }, [roomCode, isCreator, pusherKey, pusherCluster]);

  const toggleAudio = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    }
  };

  const toggleVideo = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    }
  };

  const startCall = async () => {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    sendSignal("offer", offer);
  };

  const sendSignal = async (type: string, data: any) => {
    await fetch(`/session/${roomCode}/signal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN":
          (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
      },
      credentials: "same-origin",
      body: JSON.stringify({ type, data }),
    });
  };

  const cleanSdp = (desc: any) => {
    try {
      const sdp = String(desc.sdp || "");
      const lines = sdp.split(/\r?\n/).filter(Boolean);
      const filtered = lines.filter((line) => !/^a=max-message-size:/i.test(line));
      let cleaned = filtered.join("\r\n");
      if (!cleaned.endsWith("\r\n")) cleaned += "\r\n";
      return { type: desc.type, sdp: cleaned } as RTCSessionDescriptionInit;
    } catch {
      return desc;
    }
  };

  const drainIce = async () => {
    while (iceQueueRef.current.length) {
      const c = iceQueueRef.current.shift()!;
      try {
        await pcRef.current?.addIceCandidate(c);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || !dcRef.current || dcRef.current.readyState !== "open") return;
    const payload = JSON.stringify({ text, author: currentUserName });
    dcRef.current.send(payload);
    setMessages((m) => [...m, { from: "me", text, author: currentUserName }]);
    setChatInput("");
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Session - ${roomCode}`} />

      <div className="min-h-screen bg-[var(--background)] px-4 py-8">
        {wsStatus !== "connected" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-4 text-[var(--color-text)] shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                {wsStatus === "connecting"
                  ? "Realtime connection lost. Reconnecting…"
                  : "Realtime disconnected."}
              </div>
            </div>
          </div>
        )}

        <div className="mx-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
            {/* Left Column - Video and Chat */}
            <div className="flex h-full flex-col space-y-6">
              {/* Video Section */}
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                <div className="relative">
                  <video
                    ref={remoteRef}
                    autoPlay
                    playsInline
                    className="min-h-[40vh] w-full rounded-lg bg-gray-900"
                  />
                  {connStatus !== "connected" && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                      <div
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          connStatus === "connecting"
                            ? "bg-yellow-500 text-black"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {connStatus === "connecting" ? "Connecting…" : "Disconnected"}
                      </div>
                    </div>
                  )}
                  <video
                    ref={localRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute right-4 bottom-4 h-24 w-32 rounded-lg border-2 border-white bg-gray-900 shadow-lg"
                  />
                </div>

                {/* Video Controls */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-white transition-colors ${
                      isAudioEnabled
                        ? "bg-slate-600 hover:bg-slate-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
                  >
                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-white transition-colors ${
                      isVideoEnabled
                        ? "bg-slate-600 hover:bg-slate-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    title={isVideoEnabled ? "Turn camera off" : "Turn camera on"}
                  >
                    {isVideoEnabled ? (
                      <VideoIcon className="h-5 w-5" />
                    ) : (
                      <VideoOff className="h-5 w-5" />
                    )}
                  </button>

                  <form method="POST" action={`/session/${roomCode}/terminate`}>
                    <input
                      type="hidden"
                      name="_token"
                      value={
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
                          ?.content || ""
                      }
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                      title="End Call"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Chat Section */}
              <div className="flex flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                {/* Chat Messages */}
                <div className="mb-4 flex-1 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-transparent p-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`mb-3 ${m.from === "me" ? "text-right" : "text-left"}`}>
                      {m.author && (
                        <div className="mb-1 text-xs text-[var(--color-text-secondary)]">
                          {m.author}
                        </div>
                      )}
                      <span
                        className={`inline-block rounded-lg px-3 py-2 text-sm ${
                          m.from === "me"
                            ? "bg-blue-500 text-white"
                            : "bg-slate-600 text-white dark:bg-slate-700"
                        }`}
                      >
                        {m.text}
                      </span>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-card-bg)]">
                          <svg
                            className="h-6 w-6 text-[var(--color-text-secondary)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          No messages yet
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Start the conversation!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={chatReady ? "Type a message…" : "Waiting for connection…"}
                    disabled={!chatReady}
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatReady || !chatInput.trim()}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Collaborative Editor */}
            <div className="space-y-6">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                <CollaborativeEditor id={`session-${roomCode}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
