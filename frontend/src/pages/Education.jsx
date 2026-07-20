import {
  FaBaby,
  FaBriefcase,
  FaBrain,
  FaCode,
  FaDownload,
  FaEye,
  FaGraduationCap,
  FaCircleInfo,
  FaCheck,
  FaCalendarDays,
  FaHeartPulse,
  FaLandmark,
  FaLocationDot,
  FaLock,
  FaRocket,
} from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import keinsLogo from "../assets/keins-school-logo.png";
import psgLogo from "../assets/logos/psg-itech.png";
import govtLogo from "../assets/logos/tamilnadu-govt.png";

const EDUCATION_DOCUMENT_PASSWORD = "Nagoor@2005";

const journeyNotes = [
  "Started my journey in Tirunelveli, where I developed curiosity for technology, problem-solving, and continuous learning.",
  "Completed Higher Secondary education with strong academic performance. Built a solid foundation in Mathematics, Computer Science, logical thinking, and analytical problem-solving.",
  "Pursuing Computer Science and Engineering while exploring software development, data structures, algorithms, AI/ML, and modern technologies through continuous learning and projects.",
  "Faced personal and physical challenges that required recovery and adaptation. Continued learning gradually and strengthened the determination to improve and move forward.",
  "Began actively learning programming, web development, Java, C++, and software engineering concepts with focus on fundamentals, consistency, and practical projects.",
  "Currently focused on Full Stack Development, Artificial Intelligence, Machine Learning, Data Structures & Algorithms, and real-world project development.",
  "Expected to complete B.E Computer Science and Engineering while preparing for software engineering roles and building scalable, impactful software solutions.",
];

const journeyDetails = [
  ["Tirunelveli, Tamil Nadu, India"],
  ["Keins Matric Higher Secondary School", "Mathematics & Computer Science • 92.5%", "Tirunelveli, Tamil Nadu"],
  ["PSG Institute of Technology and Applied Research", "CGPA: 7.1", "Coimbatore, Tamil Nadu"],
  ["Consistency Building"],
  ["Programming & Web Development"],
  ["Current Growth Phase"],
  ["Software Engineering Path"],
];

const journeyIcons = [FaBaby, FaGraduationCap, FaLandmark, FaHeartPulse, FaCode, FaBrain, FaBriefcase];
const noteIcons = [FaRocket, FaCheck, FaCode, FaHeartPulse, FaCode, FaBrain, FaBriefcase];

export default function Education() {
  const { data } = usePortfolio();
  const education = data.educationCertificates;
  const journey = data.educations || [];

  return (
    <section className="shell page-pad education-page">
      <div className="education-journey-hero">
        <span>HELLO THERE</span>
        <h1>Education & Journey</h1>
        <p>
          Mohammed Nagoor Meerasha — Computer Science Engineering Student passionate about Full Stack
          Development, AI/ML, Java, C++, and modern web technologies.
        </p>
      </div>

      <div className="education-premium-timeline">
        {journey.map((item, index) => (
          <div key={item.title} className="education-premium-row">
            <div className="education-premium-icon">
              {(() => {
                const Icon = journeyIcons[index] || FaGraduationCap;
                return <Icon />;
              })()}
            </div>
            <div className="education-premium-left">
              <span>{item.year.replace(" - ", "–")}</span>
              <h3>{item.title}</h3>
              {journeyDetails[index]?.map((detail, detailIndex) => (
                <strong key={detail} className={detailIndex === journeyDetails[index].length - 1 && index < 3 ? "with-location" : ""}>
                  {detailIndex === journeyDetails[index].length - 1 && index < 3 && <FaLocationDot />}
                  {detail}
                </strong>
              ))}
            </div>
            <div className="education-premium-dot" />
            <GlassCard className="education-premium-note">
              {(() => {
                const Icon = noteIcons[index] || FaRocket;
                return <Icon />;
              })()}
              <p>{journeyNotes[index] || item.body}</p>
            </GlassCard>
          </div>
        ))}
      </div>

      <PageTitle
        eyebrow="Academic Records"
        title={education.title}
        description={education.description}
      />

      <EducationGroup title="School & Board Certificates" icon={<FaGraduationCap />}>
        {education.schoolRecords.map((record) => (
          <EducationRecord key={`${record.year}-${record.title}`} item={record} />
        ))}
      </EducationGroup>

      <EducationGroup title="Bachelor of Engineering" icon={<FaGraduationCap />}>
        <DegreeRecord degree={education.degree} />
      </EducationGroup>

      <EducationGroup title="Semester-wise Academic Records" icon={<FaCalendarDays />}>
        {education.semesters.map((semester) => (
          <SemesterRecord key={semester.title} item={semester} />
        ))}
      </EducationGroup>

      <GlassCard className="education-note">
        <FaCircleInfo />
        <p>
          Education certificates and marksheets are password protected. Enter the correct password to view or download.
        </p>
      </GlassCard>
    </section>
  );
}

