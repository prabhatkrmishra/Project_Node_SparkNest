import express from "express";
import {
  signup,
  login,
  logout,
  googleAuth,
  googleAuthCallback,
} from "../controllers/authController.js";
import { validate } from "../validators/validate.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const authRouter = express.Router();

/**
 * @route POST /signup
 * @description Register a new user
 * @access Public
 */
authRouter.post("/signup", authLimiter, validate(signupSchema), signup);

/**
 * @route POST /login
 * @description Log in an existing user
 * @access Public
 */
authRouter.post("/login", authLimiter, validate(loginSchema), login);

/**
 * @route POST /logout
 * @description Log out the current user
 * @access Private
 */
authRouter.post("/logout", logout);

/**
 * @route GET /auth/google
 * @description Google authentication
 * @access Private
 */
authRouter.get("/auth/google", googleAuth);

/**
 * @route GET /auth/google/home
 * @description Google authentication callback to server
 * @access Private
 */
authRouter.get("/auth/google/home", googleAuthCallback);

export default authRouter;
