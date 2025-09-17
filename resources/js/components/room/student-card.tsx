import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";
import { Calendar, Check, Clock, Edit2, Trash2, UserX } from "lucide-react";
import { Button } from "../ui/button";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Student extends User {
  interview_date?: string;
  interview_time?: string;
  interview_done: boolean;
  is_absent: boolean;
}

interface Props {
  student: Student;
  markDoneDisabled: boolean;
  markAbsentDisabled: boolean;
  removingIds: number[];
  bgStyles?: string;
  borderStyles?: string;
  avatarStyles?: string;
  markDone: (student: Student) => void;
  markAbsent: (student: Student) => void;
  setSelectedStudent: (id: number) => void;
  setShowEditModal: (show: boolean) => void;
  setUpdatingStudent: (updating: boolean) => void;
  setStudentToRemove: (student: Student) => void;
}

export default function StudentCard({
  student,
  markDoneDisabled,
  markAbsentDisabled,
  removingIds,
  bgStyles,
  borderStyles,
  avatarStyles,
  markDone,
  markAbsent,
  setSelectedStudent,
  setShowEditModal,
  setUpdatingStudent,
  setStudentToRemove,
}: Props) {
  const baseCardStyle =
    "flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center";
  const baseAvatarStyle = "h-10 w-10 rounded-full flex items-center justify-center overflow-hidden";

  return (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${baseCardStyle} ${bgStyles} ${borderStyles}`}
    >
      <div className="flex flex-1 items-center gap-3">
        <Avatar className={baseAvatarStyle}>
          <AvatarFallback
            className={`flex h-full w-full items-center justify-center rounded-full font-semibold ${avatarStyles}`}
          >
            {student.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-[var(--color-text)]">{student.name}</h4>
          <p className="truncate text-sm text-[var(--color-text-secondary)]">{student.email}</p>
          {student.interview_date && student.interview_time && (
            <div className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(student.interview_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(`${student.interview_date}T${student.interview_time}`).toLocaleTimeString(
                  undefined,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  },
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        {/* Buttons for Mark Done / Mark Absent */}
        <div className={student.is_absent ? "" : "group"}>
          <button
            onClick={() => markDone(student)}
            disabled={markDoneDisabled}
            className={`w-full cursor-pointer rounded-md px-3 py-2 text-xs font-medium transition-colors sm:w-auto sm:text-sm ${
              student.interview_done
                ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            } ${markDoneDisabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {student.interview_done ? (
              <>
                <span className={`${student.is_absent ? "" : "block group-hover:hidden"}`}>
                  <Check className="mr-1 inline h-3 w-3" />
                  Interview Done
                </span>
                {!student.is_absent && <span className="hidden group-hover:block">Undo Done</span>}
              </>
            ) : (
              "Mark Interview Done"
            )}
          </button>
        </div>

        <div className="group">
          <button
            onClick={() => markAbsent(student)}
            disabled={markAbsentDisabled}
            className={`w-full cursor-pointer rounded-md px-3 py-2 text-xs font-medium transition-colors sm:w-auto sm:text-sm ${
              student.is_absent
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                : "border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            } ${markAbsentDisabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {student.is_absent ? (
              <>
                <span className="flex items-center justify-center gap-1 group-hover:hidden">
                  <UserX className="h-4 w-4" />
                  Student Absent
                </span>
                <span className="hidden items-center justify-center gap-1 group-hover:flex">
                  <UserX className="h-4 w-4" />
                  Undo Absent
                </span>
              </>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <UserX className="h-4 w-4" />
                <span className="hidden sm:inline">Mark as Absent</span>
                <span className="sm:hidden">Absent</span>
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2">
          {/* Edit button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setSelectedStudent(student.id);
              setShowEditModal(true);
              setUpdatingStudent(false);
            }}
            className="flex-1 border-blue-200 text-blue-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-800 dark:text-blue-500 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setStudentToRemove(student)}
            disabled={removingIds.includes(student.id)}
            className="flex-1 border-red-200 text-red-400 hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-500 dark:hover:border-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
