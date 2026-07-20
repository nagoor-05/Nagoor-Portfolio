import dotenv from "dotenv";

dotenv.config();

const defaultMongoUri = ["mongodb:", "//127.0.0.1:27017/portfolio_builder"].join("");

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || defaultMongoUri,
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173",
  adminUrl: process.env.ADMIN_URL || "http://127.0.0.1:5174",
  extraClientUrls: (process.env.EXTRA_CLIENT_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openRouterApiKeys: [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY_2,
    ...(process.env.OPENROUTER_API_KEYS || "").split(","),
  ].filter(Boolean).map((key) => key.trim()),
  openRouterModel: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  openRouterSiteUrl: process.env.OPENROUTER_SITE_URL || process.env.CLIENT_URL || "http://127.0.0.1:5173",
  openRouterSiteName: process.env.OPENROUTER_SITE_NAME || "Nagoor Portfolio Copilot",
  openAiApiKeys: [
    process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_API_KEYS || "").split(","),
  ].filter(Boolean).map((key) => key.trim()),
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openAiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  jinaApiKey: process.env.JINA_API_KEY || "",
  voyageApiKey: process.env.VOYAGE_API_KEY || "",
  supadataApiKey: process.env.SUPADATA_API_KEY || "",
  openRouterAllowInsecureTls:
    process.env.OPENROUTER_ALLOW_INSECURE_TLS === "true" ||
    (process.env.OPENROUTER_ALLOW_INSECURE_TLS !== "false" && (process.env.NODE_ENV || "development") === "development"),
  aiMaxTokens: Number(process.env.AI_MAX_TOKENS || 850),
  aiTemperature: Number(process.env.AI_TEMPERATURE || 0.25),
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 45000),
  aiMaxQuestionLength: Number(process.env.AI_MAX_QUESTION_LENGTH || 1200),
  aiMaxHistoryItems: Number(process.env.AI_MAX_HISTORY_ITEMS || 10),
  aiChatLoggingEnabled: process.env.AI_CHAT_LOGGING_ENABLED !== "false",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  mediaStorageProvider: process.env.MEDIA_STORAGE_PROVIDER || "local",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};
