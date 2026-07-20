import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaBrain,
  FaClock,
  FaCode,
  FaFolderOpen,
  FaGlobe,
  FaLightbulb,
  FaMicrochip,
  FaPuzzlePiece,
  FaRocket,
  FaShieldHalved,
  FaUserAstronaut,
} from "react-icons/fa6";
import nagoor from "../assets/profile-illustration.jpg";
import GlassCard from "../components/GlassCard";
import { usePortfolio } from "../context/PortfolioContext";

gsap.registerPlugin(ScrollTrigger);

const journeyCards = [
  [FaClock, "Past", "Explored real projects like Smart Symbol Table Analyzer, AI Timetable Generator, and more."],
  [FaCode, "Present", "Strengthening Python, AI/ML, C++ and full stack skills through hands-on projects."],
  [FaRocket, "Future", "Building intelligent software systems that solve real-world problems and create impact."],
];

const traitCards = [
  [FaLightbulb, "Curious learner", "I explore new technologies and learn by doing."],
  [FaPuzzlePiece, "Problem solver", "I break down complex problems and build solutions."],
  [FaMicrochip, "AI-assisted builder", "I use AI to accelerate development and improve quality."],
  [FaBrain, "Future-focused engineer", "I build with the future in mind, creating scalable solutions."],
];

const currentFocus = [
  "DSA: Trees, Graphs, Dynamic Programming",
  "Automation",
  "Agentic AI",
  "Small amount ML",
];

const areaInterests = [
  ["Core", "Operating Systems, Computer Networks, Database Management Systems"],
  ["Domain", "Full Stack Web Development, Software Development"],
  ["Data Structures", "Array, String, Stack, Queue, Recursion"],
];

const statIcons = [FaFolderOpen, FaCode, FaShieldHalved, FaGlobe];

function Stats({ stats }) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".stat-value").forEach((node) => {
        const target = Number(node.dataset.value);
        const suffix = node.dataset.suffix;
        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 85%", once: true },
          onUpdate: () => {
            node.textContent = `${Math.round(proxy.value)}${suffix}`;
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="stats-grid about-simple-stats">
      {stats.map((item, index) => {
        const Icon = statIcons[index] || FaShieldHalved;
        return (
          <GlassCard key={item.label} className="stat-card">
            <Icon className="card-icon" />
            <strong className="stat-value" data-value={item.value} data-suffix={item.suffix}>
              0{item.suffix}
            </strong>
            <span>{item.label}</span>
          </GlassCard>
        );
      })}
    </div>
  );
}

export default function About() {
  const { data } = usePortfolio();
  const { focusCards } = data;
  const stats = data.stats.items;

  return (
    <section className="shell page-pad about-simple-page">
      <div className="about-simple-panel">
        <h1>About Me</h1>
        <div className="about-grid">
          <div className="about-left-column">
            <GlassCard className="profile-card">
              <img src={nagoor} alt="Mohammed Nagoor Meerasha illustrated portrait" loading="lazy" />
              <strong>Hello There</strong>
              <p>Glad to have you here!</p>
            </GlassCard>
            <GlassCard className="area-interest-card">
              <h3>Area of Interest</h3>
              {areaInterests.map(([title, body]) => (
                <div key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              ))}
            </GlassCard>
          </div>

          <div className="about-copy">
            <div className="about-story-intro">
              <h2>Turning Ideas Into <span>Intelligent Systems</span></h2>
              <p>
                I'm a <strong>Computer Science & Engineering</strong> student passionate about building impactful solutions.
              </p>
              <p>I enjoy full stack development, AI/ML, and creating intelligent software systems.</p>
              <blockquote>"Can I build something that solves this?"</blockquote>
            </div>

            <div className="about-short-grid">
              {journeyCards.map(([Icon, title, body]) => (
                <GlassCard key={title} className="about-story-card">
                  <Icon />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </GlassCard>
              ))}
            </div>

            <div className="about-mini-heading"><FaUserAstronaut /><h3>What Defines Me</h3></div>
            <div className="about-traits">
              {traitCards.map(([Icon, title, body]) => (
                <GlassCard key={title}>
                  <Icon />
                  <strong>{title}</strong>
                  <p>{body}</p>
                </GlassCard>
              ))}
            </div>

            <div className="about-mini-heading"><FaRocket /><h3>Current Focus</h3></div>
            <GlassCard className="about-focus-card">
              <div className="tag-row">
                {currentFocus.map((item) => <span key={item}>{item}</span>)}
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="focus-grid">
          {focusCards.map(({ title, body, icon: Icon }) => (
            <GlassCard key={title}>
              <Icon className="card-icon" />
              <h3>{title}</h3>
              <p>{body}</p>
            </GlassCard>
          ))}
        </div>
        <Stats stats={stats} />
      </div>
    </section>
  );
}
