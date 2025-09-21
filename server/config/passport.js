/*
 * Passport for Session Management,User Serialization/Deserialization
 * Responsibilities:
 * * Configure authentication strategies (e.g., local, OAuth).
 * * Serialize user information into the session.
 * * Deserialize user information from the session.
 * * Implement logic to find or create users during OAuth authentication.
 * * Handle authentication errors and provide feedback.
 * * Export the initialized Passport instance for use in the application.
 */

import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import {
  getUserDetailId,
  getUserDetailEmail,
  CreateGoogleUser,
} from "../models/userModel.js";
import { subscribeUser } from "../services/newsletterService.js";
import { verifyPassword } from "../services/bcryptService.js";

/**
 * Function to initialize passport strategies.
 *
 * @param {Object} passport - The passport object.
 */
export const initializePassport = (passport) => {
  /**
   * Local Strategy for authentication.
   *
   * @param {string} useremail - The user's email.
   * @param {string} password - The user's password.
   * @param {Function} done - Callback function to proceed with authentication.
   */
  passport.use(
    new LocalStrategy(
      { usernameField: "useremail", passwordField: "password" },
      async (useremail, password, done) => {
        const user = await getUserDetailEmail(useremail);
        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      }
    )
  );

  /**
   * Google Strategy for authentication.
   *
   * @param {string} accessToken - The access token for Google.
   * @param {string} refreshToken - The refresh token for Google.
   * @param {Object} profile - The user's profile information.
   * @param {Function} done - Callback function to proceed with authentication.
   */
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          //console.log("Google profile:", profile);
          const result = await getUserDetailEmail(profile.email);

          if (result == null) {
            //console.log("User not found, creating a new user.");
            const user = await CreateGoogleUser(profile);
            subscribeUser(profile.email, "newsletter", true);

            return done(null, user);
          } else {
            //console.log("User found, returning existing user.");
            return done(null, result);
          }
        } catch (err) {
          //console.error("Error during Google authentication:", err);
          return done(err);
        }
      }
    )
  );

  /**
   * Serialize user to store user ID in the session.
   *
   * @param {Object} user - The user object.
   * @param {Function} done - Callback function to complete serialization.
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /**
   * Deserialize user from session using user ID.
   *
   * @param {string} id - The user ID.
   * @param {Function} done - Callback function to complete deserialization.
   */
  passport.deserializeUser(async (id, done) => {
    const user = await getUserDetailId(id);
    done(null, user);
  });
};
