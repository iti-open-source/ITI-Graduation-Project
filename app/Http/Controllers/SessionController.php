<?php

namespace App\Http\Controllers;

use App\Events\RoomSessionSignaling;
use App\Models\LobbySession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function create()
    {
        $code = Str::upper(Str::random(6));
        return redirect()->route('session.room', ['roomCode' => $code, 'creator' => 1]);
    }

    public function room(string $sessionCode, Request $request)
    {
        $session = LobbySession::where('session_code', $sessionCode)->firstOrFail();
        $userId = Auth::id();

        if ($userId !== $session->creator_id && $userId !== $session->guest_id) {
            abort(403);
        }

        return \Inertia\Inertia::render('session/room', [
            'roomCode' => $sessionCode,
            'isCreator' => $userId === (int) $session->creator_id,
            'pusherKey' => config('broadcasting.connections.pusher.key'),
            'pusherCluster' => config('broadcasting.connections.pusher.options.cluster') ?? 'mt1',
        ]);
    }

    public function signal(Request $request, string $sessionCode)
    {
        $validated = $request->validate([
            'type' => 'required|in:offer,answer,ice-candidate,ready',
            'data' => 'required',
        ]);

        $session = LobbySession::where('session_code', $sessionCode)->firstOrFail();
        $userId = Auth::id();
        if ($userId !== $session->creator_id && $userId !== $session->guest_id) {
            abort(403, 'Not authorized for this session');
        }

        event(new RoomSessionSignaling($sessionCode, $validated['type'], $validated['data'], $userId));

        return response()->json(['ok' => true]);
    }

    public function terminate(Request $request, string $sessionCode)
    {
        $session = LobbySession::where('session_code', $sessionCode)->firstOrFail();
        $userId = Auth::id();
        if ($userId !== $session->creator_id && $userId !== $session->guest_id) {
            abort(403);
        }

        $session->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        // Notify both session participants
        event(new RoomSessionSignaling($sessionCode, 'terminated', ['by' => $userId], $userId));

        // Broadcast room status so creator lobby updates Active Sessions
        $room = \App\Models\Room::find($session->room_id);
        if ($room) {
            event(new \App\Events\RoomStatusUpdated($room->fresh(), 'call_ended'));
        }

        return redirect()->route('lobby');
    }
}


