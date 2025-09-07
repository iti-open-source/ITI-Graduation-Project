import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface QueueUser {
    id: number;
    position: number;
    joined_at: string;
    user: User;
}

interface Room {
    id: number;
    name: string;
    room_code: string;
    is_active: boolean;
    last_activity: string;
    current_participant: User | null;
    queue: QueueUser[];
    queue_count: number;
}

interface QueueUpdateData {
    room: Room;
    action: 'joined' | 'left' | 'accepted';
    user?: User;
}

interface RoomStatusUpdateData {
    room: Room;
    action: 'participant_joined' | 'participant_left' | 'call_ended';
}

export function useRoomUpdates(roomCode: string, initialRoom: Room) {
    const [room, setRoom] = useState<Room>(initialRoom);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize Pusher
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || 'your-pusher-key', {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'us2',
            forceTLS: true,
        });

        const channel = pusher.subscribe(`room.${roomCode}`);

        // Handle queue updates
        channel.bind('queue-updated', (data: QueueUpdateData & { sessionCode?: string }) => {
            console.log('Queue updated:', data);
            setRoom(data.room);

            // If user was accepted, redirect to session page
            if (data.action === 'accepted' && data.user) {
                const code = data.sessionCode || roomCode;
                router.visit(`/session/${code}`);
            }
        });

        // Handle room status updates
        channel.bind('room-status-updated', (data: RoomStatusUpdateData) => {
            console.log('Room status updated:', data);
            setRoom(data.room);
        });

        // Handle connection status
        pusher.connection.bind('connected', () => {
            setIsConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
            setIsConnected(false);
        });

        return () => {
            channel.unbind_all();
            pusher.disconnect();
        };
    }, [roomCode]);

    return {
        room,
        isConnected,
    };
}
