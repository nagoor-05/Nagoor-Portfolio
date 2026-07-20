const SECRET_PATTERNS = [
  /sk-or-v1-[a-zA-Z0-9]+/g,
  /sk-proj-[a-zA-Z0-9_-]+/g,
  /jina_[a-zA-Z0-9_-]+/g,
  /pa-[a-zA-Z0-9_-]+/g,
  /sd_[a-zA-Z0-9_-]+/g,
  /Bearer\s+[a-zA-Z0-9._-]+/g,
  /((?:OPENROUTER|OPENAI|JINA|VOYAGE|SUPADATA)_API_KEY(?:_\d+)?\s*=\s*)[^\s]+/gi,
  /(JWT_SECRET\s*=\s*)[^\s]+/gi,
  /(MONGO_URI\s*=\s*)[^\s]+/gi,
];

export function redactSecrets(value = "") {
  return String(value).replaceAll(/\r/g, "").replace(SECRET_PATTERNS[0], "[REDACTED_OPENROUTER_KEY]")
    .replace(SECRET_PATTERNS[1], "[REDACTED_OPENAI_KEY]")
    .replace(SECRET_PATTERNS[2], "[REDACTED_JINA_KEY]")
    .replace(SECRET_PATTERNS[3], "[REDACTED_VOYAGE_KEY]")
    .replace(SECRET_PATTERNS[4], "[REDACTED_SUPADATA_KEY]")
    .replace(SECRET_PATTERNS[5], "Bearer [REDACTED]")
    .replace(SECRET_PATTERNS[6], "$1[REDACTED]")
    .replace(SECRET_PATTERNS[7], "$1[REDACTED]")
    .replace(SECRET_PATTERNS[8], "$1[REDACTED]");
}
