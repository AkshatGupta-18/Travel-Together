import Trip from "../models/Trip.js";

export const createTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      description,
      startDate,
      endDate,
      budget,
      maxTravelers,
      travelStyle,
      accommodation,
      transportation,
      itinerary,
      coverImage,
    } = req.body;

    // Check required fields
    if (
      !title ||
      !destination ||
      !description ||
      !startDate ||
      !endDate ||
      budget === undefined ||
      maxTravelers === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required trip details",
      });
    }

    // Check dates
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    const trip = await Trip.create({
      creator: req.user._id,
      title,
      destination,
      description,
      startDate,
      endDate,
      budget,
      maxTravelers,
      travelStyle,
      accommodation,
      transportation,
      itinerary,
      coverImage,
    });

    res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);

    res.status(500).json({
      message: "Failed to create trip",
      error: error.message,
    });
  }
};


export const getMyTrips = async function (req, res) {
  try {
    const trips = await Trip.find({
      creator: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      trips: trips,
    });
  } catch (error) {
    console.error("Error fetching user's trips:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
    });
  }
};