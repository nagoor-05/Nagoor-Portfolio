import { FaArrowRight, FaArrowUpRightFromSquare, FaCodeFork, FaGithub, FaStar, FaUsers } from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import MagneticButton from "../components/MagneticButton";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";

const contributionCells = Array.from({ length: 364 }, (_, index) => {
  const wave = Math.sin(index * 0.42) + Math.cos(index * 0.17);
  const level = Math.max(0, Math.min(4, Math.round((wave + 2) * 1.15) - (index % 11 === 0 ? 1 : 0)));
  return level;
});

export default function GitHubProfile() {
  const { data } = usePortfolio();
  const github = data.githubProfile;
  const projectRepos = (data.projects || []).slice(0, 14).map((project, index) => ({
    name: project.title,
    description: project.description || project.tagline,
    url: github.profileUrl,
    stars: 13 + index,
    forks: 4 + (index % 5),
    language: project.tags?.[0] || project.category || "Project",
    color: project.accent || ["#915eff", "#00cea8", "#33c5ff", "#ff47a7"][index % 4],
  }));

  return (
    <section className="shell page-pad github-page">
      <PageTitle eyebrow={github.eyebrow} title={github.title} description="Building in public, learning in public, growing together." />

      <GlassCard className="github-activity-card">
        <div className="github-activity-head">
          <FaGithub />
          <div>
            <h3>Contribution Activity</h3>
            <p><strong>1,246</strong> contributions this year</p>
          </div>
        </div>
        <div className="github-activity-body">
          <div>
            <div className="contribution-months" aria-hidden="true">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => <span key={month}>{month}</span>)}
            </div>
            <div className="contribution-grid" aria-label="GitHub contribution activity">
              {contributionCells.map((level, index) => (
                <span key={index} data-level={level} />
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
            <strong>Top 12%</strong>
            <span>of developers</span>
          </div>
        </div>
      </GlassCard>

      <div className="github-stats-grid">
        {[
          ["14", "Repositories", FaGithub],
          ["781", "Total Stars", FaStar],
          ["186", "Commits", FaCodeFork],
          ["1.2K", "Contributions", FaUsers],
        ].map(([value, label, Icon]) => (
          <GlassCard key={label} className="github-stat-card">
            <Icon />
            <strong>{value}</strong>
            <span>{label}</span>
          </GlassCard>
        ))}
      </div>

      <div className="github-repo-grid">
        {projectRepos.map((repo) => (
          <GlassCard key={repo.name} className="github-repo-card">
            <div className="repo-card-head">
              <h3><FaGithub /> {repo.name}</h3>
              <a href={repo.url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name}`}><FaArrowUpRightFromSquare /></a>
            </div>
            <p>{repo.description}</p>
            <div className="repo-meta">
              <span><FaStar /> {repo.stars}</span>
              <span><FaCodeFork /> {repo.forks}</span>
              <span><i style={{ background: repo.color }} /> {repo.language}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="github-profile-action">
        <MagneticButton
          to={github.profileUrl}
          onClick={() => trackEvent("social_click", { page: "github", metadata: { label: "GitHub Profile", url: github.profileUrl } })}
        >
          <FaGithub /> View GitHub Profile <FaArrowRight />
        </MagneticButton>
      </div>
    </section>
  );
}
