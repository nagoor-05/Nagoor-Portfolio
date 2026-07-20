import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaTag } from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { getArticle } from "../services/api";
import { trackEvent } from "../services/analyticsService";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { data } = usePortfolio();
  const localArticle = useMemo(
    () => data.articles.find((item) => item.slug === slug),
    [data.articles, slug]
  );
  const [remoteArticle, setRemoteArticle] = useState(localArticle || null);
  const [status, setStatus] = useState("ready");

  useEffect(() => {
    let active = true;
    setRemoteArticle(localArticle || null);
    setStatus(localArticle ? "ready" : "loading");
    getArticle(slug)
      .then((article) => {
        if (active) {
          setRemoteArticle(article);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus(localArticle ? "ready" : "missing");
      });
    return () => {
      active = false;
    };
  }, [localArticle, slug]);

  useEffect(() => {
    if (remoteArticle?.title) {
      trackEvent("blog_view", {
        page: "article-detail",
        metadata: { title: remoteArticle.title, slug },
      });
    }
  }, [remoteArticle?.title, slug]);

  if (status === "loading") {
    return (
      <section className="shell page-pad">
        <PageTitle title="Article" eyebrow="Loading" />
      </section>
    );
  }

  if (!remoteArticle) {
    return (
      <section className="shell page-pad">
        <PageTitle title="Article Not Found" eyebrow="Articles" />
        <Link className="read-more" to="/articles">
          <FaArrowLeft /> Back to Articles
        </Link>
      </section>
    );
  }

  const article = remoteArticle;
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const content = article.content || article.description;

  return (
    <section className="shell page-pad article-detail-page">
      <Link className="read-more back-link" to="/articles">
        <FaArrowLeft /> Back to Articles
      </Link>
      <PageTitle title={article.title} eyebrow={article.category || "Featured Article"} />

      <GlassCard className="article-detail-card">
        {article.coverImage && (
          <img className="article-cover" src={article.coverImage} alt={article.title} />
        )}
        <div className="article-meta-row">
          {article.readTime && (
            <span>
              <FaClock /> {article.readTime}
            </span>
          )}
          {article.featured && <span>Featured</span>}
          {article.category && (
            <span>
              <FaTag /> {article.category}
            </span>
          )}
        </div>
        <div className="article-body">
          {String(content || "")
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
        {tags.length > 0 && (
          <div className="tag-row">
            {tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </GlassCard>
    </section>
  );
}
