<?php

namespace App\Http\Controllers;

use App\Events\QueueUpdated;
use App\Events\RoomStatusUpdated;
use App\Models\Room;
use App\Models\RoomQueue;
use App\Models\LobbySession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\InterviewScheduled;
use App\Mail\InterviewCancelled;
use App\Mail\InterviewRescheduled;
use App\Mail\InterviewCompleted;
use App\Mail\InterviewAbsent;
use App\Jobs\SendInterviewEmail;

class RoomController extends Controller
{
    // public function lobby()
    // {
    //     $user = Auth::user();
    //     $userRooms = $user->createdRooms()
    //         ->where('is_active', true)
    //         ->with(['currentParticipant', 'queue.user', 'assignedStudents'])
    //         ->orderBy('last_activity', 'desc')
    //         ->get();

    //     // Fetch all students to assign
    //     $userStudents = \App\Models\User::where('role', 'student')->get();

    //     return Inertia::render('lobby', [
    //         'userRooms' => $userRooms,
    //         'students' => $userStudents,
    //     ]);
    // }

    public function lobby()
    {
        $user = Auth::user();

        $userRooms = [];
        $students = [];

        if ($user->role === 'student') {
            // Show rooms assigned to this student, add pivot interview date/time
            $userRooms = $user->assignedRooms()
                ->where('is_active', true)
                ->with(['currentParticipant', 'queue.user', 'creator'])
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($room) use ($user) {
                    // grab this student's pivot data for this room
                    $studentPivot = $room->assignedStudents()
                        ->where('users.id', $user->id)
                        ->first();

                    $room->student_interview_date = $studentPivot?->pivot?->interview_date;
                    $room->student_interview_time = $studentPivot?->pivot?->interview_time;
                    $room->student_interview_done = (bool) ($studentPivot?->pivot?->interview_done);
                    $room->student_is_absent = (bool) ($studentPivot?->pivot?->is_absent);

                    return $room;
                });
        } elseif (in_array($user->role, ['instructor', 'admin'])) {
            // Show rooms this instructor/admin created
            $userRooms = $user->createdRooms()
                ->where('is_active', true)
                ->with(['currentParticipant', 'queue.user', 'assignedStudents'])
                ->orderBy('last_activity', 'desc')
                ->get();
            // dd($userRooms);
            // Only instructors/admins need the list of students
            $students = \App\Models\User::where('role', 'student')->get();
        }

