import { env } from "../config/env.js";
import { createHttpError } from "../utils/response.js";

export function validateAiRequest(req, res, next) {
  const message = req.ai?.message || "";
  if (!message) return next(createHttpError("Please enter a question for the portfolio assistant.", 400));
  if (message.length > env.aiMaxQuestionLength) {
    return next(createHttpError(`Question must be ${env.aiMaxQuestionLength} characters or less.`, 400));
  }
  if (req.ai?.history?.length > env.aiMaxHistoryItems) {
    return next(createHttpError("Conversation history is too large.", 400));
  }
  next();
}
