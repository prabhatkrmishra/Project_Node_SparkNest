export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const message = status === 500 ? "Internal Server Error" : err.message;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ message, ...(err.details && { details: err.details }) });
}

export function notFound(req, res, next) {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
}
