import { Router } from "express";
import * as contactMessages from "../controllers/contactMessageController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { resolveOwner } from "../middleware/owner.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const contactMessageRoutes = Router();

contactMessageRoutes.post("/", resolveOwner, asyncHandler(contactMessages.createMessage));
contactMessageRoutes.use(requireAuth, requireAdmin);
contactMessageRoutes.get("/", asyncHandler(contactMessages.listMessages));
contactMessageRoutes.put("/:id", asyncHandler(contactMessages.updateMessage));
contactMessageRoutes.delete("/:id", asyncHandler(contactMessages.deleteMessage));
