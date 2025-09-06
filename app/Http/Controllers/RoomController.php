<?php

namespace App\Http\Controllers;

use App\Events\QueueUpdated;
use App\Events\RoomStatusUpdated;
use App\Events\WebRTCSignaling;
use App\Models\Room;
use App\Models\RoomQueue;
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
            ->with(['creator', 'currentParticipant', 'queue.user'])
            ->firstOrFail();

        $user = Auth::user();

        // If user is the creator, show the room management interface
        if ($room->isCreator($user)) {
            return Inertia::render('room/room-creator', [
                'room' => $room,
            ]);
        }

        // If user is already the current participant, show the video chat
        if ($room->current_participant === $user->id) {
            return Inertia::render('room/room-participant', [
                'room' => $room,
            ]);
        }

        // Check if user is already in queue
        $queueEntry = $room->queue()->where('user_id', $user->id)->with('user')->first();

        if ($queueEntry) {
            return Inertia::render('room/room-queue', [
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

        return Inertia::render('room/room-queue', [
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

        // Broadcast updates
        event(new QueueUpdated($room->fresh(), 'accepted', $targetUser->user));
        event(new RoomStatusUpdated($room->fresh(), 'participant_joined'));

        return response()->json([
            'success' => true,
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

        // If user is the current participant, disconnect them
        if ($room->current_participant === $user->id) {
            $room->disconnectCurrentParticipant();
            // Broadcast room status update
            event(new RoomStatusUpdated($room->fresh(), 'participant_left'));
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

    public function signaling(Request $request, $roomCode)
    {
        $request->validate([
            'type' => 'required|in:offer,answer,ice-candidate',
            'data' => 'required',
            'to_user_id' => 'nullable|exists:users,id',
        ]);

        $room = Room::where('room_code', $roomCode)->firstOrFail();
        $user = Auth::user();

        // Verify user is either the creator or current participant
        if (!$room->isCreator($user) && $room->current_participant !== $user->id) {
            abort(403, 'You are not authorized to send signaling data');
        }

        // Broadcast the signaling data
        event(new WebRTCSignaling(
            $roomCode,
            $request->type,
            $request->data,
            $user->id,
            $request->to_user_id
        ));

        return response()->json(['success' => true]);
    }
}
