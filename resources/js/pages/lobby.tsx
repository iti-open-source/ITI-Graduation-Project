import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Users,
  Wind,
  X,
} from "lucide-react";
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
  student_interview_date?: string | null;
  student_interview_time?: string | null;
  student_interview_done?: boolean;
  pivot?: {
    interview_done: boolean;
    is_absent: boolean;
  };
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

  const now = new Date();

  const upcomingRooms =
    role === "student"
      ? userRooms.filter((r) => {
          const interviewDate =
            r.student_interview_date && r.student_interview_time
              ? new Date(`${r.student_interview_date}T${r.student_interview_time}`)
              : null;

          return (
            interviewDate && interviewDate > now && !r.pivot?.interview_done && !r.pivot?.is_absent
          );
        })
      : userRooms;

  const pastRooms =
    role === "student"
      ? userRooms.filter((r) => r.pivot && (r.pivot.interview_done || r.pivot.is_absent))
      : [];

  // Hide completed/absent rooms for students in the main grid
  const visibleRooms =
    role === "student"
      ? userRooms.filter((r) => !(r.pivot?.interview_done || r.pivot?.is_absent))
      : userRooms;

  function canStudentEnter(room: Room) {
    const pivot = room.pivot;

    // Can't enter if no pivot info, or if interview is done, or student was absent
    if (!pivot || pivot.interview_done || pivot.is_absent) return false;

    if (!room.student_interview_date || !room.student_interview_time) return false;

    const interviewDateTime = new Date(
      `${room.student_interview_date}T${room.student_interview_time}`,
    );
    const now = new Date();

    // Only allow entering if interview time has arrived
    return now >= interviewDateTime;
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
  const breadcrumbs = [
    // { title: "Home", href: "/" },
    { title: "Lobby", href: "/lobby" },
  ];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Lobby" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="w-full">
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
                      <div className="relative mb-4">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search by name or email..."
                          className="pl-10"
                          onChange={(e) => setSearchQuery(e.target.value)}
                          value={searchQuery}
                        />
                      </div>

                      {/* Searchable Students (only role === "student") */}
                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                        {searchQuery.trim() !== "" ? (
                          filteredStudents
                            .filter((s) => s.role === "student")
                            .map((student) => (
                              <div
                                key={student.id}
                                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 shadow-sm transition ${
                                  selectedStudents.includes(student.id)
                                    ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => {
                                  setSelectedStudents((prev) =>
                                    prev.includes(student.id)
                                      ? prev.filter((s) => s !== student.id)
                                      : [...prev, student.id],
                                  );
                                  setSelectedPage(
                                    Math.ceil((selectedStudents.length + 1) / selectedPerPage),
                                  );
                                }}
                              >
                                <span className="font-medium">
                                  {student.name}{" "}
                                  <span className="text-sm text-muted-foreground">
                                    ({student.email})
                                  </span>
                                </span>
                                {selectedStudents.includes(student.id) && (
                                  <Badge variant="secondary" className="px-2 py-0.5">
                                    <Check className="mr-1 inline h-3 w-3" />
                                    Selected
                                  </Badge>
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
                        <div className="mt-6 space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                          <Label className="mb-2 block text-base font-semibold text-foreground">
                            <GraduationCap className="mr-1 inline h-4 w-4" />
                            Selected Students
                          </Label>

                          {paginatedSelected.map((id) => {
                            const student = students.find((s) => s.id === id);
                            if (!student) return null;
                            return (
                              <div
                                key={id}
                                className="relative space-y-3 rounded-lg border bg-muted/40 p-4 transition-colors hover:bg-muted/60"
                              >
                                {/* Deselect Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() =>
                                    setSelectedStudents((prev) => prev.filter((s) => s !== id))
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>

                                {/* Student Info */}
                                <div className="pr-8">
                                  <p className="text-sm font-semibold text-foreground">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                </div>

                                {/* Date + Time Pickers */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {/* Interview Date */}
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium text-foreground">
                                      Interview Date
                                    </Label>
                                    <div className="relative">
                                      <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        type="date"
                                        className="pl-10 text-sm"
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
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium text-foreground">
                                      Interview Time
                                    </Label>
                                    <div className="relative">
                                      <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        type="time"
                                        className="pl-10 text-sm"
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
                          <div className="flex items-center justify-between border-t pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={selectedPage === 1}
                              onClick={() => setSelectedPage((p) => p - 1)}
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {selectedPage} of {selectedTotalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={selectedPage === selectedTotalPages}
                              onClick={() => setSelectedPage((p) => p + 1)}
                            >
                              Next
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
          {visibleRooms.length > 0 ? (
            <div className="mb-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRooms.map((room) => (
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
                        {/* Info Tags - hidden for students */}
                        {role !== "student" && (
                          <>
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
                          </>
                        )}
                        {/* Show interview schedule if student */}
                        {role === "student" &&
                          room.student_interview_date &&
                          room.student_interview_time && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">Your interview:</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
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
                                <Clock className="h-3 w-3" />
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
                              <Eye className="mr-2 h-4 w-4" />{" "}
                              {room.pivot?.is_absent
                                ? "Absent"
                                : room.pivot?.interview_done
                                  ? "Completed"
                                  : "Not Available Yet"}
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

                        {role !== "student" && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyRoomLink(room.room_code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
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
            <motion.div variants={fadeIn} className="py-4 text-center">
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Wind className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">It's quiet in here...</h3>
                <p className="mb-2 text-muted-foreground">
                  {role === "student"
                    ? "No rooms have been assigned to you yet."
                    : "Create your first interview room to get started."}
                </p>
                {/* Students can't create rooms */}
                {role !== "student" && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Room
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* STUDENT VIEW */}
          {role === "student" && (
            <>
              {/* Upcoming */}
              {upcomingRooms.length > 0 && (
                <>
                  <h2 className="mt-12 mb-4 text-2xl font-semibold">Upcoming Interviews</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingRooms.map((room) => (
                      <motion.div key={room.id} variants={fadeIn} whileHover={{ y: -5 }}>
                        <Card className="flex h-full flex-col overflow-hidden transition-all hover:border-primary/50">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{room.name}</CardTitle>
                                <CardDescription>Code: {room.room_code}</CardDescription>
                              </div>
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                Upcoming
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                            {room.student_interview_date && room.student_interview_time && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">Your interview:</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
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
                                  <Clock className="h-3 w-3" />
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
                            <div className="mt-4 flex items-center gap-2">
                              {canStudentEnter(room) ? (
                                <Button asChild className="flex-1">
                                  <Link href={`/room/${room.room_code}`}>
                                    <Eye className="mr-2 h-4 w-4" /> Enter Room
                                  </Link>
                                </Button>
                              ) : (
                                <Button disabled className="flex-1 opacity-50">
                                  <Eye className="mr-2 h-4 w-4" /> Not Available Yet
                                </Button>
                              )}
                              {/* Copy button hidden for students */}
                              {role !== "student" && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => copyRoomLink(room.room_code)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Past Interviews removed for student on Lobby */}
              {/**
               {pastRooms.length > 0 && (
                 <>
                   <h2 className="mt-12 mb-4 text-2xl font-semibold">Past Interviews</h2>
                   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {pastRooms.map((room) => {
                       const pivot = room.pivot;
                       let statusText = "";
                       let statusBadge: "destructive" | "secondary" = "secondary";
                       if (pivot?.is_absent) {
                         statusText = "Absent";
                         statusBadge = "destructive";
                       } else if (pivot?.interview_done) {
                         statusText = "Completed";
                         statusBadge = "secondary";
                       }
                       return (
                         <motion.div key={room.id} variants={fadeIn} whileHover={{ y: -5 }}>
                           <Card className="flex h-full flex-col overflow-hidden opacity-70 transition-all hover:border-primary/50">
                             <CardHeader>...content removed...</CardHeader>
                           </Card>
                         </motion.div>
                       );
                     })}
                   </div>
                 </>
               )}
               */}
            </>
          )}
        </motion.div>

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
    </AppLayout>
  );
}
