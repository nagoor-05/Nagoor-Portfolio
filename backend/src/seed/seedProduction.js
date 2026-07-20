import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { projects } from "../../../frontend/src/data/projectShowcase.js";
import { ContentSection } from "../models/ContentSection.js";
import { PortfolioItem } from "../models/PortfolioItem.js";
import { User } from "../models/User.js";
import { createSlug } from "../utils/slug.js";

const owner = {
  name: "Mohammed Nagoor Meerasha",
  username: "nagoor",
  email: (process.env.ADMIN_EMAIL || "nagoormeerasha739@example.com").toLowerCase(),
};

const sections = {
  hero: {
    firstName: "Mohammed",
    middleName: "Nagoor",
    lastName: "Meerasha",
    eyebrow: "Welcome to my universe",
    roles: ["AI / ML Intern", "Full Stack Developer", "Java Programmer", "C++ Programmer", "Creative Problem Solver"],
    description:
      "Building premium digital experiences with React, Three.js, Framer Motion, Tailwind CSS, Machine Learning, and modern web technologies.",
    currentRole: "AI / ML Intern",
    profileImage: "/images/nagoor-profile.jpg",
  },
  about: {
    title: "About Me",
    heading: "Turning Ideas Into Intelligent Systems",
    summary:
      "I am a Computer Science and Engineering student passionate about building useful full-stack and AI-powered software systems.",
    question: "Can I build something that solves this?",
    past:
      "Explored practical projects such as Smart Symbol Table Analyzer, AI Timetable Generation System, and AI learning tools to connect theory with real implementation.",
    present:
      "Strengthening Python, Java, C++, full-stack development, DSA, automation, agentic AI, and practical project-building through hands-on work.",
    future:
      "Focused on becoming a software engineer who can design, build, deploy, and improve intelligent products that solve real-world problems.",
    definesMe: ["Curious learner", "Problem solver", "Project-driven learner", "AI-assisted builder", "Future-focused engineer"],
    currentFocus: ["DSA: Trees, Graphs, Dynamic Programming", "Automation", "Agentic AI", "Small amount ML"],
    areaInterests: {
      core: ["Operating Systems", "Computer Networks", "Database Management Systems"],
      domain: ["Full Stack Web Development", "Software Development"],
      dataStructures: ["Array", "String", "Stack", "Queue", "Recursion"],
    },
  },
  resume: {
    title: "Resume Overview",
    description: "A summary of my education, skills, experience, and project-building journey.",
    pdfUrl: "/Nagoor_Resume.pdf",
    version: "v1.0",
    coreSkills: ["Java", "C++", "Python", "React", "Tailwind CSS", "MongoDB", "Machine Learning", "Git", "GitHub"],
    targetRoles: ["Software Developer", "Full Stack Developer", "AI/ML Intern", "Java Developer"],
  },
  contact: {
    title: "Let's Connect",
    description: "Have an opportunity, project, collaboration, or question? Feel free to send me a message.",
    name: "Mohammed Nagoor Meerasha",
    role: "AI / ML Intern",
    email: "nagoormeerasha739",
    phone: "+91 6383897279",
    location: "PSG Institute of Technology and Applied Research, Neelambur, Coimbatore, 641062",
    responseTime: "Within 24 hours",
    availability: "Open to opportunities",
    services: ["Full-Stack Web Applications", "Backend Development", "AI / ML Solutions", "Database Design"],
  },
  landing: {
    title: "Mohammed Nagoor Meerasha",
    subtitle: "AI / ML Intern",
    description:
      "A cinematic personal portfolio showing projects, education, skills, experience, achievements, resume, and AI Copilot support.",
  },
  stats: {
    projects: "14+",
    technologies: "15+",
    commitment: "100%",
    domains: "4+",
  },
  githubProfile: {
    username: "nagoor-05",
    profileUrl: "https://github.com/nagoor-05",
    headline: "Building in public, learning in public, growing together.",
  },
  seo: {
    title: "Mohammed Nagoor Meerasha Portfolio",
    description: "Personal portfolio for Mohammed Nagoor Meerasha, Computer Science Engineering student and AI/ML intern.",
  },
};

