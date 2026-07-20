import { FaLocationDot } from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";

export default function Experience() {
  const { data } = usePortfolio();
  const experiences = data.experiences?.length ? data.experiences : [];
  const enriched = experiences.map((item, index) => ({
    ...item,
    skills: index === 0 ? ["Python", "Machine Learning", "AI/ML", "Git", "Research"] : ["React", "Tailwind CSS", "Framer Motion", "Three.js", "GitHub"],
    status: index === 0 ? item.status || "Ongoing" : "Project-Based",
  }));

  return (
    <section className="shell page-pad experience-page">
      <PageTitle
        eyebrow="Work Experience"
        title="Experience & Internship"
        description="My current experience, internship learning, project-building journey, and practical exposure to software development workflows."
      />
      <div className="experience-card-grid">
        {enriched.length === 0 && (
          <GlassCard className="experience-card">
            <h2>Experience details are being updated</h2>
            <p>My internship, project-building journey, and practical learning records will appear here soon.</p>
          </GlassCard>
        )}
        {enriched.map((item, index) => (
          <GlassCard key={item.role || item.title || index} className="experience-card premium-experience-card">
            <div className="experience-meta">
              <span>{item.date || item.period || "Current"}</span>
              <span>{item.status || "Active"}</span>
            </div>
            <h2>{item.role || item.title || "Experience"}</h2>
            <h3>{item.organization || item.company || "Portfolio Learning"}</h3>
            <small><FaLocationDot /> {item.location || "Remote / Project-based"}</small>
            <p>{item.description || item.body || "Learning practical software development workflows through projects and guided practice."}</p>
            <strong className="eyebrow">Responsibilities</strong>
            <ul>
              {(item.responsibilities || item.points || ["Project planning", "Implementation practice", "Documentation and improvement"]).map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
            <div className="experience-skill-row">
              {item.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </GlassCard>
        ))}
      </div>
      <h2 className="experience-timeline-title">Experience Timeline</h2>
      <div className="experience-timeline-grid">
        {enriched.map((item, index) => (
          <GlassCard key={`${item.role}-${index}`} className="experience-timeline-card">
            <span>{item.date || "2026"}</span>
            <h3>{item.role}</h3>
            <strong>{item.organization}</strong>
            <p>{item.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
