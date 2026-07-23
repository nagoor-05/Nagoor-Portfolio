import { env } from "../config/env.js";
import { PortfolioItem } from "../models/PortfolioItem.js";
import { getPortfolio } from "./portfolioService.js";
import { getCached, setCached } from "./portfolioCacheService.js";

const INTENT_FIELDS = {
  star: ["title", "star"],
  fiveWOneH: ["title", "fiveWOneH"],
  workflow: ["title", "workflow"],
  technologies: ["title", "technologies", "techStack"],
  algorithms: ["title", "algorithms", "technologies", "techStack"],
  architecture: ["title", "architecture"],
  features: ["title", "features"],
  challenges: ["title", "challenges", "limitations"],
  limitations: ["title", "limitations", "challenges"],
  roadmap: ["title", "roadmap"],
  progress: ["title", "status", "statusGroup", "statusLabel", "progress"],
  status: ["title", "status", "statusGroup", "statusLabel", "progress"],
  problem: ["title", "problem", "solution"],
  solution: ["title", "solution", "problem"],
  contribution: ["title", "contribution", "role"],
  comparison: ["title", "status", "progress", "categories", "technologies", "problem", "solution", "features", "limitations"],
  projectsList: ["title", "status", "statusGroup", "statusLabel", "progress", "shortDescription", "description"],
  projectOverview: ["title", "shortDescription", "description", "overview", "problem", "solution", "features", "workflow", "status", "progress"],
};

const ALIASES = {
  "AI Meeting-to-Execution Agent": ["Meeting Agent", "Meeting-to-Execution", "AI Meeting Agent"],
  ReconIQ: ["Reconciliation Project", "Finance Project", "Fraud Detection Project"],
  "MediClaim AI": ["MediClaim", "Medical Claim Project", "Insurance Claim AI"],
  "Premium Personal Portfolio": ["Portfolio", "Personal Website", "Nagoor Portfolio"],
  "AI Timetable Generation System": ["Timetable Generator", "Scheduling Project"],
  "Smart Symbol Table Analyzer": ["Symbol Table", "Compiler Project"],
  "PrepIQ AI": ["Placement Platform", "Exam Preparation Platform"],
  "AI House Price Prediction": ["Property Prediction", "Real Estate AI", "House Price"],
  "AI Portfolio Builder": ["Portfolio Builder", "AI Website Builder", "PortfolioAI"],
  NOVA: ["Voice Assistant", "Personal Assistant", "Nagoor Assistant"],
  "AI ATS Resume Checker": ["Resume Checker", "ATS Resume Project", "ATS Checker"],
  BreachChecker: ["Breach Checker", "BreachGuard", "Email Breach Project"],
  MindCare: ["Depression Assessment", "Mental Wellness", "Mental Health Project"],
  QuickDine: ["Restaurant Project", "Food Booking", "Restaurant AI"],
};

function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function detectIntent(question = "") {
  const q = normalize(question);
  if (/\bstar\b/.test(q)) return "star";
  if (/\b5w1h\b|5w 1h|five w|summari[sz]e/.test(q)) return "fiveWOneH";
  if (/\bworkflow\b|\bworking\b|\bsteps?\b|\bflow\b/.test(q)) return "workflow";
  if (/\btech\b|technology|tools?|stack|language|framework|library/.test(q)) return "technologies";
  if (/\balgorithm\b|csp|greedy|backtracking|model\b/.test(q)) return "algorithms";
  if (/\barchitecture\b|layer|system design/.test(q)) return "architecture";
  if (/\bfeatures?\b|capabilit/.test(q)) return "features";
  if (/\bchallenge|limitation|drawback|risk\b/.test(q)) return "challenges";
  if (/\broadmap|future|upcoming improvement\b/.test(q)) return "roadmap";
  if (/\bprogress|percentage|status\b/.test(q)) return "progress";
  if (/\bproblem\b/.test(q)) return "problem";
  if (/\bsolution\b/.test(q)) return "solution";
  if (/\brole|contribution|my work\b/.test(q)) return "contribution";
  if (/\bcompare|difference|versus| vs \b/.test(q)) return "comparison";
  if (/\bcompleted|current|in progress|upcoming|all projects|14 projects\b/.test(q)) return "projectsList";
  if (/\bskill|education|experience|achievement|contact|profile|owner|resume\b/.test(q)) return "portfolio";
  return "projectOverview";
}

function projectTerms(project) {
  const data = project.data || {};
  return unique([
    project.title,
    project.slug,
    data.id,
    data.title,
    ...(data.aliases || []),
    ...(ALIASES[project.title] || []),
  ]).map(normalize);
}

