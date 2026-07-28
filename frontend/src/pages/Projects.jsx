import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
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
import { AnalysisListMarker, ProjectHeaderIcon, SectionIcon, WorkflowStepIcon, actionIcons } from "../components/ProjectAnalysisIcons";

const statusGroups = [
  ["completed", "Completed Projects", "Finished and fully functional projects"],
  ["current", "Currently Building", "Active builds currently being improved"],
  ["upcoming", "Upcoming Projects", "Planned systems ready for development"],
];

const initialVisible = { completed: 3, current: 3, upcoming: 2 };
const DEFAULT_LIVE_DEMO = "https://nagoor-personal-portfolio.vercel.app/projects";
const completedProjectOrder = [
  "meeting-agent",
  "youtube-learn",
  "reconiq",
  "personal-portfolio",
  "symbol-table-analyzer",
  "ai-timetable-generation",
  "sereniq",
];
const completedProjectSet = new Set(completedProjectOrder);
const completedProjectRank = new Map(completedProjectOrder.map((slug, index) => [slug, index]));
const legacyProjectSlugs = new Map([
  ["nagoor-portfolio", "personal-portfolio"],
  ["financial-reconciliation-system", "reconiq"],
  ["mini-compiler-lab", "symbol-table-analyzer"],
  ["ai-learning-notebook", "youtube-learn"],
]);

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

