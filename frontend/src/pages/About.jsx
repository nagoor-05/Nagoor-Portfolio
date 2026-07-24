import { motion } from "framer-motion";
import { FaBrain } from "react-icons/fa";
import profileImg from "../assets/profile-illustration.jpg";

export default function About() {
  return (
    <section className="shell page-pad cyberpunk-about-page">
      {/* Background Cyber-grid and Purple Wave Particle Effect */}
      <div className="cyber-grid-bg" aria-hidden="true" />
      <div className="purple-wave-bg" aria-hidden="true" />

      {/* Header */}
      <header className="cyber-about-header">
        <span className="cyber-section-tag">[01] // ABOUT_SECTION</span>
        <h1 className="cyber-about-title">
          ABOUT<span className="cyber-cursor">__ME</span>
        </h1>
      </header>

      {/* Main Grid Layout */}
      <div className="cyber-about-grid">
        {/* Left Profile Card */}
        <motion.aside
          className="cyber-profile-card"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="cyber-corner corner-tl" aria-hidden="true" />
          <div className="cyber-corner corner-tr" aria-hidden="true" />
          <div className="cyber-corner corner-bl" aria-hidden="true" />
          <div className="cyber-corner corner-br" aria-hidden="true" />

          <div className="cyber-profile-img-frame">
            <img
              src={profileImg}
              alt="Mohammed Nagoor Meerasha"
              className="cyber-profile-img"
            />
          </div>

          <div className="cyber-profile-meta">
            <h2 className="cyber-handle">&gt; NAGOOR</h2>
            <strong className="cyber-fullname">Mohammed Nagoor Meerasha</strong>
            <p className="cyber-role">AI / ML Engineer • Builder</p>
          </div>
        </motion.aside>

        {/* Right Content Column */}
        <motion.div
          className="cyber-content-column"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Top Row: Core Stack & AI/LLM */}
          <div className="cyber-top-row">
            {/* Core Stack */}
            <div className="cyber-panel cyber-panel-stack">
              <h3 className="cyber-panel-tag">• CORE STACK</h3>
              <div className="cyber-chips-grid">
                {["Python", "Flask", "Node.js", "React", "MongoDB", "Tailwind CSS"].map(
                  (tech) => (
                    <span key={tech} className="cyber-chip">
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* AI / LLM */}
            <div className="cyber-panel cyber-panel-ai">
              <h3 className="cyber-panel-tag">• AI / LLM</h3>
              <div className="cyber-chips-grid">
                {[
                  "LangGraph",
                  "LangChain",
                  "RAG",
                  "Agents",
                  "Prompt Engineering",
                  "LLMs",
                ].map((tech) => (
                  <span key={tech} className="cyber-chip">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Row: Philosophy */}
          <div className="cyber-panel cyber-panel-philosophy">
            <div className="philosophy-text-content">
              <h3 className="cyber-panel-tag">• PHILOSOPHY</h3>
              <h2 className="philosophy-heading">
                Can I build something that solves this?
              </h2>
              <p className="philosophy-description">
                I believe technology should solve real problems, not just showcase
                technical skills. Through continuous learning, thoughtful
                engineering, and intelligent automation, I strive to build software
                that creates meaningful impact.
              </p>
            </div>
            <div className="philosophy-visual" aria-hidden="true">
              <div className="brain-orbit-ring" />
              <FaBrain className="brain-icon-glow" />
            </div>
          </div>

          {/* Bottom Row: Currently */}
          <div className="cyber-panel cyber-panel-currently">
            <h3 className="cyber-panel-tag">• CURRENTLY</h3>
            <div className="currently-terminal-list">
              <div className="currently-row">
                <span className="currently-key">focus:</span>
                <span className="currently-val">
                  Agentic AI, Intelligent Automation, Full-Stack Development
                </span>
              </div>
              <div className="currently-row">
                <span className="currently-key">edu:</span>
                <span className="currently-val">
                  Final-Year CSE @ PSG iTech
                </span>
              </div>
              <div className="currently-row">
                <span className="currently-key">status:</span>
                <span className="currently-val">
                  Open to internships, full-time roles, and collaboration
                </span>
              </div>
              <div className="currently-row">
                <span className="currently-key">building:</span>
                <span className="currently-val">
                  Real-world AI systems, scalable apps, and practical solutions
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

