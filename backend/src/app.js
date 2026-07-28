import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { logsRoutes } from "./routes/logsRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { publicPortfolioRoutes } from "./routes/publicPortfolioRoutes.js";
import { createItemRouter } from "./routes/itemRoutes.js";
import { createSectionRouter } from "./routes/contentRoutes.js";
import { seoRoutes } from "./routes/seoRoutes.js";
import { mediaRoutes } from "./routes/mediaRoutes.js";
import { contactMessageRoutes } from "./routes/contactMessageRoutes.js";
import { githubRoutes } from "./routes/githubRoutes.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { requestLogger } from "./middleware/requestLogger.js";

export const app = express();

const allowedOrigins = new Set([
  env.clientUrl,
  env.adminUrl,
  ...env.extraClientUrls,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(requestLogger);
app.use(
  "/api",
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

function healthResponse(req, res) {
  res.json({
    success: true,
    service: "personal-portfolio-backend",
    environment: env.nodeEnv,
  });
}

app.get("/health", healthResponse);
app.get("/api/health", healthResponse);
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/public/portfolio", publicPortfolioRoutes);
app.use("/api/hero", createSectionRouter("hero"));
app.use("/api/about", createSectionRouter("about"));
app.use("/api/resume", createSectionRouter("resume"));
app.use("/api/contact", createSectionRouter("contact"));
app.use("/api/landing", createSectionRouter("landing"));
app.use("/api/stats", createSectionRouter("stats"));
app.use("/api/github-profile", createSectionRouter("githubProfile"));
app.use("/api/github", githubRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/site-settings", createSectionRouter("siteSettings"));

app.use("/api/projects", createItemRouter("project", { details: true }));
app.use("/api/skills", createItemRouter("skill"));
app.use("/api/certifications", createItemRouter("certification"));
app.use("/api/articles", createItemRouter("article", { details: true }));
app.use("/api/coding-profiles", createItemRouter("codingProfile"));
app.use("/api/social-links", createItemRouter("socialLink"));
app.use("/api/education", createItemRouter("education"));
app.use("/api/experience", createItemRouter("experience"));

app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/contact-messages", contactMessageRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
