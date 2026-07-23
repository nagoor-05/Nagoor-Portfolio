import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FaBookOpen,
  FaBoxesStacked,
  FaBrain,
  FaChevronDown,
  FaChevronUp,
  FaCode,
  FaDatabase,
  FaFolderOpen,
  FaLayerGroup,
  FaLightbulb,
  FaLocationDot,
  FaMicrochip,
  FaPuzzlePiece,
  FaRocket,
  FaUserAstronaut,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import nagoor from "../assets/profile-illustration.jpg";
import GlassCard from "../components/GlassCard";

const introCards = [
  {
    icon: FaBookOpen,
    title: "Past",
    body: "Built academic and real-world projects in AI, automation, web development, databases, and intelligent software systems, continuously strengthening my technical foundation through hands-on development.",
  },
  {
    icon: FaCode,
    title: "Present",
    body: "Currently focused on Agentic AI, Machine Learning, Full-Stack Development, Data Structures & Algorithms, and building production-ready intelligent applications for real-world use.",
  },
  {
    icon: FaRocket,
    title: "Future",
    body: "My goal is to design and develop intelligent software systems that create meaningful impact, simplify complex workflows, and contribute to the future of AI-driven technology.",
  },
];

const summaryTraits = [
  ["Curious Learner", "I explore new technologies and learn by doing.", FaLightbulb],
  ["Problem Solver", "I break down complex problems and build practical solutions.", FaPuzzlePiece],
  ["AI-Assisted Builder", "I use AI to accelerate development and improve quality.", FaMicrochip],
  ["Future-Focused Engineer", "I build scalable solutions with the future in mind.", FaBrain],
];

const expandedTraits = [
  ["Curious Learner", "I continuously explore new technologies, experiment with ideas, and transform learning into real-world projects.", FaLightbulb],
  ["Problem Solver", "I enjoy breaking down complex challenges into structured, practical, and scalable solutions.", FaPuzzlePiece],
  ["AI-Assisted Builder", "I leverage AI to accelerate development, improve productivity, and build smarter software while maintaining engineering quality.", FaMicrochip],
  ["Future-Focused Engineer", "I am committed to building intelligent systems that are scalable, reliable, user-centric, and ready for the future.", FaRocket],
];

const focusCards = [
  ["Agentic AI", "Designing intelligent multi-agent systems using LangGraph and LangChain.", FaUserAstronaut],
  ["Machine Learning", "Strengthening ML fundamentals and applying models to real-world problems.", FaBrain],
  ["Intelligent Automation", "Building workflow automation using AI, APIs, and modern automation tools.", FaWandMagicSparkles],
  ["Problem Solving", "Improving Data Structures & Algorithms, aptitude, and system design for software engineering roles.", FaCode],
];

const expertiseCards = [
  ["Full Stack Development", "React - Node.js - Flask - REST APIs", FaLayerGroup],
  ["Programming", "Python - Java - C++ - JavaScript", FaCode],
  ["AI & Machine Learning", "LangGraph - LangChain - LLMs - RAG - Prompt Engineering", FaBrain],
  ["Databases", "MongoDB - MySQL - Vector Databases", FaDatabase],
];

const stats = [
  ["Projects", 14, "+", FaFolderOpen],
  ["Technologies", 20, "+", FaCode],
  ["AI Workflows", 6, "+", FaWandMagicSparkles],
  ["Core Domains", 4, "", FaBoxesStacked],
];

const areaInterests = [
  ["Core", "Operating Systems, Computer Networks, Database Management Systems"],
  ["Domain", "Full Stack Web Development, Software Development"],
  ["Data Structures", "Array, String, Stack, Queue, Recursion"],
];

