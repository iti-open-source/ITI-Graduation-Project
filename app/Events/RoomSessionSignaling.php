<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoomSessionSignaling implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public string $roomCode;
    public string $type;
    public $data;
    public int $fromUserId;

    public function __construct(string $roomCode, string $type, $data, int $fromUserId)
    {
        $this->roomCode = $roomCode;
        $this->type = $type;
        $this->data = $data;
        $this->fromUserId = $fromUserId;
    }

    public function broadcastOn(): array
    {
        return [new Channel("session.room.{$this->roomCode}")];
    }

    public function broadcastAs(): string
    {
        return 'room-session-signaling';
    }
}


