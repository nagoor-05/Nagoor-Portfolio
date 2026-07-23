import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FaBaby,
  FaBookOpen,
  FaBookOpenReader,
  FaBriefcase,
  FaChevronDown,
  FaChevronUp,
  FaCode,
  FaDownload,
  FaEye,
  FaGraduationCap,
  FaHeartPulse,
  FaLandmark,
  FaLaptopCode,
  FaLocationDot,
  FaLock,
  FaPuzzlePiece,
  FaSchool,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import { usePortfolio } from "../context/PortfolioContext";
import keinsLogo from "../assets/keins-school-logo.png";
import psgLogo from "../assets/logos/psg-itech.png";

const EDUCATION_DOCUMENT_PASSWORD = "Nagoor@2005";

const summaryCards = [
  {
    title: "Higher Secondary Education",
    period: "2022-2023",
    meta: ["Keins Matric Higher Secondary School", "555 / 600 - 92.5%"],
    description: "Completed higher secondary education with a strong academic foundation in mathematics, science, and problem-solving.",
    icon: FaGraduationCap,
    logo: keinsLogo,
  },
  {
    title: "B.E. Computer Science and Engineering",
    period: "2023-2027",
    meta: ["PSG Institute of Technology and Applied Research", "Neelambur, Coimbatore", "Final-Year Student"],
    description: "Building a strong foundation in programming, software engineering, artificial intelligence, databases, computer networks, and real-world project development.",
    icon: FaLandmark,
    logo: psgLogo,
  },
  {
    title: "Current Internship",
    period: "2026-Present",
    meta: ["SynecX AI Labs", "AI/ML Intern", "Agentic AI - Automation - Practical AI Workflows"],
    description: "Currently gaining practical exposure to AI workflows, intelligent automation, API integration, and real-world software development.",
    icon: FaLaptopCode,
    logoText: "SX",
  },
];

const timelineItems = [
  ["2005", "Born in Tirunelveli", "Tirunelveli, Tamil Nadu, India", "Started my journey in Tirunelveli, where I developed curiosity for technology, problem-solving, and continuous learning.", FaBaby],
  ["2020-2021", "Secondary School Education", "Tamil Nadu State Board - 100%", "Completed SSLC under the academic evaluation system followed during the COVID-19 period.", FaSchool],
  ["2021-2022", "Higher Secondary First Year", "Tamil Nadu Higher Secondary Education - 508 / 600 - 84.66%", "Strengthened my academic foundation in mathematics, science, logical reasoning, and problem-solving.", FaBookOpen],
  ["2022-2023", "Higher Secondary Education", "Tamil Nadu Higher Secondary Education - 555 / 600 - 92.5%", "Completed higher secondary education with strong performance and a growing interest in computer science and engineering.", FaGraduationCap],
  ["2023-Present", "B.E. Computer Science and Engineering", "PSG Institute of Technology and Applied Research - Neelambur, Coimbatore", "Pursuing Computer Science and Engineering while developing practical skills in programming, artificial intelligence, databases, operating systems, computer networks, software engineering, and problem-solving.", FaLandmark],
  ["2024", "Learning and Recovery Phase", "Consistency Building", "Continued learning and skill development while managing personal challenges, strengthening discipline, patience, adaptability, and consistency.", FaHeartPulse],
  ["2025", "Started Practical Development", "Programming and Web Development", "Began building academic and real-world projects using Python, Java, C++, React, Node.js, Flask, databases, machine learning, and automation tools.", FaCode],
  ["2026", "AI and Software Engineering Focus", "Current Growth Phase", "Currently focused on Agentic AI, Machine Learning, Full-Stack Development, Data Structures and Algorithms, intelligent automation, and production-ready applications.", FaWandMagicSparkles],
  ["2027", "Expected Graduation", "Software Engineering Path", "Expected to complete the B.E. Computer Science and Engineering degree and begin a professional career in software engineering and intelligent systems development.", FaBriefcase],
];

