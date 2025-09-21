/**
 * Middleware for rate limiting requests.
 */

import rateLimit from "express-rate-limit";

/**
 * Rate limiter configuration.
 */
const limiter = rateLimit({
  keyGenerator: (req) => req.ip,
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

/**
 * Apply rate limiting to all requests.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export function applyRateLimit(req, res, next) {
  return limiter(req, res, next);
}
