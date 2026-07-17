import User from "../models/User.js";

// users.controller.js
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id; // from your auth middleware

    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("-password -__v") // never expose password
      .limit(20)
      .lean();

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};