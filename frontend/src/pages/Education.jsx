import { useState } from "react";
import GlassCard from "../components/GlassCard";
import keinsLogo from "../assets/keins-school-logo.png";
import psgLogo from "../assets/logos/psg-itech.png";
import tnGovtLogo from "../assets/logos/tamilnadu-govt.png";

const DOCUMENT_PASSWORD = "Nagoor@2005";

const summaryCards = [
  {
    title: "Higher Secondary Education (12th)",
    period: "2022 - 2023",
    institution: "Keins Matric Higher Secondary School",
    state: "Tamil Nadu State Board",
    detail: "Score: 555 / 600 - 92.5%",
    description:
      "Completed higher secondary education with strong performance in Mathematics and Computer Science.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
  },
  {
    title: "B.E. Computer Science & Engineering",
    period: "2023 - 2027",
    institution: "PSG Institute of Technology and Applied Research",
    state: "Coimbatore, Tamil Nadu",
    detail: "Current CGPA: 6.98 / 10",
    description:
      "Pursuing Computer Science and Engineering with completed semesters I to V.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
];

const journeyTimeline = [
  {
    year: "2005",
    title: "Born in Tirunelveli",
    subtitle: "Tirunelveli, Tamil Nadu, India",
    note: "Started my journey in Tirunelveli, where I developed curiosity for technology, problem-solving, and continuous learning.",
    logo: tnGovtLogo,
    logoAlt: "Tamil Nadu Government Logo",
  },
  {
    year: "2020 - 2021",
    title: "Secondary School Education",
    subtitle: "Tamil Nadu State Board - 100%",
    note: "Completed SSLC under the academic evaluation system followed during the COVID-19 period.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
  },
  {
    year: "2021 - 2022",
    title: "Higher Secondary First Year",
    subtitle: "Tamil Nadu Higher Secondary Education - 508 / 600 - 84.67%",
    note: "Strengthened my academic foundation in mathematics, science, logical reasoning, and problem-solving.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
  },
  {
    year: "2022 - 2023",
    title: "Higher Secondary",
    subtitle: "Tamil Nadu Higher Secondary Education - 555 / 600 - 92.5%",
    note: "Completed higher secondary education with strong performance and a growing interest in computer science and engineering.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
  },
  {
    year: "2023 - Present",
    title: "B.E. Computer Science and Engineering",
    subtitle: "PSG Institute of Technology and Applied Research - Neelambur, Coimbatore",
    note: "Pursuing Computer Science and Engineering while developing practical skills in programming, AI, databases, operating systems, computer networks, software engineering, and problem-solving.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
  {
    year: "2024",
    title: "Learning and Recovery Phase",
    subtitle: "Consistency Building",
    note: "Continued learning and skill development while managing personal challenges, strengthening discipline, patience, adaptability, and consistency.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
  {
    year: "2025",
    title: "Started Practical Development",
    subtitle: "Programming and Web Development",
    note: "Began building academic and real-world projects using Python, Java, C++, React, Node.js, Flask, databases, machine learning, and automation tools.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
  {
    year: "2026",
    title: "AI and Software Engineering Focus",
    subtitle: "Current Growth Phase",
    note: "Currently focused on Agentic AI, Machine Learning, Full-Stack Development, Data Structures and Algorithms, intelligent automation, and production-ready applications.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
  {
    year: "2027",
    title: "Expected Graduation",
    subtitle: "Software Engineering Path",
    note: "Expected to complete the B.E Computer Science and Engineering degree and begin a professional career in software engineering and intelligent systems development.",
    logo: psgLogo,
    logoAlt: "PSG Institute of Technology and Applied Research Logo",
  },
];

const schoolCertificates = [
  {
    title: "SSLC (10th Standard)",
    year: "2021",
    state: "Tamil Nadu State Board",
    school: "Keins Matric Higher Secondary School",
    stream: "",
    score: "100%",
    sentence: "Completed SSLC during the COVID-19 batch with a recorded percentage of 100%.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
    file: "/documents/education/sslc-certificate.png",
  },
  {
    title: "HSE First Year (11th Standard)",
    year: "2022",
    state: "Tamil Nadu State Board",
    school: "Keins Matric Higher Secondary School",
    stream: "Computer Science",
    score: "508 / 600 - 84.67%",
    sentence: "Completed 11th standard with 508 marks out of 600.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
    file: "/documents/education/hse-first-year.png",
  },
  {
    title: "HSE Second Year (12th Standard)",
    year: "2023",
    state: "Tamil Nadu State Board",
    school: "Keins Matric Higher Secondary School",
    stream: "Computer Science",
    score: "555 / 600 - 92.5%",
    sentence: "Completed 12th standard with 555 marks out of 600.",
    logo: keinsLogo,
    logoAlt: "Keins Matric Higher Secondary School Logo",
    file: "/documents/education/hse-second-year.png",
  },
];

const collegeRecord = {
  title: "B.E. Computer Science & Engineering",
  year: "2023 - 2027",
  institution: "PSG Institute of Technology and Applied Research",
  location: "Coimbatore, Tamil Nadu, India",
  cgpa: "6.98 / 10",
  sentence:
    "Pursuing Computer Science and Engineering with completed semesters I to V and focus on programming, databases, AI/ML, cybersecurity, distributed computing, NLP, deep learning, IoT, and software engineering.",
  logo: psgLogo,
  logoAlt: "PSG Institute of Technology and Applied Research Logo",
};

const semesterRecords = [
  { title: "Semester 1", date: "Dec 2023", gpa: "7.818", cgpa: "7.82", file: "/documents/education/semester-1-marksheet.png" },
  { title: "Semester 2", date: "May 2024", gpa: "6.957", cgpa: "7.38", file: "/documents/education/semester-2-marksheet.png" },
  { title: "Semester 3", date: "Nov 2024", gpa: "7.261", cgpa: "7.34", file: "/documents/education/semester-3-marksheet.png" },
  { title: "Semester 4", date: "May 2025", gpa: "5.643", cgpa: "7.05", file: "/documents/education/semester-4-marksheet.png" },
  { title: "Semester 5", date: "Nov 2025", gpa: "6.700", cgpa: "6.89", file: "/documents/education/semester-5-marksheet.png" },
  { title: "Semester 6", date: "May 2026", status: "Upcoming" },
  { title: "Semester 7", date: "Nov 2026", status: "Upcoming" },
  { title: "Semester 8", date: "May 2027", status: "Upcoming" },
];

export default function Education() {
  const [expanded, setExpanded] = useState(false);

  const guardedDocumentAction = (url, action) => {
    const entered = window.prompt("Password for View and Download");
    if (entered !== DOCUMENT_PASSWORD) {
      window.alert("Incorrect password.");
      return;
    }

    if (action === "download") {
      const link = document.createElement("a");
      link.href = url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="shell page-pad education-page-v3">
      <header className="education-v3-header">
        <span className="education-kicker">[02] // ACADEMIC_FOUNDATION</span>
        <h1>Education & Background</h1>
        <p>My academic path and hands-on learning in Computer Science, Software Engineering, and Artificial Intelligence.</p>
      </header>

      <div className="education-grid-v3 education-summary-two">
        {summaryCards.map((record) => (
          <GlassCard key={record.title} className="education-card-v3 education-summary-card">
            <div className="education-card-header">
              <div className="education-logo-frame">
                <img src={record.logo} alt={record.logoAlt} className="education-logo-img" />
              </div>
              <div className="education-card-meta">
                <span className="education-badge">{record.period}</span>
                <h2>{record.title}</h2>
                <strong className="education-institution">{record.institution}</strong>
                <span className="education-submeta">{record.state} - {record.detail}</span>
              </div>
            </div>
            <p className="education-description">{record.description}</p>
          </GlassCard>
        ))}
      </div>

      <div className="education-more-control">
        <button
          type="button"
          className="education-more-toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Click more"}
        </button>
      </div>

      {expanded && (
        <div className="education-more-panel education-expanded-premium">
          <section className="education-full-journey">
            <h2>Full Journey Timeline</h2>
            <div className="education-aligned-timeline">
              {journeyTimeline.map((item, index) => (
                <article
                  key={`${item.year}-${item.title}`}
                  className={`education-timeline-row ${index % 2 === 0 ? "is-left" : "is-right"}`}
                >
                  <div className="education-timeline-logo">
                    <img src={item.logo} alt={item.logoAlt} />
                  </div>
                  <div className="education-timeline-copy">
                    <span>{item.year}</span>
                    <h3>{item.title}</h3>
                    <strong>{item.subtitle}</strong>
                  </div>
                  <div className="education-timeline-node" aria-hidden="true" />
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="education-protected-certificates">
            <header className="professional-certificates-header">
              <span className="education-kicker">[03] // CERTIFICATES</span>
              <h2>Education & Certificates</h2>
              <p>Password for View and Download: {DOCUMENT_PASSWORD}</p>
            </header>

            <div className="education-certificate-list">
              {schoolCertificates.map((record) => (
                <CertificateRecord key={record.title} record={record} onDocumentAction={guardedDocumentAction} />
              ))}
              <CollegeRecord record={collegeRecord} />
              {semesterRecords.map((record) => (
                <SemesterRecord key={record.title} record={record} onDocumentAction={guardedDocumentAction} />
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function CertificateRecord({ record, onDocumentAction }) {
  return (
    <GlassCard className="education-protected-card education-record-card">
      <div className="education-protected-logo">
        <img src={record.logo} alt={record.logoAlt} />
      </div>
      <div className="education-protected-copy">
        <span>{record.year}</span>
        <h3>{record.title}</h3>
        <strong>{record.state}</strong>
        <p>School: {record.school}</p>
        {record.stream && <p>Stream: {record.stream}</p>}
        <p>Score: {record.score}</p>
        <p>{record.sentence}</p>
      </div>
      <div className="education-protected-actions">
        <em>Available</em>
        <button type="button" onClick={() => onDocumentAction(record.file, "view")}>View Certificate</button>
        <button type="button" onClick={() => onDocumentAction(record.file, "download")}>Download Certificate</button>
      </div>
    </GlassCard>
  );
}

function CollegeRecord({ record }) {
  return (
    <GlassCard className="education-protected-card education-record-card education-college-record">
      <div className="education-protected-logo">
        <img src={record.logo} alt={record.logoAlt} />
      </div>
      <div className="education-protected-copy">
        <span>{record.year}</span>
        <h3>{record.title}</h3>
        <strong>{record.institution}</strong>
        <p>{record.location}</p>
        <p>Current CGPA: {record.cgpa}</p>
        <p>{record.sentence}</p>
      </div>
      <div className="education-protected-actions">
        <em>Ongoing</em>
      </div>
    </GlassCard>
  );
}

function SemesterRecord({ record, onDocumentAction }) {
  const upcoming = record.status === "Upcoming";
  return (
    <GlassCard className={`education-protected-card education-record-card ${upcoming ? "is-upcoming" : ""}`}>
      <div className="education-protected-logo">
        <img src={psgLogo} alt="PSG Institute of Technology and Applied Research Logo" />
      </div>
      <div className="education-protected-copy">
        <span>{record.date}</span>
        <h3>{record.title}</h3>
        {upcoming ? (
          <p>Status: Upcoming</p>
        ) : (
          <>
            <strong>PSG iTech</strong>
            <p>GPA / SGPA: {record.gpa}</p>
            <p>CGPA: {record.cgpa}</p>
          </>
        )}
      </div>
      <div className="education-protected-actions">
        <em>{upcoming ? "Upcoming" : "Available"}</em>
        {upcoming ? (
          <>
            <button type="button" disabled>Upcoming</button>
            <button type="button" disabled>Upcoming</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => onDocumentAction(record.file, "view")}>View Marksheet</button>
            <button type="button" onClick={() => onDocumentAction(record.file, "download")}>Download Marksheet</button>
          </>
        )}
      </div>
    </GlassCard>
  );
}
