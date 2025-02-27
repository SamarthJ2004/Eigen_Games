import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from 'dotenv'

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = []; 
    socket.emit("prev_msgs", rooms[roomId]); 
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", ({ roomId, userId, text }) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    const msg = { userId, text };
    rooms[roomId].push(msg);
    io.to(roomId).emit("receive_message", msg); 
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
console.log("Port: ",process.env.PORT);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
