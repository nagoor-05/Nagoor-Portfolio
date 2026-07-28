import axios from "axios";
import https from "node:https";
import { env } from "../config/env.js";
import { createHttpError } from "../utils/response.js";

const REST_BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";
const PLACEHOLDER_TOKENS = new Set(["", "paste-your-github-token-here", "replace-with-your-github-token"]);
const cache = new Map();
const githubHttpsAgent = env.nodeEnv === "development"
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

function hasUsableToken() {
  return !PLACEHOLDER_TOKENS.has(String(env.githubToken || "").trim().toLowerCase());
}

function cacheKey(username) {
  return `github:${username.toLowerCase()}`;
}

function getCached(username) {
  const current = cache.get(cacheKey(username));
  if (!current) return null;
  const ttlMs = Math.max(1, env.githubCacheMinutes) * 60 * 1000;
  if (Date.now() - current.createdAt > ttlMs) {
    cache.delete(cacheKey(username));
    return null;
  }
  return current.data;
}

function setCached(username, data) {
  cache.set(cacheKey(username), { createdAt: Date.now(), data });
}

function githubHeaders({ graphql = false, includeAuth = true } = {}) {
  const headers = {
    Accept: graphql ? "application/vnd.github+json" : "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "nagoor-portfolio-backend",
  };
  if (includeAuth && hasUsableToken()) headers.Authorization = `Bearer ${env.githubToken}`;
  return headers;
}

function shouldRetryPublicRequestWithoutToken(error) {
  const status = Number(error.response?.status || 0);
  return hasUsableToken() && (status === 401 || status === 403);
}

async function githubRestGet(url, options = {}) {
  try {
    return await axios.get(url, {
      ...options,
      headers: { ...githubHeaders(), ...(options.headers || {}) },
      httpsAgent: githubHttpsAgent,
    });
  } catch (error) {
    if (!shouldRetryPublicRequestWithoutToken(error)) throw error;
    return axios.get(url, {
      ...options,
      headers: { ...githubHeaders({ includeAuth: false }), ...(options.headers || {}) },
      httpsAgent: githubHttpsAgent,
    });
  }
}

function languageColor(language = "") {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572a5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    HTML: "#e34c26",
    CSS: "#563d7c",
    React: "#61dafb",
    Shell: "#89e051",
  };
  return colors[language] || "#8b5cf6";
}

function contributionLevel(count) {
  if (!count) return 0;
  if (count < 2) return 1;
  if (count < 5) return 2;
  if (count < 10) return 3;
  return 4;
}

function emptyContributionCalendar() {
  return {
    totalContributions: 0,
    cells: [],
    weeks: [],
    requiresToken: !hasUsableToken(),
    unavailable: !hasUsableToken(),
  };
}

function normalizeProfile(profile) {
  return {
    username: profile.login,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    bio: profile.bio || "",
    company: profile.company || "",
    blog: profile.blog || "",
    location: profile.location || "",
    profileUrl: profile.html_url,
    publicRepoCount: Number(profile.public_repos || 0),
    followers: Number(profile.followers || 0),
    following: Number(profile.following || 0),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function normalizeRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || "No description provided.",
    language: repo.language || "Not specified",
    languageColor: languageColor(repo.language),
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    stars: Number(repo.stargazers_count || 0),
    forks: Number(repo.forks_count || 0),
    watchers: Number(repo.watchers_count || 0),
    openIssues: Number(repo.open_issues_count || 0),
    repositoryUrl: repo.html_url,
    demoUrl: repo.homepage || "",
    homepage: repo.homepage || "",
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    fork: Boolean(repo.fork),
    archived: Boolean(repo.archived),
    private: Boolean(repo.private),
  };
}

async function fetchProfile(username) {
  const response = await githubRestGet(`${REST_BASE_URL}/users/${encodeURIComponent(username)}`, {
    timeout: 12000,
  });
  return normalizeProfile(response.data);
}

async function fetchRepositories(username) {
  const repos = [];
  let page = 1;
  while (page <= 10) {
    const response = await githubRestGet(`${REST_BASE_URL}/users/${encodeURIComponent(username)}/repos`, {
      params: { per_page: 100, page, type: "owner", sort: "updated", direction: "desc" },
      timeout: 15000,
    });
    const chunk = Array.isArray(response.data) ? response.data : [];
    repos.push(...chunk);
    if (chunk.length < 100) break;
    page += 1;
  }
  return repos.filter((repo) => !repo.private).map(normalizeRepo);
}

async function fetchContributionCalendar(username) {
  if (!hasUsableToken()) return emptyContributionCalendar();

  const currentYear = new Date().getUTCFullYear();
  const from = `${currentYear}-01-01T00:00:00Z`;
  const to = `${currentYear}-12-31T23:59:59Z`;
  const query = `
    query PortfolioGithubContributions($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    GRAPHQL_URL,
    { query, variables: { login: username, from, to } },
    { headers: githubHeaders({ graphql: true }), httpsAgent: githubHttpsAgent, timeout: 18000 }
  );

  if (response.data?.errors?.length) {
    const message = response.data.errors[0]?.message || "GitHub contribution lookup failed";
    throw createHttpError(message, 502);
  }

  const calendar = response.data?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return emptyContributionCalendar();
  const weeks = calendar.weeks || [];
  const cells = weeks.flatMap((week) =>
    (week.contributionDays || []).map((day) => ({
      date: day.date,
      count: Number(day.contributionCount || 0),
      color: day.color,
      weekday: day.weekday,
      level: contributionLevel(Number(day.contributionCount || 0)),
    }))
  );

  return {
    totalContributions: Number(calendar.totalContributions || 0),
    cells,
    weeks,
    requiresToken: false,
    unavailable: false,
  };
}

export async function getLiveGitHubProfile({ forceRefresh = false } = {}) {
  const username = env.githubUsername;
  if (!username) throw createHttpError("GITHUB_USERNAME is not configured", 500);

  if (!forceRefresh) {
    const cached = getCached(username);
    if (cached) return { ...cached, cached: true };
  }

  try {
    const [profile, repositories, contributionResult] = await Promise.all([
      fetchProfile(username),
      fetchRepositories(username),
      fetchContributionCalendar(username)
        .then((data) => ({ data, warning: "" }))
        .catch((calendarError) => ({
          data: emptyContributionCalendar(),
          warning:
            calendarError.response?.data?.message ||
            calendarError.message ||
            "GitHub contribution calendar is temporarily unavailable",
        })),
    ]);
    const contributions = contributionResult.data;

    const totals = repositories.reduce(
      (summary, repo) => ({
        stars: summary.stars + repo.stars,
        forks: summary.forks + repo.forks,
        watchers: summary.watchers + repo.watchers,
      }),
      { stars: 0, forks: 0, watchers: 0 }
    );

    const data = {
      username,
      fetchedAt: new Date().toISOString(),
      cacheMinutes: env.githubCacheMinutes,
      cached: false,
      profile,
      repositories,
      stats: {
        publicRepositories: profile.publicRepoCount,
        displayedRepositories: repositories.length,
        totalStars: totals.stars,
        totalForks: totals.forks,
        totalWatchers: totals.watchers,
        totalContributions: contributions.totalContributions,
      },
      contributions,
      warnings: contributionResult.warning ? [contributionResult.warning] : [],
    };
    setCached(username, data);
    return data;
  } catch (error) {
    const status = error.response?.status || error.status || 502;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to fetch live GitHub data";
    throw createHttpError(`GitHub integration failed: ${message}`, status >= 400 && status < 600 ? status : 502);
  }
}
