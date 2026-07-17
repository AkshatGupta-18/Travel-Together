// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    mood: {
      type: String,
      default: "",
    },
    photos: [
      {
        type: String, // Cloudinary URLs
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);