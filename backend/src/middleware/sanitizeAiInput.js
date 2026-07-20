import { normalizeAiRequest } from "../utils/normalizeMessages.js";

export function sanitizeAiInput(req, res, next) {
  req.ai = normalizeAiRequest(req.body || {});
  next();
}
