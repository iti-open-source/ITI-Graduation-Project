import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, Signal, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

// --- Mock Implementations to resolve build errors ---
// In a real application, these would be imported from your project files and libraries.

const AppLayout = ({ children }: { children: React.ReactNode; breadcrumbs: any[] }) => (
  // A basic layout wrapper. In a real app, this would include navigation, footers, etc.
  <div className="relative flex min-h-screen flex-col bg-background">
    <main className="flex-1">{children}</main>
  </div>
);

const Head = ({ title }: { title: string }) => {
  React.useEffect(() => {
    if (title) document.title = title;
  }, [title]);
  return null;
};

const Link = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// Mock the custom hook `useRoomUpdates`
const useRoomUpdates = (roomCode: string, initialRoom: Room) => {
  console.log(`Mock useRoomUpdates: Subscribed to updates for room ${roomCode}`);
  // Simulate a stable connection for UI purposes
  return { room: initialRoom, isConnected: true };
};

// --- End Mock Implementations ---

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
  current_participant: User | null;
  queue: QueueUser[];
  queue_count: number;
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

  // Find current queue position from updated room data
  const currentQueueEntry = room.queue.find((q) => q.user?.id === initialQueueEntry?.user?.id);
  const queuePosition = currentQueueEntry?.position || initialQueuePosition;

  useEffect(() => {
    if (!initialQueueEntry?.joined_at) return;

    const interval = setInterval(() => {
      const joinedAt = new Date(initialQueueEntry.joined_at);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - joinedAt.getTime()) / 1000);
      setTimeInQueue(diffInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [initialQueueEntry?.joined_at]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const leaveQueue = () => {
    setIsLeaving(true);
    router.post(`/room/${room.room_code}/leave`);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  return (
    <AppLayout breadcrumbs={[]}>
      <Head title={`Waiting in Queue - ${room.name}`} />

      <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          {/* Header */}
          <div className="mb-8 flex">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/lobby">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lobby
              </Link>
            </Button>
          </div>

          {/* Main Content Card */}
          <Card className="w-full text-center shadow-sm">
            <CardHeader className="pb-4">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              >
                <Users className="h-10 w-10 text-primary" />
              </motion.div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                You're in the Queue
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Waiting to join <strong>{room.name}</strong>. The host will let you in soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-6">
                <p className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  Your Position
                </p>
                <div className="text-7xl font-bold tracking-tighter text-primary">
                  {queuePosition}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time in queue: {formatTime(timeInQueue)}</span>
                </div>
              </div>

              {/* Status and Leave Button */}
              <div className="flex flex-col items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Waiting for host to accept...</span>
                </div>
                <Button
                  onClick={leaveQueue}
                  variant="outline"
                  disabled={isLeaving}
                  className="w-full hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
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
              </div>
            </CardContent>
          </Card>

          {/* In-Call Status Card */}
          {room.current_participant && (
            <motion.div variants={fadeIn} className="mt-6">
              <Card className="border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200">
                <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Host is Currently Busy
                    </CardTitle>
                    <CardDescription className="text-blue-800/80 dark:text-blue-200/80">
                      In a call with {room.current_participant.name}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {/* Connection Status Footer */}
          <motion.div variants={fadeIn} className="mt-8 text-center text-sm">
            <Badge
              variant={isConnected ? "outline" : "destructive"}
              className={
                isConnected
                  ? "border-green-500/50 bg-green-500/10 font-normal text-green-700 dark:text-green-400"
                  : "font-normal"
              }
            >
              <Signal className="mr-2 h-3 w-3" />
              {isConnected ? "Real-time Connection Active" : "Disconnected"}
            </Badge>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
