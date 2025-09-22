<?php

namespace App\Http\Controllers;

// use App\Events\RoomSessionSignaling; // Removed: no longer broadcasting to Pusher
use App\Models\LobbySession;
use App\Models\InterviewEvaluation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Models\Room;
use App\Mail\InterviewEvaluation as InterviewEvaluationMail;
use App\Models\User;

class SessionController extends Controller
{
    public function create()
    {
        $code = Str::upper(Str::random(6));
        return redirect()->route('session.room', ['roomCode' => $code, 'creator' => 1]);
    }

    public function evaluate(Request $request, string $sessionCode)
    {
        $session = LobbySession::where('session_code', $sessionCode)->firstOrFail();
        $userId = Auth::id();

        // Only interviewer (creator) can evaluate
        if ($userId !== (int) $session->creator_id) {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:10',
            'comments' => 'nullable|string|max:5000',
        ]);

        $evaluation = InterviewEvaluation::create([
            'lobby_session_id' => $session->id,
            'guest_id' => $session->guest_id,
            'created_by' => $userId,
            'rating' => $validated['rating'],
            'comments' => $validated['comments'] ?? null,
        ]);

        // End the session as part of evaluation submission
        $session->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        // Send evaluation email to the interviewee
        $interviewee = User::find($session->guest_id);
        $evaluationRoom = Room::find($session->room_id);
        $sessionDetails = $evaluationRoom->assignedStudents()
            ->where('users.id', $interviewee->id)
            ->withPivot('interview_date', 'interview_time')
            ->first();

        if ($interviewee && $evaluationRoom && $sessionDetails) {
            Mail::to($interviewee->email)->send(new InterviewEvaluationMail(
                $evaluationRoom,
                $interviewee,
                $sessionDetails,
                $validated['rating'],
                $validated['comments'] ?? ''
            ));
        }



        // No broadcast; clients poll session state

        $room = \App\Models\Room::find($session->room_id);
        if ($room) {
            // Mark interview done on pivot for the guest in this room
            try {
                $room->assignedStudents()->updateExistingPivot($session->guest_id, [
                    'interview_done' => true,
                    'evaluation_id' => $evaluation->id,
                ]);
            } catch (\Throwable $e) {
                // ignore if not assigned via pivot
            }

            // Disconnect and broadcast
            $room->disconnectCurrentParticipant();
            event(new \App\Events\RoomStatusUpdated($room->fresh(), 'call_ended'));
        }

        return response()->json([
            'success' => true,
            'roomCode' => $room?->room_code,
        ]);
    }

    public function room(string $sessionCode, Request $request)
    {
        $session = LobbySession::where('session_code', $sessionCode)->firstOrFail();
        $userId = Auth::id();

        if ($userId !== $session->creator_id && $userId !== $session->guest_id) {
            abort(403);
        }

        // Prevent access to ended sessions
        if ($session->status !== 'active') {
            // Redirect creator to lobby, guest to dashboard
            if ($userId === (int) $session->creator_id) {
                return redirect()->route('lobby');
            }
            return redirect()->route('dashboard');
        }

        return \Inertia\Inertia::render('session/room', [
            'roomCode' => $sessionCode,
            'isCreator' => $userId === (int) $session->creator_id,
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

        // Signaling broadcasts removed; rely on LiveKit connection and polling
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

        // No broadcast; clients poll session state

        // Clear current participant and broadcast room status so UIs update accordingly
        $room = \App\Models\Room::find($session->room_id);
        if ($room) {
            // Ensure the lobby reflects that no one is currently in call
            $room->disconnectCurrentParticipant();
            event(new \App\Events\RoomStatusUpdated($room->fresh(), 'call_ended'));
        }

        if ($room) {
            return redirect()->route('room.show', ['roomCode' => $room->room_code]);
        }
        return redirect()->route('lobby');
    }

    public function state(Request $request, string $sessionCode)
    {
        $session = LobbySession::where('session_code', $sessionCode)->first();
        if (!$session) {
            return response()->json(['exists' => false], 404);
        }

        $userId = Auth::id();
        if ($userId !== $session->creator_id && $userId !== $session->guest_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $room = \App\Models\Room::find($session->room_id);
        return response()->json([
            'exists' => true,
            'status' => $session->status,
            'started_at' => $session->started_at,
            'ended_at' => $session->ended_at,
            'room_id' => $session->room_id,
            'room_code' => $room?->room_code,
        ]);
    }
}
