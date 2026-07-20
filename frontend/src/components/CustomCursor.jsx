import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [point, setPoint] = useState({ x: -80, y: -80 });
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const move = (event) => {
      setPoint({ x: event.clientX, y: event.clientY });
      const target = event.target;
      setActive(Boolean(target?.closest?.("a, button, input, textarea, select, label, [role='button']")));
    };
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);
    window.addEventListener("pointermove", move);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${active ? "is-active" : ""} ${hidden ? "is-hidden" : ""}`}
      style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0)` }}
      aria-hidden="true"
    >
      <span />
    </div>
  );
}
