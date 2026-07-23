import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { PortfolioSetting } from "../models/PortfolioSetting.js";
import { getClientInfo } from "../utils/clientInfo.js";
import { sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";

export async function track(req, res) {
  const {
    eventType,
    page = "",
    path = "",
    sessionId = "",
    visitorId = "",
    durationMs = 0,
    scrollDepth = 0,
    metadata = {},
  } = req.body;
  if (!eventType) return res.status(400).json({ success: false, message: "eventType is required" });
  const client = getClientInfo(req);
  const event = await AnalyticsEvent.create({
    ownerId: req.owner._id,
    eventType,
    page,
    path,
    sessionId,
    visitorId,
    durationMs: Math.max(0, Number(durationMs) || Number(metadata.durationMs) || 0),
    scrollDepth: Math.min(100, Math.max(0, Number(scrollDepth) || Number(metadata.scrollDepth) || 0)),
    referrer: req.get("referer") || "",
    metadata,
    ...client,
  });
  return sendSuccess(res, { id: event._id }, "Event tracked", 201);
}

export async function getViews(req, res) {
  const setting = await PortfolioSetting.findOne({ ownerId: req.owner._id, key: "portfolioViews" }).lean();
  return sendSuccess(res, { views: Number(setting?.value?.count || 501) });
}

export async function recordView(req, res) {
  const visitorId = String(req.body?.visitorId || "").slice(0, 120);
  if (!visitorId) return res.status(400).json({ success: false, message: "visitorId is required" });
  const cooldownHours = Number(process.env.VIEW_COUNT_COOLDOWN_HOURS || env.viewCountCooldownHours || 24);
  const since = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);
  const recent = await AnalyticsEvent.findOne({
    ownerId: req.owner._id,
    eventType: "portfolio_view",
    visitorId,
    createdAt: { $gte: since },
  }).lean();
  if (!recent) {
    await AnalyticsEvent.create({
      ownerId: req.owner._id,
      eventType: "portfolio_view",
      page: "home",
      visitorId,
      sessionId: String(req.body?.sessionId || ""),
      metadata: { counted: true },
      ...getClientInfo(req),
    });
    await PortfolioSetting.findOneAndUpdate(
      { ownerId: req.owner._id, key: "portfolioViews" },
      { $setOnInsert: { value: { base: 501, count: 501 } } },
      { upsert: true, new: true }
    );
    await PortfolioSetting.findOneAndUpdate(
      { ownerId: req.owner._id, key: "portfolioViews" },
      { $inc: { "value.count": 1 } },
      { new: true }
    );
  }
  const setting = await PortfolioSetting.findOne({ ownerId: req.owner._id, key: "portfolioViews" }).lean();
  return sendSuccess(res, { views: Number(setting?.value?.count || 501), counted: !recent });
}