        return Inertia::render('lobby', [
            'userRooms' => $userRooms,
            'students'  => $students,
        ]);
    }


    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'students' => 'nullable|array',
            'students.*.id' => 'required|exists:users,id',
            'students.*.interview_date' => 'nullable|date',
            'students.*.interview_time' => 'nullable|date_format:H:i',
            // 'students.*.interview_done' => 'default',

        ]);

        $room = Room::create([
            'name' => $request->name,
            'created_by' => Auth::id(),
        ]);

        if ($request->filled('students')) {
            foreach ($request->students as $student) {
                $room->assignedStudents()->attach($student['id'], [
                    'interview_date' => $student['interview_date'],
                    'interview_time' => $student['interview_time'],
                    // 'interview_done' => $student['interview_done'], 
                ]);

                $studentUser = User::find($student['id']);


                $sessionDetails = $room->assignedStudents()
                    ->where('users.id', $studentUser->id)
                    ->withPivot('interview_date', 'interview_time', 'interview_done', 'is_absent')
                    ->first();

                // Create a simple object for the email job instead of passing the full model
                $sessionDetailsForEmail = null;
                if ($sessionDetails && $sessionDetails->pivot) {
                    $sessionDetailsForEmail = (object) [
                        'pivot' => (object) [
                            'interview_date' => $sessionDetails->pivot->interview_date,
                            'interview_time' => $sessionDetails->pivot->interview_time,
                            'interview_done' => $sessionDetails->pivot->interview_done,
                            'is_absent' => $sessionDetails->pivot->is_absent,
                        ]
                    ];
                }

                SendInterviewEmail::dispatch('scheduled', $room, $studentUser, $sessionDetailsForEmail);
            }
        }


        return redirect()->route('room.show', $room->room_code);
    }

    public function show($roomCode)
    {
        $room = Room::where('room_code', $roomCode)
            ->with(['creator', 'currentParticipant', 'queue.user', 'assignedStudents', 'sessions' => function ($q) {
                $q->where('status', 'active')->latest('id');
            }])
            ->firstOrFail();

        $user = Auth::user();

        // If the visiting user is a guest and already has an active session for this lobby, redirect to that session
        if (!$room->isCreator($user)) {
            $activeGuestSession = \App\Models\LobbySession::where('room_id', $room->id)
                ->where('status', 'active')
                ->where('guest_id', $user->id)
                ->latest('id')
                ->first();

            if ($activeGuestSession) {
                return redirect()->route('session.room', ['sessionCode' => $activeGuestSession->session_code]);
            }
        }

        // If user is the creator, show the room management interface
        // if ($room->isCreator($user)) {
        //     return Inertia::render('room/creator', [
        //         'room' => $room,
        //         'assignedStudents' => $room->assignedStudents,
        //     ]);
        // }


        if ($room->isCreator($user)) {
            // Load assigned students relation
            $room->load('assignedStudents');

            // Map assigned students with pivot data
            $assignedStudents = $room->assignedStudents->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'interview_date' => $student->pivot->interview_date,
                    'interview_time' => $student->pivot->interview_time,
                    'interview_done' => (bool) $student->pivot->interview_done,
                    'is_absent' => (bool) $student->pivot->is_absent,
                ];
            });

            // All students
            $allStudents = \App\Models\User::where('role', 'student')->get();

            // Students NOT assigned to this room
            $unassignedStudents = $allStudents->whereNotIn('id', $room->assignedStudents->pluck('id'));
            // $activeSession = LobbySession::where('room_id', $room->id)->latest()->first();
            $activeSession = \App\Models\LobbySession::where('room_id', $room->id)
                // ->where('guest_id', $student->id)
                ->where('status', 'active')
                ->first();

            return Inertia::render('room/creator', [
                'room' => $room,
                'assignedStudents' => $assignedStudents,
                'unassignedStudents' => $unassignedStudents->values(),
                'session' => $activeSession,
            ]);
        }


        // Prevent re-queuing if this student already completed the interview in this room
        $pivot = $room->assignedStudents()->where('users.id', $user->id)->first();
        if ($pivot && (bool) ($pivot->pivot?->interview_done)) {
            return redirect()->route('dashboard');
        }

        // Check if user is already in queue
        $queueEntry = $room->queue()->where('user_id', $user->id)->with('user')->first();

        if ($queueEntry) {
            return Inertia::render('room/queue', [
                'room' => $room,
                'queuePosition' => $queueEntry->position,
                'queueEntry' => $queueEntry,
            ]);
        }

        // Add user to queue
        $queueEntry = $room->addToQueue($user);

        // Load the user relationship for the queue entry
        $queueEntry->load('user');

        // Broadcast queue update
        event(new QueueUpdated($room->fresh(), 'joined', $user));

        return Inertia::render('room/queue', [
            'room' => $room,
            'queuePosition' => $queueEntry->position,
            'queueEntry' => $queueEntry,
        ]);
    }

    public function state(Request $request, $roomCode)
    {
        $room = Room::where('room_code', $roomCode)
            ->with([
                'currentParticipant',
                'queue.user',
                'assignedStudents' => function ($q) {
                    $q->select('users.id', 'users.name', 'users.email');
                },
                'sessions' => function ($q) {
                    $q->latest('id');
                },
            ])
            ->firstOrFail();

        // Transform assigned students to include pivot fields explicitly
        $assigned = $room->assignedStudents->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'interview_date' => $student->pivot->interview_date,
                'interview_time' => $student->pivot->interview_time,
                'interview_done' => (bool) $student->pivot->interview_done,
                'is_absent' => (bool) $student->pivot->is_absent,
            ];
        })->values();

        $sessions = $room->sessions->map(function ($s) {
            return [
                'id' => $s->id,
                'session_code' => $s->session_code,
                'status' => $s->status,
                'started_at' => $s->started_at,
                'ended_at' => $s->ended_at,
            ];
        })->values();

        return response()->json([
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'room_code' => $room->room_code,
                'is_active' => $room->is_active,
                'last_activity' => $room->last_activity,
                'current_participant' => $room->currentParticipant,
                'queue' => $room->queue->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'position' => $q->position,
                        'joined_at' => $q->joined_at,
                        'user' => [
                            'id' => $q->user->id,
                            'name' => $q->user->name,
                            'email' => $q->user->email,
                        ],
                    ];
                })->values(),
                'queue_count' => $room->queue()->count(),
                'assignedStudents' => $assigned,
                'sessions' => $sessions,
            ],
        ]);
    }

    public function join(Request $request, $roomCode)
    {
        $room = Room::where('room_code', $roomCode)->firstOrFail();
        $user = Auth::user();

        if (!$room->isCreator($user)) {
            abort(403, 'Only the room creator can manage participants');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $targetUser = $room->queue()->where('user_id', $request->user_id)->first();

        if (!$targetUser) {
            return response()->json(['error' => 'User not found in queue'], 404);
        }

        // Remove user from queue
        $room->removeFromQueue($targetUser->user);

        // Set as current participant
        $room->setCurrentParticipant($targetUser->user);

        // Create a LobbySession record with per-session code
        $sessionCode = strtoupper(bin2hex(random_bytes(3)));
        $session = LobbySession::create([
            'session_code' => $sessionCode,
            'room_id' => $room->id,
            'creator_id' => $room->created_by,
            'guest_id' => $targetUser->user_id,
            'status' => 'active',
            'started_at' => now(),
        ]);

        // Broadcast updates with sessionCode so both sides know where to go
        // Reload room with updated sessions for broadcast
        $room->load(['sessions' => function ($q) {
            $q->where('status', 'active')->latest('id');
        }]);
        event(new QueueUpdated($room->fresh(), 'accepted', $targetUser->user, $sessionCode));
        event(new RoomStatusUpdated($room->fresh(), 'participant_joined'));

        return response()->json([
            'success' => true,
            'sessionCode' => $sessionCode,
            'message' => 'User joined the room',
        ]);
    }

    public function disconnect(Request $request, $roomCode)
    {
        $room = Room::where('room_code', $roomCode)->firstOrFail();
        $user = Auth::user();

        if (!$room->isCreator($user)) {
            abort(403, 'Only the room creator can disconnect participants');
        }

        $room->disconnectCurrentParticipant();

        // Mark latest active session for this room as ended
        LobbySession::where('room_id', $room->id)
            ->where('status', 'active')
            ->latest('id')
            ->update(['status' => 'ended', 'ended_at' => now()]);

        // Broadcast room status update
        event(new RoomStatusUpdated($room->fresh(), 'participant_left'));

        return response()->json([
            'success' => true,
            'message' => 'Participant disconnected',
        ]);
    }

    public function leave(Request $request, $roomCode)
    {
        $room = Room::where('room_code', $roomCode)->firstOrFail();
        $user = Auth::user();

        // If user is the current participant, disconnect them and end session
        if ($room->current_participant === $user->id) {
            $room->disconnectCurrentParticipant();
            // Broadcast room status update
            event(new RoomStatusUpdated($room->fresh(), 'participant_left'));

            LobbySession::where('room_id', $room->id)
                ->where('status', 'active')
                ->latest('id')
                ->update(['status' => 'ended', 'ended_at' => now()]);
        }

        // Remove user from queue if they're in it
        $wasInQueue = $room->queue()->where('user_id', $user->id)->exists();
        $room->removeFromQueue($user);

        // Broadcast queue update if user was in queue
        if ($wasInQueue) {
            event(new QueueUpdated($room->fresh(), 'left', $user));
        }

        return redirect()->route('lobby');
    }

    public function destroy($roomCode)
    {
        $room = Room::where('room_code', $roomCode)->firstOrFail();
        $user = Auth::user();

        if (!$room->isCreator($user)) {
            abort(403, 'Only the room creator can delete the room');
        }

        $room->update(['is_active' => false]);

        $assignedStudents = $room->assignedStudents;

        foreach ($assignedStudents as $student) {
            $sessionDetails = $room->assignedStudents()
                ->where('users.id', $student->id)
                ->withPivot('interview_date', 'interview_time', 'interview_done', 'is_absent')
                ->first();

            // Only send cancellation email if the interview is not completed yet
            if ($sessionDetails && $sessionDetails->pivot && !$sessionDetails->pivot->interview_done) {
                // Create a simple object for the email job instead of passing the full model
                $sessionDetailsForEmail = (object) [
                    'pivot' => (object) [
                        'interview_date' => $sessionDetails->pivot->interview_date,
                        'interview_time' => $sessionDetails->pivot->interview_time,
                        'interview_done' => $sessionDetails->pivot->interview_done,
                        'is_absent' => $sessionDetails->pivot->is_absent,
                    ]
                ];

                SendInterviewEmail::dispatch('cancelled', $room, $student, $sessionDetailsForEmail);
            }
        }

        return redirect()->route('lobby');
    }

    // Legacy WebRTC signaling removed in favor of simple RTC flow



    // public function assignStudents(Request $request, Room $room)
    // {
    //     $user = $request->user();

    //     // Only creator (instructor) can assign students
    //     if (!$room->isCreator($user)) {
    //         abort(403, 'Unauthorized');
    //     }

    //     $request->validate([
    //         'students' => 'required|array',
    //         'students.*' => 'exists:users,id',
    //     ]);

    //     $room->assignedStudents()->sync($request->students);

    //     return redirect()->back()->with('success', 'Students assigned successfully.');
    // }

    public function assignStudent(Request $request, Room $room)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'interview_date' => 'required|date',
            'interview_time' => 'required|date_format:H:i',
        ]);

        $room->assignedStudents()->attach($request->student_id, [
            'interview_date' => $request->interview_date,
            'interview_time' => $request->interview_time,
        ]);

        $sessionDetails = $room->assignedStudents()
            ->where('users.id', $request->student_id)
            ->withPivot('interview_date', 'interview_time', 'interview_done', 'is_absent')
            ->first();

        $student = User::find($request->student_id);

        // Create a simple object for the email job instead of passing the full model
        $sessionDetailsForEmail = null;
        if ($sessionDetails && $sessionDetails->pivot) {
            $sessionDetailsForEmail = (object) [
                'pivot' => (object) [
                    'interview_date' => $sessionDetails->pivot->interview_date,
                    'interview_time' => $sessionDetails->pivot->interview_time,
                    'interview_done' => $sessionDetails->pivot->interview_done,
                    'is_absent' => $sessionDetails->pivot->is_absent,
                ]
            ];
        }

        SendInterviewEmail::dispatch('scheduled', $room, $student, $sessionDetailsForEmail);

        $assigned = $room->assignedStudents()->get()->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'interview_date' => $student->pivot->interview_date,
                'interview_time' => $student->pivot->interview_time,
                'interview_done' => (bool) $student->pivot->interview_done,
                'is_absent' => (bool) $student->pivot->is_absent,
            ];
        });



        $unassigned = User::where('role', 'student')
            ->whereNotIn('id', $assigned->pluck('id'))
            ->get();

        return response()->json([
            'success' => true,
            'assignedStudents' => $assigned,
            'unassignedStudents' => $unassigned,
        ]);
    }

    public function removeStudent(Room $room, User $student)
    {

        $sessionDetails = $room->assignedStudents()
            ->where('users.id', $student->id)
            ->withPivot('interview_date', 'interview_time', 'interview_done', 'is_absent')
            ->first();

        $room->assignedStudents()->detach([$student->id]);
        $room->removeFromQueue($student);

        event(new QueueUpdated($room->fresh(), 'left', $student));

        // Create a simple object for the email job instead of passing the full model
        $sessionDetailsForEmail = null;
        if ($sessionDetails && $sessionDetails->pivot) {
            $sessionDetailsForEmail = (object) [
                'pivot' => (object) [
                    'interview_date' => $sessionDetails->pivot->interview_date,
                    'interview_time' => $sessionDetails->pivot->interview_time,
                    'interview_done' => $sessionDetails->pivot->interview_done,
                    'is_absent' => $sessionDetails->pivot->is_absent,
                ]
            ];
        }

        SendInterviewEmail::dispatch('cancelled', $room, $student, $sessionDetailsForEmail);

        $assigned = $room->assignedStudents()->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'email' => $s->email,
                'interview_date' => $s->pivot->interview_date,
                'interview_time' => $s->pivot->interview_time,
                'interview_done' => (bool) $s->pivot->interview_done,
                'is_absent' => (bool) $s->pivot->is_absent,
            ];
        });

        $unassigned = User::where('role', 'student')
            ->whereNotIn('id', $assigned->pluck('id'))
            ->get();

        return response()->json([
            'success' => true,
            'assignedStudents' => $assigned,
            'unassignedStudents' => $unassigned,
        ]);
    }

    public function updateStudentInterview(Request $request, Room $room, User $student)
    {
        $request->validate([
            'interview_date' => 'required|date',
            'interview_time' => 'required|date_format:H:i',
        ]);

        // Only update if the student is assigned to this room
        if (!$room->assignedStudents()->where('user_id', $student->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Student is not assigned to this room',
            ], 404);
        }

        $oldSessionDetails = $room->assignedStudents()
            ->where('users.id', $student->id)
            ->withPivot('interview_date', 'interview_time')
            ->first();

        // Update pivot data
        $room->assignedStudents()->updateExistingPivot($student->id, [
            'interview_date' => $request->interview_date,
            'interview_time' => $request->interview_time,
        ]);

        $newSessionDetails = $room->assignedStudents()
            ->where('users.id', $student->id)
            ->withPivot('interview_date', 'interview_time', 'interview_done', 'is_absent')
            ->first();

        // Create simple objects for the email job instead of passing the full models
        $oldSessionDetailsForEmail = null;
        if ($oldSessionDetails && $oldSessionDetails->pivot) {
            $oldSessionDetailsForEmail = (object) [
                'pivot' => (object) [
                    'interview_date' => $oldSessionDetails->pivot->interview_date,
                    'interview_time' => $oldSessionDetails->pivot->interview_time,
                ]
            ];
        }

        $newSessionDetailsForEmail = null;
        if ($newSessionDetails && $newSessionDetails->pivot) {
            $newSessionDetailsForEmail = (object) [
                'pivot' => (object) [
                    'interview_date' => $newSessionDetails->pivot->interview_date,
                    'interview_time' => $newSessionDetails->pivot->interview_time,
                    'interview_done' => $newSessionDetails->pivot->interview_done,
                    'is_absent' => $newSessionDetails->pivot->is_absent,
                ]
            ];
        }

        // Send reschedule email
        SendInterviewEmail::dispatch('rescheduled', $room, $student, $newSessionDetailsForEmail, $oldSessionDetailsForEmail);

        // Return updated assigned and unassigned lists
        $assigned = $room->assignedStudents()->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'email' => $s->email,
                'interview_date' => $s->pivot->interview_date,
                'interview_time' => $s->pivot->interview_time,
                'interview_done' => $s->pivot->interview_done,
                'is_absent' => $s->pivot->is_absent,
            ];
        });

        $unassigned = User::where('role', 'student')
            ->whereNotIn('id', $assigned->pluck('id'))
            ->get();

        return response()->json([
            'success' => true,
            'assignedStudents' => $assigned,
            'unassignedStudents' => $unassigned,
            'message' => 'Student interview updated successfully',
        ]);
    }

    public function toggleInterviewDone(Room $room, User $student)
    {
        $pivot = $room->assignedStudents()->where('user_id', $student->id)->firstOrFail()->pivot;
        // $newValue = !$pivot->interview_done;

        if ($pivot->is_absent && $pivot->interview_done) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot undo interview done for a student marked absent.',
            ], 400);
        }

        try {
            $interviewDateTime = \Carbon\Carbon::parse("{$pivot->interview_date} {$pivot->interview_time}", config('app.timezone'));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid interview date/time format.',
            ], 400);
        }
        if ($interviewDateTime->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot mark the interview as done before its scheduled date and time.',
            ], 400);
        }

        $newValue = !$pivot->interview_done;

        $room->assignedStudents()->updateExistingPivot($student->id, [
            'interview_done' => $newValue,
        ]);



        // If marking as done → close active session
        if ($newValue === true) {
            $activeSession = \App\Models\LobbySession::where('room_id', $room->id)
                ->where('guest_id', $student->id)
                ->where('status', 'active')
                ->first();

            if ($activeSession) {
                $activeSession->update([
                    'status' => 'ended',
                    'ended_at' => now(),
                ]);

                $room->disconnectCurrentParticipant();
                event(new \App\Events\RoomStatusUpdated($room->fresh(), 'call_ended'));
            }
        }

        $newSessionDetails = $room->assignedStudents()
            ->where('users.id', $student->id)
            ->withPivot('interview_date', 'interview_time', 'interview_done')
            ->first();

        // Create a simple object for the email job instead of passing the full model
        $sessionDetailsForEmail = null;
        if ($newSessionDetails && $newSessionDetails->pivot) {
            $sessionDetailsForEmail = (object) [
                'pivot' => (object) [
                    'interview_date' => $newSessionDetails->pivot->interview_date,
                    'interview_time' => $newSessionDetails->pivot->interview_time,
                    'interview_done' => $newSessionDetails->pivot->interview_done,
                    'is_absent' => $newSessionDetails->pivot->is_absent ?? false,
                ]
            ];
        }

        if ($newSessionDetails->pivot->interview_done) {
            SendInterviewEmail::dispatch('completed', $room, $student, $sessionDetailsForEmail);
        } else {
            SendInterviewEmail::dispatch('scheduled', $room, $student, $sessionDetailsForEmail);
        }

        return response()->json([
            'success' => true,
            'interview_done' => $newValue,
            'student' => $student,
            'message' => $newValue
                ? 'Interview marked as done. Please evaluate the student.'
                : 'Interview marked as not done.',
        ]);
    }



    public function toggleStudentIsAbsent(Room $room, User $student)
    {
         // Check if student is currently in the queue
    $studentInQueue = $room->queue()->where('user_id', $student->id)->exists();
    if ($studentInQueue) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot mark student as absent because they are currently in the queue.',
        ], 400);
    }
        $pivot = $room->assignedStudents()->where('user_id', $student->id)->firstOrFail()->pivot;


        if (empty($pivot->interview_date) || empty($pivot->interview_time)) {
            return response()->json([
                'success' => false,
                'message' => 'Interview date or time is missing.',
            ], 400);
        }

        try {
            $interviewDateTime = \Carbon\Carbon::parse("{$pivot->interview_date} {$pivot->interview_time}", config('app.timezone'));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid interview date/time format.',
            ], 400);
        }

        if ($interviewDateTime->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot mark the student as absent before the scheduled interview date and time.',
            ], 400);
        }


        $newValue = !$pivot->is_absent;

        $room->assignedStudents()->updateExistingPivot($student->id, [
            'is_absent' => $newValue,
            'interview_done' => $newValue,
        ]);

        $newSessionDetails = $room->assignedStudents()
            ->where('users.id', $student->id)
            ->withPivot('interview_date', 'interview_time', 'interview_done', 'is_absent')
            ->first();

        // Create a simple object for the email job instead of passing the full model
        $sessionDetailsForEmail = null;
        if ($newSessionDetails && $newSessionDetails->pivot) {
            $sessionDetailsForEmail = (object) [
                'pivot' => (object) [
                    'interview_date' => $newSessionDetails->pivot->interview_date,
                    'interview_time' => $newSessionDetails->pivot->interview_time,
                    'interview_done' => $newSessionDetails->pivot->interview_done,
                    'is_absent' => $newSessionDetails->pivot->is_absent,
                ]
            ];
        }

        if ($newSessionDetails->pivot->interview_done && $newSessionDetails->pivot->is_absent) {
            SendInterviewEmail::dispatch('absent', $room, $student, $sessionDetailsForEmail);
        } else {
            SendInterviewEmail::dispatch('scheduled', $room, $student, $sessionDetailsForEmail);
        }

        return response()->json([
            'success' => true,
            'is_absent' => $newValue,
            'interview_done' => $newValue,
            'message' => $newValue
                ? 'Student marked absent (interview done).'
                : 'Student marked present again.',
        ]);
    }
}
