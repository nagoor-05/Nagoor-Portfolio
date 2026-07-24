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
  const pendingPlayRef = useRef(userWantedAudioRef.current);
  const hasUserInteractionRef = useRef(false);
  const [volume, setVolumeState] = useState(readStoredVolume);
  const [isMuted, setIsMuted] = useState(() => !readStoredEnabled());
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
    pendingPlayRef.current = true;
    audio.defaultMuted = false;
    audio.muted = false;
    audio.volume = Math.max(0.01, volume || DEFAULT_VOLUME);

    try {
      await audio.play();
      pendingPlayRef.current = false;
      setIsMuted(false);
      setIsPlaying(isAudible(audio));
      localStorage.setItem(ENABLED_KEY, "true");
      localStorage.setItem(VOLUME_KEY, String(audio.volume));
      return true;
    } catch {
      pendingPlayRef.current = true;
      setIsPlaying(false);
      setIsMuted(true);
      return false;
    }
  }, [volume]);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    userWantedAudioRef.current = false;
    pendingPlayRef.current = false;
    audio.pause();
    audio.muted = true;
    setIsPlaying(false);
    setIsMuted(true);
    localStorage.setItem(ENABLED_KEY, "false");
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
      const next = Math.min(1, Math.max(0, Number(nextValue) || 0));
      setVolumeState(next);

      const audio = audioRef.current;
      if (audio) {
        audio.volume = next;
        if (next <= 0) {
          audio.muted = true;
        } else if (userWantedAudioRef.current && hasUserInteractionRef.current) {
          audio.muted = false;
        }
        syncStateFromAudio();
      }

      try {
        localStorage.setItem(VOLUME_KEY, String(next));
      } catch {
        // Storage can be unavailable in private modes.
      }
    },
    [syncStateFromAudio]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.volume = Math.max(0.01, volume || DEFAULT_VOLUME);
    audio.muted = true;
    audio.defaultMuted = true;

    const handleStateChange = () => syncStateFromAudio();
    const handleError = () => {
      pendingPlayRef.current = false;
      setIsPlaying(false);
      setIsMuted(true);
    };

    audio.addEventListener("play", handleStateChange);
    audio.addEventListener("pause", handleStateChange);
    audio.addEventListener("volumechange", handleStateChange);
    audio.addEventListener("error", handleError);
    audio.load();

    return () => {
      audio.removeEventListener("play", handleStateChange);
      audio.removeEventListener("pause", handleStateChange);
      audio.removeEventListener("volumechange", handleStateChange);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, [syncStateFromAudio, volume]);

  useEffect(() => {
    const unlockAudio = () => {
      hasUserInteractionRef.current = true;
      if (userWantedAudioRef.current || pendingPlayRef.current) {
        void playMusic();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
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
