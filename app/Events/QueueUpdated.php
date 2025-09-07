<?php

namespace App\Events;

use App\Models\Room;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QueueUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $room;
    public $action;
    public $user;
    public $sessionCode;

    /**
     * Create a new event instance.
     */
    public function __construct(Room $room, string $action, $user = null, ?string $sessionCode = null)
    {
        $this->room = $room->load(['queue.user', 'currentParticipant']);
        $this->action = $action; // 'joined', 'left', 'accepted'
        $this->user = $user;
        $this->sessionCode = $sessionCode;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("room.{$this->room->room_code}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'queue-updated';
    }
}
