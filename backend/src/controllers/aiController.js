import { ChatLog } from "../models/ChatLog.js";
import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { askOpenRouter } from "../services/openRouterService.js";
import { buildPortfolioCopilotPrompt } from "../prompts/portfolioCopilotPrompt.js";
import { buildRelevantPortfolioContext, getCopilotMetadata } from "../services/copilotKnowledgeService.js";
import { getOpenRouterConfig } from "../config/openRouterConfig.js";
import { saveChatLog } from "../services/chatLogService.js";
import { getPreflightAnswer, guardAiAnswer } from "../services/responseGuardService.js";
import { createHttpError, sendSuccess } from "../utils/response.js";

async function runAi(req, instruction = "") {
  const startedAt = Date.now();
  const { message, history = [], conversationId = "" } = req.ai || {};
  if (!message) throw createHttpError("Please enter a question for the portfolio assistant.");
  const preflightAnswer = getPreflightAnswer(message);
  if (preflightAnswer) {
    return {
      answer: preflightAnswer,
      conversationId,
      model: "policy-guard",
      timestamp: new Date().toISOString(),
    };
  }

  const portfolio = await buildRelevantPortfolioContext({ owner: req.owner, question: message, history });
  const system = buildPortfolioCopilotPrompt(portfolio, instruction);
  try {
    const result = await askOpenRouter({ system, question: message, history, sessionId: conversationId });
    const answer = guardAiAnswer(result.answer);
    const responseTimeMs = Date.now() - startedAt;
    const metadata = getCopilotMetadata(portfolio, result, responseTimeMs);
    await Promise.all([
      saveChatLog({
        ownerId: req.owner._id,
        conversationId,
        question: message,
        answer,
        model: result.model,
        usage: result.usage,
        responseTimeMs,
      }),
      AnalyticsEvent.create({ ownerId: req.owner._id, eventType: "ai_question", page: "ai-copilot", sessionId: conversationId, metadata }),
    ]);
    return {
      answer,
      conversationId,
      model: result.model,
      provider: result.provider,
      intent: portfolio.intent,
      detectedProjects: portfolio.detectedProjects,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    await saveChatLog({
      ownerId: req.owner._id,
      conversationId,
      question: message,
      answer: error.message,
      model: "unavailable",
      status: "error",
      responseTimeMs: Date.now() - startedAt,
    });
    throw error;
  }
}

export async function chat(req, res) {
  const result = await runAi(req, "Keep answers concise, welcoming, recruiter-friendly, and factual.");
  return res.json({ success: true, ...result });
}

export async function projectSummary(req, res) {
  return sendSuccess(res, await runAi(req, "Focus on the strongest relevant projects, technologies, links, and demonstrated problem-solving."));
}

export async function recruiterSummary(req, res) {
  return sendSuccess(res, await runAi(req, "Respond as a factual recruiter briefing: strengths, current level, evidence, and suitable opportunities."));
}

export async function aiLogs(req, res) {
  const logs = await ChatLog.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(200).lean();
  return sendSuccess(res, logs);
}

export async function aiFeedback(req, res) {
  const { helpful, question = "", answer = "", intent = "", detectedProjects = [], responseTimeMs = 0 } = req.body || {};
  if (typeof helpful !== "boolean") throw createHttpError("helpful must be true or false", 400);
  const event = await AnalyticsEvent.create({
    ownerId: req.owner._id,
    eventType: helpful ? "ai_feedback_helpful" : "ai_feedback_not_helpful",
    page: "ai-copilot",
    sessionId: req.body?.conversationId || "",
    metadata: {
      helpful,
      question: String(question).slice(0, 240),
      answerPreview: String(answer).slice(0, 240),
      intent,
      detectedProjects: Array.isArray(detectedProjects) ? detectedProjects.slice(0, 3) : [],
      responseTimeMs: Math.max(0, Number(responseTimeMs) || 0),
    },
  });
  return sendSuccess(res, { id: event._id }, "Feedback saved", 201);
}

export async function aiHealth(req, res) {
  const config = getOpenRouterConfig();
  return res.json({
    success: true,
    configured: config.configured,
    primaryProvider: config.providers[0]?.type || null,
    primaryModel: config.providers[0]?.model || config.model,
    providers: config.providersEnabled,
    model: config.model,
    timestamp: new Date().toISOString(),
  });
}

export async function aiSuggestions(req, res) {
  return res.json({
    success: true,
    suggestions: [
      "Who is the portfolio owner?",
      "What are the 14 portfolio projects?",
      "What technologies does he know?",
      "Explain PortfolioAI.",
      "Explain BreachGuard AI.",
      "Explain the Smart Symbol Table project.",
      "Explain the House Price Prediction project.",
      "Explain any project using STAR.",
      "Explain any project using 5W1H.",
      "What is his current focus?",
      "What is his education?",
      "How can I contact him?",
      "Give me a recruiter-friendly summary.",
    ],
  });
}

export async function aiAnalytics(req, res) {
  const ownerId = req.user._id;
  const [intents, projects, providers, helpful, notHelpful, failed] = await Promise.all([
    AnalyticsEvent.aggregate([
      { $match: { ownerId, eventType: "ai_question" } },
      { $group: { _id: "$metadata.intent", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { ownerId, eventType: "ai_question", "metadata.detectedProjects.0": { $exists: true } } },
      { $unwind: "$metadata.detectedProjects" },
      { $group: { _id: "$metadata.detectedProjects", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEvent.aggregate([
      { $match: { ownerId, eventType: "ai_question" } },
      { $group: { _id: "$metadata.provider", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "ai_feedback_helpful" }),
    AnalyticsEvent.countDocuments({ ownerId, eventType: "ai_feedback_not_helpful" }),
    ChatLog.countDocuments({ ownerId, status: "error" }),
  ]);
  const totalFeedback = helpful + notHelpful;
  return sendSuccess(res, {
    intents,
    projects,
    providers,
    failedSearches: failed,
    helpful,
    notHelpful,
    helpfulPercentage: totalFeedback ? Math.round((helpful / totalFeedback) * 100) : 0,
    notHelpfulPercentage: totalFeedback ? Math.round((notHelpful / totalFeedback) * 100) : 0,
  });
}

export async function deleteAiLog(req, res) {
  const deleted = await ChatLog.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
  if (!deleted) throw createHttpError("AI log not found", 404);
  return sendSuccess(res, { id: req.params.id }, "AI log deleted");
}
