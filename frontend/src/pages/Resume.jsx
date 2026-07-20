import { FaDownload, FaFileLines, FaUpRightFromSquare } from "react-icons/fa6";
import MagneticButton from "../components/MagneticButton";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";

export default function Resume() {
  const { data } = usePortfolio();
  const { resume, educations, experiences, projects, skillGroups, socialLinks, contact, about } = data;
  const resumeUrl = resume.pdfUrl;
  const educationItems = educations.slice(1, 4);
  const coreSkills = [...new Set(resume.coreSkills || [])];
  const programmingSkills = skillGroups
    .find((group) => group.title === "Programming Languages")
    ?.skills.map(([name]) => name) || ["C", "C++", "Java", "Python"];
  const webSkills = skillGroups
    .filter((group) => ["Frontend Development", "Backend", "Databases"].includes(group.title))
    .flatMap((group) => group.skills.map(([name]) => name));

  return (
    <section className="shell page-pad resume-page">
      <PageTitle title={resume.title} description={resume.description} />

      <article className="resume-sheet">
        <header className="resume-sheet-header">
          <h1>Mohammed Nagoor Meerasha</h1>
          <p>
            {contact.email} <span>|</span> AI / ML Intern <span>|</span> Full Stack Learner
          </p>
          <div>
            {socialLinks.slice(0, 2).map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
            ))}
          </div>
        </header>

        <ResumeSection title="Professional Summary">
          <p>{about.introduction}</p>
          <p>{about.careerGoal}</p>
        </ResumeSection>

        <ResumeSection title="Education">
          {educationItems.map((item) => (
            <ResumeRow
              key={item.title}
              title={item.title}
              meta={item.year}
              subtitle={item.subtitle}
              body={item.body}
            />
          ))}
        </ResumeSection>

        <ResumeSection title="Internships & Experience">
          {experiences.map((item) => (
            <ResumeRow
              key={item.role}
              title={item.role}
              meta={item.date}
              subtitle={item.organization}
              body={item.description}
              bullets={item.responsibilities?.slice(0, 3)}
            />
          ))}
        </ResumeSection>

        <ResumeSection title="Projects">
          {projects.slice(0, 4).map((project) => (
            <ResumeRow
              key={project.title}
              title={project.title}
              subtitle={`Tech Stack: ${project.tags.join(", ")}`}
              body={project.description}
            />
          ))}
        </ResumeSection>

        <div className="resume-two-column">
          <ResumeSection title="Technical Skills">
            <ul>
              <li><strong>Programming:</strong> {programmingSkills.join(", ")}</li>
              <li><strong>Web:</strong> {webSkills.slice(0, 8).join(", ")}</li>
              <li><strong>Tools:</strong> Git, GitHub, VS Code, Vercel</li>
              <li><strong>Core:</strong> {coreSkills.slice(0, 7).join(", ")}</li>
            </ul>
          </ResumeSection>
          <ResumeSection title="Area of Interest">
            <ul>
              <li>Data Structures & Algorithms</li>
              <li>Full Stack Development</li>
              <li>Artificial Intelligence & Machine Learning</li>
              <li>Software Engineering</li>
            </ul>
          </ResumeSection>
        </div>

        <ResumeSection title="Soft Skills">
          <ul>
            <li>Adaptability, consistency, problem-solving, and teamwork.</li>
            <li>Curious learner with interest in real-world project building.</li>
          </ul>
        </ResumeSection>
      </article>

      <div className="resume-actions-card">
        <FaFileLines className="resume-icon" />
        <h2>Full Resume</h2>
        <p>Open or download the complete PDF version.</p>
        <div className="button-row centered">
          <MagneticButton to={resumeUrl} onClick={() => trackEvent("resume_open", { page: "resume" })}><FaUpRightFromSquare /> Open Resume</MagneticButton>
          <MagneticButton to={resumeUrl} className="ghost" onClick={() => trackEvent("resume_download", { page: "resume" })}><FaDownload /> Download Resume</MagneticButton>
        </div>
      </div>
    </section>
  );
}

function ResumeSection({ title, children }) {
  return (
    <section className="resume-sheet-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ResumeRow({ title, meta, subtitle, body, bullets = [] }) {
  return (
    <div className="resume-row">
      <div className="resume-row-head">
        <h3>{title}</h3>
        {meta && <strong>{meta}</strong>}
      </div>
      {subtitle && <p className="resume-subtitle">{subtitle}</p>}
      {body && <p>{body}</p>}
      {bullets.length > 0 && (
        <ul>
          {bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
      )}
    </div>
  );
}
