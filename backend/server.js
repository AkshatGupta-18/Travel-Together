import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/postRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import passport from "./config/passport.js";
import { socketAuth } from "./middleware/socketAuth.js";
import { authorizeSocketConversation } from "./middleware/authorizeSocketConversation.js";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.103:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  },
});


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/trips", tripRoutes);

io.use(socketAuth);

io.on("connection", (socket) => {
  // Join the room for a specific conversation
  socket.on("join_conversation", async (conversationId) => {
    try {
      const conversation = await authorizeSocketConversation(
        socket,
        conversationId
      );

      if (!conversation) {
        return;
      }

      socket.join(conversationId);
    } catch (err) {
      console.error("Failed to join conversation:", err);
    }
  });

  // REAL-TIME MESSAGE
  socket.on("send_message", async ({ conversationId, text }) => {
    try {
      if (!conversationId || !text?.trim()) {
        return;
      }

      const conversation = await authorizeSocketConversation(
        socket,
        conversationId
      );

      if (!conversation) {
        return;
      }

      const senderId = socket.user._id;

      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text: text.trim(),
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text: message.text,
          sender: senderId,
          createdAt: message.createdAt,
        },
      });

      io.to(conversationId).emit("new_message", message);
    } catch (err) {
      console.error("Failed to send real-time message:", err);
    }
  });

  // TYPING INDICATOR
  socket.on("typing", async ({ conversationId }) => {
    try {
      const conversation = await authorizeSocketConversation(
        socket,
        conversationId
      );

      if (!conversation) {
        return;
      }

      socket.to(conversationId).emit("user_typing", {
        userId: socket.user._id,
      });
    } catch (err) {
      console.error("Failed to handle typing event:", err);
    }
  });

  socket.on("stop_typing", async ({ conversationId }) => {
    try {
      const conversation = await authorizeSocketConversation(
        socket,
        conversationId
      );

      if (!conversation) {
        return;
      }

      socket.to(conversationId).emit("user_stop_typing", {
        userId: socket.user._id,
      });
    } catch (err) {
      console.error("Failed to handle stop typing event:", err);
    }
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});