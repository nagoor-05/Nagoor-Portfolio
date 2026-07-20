import { Router } from "express";
import { resolveOwner } from "../middleware/owner.js";
import { getPortfolio } from "../services/portfolioService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const publicPortfolioRoutes = Router();
publicPortfolioRoutes.get(
  "/:username",
  resolveOwner,
  asyncHandler(async (req, res) => {
    const portfolio = await getPortfolio(req.owner.username);
    if (portfolio?.siteSettings?.isPublished === false) {
      return res.status(403).json({ success: false, message: "Portfolio is currently unpublished" });
    }
    return sendSuccess(res, portfolio);
  })
);
