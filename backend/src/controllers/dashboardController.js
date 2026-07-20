import { PortfolioItem } from "../models/PortfolioItem.js";
import { ContentSection } from "../models/ContentSection.js";
import { AdminActivity } from "../models/AdminActivity.js";
import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { ChatLog } from "../models/ChatLog.js";
import { sendSuccess } from "../utils/response.js";

export async function dashboardOverview(req, res) {
  const ownerId = req.user._id;
  const [projects, articles, skills, pageViews, visitors, resumeDownloads, projectClicks, aiQuestions] = await Promise.all([
    PortfolioItem.countDocuments({ ownerId, type: "project" }),
    PortfolioItem.countDocuments({ ownerId, type: "article" }),
    PortfolioItem.countDocuments({ ownerId, type: "skill" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "page_view" }),
    AnalyticsEvent.distinct("visitorId", { ownerId, visitorId: { $ne: "" } }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "resume_download" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "project_click" }),
    ChatLog.countDocuments({ ownerId }),
  ]);
  return sendSuccess(res, { visitors: visitors.length, pageViews, resumeDownloads, aiUsage: aiQuestions, projectClicks, projects, articles, skills });
}

export async function contentSummary(req, res) {
  const [sections, items] = await Promise.all([
    ContentSection.find({ ownerId: req.user._id }).select("key isVisible updatedAt").sort({ key: 1 }).lean(),
    PortfolioItem.aggregate([
      { $match: { ownerId: req.user._id } },
      { $group: { _id: "$type", count: { $sum: 1 }, visible: { $sum: { $cond: ["$isVisible", 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return sendSuccess(res, { sections, items });
}

export async function recentActivity(req, res) {
  return sendSuccess(
    res,
    await AdminActivity.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean()
  );
}
