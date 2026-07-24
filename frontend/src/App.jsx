import { lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Preloader from "./components/Preloader";
import Landing from "./pages/Landing";
import PortfolioEntryScreen from "./pages/PortfolioEntryScreen";
import AiCopilot from "./components/ai/AiCopilot";
import { usePortfolio } from "./context/PortfolioContext";
import { useSound } from "./context/SoundContext";
import { usePageTracking } from "./hooks/usePageTracking";

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

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = usePortfolio();
  const { playMusic } = useSound();
  const [loading, setLoading] = useState(() => !hasCompletedOnboarding() && !hasCompletedEntry());
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
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      window.sessionStorage.setItem(ENTRY_COMPLETED_KEY, "true");
    }
    await playMusic();
    navigate("/home");
  }, [navigate, playMusic]);

  const finishLoading = useCallback(() => {
    setLoading(false);
  }, []);

  if (loading) return <Preloader onDone={finishLoading} />;

  if (location.pathname === "/" || location.pathname === "/landing") {
    if (!onboardingComplete) {
      return <Landing onFinishOnboarding={finishOnboarding} />;
    }

    if (!entryComplete) {
      return <Navigate to="/entry" replace />;
    }

    return <Navigate to="/home" replace />;
  }

  if (location.pathname === "/entry") {
    if (entryComplete) {
      return <Navigate to="/home" replace />;
    }
    return <PortfolioEntryScreen onEnter={enterPortfolio} />;
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
            element={entryComplete ? <Navigate to="/home" replace /> : <PortfolioEntryScreen onEnter={enterPortfolio} />}
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
    </Layout>
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
