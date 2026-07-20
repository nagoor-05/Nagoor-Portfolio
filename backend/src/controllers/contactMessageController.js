import crypto from "crypto";
import { ContactMessage } from "../models/ContactMessage.js";
import { sendSuccess } from "../utils/response.js";

function hashIp(value = "") {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createMessage(req, res) {
  const { name, email, subject, message, localTime = "", honeypot = "", source = "portfolio", notificationStatus = "none" } = req.body;
  if (honeypot) return sendSuccess(res, { blocked: true }, "Message accepted");
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Name, email, subject, and message are required" });
  }
  const recent = await ContactMessage.countDocuments({
    ownerId: req.owner._id,
    email: String(email).toLowerCase(),
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (recent >= 3) return res.status(429).json({ success: false, message: "Please wait before sending another message" });
  const saved = await ContactMessage.create({
    ownerId: req.owner._id,
    name,
    email,
    subject,
    message,
    localTime,
    source,
    honeypot,
    notificationStatus,
    ipHash: hashIp(req.ip || ""),
    userAgent: req.get("user-agent") || "",
  });
  return sendSuccess(res, { id: saved._id }, "Message saved", 201);
}

export async function listMessages(req, res) {
  const { status = "", search = "" } = req.query;
  const query = { ownerId: req.user._id };
  if (status) query.status = status;
  if (search.trim()) query.$text = { $search: search.trim() };
  const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).lean();
  return sendSuccess(res, messages.map((message) => ({ id: message._id, ...message })));
}

export async function updateMessage(req, res) {
  const updates = {
    status: req.body.status,
    replyNotes: req.body.replyNotes,
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);
  const message = await ContactMessage.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    updates,
    { new: true, runValidators: true }
  );
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });
  return sendSuccess(res, { id: message._id, ...message.toObject() }, "Message updated");
}

export async function deleteMessage(req, res) {
  const message = await ContactMessage.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });
  return sendSuccess(res, { id: message._id }, "Message deleted");
}
