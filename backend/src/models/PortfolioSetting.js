import mongoose from "mongoose";

const portfolioSettingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

portfolioSettingSchema.index({ ownerId: 1, key: 1 }, { unique: true });

export const PortfolioSetting = mongoose.model("PortfolioSetting", portfolioSettingSchema);