export default function About() {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const expandedRef = useRef(null);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      setTimeout(() => {
        expandedRef.current?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }, 90);
    }
  };

  return (
    <section className="shell page-pad about-page-v2">
      <h1>About Me</h1>
      <div className="about-v2-grid">
        <aside className="about-profile-stack" aria-label="Profile summary">
          <GlassCard className="about-profile-card-v2">
            <img src={nagoor} alt="Mohammed Nagoor Meerasha illustrated portrait" loading="lazy" />
            <h2>Mohammed Nagoor Meerasha S</h2>
            <strong>AI/ML Developer - Final-Year CSE Student</strong>
            <p><FaLocationDot /> Coimbatore, Tamil Nadu</p>
            <span>Available for Internships - Full-Time Roles - Collaboration</span>
          </GlassCard>
          <GlassCard className="about-interest-card">
            <h2>Area of Interest</h2>
            {areaInterests.map(([title, body]) => (
              <p key={title}><strong>{title}</strong>{body}</p>
            ))}
          </GlassCard>
        </aside>

        <div className="about-main-v2">
          <span className="eyebrow">About Me</span>
          <h2>Turning Ideas Into <span>Intelligent Systems</span></h2>
          <p>
            I am a Computer Science Engineering student passionate about Artificial Intelligence,
            Machine Learning, Agentic AI, Intelligent Automation, and Full-Stack Software Development.
            I enjoy transforming ideas into practical software solutions that solve real-world problems
            while continuously learning and improving my engineering skills.
          </p>
          <blockquote>
            "Can I build something that solves this?"
            <small>This simple question inspires every project I create and every challenge I take on.</small>
          </blockquote>

          <div className="about-intro-card-grid">
            {introCards.map(({ icon: Icon, title, body }) => (
              <GlassCard key={title} className="about-intro-card">
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </GlassCard>
            ))}
          </div>

          <CompactGrid title="What Defines Me" icon={<FaUserAstronaut />} items={summaryTraits} />

          <section className="about-current-focus" aria-labelledby="about-focus-heading">
            <h2 id="about-focus-heading"><FaRocket /> Current Focus</h2>
            <div className="about-focus-pills">
              {["DSA: Trees, Graphs, Dynamic Programming", "Automation", "Agentic AI", "Small amount ML"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="about-core-grid">
        {expertiseCards.map(([title, tech, Icon]) => (
          <GlassCard key={title} className="about-core-card">
            <Icon aria-hidden="true" />
            <h3>{title}</h3>
            <p>{tech}</p>
          </GlassCard>
        ))}
      </div>

      <AboutStats />

      <div className="about-toggle-wrap">
        <button
          type="button"
          className="about-more-toggle"
          aria-expanded={expanded}
          aria-controls="expanded-about-content"
          aria-label={expanded ? "Show less about me" : "Show more about me"}
          onClick={toggleExpanded}
        >
          {expanded ? "Show Less" : "More About Me"}
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="expanded-about-content"
            ref={expandedRef}
            className="about-expanded-content"
            initial={reducedMotion ? false : { height: 0, opacity: 0, y: 12 }}
            animate={reducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0, y: 12 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }}
          >
            <ExpandedAbout />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CompactGrid({ title, icon, items }) {
  return (
    <section className="about-compact-section" aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}>
      <h2 id={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}>{icon}{title}</h2>
      <div className="about-trait-grid">
        {items.map(([itemTitle, body, Icon]) => (
          <GlassCard key={itemTitle} className="about-trait-card">
            <Icon aria-hidden="true" />
            <h3>{itemTitle}</h3>
            <p>{body}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function ExpandedAbout() {
  return (
    <>
      <GlassCard className="about-philosophy-card">
        <FaWandMagicSparkles aria-hidden="true" />
        <h2>My Philosophy</h2>
        <blockquote>"Can I build something that solves this?"</blockquote>
        <p>
          This question drives every project I create. I believe technology should solve real problems,
          not just showcase technical skills. Through continuous learning, thoughtful engineering, and
          intelligent automation, I strive to build software that creates meaningful impact.
        </p>
      </GlassCard>

      <CompactGrid title="What Defines Me" icon={<FaUserAstronaut />} items={expandedTraits} />

      <section className="about-compact-section">
        <h2><FaRocket /> Current Focus</h2>
        <div className="about-trait-grid">
          {focusCards.map(([title, body, Icon]) => (
            <GlassCard key={title} className="about-trait-card focus">
              <Icon aria-hidden="true" />
              <span>Actively Learning</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="about-compact-section">
        <h2><FaLayerGroup /> Core Expertise</h2>
        <div className="about-core-grid expanded">
          {expertiseCards.map(([title, tech, Icon]) => (
            <GlassCard key={title} className="about-core-card">
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <div className="about-tech-tags">
                {tech.split(" - ").map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="about-compact-section">
        <h2><FaFolderOpen /> Achievements at a Glance</h2>
        <AboutStats expanded />
      </section>

      <GlassCard className="about-closing-card">
        <p>
          "I don't just build projects-I build solutions that combine creativity, engineering,
          and artificial intelligence to solve meaningful real-world problems."
        </p>
      </GlassCard>
    </>
  );
}

function AboutStats({ expanded = false }) {
  const root = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!root.current || visible) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={root} className={`about-stats-grid ${expanded ? "expanded" : ""}`}>
      {stats.map(([label, value, suffix, Icon]) => (
        <GlassCard key={label} className="about-stat-card">
          <Icon aria-hidden="true" />
          <strong aria-label={`${value}${suffix} ${label}`}>{visible ? `${value}${suffix}` : `0${suffix}`}</strong>
          <span>{label}</span>
        </GlassCard>
      ))}
    </div>
  );
}