async function groupBy(ownerId, field, match = {}) {
  return AnalyticsEvent.aggregate([
    { $match: { ownerId, ...match } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
}

function rangeMatch(req) {
  const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
  return { createdAt: { $gte: new Date(Date.now() - days * 86400000) } };
}

async function sessionStats(ownerId, match = {}) {
  const sessions = await AnalyticsEvent.aggregate([
    { $match: { ownerId, sessionId: { $ne: "" }, ...match } },
    {
      $group: {
        _id: "$sessionId",
        firstSeen: { $min: "$createdAt" },
        lastSeen: { $max: "$createdAt" },
        pageViews: { $sum: { $cond: [{ $eq: ["$eventType", "page_view"] }, 1, 0] } },
        durationMs: { $max: "$durationMs" },
      },
    },
    {
      $project: {
        pageViews: 1,
        durationMs: {
          $max: [
            "$durationMs",
            { $subtract: ["$lastSeen", "$firstSeen"] },
          ],
        },
      },
    },
  ]);
  const total = sessions.length;
  const bounces = sessions.filter((session) => session.pageViews <= 1).length;
  const totalDuration = sessions.reduce((sum, session) => sum + (session.durationMs || 0), 0);
  return {
    sessions: total,
    bounces,
    bounceRate: total ? Math.round((bounces / total) * 100) : 0,
    avgSessionDuration: total ? Math.round(totalDuration / total / 1000) : 0,
  };
}

export async function overview(req, res) {
  const ownerId = req.user._id;
  const [pageViews, resumeDownloads, projectClicks, contactClicks, socialClicks, blogViews, aiUsage, visitors, returningVisitors, scrollRows, sessions] = await Promise.all([
    AnalyticsEvent.countDocuments({ ownerId, eventType: "page_view" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "resume_download" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "project_click" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "contact_click" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "social_click" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "blog_view" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "ai_question" }),
    AnalyticsEvent.distinct("visitorId", { ownerId, visitorId: { $ne: "" } }),
    AnalyticsEvent.aggregate([
      { $match: { ownerId, visitorId: { $ne: "" } } },
      { $group: { _id: "$visitorId", sessions: { $addToSet: "$sessionId" } } },
      { $match: { "sessions.1": { $exists: true } } },
      { $count: "count" },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { ownerId, eventType: "scroll_depth", scrollDepth: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$scrollDepth" }, max: { $max: "$scrollDepth" } } },
    ]),
    sessionStats(ownerId),
  ]);
  return sendSuccess(res, {
    visitors: visitors.length,
    uniqueVisitors: visitors.length,
    returningVisitors: returningVisitors[0]?.count || 0,
    pageViews,
    sessions: sessions.sessions,
    avgSessionDuration: sessions.avgSessionDuration,
    bounceRate: sessions.bounceRate,
    avgScrollDepth: Math.round(scrollRows[0]?.avg || 0),
    resumeDownloads,
    projectClicks,
    contactClicks,
    socialClicks,
    blogViews,
    aiUsage,
  });
}

export async function traffic(req, res) {
  const days = Math.min(Number(req.query.days || 30), 365);
  const since = new Date(Date.now() - days * 86400000);
  const rows = await AnalyticsEvent.aggregate([
    { $match: { ownerId: req.user._id, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        events: { $sum: 1 },
        pageViews: { $sum: { $cond: [{ $eq: ["$eventType", "page_view"] }, 1, 0] } },
        visitorIds: { $addToSet: "$visitorId" },
      },
    },
    {
      $project: {
        events: 1,
        pageViews: 1,
        visitors: { $size: { $setDifference: ["$visitorIds", [""]] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return sendSuccess(res, rows.map((row) => ({ date: row._id, events: row.events, pageViews: row.pageViews, visitors: row.visitors })));
}

async function periodTraffic(ownerId, format, days) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await AnalyticsEvent.aggregate([
    { $match: { ownerId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format, date: "$createdAt" } },
        events: { $sum: 1 },
        pageViews: { $sum: { $cond: [{ $eq: ["$eventType", "page_view"] }, 1, 0] } },
        visitorIds: { $addToSet: "$visitorId" },
      },
    },
    { $project: { events: 1, pageViews: 1, visitors: { $size: { $setDifference: ["$visitorIds", [""]] } } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((row) => ({ period: row._id, events: row.events, pageViews: row.pageViews, visitors: row.visitors }));
}

export async function dailyTraffic(req, res) {
  return sendSuccess(res, await periodTraffic(req.user._id, "%Y-%m-%d", Math.min(Number(req.query.days || 30), 365)));
}

export async function weeklyTraffic(req, res) {
  return sendSuccess(res, await periodTraffic(req.user._id, "%Y-W%V", Math.min(Number(req.query.days || 90), 365)));
}

export async function monthlyTraffic(req, res) {
  return sendSuccess(res, await periodTraffic(req.user._id, "%Y-%m", Math.min(Number(req.query.days || 365), 730)));
}

export const pages = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "page", { eventType: "page_view" }));
export const devices = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "device"));
export const browsers = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "browser"));
export const countries = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "country"));
export const cities = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "city"));
export const referrers = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "referrer", { referrer: { $ne: "" } }));
export const scrollDepth = async (req, res) => sendSuccess(res, await groupBy(req.user._id, "page", { eventType: "scroll_depth" }));

export async function projects(req, res) {
  const rows = await AnalyticsEvent.aggregate([
    { $match: { ownerId: req.user._id, eventType: "project_click" } },
    { $group: { _id: "$metadata.projectTitle", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return sendSuccess(res, rows);
}

export async function resume(req, res) {
  return sendSuccess(res, {
    downloads: await AnalyticsEvent.countDocuments({ ownerId: req.user._id, eventType: "resume_download" }),
  });
}

export async function realtime(req, res) {
  const since = new Date(Date.now() - 5 * 60 * 1000);
  const sessions = await AnalyticsEvent.distinct("sessionId", {
    ownerId: req.user._id,
    sessionId: { $ne: "" },
    createdAt: { $gte: since },
  });
  return sendSuccess(res, { activeSessions: sessions.length });
}

export async function engagement(req, res) {
  const match = rangeMatch(req);
  const [sessions, scrollRows] = await Promise.all([
    sessionStats(req.user._id, match),
    AnalyticsEvent.aggregate([
      { $match: { ownerId: req.user._id, eventType: "scroll_depth", ...match } },
      { $group: { _id: "$page", avgScrollDepth: { $avg: "$scrollDepth" }, maxScrollDepth: { $max: "$scrollDepth" }, samples: { $sum: 1 } } },
      { $sort: { avgScrollDepth: -1 } },
    ]),
  ]);
  return sendSuccess(res, {
    ...sessions,
    scrollDepth: scrollRows.map((row) => ({
      page: row._id || "unknown",
      avgScrollDepth: Math.round(row.avgScrollDepth || 0),
      maxScrollDepth: Math.round(row.maxScrollDepth || 0),
      samples: row.samples,
    })),
  });
}
