// models/Trip.js

import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    // User who created the trip
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic trip information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Trip schedule
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // Travel information
    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    maxTravelers: {
      type: Number,
      required: true,
      min: 2,
      max: 50,
    },

    travelStyle: {
      type: String,
      enum: [
        "Adventure",
        "Relaxation",
        "Backpacking",
        "Road Trip",
        "Nature",
        "Culture",
        "Photography",
        "Mixed",
      ],
      default: "Adventure",
    },

    accommodation: {
      type: String,
      trim: true,
      default: "",
    },

    transportation: {
      type: String,
      trim: true,
      default: "",
    },

    // Structured itinerary
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },

        title: {
          type: String,
          required: true,
          trim: true,
        },

        activities: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],

    // Cloudinary image URL
    coverImage: {
      type: String,
      default: "",
    },

    // Trip lifecycle
    status: {
      type: String,
      enum: ["open", "full", "completed", "cancelled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trip", tripSchema);