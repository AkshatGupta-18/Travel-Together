import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuth = async (socket, next) => {
  try {
    // Get cookies sent during the Socket.IO handshake
    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
      return next(new Error("Not authorized, no cookie"));
    }

    // Find the jwt cookie
    const jwtCookie = cookies
      .split("; ")
      .find((cookie) => cookie.startsWith("jwt="));

    if (!jwtCookie) {
      return next(new Error("Not authorized, no token"));
    }

    const token = jwtCookie.split("=")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach authenticated user to socket
    socket.user = user;

    // Authentication successful
    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Token invalid or expired"));
  }
};