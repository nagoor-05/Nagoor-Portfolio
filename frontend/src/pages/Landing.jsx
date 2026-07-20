import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ParticlesLayer from "../components/ParticlesLayer";
import Logo3D from "../components/Logo3D";
import { usePortfolio } from "../context/PortfolioContext";

export default function Landing({ onEnter }) {
  const { data } = usePortfolio();
  const { socialLinks } = data;
  return (
    <section className="landing">
      <ParticlesLayer />
      <div className="aurora one" />
      <div className="aurora two" />
      <div className="landing-monogram" aria-label="Nagoor">
        <span>N</span>
      </div>
      <Link className="landing-nav experience" to="/experience">Experience</Link>
      <Link className="landing-nav contact" to="/contact">Contact</Link>
      <Link className="landing-nav projects" to="/projects">Projects</Link>
      <Link className="landing-nav say-hi" to="/contact">Say hi..</Link>
      <Link className="landing-nav about" to="/about">About</Link>
      <Link className="landing-nav skills" to="/skills">My Skills</Link>
      <Link className="landing-nav articles" to="/achievements">Achievements</Link>
      <Link className="landing-nav resume" to="/resume">Resume</Link>
      <div className="landing-socials">
        {socialLinks.map(({ label, icon: Icon, url }) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon />
          </a>
        ))}
      </div>
      <motion.div
        className="landing-core"
        initial={{ opacity: 0, scale: 0.78, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Logo3D />
        <button onClick={onEnter} className="enter-button">
          <span>Click Here</span>
          <strong>Enter Portfolio</strong>
        </button>
      </motion.div>
    </section>
  );
}
