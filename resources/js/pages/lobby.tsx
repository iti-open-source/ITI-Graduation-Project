import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomLayout from "@/layouts/custom-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Copy, Eye, EyeOff, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Lobby",
    href: "/lobby",
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

interface LobbyProps {
  userRooms: Room[];
}

export default function Lobby({ userRooms }: LobbyProps) {
  const props = usePage().props;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const roomName = formData.get("name") as string;

    if (!roomName) return;

    setIsCreating(true);

    router.post(
      "/rooms",
      {
        name: roomName,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setIsCreating(false);
        },
        onError: (errors) => {
          console.error("Room creation errors:", errors);
          setIsCreating(false);
        },
        onFinish: () => {
          setIsCreating(false);
        },
      },
    );
  };

  const copyRoomLink = (roomCode: string) => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(roomUrl);
    // You could add a toast notification here
  };

  const deleteRoom = (roomCode: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      router.delete(`/room/${roomCode}`);
    }
  };

  // No realtime overlay on lobby; realtime is handled inside room and session pages

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <CustomLayout>
      <Head title="Lobby" />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Interview Rooms</h1>
              <p className="mt-2 text-[var(--color-text-secondary)]">
                Create and manage your interview rooms
              </p>
            </div>

            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[var(--color-button-primary-bg)] text-white hover:bg-[var(--color-button-primary-hover)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </div>

          {/* Create Room Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text)]">Create New Room</CardTitle>
                  <CardDescription className="text-[var(--color-text-secondary)]">
                    Create a new interview room and share the link with participants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="roomName" className="text-[var(--color-text)]">
                        Room Name
                      </Label>
                      <Input
                        id="roomName"
                        name="name"
                        type="text"
                        placeholder="Enter room name..."
                        className="border-[var(--color-card-shadow)] bg-[var(--color-section-alt-bg)]/70 focus:ring-2 focus:ring-[var(--color-accent)]"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isCreating}
                        className="bg-[var(--color-button-primary-bg)] text-white hover:bg-[var(--color-button-primary-hover)]"
                      >
                        {isCreating ? "Creating..." : "Create Room"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Rooms Grid */}
          {userRooms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userRooms.map((room) => (
                <motion.div
                  key={room.id}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-[var(--color-card-shadow)] bg-[var(--color-card-bg)] transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-[var(--color-text)]">
                            {room.name}
                          </CardTitle>
                          <CardDescription className="text-[var(--color-text-secondary)]">
                            Code: {room.room_code}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {room.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Current Participant */}
                      {room.current_participant ? (
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800 dark:text-blue-200">
                            In call with: {room.current_participant.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                          <EyeOff className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            No active participant
                          </span>
                        </div>
                      )}

                      {/* Queue */}
                      {room.queue_count > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                          <Users className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">
                            {room.queue_count} user{room.queue_count !== 1 ? "s" : ""} in queue
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 bg-[var(--color-button-primary-bg)] text-white hover:bg-[var(--color-button-primary-hover)]"
                        >
                          <Link href={`/room/${room.room_code}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Enter Room
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyRoomLink(room.room_code)}
                          className="border-[var(--color-card-shadow)] text-[var(--color-text)]"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRoom(room.room_code)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="py-12 text-center"
            >
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-section-alt-bg)]">
                  <Users className="h-8 w-8 text-[var(--color-text-secondary)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
                  No rooms yet
                </h3>
                <p className="mb-6 text-[var(--color-text-secondary)]">
                  Create your first interview room to get started
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[var(--color-button-primary-bg)] text-white hover:bg-[var(--color-button-primary-hover)]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Room
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </CustomLayout>
  );
}
