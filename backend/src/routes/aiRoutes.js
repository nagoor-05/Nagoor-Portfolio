import { Router } from "express";
import { aiHealth, aiLogs, aiSuggestions, chat, deleteAiLog, projectSummary, recruiterSummary } from "../controllers/aiController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { aiRateLimiter } from "../middleware/aiRateLimiter.js";
import { resolveOwner } from "../middleware/owner.js";
import { sanitizeAiInput } from "../middleware/sanitizeAiInput.js";
import { validateBody } from "../middleware/validate.js";
import { validateAiRequest } from "../middleware/validateAiRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateAiQuestion } from "../validators/aiValidator.js";

export const aiRoutes = Router();
aiRoutes.get("/health", asyncHandler(aiHealth));
aiRoutes.get("/suggestions", asyncHandler(aiSuggestions));
aiRoutes.post("/chat", aiRateLimiter, resolveOwner, validateBody(validateAiQuestion), sanitizeAiInput, validateAiRequest, asyncHandler(chat));
aiRoutes.post("/project-summary", aiRateLimiter, resolveOwner, validateBody(validateAiQuestion), sanitizeAiInput, validateAiRequest, asyncHandler(projectSummary));
aiRoutes.post("/recruiter-summary", aiRateLimiter, resolveOwner, validateBody(validateAiQuestion), sanitizeAiInput, validateAiRequest, asyncHandler(recruiterSummary));
aiRoutes.get("/logs", requireAuth, requireAdmin, asyncHandler(aiLogs));
aiRoutes.delete("/logs/:id", requireAuth, requireAdmin, asyncHandler(deleteAiLog));
