import { API_URL, apiRequest, USERNAME } from "./api";

const SESSION_STARTED_AT = Date.now();

function createId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function getVisitorId() {
  return getStoredId("portfolio-visitor");
}

function getStoredId(key) {
  const current = localStorage.getItem(key);
  if (current) return current;
  const value = createId();
  localStorage.setItem(key, value);
  return value;
}

function getSessionId() {
  const current = sessionStorage.getItem("portfolio-session");
  if (current) return current;
  const value = createId();
  sessionStorage.setItem("portfolio-session", value);
  return value;
}

function buildPayload(eventType, details = {}) {
  return {
    eventType,
    page: details.page || "",
    path: window.location.pathname,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    durationMs: details.durationMs || 0,
    scrollDepth: details.scrollDepth || 0,
    metadata: details.metadata || {},
  };
}

export function trackEvent(eventType, details = {}) {
  const body = buildPayload(eventType, details);
  return apiRequest(`/analytics/track?username=${USERNAME}`, {
    method: "POST",
    body: JSON.stringify(body),
  }).catch(() => null);
}

export function trackBeacon(eventType, details = {}) {
  const body = {
    ...buildPayload(eventType, details),
    durationMs: details.durationMs || Date.now() - SESSION_STARTED_AT,
  };
  const url = `${API_URL}/analytics/track?username=${USERNAME}`;
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    navigator.sendBeacon(url, blob);
    return Promise.resolve();
  }
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null);
}

export function trackSessionEnd(page, scrollDepth = 0) {
  return trackBeacon("session_end", {
    page,
    durationMs: Date.now() - SESSION_STARTED_AT,
    scrollDepth,
  });
}

export function trackScrollDepth(page, scrollDepth) {
  return trackEvent("scroll_depth", { page, scrollDepth });
}
