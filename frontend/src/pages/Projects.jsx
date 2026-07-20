import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaCodeBranch,
  FaExternalLinkAlt,
  FaGithub,
  FaLayerGroup,
  FaLightbulb,
  FaProjectDiagram,
  FaRocket,
  FaShieldAlt,
  FaStar,
  FaSyncAlt,
  FaTasks,
} from "react-icons/fa";
import { usePortfolio } from "../context/PortfolioContext";
import { projects as showcaseProjects } from "../data/projectShowcase";
import { trackEvent } from "../services/analyticsService";

const filters = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "In Progress", value: "current" },
  { label: "Upcoming", value: "upcoming" },
  { label: "AI / ML", value: "AI/ML" },
  { label: "Compiler", value: "Compiler Design" },
  { label: "Agentic", value: "Agentic AI" },
  { label: "Healthcare", value: "Healthcare AI" },
  { label: "Full Stack", value: "Full Stack" },
  { label: "Cybersecurity", value: "Cybersecurity" },
];

const groups = [
  {
    key: "completed",
    label: "Completed (Live)",
    note: "Finished builds, practical prototypes, and portfolio-ready systems.",
  },
  {
    key: "current",
    label: "Current (In Progress)",
    note: "Active products being designed, refined, and expanded.",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    note: "Future AI products and platform ideas planned for development.",
  },
];

const tabLabels = [
  ["overview", "Overview"],
  ["features", "Features"],
  ["technology", "Technology"],
  ["algorithms", "Algorithms"],
  ["workflow", "Workflow"],
  ["architecture", "Architecture"],
  ["challenges", "Challenges"],
  ["roadmap", "Roadmap"],
];

