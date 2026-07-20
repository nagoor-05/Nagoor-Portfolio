import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  articles,
  achievements,
  codingProfiles,
  educationCertificates,
  experiences,
  focusCards,
  githubProfile,
  projects,
  skillGroups,
  socialLinks,
  stats,
  timeline,
  typewriterRoles,
} from "../data/portfolio";
import { getPublicPortfolio } from "../services/api";

const fallback = {
  hero: {
    firstName: "Mohammed",
    middleName: "Nagoor",
    lastName: "Meerasha",
    eyebrow: "Welcome to my universe",
    roles: typewriterRoles,
    description:
      "Building premium digital experiences with React, Three.js, Framer Motion, Tailwind CSS, Machine Learning, and modern web technologies.",
    currentRole: "AI / ML Intern",
  },
  about: {
    title: "About Me",
    introduction:
      "I am a Computer Science and Engineering student who enjoys transforming ideas into complete, working software systems.",
    careerGoal:
      "My goal is to grow into an engineer who can understand real problems, design complete solutions, and build useful intelligent products.",
    currentFocus: ["DSA: Trees, Graphs, Dynamic Programming", "Automation", "Agentic AI", "Small amount ML"],
    areaInterests: {
      core: ["Operating Systems", "Computer Networks", "Database Management Systems"],
      domain: ["Full Stack Web Development", "Software Development"],
      dataStructures: ["Array", "String", "Stack", "Queue", "Recursion"],
    },
    longForm: `About Me - Turning Ideas Into Intelligent Systems

I am a Computer Science and Engineering student who enjoys transforming ideas into complete, working software systems. What attracts me most to technology is not just writing code. It is the process of identifying a problem, understanding why it exists, designing a practical solution, choosing the right technologies, and continuously improving the final system.

Whenever I see a real-world problem, I naturally ask myself: "Can I build something that solves this?" That question has shaped my learning journey and developed my interest in Artificial Intelligence, Machine Learning, full-stack development, automation, and intelligent software products.

Past - How My Journey Started: During my Computer Science and Engineering journey, I understood that I learn better through practical experience than by studying theory alone. Instead of limiting myself to courses and classroom concepts, I started building projects that allowed me to apply what I learned in real situations. One early project was Smart Symbol Table Analyzer, where I applied compiler design concepts and data structures to manage identifiers efficiently. I later developed an AI-based Timetable Generation System using constraint satisfaction, greedy strategies, and backtracking to avoid faculty, classroom, and subject conflicts. I also worked on an AI-powered Learning Assistant to transform educational content into organized study resources. Through these projects, I learned problem understanding, modular design, algorithm selection, testing, debugging, limitation analysis, and step-by-step improvement. My internship experience gave me practical exposure to AI-related projects, APIs, automation workflows, Postman, and n8n.

Present - What I Am Building Now: I am strengthening Python for AI/ML, data processing, and intelligent systems; C++ for programming fundamentals and object-oriented concepts; and Java for Data Structures, Algorithms, coding practice, and problem-solving. I use each language for a clear purpose. I am currently working on an AI-powered Transaction Reconciliation and Fraud Detection Platform involving document upload and OCR, transaction verification, reconciliation workflows, anomaly detection, fraud scoring, suspicious-area highlighting, explainable AI, user/verifier/admin dashboards, reports, alerts, and investigation workflows. AI helps me explore technologies, compare approaches, understand errors, debug faster, generate ideas, improve architecture, and accelerate development, but I focus on understanding why solutions work and what limitations exist.

Future - Where I Want to Go: My short-term goal is to begin my career in a strong software engineering environment where I can contribute to real products, work with experienced professionals, and improve technical, communication, and teamwork skills. I want deeper experience in software engineering, Artificial Intelligence and Machine Learning, full-stack development, system design, scalable application development, intelligent automation, and product thinking. In the long term, I want to independently design, build, deploy, and improve intelligent software products that solve meaningful real-world problems.

What Defines Me: Curious learner, problem solver, project-driven learner, AI-assisted builder, and future-focused engineer.

Closing Statement: I am still learning, experimenting, and improving every day. One thing remains constant: I enjoy turning ideas into working systems and using technology to solve real problems.`,
  },
  resume: {
    title: "Resume Overview",
    description:
      "A summary of my education, skills, experience, and project-building journey. Download my complete resume for more details.",
    pdfUrl: "/Nagoor_Resume.pdf",
    coreSkills: ["Java", "C++", "Python", "React", "Tailwind CSS", "Three.js", "Framer Motion", "Machine Learning", "Git", "GitHub", "Problem Solving", "Data Structures"],
  },
  contact: {
    title: "Let's Connect",
    description: "Have an opportunity, project, collaboration, or question? Feel free to send me a message.",
    email: "nagoormeerasha739@gmail.com",
    phone: "+91 90423 90940",
    location: "Coimbatore, Tamil Nadu",
    currentRole: "AI / ML Intern",
  },
  landing: {
    voiceMessage:
      "Hello, welcome to my universe. I'm delighted you're here. I hope you're well. Take your time, explore my work, and enjoy the experience.",
  },
  stats: { items: stats },
  seo: {
    title: "Mohammed Nagoor Meerasha | Cinematic Portfolio",
    description:
      "Premium cinematic portfolio for Mohammed Nagoor Meerasha, an AI/ML learner and full stack developer.",
    keywords: ["Mohammed Nagoor Meerasha", "AI ML Learner", "Full Stack Developer", "React Developer"],
    socialPreviewImage: "/preview.png",
  },
  projects,
  skills: [],
  experiences,
  educations: timeline,
  articles,
  achievements,
  codingProfiles,
  educationCertificates,
  socialLinks,
  focusCards,
  githubProfile,
  skillGroups,
};

