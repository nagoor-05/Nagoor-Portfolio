import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaCode,
  FaCogs,
  FaRocket,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import ParticlesLayer from "../components/ParticlesLayer";
import { useSound } from "../context/SoundContext";

const SLIDE_DURATION = 9000;

const slides = [
  {
    kind: "visit",
    title: ["THANK YOU"],
    kicker: "FOR VISITING",
    owner: "MOHAMMED NAGOOR MEERASHA",
    description: "Welcome to my digital universe.",
    traits: [
      { label: "DEVELOPER", icon: FaCode },
      { label: "AI ENTHUSIAST", icon: FaBrain },
      { label: "PROBLEM SOLVER", icon: FaRocket },
      { label: "LIFELONG LEARNER", icon: FaBullseye },
    ],
    quote: "Exploring ideas, building intelligent systems, and creating impact through technology.",
    footer: "LOADING EXPERIENCE",
  },
  {
    kind: "explore",
    title: ["EXPLORE MY", "DIGITAL UNIVERSE"],
    description:
      "Dive into a collection of projects, skills and experiences crafted with passion and purpose.",
    leftCards: [
      {
        title: "PROJECTS",
        text: "Real-world solutions built with modern technologies.",
        icon: FaCode,
      },
      {
        title: "INNOVATION",
        text: "Turning ideas into impactful and intelligent systems.",
        icon: FaRocket,
      },
    ],
    rightCards: [
      {
        title: "AI & AUTOMATION",
        text: "Exploring AI, ML and automation to solve real problems.",
        icon: FaBrain,
      },
      {
        title: "ABOUT ME",
        text: "My journey, values and vision for the future.",
        icon: FaUser,
      },
    ],
    quote: "The best way to predict the future is to build it.",
    quoteHighlight: "build it.",
    footer: "New ideas. Real solutions. Lasting impact. ✨",
  },
  {
    kind: "impact",
    title: ["BUILT TO SOLVE", "READY TO IMPACT"],
    description:
      "From intelligent systems to impactful solutions, I build with purpose and deliver with passion.",
    leftCards: [
      {
        title: "DEVELOP",
        text: "Clean code. Scalable solutions.",
        icon: FaCode,
      },
      {
        title: "INNOVATE",
        text: "New ideas. Smarter systems.",
        icon: FaRocket,
      },
      {
        title: "AUTOMATE",
        text: "Intelligent automation for real impact.",
        icon: FaBrain,
      },
    ],
    rightCards: [
      {
        title: "SOLVE",
        text: "Real problems. Practical solutions.",
        icon: FaBullseye,
      },
      {
        title: "COLLABORATE",
        text: "Better together. Stronger outcome.",
        icon: FaUsers,
      },
      {
        title: "GROW",
        text: "Keep learning. Keep scaling.",
        icon: FaChartLine,
      },
    ],
    quote: "The goal is not just to build projects, but to build a better tomorrow.",
    quoteHighlight: "better tomorrow.",
    footer: "Your journey. My code. Our impact. ✨",
  },
];

