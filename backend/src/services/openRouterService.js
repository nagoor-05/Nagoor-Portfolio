import axios from "axios";
import https from "https";
import { getOpenRouterConfig } from "../config/openRouterConfig.js";

const RETRYABLE_STATUSES = new Set([401, 402, 403, 408, 429, 500, 502, 503, 504]);

export async function askOpenRouter({ system, question, history = [], sessionId }, transport = axios) {
  const config = getOpenRouterConfig();
  if (!config.providers.length) {
    const error = new Error("AI provider is not configured");
    error.status = 503;
    throw error;
  }

  let lastError;
  const invalidModelTypes = new Set();

  for (const provider of config.providers) {
    if (invalidModelTypes.has(provider.type)) continue;

    try {
      const response = provider.type === "gemini"
        ? await callGeminiProvider({ provider, config, system, question, history, transport })
        : await callChatCompletionsProvider({ provider, config, system, question, history, sessionId, transport });

      return {
        answer: extractAnswer({ provider, data: response.data }),
        model: response.data?.model || provider.model,
        usage: provider.type === "gemini" ? response.data?.usageMetadata || {} : response.data?.usage || {},
        provider: provider.name,
      };
    } catch (requestError) {
      lastError = requestError;
      const failure = normalizeProviderError(requestError);

      if (failure.kind === "invalid_model") {
        invalidModelTypes.add(provider.type);
        console.warn(`[Copilot] ${provider.type} model configuration failed; trying the next provider.`);
        continue;
      }

      if (!failure.retryable) break;
      console.warn(`[Copilot] ${provider.type} provider attempt failed safely; trying the next configured credential.`);
    }
  }

  const status = lastError?.response?.status || lastError?.status;
  const error = new Error(
    (status === 401 ? "The portfolio assistant is not configured correctly." : "") ||
    (status === 429 ? "The portfolio assistant is receiving too many requests. Please try again shortly." : "") ||
    "The portfolio assistant is temporarily unavailable. Please try again later."
  );
  error.status = status || 503;
  throw error;
}

async function callChatCompletionsProvider({ provider, config, system, question, history, sessionId, transport }) {
  return transport.post(
    `${provider.baseUrl.replace(/\/$/, "")}/chat/completions`,
    buildChatPayload({ provider, config, system, question, history, sessionId }),
    {
      timeout: config.timeoutMs,
      httpsAgent: config.allowInsecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined,
      headers: buildHeaders({ provider, config }),
    }
  );
}

async function callGeminiProvider({ provider, config, system, question, history, transport }) {
  return transport.post(
    `${provider.baseUrl.replace(/\/$/, "")}/models/${encodeURIComponent(provider.model)}:generateContent`,
    buildGeminiPayload({ config, system, question, history }),
    {
      timeout: config.timeoutMs,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": provider.apiKey,
      },
    }
  );
}

function buildPayload({ provider, config, system, question, history, sessionId }) {
  if (provider.type === "gemini") return buildGeminiPayload({ config, system, question, history });
  return buildChatPayload({ provider, config, system, question, history, sessionId });
}

function buildChatPayload({ provider, config, system, question, history, sessionId }) {
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

export function buildGeminiPayload({ config, system, question, history }) {
  const contents = [
    ...history.map(({ role, content }) => ({
      role: role === "assistant" ? "model" : "user",
      parts: [{ text: String(content || "") }],
    })),
    { role: "user", parts: [{ text: String(question || "") }] },
  ].filter((item) => item.parts[0].text.trim());

  return {
    systemInstruction: {
      parts: [{ text: system }],
    },
    contents,
    generationConfig: {
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    },
  };
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

function extractAnswer({ provider, data }) {
  if (provider.type !== "gemini") {
    return data?.choices?.[0]?.message?.content || "I could not generate a response.";
  }

  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    const error = new Error("The AI service could not answer this request safely.");
    error.providerKind = "safety_block";
    error.status = 400;
    throw error;
  }

  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) {
    const finishReason = candidate?.finishReason || "empty";
    const error = new Error(`Gemini returned no assistant text (${finishReason}).`);
    error.providerKind = finishReason === "SAFETY" ? "safety_block" : "invalid_response";
    error.status = finishReason === "SAFETY" ? 400 : 502;
    throw error;
  }

  return text;
}

export function normalizeProviderError(error) {
  const status = error?.status || error?.response?.status || (error?.code === "ECONNABORTED" ? 408 : undefined);
  const message = [
    error?.message,
    error?.response?.data?.error?.message,
    error?.response?.data?.message,
  ].filter(Boolean).join(" ");
  const lower = message.toLowerCase();

  if (error?.providerKind === "safety_block" || lower.includes("safety")) {
    return { kind: "safety_block", status: status || 400, retryable: false };
  }
  if (lower.includes("model") && (lower.includes("not found") || lower.includes("invalid") || lower.includes("unsupported"))) {
    return { kind: "invalid_model", status: status || 400, retryable: true };
  }
  if (status === 401 || status === 403) return { kind: "invalid_key", status, retryable: true };
  if (status === 402 || lower.includes("credit") || lower.includes("quota")) return { kind: "insufficient_credits", status: status || 402, retryable: true };
  if (status === 429) return { kind: "rate_limit", status, retryable: true };
  if (status === 408 || error?.code === "ECONNABORTED") return { kind: "timeout", status: status || 408, retryable: true };
  if (!status && (error?.code || lower.includes("network"))) return { kind: "network", status: 503, retryable: true };
  if (RETRYABLE_STATUSES.has(status || 0)) return { kind: "temporary_provider_failure", status, retryable: true };
  return { kind: "application_error", status: status || 500, retryable: false };
}

export const __testables = {
  buildPayload,
  buildChatPayload,
  buildHeaders,
  extractAnswer,
};
