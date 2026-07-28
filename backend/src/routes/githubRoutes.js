import { Router } from "express";
import { getLiveGitHub } from "../controllers/githubController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const githubRoutes = Router();

githubRoutes.get("/live", asyncHandler(getLiveGitHub));
