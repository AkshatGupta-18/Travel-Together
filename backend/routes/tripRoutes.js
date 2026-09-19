import express from "express";
import { createTrip, getMyTrips } from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";
import Trip from "../models/Trip.js";

const router = express.Router();

router.post("/", protect, createTrip);
router.get("/my-trips", protect, getMyTrips);

router.delete("/:tripId", protect, async function (req, res) {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await trip.deleteOne();

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error("Delete trip error:", err);
    res.status(500).json({ message: "Failed to delete trip" });
  }
});


export default router;