const PortfolioContext = createContext({ data: fallback, loading: true, online: false });

function mergeIcons(items, iconItems) {
  return items.map((item) => {
    const rawName = item.label || item.name || item.title || item.platform || "";
    const normalized = rawName.toLowerCase();
    const match = iconItems.find((candidate) => {
      const candidateName = (candidate.label || candidate.name || "").toLowerCase();
      return (
        candidateName === normalized ||
        (normalized === "x" && candidateName === "twitter") ||
        (normalized === "twitter/x" && candidateName === "twitter") ||
        (normalized === "linkedin" && candidateName === "linkedin") ||
        (normalized === "github" && candidateName === "github") ||
        (normalized === "instagram" && candidateName === "instagram") ||
        (normalized === "facebook" && candidateName === "facebook")
      );
    });
    return { ...item, name: item.name || item.title, label: item.label || item.title, icon: match?.icon || iconItems[0]?.icon };
  });
}

function groupSkills(items) {
  if (!items?.length) return skillGroups;
  return [...new Set(items.map((item) => item.category))].map((category, index) => ({
    title: category,
    icon: skillGroups.find((group) => group.title === category)?.icon || skillGroups[index % skillGroups.length].icon,
    skills: items.filter((item) => item.category === category).map((item) => [item.title, item.percentage]),
  }));
}

export function PortfolioProvider({ children }) {
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPortfolio()
      .then(setRemote)
      .catch((error) => setRemote(error.status === 403 ? { unpublished: true } : null))
      .finally(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    if (remote?.unpublished) return { ...fallback, unpublished: true };
    if (!remote) return fallback;
    return {
      ...fallback,
      ...remote,
      hero: { ...fallback.hero, ...remote.hero },
      about: { ...fallback.about, ...remote.about },
      resume: { ...fallback.resume, ...remote.resume },
      contact: { ...fallback.contact, ...remote.contact },
      landing: { ...fallback.landing, ...remote.landing },
      githubProfile: { ...fallback.githubProfile, ...remote.githubProfile },
      stats: { ...fallback.stats, ...remote.stats },
      seo: { ...fallback.seo, ...remote.seo },
      projects: remote.projects?.length ? remote.projects : fallback.projects,
      experiences: remote.experiences?.length
        ? remote.experiences.map((item) => ({ ...item, role: item.role || item.title }))
        : fallback.experiences,
      educations: remote.educations?.length ? remote.educations : fallback.educations,
      educationCertificates: { ...fallback.educationCertificates, ...remote.educationCertificates },
      articles: remote.articles?.length ? remote.articles : fallback.articles,
      achievements: { ...fallback.achievements, ...remote.achievements },
      codingProfiles: remote.codingProfiles?.length
        ? mergeIcons(remote.codingProfiles, codingProfiles)
        : fallback.codingProfiles,
      socialLinks: remote.socialLinks?.length
        ? mergeIcons(remote.socialLinks, socialLinks)
        : fallback.socialLinks,
      skillGroups: groupSkills(remote.skills),
    };
  }, [remote]);

  return (
    <PortfolioContext.Provider value={{ data, loading, online: Boolean(remote) }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
