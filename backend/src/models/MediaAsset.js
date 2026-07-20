import mongoose from "mongoose";

const mediaAssetSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    category: {
      type: String,
      enum: ["profile", "cover", "project-image", "project-video", "resume", "certificate", "blog-image", "icon", "model", "other"],
      default: "other",
      index: true,
    },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    provider: { type: String, enum: ["local", "cloudinary"], default: "local" },
    resourceType: { type: String, enum: ["image", "video", "raw", "auto"], default: "auto" },
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    altText: { type: String, default: "" },
    tags: [{ type: String }],
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ ownerId: 1, category: 1, createdAt: -1 });
mediaAssetSchema.index({ ownerId: 1, title: "text", originalName: "text", altText: "text", tags: "text" });

export const MediaAsset = mongoose.model("MediaAsset", mediaAssetSchema);
