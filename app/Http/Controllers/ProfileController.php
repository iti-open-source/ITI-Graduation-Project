<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;

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
            // Get rooms created by this instructor with assigned student counts
            $data['userRooms'] = Room::where('created_by', $user->id)
                ->where('is_active', true)
                ->withCount('assignedStudents')
                ->with(['assignedStudents:id,name,email'])
                ->get()
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
                });
        } elseif ($user->role === 'student') {
            // Get rooms assigned to this student with interview details
            $data['upcomingInterviews'] = $user->assignedRooms()
                ->where('is_active', true)
                ->with(['creator:id,name'])
                ->get()
                ->map(function ($room) use ($user) {
                    // Get the pivot data for this student
                    $pivotData = $room->assignedStudents()
                        ->where('users.id', $user->id)
                        ->withPivot('interview_date', 'interview_time')
                        ->first();

                    return [
                        'id' => $room->id,
                        'room_name' => $room->name,
                        'room_code' => $room->room_code,
                        'interview_date' => $pivotData?->pivot?->interview_date,
                        'interview_time' => $pivotData?->pivot?->interview_time,
                        'instructor_name' => $room->creator?->name ?? 'Unknown',
                    ];
                })
                // ->filter(function ($interview) {
                //     // Only include interviews that have both date and time set
                //     return $interview['interview_date'] && $interview['interview_time'];
                // })
                ->values();
        }
        return Inertia::render('profile', $data);
    }
}
