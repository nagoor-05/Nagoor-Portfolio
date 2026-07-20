import { Router } from "express";
import {
  createItem,
  deleteItem,
  getPublicItem,
  listAdminItems,
  listPublicItems,
  updateItem,
} from "../controllers/itemController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { resolveOwner } from "../middleware/owner.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validatePortfolioItem } from "../validators/itemValidator.js";

export function createItemRouter(type, { details = false } = {}) {
  const router = Router();
  router.get("/", resolveOwner, asyncHandler(listPublicItems(type)));
  router.get("/admin", requireAuth, requireAdmin, asyncHandler(listAdminItems(type)));
  if (details) router.get("/:slug", resolveOwner, asyncHandler(getPublicItem(type)));
  router.post("/", requireAuth, requireAdmin, validateBody(validatePortfolioItem), asyncHandler(createItem(type)));
  router.put("/:id", requireAuth, requireAdmin, validateBody(validatePortfolioItem), asyncHandler(updateItem(type)));
  router.delete("/:id", requireAuth, requireAdmin, asyncHandler(deleteItem(type)));
  return router;
}
