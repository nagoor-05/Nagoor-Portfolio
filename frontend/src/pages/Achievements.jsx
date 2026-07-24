import { FaCalendarDays, FaCircleCheck, FaCircleInfo, FaCode, FaGraduationCap, FaTrophy } from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import redhatLogo from "../assets/logos/redhat.png";
import oracleLogo from "../assets/logos/oracle-certified.jpg";
import sihLogo from "../assets/logos/sih.jpg";
import ideaLogo from "../assets/logos/ideathon.jpg";

export default function Achievements() {
  const { data } = usePortfolio();
  const achievements = data.achievements;
  const timeline = [
    ["2024", "Learning & Recovery Phase", "Focused on recovery, self-improvement, and rebuilding consistency while developing a stronger mindset toward long-term growth."],
    ["2025", "Started Programming Journey", "Began actively learning programming, software development, Java, C++, web technologies, and problem-solving fundamentals."],
    ["2026", "AI/ML Internship", "Started gaining practical exposure to industry workflows, AI/ML concepts, software development practices, and professional teamwork."],
    ["2026", "Portfolio Website Launched", "Designed and developed a premium personal portfolio using React, Framer Motion, Three.js, Tailwind CSS, and particles."],
    ["2026", "Project Building Journey", "Built multiple real-world projects while improving frontend development, backend concepts, UI/UX design, and software engineering practices."],
    ["2027", "Expected Graduation", "Preparing to graduate with a B.E in Computer Science and Engineering while strengthening technical expertise and industry readiness."],
  ];
  const cards = [
    ["Premium Portfolio Website", "Designed and developed a modern portfolio featuring animation, glassmorphism, responsive layouts, and interactive showcases."],
    ["Consistent Project Building", "Actively building software projects to gain practical experience and apply theoretical knowledge to real-world scenarios."],
    ["AI/ML Learning Journey", "Exploring Artificial Intelligence and Machine Learning concepts while building a strong foundation for future specialization."],
    ["Continuous Learning", "Maintaining a growth mindset through technical learning, self-improvement books, experimentation, and consistent skill development."],
    ["Problem Solving & DSA", "Improving analytical thinking and coding skills through Data Structures, Algorithms, debugging, and logical problem solving."],
    ["Career Development", "Working toward becoming a skilled software engineer through internships, projects, networking, and continuous learning."],
  ];

  return (
    <section className="shell page-pad achievements-page">
      <div className="achievement-hero">
        <PageTitle
          eyebrow="Recognition"
          title="Achievements & Recognition"
          description="A collection of my academic excellence, technical certifications, competitions, and professional milestones."
        />
        <div className="trophy-visual"><FaTrophy /></div>
      </div>

      <div className="achievement-stats">
        {achievements.stats.map(({ label, value, note, icon: Icon }) => (
          <GlassCard key={label} className="achievement-stat">
            <span className="achievement-stat-icon"><Icon /></span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
              <small>{note}</small>
            </div>
          </GlassCard>
        ))}
      </div>

      <AchievementSection icon={<FaGraduationCap />} title="1. Academic & Technical Certifications" description="Professional certifications that enhance my technical expertise and industry knowledge.">
        {achievements.certifications.map((item) => (
          <CertificationCard key={item.title} item={item} />
        ))}
      </AchievementSection>

      <AchievementSection icon={<FaCode />} title="2. Coding Achievements" description="Consistent practice and dedication to improve algorithmic thinking.">
        <GlassCard className="achievement-wide-card">
          <LogoMark type="leetcode" />
          <div>
            <h3>{achievements.coding.title}</h3>
            <strong>{achievements.coding.provider}</strong>
            <p>{achievements.coding.description}</p>
          </div>
          <div className="achievement-score">
            <strong>{achievements.coding.solved}</strong>
            <span>Problems Solved</span>
            <button type="button" disabled><FaCircleInfo /> Certificate / Proof Not Available</button>
          </div>
        </GlassCard>
      </AchievementSection>

      <AchievementSection icon={<FaTrophy />} title="3. Hackathons & Competitions" description="Participated in national level hackathons and ideathons to build innovative solutions and real-world impact.">
        {achievements.competitions.map((item) => (
          <GlassCard key={item.title} className="achievement-wide-card">
            <LogoMark type={item.logoType} />
            <div>
              <h3>{item.title} <span>{item.year}</span></h3>
              <strong>{item.provider}</strong>
              <p>{item.description}</p>
            </div>
            <div className="achievement-role">
              <FaCalendarDays />
              <span>Role</span>
              <strong>{item.role}</strong>
              {item.documentUrl ? (
                <a className="achievement-proof active" href={item.documentUrl} target="_blank" rel="noreferrer">
                  <FaCircleInfo /> View {item.documentLabel || "Proof"}
                </a>
              ) : (
                <button type="button" disabled><FaCircleInfo /> Certificate Not Available</button>
              )}
            </div>
          </GlassCard>
        ))}
      </AchievementSection>

      <GlassCard className="education-note">
        <FaCircleInfo />
        <p>Certificates and available proofs are public and can be viewed from the buttons provided.</p>
      </GlassCard>

      <section className="achievement-timeline-section">
        <h2>Achievement Timeline</h2>
        <div className="achievement-timeline-list">
          {timeline.map(([year, title, body]) => (
            <div className="achievement-timeline-item" key={`${year}-${title}`}>
              <span>{year}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
        <h2>Achievement Cards</h2>
        <div className="achievement-mini-grid">
          {cards.map(([title, body]) => (
            <GlassCard className="achievement-mini-card" key={title}>
              <FaCircleInfo />
              <h3>{title}</h3>
              <p>{body}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </section>
  );
}

function AchievementSection({ icon, title, description, children }) {
  return (
    <GlassCard className="achievement-section">
      <h2>{icon}{title}</h2>
      <p>{description}</p>
      <div className="achievement-section-list">{children}</div>
    </GlassCard>
  );
}

function CertificationCard({ item }) {
  return (
    <GlassCard className="certification-card">
      <LogoMark type={item.logoType} />
      <div className="certification-copy">
        <h3>{item.title} <span>{item.year}</span></h3>
        <strong>{item.provider}</strong>
        <p>{item.description}</p>
      </div>
      <div className="certification-skills">
        <strong>Key Skills</strong>
        <div>
          {item.skills.map((skill) => <span key={skill}><FaCircleCheck /> {skill}</span>)}
        </div>
        {item.documentUrl && (
          <a className="achievement-proof active" href={item.documentUrl} target="_blank" rel="noreferrer">
            <FaCircleInfo /> View {item.documentLabel || "Certificate"}
          </a>
        )}
      </div>
    </GlassCard>
  );
}

function LogoMark({ type }) {
  const logoMap = { redhat: redhatLogo, oracle: oracleLogo, sih: sihLogo, idea: ideaLogo };
  const altMap = {
    redhat: "Red Hat Logo",
    oracle: "Oracle Certification Logo",
    sih: "Smart India Hackathon Logo",
    idea: "Ideathon Logo",
  };

  if (logoMap[type]) {
    return (
      <div className={`achievement-logo-frame logo-${type}`}>
        <img src={logoMap[type]} alt={altMap[type] || `${type} logo`} className="achievement-logo-img" />
      </div>
    );
  }
  return (
    <div className={`achievement-logo-frame logo-${type}`}>
      <span className="achievement-logo-fallback">LC</span>
    </div>
  );
}

