import { useEffect, useRef, useState } from "react";

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
  sessions?: { id: number; session_code: string; status: string }[];
}

interface QueueUpdateData {
  room: Room;
  action: "joined" | "left" | "accepted";
  user?: User;
}

interface RoomStatusUpdateData {
  room: Room;
  action: "participant_joined" | "participant_left" | "call_ended";
}

export function useRoomUpdates(roomCode: string, initialRoom: Room) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [isConnected, setIsConnected] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let aborted = false;

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/room/${roomCode}/state`, {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!aborted && json?.room) {
          setRoom(json.room);
          setIsConnected(true);
        }
      } catch (e) {
        if (!aborted) setIsConnected(false);
      }
    };

    // initial fetch immediately
    fetchState();
    // poll every 4s
    intervalRef.current = window.setInterval(fetchState, 4000);

    return () => {
      aborted = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [roomCode]);

  return { room, isConnected };
}
