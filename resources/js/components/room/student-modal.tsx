import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  interview_date?: string;
  interview_time?: string;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: "add" | "edit";

  // For add mode
  unassignedStudents?: Student[];
  selectedStudentId?: number | string;
  onStudentSelect?: (value: number | string) => void;

  // For edit mode
  student?: Student;
  onStudentUpdate?: (field: "interview_date" | "interview_time", value: string) => void;

  // Common props
  interviewDate: string;
  interviewTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitButtonText: string;
  isDisabled?: boolean;
   minDate?: string;
   minTime?: string
}

export default function StudentModal({
  isOpen,
  onClose,
  title,
  mode,
  unassignedStudents = [],
  selectedStudentId,
  onStudentSelect,
  student,
  onStudentUpdate,
  interviewDate,
  interviewTime,
  onDateChange,
  onTimeChange,
  onSubmit,
  isSubmitting,
  submitButtonText,
  isDisabled = false,
  minDate,
  minTime,
  
}: StudentModalProps) {
  if (!isOpen) return null;
  const now = new Date();
const today = now.toISOString().split("T")[0]; 
const currentTime = now.toTimeString().slice(0, 5);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-[var(--card)] p-4 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {mode === "add" && (
            <select
              className="w-full rounded-md border p-2 text-sm"
              value={selectedStudentId}
              onChange={(e) => onStudentSelect?.(Number(e.target.value) || "")}
            >
              <option value="" className="text-gray-800" disabled>
                Select a student
              </option>
              {unassignedStudents.map((s) => (
                <option key={s.id} value={s.id} className="text-gray-800">
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          )}

          {mode === "edit" && student && (
            <div className="rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium">{student.name}</p>
              <p className="truncate text-xs opacity-75">{student.email}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {mode === "edit" && (
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Interview Date
                </label>
              )}
              <input
                type="date"
                className="w-full rounded-md border p-2 text-sm"
                value={interviewDate}
                min={minDate || today} 
                onChange={(e) => {
                  const value = e.target.value;
                  onDateChange(value);
                  if (mode === "edit" && onStudentUpdate) {
                    onStudentUpdate("interview_date", value);
                  }
                }}
                placeholder={mode === "add" ? "Interview Date" : undefined}
              />
            </div>

            <div>
              {mode === "edit" && (
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Interview Time
                </label>
              )}
              <input
                type="time"
                className="w-full rounded-md border p-2 text-sm"
                value={interviewTime}
                min={interviewDate === (minDate || today) ? minTime || currentTime : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  onTimeChange(value);
                  if (mode === "edit" && onStudentUpdate) {
                    onStudentUpdate("interview_time", value);
                  }
                }}
                placeholder={mode === "add" ? "Interview Time" : undefined}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={onSubmit}
              disabled={isDisabled || isSubmitting}
              className="w-full sm:flex-1"
            >
              {isSubmitting ? `${submitButtonText.split(" ")[0]}...` : submitButtonText}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
