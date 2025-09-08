<?php

namespace App\Http\Controllers;

use App\Events\QueueUpdated;
use App\Events\RoomStatusUpdated;
use App\Models\Room;
use App\Models\RoomQueue;
use App\Models\LobbySession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function lobby()
    {
        $user = Auth::user();
        $userRooms = $user->createdRooms()
            ->where('is_active', true)
            ->with(['currentParticipant', 'queue.user'])
            ->orderBy('last_activity', 'desc')
            ->get();

        return Inertia::render('lobby', [
            'userRooms' => $userRooms,
        ]);
    }

    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $room = Room::create([
            'name' => $request->name,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('room.show', $room->room_code);
    }

    public function show($roomCode)
    {
        $room = Room::where('room_code', $roomCode)
            ->with(['creator', 'currentParticipant', 'queue.user', 'sessions' => function($q){ $q->where('status','active')->latest('id'); }])
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
        if ($room->isCreator($user)) {
            return Inertia::render('room/creator', [
                'room' => $room,
            ]);
        }

        // Do not redirect solely based on current_participant; rely on active session check only

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
        $room->load(['sessions' => function($q){ $q->where('status','active')->latest('id'); }]);
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

        return redirect()->route('lobby');
    }

    // Legacy WebRTC signaling removed in favor of simple RTC flow
}
