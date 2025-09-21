/**
 * Controller for handling authentication-related requests.
 */

import { createUser, getUserByEmail } from "../models/userModel.js";
import { hashPassword } from "../services/bcryptService.js";
import { subscribeUser } from "../services/newsletterService.js";
import passport from "passport";
import config from "../config/config.js";

/**
 * Handle user signup.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function signup(req, res) {
  const { fname, lname, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Credentials are empty" });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists in database" });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await createUser({
      fname,
      lname,
      email,
      password: hashedPassword,
    });
    await subscribeUser(email, "newsletter", req.body.newsletter)

    res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Handle user login.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export function login(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login error" });
      }
      if (req.body.savesession) {
        // Only 30 day
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
        req.session.maxAge = req.session.cookie.maxAge;
        //console.log("Session will be saved for 30 days");
      } else {
        req.session.cookie.expires = false;
        req.session.maxAge = null;
        //console.log("Session will expire when the browser is closed");
      }
      res.status(200).json({
        message: "",
        sessionId: req.sessionID,
        cookieAge: req.session.cookie.maxAge,
        id: user.id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        region: user.region,
        bio: user.bio
      });
    });
  })(req, res, next);
}

/**
 * Handle user logout.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export function logout(req, res) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout error" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
}

/**
 * Handle Google OAuth authentication.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const googleAuth = (req, res) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

/**
 * Handle callback after Google authentication.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const googleAuthCallback = (req, res) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res
          .status(500)
          .json({ success: false, message: "Login failed" });
      }
      // Default 30 days
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
      req.session.maxAge = req.session.cookie.maxAge;

      const userData = {
        sessionId: req.sessionID,
        cookieAge: req.session.cookie.maxAge,
        id: user.id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        region: user.region,
        bio: user.bio
      };
      return res.redirect(
        `${
          config.allowedOrigins
        }/google/login?login='success'&saveData='true'&user=${encodeURIComponent(
          JSON.stringify(userData)
        )}`
      );
    });
  })(req, res);
};
