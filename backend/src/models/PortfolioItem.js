import mongoose from "mongoose";

const portfolioItemSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["project", "skill", "article", "certification", "codingProfile", "socialLink", "education", "experience"],
      index: true,
    },
    slug: { type: String, trim: true },
    title: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

portfolioItemSchema.index({ ownerId: 1, type: 1, slug: 1 }, { unique: true, sparse: true });
portfolioItemSchema.index({ ownerId: 1, type: 1, order: 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, title: 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, "data.aliases": 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, "data.status": 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, "data.statusGroup": 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, "data.categories": 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, "data.technologies": 1 });
portfolioItemSchema.index({ ownerId: 1, type: 1, "data.keywords": 1 });
export const PortfolioItem = mongoose.model("PortfolioItem", portfolioItemSchema);
