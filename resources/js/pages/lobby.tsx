import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomLayout from "@/layouts/custom-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Copy, Eye, Plus, Trash2, Users, Wind } from "lucide-react";
import { useState } from "react";
// It's good practice to define types in a separate file, but here's a quick reference
interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Room {
  id: number;
  name: string;
  room_code: string;
  is_active: boolean;
  current_participant: User | null;
  queue_count: number;
}

interface LobbyProps {
  userRooms: Room[];
  students: User[];
}

export default function Lobby({ userRooms ,students }: LobbyProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
 const { auth } = usePage().props as { auth: { user: User } };
  const role = auth?.user?.role;

  const [interviewDates, setInterviewDates] = useState<{ [key: number]: string }>({});
const [interviewTimes, setInterviewTimes] = useState<{ [key: number]: string }>({});


  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roomName = formData.get("name") as string;
    if (!roomName) return;
const studentsWithSchedule = selectedStudents.map((id) => ({
    id,
    interview_date: interviewDates[id] || null,
    interview_time: interviewTimes[id] || null,
  }));
    

    setIsCreating(true);
    router.post(
      "/rooms",
      { name: roomName , students: studentsWithSchedule  },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setSelectedStudents([]);
        setInterviewDates({});
        setInterviewTimes({});
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
    // Consider adding a toast notification here for better UX
  };

  const deleteRoom = (roomCode: string) => {
    if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      router.delete(`/room/${roomCode}`, {
        preserveScroll: true,
      });
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  return (
    <CustomLayout>
      <Head title="Lobby" />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-7xl"
          >
            {/* Header */}
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Interview Rooms</h1>
                <p className="mt-2 text-muted-foreground">
                  {role === "student"
                    ? "Here are the rooms assigned to you."
                    : "Create, manage, and join your interview rooms."}
                </p>
              </div>
              {role !== "student" && (
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Room
                </Button>
              )}
            </div>

            {/* Create Room Form */}
            {role !== "student" && showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-10"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create a New Room</CardTitle>
                    <CardDescription>
                      Give your room a name and share the link with participants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                      <div>
                        <Label htmlFor="roomName" className="mb-2 block">
                          Room Name
                        </Label>
                        <Input
                          id="roomName"
                          name="name"
                          type="text"
                          placeholder="e.g., Senior Frontend Developer"
                          required
                        />
                      </div>
                       {/* Student Assignment */}

                       {role !== "student" && role !== null && (
<div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-2">
  <Label className="mb-2 block font-medium">Assign Students:</Label>
  {students.map((student) => (
    <div key={student.id} className="flex flex-col gap-1 border-b pb-1">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          value={student.id}
          checked={selectedStudents.includes(student.id)}
          onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedStudents((prev) =>
              prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
            );
          }}
          className="h-4 w-4"
        />
        <span>{student.name} ({student.email})</span>
      </label>

      {selectedStudents.includes(student.id) && (
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded-md p-1 text-sm flex-1"
            value={interviewDates[student.id] || ""}
            onChange={(e) =>
              setInterviewDates((prev) => ({ ...prev, [student.id]: e.target.value }))
            }
          />
          <input
            type="time"
            className="border rounded-md p-1 text-sm flex-1"
            value={interviewTimes[student.id] || ""}
            onChange={(e) =>
              setInterviewTimes((prev) => ({ ...prev, [student.id]: e.target.value }))
            }
          />
        </div>
      )}
    </div>
  ))}
</div>

                      )}



                      <div className="flex items-center gap-2">
                        <Button type="submit" disabled={isCreating}>
                          {isCreating ? "Creating..." : "Confirm & Create"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowCreateForm(false)}
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userRooms.map((room) => (
                  <motion.div key={room.id} variants={fadeIn} whileHover={{ y: -5 }}>
                    <Card className="flex h-full flex-col overflow-hidden transition-all hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{room.name}</CardTitle>
                            <CardDescription>Code: {room.room_code}</CardDescription>
                          </div>
                          {room.is_active ? (
                            <Badge
                              variant="outline"
                              className="border-green-500 bg-green-500/10 text-green-500"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          {/* Info Tags */}
                          {room.current_participant ? (
                            <div className="flex items-center gap-2 text-sm text-accent-foreground">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span>In call with: {room.current_participant.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Room is empty</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {room.queue_count} user{room.queue_count !== 1 ? "s" : ""} in queue
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-2">
                          <Button asChild className="flex-1">
                            <Link href={`/room/${room.room_code}`}>
                              <Eye className="mr-2 h-4 w-4" /> Enter Room
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyRoomLink(room.room_code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {role !== "student" && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => deleteRoom(room.room_code)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div variants={fadeIn} className="py-16 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Wind className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">It's quiet in here...</h3>
                   <p className="mb-6 text-muted-foreground">
                    {role === "student"
                      ? "No rooms have been assigned to you yet."
                      : "Create your first interview room to get started."}
                  </p>
                   {/* ✅ Students can’t create rooms */}
                  {role !== "student" && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Room
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </CustomLayout>
  );
}
