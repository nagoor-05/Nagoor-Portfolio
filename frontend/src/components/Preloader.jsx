import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ParticlesLayer from "./ParticlesLayer";

const bootSteps = [
  ["boot", "Initializing..."],
  ["core", "Loading contents..."],
  ["ui", "Loading sections..."],
  ["img", "Loading images..."],
  ["ai", "Loading chatbox..."],
];

export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2400;
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const next = Math.min(100, Math.round(((now - start) / duration) * 100));
      setProgress(next);
      if (next < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 380);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const activeIndex = Math.min(bootSteps.length - 1, Math.floor((progress / 100) * bootSteps.length));

  return (
    <motion.div className="preloader" exit={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <ParticlesLayer />
      <div className="preloader-keywords" aria-hidden="true">
        <span>Developer Apps</span>
        <span>Web Apps</span>
        <span>React</span>
        <span>Python</span>
        <span>Database</span>
        <span>AI</span>
        <span>Design</span>
      </div>
      <div className="preloader-blur" />
      <div className="preloader-card">
        <div className="preloader-logo" aria-hidden="true">N</div>
        <h1>Mohammed Nagoor Meerasha</h1>
        <p className="preloader-subtitle">{progress >= 100 ? "Ready" : "Loading"}</p>

        <div className="loader-terminal" aria-live="polite">
          {bootSteps.map(([tag, label], index) => (
            <motion.div
              key={tag}
              className={index <= activeIndex ? "active" : ""}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: index <= activeIndex ? 1 : 0.35, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <span>[{tag}]</span> {label}
            </motion.div>
          ))}
        </div>

        <div className="loader-track">
          <motion.div className="loader-fill" animate={{ width: `${progress}%` }} />
        </div>
        <div className="loader-copy">
          <strong>{progress}%</strong>
          <span>{progress >= 100 ? "Ready" : "Loading"}</span>
        </div>
        <p className="preloader-footer">Nagoor Portfolio</p>
      </div>
    </motion.div>
  );
}
