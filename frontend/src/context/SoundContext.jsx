import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const SoundContext = createContext(null);
const ENABLED_KEY = "nagoor-portfolio-sound-enabled";
const VOLUME_KEY = "nagoor-portfolio-volume";
const DEFAULT_VOLUME = 0.2;

function readStoredEnabled() {
  try {
    const saved = localStorage.getItem(ENABLED_KEY);
    return saved === null ? true : saved === "true";
  } catch {
    return true;
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
  const userWantedAudioRef = useRef(readStoredEnabled());
  const [volume, setVolumeState] = useState(readStoredVolume);
  const [isMuted, setIsMuted] = useState(() => !readStoredEnabled());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/portfolio-theme.mp3");
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.preload = "auto";
    audio.playsInline = true;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      audio.currentTime = 0;
      if (userWantedAudioRef.current) void audio.play().catch(() => {
        pendingPlayRef.current = true;
      });
    };
    const onError = () => {
      pendingPlayRef.current = false;
      setIsPlaying(false);
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
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
    userWantedAudioRef.current = true;
    pendingPlayRef.current = true;
    audio.muted = false;
    audio.volume = volume;
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
  }, [volume]);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    userWantedAudioRef.current = false;
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
      if (pendingPlayRef.current || userWantedAudioRef.current) void playMusic();
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
