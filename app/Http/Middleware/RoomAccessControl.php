<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Room;
use \Carbon\Carbon;

class RoomAccessControl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $roomCode = $request->route('roomCode');
        $user = $request->user();

        if ($this->canAccessRoom($roomCode, $user) == false) {
            abort(403, 'You are not authorized to access this room.');
        }
        return $next($request);
    }
    private function canAccessRoom($roomCode, $user): bool
    {
        $room = Room::where('room_code', $roomCode)->first();
        $roomOwnerID = $room->created_by;
        $userRooms = $user->assignedRooms()->where('room_code', $roomCode)->exists();

        // first, check if the user is the room owner
        if ($user->id == $roomOwnerID) {
            return true;
        }

        // then, check if the user is assigned to this room
        if (!$userRooms) {
            return false;
        }

        // Allow access to the room page for assigned students regardless of schedule.
        // Timing constraints are enforced when joining the live session, not for viewing/queueing.
        return true;
    }
}
