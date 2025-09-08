import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoomUpdates } from "@/hooks/use-room-updates";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Lobby",
    href: "/lobby",
  },
  {
    title: "Room",
    href: "#",
  },
];

interface User {
  id: number;
  name: string;
  email: string;
}

interface QueueUser {
  id: number;
  position: number;
  joined_at: string;
  user: User;
}

interface Room {
  id: number;
  name: string;
  room_code: string;
  is_active: boolean;
  last_activity: string;
  current_participant: User | null;
  queue: QueueUser[];
  queue_count: number;
}

interface CreatorProps {
  room: Room;
}

export default function Creator({ room: initialRoom }: CreatorProps) {
  const [copied, setCopied] = useState(false);
  const { auth } = usePage<SharedData>().props;
  const { room, isConnected } = useRoomUpdates(initialRoom.room_code, initialRoom);

  console.log(
    `[Creator] Initializing creator component for room ${room.room_code}, user ${auth.user.id}`,
  );

  // Lobby only: no in-lobby WebRTC

  const copyRoomLink = () => {
    const roomUrl = `${window.location.origin}/room/${room.room_code}`;
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinUser = async (userId: number) => {
    console.log(`[Creator] Accepting user ${userId} and initiating WebRTC call`);

    try {
      // Get CSRF token from meta tag
      const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
        ?.content;
      console.log(`[Creator] CSRF Token:`, csrfToken ? "Found" : "Missing");

      const response = await fetch(`/room/${room.room_code}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrfToken || "",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      console.log(`[Creator] Response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        const sessionCode = result.sessionCode || room.room_code;
        console.log(`[Creator] User ${userId} accepted, redirecting to session ${sessionCode}`);
        window.location.href = `/session/${sessionCode}`;
      } else {
        const errorText = await response.text();
        console.error(`[Creator] Failed to accept user ${userId}:`, response.status, errorText);
      }
    } catch (error) {
      console.error(`[Creator] Error accepting user ${userId}:`, error);
    }
  };

  // const disconnectUser = () => {
  //   router.post(`/room/${room.room_code}/disconnect`);
  // };

  const deleteRoom = () => {
    if (confirm("Are you sure you want to delete this room?")) {
      router.delete(`/room/${room.room_code}`);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Room: ${room.name}`} />

      {!isConnected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-4 text-[var(--color-text)] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Realtime connection lost. Reconnecting…
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[var(--background)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-8">
            <div className="mb-6 flex items-center gap-6">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              >
                <Link href="/lobby">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Lobby
                </Link>
              </Button>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-[var(--color-text)]">{room.name}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-[var(--color-text-secondary)]">
                    Room Code:{" "}
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {room.room_code}
                    </span>
                  </p>
                  <Badge
                    className={
                      isConnected
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={copyRoomLink}
                  variant="outline"
                  className="border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy Link"}
                </Button>

                <Button
                  onClick={deleteRoom}
                  variant="outline"
                  className="border-red-300 bg-[var(--color-card-bg)] text-red-600 hover:bg-red-600 hover:text-white dark:border-red-700 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Room
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Queue */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
              <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[var(--color-text)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        Waiting Queue
                        {room.queue_count > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            {room.queue_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-normal text-[var(--color-text-secondary)]">
                        Users waiting to join your room
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {room.queue.length > 0 ? (
                    <div className="space-y-3">
                      {room.queue.map((queueItem) => (
                        <motion.div
                          key={queueItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 rounded-lg bg-[var(--color-muted)] p-4 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <div className="flex flex-1 items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                              {queueItem.position}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-50 font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {queueItem.user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-medium text-[var(--color-text)]">
                                {queueItem.user.name}
                              </h4>
                              <p className="truncate text-sm text-[var(--color-text-secondary)]">
                                {queueItem.user.email}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => joinUser(queueItem.user.id)}
                            size="sm"
                            className="border-0 bg-blue-500 text-white hover:bg-blue-600"
                            disabled={false}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-muted)]">
                        <Users className="h-8 w-8 text-[var(--color-text-secondary)]" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
                        No one waiting
                      </h3>
                      <p className="text-[var(--color-text-secondary)]">
                        Share your room link to invite participants
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Sessions */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
              <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-[var(--color-text)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        Active Sessions
                        {(() => {
                          const sessions = Array.isArray((room as any).sessions)
                            ? (room as any).sessions.filter((s: any) => s.status === "active")
                            : [];
                          return sessions.length > 0 ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {sessions.length}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                      <p className="text-sm font-normal text-[var(--color-text-secondary)]">
                        Ongoing sessions created from this lobby
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const sessions = Array.isArray((room as any).sessions)
                      ? (room as any).sessions.filter((s: any) => s.status === "active")
                      : [];
                    if (sessions.length === 0) {
                      return (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-muted)]">
                            <Users className="h-8 w-8 text-[var(--color-text-secondary)]" />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
                            No active sessions
                          </h3>
                          <p className="text-[var(--color-text-secondary)]">
                            Sessions will appear here when participants join
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {sessions.map((s: any) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between rounded-lg bg-[var(--color-muted)] p-4 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-[var(--color-text)]">
                                Session:{" "}
                                <span className="font-mono text-slate-600 dark:text-slate-300">
                                  {s.session_code}
                                </span>
                              </div>
                              <div className="text-sm text-[var(--color-text-secondary)]">
                                Status: <span className="capitalize">{s.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                active
                              </Badge>
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                              >
                                <a href={`/session/${s.session_code}`}>Open</a>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Room Link Card */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mt-8">
            <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[var(--color-text)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <Copy className="h-5 w-5" />
                  </div>
                  <div>
                    <div>Share Room Link</div>
                    <p className="text-sm font-normal text-[var(--color-text-secondary)]">
                      Send this link to participants to join your room
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg bg-[var(--color-muted)] p-4">
                  <code className="flex-1 font-mono text-sm text-[var(--color-text)]">
                    {window.location.origin}/room/{room.room_code}
                  </code>
                  <Button
                    onClick={copyRoomLink}
                    size="sm"
                    variant="outline"
                    className="border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
