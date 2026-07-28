import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaArrowUpRightFromSquare, FaCodeFork, FaGithub, FaStar, FaUsers } from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import MagneticButton from "../components/MagneticButton";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { getLiveGitHubProfile } from "../services/api";
import { trackEvent } from "../services/analyticsService";

const EMPTY_CELLS = Array.from({ length: 364 }, () => ({ level: 0, count: 0, date: "" }));

function formatNumber(value) {
  const number = Number(value || 0);
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  return String(number);
}

function formatDate(value) {
  if (!value) return "Not listed";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function buildRepoLink(repo) {
  return repo.repositoryUrl || repo.url || "#";
}

function ActivityImage({ src, alt, className = "", fallback }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="github-widget-fallback">
        <strong>{fallback?.title || "Widget temporarily unavailable"}</strong>
        <span>{fallback?.message || "Open the live profile to view the latest activity."}</span>
        {fallback?.href && (
          <a href={fallback.href} target="_blank" rel="noreferrer">
            Open source
          </a>
        )}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function GitHubProfile() {
  const { data } = usePortfolio();
  const fallbackGithub = data.githubProfile;
  const [liveGithub, setLiveGithub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getLiveGitHubProfile()
      .then((payload) => {
        if (!active) return;
        setLiveGithub(payload);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setLiveGithub(null);
        setError(requestError.message || "Live GitHub data is temporarily unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const profile = liveGithub?.profile;
  const github = {
    eyebrow: fallbackGithub.eyebrow,
    title: fallbackGithub.title,
    username: profile?.username || fallbackGithub.username,
    profileUrl: profile?.profileUrl || fallbackGithub.profileUrl,
  };
  const repositories = liveGithub?.repositories || [];
  const contributionCells = liveGithub?.contributions?.cells?.length
    ? liveGithub.contributions.cells
    : EMPTY_CELLS;
  const contributionNote = liveGithub?.contributions?.requiresToken
    ? "Contribution calendar needs a backend GitHub token."
    : "Live GitHub contribution activity";
  const githubProfileUrl = "https://github.com/nagoor-05";

  const stats = useMemo(() => {
    const values = liveGithub?.stats || {};
    return [
      [formatNumber(values.publicRepositories), "Public Repositories", FaGithub],
      [formatNumber(values.totalStars), "Total Stars", FaStar],
      [formatNumber(values.totalForks), "Total Forks", FaCodeFork],
      [formatNumber(values.totalContributions), "Contributions", FaUsers],
    ];
  }, [liveGithub]);

  const languageSummary = useMemo(() => {
    const counts = new Map();
    repositories.forEach((repo) => {
      const language = repo.language && repo.language !== "Not specified" ? repo.language : "Unspecified";
      counts.set(language, (counts.get(language) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
  }, [repositories]);

  const topLanguage = languageSummary[0]?.language || "Live data";
  const activeDays = contributionCells.filter((cell) => Number(cell.count || 0) > 0).length;
  const productiveWindow = activeDays ? `${activeDays} active days this year` : "Activity updates live";

  const widgetSources = {
    streak: "https://streak-stats.demolab.com/?user=nagoor-05&theme=tokyonight&hide_border=true&ring=7B2FF7&fire=F107A3&currStreakLabel=00C9FF",
    graph: "https://github-readme-activity-graph.vercel.app/graph?username=nagoor-05&theme=tokyo-night&hide_border=true&bg_color=0D1117&color=00C9FF&line=7B2FF7&point=F107A3&area=true",
    snake: "https://raw.githubusercontent.com/nagoor-05/nagoor-05/output/github-contribution-grid-snake-dark.svg",
    reposLanguage: "https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=nagoor-05&theme=tokyonight",
    commitLanguage: "https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=nagoor-05&theme=tokyonight",
    productiveTime: "https://github-profile-summary-cards.vercel.app/api/cards/productive-time?username=nagoor-05&theme=tokyonight&utcOffset=5.5",
    leetcode: "https://leetcard.jacoblin.cool/Nagoor_05?theme=dark&font=Montserrat&ext=heatmap",
    quote: "https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight",
    visitors: "https://komarev.com/ghpvc/?username=nagoor-05&label=Total%20Profile%20Visitors&color=7B2FF7&style=for-the-badge",
  };

  return (
    <section className="shell page-pad github-page">
      <PageTitle
        eyebrow={github.eyebrow}
        title={github.title}
        description={
          profile?.bio ||
          "Building in public, learning in public, growing together."
        }
      />

      {loading && <div className="projects-state github-live-state">Loading live GitHub data...</div>}
      {error && <div className="projects-state warning github-live-state">{error}</div>}

      <GlassCard className="github-activity-card">
        <div className="github-activity-head">
          <FaGithub />
          <div>
            <h3>Contribution Activity</h3>
            <p>
              <strong>{formatNumber(liveGithub?.stats?.totalContributions)}</strong>{" "}
              contributions this year
            </p>
            <small>{contributionNote}</small>
          </div>
        </div>
        <div className="github-activity-body">
          <div>
            <div className="contribution-months" aria-hidden="true">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => <span key={month}>{month}</span>)}
            </div>
            <div className="contribution-grid" aria-label="GitHub contribution activity">
              {contributionCells.map((cell, index) => (
                <span
                  key={cell.date || index}
                  data-level={cell.level || 0}
                  title={cell.date ? `${cell.date}: ${cell.count} contributions` : "No contribution data"}
                />
              ))}
            </div>
            <div className="contribution-legend">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <i key={level} data-level={level} />
              ))}
              <span>More</span>
            </div>
          </div>
          <div className="github-rank">
            <FaUsers />
            <strong>{formatNumber(profile?.followers)}</strong>
            <span>followers</span>
          </div>
        </div>
      </GlassCard>

      <div className="github-stats-grid">
        {stats.map(([value, label, Icon]) => (
          <GlassCard key={label} className="github-stat-card">
            <Icon />
            <strong>{loading ? "..." : value}</strong>
            <span>{label}</span>
          </GlassCard>
        ))}
      </div>

      <div className="github-enhanced-grid">
        <GlassCard className="github-widget-card github-streak-card">
          <div className="github-widget-head">
            <FaGithub />
            <div>
              <h3>GitHub Streak</h3>
              <p>Current coding consistency</p>
            </div>
          </div>
          <ActivityImage
            src={widgetSources.streak}
            alt="GitHub streak statistics"
            className="github-widget-image"
            fallback={{ href: githubProfileUrl }}
          />
        </GlassCard>

        <GlassCard className="github-widget-card github-visitor-card">
          <div className="github-widget-head">
            <FaUsers />
            <div>
              <h3>Profile Visitors</h3>
              <p>Live public profile counter</p>
            </div>
          </div>
          <ActivityImage
            src={widgetSources.visitors}
            alt="GitHub profile visitor counter"
            className="github-visitor-badge"
            fallback={{ href: githubProfileUrl, message: "Visitor counter service is unavailable." }}
          />
        </GlassCard>
      </div>

      <GlassCard className="github-widget-card github-graph-card">
        <div className="github-widget-head">
          <FaStar />
          <div>
            <h3>GitHub Activity Graph</h3>
            <p>Repository activity and contribution momentum</p>
          </div>
        </div>
        <ActivityImage
          src={widgetSources.graph}
          alt="GitHub activity graph"
          className="github-wide-widget"
          fallback={{ href: githubProfileUrl, message: "The activity graph service is temporarily unavailable." }}
        />
      </GlassCard>

      <div className="github-summary-grid">
        <GlassCard className="github-summary-card">
          <span>Repositories Per Language</span>
          <strong>{languageSummary.length ? languageSummary.map((item) => `${item.language} ${item.count}`).join(" / ") : "Loading live languages"}</strong>
          <ActivityImage
            src={widgetSources.reposLanguage}
            alt="Repositories per language"
            className="github-summary-widget"
            fallback={{ href: githubProfileUrl }}
          />
        </GlassCard>
        <GlassCard className="github-summary-card">
          <span>Most Commit Language</span>
          <strong>{topLanguage}</strong>
          <ActivityImage
            src={widgetSources.commitLanguage}
            alt="Most commit language"
            className="github-summary-widget"
            fallback={{ href: githubProfileUrl }}
          />
        </GlassCard>
        <GlassCard className="github-summary-card">
          <span>Productive Time</span>
          <strong>{productiveWindow}</strong>
          <ActivityImage
            src={widgetSources.productiveTime}
            alt="Productive time"
            className="github-summary-widget"
            fallback={{ href: githubProfileUrl }}
          />
        </GlassCard>
      </div>

      <GlassCard className="github-widget-card github-snake-card">
        <div className="github-widget-head">
          <FaCodeFork />
          <div>
            <h3>Contribution Snake</h3>
            <p>Animated path through the contribution calendar</p>
          </div>
        </div>
        <ActivityImage
          src={widgetSources.snake}
          alt="Nagoor GitHub contribution snake animation"
          className="github-snake-widget"
          fallback={{
            title: "Snake animation is not generated yet",
            message: "The SVG was not found in the profile repository output branch.",
            href: githubProfileUrl,
          }}
        />
      </GlassCard>

      <div className="github-coding-grid">
        <GlassCard className="github-widget-card">
          <div className="github-widget-head">
            <FaStar />
            <div>
              <h3>LeetCode Statistics</h3>
              <p>Nagoor_05 coding practice profile</p>
            </div>
          </div>
          <a className="github-image-link" href="https://leetcode.com/u/Nagoor_05/" target="_blank" rel="noreferrer">
            <ActivityImage
              src={widgetSources.leetcode}
              alt="LeetCode statistics for Nagoor_05"
              className="github-leetcode-widget"
              fallback={{ href: "https://leetcode.com/u/Nagoor_05/", message: "Open LeetCode to view the latest statistics." }}
            />
          </a>
        </GlassCard>

        <GlassCard className="github-widget-card">
          <div className="github-widget-head">
            <FaGithub />
            <div>
              <h3>Developer Quote</h3>
              <p>Dynamic coding quote</p>
            </div>
          </div>
          <ActivityImage
            src={widgetSources.quote}
            alt="Dynamic developer quote"
            className="github-quote-widget"
            fallback={{ href: githubProfileUrl, message: "Quote service is temporarily unavailable." }}
          />
        </GlassCard>
      </div>

      {!loading && !repositories.length && (
        <div className="projects-state github-live-state">
          No public GitHub repositories are available from the live API right now.
        </div>
      )}

      <div className="github-repo-grid">
        {repositories.map((repo) => (
          <GlassCard key={repo.id || repo.fullName || repo.name} className="github-repo-card">
            <div className="repo-card-head">
              <h3><FaGithub /> {repo.name}</h3>
              <a href={buildRepoLink(repo)} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name}`}>
                <FaArrowUpRightFromSquare />
              </a>
            </div>
            <p>{repo.description}</p>
            {!!repo.topics?.length && (
              <div className="repo-topics">
                {repo.topics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}
              </div>
            )}
            <div className="repo-meta">
              <span><FaStar /> {repo.stars}</span>
              <span><FaCodeFork /> {repo.forks}</span>
              <span><i style={{ background: repo.languageColor }} /> {repo.language}</span>
              <span>Created {formatDate(repo.createdAt)}</span>
              <span>Updated {formatDate(repo.updatedAt)}</span>
            </div>
            <div className="repo-links">
              <a href={repo.repositoryUrl} target="_blank" rel="noreferrer">Repository</a>
              {repo.demoUrl && <a href={repo.demoUrl} target="_blank" rel="noreferrer">Demo</a>}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="github-profile-action">
        <MagneticButton
          to={githubProfileUrl}
          onClick={() => trackEvent("social_click", { page: "github", metadata: { label: "Full GitHub Profile", url: githubProfileUrl } })}
        >
          <FaGithub /> View Full GitHub Profile <FaArrowRight />
        </MagneticButton>
      </div>
    </section>
  );
}
