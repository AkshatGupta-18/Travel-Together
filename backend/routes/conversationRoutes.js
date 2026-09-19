// routes/conversationRoutes.js
import express from "express";
import Conversation from "../models/Conversation.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// find or create a conversation between the logged-in user and another user
router.post("/find-or-create",protect,  async (req, res) => {
  try {
    const { userId } = req.body; // the OTHER user's id
    const myId = req.user._id; // from your auth middleware

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, userId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, userId],
      });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to find/create conversation" });
  }
});

// get all conversations for the logged-in user (for the "all chats" screen)
router.get("/",protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name avatar")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

export default router;