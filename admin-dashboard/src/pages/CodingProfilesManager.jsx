import { useEffect, useMemo, useState } from "react";
import { FaPen, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { api } from "../services/api";
import { PageHeading } from "./Dashboard";

const platforms = ["GitHub", "LeetCode", "HackerRank", "CodeChef", "Codeforces", "GeeksforGeeks", "AtCoder", "TopCoder"];

const emptyProfile = {
  id: "",
  title: "GitHub",
  handle: "",
  url: "",
  stats: "Repositories: 0\nProblems Solved: 0",
  badges: "",
  achievements: "",
  skillMapping: "",
  isVisible: true,
  order: 0,
};

export default function CodingProfilesManager() {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(emptyProfile);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = () => api("/coding-profiles/admin").then(setProfiles).catch((requestError) => setError(requestError.message));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) => JSON.stringify(profile).toLowerCase().includes(query));
  }, [profiles, search]);

  const edit = (profile) => {
    setForm({
      id: profile.id,
      title: profile.title || profile.name || "GitHub",
      handle: profile.handle || "",
      url: profile.url || "",
      stats: statsToText(profile.stats),
      badges: (profile.badges || []).join(", "),
      achievements: (profile.achievements || []).join("\n"),
      skillMapping: (profile.skillMapping || []).join(", "),
      isVisible: profile.isVisible !== false,
      order: profile.order || 0,
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const body = {
      title: form.title,
      name: form.title,
      handle: form.handle,
      url: form.url,
      order: Number(form.order),
      isVisible: form.isVisible,
      stats: textToStats(form.stats),
      badges: toList(form.badges),
      achievements: toLines(form.achievements),
      skillMapping: toList(form.skillMapping),
    };
    try {
      await api(form.id ? `/coding-profiles/${form.id}` : "/coding-profiles", {
        method: form.id ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setOpen(false);
      setForm(emptyProfile);
      setError("");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (profile) => {
    if (!window.confirm(`Delete "${profile.title}"?`)) return;
    try {
      await api(`/coding-profiles/${profile.id}`, { method: "DELETE" });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Competitive profiles" title="Coding Profiles" description="Manage profile links, visible stats, badges, achievement cards, and skill mapping." actions={
        <button className="primary-action" onClick={() => { setForm(emptyProfile); setOpen(true); }}><FaPlus /> Add Profile</button>
      } />
      {error && <div className="admin-error">{error}</div>}
      <section className="admin-panel">
        <div className="table-toolbar">
          <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search profiles" /></label>
          <span>{filtered.length} profile{filtered.length === 1 ? "" : "s"}</span>
        </div>
        <div className="data-table profile-admin-table">
          <div className="table-row table-head"><span>Platform</span><span>Handle</span><span>Status</span><span>Actions</span></div>
          {filtered.length ? filtered.map((profile) => (
            <div className="table-row" key={profile.id}>
              <strong>{profile.title || profile.name}</strong>
              <span>{profile.handle}</span>
              <span className={profile.isVisible ? "status-live" : "status-hidden"}>{profile.isVisible ? "Live" : "Hidden"}</span>
              <span className="row-actions"><button onClick={() => edit(profile)} title="Edit"><FaPen /></button><button onClick={() => remove(profile)} title="Delete"><FaTrash /></button></span>
            </div>
          )) : <p className="empty-state">No coding profiles found.</p>}
        </div>
      </section>
      {open && <ProfileEditor form={form} setForm={setForm} save={save} close={() => setOpen(false)} />}
    </div>
  );
}

function ProfileEditor({ form, setForm, save, close }) {
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <form className="admin-modal" onSubmit={save}>
        <header><div><span>{form.id ? "Edit profile" : "New profile"}</span><h2>{form.title}</h2></div><button type="button" onClick={close}><FaXmark /></button></header>
        <div className="form-grid two-columns">
          <label>Platform<select value={form.title} onChange={(event) => update("title", event.target.value)}>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
          <label>Handle<input value={form.handle} onChange={(event) => update("handle", event.target.value)} placeholder="@username" /></label>
          <label className="full-field">Profile URL<input value={form.url} onChange={(event) => update("url", event.target.value)} /></label>
          <label className="full-field">Stats<textarea rows={5} value={form.stats} onChange={(event) => update("stats", event.target.value)} placeholder="Problems Solved: 120" /></label>
          <label>Badges<input value={form.badges} onChange={(event) => update("badges", event.target.value)} placeholder="DSA, Java, React" /></label>
          <label>Skill Mapping<input value={form.skillMapping} onChange={(event) => update("skillMapping", event.target.value)} placeholder="DSA, Problem Solving" /></label>
          <label className="full-field">Achievements<textarea rows={5} value={form.achievements} onChange={(event) => update("achievements", event.target.value)} placeholder="Built 10+ repositories" /></label>
        </div>
        <div className="toggle-row">
          <label className="toggle"><input type="checkbox" checked={form.isVisible} onChange={(event) => update("isVisible", event.target.checked)} /><span /> Visible</label>
          <label>Order<input type="number" value={form.order} onChange={(event) => update("order", event.target.value)} /></label>
        </div>
        <footer><button type="button" onClick={close}>Cancel</button><button className="primary-action" type="submit">Save Profile</button></footer>
      </form>
    </div>
  );
}

function toList(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function toLines(value = "") {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function textToStats(value = "") {
  return Object.fromEntries(toLines(value).map((line) => {
    const [key, ...rest] = line.split(":");
    return [key.trim(), rest.join(":").trim()];
  }).filter(([key]) => key));
}

function statsToText(stats = {}) {
  return Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join("\n");
}
