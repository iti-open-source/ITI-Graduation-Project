<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $data = [];

        if ($user->role === 'instructor') {
            $data['userRooms'] = $this->handleInstructorProfile($user);
        } elseif ($user->role === 'student') {
            // Upcoming interviews (exclude completed)
            $data['upcomingInterviews'] = $this->getUpcomingInterviews($user);
            // Previous (ended) with feedback
            $data['previousInterviews'] = $this->getPreviousInterviews($user);
        }
        return Inertia::render('profile', $data);
    }

    private function handleInstructorProfile($user)
    {
        // Get rooms created by this instructor with assigned student counts
        $userRooms = Room::where('created_by', $user->id)
            ->where('is_active', true)
            ->withCount('assignedStudents')
            ->with(['assignedStudents:id,name,email'])
            ->get()
            ->sortBy('last_activity', SORT_REGULAR, true)
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'room_code' => $room->room_code,
                    'is_active' => $room->is_active,
                    'last_activity' => $room->last_activity,
                    'assignedStudentsCount' => $room->assigned_students_count,
                    'assignedStudents' => $room->assignedStudents,
                ];
            })
            ->values();
        return $userRooms;
    }


    private function getUpcomingInterviews($user)
    {
        $upcomingInterviews = $user->assignedRooms()
            ->where('is_active', true)
            ->with(['creator:id,name'])
            ->get()
            ->map(function ($room) use ($user) {
                $pivotData = $room->assignedStudents()
                    ->where('users.id', $user->id)
                    ->withPivot('interview_date', 'interview_time', 'is_absent', 'interview_done')
                    ->first();

                if ((bool) ($pivotData?->pivot?->interview_done)) {
                    return null;
                }

                return [
                    'id' => $room->id,
                    'room_name' => $room->name,
                    'room_code' => $room->room_code,
                    'interview_date' => $pivotData?->pivot?->interview_date,
                    'interview_time' => $pivotData?->pivot?->interview_time,
                    'instructor_name' => $room->creator?->name ?? 'Unknown',
                    'is_absent' => (bool) ($pivotData?->pivot?->is_absent),
                    'interview_done' => (bool) ($pivotData?->pivot?->interview_done),
                ];
            })
            ->filter()
            ->values();

        return $upcomingInterviews;
    }

    private function getPreviousInterviews($user)
    {
        $previousInterviews = DB::table('lobby_sessions as ls')
            ->join('rooms as r', 'r.id', '=', 'ls.room_id')
            ->leftJoin('interview_evaluations as ie', 'ie.lobby_session_id', '=', 'ls.id')
            ->join('users as u', 'u.id', '=', 'r.created_by')
            ->where('ls.guest_id', $user->id)
            ->where('ls.status', 'ended')
            ->orderByDesc('ls.ended_at')
            ->select([
                'ls.id as session_id',
                'ls.session_code',
                'ls.started_at',
                'ls.ended_at',
                'r.name as room_name',
                'r.room_code',
                'u.name as instructor_name',
                'ie.rating',
                'ie.comments',
                'ie.ai_feedback',
            ])
            ->get()
            ->map(function ($row) {
                return [
                    'session_id' => $row->session_id,
                    'session_code' => $row->session_code,
                    'room_name' => $row->room_name,
                    'room_code' => $row->room_code,
                    'instructor_name' => $row->instructor_name,
                    'ended_at' => $row->ended_at,
                    'rating' => $row->rating,
                    'comments' => $row->comments,
                    'ai_feedback' => $row->ai_feedback,
                ];
            });

        return $previousInterviews;
    }



    public function state(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['upcomingInterviews' => [], 'previousInterviews' => []]);
        }

        // Upcoming (exclude completed)
        $upcoming = $this->getUpcomingInterviews($user);
        // Previous (ended) with feedback
        $previous = $this->getPreviousInterviews($user);
        return response()->json([
            'upcomingInterviews' => $upcoming,
            'previousInterviews' => $previous,
        ]);
    }
}
