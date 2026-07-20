import { Router } from "express";
import * as media from "../controllers/mediaController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const mediaRoutes = Router();

mediaRoutes.use(requireAuth, requireAdmin);
mediaRoutes.get("/", asyncHandler(media.listMedia));
mediaRoutes.post("/upload", asyncHandler(media.uploadMedia));
mediaRoutes.put("/:id", asyncHandler(media.updateMedia));
mediaRoutes.put("/:id/replace", asyncHandler(media.replaceMedia));
mediaRoutes.delete("/:id", asyncHandler(media.deleteMedia));
