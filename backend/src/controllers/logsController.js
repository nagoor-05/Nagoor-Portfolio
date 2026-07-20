import { LogEntry } from "../models/LogEntry.js";
import { AdminActivity } from "../models/AdminActivity.js";
import { ChatLog } from "../models/ChatLog.js";
import { sendSuccess } from "../utils/response.js";

export const apiLogs = async (req, res) =>
  sendSuccess(res, await LogEntry.find({ ownerId: req.user._id, type: "api" }).sort({ createdAt: -1 }).limit(300).lean());
export const errorLogs = async (req, res) =>
  sendSuccess(res, await LogEntry.find({ ownerId: req.user._id, type: "error" }).sort({ createdAt: -1 }).limit(300).lean());
export const adminLogs = async (req, res) =>
  sendSuccess(res, await AdminActivity.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(300).lean());
export const aiLogs = async (req, res) =>
  sendSuccess(res, await ChatLog.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(300).lean());
