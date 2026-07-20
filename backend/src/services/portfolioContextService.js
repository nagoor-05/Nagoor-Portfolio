import { getPortfolio } from "./portfolioService.js";

const ALLOWED_KEYS = [
  "owner",
  "hero",
  "about",
  "landing",
  "resume",
  "contact",
  "stats",
  "githubProfile",
  "projects",
  "skills",
  "certifications",
  "articles",
  "codingProfiles",
  "socialLinks",
  "educations",
  "experiences",
];

function removePrivateFields(value) {
  if (Array.isArray(value)) return value.map(removePrivateFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/password|token|secret|apiKey|private|hidden|internal/i.test(key))
      .map(([key, nested]) => [key, removePrivateFields(nested)])
  );
}

export async function buildApprovedPortfolioContext(username = "nagoor") {
  const portfolio = await getPortfolio(username, false);
  if (!portfolio) return null;
  const approved = {};
  for (const key of ALLOWED_KEYS) {
    if (portfolio[key] !== undefined) approved[key] = removePrivateFields(portfolio[key]);
  }
  return approved;
}
