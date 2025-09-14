import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { Building2, Calendar, CalendarDays, Clock, Edit, ExternalLink, Users } from "lucide-react";
import { useState } from "react";

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
  interview_date: string;
  interview_time: string;
  instructor_name: string;
}

interface ProfilePageProps extends SharedData {
  userRooms?: Room[];
  upcomingInterviews?: UpcomingInterview[];
}

export default function Profile() {
  const { auth, userRooms = [], upcomingInterviews = [] } = usePage<ProfilePageProps>().props;
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

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

  const canJoin = (interviewTime: Date) => {
    return new Date() < interviewTime;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isUpcoming = (dateStr: string, timeStr: string) => {
    const interviewDateTime = new Date(`${dateStr}T${timeStr}`);
    return interviewDateTime > new Date();
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
                {upcomingInterviews.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{interview.room_name}</h4>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Scheduled
                            </Badge>
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
                        <div className="flex items-center gap-2">
                          {isUpcoming(interview.interview_date, interview.interview_time) ? (
                            <Button
                              size="sm"
                              disabled
                              variant="outline"
                              className="cursor-not-allowed opacity-50"
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Not Yet Available
                            </Button>
                          ) : (
                            <Button asChild size="sm">
                              <Link href={`/room/${interview.room_code}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Join Interview
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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

            {/* Previous Interviews Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Previous Interviews
                </CardTitle>
                <CardDescription>Your completed interview and feedback history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Goodluck, Adel!</h3>
                  <p className="text-muted-foreground">
                    Interview history and feedback for each should appear here after AI analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
