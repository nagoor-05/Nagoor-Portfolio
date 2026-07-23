import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaBrain,
  FaCode,
  FaDatabase,
  FaMicrochip,
  FaServer,
  FaScrewdriverWrench,
} from "react-icons/fa6";
import { FaDesktop } from "react-icons/fa";

const skillCategories = [
  {
    title: "Programming",
    icon: FaCode,
    accent: "blue",
    items: [["C", 50], ["C++", 55], ["Python", 58], ["Java", 40]],
  },
  {
    title: "Frontend",
    icon: FaDesktop,
    accent: "pink",
    items: [["HTML", 58], ["CSS", 56], ["Tailwind CSS", 52], ["React", 54], ["Framer Motion", 45]],
  },
  {
    title: "Backend",
    icon: FaServer,
    accent: "cyan",
    items: [["Node.js", 52], ["Express.js", 50], ["Flask", 56], ["REST APIs", 58], ["Authentication", 46]],
  },
  {
    title: "Database",
    icon: FaDatabase,
    accent: "green",
    items: [["MongoDB", 54], ["MySQL", 50], ["CRUD Operations", 58], ["Vector Databases", 42]],
  },
  {
    title: "Tools Used",
    icon: FaScrewdriverWrench,
    accent: "orange",
    items: [["Git", 58], ["GitHub", 58], ["VS Code", 60], ["Postman", 50], ["Vercel", 52], ["Render", 48], ["Docker", 42]],
  },
  {
    title: "Agentic AI Basics & ML Basics",
    icon: FaBrain,
    accent: "magenta",
    items: [["Agentic AI", 40], ["LangGraph", 38], ["LangChain", 38], ["LLMs", 40], ["Prompt Engineering", 39], ["Machine Learning", 37]],
  },
  {
    title: "Core Computer Science",
    icon: FaMicrochip,
    accent: "purple",
    items: [["Computer Networks", 52], ["Operating Systems", 50], ["DBMS", 54], ["Software Engineering", 56]],
  },
];

export default function Skills() {
  return (
    <section className="shell page-pad skills-page-v2">
      <motion.header
        className="skills-v2-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span>WHAT I KNOW</span>
        <h1>Skills</h1>
        <i aria-hidden="true" />
      </motion.header>

      <div className="skills-v2-grid" aria-label="Technical skills grouped by category">
        {skillCategories.map((category, index) => (
          <SkillCategoryCard key={category.title} category={category} index={index} />
        ))}
      </div>
    </section>
  );
}

function SkillCategoryCard({ category, index }) {
  const Icon = category.icon;
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.article
      ref={ref}
      className={`skill-v2-card accent-${category.accent}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
    >
      <header>
        <span className="skill-v2-icon"><Icon aria-hidden="true" /></span>
        <h2>{category.title}</h2>
      </header>
      <div className="skill-v2-list">
        {category.items.map(([name, value]) => (
          <div className="skill-v2-row" key={name}>
            <div>
              <strong>{name}</strong>
              <span>{value}%</span>
            </div>
            <div
              className="skill-v2-track"
              role="progressbar"
              aria-label={`${name} - ${value} percent`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={value}
            >
              <i style={{ "--target-width": `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </motion.article>
  );
}
