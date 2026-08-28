/**
 * Controller for handling authentication-related requests.
 */

import { createUser, getUserByEmail } from "../models/userModel.js";
import { hashPassword } from "../services/bcryptService.js";
import { subscribeUser } from "../services/newsletterService.js";
import passport from "passport";
import { env } from "../config/env.js";

function stripPassword(user) {
  if (!user) return user;
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = user;
  return safe;
}

/**
 * Handle user signup.
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
    try {
      await subscribeUser(email, "newsletter", req.body.newsletter);
    } catch (e) {
      console.warn("subscribeUser failed:", e.message);
    }

    res
      .status(201)
      .json({ message: "User registered successfully.", user: stripPassword(newUser) });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Handle user login.
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
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
        req.session.maxAge = req.session.cookie.maxAge;
      } else {
        req.session.cookie.expires = false;
        req.session.maxAge = null;
      }
      const safe = stripPassword(user);
      res.status(200).json({
        message: "",
        sessionId: req.sessionID,
        cookieAge: req.session.cookie.maxAge,
        id: safe.id,
        email: safe.email,
        fname: safe.fname,
        lname: safe.lname,
        username: safe.username,
        region: safe.region,
        bio: safe.bio,
        avatar: safe.avatar,
      });
    });
  })(req, res, next);
}

/**
 * Handle user logout.
 */
export function logout(req, res) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout error" });
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ error: "Session destroy error" });
      }
      res.clearCookie("sparknest.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
}

/**
 * Handle Google OAuth authentication.
 */
export const googleAuth = (req, res) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

/**
 * Handle callback after Google authentication.
 */
export const googleAuthCallback = (req, res) => {
  passport.authenticate("google", (err, user, _info) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ success: false, message: "Login failed" });
      }
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
      req.session.maxAge = req.session.cookie.maxAge;

      // No PII in URL — frontend fetches user via session
      return res.redirect(`${env.FRONTEND_ADDRESS}/google/success`);
    });
  })(req, res);
};