const educationDetails = [
  ["B.E. Computer Science and Engineering", "2023-2027", "PSG Institute of Technology and Applied Research", "Neelambur, Coimbatore - Final-Year Student", "Developing a strong foundation in computer science, software engineering, artificial intelligence, full-stack development, databases, systems, and practical project implementation."],
  ["Higher Secondary Education", "2022-2023", "555 / 600 - 92.5%", "", "Completed higher secondary education with a strong foundation in mathematics, science, and analytical problem-solving."],
  ["Higher Secondary First Year", "2021-2022", "508 / 600 - 84.66%", "", "Built academic confidence and strengthened core mathematics, science, and reasoning skills."],
  ["Secondary School Education", "2020-2021", "Tamil Nadu State Board - 100%", "", "Completed SSLC under the academic evaluation process followed during the COVID-19 period."],
];

const coursework = [
  "Data Structures and Algorithms",
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Artificial Intelligence",
  "Machine Learning",
  "Compiler Design",
  "Software Engineering",
  "Object-Oriented Programming",
  "Web Development",
  "Computer Organization",
  "Problem Solving and Programming",
];

const outcomes = [
  ["Technical Foundation", "Programming, data structures, databases, operating systems, computer networks, and software engineering fundamentals.", FaCode],
  ["Problem-Solving Ability", "Breaking complex challenges into smaller, structured, and practical solutions.", FaPuzzlePiece],
  ["Project Development", "Turning academic concepts into working software projects through design, implementation, testing, and iteration.", FaBriefcase],
  ["Continuous Learning", "Learning from challenges, experimentation, feedback, and practical implementation.", FaBookOpenReader],
];

const academicFocus = [
  "Agentic AI",
  "Machine Learning",
  "Full-Stack Development",
  "Data Structures and Algorithms",
  "Database Systems",
  "Computer Networks",
  "Software Engineering",
  "Intelligent Automation",
];

