import { LogEntry } from "../models/LogEntry.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export async function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  await LogEntry.create({
    ownerId: req.user?._id,
    type: "error",
    level: "error",
    method: req.method,
    path: req.originalUrl,
    status,
    message: error.message,
    metadata: { stack: process.env.NODE_ENV === "development" ? error.stack : undefined },
  }).catch(() => {});
  res.status(status).json({ success: false, message: status === 500 ? "Internal server error" : error.message });
}
