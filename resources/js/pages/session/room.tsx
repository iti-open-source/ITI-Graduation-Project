import AIChatbot from "@/components/ai-chatbot/ai-chatbot";
import CollaborativeEditor from "@/components/editor/collaborative-editor";
import { VideoCall } from "@/components/livekit/videoCall";
import Whiteboard from "@/components/whiteboard/collaborative-whiteboard";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { useState } from "react";

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
            <div className="flex min-h-96 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm lg:h-screen lg:max-h-[calc(100vh-8rem)]">
              {/* Video Header */}
              <div className="flex-shrink-0 border-b border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-[var(--color-text)]">Video Call</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-[var(--color-text)]">
                      {isCreator ? "Interviewer" : "Interviewee"}
                    </div>
                    {isVideoConnected && (
                      <div className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                      </div>
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
          <div className="flex w-full flex-col lg:min-w-0 lg:flex-1">
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
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-0 flex-1 overflow-hidden lg:h-[calc(100vh-12rem)]">
                <div className={activeTab === "editor" ? "block h-full" : "hidden h-full"}>
                  <CollaborativeEditor id={`session-${roomCode}`} />
                </div>
                <div className={activeTab === "whiteboard" ? "block h-full" : "hidden h-full"}>
                  <Whiteboard roomCode={roomCode} />
                </div>
                {isCreator && (
                  <div className={activeTab === "ai-chat" ? "block h-full" : "hidden h-full"}>
                    <AIChatbot roomCode={roomCode} isCreator={isCreator} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