const educations = [
  {
    title: "Born in Tirunelveli",
    year: "2005",
    subtitle: "Tirunelveli, Tamil Nadu, India",
    description: "Started my journey in Tirunelveli, where I developed curiosity for technology, problem-solving, and continuous learning.",
  },
  {
    title: "Higher Secondary Education",
    year: "2022 - 2023",
    subtitle: "Keins Matric Higher Secondary School",
    description:
      "Completed Higher Secondary education with strong academic performance. Built a solid foundation in Mathematics, Computer Science, logical thinking, and analytical problem-solving.",
    score: "Mathematics & Computer Science - 92.5%",
    location: "Tirunelveli, Tamil Nadu",
  },
  {
    title: "B.E Computer Science & Engineering",
    year: "2023 - Present",
    subtitle: "PSG Institute of Technology and Applied Research",
    description:
      "Pursuing Computer Science and Engineering while exploring software development, data structures, algorithms, AI/ML, and modern technologies through continuous learning and projects.",
    score: "CGPA: 7.1",
    location: "Coimbatore, Tamil Nadu",
  },
  {
    title: "Learning & Recovery Phase",
    year: "2024",
    subtitle: "Consistency Building",
    description:
      "Faced personal and physical challenges that required recovery and adaptation. Continued learning gradually and strengthened the determination to improve and move forward.",
  },
  {
    title: "Started Learning Development",
    year: "2025",
    subtitle: "Programming & Web Development",
    description:
      "Began actively learning programming, web development, Java, C++, and software engineering concepts with focus on fundamentals, consistency, and practical projects.",
  },
  {
    title: "AI/ML & Software Engineering Focus",
    year: "2026",
    subtitle: "Current Growth Phase",
    description:
      "Currently focused on Full Stack Development, Artificial Intelligence, Machine Learning, Data Structures & Algorithms, and real-world project development.",
  },
  {
    title: "Expected Graduation",
    year: "2027",
    subtitle: "Software Engineering Path",
    description:
      "Expected to complete B.E Computer Science and Engineering while preparing for software engineering roles and building scalable, impactful software solutions.",
  },
];

const experiences = [
  {
    title: "AI/ML Intern",
    period: "2026 - Present",
    company: "Internship Program",
    location: "Remote / College-based",
    description:
      "Learning industry workflows, project structure, AI/ML concepts, team collaboration, APIs, automation workflows, Postman, and practical software development processes.",
    responsibilities: [
      "Understanding real-world project workflows",
      "Learning AI/ML implementation steps",
      "Improving Python and problem-solving skills",
      "Collaborating and learning from internship teams",
      "Researching technologies required for project development",
    ],
    technologies: ["Python", "Machine Learning", "AI/ML", "Git", "Research"],
  },
  {
    title: "Personal Project Developer",
    period: "2026",
    company: "Self Learning & Project Building",
    location: "Personal Portfolio",
    description:
      "Building real-world projects to improve development skills, strengthen confidence, and create a strong professional portfolio.",
    responsibilities: [
      "Building responsive React applications",
      "Using Framer Motion for animation",
      "Exploring Three.js and interactive UI",
      "Creating reusable components",
      "Pushing consistent progress to GitHub",
    ],
    technologies: ["React", "Tailwind CSS", "Framer Motion", "Three.js", "GitHub"],
  },
];

