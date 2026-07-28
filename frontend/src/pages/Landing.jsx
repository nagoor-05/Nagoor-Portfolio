import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaCode,
  FaQuoteLeft,
  FaRocket,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import ParticlesLayer from "../components/ParticlesLayer";
import Logo3D from "../components/Logo3D";

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
      { title: "PROJECTS", text: "Real-world solutions built with modern technologies.", icon: FaCode },
      { title: "INNOVATION", text: "Turning ideas into impactful and intelligent systems.", icon: FaRocket },
    ],
    rightCards: [
      { title: "AI & AUTOMATION", text: "Exploring AI, ML and automation to solve real problems.", icon: FaBrain },
      { title: "ABOUT ME", text: "My journey, values and vision for the future.", icon: FaUser },
    ],
    quote: "The best way to predict the future is to build it.",
    quoteHighlight: "build it.",
    footer: "New ideas. Real solutions. Lasting impact.",
  },
  {
    kind: "impact",
    title: ["BUILT TO SOLVE", "READY TO IMPACT"],
    description:
      "From intelligent systems to impactful solutions, I build with purpose and deliver with passion.",
    leftCards: [
      { title: "DEVELOP", text: "Clean code.\nScalable solutions.", icon: FaCode },
      { title: "INNOVATE", text: "New ideas.\nSmarter systems.", icon: FaRocket },
      { title: "AUTOMATE", text: "Intelligent automation\nfor real impact.", icon: FaBrain },
    ],
    rightCards: [
      { title: "SOLVE", text: "Real problems.\nPractical solutions.", icon: FaBullseye },
      { title: "COLLABORATE", text: "Better together.\nStronger outcome.", icon: FaUsers },
      { title: "GROW", text: "Keep learning.\nKeep scaling.", icon: FaChartLine },
    ],
    quote: "The goal is not just to build projects, but to build a better tomorrow.",
    quoteHighlight: "better tomorrow.",
    footer: "Your journey. My code. Our impact.",
  },
];

export default function Landing({ onFinishOnboarding }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const finishRef = useRef(false);
  const slide = slides[activeSlide];

  useEffect(() => {
    window.sessionStorage.setItem("portfolioOnboardingSlide", String(activeSlide));
  }, [activeSlide]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.resetPortfolioOnboarding = () => {
      window.sessionStorage.removeItem("portfolioOnboardingCompleted");
      window.sessionStorage.removeItem("portfolioEntryCompleted");
      window.sessionStorage.removeItem("portfolioOnboardingSlide");
    };
    return () => {
      delete window.resetPortfolioOnboarding;
    };
  }, []);

  const centralLogo = useMemo(() => <Logo3D compact autoSpin freeRotate />, []);
  const visitLogo = useMemo(() => <Logo3D compact autoSpin freeRotate />, []);
  const goNext = () => {
    setActiveSlide((current) => {
      if (current < slides.length - 1) return current + 1;
      if (!finishRef.current) {
        finishRef.current = true;
        onFinishOnboarding?.();
      }
      return current;
    });
  };

  return (
    <section className="landing onboarding-page" aria-label="Nagoor portfolio introduction">
      <ParticlesLayer />
      <div className="intro-network intro-network-left" aria-hidden="true" />
      <div className="intro-network intro-network-right" aria-hidden="true" />

      <motion.article
        key={activeSlide}
        className={`onboarding-card onboarding-${slide.kind}`}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <header className="onboarding-header">
          {activeSlide > 0 ? <SmallDivider /> : null}
          <h1 className="onboarding-title">
            {slide.title.map((line, idx) => (
              <span key={line} className={`title-line title-line-${idx}`}>
                {line}
              </span>
            ))}
          </h1>
          {slide.kicker ? (
            <div className="onboarding-kicker-row">
              <span />
              <p className="onboarding-kicker">{slide.kicker}</p>
              <span />
            </div>
          ) : null}
          {slide.description && slide.kind !== "visit" ? (
            <p className="onboarding-description">{slide.description}</p>
          ) : null}
        </header>

        {slide.kind === "visit" ? (
          <VisitSlide slide={slide} logo={visitLogo} />
        ) : (
          <UniverseSlide slide={slide} logo={centralLogo} />
        )}

        <footer className="onboarding-footer">
          <ProgressDots active={activeSlide} />
          <button type="button" className="onboarding-next-button" onClick={goNext}>
            Next
          </button>
          <p className="onboarding-footer-text">{slide.footer}</p>
        </footer>
      </motion.article>
    </section>
  );
}

function SmallDivider() {
  return (
    <div className="onboarding-top-divider" aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  );
}

function VisitSlide({ slide, logo }) {
  return (
    <div className="visit-slide-body">
      <div className="visit-logo-shell">
        {logo}
      </div>
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
            transition={{ duration: 0.45 }}
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
    <div className={`universe-slide-body ${slide.kind === "impact" ? "impact-slide-body" : ""}`}>
      <div className="universe-col universe-col-left">
        {slide.leftCards.map((card) => (
          <MiniCard key={card.title} card={card} direction="left" />
        ))}
      </div>
      <div className="universe-col universe-col-center">{logo}</div>
      <div className="universe-col universe-col-right">
        {slide.rightCards.map((card) => (
          <MiniCard key={card.title} card={card} direction="right" />
        ))}
      </div>
      <div className="universe-row-quote">
        <QuoteBox text={slide.quote} highlight={slide.quoteHighlight} />
      </div>
    </div>
  );
}

function MiniCard({ card, direction }) {
  const { title, text, icon: Icon } = card;
  return (
    <motion.div
      className="universe-mini-card"
      initial={{ opacity: 0, x: direction === "left" ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Icon aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
    </motion.div>
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
      <FaQuoteLeft className="quote-icon" aria-hidden="true" />
      <p>{content}</p>
    </blockquote>
  );
}

function ProgressDots({ active }) {
  return (
    <div className="onboarding-dots" aria-label={`Introduction screen ${active + 1} of 3`}>
      {[0, 1, 2].map((index) => (
        <span key={index} className={active === index ? "active" : ""} />
      ))}
    </div>
  );
}
