import { AdminActivity } from "../models/AdminActivity.js";

export function recordAdminActivity(req, action, resourceType, resourceId = "", details = {}) {
  if (!req.user?._id) return Promise.resolve();
  return AdminActivity.create({
    ownerId: req.user._id,
    adminId: req.user._id,
    action,
    resourceType,
    resourceId: resourceId?.toString() || "",
    details,
  }).catch(() => {});
}
