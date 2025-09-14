<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Room;

class AssignedStudentsOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $roomCode = $request->route('roomCode');
        $roomOwnerID = Room::where('room_code', $roomCode)->first()->created_by;
        $user = $request->user();
        $userRooms = $user->assignedRooms()->where('room_code', $roomCode)->exists();
        if (!$user || (!$userRooms && $user->id != $roomOwnerID)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $next($request);
    }
}
