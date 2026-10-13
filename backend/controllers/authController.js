import User from "../models/User.js";
import jwt from "jsonwebtoken";


// Generate JWT and set it as an httpOnly cookie
export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


// @route  POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email already in use" });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ message: "Username already taken" });

    const user = await User.create({ name, username, email, password });

    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @route  POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @route POST /api/auth/logout
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out" });
};

