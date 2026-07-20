import { useEffect, useMemo, useState } from "react";
import { FaBoxArchive, FaEnvelopeOpen, FaReply, FaTrash } from "react-icons/fa6";
import { api } from "../services/api";
import { PageHeading } from "./Dashboard";

const statuses = ["", "unread", "read", "replied", "archived"];

export default function ContactInbox() {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = () => api(`/contact-messages?status=${status}&search=${encodeURIComponent(search)}`).then(setMessages).catch((requestError) => setError(requestError.message));
  useEffect(() => { load(); }, [status]);

  const counts = useMemo(() => ({
    unread: messages.filter((message) => message.status === "unread").length,
    read: messages.filter((message) => message.status === "read").length,
    replied: messages.filter((message) => message.status === "replied").length,
    archived: messages.filter((message) => message.status === "archived").length,
  }), [messages]);

  const updateStatus = async (message, nextStatus) => {
    try {
      await api(`/contact-messages/${message.id}`, { method: "PUT", body: JSON.stringify({ status: nextStatus }) });
      await load();
      setActive((current) => current?.id === message.id ? { ...current, status: nextStatus } : current);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (message) => {
    if (!window.confirm(`Delete message from ${message.name}?`)) return;
    try {
      await api(`/contact-messages/${message.id}`, { method: "DELETE" });
      setActive(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Contact" title="Contact Inbox" description="Read, track, archive, and manage messages submitted from the portfolio contact form." />
      {error && <div className="admin-error">{error}</div>}
      <div className="metric-grid">
        {Object.entries(counts).map(([key, value]) => <article className="metric-card" key={key}><span>{key}</span><strong>{value}</strong></article>)}
      </div>
      <section className="admin-panel">
        <div className="table-toolbar">
          <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} placeholder="Search messages" /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item || "all"}</option>)}</select></label>
          <button type="button" className="primary-action" onClick={load}>Filter</button>
        </div>
        <div className="inbox-layout">
          <div className="message-list">
            {messages.length ? messages.map((message) => (
              <button className={active?.id === message.id ? "active" : ""} key={message.id} onClick={() => { setActive(message); if (message.status === "unread") updateStatus(message, "read"); }}>
                <strong>{message.subject}</strong>
                <span>{message.name} • {message.email}</span>
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </button>
            )) : <p className="empty-state">No messages found.</p>}
          </div>
          <div className="message-detail">
            {active ? (
              <>
                <div className="panel-heading"><div><span>{active.status}</span><h2>{active.subject}</h2></div></div>
                <p><strong>{active.name}</strong> • {active.email}</p>
                <p className="message-body">{active.message}</p>
                <p><small>Local time: {active.localTime || "Not provided"}</small></p>
                <div className="row-actions inbox-actions">
                  <button onClick={() => updateStatus(active, "read")} title="Mark read"><FaEnvelopeOpen /></button>
                  <button onClick={() => updateStatus(active, "replied")} title="Mark replied"><FaReply /></button>
                  <button onClick={() => updateStatus(active, "archived")} title="Archive"><FaBoxArchive /></button>
                  <button onClick={() => remove(active)} title="Delete"><FaTrash /></button>
                </div>
              </>
            ) : <p className="empty-state">Select a message to read it.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
