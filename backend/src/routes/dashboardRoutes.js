import { Router } from "express";
import { contentSummary, dashboardOverview, recentActivity } from "../controllers/dashboardController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardRoutes = Router();
dashboardRoutes.use(requireAuth, requireAdmin);
dashboardRoutes.get("/overview", asyncHandler(dashboardOverview));
dashboardRoutes.get("/content-summary", asyncHandler(contentSummary));
dashboardRoutes.get("/recent-activity", asyncHandler(recentActivity));