const skillGroups = [
  { title: "Programming", skills: ["Java", "C++", "Python", "JavaScript"] },
  { title: "Frontend", skills: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Three.js"] },
  { title: "Backend", skills: ["Node.js", "Express.js", "REST APIs", "MongoDB"] },
  { title: "AI / ML", skills: ["Machine Learning basics", "NLP basics", "LLM workflows", "Prompt engineering"] },
  { title: "Core CS", skills: ["Operating Systems", "Computer Networks", "DBMS", "Compiler Design"] },
  { title: "Data Structures", skills: ["Array", "String", "Stack", "Queue", "Recursion", "Trees", "Graphs", "Dynamic Programming"] },
  { title: "Tools", skills: ["Git", "GitHub", "Postman", "n8n", "Vercel"] },
];

const certifications = [
  {
    title: "Red Hat System Administrator (RHCSA) Course 2025",
    issuer: "PISG Tech / Red Hat",
    description: "Completed Linux system administration training with focus on users, permissions, networking, and services.",
    skills: ["Linux System Administration", "User & Group Management", "Network Configuration", "Security & Permissions", "Shell Scripting", "System Services"],
    certificateStatus: "Available",
  },
  {
    title: "Oracle Cloud Infrastructure Foundations Associate 2025",
    issuer: "Oracle",
    description: "Recognized for Oracle Cloud Infrastructure foundations covering core services, storage, networking, and security concepts.",
    skills: ["Cloud Concepts", "Core OCI Services", "Compute & Storage", "Networking / Security", "Pricing & Support"],
    certificateStatus: "Available",
  },
  {
    title: "Smart India Hackathon 2025",
    issuer: "Smart India Hackathon (SIH)",
    description: "Participated in innovation-focused problem solving for real-world impact.",
    role: "Team Member",
    certificateStatus: "Proof Available",
  },
  {
    title: "Ideathon 2025",
    issuer: "National Level Ideathon",
    description: "Participated in ideation and solution-building competition.",
    role: "Team Member",
    certificateStatus: "Certificate Not Available",
  },
];

const codingProfiles = [
  { title: "GitHub", username: "nagoor-05", url: "https://github.com/nagoor-05", status: "Active" },
  { title: "LeetCode", username: "Add soon", url: "#", status: "Practice milestone: 100+ problems" },
  { title: "HackerRank", username: "Add soon", url: "#", status: "Add soon" },
  { title: "CodeChef", username: "Add soon", url: "#", status: "Add soon" },
];

const socialLinks = [
  { title: "GitHub", label: "GitHub", url: "https://github.com/nagoor-05" },
  { title: "LinkedIn", label: "LinkedIn", url: "https://www.linkedin.com/" },
  { title: "Twitter", label: "Twitter", url: "https://x.com/" },
  { title: "Instagram", label: "Instagram", url: "https://www.instagram.com/" },
  { title: "YouTube", label: "YouTube", url: "https://www.youtube.com/" },
];

const articles = [
  {
    title: "My Learning Journey in Full Stack Development",
    description: "A future article about my path in React, backend development, and project building.",
    status: "Planned",
  },
  {
    title: "How I Started Building Real Projects",
    description: "A future article about moving from learning concepts to building practical software projects.",
    status: "Planned",
  },
];

function toItem(type, entry, order) {
  const title = entry.title || `${type}-${order + 1}`;
  return {
    type,
    title,
    slug: entry.slug || entry.id || createSlug(title),
    order,
    isVisible: entry.isVisible ?? true,
    data: entry,
  };
}

function projectToItem(project, order) {
  const slug = project.slug || project.id || createSlug(project.title);
  return {
    type: "project",
    title: project.title,
    slug,
    order,
    isVisible: project.isVisible ?? true,
    data: {
      ...project,
      slug,
      copilotCoverage: {
        sections: ["overview", "features", "technology", "algorithms", "workflow", "architecture", "challenges", "roadmap"],
        star: project.analysis?.star || [],
        fiveWOneH: project.analysis?.fiveWOneH || [],
      },
    },
  };
}

async function upsertSection(ownerId, key, data) {
  await ContentSection.findOneAndUpdate(
    { ownerId, key },
    { $set: { data, isVisible: true } },
    { upsert: true, runValidators: true, new: true }
  );
}

async function upsertItem(ownerId, item) {
  await PortfolioItem.findOneAndUpdate(
    { ownerId, type: item.type, slug: item.slug },
    {
      $set: {
        title: item.title,
        order: item.order,
        isVisible: item.isVisible,
        data: item.data,
      },
    },
    { upsert: true, runValidators: true, new: true }
  );
}

async function ensureOwner() {
  const existingUser = await User.findOne({ username: owner.username }).select("+password");
  const update = {
    name: owner.name,
    email: owner.email,
    username: owner.username,
    role: "admin",
    isActive: true,
  };

  if (!existingUser?.password || process.env.ADMIN_PASSWORD) {
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is required when creating the production owner/admin user.");
    }
    update.password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  }

  return User.findOneAndUpdate({ username: owner.username }, { $set: update }, { upsert: true, runValidators: true, new: true });
}

async function seedProduction() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required.");
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const user = await ensureOwner();

  for (const [key, data] of Object.entries(sections)) {
    await upsertSection(user._id, key, data);
  }

  const items = [
    ...projects.map(projectToItem),
    ...skillGroups.map((entry, index) => toItem("skill", entry, index)),
    ...educations.map((entry, index) => toItem("education", entry, index)),
    ...experiences.map((entry, index) => toItem("experience", entry, index)),
    ...certifications.map((entry, index) => toItem("certification", entry, index)),
    ...articles.map((entry, index) => toItem("article", entry, index)),
    ...codingProfiles.map((entry, index) => toItem("codingProfile", entry, index)),
    ...socialLinks.map((entry, index) => toItem("socialLink", entry, index)),
  ];

  for (const item of items) {
    await upsertItem(user._id, item);
  }

  console.log(`Production seed complete for ${owner.username}.`);
  console.log(`Sections upserted: ${Object.keys(sections).length}`);
  console.log(`Portfolio items upserted: ${items.length}`);
}

seedProduction()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
