  // routes/messageRoutes.js
  import express from "express";
  import Message from "../models/Message.js";
  import Conversation from "../models/Conversation.js";
  import { protect } from "../middleware/authMiddleware.js";
  import { authorizeConversation } from "../middleware/authorizeMiddleware.js";


  const router = express.Router();

  // get all messages for a conversation
  router.get("/:conversationId", protect, authorizeConversation ,async (req, res) => {
    try {
      const messages = await Message.find({
        conversation: req.params.conversationId,
      }).sort({ createdAt: 1 });

      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // send a message
  router.post("/",protect, authorizeConversation, async (req, res) => {
    try {
      const { conversationId, text } = req.body;
      const senderId = req.user._id;

      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text,
      });

      // update lastMessage preview on the conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: { text, sender: senderId, createdAt: message.createdAt },
      });

      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  export default router;