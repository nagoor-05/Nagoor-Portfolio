import { FaDownload, FaFileLines, FaUpRightFromSquare } from "react-icons/fa6";
import MagneticButton from "../components/MagneticButton";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";

export default function Resume() {
  const { data } = usePortfolio();
  const { resume } = data;
  const resumeUrl = "/resume/General_Resume.pdf";

  return (
    <section className="shell page-pad resume-page">
      <PageTitle title={resume.title} description={resume.description} />

      <div className="resume-pdf-shell" aria-label="Resume PDF preview">
        <iframe src={`${resumeUrl}#toolbar=0&navpanes=0`} title="Mohammed Nagoor Meerasha resume PDF" />
      </div>

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
