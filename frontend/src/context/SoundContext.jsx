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
const MUTED_KEY = "portfolioMusicMuted";
const VOLUME_KEY = "portfolioMusicVolume";
const PREVIOUS_VOLUME_KEY = "portfolioMusicPreviousVolume";
const DEFAULT_VOLUME = 0.5;

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
    if (saved === null || saved === "") return DEFAULT_VOLUME;
    const parsed = Number(saved);
    return Number.isFinite(parsed)
      ? Math.min(1, Math.max(0, parsed))
      : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function readStoredMuted() {
  try {
    const saved = localStorage.getItem(MUTED_KEY);
    return saved === "true";
  } catch {
    return false;
  }
}

function isAudioPlaying(audio) {
  return Boolean(audio && !audio.paused);
}

function isAudioMuted(audio) {
  return Boolean(!audio || audio.muted || audio.volume <= 0);
}

export function SoundProvider({ children }) {
  const audioRef = useRef(null);
  const userWantedAudioRef = useRef(readStoredEnabled());
  const mutedPreferenceRef = useRef(readStoredMuted());
  const previousVolumeRef = useRef(readStoredVolume() || DEFAULT_VOLUME);
  const unlockedRef = useRef(false);

  const [volume, setVolumeState] = useState(readStoredVolume);
  const [isMuted, setIsMuted] = useState(readStoredMuted);
  const [isPlaying, setIsPlaying] = useState(false);

  const syncStateFromAudio = useCallback(() => {
    const audio = audioRef.current;
    setIsPlaying(isAudioPlaying(audio));
    setIsMuted(isAudioMuted(audio));
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

    audio.defaultMuted = mutedPreferenceRef.current;
    audio.muted = mutedPreferenceRef.current || volume <= 0;
    const targetVol = volume > 0 ? volume : DEFAULT_VOLUME;
    audio.volume = Math.min(1, Math.max(0.01, targetVol));

    try {
      await audio.play();
      const playing = isAudioPlaying(audio);
      setIsPlaying(playing);
      setIsMuted(isAudioMuted(audio));
      if (playing) {
        unlockedRef.current = true;
      }
      return playing;
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
    setIsPlaying(false);
    setIsMuted(isAudioMuted(audio));
  }, []);

  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudioPlaying(audio)) {
      pauseMusic();
    } else {
      void playMusic();
    }
  }, [pauseMusic, playMusic]);

  const muteMusic = useCallback(() => {
    const audio = audioRef.current;
    mutedPreferenceRef.current = true;
    previousVolumeRef.current = volume > 0 ? volume : previousVolumeRef.current || DEFAULT_VOLUME;
    try {
      localStorage.setItem(MUTED_KEY, "true");
      localStorage.setItem(PREVIOUS_VOLUME_KEY, String(previousVolumeRef.current));
    } catch {
      // Ignore storage errors
    }
    if (!audio) {
      setIsMuted(true);
      return;
    }
    audio.muted = true;
    setIsMuted(true);
    setIsPlaying(isAudioPlaying(audio));
  }, [volume]);

  const unmuteMusic = useCallback(async () => {
    const audio = audioRef.current;
    mutedPreferenceRef.current = false;
    try {
      localStorage.setItem(MUTED_KEY, "false");
    } catch {
      // Ignore storage errors
    }
    if (!audio) return false;
    let nextVolume = volume;
    if (nextVolume <= 0) {
      try {
        const savedPrevious = Number(localStorage.getItem(PREVIOUS_VOLUME_KEY));
        nextVolume = Number.isFinite(savedPrevious) && savedPrevious > 0 ? savedPrevious : previousVolumeRef.current || DEFAULT_VOLUME;
      } catch {
        nextVolume = previousVolumeRef.current || DEFAULT_VOLUME;
      }
      nextVolume = Math.min(1, Math.max(0.01, nextVolume));
      setVolumeState(nextVolume);
      try {
        localStorage.setItem(VOLUME_KEY, String(nextVolume));
      } catch {
        // Ignore storage errors
      }
    }
    audio.muted = false;
    audio.volume = Math.max(0.01, nextVolume || DEFAULT_VOLUME);
    if (userWantedAudioRef.current && audio.paused) {
      return playMusic();
    }
    syncStateFromAudio();
    return true;
  }, [playMusic, syncStateFromAudio, volume]);

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
      if (valid > 0) {
        previousVolumeRef.current = valid;
        try {
          localStorage.setItem(PREVIOUS_VOLUME_KEY, String(valid));
        } catch {
          // Ignore storage errors
        }
      }

      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = valid;
      if (valid <= 0) {
        mutedPreferenceRef.current = true;
        try {
          localStorage.setItem(MUTED_KEY, "true");
        } catch {
          // Ignore storage errors
        }
        audio.muted = true;
        setIsMuted(true);
        setIsPlaying(isAudioPlaying(audio));
      } else {
        mutedPreferenceRef.current = false;
        try {
          localStorage.setItem(MUTED_KEY, "false");
        } catch {
          // Ignore storage errors
        }
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
    audio.muted = mutedPreferenceRef.current || volume <= 0;

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
      muteMusic,
      unmuteMusic,
    }),
    [isMuted, isPlaying, muteMusic, pauseMusic, playMusic, setVolume, toggleSound, unmuteMusic, volume]
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
