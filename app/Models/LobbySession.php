<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LobbySession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_code',
        'room_id',
        'creator_id',
        'guest_id',
        'status',
        'started_at',
        'ended_at',
    ];
}


