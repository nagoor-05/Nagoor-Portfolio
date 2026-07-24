import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ParticlesLayer from "./ParticlesLayer";

const LOAD_DURATION = 4200;

export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let doneTimer = 0;

    const tick = (now) => {
      const next = Math.min(100, Math.round(((now - start) / LOAD_DURATION) * 100));
      setProgress(next);

      if (next < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }

      doneTimer = window.setTimeout(() => onDone?.(), 460);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <motion.section
      className="preloader portfolio-preloader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-label="Loading Nagoor portfolio"
    >
      <ParticlesLayer />
      <div className="intro-network intro-network-left" aria-hidden="true" />
      <div className="intro-network intro-network-right" aria-hidden="true" />

      <motion.div
        className="preloader-stage-card"
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="preloader-name">
          <span>MOHAMMED</span>
          <span>NAGOOR</span>
          <span>MEERASHA</span>
        </h1>

        <div className="preloader-neon-line" aria-hidden="true" />
        <p className="preloader-message">Loading your digital universe...</p>

        <div className="preloader-logo-scene" aria-hidden="true">
          <div className="orbit-ring orbit-one" />
          <div className="orbit-ring orbit-two" />
          <div className="orbit-ring orbit-three" />
          <div className="preloader-n-platform" />
          <div className="preloader-n-mark">
            <span className="n-pillar n-left" />
            <span className="n-pillar n-middle" />
            <span className="n-pillar n-right" />
          </div>
        </div>

        <p className="preloader-brand">NAGOOR PORTFOLIO</p>
        <div className="preloader-progress-shell" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <motion.span animate={{ width: `${progress}%` }} transition={{ duration: 0.18 }} />
        </div>
        <strong className="preloader-percent">{progress}%</strong>
      </motion.div>
    </motion.section>
  );
}
