import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    username: { type: String, required: true, unique: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: false },

    // Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    travelStyles: [{ type: String }],
    languages: [{ type: String }],
    dreamPlaces: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Google users don't have a password
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;