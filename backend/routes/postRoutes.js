// routes/postRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Post from "../models/Post.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── CLOUDINARY STORAGE ───────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "travel-together/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
});

const upload = multer({ storage });

// GET /api/posts — all posts except the logged-in user's, sorted by likes desc
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find({
      user: { $ne: req.user._id },
    })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      liked: post.likes.some(
        (id) => id.toString() === req.user._id.toString()
      ),
    }));

    res.json(postsWithLikeStatus);
  } catch (err) {
    console.error("Fetch all posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});


// GET /api/posts/user/:userId — get posts of a specific user
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.userId,
    })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      liked: post.likes.some(
        (id) => id.toString() === req.user._id.toString()
      ),
    }));

    res.json(postsWithLikeStatus);
  } catch (err) {
    console.error("Fetch user posts error:", err);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});


// ─── GET /api/posts/mine ──────────────────────────────────────────────────────
router.get("/mine", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// PATCH /api/posts/:id/like
router.patch("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id; // set by protect middleware
    const alreadyLiked = post.likes.some(id => id.equals(userId));

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (err) {
    console.error("Like toggle failed:", err);
    res.status(500).json({ message: "Failed to update like" });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", protect, async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check that the logged-in user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});



export default router;