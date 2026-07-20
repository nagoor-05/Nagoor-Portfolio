import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventType: { type: String, required: true, index: true },
    page: { type: String, default: "" },
    path: { type: String, default: "" },
    sessionId: { type: String, default: "", index: true },
    visitorId: { type: String, default: "" },
    durationMs: { type: Number, default: 0 },
    scrollDepth: { type: Number, default: 0 },
    device: { type: String, default: "unknown" },
    browser: { type: String, default: "unknown" },
    country: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },
    referrer: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ ownerId: 1, createdAt: -1 });
analyticsEventSchema.index({ ownerId: 1, eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ ownerId: 1, visitorId: 1, createdAt: -1 });
analyticsEventSchema.index({ ownerId: 1, sessionId: 1, createdAt: -1 });
export const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);
