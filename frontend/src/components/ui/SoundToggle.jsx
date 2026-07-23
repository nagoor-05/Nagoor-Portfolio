import { motion, useReducedMotion } from "framer-motion";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import { useSound } from "../../context/SoundContext";

export default function SoundToggle() {
  const { isMuted, isPlaying, toggleSound } = useSound();
  const reducedMotion = useReducedMotion();
  const enabled = !isMuted && isPlaying;
  const label = enabled ? "Disable background music" : "Enable background music";
  const Icon = enabled ? FaVolumeHigh : FaVolumeXmark;

  return (
    <motion.button
      type="button"
      className={`sound-toggle ${enabled ? "enabled" : ""}`}
      onClick={toggleSound}
      aria-label={label}
      title={label}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      whileHover={reducedMotion ? undefined : { scale: 1.08 }}
      whileTap={reducedMotion ? undefined : { scale: 0.92 }}
    >
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </motion.button>
  );
}
