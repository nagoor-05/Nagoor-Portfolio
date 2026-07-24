import GlassCard from "../components/GlassCard";
import keinsLogo from "../assets/keins-school-logo.png";
import psgLogo from "../assets/logos/psg-itech.png";
import synecxLogo from "../assets/logos/synecx-ai-labs.png";
import tnGovtLogo from "../assets/logos/tamilnadu-govt.png";
import redhatLogo from "../assets/logos/redhat.png";
import oracleLogo from "../assets/logos/oracle-certified.jpg";

const educationCards = [
  {
    title: "B.E. Computer Science and Engineering",
    period: "2023 – 2027",
    institution: "PSG Institute of Technology and Applied Research",
    location: "Neelambur, Coimbatore",
    detail: "Final-Year CSE Student",
    description:
      "Core focus on computer science fundamentals, software engineering, artificial intelligence, database systems, and intelligent automation.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
  {
    title: "Higher Secondary Education (HSC)",
    period: "2022 – 2023",
    institution: "Keins Matric Higher Secondary School",
    location: "Tirunelveli, Tamil Nadu",
    detail: "Score: 555 / 600 (92.5%)",
    description:
      "Completed higher secondary education with strong performance in mathematics, physics, chemistry, and computer science.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
  },
  {
    title: "Secondary School Education (SSLC)",
    period: "2020 – 2021",
    institution: "Tamil Nadu State Board",
    location: "Tamil Nadu, India",
    detail: "Score: 100%",
    description:
      "Completed secondary school education with academic distinction under the state board evaluation process.",
    logo: tnGovtLogo,
    logoAlt: "Tamil Nadu Government State Board Logo",
  },
  {
    title: "AI / ML Engineering Internship",
    period: "2026 – Present",
    institution: "SynecX AI Labs",
    location: "Coimbatore, India",
    detail: "AI / ML Intern",
    description:
      "Gaining hands-on industry experience in Agentic AI workflows, intelligent automation, custom LLM agents, and full-stack software integration.",
    logo: synecxLogo,
    logoAlt: "SynecX AI Labs Logo",
  },
];

const professionalCertificates = [
  {
    title: "Red Hat System Administrator (RHCSA) Course",
    year: "2025",
    issuer: "PSG iTech",
    description:
      "Completed Linux system administration training with focus on users, permissions, networking, and services.",
    logo: redhatLogo,
    logoAlt: "Red Hat Logo",
    viewUrl: "/documents/certificates/redhat-certificate.png",
    downloadUrl: "/documents/certificates/redhat-certificate.png",
  },
  {
    title: "Oracle Cloud Infrastructure Foundations Associate",
    year: "2025",
    issuer: "Oracle",
    description:
      "Recognized for Oracle Cloud Infrastructure foundations covering core services, storage, networking, and security concepts.",
    logo: oracleLogo,
    logoAlt: "Oracle Certification Logo",
    viewUrl: "/documents/certificates/oracle-certificate.png",
    downloadUrl: "/documents/certificates/oracle-certificate.png",
  },
];

export default function Education() {
  return (
    <section className="shell page-pad education-page-v3">
      <header className="education-v3-header">
        <span className="education-kicker">[02] // ACADEMIC_FOUNDATION</span>
        <h1>Education & Background</h1>
        <p>
          My academic path and hands-on learning in Computer Science, Software Engineering, and Artificial Intelligence.
        </p>
      </header>

      <div className="education-grid-v3">
        {educationCards.map(
          ({ title, period, institution, location, detail, description, logo, logoAlt }) => (
            <GlassCard key={title} className="education-card-v3">
              <div className="education-card-header">
                <div className="education-logo-frame">
                  <img src={logo} alt={logoAlt} className="education-logo-img" />
                </div>
                <div className="education-card-meta">
                  <span className="education-badge">{period}</span>
                  <h2>{title}</h2>
                  <strong className="education-institution">{institution}</strong>
                  <span className="education-submeta">
                    {location} • {detail}
                  </span>
                </div>
              </div>
              <p className="education-description">{description}</p>
            </GlassCard>
          )
        )}
      </div>

      <section className="professional-certificates-section">
        <header className="professional-certificates-header">
          <span className="education-kicker">[03] // PROFESSIONAL_CERTIFICATES</span>
          <h2>Professional Certificates</h2>
        </header>

        <div className="professional-certificates-grid">
          {professionalCertificates.map(({ title, year, issuer, description, logo, logoAlt, viewUrl, downloadUrl }) => (
            <GlassCard key={title} className="professional-certificate-card">
              <div className="professional-certificate-top">
                <div className="professional-certificate-logo-frame">
                  <img src={logo} alt={logoAlt} className="professional-certificate-logo" />
                </div>
                <div className="professional-certificate-copy">
                  <h3>{title}</h3>
                  <div className="professional-certificate-meta">
                    <span>{year}</span>
                    <span>{issuer}</span>
                  </div>
                  <p>{description}</p>
                </div>
              </div>

              <div className="professional-certificate-actions">
                <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="professional-certificate-link">
                  View Certificate
                </a>
                <a href={downloadUrl} download className="professional-certificate-link secondary">
                  Download Certificate
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </section>
  );
}

