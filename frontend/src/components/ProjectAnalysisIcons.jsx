import {
  ArrowLeft,
  Braces,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleAlert,
  Code2,
  ExternalLink,
  FileHeart,
  FileSearch,
  GraduationCap,
  HeartPulse,
  House,
  Layers3,
  Lightbulb,
  ListChecks,
  Mic2,
  Mountain,
  PanelsTopLeft,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
  SquarePlay,
  Workflow,
  Zap,
} from "lucide-react";

const projectIcons = {
  "AI Meeting-to-Execution Agent": ListChecks,
  "YouTube Learn": SquarePlay,
  ReconIQ: ScanSearch,
  "Premium Personal Portfolio": BriefcaseBusiness,
  "Smart Symbol Table Analyzer": Braces,
  "AI Timetable Generation System": CalendarDays,
  "SereniQ — Mental Wellness Assessment Platform": HeartPulse,
  "MediClaim AI": FileHeart,
  "PrepIQ AI": GraduationCap,
  "PrepIQ AI — Exam and Placement Intelligence": GraduationCap,
  "AI House Price Prediction": House,
  "AI House Price Prediction and Real Estate Intelligence Platform": House,
  "AI Portfolio Builder": PanelsTopLeft,
  NOVA: Mic2,
  "NOVA — Nagoor’s Own Voice Assistant": Mic2,
  "AI ATS Resume Checker": FileSearch,
  BreachChecker: ShieldCheck,
  "BreachGuard AI — Email and Password Breach Detection Platform": ShieldCheck,
};

const sectionIcons = {
  Problem: CircleAlert,
  Solution: Lightbulb,
  "Key Features": Sparkles,
  "Tech Stack": Layers3,
  Workflow,
  Challenges: Mountain,
  Limitations: TriangleAlert,
  "My Role / Contribution": UserRound,
};

const workflowIcons = [ListChecks, Workflow, Layers3, Sparkles, Zap];

const listMarkerIcons = {
  "Key Features": Check,
  Challenges: CircleAlert,
  Limitations: TriangleAlert,
};

export const actionIcons = {
  GitHub: Code2,
  "Live Demo": ExternalLink,
  Back: ArrowLeft,
};

function IconShell({ icon: Icon = Sparkles, className = "", label }) {
  return (
    <span className={`analysis-icon-shell ${className}`} aria-hidden={label ? undefined : "true"}>
      <Icon size={20} strokeWidth={2.35} aria-label={label} />
    </span>
  );
}

export function ProjectHeaderIcon({ title }) {
  return <IconShell icon={projectIcons[title] || BriefcaseBusiness} className="project-header-icon" />;
}

export function SectionIcon({ title }) {
  return <IconShell icon={sectionIcons[title] || Sparkles} />;
}

export function WorkflowStepIcon({ index }) {
  return <IconShell icon={workflowIcons[index % workflowIcons.length]} className="workflow-step-icon" />;
}

export function AnalysisListMarker({ title }) {
  const Icon = listMarkerIcons[title];
  if (!Icon) return null;
  const markerClass = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <span className={`analysis-list-marker marker-${markerClass}`} aria-hidden="true">
      <Icon size={15} strokeWidth={2.6} />
    </span>
  );
}
