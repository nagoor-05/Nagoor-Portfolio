import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Layout";
import Preloader from "./components/Preloader";
import Landing from "./pages/Landing";
import AiCopilot from "./components/ai/AiCopilot";
import { usePortfolio } from "./context/PortfolioContext";
import { useSound } from "./context/SoundContext";
import { usePageTracking } from "./hooks/usePageTracking";

const PortfolioEntryScreen = lazy(() => import("./pages/PortfolioEntryScreen"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Education = lazy(() => import("./pages/Education"));
const Skills = lazy(() => import("./pages/Skills"));
const Experience = lazy(() => import("./pages/Experience"));
const Projects = lazy(() => import("./pages/Projects"));
const GitHubProfile = lazy(() => import("./pages/GitHubProfile"));
const Articles = lazy(() => import("./pages/Articles"));
const Achievements = lazy(() => import("./pages/Achievements"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Resume = lazy(() => import("./pages/Resume"));
const Contact = lazy(() => import("./pages/Contact"));

const ONBOARDING_COMPLETED_KEY = "portfolioOnboardingCompleted";
const ENTRY_COMPLETED_KEY = "portfolioEntryCompleted";
const WELCOME_SHOWN_KEY = "portfolioWelcomeShown";
const FULLSCREEN_PROMPTED_KEY = "portfolioFullscreenPrompted";
const FULLSCREEN_ACCEPTED_KEY = "portfolioFullscreenAccepted";
const WELCOME_MESSAGE = "Welcome to my universe. I hope you're doing well. Enjoy exploring my journey.";

function hasCompletedOnboarding() {
  return (
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true"
  );
}

function hasCompletedEntry() {
  return (
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(ENTRY_COMPLETED_KEY) === "true"
  );
}

function shouldShowInitialLoader() {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  return (pathname === "/" || pathname === "/landing") && !hasCompletedOnboarding() && !hasCompletedEntry();
}

function isFullscreenActive() {
  if (typeof document === "undefined") return false;
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function hasHandledFullscreenGate() {
  if (typeof window === "undefined") return true;
  return (
    window.sessionStorage.getItem(FULLSCREEN_PROMPTED_KEY) === "true" ||
    window.sessionStorage.getItem(FULLSCREEN_ACCEPTED_KEY) === "true"
  );
}

async function requestPortfolioFullscreen() {
  if (typeof document === "undefined") return false;
  if (isFullscreenActive()) return true;
  const target = document.documentElement;
  const requestFullscreen =
    target.requestFullscreen ||
    target.webkitRequestFullscreen ||
    target.msRequestFullscreen;

  if (!requestFullscreen) return false;
  await requestFullscreen.call(target);
  return true;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = usePortfolio();
  const { playMusic } = useSound();
  const [loading, setLoading] = useState(shouldShowInitialLoader);
  const [fullscreenPromptVisible, setFullscreenPromptVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const onboardingComplete = hasCompletedOnboarding();
  const entryComplete = hasCompletedEntry();
  usePageTracking();

  useEffect(() => {
    applySeo(data.seo, location.pathname);
  }, [data.seo, location.pathname]);

  const finishOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    }
    navigate("/entry");
  }, [navigate]);

  const enterPortfolio = useCallback(async () => {
    let shouldWelcome = false;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      window.sessionStorage.setItem(ENTRY_COMPLETED_KEY, "true");
      shouldWelcome = window.sessionStorage.getItem(WELCOME_SHOWN_KEY) !== "true";
      if (shouldWelcome) {
        window.sessionStorage.setItem(WELCOME_SHOWN_KEY, "true");
      }
    }
    await playMusic();
    if (shouldWelcome) {
      setWelcomeVisible(true);
      void speakWelcomeMessage().finally(() => {
        window.setTimeout(() => setWelcomeVisible(false), 600);
      });
    }
    navigate("/home");
  }, [navigate, playMusic]);

  useEffect(() => {
    if (!welcomeVisible) return undefined;
    const timer = window.setTimeout(() => setWelcomeVisible(false), 7000);
    return () => window.clearTimeout(timer);
  }, [welcomeVisible]);

  const finishLoading = useCallback(async () => {
    if (hasHandledFullscreenGate()) {
      setLoading(false);
      return;
    }

    try {
      const fullscreenStarted = await requestPortfolioFullscreen();
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          fullscreenStarted ? FULLSCREEN_ACCEPTED_KEY : FULLSCREEN_PROMPTED_KEY,
          "true"
        );
      }
      setLoading(false);
    } catch {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(FULLSCREEN_PROMPTED_KEY, "true");
      }
      setLoading(false);
      setFullscreenPromptVisible(true);
    }
  }, []);

  const handleFullscreenPromptEnter = useCallback(async () => {
    try {
      const fullscreenStarted = await requestPortfolioFullscreen();
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          fullscreenStarted ? FULLSCREEN_ACCEPTED_KEY : FULLSCREEN_PROMPTED_KEY,
          "true"
        );
      }
    } catch {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(FULLSCREEN_PROMPTED_KEY, "true");
      }
    } finally {
      setFullscreenPromptVisible(false);
    }
  }, []);

  if (loading) return <Preloader onDone={finishLoading} />;

  if (fullscreenPromptVisible) {
    return <FullscreenGate onEnter={handleFullscreenPromptEnter} />;
  }

  if (location.pathname === "/landing") {
    return <Landing onFinishOnboarding={finishOnboarding} />;
  }

  if (location.pathname === "/") {
    if (!onboardingComplete) {
      return <Landing onFinishOnboarding={finishOnboarding} />;
    }

    if (!entryComplete) {
      return <Navigate to="/entry" replace />;
    }

    return <Navigate to="/home" replace />;
  }

  if (location.pathname === "/entry") {
    return (
      <Suspense fallback={<div className="center-screen">Loading...</div>}>
        <PortfolioEntryScreen onEnter={enterPortfolio} />
      </Suspense>
    );
  }

  if (location.pathname === "/home" && !entryComplete) {
    return <Navigate to={onboardingComplete ? "/entry" : "/landing"} replace />;
  }

  if (data.unpublished) {
    return (
      <section className="shell page-pad">
        <div className="glass-card resume-card">
          <h1>Portfolio Unpublished</h1>
          <p>This portfolio is currently not available publicly.</p>
        </div>
      </section>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<Landing onFinishOnboarding={finishOnboarding} />} />
          <Route
            path="/entry"
            element={
              <Suspense fallback={<div className="center-screen">Loading...</div>}>
                <PortfolioEntryScreen onEnter={enterPortfolio} />
              </Suspense>
            }
          />
          <Route
            path="/home"
            element={entryComplete ? <Home /> : <Navigate to={onboardingComplete ? "/entry" : "/landing"} replace />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/education" element={<Education />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/github" element={<GitHubProfile />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AnimatePresence>
      <AiCopilot />
      <WelcomeToast visible={welcomeVisible} />
    </Layout>
  );
}

function FullscreenGate({ onEnter }) {
  return (
    <section className="fullscreen-gate" aria-labelledby="fullscreen-gate-title">
      <div className="fullscreen-gate-grid" aria-hidden="true" />
      <motion.div
        className="fullscreen-gate-card"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <span className="fullscreen-gate-orb" aria-hidden="true" />
        <p className="fullscreen-gate-kicker">Immersive Mode</p>
        <h1 id="fullscreen-gate-title">Enter Fullscreen</h1>
        <p>
          Open the portfolio in fullscreen for the cleanest cinematic experience.
          You can leave fullscreen anytime and the journey will continue normally.
        </p>
        <button type="button" className="fullscreen-gate-button" onClick={onEnter}>
          Enter Fullscreen
        </button>
      </motion.div>
    </section>
  );
}

function speakWelcomeMessage() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(WELCOME_MESSAGE);
  utterance.rate = 0.94;
  utterance.pitch = 1.02;
  utterance.volume = 0.82;
  return new Promise((resolve) => {
    const fallback = window.setTimeout(resolve, 5200);
    utterance.onend = () => {
      window.clearTimeout(fallback);
      resolve();
    };
    utterance.onerror = () => {
      window.clearTimeout(fallback);
      resolve();
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

function WelcomeToast({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="portfolio-welcome-toast"
          role="status"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <strong>Welcome to my universe.</strong>
          <span>I hope you're doing well. Enjoy exploring my journey.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function applySeo(seo = {}, pathname = "/") {
  const title = seo.title || "Mohammed Nagoor Meerasha | Cinematic Portfolio";
  const description =
    seo.description ||
    "Premium cinematic portfolio for Mohammed Nagoor Meerasha, an AI/ML learner and full stack developer.";
  const keywords = Array.isArray(seo.keywords) ? seo.keywords.join(", ") : seo.keywords || "";
  const canonicalUrl = seo.canonicalUrl || `${window.location.origin}${pathname}`;
  const previewImage = seo.socialPreviewImage || seo.openGraph?.image || "";

  document.title = title;
  setMeta("description", description);
  setMeta("keywords", keywords);
  setMeta("og:title", seo.openGraph?.title || title, "property");
  setMeta("og:description", seo.openGraph?.description || description, "property");
  setMeta("og:type", seo.openGraph?.type || "website", "property");
  setMeta("og:url", seo.openGraph?.url || canonicalUrl, "property");
  if (previewImage) setMeta("og:image", previewImage, "property");
  setMeta("twitter:card", seo.twitter?.card || "summary_large_image");
  setMeta("twitter:title", seo.twitter?.title || title);
  setMeta("twitter:description", seo.twitter?.description || description);
  if (previewImage) setMeta("twitter:image", seo.twitter?.image || previewImage);
  setCanonical(canonicalUrl);
  setStructuredData(seo.structuredData, seo, canonicalUrl);
}

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href) {
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function setStructuredData(data, seo, canonicalUrl) {
  const id = "portfolio-structured-data";
  document.getElementById(id)?.remove();
  if (!data || data.enabled === false) return;
  const schema = data.schema || data["@context"]
    ? data.schema || data
    : {
      "@context": "https://schema.org",
      "@type": data.type || "Person",
      name: data.name || "Mohammed Nagoor Meerasha",
      url: canonicalUrl,
      description: seo.description,
      image: seo.socialPreviewImage || seo.openGraph?.image || undefined,
      knowsAbout: Array.isArray(seo.keywords) ? seo.keywords : undefined,
    };
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
