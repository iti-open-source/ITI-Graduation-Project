<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterviewEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'lobby_session_id',
        'guest_id',
        'created_by',
        'rating',
        'comments',
    ];
}


