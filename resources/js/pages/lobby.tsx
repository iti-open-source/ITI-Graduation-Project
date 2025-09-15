import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomLayout from "@/layouts/custom-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Copy, Eye, Plus, Trash2, Users, Wind } from "lucide-react";
import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import AppLayout from "@/layouts/app-layout" ;

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
  student_interview_date?: string | null;
  student_interview_time?: string | null;
}

interface LobbyProps {
  userRooms: Room[];
  students: User[];
}

export default function Lobby({ userRooms, students }: LobbyProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ code: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const { auth } = usePage().props as any;
  const role = auth?.user?.role;

  const [interviewDates, setInterviewDates] = useState<{ [key: number]: string }>({});
  const [interviewTimes, setInterviewTimes] = useState<{ [key: number]: string }>({});


  const [searchQuery, setSearchQuery] = useState("");
  // Search in students (name/email only)
  const filteredStudents = students.filter(
    (s) =>
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      s.role === "student",
  );

  // Pagination for selected students
  const [selectedPage, setSelectedPage] = useState(1);
  const selectedPerPage = 2;
  const selectedTotalPages = Math.ceil(selectedStudents.length / selectedPerPage);
  const paginatedSelected = selectedStudents.slice(
    (selectedPage - 1) * selectedPerPage,
    selectedPage * selectedPerPage,
  );



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
      { name: roomName, students: studentsWithSchedule },
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

 function canStudentEnter(room: Room) {
  if (!room.student_interview_date || !room.student_interview_time) return false;

  const interviewDateTime = new Date(
    `${room.student_interview_date}T${room.student_interview_time}`
  );
  const now = new Date();

  // end window = interview start + 10 minutes (adjust as you like)
  const endWindow = new Date(interviewDateTime.getTime() + 10 * 60 * 1000);

  // they can enter only between start time and end window
  return now >= interviewDateTime && now <= endWindow;
}


  const copyRoomLink = (roomCode: string) => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(roomUrl);
    // Consider adding a toast notification here for better UX
  };

  const deleteRoom = (roomCode: string, roomName: string) => {
    setRoomToDelete({ code: roomCode, name: roomName });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!roomToDelete) return;

    setIsDeleting(true);
    router.delete(`/room/${roomToDelete.code}`, {
      preserveScroll: true,
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
      onFinish: () => {
        setIsDeleting(false);
        setRoomToDelete(null);
      },
    });
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
const isStudent = role === "student";
const Layout = isStudent ? CustomLayout : AppLayout;const breadcrumbs = [
  // { title: "Home", href: "/" },
  { title: "Lobby", href: "/lobby" },
];
  return (
    < Layout {...(!isStudent ? { breadcrumbs } : {})}>
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
            {role !== "student" && role !== null && showCreateForm && (
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

                      {/* Assign Students Section */}
                      <div className="">
                        <Label className="mb-3 block text-lg font-semibold">Assign Students</Label>

                        {/* Search Input */}
                        <Input
                          type="text"
                          placeholder="🔍 Search by name or email..."
                          className="mb-4"
                          onChange={(e) => setSearchQuery(e.target.value)}
                          value={searchQuery}
                        />

                        {/* Searchable Students (only role === "student") */}
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {searchQuery.trim() !== "" ? (
                            filteredStudents
                              .filter((s) => s.role === "student")
                              .map((student) => (
                                <div
                                  key={student.id}
                                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition shadow-sm ${selectedStudents.includes(student.id)
                                      ? "bg-primary/10 border-primary ring-2 ring-primary/40"
                                      : "hover:bg-muted"
                                    }`}
                                  onClick={() => {
                                    setSelectedStudents((prev) =>
                                      prev.includes(student.id)
                                        ? prev.filter((s) => s !== student.id)
                                        : [...prev, student.id],
                                    );
                                    setSelectedPage(Math.ceil((selectedStudents.length + 1) / selectedPerPage));
                                  }}
                                >
                                  <span className="font-medium">
                                    {student.name}{" "}
                                    <span className="text-muted-foreground text-sm">({student.email})</span>
                                  </span>
                                  {selectedStudents.includes(student.id) && (
                                    <Badge variant="secondary" className="px-2 py-0.5">✓ Selected</Badge>
                                  )}
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Start typing to search students...
                            </p>
                          )}
                        </div>

                        {/* Selected Students with Pagination */}
                        {selectedStudents.length > 0 && (
                          <div className="mt-6 space-y-4 rounded-xl border p-5 bg-gradient-to-br from-primary/5 via-white to-secondary/5 shadow-md">
                            <Label className="block text-base font-semibold mb-2">🎓 Selected Students</Label>

                            {paginatedSelected.map((id) => {
                              const student = students.find((s) => s.id === id);
                              if (!student) return null;
                              return (
                                <div
                                  key={id}
                                  className="relative space-y-3 rounded-lg border-l-4 border-primary bg-gradient-to-r from-primary/10 via-white to-primary/5 p-4 shadow-sm transition hover:shadow-md"
                                >
                                  {/* Deselect Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700"
                                    onClick={() =>
                                      setSelectedStudents((prev) => prev.filter((s) => s !== id))
                                    }
                                  >
                                    ✕
                                  </Button>

                                  {/* Student Info */}
                                  <p className="text-sm font-semibold text-primary">
                                    {student.name}{" "}
                                    <span className="ml-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-muted-foreground">
                                      {student.email}
                                    </span>
                                  </p>

                                  {/* Date + Time Pickers */}
                                  <div className="flex flex-col gap-4 sm:flex-row">
                                    {/* Interview Date */}
                                    <div className="flex flex-col flex-1">
                                      <Label className="mb-1 text-sm font-medium text-primary">Interview Date</Label>
                                      <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                          type="date"
                                          className="w-full rounded-md border border-primary/30 bg-white pl-10 pr-3 py-2 text-sm shadow-sm 
                   focus:border-primary focus:ring focus:ring-primary/30 transition"
                                          value={interviewDates[id] || ""}
                                          onChange={(e) =>
                                            setInterviewDates((prev) => ({
                                              ...prev,
                                              [id]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Interview Time */}
                                    <div className="flex flex-col flex-1">
                                      <Label className="mb-1 text-sm font-medium text-primary">Interview Time</Label>
                                      <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                          type="time"
                                          className="w-full rounded-md border border-primary/30 bg-white pl-10 pr-3 py-2 text-sm shadow-sm 
                   focus:border-primary focus:ring focus:ring-primary/30 transition"
                                          value={interviewTimes[id] || ""}
                                          onChange={(e) =>
                                            setInterviewTimes((prev) => ({
                                              ...prev,
                                              [id]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>



                                </div>
                              );
                            })}

                            {/* Pagination Controls */}
                            <div className="mt-5 flex items-center justify-between">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={selectedPage === 1}
                                onClick={() => setSelectedPage((p) => p - 1)}
                                className="hover:bg-primary/10"
                              >
                                ⬅ Prev
                              </Button>
                              <span className="text-sm font-medium text-primary">
                                Page {selectedPage} of {selectedTotalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={selectedPage === selectedTotalPages}
                                onClick={() => setSelectedPage((p) => p + 1)}
                                className="hover:bg-primary/10"
                              >
                                Next ➡
                              </Button>
                            </div>
                          </div>
                        )}

                      </div>




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
                          {/* Show interview schedule if student */}
                          {role === "student" &&
                            room.student_interview_date &&
                            room.student_interview_time && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">Your interview:</span>
                                <span className="flex items-center gap-1">
                                  📅{" "}
                                  {new Date(room.student_interview_date).toLocaleDateString(
                                    undefined,
                                    {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  ⏰{" "}
                                  {new Date(
                                    `${room.student_interview_date}T${room.student_interview_time}`,
                                  ).toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-2">
                          {/* <Button asChild className="flex-1">
                            <Link href={`/room/${room.room_code}`}>
                              <Eye className="mr-2 h-4 w-4" /> Enter Room
                            </Link>
                          </Button> */}

                          {role === "student" ? (
                            canStudentEnter(room) ? (
                              //student can enter
                              <Button asChild className="flex-1">
                                <Link href={`/room/${room.room_code}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Enter Room
                                </Link>
                              </Button>
                            ) : (
                              // student cannot enter yet
                              <Button disabled className="flex-1 opacity-50">
                                <Eye className="mr-2 h-4 w-4" /> Not Available Yet
                              </Button>
                            )
                          ) : (
                            // instructors/admins always can enter
                            <Button asChild className="flex-1">
                              <Link href={`/room/${room.room_code}`}>
                                <Eye className="mr-2 h-4 w-4" /> Enter Room
                              </Link>
                            </Button>
                          )}

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
                              onClick={() => deleteRoom(room.room_code, room.name)}
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

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Room"
          description={
            roomToDelete
              ? `Are you sure you want to delete "${roomToDelete.name}"? This action cannot be undone and all participants will be removed.`
              : "Are you sure you want to delete this room? This action cannot be undone and all participants will be removed."
          }
          confirmText="Delete Room"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
    </Layout>
  );
}