const analysisBlocks = [
  ["fiveWOneH", "5W1H", FaChartLine],
  ["star", "STAR", FaStar],
];

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const { data } = usePortfolio();
  const projects = data.projects?.length >= showcaseProjects.length ? data.projects : showcaseProjects;

  const filteredProjects = useMemo(
    () => projects.filter((project) => matchesFilter(project, filter)),
    [projects, filter]
  );

  const scrollToProject = (projectId) => {
    document.getElementById(`project-${projectId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="shell page-pad projects-showcase-page">
      <ProjectsHero projects={projects} onSelect={scrollToProject} />

      <motion.div
        className="showcase-filter-row"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {filters.map((item) => (
          <button
            key={item.value}
            className={filter === item.value ? "active" : ""}
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      <div className="project-section-stack">
        {groups.map((group) => {
          const groupProjects = filteredProjects.filter((project) => project.statusGroup === group.key);
          if (!groupProjects.length) return null;

          return (
            <motion.section
              className="project-showcase-section"
              key={group.key}
              initial={{ opacity: 0, y: 42 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <div className="project-section-heading">
                <span>{group.label}</span>
                <p>{group.note}</p>
              </div>
              <div className="showcase-card-list">
                {groupProjects.map((project, index) => (
                  <ProjectShowcaseCard key={project.id || project.title} project={project} index={index} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </section>
  );
}

function ProjectsHero({ projects, onSelect }) {
  const title = "Projects Showcase";
  const previewProjects = projects.slice(0, 14);
  const heroRef = useRef(null);
  const [scrollShift, setScrollShift] = useState(0);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const dragRef = useRef({ active: false, startX: 0, lastX: 0, moved: false });
  const spacing = 184;
  const loopSize = previewProjects.length * spacing;

  useEffect(() => {
    const updateScrollShift = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const total = rect.height + viewport;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / total));
      setScrollShift(progress * (loopSize + 420));
    };
    updateScrollShift();
    window.addEventListener("scroll", updateScrollShift, { passive: true });
    window.addEventListener("resize", updateScrollShift);
    return () => {
      window.removeEventListener("scroll", updateScrollShift);
      window.removeEventListener("resize", updateScrollShift);
    };
  }, [loopSize]);

  const rotateOrbit = (delta) => {
    setOrbitRotation((value) => value + delta);
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      active: true,
      startX: event.clientX,
      lastX: event.clientX,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const deltaX = event.clientX - drag.lastX;
    if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true;
    drag.lastX = event.clientX;
    rotateOrbit(deltaX * 1.6);
  };

  const handlePointerUp = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setTimeout(() => {
      dragRef.current.moved = false;
    }, 0);
    dragRef.current.active = false;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    rotateOrbit((event.deltaX || event.deltaY) * -0.72);
  };

  const getCardTransform = (index) => {
    if (!previewProjects.length) return {};
    const shift = scrollShift + orbitRotation;
    const wrapped = ((((index * spacing - shift) % loopSize) + loopSize) % loopSize) - loopSize / 2;
    const curve = wrapped / 190;
    const x = Math.sin(curve) * 310;
    const y = wrapped * 0.92;
    const z = Math.cos(curve) * 220 - 180;
    const rotateY = Math.sin(curve) * -68;
    const rotateZ = Math.sin(curve * 0.6) * -5;
    const scale = 0.74 + Math.max(0, 1 - Math.abs(wrapped) / 460) * 0.48;
    const opacity = Math.max(0.12, 1 - Math.abs(wrapped) / 720);
    return {
      transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
      opacity,
      zIndex: Math.round(1000 - Math.abs(wrapped)),
    };
  };

  return (
    <div className="projects-showcase-hero" ref={heroRef}>
      <motion.div
        className="projects-hero-copy"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="section-kicker">My Work Universe</span>
        <h1 className="projects-title" aria-label={title}>
          {["Projects", "Showcase"].map((line, lineIndex) => (
            <span className="projects-title-line" key={line}>
              {line.split("").map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  initial={{ opacity: 0, y: 34, rotateX: -45 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: (lineIndex * 8 + index) * 0.025, duration: 0.5, ease: "easeOut" }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          Completed products, active builds, and upcoming AI systems shown as cinematic project stories with
          architecture, workflow, impact, and analysis views.
        </motion.p>
        <motion.strong
          className="project-click-note"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.5 }}
        >
          Just click the project to know more about project.
        </motion.strong>
      </motion.div>

      <motion.div
        className="project-image-orbit"
        style={{ "--count": previewProjects.length }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(event) => event.preventDefault()}
        role="region"
        aria-label="Rotating project spiral. Drag left or right to rotate."
      >
        <button
          type="button"
          className="project-frame-arrow project-frame-arrow-top"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            rotateOrbit(-spacing);
          }}
          aria-label="Move project showcase backward"
        >
          <FaChevronUp />
        </button>
        {previewProjects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            className="orbit-project-card"
            style={getCardTransform(index)}
            onClick={(event) => {
              if (dragRef.current.moved) {
                event.preventDefault();
                return;
              }
              onSelect(project.id);
            }}
            aria-label={`Scroll to ${project.title}`}
          >
            <img src={project.image} alt="" loading="lazy" />
          </button>
        ))}
        <button
          type="button"
          className="project-frame-arrow project-frame-arrow-bottom"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            rotateOrbit(spacing);
          }}
          aria-label="Move project showcase forward"
        >
          <FaChevronDown />
        </button>
      </motion.div>
      <span className="hero-float-circle circle-a" />
      <span className="hero-float-circle circle-b" />
      <span className="hero-float-circle circle-c" />
    </div>
  );
}

function ProjectShowcaseCard({ project, index }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [flipped, setFlipped] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("fiveWOneH");
  const [previewImage, setPreviewImage] = useState(false);
  const tabItems = project.tabs?.[activeTab];

  const openAnalysis = () => {
    setAnalysisMode("fiveWOneH");
    setFlipped(true);
    trackEvent("project_analysis", {
      page: "projects",
      metadata: { projectTitle: project.title, status: project.statusGroup },
    });
  };

  const openStarExplanation = () => {
    setAnalysisMode("star");
    setFlipped(true);
    trackEvent("project_star_explanation", {
      page: "projects",
      metadata: { projectTitle: project.title, status: project.statusGroup },
    });
  };

  return (
    <motion.article
      id={`project-${project.id}`}
      className={`project-showcase-card ${flipped ? "flipped" : ""}`}
      style={{ "--accent": project.accent || "#00cea8", "--accent-2": project.accentAlt || "#915eff" }}
      initial={{ opacity: 0, y: 90, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, delay: index * 0.06, ease: "easeOut" }}
    >
      <div className="project-showcase-inner">
        <div className="project-showcase-face project-front">
          <div className="project-banner">
            <button className="project-image-button" type="button" onClick={() => setPreviewImage(true)} aria-label={`Open ${project.title} image`}>
              <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
            </button>
            <div className="project-banner-overlay">
              <span>{project.statusLabel}</span>
              <h2>{project.title}</h2>
              <p>{project.tagline}</p>
            </div>
          </div>

          <div className="project-body-grid">
            <div className="project-main-story">
              <p className="project-description">{project.description}</p>

              <div className="project-tab-bar" role="tablist" aria-label={`${project.title} details`}>
                {tabLabels.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={activeTab === key ? "active" : ""}
                    onClick={() => setActiveTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="project-tab-content">
                <ProjectTabContent value={tabItems} />
              </div>

              <div className="tag-row project-showcase-tags">
                {project.tags?.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="project-metrics-row">
                {project.metrics?.map((metric) => (
                  <div key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="project-flip-hint">
              <span>AI project guide</span>
              <div className="mini-architecture">
                {["5W1H", "STAR", "Summary", "Detail"].map((item) => (
                  <small key={item}>{item}</small>
                ))}
              </div>
              <p>Click AI Summary to know the project in 5W1H. Click AI Explanation to know the detailed STAR answer.</p>
            </div>
          </div>

          <div className="project-card-footer">
            <ProjectActions project={project} onAnalyze={openAnalysis} onStar={openStarExplanation} />
          </div>
        </div>

        <div className="project-showcase-face project-back" aria-hidden={!flipped}>
          <div className="analysis-header">
            <span>{analysisMode === "star" ? "AI Explanation" : "AI Summary"}</span>
            <h2>{project.fullTitle || project.title}</h2>
            <p>
              {analysisMode === "star"
                ? "Detailed STAR format explanation for interviews."
                : "Balanced 5W1H summary focused on what, why, who, where, when, and how."}
            </p>
          </div>

          <div className={`analysis-grid single ${analysisMode}`}>
            {analysisBlocks
              .filter(([key]) => key === analysisMode)
              .map(([key, label, Icon]) => (
                <AnalysisBlock
                  key={key}
                  id={key === "star" ? `project-${project.id}-star` : undefined}
                  label={label}
                  icon={Icon}
                  value={project.analysis?.[key]}
                />
              ))}
          </div>

          <div className="project-card-footer back-only">
            <button className="analysis-back-button" type="button" onClick={() => setFlipped(false)}>
              Return to project preview <FaSyncAlt />
            </button>
          </div>
        </div>
      </div>
      {previewImage && (
        <div className="project-image-modal" role="dialog" aria-modal="true" aria-label={`${project.title} full image`} onClick={() => setPreviewImage(false)}>
          <button type="button" onClick={() => setPreviewImage(false)}>Close</button>
          <img src={project.image} alt={`${project.title} full preview`} />
        </div>
      )}
    </motion.article>
  );
}

function ProjectTabContent({ value }) {
  if (!value) return null;
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => (
    <span key={item}>
      <FaSyncAlt /> {item}
    </span>
  ));
}

function AnalysisBlock({ id, label, icon: Icon, value }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;

  return (
    <div id={id} className="analysis-block">
      <h3>
        <Icon /> {label}
      </h3>
      {Array.isArray(value) ? (
        <ul>
          {value.map((item) => (
            <li key={item}>{renderAnalysisLine(item)}</li>
          ))}
        </ul>
      ) : (
        <p>{renderAnalysisLine(value)}</p>
      )}
    </div>
  );
}

function renderAnalysisLine(item = "") {
  const match = String(item).match(/^([^:]+):(.*)$/);
  if (!match) return item;
  return (
    <>
      <strong>{match[1]}:</strong>
      {match[2]}
    </>
  );
}

function ProjectActions({ project, onAnalyze, onStar, flipped = false }) {
  return (
    <div className="project-action-row">
      <a
        href={project.github}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("project_github_click", { page: "projects", metadata: { projectTitle: project.title } })}
      >
        <FaGithub /> GitHub
      </a>
      <a
        href={project.live}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("project_live_click", { page: "projects", metadata: { projectTitle: project.title } })}
      >
        <FaExternalLinkAlt /> Live Demo
      </a>
      <button type="button" onClick={onAnalyze}>
        <FaChartLine /> {flipped ? "Preview" : "AI Summary"}
      </button>
      <button type="button" onClick={onStar}>
        <FaStar /> AI Explanation
      </button>
    </div>
  );
}

function matchesFilter(project, filter) {
  if (filter === "all") return true;
  if (["completed", "current", "upcoming"].includes(filter)) return project.statusGroup === filter;
  return project.category === filter || project.categories?.includes(filter) || project.tags?.includes(filter);
}
