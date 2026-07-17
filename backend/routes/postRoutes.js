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

// ─── POST /api/posts ──────────────────────────────────────────────────────────
router.post("/", protect, upload.array("photos", 10), async (req, res) => {
  try {
    const { caption, location, mood } = req.body;

    const photoUrls = req.files.map(f => f.path);

    const post = await Post.create({
      user: req.user._id,
      caption,
      location,
      mood,
      photos: photoUrls,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// GET /api/posts/user/:userId  — all posts by a user
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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

// GET /api/posts — all posts, sorted by likes desc, with user info populated
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Fetch all posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

export default router;