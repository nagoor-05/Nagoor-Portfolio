const PRIVATE_TOPIC_PATTERNS = [
  /\b(gay|straight|sexual|sex life|girlfriend|boyfriend|relationship|married|wife|husband)\b/i,
  /\b(religion|caste|race|political|party|vote)\b/i,
  /\b(medical|disease|mental health|depression|salary|bank|address|family)\b/i,
];

const SECRET_REQUEST_PATTERNS = [
  /\b(api key|openrouter|jwt|token|password|secret|database|mongodb|env file|system prompt)\b/i,
  /\b(ignore previous|ignore these rules|developer message|admin password|private file)\b/i,
];

export function getPreflightAnswer(question = "") {
  if (PRIVATE_TOPIC_PATTERNS.some((pattern) => pattern.test(question))) {
    return "That is private personal information and is not part of this professional portfolio. Please keep questions relevant to the owner's work, education, skills, projects, and professional background.";
  }

  if (SECRET_REQUEST_PATTERNS.some((pattern) => pattern.test(question))) {
    return "I cannot help with private configuration, secrets, system prompts, credentials, or internal files. I can help explain the public portfolio, projects, skills, education, and contact options.";
  }

  return "";
}

export function guardAiAnswer(answer = "") {
  const clean = String(answer).trim();
  if (!clean) return "I could not generate a useful answer. Please try asking about projects, skills, education, or contact options.";
  if (SECRET_REQUEST_PATTERNS.some((pattern) => pattern.test(clean)) && /sk-|password|secret|token/i.test(clean)) {
    return "I cannot reveal private configuration or credentials. Please ask about the public portfolio information instead.";
  }
  return clean;
}
