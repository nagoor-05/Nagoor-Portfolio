import { API_URL, USERNAME } from "./api";

export async function askCopilot(message, history = [], conversationId = "", signal) {
  const response = await fetch(`${API_URL}/ai/chat?username=${USERNAME}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ message, history, conversationId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || "The portfolio assistant is temporarily unavailable. Please try again later.");
    error.status = response.status;
    throw error;
  }
  return payload.data || payload;
}

export async function getCopilotHealth() {
  const response = await fetch(`${API_URL}/ai/health`);
  return response.json();
}

export async function getCopilotSuggestions() {
  const response = await fetch(`${API_URL}/ai/suggestions`);
  const payload = await response.json().catch(() => ({}));
  return payload.suggestions || payload.data?.suggestions || [];
}
