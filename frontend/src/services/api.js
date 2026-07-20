const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:5001/api");
const USERNAME = import.meta.env.VITE_PORTFOLIO_USERNAME || "nagoor";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

export function getPublicPortfolio() {
  return apiRequest(`/public/portfolio/${USERNAME}`);
}

export function getArticle(slug) {
  return apiRequest(`/articles/${slug}?username=${USERNAME}`);
}

export { API_URL, USERNAME };
