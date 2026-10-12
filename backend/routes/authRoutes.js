import express from "express";
import { register, login, logout, generateTokenAndSetCookie } from "../controllers/authController.js";
import passport from "../config/passport.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get(
  "/google",
  passport.authenticate("google", {

    
    scope: ["profile", "email"],
  })
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    generateTokenAndSetCookie(res, req.user._id);

    res.redirect("http://localhost:5173/homepage");
  }
);


export default router;