export default function Landing({ onFinishOnboarding }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { playMusic } = useSound();
  const slide = slides[activeSlide];

  // Global user interaction listener to attempt unlocking background music
  useEffect(() => {
    let unlocked = false;
    const unlockMusic = () => {
      if (unlocked) return;
      unlocked = true;
      void playMusic?.();
    };

    const events = ["pointerdown", "touchstart", "keydown", "click"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, unlockMusic, { passive: true })
    );

    return () =>
      events.forEach((eventName) =>
        window.removeEventListener(eventName, unlockMusic)
      );
  }, [playMusic]);

  // Automatic 9-second screen timer logic
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeSlide < slides.length - 1) {
        setActiveSlide((current) => current + 1);
        return;
      }

      onFinishOnboarding?.();
    }, SLIDE_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeSlide, onFinishOnboarding]);

  // Dev reset helper
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.resetPortfolioOnboarding = () => {
      window.sessionStorage.removeItem("portfolioOnboardingCompleted");
      window.sessionStorage.removeItem("portfolioEntryCompleted");
    };
    return () => {
      delete window.resetPortfolioOnboarding;
    };
  }, []);

  const centralLogo = useMemo(() => <NeonNLogo />, []);

  return (
    <section
      className="landing onboarding-page"
      aria-label="Nagoor portfolio introduction"
    >
      <ParticlesLayer />
      <div className="intro-network intro-network-left" aria-hidden="true" />
      <div className="intro-network intro-network-right" aria-hidden="true" />

      <AnimatePresence mode="wait">
        <motion.article
          key={activeSlide}
          className={`onboarding-card onboarding-${slide.kind}`}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.985 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <header className="onboarding-header">
            <h1 className="onboarding-title">
              {slide.title.map((line, idx) => (
                <span key={line} className={`title-line title-line-${idx}`}>
                  {line}
                </span>
              ))}
            </h1>
            <div className="onboarding-divider" aria-hidden="true">
              <span className="dot dot-left" />
              <span className="line" />
              <span className="dot dot-right" />
            </div>
            {slide.kicker ? (
              <p className="onboarding-kicker">{slide.kicker}</p>
            ) : null}
            {slide.description ? (
              <p className="onboarding-description">{slide.description}</p>
            ) : null}
          </header>

          {slide.kind === "visit" ? (
            <VisitSlide slide={slide} logo={centralLogo} />
          ) : (
            <UniverseSlide slide={slide} logo={centralLogo} />
          )}

          <footer className="onboarding-footer">
            <ProgressDots active={activeSlide} />
            <p className="onboarding-footer-text">{slide.footer}</p>
          </footer>
        </motion.article>
      </AnimatePresence>
    </section>
  );
}

function VisitSlide({ slide, logo }) {
  return (
    <div className="visit-slide-body">
      {logo}
      <div className="visit-owner">
        <strong>{slide.owner}</strong>
        <span>{slide.description}</span>
      </div>
      <div className="visit-traits">
        {slide.traits.map(({ label, icon: Icon }) => (
          <motion.div
            key={label}
            className="visit-trait"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </motion.div>
        ))}
      </div>
      <QuoteBox text={slide.quote} highlight={slide.quoteHighlight} />
    </div>
  );
}

function UniverseSlide({ slide, logo }) {
  return (
    <div
      className={`universe-slide-body ${
        slide.kind === "impact" ? "impact-slide-body" : ""
      }`}
    >
      <div className="universe-col universe-col-left">
        {slide.leftCards.map(({ title, text, icon: Icon }) => (
          <motion.div
            className="universe-mini-card"
            key={title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </motion.div>
        ))}
      </div>

      <div className="universe-col universe-col-center">{logo}</div>

      <div className="universe-col universe-col-right">
        {slide.rightCards.map(({ title, text, icon: Icon }) => (
          <motion.div
            className="universe-mini-card"
            key={title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </motion.div>
        ))}
      </div>

      <div className="universe-row-quote">
        <QuoteBox text={slide.quote} highlight={slide.quoteHighlight} />
      </div>
    </div>
  );
}

function QuoteBox({ text, highlight }) {
  let content = text;
  if (highlight && text.includes(highlight)) {
    const parts = text.split(highlight);
    content = (
      <>
        {parts[0]}
        <span className="quote-highlight">{highlight}</span>
        {parts[1]}
      </>
    );
  }

  return (
    <blockquote className="onboarding-quote">
      <FaCogs className="quote-icon" aria-hidden="true" />
      <p>“ {content} ”</p>
    </blockquote>
  );
}

function ProgressDots({ active }) {
  return (
    <div
      className="onboarding-dots"
      aria-label={`Introduction screen ${active + 1} of 3`}
    >
      {[0, 1, 2].map((index) => (
        <span key={index} className={active === index ? "active" : ""} />
      ))}
    </div>
  );
}

function NeonNLogo() {
  return (
    <div className="onboarding-n-scene" aria-hidden="true">
      <div className="orbit-ring orbit-one" />
      <div className="orbit-ring orbit-two" />
      <div className="orbit-ring orbit-three" />
      <div className="preloader-n-platform" />
      <div className="preloader-n-mark">
        <span className="n-pillar n-left" />
        <span className="n-pillar n-middle" />
        <span className="n-pillar n-right" />
      </div>
    </div>
  );
}

