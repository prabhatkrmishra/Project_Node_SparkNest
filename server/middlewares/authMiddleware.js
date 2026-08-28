/**
 * Auth middleware — Express-compatible.
 */
import { AppError } from "./errorMiddleware.js";

export function isAuthenticated(req) {
  return req.isAuthenticated ? req.isAuthenticated() : false;
}

export function requireAuth(req, _res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return next(new AppError(401, "Not authenticated"));
}

export function requireOwner(paramName = "id") {
  return (req, _res, next) => {
    const current = req.session?.passport?.user;
    const target = req.params[paramName] || req.body[paramName] || req.body.id || req.body.user_id;
    if (!current) return next(new AppError(401, "Not authenticated"));
    if (String(current) !== String(target)) return next(new AppError(403, "Not authorized"));
    next();
  };
}