function projectKey(project = {}) {
  return String(project.slug || project.id || project.title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function canonicalProjectKey(project = {}) {
  const key = projectKey(project);
  return legacyProjectSlugs.get(key) || key;
}

const fallbackProjectMap = new Map(
  fallbackProjects.map((project, index) => [
    canonicalProjectKey(project),
    { ...project, displayOrder: project.displayOrder || project.order || index + 1 },
  ])
);

function mergeProjectData(project, index) {
  const rawKey = projectKey(project);
  const canonicalKey = legacyProjectSlugs.get(rawKey) || rawKey;
  const fallback = fallbackProjectMap.get(canonicalKey) || {};
  const mergedSource = legacyProjectSlugs.has(rawKey)
    ? { ...project, ...fallback }
    : { ...fallback, ...project };
  const projectProgress = Number(project.progress ?? String(project.progress || "").replace("%", ""));
  const fallbackProgress = Number(fallback.progress ?? String(fallback.progress || "").replace("%", ""));
  return {
    ...mergedSource,
    analysis: {
      ...(fallback.analysis || {}),
      ...(!legacyProjectSlugs.has(rawKey) ? (project.analysis || {}) : {}),
    },
    copilotCoverage: {
      ...(fallback.copilotCoverage || {}),
      ...(!legacyProjectSlugs.has(rawKey) ? (project.copilotCoverage || {}) : {}),
    },
    displayOrder: Number(legacyProjectSlugs.has(rawKey)
      ? fallback.displayOrder || index + 1
      : project.displayOrder || project.order || fallback.displayOrder || index + 1),
    progress: Number.isFinite(projectProgress) && projectProgress > 0
      ? projectProgress
      : Number.isFinite(fallbackProgress)
        ? fallbackProgress
        : project.progress,
  };
}

function normalizeProject(project, index) {
  const merged = mergeProjectData(project, index);
  const slug = canonicalProjectKey(merged) || canonicalProjectKey(project) || `project-${index}`;
  const statusGroup = normalizeStatus(merged);
  const statusLabel = merged.statusLabel || (statusGroup === "current" ? "In Progress" : statusGroup === "upcoming" ? "Upcoming" : "Completed");
  const analysis = merged.analysis || {};
  return {
    id: slug,
    slug,
    title: merged.title,
    statusGroup,
    statusLabel,
    statusNote: merged.statusNote || (statusGroup === "current" ? "Development in progress" : statusGroup === "upcoming" ? "Planned project" : ""),
    progress: Number(merged.progress ?? String(merged.progress || "0").replace("%", "")) || (statusGroup === "completed" ? 90 : statusGroup === "current" ? 40 : 0),
    description: merged.shortDescription || merged.description || merged.overview || "",
    categories: toArray(merged.categories),
    technologies: toArray(merged.technologies),
    image: merged.image || "/projects/personal-portfolio.png",
    imageAlt: merged.imageAlt || `${merged.title} preview`,
    github: merged.githubUrl || merged.github || "",
    live: merged.demoUrl || merged.live || (statusGroup === "completed" ? DEFAULT_LIVE_DEMO : ""),
    problem: merged.problem || "Problem details are available in the portfolio knowledge base.",
    solution: merged.solution || "Solution details are available in the portfolio knowledge base.",
    features: toArray(merged.features).slice(0, 8),
    techStack: Array.isArray(merged.techStack)
      ? merged.techStack
      : Object.entries(merged.techStack || {}).map(([label, value]) => `${label}: ${value}`),
    workflow: toArray(merged.workflow).slice(0, 5),
    challenges: toArray(merged.challenges).slice(0, 6),
    limitations: toArray(merged.limitations).slice(0, 6),
    role: merged.contribution || merged.role || "Designed the workflow, planned modules, and structured the project for portfolio-ready explanation.",
    visibleInitially: merged.visibleInitially,
    displayOrder: merged.displayOrder,
    analysis: {
      star: analysis.star || merged.star || merged.copilotCoverage?.star || [],
      fiveWOneH: analysis.fiveWOneH || merged.fiveWOneH || merged.copilotCoverage?.fiveWOneH || [],
    },
  };
}

function projectActions(project) {
  const title = project.title;
  const upcoming = { enabled: false, reason: "Coming soon", label: "Upcoming" };
  const currentlyUnavailable = { enabled: false, reason: "Currently unavailable", label: "Currently Unavailable" };
  const unavailable = { enabled: false, reason: "Unavailable", label: "Unavailable" };

  if (title === "AI Meeting-to-Execution Agent") {
    return {
      github: { enabled: true, href: "https://github.com/nagoor-05/Meeting_Converter", label: "GitHub" },
      live: upcoming,
    };
  }

  if (title === "Premium Personal Portfolio") {
    return {
      github: { enabled: true, href: "https://github.com/nagoor-05/Nagoor-Portfolio", label: "GitHub" },
      live: { enabled: true, href: "https://nagoor-portfolio-one.vercel.app/", label: "Live Demo" },
    };
  }

  if (title === "SereniQ — Mental Wellness Assessment Platform") {
    return {
      github: { enabled: true, href: "https://github.com/nagoor-05/Screening_the_Depression", label: "GitHub" },
      live: upcoming,
    };
  }

  if (project.statusGroup === "completed") {
    return { github: upcoming, live: upcoming };
  }

  if (project.statusGroup === "current") {
    return { github: currentlyUnavailable, live: currentlyUnavailable };
  }

  return { github: unavailable, live: unavailable };
}

export default function Projects() {
  const { data, loading, error } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState(null);
  const [visibleCounts, setVisibleCounts] = useState(initialVisible);
  const lastFocusRef = useRef(null);

  const projects = useMemo(() => {
    const mergedProjects = new Map();
    fallbackProjects.forEach((project, index) => {
      mergedProjects.set(canonicalProjectKey(project), normalizeProject(project, index));
    });
    (data.projects || []).forEach((project, index) => {
      const key = canonicalProjectKey(project) || `database-project-${index}`;
      mergedProjects.set(key, normalizeProject(project, index));
    });
    return [...mergedProjects.values()]
      .filter((item) => item.statusGroup !== "completed" || completedProjectSet.has(item.slug))
      .sort((a, b) => {
        if (a.statusGroup === "completed" && b.statusGroup === "completed") {
          return (completedProjectRank.get(a.slug) ?? 999) - (completedProjectRank.get(b.slug) ?? 999);
        }
        return a.displayOrder - b.displayOrder;
      });
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
          const expanded = key === "completed" && visibleCounts[key] >= groupItems.length;

          return (
            <section className="project-group-block" key={key}>
              <div className="project-group-heading">
                <h2>{title} <span>{groupItems.length}</span></h2>
                <p>{note}</p>
              </div>
              <motion.div className="compact-project-grid" layout>
                {visible.map((item, index) => (
                  <ProjectCard
                    key={item.slug}
                    project={item}
                    index={index}
                    onSelect={(event) => openProject(item, event.currentTarget)}
                  />
                ))}
              </motion.div>
              {(hidden || expanded) && (
                <button
                  type="button"
                  className="see-more-projects"
                  onClick={() => setVisibleCounts((current) => ({
                    ...current,
                    [key]: key === "completed"
                      ? (expanded ? initialVisible.completed : groupItems.length)
                      : current[key] + 6,
                  }))}
                >
                  {expanded ? "Show Less" : `See More ${title.replace(" Projects", "")}`} <FaChevronDown />
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
  const actions = projectActions(project);

  return (
    <motion.article
      className={`compact-project-card status-${project.statusGroup}`}
      layout
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
        {project.categories.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="project-chip-row tech">
        {project.technologies.slice(0, 7).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {project.statusNote && <div className="project-progress-note">{project.statusNote}</div>}
      <p className="project-helper-text">Click Analysis to know more about this project.</p>
      <div className="compact-project-actions">
        <ProjectActionButton type="github" action={actions.github} />
        <ProjectActionButton type="live" action={actions.live} />
        <button type="button" onClick={onSelect}>Analysis</button>
      </div>
    </motion.article>
  );
}

function ProjectActionButton({ type, action }) {
  const Icon = type === "github" ? FaGithub : FaExternalLinkAlt;
  const label = type === "github" ? "GitHub" : "Live Demo";
  if (action?.enabled && validUrl(action.href)) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer">
        <Icon /> {label}
      </a>
    );
  }

  return (
    <button type="button" className="disabled-project-action" disabled title={action?.reason || "Unavailable"} aria-label={`${label}: ${action?.reason || "Unavailable"}`}>
      <Icon /> {label}
    </button>
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

  if (!project || typeof document === "undefined") return null;
  const actions = projectActions(project);
  const GithubIcon = actionIcons.GitHub;
  const LiveIcon = actionIcons["Live Demo"];
  const BackIcon = actionIcons.Back;
  const workflow = project.workflow.length ? project.workflow.slice(0, 5) : ["Input", "Process", "Analyze", "Validate", "Output"];

  return createPortal(
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
          <ProjectHeaderIcon title={project.title} />
          <h2 id="project-analysis-title">{project.title}</h2>
          <p>{project.description}</p>
          <div className="project-chip-row center">
            {project.categories.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="project-chip-row tech center">
            {project.technologies.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>

        <div className="analysis-info-grid">
          <InfoBlock title="Problem" items={[project.problem]} />
          <InfoBlock title="Solution" items={[project.solution]} />
          <InfoBlock title="Key Features" items={project.features} check />
          <InfoBlock title="Tech Stack" items={project.techStack} />
        </div>

        <div className="workflow-strip">
          <h3><SectionIcon title="Workflow" /> Workflow</h3>
          <div>
            {workflow.map((step, index) => (
              <span key={`${step}-${index}`}>
                <WorkflowStepIcon index={index} />
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
          {actions.github?.enabled && validUrl(actions.github.href)
            ? <a href={actions.github.href} target="_blank" rel="noopener noreferrer"><GithubIcon size={18} /> GitHub <FaExternalLinkAlt /></a>
            : <button type="button" className="disabled-project-action" disabled title={actions.github?.reason || "Unavailable"}><GithubIcon size={18} /> GitHub</button>}
          {actions.live?.enabled && validUrl(actions.live.href)
            ? <a href={actions.live.href} target="_blank" rel="noopener noreferrer">Live Demo <LiveIcon size={18} /></a>
            : <button type="button" className="disabled-project-action" disabled title={actions.live?.reason || "Unavailable"}>Live Demo <LiveIcon size={18} /></button>}
          <button type="button" onClick={onClose}><BackIcon size={18} /> Back to Projects</button>
        </div>
      </motion.aside>
    </div>,
    document.body
  );
}

function InfoBlock({ title, items, check = false }) {
  const list = toArray(items).filter(Boolean);
  return (
    <div className="analysis-info-block">
      <h3><SectionIcon title={title} /> {title}</h3>
      {list.length ? (
        <ul>
          {list.map((item) => (
            <li key={item}>{check ? <FaCheck /> : <AnalysisListMarker title={title} />}<span>{item}</span></li>
          ))}
        </ul>
      ) : <p>I don't have this specific detail yet.</p>}
    </div>
  );
}
