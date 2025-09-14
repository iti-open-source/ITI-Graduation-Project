<?php

namespace App\Http\Controllers;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;
use App\Models\LobbySession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class WebRtcController extends Controller
{
    public function generateToken(Request $request): JsonResponse
    {
        $request->validate([
            'room' => 'required|string',
            'sessionCode' => 'nullable|string',
            'apiKey' => 'required|string',
            'apiSecret' => 'required|string',
        ]);

        $room = $request->input('room');
        $sessionCode = $request->input('sessionCode');
        $apiKey = $request->input('apiKey');
        $apiSecret = $request->input('apiSecret');

        // Get the authenticated user
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'error' => 'User not authenticated',
            ], 401);
        }

        $identity = $user->name;

        // If sessionCode is provided, verify user has access to this session
        if ($sessionCode) {
            $session = LobbySession::where('session_code', $sessionCode)->first();
            
            if (!$session) {
                return response()->json([
                    'error' => 'Session not found',
                ], 404);
            }

            $userId = Auth::id();
            if (!$userId || ($userId !== $session->creator_id && $userId !== $session->guest_id)) {
                return response()->json([
                    'error' => 'Unauthorized access to this session',
                ], 403);
            }

            // Verify session is still active
            if ($session->status !== 'active') {
                return response()->json([
                    'error' => 'Session is no longer active',
                ], 403);
            }
        }

        try {
            // Create access token options
            $options = new AccessTokenOptions([
                'identity' => $identity,
                'ttl' => 3600, // 1 hour in seconds
            ]);

            // Create access token using LiveKit SDK
            $accessToken = new AccessToken($apiKey, $apiSecret, $options);

            // Create video grant
            $videoGrant = new VideoGrant([
                'roomJoin' => true,
                'room' => $room,
                'canPublish' => true,
                'canSubscribe' => true,
            ]);

            // Set video grant to access token
            $accessToken->setGrant($videoGrant);

            // Generate the JWT token
            $token = $accessToken->toJwt();

            return response()->json([
                'token' => $token,
                'room' => $room,
                'identity' => $identity,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate token: ' . $e->getMessage(),
            ], 500);
        }
    }
}
