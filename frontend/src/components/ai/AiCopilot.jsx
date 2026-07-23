import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowRotateRight, FaBroom, FaMinus, FaPaperPlane, FaRobot, FaXmark } from "react-icons/fa6";
import { askCopilot, getCopilotSuggestions } from "../../services/aiService";

const FALLBACK_SUGGESTIONS = [
  "Who is the portfolio owner?",
  "Explain PortfolioAI.",
  "Explain BreachGuard AI.",
  "Explain any project using STAR.",
  "Explain any project using 5W1H.",
  "What is his education?",
  "Give me a recruiter-friendly summary.",
];

const WELCOME_MESSAGE = "Hello. Ask me anything about Nagoor's projects, STAR answers, 5W1H explanations, skills, education, resume, experience, or contact options.";
const STORAGE_KEY = "nagoor-copilot-history";
const SESSION_KEY = "nagoor-copilot-session";
const MAX_INPUT_LENGTH = 1200;

export default function AiCopilot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [suggestions, setSuggestions] = useState(FALLBACK_SUGGESTIONS);
  const [messages, setMessages] = useState(() => loadStoredMessages());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const sessionId = useMemo(() => {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = crypto.randomUUID?.() || `${Date.now()}`;
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 180);
  }, [open, minimized]);

  useEffect(() => {
    getCopilotSuggestions().then((items) => {
      if (items.length) setSuggestions(items);
    }).catch(() => {});
  }, []);

  const send = async (question = input) => {
    const clean = question.trim().slice(0, MAX_INPUT_LENGTH);
    if (!clean || loading) return;
    const next = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setLastQuestion(clean);
    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const timeout = setTimeout(() => abortRef.current?.abort(), 50000);
    try {
      const response = await askCopilot(clean, next.slice(-10), sessionId, abortRef.current.signal);
      setMessages((current) => [...current, { role: "assistant", content: response.answer }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: getFriendlyError(error) },
      ]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    setLoading(false);
    setInput("");
    setLastQuestion("");
    setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className={`ai-copilot ${open ? "open" : ""}`}>
      {open && !minimized && (
        <section className="ai-panel" aria-label="Portfolio AI Copilot">
          <header>
            <div><FaRobot /><strong>Portfolio Copilot</strong></div>
            <nav aria-label="Copilot controls">
              {lastQuestion && !loading && (
                <button type="button" onClick={() => send(lastQuestion)} aria-label="Retry last question"><FaArrowRotateRight /></button>
              )}
              <button type="button" onClick={clearConversation} aria-label="Clear conversation"><FaBroom /></button>
              <button type="button" onClick={() => setMinimized(true)} aria-label="Minimize AI Copilot"><FaMinus /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close AI Copilot"><FaXmark /></button>
            </nav>
          </header>
          <div className="ai-messages" aria-live="polite">
            {messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} message={message} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-suggestions">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} disabled={loading} onClick={() => send(suggestion)}>{suggestion}</button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); send(); }}>
            <textarea
              ref={inputRef}
              value={input}
              maxLength={MAX_INPUT_LENGTH}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this portfolio"
              aria-label="Question for portfolio copilot"
              rows={1}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send question"><FaPaperPlane /></button>
          </form>
        </section>
      )}
      <button
        className="ai-launcher"
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setMinimized(false);
        }}
        aria-label={open ? "Toggle AI Copilot" : "Open AI Copilot"}
      >
        <FaRobot />
        <span>Copilot</span>
      </button>
    </div>
  );
}

function loadStoredMessages() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    // Ignore broken session storage and start fresh.
  }
  return [{ role: "assistant", content: WELCOME_MESSAGE }];
}

function TypingIndicator() {
  return (
    <div className="ai-message assistant typing" aria-label="Copilot is typing">
      <span />
      <span />
      <span />
    </div>
  );
}

function getFriendlyError(error) {
  if (error?.userMessage) return error.userMessage;
  if (error?.name === "AbortError") return "The portfolio assistant took too long to respond. Please try again.";
  if (error?.status === 429) return "Too many Copilot questions. Please wait a minute and try again.";
  if (error?.status === 400) return error.message || "Please enter a valid question.";
  if (error?.status === 503) return "The portfolio assistant is temporarily unavailable. Please try again later.";
  return error?.message || "The portfolio assistant is temporarily unavailable. Please try again later.";
}

function MessageBubble({ message }) {
  return (
    <div className={`ai-message ${message.role}`}>
      <FormattedMessage content={message.content} />
    </div>
  );
}

function FormattedMessage({ content }) {
  const normalized = normalizeMessage(content);
  const blocks = normalized.split(/\n{2,}/).filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.split("\n").filter(Boolean);
    const isList = lines.every((line) => /^(\d+\.\s+|[-*]\s+)/.test(line));
    if (isList) {
      const ordered = lines.every((line) => /^\d+\.\s+/.test(line));
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag key={index}>
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.replace(/^(\d+\.\s+|[-*]\s+)/, ""))}</li>
          ))}
        </Tag>
      );
    }
    if (lines.length > 1) {
      return (
        <div className="ai-lines" key={index}>
          {lines.map((line, lineIndex) => <p key={lineIndex}>{renderInline(line)}</p>)}
        </div>
      );
    }
    return <p key={index}>{renderInline(block)}</p>;
  });
}

function normalizeMessage(content = "") {
  return content
    .replace(/\s+(\d+\.\s+\*\*)/g, "\n\n$1")
    .replace(/\s+-\s+\*\*/g, "\n- **")
    .replace(/\s+(\*\*GitHub:\*\*)/g, "\n$1")
    .replace(/\s+(\*\*Live Demo:\*\*)/g, "\n$1")
    .replace(/\s+(https?:\/\/)/g, "\n$1")
    .trim();
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/\S+)/g).filter(Boolean);
  return parts.map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if (/^https?:\/\//.test(part)) return <a key={index} href={part} target="_blank" rel="noreferrer">{part}</a>;
    return part;
  });
}
