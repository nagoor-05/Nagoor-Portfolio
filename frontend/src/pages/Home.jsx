import { useEffect, useState } from "react";
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
import { recordPortfolioView, trackEvent } from "../services/analyticsService";

export default function Home() {
  const { data } = usePortfolio();
  const { hero, socialLinks } = data;
  const resumeUrl = "/resume/nagoor_3.pdf";
  const [viewCount, setViewCount] = useState(hero.viewCount || 501);
  const typed = useTypewriter(hero.roles);

  useEffect(() => {
    let cancelled = false;
    const fallbackBase = Number(hero.viewCount || 501);
    const increaseLocalViewCount = () => {
      const stored = Number(localStorage.getItem("nagoor-local-view-count"));
      const next = Number.isFinite(stored) && stored > 0 ? stored + 1 : fallbackBase + 1;
      localStorage.setItem("nagoor-local-view-count", String(next));
      setViewCount(next);
    };
    recordPortfolioView()
      .then((result) => {
        if (cancelled) return;
        const apiViews = result?.views ?? result?.data?.views ?? result?.count ?? result?.data?.count;
        const nextViews = Number(apiViews);
        if (Number.isFinite(nextViews) && nextViews > 0) setViewCount(nextViews);
        else increaseLocalViewCount();
      })
      .catch(() => {
        if (!cancelled) increaseLocalViewCount();
      });
    return () => {
      cancelled = true;
    };
  }, [hero.viewCount]);

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
          <MagneticButton to={resumeUrl} className="ghost" onClick={() => trackEvent("resume_download", { page: "home" })}>
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
        <div className="views-pill" aria-label={`${viewCount} portfolio views`}>
          <span />
          <FaEye />
          <strong>{viewCount}</strong>
          <em>Views</em>
        </div>
      </motion.div>
      <motion.div className="hero-visual" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
        <Logo3D />
      </motion.div>
    </section>
  );
}
