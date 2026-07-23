import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaGithub,
  FaTimes,
} from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { projects } from "../data/projectShowcase";
import { trackEvent } from "../services/analyticsService";

const filters = [
  ["all", "All"],
  ["AI/ML", "AI / ML"],
  ["Agentic AI", "Agentic AI"],
  ["Full Stack", "Full Stack"],
  ["Finance", "Finance"],
  ["Healthcare", "Healthcare"],
  ["Compiler Design", "Compiler"],
  ["Cybersecurity", "Cybersec"],
];

const statusGroups = [
  ["completed", "Completed Projects", "Finished and fully functional projects"],
  ["current", "In Progress Projects", "Active builds currently being improved"],
  ["upcoming", "Upcoming Projects", "Planned systems ready for development"],
];

const statusSummary = [
  ["completed", "Completed", "90%"],
  ["current", "In Progress", "60%"],
  ["upcoming", "Upcoming", "0%"],
];

function validUrl(value = "") {
  return /^https?:\/\/[^\s#]+$/i.test(String(value).trim());
}

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [visibleCounts, setVisibleCounts] = useState({ completed: 6, current: 3, upcoming: 2 });
  const refs = useRef({});

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((item) => item.categories.includes(filter) || item.technologies.includes(filter));
  }, [filter]);

  const openProject = (item) => {
    setSelectedProject(item);
    refs.current[item.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    trackEvent("project_analysis", { page: "projects", metadata: { projectTitle: item.title } });
  };

  return (
    <section className="shell page-pad projects-showcase-page">
      <div className="projects-dashboard-head">
        <div className="project-status-tabs">
          {statusSummary.map(([key, label, value], index) => (
            <span key={key} className={index === 0 ? "active" : ""}>
              {label} <b>{value}</b>
            </span>
          ))}
        </div>
        <div className="project-category-tabs">
          {filters.map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        className="projects-dashboard-title"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <h1>Projects</h1>
        <p>Explore my projects across AI, Full Stack, Healthcare, Finance, Compiler Design and more.</p>
      </motion.div>

      <div className="projects-dashboard-layout">
        <div className="projects-card-column">
          {statusGroups.map(([key, title, note]) => {
            const groupItems = filteredProjects.filter((item) => item.statusGroup === key);
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
                      key={item.id}
                      project={item}
                      index={index}
                      selected={selectedProject?.id === item.id}
                      onSelect={() => openProject(item)}
                      refSetter={(node) => {
                        refs.current[item.id] = node;
                      }}
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
        <ProjectAnalysis project={selectedProject} onClose={() => setSelectedProject(null)} />
      </div>
    </section>
  );
}

function ProjectCard({ project, index, selected, onSelect, refSetter }) {
  const showGithub = project.statusGroup === "completed" && validUrl(project.github);
  const showDemo = project.statusGroup === "completed" && validUrl(project.live);
  const note = project.statusNote;

  return (
    <motion.article
      ref={refSetter}
      className={`compact-project-card ${selected ? "selected" : ""} status-${project.statusGroup}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
      onClick={onSelect}
    >
      <div className="compact-project-image">
        <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
        <span className="project-badge"><FaCheck /> {project.statusLabel}</span>
        <strong>{project.progress}%</strong>
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-chip-row">
        {project.categories.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="project-chip-row tech">
        {project.technologies.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {note && <div className="project-progress-note">{note}</div>}
      <div className="compact-project-actions" onClick={(event) => event.stopPropagation()}>
        {showGithub && <a href={project.github} target="_blank" rel="noreferrer"><FaGithub /> GitHub</a>}
        {showDemo && <a href={project.live} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Demo</a>}
        <button type="button" onClick={onSelect}>Analysis</button>
      </div>
    </motion.article>
  );
}

function ProjectAnalysis({ project, onClose }) {
  if (!project) return null;
  const showGithub = project.statusGroup === "completed" && validUrl(project.github);
  const showDemo = project.statusGroup === "completed" && validUrl(project.live);

  return (
    <aside className="project-analysis-panel" aria-label={`${project.title} analysis`}>
      <button type="button" className="analysis-close" onClick={onClose} aria-label="Close analysis"><FaTimes /></button>
      <div className="analysis-top-row">
        <span className={`project-badge status-${project.statusGroup}`}><FaCheck /> {project.statusLabel}</span>
        <strong>{project.progress}%</strong>
      </div>
      <div className="analysis-intro">
        <div className="analysis-preview-frame">
          <img src={project.image} alt={`${project.title} preview`} />
        </div>
        <div>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <div className="project-chip-row">
            {project.categories.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="project-chip-row tech">
            {project.technologies.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
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
          {project.workflow.map((step, index) => (
            <span key={step}>
              <em>{step}</em>
              {index < project.workflow.length - 1 && <FaArrowRightLong />}
            </span>
          ))}
        </div>
      </div>

      <div className="analysis-bottom-grid">
        <InfoBlock title="Challenges" items={project.challenges} />
        <InfoBlock title="Limitations" items={project.limitations} />
        <InfoBlock title="My Role / Contribution" items={[project.role]} />
      </div>

      <details className="project-deep-details">
        <summary>STAR explanation</summary>
        <ul>{project.analysis.star.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
      <details className="project-deep-details">
        <summary>5W1H summary</summary>
        <ul>{project.analysis.fiveWOneH.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>

      <div className="analysis-action-row">
        {showGithub && <a href={project.github} target="_blank" rel="noreferrer">GitHub <FaExternalLinkAlt /></a>}
        {showDemo && <a href={project.live} target="_blank" rel="noreferrer">Live Demo <FaExternalLinkAlt /></a>}
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><FaArrowLeft /> Back to Projects</button>
      </div>
    </aside>
  );
}

function InfoBlock({ title, items, check = false }) {
  return (
    <div className="analysis-info-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{check && <FaCheck />}<span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
}
