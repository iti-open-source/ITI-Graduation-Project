import AIChatbot from "@/components/ai-chatbot/ai-chatbot";
import CollaborativeEditor from "@/components/editor/collaborative-editor";
import { VideoCall } from "@/components/livekit/videoCall";
import Problem from "@/components/problem/problem";
import Whiteboard from "@/components/whiteboard/collaborative-whiteboard";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

interface PageProps {
  roomCode: string;
  isCreator: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Lobby", href: "/lobby" },
  { title: "Session", href: "#" },
];

export default function SessionRoom(props: PageProps) {
  const { roomCode, isCreator } = props;
  const [activeTab, setActiveTab] = useState("editor");
  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [rating, setRating] = useState<number>(10);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { csrf_token } = usePage().props as any;

  // Poll session status; when ended, redirect appropriately
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    let aborted = false;
    const checkState = async () => {
      try {
        const res = await fetch(`/api/session/${roomCode}/state`, {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!aborted && json?.status === "ended") {
          if (isCreator && json?.room_code) window.location.href = `/room/${json.room_code}`;
          else window.location.href = "/dashboard";
        }
      } catch {}
    };
    checkState();
    pollRef.current = window.setInterval(checkState, 2000);
    return () => {
      aborted = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [roomCode, isCreator]);

  // Handle video call connection
  const handleVideoConnected = () => {
    setIsVideoConnected(true);
  };

  const handleVideoDisconnected = () => {
    setIsVideoConnected(false);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Session - ${roomCode}`} />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
        {/* Main Content - Side by Side Layout (40/60) */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
          {/* Left Side - Video Call (40% width on desktop, full width on mobile) */}
          <div className="flex w-full flex-col lg:w-2/5 lg:flex-shrink-0">
            <div className="flex h-[75vh] min-h-96 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm lg:h-screen lg:max-h-[calc(100vh-8rem)]">
              {/* Video Header */}
              <div className="flex-shrink-0 border-b border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-[var(--color-text)]">Video Call</h2>
                  <div className="flex items-center gap-4">
                    {isVideoConnected ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${isVideoConnected ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${isVideoConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {isVideoConnected ? "Live" : "Connecting..."}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                    {isCreator && (
                      <button
                        onClick={() => setShowEvaluateModal(true)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        title="End session and submit evaluation"
                      >
                        End & Evaluate
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Content - Fixed Height */}
              <div className="min-h-80 flex-1 lg:h-[calc(100vh-12rem)] lg:min-h-0">
                <VideoCall
                  roomName={`session-${roomCode}`}
                  sessionCode={roomCode}
                  onConnected={handleVideoConnected}
                  onDisconnected={handleVideoDisconnected}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Collaborative Tools (60% on desktop, full width on mobile) */}
          <div className="flex w-[100vh] flex-col lg:min-w-0 lg:flex-1">
            <div className="flex min-h-96 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm lg:h-screen lg:max-h-[calc(100vh-8rem)]">
              {/* Tabs Header */}
              <div className="flex-shrink-0 border-b border-[var(--color-border)] px-4 py-3">
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-medium text-[var(--color-text)]">
                    Collaborative Tools
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("editor")}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "editor"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      Code Editor
                    </button>
                    <button
                      onClick={() => setActiveTab("whiteboard")}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "whiteboard"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      Whiteboard
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => setActiveTab("ai-chat")}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === "ai-chat"
                            ? "bg-blue-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        AI Assistant
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab("problem")}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "problem"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      Problem
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-0 flex-1 overflow-auto lg:h-[calc(100vh-12rem)]">
                <div className={activeTab === "editor" ? "block h-full" : "hidden"}>
                  <CollaborativeEditor id={`session-${roomCode}`} />
                </div>
                <div className={activeTab === "whiteboard" ? "block h-full" : "hidden"}>
                  <Whiteboard roomCode={roomCode} />
                </div>
                {isCreator && (
                  <div className={activeTab === "ai-chat" ? "block h-full" : "hidden"}>
                    <AIChatbot roomCode={roomCode} isCreator={isCreator} />
                  </div>
                )}
                <div className={activeTab === "problem" ? "block h-full" : "hidden"}>
                  <Problem isCreator={isCreator} roomId={`session-${roomCode}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluate Modal */}
      {showEvaluateModal && isCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--card)] shadow-xl">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Evaluate Interview
              </h3>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSubmitting(true);
                  const res = await fetch(`/session/${roomCode}/evaluate`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-CSRF-TOKEN":
                        (csrf_token as string) ||
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
                          ?.content ||
                        "",
                    },
                    body: JSON.stringify({ rating, comments }),
                  });
                  if (res.ok) {
                    const data = await res.json().catch(() => ({}) as any);
                    if (data?.roomCode) {
                      window.location.href = `/room/${data.roomCode}`;
                    } else {
                      window.location.href = "/lobby";
                    }
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
              className="px-5 py-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                          rating >= r
                            ? "border-yellow-400 bg-yellow-400 text-white"
                            : "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-text)]"
                        }`}
                        aria-label={`Rate ${r}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)] shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Share feedback about the interviewee..."
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEvaluateModal(false)}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-muted)]/80"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit & End Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
