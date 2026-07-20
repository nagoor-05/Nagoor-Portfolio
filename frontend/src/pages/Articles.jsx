import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";

export default function Articles() {
  const { data } = usePortfolio();
  const { articles, codingProfiles } = data;
  return (
    <section className="shell page-pad">
      <PageTitle title="Articles & Coding Profiles" />
      <h2 className="section-heading left">Featured Articles</h2>
      <div className="article-grid">
        {articles.map((article) => (
          <GlassCard key={article.slug || article.title} className="article-card">
            {article.coverImage && <img className="article-card-cover" src={article.coverImage} alt={article.title} />}
            <div className="article-meta-row">
              <span>{article.category || "Article"}</span>
              {article.readTime && <span>{article.readTime}</span>}
              {article.featured && <span>Featured</span>}
            </div>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <div className="tag-row">
              {(article.tags || []).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
            <Link className="read-more" to={`/articles/${article.slug || ""}`} onClick={() => trackEvent("blog_view", { page: "articles", metadata: { title: article.title, slug: article.slug } })}>
              Read More <FaArrowRight />
            </Link>
          </GlassCard>
        ))}
      </div>
      <h2 className="section-heading left">Coding Profiles</h2>
      <div className="profile-grid">
        {codingProfiles.map(({ name, title, handle, url, icon: Icon, stats = {}, badges = [], achievements = [], skillMapping = [] }) => (
          <GlassCard key={name || title} className="coding-card">
            <Icon className="card-icon" />
            <h3>{name || title}</h3>
            <p>{handle}</p>
            {Object.keys(stats || {}).length > 0 && (
              <div className="profile-stats">
                {Object.entries(stats).slice(0, 3).map(([label, value]) => (
                  <span key={label}>
                    <strong>{value}</strong>
                    {label}
                  </span>
                ))}
              </div>
            )}
            {badges.length > 0 && (
              <div className="mini-chip-row">
                {badges.slice(0, 3).map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            )}
            {achievements.length > 0 && <p className="profile-note">{achievements[0]}</p>}
            {skillMapping.length > 0 && (
              <div className="tag-row compact-tags">
                {skillMapping.slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            )}
            <a href={url} target="_blank" rel="noreferrer" onClick={() => trackEvent("social_click", { page: "articles", metadata: { label: name, url, type: "coding_profile" } })}>
              View Profile <FaArrowRight />
            </a>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
