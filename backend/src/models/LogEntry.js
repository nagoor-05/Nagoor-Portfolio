import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, enum: ["api", "error", "ai", "admin"], required: true, index: true },
    level: { type: String, default: "info" },
    method: String,
    path: String,
    status: Number,
    responseTime: Number,
    action: String,
    message: String,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

logEntrySchema.index({ type: 1, createdAt: -1 });
export const LogEntry = mongoose.model("LogEntry", logEntrySchema);
