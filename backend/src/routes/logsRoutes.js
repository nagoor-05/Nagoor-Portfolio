import { Router } from "express";
import * as logs from "../controllers/logsController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const logsRoutes = Router();
logsRoutes.use(requireAuth, requireAdmin);
logsRoutes.get("/api", asyncHandler(logs.apiLogs));
logsRoutes.get("/errors", asyncHandler(logs.errorLogs));
logsRoutes.get("/admin", asyncHandler(logs.adminLogs));
logsRoutes.get("/ai", asyncHandler(logs.aiLogs));
