<?php

namespace App\Http\Controllers;

use App\Models\AIChatMessage;
use App\Models\LobbySession;
use App\Services\AIServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AIChatController extends Controller
{
    public function chat(Request $request, string $roomCode)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'array',
            'history.*.role' => 'in:user,assistant',
            'history.*.content' => 'string',
        ]);

        $session = LobbySession::where('session_code', $roomCode)->firstOrFail();
        $userId = Auth::id();

        // Only allow the creator (interviewer) to use AI chat
        if ($userId !== (int) $session->creator_id) {
            abort(403, 'Only the interviewer can use AI chat');
        }

        try {
            // Store user message
            AIChatMessage::create([
                'session_code' => $roomCode,
                'role' => 'user',
                'content' => $request->message,
            ]);

            // Get chat history from database
            $chatHistory = AIChatMessage::forSession($roomCode)
                ->orderBy('created_at')
                ->limit(20) // Last 20 messages for context
                ->get()
                ->map(fn($msg) => [
                    'role' => $msg->role,
                    'content' => $msg->content,
                ])
                ->toArray();

            $aiService = new AIServiceProvider();
            $response = $aiService->chat($request->message, $chatHistory);
            
            // Store AI response
            AIChatMessage::create([
                'session_code' => $roomCode,
                'role' => 'assistant',
                'content' => $response,
            ]);
            
            return response()->json([
                'response' => $response,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());
            
            return response()->json([
                'response' => 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
                'success' => false,
            ], 500);
        }
    }

    public function getHistory(string $roomCode)
    {
        $session = LobbySession::where('session_code', $roomCode)->firstOrFail();
        $userId = Auth::id();

        // Only allow the creator (interviewer) to get chat history
        if ($userId !== (int) $session->creator_id) {
            abort(403, 'Only the interviewer can access chat history');
        }

        $messages = AIChatMessage::forSession($roomCode)
            ->orderBy('created_at')
            ->get()
            ->map(fn($msg) => [
                'id' => $msg->id,
                'role' => $msg->role,
                'content' => $msg->content,
                'timestamp' => $msg->created_at->toISOString(),
            ]);

        return response()->json([
            'messages' => $messages,
            'success' => true,
        ]);
    }

    public function getProviderInfo()
    {
        $aiService = new AIServiceProvider();
        $providerInfo = $aiService->getProviderInfo();

        return response()->json([
            'provider' => $providerInfo,
            'success' => true,
        ]);
    }
}
