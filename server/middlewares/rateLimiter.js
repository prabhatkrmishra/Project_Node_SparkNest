/**
 * Rate limiting middleware.
 */
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  keyGenerator: (req) => req.ip,
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  keyGenerator: (req) => req.ip,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const writeLimiter = rateLimit({
  keyGenerator: (req) => req.ip,
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export function applyRateLimit(req, res, next) {
  return limiter(req, res, next);
}
