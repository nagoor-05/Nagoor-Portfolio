import { LogEntry } from "../models/LogEntry.js";

export function requestLogger(req, res, next) {
  const started = Date.now();
  res.on("finish", () => {
    if (req.path === "/health") return;
    LogEntry.create({
      ownerId: req.user?._id,
      type: "api",
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      responseTime: Date.now() - started,
    }).catch(() => {});
  });
  next();
}
