import express from "express";
import http from "http";                    // ← NEW: raw http module
import { Server } from "socket.io";          // ← NEW: socket.io
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/postRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";  // ← NEW
import messageRoutes from "./routes/messageRoutes.js";            // ← NEW
import tripRoutes from "./routes/tripRoutes.js";


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);       // ← NEW: wrap app in raw server

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.103:5173",
    ],
    credentials: true,
  },
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.0.103:5173",
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);  // ← NEW
app.use("/api/messages", messageRoutes);             // ← NEW

app.use("/api/trips", tripRoutes);

// ← NEW: socket connection handling
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // NEW — relay typing status to the other person in the room
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user_typing", { userId });
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user_stop_typing", { userId });
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () =>        // ← CHANGED: app.listen → server.listen
  console.log(`Server running on port ${process.env.PORT}`)
);