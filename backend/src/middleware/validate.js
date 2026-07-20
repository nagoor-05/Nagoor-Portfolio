import { createHttpError } from "../utils/response.js";

export function validateBody(validator) {
  return (req, res, next) => {
    const errors = validator(req.body || {});
    if (errors.length) return next(createHttpError(errors.join("; "), 400));
    next();
  };
}
