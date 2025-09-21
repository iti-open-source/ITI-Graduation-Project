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
        
        $merged = [];
        foreach ($transcripts as $transcript) {
            $speaker = $transcript->user->name ?? 'Unknown';
            $merged[] = "[{$speaker}]: {$transcript->text}";
        }
        
        return implode("\n", $merged);
    }
}
