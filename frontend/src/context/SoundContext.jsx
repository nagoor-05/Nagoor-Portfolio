import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SoundContext = createContext(null);

const ENABLED_KEY = "portfolioMusicEnabled";
const VOLUME_KEY = "portfolioMusicVolume";
const DEFAULT_VOLUME = 0.35;

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
    const saved = localStorage.getItem(VOLUME_KEY);
    const parsed = Number(saved);
    return Number.isFinite(parsed)
      ? Math.min(1, Math.max(0, parsed))
      : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function isAudible(audio) {
  return Boolean(audio && !audio.paused && !audio.muted && audio.volume > 0);
}

export function SoundProvider({ children }) {
  const audioRef = useRef(null);
  const userWantedAudioRef = useRef(readStoredEnabled());
  const unlockedRef = useRef(false);

  const [volume, setVolumeState] = useState(readStoredVolume);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const syncStateFromAudio = useCallback(() => {
    const audio = audioRef.current;
    const audible = isAudible(audio);
    setIsPlaying(audible);
    setIsMuted(!audible);
  }, []);

  const playMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    userWantedAudioRef.current = true;
    try {
      localStorage.setItem(ENABLED_KEY, "true");
    } catch {
      // Ignore storage errors in private modes
    }

    audio.defaultMuted = false;
    audio.muted = false;
    const targetVol = volume > 0 ? volume : DEFAULT_VOLUME;
    audio.volume = Math.min(1, Math.max(0.01, targetVol));

    try {
      await audio.play();
      const audible = isAudible(audio);
      setIsPlaying(audible);
      setIsMuted(!audible);
      if (audible) {
        unlockedRef.current = true;
      }
      return audible;
    } catch {
      setIsPlaying(false);
      setIsMuted(true);
      return false;
    }
  }, [volume]);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    userWantedAudioRef.current = false;
    try {
      localStorage.setItem(ENABLED_KEY, "false");
    } catch {
      // Ignore storage errors in private modes
    }

    if (!audio) return;
    audio.pause();
    audio.muted = true;
    setIsPlaying(false);
    setIsMuted(true);
  }, []);

  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudible(audio)) {
      pauseMusic();
    } else {
      void playMusic();
    }
  }, [pauseMusic, playMusic]);

  const setVolume = useCallback(
    (nextValue) => {
      const parsed = Number(nextValue);
      const valid = Number.isFinite(parsed)
        ? Math.min(1, Math.max(0, parsed))
        : DEFAULT_VOLUME;
      setVolumeState(valid);
      try {
        localStorage.setItem(VOLUME_KEY, String(valid));
      } catch {
        // Ignore storage errors
      }

      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = valid;
      if (valid <= 0) {
        audio.muted = true;
        setIsMuted(true);
        setIsPlaying(false);
      } else if (unlockedRef.current && userWantedAudioRef.current) {
        audio.muted = false;
        syncStateFromAudio();
      }
    },
    [syncStateFromAudio]
  );

  // Bind audio element lifecycle and state events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.volume = Math.max(0.01, volume || DEFAULT_VOLUME);

    const handleStateChange = () => syncStateFromAudio();
    const handleError = () => {
      setIsPlaying(false);
      setIsMuted(true);
    };

    audio.addEventListener("play", handleStateChange);
    audio.addEventListener("pause", handleStateChange);
    audio.addEventListener("volumechange", handleStateChange);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handleStateChange);
      audio.removeEventListener("pause", handleStateChange);
      audio.removeEventListener("volumechange", handleStateChange);
      audio.removeEventListener("error", handleError);
    };
  }, [syncStateFromAudio, volume]);

  // Handle first user interaction unlock listener
  useEffect(() => {
    const handleInteraction = async () => {
      if (unlockedRef.current) return;
      if (!userWantedAudioRef.current) return;

      const success = await playMusic();
      if (success) {
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("pointerdown", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      }
    };

    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [playMusic]);

  const value = useMemo(
    () => ({
      isMuted,
      isPlaying,
      volume,
      toggleSound,
      playMusic,
      pauseMusic,
      setVolume,
    }),
    [isMuted, isPlaying, pauseMusic, playMusic, setVolume, toggleSound, volume]
  );

  return (
    <SoundContext.Provider value={value}>
      <audio
        ref={audioRef}
        src="/sounds/portfolio-theme.mp3"
        loop
        preload="auto"
        aria-hidden="true"
      />
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used inside SoundProvider");
  }
  return context;
}

