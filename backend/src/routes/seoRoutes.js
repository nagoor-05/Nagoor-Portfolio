import { Router } from "express";
import * as seo from "../controllers/seoController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { resolveOwner } from "../middleware/owner.js";
import { validateBody } from "../middleware/validate.js";
import { validateContentSection } from "../validators/contentValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const seoRoutes = Router();

seoRoutes.get("/", resolveOwner, asyncHandler(seo.getSeo));
seoRoutes.get("/sitemap.xml", resolveOwner, asyncHandler(seo.sitemap));
seoRoutes.get("/robots.txt", resolveOwner, asyncHandler(seo.robots));
seoRoutes.get("/schema.json", resolveOwner, asyncHandler(seo.structuredData));
seoRoutes.get("/admin", requireAuth, requireAdmin, asyncHandler(seo.getAdminSeo));
seoRoutes.put("/", requireAuth, requireAdmin, validateBody(validateContentSection), asyncHandler(seo.updateSeo));
