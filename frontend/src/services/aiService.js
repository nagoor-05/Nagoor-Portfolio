import { API_URL, USERNAME } from "./api";

const COPILOT_TIMEOUT_MS = 50000;
const MAX_HISTORY_ITEMS = 10;
const MAX_MESSAGE_LENGTH = 1200;

export async function askCopilot(message, history = [], conversationId = "", signal) {
  const cleanMessage = String(message || "").trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!cleanMessage) {
    const error = new Error("Please enter a question for the Portfolio Copilot.");
    error.status = 400;
    error.userMessage = "Please enter a question for the Portfolio Copilot.";
    throw error;
  }

  const payload = await requestJson(`${API_URL}/ai/chat?username=${USERNAME}`, {
    method: "POST",
    signal,
    body: JSON.stringify({
      message: cleanMessage,
      history: normalizeHistory(history),
      conversationId,
    }),
  });

  if (payload.success === false) {
    throw toCopilotError(payload.message || payload.error || "The Portfolio Copilot is temporarily unavailable.", 503);
  }

  return payload.data || payload;
}

export async function getCopilotHealth() {
  return requestJson(`${API_URL}/ai/health`, { method: "GET", timeoutMs: 12000 });
}

export async function getCopilotSuggestions() {
  const payload = await requestJson(`${API_URL}/ai/suggestions`, { method: "GET", timeoutMs: 12000 });
  return payload.suggestions || payload.data?.suggestions || [];
}

export async function sendCopilotFeedback(feedback) {
  const payload = await requestJson(`${API_URL}/ai/feedback?username=${USERNAME}`, {
    method: "POST",
    timeoutMs: 12000,
    body: JSON.stringify(feedback),
  });
  return payload.data || payload;
}

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), options.timeoutMs || COPILOT_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort(options.signal.reason);
  if (options.signal?.aborted) abortFromCaller();
  else options.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      const message = typeof body === "object" && body ? body.message || body.error : "";
      throw toCopilotError(message || `Request failed with status ${response.status}.`, response.status);
    }
    if (!contentType.includes("application/json") || !body || typeof body !== "object") {
      throw toCopilotError("The Copilot received an unexpected server response.", 502, "invalid-response");
    }
    return body;
  } catch (error) {
    if (error?.code) throw error;
    if (error?.name === "AbortError" || error?.name === "TimeoutError") {
      throw toCopilotError("The Copilot took too long to respond. Please retry.", 408, "timeout");
    }
    throw toCopilotError("Unable to connect to the Portfolio Copilot server. Please try again.", 0, "network");
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener?.("abort", abortFromCaller);
  }
}

function normalizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .slice(-MAX_HISTORY_ITEMS)
    .map(({ role, content }) => ({
      role: role === "assistant" ? "assistant" : "user",
      content: String(content || "").slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((item) => item.content.trim());
}

function toCopilotError(message, status = 500, code = "api") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.userMessage = getUserMessage(message, status, code);
  return error;
}

function getUserMessage(message, status, code) {
  if (code === "network") return "Unable to connect to the Portfolio Copilot server. Please try again.";
  if (code === "timeout" || status === 408) return "The Copilot took too long to respond. Please retry.";
  if (code === "invalid-response") return "The Copilot received an unexpected server response.";
  if (status === 400) return message || "Please enter a valid question.";
  if (status === 401 || /not configured|configuration/i.test(message)) return "The Portfolio Copilot is not fully configured on the server.";
  if (status === 429) return "Too many Copilot questions. Please wait a minute and try again.";
  if (status === 503 || /provider|temporarily unavailable/i.test(message)) return "The AI service is temporarily unavailable.";
  return "The Portfolio Copilot could not complete the request. Please try again.";
}
