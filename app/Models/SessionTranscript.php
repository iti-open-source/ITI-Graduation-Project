<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionTranscript extends Model
{
    protected $fillable = [
        'session_code',
        'user_id',
        'text',
        'timestamp_microseconds',
        'is_final',
        'confidence',
    ];

    protected $casts = [
        'is_final' => 'boolean',
        'confidence' => 'decimal:2',
        'timestamp_microseconds' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all transcripts for a session, ordered by timestamp
     */
    public static function forSession(string $sessionCode)
    {
        return static::where('session_code', $sessionCode)
            ->orderBy('timestamp_microseconds')
            ->with('user');
    }

    /**
     * Get merged transcript for a session
     */
    public static function getMergedTranscript(string $sessionCode): string
    {
        $transcripts = static::forSession($sessionCode)->get();
        
        // Get session to determine who is interviewer vs interviewee
        $session = \App\Models\LobbySession::where('session_code', $sessionCode)->first();
        if (!$session) {
            return '';
        }
        
        $merged = [];
        foreach ($transcripts as $transcript) {
            // Determine if this user is the interviewer (creator) or interviewee (guest)
            $speakerRole = $transcript->user_id == $session->creator_id ? 'Interviewer' : 'Interviewee';
            $merged[] = "[{$speakerRole}]: {$transcript->text}";
        }
        
        return implode("\n", $merged);
    }
}
