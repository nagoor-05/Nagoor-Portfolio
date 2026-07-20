import { Router } from "express";
import { getAdminSection, getPublicSection, updateSection } from "../controllers/contentController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { resolveOwner } from "../middleware/owner.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateContentSection } from "../validators/contentValidator.js";

export const sectionKeys = ["hero", "about", "resume", "contact", "landing", "stats", "seo", "siteSettings"];

export function createSectionRouter(key) {
  const router = Router();
  router.get("/", resolveOwner, asyncHandler(getPublicSection(key)));
  router.get("/admin", requireAuth, requireAdmin, asyncHandler(getAdminSection(key)));
  router.put("/", requireAuth, requireAdmin, validateBody(validateContentSection), asyncHandler(updateSection(key)));
  return router;
}
