import cors from "cors";
import debug from "debug";
import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";

const ioDebug = debug("io");

const app = express();
const port = 3003;

// Enable CORS for all routes and origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Excalidraw collaboration server is up :)");
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Listening on port: " + port);
});

try {
  const io = new SocketIO(server, {
    transports: ["websocket", "polling"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    },
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    ioDebug("connection established!");
    io.to(`${socket.id}`).emit("init-room");

    socket.on("join-room", async (roomID) => {
      await socket.join(roomID);
    });

    socket.on("server-broadcast", (roomID, encryptedData, iv) => {
      socket.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
    });

    socket.on("server-volatile-broadcast", (roomID, encryptedData, iv) => {
      socket.volatile.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
    });

    socket.on("disconnecting", async () => {
      for (const roomID of Array.from(socket.rooms)) {
        const otherClients = (await io.in(roomID).fetchSockets()).filter(
          (_socket) => _socket.id !== socket.id,
        );

        const isFollowRoom = roomID.startsWith("follow@");

        if (!isFollowRoom && otherClients.length > 0) {
          socket.broadcast.to(roomID).emit(
            "room-user-change",
            otherClients.map((socket) => socket.id),
          );
        }

        if (isFollowRoom && otherClients.length === 0) {
          const socketId = roomID.replace("follow@", "");
          io.to(socketId).emit("broadcast-unfollow");
        }
      }
    });

    socket.on("disconnect", () => {
      socket.removeAllListeners();
      socket.disconnect();
    });
  });
} catch (error) {
  console.error(error);
}
