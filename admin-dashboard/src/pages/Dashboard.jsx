import { useEffect, useState } from "react";
import { FaArrowTrendUp, FaDownload, FaEye, FaGlobe, FaMessage, FaNewspaper, FaRocket, FaCode } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const metricIcons = {
  visitors: FaEye,
  pageViews: FaEye,
  resumeDownloads: FaDownload,
  projectClicks: FaRocket,
  aiUsage: FaMessage,
  projects: FaCode,
  articles: FaNewspaper,
  skills: FaArrowTrendUp,
};

export default function Dashboard() {
  const [overview, setOverview] = useState({});
  const [activity, setActivity] = useState([]);
  const [summary, setSummary] = useState({ sections: [], items: [] });
  const [settings, setSettings] = useState({ isPublished: true });
  const [error, setError] = useState("");
  const publicUrl = import.meta.env.VITE_PUBLIC_PORTFOLIO_URL || (import.meta.env.PROD ? "/home" : "http://127.0.0.1:5173/home");

  useEffect(() => {
    Promise.all([
      api("/dashboard/overview"),
      api("/dashboard/recent-activity"),
      api("/dashboard/content-summary"),
      api("/site-settings/admin"),
    ])
      .then(([metrics, recent, content, siteSettings]) => {
        setOverview(metrics);
        setActivity(recent);
        setSummary(content);
        setSettings(siteSettings.data || { isPublished: true });
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const completion = profileCompletion(summary);

  const togglePublished = async () => {
    const next = { ...settings, isPublished: !settings.isPublished };
    setSettings(next);
    try {
      await api("/site-settings", { method: "PUT", body: JSON.stringify({ data: next, isVisible: true }) });
    } catch (requestError) {
      setError(requestError.message);
      setSettings(settings);
    }
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Control center" title="Dashboard" description="A live view of your portfolio content and visitor activity." actions={
        <div className="page-actions">
          <a className="secondary-action" href={publicUrl} target="_blank" rel="noreferrer"><FaGlobe /> Portfolio Preview</a>
          <button className="primary-action" onClick={togglePublished}>{settings.isPublished ? "Unpublish" : "Publish"}</button>
        </div>
      } />
      {error && <div className="admin-error">{error}</div>}
      <div className="metric-grid">
        {Object.entries(overview).map(([key, value]) => {
          const Icon = metricIcons[key] || FaArrowTrendUp;
          return <article className="metric-card" key={key}><Icon /><span>{label(key)}</span><strong>{value}</strong></article>;
        })}
        <article className="metric-card"><FaArrowTrendUp /><span>Profile Completion</span><strong>{completion}%</strong></article>
      </div>
      <div className="dashboard-grid">
        <section className="admin-panel builder-flow">
          <div className="panel-heading"><div><span>Portfolio builder</span><h2>Build Workflow</h2></div></div>
          <div>
            <Link to="/content/hero">Hero</Link>
            <Link to="/content/about">About</Link>
            <Link to="/manage/projects">Projects</Link>
            <Link to="/manage/skills">Skills</Link>
            <Link to="/resume-builder">Resume</Link>
            <Link to="/blog">Blogs</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/content/site-settings">Settings</Link>
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-heading"><div><span>Content health</span><h2>Published data</h2></div></div>
          <div className="content-status">
            {summary.items?.map((item) => (
              <div key={item._id}><span>{label(item._id)}</span><strong>{item.visible}/{item.count}</strong></div>
            ))}
            {summary.sections?.map((section) => (
              <div key={section.key}><span>{label(section.key)}</span><strong>{section.isVisible ? "Live" : "Hidden"}</strong></div>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-heading"><div><span>Latest changes</span><h2>Recent activity</h2></div></div>
          <div className="activity-list">
            {activity.length ? activity.map((item) => (
              <div key={item._id}><i /><p><strong>{label(item.action)}</strong> {label(item.resourceType)}<small>{new Date(item.createdAt).toLocaleString()}</small></p></div>
            )) : <p className="empty-state">No admin activity yet.</p>}
          </div>
        </section>
      </div>
      <section className="admin-panel quick-actions">
        <div className="panel-heading"><div><span>Shortcuts</span><h2>Quick actions</h2></div></div>
        <div>
          <Link to="/manage/projects">Manage projects</Link>
          <Link to="/content/hero">Edit hero</Link>
          <Link to="/resume-builder">Update resume</Link>
          <Link to="/blog">Write blog</Link>
          <Link to="/analytics">View analytics</Link>
        </div>
      </section>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description, actions }) {
  return <header className="page-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions}</header>;
}

export function label(value = "") {
  return value.replace(/([A-Z])/g, " $1").replace(/-/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function profileCompletion(summary = {}) {
  const requiredSections = ["hero", "about", "resume", "contact", "landing"];
  const requiredItems = ["project", "skill", "article", "codingProfile", "socialLink"];
  const sectionScore = requiredSections.filter((key) => summary.sections?.some((section) => section.key === key && section.isVisible !== false)).length;
  const itemScore = requiredItems.filter((key) => summary.items?.some((item) => item._id === key && item.visible > 0)).length;
  return Math.round(((sectionScore + itemScore) / (requiredSections.length + requiredItems.length)) * 100);
}
