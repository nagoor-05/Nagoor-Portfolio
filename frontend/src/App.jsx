import { lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Preloader from "./components/Preloader";
import Landing from "./pages/Landing";
import AiCopilot from "./components/ai/AiCopilot";
import { usePortfolio } from "./context/PortfolioContext";
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

export default function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = usePortfolio();
  usePageTracking();

  useEffect(() => {
    applySeo(data.seo, location.pathname);
  }, [data.seo, location.pathname]);

  const speakWelcome = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(
      data.landing.voiceMessage
    );
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => voice.lang === "en-IN" && /natural|neerja|heera/i.test(voice.name)) ||
      voices.find((voice) => voice.lang === "en-IN") ||
      voices.find((voice) => /^en-(GB|US)/.test(voice.lang) && /natural|google|samantha|zira/i.test(voice.name)) ||
      voices.find((voice) => voice.lang.startsWith("en"));

    if (preferredVoice) message.voice = preferredVoice;
    message.rate = 0.92;
    message.pitch = 1;
    message.volume = 0.9;
    window.speechSynthesis.speak(message);
  };

  const enterPortfolio = async () => {
    speakWelcome();
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Browsers may deny fullscreen depending on user settings.
      }
    }
    setTimeout(() => navigate("/home"), 520);
  };

  const finishLoading = () => {
    setLoading(false);
    if (!["/", "/landing"].includes(location.pathname)) {
      navigate("/landing", { replace: true });
    }
  };

  if (loading) return <Preloader onDone={finishLoading} />;

  if (["/", "/landing"].includes(location.pathname)) {
    return <Landing onEnter={enterPortfolio} />;
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
          <Route path="/landing" element={<Landing onEnter={enterPortfolio} />} />
          <Route path="/home" element={<Home />} />
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
