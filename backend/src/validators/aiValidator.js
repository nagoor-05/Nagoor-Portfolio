export function validateAiQuestion(body) {
  const errors = [];
  const message = body?.message ?? body?.question;
  if (!message || typeof message !== "string" || !message.trim()) errors.push("message is required");
  if (message && message.length > 1200) errors.push("message must be 1200 characters or less");
  if (body.history !== undefined && !Array.isArray(body.history)) errors.push("history must be an array");
  if (body.sessionId !== undefined && typeof body.sessionId !== "string") errors.push("sessionId must be a string");
  if (body.conversationId !== undefined && typeof body.conversationId !== "string") errors.push("conversationId must be a string");
  return errors;
}
