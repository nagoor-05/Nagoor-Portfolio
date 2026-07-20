import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ContentSection } from "../models/ContentSection.js";

const longForm = `About Me - Turning Ideas Into Intelligent Systems

I am a Computer Science and Engineering student who enjoys transforming ideas into complete, working software systems. What attracts me most to technology is not just writing code. It is the process of identifying a problem, understanding why it exists, designing a practical solution, choosing the right technologies, and continuously improving the final system.

Whenever I see a real-world problem, I naturally ask myself: "Can I build something that solves this?" That question has shaped my learning journey and developed my interest in Artificial Intelligence, Machine Learning, full-stack development, automation, and intelligent software products.

Past - How My Journey Started: During my Computer Science and Engineering journey, I understood that I learn better through practical experience than by studying theory alone. Instead of limiting myself to courses and classroom concepts, I started building projects that allowed me to apply what I learned in real situations. One early project was Smart Symbol Table Analyzer, where I applied compiler design concepts and data structures to manage identifiers efficiently. I later developed an AI-based Timetable Generation System using constraint satisfaction, greedy strategies, and backtracking to avoid faculty, classroom, and subject conflicts. I also worked on an AI-powered Learning Assistant to transform educational content into organized study resources. Through these projects, I learned problem understanding, modular design, algorithm selection, testing, debugging, limitation analysis, and step-by-step improvement. My internship experience gave me practical exposure to AI-related projects, APIs, automation workflows, Postman, and n8n.

Present - What I Am Building Now: I am strengthening Python for AI/ML, data processing, and intelligent systems; C++ for programming fundamentals and object-oriented concepts; and Java for Data Structures, Algorithms, coding practice, and problem-solving. I use each language for a clear purpose. I am currently working on an AI-powered Transaction Reconciliation and Fraud Detection Platform involving document upload and OCR, transaction verification, reconciliation workflows, anomaly detection, fraud scoring, suspicious-area highlighting, explainable AI, user/verifier/admin dashboards, reports, alerts, and investigation workflows. AI helps me explore technologies, compare approaches, understand errors, debug faster, generate ideas, improve architecture, and accelerate development, but I focus on understanding why solutions work and what limitations exist.

Future - Where I Want to Go: My short-term goal is to begin my career in a strong software engineering environment where I can contribute to real products, work with experienced professionals, and improve technical, communication, and teamwork skills. I want deeper experience in software engineering, Artificial Intelligence and Machine Learning, full-stack development, system design, scalable application development, intelligent automation, and product thinking. In the long term, I want to independently design, build, deploy, and improve intelligent software products that solve meaningful real-world problems.

What Defines Me: Curious learner, problem solver, project-driven learner, AI-assisted builder, and future-focused engineer.

Closing Statement: I am still learning, experimenting, and improving every day. One thing remains constant: I enjoy turning ideas into working systems and using technology to solve real problems.`;

await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });

const owner = await User.findOne({ username: "nagoor" });
if (!owner) throw new Error("Owner nagoor not found");

await ContentSection.updateOne(
  { ownerId: owner._id, key: "about" },
  {
    $set: {
      data: {
        title: "About Me",
        introduction: "I am a Computer Science and Engineering student who enjoys transforming ideas into complete, working software systems.",
        careerGoal: "My goal is to grow into an engineer who can understand real problems, design complete solutions, and build useful intelligent products.",
        currentFocus: ["DSA: Trees, Graphs, Dynamic Programming", "Automation", "Agentic AI", "Small amount ML"],
        areaInterests: {
          core: ["Operating Systems", "Computer Networks", "Database Management Systems"],
          domain: ["Full Stack Web Development", "Software Development"],
          dataStructures: ["Array", "String", "Stack", "Queue", "Recursion"],
        },
        longForm,
      },
      isVisible: true,
    },
  },
  { upsert: true }
);

await ContentSection.updateOne(
  { ownerId: owner._id, key: "contact" },
  {
    $set: {
      "data.title": "Let's Connect",
      "data.description": "Have an opportunity, project, collaboration, or question? Feel free to send me a message.",
      "data.email": "nagoormeerasha739",
      "data.phone": "+91 6383897279",
      "data.location": "PSG Institute of Technology and Applied Research, Neelambur, Coimbatore, 641062",
      "data.currentRole": "AI / ML Intern",
      isVisible: true,
    },
  },
  { upsert: true }
);

console.log("Updated about/contact sections for Copilot context.");
await mongoose.disconnect();
