import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // your Vite/React dev origin
  credentials: true,               // ← allows cookies cross-origin
}));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);


app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);