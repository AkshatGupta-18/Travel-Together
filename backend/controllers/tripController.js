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
    } = req.body;

    const coverImage = req.file ? req.file.path : "";

    let itinerary = [];
    if (req.body.itinerary) {
      try {
        itinerary = JSON.parse(req.body.itinerary);
      } catch (parseError) {
        return res.status(400).json({
          message: "Invalid itinerary format",
        });
      }
    }

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
      message: error.message || "Failed to create trip",
    });
  }
};

export const getOpenTrips = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 30);
    const { travelStyle } = req.query;

    // Hide trips that have already ended
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = {
      creator: { $ne: req.user._id }, // exclude the logged-in user's own trips
      status: "open",
      endDate: { $gte: today },
    };

    // Only accept values that exist in the schema enum
    if (travelStyle && Trip.schema.path("travelStyle").enumValues.includes(travelStyle)) {
      filter.travelStyle = travelStyle;
    }

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate("creator", "name username avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Trip.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      trips,
      page,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching open trips:", error);
    res.status(500).json({ success: false, message: "Failed to fetch open trips" });
  }
};

export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("creator", "name username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      trips,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
    });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate(
      "creator",
      "name username avatar"
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error("Error fetching trip:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trip",
    });
  }
};

export const getMyTrips = async function (req, res) {
  try {
    const trips = await Trip.find({
      creator: req.user._id,
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