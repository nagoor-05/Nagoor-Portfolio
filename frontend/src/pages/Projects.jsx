import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCheck,
  FaChevronDown,
  FaExternalLinkAlt,
  FaGithub,
  FaTimes,
} from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { usePortfolio } from "../context/PortfolioContext";
import { projects as fallbackProjects } from "../data/projectShowcase";
import { trackEvent } from "../services/analyticsService";

const statusGroups = [
  ["completed", "Completed Projects", "Finished and fully functional projects"],
  ["current", "Currently Building", "Active builds currently being improved"],
  ["upcoming", "Upcoming Projects", "Planned systems ready for development"],
];

const initialVisible = { completed: 4, current: 3, upcoming: 2 };

function validUrl(value = "") {
  return /^https?:\/\/[^\s#]+$/i.test(String(value).trim());
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function normalizeStatus(project) {
  const raw = String(project.statusGroup || project.status || project.statusLabel || "").toLowerCase();
  if (raw.includes("progress") || raw.includes("current")) return "current";
  if (raw.includes("upcoming") || raw.includes("planned")) return "upcoming";
  return "completed";
}

function normalizeProject(project, index) {
  const statusGroup = normalizeStatus(project);
  const statusLabel = project.statusLabel || (statusGroup === "current" ? "In Progress" : statusGroup === "upcoming" ? "Upcoming" : "Completed");
  const analysis = project.analysis || {};
  return {
    id: project.id || project.slug || `project-${index}`,
    slug: project.slug || project.id || `project-${index}`,
    title: project.title,
    statusGroup,
    statusLabel,
    statusNote: project.statusNote || (statusGroup === "current" ? "Development in progress" : statusGroup === "upcoming" ? "Planned project" : ""),
    progress: Number(project.progress ?? String(project.progress || "0").replace("%", "")) || 0,
    description: project.shortDescription || project.description || project.overview || "",
    categories: toArray(project.categories),
    technologies: toArray(project.technologies),
    image: project.image || "/projects/personal-portfolio.png",
    imageAlt: project.imageAlt || `${project.title} preview`,
    github: project.githubUrl || project.github || "",
    live: project.demoUrl || project.live || "",
    problem: project.problem || "Problem details are available in the portfolio knowledge base.",
    solution: project.solution || "Solution details are available in the portfolio knowledge base.",
    features: toArray(project.features).slice(0, 6),
    techStack: Array.isArray(project.techStack)
      ? project.techStack
      : Object.entries(project.techStack || {}).map(([label, value]) => `${label}: ${value}`),
    workflow: toArray(project.workflow).slice(0, 5),
    challenges: toArray(project.challenges).slice(0, 4),
    limitations: toArray(project.limitations).slice(0, 4),
    role: project.contribution || project.role || "Designed the workflow, planned modules, and structured the project for portfolio-ready explanation.",
    visibleInitially: project.visibleInitially,
    displayOrder: Number(project.displayOrder || project.order || index + 1),
    analysis: {
      star: analysis.star || project.star || project.copilotCoverage?.star || [],
      fiveWOneH: analysis.fiveWOneH || project.fiveWOneH || project.copilotCoverage?.fiveWOneH || [],
    },
  };
}

export default function Projects() {
  const { data, loading, error } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState(null);
  const [visibleCounts, setVisibleCounts] = useState(initialVisible);
  const lastFocusRef = useRef(null);

  const projects = useMemo(() => {
    const source = data.projects?.length ? data.projects : fallbackProjects;
    return source.map(normalizeProject).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [data.projects]);

  const openProject = (item, trigger) => {
    lastFocusRef.current = trigger || document.activeElement;
    setSelectedProject(item);
    trackEvent("project_analysis", { page: "projects", metadata: { projectTitle: item.title, projectSlug: item.slug } });
  };

  const closeProject = () => {
    setSelectedProject(null);
    setTimeout(() => lastFocusRef.current?.focus?.(), 0);
  };

  return (
    <section className="shell page-pad projects-showcase-page">
      <motion.div
        className="projects-dashboard-title"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="pill">Project Knowledge Base</span>
        <h1>Projects</h1>
        <p>MongoDB-powered project cards with concise analysis, full images, status, progress, technologies, and safe fallback content.</p>
      </motion.div>

      {loading && <div className="projects-state">Loading project knowledge...</div>}
      {error && <div className="projects-state warning">Live MongoDB data is temporarily unavailable. Showing safe public fallback projects.</div>}
      {!projects.length && <div className="projects-state">No projects are available yet.</div>}

      <div className="projects-card-column">
        {statusGroups.map(([key, title, note]) => {
          const groupItems = projects.filter((item) => item.statusGroup === key);
          if (!groupItems.length) return null;
          const visible = groupItems.slice(0, visibleCounts[key]);
          const hidden = groupItems.length > visible.length;

          return (
            <section className="project-group-block" key={key}>
              <div className="project-group-heading">
                <h2>{title} <span>{groupItems.length}</span></h2>
                <p>{note}</p>
              </div>
              <div className="compact-project-grid">
                {visible.map((item, index) => (
                  <ProjectCard
                    key={item.slug}
                    project={item}
                    index={index}
                    onSelect={(event) => openProject(item, event.currentTarget)}
                  />
                ))}
              </div>
              {hidden && (
                <button
                  type="button"
                  className="see-more-projects"
                  onClick={() => setVisibleCounts((current) => ({ ...current, [key]: current[key] + 6 }))}
                >
                  See More {title.replace(" Projects", "")} <FaChevronDown />
                </button>
              )}
            </section>
          );
        })}
      </div>

      <ProjectAnalysisModal project={selectedProject} onClose={closeProject} />
    </section>
  );
}

function ProjectCard({ project, index, onSelect }) {
  const showGithub = project.statusGroup === "completed" && validUrl(project.github);
  const showDemo = project.statusGroup === "completed" && validUrl(project.live);

  return (
    <motion.article
      className={`compact-project-card status-${project.statusGroup}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
    >
      <button className="project-card-main" type="button" onClick={onSelect} aria-label={`Open analysis for ${project.title}`}>
        <div className="compact-project-image">
          <img src={project.image} alt={project.imageAlt} loading="lazy" />
          <span className="project-badge"><FaCheck /> {project.statusLabel}</span>
          <strong>{project.progress}%</strong>
        </div>
        <span className="project-progress-bar" role="progressbar" aria-label={`${project.title} completion ${project.progress}%`} aria-valuenow={project.progress} aria-valuemin="0" aria-valuemax="100">
          <i style={{ width: `${project.progress}%` }} />
        </span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </button>
      <div className="project-chip-row">
        {project.categories.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="project-chip-row tech">
        {project.technologies.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {project.statusNote && <div className="project-progress-note">{project.statusNote}</div>}
      <p className="project-helper-text">Click Analysis to know more about this project.</p>
      <div className="compact-project-actions">
        {showGithub && <a href={project.github} target="_blank" rel="noreferrer"><FaGithub /> GitHub</a>}
        {showDemo && <a href={project.live} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Demo</a>}
        <button type="button" onClick={onSelect}>Analysis</button>
      </div>
    </motion.article>
  );
}

function ProjectAnalysisModal({ project, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableSelector = "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";
    const focusFirst = () => dialogRef.current?.querySelector(focusableSelector)?.focus();
    const timer = setTimeout(focusFirst, 40);
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(focusableSelector) || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;
  const showGithub = project.statusGroup === "completed" && validUrl(project.github);
  const showDemo = project.statusGroup === "completed" && validUrl(project.live);
  const workflow = project.workflow.length ? project.workflow.slice(0, 5) : ["Input", "Process", "Analyze", "Validate", "Output"];

  return (
    <div className="project-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.aside
        ref={dialogRef}
        className="project-analysis-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-analysis-title"
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <button type="button" className="analysis-close" onClick={onClose} aria-label="Close analysis"><FaTimes /></button>
        <div className="analysis-top-row">
          <span className={`project-badge status-${project.statusGroup}`}><FaCheck /> {project.statusLabel}</span>
          <strong>{project.progress}%</strong>
        </div>
        <div className="analysis-intro compact">
          <h2 id="project-analysis-title">{project.title}</h2>
          <p>{project.description}</p>
          <div className="project-chip-row center">
            {project.categories.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="project-chip-row tech center">
            {project.technologies.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>

        <div className="analysis-info-grid">
          <InfoBlock title="Problem" items={[project.problem]} />
          <InfoBlock title="Solution" items={[project.solution]} />
          <InfoBlock title="Key Features" items={project.features} check />
          <InfoBlock title="Tech Stack" items={project.techStack} />
        </div>

        <div className="workflow-strip">
          <h3>Workflow</h3>
          <div>
            {workflow.map((step, index) => (
              <span key={`${step}-${index}`}>
                <em>{step}</em>
                {index < workflow.length - 1 && <FaArrowRightLong />}
              </span>
            ))}
          </div>
        </div>

        <div className="analysis-bottom-grid">
          <InfoBlock title="Challenges" items={project.challenges} />
          <InfoBlock title="Limitations" items={project.limitations} />
          <InfoBlock title="My Role / Contribution" items={[project.role]} />
        </div>

        <div className="analysis-action-row">
          {showGithub && <a href={project.github} target="_blank" rel="noreferrer">GitHub <FaExternalLinkAlt /></a>}
          {showDemo && <a href={project.live} target="_blank" rel="noreferrer">Live Demo <FaExternalLinkAlt /></a>}
          <button type="button" onClick={onClose}><FaArrowLeft /> Back to Projects</button>
        </div>
      </motion.aside>
    </div>
  );
}

function InfoBlock({ title, items, check = false }) {
  const list = toArray(items).filter(Boolean);
  return (
    <div className="analysis-info-block">
      <h3>{title}</h3>
      {list.length ? (
        <ul>
          {list.map((item) => (
            <li key={item}>{check && <FaCheck />}<span>{item}</span></li>
          ))}
        </ul>
      ) : <p>I don't have this specific detail yet.</p>}
    </div>
  );
}
