import { env } from "./env.js";

export function getOpenRouterConfig() {
  const providers = [
    ...env.openRouterApiKeys.map((apiKey, index) => ({
      name: `openrouter-${index + 1}`,
      apiKey,
      model: env.openRouterModel,
      baseUrl: env.openRouterBaseUrl,
      type: "openrouter",
    })),
    ...env.geminiApiKeys.map((apiKey, index) => ({
      name: `gemini-${index + 1}`,
      apiKey,
      model: env.geminiModel,
      baseUrl: env.geminiBaseUrl,
      type: "gemini",
    })),
    ...env.openAiApiKeys.map((apiKey, index) => ({
      name: `openai-${index + 1}`,
      apiKey,
      model: env.openAiModel,
      baseUrl: env.openAiBaseUrl,
      type: "openai",
    })),
  ];

  return {
    apiKey: env.openRouterApiKey,
    providers,
    model: env.openRouterModel,
    baseUrl: env.openRouterBaseUrl,
    siteUrl: env.openRouterSiteUrl,
    siteName: env.openRouterSiteName,
    allowInsecureTls: env.openRouterAllowInsecureTls,
    providersEnabled: {
      openrouter: env.openRouterApiKeys.length > 0,
      gemini: env.geminiApiKeys.length > 0,
      openai: env.openAiApiKeys.length > 0,
    },
    maxTokens: env.aiMaxTokens,
    temperature: env.aiTemperature,
    timeoutMs: env.aiTimeoutMs,
    configured: providers.length > 0,
  };
}