function EducationGroup({ title, icon, children }) {
  return (
    <div className="education-group">
      <h2>{icon}{title}</h2>
      <div className="education-timeline-list">{children}</div>
    </div>
  );
}

function EducationRecord({ item }) {
  return (
    <GlassCard className="education-record">
      <LogoBadge item={item} />
      <div className="education-node" />
      <div className="education-record-body">
        <span className="record-year">{item.year}</span>
        <h3>{item.title}</h3>
        <strong>{item.organization}</strong>
        {item.school && <p className="record-sub">School: {item.school}</p>}
        {item.score && <p className="record-score">Score: {item.score}</p>}
        {item.stream && <p className="record-score">Stream: {item.stream}</p>}
        <p>{item.description}</p>
      </div>
      <DocumentActions item={item} />
    </GlassCard>
  );
}

function DegreeRecord({ degree }) {
  return (
    <GlassCard className="education-record degree-record">
      <LogoBadge item={degree} caption="PSG iTech" />
      <div className="education-node" />
      <div className="education-record-body">
        <span className="record-year">{degree.year}</span>
        <h3>{degree.title}</h3>
        <strong>{degree.organization}</strong>
        <p className="record-sub">{degree.location}</p>
        <p className="record-score">Current CGPA: {degree.currentCgpa}</p>
        <p>{degree.description}</p>
      </div>
      <div className="education-key-areas">
        <strong>Key Academic Areas</strong>
        {degree.areas.map((area) => <span key={area}><FaCheck /> {area}</span>)}
      </div>
    </GlassCard>
  );
}

function SemesterRecord({ item }) {
  return (
    <GlassCard className="education-record semester-record">
      <LogoBadge item={{ logoType: "psg", title: item.title }} caption="PSG iTech" />
      <div className="education-node" />
      <div className="education-record-body">
        <div className="semester-title-row">
          <h3>{item.title}</h3>
          <span><FaCalendarDays /> {item.date}</span>
        </div>
        <p className="record-score">CGPA: {item.cgpa}</p>
        {item.cumulativeCgpa && <p className="record-score">Cumulative CGPA: {item.cumulativeCgpa}</p>}
        {item.credits && <p className="record-sub">Cumulative Credits: {item.credits}</p>}
        <p className="record-sub">Status: {item.status}</p>
        <p className="semester-subjects">
          <strong>Subjects:</strong> {item.subjects.join(" • ")}
        </p>
      </div>
      <DocumentActions item={item} compact />
    </GlassCard>
  );
}

function LogoBadge({ item, caption }) {
  if (item.logoType === "keins") {
    return (
      <div className="education-logo-wrap">
        <img src={keinsLogo} alt="Keins Matric Higher Secondary School logo" />
      </div>
    );
  }
  const logoMap = {
    psg: psgLogo,
    govt: govtLogo,
  };
  if (logoMap[item.logoType]) {
    return (
      <div className="education-logo-wrap">
        <img src={logoMap[item.logoType]} alt={`${item.title || item.logoType} logo`} />
        {caption && <small>{caption}</small>}
      </div>
    );
  }
  return (
    <div className={`education-logo-wrap logo-${item.logoType || "default"}`}>
      <span>{item.initials || logoText(item.logoType, item.title)}</span>
      {caption && <small>{caption}</small>}
    </div>
  );
}

function logoText(type, title = "") {
  const map = { psg: "PSG", redhat: "RH", oracle: "OCI", sih: "SIH", idea: "ID" };
  return map[type] || title.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function DocumentActions({ item, compact = false }) {
  const publicDocument = item.visibility === "public_document" && item.documentUrl;
  const docLabel = item.documentLabel || "Certificate";
  const viewLabel = publicDocument ? `View ${docLabel}` : "Document Pending";
  const downloadLabel = publicDocument ? `Download ${docLabel}` : "Coming Soon";

  const verifyPassword = () => {
    const password = window.prompt("Enter password to access this education document");
    if (password === null) return false;
    if (password === EDUCATION_DOCUMENT_PASSWORD) return true;
    window.alert("Incorrect password. Please try again.");
    return false;
  };

  const handleView = () => {
    if (!publicDocument || !verifyPassword()) return;
    window.open(item.documentUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    if (!publicDocument || !verifyPassword()) return;
    const link = document.createElement("a");
    link.href = item.documentUrl;
    link.download = item.documentUrl.split("/").pop() || docLabel;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`education-actions ${compact ? "compact" : ""}`}>
      {publicDocument ? (
        <>
          <button type="button" onClick={handleView}>
            <FaLock /> <FaEye /> {viewLabel}
          </button>
          <button type="button" onClick={handleDownload}>
            <FaLock /> <FaDownload /> {downloadLabel}
          </button>
        </>
      ) : (
        <>
          <button type="button" disabled><FaEye /> {viewLabel}</button>
          <button type="button" disabled><FaDownload /> {downloadLabel}</button>
        </>
      )}
    </div>
  );
}