function scoreProject(question, project) {
  const q = normalize(question);
  if (!q) return 0;
  let score = 0;
  for (const term of projectTerms(project)) {
    if (!term) continue;
    if (q === term) score += 20;
    else if (q.includes(term)) score += Math.min(16, Math.max(4, term.length / 3));
  }
  const data = project.data || {};
  for (const value of [...(data.keywords || []), ...(data.categories || []), ...(data.technologies || [])]) {
    const term = normalize(value);
    if (term && q.includes(term)) score += 2;
  }
  return score;
}

function pick(data, fields) {
  const output = {};
  for (const field of fields) {
    const value = data[field];
    if (value !== undefined && value !== "" && !(Array.isArray(value) && !value.length)) output[field] = value;
  }
  return output;
}

function serializeProject(item, intent) {
  const data = item.data || {};
  const normalized = {
    title: item.title || data.title,
    slug: item.slug || data.slug || data.id,
    status: data.status || data.statusLabel,
    statusGroup: data.statusGroup,
    statusLabel: data.statusLabel,
    progress: data.progress,
    categories: data.categories,
    technologies: data.technologies,
    shortDescription: data.shortDescription || data.description,
    description: data.description,
    overview: data.overview,
    problem: data.problem,
    solution: data.solution,
    features: data.features,
    techStack: data.techStack,
    algorithms: data.algorithms,
    workflow: data.workflow,
    architecture: data.architecture,
    challenges: data.challenges,
    limitations: data.limitations,
    contribution: data.contribution || data.role,
    role: data.role,
    roadmap: data.roadmap,
    star: data.star || data.analysis?.star || data.copilotCoverage?.star,
    fiveWOneH: data.fiveWOneH || data.analysis?.fiveWOneH || data.copilotCoverage?.fiveWOneH,
    interviewAnswer: data.interviewAnswer,
    githubUrl: data.githubUrl || data.github,
    demoUrl: data.demoUrl || data.live,
  };
  return pick(normalized, INTENT_FIELDS[intent] || INTENT_FIELDS.projectOverview);
}

async function getProjectItems(ownerId) {
  const cacheKey = `projects:${ownerId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const rows = await PortfolioItem.find({ ownerId, type: "project", isVisible: { $ne: false } })
    .sort({ order: 1, title: 1 })
    .lean();
  return setCached(cacheKey, rows, 120000);
}

function inferFollowUpProject(question, history, projects) {
  const q = normalize(question);
  if (!/\bit\b|\bits\b|\bthat\b|\bthis\b|\bproject\b/.test(q)) return null;
  const recent = [...(history || [])].reverse().slice(0, env.aiMaxHistoryItems);
  for (const message of recent) {
    const content = String(message?.content || "");
    const scored = projects
      .map((project) => ({ project, score: scoreProject(content, project) }))
      .sort((a, b) => b.score - a.score);
    if (scored[0]?.score > 4) return scored[0].project;
  }
  return null;
}

function formatPortfolioSummary(portfolio) {
  return pick(portfolio || {}, ["owner", "hero", "about", "resume", "contact", "stats", "skills", "educations", "experiences", "certifications", "socialLinks"]);
}

export async function buildRelevantPortfolioContext({ owner, question, history = [] }) {
  const intent = detectIntent(question);
  const projects = await getProjectItems(owner._id);
  const scored = projects
    .map((project) => ({ project, score: scoreProject(question, project) }))
    .sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score >= 4).slice(0, intent === "comparison" ? 3 : 1).map((item) => item.project);
  const followUp = matched.length ? null : inferFollowUpProject(question, history, projects);
  const selectedProjects = matched.length ? matched : followUp ? [followUp] : [];

  let portfolioSummary = null;
  let projectContext = [];
  if (intent === "portfolio") {
    portfolioSummary = formatPortfolioSummary(await getPortfolio(owner.username, false));
  } else if (intent === "projectsList" || (!selectedProjects.length && /project|react|ocr|health|finance|backend|frontend|ai|ml|completed|upcoming|progress/i.test(question))) {
    projectContext = projects.map((project) => serializeProject(project, "projectsList"));
  } else if (selectedProjects.length) {
    projectContext = selectedProjects.map((project) => serializeProject(project, intent));
  } else {
    portfolioSummary = formatPortfolioSummary(await getPortfolio(owner.username, false));
  }

  return {
    owner: { name: owner.name, username: owner.username },
    intent,
    detectedProjects: selectedProjects.map((project) => project.title),
    context: {
      portfolio: portfolioSummary,
      projects: projectContext,
    },
    retrievalRules: {
      answerOnlyRequestedIntent: true,
      unknownFactsMessage: "I don't have that specific information in the portfolio knowledge base.",
    },
  };
}

export function getCopilotMetadata(context, providerResult, responseTimeMs) {
  return {
    intent: context.intent,
    detectedProjects: context.detectedProjects,
    provider: providerResult?.provider || providerResult?.model || "unknown",
    responseTimeMs,
  };
}
