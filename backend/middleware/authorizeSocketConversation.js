import Conversation from "../models/Conversation.js";

export const authorizeSocketConversation = async (
  socket,
  conversationId
) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: socket.user._id,
    });

    return conversation;
  } catch (error) {
    console.error("Socket conversation authorization failed:", error.message);
    return null;
  }
};