<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_code',
        'role',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeForSession($query, string $sessionCode)
    {
        return $query->where('session_code', $sessionCode);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }
}