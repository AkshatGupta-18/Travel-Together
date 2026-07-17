  // GET /api/users/me  — returns the logged-in user's profile
  import express from "express";
  import User from "../models/User.js";
  import multer from "multer";
  import cloudinary from "../config/cloudinary.js";
  import { protect } from "../middleware/authMiddleware.js";
  import { getAllUsers } from "../controllers/user.controller.js";



  const router = express.Router();

  //get user profile details 
  router.get("/me", protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  /* ── multer: hold avatar in memory (max 4 MB) ── */
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024 },
    fileFilter: (_, file, cb) =>
      file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Images only")),
  });

  // update user profile details
  router.patch(
    "/me",
    protect,                    // ensures req.user._id is set
    upload.single("avatar"),        // parses multipart; avatar lands in req.file
    async (req, res) => {
      try {
        /* ── 1. Parse text fields ── */
        const { name, username, location, bio, travelStyles, languages, dreamPlaces } = req.body;

        /* Build the update object – only include fields that were sent */
        const update = {};

        if (name !== undefined) update.name = name.trim().slice(0, 40);
        if (username !== undefined) update.username = username.trim().slice(0, 30);
        if (location !== undefined) update.location = location.trim().slice(0, 60);
        if (bio !== undefined) update.bio = bio.trim().slice(0, 160);

        if (travelStyles !== undefined) {
          const parsed = JSON.parse(travelStyles);          // frontend sends JSON string
          update.travelStyles = parsed.slice(0, 5);         // enforce max-5 on server too
        }

        if (languages !== undefined) {
          const parsed = JSON.parse(languages);
          update.languages = parsed.slice(0, 6);
        }

        if (dreamPlaces !== undefined) {
          const parsed = Array.isArray(dreamPlaces) ? dreamPlaces : JSON.parse(dreamPlaces);
          update.dreamPlaces = parsed.slice(0, 10);
        }

        /* ── 2. Handle optional avatar upload ── */
        if (req.file) {
          // Option A – store in Cloudinary
          const b64 = req.file.buffer.toString("base64");
          const mime = req.file.mimetype;                   // e.g. "image/jpeg"
          const dataUri = `data:${mime};base64,${b64}`;

          const result = await cloudinary.uploader.upload(dataUri, {
            folder: "avatars",
            public_id: `user_${req.user._id}`,             // overwrite previous avatar
            overwrite: true,
            transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
          });

          update.avatar = result.secure_url;

          // Option B – store as base64 in Mongo (fine for prototyping, not prod)
          // update.avatar = `data:${mime};base64,${b64}`;
        }

        /* ── 3. Prevent blank payload ── */
        if (Object.keys(update).length === 0) {
          return res.status(400).json({ error: "Nothing to update." });
        }

        /* ── 4. Write to MongoDB ── */
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          { $set: update },
          {
            returnDocument: "after",             // return the updated doc
            runValidators: true,   // run schema validators on updated fields
          }
        ).select("-password"); // exclude password from response

        if (!updatedUser) return res.status(404).json({ error: "User not found." });

        return res.status(200).json(updatedUser);
      } catch (err) {
        console.error("PATCH /api/users/me →", err);

        if (err.code === 11000) {
          // Duplicate key – username already taken
          const field = Object.keys(err.keyPattern)[0];
          return res.status(409).json({ error: `${field} is already taken.` });
        }

        return res.status(500).json({ error: "Failed to update profile." });
      }
    }
  );


  router.get("/:id", protect, async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });


  router.get('/', protect, getAllUsers);

  export default router;