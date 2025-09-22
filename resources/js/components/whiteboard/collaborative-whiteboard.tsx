import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function CollaborativeWhiteboard({ roomCode }: { roomCode?: string }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId] = useState(roomCode);
  const lastChangeRef = useRef<number>(0);
  const isReceivingUpdate = useRef(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io("https://mockmate.adel.dev:2053", {
      transports: ["websocket", "polling"],
      timeout: 5000,
      forceNew: true,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("join-room", roomId);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("client-broadcast", (encryptedData: unknown) => {
      console.log("Received client-broadcast:", encryptedData);
      if (excalidrawAPI && !isReceivingUpdate.current) {
        try {
          isReceivingUpdate.current = true;
          const data = encryptedData as { elements?: unknown; appState?: unknown };

          if (data.elements) {
            console.log("Updating scene with elements:", data.elements);
            excalidrawAPI.updateScene({
              elements: data.elements as Parameters<
                typeof excalidrawAPI.updateScene
              >[0]["elements"],
            });
          }
        } catch (error) {
          console.error("Error updating scene:", error);
        } finally {
          // Use a small timeout to prevent the update flag from interfering with immediate subsequent updates
          setTimeout(() => {
            isReceivingUpdate.current = false;
          }, 10);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, excalidrawAPI]);

  // Handle Excalidraw changes
  const handleChange = (elements: readonly Record<string, unknown>[], appState: unknown) => {
    // Don't broadcast if we're currently receiving an update from another user
    if (!socket || !isConnected || isReceivingUpdate.current) {
      return;
    }

    const now = Date.now();
    // Simple throttling - allow updates every 10ms
    if (now - lastChangeRef.current < 100) {
      return;
    }

    lastChangeRef.current = now;

    try {
      socket.emit("server-broadcast", roomId, { elements, appState }, null);
    } catch (error) {
      console.error("Error broadcasting change:", error);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={(elements, appState) => handleChange(elements, appState)}
        />
      </div>
    </div>
  );
}
