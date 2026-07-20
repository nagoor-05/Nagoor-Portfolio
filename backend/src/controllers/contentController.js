import { ContentSection } from "../models/ContentSection.js";
import { sendSuccess } from "../utils/response.js";
import { recordAdminActivity } from "../services/activityService.js";

export function getPublicSection(key) {
  return async (req, res) => {
    const section = await ContentSection.findOne({ ownerId: req.owner._id, key, isVisible: true }).lean();
    return sendSuccess(res, section?.data || {});
  };
}

export function getAdminSection(key) {
  return async (req, res) => {
    const section = await ContentSection.findOne({ ownerId: req.user._id, key }).lean();
    return sendSuccess(res, section || { key, data: {}, isVisible: true });
  };
}

export function updateSection(key) {
  return async (req, res) => {
    const section = await ContentSection.findOneAndUpdate(
      { ownerId: req.user._id, key },
      {
        $set: {
          data: req.body.data ?? req.body,
          isVisible: req.body.isVisible ?? true,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );
    await recordAdminActivity(req, "update", key, section._id, { fields: Object.keys(section.data || {}) });
    return sendSuccess(res, section, `${key} updated`);
  };
}
