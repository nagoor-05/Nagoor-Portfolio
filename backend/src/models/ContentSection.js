import mongoose from "mongoose";

const contentSectionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

contentSectionSchema.index({ ownerId: 1, key: 1 }, { unique: true });
export const ContentSection = mongoose.model("ContentSection", contentSectionSchema);
