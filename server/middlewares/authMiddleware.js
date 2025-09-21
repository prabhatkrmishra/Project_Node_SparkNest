/**
 * Middleware for authenticating users.
 */

/**
 * Check if the user is authenticated.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware/route
    return next();
  }
  return res.status(403).json({ message: "Not authenticated" });
}
