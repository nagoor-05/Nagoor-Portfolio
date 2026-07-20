import { env } from "../config/env.js";
import { ChatLog } from "../models/ChatLog.js";

export async function saveChatLog({ ownerId, conversationId, question, answer, model, usage, status = "success", responseTimeMs }) {
  if (!env.aiChatLoggingEnabled) return null;
  return ChatLog.create({
    ownerId,
    sessionId: conversationId || "",
    question,
    answer,
    model,
    status,
    usage: usage || {},
    responseTimeMs,
  }).catch(() => null);
}
