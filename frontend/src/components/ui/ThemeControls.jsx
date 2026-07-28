import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Palette, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function ThemeControls() {
  const { groups, primaryId, primaryColor, secondaryColor, setPrimaryId } = useTheme();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const wrapRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const handlePointerMove = (event) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reducedMotion]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (wrapRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="global-system-hud" aria-label="System status">
        <span>SYS_ONLINE</span>
        <strong>{formatTime(now)}</strong>
        <em>{formatDate(now)}</em>
      </div>
      <div className="global-corner-hud global-corner-hud-top" aria-hidden="true" />
      <div className="global-corner-hud global-corner-hud-bottom" aria-hidden="true" />
      {!reducedMotion ? (
        <span
          className="global-cursor-glow"
          style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="theme-fab-wrap" ref={wrapRef}>
        <AnimatePresence>
          {open ? (
            <motion.div
              className="theme-panel"
              initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              role="dialog"
              aria-label="Portfolio color settings"
            >
              <div className="theme-panel-header">
                <div>
                  <span>Primary</span>
                  <strong>{primaryColor.label}</strong>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close color settings">
                  <X />
                </button>
              </div>
              {groups.map((group) => (
                <div className={`theme-color-group theme-color-group-${group.label.toLowerCase()}`} key={group.label}>
                  <span>{group.label}</span>
                  <div>
                    {group.colors.map((color) => {
                      const selected = color.id === primaryId;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          className={selected ? "selected" : ""}
                          style={{ "--swatch-color": color.value }}
                          onClick={() => setPrimaryId(color.id)}
                          aria-label={`Use ${color.label} as primary color`}
                          title={color.label}
                        >
                          {selected ? <Check /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="theme-secondary-chip">
                <span>Secondary</span>
                <strong style={{ color: secondaryColor }}>Soft Cyan</strong>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <motion.button
          type="button"
          className="theme-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close color settings" : "Open color settings"}
          aria-expanded={open}
          title={open ? "Close color settings" : "Open color settings"}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          whileHover={reducedMotion ? undefined : { scale: 1.08 }}
          whileTap={reducedMotion ? undefined : { scale: 0.92 }}
        >
          <Palette aria-hidden="true" />
          <span>Color settings</span>
        </motion.button>
      </div>
    </>
  );
}
