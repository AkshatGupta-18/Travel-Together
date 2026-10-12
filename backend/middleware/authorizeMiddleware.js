import Conversation from "../models/Conversation.js";

export const authorizeConversation = async (req, res, next) => {
  try {
    const conversationId =
      req.params.conversationId || req.body.conversationId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(403).json({
        error: "You are not authorized to access this conversation",
      });
    }

    // Save it so later code can use it without querying again
    req.conversation = conversation;

    next();

  } catch (err) {
    res.status(500).json({
      error: "Authorization failed",
    });
  }
};