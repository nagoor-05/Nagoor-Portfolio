import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesLayer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 72, density: { enable: true, width: 1200, height: 900 } },
        color: { value: ["#ffffff", "#915EFF", "#00CEA8"] },
        links: {
          enable: true,
          distance: 145,
          color: "#915EFF",
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.62,
          outModes: { default: "bounce" },
          attract: { enable: true, rotateX: 800, rotateY: 1200 },
        },
        opacity: { value: { min: 0.28, max: 0.82 } },
        size: { value: { min: 1.2, max: 3.4 } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
          resize: { enable: true },
        },
        modes: {
          repulse: { distance: 105, duration: 0.25, speed: 0.7 },
          push: { quantity: 3 },
        },
      },
    }),
    []
  );

  if (!ready) return null;
  return <Particles id="particles" className="particles-layer" options={options} />;
}
