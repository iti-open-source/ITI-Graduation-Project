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
            'stream' => 'boolean',
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
            
            // Check if streaming is requested
            if ($request->boolean('stream')) {
                return $this->streamResponse($aiService, $request->message, $chatHistory, $roomCode);
            }
            
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

    private function streamResponse(AIServiceProvider $aiService, string $message, array $chatHistory, string $roomCode)
    {
        $response = response()->stream(function () use ($aiService, $message, $chatHistory, $roomCode) {
            $fullResponse = '';
            
            try {
                foreach ($aiService->chatStream($message, $chatHistory) as $chunk) {
                    $fullResponse .= $chunk;
                    
                    // Send chunk as Server-Sent Event
                    echo "data: " . json_encode([
                        'type' => 'chunk',
                        'content' => $chunk,
                        'done' => false
                    ]) . "\n\n";
                    
                    if (ob_get_level()) {
                        ob_flush();
                    }
                    flush();
                }
                
                // Store complete AI response
                AIChatMessage::create([
                    'session_code' => $roomCode,
                    'role' => 'assistant',
                    'content' => $fullResponse,
                ]);
                
                // Send completion signal
                echo "data: " . json_encode([
                    'type' => 'done',
                    'content' => '',
                    'done' => true
                ]) . "\n\n";
                
            } catch (\Exception $e) {
                Log::error('AI Stream Error: ' . $e->getMessage());
                
                echo "data: " . json_encode([
                    'type' => 'error',
                    'content' => 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
                    'done' => true
                ]) . "\n\n";
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable Nginx buffering
        ]);

        return $response;
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
