import StudentCard from "@/components/room/student-card";
import StudentModal from "@/components/room/student-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRoomUpdates } from "@/hooks/use-room-updates";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Trash2,
  // Undo2,
  User,
  UserCheck2,
  UserPlus,
  Users,
} from "lucide-react";
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
  assignedStudents?: AssignedStudent[];
  unassignedStudents: User[];
}


interface Session {
  id: number;
  session_code: string;
  status: string;
  guest_id?: number | null;
  created_at: string;
  updated_at: string;
}

interface CreatorProps {
  room: Room;
  session?: Session | null;

}
interface AssignedStudent extends User {
  interview_date?: string;
  interview_time?: string;
  interview_done: boolean;
  is_absent: boolean;
}

export default function Creator({
  room: initialRoom,
  session,
  assignedStudents: initialAssigned = [],
  unassignedStudents: initialUnassigned = [],
}: CreatorProps & { assignedStudents: User[] } & { unassignedStudents: User[] }) {
  const [copied, setCopied] = useState(false);
  const { auth } = usePage<SharedData>().props;
  const { room, isConnected } = useRoomUpdates(initialRoom.room_code, initialRoom);
  const { csrf_token } = usePage().props as any;

  const [fullTranscript, setFullTranscript] = useState("");
  // Handle transcript updates
  const handleTranscriptUpdate = (transcript: string) => {
    setFullTranscript(transcript);
  };


  // const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // const [assigned, setAssigned] = useState<User[]>(initialAssigned);
  const [unassigned, setUnassigned] = useState<User[]>(initialUnassigned);

  const [selectedStudent, setSelectedStudent] = useState<number | "">("");
  const [assigning, setAssigning] = useState(false);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<User | null>(null);

  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewTime, setInterviewTime] = useState<string>("");

  const [assigned, setAssigned] = useState<AssignedStudent[]>(initialAssigned as AssignedStudent[]);

  const [updatingStudent, setUpdatingStudent] = useState(false);
  // const [studentToUpdate, setStudentToUpdate] = useState<AssignedStudent | null>(null);

  const [studentToEvaluate, setStudentToEvaluate] = useState<any | null>(null);

  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Accept button loading state
  const [acceptingUserIds, setAcceptingUserIds] = useState<number[]>([]);

  // Pagination state
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(1);
  const [queueCurrentPage, setQueueCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // Pagination helper functions
  const getPaginatedItems = <T,>(items: T[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  };

  // Reset pagination when data changes
  useEffect(() => {
    const totalAssignedPages = getTotalPages(assigned.length);
    if (assignedCurrentPage > totalAssignedPages && totalAssignedPages > 0) {
      setAssignedCurrentPage(1);
    }
  }, [assigned.length, assignedCurrentPage]);

  useEffect(() => {
    const totalQueuePages = getTotalPages(room.queue.length);
    if (queueCurrentPage > totalQueuePages && totalQueuePages > 0) {
      setQueueCurrentPage(1);
    }
  }, [room.queue.length, queueCurrentPage]);

  // helper to read csrf token meta
  const getCsrf = () =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "";

  // assign handler
  const handleAssign = async () => {
    if (!selectedStudent) return;
    if (!interviewDate || !interviewTime) {
      toast.error("Please select both interview date and time before assigning.");
      return;
    }
    setAssigning(true);

    try {
      const res = await fetch(`/rooms/${room.id}/assign-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrf(),
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          student_id: selectedStudent,
          interview_date: interviewDate,
          interview_time: interviewTime,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error(`Assign failed: ${text}`);
        return;
      }

      const json = await res.json();
      setAssigned(json.assignedStudents ?? []);
      setUnassigned(json.unassignedStudents ?? []);
      setSelectedStudent("");
      setInterviewDate("");
      setInterviewTime("");

      const assignedStudent = json.assignedStudents.find((s: any) => s.id === selectedStudent);

      toast.success(
        assignedStudent
          ? `Student "${assignedStudent.name}" assigned successfully!`
          : "Student assigned successfully!",
      );
    } catch (err) {
      console.error("Assign error:", err);
      toast.error("An error occurred while assigning the student.");
    } finally {
      setAssigning(false);
    }
  };

  // remove handler
  const handleRemove = async (roomId: number, studentId: number) => {
    setRemovingIds((prev) => [...prev, studentId]);

    try {
      const res = await fetch(`/rooms/${roomId}/remove-student/${studentId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error(`Failed to remove student: ${text}`);
        return;
      }

      const json = await res.json();

      if (json.success) {
        const removedStudent = assigned.find((s) => s.id === studentId);
        setAssigned(json.assignedStudents);
        setUnassigned(json.unassignedStudents);

        if (removedStudent) {
          toast.success(`Student "${removedStudent.name}" removed successfully!`);
        } else {
          toast.success("Student removed successfully!");
        }
      } else {
        toast.error("Failed to remove student.");
      }
    } catch (err) {
      console.error("Failed to remove student", err);
      toast.error("An error occurred while removing the student.");
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  // update interview handler
  const updateStudentInterview = async (studentId: number, date: string, time: string) => {
    setUpdatingStudent(true);
    const cleanTime = time.length > 5 ? time.slice(0, 5) : time;

    try {
      const res = await fetch(`/rooms/${room.id}/update-student/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf(),
        },
        body: JSON.stringify({ interview_date: date, interview_time: cleanTime }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedStudent("");
        setAssigned(json.assignedStudents);
        toast.success(json.message || "Student interview updated successfully");
      } else {
        console.error(json.message);
        toast.error(json.message || "Failed to update student interview");
      }
    } finally {
      setUpdatingStudent(false);
    }
  };

  const [markingDoneIds, setMarkingDoneIds] = useState<number[]>([]);
  const [studentToMarkDone, setStudentToMarkDone] = useState<any | null>(null);

  const handleToggleInterviewDone = async (roomId: number, student: any) => {
    const studentId = student.id;
    if (!student.interview_done) {
      //  Interview not done yet :open evaluation modal first
      setStudentToEvaluate({ ...student, roomId });
      setShowEvaluateModal(true);
      return; // stop until evaluation is submitted
    }
    setMarkingDoneIds((prev) => [...prev, studentId]);


    try {
      const res = await fetch(`/rooms/${roomId}/students/${studentId}/toggle-done`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf(),
        },
      });
     const json = await res.json();
      if (json.success) {
        setAssigned((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, interview_done: !s.interview_done } : s)),
        );
        toast.success(json.message || "Interview status updated");
        // 👇 If interview done → open evaluation modal
      if (json.interview_done) {
        setStudentToEvaluate(json.student);
        setShowEvaluateModal(true);
      }
      } else {
        toast.error(json.message || "Could not update interview status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update interview status");
    } finally {
      setMarkingDoneIds((prev) => prev.filter((id) => id !== studentId));
      setStudentToMarkDone(null);
    }
  };


  const [markingAbsentIds, setMarkingAbsentIds] = useState<number[]>([]);
  const [studentToMarkAbsent, setStudentToMarkAbsent] = useState<any | null>(null);

  const handleToggleStudentAbsent = async (roomId: number, student: any) => {
    const studentId = student.id;
    setMarkingAbsentIds((prev) => [...prev, studentId]);

    try {
      const res = await fetch(`/rooms/${roomId}/students/${studentId}/toggle-absent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": getCsrf(),
        },
      });

      const json = await res.json();
      if (json.success) {
        setAssigned((prev) =>
          prev.map((s) => {
            if (s.id === studentId) {
              return {
                ...s,
                is_absent: json.is_absent,
                interview_done: json.interview_done,
              };
            }
            return s;
          }),
        );
        toast.success(
          json.message ||
            (json.is_absent
              ? "Student marked absent and interview done"
              : "Student marked as present again (interview undone)"),
        );
      } else {
        toast.error(json.message || "Could not update attendance status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update attendance status");
    } finally {
      setMarkingAbsentIds((prev) => prev.filter((id) => id !== studentId));
      setStudentToMarkAbsent(null);
    }
  };

  // Disable button if: Student is absent & Interview time has not arrived yet (for marking done)
  function disableMarkDone(student: AssignedStudent): boolean {
    if (!student) return true;

    const now = new Date();
    const interviewDateTime =
      student.interview_date && student.interview_time
        ? new Date(`${student.interview_date}T${student.interview_time}`)
        : null;

    return (
      markingDoneIds.includes(student.id) ||
      student.is_absent ||
      (!!interviewDateTime && now < interviewDateTime)
    );
  }
  function disableMarkAbsent(student: AssignedStudent): boolean {
    if (!student) return true;

    const now = new Date();
    const interviewDateTime =
      student.interview_date && student.interview_time
        ? new Date(`${student.interview_date}T${student.interview_time}`)
        : null;

    // Disable if interview is done or interview time hasn't come yet
    return (
      (student.interview_done && student.is_absent === false) ||
      (!!interviewDateTime && now < interviewDateTime)
    );
  }

  // Pagination component
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage = ITEMS_PER_PAGE,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage?: number;
  }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
        <div className="text-sm text-[var(--color-text-secondary)]">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

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

    // Add user to loading state
    setAcceptingUserIds((prev) => [...prev, userId]);

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
        router.visit(`/session/${sessionCode}`);
      } else {
        const errorText = await response.text();
        console.error(`[Creator] Failed to accept user ${userId}:`, response.status, errorText);
        toast.error(`Failed to accept user: ${errorText}`);
      }
    } catch (error) {
      console.error(`[Creator] Error accepting user ${userId}:`, error);
      toast.error("An error occurred while accepting the user.");
    } finally {
      // Remove user from loading state
      setAcceptingUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  // const disconnectUser = () => {
  //   router.post(`/room/${room.room_code}/disconnect`);
  // };

  const deleteRoom = () => {
    setIsDeleting(true);
    router.delete(`/room/${room.room_code}`, {
      headers: {
        "X-CSRF-TOKEN":
          document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
      },
      onSuccess: () => {
        setIsDeleting(false);
        setShowDeleteDialog(false);
      },
      onError: () => {
        setIsDeleting(false);
      },
    });
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

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
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

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-[var(--color-text)] sm:text-3xl lg:text-4xl">
                {room.name}
              </h1>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-sm text-[var(--color-text-secondary)] sm:text-base">
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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                onClick={copyRoomLink}
                variant="outline"
                size="sm"
                className="w-full border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-slate-100 hover:text-slate-900 sm:w-auto dark:hover:bg-slate-700 dark:hover:text-slate-100"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                size="sm"
                className="w-full border-red-300 bg-[var(--color-card-bg)] text-red-600 hover:bg-red-600 hover:text-white sm:w-auto dark:border-red-700 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Room
              </Button>
            </div>

            <ConfirmationDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={deleteRoom}
              title="Delete Room"
              description={`Are you sure you want to delete "${room.name}"? This action cannot be undone and all data will be permanently lost.`}
              confirmText="Delete Room"
              cancelText="Cancel"
              variant="destructive"
              isLoading={isDeleting}
            />
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Queue */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <Card className="border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
              <CardHeader>
                <CardTitle className="flex flex-col gap-3 text-[var(--color-text)] sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-base font-semibold sm:text-lg">Waiting Queue</span>
                        {room.queue_count > 0 && (
                          <Badge className="w-fit bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            {room.queue_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-normal text-[var(--color-text-secondary)]">
                        Users waiting to join your room
                      </p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {room.queue.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {getPaginatedItems(room.queue, queueCurrentPage).map((queueItem) => (
                        <motion.div
                          key={queueItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col gap-4 rounded-lg border border-gray-500/30 bg-blue-200/20 p-4 transition-colors hover:bg-blue-300/30 sm:flex-row sm:items-center dark:bg-blue-200/10 dark:hover:bg-blue-900/20"
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
                            className="w-full border-0 bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            disabled={acceptingUserIds.includes(queueItem.user.id)}
                          >
                            {acceptingUserIds.includes(queueItem.user.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="mr-2 h-4 w-4" />
                            )}
                            {acceptingUserIds.includes(queueItem.user.id)
                              ? "Accepting..."
                              : "Accept"}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={queueCurrentPage}
                      totalPages={getTotalPages(room.queue.length)}
                      onPageChange={setQueueCurrentPage}
                      totalItems={room.queue.length}
                    />
                  </>
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
                <CardTitle className="flex flex-col gap-3 text-[var(--color-text)] sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-base font-semibold sm:text-lg">Active Sessions</span>
                        {(() => {
                          const sessions = Array.isArray((room as any).sessions)
                            ? (room as any).sessions.filter((s: any) => s.status === "active")
                            : [];
                          return sessions.length > 0 ? (
                            <Badge className="w-fit bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {sessions.length}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                      <p className="text-sm font-normal text-[var(--color-text-secondary)]">
                        Ongoing sessions created from this lobby
                      </p>
                    </div>
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
          {/* Assigned Students */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="space-y-6 lg:col-span-2"
          >
            <Card className="mb-5 w-full border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
              <CardHeader>
                <CardTitle className="flex flex-row items-center justify-between gap-3 text-[var(--color-text)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-base font-semibold sm:text-lg">Assigned Students</span>
                      {assigned.length > 0 && (
                        <Badge className="w-fit bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {assigned.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Trigger Add Student Modal */}
                    <Button onClick={() => setShowAddModal(true)} size="icon">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Assigned Students List */}

                {assigned.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {getPaginatedItems(assigned, assignedCurrentPage).map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          markDoneDisabled={disableMarkDone(student)}
                          markAbsentDisabled={disableMarkAbsent(student)}
                          markDone={() => setStudentToMarkDone(student)}
                          markAbsent={() => setStudentToMarkAbsent(student)}
                          setSelectedStudent={setSelectedStudent}
                          setShowEditModal={setShowEditModal}
                          setUpdatingStudent={setUpdatingStudent}
                          setStudentToRemove={setStudentToRemove}
                          removingIds={removingIds}
                          bgStyles="bg-purple-500/10 hover:bg-purple-500/20 dark:bg-purple-500/5 dark:hover:bg-purple-900/20"
                          borderStyles="border-purple-600/40"
                          avatarStyles="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        />
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={assignedCurrentPage}
                      totalPages={getTotalPages(assigned.length)}
                      onPageChange={setAssignedCurrentPage}
                      totalItems={assigned.length}
                    />
                  </>
                ) : (
                  <p className="text-[var(--color-text-secondary)]">No students assigned yet.</p>
                )}
                <ConfirmationDialog
                  open={!!studentToMarkDone}
                  onOpenChange={(open) => !open && setStudentToMarkDone(null)}
                  onConfirm={() => handleToggleInterviewDone(room.id, studentToMarkDone)}
                  title={
                    studentToMarkDone?.interview_done
                      ? "Undo Done Interview"
                      : "Mark Interview as Done"
                  }
                  description={
                    studentToMarkDone?.interview_done
                      ? `Are you sure you want to undo interview done for "${studentToMarkDone?.name}"?`
                      : `Are you sure you want to mark "${studentToMarkDone?.name}" interview as done?`
                  }
                  confirmText={studentToMarkDone?.interview_done ? "Undo Done" : "Mark as Done"}
                  cancelText="Cancel"
                  variant="default"
                />
                <ConfirmationDialog
                  open={!!studentToMarkAbsent}
                  onOpenChange={(open) => !open && setStudentToMarkAbsent(null)}
                  onConfirm={() => handleToggleStudentAbsent(room.id, studentToMarkAbsent)}
                  title={
                    studentToMarkAbsent?.is_absent
                      ? "Undo Student Absent Interview"
                      : "Mark Student as absent"
                  }
                  description={
                    studentToMarkAbsent?.is_absent
                      ? `Are you sure you want to undo interview absent for "${studentToMarkAbsent?.name}"?`
                      : `Are you sure you want to mark "${studentToMarkAbsent?.name}" interview as absent?`
                  }
                  confirmText={
                    studentToMarkAbsent?.is_absent
                      ? "Undo Student Absent Interview"
                      : "Mark Student as absent"
                  }
                  cancelText="Cancel"
                  variant="default"
                />

                <ConfirmationDialog
                  open={!!studentToRemove}
                  onOpenChange={(open) => !open && setStudentToRemove(null)}
                  onConfirm={() => {
                    if (studentToRemove) {
                      handleRemove(room.id, studentToRemove.id);
                      setStudentToRemove(null);
                    }
                  }}
                  title="Remove Student"
                  description={
                    studentToRemove
                      ? `Are you sure you want to remove "${studentToRemove.name}" from this room? This action cannot be undone.`
                      : "Are you sure you want to remove this student? This action cannot be undone."
                  }
                  confirmText="Remove Student"
                  cancelText="Cancel"
                  variant="destructive"
                  isLoading={studentToRemove ? removingIds.includes(studentToRemove.id) : false}
                />
              </CardContent>
            </Card>

            {/* Add New Student Modal */}
            <StudentModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              title="Assign New Student"
              mode="add"
              unassignedStudents={unassigned}
              selectedStudentId={selectedStudent}
              onStudentSelect={(value) => setSelectedStudent(Number(value) || "")}
              interviewDate={interviewDate}
              interviewTime={interviewTime}
              onDateChange={setInterviewDate}
              onTimeChange={setInterviewTime}
              onSubmit={handleAssign}
              isSubmitting={assigning}
              submitButtonText="Assign"
              isDisabled={!selectedStudent}
            />

            {/* Edit Assigned Student Modal */}
            <StudentModal
              isOpen={showEditModal && !!selectedStudent}
              onClose={() => setShowEditModal(false)}
              title="Edit Interview Schedule"
              mode="edit"
              student={assigned.find((s) => s.id === selectedStudent)}
              interviewDate={assigned.find((s) => s.id === selectedStudent)?.interview_date || ""}
              interviewTime={assigned.find((s) => s.id === selectedStudent)?.interview_time || ""}
              onDateChange={() => {}}
              onTimeChange={() => {}}
              onStudentUpdate={(field, value) => {
                const updated = [...assigned];
                const index = updated.findIndex((s) => s.id === selectedStudent);
                if (index > -1) {
                  updated[index][field] = value;
                  setAssigned(updated);
                }
              }}
              onSubmit={() => {
                const student = assigned.find((s) => s.id === selectedStudent);
                if (student) {
                  updateStudentInterview(
                    student.id,
                    student.interview_date || "",
                    student.interview_time || "",
                  );
                }
              }}
              isSubmitting={updatingStudent}
              submitButtonText="Update"
            />
          </motion.div>
        </div>
        {/* Evaluate Modal */}
{showEvaluateModal && studentToEvaluate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--card)] shadow-xl">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-base font-semibold text-[var(--color-text)]">
          Evaluate Interview – {studentToEvaluate.name}
        </h3>
      </div>

     {session ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!session?.session_code) {
              toast.error("No active session found, cannot submit evaluation.");
              return;
            }
            try {
              setSubmitting(true);
              const res = await fetch(`/session/${session.session_code}/evaluate`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-TOKEN":
                    (csrf_token as string) ||
                    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
                    "",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                  student_id: studentToEvaluate.id,
                  rating,
                  comments,
                  transcript: fullTranscript,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                toast.success("Evaluation submitted successfully");
                if (data?.room_code) {
                  window.location.href = `/room/${data.room_code}`;
                } else {
                  window.location.href = "/lobby";
                }
              } else {
                toast.error(`Evaluation failed (status: ${res.status})`);
              }
            } finally {
              setSubmitting(false);
            }
          }}
          className="px-5 py-4"
        >
          {/* Rating */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                      rating >= r
                        ? "border-yellow-400 bg-yellow-400 text-white"
                        : "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-text)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)] shadow-sm"
                placeholder="Share feedback about the interviewee..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={submitting || !rating || !comments.trim()}
            >
              {submitting ? "Submitting..." : "Submit & End Session"}
            </button>
            <button
            type="button"
            onClick={() => setShowEvaluateModal(false)}
            className=" rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium text-[var(--color-text)]"
            disabled={submitting}
          >
            Cancel
          </button>
            
          </div>
        </form>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-[var(--color-text)]">
          <p className="mb-2 font-medium text-red-500">No Active Session</p>
          <p>
            This interview was not made. You cannot evaluate or mark it as done because there is no active
            session available.
          </p>
          <button
            type="button"
            onClick={() => setShowEvaluateModal(false)}
            className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium text-[var(--color-text)]"
            disabled={submitting}
          >
            OK, Got it
          </button>
        </div>
      )}
    </div>
  </div>
)}


        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="space-y-6 lg:col-span-2"
        >
          {/* Section 1: Interview Done / Absent */}
          <Card className="w-full border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--color-text)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500 text-white">
                  <UserCheck2 className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  Interviewed / Absent Students
                  {assigned.filter((s) => s.interview_done || s.is_absent).length > 0 && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({assigned.filter((s) => s.interview_done || s.is_absent).length})
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assigned.filter((s) => s.interview_done || s.is_absent).length > 0 ? (
                <div className="space-y-3">
                  {assigned
                    .filter((s) => s.interview_done || s.is_absent)
                    .map((student) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between gap-4 rounded-lg border border-gray-900/40 bg-gray-200/20 p-4 transition-colors hover:bg-gray-300/30 dark:bg-gray-200/10 dark:hover:bg-gray-900/20"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gray-50 font-semibold text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
                              {student.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="truncate font-medium text-[var(--color-text)]">
                              {student.name}
                            </h4>
                            <p className="truncate text-sm text-[var(--color-text-secondary)]">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.is_absent ? (
                            <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-white">
                              Absent
                            </span>
                          ) : student.interview_done ? (
                            <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                              Interview Done
                            </span>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <p className="text-[var(--color-text-secondary)]">
                  No students have completed their interview or are absent yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Students to be Interviewed */}
          <Card className="w-full border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--color-text)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500 text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  Students To Be Interviewed
                  {assigned.filter((s) => !s.interview_done && !s.is_absent).length > 0 && (
                    <Badge className="w-fit bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">
                      {assigned.filter((s) => !s.interview_done && !s.is_absent).length}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assigned.filter((s) => !s.interview_done && !s.is_absent).length > 0 ? (
                <div className="space-y-3">
                  {assigned
                    .filter((s) => !s.interview_done && !s.is_absent)
                    .map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        markDoneDisabled={disableMarkDone(student)}
                        markAbsentDisabled={disableMarkAbsent(student)}
                        markDone={() => setStudentToMarkDone(student)}
                        markAbsent={() => setStudentToMarkAbsent(student)}
                        setSelectedStudent={setSelectedStudent}
                        setShowEditModal={setShowEditModal}
                        setUpdatingStudent={setUpdatingStudent}
                        setStudentToRemove={setStudentToRemove}
                        removingIds={removingIds}
                        bgStyles="bg-pink-500/10 hover:bg-pink-500/20 dark:bg-pink-500/5 dark:hover:bg-pink-900/20"
                        borderStyles="border-pink-600/40"
                        avatarStyles="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                      />
                    ))}
                </div>
              ) : (
                <p className="text-[var(--color-text-secondary)]">
                  No students left to be interviewed.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Room Link Card */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
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
              <div className="flex flex-col gap-3 rounded-lg border border-gray-500/30 bg-[var(--background)] p-4 sm:flex-row sm:items-center">
                <code className="font-mono text-xs break-all text-[var(--color-text)] sm:flex-1 sm:text-sm">
                  {window.location.origin}/room/{room.room_code}
                </code>
                <Button
                  onClick={copyRoomLink}
                  size="sm"
                  variant="outline"
                  className="w-full border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:bg-slate-100 hover:text-slate-900 sm:w-auto dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
