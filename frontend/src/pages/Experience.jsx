import { FaLocationDot } from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import synecxLogo from "../assets/logos/synecx-ai-labs.png";

const experienceRecords = [
  {
    period: "2026 – Present",
    status: "Ongoing",
    role: "AI/ML Intern",
    organization: "Synecx AI Labs",
    location: "Kanuvai, Coimbatore, Tamil Nadu",
    workType: "Internship",
    logo: synecxLogo,
    description:
      "Working on practical AI/ML and full-stack development workflows. During this internship, I designed and developed ReconIQ, an AI-powered financial reconciliation and fraud-detection platform.",
    responsibilities: [
      "Analysing financial reconciliation and transaction-verification workflows",
      "Designing and developing the ReconIQ platform",
      "Building frontend and backend features",
      "Implementing bank-statement processing and validation workflows",
      "Developing suspicious-transaction and fraud-detection logic",
      "Integrating AI-assisted analysis and verification reporting",
      "Testing application workflows and fixing implementation issues",
      "Maintaining project documentation and Git-based development",
    ],
    skills: ["Python", "AI/ML", "React", "Node.js", "Express.js", "MongoDB", "OCR", "REST APIs", "Git", "GitHub"],
    keyProject: {
      title: "ReconIQ — AI Financial Reconciliation and Fraud Detection",
      description:
        "An AI-powered platform designed to analyse bank statements, reconcile transaction records, detect suspicious activity, calculate fraud risk, and generate verification reports.",
    },
    timeline:
      "Developing ReconIQ, an AI-powered financial reconciliation and fraud-detection platform, while gaining practical experience in AI/ML, full-stack development, workflow analysis, testing, and documentation.",
  },
  {
    period: "2025 – Present",
    status: "Project-Based",
    role: "Personal Project Developer",
    organization: "Self-Learning and Independent Project Development",
    location: "Remote",
    workType: "Personal Projects",
    description:
      "Designing and developing practical full-stack, AI/ML, automation, cybersecurity, and portfolio applications to improve software engineering and problem-solving skills.",
    responsibilities: [
      "Identifying real-world problems and planning software solutions",
      "Designing application architecture and user workflows",
      "Developing responsive frontend interfaces",
      "Building backend APIs and database integrations",
      "Adding authentication, role-based access, and AI features",
      "Testing, documenting, deploying, and continuously improving projects",
      "Managing source code and project versions using GitHub",
    ],
    skills: ["React", "Tailwind CSS", "Framer Motion", "Node.js", "Express.js", "MongoDB", "MySQL", "Python", "Flask", "FastAPI", "AI/ML", "GitHub", "Vercel"],
    timeline:
      "Building practical full-stack, AI/ML, automation, cybersecurity, and portfolio projects through independent learning and implementation.",
  },
];

export default function Experience() {
  return (
    <section className="shell page-pad experience-page">
      <PageTitle
        eyebrow="Work Experience"
        title="Experience & Internship"
        description="My current experience, internship learning, project-building journey, and practical exposure to software development workflows."
      />
      <div className="experience-card-grid">
        {experienceRecords.map((item, index) => (
          <GlassCard key={`${item.role}-${item.period}`} className="experience-card premium-experience-card">
            <div className="experience-meta">
              <span>{item.period}</span>
              <span>{item.status}</span>
            </div>
            <div className="experience-company-row">
              {item.logo ? (
                <div className="experience-company-logo">
                  <img src={item.logo} alt={`${item.organization} logo`} />
                </div>
              ) : (
                <div className="experience-company-logo experience-company-logo-text" aria-hidden="true">
                  <span>ID</span>
                </div>
              )}
              <div>
                <h2>{item.role}</h2>
                <h3>{item.organization}</h3>
                <small><FaLocationDot /> {item.location} · {item.workType}</small>
              </div>
            </div>
            <p>{item.description}</p>
            <strong className="eyebrow">Responsibilities</strong>
            <ul>
              {item.responsibilities.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
            {item.keyProject && (
              <div className="experience-key-project">
                <span>Key Project</span>
                <strong>{item.keyProject.title}</strong>
                <p>{item.keyProject.description}</p>
              </div>
            )}
            <div className="experience-skill-row">
              {item.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </GlassCard>
        ))}
      </div>
      <h2 className="experience-timeline-title">Experience Timeline</h2>
      <div className="experience-timeline-grid">
        {experienceRecords.map((item) => (
          <GlassCard key={`${item.role}-timeline`} className="experience-timeline-card">
            <span>{item.period}</span>
            <h3>{timelineTitle(item)}</h3>
            <strong>{item.workType}</strong>
            <small><FaLocationDot /> {item.location}</small>
            <p>{item.timeline}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function timelineTitle(item) {
  if (item.organization === "Self-Learning and Independent Project Development") {
    return "Personal Project Developer — Independent";
  }
  return `${item.role} — ${item.organization}`;
}
