import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import {
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  ExternalLink,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Profile",
    href: "/profile",
  },
];

interface Room {
  id: number;
  name: string;
  room_code: string;
  is_active: boolean;
  assignedStudents?: { id: number; name: string; email: string }[];
  assignedStudentsCount?: number;
  last_activity: string;
}

interface UpcomingInterview {
  id: number;
  room_name: string;
  room_code: string;
  interview_date?: string | null;
  interview_time?: string | null;
  instructor_name: string;
  is_absent: boolean;
  interview_done: boolean;
}

interface PreviousInterviewItem {
  session_id: number;
  session_code: string;
  room_name: string;
  room_code: string;
  instructor_name: string;
  ended_at?: string | null;
  rating?: number | null;
  comments?: string | null;
}

interface ProfilePageProps extends SharedData {
  userRooms?: Room[];
  upcomingInterviews?: UpcomingInterview[];
  previousInterviews?: PreviousInterviewItem[];
}

export default function Profile() {
  const {
    auth,
    userRooms = [],
    upcomingInterviews = [],
    previousInterviews = [],
  } = usePage<ProfilePageProps>().props;

  console.log(usePage<ProfilePageProps>().props);

  console.log("User Rooms:", userRooms);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");
  const [upcoming, setUpcoming] = useState<UpcomingInterview[]>(upcomingInterviews || []);
  const [previous, setPrevious] = useState<PreviousInterviewItem[]>(previousInterviews || []);
  const pollRef = useRef<number | null>(null);
  // Pagination for previous interviews
  const [prevPage, setPrevPage] = useState(1);
  const PREV_PER_PAGE = 5;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState<PreviousInterviewItem | null>(null);

  // Ensure current page is valid when data updates
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(previous.length / PREV_PER_PAGE));
    if (prevPage > totalPages) setPrevPage(totalPages);
  }, [previous.length, prevPage]);

  useEffect(() => {
    let aborted = false;
    const fetchState = async () => {
      try {
        const res = await fetch("/api/dashboard/state", {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!aborted) {
          setUpcoming((json.upcomingInterviews as UpcomingInterview[]) || []);
          setPrevious((json.previousInterviews as PreviousInterviewItem[]) || []);
        }
      } catch {}
    };
    fetchState();
    pollRef.current = window.setInterval(fetchState, 5000);
    return () => {
      aborted = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  // Redirect admins away from this page
  if (auth.user.role === "admin") {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Profile" />
        <div className="flex h-full flex-1 flex-col items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>Profile pages are not available for administrators.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/lobby">Go to Lobby</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleSaveRoomName = (roomId: number) => {
    // TODO: Implement room name update API call
    console.log("Updating room", roomId, "to name:", editingRoomName);
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setEditingRoomName("");
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "TBD";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "TBD";
    const parts = timeStr.split(":");
    if (parts.length < 2) return "TBD";
    const [hours, minutes] = parts;
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    if (isNaN(date.getTime())) return "TBD";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const StatusButton = (interview: UpcomingInterview): React.ReactElement => {
    let buttonToRender;

    if (interview.interview_done && !interview.is_absent) {
      buttonToRender = (
        <Button
          size="sm"
          disabled
          variant="outline"
          className="cursor-not-allowed border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
        >
          <Clock className="mr-2 h-4 w-4" />
          Completed
        </Button>
      );
    } else if (interview.is_absent) {
      buttonToRender = (
        <Button
          size="sm"
          disabled
          variant="outline"
          className="cursor-not-allowed border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          <Clock className="mr-2 h-4 w-4" />
          Absent
        </Button>
      );
    } else if (!isUpcoming(interview.interview_date, interview.interview_time)) {
      buttonToRender = (
        <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href={`/room/${interview.room_code}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Join Interview
          </Link>
        </Button>
      );
    } else {
      buttonToRender = (
        <Button
          size="sm"
          disabled
          variant="outline"
          className="cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          <Clock className="mr-2 h-4 w-4" />
          Not yet Available
        </Button>
      );
    }

    return buttonToRender;
  };

  const isUpcoming = (dateStr?: string | null, timeStr?: string | null) => {
    if (!dateStr || !timeStr) return true; // if not set, treat as upcoming (not joinable)
    const interviewDateTime = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(interviewDateTime.getTime())) return true;
    return interviewDateTime > new Date();
  };

  const InterviewBadge = (interview: UpcomingInterview): React.ReactNode => {
    if (interview.interview_done && !interview.is_absent) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        >
          Completed
        </Badge>
      );
    } else if (interview.is_absent) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        >
          Absent
        </Badge>
      );
    } else if (!isUpcoming(interview.interview_date, interview.interview_time)) {
      return (
        <Badge
          variant="default"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        >
          Available Now
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        >
          Scheduled
        </Badge>
      );
    }
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {auth.user.role === "instructor" ? "Instructor Dashboard" : "Student Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {auth.user.role === "instructor"
                ? "Manage your interview rooms and track student assignments"
                : "View your upcoming interviews and track your progress"}
            </p>
          </div>
        </div>

        {/* Instructor Content */}
        {auth.user.role === "instructor" && (
          <>
            {/* Room Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userRooms.length}</div>
                  <p className="text-xs text-muted-foreground">Active interview rooms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userRooms.reduce(
                      (total, room) => total + (room.assignedStudentsCount || 0),
                      0,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all rooms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userRooms.length > 0
                      ? Math.round(
                          userRooms.reduce(
                            (total, room) => total + (room.assignedStudentsCount || 0),
                            0,
                          ) / userRooms.length,
                        )
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per room</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/lobby">Manage Rooms</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* My Rooms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  My Interview Rooms
                </CardTitle>
                <CardDescription>Manage and access your interview rooms</CardDescription>
              </CardHeader>
              <CardContent>
                {userRooms.length > 0 ? (
                  <div className="space-y-4">
                    {userRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1 space-y-1">
                          {editingRoomId === room.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingRoomName}
                                onChange={(e) => setEditingRoomName(e.target.value)}
                                className="rounded border px-2 py-1 text-lg font-medium"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleSaveRoomName(room.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-medium">{room.name}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditRoom(room)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              Code: {room.room_code}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {room.assignedStudentsCount || 0} students assigned
                            </span>
                            <Badge variant={room.is_active ? "default" : "secondary"}>
                              {room.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/room/${room.room_code}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Enter Room
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No rooms yet</h3>
                    <p className="mb-4 text-muted-foreground">
                      Create your first interview room to get started
                    </p>
                    <Button asChild>
                      <Link href="/lobby">Create Room</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Student Content */}
        {auth.user.role === "student" && (
          <>
            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Interviews
                </CardTitle>
                <CardDescription>Your scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent>
                {upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {upcoming.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{interview.room_name}</h4>
                            {InterviewBadge(interview)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Instructor: {interview.instructor_name}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(interview.interview_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(interview.interview_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              Room: {interview.room_code}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">{StatusButton(interview)}</div>
                      </div>
                    ))}
                    {/* Pagination removed in polling mode */}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No upcoming interviews</h3>
                    <p className="text-muted-foreground">
                      Your scheduled interviews will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Interviews with Feedback (with pagination) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Previous Interviews
                </CardTitle>
                <CardDescription>Your completed interview and feedback history</CardDescription>
              </CardHeader>
              <CardContent>
                {previous.length > 0 ? (
                  <div className="space-y-4">
                    {previous
                      .slice((prevPage - 1) * PREV_PER_PAGE, prevPage * PREV_PER_PAGE)
                      .map((it) => {
                        const r = typeof it.rating === "number" ? it.rating : null;
                        const ratingBadgeClass =
                          r === null
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            : r >= 8
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : r >= 5
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
                        const leftBorderClass =
                          r === null
                            ? "border-l-gray-300 dark:border-l-gray-700"
                            : r >= 8
                              ? "border-l-green-500"
                              : r >= 5
                                ? "border-l-yellow-500"
                                : "border-l-red-500";
                        const endedAtStr = it.ended_at
                          ? new Date(it.ended_at as any).toLocaleString()
                          : null;
                        return (
                          <div
                            key={it.session_id}
                            className={`rounded-xl border border-l-4 border-[var(--color-border)] bg-card/60 p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md ${leftBorderClass}`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <h4 className="text-base font-semibold tracking-tight text-[var(--color-text)]">
                                    {it.room_name}
                                  </h4>
                                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    Ended
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Instructor: {it.instructor_name}
                                </p>
                                {endedAtStr && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{endedAtStr}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${ratingBadgeClass}`}
                                >
                                  {r === null ? "No Rating" : `Rating: ${r}/10`}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setFeedbackItem(it);
                                    setFeedbackOpen(true);
                                  }}
                                >
                                  Show Feedback
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {/* Pagination Controls */}
                    {previous.length > PREV_PER_PAGE && (
                      <div className="flex items-center justify-between border-t pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={prevPage === 1}
                          onClick={() => setPrevPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {prevPage} of{" "}
                          {Math.max(1, Math.ceil(previous.length / PREV_PER_PAGE))}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={prevPage >= Math.ceil(previous.length / PREV_PER_PAGE)}
                          onClick={() =>
                            setPrevPage((p) =>
                              Math.min(Math.ceil(previous.length / PREV_PER_PAGE), p + 1),
                            )
                          }
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No previous interviews yet</h3>
                    <p className="text-muted-foreground">
                      Once interviews are completed, they will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {feedbackOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 shadow-xl">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {feedbackItem?.room_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {feedbackItem?.instructor_name}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Rating:</span>{" "}
                      {typeof feedbackItem?.rating === "number"
                        ? `${feedbackItem?.rating}/10`
                        : "No Rating"}
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-muted/30 p-3 text-sm">
                      <div className="mb-1 font-medium">Feedback</div>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {feedbackItem?.comments && feedbackItem?.comments.trim() !== ""
                          ? feedbackItem?.comments
                          : "No feedback provided"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setFeedbackOpen(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
