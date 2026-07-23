import assert from "node:assert/strict";

process.env.OPENROUTER_API_KEY = "test-openrouter-primary";
process.env.OPENROUTER_API_KEY_2 = "";
process.env.OPENROUTER_API_KEYS = "test-openrouter-backup";
process.env.GEMINI_API_KEY = "test-gemini-primary";
process.env.GEMINI_API_KEY_2 = "test-gemini-backup";
process.env.GEMINI_API_KEYS = "";
process.env.OPENAI_API_KEY = "test-openai-primary";
process.env.OPENAI_API_KEYS = "";
process.env.AI_TIMEOUT_MS = "1000";

const { askOpenRouter, buildGeminiPayload } = await import("./openRouterService.js");
const { getOpenRouterConfig } = await import("../config/openRouterConfig.js");

const baseRequest = {
  system: "You are a portfolio assistant.",
  question: "hello",
  history: [{ role: "assistant", content: "Hi, ask me about Nagoor's portfolio." }],
  sessionId: "test-session",
};

function successResponse(text, providerType) {
  if (providerType === "gemini") {
    return {
      data: {
        candidates: [{ content: { parts: [{ text }] } }],
        usageMetadata: { totalTokenCount: 12 },
      },
    };
  }
  return {
    data: {
      model: "test-model",
      choices: [{ message: { content: text } }],
      usage: { total_tokens: 12 },
    },
  };
}

function axiosError(status, message = "provider failed") {
  const error = new Error(message);
  error.response = { status, data: { error: { message } } };
  return error;
}

function providerTypeFromRequest(url) {
  if (url.includes("generativelanguage.googleapis.com")) return "gemini";
  if (url.includes("api.openai.com")) return "openai";
  return "openrouter";
}

async function runTest(name, handler) {
  try {
    await handler();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

await runTest("health configuration reports OpenRouter, Gemini, and OpenAI", () => {
  const config = getOpenRouterConfig();
  assert.equal(config.configured, true);
  assert.deepEqual(config.providersEnabled, { openrouter: true, gemini: true, openai: true });
  assert.equal(config.providers.map((provider) => provider.type).join(","), "openrouter,openrouter,gemini,gemini,openai");
});

await runTest("OpenRouter succeeds without calling Gemini", async () => {
  const calls = [];
  const transport = {
    post: async (url) => {
      calls.push(providerTypeFromRequest(url));
      return successResponse("OpenRouter answer", "openrouter");
    },
  };

  const result = await askOpenRouter(baseRequest, transport);
  assert.equal(result.answer, "OpenRouter answer");
  assert.deepEqual(calls, ["openrouter"]);
});

await runTest("OpenRouter 429 falls back to Gemini", async () => {
  const calls = [];
  const transport = {
    post: async (url) => {
      const providerType = providerTypeFromRequest(url);
      calls.push(providerType);
      if (providerType === "openrouter") throw axiosError(429, "rate limit");
      return successResponse("Gemini answer", providerType);
    },
  };

  const result = await askOpenRouter(baseRequest, transport);
  assert.equal(result.answer, "Gemini answer");
  assert.deepEqual(calls, ["openrouter", "openrouter", "gemini"]);
});

await runTest("Gemini backup key is attempted after primary Gemini failure", async () => {
  const calls = [];
  const transport = {
    post: async (url) => {
      const providerType = providerTypeFromRequest(url);
      calls.push(providerType);
      if (providerType === "openrouter") throw axiosError(503, "temporary");
      if (providerType === "gemini" && calls.filter((item) => item === "gemini").length === 1) {
        throw axiosError(429, "rate limit");
      }
      return successResponse("Gemini backup answer", providerType);
    },
  };

  const result = await askOpenRouter(baseRequest, transport);
  assert.equal(result.answer, "Gemini backup answer");
  assert.deepEqual(calls, ["openrouter", "openrouter", "gemini", "gemini"]);
});

await runTest("OpenAI is attempted when OpenRouter and Gemini fail", async () => {
  const calls = [];
  const transport = {
    post: async (url) => {
      const providerType = providerTypeFromRequest(url);
      calls.push(providerType);
      if (providerType !== "openai") throw axiosError(503, "temporary");
      return successResponse("OpenAI answer", providerType);
    },
  };

  const result = await askOpenRouter(baseRequest, transport);
  assert.equal(result.answer, "OpenAI answer");
  assert.deepEqual(calls, ["openrouter", "openrouter", "gemini", "gemini", "openai"]);
});

await runTest("all providers fail with safe 503", async () => {
  const transport = {
    post: async () => {
      throw axiosError(503, "temporary");
    },
  };

  await assert.rejects(() => askOpenRouter(baseRequest, transport), {
    status: 503,
    message: "The portfolio assistant is temporarily unavailable. Please try again later.",
  });
});

await runTest("Gemini payload contains system instruction, history, and user question", () => {
  const payload = buildGeminiPayload({
    config: { temperature: 0.25, maxTokens: 850 },
    system: baseRequest.system,
    question: baseRequest.question,
    history: baseRequest.history,
  });

  assert.equal(payload.systemInstruction.parts[0].text, baseRequest.system);
  assert.equal(payload.contents[0].role, "model");
  assert.equal(payload.contents[1].role, "user");
  assert.equal(payload.generationConfig.maxOutputTokens, 850);
});
