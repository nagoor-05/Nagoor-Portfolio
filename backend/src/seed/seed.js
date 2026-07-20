import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ContentSection } from "../models/ContentSection.js";
import { PortfolioItem } from "../models/PortfolioItem.js";

const sections = {
  hero: {
    firstName: "Mohammed",
    middleName: "Nagoor",
    lastName: "Meerasha",
    eyebrow: "Welcome to my universe",
    roles: ["AI / ML Learner", "Full Stack Developer", "Java Programmer", "C++ Programmer", "Creative Problem Solver"],
    description:
      "Building premium digital experiences with React, Three.js, Framer Motion, Tailwind CSS, Machine Learning, and modern web technologies.",
    currentRole: "AI / ML Intern",
    profileImage: "/src/assets/nagoor.jpeg",
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
    version: "v1.0",
    versions: [
      {
        version: "v1.0",
        pdfUrl: "/Nagoor_Resume.pdf",
        note: "Initial portfolio resume version",
        updatedAt: new Date().toISOString(),
      },
    ],
    coreSkills: ["Java", "C++", "Python", "React", "Tailwind CSS", "Three.js", "Framer Motion", "Machine Learning", "Git", "GitHub", "Problem Solving", "Data Structures"],
    sections: {
      education: ["B.E Computer Science & Engineering - PSG Institute of Technology and Applied Research", "Higher Secondary - Keins Matric Higher Secondary School"],
      experience: ["AI/ML Intern - Internship Program", "Personal Project Developer - Self Learning & Project Building"],
      projects: ["Nagoor Portfolio", "Financial Reconciliation System", "Mini Compiler Lab"],
      skills: ["Java", "C++", "Python", "React", "MongoDB"],
      certifications: [],
      achievements: ["Building a complete cinematic portfolio platform with AI and analytics"],
    },
    ai: {
      generatorReady: true,
      reviewerReady: true,
      notes: "Target roles: full stack developer, AI/ML learner, Java programmer.",
    },
  },
  contact: {
    title: "Let's Connect",
    description: "Have an opportunity, project, collaboration, or question? Feel free to send me a message.",
    email: "nagoormeerasha739",
    phone: "+91 6383897279",
    location: "PSG Institute of Technology and Applied Research, Neelambur, Coimbatore, 641062",
    currentRole: "AI / ML Intern",
  },
  landing: {
    voiceMessage:
      "Hello, welcome to my universe. I'm delighted you're here. I hope you're well. Take your time, explore my work, and enjoy the experience.",
    enterLabel: "Enter Portfolio",
  },
  stats: {
    items: [
      { label: "Projects", value: 12, suffix: "+" },
      { label: "Technologies", value: 15, suffix: "+" },
      { label: "Commitment", value: 100, suffix: "%" },
      { label: "Domains", value: 4, suffix: "+" },
    ],
  },
  githubProfile: {
    eyebrow: "Open Source",
    title: "GitHub",
    username: "nagoor-05",
    profileUrl: "https://github.com/nagoor-05",
    repositories: [
      {
        name: "Nagoor Portfolio",
        description: "Premium cinematic developer portfolio with particles, 3D logo, AI Copilot, analytics, and admin CMS.",
        url: "https://github.com/nagoor-05",
        stars: 13,
        forks: 4,
        language: "React",
        color: "#61dafb",
      },
      {
        name: "Financial Reconciliation System",
        description: "Smart reconciliation concept for comparing financial records and detecting inconsistencies.",
        url: "https://github.com/nagoor-05",
        stars: 9,
        forks: 3,
        language: "Python",
        color: "#47bbff",
      },
      {
        name: "Mini Compiler Lab",
        description: "Compiler design learning project covering lexical analysis, parsing ideas, and syntax workflows.",
        url: "https://github.com/nagoor-05",
        stars: 7,
        forks: 2,
        language: "C",
        color: "#915eff",
      },
      {
        name: "AI Learning Notebook",
        description: "Structured AI/ML learning notes, experiments, and model-building basics.",
        url: "https://github.com/nagoor-05",
        stars: 6,
        forks: 2,
        language: "Python",
        color: "#00cea8",
      },
    ],
  },
  seo: {
    title: "Mohammed Nagoor Meerasha | Cinematic Portfolio",
    description: "AI/ML learner, full stack developer, Java and C++ programmer.",
    keywords: ["Mohammed Nagoor Meerasha", "AI ML Learner", "Full Stack Developer", "React Developer"],
    canonicalUrl: "http://127.0.0.1:5173/home",
    siteUrl: "http://127.0.0.1:5173",
    socialPreviewImage: "/preview.png",
    openGraph: {
      title: "Mohammed Nagoor Meerasha | Cinematic Portfolio",
      description: "A premium cinematic portfolio for an AI/ML learner and full stack developer.",
      type: "website",
      url: "http://127.0.0.1:5173/home",
      image: "/preview.png",
    },
    twitter: {
      card: "summary_large_image",
      title: "Mohammed Nagoor Meerasha | Cinematic Portfolio",
      description: "AI/ML learner, full stack developer, Java and C++ programmer.",
      image: "/preview.png",
    },
    structuredData: {
      enabled: true,
      type: "Person",
    },
  },
  siteSettings: {
    username: "nagoor",
    theme: "premium-cinematic",
    isPublished: true,
  },
};

