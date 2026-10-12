import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },

        async (accessToken, refreshToken, profile, done) => {
            try {
                // Get useful information from Google
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                const avatar = profile.photos?.[0]?.value;
                let user;

                user = await User.findOne({ email });

                if (user) {
                    user.googleId = googleId;
                    user.authProvider = "google";

                    if (!user.avatar && avatar) {
                        user.avatar = avatar;
                    }

                    await user.save();

                    return done(null, user);
                }

                // 3. Create a unique username for the new user
                let username = email.split("@")[0].toLowerCase();

                let existingUsername = await User.findOne({ username });

                let counter = 1;

                while (existingUsername) {
                    username = `${email.split("@")[0].toLowerCase()}${counter}`;

                    existingUsername = await User.findOne({ username });

                    counter++;
                }

                // 4. Create the new Travel Together user
                user = await User.create({
                    name,
                    username,
                    email,
                    googleId,
                    authProvider: "google",
                    avatar,
                });

                // 5. Give the user back to Passport
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;