import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
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
  const [messages, setMessages] = useState<Array<{ from: "me" | "peer"; text: string }>>([]);
  const [chatReady, setChatReady] = useState(false);
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const pcRef = useRef<RTCPeerConnection | null>(null);
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
        else if (state === "disconnected" || state === "failed" || state === "closed") setConnStatus("disconnected");
        else setConnStatus("connecting");
      };

      const setupDC = (channel: RTCDataChannel) => {
        dcRef.current = channel;
        channel.onopen = () => setChatReady(true);
        channel.onclose = () => setChatReady(false);
        channel.onmessage = (ev) =>
          setMessages((m) => [...m, { from: "peer", text: String(ev.data) }]);
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
          else if (current === "connecting" || current === "unavailable" || current === "failed") setWsStatus("connecting");
          else setWsStatus("disconnected");
        });
        const cur = (pusher as any).connection?.state as string | undefined;
        if (cur === "connected") setWsStatus("connected");
      } catch {}
      channel.bind("room-session-signaling", async (payload: any) => {
        try {
          if (payload.type === "terminated") {
            // Remote side ended session; cleanup and leave
            try {
              if (dcRef.current) { try { dcRef.current.close(); } catch {} dcRef.current = null; }
              if (pcRef.current) { try { pcRef.current.close(); } catch {} pcRef.current = null; }
              if (streamRef.current) { try { streamRef.current.getTracks().forEach((t)=>t.stop()); } catch {} streamRef.current = null; }
            } catch {}
            window.location.href = '/lobby';
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
          try { dcRef.current.close(); } catch {}
          dcRef.current = null;
        }
        if (pcRef.current) {
          try { pcRef.current.ontrack = null; } catch {}
          try { pcRef.current.onicecandidate = null; } catch {}
          try { pcRef.current.close(); } catch {}
          pcRef.current = null;
        }
        if (streamRef.current) {
          try { streamRef.current.getTracks().forEach((t) => t.stop()); } catch {}
          streamRef.current = null;
        }
        if (channelRef.current) {
          try { channelRef.current.unbind_all(); } catch {}
          try { pusherRef.current?.unsubscribe(`session.room.${roomCode}`); } catch {}
          channelRef.current = null;
        }
        if (pusherRef.current) {
          try { (pusherRef.current as any).connection?.unbind?.("state_change"); } catch {}
          try { pusherRef.current.disconnect(); } catch {}
          pusherRef.current = null;
        }
        peerReadyRef.current = false;
        weReadyRef.current = false;
        iceQueueRef.current = [];
        setChatReady(false);
        setConnStatus("disconnected");
        setWsStatus("disconnected");
      } catch {}
    };
  }, [roomCode, isCreator, pusherKey, pusherCluster]);

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
    dcRef.current.send(text);
    setMessages((m) => [...m, { from: "me", text }]);
    setChatInput("");
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Session - ${roomCode}`} />
      <div className="container mx-auto px-4 py-6">
        {wsStatus !== "connected" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="rounded border border-[var(--color-card-shadow)] bg-[var(--color-card-bg)] px-4 py-3 text-[var(--color-text)] shadow-lg">
              {wsStatus === "connecting" ? "Realtime connection lost. Reconnecting…" : "Realtime disconnected."}
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="rounded border border-[var(--color-card-shadow)] bg-[var(--color-card-bg)] p-3">
            <div className="relative">
              <video
                ref={remoteRef}
                autoPlay
                playsInline
                className="h-[360px] w-full rounded bg-black"
              />
              {connStatus !== "connected" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`px-3 py-1 rounded text-sm font-medium ${connStatus === "connecting" ? "bg-yellow-500 text-black" : "bg-red-600 text-white"}`}>
                    {connStatus === "connecting" ? "Connecting…" : "Disconnected"}
                  </div>
                </div>
              )}
              <video
                ref={localRef}
                autoPlay
                playsInline
                muted
                className="absolute right-2 bottom-2 h-28 w-44 rounded border border-white bg-black"
              />
            </div>
            <div className="mt-3 flex gap-2">
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
                  className="inline-block rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Terminate Session
                </button>
              </form>
            </div>
          </div>
          <div className="rounded border border-[var(--color-card-shadow)] bg-[var(--color-card-bg)] p-3">
            <div className="mb-1 font-semibold text-[var(--color-text)]">
              Chat {chatReady ? "" : "(connecting...)"}
            </div>
            <div className="h-72 overflow-y-auto rounded bg-[var(--color-section-alt-bg)] p-2">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.from === "me" ? "text-right" : "text-left"}`}>
                  <span
                    className={`inline-block rounded px-2 py-1 ${m.from === "me" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-sm text-[var(--color-text-secondary)]">No messages yet.</div>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChat();
                }}
                className="flex-1 rounded border border-[var(--color-card-shadow)] bg-[var(--color-section-alt-bg)] px-2 py-1 text-sm"
                placeholder={chatReady ? "Type a message…" : "Waiting for connection…"}
                disabled={!chatReady}
              />
              <button
                onClick={sendChat}
                disabled={!chatReady || !chatInput.trim()}
                className="rounded bg-gray-700 px-3 py-1 text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
