<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'room_code',
        'created_by',
        'current_participant',
        'is_active',
        'last_activity',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_activity' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($room) {
            if (empty($room->room_code)) {
                $room->room_code = Str::random(8);
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function currentParticipant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_participant');
    }

    public function queue(): HasMany
    {
        return $this->hasMany(RoomQueue::class)->orderBy('position');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(LobbySession::class, 'room_id');
    }

    public function getQueueCountAttribute(): int
    {
        return $this->queue()->count();
    }

    public function isCreator(User $user): bool
    {
        return $this->created_by === $user->id;
    }

    public function hasCurrentParticipant(): bool
    {
        return !is_null($this->current_participant);
    }

    public function addToQueue(User $user): RoomQueue
    {
        $position = $this->queue()->max('position') + 1;
        
        return $this->queue()->create([
            'user_id' => $user->id,
            'position' => $position,
            'joined_at' => now(),
        ]);
    }

    public function removeFromQueue(User $user): bool
    {
        $queueItem = $this->queue()->where('user_id', $user->id)->first();
        
        if ($queueItem) {
            $queueItem->delete();
            
            // Reorder remaining queue items
            $this->reorderQueue();
            
            return true;
        }
        
        return false;
    }

    public function setCurrentParticipant(?User $user): void
    {
        $this->update([
            'current_participant' => $user?->id,
            'last_activity' => now(),
        ]);
    }

    public function disconnectCurrentParticipant(): void
    {
        $this->setCurrentParticipant(null);
    }

    private function reorderQueue(): void
    {
        $queueItems = $this->queue()->orderBy('position')->get();
        
        foreach ($queueItems as $index => $item) {
            $item->update(['position' => $index + 1]);
        }
    }



public function assignedStudents()
{
    return $this->belongsToMany(User::class, 'room_user', 'room_id', 'user_id')
    ->withPivot('interview_date', 'interview_time','interview_done','is_absent')
                ->withTimestamps();
}

protected $with = ['assignedStudents']; 

protected $appends = ['assigned_students_count']; 

public function getAssignedStudentsCountAttribute()
{
    return $this->assignedStudents()->count();
}

}
