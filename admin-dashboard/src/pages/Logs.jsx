import { useEffect, useState } from "react";
import { api } from "../services/api";
import { PageHeading, label } from "./Dashboard";

const tabs = ["api", "errors", "admin", "ai"];

export default function Logs() {
  const [active, setActive] = useState("api");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api(`/logs/${active}`).then(setLogs).catch((requestError) => setError(requestError.message));
  }, [active]);

  return (
    <div className="admin-page">
      <PageHeading eyebrow="System visibility" title="Logs" description="Review API requests, errors, content changes, and AI conversations." />
      <div className="admin-tabs">{tabs.map((tab) => <button className={active === tab ? "active" : ""} key={tab} onClick={() => setActive(tab)}>{label(tab)}</button>)}</div>
      {error && <div className="admin-error">{error}</div>}
      <section className="admin-panel log-list">
        {logs.length ? logs.map((entry, index) => (
          <article key={entry._id || index}>
            <div><strong>{entry.action || entry.method || entry.question || entry.level || label(active)}</strong><small>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}</small></div>
            <pre>{JSON.stringify(entry, null, 2)}</pre>
          </article>
        )) : <p className="empty-state">No {active} logs yet.</p>}
      </section>
    </div>
  );
}
