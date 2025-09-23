import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoomUpdates } from "@/hooks/use-room-updates";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  sessions?: { id: number; session_code: string; status: string }[];
  assignedStudents?: { id: number; name: string; email: string }[];
}

interface QueueProps {
  room: Room;
  queuePosition: number;
  queueEntry: QueueUser;
}

export default function Queue({
  room: initialRoom,
  queuePosition: initialQueuePosition,
  queueEntry: initialQueueEntry,
}: QueueProps) {
  const [timeInQueue, setTimeInQueue] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const { room, isConnected } = useRoomUpdates(initialRoom.room_code, initialRoom);
  // Two hydration flags to avoid running checks before we receive data
  const [queueHydrated, setQueueHydrated] = useState(false);
  const [assignedHydrated, setAssignedHydrated] = useState(false);

  // Find current queue position from updated room data
  const currentQueueEntry = room.queue.find((q) => q.user?.id === initialQueueEntry?.user?.id);
  const queuePosition = currentQueueEntry?.position || initialQueuePosition;

  // Auto-redirect when accepted (current participant becomes this user)
  useEffect(() => {
    const isThisUserActive = room.current_participant?.id === initialQueueEntry?.user?.id;
    if (!isThisUserActive) return;

    const activeSession = Array.isArray(room.sessions)
      ? room.sessions.find(
          (s: { id: number; session_code: string; status: string }) => s.status === "active",
        )
      : undefined;
    if (activeSession?.session_code) {
      router.visit(`/session/${activeSession.session_code}`);
    }
  }, [room.current_participant?.id, room.sessions, initialQueueEntry?.user?.id]);

  useEffect(() => {
    if (!initialQueueEntry?.joined_at) return;

    const interval = setInterval(() => {
      const joinedAt = new Date(initialQueueEntry.joined_at);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - joinedAt.getTime()) / 1000);
      setTimeInQueue(diffInSeconds);
    }, 4000);

    return () => clearInterval(interval);
  }, [initialQueueEntry?.joined_at]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const leaveQueue = () => {
    setIsLeaving(true);
    router.post(
      `/room/${room.room_code}/leave`,
      {},
      {
        headers: {
          "X-CSRF-TOKEN":
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
      },
    );
  };

  // Auto-redirect when removed/unassigned from the queue or unassigned from room
  // Auto-redirect when removed/unassigned from the queue or unassigned from room
  const { queue, assignedStudents } = room as any;

  // useEffect(() => {
  //   if (!initialQueueEntry?.user?.id) return;
  //   const needAssigned = true;
  //   if (!queueHydrated) return;
  //   if (needAssigned && !assignedHydrated) return;

  //   const userId = initialQueueEntry.user.id;
  //   const stillInQueue = queue.some((q:any) => q.user?.id === userId);

  //   const assignedList = Array.isArray(assignedStudents) ? assignedStudents : [];
  //   const stillAssigned = assignedList.some((s: any) => s.id === userId);

  //   if (!stillInQueue || !stillAssigned) {
  //     if (!stillAssigned) {
  //       toast.error("You were unassigned from this room by the instructor.");
  //     } else {
  //       toast.error("You have been removed from the queue.");
  //     }

  //     router.visit("/dashboard", {
  //       preserveScroll: false,
  //       preserveState: false,
  //     });
  //   }
  // }, [queue, assignedStudents, initialQueueEntry?.user?.id, queueHydrated, assignedHydrated,]);

  useEffect(() => {
  if (!initialQueueEntry?.user?.id) return;
  if (!queueHydrated) return;
  if (!assignedHydrated) return;

  const userId = initialQueueEntry.user.id;
  const isActiveParticipant = room.current_participant?.id === userId;
  if (isActiveParticipant) return;

  const stillInQueue = queue.some((q: any) => q.user?.id === userId);
  const assignedList = Array.isArray(assignedStudents) ? assignedStudents : [];
  const stillAssigned = assignedList.some((s: any) => s.id === userId);

  if (!stillInQueue || !stillAssigned) {
    if (!stillAssigned) {
      toast.error("You were unassigned from this room by the instructor.");
    } else {
      toast.error("You have been removed from the queue.");
    }

    router.visit("/dashboard", {
      preserveScroll: false,
      preserveState: false,
    });
  }
}, [
  queue,
  assignedStudents,
  initialQueueEntry?.user?.id,
  queueHydrated,
  assignedHydrated,
  room.current_participant?.id, 
]);



  // If initialRoom has queue/assignedStudents, mark hydrated immediately
  useEffect(() => {
    if (Array.isArray(initialRoom.queue) && initialRoom.queue.length > 0) {
      setQueueHydrated(true);
    }
    if (
      Array.isArray((initialRoom as any).assignedStudents) &&
      (initialRoom as any).assignedStudents.length > 0
    ) {
      setAssignedHydrated(true);
    }
  }, [initialRoom]);

  // Set hydration once the live room data has non-empty arrays at least once
  useEffect(() => {
    if (Array.isArray(room.queue) && room.queue.length > 0) {
      setQueueHydrated(true);
    }
  }, [room.queue]);

  useEffect(() => {
    if (
      Array.isArray((room as any).assignedStudents) &&
      (room as any).assignedStudents.length > 0
    ) {
      setAssignedHydrated(true);
    }
  }, [(room as any).assignedStudents]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const pulse = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Waiting in Queue - ${room.name}`} />

      <div className="min-h-screen bg-[var(--background)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mb-8 flex items-center justify-between"
          >
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
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Status */}
            <div className="space-y-6 lg:col-span-2">
              {/* Hero Section */}
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="text-center"
              >
                <motion.div
                  variants={pulse}
                  animate="animate"
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-lg"
                >
                  <Users className="h-10 w-10 text-white" />
                </motion.div>

                <h1 className="mb-3 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                  Waiting in Queue
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                  You're in line for{" "}
                  <span className="font-semibold text-[var(--color-text)]">{room.name}</span>
                </p>
              </motion.div>

              {/* Queue Position Card */}
              <motion.div variants={fadeIn} initial="hidden" animate="visible">
                <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
                  <CardContent className="p-8">
                    <div className="space-y-4 text-center">
                      <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                        <span className="text-4xl font-bold text-[var(--color-text)]">
                          #{queuePosition}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-[var(--color-text-secondary)]">
                          Your position
                        </p>
                        <p className="text-lg font-semibold text-[var(--color-text)]">
                          {queuePosition === 1
                            ? "You're next!"
                            : `${queuePosition - 1} ahead of you`}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                        <Clock className="h-4 w-4" />
                        <span>Waiting for {formatTime(timeInQueue)}</span>
                      </div>

                      {room.queue_count > 1 && (
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {room.queue_count} people in queue
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Current Call Status */}
              {room.current_participant && (
                <motion.div variants={fadeIn} initial="hidden" animate="visible">
                  <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text)]">
                            Currently in session
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {room.current_participant.name} is interviewing
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column - Room Info & Actions */}
            <div className="space-y-6">
              {/* Room Information */}
              <motion.div variants={fadeIn} initial="hidden" animate="visible">
                <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-[var(--color-text)]">Room Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-secondary)]">Name</span>
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {room.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-secondary)]">Code</span>
                        <Badge
                          variant="outline"
                          className="border-[var(--color-border)] font-mono text-xs text-[var(--color-text)]"
                        >
                          {room.room_code}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-secondary)]">Status</span>
                        <Badge className="bg-yellow-100 text-xs text-yellow-800">In Queue</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Connection Status */}
              <motion.div variants={fadeIn} initial="hidden" animate="visible">
                <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">Connection</span>
                      <Badge
                        className={
                          isConnected
                            ? "bg-green-100 text-xs text-green-800"
                            : "bg-red-100 text-xs text-red-800"
                        }
                      >
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>

                    {isConnected && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Waiting for acceptance...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Button */}
              <motion.div variants={fadeIn} initial="hidden" animate="visible">
                <Button
                  onClick={leaveQueue}
                  variant="outline"
                  disabled={isLeaving}
                  className="w-full border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                >
                  {isLeaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    "Leave Queue"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
