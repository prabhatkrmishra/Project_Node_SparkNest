import { AppError } from "../middlewares/errorMiddleware.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  if (!result.success) {
    return next(new AppError(400, "Validation failed", result.error.flatten()));
  }
  // Attach parsed data for convenience
  req.validated = result.data;
  next();
};
