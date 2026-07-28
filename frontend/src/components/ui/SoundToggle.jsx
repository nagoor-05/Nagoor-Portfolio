import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { FaVolumeHigh, FaVolumeLow, FaVolumeXmark } from "react-icons/fa6";
import { useSound } from "../../context/SoundContext";

export default function SoundToggle() {
  const {
    isMuted,
    isPlaying,
    volume,
    playMusic,
    pauseMusic,
    muteMusic,
    unmuteMusic,
    setVolume,
  } = useSound();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const enabled = !isMuted && isPlaying;
  const label = open ? "Close sound controls" : "Open sound controls";
  const Icon = isMuted || volume <= 0 ? FaVolumeXmark : volume < 0.45 ? FaVolumeLow : FaVolumeHigh;

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

  const togglePlayback = () => {
    if (isPlaying) {
      pauseMusic?.();
    } else {
      void playMusic?.();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      void unmuteMusic?.();
    } else {
      muteMusic?.();
    }
  };

  return (
    <div className="sound-fab-wrap" ref={wrapRef}>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="sound-panel"
            initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-label="Background sound controls"
          >
            <div className="sound-panel-header">
              <span>Sound</span>
              <strong>{Math.round(volume * 100)}%</strong>
            </div>
            <div className="sound-panel-actions">
              <button type="button" className="sound-action" onClick={togglePlayback} aria-label={isPlaying ? "Pause background music" : "Play background music"}>
                {isPlaying ? <FaPause /> : <FaPlay />}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>
              <button type="button" className="sound-action" onClick={toggleMute} aria-label={isMuted ? "Unmute background music" : "Mute background music"}>
                {isMuted ? <FaVolumeXmark /> : <FaVolumeHigh />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>
            </div>
            <label className="sound-volume-control">
              <span>Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume?.(event.target.value)}
                aria-label="Background music volume"
              />
            </label>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        className={`sound-toggle ${enabled ? "enabled" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-label={label}
        aria-expanded={open}
        title={label}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        whileHover={reducedMotion ? undefined : { scale: 1.08 }}
        whileTap={reducedMotion ? undefined : { scale: 0.92 }}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </motion.button>
    </div>
  );
}
