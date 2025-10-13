/**
 * Middleware for authenticating users.
 */

/**
 * Check if the user is authenticated.
 *
 * @param {Object} req - The request object.
 * @returns {boolean} - Returns true if authenticated, false otherwise.
 */
export function isAuthenticated(req) {
  return req.isAuthenticated();
}
