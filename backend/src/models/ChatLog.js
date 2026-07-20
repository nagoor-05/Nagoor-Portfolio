import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionId: { type: String, default: "" },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    model: String,
    status: { type: String, default: "success" },
    usage: { type: mongoose.Schema.Types.Mixed, default: {} },
    responseTimeMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ChatLog = mongoose.model("ChatLog", chatLogSchema);
