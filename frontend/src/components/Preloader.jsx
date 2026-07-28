import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import ParticlesLayer from "./ParticlesLayer";
import { PreloaderScene } from "./PreloaderScene";
import "../styles.css";

const LOAD_DURATION = 7000;

export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(1);
  const completedRef = useRef(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let doneTimer = 0;

    const tick = (now) => {
      const next = Math.max(1, Math.min(100, Math.round(((now - start) / LOAD_DURATION) * 100)));
      setProgress(next);

      if (next < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!completedRef.current) {
        completedRef.current = true;
        doneTimer = window.setTimeout(() => onDone?.(), 460);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <section className="preloader-new" aria-label="Loading Nagoor portfolio">
      <ParticlesLayer />

      <div className="preloader-middle">
        <Canvas camera={{ position: [0, 0.35, 8.2], fov: 38 }} dpr={[1, 1.5]}>
          <PreloaderScene autoSpin freeRotate interactive />
        </Canvas>
      </div>

      <div className="preloader-bottom">
        <p className="preloader-brand">MOHAMMED NAGOOR MEERASHA</p>
        <div className="preloader-progress-container">
          <div className="preloader-progress-bar">
            <motion.div className="preloader-progress-fill" animate={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="preloader-percentage" aria-live="polite">{progress}%</p>
        <p className="preloader-loading-label">LOADING...</p>
      </div>
    </section>
  );
}
