import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const SoundContext = createContext(null);
const ENABLED_KEY = "nagoor-portfolio-sound-enabled";
const VOLUME_KEY = "nagoor-portfolio-volume";
const DEFAULT_VOLUME = 0.2;

function readStoredEnabled() {
  try {
    return localStorage.getItem(ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function readStoredVolume() {
  try {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function SoundProvider({ children }) {
  const audioRef = useRef(null);
  const pendingPlayRef = useRef(false);
  const [volume, setVolumeState] = useState(readStoredVolume);
  const [isMuted, setIsMuted] = useState(() => !readStoredEnabled());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/portfolio-theme.mp3");
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const playMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    audio.muted = false;
    try {
      await audio.play();
      pendingPlayRef.current = false;
      setIsMuted(false);
      setIsPlaying(true);
      localStorage.setItem(ENABLED_KEY, "true");
      return true;
    } catch {
      pendingPlayRef.current = true;
      setIsPlaying(false);
      return false;
    }
  }, []);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    setIsMuted(true);
    pendingPlayRef.current = false;
    localStorage.setItem(ENABLED_KEY, "false");
  }, []);

  const toggleSound = useCallback(() => {
    if (isMuted || !isPlaying) {
      playMusic();
    } else {
      pauseMusic();
    }
  }, [isMuted, isPlaying, pauseMusic, playMusic]);

  const setVolume = useCallback((nextValue) => {
    const next = Math.min(1, Math.max(0, Number(nextValue) || 0));
    setVolumeState(next);
    try {
      localStorage.setItem(VOLUME_KEY, String(next));
    } catch {
      // Storage can be unavailable in private browsing.
    }
  }, []);

  useEffect(() => {
    if (!readStoredEnabled()) return undefined;
    pendingPlayRef.current = true;
    const resumeOnInteraction = () => {
      if (pendingPlayRef.current) playMusic();
    };
    window.addEventListener("pointerdown", resumeOnInteraction, { once: true });
    window.addEventListener("keydown", resumeOnInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resumeOnInteraction);
      window.removeEventListener("keydown", resumeOnInteraction);
    };
  }, [playMusic]);

  const value = useMemo(() => ({
    isMuted,
    isPlaying,
    volume,
    toggleSound,
    playMusic,
    pauseMusic,
    setVolume,
  }), [isMuted, isPlaying, pauseMusic, playMusic, setVolume, toggleSound, volume]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used inside SoundProvider");
  }
  return context;
}