const items = {
  project: [
    { title: "Nagoor Portfolio", slug: "nagoor-portfolio", category: "Web Development", description: "A cinematic developer portfolio with particles, page transitions, 3D logo, and premium interaction.", tags: ["React", "Three.js", "GSAP", "Tailwind"], github: "https://github.com/nagoor-05", live: "https://vercel.com/" },
    { title: "Financial Reconciliation System", slug: "financial-reconciliation-system", category: "AI/ML", description: "A smart reconciliation concept for comparing financial records and detecting inconsistencies.", tags: ["Python", "ML", "Data"], github: "https://github.com/nagoor-05", live: "https://vercel.com/" },
    { title: "Mini Compiler Lab", slug: "mini-compiler-lab", category: "Compiler Design", description: "Compiler design learning project covering lexical analysis, parsing ideas, and syntax workflows.", tags: ["C", "Compiler", "DSA"], github: "https://github.com/nagoor-05", live: "https://vercel.com/" },
    { title: "AI Learning Notebook", slug: "ai-learning-notebook", category: "AI/ML", description: "A structured learning project for AI/ML basics, experiments, and model-building notes.", tags: ["Python", "AI", "Notebook"], github: "https://github.com/nagoor-05", live: "https://vercel.com/" },
  ],
  skill: [
    { title: "C", category: "Programming Languages", percentage: 80 },
    { title: "C++", category: "Programming Languages", percentage: 60 },
    { title: "Java", category: "Programming Languages", percentage: 55 },
    { title: "Python", category: "Programming Languages", percentage: 50 },
    { title: "React", category: "Frontend Development", percentage: 60 },
    { title: "Tailwind CSS", category: "Frontend Development", percentage: 65 },
    { title: "Node.js", category: "Backend", percentage: 45 },
    { title: "MongoDB", category: "Databases", percentage: 40 },
  ],
  experience: [
    { title: "AI/ML Intern", date: "2026 - Present", status: "Ongoing", organization: "Internship Program", location: "Remote / College-based", description: "Learning industry workflows, AI/ML concepts, team collaboration, and practical development processes.", responsibilities: ["Understanding real-world workflows", "Learning AI/ML implementation", "Improving Python and problem-solving"] },
    { title: "Personal Project Developer", date: "2025 - Present", status: "Active", organization: "Self Learning & Project Building", description: "Building full stack, AI/ML, and portfolio projects." },
  ],
  education: [
    { title: "Born in Tirunelveli", year: "2005", subtitle: "Tirunelveli, Tamil Nadu, India", body: "Started my journey with curiosity for technology and continuous learning." },
    { title: "Higher Secondary Education", year: "2022 - 2023", subtitle: "Keins Matric Higher Secondary School", body: "Mathematics & Computer Science with a 92.5% score." },
    { title: "B.E Computer Science & Engineering", year: "2023 - Present", subtitle: "PSG Institute of Technology and Applied Research", body: "CGPA 7.1, exploring software development, DSA, AI/ML, and modern technologies." },
  ],
  article: [
    {
      title: "My Learning Journey in Full Stack Development",
      slug: "full-stack-learning-journey",
      category: "Learning",
      description: "My path in React, backend development, and project building.",
      content: "I started full stack development by learning how the frontend, backend, database, and deployment layers connect together.\n\nMy current focus is building real projects instead of only watching tutorials. I practice React, routing, component design, APIs, MongoDB, and deployment step by step.",
      readTime: "4 min read",
      featured: true,
      tags: ["React", "Learning", "Full Stack"],
      seoTitle: "My Full Stack Learning Journey",
      seoDescription: "Mohammed Nagoor Meerasha's learning journey in full stack development.",
      seoKeywords: ["React", "Full Stack", "Learning"],
    },
    {
      title: "How I Started Building Real Projects",
      slug: "building-real-projects",
      category: "Projects",
      description: "Moving from learning concepts to practical software projects.",
      content: "Real project building helped me understand planning, UI decisions, APIs, errors, testing, and deployment better than isolated practice.\n\nMy goal is to keep improving through useful projects that show both technical ability and product thinking.",
      readTime: "3 min read",
      featured: false,
      tags: ["Projects", "Growth", "Portfolio"],
      seoTitle: "How I Started Building Real Projects",
      seoDescription: "A short article about moving from tutorials to practical project building.",
      seoKeywords: ["Projects", "Portfolio", "Software Development"],
    },
  ],
  codingProfile: [
    { title: "GitHub", platform: "GitHub", handle: "@nagoor-05", url: "https://github.com/nagoor-05", stats: { Repositories: "12+", Focus: "Full Stack", Status: "Active" }, badges: ["Projects", "React", "Learning"], achievements: ["Building portfolio, AI/ML, and full stack projects."], skillMapping: ["React", "Node", "MongoDB", "Git"] },
    { title: "LeetCode", platform: "LeetCode", handle: "@Add soon", url: "https://leetcode.com/", stats: { Practice: "DSA", Status: "Starting" }, badges: ["Algorithms", "Problem Solving"], achievements: ["Focused on consistent DSA practice."], skillMapping: ["DSA", "C++", "Java"] },
    { title: "HackerRank", platform: "HackerRank", handle: "@Add soon", url: "https://www.hackerrank.com/", stats: { Focus: "Basics" }, badges: ["Java", "Python"], achievements: ["Practicing programming fundamentals."], skillMapping: ["Java", "Python"] },
    { title: "CodeChef", platform: "CodeChef", handle: "@Add soon", url: "https://www.codechef.com/", stats: { Focus: "Competitive" }, badges: ["Practice"], achievements: ["Preparing for contest-style problem solving."], skillMapping: ["C++", "DSA"] },
    { title: "Codeforces", platform: "Codeforces", handle: "@Add soon", url: "https://codeforces.com/", stats: { Focus: "Algorithms" }, badges: ["Upcoming"], achievements: ["Planned for advanced algorithm practice."], skillMapping: ["Algorithms"] },
  ],
  socialLink: [
    { title: "GitHub", label: "GitHub", url: "https://github.com/nagoor-05" },
    { title: "LinkedIn", label: "LinkedIn", url: "https://www.linkedin.com/" },
    { title: "Instagram", label: "Instagram", url: "https://www.instagram.com/" },
    { title: "YouTube", label: "YouTube", url: "https://www.youtube.com/" },
    { title: "X", label: "X", url: "https://x.com/" },
  ],
  certification: [],
};

async function seed() {
  await connectDatabase();
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "change-this-password", 12);
  const user = await User.findOneAndUpdate(
    { username: (process.env.ADMIN_USERNAME || "nagoor").toLowerCase() },
    {
      name: process.env.ADMIN_NAME || "Mohammed Nagoor Meerasha",
      email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),
      password,
      role: "admin",
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  for (const [key, data] of Object.entries(sections)) {
    await ContentSection.findOneAndUpdate(
      { ownerId: user._id, key },
      { data, isVisible: true },
      { upsert: true, new: true }
    );
  }

  for (const [type, entries] of Object.entries(items)) {
    for (const [order, entry] of entries.entries()) {
      const { title, slug = `${type}-${order + 1}`, ...data } = entry;
      await PortfolioItem.findOneAndUpdate(
        { ownerId: user._id, type, slug },
        { title, data, order, isVisible: true },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`Seeded portfolio for ${user.username}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
