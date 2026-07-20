import axios from "axios";
import https from "https";
import { getOpenRouterConfig } from "../config/openRouterConfig.js";

export async function askOpenRouter({ system, question, history = [], sessionId }) {
  const config = getOpenRouterConfig();
  if (!config.providers.length) {
    const error = new Error("AI provider is not configured");
    error.status = 503;
    throw error;
  }

  let lastError;

  for (const provider of config.providers) {
    try {
      const response = await axios.post(
        `${provider.baseUrl.replace(/\/$/, "")}/chat/completions`,
        buildPayload({ provider, config, system, question, history, sessionId }),
        {
          timeout: config.timeoutMs,
          httpsAgent: config.allowInsecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined,
          headers: buildHeaders({ provider, config }),
        }
      );

      return {
        answer: response.data?.choices?.[0]?.message?.content || "I could not generate a response.",
        model: response.data?.model || provider.model,
        usage: response.data?.usage || {},
        provider: provider.name,
      };
    } catch (requestError) {
      lastError = requestError;
      const status = requestError.response?.status;
      if (![401, 402, 408, 429, 500, 502, 503, 504].includes(status || 503)) break;
    }
  }

  const status = lastError?.response?.status;
  const error = new Error(
    (status === 401 ? "The portfolio assistant is not configured correctly." : "") ||
    (status === 429 ? "The portfolio assistant is receiving too many requests. Please try again shortly." : "") ||
    "The portfolio assistant is temporarily unavailable. Please try again later."
  );
  error.status = status || 503;
  throw error;
}

function buildPayload({ provider, config, system, question, history, sessionId }) {
  const payload = {
    model: provider.model,
    messages: [
      { role: "system", content: system },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: "user", content: question },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
  };

  if (provider.type === "openrouter" && sessionId) payload.session_id = sessionId;
  return payload;
}

function buildHeaders({ provider, config }) {
  const headers = {
    Authorization: `Bearer ${provider.apiKey}`,
    "Content-Type": "application/json",
  };

  if (provider.type === "openrouter") {
    headers["HTTP-Referer"] = config.siteUrl;
    headers["X-Title"] = config.siteName;
  }

  return headers;
}
