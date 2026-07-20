import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    localTime: { type: String, default: "" },
    source: { type: String, default: "portfolio" },
    status: { type: String, enum: ["unread", "read", "archived", "replied"], default: "unread", index: true },
    replyNotes: { type: String, default: "" },
    honeypot: { type: String, default: "" },
    ipHash: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    notificationStatus: { type: String, enum: ["emailjs", "queued", "sent", "failed", "none"], default: "none" },
  },
  { timestamps: true }
);

contactMessageSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
contactMessageSchema.index({ ownerId: 1, name: "text", email: "text", subject: "text", message: "text" });

export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
