import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaDownload,
  FaEnvelope,
  FaEye,
} from "react-icons/fa6";
import Logo3D from "../components/Logo3D";
import MagneticButton from "../components/MagneticButton";
import { useTypewriter } from "../utils/useTypewriter";
import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";

export default function Home() {
  const { data } = usePortfolio();
  const { hero, socialLinks } = data;
  const typed = useTypewriter(hero.roles);

  return (
    <section className="hero-section shell page-pad">
      <motion.div className="hero-copy" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
        <span className="pill">{hero.eyebrow}</span>
        <h1>
          {hero.firstName}
          <span>{hero.middleName}</span>
          <span>{hero.lastName}</span>
        </h1>
        <h2>{typed}<i /></h2>
        <p>
          {hero.description}
        </p>
        <div className="button-row">
          <MagneticButton to="/projects" onClick={() => trackEvent("cta_click", { page: "home", metadata: { target: "projects" } })}>
            View Projects <FaArrowRight />
          </MagneticButton>
          <MagneticButton to="/contact" className="ghost">
            <FaEnvelope /> Contact Me
          </MagneticButton>
          <MagneticButton to={data.resume.pdfUrl} className="ghost" onClick={() => trackEvent("resume_download", { page: "home" })}>
            <FaDownload /> Resume
          </MagneticButton>
        </div>
        <div className="current-row">
          <span>Currently</span>
          <strong>{hero.currentRole}</strong>
        </div>
        <div className="social-row">
          {socialLinks.map(({ label, icon: Icon, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              onClick={() => trackEvent("social_click", { page: "home", metadata: { label, url } })}
            >
              <Icon />
            </a>
          ))}
        </div>
        <div className="views-pill" aria-label={`${hero.viewCount || 501} portfolio views`}>
          <span />
          <FaEye />
          <strong>{hero.viewCount || 501}</strong>
          <em>Views</em>
        </div>
      </motion.div>
      <motion.div className="hero-visual" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
        <Logo3D />
      </motion.div>
    </section>
  );
}
