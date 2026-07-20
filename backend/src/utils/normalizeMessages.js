import { env } from "../config/env.js";
import { redactSecrets } from "./redactSecrets.js";

const SAFE_ROLES = new Set(["user", "assistant"]);

export function sanitizeText(value = "", maxLength = env.aiMaxQuestionLength) {
  return redactSecrets(String(value))
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeAiRequest(body = {}) {
  const message = sanitizeText(body.message ?? body.question ?? "");
  const conversationId = sanitizeText(body.conversationId ?? body.sessionId ?? "", 120);
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory
    .filter((item) => item && SAFE_ROLES.has(item.role) && typeof item.content === "string")
    .slice(-env.aiMaxHistoryItems)
    .map((item) => ({
      role: item.role,
      content: sanitizeText(item.content, 1400),
    }))
    .filter((item) => item.content);

  return { message, conversationId, history };
}