export default function Education() {
  const { data } = usePortfolio();
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
    <section className="shell page-pad education-page-v2">
      <header className="education-v2-header">
        <span>HELLO THERE</span>
        <h1>Education & Journey</h1>
        <p>
          My academic journey has shaped my foundation in computer science, problem-solving,
          artificial intelligence, and software development. Each stage has helped me improve
          through learning, projects, challenges, and continuous practice.
        </p>
      </header>

      <div className="education-summary-grid">
        {summaryCards.map(({ title, period, meta, description, icon: Icon, logo, logoText }) => (
          <GlassCard key={title} className="education-summary-card">
            <div className="education-summary-logo" aria-hidden="true">
              {logo ? <img src={logo} alt="" /> : logoText ? <strong>{logoText}</strong> : <Icon />}
            </div>
            <span>{period}</span>
            <h2>{title}</h2>
            {meta.map((item) => <strong key={item}>{item}</strong>)}
            <p>{description}</p>
          </GlassCard>
        ))}
      </div>

      <div className="education-toggle-wrap">
        <button
          type="button"
          className="education-more-toggle"
          aria-expanded={expanded}
          aria-controls="expanded-education-content"
          aria-label={expanded ? "Show less education details" : "Show more education details"}
          onClick={toggleExpanded}
        >
          {expanded ? "Show Less" : "More Education Details"}
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="expanded-education-content"
            ref={expandedRef}
            className="education-expanded-content"
            initial={reducedMotion ? false : { height: 0, opacity: 0, y: 12 }}
            animate={reducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0, y: 12 }}
            transition={{ duration: reducedMotion ? 0 : 0.52, ease: "easeOut" }}
          >
            <JourneyTimeline />
            <DetailedEducationGrid />
            <ChipSection title="Relevant Coursework" items={coursework} />
            <CertificatesSection data={data} />
            <OutcomeGrid />
            <ChipSection title="Academic Focus" items={academicFocus} />
            <GlassCard className="education-closing-card">
              <p>
                My education has given me more than academic knowledge. It has helped me develop
                discipline, resilience, technical curiosity, and the confidence to turn ideas into
                practical software solutions.
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function JourneyTimeline() {
  return (
    <section className="education-v2-section">
      <h2>Full Journey Timeline</h2>
      <ol className="education-v2-timeline">
        {timelineItems.map(([period, title, meta, body, Icon]) => (
          <li key={`${period}-${title}`}>
            <div className="timeline-icon"><Icon aria-hidden="true" /></div>
            <div className="timeline-copy">
              <span>{period}</span>
              <h3>{title}</h3>
              <strong>{meta}</strong>
            </div>
            <GlassCard className="timeline-note">
              <p>{body}</p>
            </GlassCard>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DetailedEducationGrid() {
  return (
    <section className="education-v2-section">
      <h2>Detailed Education</h2>
      <div className="education-detail-grid">
        {educationDetails.map(([title, period, institution, location, description]) => (
          <GlassCard key={title} className="education-detail-card">
            <span>{period}</span>
            <h3>{title}</h3>
            <strong>{institution}</strong>
            {location && <small><FaLocationDot /> {location}</small>}
            <p>{description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function ChipSection({ title, items }) {
  return (
    <section className="education-v2-section">
      <h2>{title}</h2>
      <div className="education-chip-cloud">
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function CertificatesSection({ data }) {
  const education = data.educationCertificates || {};
  const achievements = data.achievements || {};
  const schoolItems = [
    ...(education.schoolRecords || []).filter((item) => item.title !== "Birth Certificate"),
  ];
  const collegeItems = (education.semesters || []).map((item) => ({
    ...item,
    title: `${item.title} Mark Sheet`,
    organization: "PSG Institute of Technology and Applied Research",
    description: item.status === "Completed"
      ? `Academic record for ${item.title}.`
      : "Document will be added when the semester record is available.",
    documentLabel: "Mark Sheet",
  }));
  const professionalItems = (achievements.certifications || []).map((item) => ({
    ...item,
    organization: item.provider,
    year: item.year,
    visibility: item.documentUrl ? "public_document" : "pending",
    documentLabel: item.documentLabel || "Certificate",
  }));

  return (
    <section className="education-v2-section">
      <h2>Education & Certificates</h2>
      <CertificateGroup title="School and Board Certificates" items={schoolItems} />
      <CertificateGroup title="College Academic Records" items={collegeItems} />
      <CertificateGroup title="Professional Certificates" items={professionalItems} emptyText="Professional certificates will be added only when verified files are available." />
    </section>
  );
}

function CertificateGroup({ title, items, emptyText = "Document will be added soon." }) {
  return (
    <div className="certificate-group-v2">
      <h3>{title}</h3>
      {items.length ? (
        <div className="certificate-grid-v2">
          {items.map((item) => <CertificateCard key={`${title}-${item.title}`} item={item} />)}
        </div>
      ) : (
        <p className="certificate-empty">{emptyText}</p>
      )}
    </div>
  );
}

function CertificateCard({ item }) {
  const available = item.visibility === "public_document" && item.documentUrl;
  const safePrivate = item.title?.toLowerCase().includes("birth");

  return (
    <GlassCard className="certificate-card-v2">
      <FaGraduationCap aria-hidden="true" />
      <div>
        <span>{item.year || item.date || item.status || "Record"}</span>
        <h4>{item.title}</h4>
        <strong>{item.organization || item.provider || "Academic Record"}</strong>
        <p>{safePrivate ? "Verified document available privately." : item.description || "Document will be added soon."}</p>
      </div>
      <DocumentActions item={item} available={Boolean(available && !safePrivate)} />
    </GlassCard>
  );
}

function DocumentActions({ item, available }) {
  const label = item.documentLabel || "Document";

  const verifyPassword = () => {
    const password = window.prompt("Enter password to access this education document");
    if (password === null) return false;
    if (password === EDUCATION_DOCUMENT_PASSWORD) return true;
    window.alert("Incorrect password. Please try again.");
    return false;
  };

  const view = () => {
    if (!available || !verifyPassword()) return;
    window.open(item.documentUrl, "_blank", "noopener,noreferrer");
  };

  const download = () => {
    if (!available || !verifyPassword()) return;
    const link = document.createElement("a");
    link.href = item.documentUrl;
    link.download = item.documentUrl.split("/").pop() || label;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!available) return <span className="certificate-unavailable">Document will be added soon</span>;

  return (
    <div className="certificate-actions-v2">
      <button type="button" onClick={view}><FaLock /> <FaEye /> View {label}</button>
      <button type="button" onClick={download}><FaLock /> <FaDownload /> Download {label}</button>
    </div>
  );
}

function OutcomeGrid() {
  return (
    <section className="education-v2-section">
      <h2>What My Education Built</h2>
      <div className="education-outcome-grid">
        {outcomes.map(([title, body, Icon]) => (
          <GlassCard key={title} className="education-outcome-card">
            <Icon aria-hidden="true" />
            <h3>{title}</h3>
            <p>{body}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
