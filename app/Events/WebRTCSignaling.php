<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WebRTCSignaling implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $type;
    public $data;
    public $fromUserId;
    public $toUserId;

    /**
     * Create a new event instance.
     */
    public function __construct($roomCode, $type, $data, $fromUserId, $toUserId = null)
    {
        $this->roomCode = $roomCode;
        $this->type = $type; // 'offer', 'answer', 'ice-candidate'
        $this->data = $data;
        $this->fromUserId = $fromUserId;
        $this->toUserId = $toUserId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("room.{$this->roomCode}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'webrtc-signaling';
    }
}
