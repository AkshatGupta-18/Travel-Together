import "dotenv/config";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  createTrip,
  getAllTrips,
  getMyTrips,
  getOpenTrips,
  getTripById,
} from "../controllers/tripController.js";

import { protect } from "../middleware/authMiddleware.js";

import Trip from "../models/Trip.js";

const router = express.Router();

// ─── CLOUDINARY CONFIG + STORAGE ──────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "travel-together/trips",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Wrap multer so upload errors return JSON instead of an HTML 500 page
function uploadCover(req, res, next) {
  upload.single("coverImage")(req, res, function (err) {
    if (err) {
      console.error("Cover image upload error:", err);
      return res.status(400).json({
        message: err.message || "Image upload failed",
      });
    }
    next();
  });
}

router.get("/open", protect, getOpenTrips);   // ← add, before /:tripId

// ─── POST /api/trips ──────────────────────────────────────────────────────────

router.post("/", protect, uploadCover, createTrip);

// ─── GET /api/trips ───────────────────────────────────────────────────────────

router.get("/", protect, getAllTrips);

// ─── GET /api/trips/my-trips (must come before /:tripId) ──────────────────────

router.get("/my-trips", protect, getMyTrips);

// ─── GET /api/trips/:tripId ───────────────────────────────────────────────────

router.get("/:tripId", protect, getTripById);

// ─── DELETE /api/trips/:tripId ────────────────────────────────────────────────

router.delete("/:tripId", protect, async function (req, res) {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (trip.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await trip.deleteOne();

    res.json({
      message: "Trip deleted successfully",
    });
  } catch (err) {
    console.error("Delete trip error:", err);

    res.status(500).json({
      message: "Failed to delete trip",
    });
  }
});

export default router;